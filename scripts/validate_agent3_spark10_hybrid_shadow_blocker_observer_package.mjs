#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath =
  process.argv[2] || 'reports/agent3-spark10-hybrid-shadow-blocker-observer-package-2026-06-04.json';
const artifact = readJson(artifactPath);
const issues = [];
const warnings = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_spark10_hybrid_shadow_blocker_observer_package',
  'unexpected artifact_type',
);
expect(
  [
    'spark10_hybrid_shadow_missing_pipeline_contract_observed',
    'spark10_hybrid_shadow_queue_row_missing_observed',
  ].includes(artifact.status),
  'unexpected status',
);
expect(artifact.publication_state === 'blocked_no_render', 'publication_state must be blocked_no_render');
expect(artifact.lane_owner === 'Agent 3', 'lane_owner must be Agent 3');

const reviewedInputs = artifact.reviewed_inputs || [];
expect(reviewedInputs.length === 8, 'reviewed input count must be 8');
for (const input of reviewedInputs) {
  expect(Boolean(input.role), 'reviewed input role missing');
  expect(Boolean(input.path), `reviewed input path missing for ${input.role}`);
  expect(fs.existsSync(resolve(input.path)), `reviewed input does not exist: ${input.path}`);
  expect(/^[a-f0-9]{64}$/.test(input.sha256 || ''), `reviewed input sha256 invalid: ${input.path}`);
  if (fs.existsSync(resolve(input.path)) && input.sha256 !== sha256(fs.readFileSync(resolve(input.path)))) {
    warnings.push(`reviewed input drifted after package build: ${input.path}`);
  }
  expect(Number.isInteger(input.bytes) && input.bytes > 0, `reviewed input bytes invalid: ${input.path}`);
}

expect(artifact.queue_item_observed?.id === 'spark10-hybrid-floor-release-relevance-shadow', 'queue item id mismatch');
const queueRowMissing = artifact.queue_item_observed?.exists === false;
if (queueRowMissing) {
  expect(artifact.queue_item_observed?.status === null, 'missing queue item status must be null');
  expect(artifact.queue_item_observed?.expected_output === null, 'missing queue item expected output must be null');
} else {
  expect(
    artifact.queue_item_observed?.status === 'active_reseed_needed_after_agent1_agent3_orot_returns',
    'queue item status mismatch',
  );
  expect(artifact.queue_item_observed?.expected_output === 'reports/spark10-hybrid-floor-release-relevance-shadow-2026-06-04.md', 'expected output mismatch');
}
expect(Array.isArray(artifact.queue_item_observed?.inputs), 'queue inputs must be an array');
expect(artifact.counts?.queue_inputs_expected === artifact.queue_item_observed.inputs.length, 'queue input expected count mismatch');
expect(artifact.counts?.queue_inputs_present === artifact.queue_item_observed.inputs.filter((input) => input.exists).length, 'queue input present count mismatch');
expect(artifact.counts?.queue_inputs_missing === 0, 'queue input missing count must be 0');
expect(Array.isArray(artifact.queue_item_observed?.missing_inputs), 'missing inputs must be array');
expect(artifact.queue_item_observed.missing_inputs.length === 0, 'queue item should have no missing inputs now');
if (queueRowMissing) {
  expect(
    JSON.stringify(artifact.queue_item_observed?.missing_contract_fields) === JSON.stringify(['missing_queue_row']),
    'missing queue row contract field mismatch',
  );
} else {
  expect(
    JSON.stringify(artifact.queue_item_observed?.missing_contract_fields) ===
      JSON.stringify(['pipeline_commands', 'output_schema', 'validator_gate']),
    'missing contract fields mismatch',
  );
}
expect(
  artifact.counts?.missing_contract_fields === artifact.queue_item_observed.missing_contract_fields.length,
  'missing contract field count mismatch',
);

