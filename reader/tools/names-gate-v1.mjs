// Synthesis lane · names-gate-rule-v1-a-row-its-own-source-gives-as-a-name-is-withheld-where-the-word-on-the-page-is-not-a-name
// LEDGER: -
// no frame letter. The gate's own function: it reads a row's mark and a
// place's, and writes nothing.
//
// THE NAMES GATE: A ROW ITS OWN SOURCE GIVES AS A NAME IS WITHHELD WHERE THE
// WORD ON THE PAGE IS NOT A NAME.
//
// A dictionary lists a man called Bara and a country called Peru under the
// letters of two verbs. Neither carries a Strong's number, and each is
// pointed as its verb is, so neither the pointing nor the entry gate parts
// it from the verb. Its own source says what it is. The corpus lane listed
// the served rows whose every entry is marked a name in its own source, and
// the word places of the thirty-nine books that are a name: where TAHOT's
// grammar for the core piece begins as a proper noun's does, or a MACULA
// word there has the type proper (relay v177). The owner ruled (13 November
// 2026: «1-3. ok agree», ruling 8):
//
//   At a place that is not a name, a row its source gives as a name is
//   withheld and counted. At a place that is a name, the row stands.
//
// The rows' half rides on the row (its facts slot: name, written by
// tools/apply-name-rows-v1.mjs); the places' half rides on the word (np,
// projected by tools/project-lattice-v12-v1.mjs from the lane's list). A
// source the lane did not read for names marks none, and its names stand.
// The page carries this function under the same name.
export const NAMES_GATE_RULE_ID = "names-gate-rule-v1-a-row-its-own-source-gives-as-a-name-is-withheld-where-the-word-on-the-page-is-not-a-name";

/** Whether the gate withholds a row at a place: the row is a name's, and the place is not a name. */
export const nameWithheld = (facts, placeIsAName) => !!(facts && facts.name) && !placeIsAName;
