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
// ledger, 382,258 rows of fifteen sources; reissued as v1.1 in relay v190,
// 14 November, which also reads TAHOT's lines that carry the Hebrew verse
// beside the English one; data/row-entries/PIN.json names the ledger in
// force and the folder its rule stands in), and the lattice already says
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
// A STORE THAT HAS MOVED ON IS FOLLOWED, NOT GUESSED AT (15 November 2026).
// The ledger was read from the store at one version, which its receipt
// names. Since then named lists strike, move and land rows
// (tools/strike-rows-v1.mjs), and each round is kept whole in
// data/row-strikes-v1.json. Every line is followed through that record
// (tools/row-strikes-follow-v1.mjs) before it is asked of the store: a line
// whose row a round moved to another key is asked there, at the rank the
// round gave it, so the row keeps the facts it carried; a line whose row a
// round struck or withheld is expected to find none, and is counted by the
// list that took it; a row a round landed since has no line, carries
// nothing, and is counted so. The switch this replaces
// (--the-store-has-moved-on) let any line with no row and any row with no
// line pass, and took the facts off every row a round had moved; it is
// gone, and naming it is refused.
//
// A STRUCK ROW'S TWIN TAKES WHAT ITS LINE ALONE SAID. Call 5 of relay v189
// struck a row under a key ending in a maqaf wherever the same source holds
// the same words under the plain key. Its test read the words alone. BDB
// files «from» under the Hebrew word (H4480) at the one key and under the
// Aramaic word (H4481) at the other: with the row under the first key struck,
// the row that is left carried the Aramaic entry only, and the entry gate
// withheld BDB's «from» at every place of the Hebrew word. So a line whose
// row was struck as such a twin (the follower names the key its words still
// stand under) gives its entries to the same source's row of the same words
// there: that row carries its own first and then what the struck row's line
// adds, numbers, lettered tags and BDB's entries alike, as the ledger itself
// writes a row its source files under several entries. Each pair is recorded
// with both rows named and what was given (followed.entries_given_to_a_twin,
// in the index and in the receipt's run). Found by recount over every line
// whose row was struck, never from a list of names.
//
// A ROW RETEXTED SINCE IS NAMED BY THE WORDS IT TOOK (relay v187, the words
// our build took out given back, ship 6; row-strikes-follow-rule-v2). The
// retext keeps the row's key, rank and facts and gives it new words, so its
// line is asked at its key and rank under the sha16 of the route text the
// follower names, and the row keeps what it carries.
//
// REFUSED, each in words and with nothing written:
//   - a ledger, rule or receipt that is not the bytes its pin names;
//   - a ledger row of a source the store does not hold under that m id, or a
//     pinned parting that names a source the store names otherwise;
//   - a store the record cannot be followed to from the version the ledger
//     was read at, or a row a round since did something to that the follower
//     does not name;
//   - a row of the ledger's sources with no line that no round landed since,
//     or a line with no row that no round struck or withheld since: the
//     record does not explain it, and nothing is guessed;
//   - a struck row's line that gives entries where more rows than one of its
//     source carry its words under the other key: which takes them is not
//     decided;
//   - a row that carries facts of this tool's and is of a source the ledger
//     does not read.
//
// THE ROWS STRUCK BEFORE THE LEDGER WAS READ (row entries v1.2, relay v197, 20 November 2026). A reissue read from
// the store as served holds a line for every served row and none for a row a round struck before it was read: the
// follower finds no round since, so it names no struck row. The lines of those rows are kept beside the ledger
// (pin.struck_lines: the replaced ledger's line of each, with the round that took it), and the twin clause above
// reads them as it reads a line whose row a round struck since. Found by recount over every such line.
//
// FACTS LISTS OF FURTHER SOURCES (pin.lists; relays v203 and v204, the entry ledgers). A source that names no entry
// of its own has no line in the ledger. The corpus lane joins such a source's rows to the Bible dictionaries'
// entries by the row's own pointed head form and kind of word, and sends the rows that meet one as a list: key,
// rank, m id, route text (and its sha16 where the list gives it), and the facts the row would carry. Each list is
// named on the command line (--list <file>, once for each list of the pin) and read only if it is the bytes its pin
// entry names. Of a list's facts only those its pin entry lands (facts) are written: the numbers (n), which the gate
// itself reads. STEP's letters and BDB's own entries are the two partings of ruling 6, which names the sources whose
// rows they read; on a joined row they are counted (facts_not_landed) and not written. A row of a list's source
// with no line carries nothing. A line is followed through the row-strikes record from the store its list was read
// at, as a line of the ledger is. Refused: a list that is not its pin's bytes, a pinned list not named, a line of a
// source its pin entry does not read or of a source the ledger reads, a line that finds no row no round took.
//
// Idempotent: a second run moves nothing and writes nothing. --dry prints
// and writes nothing. --on gives the moment the run is recorded under
// (tools/step-moment-v1.mjs); with none it is the clock's. The summary ends
// in one line of its figures as JSON (`figures {...}`), dry or not.
// Usage: node tools/apply-row-entries-v1.mjs --ledger <the ledger data/row-entries/PIN.json names> [--list <a list the pin names>]... [--store data/route-store] [--on <moment>] [--dry]
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync, gzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { factsOf, setFacts } from "./gloss-store-v1.mjs";
import { ENTRY_GATE_RULE_ID, letteredOf } from "./entry-gate-v1.mjs";
import { readPinned, readPinnedLines, PinFault } from "./pinned-v1.mjs";
import { openFollower, followedRecord, followedSaid, twinKeyOf, FollowFault } from "./row-strikes-follow-v1.mjs";
import { givenMoment, momentOf } from "./step-moment-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > 0 ? process.argv[i + 1] : d; };
const DRY = process.argv.includes("--dry");
const STORE = arg("store", join(K3, "data", "route-store"));
const PINS = arg("pin", join(K3, "data", "row-entries"));
const LEDGER = arg("ledger", null);
const LISTS = process.argv.flatMap((a, i) => (a === "--list" && process.argv[i + 1] ? [process.argv[i + 1]] : []));
const RECEIPT = arg("receipt", join(K3, "data", "row-entries-receipt-v1.json"));
const HOME = "reader/data/row-entries";
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const refuse = (why) => { console.error(`REFUSED · ${why}`); process.exit(1); };
const n = (x) => Number(x).toLocaleString("en-US");
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
if (!LEDGER) refuse("the ledger is not in this tree and has to be named: --ledger <the ledger data/row-entries/PIN.json names>");
if (process.argv.includes("--the-store-has-moved-on")) refuse("--the-store-has-moved-on is gone: every line is followed through the row-strikes record from the store the ledger was read at (tools/row-strikes-follow-v1.mjs), and what the record does not explain is refused");
// the moment the run is recorded under, where one is given
let GIVEN_ON = null;
try { GIVEN_ON = givenMoment(); } catch (e) { refuse(e.message); }
// what the follower refuses, this tool refuses in its words
const following = (ask) => { try { return ask(); } catch (e) { if (e instanceof FollowFault) refuse(e.message); throw e; } };

