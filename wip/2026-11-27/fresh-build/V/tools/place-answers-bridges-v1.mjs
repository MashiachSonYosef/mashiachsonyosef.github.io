// Page lane · place-answers-rule-v1-a-reading-stands-at-a-word-only-where-a-source-puts-it-there-by-that-sources-own-address
// LEDGER: -
// no frame letter. It reckons the bridges from the entries handed to it and
// hands them back; it reads no file and writes nothing.
//
// place-answers-bridges-v1
//
// The bridges of the fresh build (builder E):
//
//   1. from STEP's tag to each dictionary's entry, with HOW the tag reaches
//      it, and whether the bridge is exact (one entry), ambiguous (several,
//      all of them held, with what would part them) or absent;
//   2. from a verse to the senses that cite it, for the two BDB files and
//      the UBS dictionary, in each source's own book names mapped to ours by
//      a table written into the file.
//
// The rule: a bridge stands where a source declares it. STEP's tag is a
// Strong's number by STEP's own design ("Extended Strongs … backward
// compatible with original Strong"). Where a number holds several BDB
// entries, STEP's file itself says which: the first column of TBESH
// (eStrong#) writes the Open Scriptures letter of each lettered number
// ("H1254a" on the line of H1254A), and the Lexical Index carries the same
// letter on the entry (strong="1254" aug="a") with BDB's id beside it. No
// bridge is made by a headword's letters, and no parting is guessed: where
// the files do not part a number, every entry it reaches is held.

import { tahotRows, tagParts, lettersOnly, BY_STEP, BY_OSIS, BY_ENGLISH_NUMBER } from "./place-answers-entries-lib-v1.mjs";
import { ubsCodeNumbers } from "./place-answers-entries-tables-v1.mjs";

export const HOW = {
  N: "by the number alone: the source has one entry to this number",
  L: "by the number and the letter: the source itself parts the number, and the tag's letter names one of its entries",
  T: "by STEP's own lettered number: TBESH files its line under the tag itself",
  E: "by the number and the Open Scriptures letter: TBESH's first column (eStrong#) gives the letter for this tag, and the Lexical Index carries it on one entry (aug)",
  S: "by several entries that name one and the same BDB entry",
  A: "ambiguous: the number reaches several entries and nothing in the files says which this tag is; all are held",
  0: "absent: the source has no entry for this number",
  P: "absent: STEP's own number for a prefix, a suffix or a mark of punctuation (H9000 and above); no dictionary of Strong's numbers has it",
  H: "absent here: the source has the entry but its file is not on hand",
  B: "absent: the Lexical Index has the number but names no BDB entry for it",
};
export const CLASS_OF = { N: "exact", L: "exact", T: "exact", E: "exact", S: "exact", A: "ambiguous", 0: "absent", P: "absent", H: "absent", B: "absent" };

/** Every tag STEP uses on any part of any word, with how many rows (words)
 *  and parts it stands on, and how often as the root. */
