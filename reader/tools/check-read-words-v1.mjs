#!/usr/bin/env node
// RUN: tree
// GUARDS: read-words-rule-v1-each-read-word-of-a-read-form-of-several-words-carries-its-own-entry-and-the-place-reads-their-pieces
// LEDGER: -
// no frame letter. A check reads the list's pin, the zones, the store and
// the pages and judges them; it is not the ledger for one.
//
// EACH READ WORD OF A READ FORM OF SEVERAL WORDS CARRIES ITS OWN ENTRY, AND
// THE PLACE READS THEIR PIECES. At 28 places written one way and read
// another the read form holds two or three words. Lattice v12 gave none of
// those read words a tag, and 14 of the places no pieces, so the page read
// each by its bare letters: «manna» at Job 38:1, where TAHOT tags the read
// word «from». The corpus lane's relay v192 (14 November 2026) lists each
// read word's main tag and pieces; tools/apply-read-words-v1.mjs writes them
// on the zones, and the page asks a read word its entry by its own key.
// What a zone carries for a listed place is said once, in
// tools/read-words-v1.mjs, and judged by it here. The laws:
//
//   R1  the pin's five files are the bytes it names; the lane's receipt
//       names the two lists, the counts and the rule the same, and read the
//       strokes against the list the paseq pin names; the list is well
//       formed and recounts to the lane's own counts; and the pin holds a
//       place's pieces, or the place whole (its entry holds «tags and
//       pieces»), nothing else
//   R2  the stroke facts of the same relay equal relay v179's list, line
//       for line (they write nothing: the zones carry both facts from that
//       list); the places they call among the listed places are the listed
//       places that carry a stroke; and at such a place the word found by
//       its surface is the word relay v179 numbers
//   R3  every listed place is found once on its zone, by its verse and the
//       lattice's surface, with the list's read words letter for letter;
//       each read word's own region carries its main tag and the one TAHOT
//       gives no main tag carries none, and at a place the pin holds whole
//       no read word carries a tag; no other read word of a read form of
//       several words carries a tag in any work on disk; and every read
//       form of several words on a served zone is a listed place
//   R4  the pieces: a place the lattice gave none carries the list's, in
//       read-word order; a place it gave its own carries those, equal to
//       the list's; a place whose pieces the pin holds back carries none
//   R5  each zone's record names the list and what its places carry, as a
//       recount gives it (a place the pin holds whole with its tags held),
//       and its write is typed; a zone whose every place is held whole is
//       not written, and carries no record
//   R6  on the page as a first visit opens it, the line under every place
//       whose pieces stand is its read words' pieces in order, credited to
//       the source the zone names for them, and each reading the pin names
//       is drawn there: at Job 38:1 read word 1 reads «from», and at
//       I Chronicles 27:12 «of the/ Ben», the two the landing plan of
//       14 November names; a place whose pieces are held back is credited
//       to no piece
//   R7  on the page, each read word is a block of its read form's card, and
//       there it is asked its own entry: the block names the entry and
//       withholds exactly the rows the gate calls another entry's
//       (tools/entry-gate-v1.mjs, recounted here on the store's rows under
//       the read word's key); a read word with no tag, and every read word
//       of a place the pin holds whole, is asked none
//   R8  on the page, the written form of every listed place is asked only
//       what the lattice gives the written half, never a read word's entry:
//       its card is asked the written half's own tags (none where it carries
//       none, or where it is written as several words), and each block of
//       it that is a written word names that word's own tags and withholds
//       exactly the rows the gate calls another entry's under them (none
//       where it carries none). A written word may share its letters with a
//       read word: at II Samuel 8:3 the written form has the letters of read
//       word 1 of the read form, and the card asked by those letters was
//       gated under that read word's tag until 15 November 2026
//
// Run: node tools/check-read-words-v1.mjs
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PinFault } from "./pinned-v1.mjs";
import { zonesOnDisk, zonesServed } from "./zones-on-disk-v1.mjs";
import { openRouteStore, factsOf, printedForm } from "./gloss-store-v1.mjs";
import { placeEntry, entrySaid, bdbEntriesAt, entryVerdict } from "./entry-gate-v1.mjs";
import { EXEMPTION_RULE_ID } from "./zone-post-build-v1.mjs";
import { linesOnPage } from "./resting-lines-v1.mjs";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { serveTree } from "./serve-tree-v1.mjs";
import {
  READ_WORDS_RULE_ID, READ_WORDS_HOME, READ_WORDS_TOOL, PASEQ_PLACE_HOME, readReadWords, readPaseqList, receiptAgainst,
  placesOf, namedReadings, findPlace, wordNumberOf, carriedAt, piecesDue, HOLDS, holdsWhole, severalReadWords, strokesAgainst,
} from "./read-words-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const ZONES = join(K3, "data", "zones");
const PIN = join(K3, READ_WORDS_HOME, "PIN.json");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const nf = (x) => Number(x).toLocaleString("en-US");
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const first = (xs, k = 3) => xs.slice(0, k).join(" · ") + (xs.length > k ? ` · and ${xs.length - k} more` : "");
const gz = (path) => JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"));

