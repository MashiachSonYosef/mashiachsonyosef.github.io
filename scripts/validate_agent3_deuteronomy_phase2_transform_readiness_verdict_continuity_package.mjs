#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath =
  process.argv[2] ||
  'reports/agent3-deuteronomy-phase2-transform-readiness-verdict-continuity-package-2026-06-05.json';
const artifact = readJson(artifactPath);

const prior = readJson('reports/agent3-deuteronomy-phase2-spark1-return-consumption-package-2026-06-04.json');
const boundaryPacket = readJson(
  'reports/agent10-agent6-ready-deuteronomy-phase2-transform-readiness-boundary-packet-2026-06-04.json',
);
const verdictText = readText('reports/agent6-deuteronomy-phase2-transform-readiness-boundary-verdict-2026-06-04.md');
const consumption = readJson(
  'reports/agent10-agent6-deuteronomy-phase2-transform-readiness-verdict-consumption-2026-06-04.json',
);
const supplementalText = readText('reports/agent6-deuteronomy-phase2-agent3-supplemental-receipt-2026-06-04.md');
const supplementalConsumption = readJson(
  'reports/agent10-agent6-deuteronomy-phase2-agent3-supplemental-receipt-consumption-2026-06-04.json',
);
const agent3Matrix = readJson('reports/agent3-deuteronomy-linkage-dedupe-source-route-matrix-2026-06-04.json');
const agent2Readiness = readJson('reports/agent2-deuteronomy-phase2-transform-readiness-matrix-2026-06-04.json');
const agent10Workset = readJson(
  'reports/agent10-agent2-ready-deuteronomy-phase2-downstream-transform-workset-2026-06-04.json',
);

const issues = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type ===
    'agent3_deuteronomy_phase2_transform_readiness_verdict_continuity_package',
  'unexpected artifact_type',
);
expect(
  artifact.status === 'agent6_warn_accepted_nonpublic_transform_readiness_observed_by_agent3',
  'unexpected status',
);
expect(artifact.publication_state === 'blocked_no_render', 'publication_state must be blocked_no_render');
expect(artifact.lane_owner === 'Agent 3', 'lane_owner must be Agent 3');

for (const input of artifact.reviewed_inputs || []) {
  expect(Boolean(input.role), 'reviewed input role missing');
  expect(Boolean(input.path), `reviewed input path missing for ${input.role}`);
  const absolute = resolve(input.path);
  expect(fs.existsSync(absolute), `reviewed input does not exist: ${input.path}`);
  expect(/^[a-f0-9]{64}$/.test(input.sha256 || ''), `reviewed input sha256 invalid: ${input.path}`);
  expect(Number.isInteger(input.bytes) && input.bytes > 0, `reviewed input bytes invalid: ${input.path}`);
  if (fs.existsSync(absolute)) {
    const actualHash = crypto.createHash('sha256').update(fs.readFileSync(absolute)).digest('hex');
    expect(actualHash === input.sha256, `reviewed input hash drifted: ${input.path}`);
  }
}

expect(
  verdictText.includes('WARN-ACCEPTED for exact non-public transform-readiness planning evidence only'),
  'Agent 6 verdict must remain WARN-ACCEPTED for transform/readiness planning evidence only',
);
expect(
  verdictText.includes('This docket does not authorize transform execution'),
  'Agent 6 verdict must preserve no-authorization warning',
);
expect(
  supplementalText.includes('does not widen the prior WARN-ACCEPTED'),
  'Agent 6 supplemental receipt must preserve no-widening warning',
);
expect(
  artifact.consumed_change?.agent6_transform_readiness_verdict
    ?.warn_accepted_nonpublic_transform_readiness_only === true,
  'artifact must mark Agent 6 verdict as WARN transform-readiness only',
);
expect(
  artifact.consumed_change?.agent6_transform_readiness_verdict?.no_acceptance_claims_created === true,
  'artifact must mark no-authorization claims',
);
expect(
  artifact.consumed_change?.agent6_agent3_supplemental_receipt?.no_widening_of_prior_boundary === true,
  'artifact must mark supplemental receipt as no-widening',
);

expect(artifact.consumed_change?.prior_agent3_spark1_package?.status === prior.status, 'prior package status mismatch');
expect(
  artifact.consumed_change?.prior_agent3_spark1_package?.agent6_acceptance_claimed === false,
  'prior package must not claim Agent 6 acceptance',
);
expect(
  artifact.consumed_change?.prior_agent3_spark1_package?.row_payload_copied_here === false,
  'prior row payload must not be copied',
);

