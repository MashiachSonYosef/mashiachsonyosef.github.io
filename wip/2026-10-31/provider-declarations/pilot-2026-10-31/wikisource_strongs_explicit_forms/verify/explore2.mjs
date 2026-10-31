import { readFileSync } from "node:fs";
import { makeLocator, analyzeDef, parenInfo } from "./lib.mjs";
const rows = readFileSync(process.argv[2], "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const loc = makeLocator(); const cache = new Map();
const first2 = {}, cites = {}, spelled = {}; let notBounded = 0, multi = 0;
const defsSeen = new Set();
for (const r of rows) {
  const L = loc(r); if (!L.bounded) notBounded++; if (L.n > 1) multi++;
  let A = cache.get(r.def); if (!A) { A = analyzeDef(r.def); cache.set(r.def, A); }
  if (!defsSeen.has(r.def)) { defsSeen.add(r.def); const k = A.op ? A.op.spelled : "none"; spelled[k] = (spelled[k] || 0) + 1; }
  const P = parenInfo(r.route);
  for (let i = 0; i < r.route.length; i++) {
    if (r.route[i] !== "(" || P.match[i] === -1) continue;
    if (A.region(L.p + i) !== "list") continue;
    const c = r.route.slice(i + 1, P.match[i]).trim();
    if (/^\(?-/u.test(c) || /-$/u.test(c)) continue;
    const w = c.split(/\s+/u);
    if (w.length < 2 && !/\d/.test(c)) continue;
    const k = w.slice(0, 2).join(" ").toLowerCase();
    first2[k] = (first2[k] || 0) + 1;
    if (/\d+:\d+/.test(c)) cites[c.slice(0, 40)] = (cites[c.slice(0, 40)] || 0) + 1;
  }
}
console.log({ notBounded, multi, spelled });
console.log(Object.entries(first2).sort((a, b) => b[1] - a[1]).slice(0, 400).map(([k, v]) => `${v}\t${k}`).join("\n"));
console.log("CITES", Object.keys(cites).length);
