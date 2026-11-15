#!/usr/bin/env node
// RUN: tree
// GUARDS: sense-openings-rule-v1-the-words-that-open-a-numbered-sense-print-as-a-note-beside-the-readings-and-not-as-a-pill
// LEDGER: -
// no frame letter. A check reads the list's pin, the ruling, the store, the
// zones and the pages and judges them; it is not the ledger for one.
//
// THE WORDS THAT OPEN A NUMBERED SENSE ARE A NOTE, NOT A READING. The
// catalog made a route of the words that open each numbered sense of an
// entry of the unabridged BDB, and BDB opens a sense with what the word is
// said of as often as with a rendering («object heaven and earth» under "he
// created"). The corpus lane listed the served rows that are only such an
// opening (relay v174; data/sense-openings/), and the owner ruled how they
// print (ruling 4 of relay v176): as a note beside the sense's readings,
// not as a pill. tools/apply-sense-openings-v1.mjs marks the rows (the
// facts slot: opens), the store reader gives such a row no reading
// (tools/gloss-store-v1.mjs, senseOpened), and the page carries the same
// function under the same name and prints the rows its switches keep as the
// card's notes.
//
// What is held here, each recomputed and none read from a tool's receipt:
//
//   O1  the list, its rule and its receipt are the bytes their pin names;
//       the corpus lane's receipt names the list as the pin does; and one
//       pinned ruling rules the list, sets the print this lane has wired,
//       and counts the rows the list holds
//   O2  the list itself: every line is a key, a rank, a route and one entry
//       with its point, marked only an opening and listed once, and the
//       lines are counted as the lane's receipt counts them (in all, and by
//       their first word)
//   O3  every row of the store: a listed line finds exactly one row among
//       the rows of the ruling's ledger, where the row-strikes record says
//       its row now stands (tools/row-strikes-follow-v1.mjs), that row
//       carries the line's entry and point, and no other row carries the
//       mark; a line whose row a round struck or withheld since finds none,
//       and is counted so
//   O4  the store's index names the rule, the pin, the list and the ruling,
//       totals that are a recount's, and the rounds since as the record
//       gives them
//   O5  the store reader: a marked row gives no reading and names its sense
//       as its line does, and the readings of a key that holds one are the
//       readings of its other rows; the page's own functions, read out of
//       zone.html and run, give what the module gives for every row of
//       every such key
//   O6  no line stands on a note: in every served book, the line a key
//       carries, each witnessed column's, and every leader its sidecar
//       keeps are no marked row's words, unless a row that is not marked
//       prints the same
//   O7  on the page, at a word whose key holds marked rows the card's
//       switches keep: the card prints exactly those rows as its notes, in
//       the store's order, each with its entry, its point and its words,
//       with the record of the reading held; and no pill prints a note's
//       words
//   O8  a marked row the switches withhold is no note; under "keep" every
//       marked row of the key is one
//   O9  where the switches keep marked rows and no reading, the notes stand
//       in the readings' band (judged where a served word is so; said in
//       words where none is)
//
// O6 ASKS THE STORE A BOOK WAS BAKED OVER (dictionary-kinds-rule-v1, 15
// November 2026): a book the record of what each dictionary is rests shut
// (the thirty-nine books) has its lines, columns and leaders baked over the
// rows that rest open, so a note's words are no reading's where no row that
// rests open prints them; any other book, of the store whole. O7 to O9 read
// the card with those dictionaries open, as the words found for them were
// counted, over the store whole.
//
// The words are found in the data, never named.
//
// Run: node tools/check-sense-openings-v1.mjs
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { openRouteStore, factsOf, readingKey, routePrinted, senseOpened, SENSE_OPENINGS_RULE_ID, SENSE_OPENINGS_PRINT } from "./gloss-store-v1.mjs";
import { nameWithheld } from "./names-gate-v1.mjs";
import { placeEntry, bdbEntriesAt, entryVerdict } from "./entry-gate-v1.mjs";
import { readPinned, readPinnedLines, PinFault } from "./pinned-v1.mjs";
import { rulingsPinned, rulingOf, cited } from "./rulings-v1.mjs";
import { openFollower, followedRecord, sha16Of, FollowFault } from "./row-strikes-follow-v1.mjs";
import { gradeRow, isPointed } from "./pointing-grade-v1.mjs";
import { fnv1a } from "./lattice-lib-v1.mjs";
import { isOtherStem } from "./stem-family-v1.mjs";
import { stemsId } from "./stems-extension-v1.mjs";
import { openBesideTheStore, rowsBeside } from "./rows-beside-the-store-v1.mjs";
import { zonesServed } from "./zones-on-disk-v1.mjs";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { serveTree } from "./serve-tree-v1.mjs";
import { plainWord, openGatedCard } from "./gated-card-v1.mjs";
import { pageReading, PageFault } from "./page-reading-v1.mjs";
import { readKinds, restsOffIn } from "./dictionary-kinds-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const STORE = join(K3, "data", "route-store");
const PINS = join(K3, "data", "sense-openings");
const ZONES = join(K3, "data", "zones");
const HOME = "reader/data/sense-openings";   // the same folder as the index names it
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const nf = (x) => Number(x).toLocaleString("en-US");
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const first = (list, n = 3) => list.slice(0, n).join(" · ");
const gz = (path) => JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"));

