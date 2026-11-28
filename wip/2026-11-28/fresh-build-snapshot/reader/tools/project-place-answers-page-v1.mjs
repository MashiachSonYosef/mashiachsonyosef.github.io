#!/usr/bin/env node
// Page lane · place-answers-rule-v1-a-reading-stands-at-a-word-only-where-a-source-puts-it-there-by-that-sources-own-address
// LEDGER: -
// no frame letter. It writes data/place-answers-v1/page/ (the second
// reader's files) from the places, the entries, the bridges and the zones;
// it updates no record of the frame.
//
// THE SECOND READER'S FILES, PROJECTED BY RULE (27 November 2026, the fresh
// build). reader/place.html shows the 39 books from the place answers alone:
// a chapter of our Hebrew with STEP's English under each word, and a card
// that says what each source says at this very word and then each
// dictionary's own entry. This writes what that page fetches, and nothing
// in it is found here by letters or chosen here: the rules are in
// tools/place-answers-page-v1.mjs and each is a lookup by a source's own
// address.
//
//   page/<book>/<chapter>.json.gz   a chapter: each verse's entries in our text's order (a word, a scribal
//                                   mark, a written-and-read pair with its forms); for each word STEP's parts,
//                                   how the two editions meet where it is not one for one with the same
//                                   letters, MACULA's morphs, and the senses that cite this very place
//   page/entries/t/<nnn>.json.gz    by STEP tag (fifty numbers a file): how the tag reaches each dictionary
//                                   (the bridge's own word) and the dictionary's entry in its own structure
//   page/entries/u/<nnn>.json.gz    the unabridged BDB's records whole (fifty a file; they are large)
//   page/index.json                 the books and their chapters, the shape in words, the bridge's words,
//                                   what each source file is (from the two parts' pins)
//   page/PIN.json                   what this was made from (the two parts' pins by sha256) and what it made
//
// READ: places/, entries/, bridges/ and the two parts' pins; the zones, for
// our own Hebrew, the marks, the verse labels, the book's name and the
// credit line the zone carries; data/book-order-v1.json, for the order the
// list of books is shown in; data/mam-restore-v5-rights-v1.json, whose
// credit line for the book must be the one the zone carries (it stops if
// not). Nothing the site serves today is read.
//
// Two runs over the same inputs give the same bytes (no time stamp in a
// gzip header; keys in a fixed order).
//
// Run: node tools/project-place-answers-page-v1.mjs [--dir data/place-answers-v1] [--zones data/zones] [--books a,b]
//   --books  only these books' chapters (a trial run; the index, the entries and the pin are then not written)
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { gunzipSync, gzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BOOKS, readZone } from "./place-answers-sources-v1.mjs";
import { openPlaces } from "./place-answers-places-v1.mjs";
import { PAGE_RULE_ID, PAGE_RULE, CHAPTER_SCHEMA, TAGS_SCHEMA, UNABRIDGED_SCHEMA, INDEX_SCHEMA, PAGE_PIN_SCHEMA, DICTIONARIES, INLINE, LEFT_OUT, SHAPE_WORDS, TAG_FILE_SPAN, UNABRIDGED_FILE_SPAN, pageEntry, unabridgedHead, tagFile, unabridgedFile, ubsWordNumbers, pageForm, lemmaLetters, ownParagraphs, setLinesUnder, stepsBracketedHeadwords, stepsLanguage, ofTheOtherLanguage, stepsStem, partPairLines, osNumeral, ownNumerals, partRecurring } from "./place-answers-page-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const argv = process.argv.slice(2);
let DIR = join(K3, "data", "place-answers-v1"), ZONES = join(K3, "data", "zones"), ONLY = null;
for (let i = 0; i < argv.length; i += 1) {
  if (argv[i] === "--dir") { DIR = argv[i + 1]; i += 1; } else if (argv[i] === "--zones") { ZONES = argv[i + 1]; i += 1; } else if (argv[i] === "--books") { ONLY = argv[i + 1].split(","); i += 1; }
  else { console.error("usage: project-place-answers-page-v1.mjs [--dir <place answers folder>] [--zones <zones folder>] [--books a,b]"); process.exit(2); }
}
for (const need of ["places", "entries", "bridges"]) if (!existsSync(join(DIR, need))) { console.error(`${DIR} holds no ${need}/: make the places and the entries first (tools/make-place-answers-v1.sh)`); process.exit(3); }
const OUT = join(DIR, "page");

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const readGz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const made = []; // every file written: [path under page/, bytes, sha256, bytes unpacked]
/** Write JSON compactly, gzip it the same way every run (no time stamp in the header). */
function writeGz(rel, obj) {
  const p = join(OUT, rel); mkdirSync(dirname(p), { recursive: true });
  const raw = Buffer.from(JSON.stringify(obj), "utf8"); const gz = gzipSync(raw, { level: 9 });
  gz[4] = 0; gz[5] = 0; gz[6] = 0; gz[7] = 0; gz[9] = 255;
  writeFileSync(p, gz); made.push([rel, gz.length, sha256(gz), raw.length]);
}
function writePlain(rel, obj) {
  const p = join(OUT, rel); mkdirSync(dirname(p), { recursive: true });
  const buf = Buffer.from(JSON.stringify(obj, null, 1) + "\n", "utf8");
  writeFileSync(p, buf); made.push([rel, buf.length, sha256(buf), buf.length]);
}

