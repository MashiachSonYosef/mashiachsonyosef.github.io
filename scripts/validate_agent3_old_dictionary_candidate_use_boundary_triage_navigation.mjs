#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input: 'reports/agent3-old-dictionary-candidate-use-boundary-triage-navigation-2026-06-05.json',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_old_dictionary_candidate_use_boundary_triage_navigation',
  'artifact_type mismatch',
);
expect(artifact.status === 'evidence-ready', 'status must be evidence-ready');

const boundary = artifact.authority_boundary || {};
for (const key of [
  'linkage_navigation_only',
  'boundary_triage_only',
  'candidate_use_planning_evidence_only',
  'exact_subset_membership_only',
  'source_rid_identifier_continuity_only',
  'source_family_blocker_navigation_only',
]) {
  expect(boundary[key] === true, `authority_boundary.${key} must be true`);
}
for (const key of [
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
const candidateRows = artifact.candidate_rows || [];
const triageRows = artifact.triage_rows || [];
const sourceFamilySetRows = artifact.source_family_set_rows || [];
const bucketSourceFamilySetRows = artifact.bucket_source_family_set_rows || [];

expect(candidateRows.length === counts.candidate_use_rows, 'candidate row length mismatch');
expect(triageRows.length === counts.triage_rows, 'triage row length mismatch');
expect(sourceFamilySetRows.length === counts.source_family_set_rows, 'source family set row length mismatch');
expect(
  bucketSourceFamilySetRows.length === counts.bucket_source_family_set_rows,
  'bucket source family set row length mismatch',
);

expect(counts.candidate_use_rows === 78, 'expected 78 candidate-use rows');
expect(counts.candidate_use_occurrences === 1461, 'expected 1461 candidate-use occurrences');
expect(counts.candidate_rows_matched_to_exact_subset === 78, 'expected 78 exact-subset matches');
expect(counts.candidate_rows_missing_exact_subset === 0, 'expected 0 exact-subset misses');
expect(counts.candidate_rows_with_agent1_rid_metadata === 78, 'expected 78 Agent 1 RID metadata rows');
expect(counts.candidate_rows_missing_agent1_rid_metadata === 0, 'expected 0 missing Agent 1 RID metadata rows');
expect(counts.source_rid_references === 393, 'expected 393 source-RID references');
expect(counts.unique_source_rids === 344, 'expected 344 unique source RIDs');
expect(counts.source_family_set_rows === 4, 'expected 4 source family sets');
expect(counts.triage_rows === 4, 'expected 4 triage rows');
expect(counts.pure_commercial_clean_rows === 5, 'expected 5 pure commercial-clean rows');
expect(counts.pure_commercial_clean_occurrences === 58, 'expected 58 pure commercial-clean occurrences');
expect(counts.pure_commercial_clean_rows_with_agent1_rid_metadata === 5, 'expected 5 pure rows with RID metadata');
expect(counts.pure_commercial_clean_source_rid_references === 6, 'expected 6 pure source-RID references');
expect(counts.pure_commercial_clean_unique_source_rids === 6, 'expected 6 pure unique source RIDs');
expect(counts.overlap_rows === 73, 'expected 73 overlap rows');
expect(counts.overlap_occurrences === 1403, 'expected 1403 overlap occurrences');
expect(counts.nc_overlap_rows === 65, 'expected 65 NC-overlap rows');
expect(counts.nc_overlap_occurrences === 1239, 'expected 1239 NC-overlap occurrences');
expect(counts.blocked_overlap_rows === 64, 'expected 64 blocked-overlap rows');
expect(counts.blocked_overlap_occurrences === 1288, 'expected 1288 blocked-overlap occurrences');
expect(counts.triple_overlap_rows === 56, 'expected 56 triple-overlap rows');
expect(counts.triple_overlap_occurrences === 1124, 'expected 1124 triple-overlap occurrences');
expect(counts.rows_with_missing_family_boundary_links === 0, 'expected 0 missing family boundary links');
expect(counts.rows_missing_source_rid_metadata === 0, 'expected 0 rows missing source RID metadata');
expect(counts.unique_queue_ids === 78, 'expected 78 unique queue IDs');
expect(counts.duplicate_queue_ids === 0, 'queue IDs must be unique');
expect(counts.unique_token_ids === 78, 'expected 78 unique token IDs');
expect(counts.duplicate_token_ids === 0, 'token IDs must be unique');
expect(counts.agent10_commercial_clean_source_family_subsets === 3, 'expected 3 Agent 10 family subsets');
expect(counts.agent10_commercial_clean_source_family_hit_rows === 500, 'expected 500 family-hit rows');
expect(counts.agent10_commercial_clean_source_family_hit_occurrences === 10940, 'expected 10940 family-hit occurrences');
expect(counts.agent2_may_author_nonpublic_transform_candidate_package === 0, 'Agent 2 transform authoring must remain false');
expect(counts.exact_agent6_boundary_required === 1, 'Agent 6 exact boundary must be required');
expect(counts.approved_morphology_relation_required === 1, 'approved morphology relation must be required');

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

const expectedTriage = new Map([
  ['commercial_clean_only', { rows: 5, occurrences: 58, ridRefs: 6, uniqueRids: 6 }],
  ['commercial_clean_nc_overlap', { rows: 9, occurrences: 115, ridRefs: 25, uniqueRids: 25 }],
  ['commercial_clean_blocked_overlap', { rows: 8, occurrences: 164, ridRefs: 54, uniqueRids: 47 }],
  ['commercial_clean_nc_blocked_overlap', { rows: 56, occurrences: 1124, ridRefs: 308, uniqueRids: 283 }],
]);
for (const row of triageRows) {
  const expected = expectedTriage.get(row.triage_group);
  expect(Boolean(expected), `unexpected triage group ${row.triage_group}`);
  if (expected) {
    expect(row.candidate_rows === expected.rows, `${row.triage_group} row count mismatch`);
    expect(row.candidate_occurrences === expected.occurrences, `${row.triage_group} occurrence count mismatch`);
    expect(row.source_rid_references === expected.ridRefs, `${row.triage_group} RID references mismatch`);
    expect(row.unique_source_rids === expected.uniqueRids, `${row.triage_group} unique RID mismatch`);
  }
  expect(Boolean(row.blocker_status), `${row.triage_group} blocker_status missing`);
  expect(Boolean(row.dedupe_key), `${row.triage_group} dedupe_key missing`);
}

const sourceFamilySetDedupeKeys = new Set();
for (const row of sourceFamilySetRows) {
  expect(Array.isArray(row.source_family_set) && row.source_family_set.length > 0, `${row.row_id} source family set missing`);
  expect(row.candidate_rows > 0, `${row.row_id} candidate rows must be positive`);
  expect(row.candidate_occurrences > 0, `${row.row_id} candidate occurrences must be positive`);
  expect(row.status === 'source_family_set_navigation_only_boundary_required_before_transform', `${row.row_id} status mismatch`);
  expect(Boolean(row.dedupe_key), `${row.row_id} dedupe key missing`);
  expect(!sourceFamilySetDedupeKeys.has(row.dedupe_key), `${row.row_id} duplicate dedupe key`);
  sourceFamilySetDedupeKeys.add(row.dedupe_key);
}

const bucketSetDedupeKeys = new Set();
for (const row of bucketSourceFamilySetRows) {
  expect(Boolean(row.bucket_id), `${row.row_id} bucket_id missing`);
  expect(Array.isArray(row.source_family_set) && row.source_family_set.length > 0, `${row.row_id} source family set missing`);
  expect(row.candidate_rows > 0, `${row.row_id} candidate rows must be positive`);
  expect(row.candidate_occurrences > 0, `${row.row_id} candidate occurrences must be positive`);
  expect(Boolean(row.exact_blocker), `${row.row_id} exact blocker missing`);
  expect(row.status === 'bucket_to_source_family_set_navigation_only_boundary_required_before_transform', `${row.row_id} status mismatch`);
  expect(Boolean(row.dedupe_key), `${row.row_id} dedupe key missing`);
  expect(!bucketSetDedupeKeys.has(row.dedupe_key), `${row.row_id} duplicate dedupe key`);
  bucketSetDedupeKeys.add(row.dedupe_key);
}

const candidateDedupeKeys = new Set();
for (const row of candidateRows) {
  expect(Boolean(row.queue_id), `${row.row_id} queue_id missing`);
  expect(Boolean(row.token_id), `${row.row_id} token_id missing`);
  expect(Number.isFinite(row.occurrences) && row.occurrences > 0, `${row.row_id} occurrences invalid`);
  expect(row.license_lane === 'commercial_clean_candidate', `${row.row_id} license_lane mismatch`);
  expect(row.exact_subset_status === 'matched_exact_subset_manifest', `${row.row_id} exact subset status mismatch`);
  expect(Boolean(row.bucket_id), `${row.row_id} bucket_id missing`);
  expect(Array.isArray(row.classification_lanes) && row.classification_lanes.length > 0, `${row.row_id} lanes missing`);
  expect(row.classification_lanes.includes('commercial_clean_candidate'), `${row.row_id} must include commercial lane`);
  expect(Boolean(row.exact_blocker), `${row.row_id} exact blocker missing`);
  expect(Array.isArray(row.source_families) && row.source_families.length > 0, `${row.row_id} source families missing`);
  expect(Array.isArray(row.source_rids) && row.source_rids.length === row.source_rid_count, `${row.row_id} source RID count mismatch`);
  expect(row.agent1_metadata_status === 'present', `${row.row_id} Agent 1 metadata must be present`);
  expect(row.all_source_rids_in_agent1_metadata === true, `${row.row_id} all source RIDs must be in Agent 1 metadata`);
  expect(row.missing_boundary_family_count === 0, `${row.row_id} missing boundary family links`);
  expect(
    row.evidence_role ===
      'candidate_use_boundary_navigation_only_exact_subset_source_family_source_rid_join_no_text_payload',
    `${row.row_id} evidence role mismatch`,
  );
  expect(row.downstream_transform_status.startsWith('not_transform_ready_'), `${row.row_id} downstream status mismatch`);
  expect(Boolean(row.dedupe_key), `${row.row_id} dedupe key missing`);
  expect(!candidateDedupeKeys.has(row.dedupe_key), `${row.row_id} duplicate dedupe key`);
  candidateDedupeKeys.add(row.dedupe_key);
}

const pureRows = candidateRows.filter((row) => row.triage_group === 'commercial_clean_only');
expect(pureRows.length === 5, 'pure commercial-clean candidate row recount mismatch');
expect(
  pureRows.every((row) => row.source_family_set_key === 'Jastrow Dictionary'),
  'pure commercial-clean rows must be Jastrow-only in this packet',
);

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
expect(stopCondition.includes('linkage/navigation triage only'), 'stop condition must describe navigation-only use');
expect(stopCondition.includes('does not authorize transform'), 'stop condition must block transform');
expect(stopCondition.includes('route publication'), 'stop condition must block route publication');
expect(stopCondition.includes('accepted text'), 'stop condition must block accepted text');

if (errors.length > 0) {
  for (const error of errors) console.error(`ERROR ${error}`);
  process.exit(1);
}

console.log(
  `Agent 3 boundary triage navigation passed: candidate_rows=${counts.candidate_use_rows} pure_clean=${counts.pure_commercial_clean_rows} overlap=${counts.overlap_rows} bucket_family_sets=${counts.bucket_source_family_set_rows}`,
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
