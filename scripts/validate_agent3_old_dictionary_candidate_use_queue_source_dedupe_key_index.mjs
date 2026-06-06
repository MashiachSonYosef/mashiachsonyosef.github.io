#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input:
    'reports/agent3-old-dictionary-candidate-use-queue-source-dedupe-key-index-2026-06-06.json',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_old_dictionary_candidate_use_queue_source_dedupe_key_index',
  'artifact_type mismatch',
);
expect(artifact.status === 'evidence-ready', 'status must be evidence-ready');

const boundary = artifact.authority_boundary || {};
for (const key of [
  'linkage_navigation_only',
  'row_level_dedupe_key_index_only',
  'queue_source_pair_key_is_dedupe_basis',
  'source_rid_overlap_is_diagnostic_not_partition_failure',
  'batch_id_overlap_is_diagnostic_not_partition_failure',
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
const rows = artifact.dedupe_key_rows || [];
expect(rows.length === counts.dedupe_key_rows, 'dedupe row length mismatch');
expect((artifact.partition_rows || []).length === counts.partition_rows, 'partition row length mismatch');
expect(counts.closure_queue_rows === 65, 'expected 65 closure queues');
expect(counts.closure_queue_source_pairs === 363, 'expected 363 closure queue/source pairs');
expect(counts.dedupe_key_rows === 363, 'expected 363 dedupe key rows');
expect(counts.cross_batch_dedupe_key_rows === 163, 'expected 163 cross-batch dedupe key rows');
expect(counts.single_batch_dedupe_key_rows === 200, 'expected 200 single-batch dedupe key rows');
expect(counts.unique_queue_source_pair_keys === 363, 'expected 363 unique queue/source keys');
expect(counts.duplicate_queue_source_pair_keys === 0, 'expected zero duplicate queue/source keys');
expect(counts.unique_queue_ids === 65, 'expected 65 unique queues');
expect(counts.unique_source_rids === 314, 'expected 314 unique source RIDs');
expect(counts.unique_token_ids === 65, 'expected 65 unique token IDs');
expect(counts.unique_batch_ids === 16, 'expected 16 unique batch IDs');
expect(counts.partition_rows === 2, 'expected two partition summary rows');
expect(counts.source_rid_overlap_diagnostic_rows === 16, 'expected 16 source-RID diagnostic rows');
expect(counts.source_rid_overlap_diagnostic_source_rids === 7, 'expected 7 source-RID diagnostic source IDs');
expect(counts.batch_id_overlap_diagnostic_rows === 288, 'expected 288 batch-ID diagnostic rows');
expect(counts.batch_id_overlap_diagnostic_batch_ids === 9, 'expected 9 batch-ID diagnostic batch IDs');
expect(counts.source_and_batch_overlap_diagnostic_rows === 16, 'expected 16 source+batch diagnostic rows');
expect(counts.reference_total === 475, 'expected 475 reference memberships');
expect(counts.occurrence_total === 12111, 'expected 12111 occurrence memberships');
expect(counts.source_citation_required_rows === 363, 'expected every row to require source citation');
expect(counts.source_citation_or_url_present_rows === 0, 'expected zero source citations supplied');
expect(counts.transform_rule_still_blocked_rows === 363, 'expected every row to be transform blocked');
expect(counts.agent6_boundary_after_prereq_rows === 363, 'expected every row to preserve later Agent 6 boundary');
expect(counts.source_family_boundary_packet_exists_rows === 0, 'expected zero source-family boundary packets');
expect(counts.source_family_selection_boundary_blocker_rows === 363, 'expected every row to preserve source-family blocker');
expect(counts.route_write_allowed_rows === 0, 'expected zero route writes allowed');
expect(counts.candidate_text_allowed_rows === 0, 'expected zero candidate text rows allowed');
expect(counts.public_mutation_allowed_rows === 0, 'expected zero public mutation rows allowed');

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

const keySet = new Set();
let referenceTotal = 0;
let occurrenceTotal = 0;
let sourceDiagnosticRows = 0;
let batchDiagnosticRows = 0;
for (const row of rows) {
  expect(row.dedupe_basis === 'queue_id/source_rid', `${row.dedupe_key_id} dedupe basis mismatch`);
  expect(row.queue_source_pair_key === `${row.queue_id}|${row.source_rid}`, `${row.dedupe_key_id} key mismatch`);
  expect(!keySet.has(row.queue_source_pair_key), `duplicate key ${row.queue_source_pair_key}`);
  keySet.add(row.queue_source_pair_key);
  expect(row.dedupe_status === 'unique_queue_source_pair_key', `${row.queue_source_pair_key} status mismatch`);
  expect(['cross_batch_queue_guard', 'single_batch_queue_workset'].includes(row.partition_id), `${row.queue_source_pair_key} partition mismatch`);
  expect(row.evidence_role === 'queue_source_dedupe_key_navigation_only_no_acceptance_claim', `${row.queue_source_pair_key} evidence role mismatch`);
  expect(row.source_citation_required === true, `${row.queue_source_pair_key} source citation required mismatch`);
  expect(row.source_citation_or_url_present === false, `${row.queue_source_pair_key} citation present mismatch`);
  expect(row.transform_rule_still_blocked === true, `${row.queue_source_pair_key} transform blocked mismatch`);
  expect(row.agent6_boundary_after_prereq === true, `${row.queue_source_pair_key} Agent 6 boundary mismatch`);
  expect(row.source_family_boundary_packet_exists === false, `${row.queue_source_pair_key} source-family packet exists mismatch`);
  expect(row.source_family_selection_boundary_blocker === true, `${row.queue_source_pair_key} source-family blocker mismatch`);
  expect(row.route_write_allowed === false, `${row.queue_source_pair_key} route write mismatch`);
  expect(row.candidate_text_allowed === false, `${row.queue_source_pair_key} candidate text mismatch`);
  expect(row.public_mutation_allowed === false, `${row.queue_source_pair_key} public mutation mismatch`);
  if (row.source_rid_overlap_diagnostic) {
    sourceDiagnosticRows += 1;
    expect(
      row.diagnostic_blockers.includes(
        'source_rid_reused_across_queue_partitions_diagnostic_only_use_queue_source_pair_key',
      ),
      `${row.queue_source_pair_key} missing source diagnostic blocker`,
    );
  }
  if (row.batch_id_overlap_diagnostic) {
    batchDiagnosticRows += 1;
    expect(
      row.diagnostic_blockers.includes(
        'batch_id_reused_across_queue_partitions_diagnostic_only_use_queue_source_pair_key',
      ),
      `${row.queue_source_pair_key} missing batch diagnostic blocker`,
    );
  }
  referenceTotal += Number(row.reference_count || 0);
  occurrenceTotal += Number(row.occurrence_total || 0);
}
expect(keySet.size === counts.unique_queue_source_pair_keys, 'unique key set mismatch');
expect(referenceTotal === counts.reference_total, 'reference total mismatch');
expect(occurrenceTotal === counts.occurrence_total, 'occurrence total mismatch');
expect(sourceDiagnosticRows === counts.source_rid_overlap_diagnostic_rows, 'source diagnostic row count mismatch');
expect(batchDiagnosticRows === counts.batch_id_overlap_diagnostic_rows, 'batch diagnostic row count mismatch');

const partitions = new Map((artifact.partition_rows || []).map((row) => [row.partition_id, row]));
expect(partitions.get('cross_batch_queue_guard')?.dedupe_key_rows === 163, 'cross partition rows mismatch');
expect(partitions.get('single_batch_queue_workset')?.dedupe_key_rows === 200, 'single partition rows mismatch');
for (const row of artifact.partition_rows || []) {
  expect(
    row.evidence_role === 'queue_source_dedupe_key_partition_summary_navigation_only_no_acceptance_claim',
    `${row.partition_id} partition evidence role mismatch`,
  );
}

for (const inputPath of [
  artifact.inputs?.queue_partition_closure,
  artifact.inputs?.partition_overlap_diagnostic_index,
  artifact.inputs?.cross_batch_queue_guard,
  artifact.inputs?.single_batch_queue_workset,
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
  `Agent 3 queue/source dedupe key index passed: rows=${counts.dedupe_key_rows} duplicate_keys=${counts.duplicate_queue_source_pair_keys}`,
);

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log(
        'Usage: node scripts/validate_agent3_old_dictionary_candidate_use_queue_source_dedupe_key_index.mjs [--input=PATH]',
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
