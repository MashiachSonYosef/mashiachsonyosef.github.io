#!/usr/bin/env node
// GUARDS: entry-gate-rule-v1-a-row-of-another-entry-than-the-words-is-withheld-and-a-row-of-its-own-entry-stands-whatever-its-points
// LEDGER: M
// it writes, on the rows of the sources that name their entries (M), the
// entry each row belongs to as its own source says it. No entry is decided
// here and no text is changed.
//
// «FIELD» STOOD ON THE CARD OF THE VERB THAT MEANS "HE CREATED", because the
// store keys a row by its bare letters and three words share those. Every
// source that numbers its entries knows which word a row is: Strong's by its
// number, BDB by its own entry and the number beside it, TAHOT by the tag it
// gives the word at every place. The corpus lane read that out of each
// source, row by row (relay v172, 13 November 2026 AD: the row entries
// ledger, 382,258 rows of fifteen sources; its rule stands in
// data/row-entries/row-entries-v1/RULE.md), and the lattice already says
// which entry stands at each place (the tag on the word's core piece). With
// both, a row of another entry can be told from a row of the word's own, and
// the owner ruled that it be (13 November: «1-5. agree go ahead», ruling 1,
// and «1-3. ok agree», ruling 6: the gate with its two further partings).
//
// This tool writes the ledger onto the rows. NOTHING IN A TEXT IS CHANGED.
// What is written is one more slot, an object (tools/gloss-store-v1.mjs,
// FACTS_SLOT), holding for a row with a line in the ledger:
//
//   n  its Strong's numbers, as the ledger gives them ("H1254"), where it
//      has any: the gate itself reads these;
//   t  for a row of a source the ruling's first parting reads (STEP's own
//      tags: the pin names the sources), those of its entries that carry
//      STEP's letter, the leading noughts of the number taken off as the
//      lane's own measure takes them ("H1254A");
//   b  for a row of a source the second parting reads (BDB's own entries),
//      those entries as the source names them ("b.cw.aa").
//
// A row with no number and neither of the others carries nothing: the gate
// leaves it as it is. A row is found by its key, its rank, its m id and the
// first 16 hex of the sha256 of its route text together, as the ledger tells
// rows apart; where the store holds one row twice the ledger lists it twice.
//
// The ledger is 25 MB and is kept on the corpus lane's store, not in this
// tree: it is named on the command line and read only if it is the bytes the
// pin names (data/row-entries/PIN.json). Its rule and its receipt are kept
// here.
//
// REFUSED, each in words and with nothing written:
//   - a ledger, rule or receipt that is not the bytes its pin names;
//   - a ledger row of a source the store does not hold under that m id, or a
//     pinned parting that names a source the store names otherwise;
//   - a row of the store with no line, or a line with no row, among the
//     ledger's sources: the ledger was read from this store's rows, and
//     while they are those rows every one has its line. After a row is
//     struck, landed or moved the store has rows the ledger never read;
//     --the-store-has-moved-on lets the run go on, writes the lines that
//     still find their row, and records how many did not;
//   - a row that carries facts of this tool's and has no line.
//
// Idempotent: a second run moves nothing and writes nothing. --dry prints
// and writes nothing.
// Usage: node tools/apply-row-entries-v1.mjs --ledger <row-entries-v1.jsonl> [--dry] [--the-store-has-moved-on]
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync, gzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { factsOf, setFacts } from "./gloss-store-v1.mjs";
import { ENTRY_GATE_RULE_ID, letteredOf } from "./entry-gate-v1.mjs";
import { readPinned, readPinnedLines, PinFault } from "./pinned-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > 0 ? process.argv[i + 1] : d; };
const DRY = process.argv.includes("--dry"), MOVED_ON = process.argv.includes("--the-store-has-moved-on");
const STORE = arg("store", join(K3, "data", "route-store"));
const PINS = arg("pin", join(K3, "data", "row-entries"));
const LEDGER = arg("ledger", null);
const RECEIPT = arg("receipt", join(K3, "data", "row-entries-receipt-v1.json"));
const HOME = "reader/data/row-entries";
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const refuse = (why) => { console.error(`REFUSED · ${why}`); process.exit(1); };
const n = (x) => Number(x).toLocaleString("en-US");
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
if (!LEDGER) refuse("the ledger is not in this tree and has to be named: --ledger <row-entries-v1.jsonl>");

