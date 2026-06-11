import fs from 'node:fs';

const packetPath = process.argv[2];
if (!packetPath) {
  throw new Error('Usage: node scripts/validate_agent10_old_dictionary_commercial_nc_overlap_exclusion_boundary_packet.mjs <packet.json>');
}

const readJson = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const normalizePath = (path) => path.replaceAll('\\', '/');

const packet = readJson(packetPath);
assert(
  packet.artifact_type === 'agent10_agent6_ready_old_dictionary_commercial_nc_overlap_exclusion_boundary_packet',
  'unexpected artifact_type',
);
assert(packet.review_scope === 'nonpublic_commercial_nc_overlap_exclusion_planning_evidence_only', 'unexpected review_scope');

const manifest = readJson(packet.inputs.agent1_manifest_json);
const validation = readJson(packet.inputs.agent1_validation_json);
assert(manifest.artifact_type === 'agent1_old_dictionary_commercial_nc_overlap_exclusion_manifest', 'unexpected Agent 1 manifest artifact_type');
assert(validation.ok === true, 'Agent 1 validation did not pass');
assert(normalizePath(validation.validated_artifact) === packet.inputs.agent1_manifest_json, 'validation artifact path mismatch');
assert(packet.exact_manifest_source.row_duplication_in_this_packet === false, 'packet must not duplicate row payload');

const expectedCounts = {
  audited_rows: 500,
  audited_occurrences: 8427,
  commercial_nc_overlap_rows: 197,
  commercial_nc_overlap_occurrences: 4185,
  commercial_nc_without_bdb_augmented_strong_rows: 57,
  commercial_nc_without_bdb_augmented_strong_occurrences: 818,
  commercial_nc_with_bdb_augmented_strong_rows: 140,
  commercial_nc_with_bdb_augmented_strong_occurrences: 3367,
  klein_only_excluded_rows: 17,
  klein_only_excluded_occurrences: 259,
  pairwise_klein_intersection_count: 4,
  exact_klein_combination_count: 7,
};

for (const [key, expected] of Object.entries(expectedCounts)) {
  assert(packet.overlap_counts[key] === expected, `packet overlap count mismatch: ${key}`);
  assert(manifest.overlap_counts[key] === expected, `Agent 1 manifest overlap count mismatch: ${key}`);
  if (validation.overlap_counts && key in validation.overlap_counts) {
    assert(validation.overlap_counts[key] === expected, `validation overlap count mismatch: ${key}`);
  }
}

assert(JSON.stringify(packet.classification_lanes) === JSON.stringify(manifest.classification_lanes), 'classification_lanes mismatch');
assert(JSON.stringify(packet.exact_blockers) === JSON.stringify(manifest.exact_blockers), 'exact_blockers mismatch');
assert(packet.exact_blockers.length === 4, 'expected 4 exact blockers');
assert(manifest.commercial_nc_overlap_metadata_rows.length === 197, 'expected 197 overlap metadata rows');
assert(manifest.commercial_nc_without_bdb_augmented_strong_rows.length === 57, 'expected 57 commercial+NC-only rows');
assert(manifest.commercial_nc_with_bdb_augmented_strong_rows.length === 140, 'expected 140 triple-overlap rows');
assert(manifest.klein_only_excluded_rows.length === 17, 'expected 17 Klein-only excluded rows');

const requestedCarry = packet.requested_carry_forward;
assert(requestedCarry.carry_as_nonpublic_planning_evidence_only === true, 'planning evidence carry must be true');
for (const [key, value] of Object.entries(requestedCarry)) {
  if (key === 'carry_as_nonpublic_planning_evidence_only') continue;
  assert(value === false, `requested carry must remain false: ${key}`);
}

for (const [key, value] of Object.entries(packet.zero_output_counts)) {
  assert(value === 0, `zero_output_counts must remain zero: ${key}`);
  assert(manifest.zero_output_counts[key] === 0, `Agent 1 manifest zero_output_counts must remain zero: ${key}`);
}

assert(packet.delivery_state.status === 'agent6_ready_not_delivered_by_agent10_in_this_artifact', 'unexpected delivery_state status');
assert(packet.what_must_not_be_accepted.includes('NC commercial authorization'), 'NC commercial authorization prohibition missing');
assert(packet.what_must_not_be_accepted.includes('release action'), 'release action prohibition missing');

console.log('Agent10 old-dictionary commercial+NC overlap exclusion boundary packet validation passed. Overlap rows: 197; occurrences: 4185.');
