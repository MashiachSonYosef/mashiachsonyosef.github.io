// Ship 11: the rows of a key in two trees' stores, with the name mark and the numbers each carries.
// node rows-of.mjs <reader dir old> <reader dir new> <key as \u escapes> [m id]
import { join } from "node:path";
import { pathToFileURL } from "node:url";
const [OLD, NEW, keyEsc, only] = process.argv.slice(2);
const key = JSON.parse(`"${keyEsc}"`);
const { openRouteStore, factsOf } = await import(pathToFileURL(join(NEW, "tools", "gloss-store-v1.mjs")).href);
const rowsOf = (dir) => { const st = openRouteStore(join(dir, "data", "route-store")); return st.routesWhole(key) || []; };
const show = (rows) => rows.filter((r) => !only || String(r[3]) === only).map((r) => JSON.stringify(r.map((x) => (typeof x === "string" ? x.slice(0, 70) : x))).slice(0, 330));
const a = show(rowsOf(OLD)), b = show(rowsOf(NEW));
for (let i = 0; i < Math.max(a.length, b.length); i += 1) if (a[i] !== b[i]) console.log(`was ${a[i] || ""}\nnow ${b[i] || ""}`);
console.log(`${a.length} rows shown, ${a.filter((x, i) => x !== b[i]).length} differ`);
