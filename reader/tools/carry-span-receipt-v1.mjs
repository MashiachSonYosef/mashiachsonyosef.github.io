#!/usr/bin/env node
// Synthesis lane · span-carry-rule-v1-a-receipt-may-travel-only-to-a-table-proved-identical
//
// Give a zone whose component layer arrived without a receipt the receipt that
// already describes it — but only after proving, form by form, that the two
// tables are the same table.
//
// What was wrong. 1kings-commentary and targum-1kings-commentary were built
// before build-commentary-zone recorded where its span slice came from. They
// carry the layer and say nothing about its origin, so nobody downstream can
// reproduce or audit it, and check-sealed-layers has been red on both for
// weeks. The builder was fixed; the published files were not, because fixing
// them properly means a build against the sealed template and that template is
// not on this disk.
//
// Why this is not a receipt written by hand. The commentary zone for a work is
// the neighbouring work's text attached by coordinate, so its forms are that
// neighbour's forms — and the neighbour's zone carries the same layer with a
// full receipt. This compares the two tables completely before it copies
// anything: every key on both sides, and for each key the component surfaces,
// the roles, the split rule and the confidence, compared after resolving both
// zones' interning tables. One difference anywhere and nothing is written.
//
// So the sentence the output carries is a measured one — "these are the same
// 3,239 component systems, and this is where that one came from" — rather than
// an inference about how the file was probably built. It also says which zone
// the receipt was carried from and that it was carried, so the next person to
// read it is not told a build supplied it.
//
// What it does NOT do: it will not carry a receipt onto a partial match. A
// table that covers some of the target's keys is a withholding, which is the
// fault the sealed-layer rule exists for, and the honest answer there is a
// build with the template rather than a receipt over a subset.
//
// Run:
//   node tools/carry-span-receipt-v1.mjs --zone data/zones/1kings-commentary.bin \
//     --from data/zones/targum-1kings.bin --stamp 2026-08-21

import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { gzipSync, gunzipSync } from "node:zlib";

export const CARRY_RULE_ID = "span-carry-rule-v1-a-receipt-may-travel-only-to-a-table-proved-identical";

const arg = (f, d = null) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d; };
const zonePath = arg("--zone");
const fromPath = arg("--from");
const stamp = arg("--stamp");
const outPath = arg("--out", zonePath);
for (const [flag, v] of [["--zone", zonePath], ["--from", fromPath], ["--stamp", stamp]])
  if (!v) { console.error(`MISSING_ARG ${flag}`); process.exit(2); }

const read = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const zone = read(zonePath), from = read(fromPath);

// Resolve both interning tables so the comparison is over what the zones say,
// not over the indices they happen to have assigned.
const resolve = (z) => {
  const out = new Map();
  for (const [k, sp] of Object.entries(z.spans || {}))
    out.set(k, JSON.stringify([
      sp[0],
      (sp[1] || []).map((i) => (z.span_roles || [])[i]),
      (z.span_rules || [])[sp[2]],
      (z.span_conf || [])[sp[3]],
    ]));
  return out;
};
const A = resolve(zone), B = resolve(from);

const onlyHere = [...A.keys()].filter((k) => !B.has(k));
const onlyThere = [...B.keys()].filter((k) => !A.has(k));
const differ = [...A.keys()].filter((k) => B.has(k) && A.get(k) !== B.get(k));
const same = A.size === B.size && !onlyHere.length && !onlyThere.length && !differ.length;

console.log(`${zonePath}  ·  ${A.size.toLocaleString()} component systems`);
console.log(`${fromPath}  ·  ${B.size.toLocaleString()} component systems`);
if (!same) {
  console.error(`\nNOT_THE_SAME_TABLE — nothing written.`);
  console.error(`  ${onlyHere.length} forms only in the zone, ${onlyThere.length} only in the source, ${differ.length} differ`);
  if (differ.length) console.error(`  e.g. ${differ.slice(0, 3).join(", ")}`);
  console.error(`  A receipt may not travel to a table it does not describe. Build this zone`);
  console.error(`  against the sealed COMPspan template instead.`);
  process.exit(1);
}

const src = ((from.emitted_from || {}).span_layer || {}).source;
if (!src || !src.path || !src.sha256) {
  console.error(`\nNO_RECEIPT_TO_CARRY — ${fromPath} names no sealed file for its own span layer`);
  process.exit(1);
}

const existing = (zone.emitted_from || {}).span_layer || {};
const out = {
  ...zone,
  emitted_from: {
    ...(zone.emitted_from || {}),
    span_layer: {
      ...existing,
      rule: existing.rule || ((from.emitted_from || {}).span_layer || {}).rule,
      source: src,
      forms_with_a_component_system: A.size,
      receipt_carried: {
        rule: CARRY_RULE_ID,
        from: fromPath,
        from_work: from.work || null,
        proved: `all ${A.size.toLocaleString()} forms compared on surfaces, roles, split rule and confidence — 0 differ, 0 on one side only`,
        what_moved: "the receipt only · no component surface, role, rule or confidence in this file was read, written or reordered",
        why_here: "this zone was built before its builder recorded where its span slice came from; the neighbouring work's zone carries the same table with a full receipt",
        carried_on: stamp,
        carried_by: "tools/carry-span-receipt-v1.mjs",
      },
    },
  },
};

const body = JSON.stringify(out);
writeFileSync(outPath, gzipSync(Buffer.from(body, "utf8"), { level: 9 }));
console.log(`\nthe same table, form for form — receipt carried from ${from.work || fromPath}`);
console.log(`${outPath} · ${src.path} · ${src.sha256.slice(0, 16)}… · sha256 ${createHash("sha256").update(body).digest("hex").slice(0, 16)}…`);
