#!/usr/bin/env node
// Synthesis lane · the sealed mirror, planned from the chain's own indexes
//
// The website lane does not hold the corpus. It holds a mirror: the smallest
// set of sealed files the resident reader must open to answer a range of C0
// ids. That mirror used to be assembled by hand — copy a file, run, see what
// breaks, copy another — which produced something that worked and nothing
// that could be reproduced. This script produces the list instead, and the
// list is read out of the chain's own shard indexes, not out of memory.
//
// Two phases, because the plan for a range is written in files that must be
// present before it can be read:
//
//   --phase 1                      the bootstrap set: seals, shard indexes,
//                                  catalogs, contracts, the reader source,
//                                  and the generation-8 pointer. Constant.
//   --phase 2 --range A-B [...]    everything a range needs, resolved:
//                                    · the compact shard covering [A,B], with
//                                      its codec, units and scripts files, all
//                                      named by the compact shard index itself
//                                    · the sparse `runs` shard covering [A,B]
//                                    · the `units` and `representations`
//                                      shards holding the ordinals those runs
//                                      point at — read out of the runs shard,
//                                      because units and representations are
//                                      keyed by ordinal and not by C0
//
// Output is one device path per line, ready to hand to the file bridge. The
// count and total bytes are printed to stderr so a run can be compared with
// the mirror it produced.
//
// Usage:
//   node tools/plan-mirror.mjs --phase 1 --root "C:\\...\\999 footsteps"
//   node tools/plan-mirror.mjs --phase 2 --mirror /path/to/mirror \
//        --range 69859535-69870902 --range 70513734-70527384 --root "C:\\..."

import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";

const argv = process.argv.slice(2);
const arg = (f, d = null) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : d; };
const args = (f) => argv.reduce((acc, v, i) => (v === f ? [...acc, argv[i + 1]] : acc), []);
const phase = arg("--phase", "1");
const mirror = arg("--mirror", ".");
const root = arg("--root", "");
const toDevice = (p) => (root ? `${root.replace(/[\\/]+$/u, "")}\\${p.replace(/\//gu, "\\")}` : p);

