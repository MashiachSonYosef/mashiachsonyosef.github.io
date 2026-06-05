#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent3-spark10-matrix-delta-audit-2026-06-05.json';
const artifact = readJson(artifactPath);
const issues = [];
const warnings = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(artifact.artifact_type === 'agent3_spark10_matrix_delta_audit', 'artifact_type mismatch');
expect(artifact.status === 'spark10_matrix_delta_observed_no_agent3_workset', 'status mismatch');
expect(artifact.publication_state === 'blocked_no_render', 'publication_state must be blocked_no_render');
expect(artifact.lane_owner === 'Agent 3', 'lane_owner must be Agent 3');

validateReviewedInputs();
validateCounts();
validateBoundaries();
validateCurrentInputsWhenUnchanged();
validateNoForbiddenAuthority();

if (issues.length > 0) {
  console.error(`Agent 3 Spark-10 matrix delta audit validation failed (${issues.length} issue(s))`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 3 Spark-10 matrix delta audit validation passed');
console.log(
  JSON.stringify(
    {
      artifact: artifactPath,
      previous_counts: [
        artifact.schema_counts.previous_inputs_checked,
        artifact.schema_counts.previous_release_relevant_rows,
        artifact.schema_counts.previous_agent6_handoff_candidates,
      ],
      current_counts: [
        artifact.schema_counts.current_inputs_checked,
        artifact.schema_counts.current_release_relevant_rows,
        artifact.schema_counts.current_agent6_handoff_candidates,
      ],
      deltas: [
        artifact.schema_counts.input_delta_since_previous_audit,
        artifact.schema_counts.release_relevant_delta_since_previous_audit,
        artifact.schema_counts.handoff_delta_since_previous_audit,
      ],
      agent3_row_delta: artifact.schema_counts.agent3_row_delta_since_previous_audit,
      spark3_row_delta: artifact.schema_counts.spark3_row_delta_since_previous_audit,
      runnable_queue_items: artifact.schema_counts.agent10_agent3_runnable_queue_items,
      direct_queue_runnable_items: artifact.schema_counts.direct_queue_agent3_runnable_items,
      changed_artifacts_found: artifact.schema_counts.agent10_changed_artifacts_found,
      exact_new_worksets_found: artifact.schema_counts.agent10_exact_new_worksets_found,
      zero_authority_outputs: true,
      warnings,
    },
    null,
    2,
  ),
);

function validateReviewedInputs() {
  const reviewedInputs = artifact.reviewed_inputs || [];
  expect(reviewedInputs.length === artifact.files.input_files.length, 'reviewed input count mismatch');
  for (const input of reviewedInputs) {
    expect(Boolean(input.role), `reviewed input missing role for ${input.path}`);
    expect(Boolean(input.path), `reviewed input missing path for ${input.role}`);
    if (!exists(input.path)) {
      warnings.push(`reviewed input missing in current checkout: ${input.path}`);
      continue;
    }
    expect(/^[a-f0-9]{64}$/.test(input.sha256 || ''), `reviewed input hash invalid: ${input.path}`);
    expect(Number.isInteger(input.bytes) && input.bytes > 0, `reviewed input bytes invalid: ${input.path}`);
    if (input.sha256 !== sha256(input.path)) {
      warnings.push(`reviewed input changed after package build: ${input.path}`);
    }
  }
}

function validateCounts() {
  const counts = artifact.schema_counts || {};
  expect(counts.previous_inputs_checked === 263, 'previous input count must be 263');
  expect(counts.previous_release_relevant_rows === 116, 'previous release-relevant rows must be 116');
  expect(counts.previous_agent6_handoff_candidates === 45, 'previous handoff candidates must be 45');
  expect(counts.previous_matrix_rows === 263, 'previous matrix rows must be 263');
  expect(counts.previous_agent3_rows === 24, 'previous Agent 3 rows must be 24');
  expect(counts.previous_spark3_rows === 5, 'previous Spark-3 rows must be 5');

  expect(counts.current_inputs_checked >= counts.previous_inputs_checked, 'current input count should not decrease');
  expect(counts.current_missing_required_inputs === 0, 'current missing required inputs must be 0');
  expect(counts.current_release_relevant_rows >= counts.previous_release_relevant_rows, 'current release-relevant rows should not decrease');
  expect(counts.current_agent6_handoff_candidates >= counts.previous_agent6_handoff_candidates, 'current handoff candidates should not decrease');
  expect(counts.current_matrix_rows === counts.current_inputs_checked, 'current matrix rows should equal input count');
  expect(counts.current_agent3_rows === 24, 'current Agent 3 rows must remain 24');
  expect(counts.current_spark3_rows === 5, 'current Spark-3 rows must remain 5');
  expect(counts.current_handoff_rows === counts.current_agent6_handoff_candidates, 'current handoff rows must match summary');
  expect(counts.current_agent3_handoff_rows === 7, 'current Agent 3 handoff rows must remain 7');
  expect(counts.input_delta_since_previous_audit === counts.current_inputs_checked - counts.previous_inputs_checked, 'input delta mismatch');
  expect(counts.matrix_row_delta_since_previous_audit === counts.current_matrix_rows - counts.previous_matrix_rows, 'matrix row delta mismatch');
  expect(
    counts.release_relevant_delta_since_previous_audit ===
      counts.current_release_relevant_rows - counts.previous_release_relevant_rows,
    'release-relevant delta mismatch',
  );
  expect(
    counts.handoff_delta_since_previous_audit ===
      counts.current_agent6_handoff_candidates - counts.previous_agent6_handoff_candidates,
    'handoff delta mismatch',
  );
  expect(counts.agent3_row_delta_since_previous_audit === 0, 'Agent 3 row delta must be 0');
  expect(counts.spark3_row_delta_since_previous_audit === 0, 'Spark-3 row delta must be 0');

  expect(counts.agent10_agent3_runnable_queue_items === 0, 'Agent 10 Agent 3 runnable queue items must be 0');
  expect(counts.agent10_changed_artifacts_found === 0, 'changed artifacts found must be 0');
  expect(counts.agent10_exact_new_worksets_found === 0, 'exact new worksets found must be 0');
  expect(counts.agent10_new_matrix_rows === 0, 'new matrix rows must be 0');
  expect(counts.agent10_new_matrix_occurrences === 0, 'new matrix occurrences must be 0');
  expect(counts.direct_queue_agent3_runnable_items === 0, 'direct queue Agent 3 runnable items must be 0');
  expect(counts.state_evidence_artifacts_exist === counts.state_evidence_artifacts, 'state evidence artifacts incomplete');
  expect(counts.state_validator_scripts_exist === counts.state_validator_scripts, 'state validators incomplete');

  for (const key of [
    'route_publication_support_rows',
    'definition_authority_rows',
    'usage_as_definition_rows',
    'answer_rows',
    'accepted_text_rows',
    'public_runtime_mutations',
    'public_reader_output_rows',
  ]) {
    expect(counts[key] === 0, `${key} must be 0`);
  }
}

function validateBoundaries() {
  expect(allFalse(artifact.boundary), 'artifact boundary must be all false');
  expect(allFalse(artifact.current_matrix?.boundary), 'current matrix boundary must be all false');
  const zeroCounters = artifact.agent10_consumption_reference?.zero_counters || {};
  for (const [key, value] of Object.entries(zeroCounters)) {
    expect(value === 0, `Agent 10 zero counter ${key} must be 0`);
  }
}

function validateCurrentInputsWhenUnchanged() {
  const byRole = new Map((artifact.reviewed_inputs || []).map((input) => [input.role, input]));
  const matrixInput = byRole.get('spark10MatrixJson');
  if (matrixInput && exists(matrixInput.path) && matrixInput.sha256 === sha256(matrixInput.path)) {
    const matrix = readJson(matrixInput.path);
    const rows = matrix.rows || [];
    const handoff = rows.filter(
      (row) =>
        row.agent6_handoff_candidate === true ||
        row.agent6_handoff_needed === true ||
        row.next_agent10_action === 'prepare_or_route_agent6_boundary_only_if_exact_package_exists',
    );
    expect(matrix.summary.inputs_checked === artifact.schema_counts.current_inputs_checked, 'current matrix input count mismatch');
    expect(matrix.summary.release_relevant_rows === artifact.schema_counts.current_release_relevant_rows, 'current matrix release count mismatch');
    expect(matrix.summary.agent6_handoff_candidates === artifact.schema_counts.current_agent6_handoff_candidates, 'current matrix handoff count mismatch');
    expect(rows.length === artifact.schema_counts.current_matrix_rows, 'current matrix row count mismatch');
    expect(handoff.length === artifact.schema_counts.current_handoff_rows, 'current handoff row count mismatch');
    expect(allFalse(matrix.boundary), 'current matrix boundary must be all false');
  } else {
    warnings.push('current Spark-10 matrix changed after package build; validated package-time snapshot only');
  }
}

function validateNoForbiddenAuthority() {
  expect(artifact.missing_field_blocker?.blocker === 'missing_changed_artifact_or_exact_workset', 'blocker mismatch');
  expect(/Agent 10/.test(artifact.handoff_owner || ''), 'handoff owner must name Agent 10');
  expect(/does not create an Agent 3 executable workset/.test(artifact.stop_condition || ''), 'stop condition mismatch');
  expect(artifact.queue_reference?.direct_agent3_runnable_items?.length === 0, 'queue reference should list zero runnable items');

  const serialized = JSON.stringify(artifact);
  for (const forbidden of [
    '"definition_authority":true',
    '"usage_as_definition_authority":true',
    '"answer_selection":true',
    '"route_publication_support":true',
    '"public_runtime_mutation":true',
    '"accepted_text":true',
    '"package_export_authorization":true',
    '"public_reader_output":true',
    'accepted_text_now',
    'definition_text_stored_now',
  ]) {
    expect(!serialized.includes(forbidden), `forbidden authority payload detected: ${forbidden}`);
  }
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(resolve(relativePath), 'utf8'));
}

function exists(relativePath) {
  return fs.existsSync(resolve(relativePath));
}

function resolve(relativePath) {
  return path.resolve(root, relativePath);
}

function sha256(relativePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(resolve(relativePath))).digest('hex');
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}

function allFalse(value) {
  return Boolean(value) && Object.values(value).every((entry) => entry === false);
}
