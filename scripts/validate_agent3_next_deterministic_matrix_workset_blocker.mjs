#!/usr/bin/env node
import fs from 'node:fs';

const artifactPath = 'reports/agent3-next-deterministic-matrix-workset-blocker-2026-06-04.json';
const artifact = readJson(artifactPath);

assertEq(artifact.schema_version, 1, 'schema_version');
assertEq(artifact.artifact_type, 'agent3_next_deterministic_matrix_workset_blocker', 'artifact_type');
assertEq(artifact.lane_owner, 'Agent 3', 'lane_owner');
assertEq(artifact.status, 'missing_changed_artifact_or_exact_workset_blocker', 'status');
assertEq(artifact.exact_command_or_script_to_write_or_run, null, 'exact_command_or_script_to_write_or_run');
assertEq(artifact.files.changed_artifact_or_exact_new_workset, null, 'files.changed_artifact_or_exact_new_workset');

for (const filePath of [
  ...artifact.files.required_baselines,
  ...artifact.files.inspected_inputs,
]) {
  assert(fs.existsSync(filePath), `missing inspected file: ${filePath}`);
}

for (const [key, expected] of Object.entries({
  new_matrix_rows: 0,
  new_matrix_occurrences: 0,
  changed_artifacts_found: 0,
  exact_new_worksets_found: 0,
  blocker_rows: 1,
  route_publication_support_rows: 0,
  definition_authority_rows: 0,
  answer_rows: 0,
  accepted_text_rows: 0,
  public_runtime_mutations: 0,
})) {
  assertEq(artifact.schema_counts[key], expected, `schema_counts.${key}`);
}

validateBaseline({
  artifact,
  workset: 'orot_169_row_route_card_candidate_card_dedupe_review',
  sourcePath: 'reports/agent3-orot-169-row-route-card-candidate-card-dedupe-review-2026-06-04.json',
  expected: {
    rows: 169,
    occurrences: 2148,
    matched_rows: 1,
    matched_occurrences: 31,
    unmatched_rows: 168,
    unmatched_occurrences: 2117,
    blocker_rows: 168,
  },
  sourceMap: {
    matched_rows: 'package_anchor_matched_rows',
    matched_occurrences: 'package_anchor_matched_occurrences',
    unmatched_rows: 'exact_blocker_rows',
    unmatched_occurrences: 'exact_blocker_occurrences',
    blocker_rows: 'exact_blocker_rows',
  },
});

validateBaseline({
  artifact,
  workset: 'deuteronomy_phase2_linkage_dedupe_source_route_matrix',
  sourcePath: 'reports/agent3-deuteronomy-linkage-dedupe-source-route-matrix-2026-06-04.json',
  expected: {
    rows: 8113,
    occurrences: 12595,
    matched_rows: 1334,
    matched_occurrences: 2964,
    unmatched_rows: 6779,
    unmatched_occurrences: 9631,
    blocker_rows: 6779,
  },
  sourceMap: {
    matched_rows: 'downstream_boundary_rows',
    matched_occurrences: 'downstream_boundary_occurrences',
    unmatched_rows: 'exact_blocker_rows',
    unmatched_occurrences: 'exact_blocker_occurrences',
    blocker_rows: 'exact_blocker_rows',
  },
});

assertEq(artifact.current_queue_observation.spark3_broad_linkage_status, 'returned_no_blocker_no_queued_item_sleep_until_wake_condition', 'spark3 broad status');
assertEq(artifact.current_queue_observation.oracle9_blocker, 'missing_pipeline_contract', 'oracle9 blocker');
assertEq(artifact.missing_field_blocker.blocker, 'missing_changed_artifact_or_exact_workset', 'missing_field_blocker.blocker');
for (const field of [
  'changed_artifact_path_or_exact_workset_id',
  'target_rows_and_occurrences_for_new_matrix',
  'route_card_or_source_route_input_set',
  'output_path_and_schema_for_new_matrix',
  'validator_or_gate_for_new_matrix',
  'handoff_trigger_for_agent10_release_package_intake',
  'stop_condition_for_new_matrix_run',
]) {
  assert(artifact.missing_field_blocker.missing_fields.includes(field), `missing field not listed: ${field}`);
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
  'Agent 3 next deterministic matrix workset blocker validation passed: ' +
    `new_matrix_rows ${artifact.schema_counts.new_matrix_rows}; ` +
    `changed_artifacts ${artifact.schema_counts.changed_artifacts_found}; ` +
    `exact_worksets ${artifact.schema_counts.exact_new_worksets_found}`,
);

function validateBaseline({ artifact, workset, sourcePath, expected, sourceMap }) {
  const row = artifact.baseline_worksets.find((entry) => entry.workset === workset);
  assert(row, `missing baseline row: ${workset}`);
  const source = readJson(sourcePath);
  const counts = source.counts ?? source.summary ?? {};
  for (const [key, value] of Object.entries(expected)) {
    assertEq(row[key], value, `${workset}.${key}`);
    const sourceKey = sourceMap[key] ?? key;
    assertEq(counts[sourceKey], value, `${sourcePath}.${sourceKey}`);
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertEq(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}
