// Print the route store index's small fields (not m_sources), each cut short: to see what describes a row's slots.
// node index-look.mjs <reader dir>
import { readFileSync } from "node:fs";
import { join } from "node:path";
const ix = JSON.parse(readFileSync(join(process.argv[2], "data", "route-store", "index.json"), "utf8"));
for (const [k, v] of Object.entries(ix)) {
  if (k === "m_sources") { console.log(`m_sources: ${Object.keys(v).length} sources`); continue; }
  console.log(`${k}: ${JSON.stringify(v).slice(0, 700)}`);
  console.log();
}
