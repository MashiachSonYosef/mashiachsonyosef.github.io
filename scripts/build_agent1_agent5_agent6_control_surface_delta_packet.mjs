#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  liveQueue: 'data/control/agent6_validation_queue.json',
  goalBoard: 'data/control/agent_goal_board.json',
  handoffIndexJson: 'reports/agent5-agent6-handoff-index.json',
  handoffIndexMd: 'reports/agent5-agent6-handoff-index.md',
  relayPacket: 'reports/agent1-agent5-agent6-docket-relay-packet-2026-06-03.json',
  relayValidator: 'reports/agent1-agent5-agent6-docket-relay-validator-result-2026-06-03.json',
  relayReadiness: 'reports/agent1-agent5-agent8-relay-readiness-checkpoint-2026-06-03.json',
  queueIntakeCandidate: 'reports/agent1-source-custody-queue-intake-candidate.json',
  outputJson: 'reports/agent1-agent5-agent6-control-surface-delta-packet-2026-06-03.json',
  outputMd: 'reports/agent1-agent5-agent6-control-surface-delta-packet-2026-06-03.md'
};

const HISTORICAL_AGENT1_REQUEST_IDS = [
  'agent6-agent1-source-report-contradiction',
  'agent6-agent1-source-provenance-custody-packet',
  'agent6-agent1-source-custody-closure-decision-packet',
  'agent6-agent1-source-custody-followup-packets'
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

function writeText(relativePath, value) {
  fs.writeFileSync(fullPath(relativePath), value, 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function countHits(text, needle) {
  return text.split(needle).length - 1;
}

function inspectTextSurface(relativePath, requestIds) {
  const exists = fs.existsSync(fullPath(relativePath));
  const text = exists ? readText(relativePath) : '';
  const request_id_hits = Object.fromEntries(requestIds.map((requestId) => [requestId, countHits(text, requestId)]));
  return {
    path: relativePath,
    exists,
    bytes: exists ? Buffer.byteLength(text) : 0,
    request_id_hits,
    present_request_ids: requestIds.filter((requestId) => request_id_hits[requestId] > 0),
    missing_request_ids: requestIds.filter((requestId) => request_id_hits[requestId] === 0)
  };
}

function inspectHistoricalQueueItems(queue) {
  const items = queue.queue || [];
  return HISTORICAL_AGENT1_REQUEST_IDS.map((requestId) => {
    const index = items.findIndex((item) => item?.request_id === requestId);
    const item = index >= 0 ? items[index] : null;
    return {
      request_id: requestId,
      present_in_live_queue: Boolean(item),
      queue_index: index >= 0 ? index : null,
      status: item?.status || null,
      gate: item?.gate || null,
      requested_verdict: item?.requested_verdict || null,
      scope: item?.scope || null
    };
  });
}

function formatList(values) {
  return values.map((value) => `- ${value}`).join('\n');
}

function main() {
  const relayPacket = readJson(PATHS.relayPacket);
  const relayValidator = readJson(PATHS.relayValidator);
  const relayReadiness = readJson(PATHS.relayReadiness);
  const queueIntakeCandidate = readJson(PATHS.queueIntakeCandidate);
  const liveQueue = readJson(PATHS.liveQueue);

  assert(relayValidator.ok === true, 'relay validator must pass');
  assert(relayValidator.status === 'relay_needed_control_surfaces_missing_request_ids', 'relay must still need control-surface relay');
  assert(relayReadiness.status === 'relay_ready_evidence_control_surface_relay_still_needed', 'relay readiness must still require control-surface relay');
  assert(liveQueue.publication_global_status === 'blocked_no_render', 'live queue publication state must remain blocked_no_render');

  const requestIds = relayPacket.request_ids || [];
  const controlSurfaces = [
    inspectTextSurface(PATHS.liveQueue, requestIds),
    inspectTextSurface(PATHS.goalBoard, requestIds),
    inspectTextSurface(PATHS.handoffIndexJson, requestIds),
    inspectTextSurface(PATHS.handoffIndexMd, requestIds)
  ];
  const historicalQueueItems = inspectHistoricalQueueItems(liveQueue);
  const existingQueueDrift = queueIntakeCandidate.existing_queue_item?.stale_markers || [];

  const missingEverywhere = requestIds.filter((requestId) =>
    controlSurfaces.every((surface) => surface.request_id_hits[requestId] === 0)
  );
  const status = missingEverywhere.length === requestIds.length
    ? 'current_agent1_request_ids_absent_historical_agent1_queue_items_present'
    : 'partial_current_agent1_request_id_signal_detected';

  const packet = {
    generated_at: new Date().toISOString(),
    artifact_type: 'agent1_agent5_agent6_control_surface_delta_packet',
    status,
    scope: 'Non-mutating delta between historical Agent 1 control-surface entries and the current five-item Agent 6-ready docket',
    current_request_ids: requestIds,
    current_request_ids_missing_everywhere: missingEverywhere,
    historical_agent1_request_ids: HISTORICAL_AGENT1_REQUEST_IDS,
    historical_queue_items: historicalQueueItems,
    existing_source_custody_queue_item_drift: {
      request_id: queueIntakeCandidate.existing_queue_item?.request_id || queueIntakeCandidate.queue_item_candidate?.request_id || 'agent6-agent1-source-custody-closure-decision-packet',
      stale_markers: existingQueueDrift
    },
    control_surfaces: controlSurfaces,
    requested_agent5_or_agent8_action: {
      action: 'append_or_relay_current_five_agent1_request_ids_without_erasing_historical_agent6_verdicts',
      source_relay_packet: PATHS.relayPacket,
      request_ids: requestIds,
      queue_items: relayPacket.requested_agent5_action?.queue_items || [],
      note: 'Historical Agent 1 queue entries remain Agent 6 verdict/control history. The current five request IDs are separate follow-up review candidates and are absent from checked control surfaces.'
    },
    evidence_artifacts: [
      PATHS.relayPacket,
      PATHS.relayValidator,
      PATHS.relayReadiness,
      PATHS.queueIntakeCandidate,
      'reports/agent1-source-custody-refresh-result.json',
      'reports/agent1-source-provenance-agent6-ready-docket-2026-06-03.json',
      'reports/agent1-source-provenance-agent6-ready-docket-validator-result-2026-06-03.json'
    ],
    blocker: {
      blocker_id: 'current_agent1_review_request_ids_absent_from_control_surfaces',
      reason: 'Historical Agent 1 queue entries are present, but the current five Agent 6-ready review request IDs are absent from the checked queue, goal board, and handoff surfaces. Agent 1 must not mutate those surfaces.'
    },
    boundary: {
      agent1_status: 'control-surface delta evidence only / awaiting-Agent-5-or-Agent-8 relay and Agent-6 disposition',
      publication_state: 'blocked_no_render',
      queue_mutation_performed: false,
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
    },
    must_not_accept: MUST_NOT_ACCEPT
  };

  writeJson(PATHS.outputJson, packet);
  writeText(PATHS.outputMd, `# Agent 1 / Agent 5 / Agent 6 Control-Surface Delta Packet

Generated: ${packet.generated_at}

Highest permissible claim: control-surface delta evidence prepared for Agent 5/Agent 8 relay and Agent 6 disposition planning.

This packet does not mutate \`${PATHS.liveQueue}\`, \`${PATHS.goalBoard}\`, Agent 5 handoff surfaces, source files, render outputs, or publication state.

## Summary

- Status: \`${packet.status}\`
- Current Agent 1 request IDs: ${packet.current_request_ids.length}
- Current request IDs missing from all checked control surfaces: ${packet.current_request_ids_missing_everywhere.length}
- Historical Agent 1 request IDs checked in live queue: ${packet.historical_agent1_request_ids.length}
- Publication state: \`${packet.boundary.publication_state}\`
- Queue mutation performed: \`${packet.boundary.queue_mutation_performed}\`

## Current Request IDs Missing From Control Surfaces

${formatList(packet.current_request_ids_missing_everywhere.map((requestId) => `\`${requestId}\``))}

## Historical Agent 1 Queue Items

${packet.historical_queue_items.map((item) => `- \`${item.request_id}\`: present \`${item.present_in_live_queue}\`, status \`${item.status || 'missing'}\`, queue index \`${item.queue_index ?? 'missing'}\``).join('\n')}

## Existing Source-Custody Queue Item Drift

- Request ID: \`${packet.existing_source_custody_queue_item_drift.request_id}\`
- Stale markers: ${packet.existing_source_custody_queue_item_drift.stale_markers.length ? packet.existing_source_custody_queue_item_drift.stale_markers.map((marker) => `\`${marker}\``).join(', ') : 'none'}