console.log(`— ${READ_WORDS_RULE_ID} —\n`);
if (!existsSync(PIN)) { console.log(`SKIPPED — no list of read words on this disk (${READ_WORDS_HOME}/PIN.json)`); process.exit(3); }

// ---- R1: the pin, the receipt, the list -----------------------------------------------------------
let read = null, paseq = null, places = [];
{
  const faults = [];
  try { read = readReadWords(PIN); paseq = readPaseqList(join(K3, PASEQ_PLACE_HOME, "PIN.json")); } catch (e) { if (e instanceof PinFault) faults.push(e.message); else throw e; }
  if (read && paseq) {
    faults.push(...receiptAgainst(read, paseq.pin));
    const got = placesOf(read);
    places = got.places;
    faults.push(...got.faults);
    for (const h of Array.isArray(read.pin.pieces_held) ? read.pin.pieces_held : []) if (!HOLDS.includes(h.holds ?? "pieces")) faults.push(`the pin holds ${JSON.stringify(h.holds)} at ${h.book} ${h.ref}, and an entry holds ${HOLDS.map((x) => `"${x}"`).join(" or ")}`);
    // the list's own recount against the lane's counts
    const L = read.counts.listed || {}, S = read.counts.strokes || {};
    const words = places.flatMap((p) => p.words), of = (use) => places.filter((p) => p.use === use);
    const mine = {
      listed_places: places.length, read_words: read.lines.length,
      lines_new_pieces: of("NEW_PIECES").reduce((n, p) => n + p.words.length, 0), lines_ties_existing_pieces: of("TIES_EXISTING_PIECES").reduce((n, p) => n + p.words.length, 0),
      places_without_pieces: of("NEW_PIECES").length, places_with_pieces: of("TIES_EXISTING_PIECES").length,
      with_one_main_tag: words.filter((w) => w.tag !== null).length, tie_pieces_checked: of("TIES_EXISTING_PIECES").reduce((n, p) => n + p.pieces.length, 0),
    };
    for (const [k, v] of Object.entries(mine)) if (L[k] !== v) faults.push(`the lane counts ${k} ${L[k]} and the list recounts to ${v}`);
    if ((L.with_no_main_tag || []).length !== words.length - mine.with_one_main_tag) faults.push(`the lane counts ${(L.with_no_main_tag || []).length} read word(s) with no main tag and the list holds ${words.length - mine.with_one_main_tag}`);
    if (S.listed !== read.strokes.length || S.among_the_listed_places !== read.strokes.filter((s) => s.among_the_listed_places).length) faults.push("the lane's count of stroke lines, or of those among the listed places, is not the stroke file's");
  }
  check("R1  the pin's five files are the bytes it names, the lane's receipt names them the same and read the strokes against the paseq pin's list, the list is well formed and recounts to the lane's own counts, and the pin holds a place's pieces or the place whole, nothing else", !!read && !!paseq && faults.length === 0,
    faults.length ? `${faults.length} · ${first(faults)}` : `relay ${read.pin.relay} · list ${read.pin.read_words.sha256.slice(0, 12)} · ${places.length} places, ${read.lines.length} read words (${places.flatMap((p) => p.words).filter((w) => w.tag !== null).length} with a main tag) · ${places.filter((p) => p.use === "NEW_PIECES").length} places the lattice gave no pieces, ${places.filter((p) => p.use === "TIES_EXISTING_PIECES").length} it gave its own · ${places.filter((p) => p.held).length} held back by the pin, ${places.filter(holdsWhole).length} of them whole`);
}
if (!read || !paseq) { console.log(`\n${bad} FAILED`); process.exit(1); }

