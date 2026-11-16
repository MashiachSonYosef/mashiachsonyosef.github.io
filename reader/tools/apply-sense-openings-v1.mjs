#!/usr/bin/env node
// GUARDS: sense-openings-rule-v1-the-words-that-open-a-numbered-sense-print-as-a-note-beside-the-readings-and-not-as-a-pill
// LEDGER: M R
// it marks, on the rows of the source the owner's ruling names (M), those
// whose route text (R) is only the words opening a numbered sense of its
// entry. No row is judged here and no text is changed.
//
// «OBJECT HEAVEN AND EARTH» STOOD AS A READING OF "HE CREATED". The catalog
// made a route of the words that open each numbered sense of an entry of
// the unabridged BDB, and BDB opens a sense with what the word is said of
// as often as with a rendering. An outside reader took four such pills on
// the verb cards of Genesis 1 for broken pieces of a line (12 November
// 2026). The corpus lane listed the served rows that are only such an
// opening (relay v174, 13 November 2026 AD: numbered-sense-openings-v1.jsonl,
// each with its entry and its point; its rule stands in
// data/sense-openings/pieces-v1/RULE.md) and put the call to the owner, who
// ruled it (ruling 4 of relay v176, «1-5. agree go ahead»): such a row
// prints as a note beside the sense's readings, not as a pill.
//
// This tool writes the list onto the store: a listed row carries, in its
// facts slot (tools/gloss-store-v1.mjs, FACTS_SLOT), opens: the entry and
// the point of the sense it opens, as the list gives them ("BDB1300 1.").
// A row is found by its key, its rank and its route text together, among
// the rows of the source whose ledger the ruling names. What the mark does
// is the store reader's and the page's to say (senseOpened): the row gives
// no reading and prints as a note. NOTHING IN A TEXT IS CHANGED.
//
// The ruling is read from the corpus lane's own pin of it
// (tools/rulings-v1.mjs), by the sha256 of the list it rules, and it must
// say what this lane has wired: that the row prints as a note and not as a
// pill, for the lines of the list marked only an opening. A ruling that
// says anything else is refused in words; the owner's next word is then a
// change here, made in the open.
//
// A STORE THAT HAS MOVED ON IS FOLLOWED, NOT GUESSED AT (15 November 2026).
// The list was read from the store at one version, which its receipt names.
// Since then named lists strike, withhold, move and land rows
// (tools/strike-rows-v1.mjs), each round kept whole in
// data/row-strikes-v1.json. Every line is followed through that record
// (tools/row-strikes-follow-v1.mjs) before it is asked of the store: a line
// whose row a round moved to another key is asked there, at the rank the
// round gave it, and the row keeps its mark (a list line names no source: it
// is followed as a row of each source the ruling's ledger holds, and a line
// two of them answer for is refused); a line whose row a round struck
// or withheld is expected to find none and is counted by the list that took
// it. The switch this replaces (--the-store-has-moved-on) let any line with
// no row pass, and would have taken the mark off every row a round had
// moved; it is gone, and naming it is refused.
//
// A ROW RETEXTED SINCE IS FOUND BY THE WORDS IT TOOK (relay v187, the words
// our build took out given back, ship 6; row-strikes-follow-rule-v2). The
// retext keeps the row's key, rank and facts and gives it new words, so a
// line whose row a round retexted is asked at its key and rank by the text
// the follower names (the row's route text now), and the row keeps its mark.
//
// REFUSED, each in words and with nothing written:
//   - a list, rule or receipt that is not the bytes its pin names, or no
//     one pinned ruling on the list, or a ruling that sets another print
//     than a note, or counts other rows than the list holds;
//   - a line that names no key, rank, route, entry and point, or that is
//     not marked only an opening, or a row listed twice;
//   - a ruling whose ledger no source of the store is under;
//   - a store the record cannot be followed to from the version the list
//     was read at, or a row a round since did something to that the follower
//     does not name;
//   - a line that finds no row and that no round struck or withheld since,
//     or a line that finds more rows than one: the record does not explain
//     it, and nothing is guessed.
//
// Idempotent: a second run moves nothing and writes nothing. --dry prints
// and writes nothing. --on gives the moment the run is recorded under
// (tools/step-moment-v1.mjs); with none it is the clock's. The summary ends
// in one line of its figures as JSON (`figures {...}`), dry or not.
// Usage: node tools/apply-sense-openings-v1.mjs [--store data/route-store] [--on <moment>] [--dry]
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync, gzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { factsOf, setFacts, SENSE_OPENINGS_RULE_ID, SENSE_OPENINGS_PRINT } from "./gloss-store-v1.mjs";
import { readPinned, readPinnedLines, PinFault } from "./pinned-v1.mjs";
import { rulingsPinned, rulingOf, cited, RULINGS_DIR } from "./rulings-v1.mjs";
import { openFollower, followedRecord, followedSaid, sha16Of, FollowFault } from "./row-strikes-follow-v1.mjs";
import { givenMoment, momentOf } from "./step-moment-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > 0 ? process.argv[i + 1] : d; };
const DRY = process.argv.includes("--dry");
const STORE = arg("store", join(K3, "data", "route-store"));
const PINS = arg("pin", join(K3, "data", "sense-openings"));
const RULINGS = arg("rulings", RULINGS_DIR);
const RECEIPT = arg("receipt", join(K3, "data", "sense-openings-receipt-v1.json"));
const HOME = "reader/data/sense-openings";
const refuse = (why) => { console.error(`REFUSED · ${why}`); process.exit(1); };
const n = (x) => Number(x).toLocaleString("en-US");
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
if (process.argv.includes("--the-store-has-moved-on")) refuse("--the-store-has-moved-on is gone: every line is followed through the row-strikes record from the store the list was read at (tools/row-strikes-follow-v1.mjs), and what the record does not explain is refused");
// the moment the run is recorded under, where one is given
let GIVEN_ON = null;
try { GIVEN_ON = givenMoment(); } catch (e) { refuse(e.message); }
// what the follower refuses, this tool refuses in its words
const following = (ask) => { try { return ask(); } catch (e) { if (e instanceof FollowFault) refuse(e.message); throw e; } };