// ---- the sources of the projection, opened once
const t0 = Date.now();
const bridge = readGz(join(DIR, "bridges", "step-tag-to-entry.json.gz"));
const VERSES = {}; for (const k of ["openscriptures_bdb_1906", "unabridged_bdb_1906", "ubs_sdbh_hebrew_v0_9_2"]) VERSES[k] = readGz(join(DIR, "bridges", `verse-to-sense-${k}.json.gz`)).verses;
const ENTRIES = {}; for (const k of DICTIONARIES) ENTRIES[k] = readGz(join(DIR, "entries", `${k}.json.gz`)).entries;
const rights = JSON.parse(readFileSync(join(K3, "data", "mam-restore-v5-rights-v1.json"), "utf8"));
const order = JSON.parse(readFileSync(join(K3, "data", "book-order-v1.json"), "utf8")).files;
console.log(`opened the bridges and ${DICTIONARIES.length} dictionaries (${((Date.now() - t0) / 1000).toFixed(1)} s)`);

// a trial run of some books leaves the rest of page/ as it stands; a whole run starts from nothing
if (!ONLY && existsSync(OUT)) rmSync(OUT, { recursive: true });

// ---- the chapters
const counts = { books: 0, chapters: 0, verses: 0, words: 0, marks: 0, forms: 0, forms_with_steps_parts: 0, forms_with_maculas_morphs: 0, words_where_the_editions_differ: 0, sentences: 0,
  here: { ubs_at_this_very_word_by_the_tags_entry: 0, ubs_at_this_very_word_by_maculas_lemma: 0, ubs_at_the_verse_another_word_number: 0, ubs_at_the_verse_no_word_of_maculas: 0, bdb_open_scriptures_at_the_verse: 0, bdb_unabridged_at_the_verse: 0, words_with_a_ubs_sense_at_this_very_word: 0, words_with_any: 0 },
  steps_rows_no_word_of_ours_meets: 0,
  lines_under_a_word_with_a_sign_hidden: 0,
  headword: { unabridged_lines_not_drawn_under_a_number_of_one_record: 0, unabridged_lines_not_drawn_under_a_number_of_several_records: 0, unabridged_lines_drawn_by_maculas_lemma_alone: 0, words_where_a_line_is_not_drawn: 0, forms_with_a_record_by_maculas_lemma_alone: 0,
    words_under_a_number_of_several_records: { one_record_is_the_words: 0, several_are: 0, none_is: 0 },
    // the numbers whose headword in STEP's brief lexicon carries square brackets, each with its relation column: the test reads them without the bracketed runs
    steps_headwords_read_without_their_square_brackets: stepsBracketedHeadwords(ENTRIES.stepbible_tbesh_gloss) },
  // the declared language: «here» lines of a record of the other language not drawn, and, word by word under a number of several records, how many records are the word's by headword and language
  language: { unabridged_lines_not_drawn_under_a_number_of_one_record: 0, unabridged_lines_not_drawn_under_a_number_of_several_records: 0, words_where_a_line_is_not_drawn: 0, words_under_a_number_of_several_records: { one_record_is_the_words: 0, several_are: 0, none_is: 0 },
    // where the word's language for a number is read (a form and a number of its, where STEP's parts stand): STEP's row at the word, else the lexicon, else neither
    where_the_language_is_read: { steps_row: 0, the_lexicon: 0, neither: 0 }, forms_with_a_record_of_the_other_language: 0, forms_whose_rows_say: { h: 0, a: 0 } },
  // the stems of the unabridged BDB on its «cites this verse» lines
  // BDB's own homonym numeral: lines not drawn for another numeral, and, word by word under a number of several records, how many are the word's by headword, language and numeral
  numeral: { unabridged_lines_of_another_numeral_under_a_number_of_one_record: 0, unabridged_lines_of_another_numeral_under_a_number_of_several_records: 0, words_with_such_a_line: 0,
    drawn_as_bdbs_reading_of_this_word: 0, withheld_bdb_names_another_word: 0, drawn_neither_can_be_told: 0, withheld_bdbs_pointer_to_another_entry: 0, withheld_another_word_holds_it_as_its_own: 0, words_under_a_number_of_several_records: { one_record_is_the_words: 0, several_are: 0, none_is: 0 } },
  // a number at two or more words of a verse: lines taken off a word for BDB's quoted form names another, and lines marked as the verse's
  recurring: { lines_withheld: 0, the_named_word_already_holds_the_line: 0, the_named_words_tests_do_not_draw_it: 0, lines_marked: 0, words_with_a_marked_line: 0, words_with_a_line_withheld: 0 },
  stems: { unabridged_lines_under_a_stem_in_a_point: 0, unabridged_lines_in_a_stems_own_head: 0, unabridged_lines_under_no_stem: 0, lines_whose_points_label_names_another_stem: 0, words_where_a_stems_head_line_follows_a_point_line_of_its_stem: 0, pair_lines_taken_off_the_form_whose_stem_they_are_not: 0, pairs_whose_lines_are_parted: 0 } };
