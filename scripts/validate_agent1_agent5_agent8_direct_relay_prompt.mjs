#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  prompt: 'reports/agent1-agent5-agent8-direct-relay-prompt-2026-06-03.json',
  promptMd: 'reports/agent1-agent5-agent8-direct-relay-prompt-2026-06-03.md',
  refreshResult: 'reports/agent1-source-custody-refresh-result.json',
  relayPacket: 'reports/agent1-agent5-agent6-docket-relay-packet-2026-06-03.json',
  relayValidator: 'reports/agent1-agent5-agent6-docket-relay-validator-result-2026-06-03.json',
  insertionPatch: 'reports/agent1-agent5-agent6-queue-insertion-patch-packet-2026-06-03.json',
  insertionPatchValidator: 'reports/agent1-agent5-agent6-queue-insertion-patch-validator-result-2026-06-03.json',
  dispositionWatch: 'reports/agent1-agent6-disposition-watch-2026-06-03.json',
  dispositionWatchValidator: 'reports/agent1-agent6-disposition-watch-validator-result-2026-06-03.json',
  blockerPacket: 'reports/agent1-source-custody-current-blocker-packet-2026-06-03.json',
  result: 'reports/agent1-agent5-agent8-direct-relay-prompt-validator-result-2026-06-03.json',
  resultMd: 'reports/agent1-agent5-agent8-direct-relay-prompt-validator-result-2026-06-03.md'
};

