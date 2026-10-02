#!/usr/bin/env node
// GUARDS: language-admission-rule-v1-a-source-that-is-not-hebrew-or-aramaic-cannot-define-an-a
//
// A zone bakes its gloss table at build time, so striking a source from the
// route store does not by itself take the English off the page — the wrong
// reading is already sitting in 3,065 published files. This pass re-derives
// every baked gloss from the struck store and writes back what the store now
// says.
//
// It is sound to do this without the body, and only because of the direction
// of the change: striking routes can remove readings from a key's pool and
// can never add one. So a key that had no gloss still has none, and the set
// of keys to re-ask is exactly the set the zone already glossed. Every count
// is recomputed from the zone's own words and spans by the same functions the
// builder used — regionsOf from zone-lib, the store's own tableFor rule — not
// adjusted by arithmetic here.
//
// What it does NOT do: re-derive the text, the spans, or anything the body
// answers for. Those are untouched by a language strike. The next full fleet
// run rebuilds them from source anyway and must reproduce this exactly.
//
// Idempotent: a zone already re-driven reports no change.
//
// Run: node tools/redrive-zone-gloss-v1.mjs [--zones data/zones] [--dry]
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { gzipSync, gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { openRouteStore } from "./gloss-store-v1.mjs";
import { regionsOf } from "./zone-lib-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const ZONES = arg("zones", join(K3, "data", "zones"));
const DRY = process.argv.includes("--dry");
const STORE = openRouteStore(join(K3, "data", "route-store"));

const admission = STORE.index.language_admission;
if (!admission) {
  console.log("SKIPPED — the store carries no language admission record; run tools/strike-language-v1.mjs first");
  process.exit(3);
}

const bins = readdirSync(ZONES).filter((f) => f.endsWith(".bin")).sort();
let touched = 0, lost = 0, changed = 0, wordsLost = 0;
const worst = [];

for (const f of bins) {
  const path = join(ZONES, f);
  let z;
  try { z = JSON.parse(gunzipSync(readFileSync(path)).toString("utf8")); } catch { continue; }
  const oldGloss = z.gloss || {};
  const askedBefore = (z.emitted_from?.gloss_layer?.distinct_forms_glossed || 0)
    + (z.emitted_from?.gloss_layer?.distinct_forms_bare || 0);

  // 1 · re-ask the store for exactly the keys this zone already glossed
  const gloss = {};
  const dropped = [], replaced = [];
  for (const k of Object.keys(oldGloss).sort()) {
    const g = STORE.glossFor(k);
    if (g.text === null) { dropped.push(k); continue; }
    gloss[k] = g.text;
    if (g.text !== oldGloss[k]) replaced.push(`${k}: ${oldGloss[k]} → ${g.text}`);
  }
  if (!dropped.length && !replaced.length) continue;
  touched += 1; lost += dropped.length; changed += replaced.length;

  // 2 · recompute the occurrence counts the same way the builder does
  const spans = z.spans || {};
  let glossedWords = 0, glossedRegions = 0, regionCount = 0, spannedRegions = 0;
  for (const sec of z.sections || []) for (const w of sec.words || []) {
    const regions = regionsOf(w);
    regionCount += regions.length;
    for (const g of regions) {
      if (spans[g.k]) spannedRegions += 1;
      if (gloss[g.k]) glossedRegions += 1;
    }
    if (regions.some((g) => gloss[g.k])) glossedWords += 1;
  }
  wordsLost += (z.counts?.glossed_words || 0) - glossedWords;
  if (worst.length < 8 && dropped.length)
    worst.push(`${z.work}: −${dropped.length} forms, −${(z.counts?.glossed_words || 0) - glossedWords} occurrences`
      + (dropped.length ? `  e.g. ${dropped.slice(0, 4).map((k) => `${k} (was "${oldGloss[k]}")`).join(", ")}` : ""));

  if (DRY) continue;

  // 3 · write back, and say in the zone's own receipt why it changed
  z.gloss = gloss;
  const glossed = Object.keys(gloss).length;
  if (z.counts) {
    z.counts.glossed_words = glossedWords;
    z.counts.w_regions_glossed = glossedRegions;
    z.counts.w_regions = regionCount;
    z.counts.w_regions_with_a_component_system = spannedRegions;
  }
  if (z.emitted_from?.gloss_layer) {
    const gl = z.emitted_from.gloss_layer;
    gl.distinct_forms_glossed = glossed;
    gl.distinct_forms_bare = Math.max(0, askedBefore - glossed);
    gl.gloss_table_sha256 = createHash("sha256").update(JSON.stringify(gloss)).digest("hex");
    gl.language_admission = {
      rule_id: admission.rule_id,
      admitted_languages: admission.admitted_languages,
      struck_m_ids: admission.struck_m_ids,
      forms_that_lost_their_only_reading: dropped.length,
      forms_whose_reading_changed_source: replaced.length,
      note: "re-derived from the struck route store by tools/redrive-zone-gloss-v1.mjs; the text, "
        + "the spans and the coordinates are untouched — a language strike reaches definitions only",
    };
  }
  // gloss_m is rebuilt whole by tools/enrich-gloss-m-v1.mjs; drop the stale
  // table now so no reading can stand for a moment beside the wrong licence
  delete z.gloss_m;
  writeFileSync(path, gzipSync(Buffer.from(JSON.stringify(z)), { level: 9 }));
}

console.log(`zones read ${bins.length} · changed ${touched}`);
console.log(`  distinct forms that lost their only reading: ${lost}`);
console.log(`  distinct forms whose reading changed source: ${changed}`);
console.log(`  word occurrences that lost their reading:    ${wordsLost}`);
for (const w of worst) console.log(`  ${w}`);
if (!DRY && touched) console.log(`\nnow run: node tools/enrich-gloss-m-v1.mjs`);
if (DRY) console.log("\n--dry — nothing written");