// ---- the places on their zones --------------------------------------------------------------------
const zoneOf = new Map();
const readZone = (book) => { if (!zoneOf.has(book)) zoneOf.set(book, existsSync(join(ZONES, `${book}.bin`)) ? gz(join(ZONES, `${book}.bin`)) : null); return zoneOf.get(book); };
const at = [];   // { place, found, carried, due } for each place found
const lost = [];
for (const place of places) {
  const zone = readZone(place.book);
  const found = zone ? findPlace(zone, place) : { fault: "no zone on disk" };
  if (found.fault) { lost.push(`${place.book} ${place.ref}: ${found.fault}`); continue; }
  at.push({ place, found, carried: carriedAt(found, place), due: piecesDue(place), whole: holdsWhole(place) });
}
const saidOf = (x) => `${x.place.book} ${x.place.ref}`;

// ---- R2: the strokes ------------------------------------------------------------------------------
{
  const faults = strokesAgainst(read.strokes, paseq.lines, places);
  let shared = 0;
  for (const [i, s] of read.strokes.entries()) {
    if (!s.among_the_listed_places) continue;
    const P = s.on_the_place || {};
    const hit = at.find((x) => x.place.book === s.book && x.place.lattice.i === P.i && x.place.lattice.j === P.j);
    const n = paseq.lines[i] ? Number(String(paseq.lines[i].place).split(":")[2]) : NaN;
    if (!hit) faults.push(`${s.book} ${s.ref}: no listed place found on the zone stands at the stroke's place`);
    else if (wordNumberOf(hit.found.sec, hit.found.at) !== n) faults.push(`${s.book} ${s.ref}: found by its surface at word ${wordNumberOf(hit.found.sec, hit.found.at)}, and relay v179 numbers the place ${n}`);
    else shared += 1;
  }
  check("R2  the stroke facts equal relay v179's list line for line, those they call among the listed places are the listed places that carry a stroke, and at such a place the word found by its surface is the word that list numbers", faults.length === 0,
    faults.length ? `${faults.length} · ${first(faults)}` : `${read.strokes.length} of ${paseq.lines.length} lines equal · ${shared} of them at listed places, each the word relay ${paseq.pin.relay} numbers · nothing is written from them`);
}

// ---- R3: the tags ---------------------------------------------------------------------------------
{
  const faults = [...lost];
  for (const x of at) {
    const has = JSON.stringify(x.found.reads.map((r) => r.tg ?? null));
    if (x.whole && x.carried.tags !== "none") faults.push(`${saidOf(x)}: the pin holds the place whole, and its read words carry ${has}`);
    else if (!x.whole && x.carried.tags !== "the list's") faults.push(`${saidOf(x)}: its read words carry ${has}, and the list gives ${JSON.stringify(x.place.words.map((w) => w.tag))}`);
  }
  const owned = new Set(at.map((x) => x.found.word));
  const served = new Set(zonesServed(ZONES));
  let several = 0;
  for (const book of zonesOnDisk(ZONES)) {
    for (const x of severalReadWords(readZone(book))) {
      if (served.has(book)) several += 1;
      if (owned.has(x.word)) continue;
      if (x.reads.some((r) => r.tg !== undefined)) faults.push(`${book} ${x.sec.label}: a read word of ${x.word.s} carries a tag no line names`);
      if (served.has(book)) faults.push(`${book} ${x.sec.label}: ${x.word.s} is read as several words and the list does not name it`);
    }
  }
  const landing = at.filter((x) => !x.whole), whole = at.filter((x) => x.whole);
  const tagged = landing.reduce((n, x) => n + x.place.words.filter((w) => w.tag !== null).length, 0);
  check("R3  every listed place is found once on its zone with the list's read words, each read word's region carries its main tag and the one with none carries none, at a place the pin holds whole none carries a tag, no other read word of several carries a tag, and every read form of several words on a served zone is listed", faults.length === 0 && at.length === places.length,
    faults.length ? `${faults.length} · ${first(faults)}` : `${at.length} places on ${new Set(at.map((x) => x.place.book)).size} zones · ${tagged} read words carry their main tag, ${landing.reduce((n, x) => n + x.place.words.length, 0) - tagged} carries none · ${whole.reduce((n, x) => n + x.place.words.length, 0)} at ${whole.length} place(s) the pin holds whole carry none · ${several} read forms of several words on the served zones, all listed`);
}

