#!/usr/bin/env node
// GUARDS: toggle-projection-rule-v1-a-toggle-is-a-ledger-projected-over-a-zones-own-positions
//
// A toggle's layer on a zone is a projection of Moses's ledger, and the zone
// carries a receipt saying what was projected, from what, and what it counted.
// What this proves, from the zone's bytes alone (the ledger is candidate-only
// on R2 and is not on this shelf):
//
//   L1  every zone with a toggle layer carries the receipt the rule names —
//       the rule id, the source (path, sha256, the R2 ledger), the join, who
//       projected it and when, and the counts
//   L2  the counts on the receipt are the counts on the zone: words carrying a
//       headword, and how many of them differ from their form, recounted here
//   L3  a headword sits on one-form positions only — a ketiv-qere site keeps
//       its forms — and is a bare consonantal key, never a pointed form
//   L4  the write is typed: post_build names emitted_from.toggles under the
//       single-pass exemption
//   L5  the reader knows the layer: zone.html's registry reads
//       emitted_from.toggles.headword, so a projected zone is drawn live
//
// Run: node tools/check-toggle-projection-v1.mjs
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const ZONES = join(K3, "data", "zones");
const RULE = "toggle-projection-rule-v1-a-toggle-is-a-ledger-projected-over-a-zones-own-positions";
const EXEMPTION = "single-pass-exemption-v1-a-post-build-write-is-typed-on-the-zone-and-expires-with-its-rebuild";
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

const HEBREW_POINTS = /[֑-ׇ]/u;
const layered = [];
for (const f of readdirSync(ZONES).filter((x) => x.endsWith(".bin")).sort()) {
  let z; try { z = JSON.parse(gunzipSync(readFileSync(join(ZONES, f))).toString("utf8")); } catch { continue; }
  const t = z.emitted_from && z.emitted_from.toggles && z.emitted_from.toggles.headword;
  if (!t) continue;
  layered.push({ slug: f.replace(/\.bin$/u, ""), z, t });
}
if (!layered.length) { console.log("SKIPPED — no zone on this shelf carries a toggle layer"); process.exit(3); }
console.log(`— ${layered.length} zones carry the headword layer —`);

const l1 = [], l2 = [], l3 = [], l4 = [];
for (const { slug, z, t } of layered) {
  const src = t.source || {};
  if (t.rule !== RULE || !src.path || !/^[0-9a-f]{64}$/u.test(String(src.sha256)) || !src.ledger || !t.join || !t.projected_by || !t.projected_on || !t.counts)
    l1.push(slug);
  let withH = 0, differs = 0, onPair = 0, pointed = 0;
  for (const s of z.sections || []) for (const w of s.words || []) {
    if (!w.h) continue;
    withH += 1;
    if (w.h !== w.k) differs += 1;
    if (w.w && w.w.length > 1) onPair += 1;
    if (HEBREW_POINTS.test(w.h)) pointed += 1;
  }
  const c = t.counts || {};
  if (withH !== c.words_with_headword || differs !== c.headword_differs_from_form)
    l2.push(`${slug}: zone ${withH}/${differs}, receipt ${c.words_with_headword}/${c.headword_differs_from_form}`);
  if (onPair || pointed) l3.push(`${slug}: ${onPair} on a pair, ${pointed} pointed`);
  const pb = z.emitted_from.post_build;
  if (!(pb && pb.rule_id === EXEMPTION && Array.isArray(pb.wrote) && pb.wrote.includes("emitted_from.toggles"))) l4.push(slug);
}
check("L1  every layered zone carries the receipt the rule names", !l1.length, l1.length ? l1.join(", ") : `${layered.length} receipts, each with rule, source sha256, ledger, join, projector, date, counts`);
check("L2  the receipt's counts are the zone's counts, recounted", !l2.length, l2.length ? l2.slice(0, 4).join(" | ") : `${layered.reduce((n, x) => n + (x.t.counts.words_with_headword || 0), 0).toLocaleString()} words carry a headword across the shelf`);
check("L3  a headword sits on one-form positions only and is a bare key", !l3.length, l3.slice(0, 4).join(" | "));
check("L4  the write is typed under the single-pass exemption", !l4.length, l4.length ? l4.join(", ") : "post_build names emitted_from.toggles on every layered zone");

const reader = existsSync(join(K3, "zone.html")) ? readFileSync(join(K3, "zone.html"), "utf8") : "";
check("L5  the reader's registry reads the layer, so a projected zone is drawn live",
  /emitted_from\.toggles\.headword/u.test(reader) && /const TOGGLES = \[/u.test(reader),
  "zone.html: TOGGLES registry and its live() on emitted_from.toggles.headword");

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
