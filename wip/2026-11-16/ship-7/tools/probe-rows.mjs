import { join } from "node:path";
const [RD, KEY, SURF] = process.argv.slice(2);
const { openRouteStore } = await import(join(RD, "tools/gloss-store-v1.mjs"));
const g = await import(join(RD, "tools/pointing-grade-v1.mjs"));
const rest = openRouteStore(join(RD, "data/route-store"), { atRest: true });
const MS = rest.index.m_sources;
const key = KEY.normalize("NFC");
for (const r of rest.routesFor(key) || []) {
  const f = Array.isArray(r) && r.length > 10 ? r[10] : null;
  console.log(r[3], (MS[r[3]] || {}).key, JSON.stringify(r[1]).slice(0, 50), "hw", JSON.stringify(r[6]), "grade", g.gradeRow(r, SURF), "n", JSON.stringify(f && f.n));
}
