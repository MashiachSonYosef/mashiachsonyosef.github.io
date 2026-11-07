#!/usr/bin/env node
// Synthesis lane · the zone store re-pinned from the bins on this disk (7 November 2026: the
// finish step ran this from a scratch probe every round since 6 November; it belongs with the
// tools that build what it pins). Usage: node tools/repin-zone-store-v1.mjs <reader dir>
import { readFileSync, writeFileSync, readdirSync } from "node:fs"; import { createHash } from "node:crypto";
const R = process.argv[2]; const OUT = `${R}/data/zone-store-v1.json`;
const rec = JSON.parse(readFileSync(OUT, "utf8")); let changed = 0, same = 0, added = 0;
for (const f of readdirSync(`${R}/data/zones`).filter((x) => x.endsWith(".bin")).sort()) {
  const b = readFileSync(`${R}/data/zones/${f}`); const pin = { sha256: createHash("sha256").update(b).digest("hex"), bytes: b.length };
  const was = rec.pins[f];
  if (!was) added++; else if (was.sha256 === pin.sha256 && was.bytes === pin.bytes) { same++; continue; } else changed++;
  rec.pins[f] = pin;
}
const sorted = {}; for (const k of Object.keys(rec.pins).sort()) sorted[k] = rec.pins[k]; rec.pins = sorted;
writeFileSync(OUT, JSON.stringify(rec, null, 1) + "\n");
console.log({ changed, same, added, pins: Object.keys(rec.pins).length });
