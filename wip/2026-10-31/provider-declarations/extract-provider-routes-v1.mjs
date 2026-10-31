// extract-provider-routes-v1 · usage: node extract-provider-routes-v1.mjs <route-store dir> <out dir>
// Writes one <source_key>.jsonl per dictionary ({key, route, def, m, year, cut} per line) and sources-ranked.json beside the out dir.
// split the served route store's text by provider source key, one JSONL per key
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [store, out] = process.argv.slice(2);
const ix = JSON.parse(readFileSync(join(store, "index.json"), "utf8"));
const keyOf = (m) => (ix.m_sources[m] || {}).key || `UNKNOWN_${m}`;
const by = new Map();
for (const f of readdirSync(join(store, "shards")).filter((x) => x.endsWith(".bin")).sort()) {
  const d = JSON.parse(gunzipSync(readFileSync(join(store, "shards", f))).toString("utf8"));
  for (const [key, rows] of Object.entries(d)) for (const r of rows) {
    const k = keyOf(r[3]);
    if (!by.has(k)) by.set(k, []);
    by.get(k).push(JSON.stringify({ key, route: r[1], def: r[2], m: r[3], year: r[4], cut: r[5] ?? null }));
  }
}
const summary = [];
for (const [k, lines] of by) { writeFileSync(join(out, `${k}.jsonl`), lines.join("\n") + "\n"); summary.push({ source_key: k, routes: lines.length, m_ids: [...new Set(lines.map((l) => JSON.parse(l).m))] }); }
summary.sort((a, b) => b.routes - a.routes);
const total = summary.reduce((t, s) => t + s.routes, 0);
let cum = 0; for (const s of summary) { cum += s.routes; s.cum_share = +(cum / total).toFixed(4); s.label = (ix.m_sources[s.m_ids[0]] || {}).label || ""; s.licensePosture = (ix.m_sources[s.m_ids[0]] || {}).licensePosture || ""; }
writeFileSync(join(out, "..", "sources-ranked.json"), JSON.stringify({ total_routes: total, source_keys: summary.length, sources: summary }, null, 1));
console.log(`${summary.length} source keys · ${total} routes`);
