#!/usr/bin/env node
// Synthesis lane · regloss-rule-v1-project-the-store-over-a-zones-own-keys
// LEDGER: -
// no frame letter. This writes only the zone it was given, a projection of
// the store over that zone's own keys; it decides nothing. It reads the
// served source corpus (data/source-corpus-v1.json) to price the shelf
// switches and writes no record into data/ itself.
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
//      Run it twice on the same inputs and you get the same bytes; and run
//      it on its own output, with the same store and the same stamp, and
//      you get that output again (10 November 2026: the receipt had compared
//      each run with the run before it, so a second run rewrote the record
//      of what the first had moved).
//   2. Only the gloss layer moves. Words, sections, spans, nodes, receipts for
//      the walk, the identity oracle and the licences are copied through
//      untouched — this tool has no opinion about any of them.
//   3. The keys asked for are the zone's own: every W of every occurrence,
//      every title token, and — where the zone carries a component system —
//      every cell surface of every form, which is what the card can open.
//   4. The zone records that it was re-projected and against which store,
//      and, when the table this run writes is not the table the zone
//      carried, which table it moved away from and how far (last_move). A
//      run that moves nothing carries that record forward untouched, so the
//      move stays legible in the file rather than only in a commit message.
//   5. Every column the store itself defines is projected in this pass: the
//      table, the names laid over it, the license columns, and the two
//      reader's orders the store computes (characters, corpus). A column this
//      pass does not project (the witnessed columns, baked from what the
//      corpus lane shipped) is refused unless it was baked against this store.

import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { openRouteStore, GLOSS_RULE_ID, GLOSS_RULE_TEXT } from "./gloss-store-v1.mjs";
import { glossMFor, sourceSwitchCosts, jointSwitchCosts, GLOSS_M_RULE_ID, licenceColumns, licClass } from "./gloss-m-v1.mjs";
import { nameLeadsFor, PROPER_NAME_RULE_ID, PROPER_NAME_RULE_TEXT } from "./proper-name-v1.mjs";
import { existsSync as existsSync_ } from "node:fs";
import { join, dirname } from "node:path";
import { formsOfRun, WELD_FORMS_RULE_ID } from "./weld-forms-v1.mjs";
import { SWITCH_RULE_ID } from "./gloss-store-v1.mjs";
import { cellsOf } from "./span-slice-v1.mjs";
import { require_ } from "./zone-lib-v1.mjs";
import { wordListsOf } from "./zone-walk-v1.mjs";
import { typePostBuildWrite, writeZone } from "./zone-post-build-v1.mjs";

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
// every word of the zone, a book's sections and a commentary's units alike
const WORD_LISTS = wordListsOf(zone);
for (const words of WORD_LISTS) words.forEach(addWord);
for (const n of zone.nodes || []) {
  (n.name_tokens || []).forEach((t) => { if (t.k) keys.add(t.k); });
  (n.part_tokens || []).forEach((t) => { if (t.k) keys.add(t.k); });
}

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
for (const words of WORD_LISTS) walkRuns(words);
for (const f of runForms) keys.add(f);

const cells = new Set(keys);
for (const row of Object.values(zone.spans || {}))
  for (const c of cellsOf(row[0])) cells.add(c.surface);

// the corpus record the page shelves languages by, and the corpus order
// sorts by: beside the zones when the zone is read from data/zones, else
// beside the store this run projects. It is required: without it every
// source shelves as "Hebrew in general" and the page, which has the record,
// shelves otherwise (6 November 2026: a round that reglossed baked copies
// from a scratch folder lost the record, and the switch check found two
// shelves with no joint price)
const corpusPath = /data\/zones\//u.test(String(inPath)) ? String(inPath).replace(/data\/zones\/.*$/u, "") + "data/source-corpus-v1.json" : join(dirname(storeDir), "source-corpus-v1.json");
if (!existsSync_(corpusPath)) { console.log(`REFUSED — no corpus record at ${corpusPath}; the page shelves languages by it, so a projection without it would price shelves the page does not have`); process.exit(1); }
const corpusRec = JSON.parse(readFileSync(corpusPath, "utf8"));
const corpusOf = (mId) => ((corpusRec.witnesses || {})[mId] || {}).corpus || null;
// THE READER'S ORDERS THE STORE DEFINES, PROJECTED WITH THE TABLE. tableFor
// answers the default order and, for each other order of its own (the
// catalog's rank: characters; the era's own witnesses first: corpus), the
// keys where that order leads with another reading. The builder laid those
// two columns once and this tool left them standing while it moved the
// table under them: on 10 November 2026 the 40 served zones held 47,038
// "characters" entries where the store gave 68,444, and of the 4,583
// "corpus" entries the store still gave 699. The page lays a column over
// the line (applyGlossOrder) and sorts the card live, so a stale entry is a
// line that says one reading over a card that opens on another.
const { table: gloss, deltas: orderDeltas, counts, sha256: baseSha256 } = store.tableFor([...cells], { corpusOf });

