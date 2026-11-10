// The index, in a cases file, of the pointed surfaces whose consonants are the ones given (as \uXXXX escapes or letters).
// node case-index.mjs <cases.json> <consonants>
import { readFileSync } from "node:fs";
const [path, want] = process.argv.slice(2);
const bare = (s) => String(s).normalize("NFD").replace(/[֑-ׇ]/gu, "");
const target = bare(JSON.parse(`"${want}"`));
JSON.parse(readFileSync(path, "utf8")).forEach((c, i) => { const s = typeof c === "string" ? c : c.s; if (bare(s) === target) console.log(i, JSON.stringify(c)); });
