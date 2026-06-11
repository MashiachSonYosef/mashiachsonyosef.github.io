#!/usr/bin/env node
import fs from 'node:fs';

const verdictPath =
  process.argv[2] || 'reports/agent6-old-dictionary-candidate-use-package-boundary-verdict-2026-06-05.json';

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

if (verdict.artifact_type === 'agent6_old_dictionary_78_row_candidate_use_preboundary_verdict') {
  validatePreboundaryVerdict(verdict);
  process.exit(0);
}

expect(
  verdict.artifact_type === 'agent6_old_dictionary_candidate_use_package_boundary_verdict',
  'artifact_type mismatch'
);
expect(
  verdict.disposition === 'warn_accepted_nonpublic_candidate_use_planning_package_evidence_only',
  'disposition mismatch'
);

for (const artifactPath of [
  'reports/agent10-agent6-ready-old-dictionary-candidate-use-package-boundary-packet-2026-06-05.json',
  'reports/agent2-old-dictionary-morphology-candidate-use-package-2026-06-05.json',
  'reports/agent4-agent2-old-dictionary-morphology-candidate-use-package-gate-proof-2026-06-05.json',
  'reports/agent10-agent2-old-dictionary-morphology-candidate-use-package-consumption-2026-06-05.json',
  'reports/agent6-old-dictionary-morphology-candidate-use-boundary-verdict-2026-06-05.json',
]) {
  expect((verdict.reviewed_artifacts || []).includes(artifactPath), `missing reviewed artifact: ${artifactPath}`);
}

const validator = verdict.validator || {};
expect(
  validator.command ===
    'node scripts\\validate_agent2_old_dictionary_morphology_candidate_use_package.mjs reports\\agent2-old-dictionary-morphology-candidate-use-package-2026-06-05.json',
  'validator command mismatch'
);
expect(validator.result === 'passed', 'validator result must be passed');
expect(validator.rows === 78, 'validator rows must be 78');
expect(validator.occurrences === 1461, 'validator occurrences must be 1461');
expect(validator.text_output_rows === 0, 'validator text_output_rows must be 0');

const scope = verdict.recounted_scope || {};
expect(scope.package_rows === 78, 'package_rows must be 78');
expect(scope.package_occurrences === 1461, 'package_occurrences must be 1461');
expect(scope.unique_queue_ids === 78, 'unique_queue_ids must be 78');
expect(scope.license_lane === 'commercial_clean_candidate', 'license_lane mismatch');
expect(scope.noncommercial_educational_candidate_rows === 0, 'NC rows must be 0');
expect(scope.preview_relation_class === 'exact_after_mark_strip', 'relation class mismatch');
expect(
  scope.agent2_morphology_relation_status === 'agent2_morphology_relation_approved_for_nonpublic_planning',
  'Agent 2 morphology relation status mismatch'
);
expect(scope.morphology_blocked_rows_excluded === 219, 'excluded morphology-blocked rows must be 219');
expect(scope.source_family_values_observed === 3, 'source family count must be 3');

const zeroRecounts = verdict.zero_counters_recounted_nonzero || {};
for (const field of ['agent10_packet', 'agent2_package', 'agent4_gate_proof', 'agent10_consumption']) {
  expect(Array.isArray(zeroRecounts[field]), `${field} nonzero recount must be an array`);
  expect(zeroRecounts[field].length === 0, `${field} must have no nonzero zero-counters`);
}

expect(
  verdict.effective_boundary === 'exact_78_row_1461_occurrence_nonpublic_candidate_use_planning_package_evidence_only',
  'effective boundary mismatch'
);

for (const carry of [
  'exact_78_queue_id_package_as_nonpublic_candidate_use_planning_package_evidence_only',
  'commercial_clean_candidate_lane_metadata',
  'exact_after_mark_strip_morphology_relation_metadata',
  'agent2_morphology_relation_approved_for_nonpublic_planning_metadata',
  'zero_output_counter_evidence',
]) {
  expect((verdict.may_carry_forward || []).includes(carry), `missing carry-forward item: ${carry}`);
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
  'actual_text_storage_transform_output_export_answer_or_runtime_mutation_requires_new_agent6_verdict',
]) {
  expect((verdict.preserved_blockers || []).includes(blocker), `missing preserved blocker: ${blocker}`);
}

for (const forbidden of [
  'qa_acceptance_beyond_this_docket',
  'source_provenance_acceptance',
  'source_license_legal_acceptance',
  'definition_authority',
  'usage_as_definition_authority',
  'answer_acceptance',
  'answer_eligibility',
  'translation_output',
  'accepted_gloss_text',
  'public_reader_output',
  'route_shard_edit',
  'public_runtime_mutation',
  'route_publication_support',
  'publication_readiness',
  'product_data_acceptance',
  'candidate_text_export',
  'definition_content_storage',
  'lemma_content_storage',
  'reader_hint_content_storage',
  'commercial_export_authorization',
  'nc_commercial_authorization',
  'release_action',
]) {
  expect((verdict.not_accepted || []).includes(forbidden), `missing not_accepted item: ${forbidden}`);
}

expect(
  verdict.next_required_boundary ===
    'new_exact_agent6_packet_required_before_text_storage_transform_output_source_row_emission_candidate_text_export_answer_eligibility_route_write_public_runtime_mutation_accepted_text_commercial_export_or_release',
  'next required boundary mismatch'
);

