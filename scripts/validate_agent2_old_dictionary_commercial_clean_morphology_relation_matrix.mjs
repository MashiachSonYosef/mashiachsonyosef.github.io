#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const matrixPath = process.argv[2] || 'reports/agent2-old-dictionary-commercial-clean-morphology-relation-matrix-2026-06-05.json';
const matrix = readJson(matrixPath);
const issues = [];

expect(matrix.artifact_type === 'agent2_old_dictionary_commercial_clean_morphology_relation_matrix', 'artifact_type mismatch');
expect(matrix.status === 'nonpublic_morphology_relation_matrix_built_no_candidate_text', 'status mismatch');
expect(matrix.inputs?.agent10_workset === 'reports/agent10-agent2-ready-old-dictionary-commercial-clean-morphology-relation-workset-2026-06-05.json', 'workset input mismatch');

expect(matrix.counts?.unique_preview_rows === 297, 'unique preview rows must be 297');
expect(matrix.counts?.unique_preview_occurrences === 5747, 'unique preview occurrences must be 5747');
expect(matrix.counts?.commercial_clean_source_families === 3, 'commercial-clean source families must be 3');
expect(matrix.counts?.commercial_clean_source_family_hit_rows === 500, 'commercial-clean source-family hit rows must be 500');
expect(matrix.counts?.commercial_clean_source_family_hit_occurrences === 10940, 'commercial-clean source-family hit occurrences must be 10940');
expect(matrix.counts?.agent2_morphology_planning_approved_rows === 78, 'approved morphology planning rows must be 78');
expect(matrix.counts?.agent2_morphology_blocked_rows === 219, 'blocked morphology rows must be 219');
expect(matrix.counts?.allowed_transform_rows_now === 0, 'allowed transform rows must be 0');

const expectedRelationClasses = {
  exact_after_mark_strip: [78, 1461],
  needs_morphology_disambiguation: [90, 1251],
  prefix_or_clitic_possible: [129, 3035],
};
for (const [key, [rows, occurrences]] of Object.entries(expectedRelationClasses)) {
  expect(matrix.relation_class_counts?.[key]?.rows === rows, `${key} rows mismatch`);
  expect(matrix.relation_class_counts?.[key]?.occurrences === occurrences, `${key} occurrences mismatch`);
}

const expectedStatusCounts = {
  agent2_morphology_relation_approved_for_nonpublic_planning: 78,
  agent2_morphology_relation_blocked_needs_disambiguation: 90,
  agent2_morphology_relation_blocked_prefix_or_clitic_possible: 129,
};
for (const [key, value] of Object.entries(expectedStatusCounts)) {
  expect(matrix.relation_status_counts?.[key] === value, `${key} count mismatch`);
}

expect(Array.isArray(matrix.rows) && matrix.rows.length === 297, 'matrix rows must contain 297 entries');
const seen = new Set();
for (const row of matrix.rows || []) {
  expect(typeof row.queue_id === 'string' && row.queue_id.length > 0, 'row queue_id missing');
  expect(!seen.has(row.queue_id), `duplicate queue_id ${row.queue_id}`);
  seen.add(row.queue_id);
  expect(row.nonpublic_planning_only === true, `${row.queue_id} must be nonpublic planning only`);
  expect(row.downstream_agent6_candidate_use_package_required === true, `${row.queue_id} must require downstream Agent 6 package`);
  expect(typeof row.exact_blocker === 'string' && row.exact_blocker.length > 0, `${row.queue_id} exact blocker missing`);
  for (const key of [
    'candidate_text_rows_now',
    'definition_candidate_rows_now',
    'lemma_candidate_rows_now',
    'reader_hint_candidate_rows_now',
    'answer_eligible_rows_now',
    'public_emit_rows_now',
    'accepted_gloss_text_rows_now',
    'definition_content_rows_now',
  ]) {
    expect(row[key] === 0, `${row.queue_id}.${key} must be 0`);
  }
}

for (const [key, value] of Object.entries(matrix.zero_output_counts || {})) {
  expect(value === 0, `zero_output_counts.${key} must be 0`);
}

for (const blocker of [
  'missing_exact_agent6_row_subset_boundary_for_any_candidate_text_package_or_display_behavior',
  'missing_exact_row_subset_candidate_use_package',
  'agent2_morphology_relation_matrix_is_nonpublic_planning_only_not_candidate_use',
]) {
  expect(matrix.exact_blockers_preserved?.includes(blocker), `missing preserved blocker: ${blocker}`);
}

for (const boundary of [
  'No Definition authority',
  'No answer acceptance',
  'No source/license/legal acceptance',
  'No accepted gloss/text',
  'No public/runtime mutation',
  'No candidate text export',
  'No NC commercial authorization',
  'No release action',
]) {
  expect(matrix.non_acceptance_boundary?.includes(boundary), `missing non-acceptance boundary: ${boundary}`);
}

if (issues.length) {
  console.error(`Agent 2 old-dictionary commercial-clean morphology relation matrix validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 old-dictionary commercial-clean morphology relation matrix validation passed. Rows: 297; planning-approved: 78; transform rows: 0.');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}
