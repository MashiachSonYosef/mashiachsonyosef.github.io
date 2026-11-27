// Reads the frozen route store (read only): every row as key, rank, m id, year, print-slot state, numbers, rests-shut entry, text (TSV).
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [reader, out] = process.argv.slice(2);
const { openRouteStore } = await import(join(reader, "tools/gloss-store-v1.mjs"));
const storeDir = join(reader, "data/route-store");
const store = openRouteStore(storeDir, { atRest: true, signLast: true });
const lines = [];
for (const f of readdirSync(join(storeDir, "shards")).sort()) {
  const body = JSON.parse(gunzipSync(readFileSync(join(storeDir, "shards", f))).toString("utf8"));
  for (const [k, list] of Object.entries(body)) for (const row of list) {
    const shut = store.restsOff(row);
    lines.push([k, row[0], row[3], row[4], Array.isArray(row[8]) ? (row[8].length ? "part" : "none") : (Array.isArray(row[7]) ? "cut" : ""), JSON.stringify((row[10] || {}).n || []), shut ? (shut.id || shut.say || "shut") : "", String(row[1]).replace(/[\t\n]/g, " ")].join("\t"));
  }
}
writeFileSync(out, lines.join("\n") + "\n");
console.log(lines.length);
