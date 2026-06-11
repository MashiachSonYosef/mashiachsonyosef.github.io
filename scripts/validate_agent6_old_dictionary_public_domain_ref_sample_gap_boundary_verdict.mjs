#!/usr/bin/env node
import fs from 'node:fs';

const verdictPath =
  process.argv[2] || 'reports/agent6-old-dictionary-public-domain-ref-sample-gap-boundary-verdict-2026-06-05.json';

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
  verdict.disposition === 'warn_accepted_nonpublic_metadata_gap_planning_evidence_only',
  'disposition must remain WARN accepted for nonpublic metadata-gap planning evidence only',
);
expect(verdict.scope === 'old_dictionary_public_domain_ref_sample_gap_planning_boundary_only', 'scope mismatch');

const boundary = verdict.accepted_boundary || {};
for (const [key, expected] of [
  ['public_domain_rows', 297],
  ['public_domain_occurrences', 5747],
  ['rows_with_ref_samples_or_ref_count', 204],
  ['occurrences_with_ref_samples_or_ref_count', 4385],
  ['rows_without_ref_samples_or_ref_count', 93],
  ['occurrences_without_ref_samples_or_ref_count', 1362],
  ['gap_rows_with_rids', 93],
  ['gap_rid_total', 270],
  ['gap_rows_with_headwords', 93],
  ['gap_headword_total', 251],
]) {
  expect(boundary[key] === expected, `accepted_boundary.${key} must be ${expected}`);
}
expect(
  boundary.source_artifact === 'reports/agent1-old-dictionary-public-domain-ref-sample-gap-manifest-2026-06-05.json',
  'source artifact mismatch',
);
expect(boundary.exact_row_payload === 'public_domain_ref_gap_rows[]', 'exact row payload pointer mismatch');
expect(
  boundary.permitted_next_step === 'Agent_10_may_carry_manifest_as_nonpublic_metadata_gap_planning_evidence_only',
  'permitted next step mismatch',
);

const validators = verdict.validators_run || [];
expect(validators.length === 1, 'expected one validators_run row');
expect(
  validators[0]?.command ===
    'node scripts/validate_agent10_old_dictionary_public_domain_ref_sample_gap_boundary_packet.mjs reports/agent10-agent6-ready-old-dictionary-public-domain-ref-sample-gap-boundary-packet-2026-06-05.json',
  'validator command mismatch',
);
expect(validators[0]?.result === 'passed', 'validator result must be passed');
expect(validators[0]?.gap_rows === 93, 'validator gap rows must be 93');
expect(validators[0]?.occurrences === 1362, 'validator occurrences must be 1362');

const recount = verdict.independent_recount || {};
for (const [key, expected] of [
  ['public_domain_rows', 297],
  ['public_domain_occurrences', 5747],
  ['rows_with_ref_samples_or_ref_count', 204],
  ['occurrences_with_ref_samples_or_ref_count', 4385],
  ['gap_rows', 93],
  ['gap_occurrences', 1362],
  ['unique_gap_token_ids', 93],
  ['duplicate_gap_token_ids', 0],
  ['unique_gap_queue_ids', 93],
  ['gap_rid_rows', 93],
  ['gap_rid_total', 270],
  ['gap_headword_rows', 93],
  ['gap_headword_total', 251],
  ['nonzero_zero_counters', 0],
  ['exact_text_payload_fields_observed', 0],
]) {
  expect(recount[key] === expected, `independent_recount.${key} must be ${expected}`);
}

const partitions = recount.family_partitions_nonexclusive || {};
for (const [family, rows, occurrences] of [
  ['Jastrow Dictionary', 6, 89],
  ['BDB Dictionary', 91, 1339],
  ['BDB Aramaic Dictionary', 22, 434],
]) {
  expect(partitions[family]?.lane === 'commercial_clean_candidate', `${family} lane mismatch`);
  expect(partitions[family]?.rows === rows, `${family} rows mismatch`);
  expect(partitions[family]?.occurrences === occurrences, `${family} occurrences mismatch`);
  expect(partitions[family]?.token_hash_ok === true, `${family} token hash must be ok`);
}
expect(partitions.family_partition_token_id_total === 119, 'family partition token ID total must be 119');
expect(partitions.family_partition_unique_token_ids === 93, 'family partition unique token IDs must be 93');

const blockers = new Map([
  ['public_domain_ref_sample_gap_rows_are_metadata_only_not_candidate_text', [93, 1362]],
  ['public_domain_ref_sample_gap_needs_source_family_boundary_if_ref_samples_required', [93, 1362]],
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
  'gap_rows_are_metadata_gap_planning_evidence_only_not_candidate_source_definition_answer_or_accepted_text',
  'family_partitions_are_nonexclusive_no_source_family_selection_created',
  'commercial_clean_candidate_lane_is_planning_metadata_only_no_source_license_legal_or_export_acceptance',
  'later_ref_samples_source_family_selection_source_row_emission_candidate_use_transform_storage_answer_route_public_runtime_export_or_release_requires_exact_agent6_packet',
]) {
  expect((verdict.warnings || []).includes(warning), `missing warning: ${warning}`);
}

const gates = verdict.affected_gates || {};
expect(gates.ref_sample_gap_planning_gate === 'warn_accepted_exact_artifact_only', 'ref-sample gap gate mismatch');
for (const [gate, expected] of [
  ['source_provenance_license_legal_gate', 'not_accepted'],
  ['source_family_selection_gate', 'blocked'],
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
    'dated_agent6_verdict_exists_for_exact_old_dictionary_public_domain_ref_sample_gap_planning_boundary_only_no_mutation_or_release_performed',
  'stop condition mismatch',
);

console.log(
  `Agent6 old-dictionary public-domain ref-sample gap verdict validation passed. ` +
    `Gap rows: ${boundary.rows_without_ref_samples_or_ref_count}; occurrences: ${boundary.occurrences_without_ref_samples_or_ref_count}.`,
);
