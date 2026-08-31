#!/usr/bin/env node
// GUARDS: language-admission-rule-v1-a-source-that-is-not-hebrew-or-aramaic-cannot-define-an-a
//
// The strike is a one-time act; this is the standing law. It re-derives the
// admission decision from each source's own label — it does not trust the
// struck list — so a catalog shipped tomorrow carrying a Yiddish, Ladino or
// Judeo-Arabic lexicon fails here rather than reaching a page.
//
// Three places a non-admitted source could stand:
//   1. the store index, as an M record
//   2. a store shard, as a route pointing at an M the index no longer holds
//   3. a published zone, as the licence chip under a printed English word
//
// The third is the one a reader sees, so it is checked against the zones on
// disk and not inferred from the first two.
//
// Run: node tools/check-language-admitted-v1.mjs [--zones data/zones]
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { classify, ADMISSION_RULE_ID, ADMITTED_LANGUAGES } from "./strike-language-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const ZONES = arg("zones", join(K3, "data", "zones"));
const STORE = join(K3, "data", "route-store");

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

console.log(`— ${ADMISSION_RULE_ID} —`);
console.log(`  admitted: ${ADMITTED_LANGUAGES.join(", ")}\n`);

const index = JSON.parse(readFileSync(join(STORE, "index.json"), "utf8"));

// 0 · the strike is on record, with its reasoning, where anyone can read it
const RECORD = join(K3, "data", "language-admission-v1.json");
check("the admission record stands beside the store", existsSync(RECORD), "data/language-admission-v1.json");
if (existsSync(RECORD)) {
  const rec = JSON.parse(readFileSync(RECORD, "utf8"));
  check("  every struck source carries the label and phrase that struck it",
    (rec.struck_sources || []).length > 0
      && rec.struck_sources.every((s) => s.m_id && s.label && s.reason && (s.evidence || s.reason.includes("NAMES_NO"))),
    `${(rec.struck_sources || []).length} struck, each with its evidence`);
}

// 1 · the index
const inIndex = Object.entries(index.m_sources)
  .map(([m, v]) => [m, v.label, classify(v.label)])
  .filter(([, , d]) => !d.admitted);
check("no source in the store index names a language outside Hebrew and Aramaic",
  inIndex.length === 0,
  inIndex.length ? inIndex.map(([m, , d]) => `${m} (${d.evidence})`).join(" · ") : `${Object.keys(index.m_sources).length} sources, all admitted`);

// 2 · the shards
let routes = 0; const orphaned = new Map();
for (const f of readdirSync(join(STORE, "shards")).filter((x) => x.endsWith(".bin"))) {
  const body = JSON.parse(gunzipSync(readFileSync(join(STORE, "shards", f))).toString("utf8"));
  for (const rows of Object.values(body)) for (const r of rows) {
    routes += 1;
    if (!index.m_sources[r[3]]) orphaned.set(r[3], (orphaned.get(r[3]) || 0) + 1);
  }
}
check("no route in any shard points at a source the index does not hold",
  orphaned.size === 0,
  orphaned.size ? [...orphaned].map(([m, n]) => `${m}×${n}`).join(" ") : `${routes.toLocaleString()} routes, every M present`);

// 3 · the zones — what a reader would actually meet
const bins = existsSync(ZONES) ? readdirSync(ZONES).filter((f) => f.endsWith(".bin")).sort() : [];
const offenders = [];
let zonesRead = 0, glossesRead = 0, offenderCount = 0;
for (const f of bins) {
  let z;
  try { z = JSON.parse(gunzipSync(readFileSync(join(ZONES, f))).toString("utf8")); } catch { continue; }
  zonesRead += 1;
  for (const [k, v] of Object.entries(z.gloss_m || {})) {
    glossesRead += 1;
    if (classify(v.m || "").admitted) continue;
    offenderCount += 1;
    if (offenders.length < 10)
      offenders.push(`${z.work} · ${k} = "${(z.gloss || {})[k] || ""}" from ${classify(v.m || "").evidence}`);
  }
}
check("no published zone prints a reading from a non-admitted source",
  offenderCount === 0,
  offenderCount
    ? `${offenderCount} readings — ${offenders.join(" | ")}`
    : `${zonesRead} zones, ${glossesRead.toLocaleString()} licensed readings, all admitted`);

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
