#!/usr/bin/env node
// RUN: tree
// GUARDS: place-answers-rule-v1-a-reading-stands-at-a-word-only-where-a-source-puts-it-there-by-that-sources-own-address
// LEDGER: -
// no frame letter. A check reads the second reader's files, the places, the
// entries, the bridges and the zones, and judges; it writes nothing.
//
// THE SECOND READER'S FILES SAY ONLY WHAT THE PLACES AND THE ENTRIES SAY
// (27 November 2026, the fresh build). data/place-answers-v1/page/ is what
// reader/place.html fetches: a file a chapter, and the dictionaries by STEP
// tag. tools/project-place-answers-page-v1.mjs projects it by rule. This
// holds it, with the places, the entries and the bridges open beside it:
//
//   G1  the pin is a pin of the page's files; it was made from the two
//       parts' pins as they stand; every file it counts is there with the
//       bytes it names, and no file stands there that it does not count
//   G2  every chapter of every book has its file, and the index lists them
//   G3  every entry of our text stands in its verse in order, as the zone
//       writes it: each word, each scribal mark, each form of a pair
//   G4  every STEP string is the string of the places: the rows met, each
//       part's English, tag, root mark and Hebrew, how the word meets them,
//       the language its rows say (t.lg);
//       and the line under the word is the reader's own line for those parts
//       (tools/gloss-store-v1.mjs), carried only where a sign is hidden
//   G5  every MACULA string is the string of the places
//   G6  every sense said to cite a place is found again by its address: the
//       verse bridge lists it under that verse (and, for the UBS dictionary,
//       at that word number); the tag reaches its entry by the tag bridge
//       (or the entry's lemma is MACULA's for the morph); its words are the
//       entry's own. And no BDB sense the two bridges give for a word is
//       left out. A paragraph of the unabridged BDB is said to cite a place
//       only where its own headword has the letters of the word's lemma
//       (STEP's brief lexicon's headword for the number, read without what
//       stands in its square brackets: the other words of a combination the
//       number is one word of; the Lexical Index's; or MACULA's lemma for a
//       morph that carries the number):
//       every line said passes that test, every citing paragraph that passes
//       it is said, and the records that are a word's by MACULA's lemma
//       alone are named on its form. The test is coded here again, apart
//       from the projection's. Every headword of STEP's that carries a square
//       bracket has a relation said in the file's own column and letters left
//       outside the brackets, and they are the headwords the pin names.
//       A citing paragraph of a record that says it is of the other language
//       than the word's is not said, and the form names those records (ol):
//       the word's language for a number is what STEP's row at this word says
//       in its grammar column (H or A), else what its lexicon's morph column
//       says (H: or A:); all of it is read here again. Each unabridged line
//       carries the stem its reference stands under (the entries' stem
//       headings, the verse bridge's placing), the point's labels or none in
//       a stem's own head, the italics of its stretch (each with its kind), and the mark of a label
//       that names another stem; where a verse stands in a stem's head and in
//       a point of that stem, the point's line leads. A paragraph BDB numbers
//       otherwise (its «II.») than the Open Scriptures entry the number
//       reaches exactly (mod="I") is BDB's own reading: drawn, with its
//       numeral, its gloss and the entry's numeral, unless its quote names
//       another word of the verse, or every reference of it is BDB's pointer
//       elsewhere («see» or «read» after it, over references only, not «see
//       also» or «see» and a reference; or a bracket around it naming a
//       homonym of a numeral not the record's), or another word of the
//       verse holds the same paragraph as its own numeral's. Where the number stands at two
//       or more words of the verse, a line every reference of which quotes,
//       right before it, the letters of another of those words (a proclitic
//       or two allowed off our word; the file's maqaf-joined words parted;
//       a run of another verse's words naming none) is not this word's, and
//       one no quote parts carries how many words the number stands on. The
//       lines are made again here, in order, and must be the page's
//   G7  the sentences that say how the two editions meet are the rule's
//       sentences for the places' record of the word, and no others
//   G8  every tag of STEP's stands in the one file its number names, with
//       the bridge's own line; every entry it reaches stands beside it and is
//       the entry of entries/ with only the named keys left out
//   G9  every record of the unabridged BDB stands whole in the one file its
//       number names
//   G10 the index says what the bridge and the pins say
//   G11 the counts, counted again, are the pin's
//
// What it shares with the projection (tools/place-answers-page-v1.mjs): the
// shape, the keys left out, how a file is named, the label of a BDB sense,
// and the sentences of G7. What it does NOT share: the finding of a sense at
// a place. G6 looks each one up again from the page file's own statement.
//
// Exit 0 when everything holds, 1 otherwise, 3 where the page's files have
// not been made on this disk.
//
// Run: node tools/check-place-answers-page-v1.mjs [--dir data/place-answers-v1] [--page <folder>] [--zones data/zones]
//   --page  judge another folder of page files (a spoiled copy) against the same places and entries
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BOOKS, readZone } from "./place-answers-sources-v1.mjs";
import { openPlaces } from "./place-answers-places-v1.mjs";
import { printedForm, signOnly, joinDrawn, SIGN_GAP } from "./gloss-store-v1.mjs";
import { CHAPTER_SCHEMA, TAGS_SCHEMA, UNABRIDGED_SCHEMA, INDEX_SCHEMA, PAGE_PIN_SCHEMA, DICTIONARIES, INLINE, LEFT_OUT, tagFile, unabridgedFile, isStepsOwn, meetingWords, bdbSenseLabel, OPENING_KINDS } from "./place-answers-page-v1.mjs";
import { STEM_NAMES } from "./place-answers-entries-unabridged-bdb-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const argv = process.argv.slice(2);
let DIR = join(K3, "data", "place-answers-v1"), ZONES = join(K3, "data", "zones"), PAGE = null;
for (let i = 0; i < argv.length; i += 1) {
  if (argv[i] === "--dir") { DIR = argv[i + 1]; i += 1; } else if (argv[i] === "--zones") { ZONES = argv[i + 1]; i += 1; } else if (argv[i] === "--page") { PAGE = argv[i + 1]; i += 1; }
  else { console.error("usage: check-place-answers-page-v1.mjs [--dir <place answers folder>] [--page <folder>] [--zones <zones folder>]"); process.exit(2); }
}
PAGE = PAGE || join(DIR, "page");
if (!existsSync(join(PAGE, "PIN.json")) || !existsSync(join(DIR, "places")) || !existsSync(join(DIR, "entries"))) { console.log(`SKIPPED: the second reader's files are not made on this disk (${PAGE}); tools/make-place-answers-v1.sh <sources folder> makes them`); process.exit(3); }

let bad = 0; const notes = {};
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
/** A law's failures, kept by law: the first few are printed with the law. */
const miss = (law, what) => { (notes[law] ||= []).push(what); };
const verdict = (law, name, good) => { const f = notes[law] || []; check(`${law} ${name}`, f.length === 0, f.length ? `${f.length.toLocaleString("en-US")} — ${f.slice(0, 4).join(" ¦ ")}${f.length > 4 ? " ¦ …" : ""}` : good); };
const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const readGz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const N = (x) => Number(x).toLocaleString("en-US");

// ---- the sources, opened beside the page's files
const bridge = readGz(join(DIR, "bridges", "step-tag-to-entry.json.gz"));
const VERSES = {}; for (const k of ["openscriptures_bdb_1906", "unabridged_bdb_1906", "ubs_sdbh_hebrew_v0_9_2"]) VERSES[k] = readGz(join(DIR, "bridges", `verse-to-sense-${k}.json.gz`)).verses;
const ENTRIES = {}; for (const k of DICTIONARIES) ENTRIES[k] = readGz(join(DIR, "entries", `${k}.json.gz`)).entries;
const pin = JSON.parse(readFileSync(join(PAGE, "PIN.json"), "utf8"));
const index = existsSync(join(PAGE, "index.json")) ? JSON.parse(readFileSync(join(PAGE, "index.json"), "utf8")) : {};

