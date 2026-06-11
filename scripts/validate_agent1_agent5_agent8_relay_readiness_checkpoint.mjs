#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  checkpoint: 'reports/agent1-agent5-agent8-relay-readiness-checkpoint-2026-06-03.json',
  refreshResult: 'reports/agent1-source-custody-refresh-result.json',
  docketValidator: 'reports/agent1-source-provenance-agent6-ready-docket-validator-result-2026-06-03.json',
  relayPacket: 'reports/agent1-agent5-agent6-docket-relay-packet-2026-06-03.json',
  relayValidator: 'reports/agent1-agent5-agent6-docket-relay-validator-result-2026-06-03.json',
  intakeValidator: 'reports/agent1-agent6-queue-intake-contract-validator-result-2026-06-03.json',
  dryRunQueue: 'reports/agent1-agent6-validation-queue-dry-run-with-relay-items-2026-06-03.json',
  dryRunHealth: 'reports/agent1-agent6-validation-queue-dry-run-health-2026-06-03.md',
  dryRunValidator: 'reports/agent1-agent6-validation-queue-dry-run-validator-result-2026-06-03.json',
  result: 'reports/agent1-agent5-agent8-relay-readiness-checkpoint-validator-result-2026-06-03.json'
};

const EXPECTED_REQUEST_IDS = [
  'agent6-agent1-source-custody-manifest-remediation-review',
  'agent6-agent1-source-custody-tracking-action-review',
  'agent6-agent1-source-custody-license-normalization-review',
  'agent6-agent1-public-hud-source-row-review',
  'agent6-agent1-orot-fill-source-row-review'
];

