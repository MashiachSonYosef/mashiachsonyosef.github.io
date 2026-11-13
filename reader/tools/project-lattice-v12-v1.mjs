#!/usr/bin/env node
// Synthesis lane · lattice-projection-rule-v1-the-lattice-is-projected-over-a-zones-own-positions-and-never-replaces-the-store
// LEDGER: R D
// R because every order this tool projects is a SELECTION over readings the
// store already holds — masoretic, vowels differ, cites here, licence,
// names as sound — and rule 1 above is that it adds, removes and reorders
// nothing in the store itself. D because the parts band carries a named
// source's English for a COMPcell, two witnesses per piece, carried and
// never composed into a reading of the word. It creates no M and no S; it
// carries the ones the card it grades already names.
//
// THE LATTICE (r2:mishkan/moses-ledgers/lattice-v12/, the corpus lane's
// megacompspan lattice ledger, candidate-only) grades every card of every
// position of the 39 canonical books against the word as the text points
// it, and — since v12 — carries on every card its declared corpus, licence
// class, year and whether it is a transliteration; and on every ON position
// the headword stack under THE RULE of lemma-sort v3, the affix pieces, and
// whether the Leningrad codex spells the word differently.
//
// This tool follows the toggle pipeline (tools/TOGGLE-PIPELINE-v1.md): it
// reads ONE zone and that book's lattice files, joins on the zone's own
// positions, and writes (a) the zone again with three small per-word fields
// and a typed receipt, and (b) a sidecar, <slug>.lattice.bin, that the card
// fetches only when a reader chooses an order the lattice can answer.
//
// The rule, declared before output:
//   1. The store stays the store. Nothing here adds, removes or reorders a
//      reading of the catalog. The lattice's cards are joined to the store's
//      rows by fingerprint (text | source), and a card the store does not
//      hold is counted, never shown; a row the lattice did not grade sorts
//      after the graded ones under every lattice order, never dropped.
//   2. The join is by position, verse by verse, in order, proved by the key:
//      the n-th ON word of a verse in the zone is the n-th ON position of
//      that verse in the lattice, and its key must equal the zone's — a
//      verse that does not prove is held whole and counted.
//   3. On the word:
//        hg  the headword's first reading under lemma-sort v3 (vowel tier,
//            then witness score, then file order) — only where the word
//            carries the headword (h, from the headword projection), the
//            lattice's lemma is that same key, and the stack is in routes;
//        hm  that reading's source and year, so its chip can say who;
//        ld  where the Leningrad codex differs: the kind and its letters.
//        tg  the tag of the word's core piece, as the lattice writes it:
//            the entry TAHOT reads at this place (entry-gate-rule-v1). At a
//            place written one way and read another it rides on the half
//            whose letters the pieces spell; a place whose pieces spell
//            neither, or whose core carries no tag, carries none.
//        np  1 where the place is a name: the corpus lane's list of name
//            places (data/names/, relay v177: TAHOT's grammar or MACULA's
//            type says so), by the verse and the word's number in it as
//            the card's head counts it (names-gate-rule-v1). A tree that
//            holds no list marks none, and its receipt says so.
//   4. In the sidecar, per key the lattice's card fingerprints in the
//      lattice's own order with the transliteration flags, and per pointed
//      surface the tier of each card (m vowel match · n normalized · x vowel
//      mismatch) and which cards cite this verse. Keyed by the pointed
//      surface, because the grade is a fact about the pointing and repeats
//      wherever the pointing does. THE CITATIONS DO NOT: which cards name a
//      verse is a fact about the verse. The record carries the list of the
//      surface's first verse in the book (n, and its leader o.c), and for
//      every other verse of that surface whose list differs, that verse's
//      own list and leader (v[<verse label>] = { n, c }). A verse not named
//      there reads the first verse's, which is then also its own.
//   5. THE PARTS OF A WORD NOBODY DEFINES. v12 carries, per position, the
//      word's own pieces — prefix, core, suffix — each with its role and with
//      an English from TAHOT and from MACULA. They are taken for ONE case and
//      counted for the rest: a word the catalog answers nothing for.
//
//      The frame's ruling stands and is not touched: "a word with no
//      admissible definition sits at its place with no key, in quote form: a
//      finding, not an error" (serving-rulings-v1, m-is-the-fortress). So the
//      LINE never changes — a bare word stays bare, because a definition
//      composed here out of pieces would be this lane supplying the displayed
//      answer for a key no source answered, which is the folded edge rule 5
//      and rule 9 of the frame forbid. What the CARD may do is show the
//      reader what the two witnesses say about each PIECE, as pieces, named
//      and licensed. That is not a definition of the word; it is the reason
//      the word has none, made legible.
//
//      1,642 words on the 39 books have no English under their form, and 134
//      of those have none under their headword either. 96 of the 134 have
//      pieces the lattice can name; 92 of the 96 have both witnesses on every
//      piece. The other 38 carry nothing and are counted as carrying nothing.
//
//      The witnesses differ at 205,953 of 466,981 pieces — TAHOT gives the
//      English this position reads, MACULA the headword's — so BOTH ride and
//      neither is chosen. The maqaf toggle is a different question and still
//      waits on the welded-form ruling; nothing here touches it.
//
// Run: node tools/project-lattice-v12-v1.mjs --zone data/zones/genesis.bin
//        --lattice <dir with positions-<book>-v12.jsonl.gz, routes-<book>-v12.jsonl.gz, lattice-<book>-v12.json>
//        --stamp YYYY-MM-DD --out build/lattice/genesis.bin [--sidecar data/zones/genesis.lattice.bin]
import { readFileSync, writeFileSync, createReadStream, statSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { gzipSync, gunzipSync, createGunzip } from "node:zlib";
import { createInterface } from "node:readline";
import { join } from "node:path";

import { LATTICE_RULE_ID, SIDECAR_SCHEMA, fnv1a } from "./lattice-lib-v1.mjs";
import { openRouteStore, factsOf } from "./gloss-store-v1.mjs";
import { gradeRow, POINTING_GRADE_RULE_ID } from "./pointing-grade-v1.mjs";
import { isOtherStem, stemsOfPlaceLine, STEM_FAMILY_RULE_ID } from "./stem-family-v1.mjs";
import { readStemsExtension, stemsId, STEMS_EXTENSION_RULE_ID, STEMS_EXTENSION_HOME } from "./stems-extension-v1.mjs";
import { ENTRY_GATE_RULE_ID, placeEntry, bdbEntriesAt, entryVerdict } from "./entry-gate-v1.mjs";
import { NAMES_GATE_RULE_ID, nameWithheld } from "./names-gate-v1.mjs";
import { leadersKey, PLACE_IS_A_NAME } from "./place-leaders-v1.mjs";
import { readPinnedLines } from "./pinned-v1.mjs";
import { typePostBuildWrite, writeZone } from "./zone-post-build-v1.mjs";
export { LATTICE_RULE_ID, SIDECAR_SCHEMA, fnv1a };
const GRADE_CHAR = { VOWEL_MATCH: "m", NORMALIZED: "n", VOWEL_MISMATCH: "x" };

const arg = (f, d = null) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d; };
const zonePath = arg("--zone"), latticeDir = arg("--lattice"), outPath = arg("--out"), stamp = arg("--stamp");
for (const [f, v] of [["--zone", zonePath], ["--lattice", latticeDir], ["--out", outPath], ["--stamp", stamp]])
  if (!v) { console.error(`missing ${f}`); process.exit(2); }

