// diagnostics: mark census vs inventory; opener word frequencies at decision points
import { readFileSync, writeFileSync } from "node:fs";
import { parse, isMark, isLetter, isDigit, isUpper, isLower, words, isHebLetter } from "./lib.mjs";
const [jsonl, inv, out] = process.argv.slice(2);
const M = ["M13", "M25", "M11", "M69", "M50"];
const invj = JSON.parse(readFileSync(inv, "utf8"));
const invMarks = new Map();
for (const p of invj.providers) if (M.includes(p.provider)) for (const m of p.marks) { const e = invMarks.get(m.mark) || { occ: 0, routes: 0 }; e.occ += m.occurrences; e.routes += m.routes_carrying_it; invMarks.set(m.mark, e); }
const marks = new Map();
const freq = { semi_next: {}, period_before: {}, period_next: {}, comma_next: {}, comma_first: {}, seg_first_after_period: {}, route_first: {} };
const bump = (o, k) => { o[k] = (o[k] || 0) + 1; };
let routes = 0;
for (const line of readFileSync(jsonl, "utf8").split("\n")) {
  if (!line) continue; const r = JSON.parse(line); const s = r.route; routes++;
  const seen = new Set();
  for (const c of s) if (isMark(c)) { const e = marks.get(c) || { occ: 0, routes: 0 }; e.occ++; if (!seen.has(c)) { e.routes++; seen.add(c); } marks.set(c, e); }
  const P = parse(s);
  bump(freq.route_first, (words(s)[0] || "").toLowerCase());
  for (let i = 0; i < s.length; i++) {
    if (P.inScope(i)) continue;
    const c = s[i];
    if (c === ";") bump(freq.semi_next, words(s.slice(i + 1)).slice(0, 2).join(" ").toLowerCase());
    if (c === "." && s.slice(i + 1).trim() !== "") {
      const m = s.slice(0, i).match(/[\p{L}.]+$/u); bump(freq.period_before, (m ? m[0] : "") + " | next=" + JSON.stringify(s.slice(i + 1, i + 3)));
      if (s[i + 1] === " " && (isUpper(s[i + 2]) || isDigit(s[i+2]) || s[i+2]==="(" || /["“‘']/.test(s[i+2]))) bump(freq.seg_first_after_period, words(s.slice(i + 1)).slice(0, 2).join(" ").toLowerCase());
    }
    if (c === ",") { const nx = s.slice(i + 1).split(/[,;:]/)[0]; const w = words(nx); if (w.length >= 2) bump(freq.comma_next, w[0].toLowerCase()); }
  }
}
const top = (o, k = 150) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, k);
const cmp = [];
for (const [m, e] of marks) { const i = invMarks.get(m) || { occ: 0, routes: 0 }; if (i.occ !== e.occ || i.routes !== e.routes) cmp.push({ m, mine: e, inv: i }); }
for (const [m, i] of invMarks) if (!marks.has(m)) cmp.push({ m, mine: null, inv: i });
writeFileSync(out, JSON.stringify({ routes, marks_mine: marks.size, marks_inv: invMarks.size, mismatches: cmp, occ: Object.fromEntries([...marks].map(([m, e]) => [m, e.occ])), semi_next: top(freq.semi_next, 120), period_before: top(freq.period_before, 200), seg_first_after_period: top(freq.seg_first_after_period, 80), comma_next: top(freq.comma_next, 250), route_first: top(freq.route_first, 60) }, null, 0));
console.log(routes, marks.size, invMarks.size, JSON.stringify(cmp));
