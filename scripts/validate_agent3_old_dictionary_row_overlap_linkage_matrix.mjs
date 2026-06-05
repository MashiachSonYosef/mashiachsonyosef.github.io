#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input: 'reports/agent3-old-dictionary-row-overlap-linkage-matrix-2026-06-05.json',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_old_dictionary_row_overlap_linkage_matrix',
  'artifact_type mismatch',
);
expect(artifact.status === 'evidence-ready', 'status must be evidence-ready');
expect(artifact.authority_boundary?.linkage_navigation_only === true, 'linkage boundary missing');
expect(artifact.authority_boundary?.source_family_pointer_only === true, 'source family pointer boundary missing');
expect(artifact.authority_boundary?.row_overlap_dedupe_only === true, 'dedupe boundary missing');
expect(artifact.authority_boundary?.source_text_read === false, 'source text read boundary must be false');
expect(artifact.authority_boundary?.candidate_text_export === false, 'candidate text export must be false');
expect(artifact.authority_boundary?.definition_content_storage === false, 'definition content storage must be false');
expect(artifact.authority_boundary?.usage_as_definition_authority === false, 'usage-as-definition authority must be false');
expect(artifact.authority_boundary?.definition_authority === false, 'definition authority must be false');
expect(artifact.authority_boundary?.answer_selection === false, 'answer selection must be false');
expect(artifact.authority_boundary?.source_license_acceptance === false, 'source/license acceptance must be false');
expect(artifact.authority_boundary?.qa_acceptance === false, 'QA acceptance must be false');
expect(artifact.authority_boundary?.public_runtime_mutation === false, 'public runtime mutation must be false');
expect(artifact.authority_boundary?.accepted_gloss_text === false, 'accepted gloss text must be false');

const rows = artifact.rows || [];
const counts = artifact.counts || {};
expect(Array.isArray(rows), 'rows must be an array');
expect(rows.length === counts.bucket_rows, 'rows length must match bucket_rows');
expect(counts.bucket_rows === 8, 'expected 8 row-overlap buckets');
expect(counts.nonzero_bucket_rows === 6, 'expected 6 nonzero buckets');
expect(counts.zero_bucket_rows === 2, 'expected 2 zero buckets');
expect(counts.represented_rows === 500, 'expected 500 represented rows');
expect(counts.represented_occurrences === 8427, 'expected 8427 represented occurrences');
expect(counts.agent1_audited_rows === 500, 'expected Agent 1 audited rows to be 500');
expect(counts.agent1_audited_occurrences === 8427, 'expected Agent 1 audited occurrences to be 8427');
expect(counts.agent6_total_rows_represented === 500, 'expected Agent 6 represented rows to be 500');
expect(counts.agent6_total_occurrences_represented === 8427, 'expected Agent 6 represented occurrences to be 8427');
expect(counts.agent10_boundary_missing === 1, 'expected Agent 10 boundary blocker to be present');
expect(counts.rows_with_agent6_verdict_bucket === 8, 'every bucket must have Agent 6 bucket counts');
expect(counts.rows_with_boundary_question === 8, 'every bucket must have a boundary question record');
expect(counts.rows_with_agent2_lane_pointers === 5, 'expected 5 buckets with Agent 2 source-family pointers');
expect(counts.duplicate_sample_token_ids === 0, 'sample token IDs must not overlap across buckets');
expect(counts.duplicate_row_subset_ids === 0, 'row_subset_id values must be unique');
expect(counts.source_family_pointer_rows === 17, 'expected 17 source-family pointers across rows');
expect(counts.exact_blocker_rows === 6, 'expected 6 nonzero exact blocker rows');
expect(counts.audit_zero_row_records === 2, 'expected 2 audit-only zero rows');

for (const key of [
  'allowed_transform_rows_now',
  'candidate_text_rows_now',
  'definition_content_rows_now',
  'answer_rows_now',
  'public_hud_rows_now',
  'route_jsonl_rows_now',
  'agent6_delivery_now',
  'queue_mutation_count',
  'render_mutation_count',
  'staging_count',
  'release_actions',
  'source_text_read',
  'route_payload_field_hits',
  'forbidden_authority_field_hits',
  'acceptance_claims',
  'public_runtime_mutations',
]) {
  expect(counts[key] === 0, `${key} must be zero`);
}

