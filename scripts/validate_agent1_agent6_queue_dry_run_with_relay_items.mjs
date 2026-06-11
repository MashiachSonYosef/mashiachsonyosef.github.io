#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const repoRoot = process.cwd();

const PATHS = {
  liveQueue: 'data/control/agent6_validation_queue.json',
  relayPacket: 'reports/agent1-agent5-agent6-docket-relay-packet-2026-06-03.json',
  intakeValidator: 'reports/agent1-agent6-queue-intake-contract-validator-result-2026-06-03.json',
  dryRunQueue: 'reports/agent1-agent6-validation-queue-dry-run-with-relay-items-2026-06-03.json',
  dryRunMd: 'reports/agent1-agent6-validation-queue-dry-run-with-relay-items-2026-06-03.md',
  dryRunHealth: 'reports/agent1-agent6-validation-queue-dry-run-health-2026-06-03.md',
  resultJson: 'reports/agent1-agent6-validation-queue-dry-run-validator-result-2026-06-03.json',
  resultMd: 'reports/agent1-agent6-validation-queue-dry-run-validator-result-2026-06-03.md'
};

const EXPECTED_REQUEST_IDS = [
  'agent6-agent1-source-custody-manifest-remediation-review',
  'agent6-agent1-source-custody-tracking-action-review',
  'agent6-agent1-source-custody-license-normalization-review',
  'agent6-agent1-public-hud-source-row-review',
  'agent6-agent1-orot-fill-source-row-review'
];

const EXPECTED_MUST_NOT_ACCEPT = [
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

function runExistingQueueValidator() {
  return spawnSync(process.execPath, [
    'scripts/validate_agent6_validation_queue.mjs',
    PATHS.dryRunQueue,
    PATHS.dryRunHealth
  ], {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 50
  });
}

function renderMarkdown(result) {
  return `# Agent 1 Agent 6 Queue Dry-Run Validator Result

Generated: ${result.completed_at}

## Summary

- OK: \`${result.ok}\`
- Existing Agent 6 queue validator exit: \`${result.existing_queue_validator_exit_code}\`
- Existing Agent 6 queue validator health report: \`${PATHS.dryRunHealth}\`
- Live queue item count: ${result.live_queue_item_count}
- Dry-run queue item count: ${result.dry_run_queue_item_count}
- Inserted request IDs: ${result.inserted_request_ids.map((requestId) => `\`${requestId}\``).join(', ')}
- Live queue mutation performed: \`${result.boundary.live_queue_mutation_performed}\`
- Publication state: \`${result.boundary.publication_state}\`

## Live Queue Proof

- Live queue SHA-256 now: \`${result.live_queue_sha256_now}\`
- Live queue SHA-256 recorded by dry-run builder: \`${result.live_queue_sha256_recorded_by_dry_run}\`
- Live queue request ID hits now: ${JSON.stringify(result.live_queue_request_id_hits_now)}
- Dry-run request ID hits: ${JSON.stringify(result.dry_run_request_id_hits)}

## Boundary

- Source/provenance custody: not claimed.
- Source publication: not claimed.
- Source-file tracking approval: not claimed.
- QA acceptance: not claimed.
- Public/runtime acceptance: not claimed.
- Publication readiness: not claimed.
- Route publication support, Definition authority, product/data acceptance, usage-as-definition authority, translation output, and accepted translation text: not claimed.

## Validator Output

\`\`\`text
${(result.existing_queue_validator_stdout || '').trim()}
${(result.existing_queue_validator_stderr || '').trim()}
\`\`\`
`;
}

