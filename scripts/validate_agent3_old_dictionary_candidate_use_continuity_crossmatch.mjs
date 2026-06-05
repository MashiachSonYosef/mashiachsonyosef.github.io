#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input: 'reports/agent3-old-dictionary-candidate-use-continuity-crossmatch-2026-06-05.json',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_old_dictionary_candidate_use_continuity_crossmatch',
  'artifact_type mismatch',
);
expect(artifact.status === 'evidence-ready', 'status must be evidence-ready');

const boundary = artifact.authority_boundary || {};
for (const key of [
  'linkage_navigation_only',
  'candidate_use_planning_evidence_only',
  'source_family_pointer_only',
  'source_rid_pointer_only',
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

const rows = artifact.rows || [];
const counts = artifact.counts || {};
expect(Array.isArray(rows), 'rows must be an array');
expect(rows.length === counts.candidate_use_rows, 'rows length must match candidate_use_rows');
expect(counts.candidate_use_rows === 78, 'expected 78 candidate-use rows');
expect(counts.candidate_use_occurrences === 1461, 'expected 1461 candidate-use occurrences');
expect(counts.agent2_package_rows === 78, 'expected Agent 2 package rows to be 78');
expect(counts.agent2_package_occurrences === 1461, 'expected Agent 2 package occurrences to be 1461');
expect(counts.agent6_verdict_package_rows === 78, 'expected Agent 6 verdict rows to be 78');
expect(counts.agent6_verdict_package_occurrences === 1461, 'expected Agent 6 verdict occurrences to be 1461');
expect(counts.unique_queue_ids === 78, 'expected 78 unique queue IDs');
expect(counts.duplicate_queue_ids === 0, 'queue IDs must be unique');
expect(counts.unique_token_ids === 78, 'expected 78 unique token IDs');
expect(counts.duplicate_token_ids === 0, 'token IDs must be unique');
expect(counts.source_family_values_observed === 3, 'expected 3 observed source families');
expect(counts.source_family_blocker_families === 3, 'expected 3 blocker source families');
expect(counts.rows_with_source_family_blocker_links === 78, 'every row must have at least one source-family blocker link');
expect(counts.source_family_blocker_links >= 78, 'expected at least one blocker link per row');
expect(counts.row_overlap_sample_index_tokens === 115, 'expected 115 row-overlap sample-index tokens');
expect(counts.row_overlap_sample_linked_rows > 0, 'expected some rows to link to prior sample index');
expect(
  counts.row_overlap_sample_linked_rows + counts.row_overlap_sample_unlinked_rows === counts.candidate_use_rows,
  'sample linked + unlinked rows must equal candidate-use rows',
);
expect(
  counts.row_overlap_sample_linked_occurrences + counts.row_overlap_sample_unlinked_occurrences ===
    counts.candidate_use_occurrences,
  'sample linked + unlinked occurrences must equal candidate-use occurrences',
);
expect(counts.transform_blocker_rows === 5, 'expected 5 transform blocker rows');
expect(counts.commercial_clean_candidate_rows === 78, 'expected 78 commercial clean candidate rows');
expect(counts.noncommercial_educational_candidate_rows === 0, 'expected zero NC rows');
expect(counts.exact_after_mark_strip_rows === 78, 'expected 78 exact_after_mark_strip rows');
expect(counts.agent2_morphology_relation_approved_rows === 78, 'expected 78 Agent 2 morphology-approved planning rows');
expect(counts.morphology_blocked_rows_excluded === 219, 'expected 219 morphology-blocked rows excluded');
expect(counts.agent10_current_exact_blockers === 1, 'expected Agent 10 blocker to be preserved');

for (const key of [
  'candidate_text_rows',
  'definition_content_rows',
  'lemma_content_rows',
  'reader_hint_content_rows',
  'answer_rows',
  'answer_eligible_rows',
  'public_emit_rows',
  'route_jsonl_rows',
  'route_shard_writes',
  'public_runtime_mutation',
  'release_actions',
  'source_text_rows',
  'accepted_text_rows',
  'route_payload_field_hits',
  'forbidden_payload_field_hits',
  'acceptance_claims',
]) {
  expect(counts[key] === 0, `${key} must be zero`);
}

const dedupeKeys = new Set();
const requiredFamilies = new Set(['BDB Aramaic Dictionary', 'BDB Dictionary', 'Jastrow Dictionary']);
for (const family of requiredFamilies) {
  expect((artifact.source_families_observed || []).includes(family), `missing observed source family ${family}`);
  expect(
    (artifact.source_family_blocker_families_observed || []).includes(family),
    `missing blocker source family ${family}`,
  );
}

for (const row of rows) {
  expect(Boolean(row.row_id), 'row_id missing');
  expect(Boolean(row.queue_id), `${row.row_id} queue_id missing`);
  expect(Boolean(row.token_id), `${row.row_id} token_id missing`);
  expect(Number.isFinite(row.occurrences) && row.occurrences > 0, `${row.row_id} occurrences must be positive`);
  expect(Array.isArray(row.source_families) && row.source_families.length > 0, `${row.row_id} source families missing`);
  expect(Number.isFinite(row.source_rid_count), `${row.row_id} source_rid_count missing`);
  expect(Array.isArray(row.source_rid_sample), `${row.row_id} source_rid_sample missing`);
  expect(row.license_lane === 'commercial_clean_candidate', `${row.row_id} license lane mismatch`);
  expect(row.morphology_relation_basis === 'exact_after_mark_strip', `${row.row_id} morphology basis mismatch`);
  expect(
    row.agent2_morphology_relation_status === 'agent2_morphology_relation_approved_for_nonpublic_planning',
    `${row.row_id} Agent 2 relation status mismatch`,
  );
  expect(row.candidate_use_scope === 'nonpublic_candidate_use_planning_input_only', `${row.row_id} scope mismatch`);
  expect(
    ['sample_linked_to_row_overlap_bucket', 'not_in_row_overlap_sample_index'].includes(row.row_overlap_sample_status),
    `${row.row_id} invalid sample status`,
  );
  if (row.row_overlap_sample_status === 'sample_linked_to_row_overlap_bucket') {
    expect(Boolean(row.row_overlap_sample_bucket), `${row.row_id} linked row missing bucket`);
    expect(Boolean(row.row_overlap_sample_row_subset_id), `${row.row_id} linked row missing row subset`);
  }
  expect(
    Array.isArray(row.source_family_blocker_links) && row.source_family_blocker_links.length > 0,
    `${row.row_id} source-family blocker links missing`,
  );
  expect(
    row.downstream_transform_status ===
      'blocked_pending_exact_agent1_agent6_boundary_fields_no_text_or_route_output',
    `${row.row_id} downstream transform status mismatch`,
  );
  expect(row.evidence_role === 'candidate_use_continuity_navigation_only', `${row.row_id} evidence role mismatch`);
  expect(Boolean(row.dedupe_key), `${row.row_id} dedupe_key missing`);
  expect(!dedupeKeys.has(row.dedupe_key), `${row.row_id} duplicate dedupe key`);
  dedupeKeys.add(row.dedupe_key);
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
expect(stopCondition.includes('Do not emit candidate text'), 'stop condition must block candidate text');
expect(stopCondition.includes('route writes'), 'stop condition must block route writes');
expect(stopCondition.includes('public/runtime mutations'), 'stop condition must block runtime mutation');
expect(stopCondition.includes('accepted text'), 'stop condition must block accepted text');

if (errors.length > 0) {
  for (const error of errors) console.error(`ERROR ${error}`);
  process.exit(1);
}

console.log(
  `Agent 3 old-dictionary candidate-use continuity crossmatch passed: rows=${counts.candidate_use_rows} occurrences=${counts.candidate_use_occurrences} sample_linked=${counts.row_overlap_sample_linked_rows} sample_unlinked=${counts.row_overlap_sample_unlinked_rows} blocker_rows=${counts.rows_with_source_family_blocker_links}`,
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
