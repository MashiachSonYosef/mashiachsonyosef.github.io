#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  liveQueue: 'data/control/agent6_validation_queue.json',
  relayPacket: 'reports/agent1-agent5-agent6-docket-relay-packet-2026-06-03.json',
  dryRunQueue: 'reports/agent1-agent6-validation-queue-dry-run-with-relay-items-2026-06-03.json',
  packet: 'reports/agent1-agent5-agent6-queue-insertion-patch-packet-2026-06-03.json',
  packetMd: 'reports/agent1-agent5-agent6-queue-insertion-patch-packet-2026-06-03.md',
  resultJson: 'reports/agent1-agent5-agent6-queue-insertion-patch-validator-result-2026-06-03.json',
  resultMd: 'reports/agent1-agent5-agent6-queue-insertion-patch-validator-result-2026-06-03.md'
};

const EXPECTED_REQUEST_IDS = [
  'agent6-agent1-source-custody-manifest-remediation-review',
  'agent6-agent1-source-custody-tracking-action-review',
  'agent6-agent1-source-custody-license-normalization-review',
  'agent6-agent1-public-hud-source-row-review',
  'agent6-agent1-orot-fill-source-row-review'
];

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

function assertBoundaryFalse(boundary) {
  assert(boundary?.publication_state === 'blocked_no_render', 'publication state must remain blocked_no_render');
  for (const [key, value] of Object.entries(boundary || {})) {
    if (key.endsWith('_claimed') || key === 'queue_mutation_performed' || key === 'live_queue_mutation_performed') {
      assert(value === false, `boundary ${key} must be false`);
    }
  }
}

function applyPatchInMemory(document, operations) {
  const patched = JSON.parse(JSON.stringify(document));
  for (const operation of operations) {
    assert(operation.op === 'add', 'only add operations are allowed', { operation });
    assert(operation.path === '/queue/-', 'only append-to-queue operations are allowed', { operation });
    assert(operation.value && typeof operation.value === 'object', 'operation value must be an object', { operation });
    patched.queue.push(JSON.parse(JSON.stringify(operation.value)));
  }
  return patched;
}

function renderMarkdown(result) {
  return `# Agent 1 Agent 5/6 Queue Insertion Patch Validator Result

Generated: ${result.completed_at}

## Summary

- OK: \`${result.ok}\`
- Validated packet: \`${PATHS.packet}\`
- Patch operation count: ${result.operation_count}
- Live queue item count: ${result.live_queue_item_count}
- Patched queue item count: ${result.patched_queue_item_count}
- Dry-run queue item count: ${result.dry_run_queue_item_count}
- Live queue mutation performed: \`${result.boundary.live_queue_mutation_performed}\`
- Publication state: \`${result.boundary.publication_state}\`

## Request IDs

${result.request_ids.map((requestId) => `- \`${requestId}\``).join('\n')}

## SHA Proof

- Live queue SHA-256 now: \`${result.live_queue_sha256_now}\`
- Packet expected live queue SHA-256: \`${result.packet_expected_live_queue_sha256}\`
- Patched queue array SHA-256: \`${result.patched_queue_array_sha256}\`
- Dry-run queue array SHA-256: \`${result.dry_run_queue_array_sha256}\`

## Boundary

- Source/provenance custody: not claimed.
- Source publication: not claimed.
- Source-file tracking approval: not claimed.
- QA acceptance: not claimed.
- Public/runtime acceptance: not claimed.
- Publication readiness: not claimed.
- Route publication support, Definition authority, product/data acceptance, usage-as-definition authority, translation output, and accepted translation text: not claimed.
`;
}