// ---- the ledger, as the corpus lane wrote it --------------------------------------------
let pin, lines, theirs, struckBefore = [];
const listBytes = new Map();   // sha256 -> the bytes of a file named with --list
for (const path of LISTS) { if (!existsSync(path)) refuse(`--list ${path} is not here`); const b = readFileSync(path); listBytes.set(sha256(b), b); }
try {
  pin = JSON.parse(readFileSync(join(PINS, "PIN.json"), "utf8"));
  if (pin.schema_version !== "ROW_ENTRIES_PIN_V1" || !pin.ledger) throw new PinFault(`the pin names no ledger (${join(PINS, "PIN.json")})`);
  readPinned(join(PINS, pin.folder, pin.rule.file), pin.rule, `${pin.folder}/${pin.rule.file}`);
  theirs = JSON.parse(readPinned(join(PINS, pin.folder, pin.receipt.file), pin.receipt, `${pin.folder}/${pin.receipt.file}`).toString("utf8"));
  lines = readPinnedLines(LEDGER, pin.ledger, pin.ledger.file);
  if (pin.struck_lines) struckBefore = readPinnedLines(join(PINS, pin.folder, pin.struck_lines.file), pin.struck_lines, `${pin.folder}/${pin.struck_lines.file}`);
  for (const l of pin.lists || []) {
    if (!l.name || !l.folder || !l.rule || !l.receipt || !l.list || !Array.isArray(l.facts) || !l.facts.length || l.facts.some((f) => !["n", "t", "b"].includes(f)) || !l.sources || !l.read_at_store_version)
      throw new PinFault(`a list of the pin (${l.name || "unnamed"}) does not name its folder, rule, receipt, list, the facts it lands, its sources and the store it was read at`);
    readPinned(join(PINS, l.folder, l.rule.file), l.rule, `${l.folder}/${l.rule.file}`);
    const receipt = readPinned(join(PINS, l.folder, l.receipt.file), l.receipt, `${l.folder}/${l.receipt.file}`).toString("utf8");
    if (!receipt.includes(`"${l.read_at_store_version}"`)) throw new PinFault(`the receipt of the list "${l.name}" does not name ${l.read_at_store_version}, the store the pin says the list was read at`);
    const bytes = listBytes.get(l.list.sha256);
    if (!bytes) throw new PinFault(`the pin names the list ${l.list.file} (${l.name}, relay ${l.relay}) and no --list names those bytes: a run without it would take its entries off the rows`);
    if (bytes.length !== l.list.bytes) throw new PinFault(`${l.list.file} is ${bytes.length} bytes and its pin says ${l.list.bytes}`);
  }
  if (listBytes.size !== (pin.lists || []).length) throw new PinFault(`${listBytes.size} file(s) are named with --list and the pin names ${(pin.lists || []).length} list(s): a --list names bytes no list of the pin names, or one twice`);
} catch (e) { if (e instanceof PinFault) refuse(e.message); throw e; }
const index = JSON.parse(readFileSync(join(STORE, "index.json"), "utf8"));
const readAt = (((theirs.inputs || {}).route_store || {}).store_version) || null;
// where each row the ledger read has gone since, by the row-strikes record kept beside the store
const follow = following(() => openFollower({ data: dirname(STORE), index, readAt }));
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
const MINE = ["n", "t", "b"];   // the facts this tool writes and no other does
// the ledger's rows, each under the name its row has NOW: key -> Map(rank m sha16 -> [facts, ...], one per time the
// ledger lists the row). A row a round moved since stands under its new key and rank; one a round took is not here
const ledger = new Map();
const GIVEN_BY_THE_LEDGER = new Set();   // the sources some line of the ledger gives a fact
const keysRead = new Set();
const SOURCES = new Set();
// the follower's answers for the lines whose row a round since struck or withheld, and for those followed to a moved
// row; and the struck lines whose words still stand under another key, with what each line says of its row
const goneLines = [], rekeyedLines = [], retextedLines = [], twinLines = [];
let ledgerRows = 0;
for (const x of lines) {
  if (typeof x.k !== "string" || !Array.isArray(x.rows)) refuse("a line of the ledger names no key or no rows");
  if (keysRead.has(x.k)) refuse(`the ledger names the key «${x.k}» twice`);
  keysRead.add(x.k);
  for (const r of x.rows) {
    if (!Array.isArray(r) || r.length !== 6 || !Array.isArray(r[4]) || !Array.isArray(r[5])) refuse(`a row under «${x.k}» is not the ledger's six slots`);
    const [rank, m, sha, , entries, numbers] = r;
    if (!(index.m_sources || {})[m]) refuse(`the ledger names a row of ${m} under «${x.k}», and the store holds no such source`);
    if (numbers.some((y) => !/^H[1-9]\d*$/u.test(y))) refuse(`a row of ${m} under «${x.k}» carries a number that is not H and digits: ${JSON.stringify(numbers)}`);
    SOURCES.add(m); ledgerRows += 1;
    const t = of(m); t.ledger_rows += 1;
    const name = [x.k, rank, m, sha], facts = factsFor(m, entries, numbers);
    if (facts) GIVEN_BY_THE_LEDGER.add(m);
    const went = following(() => follow.nowOf(name));
    if (went.state === "struck" || went.state === "withheld") {
      goneLines.push(went);
      const twinKey = twinKeyOf(name, went);
      if (twinKey) twinLines.push({ from: name, key: twinKey, facts, by: went.by });
      continue;
    }
    if (went.state === "re-keyed") rekeyedLines.push(went);
    if (went.state === "retexted") retextedLines.push(went);
    // a row retexted since is named by the sha16 of the words it took
    const [k, rankNow, , shaNow] = went.name;
    const rows = ledger.get(k) || ledger.set(k, new Map()).get(k);
    const id = `${rankNow} ${m} ${shaNow}`;
    (rows.get(id) || rows.set(id, []).get(id)).push(facts);
  }
}
// the lines of the rows a round struck before the ledger was read (pin.struck_lines): each a line of the ledger this
// one replaces, with the round that took its row; a row struck as a twin gives what its line alone said, as above
const struckBeforeBy = {};
for (const [i, x] of struckBefore.entries()) {
  const r = x && x.row, by = x && x.taken;
  if (!x || typeof x.k !== "string" || !Array.isArray(r) || r.length !== 6 || !Array.isArray(r[4]) || !Array.isArray(r[5]) || !by || typeof by.list !== "string") refuse(`${pin.struck_lines.file} line ${i + 1} is not a key, the ledger's six slots and the round that took the row`);
  const [rank, m, sha, , entries, numbers] = r;
  if (!(index.m_sources || {})[m]) refuse(`${pin.struck_lines.file} line ${i + 1} names a row of ${m}, and the store holds no such source`);
  struckBeforeBy[by.list] = (struckBeforeBy[by.list] || 0) + 1;
  const name = [x.k, rank, m, sha];
  const twinKey = twinKeyOf(name, { state: by.action === "strike" ? "struck" : by.action, by: { kind: by.kind ?? null } });
  if (twinKey) twinLines.push({ from: name, key: twinKey, facts: factsFor(m, entries, numbers), by: { list: by.list } });
}
// A STRUCK ROW'S TWIN TAKES WHAT ITS LINE ALONE SAID: the same source's row of the same words under the key the
// struck row's words still stand under carries its own entries first, then those of the struck row's line it lacks
const lacks = (own, line) => { const out = {}; for (const key of MINE) { const add = ((line || {})[key] || []).filter((y) => !((own || {})[key] || []).includes(y)); if (add.length) out[key] = add; } return Object.keys(out).length ? out : null; };
const withGiven = (own, gave) => { const out = {}; for (const key of MINE) { const all = [...((own || {})[key] || []), ...(gave[key] || [])]; if (all.length) out[key] = all; } return out; };
const given = [];   // each pair: the struck row, its twin, what the twin was given
let struckWithATwin = 0;
for (const t of twinLines) {
  const rows = ledger.get(t.key) || new Map();
  const ids = [...rows.keys()].filter((id) => id.endsWith(` ${t.from[2]} ${t.from[3]}`));
  if (!ids.length) continue;   // no row of its own source carries its words there: the strike took the source's credit with it
  struckWithATwin += 1;
  const gains = ids.flatMap((id) => rows.get(id).map((own) => lacks(own, t.facts)));
  if (!gains.some(Boolean)) continue;
  if (gains.length !== 1) refuse(`the line of the row of ${t.from[2]} at rank ${t.from[1]} (${t.from[3]}), struck by ${t.by.list}, gives entries to its twin, and ${gains.length} rows of ${t.from[2]} carry its words under the key they still stand under: which takes them is not decided`);
  rows.get(ids[0])[0] = withGiven(rows.get(ids[0])[0], gains[0]);
  given.push({ from: t.from, to: [t.key, Number(ids[0].split(" ")[0]), t.from[2], t.from[3]], gave: gains[0], struck_by: t.by.list });
}

