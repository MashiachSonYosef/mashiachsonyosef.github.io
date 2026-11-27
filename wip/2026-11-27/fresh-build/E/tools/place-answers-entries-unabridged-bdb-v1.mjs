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
    return blk;
  });
  if (oddDivs) v.divs_that_do_not_pair = oddDivs;
  return v;
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
    references_of_another_shape: 0, italic_runs: 0, italic_by_kind: {}, bold_runs: 0, records_whose_divs_do_not_pair: 0, strings: 0 };
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
      tally(blk.head);
      for (const pt of blk.points || []) { counts.points++; tally(pt); }
    }
  }
  return { entries, counts };
}
