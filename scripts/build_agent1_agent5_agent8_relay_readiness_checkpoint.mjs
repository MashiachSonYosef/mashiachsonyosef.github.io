#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  refreshResult: 'reports/agent1-source-custody-refresh-result.json',
  docketValidator: 'reports/agent1-source-provenance-agent6-ready-docket-validator-result-2026-06-03.json',
  relayPacket: 'reports/agent1-agent5-agent6-docket-relay-packet-2026-06-03.json',
  relayValidator: 'reports/agent1-agent5-agent6-docket-relay-validator-result-2026-06-03.json',
  intakeValidator: 'reports/agent1-agent6-queue-intake-contract-validator-result-2026-06-03.json',
  dryRunQueue: 'reports/agent1-agent6-validation-queue-dry-run-with-relay-items-2026-06-03.json',
  dryRunHealth: 'reports/agent1-agent6-validation-queue-dry-run-health-2026-06-03.md',
  dryRunValidator: 'reports/agent1-agent6-validation-queue-dry-run-validator-result-2026-06-03.json',
  agent1State: 'reports/agent1-state.md',
  outputJson: 'reports/agent1-agent5-agent8-relay-readiness-checkpoint-2026-06-03.json',
  outputMd: 'reports/agent1-agent5-agent8-relay-readiness-checkpoint-2026-06-03.md'
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
  'route publication support',
  'Definition authority',
  'product/data acceptance',
  'product/data gate acceptance',
  'usage-as-definition authority',
  'translation output',
  'accepted translation text'
];

