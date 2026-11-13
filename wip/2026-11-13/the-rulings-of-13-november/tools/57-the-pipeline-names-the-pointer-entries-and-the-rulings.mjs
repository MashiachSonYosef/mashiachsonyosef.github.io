// PIPELINE.md names what this change brings into the tree: the corpus lane's map of pointer readings, the owner's
// rulings as the lane pinned them, and the two small modules that read a pinned file.
// node 57-the-pipeline-names-the-pointer-entries-and-the-rulings.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "PIPELINE.md"), [
  [`> reader closes them where the text prints; the store's texts are the served
> bytes, unchanged. \`PIPELINE-MANIFEST.md\` is generated from the code and the
`,
   `> reader closes them where the text prints; the store's texts are the served
> bytes, unchanged. The map of readings that point at another entry is baked
> from the corpus lane's own file, kept here byte for byte
> (\`tools/bake-form-of-pills-v1.mjs\`, \`data/pointer-entries/\`), under the
> owner's rulings as the lane pinned them (\`data/rulings/\`, read through
> \`tools/rulings-v1.mjs\`); a file another lane wrote is read only as the
> bytes its pin names (\`tools/pinned-v1.mjs\`). \`PIPELINE-MANIFEST.md\` is
> generated from the code and the
`],
]);
