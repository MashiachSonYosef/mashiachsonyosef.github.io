#!/usr/bin/env node
// RUN: tree
// GUARDS: names-gate-rule-v1-a-row-its-own-source-gives-as-a-name-is-withheld-where-the-word-on-the-page-is-not-a-name
// LEDGER: -
// no frame letter. A check reads the lists' pin, the store, the zones and the
// pages and judges them; it is not the ledger for one.
//
// A ROW ITS OWN SOURCE GIVES AS A NAME IS WITHHELD WHERE THE WORD ON THE PAGE
// IS NOT A NAME. A dictionary lists a man called Bara under the letters of
// the verb "he created". The corpus lane listed the served rows whose every
// entry their own source marks a name, and the word places of the
// thirty-nine books that are a name (relay v177; data/names/).
// tools/apply-name-rows-v1.mjs marks the rows (the facts slot: name),
// tools/project-lattice-v12-v1.mjs marks the places on each word (np), and
// the page asks, with the entry and before the pointing, whether the place
// is a name (tools/names-gate-v1.mjs holds the gate's own function, and the
// page carries it under the same name).
//
// What is held here, each recomputed and none read from a tool's receipt:
//
//   N1  the lists, their rule and their receipt are the bytes their pin
//       names, and the corpus lane's receipt names both lists by the pin's
//       sha256 and lines
//   N2  the lists themselves: every place is a book, a verse and a word
//       number, listed once, with the sources that call it a name, counted
//       as the lane's receipt counts them; every row is a key, a rank, an m
//       id and a hash, listed once, of a source the lane read for names,
//       and the rows are counted source by source as the receipt counts
//       them
//   N3  every row of the store: a listed line finds exactly one row, and
//       that row carries the mark; no other row carries it (less the lines
//       the index says the store has moved on by)
//   N4  the store's index names the rule, the pin and the list, and totals
//       that are a recount's
//   N5  the places on the words: in every book the list names, each listed
//       place marks the word of that number in its verse, as the card's
//       head counts it, and no other word carries the mark; the zone's
//       receipt names the list and counts as a recount does; a book the
//       list does not name carries none
//   N6  the page's own functions, read out of zone.html and run: the gate
//       itself gives what the module gives, and a place is a name where its
//       word is marked, or anywhere in a book whose receipt names no list
//   N7  on the page, at a place that is not a name whose key carries a row
//       given as a name: under the default the card withholds exactly those
//       rows (the entry's own withheld are not counted twice), says so on
//       its withheld line, and prints no reading that only such rows carry;
//       under "keep" it withholds none and the reading is back
//   N8  at a place that is a name the same kind of row stands: nothing is
//       withheld as a name, and a reading only such rows carry is on the
//       card, credited to its source
//
// The words are found in the data, never named.
//
// Run: node tools/check-names-gate-v1.mjs
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { openRouteStore, factsOf, readingKey } from "./gloss-store-v1.mjs";
import { NAMES_GATE_RULE_ID, nameWithheld } from "./names-gate-v1.mjs";
import { placeEntry, bdbEntriesAt, entryVerdict } from "./entry-gate-v1.mjs";
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
const PINS = join(K3, "data", "names");
const ZONES = join(K3, "data", "zones");
const HOME = "reader/data/names";   // the same folder as the index names it
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const nf = (x) => Number(x).toLocaleString("en-US");
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const first = (list, n = 3) => list.slice(0, n).join(" · ");
const gz = (path) => JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"));

console.log(`— ${NAMES_GATE_RULE_ID} —\n`);
if (!existsSync(join(PINS, "PIN.json"))) { console.log("SKIPPED — no list of names on this disk (data/names/PIN.json)"); process.exit(3); }
const pin = JSON.parse(readFileSync(join(PINS, "PIN.json"), "utf8"));
const store = openRouteStore(STORE);
const index = store.index;
const rec = index.name_rows || null;