// ---- the facts lists of further sources (pin.lists) ---------------------------------------------
const LIST_OF = new Map();    // m id -> the pin entry of the list that reads it
const listed = new Map();     // key now -> "rank m sha16" -> [facts or null, ...], one per time a list names the row
const listRuns = [];          // per list, in the pin's order: what it gave
for (const l of pin.lists || []) {
  const text = listBytes.get(l.list.sha256).toString("utf8");
  if (!text.endsWith("\n")) refuse(`${l.list.file} does not end in a line end`);
  const [head, ...body] = text.slice(0, -1).split("\n");
  const cols = head.split("\t");
  const iS = cols.indexOf("sha16"), iT = cols.indexOf("route_text"), iF = cols.findIndex((c) => /^facts_under_/u.test(c));
  if (cols[0] !== "key" || cols[1] !== "rank" || cols[2] !== "m_id" || iT < 0 || iF < 0) refuse(`${l.list.file} opens with another header: ${cols.join(" | ")}`);
  if (body.length !== l.list.lines) refuse(`${l.list.file} holds ${body.length} lines and its pin says ${l.list.lines}`);
  for (const [m, key] of Object.entries(l.sources)) {
    const mine = (index.m_sources || {})[m];
    if (!mine || mine.key !== key) refuse(`the pin's list "${l.name}" reads ${m} as ${key}, and the store holds ${mine ? mine.key : "no source"} under ${m}`);
    if (LIST_OF.has(m)) refuse(`two lists of the pin read ${m}`);
    LIST_OF.set(m, l);
  }
  const followL = following(() => openFollower({ data: dirname(STORE), index, readAt: l.read_at_store_version }));
  const run = { l, lines: body.length, gone: [], facts_not_landed: {}, by_m: {} };
  for (const [i, line] of body.entries()) {
    const c = line.split("\t"), where = `${l.list.file} line ${i + 2}`;
    if (c.length !== cols.length) refuse(`${where} holds ${c.length} fields`);
    const m = c[2], rank = Number(c[1]);
    if (LIST_OF.get(m) !== l) refuse(`${where} names a row of ${m}, which its pin entry does not read`);
    if (!Number.isInteger(rank)) refuse(`${where}: its rank is not a number`);
    const sha = sha256(Buffer.from(c[iT], "utf8")).slice(0, 16);
    if (iS >= 0 && c[iS] !== sha) refuse(`${where}: its sha16 is not its route text's`);
    let under = null;
    try { under = JSON.parse(c[iF]); } catch { refuse(`${where}: its facts are not JSON`); }
    const facts = {};
    for (const key of MINE) {
      if (!(key in under)) continue;
      if (!Array.isArray(under[key]) || !under[key].length || under[key].some((y) => typeof y !== "string" || !y)) refuse(`${where}: ${key} is not a list of entries`);
      if (l.facts.includes(key)) facts[key] = under[key];
      else run.facts_not_landed[key] = (run.facts_not_landed[key] || 0) + 1;
    }
    if (facts.n && facts.n.some((y) => !/^H[1-9]\d*$/u.test(y))) refuse(`${where} carries a number that is not H and digits: ${JSON.stringify(facts.n)}`);
    const went = following(() => followL.nowOf([c[0], rank, m, sha]));
    if (went.state === "struck" || went.state === "withheld") { run.gone.push(went); continue; }
    const [k, rankNow, , shaNow] = went.name;
    const rows = listed.get(k) || listed.set(k, new Map()).get(k);
    const id = `${rankNow} ${m} ${shaNow}`;
    (rows.get(id) || rows.set(id, []).get(id)).push(Object.keys(facts).length ? facts : null);
  }
  listRuns.push(run);
}
const listTally = new Map((pin.lists || []).map((l) => [l, { store_rows_of_its_sources: 0, lines_met: 0, rows_carrying_an_entry: 0, rows_with_several_numbers: 0, rows_moved: 0 }]));
// A SOURCE THE LEDGER READS AND GIVES NOTHING MAY BE READ BY A LIST. The ledger holds a line for every row of a
// source that names no entry of its own (Classical Hebrew Words), each giving nothing; a list may give such a row
// the entry its head form meets. Where a line of the ledger gives a row of a list's source any fact, which of the
// two speaks is not decided, and the run is refused.
const READ_BY_BOTH = [...LIST_OF.keys()].filter((m) => SOURCES.has(m));
for (const m of READ_BY_BOTH) if (GIVEN_BY_THE_LEDGER.has(m)) refuse(`${m} is read by the pin's list "${LIST_OF.get(m).name}" and the ledger's own lines give its rows entries: which gives a row its entries is not decided`);

