// Opener attempts 4-5 and the stated-exception counts (syllable-led routes, citation-colon cuts).
import { readFileSync, writeFileSync } from "node:fs";
import { makeLocator, analyzeDef, isSpace, isDigit } from "./lib.mjs";
const [, , SRC, OUT] = process.argv;
const rows = readFileSync(SRC, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const loc = makeLocator(); const cache = new Map();
const perDef = new Map();
const out = { syllable_led: { hyphen_led_not_in_opener: 0, paren_hyphen_led: 0, ex: [] }, after_citation_colon: { routes: 0, ex: [] }, opener_attempt4_dashdash_kind_with_a_later_dashdash: [], opener_attempt5_definitions_whose_routes_lie_mostly_in_the_head: [] };
for (const r of rows) {
  const def = r.def, s = r.route;
  let A = cache.get(def); if (!A) { A = analyzeDef(def); cache.set(def, A); }
  const L = loc(r, A);
  const reg0 = A.region(L.p);
  // syllable-led: first character of the route is '-' outside the opener, or the route opens '(-'
  if (s[0] === "-" && reg0 !== "opener") { out.syllable_led.hyphen_led_not_in_opener++; if (out.syllable_led.ex.length < 6) out.syllable_led.ex.push(`${r.key}: ${s.slice(0, 20)} [${reg0}]`); }
  else if (/^\(\s*-/u.test(s)) out.syllable_led.paren_hyphen_led++;
  // route that begins right after a chapter:verse colon
  let k = L.p - 1; while (k >= 0 && isSpace(def[k])) k--;
  if (k >= 1 && def[k] === ":" && isDigit(def[k - 1]) && isDigit(def[L.p] === " " ? def[L.p + 1] : def[L.p])) { out.after_citation_colon.routes++; if (out.after_citation_colon.ex.length < 8) out.after_citation_colon.ex.push(`${r.key}: ${s.slice(0, 20)}`); }
  if (!perDef.has(def)) perDef.set(def, { key: r.key, head: 0, list: 0, A });
  const pd = perDef.get(def); const regEnd = A.region(L.p + s.length - 1);
  if (reg0 === "head" && regEnd === "head") pd.head++; else pd.list++;
}
for (const [def, pd] of perDef) {
  const A = pd.A;
  if (A.op && A.op.kind === "--" && def.indexOf("--", A.op.end) !== -1) out.opener_attempt4_dashdash_kind_with_a_later_dashdash.push(`${pd.key}: ${def.slice(Math.max(0, A.op.start - 25), A.op.end + 20)}`);
  if (A.op && pd.head > pd.list) out.opener_attempt5_definitions_whose_routes_lie_mostly_in_the_head.push(`${pd.key}: head ${pd.head} / rest ${pd.list}: ${def.slice(Math.max(0, A.op.start - 30), A.op.end + 20)}`);
}
writeFileSync(OUT, JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