// ---- the names (proper-name-rule-v1) --------------------------------------
// A key whose two witnesses name it alike leads with the name instead of
// the derivation the oldest entry gives first. Applied to the table itself,
// because the table IS the line (served-line-rule-v1): the line, the porch
// and the card read one field, and a lane that reads zone.gloss reads what
// the reader meets. The keys led are listed beside it (gloss_names), so the
// card's sort can put the same reading first and say why.
const names = nameLeadsFor(store, zone, gloss);
// ---- no names (the owner, 2026-10-23: "no names and no blanks, if i flip
// them on or off it should just change those select cells") -------------
// The reading each name displaced, kept beside the names as an order column
// (gloss_orders.noname): the base table's own reading for the key, the
// derivation the oldest entry gives first, so the page's "no names" pill can
// lay it back over the line without a fetch, and over those lines alone.
// Only keys the name moved are listed; a key whose base reading is the name
// itself has nothing to put back. Its M is derived below with the other
// columns' (gloss_m_orders.noname).
const noname = {};
for (const [k, t] of Object.entries(names.leads)) if (gloss[k] !== undefined && gloss[k] !== t) noname[k] = gloss[k];
for (const [k, t] of Object.entries(names.leads)) gloss[k] = t;
const sha256 = createHash("sha256").update(JSON.stringify(gloss)).digest("hex");

// ---- rule 2 · only the gloss layer moves ---------------------------------
const before = { forms: Object.keys(zone.gloss || {}).length, words: (zone.counts || {}).glossed_words };
let glossedWords = 0, changed = 0;
for (const k of Object.keys(zone.gloss || {})) if (zone.gloss[k] !== gloss[k]) changed += 1;
const countWord = (w) => {
  const rs = w.w ? w.w : (w.k ? [{ k: w.k }] : []);
  if (rs.some((r) => gloss[r.k])) glossedWords += 1;
};
for (const words of WORD_LISTS) words.forEach(countWord);

