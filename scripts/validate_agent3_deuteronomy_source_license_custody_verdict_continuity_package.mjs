#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath =
  process.argv[2] ||
  'reports/agent3-deuteronomy-source-license-custody-verdict-continuity-package-2026-06-04.json';
const artifact = readJson(artifactPath);
const verdictText = readText('reports/agent6-deuteronomy-source-license-custody-planning-verdict-2026-06-04.md');
const consumption = readJson(
  'reports/agent10-agent6-deuteronomy-source-license-custody-verdict-consumption-2026-06-04.json',
);
const prior = readJson('reports/agent3-frontier-receipt-custody-boundary-observer-package-2026-06-04.json');
const agent1 = readJson('reports/agent1-deuteronomy-source-license-custody-map-2026-06-04.json');
const boundaryPacket = readJson(
  'reports/agent10-agent6-ready-deuteronomy-source-license-custody-boundary-packet-2026-06-04.json',
);
const checkpoint = readJson('reports/agent3-linkage-navigation-frontier-checkpoint-2026-06-04.json');

const issues = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_deuteronomy_source_license_custody_verdict_continuity_package',
  'unexpected artifact_type',
);
expect(
  artifact.status === 'agent6_warn_accepted_nonpublic_planning_observed_by_agent3',
  'unexpected status',
);
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
  verdictText.includes('WARN-ACCEPTED for exact non-public source/license/custody planning evidence only'),
  'Agent 6 verdict must remain WARN-ACCEPTED for non-public planning evidence only',
);
expect(
  verdictText.includes('This verdict does not create source/provenance acceptance, license acceptance, legal acceptance'),
  'Agent 6 verdict must preserve no-acceptance warning',
);
expect(
  verdictText.includes('The `6779` exact-blocker rows / `9631` occurrences remain blocked'),
  'Agent 6 verdict must preserve exact blocker warning',
);
expect(
  artifact.consumed_change?.agent6_verdict?.warn_accepted_nonpublic_planning_only === true,
  'artifact must mark Agent 6 verdict as WARN planning-only',
);
expect(
  artifact.consumed_change?.agent6_verdict?.no_acceptance_claims_created === true,
  'artifact must mark no-acceptance claims',
);

expect(artifact.consumed_change?.prior_observer_package?.status === prior.status, 'prior package status mismatch');
expect(
  artifact.consumed_change?.prior_observer_package?.external_lane_rows_copied === 0,
  'prior package external row copy count must be 0',
);
expect(
  artifact.consumed_change?.prior_observer_package?.prior_pending_statement_superseded_by_verdict === true,
  'prior pending state must be explicitly superseded by verdict',
);

expect(
  artifact.consumed_change?.agent10_consumption?.status ===
    'agent6_warn_accepted_nonpublic_source_license_custody_planning_evidence_only',
  'Agent 10 consumption status mismatch',
);
expect(
  artifact.consumed_change?.agent10_consumption?.stop_condition ===
    'verdict_consumed_no_release_or_mutation_authorized',
  'Agent 10 stop condition mismatch',
);
expect(
  artifact.consumed_change?.agent10_consumption?.allowed_carry_forward
    ?.nonpublic_source_license_custody_planning_evidence_only === true,
  'non-public planning carry-forward must be true',
);

const deniedCarryForwardKeys = [
  'source_provenance_acceptance_authorized',
  'license_legal_acceptance_authorized',
  'commercial_export_permission_authorized',
  'transform_execution_authorized',
  'candidate_text_export_authorized',
  'answer_eligibility_authorized',
  'definition_content_storage_authorized',
  'accepted_text_authorized',
  'public_reader_output_authorized',
  'route_shard_write_authorized',
  'public_runtime_mutation_authorized',
  'publication_readiness_authorized',
  'product_data_acceptance_authorized',
  'nc_commercial_authorization',
];
for (const key of deniedCarryForwardKeys) {
  expect(
    artifact.consumed_change?.agent10_consumption?.allowed_carry_forward?.[key] === false,
    `${key} must remain false`,
  );
}

expectCounts(artifact.deuteronomy_planning_counts, consumption.counts, [
  'rows',
  'occurrences',
  'commercial_clean_candidate_rows',
  'commercial_clean_candidate_occurrences',
  'noncommercial_educational_candidate_rows',
  'noncommercial_educational_candidate_occurrences',
  'metadata_or_link_only_rows',
  'blocked_or_needs_review_rows_inside_workset',
  'exact_blocker_rows_outside_workset',
  'exact_blocker_occurrences_outside_workset',
]);
expect(artifact.deuteronomy_planning_counts.rows === 1334, 'planning rows must be 1334');
expect(artifact.deuteronomy_planning_counts.occurrences === 2964, 'planning occurrences must be 2964');
expect(
  artifact.deuteronomy_planning_counts.exact_blocker_rows_outside_workset === 6779,
  'exact blocker rows must be 6779',
);
expect(
  artifact.deuteronomy_planning_counts.exact_blocker_occurrences_outside_workset === 9631,
  'exact blocker occurrences must be 9631',
);

expectZeroOutputs(artifact.consumed_change?.agent10_consumption?.zero_emission_counters, [
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

const agent1Observed = artifact.crosschecked_sources_count_only?.agent1_source_license_custody_map;
expect(agent1Observed?.status === agent1.status, 'Agent 1 status mismatch');
expect(agent1Observed?.row_payload_copied_here === false, 'Agent 1 row payload must not be copied');
expect(
  agent1Observed?.row_payload_observed_count_only === agent1.rows.length,
  'Agent 1 observed row count mismatch',
);
expectCounts(agent1Observed?.source_license_counts, agent1.source_license_counts, [
  'row_count_covered',
  'occurrence_count_covered',
  'commercial_clean_rows',
  'commercial_clean_occurrences',
  'noncommercial_educational_rows',
  'noncommercial_educational_occurrences',
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

const boundaryObserved = artifact.crosschecked_sources_count_only?.agent10_ready_boundary_packet;
expect(boundaryObserved?.status === boundaryPacket.status, 'Agent 10 boundary packet status mismatch');
expect(boundaryObserved?.validation_status === boundaryPacket.validation_status, 'Agent 10 boundary validation mismatch');
expect(boundaryObserved?.row_payload_copied_here === false, 'Agent 10 boundary row payload must not be copied');

const checkpointObserved = artifact.crosschecked_sources_count_only?.agent3_frontier_checkpoint;
expect(checkpointObserved?.status === checkpoint.status, 'Agent 3 checkpoint status mismatch');
expect(checkpointObserved?.publication_state === 'blocked_no_render', 'Agent 3 checkpoint must remain blocked_no_render');
expect(checkpointObserved?.planning_rows === 1334, 'checkpoint planning rows mismatch');
expect(checkpointObserved?.exact_blocker_rows_still_blocked === 6779, 'checkpoint blocker rows mismatch');

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
  '"surface"',
  '"normalized"',
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
      rows: artifact.deuteronomy_planning_counts.rows,
      occurrences: artifact.deuteronomy_planning_counts.occurrences,
      exact_blocker_rows: artifact.deuteronomy_planning_counts.exact_blocker_rows_outside_workset,
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
    if (key === 'source_route_evidence') hits.push(nextTrail.join('.'));
    if (key === 'token_index_id') hits.push(nextTrail.join('.'));
    if (key === 'surface') hits.push(nextTrail.join('.'));
    if (key === 'normalized') hits.push(nextTrail.join('.'));
    hits.push(...findForbiddenPayloadKeys(child, nextTrail));
  }
  return hits;
}
