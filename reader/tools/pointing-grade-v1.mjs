#!/usr/bin/env node
// Synthesis lane · pointing-grade-rule-v1-a-row-is-graded-by-its-own-headwords-against-the-open-word
// LEDGER: -
// no frame letter. This changes no letter of the text and no row of the
// store: it is the one definition by which a store row earns its grade
// against the word standing open, computed at display time and never stored.
//
// THE GRADE FROM THE ROW'S OWN HEADWORDS. The corpus lane's pointing store
// (route store v2, one slot added) carries at [6] the source's own pointed
// headword strings for that (key, text, source). The grade of a row is then
// the row's business and the open word's, nothing else's:
//
//   V = { vowelForm(h) : h in row[6] where isPointed(h) }
//   V empty                  -> n  NORMALIZED      the source is silent on pointing
//   vowelForm(S) in V        -> m  VOWEL_MATCH     any one matching headword is enough
//   else                     -> x  VOWEL_MISMATCH
//   no [6] on the row        -> -  ungraded here   (a v1 row; the lattice card's grade, if any, stands)
//
// S is the open word's own pointed surface — the form as the page prints it
// (else the qere, else the first piece of a compound). [6] is read as "any
// of these", never "the first": a source that points a headword two ways and
// one of them is the page's is a source that agrees. Per source, per row —
// the lattice merged every source's headwords into one card and graded the
// card; that mesh is what the pointing toggle undoes, so a per-row grade will
// not reproduce the lattice's exactly and should not (the corpus lane's
// contract, §3 c: 6.1% of row-at-entry slots differ on its axis).
//
// vowelForm and isPointed are the corpus lane's own lines — FIND-TIER-v1 §1.1,
// build-lattice-ledger-v11 — carried here unchanged: U+034F dropped before
// NFKD, cantillation and the marks that are not vowels (meteg, maqaf, rafe,
// paseq, U+05C3–05C7) deleted, then everything but the vowel points, shin and
// sin dots, dagesh and the letters. Pointed means: a vowel point U+05B0–05BB
// after NFKD. The same two functions stand in zone.html, to the character;
// tools/check-pointing-grade-v1.mjs holds the two copies together.
export const POINTING_GRADE_RULE_ID = "pointing-grade-rule-v1-a-row-is-graded-by-its-own-headwords-against-the-open-word";

export const vowelForm = (t) => String(t ?? "")
  .replace(/\u034F/g, "")
  .normalize("NFKD")
  .replace(/[\u0591-\u05AF\u05BD\u05BE\u05BF\u05C0\u05C3\u05C4\u05C5\u05C6\u05C7]/g, "")
  .replace(/[^\u05B0-\u05BC\u05C1\u05C2\u05D0-\u05EA]/g, "");
export const isPointed = (t) => /[\u05B0-\u05BB]/.test(String(t ?? "").normalize("NFKD"));
// a row carries headwords when its seventh slot is an array — the v2 shape;
// an empty array is a source that names no headword and grades NORMALIZED
export const rowCarriesHeadwords = (row) => Array.isArray(row) && Array.isArray(row[6]);
export const gradeRow = (row, surface) => {
  if (!rowCarriesHeadwords(row)) return "-";
  const V = row[6].filter(isPointed).map(vowelForm);
  if (!V.length) return "n";
  return V.includes(vowelForm(surface)) ? "m" : "x";
};
export const GRADE_WORDS = { m: "VOWEL_MATCH", n: "NORMALIZED", x: "VOWEL_MISMATCH", "-": "ungraded" };
