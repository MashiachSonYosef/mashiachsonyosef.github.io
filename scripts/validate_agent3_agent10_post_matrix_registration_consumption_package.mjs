#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath =
  process.argv[2] ||
  'reports/agent3-agent10-post-matrix-registration-consumption-package-2026-06-05.json';
const artifact = readJson(artifactPath);
const agent10 = readJson('reports/agent10-post-matrix-lane-output-consumption-2026-06-05.json');
const continuity = readJson(
  'reports/agent3-deuteronomy-phase2-transform-readiness-verdict-continuity-package-2026-06-05.json',
);
const state = readJson('reports/agent3-state.json');
const issues = [];
const warnings = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_agent10_post_matrix_registration_consumption_package',
  'artifact_type mismatch',
);
expect(
  artifact.status === 'agent10_post_matrix_registration_consumed_no_executable_workset',
  'status mismatch',
);
expect(artifact.publication_state === 'blocked_no_render', 'publication_state must be blocked_no_render');
expect(artifact.lane_owner === 'Agent 3', 'lane_owner must be Agent 3');

validateReviewedInputs();
validateAgent10Consumption();
validateContinuityCounts();
validateSpark10SnapshotIfUnchanged();
validateState();
validateBoundaries();

if (issues.length) {
  console.error(`Agent 3 Agent10 post-matrix registration consumption package failed (${issues.length} issue(s))`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 3 Agent10 post-matrix registration consumption package validation passed');
console.log(
  JSON.stringify(
    {
      artifact: artifactPath,
      status: artifact.status,
      transform_rows: artifact.schema_counts.transform_readiness_rows,
      transform_occurrences: artifact.schema_counts.transform_readiness_occurrences,
      spark10_registered_rows: artifact.schema_counts.spark10_agent3_continuity_registered_rows,
      direct_agent3_executable_worksets: artifact.schema_counts.direct_agent3_executable_worksets,
      remaining_blocker: artifact.remaining_blocker.blocker,
      warnings,
    },
    null,
    2,
  ),
);

function validateReviewedInputs() {
  const volatile = new Set(artifact.volatile_reviewed_input_roles || []);
  for (const input of artifact.reviewed_inputs || []) {
    expect(Boolean(input.role), `reviewed input missing role for ${input.path}`);
    expect(Boolean(input.path), `reviewed input missing path for ${input.role}`);
    const absolute = resolve(input.path);
    expect(fs.existsSync(absolute), `reviewed input missing: ${input.path}`);
    expect(/^[a-f0-9]{64}$/.test(input.sha256 || ''), `reviewed input hash invalid: ${input.path}`);
    expect(Number.isInteger(input.bytes) && input.bytes > 0, `reviewed input bytes invalid: ${input.path}`);
    if (fs.existsSync(absolute) && sha256(input.path) !== input.sha256) {
      if (volatile.has(input.role)) warnings.push(`volatile input changed after package build: ${input.path}`);
      else issues.push(`reviewed input hash drifted: ${input.path}`);
    }
  }
}

function validateAgent10Consumption() {
  expect(agent10.artifact_type === 'agent10_post_matrix_lane_output_consumption', 'Agent 10 artifact type mismatch');
  expect(artifact.agent10_consumption?.package_workset === agent10.package_workset, 'Agent 10 package workset mismatch');
  const consumed = (agent10.consumed_packages || []).find(
    (entry) => entry.package_workset === 'agent3_deuteronomy_phase2_continuity_registration',
  );
  expect(Boolean(consumed), 'Agent 10 must include Agent 3 continuity registration package');
  expect(
    consumed?.exact_blocker === 'no_exact_changed_executable_agent3_workset',
    'Agent 10 remaining blocker mismatch',
  );
  expect(artifact.resolved_blocker?.prior_blocker === 'missing_spark10_intake_registration_or_exact_agent3_workset', 'prior blocker mismatch');
  expect(
    artifact.resolved_blocker?.resolved_scope ===
      'Spark-10 registration for latest Agent 3 Deuteronomy continuity artifacts only',
    'resolved scope mismatch',
  );
  for (const [key, value] of Object.entries(agent10.zero_counters || {})) {
    expect(value === 0, `Agent 10 zero counter ${key} must be 0`);
  }
}

function validateContinuityCounts() {
  expect(artifact.schema_counts.transform_readiness_rows === 1334, 'transform rows must be 1334');
  expect(artifact.schema_counts.transform_readiness_occurrences === 2964, 'transform occurrences must be 2964');
  expect(artifact.schema_counts.agent3_matrix_rows === 8113, 'Agent 3 matrix rows must be 8113');
  expect(artifact.schema_counts.agent3_matrix_occurrences === 12595, 'Agent 3 matrix occurrences must be 12595');
  expect(artifact.schema_counts.exact_blocker_rows === 6779, 'exact blocker rows must be 6779');
  expect(artifact.schema_counts.exact_blocker_occurrences === 9631, 'exact blocker occurrences must be 9631');
  expect(artifact.schema_counts.external_lane_rows_copied === 0, 'external lane rows copied must be 0');
  expect(continuity.package_summary?.executable_output_authorized === false, 'continuity package executable output must be false');
  expect(artifact.schema_counts.direct_agent3_executable_worksets === 0, 'direct executable worksets must be 0');
}

function validateSpark10SnapshotIfUnchanged() {
  const matrixInput = (artifact.reviewed_inputs || []).find((input) => input.role === 'spark10MatrixJson');
  if (!matrixInput || !fs.existsSync(resolve(matrixInput.path))) return;
  if (sha256(matrixInput.path) !== matrixInput.sha256) {
    warnings.push('current Spark10 matrix changed after package build; package-time snapshot remains validated');
    return;
  }
  const spark10 = readJson(matrixInput.path);
  const rows = spark10.rows || [];
  const required = [
    'reports/agent3-deuteronomy-phase2-transform-readiness-verdict-continuity-package-2026-06-05.json',
    'reports/agent3-deuteronomy-phase2-transform-readiness-verdict-continuity-package-2026-06-05.md',
    'reports/agent3-post-continuity-release-intake-registration-audit-2026-06-05.json',
    'reports/agent3-post-continuity-release-intake-registration-audit-2026-06-05.md',
  ];
  expect(spark10.summary.inputs_checked === artifact.schema_counts.spark10_inputs_checked, 'Spark10 input count mismatch');
  expect(rows.length === artifact.schema_counts.spark10_matrix_rows, 'Spark10 row count mismatch');
  expect(
    required.every((targetPath) => rows.some((row) => row.path === targetPath)),
    'Spark10 snapshot must register all four latest Agent 3 continuity/audit rows',
  );
  expect(artifact.schema_counts.spark10_agent3_continuity_registered_rows === 4, 'Spark10 registered rows must be 4');
}

function validateState() {
  const evidence = state.evidence_artifacts || [];
  expect(evidence.includes(artifact.latest_agent3_continuity_package.path), 'state missing continuity package JSON');
  expect(
    evidence.includes('reports/agent3-post-continuity-release-intake-registration-audit-2026-06-05.json'),
    'state missing registration audit JSON',
  );
}

function validateBoundaries() {
  expect(allFalse(artifact.boundary), 'artifact boundary must be all false');
  expect(allFalse(artifact.spark10_registration_snapshot?.boundary), 'Spark10 boundary must be all false');
  expect(artifact.remaining_blocker?.blocker === 'no_exact_changed_executable_agent3_workset', 'remaining blocker mismatch');
  expect(/Agent 10/.test(artifact.handoff_owner || ''), 'handoff owner must name Agent 10');
  for (const key of [
    'route_publication_support_rows',
    'definition_authority_rows',
    'usage_as_definition_rows',
    'answer_rows',
    'accepted_text_rows',
    'public_runtime_mutations',
    'public_reader_output_rows',
  ]) {
    expect(artifact.schema_counts?.[key] === 0, `${key} must be 0`);
  }
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