if (queueRowMissing) {
  expect(
    ['missing_pipeline_blocker', 'not_detected'].includes(artifact.spark10_primary_status_observed?.blocker),
    'Spark10 status blocker mismatch',
  );
  expect(
    ['stale_missing_input_blocker_report', 'unknown'].includes(artifact.stale_shadow_observed?.status),
    'stale shadow status mismatch',
  );
} else {
  expect(artifact.spark10_primary_status_observed?.blocker === 'missing_pipeline_blocker', 'Spark10 status blocker mismatch');
  expect(
    artifact.spark10_primary_status_observed?.current_status_mentions_missing_contract_fields === true,
    'Spark10 status must mention missing contract fields',
  );
  expect(
    artifact.stale_shadow_observed?.status === 'stale_missing_input_blocker_report',
    'stale shadow status mismatch',
  );
}
expect(
  artifact.counts?.stale_shadow_now_present_missing_claim_paths ===
    artifact.stale_shadow_observed?.now_present_paths_claimed_missing?.length,
  'stale shadow now-present claim count mismatch',
);

expect(
  artifact.agent3_orot_dedupe_observed?.artifact_type === 'agent3_orot_169_row_route_card_candidate_card_dedupe_review',
  'Agent3 Orot artifact type mismatch',
);
expect(
  artifact.agent3_orot_dedupe_observed?.status === 'evidence-ready_with_exact_linkage_blockers',
  'Agent3 Orot status mismatch',
);
expectCounts(artifact.counts, {
  agent3_orot_rows: 169,
  agent3_orot_occurrences: 2148,
  agent3_orot_exact_blocker_rows: 168,
  agent3_orot_exact_blocker_occurrences: 2117,
});

expect(artifact.package_summary?.executable_workset_created === false, 'must not create executable workset');
expect(artifact.package_summary?.missing_pipeline_blocker_packaged === true, 'must package missing pipeline blocker');
expect(allFalse(artifact.boundary), 'boundary must be all false');
expectZeroOutputs(artifact.counts, [
  'source_files_committed_by_this_package',
  'public_hud_rows',
  'route_jsonl_rows',
  'route_shard_writes',
  'runtime_files_changed',
  'source_files_changed',
  'token_index_files_changed',
  'lexical_payload_files_changed',
  'definition_content_rows',
  'answer_rows',
  'accepted_text_rows',
  'public_reader_output_rows',
]);

const serialized = JSON.stringify(artifact);
for (const forbidden of [
  '"usage_as_definition_authority":true',
  '"answer_eligibility":true',
  '"route_publication_support":true',
  '"public_runtime_mutation":true',
  '"accepted_gloss_text":true',
  '"public_reader_output":true',
  'accepted_text_now',
  'definition_text_stored_now',
]) {
  expect(!serialized.includes(forbidden), `forbidden payload detected: ${forbidden}`);
}

if (issues.length > 0) {
  console.error(`Agent 3 Spark10 hybrid shadow blocker observer validation failed (${issues.length} issue(s))`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 3 Spark10 hybrid shadow blocker observer validation passed');
console.log(
  JSON.stringify(
    {
      artifact: artifactPath,
      queue_inputs_present: artifact.counts.queue_inputs_present,
      queue_inputs_missing: artifact.counts.queue_inputs_missing,
      missing_contract_fields: artifact.queue_item_observed.missing_contract_fields,
      agent3_orot_rows: artifact.counts.agent3_orot_rows,
      agent3_orot_exact_blocker_rows: artifact.counts.agent3_orot_exact_blocker_rows,
      publication_state: artifact.publication_state,
      warnings,
    },
    null,
    2,
  ),
);

function expect(condition, message) {
  if (!condition) issues.push(message);
}

function expectCounts(actual, expected) {
  for (const [key, value] of Object.entries(expected)) {
    expect(actual?.[key] === value, `${key} mismatch: expected ${value}, got ${actual?.[key]}`);
  }
}

function expectZeroOutputs(actual, keys) {
  for (const key of keys) expect(actual?.[key] === 0, `${key} must be 0`);
}

function allFalse(value) {
  return Boolean(value) && Object.values(value).every((entry) => entry === false);
}

function readJson(inputPath) {
  return JSON.parse(fs.readFileSync(resolve(inputPath), 'utf8'));
}

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function resolve(inputPath) {
  return path.resolve(root, inputPath);
}
