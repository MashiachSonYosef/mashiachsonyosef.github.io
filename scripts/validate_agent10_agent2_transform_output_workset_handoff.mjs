#!/usr/bin/env node
import fs from 'node:fs';

const handoffPath =
  process.argv[2] ||
  'reports/agent10-agent2-old-dictionary-78-row-transform-output-proposal-workset-handoff-2026-06-06.json';

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

const handoff = readJson(handoffPath);

expect(
  handoff.artifact_type === 'agent10_agent2_old_dictionary_78_row_transform_output_proposal_workset_handoff',
  'artifact_type mismatch',
);
expect(handoff.active_mode === 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE', 'active mode mismatch');
expect(
  handoff.target_package === 'old-dictionary-commercial-clean-78-row-transform-output-proposal-preboundary',
  'target package mismatch',
);

for (const path of [
  'reports/agent10-agent2-ready-old-dictionary-78-row-transform-output-proposal-workset-2026-06-06.json',
  'reports/agent10-old-dictionary-78-row-zero-text-candidate-use-package-planning-2026-06-06.json',
  'reports/agent10-old-dictionary-78-row-zero-text-package-planning-consumption-2026-06-06.json',
  'reports/agent6-old-dictionary-78-row-zero-text-candidate-use-package-verdict-2026-06-06.json',
]) {
  expect(fs.existsSync(path), `referenced file missing: ${path}`);
}

expect(
  handoff.workset_artifacts?.includes(
    'reports/agent10-agent2-ready-old-dictionary-78-row-transform-output-proposal-workset-2026-06-06.json',
  ),
  'workset JSON missing from workset_artifacts',
);

const files = handoff.files_used || {};
expect(
  files.zero_text_package_planning_anchor ===
    'reports/agent10-old-dictionary-78-row-zero-text-candidate-use-package-planning-2026-06-06.json',
  'zero_text_package_planning_anchor mismatch',
);
expect(
  files.agent10_zero_text_consumption ===
    'reports/agent10-old-dictionary-78-row-zero-text-package-planning-consumption-2026-06-06.json',
  'agent10_zero_text_consumption mismatch',
);
expect(
  files.agent6_zero_text_verdict ===
    'reports/agent6-old-dictionary-78-row-zero-text-candidate-use-package-verdict-2026-06-06.json',
  'agent6_zero_text_verdict mismatch',
);

const workset = readJson('reports/agent10-agent2-ready-old-dictionary-78-row-transform-output-proposal-workset-2026-06-06.json');
expect(
  workset.artifact_type === 'agent10_agent2_ready_old_dictionary_78_row_transform_output_proposal_workset',
  'workset artifact_type mismatch',
);

const boundary = handoff.current_boundary || {};
expect(boundary.rows === 78, 'boundary rows must be 78');
expect(boundary.occurrences === 1461, 'boundary occurrences must be 1461');
expect(
  boundary.allowed_status === 'nonpublic_zero_text_candidate_use_package_planning_only',
  'allowed_status mismatch',
);
expect(workset.current_boundary?.rows === boundary.rows, 'workset rows mismatch');
expect(workset.current_boundary?.occurrences === boundary.occurrences, 'workset occurrences mismatch');

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
  expect(boundary[field] === 0, `current_boundary.${field} must be 0`);
}

expect(handoff.current_blocker === 'next_transform_output_or_candidate_text_boundary_not_supplied', 'current blocker mismatch');
expect(handoff.handoff_need?.owner === 'Agent 2', 'handoff owner mismatch');
expect(
  handoff.handoff_need?.allowed_returns?.includes('compact_nonpublic_transform_output_proposal_matrix_for_exact_78_queue_ids'),
  'missing matrix allowed return',
);
expect(handoff.handoff_need?.allowed_returns?.includes('missing_pipeline_blocker'), 'missing blocker allowed return');
expect(
  handoff.handoff_need?.exact_blocker_if_no_live_route === 'missing_current_agent2_thread_route_for_live_delivery',
  'missing no-live-route blocker',
);
expect(handoff.delivery_state?.live_delivered_from_this_session === false, 'delivery state must be false');
expect(
  handoff.delivery_state?.route_blocker === 'missing_current_agent2_thread_route_for_live_delivery',
  'delivery route blocker mismatch',
);
expect(handoff.stop_condition?.includes('Do not mutate public/runtime files'), 'stop condition must block runtime mutation');

for (const forbidden of [
  'QA acceptance',
  'source/provenance acceptance',
  'source/license/legal acceptance',
  'Definition authority',
  'usage-as-definition authority',
  'answer acceptance',
  'answer eligibility',
  'accepted gloss/text',
  'public reader output',
  'route-shard edit',
  'public/runtime mutation',
  'route publication support',
  'publication readiness',
  'product/data acceptance',
  'commercial export authorization',
  'NC commercial authorization',
  'release action',
]) {
  expect((handoff.what_must_not_be_accepted || []).includes(forbidden), `missing forbidden claim: ${forbidden}`);
}

console.log(
  `Agent10 Agent2 transform-output workset handoff validation passed. Rows: ${boundary.rows}; occurrences: ${boundary.occurrences}; blocker: ${handoff.current_blocker}.`,
);
