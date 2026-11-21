// The span store's places of one book, each with whether a row of it stands at rest (the page's own __spanLine),
// and what joins its words: a maqaf chain, a spaced run, or both. Reads the served file through the page; writes nothing.
// node spans2.mjs <book> [extra query]
import { open, noHe } from "./lib.mjs";
const [BOOK, EXTRA = ""] = process.argv.slice(2);
const { b, p } = await open(`b=${BOOK}${EXTRA}`);
const r = await p.evaluate(async (book) => {
  const j = await fetch(`data/span-store/${book}.json`).then((x) => x.json());
  return (j.placesList || []).map((pl) => { const l = window.__spanLine(pl.key); return { ref: pl.ref, first: pl.first, last: pl.last, key: pl.key, contains: pl.contains || [], rows: l.rows.length, line: l.line }; });
}, BOOK);
const kind = (k) => (/־/u.test(k) && / /u.test(k) ? "mixed" : /־/u.test(k) ? "chain" : "spaced");
const standing = r.filter((x) => x.line);
console.log(`${BOOK}: ${r.length} places; a row stands at ${standing.length}: chain ${standing.filter((x) => kind(x.key) === "chain").length}, spaced ${standing.filter((x) => kind(x.key) === "spaced").length}, mixed ${standing.filter((x) => kind(x.key) === "mixed").length}`);
for (const x of standing) console.log(`${x.ref} words ${x.first}-${x.last} ${kind(x.key)} key=${noHe(x.key)} rows=${x.rows}${x.contains.length ? ` contains ${noHe(JSON.stringify(x.contains))}` : ""}`);
console.log("-- places with an inner place (any state):");
for (const x of r.filter((y) => y.contains.length)) console.log(`${x.ref} words ${x.first}-${x.last} ${kind(x.key)} key=${noHe(x.key)} line=${x.line ? "stands" : "rests"} contains ${noHe(JSON.stringify(x.contains))}`);
await b.close();
