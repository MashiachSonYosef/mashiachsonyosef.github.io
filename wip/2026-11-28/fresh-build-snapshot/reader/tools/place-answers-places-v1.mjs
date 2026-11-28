// Page lane · place-answers-rule-v1-a-reading-stands-at-a-word-only-where-a-source-puts-it-there-by-that-sources-own-address
// LEDGER: -
// no frame letter. The shape of data/place-answers-v1/places/ said once, and
// its reader: it opens a book's file and hands over, for a word of ours,
// STEP's rows and parts and MACULA's morphs as the file holds them. It
// writes nothing.
//
// WHY THIS IS A FILE. The builder writes the shape, the check holds it and
// the printer (and, later, the page) reads it. Three copies of a shape are
// three shapes; the names, the codes and the reading of a record live here.
//
// THE CUT OF A ROW INTO PARTS IS NOT STORED. The file holds every cell of a
// source's row whole, so that every string in it is a cell of the source's
// file byte for byte. STEP's own marks cut a row: «/» opens a part, «\» a
// mark that hangs on the part before it, an empty part, a space or a maqaf
// between two «/» is a seam between two words of one row, curly brackets
// wrap the root's tag. The four cells (Hebrew, English, tags, grammar) cut
// into the same number of pieces on every row of the file, so the pieces
// stand beside one another; stepReading() does the cutting, here and for
// any reader.
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { stepReading, stepVariants, lettersOf, meetLetters } from "./place-answers-sources-v1.mjs";
import { changesFromText } from "./place-answers-meet-v1.mjs";

export const PLACES_SCHEMA = "PLACE_ANSWERS_PLACES_V1";
export const PLACES_RULE_ID = "place-answers-rule-v1-a-reading-stands-at-a-word-only-where-a-source-puts-it-there-by-that-sources-own-address";
export const PLACES_RULE = "A reading stands at a word only where a source puts it there by that source's own address, or by a bridge a source declares. Our text and STEP's text (and MACULA's) are two editions of the same verses: a word of ours meets a row of theirs by its place in the verse, never by its letters alone, and the record names how they meet (one for one; one word for two; two for one; the same letters or the letters by which the spelling differs; a verse numbered otherwise; a word written one way and read another, each form with the reading the source gives for it; another word; no row). A source's cells are held whole, byte for byte; nothing is cut, joined, hidden or respelled.";

/** How a word of ours meets theirs (a meeting's first field). */
export const WAYS = [
  "no row of theirs",
  "one for one",
  "one word of ours is two (or three) rows of theirs",
  "one word of ours is one row of theirs that marks two words inside it",
  "one word of ours is one of the words their row holds; their own seam mark stands between (two of ours, one row)",
  "two (or three) words of ours are one word of theirs, parted at their own part cut",
  "two (or three) words of ours are one word of theirs, with no mark of theirs at the seam",
];
const WAY_SHORT = ["no row", "one for one", "one of ours, two rows of theirs", "one of ours, one row marked as two words", "two of ours, one row: their seam mark between", "two of ours, one of theirs: at their part cut", "two of ours, one of theirs: no mark at the seam"];
/** What a word of ours is (an entry's second field). */
export const KINDS = ["plain", "written and read", "written, not read", "read, not written"];
/** What a form of a word is (a form's first field). */
export const ROLES = ["plain", "read", "written"];

