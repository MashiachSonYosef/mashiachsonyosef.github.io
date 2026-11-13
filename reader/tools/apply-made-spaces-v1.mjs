#!/usr/bin/env node
// GUARDS: made-spaces-rule-v1-a-space-our-build-put-where-a-tag-stood-closes-at-print-as-the-corpus-lanes-list-names-it
// LEDGER: M R D
// it writes, on the rows of the sources the corpus lane's lists name (M), the
// places of the route text (R) and of the definition text (D) that close at
// print. No place is decided here and no text is changed.
//
// THE SPACE IN «Amos , an Israelite prophet» IS OURS, AND IT CLOSES AT PRINT.
//
// The provider's file holds `<def>Amos</def>, an Israelite prophet`. Our own
// build turns a field of that XML into served text in one step whose first
// act puts one space where each tag stood, so the store serves a space before
// the comma that the provider never wrote. The corpus lane traced every such
// space in the sources that pass through that step (relay v168, 12 November
// 2026 AD; its rule stands beside its lists in data/made-spaces-v1/RULE.md):
// a space is MADE when the provider's file holds tags and no whitespace
// there, and a made space CLOSES unless closing would join two things the
// provider's markup alone held apart. One list per source names, for each
// served text that holds a made space, the places that close, counted from 0
// in UTF-16 units of the text.
//
// The lists are kept here byte for byte (data/made-spaces-v1/, pinned in
// PIN.json) and this tool writes them onto the rows. NOTHING IN A TEXT IS
// CHANGED: the route text and the definition text stay the bytes the corpus
// lane serves, because every list, ledger, lattice and strike names a row by
// those bytes. What is written is one more slot:
//
//   row[9] = [the route text's closes or null, the definition text's or null]
//
// on a row of a listed source whose route text or definition text is a line
// of its source's list with at least one close, and on no other row. A row
// with no close keeps the length it had. The readers take the characters at
// those places out when they print (tools/gloss-store-v1.mjs: closed,
// routePrinted, recordPrinted, readingsOf; zone.html: the same names), after
// the ledger's division, so no cut moves: a piece cut from a route text takes
// the closes that fall inside it.
//
// REFUSED, each in words and with nothing written:
//   - a list that is not the bytes its pin names, or a pin that names another
//     sha256 than the corpus lane's own receipt;
//   - a line that is not well formed: a text listed twice, a close that is
//     not a space of its text, closes out of order, or a `prints` that is not
//     the text with its closes taken out;
//   - a list whose source the store does not hold under that m id and key;
//   - a row that carries a print slot (row[8]) and a close on its route text:
//     the print slot's texts are written by the ledger tool from the served
//     bytes, and nothing here says where a close falls inside one. None does
//     today; when a ledger names its list, that is where the two are joined;
//   - a row of a source no list names that carries the slot;
//   - a row of the span store whose text is a line with a close (the lane
//     read that store too and found none; its rows carry no such slot);
//   - while the store is the version the lists were read from: a line whose
//     row counts are not the store's, or a source whose rows holding a close
//     are not the count the corpus lane's receipt states.
//
// After the store has moved on from that version the same comparisons are
// recorded and no longer refuse: a row struck or landed since then moves a
// count, and the closes of every text the list names still hold.
//
// Idempotent: a second run moves nothing and writes nothing. --dry prints
// and writes nothing.
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync, gzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { MADE_SPACES_RULE_ID, CLOSES_SLOT, closed } from "./gloss-store-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > 0 ? process.argv[i + 1] : d; };
const DRY = process.argv.includes("--dry");
const STORE = arg("store", join(K3, "data", "route-store"));
const SPAN = arg("span-store", join(K3, "data", "span-store"));
const LISTS = arg("lists", join(K3, "data", "made-spaces-v1"));
const RECEIPT = arg("receipt", join(K3, "data", "made-spaces-receipt-v1.json"));
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const refuse = (why) => { console.error(`REFUSED · ${why}`); process.exit(1); };
const n = (x) => Number(x).toLocaleString("en-US");
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ---- the lists, as the corpus lane wrote them ------------------------------------------
const pinPath = join(LISTS, "PIN.json");
if (!existsSync(pinPath)) refuse(`the pin of the made-spaces lists is missing (${pinPath})`);
const pin = JSON.parse(readFileSync(pinPath, "utf8"));
const pinned = (p) => {
  const path = join(LISTS, p.file);
  if (!existsSync(path)) refuse(`${p.file} is named in the pin and is not here`);
  const bytes = readFileSync(path);
  if (bytes.length !== p.bytes || sha256(bytes) !== p.sha256) refuse(`${p.file} is not the bytes its pin names (${bytes.length} bytes, ${sha256(bytes)}; the pin: ${p.bytes}, ${p.sha256})`);
  return bytes;
};
pinned(pin.rule);
const theirs = JSON.parse(pinned(pin.receipt).toString("utf8"));   // the corpus lane's own receipt: which source each list is, and its counts
const index = JSON.parse(readFileSync(join(STORE, "index.json"), "utf8"));
const listedAt = (((theirs.inputs || {}).route_store || {}).store_version) || null;   // the store version the lists were read from
const sameStore = index.store_version === listedAt || ((index.made_spaces || {}).store_version_before === listedAt && (index.made_spaces || {}).store_version === index.store_version);

