#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  state: 'reports/agent1-state.md',
  refreshResult: 'reports/agent1-source-custody-refresh-result.json',
  blockerPacket: 'reports/agent1-source-custody-current-blocker-packet-2026-06-03.json',
  blockerPacketMd: 'reports/agent1-source-custody-current-blocker-packet-2026-06-03.md',
  blockerValidator: 'reports/agent1-source-custody-current-blocker-packet-validator-result-2026-06-03.json',
  blockerValidatorMd: 'reports/agent1-source-custody-current-blocker-packet-validator-result-2026-06-03.md',
  directRelayPrompt: 'reports/agent1-agent5-agent8-direct-relay-prompt-2026-06-03.json',
  directRelayPromptMd: 'reports/agent1-agent5-agent8-direct-relay-prompt-2026-06-03.md',
  directRelayPromptValidator: 'reports/agent1-agent5-agent8-direct-relay-prompt-validator-result-2026-06-03.json',
  directRelayPromptValidatorMd: 'reports/agent1-agent5-agent8-direct-relay-prompt-validator-result-2026-06-03.md',
  ownerChecklist: 'reports/agent1-source-file-reconciliation-owner-checklist-2026-06-03.json',
  ownerChecklistMd: 'reports/agent1-source-file-reconciliation-owner-checklist-2026-06-03.md',
  ownerChecklistValidator: 'reports/agent1-source-file-reconciliation-owner-checklist-validator-result-2026-06-03.json',
  ownerChecklistValidatorMd: 'reports/agent1-source-file-reconciliation-owner-checklist-validator-result-2026-06-03.md',
  decisionMatrix: 'reports/agent1-source-custody-agent6-decision-matrix-2026-06-03.json',
  decisionMatrixMd: 'reports/agent1-source-custody-agent6-decision-matrix-2026-06-03.md',
  decisionMatrixValidator: 'reports/agent1-source-custody-agent6-decision-matrix-validator-result-2026-06-03.json',
  decisionMatrixValidatorMd: 'reports/agent1-source-custody-agent6-decision-matrix-validator-result-2026-06-03.md',
  result: 'reports/agent1-state-currentness-validator-result-2026-06-03.json',
  resultMd: 'reports/agent1-state-currentness-validator-result-2026-06-03.md'
};

