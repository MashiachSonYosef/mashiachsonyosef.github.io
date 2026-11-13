// check-stems-extension-v1's B4 holds the sidecar to every extension line at the keys a card asks its rows'
// stems under (stems-carried-rule-v1), no longer at every key of every word.
// node 85-the-extensions-check-asks-the-keys-a-card-asks.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "tools", "check-stems-extension-v1.mjs"), [
  [`//       no line gives, and at every word of the book whose key holds a line
//       with stems the sidecar holds that row
`,
   `//       no line gives, and at every word of the book asked its rows' stems
//       under a key that holds a line with stems (stems-carried-rule-v1: the
//       word's or a half's pointed surface has a known stem in the book) the
//       sidecar holds that row
`],
  [`import { openBesideTheStore, rowsBeside, besideAtAWord } from "./rows-beside-the-store-v1.mjs";
`,
   `import { openBesideTheStore, rowsBeside, besideAtAWord } from "./rows-beside-the-store-v1.mjs";
import { keysAskedAtWord } from "./stems-carried-v1.mjs";
`],
  [`      // every key the word is asked under: its own, and each half's where it is written one way and read another
      for (const k of new Set([w.k, ...(w.w || []).map((h) => h && h.k)].filter(Boolean))) {
        if (!ext || !lineOf.has(k)) continue;
`,
   `      // every key the word is asked its rows' stems under: its own, and each half's where it is written one way and
      // read another, where that form's pointed surface has a known stem in the book (stems-carried-rule-v1)
      const askedHere = keysAskedAtWord(w, side.grades || {});
      for (const k of new Set([w.k, ...(w.w || []).map((h) => h && h.k)].filter(Boolean))) {
        if (!ext || !lineOf.has(k) || !askedHere.has(k)) continue;
`],
  [`, and holds for each row of the extension's sources exactly the stems its line gives, at every word whose key holds such a line" : ""}\``,
   `, and holds for each row of the extension's sources exactly the stems its line gives, at every word asked its rows' stems under a key that holds such a line" : ""}\``],
  [`words stand on a key that holds a line\``,
   `words are asked their rows' stems under a key that holds a line\``],
]);