export function readTags(tahotFiles) {
  const tags = new Map();
  const counts = { rows: 0, rows_with_no_tag: 0, parts: 0, root_parts: 0, rows_with_one_root: 0, rows_with_no_root: 0, rows_with_several_roots: 0, parts_not_of_the_tag_shape: 0, by_file: {},
    rows_with_tags_in_the_variants_column: 0, variant_items: 0, variant_parts: 0, variant_parts_not_of_the_tag_shape: 0, tags_only_in_the_variants_column: 0 };
  const rowRoots = []; // for each row, its root tags (kept compactly: joined)
  for (const f of tahotFiles) {
    let n = 0;
    for (const row of tahotRows(f.buf)) {
      n++;
      counts.rows++;
      if (!row.parts.length) counts.rows_with_no_tag++;
      const seen = new Set();
      let roots = 0;
      for (const p of row.parts) {
        counts.parts++;
        if (!tagParts(p.tag)) { counts.parts_not_of_the_tag_shape++; }
        let t = tags.get(p.tag);
        if (!t) { t = { rows: 0, parts: 0, root_parts: 0 }; tags.set(p.tag, t); }
        t.parts++;
        if (p.root) { t.root_parts++; counts.root_parts++; roots++; }
        if (!seen.has(p.tag)) { seen.add(p.tag); t.rows++; }
      }
      if (roots === 1) counts.rows_with_one_root++; else if (roots === 0) counts.rows_with_no_root++; else counts.rows_with_several_roots++;
      // THE VARIANTS COLUMN (27 November 2026, the second cut). STEP writes a row's other readings in its
      // seventh column, each «K= transliteration (Hebrew) "English" (tags=grammar)», items parted by « ¦ »:
      // the form written where another is read (K), and other editions' forms. Their tags are STEP's numbers
      // by the same design as the main column's, and a word of ours that is the written form meets them, so
      // they are bridged the same way. They are counted apart (variant_rows, variant_parts): the main
      // column's counts say what they said before.
      const vseen = new Set();
      for (const item of (row.cols[6] || "").split(" ¦ ")) {
        const m = /\(([^()]*)\)\s*$/.exec(item); if (!m) continue;
        const eq = m[1].lastIndexOf("="); const cell = eq < 0 ? m[1] : m[1].slice(0, eq);
        let any = false;
        for (const piece of cell.split(/[/\\]/)) {
          const tag = piece.trim().replace(/[{}+]/g, ""); if (!tag) continue;
          if (!tagParts(tag)) { counts.variant_parts_not_of_the_tag_shape++; continue; }
          any = true; counts.variant_parts++;
          let t = tags.get(tag);
          if (!t) { t = { rows: 0, parts: 0, root_parts: 0 }; tags.set(tag, t); }
          t.variant_parts = (t.variant_parts || 0) + 1;
          if (!vseen.has(tag)) { vseen.add(tag); t.variant_rows = (t.variant_rows || 0) + 1; }
        }
        if (any) counts.variant_items++;
      }
      if (vseen.size) counts.rows_with_tags_in_the_variants_column++;
    }
    counts.by_file[f.name] = n;
  }
  for (const t of tags.values()) if (!t.parts && t.variant_parts) counts.tags_only_in_the_variants_column++;
  return { tags, counts };
}

/** The bridge from every tag to every source. `src` holds each source's
 *  entries as the builders made them. */
