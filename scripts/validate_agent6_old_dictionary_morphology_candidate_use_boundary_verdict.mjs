#!/usr/bin/env node
import fs from 'node:fs';

const verdictPath =
  process.argv[2] || 'reports/agent6-old-dictionary-morphology-candidate-use-boundary-verdict-2026-06-05.json';

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
  verdict.disposition === 'warn_accepted_nonpublic_candidate_use_planning_input_only',
  'disposition must remain WARN accepted for nonpublic candidate-use planning input only'
);
expect(
  verdict.scope === 'exact_78_old_dictionary_commercial_clean_morphology_planning_rows_candidate_use_planning_input_only',
  'unexpected verdict scope'
);

const boundary = verdict.accepted_boundary || {};
expect(boundary.rows === 78, 'accepted boundary rows must be 78');
expect(boundary.occurrences === 1461, 'accepted boundary occurrences must be 1461');
expect(
  boundary.row_source_path === 'reports/agent2-agent10-candidate-use-preflight-handoff-2026-06-05.json',
  'row source path mismatch'
);
expect(boundary.row_source_pointer === 'exact_subset_for_future_question.queue_ids', 'row source pointer mismatch');
expect(boundary.preview_relation_class === 'exact_after_mark_strip', 'preview relation class mismatch');
expect(
  boundary.agent2_morphology_relation_status === 'agent2_morphology_relation_approved_for_nonpublic_planning',
  'Agent 2 morphology relation status mismatch'
);
expect(boundary.license_lane === 'commercial_clean_candidate', 'license lane mismatch');
expect(boundary.noncommercial_educational_candidate_rows === 0, 'NC candidate rows must remain 0');
expect(
  boundary.permitted_next_step === 'Agent_2_may_author_later_nonpublic_candidate_use_package_over_exact_78_queue_ids_only',
  'permitted next step mismatch'
);

const validators = verdict.validators_run || [];
expect(Array.isArray(validators) && validators.length === 1, 'expected one validator row');
expect(
  validators[0]?.command ===
    'node scripts/validate_agent10_old_dictionary_morphology_candidate_use_boundary_packet.mjs reports/agent10-agent6-ready-old-dictionary-morphology-candidate-use-boundary-packet-2026-06-05.json',
  'validator command mismatch'
);
expect(validators[0]?.result === 'passed', 'validator result must be passed');
expect(validators[0]?.rows === 78, 'validator rows must be 78');
expect(validators[0]?.occurrences === 1461, 'validator occurrences must be 1461');

const recount = verdict.independent_recount || {};
expect(recount.handoff_queue_ids === 78, 'handoff queue IDs must be 78');
expect(recount.unique_handoff_queue_ids === 78, 'unique handoff queue IDs must be 78');
expect(recount.selected_rows_by_prior_selector === 78, 'selected rows by prior selector must be 78');
expect(recount.selected_occurrences_by_prior_selector === 1461, 'selected occurrences by prior selector must be 1461');
expect(recount.handoff_rows_found_in_matrix === 78, 'handoff rows found in matrix must be 78');
expect(recount.handoff_occurrences === 1461, 'handoff occurrences must be 1461');
expect(recount.missing_selected_ids_from_handoff === 0, 'missing selected IDs must be 0');
expect(recount.extra_handoff_ids_outside_selected_subset === 0, 'extra handoff IDs must be 0');
expect(recount.forbidden_row_flags_observed === 0, 'forbidden row flags must be 0');
expect(recount.nonzero_packet_zero_counters === 0, 'packet zero counters must remain zero');
expect(recount.blocked_rows_outside_subset === 219, 'blocked rows outside subset must be 219');

for (const field of [
  'queue_id',
  'token_id',
  'lexicon_entry_id',
  'occurrences',
  'source_family',
  'license_lane',
  'source_rids',
  'morphology_relation_basis',
  'agent2_morphology_relation_status',
  'candidate_use_scope',
  'derived_from_nc',
  'commercial_export_allowed',
  'attribution_required',
  'corpus_contamination',
  'answer_eligible',
  'public_emit',
  'agent6_boundary_required',
]) {
  expect((verdict.required_fields_for_later_agent2_package || []).includes(field), `missing required later package field: ${field}`);
}

const zeroCounters = verdict.zero_counters_preserved || {};
for (const [key, expected] of [
  ['candidate_text_export', 0],
  ['definition_lemma_reader_hint_content_storage', 0],
  ['answer_eligibility', 0],
  ['public_runtime_mutation', 0],
  ['route_writes', 0],
  ['accepted_text', 0],
  ['release_actions', 0],
]) {
  expect(zeroCounters[key] === expected, `zero counter ${key} must be ${expected}`);
}

for (const warning of [
  'candidate_use_planning_input_only_no_candidate_text_use_or_transform_execution',
  'commercial_clean_candidate_lane_metadata_only_no_source_license_legal_or_export_acceptance',
  '219_morphology_blocked_rows_remain_excluded',
  'actual_candidate_use_package_requires_new_agent6_verdict_before_text_storage_transform_output_export_answer_or_runtime_mutation',
]) {
  expect((verdict.warnings || []).includes(warning), `missing warning: ${warning}`);
}

for (const blocker of [
  'candidate_text_export_blocked',
  'definition_lemma_reader_hint_content_storage_blocked',
  'answer_eligibility_blocked',
  'public_runtime_mutation_blocked',
  'route_writes_blocked',
  'accepted_text_blocked',
  'release_action_blocked',
  '219_morphology_blocked_rows_excluded',
]) {
  expect((verdict.blockers_preserved || []).includes(blocker), `missing blocker: ${blocker}`);
}

const gates = verdict.affected_gates || {};
expect(
  gates.old_dictionary_morphology_candidate_use_planning_gate === 'warn_accepted_exact_78_row_planning_input_only',
  'candidate-use planning gate mismatch'
);
for (const [gate, expected] of [
  ['candidate_text_export_gate', 'blocked'],
  ['definition_content_storage_gate', 'blocked'],
  ['answer_eligibility_gate', 'blocked'],
  ['public_runtime_gate', 'not_accepted'],
  ['route_write_gate', 'blocked'],
  ['publication_release_gate', 'not_accepted'],
  ['source_provenance_license_legal_gate', 'not_accepted'],
]) {
  expect(gates[gate] === expected, `${gate} must be ${expected}`);
}

for (const forbidden of [
  'qa_acceptance_beyond_this_docket',
  'source_provenance_acceptance',
  'license_legal_acceptance',
  'definition_authority',
  'usage_as_definition_authority',
  'answer_acceptance',
  'answer_eligibility',
  'public_runtime_acceptance',
  'publication_readiness',
  'route_publication_support',
  'product_data_acceptance',
  'translation_output',
  'accepted_gloss_text',
  'public_reader_output',
  'route_shard_edit',
  'public_runtime_mutation',
  'candidate_text_export',
  'definition_content_storage',
  'commercial_export_authorization',
  'nc_commercial_authorization',
  'release_action',
]) {
  expect((verdict.must_not_be_accepted || []).includes(forbidden), `missing must_not_be_accepted: ${forbidden}`);
}

expect(
  verdict.stop_condition ===
    'dated_agent6_verdict_exists_for_exact_78_row_1461_occurrence_nonpublic_candidate_use_planning_input_boundary_only_no_mutation_or_release_performed',
  'unexpected stop condition'
);

console.log(
  `Agent6 old-dictionary morphology candidate-use boundary verdict validation passed. ` +
    `Rows: ${boundary.rows}; occurrences: ${boundary.occurrences}; gate: ${gates.old_dictionary_morphology_candidate_use_planning_gate}.`
);
