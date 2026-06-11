#!/usr/bin/env node
import fs from 'node:fs';

const artifactPath =
  process.argv[2] ||
  'reports/agent2-old-dictionary-78-row-transform-output-proposal-missing-pipeline-blocker-2026-06-06.json';

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

const artifact = readJson(artifactPath);

expect(
  artifact.artifact_type === 'agent2_old_dictionary_78_row_transform_output_proposal_missing_pipeline_blocker',
  'artifact_type mismatch',
);
expect(artifact.return_type === 'missing_pipeline_blocker', 'return_type mismatch');
expect(
  artifact.target === 'old-dictionary transform-output proposal matrix for exact 78 queue IDs',
  'target mismatch',
);

const expectedFiles = {
  agent10_workset: 'reports/agent10-agent2-ready-old-dictionary-78-row-transform-output-proposal-workset-2026-06-06.json',
  agent10_workset_md: 'reports/agent10-agent2-ready-old-dictionary-78-row-transform-output-proposal-workset-2026-06-06.md',
  zero_text_package_planning_anchor:
    'reports/agent10-old-dictionary-78-row-zero-text-candidate-use-package-planning-2026-06-06.json',
  agent10_zero_text_consumption:
    'reports/agent10-old-dictionary-78-row-zero-text-package-planning-consumption-2026-06-06.json',
  agent6_zero_text_verdict: 'reports/agent6-old-dictionary-78-row-zero-text-candidate-use-package-verdict-2026-06-06.json',
  preboundary_matrix: 'reports/agent10-old-dictionary-78-row-candidate-use-preboundary-matrix-2026-06-06.json',
  agent10_workset_handoff:
    'reports/agent10-agent2-old-dictionary-78-row-transform-output-proposal-workset-handoff-2026-06-06.json',
  agent10_delivery_proof:
    'reports/agent10-agent2-old-dictionary-78-row-transform-output-proposal-delivery-proof-2026-06-06.json',
};

for (const [key, path] of Object.entries(expectedFiles)) {
  expect(artifact.files_used?.[key] === path, `files_used.${key} mismatch`);
  expect(fs.existsSync(path), `referenced input missing: ${path}`);
}

const workset = readJson(expectedFiles.agent10_workset);
const zeroTextPackage = readJson(expectedFiles.zero_text_package_planning_anchor);
const zeroTextConsumption = readJson(expectedFiles.agent10_zero_text_consumption);
const preboundary = readJson(expectedFiles.preboundary_matrix);
const handoff = readJson(expectedFiles.agent10_workset_handoff);
const delivery = readJson(expectedFiles.agent10_delivery_proof);

expect(
  workset.artifact_type === 'agent10_agent2_ready_old_dictionary_78_row_transform_output_proposal_workset',
  'workset artifact_type mismatch',
);
expect(
  zeroTextPackage.artifact_type === 'agent10_old_dictionary_78_row_zero_text_candidate_use_package_planning',
  'zero-text package artifact_type mismatch',
);
expect(
  zeroTextConsumption.artifact_type === 'agent10_old_dictionary_78_row_zero_text_package_planning_consumption',
  'zero-text consumption artifact_type mismatch',
);
expect(
  preboundary.artifact_type === 'agent10_old_dictionary_78_row_candidate_use_preboundary_matrix',
  'preboundary matrix artifact_type mismatch',
);
expect(
  handoff.artifact_type === 'agent10_agent2_old_dictionary_78_row_transform_output_proposal_workset_handoff',
  'handoff artifact_type mismatch',
);
expect(
  delivery.artifact_type === 'agent10_agent2_old_dictionary_78_row_transform_output_proposal_delivery_proof',
  'delivery artifact_type mismatch',
);

const counts = artifact.lane_counts_rows_consumed || {};
expect(counts.rows === 78, 'rows must be 78');
expect(counts.occurrences === 1461, 'occurrences must be 1461');
expect(counts.source_license_lane === 'commercial_clean_candidate', 'source license lane mismatch');
expect(counts.relation_class === 'exact_after_mark_strip', 'relation class mismatch');
expect(
  counts.morphology_relation_status === 'agent2_morphology_relation_approved_for_nonpublic_planning',
  'morphology relation status mismatch',
);
expect(preboundary.counts?.rows === counts.rows, 'preboundary rows mismatch');
expect(preboundary.counts?.occurrences === counts.occurrences, 'preboundary occurrences mismatch');
expect(zeroTextPackage.counts?.rows === counts.rows, 'zero-text package rows mismatch');
expect(zeroTextPackage.counts?.occurrences === counts.occurrences, 'zero-text package occurrences mismatch');

