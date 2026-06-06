#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input:
    'reports/agent3-old-dictionary-candidate-use-bridge-gap-candidate-prereq-closure-matrix-2026-06-06.json',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_old_dictionary_candidate_use_bridge_gap_candidate_prereq_closure_matrix',
  'artifact_type mismatch',
);
expect(artifact.status === 'evidence-ready', 'status must be evidence-ready');

const boundary = artifact.authority_boundary || {};
for (const key of [
  'linkage_navigation_only',
  'bridge_gap_candidate_prereq_closure_only',
  'closure_route_is_not_acceptance_or_transform_readiness',
  'approval_route_owner_a07',
  'a06_evidence_validator_production_only',
  'no_new_acceptance_or_release_claim',
]) {
  expect(boundary[key] === true, `authority_boundary.${key} must be true`);
}
expect(boundary.a06_approval_requested === false, 'authority_boundary.a06_approval_requested must be false');
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
const rows = artifact.closure_rows || [];
expect(rows.length === counts.closure_rows, 'closure row length mismatch');
expect((artifact.closure_route_rows || []).length === counts.closure_route_summary_rows, 'closure route summary length mismatch');
expect((artifact.gap_type_rows || []).length === counts.gap_type_rows, 'gap type row length mismatch');
expect((artifact.exact_blocker_rows || []).length === counts.exact_blocker_rows, 'exact blocker row length mismatch');

expect(counts.input_gap_rows === 14, 'expected 14 input gap rows');
expect(counts.input_gap_occurrences === 173, 'expected 173 input gap occurrences');
expect(counts.input_prereq_route_rows === 30, 'expected 30 prereq route rows');
expect(counts.closure_rows === 14, 'expected 14 closure rows');
expect(counts.closure_occurrences === 173, 'expected 173 closure occurrences');
expect(counts.missing_source_rid_references === 30, 'expected 30 missing source-RID references');
expect(counts.all_a06_evidence_boundary_prereq_rows === 9, 'expected 9 A06 evidence closure rows');
expect(counts.all_a06_evidence_boundary_prereq_occurrences === 115, 'expected 115 A06 evidence closure occurrences');
expect(counts.all_direct_source_citation_prereq_rows === 5, 'expected 5 direct prereq closure rows');
expect(counts.all_direct_source_citation_prereq_occurrences === 58, 'expected 58 direct prereq closure occurrences');
expect(counts.mixed_prereq_route_rows === 0, 'expected zero mixed prereq route rows');
expect(counts.missing_prereq_route_rows === 0, 'expected zero missing prereq route rows');
expect(counts.source_rid_blocker_rows_present === 30, 'expected 30 source-RID blocker rows present');
expect(counts.queue_source_coverage_rows_present === 0, 'expected zero queue/source coverage rows present');
expect(counts.source_rids_requiring_source_citation === 30, 'expected 30 source RIDs requiring source citation');
expect(counts.source_rids_transform_blocked === 30, 'expected 30 transform-blocked source RIDs');
expect(counts.source_rids_after_boundary_prereq === 30, 'expected 30 source RIDs after boundary prereq');
expect(counts.rows_with_current_blockers === 14, 'expected all rows to carry current blockers');
expect(counts.current_blocker_total === 140, 'expected 140 current blockers');
expect(counts.closure_route_summary_rows === 2, 'expected two closure route summary rows');
expect(counts.gap_type_rows === 2, 'expected two gap type rows');
expect(counts.exact_blocker_rows === 2, 'expected two exact blocker rows');
expect(counts.approval_route_owner_a07_rows === 14, 'expected A07 route on every row');
expect(counts.a06_evidence_validator_production_only_rows === 14, 'expected A06 evidence-only flag on every row');
expect(counts.a06_approval_requested_rows === 0, 'expected zero A06 approval requests');

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
const queueIds = new Set();
for (const row of rows) {
  expect(!ids.has(row.closure_row_id), `duplicate closure row ID ${row.closure_row_id}`);
  ids.add(row.closure_row_id);
  expect(!queueIds.has(row.queue_id), `duplicate queue ID ${row.queue_id}`);
  queueIds.add(row.queue_id);
  expect(row.current_blocker_count === (row.current_blocker_ids || []).length, `${row.queue_id} current blocker count mismatch`);
  expect(row.current_blocker_count === 10, `${row.queue_id} expected 10 current blockers`);
  expect(row.all_source_rids_have_prereq_route === true, `${row.queue_id} expected all source RIDs to have prereq route`);
  expect(row.mixed_prereq_routes === false, `${row.queue_id} expected no mixed prereq routes`);
  expect(row.source_rid_blocker_rows_present === row.missing_source_rid_count, `${row.queue_id} source-RID blocker count mismatch`);
  expect(row.queue_source_coverage_rows_present === 0, `${row.queue_id} queue/source coverage must be zero`);
  expect(row.source_rids_requiring_source_citation === row.missing_source_rid_count, `${row.queue_id} source citation count mismatch`);
  expect(row.source_rids_transform_blocked === row.missing_source_rid_count, `${row.queue_id} transform count mismatch`);
  expect(row.source_rids_after_boundary_prereq === row.missing_source_rid_count, `${row.queue_id} boundary prereq count mismatch`);
  expect(
    row.evidence_role === 'bridge_gap_candidate_prereq_closure_navigation_only_no_acceptance_claim',
    `${row.queue_id} evidence role mismatch`,
  );
  expect(row.next_safe_action?.includes('A07'), `${row.queue_id} next action must route approval questions to A07`);
  expect(row.next_safe_action?.includes('blocked'), `${row.queue_id} next action must preserve blocked state`);
  if (row.closure_route_status === 'all_a06_evidence_boundary_prereq') {
    expect(
      row.exact_blocker === 'candidate_row_gap_source_rids_all_route_to_a06_evidence_boundary_prereq',
      `${row.queue_id} A06 closure exact blocker mismatch`,
    );
  } else if (row.closure_route_status === 'all_direct_source_citation_prereq') {
    expect(
      row.exact_blocker === 'candidate_row_gap_source_rids_all_route_to_direct_source_citation_prereq',
      `${row.queue_id} direct closure exact blocker mismatch`,
    );
  } else {
    expect(false, `${row.queue_id} unexpected closure route status ${row.closure_route_status}`);
  }
}

