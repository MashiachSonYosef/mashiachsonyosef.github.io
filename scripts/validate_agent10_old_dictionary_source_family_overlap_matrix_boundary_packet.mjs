#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packetPath = process.argv[2] || 'reports/agent10-agent6-ready-old-dictionary-source-family-overlap-matrix-boundary-packet-2026-06-05.json';
const packet = readJson(packetPath);
const matrix = readJson('reports/agent1-old-dictionary-source-family-overlap-matrix-2026-06-05.json');
const validation = readJson('reports/agent1-old-dictionary-source-family-overlap-matrix-validation-result-2026-06-05.json');
const issues = [];

expect(packet.artifact_type === 'agent10_agent6_ready_old_dictionary_source_family_overlap_matrix_boundary_packet', 'artifact_type mismatch');
expect(packet.review_scope === 'nonpublic_old_dictionary_source_family_overlap_matrix_planning_evidence_only', 'review_scope mismatch');
expect(packet.source_lane_owner?.agent_id === '019e975d-dc9f-7020-a7c8-885d083a837e', 'current Agent 1 owner missing');
expect(packet.inputs?.matrix_json === 'reports/agent1-old-dictionary-source-family-overlap-matrix-2026-06-05.json', 'matrix input mismatch');
expect(packet.exact_matrix_source?.row_duplication_in_this_packet === false, 'packet must not duplicate matrix token IDs');
expect(validation.ok === true, 'matrix validation result must be ok');

for (const [key, value] of Object.entries(matrix.matrix_counts || {})) {
  expect(packet.matrix_counts?.[key] === value, `matrix_counts.${key} mismatch`);
}
expect(packet.exact_blocker_count === 23, 'exact_blocker_count must be 23');
expect((matrix.exact_blockers || []).length === 23, 'source matrix exact_blockers must be 23');
expect((matrix.pairwise_intersections || []).length === 10, 'source matrix pairwise intersections must be 10');
expect((matrix.exact_family_combinations || []).length === 13, 'source matrix exact family combinations must be 13');

const packetFamilies = JSON.stringify(packet.source_families || []);
const matrixFamilies = JSON.stringify(matrix.source_families || []);
expect(packetFamilies === matrixFamilies, 'source_families mismatch');

const request = packet.requested_carry_forward || {};
expect(request.carry_as_nonpublic_planning_evidence_only === true, 'planning carry-forward must be true');
for (const key of [
  'source_family_selection_allowed_now',
  'agent2_transform_allowed_now',
  'candidate_use_allowed_now',
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

if (issues.length) {
  console.error(`Agent10 old-dictionary source-family overlap matrix boundary packet validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent10 old-dictionary source-family overlap matrix boundary packet validation passed. Source families: ${packet.matrix_counts.source_family_count}; pairwise: ${packet.matrix_counts.pairwise_intersection_count}; exact combinations: ${packet.matrix_counts.exact_family_combination_count}.`);

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}