const LISTED = new Map();   // m id -> { key, file, lines: Map(text -> line), counts they state }
for (const p of pin.lists) {
  const bytes = pinned(p);
  const out = (theirs.outputs || []).find((o) => o.file === p.file);
  if (!out || out.sha256 !== p.sha256) refuse(`the corpus lane's receipt does not name ${p.file} by the sha256 its pin names`);
  const key = p.file.split(".")[0];
  const src = (theirs.sources || []).find((s) => s.source_key === key);
  if (!src) refuse(`the corpus lane's receipt names no source for ${p.file}`);
  const mine = (index.m_sources || {})[src.m_id];
  if (!mine || mine.key !== key || mine.label !== src.label) refuse(`${src.m_id} is ${mine ? `${mine.key} (${mine.label})` : "no source"} in the store and ${key} (${src.label}) in the corpus lane's receipt`);
  if (LISTED.has(src.m_id)) refuse(`two lists name ${src.m_id}`);
  const text = bytes.toString("utf8");
  if (!text.endsWith("\n")) refuse(`${p.file} does not end in a line end`);
  const raw = text.slice(0, -1).split("\n");
  if (raw.length !== p.lines) refuse(`${p.file} holds ${raw.length} lines and its pin says ${p.lines}`);
  const lines = new Map();
  raw.forEach((s, at) => {
    const where = `${p.file} line ${at + 1}`;
    let l = null;
    try { l = JSON.parse(s); } catch (e) { refuse(`${where} is not JSON (${e.message})`); }
    if (typeof l.text !== "string" || !l.text || !Array.isArray(l.closes) || typeof l.prints !== "string") refuse(`${where} names no text, no closes or no prints`);
    if (lines.has(l.text)) refuse(`${where} names a text an earlier line names: «${l.text.slice(0, 60)}»`);
    l.closes.forEach((c, i) => {
      if (!Number.isInteger(c) || c < 0 || c >= l.text.length || l.text[c] !== " ") refuse(`${where}: the close at ${c} is not a space of the text «${l.text.slice(0, 60)}»`);
      if (i && c <= l.closes[i - 1]) refuse(`${where}: its closes are not in rising order`);
    });
    for (const c of l.kept || []) if (!Number.isInteger(c) || l.text[c] !== " " || l.closes.includes(c)) refuse(`${where}: the kept place ${c} is not a space of the text, or is one of its closes`);
    if (closed(l.text, l.closes) !== l.prints) refuse(`${where}: its prints is not its text with the closes taken out`);
    lines.set(l.text, l);
  });
  LISTED.set(src.m_id, { key, label: src.label, file: p.file, sha256: p.sha256, lines, theirs: src });
}

