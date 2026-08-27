#!/usr/bin/env node
// The store record: one pin per served bin, and where the shelf stands.
// GUARDS: zone-store-rule-v1-the-door-keeps-the-seals-the-shelf-keeps-the-weight
//
// The zone bins may one day serve from another host — the full library will
// not fit beside the door — and a bin that crosses a host boundary is past a
// border, which is where a hash does its work. This emits the record the
// reader checks arrivals against: the sha256 and byte count of every bin in
// data/zones, read off the disk at the moment of writing, never typed.
//
// `base` is a ruled value, not a derived one: it names the host the shelf
// stands on, and only the owner's word moves the shelf. This tool carries
// the existing record's base forward untouched (null means the bins serve
// beside the door, as they always have). To move the shelf, the owner rules
// the URL and it is set here once — after which every arrival from that host
// must match its pin or the page refuses to show it.
//
// Run: node tools/emit-zone-store-v1.mjs
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const ZONES = join(K3, "data", "zones");
const OUT = join(K3, "data", "zone-store-v1.json");

const prior = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};
const pins = {};
for (const f of readdirSync(ZONES).filter((x) => x.endsWith(".bin")).sort()) {
  const b = readFileSync(join(ZONES, f));
  pins[f] = { sha256: createHash("sha256").update(b).digest("hex"), bytes: b.length };
}
const record = {
  rule: "zone-store-rule-v1-the-door-keeps-the-seals-the-shelf-keeps-the-weight",
  note: "The pins are read off the served bins at emit time. base names the host the bins serve from; null means beside the door. Moving the shelf is the owner's ruling, made here and nowhere else.",
  base: prior.base ?? null,
  pins,
};
writeFileSync(OUT, JSON.stringify(record, null, 1) + "\n");
console.log(`${OUT}: ${Object.keys(pins).length} bins pinned · base ${record.base || "(beside the door)"}`);
