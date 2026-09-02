#!/usr/bin/env node
// LEDGER: O
// the named stream: which zone bin is published, and its bytes. This writes
// bins to data/zones, but only bytes the record already pins — it restores
// O's stream from the shelf it was shipped to and originates nothing.
// GUARDS: zone-store-rule-v1-the-door-keeps-the-seals-the-shelf-keeps-the-weight
//
// A fresh checkout with the shelf moved has the seals and not the weight.
// Every tool that builds the door or runs a check reads the bins off this
// disk, so this puts them back: for each pin in the record, fetch the object
// at its sealed address on the base, verify byte count and sha256, and write
// it only then. A bin already on disk and exact is left alone. A bin that
// arrives wrong is not written and is named at the end; this exits nonzero
// and the tree is no worse than before it ran.
//
// Run: node tools/pull-zones-from-store-v1.mjs [--base <https url>] [--jobs 8]
//   (--base overrides the record's base for a pull from a mirror; the pins
//    are the same either way, so the bytes are the same or refused)
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const JOBS = Math.max(1, Number(arg("jobs", "8")));
const ZONES = join(K3, "data", "zones");
const RECORD = join(K3, "data", "zone-store-v1.json");
if (!existsSync(RECORD)) { console.error("NO_STORE_RECORD: data/zone-store-v1.json"); process.exit(1); }
const store = JSON.parse(readFileSync(RECORD, "utf8"));
const base = String(arg("base", store.base || "")).replace(/\/$/, "");
if (!/^https:\/\//.test(base)) { console.error("NO_BASE: the record's base is null and no --base was given; the shelf stands beside the door and there is nothing to pull"); process.exit(1); }
mkdirSync(ZONES, { recursive: true });

const sha = (b) => createHash("sha256").update(b).digest("hex");
let kept = 0, pulled = 0, bytes = 0;
const failed = [];
const one = async ([file, pin]) => {
  const p = join(ZONES, file);
  if (existsSync(p)) { const b = readFileSync(p); if (b.length === pin.bytes && sha(b) === pin.sha256) { kept += 1; return; } }
  const url = `${base}/${file.replace(/\.bin$/, "")}.${String(pin.sha256).slice(0, 12)}.bin`;
  try {
    const res = await fetch(url);
    if (res.status !== 200) { failed.push(`${file} — HTTP ${res.status}`); return; }
    const b = Buffer.from(await res.arrayBuffer());
    if (b.length !== pin.bytes || sha(b) !== pin.sha256) { failed.push(`${file} — arrived ${b.length} bytes sha ${sha(b).slice(0, 12)}…, pin says ${pin.bytes} ${String(pin.sha256).slice(0, 12)}…`); return; }
    writeFileSync(p, b); pulled += 1; bytes += b.length;
  } catch (e) { failed.push(`${file} — ${String(e.message || e).slice(0, 60)}`); }
};
const queue = Object.entries(store.pins || {});
const total = queue.length;
await Promise.all(Array.from({ length: JOBS }, async () => { for (;;) { const next = queue.shift(); if (!next) return; await one(next); } }));
console.log(`${total} pins · ${kept} already exact on disk · ${pulled} pulled (${(bytes / 1e6).toFixed(1)} MB) · ${failed.length} refused`);
for (const f of failed.slice(0, 10)) console.log(`   ${f}`);
process.exit(failed.length ? 1 : 0);