// ---- the list and the ruling on it, as the corpus lane wrote them ----------------------------
let pin, lines, theirs, ruling;
try {
  pin = JSON.parse(readFileSync(join(PINS, "PIN.json"), "utf8"));
  if (pin.schema_version !== "SENSE_OPENINGS_PIN_V1" || !pin.openings) throw new PinFault(`the pin names no list of openings (${join(PINS, "PIN.json")})`);
  readPinned(join(PINS, pin.folder, pin.rule.file), pin.rule, `${pin.folder}/${pin.rule.file}`);
  theirs = JSON.parse(readPinned(join(PINS, pin.folder, pin.receipt.file), pin.receipt, `${pin.folder}/${pin.receipt.file}`).toString("utf8"));
  lines = readPinnedLines(join(PINS, pin.folder, pin.openings.file), pin.openings, `${pin.folder}/${pin.openings.file}`);
  ruling = rulingOf(rulingsPinned(RULINGS), pin.openings.sha256, (r) => typeof r.print === "string" && typeof r.ledger === "string", "on how a row of this list prints");
} catch (e) { if (e instanceof PinFault) refuse(e.message); throw e; }
if (ruling.print !== SENSE_OPENINGS_PRINT) refuse(`ruling ${ruling.n} of relay ${ruling.relay_of_the_ruling} sets the print «${ruling.print}», and this lane has wired «${SENSE_OPENINGS_PRINT}»`);
if (ruling.rows !== lines.length) refuse(`ruling ${ruling.n} rules ${ruling.rows} rows and the list holds ${lines.length} lines`);
const index = JSON.parse(readFileSync(join(STORE, "index.json"), "utf8"));
const readAt = (((theirs.inputs || {}).route_store || {}).store_version) || null;
// the rows of the ruling's ledger: every source of the store under it
const ruled = new Set(Object.entries(index.m_sources || {}).filter(([, s]) => s && s.ledger === ruling.ledger).map(([m]) => m));
if (!ruled.size) refuse(`ruling ${ruling.n} names the ledger ${ruling.ledger}, and no source of the store is under it`);
// where each row the list read has gone since, by the row-strikes record kept beside the store
const follow = following(() => openFollower({ data: dirname(STORE), index, readAt }));
// the list's rows, each under the name its row has NOW: key -> Map(rank and route -> the line). A row a round moved
// since stands under its new key and rank; one a round struck or withheld is not here
const listed = new Map();
const named = new Set();
const goneLines = [], rekeyedLines = [], retextedLines = [];   // the follower's answers for the lines whose row a round since took, and for those followed to a moved or retexted row
const idOf = (rank, route) => `${rank}\u0001${route}`;
lines.forEach((l, at) => {
  const where = `${pin.openings.file} line ${at + 1}`;
  if (typeof l.key !== "string" || !l.key || !Number.isInteger(l.rank) || typeof l.route !== "string" || !l.route) refuse(`${where} names no key, rank or route`);
  if (l.only_an_opening !== true) refuse(`${where} is not marked only an opening, and the ruling rules the lines that are`);
  if (!Array.isArray(l.entries) || l.entries.length !== 1 || !/^\S+ \S+$/u.test(String(l.entries[0]))) refuse(`${where} does not name one entry and one point`);
  const asRead = `${l.key}\u0001${idOf(l.rank, l.route)}`;
  if (named.has(asRead)) refuse(`${where} names a row an earlier line names (${l.key}, rank ${l.rank})`);
  named.add(asRead);
  // the line names no source: it is followed as a row of each source of the ruling's ledger
  const sha = sha16Of(l.route);
  const acted = [...ruled].sort().map((m) => following(() => follow.nowOf([l.key, l.rank, m, sha]))).filter((went) => went.state !== "served");
  if (acted.length > 1) refuse(`${where}: rounds since the store was ${readAt} acted on rows of ${acted.length} sources of the ruling's ledger under its key, rank and words, and the line names no source`);
  const went = acted[0] || { state: "served", name: [l.key, l.rank] };
  if (went.state === "struck" || went.state === "withheld") { goneLines.push(went); return; }
  if (went.state === "re-keyed") rekeyedLines.push(went);
  if (went.state === "retexted") retextedLines.push(went);
  const [k, rankNow] = went.name;
  const rows = listed.get(k) || listed.set(k, new Map()).get(k);
  // a row retexted since is asked by the route text it took
  rows.set(idOf(rankNow, went.state === "retexted" ? went.text : l.route), { opens: l.entries[0], met: 0 });
});

