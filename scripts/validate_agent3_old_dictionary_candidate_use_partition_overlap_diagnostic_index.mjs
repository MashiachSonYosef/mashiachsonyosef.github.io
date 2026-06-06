#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input:
    'reports/agent3-old-dictionary-candidate-use-partition-overlap-diagnostic-index-2026-06-06.json',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_old_dictionary_candidate_use_partition_overlap_diagnostic_index',
  'artifact_type mismatch',
);
expect(artifact.status === 'evidence-ready', 'status must be evidence-ready');

const boundary = artifact.authority_boundary || {};
for (const key of [
  'linkage_navigation_only',
  'diagnostic_overlap_index_only',
  'queue_source_pair_partition_remains_authoritative_for_this_packet',
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
const sourceRows = artifact.source_rid_overlap_rows || [];
const batchRows = artifact.batch_id_overlap_rows || [];
expect(counts.queue_partition_rows === 2, 'expected two closure partition rows');
expect(counts.input_queue_rows === 65, 'expected 65 closure queue rows');
expect(counts.input_queue_source_pairs === 363, 'expected 363 closure queue/source pairs');
expect(counts.queue_overlap_rows === 0, 'expected zero queue overlap rows');
expect(counts.queue_source_pair_overlap_rows === 0, 'expected zero queue/source pair overlap rows');
expect(sourceRows.length === counts.source_rid_overlap_rows, 'source overlap row length mismatch');
expect(batchRows.length === counts.batch_id_overlap_rows, 'batch overlap row length mismatch');
expect(counts.source_rid_overlap_rows === 7, 'expected 7 source-RID diagnostic overlaps');
expect(counts.source_rid_overlap_cross_queue_count === 4, 'expected 4 cross queues in source-RID diagnostics');
expect(counts.source_rid_overlap_single_queue_count === 2, 'expected 2 single queues in source-RID diagnostics');
expect(counts.source_rid_overlap_cross_pair_count === 9, 'expected 9 cross queue/source pairs in source diagnostics');
expect(counts.source_rid_overlap_single_pair_count === 7, 'expected 7 single queue/source pairs in source diagnostics');
expect(counts.source_rid_overlap_cross_reference_total === 24, 'expected 24 cross references in source diagnostics');
expect(counts.source_rid_overlap_single_reference_total === 16, 'expected 16 single references in source diagnostics');
expect(counts.source_rid_overlap_cross_occurrence_total === 651, 'expected 651 cross occurrences in source diagnostics');
expect(counts.source_rid_overlap_single_occurrence_total === 471, 'expected 471 single occurrences in source diagnostics');
expect(counts.batch_id_overlap_rows === 9, 'expected 9 batch-ID diagnostic overlaps');
expect(counts.batch_id_overlap_cross_queue_memberships === 30, 'expected 30 cross queue memberships in batch diagnostics');
expect(counts.batch_id_overlap_single_queue_memberships === 38, 'expected 38 single queue memberships in batch diagnostics');
expect(counts.batch_id_overlap_cross_reference_total === 117, 'expected 117 cross references in batch diagnostics');
expect(counts.batch_id_overlap_single_reference_total === 207, 'expected 207 single references in batch diagnostics');
expect(counts.batch_id_overlap_cross_occurrence_total === 3109, 'expected 3109 cross occurrences in batch diagnostics');
expect(counts.batch_id_overlap_single_occurrence_total === 3256, 'expected 3256 single occurrences in batch diagnostics');

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

let previousSourceRid = '';
for (const row of sourceRows) {
  expect(row.source_rid > previousSourceRid, 'source overlap rows must sort by source_rid');
  previousSourceRid = row.source_rid;
  expect(row.overlap_type === 'source_rid_reused_across_queue_partitions', `${row.source_rid} overlap type mismatch`);
  expect(row.diagnostic_status === 'diagnostic_only_not_partition_failure', `${row.source_rid} diagnostic status mismatch`);
  expect(
    row.exact_blocker === 'source_rid_reused_across_queue_partitions_diagnostic_only_use_queue_source_pair_key',
    `${row.source_rid} exact blocker mismatch`,
  );
  expect(row.evidence_role === 'partition_overlap_diagnostic_navigation_only_no_acceptance_claim', `${row.source_rid} evidence role mismatch`);
  expect(row.cross_queue_ids.length > 0, `${row.source_rid} must have cross queues`);
  expect(row.single_queue_ids.length > 0, `${row.source_rid} must have single queues`);
  expect(row.cross_link_ids.length === row.cross_queue_source_pair_count, `${row.source_rid} cross link count mismatch`);
  expect(row.single_link_ids.length === row.single_queue_source_pair_count, `${row.source_rid} single link count mismatch`);
}

let previousBatchId = '';
for (const row of batchRows) {
  expect(row.batch_id > previousBatchId, 'batch overlap rows must sort by batch_id');
  previousBatchId = row.batch_id;
  expect(row.overlap_type === 'batch_id_reused_across_queue_partitions', `${row.batch_id} overlap type mismatch`);
  expect(row.diagnostic_status === 'diagnostic_only_not_partition_failure', `${row.batch_id} diagnostic status mismatch`);
  expect(
    row.exact_blocker === 'batch_id_reused_across_queue_partitions_diagnostic_only_use_queue_source_pair_key',
    `${row.batch_id} exact blocker mismatch`,
  );
  expect(row.evidence_role === 'partition_overlap_diagnostic_navigation_only_no_acceptance_claim', `${row.batch_id} evidence role mismatch`);
  expect(row.cross_queue_ids.length === row.cross_queue_count, `${row.batch_id} cross queue count mismatch`);
  expect(row.single_queue_ids.length === row.single_queue_count, `${row.batch_id} single queue count mismatch`);
}

for (const inputPath of [
  artifact.inputs?.queue_partition_closure,
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
  `Agent 3 partition overlap diagnostic index passed: source_overlaps=${counts.source_rid_overlap_rows} batch_overlaps=${counts.batch_id_overlap_rows}`,
);

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log(
        'Usage: node scripts/validate_agent3_old_dictionary_candidate_use_partition_overlap_diagnostic_index.mjs [--input=PATH]',
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
