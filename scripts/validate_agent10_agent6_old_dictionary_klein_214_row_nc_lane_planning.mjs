#!/usr/bin/env node
import fs from 'node:fs';

const packetPath =
  process.argv[2] ||
  'reports/agent10-agent6-ready-old-dictionary-klein-214-row-nc-lane-planning-boundary-packet-2026-06-06.json';
const verdictPath =
  process.argv[3] || 'reports/agent6-old-dictionary-klein-214-row-nc-lane-planning-verdict-2026-06-06.json';
const handoffPath =
  process.argv[4] || 'reports/agent10-agent5-handoff-old-dictionary-klein-214-row-nc-boundary-route-2026-06-06.json';

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

const packet = readJson(packetPath);
const verdict = readJson(verdictPath);
const handoff = readJson(handoffPath);

expect(
  packet.artifact_type === 'agent10_agent6_ready_old_dictionary_klein_214_row_nc_lane_planning_boundary_packet',
  'packet artifact_type mismatch',
);
expect(
  verdict.artifact_type === 'agent6_old_dictionary_klein_214_row_nc_lane_planning_verdict',
  'verdict artifact_type mismatch',
);
expect(
  handoff.artifact_type === 'agent10_agent5_handoff_old_dictionary_klein_214_row_nc_boundary_route',
  'handoff artifact_type mismatch',
);
expect(
  packet.target_package === 'old-dictionary-klein-214-row-noncommercial-educational-lane-planning',
  'packet target mismatch',
);
expect(packet.status === 'agent6_ready_exact_nc_lane_planning_boundary_packet', 'packet status mismatch');
expect(
  verdict.disposition ===
    'warn_accepted_separate_nonpublic_noncommercial_educational_candidate_lane_planning_evidence_only',
  'verdict disposition mismatch',
);

const expectedFiles = {
  agent1_klein_nc_lane_preservation: 'reports/agent1-old-dictionary-klein-nc-lane-preservation-2026-06-05.json',
  agent1_klein_nc_lane_preservation_validation:
    'reports/agent1-old-dictionary-klein-nc-lane-preservation-validation-result-2026-06-05.json',
  agent2_klein_nc_lane_preservation_receipt: 'reports/agent2-klein-nc-lane-preservation-receipt-2026-06-05.json',
  agent1_transform_lane_handoff: 'reports/agent1-old-dictionary-agent2-transform-lane-handoff-2026-06-04.json',
  prior_17_row_nc_verdict: 'reports/agent6-orot-nc-klein-source-family-map-boundary-verdict-2026-06-04.md',
};
for (const [key, path] of Object.entries(expectedFiles)) {
  expect(packet.files_used?.[key] === path, `packet files_used.${key} mismatch`);
  expect(fs.existsSync(path), `referenced input missing: ${path}`);
}

const agent1 = readJson(expectedFiles.agent1_klein_nc_lane_preservation);
const agent1Validation = readJson(expectedFiles.agent1_klein_nc_lane_preservation_validation);
const agent2 = readJson(expectedFiles.agent2_klein_nc_lane_preservation_receipt);
const transformHandoff = readJson(expectedFiles.agent1_transform_lane_handoff);

expect(
  agent1.artifact_type === 'agent1_old_dictionary_klein_nc_lane_preservation',
  'Agent1 Klein artifact_type mismatch',
);
expect(agent1Validation.ok === true, 'Agent1 Klein validation must be ok');
expect(
  agent2.artifact_type === 'agent2_klein_nc_lane_preservation_receipt',
  'Agent2 Klein receipt artifact_type mismatch',
);
expect(
  transformHandoff.artifact_type === 'agent1_old_dictionary_agent2_transform_lane_handoff',
  'transform lane handoff artifact_type mismatch',
);

const scope = packet.scope_boundary || {};
const requested = packet.requested_boundary || {};
const verdictScope = verdict.recounted_scope || {};
expect(scope.old_dictionary_klein_subset_rows === 214, 'packet old-dictionary rows must be 214');
expect(scope.old_dictionary_klein_subset_occurrences === 4444, 'packet old-dictionary occurrences must be 4444');
expect(scope.prior_orot_nc_klein_package_rows === 17, 'packet prior Orot rows must be 17');
expect(scope.prior_orot_nc_klein_package_occurrences === 259, 'packet prior Orot occurrences must be 259');
expect(scope.scopes_are_not_interchangeable === true, 'packet must mark scopes non-interchangeable');

expect(requested.rows === 214, 'requested rows must be 214');
expect(requested.occurrences === 4444, 'requested occurrences must be 4444');
expect(requested.license_lane === 'noncommercial_educational_candidate', 'requested lane mismatch');
expect(requested.derived_from_nc === true, 'requested derived_from_nc mismatch');
expect(requested.commercial_export_allowed === false, 'requested commercial export flag mismatch');
expect(requested.attribution_required === true, 'requested attribution flag mismatch');
expect(requested.corpus_contamination === false, 'requested corpus contamination flag mismatch');

