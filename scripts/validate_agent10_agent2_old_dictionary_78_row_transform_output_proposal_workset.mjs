#!/usr/bin/env node
import fs from 'node:fs';

const worksetPath =
  process.argv[2] ||
  'reports/agent10-agent2-ready-old-dictionary-78-row-transform-output-proposal-workset-2026-06-06.json';
const handoffPath =
  process.argv[3] ||
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

const workset = readJson(worksetPath);
const handoff = readJson(handoffPath);

expect(
  workset.artifact_type === 'agent10_agent2_ready_old_dictionary_78_row_transform_output_proposal_workset',
  'workset artifact_type mismatch',
);
expect(
  handoff.artifact_type === 'agent10_agent2_old_dictionary_78_row_transform_output_proposal_workset_handoff',
  'handoff artifact_type mismatch',
);
expect(
  workset.target_package === 'old-dictionary-commercial-clean-78-row-transform-output-proposal-preboundary',
  'workset target mismatch',
);
expect(handoff.target_package === workset.target_package, 'handoff target mismatch');
expect(
  workset.status === 'ready_for_agent2_transform_output_proposal_matrix_or_exact_blocker',
  'workset status mismatch',
);

const expectedFiles = {
  zero_text_package_planning_anchor:
    'reports/agent10-old-dictionary-78-row-zero-text-candidate-use-package-planning-2026-06-06.json',
  agent10_zero_text_consumption:
    'reports/agent10-old-dictionary-78-row-zero-text-package-planning-consumption-2026-06-06.json',
  agent6_zero_text_verdict:
    'reports/agent6-old-dictionary-78-row-zero-text-candidate-use-package-verdict-2026-06-06.json',
  preboundary_matrix: 'reports/agent10-old-dictionary-78-row-candidate-use-preboundary-matrix-2026-06-06.json',
  agent2_morphology_matrix: 'reports/agent2-old-dictionary-commercial-clean-morphology-relation-matrix-2026-06-05.json',
  agent1_source_lane_handoff: 'reports/agent1-old-dictionary-agent2-transform-lane-handoff-2026-06-04.json',
};

for (const [key, path] of Object.entries(expectedFiles)) {
  expect(workset.files_used?.[key] === path, `workset files_used.${key} mismatch`);
  expect(fs.existsSync(path), `referenced workset input missing: ${path}`);
}
for (const key of ['zero_text_package_planning_anchor', 'agent10_zero_text_consumption', 'agent6_zero_text_verdict']) {
  expect(handoff.files_used?.[key] === expectedFiles[key], `handoff files_used.${key} mismatch`);
}
expect(
  handoff.workset_artifacts?.includes(worksetPath.replaceAll('\\', '/')) ||
    handoff.workset_artifacts?.includes(worksetPath),
  'handoff must reference workset JSON',
);

const zeroTextPackage = readJson(expectedFiles.zero_text_package_planning_anchor);
const zeroTextConsumption = readJson(expectedFiles.agent10_zero_text_consumption);
const zeroTextVerdict = readJson(expectedFiles.agent6_zero_text_verdict);
const matrix = readJson(expectedFiles.preboundary_matrix);

expect(
  zeroTextPackage.artifact_type === 'agent10_old_dictionary_78_row_zero_text_candidate_use_package_planning',
  'zero-text package artifact_type mismatch',
);
expect(
  zeroTextConsumption.artifact_type === 'agent10_old_dictionary_78_row_zero_text_package_planning_consumption',
  'zero-text consumption artifact_type mismatch',
);
expect(
  zeroTextVerdict.artifact_type === 'agent6_old_dictionary_78_row_zero_text_candidate_use_package_verdict',
  'zero-text verdict artifact_type mismatch',
);
expect(
  zeroTextVerdict.disposition === 'warn_accepted_nonpublic_zero_text_candidate_use_package_planning_artifact_only',
  'zero-text verdict disposition mismatch',
);

