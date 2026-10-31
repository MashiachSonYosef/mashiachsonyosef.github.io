#!/usr/bin/env node
// Independent cross-checks of census.mjs's headline numbers, written separately
// (different code path) so a bug in one does not silently confirm itself.
//   node checks/independent-checks.mjs
import { readFileSync } from "node:fs";
const F = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/punct/by-source/wikisource_strongs_explicit_forms.jsonl";
const rows = readFileSync(F, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const out = {};
out.routes = rows.length;
// 1. route equals a depth-0 comma item of the text after the last non-citation colon (dashes stripped)
const itemsAfterColon = (D) => {
  let last = -1; for (let i = 0; i < D.length; i++) if (D[i] === ":" && !/\d/.test(D[i + 1] || "") && !/\d/.test(D[i - 1] || "")) last = i;
  if (last < 0) return null;
  let t = D.slice(last + 1).replace(/^\s*-*\s*/, "");
  // cut at the first depth-0 full stop that is not part of '...'
  let d = 0, end = t.length;
  for (let i = 0; i < t.length; i++) { const c = t[i]; if (c === "(") d++; else if (c === ")") { if (d) d--; } else if (c === "." && d === 0 && t[i - 1] !== "." && t[i + 1] !== "." && !/i\.e$|i$/.test(t.slice(Math.max(0, i - 3), i))) { end = i; break; } }
  t = t.slice(0, end);
  const items = []; let s = 0; d = 0;
  for (let i = 0; i < t.length; i++) { const c = t[i]; if (c === "(") d++; else if (c === ")") { if (d) d--; } else if (c === "," && d === 0) { items.push(t.slice(s, i).trim()); s = i + 1; } }
  items.push(t.slice(s).trim());
  return new Set(items);
};
const cache = new Map();
let listItem = 0, listItemDashLed = 0;
for (const r of rows) {
  if (!cache.has(r.def)) cache.set(r.def, itemsAfterColon(r.def));
  const S = cache.get(r.def); if (!S) continue;
  if (S.has(r.route)) listItem++;
  else if (/^-{1,2}/.test(r.route) && S.has(r.route.replace(/^-{1,2}\s*/, ""))) listItemDashLed++;
}
out.route_is_one_item_after_the_last_colon = listItem;
out.route_is_one_item_after_the_last_colon_with_opener_dashes = listItemDashLed;
// 2. paren group contents in routes, with depth-0 commas absent, ranked
const groups = new Map();
for (const r of rows) {
  const R = r.route; const st = [];
  for (let i = 0; i < R.length; i++) {
    if (R[i] === "(") st.push(i);
    else if (R[i] === ")" && st.length) { const j = st.pop(); const inner = R.slice(j + 1, i); groups.set(inner, (groups.get(inner) || 0) + 1); }
  }
}
const ASIDEISH = /margin|mistake|confusion|plural|dual|singular|fem|masc|aramaic|chald|literally|figurative|used |only|compare|i\.e|see |includ|article|unrepresented|ps\.|psa|marg|by |from |as if|often|participle|for /i;
out.group_contents_asideish_top = [...groups].filter(([k]) => ASIDEISH.test(k)).sort((a, b) => b[1] - a[1]).slice(0, 60).map(([k, v]) => `${k.slice(0, 50)} x${v}`);
// 3. standalone X and plus tallies
let X = 0, Xr = 0, P = 0, Pr = 0;
for (const r of rows) { const m = r.route.match(/(?<!\p{L})X(?!\p{L})/gu); if (m) { X += m.length; Xr++; } const p = r.route.match(/\+/g); if (p) { P += p.length; Pr++; } }
Object.assign(out, { X_tokens: X, X_routes: Xr, plus: P, plus_routes: Pr });
console.log(JSON.stringify(out, null, 1));
// 4. the gap between this simple test and census.mjs's list_item, bucketed
{
  const buckets = {}; const ex = {};
  for (const r of rows) {
    const S = cache.get(r.def);
    if (S && (S.has(r.route) || (/^-{1,2}/.test(r.route) && S.has(r.route.replace(/^-{1,2}\s*/, ""))))) continue;
    const D = r.def;
    let why;
    if (!/:/.test(D)) why = /--/.test(D) ? "no colon; '--' opener" : /;\s*-/.test(D) ? "no colon; '; -' opener" : "no colon, no dash opener";
    else if (/\d:\d|\d: \d/.test(D) && D.slice(D.lastIndexOf(":") - 1, D.lastIndexOf(":") + 2).match(/\d/)) why = "last colon is a citation";
    else {
      const tail = D.slice(D.lastIndexOf(":") + 1);
      if (/\.\,/.test(tail) || /i\.e\./.test(tail)) why = "'.,' or 'i.e.' inside the list";
      else if (/\b[A-Z][a-z]{0,4}\.\s/.test(tail)) why = "abbreviation stop inside the list";
      else why = "other";
    }
    buckets[why] = (buckets[why] || 0) + 1;
    if (!ex[why]) ex[why] = [];
    if (ex[why].length < 4) { const i = D.indexOf(r.route); ex[why].push(`${r.key}: ${r.route.slice(0, 40)} @${i}/${D.length}`); }
  }
  console.log(JSON.stringify({ not_matched_by_simple_test: buckets, examples: ex }, null, 1));
}
