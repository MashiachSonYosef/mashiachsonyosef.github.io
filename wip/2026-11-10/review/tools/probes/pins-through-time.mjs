// For the pins the tree does not hold today: at which archived commit of the record does each pin first
// read as it reads today, and how many read as the backup's manifest reads. Read-only.
// node pins-through-time.mjs <reader dir> <manifest.json> <record-at-commit.json ...oldest first>
import { readFileSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";
const [R, MAN, ...RECS] = process.argv.slice(2);
const now = JSON.parse(readFileSync(join(R, "data", "zone-store-v1.json"), "utf8")).pins;
const here = new Set(readdirSync(join(R, "data", "zones")).filter((f) => f.endsWith(".bin")));
const absent = Object.keys(now).filter((f) => !here.has(f));
const man = JSON.parse(readFileSync(MAN, "utf8")).pins;
const same = (a, b) => a && b && a.sha256 === b.sha256 && a.bytes === b.bytes;
console.log(`absent today: ${absent.length} · of them as the backup's manifest pins them: ${absent.filter((f) => same(now[f], man[f])).length}`);
let prev = man, prevName = "backup manifest";
for (const p of RECS) {
  const rec = JSON.parse(readFileSync(p, "utf8")).pins;
  const asNow = absent.filter((f) => same(rec[f], now[f])).length;
  const moved = absent.filter((f) => !same(rec[f], prev[f])).length;
  const missing = absent.filter((f) => !rec[f]).length;
  console.log(`${basename(p, ".json")}: pins ${Object.keys(rec).length} · of the absent, as today ${asNow} · moved since ${prevName} ${moved} · not pinned there ${missing}`);
  prev = rec; prevName = basename(p, ".json");
}