const EXPECTED_REQUEST_IDS = [
  'agent6-agent1-source-custody-manifest-remediation-review',
  'agent6-agent1-source-custody-tracking-action-review',
  'agent6-agent1-source-custody-license-normalization-review',
  'agent6-agent1-public-hud-source-row-review',
  'agent6-agent1-orot-fill-source-row-review'
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

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(fullPath(relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(fullPath(relativePath), 'utf8');
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(fullPath(relativePath)), { recursive: true });
  fs.writeFileSync(fullPath(relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeText(relativePath, value) {
  fs.mkdirSync(path.dirname(fullPath(relativePath)), { recursive: true });
  fs.writeFileSync(fullPath(relativePath), value, 'utf8');
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
    'downstream_direct_artifact_acceptance_claimed',
    'downstream_content_reference_acceptance_claimed',
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

function dispositionHitCounts(dispositionWatch) {
  return {
    agent6_disposition_hits: dispositionWatch.request_rows.filter((row) => row.agent6_disposition_detected).length,
    relay_signal_hits: dispositionWatch.request_rows.filter((row) => row.agent5_or_agent8_signal_detected).length
  };
}

function main() {
  const startedAt = new Date().toISOString();
  const prompt = readJson(PATHS.prompt);
  const promptMd = readText(PATHS.promptMd);
  const refresh = readJson(PATHS.refreshResult);
  const relayPacket = readJson(PATHS.relayPacket);
  const relayValidator = readJson(PATHS.relayValidator);
  const insertionPatch = readJson(PATHS.insertionPatch);
  const insertionPatchValidator = readJson(PATHS.insertionPatchValidator);
  const dispositionWatch = readJson(PATHS.dispositionWatch);
  const dispositionWatchValidator = readJson(PATHS.dispositionWatchValidator);
  const blockerPacket = readJson(PATHS.blockerPacket);

  assert(prompt.artifact_type === 'agent1_agent5_agent8_direct_relay_prompt', 'unexpected prompt artifact type');
  assert(prompt.status === 'direct_relay_prompt_ready_no_agent1_mutation', 'unexpected prompt status');
  assert(refresh.ok === true, 'refresh result must be ok');
  assert(relayValidator.ok === true, 'relay validator must be ok');
  assert(insertionPatch.status === 'patch_prepared_no_live_queue_mutation', 'queue insertion patch status mismatch');
  assert(insertionPatchValidator.ok === true, 'queue insertion patch validator must be ok');
  assert(dispositionWatch.status === 'awaiting_relay_no_agent6_disposition_detected', 'disposition watch status mismatch');
  assert(dispositionWatchValidator.ok === true, 'disposition watch validator must be ok');
  assert(blockerPacket.status === 'evidence_current_relay_and_disposition_blockers_open', 'blocker packet status mismatch');
  sameSet(prompt.request_ids, EXPECTED_REQUEST_IDS, 'prompt request IDs');
  sameSet(relayPacket.request_ids, EXPECTED_REQUEST_IDS, 'relay packet request IDs');
  sameSet(relayValidator.request_ids_missing_everywhere, EXPECTED_REQUEST_IDS, 'relay validator missing-everywhere IDs');
  sameSet(insertionPatch.request_ids, EXPECTED_REQUEST_IDS, 'queue insertion patch request IDs');
  assert(prompt.refresh_completed_at === refresh.completed_at, 'prompt refresh timestamp mismatch');
  assert(prompt.exact_relay_inputs.relay_packet === PATHS.relayPacket, 'prompt relay packet path mismatch');
  assert(prompt.exact_relay_inputs.queue_items_json_pointer === 'requested_agent5_action.queue_items', 'queue item pointer mismatch');
  assert(prompt.exact_relay_inputs.queue_insertion_patch_packet === PATHS.insertionPatch, 'queue insertion patch path mismatch');
  assert(prompt.exact_relay_inputs.queue_insertion_patch_operation_count === EXPECTED_REQUEST_IDS.length, 'prompt patch operation count mismatch');
  assert(insertionPatch.json_patch_operations.length === EXPECTED_REQUEST_IDS.length, 'insertion patch operation count mismatch');
  assert(prompt.exact_relay_inputs.live_queue_mutation_performed === false, 'prompt must not perform live queue mutation');
  const dispositionHits = dispositionHitCounts(dispositionWatch);
  assert(dispositionHits.agent6_disposition_hits === 0, 'Agent 6 disposition hits must remain zero');
  assert(dispositionHits.relay_signal_hits === 0, 'Agent 5/8 relay-signal hits must remain zero');
  assert(dispositionWatchValidator.agent6_disposition_hits === dispositionHits.agent6_disposition_hits, 'disposition validator Agent 6 hit count mismatch');
  assert(dispositionWatchValidator.relay_signal_hits === dispositionHits.relay_signal_hits, 'disposition validator relay hit count mismatch');
  assert(prompt.blocker_state.agent6_disposition_hits === 0, 'prompt Agent 6 disposition hits must be zero');
  assert(prompt.blocker_state.relay_signal_hits === 0, 'prompt relay-signal hits must be zero');
  assert(prompt.current_source_scope.live_untracked_sources === 23, 'expected 23 live untracked source files');
  assert(prompt.current_source_scope.live_modified_tracked_sources === 6, 'expected 6 modified tracked source files');
  assert(prompt.current_source_scope.source_rows === 29, 'expected 29 source rows');
  assert(prompt.current_source_scope.source_fingerprinted_rows === 29, 'expected 29 fingerprinted source rows');
  assert(prompt.current_source_scope.blocked_downstream_direct_paths === 248, 'expected 248 blocked downstream direct paths');
  assert(prompt.current_source_scope.blocked_downstream_content_reference_paths === 183, 'expected 183 blocked content-reference paths');
  assert(prompt.direct_prompt.includes(PATHS.relayPacket), 'direct prompt missing relay packet path');
  assert(prompt.direct_prompt.includes(PATHS.insertionPatch), 'direct prompt missing insertion patch path');
  assert(prompt.direct_prompt.includes('Expected next state after authorized relay'), 'direct prompt missing next-state boundary wording');
  for (const requestId of EXPECTED_REQUEST_IDS) {
    assert(prompt.direct_prompt.includes(requestId), `direct prompt missing request ID ${requestId}`);
    assert(promptMd.includes(requestId), `markdown prompt missing request ID ${requestId}`);
  }
  for (const term of REQUIRED_MUST_NOT_ACCEPT) {
    assert(prompt.must_not_accept.includes(term), `prompt missing must-not-accept term ${term}`);
    assert(prompt.direct_prompt.includes(term), `direct prompt missing no-acceptance term ${term}`);
  }
  assert(promptMd.includes('## Agent 8 Callback'), 'markdown missing Agent 8 Callback');
  assert(promptMd.includes('Live queue mutation performed: `false`'), 'markdown missing live queue non-mutation proof');
  assert(promptMd.includes('Agent 6 disposition hits: 0'), 'markdown missing Agent 6 disposition hit proof');
  assert(promptMd.includes('Agent 5/8 relay-signal hits: 0'), 'markdown missing relay-signal hit proof');
  assertBoundary(prompt.boundary);
  assertBoundary(refresh.boundary);
  assertBoundary(relayValidator.boundary);
  assertBoundary(insertionPatch.boundary);
  assertBoundary(insertionPatchValidator.boundary);
  assertBoundary(dispositionWatch.boundary);
  assertBoundary(dispositionWatchValidator.boundary);
  assertBoundary(blockerPacket.boundary);
  for (const artifact of Object.values(PATHS).filter((artifact) => ![PATHS.result, PATHS.resultMd].includes(artifact))) {
    if (artifact.startsWith('reports/agent1-') || artifact.startsWith('reports/agent5-') || artifact.startsWith('data/')) {
      assert(fs.existsSync(fullPath(artifact)), `referenced artifact missing: ${artifact}`);
    }
  }

  const result = {
    ok: true,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    validated_prompt: PATHS.prompt,
    validated_prompt_md: PATHS.promptMd,
    status: prompt.status,
    refresh_completed_at: prompt.refresh_completed_at,
    request_id_count: prompt.request_ids.length,
    queue_insertion_patch_operations: prompt.exact_relay_inputs.queue_insertion_patch_operation_count,
    agent6_disposition_hits: prompt.blocker_state.agent6_disposition_hits,
    relay_signal_hits: prompt.blocker_state.relay_signal_hits,
    boundary: prompt.boundary
  };

  writeJson(PATHS.result, result);
  writeText(PATHS.resultMd, `# Agent 1 / Agent 5 / Agent 8 Direct Relay Prompt Validator Result

Generated: ${result.completed_at}

- OK: true
- Prompt: \`${PATHS.promptMd}\`
- Prompt JSON: \`${PATHS.prompt}\`
- Status: \`${result.status}\`
- Refresh completed: \`${result.refresh_completed_at}\`
- Request IDs: ${result.request_id_count}
- Queue insertion patch operations: ${result.queue_insertion_patch_operations}
- Agent 6 disposition hits: ${result.agent6_disposition_hits}
- Agent 5/8 relay-signal hits: ${result.relay_signal_hits}
- Publication state: \`blocked_no_render\`
- Queue mutation performed: \`false\`

This validator confirms the direct relay prompt is evidence-only and references the current validated Agent 1 queue items and add-only patch packet. It does not accept source/provenance custody, source publication, source-file tracking, QA, runtime, publication, route-publication, Definition, product/data, usage-as-definition, translation output, or accepted text.
`);
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