const REQUIRED_QUEUE_NO_ACCEPTANCE_TERMS = [
  'source/provenance custody',
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

function writeText(relativePath, value) {
  fs.writeFileSync(path.join(repoRoot, relativePath), value, 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function sorted(values) {
  return [...values].sort((a, b) => a.localeCompare(b));
}

function sameSet(actual, expected) {
  const left = sorted(actual);
  const right = sorted(expected);
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function formatList(values) {
  return values.map((value) => `- ${value}`).join('\n');
}

function assertNoAcceptanceBoundary(boundary) {
  assert(boundary?.publication_state === 'blocked_no_render', 'publication state must remain blocked_no_render');
  for (const key of [
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
    if (Object.hasOwn(boundary || {}, key)) {
      assert(boundary[key] === false, `boundary ${key} must be false`);
    }
  }
}

function main() {
  const refresh = readJson(PATHS.refreshResult);
  const docketValidator = readJson(PATHS.docketValidator);
  const relayPacket = readJson(PATHS.relayPacket);
  const relayValidator = readJson(PATHS.relayValidator);
  const intakeValidator = readJson(PATHS.intakeValidator);
  const dryRunValidator = readJson(PATHS.dryRunValidator);

  assert(refresh.ok === true, 'refresh result must be ok');
  assert(docketValidator.ok === true, 'Agent 6-ready docket validator must be ok');
  assert(relayValidator.ok === true, 'relay validator must be ok');
  assert(intakeValidator.ok === true, 'Agent 6 intake-contract validator must be ok');
  assert(dryRunValidator.ok === true, 'Agent 6 queue dry-run validator must be ok');
  assert(intakeValidator.blocking_findings === 0, 'Agent 6 intake-contract validator must have zero blockers');
  assert(relayValidator.status === 'relay_needed_control_surfaces_missing_request_ids', 'relay status must remain the expected blocker state');
  assert(dryRunValidator.existing_queue_validator_exit_code === 0, 'dry-run queue must pass the existing Agent 6 queue validator');
  assert(dryRunValidator.live_queue_item_count === 36, 'dry-run validator live queue count must match current live queue count');
  assert(dryRunValidator.dry_run_queue_item_count === dryRunValidator.live_queue_item_count + EXPECTED_REQUEST_IDS.length, 'dry-run validator dry-run queue count must equal current live queue count plus relay items');
  assert(sameSet(relayValidator.request_ids || [], EXPECTED_REQUEST_IDS), 'relay request ID set mismatch');
  assert(sameSet(relayValidator.request_ids_missing_everywhere || [], EXPECTED_REQUEST_IDS), 'missing-everywhere request ID set mismatch');
  assert(sameSet(dryRunValidator.inserted_request_ids || [], EXPECTED_REQUEST_IDS), 'dry-run inserted request ID set mismatch');
  for (const requestId of EXPECTED_REQUEST_IDS) {
    assert(dryRunValidator.live_queue_request_id_hits_now?.[requestId] === 0, `live queue must still lack ${requestId}`);
    assert(dryRunValidator.dry_run_request_id_hits?.[requestId] === 1, `dry-run queue must contain exactly one ${requestId}`);
  }
  assert(dryRunValidator.live_queue_sha256_now === dryRunValidator.live_queue_sha256_recorded_by_dry_run, 'dry-run live queue SHA proof must match current live queue');
  assert(dryRunValidator.boundary?.live_queue_mutation_performed === false, 'dry-run validator must prove no live queue mutation');
  assertNoAcceptanceBoundary(refresh.boundary);
  assertNoAcceptanceBoundary(docketValidator.boundary);
  assertNoAcceptanceBoundary(relayValidator.boundary);
  assertNoAcceptanceBoundary(intakeValidator.boundary);
  assertNoAcceptanceBoundary(dryRunValidator.boundary);

  const controlSurfaces = relayPacket.control_surfaces.map((surface) => ({
    path: surface.path,
    exists: fs.existsSync(path.join(repoRoot, surface.path)),
    present_request_ids: surface.present_request_ids || [],
    missing_request_ids: surface.missing_request_ids || []
  }));
  assert(controlSurfaces.length === 4, 'expected four checked control surfaces');
  for (const surface of controlSurfaces) {
    assert(surface.exists === true, `control surface missing: ${surface.path}`);
    assert(sameSet(surface.missing_request_ids, EXPECTED_REQUEST_IDS), `control surface missing request set mismatch: ${surface.path}`);
    assert(surface.present_request_ids.length === 0, `control surface unexpectedly contains request IDs: ${surface.path}`);
  }

  const queueItems = relayPacket.requested_agent5_action.queue_items.map((item) => ({
    request_id: item.request_id,
    submitted_by: item.submitted_by,
    gate: item.gate,
    status: item.status,
    requested_verdict: item.requested_verdict,
    evidence_artifact_count: item.evidence_artifacts.length,
    has_agent1_evidence_origin: item.agent1_evidence_origin === 'Agent 1 evidence packet for Agent 5 relay / Agent 6 review',
    has_agent6_change_history: typeof item.what_changed_since_last_agent6_ruling === 'string' && item.what_changed_since_last_agent6_ruling.length > 0,
    exact_no_acceptance_terms_present: REQUIRED_QUEUE_NO_ACCEPTANCE_TERMS.every((term) => (item.what_must_not_be_accepted || []).includes(term))
  }));
  for (const item of queueItems) {
    assert(item.submitted_by === 'Agent 5', `${item.request_id} must be Agent-5-relay-shaped`);
    assert(item.has_agent1_evidence_origin, `${item.request_id} missing Agent 1 evidence origin`);
    assert(item.has_agent6_change_history, `${item.request_id} missing Agent 6 change history`);
    assert(item.exact_no_acceptance_terms_present, `${item.request_id} missing no-acceptance terms`);
  }

  const checkpoint = {
    generated_at: new Date().toISOString(),
    artifact_type: 'agent1_agent5_agent8_relay_readiness_checkpoint',
    status: 'relay_ready_evidence_control_surface_relay_still_needed',
    source_artifacts: PATHS,
    refresh_completed_at: refresh.completed_at,
    current_source_scope: docketValidator.current_source_scope,
    request_ids: EXPECTED_REQUEST_IDS,
    queue_items: queueItems,
    control_surfaces: controlSurfaces,
    dry_run_queue_compatibility: {
      dry_run_queue: PATHS.dryRunQueue,
      dry_run_health: PATHS.dryRunHealth,
      dry_run_validator: PATHS.dryRunValidator,
      existing_queue_validator_exit_code: dryRunValidator.existing_queue_validator_exit_code,
      live_queue_item_count: dryRunValidator.live_queue_item_count,
      dry_run_queue_item_count: dryRunValidator.dry_run_queue_item_count,
      inserted_request_ids: dryRunValidator.inserted_request_ids,
      live_queue_request_id_hits_now: dryRunValidator.live_queue_request_id_hits_now,
      dry_run_request_id_hits: dryRunValidator.dry_run_request_id_hits,
      live_queue_sha256_now: dryRunValidator.live_queue_sha256_now,
      live_queue_sha256_recorded_by_dry_run: dryRunValidator.live_queue_sha256_recorded_by_dry_run,
      live_queue_mutation_performed: dryRunValidator.boundary.live_queue_mutation_performed
    },
    blocker: {
      blocker_id: 'agent1_request_ids_absent_from_agent6_agent5_control_surfaces',
      blocking_control_surfaces: controlSurfaces.map((surface) => surface.path),
      missing_request_ids_everywhere: relayValidator.request_ids_missing_everywhere,
      reason: `Agent 1 evidence is Agent 6-intake-contract clean, but the ${EXPECTED_REQUEST_IDS.length} request IDs are absent from the checked Agent 6 queue, goal board, and Agent 5 handoff surfaces. Agent 1 must not mutate those surfaces in this lane.`
    },
    next_action_needed: `Agent 5 or Agent 8 relay/insert the ${EXPECTED_REQUEST_IDS.length} exact queue items from reports/agent1-agent5-agent6-docket-relay-packet-2026-06-03.json if authorized, preserving boundaries and avoiding acceptance claims.`,
    boundary: {
      agent1_status: 'relay-ready evidence / awaiting-Agent-5-or-Agent-8 relay and Agent-6 disposition',
      publication_state: 'blocked_no_render',
      queue_mutation_performed: false,
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
    },
    must_not_accept: MUST_NOT_ACCEPT
  };

  writeJson(PATHS.outputJson, checkpoint);
  writeText(PATHS.outputMd, `# Agent 1 / Agent 5 / Agent 8 Relay Readiness Checkpoint

Generated: ${checkpoint.generated_at}

Highest permissible claim: source/provenance blocker evidence prepared and relay-ready for Agent 5/Agent 8 delivery to Agent 6.

This checkpoint does not mutate \`data/control/agent6_validation_queue.json\`, \`data/control/agent_goal_board.json\`, Agent 5 handoff surfaces, or any source/render/publication files.

## Summary

- Status: \`${checkpoint.status}\`
- Refresh completed: \`${checkpoint.refresh_completed_at}\`
- Agent 6-ready docket validator: \`ok: true\`
- Agent 5/6 relay validator: \`ok: true\`
- Agent 6 intake-contract validator: \`ok: true\`, blocking findings \`0\`
- Agent 6 queue dry-run validator: \`ok: true\`, existing queue validator exit \`${checkpoint.dry_run_queue_compatibility.existing_queue_validator_exit_code}\`
- Live queue item count: ${checkpoint.dry_run_queue_compatibility.live_queue_item_count}
- Dry-run queue item count: ${checkpoint.dry_run_queue_compatibility.dry_run_queue_item_count}
- Publication state: \`blocked_no_render\`
- Queue mutation performed: \`false\`
- Live queue mutation performed: \`${checkpoint.dry_run_queue_compatibility.live_queue_mutation_performed}\`

## Current Source Scope

- Live untracked source files: ${checkpoint.current_source_scope.live_untracked_sources}
- Live modified tracked source files: ${checkpoint.current_source_scope.live_modified_tracked_sources}
- Source rows: ${checkpoint.current_source_scope.source_rows}
- Fingerprinted source rows: ${checkpoint.current_source_scope.source_fingerprinted_rows}
- Missing lexical manifest gaps: ${checkpoint.current_source_scope.missing_lexical_manifest_gaps}
- Blocked downstream direct paths: ${checkpoint.current_source_scope.blocked_downstream_direct_paths}
- Blocked downstream content-reference paths: ${checkpoint.current_source_scope.blocked_downstream_content_reference_paths}
- Route/HUD content-reference rows: ${checkpoint.current_source_scope.route_or_hud_content_reference_rows}
- Reader/workbench content-reference rows: ${checkpoint.current_source_scope.reader_workbench_content_reference_rows}
- Public lexical content-reference rows: ${checkpoint.current_source_scope.public_lexical_content_reference_rows}

## Relay Queue Items

${checkpoint.queue_items.map((item) => `- \`${item.request_id}\`: submitted_by \`${item.submitted_by}\`, gate \`${item.gate}\`, verdict \`${item.requested_verdict}\`, evidence artifacts ${item.evidence_artifact_count}`).join('\n')}

## Exact Remaining Blocker

- Blocker: \`${checkpoint.blocker.blocker_id}\`
- Missing request IDs everywhere: ${checkpoint.blocker.missing_request_ids_everywhere.map((requestId) => `\`${requestId}\``).join(', ')}
- Reason: ${checkpoint.blocker.reason}

Checked control surfaces:

${checkpoint.control_surfaces.map((surface) => `- \`${surface.path}\`: exists, present request IDs ${surface.present_request_ids.length}, missing request IDs ${surface.missing_request_ids.length}`).join('\n')}

## Agent 6 Queue Dry-Run Compatibility

- Dry-run queue: \`${checkpoint.dry_run_queue_compatibility.dry_run_queue}\`
- Dry-run health report: \`${checkpoint.dry_run_queue_compatibility.dry_run_health}\`
- Dry-run validator: \`${checkpoint.dry_run_queue_compatibility.dry_run_validator}\`
- Existing Agent 6 queue validator exit: \`${checkpoint.dry_run_queue_compatibility.existing_queue_validator_exit_code}\`
- Live queue item count: ${checkpoint.dry_run_queue_compatibility.live_queue_item_count}
- Dry-run queue item count: ${checkpoint.dry_run_queue_compatibility.dry_run_queue_item_count}
- Live queue mutation performed: \`${checkpoint.dry_run_queue_compatibility.live_queue_mutation_performed}\`
- Live queue request ID hits now: ${JSON.stringify(checkpoint.dry_run_queue_compatibility.live_queue_request_id_hits_now)}
- Dry-run request ID hits: ${JSON.stringify(checkpoint.dry_run_queue_compatibility.dry_run_request_id_hits)}
- Live queue SHA-256 now: \`${checkpoint.dry_run_queue_compatibility.live_queue_sha256_now}\`
- Live queue SHA-256 recorded by dry-run: \`${checkpoint.dry_run_queue_compatibility.live_queue_sha256_recorded_by_dry_run}\`

## Next Action Needed

${checkpoint.next_action_needed}

## Evidence Artifacts

${formatList([
  PATHS.refreshResult,
  PATHS.docketValidator,
  PATHS.relayPacket,
  PATHS.relayValidator,
  PATHS.intakeValidator,
  PATHS.dryRunQueue,
  PATHS.dryRunHealth,
  PATHS.dryRunValidator,
  PATHS.agent1State
].map((artifact) => `\`${artifact}\``))}

## Must Not Be Accepted

${formatList(MUST_NOT_ACCEPT)}

## Agent 8 Callback

- status: relay-ready evidence prepared; control-surface relay still needed; awaiting-Agent-5-or-Agent-8 relay and Agent-6 disposition only
- artifact: \`${PATHS.outputMd}\`
- machine artifact: \`${PATHS.outputJson}\`
- blockers: ${EXPECTED_REQUEST_IDS.length} Agent 1 request IDs are absent from checked Agent 6/Agent 5 control surfaces
- next action needed: Agent 5/Agent 8 relay or insert the ${EXPECTED_REQUEST_IDS.length} exact queue items if authorized, preserving every boundary
- continue condition: continue Agent 1 source/provenance evidence maintenance without render, staging, commit, publication, queue mutation, runtime validation, or custody acceptance
`);

  console.log(JSON.stringify({
    ok: true,
    output_json: PATHS.outputJson,
    output_md: PATHS.outputMd,
    status: checkpoint.status,
    request_ids: checkpoint.request_ids,
    blocker: checkpoint.blocker.blocker_id,
    control_surfaces_checked: checkpoint.control_surfaces.length
  }, null, 2));
}

main();