// ---------------------------------------------------------------------------
// Phase 1 — the constant set.
//
// Every entry is here because the resident reader or its seal check opens it.
// Grouped so that a later reader of this file can see why each one is present.
// ---------------------------------------------------------------------------
const BOOTSTRAP = [
  // the reader itself, and the sealed CLI it is checked against
  "corpus-refinement-v1/package.json",
  "corpus-refinement-v1/src/lib-v1.mjs",
  "corpus-refinement-v1/src/compact-shard-codec-v1.mjs",
  "corpus-refinement-v1/src/current-additive-compact-pilot-lib-v1.mjs",
  "corpus-refinement-v1/src/query-current-terminal-reader-v1.mjs",
  "corpus-refinement-v1/src/query-terminal-reader-v1.mjs",
  // the seals that are verified once per process
  "corpus-refinement-v1/output/terminal-compact-composite-v1/terminal-compact-composite-validation-seal-v1.json",
  "corpus-refinement-v1/output/terminal-compact-composite-v1/terminal-compact-composite-summary-v1.json",
  "corpus-refinement-v1/output/terminal-binding-composite-v1/terminal-binding-composite-validation-seal-v1.json",
  "corpus-refinement-v1/output/terminal-reader-sparse-binding-index-v1/terminal-reader-sparse-binding-index-validation-seal-v1.json",
  "corpus-refinement-v1/output/terminal-reader-validation-v2/terminal-reader-validation-seal-v2.json",
  "corpus-refinement-v1/output/terminal-restoration-probe-v1/terminal-restoration-probe-validation-seal-v1.json",
  // the indexes phase 2 reads, and the catalogs every row resolves through
  "corpus-refinement-v1/output/terminal-compact-composite-v1/terminal-compact-shard-index-v1.csv",
  "corpus-refinement-v1/output/terminal-reader-sparse-binding-index-v1/terminal-reader-sparse-binding-shard-index-v1.csv",
  "corpus-refinement-v1/output/terminal-rights-profile-catalog-v2/terminal-rights-profile-catalog-v2.csv",
  "corpus-refinement-v1/output/terminal-script-profile-catalog-v1/terminal-script-profile-catalog-v1.csv",
  // the generation pointer chain the sealed CLI resolves through
  "corpus-refinement-v1/output/federated-terminal-reader-generation-9-v1/rollback/current-terminal-reader-generation-8-pointer-v1.json",
  "corpus-refinement-v1/output/terminal-current-reader-generation-v1/terminal-current-reader-generation-v1.json",
  "corpus-refinement-v1/output/terminal-current-pointer-hostiles-v1/terminal-current-pointer-hostiles-v1.json",
  "corpus-refinement-v1/output/terminal-cutover-plan-v1/terminal-cutover-plan-v1.json",
  "corpus-refinement-v1/output/terminal-cutover-plan-v1/terminal-cutover-plan-validation-v1.json",
  "corpus-refinement-v1/output/terminal-hot-runtime-closure-v1/terminal-hot-runtime-closure-summary-v1.json",
  "corpus-refinement-v1/output/terminal-hot-runtime-closure-v1/terminal-hot-runtime-closure-validation-v1.json",
  // lane-root contracts the libraries assert before serving a single row
  "corpus-refinement-v1/compact-c0-contract-v1.json",
  "corpus-refinement-v1/compact-c0-contract-validation-v1.json",
  "corpus-refinement-v1/compact-c0-script-surface-amendment-v2.json",
  "corpus-refinement-v1/script-surface-amendments-validation-v2.json",
  "corpus-refinement-v1/federated-terminal-reader-contract-v1.json",
  "corpus-refinement-v1/federated-terminal-reader-contract-validation-v1.json",
  "corpus-refinement-v1/federated-terminal-reader-generation-9-contract-v1.json",
  "corpus-refinement-v1/federated-terminal-reader-antijoin-amendment-v2.json",
  "corpus-refinement-v1/federated-terminal-reader-antijoin-amendment-validation-v2.json",
  "corpus-refinement-v1/federation-classic-compact-tranche-contract-v1.json",
  "corpus-refinement-v1/federation-native-binary-adapter-contract-v1.json",
  "corpus-refinement-v1/federation-physical-body-allocation-contract-v1.json",
  "corpus-refinement-v1/federation-pleias-direct-adapter-contract-v1.json",
  "corpus-refinement-v1/federation-wikimedia-compact-contract-v1.json",
  "corpus-refinement-v1/research-storage-classification-v1.json",
  "corpus-refinement-v1/research-storage-classification-validation-v1.json",
  "corpus-refinement-v1/storage-lifecycle-completion-contract-v1.json",
  "corpus-refinement-v1/storage-lifecycle-completion-contract-validation-v1.json",
  "corpus-refinement-v1/storage-lifecycle-policy-v2.json",
  "corpus-refinement-v1/storage-lifecycle-policy-validation-v2.json",
  "corpus-refinement-v1/storage-policy-v1.json",
  "corpus-refinement-v1/storage-policy-validation-v1.json",
  "corpus-refinement-v1/terminal-compact-generation-amendment-v2.json",
  "corpus-refinement-v1/terminal-compact-generation-contract-v1.json",
  "corpus-refinement-v1/terminal-compact-generation-contract-validation-v1.json",
  "corpus-refinement-v1/terminal-current-reader-pointer-contract-v1.json",
  "corpus-refinement-v1/terminal-current-reader-pointer-contract-validation-v1.json",
  "corpus-refinement-v1/terminal-occurrence-binding-run-amendment-v2.json",
  "corpus-refinement-v1/terminal-occurrence-binding-run-amendment-validation-v2.json",
  "corpus-refinement-v1/terminal-occurrence-binding-run-contract-v1.json",
  "corpus-refinement-v1/terminal-occurrence-binding-run-contract-validation-v1.json",
  "corpus-refinement-v1/terminal-reader-contract-v1.json",
  "corpus-refinement-v1/terminal-reader-contract-validation-v1.json",
  "corpus-refinement-v1/terminal-reader-evidence-amendment-v2.json",
  "corpus-refinement-v1/terminal-reader-evidence-amendment-validation-v2.json",
  "corpus-refinement-v1/terminal-reader-sparse-binding-amendment-v3.json",
  "corpus-refinement-v1/terminal-reader-sparse-binding-amendment-validation-v3.json",
  "corpus-refinement-v1/terminal-segment-binding-adapter-contract-v1.json",
  "corpus-refinement-v1/terminal-segment-binding-adapter-contract-validation-v1.json",
  "corpus-refinement-v1/terminal-segment-binding-adapter-ordinal-amendment-v2.json",
  "corpus-refinement-v1/terminal-segment-binding-adapter-ordinal-amendment-validation-v2.json",
  "corpus-refinement-v1/terminal-y-location-amendment-v3.json",
  "corpus-refinement-v1/terminal-y-location-amendment-validation-v3.json",
  "corpus-refinement-v1/three-lane-script-expectation-adjudication-v1.json",
  "corpus-refinement-v1/three-lane-script-expectation-adjudication-validation-v1.json",
  "corpus-refinement-v1/whole-workspace-storage-plan-v1.json",
  "corpus-refinement-v1/whole-workspace-storage-plan-validation-v1.json",
  // the federation candidate the generation-9 index reaches for
  "corpus-refinement-v1/output/federation-wikimedia-compact-candidate-v1/federation-wikimedia-compact-shard-index-v1.csv",
  "corpus-refinement-v1/output/federation-wikimedia-compact-candidate-v1/federation-wikimedia-compact-summary-v1.json",
  "corpus-refinement-v1/output/federation-wikimedia-compact-candidate-v1/rights-profiles-v1.csv",
  // the additive chain head the pilot library reads
  "rebuild-c0-w/control/current-additive-chain-head-v0.json",
  "rebuild-c0-w/control/current-mishkan-corpus-state-v0.json",
];

