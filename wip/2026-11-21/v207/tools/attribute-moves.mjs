// for each moved line of the trial (lines-diff.json), which returning source's row carries the new reading under the
// key, and at what rank against the old reading's best rank. Reads; writes nothing.
// Usage: attribute-moves.mjs <reader before> <reader after> <lines-diff.json>
import { readFileSync } from "node:fs";
import { join } from "node:path";
const [A, B, DIFF] = process.argv.slice(2);
const G = await import(join(B, "tools", "gloss-store-v1.mjs"));
const a = G.openRouteStore(join(A, "data", "route-store")), b = G.openRouteStore(join(B, "data", "route-store"));
const back = new Set(b.index.language_admission.readmitted_m_ids);
const re = JSON.parse(readFileSync(join(B, "data", "readmission-v1.json"), "utf8"));
const workOf = new Map(re.sources.map((s) => [s.m, s.work]));
const d = JSON.parse(readFileSync(DIFF, "utf8")).moved;
const groups = new Map();
for (const m of d) { const id = `${m.k}\u0001${m.was ? m.was[0] : ""}\u0001${m.now ? m.now[0] : ""}`; const g = groups.get(id) || { k: m.k, was: m.was, now: m.now, n: 0 }; g.n += 1; groups.set(id, g); }
const norm = (t) => G.printedForm ? G.printedForm(String(t)).toLowerCase() : String(t).toLowerCase();
const byCause = {}; const rowsOut = [];
for (const g of [...groups.values()].sort((x, y) => y.n - x.n)) {
  const rb = b.routesWhole(g.k) || [];
  const want = g.now ? norm(g.now[0]) : null;
  // the returning rows under the key whose words print as the new line, or hold it as a part
  const carriers = rb.filter((r) => back.has(String(r[3])) && want && (norm(r[1]) === want || norm(r[1]).split(/[,;] */u).includes(want)));
  const works = [...new Set(carriers.map((r) => workOf.get(String(r[3]))))];
  const all = [...new Set(rb.filter((r) => back.has(String(r[3]))).map((r) => workOf.get(String(r[3]))))];
  const cause = works.length ? works.sort().join("+") : `none carries it (returning under the key: ${all.sort().join("+") || "none"})`;
  byCause[cause] = byCause[cause] || { groups: 0, places: 0 }; byCause[cause].groups += 1; byCause[cause].places += g.n;
  rowsOut.push(`${String(g.n).padStart(4)} ${g.k} | ${g.was ? `«${g.was[0]}» [${g.was[1]}]` : "bare"} -> ${g.now ? `«${g.now[0]}» [${g.now[1]}]` : "bare"} | ${cause}${carriers.length ? ` at rank ${Math.min(...carriers.map((r) => r[0]))}` : ""}`);
}
console.log(JSON.stringify(byCause, null, 1));
console.log(rowsOut.join("\n"));
