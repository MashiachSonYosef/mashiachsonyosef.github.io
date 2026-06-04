#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath =
  process.argv[2] || 'reports/agent3-spark3-oracle9-missed-dictionary-evidence-diff-blocker-2026-06-04.json';
const artifact = readJson(artifactPath);
const issues = [];
const warnings = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_spark3_oracle9_missed_dictionary_evidence_diff_blocker',
  'unexpected artifact_type',
);
expect(artifact.status === 'missing_pipeline_blocker', 'status must be missing_pipeline_blocker');
expect(
  artifact.blocker_id === 'spark-oracle9-missed-dictionary-evidence-diff_missing_pipeline_contract',
  'unexpected blocker_id',
);
expect(artifact.publication_state === 'blocked_no_render', 'publication_state must be blocked_no_render');
expect(artifact.lane_owner === 'Agent 3', 'lane_owner must be Agent 3');

const reviewedInputs = artifact.reviewed_inputs || [];
expect(reviewedInputs.length === 10, 'reviewed input count must be 10');
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

expect(
  artifact.queue_item_observed?.id === 'spark-oracle9-missed-dictionary-evidence-diff',
  'queue item id mismatch',
);
expect(artifact.queue_item_observed?.status === 'active_manual_start_spark3', 'queue item status mismatch');
expect(artifact.queue_item_observed?.inputs_expected === 2, 'queue inputs expected must be 2');
expect(artifact.queue_item_observed?.inputs_present === 2, 'queue inputs present must be 2');
expect(artifact.counts?.queue_inputs_expected === 2, 'counts queue_inputs_expected must be 2');
expect(artifact.counts?.queue_inputs_present === 2, 'counts queue_inputs_present must be 2');

expect(artifact.runnable_contract_check?.complete_pipeline_contract === false, 'complete_pipeline_contract must be false');
expect(artifact.runnable_contract_check?.runnable_by_spark3 === false, 'runnable_by_spark3 must be false');
expect(artifact.runnable_contract_check?.no_pipeline_invention === true, 'no_pipeline_invention must be true');
const missingFields = artifact.runnable_contract_check?.missing_contract_fields || [];
for (const field of ['pipeline_commands', 'output_path_schema', 'validator_gate', 'command_script_invocation']) {
  expect(missingFields.includes(field), `missing contract field not preserved: ${field}`);
}
expect(artifact.counts?.missing_contract_fields === missingFields.length, 'missing_contract_fields count mismatch');

expect(
  artifact.current_missed_dictionary_state?.agent2_artifact_type ===
    'agent2_orot_missed_dictionary_reader_hint_candidates',
  'Agent2 missed dictionary artifact_type mismatch',
);
expect(artifact.counts?.candidate_rows === 0, 'candidate rows must be 0');
expect(artifact.counts?.candidate_occurrences === 0, 'candidate occurrences must be 0');
expect(artifact.counts?.unmatched_rows === 168, 'unmatched rows must be 168');
expect(artifact.counts?.rows_added_now === 0, 'rows_added_now must be 0');
expect(artifact.counts?.rows_cleared_by_agent6_now === 0, 'rows_cleared_by_agent6_now must be 0');
expect(
  artifact.agent10_consumption_observed?.status === 'consumed_zero_candidate_return_no_agent6_route',
  'Agent10 zero-candidate consumption status mismatch',
);
expect(allZero(artifact.agent10_consumption_observed?.zero_output_counts), 'Agent10 zero output counts must be zero');
expect(artifact.counts?.zero_output_counter_sum === 0, 'zero_output_counter_sum must be 0');

expect(artifact.agent3_frontier_observed?.status === 'evidence_ready_frontier_checkpoint', 'frontier status mismatch');
expect(artifact.package_summary?.executable_workset_created === false, 'must not create executable workset');
expect(artifact.package_summary?.duplicate_package_created === false, 'must not claim duplicate package creation');
expect(allFalse(artifact.boundary), 'boundary flags must all be false');
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
  '"candidate_text_export":true',
  '"accepted_gloss_text":true',
  '"public_reader_output":true',
  '"lexicon_entry_id_mutation":true',
  '"complete_pipeline_contract":true',
  '"runnable_by_spark3":true',
  'accepted_text_now',
  'definition_text_stored_now',
]) {
  expect(!serialized.includes(forbidden), `forbidden payload detected: ${forbidden}`);
}

if (issues.length > 0) {
  console.error(`Agent3 Spark3 Oracle9 missed-dictionary blocker validation failed (${issues.length} issue(s))`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent3 Spark3 Oracle9 missed-dictionary blocker validation passed');
console.log(
  JSON.stringify(
    {
      artifact: artifactPath,
      status: artifact.status,
      queue_item: artifact.queue_item_observed.id,
      inputs_present: artifact.counts.queue_inputs_present,
      inputs_expected: artifact.counts.queue_inputs_expected,
      missing_contract_fields: artifact.runnable_contract_check.missing_contract_fields,
      candidate_rows: artifact.counts.candidate_rows,
      unmatched_rows: artifact.counts.unmatched_rows,
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

function expectZeroOutputs(actual, keys) {
  for (const key of keys) expect(actual?.[key] === 0, `${key} must be 0`);
}

function allFalse(value) {
  return Boolean(value) && Object.values(value).every((entry) => entry === false);
}

function allZero(value) {
  return Boolean(value) && Object.values(value).every((entry) => entry === 0);
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