## Checked Control Surfaces

${packet.control_surfaces.map((surface) => `- \`${surface.path}\`: exists \`${surface.exists}\`, present current request IDs ${surface.present_request_ids.length}, missing current request IDs ${surface.missing_request_ids.length}`).join('\n')}

## Requested Agent 5 / Agent 8 Action

Relay or insert the current five queue items from \`${PATHS.relayPacket}\` only if authorized. Preserve historical Agent 6 verdict/control entries; do not erase or reinterpret them as current follow-up disposition.

## Evidence Artifacts

${formatList(packet.evidence_artifacts.map((artifact) => `\`${artifact}\``))}

## Must Not Accept

${formatList(MUST_NOT_ACCEPT)}

## Agent 8 Callback

- status: control-surface delta packet produced; current Agent 1 request IDs absent while historical Agent 1 queue items remain
- artifact: \`${PATHS.outputMd}\`
- machine artifact: \`${PATHS.outputJson}\`
- blockers: five current Agent 1 request IDs are absent from checked Agent 6/Agent 5 control surfaces; Agent 1 cannot mutate those surfaces
- next action needed: Agent 5/Agent 8 relay or insert the five exact queue items if authorized, preserving historical Agent 6 verdict/control entries and every boundary
- continue condition: continue Agent 1 source/provenance evidence maintenance without render, staging, commit, publication, queue mutation, runtime validation, or custody acceptance
`);

  console.log(JSON.stringify({
    ok: true,
    output_json: PATHS.outputJson,
    output_md: PATHS.outputMd,
    status: packet.status,
    current_request_ids_missing_everywhere: packet.current_request_ids_missing_everywhere,
    historical_queue_items_present: historicalQueueItems.filter((item) => item.present_in_live_queue).length
  }, null, 2));
}

main();
