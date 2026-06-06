#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input: 'reports/agent3-old-dictionary-candidate-use-row-blocker-matrix-2026-06-06.json',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(artifact.artifact_type === 'agent3_old_dictionary_candidate_use_row_blocker_matrix', 'artifact_type mismatch');
expect(artifact.status === 'evidence-ready', 'status must be evidence-ready');

const boundary = artifact.authority_boundary || {};
for (const key of ['linkage_navigation_only', 'row_blocker_matrix_only', 'no_new_acceptance_or_release_claim']) {
  expect(boundary[key] === true, `authority_boundary.${key} must be true`);
}
for (const key of [
  'qa_acceptance',
  'source_provenance_acceptance',
  'source_license_acceptance',
  'source_legal_acceptance',
  'source_citation_supplied_by_agent3',
  'transform_authority',
  'source_text_read',
  'candidate_text_export',
  'definition_content_storage',
  'lemma_content_storage',
  'reader_hint_content_storage',
  'usage_as_definition_authority',
  'definition_authority',
  'answer_selection',
  'answer_eligibility',
  'route_ranking',
  'publication_readiness',
  'public_runtime_mutation',
  'accepted_gloss_text',
  'release_action',
]) {
  expect(boundary[key] === false, `authority_boundary.${key} must be false`);
}

const counts = artifact.counts || {};
const rows = artifact.matrix_rows || [];
expect(rows.length === counts.row_blocker_matrix_rows, 'matrix row length mismatch');
expect(counts.row_blocker_matrix_rows === 78, 'expected 78 matrix rows');
expect(counts.row_blocker_matrix_occurrences === 1461, 'expected 1461 occurrences');
expect(counts.unique_queue_ids === 78, 'expected 78 unique queue IDs');
expect(counts.unique_token_ids === 78, 'expected 78 unique token IDs');
expect(counts.package_rows_linked === 78, 'expected 78 package links');
expect(counts.preboundary_rows_linked === 78, 'expected 78 preboundary links');
expect(counts.lineage_rows_linked === 78, 'expected 78 lineage links');
expect(counts.dependency_rows_linked === 78, 'expected 78 dependency links');
expect(counts.rows_missing_preboundary === 0, 'expected 0 missing preboundary rows');
expect(counts.rows_missing_lineage === 0, 'expected 0 missing lineage rows');
expect(counts.rows_missing_dependency === 0, 'expected 0 missing dependency rows');
expect(counts.source_rid_references === 393, 'expected 393 source RID references');
expect(counts.unique_source_rids === 344, 'expected 344 unique source RIDs');
expect(counts.rows_with_source_rids === 78, 'expected all rows to have source RIDs');
expect(counts.blocker_links === 780, 'expected 780 row blocker links');
expect(counts.rows_with_current_blockers === 78, 'expected all rows to have blockers');
expect(counts.rows_missing_source_citation === 78, 'expected 78 missing source-citation rows');
expect(counts.rows_missing_transform_rule === 78, 'expected 78 missing transform-rule rows');
expect(counts.rows_route_recheck_required === 78, 'expected 78 route-recheck rows');
expect(counts.rows_gate_proof_boundary_chain_missing === 78, 'expected 78 boundary-chain gate-proof blockers');
expect(counts.rows_gate_proof_source_citation_dependency_missing === 78, 'expected 78 source-citation-dependency gate-proof blockers');
expect(counts.agent6_boundary_required_rows === 78, 'expected 78 Agent 6 boundary-required rows');
expect(counts.pure_partition_rows === 5, 'expected 5 pure partition rows');
expect(counts.overlap_partition_rows === 73, 'expected 73 overlap partition rows');

for (const key of [
  'candidate_text_rows',
  'definition_content_rows',
  'lemma_content_rows',
  'reader_hint_content_rows',
  'answer_rows',
  'answer_eligible_rows',
  'route_jsonl_rows',
  'route_shard_writes',
  'source_text_rows',
  'accepted_text_rows',
  'public_runtime_mutation',
  'export_rows',
  'release_actions',
  'source_acceptance_claims',
  'route_payload_field_hits',
  'forbidden_payload_field_hits',
  'acceptance_claims',
]) {
  expect(counts[key] === 0, `${key} must be zero`);
}

const requiredBlockers = [
  'missing_source_field::source_citation_or_url',
  'missing_transform_output_proposal_matrix_or_exact_transform_rule',
  'missing_transform_rule::proposed_candidate_text_proposed_definition_text_proposed_lemma_text_proposed_reader_hint_text',
  'next_transform_output_or_candidate_text_boundary_not_supplied',
  'candidate_text_blocked',
  'missing_agent4_gate_proof_for_boundary_chain_crossmatch',
  'missing_agent4_gate_proof_for_source_citation_dependency_crossmatch',
  'recheck_required_current_registry_contradicts_older_route_blocker',
  'stale_agent1_registry_target_current_agent1_thread_required',
];

for (const row of rows) {
  expect(row.evidence_role === 'row_blocker_navigation_only_no_text_or_acceptance_claim', `${row.queue_id} evidence role mismatch`);
  expect(row.package_row_linked === true, `${row.queue_id} package link missing`);
  expect(row.preboundary_row_linked === true, `${row.queue_id} preboundary link missing`);
  expect(row.lineage_row_linked === true, `${row.queue_id} lineage link missing`);
  expect(row.dependency_row_linked === true, `${row.queue_id} dependency link missing`);
  expect(row.source_citation_missing === true, `${row.queue_id} source citation should be missing`);
  expect(row.transform_rule_missing === true, `${row.queue_id} transform rule should be missing`);
  expect(row.agent6_boundary_required_before_next_use === true, `${row.queue_id} Agent 6 boundary flag missing`);
  expect(row.current_blocker_count === row.current_blocker_ids.length, `${row.queue_id} blocker count mismatch`);
  for (const blocker of requiredBlockers) {
    expect(row.current_blocker_ids.includes(blocker), `${row.queue_id} missing blocker ${blocker}`);
  }
  expect(row.current_blocker_ids.length >= 9, `${row.queue_id} expected at least 9 blockers`);
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(
  `Agent 3 row blocker matrix passed: rows=${counts.row_blocker_matrix_rows} blockers=${counts.blocker_links}`,
);

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log('Usage: node scripts/validate_agent3_old_dictionary_candidate_use_row_blocker_matrix.mjs [--input=PATH]');
      process.exit(0);
    }
    if (arg.startsWith('--input=')) parsed.input = cleanRelativePath(arg.slice(arg.indexOf('=') + 1));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.resolve(root, relativePath), 'utf8'));
}

function cleanRelativePath(input) {
  const normalized = input.replaceAll('\\', '/');
  if (path.isAbsolute(normalized) || normalized.startsWith('../') || normalized.includes('/../')) {
    throw new Error(`Expected workspace-relative path, got ${input}`);
  }
  return normalized;
}
