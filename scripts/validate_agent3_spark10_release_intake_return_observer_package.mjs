#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const artifactPath =
  process.argv[2] || 'reports/agent3-spark10-release-intake-return-observer-package-2026-06-04.json';
const artifact = readJson(artifactPath);
const matrix = readJson('reports/spark10-release-package-intake-matrix-current-2026-06-04.json');
const contract = readJson('reports/agent10-spark10-release-package-intake-pipeline-contract-2026-06-04.json');
const driftAudit = readJson('reports/agent3-linkage-dedupe-generated-at-drift-audit-2026-06-04.json');
const issues = [];
const warnings = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(artifact.artifact_type === 'agent3_spark10_release_intake_return_observer_package', 'unexpected artifact_type');
expect(
  artifact.status === 'spark10_release_intake_return_observed_no_agent3_executable_workset',
  'unexpected status',
);
expect(artifact.publication_state === 'blocked_no_render', 'publication_state must be blocked_no_render');
expect(artifact.lane_owner === 'Agent 3', 'lane_owner must be Agent 3');

for (const input of artifact.reviewed_inputs || []) {
  expect(Boolean(input.role), 'reviewed input role missing');
  expect(Boolean(input.path), `reviewed input path missing for ${input.role}`);
  expect(fs.existsSync(resolve(input.path)), `reviewed input does not exist: ${input.path}`);
  expect(/^[a-f0-9]{64}$/.test(input.sha256 || ''), `reviewed input sha256 invalid: ${input.path}`);
  expect(Number.isInteger(input.bytes) && input.bytes > 0, `reviewed input bytes invalid: ${input.path}`);
}

expect(matrix.artifact_type === 'spark10_release_package_intake_matrix', 'matrix artifact_type mismatch');
expect(contract.artifact_type === 'spark10_release_package_intake_pipeline_contract', 'contract artifact_type mismatch');
expect(artifact.spark10_return_observed?.artifact_type === matrix.artifact_type, 'observed matrix type mismatch');
expect(artifact.spark10_return_observed?.contract_path === matrix.contract_path, 'matrix contract path mismatch');
const matrixCurrentMatchesPackage = currentMatchesReviewedInput(
  'spark10_matrix_json',
  'reports/spark10-release-package-intake-matrix-current-2026-06-04.json',
);
const contractCurrentMatchesPackage = currentMatchesReviewedInput(
  'agent10_contract_json',
  'reports/agent10-spark10-release-package-intake-pipeline-contract-2026-06-04.json',
);
if (contractCurrentMatchesPackage) {
  expect(artifact.agent10_contract_observed?.input_count === contract.inputs.length, 'contract input count mismatch');
} else {
  warnings.push('current Agent 10 Spark10 contract changed after package build; validated embedded package snapshot only');
}
if (contractCurrentMatchesPackage) {
  expect(
    artifact.agent10_contract_observed?.agent6_handoff_condition === contract.agent6_handoff_condition,
    'contract handoff condition mismatch',
  );
}

expectCounts(artifact.counts, {
  spark10_inputs_checked: artifact.spark10_return_observed?.summary?.inputs_checked,
  spark10_missing_required_inputs: artifact.spark10_return_observed?.summary?.missing_required_inputs,
  spark10_release_relevant_rows: artifact.spark10_return_observed?.summary?.release_relevant_rows,
  spark10_agent6_handoff_candidates: artifact.spark10_return_observed?.summary?.agent6_handoff_candidates,
});
expect(
  artifact.counts.spark10_inputs_checked === artifact.spark10_return_observed?.summary?.inputs_checked,
  'Spark-10 input count mismatch',
);
expect(artifact.counts.spark10_missing_required_inputs === 0, 'Spark-10 missing required inputs must be 0');
expect(
  artifact.counts.spark10_agent6_handoff_candidates === matrix.summary.agent6_handoff_candidates,
  'Spark-10 handoff candidates mismatch',
);
expect(matrix.summary.public_runtime_mutation_authorized === false, 'matrix must not authorize public/runtime mutation');
expect(matrix.summary.answer_definition_release_authorized === false, 'matrix must not authorize answer/definition/release');

