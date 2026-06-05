#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath =
  process.argv[2] || 'reports/agent3-agent10-direct-release-goal-state-consumption-2026-06-05.json';
const artifact = readJson(artifactPath);
const directGoal = readJson('reports/agent10-direct-release-package-goal-state-2026-06-05.json');
const postMatrix = readJson('reports/agent10-post-matrix-lane-output-consumption-2026-06-05.json');
const spark10 = readJson('reports/spark10-release-package-intake-matrix-current-2026-06-04.json');
const issues = [];
const warnings = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_agent10_direct_release_goal_state_consumption',
  'artifact_type mismatch',
);
expect(
  artifact.status === 'direct_release_goal_state_consumed_no_agent3_workset',
  'status mismatch',
);
expect(artifact.publication_state === 'blocked_no_render', 'publication_state must be blocked_no_render');
expect(artifact.lane_owner === 'Agent 3', 'lane_owner must be Agent 3');

validateReviewedInputs();
validateDirectGoal();
validatePostMatrix();
validateSpark10();
validateCounts();
validateBoundaries();
validateNoForbiddenAuthority();

if (issues.length) {
  console.error(`Agent 3 Agent10 direct release goal state consumption validation failed (${issues.length} issue(s))`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 3 Agent10 direct release goal state consumption validation passed');
console.log(
  JSON.stringify(
    {
      artifact: artifactPath,
      status: artifact.status,
      direct_agent3_worksets: artifact.schema_counts.direct_goal_agent3_executable_worksets,
      spark10_inputs: artifact.schema_counts.spark10_matrix_inputs_checked,
      spark10_release_relevant: artifact.schema_counts.spark10_matrix_release_relevant_rows,
      spark10_handoff: artifact.schema_counts.spark10_matrix_agent6_handoff_candidates,
      remaining_blocker: artifact.remaining_blocker.blocker,
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
    expect(input.exists === true, `reviewed input must exist: ${input.path}`);
    if (!exists(input.path)) continue;
    expect(/^[a-f0-9]{64}$/.test(input.sha256 || ''), `reviewed input hash invalid: ${input.path}`);
    expect(Number.isInteger(input.bytes) && input.bytes > 0, `reviewed input bytes invalid: ${input.path}`);
    if (sha256(input.path) !== input.sha256) warnings.push(`reviewed input changed after package build: ${input.path}`);
  }
}

function validateDirectGoal() {
  expect(directGoal.artifact_type === 'agent10_direct_release_package_goal_state', 'Agent 10 direct goal type mismatch');
  expect(
    directGoal.spark_assistant_capacity === 'unavailable_glitched_historical_support_only_unless_owner_reenables',
    'Agent 10 direct goal spark/assistant capacity mismatch',
  );
  const agent3Row = (directGoal.rows || []).find(
    (row) => row.agent10_direct_release_package_goal === 'Agent 3 Deuteronomy/linkage continuation',
  );
  const matrixRow = (directGoal.rows || []).find(
    (row) => row.agent10_direct_release_package_goal === 'Local release/package intake matrix',
  );
  expect(Boolean(agent3Row), 'Agent 10 direct goal must include Agent 3 row');
  expect(Boolean(matrixRow), 'Agent 10 direct goal must include local matrix row');
  expect(agent3Row?.local_artifact_or_exact_blocker === 'no_exact_changed_executable_agent3_workset', 'Agent 3 row blocker mismatch');
  expect(agent3Row?.counts?.direct_agent3_executable_worksets === 0, 'Agent 3 direct executable worksets must be 0');
  expect(agent3Row?.counts?.transform_readiness_rows === 1334, 'Agent 3 transform rows mismatch');
  expect(agent3Row?.counts?.transform_readiness_occurrences === 2964, 'Agent 3 transform occurrences mismatch');
  expect(agent3Row?.counts?.agent3_matrix_rows === 8113, 'Agent 3 matrix rows mismatch');
  expect(agent3Row?.counts?.agent3_matrix_occurrences === 12595, 'Agent 3 matrix occurrences mismatch');
  expect(agent3Row?.counts?.exact_blocker_rows === 6779, 'Agent 3 exact blocker rows mismatch');
  expect(agent3Row?.counts?.exact_blocker_occurrences === 9631, 'Agent 3 exact blocker occurrences mismatch');
  expect(
    matrixRow?.counts?.inputs_checked === artifact.schema_counts.direct_goal_matrix_inputs_checked,
    'direct matrix inputs mismatch',
  );
  expect(matrixRow?.counts?.missing_required_inputs === 0, 'direct matrix missing inputs must be 0');
  expect(matrixRow?.counts?.release_relevant_rows === 83, 'direct matrix release-relevant rows mismatch');
  expect(matrixRow?.counts?.agent6_handoff_candidates === 12, 'direct matrix Agent 6 handoff mismatch');
  for (const [key, value] of Object.entries(directGoal.zero_counters || {})) {
    expect(value === 0, `Agent 10 direct zero counter ${key} must be 0`);
  }
}

function validatePostMatrix() {
  expect(postMatrix.artifact_type === 'agent10_post_matrix_lane_output_consumption', 'post-matrix type mismatch');
  const support = (postMatrix.consumed_packages || []).find(
    (entry) => entry.package_workset === 'agent3_post_matrix_and_post_refresh_no_workset_support',
  );
  expect(Boolean(support), 'post-matrix consumption must include Agent 3 support package');
  expect(support?.exact_blocker === 'no_exact_changed_executable_agent3_workset', 'post-matrix support blocker mismatch');
  expect(support?.counts?.direct_agent3_executable_worksets === 0, 'post-matrix direct Agent 3 executable worksets must be 0');
  expect(support?.counts?.agent3_changed_artifacts_found === 0, 'post-matrix changed artifacts must be 0');
  expect(support?.counts?.agent3_exact_new_worksets_found === 0, 'post-matrix exact new worksets must be 0');
  for (const [key, value] of Object.entries(postMatrix.zero_counters || {})) {
    expect(value === 0, `Agent 10 post-matrix zero counter ${key} must be 0`);
  }
}

function validateSpark10() {
  expect(spark10.artifact_type === 'spark10_release_package_intake_matrix', 'Spark10/local matrix type mismatch');
  const rows = spark10.rows || [];
  const agent6Rows = rows.filter((row) => row.agent6_handoff_needed === true);
  const agent3Rows = rows.filter(
    (row) =>
      row.lane_owner === 'Agent 3' ||
      row.lane_owner === 'Spark-3' ||
      /agent3/i.test(String(row.path || '')) ||
      /spark3/i.test(String(row.path || '')),
  );
  const agent3ExecutableRows = agent3Rows.filter(
    (row) =>
      row.next_agent10_action === 'route_exact_contract_or_missing_field_blocker' ||
      row.agent3_runnable_now === true,
  );
  expect(
    spark10.summary?.inputs_checked === artifact.schema_counts.spark10_matrix_inputs_checked,
    'Spark10/local inputs must match artifact snapshot',
  );
  expect(spark10.summary?.missing_required_inputs === 0, 'Spark10/local missing inputs must be 0');
  expect(
    spark10.summary?.release_relevant_rows === artifact.schema_counts.spark10_matrix_release_relevant_rows,
    'Spark10/local release-relevant rows must match artifact snapshot',
  );
  expect(
    spark10.summary?.agent6_handoff_candidates === artifact.schema_counts.spark10_matrix_agent6_handoff_candidates,
    'Spark10/local handoff candidates must match artifact snapshot',
  );
  expect(rows.length === artifact.schema_counts.spark10_matrix_rows, 'Spark10/local row count must match artifact snapshot');
  expect(agent6Rows.length === 12, 'Spark10/local Agent 6 handoff rows must be 12');
  expect(agent3ExecutableRows.length === 0, 'Spark10/local Agent 3 executable rows must be 0');
  expect(allFalse(spark10.boundary), 'Spark10/local boundary must be all false');
}

function validateCounts() {
  const counts = artifact.schema_counts || {};
  expect(counts.direct_goal_rows === 5, 'direct goal rows must be 5');
  expect(counts.direct_goal_agent3_rows === 1, 'direct Agent 3 row count must be 1');
  expect(counts.direct_goal_agent3_executable_worksets === 0, 'direct Agent 3 executable worksets must be 0');
  expect(counts.direct_goal_matrix_inputs_checked >= 320, 'artifact direct goal matrix inputs must be at least 320');
  expect(counts.spark10_matrix_inputs_checked >= counts.direct_goal_matrix_inputs_checked, 'artifact Spark10 inputs must be at least direct goal inputs');
  expect(counts.spark10_matrix_release_relevant_rows === 83, 'artifact Spark10 release rows mismatch');
  expect(counts.spark10_matrix_agent6_handoff_candidates === 12, 'artifact Spark10 handoff mismatch');
  expect(
    counts.matrix_input_delta_since_direct_goal ===
      counts.spark10_matrix_inputs_checked - counts.direct_goal_matrix_inputs_checked,
    'artifact matrix input delta mismatch',
  );
  expect(
    counts.matrix_release_relevant_delta_since_direct_goal ===
      counts.spark10_matrix_release_relevant_rows - counts.direct_goal_matrix_release_relevant_rows,
    'artifact matrix release-relevant delta mismatch',
  );
  expect(
    counts.matrix_handoff_delta_since_direct_goal ===
      counts.spark10_matrix_agent6_handoff_candidates - counts.direct_goal_matrix_agent6_handoff_candidates,
    'artifact matrix handoff delta mismatch',
  );
  expect(counts.spark10_agent3_executable_rows === 0, 'artifact Spark10 Agent 3 executable rows must be 0');
  expect(counts.post_matrix_agent3_support_packages === 1, 'post-matrix support package count must be 1');
  expect(counts.post_matrix_agent3_support_changed_artifacts_found === 0, 'changed artifacts found must be 0');
  expect(counts.post_matrix_agent3_support_exact_new_worksets_found === 0, 'exact new worksets found must be 0');
  expect(counts.post_matrix_agent3_support_direct_executable_worksets === 0, 'support direct executable worksets must be 0');
  expect(counts.post_matrix_package_direct_executable_worksets === 0, 'post-matrix package direct executable worksets must be 0');
  expect(counts.zero_counter_total === 0, 'zero counter total must be 0');
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
  expect(allFalse(artifact.spark10_local_matrix_reference?.boundary), 'local matrix reference boundary must be all false');
  expect(artifact.remaining_blocker?.blocker === 'no_exact_changed_executable_agent3_workset', 'remaining blocker mismatch');
  expect(/Agent 10/.test(artifact.handoff_owner || ''), 'handoff owner must name Agent 10');
  expect(/zero executable changed worksets/.test(artifact.stop_condition || ''), 'stop condition mismatch');
}

function validateNoForbiddenAuthority() {
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
