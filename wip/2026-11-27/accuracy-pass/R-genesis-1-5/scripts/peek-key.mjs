// Read-only: the route store's rows under a Hebrew key, optionally of one source id: rank, route text, record text (cut), source, facts.
// Usage: node peek-key.mjs <reader dir> <key> [M-id] [text filter]
import { join } from "node:path";
const [R, KEY, MID = "", FILTER = ""] = process.argv.slice(2);
const { openRouteStore, factsOf } = await import(join(R, "tools", "gloss-store-v1.mjs"));
const store = openRouteStore(join(R, "data", "route-store"));
const rows = store.routesFor(KEY) || [];
console.log("rows under key", KEY, rows.length);
for (const r of rows) {
  if (MID && String(r[3]) !== MID) continue;
  if (FILTER && !String(r[1]).includes(FILTER) && !String(r[2] || "").includes(FILTER)) continue;
  console.log(JSON.stringify({ rank: r[0], route: String(r[1]).slice(0, 300), record: String(r[2] || "").slice(0, 400), m: r[3], heads: r[6], facts: factsOf(r) }));
}
