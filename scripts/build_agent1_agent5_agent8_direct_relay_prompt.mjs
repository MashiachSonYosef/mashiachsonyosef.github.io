#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  refreshResult: 'reports/agent1-source-custody-refresh-result.json',
  docketValidator: 'reports/agent1-source-provenance-agent6-ready-docket-validator-result-2026-06-03.json',
  relayPacket: 'reports/agent1-agent5-agent6-docket-relay-packet-2026-06-03.json',
  relayValidator: 'reports/agent1-agent5-agent6-docket-relay-validator-result-2026-06-03.json',
  relayReadiness: 'reports/agent1-agent5-agent8-relay-readiness-checkpoint-2026-06-03.json',
  relayReadinessValidator: 'reports/agent1-agent5-agent8-relay-readiness-checkpoint-validator-result-2026-06-03.json',
  insertionPatch: 'reports/agent1-agent5-agent6-queue-insertion-patch-packet-2026-06-03.json',
  insertionPatchValidator: 'reports/agent1-agent5-agent6-queue-insertion-patch-validator-result-2026-06-03.json',
  dispositionWatch: 'reports/agent1-agent6-disposition-watch-2026-06-03.json',
  dispositionWatchValidator: 'reports/agent1-agent6-disposition-watch-validator-result-2026-06-03.json',
  blockerPacket: 'reports/agent1-source-custody-current-blocker-packet-2026-06-03.json',
  outputJson: 'reports/agent1-agent5-agent8-direct-relay-prompt-2026-06-03.json',
  outputMd: 'reports/agent1-agent5-agent8-direct-relay-prompt-2026-06-03.md'
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
  'usage-as-definition authority',
  'translation output',
  'accepted translation text'
];

