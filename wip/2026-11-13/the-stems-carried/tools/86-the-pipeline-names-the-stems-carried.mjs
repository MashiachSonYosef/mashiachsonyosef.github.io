// PIPELINE.md's first block says which keys a book's sidecar carries the rows' stems for (stems-carried-rule-v1).
// node 86-the-pipeline-names-the-stems-carried.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "PIPELINE.md"), [
  [`> store as of the store's own (\`tools/rows-beside-the-store-v1.mjs\` is how a
> check counts those rows). A row's facts also say`,
   `> store as of the store's own (\`tools/rows-beside-the-store-v1.mjs\` is how a
> check counts those rows). A book's sidecar carries the rows' stems only
> under the keys a card of that book, or a leader baked for it, can ask
> them under (\`tools/stems-carried-v1.mjs\`). A row's facts also say`],
]);
