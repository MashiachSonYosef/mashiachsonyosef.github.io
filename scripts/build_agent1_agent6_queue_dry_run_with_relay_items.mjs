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
  outputJson: 'reports/agent1-agent6-validation-queue-dry-run-with-relay-items-2026-06-03.json',
  outputMd: 'reports/agent1-agent6-validation-queue-dry-run-with-relay-items-2026-06-03.md'
};

const EXPECTED_REQUEST_IDS = [
  'agent6-agent1-source-custody-manifest-remediation-review',
  'agent6-agent1-source-custody-tracking-action-review',
  'agent6-agent1-source-custody-license-normalization-review',
  'agent6-agent1-public-hud-source-row-review',
  'agent6-agent1-orot-fill-source-row-review'
];

const BOUNDARY = {
  publication_state: 'blocked_no_render',
  live_queue_mutation_performed: false,
  source_provenance_custody_claimed: false,
  source_provenance_acceptance_claimed: false,
  source_publication_claimed: false,
  source_file_tracking_approval_claimed: false,
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

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
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
    if (key.endsWith('_claimed') || key === 'live_queue_mutation_performed' || key === 'queue_mutation_performed') {
      assert(value === false, `boundary ${key} must be false`);
    }
  }
}

function renderMarkdown(summary) {
  return `# Agent 1 Agent 6 Queue Dry-Run With Relay Items

Generated: ${summary.generated_at}

Highest permissible claim: Agent 1 source/provenance review queue items are dry-run queue-compatible for Agent 5/8 relay consideration.

This is a report-local dry-run copy only. It does not mutate \`${PATHS.liveQueue}\`, Agent 5 handoff surfaces, source files, generated public pages, or control-state JSON.

## Summary

- Status: \`${summary.status}\`
- Live queue: \`${PATHS.liveQueue}\`
- Dry-run queue: \`${PATHS.outputJson}\`
- Live queue item count before dry-run copy: ${summary.live_queue_item_count}
- Relay items appended to dry-run copy: ${summary.inserted_request_ids.length}
- Dry-run queue item count: ${summary.dry_run_queue_item_count}
- Publication state: \`${summary.boundary.publication_state}\`
- Live queue mutation performed: \`${summary.boundary.live_queue_mutation_performed}\`

## Inserted Request IDs

${summary.inserted_request_ids.map((requestId) => `- \`${requestId}\``).join('\n')}

## Live Queue Proof

