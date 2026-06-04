#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath =
  process.argv[2] || 'reports/agent3-frontier-receipt-custody-boundary-observer-package-2026-06-04.json';
const artifact = readJson(artifactPath);
const checkpoint = readJson('reports/agent3-linkage-navigation-frontier-checkpoint-2026-06-04.json');
const agent10Packet = readJson(
  'reports/agent10-agent6-ready-deuteronomy-source-license-custody-boundary-packet-2026-06-04.json',
);
const agent1Custody = readJson('reports/agent1-deuteronomy-source-license-custody-map-2026-06-04.json');
const frontierReceipt = readText(
  'reports/agent6-agent3-linkage-navigation-frontier-checkpoint-receipt-2026-06-04.md',
);
const continuityReceipt = readText('reports/agent6-deuteronomy-phase2-agent3-continuity-receipt-2026-06-04.md');

const issues = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_frontier_receipt_custody_boundary_observer_package',
  'unexpected artifact_type',
);
expect(artifact.status === 'evidence_ready_observer_package', 'status must remain evidence_ready_observer_package');
expect(artifact.publication_state === 'blocked_no_render', 'publication_state must be blocked_no_render');
expect(artifact.lane_owner === 'Agent 3', 'lane_owner must be Agent 3');

for (const input of artifact.reviewed_inputs || []) {
  expect(Boolean(input.role), 'reviewed input role missing');
  expect(Boolean(input.path), `reviewed input path missing for ${input.role}`);
  expect(fs.existsSync(resolve(input.path)), `reviewed input does not exist: ${input.path}`);
  expect(/^[a-f0-9]{64}$/.test(input.sha256 || ''), `reviewed input sha256 invalid: ${input.path}`);
  expect(Number.isInteger(input.bytes) && input.bytes > 0, `reviewed input bytes invalid: ${input.path}`);
}

expect(
  frontierReceipt.includes('RECEIVED / WARN-ACCEPTED as Agent 3 linkage/navigation frontier evidence only'),
  'frontier receipt disposition missing expected evidence-only warning',
);
expect(
  continuityReceipt.includes('RECEIVED / WARN-ACCEPTED as Agent 3 continuity evidence only'),
  'continuity receipt disposition missing expected evidence-only warning',
);
expect(
  artifact.consumed_receipts?.agent6_frontier_checkpoint_receipt?.received_warn_accepted_as_evidence_only === true,
  'frontier receipt not marked consumed as evidence-only',
);
expect(
  artifact.consumed_receipts?.agent6_deuteronomy_continuity_receipt?.received_warn_accepted_as_evidence_only === true,
  'continuity receipt not marked consumed as evidence-only',
);

expect(artifact.agent3_frontier_checkpoint_observed?.status === checkpoint.status, 'checkpoint status mismatch');
expect(
  artifact.agent3_frontier_checkpoint_observed?.publication_state === 'blocked_no_render',
  'checkpoint publication state must remain blocked_no_render',
);
expect(
  artifact.agent3_frontier_checkpoint_observed?.qa_acceptance_state === 'not_agent6_accepted',
  'checkpoint QA state must remain not_agent6_accepted',
);
expect(
  artifact.agent3_frontier_checkpoint_observed?.control_queue_mutated === false,
  'Agent 3 control queue mutation must remain false',
);
expect(
  artifact.agent3_frontier_checkpoint_observed?.submitted_to_agent6 === false,
  'Agent 3 submitted_to_agent6 must remain false in source state',
);
expectCounts(artifact.agent3_frontier_checkpoint_observed?.counts, checkpoint.agent3_usage_state?.counts, [
  'usage_concordance_rows',
  'usage_supported_rows',
  'usage_candidate_rows',
  'usage_weak_rows',
  'audit_only_ambiguous_rows',
  'selected_usage_rows',
  'selected_source_refs',
  'selected_works',
  'route_ids',
  'occurrence_link_rows',
  'occurrence_link_rows_with_complete_metadata',
  'occurrence_link_reader_facing_rows',
  'occurrence_link_route_payload_field_hits',
  'occurrence_link_forbidden_authority_field_hits',
]);
expect(
  artifact.agent3_frontier_checkpoint_observed?.counts?.occurrence_link_reader_facing_rows === 0,
  'occurrence link reader-facing rows must be 0',
);
expect(
  artifact.agent3_frontier_checkpoint_observed?.counts?.occurrence_link_route_payload_field_hits === 0,
  'route payload hits must be 0',
);
expect(
  artifact.agent3_frontier_checkpoint_observed?.counts?.occurrence_link_forbidden_authority_field_hits === 0,
  'forbidden authority hits must be 0',
);

