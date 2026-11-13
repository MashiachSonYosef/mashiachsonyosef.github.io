#!/usr/bin/env node
// RUN: tree
// GUARDS: entry-gate-rule-v1-a-row-of-another-entry-than-the-words-is-withheld-and-a-row-of-its-own-entry-stands-whatever-its-points
// LEDGER: -
// no frame letter. A check reads the ledger's pin, the store, the zones and
// the pages and judges them; it is not the ledger for one.
//
// A ROW OF ANOTHER ENTRY THAN THE WORD'S IS WITHHELD, AND A ROW OF ITS OWN
// ENTRY STANDS WHATEVER ITS POINTS. The store keys a row by bare letters and
// several words share a key. The corpus lane's row entries ledger (relay
// v172) gives each row the entry its own source files it under;
// tools/apply-row-entries-v1.mjs writes that on the row (the facts slot);
// the lattice gives each place the entry that stands there, and
// tools/project-lattice-v12-v1.mjs writes that on the word (tg) and bakes
// the leaders at each kind of place (grades[surface].e, keyed as
// tools/place-leaders-v1.mjs says: the place's tags, and whether it is a
// name, which the names gate asks beside this one); the page asks the entry
// before it asks the pointing (tools/entry-gate-v1.mjs holds the gate's own
// functions, and the page carries them under the same names).
//
// What is held here, each recomputed and none read from a tool's receipt:
//
//   E1  the ledger's rule and receipt are the bytes their pin names, the
//       receipt names the ledger by the pin's sha256, size and lines, and
//       each parting's sources are sources of the store under those ids
//   E2  every row's facts are well formed: an object of known facts only,
//       none empty; n a list of Strong's numbers with no repeat; t a list of
//       lettered tags, each of a number in n, on a row of the first
//       parting's sources only; b a list of entries, on a row of the second
//       parting's only; opens an entry and the point of the numbered sense
//       the row opens (tools/apply-sense-openings-v1.mjs; which rows carry it
//       is check-sense-openings-v1's to hold); and no row ends in an empty
//       slot
//   E3  the store's index names the rule, the pin, the ledger and totals
//       that are a recount's
//   E4  the corpus lane's own counts, source by source: the rows of each
//       source the ledger reads, and how many carry one number, several and
//       none, less the rows the index says the store has moved on by
//   E5  with the ledger on this machine (--ledger <file>, or
//       ROW_ENTRIES_LEDGER): every line finds its row and every row its
//       line, and each row carries exactly the facts its line gives. Without
//       the ledger this is said and not judged
//   E6  the page's own functions, read out of zone.html and run, give the
//       module's verdict for every row of every key at every entry a served
//       zone asks it under, and the same leaders
//   E7  a word's tags: a tag, or a list of several, each as the lattice
//       writes a tag; on a word with a key, or on one half of a place
//       written one way and read another, never both; the zone's receipt
//       counts them as a recount does. With the lattice on this machine
//       (--lattice <dir>, or LATTICE_DIR) each is the core tags of the
//       lattice's own position, and its pieces spell the tagged form.
//       Without the lattice that half is said and not judged
//   E8  the leaders at a kind of place (grades[surface].e): each speaks for
//       a kind of place a word of that surface stands at in the book,
//       differs from the surface's own leaders, and is credited to a row
//       that carries its reading and that the place keeps (not of another
//       entry, and not a name's where the place is not one); and where
//       every row carrying the surface's own leader is withheld at a kind
//       of place, that place has leaders of its own
//   E9  on the page, a word whose key carries rows of another entry: under
//       the default its card withholds exactly those, says so on its
//       withheld line naming the place's entry (its tags where each
//       carries STEP's letter and a row is asked by letter, else its
//       numbers), and prints no reading that only such rows carry; under
//       "keep" it withholds none and the reading is back
//   E10 a row of the place's own entry that its source points otherwise
//       stands: a reading only such rows carry is on the card under the
//       default, credited to its source
//   E11 the two partings, each on a word found in the data: a row that is
//       this entry by its number and another by STEP's letter, and a row
//       with no number that names another of BDB's own entries, are
//       withheld and counted
//   E12 a word its place gives no tag is not gated
//   E13 where the place moves the leader, the line under the word and the
//       card's first pill are the place's leader
//
// The words are found in the data, never named.
//
// Run: node tools/check-entry-gate-v1.mjs [--ledger <row-entries-v1.jsonl>] [--lattice <dir>]
import { readFileSync, readdirSync, existsSync, createReadStream } from "node:fs";
import { gunzipSync, createGunzip } from "node:zlib";
import { createInterface } from "node:readline";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { openRouteStore, factsOf, FACTS_SLOT, readingKey } from "./gloss-store-v1.mjs";
import { ENTRY_GATE_RULE_ID, numberOf, tagOf, letteredOf, placeEntry, entrySaid, bdbEntriesAt, entryVerdict } from "./entry-gate-v1.mjs";
import { nameWithheld } from "./names-gate-v1.mjs";
import { leadersKey, onlyLeaders, PLACE_IS_A_NAME } from "./place-leaders-v1.mjs";
import { readPinned, readPinnedLines, PinFault } from "./pinned-v1.mjs";
import { gradeRow } from "./pointing-grade-v1.mjs";
import { isOtherStem } from "./stem-family-v1.mjs";
import { zonesServed } from "./zones-on-disk-v1.mjs";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { serveTree } from "./serve-tree-v1.mjs";
import { plainWord, openGatedCard } from "./gated-card-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const STORE = join(K3, "data", "route-store");
const PINS = join(K3, "data", "row-entries");
const ZONES = join(K3, "data", "zones");
const HOME = "reader/data/row-entries";   // the same folder as the index names it
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > 0 ? process.argv[i + 1] : d; };
const LEDGER = arg("ledger", process.env.ROW_ENTRIES_LEDGER || null);
const LATTICE = arg("lattice", process.env.LATTICE_DIR || null);
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const nf = (x) => Number(x).toLocaleString("en-US");
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const first = (list, n = 3) => list.slice(0, n).join(" · ");
const gz = (path) => JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"));