const zone = JSON.parse(gunzipSync(readFileSync(zonePath)).toString("utf8"));
const slug = zonePath.split("/").pop().replace(/\.bin$/u, "");
const sidecarPath = arg("--sidecar", join(zonePath.replace(/[^/]+$/u, ""), `${slug}.lattice.bin`));
const files = {
  positions: join(latticeDir, `positions-${slug}-v12.jsonl.gz`),
  routes: join(latticeDir, `routes-${slug}-v12.jsonl.gz`),
  receipt: join(latticeDir, `lattice-${slug}-v12.json`),
};
for (const [k, p] of Object.entries(files)) if (!existsSync(p)) { console.error(`LATTICE_FILE_MISSING ${k}: ${p}`); process.exit(1); }
const sha256File = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const latticeReceipt = JSON.parse(readFileSync(files.receipt, "utf8"));
if (!/lattice_ledger\.v12$/u.test(String(latticeReceipt.schema))) { console.error(`NOT_V12: ${latticeReceipt.schema}`); process.exit(1); }
// the shipped hash must be the hash on disk, or this is not the file the lane sealed
for (const [k, want] of [["positions", latticeReceipt.files.positions.sha256], ["routes", latticeReceipt.files.routes.sha256]]) {
  const got = sha256File(files[k]);
  if (got !== want) { console.error(`LATTICE_SHA_MISMATCH ${k}: receipt ${want.slice(0, 12)}…, disk ${got.slice(0, 12)}…`); process.exit(1); }
}

// the store, for the reading pool a card is grouped into, and the witness
// ids its labels stand for — a lattice card names its source by label
const store = openRouteStore(arg("--store", join(zonePath.replace(/data\/zones\/.*$/u, ""), "data", "route-store")));
const labelToM = new Map(Object.entries(store.index.m_sources || {}).map(([id, m]) => [m.label, id]));

// THE TWO WITNESSES BEHIND A PIECE, and the licence they are served under.
// The lattice names them "TAHOT" and "MACULA" and carries no M id, so the
// identification below is OURS: these are the store's own sources of that
// data, and the tool refuses rather than guesses if the store stops carrying
// them or stops declaring them under one posture. The card prints the
// licence from data/license-postures-v1.json, never from this file.
const PIECE_WITNESSES = {
  english_tahot: "STEP Bible Translators Amalgamated Hebrew OT aligned component translation",
  english_macula: "MACULA exact Hebrew morph surfaces with Cherith English definitions",
};
const pieceWitness = {};
for (const [field, label] of Object.entries(PIECE_WITNESSES)) {
  const id = labelToM.get(label);
  if (!id) { console.error(`PIECE_WITNESS_NOT_IN_STORE ${field}: ${label}`); process.exit(1); }
  const posture = store.index.m_sources[id].licensePosture;
  if (posture !== "cc_by_4_0") { console.error(`PIECE_WITNESS_POSTURE_MOVED ${field}: ${label} is ${posture}, not cc_by_4_0`); process.exit(1); }
  pieceWitness[field] = { m: id, label, licence: posture };
}

// ---- the zone's own keys, so only their routes are kept ------------------
const keysOf = (w) => (w.w ? w.w.map((r) => r.k).filter(Boolean) : w.k ? [w.k] : []);
const wanted = new Set();
for (const sec of zone.sections || []) for (const w of sec.words || []) { for (const k of keysOf(w)) wanted.add(k); if (w.h) wanted.add(w.h); }

// ---- the routes, streamed, kept for the wanted keys only -------------------
const readLines = async (path, onLine) => {
  const rl = createInterface({ input: createReadStream(path).pipe(createGunzip()), crlfDelay: Infinity });
  for await (const line of rl) if (line) onLine(line);
};
const routes = new Map();   // key -> [{ fp, text, src, lic, year, corpus, tr }]
// the wording year the served store gives a source's own row for a reading
const labelOf = new Map(Object.entries(store.index.m_sources || {}).map(([id, s]) => [id, s.label || ""]));
const heldLabels = new Set(labelOf.values());
const wordingYearOf = (key, card) => {
  const rows = store.routesFor(key) || [];
  const hit = rows.find((r) => labelOf.get(r[3]) === card.src && String(r[1]) === String(card.text));
  const y = hit ? String(hit[4]) : "";
  return /^\d{4}$/.test(y) ? Number(y) : null;
};
let routeLines = 0, routeCards = 0;
await readLines(files.routes, (line) => {
  routeLines += 1;
  const r = JSON.parse(line);
  if (!wanted.has(r.key)) return;
  routes.set(r.key, (r.routes || []).map((c) => {
    routeCards += 1;
    return { fp: fnv1a(`${c.text}|${c.primary_source}`), text: c.text, src: c.primary_source, lic: c.primary_licence, year: c.year ?? null, corpus: c.declared_corpus, tr: c.is_transliteration === true };
  }));
});

// ---- the positions, grouped by verse, ON only, in file order --------------
const byRef = new Map();
let posLines = 0, posOn = 0;
await readLines(files.positions, (line) => {
  posLines += 1;
  const p = JSON.parse(line);
  if (p.c0 !== "ON") return;      // rule 1 of the lattice: join on kind, not rule; an ink mark is not a word
  posOn += 1;
  if (!byRef.has(p.ref)) byRef.set(p.ref, []);
  byRef.get(p.ref).push(p);
});

