// series_item members with features that might separate readings of the test
import { load, classifyAll, context, win } from "./lib.mjs";
const opts = { amend: true, closedRestTo: "clause" };
const feats = {};
for (const r of load()) {
  const s = r.route; const ctx = context(s);
  for (const x of classifyAll(s, opts)) {
    if (x.mark !== "," || x.hits[0] !== "comma.series_item") continue;
    const i = x.i; const nc = s.indexOf(",", i + 1);
    const f = [];
    if (ctx.depth[nc] > 0) f.push("next_comma_in_parens");
    if (/[:=]/.test(s.slice(i + 1, nc))) f.push("colon_or_equals_between");
    if (/[()]/.test(s.slice(i + 1, nc))) f.push("paren_between");
    if (ctx.inQuote[i] || ctx.inItal[i]) f.push("quote");
    if (/\b(and|or)\b/i.test(s.slice(i + 1, nc))) f.push("conj_between");
    if (s.slice(i + 1, nc).trim() === "") f.push("empty_between");
    if (/^\s*(etc|e\.g|i\.e)/.test(s.slice(i + 1))) f.push("etc_after");
    for (const k of f) { (feats[k] ||= []).push(`${r.key}: ${win(s, i, 30)}`); }
  }
}
for (const [k, v] of Object.entries(feats)) console.log(k, v.length, JSON.stringify(v.slice(0, 8)));
