#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const blockerPath = process.argv[2] || 'reports/agent2-morphology-planning-candidate-use-blocker-2026-06-05.json';
const blocker = readJson(blockerPath);
const issues = [];

expect(blocker.artifact_type === 'agent2_morphology_planning_candidate_use_blocker', 'artifact_type mismatch');
expect(blocker.status === 'nonpublic_morphology_planning_rows_grouped_candidate_use_blocked', 'status mismatch');
expect(blocker.inputs?.morphology_matrix === 'reports/agent2-old-dictionary-commercial-clean-morphology-relation-matrix-2026-06-05.json', 'morphology matrix input mismatch');
expect(blocker.inputs?.agent1_agent6_boundary_question_validation === 'reports/agent1-old-dictionary-agent6-boundary-question-packet-validation-result-2026-06-05.json', 'boundary validation input mismatch');

expect(blocker.counts?.matrix_rows === 297, 'matrix rows must be 297');
expect(blocker.counts?.morphology_planning_rows === 78, 'morphology planning rows must be 78');
expect(blocker.counts?.morphology_blocked_rows === 219, 'morphology blocked rows must be 219');
expect(blocker.counts?.allowed_candidate_use_rows_now === 0, 'allowed candidate-use rows must be 0');
expect(blocker.counts?.allowed_transform_rows_now === 0, 'allowed transform rows must be 0');

expect(blocker.boundary_validation_state?.delivered_to_agent6_now === false, 'Agent 6 boundary must not be delivered now');
expect(blocker.boundary_validation_state?.allowed_transform_rows_now === 0, 'boundary validation transform rows must be 0');
expect(blocker.boundary_validation_state?.candidate_text_rows_now === 0, 'boundary validation candidate text rows must be 0');
expect(blocker.boundary_validation_state?.no_acceptance_claims === true, 'boundary validation no_acceptance_claims must be true');

expect(blocker.exact_blocker === 'morphology_planning_rows_have_no_delivered_agent6_candidate_use_boundary', 'exact blocker mismatch');
for (const required of [
  'exact_agent6_row_subset_boundary_for_candidate_use',
  'agent10_exact_agent6_packet_for_the_specific_planning_rows',
  'definition_lane_must_still_emit_no_public_or_answer_acceptance',
]) {
  expect(blocker.required_before_candidate_use?.includes(required), `missing required-before-candidate-use: ${required}`);
}

for (const family of ['Jastrow Dictionary', 'BDB Dictionary', 'BDB Aramaic Dictionary']) {
  expect(blocker.source_family_groups?.[family]?.license_lane === 'commercial_clean_candidate', `${family} source family group missing`);
  expect(blocker.source_family_groups?.[family]?.planning_rows_with_family > 0, `${family} must have planning rows`);
}

expect(Array.isArray(blocker.representative_planning_rows) && blocker.representative_planning_rows.length === 20, 'representative rows must contain first 20 planning rows');
for (const row of blocker.representative_planning_rows || []) {
  expect(row.agent2_morphology_relation_status === 'agent2_morphology_relation_approved_for_nonpublic_planning', `${row.queue_id} status mismatch`);
  expect(row.exact_blocker === 'missing_exact_agent6_row_subset_candidate_use_package_for_downstream_use', `${row.queue_id} downstream blocker mismatch`);
  for (const key of [
    'candidate_text_rows_now',
    'definition_candidate_rows_now',
    'lemma_candidate_rows_now',
    'reader_hint_candidate_rows_now',
    'answer_eligible_rows_now',
    'public_emit_rows_now',
  ]) {
    expect(row[key] === 0, `${row.queue_id}.${key} must be 0`);
  }
}

for (const [key, value] of Object.entries(blocker.zero_output_counts || {})) {
  expect(value === 0, `zero_output_counts.${key} must be 0`);
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
  expect(blocker.non_acceptance_boundary?.includes(boundary), `missing non-acceptance boundary: ${boundary}`);
}

if (issues.length) {
  console.error(`Agent 2 morphology planning candidate-use blocker validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 morphology planning candidate-use blocker validation passed. Planning rows: 78; candidate-use rows: 0.');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}