// ---- G1 the pin and the files
{
  check("G1 the pin is a pin of the page's files", pin.schema === PAGE_PIN_SCHEMA, String(pin.schema));
  for (const rel of ["places/PIN.json", "entries/PIN.json"]) { const buf = readFileSync(join(DIR, rel)); const m = (pin.made_from || {})[rel]; if (!m || m.sha256 !== sha256(buf) || m.bytes !== buf.length) miss("G1", `${rel} is not the pin the page's files were made from`); }
  const all = []; const walk = (d, rel) => { for (const n of readdirSync(d).sort()) { const p = join(d, n); if (statSync(p).isDirectory()) walk(p, `${rel}${n}/`); else if (`${rel}${n}` !== "PIN.json") { const buf = readFileSync(p); all.push([`${rel}${n}`, buf.length, sha256(buf)]); } } };
  walk(PAGE, ""); all.sort((a, b) => (a[0] < b[0] ? -1 : 1));
  const roll = (list) => sha256(Buffer.from(list.map(([rel, bytes, sum]) => `${rel}\t${bytes}\t${sum}\n`).join(""), "utf8"));
  const group = (name, test, want) => { const list = all.filter(([rel]) => test(rel)); if (!want || want.files !== list.length || want.bytes !== list.reduce((a, x) => a + x[1], 0) || want.sha256_of_the_list !== roll(list)) miss("G1", `${name}: the files on disk are not the files the pin counts`); return list.length; };
  const m = pin.made || {};
  const nCh = group("the chapters", (rel) => /^[a-z-]+\/\d+\.json\.gz$/u.test(rel), m.chapters);
  for (const [book] of BOOKS) group(`the chapters of ${book}`, (rel) => rel.startsWith(`${book}/`), (m.chapters_by_book || {})[book]);
  const nT = group("the tag files", (rel) => rel.startsWith("entries/t/"), m.tag_files), nU = group("the unabridged BDB's files", (rel) => rel.startsWith("entries/u/"), m.unabridged_files);
  const ix = all.find(([rel]) => rel === "index.json"); if (!ix || !m["index.json"] || m["index.json"].sha256 !== ix[2]) miss("G1", "index.json is not the file the pin names");
  if (all.length !== nCh + nT + nU + 1) miss("G1", `${all.length - nCh - nT - nU - 1} files stand in the folder that the pin does not count`);
  verdict("G1", "the pin was made from the two parts' pins as they stand, and counts every file there", `${N(nCh)} chapters, ${N(nT)} tag files, ${N(nU)} unabridged BDB files, the index`);
}

// ---- G2 to G7, book by book
const counts = { books: 0, chapters: 0, verses: 0, words: 0, marks: 0, forms: 0, forms_with_steps_parts: 0, forms_with_maculas_morphs: 0, words_where_the_editions_differ: 0, sentences: 0,
  here: { ubs_at_this_very_word_by_the_tags_entry: 0, ubs_at_this_very_word_by_maculas_lemma: 0, ubs_at_the_verse_another_word_number: 0, ubs_at_the_verse_no_word_of_maculas: 0, bdb_open_scriptures_at_the_verse: 0, bdb_unabridged_at_the_verse: 0, words_with_a_ubs_sense_at_this_very_word: 0, words_with_any: 0 },
  steps_rows_no_word_of_ours_meets: 0,
  lines_under_a_word_with_a_sign_hidden: 0,
  headword: { unabridged_lines_not_drawn_under_a_number_of_one_record: 0, unabridged_lines_not_drawn_under_a_number_of_several_records: 0, unabridged_lines_drawn_by_maculas_lemma_alone: 0, words_where_a_line_is_not_drawn: 0, forms_with_a_record_by_maculas_lemma_alone: 0,
    words_under_a_number_of_several_records: { one_record_is_the_words: 0, several_are: 0, none_is: 0 }, steps_headwords_read_without_their_square_brackets: {} },
  language: { unabridged_lines_not_drawn_under_a_number_of_one_record: 0, unabridged_lines_not_drawn_under_a_number_of_several_records: 0, words_where_a_line_is_not_drawn: 0, words_under_a_number_of_several_records: { one_record_is_the_words: 0, several_are: 0, none_is: 0 },
    where_the_language_is_read: { steps_row: 0, the_lexicon: 0, neither: 0 }, forms_with_a_record_of_the_other_language: 0, forms_whose_rows_say: { h: 0, a: 0 } },
  numeral: { unabridged_lines_of_another_numeral_under_a_number_of_one_record: 0, unabridged_lines_of_another_numeral_under_a_number_of_several_records: 0, words_with_such_a_line: 0,
    drawn_as_bdbs_reading_of_this_word: 0, withheld_bdb_names_another_word: 0, drawn_neither_can_be_told: 0, withheld_bdbs_pointer_to_another_entry: 0, withheld_another_word_holds_it_as_its_own: 0, words_under_a_number_of_several_records: { one_record_is_the_words: 0, several_are: 0, none_is: 0 } },
  recurring: { lines_withheld: 0, the_named_word_already_holds_the_line: 0, the_named_words_tests_do_not_draw_it: 0, lines_marked: 0, words_with_a_marked_line: 0, words_with_a_line_withheld: 0 },
  stems: { unabridged_lines_under_a_stem_in_a_point: 0, unabridged_lines_in_a_stems_own_head: 0, unabridged_lines_under_no_stem: 0, lines_whose_points_label_names_another_stem: 0, words_where_a_stems_head_line_follows_a_point_line_of_its_stem: 0, pair_lines_taken_off_the_form_whose_stem_they_are_not: 0, pairs_whose_lines_are_parted: 0 } };
const held = { zone: 0, step: 0, macula: 0, here: 0, sentences: 0 };
const KIND = ["plain", "written and read", "written, not read", "read, not written"];
const lettersOf = (x) => Array.from(String(x || "")).filter((ch) => { const c = ch.codePointAt(0); return c >= 0x5d0 && c <= 0x5ea; }).join("");
const ubsEntryOf = (lexid) => ENTRIES.ubs_sdbh_hebrew_v0_9_2[`${lexid.slice(0, 6)}000000000`];
// ---- the headword test, coded here apart from the projection: letters are the consonants, the five end-of-word shapes folded
const FOLD = new Map([[0x5da, 0x5db], [0x5dd, 0x5de], [0x5df, 0x5e0], [0x5e3, 0x5e4], [0x5e5, 0x5e6]]);
const folded = (s) => { let o = ""; for (const ch of String(s || "")) { const c = ch.codePointAt(0); if (c >= 0x5d0 && c <= 0x5ea) o += String.fromCodePoint(FOLD.get(c) || c); } return o; };
/** A headword of STEP's without what stands in its square brackets (read here letter by letter, apart from the projection's). */
const outsideBrackets = (s) => { let o = "", depth = 0; for (const ch of String(s || "")) { if (ch === "[") depth += 1; else if (ch === "]") { if (depth) depth -= 1; o += " "; } else if (!depth) o += ch; } return o; };
// every headword of STEP's brief lexicon that carries a square bracket, with its relation column; each must say a relation and keep letters outside the brackets
for (const id of Object.keys(ENTRIES.stepbible_tbesh_gloss).sort()) { const e = ENTRIES.stepbible_tbesh_gloss[id]; const h = String(e.Hebrew || ""); if (!h.includes("[") && !h.includes("]")) continue;
  counts.headword.steps_headwords_read_without_their_square_brackets[id] = e.relation || "";
  if (!e.relation) miss("G6", `${id}: STEP's headword carries square brackets and its relation column says nothing`);
  if (!folded(outsideBrackets(h))) miss("G6", `${id}: STEP's headword has no letter outside its square brackets`); }
const LEMMAS = new Map();
/** The letters of a number's lemma as STEP's brief lexicon (its headword outside its square brackets) and the Lexical Index give it. */
const lemmaSet = (tag) => { let s = LEMMAS.get(tag); if (s) return s; s = new Set(); const row = bridge.tags[tag];
  if (row) { for (const id of row.stepbible_tbesh_gloss.slice(1)) { const L = folded(outsideBrackets((ENTRIES.stepbible_tbesh_gloss[id] || {}).Hebrew)); if (L) s.add(L); } for (const id of row.openscriptures_lexical_index.slice(1)) { const L = folded((ENTRIES.openscriptures_lexical_index[id] || {}).w); if (L) s.add(L); } }
  LEMMAS.set(tag, s); return s; };