// ---- every row of the store ----------------------------------------------------------------
const mineOf = (row) => { const f = factsOf(row); if (!f) return null; const out = {}; for (const k of MINE) if (k in f) out[k] = f[k]; return Object.keys(out).length ? out : null; };
const shardNames = readdirSync(join(STORE, "shards")).filter((f) => f.endsWith(".bin")).sort();
let touched = [], noLine = [], unlistedWithFacts = [], landedRows = [];
let storeRows = 0, linesMet = 0;
// The walk, made twice: once reading only, so that nothing is written until every row has been matched to its line,
// and once more writing. A row the store holds twice takes the ledger's lines for it in order, one each.
const walk = (write) => {
  touched = []; noLine = []; unlistedWithFacts = []; landedRows = []; storeRows = 0; linesMet = 0;
  for (const t of Object.values(tally)) for (const k of Object.keys(t)) if (k !== "ledger_rows") t[k] = 0;
  for (const lt of listTally.values()) for (const k of Object.keys(lt)) lt[k] = 0;
  const taken = new Map();   // key, then the row's id -> how many of the ledger's lines for it are taken
  // what a list of the pin gives a row (its list's tally with it), or null where no list reads the row's source
  const listLine = (k, m, id) => {
    const l = LIST_OF.get(m);
    if (!l) return null;
    const lt = listTally.get(l); lt.store_rows_of_its_sources += 1;
    const list = (listed.get(k) || new Map()).get(id) || null;
    const key = `a list\u0001${k}\u0001${id}`, at = taken.get(key) || 0;
    const met = !!list && at < list.length;
    if (met) { taken.set(key, at + 1); lt.lines_met += 1; }
    const want = met ? list[at] : null;
    if (want) { lt.rows_carrying_an_entry += 1; if (want.n && want.n.length > 1) lt.rows_with_several_numbers += 1; }
    return { lt, want };
  };
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
        if (!SOURCES.has(m)) {
          // a row of a list's source: the facts its line gives, or nothing where it has no line
          const got = listLine(k, m, `${row[0]} ${m} ${sha256(Buffer.from(String(row[1] ?? ""), "utf8")).slice(0, 16)}`);
          if (!got) { if (has) unlistedWithFacts.push(`${name} ${k} (${m}, rank ${row[0]})`); continue; }
          if (same(has, got.want)) continue;
          got.lt.rows_moved += 1; moved += 1;
          if (write) setFacts(row, Object.fromEntries(MINE.map((key) => [key, got.want && key in got.want ? got.want[key] : null])));
          continue;
        }
        const t = of(m); t.store_rows += 1;
        const sha = sha256(Buffer.from(String(row[1] ?? ""), "utf8")).slice(0, 16);
        const id = `${row[0]} ${m} ${sha}`;
        const list = mine ? mine.get(id) : null;
        const at = taken.get(`${k}\u0001${id}`) || 0;
        const met = !!list && at < list.length;
        const want = met ? list[at] : null;
        if (met) { taken.set(`${k}\u0001${id}`, at + 1); linesMet += 1; }
        else {
          // a row with no line: one a round landed since the ledger was read, or one the record does not explain
          const then = follow.thenOf([k, row[0], m, sha]);
          if (then.state === "landed after") { landedRows.push(then); t.rows_landed_since_with_no_line = (t.rows_landed_since_with_no_line || 0) + 1; }
          else { if (noLine.length < 12) noLine.push(`${name} ${k} (${m}, rank ${row[0]}) «${String(row[1]).slice(0, 50)}»`); t.rows_with_no_line = (t.rows_with_no_line || 0) + 1; }
        }
        if (met) { if (want && want.n) { t.rows_with_a_number += 1; if (want.n.length > 1) t.rows_with_several_numbers += 1; } else t.rows_with_no_number += 1; }
        if (want) {
          if (want.t) t.rows_carrying_steps_letters += 1;
          if (want.b) t.rows_carrying_bdbs_entries += 1;
          t.rows_carrying_the_slot += 1;
        }
        // a source the ledger reads and gives nothing may be read by a list of the pin: the row carries what its list line gives
        const got = listLine(k, m, id);
        const give = got && got.want ? got.want : want;
        if (same(has, give)) continue;
        if (got && got.want) got.lt.rows_moved += 1; else t.rows_moved += 1;
        moved += 1;
        if (write) setFacts(row, Object.fromEntries(MINE.map((key) => [key, give && key in give ? give[key] : null])));
      }
    }
    if (moved) { touched.push(name); if (write) writeFileSync(path, gzipSync(Buffer.from(JSON.stringify(body)), { level: 9 })); }
  }
};
following(() => walk(false));
if (unlistedWithFacts.length) refuse(`${unlistedWithFacts.length} row(s) of a source the ledger does not read carry this tool's facts; first: ${unlistedWithFacts[0]}`);
const sum = (f) => Object.values(tally).reduce((a, s) => a + (s[f] || 0), 0);
// what the record does not explain: a row with no line that no round landed, a line (of those whose row no round took) with no row
const rowsWithNoLine = sum("rows_with_no_line"), linesWithNoRow = ledgerRows - goneLines.length - linesMet;
for (const [m, t] of Object.entries(tally).sort((a, b) => b[1].ledger_rows - a[1].ledger_rows))
  console.log(`  ${m.padEnd(5)} ${String((index.m_sources[m] || {}).key).slice(0, 44).padEnd(44)} ledger ${String(t.ledger_rows).padStart(7)} · store ${String(t.store_rows).padStart(7)} · a number ${String(t.rows_with_a_number).padStart(7)} (several ${t.rows_with_several_numbers}) · none ${String(t.rows_with_no_number).padStart(5)}${t.rows_carrying_steps_letters ? ` · STEP's letters ${t.rows_carrying_steps_letters}` : ""}${t.rows_carrying_bdbs_entries ? ` · BDB's entries ${t.rows_carrying_bdbs_entries}` : ""} · carry the slot ${String(t.rows_carrying_the_slot).padStart(7)} · moved ${t.rows_moved}${t.rows_landed_since_with_no_line ? ` · landed since, no line ${t.rows_landed_since_with_no_line}` : ""}${t.rows_with_no_line ? ` · NO LINE ${t.rows_with_no_line}` : ""}`);