/** The shape of a book's file, in words; written into the head of every file. */
export const SHAPE_WORDS = {
  file: "gzip of one JSON object",
  strings: "the table of strings; a column that says {table:[…]} holds indexes into it, a column that says {inline:[…]} holds its strings in place (a column whose values rarely repeat)",
  step: "STEP's rows of this book in the file's order, every row of the file (types L, Q(K), X, R and the rest), every one of the twelve named columns whole: cells[c][i] is column columns[c] of row i; line[i] is the row's line in the file named; unmet lists the rows no word of ours meets",
  macula: "MACULA's morph rows of this book in the table's order, every column whole: cells[c][i] is column columns[c] of morph row i; line[i] its line in the table; words[w] is the first morph row of MACULA's word w (the rows that share one ref), words[w+1] the row after its last; unmet lists the words no word of ours meets",
  sections: "sections[s] is the list of the word records of section s of the zone (the zone's own section index); a mark of the zone has no record",
  record: "[entry index in the section (the zone's own, marks counted), kind (index into kinds), forms]",
  form: "[role (index into roles), STEP on the read line, STEP on the written line, MACULA] — each a meeting, or null where the line is not asked of this form. A plain word is asked of the read line, and carries a written-line meeting only where its row has a written form in STEP's variants («K=»). A read form is asked of the read line, a written form of the written line. MACULA carries what is read: it is asked of a plain word, a read form, and the form of a word written and not read.",
  meeting: "[way (index into ways), letters, spans, cut, share, verse, alike, cut of] with trailing zeros left off; [0] is: asked, and no row of theirs",
  letters: "0 the same letters · 1 another word stands there (their reading is not this word's) · a string: the letters by which our spelling differs, each change named among THEIR letters counted from 0: «+X@3» ours has X more before their letter 3, «-X@3» ours lacks their letter 3 (X), «X>Y@3» ours writes X where their letter 3 is Y, «X<>Y@3» their letters 3 and 4 (X, Y) stand in the other order in ours. The five end-of-word letter shapes are read as their plain letters.",
  spans: "what of theirs the word meets: a number is a whole row (STEP) or a whole word (MACULA); a list holds one item for each row or word in order, each a number or [row, first part, part after the last] (parts counted across the words of the row's reading, seams and marks not counted), or for STEP [row, first part, part after the last, variant]: the reading is the row's variant of that index (the items of the meaning column, then of the spelling column, as stepVariants() lists them), which is STEP's written form («K=»)",
  cut: "their cut into parts (STEP's «/»; MACULA's morphs) on OUR letters: 0 the letters are the same and their cut stands as it is · a list: the number of our letters each part takes, either carried by rule over a named change that falls inside one part, or (where cut of is set) taken from STEP's own variant that writes the row in our letters · -1 not carried: the parts stand with their own letters only · -2 the word shares a part of theirs with its neighbor (two of ours for one of theirs, no mark of theirs at the seam)",
  share: "where two or three words of ours take one of theirs: which of them this word is, counted from 0",
  verse: "1 where their row stands under another Hebrew verse number than our section (STEP's reference gives its English number and, in brackets, its Hebrew one)",
  alike: "STEP only, where our word is one row of STEP's and the letters differ: the variants of that row (indexes, as stepVariants() lists them) that write the row in OUR letters — «L=» (the written letters with the read points), «K=», or another edition's form",
  cut_of: "STEP only: 0, or 1 + the index of the variant whose own cut the cut list is. Where a variant with our letters cuts into as many parts as the row's own reading, its cut is STEP's own cut of our spelling and stands instead of one carried by rule",
};

const MATRES = new Set([0x5d0, 0x5d4, 0x5d5, 0x5d9]); // alef, he, vav, yod: the letters a spelling adds, drops or trades
const isMater = (ch) => MATRES.has(ch.codePointAt(0));
const lettersClass = (letters) => {
  if (letters === 0) return "the same letters";
  if (letters === 1) return "another word";
  const ops = changesFromText(letters);
  const kinds = new Set(ops.map((p) => p[0]));
  let what;
  if (kinds.size > 1) what = "mixed";
  else if (kinds.has("+")) what = ops.length > 1 ? "letters more" : "a letter more";
  else if (kinds.has("-")) what = ops.length > 1 ? "letters less" : "a letter less";
  else if (kinds.has("x")) what = "two letters in the other order";
  else what = ops.length > 1 ? "other letters" : "another letter";
  // a change that touches a letter outside alef, he, vav, yod may be another reading and not a spelling: said, so that a person can look
  const consonant = ops.some((p) => (p[0] === "+" || p[0] === "-" ? !isMater(p[1]) : p[0] === "~" ? !(isMater(p[1]) && isMater(p[2])) : !(isMater(p[1]) || isMater(p[2]))));
  return `spelled otherwise (${what}${consonant ? "; not only alef, he, vav, yod" : ""})`;
};
const onVariant = (spans) => [].concat(spans).some((sp) => Array.isArray(sp) && sp.length === 4);
/** A meeting's class in words, for counting: the way, the letters, whether
 *  the cut was carried, whether it lands on STEP's written form, whether the
 *  verse is numbered otherwise. */
export function meetingClass(m) {
  if (!m) return "not asked";
  if (m[0] === 0) return "no row";
  const [way, letters, spans, cut, , verse] = m;
  let s = `${WAY_SHORT[way]} · ${lettersClass(letters)}`;
  if (typeof letters === "string") s += m[7] ? " · cut STEP's own, from its variant with our letters" : Array.isArray(cut) ? " · cut carried" : cut === -2 ? "" : " · cut not carried";
  if (onVariant(spans)) s += " · on STEP's written form (K=)";
  if (verse) s += " · verse numbered otherwise";
  return s;
}
/** A word's class in words: how our edition and STEP's meet at it. A plain
 *  word by its read-line meeting; where STEP's row is read one way and
 *  written another (Q with K in its variants) and our text writes one plain
 *  word there, whether our letters are the read form's or the written
 *  form's. A word written and read by each of its forms, the read ones
 *  first. */
