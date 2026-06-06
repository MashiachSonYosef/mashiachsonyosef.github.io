#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input:
    'reports/agent3-old-dictionary-candidate-use-bridge-gap-source-rid-blocker-crossmatch-2026-06-06.json',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_old_dictionary_candidate_use_bridge_gap_source_rid_blocker_crossmatch',
  'artifact_type mismatch',
);
expect(artifact.status === 'evidence-ready', 'status must be evidence-ready');

const boundary = artifact.authority_boundary || {};
for (const key of [
  'linkage_navigation_only',
  'bridge_gap_source_rid_crossmatch_only',
  'source_rid_blocker_presence_is_not_source_acceptance',
  'queue_source_coverage_absence_is_mechanical_only',
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
const rows = artifact.source_rid_rows || [];
expect(rows.length === counts.crossmatch_source_rid_rows, 'source-RID row length mismatch');
expect((artifact.prefix_rows || []).length === counts.prefix_rows, 'prefix row length mismatch');
expect((artifact.coverage_status_rows || []).length === counts.coverage_status_rows, 'coverage status row length mismatch');
expect((artifact.exact_blocker_rows || []).length === counts.exact_blocker_rows, 'exact blocker row length mismatch');

expect(counts.input_gap_workset_rows === 14, 'expected 14 input gap rows');
expect(counts.input_gap_workset_occurrences === 173, 'expected 173 input gap occurrences');
expect(counts.input_gap_source_rid_references === 30, 'expected 30 input source-RID references');
expect(counts.input_source_rid_blocker_rows === 344, 'expected 344 source-RID blocker rows');
expect(counts.input_source_rid_dedupe_coverage_rows === 314, 'expected 314 source-RID coverage rows');
expect(counts.crossmatch_source_rid_rows === 30, 'expected 30 crossmatch source RIDs');
expect(counts.source_rid_reference_rows === 30, 'expected 30 source-RID reference rows');
expect(counts.source_rid_reference_occurrence_membership_total === 389, 'expected 389 source-RID occurrence memberships');
expect(counts.source_rids_with_blocker_row === 30, 'expected all source RIDs to have blocker rows');
expect(counts.source_rids_missing_blocker_row === 0, 'expected zero missing blocker rows');
expect(counts.source_rids_with_queue_source_coverage === 0, 'expected zero queue/source coverage rows');
expect(counts.source_rids_missing_queue_source_coverage === 30, 'expected all source RIDs to miss queue/source coverage');
expect(counts.source_rids_blocker_present_coverage_missing === 30, 'expected 30 blocker-present coverage-missing rows');
expect(counts.source_rids_blocker_and_coverage_present === 0, 'expected zero blocker+coverage rows');
expect(counts.unique_gap_queue_ids === 14, 'expected 14 unique gap queue IDs');
expect(counts.unique_gap_token_ids === 14, 'expected 14 unique gap token IDs');
expect(counts.prefix_rows === 12, 'expected 12 prefix rows');
expect(counts.coverage_status_rows === 1, 'expected one coverage status row');
expect(counts.exact_blocker_rows === 1, 'expected one exact blocker row');
expect(counts.blocker_reference_total === 30, 'expected 30 blocker references');
expect(counts.blocker_occurrence_total === 389, 'expected 389 blocker occurrences');
expect(counts.blocker_current_blocker_total === 300, 'expected 300 blocker IDs carried forward');
expect(counts.rows_missing_source_citation === 30, 'expected all rows missing source citation');
expect(counts.rows_missing_transform_rule === 30, 'expected all rows missing transform rule');
expect(counts.rows_agent6_boundary_required === 30, 'expected all rows requiring Agent 6 boundary');
expect(counts.queue_source_pair_keys_present === 0, 'expected zero queue/source pair keys');
expect(counts.queue_source_coverage_occurrence_membership_total === 0, 'expected zero queue/source coverage occurrence memberships');

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
const rids = new Set();
for (const row of rows) {
  expect(!ids.has(row.crossmatch_row_id), `duplicate crossmatch row ID ${row.crossmatch_row_id}`);
  ids.add(row.crossmatch_row_id);
  expect(!rids.has(row.source_rid), `duplicate source RID ${row.source_rid}`);
  rids.add(row.source_rid);
  expect(row.gap_reference_count === 1, `${row.source_rid} expected one gap reference`);
  expect(row.source_rid_blocker_row_present === true, `${row.source_rid} blocker row missing`);
  expect(row.queue_source_coverage_row_present === false, `${row.source_rid} queue/source coverage should be absent`);
  expect(
    row.coverage_gap_status === 'source_rid_blocker_present_queue_source_coverage_missing',
    `${row.source_rid} coverage gap status mismatch`,
  );
  expect(
    row.exact_blocker === 'gap_source_rid_has_blocker_row_but_is_absent_from_queue_source_dedupe_coverage',
    `${row.source_rid} exact blocker mismatch`,
  );
  expect(row.blocker_current_blocker_count === 10, `${row.source_rid} expected 10 blocker IDs`);
  expect(row.blocker_source_citation_missing === true, `${row.source_rid} source citation blocker mismatch`);
  expect(row.blocker_transform_rule_missing === true, `${row.source_rid} transform blocker mismatch`);
  expect(row.blocker_agent6_boundary_required === true, `${row.source_rid} Agent 6 boundary mismatch`);
  expect(row.queue_source_pair_keys.length === 0, `${row.source_rid} queue/source pair keys must be empty`);
  expect(
    row.evidence_role === 'bridge_gap_source_rid_blocker_crossmatch_navigation_only_no_acceptance_claim',
    `${row.source_rid} evidence role mismatch`,
  );
  expect(row.next_safe_action?.includes('blocked'), `${row.source_rid} next action must preserve blocked state`);
}

expect(rows.some((row) => row.source_rid === 'E00687'), 'expected E00687 row');

for (const inputPath of [
  artifact.inputs?.gap_workset,
  artifact.inputs?.source_rid_blocker_matrix,
  artifact.inputs?.source_rid_dedupe_coverage_crossmatch,
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
  `Agent 3 bridge-gap source-RID blocker crossmatch passed: source_rids=${counts.crossmatch_source_rid_rows} blocker_present=${counts.source_rids_with_blocker_row} coverage_missing=${counts.source_rids_missing_queue_source_coverage}`,
);

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log(
        'Usage: node scripts/validate_agent3_old_dictionary_candidate_use_bridge_gap_source_rid_blocker_crossmatch.mjs [--input=PATH]',
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
