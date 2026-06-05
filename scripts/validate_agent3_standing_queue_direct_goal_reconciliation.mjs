#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath =
  process.argv[2] || 'reports/agent3-standing-queue-direct-goal-reconciliation-2026-06-05.json';
const artifact = readJson(artifactPath);
const queue = readJson('data/control/spark_standing_queue.json');
const directGoal = readJson('reports/agent10-direct-release-package-goal-state-2026-06-05.json');
const directConsumption = readJson('reports/agent3-agent10-direct-release-goal-state-consumption-2026-06-05.json');
const spark10 = readJson('reports/spark10-release-package-intake-matrix-current-2026-06-04.json');
const issues = [];
const warnings = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(artifact.artifact_type === 'agent3_standing_queue_direct_goal_reconciliation', 'artifact_type mismatch');
expect(
  artifact.status === 'stale_queue_blocker_reconciled_to_current_no_workset_blocker',
  'status mismatch',
);
expect(artifact.publication_state === 'blocked_no_render', 'publication_state must be blocked_no_render');
expect(artifact.lane_owner === 'Agent 3', 'lane_owner must be Agent 3');

validateReviewedInputs();
validateQueue();
validateCurrentEvidence();
validateCounts();
validateBoundaries();
validateNoForbiddenAuthority();

if (issues.length) {
  console.error(`Agent 3 standing queue direct-goal reconciliation validation failed (${issues.length} issue(s))`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 3 standing queue direct-goal reconciliation validation passed');
console.log(
  JSON.stringify(
    {
      artifact: artifactPath,
      status: artifact.status,
      stale_queue_rows: artifact.schema_counts.queue_stale_deuteronomy_contract_blocker_rows,
      current_no_workset_sources: artifact.schema_counts.current_no_workset_blocker_sources,
      spark10_agent3_executable_rows: artifact.schema_counts.spark10_agent3_executable_rows,
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
    if (input.sha256 !== sha256(input.path)) warnings.push(`reviewed input changed after package build: ${input.path}`);
  }
}

function validateQueue() {
  const queueAgent3 = (queue.direct_agent_goal_proof || []).find((row) => row.production_lane === 'Agent 3');
  expect(Boolean(queueAgent3), 'queue must include Agent 3 proof row');
  expect(
    /Deuteronomy phase-2 contract missing exact fields/i.test(
      `${queueAgent3?.current_artifact_or_exact_blocker || ''} ${queueAgent3?.direct_active_goal || ''}`,
    ),
    'queue Agent 3 row must contain stale Deuteronomy contract blocker wording',
  );
  expect(artifact.queue_agent3_line?.stale_deuteronomy_contract_blocker_observed === true, 'artifact must mark stale queue blocker observed');
}

function validateCurrentEvidence() {
  const directAgent3 = (directGoal.rows || []).find(
    (row) => row.agent10_direct_release_package_goal === 'Agent 3 Deuteronomy/linkage continuation',
  );
  expect(Boolean(directAgent3), 'direct goal must include Agent 3 row');
  expect(directAgent3?.local_artifact_or_exact_blocker === 'no_exact_changed_executable_agent3_workset', 'direct goal Agent 3 blocker mismatch');
  expect(directAgent3?.counts?.direct_agent3_executable_worksets === 0, 'direct goal Agent 3 executable worksets must be 0');
  expect(directConsumption.remaining_blocker?.blocker === 'no_exact_changed_executable_agent3_workset', 'direct consumption blocker mismatch');
  expect(directConsumption.schema_counts?.direct_goal_agent3_executable_worksets === 0, 'direct consumption executable worksets must be 0');

  const rows = spark10.rows || [];
  const agent3ExecutableRows = rows.filter(
    (row) =>
      (row.lane_owner === 'Agent 3' ||
        row.lane_owner === 'Spark-3' ||
        /agent3/i.test(String(row.path || '')) ||
        /spark3/i.test(String(row.path || ''))) &&
      (row.next_agent10_action === 'route_exact_contract_or_missing_field_blocker' || row.agent3_runnable_now === true),
  );
  expect(spark10.summary?.inputs_checked === artifact.schema_counts.spark10_matrix_inputs_checked, 'Spark10 input count mismatch');
  expect(agent3ExecutableRows.length === 0, 'Spark10 Agent 3 executable rows must be 0');
}

function validateCounts() {
  const counts = artifact.schema_counts || {};
  expect(counts.queue_agent3_rows === 1, 'queue Agent 3 rows must be 1');
  expect(counts.queue_stale_deuteronomy_contract_blocker_rows === 1, 'stale queue blocker rows must be 1');
  expect(counts.direct_goal_agent3_rows === 1, 'direct goal Agent 3 rows must be 1');
  expect(counts.direct_goal_agent3_executable_worksets === 0, 'direct goal executable worksets must be 0');
  expect(counts.direct_goal_transform_readiness_rows === 1334, 'transform rows mismatch');
  expect(counts.direct_goal_transform_readiness_occurrences === 2964, 'transform occurrences mismatch');
  expect(counts.direct_goal_agent3_matrix_rows === 8113, 'Agent 3 matrix rows mismatch');
  expect(counts.direct_goal_agent3_matrix_occurrences === 12595, 'Agent 3 matrix occurrences mismatch');
  expect(counts.direct_goal_exact_blocker_rows === 6779, 'exact blocker rows mismatch');
  expect(counts.direct_goal_exact_blocker_occurrences === 9631, 'exact blocker occurrences mismatch');
  expect(counts.spark10_matrix_inputs_checked >= 322, 'Spark10 inputs must be at least 322');
  expect(counts.spark10_agent3_executable_rows === 0, 'Spark10 Agent 3 executable rows must be 0');
  expect(counts.current_no_workset_blocker_sources === 3, 'current no-workset blocker sources must be 3');
  expect(counts.control_edits === 0, 'control edits must be 0');
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
  expect(allFalse(artifact.current_local_matrix?.boundary), 'current local matrix boundary must be all false');
  expect(artifact.remaining_blocker?.blocker === 'no_exact_changed_executable_agent3_workset', 'remaining blocker mismatch');
  expect(artifact.reconciliation?.control_edit_authorized === false, 'control edit must not be authorized');
  expect(/Agent 10 \/ Agent 7/.test(artifact.handoff_owner || ''), 'handoff owner must name Agent 10 / Agent 7');
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
    '"control_state_mutation":true',
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
