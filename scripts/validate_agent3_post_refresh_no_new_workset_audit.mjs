#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent3-post-refresh-no-new-workset-audit-2026-06-05.json';
const artifact = readJson(artifactPath);
const issues = [];
const warnings = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(artifact.artifact_type === 'agent3_post_refresh_no_new_workset_audit', 'artifact_type mismatch');
expect(artifact.status === 'post_refresh_no_new_agent3_workset', 'status mismatch');
expect(artifact.publication_state === 'blocked_no_render', 'publication_state must be blocked_no_render');
expect(artifact.lane_owner === 'Agent 3', 'lane_owner must be Agent 3');

validateReviewedInputs();
validateCounts();
validateBoundaries();
validateCurrentInputsWhenUnchanged();
validateNoForbiddenAuthority();

if (issues.length > 0) {
  console.error(`Agent 3 post-refresh no-new-workset audit validation failed (${issues.length} issue(s))`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 3 post-refresh no-new-workset audit validation passed');
console.log(
  JSON.stringify(
    {
      artifact: artifactPath,
      live_refresh_counts: [
        artifact.schema_counts.live_refresh_inputs_checked,
        artifact.schema_counts.live_refresh_release_relevant_rows,
        artifact.schema_counts.live_refresh_handoff_candidates,
      ],
      current_matrix_counts: [
        artifact.schema_counts.current_matrix_inputs_checked,
        artifact.schema_counts.current_matrix_release_relevant_rows,
        artifact.schema_counts.current_matrix_agent6_handoff_candidates,
      ],
      deltas: [
        artifact.schema_counts.matrix_row_delta_since_live_refresh_snapshot,
        artifact.schema_counts.release_relevant_delta_since_live_refresh_snapshot,
        artifact.schema_counts.handoff_delta_since_live_refresh_snapshot,
      ],
      runnable_queue_items: artifact.schema_counts.agent10_agent3_runnable_queue_items,
      direct_queue_runnable_items: artifact.schema_counts.queue_agent3_runnable_items,
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
  const current = artifact.current_matrix_observed || {};
  expect(counts.live_refresh_inputs_checked > 0, 'live refresh inputs must be nonzero');
  expect(counts.live_refresh_release_relevant_rows >= 0, 'live refresh release-relevant rows must be nonnegative');
  expect(counts.live_refresh_handoff_candidates >= 0, 'live refresh handoff candidates must be nonnegative');
  expect(
    counts.current_matrix_inputs_checked === number(current.summary?.inputs_checked),
    'current matrix inputs must match current snapshot',
  );
  expect(counts.current_matrix_missing_required_inputs === 0, 'current matrix missing inputs must be 0');
  expect(
    counts.current_matrix_release_relevant_rows === number(current.summary?.release_relevant_rows),
    'current release-relevant count must match current snapshot',
  );
  expect(
    counts.current_matrix_agent6_handoff_candidates === number(current.summary?.agent6_handoff_candidates),
    'current handoff count must match current snapshot',
  );
  expect(counts.current_matrix_rows === counts.current_matrix_inputs_checked, 'current matrix rows should equal inputs checked');
  expect(counts.current_matrix_agent3_rows === current.agent3_rows, 'current Agent 3 row count mismatch');
  expect(counts.current_matrix_spark3_rows === current.spark3_rows, 'current Spark-3 row count mismatch');
  expect(counts.current_matrix_handoff_rows === counts.current_matrix_agent6_handoff_candidates, 'handoff row count mismatch');
  expect(counts.current_matrix_agent3_handoff_rows === current.agent3_handoff_rows, 'current Agent 3 handoff row count mismatch');
  expect(
    counts.matrix_counts_match_live_refresh_snapshot === (current.counts_match_live_refresh_snapshot ? 1 : 0),
    'matrix refresh match flag mismatch',
  );
  expect(
    counts.matrix_row_delta_since_live_refresh_snapshot ===
      counts.current_matrix_rows - number(artifact.live_refresh_reference?.snapshot_counts?.live_matrix_rows),
    'matrix row delta after refresh mismatch',
  );
  expect(
    counts.release_relevant_delta_since_live_refresh_snapshot ===
      counts.current_matrix_release_relevant_rows - counts.live_refresh_release_relevant_rows,
    'release-relevant delta after refresh mismatch',
  );
  expect(
    counts.handoff_delta_since_live_refresh_snapshot ===
      counts.current_matrix_handoff_rows - counts.live_refresh_handoff_candidates,
    'handoff delta after refresh mismatch',
  );
  expect(counts.agent10_agent3_runnable_queue_items === 0, 'Agent 10 Agent 3 runnable queue items must be 0');
  expect(counts.agent10_changed_artifacts_found === 0, 'changed artifacts found must be 0');
  expect(counts.agent10_exact_new_worksets_found === 0, 'exact new worksets found must be 0');
  expect(counts.agent10_new_matrix_rows === 0, 'new matrix rows must be 0');
  expect(counts.agent10_new_matrix_occurrences === 0, 'new matrix occurrences must be 0');
  expect(counts.queue_agent3_runnable_items === 0, 'direct queue Agent 3 runnable items must be 0');
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
  expect(allFalse(artifact.current_matrix_observed?.boundary), 'current matrix boundary must be all false');
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
    expect(matrix.summary.inputs_checked === artifact.schema_counts.current_matrix_inputs_checked, 'current matrix input count mismatch');
    expect(rows.length === artifact.schema_counts.current_matrix_rows, 'current matrix row count mismatch');
    expect(handoff.length === artifact.schema_counts.current_matrix_handoff_rows, 'current handoff row count mismatch');
    expect(allFalse(matrix.boundary), 'current live Spark-10 boundary must be all false');
  } else {
    warnings.push('current Spark-10 matrix changed after package build; validated package-time snapshot only');
  }
}

function validateNoForbiddenAuthority() {
  expect(artifact.missing_field_blocker?.blocker === 'missing_changed_artifact_or_exact_workset', 'blocker mismatch');
  expect(/Agent 10/.test(artifact.handoff_owner || ''), 'handoff owner must name Agent 10');
  expect(/zero Agent 3 runnable queue items/.test(artifact.stop_condition || ''), 'stop condition mismatch');
  expect(artifact.queue_reference?.agent3_runnable_items?.length === 0, 'queue reference should list zero runnable items');

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

function number(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}

function allFalse(value) {
  return Boolean(value) && Object.values(value).every((entry) => entry === false);
}