// ---- R4: the pieces -------------------------------------------------------------------------------
{
  const faults = [];
  for (const x of at) {
    const want = x.due === "held" ? "none" : "the list's";
    if (x.carried.pieces !== want) faults.push(`${saidOf(x)}: its pieces are ${x.due === "held" ? "held back by the pin" : x.due === "tied" ? "the lattice's own" : "the list's to lay"}, and the zone carries ${x.carried.pieces === "none" ? "none" : JSON.stringify(x.found.word.pg)}`);
  }
  const of = (due) => at.filter((x) => x.due === due);
  check("R4  a place the lattice gave no pieces carries the list's in read-word order, a place it gave its own carries those, equal to the list's, and a place whose pieces the pin holds back carries none", faults.length === 0 && at.length === places.length,
    faults.length ? `${faults.length} · ${first(faults)}` : `${of("written").length} places laid with the list's pieces (${of("written").reduce((n, x) => n + x.place.pieces.length, 0)} pieces) · ${of("tied").length} whose own pieces are the list's (${of("tied").reduce((n, x) => n + x.place.pieces.length, 0)} pieces) · ${of("held").length} held back${of("held").length ? ` (${of("held").map(saidOf).join(", ")})` : ""}`);
}

// ---- R5: each zone's record, and its typing -------------------------------------------------------
{
  const faults = [];
  // a zone is written, and carries a record, where a place of it is not held whole
  const books = [...new Set(at.filter((x) => !x.whole).map((x) => x.place.book))];
  for (const book of books) {
    const zone = readZone(book), here = at.filter((x) => x.place.book === book);
    const rec = (zone.emitted_from || {}).read_words, pb = (zone.emitted_from || {}).post_build;
    const count = (f) => here.reduce((n, x) => n + f(x), 0);
    const mine = {
      here: here.map((x) => ({ ref: x.place.ref, section_word: x.found.at, word: wordNumberOf(x.found.sec, x.found.at), tags: x.whole ? "held" : x.place.words.map((w) => w.tag), pieces: x.due })),
      counts: { places: here.length, read_words: count((x) => x.place.words.length), read_words_tagged: count((x) => (x.whole ? 0 : x.place.words.filter((w) => w.tag !== null).length)),
        places_laid_with_the_lists_pieces: here.filter((x) => x.due === "written").length, places_whose_own_pieces_are_the_lists: here.filter((x) => x.due === "tied").length, places_whose_pieces_are_held_back: here.filter((x) => x.due === "held").length },
    };
    if (!rec || rec.rule_id !== READ_WORDS_RULE_ID || rec.applied_by !== READ_WORDS_TOOL || rec.relay !== read.pin.relay || !rec.list || rec.list.sha256 !== read.pin.read_words.sha256 || rec.list.lines !== read.pin.read_words.lines)
      faults.push(`${book}: the zone's record ${rec ? `names list ${String((rec.list || {}).sha256).slice(0, 12)} of relay ${rec.relay}` : "is missing"}`);
    else if (!same(rec.here, mine.here) || !same(rec.counts, mine.counts)) faults.push(`${book}: the zone's record says ${JSON.stringify(rec.counts)} and a recount gives ${JSON.stringify(mine.counts)}${same(rec.counts, mine.counts) ? ", and its places are not the recount's" : ""}`);
    if (!pb || pb.rule_id !== EXEMPTION_RULE_ID || !(pb.wrote || []).includes("emitted_from.read_words") || !String(pb.by).includes(READ_WORDS_TOOL)) faults.push(`${book}: the write is not typed on the zone (emitted_from.post_build)`);
  }
  for (const book of zonesOnDisk(ZONES)) if (!books.includes(book) && (readZone(book).emitted_from || {}).read_words) faults.push(`${book}: carries a record of read words and ${at.some((x) => x.place.book === book) ? "the pin holds every place of it whole" : "the list names no place of it"}`);
  check("R5  each zone's record names the list and what its places carry, as a recount gives it (a place the pin holds whole with its tags held), and its write is typed", faults.length === 0 && books.length > 0,
    faults.length ? `${faults.length} · ${first(faults)}` : `${books.length} zones, each with its record and its typed write`);
}

