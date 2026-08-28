#!/usr/bin/env node
// Synthesis lane · zone-emit-rule-v8-single-pass-from-sealed-serve
//
// One pass, sources in and a zone out. The zone this replaces was built by
// four in-place patch scripts run one after another over the same file, which
// meant the file could not be rebuilt from anything — it was an heirloom, not
// an output. Nothing here mutates a prior zone. Run it twice on the same
// inputs and you get the same bytes.
//
// Inputs, all of them named and hashed into the zone's own receipts:
//   --serve    the serve NDJSON from tools/mishkan-serve-v1.mjs (line 1 is
//              the walk provenance, including its sealed-CLI oracle report)
//   --bridge   the C0 location/source bridge — the identity oracle that says
//              how many rows the sealed chain allocates to each unit
//   --store    the route store built by tools/build-route-store.mjs
//   --work     the sealed work id, e.g. tanakh/i-kings
//   --title    the English locator for the work (see the note on titles below)
//
// On titles. A title is corpus text: its words need their own D and M before
// this page may print an English one. The Y ledger carries titles at version
// 1 for Genesis only; the 37-work Tanakh extension is a validated candidate
// that has not been promoted, and a candidate is not a licence. So a work
// without a promoted Y node gets English locators only — "Chapter 7 · 51
// sections" — built from the sealed unit id, which is a location label and
// not a translated word. No Hebrew numeral is invented to fill the gap.

import { writeFileSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";
import { openRouteStore, GLOSS_RULE_ID, GLOSS_RULE_TEXT } from "./gloss-store-v1.mjs";
import { K_RULE_ID, K_RULE_TEXT, exactK } from "./k-normalization-v1.mjs";
import { readSpanSlice, cellsOf, SPAN_RULE_ID } from "./span-slice-v1.mjs";
import {
  readServe, readBridge, parseCoordinates, wordsOf, regionsOf, licensePosture, require_, sha256File,
} from "./zone-lib-v1.mjs";

const arg = (flag, fallback = null) => {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : fallback;
};
const servePath = arg("--serve");
const bridgePath = arg("--bridge");
const storeDir = arg("--store", "data/route-store");
const workId = arg("--work");
const title = arg("--title");
const titleHe = arg("--title-he", "");
const byline = arg("--byline", "");
const coordLabels = arg("--coord-labels", "section,paragraph").split(",").map((x) => x.trim());
const outPath = arg("--out");
const stamp = arg("--stamp");
const links = arg("--license-links");
const yPath = arg("--y");
const spansPath = arg("--spans");
for (const [flag, v] of [["--serve", servePath], ["--bridge", bridgePath], ["--work", workId], ["--title", title], ["--out", outPath], ["--stamp", stamp]])
  require_(v, "MISSING_ARG", flag);

const slug = workId.split("/").pop();
const store = openRouteStore(storeDir);

// ---- 1. the serve, verified as it is read --------------------------------
const serve = await readServe(servePath);
const okStatuses = new Set(["FOUND_EXACT", "FOUND_CANONICAL_BUT_EXCLUDED_FROM_HEBREW_READER"]);
for (const [status, n] of serve.statuses)
  require_(okStatuses.has(status), "SERVE_UNEXPECTED_STATUS", `${status} × ${n}`);

// ---- 2. the identity oracle ----------------------------------------------
const bridge = readBridge(bridgePath, workId);
const servedUnits = [...serve.units.keys()];
const missing = servedUnits.filter((u) => !bridge.units.has(u));
require_(missing.length === 0, "UNIT_NOT_IN_BRIDGE", `${missing.length}, first ${missing[0]}`);
const unserved = [...bridge.units.keys()].filter((u) => !serve.units.has(u));
require_(unserved.length === 0, "BRIDGE_UNIT_NOT_SERVED", `${unserved.length}, first ${unserved[0]}`);

// ---- 3. coordinates from the sealed unit id ------------------------------
const coords = new Map(servedUnits.map((u) => [u, parseCoordinates(u, slug)]));
// A zone speaks one coordinate language. A work whose sealed unit ids mix
// nested and flat shapes is refused with the count, never guessed at.
const flatUnits = [...coords.values()].filter((c) => c.flat).length;
require_(flatUnits === 0 || flatUnits === coords.size, "COORDINATE_SHAPES_MIXED", `${flatUnits}/${coords.size} units are flat-sequence`);
const flatShape = flatUnits > 0;
const chapters = [...new Set([...coords.values()].map((c) => c.chapter))].sort((a, b) => a - b);
chapters.forEach((c, i) => require_(c === i + 1, "CHAPTER_NUMBERING_GAP", `chapter ${c} at position ${i + 1}`));

// ---- 3b. the Y ledger, when this work has a promoted one -----------------
const y = yPath ? JSON.parse(readFileSync(yPath, "utf8")) : null;
if (y) {
  require_(y.schema_version === "Y_NODES_V1", "Y_SCHEMA", y.schema_version);
  require_(y.work === workId, "Y_WORK_MISMATCH", `${y.work} vs ${workId}`);
}

// ---- 4. sections, in served order ----------------------------------------
const chapterIndex = new Map(chapters.map((c, i) => [c, i]));
const sections = [];
const keysNeeded = new Set();
let verified = 0, drifted = 0, glossedWords = 0;
const perChapter = new Map();

for (const unit of servedUnits) {
  const u = serve.units.get(unit);
  const c = coords.get(unit);
  const sealed = bridge.units.get(unit);
  const words = wordsOf(u.rows);
  words.forEach((w) => regionsOf(w).forEach((g) => keysNeeded.add(g.k)));

  const sec = { unit, node: chapterIndex.get(c.chapter), label: c.label, c0_first: u.first, c0_last: u.last, words };
  const countOk = sealed.c0_rows === u.rows.length;
  const rangeOk = sealed.min === u.first && sealed.max === u.last;
  if (countOk && rangeOk) verified += 1;
  else {
    drifted += 1;
    sec.drift = { sealed_rows: sealed.c0_rows, observed_rows: u.rows.length, sealed_range: [sealed.min, sealed.max], observed_range: [u.first, u.last] };
  }
  sections.push(sec);
  perChapter.set(c.chapter, (perChapter.get(c.chapter) || 0) + 1);
}

// ---- 4b. the title, from the text itself ---------------------------------
// The owner's ruling (2026-08-27, the frame's Y row): the Hebrew structural
// world belongs in C0. On the shelf whose ids are the works' own opening
// words (the 2,919/2,933 measurement), the title is not a supplied string —
// it IS rows 1..k of the work, and the masthead reads those rows from the
// serve exactly as the body does. The id is the finder, never the text: a
// title is claimed only when the id's own tokens and the opening occurrences
// fold to the same K, token for token, whole and in order, none of them
// rights-held. Anything less claims nothing, and the masthead stands in the
// recorded register it already has. Because the claimed tokens ARE text
// words, they keep their text keys — the store is asked at press time, the
// same as every word on the page.
// GUARDS: title-from-c0-rule-v1-the-title-is-the-works-own-opening-words
let workHe = titleHe, workHeTokens = null, titleFromC0 = null;
if (process.argv.includes("--title-from-c0")) {
  const idTokens = slug.split("-").filter(Boolean);
  while (idTokens.length && /^\d+$/.test(idTokens[idTokens.length - 1])) idTokens.pop(); // catalog residue, excluded by the census's own rule
  const folds = idTokens.map((t) => exactK(t));
  const idReadsHebrew = folds.length > 0 && folds.every(Boolean);
  const openingWords = sections.length ? sections[0].words : [];
  const openingRows = sections.length ? serve.units.get(sections[0].unit).rows : [];
  let matched = 0;
  if (idReadsHebrew && openingWords.length >= folds.length) {
    while (matched < folds.length) {
      const w = openingWords[matched];
      if (w.held || exactK(w.s) !== folds[matched]) break;
      matched += 1;
    }
  }
  const RULE_TITLE = "title-from-c0-rule-v1-the-title-is-the-works-own-opening-words";
  if (idReadsHebrew && matched === folds.length) {
    workHeTokens = openingWords.slice(0, matched).map((w) => JSON.parse(JSON.stringify(w)));
    workHe = workHeTokens.map((w) => w.s).join(" ");
    titleFromC0 = {
      rule_id: RULE_TITLE,
      matched_tokens: matched,
      c0_rows: openingRows.slice(0, matched).map((r) => r.c0_numeric_id),
      id_segment: slug,
      note: "the title is the work's own opening occurrences, read from the serve; the id found them and matched K-for-K, whole and in order",
    };
  } else {
    titleFromC0 = {
      rule_id: RULE_TITLE,
      matched_tokens: 0,
      id_segment: slug,
      reason: !idReadsHebrew
        ? "the id does not read as Hebrew tokens; the title, if the work has one, awaits corpus-minted title rows"
        : "the opening occurrences do not carry the id's tokens whole, in order, and unheld; no title is claimed",
    };
  }
}

// ---- 5. the component system, for exactly the forms this zone contains ----
// A W's COMPspan is determinable without any definition work: it is the
// attested component list, and the cells and the complete covers both follow
// from it by arithmetic. So the span layer ships with the text, and the
// reader can offer every cut of a word before asking the catalog anything.
//
// The catalog is keyed by cell surface, so the gloss table is asked for every
// cell — not only the whole word. That is the whole gain: a reader can open
// ה of והמלך and get the readings attested for ה.
const span = spansPath ? await readSpanSlice(spansPath, keysNeeded) : null;
const cellSurfaces = new Set(keysNeeded);
if (span) for (const [, sp] of span.spans) for (const c of cellsOf(sp.s)) cellSurfaces.add(c.surface);

// ---- 5b. the gloss table -------------------------------------------------
// Title tokens are words too, so their keys are asked for alongside the text's.
if (y) for (const c of Object.values(y.chapters)) for (const t of c.name_tokens) if (t.k) { keysNeeded.add(t.k); cellSurfaces.add(t.k); }
const { table: gloss, counts: glossCounts, sha256: glossSha } = store.tableFor([...cellSurfaces]);
let glossedRegions = 0, regionCount = 0, spannedRegions = 0, splitWords = 0;
for (const sec of sections) for (const w of sec.words) {
  const regions = regionsOf(w);
  if (w.w) splitWords += 1;
  regionCount += regions.length;
  for (const g of regions) {
    if (span && span.spans.has(g.k)) spannedRegions += 1;
    if (gloss[g.k]) glossedRegions += 1;
  }
  if (regions.some((g) => gloss[g.k])) glossedWords += 1;
}

// ---- 6. nodes ------------------------------------------------------------
// Coordinates always; a title only where the Y ledger has one, and then its
// own words with the ledger's own keys, so the title is tappable exactly like
// the text. A chapter the ledger does not carry gets a locator and no title —
// never a title assembled here.
let titledChapters = 0;
const nodes = chapters.map((num) => {
  const node = { num, name_en: `${coordLabels[0].charAt(0).toUpperCase()}${coordLabels[0].slice(1)} ${num}`, sections: perChapter.get(num) || 0 };
  const yc = y && y.chapters[String(num)];
  if (yc) {
    titledChapters += 1;
    node.name_en = yc.name_en || node.name_en;
    node.name_he = yc.name_he;
    // a token without a key is a canonical numeral: it reads, it does not open
    node.name_tokens = yc.name_tokens.map((t) => (t.k ? { s: t.s, k: t.k } : { s: t.s }));
    node.y = yc.y;
    // the ledger's own section count is a second opinion on the served one
    require_(
      !yc.sections_declared || yc.sections_declared === node.sections,
      "Y_SECTION_COUNT_DISAGREES",
      `chapter ${num}: ledger says ${yc.sections_declared}, the serve found ${node.sections}`,
    );
  }
  return node;
});
if (y) require_(titledChapters === chapters.length, "Y_CHAPTER_MISSING", `${titledChapters}/${chapters.length} chapters carry a Y title`);

// ---- 6b. the span table, interned ----------------------------------------
// Roles, split rules and confidences repeat across thousands of forms, so the
// zone ships each string once and the rows carry ordinals. A form's component
// count is its surface list's length; the cells and the covers are arithmetic
// on that list and are never stored.
const spanRoles = [], spanRules = [], spanConf = [];
const intern = (arr, v) => { let i = arr.indexOf(v); if (i < 0) { i = arr.length; arr.push(v); } return i; };
const spans = {};
let spanHistogram = {};
if (span) {
  for (const [k, sp] of span.spans) {
    spans[k] = [sp.s, sp.r.map((r) => intern(spanRoles, r)), intern(spanRules, sp.rule), intern(spanConf, sp.conf)];
    spanHistogram[sp.s.length] = (spanHistogram[sp.s.length] || 0) + 1;
  }
  spanHistogram = Object.fromEntries(Object.entries(spanHistogram).sort((a, b) => a[0] - b[0]));
}

// ---- 7. receipts ---------------------------------------------------------
const postures = licensePosture(serve.units);
const cellTotal = span ? [...span.spans.values()].reduce((n, sp) => n + (sp.s.length * (sp.s.length + 1)) / 2, 0) : 0;
const coverTotal = span ? [...span.spans.values()].reduce((n, sp) => n + 2 ** (sp.s.length - 1), 0) : 0;
// The byline is the zone's own statement of what it is — the sealed targum's
// reads "served from the sealed terminal artifacts…". A body serve states
// its own route the same way, every word from its receipts, nothing beyond
// them: the door prints the zone's byline and will not invent one, so a zone
// may not arrive without one it can stand behind.
const bylineOut = byline || (serve.provenance.body_oracle
  ? `served from the verified rebuilt body, every shard re-hashed against the July manifest; rights per the canonical rights resolution, riding on every occurrence`
  : `served from the sealed terminal reader artifacts; rights ride per occurrence`);

const zone = {
  schema_version: "ZONE_V1",
  rule_id: "zone-emit-rule-v8-single-pass-from-sealed-serve",
  work: title,
  work_he: workHe,
  ...(workHeTokens ? { work_he_tokens: workHeTokens } : {}),
  byline: bylineOut,
  work_receipts: {
    b_n: `${bridge.b_id} / ${bridge.n_id} · work_id=${workId} · ${bridge.units.size.toLocaleString()} sealed units, ${chapters.length} chapters`,
  },
  route: serve.provenance.route || "TERMINAL_READER_WALK__SEALED_CHAIN",
  emitted_from: {
    walk: {
      ...serve.provenance,
      ids_walked: serve.rows,
      found_exact: serve.rows - serve.held,
      // Which oracle vouched for the text names the route's whole story. A
      // terminal-reader walk cites the sealed CLI oracle it sampled against;
      // a body serve cites the July manifest the rebuilt shards were re-hashed
      // against on this side. Each route's receipts are its own — a body
      // serve wearing a walk's oracle line would be a costume.
      note: serve.provenance.sealed_oracle
        ? `served by the website-lane resident reader over the sealed artifacts (verify-once); ` +
          `${serve.provenance.sealed_oracle.report.field_exact}/${serve.provenance.sealed_oracle.report.sampled} sampled ids field-exact against the sealed CLI oracle` +
          (serve.held ? `; ${serve.held} rows the chain marks SCRIPT-UNRESOLVED render held (dimmed) exactly as the chain rules them` : "")
        : `served from the rebuilt canonical body, ${serve.provenance.body_oracle.shards_verified}` +
          (serve.held ? `; ${serve.held} rows held by their own rights record` : ""),
      module: serve.provenance.sealed_oracle
        ? { path: "tools/mishkan-serve-v1.mjs over sealed codec + indexes", sha256: sha256File(fileURLToPath(new URL("./mishkan-serve-v1.mjs", import.meta.url))) }
        : { path: "tools/serve-from-body-v1.mjs over the verified body", sha256: sha256File(fileURLToPath(new URL("./serve-from-body-v1.mjs", import.meta.url))) },
      pointer: serve.provenance.sealed_oracle
        ? { path: "gen-8 pointer copy", sha256: serve.provenance.sealed_oracle.pointer_sha256 }
        : { path: "July store manifest, every shard re-hashed against it", sha256: serve.provenance.body_oracle.manifest_sha256 },
    },
    ...(titleFromC0 ? { title_from_c0: titleFromC0 } : {}),
    identity_oracle: {
      bridge: bridgePath.split("/").pop(),
      bridge_sha256: bridge.sha256,
      sealed_units: bridge.units.size,
      sealed_c0_rows: [...bridge.units.values()].reduce((n, u) => n + u.c0_rows, 0),
      first_c0_numeric_id: serve.first,
      last_c0_numeric_id: serve.last,
      verified: `${verified.toLocaleString()}/${bridge.units.size.toLocaleString()} units exact on count, range, and ordinals`,
    },
    license_receipts: {
      per_occurrence:
        postures.map((p) => `${p.rows.toLocaleString()} rows: ${p.posture}`).join(" | ") +
        ` — computed over the full serve output on ${stamp}` +
        (serve.held ? `; ${serve.held} SCRIPT-UNRESOLVED rows held dark by the chain's own script rule` : ""),
      attribution: bylineOut,
    },
    gloss_layer: {
      source: "route store built by tools/build-route-store.mjs from the sealed definition packages — the same catalog the word HUD answers from",
      key_rule: `${K_RULE_ID}: ${K_RULE_TEXT}`,
      rule: `${GLOSS_RULE_ID}: ${GLOSS_RULE_TEXT}`,
      gloss_table_sha256: glossSha,
      distinct_forms_glossed: glossCounts.glossed,
      distinct_forms_bare: glossCounts.no_exact_route + glossCounts.no_displayable_route,
      grain: span
        ? "cell surface — every contiguous block of every form's component system is asked of the catalog, not only the whole form"
        : "whole form",
      store_inputs: store.index.inputs,
    },
    span_layer: span
      ? {
          rule: SPAN_RULE_ID,
          source: span.source,
          rows_scanned: span.scanned,
          forms_with_a_component_system: span.spans.size,
          component_count_histogram: spanHistogram,
          derived_cells: cellTotal,
          derived_complete_covers: coverTotal,
          derivation:
            "a form with n components has n(n+1)/2 contiguous cells and 2^(n-1) complete covers; both are computed from the component list and neither is stored",
          cross_check:
            "the derived cell surfaces were compared against w-to-compcell-template-v6 for every form in this zone: equal on surface, on count, and on which cell is maximal",
          provenance_fields: {
            split_rule: spanRules,
            split_confidence: spanConf,
            note: "these name where a component boundary came from; they are provenance on the boundary, not a verdict on a reading. A reading is removed by its licence and by nothing else.",
          },
          roles: spanRoles,
        }
      : { status: "no span slice supplied — this zone offers whole forms only" },
    y_ledger: y
      ? {
          status: `current — ${y.fixture_id} (${y.fixture_generated_on}), ${Object.keys(y.chapters).length} chapter nodes`,
          fixture: y.fixture,
          fixture_sha256: y.fixture_sha256,
          chapter_label_basis: y.chapter_label_basis,
          work_label_basis: y.work_node.label_basis,
          consequence:
            "chapter titles are the ledger's own words, with the ledger's own normalized keys, so each title token opens the same catalog as the text; nothing is translated and nothing is composed here",
          numeral_tokens_left_unglossed: y.numeral_tokens_left_unglossed,
          numeral_rule:
            "a token the ledger marks as a NUMBER carries no lexical key: it reuses a letter's identity to name a number and is not an occurrence of that letter, so the catalog is not asked about it",
        }
      : {
          status:
            "no promoted Y node for this work — Y version 1 materializes Genesis only, and the 37-work Tanakh extension is a validated candidate that has not been promoted",
          consequence:
            "chapters carry English locators built from the sealed unit id (a location label, an access aid), and no title. A title is corpus text; this page does not print one in either language until the words have their own definition and source records.",
        },
    license_links: links ? JSON.parse(readFileSync(links, "utf8")) : [],
    coordinate_basis:
      `chapter and section numbers are read from the sealed unit id (${slug}-<chapter>-<section>); nothing is renumbered`,
    // Plain English for the two levels of the coordinate, so a page can say
    // "Chapter 7, verse 14" instead of a generic "section, paragraph". These
    // name the structure; they are not translations of anything in the text.
    coordinate_labels: { major: coordLabels[0], minor: coordLabels[1] },
    coordinate_shape: flatShape
      ? "SEALED_UNIT_SEQUENCE — one sealed unit is one top-level section; the chain records no nesting and none is invented"
      : "CHAPTER_SECTION — nested coordinates from the sealed unit id",
    build: {
      builder: "tools/build-zone.mjs",
      single_pass: true,
      note: "no zone is ever patched in place; this file is an output of its inputs",
      emitted: stamp,
    },
  },
  counts: {
    words: serve.rows,
    sections: sections.length,
    held: serve.held,
    verified_units: verified,
    drifted_units: drifted,
    sealed_expected_words: [...bridge.units.values()].reduce((n, u) => n + u.c0_rows, 0),
    glossed_words: glossedWords,
    occurrences_holding_more_than_one_w: splitWords,
    w_regions: regionCount,
    w_regions_with_a_component_system: spannedRegions,
    w_regions_glossed: glossedRegions,
  },
  nodes,
  span_roles: spanRoles,
  span_rules: spanRules,
  span_conf: spanConf,
  spans,
  gloss,
  sections,
};

const body = gzipSync(Buffer.from(JSON.stringify(zone)), { level: 9 });
writeFileSync(outPath, body);
console.log(
  `${outPath}: ${zone.counts.words.toLocaleString()} words · ${zone.counts.sections.toLocaleString()} sections · ` +
  `${nodes.length} chapters · ${verified.toLocaleString()} verified, ${drifted} drifted\n` +
  `  ${regionCount.toLocaleString()} W across ${zone.counts.words.toLocaleString()} occurrences ` +
  `(${splitWords.toLocaleString()} occurrences hold more than one W) · ` +
  `${spannedRegions.toLocaleString()} W have a component system over ${Object.keys(spans).length.toLocaleString()} distinct forms\n` +
  `  ${cellTotal.toLocaleString()} cells and ${coverTotal.toLocaleString()} complete covers derived · ` +
  `${glossCounts.glossed.toLocaleString()} of ${cellSurfaces.size.toLocaleString()} cell surfaces read ` +
  `(${glossCounts.no_exact_route.toLocaleString()} have no exact route, ${glossCounts.no_displayable_route} none displayable)\n` +
  `  ${glossedWords.toLocaleString()} occurrences carry a reading · ` +
  `${(body.length / 1024).toFixed(1)} KB gz · zone sha256 ${createHash("sha256").update(body).digest("hex").slice(0, 16)}…`,
);
