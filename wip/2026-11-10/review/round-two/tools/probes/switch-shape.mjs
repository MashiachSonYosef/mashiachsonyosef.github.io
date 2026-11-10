// The shape of a zone's switch prices (emitted_from.toggles.sources): its own keys, one source's record, and the joint record's keys, each cut short.
// node switch-shape.mjs <zone.bin>
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
const z = JSON.parse(gunzipSync(readFileSync(process.argv[2])).toString("utf8"));
const tg = ((z.emitted_from || {}).toggles || {}).sources || {};
const cut = (v, n = 160) => { const s = JSON.stringify(v); return s.length > n ? `${s.slice(0, n)}…` : s; };
console.log("keys:", Object.keys(tg).join(", "));
console.log("counts:", cut(tg.counts, 400));
const ids = Object.keys(tg.sources || {});
console.log(`sources: ${ids.length}; the first: ${ids[0]} = ${cut((tg.sources || {})[ids[0]], 500)}`);
const j = tg.joint || {};
console.log("joint keys:", Object.keys(j).join(", "));
for (const [k, v] of Object.entries(j)) {
  if (v && typeof v === "object" && !Array.isArray(v)) { const ks = Object.keys(v); console.log(`  joint.${k}: ${ks.length} keys; the first: ${cut(ks[0], 80)} = ${cut(v[ks[0]], 300)}`); }
  else console.log(`  joint.${k}: ${cut(v, 300)}`);
}