console.log(`— ${ENTRY_GATE_RULE_ID} —\n`);
if (!existsSync(join(PINS, "PIN.json"))) { console.log("SKIPPED — no row entries on this disk (data/row-entries/PIN.json)"); process.exit(3); }
const pin = JSON.parse(readFileSync(join(PINS, "PIN.json"), "utf8"));
const store = openRouteStore(STORE);
const index = store.index;
const rec = index.row_entries || null;

// ---- E1: the pinned bytes ---------------------------------------------------------------------
let theirs = null;
const FACT_OF = new Map();   // m id -> the fact a parting reads on its rows
{
  const faults = [];
  if (pin.schema_version !== "ROW_ENTRIES_PIN_V1" || !pin.ledger || !pin.rule || !pin.receipt) faults.push("the pin names no ledger, rule or receipt");
  else {
    try {
      readPinned(join(PINS, pin.folder, pin.rule.file), pin.rule, `${pin.folder}/${pin.rule.file}`);
      theirs = JSON.parse(readPinned(join(PINS, pin.folder, pin.receipt.file), pin.receipt, `${pin.folder}/${pin.receipt.file}`).toString("utf8"));
    } catch (e) { if (e instanceof PinFault) faults.push(e.message); else throw e; }
    const out = (theirs && theirs.output) || {};
    if (theirs && (out.sha256 !== pin.ledger.sha256 || out.bytes !== pin.ledger.bytes || out.lines !== pin.ledger.lines || out.file !== pin.ledger.file)) faults.push("the lane's receipt names another ledger than the pin");
    if (theirs && (theirs.rule || {}).sha256 !== pin.rule.sha256) faults.push("the lane's receipt names another rule than the pin");
    for (const p of pin.partings || []) {
      if (!["t", "b"].includes(p.fact)) faults.push(`the parting "${p.name}" asks for the fact "${p.fact}"`);
      for (const [m, key] of Object.entries(p.sources || {})) {
        if (((index.m_sources || {})[m] || {}).key !== key) faults.push(`the parting "${p.name}" reads ${m} as ${key}, and the store holds ${((index.m_sources || {})[m] || {}).key || "no source"} there`);
        if (FACT_OF.has(m)) faults.push(`${m} stands under two partings`);
        FACT_OF.set(m, p.fact);
      }
    }
    if (!(pin.partings || []).length) faults.push("the pin names no parting");
  }
  check("E1  the ledger's rule and receipt are the bytes their pin names, the receipt names the ledger as the pin does, and each parting's sources are the store's", faults.length === 0,
    faults.length ? first(faults) : `relay ${pin.relay} · ledger ${String(pin.ledger.sha256).slice(0, 12)}… ${nf(pin.ledger.lines)} lines, ${nf(pin.ledger.bytes)} bytes (kept off this tree) · ${(pin.partings || []).map((p) => `${p.name}: ${Object.keys(p.sources).join(", ")}`).join(" · ")}`);
}
// the sources the ledger reads, from the lane's own receipt
const READ = new Map(Object.entries((theirs && theirs.by_source) || {}));

