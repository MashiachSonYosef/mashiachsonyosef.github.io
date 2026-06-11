#!/usr/bin/env node
import fs from 'node:fs';

const verdictPath =
  process.argv[2] || 'reports/agent6-old-dictionary-morphology-planning-boundary-verdict-2026-06-05.json';

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
  verdict.disposition === 'warn_accepted_nonpublic_morphology_planning_evidence_only',
  'disposition must remain WARN accepted for nonpublic morphology planning only'
);
expect(verdict.scope === 'nonpublic_old_dictionary_morphology_relation_planning_only', 'unexpected scope');

const boundary = verdict.accepted_boundary || {};
expect(boundary.rows === 78, 'accepted boundary rows must be 78');
expect(boundary.occurrences === 1461, 'accepted boundary occurrences must be 1461');
expect(boundary.source_license_lane === 'commercial_clean_candidate_planning_lane_only', 'unexpected source/license lane');
expect(boundary.noncommercial_educational_candidate_rows === 0, 'NC rows must remain 0 in accepted boundary');

const selector = boundary.selector || {};
expect(selector.preview_relation_class === 'exact_after_mark_strip', 'selector preview_relation_class mismatch');
expect(
  selector.agent2_morphology_relation_status === 'agent2_morphology_relation_approved_for_nonpublic_planning',
  'selector morphology status mismatch'
);

const validators = verdict.validators_run || [];
expect(Array.isArray(validators) && validators.length === 4, 'expected four validators_run rows');
for (const row of validators) {
  expect(row.command && row.command.startsWith('node scripts/'), 'validator row must include node script command');
  expect(row.result === 'passed', `validator did not pass: ${row.command}`);
}

const recount = verdict.independent_recount || {};
expect(recount.matrix_rows === 297, 'independent matrix rows must be 297');
expect(recount.selected_planning_rows === 78, 'independent selected planning rows must be 78');
expect(recount.selected_planning_occurrences === 1461, 'independent selected planning occurrences must be 1461');
expect(recount.blocked_rows_preserved_outside_subset === 219, 'blocked rows outside subset must be 219');
expect(recount.forbidden_flag_rows_observed === 0, 'forbidden flag rows must be 0');

const relationClass = recount.relation_class_counts || {};
expect(relationClass.exact_after_mark_strip === 78, 'exact_after_mark_strip rows must be 78');
expect(relationClass.prefix_or_clitic_possible === 129, 'prefix_or_clitic_possible rows must be 129');
expect(relationClass.needs_morphology_disambiguation === 90, 'needs_morphology_disambiguation rows must be 90');

const gates = verdict.affected_gates || {};
expect(gates.old_dictionary_morphology_planning_gate === 'warn_accepted_exact_subset_only', 'planning gate mismatch');
for (const [gate, expected] of [
  ['candidate_use_gate', 'blocked'],
  ['transform_gate', 'blocked'],
  ['definition_authority_gate', 'blocked'],
  ['public_runtime_gate', 'not_accepted'],
  ['publication_release_gate', 'not_accepted'],
  ['source_provenance_license_legal_gate', 'not_accepted'],
]) {
  expect(gates[gate] === expected, `${gate} must be ${expected}`);
}

for (const blocker of [
  'missing_exact_agent6_row_subset_boundary_for_candidate_use',
  'missing_agent10_exact_agent6_candidate_use_packet_for_the_specific_planning_rows',
  'definition_lane_must_still_emit_no_public_or_answer_acceptance',
  'prefix_or_clitic_possible_requires_morphology_disambiguation',
  'needs_morphology_disambiguation',
]) {
  expect((verdict.blockers_preserved || []).includes(blocker), `missing blocker: ${blocker}`);
}

for (const forbidden of [
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
  'definition_content_storage',
  'candidate_text_export',
  'commercial_export_permission',
  'nc_commercial_authorization',
  'release_action',
]) {
  expect((verdict.must_not_be_accepted || []).includes(forbidden), `missing must_not_be_accepted: ${forbidden}`);
}

expect(
  verdict.stop_condition ===
    'dated_agent6_verdict_exists_for_exact_old_dictionary_commercial_clean_morphology_planning_subset_only_no_mutation_or_release_performed',
  'unexpected stop_condition'
);

console.log(
  `Agent6 old-dictionary morphology planning boundary verdict validation passed. ` +
    `Rows: ${boundary.rows}; occurrences: ${boundary.occurrences}; candidate gate: ${gates.candidate_use_gate}.`
);
