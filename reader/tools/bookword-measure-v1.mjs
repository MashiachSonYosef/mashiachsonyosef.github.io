// Synthesis lane · the measure of a book, on named axes
//
// RULE: bookword-measure-rule-v1-every-count-names-its-axis
//
// One definition, used everywhere a number about a book is produced: the
// zone builder that stamps the count on the page, the check that recounts
// the built zone from its bytes, and the adapter that pre-counts a restore
// before it is served. Three tools reading one measure cannot disagree
// with each other about what a word is; they can only disagree with the
// scribes, which is the disagreement the stamp exists to show.
//
// THE AXES (the corpus lane's axes law, 2026-09-05: every count names its
// axis — written or read, joined or split):
//
//   verses    the units the edition divides the book into
//   words     the READ branch, each maqaf piece a word — the axis Pardes
//             Yosef counted (79,980 on the Torah); a ketiv-qere site counts
//             the words of its qere, a ketiv the tradition does not read
//             counts none
//   words_written   the same on the WRITTEN branch (the ketiv's words)
//   letters   the WRITTEN branch — a printed text is counted on its ketiv
//   letters_read    the same on the read branch
//   c0_on     the positions that are words: neither a mark nor held
//   c0_off    the positions that are marks — the scribes' ink that is not a
//             word of the book (rules 4, 5, 6, 10, 11), each its own C0
//
// THE BRANCHES. A ketiv-qere site rides whole in one C0, both halves as the
// source writes them: the ketiv in parentheses, the qere in square brackets.
// Reading the site on one branch means dropping the other's group and
// unwrapping this one's brackets; nothing else in the surface changes. A
// maqaf between a branch's words, or joining the site to its neighbour, is
// a boundary on either branch — it is never dissolved.
//
// Every character named here is named by its codepoint. A tool may not type
// a character of the text.

const MAQAF = "\u05be";              // U+05BE HEBREW PUNCTUATION MAQAF
const PAREN = /\([^()]*\)/gu;       // a ketiv group
const BRACK = /\[[^\[\]]*\]/gu;     // a qere group
const LETTER = /[\u05d0-\u05ea]/gu; // alef through tav
const nfc = (s) => String(s ?? "").normalize("NFC");

/** The letters of a string: alef through tav, nothing else. */
export const lettersOf = (s) => (nfc(s).match(LETTER) || []).length;

/** The words of a string on the split axis: whitespace-delimited tokens, each
 *  cut again at its maqafs, empties dropped. */
export const piecesOf = (s) => nfc(s).split(/\s+/u).flatMap((t) => t.split(MAQAF)).filter(Boolean);

/** A surface read on one branch. `read` drops the ketiv groups and unwraps
 *  the qere brackets; `written` drops the qere groups and unwraps the ketiv
 *  parentheses. A surface with no groups is the same on both. */
export const branchOf = (surface, which) => {
  const s = nfc(surface);
  if (which === "read") return s.replace(PAREN, "").replace(/[\[\]]/gu, "");
  return s.replace(BRACK, "").replace(/[()]/gu, "");
};

/** One zone word, measured. Returns null for a held position (the chain's
 *  script rule; nothing arrived to count). */
export const measureWord = (w) => {
  if (w.held) return null;
  if (w.mark) return { off: true, kind: w.mark.kind, words: 0, words_written: 0, letters: 0, letters_read: 0 };
  const s = w.s || "";
  if (w.kq) {
    const read = branchOf(s, "read"), written = branchOf(s, "written");
    return { off: false, kq: true, words: piecesOf(read).length, words_written: piecesOf(written).length, letters: lettersOf(written), letters_read: lettersOf(read) };
  }
  const n = piecesOf(s).length;
  return { off: false, words: n, words_written: n, letters: lettersOf(s), letters_read: lettersOf(s) };
};

/** A whole zone, measured on every axis, with the marks counted by kind. */
export const measureZone = (z) => {
  const out = { verses: 0, words: 0, words_written: 0, letters: 0, letters_read: 0, c0_on: 0, c0_off: 0, held: 0, kq_sites: 0, marks: {} };
  for (const sec of (z.sections || [])) {
    out.verses += 1;
    for (const w of (sec.words || [])) {
      const m = measureWord(w);
      if (!m) { out.held += 1; continue; }
      if (m.off) { out.c0_off += 1; out.marks[m.kind] = (out.marks[m.kind] || 0) + 1; continue; }
      out.c0_on += 1;
      if (m.kq) out.kq_sites += 1;
      out.words += m.words; out.words_written += m.words_written;
      out.letters += m.letters; out.letters_read += m.letters_read;
    }
  }
  out.marks = Object.fromEntries(Object.entries(out.marks).sort());
  return out;
};

export const MEASURE_RULE_ID = "bookword-measure-rule-v1-every-count-names-its-axis";
export const MEASURE_AXES = Object.freeze({
  verses: "the units the edition divides the book into",
  words: "the read branch, each maqaf piece a word; a ketiv-qere site counts the words of its qere",
  words_written: "the written branch, each maqaf piece a word; a ketiv-qere site counts the words of its ketiv",
  letters: "letters of the written branch, alef through tav",
  letters_read: "letters of the read branch, alef through tav",
  c0_on: "positions that are words of the book: neither a mark nor held",
  c0_off: "positions that are the scribes' marks, each its own C0 and none of them a word",
});