export function bridgeTags({ tags, src }) {
  // indexes by number, each from the source's own statement of its number
  const strongsHas = new Set(Object.keys(src.openscriptures_strongs).map((k) => +k.slice(1)));
  const wsHas = new Set(Object.keys(src.wikisource_strongs_explicit_forms).map((k) => +k.slice(1)));
  const tbeshByNumber = new Map();
  for (const id of Object.keys(src.stepbible_tbesh_gloss)) { const n = +id.slice(1, 5); (tbeshByNumber.get(n) || tbeshByNumber.set(n, []).get(n)).push(id); }
  const liByNumber = new Map();
  for (const [id, e] of Object.entries(src.openscriptures_lexical_index)) {
    const s = e.xref && e.xref.strong;
    if (!s) continue;
    // Eight entries carry a letter where the number stands (strong="b"): the
    // Open Scriptures' own codes for the prefixes. STEP tags a prefix with a
    // number of its own (H9001 …) and no file says which code that is, so
    // these entries are reached by no tag.
    if (!/^\d+$/.test(s)) continue;
    (liByNumber.get(+s) || liByNumber.set(+s, []).get(+s)).push(id);
  }
  const ubdbByNumber = new Map();
  for (const [id, e] of Object.entries(src.unabridged_bdb_1906)) for (const s of e.strong) {
    const m = /^H(\d+)$/.exec(s);
    if (!m) throw new Error("unabridged BDB: a number of another shape: " + s);
    (ubdbByNumber.get(+m[1]) || ubdbByNumber.set(+m[1], []).get(+m[1])).push(id);
  }
  const ubsByNumber = new Map();
  for (const [id, e] of Object.entries(src.ubs_sdbh_hebrew_v0_9_2)) {
    const seen = new Set();
    for (const code of e.StrongCodes || []) for (const c of ubsCodeNumbers(code)) {
      if (seen.has(c.number)) continue; seen.add(c.number);
      (ubsByNumber.get(c.number) || ubsByNumber.set(c.number, []).get(c.number)).push(id);
    }
  }
  const uhalHas = new Set(Object.keys(src.unfoldingword_uhal).map((k) => +k.slice(1)));
  const bdb = src.openscriptures_bdb_1906;

  const out = {};
  for (const [tag, n] of [...tags].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
    const tp = tagParts(tag);
    const row = { n: [n.rows, n.parts, n.root_parts] };
    if (n.variant_parts) row.v = [n.variant_rows, n.variant_parts]; // where the tag stands in the variants column: rows, parts
    if (!tp) { for (const k of Object.keys(src)) row[k] = ["0"]; out[tag] = row; continue; }
    const N = tp.number;
    const own = N >= 9000; // STEP's own numbers for prefixes, suffixes and marks
    const byNumber = (has, id) => (own ? ["P"] : has ? ["N", id] : ["0"]);

    row.openscriptures_strongs = byNumber(strongsHas.has(N), "H" + N);
    row.wikisource_strongs_explicit_forms = own ? ["P"] : wsHas.has(N) ? ["N", "H" + N] : strongsHas.has(N) ? ["H"] : ["0"];

    // TBESH: the tag is its own key
    const line = src.stepbible_tbesh_gloss[tag];
    if (line) row.stepbible_tbesh_gloss = ["T", tag];
    else {
      const same = tbeshByNumber.get(N) || [];
      row.stepbible_tbesh_gloss = same.length === 1 ? ["N", same[0]] : same.length ? ["A", ...same] : ["0"];
    }

    // the Lexical Index, and through it BDB (Open Scriptures)
    const e1 = line ? /^H(\d{4})([a-z]?)$/.exec(line.eStrong) : null;
    if (line && !e1) throw new Error("TBESH: a first column of another shape: " + line.eStrong);
    const liN = e1 ? +e1[1] : N, liLetter = e1 ? e1[2] : "";
    const cands = liByNumber.get(liN) || [];
    let li;
    if (own) li = ["P"];
    else if (!cands.length) li = ["0"];
    else if (liLetter) {
      const hit = cands.filter((id) => src.openscriptures_lexical_index[id].xref.aug === liLetter);
      li = hit.length === 1 ? ["E", hit[0]] : hit.length ? ["A", ...hit] : cands.length === 1 ? ["N", cands[0]] : ["A", ...cands];
    } else li = cands.length === 1 ? ["N", cands[0]] : ["A", ...cands];
    row.openscriptures_lexical_index = li;
    if (CLASS_OF[li[0]] === "absent") row.openscriptures_bdb_1906 = [li[0]];
    else {
      const ids = [...new Set(li.slice(1).map((id) => src.openscriptures_lexical_index[id].xref.bdb).filter(Boolean))];
      const inFile = ids.filter((id) => bdb[id]);
      if (!inFile.length) row.openscriptures_bdb_1906 = ["B"];
      else if (inFile.length === 1) row.openscriptures_bdb_1906 = [li[0] === "A" ? "S" : li[0], inFile[0]];
      else row.openscriptures_bdb_1906 = ["A", ...inFile];
    }

    const ur = ubdbByNumber.get(N) || [];
    row.unabridged_bdb_1906 = own ? ["P"] : ur.length === 1 ? ["N", ur[0]] : ur.length ? ["A", ...ur] : ["0"];
    const ub = ubsByNumber.get(N) || [];
    row.ubs_sdbh_hebrew_v0_9_2 = own ? ["P"] : ub.length === 1 ? ["N", ub[0]] : ub.length ? ["A", ...ub] : ["0"];
    row.unfoldingword_uhal = own ? ["P"] : uhalHas.has(N) ? ["N", "H" + String(N).padStart(4, "0")] : strongsHas.has(N) ? ["H"] : ["0"];
    out[tag] = row;
  }
  return out;
}

