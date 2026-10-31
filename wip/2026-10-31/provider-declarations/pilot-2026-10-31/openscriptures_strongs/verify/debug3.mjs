// Tabulate overlapping tests for tagged definition commas (route occurrences).
import { loadRows } from "./common.mjs";
import { analyze } from "./classify.mjs";
const rows = loadRows(); const cache = new Map(); const combos = {}; const ex = {};
for (const r of rows) {
  let a = cache.get(r.def); if (!a) { a = analyze(r.def); cache.set(r.def, a); }
  if (a.field !== "def") continue;
  const off = r.route === r.def ? 0 : r.def.indexOf(r.route);
  for (let k = 0; k < r.route.length; k++) {
    const f = a.flags.get(off + k); if (!f) continue;
    const key = Object.keys(f).filter((x) => f[x]).join("+");
    combos[key] = (combos[key] || 0) + 1;
    (ex[key] ??= []).length < 3 && ex[key].push(r.key + ": " + r.def.slice(Math.max(0, off + k - 25), off + k + 20));
  }
}
console.log(combos); for (const [k, v] of Object.entries(ex)) if (k.includes("+")) console.log(k, v);