// ---- every row of the store, read first and written only when every line has found its row ---
const shardNames = readdirSync(join(STORE, "shards")).filter((f) => f.endsWith(".bin")).sort();
let touched = [], storeRows = 0, ruledRows = 0, marked = 0, moved = 0, twice = [];
const walk = (write) => {
  touched = []; storeRows = 0; ruledRows = 0; marked = 0; moved = 0; twice = [];
  for (const rows of listed.values()) for (const x of rows.values()) x.met = 0;
  for (const name of shardNames) {
    const path = join(STORE, "shards", name);
    const body = JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"));
    let here = 0;
    for (const [k, rows] of Object.entries(body)) {
      const mine = listed.get(k) || null;
      for (const row of rows) {
        storeRows += 1;
        const isRuled = ruled.has(String(row[3]));
        if (isRuled) ruledRows += 1;
        const line = isRuled && mine ? mine.get(idOf(row[0], String(row[1] ?? ""))) : null;
        if (line) { line.met += 1; if (line.met > 1 && twice.length < 6) twice.push(`${name} ${k} (rank ${row[0]})`); marked += 1; }
        const has = (factsOf(row) || {}).opens ?? null;
        const want = line ? line.opens : null;
        if (has === want) continue;
        here += 1;
        if (write) setFacts(row, { opens: want });
      }
    }
    moved += here;
    if (here) { touched.push(name); if (write) writeFileSync(path, gzipSync(Buffer.from(JSON.stringify(body)), { level: 9 })); }
  }
};
walk(false);
let unmet = 0; const firstUnmet = [];
for (const [k, rows] of listed) for (const [id, x] of rows) if (!x.met) { unmet += 1; if (firstUnmet.length < 6) firstUnmet.push(`${k} (rank ${id.split("\u0001")[0]})`); }
const sources = [...ruled].sort().map((m) => `${m} ${(index.m_sources[m] || {}).key}`);
// lines_that_find_no_row: the lines whose row a round since struck or withheld (a line the record does not explain is refused below)
const totals = { rows_listed: lines.length, rows_marked: marked, rows_of_the_ruled_sources: ruledRows, lines_that_find_no_row: goneLines.length, lines_that_find_more_than_one_row: twice.length };
const followed = followedRecord(follow, { left: goneLines, rekeyed: rekeyedLines, retexted: retextedLines });
const shardsRewritten = touched.length, movedNow = moved;
console.log(`sense openings · relay ${pin.relay}, ruling ${ruling.n} of relay ${ruling.relay_of_the_ruling} («${ruling.the_owners_words}») · ${n(lines.length)} rows listed (read from the store at ${readAt}) · ${n(marked)} marked among the ${n(ruledRows)} rows of ${sources.join(", ")} in the store of ${n(storeRows)} · followed through ${follow.rounds.length} round(s) since: ${followedSaid(followed)} · unexplained: ${unmet} lines find no row, ${twice.length} find more than one · ${n(movedNow)} rows to move in ${shardsRewritten} shards`);
if (unmet || twice.length) refuse(`${unmet} line(s) find no row that no round of the row-strikes record struck, withheld or moved since the store was ${readAt}${firstUnmet.length ? ` (first: ${firstUnmet[0]})` : ""}, and ${twice.length} find more than one${twice.length ? ` (first: ${twice[0]})` : ""}. The record does not explain them, and nothing is guessed`);
const record = { pin: `${HOME}/PIN.json`, relay: pin.relay, letter: pin.letter, from: pin.from, rule: `${HOME}/${pin.folder}/${pin.rule.file}`, receipt: `${HOME}/${pin.folder}/${pin.receipt.file}`,
  openings: { file: `${HOME}/${pin.folder}/${pin.openings.file}`, sha256: pin.openings.sha256, lines: pin.openings.lines },
  ruling: { ...cited(ruling), ledger: ruling.ledger, print: ruling.print }, sources: [...ruled].sort(), read_at_store_version: readAt, totals, followed };
