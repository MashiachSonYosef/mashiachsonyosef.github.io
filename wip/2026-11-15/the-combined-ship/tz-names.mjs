// The Tikkunei Zohar's lines the store round moved: is the new line's reading carried only by rows their own source
// marks a name (facts.name), where the old line's was not? node tz-names.mjs <compare-v2.json> <live reader> <ship reader>
import { readFileSync } from "node:fs";
import { join } from "node:path";
const [CMP, LIVE_RD, RD] = process.argv.slice(2);
const cmp = JSON.parse(readFileSync(CMP, "utf8"));
const { openRouteStore, readingKey, factsOf } = await import(join(RD, "tools/gloss-store-v1.mjs"));
const ship = openRouteStore(join(RD, "data/route-store"));
const { openRouteStore: openLive } = await import(join(LIVE_RD, "tools/gloss-store-v1.mjs"));
const live = openLive(join(LIVE_RD, "data/route-store"));
const rk = (t) => readingKey(String(t || "")).replace(/\s+/gu, " ").trim();
const carriers = (st, k, t) => (((st.routesWhole ? st.routesWhole(k) : st.routesFor(k)) || []).filter((r) => rk(r[1]) === t || st.readingsOf(r).some((x) => rk(x) === t)));
const isName = (r) => { const f = factsOf(r); return !!(f && f.name); };
const tally = {}, ex = {};
for (const r of cmp.list.filter((x) => x.cls === "store-v188" && x.at.startsWith("tikkunei-zohar"))) {
  const k = r.keys[0];
  const nowC = r.now ? carriers(ship, k, rk(r.now[0])) : [], wasC = r.was ? carriers(live, k, rk(r.was[0])) : [];
  const nowName = nowC.length > 0 && nowC.every(isName), wasName = wasC.length > 0 && wasC.every(isName);
  const c = !r.was ? "a line where none stood" : nowName && !wasName ? "NAME NOW LEADS where a non-name led" : !nowName && wasName ? "a non-name now leads where a name led" : nowName && wasName ? "name to name" : "non-name to non-name";
  tally[c] = (tally[c] || 0) + 1;
  const pair = `${r.was ? r.was[0] : "-"} -> ${r.now ? r.now[0] : "-"}`;
  (ex[c] = ex[c] || {})[pair] = (ex[c][pair] || 0) + 1;
}
console.log(JSON.stringify(tally));
for (const [c, m] of Object.entries(ex)) console.log(c, "::", Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 14).map(([p, n]) => `${n} ${p}`).join(" | "));