const csv = (text) => {
  const lines = text.split("\n").filter(Boolean);
  const head = lines[0].split(",");
  return lines.slice(1).map((l) => Object.fromEntries(l.split(",").map((v, i) => [head[i], v])));
};
const readCsv = (p) => csv(readFileSync(p, "utf8"));
const readCsvGz = (p) => csv(gunzipSync(readFileSync(p)).toString("utf8"));

if (phase === "1") {
  BOOTSTRAP.forEach((p) => console.log(toDevice(p)));
  process.stderr.write(`phase 1: ${BOOTSTRAP.length} files (bootstrap set)\n`);
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Phase 2 — resolved from the indexes now present in the mirror.
// ---------------------------------------------------------------------------
const ranges = args("--range").map((r) => {
  const [a, b] = r.split("-").map(Number);
  if (!Number.isInteger(a) || !Number.isInteger(b) || b < a) throw new Error(`bad --range ${r}`);
  return [a, b];
});
if (!ranges.length) throw new Error("--range A-B is required in phase 2");

const compactIndexPath = join(mirror, "corpus-refinement-v1/output/terminal-compact-composite-v1/terminal-compact-shard-index-v1.csv");
const sparseIndexPath = join(mirror, "corpus-refinement-v1/output/terminal-reader-sparse-binding-index-v1/terminal-reader-sparse-binding-shard-index-v1.csv");
for (const p of [compactIndexPath, sparseIndexPath])
  if (!existsSync(p)) throw new Error(`PHASE_1_NOT_STAGED — ${p} is missing; run phase 1 first`);

const compact = readCsv(compactIndexPath);
const sparse = readCsv(sparseIndexPath);
const wanted = new Set();
const notes = [];

for (const [lo, hi] of ranges) {
  // the compact shard, and everything the index says rides with it
  const shards = compact.filter((r) => Number(r.first_c0_numeric_id) <= hi && Number(r.last_c0_numeric_id) >= lo);
  if (!shards.length) throw new Error(`NO_COMPACT_SHARD_COVERS ${lo}-${hi} — the installed chain does not carry this span`);
  for (const s of shards) {
    for (const col of ["codec_manifest_path", "codec_occurrences_path", "codec_forms_path", "location_authority_path", "script_authority_path"])
      if (s[col]) wanted.add(s[col]);
    notes.push(`${lo}-${hi} → compact shard ${s.terminal_shard_ordinal} (${Number(s.row_count).toLocaleString()} rows)`);
  }

  // the runs shard, which is the only sparse dataset keyed by C0
  const runs = sparse.filter((r) => r.dataset === "runs" && Number(r.first_c0_numeric_id) <= hi && Number(r.last_c0_numeric_id) >= lo);
  if (!runs.length) throw new Error(`NO_RUNS_SHARD_COVERS ${lo}-${hi}`);

  // units and representations are keyed by ordinal, so the ordinals have to be
  // read out of the runs rows rather than guessed from the C0 range
  const unitOrdinals = new Set(), repOrdinals = new Set();
  for (const r of runs) {
    wanted.add(r.path);
    const p = join(mirror, r.path);
    if (!existsSync(p)) { notes.push(`runs shard ${r.shard_ordinal} not staged yet — rerun phase 2 after staging it`); continue; }
    for (const row of readCsvGz(p)) {
      const first = Number(row.first_c0_numeric_id);
      const last = first + Number(row.row_count) - 1;
      if (last < lo || first > hi) continue;
      unitOrdinals.add(Number(row.terminal_unit_ordinal));
      repOrdinals.add(Number(row.terminal_representation_ordinal));
    }
  }
  const byOrdinal = (dataset, ordinals) => {
    for (const s of sparse.filter((r) => r.dataset === dataset)) {
      const f = Number(s.first_ordinal), l = Number(s.last_ordinal);
      for (const o of ordinals) if (o >= f && o <= l) { wanted.add(s.path); break; }
    }
  };
  byOrdinal("units", unitOrdinals);
  byOrdinal("representations", repOrdinals);
  notes.push(`${lo}-${hi} → ${unitOrdinals.size.toLocaleString()} unit ordinals, ${repOrdinals.size} representation ordinals`);
}

[...wanted].sort().forEach((p) => console.log(toDevice(p)));
notes.forEach((n) => process.stderr.write(`  ${n}\n`));
process.stderr.write(`phase 2: ${wanted.size} files for ${ranges.length} range(s)\n`);
