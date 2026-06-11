#!/usr/bin/env node
import fs from 'node:fs';

const verdictPath =
  process.argv[2] || 'reports/agent6-old-dictionary-commercial-clean-only-metadata-custody-boundary-verdict-2026-06-05.json';

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
  verdict.disposition === 'warn_accepted_nonpublic_package_assembly_planning_evidence_only',
  'disposition must remain WARN accepted for nonpublic package assembly planning evidence only',
);
expect(verdict.scope === 'old_dictionary_commercial_clean_only_metadata_custody_planning_boundary_only', 'scope mismatch');

const boundary = verdict.accepted_boundary || {};
expect(boundary.rows === 18, 'accepted rows must be 18');
expect(boundary.occurrences === 494, 'accepted occurrences must be 494');
expect(boundary.source_family === 'Jastrow Dictionary', 'source family mismatch');
expect(boundary.exact_row_payload === 'commercial_clean_only_metadata_rows[]', 'exact row payload mismatch');
expect(
  boundary.source_artifact === 'reports/agent1-old-dictionary-commercial-clean-only-metadata-custody-2026-06-05.json',
  'source artifact mismatch',
);
expect(boundary.license_lane === 'commercial_clean_candidate', 'license lane mismatch');
expect(boundary.noncommercial_educational_candidate_overlap_rows === 0, 'NC overlap rows must be 0');
expect(boundary.blocked_or_needs_review_overlap_rows === 0, 'blocked/review overlap rows must be 0');
expect(
  boundary.permitted_next_step === 'Agent_10_may_carry_artifact_as_nonpublic_package_assembly_planning_evidence_only',
  'permitted next step mismatch',
);

const validators = verdict.validators_run || [];
expect(validators.length === 1, 'expected one validators_run row');
expect(
  validators[0]?.command ===
    'node scripts/validate_agent10_old_dictionary_commercial_clean_only_metadata_custody_boundary_packet.mjs reports/agent10-agent6-ready-old-dictionary-commercial-clean-only-metadata-custody-boundary-packet-2026-06-05.json',
  'validator command mismatch',
);
expect(validators[0]?.result === 'passed', 'validator result must be passed');
expect(validators[0]?.rows === 18, 'validator rows must be 18');
expect(validators[0]?.occurrences === 494, 'validator occurrences must be 494');

const recount = verdict.independent_recount || {};
for (const [key, expected] of [
  ['commercial_clean_only_rows', 18],
  ['commercial_clean_only_occurrences', 494],
  ['unique_token_ids', 18],
  ['duplicate_token_ids', 0],
  ['unique_queue_ids', 18],
  ['jastrow_only_rows', 18],
  ['rows_with_nc_overlap', 0],
  ['rows_with_blocked_overlap', 0],
  ['rows_with_refs', 17],
  ['occurrences_with_refs', 476],
  ['rows_without_refs', 1],
  ['occurrences_without_refs', 18],
  ['rid_total', 22],
  ['headword_total', 22],
  ['nonzero_zero_counters', 0],
  ['exact_text_payload_fields_observed', 0],
]) {
  expect(recount[key] === expected, `independent_recount.${key} must be ${expected}`);
}
expect(Array.isArray(recount.source_families) && recount.source_families.length === 1, 'expected one source family');
expect(recount.source_families[0] === 'Jastrow Dictionary', 'source family recount mismatch');
expect(recount.token_hash_ok === true, 'token hash must be ok');
expect(recount.ref_gap_token_hash_ok === true, 'ref gap token hash must be ok');

const laneSplit = recount.lane_split || {};
expect(laneSplit.commercial_clean_candidate?.rows === 18, 'commercial lane rows must be 18');
expect(laneSplit.commercial_clean_candidate?.occurrences === 494, 'commercial lane occurrences must be 494');
expect(laneSplit.noncommercial_educational_candidate?.rows === 0, 'NC lane rows must be 0');
expect(laneSplit.metadata_or_link_only?.rows === 0, 'metadata lane rows must be 0');
expect(laneSplit.blocked_or_needs_review?.rows === 0, 'blocked lane rows must be 0');

const blockers = new Map([
  ['commercial_clean_only_rows_still_need_agent6_candidate_use_boundary_and_morphology_relation', [18, 494]],
  ['commercial_clean_only_metadata_is_not_definition_or_candidate_text', [18, 494]],
  ['commercial_clean_only_ref_gap_row_needs_ref_boundary_if_refs_required', [1, 18]],
]);
for (const row of verdict.exact_blockers_preserved || []) {
  const expected = blockers.get(row.blocker);
  expect(Boolean(expected), `unexpected blocker: ${row.blocker}`);
  if (!expected) continue;
  expect(row.rows === expected[0], `${row.blocker} rows mismatch`);
  expect(row.occurrences === expected[1], `${row.blocker} occurrences mismatch`);
}
expect((verdict.exact_blockers_preserved || []).length === blockers.size, 'blocker count mismatch');

for (const warning of [
  'cleaner_than_mixed_lane_overlap_but_still_no_source_family_selection_candidate_use_transform_text_storage_answer_public_runtime_export_or_release',
  'commercial_clean_candidate_lane_is_planning_metadata_only_no_source_license_legal_or_export_acceptance',
  'one_ref_gap_row_requires_later_ref_boundary_if_refs_are_required',
  'candidate_use_requires_later_exact_agent6_packet_with_row_ids_morphology_relation_source_citation_fields_output_counters_and_non_acceptance_boundary',
]) {
  expect((verdict.warnings || []).includes(warning), `missing warning: ${warning}`);
}

const gates = verdict.affected_gates || {};
expect(
  gates.commercial_clean_only_metadata_custody_planning_gate === 'warn_accepted_exact_artifact_only',
  'commercial-clean-only planning gate mismatch',
);
for (const [gate, expected] of [
  ['source_family_selection_gate', 'blocked'],
  ['source_provenance_license_legal_gate', 'not_accepted'],
  ['candidate_use_gate', 'blocked'],
  ['transform_gate', 'blocked'],
  ['source_row_emission_gate', 'blocked'],
  ['definition_authority_gate', 'blocked'],
  ['answer_eligibility_gate', 'blocked'],
  ['public_runtime_gate', 'not_accepted'],
  ['publication_release_gate', 'not_accepted'],
  ['commercial_export_gate', 'blocked'],
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
  'translation_output',
  'accepted_gloss_text',
  'public_reader_output',
  'route_shard_edit',
  'public_runtime_mutation',
  'candidate_text_export',
  'definition_content_storage',
  'commercial_export_permission',
  'release_action',
]) {
  expect((verdict.must_not_be_accepted || []).includes(forbidden), `missing must_not_be_accepted: ${forbidden}`);
}

expect(
  verdict.stop_condition ===
    'dated_agent6_verdict_exists_for_exact_old_dictionary_commercial_clean_only_metadata_custody_planning_boundary_only_no_mutation_or_release_performed',
  'stop condition mismatch',
);

console.log(
  `Agent6 old-dictionary commercial-clean-only metadata custody verdict validation passed. ` +
    `Rows: ${boundary.rows}; occurrences: ${boundary.occurrences}.`,
);
