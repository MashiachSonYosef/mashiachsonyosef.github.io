// Page lane · place-answers-rule-v1-a-reading-stands-at-a-word-only-where-a-source-puts-it-there-by-that-sources-own-address
// LEDGER: -
// no frame letter. It reads the bytes handed to it into entries and hands
// them back; it writes nothing.
//
// place-answers-entries-unabridged-bdb-v1
//
//   unabridged_bdb_1906   unabridged-BDB-Hebrew-lexicon.csv (inside its zip)
//
// One line of the file is one record: BDB's id, the provider's Strong's
// numbers for it, and the record's text as HTML. The record is kept WHOLE as
// a run of pieces that writes back to the line's bytes, and beside it a view
// of the record's own structure: its language, its paragraphs (the file
// parts them by <hr>), each paragraph's head and its numbered points in
// order (the file's <div class="point">), the sub-points inside a point (the
// file's line break and indent before a bold letter), the bold runs, and the
// italic runs each with WHAT IT IS where the record's own structure tells.
//
// Why the italics need saying: the provider's README gives one rule for
// them, "highlight { font-style: italic; }". In BDB italics set a gloss, and
// also a grammar word (this provider wrote BDB's abbreviations out: Perfect,
// Imperfect), a word of another language, and the wording of a verse just
// quoted in Hebrew. The site once took every italic run for a reading. Here
// each run carries its kind, by these tests on the record's own tags, in
// this order (the first that holds names it):
//
//   main_gloss        the run stands in <highlightword>, the provider's own
//                     tag for the entry's meaning, in a paragraph's head
//   tagged_gloss      the same tag inside a point
//   other_language    it stands inside <transliteration>, or the text right
//                     before it ends with Latin, German, French or Vulgate
//   abbreviation      its whole text is id., ib. or ibid.
//   outline_letter    its whole text is one letter
//   grammar_word      its whole text is made only of the written-out grammar
//                     words listed below
//   verse_wording     a Hebrew run stands right before it (blanks only
//                     between) and a reference right after it (blanks and
//                     stops only): the English of the verse the reference names
//   rendering_of_hebrew  a Hebrew run stands right before it, no reference
//                     right after: the English of the Hebrew just quoted
//   opening           it is the first italic run of its head, point or
//                     sub-point, before that unit's first reference and
//                     outside every bracket: the unit opens with it
//   unclassed         none of the above: the structure does not tell
//
// A kind is a statement about where the run stands, never a judgment of its
// words. The bold runs are held too: in a head they are the part of speech
// and the stem as the provider wrote them out ("preposition", "noun
// [masculine]"); at the start of a point they are its number.
//
// THE STEMS (the sixth cut, 27 November 2026). BDB numbers a verb's senses
// afresh under each stem (Qal, Niph`al, Pi`el … in this file's spelling), so
// a numbered point means nothing without the stem it stands under. The file
// writes a stem's heading as a bold run that is the stem's name; it stands
// as a div's label (<b>Qal</b> opening a point, <b>Niph`al</b> a section),
// in a paragraph's head as its part of speech ("verb Pi`el"), or inside a
// point's running text, where the stem before it ends and this one's list of
// forms begins (<b>Hiph`il</b> <highlight>Imperfect</highlight> …). A bold
// stem's name is also how the file writes a cross-reference ("compare
// Hithpa`el", "see Pi`el 2"). So a bold run is held as a stem's heading
// (stemsOfParagraph) where it is the stem's name alone and:
//   - it is a div's label; or the label names the stem and numbers its first
//     point («Hiph`il 1.», numbered afresh) where the sentence before ended
//     (a label «Hiph`il 3.» continues another stem's numbering: the file has
//     glued a cross-reference to the point's number, and it opens nothing);
//   - it is the part of speech of a paragraph's head («verb Pi`el»);
//   - in running text, its list of forms (an italic grammar word) or its
//     meaning (the provider's gloss tag) follows it, or the sentence before
//     it has ended (a stop, a closing bracket, BDB's dash); and it is not a
//     cross-reference: no word that refers elsewhere («compare», «see», «cf.»,
//     «=», «as», «of», «read», «Kt», «Qr», «apparently», «others» …) stands
//     right before it, and no bracket opened in its own sentence holds it;
//   - and never in a paragraph whose head gives a part of speech that is not
//     a verb's (a noun, a name, a particle): a stem named there is another
//     record's.
// Each paragraph keeps its headings in order (stems: {s: the stem's name as
// the bold run writes it, k: the bold run's piece; point: the div it labels;
// one: 1 where that label numbers the stem's first point}). A reference
// stands under the last heading before it in its paragraph: in that stem's
// own head (its list of forms, before any numbered point of it) where the
// heading stands inside the reference's own unit, or in the point it stands
// in (placeByStem). The verse bridge carries both.

