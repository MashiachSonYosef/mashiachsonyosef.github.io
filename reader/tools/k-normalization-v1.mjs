// Synthesis lane · exact-K normalization, rule 7 of definition-poc/FRAME.md
//
// The rule is not ours. It is quoted verbatim from the frame that governs the
// K layer, and this file exists so that no builder ever re-guesses it:
//
//   "7. Exact K normalization may remove niqqud, cantillation, bidi controls,
//       sof pasuq, and paseq. It preserves Hebrew letters including final
//       forms, internal word boundaries, abbreviation punctuation, and
//       boundary hyphen/maqaf."
//
// The consequence that matters at display time: a maqaf is preserved, so
// `אֶת־אֲבִישַׁג` keys as `את־אבישג` and NOT as `אתאבישג`. Stripping the maqaf
// fuses two words into one and the catalog then answers for a form that was
// never written. Measured on the sealed text, fusing buys +0.69% gloss
// coverage and every point of it is wrong:
//
//   קִרְאוּ־לִי  "call me"          -> קראולי  -> "crowley"
//   אֶל־קַיִן    "to Cain"          -> אלקין   -> "a hydrocarbon with a triple bond"
//   אֶל־גְּבִרְתָּהּ "to her mistress" -> אלגברתך -> "algebra"
//   כִּי־אִם     "but rather"       -> כיאם    -> "khayyam"
//
// Under the rule those words carry no exact route and render bare, which is
// the honest answer. The compounds the sources themselves print with a maqaf
// still resolve — עַל־כֵּן -> על־כן -> "therefore" — because the written form
// is the key.
//
// FRAME rule 5 and rule 9 forbid the other tempting repair: splitting a
// maqaf-joined token into its halves to gloss each one is a folded/derived
// edge, and a folded edge "never supplies the displayed D card for another K".

/** Hebrew letters, alef..tav, final forms included (05D0–05EA). */
const isHebrewLetter = (cp) => cp >= 0x05d0 && cp <= 0x05ea;

/**
 * Preserved punctuation:
 *   05BE MAQAF        — boundary hyphen (rule 7, explicit)
 *   05F3 GERESH       — abbreviation mark (rule 7, "abbreviation punctuation")
 *   05F4 GERSHAYIM    — abbreviation mark
 * Measured against the corpus's own exact-K universe
 * (ledgers/work/composition-map-v6/compcell-exact-key-universe-v2.csv.gz,
 * 1,692,773 keys): 2,574 keys carry a maqaf, 93,654 carry geresh/gershayim,
 * 0 carry a combining grapheme joiner, 0 carry a space.
 */
const KEPT_PUNCTUATION = new Set(["\u05BE", "\u05F3", "\u05F4"]);

/**
 * Everything else is dropped, which covers exactly what the rule names —
 * niqqud (05B0–05BC, 05BF, 05C1, 05C2, 05C7), cantillation (0591–05AF, 05BD),
 * sof pasuq (05C3), paseq (05C0), bidi controls (200E/200F, 202A–202E,
 * 2066–2069) — plus the invisible joiners and stray source markup the
 * chain still carries on held rows (CGJ 034F, `<b>`, `&thinsp;`).
 *
 * @param {string} surface exact_surface_form as the sealed chain emits it
 * @returns {string} the exact K, or "" when nothing lexical survives
 */
export const exactK = (surface) =>
  [...String(surface ?? "").normalize("NFC")]
    .filter((ch) => isHebrewLetter(ch.codePointAt(0)) || KEPT_PUNCTUATION.has(ch))
    .join("");

export const K_RULE_ID = "exact-k-rule-frame-38-rule-7-maqaf-preserved";
export const K_RULE_TEXT =
  "definition-poc/FRAME.md rule 7 — removes niqqud, cantillation, bidi controls, sof pasuq and paseq; " +
  "preserves Hebrew letters including final forms, abbreviation punctuation, and boundary hyphen/maqaf. " +
  "No folding, no splitting, no derivation (rules 5 and 9).";
