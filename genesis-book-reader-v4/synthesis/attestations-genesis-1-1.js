// Synthesis lane · gloss overrides for Genesis 1:1.
//
// Backend override layer for default glosses. When the project decides a
// different default than the rule derives, it is recorded here — in data,
// unsigned, no justification required. The rule is the public
// explanation; this file is simply where the project's own choices live
// so that no pick ever hides in reader code. The ledger keeps history.
//
// To override: add an entry keyed by word index. The gloss must match one
// of the word's existing routes; otherwise the derived default stands.
//
//   7: { gloss: "earth" },

window.SYNTHESIS_GLOSS_ATTESTATIONS = Object.freeze({
  fixture_id: "synthesis-gloss-overrides-genesis-1-1",
  ref: "Genesis 1:1",
  status: "OPEN — no overrides recorded; rule v2 output stands",
  by_word_index: {},
});
