#!/usr/bin/env node
import fs from 'node:fs';

const artifactPath = 'reports/agent3-current-control-drift-refresh-2026-06-04.json';

const artifact = readJson(artifactPath);

assertEq(artifact.status, 'evidence_ready_control_drift_refresh', 'status');
assertEq(artifact.artifact_class, 'linkage_dedupe_navigation_control_drift_refresh', 'artifact_class');
assertEq(artifact.agent, 'Agent 3', 'agent');
assertEq(artifact.counts.inputs_observed, 7, 'counts.inputs_observed');
assertEq(artifact.counts.returned_validated_agent3_worksets, 2, 'counts.returned_validated_agent3_worksets');
assertEq(artifact.counts.spark3_named_mechanics_commands_returned_pass, 8, 'counts.spark3_named_mechanics_commands_returned_pass');
assertEq(artifact.counts.new_agent3_executable_worksets, 0, 'counts.new_agent3_executable_worksets');
assertEq(artifact.counts.missing_pipeline_blockers_preserved, 1, 'counts.missing_pipeline_blockers_preserved');
assertEq(artifact.counts.stale_or_contradictory_agent3_queue_fields, 4, 'counts.stale_or_contradictory_agent3_queue_fields');

for (const field of [
  'route_publication_support_rows',
  'definition_authority_rows',
  'answer_rows',
  'accepted_text_rows',
  'public_runtime_mutations',
]) {
  assertEq(artifact.counts[field], 0, `counts.${field}`);
}

assertEq(artifact.inputs_observed.length, artifact.counts.inputs_observed, 'inputs_observed length');
for (const input of artifact.inputs_observed) {
  assert(fileExists(input.path), `missing input path: ${input.path}`);
}

assertEq(artifact.returned_validated_worksets.length, 2, 'returned_validated_worksets length');
validateWorkset({
  artifact,
  workset: 'orot_169_row_route_card_candidate_card_dedupe_review',
  sourcePath: 'reports/agent3-orot-169-row-route-card-candidate-card-dedupe-review-2026-06-04.json',
  expected: {
    rows: 169,
    occurrences: 2148,
    exact_blocker_rows: 168,
    exact_blocker_occurrences: 2117,
    unique_duplicate_keys: 169,
    duplicate_key_collision_groups: 0,
  },
});
validateWorkset({
  artifact,
  workset: 'deuteronomy_phase2_linkage_dedupe_source_route_matrix',
  sourcePath: 'reports/agent3-deuteronomy-linkage-dedupe-source-route-matrix-2026-06-04.json',
  expected: {
    rows: 8113,
    occurrences: 12595,
    downstream_boundary_rows: 1334,
    downstream_boundary_occurrences: 2964,
    exact_blocker_rows: 6779,
    exact_blocker_occurrences: 9631,
    unique_duplicate_keys: 8113,
    duplicate_key_collision_groups: 0,
  },
});

assertEq(
  artifact.stale_or_contradictory_agent3_queue_fields.length,
  artifact.counts.stale_or_contradictory_agent3_queue_fields,
  'stale_or_contradictory_agent3_queue_fields length',
);
for (const finding of artifact.stale_or_contradictory_agent3_queue_fields) {
  assert(finding.path === 'data/control/spark_standing_queue.json', `unexpected drift path: ${finding.path}`);
  assert(finding.field, 'drift finding missing field');
  assert(finding.classification, 'drift finding missing classification');
}

assertEq(artifact.current_exact_blockers_preserved.length, 1, 'current_exact_blockers_preserved length');
const blocker = artifact.current_exact_blockers_preserved[0];
assertEq(blocker.queue_item, 'spark-oracle9-missed-dictionary-evidence-diff', 'blocker.queue_item');
assertEq(blocker.blocker, 'missing_pipeline_contract', 'blocker.blocker');
for (const missingField of [
  'pipeline_commands',
  'output_path_schema',
  'validator_gate',
  'target',
  'input_set',
  'package_owner',
  'Agent 6 boundary',
  'stop_condition',
]) {
  assert(blocker.missing_fields.includes(missingField), `blocker missing field not listed: ${missingField}`);
}

assertEq(artifact.next_work_condition.new_agent3_executable_worksets, 0, 'next_work_condition.new_agent3_executable_worksets');
assert(artifact.next_work_condition.wake_condition.includes('exact queue item'), 'wake condition must require exact queue item');

for (const [field, expected] of Object.entries({
  usage_as_definition_authority: false,
  definition_answer_selection: false,
  qa_acceptance: false,
  source_license_acceptance: false,
  runtime_publication_acceptance: false,
  route_publication_support: false,
  accepted_gloss_text: false,
  public_runtime_mutation: false,
})) {
  assertEq(artifact.boundary[field], expected, `boundary.${field}`);
}

assertFileIncludes('reports/spark3-broad-linkage-dedupe-navigation-2026-06-04-report.md', [
  'exact blocker: none',
  'next matching Spark-3 queue item: `no_queued_item`',
]);
assertFileIncludes('reports/spark3-standing-goal-mode-status-2026-06-04.md', [
  'status: awaiting_pipeline_contract',
  'spark-oracle9-missed-dictionary-evidence-diff',
]);
assertFileIncludes('reports/spark1-standing-goal-mode-status-2026-06-04.md', [
  'status: ready_contracts_exhausted',
  'reports/agent3-spark1-pipeline-contract-deuteronomy-phase2-linkage-dedupe-source-route-2026-06-04.md',
  'deuteronomy_linkage_dedupe_source_route: rows=8113 occurrences=12595 exact_blocker_rows=6779 downstream_boundary_rows=1334 duplicate_key_collision_groups=0',
]);

console.log(
  'Agent 3 current control drift refresh validation passed: ' +
    `inputs ${artifact.counts.inputs_observed}; ` +
    `returned worksets ${artifact.counts.returned_validated_agent3_worksets}; ` +
    `stale fields ${artifact.counts.stale_or_contradictory_agent3_queue_fields}; ` +
    `new executable worksets ${artifact.counts.new_agent3_executable_worksets}`,
);

function validateWorkset({ artifact, workset, sourcePath, expected }) {
  const row = artifact.returned_validated_worksets.find((item) => item.workset === workset);
  assert(row, `missing workset row: ${workset}`);
  const source = readJson(sourcePath);
  const summary = source.counts ?? source.summary ?? {};
  for (const [key, value] of Object.entries(expected)) {
    assertEq(row[key], value, `${workset}.${key}`);
    assertEq(summary[key], value, `${sourcePath}.summary.${key}`);
  }
  assertEq(row.artifact, sourcePath, `${workset}.artifact`);
}

function assertFileIncludes(filePath, needles) {
  const text = fs.readFileSync(filePath, 'utf8');
  for (const needle of needles) {
    assert(text.includes(needle), `${filePath} missing text: ${needle}`);
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEq(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}
