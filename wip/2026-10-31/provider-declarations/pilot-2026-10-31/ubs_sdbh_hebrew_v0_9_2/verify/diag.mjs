// node diag.mjs '<mark>' '<shape-prefix-regex>' [limit] [opts-json] : lists occurrences of a mark whose first hit matches
import { load, classifyAll, win } from "./lib.mjs";
const [mark, re, lim = "60", o = "{}"] = process.argv.slice(2);
const rx = new RegExp(re); let n = 0; const opts = JSON.parse(o);
for (const r of load()) for (const x of classifyAll(r.route, opts)) {
  if (x.mark !== mark) continue;
  const h = x.hits.join("&") || "NONE";
  if (rx.test(h)) { n += 1; if (n <= +lim) console.log(`${h} | ${r.key}: ${win(r.route, x.i, 40)}`); }
}
console.log("total", n);
