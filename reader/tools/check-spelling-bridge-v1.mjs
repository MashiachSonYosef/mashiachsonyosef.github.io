#!/usr/bin/env node
// RUN: tree
// GUARDS: spelling-bridge-rule-v1-where-our-text-spells-a-word-otherwise-and-step-names-our-spelling-the-place-reads-steps-own-words-for-it-cut-on-our-letters
// LEDGER: -
// no frame letter. A check reads the bridge's pin, the zones, the records of
// the lines at rest and the pages and judges them; it is not the ledger for
// one.
//
// WHERE OUR TEXT SPELLS A WORD OTHERWISE AND STEP NAMES OUR SPELLING, THE
// PLACE READS STEP'S OWN WORDS FOR IT, CUT ON OUR LETTERS. Lattice v12 reads
// STEP under the Leningrad text's spelling, so a place our text spells
// otherwise had nothing of its own to draw: its line was whatever row led
// under the key, and once STEP's rows stood under our spelling (ship 11c)
// Daniel 4:21 read 4:16's row and I Samuel 26:7 read 26:11's. The corpus
// lane's relay v202 (20 November 2026) lists the 1,173 places and cuts
// STEP's pieces onto our letters; tools/apply-spelling-bridge-v1.mjs lays
// them at the classes the pin names, each piece worded as STEP's own row
// for the place writes it. What a zone carries for a laid place is said
// once, in tools/spelling-bridge-v1.mjs, and judged by it here.
//
// SHIP 17 (22 November 2026; the lane's relay v214, bridge v1.1). The pin
// reads v1.1 beside v1 and lays the other places of new pieces too, each
// piece worded by its part of STEP's column as written, its ends trimmed;
// it holds within their class the places whose pieces carry STEP's «}+» tag,
// the places that are pairs, and the places call 4 of relay v189 holds as they
// rest (STEP's words written with « | »), and the places where call 4 makes
// STEP's own reading stand. Those were laid in ship 17's first build: the
// page asks the default source's layer before the place's pieces, so the line
// at rest stayed STEP's words under STEP's credit, and the pieces read the
// place a second way beside it, on its card (check-compspan-coverage-v1 C3)
// and across words under a source pressed (check-rulings-under-sources-v1
// U8). They wait for the page lane. B4 and B5 still owe, at any laid place the
// default picks' index marks as standing, STEP's words under STEP's credit,
// and hold them to be the pieces drawn.
//
// SHIP 20 (23 November 2026; the lane's relay v220, bridge v1.2). The list laid
// from is v1.2: v1.1's lines with STEP's «{…}+» tags read as STEP's key says
// (the number STEP names; roles again at 7 places, main tags at 43), each
// field it changed named with both values in its list of changes, and three
// fields more on every piece. B1 holds its bytes and its receipt, and that
// each of its lines, its added fields off and its changes set back, is v1.1's;
// B3 holds each zone's record to name v1.2's list and v1.1 as the list it
// extends; B6 reads the parts on v1.2's own lines. The places held for the
// «}+» tag are held so no longer: the pin names no such kind, and the 42 are
// counted under the holds of call 4 they stand under. The laws:
//
//   B1  the pin's files are the bytes it names, v1's, v1.1's and v1.2's, and
//       the lane's receipts name the lists the same, v1.1's reading v1's files
//       and v1.2's reading v1.1's as the pin names them; each line of v1.1,
//       its added fields taken off, is v1's line; each line of v1.2, its added
//       fields taken off and its changes set back, is v1.1's line; the list
//       recounts to the lane's own counts; every
//       kind of the list (its class, its use and what holds it within its
//       class) is named by the pin, laid or not, with the list's count; each
//       laid place's pieces are STEP's, in order, and spell our letters, and
//       each piece's part as v1.1 writes it is its row's column cut at the
//       stroke, the marks off it giving v1's English; at a place worded by
//       its form row, one form row of relay v202 is named for the place,
//       under its key, and its words cut at the stroke are the pieces'
//       parts as v1.1 writes them, byte for byte; and each reading the pin
//       names is the list's
//   B2  every laid place is found on its zone by its verse, its number
//       among the verse's words and the lattice's surface, a plain word
//       under the list's key, and carries exactly the list's pieces
//   B3  nothing else is written: each zone's record names v1.2's list, the
//       list it extends (v1.1) and its laid places as a recount gives them, and its
//       write is typed; a zone with no laid place carries no record; and
//       every place of the list the lattice gives no pieces that the pin
//       does not lay carries none, each place held within its class found
//       on its zone (the pairs, the places call 4 holds and the places where
//       call 4 makes STEP's reading stand; and STEP's «}+» places, none since
//       v1.2)
//   B4  in the record of the lines at rest, the line over every laid place
//       is its pieces in order as the page draws them with the signs at
//       rest, under that word alone, credited to the pieces' source; but
//       where STEP's own reading stands (the default picks' index marks the
//       place [n, words, 1]) it is STEP's own words, drawn so, credited to
//       STEP's reading, and those words drawn are the place's pieces drawn;
//       and each reading the pin names is recorded so
//   B6  the words as STEP writes them, by a road of its own: on every laid
//       place's zone word, each piece's words are its part of STEP's column
//       as v1.2's own line for the place writes it (v1.1's part, which v1.2
//       keeps), its ends trimmed where
//       the place is worded as written, byte for byte where its form row
//       words it; and the part with its square and angle brackets taken
//       out, its spaces closed and its ends trimmed, character by character,
//       is v1's English for the piece on v1's own line
//   B5  on the page as a first visit opens it, in each book the pin names a
//       reading of: the line under every laid place of the book is as B4
//       owes it; and the card opened on a named place stands on the place's
//       own division with its core block pressed, says the place's reading
//       above its pills as the line prints it, under the pieces' credit,
//       and presses the line's own piece for the block where a pill of the
//       block reads it, the block's first pill where none does
//       (core-block-rule-v1: a piece alone is the dictionaries')
//
// Run: node tools/check-spelling-bridge-v1.mjs [--zones data/zones] [--node]
//   --node   the laws that open no page (B1 to B4, and B6)
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PinFault } from "./pinned-v1.mjs";
import { zonesOnDisk } from "./zones-on-disk-v1.mjs";
import { printedForm, signsOff } from "./gloss-store-v1.mjs";
import { EXEMPTION_RULE_ID } from "./zone-post-build-v1.mjs";
import { linesOnPage, readRecord, RESTING_DIR } from "./resting-lines-v1.mjs";
import { readCards } from "./card-readings-v1.mjs";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { serveTree } from "./serve-tree-v1.mjs";
import {
  SPELLING_BRIDGE_RULE_ID, SPELLING_BRIDGE_HOME, SPELLING_BRIDGE_TOOL, PIECE_SOURCE, readBridge, receiptAgainst, v11Against, v12Against, heldOf, laidOf, findBridgePlace, carriedAt, namedReadings,
} from "./spelling-bridge-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (name, dflt = null) => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? process.argv[i + 1] : dflt; };
const ZONES = arg("zones", join(K3, "data", "zones"));
const NODE_ONLY = process.argv.includes("--node");
const PIN = join(K3, SPELLING_BRIDGE_HOME, "PIN.json");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const nf = (x) => Number(x).toLocaleString("en-US");
const first = (xs, k = 3) => xs.slice(0, k).join(" · ") + (xs.length > k ? ` · and ${xs.length - k} more` : "");
const gz = (path) => JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"));
// a place's pieces as the page draws its line with the signs at rest, and who it credits
const drawn = (place) => signsOff(printedForm(place.pieces.map((x) => String(x.g).trim()).join("/")));
const CREDIT = `PIECE:${PIECE_SOURCE.toUpperCase()}`;
// WHERE STEP'S OWN READING STANDS (steps-reading-stands-rule-v1; ship 17, 22 November 2026). The page asks the default
// source's layer before the place's pieces (zone.html, lineUnder), and at a place call 4 of relay v189 marks, STEP's own
// pick 1 is the line under STEP whatever today's line is (defaultAtWord), credited to STEP's reading. The default picks'
// index marks those places [n, words, 1], n the word's place counted over every entry of the zone, marks included, in
// section order (the page's WORD_N). Read on the page before and after the pieces were laid (ship 17's probe): there
// the line at rest keeps STEP's words and STEP's credit, and the card gains the place's reading above its pills.
const PICKS_INDEX = join(K3, "data", "default-picks", "index.json");
const picks = existsSync(PICKS_INDEX) ? JSON.parse(readFileSync(PICKS_INDEX, "utf8")) : null;
const STEP_CREDIT = ((((picks && picks.sources) || []).find((x) => x && x.id === "step") || {}).m || {}).r || null;
const standsIn = new Map();   // book -> Map(n -> STEP's words), where STEP's reading stands
const standsOf = (book) => {
  if (!standsIn.has(book)) standsIn.set(book, new Map(((((picks && picks.books) || {})[book] || {}).step_words || []).filter((r) => Array.isArray(r) && r[2] === 1).map((r) => [r[0], r[1]])));
  return standsIn.get(book);
};
const placeN = (zone, si, at) => { let n = 0; for (let i = 0; i < si; i += 1) n += ((zone.sections[i] || {}).words || []).length; return n + at + 1; };

