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
import { glossMFor, sourceSwitchCosts, GLOSS_M_RULE_ID } from "./gloss-m-v1.mjs";
import { formsOfRun, WELD_FORMS_RULE_ID } from "./weld-forms-v1.mjs";
import { SWITCH_RULE_ID } from "./gloss-store-v1.mjs";
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
  // a word that carries a headword (the look-up-by toggle, projected by
  // project-toggle-headword-v1) is asked for under that key too, so the line
  // can read under the headword without a fetch
  if (w.h) keys.add(w.h);
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

// THE RUNS' WHOLE FORMS (the megacompspan, owner 2026-09-24): a maqaf run
// is one card whose lattice holds the run as written, joined and folded, and
// word by word. Each whole form is asked for here, so a run a dictionary
// published whole (BDB's Bethel, Ben-Hadad) reads that on its line without a
// fetch. The forms are Moses's enumeration (weld-forms-v1.formsOfRun),
// mechanical and unfiltered; the store decides which any dictionary wrote,
// and a form nobody wrote finds nothing and is not in the table.
const runForms = new Set();
const walkRuns = (words) => {
  let run = [];
  for (const w of words || []) {
    const pj = w.presentation_join;
    const joinsNext = !!(pj && pj.join_next_without_separator && String(pj.why || "").startsWith("maqaf-rule-v2"));
    run.push(w);
    if (joinsNext) continue;
    if (run.length > 1 && run.every((x) => x.k && !x.kq))
      for (const f of formsOfRun(run.map((x) => x.k))) if (f.form !== "pieces") runForms.add(f.key);
    run = [];
  }
};
for (const sec of zone.sections || []) walkRuns(sec.words);
for (const u of Object.values(zone.units || {}))
  for (const e of [...(u.section || []), ...Object.values(u.words || {}).flat()]) walkRuns(e.words);
for (const f of runForms) keys.add(f);

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

// The M rides with the gloss it licenses, derived over the same store in the
// same pass (gloss-m-rule-v1: a reading shown is a reading licensed). Until
// 2026-09-12 this tool moved the gloss and left gloss_m behind, so every key
// the re-projection added — the headword keys of the look-up-by toggle —
// carried a reading and no license record: 77,342 of them across the shelf.
const { gloss_m: glossM, drift: glossMDrift } = glossMFor(store, gloss);
const mBefore = Object.keys(zone.gloss_m || {}).length;
const previous = (zone.emitted_from || {}).gloss_layer || {};
zone.gloss = gloss;
zone.gloss_m = glossM;
// THE ORDER COLUMNS' M, RE-DERIVED WITH THE REST. build-zone wrote each order
// column's license records once, as {lic, m, y} with no carriers; so a
// source switch could not reach a line an order put there, and when the
// store's years moved (the year repair, 3411c86e94e7) those records kept the
// old ones. The order's READINGS are the ledger's and are not touched; their
// M is derived here over the same store, the same way gloss_m is — with its
// carriers and its alternate — and a reading no route stands on keeps no M,
// which draws no chip: absent over wrong.
let ordersM = null;
if (zone.gloss_orders && typeof zone.gloss_orders === "object") {
  ordersM = {};
  const prevOM = zone.gloss_m_orders || {};
  // the witnessed columns carry the corpus lane's own credit for each
  // reading, baked as shipped (bake-witnessed-order-v1); they are kept
  const shipped = new Set(Object.keys((zone.emitted_from.witnessed_order || {}).columns || {}));
  for (const [o, table] of Object.entries(zone.gloss_orders)) {
    if (!table || typeof table !== "object") continue;
    ordersM[o] = shipped.has(o) ? { gloss_m: prevOM[o] || {}, drift: 0 } : glossMFor(store, table);
  }
  zone.gloss_m_orders = Object.fromEntries(Object.entries(ordersM).map(([o, r]) => [o, r.gloss_m]));
  zone.emitted_from.gloss_m_orders_layer = {
    rule: GLOSS_M_RULE_ID, projected_on: stamp, projected_by: "tools/regloss-zone.mjs",
    per_order: Object.fromEntries(Object.entries(ordersM).map(([o, r]) => [o, {
      readings: Object.keys(zone.gloss_orders[o] || {}).length,
      carry_their_m: Object.keys(r.gloss_m).length,
      no_route_stands_on: r.drift,
      had_m_before: Object.keys(prevOM[o] || {}).length,
    }])),
  };
}
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
    run_forms: `${WELD_FORMS_RULE_ID}: ${runForms.size} whole forms of this book's maqaf runs asked for (as written, joined, folded); ${[...runForms].filter((f) => gloss[f]).length} of them a dictionary published`,
    m_layer: `${GLOSS_M_RULE_ID}: gloss_m re-derived over the same store for every key of the re-projected table — ${Object.keys(glossM).length} readings carry their M (was ${mBefore}), ${glossMDrift} readings no route stands on and shown without a chip`,
  },
};

