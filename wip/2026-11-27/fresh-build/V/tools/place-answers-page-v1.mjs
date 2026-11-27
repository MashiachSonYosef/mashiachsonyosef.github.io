// Page lane · place-answers-rule-v1-a-reading-stands-at-a-word-only-where-a-source-puts-it-there-by-that-sources-own-address
// LEDGER: -
// no frame letter. The shape of data/place-answers-v1/page/ said once, and
// the rules by which it is projected from the places, the entries and the
// bridges. It reads nothing by itself and writes nothing.
//
// WHY THIS IS A FILE. The second reader (reader/place.html) shows the 39
// books from the place answers alone. Its files are a projection by rule:
// tools/project-place-answers-page-v1.mjs writes them, and
// tools/check-place-answers-page-v1.mjs holds every string of them to the
// places and the entries. The two must agree on the shape, on which keys of a
// dictionary's entry the page leaves out, on how a tag and a record are filed
// into small files, and on the few sentences that are ours (how our text and
// STEP's meet at a word). Those live here. What the check must NOT share
// with the projection is the finding of a source's answer at a place: the
// check looks every such answer up again in the bridges and the entries by
// the address the page file states.
//
// THE RULE OF THE PAGE. The card shows what each source says here, by that
// source's own address, and then each dictionary's own entry. Nothing is
// matched by letters; there is no pool of readings.
//
//   STEP        the row or rows our word meets (the places), each part with
//               its English exactly as STEP writes it and its tag
//   MACULA      the word's morphs with MACULA's two English columns
//   UBS         the senses that cite this very word: the dictionary cites
//               verse and word. Its word number is in no other file; it is
//               reckoned through MACULA's morph rows (twice the place of the
//               morph row in the verse, suffixes and the Aramaic article
//               ending not counted, a word number MACULA's table skips
//               counted as one: measured by the places' builder, 96.4 in 100)
//               and CORROBORATED at every word: a sense is laid on the word
//               only where its entry is one the word's tag reaches, or its
//               lemma is MACULA's lemma for the morph. Where the tag's entry
//               cites the verse at another number, that is said as a citation
//               of the verse, never as this word's.
//   BDB         (both files) of the entries the word's tag reaches, the
//               senses that cite this verse. BDB cites a verse, not a word.
//
// No Hebrew letter stands in this file: a letter is named by its code point.
import { changesFromText } from "./place-answers-meet-v1.mjs";

export const PAGE_RULE_ID = "place-answers-rule-v1-a-reading-stands-at-a-word-only-where-a-source-puts-it-there-by-that-sources-own-address";
export const PAGE_RULE = "The card shows what each source says at this word, by that source's own address, and then each dictionary's own entry. Every string of these files is a string of the places, the entries or the zones, but for the sentences that say how our text and STEP's meet at a word, which are made by rule from the places' record. Nothing is matched by letters.";
export const CHAPTER_SCHEMA = "PLACE_ANSWERS_PAGE_CHAPTER_V1";
export const TAGS_SCHEMA = "PLACE_ANSWERS_PAGE_TAGS_V1";
export const UNABRIDGED_SCHEMA = "PLACE_ANSWERS_PAGE_UNABRIDGED_BDB_V1";
export const INDEX_SCHEMA = "PLACE_ANSWERS_PAGE_INDEX_V1";
export const PAGE_PIN_SCHEMA = "PLACE_ANSWERS_PAGE_PIN_V1";

/** The dictionaries of the card, in the card's own fixed order. */
export const DICTIONARIES = ["stepbible_tbesh_gloss", "openscriptures_strongs", "openscriptures_bdb_1906", "unabridged_bdb_1906", "ubs_sdbh_hebrew_v0_9_2", "openscriptures_lexical_index", "unfoldingword_uhal"];
/** The dictionaries whose entries ride whole in a tag's small file (the unabridged BDB's records are filed apart: they are large). */
export const INLINE = DICTIONARIES.filter((k) => k !== "unabridged_bdb_1906");

/** The keys of a dictionary's entry the page leaves out, and why. Everything
 *  else of the entry stands in the page's file exactly as the entries hold it. */
