#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packetPath = process.argv[2] || 'reports/agent10-agent6-ready-old-dictionary-exact-row-subset-manifest-boundary-packet-2026-06-05.json';
const packet = readJson(packetPath);
const manifest = readJson('reports/agent1-old-dictionary-exact-row-subset-manifest-2026-06-05.json');
const manifestValidation = readJson('reports/agent1-old-dictionary-exact-row-subset-manifest-validation-result-2026-06-05.json');
const issues = [];

expect(packet.artifact_type === 'agent10_agent6_ready_old_dictionary_exact_row_subset_manifest_boundary_packet', 'artifact_type mismatch');
expect(packet.review_scope === 'nonpublic_old_dictionary_exact_row_subset_manifest_planning_evidence_only', 'review_scope mismatch');
expect(packet.source_lane_owner?.agent_id === '019e975d-dc9f-7020-a7c8-885d083a837e', 'current Agent 1 source-lane owner missing');
expect(packet.inputs?.manifest_json === 'reports/agent1-old-dictionary-exact-row-subset-manifest-2026-06-05.json', 'manifest input mismatch');
expect(packet.exact_row_source?.row_duplication_in_this_packet === false, 'packet must not duplicate 500 token IDs');
expect(manifestValidation.ok === true, 'manifest validation result must be ok');

const expectedCounts = {
  subset_count: 8,
  audited_rows: 500,
  audited_occurrences: 8427,
  manifest_token_id_count: 500,
  unique_manifest_token_id_count: 500,
  duplicate_token_id_count: 0,
  commercial_clean_only_rows: 18,
  commercial_clean_plus_nc_rows: 57,
  commercial_clean_plus_blocked_rows: 82,
  triple_overlap_rows: 140,
  nc_only_rows: 17,
  metadata_or_link_only_rows: 0,
  blocked_review_only_rows: 0,
  no_source_hit_rows: 186,
  total_rows_represented: 500,
  total_occurrences_represented: 8427,
  delivered_to_agent6_now: 0,
  allowed_transform_rows_now: 0,
  candidate_text_rows_now: 0,
};

for (const [key, value] of Object.entries(expectedCounts)) {
  expect(packet.manifest_counts?.[key] === value, `packet manifest_counts.${key} mismatch`);
  expect(manifest.manifest_counts?.[key] === value, `source manifest_counts.${key} mismatch`);
}

const packetSubsets = new Map((packet.subsets || []).map((subset) => [subset.bucket_id, subset]));
const sourceSubsets = new Map((manifest.subset_manifests || []).map((subset) => [subset.bucket_id, subset]));
expect(packetSubsets.size === 8, 'packet must have 8 subsets');
expect(sourceSubsets.size === 8, 'source manifest must have 8 subsets');

for (const [bucket, packetSubset] of packetSubsets) {
  const sourceSubset = sourceSubsets.get(bucket);
  expect(!!sourceSubset, `missing source subset ${bucket}`);
  if (!sourceSubset) continue;
  expect(packetSubset.row_subset_id === sourceSubset.row_subset_id, `row_subset_id mismatch for ${bucket}`);
  expect(packetSubset.row_count === sourceSubset.row_count, `row_count mismatch for ${bucket}`);
  expect(packetSubset.occurrence_count === sourceSubset.occurrence_count, `occurrence_count mismatch for ${bucket}`);
  expect(packetSubset.token_ids_sha256 === sourceSubset.token_ids_sha256, `token_ids_sha256 mismatch for ${bucket}`);
  expect(packetSubset.exact_blocker === sourceSubset.exact_blocker, `exact_blocker mismatch for ${bucket}`);
  expect(JSON.stringify(packetSubset.classification_lanes) === JSON.stringify(sourceSubset.classification_lanes), `classification_lanes mismatch for ${bucket}`);
}

const request = packet.requested_carry_forward || {};
expect(request.carry_as_nonpublic_planning_evidence_only === true, 'planning evidence carry-forward must be true');
for (const key of [
  'agent2_transform_allowed_now',
  'candidate_text_allowed_now',
  'definition_content_storage_allowed_now',
  'answer_eligibility_allowed_now',
  'public_emit_allowed_now',
  'route_write_allowed_now',
  'source_license_legal_acceptance_allowed_now',
  'commercial_export_allowed_now',
  'nc_commercial_use_allowed_now',
  'release_action_allowed_now',
]) {
  expect(request[key] === false, `requested_carry_forward.${key} must be false`);
}

for (const [key, value] of Object.entries(packet.zero_counters || {})) {
  expect(value === 0, `zero_counters.${key} must be 0`);
}

expect(packet.delivery_state?.status === 'agent6_ready_not_delivered_by_agent10_in_this_artifact', 'delivery status mismatch');
expect(packet.exact_blocker_if_not_routed === 'await_agent6_exact_row_subset_manifest_boundary_for_500_old_dictionary_rows', 'exact blocker mismatch');

if (issues.length) {
  console.error(`Agent10 old-dictionary row-subset manifest boundary packet validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent10 old-dictionary row-subset manifest boundary packet validation passed. Rows: ${packet.manifest_counts.audited_rows}; occurrences: ${packet.manifest_counts.audited_occurrences}; subsets: ${packet.manifest_counts.subset_count}.`);

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}