expect(rows.filter((row) => row.closure_route_status === 'all_a06_evidence_boundary_prereq').length === 9, 'expected nine A06 evidence closure rows');
expect(rows.filter((row) => row.closure_route_status === 'all_direct_source_citation_prereq').length === 5, 'expected five direct closure rows');
expect(
  rows.some(
    (row) =>
      row.queue_id === 'agent2-orot-gap-tok-e50370ece8ba' &&
      row.closure_route_status === 'all_direct_source_citation_prereq' &&
      row.missing_source_rids.includes('E00687'),
  ),
  'expected E00687 direct closure row',
);

for (const inputPath of [artifact.inputs?.gap_workset, artifact.inputs?.prereq_route_crossmatch]) {
  expect(inputPath && fs.existsSync(path.resolve(root, inputPath)), `input path missing: ${inputPath}`);
}

expect(artifact.downstream_handoff?.handoff_owner?.includes('A07'), 'handoff owner must include A07 approval route');
expect(artifact.downstream_handoff?.handoff_owner?.includes('A06 evidence/validator production only'), 'handoff owner must preserve A06 evidence-only role');
expect(artifact.downstream_handoff?.next_safe_action?.includes('A07'), 'next safe action must route approval questions to A07');
expect(artifact.downstream_handoff?.stop_condition?.includes('no source text read'), 'stop condition must preserve source-text boundary');
expect(artifact.downstream_handoff?.stop_condition?.includes('no source-family selection made'), 'stop condition must preserve source-family-selection boundary');
expect(artifact.downstream_handoff?.stop_condition?.includes('no acceptance action taken'), 'stop condition must preserve acceptance boundary');

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(
  `Agent 3 bridge-gap candidate prereq closure matrix passed: rows=${counts.closure_rows} a06=${counts.all_a06_evidence_boundary_prereq_rows} direct=${counts.all_direct_source_citation_prereq_rows}`,
);

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log(
        'Usage: node scripts/validate_agent3_old_dictionary_candidate_use_bridge_gap_candidate_prereq_closure_matrix.mjs [--input=PATH]',
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