console.log(`— ${SENSE_OPENINGS_RULE_ID} —\n`);
if (!existsSync(join(PINS, "PIN.json"))) { console.log("SKIPPED — no list of openings on this disk (data/sense-openings/PIN.json)"); process.exit(3); }
const pin = JSON.parse(readFileSync(join(PINS, "PIN.json"), "utf8"));
const store = openRouteStore(STORE);
const index = store.index;
const rec = index.sense_openings || null;
// the store a book was baked over (O6): at rest where the record rests the book shut, whole for any other
const kindsRec = readKinds(join(K3, "data")).rec;
const storeAtRest = openRouteStore(STORE, { atRest: true });

// ---- O1: the pinned bytes, and the ruling ------------------------------------------------------
let theirs = null, lines = [], ruling = null;
{
  const faults = [];
  if (pin.schema_version !== "SENSE_OPENINGS_PIN_V1" || !pin.openings || !pin.rule || !pin.receipt) faults.push("the pin names no list, rule or receipt");
  else {
    try {
      readPinned(join(PINS, pin.folder, pin.rule.file), pin.rule, `${pin.folder}/${pin.rule.file}`);
      theirs = JSON.parse(readPinned(join(PINS, pin.folder, pin.receipt.file), pin.receipt, `${pin.folder}/${pin.receipt.file}`).toString("utf8"));
      lines = readPinnedLines(join(PINS, pin.folder, pin.openings.file), pin.openings, `${pin.folder}/${pin.openings.file}`);
      ruling = rulingOf(rulingsPinned(), pin.openings.sha256, (r) => typeof r.print === "string" && typeof r.ledger === "string", "on how a row of this list prints");
    } catch (e) { if (e instanceof PinFault) faults.push(e.message); else throw e; }
    // the lane's receipt names the list wherever it counts it: one of its sections holds the file as the pin does
    const named = (f) => !!f && f.file === pin.openings.file && f.sha256 === pin.openings.sha256 && f.bytes === pin.openings.bytes;
    if (theirs && !Object.values(theirs).some((v) => v && typeof v === "object" && named(v.file))) faults.push("the lane's receipt names no such list as the pin's");
    if (theirs && (theirs.rule || {}).sha256 !== pin.rule.sha256) faults.push("the lane's receipt names another rule than the pin");
    if (ruling && ruling.print !== SENSE_OPENINGS_PRINT) faults.push(`the ruling sets the print «${ruling.print}», and this lane has wired «${SENSE_OPENINGS_PRINT}»`);
    if (ruling && ruling.rows !== pin.openings.lines) faults.push(`the ruling rules ${ruling.rows} rows and the pin counts ${pin.openings.lines} lines`);
  }
  check("O1  the list, its rule and its receipt are the bytes their pin names, the lane's receipt names the list as the pin does, and one pinned ruling rules the list, sets the print this lane has wired and counts the rows the list holds", faults.length === 0,
    faults.length ? first(faults) : `relay ${pin.relay} · ${nf(pin.openings.lines)} lines (${String(pin.openings.sha256).slice(0, 12)}…) · ruling ${ruling.n} of relay ${ruling.relay_of_the_ruling} («${ruling.the_owners_words}»): ${ruling.print}`);
}

