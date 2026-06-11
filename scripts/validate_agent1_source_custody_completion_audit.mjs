#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  audit: 'reports/agent1-source-custody-objective-completion-audit-2026-06-03.json',
  auditMd: 'reports/agent1-source-custody-objective-completion-audit-2026-06-03.md',
  refreshResult: 'reports/agent1-source-custody-refresh-result.json',
  custodyValidator: 'reports/agent1-source-provenance-custody-validator-result.json',
  directRelayPrompt: 'reports/agent1-agent5-agent8-direct-relay-prompt-2026-06-03.json',
  directRelayPromptMd: 'reports/agent1-agent5-agent8-direct-relay-prompt-2026-06-03.md',
  directRelayPromptValidator: 'reports/agent1-agent5-agent8-direct-relay-prompt-validator-result-2026-06-03.json',
  directRelayPromptValidatorMd: 'reports/agent1-agent5-agent8-direct-relay-prompt-validator-result-2026-06-03.md',
  result: 'reports/agent1-source-custody-objective-completion-audit-validator-result-2026-06-03.json',
  resultMd: 'reports/agent1-source-custody-objective-completion-audit-validator-result-2026-06-03.md'
};

const EXPECTED_REQUIREMENTS = ['R1', 'R2', 'R3', 'R4', 'R5', 'R6'];
const EXPECTED_REVIEW_ITEMS = [
  'agent6-agent1-source-custody-manifest-remediation-review',
  'agent6-agent1-source-custody-tracking-action-review',
  'agent6-agent1-source-custody-license-normalization-review',
  'agent6-agent1-public-hud-source-row-review',
  'agent6-agent1-orot-fill-source-row-review'
].sort((a, b) => a.localeCompare(b));

