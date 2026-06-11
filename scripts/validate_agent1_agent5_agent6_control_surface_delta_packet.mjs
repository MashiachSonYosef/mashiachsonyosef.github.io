#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  packet: 'reports/agent1-agent5-agent6-control-surface-delta-packet-2026-06-03.json',
  relayPacket: 'reports/agent1-agent5-agent6-docket-relay-packet-2026-06-03.json',
  relayValidator: 'reports/agent1-agent5-agent6-docket-relay-validator-result-2026-06-03.json',
  relayReadiness: 'reports/agent1-agent5-agent8-relay-readiness-checkpoint-2026-06-03.json',
  liveQueue: 'data/control/agent6_validation_queue.json',
  goalBoard: 'data/control/agent_goal_board.json',
  handoffIndexJson: 'reports/agent5-agent6-handoff-index.json',
  handoffIndexMd: 'reports/agent5-agent6-handoff-index.md',
  result: 'reports/agent1-agent5-agent6-control-surface-delta-validator-result-2026-06-03.json'
};

const HISTORICAL_AGENT1_REQUEST_IDS = [
  'agent6-agent1-source-report-contradiction',
  'agent6-agent1-source-provenance-custody-packet',
  'agent6-agent1-source-custody-closure-decision-packet',
  'agent6-agent1-source-custody-followup-packets'
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
  fs.writeFileSync(fullPath(relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
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

function countHits(text, needle) {
  return text.split(needle).length - 1;
}

function inspectTextSurface(relativePath, requestIds) {
  const exists = fs.existsSync(fullPath(relativePath));
  const text = exists ? readText(relativePath) : '';
  return {
    path: relativePath,
    exists,
    request_id_hits: Object.fromEntries(requestIds.map((requestId) => [requestId, countHits(text, requestId)])),
    present_request_ids: requestIds.filter((requestId) => countHits(text, requestId) > 0),
    missing_request_ids: requestIds.filter((requestId) => countHits(text, requestId) === 0)
  };
}

function assertBoundary(boundary) {
  assert(boundary?.publication_state === 'blocked_no_render', 'publication state must remain blocked_no_render');
  for (const key of [
    'queue_mutation_performed',
    'source_provenance_custody_claimed',
    'source_provenance_acceptance_claimed',
    'source_publication_claimed',
    'source_file_tracking_approval_claimed',
    'source_file_staging_claimed',
    'downstream_direct_artifact_acceptance_claimed',
    'downstream_content_reference_acceptance_claimed',
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

function main() {
  const startedAt = new Date().toISOString();
  const packet = readJson(PATHS.packet);
  const relayPacket = readJson(PATHS.relayPacket);
  const relayValidator = readJson(PATHS.relayValidator);
  const relayReadiness = readJson(PATHS.relayReadiness);
  const liveQueue = readJson(PATHS.liveQueue);
  const requestIds = relayPacket.request_ids || [];

  assert(packet.artifact_type === 'agent1_agent5_agent6_control_surface_delta_packet', 'unexpected packet artifact type');
  assert(relayValidator.ok === true, 'relay validator must be ok');
  assert(relayValidator.status === 'relay_needed_control_surfaces_missing_request_ids', 'relay status must still need relay');
  assert(relayReadiness.status === 'relay_ready_evidence_control_surface_relay_still_needed', 'relay-readiness status mismatch');
  assert(liveQueue.publication_global_status === 'blocked_no_render', 'live queue publication status must remain blocked_no_render');
  assert(packet.status === 'current_agent1_request_ids_absent_historical_agent1_queue_items_present', 'unexpected delta status');
  sameSet(packet.current_request_ids, requestIds, 'current request IDs');
  sameSet(packet.current_request_ids_missing_everywhere, requestIds, 'missing current request IDs');
  sameSet(packet.historical_agent1_request_ids, HISTORICAL_AGENT1_REQUEST_IDS, 'historical request IDs');

  const liveSurfaces = [
    inspectTextSurface(PATHS.liveQueue, requestIds),
    inspectTextSurface(PATHS.goalBoard, requestIds),
    inspectTextSurface(PATHS.handoffIndexJson, requestIds),
    inspectTextSurface(PATHS.handoffIndexMd, requestIds)
  ];
  sameSet(packet.control_surfaces.map((surface) => surface.path), liveSurfaces.map((surface) => surface.path), 'control surface paths');
  for (const liveSurface of liveSurfaces) {
    const packetSurface = packet.control_surfaces.find((surface) => surface.path === liveSurface.path);
    assert(packetSurface, `packet missing surface ${liveSurface.path}`);
    assert(packetSurface.exists === liveSurface.exists, `surface exists mismatch: ${liveSurface.path}`);
    sameSet(packetSurface.present_request_ids, liveSurface.present_request_ids, `present IDs ${liveSurface.path}`);
    sameSet(packetSurface.missing_request_ids, liveSurface.missing_request_ids, `missing IDs ${liveSurface.path}`);
    for (const requestId of requestIds) {
      assert(packetSurface.request_id_hits[requestId] === liveSurface.request_id_hits[requestId], `request hit mismatch ${liveSurface.path} ${requestId}`);
      assert(liveSurface.request_id_hits[requestId] === 0, `${liveSurface.path} should still lack ${requestId}`);
    }
  }

  const historicalById = new Map(packet.historical_queue_items.map((item) => [item.request_id, item]));
  for (const requestId of HISTORICAL_AGENT1_REQUEST_IDS) {
    const item = historicalById.get(requestId);
    assert(item, `missing historical item ${requestId}`);
    assert(item.present_in_live_queue === true, `historical item should remain present in live queue: ${requestId}`);
    assert(typeof item.status === 'string' && item.status.length > 0, `historical item missing status: ${requestId}`);
  }

  assert(packet.existing_source_custody_queue_item_drift?.stale_markers?.includes('missing_current_183_content_reference_rows'), 'expected existing source-custody queue item drift marker');
  sameSet(packet.requested_agent5_or_agent8_action?.request_ids || [], requestIds, 'requested action request IDs');
  const queueItems = packet.requested_agent5_or_agent8_action?.queue_items || [];
  assert(queueItems.length === requestIds.length, 'requested action queue item count mismatch');
  sameSet(queueItems.map((item) => item.request_id), requestIds, 'requested action queue item IDs');

  for (const artifact of packet.evidence_artifacts || []) {
    assert(fs.existsSync(fullPath(artifact)), `evidence artifact missing: ${artifact}`);
  }
  for (const term of REQUIRED_MUST_NOT_ACCEPT) {
    assert((packet.must_not_accept || []).includes(term), `missing must-not-accept term: ${term}`);
  }
  assertBoundary(packet.boundary);

  const result = {
    ok: true,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    validated_packet: PATHS.packet,
    status: packet.status,
    current_request_ids: packet.current_request_ids,
    current_request_ids_missing_everywhere: packet.current_request_ids_missing_everywhere,
    historical_queue_items_present: packet.historical_queue_items.filter((item) => item.present_in_live_queue).length,
    control_surfaces_checked: packet.control_surfaces.length,
    boundary: packet.boundary
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
      queue_mutation_performed: false,
      source_provenance_acceptance_claimed: false,
      qa_acceptance_claimed: false,
      public_runtime_acceptance_claimed: false
    }
  };
  writeJson(PATHS.result, result);
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
