// Two store-side changes of 13 November 2026, on the owner's rulings and the corpus lane's relays.
//
// 1. The UBS dictionary's «literally: ...; hence: ...» pairs are one reading again. The owner answered the ledger's
//    branch B01 "divides" on 6 November; a reader saw the halves as broken, the corpus lane put the call again, and
//    the owner ruled «1-5. agree go ahead» on 13 November (relay v176, ruling 3: B01 is "whole"). The answer is
//    replaced in the answers file with its ruling and what it replaces; tools/apply-ledger-divisions-v1.mjs reads it.
//
// 2. The made-spaces lists stand under data/made-spaces/, one folder per relay as the corpus lane keeps them
//    (made-spaces-v1 of relay v168, made-spaces-v2 of relay v178), with one pin over both. The documents and the
//    reader's comment that named the old folder name the new one.
// node 49-the-ubs-pairs-whole-and-the-made-spaces-folder.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "data", "ledger-branch-answers-v1.json"), [
  [`  "ubs_sdbh_hebrew_v0_9_2": {
   "B01": {
    "option": "divides",
    "by": "the owner",
    "on": "2026-11-06",
    "rows": 3288
   },
`,
   `  "ubs_sdbh_hebrew_v0_9_2": {
   "B01": {
    "option": "whole",
    "by": "the owner",
    "on": "2026-11-13",
    "rows": 3288,
    "ruling": "the owner, 13 November 2026: \\"1-5. agree go ahead\\", to the corpus lane's five calls on relays v172 to v175 as it put them; call 3: \\"The UBS «literally: …; hence: …» pairs. You ruled on 6 November to split them. The reader saw the halves as broken. My view: keep each pair whole.\\" The page keeps the wording and what it means together in one reading, as the source writes it",
    "note": "replaces the answer of 2026-11-06 (divides), under which the word-for-word wording and what it means stood as two readings; the corpus lane pins the ruling to this ledger, branch and option in rulings-2026-11-13-v1.json (ruling 3; sha256 89bdf2a250397b77c8b16c737093f191d8546effdfe765f8e31d68e03f71794e)",
    "relay": "v176"
   },
`],
]);

edit(join(R, "tools", "gloss-store-v1.mjs"), [
  [`// Israelite prophet». The corpus lane traced every such space and listed the
// places that close (relay v168; data/made-spaces-v1/), and
// tools/apply-made-spaces-v1.mjs writes them on the row, in slot 9: [the
`,
   `// Israelite prophet». The corpus lane traces every such space, source by
// source, and lists the places that close (data/made-spaces/, one folder per
// relay: v168, v178), and
// tools/apply-made-spaces-v1.mjs writes them on the row, in slot 9: [the
`],
]);

edit(join(R, "PIPELINE.md"), [
  [`> text (\`tools/apply-made-spaces-v1.mjs\`, \`data/made-spaces-v1/\`), and every
`,
   `> text (\`tools/apply-made-spaces-v1.mjs\`, \`data/made-spaces/\` with one folder
> per relay of the corpus lane's), and every
`],
]);
