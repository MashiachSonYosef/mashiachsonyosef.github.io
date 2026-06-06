#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input: 'reports/agent3-old-dictionary-candidate-use-split-closure-crossmatch-2026-06-06.json',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_old_dictionary_candidate_use_split_closure_crossmatch',
  'artifact_type mismatch',
);
expect(artifact.status === 'evidence-ready', 'status must be evidence-ready');

const boundary = artifact.authority_boundary || {};
for (const key of [
  'linkage_navigation_only',
  'split_closure_only',
  'candidate_use_planning_evidence_only',
  'partition_membership_only',
  'source_rid_identifier_continuity_only',
  'source_family_blocker_navigation_only',
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
const partitionRows = artifact.partition_rows || [];
const blockerRows = artifact.blocker_rows || [];
const triageGroupRows = artifact.triage_group_rows || [];
const sourceFamilySetRows = artifact.source_family_set_rows || [];
const sharedSourceRidRows = artifact.shared_source_rid_rows || [];
const closureRows = artifact.closure_rows || [];

expect(closureRows.length === counts.closure_rows, 'closure row length mismatch');
expect(partitionRows.length === counts.partition_rows, 'partition row length mismatch');
expect(blockerRows.length === counts.blocker_rows, 'blocker row length mismatch');
expect(triageGroupRows.length === counts.triage_group_rows, 'triage group row length mismatch');
expect(sourceFamilySetRows.length === counts.source_family_set_rows, 'source family set row length mismatch');
expect(sharedSourceRidRows.length === counts.cross_partition_shared_source_rids, 'shared RID row length mismatch');

expect(counts.triage_candidate_rows === 78, 'expected 78 triage rows');
expect(counts.triage_candidate_occurrences === 1461, 'expected 1461 triage occurrences');
expect(counts.closure_rows === 78, 'expected 78 closure rows');
expect(counts.closure_occurrences === 1461, 'expected 1461 closure occurrences');
expect(counts.pure_workset_rows === 5, 'expected 5 pure workset rows');
expect(counts.pure_workset_occurrences === 58, 'expected 58 pure workset occurrences');
expect(counts.overlap_workset_rows === 73, 'expected 73 overlap workset rows');
expect(counts.overlap_workset_occurrences === 1403, 'expected 1403 overlap workset occurrences');
expect(counts.partition_rows === 2, 'expected 2 partition rows');
expect(counts.blocker_rows === 4, 'expected 4 blocker rows');
expect(counts.triage_group_rows === 4, 'expected 4 triage group rows');
expect(counts.source_family_set_rows === 4, 'expected 4 source family set rows');
expect(counts.closure_unique_queue_ids === 78, 'expected 78 unique closure queue IDs');
expect(counts.closure_duplicate_queue_ids === 0, 'expected 0 duplicate closure queue IDs');
expect(counts.closure_unique_token_ids === 78, 'expected 78 unique closure token IDs');
expect(counts.closure_duplicate_token_ids === 0, 'expected 0 duplicate closure token IDs');
expect(counts.missing_from_closure_rows === 0, 'expected 0 missing closure rows');
expect(counts.extra_in_closure_rows === 0, 'expected 0 extra closure rows');
expect(counts.cross_partition_duplicate_queue_ids === 0, 'expected 0 cross-partition duplicate queue IDs');
expect(counts.cross_partition_duplicate_token_ids === 0, 'expected 0 cross-partition duplicate token IDs');
expect(counts.source_rid_references === 393, 'expected 393 source RID references');
expect(counts.unique_source_rids === 344, 'expected 344 unique source RIDs');
expect(counts.pure_unique_source_rids === 6, 'expected 6 pure unique source RIDs');
expect(counts.overlap_unique_source_rids === 339, 'expected 339 overlap unique source RIDs');
expect(counts.cross_partition_shared_source_rids === 1, 'expected 1 shared source RID across partitions');
expect(counts.rows_with_agent1_rid_metadata === 78, 'expected 78 Agent 1 RID metadata rows');
expect(counts.rows_missing_agent1_rid_metadata === 0, 'expected 0 rows missing Agent 1 RID metadata');
expect(counts.rows_with_all_source_rids_in_agent1_metadata === 78, 'expected 78 rows with all RIDs in metadata');
expect(counts.rows_missing_exact_subset === 0, 'expected 0 rows missing exact subset');
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
    expect(row.candidate_rows === expected.rows, `${row.partition} rows mismatch`);
    expect(row.candidate_occurrences === expected.occ, `${row.partition} occurrences mismatch`);
    expect(row.source_rid_references === expected.refs, `${row.partition} RID refs mismatch`);
    expect(row.unique_source_rids === expected.unique, `${row.partition} unique RIDs mismatch`);
    expect(row.source_family_set_count === expected.sets, `${row.partition} source family set mismatch`);
    expect(row.exact_blocker_count === expected.blockers, `${row.partition} blocker count mismatch`);
  }
  expect(Boolean(row.status), `${row.partition} status missing`);
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
    expect(row.candidate_rows === expected.rows, `${row.exact_blocker} rows mismatch`);
    expect(row.candidate_occurrences === expected.occ, `${row.exact_blocker} occurrences mismatch`);
  }
  expect(row.status === 'exact_blocker_distribution_navigation_only_no_transform_authority', `${row.exact_blocker} status mismatch`);
}

