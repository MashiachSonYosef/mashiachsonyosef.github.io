#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath =
  process.argv[2] ||
  'reports/agent3-downstream-deuteronomy-workset-blocker-observer-package-2026-06-04.json';
const artifact = readJson(artifactPath);
const issues = [];
const warnings = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_downstream_deuteronomy_workset_blocker_observer_package',
  'unexpected artifact_type',
);
expect(artifact.status === 'downstream_deuteronomy_no_agent3_workset_observed', 'unexpected status');
expect(artifact.publication_state === 'blocked_no_render', 'publication_state must be blocked_no_render');
expect(artifact.lane_owner === 'Agent 3', 'lane_owner must be Agent 3');

const reviewedInputs = artifact.reviewed_inputs || [];
expect(reviewedInputs.length === 7, 'reviewed input count must be 7');
for (const input of reviewedInputs) {
  expect(Boolean(input.role), 'reviewed input role missing');
  expect(Boolean(input.path), `reviewed input path missing for ${input.role}`);
  expect(fs.existsSync(resolve(input.path)), `reviewed input does not exist: ${input.path}`);
  expect(/^[a-f0-9]{64}$/.test(input.sha256 || ''), `reviewed input sha256 invalid: ${input.path}`);
  if (fs.existsSync(resolve(input.path)) && input.sha256 !== sha256(fs.readFileSync(resolve(input.path)))) {
    warnings.push(`reviewed input drifted after package build: ${input.path}`);
  }
  expect(Number.isInteger(input.bytes) && input.bytes > 0, `reviewed input bytes invalid: ${input.path}`);
}

expect(
  artifact.downstream_agent2_blocker_observed?.artifact_type === 'agent2_next_workset_needed_after_deuteronomy_return',
  'Agent 2 blocker artifact_type mismatch',
);
expect(
  artifact.downstream_agent2_blocker_observed?.status === 'no_new_agent2_exact_workset_after_deuteronomy_return',
  'Agent 2 blocker status mismatch',
);
expect(
  artifact.downstream_agent2_blocker_observed?.exact_blocker === 'no_new_agent2_exact_workset_after_deuteronomy_return',
  'Agent 2 exact blocker mismatch',
);
expect(
  Array.isArray(artifact.downstream_agent2_blocker_observed?.standing_exact_blockers) &&
    artifact.downstream_agent2_blocker_observed.standing_exact_blockers.includes(
      'no_new_agent2_exact_workset_after_deuteronomy_return',
    ),
  'standing exact blockers must include downstream Deuteronomy blocker',
);
expect(
  artifact.agent2_route_scan_observed?.artifact_type === 'agent2_current_route_scan_receipt',
  'route scan artifact_type mismatch',
);
expect(
  artifact.agent2_route_scan_observed?.current_exact_blocker ===
    'no_new_agent2_exact_workset_after_deuteronomy_return',
  'route scan current blocker mismatch',
);
expect(allFalse(artifact.agent2_route_scan_observed?.zero_boundary), 'route scan zero boundary must be all false');

expect(
  artifact.spark10_current_matrix_observed?.artifact_type === 'spark10_release_package_intake_matrix',
  'Spark10 matrix artifact_type mismatch',
);
const spark10Summary = artifact.spark10_current_matrix_observed?.summary || {};
expectCounts(artifact.counts, {
  spark10_inputs_checked: spark10Summary.inputs_checked,
  spark10_missing_required_inputs: 0,
  spark10_release_relevant_rows: spark10Summary.release_relevant_rows,
  spark10_agent6_handoff_candidates: spark10Summary.agent6_handoff_candidates,
  agent3_rows_observed: artifact.agent3_rows_observed?.length,
  agent3_handoff_candidate_rows: (artifact.agent3_rows_observed || []).filter((row) => row.agent6_handoff_candidate).length,
  agent3_rows_with_missing_inputs: 0,
  agent3_rows_with_public_or_mutation_action: 0,
  agent2_rows_observed: artifact.agent2_rows_observed?.length,
  agent2_exact_workset_available_now: 0,
  external_agent10_handoff_candidate_rows: (artifact.agent6_handoff_candidates_observed || []).filter(
    (row) => row.lane_owner === 'Agent 10',
  ).length,
});
expect(
  artifact.spark10_current_matrix_observed?.summary?.public_runtime_mutation_authorized === false,
  'Spark10 summary must not authorize runtime mutation',
);
expect(
  artifact.spark10_current_matrix_observed?.summary?.answer_definition_release_authorized === false,
  'Spark10 summary must not authorize answer/definition release',
);

