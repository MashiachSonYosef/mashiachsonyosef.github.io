// Dumps every served row of the four sources from the frozen route store (read only).
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const base = process.argv[2], out = process.argv[3];
const { openRouteStore, factsOf, routePrinted, recordPrinted, senseOpened, providerNoteOf } = await import(join(base, "tools/gloss-store-v1.mjs"));
const storeDir = join(base, "data/route-store");
const store = openRouteStore(storeDir);
const want = new Set(["M5", "M9", "M14", "M46"]);
const lines = { M5: [], M9: [], M14: [], M46: [] };
const counts = {};
for (const f of readdirSync(join(storeDir, "shards")).sort()) {
  const shard = JSON.parse(gunzipSync(readFileSync(join(storeDir, "shards", f))).toString("utf8"));
  for (const [k, rows] of Object.entries(shard)) {
    rows.forEach((row, at) => {
      const m = String(row[3]);
      if (!want.has(m)) return;
      counts[m] = (counts[m] || 0) + 1;
      lines[m].push(JSON.stringify({ k, at, rank: row[0], route: row[1], def: row[2], m, year: row[4], cut: row[5] ?? null, heads: row[6] ?? null, cuts: row[7] ?? null, prints: row[8] ?? null, closes: row[9] ?? null, facts: factsOf(row), readings: store.readingsOf(row), routePrinted: routePrinted(row), recordPrinted: recordPrinted(row), opened: senseOpened(row), note: providerNoteOf(row), len: row.length }));
    });
  }
}
for (const m of Object.keys(lines)) writeFileSync(join(out, `rows-${m}.jsonl`), lines[m].join("\n") + "\n");
console.log(JSON.stringify(counts), store.index.store_version);