// ---- O2: the list itself ---------------------------------------------------------------------
const idOf = (rank, route) => `${rank}\u0001${route}`;
const listed = new Map();   // key -> "rank route" -> the entry and point the line gives
{
  const faults = [];
  const byFirstWord = {};
  lines.forEach((l, at) => {
    const where = `${pin.openings.file} line ${at + 1}`;
    if (typeof l.key !== "string" || !l.key || !Number.isInteger(l.rank) || typeof l.route !== "string" || !l.route) { faults.push(`${where} names no key, rank or route`); return; }
    if (l.only_an_opening !== true) faults.push(`${where} is not marked only an opening`);
    if (!Array.isArray(l.entries) || l.entries.length !== 1 || !/^\S+ \S+$/u.test(String(l.entries[0]))) { faults.push(`${where} does not name one entry and one point`); return; }
    const rows = listed.get(l.key) || listed.set(l.key, new Map()).get(l.key);
    if (rows.has(idOf(l.rank, l.route))) faults.push(`${where}: the row of rank ${l.rank} under ${l.key} is listed twice`);
    rows.set(idOf(l.rank, l.route), l.entries[0]);
    const w = l.route.split(/\s+/u)[0].toLowerCase();
    byFirstWord[w] = (byFirstWord[w] || 0) + 1;
  });
  // the lane's receipt counts the openings in one of its sections: in all, and by the first word of each
  const said = theirs ? Object.values(theirs).find((v) => v && typeof v === "object" && v.file && v.file.sha256 === pin.openings.sha256) || null : null;
  if (theirs && (!said || said.only_an_opening !== lines.length)) faults.push(`the lane's receipt counts ${said ? said.only_an_opening : "no"} rows that are only an opening and the list holds ${lines.length}`);
  const saidWords = (said && said.first_words_of_rows_only_an_opening) || {};
  const wrong = Object.entries(saidWords).filter(([w, c]) => byFirstWord[w] !== c);
  if (wrong.length) faults.push(`by first word the lane's receipt counts ${wrong.slice(0, 3).map(([w, c]) => `«${w}» ${c}`).join(", ")} and the list ${wrong.slice(0, 3).map(([w]) => `«${w}» ${byFirstWord[w] || 0}`).join(", ")}`);
  check("O2  every line is a key, a rank, a route and one entry with its point, marked only an opening and listed once, and the lines are counted as the lane's receipt counts them", lines.length > 0 && faults.length === 0,
    faults.length ? `${nf(faults.length)} · ${first(faults)}` : `${nf(lines.length)} lines under ${nf(listed.size)} keys · ${Object.keys(saidWords).length} first words counted as the receipt counts them (${Object.entries(saidWords).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([w, c]) => `«${w}» ${c}`).join(", ")})`);
}

