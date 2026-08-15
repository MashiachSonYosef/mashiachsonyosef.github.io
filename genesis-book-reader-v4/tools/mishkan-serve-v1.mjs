#!/usr/bin/env node
// mishkan-serve-v1.mjs — website-lane resident reader over the SEALED artifacts.
// Same authorities, same pins, same joins, same output fields as the sealed
// gen-8 CLI (query-terminal-reader-v1.mjs) — but verified ONCE per process and
// served many times. The sealed CLI remains the oracle: --oracle N samples N
// ids and requires field-exact agreement, else exit 1.
//
// Rule id: mishkan-serve-rule-v1-verify-once-serve-many-oracle-checked
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";

const WORKSPACE = process.argv.includes("--workspace")
  ? path.resolve(process.argv[process.argv.indexOf("--workspace") + 1])
  : "/home/claude/mishkan-mirror";
const SRC = path.join(WORKSPACE, "corpus-refinement-v1", "src");
const { LANE_ROOT, parseCsvLine, resolveWorkspace, sha256File } = await import(pathToFileURL(path.join(SRC, "lib-v1.mjs")).href);
const { streamRfc4180Csv } = await import(pathToFileURL(path.join(SRC, "current-additive-compact-pilot-lib-v1.mjs")).href);
const { iterateCompactShardV1 } = await import(pathToFileURL(path.join(SRC, "compact-shard-codec-v1.mjs")).href);

const COMPACT_ROOT = path.join(LANE_ROOT, "output", "terminal-compact-composite-v1");
const COMPACT_SEAL = path.join(COMPACT_ROOT, "terminal-compact-composite-validation-seal-v1.json");
const BINDING_SEAL = path.join(LANE_ROOT, "output", "terminal-binding-composite-v1", "terminal-binding-composite-validation-seal-v1.json");
const COMPACT_INDEX = path.join(COMPACT_ROOT, "terminal-compact-shard-index-v1.csv");
const SPARSE_ROOT = path.join(LANE_ROOT, "output", "terminal-reader-sparse-binding-index-v1");
const SPARSE_SEAL = path.join(SPARSE_ROOT, "terminal-reader-sparse-binding-index-validation-seal-v1.json");
const SPARSE_INDEX = path.join(SPARSE_ROOT, "terminal-reader-sparse-binding-shard-index-v1.csv");
const RIGHTS = path.join(LANE_ROOT, "output", "terminal-rights-profile-catalog-v2", "terminal-rights-profile-catalog-v2.csv");
const SCRIPTS = path.join(LANE_ROOT, "output", "terminal-script-profile-catalog-v1", "terminal-script-profile-catalog-v1.csv");
const SEALED_CLI = path.join(SRC, "query-current-terminal-reader-v1.mjs");
const G8_POINTER = path.join(LANE_ROOT, "output", "federated-terminal-reader-generation-9-v1", "rollback", "current-terminal-reader-generation-8-pointer-v1.json");

const fail = (c, d = "") => { throw new Error(`${c}${d ? `: ${d}` : ""}`); };
const assert = (v, c, d = "") => { if (!v) fail(c, d); };
const number = (v, c) => { const n = Number(v); assert(Number.isSafeInteger(n) && n >= 0, c, String(v)); return n; };
const verified = {};
const verify = (p, label) => { verified[label] = { path: path.relative(WORKSPACE, p).split(path.sep).join("/"), sha256: sha256File(p) }; return p; };
const readSimpleCsv = (p) => {
  const lines = fs.readFileSync(p, "utf8").replace(/^﻿/u, "").split(/\r?\n/u).filter(Boolean);
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((l) => { const v = parseCsvLine(l); assert(v.length === headers.length, "CSV_WIDTH", p); return Object.fromEntries(headers.map((h, i) => [h, v[i]])); });
};

