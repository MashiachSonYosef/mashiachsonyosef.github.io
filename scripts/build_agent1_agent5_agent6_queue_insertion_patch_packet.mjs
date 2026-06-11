#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  liveQueue: 'data/control/agent6_validation_queue.json',
  relayPacket: 'reports/agent1-agent5-agent6-docket-relay-packet-2026-06-03.json',
  relayValidator: 'reports/agent1-agent5-agent6-docket-relay-validator-result-2026-06-03.json',
  intakeValidator: 'reports/agent1-agent6-queue-intake-contract-validator-result-2026-06-03.json',
  dryRunQueue: 'reports/agent1-agent6-validation-queue-dry-run-with-relay-items-2026-06-03.json',
  dryRunValidator: 'reports/agent1-agent6-validation-queue-dry-run-validator-result-2026-06-03.json',
  relayReadiness: 'reports/agent1-agent5-agent8-relay-readiness-checkpoint-2026-06-03.json',
  relayReadinessValidator: 'reports/agent1-agent5-agent8-relay-readiness-checkpoint-validator-result-2026-06-03.json',
  controlSurfaceDelta: 'reports/agent1-agent5-agent6-control-surface-delta-packet-2026-06-03.json',
  controlSurfaceDeltaValidator: 'reports/agent1-agent5-agent6-control-surface-delta-validator-result-2026-06-03.json',
  outputJson: 'reports/agent1-agent5-agent6-queue-insertion-patch-packet-2026-06-03.json',
  outputMd: 'reports/agent1-agent5-agent6-queue-insertion-patch-packet-2026-06-03.md'
};

const EXPECTED_REQUEST_IDS = [
  'agent6-agent1-source-custody-manifest-remediation-review',
  'agent6-agent1-source-custody-tracking-action-review',
  'agent6-agent1-source-custody-license-normalization-review',
  'agent6-agent1-public-hud-source-row-review',
  'agent6-agent1-orot-fill-source-row-review'
];

const MUST_NOT_ACCEPT = [
  'source/provenance custody',
  'source/provenance acceptance',
  'source publication',
  'source-file tracking approval',
  'source-file staging, commit, or merge',
  'downstream direct artifact acceptance',
  'downstream content-reference acceptance',
  'QA acceptance',
  'public/runtime acceptance',
  'publication readiness',
  'future publication support',
  'route publication support',
  'Definition authority',
  'usage-as-definition authority',
  'product/data acceptance',
  'translation output',
  'accepted translation text'
];

const BOUNDARY = {
  agent1_status: 'queue-insertion patch evidence only / awaiting-Agent-5-or-Agent-8 relay and Agent-6 disposition',
  publication_state: 'blocked_no_render',
  queue_mutation_performed: false,
  live_queue_mutation_performed: false,
  source_provenance_custody_claimed: false,
  source_provenance_acceptance_claimed: false,
  source_publication_claimed: false,
  source_file_tracking_approval_claimed: false,
  source_file_staging_claimed: false,
  downstream_direct_artifact_acceptance_claimed: false,
  downstream_content_reference_acceptance_claimed: false,
  qa_acceptance_claimed: false,
  public_runtime_acceptance_claimed: false,
  route_publication_support_claimed: false,
  definition_authority_claimed: false,
  product_data_acceptance_claimed: false,
  usage_as_definition_authority_claimed: false,
  translation_output_claimed: false,
  accepted_translation_text_claimed: false
};

function fullPath(relativePath) {
  return path.join(repoRoot, relativePath);
}