/** Counts of a bridge for one source: tags, rows (words) and parts by how. */
export function countBridge(bridge, key) {
  const c = { tags: {}, rows_the_tag_stands_on: {}, parts: {}, root_parts: {}, by_class: { tags: {}, parts: {}, root_parts: {} } };
  for (const row of Object.values(bridge)) {
    const how = row[key][0];
    const cls = CLASS_OF[how];
    c.tags[how] = (c.tags[how] || 0) + 1;
    c.rows_the_tag_stands_on[how] = (c.rows_the_tag_stands_on[how] || 0) + row.n[0];
    c.parts[how] = (c.parts[how] || 0) + row.n[1];
    c.root_parts[how] = (c.root_parts[how] || 0) + row.n[2];
    c.by_class.tags[cls] = (c.by_class.tags[cls] || 0) + 1;
    c.by_class.parts[cls] = (c.by_class.parts[cls] || 0) + row.n[1];
    c.by_class.root_parts[cls] = (c.by_class.root_parts[cls] || 0) + row.n[2];
  }
  return c;
}

/** What the files give to part the ambiguous tags of one source: for each,
 *  every entry held, with the facts of the entry a reader could part by. */
export function ambiguousOf(bridge, key, src) {
  const out = {};
  for (const [tag, row] of Object.entries(bridge)) {
    if (row[key][0] !== "A") continue;
    out[tag] = { rows: row.n[0], entries: row[key].slice(1).map((id) => factsOf(key, id, src[key][id])) };
  }
  return out;
}
function factsOf(key, id, e) {
  if (key === "openscriptures_lexical_index") return { id, w: e.w, pos: e.pos, def: e.def, letter: e.xref.aug || null, bdb: e.xref.bdb || null };
  if (key === "openscriptures_bdb_1906") return { id, type: e.type, numeral: e.numeral || null, w: e.w && e.w[0] ? e.w[0].t : null, first_def: e.defs && e.defs[0] ? e.defs[0].t : null };
  if (key === "unabridged_bdb_1906") { const h = e.blocks[0] && e.blocks[0].head; const g = h && (h.italics || []).find((x) => x.kind === "main_gloss"); return { id, numbers_in_the_records_column: e.strong, language: e.language, numeral: (h && h.numeral) || null, headword: h && h.headword ? h.headword.t : null, main_gloss: g ? g.t : null }; }
  if (key === "ubs_sdbh_hebrew_v0_9_2") return { id, lemma: e.Lemma, codes: e.StrongCodes, base_forms: e.BaseForms.length, senses: e.BaseForms.reduce((n, b) => n + b.LEXMeanings.length, 0) };
  if (key === "stepbible_tbesh_gloss") return { id, eStrong: e.eStrong, Hebrew: e.Hebrew, Gloss: e.Gloss, relation: e.relation || null };
  return { id };
}

// ------------------------------------------------------------ verses

/** Our verses, from the zones: book slug to the set of "chapter:verse". */
export function ourVerses(zones) {
  const out = new Map();
  let n = 0;
  for (const [book, zone] of Object.entries(zones)) {
    const set = new Set();
    for (const s of zone.sections) if (/^\d+:\d+$/.test(s.label)) set.add(s.label);
    out.set(book, set);
    n += set.size;
  }
  return { verses: out, count: n };
}

function addVerse(index, ours, stats, book, chapter, verse, value) {
  if (!book) { stats.references_outside_the_39_books++; return; }
  const label = chapter + ":" + verse;
  if (!ours.get(book) || !ours.get(book).has(label)) { stats.references_to_a_verse_our_text_does_not_number_so++; (stats.examples_not_numbered_so.length < 12) && stats.examples_not_numbered_so.push(book + " " + label); return; }
  const b = (index[book] ||= {});
  (b[label] ||= []).push(value);
  stats.references_indexed++;
}
const finish = (index, stats) => {
  let verses = 0;
  for (const b of Object.values(index)) verses += Object.keys(b).length;
  stats.verses_cited = verses;
  return stats;
};