// ---- VERIFY ONCE (same seal/schema/status gates as the sealed CLI) ----
const compactSeal = JSON.parse(fs.readFileSync(verify(COMPACT_SEAL, "compact_seal"), "utf8"));
const bindingSeal = JSON.parse(fs.readFileSync(verify(BINDING_SEAL, "binding_seal"), "utf8"));
const sparseSeal = JSON.parse(fs.readFileSync(verify(SPARSE_SEAL, "sparse_seal"), "utf8"));
assert(compactSeal.schema === "mishkan.corpus_refinement.terminal_compact_composite.validation_seal.v1" && String(compactSeal.status).startsWith("PASS_CLOSED_WORLD"), "COMPACT_SEAL");
assert(bindingSeal.schema === "mishkan.corpus_refinement.terminal_binding_composite.validation_seal.v1" && String(bindingSeal.status).startsWith("PASS_CLOSED_WORLD"), "BINDING_SEAL");
assert(sparseSeal.schema === "mishkan.corpus_refinement.terminal_reader_sparse_binding_index.validation_seal.v1" && String(sparseSeal.status).startsWith("PASS_CLOSED_WORLD"), "SPARSE_SEAL");
const pinFrom = (list, target, code) => {
  const m = (list || []).find((e) => e && typeof e.path === "string" && path.resolve(resolveWorkspace(e.path)) === path.resolve(target));
  assert(m, `${code}_MISSING`, target);
  assert(fs.statSync(target).size === m.bytes && sha256File(target) === m.sha256, `${code}_DRIFT`, m.path);
  verified[code.toLowerCase()] = { path: m.path, sha256: m.sha256 };
};
pinFrom(compactSeal.authorities, COMPACT_INDEX, "COMPACT_INDEX");
pinFrom(sparseSeal.authoritative_files, SPARSE_INDEX, "SPARSE_INDEX");
verify(RIGHTS, "rights_catalog"); verify(SCRIPTS, "script_catalog");

const compactRows = readSimpleCsv(COMPACT_INDEX);
const sparseRows = readSimpleCsv(SPARSE_INDEX);
const sparseByDataset = new Map();
for (const r of sparseRows) { const l = sparseByDataset.get(r.dataset) ?? []; l.push(r); sparseByDataset.set(r.dataset, l); }
for (const l of sparseByDataset.values()) l.sort((a, b) => number(a.first_ordinal, "S") - number(b.first_ordinal, "S"));
const rights = readSimpleCsv(RIGHTS);
const scripts = readSimpleCsv(SCRIPTS);

