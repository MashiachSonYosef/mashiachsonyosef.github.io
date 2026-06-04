#!/usr/bin/env node
import fs from 'node:fs';

const artifactPath = 'reports/agent3-active-workset-handoff-index-2026-06-04.json';
const artifact = readJson(artifactPath);

assertEq(artifact.schema_version, 1, 'schema_version');
assertEq(artifact.artifact_type, 'agent3_active_workset_handoff_index', 'artifact_type');
assertEq(artifact.lane_owner, 'Agent 3', 'lane_owner');
assertEq(artifact.status, 'evidence_ready_active_workset_handoff_index', 'status');
assertEq(artifact.schema_counts.worksets_indexed, 2, 'schema_counts.worksets_indexed');
assertEq(artifact.schema_counts.changed_artifacts_found, 0, 'schema_counts.changed_artifacts_found');
assertEq(artifact.schema_counts.exact_new_worksets_found, 0, 'schema_counts.exact_new_worksets_found');
assertEq(artifact.schema_counts.new_matrix_rows, 0, 'schema_counts.new_matrix_rows');
assertEq(artifact.schema_counts.new_matrix_occurrences, 0, 'schema_counts.new_matrix_occurrences');

for (const filePath of artifact.files.input_files) {
  assert(fs.existsSync(filePath), `missing input file: ${filePath}`);
}

const orot = validateWorkset({
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
    blocker_occurrences: 2117,
  },
  sourceMap: {
    matched_rows: 'package_anchor_matched_rows',
    matched_occurrences: 'package_anchor_matched_occurrences',
    unmatched_rows: 'exact_blocker_rows',
    unmatched_occurrences: 'exact_blocker_occurrences',
    blocker_rows: 'exact_blocker_rows',
    blocker_occurrences: 'exact_blocker_occurrences',
  },
});

const deut = validateWorkset({
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
    blocker_occurrences: 9631,
  },
  sourceMap: {
    matched_rows: 'downstream_boundary_rows',
    matched_occurrences: 'downstream_boundary_occurrences',
    unmatched_rows: 'exact_blocker_rows',
    unmatched_occurrences: 'exact_blocker_occurrences',
    blocker_rows: 'exact_blocker_rows',
    blocker_occurrences: 'exact_blocker_occurrences',
  },
});

assertEq(artifact.schema_counts.total_rows, orot.rows + deut.rows, 'schema_counts.total_rows');
assertEq(artifact.schema_counts.total_occurrences, orot.occurrences + deut.occurrences, 'schema_counts.total_occurrences');
assertEq(artifact.schema_counts.matched_rows, orot.matched_rows + deut.matched_rows, 'schema_counts.matched_rows');
assertEq(artifact.schema_counts.matched_occurrences, orot.matched_occurrences + deut.matched_occurrences, 'schema_counts.matched_occurrences');
assertEq(artifact.schema_counts.blocker_rows, orot.blocker_rows + deut.blocker_rows, 'schema_counts.blocker_rows');
assertEq(artifact.schema_counts.blocker_occurrences, orot.blocker_occurrences + deut.blocker_occurrences, 'schema_counts.blocker_occurrences');

const blocker = readJson(artifact.current_blocker.artifact);
assertEq(blocker.status, 'missing_changed_artifact_or_exact_workset_blocker', 'current blocker status');
assertEq(blocker.schema_counts.changed_artifacts_found, 0, 'current blocker changed_artifacts_found');
assertEq(blocker.schema_counts.exact_new_worksets_found, 0, 'current blocker exact_new_worksets_found');

const statusAudit = readJson(artifact.matrix_status_audit.artifact);
assertEq(statusAudit.status, 'matrix_status_only_no_new_workset', 'matrix status audit status');
assertEq(statusAudit.counts.audited_files, 2, 'matrix status audit audited_files');
assertEq(statusAudit.counts.status_only_files, 2, 'matrix status audit status_only_files');
assertEq(statusAudit.counts.substantive_changed_files, 0, 'matrix status audit substantive_changed_files');

for (const [key, expected] of Object.entries({
  route_publication_support_rows: 0,
  definition_authority_rows: 0,
  answer_rows: 0,
  accepted_text_rows: 0,
  public_runtime_mutations: 0,
})) {
  assertEq(artifact.schema_counts[key], expected, `schema_counts.${key}`);
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
  'Agent 3 active workset handoff index validation passed: ' +
    `worksets ${artifact.schema_counts.worksets_indexed}; ` +
    `rows ${artifact.schema_counts.total_rows}; ` +
    `blocker_rows ${artifact.schema_counts.blocker_rows}`,
);

function validateWorkset({ workset, sourcePath, expected, sourceMap }) {
  const row = artifact.worksets.find((entry) => entry.workset === workset);
  assert(row, `missing workset: ${workset}`);
  const source = readJson(sourcePath);
  const counts = source.counts ?? source.summary ?? {};
  for (const [key, value] of Object.entries(expected)) {
    assertEq(row[key], value, `${workset}.${key}`);
    const sourceKey = sourceMap[key] ?? key;
    assertEq(counts[sourceKey], value, `${sourcePath}.${sourceKey}`);
  }
  return row;
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