// ---- the binyan ledger (the corpus lane's v104 and v105), when given --------
// File 1 names the stem of every verb at its place, file 2 the stems of every
// store row on a verb's letters that a source names. Both are baked into the
// sidecar: per pointed surface the stems of its places in this book (st), per
// key the rows whose stems are known (stems), so the card can withhold a
// reading of another stem under "only" and the line under a word baked here
// says what its first pill says. A row whose stem no source names is never
// another stem's.
const placeStemsPath = arg("--place-stems"), rowStemsPath = arg("--row-stems");
// WITHDRAWN (the corpus lane, Moses, 2026-11-06): a fresh reader checked the
// stems of version 1 of both files by hand and found them not fit to withhold
// with (row stems: M46's own labels 6 wrong and 2 partly wrong of 40 read,
// and M5's finding rule takes right readings off qal cards; place stems: 7 of
// 73,843 lines wrong). These exact files are refused. Version 2 of both
// (v105.1: place-stems-v2.jsonl, row-stems-v2.jsonl) was reviewed by the page
// lane and is the one the sidecars carry, under stem-family-rule-v2.
const WITHDRAWN_BINYAN = new Map([
  ["1c54671b66f0207a7bcf9212cae2d6adb07a3b4a56acf3cc103cf7914a411569", "place-stems-v1.jsonl (v104)"],
  ["33d94ffb1c03a2407e7a503aaf7ac2d7ecea0a5199ed76477dff64cd526ecb36", "row-stems-v1.jsonl (v105)"],
]);
for (const p of [placeStemsPath, rowStemsPath].filter(Boolean)) {
  const h = sha256File(p);
  if (WITHDRAWN_BINYAN.has(h)) { console.error(`refused: ${WITHDRAWN_BINYAN.get(h)} was withdrawn by the corpus lane on 2026-11-06; project with version 2 (v105.1)`); process.exit(1); }
}
const stemsByPlace = new Map();       // "c:v:n" (marks not counted) -> [stem]
const stemsByKey = {};                // key -> { "m\u0001rank\u0001route": [stem] }
const binyanFiles = [];
if (placeStemsPath) {
  for (const line of readFileSync(placeStemsPath, "utf8").split("\n")) {
    if (!line) continue;
    const l = JSON.parse(line);
    if (l.book === slug) stemsByPlace.set(l.place, stemsOfPlaceLine(l));
  }
  binyanFiles.push({ file: placeStemsPath.split("/").pop(), sha256: sha256File(placeStemsPath) });
}
if (rowStemsPath) {
  for (const line of readFileSync(rowStemsPath, "utf8").split("\n")) {
    if (!line) continue;
    const l = JSON.parse(line);
    if (!wanted.has(l.key) || !Array.isArray(l.stems) || !l.stems.length) continue;
    (stemsByKey[l.key] ||= {})[`${l.m}\u0001${l.rank}\u0001${l.route}`] = l.stems;
  }
  binyanFiles.push({ file: rowStemsPath.split("/").pop(), sha256: sha256File(rowStemsPath) });
}
// THE STEMS EXTENSION (the corpus lane's relay v173; the owner's ruling 2 of
// 13 November 2026). File 2 names stems where BDB, TAHOT and MACULA say
// them. The extension is the same format for three more dictionaries: the
// UBS dictionary and the SDBH, whose rows the store serves, and Jastrow,
// whose rows stand in the dictionary beside the store. It is read through
// tools/stems-extension-v1.mjs: the file only as the bytes its pin names
// (data/stems-extension/), and each of its two branches as the lane's own
// pin of the owner's ruling sets it. Its stems join the same record under
// the same id, so the page finds the stems of a row beside the store where
// it finds the store's. A row both files name is a fault and is refused.
const extensionPath = arg("--row-stems-extension");
let extensionSaid = null;   // what the sidecar says of the extension, or null where none was read
if (extensionPath) {
  if (!rowStemsPath) { console.error("refused: --row-stems-extension extends the binyan ledger's file 2 and is read with it (--row-stems)"); process.exit(1); }
  let ext;
  try { ext = readStemsExtension(extensionPath); } catch (e) { console.error(`refused: the stems extension: ${e.message}`); process.exit(1); }
  let given = 0;
  for (const l of ext.lines) {
    if (!wanted.has(l.key) || !l.stems.length) continue;
    const held = (stemsByKey[l.key] ||= {});
    const id = stemsId(l.m, l.rank, l.route);
    if (Object.prototype.hasOwnProperty.call(held, id)) { console.error(`refused: the stems extension and file 2 both name the row ${l.m} rank ${l.rank} under «${l.key}»`); process.exit(1); }
    held[id] = l.stems;
    given += 1;
  }
  binyanFiles.push({ file: ext.pin.lines.file, sha256: ext.pin.lines.sha256 });
  extensionSaid = { rule: STEMS_EXTENSION_RULE_ID, pin: `${STEMS_EXTENSION_HOME}/PIN.json`, relay: ext.pin.relay, lines_sha256: ext.pin.lines.sha256, ruling: ext.cited, branches: Object.fromEntries(ext.resting), rows_given_stems_in_this_book: given };
}
// a pointed surface's stems: the union over its places in this book, the
// place counted as the piece store counts it (the verse's words, marks not
// counted). A place written one way and read another gives its stems to the
// READ half (kq-grade-rule-v1-the-read-half-is-graded-by-its-own-vowels-the-written-half-by-letters-only;
// the owner, 7 November 2026, adopting the corpus lane's v151): the stem
// file's parse there stands on the read form, a parse needs vowels, and the
// vowels are the reading's. The read half is keyed as the lattice keys it,
// the pointed form inside the source's brackets. A read half of several words
// gives none (the stem is one word's, and the file does not say which), and
// the written half never takes one: a stem of the written letters is a
// reconstruction, not the place's.
const stemsBySurface = new Map();
const kqStems = { places_with_a_stem: 0, given_to_the_read_half: 0, read_half_of_several_words: 0, no_read_half: 0 };
const addStems = (surface, st) => { if (!stemsBySurface.has(surface)) stemsBySurface.set(surface, new Set()); for (const x of st) stemsBySurface.get(surface).add(x); };
if (stemsByPlace.size) for (const sec of zone.sections || []) {
  const [c, v] = String(sec.label || "").split(":");
  if (!v) continue;
  let n = 0;
  for (const w of sec.words || []) {
    if (w.mark) continue;
    n += 1;
    const st = stemsByPlace.get(`${c}:${v}:${n}`);
    if (!st || !st.length || typeof w.s !== "string") continue;
    if (!w.kq) { addStems(w.s, st); continue; }
    kqStems.places_with_a_stem += 1;
    const reads = (Array.isArray(w.w) ? w.w : []).filter((r) => r && r.role === "QERE" && typeof r.s === "string" && r.s);
    if (!reads.length) { kqStems.no_read_half += 1; continue; }
    if (reads.length > 1) { kqStems.read_half_of_several_words += 1; continue; }
    addStems(reads[0].s.replace(/^\[+|\]+$/gu, ""), st);
    kqStems.given_to_the_read_half += 1;
  }
}

// ---- rule 2 · the join, verse by verse, proved by the key ------------------
const stats = { rows_graded_from_headwords: 0, rows_graded_from_lattice: 0, rows_ungraded: 0, verses: 0, verses_joined: 0, verses_held: 0, verses_absent_from_lattice: 0, words_on: 0,
  surfaces_unattested: 0, surfaces_with_stems: 0, surfaces_name_leads_under_only: 0, surfaces_with_lenient_leader: 0, surfaces_with_lenient_alternate: 0,
  hg: 0, hm_year_unsaid: 0, hg_skipped_source_not_held: 0, hg_skipped_same_as_form: 0, hg_skipped_lemma_not_in_routes: 0, hg_skipped_lemma_differs_from_h: 0, hg_skipped_no_h: 0, hg_skipped_witnesses_differ: 0,
  ld: 0, grades: 0, verses_with_their_own_citations: 0, verses_held_j_not_sound: 0,
  bare: 0, bare_without_pieces: 0, pc: 0, pc_pieces: 0, pc_both_witnesses: 0, pc_skipped_word_has_an_english: 0,
  places_tagged: 0, places_with_no_core_tag: 0, places_whose_pieces_spell_no_key_of_the_word: 0,
  name_places_listed: 0, name_places_marked: 0, name_places_with_no_word: 0, leaders_asked_at_a_kind_of_place: 0, leaders_the_place_moves: 0,
  held_examples: [] };