const totals = { sources: SOURCES.size, keys_in_the_ledger: lines.length, rows_in_the_ledger: ledgerRows, store_rows_of_those_sources: sum("store_rows"), rows_carrying_the_slot: sum("rows_carrying_the_slot"),
  rows_with_a_number: sum("rows_with_a_number"), rows_with_several_numbers: sum("rows_with_several_numbers"), rows_with_no_number: sum("rows_with_no_number"),
  rows_carrying_steps_letters: sum("rows_carrying_steps_letters"), rows_carrying_bdbs_entries: sum("rows_carrying_bdbs_entries"),
  store_rows_with_no_line: landedRows.length, ledger_rows_with_no_store_row: goneLines.length };
// how the store differs from the one the ledger was read at, as the row-strikes record says and this run found it
const followed = { ...followedRecord(follow, { left: goneLines, rekeyed: rekeyedLines, retexted: retextedLines, landed: landedRows }),
  ...(pin.struck_lines ? { lines_of_rows_struck_before_the_ledger_was_read: { file: `${HOME}/${pin.folder}/${pin.struck_lines.file}`, sha256: pin.struck_lines.sha256, lines: struckBefore.length, by_list: struckBeforeBy } } : {}),
  struck_rows_with_a_twin_of_their_own_source: struckWithATwin, entries_given_to_a_twin: given };