// ---- the ledger, as the corpus lane wrote it --------------------------------------------
let pin, lines, theirs;
try {
  pin = JSON.parse(readFileSync(join(PINS, "PIN.json"), "utf8"));
  if (pin.schema_version !== "ROW_ENTRIES_PIN_V1" || !pin.ledger) throw new PinFault(`the pin names no ledger (${join(PINS, "PIN.json")})`);
  readPinned(join(PINS, pin.folder, pin.rule.file), pin.rule, `${pin.folder}/${pin.rule.file}`);
  theirs = JSON.parse(readPinned(join(PINS, pin.folder, pin.receipt.file), pin.receipt, `${pin.folder}/${pin.receipt.file}`).toString("utf8"));
  lines = readPinnedLines(LEDGER, pin.ledger, pin.ledger.file);
} catch (e) { if (e instanceof PinFault) refuse(e.message); throw e; }
const index = JSON.parse(readFileSync(join(STORE, "index.json"), "utf8"));
const readAt = (((theirs.inputs || {}).route_store || {}).store_version) || null;
// the partings' sources, from the pin (which cites the ruling that names them): m id -> the fact its rows carry
const FACT_OF = new Map();
for (const p of pin.partings || []) {
  if (!["t", "b"].includes(p.fact)) refuse(`the pin's parting "${p.name}" asks for the fact "${p.fact}", which this tool does not write`);
  for (const [m, key] of Object.entries(p.sources || {})) {
    const mine = (index.m_sources || {})[m];
    if (!mine || mine.key !== key) refuse(`the pin's parting "${p.name}" reads ${m} as ${key}, and the store holds ${mine ? mine.key : "no source"} under ${m}`);
    FACT_OF.set(m, p.fact);
  }
}

// what a ledger row gives its store row: the facts, or null where it gives none
const tally = {};
const of = (m) => (tally[m] ||= { ledger_rows: 0, store_rows: 0, rows_with_a_number: 0, rows_with_several_numbers: 0, rows_with_no_number: 0, rows_carrying_steps_letters: 0, rows_carrying_bdbs_entries: 0, rows_carrying_the_slot: 0, rows_moved: 0 });
const factsFor = (m, entries, numbers) => {
  const f = {};
  if (numbers.length) f.n = numbers;
  const kind = FACT_OF.get(m);
  if (kind === "t") { const t = [...new Set(entries.map((e) => letteredOf(Array.isArray(e) ? e[0] : e)).filter(Boolean))]; if (t.length) f.t = t; }
  if (kind === "b" && entries.length) f.b = entries.map(String);
  return Object.keys(f).length ? f : null;
};
const ledger = new Map();   // key -> Map(rank m sha16 -> [facts, ...], one per time the ledger lists the row)
const SOURCES = new Set();
let ledgerRows = 0;
for (const x of lines) {
  if (typeof x.k !== "string" || !Array.isArray(x.rows)) refuse("a line of the ledger names no key or no rows");
  if (ledger.has(x.k)) refuse(`the ledger names the key «${x.k}» twice`);
  const rows = new Map();
  for (const r of x.rows) {
    if (!Array.isArray(r) || r.length !== 6 || !Array.isArray(r[4]) || !Array.isArray(r[5])) refuse(`a row under «${x.k}» is not the ledger's six slots`);
    const [rank, m, sha, , entries, numbers] = r;
    if (!(index.m_sources || {})[m]) refuse(`the ledger names a row of ${m} under «${x.k}», and the store holds no such source`);
    if (numbers.some((y) => !/^H[1-9]\d*$/u.test(y))) refuse(`a row of ${m} under «${x.k}» carries a number that is not H and digits: ${JSON.stringify(numbers)}`);
    SOURCES.add(m); ledgerRows += 1;
    const t = of(m); t.ledger_rows += 1;
    const id = `${rank} ${m} ${sha}`;
    (rows.get(id) || rows.set(id, []).get(id)).push(factsFor(m, entries, numbers));
  }
  ledger.set(x.k, rows);
}

