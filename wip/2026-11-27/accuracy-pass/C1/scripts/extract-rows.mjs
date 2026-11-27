// Reads the frozen route store (read only) and writes every row of M3, M4, M19 as JSONL.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [storeDir, outDir] = process.argv.slice(2);
const want = new Set(["M3", "M4", "M19"]);
const out = { M3: [], M4: [], M19: [] };
const lens = {};
let keys = 0, rows = 0;
for (const f of readdirSync(join(storeDir, "shards")).sort()) {
  const body = JSON.parse(gunzipSync(readFileSync(join(storeDir, "shards", f))).toString("utf8"));
  for (const [k, list] of Object.entries(body)) {
    keys += 1;
    list.forEach((row, at) => {
      rows += 1;
      if (!want.has(row[3])) return;
      lens[row[3] + ":" + row.length] = (lens[row[3] + ":" + row.length] || 0) + 1;
      out[row[3]].push(JSON.stringify({ k, at, n: list.length, row }));
    });
  }
}
for (const m of want) writeFileSync(join(outDir, `rows-${m}.jsonl`), out[m].join("\n") + "\n");
console.log(JSON.stringify({ keys, rows, M3: out.M3.length, M4: out.M4.length, M19: out.M19.length, lens }, null, 1));