function fullPath(relativePath) {
  return path.join(repoRoot, relativePath);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(fullPath(relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(fullPath(relativePath)), { recursive: true });
  fs.writeFileSync(fullPath(relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeText(relativePath, value) {
  fs.mkdirSync(path.dirname(fullPath(relativePath)), { recursive: true });
  fs.writeFileSync(fullPath(relativePath), value, 'utf8');
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
  const left = sorted(actual || []);
  const right = sorted(expected || []);
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function assertBoundary(boundary) {
  assert(boundary?.publication_state === 'blocked_no_render', 'publication state must remain blocked_no_render');
  for (const key of [
    'queue_mutation_performed',
    'live_queue_mutation_performed',
    'source_provenance_custody_claimed',
    'source_provenance_acceptance_claimed',
    'source_publication_claimed',
    'source_file_tracking_approval_claimed',
    'source_file_staging_claimed',
    'qa_acceptance_claimed',
    'public_runtime_acceptance_claimed',
    'route_publication_support_claimed',
    'definition_authority_claimed',
    'product_data_acceptance_claimed',
    'usage_as_definition_authority_claimed',
    'translation_output_claimed',
    'accepted_translation_text_claimed',
    'completion_claimed'
  ]) {
    if (Object.hasOwn(boundary || {}, key)) {
      assert(boundary[key] === false, `boundary ${key} must be false`);
    }
  }
}

function markdownList(values) {
  return values.map((value) => `- \`${value}\``).join('\n');
}

function dispositionHitCounts(dispositionWatch) {
  return {
    agent6_disposition_hits: dispositionWatch.request_rows.filter((row) => row.agent6_disposition_detected).length,
    relay_signal_hits: dispositionWatch.request_rows.filter((row) => row.agent5_or_agent8_signal_detected).length
  };
}

function main() {
  const refresh = readJson(PATHS.refreshResult);
  const docketValidator = readJson(PATHS.docketValidator);
  const relayPacket = readJson(PATHS.relayPacket);
  const relayValidator = readJson(PATHS.relayValidator);
  const relayReadiness = readJson(PATHS.relayReadiness);
  const relayReadinessValidator = readJson(PATHS.relayReadinessValidator);
  const insertionPatch = readJson(PATHS.insertionPatch);
  const insertionPatchValidator = readJson(PATHS.insertionPatchValidator);
  const dispositionWatch = readJson(PATHS.dispositionWatch);
  const dispositionWatchValidator = readJson(PATHS.dispositionWatchValidator);
  const blockerPacket = readJson(PATHS.blockerPacket);

  assert(refresh.ok === true, 'refresh result must be ok');
  assert(docketValidator.ok === true, 'docket validator must be ok');
  assert(relayValidator.ok === true, 'relay validator must be ok');
  assert(relayReadiness.status === 'relay_ready_evidence_control_surface_relay_still_needed', 'relay readiness status mismatch');
  assert(relayReadinessValidator.ok === true, 'relay readiness validator must be ok');
  assert(insertionPatch.status === 'patch_prepared_no_live_queue_mutation', 'queue insertion patch status mismatch');
  assert(insertionPatchValidator.ok === true, 'queue insertion patch validator must be ok');
  assert(dispositionWatch.status === 'awaiting_relay_no_agent6_disposition_detected', 'disposition watch status mismatch');
  assert(dispositionWatchValidator.ok === true, 'disposition watch validator must be ok');
  assert(blockerPacket.status === 'evidence_current_relay_and_disposition_blockers_open', 'current blocker packet status mismatch');
  assert(sameSet(relayPacket.request_ids, EXPECTED_REQUEST_IDS), 'relay packet request IDs mismatch');
  assert(sameSet(relayValidator.request_ids_missing_everywhere, EXPECTED_REQUEST_IDS), 'relay validator missing request IDs mismatch');
  assert(sameSet(insertionPatch.request_ids, EXPECTED_REQUEST_IDS), 'queue insertion patch request IDs mismatch');
  assert(insertionPatch.json_patch_operations.length === EXPECTED_REQUEST_IDS.length, 'queue insertion patch operation count mismatch');
  const dispositionHits = dispositionHitCounts(dispositionWatch);
  assert(dispositionHits.agent6_disposition_hits === 0, 'Agent 6 disposition hits must be zero');
  assert(dispositionHits.relay_signal_hits === 0, 'Agent 5/8 relay signal hits must be zero');
  assert(dispositionWatchValidator.agent6_disposition_hits === dispositionHits.agent6_disposition_hits, 'disposition validator Agent 6 hit count mismatch');
  assert(dispositionWatchValidator.relay_signal_hits === dispositionHits.relay_signal_hits, 'disposition validator relay hit count mismatch');
  assertBoundary(refresh.boundary);
  assertBoundary(docketValidator.boundary);
  assertBoundary(relayValidator.boundary);
  assertBoundary(relayReadiness.boundary);
  assertBoundary(insertionPatch.boundary);
  assertBoundary(insertionPatchValidator.boundary);
  assertBoundary(dispositionWatch.boundary);
  assertBoundary(dispositionWatchValidator.boundary);
  assertBoundary(blockerPacket.boundary);

  const queueItems = relayPacket.requested_agent5_action.queue_items.map((item) => ({
    request_id: item.request_id,
    submitted_by: item.submitted_by,
    gate: item.gate,
    status: item.status,
    requested_verdict: item.requested_verdict,
    evidence_artifact_count: item.evidence_artifacts.length,
    queue_item_source: `${PATHS.relayPacket}#requested_agent5_action.queue_items`
  }));

  const directPrompt = `Agent 5 / Agent 8 direct relay prompt\n\n` +
    `Objective: relay the five Agent 1 source/provenance review candidates to Agent 6 without adding any Agent 1 acceptance, QA acceptance, source custody, publication, runtime, route publication, Definition, product/data, usage-as-definition, translation output, or accepted-text claim.\n\n` +
    `Use the exact queue items at ${PATHS.relayPacket} under requested_agent5_action.queue_items. If authorized to apply a queue patch instead of manual relay, use ${PATHS.insertionPatch}; it contains ${EXPECTED_REQUEST_IDS.length} add-only append operations for data/control/agent6_validation_queue.json and has validator ok true.\n\n` +
    `Request IDs:\n${EXPECTED_REQUEST_IDS.map((requestId) => `- ${requestId}`).join('\n')}\n\n` +
    `Required evidence:\n- ${PATHS.relayPacket}\n- ${PATHS.relayReadiness}\n- ${PATHS.insertionPatch}\n- ${PATHS.dispositionWatch}\n- ${PATHS.blockerPacket}\n\n` +
    `Must not accept terms:\n${MUST_NOT_ACCEPT.map((term) => `- ${term}`).join('\n')}\n\n` +
    `Boundaries: do not stage, commit, render, publish, mutate source files, claim source/provenance custody, approve source-file tracking, claim QA acceptance, claim public/runtime acceptance, claim publication readiness, claim route publication support, claim Definition authority, claim product/data acceptance, claim usage-as-definition authority, claim translation output, or claim accepted translation text.\n\n` +
    `Expected next state after authorized relay: Agent 6 can docket pass/warn/block disposition for the five request IDs. Agent 1 remains evidence-ready / awaiting-Agent-6.`;

  const artifact = {
    generated_at: new Date().toISOString(),
    artifact_type: 'agent1_agent5_agent8_direct_relay_prompt',
    status: 'direct_relay_prompt_ready_no_agent1_mutation',
    highest_permissible_claim: 'source/provenance blocker evidence prepared and exact relay prompt ready for Agent 5/Agent 8 delivery to Agent 6',
    source_artifacts: PATHS,
    refresh_completed_at: refresh.completed_at,
    request_ids: EXPECTED_REQUEST_IDS,
    current_source_scope: {
      live_untracked_sources: docketValidator.current_source_scope.live_untracked_sources,
      live_modified_tracked_sources: docketValidator.current_source_scope.live_modified_tracked_sources,
      source_rows: docketValidator.current_source_scope.source_rows,
      source_fingerprinted_rows: docketValidator.current_source_scope.source_fingerprinted_rows,
      blocked_downstream_direct_paths: docketValidator.current_source_scope.blocked_downstream_direct_paths,
      blocked_downstream_content_reference_paths: docketValidator.current_source_scope.blocked_downstream_content_reference_paths
    },
    exact_relay_inputs: {
      relay_packet: PATHS.relayPacket,
      queue_items_json_pointer: 'requested_agent5_action.queue_items',
      queue_items: queueItems,
      queue_insertion_patch_packet: PATHS.insertionPatch,
      queue_insertion_patch_operation_count: insertionPatch.json_patch_operations.length,
      queue_insertion_patch_target: insertionPatch.target_queue,
      queue_insertion_patch_validator: PATHS.insertionPatchValidator,
      live_queue_mutation_performed: false
    },
    blocker_state: {
      relay_readiness_status: relayReadiness.status,
      relay_validator_status: relayValidator.status,
      disposition_watch_status: dispositionWatch.status,
      agent6_disposition_hits: dispositionHits.agent6_disposition_hits,
      relay_signal_hits: dispositionHits.relay_signal_hits,
      exact_blockers: blockerPacket.exact_blockers.map((blocker) => blocker.id)
    },
    direct_prompt: directPrompt,
    agent8_callback: {
      status: 'direct relay prompt ready; awaiting-Agent-5-or-Agent-8 relay and Agent-6 disposition only',
      artifact: PATHS.outputMd,
      machine_artifact: PATHS.outputJson,
      blockers: '5 Agent 1 request IDs are absent from checked Agent 6/Agent 5 control surfaces; no Agent 5/8 relay signal or Agent 6 disposition detected',
      next_action_needed: 'Agent 5/Agent 8 relay or authorized queue insertion for the five exact request IDs, then Agent 6 pass/warn/block disposition',
      continue_condition: 'continue Agent 1 source/provenance evidence maintenance without render, staging, commit, publication, queue mutation, runtime validation, or custody acceptance'
    },
    boundary: {
      agent1_status: 'direct relay prompt evidence only / awaiting-Agent-5-or-Agent-8 relay and Agent-6 disposition',
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
      accepted_translation_text_claimed: false,
      completion_claimed: false
    },
    must_not_accept: MUST_NOT_ACCEPT
  };

  const md = `# Agent 1 / Agent 5 / Agent 8 Direct Relay Prompt

Generated: ${artifact.generated_at}

Highest permissible claim: source/provenance blocker evidence prepared and exact relay prompt ready for Agent 5/Agent 8 delivery to Agent 6.

This artifact does not mutate \`data/control/agent6_validation_queue.json\`, \`data/control/agent_goal_board.json\`, Agent 5 handoff surfaces, source files, render outputs, or publication state.

## Summary

- Status: \`${artifact.status}\`
- Refresh completed: \`${artifact.refresh_completed_at}\`
- Publication state: \`blocked_no_render\`
- Request IDs: ${artifact.request_ids.length}
- Queue items source: \`${artifact.exact_relay_inputs.relay_packet}#${artifact.exact_relay_inputs.queue_items_json_pointer}\`
- Queue insertion patch: \`${artifact.exact_relay_inputs.queue_insertion_patch_packet}\`
- Queue insertion patch operations: ${artifact.exact_relay_inputs.queue_insertion_patch_operation_count}
- Live queue mutation performed: \`false\`
- Agent 6 disposition hits: ${artifact.blocker_state.agent6_disposition_hits}
- Agent 5/8 relay-signal hits: ${artifact.blocker_state.relay_signal_hits}

## Current Source Scope

- Live untracked source files: ${artifact.current_source_scope.live_untracked_sources}
- Live modified tracked source files: ${artifact.current_source_scope.live_modified_tracked_sources}
- Source rows: ${artifact.current_source_scope.source_rows}
- Fingerprinted source rows: ${artifact.current_source_scope.source_fingerprinted_rows}
- Blocked downstream direct paths: ${artifact.current_source_scope.blocked_downstream_direct_paths}
- Blocked downstream content-reference paths: ${artifact.current_source_scope.blocked_downstream_content_reference_paths}

## Request IDs

${markdownList(artifact.request_ids)}

## Exact Direct Prompt

\`\`\`text
${artifact.direct_prompt}
\`\`\`

## Evidence Artifacts

- \`${PATHS.relayPacket}\`
- \`${PATHS.relayValidator}\`
- \`${PATHS.relayReadiness}\`
- \`${PATHS.relayReadinessValidator}\`
- \`${PATHS.insertionPatch}\`
- \`${PATHS.insertionPatchValidator}\`
- \`${PATHS.dispositionWatch}\`
- \`${PATHS.dispositionWatchValidator}\`
- \`${PATHS.blockerPacket}\`

## Must Not Accept

${MUST_NOT_ACCEPT.map((term) => `- ${term}`).join('\n')}

## Agent 8 Callback

- status: ${artifact.agent8_callback.status}
- artifact: \`${artifact.agent8_callback.artifact}\`
- machine artifact: \`${artifact.agent8_callback.machine_artifact}\`
- blockers: ${artifact.agent8_callback.blockers}
- next action needed: ${artifact.agent8_callback.next_action_needed}
- continue condition: ${artifact.agent8_callback.continue_condition}
`;

  writeJson(PATHS.outputJson, artifact);
  writeText(PATHS.outputMd, md);
  console.log(JSON.stringify({
    ok: true,
    output_json: PATHS.outputJson,
    output_md: PATHS.outputMd,
    status: artifact.status,
    request_ids: artifact.request_ids,
    queue_insertion_patch_operations: artifact.exact_relay_inputs.queue_insertion_patch_operation_count,
    queue_mutation_performed: artifact.boundary.queue_mutation_performed
  }, null, 2));
}

try {
  main();
} catch (error) {
  console.error(JSON.stringify({
    ok: false,
    error: error.message
  }, null, 2));
  process.exit(1);
}