// ---- E2, E3, E4: every row of the store -------------------------------------------------------
const KNOWN = new Set(["n", "t", "b", "name", "opens"]);
const tally = {};   // m id -> the recount
const of = (m) => (tally[m] ||= { rows: 0, one: 0, several: 0, none: 0, t: 0, b: 0, slot: 0 });
const byKeyId = new Map();   // for E5: key, then "rank m sha16" -> the facts the store's rows carry, as JSON
const mineOf = (f) => { if (!f) return null; const o = {}; for (const k of ["n", "t", "b"]) if (k in f) o[k] = f[k]; return Object.keys(o).length ? o : null; };
{
  const faults = [];
  let rows = 0;
  for (const name of readdirSync(join(STORE, "shards")).filter((f) => f.endsWith(".bin")).sort()) {
    const body = gz(join(STORE, "shards", name));
    for (const [k, list] of Object.entries(body)) for (const row of list) {
      rows += 1;
      const m = String(row[3]);
      const where = `${k} (${m}, rank ${row[0]})`;
      if (row.length > 7 && (row[row.length - 1] === null || row[row.length - 1] === undefined)) faults.push(`${where}: ends in an empty slot`);
      const raw = row.length > FACTS_SLOT ? row[FACTS_SLOT] : null;
      if (raw !== null && raw !== undefined && (typeof raw !== "object" || Array.isArray(raw))) { faults.push(`${where}: its facts slot is not an object`); continue; }
      const f = factsOf(row);
      if (f) {
        const keys = Object.keys(f);
        if (!keys.length) faults.push(`${where}: an empty facts object`);
        for (const key of keys) if (!KNOWN.has(key)) faults.push(`${where}: a fact "${key}" no tool writes`);
        for (const key of ["n", "t", "b"]) if (key in f && (!Array.isArray(f[key]) || !f[key].length || new Set(f[key]).size !== f[key].length || f[key].some((x) => typeof x !== "string" || !x))) faults.push(`${where}: ${key} is not a list of distinct entries`);
        if (Array.isArray(f.n) && f.n.some((x) => !/^H[1-9]\d*$/u.test(x))) faults.push(`${where}: a number that is not H and digits`);
        if (Array.isArray(f.t)) {
          if (FACT_OF.get(m) !== "t") faults.push(`${where}: STEP's letters on a row of a source the parting does not read`);
          if (f.t.some((x) => letteredOf(x) !== x || !(f.n || []).includes(numberOf(x)))) faults.push(`${where}: a lettered tag that is not one, or whose number the row does not carry`);
        }
        if (Array.isArray(f.b) && FACT_OF.get(m) !== "b") faults.push(`${where}: BDB's entries on a row of a source the parting does not read`);
        if ("opens" in f && (typeof f.opens !== "string" || !/^\S+( \S+)?$/u.test(f.opens))) faults.push(`${where}: opens is not an entry and its point`);
        if (mineOf(f) && !READ.has(m)) faults.push(`${where}: an entry on a row of a source the ledger does not read`);
      }
      if (!READ.has(m)) continue;
      const t = of(m); t.rows += 1;
      const mine = mineOf(f);
      if (mine) t.slot += 1;
      if (mine && mine.n) { if (mine.n.length > 1) t.several += 1; else t.one += 1; } else t.none += 1;
      if (mine && mine.t) t.t += 1;
      if (mine && mine.b) t.b += 1;
      if (LEDGER) {
        const id = `${row[0]} ${m} ${sha256(Buffer.from(String(row[1] ?? ""), "utf8")).slice(0, 16)}`;
        const held = byKeyId.get(k) || byKeyId.set(k, new Map()).get(k);
        (held.get(id) || held.set(id, []).get(id)).push(JSON.stringify(mine));
      }
    }
  }
  check("E2  every row's facts are well formed, each on a row of a source that may carry it, and no row ends in an empty slot", faults.length === 0,
    faults.length ? `${nf(faults.length)} · ${first(faults)}` : `${nf(rows)} rows read · ${nf(Object.values(tally).reduce((a, t) => a + t.slot, 0))} carry an entry`);
}
const sum = (f) => Object.values(tally).reduce((a, t) => a + t[f], 0);
{
  const faults = [];
  if (!rec) faults.push("the index holds no row_entries record");
  else {
    if (rec.rule_id !== ENTRY_GATE_RULE_ID) faults.push("the record names another rule");
    if (rec.pin !== `${HOME}/PIN.json` || rec.relay !== pin.relay) faults.push("the record names another pin or relay");
    if (!same(rec.ledger, { file: pin.ledger.file, bytes: pin.ledger.bytes, sha256: pin.ledger.sha256, lines: pin.ledger.lines, kept: pin.ledger.kept })) faults.push("the record names another ledger than the pin");
    if (!same(rec.partings, (pin.partings || []).map((p) => ({ name: p.name, fact: p.fact, sources: p.sources })))) faults.push("the record's partings are not the pin's");
    if (rec.read_at_store_version !== ((((theirs || {}).inputs || {}).route_store || {}).store_version || null)) faults.push("the record says the ledger was read at another version of the store than the lane's receipt says");
    const t = rec.totals || {};
    const mine = { sources: READ.size, store_rows_of_those_sources: sum("rows"), rows_carrying_the_slot: sum("slot"), rows_with_a_number: sum("one") + sum("several"), rows_with_several_numbers: sum("several"),
      rows_carrying_steps_letters: sum("t"), rows_carrying_bdbs_entries: sum("b") };
    for (const [k, v] of Object.entries(mine)) if (t[k] !== v) faults.push(`totals.${k} says ${t[k]} and a recount gives ${v}`);
    if (t.keys_in_the_ledger !== pin.ledger.lines) faults.push("totals.keys_in_the_ledger is not the ledger's lines");
    if (t.rows_with_no_number !== sum("none") - (t.store_rows_with_no_line || 0)) faults.push(`totals.rows_with_no_number says ${t.rows_with_no_number} and a recount gives ${sum("none") - (t.store_rows_with_no_line || 0)}`);
  }
  check("E3  the store's index names the rule, the pin, the ledger and totals that are a recount's", faults.length === 0,
    faults.length ? first(faults) : `${nf(sum("rows"))} rows of ${READ.size} sources · ${nf(sum("slot"))} carry the slot · ${nf(sum("one") + sum("several"))} a number (${nf(sum("several"))} several) · STEP's letters on ${nf(sum("t"))} · BDB's entries on ${nf(sum("b"))}`);
}
{
  // the store has moved on by what the index says it has: rows with no line, lines with no row
  const moved = rec ? (rec.totals.store_rows_with_no_line || 0) + (rec.totals.ledger_rows_with_no_store_row || 0) : 0;
  const faults = [];
  for (const [m, s] of READ) {
    const t = tally[m] || { rows: 0, one: 0, several: 0, none: 0 };
    const c = s.class || {};
    const want = { rows: s.rows, one: c["one number"] || 0, several: c["several numbers"] || 0, none: c["no number"] || 0 };
    for (const k of Object.keys(want)) if (Math.abs(t[k] - want[k]) > moved) faults.push(`${m}: ${k} ${t[k]}, the lane counts ${want[k]}`);
  }
  check("E4  the corpus lane's own counts, source by source: the rows of each source the ledger reads, and how many carry one number, several and none", !!theirs && READ.size > 0 && faults.length === 0,
    !theirs ? "the lane's receipt was not read" : faults.length ? `${faults.length} · ${first(faults)}` : `${READ.size} sources · ${nf(sum("rows"))} rows: ${nf(sum("one"))} one number, ${nf(sum("several"))} several, ${nf(sum("none"))} none${moved ? ` · within the ${moved} row(s) the index says the store has moved on by` : ""}`);
}

