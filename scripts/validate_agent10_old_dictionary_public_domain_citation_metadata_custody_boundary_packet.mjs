import fs from 'node:fs';

const packetPath = process.argv[2];
if (!packetPath) {
  throw new Error('Usage: node scripts/validate_agent10_old_dictionary_public_domain_citation_metadata_custody_boundary_packet.mjs <packet.json>');
}

const readJson = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const packet = readJson(packetPath);
assert(
  packet.artifact_type === 'agent10_agent6_ready_old_dictionary_public_domain_citation_metadata_custody_boundary_packet',
  'unexpected artifact_type',
);
assert(
  packet.review_scope === 'nonpublic_public_domain_citation_metadata_custody_planning_evidence_only',
  'unexpected review_scope',
);

const custody = readJson(packet.inputs.agent1_custody_json);
const validation = readJson(packet.inputs.agent1_validation_json);

assert(custody.artifact_type === 'agent1_old_dictionary_public_domain_citation_metadata_custody', 'unexpected custody artifact_type');
assert(validation.ok === true, 'Agent 1 custody validation did not pass');
assert(validation.validated_artifact === packet.inputs.agent1_custody_json, 'validation artifact path mismatch');
assert(packet.exact_custody_source.row_duplication_in_this_packet === false, 'packet must not duplicate custody row payload');

const expectedCounts = {
  audited_rows: 500,
  audited_occurrences: 8427,
  public_domain_observed_rows: 297,
  public_domain_observed_occurrences: 5747,
  public_domain_citation_metadata_present_rows: 297,
  public_domain_rid_rows: 297,
  public_domain_rid_total: 1276,
  public_domain_headword_rows: 297,
  public_domain_headword_total: 1120,
  public_domain_refs_rows: 204,
  public_domain_refs_count_total: 4478,
  public_domain_rows_without_refs_sample: 93,
  rows_without_public_domain_citation_metadata: 203,
  nc_only_rows_without_public_domain_citation_metadata: 17,
  no_source_hit_rows_without_public_domain_citation_metadata: 186,
};

for (const [key, expected] of Object.entries(expectedCounts)) {
  assert(packet.citation_coverage_counts[key] === expected, `packet count mismatch: ${key}`);
  assert(custody.citation_coverage_counts[key] === expected, `custody count mismatch: ${key}`);
  assert(validation.citation_coverage_counts[key] === expected, `validation count mismatch: ${key}`);
}

assert(JSON.stringify(packet.classification_lanes) === JSON.stringify(custody.classification_lanes), 'classification_lanes mismatch');
assert(JSON.stringify(packet.exact_blockers) === JSON.stringify(custody.exact_blockers), 'exact_blockers mismatch');
assert(packet.exact_blockers.length === 4, 'expected 4 exact blockers');

const requestedCarry = packet.requested_carry_forward;
assert(requestedCarry.carry_as_nonpublic_planning_evidence_only === true, 'planning evidence carry must be true');
for (const [key, value] of Object.entries(requestedCarry)) {
  if (key === 'carry_as_nonpublic_planning_evidence_only') continue;
  assert(value === false, `requested carry must remain false: ${key}`);
}

for (const [key, value] of Object.entries(packet.zero_output_counts)) {
  assert(value === 0, `zero_output_counts must remain zero: ${key}`);
  assert(custody.zero_output_counts[key] === 0, `custody zero_output_counts must remain zero: ${key}`);
}

assert(packet.delivery_state.status === 'agent6_ready_not_delivered_by_agent10_in_this_artifact', 'unexpected delivery_state status');
assert(Array.isArray(packet.what_must_not_be_accepted), 'what_must_not_be_accepted must be an array');
assert(packet.what_must_not_be_accepted.includes('candidate text export'), 'candidate text export prohibition missing');
assert(packet.what_must_not_be_accepted.includes('release action'), 'release action prohibition missing');

console.log('Agent10 old-dictionary public-domain citation metadata custody boundary packet validation passed. Rows: 500; public-domain citation metadata rows: 297.');