const grades = {};          // pointed surface -> { k, g, n, o, v? }
// what the sidecar prints of a reading's credit: its text, its oldest
// carrier's label and license key, and that row's wording year
const credit = (text, row) => { const src = store.index.m_sources[row[3]]; const y = store.wordingYear(row); return [text, src.label, src.licensePosture, Number.isFinite(y) ? y : null]; };
// WHO LEADS UNDER "CITES HERE", for one key and one verse's list of citing
// cards: the first reading of the store's pool, oldest first, that a citing
// card carries, credited to its oldest carrier — what the card puts first
// when it sorts the citing readings ahead. Asked once for the surface's
// first verse and again for every verse whose list differs. The pool and the
// cards behind each reading are the key's, so they are kept per key.
const citeGroupsByKey = new Map();
const citeGroupsOf = (key, list) => {
  if (!citeGroupsByKey.has(key)) {
    const srows = store.routesFor(key) || [];
    const fpIx = new Map(list.map((c, ix) => [c.fp, ix]));
    const ixOf = (row) => { const src = store.index.m_sources[row[3]]; const ix = src ? fpIx.get(fnv1a(`${row[1]}|${src.label}`)) : undefined; return ix === undefined ? -1 : ix; };
    citeGroupsByKey.set(key, store.readingPool(srows, "oldest").map((grp) => {
      const carriers = store.carriersOf(srows, grp.text);
      return { text: grp.text, first: carriers[0] || null, cards: carriers.map(ixOf).filter((ix) => ix >= 0) };
    }));
  }
  return citeGroupsByKey.get(key);
};
const citesLeader = (key, list, names) => {
  if (!names.length) return null;
  const hit = citeGroupsOf(key, list).find((g) => g.cards.some((ix) => names.includes(ix)));
  return hit && hit.first ? credit(hit.text, hit.first) : null;
};
const sameList = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
// THE LEADERS AT EACH KIND OF PLACE (entry-gate-rule-v1, names-gate-rule-v1;
// tools/place-leaders-v1.mjs says what the keys are). Under "only this
// pointing" the page asks two things of a place before it asks the pointing.
// Its entry: a row whose own source files it under another entry than the
// place's is withheld, a row of the place's entry stands whatever its
// headword's points, and a row with no number goes to the pointing as
// before. And whether the place is a name: where it is not, a row its own
// source gives as a name is withheld. The leaders baked for the filter (o.l,
// its alternate o.la, and nl, whether the name still leads) are computed
// with the pointing and the stem alone, and they stay so: they are what a
// place with no tag that is a name reads. For each kind of place a pointed
// surface stands at in this book they are computed again, row by row with
// the gates, and kept where they are not the same: grades[surface].e[<the
// place's key>] = { l, la, nl }. What a surface's rows grade as, and which
// stems part them, is the surface's and is kept from its first verse.
const sameJson = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
const surfaceRows = new Map();   // pointed surface -> { srows, gradeOfRow, attested, otherStem, nameText, asked: the kinds of place asked so far }
const leadersAt = ({ srows, gradeOfRow, attested, otherStem, nameText }, place, isName) => {
  const bdbHere = place ? bdbEntriesAt(place, srows.map(factsOf)) : null;
  const verdict = new Map(srows.map((row) => [row, place ? entryVerdict(factsOf(row), place, bdbHere) : "none"]));
  const keeps = (row) => { const v = verdict.get(row); return v !== "other" && !nameWithheld(factsOf(row), isName) && (v === "this" || !attested || gradeOfRow(row) !== "x") && !otherStem(row); };
  const leader = (omit) => {
    const kept = srows.filter((row) => store.index.m_sources[row[3]] && !(omit && omit.has(String(row[3]))) && keeps(row));
    const pool = store.readingPool(kept, "oldest");
    if (!pool.length) return null;
    const carriers = store.carriersOf(kept, pool[0].text);
    return carriers.length ? [...credit(pool[0].text, carriers[0]), [...new Set(carriers.map((row) => String(row[3])))].sort()] : null;
  };
  const l = leader(null);
  return { l, la: l ? leader(new Set(l[4])) : null, nl: !!nameText && store.carriersOf(srows.filter(keeps), nameText).length > 0 };
};
// ---- the name places of this book (names-gate-rule-v1) --------------------
// The corpus lane's list names each name place by its book, its verse and the
// word's number in the verse as the card's head counts it (the marks not
// counted). The list is kept under a pin in data/names/ and read only as those
// bytes. Every word's mark is cleared first, so a place an earlier list named
// and this one does not carries none.
const namesDir = arg("--names", join(zonePath.replace(/data\/zones\/.*$/u, ""), "data", "names"));
let namesSaid = null;   // what the receipt says of the list, or null where the tree holds none
for (const sec of zone.sections || []) for (const w of sec.words || []) delete w.np;
if (existsSync(join(namesDir, "PIN.json"))) {
  const pin = JSON.parse(readFileSync(join(namesDir, "PIN.json"), "utf8"));
  if (pin.schema_version !== "NAMES_PIN_V1" || !pin.place_names) { console.error(`the pin of the names names no list of name places (${join(namesDir, "PIN.json")})`); process.exit(1); }
  const here = new Map();   // verse label -> the numbers of its words that are a name
  for (const l of readPinnedLines(join(namesDir, pin.folder, pin.place_names.file), pin.place_names, `${pin.folder}/${pin.place_names.file}`)) {
    if (l.book !== slug) continue;
    const cut = String(l.place).lastIndexOf(":");
    const verse = String(l.place).slice(0, cut), n = Number(String(l.place).slice(cut + 1));
    if (cut < 1 || !Number.isInteger(n) || n < 1) { console.error(`the list of name places names a place that is no verse and word number: ${JSON.stringify(l.place)}`); process.exit(1); }
    (here.get(verse) || here.set(verse, new Set()).get(verse)).add(n);
    stats.name_places_listed += 1;
  }
  for (const sec of zone.sections || []) {
    const listed = here.get(String(sec.label));
    if (!listed) continue;
    const words = (sec.words || []).filter((w) => !w.mark);
    for (const n of listed) { if (words[n - 1]) { words[n - 1].np = 1; stats.name_places_marked += 1; } }
  }
  stats.name_places_with_no_word = stats.name_places_listed - stats.name_places_marked;
  namesSaid = { rule: NAMES_GATE_RULE_ID, relay: pin.relay, place_names: { file: pin.place_names.file, sha256: pin.place_names.sha256, lines: pin.place_names.lines },
    listed_for_this_book: stats.name_places_listed, marked: stats.name_places_marked, with_no_word: stats.name_places_with_no_word };
}
// a place is a name where the list marks it; a book whose places were not read for names treats every place as one,
// so its names stand as they did before the gate
const isNamePlace = (w) => !namesSaid || !!w.np;

