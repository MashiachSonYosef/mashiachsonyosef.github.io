// What the records that describe the shelf say today, side by side. Read-only.
// node shelf-readers.mjs <reader dir>
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
const R = process.argv[2];
const J = (f) => JSON.parse(readFileSync(join(R, "data", f), "utf8"));
const pins = J("zone-store-v1.json").pins;
const here = new Set(readdirSync(join(R, "data", "zones")).filter((f) => f.endsWith(".bin")).map((f) => f.replace(/\.bin$/, "")));
const pinned = new Set(Object.keys(pins).map((f) => f.replace(/\.bin$/, "")));
const isSide = (n) => /\.[a-z]+$/.test(n);
const att = J("work-attachment-v1.json");
const rows = att.pairs || [];
console.log(`work-attachment: ${rows.length} pairs · emitted ${att.emitted_on || att.emitted || "?"} · keys ${Object.keys(att).join(", ")}`);
console.log(`  works in it: pinned ${rows.filter((r) => pinned.has(r.work)).length} · on disk ${rows.filter((r) => here.has(r.work)).length} · neither ${rows.filter((r) => !pinned.has(r.work)).map((r) => r.work).slice(0, 5).join(" ")}`);
const onPinned = [...pinned].filter((n) => !isSide(n) && n.includes("-on-"));
console.log(`  pinned works naming a base ("-on-"): ${onPinned.length} · of them in the record: ${onPinned.filter((n) => rows.some((r) => r.work === n)).length}`);
console.log(`  targets: ${[...new Set(rows.map((r) => r.target || r.base))].slice(0, 8).join(" ")}`);
console.log(`  first row: ${JSON.stringify(rows[0]).slice(0, 500)}`);
const g = J("serve-gate-receipt-v1.json");
console.log(`serve gate: keys ${Object.keys(g).join(", ")}`);
for (const k of Object.keys(g)) { const v = g[k]; console.log(`  ${k}: ${Array.isArray(v) ? `[${v.length}]` : typeof v === "object" && v ? `{${Object.keys(v).length}}` : JSON.stringify(v).slice(0, 160)}`); }
const names = new Set([...(g.passed || []), ...Object.keys(g.refused || {}), ...(Array.isArray(g.refused) ? g.refused.map((x) => x.zone || x) : [])]);
console.log(`  names the gate judged: ${names.size} · pinned and not judged: ${[...pinned].filter((n) => !isSide(n) && !names.has(n)).length} · judged and not pinned: ${[...names].filter((n) => !pinned.has(n)).length}`);
