#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input: 'reports/agent3-old-dictionary-candidate-use-row-lineage-matrix-2026-06-06.json',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_old_dictionary_candidate_use_row_lineage_matrix',
  'artifact_type mismatch',
);
expect(artifact.status === 'evidence-ready', 'status must be evidence-ready');

const boundary = artifact.authority_boundary || {};
for (const key of [
  'linkage_navigation_only',
  'row_lineage_only',
  'candidate_use_planning_evidence_only',
  'source_rid_identifier_continuity_only',
  'source_family_blocker_navigation_only',
  'agent2_queue_pointer_only',
]) {
  expect(boundary[key] === true, `authority_boundary.${key} must be true`);
}
for (const key of [
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
const lineageGapRows = artifact.lineage_gap_rows || [];
const partitionRows = artifact.partition_rows || [];
const blockerRows = artifact.blocker_rows || [];
const sourceFamilySetRows = artifact.source_family_set_rows || [];
const handoffRoles = artifact.handoff_roles || [];
const rowLineage = artifact.row_lineage || [];

expect(rowLineage.length === counts.row_lineage_rows, 'row lineage length mismatch');
expect(lineageGapRows.length === counts.lineage_gap_rows, 'lineage gap row length mismatch');
expect(partitionRows.length === counts.partition_rows, 'partition row length mismatch');
expect(blockerRows.length === counts.blocker_rows, 'blocker row length mismatch');
expect(sourceFamilySetRows.length === counts.source_family_set_rows, 'source family set row length mismatch');
expect(handoffRoles.length === counts.handoff_artifact_roles, 'handoff role length mismatch');

expect(counts.row_lineage_rows === 78, 'expected 78 lineage rows');
expect(counts.row_lineage_occurrences === 1461, 'expected 1461 lineage occurrences');
expect(counts.continuity_rows_linked === 78, 'expected 78 continuity links');
expect(counts.source_rid_rows_linked === 78, 'expected 78 source RID links');
expect(counts.exact_subset_rows_linked === 78, 'expected 78 exact subset links');
expect(counts.boundary_triage_rows_linked === 78, 'expected 78 boundary triage links');
expect(counts.split_closure_rows_linked === 78, 'expected 78 split closure links');
expect(counts.rows_missing_continuity === 0, 'expected 0 missing continuity rows');
expect(counts.rows_missing_source_rid === 0, 'expected 0 missing source RID rows');
expect(counts.rows_missing_exact_subset === 0, 'expected 0 missing exact subset rows');
expect(counts.rows_missing_boundary_triage === 0, 'expected 0 missing boundary triage rows');
expect(counts.rows_missing_split_closure === 0, 'expected 0 missing split closure rows');
expect(counts.unique_queue_ids === 78, 'expected 78 unique queue IDs');
expect(counts.duplicate_queue_ids === 0, 'expected 0 duplicate queue IDs');
expect(counts.unique_token_ids === 78, 'expected 78 unique token IDs');
expect(counts.duplicate_token_ids === 0, 'expected 0 duplicate token IDs');
expect(counts.pure_workset_rows === 5, 'expected 5 pure workset rows');
expect(counts.pure_workset_occurrences === 58, 'expected 58 pure workset occurrences');
expect(counts.overlap_workset_rows === 73, 'expected 73 overlap workset rows');
expect(counts.overlap_workset_occurrences === 1403, 'expected 1403 overlap workset occurrences');
expect(counts.blocker_rows === 4, 'expected 4 blocker rows');
expect(counts.partition_rows === 2, 'expected 2 partition rows');
expect(counts.source_family_set_rows === 4, 'expected 4 source family set rows');
expect(counts.lineage_gap_rows === 0, 'expected 0 lineage gap rows');
expect(counts.rows_with_source_family_links === 78, 'expected 78 rows with source-family links');
expect(counts.source_family_membership_rows === 159, 'expected 159 source-family memberships');
expect(counts.source_family_set_count === 4, 'expected 4 source-family sets');
expect(counts.source_rid_references === 393, 'expected 393 source RID references');
expect(counts.unique_source_rids === 344, 'expected 344 unique source RIDs');
expect(counts.source_rid_prefix_count === 21, 'expected 21 source RID prefixes');
expect(counts.rows_with_agent1_rid_metadata === 78, 'expected 78 Agent 1 metadata rows');
expect(counts.rows_with_all_source_rids_in_agent1_metadata === 78, 'expected 78 rows with all RIDs in Agent 1 metadata');
expect(counts.handoff_artifact_roles === 9, 'expected 9 handoff artifact roles');
expect(counts.handoff_roles_available === 9, 'expected 9 available handoff roles');
expect(counts.agent2_queue_pointer_rows === 78, 'expected 78 Agent 2 queue pointer rows');
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
  'release_actions',
  'route_payload_field_hits',
  'forbidden_payload_field_hits',
  'acceptance_claims',
]) {
  expect(counts[key] === 0, `${key} must be zero`);
}

