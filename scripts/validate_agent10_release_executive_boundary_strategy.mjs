#!/usr/bin/env node
import fs from 'node:fs';

const artifactPath =
  process.argv[2] || 'reports/agent10-release-executive-boundary-strategy-2026-06-05.json';

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

expect(artifact.artifact_type === 'agent10_release_executive_boundary_strategy', 'unexpected artifact_type');
expect(artifact.release_owner === 'Agent 10', 'release_owner must be Agent 10');
expect(artifact.posture === 'direct_release_package_decision_mode', 'unexpected posture');

const sourceOwner = artifact.current_source_lane_owner || {};
expect(sourceOwner.label === 'Agent 1 - importer', 'current source lane owner must be Agent 1 - importer');
expect(typeof sourceOwner.agent_id === 'string' && sourceOwner.agent_id.length > 0, 'source owner agent_id required');
expect(
  (sourceOwner.rule || '').includes('Agent 1 row/subset source-lane classification'),
  'source owner rule must preserve Agent 1 row/subset classification dependency'
);

const agent6 = artifact.agent6_channel_observation || {};
expect(agent6.latest_wait_result === 'not_found', 'Agent6 latest_wait_result must remain not_found');
expect(
  agent6.exact_blocker_for_new_direct_wait === 'agent6_known_thread_not_found_for_direct_wait',
  'Agent6 direct wait blocker must be preserved'
);

const rows = artifact.rows || [];
expect(Array.isArray(rows) && rows.length === 9, 'expected nine release strategy rows');
const requiredQuestions = [
  'Can Agent 2 move old-dictionary commercial-clean rows beyond transform-readiness planning?',
  'Can Workbench source-family/license-lane release-intake evidence be carried as non-public boundary planning evidence?',
  'Can Definition Workbench usage/navigation and CC-BY/CC-BY-SA custody packets be carried as non-public planning evidence?',
  'Can Orot third-missed source-family rows move beyond planning evidence?',
  "Does Agent 4's Orot 205-row gate proof open a new release/package action?",
  'Is the Workbench token-source partition edge aggregate ready for Agent 6 boundary routing?',
  'Can Agent 3 crossmatch inventory be used as the next clean navigation baseline?',
  'What release/package truth must Agent 6 repo-cleaning and validation pipelines preserve?',
  'What is the next source-lane gate for new Agent 2 transform work?',
];

for (const question of requiredQuestions) {
  expect(rows.some((row) => row.release_question === question), `missing release_question: ${question}`);
}

for (const row of rows) {
  expect(row.release_question, 'each row needs release_question');
  expect(row.current_package_boundary_state, `${row.release_question} missing current_package_boundary_state`);
  expect(row.agent6_route_needed, `${row.release_question} missing agent6_route_needed`);
  expect(row.agent5_preservation_handoff, `${row.release_question} missing agent5_preservation_handoff`);
  expect(row.exact_blocker, `${row.release_question} missing exact_blocker`);
  expect(row.stop_condition, `${row.release_question} missing stop_condition`);
}

for (const blocker of [
  'missing_exact_row_subset_candidate_use_package',
  'await_agent6_verdict_for_workbench_source_family_license_lane_release_intake',
  'await_agent6_verdict_for_definition_workbench_usage_navigation_cc_by_sa_cc_by_packets',
  'planning_only_boundary_remains_for_orot_third_missed',
  'workbench_token_source_partition_edge_aggregate_count_instability',
  'missing_current_agent1_row_subset_source_lane_classification_for_new_transform_work',
]) {
  expect(rows.some((row) => (row.exact_blocker || '').includes(blocker)), `missing blocker: ${blocker}`);
}

const zero = artifact.zero_counters || {};
for (const key of [
  'public_runtime_mutation',
  'route_shard_writes',
  'route_jsonl_rows',
  'candidate_text_export_rows',
  'definition_content_rows',
  'answer_rows',
  'answer_eligible_rows',
  'accepted_text_rows',
  'public_reader_output_rows',
]) {
  expect(zero[key] === 0, `${key} must be 0`);
}

for (const forbidden of [
  'QA acceptance',
  'source/provenance acceptance',
  'license/legal acceptance',
  'Definition authority',
  'usage-as-definition authority',
  'answer acceptance',
  'answer eligibility',
  'public/runtime acceptance',
  'publication readiness',
  'route publication support',
  'product/data acceptance',
  'translation output',
  'accepted gloss/text',
  'public reader output',
  'route-shard edit',
  'public/runtime mutation',
  'candidate text export',
  'definition-content storage',
  'commercial export authorization',
  'release action',
]) {
  expect((artifact.forbidden_claims || []).includes(forbidden), `missing forbidden claim: ${forbidden}`);
}

console.log(
  `Agent10 release executive boundary strategy validation passed. ` +
    `Rows: ${rows.length}; zero counters checked: ${Object.keys(zero).length}; ` +
    `Agent6 wait result: ${agent6.latest_wait_result}.`
);
