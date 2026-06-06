#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input:
    'reports/agent3-old-dictionary-candidate-use-queue-source-bridge-gap-workset-2026-06-06.json',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_old_dictionary_candidate_use_queue_source_bridge_gap_workset',
  'artifact_type mismatch',
);
expect(artifact.status === 'evidence-ready', 'status must be evidence-ready');

const boundary = artifact.authority_boundary || {};
for (const key of [
  'linkage_navigation_only',
  'bridge_gap_workset_only',
  'gap_rows_are_not_transform_ready',
  'source_rid_set_comparison_is_mechanical_only',
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
const rows = artifact.gap_rows || [];
expect(rows.length === counts.gap_workset_rows, 'gap row length mismatch');
expect((artifact.gap_type_rows || []).length === counts.gap_type_rows, 'gap type row length mismatch');
expect(
  (artifact.source_rid_match_status_rows || []).length === counts.source_rid_match_status_rows,
  'source-RID status row length mismatch',
);
expect((artifact.exact_blocker_rows || []).length === counts.exact_blocker_rows, 'exact blocker row length mismatch');

expect(counts.input_bridge_rows === 78, 'expected 78 input bridge rows');
expect(counts.input_bridge_occurrences === 1461, 'expected 1461 input bridge occurrences');
expect(counts.input_linked_candidate_rows === 65, 'expected 65 linked input rows');
expect(counts.input_outside_candidate_rows === 13, 'expected 13 outside input rows');
expect(counts.gap_workset_rows === 14, 'expected 14 gap workset rows');
expect(counts.gap_workset_occurrences === 173, 'expected 173 gap occurrences');
expect(counts.outside_queue_source_subchain_rows === 13, 'expected 13 outside rows');
expect(counts.outside_queue_source_subchain_occurrences === 162, 'expected 162 outside occurrences');
expect(counts.linked_rows_missing_candidate_source_rid === 1, 'expected one linked source-RID gap row');
expect(counts.linked_rows_missing_candidate_source_rid_occurrences === 11, 'expected 11 linked source-RID gap occurrences');
expect(counts.linked_rows_extra_queue_source_source_rid === 0, 'expected zero extra source-RID gap rows');
expect(counts.linked_rows_extra_queue_source_source_rid_occurrences === 0, 'expected zero extra source-RID gap occurrences');
expect(counts.gap_type_rows === 2, 'expected two gap type rows');
expect(counts.source_rid_match_status_rows === 2, 'expected two source-RID match status rows');
expect(counts.exact_blocker_rows === 2, 'expected two exact blocker rows');
expect(counts.candidate_source_rid_references_requiring_linkage_review === 30, 'expected 30 source-RID refs requiring review');
expect(counts.outside_candidate_source_rid_references_not_in_subchain === 29, 'expected 29 outside source-RID refs');
expect(counts.linked_candidate_source_rid_references_not_in_subchain === 1, 'expected one linked source-RID ref');
expect(counts.extra_queue_source_rid_references_not_in_candidate_row === 0, 'expected zero extra source-RID refs');
expect(counts.queue_source_blocker_rows_carried_forward === 1, 'expected one queue/source blocker row carried forward');
expect(counts.queue_source_pair_keys_carried_forward === 1, 'expected one queue/source pair key carried forward');
expect(counts.queue_source_unique_source_rids_carried_forward === 1, 'expected one queue/source source RID carried forward');
expect(counts.queue_source_reference_total_carried_forward === 2, 'expected two queue/source references carried forward');
expect(counts.queue_source_occurrence_membership_total_carried_forward === 21, 'expected 21 queue/source occurrences carried forward');
expect(counts.current_blocker_total === 140, 'expected 140 current blockers carried forward');
expect(counts.rows_with_current_blockers === 14, 'expected all gap rows to carry blockers');

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

const ids = new Set();
for (const row of rows) {
  expect(!ids.has(row.gap_row_id), `duplicate gap row ID ${row.gap_row_id}`);
  ids.add(row.gap_row_id);
  expect(
    row.evidence_role === 'queue_source_bridge_gap_workset_navigation_only_no_acceptance_claim',
    `${row.queue_id} evidence role mismatch`,
  );
  expect(row.current_blocker_count === (row.current_blocker_ids || []).length, `${row.queue_id} blocker count mismatch`);
  expect(row.current_blocker_count === 10, `${row.queue_id} expected 10 current blockers`);
  expect(row.handoff_owner?.includes('Agent 10'), `${row.queue_id} handoff owner must include Agent 10`);
  expect(row.next_safe_action?.includes('blocked') || row.next_safe_action?.includes('Keep'), `${row.queue_id} next action must preserve blocker`);
  if (row.gap_type === 'outside_queue_source_subchain') {
    expect(row.queue_source_subchain_linked === false, `${row.queue_id} outside row linked mismatch`);
    expect(row.queue_source_blocker_rows === 0, `${row.queue_id} outside row must not carry queue/source blocker rows`);
    expect(
      row.exact_blocker === 'candidate_queue_id_outside_queue_source_subchain_current_row_blockers_only',
      `${row.queue_id} outside exact blocker mismatch`,
    );
  } else if (row.gap_type === 'linked_row_missing_candidate_source_rid') {
    expect(row.queue_source_subchain_linked === true, `${row.queue_id} linked row mismatch`);
    expect(row.queue_source_blocker_rows === 1, `${row.queue_id} linked gap must carry one queue/source blocker row`);
    expect(row.missing_queue_source_rids_from_candidate_row.includes('E00687'), `${row.queue_id} missing E00687`);
    expect(
      row.exact_blocker === 'linked_candidate_row_missing_source_rid_from_queue_source_subchain',
      `${row.queue_id} linked exact blocker mismatch`,
    );
  } else {
    expect(false, `${row.queue_id} unexpected gap type ${row.gap_type}`);
  }
}

expect(
  rows.some(
    (row) =>
      row.queue_id === 'agent2-orot-gap-tok-e50370ece8ba' &&
      row.gap_type === 'linked_row_missing_candidate_source_rid' &&
      row.missing_queue_source_rids_from_candidate_row.includes('E00687'),
  ),
  'expected linked E00687 gap row',
);

for (const inputPath of [artifact.inputs?.queue_source_candidate_row_bridge]) {
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
  `Agent 3 queue/source bridge gap workset passed: rows=${counts.gap_workset_rows} outside=${counts.outside_queue_source_subchain_rows} linked_missing=${counts.linked_rows_missing_candidate_source_rid}`,
);

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log(
        'Usage: node scripts/validate_agent3_old_dictionary_candidate_use_queue_source_bridge_gap_workset.mjs [--input=PATH]',
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
