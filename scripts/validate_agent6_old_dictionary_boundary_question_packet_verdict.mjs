#!/usr/bin/env node
import fs from 'node:fs';

const verdictPath = process.argv[2] || 'reports/agent6-old-dictionary-boundary-question-packet-verdict-2026-06-05.json';

function fail(message) {
  console.error(`Validation failed: ${message}`);
  process.exit(1);
}

function readJson(path) {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (error) {
    fail(`could not read JSON ${path}: ${error.message}`);
  }
}

function expect(condition, message) {
  if (!condition) fail(message);
}

const verdict = readJson(verdictPath);

expect(
  verdict.disposition === 'warn_accepted_nonpublic_boundary_question_planning_evidence_only',
  'disposition must remain WARN accepted for nonpublic boundary-question planning evidence only',
);
expect(verdict.scope === 'old_dictionary_six_boundary_questions_planning_docket_only', 'scope mismatch');

const boundary = verdict.accepted_boundary || {};
for (const [key, expected] of [
  ['boundary_question_rows', 6],
  ['commercial_clean_candidate_questions', 3],
  ['noncommercial_educational_candidate_questions', 1],
  ['metadata_or_link_only_question_records', 1],
  ['blocked_or_needs_review_questions', 1],
  ['source_family_rows', 5],
  ['delivered_to_agent6_now_in_source_artifact', 0],
  ['future_candidate_use_questions_opened_now_in_source_artifact', 0],
]) {
  expect(boundary[key] === expected, `accepted_boundary.${key} must be ${expected}`);
}
expect(
  boundary.permitted_next_step === 'Agent_10_and_Agent_2_may_carry_six_questions_as_nonpublic_planning_docket_only',
  'permitted next step mismatch',
);

const validation = verdict.validation_evidence || {};
expect(validation.agent1_validation_ok === true, 'Agent 1 validation must be ok');
expect(validation.boundary_question_rows === 6, 'validation boundary question rows must be 6');
expect(validation.delivered_to_agent6_now === false, 'source artifact must not be marked delivered');
for (const [key, expected] of [
  ['allowed_transform_rows_now', 0],
  ['candidate_text_rows_now', 0],
  ['answer_eligible_rows_now', 0],
  ['public_emit_rows_now', 0],
  ['release_route_opened_now', 0],
]) {
  expect(validation[key] === expected, `validation_evidence.${key} must be ${expected}`);
}
expect(validation.no_acceptance_claims === true, 'validation evidence must preserve no_acceptance_claims');

const recount = verdict.independent_recount || {};
expect(recount.question_records === 6, 'question record count must be 6');
expect(recount.agent1_packet_nonzero_zero_counters === 0, 'Agent1 zero counters must remain zero');
expect(recount.agent2_receipt_nonzero_zero_counters === 0, 'Agent2 zero counters must remain zero');
expect(recount.row_totals_are_source_family_nonexclusive === true, 'row totals must be nonexclusive');
const lanes = recount.lane_counts || {};
expect(lanes.commercial_clean_candidate === 3, 'commercial question count must be 3');
expect(lanes.noncommercial_educational_candidate === 1, 'NC question count must be 1');
expect(lanes.metadata_or_link_only === 1, 'metadata question count must be 1');
expect(lanes.blocked_or_needs_review === 1, 'blocked/review question count must be 1');

const expectedQuestions = new Map([
  ['old-dictionary-excluded-row-license-lane-reaudit::jastrow-dictionary', ['commercial_clean_candidate', 210, 4474]],
  ['old-dictionary-excluded-row-license-lane-reaudit::bdb-dictionary', ['commercial_clean_candidate', 221, 4418]],
  ['old-dictionary-excluded-row-license-lane-reaudit::bdb-aramaic-dictionary', ['commercial_clean_candidate', 69, 2048]],
  ['old-dictionary-excluded-row-license-lane-reaudit::klein-dictionary', ['noncommercial_educational_candidate', 214, 4444]],
  ['old-dictionary-excluded-row-license-lane-reaudit::metadata-or-link-only', ['metadata_or_link_only', 0, 0]],
  ['old-dictionary-excluded-row-license-lane-reaudit::bdb-augmented-strong', ['blocked_or_needs_review', 222, 4435]],
]);
for (const row of verdict.question_summaries || []) {
  const expected = expectedQuestions.get(row.row_subset);
  expect(Boolean(expected), `unexpected question row_subset: ${row.row_subset}`);
  if (!expected) continue;
  expect(row.lane === expected[0], `${row.row_subset} lane mismatch`);
  expect(row.rows === expected[1], `${row.row_subset} rows mismatch`);
  expect(row.occurrences === expected[2], `${row.row_subset} occurrences mismatch`);
  expect(typeof row.blocker === 'string' && row.blocker.length > 0, `${row.row_subset} blocker missing`);
}
expect((verdict.question_summaries || []).length === expectedQuestions.size, 'question summary count mismatch');

for (const warning of [
  'questions_are_not_cleared_boundaries',
  'source_family_row_totals_are_nonexclusive_and_must_not_be_summed_into_exact_mutation_set',
  'commercial_clean_questions_still_require_exact_agent6_row_subset_boundaries_and_approved_morphology_relation',
  'klein_question_remains_noncommercial_educational_candidate_no_nc_commercial_authorization',
  'bdb_augmented_strong_question_remains_blocked_or_needs_review',
  'metadata_link_only_record_is_zero_rows',
]) {
  expect((verdict.warnings || []).includes(warning), `missing warning: ${warning}`);
}

const gates = verdict.affected_gates || {};
expect(gates.boundary_question_planning_gate === 'warn_accepted_exact_six_question_docket_only', 'boundary question gate mismatch');
for (const [gate, expected] of [
  ['source_family_selection_gate', 'blocked'],
  ['source_provenance_license_legal_gate', 'not_accepted'],
  ['candidate_use_gate', 'blocked'],
  ['transform_gate', 'blocked'],
  ['definition_lemma_reader_hint_content_gate', 'blocked'],
  ['definition_authority_gate', 'blocked'],
  ['answer_eligibility_gate', 'blocked'],
  ['public_runtime_gate', 'not_accepted'],
  ['publication_release_gate', 'not_accepted'],
  ['commercial_export_gate', 'blocked'],
  ['nc_commercial_authorization_gate', 'blocked'],
]) {
  expect(gates[gate] === expected, `${gate} must be ${expected}`);
}

for (const forbidden of [
  'qa_acceptance_beyond_this_docket',
  'source_provenance_acceptance',
  'license_legal_acceptance',
  'source_family_selection_acceptance',
  'definition_authority',
  'usage_as_definition_authority',
  'answer_acceptance',
  'answer_eligibility',
  'public_runtime_acceptance',
  'publication_readiness',
  'route_publication_support',
  'product_data_acceptance',
  'accepted_gloss_text',
  'public_reader_output',
  'route_shard_edit',
  'public_runtime_mutation',
  'candidate_text_export',
  'definition_content_storage',
  'commercial_export_permission',
  'nc_commercial_authorization',
  'release_action',
]) {
  expect((verdict.must_not_be_accepted || []).includes(forbidden), `missing must_not_be_accepted: ${forbidden}`);
}

expect(
  verdict.stop_condition ===
    'dated_agent6_verdict_exists_for_carrying_exact_six_old_dictionary_boundary_questions_as_nonpublic_planning_evidence_only_no_substantive_boundary_answer_or_mutation_performed',
  'stop condition mismatch',
);

console.log('Agent6 old-dictionary boundary-question packet verdict validation passed. Questions: 6; candidate-use rows: 0.');