/** The record's text as pieces that lose nothing:
 *    "text"                              plain text
 *    [name, text]                        <name>text</name>, no attributes, text only
 *    ["ref", text, b, cB, vB, cE, vE]    a reference tag of the file's regular shape
 *    ["<", raw]                          any other tag, its bytes as written */
export function piecesOf(html) {
  const out = [];
  const re = /<[^>]*>/g;
  let last = 0, m;
  const tags = [];
  while ((m = re.exec(html))) tags.push([m.index, m[0]]);
  for (let i = 0; i < tags.length; i++) {
    const [at, tag] = tags[i];
    if (at > last) out.push(html.slice(last, at));
    const simple = /^<([A-Za-z][A-Za-z0-9]*)>$/.exec(tag);
    const next = tags[i + 1];
    if (simple && next && next[1] === "</" + simple[1] + ">") {
      out.push([simple[1], html.slice(at + tag.length, next[0])]);
      last = next[0] + next[1].length; i++; continue;
    }
    const ref = /^<ref ref="([^"]*)" b="(\d+)" cBegin="(\d+)" vBegin="(\d+)" cEnd="(\d+)" vEnd="(\d+)" onclick="bcv\((\d+),(\d+),(\d+)\)">$/.exec(tag);
    if (ref && next && next[1] === "</ref>" && html.slice(at + tag.length, next[0]) === ref[1] && ref[7] === ref[2] && ref[8] === ref[3] && ref[9] === ref[4]
      && [2, 3, 4, 5, 6].every((k) => String(+ref[k]) === ref[k])) {
      out.push(["ref", ref[1], +ref[2], +ref[3], +ref[4], +ref[5], +ref[6]]);
      last = next[0] + next[1].length; i++; continue;
    }
    out.push(["<", tag]);
    last = at + tag.length;
  }
  if (last < html.length) out.push(html.slice(last));
  return out;
}

/** The pieces back to the record's bytes. The check uses this. */
export function writePieces(pieces) {
  let out = "";
  for (const p of pieces) {
    if (typeof p === "string") out += p;
    else if (p[0] === "<") out += p[1];
    else if (p.length === 2) out += "<" + p[0] + ">" + p[1] + "</" + p[0] + ">";
    else out += `<ref ref="${p[1]}" b="${p[2]}" cBegin="${p[3]}" vBegin="${p[4]}" cEnd="${p[5]}" vEnd="${p[6]}" onclick="bcv(${p[2]},${p[3]},${p[4]})">${p[1]}</ref>`;
  }
  return out;
}

/** The written-out grammar words: an italic run made only of these words is
 *  a grammar word ("Imperfect", "Infinitive construct", "Participle pass"). */
const GW = "perfect|imperfect|participle|imperative|infinitive|construct|absolute|abs|cstr|act|pass|active|passive|plural|singular|dual|suffix|suffixes|masculine|feminine|collective|consecutive|cohortative|jussive|preposition|conjunction|adverb|adverbially|substantive|adjective|verb|noun|interjection|pronoun|particle|intransitive|transitive|reflexive|causative|accusative|genitive|nominative|qal|niphal|hiphil|hophal|hithpael";
export const GRAMMAR_WORD = new RegExp("^(?:" + GW + ")(?:\\s?(?:" + GW + "))*$", "i");
const LANGUAGE_BEFORE = /(?:Latin|German|French|Vulgate)\s*$/;
const ABBREVIATION = new Set(["id.", "id", "ib.", "ib", "ibid.", "ibid"]);