const expectedPartitions = new Map([
  ['pure_commercial_workset', { rows: 5, occ: 58, refs: 6, unique: 6, sets: 1, blockers: 1 }],
  ['overlap_workset', { rows: 73, occ: 1403, refs: 387, unique: 339, sets: 4, blockers: 3 }],
]);
for (const row of partitionRows) {
  const expected = expectedPartitions.get(row.partition);
  expect(Boolean(expected), `unexpected partition ${row.partition}`);
  if (expected) {
    expect(row.candidate_rows === expected.rows, `${row.partition} row count mismatch`);
    expect(row.candidate_occurrences === expected.occ, `${row.partition} occurrence count mismatch`);
    expect(row.source_rid_references === expected.refs, `${row.partition} source RID references mismatch`);
    expect(row.unique_source_rids === expected.unique, `${row.partition} unique source RIDs mismatch`);
    expect(row.source_family_set_count === expected.sets, `${row.partition} source family set mismatch`);
    expect(row.exact_blocker_count === expected.blockers, `${row.partition} blocker count mismatch`);
  }
}

const expectedBlockers = new Map([
  ['commercial_clean_only_missing_future_agent6_candidate_use_boundary_and_morphology_relation', { rows: 5, occ: 58 }],
  ['commercial_clean_plus_nc_overlap_missing_agent6_source_family_selection_boundary', { rows: 9, occ: 115 }],
  ['commercial_clean_plus_blocked_overlap_missing_agent6_source_family_selection_boundary', { rows: 8, occ: 164 }],
  ['triple_overlap_missing_agent6_source_family_selection_boundary', { rows: 56, occ: 1124 }],
]);
for (const row of blockerRows) {
  const expected = expectedBlockers.get(row.exact_blocker);
  expect(Boolean(expected), `unexpected blocker ${row.exact_blocker}`);
  if (expected) {
    expect(row.candidate_rows === expected.rows, `${row.exact_blocker} row count mismatch`);
    expect(row.candidate_occurrences === expected.occ, `${row.exact_blocker} occurrence count mismatch`);
  }
  expect(
    row.status === 'exact_blocker_distribution_navigation_only_no_transform_authority',
    `${row.exact_blocker} status mismatch`,
  );
}

const jastrowSet = sourceFamilySetRows.find((row) => row.source_family_set.join('|') === 'Jastrow Dictionary');
expect(Boolean(jastrowSet), 'Jastrow source-family set missing');
if (jastrowSet) {
  expect(jastrowSet.candidate_rows === 15, 'Jastrow source-family set row count mismatch');
  expect(jastrowSet.candidate_occurrences === 190, 'Jastrow source-family set occurrence count mismatch');
  expect(jastrowSet.partitions.includes('pure_commercial_workset'), 'Jastrow set must include pure partition');
  expect(jastrowSet.partitions.includes('overlap_workset'), 'Jastrow set must include overlap partition');
}