// ---- N1: the pinned bytes ---------------------------------------------------------------------
let theirs = null, places = [], rowLines = [];
{
  const faults = [];
  if (pin.schema_version !== "NAMES_PIN_V1" || !pin.place_names || !pin.name_rows || !pin.rule || !pin.receipt) faults.push("the pin names no lists, rule or receipt");
  else {
    try {
      readPinned(join(PINS, pin.folder, pin.rule.file), pin.rule, `${pin.folder}/${pin.rule.file}`);
      theirs = JSON.parse(readPinned(join(PINS, pin.folder, pin.receipt.file), pin.receipt, `${pin.folder}/${pin.receipt.file}`).toString("utf8"));
      places = readPinnedLines(join(PINS, pin.folder, pin.place_names.file), pin.place_names, `${pin.folder}/${pin.place_names.file}`);
      rowLines = readPinnedLines(join(PINS, pin.folder, pin.name_rows.file), pin.name_rows, `${pin.folder}/${pin.name_rows.file}`);
    } catch (e) { if (e instanceof PinFault) faults.push(e.message); else throw e; }
    const named = (f, p) => !!f && f.file === p.file && f.sha256 === p.sha256 && f.lines === p.lines && f.bytes === p.bytes;
    if (theirs && !named((theirs.places || {}).file, pin.place_names)) faults.push("the lane's receipt names another list of name places than the pin");
    if (theirs && !named((theirs.rows || {}).file, pin.name_rows)) faults.push("the lane's receipt names another list of name rows than the pin");
    if (theirs && (theirs.rule || {}).sha256 !== pin.rule.sha256) faults.push("the lane's receipt names another rule than the pin");
  }
  check("N1  the lists, their rule and their receipt are the bytes their pin names, and the corpus lane's receipt names both lists as the pin does", faults.length === 0,
    faults.length ? first(faults) : `relay ${pin.relay} · ${nf(pin.place_names.lines)} name places (${String(pin.place_names.sha256).slice(0, 12)}…) · ${nf(pin.name_rows.lines)} name rows (${String(pin.name_rows.sha256).slice(0, 12)}…)`);
}

// ---- N2: the lists themselves -----------------------------------------------------------------
const placesOf = new Map();   // book -> verse label -> the word numbers that are a name
const READ_FOR_NAMES = new Set(((theirs || {}).rows || {}).m_ids_read || []);
const listed = new Map();     // key -> "rank m sha16" -> the line
{
  const faults = [];
  const by = {};
  const seen = new Set();
  places.forEach((l, at) => {
    const where = `${pin.place_names.file} line ${at + 1}`;
    const cut = String(l.place).lastIndexOf(":");
    const verse = String(l.place).slice(0, cut), n = Number(String(l.place).slice(cut + 1));
    if (typeof l.book !== "string" || cut < 1 || !Number.isInteger(n) || n < 1 || !Array.isArray(l.by) || !l.by.length) { faults.push(`${where} is not a book, a verse and a word number with the sources that say so`); return; }
    const id = `${l.book} ${l.place}`;
    if (seen.has(id)) faults.push(`${where}: ${id} is listed twice`);
    seen.add(id);
    const k = [...l.by].sort().join(" and ");
    by[k] = (by[k] || 0) + 1;
    const book = placesOf.get(l.book) || placesOf.set(l.book, new Map()).get(l.book);
    (book.get(verse) || book.set(verse, new Set()).get(verse)).add(n);
  });
  const said = (theirs || {}).places || {};
  if (theirs && said.names !== places.length) faults.push(`the lane's receipt counts ${said.names} name places and the list holds ${places.length}`);
  if (theirs && !same(Object.fromEntries(Object.entries(said.by || {}).sort()), Object.fromEntries(Object.entries(by).sort()))) faults.push(`by the sources that say so the list counts ${JSON.stringify(by)} and the lane's receipt ${JSON.stringify(said.by)}`);
  rowLines.forEach((l, at) => {
    const where = `${pin.name_rows.file} line ${at + 1}`;
    if (typeof l.k !== "string" || !Number.isInteger(l.rank) || typeof l.m !== "string" || !/^[0-9a-f]{16}$/u.test(String(l.sha))) { faults.push(`${where} names no key, rank, m id or hash`); return; }
    if (READ_FOR_NAMES.size && !READ_FOR_NAMES.has(l.m)) faults.push(`${where} names a row of ${l.m}, which the lane did not read for names`);
    const rows = listed.get(l.k) || listed.set(l.k, new Map()).get(l.k);
    const id = `${l.rank} ${l.m} ${l.sha}`;
    if (rows.has(id)) faults.push(`${where}: the row ${id} under ${l.k} is listed twice`);
    rows.set(id, l);
  });
  // the lane's receipt counts the name rows source by source
  const rowsBy = {};
  for (const l of rowLines) if (typeof l.m === "string") rowsBy[l.m] = (rowsBy[l.m] || 0) + 1;
  const saidBy = (theirs && theirs.rows && theirs.rows.name_rows) || null;
  if (theirs && (!saidBy || typeof saidBy !== "object" || !same(Object.fromEntries(Object.entries(saidBy).sort()), Object.fromEntries(Object.entries(rowsBy).sort()))))
    faults.push(`source by source the list holds ${JSON.stringify(rowsBy)} name rows and the lane's receipt counts ${JSON.stringify(saidBy)}`);
  check("N2  every listed place is a book, a verse and a word number, listed once and counted as the lane's receipt counts them; every listed row is a key, a rank, an m id and a hash, listed once, of a source the lane read for names",
    places.length > 0 && rowLines.length > 0 && faults.length === 0,
    faults.length ? `${nf(faults.length)} · ${first(faults)}` : `${nf(places.length)} places in ${placesOf.size} books (${Object.entries(by).map(([k, v]) => `${k} ${nf(v)}`).join(", ")}) · ${nf(rowLines.length)} rows of ${new Set(rowLines.map((l) => l.m)).size} sources`);
}

