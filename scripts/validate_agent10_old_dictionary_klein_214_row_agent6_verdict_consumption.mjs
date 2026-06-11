#!/usr/bin/env node
import fs from 'node:fs';

const artifactPath =
  process.argv[2] || 'reports/agent10-old-dictionary-klein-214-row-agent6-verdict-consumption-2026-06-06.json';

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
  artifact.artifact_type === 'agent10_old_dictionary_klein_214_row_agent6_verdict_consumption',
  'artifact_type mismatch',
);
expect(
  artifact.target_package === 'old-dictionary-klein-214-row-noncommercial-educational-lane-planning',
  'target package mismatch',
);
expect(
  artifact.status === 'agent6_warn_accepted_nc_lane_planning_consumed_no_use_beyond_planning',
  'status mismatch',
);

const files = artifact.files_used || {};
const expectedFiles = {
  agent6_verdict: 'reports/agent6-old-dictionary-klein-214-row-nc-lane-planning-verdict-2026-06-06.json',
  agent10_packet: 'reports/agent10-agent6-ready-old-dictionary-klein-214-row-nc-lane-planning-boundary-packet-2026-06-06.json',
  agent1_nc_lane_evidence: 'reports/agent1-old-dictionary-klein-nc-lane-preservation-2026-06-05.json',
  agent2_nc_lane_receipt: 'reports/agent2-klein-nc-lane-preservation-receipt-2026-06-05.json',
};
for (const [key, path] of Object.entries(expectedFiles)) {
  expect(files[key] === path, `files_used.${key} mismatch`);
  expect(fs.existsSync(path), `referenced file missing: ${path}`);
}

const verdict = readJson(files.agent6_verdict);
const packet = readJson(files.agent10_packet);
const agent1 = readJson(files.agent1_nc_lane_evidence);
const agent2 = readJson(files.agent2_nc_lane_receipt);

expect(
  verdict.artifact_type === 'agent6_old_dictionary_klein_214_row_nc_lane_planning_verdict',
  'Agent6 verdict artifact_type mismatch',
);
expect(
  packet.artifact_type === 'agent10_agent6_ready_old_dictionary_klein_214_row_nc_lane_planning_boundary_packet',
  'Agent10 packet artifact_type mismatch',
);
expect(
  agent1.artifact_type === 'agent1_old_dictionary_klein_nc_lane_preservation',
  'Agent1 Klein artifact_type mismatch',
);
expect(
  agent2.artifact_type === 'agent2_klein_nc_lane_preservation_receipt',
  'Agent2 Klein receipt artifact_type mismatch',
);

const consumed = artifact.agent6_verdict_consumed || {};
expect(
  consumed.disposition ===
    'warn_accepted_separate_nonpublic_noncommercial_educational_candidate_lane_planning_evidence_only',
  'consumed disposition mismatch',
);
expect(
  consumed.effective_boundary ===
    'exact_214_row_4444_occurrence_old_dictionary_klein_subset_as_separate_nonpublic_noncommercial_educational_candidate_lane_planning_evidence_only',
  'consumed effective boundary mismatch',
);
expect(consumed.old_dictionary_klein_subset_rows === 214, 'consumed rows must be 214');
expect(consumed.old_dictionary_klein_subset_occurrences === 4444, 'consumed occurrences must be 4444');
expect(consumed.prior_orot_nc_klein_package_rows === 17, 'prior Orot rows must be 17');
expect(consumed.prior_orot_nc_klein_package_occurrences === 259, 'prior Orot occurrences must be 259');
expect(consumed.scopes_are_not_interchangeable === true, 'scope distinction must be true');
expect(consumed.license_lane === 'noncommercial_educational_candidate', 'license lane mismatch');
expect(consumed.derived_from_nc === true, 'derived_from_nc mismatch');
expect(consumed.commercial_export_allowed === false, 'commercial export flag mismatch');
expect(consumed.attribution_required === true, 'attribution flag mismatch');
expect(consumed.corpus_contamination === false, 'corpus contamination flag mismatch');

expect(verdict.recounted_scope?.old_dictionary_klein_subset_rows === consumed.old_dictionary_klein_subset_rows, 'verdict rows mismatch');
expect(
  verdict.recounted_scope?.old_dictionary_klein_subset_occurrences ===
    consumed.old_dictionary_klein_subset_occurrences,
  'verdict occurrences mismatch',
);
expect(packet.requested_boundary?.rows === consumed.old_dictionary_klein_subset_rows, 'packet rows mismatch');
expect(packet.requested_boundary?.occurrences === consumed.old_dictionary_klein_subset_occurrences, 'packet occurrences mismatch');
expect(
  agent1.scope_boundary?.old_dictionary_klein_subset_rows === consumed.old_dictionary_klein_subset_rows,
  'Agent1 scope rows mismatch',
);
expect(
  agent1.scope_boundary?.old_dictionary_klein_subset_occurrences ===
    consumed.old_dictionary_klein_subset_occurrences,
  'Agent1 scope occurrences mismatch',
);
expect(agent1.source_family?.rows === consumed.old_dictionary_klein_subset_rows, 'Agent1 source-family rows mismatch');
expect(
  agent1.source_family?.occurrences === consumed.old_dictionary_klein_subset_occurrences,
  'Agent1 source-family occurrences mismatch',
);
expect(agent2.scope_boundary?.old_dictionary_klein_subset_rows === consumed.old_dictionary_klein_subset_rows, 'Agent2 scope rows mismatch');
expect(
  agent2.scope_boundary?.old_dictionary_klein_subset_occurrences ===
    consumed.old_dictionary_klein_subset_occurrences,
  'Agent2 scope occurrences mismatch',
);

const decision = artifact.release_package_decision || {};
expect(
  decision.may_carry_forward_as_separate_nonpublic_nc_educational_lane_planning_evidence === true,
  'may carry forward flag mismatch',
);
for (const field of [
  'nc_display_authorized',
  'nc_definition_content_storage_authorized',
  'transform_output_authorized',
  'candidate_text_authorized',
  'answer_eligibility_authorized',
  'public_runtime_mutation_authorized',
  'export_authorized',
  'commercial_use_authorized',
  'accepted_text_authorized',
  'publication_readiness_authorized',
  'release_action_authorized',
]) {
  expect(decision[field] === false, `release decision ${field} must be false`);
}

expect(
  artifact.next_boundary ===
    'owner_license_policy_boundary_plus_new_exact_agent6_docket_required_before_nc_display_storage_transform_candidate_text_answer_eligibility_public_runtime_export_commercial_use_or_release',
  'next boundary mismatch',
);
expect(
  artifact.exact_blocker === 'owner_license_policy_boundary_required_before_any_klein_nc_use_beyond_nonpublic_lane_planning',
  'exact blocker mismatch',
);
expect(artifact.stop_condition?.includes('Do not mutate public/runtime files'), 'stop condition mismatch');

console.log(
  `Agent10 Klein 214-row Agent6 verdict consumption validation passed. Rows: ${consumed.old_dictionary_klein_subset_rows}; occurrences: ${consumed.old_dictionary_klein_subset_occurrences}; blocker: ${artifact.exact_blocker}.`,
);
