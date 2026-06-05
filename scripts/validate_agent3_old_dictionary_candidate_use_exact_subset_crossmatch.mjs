#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input: 'reports/agent3-old-dictionary-candidate-use-exact-subset-crossmatch-2026-06-05.json',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_old_dictionary_candidate_use_exact_subset_crossmatch',
  'artifact_type mismatch',
);
expect(artifact.status === 'evidence-ready', 'status must be evidence-ready');

const boundary = artifact.authority_boundary || {};
for (const key of [
  'linkage_navigation_only',
  'exact_subset_membership_only',
  'candidate_use_planning_evidence_only',
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
const subsetRows = artifact.subset_rows || [];

expect(candidateRows.length === counts.candidate_use_rows, 'candidate row length mismatch');
expect(subsetRows.length === counts.exact_subset_manifest_rows, 'subset row length mismatch');
expect(counts.candidate_use_rows === 78, 'expected 78 candidate-use rows');
expect(counts.candidate_use_occurrences === 1461, 'expected 1461 candidate-use occurrences');
expect(counts.exact_subset_manifest_rows === 8, 'expected 8 subset manifests');
expect(counts.exact_subset_manifest_total_rows === 500, 'expected 500 manifest rows');
expect(counts.exact_subset_manifest_total_occurrences === 8427, 'expected 8427 manifest occurrences');
expect(counts.candidate_rows_matched_to_manifest === 78, 'all candidate rows must match exact subset manifest');
expect(counts.candidate_rows_missing_manifest_subset === 0, 'no candidate row may miss exact subset manifest');
expect(counts.candidate_subset_rows_with_candidates === 4, 'expected 4 subset rows with candidates');
expect(counts.candidate_subset_rows_without_candidates === 4, 'expected 4 subset rows without candidates');
expect(counts.candidate_rows_commercial_clean_only === 5, 'expected 5 pure commercial-clean candidates');
expect(counts.candidate_occurrences_commercial_clean_only === 58, 'expected 58 pure commercial-clean occurrences');
expect(counts.candidate_rows_with_nc_overlap === 65, 'expected 65 NC-overlap candidate rows');
expect(counts.candidate_occurrences_with_nc_overlap === 1239, 'expected 1239 NC-overlap occurrences');
expect(counts.candidate_rows_with_blocked_overlap === 64, 'expected 64 blocked-overlap candidate rows');
expect(counts.candidate_occurrences_with_blocked_overlap === 1288, 'expected 1288 blocked-overlap occurrences');
expect(counts.candidate_rows_with_nc_and_blocked_overlap === 56, 'expected 56 triple-overlap candidate rows');
expect(counts.candidate_occurrences_with_nc_and_blocked_overlap === 1124, 'expected 1124 triple-overlap occurrences');
expect(counts.unique_queue_ids === 78, 'expected 78 unique queue IDs');
expect(counts.duplicate_queue_ids === 0, 'queue IDs must be unique');
expect(counts.unique_token_ids === 78, 'expected 78 unique token IDs');
expect(counts.duplicate_token_ids === 0, 'token IDs must be unique');
expect(counts.agent6_verdict_subset_rows === 8, 'Agent 6 subset rows must be 8');
expect(counts.agent6_verdict_rows_sum === 500, 'Agent 6 rows sum must be 500');
expect(counts.agent6_verdict_occurrences_sum === 8427, 'Agent 6 occurrences sum must be 8427');
expect(counts.agent10_consumption_subset_rows === 8, 'Agent 10 consumption subset rows must be 8');
expect(counts.agent10_consumption_rows_sum === 500, 'Agent 10 consumption rows sum must be 500');
expect(counts.agent10_consumption_occurrences_sum === 8427, 'Agent 10 consumption occurrences sum must be 8427');

for (const key of [
  'candidate_text_rows',
  'definition_content_rows',
  'lemma_content_rows',
  'reader_hint_content_rows',
  'answer_rows',
  'answer_eligible_rows',
  'route_jsonl_rows',
  'route_shard_writes',
  'public_runtime_mutation',
  'source_text_rows',
  'accepted_text_rows',
  'release_actions',
  'route_payload_field_hits',
  'forbidden_payload_field_hits',
  'acceptance_claims',
]) {
  expect(counts[key] === 0, `${key} must be zero`);
}

const expectedSubsets = new Map([
  ['commercial_clean_only', { manifestRows: 18, candidateRows: 5, occurrences: 58 }],
  ['commercial_clean_plus_noncommercial_educational', { manifestRows: 57, candidateRows: 9, occurrences: 115 }],
  ['commercial_clean_plus_blocked_review', { manifestRows: 82, candidateRows: 8, occurrences: 164 }],
  [
    'commercial_clean_plus_noncommercial_educational_plus_blocked_review',
    { manifestRows: 140, candidateRows: 56, occurrences: 1124 },
  ],
  ['noncommercial_educational_only', { manifestRows: 17, candidateRows: 0, occurrences: 0 }],
  ['blocked_review_only', { manifestRows: 0, candidateRows: 0, occurrences: 0 }],
  ['metadata_or_link_only', { manifestRows: 0, candidateRows: 0, occurrences: 0 }],
  ['no_sefaria_source_hit', { manifestRows: 186, candidateRows: 0, occurrences: 0 }],
]);

const subsetDedupeKeys = new Set();
for (const row of subsetRows) {
  const expected = expectedSubsets.get(row.bucket_id);
  expect(Boolean(expected), `unexpected subset ${row.bucket_id}`);
  if (expected) {
    expect(row.manifest_rows === expected.manifestRows, `${row.bucket_id} manifest rows mismatch`);
    expect(row.candidate_rows === expected.candidateRows, `${row.bucket_id} candidate rows mismatch`);
    expect(row.candidate_occurrences === expected.occurrences, `${row.bucket_id} candidate occurrences mismatch`);
  }
  expect(Array.isArray(row.classification_lanes), `${row.bucket_id} classification_lanes missing`);
  expect(Boolean(row.blocker_preserved), `${row.bucket_id} blocker missing`);
  if (row.candidate_rows > 0) {
    expect(
      row.status === 'exact_blocker_subset_boundary_preserved_for_candidate_rows',
      `${row.bucket_id} candidate subset status mismatch`,
    );
  } else {
    expect(row.status === 'audit_only_no_candidate_rows_in_subset', `${row.bucket_id} empty subset status mismatch`);
  }
  expect(Boolean(row.dedupe_key), `${row.bucket_id} dedupe_key missing`);
  expect(!subsetDedupeKeys.has(row.dedupe_key), `${row.bucket_id} duplicate dedupe key`);
  subsetDedupeKeys.add(row.dedupe_key);
}

const candidateDedupeKeys = new Set();
for (const row of candidateRows) {
  expect(Boolean(row.queue_id), `${row.row_id} queue_id missing`);
  expect(Boolean(row.token_id), `${row.row_id} token_id missing`);
  expect(Number.isFinite(row.occurrences) && row.occurrences > 0, `${row.row_id} occurrences invalid`);
  expect(row.license_lane === 'commercial_clean_candidate', `${row.row_id} license lane mismatch`);
  expect(row.exact_subset_status === 'matched_exact_subset_manifest', `${row.row_id} subset status mismatch`);
  expect(Boolean(row.row_subset_id), `${row.row_id} row_subset_id missing`);
  expect(Boolean(row.bucket_id), `${row.row_id} bucket_id missing`);
  expect(Array.isArray(row.classification_lanes) && row.classification_lanes.length > 0, `${row.row_id} lanes missing`);
  expect(row.classification_lanes.includes('commercial_clean_candidate'), `${row.row_id} must include commercial lane`);
  expect(Boolean(row.exact_blocker), `${row.row_id} exact blocker missing`);
  expect(row.evidence_role === 'exact_subset_membership_navigation_only', `${row.row_id} evidence role mismatch`);
  expect(
    row.downstream_transform_status ===
      'blocked_pending_exact_agent1_agent6_boundary_fields_no_text_or_route_output',
    `${row.row_id} downstream status mismatch`,
  );
  expect(Boolean(row.dedupe_key), `${row.row_id} dedupe_key missing`);
  expect(!candidateDedupeKeys.has(row.dedupe_key), `${row.row_id} duplicate dedupe key`);
  candidateDedupeKeys.add(row.dedupe_key);
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
expect(stopCondition.includes('membership/navigation evidence only'), 'stop condition must describe evidence-only use');
expect(stopCondition.includes('Do not transform'), 'stop condition must block transform');
expect(stopCondition.includes('candidate text'), 'stop condition must block candidate text');
expect(stopCondition.includes('route writes'), 'stop condition must block route writes');
expect(stopCondition.includes('accepted text'), 'stop condition must block accepted text');

if (errors.length > 0) {
  for (const error of errors) console.error(`ERROR ${error}`);
  process.exit(1);
}

console.log(
  `Agent 3 exact-subset crossmatch passed: candidate_rows=${counts.candidate_use_rows} matched=${counts.candidate_rows_matched_to_manifest} pure_clean=${counts.candidate_rows_commercial_clean_only} nc_overlap=${counts.candidate_rows_with_nc_overlap} blocked_overlap=${counts.candidate_rows_with_blocked_overlap}`,
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