/** MACULA's lemma letters for the number at a word: its morphs that carry the number. */
const maculaSet = (tag, mo) => { const s = new Set(); if (!mo || mo.way === 0 || mo.letters === "another word") return s; const n = Number(tag.slice(1, 5)); for (const x of mo.morphs) if (Number.parseInt(x.strongnumberx, 10) === n) { const L = folded(x.lemma); if (L) s.add(L); } return s; };
const headOf = (e, para) => { const b = e.blocks[para]; return b && b.head.headword ? folded(b.head.headword.t) : ""; };
const parasOf = (e, set) => { const out = []; e.blocks.forEach((b, i) => { const L = b.head.headword ? folded(b.head.headword.t) : ""; if (L && set.has(L)) out.push(i); }); return out; };
const ownOfTag = (tag) => { const o = {}; const row = bridge.tags[tag]; for (const id of row ? row.unabridged_bdb_1906.slice(1) : []) { const ps = parasOf(ENTRIES.unabridged_bdb_1906[id], lemmaSet(tag)); if (ps.length) o[id] = ps; } return o; };
// ---- the declared language, read here apart from the projection: STEP's morph column (every part opens with H: or A:), the record's own line
const TAG_LANG = new Map();
const langOfTag = (tag) => { if (TAG_LANG.has(tag)) return TAG_LANG.get(tag); const row = bridge.tags[tag]; const seen = new Set(); for (const id of row ? row.stepbible_tbesh_gloss.slice(1) : []) for (const part of String((ENTRIES.stepbible_tbesh_gloss[id] || {}).Morph || "").split("+")) { const at = part.indexOf(":"); seen.add(at < 0 ? "?" : part.slice(0, at)); } const lg = seen.size === 1 && seen.has("H") ? "h" : seen.size === 1 && seen.has("A") ? "a" : null; TAG_LANG.set(tag, lg); return lg; };
const langOfRecord = (id) => { const s = ENTRIES.unabridged_bdb_1906[id].language; return s === "BIBLICAL HEBREW" ? "h" : s === "BIBLICAL ARAMAIC" ? "a" : null; };
/** The language STEP's rows say for the parts given (each part carries its row's: H or A): "h", "a", or null. */
const rowsSay = (parts) => { let h = false, a = false; for (const p of parts) { if (p.lang === "H") h = true; else if (p.lang === "A") a = true; } return h && !a ? "h" : a && !h ? "a" : null; };
/** The word's language for a number: STEP's row at this word, else the lexicon. */
const wordLang = (tag, o) => rowsSay(o.parts.filter((p) => p.tag === tag)) || langOfTag(tag);
const otherLanguage = (lg, id) => { const b = langOfRecord(id); return lg !== null && b !== null && lg !== b; };
/** The stem's name a label opens with (the longest of the file's names), or null. */
const LONGEST_FIRST = STEM_NAMES.slice().sort((a, b) => b.length - a.length);
const labelOpensWith = (label) => { const t = String(label || "").replace(/^\s+/, "").replace(/^verb\s*/, ""); return LONGEST_FIRST.find((n) => t.startsWith(n)) || null; };
/** BDB's homonym numeral of the Open Scriptures entry a number reaches exactly, read here from the entry's own attribute. */
const NUM = new Map();
const numeralHere = (tag) => { if (NUM.has(tag)) return NUM.get(tag); const os = ((bridge.tags[tag] || {}).openscriptures_bdb_1906 || []).slice(1); let m = null; if (os.length === 1) { const x = (ENTRIES.openscriptures_bdb_1906[os[0]] || {}).x; if (Array.isArray(x) && x[1] && typeof x[1].mod === "string") m = x[1].mod; } NUM.set(tag, m); return m; };
/** The number's own records (by headword) whose own paragraphs bear a numeral and none the entry's. */
const anotherNumeral = (tag) => { const m = numeralHere(tag); if (!m) return []; const own = ownOfTag(tag); return Object.keys(own).filter((id) => { const ns = own[id].map((p) => ENTRIES.unabridged_bdb_1906[id].blocks[p].head.numeral).filter((n) => !!n); return ns.length > 0 && !ns.includes(m); }); };
/** Letters of a quoted word or of our word, read here: consonants, end shapes folded. A word of ours also counts without one
 *  or two leading letters of vav, he, bet, kaf, lamed, mem, shin (the one-letter words BDB's quotes leave off), two letters at least left. */
const LEAD = "\u05d5\u05d4\u05d1\u05db\u05dc\u05de\u05e9";
const oursVariants = (L) => { const out = [L]; if (L.length > 2 && LEAD.includes(L[0])) { out.push(L.slice(1)); if (L.length > 3 && LEAD.includes(L[1])) out.push(L.slice(2)); } return out; };
/** Whether BDB sends the verse of reference ki elsewhere, read here on the paragraph's text with the references marked
 *  (\u0001 any, \u0002 this one): a «read», or a «see» not before «also» or a reference, after this one over references
 *  and separators only; or an open bracket left unclosed before it, whose bracket names a numeral not the record's. */
const PARA_EDGES = ["<div", "</div", "<p", "</p", "<hr", "<br"];
function bdbSendsElsewhere(k, ki, own) {
  const edge = (p) => Array.isArray(p) && p[0] === "<" && PARA_EDGES.some((e) => p[1].toLowerCase().startsWith(e) && !/[a-z]/.test(p[1].charAt(e.length)));
  let a = ki; while (a > 0 && !edge(k[a - 1])) a--; let z = ki; while (z + 1 < k.length && !edge(k[z + 1])) z++;
  const text = k.slice(a, z + 1).map((p, i) => (typeof p === "string" ? p : p[0] === "ref" ? (a + i === ki ? "\u0002" : "\u0001") : p[0] === "<" || p[0] === "sup" ? "" : String(p[1] ?? ""))).join("");
  const at = text.indexOf("\u0002"); const after = text.slice(at + 1);
  if (/^(?:[\s,;:]|\u0001)*(?:read\b|see\b(?!\s*also\b)(?!\s*\u0001))/i.test(after)) return true;
  const stack = []; for (let i = 0; i < at; i++) { const c = text[i]; if (c === "(" || c === "[") stack.push(i); else if ((c === ")" || c === "]") && stack.length) stack.pop(); }
  if (!stack.length) return false;
  let level = stack.length, end = text.length; for (let i = at + 1; i < text.length; i++) { const c = text[i]; if (c === "(" || c === "[") level++; else if (c === ")" || c === "]") { level--; if (level === 0) { end = i; break; } } }
  const inside = text.slice(stack[0], end);
  for (const m of inside.matchAll(/(?<![A-Za-z])(V|IV|III|II|I)\.\s*[\u05d0-\u05ea\u05f3]/g)) if (m[1] !== own) return true;
  return false;
}
/** The run a record quotes right before piece ki, word by word (a word the file joins with its maqaf mark, U+05BF on the
 *  next word's first letter, read as two), or null. */
function quoteBefore(k, ki) {
  const out = [];
  for (let j = ki - 1; j >= 0; j--) {
    const p = k[j];
    if (typeof p === "string") { if (/^[\s,;:=.]*$/.test(p)) continue; break; }
    if (p[0] === "<") { if (/^<\/?(lookup|sup|reflink)/.test(p[1])) continue; break; }
    if (p[0] === "sup" || p[0] === "lookup") continue;
    if (p[0] !== "bdbheb" && p[0] !== "bdbarc") break;
    const here = []; let cur = "";
    for (const ch of p[1]) { const c = ch.codePointAt(0);
      if (/\s/.test(ch) || c === 0x5be) { if (folded(cur)) here.push(folded(cur)); cur = ""; continue; }
      if (c === 0x5bf && cur) { const last = [...cur]; let i = last.length - 1; while (i >= 0 && !(last[i].codePointAt(0) >= 0x5d0 && last[i].codePointAt(0) <= 0x5ea)) i--; if (i > 0) { const before = last.slice(0, i).join(""); if (folded(before)) here.push(folded(before)); cur = last.slice(i).join(""); } }
      cur += ch; }
    if (folded(cur)) here.push(folded(cur));
    out.unshift(...here);
  }
  return out.length ? out : null;
}
/** A verb's stem by STEP's grammar (V and the stem's letter; the Open Scriptures codes), and BDB's names of the stems as
 *  the same words: tables of this check's own. */
const HEB_LETTERS = { q: "qal", N: "niphal", p: "piel", P: "pual", h: "hiphil", H: "hophal", t: "hithpael", o: "polel", O: "polal", r: "hithpolel", m: "poel", M: "poal", k: "palel", K: "pulal", Q: "qal passive", l: "pilpel", L: "polpal", f: "hithpalpel", D: "nithpael", j: "pealal", i: "pilel", u: "hothpaal", c: "tiphil", v: "hishtaphel", w: "nithpalel", y: "nithpoel", z: "hithpoel" };
const ARC_LETTERS = { q: "peal", Q: "peil", u: "hithpeel", p: "pael", P: "ithpaal", M: "hithpaal", a: "aphel", h: "haphel", s: "saphel", e: "shaphel", H: "hophal", i: "ithpeel", t: "hishtaphel", v: "ishtaphel", w: "hithaphel", o: "polel", z: "ithpoel", r: "hithpolel", f: "hithpalpel", b: "hephal", c: "tiphel", m: "poel", l: "palpel", L: "ithpalpel", O: "ithpolel", G: "ittaphal" };
const verbStemOf = (lang, gram) => (typeof gram === "string" && gram.startsWith("V") ? (lang === "A" ? ARC_LETTERS : HEB_LETTERS)[gram[1]] || null : null);
const BDB_STEM_WORD = { "Qal passive": "qal passive", Qal: "qal", "Niph`al": "niphal", "Pi`el": "piel", Piel: "piel", "Pu`al": "pual", Pual: "pual", "Hiph`il": "hiphil", "Hoph`al": "hophal", "Hithpa`el": "hithpael", "Hithpa.": "hithpael", "Hitph.": "hithpael",
  "Pe`al": "peal", "Pa`el": "pael", "Haph`el": "haphel", "Aph`el": "aphel", "Hithpo`el": "hithpoel", "Hithpo`l.": "hithpolel", Pilpel: "pilpel", "Hithpe`el": "hithpeel", "Ithpe`el": "ithpeel", "Po`el": "poel", "Po`\u00eal": "poel", "P\u00f4`el": "poel",
  Hithpalpel: "hithpalpel", "Po.": "poel", "Po`l.": "polel", "Pol.": "polel", "Pe`il": "peil", "Pe`\u00eel": "peil", "Hithpo`lel": "hithpolel", "Po`.": "poel", Hithpolel: "hithpolel", "Po`al": "poal", "Po`lel": "polel", "P\u00f4`lel": "polel", Polel: "polel",
  "Pol`el": "polel", "Po`lal": "polal", "Hothpa`al": "hothpaal", "Pi`lel": "pilel", "Pil`el": "pilel", "Pe`al`al": "pealal", "Ithpa`al": "ithpaal", "Hithpa`al": "hithpaal", "Shaph`el": "shaphel", "Pu`lal": "pulal", "Nithp.": "nithpael", "Tiph`el": "tiphel",
  "Pil.": "pilel", Polpal: "polpal", Palpel: "palpel", "Pa`lel": "palel", "Hithpa`lel": "hithpalel", "Ishtaph.": "ishtaphel", "Hishtaph`el": "hishtaphel", Pilel: "pilel", Pulal: "pulal", Polal: "polal" };