// the letters of each number's lemma (STEP's brief lexicon's headword without its square-bracketed runs, the Lexical Index's), reckoned once a tag
const LEMMA = new Map(); const lemmaOf = (tag) => { let s = LEMMA.get(tag); if (!s) { s = lemmaLetters(tag, bridge, (k) => ENTRIES[k]); LEMMA.set(tag, s); } return s; };
const OWN = new Map(); const ownOf = (tag) => { let o = OWN.get(tag); if (!o) { o = {}; const row = bridge.tags[tag]; for (const id of row ? row.unabridged_bdb_1906.slice(1) : []) { const ps = ownParagraphs(ENTRIES.unabridged_bdb_1906[id], lemmaOf(tag)); if (ps.length) o[id] = ps; } OWN.set(tag, o); } return o; };
const TALLY = { not_drawn_exact: 0, not_drawn_ambiguous: 0, drawn_by_maculas_lemma_alone: 0, not_drawn_other_language_exact: 0, not_drawn_other_language_ambiguous: 0, another_numeral_exact: 0, another_numeral_ambiguous: 0 };
// BDB's own homonym numeral of the Open Scriptures entry each number reaches exactly, and the records of another numeral
const NUMERAL = new Map(); const numeralOf = (tag) => { if (!NUMERAL.has(tag)) NUMERAL.set(tag, osNumeral(tag, bridge, (k) => ENTRIES[k])); return NUMERAL.get(tag); };
const ANOTHER = new Map(); const anotherOf = (tag) => { if (!ANOTHER.has(tag)) { const nm = numeralOf(tag); const own = ownOf(tag); ANOTHER.set(tag, nm ? Object.keys(own).filter((id) => { const ns = ownNumerals(ENTRIES.unabridged_bdb_1906[id], own[id]); return ns.length && !ns.includes(nm); }) : []); } return ANOTHER.get(tag); };
// the language STEP's lexicon says each number's word is, reckoned once a tag
const LANG = new Map(); const langOf = (tag) => { if (!LANG.has(tag)) LANG.set(tag, stepsLanguage(tag, bridge, (k) => ENTRIES[k])); return LANG.get(tag); };
const bookFacts = {}; const largest = { bytes: 0, file: "" };
const POINTER_LOG = []; // likewise, the lines of another numeral whose every reference is BDB's pointer
const RECUR_LOG = []; // a scratch list of the lines taken off for another word, written only when RECURRING_LOG names a file
for (const [book] of BOOKS) {
  if (ONLY && !ONLY.includes(book)) continue;
  const zoneFile = join(ZONES, `${book}.bin`);
  const zone = readZone(zoneFile); const rawZone = readGz(zoneFile);
  const P = openPlaces(join(DIR, "places", `${book}.json.gz`));
  if (P.doc.zone.sha256 !== zone.sha256) { console.error(`${book}: the places were made from another zone than ${zoneFile}`); process.exit(1); }
  const S = { bridge, verses: (k) => VERSES[k][book] || {}, entries: (k) => ENTRIES[k], numbers: ubsWordNumbers(P), lemma: lemmaOf, language: langOf, numeral: numeralOf, tally: TALLY, where: counts.language.where_the_language_is_read };
  // the credit line of our text: the zone's own byline up to its first « · », which is the rights record's line
  const byline = String(rawZone.byline || ""); const cut = byline.indexOf(" · "); const credit = cut >= 0 ? byline.slice(0, cut) : byline;
  const rightsLine = (((rights.works || {})[`tanakh/${book}`] || {}).credit || {}).line;
  if (!credit || credit !== rightsLine) { console.error(`${book}: the zone's credit line is not the rights record's`); process.exit(1); }
  // what the zone says each kind of mark is
  const marks = {}; for (const sec of rawZone.sections) for (const w of sec.words || []) if (w.mark && w.mark.kind && w.mark.says && !marks[w.mark.kind]) marks[w.mark.kind] = w.mark.says;
  // STEP's rows that no word of ours meets, under STEP's own Hebrew verse number
  const unmet = new Map(); for (const i of P.doc.step.unmet || []) { const r = P.stepRow(i); if (!unmet.has(r.verse)) unmet.set(r.verse, []); unmet.get(r.verse).push([r.ref, r.hebrew, r.translation]); }
  const chapters = new Map();
  zone.sections.forEach((sec, si) => {
    if (!chapters.has(sec.ch)) chapters.set(sec.ch, []);
    const e = [];
    sec.entries.forEach((en, ei) => {
      if (en.mark) { e.push({ m: en.mark === true ? "" : en.mark, s: en.s }); counts.marks += 1; return; }
      const W = P.wordAt(si, ei); if (!W) { console.error(`${book} ${sec.label} entry ${ei}: a word with no record in the places`); process.exit(1); }
      const word = { i: ei, s: en.s }; const k = ["plain", "written and read", "written, not read", "read, not written"].indexOf(W.kind); if (k) word.k = k;
      const notDrawnBefore = TALLY.not_drawn_exact + TALLY.not_drawn_ambiguous, notDrawnLBefore = TALLY.not_drawn_other_language_exact + TALLY.not_drawn_other_language_ambiguous, notDrawnNBefore = TALLY.another_numeral_exact + TALLY.another_numeral_ambiguous;
      word.f = W.forms.map((f, fi) => pageForm({ kind: W.kind, f, text: en.forms ? en.forms[fi].s : undefined }, S));
      if (W.kind === "written and read" && W.forms.length === 2) { // each form's lines by STEP's stem of that form
        const stems = W.forms.map((f) => { const o = f.role === "written" ? f.step.written : f.step.read; return new Set(((o && o.parts) || []).map((p) => stepsStem(p.lang, p.gram)).filter(Boolean)); });
        const off = partPairLines(word.f, stems); counts.stems.pair_lines_taken_off_the_form_whose_stem_they_are_not += off; if (off) counts.stems.pairs_whose_lines_are_parted += 1; }
      if (TALLY.not_drawn_exact + TALLY.not_drawn_ambiguous > notDrawnBefore) counts.headword.words_where_a_line_is_not_drawn += 1;
      if (TALLY.not_drawn_other_language_exact + TALLY.not_drawn_other_language_ambiguous > notDrawnLBefore) counts.language.words_where_a_line_is_not_drawn += 1;
      if (TALLY.another_numeral_exact + TALLY.another_numeral_ambiguous > notDrawnNBefore) counts.numeral.words_with_such_a_line += 1;
      { // under each number of the word that reaches several unabridged records: how many of them are this word's
        const seen = new Set();
        for (const f of word.f) for (const p of (f.t || {}).p || []) {
          const row = p[1] ? bridge.tags[p[1]] : null; if (!row || row.unabridged_bdb_1906.length < 3 || seen.has(p[1])) continue; seen.add(p[1]);
          const mine = new Set(Object.keys(ownOf(p[1]))); for (const g of word.f) for (const id of g.ow || []) if (row.unabridged_bdb_1906.includes(id)) mine.add(id);
          counts.headword.words_under_a_number_of_several_records[mine.size === 1 ? "one_record_is_the_words" : mine.size ? "several_are" : "none_is"] += 1;
          { const ol = new Set(word.f.flatMap((g) => g.ol || [])); let n = 0, m = 0; const on = new Set(anotherOf(p[1])); for (const id of mine) if (!ol.has(id)) { n += 1; if (!on.has(id)) m += 1; } counts.language.words_under_a_number_of_several_records[n === 1 ? "one_record_is_the_words" : n ? "several_are" : "none_is"] += 1;
            counts.numeral.words_under_a_number_of_several_records[m === 1 ? "one_record_is_the_words" : m ? "several_are" : "none_is"] += 1; }
        }
      }
      e.push(word);
    });
    // a number at two or more words of the verse: a line BDB's quoted form gives to another word is taken off, the rest marked
    { const t = partRecurring(e, sec.label, (hv) => (VERSES.unabridged_bdb_1906[book] || {})[hv] || [], ENTRIES.unabridged_bdb_1906);
      counts.recurring.lines_withheld += t.withheld; counts.recurring.the_named_word_already_holds_the_line += t.the_named_word_already_holds_the_line; counts.recurring.the_named_words_tests_do_not_draw_it += t.the_named_words_tests_do_not_draw_it; counts.recurring.lines_marked += t.marked; counts.recurring.words_with_a_line_withheld += t.words_with_a_line_withheld;
      for (const k of ["drawn_as_bdbs_reading_of_this_word", "withheld_bdb_names_another_word", "drawn_neither_can_be_told", "withheld_bdbs_pointer_to_another_entry", "withheld_another_word_holds_it_as_its_own"]) counts.numeral[k] += t.another_numeral[k];
      if (process.env.RECURRING_LOG) for (const x of t.pointers) POINTER_LOG.push([book, sec.label, x.w.i, x.w.s, x.b[9], x.b[0], `${x.b[10]} ${x.b[12] ? "(head)" : [x.b[4], x.b[5]].join(" ").trim()}`, x.refs.join(",")].join("\t"));
      if (process.env.RECURRING_LOG) for (const x of t.log) RECUR_LOG.push([book, sec.label, x.w.i, x.w.s, x.b[9], x.b[0], `${x.b[10]} ${x.b[12] ? "(head)" : [x.b[4], x.b[5]].join(" ").trim()}`, x.named.join(","), x.held.join(",")].join("\t")); }
    for (const word of e) {
      if (word.m !== undefined) continue;
      counts.words += 1; counts.forms += word.f.length;
      if (word.f.some((f) => ((f.h || {}).b || []).some((b) => b[14]))) counts.recurring.words_with_a_marked_line += 1;
      let any = false, very = false, differs = false, leads = false;
      for (const f of word.f) {
        if (f.t && f.t.p) counts.forms_with_steps_parts += 1;
        if (f.m) counts.forms_with_maculas_morphs += 1;
        if (f.t && f.t.d) differs = true;
        if (f.t && f.t.say) counts.sentences += f.t.say.length;
        if (f.ow) counts.headword.forms_with_a_record_by_maculas_lemma_alone += 1;
        if (f.ol) counts.language.forms_with_a_record_of_the_other_language += 1;
        if (f.t && f.t.lg) counts.language.forms_whose_rows_say[f.t.lg] += 1;
        for (const b of (f.h || {}).b || []) { counts.stems[b[11] < 0 ? "unabridged_lines_under_no_stem" : b[12] ? "unabridged_lines_in_a_stems_own_head" : "unabridged_lines_under_a_stem_in_a_point"] += 1; if (b[13]) counts.stems.lines_whose_points_label_names_another_stem += 1; }
        if (((f.h || {}).b || []).some((b, i, all) => b[12] && all.slice(0, i).some((x) => !x[12] && x[0] === b[0] && x[1] === b[1] && x[11] === b[11]))) leads = true;
        if (f.h) { any = true; for (const u of f.h.u || []) { counts.here[["ubs_at_this_very_word_by_the_tags_entry", "ubs_at_this_very_word_by_maculas_lemma", "ubs_at_the_verse_another_word_number", "ubs_at_the_verse_no_word_of_maculas"][u[1]]] += 1; if (u[1] < 2) very = true; } counts.here.bdb_open_scriptures_at_the_verse += (f.h.o || []).length; counts.here.bdb_unabridged_at_the_verse += (f.h.b || []).length; }
      }
      if (any) counts.here.words_with_any += 1; if (very) counts.here.words_with_a_ubs_sense_at_this_very_word += 1; if (differs) counts.words_where_the_editions_differ += 1; if (leads) counts.stems.words_where_a_stems_head_line_follows_a_point_line_of_its_stem += 1;
    }
    setLinesUnder(e); for (const w of e) for (const f of w.f || []) if (f.t && f.t.g !== undefined) counts.lines_under_a_word_with_a_sign_hidden += 1;
    const v = { l: sec.label, e }; if (unmet.has(sec.label)) { v.un = unmet.get(sec.label); counts.steps_rows_no_word_of_ours_meets += v.un.length; unmet.delete(sec.label); }
    chapters.get(sec.ch).push(v); counts.verses += 1;
  });
  if (unmet.size) { console.error(`${book}: STEP rows no word of ours meets stand under verses our text does not number so: ${[...unmet.keys()].join(", ")}`); process.exit(1); }
  const facts = { title: zone.work, chapters: [], words: 0 };
  for (const [ch, verses] of chapters) {
    const rel = `${book}/${ch}.json.gz`;
    writeGz(rel, { schema: CHAPTER_SCHEMA, rule_id: PAGE_RULE_ID, book, chapter: ch, title: zone.work, credit, marks, verses });
    const last = made[made.length - 1]; if (last[1] > largest.bytes) { largest.bytes = last[1]; largest.file = rel; }
    facts.chapters.push(ch); counts.chapters += 1;
  }
  facts.words = P.doc.zone.words; bookFacts[book] = facts; counts.books += 1;
  console.log(`${book.padEnd(14)} ${String(facts.chapters.length).padStart(3)} chapters  (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
}
counts.headword.unabridged_lines_not_drawn_under_a_number_of_one_record = TALLY.not_drawn_exact;
counts.headword.unabridged_lines_not_drawn_under_a_number_of_several_records = TALLY.not_drawn_ambiguous;
counts.headword.unabridged_lines_drawn_by_maculas_lemma_alone = TALLY.drawn_by_maculas_lemma_alone;
counts.language.unabridged_lines_not_drawn_under_a_number_of_one_record = TALLY.not_drawn_other_language_exact;
counts.language.unabridged_lines_not_drawn_under_a_number_of_several_records = TALLY.not_drawn_other_language_ambiguous;
counts.numeral.unabridged_lines_of_another_numeral_under_a_number_of_one_record = TALLY.another_numeral_exact;
counts.numeral.unabridged_lines_of_another_numeral_under_a_number_of_several_records = TALLY.another_numeral_ambiguous;

if (process.env.RECURRING_LOG) { writeFileSync(process.env.RECURRING_LOG, RECUR_LOG.join("\n") + "\n"); writeFileSync(`${process.env.RECURRING_LOG}.pointers.tsv`, POINTER_LOG.join("\n") + "\n"); }
if (!ONLY) {
  // ---- the dictionaries, by STEP tag
  const tagFiles = new Map(); const tagCounts = { tags: 0, files: 0, entries: Object.fromEntries(DICTIONARIES.map((k) => [k, 0])), by_how: Object.fromEntries(DICTIONARIES.map((k) => [k, {}])),
    // the unabridged BDB under a number, by the headword test with the lemma of STEP's brief lexicon and the Lexical Index (words: the rows the tag stands on in STEP's main column)
    unabridged_by_headword: { a_number_of_one_record: { the_record_is_the_words: { tags: 0, words: 0 }, it_is_not: { tags: 0, words: 0 } }, a_number_of_several_records: { one_record_is_the_words: { tags: 0, words: 0 }, several_are: { tags: 0, words: 0 }, none_is: { tags: 0, words: 0 } } },
    // the unabridged BDB under a number, by the language the two sources declare: a number of several records after the headword test and the language
    // the unabridged BDB under a number by BDB's own homonym numeral: of the numbers whose own records of the lexicon's language are several and whose entry carries a numeral, how many it parts
    unabridged_by_numeral: { several_own_records: { parted_to_one: { tags: 0, words: 0 }, still_several: { tags: 0, words: 0 }, none_left: { tags: 0, words: 0 } }, its_one_own_record_bears_another_numeral: { tags: 0, words: 0 } },
    unabridged_by_language: { the_language_is_said: { tags: 0, words: 0 }, it_is_not_said: { tags: 0, words: 0 }, a_number_of_one_record: { its_record_is_of_the_other_language: { tags: 0, words: 0 } }, a_number_of_several_records: { one_record_is_the_words: { tags: 0, words: 0 }, several_are: { tags: 0, words: 0 }, none_is: { tags: 0, words: 0 } } } };
  for (const tag of Object.keys(bridge.tags)) {
    const file = tagFile(tag); if (!file) { console.error(`a tag that is not H and four digits: ${tag}`); process.exit(1); }
    if (!tagFiles.has(file)) tagFiles.set(file, { schema: TAGS_SCHEMA, rule_id: PAGE_RULE_ID, file, tags: {}, entries: Object.fromEntries(INLINE.map((k) => [k, {}])), unabridged: {} });
    const F = tagFiles.get(file); const row = bridge.tags[tag]; const b = {};
    for (const k of DICTIONARIES) {
      b[k] = row[k]; tagCounts.by_how[k][row[k][0]] = (tagCounts.by_how[k][row[k][0]] || 0) + 1;
      for (const id of row[k].slice(1)) {
        const e = ENTRIES[k][id]; if (!e) { console.error(`${tag}: the bridge names ${id} of ${k}, which the entries do not hold`); process.exit(1); }
        if (k === "unabridged_bdb_1906") F.unabridged[id] = unabridgedHead(e); else F.entries[k][id] = pageEntry(k, e);
      }
    }
    F.tags[tag] = { n: row.n, b }; tagCounts.tags += 1;
    if (row.v) F.tags[tag].v = row.v;
    { // the language STEP's lexicon says the number's word is, and the records the number reaches that say they are of the other
      const lg = langOf(tag), L = tagCounts.unabridged_by_language; const ids = row.unabridged_bdb_1906.slice(1);
      if (lg) F.tags[tag].lg = lg; // the lexicon's word, read only where STEP's row at a word says no language; the records set behind are the word's (a form's ol)
      const ol = ids.filter((id) => ofTheOtherLanguage(lg, ENTRIES.unabridged_bdb_1906[id]));
      if (ids.length) { const said = lg ? L.the_language_is_said : L.it_is_not_said; said.tags += 1; said.words += row.n[0];
        const first = Object.keys(ownOf(tag)).filter((id) => !ol.includes(id));
        if (ids.length === 1) { if (ol.length) { L.a_number_of_one_record.its_record_is_of_the_other_language.tags += 1; L.a_number_of_one_record.its_record_is_of_the_other_language.words += row.n[0]; } }
        else { const slot = first.length === 1 ? L.a_number_of_several_records.one_record_is_the_words : first.length ? L.a_number_of_several_records.several_are : L.a_number_of_several_records.none_is; slot.tags += 1; slot.words += row.n[0]; } }
    }
    { // BDB's own homonym numeral: the entry's, and the number's own records that bear another
      const nm = numeralOf(tag), on = anotherOf(tag), N = tagCounts.unabridged_by_numeral;
      if (nm && row.unabridged_bdb_1906.length > 1) F.tags[tag].nm = nm; if (on.length) F.tags[tag].on = on;
      const own = Object.keys(ownOf(tag)).filter((id) => !ofTheOtherLanguage(langOf(tag), ENTRIES.unabridged_bdb_1906[id]));
      if (nm && own.length > 1) { const first = own.filter((id) => !on.includes(id)); const slot = first.length === 1 ? N.several_own_records.parted_to_one : first.length ? N.several_own_records.still_several : N.several_own_records.none_left; slot.tags += 1; slot.words += row.n[0]; }
      if (nm && own.length === 1 && on.includes(own[0])) { N.its_one_own_record_bears_another_numeral.tags += 1; N.its_one_own_record_bears_another_numeral.words += row.n[0]; }
    }
    if (row.unabridged_bdb_1906.length > 1) {
      const own = ownOf(tag); F.tags[tag].own = own; const n = Object.keys(own).length, U = tagCounts.unabridged_by_headword;
      const slot = row.unabridged_bdb_1906.length === 2 ? (n ? U.a_number_of_one_record.the_record_is_the_words : U.a_number_of_one_record.it_is_not) : n === 1 ? U.a_number_of_several_records.one_record_is_the_words : n ? U.a_number_of_several_records.several_are : U.a_number_of_several_records.none_is;
      slot.tags += 1; slot.words += row.n[0];
    }
  }
  for (const [file, F] of [...tagFiles].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
    for (const k of INLINE) tagCounts.entries[k] += Object.keys(F.entries[k]).length;
    tagCounts.entries.unabridged_bdb_1906 += Object.keys(F.unabridged).length;
    writeGz(`entries/t/${file}.json.gz`, F); tagCounts.files += 1;
  }
  // ---- the unabridged BDB's records, whole
  const unFiles = new Map(); let unRecords = 0;
  for (const id of Object.keys(ENTRIES.unabridged_bdb_1906)) {
    const file = unabridgedFile(id); if (!file) { console.error(`a record id that is not BDB and a number: ${id}`); process.exit(1); }
    if (!unFiles.has(file)) unFiles.set(file, { schema: UNABRIDGED_SCHEMA, rule_id: PAGE_RULE_ID, file, entries: {} });
    unFiles.get(file).entries[id] = pageEntry("unabridged_bdb_1906", ENTRIES.unabridged_bdb_1906[id]); unRecords += 1;
  }
  for (const [file, F] of [...unFiles].sort((a, b) => (a[0] < b[0] ? -1 : 1))) writeGz(`entries/u/${file}.json.gz`, F);

  // ---- the index: the books in the order the tree's record names, the shape, the bridge's words, the sources
  const pinPlaces = readFileSync(join(DIR, "places", "PIN.json")), pinEntries = readFileSync(join(DIR, "entries", "PIN.json"));
  const pp = JSON.parse(pinPlaces.toString("utf8")), pe = JSON.parse(pinEntries.toString("utf8"));
  const inOrder = [...order.filter((b) => bookFacts[b]), ...Object.keys(bookFacts).filter((b) => !order.includes(b))];
  const sources = {};
  // STEP's files and MACULA's table as the places' pin names them (our own text is pinned there zone by zone; the chapter files carry its credit)
  for (const k of ["step_tahot", "macula_hebrew"]) { const s = pp.sources[k]; sources[k] = { provider: s.provider, repository: s.repository, license: s.license, credit: s.credit, revision: s.revision, files: s.files.map((f) => ({ file: f.name, sha256: f.sha256 })) }; }
  for (const k of DICTIONARIES) { const s = pe.sources[k]; sources[k] = { work: s.work, files: s.files.map((f) => ({ file: f.file, sha256: f.sha256, provider: f.provider, repository: f.repository, revision: f.revision, license: f.license })) }; }
  writePlain("index.json", {
    schema: INDEX_SCHEMA, rule_id: PAGE_RULE_ID, rule: PAGE_RULE,
    made_by: "tools/project-place-answers-page-v1.mjs; held by tools/check-place-answers-page-v1.mjs",
    shape: SHAPE_WORDS, left_out: LEFT_OUT, dictionaries: DICTIONARIES,
    filed: { tags_a_file: TAG_FILE_SPAN, unabridged_records_a_file: UNABRIDGED_FILE_SPAN },
    how: bridge.how, class_of: bridge.class_of,
    books: inOrder.map((b) => ({ book: b, title: bookFacts[b].title, chapters: bookFacts[b].chapters, words: bookFacts[b].words })),
    sources,
  });

  // ---- the pin: what this was made from, what it made
  const roll = (list) => sha256(Buffer.from(list.map(([rel, bytes, sum]) => `${rel}\t${bytes}\t${sum}\n`).join(""), "utf8"));
  const group = (test) => { const list = made.filter(([rel]) => test(rel)).sort((a, b) => (a[0] < b[0] ? -1 : 1)); const sizes = list.map((x) => x[1]).sort((a, b) => a - b); return { files: list.length, bytes: sizes.reduce((a, b) => a + b, 0), bytes_unpacked: list.reduce((a, x) => a + x[3], 0), smallest: sizes[0], median: sizes[Math.floor(sizes.length / 2)], largest: sizes[sizes.length - 1], sha256_of_the_list: roll(list) }; };
  const byBook = {}; for (const b of inOrder) byBook[b] = group((rel) => rel.startsWith(`${b}/`));
  const pin = {
    schema: PAGE_PIN_SCHEMA, rule_id: PAGE_RULE_ID, rule: PAGE_RULE,
    part: "the second reader's files (reader/place.html), projected by rule from the places, the entries, the bridges and the zones",
    made_by: "tools/project-place-answers-page-v1.mjs; held by tools/check-place-answers-page-v1.mjs",
    made_from: { "places/PIN.json": { bytes: pinPlaces.length, sha256: sha256(pinPlaces) }, "entries/PIN.json": { bytes: pinEntries.length, sha256: sha256(pinEntries) }, the_zones: "each book's zone by the sha256 the places' pin names (files.<book>.zone_sha256)" },
    a_list_is: "sha256_of_the_list is the sha256 of the files' lines «path under page/ TAB bytes TAB sha256 NEWLINE» in the order of their paths",
    counts, tags: tagCounts, unabridged_records: unRecords,
    made: { chapters: group((rel) => /^[a-z-]+\/\d+\.json\.gz$/u.test(rel)), chapters_by_book: byBook, the_largest_chapter: largest, tag_files: group((rel) => rel.startsWith("entries/t/")), unabridged_files: group((rel) => rel.startsWith("entries/u/")), "index.json": (() => { const x = made.find(([rel]) => rel === "index.json"); return { bytes: x[1], sha256: x[2] }; })() },
  };
  const buf = Buffer.from(JSON.stringify(pin, null, 1) + "\n", "utf8"); writeFileSync(join(OUT, "PIN.json"), buf);
  const m = pin.made;
  console.log(`\nchapters ${m.chapters.files}: ${m.chapters.bytes.toLocaleString("en-US")} bytes; a chapter's median ${m.chapters.median.toLocaleString("en-US")}, largest ${m.chapters.largest.toLocaleString("en-US")} (${largest.file})`);
  console.log(`tag files ${m.tag_files.files}: ${m.tag_files.bytes.toLocaleString("en-US")} bytes; median ${m.tag_files.median.toLocaleString("en-US")}, largest ${m.tag_files.largest.toLocaleString("en-US")}`);
  console.log(`unabridged BDB files ${m.unabridged_files.files}: ${m.unabridged_files.bytes.toLocaleString("en-US")} bytes; median ${m.unabridged_files.median.toLocaleString("en-US")}, largest ${m.unabridged_files.largest.toLocaleString("en-US")}`);
  console.log(`words ${counts.words.toLocaleString("en-US")}, marks ${counts.marks.toLocaleString("en-US")}, tags ${tagCounts.tags.toLocaleString("en-US")}; written under ${OUT} in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
} else {
  // a trial run: nothing of an earlier whole run is taken away, and no pin is written for a part
  const stale = existsSync(join(OUT, "PIN.json")); console.log(`\na trial run of ${ONLY.join(", ")}: ${made.length} chapter files written${stale ? "; page/PIN.json is now stale: run again without --books" : ""}`);
}