const EXPECTED_MUST_NOT_ACCEPT = [
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

function assert(condition, message, details = {}) {
  if (!condition) {
    const error = new Error(message);
    error.details = details;
    throw error;
  }
}

function sorted(values) {
  return [...values].sort((a, b) => String(a).localeCompare(String(b)));
}

function sameSet(actual, expected, label) {
  const left = sorted(actual || []);
  const right = sorted(expected || []);
  assert(left.length === right.length && left.every((value, index) => value === right[index]), `${label} mismatch`, { actual: left, expected: right });
}

function assertBoundary(boundary) {
  assert(boundary?.publication_state === 'blocked_no_render', 'publication state must remain blocked_no_render');
  assert(boundary?.completion_claimed === false, 'completion must not be claimed');
  for (const key of [
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

function assertCurrentEvidence(audit, refresh, custodyValidator, directRelayPromptValidator) {
  const current = audit.current_evidence;
  assert(current.refresh_completed_at === refresh.completed_at, 'audit must match current refresh completion timestamp');
  assert(current.direct_untracked_sources === 23, 'expected 23 direct untracked sources');
  assert(current.audit_untracked_sources === 23, 'expected 23 audit untracked sources');
  assert(current.live_untracked_sources === custodyValidator.live_untracked_sources, 'live untracked source count mismatch');
  assert(current.live_modified_tracked_sources === custodyValidator.live_modified_tracked_sources, 'modified tracked source count mismatch');
  assert(current.source_rows === 29, 'expected 29 source rows');
  assert(current.source_fingerprinted_rows === 29, 'expected 29 fingerprinted source rows');
  assert(current.blocked_downstream_direct_paths === 248, 'expected 248 blocked direct paths');
  assert(current.blocked_downstream_content_reference_paths === 183, 'expected 183 blocked content-reference paths');
  assert(current.route_or_hud_content_reference_rows === 42, 'expected 42 route/HUD rows');
  assert(current.reader_workbench_content_reference_rows === 112, 'expected 112 reader/workbench rows');
  assert(current.public_lexical_content_reference_rows === 29, 'expected 29 public lexical rows');
  sameSet(current.agent6_ready_review_items, EXPECTED_REVIEW_ITEMS, 'Agent 6-ready review items');
  sameSet(current.missing_relay_request_ids, EXPECTED_REVIEW_ITEMS, 'missing relay request IDs');
  assert(current.relay_status === 'relay_needed_control_surfaces_missing_request_ids', 'relay status mismatch');
  assert(current.agent6_disposition_watch_status === 'awaiting_relay_no_agent6_disposition_detected', 'disposition watch status mismatch');
  assert(current.agent6_disposition_hits === 0, 'Agent 6 disposition hits must be zero');
  assert(current.relay_signal_hits === 0, 'relay signal hits must be zero');
  assert(current.live_queue_item_count === 36, 'live queue item count mismatch');
  assert(current.dry_run_queue_item_count === 41, 'dry-run queue item count mismatch');
  assert(current.live_queue_mutation_performed === false, 'live queue mutation must be false');
  assert(current.queue_patch_operation_count === 5, 'queue patch operation count mismatch');
  assert(current.queue_patch_live_mutation_performed === false, 'queue patch live mutation must be false');
  assert(current.direct_relay_prompt === PATHS.directRelayPrompt, 'direct relay prompt path mismatch');
  assert(current.direct_relay_prompt_md === PATHS.directRelayPromptMd, 'direct relay prompt markdown path mismatch');
  assert(current.direct_relay_prompt_validator === PATHS.directRelayPromptValidator, 'direct relay prompt validator path mismatch');
  assert(current.direct_relay_prompt_validator_md === PATHS.directRelayPromptValidatorMd, 'direct relay prompt validator markdown path mismatch');
  assert(current.direct_relay_prompt_status === 'direct_relay_prompt_ready_no_agent1_mutation', 'direct relay prompt status mismatch');
  assert(current.direct_relay_prompt_status === directRelayPromptValidator.status, 'direct relay prompt validator status mismatch');
  assert(current.direct_relay_prompt_request_ids === 5, 'direct relay prompt request ID count mismatch');
  assert(current.direct_relay_prompt_request_ids === directRelayPromptValidator.request_id_count, 'direct relay prompt validator request ID count mismatch');
  assert(current.direct_relay_prompt_patch_operations === 5, 'direct relay prompt patch operation count mismatch');
  assert(current.direct_relay_prompt_patch_operations === directRelayPromptValidator.queue_insertion_patch_operations, 'direct relay prompt validator patch operation count mismatch');
  assert(current.direct_relay_prompt_agent6_disposition_hits === 0, 'direct relay prompt Agent 6 disposition hits must be zero');
  assert(current.direct_relay_prompt_agent6_disposition_hits === directRelayPromptValidator.agent6_disposition_hits, 'direct relay prompt validator Agent 6 disposition hits mismatch');
  assert(current.direct_relay_prompt_relay_signal_hits === 0, 'direct relay prompt relay signal hits must be zero');
  assert(current.direct_relay_prompt_relay_signal_hits === directRelayPromptValidator.relay_signal_hits, 'direct relay prompt validator relay signal hits mismatch');
  assert(current.direct_relay_prompt_queue_mutation_performed === false, 'direct relay prompt queue mutation must be false');
  assert(current.direct_relay_prompt_queue_mutation_performed === directRelayPromptValidator.boundary.queue_mutation_performed, 'direct relay prompt validator queue mutation mismatch');
}

function assertRequirements(requirements) {
  sameSet(requirements.map((item) => item.id), EXPECTED_REQUIREMENTS, 'requirement IDs');
  const byId = new Map(requirements.map((item) => [item.id, item]));
  assert(byId.get('R1').state === 'evidence_prepared_current_refresh_ok', 'R1 state mismatch');
  assert(byId.get('R2').state === 'incomplete_pending_agent6_tracking_or_exclusion_disposition', 'R2 state mismatch');
  assert(byId.get('R3').state === 'incomplete_pending_agent6_license_normalization_disposition', 'R3 state mismatch');
  assert(byId.get('R4').state === 'evidence_prepared_current_refresh_ok', 'R4 state mismatch');
  assert(byId.get('R5').state === 'evidence_prepared_awaiting_relay_and_agent6_disposition', 'R5 state mismatch');
  assert(byId.get('R6').state === 'verified_current_boundary_false_flags', 'R6 state mismatch');
  for (const item of requirements) {
    assert(Array.isArray(item.evidence) && item.evidence.length > 0, `${item.id} must cite evidence`);
    for (const evidencePath of item.evidence) {
      assert(fs.existsSync(fullPath(evidencePath)), `${item.id} evidence missing: ${evidencePath}`);
    }
  }
  const r5Evidence = byId.get('R5').evidence;
  assert(r5Evidence.includes(PATHS.directRelayPrompt), 'R5 must cite direct relay prompt JSON evidence');
  assert(r5Evidence.includes(PATHS.directRelayPromptMd), 'R5 must cite direct relay prompt Markdown evidence');
  assert(r5Evidence.includes(PATHS.directRelayPromptValidator), 'R5 must cite direct relay prompt validator JSON evidence');
  assert(r5Evidence.includes(PATHS.directRelayPromptValidatorMd), 'R5 must cite direct relay prompt validator Markdown evidence');
  const r6Evidence = byId.get('R6').evidence;
  assert(r6Evidence.includes(PATHS.directRelayPromptValidator), 'R6 must cite direct relay prompt validator boundary evidence');
}

function renderResultMarkdown(result) {
  return `# Agent 1 Source Custody Objective Completion Audit Validator Result

Generated: ${result.completed_at}

- OK: ${result.ok}
- Validated audit: \`${result.validated_audit}\`
- Overall status: \`${result.overall_status}\`
- Requirement count: ${result.requirement_count}
- Current blocking conditions: ${result.current_blocking_conditions.length}
- Publication state: \`${result.boundary?.publication_state}\`
- Direct relay prompt status: \`${result.direct_relay_prompt_status}\`
- Direct relay prompt request IDs / queue patch operations: ${result.direct_relay_prompt_request_ids}/${result.direct_relay_prompt_patch_operations}
- Direct relay prompt queue mutation performed: ${result.direct_relay_prompt_queue_mutation_performed}

This validator confirms the objective audit is current and non-accepting. It does not mark the thread goal complete.
`;
}

function main() {
  const startedAt = new Date().toISOString();
  const audit = readJson(PATHS.audit);
  const refresh = readJson(PATHS.refreshResult);
  const custodyValidator = readJson(PATHS.custodyValidator);
  const directRelayPromptValidator = readJson(PATHS.directRelayPromptValidator);

  assert(fs.existsSync(fullPath(PATHS.auditMd)), 'audit markdown must exist');
  assert(fs.existsSync(fullPath(PATHS.directRelayPrompt)), 'direct relay prompt must exist');
  assert(fs.existsSync(fullPath(PATHS.directRelayPromptMd)), 'direct relay prompt markdown must exist');
  assert(fs.existsSync(fullPath(PATHS.directRelayPromptValidatorMd)), 'direct relay prompt validator markdown must exist');
  assert(audit.artifact_type === 'agent1_source_custody_objective_completion_audit', 'unexpected artifact type');
  assert(audit.overall_status === 'not_complete_evidence_current_awaiting_agent5_or_agent8_relay_and_agent6_disposition', 'overall status mismatch');
  assert(audit.highest_permissible_claim === 'source/provenance custody evidence and Agent 6-ready packet evidence prepared', 'highest permissible claim mismatch');
  assert(refresh.ok === true, 'refresh result must be ok');
  assert(custodyValidator.ok === true, 'custody validator must be ok');
  assert(directRelayPromptValidator.ok === true, 'direct relay prompt validator must be ok');
  assert(directRelayPromptValidator.refresh_completed_at === refresh.completed_at, 'direct relay prompt must match current refresh timestamp');
  assert(directRelayPromptValidator.status === 'direct_relay_prompt_ready_no_agent1_mutation', 'direct relay prompt validator status mismatch');
  assert(directRelayPromptValidator.boundary?.publication_state === 'blocked_no_render', 'direct relay prompt publication boundary mismatch');
  assert(directRelayPromptValidator.boundary?.queue_mutation_performed === false, 'direct relay prompt must not mutate queue');
  assertCurrentEvidence(audit, refresh, custodyValidator, directRelayPromptValidator);
  assertRequirements(audit.requirements || []);
  assertBoundary(audit.boundary);
  sameSet(audit.must_not_accept, EXPECTED_MUST_NOT_ACCEPT, 'must-not-accept list');
  assert((audit.current_blocking_conditions || []).length >= 6, 'expected current blocking conditions');
  assert(audit.current_blocking_conditions.includes('source/provenance custody remains unaccepted'), 'missing custody unaccepted blocker');
  assert(audit.current_blocking_conditions.includes('publication remains blocked_no_render'), 'missing blocked_no_render blocker');
  for (const artifact of audit.evidence_artifacts || []) {
    assert(fs.existsSync(fullPath(artifact)), `audit evidence artifact missing: ${artifact}`);
  }

  const result = {
    ok: true,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    validated_audit: PATHS.audit,
    validated_audit_md: PATHS.auditMd,
    overall_status: audit.overall_status,
    requirement_count: audit.requirements.length,
    requirement_states: audit.requirements.map((item) => ({ id: item.id, state: item.state })),
    current_blocking_conditions: audit.current_blocking_conditions,
    direct_relay_prompt_status: audit.current_evidence.direct_relay_prompt_status,
    direct_relay_prompt_request_ids: audit.current_evidence.direct_relay_prompt_request_ids,
    direct_relay_prompt_patch_operations: audit.current_evidence.direct_relay_prompt_patch_operations,
    direct_relay_prompt_queue_mutation_performed: audit.current_evidence.direct_relay_prompt_queue_mutation_performed,
    boundary: audit.boundary
  };
  writeJson(PATHS.result, result);
  writeText(PATHS.resultMd, renderResultMarkdown(result));
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
      completion_claimed: false,
      source_provenance_acceptance_claimed: false,
      qa_acceptance_claimed: false,
      public_runtime_acceptance_claimed: false
    }
  };
  writeJson(PATHS.result, result);
  writeText(PATHS.resultMd, renderResultMarkdown(result));
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