expect(
  artifact.source_license_custody_observed_only?.agent10_boundary_packet?.status ===
    'agent6_ready_source_license_custody_boundary_packet_not_accepted',
  'Agent 10 boundary packet status must remain not accepted',
);
expect(
  artifact.source_license_custody_observed_only?.agent10_boundary_packet?.validation_status ===
    agent10Packet.validation_status,
  'Agent 10 validation_status mismatch',
);
expectCounts(artifact.source_license_custody_observed_only?.agent10_boundary_packet?.counts, agent10Packet.counts, [
  'source_license_custody_rows',
  'source_license_custody_occurrences',
  'commercial_clean_candidate_rows',
  'commercial_clean_candidate_occurrences',
  'noncommercial_educational_rows',
  'noncommercial_educational_occurrences',
  'agent3_exact_blocker_rows_outside_workset',
  'agent3_exact_blocker_occurrences_outside_workset',
  'answer_rows',
  'source_rows_emitted',
  'public_hud_rows',
  'route_jsonl_rows',
  'route_shard_writes',
  'runtime_files_changed',
  'source_files_changed',
  'token_index_files_changed',
  'lexical_payload_files_changed',
  'definition_content_rows',
  'accepted_text_rows',
  'public_reader_output_rows',
]);
expectZeroOutputs(artifact.source_license_custody_observed_only?.agent10_boundary_packet?.counts, [
  'answer_rows',
  'source_rows_emitted',
  'public_hud_rows',
  'route_jsonl_rows',
  'route_shard_writes',
  'runtime_files_changed',
  'source_files_changed',
  'token_index_files_changed',
  'lexical_payload_files_changed',
  'definition_content_rows',
  'accepted_text_rows',
  'public_reader_output_rows',
]);

const agent1Observed = artifact.source_license_custody_observed_only?.agent1_source_license_custody_map;
expect(agent1Observed?.status === agent1Custody.status, 'Agent 1 custody status mismatch');
expect(agent1Observed?.row_payload_copied_here === false, 'Agent 1 row payload must not be copied');
expect(
  agent1Observed?.row_payload_observed_count_only === agent1Custody.rows.length,
  'Agent 1 row payload observed count mismatch',
);
expectCounts(agent1Observed?.source_license_counts, agent1Custody.source_license_counts, [
  'row_count_covered',
  'occurrence_count_covered',
  'commercial_clean_rows',
  'commercial_clean_occurrences',
  'noncommercial_educational_rows',
  'noncommercial_educational_occurrences',
  'metadata_or_link_only_rows',
  'blocked_or_needs_review_rows',
  'unmatched_rows',
  'exact_blocker_rows_from_matrix',
  'exact_blocker_occurrences_from_matrix',
]);
expectZeroOutputs(agent1Observed?.zero_output_counts, [
  'answer_rows',
  'source_rows',
  'public_hud_rows',
  'route_jsonl_rows',
  'definition_content_rows',
  'accepted_text_rows',
]);

for (const [key, value] of Object.entries(artifact.boundary || {})) {
  expect(value === true, `boundary flag must be true: ${key}`);
}

expect(artifact.package_summary?.external_lane_rows_copied === 0, 'external lane rows copied must be 0');
expect(
  artifact.package_summary?.source_license_custody_rows_observed ===
    agent10Packet.counts.source_license_custody_rows,
  'source/license/custody observed row count mismatch',
);
expect(
  artifact.package_summary?.agent3_exact_blocker_rows_outside_workset ===
    agent10Packet.counts.agent3_exact_blocker_rows_outside_workset,
  'Agent 3 exact blocker row count mismatch',
);

const forbiddenKeyHits = findForbiddenPayloadKeys(artifact);
expect(forbiddenKeyHits.length === 0, `artifact contains copied row-payload keys: ${forbiddenKeyHits.join(', ')}`);

const forbiddenStrings = [
  'accepted_gloss',
  'accepted_text_now',
  'definition_text_stored_now',
  'source_route_evidence',
  'token_index_id',
];
const serialized = JSON.stringify(artifact);
for (const needle of forbiddenStrings) {
  expect(!serialized.includes(`"${needle}"`), `artifact includes forbidden payload string ${needle}`);
}

if (issues.length) {
  console.error(JSON.stringify({ ok: false, artifact: artifactPath, issues }, null, 2));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      artifact: artifactPath,
      status: artifact.status,
      agent10_validation_status: artifact.source_license_custody_observed_only.agent10_boundary_packet.validation_status,
      source_license_custody_rows:
        artifact.package_summary.source_license_custody_rows_observed,
      agent3_exact_blocker_rows_outside_workset:
        artifact.package_summary.agent3_exact_blocker_rows_outside_workset,
      external_lane_rows_copied: artifact.package_summary.external_lane_rows_copied,
    },
    null,
    2,
  ),
);

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  return fs.readFileSync(resolve(relativePath), 'utf8');
}

function resolve(relativePath) {
  return path.resolve(root, relativePath);
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}

function expectCounts(actual, expected, keys) {
  for (const key of keys) {
    expect(actual?.[key] === expected?.[key], `${key} mismatch: expected ${expected?.[key]}, got ${actual?.[key]}`);
  }
}

function expectZeroOutputs(actual, keys) {
  for (const key of keys) {
    expect(actual?.[key] === 0, `${key} must be 0`);
  }
}

function findForbiddenPayloadKeys(value, trail = []) {
  const hits = [];
  if (!value || typeof value !== 'object') return hits;
  if (Array.isArray(value)) {
    value.forEach((item, index) => hits.push(...findForbiddenPayloadKeys(item, trail.concat(String(index)))));
    return hits;
  }
  for (const [key, child] of Object.entries(value)) {
    const nextTrail = trail.concat(key);
    if (key === 'rows' && Array.isArray(child)) hits.push(nextTrail.join('.'));
    if (key === 'source_route_evidence') hits.push(nextTrail.join('.'));
    if (key === 'token_index_id') hits.push(nextTrail.join('.'));
    if (key === 'surface') hits.push(nextTrail.join('.'));
    if (key === 'normalized') hits.push(nextTrail.join('.'));
    hits.push(...findForbiddenPayloadKeys(child, nextTrail));
  }
  return hits;
}