// THE SOURCE SWITCHES' RECEIPT. gloss_m now carries, per key, every carrier
// of the printed reading (by) and the reading that leads when all of them
// are off (alt) — see gloss-m-v1.mjs. What the rail needs beside that is one
// table per book: each source this book's readings stand on, and what its
// switch costs HERE — lines that change, lines that go dark. Computed in
// this pass because it needs every key of the book and the page holds one
// shard at a time. The unit the reader switches is the source's own key;
// the ids are the ledger's, and both are on the table.
const switchTable = sourceSwitchCosts(store, gloss, glossM);
const withBy = Object.values(glossM).filter((e) => Array.isArray(e.by)).length;
const withAlt = Object.values(glossM).filter((e) => e.alt).length;
zone.emitted_from.toggles = zone.emitted_from.toggles || {};
zone.emitted_from.toggles.sources = {
  rule: SWITCH_RULE_ID,
  projected_on: stamp,
  projected_by: "tools/regloss-zone.mjs",
  what_the_word_carries: "gloss_m[k].by — every admitted source whose route divides to the printed reading, sorted; gloss_m[k].alt — the reading that leads when every carrier in by is switched off, with its own M and its own carriers, or absent when nothing survives",
  what_the_rail_reads: "sources — per ledger id: the source's own key and label, its licence name, and on THIS book: leads (keys whose printed reading it carries), carries (keys where any reading is its), changes (keys whose line moves when it alone is off), darkens (keys whose line has no successor when it alone is off)",
  counts: {
    keys: Object.keys(gloss).length,
    keys_with_carriers: withBy,
    keys_with_an_alternate: withAlt,
    keys_sole_carrier: Object.values(glossM).filter((e) => Array.isArray(e.by) && e.by.length === 1).length,
    sources_carrying: Object.keys(switchTable).length,
    sources_leading: Object.values(switchTable).filter((s) => s.leads > 0).length,
    source_keys: new Set(Object.values(switchTable).map((s) => s.key || "")).size,
  },
  sources: switchTable,
  branch: {
    waits: "each source's own declarations about itself — language, part of speech, period, sense type — toggleable a declaration at a time under the source's switch; the corpus lane's declarations ledger has not shipped, so the rail draws no branch",
  },
  rulings_owed: "none for the switch itself; which sources are ADMITTED at all is the language admission rule, and the Jastrow lean is not a ruling (serving-rulings-v1.json)",
};

// TYPED on the zone: a post-build write is named under the single-pass
// exemption — who wrote it, which field, why, and when it expires — so the
// receipts check counts it rather than faulting it as anonymous patching.
// Merged, not replaced: the enrichment and the respan lane type theirs too.
{
  const EXEMPTION_RULE_ID = "single-pass-exemption-v1-a-post-build-write-is-typed-on-the-zone-and-expires-with-its-rebuild";
  const ef = zone.emitted_from;
  const pb = ef.post_build && ef.post_build.rule_id === EXEMPTION_RULE_ID ? ef.post_build : { rule_id: EXEMPTION_RULE_ID, by: "", wrote: [], by_field: {}, why: "", expires: "", on: stamp };
  const me = "tools/regloss-zone.mjs";
  pb.by = pb.by ? (pb.by.includes(me) ? pb.by : `${pb.by} + ${me}`) : me;
  for (const f of ["gloss_layer.reprojected", "gloss_m", "emitted_from.toggles", ...(ordersM ? ["gloss_m_orders", "emitted_from.gloss_m_orders_layer"] : [])]) { if (!pb.wrote.includes(f)) pb.wrote.push(f); pb.by_field[f] = pb.by_field[f] ? (pb.by_field[f].includes(me) ? pb.by_field[f] : `${pb.by_field[f]} + ${me}`) : me; }
  const why = "the gloss layer is a projection of the route store over this zone's own keys, re-run here at cell grain after the component layer was projected";
  pb.why = pb.why ? (pb.why.includes(why) ? pb.why : `${pb.why}; ${why}`) : why;
  const exp = "with this zone's rebuild by a build-zone run that writes its gloss layer in its single pass";
  pb.expires = pb.expires ? (pb.expires.includes(exp) ? pb.expires : `${pb.expires}; ${exp}`) : exp;
  pb.on = stamp;
  ef.post_build = pb;
}
const body = gzipSync(Buffer.from(JSON.stringify(zone)), { level: 9 });
writeFileSync(outPath, body);
console.log(
  `${outPath}: ${Object.keys(gloss).length.toLocaleString()} forms glossed ` +
  `(was ${before.forms.toLocaleString()}; ${changed.toLocaleString()} first readings moved) · ` +
  `${glossedWords.toLocaleString()} words carry a reading (was ${before.words ?? "?"}) · ` +
  `${(body.length / 1024).toFixed(1)} KB gz · sha256 ${createHash("sha256").update(body).digest("hex").slice(0, 16)}…`,
);