// ---- E5: the ledger itself, where it is here ---------------------------------------------------
if (!LEDGER) console.log("  --  E5 was not judged here: the corpus lane's row entries ledger is not on this machine (--ledger <row-entries-v1.jsonl> or ROW_ENTRIES_LEDGER), so no row's facts were read against its own line");
else {
  const faults = [];
  let lines = null, ledgerRows = 0, met = 0;
  try { lines = readPinnedLines(LEDGER, pin.ledger, pin.ledger.file); } catch (e) { if (e instanceof PinFault) faults.push(e.message); else throw e; }
  const wantOf = (m, entries, numbers) => {
    const f = {};
    if (numbers.length) f.n = numbers;
    if (FACT_OF.get(m) === "t") { const t = [...new Set(entries.map((e) => (Array.isArray(e) ? e[0] : e)).map(tagOf).filter((x) => /^H\d+[A-Za-z]$/u.test(x)))]; if (t.length) f.t = t; }
    if (FACT_OF.get(m) === "b" && entries.length) f.b = entries.map(String);
    return Object.keys(f).length ? f : null;
  };
  let noRow = 0, wrong = 0;
  for (const x of lines || []) {
    const want = new Map();
    for (const r of x.rows) { ledgerRows += 1; const id = `${r[0]} ${r[1]} ${r[2]}`; (want.get(id) || want.set(id, []).get(id)).push(JSON.stringify(wantOf(String(r[1]), r[4], r[5]))); }
    const held = byKeyId.get(x.k) || new Map();
    for (const [id, list] of want) {
      const got = held.get(id) || [];
      if (got.length < list.length) noRow += list.length - got.length;
      met += Math.min(got.length, list.length);
      if (got.length === list.length && !same([...got].sort(), [...list].sort())) { wrong += 1; if (faults.length < 6) faults.push(`${x.k} ${id}: the row carries ${got[0]} and its line gives ${list[0]}`); }
      held.delete(id);
    }
    if (!held.size) byKeyId.delete(x.k);
  }
  let noLine = 0;
  for (const held of byKeyId.values()) for (const got of held.values()) noLine += got.length;
  const t = (rec && rec.totals) || {};
  if (lines && noRow !== (t.ledger_rows_with_no_store_row || 0)) faults.push(`${noRow} line(s) find no row, and the index says ${t.ledger_rows_with_no_store_row || 0}`);
  if (lines && noLine !== (t.store_rows_with_no_line || 0)) faults.push(`${noLine} row(s) of the ledger's sources have no line, and the index says ${t.store_rows_with_no_line || 0}`);
  if (lines && ledgerRows !== t.rows_in_the_ledger) faults.push(`the ledger holds ${ledgerRows} rows and the index says ${t.rows_in_the_ledger}`);
  check("E5  every line of the ledger finds its row and every row its line, and each row carries exactly the facts its line gives", !!lines && faults.length === 0,
    faults.length ? `${wrong ? `${nf(wrong)} rows carry other facts · ` : ""}${first(faults)}` : `${nf(lines.length)} lines · ${nf(ledgerRows)} rows of the ledger, ${nf(met)} met by a row of the store carrying their facts`);
}
byKeyId.clear();

// ---- the zones: what is asked, and the words for the page --------------------------------------
const rowsOf = (k) => (store.routesFor(k) || []).filter((r) => index.m_sources[r[3]]);
const TAG = /^H\d+[A-Za-z]?$/u;   // STEP's letter is a capital, or a small one where it ran past its capitals
const judge = (rows, tags) => {
  const place = placeEntry(tags);
  if (!place) return null;
  const facts = rows.map(factsOf);
  const bdbHere = bdbEntriesAt(place, facts);
  const verdicts = facts.map((f) => entryVerdict(f, place, bdbHere));
  return { place, facts, bdbHere, verdicts, other: verdicts.filter((v) => v === "other").length };
};
// the page's functions, read out of the page
let page = null, pageWhy = "";
try {
  const html = readFileSync(join(K3, "zone.html"), "utf8");
  const grab = (head, end) => { const a = html.indexOf(head); if (a < 0 || html.indexOf(head, a + 1) >= 0) throw new Error(`zone.html does not hold exactly one "${head.trim()}"`); const b = html.indexOf(end, a); if (b < 0) throw new Error(`zone.html does not close "${head.trim()}"`); return html.slice(a, b); };
  page = new Function(`${grab("\n  const factsOf = (row) => ", ";\n")}${grab("\n  const numberOf = (tag) => ", "\n  window.__entryGate = ")}${grab("\n  const PLACE_IS_A_NAME = ", "\n  const versesOwn = ")}\n return { numberOf, tagOf, placeEntry, entrySaid, factsOf, bdbEntriesAt, entryVerdict, leadersKey, onlyLeaders };`)();
} catch (e) { pageWhy = e.message; }

