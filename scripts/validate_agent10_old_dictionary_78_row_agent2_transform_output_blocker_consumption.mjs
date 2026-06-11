#!/usr/bin/env node
import fs from 'node:fs';

const artifactPath =
  process.argv[2] ||
  'reports/agent10-old-dictionary-78-row-agent2-transform-output-blocker-consumption-2026-06-06.json';

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
  artifact.artifact_type === 'agent10_old_dictionary_78_row_agent2_transform_output_blocker_consumption',
  'artifact_type mismatch',
);
expect(
  artifact.target_package === 'old-dictionary-commercial-clean-78-row-transform-output-proposal-preboundary',
  'target package mismatch',
);
expect(
  artifact.status === 'agent2_missing_pipeline_blocker_consumed_no_agent6_transform_packet_ready',
  'status mismatch',
);

const files = artifact.files_used || {};
const expectedFiles = {
  agent2_blocker: 'reports/agent2-old-dictionary-78-row-transform-output-proposal-missing-pipeline-blocker-2026-06-06.json',
  agent10_workset: 'reports/agent10-agent2-ready-old-dictionary-78-row-transform-output-proposal-workset-2026-06-06.json',
  zero_text_package_planning_anchor:
    'reports/agent10-old-dictionary-78-row-zero-text-candidate-use-package-planning-2026-06-06.json',
  delivery_proof:
    'reports/agent10-agent2-old-dictionary-78-row-transform-output-proposal-delivery-proof-2026-06-06.json',
};
for (const [key, path] of Object.entries(expectedFiles)) {
  expect(files[key] === path, `files_used.${key} mismatch`);
  expect(fs.existsSync(path), `referenced file missing: ${path}`);
}

const blocker = readJson(files.agent2_blocker);
const workset = readJson(files.agent10_workset);
const zeroText = readJson(files.zero_text_package_planning_anchor);
const delivery = readJson(files.delivery_proof);

expect(
  blocker.artifact_type === 'agent2_old_dictionary_78_row_transform_output_proposal_missing_pipeline_blocker',
  'Agent2 blocker artifact_type mismatch',
);
expect(
  workset.artifact_type === 'agent10_agent2_ready_old_dictionary_78_row_transform_output_proposal_workset',
  'Agent10 workset artifact_type mismatch',
);
expect(
  zeroText.artifact_type === 'agent10_old_dictionary_78_row_zero_text_candidate_use_package_planning',
  'zero-text package artifact_type mismatch',
);
expect(
  delivery.artifact_type === 'agent10_agent2_old_dictionary_78_row_transform_output_proposal_delivery_proof',
  'delivery proof artifact_type mismatch',
);

const consumed = artifact.agent2_return_consumed || {};
expect(consumed.return_type === 'missing_pipeline_blocker', 'consumed return type mismatch');
expect(consumed.rows === 78, 'consumed rows must be 78');
expect(consumed.occurrences === 1461, 'consumed occurrences must be 1461');
expect(consumed.source_license_lane === 'commercial_clean_candidate', 'source license lane mismatch');
expect(consumed.relation_class === 'exact_after_mark_strip', 'relation class mismatch');
expect(
  consumed.morphology_relation_status === 'agent2_morphology_relation_approved_for_nonpublic_planning',
  'morphology relation status mismatch',
);
expect(blocker.lane_counts_rows_consumed?.rows === consumed.rows, 'blocker rows mismatch');
expect(blocker.lane_counts_rows_consumed?.occurrences === consumed.occurrences, 'blocker occurrences mismatch');
expect(workset.current_boundary?.rows === consumed.rows, 'workset rows mismatch');
expect(workset.current_boundary?.occurrences === consumed.occurrences, 'workset occurrences mismatch');
expect(zeroText.counts?.rows === consumed.rows, 'zero-text rows mismatch');
expect(zeroText.counts?.occurrences === consumed.occurrences, 'zero-text occurrences mismatch');

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
  expect(consumed[field] === 0, `agent2_return_consumed.${field} must be 0`);
}

for (const expected of [
  'missing_transform_output_proposal_matrix_or_exact_transform_rule',
  'missing_source_field::source_citation_or_url',
  'missing_transform_rule::proposed_candidate_text_proposed_definition_text_proposed_lemma_text_proposed_reader_hint_text',
  'next_transform_output_or_candidate_text_boundary_not_supplied',
]) {
  expect(artifact.exact_blockers?.includes(expected), `missing exact blocker: ${expected}`);
  expect(blocker.exact_blockers?.includes(expected), `Agent2 blocker missing exact blocker: ${expected}`);
}

const decision = artifact.release_package_decision || {};
expect(decision.agent6_transform_output_packet_ready === false, 'Agent6 transform packet must not be ready');
expect(decision.reason?.includes('source_citation_or_url'), 'decision reason must name source_citation_or_url');
for (const field of [
  'candidate_text_authorized',
  'transform_output_authorized',
  'definition_lemma_reader_hint_content_storage_authorized',
  'answer_eligibility_authorized',
  'route_write_authorized',
  'public_runtime_mutation_authorized',
  'export_authorized',
  'accepted_text_authorized',
  'publication_readiness_authorized',
  'release_action_authorized',
]) {
  expect(decision[field] === false, `release_package_decision.${field} must be false`);
}

expect(
  artifact.next_owner_options?.includes('Agent 1/Agent 2 source-citation enrichment for exact 78 rows including source_citation_or_url'),
  'missing source-citation enrichment next-owner option',
);
expect(
  artifact.next_owner_options?.includes('Agent 2 authored exact transform-output proposal rule'),
  'missing transform rule next-owner option',
);
expect(
  artifact.next_owner_options?.includes('Agent 10 narrowed Agent 6 question that does not request transform output or proposed text fields'),
  'missing narrowed Agent6 question next-owner option',
);
expect(
  artifact.exact_current_blocker ===
    'missing_source_citation_or_url_and_exact_transform_output_rule_for_78_row_packet',
  'current exact blocker mismatch',
);
expect(artifact.stop_condition?.includes('Do not mutate public/runtime files'), 'stop condition mismatch');

console.log(
  `Agent10 Agent2 transform-output blocker consumption validation passed. Rows: ${consumed.rows}; occurrences: ${consumed.occurrences}; blocker: ${artifact.exact_current_blocker}.`,
);
