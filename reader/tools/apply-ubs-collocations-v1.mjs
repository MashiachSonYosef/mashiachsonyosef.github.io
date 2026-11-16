#!/usr/bin/env node
// GUARDS: ubs-collocations-rule-v1-a-row-carries-the-collocations-its-ubs-meanings-name-and-the-places-ubs-own-pick-names-it
// LEDGER: M
// it marks, on the rows of the UBS dictionary (M) of the category
// tools/derive-ubs-collocations-v1.mjs derives, the collocations UBS's own
// meanings name and the places UBS's own default pick names the row. No row
// is judged here and no text is changed.
//
// UBS'S OWN COLLOCATION MARK RIDES ON THE ROW. The record of dictionary kinds
// (data/dictionary-kinds-v1.json, its entry ubs-collocation) rests shut, on
// the thirty-nine books, a row of the UBS dictionary that carries the fact
// collocations, but at the places its fact picked_at names: there UBS's own
// pick names the row, and the card keeps it at rest (question 10, taken). The
// list of the category, with both facts for each row, is derived from UBS's
// own file, the catalog's route file and the default picks ledger, and pinned
// (data/ubs-collocations/PIN.json, made_here.list and made_here.receipt); this
// tool lays it on the store, in the facts slot (tools/gloss-store-v1.mjs,
// FACTS_SLOT): collocations, the list's own, byte for byte; picked_at, its
// places, where it has any (a row no pick names carries no picked_at, and
// rests shut everywhere). A row of the store that carries either fact and is
// not on the list has it taken off. NOTHING IN A TEXT IS CHANGED.
//
// A row is found by its key, its rank, its m id and the first 16 hex of the
// sha256 of its route text together, as the list names it, followed through
// the row-strikes record (tools/row-strikes-follow-v1.mjs) from the store the
// list was derived on (its receipt names that version): a row a round moved
// since is found where it went, and keeps its marks; one a round struck or
// withheld since is expected to find none and is counted by the list that
// took it. When the corpus lane sends UBS's own categories per row (Ask 2 of
// the letter of 15 November 2026), its list replaces the derived one under
// this same tool.
//
// REFUSED, each in words and with nothing written:
//   - the list or its receipt is not the bytes the pin names;
//   - a line that names no key, rank, m id or hash, a row listed twice, a
//     line with no collocation or a place that is not "<book slug>
//     <chapter>:<verse>:<word>", or a line of another source than the UBS
//     dictionary's;
//   - a store the record cannot be followed to from the version the list was
//     derived on;
//   - a line that finds no row and that no round struck or withheld since,
//     a line that finds more rows than one, or a row it finds that carries a
//     name fact (the category holds no name row): the record does not
//     explain it, and nothing is guessed.
//
// Idempotent: a second run moves nothing and writes nothing. --dry prints and
// writes nothing. --on gives the moment the run is recorded under
// (tools/step-moment-v1.mjs); with none it is the clock's. The summary ends in
// one line of its figures as JSON (`figures {...}`), dry or not. It records
// itself under its own key of the store's index, ubs_collocations, and in
// data/ubs-collocations-receipt-v1.json.
//
// Usage: node tools/apply-ubs-collocations-v1.mjs [--store data/route-store] [--on <moment>] [--dry]
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync, gzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { factsOf, setFacts, FACTS_WRITTEN_BY } from "./gloss-store-v1.mjs";
import { readPinned, readPinnedLines, PinFault } from "./pinned-v1.mjs";
import { openFollower, followedRecord, followedSaid, sha16Of, FollowFault } from "./row-strikes-follow-v1.mjs";
import { givenMoment, momentOf } from "./step-moment-v1.mjs";

