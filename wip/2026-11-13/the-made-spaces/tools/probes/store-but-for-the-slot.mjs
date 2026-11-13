// Two copies of the route store, shard by shard: is the second the first with one slot added and nothing else moved?
// Every row of the second has its slot 9 taken off and the nulls that padded it trimmed (never below seven slots),
// and each shard's JSON is then compared with the first's, as text. Counted: shards, rows, rows that carried the
// slot, and shards that differ once it is off.
// node store-but-for-the-slot.mjs <reader dir before> <reader dir after>
// It measures; it changes nothing.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";
const [before, after] = process.argv.slice(2);
const dir = (r) => join(r, "data", "route-store", "shards");
const names = readdirSync(dir(after)).filter((f) => f.endsWith(".bin")).sort();
const was = readdirSync(dir(before)).filter((f) => f.endsWith(".bin")).sort();
let rows = 0, slotted = 0, differ = 0, sameBytes = 0;
const first = [];
for (const name of names) {
  const a = gunzipSync(readFileSync(join(dir(before), name))).toString("utf8");
  const bRaw = readFileSync(join(dir(after), name));
  if (readFileSync(join(dir(before), name)).equals(bRaw)) sameBytes += 1;
  const b = JSON.parse(gunzipSync(bRaw).toString("utf8"));
  for (const list of Object.values(b)) for (const row of list) {
    rows += 1;
    if (row.length > 9) { slotted += 1; row.length = 9; while (row.length > 7 && row[row.length - 1] === null) row.length -= 1; }
  }
  if (JSON.stringify(b) !== a) { differ += 1; if (first.length < 3) first.push(name); }
}
console.log(`${names.length} shards after, ${was.length} before${JSON.stringify(names) === JSON.stringify(was) ? ", the same names" : ", NOT the same names"} · ${rows.toLocaleString("en-US")} rows · ${slotted.toLocaleString("en-US")} carried the slot · ${sameBytes} shards are the same bytes as before · with the slot taken off, ${differ} shard(s) differ from before${differ ? ` (${first.join(", ")})` : ": the texts, the ranks, the years, the headwords, the cuts and the print texts are what they were"}`);