// ---- every row of the store ----------------------------------------------------------------
const tally = {};
const of = (m) => (tally[m] ||= { rows: 0, rows_with_a_close_on_the_route_text: 0, rows_with_a_close_on_the_definition_text: 0, rows_with_a_close_on_either: 0,
  closes_on_route_texts: 0, closes_on_definition_texts: 0, rows_a_ledger_divides_with_a_close_on_the_route_text: 0, closes_that_stand_at_a_ledgers_cut: 0, rows_moved: 0 });
const served = new Map();   // m id -> Map(text -> [rows serving it as the route text, as the definition text])
const closesOf = (L, text) => { const l = L.lines.get(String(text ?? "")); return l && l.closes.length ? l.closes : null; };
const shardNames = readdirSync(join(STORE, "shards")).filter((f) => f.endsWith(".bin")).sort();
const touched = [];
for (const name of shardNames) {
  const path = join(STORE, "shards", name);
  const body = JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"));
  let moved = 0;
  for (const [k, rows] of Object.entries(body)) for (const row of rows) {
    const m = String(row[3]), L = LISTED.get(m);
    if (!L) {
      if (row.length > CLOSES_SLOT) refuse(`${name} ${k}: a row of ${m}, which no list names, carries the closes slot`);
      continue;
    }
    const t = of(m); t.rows += 1;
    const seen = (served.get(m) || served.set(m, new Map()).get(m));
    for (const f of [1, 2]) { const s = String(row[f] ?? ""); if (L.lines.has(s)) (seen.get(s) || seen.set(s, [0, 0]).get(s))[f - 1] += 1; }
    const route = closesOf(L, row[1]), definition = closesOf(L, row[2]);
    if (route) {
      if (Array.isArray(row[8])) refuse(`${name} ${k} (${m}, rank ${row[0]}): the row carries a print slot and a close on its route text «${String(row[1]).slice(0, 60)}»`);
      t.rows_with_a_close_on_the_route_text += 1; t.closes_on_route_texts += route.length;
      const cuts = Array.isArray(row[7]) ? row[7] : [];
      if (cuts.length) { t.rows_a_ledger_divides_with_a_close_on_the_route_text += 1; t.closes_that_stand_at_a_ledgers_cut += route.filter((c) => cuts.includes(c)).length; }
    }
    if (definition) { t.rows_with_a_close_on_the_definition_text += 1; t.closes_on_definition_texts += definition.length; }
    if (route || definition) t.rows_with_a_close_on_either += 1;
    const want = route || definition ? [route, definition] : null;
    const has = row.length > CLOSES_SLOT ? row[CLOSES_SLOT] : null;
    if (same(has, want)) continue;
    t.rows_moved += 1; moved += 1;
    if (DRY) continue;
    if (want) { while (row.length < CLOSES_SLOT) row.push(null); row[CLOSES_SLOT] = want; }
    else { row.length = CLOSES_SLOT; if (row[8] === null) { row.length = 8; if (row[7] === null) row.length = 7; } }
  }
  if (moved) { touched.push(name); if (!DRY) writeFileSync(path, gzipSync(Buffer.from(JSON.stringify(body)), { level: 9 })); }
}

// ---- the span store: read, never written ---------------------------------------------------
let spanRows = 0;
if (existsSync(join(SPAN, "index.json"))) {
  for (const f of readdirSync(SPAN).filter((x) => /^[a-z0-9-]+\.json$/u.test(x) && x !== "index.json").sort()) {
    const file = JSON.parse(readFileSync(join(SPAN, f), "utf8"));
    for (const rows of Object.values(file.keys || {})) for (const r of rows) {
      const L = r && Array.isArray(r.slots) ? LISTED.get(String(r.slots[3])) : null;
      if (!L) continue;
      spanRows += 1;
      if (closesOf(L, r.slots[1]) || closesOf(L, r.slots[2])) refuse(`the span store's ${f} holds a row of ${r.slots[3]} whose text is a list line with a close: «${String(r.slots[1]).slice(0, 60)}»`);
    }
  }
}

