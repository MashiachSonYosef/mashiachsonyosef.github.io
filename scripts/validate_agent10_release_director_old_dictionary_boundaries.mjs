#!/usr/bin/env node
import fs from 'node:fs';

const directorPath =
  process.argv[2] || 'reports/agent10-release-director-state-old-dictionary-boundaries-2026-06-06.json';

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

const director = readJson(directorPath);

expect(
  director.artifact_type === 'agent10_release_director_state_old_dictionary_boundaries',
  'director artifact_type mismatch',
);
expect(director.active_mode === 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE', 'active mode mismatch');
expect(Array.isArray(director.release_questions) && director.release_questions.length === 2, 'expected two release questions');

const kleinQuestion = director.release_questions.find((row) =>
  row.release_question?.includes('214-row Klein'),
);
const transformQuestion = director.release_questions.find((row) =>
  row.release_question?.includes('78-row commercial-clean'),
);
expect(kleinQuestion, 'missing Klein release question');
expect(transformQuestion, 'missing transform-output release question');

const kleinState = kleinQuestion.current_package_boundary_state || {};
const expectedKlein = {
  routed_packet: 'reports/agent10-agent6-ready-old-dictionary-klein-214-row-nc-lane-planning-boundary-packet-2026-06-06.json',
  agent6_verdict: 'reports/agent6-old-dictionary-klein-214-row-nc-lane-planning-verdict-2026-06-06.json',
  agent10_consumption: 'reports/agent10-old-dictionary-klein-214-row-agent6-verdict-consumption-2026-06-06.json',
};
for (const [key, path] of Object.entries(expectedKlein)) {
  expect(kleinState[key] === path, `Klein state ${key} mismatch`);
  expect(fs.existsSync(path), `Klein referenced file missing: ${path}`);
}
expect(kleinState.agent6_submission_id === '019e9a29-7305-7871-bbde-1c243765e798', 'Klein submission id mismatch');
expect(kleinState.agent6_verdict_found_now === true, 'Klein verdict found flag mismatch');
expect(
  kleinQuestion.agent6_route_needed === 'no_new_route_until_owner_license_policy_boundary_and_next_exact_nc_use_packet',
  'Klein route-needed mismatch',
);
expect(
  kleinQuestion.agent5_preservation_handoff ===
    'reports/agent10-agent5-handoff-old-dictionary-klein-214-row-nc-boundary-route-2026-06-06.json',
  'Klein Agent5 handoff mismatch',
);
expect(
  kleinQuestion.exact_blocker ===
    'owner_license_policy_boundary_required_before_any_klein_nc_use_beyond_nonpublic_lane_planning',
  'Klein blocker mismatch',
);

const kleinConsumption = readJson(kleinState.agent10_consumption);
expect(
  kleinConsumption.exact_blocker === kleinQuestion.exact_blocker,
  'Klein consumption/director blocker mismatch',
);
expect(
  kleinConsumption.agent6_verdict_consumed?.old_dictionary_klein_subset_rows === 214,
  'Klein consumption rows mismatch',
);
expect(
  kleinConsumption.agent6_verdict_consumed?.old_dictionary_klein_subset_occurrences === 4444,
  'Klein consumption occurrences mismatch',
);

const transformState = transformQuestion.current_package_boundary_state || {};
const expectedTransform = {
  agent6_zero_text_verdict: 'reports/agent6-old-dictionary-78-row-zero-text-candidate-use-package-verdict-2026-06-06.json',
  materialized_package: 'reports/agent10-old-dictionary-78-row-zero-text-candidate-use-package-planning-2026-06-06.json',
  agent2_workset: 'reports/agent10-agent2-ready-old-dictionary-78-row-transform-output-proposal-workset-2026-06-06.json',
  agent2_blocker: 'reports/agent2-old-dictionary-78-row-transform-output-proposal-missing-pipeline-blocker-2026-06-06.json',
  agent10_blocker_consumption: 'reports/agent10-old-dictionary-78-row-agent2-transform-output-blocker-consumption-2026-06-06.json',
};
for (const [key, path] of Object.entries(expectedTransform)) {
  expect(transformState[key] === path, `transform state ${key} mismatch`);
  expect(fs.existsSync(path), `transform referenced file missing: ${path}`);
}
expect(transformState.transform_output_authorized === false, 'transform output must not be authorized');
expect(transformState.candidate_text_authorized === false, 'candidate text must not be authorized');
expect(
  transformQuestion.agent6_route_needed ===
    'not_until_source_citation_or_url_and_exact_transform_rule_exist_or_narrowed_no_text_question_is_selected',
  'transform route-needed mismatch',
);
expect(
  transformQuestion.exact_blocker === 'stale_agent1_registry_target_current_agent1_thread_required',
  'transform blocker mismatch',
);
expect(
  transformQuestion.agent5_preservation_handoff ===
    'reports/agent10-agent5-handoff-old-dictionary-78-row-agent1-route-blocker-2026-06-06.json',
  'transform handoff must cite Agent5 Agent1-route blocker handoff',
);

const workset = readJson(expectedTransform.agent2_workset);
const agent2Blocker = readJson(expectedTransform.agent2_blocker);
const blockerConsumption = readJson(expectedTransform.agent10_blocker_consumption);
expect(
  workset.artifact_type === 'agent10_agent2_ready_old_dictionary_78_row_transform_output_proposal_workset',
  'transform workset artifact_type mismatch',
);
expect(
  agent2Blocker.artifact_type === 'agent2_old_dictionary_78_row_transform_output_proposal_missing_pipeline_blocker',
  'Agent2 blocker artifact_type mismatch',
);
expect(
  blockerConsumption.artifact_type === 'agent10_old_dictionary_78_row_agent2_transform_output_blocker_consumption',
  'Agent10 blocker consumption artifact_type mismatch',
);
expect(
  workset.exact_blocker_if_unavailable === 'missing_transform_output_proposal_matrix_or_exact_transform_rule',
  'transform workset unavailable blocker mismatch',
);
expect(
  blockerConsumption.exact_current_blocker ===
    'missing_source_citation_or_url_and_exact_transform_output_rule_for_78_row_packet',
  'Agent10 blocker consumption current blocker mismatch',
);

const zero = director.preserved_zero_counters || {};
for (const [key, value] of Object.entries(zero)) {
  expect(value === 0, `director preserved_zero_counters.${key} must be 0`);
}

for (const forbidden of [
  'no_QA_acceptance',
  'no_source_provenance_acceptance',
  'no_source_license_legal_acceptance',
  'no_Definition_authority',
  'no_answer_eligibility',
  'no_public_runtime_mutation',
  'no_publication_readiness',
  'no_release_action',
]) {
  expect(director.non_acceptance_boundary?.includes(forbidden), `missing non-acceptance boundary ${forbidden}`);
}

console.log(
  `Agent10 release director old-dictionary boundaries validation passed. Klein blocker: ${kleinQuestion.exact_blocker}; transform blocker: ${transformQuestion.exact_blocker}.`,
);
