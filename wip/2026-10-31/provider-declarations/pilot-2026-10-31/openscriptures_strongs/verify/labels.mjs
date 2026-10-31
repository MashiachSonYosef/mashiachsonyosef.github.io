// My own usage-label set, written from the draft's words "(properly, figuratively, by implication, hence, specifically...)"
// and from the label-like pieces explore2.mjs printed. The draft's words leave the set open ("..."), so this is a choice.
const ADV = "properly|figuratively|literally|specifically|especially|causatively|concretely|abstractly|generally|adverbially|intensively|reflexively|transitively|intransitively|collectively|euphemistically|locally|technically|architecturally|passively|morally|teleologically|physically|mentally|subjectively|objectively|partially|indefinitely|adjectively|unfavorably|favorably|usually|rarely|mostly|chiefly|primarily|originally|apparently|probably|ceremonially|poetically|idiomatically|elliptically|ironically|sexually|distributively|emphatically|metaphorically|actively|denominatively|relatively|absolutely|negatively|positively|simply|ethically|personally|spiritually|mystically|hence|elliptically";
const BY = "by (?:implication|analogy|extension|euphemism|resemblance|abbreviation|contraction|Hebraism|permutation|transposition|reduplication|comparison|metonymy|application|reference)";
const NOUNISH = "abstract|concrete|adverb|adverbial|noun|literal|figurative|plural|dual|causative|reflexive|transitive|intransitive|interrogative|collective|reflex\\.|techn\\.|adj\\.|as (?:a )?(?:noun|adjective|adverb|preposition|title|conjunction|particle)|in (?:a )?(?:good|bad|wide|general|moral|physical) sense|(?:only )?in (?:the )?(?:plural|dual)|only (?:plural|dual)|(?:active|passive) participle";
const L = `(?:${ADV}|${BY}|${NOUNISH})`;
const PRE = "(?:(?:also|perhaps|often|usually|rarely|only|mostly|especially|chiefly|generally|used|i\\.e\\.)\\s+)*";
export const LABEL = new RegExp(`^${PRE}${L}(?:\\s*(?:,\\s*|\\s(?:and|or)\\s)\\s*${L})*$`, "u");
export const isLabel = (t) => LABEL.test(String(t).trim().replace(/\s+/gu, " "));
// "after any label": strip leading groups and the longest leading run of words that is a label (or "also").
export const stripLabelLead = (t) => {
  let x = String(t).trim();
  for (let guard = 0; guard < 6; guard++) {
    const y = x.replace(/^\([^()]*\)\s*/u, "");
    const w = y.split(/\s+/u); let cut = 0;
    for (let k = 1; k <= Math.min(5, w.length - 1); k++) { const pre = w.slice(0, k).join(" ").replace(/,$/u, ""); if (pre === "also" || isLabel(pre)) cut = k; }
    const z = cut ? w.slice(cut).join(" ").replace(/^[,\s]+/u, "") : y;
    if (z === x) break; x = z;
  }
  return x;
};
// The draft's vocabulary, copied verbatim from pilot/openscriptures_strongs/ledger.mjs (LABEL_CORE, LABEL, LABEL_LEAD) and used ONLY
// in the "draft-labels" run, to separate differences caused by the open label set from differences in the tests themselves.
const D_CORE =
  "properly|figuratively|literally|by implication|by impl\\.?|hence|specifically|generally|by analogy|by extension|" +
  "causatively|concretely|abstractly|adverbially|intensively|reflexively|transitively|intransitively|collectively|" +
  "abstract|concrete|adverb|morally|technically|elliptically|rarely|sometimes|occasionally|especially|usually|often|" +
  "mostly|chiefly|poetically|euphemistically|metaphorically|ironically|primarily|originally|also|" +
  "as (?:a |an )?(?:noun|adverb|adjective|preposition|conjunction|verb|interjection|particle|participle)|" +
  "(?:but )?(?:used|often|only)(?: only)? (?:adverbially|as an? \\w+|adverb)|in a (?:good|bad|wide|literal|figurative|peculiar) sense|" +
  "(?:as )?(?:a )?(?:masculine|feminine|plural|singular)|by (?:way of )?\\w+";
const D_LABEL = new RegExp(`^(?:(?:also|and|or|but|hence|i\\.e\\.|and so|and thus|so)\\s+)?\\(?(?:${D_CORE})\\)?$`, "iu");
const D_LEAD = new RegExp(`^(?:(?:also|and|or|but|hence|i\\.e\\.|and so|and thus|so)\\s+)?\\(?(?:${D_CORE})\\)?(?=[,\\s)]|$)`, "iu");
export const draftIsLabel = (t) => D_LABEL.test(String(t).trim());
export const draftStripLabelLead = (t) => { let x = String(t).trim().replace(/^(?:\([^()]*\)\s*)+/u, ""); const m = x.match(D_LEAD); if (m) x = x.slice(m[0].length).replace(/^[,\s]+/u, ""); return x; };