/** BDB (Open Scriptures): <ref r="Job.8.12"> with the sense it stands in.
 *  A value is [BDB id, the sense's path (indexes into the entry's senses, or
 *  null where the ref stands outside every sense), the ref's index]. */
export function versesOfOpenScripturesBdb(entries, ours) {
  const index = {};
  const stats = { references: 0, references_indexed: 0, references_outside_the_39_books: 0, references_to_a_verse_our_text_does_not_number_so: 0, references_of_another_shape: 0,
    shown_verse_differs_from_the_attribute: 0, examples_not_numbered_so: [], senses_citing: 0, entries_citing: 0 };
  const senses = new Set(), ents = new Set();
  for (const [id, e] of Object.entries(entries)) {
    (e.refs || []).forEach((r, i) => {
      stats.references++;
      const m = /^([0-9A-Za-z]+)\.(\d+)\.(\d+)$/.exec(r.r || "");
      if (!m) { stats.references_of_another_shape++; return; }
      const shown = /(\d+)\D*$/.exec(r.t);
      if (shown && +shown[1] !== +m[3]) stats.shown_verse_differs_from_the_attribute++;
      const before = stats.references_indexed;
      addVerse(index, ours, stats, BY_OSIS[m[1]], +m[2], +m[3], [id, r.sense || null, i]);
      if (stats.references_indexed > before) { ents.add(id); senses.add(id + "|" + (r.sense ? r.sense.join(".") : "")); }
    });
  }
  stats.senses_citing = senses.size; stats.entries_citing = ents.size;
  return { index, stats: finish(index, stats) };
}

/** BDB (unabridged): the file's reference tags carry the book's number in
 *  the order of the English Bible and the chapter and verse, as a span. A
 *  value is [BDB id, paragraph, point (-1: the paragraph's head), sub-point
 *  (-1: none), the piece's index]. A span inside one chapter is indexed at
 *  each of its verses that our text has; a span over chapters at its first
 *  and last verse. The provider writes a reference to a whole chapter as a
 *  span from verse 1 to verse 200 ("Ps 119"): those are held apart, under
 *  the chapter, and are not spread over its verses. */
export function versesOfUnabridgedBdb(entries, ours) {
  const index = {}, chapters = {};
  const stats = { references: 0, references_indexed: 0, references_outside_the_39_books: 0, references_to_a_verse_our_text_does_not_number_so: 0,
    whole_chapter_references: 0, whole_chapter_references_to_a_chapter_our_text_lacks: 0, spans_over_several_verses: 0, verses_of_spans_our_text_lacks: 0, spans_over_chapters: 0,
    examples_not_numbered_so: [], senses_citing: 0, entries_citing: 0 };
  const senses = new Set(), ents = new Set();
  for (const [id, e] of Object.entries(entries)) {
    e.blocks.forEach((blk, bi) => {
      const units = [[-1, blk.head], ...(blk.points || []).map((p, pi) => [pi, p])];
      // which unit a piece stands in: the last (innermost) unit whose own range holds it
      const where = (ki) => {
        let hit = [-1, -1];
        for (const [pi, u] of units) {
          const [a, b] = u.own_k || u.k;
          if (ki < a || ki >= b) continue;
          let si = -1;
          (u.sub || []).forEach((s, j) => { if (ki >= s.k[0] && ki < s.k[1]) si = j; });
          hit = [pi, si];
        }
        return hit;
      };
      for (let ki = blk.k[0]; ki < blk.k[1]; ki++) {
        const p = e.k[ki];
        if (!Array.isArray(p) || p[0] !== "ref") continue;
        stats.references++;
        const [, , b, cB, vB, cE, vE] = p;
        const book = BY_ENGLISH_NUMBER[b] || null;
        const [pi, si] = where(ki);
        const value = [id, bi, pi, si, ki];
        const before = stats.references_indexed;
        if (!book) stats.references_outside_the_39_books++;
        else if (cB === cE && vB === 1 && vE === 200) {
          stats.whole_chapter_references++;
          if (ours.get(book).has(cB + ":1")) { ((chapters[book] ||= {})[cB] ||= []).push(value); stats.references_indexed++; }
          else stats.whole_chapter_references_to_a_chapter_our_text_lacks++;
        } else if (cB === cE && vE > vB) {
          stats.spans_over_several_verses++;
          let any = false;
          for (let v = vB; v <= vE; v++) {
            if (ours.get(book).has(cB + ":" + v)) { ((index[book] ||= {})[cB + ":" + v] ||= []).push(value); any = true; }
            else stats.verses_of_spans_our_text_lacks++;
          }
          if (any) stats.references_indexed++;
        } else if (cB !== cE) { stats.spans_over_chapters++; addVerse(index, ours, stats, book, cB, vB, value); addVerse(index, ours, stats, book, cE, vE, value); }
        else addVerse(index, ours, stats, book, cB, vB, value);
        if (stats.references_indexed > before) { ents.add(id); senses.add(id + "|" + bi + "|" + pi + "|" + si); }
      }
    });
  }
  stats.senses_citing = senses.size; stats.entries_citing = ents.size;
  return { index, chapters, stats: finish(index, stats) };
}