// ---- caches: sha-verified sparse shards parsed once; codec shards decoded once ----
const sparseCache = new Map();
async function sparseShardRows(shard, code) {
  if (sparseCache.has(shard.path)) return sparseCache.get(shard.path);
  const abs = resolveWorkspace(shard.path);
  assert(fs.existsSync(abs), `${code}_MISSING`, shard.path);
  assert(fs.statSync(abs).size === number(shard.bytes, `${code}_BYTES`) && sha256File(abs) === shard.sha256, `${code}_DRIFT`, shard.path);
  const rows = [];
  for await (const row of streamRfc4180Csv(abs)) rows.push(row);
  sparseCache.set(shard.path, rows);
  return rows;
}
const bisect = (rows, val, lastField) => { let lo = 0, hi = rows.length; while (lo < hi) { const mid = (lo + hi) >>> 1; if (number(rows[mid][lastField], "B") < val) lo = mid + 1; else hi = mid; } return lo; };
async function findOrdinalRow(dataset, ordinal, field) {
  const list = sparseByDataset.get(dataset);
  const i = bisect(list, ordinal, "last_ordinal");
  assert(i < list.length && ordinal >= number(list[i].first_ordinal, "S"), "SPARSE_ORDINAL", `${dataset}:${ordinal}`);
  const rows = await sparseShardRows(list[i], "SPARSE_DICTIONARY_SHARD");
  const row = rows[ordinal - number(list[i].first_ordinal, "S")];
  assert(row && number(row[field], "ORD") === ordinal, "LOOKUP_ORDINAL", `${field}:${ordinal}`);
  return row;
}
async function findBindingRun(id) {
  const list = sparseByDataset.get("runs");
  const i = bisect(list, id, "last_c0_numeric_id");
  assert(i < list.length && id >= number(list[i].first_c0_numeric_id, "S"), "SPARSE_RUN_SHARD", String(id));
  const rows = await sparseShardRows(list[i], "SPARSE_RUN_SHARD");
  let lo = 0, hi = rows.length;
  while (lo < hi) { const mid = (lo + hi) >>> 1; const f = number(rows[mid].first_c0_numeric_id, "F"); const last = f + number(rows[mid].row_count, "C") - 1; if (last < id) lo = mid + 1; else hi = mid; }
  const row = rows[lo];
  assert(row && id >= number(row.first_c0_numeric_id, "F"), "BINDING_RUN", String(id));
  return row;
}
const surfaceCache = new Map(); // shardOrdinal -> Map(id -> surface); one full codec pass per shard (EOF-verified)
async function surfacesForShard(shardOrdinal) {
  if (surfaceCache.has(shardOrdinal)) return surfaceCache.get(shardOrdinal);
  const m = new Map();
  const manifestPath = resolveWorkspace(compactRows[shardOrdinal].codec_manifest_path);
  for await (const occ of iterateCompactShardV1(manifestPath)) m.set(Number(occ.c0NumericId), occ.hebrewForm);
  verified[`codec_shard_${shardOrdinal}`] = { path: compactRows[shardOrdinal].codec_manifest_path, rows: m.size };
  surfaceCache.set(shardOrdinal, m);
  return m;
}
async function serveOne(id) {
  let lo = 0, hi = compactRows.length;
  while (lo < hi) { const mid = (lo + hi) >>> 1; const f = number(compactRows[mid].first_c0_numeric_id, "F"); const last = f + number(compactRows[mid].row_count, "C") - 1; if (last < id) lo = mid + 1; else hi = mid; }
  if (lo >= compactRows.length || id < number(compactRows[lo].first_c0_numeric_id, "F")) return { status: "NOT_FOUND_NUMERIC_GAP_OR_OUT_OF_RANGE", c0_numeric_id: id };
  const surfaces = await surfacesForShard(lo);
  const surface = surfaces.get(id);
  assert(surface !== undefined, "COMPACT_INDEX_OCCURRENCE_MISSING", String(id));
  const run = await findBindingRun(id);
  const [representation, unit] = [
    await findOrdinalRow("representations", number(run.terminal_representation_ordinal, "R"), "terminal_representation_ordinal"),
    await findOrdinalRow("units", number(run.terminal_unit_ordinal, "U"), "terminal_unit_ordinal")
  ];
  const rightsProfile = rights[number(run.rights_profile_ordinal, "RI")];
  const scriptProfile = scripts[number(run.script_profile_ordinal, "SC")];
  assert(representation && unit && rightsProfile && scriptProfile && unit.terminal_representation_ordinal === run.terminal_representation_ordinal, "BINDING_DICTIONARY_JOIN", String(id));
  const extOrd = number(run.terminal_location_extension_ordinal, "E");
  const extension = extOrd === 0 ? null : await findOrdinalRow("extensions", extOrd, "terminal_location_extension_ordinal");
  const tokenOrdinal = number(run.token_ordinal_origin, "T") + id - number(run.first_c0_numeric_id, "F");
  const allowed = new Set(["ALLOW", "ALLOW_WITH_OBLIGATIONS"]);
  const visible = scriptProfile.script_profile_id === "SCRIPT-HEBREW-SQUARE-V1" && allowed.has(rightsProfile.reader_display_axis);
  return {
    status: !visible ? "FOUND_CANONICAL_BUT_EXCLUDED_FROM_HEBREW_READER" : "FOUND_EXACT",
    c0_numeric_id: id,
    exact_surface_form: surface,
    terminal_representation_id: representation.terminal_representation_id,
    terminal_unit_id: unit.terminal_unit_id,
    token_ordinal_in_unit: tokenOrdinal,
    representation: { segment_id: representation.segment_id, local_representation_id: representation.local_representation_id, source_authority_path: representation.source_authority_path, source_authority_sha256: representation.source_authority_sha256, source_row_locator: representation.source_row_locator, source_row_sha256: representation.source_row_sha256 },
    location: { local_unit_id: unit.local_unit_id, location_codec: unit.location_codec, source_authority_path: unit.source_authority_path, source_authority_sha256: unit.source_authority_sha256, source_row_locator: unit.source_row_locator, source_row_sha256: unit.source_row_sha256, extension },
    script_profile_id: scriptProfile.script_profile_id,
    rights_profile_id: rightsProfile.rights_profile_id,
    local_axis: rightsProfile.local_axis,
    reader_display_axis: rightsProfile.reader_display_axis,
    public_distribution_axis: rightsProfile.public_distribution_axis,
    commercial_use_axis: rightsProfile.commercial_use_axis,
    attribution_required: rightsProfile.attribution_required,
    share_alike_required: rightsProfile.share_alike_required,
    noncommercial_required: rightsProfile.noncommercial_required,
    no_derivatives_required: rightsProfile.no_derivatives_required,
    rights_authority: { terminal_resolution_state: rightsProfile.terminal_resolution_state, normalized_license_class: rightsProfile.normalized_license_class, license_version: rightsProfile.license_version, representation_layer: rightsProfile.representation_layer, authority_record_id: rightsProfile.authority_record_id, source_profile_path: rightsProfile.source_profile_path, source_profile_sha256: rightsProfile.source_profile_sha256, source_row_sha256: rightsProfile.source_row_sha256, source_row: JSON.parse(rightsProfile.source_row_json) },
    visible_in_hebrew_reader: visible,
    location_extension: extension,
    query_execution: { memory_posture: "BOUNDED_SPARSE_SHARD_LOOKUP__NO_FULL_RUN_UNIT_OR_EXTENSION_OBJECT_ARRAY", lookup_complexity: "BINARY_SEARCH_SMALL_INDEX_THEN_DECOMPRESS_ONE_AT_MOST_16384_ROW_BLOCK_PER_BINDING_DICTIONARY" }
  };
}

