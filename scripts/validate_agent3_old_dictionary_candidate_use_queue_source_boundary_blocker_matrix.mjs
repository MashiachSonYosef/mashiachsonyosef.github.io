#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input:
    'reports/agent3-old-dictionary-candidate-use-queue-source-boundary-blocker-matrix-2026-06-06.json',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_old_dictionary_candidate_use_queue_source_boundary_blocker_matrix',
  'artifact_type mismatch',
);
expect(artifact.status === 'evidence-ready', 'status must be evidence-ready');

const boundary = artifact.authority_boundary || {};
for (const key of [
  'linkage_navigation_only',
  'boundary_blocker_matrix_only',
  'queue_source_pair_key_is_dedupe_basis',
  'observed_source_families_are_not_selection_or_acceptance',
  'no_new_acceptance_or_release_claim',
]) {
  expect(boundary[key] === true, `authority_boundary.${key} must be true`);
}
for (const key of [
  'qa_acceptance',
  'agent6_acceptance',
  'source_family_selection',
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
const rows = artifact.blocker_matrix_rows || [];
expect(rows.length === counts.blocker_matrix_rows, 'blocker row length mismatch');
expect((artifact.blocker_signature_rows || []).length === counts.blocker_signature_rows, 'blocker signature length mismatch');
expect((artifact.partition_rows || []).length === counts.partition_rows, 'partition rows length mismatch');
expect((artifact.exact_blocker_rows || []).length === counts.exact_blocker_rows, 'exact blocker rows length mismatch');
expect(counts.input_dedupe_key_rows === 363, 'expected 363 input dedupe rows');
expect(counts.input_source_rid_coverage_rows === 314, 'expected 314 source-RID coverage rows');
expect(counts.input_subchain_handoff_entries === 8, 'expected 8 handoff entries');
expect(counts.blocker_matrix_rows === 363, 'expected 363 blocker matrix rows');
expect(counts.unique_queue_source_pair_keys === 363, 'expected 363 unique queue/source keys');
expect(counts.duplicate_queue_source_pair_keys === 0, 'expected zero duplicate queue/source keys');
expect(counts.unique_source_rids === 314, 'expected 314 unique source RIDs');
expect(counts.unique_queue_ids === 65, 'expected 65 unique queues');
expect(counts.partition_rows === 2, 'expected two partition rows');
expect(counts.blocker_signature_rows === 1, 'expected one blocker signature');
expect(counts.exact_blocker_rows === 1, 'expected one exact blocker');
expect(counts.cross_batch_blocker_rows === 163, 'expected 163 cross-batch blocker rows');
expect(counts.single_batch_blocker_rows === 200, 'expected 200 single-batch blocker rows');
expect(counts.source_citation_required_rows === 363, 'expected every row to miss source citation');
expect(counts.source_citation_or_url_present_rows === 0, 'expected zero source citations present');
expect(counts.transform_rule_still_blocked_rows === 363, 'expected every row transform blocked');
expect(counts.agent6_boundary_after_prereq_rows === 363, 'expected every row to preserve later Agent 6 boundary');
expect(counts.source_family_selection_boundary_blocker_rows === 363, 'expected every row source-family blocked');
expect(counts.source_family_boundary_packet_exists_rows === 0, 'expected zero source-family boundary packets');
expect(counts.route_write_allowed_rows === 0, 'expected zero route-write allowed rows');
expect(counts.candidate_text_allowed_rows === 0, 'expected zero candidate-text allowed rows');
expect(counts.public_mutation_allowed_rows === 0, 'expected zero public-mutation allowed rows');
expect(counts.source_rid_overlap_diagnostic_rows === 16, 'expected 16 source diagnostic rows');
expect(counts.batch_id_overlap_diagnostic_rows === 288, 'expected 288 batch diagnostic rows');
expect(counts.source_and_batch_overlap_diagnostic_rows === 16, 'expected 16 source+batch diagnostic rows');
expect(counts.reference_total === 475, 'expected 475 queue/source references');
expect(counts.occurrence_total === 12111, 'expected 12111 queue/source occurrence memberships');
expect(counts.source_level_occurrence_total === 7795, 'expected 7795 source-level occurrences');

for (const key of [
  'source_family_selection_claims',
  'source_acceptance_claims',
  'source_citation_supplied_by_agent3_rows',
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
  'route_payload_field_hits',
  'forbidden_payload_field_hits',
  'acceptance_claims',
]) {
  expect(counts[key] === 0, `${key} must be zero`);
}

const keys = new Set();
for (const row of rows) {
  expect(!keys.has(row.queue_source_pair_key), `duplicate queue/source key ${row.queue_source_pair_key}`);
  keys.add(row.queue_source_pair_key);
  expect(row.evidence_role === 'queue_source_boundary_blocker_navigation_only_no_acceptance_claim', `${row.queue_source_pair_key} evidence role mismatch`);
  expect(row.blocking_status === 'blocked_before_source_citation_transform_and_boundary_packet', `${row.queue_source_pair_key} blocking status mismatch`);
  expect(row.blocker_flags.source_citation_missing === true, `${row.queue_source_pair_key} source citation missing mismatch`);
  expect(row.blocker_flags.source_citation_or_url_present === false, `${row.queue_source_pair_key} source citation present mismatch`);
  expect(row.blocker_flags.transform_rule_still_blocked === true, `${row.queue_source_pair_key} transform blocked mismatch`);
  expect(row.blocker_flags.agent6_boundary_after_prereq === true, `${row.queue_source_pair_key} Agent 6 boundary mismatch`);
  expect(row.blocker_flags.source_family_selection_boundary_blocker === true, `${row.queue_source_pair_key} source-family blocker mismatch`);
  expect(row.blocker_flags.source_family_boundary_packet_exists === false, `${row.queue_source_pair_key} source-family packet exists mismatch`);
  expect(row.blocker_flags.route_write_allowed === false, `${row.queue_source_pair_key} route write mismatch`);
  expect(row.blocker_flags.candidate_text_allowed === false, `${row.queue_source_pair_key} candidate text mismatch`);
  expect(row.blocker_flags.public_mutation_allowed === false, `${row.queue_source_pair_key} public mutation mismatch`);
  expect(
    row.blocker_signature ===
      'agent6_boundary_after_prereq|source_citation_missing|source_family_selection_boundary_blocker|transform_rule_still_blocked',
    `${row.queue_source_pair_key} blocker signature mismatch`,
  );
}

for (const inputPath of [
  artifact.inputs?.queue_source_dedupe_key_index,
  artifact.inputs?.source_rid_dedupe_coverage_crossmatch,
  artifact.inputs?.queue_source_subchain_handoff_index,
]) {
  expect(typeof inputPath === 'string' && fs.existsSync(path.resolve(root, inputPath)), `input missing: ${inputPath}`);
}
expect(artifact.downstream_handoff?.stop_condition?.includes('no source text read'), 'stop condition must preserve source-text boundary');
expect(artifact.downstream_handoff?.stop_condition?.includes('no source-family selection made'), 'stop condition must preserve source-family-selection boundary');
expect(artifact.downstream_handoff?.stop_condition?.includes('no acceptance action taken'), 'stop condition must preserve acceptance boundary');

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(
  `Agent 3 queue/source boundary blocker matrix passed: rows=${counts.blocker_matrix_rows} signatures=${counts.blocker_signature_rows}`,
);

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log(
        'Usage: node scripts/validate_agent3_old_dictionary_candidate_use_queue_source_boundary_blocker_matrix.mjs [--input=PATH]',
      );
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