expect(
  artifact.consumed_change?.agent10_verdict_consumption?.status ===
    'agent6_warn_accepted_nonpublic_transform_readiness_planning_evidence_only',
  'Agent 10 verdict consumption status mismatch',
);
expect(
  artifact.consumed_change?.agent10_verdict_consumption?.stop_condition ===
    'verdict_consumed_and_stale_wait_state_superseded',
  'Agent 10 verdict consumption stop condition mismatch',
);
expect(
  artifact.consumed_change?.agent10_verdict_consumption?.allowed_carry_forward
    ?.nonpublic_transform_readiness_planning_evidence_only === true,
  'non-public transform readiness carry-forward must be true',
);

const deniedCarryForwardKeys = [
  'transform_execution_authorized',
  'candidate_text_export_authorized',
  'answer_eligibility_authorized',
  'definition_content_storage_authorized',
  'accepted_text_authorized',
  'public_reader_output_authorized',
  'route_shard_write_authorized',
  'public_runtime_mutation_authorized',
  'source_license_legal_acceptance_authorized',
  'publication_readiness_authorized',
  'product_data_acceptance_authorized',
  'nc_commercial_authorization',
];
for (const key of deniedCarryForwardKeys) {
  expect(
    artifact.consumed_change?.agent10_verdict_consumption?.allowed_carry_forward?.[key] === false,
    `${key} must remain false`,
  );
}

expectCounts(artifact.deuteronomy_transform_readiness_counts, consumption.counts, [
  'rows',
  'occurrences',
  'commercial_clean_candidate_rows',
  'commercial_clean_candidate_occurrences',
  'noncommercial_educational_candidate_rows',
  'noncommercial_educational_candidate_occurrences',
]);
expect(artifact.deuteronomy_transform_readiness_counts.rows === 1334, 'planning rows must be 1334');
expect(artifact.deuteronomy_transform_readiness_counts.occurrences === 2964, 'planning occurrences must be 2964');

expectCounts(artifact.agent3_linkage_matrix_counts, agent3Matrix.counts, [
  'rows',
  'occurrences',
  'downstream_boundary_rows',
  'downstream_boundary_occurrences',
  'exact_blocker_rows',
  'exact_blocker_occurrences',
  'duplicate_key_collision_groups',
]);
expect(artifact.agent3_linkage_matrix_counts.rows === 8113, 'Agent 3 matrix rows must be 8113');
expect(artifact.agent3_linkage_matrix_counts.occurrences === 12595, 'Agent 3 matrix occurrences must be 12595');
expect(artifact.agent3_linkage_matrix_counts.downstream_boundary_rows === 1334, 'downstream rows must be 1334');
expect(
  artifact.agent3_linkage_matrix_counts.downstream_boundary_occurrences === 2964,
  'downstream occurrences must be 2964',
);
expect(artifact.agent3_linkage_matrix_counts.exact_blocker_rows === 6779, 'exact blocker rows must be 6779');
expect(
  artifact.agent3_linkage_matrix_counts.exact_blocker_occurrences === 9631,
  'exact blocker occurrences must be 9631',
);
expect(
  artifact.agent3_linkage_matrix_counts.duplicate_key_collision_groups === 0,
  'duplicate key collision groups must be 0',
);

