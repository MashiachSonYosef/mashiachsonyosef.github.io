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
// once, in tools/spelling-bridge-v1.mjs, and judged by it here. The laws:
//
//   B1  the pin's files are the bytes it names, and the lane's receipt
//       names the three lists the same; the list recounts to the lane's own
//       counts; every class of the list is named by the pin, laid or not,
//       with the list's count; each laid place's pieces are STEP's, in
//       order, and spell our letters; one form row of the relay is named
//       for the place, under its key, and its words cut at the stroke are
//       the pieces' English, the brackets aside; and each reading the pin
//       names is the list's
//   B2  every laid place is found on its zone by its verse, its number
//       among the verse's words and the lattice's surface, a plain word
//       under the list's key, and carries exactly the list's pieces
//   B3  nothing else is written: each zone's record names the list and its
//       laid places as a recount gives them, and its write is typed; a zone
//       with no laid place carries no record; and a place of the list the
//       lattice gives no pieces that the pin does not lay carries none
//   B4  in the record of the lines at rest, the line over every laid place
//       is its pieces in order as the page draws them with the signs at
//       rest, under that word alone, credited to the pieces' source; and
//       each reading the pin names is recorded so
//   B5  on the page as a first visit opens it, in each book the pin names a
//       reading of: the line under every laid place of the book is its
//       pieces; and the card opened on a named place stands on the place's
//       own division with its core block pressed, says the place's reading
//       above its pills as the line prints it, under the pieces' credit,
//       and presses the line's own piece for the block where a pill of the
//       block reads it, the block's first pill where none does
//       (core-block-rule-v1: a piece alone is the dictionaries')
//
// Run: node tools/check-spelling-bridge-v1.mjs [--zones data/zones] [--node]
//   --node   the laws that open no page (B1 to B4)
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
  SPELLING_BRIDGE_RULE_ID, SPELLING_BRIDGE_HOME, SPELLING_BRIDGE_TOOL, PIECE_SOURCE, readBridge, receiptAgainst, laidOf, findBridgePlace, carriedAt, namedReadings,
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

console.log(`— ${SPELLING_BRIDGE_RULE_ID} —\n`);
if (!existsSync(PIN)) { console.log(`SKIPPED — no spelling bridge on this disk (${SPELLING_BRIDGE_HOME}/PIN.json)`); process.exit(3); }

// ---- B1: the pin, the receipt, the list -----------------------------------------------------------
let bridge = null, laid = [], counts = new Map();
{
  const faults = [];
  try { bridge = readBridge(PIN); } catch (e) { if (e instanceof PinFault) faults.push(e.message); else throw e; }
  if (bridge) {
    faults.push(...receiptAgainst(bridge));
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
  check("B1  the pin's files are the bytes it names and the lane's receipt names the three lists the same; the list recounts to the lane's own counts; every class is named by the pin, laid or not, with the list's count; each laid place's pieces are STEP's and spell our letters, one form row is named for it, and its words cut at the stroke are the pieces' English, the brackets aside; each named reading is the list's",
    !!bridge && faults.length === 0,
    faults.length ? `${faults.length} · ${first(faults)}` : `relay ${bridge.pin.relay} · list ${bridge.pin.places.sha256.slice(0, 12)} · ${nf(bridge.places.length)} places in ${counts.size} classes · ${nf(laid.length)} laid (${nf(laid.reduce((s, p) => s + p.pieces.length, 0))} pieces; ${laid.filter((p) => /[\[<]/u.test(p.words)).length} whose words carry a bracket of STEP's) · ${namedReadings(bridge.pin).length} readings named`);
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
    if (rec.rule_id !== SPELLING_BRIDGE_RULE_ID || rec.applied_by !== SPELLING_BRIDGE_TOOL || rec.relay !== bridge.pin.relay || (rec.list || {}).sha256 !== bridge.pin.places.sha256 || (rec.list || {}).lines !== bridge.pin.places.lines)
      faults.push(`${book}: its record does not name the rule, the tool, the relay or the list as the pin does`);
    else if (JSON.stringify(rec.counts) !== JSON.stringify(want) || JSON.stringify(rec.here) !== JSON.stringify(hereWant)) faults.push(`${book}: its record counts ${JSON.stringify(rec.counts)}, and a recount gives ${JSON.stringify(want)}, or its places are not the recount's`);
    else if (!typed) faults.push(`${book}: its write is not typed on the zone`);
    else records += 1;
  }
  // a place the lattice gives no pieces and the pin does not lay: found the same way where it is a plain word, it carries none
  const laidIds = new Set(laid.map(saidOf));
  for (const l of bridge.places) {
    if (l.use !== "NEW_PIECES" || laidIds.has(`${l.book} ${l.place}`)) continue;
    const zone = readZone(l.book), m = /^(\d+):(\d+):(\d+)$/u.exec(String(l.place));
    if (!zone || !m) continue;
    const sec = (zone.sections || []).find((s) => s.label === l.ref);
    const word = sec ? (sec.words || []).filter((w) => !w.mark)[Number(m[3]) - 1] : null;
    if (!word || word.s !== (l.lattice_v12 || {}).surface) continue;
    unlaid += 1;
    if (word.pg !== undefined) faults.push(`${l.book} ${l.place} (${l.class}): the pin does not lay it, and the word carries pieces`);
  }
  check("B3  nothing else is written: each zone's record names the list and its laid places as a recount gives them, and its write is typed; a zone with no laid place carries no record; and a place of the list the lattice gives no pieces that the pin does not lay carries none",
    faults.length === 0 && records === byBook.size,
    faults.length ? `${faults.length} · ${first(faults)}` : `${records} zones' records recount · ${without} zones on disk with no laid place carry none · ${nf(unlaid)} places the pin does not lay carry no pieces`);
}