function main() {
  const startedAt = new Date().toISOString();
  const validatorRun = runExistingQueueValidator();
  const liveQueueText = readText(PATHS.liveQueue);
  const liveQueue = JSON.parse(liveQueueText);
  const dryRunQueue = readJson(PATHS.dryRunQueue);
  const relayPacket = readJson(PATHS.relayPacket);
  const intakeValidator = readJson(PATHS.intakeValidator);

  assert(validatorRun.status === 0, 'existing Agent 6 queue validator failed for dry-run queue', {
    status: validatorRun.status,
    stdout: validatorRun.stdout,
    stderr: validatorRun.stderr
  });
  assert(fs.existsSync(fullPath(PATHS.dryRunHealth)), 'dry-run health report missing');
  assert(fs.existsSync(fullPath(PATHS.dryRunMd)), 'dry-run markdown summary missing');
  assert(intakeValidator.ok === true, 'intake validator must be ok');
  assert(intakeValidator.blocking_findings === 0, 'intake validator must have zero blockers');
  assert(intakeValidator.queue_mutation_performed === false, 'intake validator must be non-mutating');

  assert(liveQueue.artifact_type === 'agent6_validation_queue', 'live queue artifact type mismatch');
  assert(dryRunQueue.artifact_type === 'agent6_validation_queue', 'dry-run queue artifact type mismatch');
  assert(liveQueue.publication_global_status === 'blocked_no_render', 'live queue publication state must remain blocked_no_render');
  assert(dryRunQueue.publication_global_status === 'blocked_no_render', 'dry-run queue publication state must remain blocked_no_render');
  assert(dryRunQueue.dry_run === true, 'dry-run queue must mark dry_run=true');
  assertBoundaryFalse(dryRunQueue.dry_run_boundary);

  sameSet(dryRunQueue.dry_run_inserted_request_ids, EXPECTED_REQUEST_IDS, 'dry-run inserted request IDs');
  sameSet(relayPacket.request_ids, EXPECTED_REQUEST_IDS, 'relay packet request IDs');

  const liveHitsNow = countRequestIds(liveQueue.queue, EXPECTED_REQUEST_IDS);
  const dryRunHits = countRequestIds(dryRunQueue.queue, EXPECTED_REQUEST_IDS);
  for (const [requestId, count] of Object.entries(liveHitsNow)) {
    assert(count === 0, `live queue must still lack ${requestId}`, { count });
  }
  for (const [requestId, count] of Object.entries(dryRunHits)) {
    assert(count === 1, `dry-run queue must contain exactly one ${requestId}`, { count });
  }

  assert(dryRunQueue.queue.length === liveQueue.queue.length + EXPECTED_REQUEST_IDS.length, 'dry-run queue item count must equal live count plus inserted items');
  assert(dryRunQueue.dry_run_source_queue_sha256 === sha256(liveQueueText), 'live queue sha256 changed after dry-run build; rerun builder before relying on dry-run evidence');

  const appendedItems = dryRunQueue.queue.filter((item) => EXPECTED_REQUEST_IDS.includes(item.request_id));
  const relayItems = relayPacket.requested_agent5_action.queue_items;
  assert(appendedItems.length === relayItems.length, 'dry-run appended item count mismatch');
  for (const item of appendedItems) {
    const relayItem = relayItems.find((candidate) => candidate.request_id === item.request_id);
    assert(relayItem, `relay item missing for ${item.request_id}`);
    assert(JSON.stringify(item) === JSON.stringify(relayItem), `${item.request_id} dry-run item must exactly match relay packet queue item`);
    assert(item.submitted_by === 'Agent 5', `${item.request_id} must be submitted by Agent 5`);
    assert(Array.isArray(item.evidence_artifacts) && item.evidence_artifacts.length > 0, `${item.request_id} must have evidence artifacts`);
    for (const artifact of item.evidence_artifacts) {
      assert(fs.existsSync(fullPath(artifact)), `${item.request_id} evidence artifact missing: ${artifact}`);
    }
    for (const term of EXPECTED_MUST_NOT_ACCEPT) {
      assert((item.what_must_not_be_accepted || []).includes(term), `${item.request_id} missing no-acceptance term: ${term}`);
    }
  }

  const result = {
    ok: true,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    validator: 'scripts/validate_agent1_agent6_queue_dry_run_with_relay_items.mjs',
    dry_run_queue: PATHS.dryRunQueue,
    dry_run_health: PATHS.dryRunHealth,
    existing_queue_validator_exit_code: validatorRun.status,
    existing_queue_validator_stdout: validatorRun.stdout,
    existing_queue_validator_stderr: validatorRun.stderr,
    live_queue_item_count: liveQueue.queue.length,
    dry_run_queue_item_count: dryRunQueue.queue.length,
    inserted_request_ids: EXPECTED_REQUEST_IDS,
    live_queue_request_id_hits_now: liveHitsNow,
    dry_run_request_id_hits: dryRunHits,
    live_queue_sha256_now: sha256(liveQueueText),
    live_queue_sha256_recorded_by_dry_run: dryRunQueue.dry_run_source_queue_sha256,
    boundary: {
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
    }
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
    existing_queue_validator_exit_code: result.details?.status ?? 'not_run_or_failed',
    live_queue_item_count: 'unknown',
    dry_run_queue_item_count: 'unknown',
    inserted_request_ids: EXPECTED_REQUEST_IDS,
    live_queue_sha256_now: 'unknown',
    live_queue_sha256_recorded_by_dry_run: 'unknown',
    live_queue_request_id_hits_now: {},
    dry_run_request_id_hits: {},
    boundary: result.boundary,
    existing_queue_validator_stdout: result.details?.stdout || '',
    existing_queue_validator_stderr: `${result.error}\n${result.details?.stderr || ''}`
  }));
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