for (const n of STEM_NAMES) if (!BDB_STEM_WORD[n]) { console.log(`FAIL  the check has no word for the stem «${n}»`); process.exit(1); }
/** An unabridged line made again: the unit, the stem heading, the stretch its italics are taken from. */
function lineAgain(id, x, tag, n) {
  const e = ENTRIES.unabridged_bdb_1906[id]; const [, para, point, sub, , st, inHead] = x; const blk = e.blocks[para];
  const pt = point >= 0 ? blk.points[point] : null; const sb = sub >= 0 ? (pt || blk.head).sub[sub] : null; const u = sb || pt || blk.head;
  const hs = blk.stems || []; const h = st >= 0 ? hs[st] : null;
  const after = inHead ? h.k : u.k[0]; let hi = Infinity; for (const y of hs) if (y !== h && y.k > after && y.k < u.k[1]) { hi = y.k; break; }
  const its = (u.italics || []).filter((it) => it.k > (inHead ? h.k : -1) && it.k < hi && OPENING_KINDS.includes(it.kind)).slice(0, 3).map((it) => [it.t, it.kind]);
  const lp = inHead ? "" : pt ? pt.label || "" : "", lsb = inHead ? "" : sb ? sb.label || "" : "";
  const row = [id, para, point, sub, lp, lsb, its, blk.head.headword ? blk.head.headword.t : "", n, tag, h ? h.s : "", st, inHead];
  if (h && !inHead) { const named = labelOpensWith(lp); if (named && named !== h.s) row.push(1); }
  return row;
}
/** The lines of one number in the verse bridge's order, a stem's head line set after the last point line of its stem. */
function pointLeadsAgain(rows) {
  const keyed = rows.map((r, i) => ({ r, at: i }));
  for (const x of keyed) if (x.r[12]) { let last = -1; rows.forEach((y, j) => { if (!y[12] && y[0] === x.r[0] && y[1] === x.r[1] && y[11] === x.r[11]) last = j; }); if (last > x.at) x.at = last + 0.5; }
  return keyed.sort((a, b) => a.at - b.at).map((x) => x.r);
}
const indexBooks = new Map((index.books || []).map((b) => [b.book, b]));
for (const [book] of BOOKS) {
  const zoneFile = join(ZONES, `${book}.bin`); const zone = readZone(zoneFile); const rawZone = readGz(zoneFile);
  const P = openPlaces(join(DIR, "places", `${book}.json.gz`));
  const where0 = `${book}`;
  if (P.doc.zone.sha256 !== zone.sha256) miss("G3", `${book}: the places were made from another zone`);
  const chapters = [...new Set(zone.sections.map((s) => s.ch))];
  const dirOf = join(PAGE, book); const have = existsSync(dirOf) ? readdirSync(dirOf).filter((n) => /^\d+\.json\.gz$/u.test(n)).map((n) => Number(n.split(".")[0])).sort((a, b) => a - b) : [];
  if (!same(have, chapters.slice().sort((a, b) => a - b))) miss("G2", `${book}: its chapter files are ${have.length}, its chapters ${chapters.length}`);
  const ib = indexBooks.get(book); if (!ib || !same(ib.chapters, chapters) || ib.title !== zone.work) miss("G2", `${book}: the index does not list its chapters and its name as the zone has them`);
  const byline = String(rawZone.byline || ""); const cut = byline.indexOf(" · "); const credit = cut >= 0 ? byline.slice(0, cut) : byline;
  const says = {}; for (const sec of rawZone.sections) for (const w of sec.words || []) if (w.mark && w.mark.kind && w.mark.says && !says[w.mark.kind]) says[w.mark.kind] = w.mark.says;
  const unmet = new Map(); for (const i of P.doc.step.unmet || []) { const r = P.stepRow(i); if (!unmet.has(r.verse)) unmet.set(r.verse, []); unmet.get(r.verse).push([r.ref, r.hebrew, r.translation]); }
  const V = { o: VERSES.openscriptures_bdb_1906[book] || {}, b: VERSES.unabridged_bdb_1906[book] || {}, u: VERSES.ubs_sdbh_hebrew_v0_9_2[book] || {} };
  let si = 0;
  for (const ch of chapters) {
    const f = join(dirOf, `${ch}.json.gz`); if (!existsSync(f)) { si += zone.sections.filter((s) => s.ch === ch).length; continue; }
    const doc = readGz(f); counts.chapters += 1;
    if (doc.schema !== CHAPTER_SCHEMA || doc.book !== book || doc.chapter !== ch || doc.title !== zone.work) miss("G3", `${where0} ${ch}: the file's head is not this chapter's`);
    if (doc.credit !== credit || !same(doc.marks, says)) miss("G3", `${where0} ${ch}: the credit line or the marks' words are not the zone's`);
    held.zone += 2 + Object.keys(says).length;
    const secs = zone.sections.filter((s) => s.ch === ch);
    if (secs.length !== (doc.verses || []).length) { miss("G3", `${where0} ${ch}: ${(doc.verses || []).length} verses in the file, ${secs.length} in the zone`); si += secs.length; continue; }
    secs.forEach((sec, vi) => {
      const v = doc.verses[vi]; const at = `${book} ${sec.label}`; counts.verses += 1;
      if (v.l !== sec.label) miss("G3", `${at}: the label is ${v.l}`);
      if (!same(v.un || [], unmet.get(sec.label) || [])) miss("G4", `${at}: STEP's rows no word of ours meets are not the places'`);
      counts.steps_rows_no_word_of_ours_meets += (v.un || []).length; held.step += 3 * (v.un || []).length;
      if (v.e.length !== sec.entries.length) { miss("G3", `${at}: ${v.e.length} entries in the file, ${sec.entries.length} in the zone`); si += 1; return; }
      const verseWords = [];
      sec.entries.forEach((en, ei) => {
        const pe = v.e[ei];
        if (en.mark) { counts.marks += 1; held.zone += 2; if (pe.m !== (en.mark === true ? "" : en.mark) || pe.s !== en.s || pe.f) miss("G3", `${at} entry ${ei}: the mark is not the zone's`); return; }
        counts.words += 1; held.zone += 1;
        const W = P.wordAt(si, ei);
        if (pe.i !== ei || pe.s !== en.s || !W || (pe.k || 0) !== KIND.indexOf(W.kind) || !Array.isArray(pe.f) || pe.f.length !== W.forms.length) { miss("G3", `${at} entry ${ei}: the word is not the zone's word with the places' kind and forms`); return; }
        let any = false, very = false, differs = false, notDrawn = false, notDrawnL = false, notDrawnN = false, leadsHere = false;
        const pairWant = [], pairHave = [], pairAt = [], pairHv = [];
        W.forms.forEach((fm, fi) => {
          const pf = pe.f[fi]; const atF = `${at} entry ${ei}${W.forms.length > 1 ? ` form ${fi}` : ""}`; counts.forms += 1;
          if ((pf.r || 0) !== ["plain", "read", "written"].indexOf(fm.role)) miss("G3", `${atF}: the form's role`);
          if (en.forms ? pf.s !== en.forms[fi].s : pf.s !== undefined) miss("G3", `${atF}: the form is not as the zone writes it`); else if (en.forms) held.zone += 1;
          // ---- G4 STEP
          const o = fm.role === "written" ? fm.step.written : fm.step.read; const t = pf.t; const dict = [];
          if (!o) { if (t) miss("G4", `${atF}: STEP is said where the places do not ask it`); }
          else if (!t) miss("G4", `${atF}: STEP's meeting is missing`);
          else {
            if (t.w !== o.way) miss("G4", `${atF}: the way of meeting is ${t.w}, the places' ${o.way}`);
            if (o.way === 0) { if (t.rows || t.p || t.other) miss("G4", `${atF}: rows are said where the places have none`); }
            else {
              if (!same(t.rows, o.rows.map((r) => r.ref))) miss("G4", `${atF}: STEP's rows are not the places'`); held.step += o.rows.length;
              const letters = o.letters === "same" ? undefined : o.letters === "another word" ? 1 : o.letters;
              if (t.l !== letters) miss("G4", `${atF}: the letters named are not the places'`);
              if (!!t.wf !== !!o.onWrittenForm || (t.vn || null) !== (o.verseNumberedOtherwise ? o.rows[0].verse : null)) miss("G4", `${atF}: the written form or the verse's number is not as the places say`);
              if ((t.lg || null) !== (o.letters === "another word" ? null : rowsSay(o.parts))) miss("G4", `${atF}: the language the form's rows say is not the places'`);
              if (t.lg) { counts.language.forms_whose_rows_say[t.lg] += 1; held.step += 1; }
              if (o.letters === "another word") { if (t.p || !same(t.other, o.parts.map((p) => [p.he, p.en === undefined ? null : p.en]))) miss("G4", `${atF}: where another word stands, STEP's word is not the places'`); held.step += 2 * o.parts.length; }
              else {
                const want = o.parts.map((p) => { const a = [p.en === undefined ? null : p.en, p.tag || null, p.root ? 1 : 0, p.he]; if (p.coversNext) a.push(1); return a; });
                if (!same(t.p, want)) miss("G4", `${atF}: STEP's parts are not the places' (${JSON.stringify(t.p).slice(0, 80)})`); held.step += 3 * o.parts.length; counts.forms_with_steps_parts += 1;
                for (const p of o.parts) if (p.tag && !isStepsOwn(p.tag) && !dict.includes(p.tag)) dict.push(p.tag);
              }
            }
            // ---- G7 the sentences
            const w = meetingWords({ kind: W.kind, role: fm.role, o, R: fm.raw.R, W: fm.raw.W });
            if (!same(t.say || [], w.say) || !!t.d !== w.differs) miss("G7", `${atF}: the sentences are not the rule's for the places' record`);
            counts.sentences += (t.say || []).length; held.sentences += (t.say || []).length; if (t.d) differs = true;
          }
          // ---- G5 MACULA
          const mo = fm.macula; const wantM = mo && mo.way !== 0 ? mo.morphs.map((x) => [x.gloss, x.english, x.text]) : null;
          const another = !!mo && mo.letters === "another word";
          if (!same(another ? pf.mo || null : pf.m || null, wantM) || (another ? pf.m : pf.mo)) miss("G5", `${atF}: MACULA's morphs are not the places'`);
          if (wantM) { held.macula += 3 * wantM.length; if (!another) counts.forms_with_maculas_morphs += 1; }
          // ---- G6 the senses that cite this place, each found again by its address
          const h = pf.h || {}; const stepStands = !!o && o.way !== 0 && o.letters !== "another word"; const hv = stepStands ? o.rows[0].verse : null;
          if (pf.h) any = true;
          const reached = (key) => { const s = new Set(); for (const tag of dict) for (const id of (bridge.tags[tag] || {})[key] ? bridge.tags[tag][key].slice(1) : []) s.add(id); return s; };
          for (const [id, path, label, defs, tag] of h.o || []) {
            counts.here.bdb_open_scriptures_at_the_verse += 1; held.here += 1 + defs.length;
            const e = ENTRIES.openscriptures_bdb_1906[id]; const row = bridge.tags[tag];
            const cited = (V.o[hv] || []).some((x) => x[0] === id && same(x[1], path));
            const mine = []; const seen = new Set(); if (e) for (const df of e.defs || []) { if (path === null ? df.sense : !same(df.sense, path)) continue; if (df.phrase) { if (seen.has(df.phrase.at)) continue; seen.add(df.phrase.at); } mine.push(df.phrase ? df.phrase.t : df.joined ? df.joined.whole : df.t); }
            if (!e || !dict.includes(tag) || !row || !row.openscriptures_bdb_1906.slice(1).includes(id) || !cited || label !== bdbSenseLabel(e, path) || !same(defs, mine)) miss("G6", `${atF}: BDB (Open Scriptures) ${id} is not found again at ${hv} under ${tag} with these words`);
          }
          for (const b of h.b || []) { counts.here.bdb_unabridged_at_the_verse += 1; held.here += 3 + b[6].length + (b[10] ? 1 : 0);
            counts.stems[b[11] < 0 ? "unabridged_lines_under_no_stem" : b[12] ? "unabridged_lines_in_a_stems_own_head" : "unabridged_lines_under_a_stem_in_a_point"] += 1; if (b[13]) counts.stems.lines_whose_points_label_names_another_stem += 1; }
          if (((h.b || []).some((b, i, all) => b[12] && all.slice(0, i).some((y) => !y[12] && y[0] === b[0] && y[1] === b[1] && y[11] === b[11])))) leadsHere = true;
          // no BDB sense the bridges give for the word is left out
          if (stepStands) {
            const wantO = new Set(), wantRows = []; const ro = reached("openscriptures_bdb_1906");
            for (const x of V.o[hv] || []) if (ro.has(x[0])) wantO.add(`${x[0]}|${x[1] ? x[1].join(".") : ""}`);
            // the unabridged BDB, number by number: a citing paragraph is wanted only where its headword has the lemma's letters
            for (const tag of dict) {
              const ids = new Set((bridge.tags[tag] || { unabridged_bdb_1906: [] }).unabridged_bdb_1906.slice(1)); const seenK = new Set(); const ms = maculaSet(tag, mo), ls = lemmaSet(tag); const rowsT = [];
              const lg = wordLang(tag, o);
              for (const x of V.b[hv] || []) {
                if (!ids.has(x[0])) continue; const k = `${x[0]}|${x[1]}|${x[5]}|${x[6] ? "head" : `${x[2]}|${x[3]}`}`; if (seenK.has(k)) continue; seenK.add(k);
                const L = headOf(ENTRIES.unabridged_bdb_1906[x[0]], x[1]);
                if (L && (ls.has(L) || ms.has(L))) {
                  // a record of the other language than the word's (STEP's row at this word, else the lexicon): not wanted
                  if (otherLanguage(lg, x[0])) { counts.language[ids.size > 1 ? "unabridged_lines_not_drawn_under_a_number_of_several_records" : "unabridged_lines_not_drawn_under_a_number_of_one_record"] += 1; notDrawnL = true; }
                  else { const r = lineAgain(x[0], x, tag, ids.size); const hd = ENTRIES.unabridged_bdb_1906[x[0]].blocks[x[1]].head;
                    // BDB numbers this paragraph another word of the same letters than the entry: drawn with the mark of its own reading
                    if (numeralHere(tag) && hd.numeral && hd.numeral !== numeralHere(tag)) { counts.numeral[ids.size > 1 ? "unabridged_lines_of_another_numeral_under_a_number_of_several_records" : "unabridged_lines_of_another_numeral_under_a_number_of_one_record"] += 1; notDrawnN = true;
                      for (let z = r.length; z < 15; z++) r.push(0); const runs = hd.italics || []; let gl = runs.filter((y) => y.kind === "main_gloss"); if (!gl.length) gl = runs.filter((y) => y.kind === "opening");
                      r.push({ another: hd.numeral, gloss: gl.slice(0, 3).map((y) => y.t), entry: numeralHere(tag) }); }
                    rowsT.push(r); if (!ls.has(L)) counts.headword.unabridged_lines_drawn_by_maculas_lemma_alone += 1; }
                }
                else { counts.headword[ids.size > 1 ? "unabridged_lines_not_drawn_under_a_number_of_several_records" : "unabridged_lines_not_drawn_under_a_number_of_one_record"] += 1; notDrawn = true; }
              }
              wantRows.push(...pointLeadsAgain(rowsT));
            }
            const haveO = new Set((h.o || []).map((x) => `${x[0]}|${x[1] ? x[1].join(".") : ""}`));
            if (wantO.size !== haveO.size || [...wantO].some((k) => !haveO.has(k))) miss("G6", `${atF}: the BDB senses that cite ${hv} under the word's tags are not all said`);
            pairWant[fi] = wantRows; pairHave[fi] = h.b || []; pairAt[fi] = atF; pairHv[fi] = hv;
            // the records of the other language at this word, named on the form
            const wantOl = []; for (const tag of dict) { const row = bridge.tags[tag]; if (!row) continue; const ids = row.unabridged_bdb_1906.slice(1); if (!ids.length) continue;
              const r = rowsSay(o.parts.filter((p) => p.tag === tag)); counts.language.where_the_language_is_read[r ? "steps_row" : langOfTag(tag) ? "the_lexicon" : "neither"] += 1;
              for (const id of ids) if (otherLanguage(r || langOfTag(tag), id) && !wantOl.includes(id)) wantOl.push(id); }
            if (!same(pf.ol || [], wantOl)) miss("G6", `${atF}: the records named as of the other language at this word are not the ones the word's language gives`);
            if (pf.ol) counts.language.forms_with_a_record_of_the_other_language += 1;
          } else { if ((h.o || []).length || (h.b || []).length) miss("G6", `${atF}: BDB is said where STEP's parts do not stand`); if (pf.ol) miss("G6", `${atF}: records of another language are named where STEP's parts do not stand`); }
          { // the records that are this word's by MACULA's lemma alone
            const want = []; for (const tag of dict) { const row = bridge.tags[tag]; if (!row) continue; const ms = maculaSet(tag, mo); if (!ms.size) continue; for (const id of row.unabridged_bdb_1906.slice(1)) { const e = ENTRIES.unabridged_bdb_1906[id]; if (!parasOf(e, lemmaSet(tag)).length && parasOf(e, ms).length && !want.includes(id)) want.push(id); } }
            if (!same(pf.ow || [], want)) miss("G6", `${atF}: the records that are this word's by MACULA's lemma alone are not as named`);
            if (pf.ow) counts.headword.forms_with_a_record_by_maculas_lemma_alone += 1; }
          const ubsReached = reached("ubs_sdbh_hebrew_v0_9_2");
          for (const [lexid, how, glosses, morph, n] of h.u || []) {
            counts.here[["ubs_at_this_very_word_by_the_tags_entry", "ubs_at_this_very_word_by_maculas_lemma", "ubs_at_the_verse_another_word_number", "ubs_at_the_verse_no_word_of_maculas"][how]] += 1; if (how < 2) very = true; held.here += 1 + glosses.length;
            const e = ubsEntryOf(lexid); let sense = null; if (e) for (const b of e.BaseForms || []) for (const m of b.LEXMeanings || []) if (m.LEXID === lexid) sense = m;
            const okWords = !!sense && same(glosses, ((sense.LEXSenses || [])[0] || {}).Glosses || []);
            // the verse the citation stands under: MACULA's own number of the word, or STEP's where MACULA has no word
            const mv = how === 3 ? hv : mo && mo.way !== 0 ? (/^\S+ (\d+:\d+)!/u.exec(mo.words[0].ref) || [])[1] : null;
            const cited = (V.u[mv] || []).some((x) => x[0] === lexid && x[1] === n);
            const eid = `${lexid.slice(0, 6)}000000000`;
            const okHow = how === 1 ? !!e && !!mo && mo.morphs.some((x) => x.text === morph && lettersOf(e.Lemma) !== "" && lettersOf(e.Lemma) === lettersOf(x.lemma)) && !ubsReached.has(eid)
              : how === 0 ? ubsReached.has(eid) && !!mo && mo.morphs.some((x) => x.text === morph)
              : how === 2 ? ubsReached.has(eid) && !!mo && mo.way !== 0
              : how === 3 ? ubsReached.has(eid) && (!mo || mo.way === 0) : false;
            if (!okWords || !cited || !okHow) miss("G6", `${atF}: the UBS sense ${lexid} is not found again (${!okWords ? "its words" : !cited ? `the verse ${mv} at word ${n}` : "how it reaches the word"})`);
          }
        });
        if (W.kind === "written and read" && W.forms.length === 2 && pairWant.length === 2) {
          // a written-and-read word: a line whose stem is the one form's by STEP's grammar and not the other's stands on that form only
          const st = W.forms.map((fm) => { const o = fm.role === "written" ? fm.step.written : fm.step.read; const set = new Set(); for (const p of (o && o.parts) || []) { const n = verbStemOf(p.lang, p.gram); if (n) set.add(n); } return set; });
          let off = 0; pairWant.forEach((rows, fi) => { if (!rows) return; pairWant[fi] = rows.filter((b) => { const n = BDB_STEM_WORD[b[10]] || null; const go = !!n && !st[fi].has(n) && st[1 - fi].has(n); if (go) off += 1; return !go; }); });
          counts.stems.pair_lines_taken_off_the_form_whose_stem_they_are_not += off; if (off) counts.stems.pairs_whose_lines_are_parted += 1;
        }
        // the comparison waits for the verse: a number at two or more of its words may take a line off this one
        const nums = new Set(); for (const fm of W.forms) { const o = fm.role === "written" ? fm.step.written : fm.step.read; if (o && o.way !== 0 && o.letters !== "another word") for (const p of o.parts) if (p.tag && !isStepsOwn(p.tag)) nums.add(p.tag.slice(0, 5)); }
        const lettersHere = new Set(); W.forms.forEach((fm, fi) => { for (const v2 of oursVariants(folded(en.forms ? en.forms[fi].s : en.s))) if (v2) lettersHere.add(v2); });
        verseWords.push({ ei, pairWant, pairHave, pairAt, pairHv, nums, lettersHere, words: W.forms.map((fm, fi) => String(en.forms ? en.forms[fi].s : en.s)) });
        if (any) counts.here.words_with_any += 1; if (very) counts.here.words_with_a_ubs_sense_at_this_very_word += 1; if (differs) counts.words_where_the_editions_differ += 1;
        if (notDrawn) counts.headword.words_where_a_line_is_not_drawn += 1;
        if (notDrawnL) counts.language.words_where_a_line_is_not_drawn += 1;
        if (notDrawnN) counts.numeral.words_with_such_a_line += 1;
        if (leadsHere) counts.stems.words_where_a_stems_head_line_follows_a_point_line_of_its_stem += 1;
        { // under each number of the word that reaches several unabridged records: how many are this word's
          const seenT = new Set();
          for (const pf of pe.f) for (const p of (pf.t || {}).p || []) {
            const row = p[1] ? bridge.tags[p[1]] : null; if (!row || row.unabridged_bdb_1906.length < 3 || seenT.has(p[1])) continue; seenT.add(p[1]);
            const mine = new Set(Object.keys(ownOfTag(p[1]))); for (const g of pe.f) for (const id of g.ow || []) if (row.unabridged_bdb_1906.includes(id)) mine.add(id);
            counts.headword.words_under_a_number_of_several_records[mine.size === 1 ? "one_record_is_the_words" : mine.size ? "several_are" : "none_is"] += 1;
            { const ol = new Set(pe.f.flatMap((g) => g.ol || [])); const on = new Set(anotherNumeral(p[1])); let n = 0, m = 0; for (const id of mine) if (!ol.has(id)) { n += 1; if (!on.has(id)) m += 1; } counts.language.words_under_a_number_of_several_records[n === 1 ? "one_record_is_the_words" : n ? "several_are" : "none_is"] += 1;
              counts.numeral.words_under_a_number_of_several_records[m === 1 ? "one_record_is_the_words" : m ? "several_are" : "none_is"] += 1; }
          }
        }
      });
      { // G6, a number at two or more words of the verse: BDB's quoted form names the word a line is
        const ours = new Set(); for (const w of verseWords) for (const t of w.words) for (const piece of t.split(/[\s\u05be]+/)) for (const v2 of oursVariants(folded(piece))) if (v2) ours.add(v2);
        const on = new Map(); for (const w of verseWords) for (const n of w.nums) { if (!on.has(n)) on.set(n, []); on.get(n).push(w); }
        const heldBefore = new Map(verseWords.map((w) => [w, w.pairWant.flatMap((r) => r || [])]));
        const sameLine = (a, b) => a[0] === b[0] && a[1] === b[1] && a[11] === b[11] && a[12] === b[12] && a[2] === b[2] && a[3] === b[3];
        for (const w of verseWords) {
          let withheld = false, marked = false;
          w.pairWant.forEach((rows, fi) => { if (!rows) return; const keep = [];
            for (const b of rows) {
              const list = on.get(b[9].slice(0, 5)) || []; const isN = !!b[15];
              if (isN) { const rs = (V.b[w.pairHv[fi]] || []).filter((x) => x[0] === b[0] && x[1] === b[1] && x[5] === b[11] && x[6] === b[12] && (b[12] === 1 || (x[2] === b[2] && x[3] === b[3])));
                if (rs.length && rs.every((x) => bdbSendsElsewhere(ENTRIES.unabridged_bdb_1906[b[0]].k, x[4], b[15].another))) { counts.numeral.withheld_bdbs_pointer_to_another_entry += 1; continue; }
                let held = false; for (const o of verseWords) if (o !== w && heldBefore.get(o).some((y) => y[0] === b[0] && y[1] === b[1] && !y[15])) held = true;
                if (held) { counts.numeral.withheld_another_word_holds_it_as_its_own += 1; continue; } }
              if (list.length < 2) { if (isN) counts.numeral.drawn_as_bdbs_reading_of_this_word += 1; keep.push(b); continue; }
              const refs = (V.b[w.pairHv[fi]] || []).filter((x) => x[0] === b[0] && x[1] === b[1] && x[5] === b[11] && x[6] === b[12] && (b[12] === 1 || (x[2] === b[2] && x[3] === b[3])));
              let mine = false, unknown = false; const named = new Set();
              for (const x of refs) { let q = quoteBefore(ENTRIES.unabridged_bdb_1906[b[0]].k, x[4]); if (q && q.filter((L) => !ours.has(L)).length >= 2) q = null;
                const hit = q ? list.filter((o) => q.some((L) => o.lettersHere.has(L))) : []; if (!hit.length) unknown = true; else if (hit.includes(w)) mine = true; else for (const o of hit) named.add(o); }
              if (!mine && !unknown && named.size) { counts.recurring.lines_withheld += 1; if (isN) counts.numeral.withheld_bdb_names_another_word += 1; withheld = true; for (const o of named) counts.recurring[heldBefore.get(o).some((y) => sameLine(y, b)) ? "the_named_word_already_holds_the_line" : "the_named_words_tests_do_not_draw_it"] += 1; continue; }
              const c = b.slice(); if (!mine) { if (c.length < 14) c.push(0); c[14] = list.length; counts.recurring.lines_marked += 1; marked = true; }
              if (isN) counts.numeral[mine ? "drawn_as_bdbs_reading_of_this_word" : "drawn_neither_can_be_told"] += 1;
              keep.push(c);
            }
            w.pairWant[fi] = keep; });
          if (withheld) counts.recurring.words_with_a_line_withheld += 1; if (marked) counts.recurring.words_with_a_marked_line += 1;
          w.pairWant.forEach((rows, fi) => { if (rows && !same(w.pairHave[fi], rows)) miss("G6", `${w.pairAt[fi]}: the unabridged BDB's lines are not the lines made again from the verse bridge, the stems, the entries, the pair's stems, the numeral and the verse's other words (${JSON.stringify(w.pairHave[fi][0] || null).slice(0, 120)})`); });
        }
      }
      { // G4, the lines under the words of the verse: the reader's rule (its own pieces, signs and joiner), judged over
        // the words a maqaf ties, coded here apart from the projection. A mark ends a run; a pair's other form stands alone.
        const want = new Map();
        const pcs = (f) => { const tx = printedForm(((f.t || {}).p || []).map((p) => (p[0] === null ? "" : p[0])).join("/")); return tx ? tx.split(" + ") : []; };
        const judge = (fs) => { const P2 = fs.map(pcs); const stand = P2.flat().every(signOnly); fs.forEach((f, i) => want.set(f, joinDrawn(stand ? P2[i] : P2[i].map((x) => (signOnly(x) ? SIGN_GAP : x))))); };
        let run = [];
        for (const e of v.e) {
          if (e.m !== undefined) { if (run.length) judge(run); run = []; continue; }
          for (const f of e.f) { if (e.k === 2 || f.r !== 2) run.push(f); else judge([f]); }
          if (!e.s.replace(/[\])]+$/u, "").endsWith("\u05be")) { judge(run); run = []; }
        }
        if (run.length) judge(run);
        for (const e of v.e) for (const f of e.f || []) {
          if (!f.t || !f.t.p) { if (f.t && f.t.g !== undefined) miss("G4", `${book} ${sec.label} entry ${e.i}: a line is carried where STEP's parts do not stand`); continue; }
          const plain = f.t.p.map((p) => (p[0] === null ? "" : p[0].trim())).filter(Boolean).join(" + ");
          if ((f.t.g === undefined ? plain : f.t.g) !== want.get(f) || f.t.g === plain) miss("G4", `${book} ${sec.label} entry ${e.i}: the line under the word is not the reader's line for STEP's parts`);
          if (f.t.g !== undefined) { counts.lines_under_a_word_with_a_sign_hidden += 1; held.step += 1; }
        }
      }
      si += 1;
    });
  }
  counts.books += 1;
}
verdict("G2", "every chapter of every book has its file, and the index lists them", `${counts.books} books, ${N(counts.chapters)} chapters`);
verdict("G3", "every entry of our text stands in its verse in order, as the zone writes it", `${N(counts.verses)} verses, ${N(counts.words)} words, ${N(counts.marks)} marks, ${N(counts.forms)} forms; ${N(held.zone)} strings held to the zones`);
verdict("G4", "every STEP string is the string of the places", `${N(held.step)} strings held; ${N(counts.forms_with_steps_parts)} forms with STEP's parts`);
verdict("G5", "every MACULA string is the string of the places", `${N(held.macula)} strings held; ${N(counts.forms_with_maculas_morphs)} forms with MACULA's morphs`);
verdict("G6", "every sense said to cite a place is found again by its address, and no BDB sense is left out", `${N(held.here)} strings held; UBS at this very word ${N(counts.here.ubs_at_this_very_word_by_the_tags_entry)} by the tag's entry and ${N(counts.here.ubs_at_this_very_word_by_maculas_lemma)} by MACULA's lemma, at the verse ${N(counts.here.ubs_at_the_verse_another_word_number + counts.here.ubs_at_the_verse_no_word_of_maculas)}; BDB ${N(counts.here.bdb_open_scriptures_at_the_verse)} (Open Scriptures) and ${N(counts.here.bdb_unabridged_at_the_verse)} (unabridged)`);
verdict("G7", "the sentences that say how the two editions meet are the rule's for the places' record", `${N(held.sentences)} sentences on ${N(counts.words_where_the_editions_differ)} words where the editions differ and on the verses numbered otherwise`);

