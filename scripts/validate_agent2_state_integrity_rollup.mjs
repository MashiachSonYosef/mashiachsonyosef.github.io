#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const rollupPath = process.argv[2] || 'reports/agent2-state-integrity-rollup-2026-06-05.json';
const rollup = readJson(rollupPath);
const issues = [];

expect(rollup.artifact_type === 'agent2_state_integrity_rollup', 'artifact_type mismatch');
expect(rollup.status === 'state_chain_validated_zero_output_boundaries_preserved', 'status mismatch');
expect(rollup.inputs?.state === 'reports/agent2-state.md', 'state input mismatch');
expect(Array.isArray(rollup.inputs?.artifacts) && rollup.inputs.artifacts.length === 19, 'must audit 19 artifacts');

expect(rollup.counts?.artifacts_checked === 19, 'artifacts_checked must be 19');
expect(rollup.counts?.source_family_rows === 5, 'source family rows must be 5');
expect(rollup.counts?.commercial_clean_source_families === 3, 'commercial-clean source families must be 3');
expect(rollup.counts?.noncommercial_educational_source_families === 1, 'NC source families must be 1');
expect(rollup.counts?.blocked_or_review_source_families === 1, 'blocked/review source families must be 1');
expect(rollup.counts?.morphology_matrix_rows === 297, 'morphology matrix rows must be 297');
expect(rollup.counts?.morphology_planning_rows === 78, 'morphology planning rows must be 78');
expect(rollup.counts?.morphology_candidate_use_package_rows === 78, 'morphology candidate-use package rows must be 78');
expect(rollup.counts?.morphology_candidate_use_package_occurrences === 1461, 'morphology candidate-use package occurrences must be 1461');
expect(rollup.counts?.morphology_candidate_use_package_text_rows_now === 0, 'morphology candidate-use package text rows must be 0');
expect(rollup.counts?.agent10_morphology_candidate_use_handoff_consumed_rows === 78, 'Agent10 morphology candidate-use handoff rows must be 78');
expect(rollup.counts?.agent10_morphology_candidate_use_handoff_consumed_occurrences === 1461, 'Agent10 morphology candidate-use handoff occurrences must be 1461');
expect(rollup.counts?.agent10_morphology_candidate_use_handoff_text_rows_now === 0, 'Agent10 morphology candidate-use handoff text rows must be 0');
expect(rollup.counts?.agent10_morphology_candidate_use_package_consumption_rows === 78, 'Agent10 morphology candidate-use package consumption rows must be 78');
expect(rollup.counts?.agent10_morphology_candidate_use_package_consumption_occurrences === 1461, 'Agent10 morphology candidate-use package consumption occurrences must be 1461');
expect(rollup.counts?.agent10_morphology_candidate_use_package_wait_remains === 0, 'Agent10 morphology candidate-use package wait must be closed');
expect(rollup.counts?.agent10_morphology_candidate_use_package_consumption_text_rows_now === 0, 'Agent10 morphology candidate-use package consumption text rows must be 0');
expect(rollup.counts?.exact_row_subset_manifest_rows === 500, 'exact row-subset manifest rows must be 500');
expect(rollup.counts?.exact_row_subset_manifest_subsets === 8, 'exact row-subset manifest subsets must be 8');
expect(rollup.counts?.exact_row_subset_manifest_agent6_verdict_present_now === 0, 'exact row-subset Agent6 verdict must be absent');
expect(rollup.counts?.exact_row_subset_manifest_transform_text_output_rows_now === 0, 'exact row-subset transform/text/output rows must be 0');
expect(rollup.counts?.source_family_membership_unique_rows === 500, 'source-family membership unique rows must be 500');
expect(rollup.counts?.source_family_membership_nonexclusive_rows === 936, 'source-family membership nonexclusive rows must be 936');
expect(rollup.counts?.source_family_overlap_pairwise_intersections === 10, 'source-family overlap pairwise intersections must be 10');
expect(rollup.counts?.source_family_overlap_transform_text_output_rows_now === 0, 'source-family overlap transform/text/output rows must be 0');
expect(rollup.counts?.downstream_alignment_source_family_rows === 5, 'downstream alignment source-family rows must be 5');
expect(rollup.counts?.downstream_alignment_exact_blockers === 5, 'downstream alignment exact blockers must be 5');
expect(rollup.counts?.downstream_alignment_transform_text_output_rows_now === 0, 'downstream alignment transform/text/output rows must be 0');
expect(rollup.counts?.row_overlap_audited_rows === 500, 'row-overlap audited rows must be 500');
expect(rollup.counts?.row_overlap_boundary_questions === 8, 'row-overlap boundary questions must be 8');
expect(rollup.counts?.row_overlap_agent6_delivery_now === 0, 'row-overlap Agent6 delivery must be 0');
expect(rollup.counts?.row_overlap_transform_text_output_rows_now === 0, 'row-overlap transform/text/output rows must be 0');
expect(rollup.counts?.agent1_boundary_question_rows === 6, 'Agent1 boundary-question rows must be 6');
expect(rollup.counts?.agent1_boundary_question_agent6_delivery_now === 0, 'Agent1 boundary-question Agent6 delivery must be 0');
expect(rollup.counts?.agent1_boundary_question_transform_text_output_rows_now === 0, 'Agent1 boundary-question transform/text/output rows must be 0');
expect(rollup.counts?.klein_nc_lane_preservation_rows === 214, 'Klein NC lane preservation rows must be 214');
expect(rollup.counts?.klein_nc_lane_preservation_occurrences === 4444, 'Klein NC lane preservation occurrences must be 4444');
expect(rollup.counts?.klein_nc_commercial_export_allowed_now === 0, 'Klein NC commercial export must be 0');
expect(rollup.counts?.klein_nc_transform_text_output_rows_now === 0, 'Klein NC transform/text/output rows must be 0');
expect(rollup.counts?.orot_205_rows === 205, 'Orot 205 rows must be 205');
expect(rollup.counts?.token_source_aggregate_edge_rows === 1951013, 'aggregate edge rows must be 1951013');
expect(rollup.counts?.allowed_transform_rows_now === 0, 'allowed transform rows must be 0');
expect(rollup.counts?.allowed_candidate_use_rows_now === 0, 'allowed candidate-use rows must be 0');