// ---- N3, N4: every row of the store -----------------------------------------------------------
let marked = 0;
{
  const faults = [];
  const met = new Map();   // key, then the line's id -> how many rows of the store are that row
  let rows = 0, strays = 0;
  for (const name of readdirSync(join(STORE, "shards")).filter((f) => f.endsWith(".bin")).sort()) {
    const body = gz(join(STORE, "shards", name));
    for (const [k, list] of Object.entries(body)) for (const row of list) {
      rows += 1;
      const f = factsOf(row);
      const has = !!(f && "name" in f);
      if (has && f.name !== 1) faults.push(`${k} (${row[3]}, rank ${row[0]}): the mark is ${JSON.stringify(f.name)}, not 1`);
      const mine = listed.get(k);
      const id = `${row[0]} ${row[3]} ${sha256(Buffer.from(String(row[1] ?? ""), "utf8")).slice(0, 16)}`;
      const isListed = !!(mine && mine.has(id));
      if (isListed) met.set(`${k}\u0001${id}`, (met.get(`${k}\u0001${id}`) || 0) + 1);
      if (has) marked += 1;
      if (has && !isListed) { strays += 1; if (faults.length < 6) faults.push(`${k} (${row[3]}, rank ${row[0]}): carries the mark and no line lists it`); }
      if (!has && isListed) faults.push(`${k} (${row[3]}, rank ${row[0]}): listed and carries no mark`);
    }
  }
  let none = 0, several = 0;
  for (const [k, mine] of listed) for (const id of mine.keys()) { const n = met.get(`${k}\u0001${id}`) || 0; if (!n) none += 1; else if (n > 1) several += 1; }
  const t = (rec && rec.totals) || {};
  if (none !== (t.lines_that_find_no_row || 0)) faults.push(`${none} line(s) find no row, and the index says ${t.lines_that_find_no_row || 0}`);
  if (several !== (t.lines_that_find_more_than_one_row || 0)) faults.push(`${several} line(s) find more rows than one, and the index says ${t.lines_that_find_more_than_one_row || 0}`);
  check("N3  every listed line finds exactly one row of the store, that row carries the mark, and no other row does", listed.size > 0 && faults.length === 0,
    faults.length ? `${nf(faults.length)}${strays ? ` (${nf(strays)} rows carry the mark unlisted)` : ""} · ${first(faults)}` : `${nf(rows)} rows read · ${nf(marked)} carry the mark, each a listed line's one row`);
}
{
  const faults = [];
  if (!rec) faults.push("the index holds no name_rows record");
  else {
    if (rec.rule_id !== NAMES_GATE_RULE_ID) faults.push("the record names another rule");
    if (rec.pin !== `${HOME}/PIN.json` || rec.relay !== pin.relay) faults.push("the record names another pin or relay");
    if (!same(rec.name_rows, { file: `${HOME}/${pin.folder}/${pin.name_rows.file}`, sha256: pin.name_rows.sha256, lines: pin.name_rows.lines })) faults.push("the record names another list than the pin");
    if (rec.read_at_store_version !== ((((theirs || {}).inputs || {}).route_store || {}).store_version || null)) faults.push("the record says the list was read at another version of the store than the lane's receipt says");
    const t = rec.totals || {};
    if (t.rows_listed !== rowLines.length || t.rows_marked !== marked || t.sources !== new Set(rowLines.map((l) => l.m)).size) faults.push(`totals say ${t.rows_listed} listed, ${t.rows_marked} marked, ${t.sources} sources; a recount gives ${rowLines.length}, ${marked}, ${new Set(rowLines.map((l) => l.m)).size}`);
  }
  check("N4  the store's index names the rule, the pin and the list, and totals that are a recount's", faults.length === 0, faults.length ? first(faults) : `${nf(marked)} rows marked of ${nf(rowLines.length)} listed`);
}

