#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent10-agent6-ready-old-dictionary-morphology-planning-boundary-packet-2026-06-05.json';
const artifact = readJson(artifactPath);
const issues = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(artifact.artifact_type === 'agent10_agent6_ready_old_dictionary_morphology_planning_boundary_packet', 'artifact_type mismatch');
expect(artifact.status === 'agent6_ready_nonpublic_morphology_planning_boundary_packet', 'status mismatch');
expect(artifact.review_scope?.scope_type === 'nonpublic_old_dictionary_morphology_relation_planning_only', 'review scope mismatch');
expect(artifact.review_scope?.matrix_rows === 297, 'matrix row count must be 297');
expect(artifact.review_scope?.matrix_occurrences === 5747, 'matrix occurrences must be 5747');
expect(artifact.review_scope?.morphology_planning_rows === 78, 'morphology planning rows must be 78');
expect(artifact.review_scope?.morphology_planning_occurrences === 1461, 'morphology planning occurrences must be 1461');
expect(artifact.review_scope?.morphology_blocked_rows === 219, 'morphology blocked rows must be 219');
expect(artifact.review_scope?.allowed_candidate_use_rows_now === 0, 'allowed candidate-use rows must be 0');
expect(artifact.review_scope?.allowed_transform_rows_now === 0, 'allowed transform rows must be 0');
expect(artifact.subset_selector?.include_rows_where?.preview_relation_class === 'exact_after_mark_strip', 'subset relation selector mismatch');
expect(artifact.subset_selector?.include_rows_where?.agent2_morphology_relation_status === 'agent2_morphology_relation_approved_for_nonpublic_planning', 'subset status selector mismatch');
expect(Array.isArray(artifact.reviewed_inputs) && artifact.reviewed_inputs.length >= 10, 'reviewed inputs missing');
for (const input of artifact.reviewed_inputs || []) {
  expect(fs.existsSync(path.join(root, input)), `reviewed input missing: ${input}`);
}

const matrix = readJson('reports/agent2-old-dictionary-commercial-clean-morphology-relation-matrix-2026-06-05.json');
expect(matrix.counts?.unique_preview_rows === artifact.review_scope.matrix_rows, 'matrix row count does not match packet');
expect(matrix.counts?.unique_preview_occurrences === artifact.review_scope.matrix_occurrences, 'matrix occurrence count does not match packet');
expect(matrix.relation_class_counts?.exact_after_mark_strip?.rows === artifact.review_scope.morphology_planning_rows, 'exact-after row count mismatch');
expect(matrix.relation_class_counts?.exact_after_mark_strip?.occurrences === artifact.review_scope.morphology_planning_occurrences, 'exact-after occurrence count mismatch');
expect(matrix.counts?.candidate_text_rows_now === 0, 'source matrix candidate text rows must be 0');
expect(matrix.counts?.definition_candidate_rows_now === 0, 'source matrix definition candidate rows must be 0');
expect(matrix.counts?.answer_eligible_rows_now === 0, 'source matrix answer eligible rows must be 0');

const blocker = readJson('reports/agent2-morphology-planning-candidate-use-blocker-2026-06-05.json');
expect(blocker.counts?.morphology_planning_rows === artifact.review_scope.morphology_planning_rows, 'blocker planning rows mismatch');
expect(blocker.counts?.morphology_planning_occurrences === artifact.review_scope.morphology_planning_occurrences, 'blocker planning occurrences mismatch');
expect(blocker.counts?.allowed_candidate_use_rows_now === 0, 'blocker candidate-use rows must be 0');
expect(blocker.counts?.allowed_transform_rows_now === 0, 'blocker transform rows must be 0');

for (const [key, value] of Object.entries(artifact.zero_counters || {})) {
  expect(value === 0, `zero counter ${key} must be 0`);
}
expect((artifact.exact_blockers_preserved || []).includes('missing_exact_agent6_row_subset_boundary_for_candidate_use'), 'candidate-use blocker must be preserved');
expect((artifact.forbidden_claims || []).includes('release action'), 'forbidden claims must include release action');
expect(!JSON.stringify(artifact).includes('"answer_eligible":true'), 'packet must not mark answer_eligible true');

if (issues.length) {
  console.error(`Agent10 old-dictionary morphology planning boundary packet validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent10 old-dictionary morphology planning boundary packet validation passed. Planning rows: ${artifact.review_scope.morphology_planning_rows}; occurrences: ${artifact.review_scope.morphology_planning_occurrences}.`);

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}
