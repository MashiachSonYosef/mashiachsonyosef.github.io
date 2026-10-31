import { loadRows } from "./common.mjs";
import { analyze } from "./classify.mjs";
const rows = loadRows(); const cache = new Map(); const firstWords = {}; const odd = [];
for (const r of rows) {
  let a = cache.get(r.def); if (!a) { a = analyze(r.def); cache.set(r.def, a); }
  if (a.field !== "list") continue; const s = r.def;
  for (let i = 0; i < s.length; i++) {
    if (s[i] !== "(" || a.p.unclosed.has(i)) continue;
    const sh = a.shape.get(i); const content = s.slice(i + 1, a.p.partner[i]);
    if (sh === "paren.list_optional_words" || sh === "paren.list_alternatives") {
      const fw = content.trim().split(/\s+/).slice(0, 2).join(" "); firstWords[fw] = (firstWords[fw] || 0) + 1;
      if (/^[\s(\[]*-|-[\s)\]]*$/u.test(content)) odd.push(sh + " | " + r.key + " | " + content.slice(0, 50));
    }
  }
}
console.log(Object.entries(firstWords).filter(([k, v]) => /^(by|from|in|incl|the|which|but|see|or|as|marg|mistake|corr|for|i\.e|prop|so|this|perhaps|probab|some|a |an |of)/i.test(k) || v >= 15).sort((a, b) => b[1] - a[1]).slice(0, 90).map(([k, v]) => `${k}=${v}`).join(" | "));
console.log(odd.join("\n"));