const served = zonesServed().filter((z) => existsSync(join(ZONES, `${z}.lattice.bin`)));
const WANT = ["gated", "kept", "lettered", "bdb", "untagged"];
// The words for the page, a few of each kind: a word the page joins to its neighbors in one cell (a run one license
// names) opens the cell's card and not its own, which only the page can say, so the first of a kind whose card is
// its own is the one judged.
const MOST = 4;
const picks = {};       // kind -> the words found for it, MOST at most
const more = (kind) => (picks[kind] || []).length < MOST;
const found = (kind, pick) => { (picks[kind] ||= []).push(pick); };
const leaders = new Map();   // E13's words: zone -> three at most, of four zones at most
const e6 = { pairs: 0, rows: 0, faults: [] }, e7 = { tagged: 0, lists: 0, halves: 0, faults: [], lattice: 0, latticeFaults: [], books: 0 }, e8 = { entries: 0, faults: [], spoken: 0 };
const asked = new Set();   // key, then the tags: judged once for E6
// a reading only rows of the given kind carry, among the key's rows: [text, a row carrying it] or null
const readingOnlyOf = (rows, isOfKind, wanted) => {
  for (const [i, row] of rows.entries()) {
    if (!wanted(row, i)) continue;
    for (const grp of store.readingPool([row], "oldest")) {
      const carriers = store.carriersOf(rows, grp.text);
      if (carriers.length && carriers.every((c) => isOfKind(c, rows.indexOf(c)))) return [grp.text, row];
    }
  }
  return null;
};
for (const z of served) {
  const zone = gz(join(ZONES, `${z}.bin`));
  const side = gz(join(ZONES, `${z}.lattice.bin`));
  const grades = side.grades || {};
  const recount = { places_tagged: 0 };
  // a place is a name where its word is marked; a book whose places were not read for names reads every place as one
  const namesRead = !!((((zone.emitted_from || {}).toggles || {}).lattice || {}).names);
  const isName = (w) => !namesRead || !!w.np;
  const stoodUnder = new Map();   // surface -> the kinds of place its forms stand at in this book, by the leaders' key
  // the lattice's own positions, by verse, where it is here
  let byRef = null;
  if (LATTICE && existsSync(join(LATTICE, `positions-${z}-v12.jsonl.gz`))) {
    byRef = new Map(); e7.books += 1;
    const rl = createInterface({ input: createReadStream(join(LATTICE, `positions-${z}-v12.jsonl.gz`)).pipe(createGunzip()), crlfDelay: Infinity });
    for await (const line of rl) { if (!line) continue; const p = JSON.parse(line); if (p.c0 !== "ON") continue; (byRef.get(p.ref) || byRef.set(p.ref, []).get(p.ref)).push(p); }
  }
  for (const [si, sec] of (zone.sections || []).entries()) {
    const words = sec.words || [];
    const on = words.filter((w) => !w.mark && (w.w ? w.w.some((r) => r.k) : !!w.k));
    const theirsHere = byRef ? byRef.get(sec.label) || null : null;
    for (const [e, w] of words.entries()) {
      if (w.mark) continue;
      const halves = (w.w || []).filter((r) => r && r.tg);
      if (w.tg && halves.length) e7.faults.push(`${z} ${sec.label}: a pair and its half both carry tags`);
      if (halves.length > 1) e7.faults.push(`${z} ${sec.label}: both halves of a pair carry tags`);
      const h = w.tg ? w : halves[0] || null;
      if (h) {
        const tags = [].concat(h.tg);
        recount.places_tagged += 1; e7.tagged += 1; if (Array.isArray(h.tg)) e7.lists += 1; if (h !== w) e7.halves += 1;
        if (!h.k || !tags.length || (Array.isArray(h.tg) && tags.length < 2) || tags.some((t) => typeof t !== "string" || !TAG.test(t))) e7.faults.push(`${z} ${sec.label}: ${JSON.stringify(h.tg)} is not a tag or a list of several`);
        if (theirsHere) {
          const at = on.indexOf(w), p = theirsHere.length === on.length ? theirsHere[at] : null;
          const cores = p ? (p.pieces || []).filter((x) => x && x.role === "core" && x.tag).map((x) => String(x.tag)) : null;
          const spelled = p ? (p.pieces || []).map((x) => (x && x.consonants) || "").join("") : null;
          e7.lattice += 1;
          if (!p) e7.latticeFaults.push(`${z} ${sec.label}: a tagged word in a verse the lattice counts otherwise`);
          else if (!same(cores, tags) || spelled !== h.k) e7.latticeFaults.push(`${z} ${sec.label} word ${at + 1}: carries ${tags.join(" ")} on ${h.k}; the lattice's core tags are ${cores.join(" ") || "none"} and its pieces spell ${spelled}`);
        }
        // every key the page asks under these tags: the tagged form's, and the core piece's own cell
        const keys = [h.k];
        const cores = Array.isArray(w.pg) ? w.pg.filter((x) => x && x.r === "core") : [];
        if (cores.length === 1 && cores[0].k && cores[0].k !== h.k) keys.push(cores[0].k);
        for (const k of keys) {
          const id = `${k}\u0001${tags.join(" ")}`;
          if (asked.has(id)) continue;
          asked.add(id);
          const rows = rowsOf(k);
          const mine = judge(rows, tags);
          if (!mine || !page) continue;
          e6.pairs += 1; e6.rows += rows.length;
          const pp = page.placeEntry(tags);
          const pb = pp ? page.bdbEntriesAt(pp, rows.map(page.factsOf)) : null;
          if (!pp || !same(pp, mine.place) || !same([...pb].sort(), [...mine.bdbHere].sort())) { e6.faults.push(`${k} under ${tags.join(" ")}: the place or BDB's entries there`); continue; }
          if (!same(page.entrySaid(pp), entrySaid(mine.place))) { e6.faults.push(`${k} under ${tags.join(" ")}: how the card names the place's entry`); continue; }
          const theirs2 = rows.map((row) => page.entryVerdict(page.factsOf(row), pp, pb));
          if (!same(theirs2, mine.verdicts)) e6.faults.push(`${k} under ${tags.join(" ")}: row ${theirs2.findIndex((v, i) => v !== mine.verdicts[i]) + 1} of ${rows.length}`);
        }
      }
      // the kinds of place each form stands at: by its pointed surface (a read half's without the source's
      // brackets), its own tags and whether its place is a name
      for (const form of [w, ...(w.w || [])]) {
        if (!form || typeof form.s !== "string" || !form.k) continue;
        const s = form === w ? form.s : form.s.replace(/^\[+|\]+$/gu, "");
        const tags = form.tg ? [].concat(form.tg) : null;
        (stoodUnder.get(s) || stoodUnder.set(s, new Map()).get(s)).set(leadersKey(tags, isName(w)), { tags, k: form.k, isName: isName(w) });
      }
      // the words for the page: one region, which its place does not divide, so the card opens on its whole form
      if (!plainWord(words, e)) continue;
      const here = { zone: z, section: si, entry: e, label: sec.label, s: w.s, k: w.k };
      if (!w.tg) {
        if (more("untagged") && rowsOf(w.k).some((r) => (factsOf(r) || {}).n)) found("untagged", here);
        continue;
      }
      const gr = grades[w.s];
      const tags = [].concat(w.tg);
      const named = isName(w);
      const wantsLeader = (leaders.has(z) ? leaders.get(z).length < 3 : leaders.size < 4) && gr && gr.e && gr.e[leadersKey(tags, named)];
      if (WANT.every((kind) => !more(kind) || kind === "untagged") && !wantsLeader) continue;
      const rows = rowsOf(w.k);
      const j = rows.length ? judge(rows, tags) : null;
      if (!j) continue;
      const rs = (side.stems || {})[w.k] || null;
      const otherStem = (row) => !!(rs && gr && Array.isArray(gr.st) && gr.st.length && isOtherStem(rs[`${row[3]}\u0001${row[0]}\u0001${row[1]}`], gr.st));
      const rowGrades = rows.map((row) => gradeRow(row, w.s));
      const attested = rowGrades.includes("m");
      // a row the default keeps: not of another entry, not a name's where the place is not one, of this entry or
      // not pointed otherwise, and not of another stem
      const keptAt = (i) => j.verdicts[i] !== "other" && !nameWithheld(j.facts[i], named) && (j.verdicts[i] === "this" || !attested || rowGrades[i] !== "x") && !otherStem(rows[i]);
      const someKept = rows.some((row, i) => keptAt(i));
      Object.assign(here, { tags, said: entrySaid(j.place), other: j.other, rows: rows.length });
      const isOther = (row, i) => j.verdicts[i] === "other";
      if (more("gated") && j.other > 0 && someKept) {
        const only = readingOnlyOf(rows, isOther, (row, i) => isOther(row, i) && !(factsOf(row).n || []).some((x) => j.place.numbers.includes(x)) && (factsOf(row).n || []).length > 0);
        if (only) found("gated", { ...here, reading: only[0], m: String(only[1][3]) });
      }
      if (more("lettered") && j.place.lettered && someKept) {
        const byLetter = (row, i) => isOther(row, i) && (j.facts[i].n || []).some((x) => j.place.numbers.includes(x));
        const only = rows.some(byLetter) ? readingOnlyOf(rows, isOther, byLetter) : null;
        if (only) found("lettered", { ...here, reading: only[0], m: String(only[1][3]), of: rows.filter(byLetter).length });
      }
      if (more("bdb") && someKept) {
        const byBdb = (row, i) => isOther(row, i) && !(j.facts[i].n || []).length;
        const only = rows.some(byBdb) ? readingOnlyOf(rows, isOther, byBdb) : null;
        if (only) found("bdb", { ...here, reading: only[0], m: String(only[1][3]), of: rows.filter(byBdb).length });
      }
      if (more("kept") && attested) {
        // a row of this entry, pointed otherwise, of the word's own stem: before the gate the pointing withheld it
        const thisButX = (row, i) => j.verdicts[i] === "this" && rowGrades[i] === "x";
        const only = rows.some(thisButX) ? readingOnlyOf(rows, thisButX, (row, i) => thisButX(row, i) && !otherStem(row) && !nameWithheld(j.facts[i], named)) : null;
        if (only) found("kept", { ...here, reading: only[0], m: String(only[1][3]), of: rows.filter(thisButX).length });
      }
      if (wantsLeader) {
        const own = onlyLeaders(gr, tags, named), rest = onlyLeaders(gr, null, true);
        if (own.l && !own.nl && !rest.nl && (!rest.l || readingKey(own.l[0]) !== readingKey(rest.l[0]))) (leaders.get(z) || leaders.set(z, []).get(z)).push({ ...here, own, rest: rest.l ? rest.l[0] : null });
      }
    }
  }
  // E7: the receipt's count
  const said = (((zone.emitted_from || {}).toggles || {}).lattice || {}).counts || {};
  if (said.places_tagged !== recount.places_tagged) e7.faults.push(`${z}: the receipt counts ${said.places_tagged} tagged places and the zone carries ${recount.places_tagged}`);
  if (recount.places_tagged && (!side.entry || side.entry.rule !== ENTRY_GATE_RULE_ID || !side.entry.row_entries || side.entry.row_entries.ledger_sha256 !== pin.ledger.sha256)) e7.faults.push(`${z}: its sidecar does not name the gate's rule and this ledger`);
  // E8: the leaders at each kind of place (tools/place-leaders-v1.mjs: the place's tags, and "|n" where it is a name)
  const labelOfRow = (row) => (index.m_sources[row[3]] || {}).label;
  const yearOfRow = (row) => { const y = store.wordingYear(row); return Number.isFinite(y) ? y : null; };
  for (const [surface, gr] of Object.entries(grades)) {
    const under = stoodUnder.get(surface) || new Map();
    const rest = onlyLeaders(gr, null, true);   // the surface's own: a place with no tag that is a name
    // the rows a kind of place withholds before the pointing is asked: another entry's, and a name's where the place is not one
    const gatedAt = (stands) => {
      const rows = rowsOf(gr.k);
      const j = stands.tags ? judge(rows, stands.tags) : null;
      return { rows, known: !stands.tags || !!j, out: (row) => !!(j && j.verdicts[rows.indexOf(row)] === "other") || nameWithheld(factsOf(row), stands.isName) };
    };
    for (const [key, own] of Object.entries(gr.e || {})) {
      e8.entries += 1;
      const where = `${z} ${surface} at a place of the kind "${key}"`;
      const stands = under.get(key);
      if (!stands || stands.k !== gr.k) { e8.faults.push(`${where}: no word of the book stands at such a place`); continue; }
      if (same(own.l ?? null, rest.l) && same(own.la ?? null, rest.la) && !!own.nl === rest.nl) e8.faults.push(`${where}: the same leaders as the surface's own`);
      const g = gatedAt(stands);
      if (!g.known) { e8.faults.push(`${where}: the tags give no entry`); continue; }
      const keptRows = g.rows.filter((row) => !g.out(row));
      for (const [ch, l] of [["l", own.l], ["la", own.la]]) {
        if (l === null || l === undefined) continue;
        if (!Array.isArray(l) || l.length !== 5 || !Array.isArray(l[4]) || !l[4].length) { e8.faults.push(`${where}: ${ch} is not a leader with its carriers`); continue; }
        const carriers = store.carriersOf(keptRows, l[0]);
        if (!carriers.some((row) => labelOfRow(row) === l[1] && yearOfRow(row) === (l[3] ?? null))) e8.faults.push(`${where}: ${ch} «${String(l[0]).slice(0, 40)}» is credited to no row the place keeps that carries it`);
        if (l[4].some((id) => !carriers.some((row) => String(row[3]) === id))) e8.faults.push(`${where}: ${ch} names a carrier that is not a row the place keeps carrying it`);
      }
      if (own.la && own.l && own.l[4].some((id) => own.la[4].includes(id))) e8.faults.push(`${where}: la shares a carrier with l`);
    }
    // where every row carrying the surface's own leader is withheld at a kind of place, that place has leaders of its own
    if (rest.l) for (const [key, stands] of under) {
      if (stands.k !== gr.k || key === PLACE_IS_A_NAME) continue;
      const g = gatedAt(stands);
      if (!g.known) continue;
      const carriers = store.carriersOf(g.rows, rest.l[0]);
      if (carriers.length && carriers.every(g.out)) { e8.spoken += 1; if (!(gr.e && gr.e[key])) e8.faults.push(`${z} ${surface} at a place of the kind "${key}": the surface's own leader «${String(rest.l[0]).slice(0, 40)}» is carried only by rows the place withholds, and the place has no leader of its own`); }
    }
  }
}
if (!served.length) { console.log("SKIPPED — no served zone carries the lattice layer"); process.exit(bad ? 1 : 3); }
check("E6  the page's own functions, read out of zone.html and run, give the module's verdict for every row of every key at every entry a served zone asks it under", !!page && e6.pairs > 0 && e6.faults.length === 0,
  !page ? pageWhy : e6.faults.length ? `${nf(e6.faults.length)} · ${first(e6.faults)}` : `${nf(e6.pairs)} keys under an entry · ${nf(e6.rows)} verdicts agree`);
{
  // the leaders, by the page's function and the module's, on what the sidecars hold
  let asked2 = 0;
  const faults = [];
  if (page) for (const z of served.slice(0, 3)) {
    const side = gz(join(ZONES, `${z}.lattice.bin`));
    for (const [surface, gr] of Object.entries(side.grades || {})) for (const key of ["", PLACE_IS_A_NAME, "H0", `H0${PLACE_IS_A_NAME}`, ...Object.keys(gr.e || {})]) {
      // the kind of place a key names: its tags, and whether it is a name
      const named = key.endsWith(PLACE_IS_A_NAME), t = named ? key.slice(0, -PLACE_IS_A_NAME.length) : key, tags = t ? t.split(" ") : null;
      asked2 += 1;
      if (page.leadersKey(tags, named) !== key || leadersKey(tags, named) !== key || !same(page.onlyLeaders(gr, tags, named), onlyLeaders(gr, tags, named))) faults.push(`${z} ${surface} at "${key}"`);
    }
  }
  check("    and the same leaders for every surface of the first served zones, at each kind of place it holds leaders for, at a place with no tag (a name or not) and at one it holds none for", !!page && asked2 > 0 && faults.length === 0, !page ? pageWhy : faults.length ? first(faults) : `${nf(asked2)} asked`);
}
check("E7  a word's tags are a tag or a list of several, on a word with a key or on one half of a pair, and each zone's receipt counts them as a recount does", e7.tagged > 0 && e7.faults.length === 0,
  e7.faults.length ? `${nf(e7.faults.length)} · ${first(e7.faults)}` : `${nf(e7.tagged)} tagged places in ${served.length} zones · ${nf(e7.lists)} carry several · ${nf(e7.halves)} on a half of a pair`);
