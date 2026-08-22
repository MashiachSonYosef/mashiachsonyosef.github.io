#!/usr/bin/env node
// plan-work-shards-v1 · everything one work needs, computed, never typed
//
// The gen-9 store is sharded on work boundaries, so serving one work needs a
// small, exact file set. On 2026-08-22 that set was computed by hand for the
// I Kings pair (recorded in data/serve-rebuild-receipt-2026-08-22.json); this
// tool is that computation, so adding a work is one command, not an
// afternoon of index reading.
//
// Given a work id, it reads the identity bridge for the work's exact c0
// envelope and unit count, the composite shard index for the codec shard
// files covering that envelope, and the sparse binding index for the runs /
// representations / units / extensions shards its ordinals touch. It prints:
//   · the c0 range, unit count, and B/N identity (the typed_awaiting_ledger
//     values, read from the record instead of retyped)
//   · every file to stage, with recorded bytes, ready for the file bridge
//   · the serve command to run once they are staged
// It writes nothing and serves nothing — it is the shopping list, with every
// value copied from a sealed index.
//
//   --work        work id, e.g. tanakh/i-kings                    (required)
//   --bridge      identity bridge csv.gz                          (required)
//   --workspace   corpus root holding corpus-refinement-v1/       (required)
//   --json        also print the result as JSON on one line
//
// Run: node tools/plan-work-shards-v1.mjs --work <id> --bridge <file> --workspace <dir>
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";

const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > 0 ? process.argv[i + 1] : d; };
const WORK = arg("work");
const BRIDGE = arg("bridge");
const WS = arg("workspace");
for (const [f, v] of [["--work", WORK], ["--bridge", BRIDGE], ["--workspace", WS]])
  if (!v) { console.error(`MISSING_ARG ${f}`); process.exit(2); }

// ---- the work's own envelope, from the bridge -----------------------------
const bt = gunzipSync(readFileSync(BRIDGE)).toString("utf8");
const bl = bt.split("\n").filter(Boolean);
const bh = bl[0].split(",");
const bc = Object.fromEntries(bh.map((h, i) => [h.trim(), i]));
for (const need of ["work_id", "unit_id", "c0_rows", "min_c0_numeric_id", "max_c0_numeric_id", "b_id", "n_id"])
  if (bc[need] === undefined) { console.error(`BRIDGE_MISSING_COLUMN ${need}`); process.exit(2); }
let units = 0, c0Rows = 0, lo = Infinity, hi = -Infinity, bId = null, nId = null;
for (let i = 1; i < bl.length; i++) {
  const f = bl[i].split(",");
  if (f[bc.work_id] !== WORK) continue;
  units += 1;
  c0Rows += Number(f[bc.c0_rows]) || 0;
  lo = Math.min(lo, Number(f[bc.min_c0_numeric_id]));
  hi = Math.max(hi, Number(f[bc.max_c0_numeric_id]));
  bId = bId || f[bc.b_id]; nId = nId || f[bc.n_id];
}
if (!units) { console.error(`WORK_NOT_IN_BRIDGE ${WORK} — it enters through the corpus lane's admission, not here`); process.exit(1); }
const contiguous = hi - lo + 1 === c0Rows;

// ---- codec shards covering the envelope, from the composite index ---------
const CIDX = join(WS, "corpus-refinement-v1", "output", "terminal-compact-composite-v1", "terminal-compact-shard-index-v1.csv");
const files = []; // {path, bytes|null, why}
const add = (path, bytes, why) => { if (path && !files.some((x) => x.path === path)) files.push({ path, bytes: bytes ?? null, why }); };
const cl = readFileSync(CIDX, "utf8").split("\n").filter(Boolean);
const ch = cl[0].split(",");
const cc = Object.fromEntries(ch.map((h, i) => [h.trim(), i]));
for (let i = 1; i < cl.length; i++) {
  const f = cl[i].split(",");
  const flo = Number(f[cc.first_c0_numeric_id]);
  const fhi = flo + (Number(f[cc.row_count]) || 0) - 1;
  if (fhi < lo || flo > hi) continue;
  add(f[cc.codec_manifest_path], Number(f[cc.codec_manifest_bytes]), "codec manifest");
  add(f[cc.codec_occurrences_path], Number(f[cc.codec_occurrences_bytes]), "occurrences");
  add(f[cc.codec_forms_path], Number(f[cc.codec_forms_bytes]), "forms");
  add(f[cc.location_authority_path] ?? f[cc.unit_authority_path], Number(f[cc.location_authority_bytes] ?? f[cc.unit_authority_bytes]) || null, "location/unit authority");
  add(f[cc.script_authority_path], null, "script authority");
}