export const LEFT_OUT = {
  stepbible_tbesh_gloss: { keys: ["line", "at"], why: "where the line stands in the file" },
  openscriptures_strongs: { keys: ["x", "at"], why: "the entry as a tree that writes back to the file's bytes, and its byte offsets; the view beside it holds every word of it" },
  openscriptures_lexical_index: { keys: ["x", "at"], why: "the same" },
  openscriptures_bdb_1906: { keys: ["x", "at"], why: "the same" },
  ubs_sdbh_hebrew_v0_9_2: { keys: ["i"], sense_keys: ["LEXReferences"], why: "the entry's place in the file; and each sense's list of the verses it cites, of which the page keeps the count (verses_cited)" },
  unfoldingword_uhal: { keys: ["text", "read_from"], why: "the file's text whole and where it was read from; the view of its own headings holds what the card prints" },
  unabridged_bdb_1906: { keys: ["line", "at"], why: "where the line stands in the file" },
};

/** A dictionary's entry as the page holds it: the entry of entries/ with the
 *  keys of LEFT_OUT taken away, and nothing changed. */
export function pageEntry(key, e) {
  const rule = LEFT_OUT[key];
  const out = {};
  for (const k of Object.keys(e)) if (!rule.keys.includes(k)) out[k] = e[k];
  if (key === "ubs_sdbh_hebrew_v0_9_2" && Array.isArray(e.BaseForms)) {
    out.BaseForms = e.BaseForms.map((b) => (Array.isArray(b.LEXMeanings) ? { ...b, LEXMeanings: b.LEXMeanings.map((m) => { const c = {}; for (const k of Object.keys(m)) if (!rule.sense_keys.includes(k)) c[k] = m[k]; c.verses_cited = (m.LEXReferences || []).length; return c; }) } : b));
  }
  return out;
}
/** What a tag's small file holds of an unabridged BDB record, so that the card
 *  can print one line for it before the whole record is fetched: its numbers,
 *  its language, how many paragraphs it has, and the head of its first one. */
export const unabridgedHead = (e) => ({ strong: e.strong, language: e.language, paragraphs: e.blocks.length, head: e.blocks[0].head });

// ---- how tags and records are filed into small files
export const TAG_FILE_SPAN = 50, UNABRIDGED_FILE_SPAN = 50;
const pad3 = (n) => String(n).padStart(3, "0");
/** The small file a tag stands in: by its number, fifty numbers a file. */
export const tagFile = (tag) => { const m = /^H(\d{4})/u.exec(tag); return m ? pad3(Math.floor(Number(m[1]) / TAG_FILE_SPAN)) : null; };
/** The small file an unabridged BDB record stands in: by its number, fifty a file. */
export const unabridgedFile = (id) => { const m = /^BDB(\d+)$/u.exec(id); return m ? pad3(Math.floor(Number(m[1]) / UNABRIDGED_FILE_SPAN)) : null; };
/** STEP's own numbers for a prefix, a suffix or a mark: no dictionary of Strong's numbers has them. */
export const isStepsOwn = (tag) => /^H9\d\d\d$/u.test(tag);

