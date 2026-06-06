#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input:
    'reports/agent3-old-dictionary-candidate-use-queue-partition-closure-2026-06-06.json',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(artifact.artifact_type === 'agent3_old_dictionary_candidate_use_queue_partition_closure', 'artifact_type mismatch');
expect(artifact.status === 'evidence-ready', 'status must be evidence-ready');

const boundary = artifact.authority_boundary || {};
for (const key of [
  'linkage_navigation_only',
  'queue_source_pair_partition_only',
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
const partitionRows = artifact.partition_rows || [];
expect(partitionRows.length === counts.queue_partition_rows, 'partition row length mismatch');
expect(counts.input_queue_rows === 65, 'expected 65 input queue rows');
expect(counts.cross_batch_queue_rows === 25, 'expected 25 cross-batch queue rows');
expect(counts.single_batch_queue_rows === 40, 'expected 40 single-batch queue rows');
expect(counts.queue_partition_rows === 2, 'expected two partition rows');
expect(counts.queue_union_rows === 65, 'expected 65 queue union rows');
expect(counts.queue_overlap_rows === 0, 'expected zero queue overlap rows');
expect(counts.queue_missing_rows === 0, 'expected zero missing queue rows');
expect(counts.queue_extra_rows === 0, 'expected zero extra queue rows');
expect(counts.input_queue_source_pairs === 363, 'expected 363 input queue/source pairs');
expect(counts.cross_batch_queue_source_pairs === 163, 'expected 163 cross-batch queue/source pairs');
expect(counts.single_batch_queue_source_pairs === 200, 'expected 200 single-batch queue/source pairs');
expect(counts.queue_source_pair_union_rows === 363, 'expected 363 queue/source pair union rows');
expect(counts.queue_source_pair_overlap_rows === 0, 'expected zero queue/source pair overlap rows');
expect(counts.queue_source_pair_missing_rows === 0, 'expected zero missing queue/source pair rows');
expect(counts.queue_source_pair_extra_rows === 0, 'expected zero extra queue/source pair rows');
expect(counts.cross_source_rids === 121, 'expected 121 cross source RIDs');
expect(counts.single_source_rids === 200, 'expected 200 single source RIDs');
expect(counts.source_rid_overlap === 7, 'expected 7 diagnostic source RID overlaps');
expect(counts.source_rid_union === 314, 'expected 314 source RID union rows');
expect(counts.cross_batch_ids === 14, 'expected 14 cross batch IDs');
expect(counts.single_batch_ids === 11, 'expected 11 single batch IDs');
expect(counts.batch_id_overlap === 9, 'expected 9 diagnostic batch ID overlaps');
expect(counts.batch_id_union === 16, 'expected 16 batch ID union rows');
expect(counts.cross_reference_total === 266, 'expected 266 cross references');
expect(counts.single_reference_total === 209, 'expected 209 single references');
expect(counts.reference_total === 475, 'expected 475 reference memberships');
expect(counts.cross_occurrence_total === 8811, 'expected 8811 cross occurrences');
expect(counts.single_occurrence_total === 3300, 'expected 3300 single occurrences');
expect(counts.occurrence_total === 12111, 'expected 12111 occurrence memberships');

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

const byPartition = new Map(partitionRows.map((row) => [row.partition_id, row]));
const cross = byPartition.get('cross_batch_queue_guard');
const single = byPartition.get('single_batch_queue_workset');
expect(Boolean(cross), 'cross_batch_queue_guard partition missing');
expect(Boolean(single), 'single_batch_queue_workset partition missing');
if (cross) {
  expect(cross.queue_count === 25, 'cross partition queue count mismatch');
  expect(cross.queue_source_pairs === 163, 'cross partition pair count mismatch');
  expect(cross.reference_total === 266, 'cross partition reference mismatch');
  expect(cross.occurrence_total === 8811, 'cross partition occurrence mismatch');
  expect(cross.exact_blocker === 'queue_token_spans_multiple_source_family_selection_batches', 'cross blocker mismatch');
}
if (single) {
  expect(single.queue_count === 40, 'single partition queue count mismatch');
  expect(single.queue_source_pairs === 200, 'single partition pair count mismatch');
  expect(single.reference_total === 209, 'single partition reference mismatch');
  expect(single.occurrence_total === 3300, 'single partition occurrence mismatch');
  expect(
    single.exact_blocker === 'single_batch_queue_still_missing_source_citation_transform_and_boundary_packet',
    'single blocker mismatch',
  );
}
for (const row of partitionRows) {
  expect(row.evidence_role === 'queue_partition_closure_navigation_only_no_acceptance_claim', `${row.partition_id} evidence role mismatch`);
}

const diagnostics = artifact.closure_diagnostics || {};
expect(diagnostics.queue_partition_basis === 'queue_id and queue_id/source_rid pairs only', 'partition basis mismatch');
expect(Array.isArray(diagnostics.queue_overlap) && diagnostics.queue_overlap.length === 0, 'queue overlap diagnostics must be empty');
expect(Array.isArray(diagnostics.queue_missing) && diagnostics.queue_missing.length === 0, 'queue missing diagnostics must be empty');
expect(Array.isArray(diagnostics.queue_extra) && diagnostics.queue_extra.length === 0, 'queue extra diagnostics must be empty');
expect(
  Array.isArray(diagnostics.queue_source_pair_overlap) && diagnostics.queue_source_pair_overlap.length === 0,
  'queue/source pair overlap diagnostics must be empty',
);
expect(
  Array.isArray(diagnostics.queue_source_pair_missing) && diagnostics.queue_source_pair_missing.length === 0,
  'queue/source pair missing diagnostics must be empty',
);
expect(
  Array.isArray(diagnostics.queue_source_pair_extra) && diagnostics.queue_source_pair_extra.length === 0,
  'queue/source pair extra diagnostics must be empty',
);
expect(
  Array.isArray(diagnostics.source_rid_overlap_diagnostic_not_partition_failure) &&
    diagnostics.source_rid_overlap_diagnostic_not_partition_failure.length === counts.source_rid_overlap,
  'source RID diagnostic overlap length mismatch',
);
expect(
  Array.isArray(diagnostics.batch_id_overlap_diagnostic_not_partition_failure) &&
    diagnostics.batch_id_overlap_diagnostic_not_partition_failure.length === counts.batch_id_overlap,
  'batch ID diagnostic overlap length mismatch',
);
expect(String(diagnostics.source_rid_overlap_note || '').includes('not source-RID scoped'), 'source RID diagnostic note missing');
expect(String(diagnostics.batch_id_overlap_note || '').includes('not batch scoped'), 'batch ID diagnostic note missing');

for (const inputPath of [
  artifact.inputs?.source_family_selection_queue_batch_crossmatch,
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
  `Agent 3 queue partition closure passed: queues=${counts.input_queue_rows} pairs=${counts.input_queue_source_pairs} diagnostics=${counts.source_rid_overlap}/${counts.batch_id_overlap}`,
);

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log(
        'Usage: node scripts/validate_agent3_old_dictionary_candidate_use_queue_partition_closure.mjs [--input=PATH]',
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
