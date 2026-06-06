#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input: 'reports/agent3-old-dictionary-candidate-use-boundary-chain-crossmatch-2026-06-06.json',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_old_dictionary_candidate_use_boundary_chain_crossmatch',
  'artifact_type mismatch',
);
expect(artifact.status === 'evidence-ready', 'status must be evidence-ready');

const boundary = artifact.authority_boundary || {};
for (const key of [
  'linkage_navigation_only',
  'boundary_chain_crossmatch_only',
  'candidate_use_planning_evidence_only',
  'source_rid_identifier_continuity_only',
  'external_boundary_status_observation_only',
]) {
  expect(boundary[key] === true, `authority_boundary.${key} must be true`);
}
for (const key of [
  'agent3_acceptance_authority',
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
  'source_license_acceptance',
  'qa_acceptance',
  'publication_readiness',
  'public_runtime_mutation',
  'accepted_gloss_text',
  'release_action',
]) {
  expect(boundary[key] === false, `authority_boundary.${key} must be false`);
}

const counts = artifact.counts || {};
const boundaryStepRows = artifact.boundary_step_rows || [];
const blockerRows = artifact.blocker_rows || [];
const currentTransformBlockerRows = artifact.current_transform_blocker_rows || [];
const rowCrossmatch = artifact.row_crossmatch || [];

expect(rowCrossmatch.length === counts.row_crossmatch_rows, 'row crossmatch length mismatch');
expect(boundaryStepRows.length === counts.boundary_step_rows, 'boundary step row length mismatch');
expect(blockerRows.length === counts.blocker_rows, 'blocker row length mismatch');
expect(currentTransformBlockerRows.length === counts.current_transform_blocker_rows, 'current transform blocker length mismatch');

expect(counts.row_crossmatch_rows === 78, 'expected 78 row crossmatch rows');
expect(counts.row_crossmatch_occurrences === 1461, 'expected 1461 row crossmatch occurrences');
expect(counts.lineage_rows === 78, 'expected 78 lineage rows');
expect(counts.preboundary_matrix_rows === 78, 'expected 78 preboundary matrix rows');
expect(counts.zero_text_package_rows === 78, 'expected 78 zero-text package rows');
expect(counts.preboundary_rows_matched === 78, 'expected 78 preboundary rows matched');
expect(counts.zero_text_rows_matched === 78, 'expected 78 zero-text rows matched');
expect(counts.missing_preboundary_rows === 0, 'expected 0 missing preboundary rows');
expect(counts.missing_zero_text_rows === 0, 'expected 0 missing zero-text rows');
expect(counts.extra_preboundary_rows === 0, 'expected 0 extra preboundary rows');
expect(counts.extra_zero_text_rows === 0, 'expected 0 extra zero-text rows');
expect(counts.token_mismatch_rows === 0, 'expected 0 token mismatch rows');
expect(counts.occurrence_mismatch_rows === 0, 'expected 0 occurrence mismatch rows');
expect(counts.pure_workset_rows === 5, 'expected 5 pure workset rows');
expect(counts.pure_workset_occurrences === 58, 'expected 58 pure workset occurrences');
expect(counts.overlap_workset_rows === 73, 'expected 73 overlap workset rows');
expect(counts.overlap_workset_occurrences === 1403, 'expected 1403 overlap workset occurrences');
expect(counts.blocker_rows === 4, 'expected 4 lineage blocker rows');
expect(counts.boundary_step_rows === 5, 'expected 5 boundary step rows');
expect(counts.current_transform_blocker_rows === 4, 'expected 4 current transform blocker rows');
expect(counts.preboundary_review_pointer_rows_in_source === 78, 'expected 78 source review pointer rows');
expect(counts.copied_review_pointer_payload_fields === 0, 'expected 0 copied review pointer payload fields');
expect(counts.preboundary_row_zero_counter_violations === 0, 'expected 0 preboundary zero-counter violations');
expect(counts.zero_text_row_zero_counter_violations === 0, 'expected 0 zero-text zero-counter violations');
expect(counts.agent6_preboundary_recount_rows === 78, 'expected 78 Agent 6 preboundary recount rows');
expect(counts.agent6_preboundary_recount_occurrences === 1461, 'expected 1461 Agent 6 preboundary recount occurrences');
expect(counts.agent6_zero_text_recount_rows === 78, 'expected 78 Agent 6 zero-text recount rows');
expect(counts.agent6_zero_text_recount_occurrences === 1461, 'expected 1461 Agent 6 zero-text recount occurrences');
expect(counts.agent10_transform_blocker_rows === 78, 'expected 78 Agent 10 transform blocker rows');
expect(counts.agent10_transform_blocker_occurrences === 1461, 'expected 1461 Agent 10 transform blocker occurrences');
expect(counts.source_rid_references === 393, 'expected 393 source RID references');
expect(counts.unique_source_rids === 344, 'expected 344 unique source RIDs');
expect(counts.transform_ready_rows === 0, 'expected 0 transform-ready rows');

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
  'route_payload_field_hits',
  'forbidden_payload_field_hits',
  'acceptance_claims',
]) {
  expect(counts[key] === 0, `${key} must be zero`);
}

const expectedCurrentBlockers = new Set([
  'missing_transform_output_proposal_matrix_or_exact_transform_rule',
  'missing_source_field::source_citation_or_url',
  'missing_transform_rule::proposed_candidate_text_proposed_definition_text_proposed_lemma_text_proposed_reader_hint_text',
  'next_transform_output_or_candidate_text_boundary_not_supplied',
]);
for (const row of currentTransformBlockerRows) {
  expect(expectedCurrentBlockers.has(row.exact_blocker), `unexpected current transform blocker ${row.exact_blocker}`);
  expect(row.status === 'observed_current_transform_blocker_no_agent3_acceptance', `${row.row_id} status mismatch`);
}