// ---- O3, O4: every row of the store ----------------------------------------------------------
const ruled = new Set(ruling ? Object.entries(index.m_sources || {}).filter(([, s]) => s && s.ledger === ruling.ledger).map(([m]) => m) : []);
// where the rows the list read have gone since, by the row-strikes record kept beside the store; a line names no
// source, so it is followed as a row of each source of the ruling's ledger
let follow = null, followWhy = "the lane's receipt was not read, so the version the list was read at is not known";
if (theirs) try { follow = openFollower({ data: dirname(STORE), index, readAt: (((theirs.inputs || {}).route_store || {}).store_version) || null }); } catch (e) { if (e instanceof FollowFault) followWhy = e.message; else throw e; }
const listedNow = new Map();   // key now -> "rank route" -> the entry and point the line gives
const goneLines = [], rekeyedLines = [], followFaults = [];
for (const [k, mine] of listed) for (const [id, opens] of mine) {
  const [rank, route] = [Number(id.slice(0, id.indexOf("\u0001"))), id.slice(id.indexOf("\u0001") + 1)];
  let went = { state: "served", name: [k, rank] };
  if (follow) try {
    const acted = [...ruled].sort().map((m) => follow.nowOf([k, rank, m, sha16Of(route)])).filter((x) => x.state !== "served");
    if (acted.length > 1) { followFaults.push(`rounds since acted on rows of ${acted.length} sources of the ruling's ledger under one line's key, rank and words (rank ${rank})`); continue; }
    if (acted.length) went = acted[0];
  } catch (e) { if (e instanceof FollowFault) { followFaults.push(e.message); continue; } throw e; }
  if (went.state === "struck" || went.state === "withheld") { goneLines.push(went); continue; }
  if (went.state === "re-keyed") rekeyedLines.push(went);
  (listedNow.get(went.name[0]) || listedNow.set(went.name[0], new Map()).get(went.name[0])).set(idOf(went.name[1], route), opens);
}
let marked = 0, ruledRows = 0;
const keysWithAMark = new Set();
{
  const faults = follow ? [...followFaults] : [followWhy];
  const met = new Map();
  let rows = 0, strays = 0;
  for (const name of readdirSync(join(STORE, "shards")).filter((f) => f.endsWith(".bin")).sort()) {
    const body = gz(join(STORE, "shards", name));
    for (const [k, list] of Object.entries(body)) for (const row of list) {
      rows += 1;
      const isRuled = ruled.has(String(row[3]));
      if (isRuled) ruledRows += 1;
      const f = factsOf(row);
      const has = !!(f && "opens" in f);
      const mine = isRuled ? listedNow.get(k) : null;
      const id = idOf(row[0], String(row[1] ?? ""));
      const want = mine && mine.has(id) ? mine.get(id) : null;
      if (want !== null) met.set(`${k}\u0001${id}`, (met.get(`${k}\u0001${id}`) || 0) + 1);
      if (has) { marked += 1; keysWithAMark.add(k); }
      if (has && want === null) { strays += 1; if (faults.length < 6) faults.push(`${k} (${row[3]}, rank ${row[0]}): carries the mark and no line lists it`); }
      else if (has && f.opens !== want) faults.push(`${k} (${row[3]}, rank ${row[0]}): the mark is ${JSON.stringify(f.opens)} and its line gives ${JSON.stringify(want)}`);
      if (!has && want !== null) faults.push(`${k} (${row[3]}, rank ${row[0]}): listed and carries no mark`);
    }
  }
  let none = 0, several = 0;
  for (const [k, mine] of listedNow) for (const id of mine.keys()) { const n = met.get(`${k}\u0001${id}`) || 0; if (!n) none += 1; else if (n > 1) several += 1; }
  const t = (rec && rec.totals) || {};
  if (!ruled.size) faults.push("no source of the store is under the ruling's ledger");
  if (none) faults.push(`${none} line(s) find no row, and no round of the row-strikes record struck, withheld or moved their row`);
  if (goneLines.length !== (t.lines_that_find_no_row || 0)) faults.push(`${goneLines.length} line(s) name a row a round struck or withheld since, and the index says ${t.lines_that_find_no_row || 0}`);
  if (several !== (t.lines_that_find_more_than_one_row || 0)) faults.push(`${several} line(s) find more rows than one, and the index says ${t.lines_that_find_more_than_one_row || 0}`);
  check("O3  every listed line finds exactly one row among the rows of the ruling's ledger where the row-strikes record says its row stands, that row carries the line's entry and point, and no other row carries the mark; a line whose row a round struck or withheld since finds none", listed.size > 0 && faults.length === 0,
    faults.length ? `${nf(faults.length)}${strays ? ` (${nf(strays)} rows carry the mark unlisted)` : ""} · ${first(faults)}` : `${nf(rows)} rows read · ${nf(ruledRows)} of ${[...ruled].sort().join(", ")} · ${nf(marked)} carry the mark, each a listed line's one row, under ${nf(keysWithAMark.size)} keys · since store ${follow.readAt}, ${follow.rounds.length} round(s): ${goneLines.length} line(s) name a row struck or withheld, ${rekeyedLines.length} followed to another key`);
}
{
  const faults = [];
  if (!rec) faults.push("the index holds no sense_openings record");
  else {
    if (rec.rule_id !== SENSE_OPENINGS_RULE_ID) faults.push("the record names another rule");
    if (rec.pin !== `${HOME}/PIN.json` || rec.relay !== pin.relay) faults.push("the record names another pin or relay");
    if (!same(rec.openings, { file: `${HOME}/${pin.folder}/${pin.openings.file}`, sha256: pin.openings.sha256, lines: pin.openings.lines })) faults.push("the record names another list than the pin");
    if (ruling && !same(rec.ruling, { ...cited(ruling), ledger: ruling.ledger, print: ruling.print })) faults.push("the record cites another ruling than the pinned one");
    if (!same(rec.sources, [...ruled].sort())) faults.push(`the record names the sources ${JSON.stringify(rec.sources)} and the ruling's ledger has ${JSON.stringify([...ruled].sort())}`);
    if (rec.read_at_store_version !== ((((theirs || {}).inputs || {}).route_store || {}).store_version || null)) faults.push("the record says the list was read at another version of the store than the lane's receipt says");
    const t = rec.totals || {};
    if (t.rows_listed !== lines.length || t.rows_marked !== marked || t.rows_of_the_ruled_sources !== ruledRows) faults.push(`totals say ${t.rows_listed} listed, ${t.rows_marked} marked, ${t.rows_of_the_ruled_sources} rows of the ruled sources; a recount gives ${lines.length}, ${marked}, ${ruledRows}`);
    if (!follow) faults.push(followWhy);
    else if (!same(rec.followed, followedRecord(follow, { left: goneLines, rekeyed: rekeyedLines }))) faults.push("the record's account of the rounds since the list was read is not the row-strikes record's");
  }
  check("O4  the store's index names the rule, the pin, the list and the ruling, totals that are a recount's, and the rounds since as the row-strikes record gives them", faults.length === 0, faults.length ? first(faults) : `${nf(marked)} rows marked of ${nf(lines.length)} listed · ruling ${ruling ? ruling.n : "?"}`);
}