// ---- every row of the store ----------------------------------------------------------------
const MINE = ["n", "t", "b"];   // the facts this tool writes and no other does
const mineOf = (row) => { const f = factsOf(row); if (!f) return null; const out = {}; for (const k of MINE) if (k in f) out[k] = f[k]; return Object.keys(out).length ? out : null; };
const shardNames = readdirSync(join(STORE, "shards")).filter((f) => f.endsWith(".bin")).sort();
let touched = [], noLine = [], unlistedWithFacts = [];
let storeRows = 0, linesMet = 0;
// The walk, made twice: once reading only, so that nothing is written until every row has been matched to its line,
// and once more writing. A row the store holds twice takes the ledger's lines for it in order, one each.
const walk = (write) => {
  touched = []; noLine = []; unlistedWithFacts = []; storeRows = 0; linesMet = 0;
  for (const t of Object.values(tally)) for (const k of Object.keys(t)) if (k !== "ledger_rows") t[k] = 0;
  const taken = new Map();   // key, then the row's id -> how many of the ledger's lines for it are taken
  for (const name of shardNames) {
    const path = join(STORE, "shards", name);
    const body = JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"));
    let moved = 0;
    for (const [k, rows] of Object.entries(body)) {
      const mine = ledger.get(k) || null;
      for (const row of rows) {
        storeRows += 1;
        const m = String(row[3]);
        const has = mineOf(row);
        if (!SOURCES.has(m)) { if (has) unlistedWithFacts.push(`${name} ${k} (${m}, rank ${row[0]})`); continue; }
        const t = of(m); t.store_rows += 1;
        const id = `${row[0]} ${m} ${sha256(Buffer.from(String(row[1] ?? ""), "utf8")).slice(0, 16)}`;
        const list = mine ? mine.get(id) : null;
        const at = taken.get(`${k}\u0001${id}`) || 0;
        const met = !!list && at < list.length;
        const want = met ? list[at] : null;
        if (met) { taken.set(`${k}\u0001${id}`, at + 1); linesMet += 1; }
        else { if (noLine.length < 12) noLine.push(`${name} ${k} (${m}, rank ${row[0]}) «${String(row[1]).slice(0, 50)}»`); t.rows_with_no_line = (t.rows_with_no_line || 0) + 1; }
        if (met) { if (want && want.n) { t.rows_with_a_number += 1; if (want.n.length > 1) t.rows_with_several_numbers += 1; } else t.rows_with_no_number += 1; }
        if (want) {
          if (want.t) t.rows_carrying_steps_letters += 1;
          if (want.b) t.rows_carrying_bdbs_entries += 1;
          t.rows_carrying_the_slot += 1;
        }
        if (same(has, want)) continue;
        t.rows_moved += 1; moved += 1;
        if (write) setFacts(row, Object.fromEntries(MINE.map((key) => [key, want && key in want ? want[key] : null])));
      }
    }
    if (moved) { touched.push(name); if (write) writeFileSync(path, gzipSync(Buffer.from(JSON.stringify(body)), { level: 9 })); }
  }
};
walk(false);
if (unlistedWithFacts.length) refuse(`${unlistedWithFacts.length} row(s) of a source the ledger does not read carry this tool's facts; first: ${unlistedWithFacts[0]}`);
const sum = (f) => Object.values(tally).reduce((a, s) => a + (s[f] || 0), 0);
const rowsWithNoLine = sum("rows_with_no_line"), linesWithNoRow = ledgerRows - linesMet;
for (const [m, t] of Object.entries(tally).sort((a, b) => b[1].ledger_rows - a[1].ledger_rows))
  console.log(`  ${m.padEnd(5)} ${String((index.m_sources[m] || {}).key).slice(0, 44).padEnd(44)} ledger ${String(t.ledger_rows).padStart(7)} · store ${String(t.store_rows).padStart(7)} · a number ${String(t.rows_with_a_number).padStart(7)} (several ${t.rows_with_several_numbers}) · none ${String(t.rows_with_no_number).padStart(5)}${t.rows_carrying_steps_letters ? ` · STEP's letters ${t.rows_carrying_steps_letters}` : ""}${t.rows_carrying_bdbs_entries ? ` · BDB's entries ${t.rows_carrying_bdbs_entries}` : ""} · carry the slot ${String(t.rows_carrying_the_slot).padStart(7)} · moved ${t.rows_moved}${t.rows_with_no_line ? ` · NO LINE ${t.rows_with_no_line}` : ""}`);
const totals = { sources: SOURCES.size, keys_in_the_ledger: ledger.size, rows_in_the_ledger: ledgerRows, store_rows_of_those_sources: sum("store_rows"), rows_carrying_the_slot: sum("rows_carrying_the_slot"),
  rows_with_a_number: sum("rows_with_a_number"), rows_with_several_numbers: sum("rows_with_several_numbers"), rows_with_no_number: sum("rows_with_no_number"),
  rows_carrying_steps_letters: sum("rows_carrying_steps_letters"), rows_carrying_bdbs_entries: sum("rows_carrying_bdbs_entries"),
  store_rows_with_no_line: rowsWithNoLine, ledger_rows_with_no_store_row: linesWithNoRow };