// what each list gave, as the walk found it, and what of it the record does not explain
const count = (o) => Object.values(o || {}).reduce((a, c) => a + c, 0);
const lists = listRuns.map((run) => {
  const l = run.l, lt = listTally.get(l), gone = {};
  for (const g of run.gone) gone[g.by.list] = (gone[g.by.list] || 0) + 1;
  return { name: l.name, relay: l.relay, letter: l.letter, from: l.from, rule: `${HOME}/${l.folder}/${l.rule.file}`, receipt: `${HOME}/${l.folder}/${l.receipt.file}`,
    list: { file: l.list.file, bytes: l.list.bytes, sha256: l.list.sha256, lines: l.list.lines, kept: l.list.kept }, read_at_store_version: l.read_at_store_version,
    facts_landed: l.facts, sources: l.sources,
    totals: { sources: Object.keys(l.sources).length, lines: run.lines, lines_whose_row_was_struck_or_withheld_since: gone, store_rows_of_its_sources: lt.store_rows_of_its_sources,
      rows_carrying_an_entry: lt.rows_carrying_an_entry, rows_with_several_numbers: lt.rows_with_several_numbers, rows_of_its_sources_with_no_line: lt.store_rows_of_its_sources - lt.lines_met,
      lines_whose_facts_are_not_landed: run.lines - run.gone.length - lt.rows_carrying_an_entry, facts_not_landed: run.facts_not_landed } };
});
const listLinesWithNoRow = listRuns.map((run) => run.lines - run.gone.length - listTally.get(run.l).lines_met);
const listMoved = [...listTally.values()].reduce((a, lt) => a + lt.rows_moved, 0);
const moved = sum("rows_moved") + listMoved, shardsRewritten = touched.length;
console.log(`row entries · relay ${pin.relay} · ${n(ledgerRows)} rows of ${SOURCES.size} sources in the ledger (read from the store at ${readAt}) · ${n(totals.store_rows_of_those_sources)} rows of them in the store of ${n(storeRows)} · ${n(totals.rows_carrying_the_slot)} carry the slot (${n(totals.rows_with_a_number)} with a number, ${n(totals.rows_carrying_steps_letters)} with STEP's letters, ${n(totals.rows_carrying_bdbs_entries)} with BDB's entries) · followed through ${follow.rounds.length} round(s) since: ${followedSaid(followed)} · ${n(struckWithATwin)} struck rows have a twin of their own source, ${given.length} of them given entries · unexplained: ${n(rowsWithNoLine)} rows with no line, ${n(linesWithNoRow)} lines with no row · ${n(moved)} rows move (${touched.length} shards)`);
for (const g of given) console.log(`  given: the row of ${g.from[2]} at rank ${g.from[1]} (${g.from[3]}), struck by ${g.struck_by}, gives ${JSON.stringify(g.gave)} to its twin at rank ${g.to[1]} under the key its words still stand under`);
if (pin.struck_lines) console.log(`  the lines of ${n(struckBefore.length)} rows struck before the ledger was read are kept beside it (${Object.entries(struckBeforeBy).map(([list, c]) => `${n(c)} by ${list}`).join(", ")}); the twins above are found among them`);
for (const [i, x] of lists.entries()) console.log(`  list · ${x.name} (relay ${x.relay}) · ${n(x.totals.lines)} lines of ${x.totals.sources} source(s), read from the store at ${x.read_at_store_version} · lands ${x.facts_landed.join(", ")} · ${n(x.totals.rows_carrying_an_entry)} rows carry an entry (${n(x.totals.rows_with_several_numbers)} several numbers) of ${n(x.totals.store_rows_of_its_sources)} rows of its sources · not landed: ${Object.entries(x.totals.facts_not_landed).map(([k, c]) => `${k} on ${n(c)} lines`).join(", ") || "nothing"}${x.totals.lines_whose_facts_are_not_landed ? ` (${n(x.totals.lines_whose_facts_are_not_landed)} lines give nothing that lands)` : ""}${count(x.totals.lines_whose_row_was_struck_or_withheld_since) ? ` · ${n(count(x.totals.lines_whose_row_was_struck_or_withheld_since))} lines name a row a round took since` : ""} · unexplained: ${n(listLinesWithNoRow[i])} lines with no row · ${n(listTally.get(listRuns[i].l).rows_moved)} rows move`);
if (listLinesWithNoRow.some(Boolean)) refuse(`${listLinesWithNoRow.reduce((a, c) => a + c, 0)} line(s) of the pin's lists find no row that no round struck, withheld or moved since their list was read. The record does not explain them, and nothing is guessed`);
if (rowsWithNoLine || linesWithNoRow) refuse(`${rowsWithNoLine} row(s) of the ledger's sources have no line and no round of the row-strikes record landed them, and ${linesWithNoRow} line(s) find no row that no round struck, withheld or moved, since the store was ${readAt}; first row without a line: ${noLine[0] || "none"}. The record does not explain them, and nothing is guessed`);
const record = { pin: `${HOME}/PIN.json`, relay: pin.relay, letter: pin.letter, from: pin.from, rule: `${HOME}/${pin.folder}/${pin.rule.file}`, receipt: `${HOME}/${pin.folder}/${pin.receipt.file}`,
  ledger: { file: pin.ledger.file, bytes: pin.ledger.bytes, sha256: pin.ledger.sha256, lines: pin.ledger.lines, kept: pin.ledger.kept }, read_at_store_version: readAt,
  partings: (pin.partings || []).map((p) => ({ name: p.name, fact: p.fact, sources: p.sources })), totals, followed, ...(lists.length ? { lists } : {}) };
