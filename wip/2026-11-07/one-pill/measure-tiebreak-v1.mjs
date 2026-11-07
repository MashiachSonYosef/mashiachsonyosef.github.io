// the tie-break under the printed-form key: (a) rule 3 as declared, the best rank any witness gives the reading; (b) the rank of the reading's oldest witness; each against the old pool's lead, over the served zones' keys
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { openRouteStore as openOld } from "<scratchpad>/old/reader/tools/gloss-store-v1.mjs";
import { openRouteStore as openNew, readingKey, ERA_CUT_AD } from "<scratchpad>/pt/reader/tools/gloss-store-v1.mjs";
const S = "<scratchpad>";
const STORE = `${S}/pt/reader/data/route-store`; const A = openOld(STORE), B = openNew(STORE);
const ZD = `${S}/pt/reader/data/zones`;
const tier = (y) => (Number.isFinite(y) && y <= ERA_CUT_AD ? 0 : 1);
const cmp = (a, b) => tier(a.year) - tier(b.year) || a.year - b.year || a.ledger - b.ledger || a.at - b.at;
// (b): group by readingKey; year = min; rank = the best rank among the witnesses that give the oldest year (an undated witness ranks only an undated group)
const poolB = (routes) => {
  const groups = new Map(); let at = 0;
  for (const row of routes) {
    const [rank, , , mId, year] = row; if (!B.index.m_sources[mId]) continue;
    const y = Number.parseInt(year, 10); const yr = Number.isInteger(y) ? y : Infinity;
    for (const reading of B.readingsOf(row)) {
      const k = readingKey(reading); const g = groups.get(k);
      if (!g) groups.set(k, { text: reading, year: yr, ledger: Number(rank), at: at += 1 });
      else if (yr < g.year) { g.year = yr; g.ledger = Number(rank); }
      else if (yr === g.year) g.ledger = Math.min(g.ledger, Number(rank));
    }
  }
  return [...groups.values()].sort(cmp);
};
const C = {}; const inc = (k, n = 1) => { C[k] = (C[k] || 0) + n; }; const ex = { a: [], b: [] }; const seen = new Set(); const perZone = {};
for (const f of readdirSync(ZD).filter((x) => x.endsWith(".bin") && !x.includes(".lattice")).sort()) {
  const z = JSON.parse(gunzipSync(readFileSync(`${ZD}/${f}`)).toString("utf8"));
  const keys = new Set(); for (const sec of z.sections || []) for (const w of sec.words || []) if (!w.mark && w.k) keys.add(w.k);
  if (!keys.size && z.gloss) for (const k of Object.keys(z.gloss)) keys.add(k);
  const pz = { keys: 0, a_moves: 0, b_moves: 0 };
  for (const k of keys) {
    const routes = B.routesFor(k); if (!routes) continue; pz.keys += 1;
    const first = !seen.has(k); seen.add(k);
    const old = A.readingPool(routes, "oldest")[0], a = B.readingPool(routes, "oldest")[0], b = poolB(routes)[0];
    if (!old) continue;
    const ka = a ? readingKey(a.text) : null, kb = b ? readingKey(b.text) : null, ko = readingKey(old.text);
    if (ka !== ko) { pz.a_moves += 1; if (first) { inc("a_keys_moved"); if (ex.a.length < 30) ex.a.push({ zone: f, key: k, from: old.text, to: a.text }); } }
    if (kb !== ko) { pz.b_moves += 1; if (first) { inc("b_keys_moved"); if (ex.b.length < 30) ex.b.push({ zone: f, key: k, from: old.text, to: b.text }); } }
    if (first) inc("keys");
  }
  perZone[f] = pz; inc("zone_keys", pz.keys); inc("a_zone_key_moves", pz.a_moves); inc("b_zone_key_moves", pz.b_moves);
}
writeFileSync(`${S}/v16/group/tiebreak-v1.json`, JSON.stringify({ totals: C, examples: ex, per_zone: perZone }, null, 1));
console.log(JSON.stringify(C, null, 1));
