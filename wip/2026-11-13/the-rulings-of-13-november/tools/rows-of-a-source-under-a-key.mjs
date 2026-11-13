// The store's rows of one source under one key, slot by slot, with the openings list's verdict beside each where a
// list is given: is the row an opening of a numbered sense, and of which entry and point.
// node rows-of-a-source-under-a-key.mjs <reader dir> <m id> <key as \uXXXX escapes or letters> [<the openings list>]
import { readFileSync } from "node:fs";
import { join } from "node:path";
const [R, M, KEY_IN, LIST] = process.argv.slice(2);
const { openRouteStore } = await import(join(R, "tools", "gloss-store-v1.mjs"));
const key = JSON.parse(`"${KEY_IN}"`);
const store = openRouteStore(join(R, "data", "route-store"));
const openings = new Map();
if (LIST) for (const line of readFileSync(LIST, "utf8").split("\n")) { if (!line) continue; const l = JSON.parse(line); openings.set(`${l.key}\u0001${l.rank}\u0001${l.route}`, l); }
const rows = (store.routesFor(key) || []).filter((r) => String(r[3]) === M);
console.log(`${key} · ${rows.length} rows of ${M}`);
for (const r of rows) {
  const o = openings.get(`${key}\u0001${r[0]}\u0001${r[1]}`);
  console.log(`  rank ${r[0]} · route «${String(r[1]).slice(0, 90)}»${o ? ` · OPENING of ${o.entries.join(", ")}` : ""}`);
  console.log(`      definition «${String(r[2]).slice(0, 300)}»`);
  const rest = r.slice(4).map((x, i) => `${i + 4}:${JSON.stringify(x)}`).join(" ");
  console.log(`      ${rest.slice(0, 260)}`);
}
