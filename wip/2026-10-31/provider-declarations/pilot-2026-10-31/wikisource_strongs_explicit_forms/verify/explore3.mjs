// exploration: list-region groups that read like notes; first words and phrases
import { readFileSync } from "node:fs";
import { makeLocator, analyzeDef, parenInfo } from "./lib.mjs";
const rows = readFileSync(process.argv[2], "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const loc = makeLocator(); const cache = new Map();
const fw = {}, ex = {};
for (const r of rows) {
  const L = loc(r);
  let A = cache.get(r.def); if (!A) { A = analyzeDef(r.def); cache.set(r.def, A); }
  const P = parenInfo(r.route);
  for (let i = 0; i < r.route.length; i++) {
    if (r.route[i] !== "(" || P.match[i] === -1) continue;
    if (A.region(L.p + i) !== "list") continue;
    const c = r.route.slice(i + 1, P.match[i]).trim();
    const re = /^(by|from|including|incl|plural|dual|marg|irreg|as if|i\.e|in the|only|probably|prob|properly|literally|fem|see|the|or|for|with|of|used|in|and|also|perhaps|apparently|a|an|written|read|second|first|for the|from the)\b/iu;
    const m = c.match(/^[A-Za-z.]+(\s+[A-Za-z.]+)?(\s+[A-Za-z.]+)?/u);
    if (!m) continue;
    const words = c.split(/\s+/u);
    if (words.length < 3 && !/\./u.test(c) && !/\d/u.test(c)) continue;
    if (c.includes(",") && !/\./u.test(c) && !/\d/.test(c)) continue;
    const k = m[0].toLowerCase();
    fw[k] = (fw[k] || 0) + 1; if (!ex[k]) ex[k] = `${r.key}: ${c.slice(0, 50)}`;
  }
}
for (const [k, v] of Object.entries(fw).sort((a, b) => b[1] - a[1])) if (/^(by|from|incl|plural|dual|marg|irreg|as |i\.|in the|only|prob|proper|fem|see|or |written|read|second|first|corresp|probably|perhaps|apparently|used|the |of )/u.test(k) || /\./.test(k)) console.log(v + "\t" + k + "\t" + ex[k]);
