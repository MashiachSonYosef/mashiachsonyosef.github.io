#!/usr/bin/env node
// GUARDS: names-gate-rule-v1-a-row-its-own-source-gives-as-a-name-is-withheld-where-the-word-on-the-page-is-not-a-name
// LEDGER: M
// it marks, on the rows whose own source gives every entry of theirs as a
// name (M), that they are a name's. No row is judged here and no text is
// changed.
//
// «BARA» STOOD ON THE CARD OF THE VERB "HE CREATED": a man's name, found in
// one inscription and in no verse, pointed as the verb is and carrying no
// Strong's number, so neither the pointing nor the entry gate parts it. Its
// own source says what it is: Classical Hebrew Words gives each record a
// part of speech, and this one's is a name. The corpus lane read that out of
// the six sources that mark a name (relay v177, 13 November 2026 AD:
// name-rows-v1.jsonl, 7,412 served rows whose every entry is marked a name
// in its own source; its rule stands in data/names/names-v1/RULE.md), and
// listed beside them the places of the thirty-nine books that are a name
// (place-names-v1.jsonl: where TAHOT's grammar or MACULA's type says so).
// The owner ruled the gate (13 November: «1-3. ok agree», ruling 8): at a
// place that is not a name, a row its source gives as a name is withheld
// and counted; at a place that is a name, it stands.
//
// This tool writes the rows' half onto the store: a listed row carries
// name: 1 in its facts slot (tools/gloss-store-v1.mjs, FACTS_SLOT). A row
// is found by its key, its rank, its m id and the first 16 hex of the
// sha256 of its route text together, as the list tells rows apart. The
// places' half is projected onto each word by the lattice projector.
// NOTHING IN A TEXT IS CHANGED.
//
// REFUSED, each in words and with nothing written:
//   - a list, rule or receipt that is not the bytes its pin names;
//   - a line that names no key, rank, m id or hash, or a row listed twice;
//   - a line whose source the store does not hold;
//   - a line that finds no row, or finds more rows than one: the list was
//     read from this store's rows. After rows are struck, landed or moved,
//     --the-store-has-moved-on lets the run go on, marks the lines that
//     still find their row, and records how many did not.
//
// Idempotent: a second run moves nothing and writes nothing. --dry prints
// and writes nothing.
// Usage: node tools/apply-name-rows-v1.mjs [--dry] [--the-store-has-moved-on]
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync, gzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { factsOf, setFacts } from "./gloss-store-v1.mjs";
import { NAMES_GATE_RULE_ID } from "./names-gate-v1.mjs";
import { readPinned, readPinnedLines, PinFault } from "./pinned-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > 0 ? process.argv[i + 1] : d; };
const DRY = process.argv.includes("--dry"), MOVED_ON = process.argv.includes("--the-store-has-moved-on");
const STORE = arg("store", join(K3, "data", "route-store"));
const PINS = arg("pin", join(K3, "data", "names"));
const RECEIPT = arg("receipt", join(K3, "data", "name-rows-receipt-v1.json"));
const HOME = "reader/data/names";
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const refuse = (why) => { console.error(`REFUSED · ${why}`); process.exit(1); };
const n = (x) => Number(x).toLocaleString("en-US");
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ---- the list, as the corpus lane wrote it ----------------------------------------------
let pin, lines, theirs;
try {
  pin = JSON.parse(readFileSync(join(PINS, "PIN.json"), "utf8"));
  if (pin.schema_version !== "NAMES_PIN_V1" || !pin.name_rows) throw new PinFault(`the pin names no list of name rows (${join(PINS, "PIN.json")})`);
  readPinned(join(PINS, pin.folder, pin.rule.file), pin.rule, `${pin.folder}/${pin.rule.file}`);
  theirs = JSON.parse(readPinned(join(PINS, pin.folder, pin.receipt.file), pin.receipt, `${pin.folder}/${pin.receipt.file}`).toString("utf8"));
  lines = readPinnedLines(join(PINS, pin.folder, pin.name_rows.file), pin.name_rows, `${pin.folder}/${pin.name_rows.file}`);
} catch (e) { if (e instanceof PinFault) refuse(e.message); throw e; }
const index = JSON.parse(readFileSync(join(STORE, "index.json"), "utf8"));
const readAt = (((theirs.inputs || {}).route_store || {}).store_version) || null;
const listed = new Map();   // key -> Map(rank m sha16 -> the line)
const bySource = {};
lines.forEach((l, at) => {
  const where = `${pin.name_rows.file} line ${at + 1}`;
  if (typeof l.k !== "string" || !Number.isInteger(l.rank) || typeof l.m !== "string" || !/^[0-9a-f]{16}$/u.test(String(l.sha))) refuse(`${where} names no key, rank, m id or hash`);
  if (!(index.m_sources || {})[l.m]) refuse(`${where} names a row of ${l.m}, and the store holds no such source`);
  const rows = listed.get(l.k) || listed.set(l.k, new Map()).get(l.k);
  const id = `${l.rank} ${l.m} ${l.sha}`;
  if (rows.has(id)) refuse(`${where} names a row an earlier line names (${l.k}, ${id})`);
  rows.set(id, { met: 0 });
  bySource[l.m] = bySource[l.m] || { key: index.m_sources[l.m].key, listed: 0, marked: 0, moved: 0 };
  bySource[l.m].listed += 1;
});