for (const sec of zone.sections || []) {
  const on = (sec.words || []).filter((w) => !w.mark && keysOf(w).length);
  if (!on.length) continue;
  // NOTHING OF AN EARLIER PROJECTION STANDS ON A WORD THIS ONE DOES NOT
  // REACH. What this tool writes on a word is cleared here, before the verse
  // is proved, so a verse held whole or absent from the lattice carries no
  // reading, credit or difference a run before this one wrote (until 10
  // November 2026 they were cleared only inside a joined verse).
  for (const w of on) { delete w.hg; delete w.hm; delete w.ld; delete w.pc; delete w.tg; for (const r of w.w || []) delete r.tg; }
  stats.verses += 1; stats.words_on += on.length;
  const rows = byRef.get(sec.label);
  if (!rows) { stats.verses_absent_from_lattice += 1; continue; }
  // a position proves when any of its entries (the form; at a pair, the
  // form and the qere) keys as one of the zone's keys for that word
  const keysOfRow = (p) => (p.megacompspan || []).map((m) => m.key).filter(Boolean);
  const matches = (w, p) => keysOfRow(p).some((k) => keysOf(w).includes(k));
  // J IS THE POSITION, NOT I. The corpus lane's warning (2026-09-13): i
  // repeats across the parts of a maqaf compound — 2,951 times inside a
  // verse in Genesis alone — so anything keyed on i silently merges the
  // pieces of a joined word. This tool never keyed on i; it binds the n-th
  // ON word of a verse to the n-th ON row. That is the same binding as j
  // only while the rows arrive in j order with j distinct, so it is proved
  // here rather than assumed, and a verse whose rows do not is held whole
  // like any other verse that does not prove.
  const js = rows.map((p) => p.j);
  const jSound = new Set(js).size === js.length && js.every((v, i) => i === 0 || v > js[i - 1]);
  const proved = jSound && rows.length === on.length && on.every((w, i) => matches(w, rows[i]));
  if (!jSound) stats.verses_held_j_not_sound += 1;
  if (!proved) {
    stats.verses_held += 1;
    if (stats.held_examples.length < 6) stats.held_examples.push(`${sec.label}: zone ${on.length} words, lattice ${rows.length} positions${rows.length === on.length ? `, first mismatch at ${on.findIndex((w, i) => !matches(w, rows[i])) + 1}` : ""}`);
    continue;
  }
  stats.verses_joined += 1;
  on.forEach((w, i) => {
    const p = rows[i];
    // the entry at the place: the tags of its core pieces, on the word, or on the half the pieces spell
    const cores = (p.pieces || []).filter((x) => x && x.role === "core" && x.tag).map((x) => String(x.tag));
    const spelled = (p.pieces || []).map((x) => (x && x.consonants) || "").join("");
    const tagged = !cores.length ? null : w.w ? w.w.find((r) => r.k === spelled) || null : w.k === spelled ? w : null;
    if (tagged) { tagged.tg = cores.length === 1 ? cores[0] : cores; stats.places_tagged += 1; }
    else if (cores.length) stats.places_whose_pieces_spell_no_key_of_the_word += 1;
    else stats.places_with_no_core_tag += 1;
    // rule 4 · the grades, per pointed surface, over the lattice's own order
    for (const m of p.megacompspan || []) {
      const rg = m.route_grades;
      const list = routes.get(m.key);
      if (!rg || !list) continue;
      const names = (rg.names_this_verse || []).filter((ix) => ix < list.length);
      // the surface is graded already, at its first verse: this verse adds
      // only what is its own, the cards that name it, where they are not
      // the first verse's
      if (grades[m.surface]) {
        const base = grades[m.surface];
        if (!sameList(base.n, names) && !(base.v && Object.prototype.hasOwnProperty.call(base.v, sec.label))) {
          (base.v ||= {})[sec.label] = { n: names, c: citesLeader(m.key, list, names) };
          stats.verses_with_their_own_citations += 1;
        }
        continue;
      }
      const g = new Array(list.length).fill("-");
      for (const [tier, idxs] of Object.entries(rg.grade_of_index || {})) for (const ix of idxs) if (ix < g.length) g[ix] = GRADE_CHAR[tier] || "-";
      // THE LINE MOVES, NOT ONLY THE CARD (owner, 2026-09-09): under each
      // lattice order the first card is baked here — the oldest card of the
      // order's leading set, ties in lattice order — so the reading under the
      // word can change without a fetch of the store. Null where the leading
      // set is empty: the order then changes nothing and the line stands.
      // The first card of a set is what the CARD would put first for that
      // set: the store's own reading pool over those cards, oldest first —
      // readings split from route text and grouped across cards, exactly as
      // the page groups them — so the line and the first pill say one thing.
      // The M is the oldest card of the set that carries that reading.
      // The card groups readings across cards (the store's own pool, oldest
      // first), gives each group the best tier any card carrying it earned,
      // and sorts groups by that tier and then their oldest card. The same
      // arithmetic here, so the line and the first pill say one thing; the M
      // is the oldest card carrying the reading, as the card prints it.
      // The rows are the STORE's rows for this key — the same rows, the same
      // years, the same pool the page builds — and each row finds its lattice
      // grade by fingerprint; a row the lattice did not grade ranks after the
      // graded ones, as on the page.
      const srows = store.routesFor(m.key) || [];
      const fpIx = new Map(list.map((c, ix) => [c.fp, ix]));
      const rowIx = (row) => { const src = store.index.m_sources[row[3]]; const ix = src ? fpIx.get(fnv1a(`${row[1]}|${src.label}`)) : undefined; return ix === undefined ? -1 : ix; };
      const pool = store.readingPool(srows, "oldest");
      const TIER = { m: 0, n: 1, x: 2 };
      // THE GRADE OF A ROW — pointing-grade-rule-v4, the same two steps the
      // page takes: a row that carries its source's own headwords at [6] is
      // graded by them against this pointed surface; a row that does not
      // falls to the lattice card's grade by fingerprint; "-" when neither
      // can say. On a v1 store every row falls through, and nothing here
      // moves; on the v2 store the leaders baked below say what the card's
      // first pill says under each position, per source and not merged.
      const gradeCache = new Map();
      const gradeOfRow = (row) => {
        if (gradeCache.has(row)) return gradeCache.get(row);
        let gc;
        const sg = gradeRow(row, m.surface);
        if (sg !== "-") { stats.rows_graded_from_headwords += 1; gc = sg; }
        else { const ix = rowIx(row); if (ix < 0) { stats.rows_ungraded += 1; gc = "-"; } else { stats.rows_graded_from_lattice += 1; gc = g[ix] || "-"; } }
        gradeCache.set(row, gc); return gc;
      };
      // WHO CARRIES A GROUP is the store's answer (carriersOf: every admitted
      // row whose readings print as the group prints, oldest wording first),
      // the same rows the page puts behind the pill. Until 10 November 2026
      // this matched the reading as written, so a row that closes the reading
      // with a stop was not among its carriers.
      const groupInfo = pool.map((grp) => {
        const carriers = store.carriersOf(srows, grp.text);
        let tier = 3;
        for (const row of carriers) { const t = TIER[gradeOfRow(row)]; if (t !== undefined && t < tier) tier = t; }
        return { text: grp.text, tier, carriers };
      });
      const firstUnder = (rank, only) => {
        const ordered = groupInfo.map((gi, at) => ({ gi, at, r: rank(gi) })).sort((a, b) => a.r - b.r || a.at - b.at);
        const top = ordered[0];
        if (!top || !only(top.gi)) return null;
        // the M the card prints for that reading: its oldest record
        return top.gi.carriers.length ? credit(top.gi.text, top.gi.carriers[0]) : null;
      };
      // THE FILTER LEADERS, at the ROW grain. The three above lead a
      // re-order of the whole pool; a group takes the best tier any card
      // carrying it earned, which is right for sorting. The masorah toggle's
      // "only" position is not a sort — it withholds the rows the lattice
      // graded as contradicting this pointing BEFORE the pool is built, and
      // the page does that row by row. So the leader baked for it has to be
      // computed row by row too, or the line under the word and the first
      // pill on the card say two different things:
      //   l  lenient — rows graded VOWEL_MISMATCH withheld; a NORMALIZED row
      //      (the source's headword is unpointed) and an ungraded row stay,
      //      because silence is not contradiction and unknown is not later
      //   s  strict  — only rows graded VOWEL_MATCH stay
      // Measured over the 39 books before this was written: lenient moves
      // the printed line at 13.2% of graded words and bares 2.0%; strict
      // moves 61.5% and bares 5.2%, blacking out the divine name at its
      // Elohim-pointing, whose 60 cards hold 26 NORMALIZED and 0 matches.
      // A POINTING NO SOURCE ATTESTS WITHHOLDS NOTHING (2026-11-06), as on the
      // page: the lenient filter applies only where some store row points the
      // word as the text does. And THE BINYAN: a row whose stems are known
      // and share no family with this surface's stems is withheld under both
      // filters, as the page withholds it.
      const st = stemsBySurface.has(m.surface) ? [...stemsBySurface.get(m.surface)].sort() : null;
      const rs = st ? stemsByKey[m.key] || null : null;
      const otherStem = (row) => !!(rs && isOtherStem(rs[`${row[3]}\u0001${row[0]}\u0001${row[1]}`], st));
      const attested = srows.some((row) => store.index.m_sources[row[3]] && gradeOfRow(row) === "m");
      if (!attested) stats.surfaces_unattested += 1;
      // omit: rows of these sources are out of the kept set (the reader's
      // source switches, one step); withBy: the leader names its carriers,
      // the ids of every kept row carrying the reading, as the table names
      // a reading's carriers in gloss_m[k].by — what a source switch removes
      const rowLeader = (keep, onlyWhereAttested, omit = null, withBy = false) => {
        const kept = srows.filter((row) => store.index.m_sources[row[3]] && !(omit && omit.has(String(row[3]))) && (onlyWhereAttested && !attested ? true : keep(gradeOfRow(row))) && !otherStem(row));
        const p = store.readingPool(kept, "oldest");
        if (!p.length) return null;
        const top = p[0];
        // its M: the oldest kept row carrying the reading, as the card prints it
        const carriers = store.carriersOf(kept, top.text);
        if (!carriers.length) return null;
        const out = credit(top.text, carriers[0]);
        return withBy ? [...out, [...new Set(carriers.map((row) => String(row[3])))].sort()] : out;
      };
      // THE FILTER'S OWN ALTERNATE (7 November 2026). The table's alternate
      // (gloss_m[k].alt) is the next reading with the line's carriers off,
      // baked over every row, filter or no filter: under "only this
      // pointing" it names a row the filter withholds at 28,542 of 122,146
      // graded words (Amos's Amos with Strong's off read BDB's «Amos the
      // prophet», pointed otherwise, while the card pressed «amos»). So the
      // lenient leader carries its carriers, and la is the lenient leader
      // among the kept rows with every carrier of l out: what the line reads
      // when the reader switches off every source carrying l, one step, as
      // the table's alternate is one step. Null where l is null, or where
      // nothing kept remains past l's carriers.
      const lenient = (gc) => gc !== "x";
      const l = rowLeader(lenient, true, null, true);
      const o = {
        m: firstUnder((gi) => gi.tier, (gi) => gi.tier === 0),
        x: firstUnder((gi) => ({ 2: 0, 1: 1, 0: 2 }[gi.tier] ?? 3), (gi) => gi.tier === 2),
        c: citesLeader(m.key, list, names),
        l,
        la: l ? rowLeader(lenient, true, new Set(l[4]), true) : null,
        s: rowLeader((gc) => gc === "m", false),
      };
      if (l) stats.surfaces_with_lenient_leader += 1;
      if (o.la) stats.surfaces_with_lenient_alternate += 1;
      // A NAME LEADS UNDER "ONLY" TOO (proper-name-rule-v1). Where the zone's
      // line under this key is its name (gloss_names, baked by regloss-zone),
      // and a row the lenient filter keeps carries that name, the line under
      // "only" reads the name as the table does; nl says so, so the page
      // needs no fetch to know it (o.l stays the filter's own leader, for a
      // reader who turned names off). Before this the name yielded to o.l
      // everywhere "only" stood, and "only" is the default (2026-11-06):
      // under "oldest first" Amos's Israel read "he will rule as God".
      const nameText = zone.gloss_names && zone.gloss && Object.prototype.hasOwnProperty.call(zone.gloss_names, m.key) && zone.gloss[m.key] === zone.gloss_names[m.key]
        ? String(zone.gloss_names[m.key]) : null;
      const nl = !!nameText && store.carriersOf(srows.filter((row) => (attested ? gradeOfRow(row) !== "x" : true) && !otherStem(row)), nameText).length > 0;
      if (nl) stats.surfaces_name_leads_under_only += 1;
      grades[m.surface] = { k: m.key, g: g.join(""), n: names, o, ...(st ? { st } : {}), ...(nl ? { nl: 1 } : {}) };
      if (st) stats.surfaces_with_stems += 1;
      stats.grades += 1;
      surfaceRows.set(m.surface, { srows, gradeOfRow, attested, otherStem, nameText, asked: new Set() });
    }
    // rule 3 · hg, the headword's first reading under lemma-sort v3
    const entry = (p.megacompspan || []).find((m) => m.lemma) || null;
    const L = entry && entry.lemma;
    if (!w.h) stats.hg_skipped_no_h += 1;
    else if (!L || L.agree !== "same") stats.hg_skipped_witnesses_differ += 1;
    else if (L.key !== w.h) stats.hg_skipped_lemma_differs_from_h += 1;
    // the headword IS the form: the line already reads under it, and the
    // lattice sorts no stack there (Moses, v12: in_routes false at 112,309
    // such positions is not a gap)
    else if (L.same_as_form === true) stats.hg_skipped_same_as_form += 1;
    else if (!L.in_routes || !Array.isArray(L.sorted_route_index) || !L.sorted_route_index.length || !routes.get(L.key)) stats.hg_skipped_lemma_not_in_routes += 1;
    else {
      const top = routes.get(L.key)[L.sorted_route_index[0]];
      // RULE 1 HOLDS FOR THE HEADWORD TOO: a card whose source the served
      // store does not hold is counted and never shown. The lattice is the
      // corpus lane's own catalog; the store struck seven of its sources for
      // naming no language (data/language-admission-v1.json) and Bolls's BDB
      // for its license (data/source-strikes-v1.json, 17 October), and their
      // cards still head 8,352 headword stacks on the 39 books. The word then
      // carries no hg, and the line under "the headword" reads the headword's
      // own baked column, as at every other word without one.
      if (top && !heldLabels.has(top.src)) stats.hg_skipped_source_not_held += 1;
      // THE CREDIT'S YEAR IS THE STORE'S. The lattice card carries a year of
      // its own (BDB's 1906 on a reading SDBH repeats), and pairing it with
      // the card's source named one source with another's year on 655 of
      // Amos's 748 headword credits. The year said beside a source is the
      // wording year of that source's own row for this reading, read from
      // the served store; where no row of that source speaks the reading,
      // no year is said.
      else if (top) { w.hg = top.text; w.hm = { m: top.src, lic: top.lic, y: wordingYearOf(L.key, top) }; stats.hg += 1; if (w.hm.y === null) stats.hm_year_unsaid += 1; }
      else stats.hg_skipped_lemma_not_in_routes += 1;
    }
    // rule 3 · ld, where the Leningrad codex differs
    const ln = p.leningrad;
    if (ln && ln.differs === true) { w.ld = { kind: ln.kind || null, mam: ln.letters_mam || null, other: ln.letters_macula || ln.letters_tahot || null }; stats.ld += 1; }
    // rule 5 · the parts, for a word the catalog answers nothing for
    const g = zone.gloss || {};
    const answered = keysOf(w).some((k) => g[k]) || !!(w.h && g[w.h]);
    if (answered) stats.pc_skipped_word_has_an_english += 1;
    else {
      stats.bare += 1;
      const pcs = (p.pieces || []).filter((x) => x && (x.english_tahot || x.english_macula));
      if (!pcs.length) { stats.bare_without_pieces += 1; return; }
      w.pc = pcs.map((x) => ({ r: x.role, s: x.hebrew, ...(x.english_tahot ? { t: x.english_tahot } : {}), ...(x.english_macula ? { m: x.english_macula } : {}) }));
      stats.pc += 1; stats.pc_pieces += w.pc.length;
      if (w.pc.every((x) => x.t && x.m)) stats.pc_both_witnesses += 1;
    }
  });
}