const MUST_NOT_ACCEPT = [
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

function findLine(markdown, needle) {
  return markdown.split(/\r?\n/).find((line) => line.includes(needle)) || '';
}

function assertLineIncludes(markdown, lineNeedle, expectedFragments) {
  const matchingLines = markdown.split(/\r?\n/).filter((line) => line.includes(lineNeedle));
  assert(matchingLines.length > 0, `missing state line containing ${lineNeedle}`);
  const line = matchingLines.find((candidate) => expectedFragments.every((fragment) => candidate.includes(fragment)));
  assert(Boolean(line), `state line for ${lineNeedle} missing expected current fragments`, { expectedFragments, matchingLines });
  return line;
}

function assertBoundary(refresh) {
  assert(refresh.boundary?.agent1_status === 'evidence-ready / awaiting-Agent-6', 'Agent 1 boundary status mismatch');
  assert(refresh.boundary?.publication_state === 'blocked_no_render', 'publication state must remain blocked_no_render');
  for (const key of [
    'source_provenance_acceptance_claimed',
    'public_runtime_acceptance_claimed',
    'route_publication_support_claimed',
    'definition_authority_claimed',
    'page_render_acceptance_claimed'
  ]) {
    assert(refresh.boundary?.[key] === false, `refresh boundary ${key} must be false`);
  }
  assert(refresh.completion_audit_validator_summary?.boundary?.completion_claimed === false, 'completion must not be claimed');
}

function assertStateCurrent(markdown, refresh, blockerValidator, directRelayPromptValidator, ownerChecklistValidator, decisionMatrixValidator) {
  const hudSummary = refresh.public_hud_source_row_evidence_summary?.summary;
  const hudQueueSummary = refresh.public_hud_source_row_queue_validator_summary?.summary;
  const actionPlan = refresh.source_file_reconciliation_action_plan_validator_summary;
  const completion = refresh.completion_audit_validator_summary;
  const directRelayPrompt = refresh.agent5_agent8_direct_relay_prompt_validator_summary;

  assert(refresh.ok === true, 'refresh result must be ok');
  assert(hudSummary, 'refresh result missing public HUD summary');
  assert(hudQueueSummary, 'refresh result missing public HUD queue validator summary');
  assert(actionPlan?.ok === true, 'source-file reconciliation action plan validator must be ok');
  assert(completion?.ok === true, 'completion audit validator must be ok');
  assert(blockerValidator.ok === true, 'current blocker packet validator must be ok');
  assert(blockerValidator.refresh_completed_at === refresh.completed_at, 'current blocker packet validator refresh timestamp mismatch');
  assert(directRelayPrompt?.ok === true, 'direct relay prompt validator summary must be ok');
  assert(directRelayPromptValidator.ok === true, 'direct relay prompt validator must be ok');
  assert(directRelayPrompt.refresh_completed_at === refresh.completed_at, 'direct relay prompt summary refresh timestamp mismatch');
  assert(directRelayPromptValidator.refresh_completed_at === refresh.completed_at, 'direct relay prompt validator refresh timestamp mismatch');
  assert(directRelayPrompt.status === 'direct_relay_prompt_ready_no_agent1_mutation', 'direct relay prompt status mismatch');
  assert(directRelayPrompt.request_id_count === 5, 'direct relay prompt request ID count mismatch');
  assert(directRelayPrompt.queue_insertion_patch_operations === 5, 'direct relay prompt patch operation count mismatch');
  assert(directRelayPrompt.agent6_disposition_hits === 0, 'direct relay prompt Agent 6 disposition hits must be zero');
  assert(directRelayPrompt.relay_signal_hits === 0, 'direct relay prompt relay signal hits must be zero');
  assert(directRelayPrompt.boundary?.queue_mutation_performed === false, 'direct relay prompt must not mutate queue');
  assert(directRelayPromptValidator.status === directRelayPrompt.status, 'direct relay prompt validator status mismatch');
  assert(directRelayPromptValidator.request_id_count === directRelayPrompt.request_id_count, 'direct relay prompt validator request count mismatch');
  assert(directRelayPromptValidator.queue_insertion_patch_operations === directRelayPrompt.queue_insertion_patch_operations, 'direct relay prompt validator patch count mismatch');
  assert(refresh.source_file_reconciliation_owner_checklist_validator_summary?.ok === true, 'owner checklist validator summary must be ok');
  assert(ownerChecklistValidator.ok === true, 'owner checklist validator must be ok');
  assert(refresh.source_file_reconciliation_owner_checklist_validator_summary.refresh_completed_at === refresh.completed_at, 'owner checklist summary refresh timestamp mismatch');
  assert(ownerChecklistValidator.refresh_completed_at === refresh.completed_at, 'owner checklist validator refresh timestamp mismatch');
  assert(ownerChecklistValidator.track_candidate_source_files === 23, 'owner checklist tracking count mismatch');
  assert(ownerChecklistValidator.modified_tracked_source_files === 6, 'owner checklist modified tracked count mismatch');
  assert(ownerChecklistValidator.request_id_count === 5, 'owner checklist request ID count mismatch');
  assert(ownerChecklistValidator.exact_blocker_count === 6, 'owner checklist exact blocker count mismatch');
  assert(ownerChecklistValidator.action_performed === false, 'owner checklist action must not be performed');
  assert(ownerChecklistValidator.queue_mutation_performed === false, 'owner checklist queue mutation must be false');
  assert(refresh.source_custody_agent6_decision_matrix_validator_summary?.ok === true, 'decision matrix validator summary must be ok');
  assert(decisionMatrixValidator.ok === true, 'decision matrix validator must be ok');
  assert(refresh.source_custody_agent6_decision_matrix_validator_summary.refresh_completed_at === refresh.completed_at, 'decision matrix summary refresh timestamp mismatch');
  assert(decisionMatrixValidator.refresh_completed_at === refresh.completed_at, 'decision matrix validator refresh timestamp mismatch');
  assert(decisionMatrixValidator.request_id_count === 5, 'decision matrix request ID count mismatch');
  assert(decisionMatrixValidator.tracking_rows === 23, 'decision matrix tracking row count mismatch');
  assert(decisionMatrixValidator.license_rows === 6, 'decision matrix license row count mismatch');
  assert(decisionMatrixValidator.exact_blockers === 6, 'decision matrix exact blocker count mismatch');
  assert(decisionMatrixValidator.blocked_direct_artifact_paths === 248, 'decision matrix blocked direct path count mismatch');
  assert(decisionMatrixValidator.blocked_content_reference_paths === 183, 'decision matrix blocked content-reference count mismatch');
  assert(decisionMatrixValidator.route_hud_content_reference_rows === 42, 'decision matrix route/HUD rows mismatch');
  assert(decisionMatrixValidator.reader_workbench_content_reference_rows === 112, 'decision matrix reader/workbench rows mismatch');
  assert(decisionMatrixValidator.public_lexical_content_reference_rows === 29, 'decision matrix public lexical rows mismatch');
  assert(decisionMatrixValidator.action_performed === false, 'decision matrix action must not be performed');
  assert(decisionMatrixValidator.queue_mutation_performed === false, 'decision matrix queue mutation must be false');
  assertBoundary(refresh);

  assert(hudSummary.route_card_count_extracted === hudQueueSummary.route_card_count_extracted, 'public HUD route-card counts must agree');
  assert(hudSummary.source_row_count_extracted === hudQueueSummary.source_row_count_extracted, 'public HUD source-row counts must agree');
  assert(hudSummary.endpoint_count === hudQueueSummary.endpoint_count, 'public HUD endpoint counts must agree');
  assert(hudSummary.endpoint_ok_count === hudQueueSummary.endpoint_ok_count, 'public HUD endpoint OK counts must agree');
  assert(hudSummary.missing_source_row_field_count === 0, 'public HUD missing source-row fields must be zero');

  assertLineIncludes(markdown, 'Source file reconciliation action plan validator result:', [
    PATHS.result.replace('agent1-state-currentness-validator-result', 'agent1-source-file-reconciliation-action-plan-validator-result')
  ]);

  assertLineIncludes(markdown, 'Source file reconciliation owner checklist:', [
    PATHS.ownerChecklistMd
  ]);

  assertLineIncludes(markdown, 'Source file reconciliation owner checklist JSON:', [
    PATHS.ownerChecklist
  ]);

  assertLineIncludes(markdown, 'Source file reconciliation owner checklist validator result:', [
    PATHS.ownerChecklistValidator
  ]);

  assertLineIncludes(markdown, 'Source file reconciliation owner checklist validator result Markdown:', [
    PATHS.ownerChecklistValidatorMd
  ]);

  assertLineIncludes(markdown, 'Agent 6 decision matrix:', [
    PATHS.decisionMatrixMd
  ]);

  assertLineIncludes(markdown, 'Agent 6 decision matrix JSON:', [
    PATHS.decisionMatrix
  ]);

  assertLineIncludes(markdown, 'Agent 6 decision matrix validator result:', [
    PATHS.decisionMatrixValidator
  ]);

  assertLineIncludes(markdown, 'Agent 6 decision matrix validator result Markdown:', [
    PATHS.decisionMatrixValidatorMd
  ]);

  assertLineIncludes(markdown, 'State currentness validator result:', [
    PATHS.result
  ]);

  assertLineIncludes(markdown, 'State currentness validator result Markdown:', [
    PATHS.resultMd
  ]);

  assertLineIncludes(markdown, 'Current blocker packet:', [
    PATHS.blockerPacketMd
  ]);

  assertLineIncludes(markdown, 'Current blocker packet JSON:', [
    PATHS.blockerPacket
  ]);

  assertLineIncludes(markdown, 'Current blocker packet validator result:', [
    PATHS.blockerValidator
  ]);

  assertLineIncludes(markdown, 'Current blocker packet validator result Markdown:', [
    PATHS.blockerValidatorMd
  ]);

  assertLineIncludes(markdown, 'Agent 5/8 direct relay prompt:', [
    PATHS.directRelayPromptMd
  ]);

  assertLineIncludes(markdown, 'Agent 5/8 direct relay prompt JSON:', [
    PATHS.directRelayPrompt
  ]);

  assertLineIncludes(markdown, 'Agent 5/8 direct relay prompt validator result:', [
    PATHS.directRelayPromptValidator
  ]);

  assertLineIncludes(markdown, 'Agent 5/8 direct relay prompt validator result Markdown:', [
    PATHS.directRelayPromptValidatorMd
  ]);

  assertLineIncludes(markdown, 'State currentness validator:', [
    'scripts/validate_agent1_state_currentness.mjs'
  ]);

  assertLineIncludes(markdown, 'Current blocker packet builder:', [
    'scripts/build_agent1_source_custody_current_blocker_packet.mjs'
  ]);

  assertLineIncludes(markdown, 'Current blocker packet validator:', [
    'scripts/validate_agent1_source_custody_current_blocker_packet.mjs'
  ]);

  assertLineIncludes(markdown, 'Agent 5/8 direct relay prompt builder:', [
    'scripts/build_agent1_agent5_agent8_direct_relay_prompt.mjs'
  ]);

  assertLineIncludes(markdown, 'Agent 5/8 direct relay prompt validator:', [
    'scripts/validate_agent1_agent5_agent8_direct_relay_prompt.mjs'
  ]);

  assertLineIncludes(markdown, 'Source file reconciliation owner checklist builder:', [
    'scripts/build_agent1_source_file_reconciliation_owner_checklist.mjs'
  ]);

  assertLineIncludes(markdown, 'Source file reconciliation owner checklist validator:', [
    'scripts/validate_agent1_source_file_reconciliation_owner_checklist.mjs'
  ]);

  assertLineIncludes(markdown, 'Agent 6 decision matrix builder:', [
    'scripts/build_agent1_source_custody_agent6_decision_matrix.mjs'
  ]);

  assertLineIncludes(markdown, 'Agent 6 decision matrix validator:', [
    'scripts/validate_agent1_source_custody_agent6_decision_matrix.mjs'
  ]);

  assertLineIncludes(markdown, 'scripts/build_agent1_source_file_reconciliation_action_plan.mjs', [
    `${actionPlan.track_candidate_source_files} tracking candidates`,
    `${actionPlan.modified_tracked_source_files === 6 ? 'six' : actionPlan.modified_tracked_source_files} modified tracked`,
    `${actionPlan.missing_manifest_source_files} missing manifest source files`,
    `${actionPlan.blocked_downstream_direct_paths} blocked downstream direct paths`,
    `${actionPlan.blocked_downstream_content_reference_paths} blocked content-reference paths`,
    'action plan',
    'not create a new request ID',
    'claim source/provenance acceptance'
  ]);

  assertLineIncludes(markdown, 'scripts/build_agent1_source_file_reconciliation_owner_checklist.mjs', [
    'compact, validator-backed owner checklist',
    `${ownerChecklistValidator.track_candidate_source_files} ` + '`??` tracking candidates',
    'six ` M` license-normalization files',
    `${ownerChecklistValidator.request_id_count} request IDs`,
    `${ownerChecklistValidator.exact_blocker_count} exact blockers`,
    `${ownerChecklistValidator.blocked_direct_artifact_paths} blocked direct paths`,
    `${ownerChecklistValidator.blocked_content_reference_paths} blocked content-reference paths`,
    'queue mutation `false`',
    'action performed `false`',
    'all no-acceptance boundary flags false'
  ]);

  assertLineIncludes(markdown, 'scripts/build_agent1_source_custody_agent6_decision_matrix.mjs', [
    'validator-backed Agent 6 decision matrix',
    'current refresh result',
    `${decisionMatrixValidator.request_id_count} request IDs`,
    `${decisionMatrixValidator.tracking_rows} tracking/exclusion rows`,
    `${decisionMatrixValidator.license_rows} license-normalization rows`,
    `${decisionMatrixValidator.exact_blockers} exact blockers`,
    `${decisionMatrixValidator.blocked_direct_artifact_paths} blocked direct paths`,
    `${decisionMatrixValidator.blocked_content_reference_paths} blocked content-reference paths`,
    `${decisionMatrixValidator.route_hud_content_reference_rows} route/HUD rows`,
    `${decisionMatrixValidator.reader_workbench_content_reference_rows} reader/workbench rows`,
    `${decisionMatrixValidator.public_lexical_content_reference_rows} public lexical rows`,
    'queue mutation `false`',
    'action performed `false`',
    'all no-acceptance boundary flags false'
  ]);

  assertLineIncludes(markdown, 'scripts/build_agent1_wartime_public_hud_source_row_evidence.mjs', [
    `${hudSummary.endpoint_count} bounded JSON endpoints`,
    `${hudSummary.route_card_count_extracted} route cards`,
    `${hudSummary.source_row_count_extracted} source/license rows`,
    `${hudSummary.missing_source_row_field_count} required source/license fields were missing`,
    'not runtime validation',
    'accepted translation text'
  ]);

  assertLineIncludes(markdown, 'scripts/build_agent1_wartime_public_hud_source_row_queue_candidate.mjs', [
    `${hudQueueSummary.surfaces_checked} surfaces`,
    `${hudQueueSummary.endpoint_count} endpoints`,
    `${hudQueueSummary.endpoint_ok_count} OK endpoints`,
    `${hudQueueSummary.route_card_count_extracted} route cards`,
    `${hudQueueSummary.source_row_count_extracted} source/license rows`,
    `${hudQueueSummary.missing_source_row_field_count} missing source/license fields`,
    'claim source/provenance acceptance'
  ]);

  assertLineIncludes(markdown, 'The latest refresh result is passing:', [
    `started \`${refresh.started_at}\``,
    `completed \`${refresh.completed_at}\``,
    `${refresh.direct_untracked_sources} untracked source files`,
    `${refresh.build_summary.summary.source_fingerprinted_rows} fingerprinted source rows`,
    `${refresh.blocklist_summary.blocked_direct_artifact_paths} blocked direct artifact paths`,
    `${refresh.blocklist_summary.blocked_content_reference_paths} blocked content-reference rows`,
    'source-file reconciliation action plan validator `ok: true`',
    'action performed `false`',
    'Agent 5/8 direct relay prompt validator `ok: true`',
    `status \`${directRelayPrompt.status}\``,
    `${directRelayPrompt.request_id_count} request IDs`,
    `${directRelayPrompt.queue_insertion_patch_operations} queue-insertion patch operations`,
    `${directRelayPrompt.agent6_disposition_hits} Agent 6 disposition hits`,
    `${directRelayPrompt.relay_signal_hits} Agent 5/8 relay-signal hits`,
    'completion claimed `false`',
    'blocked_no_render'
  ]);

  assertLineIncludes(markdown, 'The latest refresh result verifies', [
    'source-file reconciliation action plan proof',
    'owner checklist',
    'Agent 6 decision matrix',
    'Agent 5/8 direct relay prompt proof',
    `\`${refresh.completed_at}\``
  ]);

  assertLineIncludes(markdown, 'validate_agent1_state_currentness.mjs', [
    'current refresh result'
  ]);

  assertLineIncludes(markdown, 'build_agent1_source_custody_current_blocker_packet.mjs', [
    'six exact open blockers',
    'five current request IDs',
    '23 untracked',
    '6 modified tracked',
    '248 blocked direct paths',
    '183 blocked content-reference paths',
    'Agent 8 Callback'
  ]);

  assertLineIncludes(markdown, 'validate_agent1_source_custody_current_blocker_packet.mjs', [
    'ok: true',
    `${blockerValidator.exact_blocker_count} exact blockers`,
    `${blockerValidator.request_id_count} request IDs`,
    `${blockerValidator.untracked_source_files} untracked`,
    `${blockerValidator.modified_tracked_source_files} modified tracked`,
    'non-accepting'
  ]);

  assertLineIncludes(markdown, 'build_agent1_agent5_agent8_direct_relay_prompt.mjs', [
    'exact Agent 5/8 direct relay prompt capsule',
    `${directRelayPrompt.request_id_count} request IDs`,
    `${directRelayPrompt.queue_insertion_patch_operations} queue-insertion patch operations`,
    'zero Agent 6 disposition hits',
    'zero Agent 5/8 relay-signal hits',
    'queue_mutation_performed: false',
    'does not apply the patch'
  ]);

  assertLineIncludes(markdown, 'validate_agent1_agent5_agent8_direct_relay_prompt.mjs', [
    'ok: true',
    'current refresh completion timestamp',
    'every request ID',
    'must-not-accept term',
    'blocked_no_render',
    'acceptance flag false'
  ]);

  for (const term of MUST_NOT_ACCEPT) {
    assert(markdown.includes(term), `state markdown missing must-not-accept term: ${term}`);
  }
}

function renderMarkdown(result) {
  return `# Agent 1 State Currentness Validator Result

Generated: ${result.completed_at}

- OK: ${result.ok}
- State: \`${result.validated_state}\`
- Refresh result: \`${result.refresh_result}\`
- Refresh completed: \`${result.refresh_completed_at}\`
- Public-HUD route/source rows: ${result.public_hud_route_cards}/${result.public_hud_source_rows}
- Source-file reconciliation action plan OK: ${result.source_file_reconciliation_action_plan_ok}
- Source-file reconciliation owner checklist OK: ${result.source_file_reconciliation_owner_checklist_ok}
- Source-file reconciliation owner checklist action/queue mutation: ${result.source_file_reconciliation_owner_checklist_action_performed}/${result.source_file_reconciliation_owner_checklist_queue_mutation_performed}
- Agent 6 decision matrix OK: ${result.source_custody_agent6_decision_matrix_ok}
- Agent 6 decision matrix request IDs / tracking / license rows: ${result.source_custody_agent6_decision_matrix_request_ids}/${result.source_custody_agent6_decision_matrix_tracking_rows}/${result.source_custody_agent6_decision_matrix_license_rows}
- Agent 6 decision matrix action/queue mutation: ${result.source_custody_agent6_decision_matrix_action_performed}/${result.source_custody_agent6_decision_matrix_queue_mutation_performed}
- Direct relay prompt status: \`${result.direct_relay_prompt_status}\`
- Direct relay prompt request IDs / patch operations: ${result.direct_relay_prompt_request_ids}/${result.direct_relay_prompt_patch_operations}
- Publication state: \`${result.boundary.publication_state}\`
- Completion claimed: ${result.boundary.completion_claimed}

This validator confirms \`reports/agent1-state.md\` is aligned to the current Agent 1 refresh result for the checked source/provenance custody evidence. It does not accept source/provenance custody, source publication, source-file tracking, QA, runtime, publication, route-publication, Definition, product/data, usage-as-definition, translation output, or accepted text.
`;
}

function main() {
  const startedAt = new Date().toISOString();
  const refresh = readJson(PATHS.refreshResult);
  const blockerValidator = readJson(PATHS.blockerValidator);
  const directRelayPromptValidator = readJson(PATHS.directRelayPromptValidator);
  const ownerChecklistValidator = readJson(PATHS.ownerChecklistValidator);
  const decisionMatrixValidator = readJson(PATHS.decisionMatrixValidator);
  const markdown = readText(PATHS.state);
  assertStateCurrent(markdown, refresh, blockerValidator, directRelayPromptValidator, ownerChecklistValidator, decisionMatrixValidator);

  const result = {
    ok: true,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    validated_state: PATHS.state,
    refresh_result: PATHS.refreshResult,
    refresh_completed_at: refresh.completed_at,
    public_hud_route_cards: refresh.public_hud_source_row_evidence_summary.summary.route_card_count_extracted,
    public_hud_source_rows: refresh.public_hud_source_row_evidence_summary.summary.source_row_count_extracted,
    source_file_reconciliation_action_plan_ok: refresh.source_file_reconciliation_action_plan_validator_summary.ok,
    source_file_reconciliation_action_performed: refresh.source_file_reconciliation_action_plan_validator_summary.action_performed,
    source_file_reconciliation_owner_checklist_ok: ownerChecklistValidator.ok,
    source_file_reconciliation_owner_checklist_action_performed: ownerChecklistValidator.action_performed,
    source_file_reconciliation_owner_checklist_queue_mutation_performed: ownerChecklistValidator.queue_mutation_performed,
    source_custody_agent6_decision_matrix_ok: decisionMatrixValidator.ok,
    source_custody_agent6_decision_matrix_request_ids: decisionMatrixValidator.request_id_count,
    source_custody_agent6_decision_matrix_tracking_rows: decisionMatrixValidator.tracking_rows,
    source_custody_agent6_decision_matrix_license_rows: decisionMatrixValidator.license_rows,
    source_custody_agent6_decision_matrix_action_performed: decisionMatrixValidator.action_performed,
    source_custody_agent6_decision_matrix_queue_mutation_performed: decisionMatrixValidator.queue_mutation_performed,
    current_blocker_packet_ok: blockerValidator.ok,
    current_blocker_count: blockerValidator.exact_blocker_count,
    direct_relay_prompt_ok: directRelayPromptValidator.ok,
    direct_relay_prompt_status: directRelayPromptValidator.status,
    direct_relay_prompt_request_ids: directRelayPromptValidator.request_id_count,
    direct_relay_prompt_patch_operations: directRelayPromptValidator.queue_insertion_patch_operations,
    direct_relay_prompt_agent6_disposition_hits: directRelayPromptValidator.agent6_disposition_hits,
    direct_relay_prompt_relay_signal_hits: directRelayPromptValidator.relay_signal_hits,
    completion_audit_status: refresh.completion_audit_validator_summary.overall_status,
    boundary: {
      publication_state: refresh.boundary.publication_state,
      completion_claimed: refresh.completion_audit_validator_summary.boundary.completion_claimed,
      source_provenance_acceptance_claimed: refresh.boundary.source_provenance_acceptance_claimed,
      public_runtime_acceptance_claimed: refresh.boundary.public_runtime_acceptance_claimed,
      route_publication_support_claimed: refresh.boundary.route_publication_support_claimed,
      definition_authority_claimed: refresh.boundary.definition_authority_claimed,
      page_render_acceptance_claimed: refresh.boundary.page_render_acceptance_claimed
    }
  };

  writeJson(PATHS.result, result);
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
    details: error.details || null
  };
  writeJson(PATHS.result, result);
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