// ---- O5: the store reader, and the page's own functions ---------------------------------------
const rowsOf = (k) => (store.routesFor(k) || []).filter((r) => index.m_sources[r[3]]);
const isMarked = (row) => !!senseOpened(row);
{
  const faults = [];
  let page = null;
  try { page = pageReading(readFileSync(join(K3, "zone.html"), "utf8"), index); } catch (e) { if (e instanceof PageFault) faults.push(e.message); else throw e; }
  let rows = 0, notes = 0;
  for (const k of keysWithAMark) {
    const all = rowsOf(k);
    const others = all.filter((r) => !isMarked(r));
    for (const row of all) {
      rows += 1;
      const o = senseOpened(row), mine = store.readingsOf(row);
      if (o) {
        notes += 1;
        const want = (listed.get(k) || new Map()).get(idOf(row[0], String(row[1] ?? "")));
        if (mine.length) faults.push(`${k} rank ${row[0]}: a marked row gives ${mine.length} reading(s)`);
        if (`${o.entry} ${o.point}` !== want || o.text !== routePrinted(row) || !o.text) faults.push(`${k} rank ${row[0]}: the reader names its sense ${o.entry} ${o.point} «${o.text.slice(0, 30)}» and its line gives ${want}`);
      }
      if (page) {
        if (!same(page.senseOpened(row), o)) faults.push(`${k} rank ${row[0]}: the page's senseOpened gives ${JSON.stringify(page.senseOpened(row))} and the module's ${JSON.stringify(o)}`);
        if (!same(page.readingsOfRow(row), mine)) faults.push(`${k} rank ${row[0]}: the page's readingsOfRow gives ${JSON.stringify(page.readingsOfRow(row)).slice(0, 80)} and the store reader ${JSON.stringify(mine).slice(0, 80)}`);
      }
    }
    // the key's readings are its other rows' readings: a note founds none and carries none
    const a = store.readingPool(all, "oldest").map((g) => [g.text, [...g.by].sort()]), b = store.readingPool(others, "oldest").map((g) => [g.text, [...g.by].sort()]);
    if (!same(a, b)) faults.push(`${k}: the readings of its rows are not the readings of its rows that are not notes`);
  }
  check("O5  a marked row gives no reading and names its sense as its line does, a key's readings are those of its other rows, and the page's own functions, read out of zone.html and run, give what the module gives for every row of every key that holds a note", !!page && notes === marked && faults.length === 0,
    faults.length ? `${nf(faults.length)} · ${first(faults)}` : `${nf(keysWithAMark.size)} keys · ${nf(rows)} rows, ${nf(notes)} of them notes · the page's two functions agree with the module's on every one`);
}