// ---- N5: the places on the words, and the words for the page ----------------------------------
const rowsOf = (k) => (store.routesFor(k) || []).filter((r) => index.m_sources[r[3]]);
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
const served = zonesServed().filter((z) => existsSync(join(ZONES, `${z}.lattice.bin`)));
// The words for the page, a few of each kind (notAName, aName): a word the page joins to its neighbors in one cell
// opens the cell's card and not its own, which only the page can say, so the first whose card is its own is judged.
const MOST = 4;
const picks = {};
const more = (kind) => (picks[kind] || []).length < MOST;
const n5 = { books: 0, marks: 0, listed: 0, faults: [] };
for (const z of served) {
  const zone = gz(join(ZONES, `${z}.bin`));
  const said = (((zone.emitted_from || {}).toggles || {}).lattice || {}).names || null;
  const mine = placesOf.get(z) || null;
  let marks = 0, hit = 0, missing = 0;
  const grades = (existsSync(join(ZONES, `${z}.lattice.bin`)) && (more("notAName") || more("aName"))) ? gz(join(ZONES, `${z}.lattice.bin`)) : null;
  for (const [si, sec] of (zone.sections || []).entries()) {
    const words = sec.words || [];
    const numbered = words.filter((w) => !w.mark);
    const here = mine ? mine.get(String(sec.label)) || null : null;
    numbered.forEach((w, at) => {
      const want = !!(here && here.has(at + 1));
      if (w.np !== undefined && w.np !== 1) n5.faults.push(`${z} ${sec.label} word ${at + 1}: the mark is ${JSON.stringify(w.np)}, not 1`);
      if (w.np) marks += 1;
      if (want && w.np) hit += 1;
      if (want && !w.np) n5.faults.push(`${z} ${sec.label} word ${at + 1}: listed as a name and carries no mark`);
      if (!want && w.np) n5.faults.push(`${z} ${sec.label} word ${at + 1}: carries the mark and no line lists the place`);
    });
    for (const w of words) if (w.mark && w.np) n5.faults.push(`${z} ${sec.label}: a mark of the text carries the name mark`);
    if (here) for (const n of here) if (!numbered[n - 1]) missing += 1;
    // the words for the page: one region its place does not divide, in a book whose places were read for names
    if (!said || !grades || (!more("notAName") && !more("aName"))) continue;
    for (const [e, w] of words.entries()) {
      if (!plainWord(words, e)) continue;
      const kind = w.np ? "aName" : "notAName";
      if (!more(kind)) continue;
      const rows = rowsOf(w.k);
      if (!rows.some((r) => (factsOf(r) || {}).name)) continue;
      // what the entry and the pointing do with each row here, as the page asks them
      const place = w.tg ? placeEntry([].concat(w.tg)) : null;
      const facts = rows.map(factsOf);
      const bdbHere = place ? bdbEntriesAt(place, facts) : null;
      const verdicts = rows.map((r, i) => (place ? entryVerdict(facts[i], place, bdbHere) : "none"));
      const rowGrades = rows.map((r) => gradeRow(r, w.s));
      const attested = rowGrades.includes("m");
      const gr = (grades.grades || {})[w.s], rs = (grades.stems || {})[w.k] || null;
      const otherStem = (row) => !!(rs && gr && Array.isArray(gr.st) && gr.st.length && isOtherStem(rs[`${row[3]}\u0001${row[0]}\u0001${row[1]}`], gr.st));
      // a name's row the entry leaves; and one the pointing and the stem would leave too
      const nameLeft = (row, i) => !!(facts[i] && facts[i].name) && verdicts[i] !== "other";
      const stands = (row, i) => nameLeft(row, i) && (verdicts[i] === "this" || !attested || rowGrades[i] !== "x") && !otherStem(row);
      const pick = { zone: z, section: si, entry: e, label: sec.label, s: w.s, k: w.k, tags: w.tg ? [].concat(w.tg) : null, rows: rows.length, names: rows.filter(nameLeft).length };
      if (kind === "notAName") {
        // a reading that only withheld rows carry: a name's, or another entry's
        const only = readingOnlyOf(rows, (row, i) => nameLeft(row, i) || verdicts[i] === "other", stands);
        if (only && rows.some((row, i) => !nameLeft(row, i) && verdicts[i] !== "other" && (verdicts[i] === "this" || !attested || rowGrades[i] !== "x") && !otherStem(row))) (picks.notAName ||= []).push({ ...pick, reading: only[0], m: String(only[1][3]) });
      } else {
        const only = readingOnlyOf(rows, nameLeft, stands);
        if (only) (picks.aName ||= []).push({ ...pick, reading: only[0], m: String(only[1][3]) });
      }
    }
  }
  if (mine) {
    n5.books += 1; n5.listed += [...mine.values()].reduce((a, s) => a + s.size, 0); n5.marks += marks;
    const listedHere = [...mine.values()].reduce((a, s) => a + s.size, 0);
    if (!said || said.rule !== NAMES_GATE_RULE_ID || (said.place_names || {}).sha256 !== pin.place_names.sha256) n5.faults.push(`${z}: its receipt does not name the gate's rule and this list`);
    else if (said.listed_for_this_book !== listedHere || said.marked !== hit || said.with_no_word !== missing) n5.faults.push(`${z}: its receipt counts ${said.listed_for_this_book} listed, ${said.marked} marked, ${said.with_no_word} with no word; a recount gives ${listedHere}, ${hit}, ${missing}`);
    if (missing) n5.faults.push(`${z}: ${missing} listed place(s) name a word the book does not have`);
  } else if (marks) n5.faults.push(`${z}: ${marks} word(s) carry the name mark and the list names no place of the book`);
}
for (const b of placesOf.keys()) if (!served.includes(b)) n5.faults.push(`the list names places of ${b}, which is not a served book with the lattice layer`);
check("N5  in every book the list names, each listed place marks the word of that number in its verse and no other word carries the mark; each zone's receipt names the list and counts as a recount does", n5.books > 0 && n5.faults.length === 0,
  n5.faults.length ? `${nf(n5.faults.length)} · ${first(n5.faults)}` : `${n5.books} books · ${nf(n5.marks)} words marked of ${nf(n5.listed)} listed places`);