const had = index.sense_openings || null;
const nothingToWrite = !movedNow && !!had && Object.keys(record).every((k) => same(had[k], record[k]));
// the run's figures, one line of JSON, for a script that holds a run to what was rehearsed
const count = (o) => Object.values(o || {}).reduce((a, c) => a + c, 0);
console.log(`figures ${JSON.stringify({ relay: pin.relay, list_sha256: pin.openings.sha256, read_at_store_version: readAt, store_version: index.store_version || null, ...totals, rounds_since: follow.rounds.length,
  lines_whose_row_was_struck: count(followed.lines_whose_row_was_struck), lines_whose_row_was_withheld: count(followed.lines_whose_row_was_withheld), rows_re_keyed_and_followed: count(followed.rows_re_keyed_and_followed),
  rows_retexted_and_followed: count(followed.rows_retexted_and_followed), rows_moved: movedNow, shards_moved: shardsRewritten, the_index_names_this_run: nothingToWrite })}`);
if (DRY) { console.log("dry run — nothing written"); process.exit(0); }
if (nothingToWrite) { console.log("nothing moves and the index names this list as it is followed — nothing written"); process.exit(0); }
if (movedNow) walk(true);

// ---- write: the index, the receipt -------------------------------------------------------------
const on = momentOf(GIVEN_ON);
const digest = createHash("sha256");
let shardBytes = 0;
for (const name of shardNames) { const b = readFileSync(join(STORE, "shards", name)); digest.update(b); shardBytes += b.length; }
const was = index.store_version || null, now = digest.digest("hex").slice(0, 12);
const WHAT = "a row the corpus lane's list of openings names carries opens in the facts slot (slot 10, an object): the entry and the point of the numbered sense whose opening words the row is, as the list gives them. The texts are the served bytes, unchanged. Such a row gives no reading, so no line, pill or link stands on it, and where the card keeps it the card prints it among its notes with its point (tools/gloss-store-v1.mjs, senseOpened)";
const lastMove = now !== was || !had ? { store_version_before: was, store_version: now } : { store_version_before: had.store_version_before, store_version: had.store_version };
index.sense_openings = { rule_id: SENSE_OPENINGS_RULE_ID, applied_on: on, applied_by: "tools/apply-sense-openings-v1.mjs", ...record, ...lastMove, what: WHAT };
index.counts = { ...(index.counts || {}), shard_bytes_total: shardBytes };
if (now !== was) { index.store_version = now; index.store_version_history = [...(index.store_version_history || []), { was, now, why: SENSE_OPENINGS_RULE_ID, on }]; }
writeFileSync(join(STORE, "index.json"), JSON.stringify(index, null, 1));
const prior = existsSync(RECEIPT) ? JSON.parse(readFileSync(RECEIPT, "utf8")) : null;
writeFileSync(RECEIPT, JSON.stringify({ schema_version: "SENSE_OPENINGS_RECEIPT_V1", rule_id: SENSE_OPENINGS_RULE_ID, what: WHAT, pin: { file: `${HOME}/PIN.json`, relay: pin.relay, letter: pin.letter },
  runs: [...((prior && prior.runs) || []), { ran_at: on, store_version: { was, now }, followed, shards_rewritten: shardsRewritten, rows_moved: movedNow, ruling: record.ruling, totals }] }, null, 1) + "\n");
console.log(`written · store ${was} -> ${now}${now === was ? " (no shard moved)" : ""} · shards weigh ${n(shardBytes)} bytes · index.sense_openings names the list · receipt ${RECEIPT}`);
