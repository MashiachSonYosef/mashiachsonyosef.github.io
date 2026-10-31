// Diagnostic only: list-region groups classified (A) by the stated tests with the verifier's aside reading,
// (B) with the aside phrases the summary names and nothing more ("narrow"), (C) with prefix before alternatives and '-)' endings,
// to explain where the draft's '(' counts come from. The verifier's own counts are in verify.mjs.
import { readFileSync } from "node:fs";
import { makeLocator, analyzeDef, parenInfo } from "./lib.mjs";
const rows = readFileSync(process.argv[2], "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const loc = makeLocator(); const cache = new Map();
const NARROW = /^(by mistake for|by confusion with|from the margin|from margin|from the marg|including the art|includ\.|by including the article|plural$|dual$)/u;
const WIDE = /^(by mistake for|by confusion with|from the margin|from margin|from the marg\.|including the art|includ\. the article|by including the article|plural$|dual$|by a false|perhaps by clerical error|by exchange for|by union with|by correction for|by reading|as in the margin|as if from|as such unrepresented|as one or two words)/u;
const CODE = /^(by (mistake|confusion|exchange|correction|union|reading|including|a false)|perhaps by|from the marg|as in the margin|in the margin|margin|includ|with the article|often used as|as such unrepresented|as one or two words|as if from|figuratively|literally|aramaic|chald|dual|plural|compare|see )/i;
const CITE = /\d\s*:\s*\d/u;
const cls = (c, asideRe, opts) => {
  const t = c.trim();
  if (asideRe.test(t) || CITE.test(c)) return "list_aside";
  if (/^\(?\s*-/u.test(t)) return "suffix";
  let own = false, d = 0; for (const ch of c) { if (ch === "(") d++; else if (ch === ")") d--; else if (ch === "," && d === 0) own = true; }
  const pre = opts.preEnd.test(c);
  if (opts.prefixFirst && pre) return "prefix";
  if (own) return "alternatives";
  if (pre) return "prefix";
  if (opts.optionalNeedsLetter && !/\p{L}/u.test(c)) return "UNEXPLAINED";
  if (c.includes(",") && opts.optionalNeedsNoComma) return "UNEXPLAINED";
  return "optional";
};
const V = {
  A_stated_wide: [WIDE, { preEnd: /-\s*$/u, prefixFirst: false, optionalNeedsLetter: true, optionalNeedsNoComma: true }],
  B_stated_narrow: [NARROW, { preEnd: /-\s*$/u, prefixFirst: false, optionalNeedsLetter: true, optionalNeedsNoComma: true }],
  C_narrow_prefixFirst_dashParen: [NARROW, { preEnd: /-\)?$/u, prefixFirst: true, optionalNeedsLetter: false, optionalNeedsNoComma: false }],
  D_codeRegex_prefixFirst_dashParen: [CODE, { preEnd: /-\)?$/u, prefixFirst: true, optionalNeedsLetter: false, optionalNeedsNoComma: false }],
};
const T = {}; for (const k of Object.keys(V)) T[k] = {};
const samples = {};
for (const r of rows) {
  let A = cache.get(r.def); if (!A) { A = analyzeDef(r.def); cache.set(r.def, A); }
  const L = loc(r, A);
  const P = parenInfo(r.route);
  for (let i = 0; i < r.route.length; i++) {
    if (r.route[i] !== "(" || P.match[i] === -1) continue;
    if (A.region(L.p + i) !== "list") continue;
    const c = r.route.slice(i + 1, P.match[i]);
    const got = {};
    for (const [k, [re, o]] of Object.entries(V)) { const s = cls(c, re, o); got[k] = s; T[k][s] = (T[k][s] || 0) + 1; }
    const pair = `${got.A_stated_wide}->${got.D_codeRegex_prefixFirst_dashParen}`;
    if (got.A_stated_wide !== got.D_codeRegex_prefixFirst_dashParen) { if (!samples[pair]) samples[pair] = { n: 0, ex: [] }; samples[pair].n++; if (samples[pair].ex.length < 6) samples[pair].ex.push(`${r.key}: (${c.slice(0, 50)})`); }
  }
}
console.log(JSON.stringify({ T, moves_A_to_D: samples }, null, 1));
