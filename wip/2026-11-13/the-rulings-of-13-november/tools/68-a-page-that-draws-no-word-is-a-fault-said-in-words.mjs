// tools/gated-card-v1.mjs says of itself "a fault is said in words". Broken on purpose three ways (a word's tag, a
// name place dropped, a name place added, each written into a zone's own bytes), the two checks that share it went
// red at the law that reads the zone and then ended on an uncaught timeout: the page does not draw a book whose
// zone it cannot take, and the reader of a card waited a minute for a word and threw. The verdict was red either
// way, but a check that ends in a stack trace has not said what it found. The wait now gives its answer back, and a
// page that draws no word is a fault in words like any other, which every law that presses a card already prints.
// node 68-a-page-that-draws-no-word-is-a-fault-said-in-words.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "tools", "gated-card-v1.mjs"), [
  [`    await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
`,
   `    // a page that draws no word of the book within a minute is a fault said in words, not a throw: a law that
    // presses a card prints it and the check goes on to its other laws
    const drew = await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 }).then(() => true, () => false);
    if (!drew) return { fault: \`the page drew no word of \${pick.zone} within a minute\${errors.length ? \` (it threw: \${errors[0]})\` : ""}\` };
`],
]);