// ---- G8 the tags
{
  /** The entry of entries/ with the named keys left out, compared whole with the page's. */
  const sameEntry = (key, got, src) => {
    const rule = LEFT_OUT[key]; const want = {}; for (const k of Object.keys(src)) if (!rule.keys.includes(k)) want[k] = src[k];
    if (key !== "ubs_sdbh_hebrew_v0_9_2") return same(got, want);
    // the UBS dictionary: each sense without its list of verses, and with the count of them
    const strip = (e) => ({ ...e, BaseForms: (e.BaseForms || []).map((b) => ({ ...b, LEXMeanings: (b.LEXMeanings || []).map((m) => { const c = { ...m }; delete c.LEXReferences; delete c.verses_cited; return c; }) })) });
    if (!same(strip(got), strip(want))) return false;
    return (src.BaseForms || []).every((b, bi) => (b.LEXMeanings || []).every((m, mi) => { const g = got.BaseForms[bi].LEXMeanings[mi]; return g.verses_cited === (m.LEXReferences || []).length && g.LEXReferences === undefined; }));
  };
  const seen = new Set(); let files = 0; const entries = Object.fromEntries(DICTIONARIES.map((k) => [k, 0])); let strings = 0;
  const byLang = { the_language_is_said: { tags: 0, words: 0 }, it_is_not_said: { tags: 0, words: 0 }, a_number_of_one_record: { its_record_is_of_the_other_language: { tags: 0, words: 0 } }, a_number_of_several_records: { one_record_is_the_words: { tags: 0, words: 0 }, several_are: { tags: 0, words: 0 }, none_is: { tags: 0, words: 0 } } };
  const byNum = { several_own_records: { parted_to_one: { tags: 0, words: 0 }, still_several: { tags: 0, words: 0 }, none_left: { tags: 0, words: 0 } }, its_one_own_record_bears_another_numeral: { tags: 0, words: 0 } };
  const byHead = { a_number_of_one_record: { the_record_is_the_words: { tags: 0, words: 0 }, it_is_not: { tags: 0, words: 0 } }, a_number_of_several_records: { one_record_is_the_words: { tags: 0, words: 0 }, several_are: { tags: 0, words: 0 }, none_is: { tags: 0, words: 0 } } };
  const dirT = join(PAGE, "entries", "t");
  for (const name of existsSync(dirT) ? readdirSync(dirT).sort() : []) {
    const file = name.replace(/\.json\.gz$/u, ""); const F = readGz(join(dirT, name)); files += 1;
    if (F.schema !== TAGS_SCHEMA || F.file !== file) miss("G8", `${name}: its head is not this file's`);
    const named = Object.fromEntries(DICTIONARIES.map((k) => [k, new Set()]));
    for (const [tag, line] of Object.entries(F.tags || {})) {
      if (seen.has(tag)) miss("G8", `${tag} stands in two files`); seen.add(tag);
      const row = bridge.tags[tag];
      if (!row || tagFile(tag) !== file) { miss("G8", `${tag} is no tag of the bridge's, or stands in the wrong file (${file})`); continue; }
      if (!same(line.n, row.n) || !same(line.v, row.v) || !same(Object.keys(line.b), DICTIONARIES) || DICTIONARIES.some((k) => !same(line.b[k], row[k]))) miss("G8", `${tag}: its line is not the bridge's`);
      { // the declared language: lg as STEP's lexicon says it, ol the records the tag reaches that say they are of the other
        const lg = langOfTag(tag); const ids = row.unabridged_bdb_1906.slice(1); const ol = ids.filter((id) => otherLanguage(lg, id));
        // the tag's line says only what the lexicon says; the records set behind are named word by word (a form's ol)
        if ((line.lg === undefined ? null : line.lg) !== lg || line.ol !== undefined) miss("G8", `${tag}: the language the lexicon says is not its morph column's, or records of the other language are named on the tag`);
        if (ids.length) { const said = lg ? byLang.the_language_is_said : byLang.it_is_not_said; said.tags += 1; said.words += row.n[0];
          const first = Object.keys(ownOfTag(tag)).filter((id) => !ol.includes(id));
          if (ids.length === 1) { if (ol.length) { byLang.a_number_of_one_record.its_record_is_of_the_other_language.tags += 1; byLang.a_number_of_one_record.its_record_is_of_the_other_language.words += row.n[0]; } }
          else { const slot = first.length === 1 ? byLang.a_number_of_several_records.one_record_is_the_words : first.length ? byLang.a_number_of_several_records.several_are : byLang.a_number_of_several_records.none_is; slot.tags += 1; slot.words += row.n[0]; } }
      }
      { // BDB's own homonym numeral on the tag's line: the entry's, and the number's own records of another
        const nm = numeralHere(tag), on = anotherNumeral(tag);
        if ((line.nm || null) !== (nm && row.unabridged_bdb_1906.length > 1 ? nm : null) || !same(line.on || [], on) || (line.on !== undefined && !line.on.length)) miss("G8", `${tag}: BDB's numeral of the entry, or the records of another numeral, are not what the two files print`);
        const lgx = langOfTag(tag); const ownL = Object.keys(ownOfTag(tag)).filter((id) => !otherLanguage(lgx, id));
        if (nm && ownL.length > 1) { const first = ownL.filter((id) => !on.includes(id)); const slot = first.length === 1 ? byNum.several_own_records.parted_to_one : first.length ? byNum.several_own_records.still_several : byNum.several_own_records.none_left; slot.tags += 1; slot.words += row.n[0]; }
        if (nm && ownL.length === 1 && on.includes(ownL[0])) { byNum.its_one_own_record_bears_another_numeral.tags += 1; byNum.its_one_own_record_bears_another_numeral.words += row.n[0]; }
      }
      // the unabridged BDB's records that are the number's by their headword: named on every tag that reaches a record
      if (row.unabridged_bdb_1906.length > 1) {
        const own = ownOfTag(tag); if (!same(line.own, own)) miss("G8", `${tag}: the records named as the number's own by their headword are not the ones the test gives`);
        const n = Object.keys(own).length; const slot = row.unabridged_bdb_1906.length === 2 ? (n ? byHead.a_number_of_one_record.the_record_is_the_words : byHead.a_number_of_one_record.it_is_not) : n === 1 ? byHead.a_number_of_several_records.one_record_is_the_words : n ? byHead.a_number_of_several_records.several_are : byHead.a_number_of_several_records.none_is;
        slot.tags += 1; slot.words += row.n[0];
      } else if (line.own !== undefined) miss("G8", `${tag}: records are named as its own where it reaches none`);
      for (const k of DICTIONARIES) for (const id of row[k].slice(1)) named[k].add(id);
    }
    for (const k of INLINE) {
      const got = (F.entries || {})[k] || {};
      if (!same(Object.keys(got).sort(), [...named[k]].sort())) miss("G8", `${name}: the entries of ${k} beside the tags are not the ones the tags reach`);
      for (const [id, e] of Object.entries(got)) { entries[k] += 1; strings += 1; if (!ENTRIES[k][id] || !sameEntry(k, e, ENTRIES[k][id])) miss("G8", `${name}: ${k} ${id} is not the entry of entries/ with the named keys left out`); }
    }
    const heads = F.unabridged || {};
    if (!same(Object.keys(heads).sort(), [...named.unabridged_bdb_1906].sort())) miss("G8", `${name}: the unabridged BDB's heads beside the tags are not the ones the tags reach`);
    for (const [id, hd] of Object.entries(heads)) { entries.unabridged_bdb_1906 += 1; const e = ENTRIES.unabridged_bdb_1906[id]; if (!e || !same(hd, { strong: e.strong, language: e.language, paragraphs: e.blocks.length, head: e.blocks[0].head })) miss("G8", `${name}: the head of ${id} is not the record's`); }
  }
  for (const tag of Object.keys(bridge.tags)) if (!seen.has(tag)) miss("G8", `${tag} of the bridge stands in no file`);
  const pt = pin.tags || {};
  if (pt.tags !== seen.size || pt.files !== files || !same(pt.entries, entries) || !same(pt.unabridged_by_headword, byHead) || !same(pt.unabridged_by_language, byLang) || !same(pt.unabridged_by_numeral, byNum)) miss("G11", "the tags, their files and the entries beside them, counted again, are not the pin's");
  verdict("G8", "every tag stands in the one file its number names with the bridge's own line, and every entry beside it is the entry of entries/", `${N(seen.size)} tags in ${files} files; entries beside them: ${DICTIONARIES.map((k) => `${k} ${N(entries[k])}`).join(", ")}`);
}