const isHebrewPiece = (p) => Array.isArray(p) && (p[0] === "bdbheb" || p[0] === "bdbarc" || (p[0] === "<" && (p[1] === "</bdbheb>" || p[1] === "</bdbarc>")));
const isRef = (p) => Array.isArray(p) && (p[0] === "ref" || (p[0] === "<" && p[1] === "</ref>") || (p[0] === "<" && p[1].startsWith("<ref ")));

/** The view of one record's pieces. */
export function viewOfRecord(k) {
  const v = {};
  // language: the record's own navigation line names it
  for (const p of k) if (typeof p === "string") { const m = /\| (BIBLICAL [A-Z]+) \|/.exec(p); if (m) { v.language = m[1]; break; } }
  // paragraphs: the file parts a record's paragraphs by <hr>
  const blocks = [];
  let start = 0;
  // the first paragraph begins after the navigation line
  for (let i = 0; i < k.length; i++) if (Array.isArray(k[i]) && k[i][0] === "<" && k[i][1] === '<div class="navigation">') {
    let j = i + 1; while (j < k.length && !(Array.isArray(k[j]) && k[j][1] === "</div>")) j++;
    start = j + 1; break;
  }
  let from = start;
  for (let i = start; i <= k.length; i++) {
    if (i === k.length || (Array.isArray(k[i]) && k[i][0] === "<" && k[i][1] === "<hr>")) {
      if (i > from) blocks.push([from, i]);
      from = i + 1;
    }
  }
  let oddDivs = 0;
  v.blocks = blocks.map(([a, b]) => {
    const blk = { k: [a, b] };
    // the divs of the paragraph: points, sections, remarks, in order, with their depth
    const units = [];
    const open = [];
    let headEnd = b;
    for (let i = a; i < b; i++) {
      const p = k[i];
      if (!Array.isArray(p) || p[0] !== "<") continue;
      const dm = /^<div class="([^"]*)">$/.exec(p[1]);
      if (dm) { if (headEnd === b) headEnd = i; const u = { div: dm[1], k: [i, b], depth: open.length + 1 }; units.push(u); open.push(u); }
      else if (p[1] === "</div>") { const u = open.pop(); if (u) u.k[1] = i + 1; else oddDivs++; }
    }
    oddDivs += open.length;
    blk.head = unitView(k, a, headEnd, "head");
    // the paragraph's headword: its first Hebrew run, and BDB's numeral before it ("III.")
    for (let i = a; i < headEnd; i++) {
      const p = k[i];
      if (Array.isArray(p) && (p[0] === "bdbheb" || p[0] === "bdbarc")) {
        blk.head.headword = { t: p[1], k: i };
        const before = i > a && typeof k[i - 1] === "string" ? k[i - 1] : "";
        const num = /(?:^|[\s\[])([IVX]+)\.\s*\[?\s*$/.exec(before);
        if (num) blk.head.numeral = num[1];
        break;
      }
      if (Array.isArray(p) && p[0] === "<" && (p[1] === "<bdbheb>" || p[1] === "<bdbarc>")) { // a headword with a tag inside it
        let t = ""; let j = i + 1;
        for (; j < headEnd && !(Array.isArray(k[j]) && k[j][0] === "<" && /^<\/bdb(heb|arc)>$/.test(k[j][1])); j++) t += typeof k[j] === "string" ? k[j] : k[j][0] === "<" ? "" : k[j][1];
        blk.head.headword = { t, k: i, to: j };
        const before = i > a && typeof k[i - 1] === "string" ? k[i - 1] : "";
        const num = /(?:^|[\s\[])([IVX]+)\.\s*\[?\s*$/.exec(before);
        if (num) blk.head.numeral = num[1];
        break;
      }
    }
    if (units.length) blk.points = units.map((u) => ({ div: u.div, depth: u.depth, ...unitView(k, u.k[0], u.k[1], "point") }));
    const stems = stemsOfParagraph(k, blk); if (stems.length) blk.stems = stems;
    return blk;
  });
  if (oddDivs) v.divs_that_do_not_pair = oddDivs;
  return v;
}

/** The stems as this file spells them: BDB's Hebrew and Aramaic stems written out by the provider, with the
 *  abbreviations the file keeps («Hithpa.», «Po`l.», «Nithp.»). */
export const STEM_NAMES = ["Qal passive", "Qal", "Niph`al", "Pi`el", "Piel", "Pu`al", "Pual", "Hiph`il", "Hoph`al", "Hithpa`el", "Hithpa.", "Hitph.", "Pe`al", "Pa`el", "Haph`el", "Aph`el",
  "Hithpo`el", "Hithpo`l.", "Pilpel", "Hithpe`el", "Ithpe`el", "Po`el", "Po`êl", "Pô`el", "Hithpalpel", "Po.", "Po`l.", "Pol.", "Pe`il", "Pe`îl", "Hithpo`lel", "Po`.", "Hithpolel", "Po`al", "Po`lel",
  "Pô`lel", "Polel", "Pol`el", "Po`lal", "Hothpa`al", "Pi`lel", "Pil`el", "Pe`al`al", "Ithpa`al", "Hithpa`al", "Shaph`el", "Pu`lal", "Nithp.", "Tiph`el", "Pil.", "Polpal", "Palpel",
  "Pa`lel", "Hithpa`lel", "Ishtaph.", "Hishtaph`el", "Pilel", "Pulal", "Polal"];
const STEM_ALT = STEM_NAMES.slice().sort((a, b) => b.length - a.length).map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
/** A bold run that is a stem's name alone: «Qal», «Niph`al.», «verb Pi`el», «verb denominative Hiph`il», «Hiph`il A.» (BDB's lettered division of a stem). */
export const STEM_HEADING = new RegExp(`^\\s*(?:verb\\s*)?(?:denominative\\s*)?(${STEM_ALT})(?:\\s+denominative)?(?:\\s+[AB]\\.)?\\s*[.:]?\\s*$`, "u");
/** A div's label that names a stem and numbers its first point: «Hiph`il 1.», «Qal: 1.», «Pi`el1.», «Hiph`il 1. a.». */
export const STEM_POINT_ONE = new RegExp(`^\\s*(?:verb\\s*)?(?:denominative\\s*)?(${STEM_ALT})\\s*[.:]?\\s*1\\.(?:\\s*[a-z]\\.)?\\s*$`, "u");
/** An italic run that opens a stem's list of forms. */
const FORMS_OPEN = /^\s*(?:Perfect|Perf\.|Imperfect|Imperf\.|Imperative|Infinitive|Participle|Jussive|Cohortative|Passive participle)/u;
/** A word right before a bold stem's name that makes it a cross-reference, not a heading (or an open bracket, or «=»). */
const REFERS = /(?:\b(?:compare|see|cf|cp|so|as|of|than|like|i\.e|e\.g|viz|read|Kt|Qr|apparently|others)\.?|[=([])\s*$/iu;
/** A head's bold part of speech that is not a verb's: a paragraph of a noun, a name, a particle holds no stem headings
 *  (a stem named there refers to another record's verb). */
const NOT_A_VERB = /\b(?:noun|adjective|adverb|preposition|conjunction|particle|pronoun|interjection|substantive|name)\b/iu;
/** The sentence before has ended: a stop, a closing bracket, a semicolon or colon, or BDB's dash. */
const ENDED = /[.)\]—;:]\s*$/u;
/** The plain text right before piece i, back to at least three letters (tags skipped; a reference counts as a closing bracket). */
function textBefore(k, from, i) {
  let s = "";
  for (let j = i - 1; j >= from && s.length < 40; j--) { const p = k[j]; if (typeof p === "string") s = p + s; else if (p[0] === "ref") s = "]" + s; else if (p[0] === "<") continue; else s = p[1] + s; if (s.trim().length >= 3) break; }
  return s.replace(/\\&emsp;/g, " ").trimEnd();
}
/** Whether piece i stands inside a bracket opened in its own sentence: back from i, an opening bracket no closing one
 *  answers, before a stop, BDB's dash, a line break or a div. */
function insideBracket(k, from, i) {
  let depth = 0;
  for (let j = i - 1; j >= from; j--) {
    const p = k[j];
    if (Array.isArray(p) && p[0] === "<") { if (/^<(div|br|hr)/u.test(p[1])) return false; continue; }
    const t = typeof p === "string" ? p : p[0] === "ref" ? "" : p[1];
    for (let x = t.length - 1; x >= 0; x--) {
      const c = t[x];
      if (c === ")" || c === "]") depth++;
      else if (c === "(" || c === "[") { if (depth === 0) return true; depth--; }
      else if (depth === 0 && (c === "—" || (c === "." && /\s/u.test(t[x + 1] || " ")))) return false;
    }
  }
  return false;
}
/** The stem headings of one paragraph, in order (see THE STEMS above). */
export function stemsOfParagraph(k, blk) {
  const out = [];
  const labelOf = new Map(); (blk.points || []).forEach((p, pi) => { if (p.label_k !== undefined) labelOf.set(p.label_k, pi); });
  const firstPoint = (blk.points || []).length ? blk.points[0].k[0] : blk.k[1];
  const headBold = []; for (let i = blk.k[0]; i < firstPoint; i++) if (Array.isArray(k[i]) && k[i][0] === "b") headBold.push(k[i][1]);
  if (headBold.some((t) => NOT_A_VERB.test(t)) && !headBold.some((t) => /\bverb/iu.test(t))) return out;
  for (let i = blk.k[0]; i < blk.k[1]; i++) {
    const p = k[i]; if (!Array.isArray(p) || p[0] !== "b") continue;
    if (labelOf.has(i)) {
      const pi = labelOf.get(i); const m = STEM_HEADING.exec(p[1]);
      if (m) { out.push({ s: m[1], k: i, point: pi }); continue; }
      const o = STEM_POINT_ONE.exec(p[1]);
      if (o && ENDED.test(textBefore(k, blk.k[0], i))) out.push({ s: o[1], k: i, point: pi, one: 1 });
      continue;
    }
    const m = STEM_HEADING.exec(p[1]); if (!m) continue;
    const before = textBefore(k, blk.k[0], i);
    // the head's own part of speech, before the paragraph's first point: the record's stem
    if (i < firstPoint && /^\s*verb/u.test(p[1])) { out.push({ s: m[1], k: i }); continue; }
    if (REFERS.test(before) || insideBracket(k, blk.k[0], i)) continue;
    let j = i + 1; while (j < blk.k[1] && ((typeof k[j] === "string" && !k[j].trim()) || (Array.isArray(k[j]) && k[j][0] === "sub"))) j++; // BDB's count of occurrences (<sub>) may stand between
    const n = j < blk.k[1] ? k[j] : null;
    const opens = Array.isArray(n) && ((n[0] === "highlight" && FORMS_OPEN.test(n[1])) || n[0] === "highlightword");
    const closes = typeof n === "string" && /^\s*[),;]/u.test(n);
    if (opens || (!closes && ENDED.test(before))) out.push({ s: m[1], k: i });
  }
  return out;
}
/** Where a reference (piece ki, in point pi and sub-point si as the units hold it) stands by the stems: [the index of the
 *  heading it stands under (-1: none), 1 where it stands in that stem's own head, before any numbered point of it]. */
export function placeByStem(blk, ki, pi, si) {
  const stems = blk.stems || []; let st = -1;
  for (let x = 0; x < stems.length; x++) if (stems[x].k < ki) st = x;
  if (st < 0) return [-1, 0];
  const h = stems[st]; const unit = pi >= 0 ? blk.points[pi] : blk.head; const start = si >= 0 ? unit.sub[si].k[0] : unit.k[0];
  // the heading stands inside the reference's own unit (its label, or a heading in its running text): the stem's own
  // head, unless the label also numbers the stem's first point
  if (h.k >= start) return [st, h.one && h.point === pi ? 0 : 1];
  return [st, 0];
}

/** One head or one point: its label, bold runs, italic runs with their kind,
 *  its sub-points, and how many references stand in it. Indexes are indexes
 *  of pieces in the record. A point that holds inner divs reports its own
 *  pieces only up to its first inner div (the inner divs are listed after it
 *  as their own points). */
function unitView(k, a, b, what) {
  const u = { k: [a, b] };
  let end = b;
  if (what === "point") {
    for (let i = a + 1; i < b; i++) if (Array.isArray(k[i]) && k[i][0] === "<" && /^<div /.test(k[i][1])) { end = i; break; }
    if (end !== b) u.own_k = [a, end];
  }
  // sub-points: a line break, an indent, then a bold letter
  const cuts = [a];
  for (let i = a; i < end - 2; i++) {
    if (Array.isArray(k[i]) && k[i][0] === "<" && k[i][1] === "<br>" && typeof k[i + 1] === "string" && /^\\&emsp;/.test(k[i + 1]) && Array.isArray(k[i + 2]) && k[i + 2][0] === "b") cuts.push(i);
  }
  const part = (x, y, isSub) => {
    const r = { k: [x, y] };
    const bold = [], italics = [];
    let refs = 0, depth = 0, firstRef = -1, firstHebrew = -1, seenClassable = false;
    // the label: the first bold run, when nothing but blanks, tags and the indent stand before it
    for (let i = x; i < y; i++) {
      const p = k[i];
      if (typeof p === "string") { if (p.replace(/\\&emsp;/g, "").trim()) break; continue; }
      if (p[0] === "b") { r.label = p[1]; r.label_k = i; break; }
      if (p[0] !== "<") break;
    }
    for (let i = x; i < y; i++) {
      const p = k[i];
      if (typeof p === "string") { for (const c of p) { if (c === "(" || c === "[") depth++; else if ((c === ")" || c === "]") && depth > 0) depth--; } continue; }
      if (isRef(p)) { if (p[0] === "ref" || p[1].startsWith("<ref ")) { refs++; if (firstRef < 0) firstRef = i; } continue; }
      if (isHebrewPiece(p)) { if (firstHebrew < 0) firstHebrew = i; continue; }
      if (p[0] === "b") { if (i !== r.label_k) bold.push({ t: p[1], k: i }); continue; }
      const simpleItalic = p[0] === "highlight" || p[0] === "highlightword";
      const openItalic = p[0] === "<" && (p[1] === "<highlight>" || p[1] === "<highlightword>");
      if (!simpleItalic && !openItalic) continue;
      let text, last = i, tagName = simpleItalic ? p[0] : p[1].slice(1, -1);
      if (simpleItalic) text = p[1];
      else { // an italic run with tags inside it: its text is the text of its pieces
        text = "";
        let j = i + 1;
        for (; j < y && !(Array.isArray(k[j]) && k[j][0] === "<" && k[j][1] === "</" + tagName + ">"); j++) text += typeof k[j] === "string" ? k[j] : k[j][0] === "<" ? "" : k[j][1];
        last = j;
      }
      const it = simpleItalic ? { t: text, k: i } : { t: text, k: i, to: last, has_tags_inside: true };
      // neighbors: the nearest piece before and after that is not blank text
      let pb = i - 1; while (pb >= x && typeof k[pb] === "string" && !k[pb].trim()) pb--;
      let nb = last + 1; while (nb < y && typeof k[nb] === "string" && /^[\s,;:.]*$/.test(k[nb])) nb++;
      const prev = pb >= x ? k[pb] : null, next = nb < y ? k[nb] : null;
      const textBefore = i > x && typeof k[i - 1] === "string" ? k[i - 1] : "";
      const whole = text.trim();
      let kind;
      if (tagName === "highlightword") kind = what === "head" && !isSub ? "main_gloss" : "tagged_gloss";
      else if ((Array.isArray(prev) && prev[0] === "<" && prev[1] === "<transliteration>") || LANGUAGE_BEFORE.test(textBefore)) kind = "other_language";
      else if (ABBREVIATION.has(whole)) kind = "abbreviation";
      else if ([...whole].length === 1 && /\p{L}/u.test(whole)) kind = "outline_letter";
      else if (GRAMMAR_WORD.test(whole.replace(/[.,;:]+$/, ""))) kind = "grammar_word";
      else if (prev && isHebrewPiece(prev) && next && isRef(next)) { kind = "verse_wording"; it.ref_k = nb; }
      else if (prev && isHebrewPiece(prev)) kind = "rendering_of_hebrew";
      else if (!seenClassable && firstRef < 0 && depth === 0) kind = "opening";
      else kind = "unclassed";
      if (kind === "opening" || kind === "unclassed" || kind === "rendering_of_hebrew" || kind === "verse_wording") seenClassable = true;
      it.kind = kind;
      if (depth) it.in_bracket = depth;
      italics.push(it);
      i = last;
    }
    if (bold.length) r.bold = bold;
    if (italics.length) r.italics = italics;
    if (refs) r.refs = refs;
    return r;
  };
  const first = part(cuts[0], cuts.length > 1 ? cuts[1] : end, false);
  Object.assign(u, first, { k: [a, b] });
  if (cuts.length > 1) {
    u.before_sub_k = [cuts[0], cuts[1]];
    u.sub = [];
    for (let c = 1; c < cuts.length; c++) u.sub.push(part(cuts[c], c + 1 < cuts.length ? cuts[c + 1] : end, true));
  }
  return u;
}

export function buildUnabridgedBdb({ csv }) {
  const text = csv.toString("utf8");
  const entries = {};
  const counts = { records: 0, with_a_strong_number: 0, strong_numbers: 0, hebrew: 0, aramaic: 0, paragraphs: 0, points: 0, sub_points: 0, references: 0,
    references_of_another_shape: 0, italic_runs: 0, italic_by_kind: {}, bold_runs: 0, records_whose_divs_do_not_pair: 0, strings: 0,
    stem_headings: { a_divs_label: 0, a_label_that_numbers_the_stems_first_point: 0, the_heads_part_of_speech_or_running_text: 0, paragraphs_with_a_stem: 0 } };
  let at = 0, lineNo = 0;
  for (const line of text.split("\n")) {
    lineNo++;
    const lineAt = at;
    at += Buffer.byteLength(line, "utf8") + 1;
    if (lineNo === 1 || !line) continue; // the header line: BDBid, StrongNumber, content
    const t1 = line.indexOf("\t"), t2 = line.indexOf("\t", t1 + 1);
    const id = line.slice(0, t1), strongColumn = line.slice(t1 + 1, t2), html = line.slice(t2 + 1);
    const k = piecesOf(html);
    const e = { line: lineNo, at: [lineAt, lineAt + Buffer.byteLength(line, "utf8")], strong_column: strongColumn, strong: strongColumn ? strongColumn.split("_") : [] };
    Object.assign(e, viewOfRecord(k));
    e.k = k;
    if (entries[id]) throw new Error("unabridged BDB: id twice: " + id);
    entries[id] = e;
    counts.records++;
    if (e.strong.length) counts.with_a_strong_number++;
    counts.strong_numbers += e.strong.length;
    if (e.language === "BIBLICAL HEBREW") counts.hebrew++; else if (e.language === "BIBLICAL ARAMAIC") counts.aramaic++;
    if (e.divs_that_do_not_pair) counts.records_whose_divs_do_not_pair++;
    for (const p of k) if (Array.isArray(p)) { if (p[0] === "ref") counts.references++; else if (p[0] === "<" && p[1].startsWith("<ref ")) counts.references_of_another_shape++; }
    const tally = (u) => {
      for (const it of u.italics || []) { counts.italic_runs++; counts.strings++; counts.italic_by_kind[it.kind] = (counts.italic_by_kind[it.kind] || 0) + 1; }
      counts.bold_runs += (u.bold || []).length + (u.label !== undefined ? 1 : 0);
      counts.strings += (u.bold || []).length + (u.label !== undefined ? 1 : 0);
      for (const s of u.sub || []) { counts.sub_points++; tally(s); }
    };
    for (const blk of e.blocks) {
      counts.paragraphs++;
      if (blk.stems) { counts.stem_headings.paragraphs_with_a_stem++; for (const s of blk.stems) { counts.strings++; counts.stem_headings[s.one ? "a_label_that_numbers_the_stems_first_point" : s.point !== undefined ? "a_divs_label" : "the_heads_part_of_speech_or_running_text"]++; } }
      tally(blk.head);
      for (const pt of blk.points || []) { counts.points++; tally(pt); }
    }
  }
  return { entries, counts };
}