/** The shape, in words; written into page/index.json. */
export const SHAPE_WORDS = {
  files: "page/index.json (this file) · page/<book>/<chapter>.json.gz, a chapter · page/entries/t/<nnn>.json.gz, the dictionaries under the STEP tags whose number is nnn*50 to nnn*50+49 · page/entries/u/<nnn>.json.gz, the unabridged BDB's records BDB<nnn*50> to BDB<nnn*50+49> whole · page/PIN.json. Every .json.gz is the gzip of one JSON object",
  chapter: "{book, chapter, title (the zone's own name of the book), credit (the credit line of our text), marks {kind: what the zone says the mark is}, verses}",
  verse: "{l: the verse's label, e: its entries in our text's order, un: STEP's rows of this verse that no word of ours meets, each [STEP's reference, its Hebrew, its English]}",
  entry: "a mark {m: its kind, s: as our text writes it} or a word {i: its place among the section's entries (marks counted), s: as our text writes it, k: 1 written and read, 2 written and not read, 3 read and not written (left off: a plain word), f: its forms in our text's order}",
  form: "{r: 1 the form read, 2 the form written (left off: a plain word), s: the form as our text writes it (a pair's forms), t: STEP here, m: MACULA here, mo: MACULA's morphs where another word stands in its text, h: the senses that cite this very place}",
  step: "t = {w: how the word meets STEP's rows (0 no row; 1 one for one; 2 one of ours, two or three rows; 3 one row that marks two words; 4 one of the words a row holds, STEP's seam mark between; 5 two of ours, one of theirs, parted at STEP's part cut; 6 the same with no mark at the seam), rows: STEP's own references, l: the letters by which our spelling differs as the places name them (left off: the same letters; 1: another word stands there), p: STEP's parts, other: STEP's word where another word stands [[Hebrew, English]], wf: 1 the meeting is on STEP's written form (its «K=» variant), vn: STEP's Hebrew verse number where it is not ours, d: 1 where the two editions differ in the word, say: the sentences that say how}",
  part: "[English exactly as STEP writes it (null where STEP gives a form's Hebrew only), the tag (the key to page/entries/t/), 1 where STEP marks the part as the root, STEP's Hebrew of the part, 1 where STEP writes «+» after the tag (it also covers the next word)]",
  macula: "m = MACULA's morphs of the word, each [its gloss column, its english column, its Hebrew]",
  here: "h = {u: the UBS dictionary, o: BDB in the Open Scriptures file, b: BDB in the unabridged file}",
  here_ubs: "[the sense's id (LEXID), how, its glosses, the Hebrew of MACULA's morph the citation lands on, the word number the dictionary cites] · how: 0 the dictionary cites this very word and the entry is one the word's tag reaches; 1 it cites this very word and the entry's lemma is MACULA's lemma here (the tag reaches no entry of this dictionary); 2 the tag's entry cites this verse at another word number than this word's as reckoned; 3 the same, where MACULA has no word here to reckon the number by",
  here_bdb_open_scriptures: "[BDB's id, the sense's path (indexes into the entry's nested senses; null: outside every sense), the sense's label, the defs that stand in it, the tag that reaches the entry]",
  here_bdb_unabridged: "[the record's id, paragraph, point (-1: the paragraph's head), sub-point (-1: none), the point's label, the sub-point's label, the italic runs that open the unit or carry the provider's gloss tag (at most three), the paragraph's headword, how many records the tag reaches, the tag]",
  tags_file: "{tags: {tag: {n: [words it stands on, parts, parts where it is the root], b: {dictionary: [how, entry id, …]}}}, entries: {dictionary: {id: the entry}}, unabridged: {id: the head of the record}} · how is the bridge's own letter (see how in this file)",
  entries: "a dictionary's entry is the entry of data/place-answers-v1/entries/ with the keys named in left_out taken away and nothing changed; a string keeps the source file's own character references (&amp; stays &amp;) and a reader that prints resolves them",
};

// ---- the sentences that are ours: how our text and STEP's meet at a word
const COUNT = ["no", "one", "two", "three", "four"];
/** The changes of a spelling, said: `letters` is the places' own naming among
 *  THEIR letters («+X@3», «-X@3», «X>Y@3», «X<>Y@3»). */
function spellingWords(letters, theirs) {
  const say = changesFromText(letters).map((p) => (p[0] === "+" ? `our text has the letter ${p[1]} more` : p[0] === "-" ? `our text has the letter ${p[1]} less` : p[0] === "x" ? `the letters ${p[1]} and ${p[2]} stand in the other order` : `our text writes ${p[1]} where ${theirs} writes ${p[2]}`));
  return `The two texts spell this ${theirs === "STEP's text" ? "word" : "form"} differently: ${say.join("; ")}.`;
}
/** The sentences for one form of a word. kind and role are the places' own
 *  words; o is the form's meeting with STEP opened (place-answers-places-v1,
 *  openStep) or null; R and W are a plain word's raw meetings on STEP's read
 *  and written lines. Returns { say, differs }: the sentences, and whether
 *  the two editions differ in the word (the page draws a small mark there). */