expectZeroOutputs(artifact.agent3_linkage_matrix_counts, [
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
expectZeroOutputs(artifact.consumed_change?.agent10_verdict_consumption?.zero_emission_counters, [
  'answer_eligible_rows',
  'public_emit_rows',
  'definition_text_rows',
  'accepted_text_rows',
  'public_reader_output_rows',
  'public_hud_rows',
  'route_jsonl_rows',
  'route_shard_writes',
  'runtime_files_changed',
  'source_files_changed',
  'token_index_files_changed',
  'lexical_payload_files_changed',
  'nc_definition_content_rows',
]);

const boundaryObserved = artifact.crosschecked_inputs_count_only?.agent10_ready_boundary_packet;
expect(boundaryObserved?.status === boundaryPacket.status, 'Agent 10 boundary packet status mismatch');
expect(boundaryObserved?.row_payload_copied_here === false, 'Agent 10 boundary row payload must not be copied');
expectCounts(boundaryObserved?.review_scope, boundaryPacket.review_scope, [
  'rows',
  'occurrences',
  'commercial_clean_candidate_rows',
  'commercial_clean_candidate_occurrences',
  'noncommercial_educational_candidate_rows',
  'noncommercial_educational_candidate_occurrences',
  'metadata_or_link_only_rows',
  'blocked_or_needs_review_rows',
]);

const agent2Observed = artifact.crosschecked_inputs_count_only?.agent2_readiness_matrix;
expect(agent2Observed?.status === agent2Readiness.status, 'Agent 2 readiness status mismatch');
expect(agent2Observed?.row_payload_copied_here === false, 'Agent 2 row payload must not be copied');
expectCounts(agent2Observed?.counts, agent2Readiness.counts, [
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
expectZeroOutputs(agent2Observed?.zero_emission_counters, [
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
  'answer_eligible_rows',
  'accepted_text_rows',
  'public_reader_output_rows',
]);

const worksetObserved = artifact.crosschecked_inputs_count_only?.agent10_agent2_workset;
expect(worksetObserved?.status === agent10Workset.status, 'Agent 10 workset status mismatch');
expect(worksetObserved?.row_payload_copied_here === false, 'Agent 10 workset row payload must not be copied');
expectCounts(worksetObserved?.counts, agent10Workset.counts, [
  'rows',
  'occurrences',
  'nc_rows',
  'nc_occurrences',
  'commercial_clean_candidate_rows',
  'commercial_clean_candidate_occurrences',
]);

expect(
  supplementalConsumption.status === 'agent6_warn_accepted_supplemental_provenance_evidence_only',
  'supplemental consumption status mismatch',
);
expect(
  artifact.consumed_change?.agent10_agent3_supplemental_consumption?.boundary
    ?.nonpublic_linkage_dedupe_navigation_provenance_evidence_only === true,
  'supplemental boundary must remain non-public provenance evidence only',
);
expect(
  artifact.consumed_change?.agent10_agent3_supplemental_consumption?.boundary
    ?.blocked_rows_remain_blocked === 6779,
  'supplemental blocked rows mismatch',
);
expect(
  artifact.consumed_change?.agent10_agent3_supplemental_consumption?.boundary
    ?.blocked_occurrences_remain_blocked === 9631,
  'supplemental blocked occurrences mismatch',
);
for (const key of [
  'transform_execution_authorized',
  'candidate_text_export_authorized',
  'answer_eligibility_authorized',
  'definition_content_storage_authorized',
  'accepted_text_authorized',
  'public_reader_output_authorized',
  'route_shard_write_authorized',
  'public_runtime_mutation_authorized',
  'source_provenance_license_acceptance_authorized',
  'publication_readiness_authorized',
  'product_data_acceptance_authorized',
]) {
  expect(
    artifact.consumed_change?.agent10_agent3_supplemental_consumption?.boundary?.[key] === false,
    `supplemental ${key} must remain false`,
  );
}

for (const [key, value] of Object.entries(artifact.boundary || {})) {
  expect(value === true, `boundary flag must be true: ${key}`);
}
expect(artifact.package_summary?.external_lane_rows_copied === 0, 'external lane rows copied must be 0');
expect(artifact.package_summary?.executable_output_authorized === false, 'executable output must not be authorized');

const forbiddenKeyHits = findForbiddenPayloadKeys(artifact);
expect(forbiddenKeyHits.length === 0, `artifact contains copied row-payload keys: ${forbiddenKeyHits.join(', ')}`);
const serialized = JSON.stringify(artifact);
for (const needle of [
  '"token_index_id"',
  '"clicked_surface_form"',
  '"normalized_form"',
  '"source_route_evidence"',
  '"definition_text_stored_now"',
  '"accepted_text_now"',
]) {
  expect(!serialized.includes(needle), `artifact includes forbidden row payload field ${needle}`);
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
      planning_rows: artifact.deuteronomy_transform_readiness_counts.rows,
      planning_occurrences: artifact.deuteronomy_transform_readiness_counts.occurrences,
      agent3_matrix_rows: artifact.agent3_linkage_matrix_counts.rows,
      exact_blocker_rows: artifact.agent3_linkage_matrix_counts.exact_blocker_rows,
      external_lane_rows_copied: artifact.package_summary.external_lane_rows_copied,
      executable_output_authorized: artifact.package_summary.executable_output_authorized,
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
    if (key === 'token_index_id') hits.push(nextTrail.join('.'));
    if (key === 'clicked_surface_form') hits.push(nextTrail.join('.'));
    if (key === 'normalized_form') hits.push(nextTrail.join('.'));
    if (key === 'source_route_evidence') hits.push(nextTrail.join('.'));
    hits.push(...findForbiddenPayloadKeys(child, nextTrail));
  }
  return hits;
}
