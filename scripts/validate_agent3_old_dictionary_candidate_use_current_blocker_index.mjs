#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input: 'reports/agent3-old-dictionary-candidate-use-current-blocker-index-2026-06-06.json',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(artifact.artifact_type === 'agent3_old_dictionary_candidate_use_current_blocker_index', 'artifact_type mismatch');
expect(artifact.status === 'evidence-ready', 'status must be evidence-ready');

const boundary = artifact.authority_boundary || {};
for (const key of ['linkage_navigation_only', 'current_blocker_index_only', 'no_new_acceptance_or_release_claim']) {
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
const rows = artifact.blocker_rows || [];
expect(rows.length === counts.blocker_rows, 'blocker row length mismatch');
expect(counts.blocker_rows === 8, 'expected 8 blocker rows');
expect(counts.observed_blocker_rows === 8, 'expected 8 observed blocker rows');
expect(counts.unobserved_blocker_rows === 0, 'expected 0 unobserved blocker rows');
expect(counts.affected_candidate_use_rows === 78, 'expected 78 affected rows');
expect(counts.affected_candidate_use_occurrences === 1461, 'expected 1461 affected occurrences');
expect(counts.source_citation_missing_rows === 78, 'expected 78 missing source-citation rows');
expect(counts.transform_rule_missing_rows === 78, 'expected 78 missing transform-rule rows');
expect(counts.gate_proof_missing_rows === 2, 'expected 2 missing gate-proof rows');
expect(counts.route_recheck_required_rows === 1, 'expected 1 route recheck required row');
expect(counts.agent6_zero_text_preserved_blockers === 10, 'expected 10 Agent 6 preserved blockers');
expect(counts.source_rid_references === 393, 'expected 393 source RID refs');
expect(counts.unique_source_rids === 344, 'expected 344 unique source RIDs');

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

const expectedBlockers = new Set([
  'missing_source_field::source_citation_or_url',
  'missing_transform_output_proposal_matrix_or_exact_transform_rule',
  'missing_transform_rule::proposed_candidate_text_proposed_definition_text_proposed_lemma_text_proposed_reader_hint_text',
  'next_transform_output_or_candidate_text_boundary_not_supplied',
  'candidate_text_blocked',
  'missing_agent4_gate_proof_for_boundary_chain_crossmatch',
  'missing_agent4_gate_proof_for_source_citation_dependency_crossmatch',
  'recheck_required_current_registry_contradicts_older_route_blocker',
]);

for (const row of rows) {
  expect(expectedBlockers.has(row.blocker_id), `unexpected blocker ${row.blocker_id}`);
  expect(row.observed_in_sources === true, `${row.blocker_id} must be observed in sources`);
  expect(row.evidence_role === 'current_blocker_navigation_only_no_acceptance_claim', `${row.blocker_id} evidence role mismatch`);
  expect(row.affected_rows > 0, `${row.blocker_id} affected_rows must be nonzero`);
  for (const source of row.source_artifacts || []) {
    expect(fs.existsSync(path.resolve(root, source)), `${row.blocker_id} source artifact missing: ${source}`);
  }
}
expect(new Set(rows.map((row) => row.blocker_id)).size === expectedBlockers.size, 'blocker IDs must be unique and complete');

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(
  `Agent 3 current blocker index passed: rows=${counts.blocker_rows} affected=${counts.affected_candidate_use_rows}/${counts.affected_candidate_use_occurrences}`,
);

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log('Usage: node scripts/validate_agent3_old_dictionary_candidate_use_current_blocker_index.mjs [--input=PATH]');
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
