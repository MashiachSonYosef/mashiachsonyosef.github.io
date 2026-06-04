#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const artifactPath = 'reports/agent3-returned-spark-artifact-custody-index-2026-06-04.json';
const artifact = readJson(artifactPath);

assertEq(artifact.schema_version, 1, 'schema_version');
assertEq(artifact.artifact_type, 'agent3_returned_spark_artifact_custody_index', 'artifact_type');
assertEq(artifact.lane_owner, 'Agent 3', 'lane_owner');
assertEq(artifact.status, 'evidence_ready_returned_spark_custody_index', 'status');

for (const filePath of artifact.files.input_files) {
  assertExists(filePath, `input file ${filePath}`);
}

assertEq(artifact.schema_counts.returned_artifacts_indexed, artifact.returned_artifacts.length, 'returned_artifacts_indexed');
assertEq(artifact.schema_counts.returned_artifacts_consumed, artifact.returned_artifacts.length, 'returned_artifacts_consumed');
assertEq(artifact.schema_counts.unconsumed_returned_artifacts, 0, 'unconsumed_returned_artifacts');
assertEq(artifact.schema_counts.active_worksets_indexed, 2, 'active_worksets_indexed');
assertEq(artifact.schema_counts.total_rows, 8282, 'total_rows');
assertEq(artifact.schema_counts.total_occurrences, 14743, 'total_occurrences');
assertEq(artifact.schema_counts.matched_rows, 1335, 'matched_rows');
assertEq(artifact.schema_counts.matched_occurrences, 2995, 'matched_occurrences');
assertEq(artifact.schema_counts.blocker_rows, 6947, 'blocker_rows');
assertEq(artifact.schema_counts.blocker_occurrences, 11748, 'blocker_occurrences');
assertEq(artifact.schema_counts.changed_artifacts_found, 0, 'changed_artifacts_found');
assertEq(artifact.schema_counts.exact_new_worksets_found, 0, 'exact_new_worksets_found');
assertEq(artifact.schema_counts.new_matrix_rows, 0, 'new_matrix_rows');
assertEq(artifact.schema_counts.new_matrix_occurrences, 0, 'new_matrix_occurrences');

for (const key of [
  'route_publication_support_rows',
  'definition_authority_rows',
  'usage_as_definition_rows',
  'answer_rows',
  'accepted_text_rows',
  'public_runtime_mutations',
]) {
  assertEq(artifact.schema_counts[key], 0, `schema_counts.${key}`);
}

for (const entry of artifact.returned_artifacts) {
  assertExists(entry.returned_artifact, `returned artifact ${entry.returned_artifact}`);
  assertEq(entry.returned_artifact_sha256, sha256File(entry.returned_artifact), `${entry.id}.sha256`);
  assertEq(entry.returned_artifact_bytes, fs.statSync(path.join(root, entry.returned_artifact)).size, `${entry.id}.bytes`);
  assertEq(entry.consume_status, 'consumed', `${entry.id}.consume_status`);
  assertEq(entry.missing_consumers.length, 0, `${entry.id}.missing_consumers`);
  for (const consumerPath of entry.consumed_by) assertExists(consumerPath, `${entry.id}.consumer ${consumerPath}`);
}

const orot = readJson('reports/agent3-orot-169-row-route-card-candidate-card-dedupe-review-2026-06-04.json');
const deut = readJson('reports/agent3-deuteronomy-linkage-dedupe-source-route-matrix-2026-06-04.json');
const spark10 = readJson('reports/spark10-orot-169-row-local-route-card-dedupe-source-route-matrix-2026-06-04.json');
const active = readJson('reports/agent3-active-workset-handoff-index-2026-06-04.json');
const blocker = readJson('reports/agent3-next-deterministic-matrix-workset-blocker-2026-06-04.json');
const drift = readJson('reports/agent3-linkage-dedupe-generated-at-drift-audit-2026-06-04.json');
const frontier = readJson('reports/agent3-frontier-receipt-custody-boundary-observer-package-2026-06-04.json');