// ---- O6: no line stands on a note; and the words for the page ---------------------------------
const beside = openBesideTheStore(K3);
// a row's grade against the word as the page takes it: by the row's own headwords where it carries them, else by the
// lattice card's grade for the surface (its fingerprint of the row's text and source); none where neither speaks
const pageGrades = (rows, w, side) => {
  const own = typeof w.s === "string" && isPointed(w.s);
  const gr = (side.grades || {})[w.s] || null;
  const lat = gr && (side.routes || {})[gr.k] ? side.routes[gr.k] : null;
  if (!lat && !own) return rows.map(() => "-");
  const at = lat ? new Map(lat.f.map((fp, i) => [fp, i])) : null;
  return rows.map((row) => {
    const sg = own ? gradeRow(row, w.s) : "-";
    if (sg !== "-" || !at) return sg;
    const m = index.m_sources[row[3]];
    const i = at.get(fnv1a(`${row[1]}|${m ? m.label : ""}`));
    return i === undefined ? "-" : (gr.g[i] || "-");
  });
};
const served = zonesServed().filter((z) => existsSync(join(ZONES, `${z}.lattice.bin`)));
const MOST = 4;
const picks = {};
const more = (kind) => (picks[kind] || []).length < MOST;
const o6 = { books: 0, texts: 0, faults: [], atRest: 0 };
let placesWithANote = 0, placesWithOnlyNotes = 0;
// the words of the notes under a key that no row other than a note prints, case folded; asked of the store whole
// (the card with every dictionary open) or, for a book baked at rest, of the store at rest
const noteOnly = new Map();
const noteWordsOnly = (k, st = store) => {
  const at = `${st === store ? "whole" : "at rest"}\u0001${k}`;
  if (!noteOnly.has(at)) {
    const all = (st.routesFor(k) || []).filter((r) => index.m_sources[r[3]]);
    const printed = new Set(st.readingPool(all, "oldest").map((g) => readingKey(g.text)));
    for (const row of rowsBeside(beside, k)) printed.add(readingKey(String(row[1] ?? "")));
    noteOnly.set(at, new Set(all.filter(isMarked).map((r) => readingKey(senseOpened(r).text)).filter((t) => !printed.has(t))));
  }
  return noteOnly.get(at);
};
for (const z of served) {
  const zone = gz(join(ZONES, `${z}.bin`));
  const side = gz(join(ZONES, `${z}.lattice.bin`));
  const namesRead = !!((((zone.emitted_from || {}).toggles || {}).lattice || {}).names);
  o6.books += 1;
  const baked = restsOffIn(kindsRec, zone) ? storeAtRest : store;
  if (baked === storeAtRest) o6.atRest += 1;
  const judge = (k, text, what) => {
    if (typeof text !== "string" || !text) return;
    o6.texts += 1;
    if (noteWordsOnly(k, baked).has(readingKey(text))) o6.faults.push(`${z} ${k}: ${what} is «${text.slice(0, 50)}», the words of a note and of no reading`);
  };
  for (const k of keysWithAMark) {
    if (zone.gloss && k in zone.gloss) judge(k, zone.gloss[k], "the key's line");
    for (const [order, col] of Object.entries(zone.gloss_orders || {})) if (col && k in col) judge(k, col[k], `the column ${order}`);
  }
  for (const [s, g] of Object.entries(side.grades || {})) {
    if (!g || !keysWithAMark.has(g.k)) continue;
    const o = g.o || {};
    for (const name of ["l", "la", "m", "x", "s", "c"]) if (Array.isArray(o[name])) judge(g.k, o[name][0], `the leader ${name} of ${s}`);
    for (const [tags, at] of Object.entries(g.e || {})) for (const name of ["l", "la"]) if (at && Array.isArray(at[name])) judge(g.k, at[name][0], `the leader ${name} of ${s} at ${tags}`);
  }
  // the words for the page: a word of one region its place does not divide, whose key holds a note
  for (const [si, sec] of (zone.sections || []).entries()) {
    const words = sec.words || [];
    for (const [e, w] of words.entries()) {
      if (w.mark || !keysWithAMark.has(w.k) || !plainWord(words, e)) continue;
      const rows = rowsOf(w.k);
      const facts = rows.map(factsOf);
      const place = w.tg ? placeEntry([].concat(w.tg)) : null;
      const bdbHere = place ? bdbEntriesAt(place, facts) : null;
      const verdicts = rows.map((r, i) => (place ? entryVerdict(facts[i], place, bdbHere) : "none"));
      const isName = !namesRead || !!w.np;
      const grades = pageGrades(rows, w, side);
      const attested = grades.includes("m");
      const gr = (side.grades || {})[w.s], rs = (side.stems || {})[w.k] || null;
      const otherStem = (row) => !!(rs && gr && Array.isArray(gr.st) && gr.st.length && isOtherStem(rs[stemsId(row[3], row[0], row[1])], gr.st));
      // what the card's switches keep, a first visit's sources all on: the entry, the name, the pointing, the stem
      const kept = rows.map((row, i) => verdicts[i] !== "other" && !nameWithheld(facts[i], isName) && (verdicts[i] === "this" || !attested || grades[i] !== "x") && !otherStem(row));
      const notesKept = rows.filter((row, i) => isMarked(row) && kept[i]);
      const notesAll = rows.filter(isMarked);
      // a reading the card can print: a row the gates keep that is not a note, a row beside the store, or the place's
      // own reading, which the page stands up as a row of its own where the place has one
      const placeReads = Array.isArray(w.pg) && w.pg.some((p) => p && String(p.g || "").trim());
      const readingsKept = placeReads || rows.some((row, i) => !isMarked(row) && kept[i]) || rowsBeside(beside, w.k).length > 0;
      if (notesKept.length) placesWithANote += 1;
      if (notesKept.length && !readingsKept) placesWithOnlyNotes += 1;
      const said = (row) => { const o = senseOpened(row); return { m: String(row[3]), entry: o.entry, point: o.point, text: o.text }; };
      const pick = { zone: z, section: si, entry: e, label: sec.label, s: w.s, k: w.k, tags: w.tg ? [].concat(w.tg) : null, rows: rows.length,
        notes: notesKept.map(said), all: notesAll.map(said), alone: [...noteWordsOnly(w.k)] };
      if (notesKept.length && readingsKept && notesKept.every((r) => noteWordsOnly(w.k).has(readingKey(senseOpened(r).text))) && more("withNotes")) (picks.withNotes ||= []).push(pick);
      if (notesKept.length < notesAll.length && readingsKept && more("withheld")) (picks.withheld ||= []).push(pick);
      if (notesKept.length && !readingsKept && more("onlyNotes")) (picks.onlyNotes ||= []).push(pick);
    }
  }
}
check("O6  no line stands on a note: in every served book, the line a key carries, each witnessed column's and every leader its sidecar keeps are no marked row's words, unless a row that is not marked prints the same", o6.books > 0 && o6.faults.length === 0,
  o6.faults.length ? `${nf(o6.faults.length)} · ${first(o6.faults)}` : `${o6.books} books (${o6.atRest} asked of the store at rest, as the record rests them) · ${nf(o6.texts)} lines and leaders under the ${nf(keysWithAMark.size)} keys that hold a note · at rest ${nf(placesWithANote)} word places print a note on their own card, ${nf(placesWithOnlyNotes)} of them and no reading`);