function readText(relativePath) {
  return fs.readFileSync(fullPath(relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(fullPath(relativePath)), { recursive: true });
  fs.writeFileSync(fullPath(relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeText(relativePath, value) {
  fs.mkdirSync(path.dirname(fullPath(relativePath)), { recursive: true });
  fs.writeFileSync(fullPath(relativePath), value, 'utf8');
}

function sha256Text(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
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

function countRequestIds(queueItems, requestIds) {
  return Object.fromEntries(requestIds.map((requestId) => [
    requestId,
    (queueItems || []).filter((item) => item?.request_id === requestId).length
  ]));
}

function assertBoundaryFalse(boundary, queueKey = 'queue_mutation_performed') {
  assert(boundary?.publication_state === 'blocked_no_render', 'publication state must remain blocked_no_render');
  for (const [key, value] of Object.entries(boundary || {})) {
    if (key.endsWith('_claimed') || key === queueKey || key === 'live_queue_mutation_performed') {
      assert(value === false, `boundary ${key} must be false`);
    }
  }
}

function renderMarkdown(packet) {
  return `# Agent 1 Agent 5/6 Queue Insertion Patch Packet

Generated: ${packet.generated_at}

Highest permissible claim: Agent 1 source/provenance review queue items have an exact non-mutating append patch prepared for authorized Agent 5/8 relay consideration.

This packet does not mutate \`${PATHS.liveQueue}\`. It provides RFC-6902-style append operations only, backed by the existing dry-run queue validator.

Publication remains \`${packet.boundary.publication_state}\`.

## Patch Summary

- Target queue: \`${packet.target_queue}\`
- Operation format: \`${packet.operation_format}\`
- Patch operation count: ${packet.json_patch_operations.length}
- Expected live queue SHA-256 before patch: \`${packet.expected_before.live_queue_sha256}\`
- Expected live queue item count before patch: ${packet.expected_before.live_queue_item_count}
- Expected queue item count after patch: ${packet.expected_after.queue_item_count}
- Live queue mutation performed by Agent 1: \`${packet.boundary.live_queue_mutation_performed}\`

## Request IDs

${packet.request_ids.map((requestId) => `- \`${requestId}\``).join('\n')}

## Patch Operations

\`\`\`json
${JSON.stringify(packet.json_patch_operations.map((operation) => ({
  op: operation.op,
  path: operation.path,
  request_id: operation.value.request_id
})), null, 2)}
\`\`\`

## Verification Inputs

${packet.evidence_artifacts.map((artifact) => `- \`${artifact}\``).join('\n')}

## Operator Boundary

Only Agent 5, Agent 8, user, or another explicitly authorized queue owner can decide whether to apply these operations to the live Agent 6 queue. Agent 1 is not applying them and is not claiming Agent 6 acceptance.

## Must Not Accept

${packet.must_not_accept.map((item) => `- ${item}`).join('\n')}

## Agent 8 Callback

- status: exact queue insertion patch evidence prepared; live queue not mutated
- artifact: \`${PATHS.outputMd}\`
- machine artifact: \`${PATHS.outputJson}\`
- blockers: ${packet.request_ids.length} current Agent 1 request IDs remain absent from checked control surfaces; Agent 1 cannot mutate Agent 6 queue; Agent 6 has not disposed source/provenance custody
- next action needed: Agent 5/Agent 8 may apply or relay the ${packet.request_ids.length} append operations only if authorized, preserving all boundaries and treating this as awaiting-Agent-6 evidence
- continue condition: continue Agent 1 source/provenance evidence maintenance without render, staging, commit, publication, live queue mutation, runtime validation, or custody acceptance
`;
}

function main() {
  const generatedAt = new Date().toISOString();
  const liveQueueText = readText(PATHS.liveQueue);
  const liveQueue = JSON.parse(liveQueueText);
  const relayPacket = readJson(PATHS.relayPacket);
  const relayValidator = readJson(PATHS.relayValidator);
  const intakeValidator = readJson(PATHS.intakeValidator);
  const dryRunQueue = readJson(PATHS.dryRunQueue);
  const dryRunValidator = readJson(PATHS.dryRunValidator);
  const relayReadiness = readJson(PATHS.relayReadiness);
  const relayReadinessValidator = readJson(PATHS.relayReadinessValidator);
  const controlSurfaceDelta = readJson(PATHS.controlSurfaceDelta);
  const controlSurfaceDeltaValidator = readJson(PATHS.controlSurfaceDeltaValidator);

  assert(liveQueue.artifact_type === 'agent6_validation_queue', 'live queue artifact type mismatch');
  assert(liveQueue.publication_global_status === 'blocked_no_render', 'live queue publication state must remain blocked_no_render');
  assert(Array.isArray(liveQueue.queue), 'live queue must contain queue array');
  assert(relayValidator.ok === true, 'relay validator must be ok');
  assert(relayValidator.status === 'relay_needed_control_surfaces_missing_request_ids', 'relay status must still require relay');
  assert(intakeValidator.ok === true, 'intake validator must be ok');
  assert(intakeValidator.blocking_findings === 0, 'intake validator must have zero blocking findings');
  assert(dryRunValidator.ok === true, 'dry-run validator must be ok');
  assert(relayReadinessValidator.ok === true, 'relay readiness validator must be ok');
  assert(controlSurfaceDeltaValidator.ok === true, 'control-surface delta validator must be ok');
  assert(controlSurfaceDeltaValidator.status === 'current_agent1_request_ids_absent_historical_agent1_queue_items_present', 'control-surface delta status mismatch');
  assertBoundaryFalse(relayValidator.boundary);
  assertBoundaryFalse(intakeValidator.boundary, 'queue_mutation_performed');
  assertBoundaryFalse(dryRunValidator.boundary, 'live_queue_mutation_performed');
  assertBoundaryFalse(relayReadinessValidator.boundary);
  assertBoundaryFalse(controlSurfaceDeltaValidator.boundary);

  const requestIds = relayPacket.request_ids || [];
  const queueItems = relayPacket.requested_agent5_action?.queue_items || [];
  sameSet(requestIds, EXPECTED_REQUEST_IDS, 'relay packet request IDs');
  sameSet(queueItems.map((item) => item.request_id), EXPECTED_REQUEST_IDS, 'relay queue item request IDs');
  sameSet(dryRunQueue.dry_run_inserted_request_ids, EXPECTED_REQUEST_IDS, 'dry-run inserted request IDs');
  sameSet(relayReadiness.request_ids, EXPECTED_REQUEST_IDS, 'relay readiness request IDs');
  sameSet(controlSurfaceDelta.current_request_ids, EXPECTED_REQUEST_IDS, 'control-surface delta request IDs');
  sameSet(controlSurfaceDelta.current_request_ids_missing_everywhere, EXPECTED_REQUEST_IDS, 'control-surface missing request IDs');

  const liveHits = countRequestIds(liveQueue.queue, EXPECTED_REQUEST_IDS);
  for (const [requestId, count] of Object.entries(liveHits)) {
    assert(count === 0, `live queue must still lack ${requestId}`, { count });
  }

  const patchedQueue = JSON.parse(JSON.stringify(liveQueue));
  patchedQueue.queue = [...liveQueue.queue, ...queueItems];
  const dryRunQueueOnly = dryRunQueue.queue;
  assert(JSON.stringify(patchedQueue.queue) === JSON.stringify(dryRunQueueOnly), 'patched live queue array must match dry-run queue array');
  assert(patchedQueue.queue.length === liveQueue.queue.length + EXPECTED_REQUEST_IDS.length, 'patched queue item count mismatch');

  const operations = queueItems.map((item) => ({
    op: 'add',
    path: '/queue/-',
    value: item
  }));

  const packet = {
    generated_at: generatedAt,
    artifact_type: 'agent1_agent5_agent6_queue_insertion_patch_packet',
    status: 'patch_prepared_no_live_queue_mutation',
    scope: 'Exact append-only patch for authorized Agent 5/Agent 8 relay of current Agent 1 source/provenance review candidates to Agent 6',
    operation_format: 'RFC6902_add_only_queue_append',
    target_queue: PATHS.liveQueue,
    source_relay_packet: PATHS.relayPacket,
    request_ids: EXPECTED_REQUEST_IDS,
    json_patch_operations: operations,
    expected_before: {
      live_queue_sha256: sha256Text(liveQueueText),
      live_queue_item_count: liveQueue.queue.length,
      live_queue_request_id_hits: liveHits,
      publication_global_status: liveQueue.publication_global_status
    },
    expected_after: {
      queue_item_count: patchedQueue.queue.length,
      inserted_request_ids: EXPECTED_REQUEST_IDS,
      queue_array_sha256: sha256Text(stableJson(patchedQueue.queue)),
      patched_document_sha256: sha256Text(stableJson(patchedQueue)),
      request_id_hits: countRequestIds(patchedQueue.queue, EXPECTED_REQUEST_IDS)
    },
    dry_run_comparison: {
      dry_run_queue: PATHS.dryRunQueue,
      dry_run_validator: PATHS.dryRunValidator,
      dry_run_queue_item_count: dryRunQueue.queue.length,
      dry_run_queue_array_sha256: sha256Text(stableJson(dryRunQueue.queue)),
      dry_run_live_queue_sha256_recorded: dryRunQueue.dry_run_source_queue_sha256,
      dry_run_validator_live_queue_sha256_now: dryRunValidator.live_queue_sha256_now,
      existing_agent6_queue_validator_exit_code: dryRunValidator.existing_queue_validator_exit_code
    },
    precondition_artifacts: {
      relay_validator: PATHS.relayValidator,
      intake_validator: PATHS.intakeValidator,
      relay_readiness: PATHS.relayReadiness,
      relay_readiness_validator: PATHS.relayReadinessValidator,
      control_surface_delta: PATHS.controlSurfaceDelta,
      control_surface_delta_validator: PATHS.controlSurfaceDeltaValidator
    },
    evidence_artifacts: [
      PATHS.relayPacket,
      PATHS.relayValidator,
      PATHS.intakeValidator,
      PATHS.dryRunQueue,
      PATHS.dryRunValidator,
      PATHS.relayReadiness,
      PATHS.relayReadinessValidator,
      PATHS.controlSurfaceDelta,
      PATHS.controlSurfaceDeltaValidator,
      'reports/agent1-source-custody-refresh-result.json',
      'reports/agent1-source-provenance-agent6-ready-docket-2026-06-03.json',
      'reports/agent1-source-provenance-agent6-ready-docket-validator-result-2026-06-03.json'
    ],
    requested_agent5_or_agent8_action: {
      action: 'apply_or_relay_append_only_patch_if_authorized',
      target_queue: PATHS.liveQueue,
      patch_artifact: PATHS.outputJson,
      request_ids: EXPECTED_REQUEST_IDS,
      boundary: 'Agent 1 prepared patch evidence only. Applying the patch is an Agent 5/Agent 8/user control-surface action and does not create Agent 6 acceptance.'
    },
    boundary: BOUNDARY,
    must_not_accept: MUST_NOT_ACCEPT
  };

  writeJson(PATHS.outputJson, packet);
  writeText(PATHS.outputMd, renderMarkdown(packet));
  console.log(JSON.stringify({
    ok: true,
    output_json: PATHS.outputJson,
    output_md: PATHS.outputMd,
    status: packet.status,
    operation_count: operations.length,
    expected_before: packet.expected_before,
    expected_after: packet.expected_after,
    boundary: packet.boundary
  }, null, 2));
}

try {
  main();
} catch (error) {
  const result = {
    ok: false,
    completed_at: new Date().toISOString(),
    error: error.message,
    details: error.details || null,
    boundary: BOUNDARY
  };
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