for (const field of [
  'candidate_text_rows',
  'definition_lemma_reader_hint_rows',
  'answer_eligible_rows',
  'public_emit_rows',
  'route_writes',
  'accepted_text_rows',
  'export_rows',
  'release_actions',
]) {
  expect(counts[field] === 0, `lane_counts_rows_consumed.${field} must be 0`);
}

const blocker = artifact.missing_pipeline_blocker || {};
expect(
  blocker.blocker_id === 'missing_transform_output_proposal_matrix_or_exact_transform_rule',
  'blocker id mismatch',
);
expect(
  blocker.missing_input?.includes('Agent2 transform-output rule artifact'),
  'missing input must name transform-output rule artifact',
);
expect(
  blocker.missing_source_field?.includes('source_citation_or_url'),
  'missing source field must name source_citation_or_url',
);
expect(
  blocker.missing_transform_rule?.includes('No rule is provided'),
  'missing transform rule text mismatch',
);
expect(blocker.missing_output_schema_field === 'source_citation_or_url', 'missing output schema field mismatch');
expect(blocker.validator === 'scripts/validate_agent2_old_dictionary_78_row_transform_output_proposal_missing_pipeline_blocker.mjs', 'validator path mismatch');
expect(blocker.row_count_mismatch === false, 'row count mismatch flag must be false');
expect(blocker.row_count_observed === 78, 'row count observed mismatch');
expect(blocker.occurrence_count_observed === 1461, 'occurrence count observed mismatch');

for (const expected of [
  'missing_transform_output_proposal_matrix_or_exact_transform_rule',
  'missing_source_field::source_citation_or_url',
  'missing_transform_rule::proposed_candidate_text_proposed_definition_text_proposed_lemma_text_proposed_reader_hint_text',
  'next_transform_output_or_candidate_text_boundary_not_supplied',
  'new_exact_agent6_packet_required_before_transform_output_candidate_text_definition_lemma_reader_hint_content_storage_answer_eligibility_route_write_public_runtime_mutation_export_accepted_text_publication_readiness_or_release',
]) {
  expect(artifact.exact_blockers?.includes(expected), `missing exact blocker: ${expected}`);
}

const rules = artifact.required_rules_preserved || {};
for (const [key, expected] of [
  ['rows_exactly_78', true],
  ['occurrences_exactly_1461', true],
  ['source_license_lane', 'commercial_clean_candidate'],
  ['relation_class', 'exact_after_mark_strip'],
  ['morphology_relation_status', 'agent2_morphology_relation_approved_for_nonpublic_planning'],
  ['answer_eligible', false],
  ['public_emit', false],
  ['route_writes', 0],
  ['accepted_text', false],
  ['agent6_boundary_required', true],
  ['public_runtime_mutation', false],
  ['route_shard_write', false],
  ['export', false],
  ['publication_readiness', false],
  ['release_action', false],
]) {
  expect(rules[key] === expected, `required_rules_preserved.${key} mismatch`);
}

for (const record of artifact.command_timeout_records || []) {
  expect(typeof record.command === 'string' && record.command.length > 0, 'timeout record missing command');
  expect(typeof record.timeout_ms === 'number' && record.timeout_ms > 0, 'timeout record missing timeout_ms');
  expect(typeof record.timed_out === 'boolean', 'timeout record missing timed_out boolean');
  expect(
    typeof record.partial_output_or_artifact === 'string' && record.partial_output_or_artifact.length > 0,
    'timeout record missing partial output/artifact',
  );
  expect(
    typeof record.next_safe_action === 'string' && record.next_safe_action.length > 0,
    'timeout record missing next safe action',
  );
}

expect(artifact.stop_condition?.includes('Do not mutate public/runtime files'), 'stop condition mismatch');

console.log(
  `Agent2 transform-output proposal missing-pipeline blocker validation passed. Rows: ${counts.rows}; occurrences: ${counts.occurrences}; blocker: ${blocker.blocker_id}.`,
);
