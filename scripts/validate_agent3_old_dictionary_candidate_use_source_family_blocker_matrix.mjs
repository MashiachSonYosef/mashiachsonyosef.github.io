#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input: 'reports/agent3-old-dictionary-candidate-use-source-family-blocker-matrix-2026-06-05.json',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_old_dictionary_candidate_use_source_family_blocker_matrix',
  'artifact_type mismatch',
);
expect(artifact.status === 'evidence-ready', 'status must be evidence-ready');

const boundary = artifact.authority_boundary || {};
for (const key of [
  'linkage_navigation_only',
  'source_family_membership_dedupe_only',
  'blocker_navigation_only',
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
const sourceFamilyRows = artifact.source_family_rows || [];
const sourceFamilySetRows = artifact.source_family_set_rows || [];

expect(counts.candidate_use_rows === 78, 'expected 78 candidate-use rows');
expect(counts.candidate_use_occurrences === 1461, 'expected 1461 candidate-use occurrences');
expect(counts.unique_queue_ids === 78, 'expected 78 unique queue IDs');
expect(counts.unique_token_ids === 78, 'expected 78 unique token IDs');
expect(counts.duplicate_queue_ids === 0, 'queue IDs must be unique');
expect(counts.duplicate_token_ids === 0, 'token IDs must be unique');
expect(counts.source_family_rows === 3, 'expected 3 source-family rows');
expect(counts.source_family_set_rows === 4, 'expected 4 source-family set rows');
expect(counts.source_family_membership_rows === 159, 'expected 159 source-family membership rows');
expect(counts.source_family_membership_occurrences === 3304, 'expected 3304 duplicated membership occurrences');
expect(counts.multi_family_candidate_rows === 60, 'expected 60 multi-family candidate rows');
expect(counts.multi_family_candidate_occurrences === 1227, 'expected 1227 multi-family occurrences');
expect(counts.single_family_candidate_rows === 18, 'expected 18 single-family candidate rows');
expect(counts.single_family_candidate_occurrences === 234, 'expected 234 single-family occurrences');
expect(counts.row_overlap_sample_linked_rows === 19, 'expected 19 linked prior-sample rows');
expect(counts.row_overlap_sample_unlinked_rows === 59, 'expected 59 unlinked prior-sample rows');
expect(counts.source_family_rows_with_blocker_links === 3, 'expected 3 source-family blocker-linked rows');
expect(counts.source_family_set_rows_with_blocker_links === 4, 'expected 4 source-family-set blocker-linked rows');
expect(counts.exact_blocker_rows === 3, 'expected 3 exact blocker source-family rows');

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

const requiredFamilies = new Map([
  ['BDB Aramaic Dictionary', { rows: 21, occurrences: 616, linked: 7, unlinked: 14 }],
  ['BDB Dictionary', { rows: 63, occurrences: 1271, linked: 11, unlinked: 52 }],
  ['Jastrow Dictionary', { rows: 75, occurrences: 1417, linked: 19, unlinked: 56 }],
]);

const familyDedupeKeys = new Set();
for (const row of sourceFamilyRows) {
  const expected = requiredFamilies.get(row.source_family);
  expect(Boolean(expected), `unexpected source family ${row.source_family}`);
  if (expected) {
    expect(row.candidate_rows === expected.rows, `${row.source_family} candidate row count mismatch`);
    expect(row.candidate_occurrences === expected.occurrences, `${row.source_family} occurrence count mismatch`);
    expect(row.row_overlap_sample_linked_rows === expected.linked, `${row.source_family} linked count mismatch`);
    expect(row.row_overlap_sample_unlinked_rows === expected.unlinked, `${row.source_family} unlinked count mismatch`);
  }
  expect(row.blocker_link !== null, `${row.source_family} blocker link missing`);
  expect(Boolean(row.row_subset_id), `${row.source_family} row_subset_id missing`);
  expect(row.license_lane === 'commercial_clean_candidate', `${row.source_family} license lane mismatch`);
  expect(row.status === 'exact_blocker_missing_exact_agent1_agent6_boundary_fields', `${row.source_family} status mismatch`);
  expect(Array.isArray(row.queue_id_sample), `${row.source_family} queue_id_sample missing`);
  expect(Array.isArray(row.token_id_sample), `${row.source_family} token_id_sample missing`);
  expect(Boolean(row.dedupe_key), `${row.source_family} dedupe_key missing`);
  expect(!familyDedupeKeys.has(row.dedupe_key), `${row.source_family} duplicate dedupe key`);
  familyDedupeKeys.add(row.dedupe_key);
}

const requiredSets = new Map([
  ['BDB Aramaic Dictionary|BDB Dictionary|Jastrow Dictionary', { rows: 21, occurrences: 616 }],
  ['BDB Dictionary|Jastrow Dictionary', { rows: 39, occurrences: 611 }],
  ['BDB Dictionary', { rows: 3, occurrences: 44 }],
  ['Jastrow Dictionary', { rows: 15, occurrences: 190 }],
]);

const setDedupeKeys = new Set();
for (const row of sourceFamilySetRows) {
  const key = row.source_family_set.join('|');
  const expected = requiredSets.get(key);
  expect(Boolean(expected), `unexpected source-family set ${key}`);
  if (expected) {
    expect(row.candidate_rows === expected.rows, `${key} candidate row count mismatch`);
    expect(row.candidate_occurrences === expected.occurrences, `${key} occurrence count mismatch`);
  }
  expect(row.blocker_links.length === row.source_family_set.length, `${key} must have one blocker per source family`);
  expect(row.status === 'exact_blocker_source_family_set_requires_boundary_selection_before_transform', `${key} status mismatch`);
  expect(Array.isArray(row.queue_id_sample), `${key} queue_id_sample missing`);
  expect(Array.isArray(row.token_id_sample), `${key} token_id_sample missing`);
  expect(Boolean(row.dedupe_key), `${key} dedupe_key missing`);
  expect(!setDedupeKeys.has(row.dedupe_key), `${key} duplicate dedupe key`);
  setDedupeKeys.add(row.dedupe_key);
}

expect(artifact.family_membership_counts?.['1'] === 18, 'expected 18 single-family membership count rows');
expect(artifact.family_membership_counts?.['2'] === 39, 'expected 39 two-family rows');
expect(artifact.family_membership_counts?.['3'] === 21, 'expected 21 three-family rows');

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
expect(stopCondition.includes('duplicated source-family memberships'), 'stop condition must describe membership dedupe');
expect(stopCondition.includes('Do not emit candidate text'), 'stop condition must block candidate text');
expect(stopCondition.includes('route writes'), 'stop condition must block route writes');
expect(stopCondition.includes('public/runtime mutations'), 'stop condition must block runtime mutation');
expect(stopCondition.includes('accepted text'), 'stop condition must block accepted text');

if (errors.length > 0) {
  for (const error of errors) console.error(`ERROR ${error}`);
  process.exit(1);
}

console.log(
  `Agent 3 candidate-use source-family blocker matrix passed: candidate_rows=${counts.candidate_use_rows} memberships=${counts.source_family_membership_rows} families=${counts.source_family_rows} family_sets=${counts.source_family_set_rows} blockers=${counts.exact_blocker_rows}`,
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