const expectedTriage = new Map([
  ['commercial_clean_only', { rows: 5, occ: 58, partition: 'pure_commercial_workset' }],
  ['commercial_clean_nc_overlap', { rows: 9, occ: 115, partition: 'overlap_workset' }],
  ['commercial_clean_blocked_overlap', { rows: 8, occ: 164, partition: 'overlap_workset' }],
  ['commercial_clean_nc_blocked_overlap', { rows: 56, occ: 1124, partition: 'overlap_workset' }],
]);
for (const row of triageGroupRows) {
  const expected = expectedTriage.get(row.triage_group);
  expect(Boolean(expected), `unexpected triage group ${row.triage_group}`);
  if (expected) {
    expect(row.candidate_rows === expected.rows, `${row.triage_group} rows mismatch`);
    expect(row.candidate_occurrences === expected.occ, `${row.triage_group} occurrences mismatch`);
    expect(row.partitions.length === 1 && row.partitions[0] === expected.partition, `${row.triage_group} partition mismatch`);
  }
  expect(row.status === 'triage_group_partition_navigation_only', `${row.triage_group} status mismatch`);
}

const jastrowSet = sourceFamilySetRows.find((row) => row.source_family_set.join('|') === 'Jastrow Dictionary');
expect(Boolean(jastrowSet), 'Jastrow source family set row missing');
if (jastrowSet) {
  expect(jastrowSet.candidate_rows === 15, 'Jastrow set row count mismatch');
  expect(jastrowSet.candidate_occurrences === 190, 'Jastrow set occurrence mismatch');
  expect(jastrowSet.partitions.includes('pure_commercial_workset'), 'Jastrow set must include pure partition');
  expect(jastrowSet.partitions.includes('overlap_workset'), 'Jastrow set must include overlap partition');
}

expect(sharedSourceRidRows.length === 1, 'expected one shared RID row');
if (sharedSourceRidRows[0]) {
  expect(sharedSourceRidRows[0].source_rid === 'E00650', 'shared source RID must be E00650');
  expect(
    sharedSourceRidRows[0].status === 'source_rid_identifier_shared_across_partitions_navigation_only',
    'shared source RID status mismatch',
  );
}

const closureDedupeKeys = new Set();
for (const row of closureRows) {
  expect(['pure_commercial_workset', 'overlap_workset'].includes(row.partition), `${row.row_id} partition mismatch`);
  expect(Boolean(row.queue_id), `${row.row_id} queue_id missing`);
  expect(Boolean(row.token_id), `${row.row_id} token_id missing`);
  expect(Number.isFinite(row.occurrences) && row.occurrences > 0, `${row.row_id} occurrences invalid`);
  expect(row.license_lane === 'commercial_clean_candidate', `${row.row_id} license_lane mismatch`);
  expect(row.exact_subset_status === 'matched_exact_subset_manifest', `${row.row_id} exact subset mismatch`);
  expect(Boolean(row.exact_blocker), `${row.row_id} exact blocker missing`);
  expect(Array.isArray(row.source_families) && row.source_families.length > 0, `${row.row_id} source family missing`);
  expect(Array.isArray(row.source_rids) && row.source_rids.length === row.source_rid_count, `${row.row_id} source RID count mismatch`);
  expect(row.agent1_metadata_status === 'present', `${row.row_id} Agent 1 metadata missing`);
  expect(row.all_source_rids_in_agent1_metadata === true, `${row.row_id} source RID metadata mismatch`);
  expect(row.closure_role === 'split_partition_membership_navigation_only_no_transform_authority', `${row.row_id} closure role mismatch`);
  expect(Boolean(row.dedupe_key), `${row.row_id} dedupe key missing`);
  expect(!closureDedupeKeys.has(row.dedupe_key), `${row.row_id} duplicate dedupe key`);
  closureDedupeKeys.add(row.dedupe_key);
}

const forbiddenKeys = [];
walk(artifact, (key) => {
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
expect(stopCondition.includes('closure crossmatch'), 'stop condition must identify closure crossmatch');
expect(stopCondition.includes('does not authorize transform'), 'stop condition must block transform');
expect(stopCondition.includes('source/license acceptance'), 'stop condition must block source/license acceptance');
expect(stopCondition.includes('accepted text'), 'stop condition must block accepted text');

if (errors.length > 0) {
  for (const error of errors) console.error(`ERROR ${error}`);
  process.exit(1);
}

console.log(
  `Agent 3 split closure passed: rows=${counts.closure_rows} missing=${counts.missing_from_closure_rows} duplicates=${counts.closure_duplicate_queue_ids}`,
);

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function walk(value, callback) {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    for (const item of value) walk(item, callback);
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    callback(key, child);
    walk(child, callback);
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(root, filePath), 'utf8'));
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    const [key, value] = arg.split('=');
    if (!key.startsWith('--') || value === undefined) continue;
    if (key === '--input') parsed.input = cleanRelativePath(value);
  }
  return parsed;
}

function cleanRelativePath(value) {
  return value.replace(/^["']|["']$/g, '').replaceAll('\\', '/');
}
