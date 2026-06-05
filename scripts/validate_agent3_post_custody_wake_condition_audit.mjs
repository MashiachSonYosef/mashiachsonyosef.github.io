#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const artifactPath = 'reports/agent3-post-custody-wake-condition-audit-2026-06-04.json';
const artifact = readJson(artifactPath);

assertEq(artifact.schema_version, 1, 'schema_version');
assertEq(artifact.artifact_type, 'agent3_post_custody_wake_condition_audit', 'artifact_type');
assertEq(artifact.lane_owner, 'Agent 3', 'lane_owner');
assertEq(artifact.status, 'no_new_agent3_executable_workset_after_custody_index', 'status');

for (const filePath of artifact.files.input_files) assertExists(filePath, `input ${filePath}`);

const custody = readJson('reports/agent3-returned-spark-artifact-custody-index-2026-06-04.json');
const handoff = readJson('reports/agent3-active-workset-handoff-index-2026-06-04.json');
const blocker = readJson('reports/agent3-next-deterministic-matrix-workset-blocker-2026-06-04.json');
const drift = readJson('reports/agent3-linkage-dedupe-generated-at-drift-audit-2026-06-04.json');
const queue = readJson('data/control/spark_standing_queue.json');

assertEq(artifact.schema_counts.returned_artifacts_indexed, custody.schema_counts.returned_artifacts_indexed, 'returned_artifacts_indexed');
assertEq(artifact.schema_counts.returned_artifacts_consumed, custody.schema_counts.returned_artifacts_consumed, 'returned_artifacts_consumed');
assertEq(artifact.schema_counts.unconsumed_returned_artifacts, 0, 'unconsumed_returned_artifacts');
assertEq(artifact.schema_counts.active_worksets_indexed, handoff.schema_counts.worksets_indexed, 'active_worksets_indexed');
assertEq(artifact.schema_counts.total_rows, handoff.schema_counts.total_rows, 'total_rows');
assertEq(artifact.schema_counts.total_occurrences, handoff.schema_counts.total_occurrences, 'total_occurrences');
assertEq(artifact.schema_counts.blocker_rows, handoff.schema_counts.blocker_rows, 'blocker_rows');
assertEq(artifact.schema_counts.blocker_occurrences, handoff.schema_counts.blocker_occurrences, 'blocker_occurrences');
assertEq(artifact.schema_counts.changed_artifacts_found, blocker.schema_counts.changed_artifacts_found, 'changed_artifacts_found');
assertEq(artifact.schema_counts.exact_new_worksets_found, blocker.schema_counts.exact_new_worksets_found, 'exact_new_worksets_found');
assertEq(artifact.schema_counts.matrix_substantive_changed_files, drift.counts.substantive_changed_files, 'matrix_substantive_changed_files');
assertEq(artifact.schema_counts.agent3_runnable_queue_items, 0, 'agent3_runnable_queue_items');
assertEq(
  artifact.schema_counts.candidate_files_modified_after_custody_index,
  artifact.file_delta_scan.modified_after_custody_index.length,
  'candidate_files_modified_after_custody_index',
);

for (const key of [
  'new_matrix_rows',
  'new_matrix_occurrences',
  'route_publication_support_rows',
  'definition_authority_rows',
  'usage_as_definition_rows',
  'answer_rows',
  'accepted_text_rows',
  'public_runtime_mutations',
]) {
  assertEq(artifact.schema_counts[key], 0, `schema_counts.${key}`);
}

assertEq(artifact.current_blocker.blocker, blocker.missing_field_blocker.blocker, 'current_blocker.blocker');
assertEq(artifact.current_blocker.changed_artifacts_found, 0, 'current_blocker.changed_artifacts_found');
assertEq(artifact.current_blocker.exact_new_worksets_found, 0, 'current_blocker.exact_new_worksets_found');

const queueMap = new Map((queue.items || []).map((entry) => [entry.id, entry]));
for (const row of artifact.queue_observations) {
  const source = queueMap.get(row.id);
  if (!source) {
    assertEq(row.exists, false, `${row.id}.exists`);
    assertEq(row.disposition, 'missing_queue_row', `${row.id}.disposition`);
    continue;
  }
  assertEq(row.exists, true, `${row.id}.exists`);
  assertEq(row.status, source.status || null, `${row.id}.status`);
  assertEq(row.has_pipeline_commands, Array.isArray(source.pipeline_commands) && source.pipeline_commands.length > 0, `${row.id}.has_pipeline_commands`);
}

const spark3Broad = artifact.queue_observations.find((entry) => entry.id === 'spark3-broad-linkage-dedupe-navigation');
assert(spark3Broad, 'spark3 broad observation must exist');
assert(
  ['returned_consumed_sleep_until_exact_workset', 'missing_queue_row'].includes(spark3Broad.disposition),
  'spark3 broad disposition',
);
assertEq(spark3Broad.agent3_runnable_now, false, 'spark3 broad agent3_runnable_now');

const oracle9 = artifact.queue_observations.find((entry) => entry.id === 'spark-oracle9-missed-dictionary-evidence-diff');
assert(oracle9, 'oracle9 observation must exist');
assert(
  ['missing_pipeline_commands_or_schema', 'missing_queue_row'].includes(oracle9.disposition),
  'oracle9 disposition',
);
assertEq(oracle9.has_pipeline_commands, false, 'oracle9 has_pipeline_commands');

const agent10 = artifact.agent10_handoff_observed;
if (agent10) {
  assertEq(agent10.disposition, 'handoff_observed_not_agent3_runnable_workset', 'agent10 handoff disposition');
  assertEq(agent10.package_owner, 'Agent 10', 'agent10 handoff package_owner');
  assert(agent10.agent3_input_paths.length >= 2, 'Agent 10 handoff should reference Agent 3 input paths');
}

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
  'Agent 3 post-custody wake condition audit validation passed: ' +
    `runnable ${artifact.schema_counts.agent3_runnable_queue_items}; ` +
    `file_deltas ${artifact.schema_counts.candidate_files_modified_after_custody_index}; ` +
    `new_worksets ${artifact.schema_counts.exact_new_worksets_found}`,
);

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
