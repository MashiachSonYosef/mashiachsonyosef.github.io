// Which definition of "a space before a stop" gives which count, for one source's route texts (row[1]) and definition
// texts (row[2]) in the served route store. Written to reconcile two figures of mine for M9 (4,845 and 4,640).
// node space-before-which-stops.mjs <reader dir> <source id>
import { readFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [reader, id] = process.argv.slice(2);
const dir = join(reader, "data/route-store/shards");
const DEFS = {
  "a space before a comma": / ,/u,
  "before , . ; : ! ?": / [,.;:!?]/u,
  "before , . ; : ! ? or a closing bracket": / [,.;:!?)\]]/u,
  "before , . ; :": / [,.;:]/u,
  "any white space before , . ; : ! ?": /\s[,.;:!?]/u,
  "before , . ; : ! ? or after an opening bracket": / [,.;:!?]|[(\[] /u,
  "a space at the end of the text": / $/u,
  "two spaces together": / {2}/u,
};
const n = { rows: 0 }, per = Object.fromEntries(Object.keys(DEFS).map((k) => [k, { text: 0, def: 0 }]));
const stops = new Map();
for (const f of readdirSync(dir).filter((x) => /^[0-9a-f]{2}\.bin$/u.test(x)).sort()) {
  const shard = JSON.parse(gunzipSync(readFileSync(join(dir, f))).toString("utf8"));
  for (const rows of Object.values(shard)) for (const row of rows) {
    if (row[3] !== id) continue;
    n.rows += 1;
    const text = String(row[1] == null ? "" : row[1]), def = String(row[2] == null ? "" : row[2]);
    for (const [k, re] of Object.entries(DEFS)) { if (re.test(text)) per[k].text += 1; if (re.test(def)) per[k].def += 1; }
    for (const m of text.matchAll(/ ([^\p{L}\p{N}\s])/gu)) stops.set(m[1], (stops.get(m[1]) || 0) + 1);
  }
}
console.log(`${id} · ${n.rows.toLocaleString("en-US")} rows`);
for (const [k, v] of Object.entries(per)) console.log(`  ${k.padEnd(52)} route texts ${String(v.text.toLocaleString("en-US")).padStart(7)} · definition texts ${String(v.def.toLocaleString("en-US")).padStart(7)}`);
console.log(`  every sign a route text holds straight after a space, by times: ${[...stops].sort((a, b) => b[1] - a[1]).map(([c, k]) => `${JSON.stringify(c)} ${k.toLocaleString("en-US")}`).join(" · ")}`);