expect(rollup.lane_preservation?.commercial_clean_and_nc_separated === true, 'commercial-clean and NC separation missing');
expect(rollup.lane_preservation?.nc_derived_from_nc === true, 'NC derived_from_nc must be true');
expect(rollup.lane_preservation?.nc_commercial_export_allowed === false, 'NC commercial export must be false');
expect(rollup.lane_preservation?.nc_attribution_required === true, 'NC attribution must be required');

expect(Array.isArray(rollup.artifact_zero_output_audit) && rollup.artifact_zero_output_audit.length === 19, 'zero-output audit must cover 19 artifacts');
for (const entry of rollup.artifact_zero_output_audit || []) {
  expect(entry.zero_output_ok === true, `${entry.path} zero_output_ok must be true`);
}
for (const blocker of rollup.unique_blockers || []) {
  expect(!blocker.startsWith('node '), `validator command must not be counted as blocker: ${blocker}`);
}

for (const blocker of [
  'old-dictionary-excluded-row-license-lane-reaudit::klein-dictionary::missing_exact_agent6_nc_boundary_no_commercial_export_authorization',
  'old-dictionary-excluded-row-license-lane-reaudit::bdb-augmented-strong::missing_independent_source_license_custody_basis',
  'agent10_agent6_exact_candidate_use_packet_missing_for_78_morphology_planning_rows',
  'no_candidate_rows_or_candidate_use_packet_from_aggregate',
  'planning_only_boundary_remains',
  'candidate_text_export_blocked',
  'definition_lemma_reader_hint_content_storage_blocked',
  'actual_text_storage_transform_output_export_answer_or_runtime_mutation_requires_new_agent6_verdict',
  'new_agent6_verdict_required_before_text_storage_transform_output_export_answer_route_runtime_accepted_text_commercial_export_or_release',
  'candidate_text_rows_0_actual_text_storage_transform_output_export_answer_or_runtime_mutation_requires_new_agent6_verdict',
  'missing_agent6_old_dictionary_exact_row_subset_manifest_boundary_verdict_before_agent2_transform_candidate_text_definition_lemma_reader_hint_answer_public_runtime_route_export_or_release_use',
  'source_family_membership_counts_are_nonexclusive_no_exclusive_export_row_counts_authorized',
  'source_family_overlap_matrix_requires_exact_agent6_source_family_selection_boundary_before_agent2_transform_candidate_text_definition_lemma_reader_hint_answer_public_runtime_route_export_or_release_use',
  'commercial_with_nc_overlap_rows_preserve_nc_separation_no_commercial_clean_contamination',
  'commercial_with_blocked_overlap_rows_preserve_blocked_review_separation_no_transform_use',
  'row_overlap_boundary_questions_not_delivered_to_agent6_no_agent2_transform_or_candidate_use',
  'agent1_boundary_question_packet_not_delivered_to_agent6_no_agent2_transform_or_candidate_use',
  'klein_old_dictionary_nc_scope_214_rows_distinct_from_prior_17_row_nc_map',
  'klein_dictionary_remains_noncommercial_educational_candidate_no_commercial_export_authorization',
]) {
  expect(rollup.unique_blockers?.includes(blocker), `missing unique blocker: ${blocker}`);
}

for (const [key, value] of Object.entries(rollup.zero_output_counts || {})) {
  expect(value === 0, `zero_output_counts.${key} must be 0`);
}

for (const boundary of [
  'No Definition authority',
  'No answer acceptance',
  'No source/license/legal acceptance',
  'No accepted gloss/text',
  'No public/runtime mutation',
  'No candidate-use authorization',
  'No candidate text export',
  'No NC commercial authorization',
  'No release action',
]) {
  expect(rollup.non_acceptance_boundary?.includes(boundary), `missing boundary: ${boundary}`);
}

expect(rollup.highest_permissible_claim?.includes('nonpublic planning/prereq evidence'), 'highest permissible claim mismatch');
expect(rollup.stop_condition?.includes('Do not emit transform candidates'), 'stop condition must block transform output');

if (issues.length) {
  console.error(`Agent 2 state integrity rollup validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 2 state integrity rollup validation passed. Artifacts: ${rollup.counts.artifacts_checked}; unique blockers: ${rollup.counts.unique_blockers}; transform rows: 0.`);

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}