// ---- G9 the unabridged BDB's records
{
  const seen = new Set(); const dirU = join(PAGE, "entries", "u");
  for (const name of existsSync(dirU) ? readdirSync(dirU).sort() : []) {
    const file = name.replace(/\.json\.gz$/u, ""); const F = readGz(join(dirU, name));
    if (F.schema !== UNABRIDGED_SCHEMA || F.file !== file) miss("G9", `${name}: its head is not this file's`);
    for (const [id, e] of Object.entries(F.entries || {})) {
      if (seen.has(id)) miss("G9", `${id} stands in two files`); seen.add(id);
      const src = ENTRIES.unabridged_bdb_1906[id]; if (!src || unabridgedFile(id) !== file) { miss("G9", `${id} is no record of the entries', or stands in the wrong file`); continue; }
      const want = {}; for (const k of Object.keys(src)) if (!LEFT_OUT.unabridged_bdb_1906.keys.includes(k)) want[k] = src[k];
      if (!same(e, want)) miss("G9", `${id} is not the record of entries/ whole`);
    }
  }
  for (const id of Object.keys(ENTRIES.unabridged_bdb_1906)) if (!seen.has(id)) miss("G9", `${id} stands in no file`);
  if (pin.unabridged_records !== seen.size) miss("G11", "the unabridged BDB's records, counted again, are not the pin's");
  verdict("G9", "every record of the unabridged BDB stands whole in the one file its number names", `${N(seen.size)} records`);
}

