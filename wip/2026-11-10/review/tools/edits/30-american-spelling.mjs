// The citations check was written again this round; its own prose takes the repository's spelling.
// (Identifiers and stamped names elsewhere are not touched: they are listed for the owner in the review.)
// node 30-american-spelling.mjs <reader dir>
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const f = join(process.argv[2], "tools", "check-citations-v1.mjs");
const s = readFileSync(f, "utf8");
// prose only: a word standing alone, never part of an identifier, a key or a file name
const out = s.replace(/(^|[^A-Za-z0-9_\-./"'`])licence(s?)(?![A-Za-z0-9_\-])/gmu, (m, pre, pl) => `${pre}license${pl}`);
const n = (s.match(/licence/gu) || []).length, left = (out.match(/licence/gu) || []).length;
writeFileSync(f, out);
console.log(`check-citations-v1.mjs: ${n - left} of ${n} respelled, ${left} left (identifiers)`);
