#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath =
  process.argv[2] || 'reports/agent3-spark10-release-intake-refresh-observer-package-2026-06-04.json';
const artifact = readJson(artifactPath);
const matrix = readJson('reports/spark10-release-package-intake-matrix-current-2026-06-04.json');
const contract = readJson('reports/agent10-spark10-release-package-intake-pipeline-contract-2026-06-04.json');
const agent10Refresh = readJson('reports/agent10-current-lane-returns-refresh-consumption-2026-06-04.json');
const priorObserver = readJson('reports/agent3-spark10-release-intake-return-observer-package-2026-06-04.json');
const driftAudit = readJson('reports/agent3-linkage-dedupe-generated-at-drift-audit-2026-06-04.json');
const issues = [];
const warnings = [];
const volatileInputRoles = new Set([
  'spark10_matrix_json',
  'spark10_matrix_md',
  'agent10_contract_json',
  'agent10_contract_md',
  'agent10_current_lane_refresh_json',
  'agent10_current_lane_refresh_md',
  'agent3_drift_audit_json',
  'agent3_drift_audit_md',
  'agent3_state_md',
]);

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_spark10_release_intake_refresh_observer_package',
  'unexpected artifact_type',
);
expect(
  artifact.status === 'spark10_release_intake_refresh_observed_no_agent3_executable_workset',
  'unexpected status',
);
expect(artifact.publication_state === 'blocked_no_render', 'publication_state must be blocked_no_render');
expect(artifact.lane_owner === 'Agent 3', 'lane_owner must be Agent 3');

const reviewedInputs = artifact.reviewed_inputs || [];
expect(reviewedInputs.length === 11, 'reviewed input count must be 11');
for (const input of reviewedInputs) {
  expect(Boolean(input.role), 'reviewed input role missing');
  expect(Boolean(input.path), `reviewed input path missing for ${input.role}`);
  expect(fs.existsSync(resolve(input.path)), `reviewed input does not exist: ${input.path}`);
  expect(/^[a-f0-9]{64}$/.test(input.sha256 || ''), `reviewed input sha256 invalid: ${input.path}`);
  if (input.sha256 !== sha256(input.path)) {
    if (volatileInputRoles.has(input.role)) {
      warnings.push(`volatile reviewed input drifted after package build: ${input.path}`);
    } else {
      issues.push(`reviewed input sha256 stale: ${input.path}`);
    }
  }
  expect(Number.isInteger(input.bytes) && input.bytes > 0, `reviewed input bytes invalid: ${input.path}`);
}

expect(matrix.artifact_type === 'spark10_release_package_intake_matrix', 'matrix artifact_type mismatch');
expect(contract.artifact_type === 'spark10_release_package_intake_pipeline_contract', 'contract artifact_type mismatch');
expect(
  agent10Refresh.artifact_type === 'agent10_current_lane_returns_refresh_consumption',
  'Agent 10 refresh artifact type mismatch',
);
expect(
  priorObserver.status === 'spark10_release_intake_return_observed_no_agent3_executable_workset',
  'prior observer status mismatch',
);
expect(driftAudit.status === 'generated_at_drift_only_no_new_workset', 'prior drift audit status mismatch');

expect(artifact.spark10_return_observed?.artifact_type === matrix.artifact_type, 'observed matrix type mismatch');
const matrixInput = reviewedInputs.find((input) => input.role === 'spark10_matrix_json');
const matrixCurrentHash = sha256('reports/spark10-release-package-intake-matrix-current-2026-06-04.json');
const matrixCurrentMatchesPackage = matrixInput?.sha256 === matrixCurrentHash;
const agent10RefreshInput = reviewedInputs.find((input) => input.role === 'agent10_current_lane_refresh_json');
const agent10RefreshCurrentMatchesPackage =
  agent10RefreshInput?.sha256 === sha256('reports/agent10-current-lane-returns-refresh-consumption-2026-06-04.json');
const contractInput = reviewedInputs.find((input) => input.role === 'agent10_contract_json');
const contractCurrentMatchesPackage =
  contractInput?.sha256 === sha256('reports/agent10-spark10-release-package-intake-pipeline-contract-2026-06-04.json');
