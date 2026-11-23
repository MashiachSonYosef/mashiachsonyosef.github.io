// read-only: the store's rows under some keys (keys given as code points on the command line)
import { openRouteStore } from "./tools/gloss-store-v1.mjs";
const st = openRouteStore("data/route-store");
for (const arg of process.argv.slice(2)) {
  const k = arg.split(",").map((h) => String.fromCodePoint(parseInt(h, 16))).join("");
  const rows = st.routesFor(k) || [];
  console.log("KEY", k, rows.length);
  for (const r of rows) console.log("  ", JSON.stringify(r.slice(0, 7)), JSON.stringify(r.slice(7)));
}
