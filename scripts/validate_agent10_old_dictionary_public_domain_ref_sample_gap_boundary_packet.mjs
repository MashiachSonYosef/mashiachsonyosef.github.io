import fs from 'node:fs';

const packetPath = process.argv[2];
if (!packetPath) {
  throw new Error('Usage: node scripts/validate_agent10_old_dictionary_public_domain_ref_sample_gap_boundary_packet.mjs <packet.json>');
}

const readJson = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const packet = readJson(packetPath);
assert(
  packet.artifact_type === 'agent10_agent6_ready_old_dictionary_public_domain_ref_sample_gap_boundary_packet',
  'unexpected artifact_type',
);
assert(packet.review_scope === 'nonpublic_public_domain_ref_sample_gap_planning_evidence_only', 'unexpected review_scope');

const gap = readJson(packet.inputs.agent1_gap_json);
const validation = readJson(packet.inputs.agent1_gap_validation_json);
assert(gap.artifact_type === 'agent1_old_dictionary_public_domain_ref_sample_gap_manifest', 'unexpected Agent 1 gap artifact_type');
assert(validation.ok === true, 'Agent 1 gap validation did not pass');
const normalizePath = (path) => path.replaceAll('\\', '/');
assert(normalizePath(validation.validated_artifact) === packet.inputs.agent1_gap_json, 'validation artifact path mismatch');
assert(packet.exact_gap_source.row_duplication_in_this_packet === false, 'packet must not duplicate row payload');

const expectedGapCounts = {
  public_domain_rows: 297,
  public_domain_occurrences: 5747,
  rows_with_ref_samples_or_ref_count: 204,
  occurrences_with_ref_samples_or_ref_count: 4385,
  rows_without_ref_samples_or_ref_count: 93,
  occurrences_without_ref_samples_or_ref_count: 1362,
  gap_rows_with_rids: 93,
  gap_rid_total: 270,
  gap_rows_with_headwords: 93,
  gap_headword_total: 251,
};

for (const [key, expected] of Object.entries(expectedGapCounts)) {
  assert(packet.gap_counts[key] === expected, `packet gap count mismatch: ${key}`);
  assert(gap.gap_counts[key] === expected, `Agent 1 gap count mismatch: ${key}`);
  assert(validation.gap_counts[key] === expected, `validation gap count mismatch: ${key}`);
}

assert(JSON.stringify(packet.classification_lanes) === JSON.stringify(gap.classification_lanes), 'classification_lanes mismatch');
assert(
  JSON.stringify(packet.family_gap_partitions) ===
    JSON.stringify(gap.family_gap_partitions.map(({ token_ids, token_ids_sha256, ...rest }) => rest)),
  'family_gap_partitions summary mismatch',
);
assert(JSON.stringify(packet.exact_blockers) === JSON.stringify(gap.exact_blockers), 'exact_blockers mismatch');
assert(packet.exact_blockers.length === 2, 'expected 2 exact blockers');

const requestedCarry = packet.requested_carry_forward;
assert(requestedCarry.carry_as_nonpublic_planning_evidence_only === true, 'planning evidence carry must be true');
for (const [key, value] of Object.entries(requestedCarry)) {
  if (key === 'carry_as_nonpublic_planning_evidence_only') continue;
  assert(value === false, `requested carry must remain false: ${key}`);
}

for (const [key, value] of Object.entries(packet.zero_output_counts)) {
  assert(value === 0, `zero_output_counts must remain zero: ${key}`);
  assert(gap.zero_output_counts[key] === 0, `Agent 1 gap zero_output_counts must remain zero: ${key}`);
}

assert(packet.delivery_state.status === 'agent6_ready_not_delivered_by_agent10_in_this_artifact', 'unexpected delivery_state status');
assert(packet.what_must_not_be_accepted.includes('candidate text export'), 'candidate text export prohibition missing');
assert(packet.what_must_not_be_accepted.includes('release action'), 'release action prohibition missing');

console.log('Agent10 old-dictionary public-domain ref-sample gap boundary packet validation passed. Gap rows: 93; occurrences: 1362.');
