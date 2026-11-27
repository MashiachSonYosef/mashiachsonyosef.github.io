// build-place-answers-entries-v1
//
// THE ONE COMMAND of the fresh build's second part (builder E): each
// dictionary that is filed by entry, read from its own file into its own
// entries, keyed by its own id, with its own structure kept whole; and the
// bridges from STEP's tags and from a verse to those entries.
//
//   node reader/tools/build-place-answers-entries-v1.mjs <sources.json> [out dir]
//
// <sources.json> names every source file on this machine and says where it
// came from (provider, repository, revision). The tool reads those files and
// nothing else: not the route store, not the lattices, not anything the site
// serves today. Given a newer file of a source, the same command makes the
// same output for it; two runs over the same files give the same bytes.
//
// It writes, under reader/data/place-answers-v1/ (or the out dir given):
//   entries/<source key>.json.gz            one record per entry, by the source's own id
//   bridges/step-tag-to-entry.json.gz       every tag of STEP's, to every source, with how
//   bridges/step-tag-to-<source key>.json.gz   per source: the counts and the ambiguous tags
//   bridges/verse-to-sense-<source key>.json.gz  for the two BDB files and the UBS dictionary
//   PIN.json                                every source file (bytes, sha256), the rule, the counts
//
// The check is reader/tools/check-place-answers-entries-v1.mjs.