if (matrixCurrentMatchesPackage) {
  expect(artifact.spark10_return_observed?.generated_at === matrix.generated_at, 'observed matrix generated_at mismatch');
} else {
  warnings.push('current Spark-10 matrix changed after package build; validating embedded Agent 3 snapshot only');
}
expect(artifact.spark10_return_observed?.contract_path === matrix.contract_path, 'matrix contract path mismatch');
if (contractCurrentMatchesPackage) {
  expect(artifact.agent10_contract_observed?.input_count === contract.inputs.length, 'contract input count mismatch');
} else {
  warnings.push('current Agent 10 Spark-10 contract changed after package build; validating embedded contract snapshot only');
}
expect(artifact.agent10_contract_observed?.input_count === 90, 'contract input count must be 90');
if (contractCurrentMatchesPackage) {
  expect(
    artifact.agent10_contract_observed?.agent6_handoff_condition === contract.agent6_handoff_condition,
    'contract handoff condition mismatch',
  );
}
if (agent10RefreshCurrentMatchesPackage) {
  expect(
    artifact.agent10_current_lane_refresh_observed?.status === agent10Refresh.status,
    'Agent 10 refresh status mismatch',
  );
} else {
  warnings.push('current Agent 10 refresh artifact changed after package build; validating embedded refresh snapshot only');
}
expect(
  allFalse(artifact.agent10_current_lane_refresh_observed?.zero_boundary),
  'Agent 10 refresh zero_boundary must remain all false',
);

expectCounts(artifact.counts, {
  spark10_inputs_checked: artifact.spark10_return_observed?.summary?.inputs_checked,
  spark10_missing_required_inputs: artifact.spark10_return_observed?.summary?.missing_required_inputs,
  spark10_release_relevant_rows: artifact.spark10_return_observed?.summary?.release_relevant_rows,
  spark10_agent6_handoff_candidates: artifact.spark10_return_observed?.summary?.agent6_handoff_candidates,
});
expect(artifact.counts.spark10_inputs_checked === 90, 'Spark-10 input count must be 90');
expect(artifact.counts.spark10_missing_required_inputs === 0, 'Spark-10 missing required inputs must be 0');
expect(artifact.counts.spark10_release_relevant_rows === 26, 'Spark-10 release relevant rows must be 26');
expect(artifact.counts.spark10_agent6_handoff_candidates === 4, 'Spark-10 handoff candidates must be 4');
expect(
  artifact.spark10_return_observed?.summary?.public_runtime_mutation_authorized === false,
  'observed matrix must not authorize public/runtime mutation',
);
expect(
  artifact.spark10_return_observed?.summary?.answer_definition_release_authorized === false,
  'observed matrix must not authorize answer/definition/release',
);

const priorMatrixInput = (priorObserver.reviewed_inputs || []).find((input) => input.role === 'spark10_matrix_json');
const currentMatrixHash = sha256('reports/spark10-release-package-intake-matrix-current-2026-06-04.json');
expect(Boolean(priorMatrixInput), 'prior observer matrix input missing');
expect(
  artifact.refresh_delta_observed?.prior_matrix_sha256 === priorMatrixInput?.sha256,
  'prior matrix hash mismatch',
);
if (matrixCurrentMatchesPackage) {
  expect(artifact.refresh_delta_observed?.current_matrix_sha256 === currentMatrixHash, 'current matrix hash mismatch');
} else {
  warnings.push('refresh delta current_matrix_sha256 is a package-time hash, not the latest volatile current file hash');
}
expect(artifact.refresh_delta_observed?.matrix_hash_changed === true, 'matrix hash change must be true');
expect(artifact.refresh_delta_observed?.matrix_generated_at_changed === true, 'matrix generated_at change must be true');
expect(artifact.counts.matrix_hash_changed_since_prior_observer === 1, 'matrix hash delta count must be 1');

