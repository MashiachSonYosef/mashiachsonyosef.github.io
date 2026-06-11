#!/usr/bin/env node
import fs from 'node:fs';

const verdictPath =
  process.argv[2] || 'reports/agent6-old-dictionary-public-domain-citation-metadata-custody-boundary-verdict-2026-06-05.json';

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
  verdict.disposition === 'warn_accepted_nonpublic_citation_source_custody_planning_evidence_only',
  'disposition must remain WARN accepted for nonpublic citation/source custody planning evidence only',
);
expect(
  verdict.scope === 'old_dictionary_public_domain_citation_metadata_custody_planning_boundary_only',
  'scope mismatch',
);

const boundary = verdict.accepted_boundary || {};
expect(boundary.audited_rows === 500, 'accepted audited rows must be 500');
expect(boundary.audited_occurrences === 8427, 'accepted audited occurrences must be 8427');
expect(boundary.public_domain_observed_rows === 297, 'accepted public-domain observed rows must be 297');
expect(boundary.public_domain_observed_occurrences === 5747, 'accepted public-domain observed occurrences must be 5747');
expect(boundary.public_domain_citation_metadata_present_rows === 297, 'accepted citation metadata rows must be 297');
expect(boundary.rows_without_public_domain_citation_metadata === 203, 'rows without public-domain citation metadata must be 203');
expect(
  boundary.source_artifact === 'reports/agent1-old-dictionary-public-domain-citation-metadata-custody-2026-06-05.json',
  'source artifact mismatch',
);
expect(boundary.exact_row_payload === 'public_domain_metadata_rows[]', 'exact row payload pointer mismatch');
expect(
  boundary.permitted_next_step === 'Agent_10_may_carry_artifact_as_nonpublic_citation_source_custody_planning_evidence_only',
  'permitted next step mismatch',
);

const validators = verdict.validators_run || [];
expect(validators.length === 1, 'expected one validators_run row');
expect(
  validators[0]?.command ===
    'node scripts/validate_agent10_old_dictionary_public_domain_citation_metadata_custody_boundary_packet.mjs reports/agent10-agent6-ready-old-dictionary-public-domain-citation-metadata-custody-boundary-packet-2026-06-05.json',
  'validator command mismatch',
);
expect(validators[0]?.result === 'passed', 'validator result must be passed');
expect(validators[0]?.rows === 500, 'validator rows must be 500');
expect(validators[0]?.public_domain_citation_metadata_rows === 297, 'validator citation metadata rows must be 297');

const recount = verdict.independent_recount || {};
for (const [key, expected] of [
  ['audited_rows', 500],
  ['audited_occurrences', 8427],
  ['public_domain_metadata_rows', 297],
  ['public_domain_observed_occurrences', 5747],
  ['public_domain_rid_rows', 297],
  ['public_domain_rid_total', 1276],
  ['public_domain_headword_rows', 297],
  ['public_domain_headword_total', 1120],
  ['public_domain_refs_rows', 204],
  ['public_domain_refs_total', 4478],
  ['public_domain_rows_without_refs_sample', 93],
  ['rows_without_public_domain_citation_metadata', 203],
  ['nonzero_zero_counters', 0],
  ['exact_text_payload_fields_observed', 0],
]) {
  expect(recount[key] === expected, `independent_recount.${key} must be ${expected}`);
}

const laneSplit = recount.lane_split || {};
expect(laneSplit.commercial_clean_candidate?.rows === 297, 'commercial_clean_candidate rows must be 297');
expect(laneSplit.commercial_clean_candidate?.occurrences === 5747, 'commercial_clean_candidate occurrences must be 5747');
expect(laneSplit.noncommercial_educational_candidate?.rows === 17, 'NC rows must be 17');
expect(laneSplit.noncommercial_educational_candidate?.occurrences === 259, 'NC occurrences must be 259');
expect(laneSplit.metadata_or_link_only?.rows === 0, 'metadata_or_link_only rows must be 0');
expect(laneSplit.blocked_or_needs_review?.rows === 186, 'blocked_or_needs_review rows must be 186');
expect(laneSplit.blocked_or_needs_review?.occurrences === 2421, 'blocked_or_needs_review occurrences must be 2421');

const expectedBlockers = new Map([
  ['public_domain_metadata_is_citation_metadata_only_not_definition_text', [297, 5747]],
  ['public_domain_rows_without_ref_samples_need_source_family_boundary_if_refs_required', [93, 1362]],
  ['nc_only_rows_have_no_public_domain_citation_metadata_and_no_commercial_authorization', [17, 259]],
  ['no_source_hit_rows_have_no_public_domain_citation_metadata_or_source_lane_evidence', [186, 2421]],
]);
for (const row of verdict.exact_blockers_preserved || []) {
  const expected = expectedBlockers.get(row.blocker);
  expect(Boolean(expected), `unexpected blocker: ${row.blocker}`);
  if (!expected) continue;
  expect(row.rows === expected[0], `${row.blocker} rows mismatch`);
  expect(row.occurrences === expected[1], `${row.blocker} occurrences mismatch`);
}
expect((verdict.exact_blockers_preserved || []).length === expectedBlockers.size, 'exact blocker count mismatch');

for (const warning of [
  'public_domain_citation_metadata_is_not_definition_candidate_answer_or_accepted_text',
  '93_public_domain_metadata_rows_lack_ref_samples_and_need_later_boundary_if_refs_are_required',
  'commercial_clean_candidate_lane_is_planning_metadata_only_no_source_license_legal_or_export_acceptance',
  'noncommercial_educational_candidate_lane_remains_separate_no_nc_commercial_authorization',
  'blocked_or_needs_review_no_source_hit_rows_remain_blocked_for_source_license_custody_use',
  'future_candidate_use_transform_source_row_emission_text_export_definition_storage_answer_route_public_runtime_export_or_release_requires_later_exact_agent6_packet',
]) {
  expect((verdict.warnings || []).includes(warning), `missing warning: ${warning}`);
}

const gates = verdict.affected_gates || {};
expect(gates.citation_metadata_custody_planning_gate === 'warn_accepted_exact_artifact_only', 'citation metadata gate mismatch');
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
  ['nc_commercial_authorization_gate', 'blocked'],
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
  'nc_commercial_authorization',
  'release_action',
]) {
  expect((verdict.must_not_be_accepted || []).includes(forbidden), `missing must_not_be_accepted: ${forbidden}`);
}

expect(
  verdict.stop_condition ===
    'dated_agent6_verdict_exists_for_exact_old_dictionary_public_domain_citation_metadata_custody_planning_boundary_only_no_mutation_or_release_performed',
  'stop condition mismatch',
);

console.log(
  `Agent6 old-dictionary public-domain citation metadata custody verdict validation passed. ` +
    `Rows: ${boundary.audited_rows}; public-domain citation metadata rows: ${boundary.public_domain_citation_metadata_present_rows}.`,
);