// ---- the leaders at each kind of place, asked once every surface is graded --
// Every word of the book, and at a place written one way and read another
// each half, is a form the page may read leaders for: by its pointed surface
// (a read half's without the source's brackets), its own tags and whether its
// place is a name. A form whose surface the lattice graded under its own key
// is asked once for each kind of place it stands at.
for (const sec of zone.sections || []) for (const w of sec.words || []) {
  if (w.mark) continue;
  const isName = isNamePlace(w);
  for (const form of [w, ...(w.w || [])]) {
    if (!form || typeof form.s !== "string" || !form.k) continue;
    const surface = form === w ? form.s : form.s.replace(/^\[+|\]+$/gu, "");
    const rec = grades[surface], held = surfaceRows.get(surface);
    if (!rec || !held || rec.k !== form.k) continue;
    const tags = form.tg ? [].concat(form.tg) : null;
    const key = leadersKey(tags, isName);
    if (key === PLACE_IS_A_NAME || held.asked.has(key)) continue;   // no tag and a name: the surface's own leaders
    held.asked.add(key);
    stats.leaders_asked_at_a_kind_of_place += 1;
    const now = leadersAt(held, tags ? placeEntry(tags) : null, isName);
    if (sameJson(now.l, rec.o.l) && sameJson(now.la, rec.o.la) && now.nl === !!rec.nl) continue;
    (rec.e ||= {})[key] = { l: now.l, la: now.la, ...(now.nl ? { nl: 1 } : {}) };
    stats.leaders_the_place_moves += 1;
  }
}