expect(Array.isArray(artifact.agent3_rows_observed), 'agent3_rows_observed must be an array');
expect(
  artifact.agent3_rows_observed.length === artifact.counts.agent3_rows_observed,
  'Agent 3 row count must match artifact counts',
);
for (const row of artifact.agent3_rows_observed) {
  expect(row.lane_owner === 'Agent 3', `Agent 3 row owner mismatch: ${row.path}`);
  expect(row.exists === true, `Agent 3 row missing input: ${row.path}`);
  expect(row.agent6_handoff_candidate === false, `Agent 3 row must not be handoff candidate: ${row.path}`);
  expect(
    !['append', 'public_mutation', 'route_publication_support'].includes(row.next_agent10_action),
    `Agent 3 row next action must not be publication/mutation: ${row.path}`,
  );
}
expect(Array.isArray(artifact.agent6_handoff_candidates_observed), 'handoff candidates must be an array');
expect(
  artifact.agent6_handoff_candidates_observed.length === artifact.counts.spark10_agent6_handoff_candidates,
  'handoff candidate count must match Spark10 summary',
);
for (const row of artifact.agent6_handoff_candidates_observed) {
  expect(row.lane_owner === 'Agent 10', `handoff candidate must be Agent 10-owned: ${row.path}`);
  expect(
    row.next_agent10_action === 'prepare_or_route_agent6_boundary_only_if_exact_package_exists',
    `handoff candidate next action mismatch: ${row.path}`,
  );
}

expect(
  ['generated_at_drift_only_no_new_workset', 'matrix_status_only_no_new_workset'].includes(
    artifact.agent3_drift_audit_observed?.status,
  ),
  'drift audit status mismatch',
);
expect(artifact.agent3_drift_audit_observed?.substantive_changed_files === 0, 'substantive drift must be 0');
expect(artifact.package_summary?.executable_workset_created === false, 'must not create executable workset');
expect(artifact.package_summary?.downstream_agent2_blocker_packaged === true, 'must package downstream blocker');
expect(allFalse(artifact.boundary), 'boundary must be all false');
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
  console.error(`Agent 3 downstream Deuteronomy blocker observer validation failed (${issues.length} issue(s))`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 3 downstream Deuteronomy blocker observer validation passed');
console.log(
  JSON.stringify(
    {
      artifact: artifactPath,
      spark10_inputs_checked: artifact.counts.spark10_inputs_checked,
      spark10_release_relevant_rows: artifact.counts.spark10_release_relevant_rows,
      spark10_agent6_handoff_candidates: artifact.counts.spark10_agent6_handoff_candidates,
      agent3_rows_observed: artifact.counts.agent3_rows_observed,
      agent3_handoff_candidate_rows: artifact.counts.agent3_handoff_candidate_rows,
      agent2_exact_workset_available_now: artifact.counts.agent2_exact_workset_available_now,
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
  for (const key of keys) expect(actual?.[key] === 0, `${key} must be 0`);
}

function allFalse(value) {
  return Boolean(value) && Object.values(value).every((entry) => entry === false);
}

function readJson(inputPath) {
  return JSON.parse(fs.readFileSync(resolve(inputPath), 'utf8'));
}

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function resolve(inputPath) {
  return path.resolve(root, inputPath);
}