export function meetingWords({ kind, role, o, R, W }) {
  const say = []; let differs = false;
  if (kind === "written, not read") say.push("This word is written in the text and not read aloud.");
  if (kind === "read, not written") say.push("This word is read aloud and not written in the text.");
  if (!o) return { say, differs };
  if (o.way === 0) { say.push("STEP's text has no word that meets this one."); return { say, differs: true }; }
  if (o.letters === "another word") { say.push("Another word stands here in STEP's text; its reading is not laid on this word."); return { say, differs: true }; }
  const n = COUNT[o.rows.length] || String(o.rows.length);
  if (o.way === 2) { say.push(`Our text writes one word here; STEP's text writes it as ${n} words, and the English of all ${n} stands under it.`); differs = true; }
  if (o.way === 3) { say.push("Our text writes one word here; STEP's text marks two words in it."); differs = true; }
  if (o.way === 4) { say.push("STEP's text sets this word and its neighbor on one line and marks where the two part; each takes its own share."); differs = true; }
  if (o.way === 5) { say.push("Our text writes two words where STEP's text writes one; they part where STEP itself divides its word, and each takes its own share."); differs = true; }
  if (o.way === 6) { say.push("Our text writes two words where STEP's text writes one, with no division of STEP's between them; STEP's English for the whole stands under both."); differs = true; }
  if (o.letters !== "same") { say.push(spellingWords(o.letters, o.onWrittenForm ? "STEP's written form" : "STEP's text")); differs = true; }
  if (o.onWrittenForm && kind === "written, not read") say.push("STEP has no word of its own text here; it gives the written word among its other readings, with its English.");
  if (kind === "plain" && W) {
    // STEP reads this row one way and gives another as written; our text writes one plain word there
    const readSame = R && R[0] !== 0 && R[1] === 0, writtenSame = W[0] !== 0 && W[1] === 0;
    say.push(`STEP reads this word one way and gives another form as the one written. Our letters are ${readSame && writtenSame ? "those of both forms" : readSame ? "those of the form read" : writtenSame ? "those of the form written" : "neither form's exactly"}; the English is STEP's for the form it reads.`);
    differs = true;
  }
  if (o.parts.length && o.parts.every((p) => p.en === undefined)) say.push(o.parts.some((p) => p.whole === "does not cut alike") ? "STEP's note of this form does not divide like its word, so no English is laid on its parts." : "STEP records this form by its spelling only, with no English of its own.");
  if (o.verseNumberedOtherwise) say.push(`STEP numbers this verse ${o.rows[0].verse}${o.rows[0].englishVerse !== o.rows[0].verse ? ` (${o.rows[0].englishVerse} in English Bibles)` : ""}.`);
  return { say, differs };
}

// ---- reading the dictionaries' structures (for the lines that cite a place)
/** The Open Scriptures BDB: the label of a sense by its path (its stems and numbers down the nesting). */
export function bdbSenseLabel(e, path) {
  if (!path) return "";
  let senses = e.senses || [], label = "";
  for (const i of path) { const s = senses[i]; if (!s) break; label += (label ? " " : "") + (s.stems ? `${s.stems.join("/")} ` : "") + (s.n !== undefined ? `${s.n}.` : ""); senses = s.senses || []; }
  return label.replace(/\s+/gu, " ").trim();
}
/** The Open Scriptures BDB: the defs that stand in one sense (null: outside every sense), in the file's order;
 *  a def the tag broke out of a word is given with the word, neighbors that are one phrase as the phrase. */
export function bdbDefsOf(e, path) {
  const seen = new Set(); const out = [];
  for (const df of e.defs || []) {
    const same = path === null ? !df.sense : df.sense && df.sense.length === path.length && df.sense.every((x, j) => x === path[j]);
    if (!same) continue;
    if (df.phrase) { if (seen.has(df.phrase.at)) continue; seen.add(df.phrase.at); }
    out.push(df.phrase ? df.phrase.t : df.joined ? df.joined.whole : df.t);
  }
  return out;
}
/** The unabridged BDB: the unit a citation stands in: a point, or the paragraph's head (point -1), or a
 *  sub-point of either (a head has sub-points of its own where the record opens with lettered ones). */