// ---- the sidecar ----------------------------------------------------------
const sideRoutes = {};
let trCards = 0;
for (const [k, list] of routes) {
  const t = []; list.forEach((c, i) => { if (c.tr) { t.push(i); trCards += 1; } });
  sideRoutes[k] = { f: list.map((c) => c.fp), ...(t.length ? { t } : {}) };
}
const sidecar = {
  schema_version: SIDECAR_SCHEMA, rule_id: LATTICE_RULE_ID, work: slug,
  source: { ledger: "moses-ledgers/lattice-v12/", candidate_only: true, schema: latticeReceipt.schema, generated: latticeReceipt.generated,
    positions: { path: files.positions.split("/").pop(), sha256: latticeReceipt.files.positions.sha256, bytes: statSync(files.positions).size },
    routes: { path: files.routes.split("/").pop(), sha256: latticeReceipt.files.routes.sha256, bytes: statSync(files.routes).size },
    receipt: { path: files.receipt.split("/").pop(), sha256: sha256File(files.receipt) } },
  fingerprint: "fnv1a-32 over the UTF-16 code units of `${text}|${primary_source}`, 8 hex digits; the store row's text and its source's label make the same string",
  grade_chars: { m: "VOWEL_MATCH", n: "NORMALIZED", x: "VOWEL_MISMATCH", "-": "ungraded" },
  first_under: {
    m: "masoretic — the oldest VOWEL_MATCH card", x: "vowels differ — the oldest VOWEL_MISMATCH card", c: "cites here — the oldest card naming this verse: o.c for the surface's first verse in the book, v[<verse>].c for every other verse whose citing cards differ",
    l: "masorah · only (lenient) — the oldest reading among rows NOT graded VOWEL_MISMATCH: NORMALIZED and ungraded rows stay, computed row by row as the page filters; where no store row is graded VOWEL_MATCH the pointing withholds nothing; a row of another stem (the binyan ledger) is withheld",
    s: "masorah · only (strict) — the oldest reading among rows graded VOWEL_MATCH only, row by row; a row of another stem is withheld",
    la: "masorah · only (lenient), the alternate — the lenient leader among the kept rows with every carrier of l out: what the line reads when the reader switches off every source carrying l (or the name, where it led), one step, as gloss_m[k].alt is one step for the table; null where l is null or nothing kept remains",
    shape: "[route text, source label, licence key, year] or null when the leading set is empty; l and la carry a fifth element, the sorted ids of the kept rows carrying the reading (the carriers a source switch removes)",
    row_grade: { rule: POINTING_GRADE_RULE_ID, from: "a store row that carries its source's own headwords at [6] is graded by them against this pointed surface, any one matching headword a match; a row without the slot takes the lattice card's grade by fingerprint; the leaders m, x, l, s all rest on that one grade — per source, not merged" },
  },
  counts: { keys: Object.keys(sideRoutes).length, cards: routeCards, transliteration_cards: trCards, surfaces_graded: Object.keys(grades).length, lattice_route_lines: routeLines, lattice_positions: posLines, lattice_on: posOn },
  emitted_from: { rule: LATTICE_RULE_ID, projected_on: stamp, projected_by: "tools/project-lattice-v12-v1.mjs", join: { ...stats } },
  routes: sideRoutes, grades,
  entry: { rule: ENTRY_GATE_RULE_ID, row_entries: store.index.row_entries ? { relay: store.index.row_entries.relay, ledger_sha256: store.index.row_entries.ledger.sha256 } : null },
  names: namesSaid ? { rule: NAMES_GATE_RULE_ID, relay: namesSaid.relay, place_names_sha256: namesSaid.place_names.sha256, name_rows: store.index.name_rows ? { relay: store.index.name_rows.relay, list_sha256: store.index.name_rows.name_rows.sha256 } : null } : null,
  leaders_at_a_place: "grades[surface].e[<key>] = { l, la, nl }: the leaders under \"only\" at a kind of place, where the place's gates make them other than o.l, o.la and nl. The key is the place's core tags as the lattice writes them, joined by a space (none where the place carries no tag), with \"|n\" after them where the place is a name: at a place that is not a name a row its source gives as a name is withheld, and at a tagged place a row of another entry is. A place whose key e does not hold, and a place with no tag that is a name, reads o.l, o.la and nl. The word carries its place's tags (tg) and its name mark (np); where the tree holds no list of name places every place is read as a name",
  ...(binyanFiles.length ? { stems: stemsByKey, binyan: { rule: STEM_FAMILY_RULE_ID, files: binyanFiles, ...(extensionSaid ? { extension: extensionSaid } : {}), kq: { rule: "kq-grade-rule-v1-the-read-half-is-graded-by-its-own-vowels-the-written-half-by-letters-only", ...kqStems }, what: "grades[surface].st: the stems of the surface's places in this book (both sources' where they disagree); stems[key]: the known stems of each row on the key, by m, rank and route: the store's rows, and where the extension was read the rows of the dictionary beside the store that it names; a row not listed has no known stem" } } : {}),
};
writeFileSync(sidecarPath, gzipSync(Buffer.from(JSON.stringify(sidecar)), { level: 9 }));