const matrixRows = matrix.rows || [];
if (matrixCurrentMatchesPackage) {
  expect(matrixRows.length === 90, 'matrix row count must be 90');
  const matrixAgent3Rows = matrixRows.filter((row) => row.lane_owner === 'Agent 3');
  expect(artifact.agent3_rows_observed.length === matrixAgent3Rows.length, 'Agent 3 row count mismatch');
}
expect(artifact.agent3_rows_observed.length === 11, 'Agent 3 rows must be 11');
expect(artifact.counts.agent3_rows_observed === 11, 'Agent 3 count field mismatch');
expect(artifact.counts.agent3_handoff_candidate_rows === 0, 'Agent 3 must have 0 handoff candidate rows');
expect(artifact.counts.agent3_rows_with_missing_inputs === 0, 'Agent 3 rows must all exist');
expect(artifact.counts.agent3_rows_with_public_or_mutation_action === 0, 'Agent 3 rows must not authorize mutation action');
for (const row of artifact.agent3_rows_observed) {
  expect(row.lane_owner === 'Agent 3', `Agent 3 row owner mismatch: ${row.path}`);
  expect(row.exists === true, `Agent 3 row missing input: ${row.path}`);
  expect(row.agent6_handoff_candidate === false, `Agent 3 row must not be handoff candidate: ${row.path}`);
  expect(row.next_agent10_action === 'inspect_if_release_relevant', `Agent 3 row next action mismatch: ${row.path}`);
  expect(!['append', 'public_mutation', 'route_publication_support'].includes(row.next_agent10_action), `Agent 3 mutation action: ${row.path}`);
}

if (matrixCurrentMatchesPackage) {
  const matrixHandoff = matrixRows.filter(
    (row) =>
      row.agent6_handoff_candidate ||
      row.next_agent10_action === 'prepare_or_route_agent6_boundary_only_if_exact_package_exists',
  );
  expect(artifact.agent6_handoff_candidates_observed.length === matrixHandoff.length, 'handoff candidate count mismatch');
}
expect(artifact.agent6_handoff_candidates_observed.length === 4, 'handoff candidates must be 4');
expect(artifact.counts.external_agent10_handoff_candidate_rows === 4, 'external Agent 10 handoff count mismatch');
for (const row of artifact.agent6_handoff_candidates_observed) {
  expect(row.lane_owner === 'Agent 10', `handoff candidate must be Agent 10-owned: ${row.path}`);
  expect(row.exists === true, `handoff candidate missing: ${row.path}`);
  expect(
    row.next_agent10_action === 'prepare_or_route_agent6_boundary_only_if_exact_package_exists',
    `handoff candidate next action mismatch: ${row.path}`,
  );
}

expect(artifact.prior_agent3_drift_audit_observed?.status === driftAudit.status, 'observed drift audit mismatch');
expect(artifact.prior_agent3_drift_audit_observed?.substantive_changed_files === 0, 'substantive drift must remain 0');
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
expect(allFalse(artifact.boundary), 'artifact boundary must be all false');
expect(artifact.package_summary?.executable_workset_created === false, 'must not create executable workset');
expect(artifact.package_summary?.current_matrix_refresh_packaged === true, 'must package current matrix refresh');

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
  console.error(`Agent 3 Spark-10 refresh observer validation failed (${issues.length} issue(s))`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 3 Spark-10 refresh observer validation passed');
console.log(
  JSON.stringify(
    {
      artifact: artifactPath,
      spark10_inputs_checked: artifact.counts.spark10_inputs_checked,
      release_relevant_rows: artifact.counts.spark10_release_relevant_rows,
      agent3_rows_observed: artifact.counts.agent3_rows_observed,
      agent3_handoff_candidate_rows: artifact.counts.agent3_handoff_candidate_rows,
      external_agent10_handoff_candidate_rows: artifact.counts.external_agent10_handoff_candidate_rows,
      matrix_hash_changed_since_prior_observer: artifact.counts.matrix_hash_changed_since_prior_observer,
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
  for (const key of keys) {
    expect(actual?.[key] === 0, `${key} must be 0`);
  }
}

function allFalse(value) {
  return Boolean(value) && Object.values(value).every((entry) => entry === false);
}

function readJson(inputPath) {
  return JSON.parse(fs.readFileSync(resolve(inputPath), 'utf8'));
}

function sha256(inputPath) {
  return crypto.createHash('sha256').update(fs.readFileSync(resolve(inputPath))).digest('hex');
}

function resolve(inputPath) {
  return path.resolve(root, inputPath);
}
