#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath =
  process.argv[2] || 'reports/agent3-external-old-dictionary-verdict-observer-package-2026-06-04.json';
const artifact = readJson(artifactPath);
const issues = [];
const warnings = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_external_old_dictionary_verdict_observer_package',
  'unexpected artifact_type',
);
expect(
  artifact.status === 'external_old_dictionary_planning_verdict_observed_no_agent3_workset',
  'unexpected status',
);
expect(artifact.publication_state === 'blocked_no_render', 'publication_state must be blocked_no_render');
expect(artifact.lane_owner === 'Agent 3', 'lane_owner must be Agent 3');

const reviewedInputs = artifact.reviewed_inputs || [];
expect(reviewedInputs.length === 6, 'reviewed input count must be 6');
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

expect(artifact.external_verdict_observed?.disposition === 'WARN-ACCEPTED', 'external verdict disposition mismatch');
expect(artifact.external_verdict_observed?.planning_only === true, 'external verdict must be planning-only');
expect(
  artifact.external_verdict_observed?.blocker_effect ===
    'old_dictionary_lane_assignment_resolved_for_nonpublic_planning_only',
  'external verdict blocker effect mismatch',
);
expect(
  artifact.external_verdict_observed?.no_authority_boundary_detected === true,
  'external verdict no-authority boundary must be detected',
);

expect(
  artifact.agent10_consumption_observed?.artifact_type ===
    'agent10_agent6_old_dictionary_license_lane_verdict_consumption',
  'Agent10 consumption artifact_type mismatch',
);
expect(
  artifact.agent10_consumption_observed?.status ===
    'agent6_warn_accepted_old_dictionary_lane_planning_consumed_nonpublic_only',
  'Agent10 consumption status mismatch',
);
expect(allZero(artifact.agent10_consumption_observed?.zero_output_counts), 'Agent10 zero output counts must be zero');

expect(
  artifact.spark10_current_matrix_observed?.artifact_type === 'spark10_release_package_intake_matrix',
  'Spark10 matrix artifact_type mismatch',
);
const matrixPath = artifact.spark10_current_matrix_observed?.path;
const currentMatrix = matrixPath && fs.existsSync(resolve(matrixPath)) ? readJson(matrixPath) : null;
const observedSummary = artifact.spark10_current_matrix_observed?.summary || {};
const currentSummary = currentMatrix?.summary || {};
expect(Boolean(currentMatrix), `Spark10 matrix input missing or unreadable: ${matrixPath || '(missing path)'}`);
expectCounts(artifact.counts, {
  spark10_inputs_checked: observedSummary.inputs_checked,
  spark10_missing_required_inputs: observedSummary.missing_required_inputs,
  spark10_release_relevant_rows: observedSummary.release_relevant_rows,
  spark10_agent6_handoff_candidates: observedSummary.agent6_handoff_candidates,
  agent3_rows_observed: artifact.agent3_rows_observed?.length,
  agent3_handoff_candidate_rows: countRows(artifact.agent3_rows_observed, (row) => row.agent6_handoff_candidate === true),
  agent3_rows_with_missing_inputs: countRows(artifact.agent3_rows_observed, (row) => row.exists === false),
  agent3_rows_with_public_or_mutation_action: countRows(
    artifact.agent3_rows_observed,
    (row) => row.next_agent10_action && row.next_agent10_action !== 'inspect_if_release_relevant',
  ),
  external_agent10_handoff_candidate_rows: countRows(
    artifact.agent6_handoff_candidates_observed,
    (row) => row.lane_owner === 'Agent 10',
  ),
  old_dictionary_verdict_agent3_workset_rows: 0,
});
expect(
  artifact.spark10_current_matrix_observed?.summary?.public_runtime_mutation_authorized === false,
  'Spark10 summary must not authorize runtime mutation',
);
expect(
  artifact.spark10_current_matrix_observed?.summary?.answer_definition_release_authorized === false,
  'Spark10 summary must not authorize answer/definition release',
);
expect(
  artifact.spark10_current_matrix_observed?.summary?.inputs_checked === observedSummary.inputs_checked,
  'Spark10 observed summary inputs_checked must be stable inside package',
);
expect(
  artifact.spark10_current_matrix_observed?.summary?.release_relevant_rows === observedSummary.release_relevant_rows,
  'Spark10 observed summary release_relevant_rows must be stable inside package',
);
expect(
  artifact.spark10_current_matrix_observed?.summary?.agent6_handoff_candidates === observedSummary.agent6_handoff_candidates,
  'Spark10 observed summary agent6_handoff_candidates must be stable inside package',
);
if (
  currentSummary.inputs_checked !== observedSummary.inputs_checked ||
  currentSummary.release_relevant_rows !== observedSummary.release_relevant_rows ||
  currentSummary.agent6_handoff_candidates !== observedSummary.agent6_handoff_candidates
) {
  warnings.push(
    `Spark10 matrix drifted after package build: observed ${observedSummary.inputs_checked}/${observedSummary.release_relevant_rows}/${observedSummary.agent6_handoff_candidates}, current ${currentSummary.inputs_checked}/${currentSummary.release_relevant_rows}/${currentSummary.agent6_handoff_candidates}`,
  );
}

expect(Array.isArray(artifact.agent3_rows_observed), 'agent3_rows_observed must be an array');
expect(artifact.agent3_rows_observed.length === artifact.counts.agent3_rows_observed, 'Agent3 row count mismatch');
for (const row of artifact.agent3_rows_observed) {
  expect(row.lane_owner === 'Agent 3', `Agent3 row owner mismatch: ${row.path}`);
  expect(row.exists === true, `Agent3 row missing input: ${row.path}`);
  expect(row.agent6_handoff_candidate === false, `Agent3 row must not be handoff candidate: ${row.path}`);
  expect(row.next_agent10_action === 'inspect_if_release_relevant', `Agent3 row next action mismatch: ${row.path}`);
}
expect(artifact.agent3_drift_audit_observed?.status === 'generated_at_drift_only_no_new_workset', 'drift audit status mismatch');
expect(artifact.agent3_drift_audit_observed?.substantive_changed_files === 0, 'drift audit substantive changes must be 0');
expect(artifact.package_summary?.executable_workset_created === false, 'must not create executable workset');
expect(artifact.package_summary?.external_verdict_packaged === true, 'must package external verdict observation');
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
  '"candidate_text_export":true',
  '"accepted_gloss_text":true',
  '"public_reader_output":true',
  'accepted_text_now',
  'definition_text_stored_now',
]) {
  expect(!serialized.includes(forbidden), `forbidden payload detected: ${forbidden}`);
}

if (issues.length > 0) {
  console.error(`Agent3 external old-dictionary verdict observer validation failed (${issues.length} issue(s))`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent3 external old-dictionary verdict observer validation passed');
console.log(
  JSON.stringify(
    {
      artifact: artifactPath,
      spark10_inputs_checked: artifact.counts.spark10_inputs_checked,
      spark10_release_relevant_rows: artifact.counts.spark10_release_relevant_rows,
      agent3_rows_observed: artifact.counts.agent3_rows_observed,
      agent3_handoff_candidate_rows: artifact.counts.agent3_handoff_candidate_rows,
      old_dictionary_verdict_agent3_workset_rows: artifact.counts.old_dictionary_verdict_agent3_workset_rows,
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

function allZero(value) {
  return Boolean(value) && Object.values(value).every((entry) => entry === 0);
}

function countRows(rows, predicate) {
  return Array.isArray(rows) ? rows.filter(predicate).length : 0;
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
