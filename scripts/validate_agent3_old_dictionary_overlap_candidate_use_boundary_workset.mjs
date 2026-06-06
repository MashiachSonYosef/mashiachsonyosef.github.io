#!/usr/bin/env node
import fs from 'node:fs';

const artifactPath =
  process.argv[2] ||
  'reports/agent3-old-dictionary-overlap-candidate-use-boundary-workset-2026-06-06.json';

function fail(message) {
  console.error(`Validation failed: ${message}`);
  process.exit(1);
}

function readJson(path) {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (error) {
    fail(`could not read JSON ${path}: ${error.message}`);
  }
}

function expect(condition, message) {
  if (!condition) fail(message);
}

function walk(value, visit) {
  if (Array.isArray(value)) {
    for (const item of value) walk(item, visit);
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    visit(key, child);
    walk(child, visit);
  }
}

const artifact = readJson(artifactPath);

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_old_dictionary_overlap_candidate_use_boundary_workset',
  'artifact_type mismatch',
);
expect(artifact.status === 'evidence-ready', 'status must be evidence-ready');
expect(artifact.lane_owner === 'Agent 3', 'lane_owner must be Agent 3');

const boundary = artifact.authority_boundary || {};
for (const key of [
  'linkage_navigation_only',
  'boundary_workset_only',
  'candidate_use_planning_evidence_only',
  'overlap_membership_only',
  'source_family_selection_boundary_required',
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
const worksetRows = artifact.workset_rows || [];
const blockerRows = artifact.blocker_rows || [];
const triageGroupRows = artifact.triage_group_rows || [];
const sourceFamilyRows = artifact.source_family_rows || [];
const sourceFamilySetRows = artifact.source_family_set_rows || [];
const bucketSourceFamilySetRows = artifact.bucket_source_family_set_rows || [];
const sourceRidPrefixRows = artifact.source_rid_prefix_rows || [];

expect(worksetRows.length === counts.workset_rows, 'workset row length mismatch');
expect(blockerRows.length === counts.blocker_rows, 'blocker row length mismatch');
expect(triageGroupRows.length === counts.triage_group_rows, 'triage group row length mismatch');
expect(sourceFamilyRows.length === counts.source_family_rows, 'source family row length mismatch');
expect(sourceFamilySetRows.length === counts.source_family_set_rows, 'source family set row length mismatch');
expect(
  bucketSourceFamilySetRows.length === counts.bucket_source_family_set_rows,
  'bucket source family set row length mismatch',
);
expect(sourceRidPrefixRows.length === counts.source_rid_prefix_rows, 'source RID prefix row length mismatch');

const expectedCounts = {
  boundary_triage_candidate_rows: 78,
  boundary_triage_candidate_occurrences: 1461,
  workset_rows: 73,
  workset_occurrences: 1403,
  nc_overlap_rows: 65,
  nc_overlap_occurrences: 1239,
  blocked_overlap_rows: 64,
  blocked_overlap_occurrences: 1288,
  triple_overlap_rows: 56,
  triple_overlap_occurrences: 1124,
  unique_queue_ids: 73,
  duplicate_queue_ids: 0,
  unique_token_ids: 73,
  duplicate_token_ids: 0,
  source_family_rows: 3,
  source_family_set_rows: 4,
  bucket_source_family_set_rows: 7,
  source_rid_references: 387,
  unique_source_rids: 339,
  source_rid_prefix_rows: 20,
  rows_with_agent1_rid_metadata: 73,
  rows_missing_agent1_rid_metadata: 0,
  rows_with_all_source_rids_in_agent1_metadata: 73,
  rows_missing_exact_subset: 0,
  blocker_rows: 3,
  triage_group_rows: 3,
  rows_with_missing_family_boundary_links: 0,
  agent6_source_family_boundary_required_rows: 73,
  transform_ready_rows: 0,
};
for (const [key, expected] of Object.entries(expectedCounts)) {
  expect(counts[key] === expected, `${key} expected ${expected}, got ${counts[key]}`);
}

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

const expectedBlockers = new Map([
  ['commercial_clean_plus_blocked_overlap_missing_agent6_source_family_selection_boundary', { rows: 8, occurrences: 164 }],
  ['commercial_clean_plus_nc_overlap_missing_agent6_source_family_selection_boundary', { rows: 9, occurrences: 115 }],
  ['triple_overlap_missing_agent6_source_family_selection_boundary', { rows: 56, occurrences: 1124 }],
]);
for (const row of blockerRows) {
  const expected = expectedBlockers.get(row.exact_blocker);
  expect(Boolean(expected), `unexpected blocker ${row.exact_blocker}`);
  if (expected) {
    expect(row.workset_rows === expected.rows, `${row.exact_blocker} row count mismatch`);
    expect(row.workset_occurrences === expected.occurrences, `${row.exact_blocker} occurrence count mismatch`);
  }
  expect(row.status === 'exact_overlap_blocker_preserved_no_transform_authority', `${row.exact_blocker} status mismatch`);
  expect(Boolean(row.dedupe_key), `${row.exact_blocker} dedupe_key missing`);
}

const expectedTriage = new Map([
  ['commercial_clean_nc_overlap', { rows: 9, occurrences: 115 }],
  ['commercial_clean_blocked_overlap', { rows: 8, occurrences: 164 }],
  ['commercial_clean_nc_blocked_overlap', { rows: 56, occurrences: 1124 }],
]);
for (const row of triageGroupRows) {
  const expected = expectedTriage.get(row.triage_group);
  expect(Boolean(expected), `unexpected triage group ${row.triage_group}`);
  if (expected) {
    expect(row.workset_rows === expected.rows, `${row.triage_group} rows mismatch`);
    expect(row.workset_occurrences === expected.occurrences, `${row.triage_group} occurrences mismatch`);
  }
  expect(row.status === 'triage_group_navigation_only_agent6_boundary_required', `${row.triage_group} status mismatch`);
}

const allowedFamilies = new Set(['BDB Aramaic Dictionary', 'BDB Dictionary', 'Jastrow Dictionary']);
for (const row of sourceFamilyRows) {
  expect(allowedFamilies.has(row.source_family), `unexpected source family ${row.source_family}`);
  expect(row.workset_rows > 0, `${row.source_family} rows must be positive`);
  expect(row.workset_occurrences > 0, `${row.source_family} occurrences must be positive`);
  expect(
    row.status === 'source_family_navigation_only_boundary_required_before_transform',
    `${row.source_family} status mismatch`,
  );
}

for (const collection of [sourceFamilySetRows, bucketSourceFamilySetRows]) {
  const seen = new Set();
  for (const row of collection) {
    expect(Array.isArray(row.source_family_set) && row.source_family_set.length > 0, `${row.row_id} family set missing`);
    for (const family of row.source_family_set) expect(allowedFamilies.has(family), `${row.row_id} unexpected family ${family}`);
    expect(row.workset_rows > 0, `${row.row_id} rows must be positive`);
    expect(row.workset_occurrences > 0, `${row.row_id} occurrences must be positive`);
    expect(Boolean(row.dedupe_key), `${row.row_id} dedupe_key missing`);
    expect(!seen.has(row.dedupe_key), `${row.row_id} duplicate dedupe_key`);
    seen.add(row.dedupe_key);
  }
}

const queueIds = new Set();
const tokenIds = new Set();
for (const row of worksetRows) {
  expect(Boolean(row.queue_id), `${row.row_id} queue_id missing`);
  expect(Boolean(row.token_id), `${row.row_id} token_id missing`);
  expect(!queueIds.has(row.queue_id), `${row.row_id} duplicate queue_id`);
  expect(!tokenIds.has(row.token_id), `${row.row_id} duplicate token_id`);
  queueIds.add(row.queue_id);
  tokenIds.add(row.token_id);
  expect(Number.isFinite(row.occurrences) && row.occurrences > 0, `${row.row_id} occurrences invalid`);
  expect(row.license_lane === 'commercial_clean_candidate', `${row.row_id} license_lane mismatch`);
  expect(row.exact_subset_status === 'matched_exact_subset_manifest', `${row.row_id} exact subset mismatch`);
  expect(Array.isArray(row.classification_lanes), `${row.row_id} classification_lanes missing`);
  expect(row.classification_lanes.includes('commercial_clean_candidate'), `${row.row_id} missing commercial lane`);
  expect(row.classification_lanes.length > 1, `${row.row_id} must be overlap, not pure commercial`);
  expect(expectedBlockers.has(row.exact_blocker), `${row.row_id} unexpected exact_blocker`);
  expect(Array.isArray(row.source_families) && row.source_families.length > 0, `${row.row_id} source_families missing`);
  expect(row.missing_boundary_family_count === 0, `${row.row_id} missing boundary family links`);
  expect(Array.isArray(row.source_rids) && row.source_rids.length === row.source_rid_count, `${row.row_id} source RID count mismatch`);
  expect(row.agent1_metadata_status === 'present', `${row.row_id} Agent1 metadata missing`);
  expect(row.all_source_rids_in_agent1_metadata === true, `${row.row_id} source RID metadata mismatch`);
  expect(
    row.workset_role === 'agent6_source_family_selection_boundary_candidate_exact_navigation_row_not_transform_authority',
    `${row.row_id} workset role mismatch`,
  );
  expect(
    row.downstream_transform_status ===
      'not_transform_ready_overlap_requires_agent6_source_family_selection_boundary_no_text_or_route_output',
    `${row.row_id} downstream transform status mismatch`,
  );
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

const handoff = artifact.downstream_handoff || {};
expect(handoff.package_owner === 'Agent 10', 'handoff package_owner mismatch');
expect(handoff.source_lane_owner === 'Agent 1', 'handoff source_lane_owner mismatch');
expect(handoff.transform_owner_after_exact_boundary === 'Agent 2', 'handoff transform owner mismatch');
expect(handoff.qa_boundary_owner_if_needed === 'Agent 6', 'handoff QA owner mismatch');
for (const blocker of expectedBlockers.keys()) {
  expect(handoff.exact_blockers_preserved?.includes(blocker), `handoff missing blocker ${blocker}`);
}
expect(handoff.stop_condition?.includes('does not authorize transform'), 'handoff must block transform');
expect(handoff.stop_condition?.includes('source/license acceptance'), 'handoff must block source/license acceptance');
expect(handoff.stop_condition?.includes('accepted text'), 'handoff must block accepted text');

console.log(
  `Agent3 overlap candidate-use boundary workset validation passed. Rows: ${counts.workset_rows}; occurrences: ${counts.workset_occurrences}; blockers: ${blockerRows.length}.`,
);
