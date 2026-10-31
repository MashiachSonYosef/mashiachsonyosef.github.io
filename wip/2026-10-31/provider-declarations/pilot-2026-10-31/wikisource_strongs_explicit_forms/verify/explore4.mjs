// exploration: every list-region group content (matched), exact text frequency for those starting with selected words or holding digits
import { readFileSync } from "node:fs";
import { makeLocator, analyzeDef, parenInfo } from "./lib.mjs";
const rows = readFileSync(process.argv[2], "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const loc = makeLocator(); const cache = new Map();
const f = {};
for (const r of rows) {
  const L = loc(r);
  let A = cache.get(r.def); if (!A) { A = analyzeDef(r.def); cache.set(r.def, A); }
  const P = parenInfo(r.route);
  for (let i = 0; i < r.route.length; i++) {
    if (r.route[i] !== "(" || P.match[i] === -1) continue;
    if (A.region(L.p + i) !== "list") continue;
    const c = r.route.slice(i + 1, P.match[i]).trim();
    if (/^(plural|dual|marg|irreg|from|incl|pl\b|fem|intens|sing|by|perhaps|as if|as in|as one|as such|in the plural|only|prob|i\.e|e\.g|see|corresp|or |\.\.\.)/iu.test(c) || /\d/.test(c) || /\./u.test(c)) {
      const k = c.slice(0, 45); f[k] = (f[k] || 0) + 1;
    }
  }
}
for (const [k, v] of Object.entries(f).sort((a, b) => b[1] - a[1])) console.log(v + "\t" + k);