export function entryClass(kind, forms) {
  if (kind === 0) {
    const [, R, W] = forms[0];
    let s = `plain · ${meetingClass(R)}`;
    if (W) {
      const readSame = R && R[0] !== 0 && R[1] === 0, writtenSame = W[0] !== 0 && W[1] === 0;
      s += ` · STEP reads this row one way and gives another as written (K=): our letters are ${readSame && writtenSame ? "both" : readSame ? "the read form's" : writtenSame ? "the written form's" : "neither's exactly"}`;
    }
    return s;
  }
  const parts = [];
  for (const want of [1, 2]) for (const [role, R, W] of forms) if (role === want) parts.push(`${ROLES[role]}: ${meetingClass(role === 2 ? W : R)}`);
  return `${KINDS[kind]} · ${parts.join(" ; ")}`;
}

/** A book's file, opened. */
export function openPlaces(path) {
  const doc = JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"));
  if (doc.schema !== PLACES_SCHEMA) throw new Error(`not a places file: ${path}`);
  const cellOf = (table, c, i) => { const col = table.cells[c]; return col.inline ? col.inline[i] : doc.strings[col.table[i]]; };
  const stepCells = (i) => doc.step.columns.map((_, c) => cellOf(doc.step, c, i));
  const maculaCells = (i) => doc.macula.columns.map((_, c) => cellOf(doc.macula, c, i));
  const stepCache = new Map();
  /** STEP's row i: its cells by column name, its reference read, its reading cut, its variants. */
  const stepRow = (i) => {
    let r = stepCache.get(i); if (r) return r;
    const cells = stepCells(i);
    const m = /^([1-3]?[A-Z][a-z]{1,2})\.(\d+)\.(\d+)(?:\((\d+)\.(\d+)\))?#(\d+)=(.+)$/.exec(cells[0]);
    r = { index: i, line: doc.step.line[i], cells, ref: cells[0], type: m ? m[7] : "", verse: m ? `${m[4] || m[2]}:${m[5] || m[3]}` : "", englishVerse: m ? `${m[2]}:${m[3]}` : "", word: m ? m[6] : "",
      reading: cells[1] === "" ? null : stepReading(cells[1], cells[3], cells[4], cells[5]), variants: stepVariants(cells[6], cells[7]) };
    doc.step.columns.forEach((name, c) => { r[name] = cells[c]; });
    stepCache.set(i, r); return r;
  };
  /** MACULA's word w: its morph rows, each an object by column name. */
  const maculaWord = (w) => {
    const rows = [];
    for (let i = doc.macula.words[w]; i < doc.macula.words[w + 1]; i += 1) { const cells = maculaCells(i); const o = { index: i, line: doc.macula.line[i] }; doc.macula.columns.forEach((name, c) => { o[name] = cells[c]; }); rows.push(o); }
    return { index: w, ref: rows[0].ref, rows };
  };
  const bySection = doc.sections.map((list) => new Map(list.map((rec) => [rec[0], rec])));
  const record = (si, ei) => (bySection[si] ? bySection[si].get(ei) || null : null);

  /** A STEP meeting, opened: the rows, and the parts of them this word takes. */
  const openStep = (m) => {
    if (!m) return null;
    if (m[0] === 0) return { way: 0, wayWords: WAYS[0], rows: [], parts: [], marks: [] };
    const [way, letters, spans, cut, share, verse, alike, cutOf] = m;
    const out = { way, wayWords: WAYS[way], letters: letters === 0 ? "same" : letters === 1 ? "another word" : letters, cut: Array.isArray(cut) ? cut : null, cutState: cut === 0 ? "theirs" : cutOf ? "their variant's" : Array.isArray(cut) ? "carried" : cut === -2 ? "shared" : "not carried", share: way >= 5 ? share || 0 : null, verseNumberedOtherwise: !!verse, onWrittenForm: false, rows: [], variants: [], parts: [], marks: [], seams: [], variantsWithOurLetters: [], cutFromVariant: null };
    for (const sp of [].concat(spans)) {
      const ri = Array.isArray(sp) ? sp[0] : sp; const row = stepRow(ri); out.rows.push(row);
      let reading = row.reading, variant = null;
      if (Array.isArray(sp) && sp.length === 4) { variant = row.variants[sp[3]]; reading = stepReading(variant.hebrew, variant.english, variant.tags, variant.grammar); out.onWrittenForm = true; out.variant = variant; }
      // the variant taken of each row (null where the row's own reading is taken), and whether its fields cut alike
      out.variants.push(variant ? { ...variant, cutsAlike: reading.regular, hebrewOnly: reading.hebrewOnly } : null);
      const from = Array.isArray(sp) ? sp[1] : 0, to = Array.isArray(sp) ? sp[2] : reading.parts;
      let wi = 0;
      for (const w of reading.words) {
        const lo = Math.max(from, w.from), hi = Math.min(to, w.to);
        if (lo < hi) {
          if (out.parts.length && wi > 0 && lo === w.from && reading.seams[wi - 1] && from < w.from) out.seams.push({ before: out.parts.length, ...reading.seams[wi - 1] });
          for (let k = lo; k < hi; k += 1) out.parts.push({ row: ri, lang: reading.lang, whole: variant && !reading.regular ? (reading.hebrewOnly ? "hebrew only" : "does not cut alike") : null, ...w.parts[k - w.from] });
          if (hi === w.to) for (const mk of w.marks) out.marks.push({ row: ri, after: out.parts.length, ...mk });
        }
        wi += 1;
      }
    }
    // the variants of the row that write it in our letters, each with its own reading cut
    if (alike) for (const vi of alike) { const v = out.rows[0].variants[vi]; const o = { index: vi, ...v, reading: stepReading(v.hebrew, v.english, v.tags, v.grammar) }; out.variantsWithOurLetters.push(o); if (cutOf === vi + 1) out.cutFromVariant = o; }
    return out;
  };
  /** A MACULA meeting, opened: the words, and the morphs of them this word takes. */
  const openMacula = (m) => {
    if (!m) return null;
    if (m[0] === 0) return { way: 0, wayWords: WAYS[0], words: [], morphs: [] };
    const [way, letters, spans, cut, share, verse] = m;
    const out = { way, wayWords: WAYS[way], letters: letters === 0 ? "same" : letters === 1 ? "another word" : letters, cut: Array.isArray(cut) ? cut : null, cutState: cut === 0 ? "theirs" : Array.isArray(cut) ? "carried" : cut === -2 ? "shared" : "not carried", share: way >= 5 ? share || 0 : null, verseNumberedOtherwise: !!verse, words: [], morphs: [] };
    for (const sp of [].concat(spans)) {
      const wi = Array.isArray(sp) ? sp[0] : sp; const w = maculaWord(wi); out.words.push(w);
      const from = Array.isArray(sp) ? sp[1] : 0, to = Array.isArray(sp) ? sp[2] : w.rows.length;
      for (let k = from; k < to; k += 1) out.morphs.push(w.rows[k]);
    }
    return out;
  };
  /** The word at (section, entry), opened: its kind and each form with what STEP and MACULA say there. */
  const wordAt = (si, ei) => {
    const rec = record(si, ei); if (!rec) return null;
    return { section: si, entry: ei, kind: KINDS[rec[1]], forms: rec[2].map(([role, R, W, M]) => ({ role: ROLES[role], step: { read: openStep(R), written: openStep(W) }, macula: openMacula(M), raw: { R, W, M } })) };
  };
  return { doc, stepRow, stepCells, maculaWord, maculaCells, record, wordAt, openStep, openMacula };
}

/** Our word cut by the letters each part takes: every letter keeps the points
 *  and accents that follow it; what stands before the first letter stays
 *  with the first part. */
export function cutOurs(s, lens) {
  const out = []; let cur = "", seen = 0, k = 0;
  for (const ch of s) {
    const c = ch.codePointAt(0);
    if (c >= 0x5d0 && c <= 0x5ea) {
      while (k < lens.length - 1 && seen >= lens[k]) { out.push(cur); cur = ""; seen = 0; k += 1; }
      seen += 1;
    }
    cur += ch;
  }
  out.push(cur); while (out.length < lens.length) out.push("");
  return out;
}
/** The letters each part of an opened meeting takes of our word, or null
 *  where their cut is not carried onto our letters. */
export function ourLens(opened, partLetters) {
  if (!opened || opened.way === 0) return null;
  if (opened.cutState === "theirs") return partLetters.map((L) => Array.from(L).length);
  if (opened.cutState === "carried" || opened.cutState === "their variant's") return opened.cut;
  return null;
}
export { lettersOf, meetLetters };
