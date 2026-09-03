// Synthesis lane · exact-K normalization v2
//
// v1 quoted rule 7 of definition-poc/FRAME.md verbatim and kept it: remove
// niqqud, cantillation, bidi controls, sof pasuq and paseq; preserve Hebrew
// letters, abbreviation punctuation, and the maqaf. Two rulings since move
// the key, and both are the corpus lane's frame and the owner's word, not
// this lane's invention:
//
//   1. ABBREVIATION MARKS WRITTEN AS ASCII (TECHNICAL-FRAME-v1, key rule):
//      "ASCII ' and \" among Hebrew letters normalize to U+05F3/U+05F4 BEFORE
//      keying. The existing key rule then preserves the mark." v1 dropped an
//      ASCII quote as non-lexical, so the abbreviation ha-kadosh-barukh-hu keyed with its letters run
//      together and 16,532 words
//      on the shelf were glossed for a form no source wrote (2026-09-02
//      census, check-k-maqaf-preserved L7). Only the ASCII characters are
//      named by the rule; a typographic quote (U+201D and kin) is not
//      remapped here and is reported, not guessed.
//
//   2. THE MAQAF UNDER RULE 2 (owner, 2026-09-02: a maqaf compound is two
//      C0s, "keys clean per part"; the corpus lane's split reseal attaches
//      the maqaf to the preceding part). A row that ends with a maqaf is one
//      word of the book whose ink carries the joiner; its key is the word.
//      So a maqaf at the boundary of a row is not in the key. A maqaf INSIDE
//      a row is a compound the reseal has not yet split (the 74 edge works,
//      or any row a stream still seals joined) and keeps v1's law: preserved
//      in place, the lattice above it, because fusing the two words of a compound into one key names
//      a form no source wrote.
//
// Everything else is v1, unchanged, and quoted from it.

const isHebrewLetter = (cp) => cp >= 0x05d0 && cp <= 0x05ea;
const MAQAF = "\u05be";
const GERESH = "\u05f3", GERSHAYIM = "\u05f4";
const KEPT_PUNCTUATION = new Set([MAQAF, GERESH, GERSHAYIM]);

/**
 * Ruling 1 applied to a surface: an ASCII quote standing between two Hebrew
 * letters (marks, points and accents between are looked through, since the
 * quote sits among letters whatever rides on them) becomes the Hebrew mark.
 * Nothing else in the surface changes; the ink is never rewritten, only the
 * copy the key is cut from.
 */
const HEBREW_MARK = /[\u0591-\u05bd\u05bf-\u05c7]/u;
export const normalizeAsciiAbbreviation = (surface) => {
  const cs = [...String(surface ?? "").normalize("NFC")];
  const letterBefore = (i) => { for (let j = i - 1; j >= 0; j -= 1) { const c = cs[j]; if (isHebrewLetter(c.codePointAt(0))) return true; if (!HEBREW_MARK.test(c)) return false; } return false; };
  const letterAfter = (i) => { for (let j = i + 1; j < cs.length; j += 1) { const c = cs[j]; if (isHebrewLetter(c.codePointAt(0))) return true; if (!HEBREW_MARK.test(c)) return false; } return false; };
  for (let i = 0; i < cs.length; i += 1) {
    if ((cs[i] === '"' || cs[i] === "'") && letterBefore(i) && letterAfter(i)) cs[i] = cs[i] === '"' ? GERSHAYIM : GERESH;
  }
  return cs.join("");
};

/**
 * @param {string} surface exact_surface_form as the stream emits it
 * @returns {string} the exact K, or "" when nothing lexical survives
 */
export const exactK = (surface) => {
  const kept = [...normalizeAsciiAbbreviation(surface)]
    .filter((ch) => isHebrewLetter(ch.codePointAt(0)) || KEPT_PUNCTUATION.has(ch))
    .join("");
  // ruling 2: a maqaf at either boundary is the joiner riding on this row,
  // not a letter of the word; inside, it stays (v1's law, the unsplit case)
  return kept.replace(/^\u05be+/u, "").replace(/\u05be+$/u, "");
};

/** Whether a surface carries the joiner at its end: it joins the next row. */
export const joinsNext = (surface) => /\u05be[\u0591-\u05c7]*$/u.test(String(surface ?? "").normalize("NFC"));
/** Whether a surface carries the joiner at its start: a degenerate edge site. */
export const joinsPrev = (surface) => /^[\u0591-\u05c7]*\u05be/u.test(String(surface ?? "").normalize("NFC"));

export const K_RULE_ID = "exact-k-rule-v2-ascii-abbreviation-marks-and-boundary-maqaf";
export const K_RULE_TEXT =
  "definition-poc/FRAME.md rule 7 as v1 kept it (niqqud, cantillation, bidi controls, sof pasuq and paseq removed; " +
  "Hebrew letters, abbreviation punctuation and the maqaf preserved), with two rulings applied before and after: " +
  "an ASCII quote among Hebrew letters is the Hebrew abbreviation mark (TECHNICAL-FRAME-v1 key rule), " +
  "and a maqaf at a row's boundary is the joiner riding on the word, not part of its key (owner, rule 2: keys clean per part); " +
  "a maqaf inside a row is an unsplit compound and keeps v1's law. No folding, no splitting, no derivation.";