/** The UBS dictionary: a sense (LEXMeaning, known by its LEXID) lists its
 *  references as BBBCCCVVVSSWWW (the file's README: book, chapter, verse,
 *  segment, word; words counted in even numbers). A value is [LEXID, WWW]. */
export function versesOfUbs(entries, ours) {
  const index = {};
  const stats = { references: 0, references_indexed: 0, references_outside_the_39_books: 0, references_to_a_verse_our_text_does_not_number_so: 0, references_of_another_shape: 0, references_with_a_note_caller: 0,
    examples_not_numbered_so: [], examples_of_another_shape: [], senses_citing: 0, senses: 0, entries_citing: 0 };
  const ents = new Set();
  for (const [id, e] of Object.entries(entries)) for (const bf of e.BaseForms) for (const mn of bf.LEXMeanings) {
    stats.senses++;
    let cited = false;
    for (const r of mn.LEXReferences || []) {
      stats.references++;
      // a reference can carry the caller of one of the entry's notes after it: 00901201500040{N:001}
      const m = /^(\d{3})(\d{3})(\d{3})(\d{2})(\d{3})(\{N:\d+\})?$/.exec(r);
      if (m && m[6]) stats.references_with_a_note_caller++;
      if (!m) { stats.references_of_another_shape++; (stats.examples_of_another_shape.length < 8) && stats.examples_of_another_shape.push(r); continue; }
      const before = stats.references_indexed;
      addVerse(index, ours, stats, BY_ENGLISH_NUMBER[+m[1]] || null, +m[2], +m[3], [mn.LEXID, +m[5]]);
      if (stats.references_indexed > before) cited = true;
    }
    if (cited) { stats.senses_citing++; ents.add(id); }
  }
  stats.entries_citing = ents.size;
  return { index, stats: finish(index, stats) };
}

/** Measured, not applied: how often the letters of two files' headwords
 *  agree where a bridge is by number and letter. It decides nothing. */
export function headwordAgreement(bridge, src) {
  const c = { tags_by_letter_E: 0, tbesh_and_lexical_index_headwords_agree_in_letters: 0, differ: 0, examples_differ: [] };
  for (const [tag, row] of Object.entries(bridge)) {
    if (row.openscriptures_lexical_index[0] !== "E") continue;
    c.tags_by_letter_E++;
    const t = src.stepbible_tbesh_gloss[tag], l = src.openscriptures_lexical_index[row.openscriptures_lexical_index[1]];
    const a = t.Hebrew.split(/[,\s]+/).map(lettersOnly).filter(Boolean), b = lettersOnly(l.w);
    if (a.includes(b) || lettersOnly(t.Hebrew) === b) c.tbesh_and_lexical_index_headwords_agree_in_letters++;
    else { c.differ++; if (c.examples_differ.length < 12) c.examples_differ.push([tag, t.Hebrew, l.w]); }
  }
  return c;
}

