// PIPELINE.md's opening note says what the site is made from today. It gains the fourth ruling of 13 November: a row
// that is only the words opening a numbered sense of its entry is marked from the corpus lane's list, gives no
// reading, and prints on the card as a note. It is written after the sentence on the stems, which the same note
// gained with the stems extension, so this edit is applied to a tree that holds that one.
// node 78-the-pipeline-names-the-sense-openings.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "PIPELINE.md"), [
  [`> store as of the store's own (\`tools/rows-beside-the-store-v1.mjs\` is how a
> check counts those rows).
`,
   `> store as of the store's own (\`tools/rows-beside-the-store-v1.mjs\` is how a
> check counts those rows). A row's facts also say, since the same day,
> where the row is only the words that open a numbered sense of its entry
> (\`tools/apply-sense-openings-v1.mjs\`, from the corpus lane's list of the
> unabridged BDB's openings kept in \`data/sense-openings/\`, under the
> owner's ruling that such a row prints as a note and not as a pill). The
> store's reader gives such a row no reading, so no line, pill, link or
> index entry stands on it, and the reader prints the ones its switches
> keep as the card's notes, with the record of the reading held.
`],
]);