const dedupeKeys = new Set();
const queueIds = new Set();
const tokenIds = new Set();
for (const row of rowLineage) {
  expect(Boolean(row.row_id), 'row_id missing');
  expect(Boolean(row.queue_id), `${row.row_id} queue_id missing`);
  expect(row.agent2_queue_pointer_status === 'present', `${row.row_id} Agent 2 queue pointer missing`);
  expect(Boolean(row.token_id), `${row.row_id} token_id missing`);
  expect(Number.isFinite(row.occurrences) && row.occurrences > 0, `${row.row_id} occurrences invalid`);
  expect(['pure_commercial_workset', 'overlap_workset'].includes(row.partition), `${row.row_id} partition mismatch`);
  expect(row.license_lane === 'commercial_clean_candidate', `${row.row_id} license lane mismatch`);
  expect(Boolean(row.exact_blocker), `${row.row_id} exact blocker missing`);
  expect(Array.isArray(row.source_families) && row.source_families.length > 0, `${row.row_id} source families missing`);
  expect(row.source_family_boundary_link_count > 0, `${row.row_id} source-family links missing`);
  expect(
    Array.isArray(row.source_family_boundary_links) &&
      row.source_family_boundary_links.length === row.source_family_boundary_link_count,
    `${row.row_id} source-family link count mismatch`,
  );
  expect(Array.isArray(row.source_rids) && row.source_rids.length === row.source_rid_count, `${row.row_id} source RID count mismatch`);
  expect(row.agent1_metadata_status === 'present', `${row.row_id} Agent 1 metadata status mismatch`);
  expect(row.all_source_rids_in_agent1_metadata === true, `${row.row_id} Agent 1 metadata continuity mismatch`);
  expect(row.lineage_statuses?.continuity === 'linked', `${row.row_id} continuity not linked`);
  expect(row.lineage_statuses?.source_rid === 'linked', `${row.row_id} source RID not linked`);
  expect(row.lineage_statuses?.exact_subset === 'linked', `${row.row_id} exact subset not linked`);
  expect(row.lineage_statuses?.boundary_triage === 'linked', `${row.row_id} boundary triage not linked`);
  expect(row.lineage_statuses?.split_closure === 'linked', `${row.row_id} split closure not linked`);
  expect(Boolean(row.lineage_artifacts?.continuity_row_id), `${row.row_id} continuity row id missing`);
  expect(Boolean(row.lineage_artifacts?.source_rid_row_id), `${row.row_id} source RID row id missing`);
  expect(Boolean(row.lineage_artifacts?.exact_subset_row_id), `${row.row_id} exact subset row id missing`);
  expect(Boolean(row.lineage_artifacts?.boundary_triage_row_id), `${row.row_id} boundary triage row id missing`);
  expect(Boolean(row.lineage_artifacts?.split_closure_row_id), `${row.row_id} split closure row id missing`);
  expect(row.handoff_roles_available === 9, `${row.row_id} handoff role count mismatch`);
  expect(
    row.evidence_role === 'row_lineage_navigation_only_no_transform_or_definition_authority',
    `${row.row_id} evidence role mismatch`,
  );
  expect(row.row_status === 'lineage_complete_non_authoritative_planning_evidence', `${row.row_id} status mismatch`);
  expect(!dedupeKeys.has(row.dedupe_key), `${row.row_id} duplicate dedupe key`);
  dedupeKeys.add(row.dedupe_key);
  expect(!queueIds.has(row.queue_id), `${row.row_id} duplicate queue ID`);
  queueIds.add(row.queue_id);
  expect(!tokenIds.has(row.token_id), `${row.row_id} duplicate token ID`);
  tokenIds.add(row.token_id);
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
    ].includes(key)
  ) {
    forbiddenKeys.push(key);
  }
});
expect(forbiddenKeys.length === 0, `forbidden payload keys present: ${forbiddenKeys.join(', ')}`);

const stopCondition = artifact.downstream_handoff?.stop_condition || '';
expect(stopCondition.includes('row lineage matrix'), 'stop condition must identify row lineage matrix');
expect(stopCondition.includes('does not authorize transform'), 'stop condition must block transform');
expect(stopCondition.includes('source/license acceptance'), 'stop condition must block source/license acceptance');
expect(stopCondition.includes('accepted text'), 'stop condition must block accepted text');

if (errors.length > 0) {
  for (const error of errors) console.error(`ERROR ${error}`);
  process.exit(1);
}

console.log(
  `Agent 3 row lineage passed: rows=${counts.row_lineage_rows} linked=${counts.continuity_rows_linked}/${counts.source_rid_rows_linked}/${counts.exact_subset_rows_linked}/${counts.boundary_triage_rows_linked}/${counts.split_closure_rows_linked} gaps=${counts.lineage_gap_rows}`,
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