export { BY_STEP };

/** Measured, not applied: what the two files themselves state that could
 *  part the unabridged BDB's records where a number stands on several.
 *  (1) Language: TBESH's Morph column says whether the tag's word is Hebrew
 *  (H:) or Aramaic (A:); each record says whether it stands in BDB's Hebrew
 *  or Aramaic part. (2) Place in the column: whether the number is the first
 *  the record lists. (3) BDB's own numeral (I., II.) on the Open Scriptures
 *  entry the tag reaches and on the record's head. The bridge keeps every
 *  record; this counts how many ambiguous tags each fact would leave with
 *  one record, and where the facts disagree. */
export function unabridgedParting(bridge, src) {
  const c = { ambiguous: { tags: 0, rows: 0 }, one_record_of_the_tags_language: { tags: 0, rows: 0 }, one_record_lists_the_number_first: { tags: 0, rows: 0 },
    one_record_by_language_and_first_place_together: { tags: 0, rows: 0 }, one_record_carries_bdbs_own_numeral_of_the_open_scriptures_entry: { tags: 0, rows: 0 },
    one_record_by_any_of_these_facts: { tags: 0, rows: 0 }, the_facts_name_different_records: { tags: 0, rows: 0 }, left_ambiguous_by_all_these_facts: { tags: 0, rows: 0 }, tags_with_no_language_in_tbesh: { tags: 0, rows: 0 } };
  const per = {};
  const add = (slot, row) => { slot.tags++; slot.rows += row.n[0]; };
  for (const [tag, row] of Object.entries(bridge)) {
    if (row.unabridged_bdb_1906[0] !== "A") continue;
    add(c.ambiguous, row);
    const ids = row.unabridged_bdb_1906.slice(1);
    const line = src.stepbible_tbesh_gloss[tag];
    const lang = line && /^[HA]:/.test(line.Morph) ? (line.Morph[0] === "H" ? "BIBLICAL HEBREW" : "BIBLICAL ARAMAIC") : null;
    if (!lang) add(c.tags_with_no_language_in_tbesh, row);
    const number = "H" + (+tag.slice(1, 5));
    const byLang = lang ? ids.filter((id) => src.unabridged_bdb_1906[id].language === lang) : ids;
    const first = ids.filter((id) => src.unabridged_bdb_1906[id].strong[0] === number);
    const both = byLang.filter((id) => first.includes(id));
    const p = {};
    if (lang && byLang.length === 1) { add(c.one_record_of_the_tags_language, row); p.by_language = byLang[0]; }
    if (first.length === 1) { add(c.one_record_lists_the_number_first, row); p.by_first_place = first[0]; }
    if (both.length === 1) { add(c.one_record_by_language_and_first_place_together, row); p.by_both = both[0]; }
    // (3) BDB's own numeral: where the Open Scriptures bridge is exact and its
    // entry carries a numeral (mod="II"), the records whose head carries the same
    const osb = row.openscriptures_bdb_1906;
    const numeral = osb.length === 2 && src.openscriptures_bdb_1906[osb[1]] ? src.openscriptures_bdb_1906[osb[1]].numeral : null;
    if (numeral) {
      const same = byLang.filter((id) => { const h = src.unabridged_bdb_1906[id].blocks[0] && src.unabridged_bdb_1906[id].blocks[0].head; return h && h.numeral === numeral; });
      if (same.length === 1) { add(c.one_record_carries_bdbs_own_numeral_of_the_open_scriptures_entry, row); p.by_numeral = same[0]; }
    }
    const named = new Set([p.by_language, p.by_first_place, p.by_both, p.by_numeral].filter(Boolean));
    if (named.size) add(c.one_record_by_any_of_these_facts, row); else add(c.left_ambiguous_by_all_these_facts, row);
    if (named.size > 1) add(c.the_facts_name_different_records, row);
    if (lang) p.tag_language = lang;
    per[tag] = p;
  }
  return { counts: c, per };
}