// ---- sparse shards the runs reference, from the sparse index --------------
const SIDX = join(WS, "corpus-refinement-v1", "output", "terminal-reader-sparse-binding-index-v1", "terminal-reader-sparse-binding-shard-index-v1.csv");
const sl = readFileSync(SIDX, "utf8").split("\n").filter(Boolean);
const sh = sl[0].split(",");
const sc = Object.fromEntries(sh.map((h, i) => [h.trim(), i]));
const sparseRows = sl.slice(1).map((l) => l.split(","));
const runShards = sparseRows.filter((r) => r[sc.dataset] === "runs"
  && !(Number(r[sc.last_c0_numeric_id]) < lo || Number(r[sc.first_c0_numeric_id]) > hi));
for (const r of runShards) add(r[sc.path], Number(r[sc.bytes]), "sparse runs");

// The dictionary ordinals those runs reference are inside the runs shards
// themselves; when a runs shard is already staged locally, resolve them now,
// otherwise say plainly that a second pass is needed after staging.
const need = { representations: new Set(), units: new Set(), extensions: new Set() };
let resolvedOrdinals = true;
for (const r of runShards) {
  const abs = join(WS, r[sc.path]);
  if (!existsSync(abs)) { resolvedOrdinals = false; continue; }
  const rt = gunzipSync(readFileSync(abs)).toString("utf8");
  const rl = rt.split("\n").filter(Boolean);
  const rh = rl[0].split(",");
  const rc = Object.fromEntries(rh.map((h, i) => [h.trim(), i]));
  for (let i = 1; i < rl.length; i++) {
    const f = rl[i].split(",");
    const flo = Number(f[rc.first_c0_numeric_id]);
    const fhi = flo + (Number(f[rc.row_count]) || 0) - 1;
    if (fhi < lo || flo > hi) continue;
    need.representations.add(Number(f[rc.terminal_representation_ordinal]));
    need.units.add(Number(f[rc.terminal_unit_ordinal]));
    const e = Number(f[rc.terminal_location_extension_ordinal]); if (e) need.extensions.add(e);
  }
}
if (resolvedOrdinals) {
  for (const r of sparseRows) {
    const ds = r[sc.dataset];
    if (!(ds in need)) continue;
    const fo = Number(r[sc.first_ordinal]), lo2 = Number(r[sc.last_ordinal]);
    for (const o of need[ds]) if (o >= fo && o <= lo2) { add(r[sc.path], Number(r[sc.bytes]), `sparse ${ds}`); break; }
  }
}

