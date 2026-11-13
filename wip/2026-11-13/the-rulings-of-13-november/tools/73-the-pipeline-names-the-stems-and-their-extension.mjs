// PIPELINE.md's opening note says what the site is made from today. It did not say where a row's stems come from,
// though the round has baked them since 6 November. It now does, with the extension of 13 November: which files,
// where they are kept, which tool reads the extension under the owner's ruling, and that the reader asks the rows
// beside the store their stem as it asks the store's.
// node 73-the-pipeline-names-the-stems-and-their-extension.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "PIPELINE.md"), [
  [`> each word follows by \`tools/place-leaders-v1.mjs\`).
`,
   `> each word follows by \`tools/place-leaders-v1.mjs\`). The projection also
> bakes, for each row a source names a stem for, that stem: from the corpus
> lane's two binyan files and, since 13 November, from their extension to
> the UBS dictionary, the SDBH and Jastrow (\`data/stems-extension/\`, read
> through \`tools/stems-extension-v1.mjs\` under the owner's setting of its
> two branches). The three files stay on the lane's store and are named on
> the round's command line. The reader withholds a reading of another stem
> than the word's, and asks that of the rows of the dictionaries beside the
> store as of the store's own (\`tools/rows-beside-the-store-v1.mjs\` is how a
> check counts those rows).
`],
]);
