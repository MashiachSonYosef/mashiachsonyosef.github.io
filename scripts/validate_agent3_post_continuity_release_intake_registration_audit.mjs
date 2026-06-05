#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath =
  process.argv[2] || 'reports/agent3-post-continuity-release-intake-registration-audit-2026-06-05.json';
const artifact = readJson(artifactPath);
const latestPackage = readJson(
  'reports/agent3-deuteronomy-phase2-transform-readiness-verdict-continuity-package-2026-06-05.json',
);
const previousAudit = readJson('reports/agent3-spark10-matrix-delta-audit-2026-06-05.json');
const state = readJson('reports/agent3-state.json');
const issues = [];
const warnings = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_post_continuity_release_intake_registration_audit',
  'artifact_type mismatch',
);
expect(
  [
    'latest_agent3_package_state_indexed_missing_spark10_intake_row',
    'latest_agent3_package_already_registered_no_new_workset',
  ].includes(artifact.status),
  'unexpected status',
);
expect(artifact.publication_state === 'blocked_no_render', 'publication_state must be blocked_no_render');
expect(artifact.lane_owner === 'Agent 3', 'lane_owner must be Agent 3');

validateReviewedInputs();
validateLatestPackage();
validateSnapshotCounts();
validateCurrentSpark10IfUnchanged();
validateState();
validateBoundaries();