// The M rides with the gloss it licenses, derived over the same store in the
// same pass (gloss-m-rule-v1: a reading shown is a reading licensed). Until
// 2026-09-12 this tool moved the gloss and left gloss_m behind, so every key
// the re-projection added — the headword keys of the look-up-by toggle —
// carried a reading and no license record: 77,342 of them across the shelf.
const { gloss_m: glossM, drift: glossMDrift } = glossMFor(store, gloss);
const mBefore = Object.keys(zone.gloss_m || {}).length;
const previous = { ...((zone.emitted_from || {}).gloss_layer || {}) };
// a field a projection of 2026-09-28 wrote here for one run and moved to
// the names layer the same day: carried forward by the spread below, it
// would stand on every zone forever, so it is dropped at the door
delete previous.base_table_sha256_before_names;
zone.gloss = gloss;
zone.gloss_m = glossM;
zone.gloss_names = names.leads;
zone.emitted_from.proper_names_layer = {
  rule: `${PROPER_NAME_RULE_ID}: ${PROPER_NAME_RULE_TEXT}`,
  projected_on: stamp, projected_by: "tools/regloss-zone.mjs",
  what_the_zone_carries: "gloss_names — every key whose line (zone.gloss[k]) is the entry's own name under this rule; the reading's M, carriers and alternate stand in gloss_m[k] as for every reading",
  base_table_sha256_before_names: baseSha256,
  counts: names.counts,
  held: names.held,
};
// THE ORDER COLUMNS' M, RE-DERIVED WITH THE REST. build-zone wrote each order
// column's license records once, as {lic, m, y} with no carriers; so a
// source switch could not reach a line an order put there, and when the
// store's years moved (the year repair, 3411c86e94e7) those records kept the
// old ones. The order's READINGS are not re-derived here; their M is derived
// over the same store, the same way gloss_m is — with its carriers and its
// alternate — and a reading no route stands on any more leaves the column,
// reading and credit together (gloss-m-rule-v1: a reading shown is a reading
// licensed; the line falls back to the base reading there). Until 2026-10-23
// it was kept with no M, "absent over wrong", and the page printed it under
// that order as an unattributed line: 31 readings on 23 zones, every one a
// reading only the struck Bolls (M20) carried.
// THE LICENCE COLUMNS, derived over the same store in the same pass
// (licence-columns-rule-v1): the licence switch's three classes, each a
// column holding the class's first reading where it differs from the base,
// so the line follows the switch as it follows every order. Replaced whole
// on every projection; their M is derived below with the other columns'.
{
  // a class whose own reading the name lead already is keeps the name
  const nameClass = {};
  for (const k of Object.keys(names.leads)) {
    const by = glossM[k] && Array.isArray(glossM[k].by) ? glossM[k].by : [names.carriers[k]];
    nameClass[k] = Math.min(...by.map((id) => licClass((store.index.m_sources[id] || {}).licensePosture)));
  }
  const lc = licenceColumns(store, gloss, nameClass);
  zone.gloss_orders = zone.gloss_orders && typeof zone.gloss_orders === "object" ? zone.gloss_orders : {};
  for (const [c, col] of Object.entries(lc.columns)) zone.gloss_orders[c] = col;
  zone.emitted_from.licence_orders_layer = {
    rule: lc.rule, projected_on: stamp, projected_by: "tools/regloss-zone.mjs",
    columns: lc.counts,
  };
}
// the store's own two orders, replaced whole on every projection (rule 5);
// their M is derived below with the other columns'
const orderColumnsBefore = Object.fromEntries(Object.keys(orderDeltas).map((o) => [o, Object.keys((zone.gloss_orders || {})[o] || {}).length]));
for (const [o, col] of Object.entries(orderDeltas)) zone.gloss_orders[o] = col;
zone.emitted_from.reader_orders_layer = {
  rule: "reader-orders-rule-v1-the-orders-the-store-defines-are-projected-with-the-table-on-every-projection",
  projected_on: stamp, projected_by: "tools/regloss-zone.mjs",
  what_the_zone_carries: "gloss_orders.characters and gloss_orders.corpus — for every key of the table where that order of the store's pool leads with another reading than the default order does, that reading (gloss-store-v1 tableFor: a key absent from a column is the positive fact that the order agrees there); their M in gloss_m_orders, derived with the other columns'",
  corpus_record: "data/source-corpus-v1.json",
  columns: Object.fromEntries(Object.entries(orderDeltas).map(([o, col]) => [o, Object.keys(col).length])),
};
if (Object.keys(noname).length || (zone.gloss_orders && typeof zone.gloss_orders === "object")) {
  zone.gloss_orders = zone.gloss_orders && typeof zone.gloss_orders === "object" ? zone.gloss_orders : {};
  delete zone.gloss_orders.noname;
  if (Object.keys(noname).length) zone.gloss_orders.noname = noname;
}
zone.emitted_from.no_names_layer = {
  rule: "no-names-rule-v1-the-reading-a-name-displaced-is-kept-beside-the-name-so-a-switch-puts-it-back-on-that-line-alone",
  projected_on: stamp, projected_by: "tools/regloss-zone.mjs",
  what_the_zone_carries: "gloss_orders.noname — for every key of gloss_names whose base reading the name displaced, that base reading (the table store.tableFor projects, the derivation the oldest entry gives first); its M in gloss_m_orders.noname, derived with the other columns'; the page's \"no names\" switch lays it over the line of every word the name still leads under the order in force",
  counts: { names: Object.keys(names.leads).length, displaced: Object.keys(noname).length, base_is_the_name: Object.keys(names.leads).length - Object.keys(noname).length },
};
// THE WITNESSED COLUMNS ARE BAKED FROM THE SHIPPED TEXT, NOT RE-MAPPED HERE
// (bake-witnessed-order-v1 version 2, 6 November 2026). The corpus lane
// shipped each witnessed reading as a served row's whole text, and the bake
// cuts it to the row's first reading under the store's rule of the day
// (ledger-division-rule-v2 for a source under a ledger). Until 6 November
// this layer re-mapped the already-cut piece onto a row and moved it to that
// row's first reading, and the code review of that day showed it drifting:
// a piece another source also gave whole was credited to a source that no
// longer gave it (508 readings), and a moved reading re-credited to every
// carrier walked across rows on the next run ("trouble" to "weariness").
// Now the bake runs on every store change, from data/witnessed-orders-v2.7,
// and this layer only keeps or re-credits what the bake laid: a zone whose
// columns were baked against another store is refused here, never projected.
{
  const wo = zone.emitted_from && zone.emitted_from.witnessed_order;
  if (wo && wo.columns && Object.keys(wo.columns).length) {
    const against = wo.baked_against_store ?? null, now = store.index.store_version ?? null;
    if (against !== now) { console.log(`REFUSED — the witnessed columns were baked against store ${against}, and this projects store ${now}; run tools/bake-witnessed-order-v1.mjs on the zone first`); process.exit(1); }
  }
}
let ordersM = null, witnessedDrops = 0;
if (zone.gloss_orders && typeof zone.gloss_orders === "object") {
  ordersM = {};
  const prevOM = zone.gloss_m_orders || {};
  // the witnessed columns carry the corpus lane's own credit for each
  // reading, baked as shipped (bake-witnessed-order-v1); they are kept
  const shipped = new Set(Object.keys((zone.emitted_from.witnessed_order || {}).columns || {}));
  for (const [o, table] of Object.entries(zone.gloss_orders)) {
    if (!table || typeof table !== "object") continue;
    if (shipped.has(o)) {
      // A STRUCK CREDIT IS NOT KEPT (2026-10-17, Bolls M20): a shipped
      // column's reading stands on the source the lane credited it to; a
      // source the store no longer holds cannot stand under a reading, so
      // the entry leaves the column, reading and credit together, and the
      // line falls back to the base reading there. Counted, never silent.
      // An entry whose credit names a struck source anywhere (its carriers
      // or its alternate's) is re-credited from the store as an unshipped
      // column's would be; where no route stands on the reading any more it
      // leaves the column, reading and credit together.
      const kept = {}; let struckOut = 0, recredited = 0; const recreditedKeys = [];
      // a key an earlier run of this tool re-credited stays typed as
      // re-credited while it stands in the column: its credit is still the
      // store's and not the lane's, whichever run replaced it
      const wcBefore = zone.emitted_from.witnessed_order && zone.emitted_from.witnessed_order.columns && zone.emitted_from.witnessed_order.columns[o];
      const recreditedBefore = new Set(wcBefore && Array.isArray(wcBefore.struck_credit_recredited_keys) ? wcBefore.struck_credit_recredited_keys : []);
      for (const [k, m] of Object.entries(prevOM[o] || {})) {
        const ids = typeof m === "string" ? [m] : (m && Array.isArray(m.by) ? m.by : []);
        const altIds = m && m.alt && Array.isArray(m.alt.by) ? m.alt.by : [];
        const touched = [...ids, ...altIds].some((id) => !store.index.m_sources[id]);
        if (!touched) { kept[k] = m; if (recreditedBefore.has(k) && table[k] !== undefined) { recredited += 1; recreditedKeys.push(k); } continue; }
        const re = table[k] !== undefined ? glossMFor(store, { [k]: table[k] }).gloss_m[k] : null;
        if (re) { kept[k] = re; recredited += 1; recreditedKeys.push(k); continue; }
        delete table[k]; struckOut += 1; witnessedDrops += 1;
        // TYPED BESIDE THE BAKE COUNT. The witnessed receipt's "baked" is the
        // bake's own fact and is not rewritten; the drop is typed on that
        // column's receipt beside it. The bake writes the receipt whole on
        // every round and lays the shipped credits again, so the drop is made
        // and typed again by the projection that follows it, with that
        // round's day. check-witnessed-order-v1 W1 reads baked less these
        // drops.
        const wc = zone.emitted_from.witnessed_order && zone.emitted_from.witnessed_order.columns && zone.emitted_from.witnessed_order.columns[o];
        if (wc && !(Array.isArray(wc.struck_credit_drops) && wc.struck_credit_drops.some((d) => d.key === k)))
          (wc.struck_credit_drops = Array.isArray(wc.struck_credit_drops) ? wc.struck_credit_drops : []).push({ key: k, by: [...ids, ...altIds], on: stamp, why: "source-strike-rule-v1: the credited source is no longer in the store and no route the store holds stands on the reading" });
      }
      // the keys re-credited from the store are typed on the column's receipt too, so check-witnessed-order W2 can tell them from the lane's own credit
      { const wc = zone.emitted_from.witnessed_order && zone.emitted_from.witnessed_order.columns && zone.emitted_from.witnessed_order.columns[o]; if (wc) { if (recreditedKeys.length) wc.struck_credit_recredited_keys = recreditedKeys; else delete wc.struck_credit_recredited_keys; } }
      ordersM[o] = { gloss_m: kept, drift: 0, struck_credit_dropped: struckOut, struck_credit_recredited: recredited };
    } else {
      // A READING NO ROUTE STANDS ON LEAVES THE COLUMN, as a shipped
      // column's does above: an order column is the store's projection as
      // it stood when the zone was built, and when the store moves under it
      // (a source struck, a reading no admitted route divides to any more) a
      // reading whose M cannot be derived would print unattributed under
      // that order. Counted, never silent.
      const r = glossMFor(store, table);
      let dropped = 0;
      for (const k of Object.keys(table)) if (!r.gloss_m[k]) { delete table[k]; dropped += 1; }
      ordersM[o] = { gloss_m: r.gloss_m, drift: r.drift, no_route_dropped: dropped };
    }
  }
  zone.gloss_m_orders = Object.fromEntries(Object.entries(ordersM).map(([o, r]) => [o, r.gloss_m]));
  zone.emitted_from.gloss_m_orders_layer = {
    rule: GLOSS_M_RULE_ID, projected_on: stamp, projected_by: "tools/regloss-zone.mjs",
    per_order: Object.fromEntries(Object.entries(ordersM).map(([o, r]) => [o, {
      readings: Object.keys(zone.gloss_orders[o] || {}).length,
      carry_their_m: Object.keys(r.gloss_m).length,
      no_route_stands_on: r.drift,
      ...(r.struck_credit_dropped ? { struck_credit_dropped: r.struck_credit_dropped } : {}),
      ...(r.struck_credit_recredited ? { struck_credit_recredited: r.struck_credit_recredited } : {}),
      ...(r.no_route_dropped ? { no_route_dropped: r.no_route_dropped } : {}),
    }])),
  };
}
zone.counts.glossed_words = glossedWords;
// THE MOVE, RECORDED WHEN THE TABLE MOVES (rule 4). A projection that writes
// the table the zone already carried moved nothing, and the record of the
// last move is carried forward as it stands. Zones projected before 10
// November 2026 carry no such record: their receipt was a comparison with
// the run before it, and every later run on the same store overwrote it
// with "0 moved". For them the field says so and is null.
const prevRe = previous.reprojected && typeof previous.reprojected === "object" ? previous.reprojected : {};
const tableMoved = !!previous.gloss_table_sha256 && previous.gloss_table_sha256 !== sha256;
const lastMove = tableMoved
  ? {
    on: stamp,
    from_store_version: prevRe.store_version ?? previous.store_version ?? null,
    to_store_version: store.index.store_version ?? null,
    from_gloss_table_sha256: previous.gloss_table_sha256,
    to_gloss_table_sha256: sha256,
    forms_before: before.forms,
    forms_after: Object.keys(gloss).length,
    forms_whose_first_reading_moved: changed,
    words_carrying_a_reading_before: before.words ?? null,
    words_carrying_a_reading_after: glossedWords,
  }
  : (prevRe.last_move ?? null);
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
    // the store this projection read: gloss_layer.store_version stays the
    // build's own, and a re-gloss names the store it moved the zone onto
    store_version: store.index.store_version ?? null,
    forms: Object.keys(gloss).length,
    words_carrying_a_reading: glossedWords,
    last_move: lastMove,
    last_move_says: "the last projection that wrote another table than the zone carried: the stores and the tables on either side of it and how many first readings moved; null where no projection since 10 November 2026 has moved this zone's table (before that day the receipt compared each run with the run before it, and a later run on the same store overwrote the move with zeros)",
    why: "the route store moved; a zone that does not move with it prints one reading and offers another",
    run_forms: `${WELD_FORMS_RULE_ID}: ${runForms.size} whole forms of this book's maqaf runs asked for (as written, joined, folded); ${[...runForms].filter((f) => gloss[f]).length} of them a dictionary published`,
    m_layer: `${GLOSS_M_RULE_ID}: gloss_m re-derived over the same store for every key of the re-projected table — ${Object.keys(glossM).length} readings carry their M, ${glossMDrift} readings no route stands on and shown without a chip`,
    names: `${PROPER_NAME_RULE_ID}: ${names.counts.led} keys lead with the entry's own name (${names.counts.words_led} words; ${names.counts.moved} lines moved off a derivation or a transliteration); held — ${names.counts.held_named_at_some_places_only} named at some places only, ${names.counts.held_two_names} named two ways, ${names.counts.held_no_matching_form} with no Strong's form matching the witness and the pointing`,
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
// positions per key: a word by its own key, a divided word by each part's;
// every word of the zone (the one walk: until 10 November 2026 this loop
// read a book's sections only, and every commentary zone priced its
// switches at 0 lines)
const weights = {};
for (const words of WORD_LISTS) for (const w of words) {
  if (w.k) weights[w.k] = (weights[w.k] || 0) + 1;
  else if (Array.isArray(w.w)) for (const a of w.w) if (a && a.k && !String(a.k).includes("\u05be")) weights[a.k] = (weights[a.k] || 0) + 1;
}
const joint = jointSwitchCosts(store, gloss, glossM, switchTable, corpusRec, weights);
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
  joint,
  branch: {
    waits: "each source's own declarations about itself — language, part of speech, period, sense type — toggleable a declaration at a time under the source's switch; the corpus lane's declarations ledger has not shipped, so the rail draws no branch",
  },
  rulings_owed: "none for the switch itself; which sources are ADMITTED at all is the language admission rule, and the Jastrow lean is not a ruling (serving-rulings-v1.json)",
};

