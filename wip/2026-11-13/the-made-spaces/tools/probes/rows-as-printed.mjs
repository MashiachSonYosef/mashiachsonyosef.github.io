// The rows of the store that carry the closes slot, as served and as printed, for a text looked for in their
// route or definition: the served route, its closes and cuts, the readings the store reader gives, and the record
// as printed. For reading a few rows by eye.
// node rows-as-printed.mjs <reader dir> <a piece of text to look for> [how many]
// It measures; it changes nothing.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";
import { pathToFileURL } from "node:url";
const [reader, needle, many = "6"] = process.argv.slice(2);
const { openRouteStore, routePrinted, recordPrinted } = await import(pathToFileURL(join(reader, "tools", "gloss-store-v1.mjs")).href);
const store = openRouteStore(join(reader, "data", "route-store"));
let shown = 0;
for (const f of readdirSync(join(reader, "data", "route-store", "shards")).filter((x) => x.endsWith(".bin")).sort()) {
  const body = JSON.parse(gunzipSync(readFileSync(join(reader, "data", "route-store", "shards", f))).toString("utf8"));
  for (const [k, rows] of Object.entries(body)) for (const row of rows) {
    if (row.length <= 9 || !(String(row[1]).includes(needle) || String(row[2]).includes(needle))) continue;
    console.log(`${f} key of ${[...k].length} letters · ${row[3]} rank ${row[0]} · year ${row[4]} · piece ${row[5]}`);
    console.log(`   served route   «${row[1]}»`);
    console.log(`   closes ${JSON.stringify(row[9][0])} · cuts ${JSON.stringify(row[7] ?? null)} · print slot ${JSON.stringify(row[8] ?? null)}`);
    console.log(`   route printed  «${routePrinted(row)}»`);
    console.log(`   readings       ${JSON.stringify(store.readingsOf(row))}`);
    if (row[2] && row[2] !== row[1]) { console.log(`   served record  «${String(row[2]).slice(0, 200)}»`); console.log(`   record printed «${recordPrinted(row).slice(0, 200)}» (closes ${JSON.stringify(row[9][1]).slice(0, 80)})`); }
    else console.log(`   the record is the route${row[9][1] ? `, closes ${JSON.stringify(row[9][1])}` : ""}`);
    shown += 1;
    if (shown >= Number(many)) process.exit(0);
  }
}
if (!shown) console.log("no row with the slot holds that text");
