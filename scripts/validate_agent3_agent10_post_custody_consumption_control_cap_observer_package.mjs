#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath =
  process.argv[2] ||
  'reports/agent3-agent10-post-custody-consumption-control-cap-observer-package-2026-06-04.json';
const artifact = readJson(artifactPath);
const issues = [];
const warnings = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_agent10_post_custody_consumption_control_cap_observer_package',
  'artifact_type mismatch',
);
expect(
  artifact.status === 'release_owner_consumption_and_control_cap_observed_exact_workset_still_missing',
  'status mismatch',
);
expect(artifact.publication_state === 'blocked_no_render', 'publication_state must be blocked_no_render');
expect(artifact.lane_owner === 'Agent 3', 'lane_owner must be Agent 3');

validateReviewedInputs();
validateCounts();
validateBoundaries();
validateCurrentInputsWhenAvailable();
validateNoForbiddenAuthority();

if (issues.length > 0) {
  console.error(`Agent 3 Agent10/control-cap observer validation failed (${issues.length} issue(s))`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 3 Agent10/control-cap observer validation passed');
console.log(
  JSON.stringify(
    {
      artifact: artifactPath,
      runnable_queue_items: artifact.schema_counts.agent10_agent3_runnable_queue_items,
      changed_artifacts_found: artifact.schema_counts.agent10_changed_artifacts_found,
      exact_new_worksets_found: artifact.schema_counts.agent10_exact_new_worksets_found,
      agent12_cap_matrix_counts: [
        artifact.schema_counts.agent12_current_matrix_inputs_checked,
        artifact.schema_counts.agent12_current_matrix_release_relevant_rows,
        artifact.schema_counts.agent12_current_matrix_agent6_handoff_candidate_files,
      ],
      live_spark10_matrix_counts: [
        artifact.schema_counts.live_spark10_inputs_checked,
        artifact.schema_counts.live_spark10_release_relevant_rows,
        artifact.schema_counts.live_spark10_agent6_handoff_candidates,
      ],
      current_observer_counts: [
        artifact.schema_counts.current_observer_matrix_rows,
        artifact.schema_counts.current_observer_agent3_rows,
        artifact.schema_counts.current_observer_spark3_rows,
      ],
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
  expect(counts.current_observer_matrix_rows === 239, 'current observer matrix rows must be 239');
  expect(counts.current_observer_agent3_rows === 24, 'current observer Agent 3 rows must be 24');
  expect(counts.current_observer_spark3_rows === 5, 'current observer Spark-3 rows must be 5');
  expect(counts.current_observer_handoff_candidates === 31, 'current observer handoff candidates must be 31');
  expect(counts.current_observer_agent3_handoff_candidates === 7, 'current observer Agent 3 handoff candidates must be 7');

  expect(counts.agent10_returned_artifacts_indexed === 4, 'Agent 10 returned artifacts indexed must be 4');
  expect(counts.agent10_returned_artifacts_consumed === 4, 'Agent 10 returned artifacts consumed must be 4');
  expect(counts.agent10_active_worksets_indexed === 2, 'Agent 10 active worksets indexed must be 2');
  expect(counts.agent10_total_rows === 8282, 'Agent 10 total rows mismatch');
  expect(counts.agent10_total_occurrences === 14743, 'Agent 10 total occurrences mismatch');
  expect(counts.agent10_blocker_rows === 6947, 'Agent 10 blocker rows mismatch');
  expect(counts.agent10_blocker_occurrences === 11748, 'Agent 10 blocker occurrences mismatch');
  expect(counts.agent10_queue_items_checked === 4, 'Agent 10 queue items checked must be 4');
  expect(counts.agent10_agent3_runnable_queue_items === 0, 'Agent 10 Agent 3 runnable queue items must be 0');
  expect(
    counts.agent10_candidate_files_modified_after_custody_index === 0,
    'candidate files modified after custody index must be 0',
  );
  expect(counts.agent10_changed_artifacts_found === 0, 'changed artifacts found must be 0');
  expect(counts.agent10_exact_new_worksets_found === 0, 'exact new worksets found must be 0');
  expect(counts.agent10_new_matrix_rows === 0, 'new matrix rows must be 0');
  expect(counts.agent10_new_matrix_occurrences === 0, 'new matrix occurrences must be 0');

  expect(counts.agent12_current_matrix_inputs_checked === 239, 'Agent 12 current matrix inputs checked must be 239');
  expect(counts.agent12_current_matrix_missing_required_inputs === 0, 'Agent 12 current matrix missing inputs must be 0');
  expect(counts.agent12_current_matrix_release_relevant_rows === 102, 'Agent 12 current matrix release-relevant rows must be 102');
  expect(
    counts.agent12_current_matrix_agent6_handoff_candidate_files === 31,
    'Agent 12 current matrix Agent 6 handoff files must be 31',
  );
  expect(counts.live_spark10_inputs_checked >= counts.agent12_current_matrix_inputs_checked, 'live Spark-10 input count should be at least the Agent 12 cap snapshot');
  expect(counts.live_spark10_missing_required_inputs === 0, 'live Spark-10 missing required inputs must be 0');
  expect(counts.live_spark10_release_relevant_rows === 102, 'live Spark-10 release-relevant rows must remain 102');
  expect(counts.live_spark10_agent6_handoff_candidates === 31, 'live Spark-10 handoff candidates must remain 31');
  expect(counts.live_spark10_matrix_rows === counts.live_spark10_inputs_checked, 'live Spark-10 matrix row count should equal inputs checked');
  expect(counts.live_spark10_agent3_rows === 24, 'live Spark-10 Agent 3 rows must remain 24');
  expect(counts.live_spark10_spark3_rows === 5, 'live Spark-10 Spark-3 rows must remain 5');
  expect(counts.live_spark10_handoff_candidate_rows === 31, 'live Spark-10 handoff candidate rows must remain 31');
  expect(
    counts.agent12_cap_stale_against_live_matrix ===
      (counts.live_spark10_inputs_checked !== counts.agent12_current_matrix_inputs_checked ? 1 : 0),
    'Agent 12 stale-against-live flag mismatch',
  );
  expect(counts.spark_queue_agent3_runnable_items === 0, 'spark queue Agent 3 runnable items must be 0');
  expect(counts.state_evidence_artifacts_exist === counts.state_evidence_artifacts, 'state evidence artifacts incomplete');
  expect(counts.state_validator_scripts_exist === counts.state_validator_scripts, 'state validator scripts incomplete');

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
  expect(allFalse(artifact.boundary), 'artifact boundary must be all false authorization flags');
  expect(artifact.agent12_control_cap?.standing_status_capped_as_stale === true, 'Agent 12 must cap stale standing status');
  expect(artifact.agent12_control_cap?.broad_sweep_cap_present === true, 'Agent 12 broad sweep cap must be present');
  expect(artifact.agent12_control_cap?.exact_agent6_routing_only === true, 'Agent 12 exact Agent 6 routing boundary missing');

  const zeroCounters = artifact.agent10_release_owner_consumption?.zero_counters || {};
  for (const [key, value] of Object.entries(zeroCounters)) {
    expect(value === 0, `Agent 10 zero counter ${key} must be 0`);
  }

  const laneSplit = artifact.agent10_release_owner_consumption?.lane_split || {};
  expect(laneSplit.agent3_linkage_dedupe_navigation_planning_only === true, 'Agent 10 lane split must keep Agent 3 planning only');
  expect(laneSplit.spark3_sleep_until_exact_workset === true, 'Spark-3 sleep-until-workset flag missing');
  expect(laneSplit.agent12_caps_broad_sweeps === true, 'Agent 12 cap flag missing');
  expect(laneSplit.agent12_allows_exact_contract_productive_work === true, 'Agent 12 exact-contract allow flag missing');
}

function validateCurrentInputsWhenAvailable() {
  const byRole = new Map((artifact.reviewed_inputs || []).map((input) => [input.role, input]));
  const currentObserverInput = byRole.get('currentObserverJson');
  if (currentObserverInput && exists(currentObserverInput.path) && currentObserverInput.sha256 === sha256(currentObserverInput.path)) {
    const currentObserver = readJson(currentObserverInput.path);
    expect(
      currentObserver.schema_counts.spark10_matrix_rows === artifact.schema_counts.current_observer_matrix_rows,
      'current observer matrix rows mismatch',
    );
    expect(
      currentObserver.schema_counts.agent3_rows_observed === artifact.schema_counts.current_observer_agent3_rows,
      'current observer Agent 3 rows mismatch',
    );
  }

  const agent10Input = byRole.get('agent10ConsumptionJson');
  if (agent10Input && exists(agent10Input.path) && agent10Input.sha256 === sha256(agent10Input.path)) {
    const agent10 = readJson(agent10Input.path);
    expect(agent10.exact_blocker?.id === artifact.missing_field_blocker.blocker, 'current Agent 10 exact blocker mismatch');
    expect(agent10.counts.changed_artifacts_found === artifact.schema_counts.agent10_changed_artifacts_found, 'current Agent 10 changed artifact count mismatch');
    expect(agent10.counts.exact_new_worksets_found === artifact.schema_counts.agent10_exact_new_worksets_found, 'current Agent 10 exact workset count mismatch');
  }

  const matrixInput = byRole.get('spark10MatrixJson');
  if (matrixInput && exists(matrixInput.path) && matrixInput.sha256 === sha256(matrixInput.path)) {
    const matrix = readJson(matrixInput.path);
    expect(matrix.summary.inputs_checked === artifact.schema_counts.live_spark10_inputs_checked, 'current Spark-10 matrix inputs checked mismatch');
    expect((matrix.rows || []).length === artifact.schema_counts.live_spark10_matrix_rows, 'current Spark-10 matrix row count mismatch');
    expect(
      matrix.summary.agent6_handoff_candidates === artifact.schema_counts.live_spark10_agent6_handoff_candidates,
      'current Spark-10 Agent 6 handoff count mismatch',
    );
    expect(allFalse(matrix.boundary), 'current Spark-10 matrix boundary must be all false');
  }
}

function validateNoForbiddenAuthority() {
  expect(
    artifact.missing_field_blocker?.blocker === 'missing_changed_artifact_or_exact_workset',
    'missing-field blocker mismatch',
  );
  expect(/Agent 10/.test(artifact.handoff_owner || ''), 'handoff owner must name Agent 10');
  expect(/zero Agent 3 runnable queue items/.test(artifact.stop_condition || ''), 'stop condition must preserve zero runnable state');
  expect(artifact.agent10_release_owner_consumption?.agent6_boundary_question === null, 'Agent 10 boundary question must be null');

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
