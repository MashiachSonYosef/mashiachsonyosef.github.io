// PIPELINE.md's opening note says what the site is made from today. It gains the two gates of 13 November: what a
// row now carries (its facts: the entry its own source files it under, and whether its source gives it as a name),
// what a word now carries (the entry at its place, and whether the place is a name), which tools write each, and
// where the corpus lane's files they are written from are kept.
// node 65-the-pipeline-names-the-two-gates.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "PIPELINE.md"), [
  [`> bytes its pin names (\`tools/pinned-v1.mjs\`). \`PIPELINE-MANIFEST.md\` is
> generated from the code and the
`,
   `> bytes its pin names (\`tools/pinned-v1.mjs\`). Since the same day a row
> also carries a slot of facts: the entry its own source files it under
> (\`tools/apply-row-entries-v1.mjs\`, from the corpus lane's row entries
> ledger, which stays on the lane's store and is named in
> \`data/row-entries/\` by its size and sha256) and whether its source gives
> it as a name (\`tools/apply-name-rows-v1.mjs\`, from the lists kept in
> \`data/names/\`). The round's projection writes on each word the entry that
> stands at its place and whether the place is a name. The reader asks both
> of the place before it asks the pointing: a row of another entry than the
> word's is withheld, a row of the word's own entry stands whatever its
> points, and a row given as a name is withheld where the word is not one
> (\`tools/entry-gate-v1.mjs\`, \`tools/names-gate-v1.mjs\`; the line under
> each word follows by \`tools/place-leaders-v1.mjs\`).
> \`PIPELINE-MANIFEST.md\` is generated from the code and the
`],
]);
