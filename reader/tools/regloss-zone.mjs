#!/usr/bin/env node
// Synthesis lane · regloss-rule-v1-project-the-store-over-a-zones-own-keys
//
// The gloss layer is a projection: the route store, asked about exactly the
// keys one zone contains. It does not depend on how that zone was acquired,
// only on the store and on the key list the zone already carries. So when the
// store moves, any zone can be re-projected onto it — including a zone whose
// own build route cannot be re-run here.
//
// Why this has to exist. A zone bakes one reading per key so the page paints
// without fetching 256 shards, while the card computes its readings live from
// the store. If the store moves and the zone does not, the printed word and
// the pressed pill disagree, and the reader is looking at two answers to one
// question. That is not a cosmetic drift: it is the page contradicting itself.
//
// Rules, declared before output:
//   1. Nothing is patched in place. This reads one zone and writes another.
//      Run it twice on the same inputs and you get the same bytes.
//   2. Only the gloss layer moves. Words, sections, spans, nodes, receipts for
//      the walk, the identity oracle and the licences are copied through
//      untouched — this tool has no opinion about any of them.
//   3. The keys asked for are the zone's own: every W of every occurrence,
//      every title token, and — where the zone carries a component system —
//      every cell surface of every form, which is what the card can open.
//   4. The zone records that it was re-projected, against which store, and
//      away from which gloss table, so the move is legible in the file rather
//      than only in a commit message.

import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { gzipSync, gunzipSync } from "node:zlib";
import { openRouteStore, GLOSS_RULE_ID, GLOSS_RULE_TEXT } from "./gloss-store-v1.mjs";
import { cellsOf } from "./span-slice-v1.mjs";
import { require_ } from "./zone-lib-v1.mjs";

const arg = (f, d = null) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d; };
const inPath = arg("--zone");
const storeDir = arg("--store", "data/route-store");
const outPath = arg("--out");
const stamp = arg("--stamp");
for (const [flag, v] of [["--zone", inPath], ["--out", outPath], ["--stamp", stamp]])
  require_(v, "MISSING_ARG", flag);

const zone = JSON.parse(gunzipSync(readFileSync(inPath)).toString("utf8"));
const store = openRouteStore(storeDir);

// ---- rule 3 · the zone's own keys ----------------------------------------
const keys = new Set();
const addWord = (w) => {
  if (w.w) w.w.forEach((r) => { if (r.k) keys.add(r.k); });
  else if (w.k) keys.add(w.k);
};
for (const sec of zone.sections || []) (sec.words || []).forEach(addWord);
for (const n of zone.nodes || []) {
  (n.name_tokens || []).forEach((t) => { if (t.k) keys.add(t.k); });
  (n.part_tokens || []).forEach((t) => { if (t.k) keys.add(t.k); });
}
// a commentary zone carries its words under units rather than sections
for (const u of Object.values(zone.units || {}))
  for (const e of [...(u.section || []), ...Object.values(u.words || {}).flat()])
    (e.words || []).forEach(addWord);

const cells = new Set(keys);
for (const row of Object.values(zone.spans || {}))
  for (const c of cellsOf(row[0])) cells.add(c.surface);

const { table: gloss, counts, sha256 } = store.tableFor([...cells]);

// ---- rule 2 · only the gloss layer moves ---------------------------------
const before = { forms: Object.keys(zone.gloss || {}).length, words: (zone.counts || {}).glossed_words };
let glossedWords = 0, changed = 0;
for (const k of Object.keys(zone.gloss || {})) if (zone.gloss[k] !== gloss[k]) changed += 1;
const countWord = (w) => {
  const rs = w.w ? w.w : (w.k ? [{ k: w.k }] : []);
  if (rs.some((r) => gloss[r.k])) glossedWords += 1;
};
for (const sec of zone.sections || []) (sec.words || []).forEach(countWord);
for (const u of Object.values(zone.units || {}))
  for (const e of [...(u.section || []), ...Object.values(u.words || {}).flat()])
    (e.words || []).forEach(countWord);

const previous = (zone.emitted_from || {}).gloss_layer || {};
zone.gloss = gloss;
zone.counts.glossed_words = glossedWords;
zone.emitted_from.gloss_layer = {
  ...previous,
  rule: `${GLOSS_RULE_ID}: ${GLOSS_RULE_TEXT}`,
  gloss_table_sha256: sha256,
  distinct_forms_glossed: counts.glossed,
  distinct_forms_bare: counts.no_exact_route + counts.no_displayable_route,
  store_inputs: store.index.inputs,
  reprojected: {
    rule: "regloss-rule-v1-project-the-store-over-a-zones-own-keys",
    on: stamp,
    from_gloss_table_sha256: previous.gloss_table_sha256 || null,
    forms_before: before.forms,
    forms_after: Object.keys(gloss).length,
    forms_whose_first_reading_moved: changed,
    words_carrying_a_reading: `${before.words ?? "?"} → ${glossedWords}`,
    why: "the route store moved; a zone that does not move with it prints one reading and offers another",
  },
};

const body = gzipSync(Buffer.from(JSON.stringify(zone)), { level: 9 });
writeFileSync(outPath, body);
console.log(
  `${outPath}: ${Object.keys(gloss).length.toLocaleString()} forms glossed ` +
  `(was ${before.forms.toLocaleString()}; ${changed.toLocaleString()} first readings moved) · ` +
  `${glossedWords.toLocaleString()} words carry a reading (was ${before.words ?? "?"}) · ` +
  `${(body.length / 1024).toFixed(1)} KB gz · sha256 ${createHash("sha256").update(body).digest("hex").slice(0, 16)}…`,
);
