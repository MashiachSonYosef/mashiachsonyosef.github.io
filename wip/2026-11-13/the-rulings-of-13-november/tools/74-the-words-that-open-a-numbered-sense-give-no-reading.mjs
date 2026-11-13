// The store's reader learns the fourth ruling of 13 November: a row that is only the words opening a numbered sense
// of its entry is a note, not a reading. The row's facts gain a key (opens: the entry and the point of the sense, as
// its source names them), the module says what that key means (senseOpened) and names the rule, and the one function
// every line, pill, link and index entry is cut by (readingsWith) gives such a row no reading.
// node 74-the-words-that-open-a-numbered-sense-give-no-reading.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "tools", "gloss-store-v1.mjs"), [
  [`//   name  1 where every entry its own source gives the row is a name (relay
//         v177)
// A row with none of these carries no such slot. The texts are not touched.
`,
   `//   name  1 where every entry its own source gives the row is a name (relay
//         v177)
//   opens for a row that is only the words opening a numbered sense of its
//         entry, that entry and the sense's point as the source names them
//         ("BDB1300 1."; relay v174)
// A row with none of these carries no such slot. The texts are not touched.
`],
  [`// the era cut, one constant: 1940 AD is 5700 AM, the last year of the 57th
`,
   `// THE WORDS THAT OPEN A NUMBERED SENSE ARE A NOTE, NOT A READING
// (sense-openings-rule-v1, 13 November 2026). The catalog made a route of
// the words that open each numbered sense of an entry of the unabridged BDB,
// and BDB opens a sense with what the word is said of as often as with a
// rendering: «object heaven and earth» and «of transformations: a clean
// heart» under "he created", «son of Bela, grandson of Benjm.» under a name.
// An outside reader took four such pills on the verb cards of Genesis 1 for
// broken pieces. The corpus lane listed the served rows that are only such
// an opening (relay v174), and the owner ruled how they print (ruling 4 of
// relay v176, «1-5. agree go ahead»): as a note beside the sense's readings,
// not as a pill. tools/apply-sense-openings-v1.mjs marks each listed row in
// its facts (opens). A marked row gives no reading (readingsOf, below), so
// no line, no pill, no link and no index entry stands on it. It is still a
// row of its key and is asked whatever a row is asked; where it is kept,
// the card prints it among its notes, with its point. The page carries the
// same function under the same name.
export const SENSE_OPENINGS_RULE_ID = "sense-openings-rule-v1-the-words-that-open-a-numbered-sense-print-as-a-note-beside-the-readings-and-not-as-a-pill";
/** How the owner ruled such a row prints, in the ruling's own words. The tool that marks the rows refuses a ruling
 *  that says anything else, since this is what the reader and the page were made to do. */
export const SENSE_OPENINGS_PRINT = "as a note beside the sense's readings, not as a pill";
/** The numbered sense a row opens: its entry and its point as the source names them, and the row's words as they
 *  print. null for a row that opens none. */
export const senseOpened = (row) => {
  const o = (factsOf(row) || {}).opens;
  if (typeof o !== "string" || !o) return null;
  const at = o.indexOf(" ");
  return { entry: at < 0 ? o : o.slice(0, at), point: at < 0 ? "" : o.slice(at + 1), text: routePrinted(row) };
};
// the era cut, one constant: 1940 AD is 5700 AM, the last year of the 57th
`],
  // the rule's own text, which every zone carries beside its lines, says it too
  [`  "a space our own build made in a text closes where the text prints, at the places its row names (row[9]; made-spaces-rule-v1); " +
`,
   `  "a space our own build made in a text closes where the text prints, at the places its row names (row[9]; made-spaces-rule-v1); " +
  "a row that is only the words opening a numbered sense of its entry (its facts name the sense; sense-openings-rule-v1) gives no reading and prints as a note; " +
`],
  [`  const readingsWith = (row, shut) => {
    const text = String(row[1] ?? "");
`,
   `  const readingsWith = (row, shut) => {
    // the words that open a numbered sense are a note, not a reading (sense-openings-rule-v1)
    if (senseOpened(row)) return [];
    const text = String(row[1] ?? "");
`],
]);
