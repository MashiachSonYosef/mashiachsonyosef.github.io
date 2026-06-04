#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent3-orot-169-row-route-card-candidate-card-dedupe-review-2026-06-04.json';
const artifact = readJson(artifactPath);
const issues = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(artifact.artifact_type === 'agent3_orot_169_row_route_card_candidate_card_dedupe_review', 'unexpected artifact_type');
expect(artifact.status === 'evidence-ready_with_exact_linkage_blockers', 'unexpected status');
expect(artifact.publication_state === 'blocked_no_render', 'publication_state must be blocked_no_render');
expect(artifact.scope?.no_broad_discovery === true, 'scope.no_broad_discovery must be true');

expectCount('rows', 169);
expectCount('occurrences', 2148);
expectCount('unique_token_ids', 169);
expectCount('duplicate_keys', 169);
expectCount('unique_duplicate_keys', 169);
expectCount('duplicate_key_collision_groups', 0);
expectCount('rows_with_route_card_count_evidence', 169);
expectCount('rows_with_candidate_card_count_evidence', 169);
expectCount('route_card_count_total', 7476);
expectCount('candidate_card_count_total', 559);
expectCount('ambiguity_card_count_total', 203);
expectCount('package_anchor_matched_rows', 1);
expectCount('package_anchor_matched_occurrences', 31);
expectCount('exact_blocker_rows', 168);
expectCount('exact_blocker_occurrences', 2117);
expectCount('detailed_card_payload_rows', 0);
expectCount('detailed_card_payload_schema_blocked_rows', 169);

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
expect(rows.length === 169, `rows array must contain 169 rows, found ${rows.length}`);
const tokenIds = new Set();
const duplicateKeys = new Set();
let blockerRows = 0;
let blockerOccurrences = 0;
let anchorRows = 0;
for (const [index, row] of rows.entries()) {
  const context = `rows[${index}]`;
  for (const field of ['token_id', 'queue_id', 'surface', 'normalized', 'duplicate_key', 'dedupe_review_status']) {
    expect(Boolean(row[field]), `${context}.${field} missing`);
  }
  tokenIds.add(row.token_id);
  duplicateKeys.add(row.duplicate_key);
  expect(row.mutation_allowed_here === false, `${context}.mutation_allowed_here must be false`);
  expect(row.public_emit_allowed_here === false, `${context}.public_emit_allowed_here must be false`);
  expect(row.answer_eligible_now === false, `${context}.answer_eligible_now must be false`);
  expect(row.definition_text_stored_now === false, `${context}.definition_text_stored_now must be false`);
  expect(row.accepted_text_now === false, `${context}.accepted_text_now must be false`);
  expect(Number(row.route_card_evidence?.count || 0) > 0, `${context}.route_card_evidence.count must be positive`);
  expect(Number(row.candidate_card_evidence?.count || 0) > 0, `${context}.candidate_card_evidence.count must be positive`);
  if (row.package_anchor_evidence?.status === 'package_anchor_present') anchorRows += 1;
  if ((row.exact_blockers || []).includes('missing_package_anchor_evidence')) {
    blockerRows += 1;
    blockerOccurrences += Number(row.occurrences || 0);
  }
}
expect(tokenIds.size === 169, `expected 169 unique token ids, found ${tokenIds.size}`);
expect(duplicateKeys.size === 169, `expected 169 unique duplicate keys, found ${duplicateKeys.size}`);
expect(anchorRows === 1, `expected 1 package-anchor row, found ${anchorRows}`);
expect(blockerRows === 168, `expected 168 missing package-anchor blocker rows, found ${blockerRows}`);
expect(blockerOccurrences === 2117, `expected 2117 blocker occurrences, found ${blockerOccurrences}`);

for (const gate of artifact.gates || []) {
  expect(gate.status === 'passed', `gate ${gate.id} must pass`);
}

const serialized = JSON.stringify(artifact);
for (const forbidden of ['candidate_counterpart_text', 'counterpart_text']) {
  expect(!serialized.includes(`"${forbidden}"`), `forbidden payload field copied: ${forbidden}`);
}

if (issues.length) {
  console.error('Agent 3 Orot route-card/candidate-card dedupe review validation failed:');
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 3 Orot route-card/candidate-card dedupe review validation passed: rows ${rows.length}; blocker rows ${blockerRows}; duplicate keys ${duplicateKeys.size}`);

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
