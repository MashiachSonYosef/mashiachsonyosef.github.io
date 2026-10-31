// exploration: tokens before '.' that are not ellipsis and not the list end; and region tallies for no-opener defs
import { readFileSync } from "node:fs";
import { makeLocator, analyzeDef, parenInfo, isLetter } from "./lib.mjs";
const rows = readFileSync(process.argv[2], "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const loc = makeLocator(); const cache = new Map();
const tok = {}; const regs = {};
for (const r of rows) {
  const L = loc(r);
  let A = cache.get(r.def); if (!A) { A = analyzeDef(r.def); cache.set(r.def, A); }
  const s = r.route;
  for (let i = 0; i < s.length; i++) {
    if (s[i] !== ".") continue;
    const q = L.p + i, d = r.def;
    let a = q, b = q; while (d[a - 1] === ".") a--; while (d[b + 1] === ".") b++;
    if (b - a + 1 >= 2) { const k = `run${b - a + 1}`; regs[k] = (regs[k] || 0) + 1; continue; }
    const reg = A.region(q);
    if (reg === "list_end") { regs.list_end = (regs.list_end || 0) + 1; continue; }
    let k = q - 1; while (k >= 0 && (isLetter(d[k]) || d[k] === ".")) k--;
    const t = d.slice(k + 1, q + 1);
    const key = `${reg}\t${t}\t${d[q + 1] === undefined ? "END" : JSON.stringify(d[q + 1])}`;
    tok[key] = (tok[key] || 0) + 1;
  }
}
console.log(regs);
for (const [k, v] of Object.entries(tok).sort((a, b) => b[1] - a[1])) console.log(v + "\t" + k);
