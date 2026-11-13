// The documents made true for the made spaces (made-spaces-rule-v1): the round's header names the new tool among
// the ones that change the store and that it does not run; the pipeline's first note says what the rows now carry;
// and the check of the provider's characters says what a closed space is to its claim.
// node 45-the-documents-name-the-made-spaces.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "tools", "round-v1.sh"), [
  [`# WHAT IT DOES NOT RUN: the tools that change the store itself (the ledgers'
# divisions, the sources' years, a strike, a landing). Each of those writes a`,
   `# WHAT IT DOES NOT RUN: the tools that change the store itself (the ledgers'
# divisions, the sources' years, the made spaces' closes, a strike, a
# landing). Each of those writes a`],
]);

edit(join(R, "PIPELINE.md"), [
  [`> tree. \`PIPELINE-MANIFEST.md\` is generated from the code and the`,
   `> tree. Since the same day a row of the store carries, where the corpus
> lane's list names one, the places of a space our own build made in its
> text (\`tools/apply-made-spaces-v1.mjs\`, \`data/made-spaces-v1/\`), and every
> reader closes them where the text prints; the store's texts are the served
> bytes, unchanged. \`PIPELINE-MANIFEST.md\` is generated from the code and the`],
]);

edit(join(R, "tools", "check-provider-characters-v1.mjs"), [
  [`// pieces of a route rejoin into the route they came from.
//`,
   `// pieces of a route rejoin into the route they came from.
//
// One kind of character in a served text is not the provider's: a space our
// own build put where a tag of the provider's XML stood. The corpus lane
// lists those, and a reading prints with them closed (made-spaces-rule-v1;
// check-made-spaces-v1 holds that to the lists). The readings asked of the
// store below are the readings as they print, so a closed space is counted
// here as what it is: the provider's characters, with ours taken out.
//`],
]);
