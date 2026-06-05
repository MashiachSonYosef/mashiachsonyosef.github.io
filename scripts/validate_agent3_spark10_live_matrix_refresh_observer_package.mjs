#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath =
  process.argv[2] || 'reports/agent3-spark10-live-matrix-refresh-observer-package-2026-06-04.json';
const artifact = readJson(artifactPath);
const issues = [];
const warnings = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(artifact.artifact_type === 'agent3_spark10_live_matrix_refresh_observer_package', 'artifact_type mismatch');
expect(artifact.status === 'live_spark10_matrix_refresh_observed_no_agent3_executable_workset', 'status mismatch');
expect(artifact.publication_state === 'blocked_no_render', 'publication_state must be blocked_no_render');
expect(artifact.lane_owner === 'Agent 3', 'lane_owner must be Agent 3');

validateReviewedInputs();
validateCounts();
validateBoundaries();
validateCurrentInputsWhenUnchanged();
validateNoForbiddenAuthority();

if (issues.length > 0) {
  console.error(`Agent 3 Spark-10 live matrix refresh validation failed (${issues.length} issue(s))`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 3 Spark-10 live matrix refresh validation passed');
console.log(
  JSON.stringify(
    {
      artifact: artifactPath,
      previous_matrix_rows: artifact.schema_counts.previous_observer_matrix_rows,
      live_matrix_rows: artifact.schema_counts.live_matrix_rows,
      matrix_delta: artifact.schema_counts.matrix_row_delta_since_previous_observer,
      live_counts: [
        artifact.schema_counts.live_inputs_checked,
        artifact.schema_counts.live_release_relevant_rows,
        artifact.schema_counts.live_agent6_handoff_candidates,
      ],
      agent3_rows: artifact.schema_counts.live_agent3_rows,
      spark3_rows: artifact.schema_counts.live_spark3_rows,
      runnable_queue_items: artifact.schema_counts.agent10_agent3_runnable_queue_items,
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
  expect(counts.previous_observer_matrix_rows === 239, 'previous observer matrix rows must be 239');
  expect(counts.previous_observer_agent3_rows === 24, 'previous observer Agent 3 rows must be 24');
  expect(counts.previous_observer_spark3_rows === 5, 'previous observer Spark-3 rows must be 5');
  expect(counts.previous_observer_handoff_candidates === 31, 'previous observer handoff candidates must be 31');
  expect(counts.previous_observer_agent3_handoff_candidates === 7, 'previous observer Agent 3 handoff candidates must be 7');

  expect(
    counts.control_cap_live_inputs_checked >= counts.previous_observer_matrix_rows,
    'control-cap receipt live input count should be at least the previous observer rows',
  );
  expect(counts.live_inputs_checked >= counts.previous_observer_matrix_rows, 'live input count should be at least previous observer rows');
  expect(counts.live_missing_required_inputs === 0, 'live missing required inputs must be 0');
  expect(counts.live_release_relevant_rows >= 102, 'live release-relevant rows should not fall below the prior 102-row snapshot');
  expect(
    counts.live_agent6_handoff_candidates >= counts.previous_observer_handoff_candidates,
    'live Agent 6 handoff candidates should not fall below previous observer handoff candidates',
  );
  expect(counts.live_matrix_rows === counts.live_inputs_checked, 'live matrix rows should equal inputs checked');
  expect(counts.live_agent3_rows === 24, 'live Agent 3 rows must remain 24');
  expect(counts.live_spark3_rows === 5, 'live Spark-3 rows must remain 5');
  expect(
    counts.live_handoff_candidate_rows === counts.live_agent6_handoff_candidates,
    'live handoff candidate rows should match summary handoff candidates',
  );
  expect(counts.live_agent3_handoff_candidate_rows === 7, 'live Agent 3 handoff candidate rows must remain 7');
  expect(
    counts.matrix_row_delta_since_previous_observer === counts.live_matrix_rows - counts.previous_observer_matrix_rows,
    'matrix row delta mismatch',
  );
  expect(counts.agent3_row_delta_since_previous_observer === 0, 'Agent 3 row delta should be 0');
  expect(
    counts.handoff_candidate_delta_since_previous_observer ===
      counts.live_handoff_candidate_rows - counts.previous_observer_handoff_candidates,
    'handoff candidate delta mismatch',
  );

  expect(counts.agent10_agent3_runnable_queue_items === 0, 'Agent 3 runnable queue items must be 0');
  expect(counts.agent10_changed_artifacts_found === 0, 'changed artifacts found must be 0');
  expect(counts.agent10_exact_new_worksets_found === 0, 'exact new worksets found must be 0');
  expect(counts.agent10_new_matrix_rows === 0, 'new matrix rows must be 0');
  expect(counts.agent10_new_matrix_occurrences === 0, 'new matrix occurrences must be 0');
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
  expect(allFalse(artifact.live_matrix_snapshot?.boundary), 'live Spark-10 matrix boundary must be all false');
  expect(allFalse(artifact.agent10_contract_reference?.boundary), 'Agent 10 contract boundary must be all false');
}

function validateCurrentInputsWhenUnchanged() {
  const byRole = new Map((artifact.reviewed_inputs || []).map((input) => [input.role, input]));
  const matrixInput = byRole.get('spark10MatrixJson');
  if (matrixInput && exists(matrixInput.path) && matrixInput.sha256 === sha256(matrixInput.path)) {
    const matrix = readJson(matrixInput.path);
    const rows = matrix.rows || [];
    const agent3Rows = rows.filter((row) => row.lane_owner === 'Agent 3');
    const spark3Rows = rows.filter(
      (row) => row.lane_owner === 'Spark-3' || row.lane_owner === 'Spark 3' || /spark3/i.test(String(row.path || '')),
    );
    const handoffRows = rows.filter(
      (row) =>
        row.agent6_handoff_candidate === true ||
        row.agent6_handoff_needed === true ||
        row.next_agent10_action === 'prepare_or_route_agent6_boundary_only_if_exact_package_exists',
    );
    expect(matrix.generated_at === artifact.live_matrix_snapshot.generated_at, 'live matrix generated_at mismatch');
    expect(matrix.summary.inputs_checked === artifact.schema_counts.live_inputs_checked, 'live matrix input count mismatch');
    expect(rows.length === artifact.schema_counts.live_matrix_rows, 'live matrix row count mismatch');
    expect(agent3Rows.length === artifact.schema_counts.live_agent3_rows, 'live Agent 3 row count mismatch');
    expect(spark3Rows.length === artifact.schema_counts.live_spark3_rows, 'live Spark-3 row count mismatch');
    expect(handoffRows.length === artifact.schema_counts.live_handoff_candidate_rows, 'live handoff row count mismatch');
    expect(allFalse(matrix.boundary), 'current live Spark-10 boundary must be all false');
  } else {
    warnings.push('live Spark-10 matrix changed after package build; validated package-time snapshot only');
  }
}

function validateNoForbiddenAuthority() {
  expect(artifact.missing_field_blocker?.blocker === 'missing_changed_artifact_or_exact_workset', 'blocker mismatch');
  expect(/Agent 10/.test(artifact.handoff_owner || ''), 'handoff owner must name Agent 10');
  expect(/does not supply an Agent 3 executable workset/.test(artifact.stop_condition || ''), 'stop condition mismatch');

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