// ---- G10 the index
{
  if (index.schema !== INDEX_SCHEMA) miss("G10", "the index is not an index of the page's files");
  if (!same(index.how, bridge.how) || !same(index.class_of, bridge.class_of)) miss("G10", "the index's words for how a tag reaches an entry are not the bridge's");
  if (!same(index.dictionaries, DICTIONARIES) || !same(index.left_out, LEFT_OUT)) miss("G10", "the index's dictionaries or the keys left out are not the rule's");
  if ((index.books || []).length !== BOOKS.length || new Set((index.books || []).map((b) => b.book)).size !== BOOKS.length) miss("G10", "the index does not list the 39 books once each");
  const pp = JSON.parse(readFileSync(join(DIR, "places", "PIN.json"), "utf8")), pe = JSON.parse(readFileSync(join(DIR, "entries", "PIN.json"), "utf8"));
  for (const k of ["step_tahot", "macula_hebrew"]) { const s = pp.sources[k], g = (index.sources || {})[k]; if (!g || g.revision !== s.revision || g.license !== s.license || !same(g.files, s.files.map((f) => ({ file: f.name, sha256: f.sha256 })))) miss("G10", `the index's ${k} is not the places' pin's`); }
  for (const k of DICTIONARIES) { const s = pe.sources[k], g = (index.sources || {})[k]; if (!g || g.work !== s.work || !same(g.files, s.files.map((f) => ({ file: f.file, sha256: f.sha256, provider: f.provider, repository: f.repository, revision: f.revision, license: f.license })))) miss("G10", `the index's ${k} is not the entries' pin's`); }
  verdict("G10", "the index says what the bridge and the two parts' pins say", `${(index.books || []).length} books; ${Object.keys(index.sources || {}).length} sources with their files and revisions`);
}

// ---- G11 the counts
if (!same(pin.counts, counts)) miss("G11", `the words, forms and senses, counted again, are not the pin's (${Object.keys(counts).filter((k) => !same(counts[k], (pin.counts || {})[k])).join(", ")})`);
verdict("G11", "the counts, counted again, are the pin's", `${N(counts.words)} words; ${N(counts.here.words_with_any)} with a sense that cites the place, ${N(counts.here.words_with_a_ubs_sense_at_this_very_word)} of them with a UBS sense at the very word`);

console.log(bad ? `\n${bad} FAILED` : "\nthe second reader's files hold");
process.exit(bad ? 1 : 0);
