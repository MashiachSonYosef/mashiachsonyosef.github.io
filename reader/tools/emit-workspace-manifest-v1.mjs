#!/usr/bin/env node
// LEDGER: -
// no frame letter. This records the state of the working tree, not a fact about a work.
//
// emit-workspace-manifest-v1 · what this lane needs staged, written down where it survives
//
// The cloud container this lane runs in is reclaimed without warning, and
// when it comes back the staged corpus artifacts are gone while the branch
// is untouched. That has cost hours: the way back was to guess a file, hit
// ENOENT, stage it, guess the next — a serial discovery loop run once per
// rollback, from memory.
//
// The memory is the bug. This tool writes the dependency down, on the branch,
// where a rollback cannot reach it: every corpus file the reader lane needs
// in order to serve and build a work, its size, and its path on the owner's
// machine. Its companion, check-workspace-staged-v1, reads it after a
// rollback and prints exactly what is missing in one list — one round trip
// instead of five.
//
// The list is not typed. It is what tools/plan-work-shards-v1.mjs computes
// for every work in the build plan, unioned, plus the two ledger files the
// planner itself needs to run. A work added to the plan is in the manifest
// the next time this runs.
//
// Usage:
//   node tools/emit-workspace-manifest-v1.mjs --bridge <bridge.csv.gz> \
//     --workspace <staged-root>
import { readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const arg = (name, dflt) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : dflt;
};
const BRIDGE = arg("bridge");
const WORKSPACE = arg("workspace");
const PLAN = arg("plan", "build/build-plan-v1.json");
const OUT = arg("out", "data/workspace-manifest-v1.json");
if (!BRIDGE || !WORKSPACE) throw new Error("--bridge and --workspace are both required");

const plan = JSON.parse(readFileSync(PLAN, "utf8"));

// The planner's own inputs: it cannot compute a shard list without these, so
// they are the first thing to restore and they are named here rather than
// discovered by failing.
const SEEDS = [
  ["ledgers/work/c0/current-c0-location-source-bridge-2026-07-10.csv.gz", "the C0 location/source bridge — the planner's and every build's identity oracle"],
  ["corpus-refinement-v1/output/terminal-compact-composite-v1/terminal-compact-shard-index-v1.csv", "composite shard index — which terminal shard holds a c0 range"],
  ["corpus-refinement-v1/output/terminal-compact-composite-v1/terminal-compact-composite-validation-seal-v1.json", "its seal"],
  ["corpus-refinement-v1/output/terminal-reader-sparse-binding-index-v1/terminal-reader-sparse-binding-shard-index-v1.csv", "sparse binding shard index — which dictionary shard holds an ordinal"],
  ["corpus-refinement-v1/output/terminal-reader-sparse-binding-index-v1/terminal-reader-sparse-binding-index-validation-seal-v1.json", "its seal"],
  ["corpus-refinement-v1/output/terminal-binding-composite-v1/terminal-binding-composite-validation-seal-v1.json", "binding composite seal"],
];

const files = new Map();   // workspace-relative path -> {why, works:Set}
const note = (p, why, work) => {
  if (!p) return;
  const e = files.get(p) || { why, works: new Set() };
  if (work) e.works.add(work);
  files.set(p, e);
};
for (const [p, why] of SEEDS) note(p, why, null);

// Every planned work's own file list, from the planner itself. Two passes:
// the dictionary shard rows resolve only once the runs shard is present, so a
// work planned on a cold workspace reports its runs shard and nothing past
// it. That is recorded honestly rather than papered over.
let incomplete = 0;
for (const w of plan.works) {
  let out = "";
  try {
    out = execFileSync("node", ["tools/plan-work-shards-v1.mjs", "--work", w.work_id,
      "--bridge", BRIDGE, "--workspace", WORKSPACE], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) {
    console.error(`  ${w.work_id}: the planner could not run — ${String(e.message).split("\n")[0]}`);
    continue;
  }
  if (/runs shards are not staged locally yet/.test(out)) incomplete += 1;
  for (const line of out.split("\n")) {
    const m = /^\s{2}(\S+)\s+(?:\([\d,]+ B\)\s+)?·\s+(.+)$/.exec(line);
    if (!m) continue;
    note(m[1], m[2].trim(), w.published_as);
  }
}

const rows = [...files.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([p, e]) => {
  const abs = join(WORKSPACE, p);
  const here = existsSync(abs);
  return {
    path: p,
    bytes: here ? statSync(abs).size : null,
    why: e.why,
    works: [...e.works].sort(),
    staged_when_written: here,
  };
});

const doc = {
  schema_version: "WORKSPACE_MANIFEST_V1",
  emitted_by: "tools/emit-workspace-manifest-v1.mjs",
  rule: "this lane runs in a container that is reclaimed without warning; the branch is not. Every corpus file the lane needs to serve and build the published works is written here, by its path under the workspace root, so recovery after a rollback is one read and one staging call rather than a discovery loop. The list is computed by tools/plan-work-shards-v1.mjs over every work in the build plan, never typed.",
  recovery: [
    "git clone -q --depth 1 -b gh-pages <repo> <workdir>",
    "node tools/check-workspace-staged-v1.mjs --workspace '/mnt/user-data/uploads/999 footsteps'",
    "stage the paths it prints, under the workspace root, in one call",
    "re-run it: a clean report means every serve and build in this lane can run",
  ],
  derived_from: { plan: PLAN, bridge: BRIDGE.split("/").pop() },
  counts: { files: rows.length, works_planned: plan.works.length, works_whose_dictionary_shards_were_unresolved: incomplete },
  files: rows,
};
const text = JSON.stringify(doc, null, 1) + "\n";
if (/[\u0590-\u05FF]/.test(text)) throw new Error("the manifest carries a character of the text — refusing output");
writeFileSync(OUT, text);
console.log(`${OUT} · ${rows.length} files · ${rows.filter((r) => r.staged_when_written).length} staged when written` +
  (incomplete ? ` · ${incomplete} work(s) had unresolved dictionary shards — re-run once their runs shards are staged` : ""));
