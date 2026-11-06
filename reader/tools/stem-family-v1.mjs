// Synthesis lane · stem-family-rule-v2-a-reading-of-another-stem-is-one-whose-stems-share-no-family-with-the-words
// LEDGER: -
// no frame letter. The binyan ledger's families: a source may name a stem
// inside a family otherwise than the place does (BDB's Po. is poel where
// MACULA says polel at the same verb), so stems are compared by family,
// never by name. A name that is no family's member is its own family. The
// page carries the same map, to the character (tools/check-pointing-gate-v1.mjs
// holds the two together).
//
// v2 (the corpus lane's version 2 of both binyan files, v105.1, 6 November
// 2026): the Hebrew stem and its Aramaic name are one family, as the corpus
// lane asked, so the same verb in the same stem is never another stem's:
// qal with peal, hiphil with haphel and aphel, piel with pael. The names
// each of those already held go with it: peil (peal's passive, as qal
// passive is qal's), paal, shaphel and saphel. hephal, BDB's name for the
// passive of haphel that the places call hophal, is hophal's. Every stem
// name the row file carries is then a family some place carries.
export const STEM_FAMILY_RULE_ID = "stem-family-rule-v2-a-reading-of-another-stem-is-one-whose-stems-share-no-family-with-the-words";
export const STEM_FAMILY = Object.freeze({
  polel: "piel", poel: "piel", pilpel: "piel", palel: "piel", pealal: "piel", pilel: "piel",
  polal: "pual", poal: "pual", polpal: "pual", pulal: "pual",
  hithpolel: "hithpael", hithpalpel: "hithpael", hithpoel: "hithpael", hithpalel: "hithpael", nithpael: "hithpael", hothpaal: "hithpael", ethpolel: "hithpael",
  "qal passive": "qal", tiphil: "hiphil",
  peal: "qal", peil: "qal", pael: "piel", paal: "piel", haphel: "hiphil", aphel: "hiphil", shaphel: "hiphil", saphel: "hiphil", hephal: "hophal",
  ithpeel: "hithpeel", ithpaal: "hithpaal", ithpoel: "hithpaal",
});
export const stemFamily = (x) => STEM_FAMILY[x] || x;
// a reading whose stems are known and none of them shares a family with the
// word's stems; a reading with no known stem is never another stem's
export const isOtherStem = (rowStems, wordStems) => {
  if (!Array.isArray(rowStems) || !rowStems.length || !Array.isArray(wordStems) || !wordStems.length) return false;
  const fams = new Set(wordStems.map(stemFamily));
  return !rowStems.some((x) => fams.has(stemFamily(x)));
};
// the stems a line of the ledger's file 1 gives its place: its stem, or where
// the two sources disagree, each source's own (MACULA's name; TAHOT's letter
// by the ledger's own table, RULE-binyan-ledger-v1)
const OS_LETTER = { v: "hishtaphel", u: "hothpaal", c: "tiphil", z: "hithpoel" };
const TAHOT_STEM = {
  H: { q: "qal", N: "niphal", p: "piel", P: "pual", h: "hiphil", H: "hophal", t: "hithpael", v: "hishtaphel", u: "hothpaal", c: "tiphil", D: "nithpael" },
  A: { q: "peal", Q: "peil", p: "pael", P: "ithpaal", M: "hithpaal", u: "hithpeel", i: "ithpeel", h: "haphel", a: "aphel", e: "shaphel", H: "hophal", v: "hishtaphel" },
};
export const stemsOfPlaceLine = (l) => {
  if (l.stem !== "disagree") return [l.stem];
  const out = new Set();
  for (const b of l.by || []) {
    const code = String(b.code || "");
    if (b.source === "macula") { const mm = code.match(/^unknown: (.)$/u); out.add(mm ? (OS_LETTER[mm[1]] || code) : code); }
    else if (b.source === "tahot") {
      const table = TAHOT_STEM[code[0]];
      for (const part of code.slice(1).split(/[/\\]/u)) if (table && part[0] === "V" && table[part[1]]) out.add(table[part[1]]);
    }
  }
  return [...out].sort();
};