// ---- every row of the store, read first and written only when every line has found its row ---
const shardNames = readdirSync(join(STORE, "shards")).filter((f) => f.endsWith(".bin")).sort();
let touched = [], storeRows = 0, twice = [];
const walk = (write) => {
  touched = []; storeRows = 0; twice = [];
  for (const rows of listed.values()) for (const x of rows.values()) x.met = 0;
  for (const s of Object.values(bySource)) { s.marked = 0; s.moved = 0; }
  for (const name of shardNames) {
    const path = join(STORE, "shards", name);
    const body = JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"));
    let moved = 0;
    for (const [k, rows] of Object.entries(body)) {
      const mine = listed.get(k) || null;
      for (const row of rows) {
        storeRows += 1;
        const m = String(row[3]);
        const line = mine ? mine.get(`${row[0]} ${m} ${sha256(Buffer.from(String(row[1] ?? ""), "utf8")).slice(0, 16)}`) : null;
        if (line) { line.met += 1; if (line.met > 1 && twice.length < 6) twice.push(`${name} ${k} (${m}, rank ${row[0]})`); bySource[m].marked += 1; }
        const has = !!(factsOf(row) || {}).name;
        if (has === !!line) continue;
        moved += 1;
        (bySource[m] ||= { key: (index.m_sources[m] || {}).key, listed: 0, marked: 0, moved: 0 }).moved += 1;
        if (write) setFacts(row, { name: line ? 1 : null });
      }
    }
    if (moved) { touched.push(name); if (write) writeFileSync(path, gzipSync(Buffer.from(JSON.stringify(body)), { level: 9 })); }
  }
};
walk(false);
let unmet = 0; const firstUnmet = [];
for (const [k, rows] of listed) for (const [id, x] of rows) if (!x.met) { unmet += 1; if (firstUnmet.length < 6) firstUnmet.push(`${k} (${id})`); }
const sum = (f) => Object.values(bySource).reduce((a, s) => a + s[f], 0);
for (const [m, s] of Object.entries(bySource).sort((a, b) => b[1].listed - a[1].listed)) console.log(`  ${m.padEnd(5)} ${String(s.key).slice(0, 44).padEnd(44)} listed ${String(s.listed).padStart(5)} · marked ${String(s.marked).padStart(5)} · moved ${s.moved}`);
const totals = { sources: Object.values(bySource).filter((s) => s.listed).length, rows_listed: lines.length, rows_marked: sum("marked"), lines_that_find_no_row: unmet, lines_that_find_more_than_one_row: twice.length };
const moved = sum("moved"), shardsRewritten = touched.length;
console.log(`name rows · relay ${pin.relay} · ${n(lines.length)} rows listed (read from the store at ${readAt}) · ${n(totals.rows_marked)} marked in the store of ${n(storeRows)} · ${unmet} lines find no row, ${twice.length} find more than one · ${n(moved)} rows move (${shardsRewritten} shards)`);
if ((unmet || twice.length) && !MOVED_ON) refuse(`${unmet} line(s) find no row${firstUnmet.length ? ` (first: ${firstUnmet[0]})` : ""} and ${twice.length} find more than one${twice.length ? ` (first: ${twice[0]})` : ""}. The list was read from the store at ${readAt}. If rows have been struck, landed or moved since, say --the-store-has-moved-on`);
if (DRY) { console.log("dry run — nothing written"); process.exit(0); }
const record = { pin: `${HOME}/PIN.json`, relay: pin.relay, letter: pin.letter, from: pin.from, rule: `${HOME}/${pin.folder}/${pin.rule.file}`, receipt: `${HOME}/${pin.folder}/${pin.receipt.file}`,
  name_rows: { file: `${HOME}/${pin.folder}/${pin.name_rows.file}`, sha256: pin.name_rows.sha256, lines: pin.name_rows.lines }, read_at_store_version: readAt, totals };
