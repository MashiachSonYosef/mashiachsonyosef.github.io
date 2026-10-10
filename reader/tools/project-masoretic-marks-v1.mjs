#!/usr/bin/env node
// project-masoretic-marks-v1 · which characters of the line are Masoretic marks, by the corpus lane's classes
//
// RULE: masoretic-marks-rule-v1-every-mark-is-gold-by-its-class-never-by-a-code-point-range
// LEDGER: -
// no frame letter. This writes one small file, data/masoretic-marks-v1.json,
// from the corpus lane's moses-masoretic-marks-v1/build-v1.2/ (classes-v1.2.json,
// outputs/counts.json, marks-v1.2/<book>.jsonl) and its build/mark-words-v1.jsonl;
// it writes nothing on a zone.
//
// The corpus lane's relay FOR-ELIJAH-v72.2.1 (Moses, 10 October 2026 AD,
// READY, candidate only): every character of every word of the 39 books
// classified, a letter or one of the mark classes, with 0 unclassified and 0
// ambiguous. Moses, relayed by the owner on 11 October 2026: "Colour by class,
// never by code point range. The owner's vote: every mark gold, vowels
// included." The owner had asked for it on 10 October: "im actually right now
// leaning toward making all masoretic marks gold".
//
// WHICH CLASSES ARE MARKS. In the words (places): every class the lane counts
// under marks_by_class in outputs/counts.json. In the mark words the zone
// draws between them: the classes the relay names as marks, "sof pasuq",
// "paseq / legarmeh" and "inverted nun". Not marks: the letters, the ketiv and
// qere brackets and the space between them (the lane's layout characters),
// and the section marks' letters and braces, the brick gap and the empty
// verse's dash, which the lane carries as the paragraph marks of its own
// ledger (relay v73), not as marks.
//
// WHAT THE PAGE GETS. The page cannot carry 2.5 million class codes, and does
// not need to: in each of the two kinds of word, every code point the books
// use falls in classes that are all marks or all not marks (U+05BC is a
// dagesh, a mappiq or a shuruq, and all three are marks). This tool proves
// that at every character of every place and every mark word, against the
// lane's own class code for it, and writes the result as two lists of code
// points, one per kind of word. A code point whose classes disagree, or a
// character whose class code is not in the table, fails the tool and nothing
// is written. It also lays each place and mark word on the zone's own words,
// in order, byte for byte, so the characters proved are the characters the
// line draws.
//
// Run: node tools/project-masoretic-marks-v1.mjs --in <build-v1.2 dir> --mark-words <mark-words-v1.jsonl> [--out data/masoretic-marks-v1.json] [--zones data/zones]
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { join, basename } from "node:path";

const RULE = "masoretic-marks-rule-v1-every-mark-is-gold-by-its-class-never-by-a-code-point-range";
const arg = (n, d = null) => { const i = process.argv.indexOf(`--${n}`); return i > 0 ? process.argv[i + 1] : d; };
const IN = arg("in"), MW = arg("mark-words"), OUT = arg("out", "data/masoretic-marks-v1.json"), ZONES = arg("zones", "data/zones");
if (!IN || !MW) { console.log("usage: --in <build-v1.2 dir> --mark-words <mark-words-v1.jsonl> [--out data/masoretic-marks-v1.json] [--zones data/zones]"); process.exit(2); }
const sha = (b) => createHash("sha256").update(b).digest("hex");
const hex = (c) => c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0");
const fileOf = (p) => { const b = readFileSync(p); return { b, from: { file: basename(p), sha256: sha(b), bytes: b.length } }; };

const C = fileOf(join(IN, "classes-v1.2.json")), N = fileOf(join(IN, "outputs", "counts.json"));
const classes = JSON.parse(C.b.toString("utf8")).classes, counts = JSON.parse(N.b.toString("utf8"));
// the relay's own words for the mark words' marks, as the classes name them
const MARK_WORD_MARKS = ["SOF_PASUQ", "PASEQ", "LEGARMEH", "INVERTED_NUN"];
const markClasses = new Set([...Object.keys(counts.marks_by_class || {}), ...MARK_WORD_MARKS]);
let bad = 0;
const fail = (say) => { bad += 1; console.log(`FAIL  ${say}`); };
for (const k of markClasses) if (!classes.some((c) => c.class === k)) fail(`mark class ${k} is not in classes-v1.2.json`);
if (markClasses.has("LETTER")) fail("LETTER is counted as a mark");

// the class of each code, and, per kind of word, every class a code point is given there
const byCode = new Map(classes.map((c) => [c.code, c.class]));
const seen = { places: new Map(), mark_words: new Map() };
const tally = { places: { characters: 0, marks: 0 }, mark_words: { characters: 0, marks: 0 } };
const note = (kind, s, k, where) => {
  const chars = [...s];
  if (chars.length !== k.length) { fail(`${where}: ${chars.length} characters, ${k.length} codes`); return; }
  chars.forEach((ch, i) => {
    const cls = byCode.get(k[i]);
    if (!cls || cls === "AMBIGUOUS" || cls === "UNCLASSIFIED") { fail(`${where}: character ${i} has code ${k[i]} (${cls || "none"})`); return; }
    const cp = hex(ch);
    if (!seen[kind].has(cp)) seen[kind].set(cp, new Map());
    const m = seen[kind].get(cp); m.set(cls, (m.get(cls) || 0) + 1);
    tally[kind].characters += 1;
    if (markClasses.has(cls)) tally[kind].marks += 1;
  });
};