// ---- N6: the page's own functions -------------------------------------------------------------
{
  const faults = [];
  let page = null;
  try {
    const html = readFileSync(join(K3, "zone.html"), "utf8");
    const grab = (head, end) => { const a = html.indexOf(head); if (a < 0 || html.indexOf(head, a + 1) >= 0) throw new Error(`zone.html does not hold exactly one "${head.trim()}"`); const b = html.indexOf(end, a); if (b < 0) throw new Error(`zone.html does not close "${head.trim()}"`); return html.slice(a, b + end.length); };
    page = new Function("zone", `${grab("\n  const nameWithheld = (facts, placeIsAName) => ", ";\n")}${grab("\n  const namesMarked = () => ", ";\n")}${grab("\n  const isNamePlace = (word) => ", ";\n")}\n return { nameWithheld, isNamePlace };`);
  } catch (e) { faults.push(e.message); }
  if (page) {
    const marked2 = page({ emitted_from: { toggles: { lattice: { names: { rule: NAMES_GATE_RULE_ID } } } } });
    const unread = page({ emitted_from: { toggles: { lattice: {} } } });
    for (const facts of [null, {}, { n: ["H1"] }, { name: 1 }, { name: 1, n: ["H1"] }]) for (const isName of [true, false])
      if (marked2.nameWithheld(facts, isName) !== nameWithheld(facts, isName)) faults.push(`the gate, for ${JSON.stringify(facts)} at a place that is ${isName ? "" : "not "}a name`);
    if (marked2.isNamePlace({ np: 1 }) !== true || marked2.isNamePlace({}) !== false || marked2.isNamePlace(null) !== false) faults.push("in a book read for names, a place is not a name exactly where its word is marked");
    if (unread.isNamePlace({}) !== true || unread.isNamePlace({ np: 1 }) !== true) faults.push("in a book not read for names, a place is not read as a name");
  }
  check("N6  the page's own functions, read out of zone.html and run: the gate gives what the module gives, and a place is a name where its word is marked, or anywhere in a book whose receipt names no list", !!page && faults.length === 0, faults.length ? first(faults) : "10 askings of the gate · 5 of the place");
}

