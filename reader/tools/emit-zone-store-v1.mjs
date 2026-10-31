#!/usr/bin/env node
// LEDGER: O
// the named stream: which zone bin is published, and its bytes.
//
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
// The ruled value, passed by name and never inferred. `--base <https url>`
// moves the shelf; `--base none` brings it back beside the door; no flag
// carries the standing ruling forward. Anything that is not an https host
// is refused here rather than written and refused by the check later.
const baseArg = (() => {
  const i = process.argv.indexOf("--base");
  if (i < 0) return undefined;
  const v = String(process.argv[i + 1] || "");
  if (v === "none") return null;
  if (!/^https:\/\/[^\s/]+(\/[^\s]*)?$/.test(v)) { console.error(`BASE_NOT_HTTPS: ${JSON.stringify(v)}`); process.exit(1); }
  return v.replace(/\/$/, "");
})();
// NO REPOSITORY ADDRESS (the owner, 31 October 2026: "we dont need any of
// that our proofs are literally published right to the website"). The record
// named the source repository so an export could point back to it; every seal,
// receipt and check it pointed to is served beside the door, so the site
// carries its own proofs and names no account.
const pins = {};
for (const f of readdirSync(ZONES).filter((x) => x.endsWith(".bin")).sort()) {
  const b = readFileSync(join(ZONES, f));
  pins[f] = { sha256: createHash("sha256").update(b).digest("hex"), bytes: b.length };
}
const record = {
  rule: "zone-store-rule-v1-the-door-keeps-the-seals-the-shelf-keeps-the-weight",
  note: "the pins are read off the served bins at emit time; the site serves its own proofs and names no repository. base names the host the bins serve from; null means beside the door. Moving the shelf is the owner's ruling, made here and nowhere else.",
  base: baseArg === undefined ? (prior.base ?? null) : baseArg,
  pins,
};
writeFileSync(OUT, JSON.stringify(record, null, 1) + "\n");
console.log(`${OUT}: ${Object.keys(pins).length} bins pinned · base ${record.base || "(beside the door)"}`);