function main() {
  const startedAt = new Date().toISOString();
  const liveQueueText = readText(PATHS.liveQueue);
  const liveQueue = JSON.parse(liveQueueText);
  const relayPacket = readJson(PATHS.relayPacket);
  const dryRunQueue = readJson(PATHS.dryRunQueue);
  const packet = readJson(PATHS.packet);

  assert(packet.artifact_type === 'agent1_agent5_agent6_queue_insertion_patch_packet', 'unexpected patch packet artifact type');
  assert(packet.status === 'patch_prepared_no_live_queue_mutation', 'unexpected patch packet status');
  assert(packet.target_queue === PATHS.liveQueue, 'target queue mismatch');
  assert(packet.operation_format === 'RFC6902_add_only_queue_append', 'operation format mismatch');
  assertBoundaryFalse(packet.boundary);
  sameSet(packet.request_ids, EXPECTED_REQUEST_IDS, 'packet request IDs');

  const liveSha = sha256Text(liveQueueText);
  assert(liveSha === packet.expected_before.live_queue_sha256, 'live queue SHA changed; rebuild patch packet before relying on it', {
    liveSha,
    expected: packet.expected_before.live_queue_sha256
  });
  assert(liveQueue.queue.length === packet.expected_before.live_queue_item_count, 'live queue item count changed');
  assert(liveQueue.publication_global_status === 'blocked_no_render', 'live queue publication state must remain blocked_no_render');

  const relayItems = relayPacket.requested_agent5_action?.queue_items || [];
  sameSet(relayItems.map((item) => item.request_id), EXPECTED_REQUEST_IDS, 'relay item request IDs');
  assert(packet.json_patch_operations.length === relayItems.length, 'patch operation count mismatch');

  for (let index = 0; index < packet.json_patch_operations.length; index += 1) {
    const operation = packet.json_patch_operations[index];
    const relayItem = relayItems[index];
    assert(operation.op === 'add', 'patch operation must be add');
    assert(operation.path === '/queue/-', 'patch operation path must append to queue');
    assert(JSON.stringify(operation.value) === JSON.stringify(relayItem), `patch operation ${index} must exactly match relay queue item`);
  }

  const liveHits = countRequestIds(liveQueue.queue, EXPECTED_REQUEST_IDS);
  for (const [requestId, count] of Object.entries(liveHits)) {
    assert(count === 0, `live queue must still lack ${requestId}`, { count });
  }

  const patched = applyPatchInMemory(liveQueue, packet.json_patch_operations);
  const patchedHits = countRequestIds(patched.queue, EXPECTED_REQUEST_IDS);
  for (const [requestId, count] of Object.entries(patchedHits)) {
    assert(count === 1, `patched queue must contain exactly one ${requestId}`, { count });
  }

  assert(patched.queue.length === packet.expected_after.queue_item_count, 'patched queue item count mismatch');
  assert(patched.queue.length === liveQueue.queue.length + EXPECTED_REQUEST_IDS.length, 'patched queue count must equal live queue plus request IDs');
  assert(JSON.stringify(patched.queue) === JSON.stringify(dryRunQueue.queue), 'patched queue array must exactly match dry-run queue array');

  const patchedQueueArraySha = sha256Text(stableJson(patched.queue));
  const patchedDocumentSha = sha256Text(stableJson(patched));
  const dryRunQueueArraySha = sha256Text(stableJson(dryRunQueue.queue));
  assert(patchedQueueArraySha === packet.expected_after.queue_array_sha256, 'patched queue array SHA mismatch');
  assert(patchedDocumentSha === packet.expected_after.patched_document_sha256, 'patched document SHA mismatch');
  assert(dryRunQueueArraySha === packet.dry_run_comparison.dry_run_queue_array_sha256, 'dry-run queue array SHA mismatch');
  assert(patchedQueueArraySha === dryRunQueueArraySha, 'patched queue array must match dry-run queue array SHA');

  for (const artifact of packet.evidence_artifacts || []) {
    assert(fs.existsSync(fullPath(artifact)), `evidence artifact missing: ${artifact}`);
  }
  assert(fs.existsSync(fullPath(PATHS.packetMd)), 'patch markdown artifact missing');

  const result = {
    ok: true,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    validated_packet: PATHS.packet,
    operation_count: packet.json_patch_operations.length,
    request_ids: EXPECTED_REQUEST_IDS,
    live_queue_item_count: liveQueue.queue.length,
    patched_queue_item_count: patched.queue.length,
    dry_run_queue_item_count: dryRunQueue.queue.length,
    live_queue_request_id_hits_now: liveHits,
    patched_queue_request_id_hits: patchedHits,
    live_queue_sha256_now: liveSha,
    packet_expected_live_queue_sha256: packet.expected_before.live_queue_sha256,
    patched_queue_array_sha256: patchedQueueArraySha,
    dry_run_queue_array_sha256: dryRunQueueArraySha,
    patched_document_sha256: patchedDocumentSha,
    boundary: packet.boundary
  };

  writeJson(PATHS.resultJson, result);
  writeText(PATHS.resultMd, renderMarkdown(result));
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
      queue_mutation_performed: false,
      live_queue_mutation_performed: false,
      source_provenance_acceptance_claimed: false,
      qa_acceptance_claimed: false,
      public_runtime_acceptance_claimed: false
    }
  };
  writeJson(PATHS.resultJson, result);
  writeText(PATHS.resultMd, renderMarkdown({
    ok: false,
    completed_at: result.completed_at,
    operation_count: 'failed',
    request_ids: EXPECTED_REQUEST_IDS,
    live_queue_item_count: 'unknown',
    patched_queue_item_count: 'unknown',
    dry_run_queue_item_count: 'unknown',
    live_queue_sha256_now: 'unknown',
    packet_expected_live_queue_sha256: 'unknown',
    patched_queue_array_sha256: 'unknown',
    dry_run_queue_array_sha256: 'unknown',
    boundary: result.boundary
  }));
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