// ---- the fixed authorities every serve verifies ---------------------------
const AUTH = [
  ["corpus-refinement-v1/src/lib-v1.mjs", "serve library"],
  ["corpus-refinement-v1/src/current-additive-compact-pilot-lib-v1.mjs", "csv streaming"],
  ["corpus-refinement-v1/src/compact-shard-codec-v1.mjs", "codec"],
  ["corpus-refinement-v1/src/query-current-terminal-reader-v1.mjs", "sealed oracle CLI"],
  ["corpus-refinement-v1/output/terminal-compact-composite-v1/terminal-compact-composite-validation-seal-v1.json", "compact seal"],
  ["corpus-refinement-v1/output/terminal-compact-composite-v1/terminal-compact-shard-index-v1.csv", "compact index"],
  ["corpus-refinement-v1/output/terminal-binding-composite-v1/terminal-binding-composite-validation-seal-v1.json", "binding seal"],
  ["corpus-refinement-v1/output/terminal-reader-sparse-binding-index-v1/terminal-reader-sparse-binding-index-validation-seal-v1.json", "sparse seal"],
  ["corpus-refinement-v1/output/terminal-reader-sparse-binding-index-v1/terminal-reader-sparse-binding-shard-index-v1.csv", "sparse index"],
  ["corpus-refinement-v1/output/terminal-rights-profile-catalog-v2/terminal-rights-profile-catalog-v2.csv", "rights catalog"],
  ["corpus-refinement-v1/output/terminal-script-profile-catalog-v1/terminal-script-profile-catalog-v1.csv", "script catalog"],
  ["corpus-refinement-v1/output/federated-terminal-reader-generation-9-v1/rollback/current-terminal-reader-generation-8-pointer-v1.json", "g8 pointer"],
  // The sealed oracle CLI verifies its whole authority chain before answering
  // one id. This set was walked dependency-by-dependency on 2026-08-22 until
  // the CLI returned FOUND_EXACT in the cloud container; without it, serve
  // runs oracle-off and build-zone refuses the serve.
  ["corpus-refinement-v1/src/query-terminal-reader-v1.mjs", "oracle: query implementation"],
  ["corpus-refinement-v1/output/terminal-current-reader-generation-v1/terminal-current-reader-generation-v1.json", "oracle: generation state"],
  ["corpus-refinement-v1/output/terminal-restoration-probe-v1/terminal-restoration-probe-validation-seal-v1.json", "oracle: restoration seal"],
  ["corpus-refinement-v1/output/terminal-reader-validation-v2/terminal-reader-validation-seal-v2.json", "oracle: reader seal"],
  ["corpus-refinement-v1/output/terminal-hot-runtime-closure-v1/terminal-hot-runtime-closure-summary-v1.json", "oracle: hot-runtime summary"],
  ["corpus-refinement-v1/output/terminal-hot-runtime-closure-v1/terminal-hot-runtime-closure-validation-v1.json", "oracle: hot-runtime validation"],
  ["corpus-refinement-v1/output/terminal-hot-runtime-closure-v1/terminal-hot-runtime-closure-v1.csv", "oracle: hot-runtime closure"],
  ["corpus-refinement-v1/output/terminal-cutover-plan-v1/terminal-cutover-plan-v1.json", "oracle: cutover plan"],
  ["corpus-refinement-v1/output/terminal-cutover-plan-v1/terminal-cutover-plan-validation-v1.json", "oracle: cutover validation"],
  ["corpus-refinement-v1/output/terminal-cutover-plan-v1/proposed-terminal-reader-pointer-v1.json", "oracle: proposed pointer"],
  ["corpus-refinement-v1/output/terminal-current-pointer-hostiles-v1/terminal-current-pointer-hostiles-v1.json", "oracle: pointer hostiles"],
  ["corpus-refinement-v1/terminal-current-reader-pointer-contract-v1.json", "oracle: pointer contract"],
  ["corpus-refinement-v1/terminal-current-reader-pointer-contract-validation-v1.json", "oracle: pointer contract validation"],
  ["corpus-refinement-v1/terminal-reader-contract-v1.json", "oracle: reader contract"],
  ["corpus-refinement-v1/terminal-reader-contract-validation-v1.json", "oracle: reader contract validation"],
  ["corpus-refinement-v1/terminal-reader-evidence-amendment-v2.json", "oracle: evidence amendment"],
  ["corpus-refinement-v1/terminal-reader-evidence-amendment-validation-v2.json", "oracle: evidence amendment validation"],
  ["corpus-refinement-v1/terminal-reader-sparse-binding-amendment-v3.json", "oracle: sparse amendment"],
  ["corpus-refinement-v1/terminal-reader-sparse-binding-amendment-validation-v3.json", "oracle: sparse amendment validation"],
  ["corpus-refinement-v1/terminal-occurrence-binding-run-contract-v1.json", "oracle: binding-run contract"],
  ["corpus-refinement-v1/terminal-occurrence-binding-run-contract-validation-v1.json", "oracle: binding-run validation"],
  ["corpus-refinement-v1/terminal-occurrence-binding-run-amendment-v2.json", "oracle: binding-run amendment"],
  ["corpus-refinement-v1/terminal-occurrence-binding-run-amendment-validation-v2.json", "oracle: binding-run amendment validation"],
  ["corpus-refinement-v1/terminal-segment-binding-adapter-contract-v1.json", "oracle: segment adapter contract"],
  ["corpus-refinement-v1/terminal-segment-binding-adapter-contract-validation-v1.json", "oracle: segment adapter validation"],
  ["corpus-refinement-v1/terminal-segment-binding-adapter-ordinal-amendment-v2.json", "oracle: segment ordinal amendment"],
  ["corpus-refinement-v1/terminal-segment-binding-adapter-ordinal-amendment-validation-v2.json", "oracle: segment ordinal validation"],
  ["corpus-refinement-v1/terminal-y-location-amendment-v3.json", "oracle: y-location amendment"],
  ["corpus-refinement-v1/terminal-y-location-amendment-validation-v3.json", "oracle: y-location validation"],
  ["corpus-refinement-v1/terminal-compact-generation-contract-v1.json", "oracle: compact generation contract"],
  ["corpus-refinement-v1/terminal-compact-generation-contract-validation-v1.json", "oracle: compact generation validation"],
  ["corpus-refinement-v1/terminal-compact-generation-amendment-v2.json", "oracle: compact generation amendment"],
  ["corpus-refinement-v1/compact-c0-contract-v1.json", "oracle: compact c0 contract"],
  ["corpus-refinement-v1/compact-c0-contract-validation-v1.json", "oracle: compact c0 validation"],
  ["corpus-refinement-v1/compact-c0-script-surface-amendment-v2.json", "oracle: script surface amendment"],
  ["corpus-refinement-v1/script-surface-amendments-validation-v2.json", "oracle: script surface validation"],
  ["corpus-refinement-v1/federated-terminal-reader-contract-v1.json", "oracle: federated contract"],
  ["corpus-refinement-v1/federated-terminal-reader-contract-validation-v1.json", "oracle: federated validation"],
  ["corpus-refinement-v1/federated-terminal-reader-antijoin-amendment-v2.json", "oracle: antijoin amendment"],
  ["corpus-refinement-v1/federated-terminal-reader-antijoin-amendment-validation-v2.json", "oracle: antijoin validation"],
  ["corpus-refinement-v1/federated-terminal-reader-generation-9-contract-v1.json", "oracle: generation-9 contract"],
  ["corpus-refinement-v1/three-lane-script-expectation-adjudication-v1.json", "oracle: script adjudication"],
  ["corpus-refinement-v1/three-lane-script-expectation-adjudication-validation-v1.json", "oracle: script adjudication validation"],
  // Optional but required for full parity with the sealed bins:
  ["ledgers/work/composition-map-v6/w-to-compspan-template-v6.csv.gz", "COMPspan template (build-zone --spans)"],
];
for (const [p, why] of AUTH) add(p, null, why);