// the mark words, by book, in the lane's order
const markWords = new Map();
const MWF = fileOf(MW);
for (const line of MWF.b.toString("utf8").split("\n")) {
  if (!line.trim()) continue;
  const r = JSON.parse(line);
  if (r.header) continue;
  if (!markWords.has(r.book)) markWords.set(r.book, []);
  markWords.get(r.book).push(r);
}

const books = {}, bookFiles = {};
const DIR = join(IN, "marks-v1.2");
for (const f of readdirSync(DIR).filter((x) => x.endsWith(".jsonl")).sort()) {
  const { b, from } = fileOf(join(DIR, f));
  const book = f.replace(/\.jsonl$/u, "");
  bookFiles[book] = from;
  const places = [];
  for (const line of b.toString("utf8").split("\n")) {
    if (!line.trim()) continue;
    const r = JSON.parse(line);
    if (r.header) continue;
    places.push(r);
    note("places", r.s, r.k, `${book} p ${r.p}`);
  }
  const mws = markWords.get(book) || [];
  for (const r of mws) note("mark_words", r.s, r.k, `${book} mark word ${r.mi}`);
  // laid on the zone: its words in section order, the places on the words that
  // are not marks, the mark words on the marks, each byte for byte
  const zp = join(ZONES, `${book}.bin`);
  if (!existsSync(zp)) { fail(`${book}: no zone`); continue; }
  const zone = JSON.parse(gunzipSync(readFileSync(zp)).toString("utf8"));
  const zw = [], zm = [];
  for (const sec of zone.sections || []) for (const w of sec.words || []) (w.mark ? zm : zw).push(w);
  let off = 0;
  if (zw.length !== places.length) fail(`${book}: the zone has ${zw.length} words, the lane ${places.length} places`);
  places.forEach((r, i) => { if (!zw[i] || zw[i].s !== r.s) off += 1; });
  let offM = 0;
  if (zm.length !== mws.length) fail(`${book}: the zone has ${zm.length} marks, the lane ${mws.length} mark words`);
  mws.forEach((r, i) => { if (!zm[i] || zm[i].s !== r.s) offM += 1; });
  if (off || offM) fail(`${book}: ${off} places and ${offM} mark words are not the zone's word at their number`);
  books[book] = { places: places.length, mark_words: mws.length, mismatched: off + offM };
}
const bookN = Object.keys(books).length;
if (bookN !== counts.books) fail(`${bookN} books read, the lane counts ${counts.books}`);

// per kind of word: a code point is a mark where every class it is given is a
// mark class, not one where none is, and a failure where they disagree
const gold = {}, verdict = {};
for (const kind of ["places", "mark_words"]) {
  gold[kind] = []; verdict[kind] = {};
  for (const [cp, m] of [...seen[kind]].sort()) {
    const cls = [...m.keys()].sort(), marks = cls.filter((c) => markClasses.has(c));
    verdict[kind][cp] = Object.fromEntries([...m].sort());
    if (marks.length && marks.length !== cls.length) { fail(`${kind}: U+${cp} is ${cls.join(" and ")}, mark and not`); continue; }
    if (marks.length) gold[kind].push(cp);
  }
}
const want = { characters_places: tally.places.characters, characters_mark_words: tally.mark_words.characters, marks: tally.places.marks };
if (want.characters_places !== counts.characters_places) fail(`${want.characters_places} characters in places, the lane counts ${counts.characters_places}`);
if (want.characters_mark_words !== counts.characters_mark_words) fail(`${want.characters_mark_words} characters in mark words, the lane counts ${counts.characters_mark_words}`);
if (want.marks !== counts.marks) fail(`${want.marks} marks in places, the lane counts ${counts.marks}`);
if (bad) { console.log(`${bad} failure(s); nothing written`); process.exit(1); }

const out = {
  schema_version: "MASORETIC_MARKS_V1", rule_id: RULE, candidate_only: true,
  relay: "FOR-ELIJAH-v72.2.1.md", ledger: "moses-masoretic-marks-v1 build-v1.2",
  from: { classes: C.from, counts: N.from, mark_words: MWF.from, books: bookFiles },
  ruled: "Moses, relaying the owner, 11 October 2026: \"Colour by class, never by code point range. The owner's vote: every mark gold, vowels included.\"",
  mark_classes: { places: Object.keys(counts.marks_by_class).sort(), mark_words: MARK_WORD_MARKS },
  keyed_by: "gold.places: the code points (hex, no U+) that are marks wherever they stand in a word of the 39 books; gold.mark_words: the same in the marks the zone draws between the words. Every other code point of those books is not a mark.",
  gold,
  classes_seen: verdict,
  books: Object.keys(books).sort(),
  counts: { books: bookN, places: Object.values(books).reduce((a, b) => a + b.places, 0), mark_words: Object.values(books).reduce((a, b) => a + b.mark_words, 0),
    characters_places: tally.places.characters, marks_places: tally.places.marks, characters_mark_words: tally.mark_words.characters, marks_mark_words: tally.mark_words.marks,
    mismatched: 0, disagreeing_code_points: 0 },
};
writeFileSync(OUT, JSON.stringify(out, null, 1) + "\n");
console.log(`  ok  ${bookN} books, ${out.counts.places} places and ${out.counts.mark_words} mark words laid on the zones; ${out.counts.marks_places} marks of ${out.counts.characters_places} characters in the words, ${out.counts.marks_mark_words} of ${out.counts.characters_mark_words} in the mark words; ${gold.places.length} + ${gold.mark_words.length} code points gold`);
