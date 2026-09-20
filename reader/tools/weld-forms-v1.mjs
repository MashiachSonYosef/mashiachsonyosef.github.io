#!/usr/bin/env node
// Synthesis lane · weld-forms-rule-v1-a-joined-run-is-offered-in-every-form-a-source-published-and-in-no-form-it-did-not
//
// THE FORMS A JOINED RUN CAN BE LOOKED UP UNDER.
//
// The ink joins words with a maqaf: bet-nun MAQAF he-dalet-dalet. A reader
// can ask about that run in more than one way, and the ways are not this
// project's inventions — each one is a spelling some dictionary actually
// published as a headword:
//
//   pieces  each piece on its own, which is what the site has always served
//   maqaf   the run as written, joiner and all. 5,771 headwords in the store
//           carry a maqaf, so this is a real lookup and not a formality
//   weld    the joiner dropped, the run run together as one word. BDB
//           publishes exactly this for Ben-Hadad and Bethel
//   folded  a weld whose seam letters lose their final form. BDB publishes
//           this too, and says so in its own words: the reading at the folded
//           key for son-of-man reads "alternative spelling of ben adam"
//
// WHAT THIS MODULE DOES NOT DO, AND THE REASON IS THE WHOLE POINT. It does
// not decide that a folded form is correct, or that a weld means what the
// pieces mean. It enumerates the spellings mechanically and hands them to the
// store. A form becomes something a reader can see ONLY when a source
// published a headword under it; a form no source wrote finds nothing and is
// never drawn. We do not fold — we discover which foldings the dictionaries
// already made (owner, 2026-09-20: "fold anywhere the source says").
//
// The enumeration is every subset of the foldable seams, so a run with two
// foldable seams offers both single folds and the double. In the 39 books
// served today no run has more than one folding that finds readings, but the
// rule is general because the shelf is not.
//
// SEAM, not tail: only a piece that another piece follows may fold. The last
// letter of the whole run is where a final form belongs, and folding it would
// be this project correcting the ink.

/** final letters, and the medial letter each one is the final form of */
export const FINAL_TO_MEDIAL = Object.freeze({
  "ך": "כ",   // kaf
  "ם": "מ",   // mem
  "ן": "נ",   // nun
  "ף": "פ",   // pe
  "ץ": "צ",   // tsadi
});
export const MAQAF = "־";
export const WELD_FORMS_RULE_ID = "weld-forms-rule-v1-a-joined-run-is-offered-in-every-form-a-source-published-and-in-no-form-it-did-not";

/** the seam positions of a run that CAN fold: a piece, not the last, whose
 *  final letter has a medial form */
export const foldableSeams = (keys) => {
  const out = [];
  keys.forEach((k, i) => { if (i < keys.length - 1 && FINAL_TO_MEDIAL[String(k).slice(-1)]) out.push(i); });
  return out;
};

/** EVERY FORM THIS RUN COULD BE LOOKED UP UNDER, in one order, each tagged.
 *  `keys` are the pieces' own keys, in the order the ink has them. The return
 *  is [{ form, key, folds }] with no lookup done and nothing filtered: what
 *  the store holds is the store's business, and the caller asks it. */
export const formsOfRun = (keys) => {
  const ks = (keys || []).map((k) => String(k ?? ""));
  const pieces = ks.map((k, i) => ({ form: "pieces", key: k, folds: 0, piece: i })).filter((p) => p.key);
  // A PIECE WITH NO KEY MEANS THE RUN HAS NO COMPOUND. On this shelf 79
  // joined runs carry a piece that keys to nothing, and joining what is left
  // produces a key like "lo MAQAF" or "MAQAF aretz" — one word with the
  // joiner hanging off it. Those keys are REAL: sources publish headwords
  // with a trailing maqaf, and 2,554 keys in the store carry one. That is
  // exactly why this has to refuse them. A measurement that built them
  // counted a piece, found it in the store, and reported it as the joined
  // form: it put the maqaf form of a run at 30 when the true figure is 1.
  // You cannot look up a compound one of whose parts is not a word.
  if (ks.length < 2 || ks.some((k) => !k)) return pieces;
  const out = pieces.slice();
  out.push({ form: "maqaf", key: ks.join(MAQAF), folds: 0 });
  const seams = foldableSeams(ks);
  for (let mask = 0; mask < (1 << seams.length); mask += 1) {
    const c = ks.slice();
    let folds = 0;
    seams.forEach((p, b) => {
      if (mask & (1 << b)) { c[p] = c[p].slice(0, -1) + FINAL_TO_MEDIAL[c[p].slice(-1)]; folds += 1; }
    });
    out.push({ form: folds ? "folded" : "weld", key: c.join(""), folds });
  }
  return out;
};

/** THE ORDER OF THE FORMS ON THE CARD — a sort, and never a filter.
 *
 *  The owner's ruling of 2026-09-20: priority sorting only, no on/off, because
 *  "burying something is practically the same thing as off anyway". So the
 *  order moves and nothing is ever withheld: every form a source populated is
 *  drawn, and the card prints how many stand under each one so a form that
 *  sorts last is still visibly there rather than lost down a scroll.
 *
 *  `pieces` leads by default because it is what every published zone has
 *  served since the shelf existed, and a default that moves a reader's page
 *  on the day a toggle ships is a toggle that changed the text. */
export const FORM_ORDERS = Object.freeze({
  pieces: ["pieces", "weld", "maqaf", "folded"],
  joined: ["weld", "folded", "maqaf", "pieces"],
  written: ["maqaf", "pieces", "weld", "folded"],
});
export const DEFAULT_FORM_ORDER = "pieces";

/** what the card calls each form, in the reader's own language */
export const FORM_WORDS = Object.freeze({
  pieces: "as separate words",
  maqaf: "as written, with the maqaf",
  weld: "joined into one word",
  folded: "joined, in the spelling the source used",
});