console.log(`— ${SPELLING_BRIDGE_RULE_ID} —\n`);
if (!existsSync(PIN)) { console.log(`SKIPPED — no spelling bridge on this disk (${SPELLING_BRIDGE_HOME}/PIN.json)`); process.exit(3); }

// ---- B1: the pin, the receipt, the list -----------------------------------------------------------
let bridge = null, laid = [], counts = new Map();
{
  const faults = [];
  try { bridge = readBridge(PIN); } catch (e) { if (e instanceof PinFault) faults.push(e.message); else throw e; }
  if (bridge) {
    faults.push(...receiptAgainst(bridge));
    faults.push(...v11Against(bridge));
    faults.push(...v12Against(bridge));
    const got = laidOf(bridge);
    laid = got.laid; counts = got.counts;
    faults.push(...got.faults);
    // the list's own recount against the lane's counts
    const C = bridge.receipt.counts || {}, by = (f) => { const m = {}; for (const l of bridge.places) if (f(l) !== null && f(l) !== undefined) m[f(l)] = (m[f(l)] || 0) + 1; return m; };
    const same = (a, b) => JSON.stringify(Object.entries(a || {}).sort()) === JSON.stringify(Object.entries(b || {}).sort());
    const pieced = bridge.places.filter((l) => Array.isArray(l.pieces) && l.pieces.length);
    if (C.bridge_places !== bridge.places.length) faults.push(`the lane counts ${C.bridge_places} places and the list holds ${bridge.places.length}`);
    if (!same(C.by_class, by((l) => l.class))) faults.push("the lane's count by class is not the list's");
    if (!same(C.by_use, by((l) => l.use))) faults.push("the lane's count by use is not the list's");
    if (C.places_with_pieces !== pieced.length || C.pieces !== pieced.reduce((s, l) => s + l.pieces.length, 0)) faults.push(`the lane counts ${C.places_with_pieces} places with ${C.pieces} pieces, and the list holds ${pieced.length} with ${pieced.reduce((s, l) => s + l.pieces.length, 0)}`);
    if (C.form_rows !== bridge.landed.length || C.form_rows_not_landed !== bridge.notLanded.length) faults.push("the lane's count of form rows, landed or not, is not the files'");
  }
  const by = (xs, f) => { const m = new Map(); for (const x of xs) m.set(f(x), (m.get(f(x)) || 0) + 1); return [...m].map(([k, v]) => `${k} ${nf(v)}`).join(", "); };
  const rowWorded = laid.filter((p) => p.worded === "form_row"), rowPieces = rowWorded.flatMap((p) => p.pieces);
  const heldBy = (l) => heldOf(l, bridge.call4);
  const held = bridge ? (bridge.places12 || []).filter(heldBy) : [];
  check("B1  the pin's files are the bytes it names, v1's, v1.1's and v1.2's, and the lane's receipts name the lists the same; each line of v1.1, its added fields off, is v1's line; each line of v1.2, its added fields off and its changes set back, is v1.1's line; the list recounts to the lane's own counts; every kind is named by the pin, laid or not, with the list's count; each laid place's pieces are STEP's and spell our letters, each piece's part as v1.1 writes it is its row's column cut at the stroke and the marks off it give v1's English; a place worded by its form row has one, whose parts are the parts as v1.1 writes them byte for byte; each named reading is the list's",
    !!bridge && faults.length === 0,
    faults.length ? `${faults.length} · ${first(faults)}` : `relays ${bridge.pin.relay}, ${bridge.pin.v1_1.relay} and ${bridge.pin.v1_2.relay} · list v1.2 ${bridge.pin.v1_2.places.sha256.slice(0, 12)} (${nf(bridge.changes12.reduce((a, c) => a + c.changes.length, 0))} fields changed at ${nf(bridge.changes12.length)} places), extending v1.1 ${bridge.pin.v1_1.places.sha256.slice(0, 12)} and v1 ${bridge.pin.places.sha256.slice(0, 12)} · ${nf(bridge.places12.length)} places in ${counts.size} kinds · ${nf(laid.length)} laid (${nf(laid.reduce((s, p) => s + p.pieces.length, 0))} pieces; by class ${by(laid, (p) => p.cls)}; worded ${by(laid, (p) => p.worded)}; ${laid.filter((p) => /[\[<]/u.test(p.words)).length} whose words carry a bracket of STEP's) · held within a class: ${by(held, heldBy)} (call 4's hold read from ${bridge.call4.file} ${bridge.call4.sha256.slice(0, 12)}, ${bridge.call4.holding ? `${nf(bridge.call4.places.size)} places it holds` : "its landing holds nothing now"}, ${bridge.call4.landing_stands ? `${nf(bridge.call4.stands.size)} where STEP's reading stands` : "its landing makes none stand now"}) · at the ${nf(rowWorded.length)} worded by their form rows each part is v1.1's byte for byte (${nf(rowPieces.length)} pieces, ${nf(rowPieces.filter((q) => q.g !== q.g.trim()).length)} keeping STEP's space at an end, which the page trims) · ${namedReadings(bridge.pin).length} readings named`);
}
if (!bridge) { console.log(`\n${bad} FAILED`); process.exit(1); }

// ---- the places on their zones --------------------------------------------------------------------
const zoneOf = new Map();
const readZone = (book) => { if (!zoneOf.has(book)) zoneOf.set(book, existsSync(join(ZONES, `${book}.bin`)) ? gz(join(ZONES, `${book}.bin`)) : null); return zoneOf.get(book); };
const at = [];   // { place, found } for each laid place found
const saidOf = (p) => `${p.book} ${p.place}`;

// ---- B2: each laid place carries the list's pieces --------------------------------------------------
{
  const faults = [];
  for (const place of laid) {
    const zone = readZone(place.book);
    const found = zone ? findBridgePlace(zone, place) : { fault: "no zone on disk" };
    if (found.fault) { faults.push(`${saidOf(place)}: ${found.fault}`); continue; }
    at.push({ place, found });
    const carried = carriedAt(found.word, place);
    if (carried !== "the list's") faults.push(`${saidOf(place)}: the word carries ${carried === "none" ? "no pieces" : `other pieces (${JSON.stringify(found.word.pg)})`}`);
  }
  check("B2  every laid place is found on its zone by its verse, its number among the verse's words and the lattice's surface, a plain word under the list's key, and carries exactly the list's pieces",
    faults.length === 0 && at.length === laid.length,
    faults.length ? `${faults.length} · ${first(faults)}` : `${nf(at.length)} places on ${zoneOf.size} zones, ${nf(at.reduce((s, x) => s + x.place.pieces.length, 0))} pieces`);
}

// ---- B3: nothing else is written --------------------------------------------------------------------
{
  const faults = [];
  let records = 0, without = 0, unlaid = 0;
  const byBook = new Map();
  for (const x of at) (byBook.get(x.place.book) || byBook.set(x.place.book, []).get(x.place.book)).push(x);
  for (const book of zonesOnDisk(ZONES)) {
    const zone = readZone(book);
    const ef = (zone && zone.emitted_from) || {}, rec = ef.spelling_bridge, here = byBook.get(book) || [];
    const pb = ef.post_build || {};
    const typed = pb.rule_id === EXEMPTION_RULE_ID && String(pb.by || "").includes(SPELLING_BRIDGE_TOOL) && ["emitted_from.spelling_bridge", "sections[].words[].pg"].every((f) => String((pb.by_field || {})[f] || "").includes(SPELLING_BRIDGE_TOOL));
    if (!here.length) {
      if (rec) faults.push(`${book}: carries a record of the bridge and no laid place`);
      else if (String(pb.by || "").includes(SPELLING_BRIDGE_TOOL)) faults.push(`${book}: a write by the bridge's tool is typed on a zone with no laid place`);
      else without += 1;
      continue;
    }
    const want = { places_laid: here.length, pieces: here.reduce((s, x) => s + x.place.pieces.length, 0) };
    const hereWant = here.map((x) => ({ ref: x.place.ref, section_word: x.found.at, word: x.place.n, reads: x.place.words }));
    if (!rec) { faults.push(`${book}: ${here.length} laid place(s) and no record`); continue; }
    if (rec.rule_id !== SPELLING_BRIDGE_RULE_ID || rec.applied_by !== SPELLING_BRIDGE_TOOL || rec.relay !== bridge.pin.v1_2.relay || (rec.list || {}).sha256 !== bridge.pin.v1_2.places.sha256 || (rec.list || {}).lines !== bridge.pin.v1_2.places.lines || (rec.extends || {}).sha256 !== bridge.pin.v1_1.places.sha256)
      faults.push(`${book}: its record does not name the rule, the tool, the relay, the list or the list it extends as the pin does`);
    else if (JSON.stringify(rec.counts) !== JSON.stringify(want) || JSON.stringify(rec.here) !== JSON.stringify(hereWant)) faults.push(`${book}: its record counts ${JSON.stringify(rec.counts)}, and a recount gives ${JSON.stringify(want)}, or its places are not the recount's`);
    else if (!typed) faults.push(`${book}: its write is not typed on the zone`);
    else records += 1;
  }
  // a place the lattice gives no pieces and the pin does not lay: found the same way, it carries none; a place held within
  // its class (heldOf: the pairs, the places call 4 holds, the places where STEP's reading stands) is found, or it is a
  // fault, since whether it carries any could not be said
  const laidIds = new Set(laid.map(saidOf));
  const heldSeen = new Map();
  for (const l of bridge.places12) {
    if (l.use !== "NEW_PIECES" || laidIds.has(`${l.book} ${l.place}`)) continue;
    const why = heldOf(l, bridge.call4);
    const zone = readZone(l.book), m = /^(\d+):(\d+):(\d+)$/u.exec(String(l.place));
    const sec = zone && m ? (zone.sections || []).find((s) => s.label === l.ref) : null;
    const word = sec ? (sec.words || []).filter((w) => !w.mark)[Number(m[3]) - 1] : null;
    if (!word || word.s !== (l.lattice_v12 || {}).surface) { if (why) faults.push(`${l.book} ${l.place} (held: ${why}): not found on its zone by its verse, its word number and the lattice's surface`); continue; }
    unlaid += 1;
    if (why) heldSeen.set(why, (heldSeen.get(why) || 0) + 1);
    if (word.pg !== undefined) faults.push(`${l.book} ${l.place} (${l.class}${why ? `, held: ${why}` : ""}): the pin does not lay it, and the word carries pieces`);
  }
  check("B3  nothing else is written: each zone's record names v1.2's list, the list it extends (v1.1) and its laid places as a recount gives them, and its write is typed; a zone with no laid place carries no record; and every place of the list the lattice gives no pieces that the pin does not lay carries none, each place held within its class found on its zone",
    faults.length === 0 && records === byBook.size,
    faults.length ? `${faults.length} · ${first(faults)}` : `${records} zones' records recount · ${without} zones on disk with no laid place carry none · ${nf(unlaid)} places the pin does not lay carry no pieces${heldSeen.size ? ` (held within their class: ${[...heldSeen].map(([k, v]) => `${nf(v)} ${k}`).join(", ")})` : ""}`);
}

// ---- B4: the record of the lines at rest ------------------------------------------------------------
const NAMED = namedReadings(bridge.pin);
// the line owed at rest over a laid place: STEP's own words, drawn, under STEP's credit, where its reading stands there;
// the place's pieces drawn under the pieces' credit elsewhere (WHERE STEP'S OWN READING STANDS, above)
const owedAtRest = (x) => {
  const pieces = drawn(x.place), w = standsOf(x.place.book).get(placeN(readZone(x.place.book), x.found.si, x.found.at));
  return w === undefined ? { text: pieces, credit: CREDIT, stands: false, pieces } : { text: signsOff(printedForm(w)), credit: STEP_CREDIT, stands: true, pieces };
};
{
  const faults = [], named = [];
  let lines = 0, standing = 0;
  const recOf = new Map();
  for (const x of at) {
    const book = x.place.book;
    if (!recOf.has(book)) recOf.set(book, readRecord(join(K3, RESTING_DIR, `${book}.json.gz`)));
    const rec = recOf.get(book);
    if (!rec) { faults.push(`${book}: no record of its lines at rest`); continue; }
    const sec = (rec.sections || []).find((s) => s[0] === x.place.ref);
    const unit = sec ? (sec[1] || []).find((u) => u[0] <= x.found.at && x.found.at < u[0] + Math.max(1, u[1])) || null : null;
    const want = owedAtRest(x);
    if (want.stands && want.text !== want.pieces) { faults.push(`${saidOf(x.place)}: STEP's reading stands here, and its words drawn «${want.text}» are not the place's pieces drawn «${want.pieces}»`); continue; }
    if (!unit || unit[1] !== 1 || unit[2] !== want.text || unit[3] !== want.credit) { faults.push(`${saidOf(x.place)}: the record's line reads ${unit ? `«${unit[2]}» (${unit[3] || "no credit"}) under ${unit[1]} word(s)` : "nothing"}, and ${want.stands ? "STEP's reading, which stands here, reads" : "its pieces read"} «${want.text}» (${want.credit})`); continue; }
    lines += 1;
    if (want.stands) standing += 1;
    if (NAMED.some((r) => r.book === book && r.place === x.place.place)) named.push(`${(readZone(book) || {}).work || book} ${x.place.ref} «${unit[2]}»`);
  }
  check("B4  in the record of the lines at rest, the line over every laid place is its pieces in order as the page draws them with the signs at rest, under that word alone, credited to the pieces' source, or, where STEP's own reading stands, STEP's words credited to STEP's reading, which are the pieces drawn; and each reading the pin names is recorded so",
    faults.length === 0 && lines === laid.length && named.length === NAMED.length,
    faults.length ? `${faults.length} · ${first(faults, 4)}` : `${nf(lines)} lines are their place's pieces (${nf(lines - standing)} credited ${CREDIT}; ${nf(standing)} where STEP's reading stands, its words the pieces', credited ${STEP_CREDIT}) · ${named.join(" · ")}`);
}

// ---- B6: the words as STEP writes them, by a road of its own ----------------------------------------
{
  const faults = [];
  const v1At = new Map(bridge.places.map((l) => [`${l.book} ${l.place}`, l]));
  // v1.2's own line for the place (each piece's part as STEP writes it is v1.1's, which v1.2 keeps: B1)
  const v11At = new Map(bridge.places12.map((l) => [`${l.book} ${l.place}`, l]));
  // the marks taken off a part, character by character: every square and angle bracket out, every run of white space
  // one space, none at the ends (the lane's v1.1 RULE, section 2)
  const marksOff = (t) => { let o = "", gap = false; for (const c of String(t)) { if (c === "[" || c === "]" || c === "<" || c === ">") continue; if (/\s/u.test(c)) { gap = true; continue; } if (gap && o) o += " "; gap = false; o += c; } return o; };
  let pieces = 0, trimmed = 0, kept = 0;
  for (const x of at) {
    const l = v11At.get(saidOf(x.place)), l1 = v1At.get(saidOf(x.place));
    const pg = Array.isArray(x.found.word.pg) ? x.found.word.pg : [], ps = l && Array.isArray(l.pieces) ? l.pieces : [];
    if (!l || !l1 || pg.length !== ps.length) { faults.push(`${saidOf(x.place)}: the zone word carries ${pg.length} piece(s), and v1.2's line for the place ${l ? ps.length : "is not found"}`); continue; }
    for (const [i, q] of ps.entries()) {
      const part = String(q.english_tahot_as_written), g = String((pg[i] || {}).g), owed = x.place.worded === "form_row" ? part : part.trim();
      const v1 = String((((l1.pieces || [])[i]) || {}).english_tahot);
      if (g !== owed) faults.push(`${saidOf(x.place)} piece ${i + 1}: the zone carries «${g}», and its part as STEP writes it is «${part}»${x.place.worded === "form_row" ? "" : ", owed with its ends trimmed"}`);
      else if (marksOff(part) !== v1) faults.push(`${saidOf(x.place)} piece ${i + 1}: «${part}» with the marks off is «${marksOff(part)}», and v1's English is «${v1}»`);
      else { pieces += 1; if (x.place.worded === "form_row") kept += 1; else trimmed += 1; }
    }
  }
  check("B6  the words as STEP writes them, by a road of its own: on every laid place's zone word each piece's words are its part of STEP's column as v1.2's line writes it, its ends trimmed where the place is worded as written, byte for byte where its form row words it; and the part, the marks off, is v1's English for the piece",
    faults.length === 0 && at.length === laid.length,
    faults.length ? `${faults.length} · ${first(faults, 4)}` : `${nf(pieces)} pieces at ${nf(at.length)} places: ${nf(trimmed)} their part with its ends trimmed, ${nf(kept)} their part byte for byte (worded by their form rows), every part with the marks off v1's English`);
}

// ---- B5: the page -----------------------------------------------------------------------------------
if (NODE_ONLY) { console.log(bad ? `\n${bad} FAILED` : "\nall checks passed (the laws that open no page)"); process.exit(bad ? 1 : 0); }
{
  const faults = [], read = { lines: 0, cards: [] };
  const books = [...new Set(NAMED.map((r) => r.book))];
  const tree = await serveTree(K3);
  const pw = await loadPlaywright();
  const browser = await pw.chromium.launch(launchOptions());
  try {
    for (const book of books) {
      const list = at.filter((x) => x.place.book === book);
      // the lines first, as the page rests: nothing pressed
      const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
      try {
        const p = await ctx.newPage();
        const errors = [];
        p.on("pageerror", (e) => errors.push(String(e && e.message)));
        await p.goto(`${tree.base}/zone.html?b=${book}`, { waitUntil: "networkidle" });
        const drew = await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 }).then(() => true, () => false);
        if (!drew) { faults.push(`${book}: the page drew no word within a minute${errors.length ? ` (it threw: ${errors[0]})` : ""}`); continue; }
        for (const x of list) {
          let got = null;
          try { got = await linesOnPage(p, { from: x.found.si, to: x.found.si + 1 }); } catch (e) { faults.push(`${saidOf(x.place)}: ${String(e.message || e).split("\n")[0].slice(0, 140)}`); continue; }
          if (got.state.pointing !== "only" || got.state.defaults !== "step") { faults.push(`${saidOf(x.place)}: the page does not rest as a first visit (${JSON.stringify(got.state)})`); continue; }
          const unit = (got.sections[0].units || []).find((u) => u[0] <= x.found.at && x.found.at < u[0] + Math.max(1, u[1])) || null;
          const want = owedAtRest(x);
          if (want.stands && want.text !== want.pieces) { faults.push(`${saidOf(x.place)}: STEP's reading stands here, and its words drawn «${want.text}» are not the place's pieces drawn «${want.pieces}»`); continue; }
          if (!unit || unit[1] !== 1 || unit[2] !== want.text || unit[3] !== want.credit) { faults.push(`${saidOf(x.place)}: the line reads ${unit ? `«${unit[2]}» (${unit[3] || "no credit"})` : "nothing"}, and ${want.stands ? "STEP's reading, which stands here, reads" : "its pieces read"} «${want.text}» (${want.credit})`); continue; }
          read.lines += 1;
          if (want.stands) read.standing = (read.standing || 0) + 1;
        }
        if (errors.length) faults.push(`${book}: the page threw: ${errors[0]}`);
      } finally { await ctx.close(); }
      // then the card of each named place, opened by a press on its word. A
      // card of a place the line reads in pieces opens on the place's own
      // division with its core block pressed (core-block-rule-v1, the owner,
      // 14 November 2026): the place's reading is said above the pills, whole,
      // as what the pieces' source reads here, and the pills are the block's
      // own, the dictionaries'. So the pill pressed is the line's own piece
      // for the block where a pill of the block reads it, and the block's
      // first pill where none does (I Samuel 26:7: no dictionary reads the
      // block as STEP's piece does)
      for (const r of NAMED.filter((e) => e.book === book)) {
        const x = list.find((y) => y.place.place === r.place);
        if (!x) { faults.push(`${book} ${r.place}: the named place is not laid`); continue; }
        let cards = null;
        try { cards = await readCards(browser, tree.base, book, "rest", { from: x.found.si, to: x.found.si + 1 }); } catch (e) { faults.push(`${book} ${r.place}: ${String(e.message || e).split("\n")[0].slice(0, 160)}`); continue; }
        const card = ((cards.sections[0] || {}).cards || []).find((c) => c.e === x.found.at);
        if (!card) { faults.push(`${book} ${r.place}: no card was read for the word`); continue; }
        const want = drawn(x.place), pcs = x.place.pieces, parts = want.split(" + ");
        const core = pcs.reduce((a, q, i) => (q.r === "core" ? (a === -1 ? i : -2) : a), -1);
        if (core < 0 || parts.length !== pcs.length) { faults.push(`${book} ${r.place}: ${core === -1 ? "none of its pieces is the core piece" : core === -2 ? "more than one of its pieces is the core piece" : `its line «${want}» does not part as its ${pcs.length} pieces do`}, and the block its card opens on cannot be told`); continue; }
        const cut = card.divisions && card.divisions.on.length === 1 ? card.divisions.of[card.divisions.on[0]] : null;
        const block = card.blocks && card.blocks.on.length === 1 ? card.blocks.on[0] : -1;
        const said = (card.here || []).filter((h) => h[0] === "here");
        const pills = card.pills || [], pressed = pills.filter((q) => q[3] === 1);
        const fold = (t) => String(t).toLowerCase();
        const own = pills.find((q) => fold(q[0]) === fold(parts[core])) || null;
        const owed = own || pills[0] || null;
        if (cut !== pcs.map((q) => q.k).join(" + ") || block !== core || ((card.blocks || {}).of || [])[core] !== pcs[core].k) faults.push(`${book} ${r.place}: the card opens on ${cut ? `the division ${cut}` : "no one division"}${block >= 0 ? `, block ${block + 1}` : ", no one block pressed"}, and the place's pieces are ${pcs.map((q) => q.k).join(" + ")}, the core piece the ${core + 1}${["st", "nd", "rd"][core] || "th"}`);
        else if (said.length !== 1 || said[0][1] !== want || said[0][2] !== CREDIT) faults.push(`${book} ${r.place}: above its pills the card says ${said.map((h) => `«${h[1]}» (${h[2] || "no credit"})`).join(" and ") || "no reading of the place"}, and the line reads «${want}» (${CREDIT})`);
        else if (owed ? pressed.length !== 1 || pressed[0] !== owed : pressed.length !== 0) faults.push(`${book} ${r.place}: the card stands on ${pressed.map((q) => `«${q[0]}»`).join(" ") || "no reading"}, and ${own ? `a pill of the block reads the line's own piece «${parts[core]}»` : owed ? `the block's first pill is «${owed[0]}», no pill of it reading the line's piece «${parts[core]}»` : "the block has no pill"}`);
        else read.cards.push(`${(readZone(book) || {}).work || book} ${x.place.ref} «${want}» said above, ${own ? `the line's piece «${own[0]}» pressed` : owed ? `the block's first «${owed[0]}» pressed, no dictionary reading the block «${parts[core]}»` : "the block without a pill"}`);
      }
    }
  } finally { await browser.close(); await tree.close(); }
  const due = at.filter((x) => books.includes(x.place.book)).length;
  check("B5  on the page as a first visit opens it, in each book the pin names a reading of: the line under every laid place of the book is as B4 owes it, and the card opened on a named place stands on the place's own division with its core block pressed, says the place's reading above its pills, and presses the line's own piece where a pill of the block reads it, the block's first where none does",
    faults.length === 0 && read.lines === due && read.cards.length === NAMED.length,
    faults.length ? `${faults.length} · ${first(faults, 4)}` : `${read.lines} lines in ${books.length} books are their place's pieces (${read.standing || 0} of them STEP's reading, which stands there) · the cards: ${read.cards.join(" · ")}`);
}

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