export const UBS_COLLOCATIONS_RULE_ID = "ubs-collocations-rule-v1-a-row-carries-the-collocations-its-ubs-meanings-name-and-the-places-ubs-own-pick-names-it";
// the key of the store's index this tool records itself under, as the facts slot names it for both its facts
const INDEX_KEY = "ubs_collocations";
const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > 0 ? process.argv[i + 1] : d; };
const DRY = process.argv.includes("--dry");
const STORE = arg("store", join(K3, "data", "route-store"));
const PINS = join(K3, "data", "ubs-collocations");
const RECEIPT = arg("receipt", join(K3, "data", "ubs-collocations-receipt-v1.json"));
const HOME = "reader/data/ubs-collocations";
const refuse = (why) => { console.error(`REFUSED · ${why}`); process.exit(1); };
const n = (x) => Number(x).toLocaleString("en-US");
const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
for (const f of ["collocations", "picked_at"]) if (FACTS_WRITTEN_BY[f] !== INDEX_KEY) refuse(`the facts slot names ${FACTS_WRITTEN_BY[f] || "no tool"} as the writer of ${f}, not ${INDEX_KEY}`);
let GIVEN_ON = null;
try { GIVEN_ON = givenMoment(); } catch (e) { refuse(e.message); }
const following = (ask) => { try { return ask(); } catch (e) { if (e instanceof FollowFault) refuse(e.message); throw e; } };
const PLACE = /^[a-z0-9]+(-[a-z0-9]+)* \d+:\d+:\d+$/u;

// ---- the list, as derived and pinned ------------------------------------------------------------
let pin, lines, made;
try {
  pin = JSON.parse(readFileSync(join(PINS, "PIN.json"), "utf8"));
  if (pin.schema_version !== "UBS_COLLOCATIONS_PIN_V1" || pin.rule_id !== UBS_COLLOCATIONS_RULE_ID || !pin.made_here || !pin.made_here.list || !pin.made_here.receipt) throw new PinFault(`the pin names no list of UBS's collocations and its receipt under made_here (${join(PINS, "PIN.json")})`);
  made = JSON.parse(readPinned(join(PINS, pin.made_here.receipt.file), pin.made_here.receipt).toString("utf8"));
  lines = readPinnedLines(join(PINS, pin.made_here.list.file), pin.made_here.list);
} catch (e) { if (e instanceof PinFault) refuse(e.message); throw e; }
const index = JSON.parse(readFileSync(join(STORE, "index.json"), "utf8"));
const source = (made.inputs || {}).source || {};
if (!source.m || ((index.m_sources || {})[source.m] || {}).key !== source.key) refuse(`the list's receipt names the source ${source.m} (${source.key}), and the store's index does not name it so`);
const readAt = (made.inputs || {}).store_version || null;
const follow = following(() => openFollower({ data: dirname(STORE), index, readAt }));
// the list's rows, each under the name its row has NOW: key -> Map(rank m sha16 -> { facts, met })
const listed = new Map();
const asRead = new Set();
const goneLines = [], rekeyedLines = [], retextedLines = [];
let withPlaces = 0;
lines.forEach((l, at) => {
  const where = `${pin.made_here.list.file} line ${at + 1}`;
  if (typeof l.k !== "string" || !Number.isInteger(l.rank) || typeof l.m !== "string" || !/^[0-9a-f]{16}$/u.test(String(l.sha))) refuse(`${where} names no key, rank, m id or hash`);
  if (l.m !== source.m) refuse(`${where} names a row of ${l.m}, not of the UBS dictionary (${source.m})`);
  if (!Array.isArray(l.collocations) || !l.collocations.length || !l.collocations.every((c) => typeof c === "string" && c)) refuse(`${where} holds no collocation`);
  if (!Array.isArray(l.picked_at) || !l.picked_at.every((p) => typeof p === "string" && PLACE.test(p))) refuse(`${where} holds a place that is not "<book slug> <chapter>:<verse>:<word>"`);
  const id = `${l.k}\u0001${l.rank} ${l.m} ${l.sha}`;
  if (asRead.has(id)) refuse(`${where} names a row an earlier line names (rank ${l.rank} ${l.m} ${l.sha})`);
  asRead.add(id);
  if (l.picked_at.length) withPlaces += 1;
  const went = following(() => follow.nowOf([l.k, l.rank, l.m, l.sha]));
  if (went.state === "struck" || went.state === "withheld") { goneLines.push(went); return; }
  if (went.state === "re-keyed") rekeyedLines.push(went);
  if (went.state === "retexted") retextedLines.push(went);
  const [k, rankNow, , shaNow] = went.name;
  const rows = listed.get(k) || listed.set(k, new Map()).get(k);
  rows.set(`${rankNow} ${l.m} ${shaNow}`, { facts: { collocations: l.collocations, picked_at: l.picked_at.length ? l.picked_at : null }, met: 0 });
});

