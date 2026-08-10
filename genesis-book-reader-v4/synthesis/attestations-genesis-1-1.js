// Synthesis lane · gloss attestations for Genesis 1:1.
//
// This is the human override layer for default glosses — the gloss
// equivalent of a PROVEN_EDGE. When a person examines a word's routes and
// asserts the right default, it is recorded HERE, with a name and a date,
// never by editing reader code. The reader prefers an attested gloss over
// the derived draft; the synthesis ledger keeps the dispute history.
//
// To attest: add an entry keyed by word index. The gloss must be one of
// the word's existing routes (the reader will not display an invented
// string as selected-by-default; it falls back to the derived draft if the
// attested text matches no route).
//
//   3: {
//     gloss: "God",
//     attested_by: "Kyle",
//     attested_on: "2026-08-11",
//     basis: "context; targum reads יְיָ",
//   },

window.SYNTHESIS_GLOSS_ATTESTATIONS = Object.freeze({
  fixture_id: "synthesis-gloss-attestations-genesis-1-1",
  ref: "Genesis 1:1",
  status: "OPEN — no attestations recorded yet",
  by_word_index: {},
});
