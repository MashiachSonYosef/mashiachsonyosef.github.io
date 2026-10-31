// diagnostics: contents of groups this classifier calls paren.qualifier, by frequency, filtered
import { readFileSync } from "node:fs";
import { analyzeRoute } from "./classify.mjs";
import { parenShape } from "./marks.mjs";
const [jsonl, re] = process.argv.slice(2);
const rx = new RegExp(re, "iu");
const f = new Map();
for (const line of readFileSync(jsonl, "utf8").split("\n")) {
  if (!line) continue; const r = JSON.parse(line); const R = analyzeRoute(r.route);
  for (const g of R.P.groups) if (g.kind === "(" && g.close >= 0) {
    const { shape } = parenShape(R, g); if (shape !== "paren.qualifier") continue;
    const c = R.content(g); if (!rx.test(c)) continue;
    const k = c.length > 50 ? c.slice(0, 50) + "…" : c; f.set(k, (f.get(k) || 0) + 1);
  }
}
const arr = [...f].sort((a, b) => b[1] - a[1]); let tot = 0; for (const [, v] of arr) tot += v;
console.log("total", tot, "distinct", arr.length); console.log(arr.slice(0, Number(process.env.TOP||70)).map(([k, v]) => `${v}\t${k}`).join("\n"));