expect(verdictScope.old_dictionary_klein_subset_rows === requested.rows, 'verdict row count mismatch');
expect(verdictScope.old_dictionary_klein_subset_occurrences === requested.occurrences, 'verdict occurrence count mismatch');
expect(verdictScope.prior_orot_nc_klein_package_rows === scope.prior_orot_nc_klein_package_rows, 'verdict prior rows mismatch');
expect(
  verdictScope.prior_orot_nc_klein_package_occurrences === scope.prior_orot_nc_klein_package_occurrences,
  'verdict prior occurrences mismatch',
);
expect(verdictScope.scopes_are_not_interchangeable === true, 'verdict must preserve scope distinction');
expect(verdictScope.source_family === 'Klein Dictionary', 'verdict source family mismatch');
expect(verdictScope.license_lane === requested.license_lane, 'verdict lane mismatch');
expect(verdictScope.license_label === 'CC-BY-NC', 'verdict license label mismatch');
expect(verdictScope.derived_from_nc === true, 'verdict derived_from_nc mismatch');
expect(verdictScope.commercial_export_allowed === false, 'verdict commercial export mismatch');
expect(verdictScope.attribution_required === true, 'verdict attribution mismatch');
expect(verdictScope.corpus_contamination === false, 'verdict corpus contamination mismatch');
expect(verdictScope.agent1_validation_ok === true, 'verdict Agent1 validation flag mismatch');

const zeroFields = [
  'allowed_transform_rows',
  'candidate_text_rows',
  'definition_content_rows',
  'lemma_content_rows',
  'reader_hint_content_rows',
  'answer_eligible_rows',
  'public_emit_rows',
  'route_writes',
  'accepted_text_rows',
  'public_runtime_mutation',
  'commercial_export_authorization_rows',
  'nc_commercial_authorization_rows',
  'release_actions',
];
for (const field of zeroFields) {
  expect(requested[field] === 0, `requested_boundary.${field} must be 0`);
}
for (const [section, values] of Object.entries(verdict.zero_counters_recounted_nonzero || {})) {
  expect(Array.isArray(values) && values.length === 0, `verdict zero counter nonzero list must be empty for ${section}`);
}

const lanes = new Map((packet.agent1_4_inputs_consumed || []).map((row) => [row.lane, row]));
expect(lanes.get('Agent 1')?.input === expectedFiles.agent1_klein_nc_lane_preservation, 'Agent 1 input mismatch');
expect(lanes.get('Agent 2')?.input === expectedFiles.agent2_klein_nc_lane_preservation_receipt, 'Agent 2 input mismatch');
expect(lanes.get('Agent 3')?.input === null, 'Agent 3 input must be null');
expect(lanes.get('Agent 4')?.input === null, 'Agent 4 input must be null');
expect(lanes.get('Agent 4')?.release_package_impact === 'no changed public/runtime package', 'Agent4 impact mismatch');

const blockers = [
  'commercial_export_authorization_blocked',
  'nc_commercial_authorization_blocked',
  'noncommercial_display_authorization_blocked',
  'nc_definition_content_storage_blocked',
  'transform_output_blocked',
  'answer_eligibility_blocked',
  'public_runtime_mutation_blocked',
  'later_nc_display_storage_export_public_answer_use_requires_owner_license_policy_boundary_and_exact_agent6_docket',
];
for (const blocker of blockers) {
  expect(packet.exact_blockers_preserved?.includes(blocker), `packet missing blocker: ${blocker}`);
  expect(verdict.preserved_blockers?.includes(blocker), `verdict missing blocker: ${blocker}`);
}
expect(
  verdict.preserved_blockers?.includes('klein_dictionary_scope_boundary_214_rows_not_same_as_prior_17_row_nc_package'),
  'verdict missing scope blocker',
);

expect(
  handoff.routed_packet?.includes(packetPath.replaceAll('\\', '/')) || handoff.routed_packet?.includes(packetPath),
  'handoff must route packet JSON',
);
expect(handoff.exact_blocker === 'awaiting_agent6_klein_214_row_nc_lane_planning_verdict', 'handoff blocker mismatch');
expect(handoff.stop_condition?.includes('Do not mutate public/runtime files'), 'handoff stop condition mismatch');
expect(packet.stop_condition?.includes('Do not mutate public/runtime files'), 'packet stop condition mismatch');
expect(
  verdict.next_required_boundary?.includes('owner_license_policy_boundary_plus_new_exact_agent6_docket_required'),
  'verdict next boundary mismatch',
);

console.log(
  `Agent10/Agent6 Klein 214-row NC lane planning validation passed. Rows: ${requested.rows}; occurrences: ${requested.occurrences}; prior Orot rows: ${scope.prior_orot_nc_klein_package_rows}.`,
);