console.log(
  `Agent6 old-dictionary candidate-use package boundary verdict validation passed. ` +
    `Rows: ${scope.package_rows}; occurrences: ${scope.package_occurrences}; disposition: ${verdict.disposition}.`
);

function validatePreboundaryVerdict(verdict) {
  expect(
    verdict.disposition === 'warn_accepted_nonpublic_candidate_use_preboundary_review_matrix_only',
    'preboundary disposition mismatch'
  );

  for (const artifactPath of [
    'reports/agent10-agent6-ready-old-dictionary-78-row-candidate-use-preboundary-packet-2026-06-06.json',
    'reports/agent10-old-dictionary-78-row-candidate-use-preboundary-matrix-2026-06-06.json',
  ]) {
    expect((verdict.reviewed_artifacts || []).includes(artifactPath), `missing reviewed artifact: ${artifactPath}`);
    expect(fs.existsSync(artifactPath), `reviewed artifact missing: ${artifactPath}`);
  }

  const validator = verdict.validator || {};
  expect(
    validator.command ===
      'node scripts\\validate_agent10_old_dictionary_78_row_candidate_use_preboundary_matrix.mjs reports\\agent10-old-dictionary-78-row-candidate-use-preboundary-matrix-2026-06-06.json',
    'preboundary validator command mismatch'
  );
  expect(validator.result === 'passed', 'preboundary validator result must be passed');
  expect(validator.rows === 78, 'preboundary validator rows must be 78');
  expect(validator.occurrences === 1461, 'preboundary validator occurrences must be 1461');

  const scope = verdict.recounted_scope || {};
  expect(scope.rows === 78, 'scope rows must be 78');
  expect(scope.occurrences === 1461, 'scope occurrences must be 1461');
  expect(scope.unique_queue_ids === 78, 'scope unique_queue_ids must be 78');
  expect(scope.source_license_lane === 'commercial_clean_candidate', 'source license lane mismatch');
  expect(scope.relation_class === 'exact_after_mark_strip', 'relation class mismatch');
  expect(
    scope.morphology_relation_status === 'agent2_morphology_relation_approved_for_nonpublic_planning',
    'morphology relation status mismatch'
  );

  for (const field of [
    'candidate_text_rows',
    'definition_candidate_rows',
    'lemma_candidate_rows',
    'reader_hint_candidate_rows',
    'answer_eligible_rows',
    'public_emit_rows',
    'route_writes',
    'accepted_text_rows',
    'public_runtime_mutation',
    'release_actions',
  ]) {
    expect(scope[field] === 0, `scope.${field} must be 0`);
  }

  expect(scope.rows_with_surface === 78, 'rows_with_surface must be 78');
  expect(scope.rows_with_normalized === 78, 'rows_with_normalized must be 78');
  expect(scope.rows_with_public_domain_headwords === 78, 'rows_with_public_domain_headwords must be 78');
  expect(
    verdict.warning ===
      'surface_normalized_public_domain_headwords_and_public_domain_rids_are_nonpublic_review_pointers_only_not_candidate_text_source_text_definition_lemma_reader_hint_answer_accepted_text_public_output_or_export_clearance',
    'warning mismatch'
  );
  expect(
    verdict.effective_boundary === 'exact_78_row_1461_occurrence_nonpublic_candidate_use_preboundary_review_matrix_only',
    'effective boundary mismatch'
  );

  for (const carry of [
    'exact_78_row_preboundary_matrix_as_nonpublic_review_evidence_only',
    'commercial_clean_candidate_lane_metadata',
    'exact_after_mark_strip_relation_metadata',
    'agent2_morphology_relation_approved_for_nonpublic_planning_metadata',
    'zero_output_counter_evidence',
  ]) {
    expect((verdict.may_carry_forward || []).includes(carry), `missing carry-forward item: ${carry}`);
  }

  for (const forbidden of [
    'qa_acceptance_beyond_this_exact_docket',
    'source_provenance_acceptance',
    'source_license_legal_acceptance',
    'definition_authority',
    'usage_as_definition_authority',
    'answer_acceptance',
    'answer_eligibility',
    'accepted_gloss_text',
    'public_reader_output',
    'route_shard_edit',
    'public_runtime_mutation',
    'route_publication_support',
    'publication_readiness',
    'product_data_acceptance',
    'candidate_text_export',
    'definition_content_storage',
    'lemma_content_storage',
    'reader_hint_content_storage',
    'commercial_export_authorization',
    'nc_commercial_authorization',
    'release_action',
  ]) {
    expect((verdict.not_accepted || []).includes(forbidden), `missing not_accepted item: ${forbidden}`);
  }

  expect(
    verdict.next_required_boundary ===
      'new_exact_agent6_packet_required_before_candidate_use_package_candidate_text_transform_output_content_storage_answer_eligibility_route_write_public_runtime_mutation_export_accepted_text_or_release',
    'next required boundary mismatch'
  );

  console.log(
    `Agent6 old-dictionary candidate-use preboundary verdict validation passed. ` +
      `Rows: ${scope.rows}; occurrences: ${scope.occurrences}; disposition: ${verdict.disposition}.`
  );
}