- Live queue SHA-256 at dry-run build time: \`${summary.live_queue_sha256_before}\`
- Existing live queue hits for inserted IDs before dry-run build: ${JSON.stringify(summary.live_queue_request_id_hits_before)}
- Dry-run request ID hits after append: ${JSON.stringify(summary.dry_run_request_id_hits)}

## Validator Inputs

- Relay packet: \`${PATHS.relayPacket}\`
- Relay validator: \`${PATHS.relayValidator}\`
- Intake-contract validator: \`${PATHS.intakeValidator}\`

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
  const generatedAt = new Date().toISOString();
  const liveQueueText = readText(PATHS.liveQueue);
  const liveQueue = JSON.parse(liveQueueText);
  const relayPacket = readJson(PATHS.relayPacket);
  const relayValidator = readJson(PATHS.relayValidator);
  const intakeValidator = readJson(PATHS.intakeValidator);

  assert(liveQueue.artifact_type === 'agent6_validation_queue', 'live queue artifact type mismatch');
  assert(liveQueue.publication_global_status === 'blocked_no_render', 'live queue publication state must remain blocked_no_render');
  assert(Array.isArray(liveQueue.queue), 'live queue must contain queue array');
  assert(relayValidator.ok === true, 'relay validator must be ok');
  assert(relayValidator.status === 'relay_needed_control_surfaces_missing_request_ids', 'relay status must still require relay');
  assert(intakeValidator.ok === true, 'intake-contract validator must be ok');
  assert(intakeValidator.blocking_findings === 0, 'intake-contract validator must have zero blockers');
  assert(intakeValidator.queue_mutation_performed === false, 'intake-contract validator must be non-mutating');
  assertBoundaryFalse(relayValidator.boundary);
  assertBoundaryFalse(intakeValidator.boundary);

  const requestIds = relayPacket.request_ids || [];
  const queueItems = relayPacket.requested_agent5_action?.queue_items || [];
  sameSet(requestIds, EXPECTED_REQUEST_IDS, 'relay packet request IDs');
  sameSet(queueItems.map((item) => item.request_id), EXPECTED_REQUEST_IDS, 'relay queue item request IDs');

  const liveHitsBefore = countRequestIds(liveQueue.queue, EXPECTED_REQUEST_IDS);
  const existingLiveHits = Object.entries(liveHitsBefore).filter(([, count]) => count > 0);
  assert(existingLiveHits.length === 0, 'live queue already contains one or more Agent 1 relay request IDs', { existingLiveHits });

  for (const item of queueItems) {
    assert(item.submitted_by === 'Agent 5', `${item.request_id} must be Agent-5-relay-shaped`);
    assert(Array.isArray(item.evidence_artifacts) && item.evidence_artifacts.length > 0, `${item.request_id} must have evidence artifacts`);
    assert(String(item.claimed_boundary || '').includes('blocked_no_render'), `${item.request_id} boundary must preserve blocked_no_render`);
    assert((item.what_must_not_be_accepted || []).includes('source/provenance custody'), `${item.request_id} must exclude source/provenance custody`);
    assert((item.what_must_not_be_accepted || []).includes('QA acceptance'), `${item.request_id} must exclude QA acceptance`);
    assert((item.what_must_not_be_accepted || []).includes('accepted translation text'), `${item.request_id} must exclude accepted translation text`);
    for (const artifact of item.evidence_artifacts) {
      assert(fs.existsSync(fullPath(artifact)), `${item.request_id} evidence artifact missing: ${artifact}`);
    }
  }

  const dryRunQueue = JSON.parse(JSON.stringify(liveQueue));
  dryRunQueue.dry_run = true;
  dryRunQueue.dry_run_generated_at = generatedAt;
  dryRunQueue.dry_run_source_queue = PATHS.liveQueue;
  dryRunQueue.dry_run_source_queue_sha256 = sha256(liveQueueText);
  dryRunQueue.dry_run_relay_packet = PATHS.relayPacket;
  dryRunQueue.dry_run_relay_validator = PATHS.relayValidator;
  dryRunQueue.dry_run_intake_validator = PATHS.intakeValidator;
  dryRunQueue.dry_run_inserted_request_ids = EXPECTED_REQUEST_IDS;
  dryRunQueue.dry_run_boundary = BOUNDARY;
  dryRunQueue.queue = [...liveQueue.queue, ...queueItems];

  const dryRunHits = countRequestIds(dryRunQueue.queue, EXPECTED_REQUEST_IDS);
  for (const [requestId, count] of Object.entries(dryRunHits)) {
    assert(count === 1, `dry-run queue must contain exactly one ${requestId}`, { count });
  }

  const summary = {
    generated_at: generatedAt,
    artifact_type: 'agent1_agent6_queue_dry_run_with_relay_items_summary',
    status: 'dry_run_queue_copy_written_no_live_queue_mutation',
    live_queue: PATHS.liveQueue,
    dry_run_queue: PATHS.outputJson,
    relay_packet: PATHS.relayPacket,
    intake_validator: PATHS.intakeValidator,
    live_queue_item_count: liveQueue.queue.length,
    dry_run_queue_item_count: dryRunQueue.queue.length,
    inserted_request_ids: EXPECTED_REQUEST_IDS,
    live_queue_request_id_hits_before: liveHitsBefore,
    dry_run_request_id_hits: dryRunHits,
    live_queue_sha256_before: sha256(liveQueueText),
    boundary: BOUNDARY
  };

  writeJson(PATHS.outputJson, dryRunQueue);
  writeText(PATHS.outputMd, renderMarkdown(summary));
  console.log(JSON.stringify(summary, null, 2));
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
