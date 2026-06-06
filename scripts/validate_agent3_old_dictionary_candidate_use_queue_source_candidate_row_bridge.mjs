#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input:
    'reports/agent3-old-dictionary-candidate-use-queue-source-candidate-row-bridge-2026-06-06.json',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_old_dictionary_candidate_use_queue_source_candidate_row_bridge',
  'artifact_type mismatch',
);
expect(artifact.status === 'evidence-ready', 'status must be evidence-ready');

const boundary = artifact.authority_boundary || {};
for (const key of [
  'linkage_navigation_only',
  'candidate_row_bridge_only',
  'queue_source_pair_key_is_dedupe_basis',
  'source_rid_set_comparison_is_mechanical_only',
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
const rows = artifact.bridge_rows || [];
expect(rows.length === counts.candidate_bridge_rows, 'bridge row length mismatch');
expect((artifact.bridge_status_rows || []).length === counts.bridge_status_rows, 'bridge status row length mismatch');
expect(
  (artifact.source_rid_match_status_rows || []).length === counts.source_rid_match_status_rows,
  'source-RID status row length mismatch',
);
expect((artifact.exact_blocker_rows || []).length === counts.exact_blocker_rows, 'exact blocker row length mismatch');

expect(counts.input_candidate_rows === 78, 'expected 78 input candidate rows');
expect(counts.input_candidate_occurrences === 1461, 'expected 1461 candidate occurrences');
expect(counts.input_queue_source_blocker_rows === 363, 'expected 363 queue/source blocker rows');
expect(counts.input_queue_source_unique_queue_ids === 65, 'expected 65 queue/source queue IDs');
expect(counts.candidate_bridge_rows === 78, 'expected 78 bridge rows');
expect(counts.candidate_bridge_occurrences === 1461, 'expected 1461 bridge occurrences');
expect(counts.queue_source_subchain_linked_candidate_rows === 65, 'expected 65 linked candidate rows');
expect(counts.queue_source_subchain_linked_candidate_occurrences === 1299, 'expected 1299 linked occurrences');
expect(counts.outside_queue_source_subchain_candidate_rows === 13, 'expected 13 outside candidate rows');
expect(counts.outside_queue_source_subchain_candidate_occurrences === 162, 'expected 162 outside occurrences');
expect(counts.queue_source_blocker_rows_linked === 363, 'expected 363 linked queue/source blocker rows');
expect(counts.queue_source_pair_keys_linked === 363, 'expected 363 linked queue/source pair keys');
expect(counts.queue_source_pair_keys_linked_unique === 363, 'expected 363 unique linked queue/source pair keys');
expect(counts.queue_source_unique_source_rids_linked === 314, 'expected 314 linked unique source RIDs');
expect(counts.queue_source_reference_total_linked === 475, 'expected 475 linked references');
expect(counts.queue_source_occurrence_membership_total_linked === 12111, 'expected 12111 linked occurrence memberships');
expect(counts.bridge_status_rows === 2, 'expected two bridge status rows');
expect(counts.source_rid_match_status_rows === 3, 'expected three source-RID match statuses');
expect(counts.exact_blocker_rows === 2, 'expected two exact blocker rows');
expect(counts.source_rid_exact_match_rows === 64, 'expected 64 exact source-RID rows');
expect(counts.source_rid_missing_from_queue_source_rows === 1, 'expected one row missing a source RID from queue/source subchain');
expect(counts.source_rid_extra_in_queue_source_rows === 0, 'expected zero rows with extra source RIDs');
expect(counts.source_rid_missing_and_extra_rows === 0, 'expected zero rows with missing and extra source RIDs');
expect(counts.source_rid_outside_subchain_rows === 13, 'expected 13 rows outside source-RID comparison');
expect(counts.missing_queue_source_rid_references_from_candidate_rows === 30, 'expected 30 candidate source-RID references without queue/source links');
expect(counts.extra_queue_source_rid_references_not_in_candidate_rows === 0, 'expected zero extra source-RID references');
expect(counts.source_rid_overlap_diagnostic_bridge_rows === 6, 'expected six bridge rows with source-RID overlap diagnostics');
expect(counts.batch_id_overlap_diagnostic_bridge_rows === 60, 'expected 60 bridge rows with batch diagnostics');
expect(counts.source_rid_overlap_diagnostic_link_rows === 16, 'expected 16 source diagnostic link rows');
expect(counts.batch_id_overlap_diagnostic_link_rows === 288, 'expected 288 batch diagnostic link rows');
expect(counts.candidate_queue_ids_missing_queue_source_subchain === 13, 'expected 13 candidate queues outside queue/source subchain');
expect(counts.queue_source_queue_ids_missing_candidate_row === 0, 'expected zero queue/source queues missing candidate rows');
expect(counts.duplicate_candidate_queue_ids === 0, 'expected zero duplicate candidate queue IDs');

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

const bridgeIds = new Set();
const queueIds = new Set();
const pairKeys = new Set();
for (const row of rows) {
  expect(!bridgeIds.has(row.bridge_row_id), `duplicate bridge row ID ${row.bridge_row_id}`);
  bridgeIds.add(row.bridge_row_id);
  expect(!queueIds.has(row.queue_id), `duplicate queue ID ${row.queue_id}`);
  queueIds.add(row.queue_id);
  expect(
    row.evidence_role === 'candidate_row_to_queue_source_blocker_bridge_navigation_only_no_acceptance_claim',
    `${row.queue_id} evidence role mismatch`,
  );
  expect(
    row.next_safe_action.includes('blocked') || row.next_safe_action.includes('Keep row'),
    `${row.queue_id} next safe action must preserve blocker`,
  );
  expect(row.current_blocker_count === (row.current_blocker_ids || []).length, `${row.queue_id} blocker count mismatch`);
  for (const pairKey of row.queue_source_pair_keys || []) {
    expect(!pairKeys.has(pairKey), `duplicate queue/source pair key ${pairKey}`);
    pairKeys.add(pairKey);
  }
  if (row.queue_source_subchain_linked) {
    expect(row.bridge_status === 'queue_source_subchain_linked', `${row.queue_id} bridge status mismatch`);
    expect(row.queue_source_blocker_rows > 0, `${row.queue_id} linked row must have blocker rows`);
    expect(row.queue_source_pair_keys.length === row.queue_source_blocker_rows, `${row.queue_id} pair key length mismatch`);
    expect(
      row.exact_blocker ===
        'covered_by_queue_source_boundary_blocker_subchain_missing_source_citation_transform_and_agent6_boundary',
      `${row.queue_id} linked exact blocker mismatch`,
    );
  } else {
    expect(row.bridge_status === 'outside_queue_source_subchain', `${row.queue_id} outside bridge status mismatch`);
    expect(row.queue_source_blocker_rows === 0, `${row.queue_id} outside row must have zero queue/source blockers`);
    expect(row.source_rid_match_status === 'outside_queue_source_subchain', `${row.queue_id} source-RID status mismatch`);
    expect(
      row.exact_blocker === 'outside_queue_source_subchain_current_row_blockers_only',
      `${row.queue_id} outside exact blocker mismatch`,
    );
  }
}

expect(pairKeys.size === counts.queue_source_pair_keys_linked_unique, 'linked queue/source pair key unique count mismatch');
expect(
  rows.some(
    (row) =>
      row.queue_id === 'agent2-orot-gap-tok-e50370ece8ba' &&
      row.missing_queue_source_rids_from_candidate_row.includes('E00687') &&
      row.source_rid_match_status === 'candidate_source_rids_missing_from_queue_source_subchain',
  ),
  'expected E00687 source-RID gap row',
);

for (const inputPath of [
  artifact.inputs?.row_blocker_matrix,
  artifact.inputs?.queue_source_boundary_blocker_matrix,
]) {
  expect(inputPath && fs.existsSync(path.resolve(root, inputPath)), `input path missing: ${inputPath}`);
}

expect(artifact.downstream_handoff?.stop_condition?.includes('no source text read'), 'stop condition must preserve source-text boundary');
expect(artifact.downstream_handoff?.stop_condition?.includes('no source-family selection made'), 'stop condition must preserve source-family-selection boundary');
expect(artifact.downstream_handoff?.stop_condition?.includes('no acceptance action taken'), 'stop condition must preserve acceptance boundary');

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(
  `Agent 3 candidate-row queue/source bridge passed: rows=${counts.candidate_bridge_rows} linked=${counts.queue_source_subchain_linked_candidate_rows} outside=${counts.outside_queue_source_subchain_candidate_rows}`,
);

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log(
        'Usage: node scripts/validate_agent3_old_dictionary_candidate_use_queue_source_candidate_row_bridge.mjs [--input=PATH]',
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