// ---- every row of the store, read first and written only when every line has found its row -------
const shardNames = readdirSync(join(STORE, "shards")).filter((f) => f.endsWith(".bin")).sort();
let touched = [], storeRows = 0, twice = [], names = [], marked = 0, placed = 0, moved = 0, takenOff = 0;
const walk = (write) => {
  touched = []; storeRows = 0; twice = []; names = []; marked = 0; placed = 0; moved = 0; takenOff = 0;
  for (const rows of listed.values()) for (const x of rows.values()) x.met = 0;
  for (const name of shardNames) {
    const path = join(STORE, "shards", name);
    const body = JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"));
    let movedHere = 0;
    for (const [k, rows] of Object.entries(body)) {
      const mine = listed.get(k) || null;
      for (const row of rows) {
        storeRows += 1;
        const m = String(row[3]);
        const line = mine && m === source.m ? mine.get(`${row[0]} ${m} ${sha16Of(row[1])}`) || null : null;
        const f = factsOf(row) || {};
        if (line) {
          line.met += 1;
          if (line.met > 1 && twice.length < 6) twice.push(`${name} (${m}, rank ${row[0]})`);
          if (f.name && names.length < 6) names.push(`${name} (${m}, rank ${row[0]})`);
          marked += 1;
          if (line.facts.picked_at) placed += 1;
        }
        const want = line ? line.facts : { collocations: null, picked_at: null };
        if (same(f.collocations, want.collocations) && same(f.picked_at, want.picked_at)) continue;
        movedHere += 1; moved += 1;
        if (!line) takenOff += 1;
        if (write) setFacts(row, want);
      }
    }
    if (movedHere) { touched.push(name); if (write) writeFileSync(path, gzipSync(Buffer.from(JSON.stringify(body)), { level: 9 })); }
  }
};
walk(false);
let unmet = 0; const firstUnmet = [];
for (const rows of listed.values()) for (const [id, x] of rows) if (!x.met) { unmet += 1; if (firstUnmet.length < 6) firstUnmet.push(id); }
const totals = { rows_listed: lines.length, rows_listed_with_places: withPlaces, rows_marked: marked, rows_given_picked_at: placed, lines_that_find_no_row: goneLines.length, lines_that_find_more_than_one_row: twice.length };
const followed = followedRecord(follow, { left: goneLines, rekeyed: rekeyedLines, retexted: retextedLines });
const shardsRewritten = touched.length;
console.log(`UBS's collocations · ${n(lines.length)} rows listed (derived on the store at ${readAt}) · ${n(marked)} found in the store of ${n(storeRows)}, ${n(placed)} with places · followed through ${follow.rounds.length} round(s) since: ${followedSaid(followed)} · unexplained: ${unmet} lines find no row, ${twice.length} find more than one, ${names.length} find a name row · ${n(moved)} rows move (${n(takenOff)} taken off, ${shardsRewritten} shards)`);
if (unmet || twice.length || names.length) refuse(`${unmet} line(s) find no row that no round of the row-strikes record struck, withheld or moved since the store was ${readAt}${firstUnmet.length ? ` (first: rank ${firstUnmet[0]})` : ""}, ${twice.length} find more than one${twice.length ? ` (first: ${twice[0]})` : ""}, and ${names.length} find a row that carries a name fact${names.length ? ` (first: ${names[0]})` : ""}. The record does not explain them, and nothing is guessed`);
const record = { pin: `${HOME}/PIN.json`, rule: pin.rule_id, dictionary: pin.dictionary ? { file: pin.dictionary.file, sha256: pin.dictionary.sha256 } : null, routes: pin.routes ? { file: pin.routes.file, sha256: pin.routes.sha256 } : null,
  list: { file: `${HOME}/${pin.made_here.list.file}`, sha256: pin.made_here.list.sha256, lines: pin.made_here.list.lines }, receipt: { file: `${HOME}/${pin.made_here.receipt.file}`, sha256: pin.made_here.receipt.sha256 },
  read_at_store_version: readAt, totals, followed };
