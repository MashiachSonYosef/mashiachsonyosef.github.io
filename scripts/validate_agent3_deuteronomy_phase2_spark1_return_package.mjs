#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packagePath =
  process.argv[2] || 'reports/agent3-deuteronomy-phase2-spark1-return-consumption-package-2026-06-04.json';

const artifact = readJson(packagePath);
const issues = [];

const matrix = readJson('reports/agent3-deuteronomy-linkage-dedupe-source-route-matrix-2026-06-04.json');
const agent10Workset = readJson('reports/agent10-agent2-ready-deuteronomy-phase2-downstream-transform-workset-2026-06-04.json');
const agent2Readiness = readJson('reports/agent2-deuteronomy-phase2-transform-readiness-matrix-2026-06-04.json');
const agent6Packet = readJson('reports/agent10-agent6-ready-deuteronomy-phase2-transform-readiness-boundary-packet-2026-06-04.json');

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(artifact.artifact_type === 'agent3_deuteronomy_phase2_spark1_return_consumption_package', 'unexpected artifact_type');
expect(artifact.status === 'spark1_return_consumed_agent3_review_package', 'unexpected status');
expect(artifact.publication_state === 'blocked_no_render', 'publication_state must be blocked_no_render');
expect(artifact.package_summary?.agent6_acceptance_claimed === false, 'agent6 acceptance must not be claimed');
expect(artifact.package_summary?.spark1_return_available === true, 'spark1 return must be available');
expect(artifact.package_summary?.agent10_consumed_return === true, 'Agent 10 consumption must be observed');
expect(artifact.package_summary?.agent2_matrix_present === true, 'Agent 2 matrix must be observed');
expect(artifact.package_summary?.agent6_boundary_packet_present === true, 'Agent 6 boundary packet must be observed');

for (const input of artifact.reviewed_inputs || []) {
  expect(Boolean(input.role), 'reviewed input role missing');
  expect(Boolean(input.path), `reviewed input path missing for ${input.role}`);
  expect(fs.existsSync(resolve(input.path)), `reviewed input does not exist: ${input.path}`);
  expect(/^[a-f0-9]{64}$/.test(input.sha256 || ''), `reviewed input sha256 invalid: ${input.path}`);
}

expectCounts(artifact.agent3_matrix?.counts, matrix.counts, [
  'rows',
  'occurrences',
  'token_index_forms',
  'token_index_occurrences',
  'occurrence_units',
  'source_units',
  'manifest_chunks',
  'joined_token_index_rows',
  'missing_token_index_join_rows',
  'downstream_boundary_rows',
  'downstream_boundary_occurrences',
  'exact_blocker_rows',
  'exact_blocker_occurrences',
  'duplicate_key_collision_groups',
  'public_hud_rows',
  'route_jsonl_rows',
  'route_shard_writes',
  'runtime_files_changed',
  'source_files_changed',
  'token_index_files_changed',
  'lexical_payload_files_changed',
  'definition_content_rows',
  'nc_definition_content_rows',
  'answer_rows',
  'accepted_text_rows',
]);

expect(artifact.agent3_matrix?.status === matrix.status, 'Agent 3 matrix status mismatch');
expect(artifact.agent3_matrix?.publication_state === matrix.publication_state, 'Agent 3 matrix publication_state mismatch');

const worksetCounts = artifact.downstream_chain_observed?.agent10_agent2_workset?.counts || {};
expect(worksetCounts.rows === agent10Workset.counts?.rows, 'Agent 10 workset row count mismatch');
expect(worksetCounts.occurrences === agent10Workset.counts?.occurrences, 'Agent 10 workset occurrence count mismatch');
expect(worksetCounts.commercial_clean_candidate_rows === 1334, 'Agent 10 commercial-clean rows expected 1334');
expect(worksetCounts.commercial_clean_candidate_occurrences === 2964, 'Agent 10 commercial-clean occurrences expected 2964');
expect(worksetCounts.nc_rows === 0, 'Agent 10 NC rows expected 0');
expect(worksetCounts.nc_occurrences === 0, 'Agent 10 NC occurrences expected 0');

expectCounts(artifact.downstream_chain_observed?.agent2_readiness_matrix?.counts, agent2Readiness.counts, [
  'rows',
  'occurrences',
  'commercial_clean_candidate_rows',
  'commercial_clean_candidate_occurrences',
  'noncommercial_educational_candidate_rows',
  'noncommercial_educational_candidate_occurrences',
  'metadata_or_link_only_rows',
  'blocked_or_needs_review_rows',
  'answer_eligible_rows',
  'public_emit_rows',
  'definition_text_emitted_rows',
  'accepted_text_emitted_rows',
  'route_shard_write_rows',
]);

expectZeroObject(artifact.downstream_chain_observed?.agent2_readiness_matrix?.zero_emission_counters || {}, 'Agent 2 zero emission counters');
expectZeroObject(artifact.downstream_chain_observed?.agent10_agent6_boundary_packet?.zero_emission_counters || {}, 'Agent 6 packet zero emission counters');

const reviewScope = artifact.downstream_chain_observed?.agent10_agent6_boundary_packet?.review_scope || {};
expect(reviewScope.rows === agent6Packet.review_scope?.rows, 'Agent 6 review_scope rows mismatch');
expect(reviewScope.occurrences === agent6Packet.review_scope?.occurrences, 'Agent 6 review_scope occurrences mismatch');
expect(reviewScope.commercial_clean_candidate_rows === 1334, 'Agent 6 commercial-clean rows expected 1334');
expect(reviewScope.noncommercial_educational_candidate_rows === 0, 'Agent 6 NC rows expected 0');

expect(!Object.prototype.hasOwnProperty.call(artifact, 'rows'), 'package must not copy row arrays');
const serialized = JSON.stringify(artifact);
for (const forbidden of ['safe_rendering_options', 'accepted_text_value', 'definition_payload']) {
  expect(!serialized.includes(`"${forbidden}"`), `forbidden payload field copied: ${forbidden}`);
}

const deniedClaims = [
  'QA acceptance',
  'source/provenance acceptance',
  'license acceptance',
  'Definition authority',
  'usage-as-definition authority',
  'answer eligibility',
  'public/runtime acceptance',
  'publication readiness',
  'route publication support',
  'accepted text',
];
for (const claim of deniedClaims) {
  expect((artifact.what_must_not_be_accepted || []).includes(claim), `missing non-acceptance boundary: ${claim}`);
}

if (issues.length) {
  console.error('Agent 3 Deuteronomy Spark-1 return package validation failed:');
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(
  `Agent 3 Deuteronomy Spark-1 return package validation passed: matrix rows ${artifact.agent3_matrix.counts.rows}; downstream rows ${worksetCounts.rows}; Agent2 rows ${artifact.downstream_chain_observed.agent2_readiness_matrix.counts.rows}`,
);

function expectCounts(actual, expected, keys) {
  for (const key of keys) {
    expect(actual?.[key] === expected?.[key], `count ${key} mismatch: expected ${expected?.[key]}, found ${actual?.[key]}`);
  }
}

function expectZeroObject(values, label) {
  for (const [key, value] of Object.entries(values)) {
    expect(Number(value) === 0, `${label}.${key} expected 0, found ${value}`);
  }
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(resolve(file), 'utf8'));
}

function resolve(file) {
  return path.join(root, file);
}