import { readFileSync, readdirSync } from "node:fs";
import { join, resolve, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";
import { readSource, writeGzJson, writeJson, zipMember, sha256, TAHOT_PREFIXES, OUR_BOOKS, BY_OSIS, BY_ENGLISH_NUMBER, BY_STEP, BY_UHB, BY_HEBREW_NAME } from "./place-answers-entries-lib-v1.mjs";
import { buildWikisource, buildOpenScripturesStrongs } from "./place-answers-entries-strongs-v1.mjs";
import { buildOpenScripturesBdb, buildLexicalIndex } from "./place-answers-entries-openscriptures-v1.mjs";
import { buildUnabridgedBdb } from "./place-answers-entries-unabridged-bdb-v1.mjs";
import { buildTbesh, buildUbs, buildUhalFromRecords, UBS_KEPT } from "./place-answers-entries-tables-v1.mjs";
import { readTags, bridgeTags, countBridge, ambiguousOf, ourVerses, versesOfOpenScripturesBdb, versesOfUnabridgedBdb, versesOfUbs, headwordAgreement, unabridgedParting, HOW, CLASS_OF } from "./place-answers-bridges-v1.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const sourcesPath = process.argv[2];
if (!sourcesPath) { console.error("usage: build-place-answers-entries-v1.mjs <sources.json> [out dir]"); process.exit(2); }
const OUT = resolve(process.argv[3] || join(here, "..", "data", "place-answers-v1"));
const cfg = JSON.parse(readFileSync(sourcesPath, "utf8"));
const log = (...a) => console.log(...a);

export const RULE = "A reading stands at a word only where a source puts it there by that source's own address, or by a bridge that a source declares. Nothing is matched by bare letters. Each source's own structure is held whole inside whatever we do with it.";

// ---------------------------------------------------------------- read
const pin = {}; // source key -> files
const file = (key, role, path, facts) => {
  const s = readSource(path);
  (pin[key] ||= []).push({ role, file: basename(path), bytes: s.bytes, sha256: s.sha256, ...facts });
  return s;
};
const made = {};
const writeEntries = (key, head, built) => {
  const obj = { schema: "PLACE_ANSWERS_ENTRIES_V1", source_key: key, rule: RULE, ...head, read_from: pin[key], counts: built.counts, entries: built.entries };
  const w = writeGzJson(join(OUT, "entries", key + ".json.gz"), obj);
  made["entries/" + key + ".json.gz"] = { bytes: w.bytes, sha256: w.sha256, raw_bytes: w.raw_bytes, entries: Object.keys(built.entries).length };
  log(key.padEnd(36), String(Object.keys(built.entries).length).padStart(6), "entries", String(w.bytes).padStart(9), "bytes");
};

const os = cfg.open_scriptures;
const stepDir = cfg.step.dir;
const stepNames = readdirSync(stepDir);
const stepFile = (prefix) => { const n = stepNames.find((x) => x.startsWith(prefix)); if (!n) throw new Error("STEP file not found: " + prefix); return join(stepDir, n); };

// Strong's, the Wikisource edition (the witness for Strong's signs) -------
const wsRecords = file("wikisource_strongs_explicit_forms", "the corpus lane's record of the edition's nine wikitext files, one line per entry, the entry's wikitext whole in the field D", cfg.wikisource.records, cfg.wikisource.records_facts);
const wsPages = (cfg.wikisource.pages || []).map((p) => ({ name: basename(p.path), text: file("wikisource_strongs_explicit_forms", "a page of the edition as its site gave it (raw wikitext)", p.path, p.facts).buf.toString("utf8") }));
const ws = buildWikisource({ recordsText: wsRecords.buf.toString("utf8"), recordsName: basename(cfg.wikisource.records), pages: wsPages });
writeEntries("wikisource_strongs_explicit_forms", {
  keyed_by: "Strong's number (H1 … H8674), the number the edition heads each entry with (==N==)",
  kept: "per entry: the headline (headword and pronunciation) and the definition whole, as the edition writes them; where the list of renderings opens (the edition's sign for Strong's «:--») and stops; the renderings, each item whole as Strong condensed it, with his sign apart (the edition writes his multiplication sign as a capital X); what follows the list's stop; the links to other entries; the entry's spelled forms and the verses it lists for them",
  how_a_string_is_held: "every string is a run of the entry's wikitext: `at` is its offset (in UTF-16 units) in that text, which is the field D of the record line named in read_from, or the text of the page file from the byte named there to the next entry's heading. A form line is kept as its forms and verses in order; joined again with «, » and « - [[» … «]] ; [[» … «]]» it is the line",
  entries_not_on_hand: "the edition has an entry for every number; 6,178 are on hand (5,806 in the record file, and all 1,000 of the page H1). The other pages (H0, H2 to H8) are not on this machine and the edition's site is not reachable from it",
}, ws);

// Strong's, the Open Scriptures file --------------------------------------
const strongsSrc = file("openscriptures_strongs", "HebrewStrong.xml", join(os.dir, "HebrewStrong.xml"), os.facts);
const strongs = buildOpenScripturesStrongs({ buf: strongsSrc.buf, wikisource: ws.entries });
writeEntries("openscriptures_strongs", {
  keyed_by: "Strong's number as the file writes it (<entry id=\"H1961\">)",
  kept: "per entry: the entry whole as the file has it (x: a tree that writes back to the file's bytes); the headword with its part of speech, pronunciation, transliteration and language; the derivation (source), the meaning and the usage, each as running text with where each <def> and each link to another entry stood; in the usage, Strong's list of renderings as he lists it (each item whole, his sign apart), where the list stops, and what follows the stop (his pointer to other entries, with the links, or his remark); the provider's own notes apart from Strong's words",
  how_a_string_is_held: "x written back (place-answers-entries-lib-v1, writeMarkup) is the file's bytes from at[0] to at[1]. A field's text (t) is its text with the tags out and the provider's <note> elements left out; a def is [offset, length] in that text; a rendering's `at` is its offset in the usage text. Nothing is respelled and no blank is closed",
  signs: "Strong's own key (SIGNS EMPLOYED): + a rendering of one or more Hebrew words in connection with this one; x (multiplication) a rendering from a Hebrew idiom; ( ) a word or syllable sometimes given with the principal word; [ ] the inclusion of an additional word in the Hebrew. An item's `sign` is the sign the file writes before it. `lost_sign_trace` is true where the item opens after two or more blanks and carries no sign (the file lost Strong's +); `wikisource_sign` is the sign the Wikisource edition writes on the same rendering of the same entry",
  unbalanced: "where the file's brackets do not balance, the run is held whole and says so (unbalanced, comma_pieces_held_whole); which bracket is the slip is not decided",
}, strongs);

// TBESH -------------------------------------------------------------------
const tbeshSrc = file("stepbible_tbesh_gloss", "TBESH", stepFile("TBESH"), cfg.step.facts);
const tbesh = buildTbesh({ buf: tbeshSrc.buf });
writeEntries("stepbible_tbesh_gloss", {
  keyed_by: "STEP's own lettered number (dStrong: the second column up to the «=»), e.g. H1254A",
  kept: "per line: the first seven columns as the file has them (eStrong#, dStrong with the relation after its «=», uStrong, Hebrew, Transliteration, Morph, Gloss), the line's number and byte offset. NOT the eighth column (Meaning): the file says «Permission should be gained from Online Bible before these definitions are applied in any project»",
  how_a_string_is_held: "each kept column equals the same column of the file's line (split at tabs); `relation` is the text after the «=» of the second column",
  header: tbesh.header,
}, tbesh);

// BDB and the Lexical Index (Open Scriptures) -----------------------------
const bdbSrc = file("openscriptures_bdb_1906", "BrownDriverBriggs.xml", join(os.dir, "BrownDriverBriggs.xml"), os.facts);
for (const n of ["BdbSchema.xsd", "readme.md"]) file("openscriptures_bdb_1906", n + " (the provider's own account of the file; read by the builder, not parsed)", join(os.dir, n), os.facts);
const bdb = buildOpenScripturesBdb({ buf: bdbSrc.buf });
writeEntries("openscriptures_bdb_1906", {
  keyed_by: "BDB's id as the file writes it (<entry id=\"p.ff.ab\">): part, section, entry",
  kept: "per entry: the entry whole (x); its type (the file marks a root entry type=\"root\"; the schema's default is \"entry\"), its numeral (mod), form and cite attributes; its running text with the tags out (the provider's <status> held apart); its senses in their own nesting, each with its number (n), its place in the text and its stems; and where each tag stood: every <def> (with the sense it stands in; `joined` where the tag broke a word, e.g. «(sun)» + «set»; `phrase` where neighboring defs are one phrase parted only by brackets, e.g. «I (we) pray»; in_bracket and before_first_sense where it stands in a bracket of the entry's opening; after_hebrew and ref_next where a Hebrew word stands right before it or a reference right after), every <ref> with the sense it stands in, every <w>, <pos>, <stem>, <asp>, <foreign>, <em>",
  how_a_string_is_held: "x written back is the file's bytes from at[0] to at[1]. `text` is the text of x without <status>; every t is text.slice(at, at + t.length). The file's own character references (&amp; and the like) stand as written; a reader that prints resolves them (place-answers-entries-lib-v1, printable). A sense path is a list of indexes into the nested senses",
  the_files_own_account: "readme.md: «BrownDriverBriggs.xml contains the current BDB content. It remains a work in progress.» The documentation (HebrewLexicon.pdf): «The <def> element contains a definition, as distinguished in BDB either by bold face or by italics.»",
}, bdb);
const liSrc = file("openscriptures_lexical_index", "LexicalIndex.xml", join(os.dir, "LexicalIndex.xml"), os.facts);
const li = buildLexicalIndex({ buf: liSrc.buf });
writeEntries("openscriptures_lexical_index", {
  keyed_by: "the index's own id (<entry id=\"aab\">)",
  kept: "per entry, as given: the entry whole (x); the headword and its transliteration, the part of speech, the gloss (def), the cross-reference (xref: BDB's id, Strong's number, the added letter «aug» where the index parts a number, the TWOT number), the etymology line, and the language of the part it stands in",
  how_a_string_is_held: "x written back is the file's bytes from at[0] to at[1]; w, pos, def and etym.t are the text of those elements, the xref's values its attributes",
}, li);

// BDB, unabridged -----------------------------------------------------------
const ub = cfg.unabridged_bdb;
const zipSrc = file("unabridged_bdb_1906", "the zip as the provider gives it", ub.zip, ub.facts);
if (ub.readme) file("unabridged_bdb_1906", "README.md (the provider's own account; read by the builder, not parsed)", ub.readme, ub.facts);
const csv = zipMember(zipSrc.buf, ub.member);
pin.unabridged_bdb_1906.push({ role: "the member read out of the zip", file: ub.member, bytes: csv.length, sha256: sha256(csv) });
const ubdb = buildUnabridgedBdb({ csv });
writeEntries("unabridged_bdb_1906", {
  keyed_by: "BDB's id as the file writes it in its first column (BDB5808)",
  kept: "per record: the record whole (k: the pieces of its text, which write back to the line's bytes); its Strong's numbers as the provider's second column gives them; its language (the record's own navigation line: BIBLICAL HEBREW or BIBLICAL ARAMAIC); its paragraphs (the file parts them by <hr>), each with its head (headword, BDB's numeral, the bold runs, the main gloss) and its numbered points in order with their sub-points; every italic run with what it is where the record's structure tells (see kinds), every bold run. The references stand in k as [\"ref\", text, book number, chapter, verse, to chapter, to verse]",
  how_a_string_is_held: "id + tab + strong_column + tab + the pieces written back (place-answers-entries-unabridged-bdb-v1, writePieces) is the file's line, bytes at[0] to at[1] of the member read out of the zip. Every italic and bold run of the view names the piece it is (k) and holds that piece's text",
  kinds: {
    main_gloss: "the run stands in <highlightword>, the provider's own tag for the entry's meaning, in a paragraph's head",
    tagged_gloss: "the same tag inside a point",
    other_language: "it stands inside <transliteration>, or the text right before it ends with Latin, German, French or Vulgate",
    abbreviation: "its whole text is id., ib. or ibid.",
    outline_letter: "its whole text is one letter",
    grammar_word: "its whole text is made only of written-out grammar words (Perfect, Imperfect, Participle, Infinitive construct, preposition …; the list is in the tool)",
    verse_wording: "a Hebrew run stands right before it (blanks only between) and a reference right after it (blanks and stops only): the English of the verse the reference names (ref_k is that reference's piece)",
    rendering_of_hebrew: "a Hebrew run stands right before it and no reference right after: the English of the Hebrew just quoted",
    opening: "the first italic run of its head, point or sub-point, before that unit's first reference and outside every bracket: the unit opens with it",
    unclassed: "none of the above: the record's structure does not tell what the run is",
  },
  the_files_own_account: "README: «highlight { font-style: italic; }»; «This file contains Strong's number mapping, where applicable (2nd column)»; «Known issues: pending corrections of cross-references, where <checkingNeeded/> or <wrongReferenceRemoved/> are located.»",
}, ubdb);

// The UBS dictionary --------------------------------------------------------
const ubsSrc = file("ubs_sdbh_hebrew_v0_9_2", "the dictionary's JSON, English", cfg.ubs.json, cfg.ubs.facts);
for (const extra of cfg.ubs.also || []) file("ubs_sdbh_hebrew_v0_9_2", extra.role, extra.path, cfg.ubs.facts);
const ubs = buildUbs({ buf: ubsSrc.buf });
writeEntries("ubs_sdbh_hebrew_v0_9_2", {
  keyed_by: "the entry's MainId",
  kept: "the file's own structure under the file's own field names: the entry (MainId, Lemma, StrongCodes, AlternateLemmas, HasAramaic, Notes), its BaseForms (BaseFormID, PartsOfSpeech, MeaningsOfName, RelatedLemmas, RelatedNames), each base form's LEXMeanings, the senses (LEXID, LEXEntryCode, LEXIndent, LEXDomains, LEXForms, LEXCollocations, LEXSynonyms, LEXAntonyms, LEXLinks, the LEXSenses with DefinitionShort, DefinitionLong, Glosses and Comments, and LEXReferences, the verses the sense cites). `i` is the entry's place in the file's list. A field that is null or empty in the file is left out; the editors' stamps are not kept",
  kept_fields: UBS_KEPT,
  where_the_strong_codes_sit: "on the entry only (StrongCodes). No base form and no sense of the file carries a code (counted: strong_codes_on_a_base_form_or_a_sense). An entry of several base forms lists the codes of all of them together; which code is which base form's, the file does not say",
  how_a_string_is_held: "every kept value equals the value of the same field of the same entry (by `i`), base form and sense of the file read as JSON",
  the_files_own_account: "README: «{S:00200300100012} is an encoded Scripture reference, pointing to Exodus 3:1, word element 6. The key to the encoding is BBBCCCVVVSSWWW (Book, Chapter, Verse, Segment, Word) … Words are counted using even numbers only.»",
  version: cfg.ubs.version_note,
}, ubs);
let ubsEarlier = null;
if (cfg.ubs.earlier_json) {
  const e = readSource(cfg.ubs.earlier_json);
  const b = buildUbs({ buf: e.buf });
  const lemmasNow = new Set(Object.values(ubs.entries).map((x) => x.Lemma)), lemmasThen = new Set(Object.values(b.entries).map((x) => x.Lemma));
  const idThen = new Map(Object.values(b.entries).map((x) => [x.Lemma, x.MainId]));
  let moved = 0, codesChanged = 0;
  const codesThen = new Map(Object.values(b.entries).map((x) => [x.Lemma, JSON.stringify(x.StrongCodes)]));
  for (const x of Object.values(ubs.entries)) { if (idThen.has(x.Lemma) && idThen.get(x.Lemma) !== x.MainId) moved++; if (codesThen.has(x.Lemma) && codesThen.get(x.Lemma) !== JSON.stringify(x.StrongCodes)) codesChanged++; }
  ubsEarlier = { file: basename(cfg.ubs.earlier_json), bytes: e.bytes, sha256: e.sha256, ...cfg.ubs.earlier_facts, counts: b.counts,
    against_the_one_read: { entries_only_in_the_earlier_by_lemma: [...lemmasThen].filter((l) => !lemmasNow.has(l)).length, entries_only_in_the_later_by_lemma: [...lemmasNow].filter((l) => !lemmasThen.has(l)).length,
      entries_of_the_same_lemma_whose_MainId_moved: moved, entries_of_the_same_lemma_whose_StrongCodes_changed: codesChanged } };
}

// UHAL ----------------------------------------------------------------------
const uhalSrc = file("unfoldingword_uhal", "the corpus lane's record of the lexicon's files, one line per file, the file whole in the field D", cfg.uhal.records, cfg.uhal.facts);
const uhal = buildUhalFromRecords({ recordsText: uhalSrc.buf.toString("utf8"), recordsName: basename(cfg.uhal.records) });
writeEntries("unfoldingword_uhal", {
  keyed_by: "Strong's number as the file writes it under its Word data (Strongs: H0043), which is also the file's name",
  kept: "per file, as given: the file's text whole (text), and a view of its own headings: the headword, the Strong's and TWOT numbers, the BDB reference (the Open Scriptures BDB id the file links to), the part of speech, and each sense with its definition, its glosses (the file separates them by semicolons), its explanation and its citations",
  how_a_string_is_held: "text is the field D of the record line named in read_from; every t of the view is text.slice(at, at + t.length)",
  entries_not_on_hand: cfg.uhal.not_on_hand,
}, uhal);

// ---------------------------------------------------------------- bridges
const src = { openscriptures_strongs: strongs.entries, wikisource_strongs_explicit_forms: ws.entries, stepbible_tbesh_gloss: tbesh.entries,
  openscriptures_lexical_index: li.entries, openscriptures_bdb_1906: bdb.entries, unabridged_bdb_1906: ubdb.entries, ubs_sdbh_hebrew_v0_9_2: ubs.entries, unfoldingword_uhal: uhal.entries };
const KEYS = Object.keys(src);
const tahot = TAHOT_PREFIXES.map((p) => { const path = stepFile(p); const s = file("stepbible_tahot_tags", "TAHOT (read for its tags only: every part of every word)", path, cfg.step.facts); return { name: basename(path), buf: s.buf }; });
const { tags, counts: tagCounts } = readTags(tahot);
const bridge = bridgeTags({ tags, src });
const bridgeCounts = {};
for (const k of KEYS) bridgeCounts[k] = countBridge(bridge, k);

// the lettered homonyms: a tag whose number reaches two or more BDB entries
const homonyms = { openscriptures_bdb_1906: { tags: 0, rows: 0, parted_by_the_open_scriptures_letter: { tags: 0, rows: 0 }, parted_because_the_entries_name_one_bdb_entry: { tags: 0, rows: 0 }, not_parted: { tags: 0, rows: 0 }, of_those_tags_lettered_by_step: { tags: 0, rows: 0 } },
  unabridged_bdb_1906: { tags: 0, rows: 0, not_parted: { tags: 0, rows: 0 }, of_those_tags_lettered_by_step: { tags: 0, rows: 0 }, of_those_the_open_scriptures_bridge_is_exact: { tags: 0, rows: 0 } } };
const liByNumber = new Map();
for (const e of Object.values(li.entries)) if (e.xref && /^\d+$/.test(e.xref.strong || "")) liByNumber.set(+e.xref.strong, (liByNumber.get(+e.xref.strong) || new Set()).add(e.xref.bdb || ""));
for (const [tag, row] of Object.entries(bridge)) {
  const m = /^H(\d{4})([A-Za-z]?)$/.exec(tag);
  if (!m) continue;
  const N = +m[1], lettered = !!m[2];
  const bdbIds = liByNumber.get(N);
  const h = homonyms.openscriptures_bdb_1906;
  if (bdbIds && [...bdbIds].filter(Boolean).length >= 2) {
    h.tags++; h.rows += row.n[0];
    if (lettered) { h.of_those_tags_lettered_by_step.tags++; h.of_those_tags_lettered_by_step.rows += row.n[0]; }
    const how = row.openscriptures_bdb_1906[0];
    const slot = how === "E" ? h.parted_by_the_open_scriptures_letter : how === "S" ? h.parted_because_the_entries_name_one_bdb_entry : h.not_parted;
    slot.tags++; slot.rows += row.n[0];
  }
  const u = homonyms.unabridged_bdb_1906;
  if (row.unabridged_bdb_1906[0] === "A") {
    u.tags++; u.rows += row.n[0]; u.not_parted.tags++; u.not_parted.rows += row.n[0];
    if (lettered) { u.of_those_tags_lettered_by_step.tags++; u.of_those_tags_lettered_by_step.rows += row.n[0]; }
    if (CLASS_OF[row.openscriptures_bdb_1906[0]] === "exact") { u.of_those_the_open_scriptures_bridge_is_exact.tags++; u.of_those_the_open_scriptures_bridge_is_exact.rows += row.n[0]; }
  }
}
const agreement = headwordAgreement(bridge, src);
const parting = unabridgedParting(bridge, src);
homonyms.unabridged_bdb_1906.what_the_files_state_that_could_part_them_measured_not_applied = parting.counts;

const wBridge = writeGzJson(join(OUT, "bridges", "step-tag-to-entry.json.gz"), {
  schema: "PLACE_ANSWERS_TAG_BRIDGE_V1", rule: RULE,
  what: "for every tag STEP's TAHOT uses on any part of any word (roots, prefixes, suffixes and marks alike), the entry or entries of each source it reaches and how. A tag's line: n = [rows (words) it stands on, parts it tags, parts where it is the root (in curly brackets)]; then per source [how, entry id, …]",
  how: HOW, class_of: CLASS_OF, sources: KEYS,
  tags_read_from: pin.stepbible_tahot_tags, tag_counts: tagCounts, counts: bridgeCounts, lettered_homonyms: homonyms,
  headwords_measured_not_used: agreement,
  tags: bridge,
});
made["bridges/step-tag-to-entry.json.gz"] = { bytes: wBridge.bytes, sha256: wBridge.sha256, tags: Object.keys(bridge).length };
const WOULD_PART = {
  openscriptures_strongs: null, wikisource_strongs_explicit_forms: null, unfoldingword_uhal: null,
  stepbible_tbesh_gloss: "the tag is not a line of TBESH; the lines of its number differ by STEP's own letter, which this tag does not carry",
  openscriptures_lexical_index: "the Open Scriptures letter (aug): TBESH's first column gives this tag none, or the tag is not a line of TBESH",
  openscriptures_bdb_1906: "the Open Scriptures letter (the Lexical Index's aug): TBESH's first column gives this tag none; each entry's own numeral and headword are listed",
  unabridged_bdb_1906: "nothing in the files: the provider's number column carries no letter and no id of the other BDB file. Each record's own numeral, headword and main gloss are listed; at a place, the record's references (the verse bridge) can part them",
  ubs_sdbh_hebrew_v0_9_2: "nothing in the files that STEP shares: UBS writes a letter of its own on some codes (H0859b), which is not STEP's letter. Each entry's lemma and codes are listed; at a place, the verse lists of the senses (the verse bridge) and MACULA's sense mark part them",
};
for (const k of KEYS) {
  const amb = ambiguousOf(bridge, k, src);
  if (k === "unabridged_bdb_1906") for (const [t, p] of Object.entries(parting.per)) amb[t].measured_not_applied = p;
  const w = writeGzJson(join(OUT, "bridges", "step-tag-to-" + k + ".json.gz"), {
    schema: "PLACE_ANSWERS_TAG_BRIDGE_OF_ONE_SOURCE_V1", source_key: k, rule: RULE, how: HOW, class_of: CLASS_OF,
    counts: bridgeCounts[k], what_would_part_the_ambiguous: WOULD_PART[k], ambiguous: amb,
    absent_tags: Object.entries(bridge).filter(([, r]) => CLASS_OF[r[k][0]] === "absent" && r[k][0] !== "P").map(([t, r]) => [t, r[k][0], r.n[0]]),
  });
  made["bridges/step-tag-to-" + k + ".json.gz"] = { bytes: w.bytes, sha256: w.sha256, ambiguous_tags: Object.keys(amb).length };
}

// verses ----------------------------------------------------------------
const zones = {};
for (const b of OUR_BOOKS) {
  const z = readSource(join(cfg.zones_dir, b + ".bin"));
  (pin.our_text ||= []).push({ role: "the zone of the book (read for its verse labels only)", file: b + ".bin", bytes: z.bytes, sha256: z.sha256 });
  zones[b] = JSON.parse(gunzipSync(z.buf).toString("utf8"));
}
const ours = ourVerses(zones);
const verseBridges = {};
const hebrewNames = {}; for (const [name, slug] of BY_HEBREW_NAME) hebrewNames[name] = slug;
for (const [k, fn, table, value] of [
  ["openscriptures_bdb_1906", versesOfOpenScripturesBdb, { the_sources_names: "OSIS book names, as the file writes them in <ref r=\"Job.8.12\">", to_ours: BY_OSIS }, "[BDB id, the sense's path (indexes into the entry's nested senses; null where the reference stands outside every sense), the reference's index in the entry's refs]"],
  ["unabridged_bdb_1906", versesOfUnabridgedBdb, { the_sources_names: "the book's number in the order of the English Bible, 1 Genesis … 39 Malachi, as the file writes it in <ref b=\"18\"> (its README lists the 66 numbers; 40 and above are the New Testament)", to_ours: BY_ENGLISH_NUMBER }, "[BDB id, paragraph, point (-1: the paragraph's head), sub-point (-1: none), the reference's piece index in k]"],
  ["ubs_sdbh_hebrew_v0_9_2", versesOfUbs, { the_sources_names: "the book's number BBB of BBBCCCVVVSSWWW, in the order of the English Bible (the file's README: «{S:00200300100012} … pointing to Exodus 3:1»)", to_ours: BY_ENGLISH_NUMBER }, "[the sense's LEXID, the word number WWW as the file counts words (even numbers)]"],
]) {
  const r = fn(src[k], ours.verses);
  r.stats.our_verses = ours.count;
  const w = writeGzJson(join(OUT, "bridges", "verse-to-sense-" + k + ".json.gz"), {
    schema: "PLACE_ANSWERS_VERSE_BRIDGE_V1", source_key: k, rule: RULE,
    what: "from a verse of our text to the senses of this source that cite it. verses[book slug][chapter:verse] is a list of values, each " + value,
    book_table: table, versification: "a reference is taken at the chapter and verse the source writes; it is indexed only where our text (the zones' section labels) has a verse of that number. References to a verse our text does not number so are counted, not moved",
    counts: r.stats, verses: r.index, ...(r.chapters ? { chapters_cited_whole: r.chapters } : {}),
  });
  verseBridges[k] = r.stats;
  made["bridges/verse-to-sense-" + k + ".json.gz"] = { bytes: w.bytes, sha256: w.sha256, verses_cited: r.stats.verses_cited };
}

// ---------------------------------------------------------------- PIN
const counts = { wikisource_strongs_explicit_forms: ws.counts, openscriptures_strongs: strongs.counts, stepbible_tbesh_gloss: tbesh.counts, openscriptures_bdb_1906: bdb.counts,
  openscriptures_lexical_index: li.counts, unabridged_bdb_1906: ubdb.counts, ubs_sdbh_hebrew_v0_9_2: ubs.counts, unfoldingword_uhal: uhal.counts };
writeJson(join(OUT, "PIN.json"), {
  schema: "PLACE_ANSWERS_PIN_V1",
  part: "entries and bridges (builder E). The places (builder P) pin their own sources in their own tree; the two are to be joined under these same keys",
  of: cfg.of, rule: RULE,
  made_by: "reader/tools/build-place-answers-entries-v1.mjs <sources.json>; checked by reader/tools/check-place-answers-entries-v1.mjs",
  sources: Object.fromEntries(Object.keys(pin).map((k) => [k, { ...(cfg.about && cfg.about[k] ? cfg.about[k] : {}), files: pin[k] }])),
  ubs_earlier_version: ubsEarlier,
  left_for_now: cfg.left_for_now,
  counts, tag_counts: tagCounts, bridge_counts: bridgeCounts, lettered_homonyms: homonyms, headwords_measured_not_used: agreement, verse_bridges: verseBridges, our_verses: ours.count,
  made,
});
log("tags", Object.keys(bridge).length, "rows", tagCounts.rows, "our verses", ours.count);
log("written under", OUT);
