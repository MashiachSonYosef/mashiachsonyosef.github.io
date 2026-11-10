// The pointed surfaces of one book whose baked leader differs between two builds, as a cases file for line-vs-first-pill.mjs.
// node cases-from-diff.mjs <dir before> <dir after> <book> <leader: m|x|c|l|la|s> <reading|credit|any> <out.json>
import { readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [a, b, book, leader, kind, outPath] = process.argv.slice(2);
const read = (d) => JSON.parse(gunzipSync(readFileSync(join(d, `${book}.lattice.bin`))).toString("utf8")).grades;
const A = read(a), B = read(b);
const out = [];
for (const s of Object.keys(B)) {
  const p = ((A[s] || {}).o || {})[leader] ?? null, q = ((B[s] || {}).o || {})[leader] ?? null;
  if (JSON.stringify(p) === JSON.stringify(q)) continue;
  const reading = !p || !q || p[0] !== q[0];
  if (kind === "any" || (kind === "reading" && reading) || (kind === "credit" && !reading)) out.push(s);
}
// [--max N]: N of them, spread across the book
const mi = process.argv.indexOf("--max"), MAX = mi >= 0 ? Number(process.argv[mi + 1]) : out.length;
const step = Math.max(1, Math.floor(out.length / Math.max(1, MAX)));
const picked = out.filter((_, i) => i % step === 0).slice(0, MAX);
writeFileSync(outPath, JSON.stringify(picked));
console.log(`${book} o.${leader} (${kind}): ${out.length} surfaces${picked.length < out.length ? `, ${picked.length} taken` : ""} -> ${outPath}`);