const moved = sum("rows_moved"), shardsRewritten = touched.length;
console.log(`row entries · relay ${pin.relay} · ${n(ledgerRows)} rows of ${SOURCES.size} sources in the ledger (read from the store at ${readAt}) · ${n(totals.store_rows_of_those_sources)} rows of them in the store of ${n(storeRows)} · ${n(totals.rows_carrying_the_slot)} carry the slot (${n(totals.rows_with_a_number)} with a number, ${n(totals.rows_carrying_steps_letters)} with STEP's letters, ${n(totals.rows_carrying_bdbs_entries)} with BDB's entries) · ${n(rowsWithNoLine)} store rows with no line, ${n(linesWithNoRow)} lines with no store row · ${n(moved)} rows move (${touched.length} shards)`);
if ((rowsWithNoLine || linesWithNoRow) && !MOVED_ON) refuse(`${rowsWithNoLine} row(s) of the ledger's sources have no line and ${linesWithNoRow} line(s) have no row; first without a line: ${noLine[0] || "none"}. The ledger was read from the store at ${readAt}. If rows have been struck, landed or moved since, say --the-store-has-moved-on`);
if (DRY) { console.log("dry run — nothing written"); process.exit(0); }
const record = { pin: `${HOME}/PIN.json`, relay: pin.relay, letter: pin.letter, from: pin.from, rule: `${HOME}/${pin.folder}/${pin.rule.file}`, receipt: `${HOME}/${pin.folder}/${pin.receipt.file}`,
  ledger: { file: pin.ledger.file, bytes: pin.ledger.bytes, sha256: pin.ledger.sha256, lines: pin.ledger.lines, kept: pin.ledger.kept }, read_at_store_version: readAt,
  partings: (pin.partings || []).map((p) => ({ name: p.name, fact: p.fact, sources: p.sources })), totals };
const had = index.row_entries || null;
if (!moved && had && Object.keys(record).every((k) => same(had[k], record[k]))) { console.log("nothing moves and the index names this ledger — nothing written"); process.exit(0); }
const sources = JSON.parse(JSON.stringify(tally));   // the counts of the reading walk, which the receipt keeps: the writing walk finds nothing left to move
if (moved) walk(true);

// ---- write: the index, the receipt -------------------------------------------------------------
const on = new Date().toISOString();
const digest = createHash("sha256");
let shardBytes = 0;
for (const name of shardNames) { const b = readFileSync(join(STORE, "shards", name)); digest.update(b); shardBytes += b.length; }
const was = index.store_version || null, now = digest.digest("hex").slice(0, 12);
const WHAT = "a row with a line in the corpus lane's row entries ledger carries, in the facts slot (slot 10, an object), n: the Strong's numbers of the entries its own source files it under, where it has any; t: for a row of a source whose entries are STEP's own tags, those that carry STEP's letter; b: for a row of a source that names BDB's own entries, those entries. The texts are the served bytes, unchanged. At a place the gate reads these against the tag of the word's core piece";
const lastMove = now !== was || !had ? { store_version_before: was, store_version: now } : { store_version_before: had.store_version_before, store_version: had.store_version };
index.row_entries = { rule_id: ENTRY_GATE_RULE_ID, applied_on: on, applied_by: "tools/apply-row-entries-v1.mjs", ...record, ...lastMove, what: WHAT };
index.counts = { ...(index.counts || {}), shard_bytes_total: shardBytes };
if (now !== was) { index.store_version = now; index.store_version_history = [...(index.store_version_history || []), { was, now, why: ENTRY_GATE_RULE_ID, on }]; }
writeFileSync(join(STORE, "index.json"), JSON.stringify(index, null, 1));
const prior = existsSync(RECEIPT) ? JSON.parse(readFileSync(RECEIPT, "utf8")) : null;
writeFileSync(RECEIPT, JSON.stringify({ schema_version: "ROW_ENTRIES_RECEIPT_V1", rule_id: ENTRY_GATE_RULE_ID, what: WHAT, pin: { file: `${HOME}/PIN.json`, relay: pin.relay, letter: pin.letter },
  runs: [...((prior && prior.runs) || []), { ran_at: on, store_version: { was, now }, the_store_was_said_to_have_moved_on: MOVED_ON, shards_rewritten: shardsRewritten, rows_moved: moved, totals, sources }] }, null, 1) + "\n");
console.log(`written · store ${was} -> ${now}${now === was ? " (no shard moved)" : ""} · shards weigh ${n(shardBytes)} bytes · index.row_entries names the ledger · receipt ${RECEIPT}`);
