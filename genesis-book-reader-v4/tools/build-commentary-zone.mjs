#!/usr/bin/env node
// Synthesis lane · zone-commentary-rule-v2-sealed-chain-section-aligned
//
// The commentary that shipped with Genesis came from outside the corpus. It
// was fetched, not served: no C0 identity, no chain receipts, no route the
// corpus lane could check. This builder takes the other road. A commentary is
// a work in the sealed chain like any other, served id-by-id by the same
// resident reader, verified against the same identity bridge, and attached to
// the base text by the coordinates both works already carry in their sealed
// unit ids. Nothing is acquired. Nothing is inferred.
//
// The attachment rule, declared before output:
//   1. Both works are read from their own serve output. A commentary unit is
//      never invented for a base unit that has none.
//   2. Attachment is by coordinate identity of the two sealed unit ids:
//      i-kings-7-14 receives targum-jonathan-on-i-kings-7-14. The chapter and
//      section numbers are the chain's own; this builder renumbers nothing.
//   3. The alignment must be total in both directions. A base section with no
//      commentary unit is fine and simply carries none; a commentary unit
//      with no base section is a refusal, because it would mean the two works
//      disagree about the shape of the book and the page would be hiding it.
//   4. The commentary ships as words, not as a paragraph: exact surfaces and
//      exact K, so its own text is tappable and answers from the same catalog.
//      A commentary a reader cannot interrogate is decoration.
//   5. Licence is the only gate. Each attached work carries its own posture
//      computed from its own rows; nothing inherits the base text's licence
//      and nothing inherits at work level.
//
// Usage:
//   node tools/build-commentary-zone.mjs \
//     --base-serve i-kings.ndjson --base-work tanakh/i-kings \
//     --serve targum.ndjson --work targum/targum-jonathan-on-i-kings \
//     --title "Targum Jonathan on I Kings" --family "Targum Jonathan" \
//     --bridge bridge.csv.gz --store data/route-store \
//     --stamp 2026-08-15 --out data/zones/1kings-commentary.bin

import { writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { openRouteStore, GLOSS_RULE_ID, GLOSS_RULE_TEXT } from "./gloss-store-v1.mjs";
import { K_RULE_ID, K_RULE_TEXT } from "./k-normalization-v1.mjs";
import { readSpanSlice, cellsOf, SPAN_RULE_ID } from "./span-slice-v1.mjs";
import { readServe, readBridge, parseCoordinates, wordsOf, regionsOf, licensePosture, require_ } from "./zone-lib-v1.mjs";

const arg = (flag, fallback = null) => {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : fallback;
};
const baseServePath = arg("--base-serve");
const baseWorkId = arg("--base-work");
const servePath = arg("--serve");
const workId = arg("--work");
const title = arg("--title");
const family = arg("--family", title);
const bridgePath = arg("--bridge");
const storeDir = arg("--store", "data/route-store");
const stamp = arg("--stamp");
const outPath = arg("--out");
const spansPath = arg("--spans");
// The book id this work is published under, when it is published as one. A
// commentary read eleven words at a time through a card is a quotation of a
// work, not the work; where the same text is a zone of its own, the card says
// so and hands the reader over at the same coordinate.
const publishedAs = arg("--published-as");
for (const [flag, v] of [["--base-serve", baseServePath], ["--base-work", baseWorkId], ["--serve", servePath], ["--work", workId], ["--title", title], ["--bridge", bridgePath], ["--stamp", stamp], ["--out", outPath]])
  require_(v, "MISSING_ARG", flag);

const baseSlug = baseWorkId.split("/").pop();
const slug = workId.split("/").pop();
const store = openRouteStore(storeDir);

// ---- both works, read and verified the same way --------------------------
const base = await readServe(baseServePath);
const comm = await readServe(servePath);
const bridge = readBridge(bridgePath, workId);

const unserved = [...bridge.units.keys()].filter((u) => !comm.units.has(u));
require_(unserved.length === 0, "BRIDGE_UNIT_NOT_SERVED", `${unserved.length}, first ${unserved[0]}`);
const notInBridge = [...comm.units.keys()].filter((u) => !bridge.units.has(u));
require_(notInBridge.length === 0, "UNIT_NOT_IN_BRIDGE", `${notInBridge.length}, first ${notInBridge[0]}`);

// ---- rule 2: attachment by sealed coordinate identity --------------------
const baseAt = new Map();
for (const u of base.units.keys()) baseAt.set(parseCoordinates(u, baseSlug).label, u);
const commAt = new Map();
for (const u of comm.units.keys()) commAt.set(parseCoordinates(u, slug).label, u);

// rule 3: total in both directions
const orphanCommentary = [...commAt.keys()].filter((c) => !baseAt.has(c));
require_(
  orphanCommentary.length === 0,
  "COMMENTARY_UNIT_WITHOUT_BASE_SECTION",
  `${orphanCommentary.length} commentary units have no base section (first ${orphanCommentary[0]}) — the two works disagree about the shape of the book`,
);
const baseWithout = [...baseAt.keys()].filter((c) => !commAt.has(c));

// ---- rule 4: words, not a paragraph --------------------------------------
const units = {};
const keysNeeded = new Set();
let attached = 0, words = 0;
for (const [coord, commUnit] of commAt) {
  const rows = comm.units.get(commUnit).rows;
  const w = wordsOf(rows);
  w.forEach((x) => regionsOf(x).forEach((g) => keysNeeded.add(g.k)));
  words += w.length;
  attached += 1;
  units[baseAt.get(coord)] = {
    section: [{
      work: 0,
      unit: commUnit,
      ref: `${title} ${coord}`,
      label: `${family} · ${coord}`,
      words: w,
      text: w.map((x) => x.s).join(" "),
      state: "PROVEN_EDGE",
      basis: "SEALED_UNIT_COORDINATE_IDENTITY",
    }],
  };
}

// The catalog answers per cell surface, so a commentary's own words offer the
// same component system as the base text: same span slice, same cells, same
// covers. A commentary a reader cannot cut is decoration in a second way.
const span = spansPath ? await readSpanSlice(spansPath, keysNeeded) : null;
const cellSurfaces = new Set(keysNeeded);
if (span) for (const [, sp] of span.spans) for (const c of cellsOf(sp.s)) cellSurfaces.add(c.surface);
const { table: gloss, counts: glossCounts, sha256: glossSha } = store.tableFor([...cellSurfaces]);
const spanRoles = [], spanRules = [], spanConf = [];
const intern = (arr, v) => { let i = arr.indexOf(v); if (i < 0) { i = arr.length; arr.push(v); } return i; };
const spans = {};
if (span) for (const [k, sp] of span.spans)
  spans[k] = [sp.s, sp.r.map((r) => intern(spanRoles, r)), intern(spanRules, sp.rule), intern(spanConf, sp.conf)];
let glossedWords = 0, regionCount = 0, splitWords = 0;
for (const u of Object.values(units)) for (const e of u.section) for (const w of e.words) {
  const regions = regionsOf(w);
  regionCount += regions.length;
  if (w.w) splitWords += 1;
  if (regions.some((g) => gloss[g.k])) glossedWords += 1;
}

// ---- rule 5: this work's own licence, computed from its own rows ---------
const postures = licensePosture(comm.units);
require_(postures.length === 1, "MIXED_LICENSE_POSTURE", postures.map((p) => p.posture).join(" || "));
const row0 = comm.units.values().next().value.rows[0];

const sidecar = {
  schema_version: "ZONE_COMMENTARY_V2",
  rule_id: "zone-commentary-rule-v2-sealed-chain-section-aligned",
  work: baseWorkId,
  works: [{
    id: workId,
    title,
    family_en: family,
    b_n: `${bridge.b_id} / ${bridge.n_id}`,
    grain: "SECTION",
    zone: publishedAs || undefined,
    license: row0.rights_authority.normalized_license_class === "PUBLIC_DOMAIN" ? "Public Domain" : row0.rights_authority.normalized_license_class,
    license_class: row0.rights_authority.normalized_license_class,
    license_id: row0.rights_authority.source_row.normalized_license_id,
    reader_display: row0.reader_display_axis,
    attribution_required: row0.attribution_required,
    raw_provider_assertions: row0.rights_authority.source_row.raw_provider_assertions,
  }],
  emitted_from: {
    walk: { ...comm.provenance, ids_walked: comm.rows, found_exact: comm.rows - comm.held },
    identity_oracle: {
      bridge: bridgePath.split("/").pop(),
      bridge_sha256: bridge.sha256,
      sealed_units: bridge.units.size,
      first_c0_numeric_id: comm.first,
      last_c0_numeric_id: comm.last,
    },
    alignment: {
      rule: "SEALED_UNIT_COORDINATE_IDENTITY",
      basis:
        `both works are units of the sealed chain; ${baseSlug}-<chapter>-<section> receives ${slug}-<chapter>-<section>. ` +
        `Coordinates are read from the sealed unit ids and nothing is renumbered, folded, or inferred.`,
      base_sections: baseAt.size,
      commentary_units: commAt.size,
      attached,
      base_sections_without_commentary: baseWithout.length,
      commentary_units_without_base_section: 0,
      totality: `${attached}/${baseAt.size} base sections carry this commentary; every commentary unit found its section`,
    },
    license_receipts: {
      per_occurrence: postures.map((p) => `${p.rows.toLocaleString()} rows: ${p.posture}`).join(" | ") + ` — computed over the full serve output on ${stamp}`,
      inheritance: "none — this work's posture is computed from this work's own rows; no work-level or title-level inheritance",
    },
    gloss_layer: {
      key_rule: `${K_RULE_ID}: ${K_RULE_TEXT}`,
      rule: `${GLOSS_RULE_ID}: ${GLOSS_RULE_TEXT}`,
      gloss_table_sha256: glossSha,
      distinct_forms_glossed: glossCounts.glossed,
      distinct_forms_bare: glossCounts.no_exact_route + glossCounts.no_displayable_route,
      grain: span ? "cell surface" : "whole form",
      note: "the commentary answers from the same exact-form catalog as the base text; an Aramaic form the Hebrew catalog never carries renders bare, which is the honest answer rather than a folded match",
    },
    // The component layer arrived and the file never said where from. A zone
    // carrying spans with no record of the sealed file they came from cannot
    // be reproduced or audited by anyone downstream, which is the whole reason
    // span-slice records a path and a sha in the first place.
    span_layer: span
      ? {
          rule: SPAN_RULE_ID,
          source: span.source,
          rows_scanned: span.scanned,
          forms_with_a_component_system: span.spans.size,
        }
      : { status: "no span slice supplied — this zone offers whole forms only" },
    build: { builder: "tools/build-commentary-zone.mjs", single_pass: true, emitted: stamp },
  },
  counts: {
    attached_sections: attached,
    base_sections: baseAt.size,
    base_sections_without_commentary: baseWithout.length,
    words,
    glossed_words: glossedWords,
    w_regions: regionCount,
    occurrences_holding_more_than_one_w: splitWords,
    held: comm.held,
  },
  span_roles: spanRoles,
  span_rules: spanRules,
  span_conf: spanConf,
  spans,
  gloss,
  units,
};

const body = gzipSync(Buffer.from(JSON.stringify(sidecar)), { level: 9 });
writeFileSync(outPath, body);
console.log(
  `${outPath}: ${attached.toLocaleString()}/${baseAt.size.toLocaleString()} base sections carry ${family} · ` +
  `${words.toLocaleString()} commentary words, ${glossedWords.toLocaleString()} glossed over ${glossCounts.glossed.toLocaleString()} distinct forms · ` +
  `${postures[0].posture.split(" · ")[0]} · ${(body.length / 1024).toFixed(1)} KB gz · sha256 ${createHash("sha256").update(body).digest("hex").slice(0, 16)}…`,
);
