// Where two gzipped JSON files differ, by path. Arrays and objects are walked; a long list of differing paths is summed by its leading path.
// node json-diff.mjs <a.bin> <b.bin> [--depth N] [--show N]
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
const [a, b] = process.argv.slice(2);
const flag = (f, d) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d; };
const DEPTH = Number(flag("--depth", "3")), SHOW = Number(flag("--show", "12"));
const read = (p) => { const buf = readFileSync(p); return JSON.parse((buf[0] === 0x1f && buf[1] === 0x8b ? gunzipSync(buf) : buf).toString("utf8")); };
const A = read(a), B = read(b);
const diffs = [];
const walk = (x, y, path) => {
  if (x === y) return;
  const tx = x === null ? "null" : Array.isArray(x) ? "array" : typeof x, ty = y === null ? "null" : Array.isArray(y) ? "array" : typeof y;
  if (tx !== ty || (tx !== "object" && tx !== "array")) { diffs.push({ path, x, y }); return; }
  const keys = tx === "array" ? Array.from({ length: Math.max(x.length, y.length) }, (_, i) => i) : [...new Set([...Object.keys(x), ...Object.keys(y)])];
  for (const k of keys) walk(x[k], y[k], [...path, k]);
};
walk(A, B, []);
const by = new Map();
for (const d of diffs) { const lead = d.path.slice(0, DEPTH).join("."); if (!by.has(lead)) by.set(lead, []); by.get(lead).push(d); }
console.log(`${diffs.length} values differ, under ${by.size} paths (to depth ${DEPTH})`);
const short = (v) => { const s = JSON.stringify(v); return s === undefined ? "(absent)" : s.length > 110 ? s.slice(0, 110) + "…" : s; };
for (const [lead, ds] of [...by].sort((p, q) => q[1].length - p[1].length).slice(0, 60)) {
  console.log(`  ${lead}: ${ds.length}`);
  for (const d of ds.slice(0, ds.length <= SHOW ? SHOW : 2)) console.log(`      ${d.path.slice(DEPTH).join(".") || "(itself)"}: ${short(d.x)} -> ${short(d.y)}`);
}
