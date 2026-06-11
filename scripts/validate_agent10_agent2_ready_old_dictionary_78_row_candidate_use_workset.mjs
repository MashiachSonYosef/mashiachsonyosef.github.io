#!/usr/bin/env node
import fs from 'node:fs';

const artifactPath =
  process.argv[2] ||
  'reports/agent10-agent2-ready-old-dictionary-78-row-candidate-use-workset-2026-06-06.json';

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

function expectZeroCounters(object, keys, label) {
  for (const key of keys) {
    expect(object?.[key] === 0, `${label}.${key} must be 0`);
  }
}

const artifact = readJson(artifactPath);

expect(
  artifact.artifact_type === 'agent10_agent2_ready_old_dictionary_78_row_candidate_use_workset',
  'artifact_type mismatch',
);
expect(
  artifact.target_package === 'old-dictionary-commercial-clean-78-row-candidate-use-preboundary-workset',
  'target_package mismatch',
);
expect(
  artifact.status === 'ready_for_agent2_preboundary_matrix_or_exact_blocker',
  'status mismatch',
);
expect(artifact.source_license_lane === 'commercial_clean_candidate', 'source license lane mismatch');
expect(
  artifact.current_use_status === 'nonpublic_planning_evidence_only_no_transform_or_candidate_use_approval',
  'current use status mismatch',
);

const requiredFiles = [
  'reports/agent2-old-dictionary-commercial-clean-morphology-relation-matrix-2026-06-05.json',
  'reports/agent1-old-dictionary-agent2-transform-lane-handoff-2026-06-04.json',
  'reports/agent10-old-dictionary-commercial-clean-source-family-morphology-coverage-summary-current.json',
  'reports/agent10-direct-release-package-intake-refresh-2026-06-06a.json',
];
expect(Array.isArray(artifact.files_used), 'files_used must be an array');
for (const path of requiredFiles) {
  expect(artifact.files_used.includes(path), `missing files_used entry ${path}`);
  expect(fs.existsSync(path), `referenced input missing: ${path}`);
}

const matrix = readJson(requiredFiles[0]);
const handoff = readJson(requiredFiles[1]);
const coverage = readJson(requiredFiles[2]);
const intake = readJson(requiredFiles[3]);

expect(
  matrix.artifact_type === 'agent2_old_dictionary_commercial_clean_morphology_relation_matrix',
  'morphology matrix artifact_type mismatch',
);
expect(
  handoff.artifact_type === 'agent1_old_dictionary_agent2_transform_lane_handoff',
  'Agent1 handoff artifact_type mismatch',
);
expect(
  coverage.artifact_type ===
    'agent10_old_dictionary_commercial_clean_source_family_morphology_coverage_summary',
  'coverage summary artifact_type mismatch',
);
expect(
  intake.artifact_type === 'agent10_direct_release_package_intake_refresh',
  'release intake artifact_type mismatch',
);

expect(artifact.selection_rule?.preview_relation_class === 'exact_after_mark_strip', 'selector class mismatch');
expect(
  artifact.selection_rule?.agent2_morphology_relation_status ===
    'agent2_morphology_relation_approved_for_nonpublic_planning',
  'selector morphology status mismatch',
);
expect(artifact.selection_rule?.license_lane === 'commercial_clean_candidate', 'selector license lane mismatch');
expect(artifact.expected_counts?.rows === 78, 'expected row count must be 78');
expect(artifact.expected_counts?.occurrences === 1461, 'expected occurrence count must be 1461');

const selectedRows = matrix.rows.filter(
  (row) =>
    row.preview_relation_class === artifact.selection_rule.preview_relation_class &&
    row.agent2_morphology_relation_status ===
      artifact.selection_rule.agent2_morphology_relation_status &&
    row.nonpublic_planning_only === true,
);
const selectedOccurrences = selectedRows.reduce((sum, row) => sum + Number(row.occurrences || 0), 0);
expect(selectedRows.length === artifact.expected_counts.rows, 'selected row count mismatch against matrix');
expect(
  selectedOccurrences === artifact.expected_counts.occurrences,
  'selected occurrence count mismatch against matrix',
);
expect(
  matrix.relation_class_counts?.exact_after_mark_strip?.rows === artifact.expected_counts.rows,
  'matrix exact_after_mark_strip row count mismatch',
);
expect(
  matrix.relation_class_counts?.exact_after_mark_strip?.occurrences === artifact.expected_counts.occurrences,
  'matrix exact_after_mark_strip occurrence count mismatch',
);
expect(
  matrix.relation_status_counts?.agent2_morphology_relation_approved_for_nonpublic_planning ===
    artifact.expected_counts.rows,
  'matrix approved relation status count mismatch',
);

