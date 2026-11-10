// The volume check held "every served book carries a sidecar". The V ledger covers the books of its own
// book table and no others; a served work it does not cover is named, not failed.
// node 13-v-volume.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const T = join(process.argv[2], "tools");
edit(join(T, "check-v-volume-projection-v1.mjs"), [
[`//   L1  every served book carries a volume sidecar, and no other book does`,
 `//   L1  every book the V ledger covers carries a volume sidecar, and no other
//       book does. WHICH BOOKS THOSE ARE is the ledger's own book table, one
//       row a book, and the receipt of the projection carries its row count.
//       A work this door serves that the ledger does not cover carries no
//       sidecar and is named here as outside the ledger. Until 10 November
//       2026 the law read "every served book", which was the same thing while
//       the door served only what V covers and stopped being so on 8 November,
//       when an edition work outside it was put on the shelf: the check went
//       red on a page that was telling the truth (it prints no count it does
//       not have).`],
[`const ZONES = process.env.ZONES_DIR || "data/zones";`,
 `const ZONES = process.env.ZONES_DIR || "data/zones";
const RECEIPT = process.env.V_VOLUME_RECEIPT || "data/v-volume-receipt-v1.json";`],
[`// L1 ------------------------------------------------------------------------
const servedSet = new Set(served);
const missing = served.filter((z) => !existsSync(join(ZONES, \`\${z}.volume.bin\`)));
const stray = withVolume.filter((z) => !servedSet.has(z));
check("L1  every served book carries a volume sidecar, and no unserved book does",
  missing.length === 0 && stray.length === 0,
  missing.length || stray.length ? \`\${missing.length} served without · \${stray.length} unserved with — \${few([...missing, ...stray])}\`
    : \`\${withVolume.length} of \${served.length}\`);`,
 `// L1 ------------------------------------------------------------------------
// the ledger's coverage, off the receipt of the projection: the projector
// writes one sidecar a row of the ledger's book table and refuses a row this
// door does not serve, so "as many sidecars as rows, every one of them a served
// book" is "every book the ledger covers carries one"
const receipt = existsSync(RECEIPT) ? JSON.parse(readFileSync(RECEIPT, "utf8")) : null;
const bookTable = receipt ? (((receipt.source || {}).tables || []).find((t) => /book-volume/.test(t.file)) || null) : null;
const covered = bookTable ? bookTable.rows : null;
const servedSet = new Set(served);
const outside = served.filter((z) => !existsSync(join(ZONES, \`\${z}.volume.bin\`)));
const stray = withVolume.filter((z) => !servedSet.has(z));
check("L1  every book the V ledger covers carries a volume sidecar, and no other book does",
  covered !== null && stray.length === 0 && withVolume.length === covered && receipt.sidecars === covered,
  covered === null ? \`no receipt of the projection at \${RECEIPT}, so the ledger's coverage cannot be read\`
    : stray.length ? \`\${stray.length} sidecar(s) for a book this door does not serve — \${few(stray)}\`
    : \`\${withVolume.length} sidecar(s) · the ledger's book table has \${covered} row(s) · the receipt says \${receipt.sidecars}\${outside.length ? \` · outside the ledger, and carrying none: \${few(outside, 6)}\` : ""}\`);`],
[`check("L5  the 39 books carry the whole ledger, counted once",`,
 `check(\`L5  the \${withVolume.length} books carry the whole ledger, counted once\`,`],
[`console.log(\`\\n  \${withCount} book(s) carry commentary and \${withVolume.length - withCount} carry none · \${versesCarried.toLocaleString()} verses of \${served.length} books\`);`,
 `console.log(\`\\n  \${withCount} book(s) carry commentary and \${withVolume.length - withCount} carry none · \${versesCarried.toLocaleString()} verses of \${withVolume.length} books\${outside.length ? \` · \${outside.length} served work(s) outside the ledger\` : ""}\`);`],
]);
