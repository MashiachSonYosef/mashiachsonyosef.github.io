// Ship 11: every row of a key in one tree's store.  node rows-all.mjs <reader dir> <key as \u escapes>
import { join } from "node:path";
import { pathToFileURL } from "node:url";
const [DIR, keyEsc] = process.argv.slice(2);
const key = JSON.parse(`"${keyEsc}"`);
const { openRouteStore } = await import(pathToFileURL(join(DIR, "tools", "gloss-store-v1.mjs")).href);
const st = openRouteStore(join(DIR, "data", "route-store"));
for (const r of st.routesWhole(key) || []) console.log(JSON.stringify(r.map((x) => (typeof x === "string" ? x.slice(0, 70) : x))).slice(0, 300));