// ---- B4: the record of the lines at rest ------------------------------------------------------------
const NAMED = namedReadings(bridge.pin);
{
  const faults = [], named = [];
  let lines = 0;
  const recOf = new Map();
  for (const x of at) {
    const book = x.place.book;
    if (!recOf.has(book)) recOf.set(book, readRecord(join(K3, RESTING_DIR, `${book}.json.gz`)));
    const rec = recOf.get(book);
    if (!rec) { faults.push(`${book}: no record of its lines at rest`); continue; }
    const sec = (rec.sections || []).find((s) => s[0] === x.place.ref);
    const unit = sec ? (sec[1] || []).find((u) => u[0] <= x.found.at && x.found.at < u[0] + Math.max(1, u[1])) || null : null;
    const want = drawn(x.place);
    if (!unit || unit[1] !== 1 || unit[2] !== want || unit[3] !== CREDIT) { faults.push(`${saidOf(x.place)}: the record's line reads ${unit ? `«${unit[2]}» (${unit[3] || "no credit"}) under ${unit[1]} word(s)` : "nothing"}, and its pieces read «${want}» (${CREDIT})`); continue; }
    lines += 1;
    if (NAMED.some((r) => r.book === book && r.place === x.place.place)) named.push(`${(readZone(book) || {}).work || book} ${x.place.ref} «${unit[2]}»`);
  }
  check("B4  in the record of the lines at rest, the line over every laid place is its pieces in order as the page draws them with the signs at rest, under that word alone, credited to the pieces' source; and each reading the pin names is recorded so",
    faults.length === 0 && lines === laid.length && named.length === NAMED.length,
    faults.length ? `${faults.length} · ${first(faults, 4)}` : `${nf(lines)} lines are their place's pieces (${CREDIT}) · ${named.join(" · ")}`);
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
          const want = drawn(x.place);
          if (!unit || unit[1] !== 1 || unit[2] !== want || unit[3] !== CREDIT) { faults.push(`${saidOf(x.place)}: the line reads ${unit ? `«${unit[2]}» (${unit[3] || "no credit"})` : "nothing"}, and its pieces read «${want}» (${CREDIT})`); continue; }
          read.lines += 1;
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
  check("B5  on the page as a first visit opens it, in each book the pin names a reading of: the line under every laid place of the book is its pieces, and the card opened on a named place stands on the place's own division with its core block pressed, says the place's reading above its pills, and presses the line's own piece where a pill of the block reads it, the block's first where none does",
    faults.length === 0 && read.lines === due && read.cards.length === NAMED.length,
    faults.length ? `${faults.length} · ${first(faults, 4)}` : `${read.lines} lines in ${books.length} books are their place's pieces · the cards: ${read.cards.join(" · ")}`);
}

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
