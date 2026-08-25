#!/usr/bin/env node
// Synthesis lane · fleet-rule-v1-a-work-builds-the-day-its-shards-arrive-and-not-a-day-sooner
//
// The fleet plan: for every work the derived ranges record, what stands
// between it and being built — said per work, so "the data is not here yet"
// is a row with a name on it rather than a shrug.
//
// States, in the order a work passes through them:
//   PLANNED          already in the build plan (a ledger or a typed record
//                    carries it); the ordinary build owns it from here
//   SHARDS_STAGED    every per-work file the zone build reads is present in
//                    the mirror; the work is ready for the lawful gates —
//                    the declared licence posture of its source and, for a
//                    source-marked text, the pair law — which run at build,
//                    per zone, as they always have
//   AWAITING_SHARDS  the mirror does not hold its files (or no mirror is
//                    here at all); nothing to do but say so
//
// This tool stages; it does not serve. No state here admits a work to the
// serve set — the zone build and its guards remain the only door.
//
// GUARDS: fleet-rule-v1-a-work-builds-the-day-its-shards-arrive-and-not-a-day-sooner
//
// Run: node tools/plan-fleet-v1.mjs [--mirror <workspace mirror>]
//      [--ranges data/derived-work-ranges-v1.json]
//      [--plan build/build-plan-v1.json] [--out build/fleet-plan-v1.json]

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (name, dflt) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : (dflt === null ? null : join(K3, ...dflt.split("/")));
};

const RANGES_PATH = arg("ranges", "data/derived-work-ranges-v1.json");
const PLAN_PATH = arg("plan", "build/build-plan-v1.json");
const OUT = arg("out", "build/fleet-plan-v1.json");
const MIRROR = arg("mirror", null);

const ranges = JSON.parse(readFileSync(RANGES_PATH, "utf8"));
const planned = new Set();
if (existsSync(PLAN_PATH)) {
  const plan = JSON.parse(readFileSync(PLAN_PATH, "utf8"));
  for (const w of plan.works || []) planned.add(w.work_id || w.id);
}

// The five per-work files a zone build reads, named by the range alone —
// the shard store's own base number varies and is not re-derived here.
const pad = (n) => String(n).padStart(15, "0");
const WANT = (w) => {
  const tag = `${pad(w.c0_first)}-${pad(w.c0_last)}`;
  return [
    ["shards", `.forms.c0c`, tag], ["shards", `.occurrences.c0c`, tag], ["shards", `.manifest.json`, tag],
    ["scripts", `.scripts.csv.gz`, tag], ["units", `.units.csv.gz`, tag],
  ];
};
const CANDIDATE = "corpus-refinement-v1/output/current-merged-chain-compact-candidate-v1";
const dirCache = new Map();
const filesIn = (dir) => {
  if (!dirCache.has(dir)) dirCache.set(dir, existsSync(dir) ? readdirSync(dir) : []);
  return dirCache.get(dir);
};
const stagedFiles = (w) => {
  if (!MIRROR) return null;
  const found = [];
  for (const [sub, suffix, tag] of WANT(w)) {
    const dir = join(MIRROR, ...CANDIDATE.split("/"), sub);
    const hit = filesIn(dir).find((f) => f.includes(tag) && f.endsWith(suffix));
    if (!hit) return null;
    found.push(`${CANDIDATE}/${sub}/${hit}`);
  }
  return found;
};

const rows = ranges.works.map((w) => {
  if (planned.has(w.id)) return { ...w, state: "PLANNED" };
  const files = stagedFiles(w);
  if (files) return { ...w, state: "SHARDS_STAGED", files };
  return { ...w, state: "AWAITING_SHARDS" };
});
const count = (s) => rows.filter((r) => r.state === s).length;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify({
  schema_version: "FLEET_PLAN_V1",
  rule: "fleet-rule-v1-a-work-builds-the-day-its-shards-arrive-and-not-a-day-sooner",
  derived_from: { ranges: ranges.schema_version, ranges_rule: ranges.rule, mirror: MIRROR ? "present" : "absent" },
  stages_not_serves: "no state here admits a work to the serve set; the zone build and its guards remain the only door",
  counts: { PLANNED: count("PLANNED"), SHARDS_STAGED: count("SHARDS_STAGED"), AWAITING_SHARDS: count("AWAITING_SHARDS") },
  works: rows,
}, null, 1) + "\n");
console.log(`fleet: ${rows.length} works · ${count("PLANNED")} planned · ${count("SHARDS_STAGED")} staged · ${count("AWAITING_SHARDS")} awaiting shards${MIRROR ? "" : " (no mirror here)"}`);
