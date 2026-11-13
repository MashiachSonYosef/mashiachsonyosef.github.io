// The page withholds, under "only", a reading whose stems are known and share no family with the word's. It asked
// that of the store's rows alone, because until the stems extension (relay v173) no row beside the store had a
// known stem. Jastrow's rows stand beside the store and the extension names their stems, so the same question is
// now put to the rows beside the store, after their own pointing is asked as it always was, and what it withholds is
// counted with the store's on the card's one line («9 of another stem than qal, withheld»). A row beside the store
// is a row like the store's (overlay-rule-v2); this makes that true for the stem as well.
// node 71-a-row-beside-the-store-is-asked-its-stem.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "zone.html"), [
  [`    let withheldByStem = 0, stemsHere = null;
`,
   `    // THE ROWS BESIDE THE STORE ARE ASKED THE SAME (stems-extension-rule-v1,
    // 13 November 2026): the corpus lane's extension names the stems of the
    // UBS dictionary's and the SDBH's rows, which are the store's, and of
    // Jastrow's, which stand beside it. The sidecar keeps every row's stems
    // under one id, so the question below is kept (ofAnotherStem) and put
    // again to the rows beside the store where they enter the pool.
    let withheldByStem = 0, stemsHere = null, ofAnotherStem = null;
`],
  [`        const other = (row) => { const x = rs[\`\${row[3]}\\u0001\${row[0]}\\u0001\${row[1]}\`]; return Array.isArray(x) && x.length > 0 && !x.some((y) => fams.has(stemFamily(y))); };
        const kept = routes.filter((row) => !other(row));
`,
   `        ofAnotherStem = (row) => { const x = rs[\`\${row[3]}\\u0001\${row[0]}\\u0001\${row[1]}\`]; return Array.isArray(x) && x.length > 0 && !x.some((y) => fams.has(stemFamily(y))); };
        const kept = routes.filter((row) => !ofAnotherStem(row));
`],
  [`      const kept = pointingOnly ? extra.filter((row) => gradeRow(row, W.pointed) !== "x") : extra;
      withheld += extra.length - kept.length;
      extra = kept;
    }
`,
   `      const kept = pointingOnly ? extra.filter((row) => gradeRow(row, W.pointed) !== "x") : extra;
      withheld += extra.length - kept.length;
      extra = kept;
      // and their stem, where the word's is known and a source names theirs
      if (ofAnotherStem) {
        const ofThisStem = extra.filter((row) => !ofAnotherStem(row));
        withheldByStem += extra.length - ofThisStem.length;
        extra = ofThisStem;
      }
    }
`],
]);
