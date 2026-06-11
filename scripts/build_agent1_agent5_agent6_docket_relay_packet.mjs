import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  docket: 'reports/agent1-source-provenance-agent6-ready-docket-2026-06-03.json',
  docketMd: 'reports/agent1-source-provenance-agent6-ready-docket-2026-06-03.md',
  docketValidator: 'reports/agent1-source-provenance-agent6-ready-docket-validator-result-2026-06-03.json',
  agent1State: 'reports/agent1-state.md',
  outputJson: 'reports/agent1-agent5-agent6-docket-relay-packet-2026-06-03.json',
  outputMd: 'reports/agent1-agent5-agent6-docket-relay-packet-2026-06-03.md'
};

const CONTROL_SURFACES = [
  'data/control/agent6_validation_queue.json',
  'data/control/agent_goal_board.json',
  'reports/agent5-agent6-handoff-index.json',
  'reports/agent5-agent6-handoff-index.md'
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

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(repoRoot, relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeText(relativePath, value) {
  fs.writeFileSync(path.join(repoRoot, relativePath), value, 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function countHits(text, needle) {
  return text.split(needle).length - 1;
}

function inspectControlSurface(controlSurface, requestIds) {
  const fullPath = path.join(repoRoot, controlSurface);
  const exists = fs.existsSync(fullPath);
  const text = exists ? readText(controlSurface) : '';
  return {
    path: controlSurface,
    exists,
    bytes: exists ? Buffer.byteLength(text) : 0,
    request_id_hits: Object.fromEntries(requestIds.map((requestId) => [requestId, countHits(text, requestId)])),
    missing_request_ids: requestIds.filter((requestId) => countHits(text, requestId) === 0),
    present_request_ids: requestIds.filter((requestId) => countHits(text, requestId) > 0)
  };
}

function formatList(values) {
  return values.map((value) => `- ${value}`).join('\n');
}

function formatControlSurface(surface) {
  return `- \`${surface.path}\`: ${surface.exists ? 'exists' : 'missing'}, missing ${surface.missing_request_ids.length}/${Object.keys(surface.request_id_hits).length} request ids`;
}

function main() {
  const docket = readJson(PATHS.docket);
  const docketValidator = readJson(PATHS.docketValidator);
  assert(docketValidator.ok === true, 'Agent 6-ready docket validator must pass');

  const requestIds = docket.review_items.map((item) => item.request_id);
  const candidateQueueItems = docket.review_items.map((item) => {
    const candidate = readJson(item.candidate_json);
    return candidate.requested_queue_item;
  });

  const control_surfaces = CONTROL_SURFACES.map((controlSurface) => inspectControlSurface(controlSurface, requestIds));
  const missingBySurface = Object.fromEntries(control_surfaces.map((surface) => [surface.path, surface.missing_request_ids]));
  const requestIdsMissingEverywhere = requestIds.filter((requestId) =>
    control_surfaces.every((surface) => surface.request_id_hits[requestId] === 0)
  );
  const requestIdsPresentSomewhere = requestIds.filter((requestId) =>
    control_surfaces.some((surface) => surface.request_id_hits[requestId] > 0)
  );

  const relayStatus = requestIdsMissingEverywhere.length === 0
    ? 'relay_already_represented_in_control_surfaces'
    : 'relay_needed_control_surfaces_missing_request_ids';

  const packet = {
    generated_at: new Date().toISOString(),
    artifact_type: 'agent1_agent5_agent6_docket_relay_packet',
    status: relayStatus,
    scope: 'Non-mutating relay packet for Agent 5/Agent 8 to submit validated Agent 1 source/provenance review candidates to Agent 6',
    source_docket: PATHS.docket,
    source_docket_validator: PATHS.docketValidator,
    request_ids: requestIds,
    request_ids_missing_everywhere: requestIdsMissingEverywhere,
    request_ids_present_somewhere: requestIdsPresentSomewhere,
    control_surfaces,
    missing_by_control_surface: missingBySurface,
    requested_agent5_action: {
      action: 'relay_or_insert_agent1_agent6_ready_docket_items_without_widening_boundaries',
      target_queue: 'data/control/agent6_validation_queue.json',
      target_handoff_surfaces: [
        'reports/agent5-agent6-handoff-index.json',
        'reports/agent5-agent6-handoff-index.md'
      ],
      request_ids: requestIds,
      queue_items: candidateQueueItems,
      boundary: 'Agent 1 supplies relay-ready evidence only. Agent 5/Agent 8 may relay these items to Agent 6, but Agent 1 does not mutate the queue and no Agent 6 acceptance is implied.'
    },
    evidence_artifacts: [
      PATHS.docketMd,
      PATHS.docket,
      PATHS.docketValidator,
      PATHS.agent1State,
      'reports/agent1-source-custody-refresh-result.json',
      'reports/agent1-source-custody-refresh-result.md',
      ...docket.review_items.flatMap((item) => [item.candidate_artifact, item.candidate_json, item.validator_result])
    ],
    boundary: {
      agent1_status: 'relay-ready evidence / awaiting-Agent-5-or-Agent-8 relay and Agent-6 disposition',
      publication_state: 'blocked_no_render',
      queue_mutation_performed: false,
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
  writeText(PATHS.outputMd, `# Agent 1 to Agent 5/6 Docket Relay Packet

Generated: ${packet.generated_at}

Highest permissible claim: Agent 1 source/provenance review candidates are relay-ready evidence.

This packet does not mutate the Agent 6 queue, Agent goal board, or Agent 5 handoff surfaces. It provides exact request IDs and queue items for Agent 5/Agent 8 relay only.

Publication remains \`blocked_no_render\`.

## Relay Status

- Status: \`${packet.status}\`
- Source docket: \`${PATHS.docketMd}\`
- Source docket validator: \`${PATHS.docketValidator}\`
- Request IDs missing from all checked control surfaces: ${packet.request_ids_missing_everywhere.length}
- Request IDs present in at least one checked control surface: ${packet.request_ids_present_somewhere.length}

## Request IDs

${formatList(packet.request_ids.map((requestId) => `\`${requestId}\``))}

## Control Surface Observations

${control_surfaces.map(formatControlSurface).join('\n')}

## Requested Agent 5 / Agent 8 Action

Relay the ${requestIds.length} queue items in \`${PATHS.outputJson}\` under \`requested_agent5_action.queue_items\` to Agent 6 if this lane is authorized for queue/handoff sync. Preserve every \`claimed_boundary\`, \`known_risks\`, \`what_must_not_be_accepted\`, and \`next_agent6_action\` field exactly.

Do not treat this packet as Agent 6 acceptance, source/provenance custody, source publication, source-file tracking approval, QA acceptance, public/runtime acceptance, publication readiness, route publication support, or accepted text.

## Evidence Artifacts

${formatList(packet.evidence_artifacts.map((artifact) => `\`${artifact}\``))}

## Must Not Accept

${formatList(MUST_NOT_ACCEPT)}

## Agent 8 Callback

- status: non-mutating Agent 1 relay packet produced; evidence-ready / awaiting-Agent-5-or-Agent-8 relay and Agent-6 disposition
- artifact: \`${PATHS.outputMd}\`
- machine artifact: \`${PATHS.outputJson}\`
- blockers: ${requestIds.length} Agent 1 request IDs are absent from checked control surfaces; Agent 1 cannot mutate Agent 6 queue; Agent 6 has not disposed source/provenance custody
- next action needed: Agent 5/Agent 8 relay or insert the ${requestIds.length} exact queue items if authorized, preserving all boundaries
- continue condition: continue Agent 1 source/provenance evidence maintenance without render, staging, commit, publication, queue mutation, runtime validation, or custody acceptance
`);

  console.log(JSON.stringify({
    ok: true,
    output_json: PATHS.outputJson,
    output_md: PATHS.outputMd,
    status: packet.status,
    request_ids_missing_everywhere: requestIdsMissingEverywhere,
    control_surfaces: control_surfaces.map((surface) => ({
      path: surface.path,
      missing_request_ids: surface.missing_request_ids.length,
      present_request_ids: surface.present_request_ids.length
    }))
  }, null, 2));
}

main();