// ---- N7, N8: on the page -----------------------------------------------------------------------
const lacking = ["notAName", "aName"].filter((kind) => !picks[kind]);
if (lacking.length) check("N7–N8 on the page", false, `no served word was found: ${lacking.map((k) => (k === "aName" ? "at a place that is a name, whose key carries a row given as a name that the other gates leave" : "at a place that is not a name, whose key carries such a row and another reading")).join("; ")}`);
else {
  const tree = await serveTree(K3);
  const pw = await loadPlaywright();
  const browser = await pw.chromium.launch(launchOptions());
  const open = (pick, masorah = null) => openGatedCard(browser, tree.base, pick, { masorah });
  const where = (pick) => `${pick.zone} ${pick.label}, entry ${pick.entry} (${pick.k}${pick.tags ? ` under ${pick.tags.join(" ")}` : ""})`;
  const pillOf = (got, pick) => got.said.find(([text, by, own]) => [text, own].some((t) => t && readingKey(t) === readingKey(pick.reading)) && by.split(/[\s,]+/u).includes(pick.m)) || null;
  // the first of the words found whose card is its own, opened; [null, null] where the page joins every one of them
  // to its neighbors
  const own = async (list) => {
    for (const pick of list || []) { const got = await open(pick); if (got.fault || !got.joined) return [pick, got]; }
    return [null, null];
  };
  const JOINED = (list) => `each of the ${(list || []).length} word(s) found stands in a cell the page joins to its neighbors, so no card of its own was read`;
  try {
    {
      const [pick, got] = await own(picks.notAName);
      const says = pick ? `${pick.names} given as a name by ${pick.names === 1 ? "its" : "their"} source, withheld` : "";
      check("N7  at a place that is not a name, the card withholds exactly the rows given as a name that the entry left, says so, and prints no reading only such rows carry", !!pick && !got.fault && !!got.data && Number(got.data.nameWithheld) === pick.names && got.line.includes(says) && got.name === "not a name" && !pillOf(got, pick),
        !pick ? JOINED(picks.notAName) : got.fault || `${where(pick)} · ${pick.names} of ${pick.rows} rows are a name's; the card says ${got.data ? got.data.nameWithheld : "nothing"} and takes its place for ${JSON.stringify(got.name)} · "${got.line}" · «${String(pick.reading).slice(0, 40)}» (${pick.m}) ${pillOf(got, pick) ? "stands on a pill" : "is on no pill"} · ${got.said.length} pills`);
      if (pick) {
        const keep = await open(pick, "keep");
        check("    and under \"keep\" it withholds none as a name, and the reading is back on a pill of its source", !keep.fault && !!keep.data && Number(keep.data.nameWithheld) === 0 && !/given as a name/u.test(keep.line) && !!pillOf(keep, pick),
          keep.fault || `name ${keep.data ? keep.data.nameWithheld : "?"} · "${keep.line}" · «${String(pick.reading).slice(0, 40)}» ${pillOf(keep, pick) ? "stands on a pill" : "is on no pill"} · ${keep.said.length} pills`);
      }
    }
    {
      const [pick, got] = await own(picks.aName);
      check("N8  at a place that is a name the same kind of row stands: nothing is withheld as a name, and a reading only such rows carry is on the card, credited to its source", !!pick && !got.fault && !!got.data && Number(got.data.nameWithheld) === 0 && !/given as a name/u.test(got.line) && got.name === "a name" && !!pillOf(got, pick),
        !pick ? JOINED(picks.aName) : got.fault || `${where(pick)} · ${pick.names} of ${pick.rows} rows are a name's; the card says ${got.data ? got.data.nameWithheld : "nothing"} and takes its place for ${JSON.stringify(got.name)} · "${got.line}" · «${String(pick.reading).slice(0, 40)}» (${pick.m}) ${pillOf(got, pick) ? "stands on a pill" : "is on no pill"}`);
    }
  } finally { await browser.close().catch(() => {}); await tree.close(); }
}

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