const boundary = workset.current_boundary || {};
expect(boundary.agent6_disposition === zeroTextVerdict.disposition, 'current boundary disposition mismatch');
expect(boundary.rows === 78, 'current boundary rows must be 78');
expect(boundary.occurrences === 1461, 'current boundary occurrences must be 1461');
expect(boundary.source_license_lane === 'commercial_clean_candidate', 'current boundary lane mismatch');
expect(boundary.relation_class === 'exact_after_mark_strip', 'current boundary relation class mismatch');
expect(
  boundary.morphology_relation_status === 'agent2_morphology_relation_approved_for_nonpublic_planning',
  'current boundary morphology status mismatch',
);
expect(matrix.counts?.rows === boundary.rows, 'matrix rows mismatch');
expect(matrix.counts?.occurrences === boundary.occurrences, 'matrix occurrences mismatch');
expect(zeroTextPackage.counts?.rows === boundary.rows, 'zero-text package rows mismatch');
expect(zeroTextPackage.counts?.occurrences === boundary.occurrences, 'zero-text package occurrences mismatch');
expect(zeroTextConsumption.package_state?.rows === boundary.rows, 'zero-text consumption rows mismatch');
expect(zeroTextConsumption.package_state?.occurrences === boundary.occurrences, 'zero-text consumption occurrences mismatch');

const zeroFields = [
  'candidate_text_rows',
  'definition_lemma_reader_hint_rows',
  'answer_eligible_rows',
  'public_emit_rows',
  'route_writes',
  'accepted_text_rows',
  'export_rows',
  'release_actions',
];
for (const field of zeroFields) {
  expect(boundary[field] === 0, `current_boundary.${field} must be 0`);
}

const returns = workset.agent2_required_return || {};
expect(
  returns.allowed_return_types?.includes('compact_nonpublic_transform_output_proposal_matrix_for_exact_78_queue_ids'),
  'missing allowed proposal matrix return type',
);
expect(returns.allowed_return_types?.includes('missing_pipeline_blocker'), 'missing blocker return type');

const requiredFields = [
  'queue_id',
  'token_id',
  'lexicon_entry_id',
  'occurrences',
  'source_license_lane',
  'relation_class',
  'morphology_relation_status',
  'proposed_transform_kind',
  'proposed_candidate_text',
  'proposed_definition_text',
  'proposed_lemma_text',
  'proposed_reader_hint_text',
  'source_rids',
  'source_headwords',
  'source_family_hits',
  'source_citation_or_url',
  'attribution_required',
  'derived_from_nc',
  'commercial_export_allowed',
  'corpus_contamination',
  'answer_eligible',
  'public_emit',
  'route_writes',
  'accepted_text',
  'agent6_boundary_required',
  'exact_agent6_question',
];
for (const field of requiredFields) {
  expect(returns.required_fields_if_matrix?.includes(field), `missing required matrix field: ${field}`);
}

const rules = returns.required_rules || {};
expect(rules.rows === 78, 'required rule rows mismatch');
expect(rules.occurrences === 1461, 'required rule occurrences mismatch');
expect(rules.source_license_lane === 'commercial_clean_candidate', 'required rule lane mismatch');
expect(rules.relation_class === 'exact_after_mark_strip', 'required rule relation class mismatch');
expect(
  rules.morphology_relation_status === 'agent2_morphology_relation_approved_for_nonpublic_planning',
  'required rule morphology status mismatch',
);
for (const [key, expected] of [
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
  expect(rules[key] === expected, `required rule ${key} mismatch`);
}

expect(
  returns.text_field_boundary?.includes('proposal fields only'),
  'text field boundary must keep proposed text non-accepted',
);
expect(
  workset.agent6_boundary_question_to_prepare?.includes('non-public proposal evidence only'),
  'Agent6 boundary question scope mismatch',
);
expect(
  workset.exact_blocker_if_unavailable === 'missing_transform_output_proposal_matrix_or_exact_transform_rule',
  'workset exact blocker mismatch',
);
expect(
  handoff.current_blocker === 'next_transform_output_or_candidate_text_boundary_not_supplied',
  'handoff current blocker mismatch',
);
expect(handoff.delivery_state?.live_delivered_from_this_session === false, 'handoff live delivery flag mismatch');
expect(
  handoff.delivery_state?.route_blocker === 'missing_current_agent2_thread_route_for_live_delivery',
  'handoff route blocker mismatch',
);
expect(workset.stop_condition?.includes('Do not mutate public/runtime files'), 'workset stop condition mismatch');
expect(handoff.stop_condition?.includes('Do not mutate public/runtime files'), 'handoff stop condition mismatch');

console.log(
  `Agent10 Agent2 transform-output proposal workset validation passed. Rows: ${boundary.rows}; occurrences: ${boundary.occurrences}; route blocker: ${handoff.delivery_state.route_blocker}.`,
);
