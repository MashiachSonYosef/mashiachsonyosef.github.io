#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input: 'reports/agent3-old-dictionary-pure-commercial-candidate-use-boundary-workset-2026-06-05.json',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_old_dictionary_pure_commercial_candidate_use_boundary_workset',
  'artifact_type mismatch',
);
expect(artifact.status === 'evidence-ready', 'status must be evidence-ready');

const boundary = artifact.authority_boundary || {};
for (const key of [
  'linkage_navigation_only',
  'boundary_workset_only',
  'candidate_use_planning_evidence_only',
  'pure_commercial_clean_membership_only',
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
const sourceFamilyRows = artifact.source_family_rows || [];
const sourceRidPrefixRows = artifact.source_rid_prefix_rows || [];

expect(worksetRows.length === counts.workset_rows, 'workset row length mismatch');
expect(blockerRows.length === counts.blocker_rows, 'blocker row length mismatch');
expect(sourceFamilyRows.length === counts.source_family_rows, 'source family row length mismatch');
expect(sourceRidPrefixRows.length === counts.source_rid_prefix_rows, 'source RID prefix row length mismatch');

expect(counts.boundary_triage_candidate_rows === 78, 'expected 78 boundary triage candidate rows');
expect(counts.boundary_triage_candidate_occurrences === 1461, 'expected 1461 boundary triage candidate occurrences');
expect(counts.workset_rows === 5, 'expected 5 workset rows');
expect(counts.workset_occurrences === 58, 'expected 58 workset occurrences');
expect(counts.unique_queue_ids === 5, 'expected 5 unique queue IDs');
expect(counts.duplicate_queue_ids === 0, 'queue IDs must be unique');
expect(counts.unique_token_ids === 5, 'expected 5 unique token IDs');
expect(counts.duplicate_token_ids === 0, 'token IDs must be unique');
expect(counts.source_family_rows === 1, 'expected 1 source family row');
expect(counts.source_family_set_rows === 1, 'expected 1 source family set');
expect(counts.source_rid_references === 6, 'expected 6 source RID references');
expect(counts.unique_source_rids === 6, 'expected 6 unique source RIDs');
expect(counts.source_rid_prefix_rows === 5, 'expected 5 source RID prefixes');
expect(counts.rows_with_agent1_rid_metadata === 5, 'expected 5 rows with Agent 1 RID metadata');
expect(counts.rows_missing_agent1_rid_metadata === 0, 'expected 0 rows missing Agent 1 RID metadata');
expect(counts.rows_with_all_source_rids_in_agent1_metadata === 5, 'expected 5 rows with all RIDs in Agent 1 metadata');
expect(counts.rows_missing_exact_subset === 0, 'expected 0 rows missing exact subset');
expect(counts.blocker_rows === 1, 'expected 1 blocker row');
expect(counts.rows_with_missing_family_boundary_links === 0, 'expected 0 missing family boundary links');
expect(counts.agent6_boundary_required_rows === 5, 'expected 5 Agent 6 boundary-required rows');
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

const expectedQueueIds = [
  'agent2-orot-gap-tok-d29b2c27700e',
  'agent2-orot-gap-tok-126d54d64a8c',
  'agent2-orot-gap-tok-e50370ece8ba',
  'agent2-orot-gap-tok-d6cbb8ff849c',
  'agent2-orot-gap-tok-f14e3500010d',
];
const actualQueueIds = worksetRows.map((row) => row.queue_id);
expect(JSON.stringify(actualQueueIds) === JSON.stringify(expectedQueueIds), 'workset queue order mismatch');

const worksetDedupeKeys = new Set();
for (const row of worksetRows) {
  expect(Boolean(row.queue_id), `${row.row_id} queue_id missing`);
  expect(Boolean(row.token_id), `${row.row_id} token_id missing`);
  expect(Number.isFinite(row.occurrences) && row.occurrences > 0, `${row.row_id} occurrences invalid`);
  expect(row.triage_group === 'commercial_clean_only', `${row.row_id} triage group mismatch`);
  expect(row.license_lane === 'commercial_clean_candidate', `${row.row_id} license_lane mismatch`);
  expect(row.exact_subset_status === 'matched_exact_subset_manifest', `${row.row_id} exact subset mismatch`);
  expect(row.bucket_id === 'commercial_clean_only', `${row.row_id} bucket mismatch`);
  expect(Array.isArray(row.classification_lanes), `${row.row_id} classification_lanes missing`);
  expect(row.classification_lanes.length === 1, `${row.row_id} classification lane count mismatch`);
  expect(row.classification_lanes[0] === 'commercial_clean_candidate', `${row.row_id} must be commercial-only`);
  expect(
    row.exact_blocker === 'commercial_clean_only_missing_future_agent6_candidate_use_boundary_and_morphology_relation',
    `${row.row_id} blocker mismatch`,
  );
  expect(Array.isArray(row.source_families) && row.source_families.length === 1, `${row.row_id} source family count mismatch`);
  expect(row.source_families[0] === 'Jastrow Dictionary', `${row.row_id} must be Jastrow-only`);
  expect(row.source_family_set_key === 'Jastrow Dictionary', `${row.row_id} source family set mismatch`);
  expect(row.missing_boundary_family_count === 0, `${row.row_id} missing boundary family links`);
  expect(Array.isArray(row.source_rids) && row.source_rids.length === row.source_rid_count, `${row.row_id} source RID count mismatch`);
  expect(row.source_rid_count === row.unique_source_rid_count, `${row.row_id} source RIDs must be unique per row`);
  expect(row.agent1_metadata_status === 'present', `${row.row_id} Agent 1 metadata missing`);
  expect(row.all_source_rids_in_agent1_metadata === true, `${row.row_id} source RID metadata mismatch`);
  expect(row.workset_role === 'agent6_boundary_candidate_exact_navigation_row_not_transform_authority', `${row.row_id} workset role mismatch`);
  expect(
    row.downstream_transform_status ===
      'not_transform_ready_missing_agent6_candidate_use_boundary_and_morphology_relation',
    `${row.row_id} downstream status mismatch`,
  );
  expect(Boolean(row.dedupe_key), `${row.row_id} dedupe key missing`);
  expect(!worksetDedupeKeys.has(row.dedupe_key), `${row.row_id} duplicate dedupe key`);
  worksetDedupeKeys.add(row.dedupe_key);
}

const blocker = blockerRows[0] || {};
expect(
  blocker.exact_blocker === 'commercial_clean_only_missing_future_agent6_candidate_use_boundary_and_morphology_relation',
  'blocker exact text mismatch',
);
expect(blocker.workset_rows === 5, 'blocker row count mismatch');
expect(blocker.workset_occurrences === 58, 'blocker occurrence count mismatch');
expect(blocker.status === 'exact_blocker_preserved_no_transform_authority', 'blocker status mismatch');

const sourceFamily = sourceFamilyRows[0] || {};
expect(sourceFamily.source_family === 'Jastrow Dictionary', 'source family must be Jastrow Dictionary');
expect(sourceFamily.workset_rows === 5, 'source family row count mismatch');
expect(sourceFamily.workset_occurrences === 58, 'source family occurrence count mismatch');
expect(sourceFamily.source_rid_references === 6, 'source family RID references mismatch');
expect(sourceFamily.unique_source_rids === 6, 'source family unique RIDs mismatch');
expect(
  sourceFamily.status === 'source_family_navigation_only_boundary_required_before_transform',
  'source family status mismatch',
);

const expectedPrefixes = new Map([
  ['E', { rows: 1, refs: 2 }],
  ['I', { rows: 1, refs: 1 }],
  ['M', { rows: 1, refs: 1 }],
  ['P', { rows: 1, refs: 1 }],
  ['U', { rows: 1, refs: 1 }],
]);
for (const row of sourceRidPrefixRows) {
  const expected = expectedPrefixes.get(row.source_rid_prefix);
  expect(Boolean(expected), `unexpected source RID prefix ${row.source_rid_prefix}`);
  if (expected) {
    expect(row.workset_rows === expected.rows, `${row.source_rid_prefix} workset rows mismatch`);
    expect(row.source_rid_references === expected.refs, `${row.source_rid_prefix} RID refs mismatch`);
  }
  expect(row.status === 'source_rid_prefix_navigation_only_no_source_text_read', `${row.source_rid_prefix} status mismatch`);
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
expect(stopCondition.includes('five-row workset'), 'stop condition must identify five-row workset');
expect(stopCondition.includes('does not authorize transform'), 'stop condition must block transform');
expect(stopCondition.includes('source/license acceptance'), 'stop condition must block source/license acceptance');
expect(stopCondition.includes('accepted text'), 'stop condition must block accepted text');

if (errors.length > 0) {
  for (const error of errors) console.error(`ERROR ${error}`);
  process.exit(1);
}

console.log(
  `Agent 3 pure commercial workset passed: rows=${counts.workset_rows} occurrences=${counts.workset_occurrences} rids=${counts.unique_source_rids}`,
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
