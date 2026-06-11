#!/usr/bin/env node
import fs from 'node:fs';

const verdictPath =
  process.argv[2] || 'reports/agent6-old-dictionary-exact-row-subset-manifest-boundary-verdict-2026-06-05.json';

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
  verdict.disposition === 'warn_accepted_nonpublic_source_lane_row_subset_planning_evidence_only',
  'disposition must remain WARN accepted for nonpublic source-lane row-subset planning evidence only'
);
expect(verdict.scope === 'old_dictionary_exact_row_subset_manifest_planning_boundary_only', 'scope mismatch');

const boundary = verdict.accepted_boundary || {};
expect(boundary.subset_manifests === 8, 'accepted subset manifests must be 8');
expect(boundary.rows === 500, 'accepted rows must be 500');
expect(boundary.occurrences === 8427, 'accepted occurrences must be 8427');
expect(
  boundary.exact_row_source === 'reports/agent1-old-dictionary-exact-row-subset-manifest-2026-06-05.json',
  'exact_row_source mismatch'
);
expect((boundary.exact_row_fields || []).includes('subset_manifests[].token_ids'), 'missing token_ids exact row field');
expect((boundary.exact_row_fields || []).includes('subset_manifests[].queue_ids'), 'missing queue_ids exact row field');
expect(
  boundary.permitted_next_step === 'Agent_10_may_carry_manifest_as_nonpublic_package_assembly_planning_evidence_only',
  'permitted next step mismatch'
);

const validators = verdict.validators_run || [];
expect(validators.length === 1, 'expected one validators_run row');
expect(
  validators[0]?.command ===
    'node scripts/validate_agent10_old_dictionary_exact_row_subset_manifest_boundary_packet.mjs reports/agent10-agent6-ready-old-dictionary-exact-row-subset-manifest-boundary-packet-2026-06-05.json',
  'validator command mismatch'
);
expect(validators[0]?.result === 'passed', 'validator must pass');
expect(validators[0]?.rows === 500, 'validator rows must be 500');
expect(validators[0]?.occurrences === 8427, 'validator occurrences must be 8427');
expect(validators[0]?.subsets === 8, 'validator subsets must be 8');

const recount = verdict.independent_recount || {};
for (const [key, expected] of [
  ['subset_manifests', 8],
  ['rows_sum', 500],
  ['occurrences_sum', 8427],
  ['total_token_ids', 500],
  ['unique_token_ids', 500],
  ['duplicate_token_ids', 0],
  ['total_queue_ids', 500],
  ['unique_queue_ids', 500],
  ['duplicate_queue_ids', 0],
  ['token_hash_mismatches', 0],
  ['subset_count_mismatches', 0],
  ['nonzero_zero_counters', 0],
]) {
  expect(recount[key] === expected, `independent_recount.${key} must be ${expected}`);
}

const laneRows = recount.lane_presence_rows_nonexclusive || {};
expect(laneRows.commercial_clean_candidate === 297, 'commercial_clean_candidate lane rows must be 297');
expect(laneRows.noncommercial_educational_candidate === 214, 'noncommercial_educational_candidate lane rows must be 214');
expect(laneRows.blocked_or_needs_review === 408, 'blocked_or_needs_review lane rows must be 408');
expect(laneRows.metadata_or_link_only === 0, 'metadata_or_link_only lane rows must be 0');

const expectedSubsets = new Map([
  ['commercial_clean_only', [18, 494, 'warn_accepted_manifest_planning_evidence_only']],
  ['commercial_clean_plus_noncommercial_educational', [57, 818, 'warn_accepted_manifest_planning_evidence_only']],
  ['commercial_clean_plus_blocked_review', [82, 1068, 'warn_accepted_manifest_planning_evidence_only']],
  ['commercial_clean_plus_noncommercial_educational_plus_blocked_review', [140, 3367, 'warn_accepted_manifest_planning_evidence_only']],
  ['noncommercial_educational_only', [17, 259, 'warn_accepted_manifest_planning_evidence_only']],
  ['blocked_review_only', [0, 0, 'warn_accepted_empty_manifest_bucket_only']],
  ['metadata_or_link_only', [0, 0, 'warn_accepted_empty_manifest_bucket_only']],
  ['no_sefaria_source_hit', [186, 2421, 'warn_accepted_blocked_manifest_planning_bucket_only']],
]);
for (const row of verdict.subset_dispositions || []) {
  const expected = expectedSubsets.get(row.bucket_id);
  expect(Boolean(expected), `unexpected subset disposition: ${row.bucket_id}`);
  if (!expected) continue;
  expect(row.rows === expected[0], `${row.bucket_id} rows mismatch`);
  expect(row.occurrences === expected[1], `${row.bucket_id} occurrences mismatch`);
  expect(row.disposition === expected[2], `${row.bucket_id} disposition mismatch`);
  expect(typeof row.blocker_preserved === 'string' && row.blocker_preserved.length > 0, `${row.bucket_id} missing blocker`);
}
expect((verdict.subset_dispositions || []).length === expectedSubsets.size, 'subset disposition count mismatch');

for (const warning of [
  'row_subset_manifest_only_no_source_provenance_license_legal_or_candidate_use_acceptance',
  'overlap_buckets_require_later_exact_agent6_source_family_selection_boundary_before_use',
  'noncommercial_educational_candidate_lane_remains_separate_no_nc_commercial_authorization',
  'no_sefaria_source_hit_bucket_remains_blocked_for_source_license_custody_use',
  'future_transform_candidate_use_candidate_text_definition_storage_answer_route_public_runtime_export_or_release_requires_later_exact_agent6_packet',
]) {
  expect((verdict.warnings || []).includes(warning), `missing warning: ${warning}`);
}

const gates = verdict.affected_gates || {};
expect(gates.row_subset_manifest_planning_gate === 'warn_accepted_exact_manifest_only', 'row subset manifest gate mismatch');
for (const [gate, expected] of [
  ['source_provenance_license_legal_gate', 'not_accepted'],
  ['source_family_selection_gate', 'blocked_for_overlap_buckets'],
  ['candidate_use_gate', 'blocked'],
  ['transform_gate', 'blocked'],
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
  'commercial_export_authorization',
  'nc_commercial_authorization',
  'release_action',
]) {
  expect((verdict.must_not_be_accepted || []).includes(forbidden), `missing must_not_be_accepted: ${forbidden}`);
}

expect(
  verdict.stop_condition ===
    'dated_agent6_verdict_exists_for_exact_8_subset_500_row_8427_occurrence_old_dictionary_manifest_planning_boundary_only_no_mutation_or_release_performed',
  'stop condition mismatch'
);

console.log(
  `Agent6 old-dictionary exact row-subset manifest verdict validation passed. ` +
    `Subsets: ${boundary.subset_manifests}; rows: ${boundary.rows}; occurrences: ${boundary.occurrences}.`
);
