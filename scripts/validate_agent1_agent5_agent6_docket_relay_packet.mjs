import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  packet: 'reports/agent1-agent5-agent6-docket-relay-packet-2026-06-03.json',
  docket: 'reports/agent1-source-provenance-agent6-ready-docket-2026-06-03.json',
  docketValidator: 'reports/agent1-source-provenance-agent6-ready-docket-validator-result-2026-06-03.json',
  result: 'reports/agent1-agent5-agent6-docket-relay-validator-result-2026-06-03.json'
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
].sort((a, b) => a.localeCompare(b));

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
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
  assert(JSON.stringify(actual) === JSON.stringify(expected), `${label} mismatch`, { actual, expected });
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

function assertBoundary(boundary) {
  assert(boundary?.publication_state === 'blocked_no_render', 'publication_state must remain blocked_no_render');
  assert(boundary?.queue_mutation_performed === false, 'queue mutation must not be performed');
  for (const key of [
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
    assert(boundary[key] === false, `boundary ${key} must be false`);
  }
}

function main() {
  const startedAt = new Date().toISOString();
  const packet = readJson(PATHS.packet);
  const docket = readJson(PATHS.docket);
  const docketValidator = readJson(PATHS.docketValidator);

  assert(packet.artifact_type === 'agent1_agent5_agent6_docket_relay_packet', 'unexpected packet artifact type');
  assert(docketValidator.ok === true, 'Agent 6-ready docket validator must pass');
  assertBoundary(packet.boundary);
  sameSet(sorted(packet.must_not_accept || []), MUST_NOT_ACCEPT, 'must-not-accept list');

  const expectedRequestIds = docket.review_items.map((item) => item.request_id);
  sameSet(sorted(packet.request_ids), sorted(expectedRequestIds), 'request id set');
  sameSet(sorted(packet.requested_agent5_action?.request_ids || []), sorted(expectedRequestIds), 'requested Agent 5 action request id set');

  const queueItems = packet.requested_agent5_action?.queue_items || [];
  assert(queueItems.length === expectedRequestIds.length, 'queue item count mismatch');
  sameSet(sorted(queueItems.map((item) => item.request_id)), sorted(expectedRequestIds), 'queue item request id set');

  const liveControlSurfaces = CONTROL_SURFACES.map((controlSurface) => inspectControlSurface(controlSurface, expectedRequestIds));
  sameSet(sorted(packet.control_surfaces.map((surface) => surface.path)), sorted(CONTROL_SURFACES), 'control surface set');
  for (const liveSurface of liveControlSurfaces) {
    const packetSurface = packet.control_surfaces.find((surface) => surface.path === liveSurface.path);
    assert(packetSurface, `packet missing control surface ${liveSurface.path}`);
    assert(packetSurface.exists === liveSurface.exists, `control surface existence mismatch for ${liveSurface.path}`);
    sameSet(sorted(packetSurface.missing_request_ids), sorted(liveSurface.missing_request_ids), `missing request ids for ${liveSurface.path}`);
    sameSet(sorted(packetSurface.present_request_ids), sorted(liveSurface.present_request_ids), `present request ids for ${liveSurface.path}`);
    assert(JSON.stringify(packetSurface.request_id_hits) === JSON.stringify(liveSurface.request_id_hits), `request id hits mismatch for ${liveSurface.path}`, {
      packet: packetSurface.request_id_hits,
      live: liveSurface.request_id_hits
    });
  }

  const requestIdsMissingEverywhere = expectedRequestIds.filter((requestId) =>
    liveControlSurfaces.every((surface) => surface.request_id_hits[requestId] === 0)
  );
  const requestIdsPresentSomewhere = expectedRequestIds.filter((requestId) =>
    liveControlSurfaces.some((surface) => surface.request_id_hits[requestId] > 0)
  );
  sameSet(sorted(packet.request_ids_missing_everywhere), sorted(requestIdsMissingEverywhere), 'missing everywhere request ids');
  sameSet(sorted(packet.request_ids_present_somewhere), sorted(requestIdsPresentSomewhere), 'present somewhere request ids');

  const expectedStatus = requestIdsMissingEverywhere.length === 0
    ? 'relay_already_represented_in_control_surfaces'
    : 'relay_needed_control_surfaces_missing_request_ids';
  assert(packet.status === expectedStatus, 'relay status mismatch', { packet: packet.status, expected: expectedStatus });

  for (const artifact of packet.evidence_artifacts || []) {
    assert(fs.existsSync(path.join(repoRoot, artifact)), `evidence artifact missing: ${artifact}`);
  }

  const result = {
    ok: true,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    validated_packet: PATHS.packet,
    status: packet.status,
    request_ids: expectedRequestIds,
    request_ids_missing_everywhere: requestIdsMissingEverywhere,
    request_ids_present_somewhere: requestIdsPresentSomewhere,
    control_surfaces: liveControlSurfaces.map((surface) => ({
      path: surface.path,
      missing_request_ids: surface.missing_request_ids.length,
      present_request_ids: surface.present_request_ids.length
    })),
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
    details: error.details || null
  };
  writeJson(PATHS.result, result);
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
