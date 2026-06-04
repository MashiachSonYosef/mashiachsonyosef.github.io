#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent3-deuteronomy-linkage-dedupe-source-route-matrix-2026-06-04.json';
const artifact = readJson(artifactPath);
const issues = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(artifact.artifact_type === 'agent3_deuteronomy_phase2_linkage_dedupe_source_route_matrix', 'unexpected artifact_type');
expect(artifact.status === 'evidence-ready_with_exact_blockers', 'unexpected status');
expect(artifact.publication_state === 'blocked_no_render', 'publication_state must be blocked_no_render');

expectCount('rows', 8113);
expectCount('occurrences', 12595);
expectCount('token_index_forms', 8113);
expectCount('token_index_occurrences', 12595);
expectCount('occurrence_units', 956);
expectCount('source_units', 956);
expectCount('manifest_chunks', 9);
expectCount('joined_token_index_rows', 8113);
expectCount('missing_token_index_join_rows', 0);
expectCount('safe_claim_rows', 1334);
expectCount('safe_claim_occurrences', 2964);
expectCount('below_safe_min60_rows', 1594);
expectCount('below_safe_min60_occurrences', 2922);
expectCount('unresolved_rows', 5185);
expectCount('unresolved_occurrences', 6709);
expectCount('downstream_boundary_rows', 1334);
expectCount('downstream_boundary_occurrences', 2964);
expectCount('exact_blocker_rows', 6779);
expectCount('exact_blocker_occurrences', 9631);
expectCount('duplicate_keys', 8113);
expectCount('unique_duplicate_keys', 8113);
expectCount('duplicate_key_collision_groups', 0);

for (const key of [
  'public_hud_rows',
  'route_jsonl_rows',
  'route_shard_writes',
  'runtime_files_changed',
  'source_files_changed',
  'token_index_files_changed',
  'lexical_payload_files_changed',
  'definition_content_rows',
  'nc_definition_content_rows',
  'answer_rows',
  'accepted_text_rows',
]) {
  expectCount(key, 0);
}

const rows = Array.isArray(artifact.rows) ? artifact.rows : [];
expect(rows.length === 8113, `rows array expected 8113, found ${rows.length}`);
const duplicateKeys = new Set();
let blockerRows = 0;
let blockerOccurrences = 0;
let downstreamRows = 0;
let downstreamOccurrences = 0;
for (const [index, row] of rows.entries()) {
  const context = `rows[${index}]`;
  for (const field of ['token_index_id', 'clicked_surface_form', 'normalized_form', 'export_status', 'route_bucket', 'duplicate_key']) {
    expect(Boolean(row[field]), `${context}.${field} missing`);
  }
  duplicateKeys.add(row.duplicate_key);
  expect(row.token_index_join_status === 'joined', `${context}.token_index_join_status must be joined`);
  expect(row.mutation_allowed_here === false, `${context}.mutation_allowed_here must be false`);
  expect(row.public_emit_allowed_here === false, `${context}.public_emit_allowed_here must be false`);
  expect(row.answer_eligible_now === false, `${context}.answer_eligible_now must be false`);
  expect(row.definition_text_stored_now === false, `${context}.definition_text_stored_now must be false`);
  expect(row.accepted_text_now === false, `${context}.accepted_text_now must be false`);
  if ((row.exact_blockers || []).length > 0) {
    blockerRows += 1;
    blockerOccurrences += Number(row.occurrence_count || 0);
  }
  if (row.downstream_boundary === 'agent2_agent6_required_before_transform') {
    downstreamRows += 1;
    downstreamOccurrences += Number(row.occurrence_count || 0);
  }
}
expect(duplicateKeys.size === 8113, `duplicate keys expected 8113 unique, found ${duplicateKeys.size}`);
expect(blockerRows === 6779, `blocker rows expected 6779, found ${blockerRows}`);
expect(blockerOccurrences === 9631, `blocker occurrences expected 9631, found ${blockerOccurrences}`);
expect(downstreamRows === 1334, `downstream rows expected 1334, found ${downstreamRows}`);
expect(downstreamOccurrences === 2964, `downstream occurrences expected 2964, found ${downstreamOccurrences}`);

for (const gate of artifact.gates || []) {
  expect(gate.status === 'passed', `gate ${gate.id} must pass`);
}

const serialized = JSON.stringify(artifact);
for (const forbidden of ['safe_rendering_options', 'accepted_text_value', 'definition_payload']) {
  expect(!serialized.includes(`"${forbidden}"`), `forbidden payload field copied: ${forbidden}`);
}

if (issues.length) {
  console.error('Agent 3 Deuteronomy phase-2 matrix validation failed:');
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 3 Deuteronomy phase-2 matrix validation passed: rows ${rows.length}; blockers ${blockerRows}; downstream ${downstreamRows}`);

function expectCount(key, expected) {
  const actual = Number(artifact.counts?.[key]);
  expect(actual === expected, `counts.${key} expected ${expected}, found ${actual}`);
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}