if (issues.length > 0) {
  console.error(`Agent 3 post-continuity release intake registration audit failed (${issues.length} issue(s))`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 3 post-continuity release intake registration audit validation passed');
console.log(
  JSON.stringify(
    {
      artifact: artifactPath,
      status: artifact.status,
      latest_package_state_indexed: artifact.schema_counts.latest_agent3_package_state_indexed,
      latest_package_spark10_registered: artifact.schema_counts.latest_agent3_package_spark10_registered,
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
      direct_queue_agent3_runnable_items: artifact.schema_counts.direct_queue_agent3_runnable_items,
      warnings,
    },
    null,
    2,
  ),
);

function validateReviewedInputs() {
  const volatileRoles = new Set(artifact.volatile_reviewed_input_roles || []);
  for (const input of artifact.reviewed_inputs || []) {
    expect(Boolean(input.role), `reviewed input missing role for ${input.path}`);
    expect(Boolean(input.path), `reviewed input missing path for ${input.role}`);
    const absolute = resolve(input.path);
    expect(fs.existsSync(absolute), `reviewed input does not exist: ${input.path}`);
    expect(/^[a-f0-9]{64}$/.test(input.sha256 || ''), `reviewed input hash invalid: ${input.path}`);
    expect(Number.isInteger(input.bytes) && input.bytes > 0, `reviewed input bytes invalid: ${input.path}`);
    if (fs.existsSync(absolute)) {
      const actualHash = sha256(input.path);
      if (actualHash !== input.sha256) {
        if (volatileRoles.has(input.role)) {
          warnings.push(`volatile input changed after package build: ${input.path}`);
        } else {
          issues.push(`reviewed input hash drifted: ${input.path}`);
        }
      }
    }
  }
}

function validateLatestPackage() {
  const latest = artifact.latest_agent3_package || {};
  expect(latest.status === latestPackage.status, 'latest package status mismatch');
  expect(latest.publication_state === 'blocked_no_render', 'latest package publication state mismatch');
  expect(latest.transform_readiness_rows === 1334, 'latest package transform rows must be 1334');
  expect(latest.transform_readiness_occurrences === 2964, 'latest package transform occurrences must be 2964');
  expect(latest.agent3_matrix_rows === 8113, 'latest package Agent 3 matrix rows must be 8113');
  expect(latest.agent3_matrix_occurrences === 12595, 'latest package Agent 3 matrix occurrences must be 12595');
  expect(latest.exact_blocker_rows === 6779, 'latest package exact blocker rows must be 6779');
  expect(latest.exact_blocker_occurrences === 9631, 'latest package exact blocker occurrences must be 9631');
  expect(latest.external_lane_rows_copied === 0, 'latest package external rows copied must be 0');
  expect(latest.executable_output_authorized === false, 'latest package executable output must be false');
  expect(artifact.schema_counts.latest_agent3_package_state_indexed === 1, 'latest package must be state indexed');
  expect(artifact.schema_counts.latest_agent3_validator_state_indexed === 1, 'latest package validator must be state indexed');
}

function validateSnapshotCounts() {
  const counts = artifact.schema_counts || {};
  const previousCounts = previousAudit.schema_counts || {};
  expect(counts.previous_inputs_checked === previousCounts.current_inputs_checked, 'previous inputs mismatch');
  expect(
    counts.previous_release_relevant_rows === previousCounts.current_release_relevant_rows,
    'previous release rows mismatch',
  );
  expect(
    counts.previous_agent6_handoff_candidates === previousCounts.current_agent6_handoff_candidates,
    'previous handoff candidates mismatch',
  );
  expect(counts.previous_matrix_rows === previousCounts.current_matrix_rows, 'previous matrix rows mismatch');
  expect(counts.current_missing_required_inputs === 0, 'missing required inputs must be 0');
  expect(counts.current_matrix_rows === counts.current_inputs_checked, 'matrix rows should equal input count');
  expect(
    counts.current_agent3_rows >= counts.previous_agent3_rows,
    'current Agent 3 rows must not be below previous package snapshot',
  );
  expect(
    counts.current_spark3_rows >= counts.previous_spark3_rows,
    'current Spark-3 related rows must not be below previous package snapshot',
  );
  expect(counts.current_agent3_related_rows >= 24, 'Agent 3 related rows must cover Agent 3 rows');
  expect(counts.direct_queue_agent3_runnable_items === 0, 'direct Agent 3 runnable queue items must be 0');
  if (artifact.status === 'latest_agent3_package_already_registered_no_new_workset') {
    expect(counts.latest_agent3_package_spark10_registered === 1, 'latest package should be registered in current Spark10 intake');
  } else {
    expect(counts.latest_agent3_package_spark10_registered === 0, 'latest package should be absent from package-time Spark10 intake');
  }
  expect(counts.input_delta_since_previous_audit === counts.current_inputs_checked - counts.previous_inputs_checked, 'input delta mismatch');
  expect(
    counts.release_relevant_delta_since_previous_audit ===
      counts.current_release_relevant_rows - counts.previous_release_relevant_rows,
    'release delta mismatch',
  );
  expect(
    counts.handoff_delta_since_previous_audit ===
      counts.current_agent6_handoff_candidates - counts.previous_agent6_handoff_candidates,
    'handoff delta mismatch',
  );
  expect(
    counts.agent3_row_delta_since_previous_audit === counts.current_agent3_rows - counts.previous_agent3_rows,
    'Agent 3 row delta mismatch',
  );

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

function validateCurrentSpark10IfUnchanged() {
  const matrixInput = (artifact.reviewed_inputs || []).find((input) => input.role === 'spark10MatrixJson');
  if (!matrixInput || !fs.existsSync(resolve(matrixInput.path))) return;
  if (sha256(matrixInput.path) !== matrixInput.sha256) {
    warnings.push('current Spark10 matrix changed after package build; package-time snapshot remains validated');
    return;
  }
  const matrix = readJson(matrixInput.path);
  const rows = matrix.rows || [];
  const latestPath = artifact.latest_agent3_package?.path;
  expect(matrix.summary.inputs_checked === artifact.schema_counts.current_inputs_checked, 'current matrix input count mismatch');
  expect(
    matrix.summary.release_relevant_rows === artifact.schema_counts.current_release_relevant_rows,
    'current matrix release count mismatch',
  );
  expect(
    matrix.summary.agent6_handoff_candidates === artifact.schema_counts.current_agent6_handoff_candidates,
    'current matrix handoff count mismatch',
  );
  expect(rows.length === artifact.schema_counts.current_matrix_rows, 'current matrix row count mismatch');
  const latestRegistered = rows.some((row) => row.path === latestPath);
  if (artifact.schema_counts.latest_agent3_package_spark10_registered === 1) {
    expect(latestRegistered, 'latest Agent 3 package should be registered in unchanged matrix');
  } else {
    expect(!latestRegistered, 'latest Agent 3 package unexpectedly registered in unchanged matrix');
  }
}

function validateState() {
  const evidence = state.evidence_artifacts || [];
  const validators = state.validators || [];
  expect(evidence.includes(artifact.latest_agent3_package.path), 'current state missing latest package JSON');
  expect(evidence.includes(artifact.latest_agent3_package.markdown_path), 'current state missing latest package markdown');
  expect(validators.includes('scripts/validate_agent3_deuteronomy_phase2_transform_readiness_verdict_continuity_package.mjs'), 'current state missing latest package validator');
}

function validateBoundaries() {
  expect(allFalse(artifact.boundary), 'artifact boundary must be all false');
  expect(allFalse(artifact.spark10_current_matrix?.boundary), 'Spark10 boundary must be all false at snapshot');
  for (const [key, value] of Object.entries(artifact.agent10_changed_outputs_consumption?.zero_counters || {})) {
    expect(value === 0, `Agent 10 changed output zero counter ${key} must be 0`);
  }
  for (const [key, value] of Object.entries(artifact.agent10_current_boundary_verdict_consumption?.zero_counters || {})) {
    expect(value === 0, `Agent 10 verdict zero counter ${key} must be 0`);
  }
  const expectedBlocker =
    artifact.status === 'latest_agent3_package_already_registered_no_new_workset'
      ? 'missing_changed_artifact_or_exact_workset'
      : 'missing_spark10_intake_registration_or_exact_agent3_workset';
  expect(artifact.missing_field_blocker?.blocker === expectedBlocker, 'missing field blocker mismatch');
  expect(/Agent 10/.test(artifact.handoff_owner || ''), 'handoff owner must name Agent 10');

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