if (!e7.books) console.log("  --  E7's second half was not judged here: the corpus lane's lattice is not on this machine (--lattice <dir> or LATTICE_DIR), so no word's tags were read against the lattice's own position");
else {
  check("    and each is the core tags of the lattice's own position, whose pieces spell the tagged form", e7.latticeFaults.length === 0,
    e7.latticeFaults.length ? `${nf(e7.latticeFaults.length)} · ${first(e7.latticeFaults)}` : `${nf(e7.lattice)} tagged places read against the lattice in ${e7.books} of ${served.length} books`);
  if (e7.books < served.length) console.log(`  --  E7's second half was not judged for ${served.length - e7.books} of ${served.length} books: their positions file is not in ${LATTICE}`);
}
check("E8  the leaders at a kind of place speak for a place a word of their surface stands at, differ from the surface's own, and are credited to a row the place keeps that carries the reading; where the place withholds every row carrying the surface's own leader, it has leaders of its own", e8.entries > 0 && e8.faults.length === 0,
  e8.faults.length ? `${nf(e8.faults.length)} · ${first(e8.faults)}` : `${nf(e8.entries)} surfaces and kinds of place with leaders of their own · ${nf(e8.spoken)} whose surface's own leader only withheld rows carry, each with its own`);

// ---- on the page -------------------------------------------------------------------------------
// the words found above, pressed and read (tools/gated-card-v1.mjs)
const lacking = WANT.filter((kind) => kind !== "untagged" && !picks[kind]);
if (lacking.length) check("E9–E11 on the page", false, `no served word was found for: ${lacking.join(", ")}`);
else {
  const tree = await serveTree(K3);
  const pw = await loadPlaywright();
  const browser = await pw.chromium.launch(launchOptions());
  const open = (pick, masorah = null, sources = "all") => openGatedCard(browser, tree.base, pick, { masorah, sources });
  const where = (pick) => `${pick.zone} ${pick.label}, entry ${pick.entry} (${pick.k} under ${(pick.tags || []).join(" ") || "no tag"})`;
  const pillOf = (got, pick) => got.said.find(([text, by, own]) => [text, own].some((t) => t && readingKey(t) === readingKey(pick.reading)) && by.split(/[\s,]+/u).includes(pick.m)) || null;
  // the card names the place's entry as the place is asked: with STEP's letter where a row is asked by letter
  const lineSays = (got, pick) => got.line.includes(`${pick.other} of another entry than ${pick.said.join(" or ")}, withheld`);
  const counted = (got, pick) => !!got.data && Number(got.data.entryWithheld) === pick.other && got.data.entry === pick.said.join("|") && lineSays(got, pick);
  // the first of the words found whose card is its own, opened; [null, null] where the page joins every one of them
  // to its neighbors
  const own = async (list, masorah = null, sources = "all") => {
    for (const pick of list || []) { const got = await open(pick, masorah, sources); if (got.fault || !got.joined) return [pick, got]; }
    return [null, null];
  };
  const JOINED = (list) => `each of the ${(list || []).length} word(s) found stands in a cell the page joins to its neighbors, so no card of its own was read`;
  try {
    {
      const [pick, got] = await own(picks.gated);
      check("E9  a word whose key carries rows of another entry: its card withholds exactly those, says so naming the place's entry (with STEP's letter where a row is asked by letter), and prints no reading only such rows carry", !!pick && !got.fault && counted(got, pick) && !pillOf(got, pick) && got.entry === pick.tags.join(" "),
        !pick ? JOINED(picks.gated) : got.fault || `${where(pick)} · ${pick.other} of ${pick.rows} rows are another entry's; the card says ${got.data ? got.data.entryWithheld : "nothing"} · "${got.line}" · «${String(pick.reading).slice(0, 40)}» (${pick.m}) ${pillOf(got, pick) ? "stands on a pill" : "is on no pill"} · ${got.said.length} pills`);
      if (pick) {
        const keep = await open(pick, "keep");
        check("    and under \"keep\" it withholds none for the entry, and the reading is back on a pill of its source", !keep.fault && !!keep.data && Number(keep.data.entryWithheld) === 0 && !/of another entry/u.test(keep.line) && !!pillOf(keep, pick),
          keep.fault || `entry ${keep.data ? keep.data.entryWithheld : "?"} · "${keep.line}" · «${String(pick.reading).slice(0, 40)}» ${pillOf(keep, pick) ? "stands on a pill" : "is on no pill"} · ${keep.said.length} pills`);
      }
    }
    {
      const [pick, got] = await own(picks.kept);
      check("E10 a row of the place's own entry that its source points otherwise stands: a reading only such rows carry is on the card, credited to its source", !!pick && !got.fault && !!pillOf(got, pick),
        !pick ? JOINED(picks.kept) : got.fault || `${where(pick)} · ${pick.of} row(s) of this entry are pointed otherwise · «${String(pick.reading).slice(0, 40)}» (${pick.m}) ${pillOf(got, pick) ? "stands on a pill" : "is on no pill"} · pointing withheld ${got.data ? got.data.withheld : "?"} · ${got.said.length} pills`);
    }
    for (const [kind, name] of [["lettered", "this entry by its number and another by STEP's letter"], ["bdb", "of no number, naming another of BDB's own entries"]]) {
      const [pick, got] = await own(picks[kind]);
      check(`E11 a row that is ${name}, is withheld and counted, and a reading only such rows carry is on no pill`, !!pick && !got.fault && counted(got, pick) && !pillOf(got, pick),
        !pick ? JOINED(picks[kind]) : got.fault || `${where(pick)} · ${pick.of} such row(s) among ${pick.other} of another entry; the card says ${got.data ? got.data.entryWithheld : "nothing"} · "${got.line}" · «${String(pick.reading).slice(0, 40)}» (${pick.m}) ${pillOf(got, pick) ? "stands on a pill" : "is on no pill"}`);
    }
    if (!picks.untagged) console.log("  --  E12 was not judged: no served word of one region stands with no tag on a key whose rows carry a number");
    else {
      const [pick, got] = await own(picks.untagged);
      check("E12 a word its place gives no tag is not gated", !!pick && !got.fault && !!got.data && Number(got.data.entryWithheld) === 0 && got.data.entry === "" && got.entry === "" && !/of another entry/u.test(got.line),
        !pick ? JOINED(picks.untagged) : got.fault || `${where(pick)} · entry ${got.data ? got.data.entryWithheld : "?"} · "${got.line}" · ${got.said.length} pills`);
    }
    if (!leaders.size) check("E13 where the place moves the leader, the line under the word and the card's first pill are the place's leader", false, "no served word of one region stands at a place that moves its leader");
    else {
      // read with the sources as the record rests them: the line is baked from the store's rows, and a dictionary
      // beside the store that rests off can hold an older reading than any of them. The leader is the entry's own,
      // or its alternate where every source carrying it rests off. One word a zone, the first whose card is its own
      const faults = [], seen = [];
      for (const [zoneOfThem, list] of leaders) {
        const [pick, got] = await own(list, null, "rest");
        if (!pick) { console.log(`  --  E13 was not judged in ${zoneOfThem}: ${JOINED(list)}`); continue; }
        if (got.fault) { faults.push(`${where(pick)}: ${got.fault}`); continue; }
        const off = new Set(got.state.sources_off);
        const stands = (l) => !!l && !l[4].every((id) => off.has(id));
        const leader = stands(pick.own.l) ? pick.own.l[0] : stands(pick.own.la) ? pick.own.la[0] : null;
        if (leader === null) { faults.push(`${where(pick)}: every source carrying the place's leader and its alternate rests off`); continue; }
        const lead = got.said[0] ? got.said[0][0] : "";
        seen.push(`${pick.zone} ${pick.label} ${pick.k}: «${String(leader).slice(0, 30)}»${pick.rest ? ` (at rest «${String(pick.rest).slice(0, 30)}»)` : ""}`);
        if (readingKey(lead) !== readingKey(leader)) faults.push(`${where(pick)}: the first pill is «${lead.slice(0, 40)}» and the place's leader is «${String(leader).slice(0, 40)}»`);
        if (readingKey(got.under || "") !== readingKey(leader)) faults.push(`${where(pick)}: the line reads «${String(got.under).slice(0, 40)}» and the place's leader is «${String(leader).slice(0, 40)}»`);
      }
      check("E13 where the place moves the leader, the line under the word and the card's first pill are the place's leader", faults.length === 0 && seen.length > 0,
        faults.length ? `${faults.length} · ${first(faults)}` : seen.length ? `${seen.length} words · ${first(seen, 4)}` : "no word found has a card of its own");
    }
  } finally { await browser.close().catch(() => {}); await tree.close(); }
}

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