const matrixAgent3Rows = matrix.rows.filter((row) => row.lane_owner === 'Agent 3');
if (matrixCurrentMatchesPackage) {
  expect(artifact.agent3_rows_observed.length === matrixAgent3Rows.length, 'Agent 3 row count mismatch');
} else {
  warnings.push('current Spark10 matrix changed after package build; validated embedded Agent 3 rows only');
}
expect(artifact.counts.agent3_rows_observed === artifact.agent3_rows_observed.length, 'Agent 3 count field mismatch');
expect(artifact.counts.agent3_handoff_candidate_rows === 0, 'Agent 3 must have 0 handoff candidate rows');
expect(artifact.counts.agent3_rows_with_missing_inputs === 0, 'Agent 3 rows must all exist');
expect(artifact.counts.agent3_rows_with_public_or_mutation_action === 0, 'Agent 3 rows must not authorize mutation action');
for (const row of artifact.agent3_rows_observed) {
  expect(row.lane_owner === 'Agent 3', `Agent 3 row owner mismatch: ${row.path}`);
  expect(row.exists === true, `Agent 3 row missing input: ${row.path}`);
  expect(row.agent6_handoff_candidate === false, `Agent 3 row must not be handoff candidate: ${row.path}`);
  expect(!['append', 'public_mutation'].includes(row.next_agent10_action), `Agent 3 row mutation action: ${row.path}`);
}

const matrixHandoff = matrix.rows.filter(
  (row) => row.agent6_handoff_candidate || row.next_agent10_action === 'prepare_or_route_agent6_boundary_only_if_exact_package_exists',
);
if (matrixCurrentMatchesPackage) {
  expect(artifact.agent6_handoff_candidates_observed.length === matrixHandoff.length, 'handoff candidate row count mismatch');
}
expect(
  artifact.counts.external_agent10_handoff_candidate_rows ===
    matrixHandoff.filter((row) => row.lane_owner === 'Agent 10').length,
  'external Agent 10 handoff count mismatch',
);
for (const row of artifact.agent6_handoff_candidates_observed) {
  expect(row.lane_owner === 'Agent 10', `handoff candidate must be Agent 10-owned: ${row.path}`);
  expect(row.exists === true, `handoff candidate missing: ${row.path}`);
  expect(
    row.next_agent10_action === 'prepare_or_route_agent6_boundary_only_if_exact_package_exists',
    `handoff candidate next action mismatch: ${row.path}`,
  );
}

expect(
  ['generated_at_drift_only_no_new_workset', 'matrix_status_only_no_new_workset'].includes(driftAudit.status),
  'prior drift audit status mismatch',
);
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
for (const [key, value] of Object.entries(artifact.boundary || {})) {
  expect(value === true, `boundary flag must be true: ${key}`);
}
expect(artifact.package_summary?.executable_workset_created === false, 'executable workset must not be created');
expect(/not Agent 3|Agent 3 created none/.test(artifact.package_summary?.agent6_handoff_owner || ''), 'handoff owner summary mismatch');

const serialized = JSON.stringify(artifact);
for (const needle of ['"accepted_text_now"', '"definition_text_stored_now"', '"source_route_evidence"', '"token_index_id"', '"surface"', '"normalized"']) {
  expect(!serialized.includes(needle), `artifact includes forbidden payload field ${needle}`);
}

if (issues.length) {
  console.error(JSON.stringify({ ok: false, artifact: artifactPath, issues }, null, 2));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      artifact: artifactPath,
      status: artifact.status,
      spark10_inputs_checked: artifact.counts.spark10_inputs_checked,
      agent3_rows_observed: artifact.counts.agent3_rows_observed,
      agent3_handoff_candidate_rows: artifact.counts.agent3_handoff_candidate_rows,
      external_agent10_handoff_candidate_rows: artifact.counts.external_agent10_handoff_candidate_rows,
      executable_workset_created: artifact.package_summary.executable_workset_created,
      warnings,
    },
    null,
    2,
  ),
);

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(resolve(relativePath), 'utf8'));
}

function resolve(relativePath) {
  return path.resolve(root, relativePath);
}

function sha256(relativePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(resolve(relativePath))).digest('hex');
}

function currentMatchesReviewedInput(role, relativePath) {
  const reviewed = (artifact.reviewed_inputs || []).find((input) => input.role === role);
  return Boolean(reviewed) && reviewed.sha256 === sha256(relativePath);
}

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
