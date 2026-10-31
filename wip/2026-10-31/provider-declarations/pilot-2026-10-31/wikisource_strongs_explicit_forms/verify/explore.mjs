// exploration: locate routes in their definitions; count ambiguity; opener kinds
import { readFileSync } from "node:fs";
const F = process.argv[2];
const rows = readFileSync(F, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const occ = (hay, needle) => { const o = []; let i = hay.indexOf(needle); while (i !== -1) { o.push(i); i = hay.indexOf(needle, i + 1); } return o; };
let multi = 0, none = 0, whole = 0, ordered = 0, total = rows.length;
const defs = new Set(), keys = new Set();
let prevDef = null, prevKey = null, cursor = 0;
for (const r of rows) {
  defs.add(r.def); keys.add(r.key);
  if (r.def !== prevDef || r.key !== prevKey) { cursor = 0; prevDef = r.def; prevKey = r.key; }
  const o = occ(r.def, r.route);
  if (o.length === 0) none++;
  if (o.length > 1) multi++;
  if (r.route === r.def) whole++;
  const fwd = o.find((p) => p >= cursor);
  if (fwd !== undefined) { ordered++; cursor = fwd + r.route.length; }
}
console.log({ total, defs: defs.size, keys: keys.size, none, multi, whole, ordered });
const cuts = {}; rows.forEach((r) => { cuts[String(r.cut)] = (cuts[String(r.cut)] || 0) + 1; });
console.log("cut", cuts);