export function unabridgedUnit(e, para, point, sub) {
  const blk = e.blocks[para]; const pt = point >= 0 ? (blk.points || [])[point] : null; const sb = sub >= 0 ? ((pt || blk.head).sub || [])[sub] : null;
  return { blk, pt, sb, unit: sb || pt || blk.head };
}
export const OPENING_KINDS = ["opening", "tagged_gloss", "main_gloss"];
/** The UBS dictionary: a sense by its id. */
export function ubsSense(entry, lexid) { for (const b of entry.BaseForms || []) for (const m of b.LEXMeanings || []) if (m.LEXID === lexid) return m; return null; }
export const ubsGlosses = (m) => ((m.LEXSenses || [])[0] || {}).Glosses || [];
export const ubsEntryId = (lexid) => `${lexid.slice(0, 6)}000000000`;
/** Only the Hebrew letters of a string (the corroboration of a UBS citation compares a lemma with MACULA's). */
export const lettersOnly = (x) => Array.from(String(x || "")).filter((ch) => { const c = ch.codePointAt(0); return c >= 0x5d0 && c <= 0x5ea; }).join("");

/** The UBS dictionary's word number of every morph row of MACULA's in a book:
 *  twice its place in the verse, suffixes and the Aramaic article ending not
 *  counted (0), a word number the table skips counted as one. */
export function ubsWordNumbers(P) {
  const doc = P.doc; const iId = doc.macula.columns.indexOf("xml:id"), iPos = doc.macula.columns.indexOf("pos"), iClass = doc.macula.columns.indexOf("class"), iLang = doc.macula.columns.indexOf("lang");
  const out = new Array(doc.macula.rows); let last = "", n = 0, lastWord = 0;
  for (let i = 0; i < doc.macula.rows; i += 1) {
    const cells = P.maculaCells(i); const id = cells[iId]; const v = id.slice(0, 9), word = Number(id.slice(9, 12));
    if (v !== last) { last = v; n = 0; lastWord = 0; }
    if (word > lastWord + 1) n += word - lastWord - 1;
    lastWord = word;
    if (cells[iPos] === "suffix" || (cells[iClass] === "art" && cells[iLang] === "A")) out[i] = 0; else { n += 1; out[i] = 2 * n; }
  }
  return out;
}

/** One form of one word as the page holds it. `f` is the form opened by the
 *  places' own reader (wordAt().forms[i]); `text` the form as our text writes
 *  it where the word is a pair; S the sources opened: { bridge, verses(key)
 *  → the verse bridge's table for this book, entries(key), numbers (the UBS
 *  word numbers of MACULA's morph rows) }. */