const had = index.name_rows || null;
if (!moved && had && Object.keys(record).every((k) => same(had[k], record[k]))) { console.log("nothing moves and the index names this list — nothing written"); process.exit(0); }
const sources = JSON.parse(JSON.stringify(bySource));
if (moved) walk(true);

// ---- write: the index, the receipt -------------------------------------------------------------
const on = new Date().toISOString();
const digest = createHash("sha256");
let shardBytes = 0;
for (const name of shardNames) { const b = readFileSync(join(STORE, "shards", name)); digest.update(b); shardBytes += b.length; }
const was = index.store_version || null, now = digest.digest("hex").slice(0, 12);
const WHAT = "a row the corpus lane's list of name rows names carries name: 1 in the facts slot (slot 10, an object): every entry its own source gives it is marked a name there. The texts are the served bytes, unchanged. At a place that is not a name such a row is withheld and counted; at a place that is a name it stands";
const lastMove = now !== was || !had ? { store_version_before: was, store_version: now } : { store_version_before: had.store_version_before, store_version: had.store_version };
index.name_rows = { rule_id: NAMES_GATE_RULE_ID, applied_on: on, applied_by: "tools/apply-name-rows-v1.mjs", ...record, ...lastMove, what: WHAT };
index.counts = { ...(index.counts || {}), shard_bytes_total: shardBytes };
if (now !== was) { index.store_version = now; index.store_version_history = [...(index.store_version_history || []), { was, now, why: NAMES_GATE_RULE_ID, on }]; }
writeFileSync(join(STORE, "index.json"), JSON.stringify(index, null, 1));
const prior = existsSync(RECEIPT) ? JSON.parse(readFileSync(RECEIPT, "utf8")) : null;
writeFileSync(RECEIPT, JSON.stringify({ schema_version: "NAME_ROWS_RECEIPT_V1", rule_id: NAMES_GATE_RULE_ID, what: WHAT, pin: { file: `${HOME}/PIN.json`, relay: pin.relay, letter: pin.letter },
  runs: [...((prior && prior.runs) || []), { ran_at: on, store_version: { was, now }, the_store_was_said_to_have_moved_on: MOVED_ON, shards_rewritten: shardsRewritten, rows_moved: moved, totals, sources }] }, null, 1) + "\n");
console.log(`written · store ${was} -> ${now}${now === was ? " (no shard moved)" : ""} · shards weigh ${n(shardBytes)} bytes · index.name_rows names the list · receipt ${RECEIPT}`);