const had = index[INDEX_KEY] || null;
const nothingToWrite = !moved && !!had && Object.keys(record).every((k) => same(had[k], record[k]));
const count = (o) => Object.values(o || {}).reduce((a, c) => a + c, 0);
console.log(`figures ${JSON.stringify({ list_sha256: pin.made_here.list.sha256, read_at_store_version: readAt, store_version: index.store_version || null, ...totals, rounds_since: follow.rounds.length,
  lines_whose_row_was_struck: count(followed.lines_whose_row_was_struck), lines_whose_row_was_withheld: count(followed.lines_whose_row_was_withheld), rows_re_keyed_and_followed: count(followed.rows_re_keyed_and_followed), rows_retexted_and_followed: count(followed.rows_retexted_and_followed),
  rows_moved: moved, rows_taken_off: takenOff, shards_moved: shardsRewritten, the_index_names_this_run: nothingToWrite })}`);
if (DRY) { console.log("dry run — nothing written"); process.exit(0); }
if (nothingToWrite) { console.log("nothing moves and the index names this list as it is followed — nothing written"); process.exit(0); }
if (moved) walk(true);

// ---- write: the index, the receipt ----------------------------------------------------------------
const on = momentOf(GIVEN_ON);
const digest = createHash("sha256");
let shardBytes = 0;
for (const name of shardNames) { const b = readFileSync(join(STORE, "shards", name)); digest.update(b); shardBytes += b.length; }
const was = index.store_version || null, now = digest.digest("hex").slice(0, 12);
const WHAT = "a row of the UBS dictionary on the derived list of its category (every meaning of its text UBS marks with a collocation, LEXCollocations, read through the catalog's route file; no name row) carries collocations, the collocations its meanings name, as UBS writes them, and, where UBS's own default pick names it, picked_at, the places (\"<book slug> <chapter>:<verse>:<word>\") in the facts slot (slot 10, an object). The texts are the served bytes, unchanged. The record of dictionary kinds rests such a row shut on the thirty-nine books (its entry ubs-collocation), but at a place its picked_at names, where it stands";
const lastMove = now !== was || !had ? { store_version_before: was, store_version: now } : { store_version_before: had.store_version_before, store_version: had.store_version };
index[INDEX_KEY] = { rule_id: UBS_COLLOCATIONS_RULE_ID, applied_on: on, applied_by: "tools/apply-ubs-collocations-v1.mjs", ...record, ...lastMove, what: WHAT };
index.counts = { ...(index.counts || {}), shard_bytes_total: shardBytes };
if (now !== was) { index.store_version = now; index.store_version_history = [...(index.store_version_history || []), { was, now, why: UBS_COLLOCATIONS_RULE_ID, on }]; }
writeFileSync(join(STORE, "index.json"), JSON.stringify(index, null, 1));
const prior = existsSync(RECEIPT) ? JSON.parse(readFileSync(RECEIPT, "utf8")) : null;
writeFileSync(RECEIPT, JSON.stringify({ schema_version: "UBS_COLLOCATIONS_RECEIPT_V1", rule_id: UBS_COLLOCATIONS_RULE_ID, what: WHAT, pin: { file: `${HOME}/PIN.json`, list_sha256: pin.made_here.list.sha256 },
  runs: [...((prior && prior.runs) || []), { ran_at: on, store_version: { was, now }, followed, shards_rewritten: shardsRewritten, rows_moved: moved, rows_taken_off: takenOff, totals }] }, null, 1) + "\n");
console.log(`written · store ${was} -> ${now}${now === was ? " (no shard moved)" : ""} · shards weigh ${n(shardBytes)} bytes · index.${INDEX_KEY} names the list · receipt ${RECEIPT}`);