const had = index.row_entries || null;
const nothingToWrite = !moved && !!had && Object.keys(record).every((k) => same(had[k], record[k])) && !("lists" in had && !lists.length);
// the run's figures, one line of JSON, for a script that holds a run to what was rehearsed
console.log(`figures ${JSON.stringify({ relay: pin.relay, ledger_sha256: pin.ledger.sha256, read_at_store_version: readAt, store_version: index.store_version || null, ...totals,
  rounds_since: follow.rounds.length, lines_whose_row_was_struck: count(followed.lines_whose_row_was_struck), lines_whose_row_was_withheld: count(followed.lines_whose_row_was_withheld),
  rows_re_keyed_and_followed: count(followed.rows_re_keyed_and_followed), rows_retexted_and_followed: count(followed.rows_retexted_and_followed), rows_landed_since_with_no_line: count(followed.rows_landed_since_with_no_line),
  struck_rows_with_a_twin_of_their_own_source: struckWithATwin, entries_given_to_a_twin: given.length,
  ...(pin.struck_lines ? { lines_of_rows_struck_before_the_ledger_was_read: struckBefore.length } : {}),
  ...(lists.length ? { lists: lists.map((x) => ({ relay: x.relay, list_sha256: x.list.sha256, lines: x.totals.lines, rows_carrying_an_entry: x.totals.rows_carrying_an_entry, facts_not_landed: x.totals.facts_not_landed })), list_rows_moved: listMoved } : {}),
  rows_moved: moved, shards_moved: touched.length, the_index_names_this_run: nothingToWrite })}`);