// ---- the receipt on the zone, typed -----------------------------------------
const ef = zone.emitted_from = zone.emitted_from || {};
ef.toggles = ef.toggles || {};
ef.toggles.lattice = {
  rule: LATTICE_RULE_ID,
  source: sidecar.source,
  sidecar: { path: `data/zones/${slug}.lattice.bin`, schema: SIDECAR_SCHEMA },
  join: "verse by verse, ON positions only (kind, not rule); the n-th ON word takes the n-th ON row, proved by key at every position AND by j being distinct and ascending across the verse's rows (j is the position identity — i repeats across the parts of a maqaf compound); a verse that does not prove is held whole",
  projected_on: stamp, projected_by: "tools/project-lattice-v12-v1.mjs",
  counts: { ...stats },
  names: namesSaid,
  what_the_word_carries: "np: 1 where the place is a name by the corpus lane's list of name places (names-gate-rule-v1), absent where it is not or where the tree holds no list; tg: the tag of the word's core piece as the lattice writes it, the entry TAHOT reads at this place (on a place written one way and read another, on the half whose letters the pieces spell), which the entry gate reads against each row's own entries; hg: the headword's first reading under lemma-sort v3, with hm (source, licence key, year) — only where h is the lattice's lemma, the stack is in routes and the served store still holds that reading's source; ld: the Leningrad difference where the codex spells the word otherwise; pc: the word's own pieces with their roles and BOTH witnesses' English, on words the catalog answers nothing for and on no others",
  pieces: {
    rule: "a word with no English under its form or its headword carries its pieces, so the card can show the reader what the two witnesses say about each part. The LINE is untouched: a bare word stays bare, because composing a definition out of pieces would supply the displayed answer for a key no source answered (the frame's folded-edge rule, and its ruling that a word with no admissible definition is a finding, not an error).",
    witnesses: pieceWitness,
    both_witnesses_ride: "TAHOT gives the English this position reads and MACULA the headword's; they differ at 205,953 of 466,981 pieces over the 39 books, so both are carried and neither is chosen",
  },
  what_the_sidecar_carries: "per key the cards' fingerprints in lattice order with transliteration flags; per pointed surface the tier of each card, which cite its first verse (n) and, for every other verse of the surface whose citing cards differ, that verse's own (v[<verse>].n, with its cites-here leader v[<verse>].c), and the first reading under each order (o.m, o.x, o.c) and under each masorah filter (o.l lenient, o.s strict) so the line under the word can move without a fetch; nl: 1 where the zone's line under the key is its name (proper-name-rule-v1) and a row the lenient filter keeps carries it, so under \"only\" the name leads as under \"keep\"",
  rulings_owed: "the welded-form ruling is still owed and is a separate question from these affix pieces: it governs the maqaf toggle, which nothing here touches; licence_class puts cc0 in class 0 as the corpus lane's reading, and the page derives its own classes from the posture keys",
};
typePostBuildWrite(zone, {
  tool: "tools/project-lattice-v12-v1.mjs",
  fields: ["emitted_from.toggles"],
  why: "the lattice's grades, headword order and edition differences are projected over this zone's own positions",
  expires: "with this zone's rebuild by a build-zone run that projects the lattice in its single pass",
  stamp,
});
writeZone(outPath, zone);
const s = stats;
console.log(`${outPath} · ${s.hg.toLocaleString()} of ${s.words_on.toLocaleString()} words carry the headword's lemma-sorted reading · ${s.ld} differ in Leningrad · verses ${s.verses_joined} joined, ${s.verses_held} held, ${s.verses_absent_from_lattice} absent`);
console.log(`  ${sidecarPath} · ${Object.keys(sideRoutes).length.toLocaleString()} keys, ${routeCards.toLocaleString()} cards (${trCards} transliterations) · ${Object.keys(grades).length.toLocaleString()} pointed surfaces graded · ${(statSync(sidecarPath).size / 1024).toFixed(0)} KB`);
console.log(`  parts: ${s.pc} of ${s.bare} words with no English of their own carry their pieces (${s.pc_pieces} pieces, ${s.pc_both_witnesses} with both witnesses) · ${s.bare_without_pieces} bare words the lattice has no pieces for · ${s.pc_skipped_word_has_an_english.toLocaleString()} words answered by the catalog and not carried`);
console.log(`  hg skipped: ${s.hg_skipped_no_h} no headword · ${s.hg_skipped_witnesses_differ} witnesses differ · ${s.hg_skipped_lemma_differs_from_h} lemma is not h · ${s.hg_skipped_same_as_form} headword is the form · ${s.hg_skipped_lemma_not_in_routes} stack has no cards in this book`);
console.log(`  places: ${s.places_tagged.toLocaleString()} carry their entry's tag · ${namesSaid ? `${s.name_places_marked.toLocaleString()} of ${s.name_places_listed.toLocaleString()} listed name places marked` : "no list of name places in this tree"} · leaders asked at ${s.leaders_asked_at_a_kind_of_place.toLocaleString()} kinds of place, ${s.leaders_the_place_moves.toLocaleString()} moved`);
if (s.held_examples.length) console.log(`  held: ${s.held_examples.join(" | ")}`);