const REQUIRED_MUST_NOT_ACCEPT = [
  'source/provenance custody',
  'source/provenance acceptance',
  'source publication',
  'source-file tracking approval',
  'QA acceptance',
  'public/runtime acceptance',
  'publication readiness',
  'route publication support',
  'Definition authority',
  'product/data acceptance',
  'usage-as-definition authority',
  'translation output',
  'accepted translation text'
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(repoRoot, relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function assert(condition, message, details = {}) {
  if (!condition) {
    const error = new Error(message);
    error.details = details;
    throw error;
  }
}

function sorted(values) {
  return [...values].sort((a, b) => a.localeCompare(b));
}

function sameSet(actual, expected, label) {
  const left = sorted(actual || []);
  const right = sorted(expected || []);
  assert(left.length === right.length && left.every((value, index) => value === right[index]), `${label} mismatch`, { actual: left, expected: right });
}

function assertBoundary(boundary) {
  assert(boundary?.publication_state === 'blocked_no_render', 'publication state must remain blocked_no_render');
  for (const key of [
    'queue_mutation_performed',
    'source_provenance_custody_claimed',
    'source_provenance_acceptance_claimed',
    'source_publication_claimed',
    'source_file_tracking_approval_claimed',
    'qa_acceptance_claimed',
    'public_runtime_acceptance_claimed',
    'route_publication_support_claimed',
    'definition_authority_claimed',
    'product_data_acceptance_claimed',
    'usage_as_definition_authority_claimed',
    'translation_output_claimed',
    'accepted_translation_text_claimed'
  ]) {
    assert(boundary?.[key] === false, `boundary ${key} must be false`);
  }
}

function assertDryRunBoundary(boundary) {
  assert(boundary?.publication_state === 'blocked_no_render', 'dry-run publication state must remain blocked_no_render');
  for (const key of [
    'live_queue_mutation_performed',
    'source_provenance_custody_claimed',
    'source_provenance_acceptance_claimed',
    'source_publication_claimed',
    'source_file_tracking_approval_claimed',
    'qa_acceptance_claimed',
    'public_runtime_acceptance_claimed',
    'route_publication_support_claimed',
    'definition_authority_claimed',
    'product_data_acceptance_claimed',
    'usage_as_definition_authority_claimed',
    'translation_output_claimed',
    'accepted_translation_text_claimed'
  ]) {
    assert(boundary?.[key] === false, `dry-run boundary ${key} must be false`);
  }
}

function main() {
  const startedAt = new Date().toISOString();
  const checkpoint = readJson(PATHS.checkpoint);
  const refresh = readJson(PATHS.refreshResult);
  const docketValidator = readJson(PATHS.docketValidator);
  const relayPacket = readJson(PATHS.relayPacket);
  const relayValidator = readJson(PATHS.relayValidator);
  const intakeValidator = readJson(PATHS.intakeValidator);
  const dryRunValidator = readJson(PATHS.dryRunValidator);

  assert(checkpoint.artifact_type === 'agent1_agent5_agent8_relay_readiness_checkpoint', 'unexpected checkpoint artifact type');
  assert(checkpoint.status === 'relay_ready_evidence_control_surface_relay_still_needed', 'unexpected checkpoint status');
  assert(refresh.ok === true, 'refresh result must be ok');
  assert(docketValidator.ok === true, 'docket validator must be ok');
  assert(relayValidator.ok === true, 'relay validator must be ok');
  assert(intakeValidator.ok === true, 'intake validator must be ok');
  assert(dryRunValidator.ok === true, 'dry-run validator must be ok');
  assert(intakeValidator.blocking_findings === 0, 'intake validator blocking findings must be zero');
  assert(relayValidator.status === 'relay_needed_control_surfaces_missing_request_ids', 'relay status must still reflect missing request IDs');
  assert(dryRunValidator.existing_queue_validator_exit_code === 0, 'dry-run queue must pass existing Agent 6 queue validator');

  sameSet(checkpoint.request_ids, EXPECTED_REQUEST_IDS, 'checkpoint request IDs');
  sameSet(checkpoint.blocker?.missing_request_ids_everywhere, EXPECTED_REQUEST_IDS, 'checkpoint blocker missing-everywhere IDs');
  sameSet(relayValidator.request_ids_missing_everywhere, EXPECTED_REQUEST_IDS, 'relay validator missing-everywhere IDs');
  sameSet(docketValidator.review_items, EXPECTED_REQUEST_IDS, 'docket review items');
  sameSet(dryRunValidator.inserted_request_ids, EXPECTED_REQUEST_IDS, 'dry-run inserted request IDs');

  assert(JSON.stringify(checkpoint.current_source_scope) === JSON.stringify(docketValidator.current_source_scope), 'checkpoint source scope must match docket validator source scope');
  assert(checkpoint.current_source_scope.live_untracked_sources === 23, 'expected 23 live untracked sources');
  assert(checkpoint.current_source_scope.live_modified_tracked_sources === 6, 'expected 6 live modified tracked sources');
  assert(checkpoint.current_source_scope.source_rows === 29, 'expected 29 source rows');
  assert(checkpoint.current_source_scope.source_fingerprinted_rows === 29, 'expected 29 fingerprinted source rows');
  assert(checkpoint.current_source_scope.missing_lexical_manifest_gaps === 0, 'expected zero missing lexical manifest gaps');
  assert(checkpoint.current_source_scope.blocked_downstream_direct_paths === 248, 'expected 248 blocked direct paths');
  assert(checkpoint.current_source_scope.blocked_downstream_content_reference_paths === 183, 'expected 183 blocked content-reference paths');

  assert(checkpoint.control_surfaces.length === relayValidator.control_surfaces.length, 'control surface count mismatch');
  for (const surface of checkpoint.control_surfaces) {
    const relaySurface = relayValidator.control_surfaces.find((candidate) => candidate.path === surface.path);
    assert(relaySurface, `checkpoint control surface missing from relay validator: ${surface.path}`);
    assert(surface.exists === true, `control surface should exist: ${surface.path}`);
    sameSet(surface.missing_request_ids, EXPECTED_REQUEST_IDS, `control surface missing request IDs ${surface.path}`);
    assert((surface.present_request_ids || []).length === 0, `control surface should not contain request IDs: ${surface.path}`);
  }

  const relayItems = relayPacket.requested_agent5_action.queue_items;
  assert(checkpoint.queue_items.length === relayItems.length, 'queue item count mismatch');
  for (const item of checkpoint.queue_items) {
    const relayItem = relayItems.find((candidate) => candidate.request_id === item.request_id);
    assert(relayItem, `relay queue item missing: ${item.request_id}`);
    assert(item.submitted_by === 'Agent 5', `${item.request_id} must be submitted_by Agent 5`);
    assert(item.has_agent1_evidence_origin === true, `${item.request_id} missing Agent 1 evidence origin`);
    assert(item.has_agent6_change_history === true, `${item.request_id} missing Agent 6 change history`);
    assert(item.exact_no_acceptance_terms_present === true, `${item.request_id} missing exact no-acceptance terms`);
    assert(item.evidence_artifact_count === relayItem.evidence_artifacts.length, `${item.request_id} evidence artifact count mismatch`);
  }

  const dryRunCompatibility = checkpoint.dry_run_queue_compatibility;
  assert(dryRunCompatibility, 'checkpoint missing dry_run_queue_compatibility');
  assert(dryRunCompatibility.dry_run_queue === PATHS.dryRunQueue, 'checkpoint dry-run queue path mismatch');
  assert(dryRunCompatibility.dry_run_health === PATHS.dryRunHealth, 'checkpoint dry-run health path mismatch');
  assert(dryRunCompatibility.dry_run_validator === PATHS.dryRunValidator, 'checkpoint dry-run validator path mismatch');
  assert(dryRunCompatibility.existing_queue_validator_exit_code === dryRunValidator.existing_queue_validator_exit_code, 'checkpoint dry-run validator exit mismatch');
  assert(dryRunCompatibility.existing_queue_validator_exit_code === 0, 'checkpoint dry-run validator exit must be zero');
  assert(dryRunCompatibility.live_queue_item_count === dryRunValidator.live_queue_item_count, 'checkpoint live queue count mismatch');
  assert(dryRunCompatibility.dry_run_queue_item_count === dryRunValidator.dry_run_queue_item_count, 'checkpoint dry-run queue count mismatch');
  assert(dryRunCompatibility.live_queue_item_count === 36, 'expected current live queue item count of 36');
  assert(dryRunCompatibility.dry_run_queue_item_count === dryRunCompatibility.live_queue_item_count + EXPECTED_REQUEST_IDS.length, `expected dry-run queue item count of live plus ${EXPECTED_REQUEST_IDS.length}`);
  sameSet(dryRunCompatibility.inserted_request_ids, EXPECTED_REQUEST_IDS, 'checkpoint dry-run inserted request IDs');
  for (const requestId of EXPECTED_REQUEST_IDS) {
    assert(dryRunCompatibility.live_queue_request_id_hits_now?.[requestId] === 0, `checkpoint live queue must still lack ${requestId}`);
    assert(dryRunValidator.live_queue_request_id_hits_now?.[requestId] === 0, `dry-run validator live queue must still lack ${requestId}`);
    assert(dryRunCompatibility.dry_run_request_id_hits?.[requestId] === 1, `checkpoint dry-run queue must contain exactly one ${requestId}`);
    assert(dryRunValidator.dry_run_request_id_hits?.[requestId] === 1, `dry-run validator queue must contain exactly one ${requestId}`);
  }
  assert(dryRunCompatibility.live_queue_sha256_now === dryRunValidator.live_queue_sha256_now, 'checkpoint live queue SHA now mismatch');
  assert(dryRunCompatibility.live_queue_sha256_recorded_by_dry_run === dryRunValidator.live_queue_sha256_recorded_by_dry_run, 'checkpoint dry-run recorded SHA mismatch');
  assert(dryRunCompatibility.live_queue_sha256_now === dryRunCompatibility.live_queue_sha256_recorded_by_dry_run, 'checkpoint dry-run SHA proof must match current live queue');
  assert(dryRunCompatibility.live_queue_mutation_performed === false, 'checkpoint must prove no live queue mutation');
  assert(dryRunValidator.boundary?.live_queue_mutation_performed === false, 'dry-run validator must prove no live queue mutation');
  assertDryRunBoundary(dryRunValidator.boundary);

  for (const term of REQUIRED_MUST_NOT_ACCEPT) {
    assert((checkpoint.must_not_accept || []).includes(term), `checkpoint missing must-not-accept term: ${term}`);
  }
  assertBoundary(checkpoint.boundary);

  for (const artifact of [
    PATHS.checkpoint,
    PATHS.refreshResult,
    PATHS.docketValidator,
    PATHS.relayPacket,
    PATHS.relayValidator,
    PATHS.intakeValidator,
    PATHS.dryRunQueue,
    PATHS.dryRunHealth,
    PATHS.dryRunValidator
  ]) {
    assert(fs.existsSync(path.join(repoRoot, artifact)), `evidence artifact missing: ${artifact}`);
  }

  const result = {
    ok: true,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    validated_checkpoint: PATHS.checkpoint,
    status: checkpoint.status,
    request_ids: checkpoint.request_ids,
    blocker: checkpoint.blocker.blocker_id,
    control_surfaces_checked: checkpoint.control_surfaces.length,
    dry_run_queue_compatibility: checkpoint.dry_run_queue_compatibility,
    intake_blocking_findings: intakeValidator.blocking_findings,
    boundary: checkpoint.boundary
  };
  writeJson(PATHS.result, result);
  console.log(JSON.stringify(result, null, 2));
}

try {
  main();
} catch (error) {
  const result = {
    ok: false,
    completed_at: new Date().toISOString(),
    error: error.message,
    details: error.details || null,
    boundary: {
      publication_state: 'blocked_no_render',
      source_provenance_acceptance_claimed: false,
      qa_acceptance_claimed: false,
      public_runtime_acceptance_claimed: false
    }
  };
  writeJson(PATHS.result, result);
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