// ---- O7, O8, O9: on the page -------------------------------------------------------------------
const lacking = ["withNotes", "withheld"].filter((kind) => !picks[kind]);
if (lacking.length) check("O7–O8 on the page", false, `no served word was found: ${lacking.map((k) => (k === "withNotes" ? "whose key holds a note the switches keep, beside a reading" : "whose key holds a note the switches withhold")).join("; ")}`);
else {
  const tree = await serveTree(K3);
  const pw = await loadPlaywright();
  const browser = await pw.chromium.launch(launchOptions());
  // the dictionaries that rest shut (dictionary-kinds-rule-v1) are asked open: this holds the notes, and what the
  // card's switches keep was counted above over the store whole, as a card with them open reads it
  const open = (pick, masorah = null) => openGatedCard(browser, tree.base, pick, { masorah, kinds: "open" });
  const where = (pick) => `${pick.zone} ${pick.label}, entry ${pick.entry} (${pick.k}${pick.tags ? ` under ${pick.tags.join(" ")}` : ""})`;
  const own = async (list) => {
    for (const pick of list || []) { const got = await open(pick); if (got.fault || !got.joined) return [pick, got]; }
    return [null, null];
  };
  const JOINED = (list) => `each of the ${(list || []).length} word(s) found stands in a cell the page joins to its neighbors, so no card of its own was read`;
  // the card's notes are these, in this order: what the page says of them, and the line as it stands
  const notesAre = (got, want) => !!got.notes && same(got.notes.said, want) && got.notes.counted === want.length
    && same(got.notes.spans.map(([m, entry, point]) => [m, entry, point]), want.map((x) => [x.m, x.entry, x.point]))
    && got.notes.spans.every(([, , , text], i) => text.endsWith(`${want[i].point} ${want[i].text}`));
  const pillWith = (got, words) => got.said.find(([text, , ownText]) => [text, ownText].some((t) => t && words.includes(readingKey(t)))) || null;
  const say = (got) => (got.notes ? `${got.notes.said.length} note(s) ${got.notes.where ? `with the ${got.notes.where}` : "nowhere"}: "${String(got.notes.text).slice(0, 110)}"` : "the card says nothing of notes");
  try {
    {
      const [pick, got] = await own(picks.withNotes);
      check("O7  the card prints exactly the marked rows its switches keep as its notes, in the store's order, each with its entry, its point and its words, with the record of the reading held; and no pill prints a note's words",
        !!pick && !got.fault && notesAre(got, pick.notes) && got.notes.where === "record" && !pillWith(got, pick.alone),
        !pick ? JOINED(picks.withNotes) : got.fault || `${where(pick)} · ${pick.notes.length} of its ${pick.all.length} note(s) kept, of ${pick.rows} rows · ${say(got)} · ${got.said.length} pills, ${pillWith(got, pick.alone) ? "one of them a note's words" : "none of them a note's words"}`);
    }
    {
      const [pick, got] = await own(picks.withheld);
      check("O8  a marked row the switches withhold is no note", !!pick && !got.fault && notesAre(got, pick.notes),
        !pick ? JOINED(picks.withheld) : got.fault || `${where(pick)} · ${pick.notes.length} of its ${pick.all.length} note(s) kept · ${say(got)} · "${String(got.line).slice(0, 120)}"`);
      if (pick) {
        const keep = await open(pick, "keep");
        check("    and under \"keep\" every marked row of the key is a note", !keep.fault && notesAre(keep, pick.all),
          keep.fault || `${pick.all.length} note(s) under the key · ${say(keep)}`);
      }
    }
    if (picks.onlyNotes) {
      const [pick, got] = await own(picks.onlyNotes);
      check("O9  where the switches keep marked rows and no reading, the notes stand in the readings' band", !!pick && !got.fault && notesAre(got, pick.notes) && got.notes.where === "band" && got.said.length === 0,
        !pick ? JOINED(picks.onlyNotes) : got.fault || `${where(pick)} · ${say(got)} · ${got.said.length} pills`);
    } else check("O9  where the switches keep marked rows and no reading, the notes stand in the readings' band", placesWithANote > 0, `no served word is so: of ${nf(placesWithANote)} places whose card keeps a note, ${nf(placesWithOnlyNotes)} keep no reading`);
  } finally { await browser.close().catch(() => {}); await tree.close(); }
}

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
