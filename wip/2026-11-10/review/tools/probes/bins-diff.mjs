// Every bin of two zone folders: the same bytes, or where the two differ (the paths, to a depth).
// Read-only. node bins-diff.mjs <zones a> <zones b> [depth=3]
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [A, B, DEPTH = "3"] = process.argv.slice(2);
const load = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const paths = new Map();
const walk = (a, b, path, depth, out) => {
  if (JSON.stringify(a) === JSON.stringify(b)) return;
  const obj = (x) => x && typeof x === "object" && !Array.isArray(x);
  if (depth > 0 && obj(a) && obj(b)) { for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) walk(a[k], b[k], `${path}.${k}`, depth - 1, out); return; }
  out.push(path);
};
let same = 0, differ = 0, only = 0;
const sample = new Map();
for (const f of readdirSync(A).filter((x) => x.endsWith(".bin")).sort()) {
  if (!existsSync(join(B, f))) { only += 1; continue; }
  const ba = readFileSync(join(A, f)), bb = readFileSync(join(B, f));
  if (ba.equals(bb)) { same += 1; continue; }
  differ += 1;
  const out = []; walk(load(join(A, f)), load(join(B, f)), "", Number(DEPTH), out);
  if (!out.length) out.push("(the same JSON, other bytes: compression or key order)");
  for (const p of out) { paths.set(p, (paths.get(p) || 0) + 1); if (!sample.has(p)) sample.set(p, f); }
}
console.log(`${same} bins the same bytes · ${differ} differ · ${only} only in the first`);
for (const [p, n] of [...paths].sort((x, y) => y[1] - x[1])) console.log(`  ${String(n).padStart(3)} bins differ at ${p}   (e.g. ${sample.get(p)})`);
