#!/usr/bin/env node
// LEDGER: O
// the named stream: which zone bin is published, and its bytes.
//
// The store record: one pin per bin the door publishes, the seals kept for
// the bins it does not, and where the shelf stands.
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
// TWO RECORDS, DIVIDED BY THE GATE (10 November 2026).
//
//   data/zone-store-v1.json        the bins the door publishes: the zone of
//                                  every work the gate serves, the sidecars
//                                  that ride beside one, and the fixtures.
//                                  Every one is on this disk or this tool
//                                  stops. This is the record a page reads.
//   data/zone-store-held-v1.json   the seal of every other bin of the shelf.
//                                  A work the gate does not serve keeps its
//                                  bin out of the published tree (L4 of
//                                  refusals-gate-rule-v1), so a checkout
//                                  never holds it. Where the bin stands on this
//                                  disk its seal is read now; where it does
//                                  not, the seal already kept is carried
//                                  forward, and the store record says how
//                                  many of each. No page reads this file.
//
// Until that day there was one record with one map, written from whatever
// disk the builder ran on, and a second tool (repin-zone-store-v1) re-read
// the bins that were there and kept the rest. The record said "base: null,
// beside the door" of 3,448 bins no checkout holds; five checks read it as
// the shelf and failed on every machine but the one that built it, and that
// machine was reset. A reader opening a book by its address fetched all
// 3,595 seals (529 KB) to check three bins. Now the gate's receipt says
// which bin is which, this is the one tool that writes either record, and
// nothing is dropped silently: a seal leaves the held record only when its
// bin is on the disk to be read again.
//
// What `held_off_the_door.recorded` says is not derived here. It is what was
// found about where those bytes stand, dated, and it is carried forward
// untouched, as `base` is.
//
// Run: node tools/emit-zone-store-v1.mjs [--base <https url>|none]
import { readFileSync, writeFileSync, readdirSync, existsSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { baseOfSidecar, isSidecar, SERVE_GATE_RECEIPT, ZONE_STORE_RECORD, ZONE_STORE_HELD } from "./zones-on-disk-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const ZONES = join(K3, "data", "zones");
const OUT = join(K3, "data", ZONE_STORE_RECORD);
const HELD = join(K3, "data", ZONE_STORE_HELD);
const GATE = join(K3, "data", SERVE_GATE_RECEIPT);
const RULE = "zone-store-rule-v1-the-door-keeps-the-seals-the-shelf-keeps-the-weight";

const prior = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};
const priorHeld = existsSync(HELD) ? (JSON.parse(readFileSync(HELD, "utf8")).pins || {}) : {};
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

// No receipt is a refusal, never a pass: without the gate's word nothing says
// which bins the door publishes.
if (!existsSync(GATE)) { console.error(`NO_GATE_RECEIPT: ${GATE} — run tools/check-c0-refusals-v1.mjs --write first`); process.exit(1); }
const served = new Set(JSON.parse(readFileSync(GATE, "utf8")).served || []);
const published = (f) => f.startsWith("fixture-") || served.has(baseOfSidecar(f) || f.replace(/\.bin$/u, ""));

const sha = (b) => createHash("sha256").update(b).digest("hex");
const seal = (f) => { const b = readFileSync(join(ZONES, f)); return { sha256: sha(b), bytes: b.length }; };
const onDisk = readdirSync(ZONES).filter((x) => x.endsWith(".bin")).sort();
const here = new Set(onDisk);
// every seal either record keeps: the one map of the record before 10
// November is read the same way, so the first run under the gate divides it
const priorAll = { ...priorHeld, ...(prior.pins || {}) };

const pins = {}, held = {};
let readNow = 0, carried = 0;
for (const f of onDisk) {
  if (published(f)) pins[f] = seal(f);
  else { held[f] = seal(f); readNow += 1; }
}
const lost = [];
for (const f of Object.keys(priorAll).sort()) {
  if (here.has(f)) continue;
  if (published(f)) { lost.push(f); continue; }
  held[f] = priorAll[f]; carried += 1;
}
if (lost.length) {
  console.error(`PUBLISHED_BIN_ABSENT: ${lost.length} — ${lost.slice(0, 6).join(", ")} · the gate serves it and its bin is not on this disk; a record sealed without it would publish a door with a hole in it`);
  process.exit(1);
}
const sorted = (o) => Object.fromEntries(Object.keys(o).sort().map((k) => [k, o[k]]));
const heldNames = Object.keys(held);
const record = {
  rule: RULE,
  note: "pins are the bins the door publishes, read off the disk at emit time; the site serves its own proofs and names no repository. base names the host those bins serve from; null means beside the door. Moving the shelf is the owner's ruling, made here and nowhere else. held_off_the_door counts the bins of the shelf the door does not publish and names the record that keeps their seals.",
  base: baseArg === undefined ? (prior.base ?? null) : baseArg,
};
if (heldNames.length) {
  const heldBody = JSON.stringify({
    rule: RULE,
    what: "the seal of every bin of the shelf the door does not publish: a work the gate does not serve keeps its bin out of the published tree (refusals-gate-rule-v1, L4), and a sidecar is held with the book it rides beside. These bins are served from nowhere. The store record beside this file counts them and says what is known of where their bytes stand.",
    pins: sorted(held),
  }, null, 1) + "\n";
  writeFileSync(HELD, heldBody);
  record.held_off_the_door = {
    bins: heldNames.length,
    zones: heldNames.filter((f) => !isSidecar(f)).length,
    sidecars: heldNames.filter((f) => isSidecar(f)).length,
    seals_read_off_the_disk_at_this_writing: readNow,
    seals_carried_from_the_record_before: carried,
    seals: { file: `data/${ZONE_STORE_HELD}`, sha256: sha(Buffer.from(heldBody)), bytes: Buffer.byteLength(heldBody) },
    ...((prior.held_off_the_door || {}).recorded ? { recorded: prior.held_off_the_door.recorded } : {}),
  };
} else if (existsSync(HELD)) rmSync(HELD);   // every bin of the shelf is published: nothing is held, and no record says otherwise
record.pins = sorted(pins);
writeFileSync(OUT, JSON.stringify(record, null, 1) + "\n");
const moved = Object.keys(pins).filter((f) => !(prior.pins || {})[f] || prior.pins[f].sha256 !== pins[f].sha256).length;
console.log(`${OUT}: ${Object.keys(pins).length} bins published and pinned (${moved} new or moved) · ${heldNames.length} held off the door (${readNow} read now, ${carried} carried) · base ${record.base || "(beside the door)"}`);