// ---- the lists against the store, and against the corpus lane's own counts -----------------
const sources = {};
for (const [m, L] of LISTED) {
  const t = of(m), seen = served.get(m) || new Map();
  let agree = 0, differ = 0, unserved = 0; const differing = [];
  for (const [text, l] of L.lines) {
    const [r1, r2] = seen.get(text) || [0, 0];
    if (!r1 && !r2) unserved += 1;
    if (r1 === (l.rows_field_1 || 0) && r2 === (l.rows_field_2 || 0)) agree += 1;
    else { differ += 1; if (differing.length < 12) differing.push({ text: text.slice(0, 80), list: [l.rows_field_1 || 0, l.rows_field_2 || 0], store: [r1, r2] }); }
  }
  const stated = ((L.theirs.rows_axis || {}).route_store) || {};
  const counts = { route: [t.rows_with_a_close_on_the_route_text, stated.field_1_holds_a_close], definition: [t.rows_with_a_close_on_the_definition_text, stated.field_2_holds_a_close], either: [t.rows_with_a_close_on_either, stated.either_holds_a_close] };
  const countsAgree = Object.values(counts).every(([a, b]) => a === b);
  if (sameStore && differ) refuse(`${L.file}: ${differ} line(s) state row counts that are not this store's, and the store is the version the list was read from (${listedAt}); first: ${JSON.stringify(differing[0])}`);
  if (sameStore && !countsAgree) refuse(`${m}: rows holding a close are ${JSON.stringify(counts)} (here, the corpus lane's receipt) and the store is the version the list was read from (${listedAt})`);
  const noted = [...L.lines.values()].filter((l) => l.note);
  sources[m] = { key: L.key, label: L.label, list: { file: `reader/data/made-spaces-v1/${L.file}`, sha256: L.sha256, lines: L.lines.size,
      lines_with_a_close: [...L.lines.values()].filter((l) => l.closes.length).length, lines_no_row_serves: unserved,
      made_spaces_kept: [...L.lines.values()].reduce((a, l) => a + (l.kept || []).length, 0), lines_with_a_note: noted.length },
    ...t,
    against_the_list: { lines_whose_row_counts_are_the_stores: agree, lines_whose_row_counts_differ: differ, ...(differ ? { first_differing: differing } : {}) },
    against_the_corpus_lanes_receipt: { rows_with_a_close_here_and_there: counts, agree: countsAgree } };
  console.log(`  ${m.padEnd(4)} ${L.key.padEnd(26)} rows ${String(t.rows).padStart(6)} · a close on the route text ${String(t.rows_with_a_close_on_the_route_text).padStart(6)} · on the definition text ${String(t.rows_with_a_close_on_the_definition_text).padStart(6)} · on either ${String(t.rows_with_a_close_on_either).padStart(6)} · ${n(t.closes_on_route_texts)} and ${n(t.closes_on_definition_texts)} closes · divided by a ledger too ${t.rows_a_ledger_divides_with_a_close_on_the_route_text} (${t.closes_that_stand_at_a_ledgers_cut} closes at a cut) · list lines ${L.lines.size} (${agree} with the store's row counts, ${differ} not; ${unserved} no row serves) · moved ${t.rows_moved}`);
}
const sum = (f) => Object.values(sources).reduce((a, s) => a + s[f], 0);
const totals = { sources: LISTED.size, rows_of_listed_sources: sum("rows"), rows_carrying_the_slot: sum("rows_with_a_close_on_either"),
  rows_with_a_close_on_the_route_text: sum("rows_with_a_close_on_the_route_text"), rows_with_a_close_on_the_definition_text: sum("rows_with_a_close_on_the_definition_text"),
  closes_on_route_texts: sum("closes_on_route_texts"), closes_on_definition_texts: sum("closes_on_definition_texts"),
  span_store_rows_of_listed_sources: spanRows, span_store_rows_with_a_close: 0 };