const bucketIds = new Set();
const dedupeKeys = new Set();
for (const row of rows) {
  expect(Boolean(row.row_id), 'row_id missing');
  expect(Boolean(row.row_overlap_bucket), `${row.row_id} bucket missing`);
  expect(!bucketIds.has(row.row_overlap_bucket), `${row.row_id} duplicate bucket`);
  bucketIds.add(row.row_overlap_bucket);
  expect(Boolean(row.row_subset_id), `${row.row_id} row_subset_id missing`);
  expect(Array.isArray(row.classification_lanes), `${row.row_id} classification lanes missing`);
  expect(Array.isArray(row.sample_token_ids), `${row.row_id} sample_token_ids missing`);
  expect(Array.isArray(row.sample_rows), `${row.row_id} sample_rows missing`);
  expect(Array.isArray(row.agent2_source_family_pointers), `${row.row_id} source-family pointers missing`);
  expect(row.agent6_bucket !== null, `${row.row_id} Agent 6 bucket missing`);
  expect(Boolean(row.boundary_question_id), `${row.row_id} boundary question missing`);
  expect(Boolean(row.exact_blocker), `${row.row_id} exact blocker missing`);
  expect(Boolean(row.dedupe_key), `${row.row_id} dedupe_key missing`);
  expect(!dedupeKeys.has(row.dedupe_key), `${row.row_id} duplicate dedupe key`);
  dedupeKeys.add(row.dedupe_key);
  expect(row.current_allowed_now?.planning_evidence === true, `${row.row_id} planning evidence flag missing`);
  expect(row.current_allowed_now?.agent2_transform === false, `${row.row_id} agent2 transform flag must be false`);
  expect(row.current_allowed_now?.candidate_text_export === false, `${row.row_id} candidate export flag must be false`);
  expect(row.current_allowed_now?.definition_content_storage === false, `${row.row_id} definition storage flag must be false`);
  expect(row.current_allowed_now?.answer_eligibility === false, `${row.row_id} answer eligibility flag must be false`);
  expect(row.current_allowed_now?.public_emit === false, `${row.row_id} public emit flag must be false`);
  expect(row.current_allowed_now?.release_action === false, `${row.row_id} release action flag must be false`);
  expect(row.current_allowed_now?.agent6_delivery === false, `${row.row_id} Agent 6 delivery flag must be false`);
  expect(row.duplicate_sample_token_count === 0, `${row.row_id} has duplicate sample token overlap`);
  expect(row.agent6_bucket.rows === row.rows, `${row.row_id} Agent 6 row count mismatch`);
  expect(row.agent6_bucket.occurrences === row.occurrences, `${row.row_id} Agent 6 occurrence count mismatch`);
  if (row.rows === 0) {
    expect(row.status === 'audit_zero_row_record', `${row.row_id} zero row must be audit_zero_row_record`);
  } else {
    expect(row.status.startsWith('exact_blocker'), `${row.row_id} nonzero row must be exact blocker`);
  }
  for (const sample of row.sample_rows) {
    expect(Boolean(sample.token_id), `${row.row_id} sample token_id missing`);
    expect(!('surface' in sample), `${row.row_id} sample must not copy surface text`);
    expect(!('candidate_text' in sample), `${row.row_id} sample must not copy candidate text`);
  }
}

const requiredBuckets = [
  'commercial_clean_only',
  'commercial_clean_plus_noncommercial_educational',
  'commercial_clean_plus_blocked_review',
  'commercial_clean_plus_noncommercial_educational_plus_blocked_review',
  'noncommercial_educational_only',
  'blocked_review_only',
  'metadata_or_link_only',
  'no_sefaria_source_hit',
];
for (const bucketId of requiredBuckets) expect(bucketIds.has(bucketId), `missing bucket ${bucketId}`);

const forbiddenKeys = [];
walk(artifact, (key) => {
  if (['accepted_text', 'candidate_text', 'display_text', 'source_text', 'route_payload'].includes(key)) {
    forbiddenKeys.push(key);
  }
});
expect(forbiddenKeys.length === 0, `forbidden payload keys present: ${forbiddenKeys.join(', ')}`);

if (errors.length > 0) {
  for (const error of errors) console.error(`ERROR ${error}`);
  process.exit(1);
}

console.log(
  `Agent 3 old-dictionary row-overlap linkage matrix passed: rows=${counts.bucket_rows} represented=${counts.represented_rows}/${counts.represented_occurrences} sample_duplicates=${counts.duplicate_sample_token_ids} blockers=${counts.exact_blocker_rows}`,
);

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

function expect(condition, message) {
  if (!condition) errors.push(message);
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