// ---- R6, R7: the page -----------------------------------------------------------------------------
// what the gate gives each read word, recounted on the store's rows under its key
const store = openRouteStore(join(K3, "data", "route-store"));
const rowsOf = (k) => (store.routesFor(k) || []).filter((r) => store.index.m_sources[r[3]]);
// under a key, asked the given tags (null: none)
const gateUnder = (key, tags) => {
  const rows = rowsOf(key);
  if (!tags) return { rows: rows.length, said: "", other: 0, own: 0, names: "" };
  const place = placeEntry(tags), facts = rows.map(factsOf), bdbHere = bdbEntriesAt(place, facts);
  const verdicts = facts.map((f) => entryVerdict(f, place, bdbHere));
  return { rows: rows.length, said: entrySaid(place).join("|"), names: entrySaid(place).join(" or "), other: verdicts.filter((v) => v === "other").length, own: verdicts.filter((v) => v === "this").length };
};
const gateOf = (w) => gateUnder(w.letters, w.tag === null ? null : [w.tag]);
// the written half of a place: its regions, and the tags the card of its form is due (a form written as several words opens as a branch, asked under none)
const writtenOf = (word) => {
  const regions = (word.w || []).filter((r) => r && r.role === "KETIV");
  return { regions, tags: regions.length === 1 && regions[0].tg ? [].concat(regions[0].tg) : regions.length === 1 && regions[0].te ? [].concat(regions[0].te) : null };
};
/** IN THE PAGE. One place's card, moved to its read form, each read word's block pressed and read. Handed to the
 *  browser whole. A block is read only while the card stands on it. `again` says the page opened the card anew
 *  while it was being read, so nothing was read off it: it opens a visit's first card again when the book's late
 *  files arrive (tools/card-readings-v1.mjs tells which), and builds a card's rows anew each time it opens one. */
const BLOCKS = async ({ section, entry, keys }) => {
  const hud = document.getElementById("hud");
  const turn = () => new Promise((r) => { setTimeout(r, 40); });
  const rows = () => (hud.hidden ? null : hud.querySelector(":scope > .rows"));
  const settled = () => { const band = hud.querySelector(":scope > .rows > .b-read"); return !!(band && band.children.length && !band.querySelector(":scope > .r-wait")); };
  const wait = async () => { const t0 = performance.now(); await turn(); while (!settled() && performance.now() - t0 < 20000) await turn(); return settled(); };
  const done = (out) => { document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); return out; };
  const pressed = (b) => !!b && b.getAttribute("aria-pressed") === "true";
  const sec = document.querySelectorAll("section.seg")[section];
  const wb = sec ? sec.querySelectorAll(".he-text .wb")[entry] : null;
  if (!wb) return { fault: "the word is not on the page" };
  (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
  if (!(await wait())) return done({ fault: "the card's readings did not arrive" });
  const readForm = () => [...hud.querySelectorAll(":scope > .rows > .b-q .s-pills button")].find((b) => /^qere/u.test((b.querySelector(".q-role") || {}).textContent || ""));
  if (!readForm()) return done({ fault: "the card offers no read form to press" });
  if (!pressed(readForm())) { readForm().click(); if (!(await wait())) return done({ fault: "the read form's readings did not arrive" }); }
  // from here the card is the read form's, and a card the page opens in its place is told from it by its rows
  const card = rows();
  if (!pressed(readForm())) return done({ again: true });
  const press = async (b) => { b.click(); const here = await wait(); return rows() !== card ? "again" : here ? null : "late"; };
  const cuts = () => [...hud.querySelectorAll(":scope > .rows > .b-cut .s-pills button")];
  const blocks = () => [...hud.querySelectorAll(":scope > .rows > .b-cell .s-pills button")];
  const theReadWords = () => { const b = blocks().map((x) => x.textContent); return b.length === keys.length && b.every((t, i) => t === keys[i]); };
  // the division that is the read words one by one: the one the card stands on, or one press away
  for (let i = 0; !theReadWords() && i < cuts().length; i += 1) if ((await press(cuts()[i])) === "again") return done({ again: true });
  if (!theReadWords()) return done({ fault: `the read form's card offers no division into its read words (its blocks: ${blocks().map((x) => x.textContent).join(" | ") || "none"})` });
  const out = [];
  for (let i = 0; i < keys.length; i += 1) {
    const how = await press(blocks()[i]);
    if (how === "again") return done({ again: true });
    if (how || !pressed(blocks()[i])) { out.push({ fault: how ? "the block's readings did not arrive" : "the card does not stand on the block pressed" }); continue; }
    const pills = hud.querySelector(":scope > .rows > .b-read > .r-pills");
    out.push({ data: pills ? { ...pills.dataset } : null, pills: pills ? pills.querySelectorAll(":scope > button").length : 0, line: (hud.querySelector(".withheld-line") || {}).textContent || "" });
  }
  return done({ blocks: out, pointing: window.__masorah || null });
};
/** IN THE PAGE. One place's card, moved to its written form: the tags the card is asked under (window.__cardEntry,
 *  the open form's), then every block the card offers, in each of its divisions, pressed and read. Handed to the
 *  browser whole; `again` as in BLOCKS. */