for (const row of boundaryStepRows) {
  expect(row.rows === 78, `${row.row_id} rows mismatch`);
  expect(row.occurrences === 1461, `${row.row_id} occurrences mismatch`);
  expect(row.zero_text_or_output_counters_nonzero === 0, `${row.row_id} has nonzero output counters`);
  expect(Boolean(row.evidence_role), `${row.row_id} evidence role missing`);
}

const expectedLineageBlockers = new Map([
  ['commercial_clean_only_missing_future_agent6_candidate_use_boundary_and_morphology_relation', { rows: 5, occ: 58 }],
  ['commercial_clean_plus_nc_overlap_missing_agent6_source_family_selection_boundary', { rows: 9, occ: 115 }],
  ['commercial_clean_plus_blocked_overlap_missing_agent6_source_family_selection_boundary', { rows: 8, occ: 164 }],
  ['triple_overlap_missing_agent6_source_family_selection_boundary', { rows: 56, occ: 1124 }],
]);
for (const row of blockerRows) {
  const expected = expectedLineageBlockers.get(row.exact_blocker);
  expect(Boolean(expected), `unexpected lineage blocker ${row.exact_blocker}`);
  if (expected) {
    expect(row.candidate_rows === expected.rows, `${row.exact_blocker} rows mismatch`);
    expect(row.candidate_occurrences === expected.occ, `${row.exact_blocker} occurrences mismatch`);
  }
  expect(
    row.status === 'lineage_blocker_distribution_observed_only_no_transform_authority',
    `${row.exact_blocker} status mismatch`,
  );
}

const dedupeKeys = new Set();
const queueIds = new Set();
for (const row of rowCrossmatch) {
  expect(Boolean(row.queue_id), `${row.row_id} queue_id missing`);
  expect(Boolean(row.token_id), `${row.row_id} token_id missing`);
  expect(Number.isFinite(row.occurrences) && row.occurrences > 0, `${row.row_id} occurrences invalid`);
  expect(row.preboundary_matrix_link_status === 'linked', `${row.row_id} preboundary link missing`);
  expect(row.zero_text_package_link_status === 'linked', `${row.row_id} zero-text link missing`);
  expect(row.token_id_consistency === 'matched', `${row.row_id} token mismatch`);
  expect(row.occurrence_consistency === 'matched', `${row.row_id} occurrence mismatch`);
  expect(row.preboundary_zero_counters_status === 'all_zero', `${row.row_id} preboundary zero counters mismatch`);
  expect(row.zero_text_zero_counters_status === 'all_zero', `${row.row_id} zero-text zero counters mismatch`);
  expect(row.preboundary_review_pointer_payload_not_copied === true, `${row.row_id} review pointer payload copied`);
  expect(
    row.external_boundary_status === 'observed_nonpublic_planning_chain_no_agent3_acceptance',
    `${row.row_id} external boundary status mismatch`,
  );
  expect(
    row.current_transform_blocker === 'missing_source_citation_or_url_and_exact_transform_output_rule_for_78_row_packet',
    `${row.row_id} current transform blocker mismatch`,
  );
  expect(
    row.evidence_role === 'boundary_chain_row_crossmatch_navigation_only_no_transform_or_definition_authority',
    `${row.row_id} evidence role mismatch`,
  );
  expect(!dedupeKeys.has(row.dedupe_key), `${row.row_id} duplicate dedupe key`);
  dedupeKeys.add(row.dedupe_key);
  expect(!queueIds.has(row.queue_id), `${row.row_id} duplicate queue id`);
  queueIds.add(row.queue_id);
}

const forbiddenKeys = [];
walk(artifact, (key, child, parentKey) => {
  if (parentKey === 'authority_boundary') return;
  if (
    [
      'surface',
      'normalized',
      'token_surface',
      'token_normalized',
      'focus_surface',
      'focus_normalized',
      'candidate_text',
      'definition_text',
      'source_text',
      'accepted_text',
      'display_text',
      'route_payload',
      'public_domain_headwords',
      'public_domain_rids',
    ].includes(key)
  ) {
    forbiddenKeys.push(key);
  }
});
expect(forbiddenKeys.length === 0, `forbidden payload keys present: ${forbiddenKeys.join(', ')}`);

const stopCondition = artifact.downstream_handoff?.stop_condition || '';
expect(stopCondition.includes('boundary-chain crossmatch'), 'stop condition must identify boundary-chain crossmatch');
expect(stopCondition.includes('does not authorize transform'), 'stop condition must block transform');
expect(stopCondition.includes('source/license acceptance'), 'stop condition must block source/license acceptance');
expect(stopCondition.includes('accepted text'), 'stop condition must block accepted text');

if (errors.length > 0) {
  for (const error of errors) console.error(`ERROR ${error}`);
  process.exit(1);
}

console.log(
  `Agent 3 boundary chain crossmatch passed: rows=${counts.row_crossmatch_rows} preboundary=${counts.preboundary_rows_matched} zero_text=${counts.zero_text_rows_matched} blockers=${counts.current_transform_blocker_rows}`,
);

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function walk(value, callback, parentKey = '') {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    for (const item of value) walk(item, callback, parentKey);
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    callback(key, child, parentKey);
    walk(child, callback, key);
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(root, filePath), 'utf8'));
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function valueAfterEquals(arg) {
  const index = arg.indexOf('=');
  return index === -1 ? '' : arg.slice(index + 1);
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--input=')) parsed.input = cleanRelativePath(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}