export function pageForm({ kind, f, text }, S) {
  const out = {};
  if (f.role !== "plain") out.r = f.role === "read" ? 1 : 2;
  if (text !== undefined) out.s = text;
  const o = f.role === "written" ? f.step.written : f.step.read;
  const dict = []; // the dictionary tags of the parts this form takes, in order
  if (o) {
    const t = { w: o.way };
    if (o.way !== 0) {
      t.rows = o.rows.map((r) => r.ref);
      if (o.letters === "another word") { t.l = 1; t.other = o.parts.map((p) => [p.he, p.en === undefined ? null : p.en]); }
      else {
        if (o.letters !== "same") t.l = o.letters;
        t.p = o.parts.map((p) => { const a = [p.en === undefined ? null : p.en, p.tag || null, p.root ? 1 : 0, p.he]; if (p.coversNext) a.push(1); return a; });
        for (const p of o.parts) if (p.tag && !isStepsOwn(p.tag) && !dict.includes(p.tag)) dict.push(p.tag);
      }
      if (o.onWrittenForm) t.wf = 1;
      if (o.verseNumberedOtherwise) t.vn = o.rows[0].verse;
    }
    const { say, differs } = meetingWords({ kind, role: f.role, o, R: f.raw.R, W: f.raw.W });
    if (differs) t.d = 1;
    if (say.length) t.say = say;
    out.t = t;
  }
  const mo = f.macula;
  if (mo && mo.way !== 0) {
    if (mo.letters === "another word") out.mo = mo.morphs.map((x) => [x.gloss, x.english, x.text]);
    else out.m = mo.morphs.map((x) => [x.gloss, x.english, x.text]);
  }
  // ---- the senses that cite this very place
  const h = { u: [], o: [], b: [] };
  const stepStands = o && o.way !== 0 && o.letters !== "another word";
  if (stepStands) {
    const hv = o.rows[0].verse; // STEP's Hebrew number of the row: both BDB files cite under it
    for (const tag of dict) {
      const row = S.bridge.tags[tag]; if (!row) continue;
      { // BDB, Open Scriptures: a value is [id, the sense's path or null, the reference's index]
        const ids = new Set(row.openscriptures_bdb_1906.slice(1)); const seen = new Set();
        for (const [id, path] of (S.verses("openscriptures_bdb_1906")[hv] || []).filter((x) => ids.has(x[0]))) {
          const k = `${id}|${path ? path.join(".") : ""}`; if (seen.has(k)) continue; seen.add(k);
          const e = S.entries("openscriptures_bdb_1906")[id];
          h.o.push([id, path, bdbSenseLabel(e, path), bdbDefsOf(e, path), tag]);
        }
      }
      { // BDB, unabridged: a value is [id, paragraph, point (-1 the head), sub-point (-1 none), piece]
        const ids = new Set(row.unabridged_bdb_1906.slice(1)); const seen = new Set();
        for (const [id, para, point, sub] of (S.verses("unabridged_bdb_1906")[hv] || []).filter((x) => ids.has(x[0]))) {
          const k = `${id}|${para}|${point}|${sub}`; if (seen.has(k)) continue; seen.add(k);
          const e = S.entries("unabridged_bdb_1906")[id]; const { blk, pt, sb, unit } = unabridgedUnit(e, para, point, sub);
          h.b.push([id, para, point, sub, pt ? pt.label || "" : "", sb ? sb.label || "" : "", (unit.italics || []).filter((x) => OPENING_KINDS.includes(x.kind)).slice(0, 3).map((x) => x.t), blk.head.headword ? blk.head.headword.t : "", ids.size, tag]);
        }
      }
    }
  }
  const ubsOfTags = new Set(); for (const tag of dict) { const row = S.bridge.tags[tag]; if (row) for (const id of row.ubs_sdbh_hebrew_v0_9_2.slice(1)) ubsOfTags.add(id); }
  const UE = S.entries("ubs_sdbh_hebrew_v0_9_2");
  const glossesOf = (lexid) => { const e = UE[ubsEntryId(lexid)]; const m = e ? ubsSense(e, lexid) : null; return m ? ubsGlosses(m) : []; };
  if (mo && mo.way !== 0 && mo.letters !== "another word") {
    // the verse under MACULA's own number; a value is [the sense's id, the word number]
    const mm = /^\S+ (\d+):(\d+)!/u.exec(mo.words[0].ref); const all = S.verses("ubs_sdbh_hebrew_v0_9_2")[`${mm[1]}:${mm[2]}`] || [];
    let rootSaid = false; const numbers = new Set();
    for (const x of mo.morphs) {
      const w = S.numbers[x.index]; if (!w) continue; numbers.add(w);
      for (const [lexid] of all.filter((c) => c[1] === w)) {
        const e = UE[ubsEntryId(lexid)];
        const byTag = ubsOfTags.has(ubsEntryId(lexid)), byLemma = !!e && lettersOnly(e.Lemma) !== "" && lettersOnly(e.Lemma) === lettersOnly(x.lemma);
        if (byTag) rootSaid = true;
        if (byTag || byLemma) h.u.push([lexid, byTag ? 0 : 1, glossesOf(lexid), x.text, w]);
      }
    }
    if (!rootSaid && ubsOfTags.size) {
      const seen = new Set();
      for (const [lexid, w] of all.filter((c) => ubsOfTags.has(ubsEntryId(c[0])) && !numbers.has(c[1]))) { if (seen.has(lexid)) continue; seen.add(lexid); h.u.push([lexid, 2, glossesOf(lexid), "", w]); }
    }
  }
  if ((!mo || mo.way === 0) && stepStands && dict.length) {
    const seen = new Set();
    for (const [lexid, w] of (S.verses("ubs_sdbh_hebrew_v0_9_2")[o.rows[0].verse] || []).filter((c) => ubsOfTags.has(ubsEntryId(c[0])))) { if (seen.has(lexid)) continue; seen.add(lexid); h.u.push([lexid, 3, glossesOf(lexid), "", w]); }
  }
  for (const k of ["u", "o", "b"]) if (!h[k].length) delete h[k];
  if (Object.keys(h).length) out.h = h;
  return out;
}