const WRITTEN = async ({ section, entry }) => {
  const hud = document.getElementById("hud");
  const turn = () => new Promise((r) => { setTimeout(r, 40); });
  const rows = () => (hud.hidden ? null : hud.querySelector(":scope > .rows"));
  const settled = () => { const band = hud.querySelector(":scope > .rows > .b-read"); return !!(band && band.children.length && !band.querySelector(":scope > .r-wait")); };
  const wait = async () => { const t0 = performance.now(); await turn(); while (!settled() && performance.now() - t0 < 20000) await turn(); return settled(); };
  const done = (out) => { document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); return out; };
  const pressed = (b) => !!b && b.getAttribute("aria-pressed") === "true";
  const sec = document.querySelectorAll("section.seg")[section];
  const wb = sec ? sec.querySelectorAll(".he-text .wb")[entry] : null;
  if (!wb) return { fault: "the word is not on the page" };
  (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
  if (!(await wait())) return done({ fault: "the card's readings did not arrive" });
  const writtenForm = () => [...hud.querySelectorAll(":scope > .rows > .b-q .s-pills button")].find((b) => /^ketiv/u.test((b.querySelector(".q-role") || {}).textContent || ""));
  if (!writtenForm()) return done({ fault: "the card offers no written form to press" });
  if (!pressed(writtenForm())) { writtenForm().click(); if (!(await wait())) return done({ fault: "the written form's readings did not arrive" }); }
  const card = rows();
  if (!pressed(writtenForm())) return done({ again: true });
  const asked = String(window.__cardEntry ?? "");
  const press = async (b) => { b.click(); const here = await wait(); return rows() !== card ? "again" : here ? null : "late"; };
  const cuts = () => [...hud.querySelectorAll(":scope > .rows > .b-cut .s-pills button")];
  const cells = () => [...hud.querySelectorAll(":scope > .rows > .b-cell .s-pills button")];
  const out = [];
  for (let d = 0; d < Math.max(1, cuts().length); d += 1) {
    if (cuts()[d] && !pressed(cuts()[d]) && (await press(cuts()[d])) === "again") return done({ again: true });
    for (let i = 0; i < cells().length; i += 1) {
      const key = cells()[i].textContent;
      const how = await press(cells()[i]);
      if (how === "again") return done({ again: true });
      if (how || !pressed(cells()[i])) { out.push({ key, fault: how ? "the block's readings did not arrive" : "the card does not stand on the block pressed" }); continue; }
      const pills = hud.querySelector(":scope > .rows > .b-read > .r-pills");
      out.push({ key, data: pills ? { ...pills.dataset } : null, line: (hud.querySelector(".withheld-line") || {}).textContent || "" });
    }
  }
  return done({ asked, blocks: out, pointing: window.__masorah || null });
};
// the readings the pin names for the page's line (the two the landing plan of 14 November 2026 names)
const NAMED = namedReadings(read.pin);
const lineFaults = [], cardFaults = [], read6 = { pieces: 0, laid: 0, held: 0, named: [] }, read7 = { asked: 0, other: 0, own: 0, untagged: 0, whole: 0, cards: 0 };
const writtenFaults = [], read8 = { cards: 0, tagged: 0, words: 0, rowless: 0, other: 0 };
const byBook = new Map();
for (const x of at) (byBook.get(x.place.book) || byBook.set(x.place.book, []).get(x.place.book)).push(x);
if (at.length) {
  const tree = await serveTree(K3);
  const pw = await loadPlaywright();
  const browser = await pw.chromium.launch(launchOptions());
  try {
    for (const [book, list] of byBook) {
      const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
      try {
        const p = await ctx.newPage();
        const errors = [];
        p.on("pageerror", (e) => errors.push(String(e && e.message)));
        await p.goto(`${tree.base}/zone.html?b=${book}`, { waitUntil: "networkidle" });
        const drew = await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 }).then(() => true, () => false);
        if (!drew) { lineFaults.push(`${book}: the page drew no word within a minute${errors.length ? ` (it threw: ${errors[0]})` : ""}`); cardFaults.push(`${book}: the page drew no word`); continue; }
        // the lines first, as the page rests: nothing pressed yet
        for (const x of list) {
          const where = saidOf(x), zone = readZone(book);
          let got = null;
          try { got = await linesOnPage(p, { from: x.found.si, to: x.found.si + 1 }); } catch (e) { lineFaults.push(`${where}: ${String(e.message || e).split("\n")[0].slice(0, 140)}`); continue; }
          const unit = (got.sections[0].units || []).find((u) => u[0] <= x.found.at && x.found.at < u[0] + u[1]) || null;
          if (got.state.pointing !== "only" || got.state.defaults !== "step") { lineFaults.push(`${where}: the page does not rest as a first visit (${JSON.stringify(got.state)})`); continue; }
          if (x.due === "held") {
            read6.held += 1;
            if (unit && /(^| )PIECE:/u.test(unit[3])) lineFaults.push(`${where}: its pieces are held back and its line is credited to ${unit[3]}`);
            continue;
          }
          // the pieces as the zone carries them, drawn as the page joins a divided reading; credited to their own source
          const pg = x.found.word.pg || [];
          const want = printedForm(pg.map((piece) => String(piece.g ?? "").trim()).join("/"));
          const who = [...new Set(pg.map((piece) => `PIECE:${String(piece.s).toUpperCase()}`))].join(" ");
          if (!unit || unit[1] !== 1 || unit[2] !== want || unit[3] !== who) { lineFaults.push(`${where}: the line reads ${unit ? `«${unit[2]}» (${unit[3] || "no credit"}) under ${unit[1]} word(s)` : "nothing"}, and its pieces read «${want}» (${who})`); continue; }
          read6.pieces += 1; if (x.due === "written") read6.laid += 1;
          // a reading the pin names: the read word's own part of the line (R1 holds the name to the list)
          for (const named of NAMED.filter((e) => e.book === book && e.ref === x.place.ref)) {
            const w = x.place.words[named.read_word - 1], before = x.place.words.slice(0, named.read_word - 1).reduce((n, v) => n + v.pieces.length, 0);
            const drawn = unit[2].split(" + ").slice(before, before + w.pieces.length).join(" + ");
            if (drawn !== printedForm(named.reads)) lineFaults.push(`${where} read word ${named.read_word}: the line draws «${drawn}», and the pin names it «${named.reads}»`);
            else read6.named.push(`${zone.work || book} ${x.place.ref} read word ${named.read_word} «${drawn}»`);
          }
        }
        // then the cards: each read word's block on its read form's card
        for (const x of list) {
          const where = saidOf(x);
          // a card the page opened again while it was read is read again
          let got = null;
          for (let n = 0; n < 3 && (!got || got.again); n += 1) got = await p.evaluate(BLOCKS, { section: x.found.si, entry: x.found.at, keys: x.place.words.map((w) => w.letters) });
          if (got.again) { cardFaults.push(`${where}: the page opened the card again each of the 3 times it was read`); continue; }
          if (got.fault) { cardFaults.push(`${where}: ${got.fault}`); continue; }
          if (got.pointing !== "only") { cardFaults.push(`${where}: the page's pointing is ${got.pointing}, so no entry is asked`); continue; }
          read7.cards += 1;
          x.place.words.forEach((w, i) => {
            const b = got.blocks[i], say = `${where} read word ${w.n}`;
            if (b.fault || !b.data) { cardFaults.push(`${say}: ${b.fault || "its block prints no readings to read the gate off"}`); return; }
            // asked no entry: a read word TAHOT gives no main tag, and every read word of a place the pin holds whole
            if (w.tag === null || x.whole) {
              if (b.data.entry !== "" || Number(b.data.entryWithheld) !== 0) cardFaults.push(`${say}: ${x.whole ? "the pin holds its place whole" : "TAHOT gives it no main tag"} and its block is asked ${b.data.entry || "no entry"} and withholds ${b.data.entryWithheld}`);
              else if (x.whole) read7.whole += 1; else read7.untagged += 1;
              return;
            }
            const g = gateOf(w);
            if (b.data.entry !== g.said || Number(b.data.entryWithheld) !== g.other || (g.other > 0 && !b.line.includes(`${g.other} of another entry than ${g.names}, withheld`)))
              cardFaults.push(`${say}: its block is asked ${b.data.entry || "no entry"} and withholds ${b.data.entryWithheld}; the gate asks ${g.said} and calls ${g.other} of the ${g.rows} rows under its key another entry's ("${b.line}")`);
            else { read7.asked += 1; read7.other += g.other; read7.own += g.own; }
          });
        }
        // and the written form's card: asked only what the written half carries
        for (const x of list) {
          const where = saidOf(x), written = writtenOf(x.found.word);
          let got = null;
          for (let n = 0; n < 3 && (!got || got.again); n += 1) got = await p.evaluate(WRITTEN, { section: x.found.si, entry: x.found.at });
          if (got.again) { writtenFaults.push(`${where}: the page opened the card again each of the 3 times it was read`); continue; }
          if (got.fault) { writtenFaults.push(`${where}: ${got.fault}`); continue; }
          if (got.pointing !== "only") { writtenFaults.push(`${where}: the page's pointing is ${got.pointing}, so no entry is asked`); continue; }
          const due = written.tags ? written.tags.join(" ") : "", was = writtenFaults.length;
          if (got.asked !== due) writtenFaults.push(`${where}: the written form's card is asked ${got.asked || "no entry"}, and the written half carries ${due || "no tag"}`);
          // each block that is a written word: its own tags, or none (a block that is a read word is R7's)
          let words = 0;
          for (const b of got.blocks) {
            const r = written.regions.find((w) => w.k === b.key);
            if (!r) continue;
            words += 1;
            const g = gateUnder(r.k, r.tg ? [].concat(r.tg) : null), say = `${where} written word ${b.key}`;
            // a written word the store holds no row under prints no readings, and has none to withhold
            if (!b.fault && !b.data && g.rows === 0) { read8.words += 1; read8.rowless += 1; continue; }
            if (b.fault || !b.data) writtenFaults.push(`${say}: ${b.fault || `its block prints no readings, and the store holds ${g.rows} rows under its key`}`);
            else if (b.data.entry !== g.said || Number(b.data.entryWithheld) !== g.other)
              writtenFaults.push(`${say}: its block is asked ${b.data.entry || "no entry"} and withholds ${b.data.entryWithheld}; it carries ${r.tg ? [].concat(r.tg).join(" ") : "no tag"}, under which the gate calls ${g.other} of the ${g.rows} rows under its key another entry's ("${b.line}")`);
            else { read8.words += 1; read8.other += g.other; }
          }
          if (!words) writtenFaults.push(`${where}: the written form's card offers no block that is a written word`);
          if (writtenFaults.length === was) { read8.cards += 1; if (written.tags) read8.tagged += 1; }
        }
        if (errors.length) { lineFaults.push(`${book}: the page threw: ${errors[0]}`); cardFaults.push(`${book}: the page threw: ${errors[0]}`); writtenFaults.push(`${book}: the page threw: ${errors[0]}`); }
      } finally { await ctx.close(); }
    }
  } finally { await browser.close(); await tree.close(); }
}
const standing = at.filter((x) => x.due !== "held").length, taggedWords = at.reduce((n, x) => n + (x.whole ? 0 : x.place.words.filter((w) => w.tag !== null).length), 0);
check("R6  on the page as a first visit opens it, the line under every place whose pieces stand is its read words' pieces in order, credited to their source, and each reading the pin names is drawn there; a place whose pieces are held back is credited to no piece",
  at.length === places.length && lineFaults.length === 0 && read6.pieces === standing && read6.named.length === NAMED.length,
  lineFaults.length ? `${lineFaults.length} · ${first(lineFaults)}` : `${read6.pieces} lines are their pieces (${read6.laid} laid by the list, ${read6.pieces - read6.laid} the zone's own) · ${read6.named.join(" · ") || (NAMED.length ? "the named readings were not read" : "the pin names no reading")} · ${read6.held} held back, credited to no piece`);
