#!/usr/bin/env node
// Synthesis lane · respan-rule-v1-project-the-compspan-template-over-a-zones-own-keys
//
// The component layer is a projection, exactly as the gloss layer is: the
// COMPspan template, asked about the keys one zone already contains. It does
// not depend on how the zone was acquired, so any zone can be given one
// without re-running the route it was built from.
//
// Why this has to exist.
//
// Genesis shipped with no component layer at all — `spans: 0`, against 3,424
// on I Kings and 3,239 on the Targum. Every Genesis word offered its whole
// form and nothing else: no prefix clitic, no stem, none of the contiguous
// blocks a reader can open on the neighbouring book. build.sh said why, in a
// comment: "Genesis is built without --spans on purpose. Adding the component
// layer to a published book changes what every word offers, so it is its own
// decision and not a side effect of running this script."
//
// That reasoning is sound and the outcome was still wrong, because the
// decision was deferred in a comment nobody reads and the page said nothing.
// The book the front door opens first offered less than the book beside it,
// and no reader could have known the layer existed. A deferral that leaves no
// mark is indistinguishable from an oversight — which is how this one was
// found, by a reader noticing Genesis had no options.
//
// Rules, declared before output:
//   1. Nothing is patched in place. This reads one zone and writes another.
//      Run it twice on the same inputs and you get the same bytes.
//   2. Only the span layer moves. Words, sections, nodes, receipts, licences
//      and the gloss layer are copied through untouched — this tool has no
//      opinion about any of them.
//   3. The keys asked for are the zone's own, byte-exact: every W of every
//      occurrence and every title token. No folding, no prefix match. The
//      template's own refusals stand — a key with two rows, or one whose
//      surfaces do not rejoin, is not taken.
//   4. Giving a zone a component layer changes what its gloss layer should
//      ask for, because with components the catalog is asked at cell surface
//      rather than whole form. This tool does not do that and must not: run
//      regloss-zone.mjs afterwards, which is the tool that owns the gloss
//      layer. The output records that it is owed one.
//
// Run:
//   node tools/respan-zone-v1.mjs --zone data/zones/genesis.bin \
//     --spans w-to-compspan-template-v6.csv.gz --stamp 2026-08-20 \
//     --out data/zones/genesis.bin

import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { gzipSync, gunzipSync } from "node:zlib";
import { readSpanSlice, cellsOf, SPAN_RULE_ID } from "./span-slice-v1.mjs";
import { require_ } from "./zone-lib-v1.mjs";

const arg = (f, d = null) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d; };
const inPath = arg("--zone");
const spansPath = arg("--spans");
const outPath = arg("--out");
const stamp = arg("--stamp");
for (const [flag, v] of [["--zone", inPath], ["--spans", spansPath], ["--out", outPath], ["--stamp", stamp]])
  require_(v, "MISSING_ARG", flag);

const zone = JSON.parse(gunzipSync(readFileSync(inPath)).toString("utf8"));

// ---- rule 3 · the zone's own keys ----------------------------------------
const keys = new Set();
const addWord = (w) => {
  if (w.w) w.w.forEach((r) => { if (r.k) keys.add(r.k); });
  else if (w.k) keys.add(w.k);
};
for (const s of zone.sections || []) (s.words || []).forEach(addWord);
(zone.work_he_tokens || []).forEach(addWord);
for (const n of zone.nodes || []) (n.name_tokens || []).forEach(addWord);
require_(keys.size > 0, "NO_KEYS", "this zone carries no keys to ask about");

const span = await readSpanSlice(spansPath, keys);

// ---- the span table, interned exactly as build-zone.mjs interns it -------
const intern = (arr, v) => { let i = arr.indexOf(v); if (i < 0) { i = arr.length; arr.push(v); } return i; };
const spanRoles = [], spanRules = [], spanConf = [];
const spans = {};
let spanHistogram = {};
for (const [k, sp] of span.spans) {
  spans[k] = [sp.s, sp.r.map((r) => intern(spanRoles, r)), intern(spanRules, sp.rule), intern(spanConf, sp.conf)];
  spanHistogram[sp.s.length] = (spanHistogram[sp.s.length] || 0) + 1;
}
spanHistogram = Object.fromEntries(Object.entries(spanHistogram).sort((a, b) => a[0] - b[0]));
const cellTotal = [...span.spans.values()].reduce((n, sp) => n + (sp.s.length * (sp.s.length + 1)) / 2, 0);
const coverTotal = [...span.spans.values()].reduce((n, sp) => n + 2 ** (sp.s.length - 1), 0);

// how many of the zone's own occurrences gained a component system
let regions = 0, spanned = 0;
for (const s of zone.sections || [])
  for (const w of s.words || []) {
    const rs = w.w ? w.w : (w.k ? [{ k: w.k }] : []);
    for (const r of rs) { regions += 1; if (r.k && span.spans.has(r.k)) spanned += 1; }
  }

const before = ((zone.emitted_from || {}).span_layer || {});
const out = {
  ...zone,
  spans,
  span_roles: spanRoles,
  span_rules: spanRules,
  span_conf: spanConf,
  emitted_from: {
    ...(zone.emitted_from || {}),
    span_layer: {
      rule: SPAN_RULE_ID,
      source: span.source,
      rows_scanned: span.scanned,
      forms_with_a_component_system: span.spans.size,
      component_count_histogram: spanHistogram,
      derived_cells: cellTotal,
      derived_complete_covers: coverTotal,
      derivation:
        "a form with n components has n(n+1)/2 contiguous cells and 2^(n-1) complete covers; both are computed from the component list and neither is stored",
      provenance_fields: {
        split_rule: spanRules,
        split_confidence: spanConf,
        note: "these name where a component boundary came from; they are provenance on the boundary, not a verdict on a reading. A reading is removed by its licence and by nothing else.",
      },
      roles: spanRoles,
      // rule 4 · said in the file, not in a commit message
      projected_on: stamp,
      projected_by: "tools/respan-zone-v1.mjs",
      projected_away_from: before.status || before.rule || "no span layer",
      gloss_layer_owed:
        "this zone's gloss layer was projected at whole-form grain and is now owed a re-projection at cell grain — run tools/regloss-zone.mjs",
    },
  },
  counts: {
    ...(zone.counts || {}),
    w_regions_with_a_component_system: spanned,
  },
};

const body = JSON.stringify(out);
writeFileSync(outPath, gzipSync(Buffer.from(body, "utf8"), { level: 9 }));
const sha = createHash("sha256").update(body).digest("hex");
console.log(`${outPath} · ${span.spans.size.toLocaleString()} forms carry a component system · sha256 ${sha}`);
console.log(`  asked about ${keys.size.toLocaleString()} of this zone's own keys · ${span.scanned.toLocaleString()} template rows scanned`);
console.log(`  ${spanned.toLocaleString()} of ${regions.toLocaleString()} occurrences gained one · components: ${JSON.stringify(spanHistogram)}`);
console.log(`  derived: ${cellTotal.toLocaleString()} contiguous cells · ${coverTotal.toLocaleString()} complete covers`);
console.log(`  the gloss layer is now owed a re-projection at cell grain — run tools/regloss-zone.mjs`);
