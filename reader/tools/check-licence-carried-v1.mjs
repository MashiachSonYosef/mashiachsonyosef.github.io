#!/usr/bin/env node
// check-licence-carried-v1 · every printed commentary entry carries its own licence
//
// The licence is the only gate, and it gates occurrences, not works. A printed
// entry whose licence exists only on the work-level record is inheriting — the
// banned shape: truthful while a work is uniform, a lie the day it is not.
// The Genesis pack already carries per-entry licences; this check holds every
// commentary bin to the same grain. It stays red for a bin built before the
// carry, and the red IS the record of that incompleteness until the commentary
// build reruns where the serve rows are.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";

const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > 0 ? process.argv[i + 1] : d; };
const ZONES = arg("zones", "data/zones");

let pass = 0, fail = 0;
const check = (name, ok, detail) => {
  console.log(`${ok ? "  ok  " : "FAIL  "}${name}  ·  ${detail}`);
  ok ? pass++ : fail++;
};

const bins = readdirSync(ZONES).filter((f) => f.endsWith(".commentary.bin")).sort();
if (!bins.length) { console.log("SKIPPED — no commentary bins in " + ZONES); process.exit(3); }

for (const f of bins) {
  const bin = JSON.parse(gunzipSync(readFileSync(join(ZONES, f))).toString("utf8"));
  let printed = 0, withoutOwn = 0, held = 0;
  for (const U of Object.values(bin.units || {})) {
    const buckets = [];
    if (U.words) for (const arr of Object.values(U.words)) buckets.push(...arr);
    if (U.section) buckets.push(...[].concat(U.section));
    if (Array.isArray(U)) buckets.push(...U);
    for (const e of buckets) {
      if (e.held) { held++; continue; }
      if (!(e.text && String(e.text).trim())) continue;
      printed++;
      if (!(e.license && String(e.license).trim())) withoutOwn++;
    }
  }
  check(`${f}: every printed entry carries its own licence`, withoutOwn === 0,
    `${printed} printed · ${held} held · ${withoutOwn} leaning on the work-level record`);
}

console.log(fail ? `${fail} FAILED` : "all checks passed");
process.exit(fail ? 1 : 0);
