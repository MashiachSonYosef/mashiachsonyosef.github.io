#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packetPath = process.argv[2] || 'reports/agent10-agent6-ready-old-dictionary-commercial-clean-transform-enablement-boundary-packet-2026-06-05.json';
const packet = readJson(packetPath);
const issues = [];

expect(packet.artifact_type === 'agent10_agent6_ready_old_dictionary_commercial_clean_transform_enablement_boundary_packet', 'artifact_type mismatch');
expect(packet.review_scope === 'nonpublic_old_dictionary_transform_readiness_boundary_and_blocker_only', 'review_scope mismatch');
expect(packet.source_lane_owner?.agent_id === '019e975d-dc9f-7020-a7c8-885d083a837e', 'current Agent 1 source-lane owner missing');

const scope = packet.commercial_clean_scope || {};
expect(scope.count_semantics === 'source-family hit totals; not mutually exclusive export row counts', 'count semantics mismatch');
expect(scope.source_family_count === 3, 'commercial-clean source family count must be 3');
expect(scope.row_count === 500, 'commercial-clean row_count must be 500');
expect(scope.occurrence_count === 10940, 'commercial-clean occurrence_count must be 10940');
expect(Array.isArray(scope.subsets) && scope.subsets.length === 3, 'commercial-clean subsets must contain 3 rows');

const expectedSubsets = new Map([
  ['old-dictionary-excluded-row-license-lane-reaudit::jastrow-dictionary', [210, 4474]],
  ['old-dictionary-excluded-row-license-lane-reaudit::bdb-dictionary', [221, 4418]],
  ['old-dictionary-excluded-row-license-lane-reaudit::bdb-aramaic-dictionary', [69, 2048]],
]);
for (const subset of scope.subsets || []) {
  const expected = expectedSubsets.get(subset.row_subset_id);
  expect(Boolean(expected), `${subset.row_subset_id} unexpected commercial-clean subset`);
  expect(subset.license_lane === 'commercial_clean_candidate', `${subset.row_subset_id} license lane must be commercial_clean_candidate`);
  expect(subset.derived_from_nc === false, `${subset.row_subset_id} derived_from_nc must be false`);
  expect(subset.commercial_export_allowed === false, `${subset.row_subset_id} commercial_export_allowed must be false for this boundary`);
  expect(subset.answer_eligible === false, `${subset.row_subset_id} answer_eligible must be false`);
  expect(subset.public_emit === false, `${subset.row_subset_id} public_emit must be false`);
  expect(subset.agent2_transform_allowed_now === false, `${subset.row_subset_id} transform must not be pre-cleared`);
  if (expected) {
    expect(subset.rows === expected[0], `${subset.row_subset_id} row count mismatch`);
    expect(subset.occurrences === expected[1], `${subset.row_subset_id} occurrence count mismatch`);
  }
}

const excluded = packet.excluded_lanes || [];
expect(excluded.length === 2, 'excluded lanes must contain NC and blocked rows');
const klein = excluded.find((row) => row.row_subset_id?.endsWith('klein-dictionary'));
expect(klein?.license_lane === 'noncommercial_educational_candidate', 'Klein must remain NC educational');
expect(klein?.derived_from_nc === true, 'Klein derived_from_nc must be true');
expect(klein?.commercial_export_allowed === false, 'Klein commercial_export_allowed must be false');
expect(klein?.owner_use_attestation === 'noncommercial_educational_zero_profit_zero_kickback', 'Klein owner use attestation missing');
const bdbAug = excluded.find((row) => row.row_subset_id?.endsWith('bdb-augmented-strong'));
expect(bdbAug?.license_lane === 'blocked_or_needs_review', 'BDB Augmented Strong must remain blocked/review');

for (const [key, value] of Object.entries(packet.zero_counters || {})) {
  expect(value === 0, `zero_counters.${key} must be 0`);
}

const allowed = packet.allowed_if_warn_accepted || {};
expect(allowed.agent2_may_carry_nonpublic_transform_readiness_planning_evidence === true, 'allowed scope must be transform-readiness planning evidence only');
expect(allowed.agent2_may_author_nonpublic_transform_candidate_package === false, 'transform-package authoring must remain blocked');
expect(allowed.exact_agent6_row_subset_boundary_required_for_any_later_transform_authoring === true, 'later transform authoring must require exact Agent 6 row/subset boundary');
expect(allowed.approved_morphology_relation_required_for_any_later_transform_authoring === true, 'later transform authoring must require approved morphology relation');
for (const key of [
  'public_emit',
  'answer_eligible',
  'definition_content_storage',
  'candidate_text_export',
  'route_shard_writes',
  'public_runtime_mutation',
  'accepted_text',
  'release_action',
  'source_license_legal_acceptance',
]) {
  expect(allowed[key] === false, `allowed_if_warn_accepted.${key} must be false`);
}

expect(packet.agent6_delivery_state?.delivery_status === 'held_not_delivered_zero_candidate_use_rows_and_agent6_route_unavailable', 'delivery status must preserve held zero-candidate-use state and unavailable Agent 6 route');
expect(packet.agent6_delivery_state?.exact_delivery_blocker === 'no_current_agent6_route_from_readiness_only_zero_candidate_use_rows; agent6_known_thread_not_found_for_direct_wait_or_delivery', 'delivery blocker mismatch');
expect(packet.agent2_current_confirmation?.readiness_matrix_path === 'reports/agent2-old-dictionary-excluded-row-transform-readiness-matrix-2026-06-05.json', 'Agent 2 readiness matrix path missing');
expect(packet.agent2_current_confirmation?.allowed_transform_rows_now === 0, 'Agent 2 allowed transform rows must be 0');
expect(Array.isArray(packet.agent2_current_confirmation?.current_transform_blockers), 'Agent 2 transform blockers must be listed');
expect(packet.agent2_current_confirmation?.current_transform_blockers?.includes('missing_approved_morphology_relation_for_definition_lemma_reader_hint_transform'), 'morphology relation blocker missing');

if (issues.length) {
  console.error(`Agent10 old-dictionary commercial-clean transform enablement boundary packet validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent10 old-dictionary commercial-clean transform enablement boundary packet validation passed. Commercial-clean subsets: ${scope.subsets.length}; rows: ${scope.row_count}; occurrences: ${scope.occurrence_count}.`);

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}