// TYPED on the zone: a post-build write is named under the single-pass
// exemption — who wrote it, which field, why, and when it expires — so the
// receipts check counts it rather than faulting it as anonymous patching.
// Merged, not replaced: the enrichment and the respan lane type theirs too.
typePostBuildWrite(zone, {
  tool: "tools/regloss-zone.mjs",
  fields: ["gloss_layer.reprojected", "gloss_m", "emitted_from.toggles", "gloss_orders", "emitted_from.licence_orders_layer", "emitted_from.reader_orders_layer", "gloss_names", "emitted_from.proper_names_layer", "emitted_from.no_names_layer", ...(ordersM ? ["gloss_m_orders", "emitted_from.gloss_m_orders_layer"] : []), ...(witnessedDrops ? ["emitted_from.witnessed_order"] : [])],
  why: "the gloss layer is a projection of the route store over this zone's own keys, re-run here at cell grain after the component layer was projected",
  expires: "with this zone's rebuild by a build-zone run that writes its gloss layer in its single pass",
  stamp,
});
const body = writeZone(outPath, zone);
console.log(
  `${outPath}: ${Object.keys(gloss).length.toLocaleString()} forms glossed ` +
  `(was ${before.forms.toLocaleString()}; ${changed.toLocaleString()} first readings moved) · ` +
  `${glossedWords.toLocaleString()} words carry a reading (was ${before.words ?? "?"}) · ` +
  `${names.counts.led} keys lead with a name (${names.counts.moved} moved) · ` +
  `orders ${Object.entries(orderDeltas).map(([o, col]) => `${o} ${Object.keys(col).length} (was ${orderColumnsBefore[o]})`).join(", ")} · ` +
  `gloss_m ${Object.keys(glossM).length} (was ${mBefore}) · ` +
  `${(body.length / 1024).toFixed(1)} KB gz · sha256 ${createHash("sha256").update(body).digest("hex").slice(0, 16)}…`,
);