const commercialCleanRows = handoff.transform_rows.filter(
  (row) => row.license_lane === 'commercial_clean_candidate',
);
expect(commercialCleanRows.length === 3, 'Agent1 handoff must preserve three commercial-clean source families');
for (const row of commercialCleanRows) {
  expect(row.agent6_boundary_required === true, `${row.source_family} must require Agent6 boundary`);
  expect(row.agent2_transform_allowed_now === false, `${row.source_family} must not be transform-authorized`);
  expect(row.answer_eligible === false, `${row.source_family} must not be answer eligible`);
  expect(row.public_emit === false, `${row.source_family} must not be public emit`);
}

expect(
  coverage.prior_agent6_coverage?.morphology_planning?.rows === artifact.expected_counts.rows,
  'coverage morphology row count mismatch',
);
expect(
  coverage.prior_agent6_coverage?.morphology_planning?.occurrences ===
    artifact.expected_counts.occurrences,
  'coverage morphology occurrence count mismatch',
);
expect(
  intake.current_coverage?.prior_agent6_morphology_planning?.rows === artifact.expected_counts.rows,
  'intake morphology row count mismatch',
);
expect(
  intake.current_coverage?.prior_agent6_morphology_planning?.occurrences ===
    artifact.expected_counts.occurrences,
  'intake morphology occurrence count mismatch',
);

const requiredFields = [
  'queue_id',
  'token_id',
  'lexicon_entry_id',
  'surface',
  'normalized',
  'occurrences',
  'source_family_hits',
  'public_domain_headwords',
  'public_domain_rids',
  'license_lane',
  'preview_relation_class',
  'morphology_relation_status',
  'intended_candidate_use',
  'candidate_text_rows_now',
  'definition_candidate_rows_now',
  'lemma_candidate_rows_now',
  'reader_hint_candidate_rows_now',
  'answer_eligible_rows_now',
  'public_emit_rows_now',
  'route_writes',
  'accepted_text_rows',
  'exact_agent6_question',
];
expect(
  JSON.stringify(artifact.agent2_required_output?.required_fields) === JSON.stringify(requiredFields),
  'Agent2 required output field contract mismatch',
);
expect(
  artifact.agent2_required_output?.required_intended_candidate_use ===
    'candidate_use_preboundary_review_only_no_text_emission',
  'required intended candidate use mismatch',
);

const zeroKeys = [
  'candidate_text_rows_now',
  'definition_candidate_rows_now',
  'lemma_candidate_rows_now',
  'reader_hint_candidate_rows_now',
  'answer_eligible_rows_now',
  'public_emit_rows_now',
  'route_writes',
  'accepted_text_rows',
];
expectZeroCounters(artifact.agent2_required_output?.required_zero_counters, zeroKeys, 'required_zero_counters');
expectZeroCounters(artifact.global_zero_counters, zeroKeys, 'global_zero_counters');
expect(artifact.global_zero_counters?.public_runtime_mutation === 0, 'public runtime mutation must be 0');
expect(artifact.global_zero_counters?.release_actions === 0, 'release actions must be 0');

expect(
  artifact.agent6_boundary_question_to_prepare?.includes('78 row / 1461 occurrence'),
  'Agent6 boundary question must name exact row/occurrence count',
);
expect(
  artifact.exact_blocker_if_unavailable?.includes('missing_pipeline_blocker'),
  'missing exact blocker instruction',
);
expect(
  artifact.next_owner?.includes('Agent 2 produces the preboundary matrix or exact blocker'),
  'next owner mismatch',
);
expect(
  artifact.stop_condition?.includes('Do not emit candidate text'),
  'stop condition must prohibit candidate text emission',
);

const prohibitedAcceptance = [
  'QA acceptance',
  'source/provenance acceptance',
  'source/license/legal acceptance',
  'Definition authority',
  'answer eligibility',
  'accepted gloss/text',
  'public reader output',
  'public/runtime mutation',
  'publication readiness',
  'release action',
];
for (const item of prohibitedAcceptance) {
  expect(artifact.what_must_not_be_accepted?.includes(item), `missing non-acceptance boundary: ${item}`);
}

console.log(
  `Agent10 Agent2 78-row candidate-use workset validation passed. Rows: ${selectedRows.length}; occurrences: ${selectedOccurrences}; zero counters: ${zeroKeys.length}.`,
);