if (DRY) { console.log("dry run — nothing written"); process.exit(0); }
if (nothingToWrite) { console.log("nothing moves and the index names this ledger as it is followed — nothing written"); process.exit(0); }
const sources = JSON.parse(JSON.stringify(tally));   // the counts of the reading walk, which the receipt keeps: the writing walk finds nothing left to move
if (moved) walk(true);

// ---- write: the index, the receipt -------------------------------------------------------------
const on = momentOf(GIVEN_ON);
const digest = createHash("sha256");
let shardBytes = 0;
for (const name of shardNames) { const b = readFileSync(join(STORE, "shards", name)); digest.update(b); shardBytes += b.length; }
const was = index.store_version || null, now = digest.digest("hex").slice(0, 12);
const WHAT = "a row with a line in the corpus lane's row entries ledger carries, in the facts slot (slot 10, an object), n: the Strong's numbers of the entries its own source files it under, where it has any; t: for a row of a source whose entries are STEP's own tags, those that carry STEP's letter; b: for a row of a source that names BDB's own entries, those entries. A row whose same-source twin under a key ending in a maqaf was struck carries, after its own, the entries of that twin's line that it lacked (followed.entries_given_to_a_twin names each pair). The texts are the served bytes, unchanged. At a place the gate reads these against the tag of the word's core piece. A row of a further source named by a list of the pin (lists) carries n as its line gives it: the numbers of the Bible dictionaries' entries its own pointed head form and kind of word meet, joined by the corpus lane";
const lastMove = now !== was || !had ? { store_version_before: was, store_version: now } : { store_version_before: had.store_version_before, store_version: had.store_version };
index.row_entries = { rule_id: ENTRY_GATE_RULE_ID, applied_on: on, applied_by: "tools/apply-row-entries-v1.mjs", ...record, ...lastMove, what: WHAT };
index.counts = { ...(index.counts || {}), shard_bytes_total: shardBytes };
if (now !== was) { index.store_version = now; index.store_version_history = [...(index.store_version_history || []), { was, now, why: ENTRY_GATE_RULE_ID, on }]; }
writeFileSync(join(STORE, "index.json"), JSON.stringify(index, null, 1));
const prior = existsSync(RECEIPT) ? JSON.parse(readFileSync(RECEIPT, "utf8")) : null;
writeFileSync(RECEIPT, JSON.stringify({ schema_version: "ROW_ENTRIES_RECEIPT_V1", rule_id: ENTRY_GATE_RULE_ID, what: WHAT, pin: { file: `${HOME}/PIN.json`, relay: pin.relay, letter: pin.letter },
  runs: [...((prior && prior.runs) || []), { ran_at: on, store_version: { was, now }, followed, shards_rewritten: shardsRewritten, rows_moved: moved, totals, sources, ...(lists.length ? { lists } : {}) }] }, null, 1) + "\n");
console.log(`written · store ${was} -> ${now}${now === was ? " (no shard moved)" : ""} · shards weigh ${n(shardBytes)} bytes · index.row_entries names the ledger · receipt ${RECEIPT}`);
