import fs from 'node:fs';

const packetPath = process.argv[2];
if (!packetPath) {
  throw new Error('Usage: node scripts/validate_agent10_old_dictionary_commercial_clean_only_metadata_custody_boundary_packet.mjs <packet.json>');
}

const readJson = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const normalizePath = (path) => path.replaceAll('\\', '/');

const packet = readJson(packetPath);
assert(
  packet.artifact_type === 'agent10_agent6_ready_old_dictionary_commercial_clean_only_metadata_custody_boundary_packet',
  'unexpected artifact_type',
);
assert(packet.review_scope === 'nonpublic_commercial_clean_only_metadata_custody_planning_evidence_only', 'unexpected review_scope');

const custody = readJson(packet.inputs.agent1_custody_json);
const validation = readJson(packet.inputs.agent1_validation_json);
assert(custody.artifact_type === 'agent1_old_dictionary_commercial_clean_only_metadata_custody', 'unexpected Agent 1 custody artifact_type');
assert(validation.ok === true, 'Agent 1 custody validation did not pass');
assert(normalizePath(validation.validated_artifact) === packet.inputs.agent1_custody_json, 'validation artifact path mismatch');
assert(packet.exact_custody_source.row_duplication_in_this_packet === false, 'packet must not duplicate row payload');

const expectedCounts = {
  commercial_clean_only_rows: 18,
  commercial_clean_only_occurrences: 494,
  source_family: 'Jastrow Dictionary',
  jastrow_only_rows: 18,
  rows_with_nc_overlap: 0,
  rows_with_blocked_overlap: 0,
  rows_with_refs: 17,
  occurrences_with_refs: 476,
  rows_without_refs: 1,
  occurrences_without_refs: 18,
  rid_total: 22,
  headword_total: 22,
};

for (const [key, expected] of Object.entries(expectedCounts)) {
  assert(packet.custody_counts[key] === expected, `packet custody count mismatch: ${key}`);
  assert(custody.custody_counts[key] === expected, `Agent 1 custody count mismatch: ${key}`);
  if (key in validation.custody_counts) {
    assert(validation.custody_counts[key] === expected, `validation custody count mismatch: ${key}`);
  }
}

assert(JSON.stringify(packet.classification_lanes) === JSON.stringify(custody.classification_lanes), 'classification_lanes mismatch');
assert(JSON.stringify(packet.exact_blockers) === JSON.stringify(custody.exact_blockers), 'exact_blockers mismatch');
assert(packet.exact_blockers.length === 3, 'expected 3 exact blockers');

const requestedCarry = packet.requested_carry_forward;
assert(requestedCarry.carry_as_nonpublic_planning_evidence_only === true, 'planning evidence carry must be true');
for (const [key, value] of Object.entries(requestedCarry)) {
  if (key === 'carry_as_nonpublic_planning_evidence_only') continue;
  assert(value === false, `requested carry must remain false: ${key}`);
}

for (const [key, value] of Object.entries(packet.zero_output_counts)) {
  assert(value === 0, `zero_output_counts must remain zero: ${key}`);
  assert(custody.zero_output_counts[key] === 0, `Agent 1 custody zero_output_counts must remain zero: ${key}`);
}

assert(packet.delivery_state.status === 'agent6_ready_not_delivered_by_agent10_in_this_artifact', 'unexpected delivery_state status');
assert(packet.what_must_not_be_accepted.includes('source-family selection acceptance'), 'source-family selection prohibition missing');
assert(packet.what_must_not_be_accepted.includes('release action'), 'release action prohibition missing');

console.log('Agent10 old-dictionary commercial-clean-only metadata custody boundary packet validation passed. Rows: 18; occurrences: 494.');