const moved = sum("rows_moved");
console.log(`made spaces · ${LISTED.size} sources · ${n(totals.rows_of_listed_sources)} rows · ${n(totals.rows_carrying_the_slot)} carry the slot (${n(totals.rows_with_a_close_on_the_route_text)} close on the route text, ${n(totals.rows_with_a_close_on_the_definition_text)} on the definition text) · ${n(moved)} rows move (${touched.length} shards) · the span store's ${n(spanRows)} rows of these sources hold no close · the store is ${sameStore ? "" : "not "}the version the lists were read from (${listedAt})`);
if (DRY) { console.log("dry run — nothing written"); process.exit(0); }
const lists = [...LISTED.entries()].map(([m, L]) => ({ m, key: L.key, file: `reader/data/made-spaces-v1/${L.file}`, sha256: L.sha256 }));
if (!moved && index.made_spaces && same(index.made_spaces.lists, lists)) { console.log("nothing moves and the index names these lists — nothing written"); process.exit(0); }

// ---- write: the index, the receipt -------------------------------------------------------------
const on = new Date().toISOString();
const digest = createHash("sha256");
// the shards' weight on disk, which the index states (counts.shard_bytes_total; check-route-store-exact-k L10): a slot
// written into a row moves its shard's bytes, so the total is taken again from the shards as they now stand
let shardBytes = 0;
for (const name of shardNames) { const b = readFileSync(join(STORE, "shards", name)); digest.update(b); shardBytes += b.length; }
const was = index.store_version || null, now = digest.digest("hex").slice(0, 12);
const WHAT = "a row of a source the corpus lane's made-spaces lists name carries, in slot 9, the places of its route text and of its definition text that close at print ([the route text's or null, the definition text's or null], UTF-16 units from 0), where its text is a line of its source's list with a close; the texts themselves are the served bytes, unchanged, and a reader takes the characters at those places out when it prints, after the ledger's division; a row with no close carries no such slot";
index.made_spaces = { rule_id: MADE_SPACES_RULE_ID, applied_on: on, applied_by: "tools/apply-made-spaces-v1.mjs",
  pin: "reader/data/made-spaces-v1/PIN.json", relay: pin.relay, from: pin.from, rule: "reader/data/made-spaces-v1/RULE.md",
  lists, lists_read_from_store_version: listedAt, store_version_before: was, store_version: now, what: WHAT, totals };
index.counts = { ...(index.counts || {}), shard_bytes_total: shardBytes };
if (now !== was) { index.store_version = now; index.store_version_history = [...(index.store_version_history || []), { was, now, why: MADE_SPACES_RULE_ID, on }]; }
writeFileSync(join(STORE, "index.json"), JSON.stringify(index, null, 1));
const prior = existsSync(RECEIPT) ? JSON.parse(readFileSync(RECEIPT, "utf8")) : null;
writeFileSync(RECEIPT, JSON.stringify({ schema_version: "MADE_SPACES_RECEIPT_V1", rule_id: MADE_SPACES_RULE_ID, what: WHAT,
  pin: { file: "reader/data/made-spaces-v1/PIN.json", relay: pin.relay, letter: pin.letter, from: pin.from },
  runs: [...((prior && prior.runs) || []), { ran_at: on, store_version: { was, now }, lists_read_from_store_version: listedAt, the_store_was_that_version: sameStore, shards_rewritten: touched.length, rows_moved: moved, totals, sources }] }, null, 1) + "\n");
console.log(`written · store ${was} -> ${now}${now === was ? " (no shard moved)" : ""} · shards weigh ${n(shardBytes)} bytes · index.made_spaces names ${LISTED.size} lists · receipt ${RECEIPT}`);