const slug = WORK.split("/").pop();
const out = {
  work_id: WORK, published_as_by_rule: slug,
  typed_awaiting_ledger_values: { title_en: "(a descriptor, not derived — write it plainly)", c0_first: lo, c0_last: hi, unit_count: units },
  b_n: `${bId} / ${nId}`, c0_rows: c0Rows, contiguous,
  dictionary_ordinals_resolved: resolvedOrdinals,
  files,
  serve_command: `node tools/mishkan-serve-v1.mjs ${lo}-${hi} --workspace <staged-root> --oracle 0 --out serves/${slug}.ndjson`,
};
if (process.argv.includes("--json")) { console.log(JSON.stringify(out)); process.exit(0); }
console.log(`${WORK} · ${bId}/${nId} · ${units.toLocaleString()} units · c0 ${lo.toLocaleString()}–${hi.toLocaleString()} (${c0Rows.toLocaleString()} rows${contiguous ? ", contiguous" : " — NOT CONTIGUOUS, serve the envelope and expect holds"})`);
console.log(`typed_awaiting_ledger values, read from the bridge: c0_first ${lo} · c0_last ${hi} · unit_count ${units}`);
if (!resolvedOrdinals) console.log("NOTE: runs shards are not staged locally yet — stage them, run this again, and the dictionary shard list below completes.");
console.log(`\nfiles to stage (${files.length}):`);
for (const f of files) console.log(`  ${f.path}${f.bytes ? `  (${f.bytes.toLocaleString()} B)` : ""}  · ${f.why}`);
console.log(`\nthen: ${out.serve_command}`);