check("R7  on the page, each read word is asked its own entry on its read form's card: its block names the entry and withholds exactly the rows the gate calls another entry's, and a read word with no tag, or of a place the pin holds whole, is asked none",
  at.length === places.length && cardFaults.length === 0 && read7.asked === taggedWords && read7.cards === at.length,
  cardFaults.length ? `${cardFaults.length} · ${first(cardFaults)}` : `${read7.asked} read words asked their own entry on ${read7.cards} cards · ${nf(read7.other)} rows of another entry withheld, as the gate recounts them · ${nf(read7.own)} rows of the read words' own entries stand · ${read7.untagged} read word with no tag asked none · ${read7.whole} read words of a place the pin holds whole asked none`);
check("R8  on the page, the written form of every listed place is asked only what the written half carries, never a read word's entry: its card is asked the written half's own tags (none where it carries none or is written as several words), and each block of it that is a written word withholds exactly what the gate calls another entry's under that word's own tags (none where it carries none)",
  at.length === places.length && writtenFaults.length === 0 && read8.cards === at.length,
  writtenFaults.length ? `${writtenFaults.length} · ${first(writtenFaults)}` : `${read8.cards} written forms asked only their own (${read8.tagged} carry the lattice's tags, ${read8.cards - read8.tagged} none) · ${read8.words} blocks that are written words read (${read8.rowless} with no row under their key) · ${nf(read8.other)} rows withheld under the written words' own tags`);

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
