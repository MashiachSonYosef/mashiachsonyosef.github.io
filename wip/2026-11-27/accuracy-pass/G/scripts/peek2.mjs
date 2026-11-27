// Read-only look at a resting-lines record and a zone's words that are not plain.
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const S = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad";
const R = join(S, "base/reader");
const book = process.argv[2] || "obadiah";
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const rl = gz(join(R, "data/resting-lines", `${book}.json.gz`));
console.log("counts", JSON.stringify(rl.counts));
console.log("sources", JSON.stringify(rl.sources).slice(0, 1200));
console.log("unnamed", JSON.stringify(rl.unnamed || null).slice(0, 300));
console.log("sec0", JSON.stringify(rl.sections[0]).slice(0, 1500));
console.log("sec1", JSON.stringify(rl.sections[1]).slice(0, 1500));
const zone = gz(join(R, "data/zones", `${book}.bin`));
let shown = 0;
for (const sec of zone.sections) for (const [e, w] of sec.words.entries()) {
  if (w.mark) { if (shown < 3) { console.log("MARK", sec.label, e, JSON.stringify(w)); shown += 1; } continue; }
  if ((Array.isArray(w.pg) && w.pg.length > 1 && shown < 8) || Array.isArray(w.w)) { console.log(sec.label, e, JSON.stringify(w).slice(0, 700)); shown += 1; }
}
const keys = new Set(); for (const sec of zone.sections) for (const w of sec.words) for (const k of Object.keys(w)) keys.add(k);
console.log("word keys", [...keys].join(" "));
console.log("zone counts", JSON.stringify(zone.counts).slice(0, 600));
console.log("toggles", JSON.stringify((zone.emitted_from || {}).toggles || {}).slice(0, 1200));
