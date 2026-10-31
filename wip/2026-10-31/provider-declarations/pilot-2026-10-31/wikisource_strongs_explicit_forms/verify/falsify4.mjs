// "( ) scope all four": count declaration cuts that fall inside a group the provider opened in the definition
// (definition depth >= 1) although the route's own depth there is 0, i.e. the store cut the group's '(' off.
import { readFileSync, writeFileSync } from "node:fs";
import { makeLocator, analyzeDef, parenInfo, isSpace } from "./lib.mjs";
const [, , SRC, OUT] = process.argv;
const rows = readFileSync(SRC, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const loc = makeLocator(); const cache = new Map();
const depthCache = new Map();
const defDepths = (def) => { let a = depthCache.get(def); if (a) return a; a = new Array(def.length); let d = 0; for (let k = 0; k < def.length; k++) { a[k] = d; if (def[k] === "(") d++; else if (def[k] === ")" && d > 0) d--; } depthCache.set(def, a); return a; };
const R = { cuts_inside_a_definition_group: 0, routes: new Set(), by_shape: {}, ex: [], cuts_before_a_stray_closer: 0 };
for (const r of rows) {
  const s = r.route, def = r.def; let A = cache.get(def); if (!A) { A = analyzeDef(def); cache.set(def, A); }
  const L = loc(r, A); const P = parenInfo(s); const reg = (i) => A.region(L.p + i); const DD = defDepths(def);
  const headish = (g) => g === "head" || g === "no_opener";
  const lastStray = Math.max(-1, ...[...P.stray]);
  for (let i = 0; i < s.length; i++) {
    const c = s[i], g = reg(i), d = P.depth[i], q = L.p + i;
    if (P.inUnclosed[i] || d !== 0) continue;
    let shape = null;
    if (c === ";") { let k = q + 1; while (k < def.length && isSpace(def[k])) k++; const before = A.op && k === A.op.start; if (g === "opener") shape = "semicolon.opener"; else if (headish(g) && !before) shape = "semicolon.head_separator"; else if (g === "list") shape = "semicolon.rendering_separator"; }
    else if (c === "." && g === "list_end") shape = "period.list_end";
    else if (c === "," && g === "list") shape = "comma.rendering_separator";
    else if (c === ":" && g === "opener") shape = "colon.opener";
    if (!shape) continue;
    if (DD[q] >= 1) { R.cuts_inside_a_definition_group++; R.routes.add(r); R.by_shape[shape] = (R.by_shape[shape] || 0) + 1; if (R.ex.length < 10) R.ex.push(`${r.key}: ${s.slice(Math.max(0, i - 25), i + 25)}`); }
    if (i < lastStray) R.cuts_before_a_stray_closer++;
  }
}
const out = { cuts_inside_a_definition_group: R.cuts_inside_a_definition_group, routes: R.routes.size, by_shape: R.by_shape, cuts_before_a_stray_closer: R.cuts_before_a_stray_closer, ex: R.ex };
writeFileSync(OUT, JSON.stringify(out, null, 1)); console.log(JSON.stringify(out, null, 1));