assertEq(artifact.active_workset_handoff.status, active.status, 'active_workset_handoff.status');
assertEq(artifact.active_workset_handoff.rows, active.schema_counts.total_rows, 'active_workset_handoff.rows');
assertEq(artifact.active_workset_handoff.occurrences, active.schema_counts.total_occurrences, 'active_workset_handoff.occurrences');
assertEq(artifact.active_workset_handoff.blocker_rows, active.schema_counts.blocker_rows, 'active_workset_handoff.blocker_rows');
assertEq(artifact.active_workset_handoff.blocker_occurrences, active.schema_counts.blocker_occurrences, 'active_workset_handoff.blocker_occurrences');

assertReturned('spark3_orot_169_row_contract_run', {
  rows: orot.counts.rows,
  occurrences: orot.counts.occurrences,
  blocker_rows: orot.counts.exact_blocker_rows,
  blocker_occurrences: orot.counts.exact_blocker_occurrences,
});
assertReturned('spark1_deuteronomy_phase2_contract_run', {
  rows: deut.counts.rows,
  occurrences: deut.counts.occurrences,
  blocker_rows: deut.counts.exact_blocker_rows,
  blocker_occurrences: deut.counts.exact_blocker_occurrences,
});
assertReturned('spark10_orot_169_row_source_route_matrix', {
  rows: spark10.summary.rows,
  occurrences: spark10.summary.occurrences,
  blocker_rows: spark10.summary.missing_from_placeholder_package_rows,
  blocker_occurrences: spark10.summary.missing_from_placeholder_package_occurrences,
});

assertEq(artifact.current_blocker.blocker, blocker.missing_field_blocker.blocker, 'current_blocker.blocker');
assertEq(artifact.current_blocker.changed_artifacts_found, blocker.schema_counts.changed_artifacts_found, 'current_blocker.changed_artifacts_found');
assertEq(artifact.current_blocker.exact_new_worksets_found, blocker.schema_counts.exact_new_worksets_found, 'current_blocker.exact_new_worksets_found');
assertEq(artifact.drift_audit.status, drift.status, 'drift_audit.status');
assertEq(artifact.drift_audit.substantive_changed_files, 0, 'drift_audit.substantive_changed_files');
assertEq(artifact.frontier_observer.status, frontier.status, 'frontier_observer.status');
assertEq(artifact.frontier_observer.external_row_payloads_copied_into_agent3, 0, 'frontier_observer.external_row_payloads_copied_into_agent3');

for (const [field, expected] of Object.entries({
  source_license_acceptance: false,
  qa_acceptance: false,
  definition_authority: false,
  usage_as_definition_authority: false,
  answer_selection: false,
  route_publication_support: false,
  public_runtime_acceptance: false,
  publication_readiness: false,
  product_data_acceptance: false,
  accepted_gloss_text: false,
  public_runtime_mutation: false,
})) {
  assertEq(artifact.boundary[field], expected, `boundary.${field}`);
}

console.log(
  'Agent 3 returned Spark artifact custody index validation passed: ' +
    `returns ${artifact.schema_counts.returned_artifacts_indexed}; ` +
    `consumed ${artifact.schema_counts.returned_artifacts_consumed}; ` +
    `new_worksets ${artifact.schema_counts.exact_new_worksets_found}`,
);

function assertReturned(id, expected) {
  const row = artifact.returned_artifacts.find((entry) => entry.id === id);
  assert(row, `missing returned artifact row ${id}`);
  for (const [key, value] of Object.entries(expected)) {
    assertEq(row[key], value, `${id}.${key}`);
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), 'utf8'));
}

function assertExists(filePath, label) {
  assert(fs.existsSync(path.join(root, filePath)), `${label} must exist`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertEq(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function sha256File(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(root, filePath))).digest('hex');
}
