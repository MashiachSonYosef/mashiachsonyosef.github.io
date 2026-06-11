#!/usr/bin/env node
import fs from 'node:fs';

const artifactPath =
  process.argv[2] ||
  'reports/agent10-old-dictionary-78-row-zero-text-package-planning-consumption-2026-06-06.json';

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
  artifact.artifact_type === 'agent10_old_dictionary_78_row_zero_text_package_planning_consumption',
  'artifact_type mismatch',
);
expect(
  artifact.status === 'agent6_warn_accepted_zero_text_package_planning_consumed_and_materialized',
  'status mismatch',
);
expect(
  artifact.target_package === 'old-dictionary-commercial-clean-78-row-zero-text-candidate-use-package-planning',
  'target package mismatch',
);

const files = artifact.files_used || {};
const expectedFiles = {
  agent6_zero_text_verdict: 'reports/agent6-old-dictionary-78-row-zero-text-candidate-use-package-verdict-2026-06-06.json',
  materialized_package: 'reports/agent10-old-dictionary-78-row-zero-text-candidate-use-package-planning-2026-06-06.json',
  builder: 'scripts/build_agent10_old_dictionary_78_row_zero_text_candidate_use_package.mjs',
  validator: 'scripts/validate_agent10_old_dictionary_78_row_zero_text_candidate_use_package.mjs',
};
for (const [key, path] of Object.entries(expectedFiles)) {
  expect(files[key] === path, `files_used.${key} mismatch`);
  expect(fs.existsSync(path), `referenced file missing: ${path}`);
}

const verdict = readJson(files.agent6_zero_text_verdict);
const pkg = readJson(files.materialized_package);

expect(
  verdict.artifact_type === 'agent6_old_dictionary_78_row_zero_text_candidate_use_package_verdict',
  'Agent6 verdict artifact_type mismatch',
);
expect(
  verdict.disposition === 'warn_accepted_nonpublic_zero_text_candidate_use_package_planning_artifact_only',
  'Agent6 verdict disposition mismatch',
);
expect(
  pkg.artifact_type === 'agent10_old_dictionary_78_row_zero_text_candidate_use_package_planning',
  'materialized package artifact_type mismatch',
);

const state = artifact.package_state || {};
expect(state.rows === 78, 'package rows must be 78');
expect(state.occurrences === 1461, 'package occurrences must be 1461');
expect(state.unique_queue_ids === 78, 'unique queue IDs must be 78');
expect(state.unique_token_ids === 78, 'unique token IDs must be 78');
expect(state.source_license_lane === 'commercial_clean_candidate', 'source lane mismatch');
expect(pkg.counts?.rows === state.rows, 'materialized package row count mismatch');
expect(pkg.counts?.occurrences === state.occurrences, 'materialized package occurrence count mismatch');
expect(verdict.recounted_scope?.rows === state.rows, 'verdict row count mismatch');
expect(verdict.recounted_scope?.occurrences === state.occurrences, 'verdict occurrence count mismatch');

const zeroFields = [
  'candidate_text_rows',
  'definition_candidate_rows',
  'lemma_candidate_rows',
  'reader_hint_candidate_rows',
  'answer_eligible_rows',
  'public_emit_rows',
  'route_writes',
  'accepted_text_rows',
  'public_runtime_mutation',
  'export_rows',
  'release_actions',
];
for (const field of zeroFields) {
  expect(state[field] === 0, `package_state.${field} must be 0`);
}

const decision = artifact.release_package_decision || {};
expect(
  decision.may_carry_forward_as_nonpublic_zero_text_candidate_use_package_planning === true,
  'may carry forward flag mismatch',
);
for (const field of [
  'transform_output_authorized',
  'candidate_text_authorized',
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

const lanes = new Map((artifact.agent1_4_inputs_consumed || []).map((row) => [row.lane, row]));
expect(lanes.get('Agent 1')?.input === 'reports/agent1-old-dictionary-agent2-transform-lane-handoff-2026-06-04.json', 'Agent 1 input mismatch');
expect(lanes.get('Agent 2')?.input === 'reports/agent2-old-dictionary-commercial-clean-morphology-relation-matrix-2026-06-05.json', 'Agent 2 input mismatch');
expect(lanes.get('Agent 3')?.input === null, 'Agent 3 input must be null');
expect(lanes.get('Agent 4')?.input === null, 'Agent 4 input must be null');
expect(lanes.get('Agent 6')?.input === files.agent6_zero_text_verdict, 'Agent 6 input mismatch');

expect(
  artifact.exact_blocker === 'next_transform_output_or_candidate_text_boundary_not_supplied',
  'exact blocker mismatch',
);
expect(
  artifact.next_agent6_boundary_need?.includes('new exact Agent 6 packet'),
  'next Agent6 boundary need mismatch',
);
expect(artifact.stop_condition?.includes('Do not mutate public/runtime files'), 'stop condition mismatch');

console.log(
  `Agent10 zero-text package planning consumption validation passed. Rows: ${state.rows}; occurrences: ${state.occurrences}; blocker: ${artifact.exact_blocker}.`,
);