// ---- CLI ----
const rangeArg = process.argv.find((a) => /^\d+-\d+$/.test(a));
const [first, last] = rangeArg.split("-").map(Number);
const out = process.argv[process.argv.indexOf("--out") + 1];
const oracleN = process.argv.includes("--oracle") ? Number(process.argv[process.argv.indexOf("--oracle") + 1]) : 0;
const t0 = Date.now();
const rows = [];
for (let id = first; id <= last; id++) {
  rows.push(await serveOne(id));
  if (rows.length % 2000 === 0) console.error(`served ${rows.length} · ${(rows.length / ((Date.now() - t0) / 1000)).toFixed(0)}/s`);
}
const elapsed = (Date.now() - t0) / 1000;

// ---- oracle check: field-exact vs the SEALED CLI on a deterministic sample ----
let oracleReport = null;
if (oracleN > 0) {
  const picks = new Set([first, last, Math.floor((first + last) / 2)]);
  let seed = 69828900;
  const lcg = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  while (picks.size < oracleN) picks.add(first + Math.floor(lcg() * (last - first + 1)));
  let exact = 0; const mismatches = [];
  for (const id of picks) {
    const cli = spawnSync("node", [SEALED_CLI, "--pointer", G8_POINTER, String(id), "--hebrew-view", "--json"], { encoding: "utf8" });
    const oracleRow = JSON.parse(cli.stdout.trim().split("\n").pop());
    const mine = rows[id - first];
    if (JSON.stringify(oracleRow) === JSON.stringify(mine)) exact++;
    else mismatches.push({ id, oracle: oracleRow, mine });
  }
  oracleReport = { sampled: picks.size, field_exact: exact, mismatches: mismatches.length };
  if (mismatches.length) {
    fs.writeFileSync(out + ".oracle-mismatch.json", JSON.stringify(mismatches.slice(0, 3), null, 1));
    console.error(`ORACLE_MISMATCH on ${mismatches.length}/${picks.size}`);
    process.exit(1);
  }
}
const provenance = {
  walker_rule: "mishkan-serve-rule-v1-verify-once-serve-many-oracle-checked",
  route: "TERMINAL_READER_ARTIFACTS__WEBSITE_LANE_RESIDENT_SERVE",
  sealed_oracle: { module: "corpus-refinement-v1/src/query-current-terminal-reader-v1.mjs", pointer_sha256: sha256File(G8_POINTER), report: oracleReport },
  authorities_verified_once: verified,
  id_count: rows.length, elapsed_seconds: elapsed
};
fs.writeFileSync(out, [JSON.stringify({ provenance }), ...rows.map((r) => JSON.stringify(r))].join("\n") + "\n");
console.error(`DONE · ${rows.length} ids in ${elapsed.toFixed(1)}s (${(rows.length / elapsed).toFixed(0)}/s) · oracle: ${oracleReport ? `${oracleReport.field_exact}/${oracleReport.sampled} field-exact` : "off"}`);
