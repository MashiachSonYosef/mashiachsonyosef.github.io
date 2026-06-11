#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  refreshResult: 'reports/agent1-source-custody-refresh-result.json',
  refreshResultMd: 'reports/agent1-source-custody-refresh-result.md',
  custodyValidator: 'reports/agent1-source-provenance-custody-validator-result.json',
  completionAudit: 'reports/agent1-source-custody-objective-completion-audit-2026-06-03.json',
  completionAuditValidator: 'reports/agent1-source-custody-objective-completion-audit-validator-result-2026-06-03.json',
  currentBlockerPacketValidator: 'reports/agent1-source-custody-current-blocker-packet-validator-result-2026-06-03.json',
  directRelayPromptValidator: 'reports/agent1-agent5-agent8-direct-relay-prompt-validator-result-2026-06-03.json',
  ownerChecklistValidator: 'reports/agent1-source-file-reconciliation-owner-checklist-validator-result-2026-06-03.json',
  decisionMatrixValidator: 'reports/agent1-source-custody-agent6-decision-matrix-validator-result-2026-06-03.json',
  outputJson: 'reports/agent1-source-custody-refresh-result-validator-result-2026-06-03.json',
  outputMd: 'reports/agent1-source-custody-refresh-result-validator-result-2026-06-03.md'
};

const EXPECTED_REVIEW_ITEMS = [
  'agent6-agent1-source-custody-manifest-remediation-review',
  'agent6-agent1-source-custody-tracking-action-review',
  'agent6-agent1-source-custody-license-normalization-review',
  'agent6-agent1-public-hud-source-row-review',
  'agent6-agent1-orot-fill-source-row-review'
];

const REQUIRED_COMMANDS = [
  'git ls-files --others --exclude-standard -- data/sources/*.json',
  'node scripts/validate_agent1_source_custody_packet.mjs',
  'node scripts/validate_agent1_source_provenance_agent6_ready_docket.mjs',
  'node scripts/validate_agent1_agent5_agent6_docket_relay_packet.mjs',
  'node scripts/validate_agent1_agent6_queue_intake_contract_for_relay_packet.mjs',
  'node scripts/validate_agent1_agent6_queue_dry_run_with_relay_items.mjs',
  'node scripts/validate_agent1_agent5_agent8_relay_readiness_checkpoint.mjs',
  'node scripts/validate_agent1_agent5_agent6_control_surface_delta_packet.mjs',
  'node scripts/validate_agent1_agent5_agent6_queue_insertion_patch_packet.mjs',
  'node scripts/validate_agent1_agent6_disposition_watch.mjs',
  'node scripts/build_agent1_source_custody_completion_audit.mjs',
  'node scripts/validate_agent1_source_custody_completion_audit.mjs',
  'node scripts/build_agent1_source_custody_current_blocker_packet.mjs',
  'node scripts/validate_agent1_source_custody_current_blocker_packet.mjs',
  'node scripts/build_agent1_agent5_agent8_direct_relay_prompt.mjs',
  'node scripts/validate_agent1_agent5_agent8_direct_relay_prompt.mjs',
  'node scripts/build_agent1_source_file_reconciliation_owner_checklist.mjs',
  'node scripts/validate_agent1_source_file_reconciliation_owner_checklist.mjs',
  'node scripts/build_agent1_source_custody_agent6_decision_matrix.mjs',
  'node scripts/validate_agent1_source_custody_agent6_decision_matrix.mjs',
  'node scripts/validate_agent1_source_custody_refresh_result.mjs'
];

const REQUIRED_ARTIFACTS = [
  'reports/untracked-source-files-direct.txt',
  'reports/untracked-source-scope-audit.json',
  'reports/agent1-source-provenance-custody-packet.json',
  'reports/agent1-downstream-quarantine-manifest.json',
  'reports/agent1-custody-blocklist.json',
  'reports/agent1-source-custody-reference-diagnostics.json',
  'reports/agent1-source-custody-closure-options.json',
  'reports/agent1-source-custody-reconciliation-preflight.json',
  'reports/agent1-agent6-source-custody-decision-packet.json',
  'reports/agent1-source-provenance-agent6-ready-docket-2026-06-03.json',
  'reports/agent1-agent5-agent6-docket-relay-packet-2026-06-03.json',
  'reports/agent1-agent6-validation-queue-dry-run-validator-result-2026-06-03.json',
  'reports/agent1-agent5-agent8-relay-readiness-checkpoint-validator-result-2026-06-03.json',
  'reports/agent1-agent5-agent6-control-surface-delta-validator-result-2026-06-03.json',
  'reports/agent1-agent5-agent6-queue-insertion-patch-validator-result-2026-06-03.json',
  'reports/agent1-agent6-disposition-watch-validator-result-2026-06-03.json',
  'reports/agent1-source-custody-current-blocker-packet-2026-06-03.json',
  'reports/agent1-source-custody-current-blocker-packet-2026-06-03.md',
  'reports/agent1-source-custody-current-blocker-packet-validator-result-2026-06-03.json',
  'reports/agent1-source-custody-current-blocker-packet-validator-result-2026-06-03.md',
  'reports/agent1-agent5-agent8-direct-relay-prompt-2026-06-03.json',
  'reports/agent1-agent5-agent8-direct-relay-prompt-2026-06-03.md',
  'reports/agent1-agent5-agent8-direct-relay-prompt-validator-result-2026-06-03.json',
  'reports/agent1-agent5-agent8-direct-relay-prompt-validator-result-2026-06-03.md',
  'reports/agent1-source-file-reconciliation-owner-checklist-2026-06-03.json',
  'reports/agent1-source-file-reconciliation-owner-checklist-2026-06-03.md',
  'reports/agent1-source-file-reconciliation-owner-checklist-validator-result-2026-06-03.json',
  'reports/agent1-source-file-reconciliation-owner-checklist-validator-result-2026-06-03.md',
  'reports/agent1-source-custody-agent6-decision-matrix-2026-06-03.json',
  'reports/agent1-source-custody-agent6-decision-matrix-2026-06-03.md',
  'reports/agent1-source-custody-agent6-decision-matrix-validator-result-2026-06-03.json',
  'reports/agent1-source-custody-agent6-decision-matrix-validator-result-2026-06-03.md',
  'reports/agent1-source-custody-objective-completion-audit-2026-06-03.json',
  'reports/agent1-source-custody-objective-completion-audit-validator-result-2026-06-03.json'
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
  return [...values].sort((a, b) => String(a).localeCompare(String(b)));
}

function sameSet(actual, expected, label) {
  const left = sorted(actual || []);
  const right = sorted(expected || []);
  assert(left.length === right.length && left.every((value, index) => value === right[index]), `${label} mismatch`, { actual: left, expected: right });
}

function assertFalseBoundary(boundary, keys) {
  for (const key of keys) {
    assert(boundary?.[key] === false, `boundary ${key} must be false`);
  }
}

function assertRefreshBoundary(refresh) {
  assert(refresh.boundary?.agent1_status === 'evidence-ready / awaiting-Agent-6', 'Agent 1 status mismatch');
  assert(refresh.boundary?.publication_state === 'blocked_no_render', 'publication state mismatch');
  assertFalseBoundary(refresh.boundary, [
    'source_provenance_acceptance_claimed',
    'public_runtime_acceptance_claimed',
    'route_publication_support_claimed',
    'definition_authority_claimed',
    'page_render_acceptance_claimed'
  ]);
}

function assertCompletionBoundary(boundary) {
  assert(boundary?.publication_state === 'blocked_no_render', 'completion audit publication state mismatch');
  assert(boundary?.completion_claimed === false, 'completion must not be claimed');
  assertFalseBoundary(boundary, [
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
  ]);
}

function assertRequiredInputs(refresh) {
  for (const command of REQUIRED_COMMANDS) {
    assert((refresh.commands_run || []).includes(command), `refresh command missing: ${command}`);
  }
  for (const artifactPath of REQUIRED_ARTIFACTS) {
    assert((refresh.artifacts_refreshed || []).includes(artifactPath), `refresh artifact missing from list: ${artifactPath}`);
    assert(fs.existsSync(fullPath(artifactPath)), `refresh artifact does not exist: ${artifactPath}`);
  }
}

function assertRefreshCurrent(refresh, custodyValidator, completionAudit, completionAuditValidator, currentBlockerPacketValidator, directRelayPromptValidator, ownerChecklistValidator, decisionMatrixValidator) {
  assert(refresh.ok === true, 'refresh result must be ok');
  assert(custodyValidator.ok === true, 'custody validator must be ok');
  assert(completionAuditValidator.ok === true, 'completion audit validator must be ok');
  assert(currentBlockerPacketValidator.ok === true, 'current blocker packet validator must be ok');
  assert(directRelayPromptValidator.ok === true, 'direct relay prompt validator must be ok');
  assert(ownerChecklistValidator.ok === true, 'owner checklist validator must be ok');
  assert(decisionMatrixValidator.ok === true, 'decision matrix validator must be ok');
  assert(refresh.completed_at === completionAudit.current_evidence.refresh_completed_at, 'completion audit must cite current refresh completion timestamp');
  assert(refresh.completed_at === currentBlockerPacketValidator.refresh_completed_at, 'current blocker packet must cite current refresh completion timestamp');
  assert(refresh.completed_at === directRelayPromptValidator.refresh_completed_at, 'direct relay prompt must cite current refresh completion timestamp');
  assert(refresh.completed_at === ownerChecklistValidator.refresh_completed_at, 'owner checklist must cite current refresh completion timestamp');
  assert(refresh.completed_at === decisionMatrixValidator.refresh_completed_at, 'decision matrix must cite current refresh completion timestamp');
  assert(refresh.completed_at === completionAuditValidator.completed_at || completionAuditValidator.validated_audit === PATHS.completionAudit, 'completion audit validator shape mismatch');

  assert(refresh.direct_untracked_sources === 23, 'expected 23 direct untracked sources');
  assert(refresh.audit_untracked_sources === 23, 'expected 23 audit untracked sources');
  assert(refresh.direct_untracked_sources === custodyValidator.live_untracked_sources, 'direct untracked count must match custody validator');
  assert(refresh.audit_untracked_sources === custodyValidator.packet_untracked_sources, 'audit untracked count must match custody packet count');
  assert(custodyValidator.live_modified_tracked_sources === 6, 'expected 6 modified tracked source files');
  assert(custodyValidator.packet_modified_tracked_sources === 6, 'expected 6 packet modified tracked source files');
  assert(custodyValidator.source_fingerprints.source_rows === 29, 'expected 29 source rows');
  assert(custodyValidator.source_fingerprints.fingerprinted_source_rows === 29, 'expected 29 fingerprinted rows');
  assert(refresh.blocklist_summary.blocked_source_rows === 29, 'expected 29 blocked source rows');
  assert(refresh.blocklist_summary.blocked_direct_artifact_paths === 248, 'expected 248 blocked direct artifact paths');
  assert(refresh.blocklist_summary.blocked_content_reference_paths === 183, 'expected 183 blocked content-reference paths');
  assert(refresh.blocklist_summary.missing_required_artifacts === 0, 'expected 0 missing required artifacts');

  assert(refresh.control_sync_packet_summary.current.route_or_hud_content_reference_rows === 42, 'expected 42 route/HUD rows');
  assert(refresh.control_sync_packet_summary.current.reader_workbench_content_reference_rows === 112, 'expected 112 reader/workbench rows');
  assert(refresh.control_sync_packet_summary.current.public_lexical_content_reference_rows === 29, 'expected 29 public lexical rows');
  assert(refresh.control_sync_packet_summary.stale_control_surface_count === 4, 'expected 4 stale control surfaces');

  sameSet(refresh.agent6_ready_docket_validator_summary.review_items, EXPECTED_REVIEW_ITEMS, 'Agent 6-ready review items');
  sameSet(refresh.agent5_agent6_relay_validator_summary.request_ids_missing_everywhere, EXPECTED_REVIEW_ITEMS, 'missing relay request IDs');
  assert(refresh.agent5_agent6_relay_validator_summary.status === 'relay_needed_control_surfaces_missing_request_ids', 'relay status mismatch');
  assert(refresh.agent6_intake_contract_validator_summary.ok === true, 'Agent 6 intake contract validator must be ok');
  assert(refresh.agent6_intake_contract_validator_summary.blocking_findings === 0, 'Agent 6 intake contract blocking findings must be zero');
  assert(refresh.agent6_queue_dry_run_validator_summary.ok === true, 'queue dry-run validator must be ok');
  assert(refresh.agent6_queue_dry_run_validator_summary.live_queue_item_count === 36, 'live queue item count mismatch');
  assert(refresh.agent6_queue_dry_run_validator_summary.dry_run_queue_item_count === 41, 'dry-run queue item count mismatch');
  assert(refresh.agent6_queue_dry_run_validator_summary.boundary.live_queue_mutation_performed === false, 'dry-run live queue mutation must be false');
  assert(refresh.agent5_agent6_queue_insertion_patch_validator_summary.ok === true, 'queue insertion patch validator must be ok');
  assert(refresh.agent5_agent6_queue_insertion_patch_validator_summary.operation_count === 5, 'queue insertion patch operation count mismatch');
  assert(refresh.agent5_agent6_queue_insertion_patch_validator_summary.boundary.live_queue_mutation_performed === false, 'queue insertion patch live mutation must be false');
  assert(refresh.agent6_disposition_watch_validator_summary.ok === true, 'disposition watch validator must be ok');
  assert(refresh.agent6_disposition_watch_validator_summary.status === 'awaiting_relay_no_agent6_disposition_detected', 'disposition watch status mismatch');
  assert(refresh.agent6_disposition_watch_validator_summary.agent6_disposition_hits === 0, 'Agent 6 disposition hits must be zero');
  assert(refresh.agent6_disposition_watch_validator_summary.relay_signal_hits === 0, 'relay signal hits must be zero');

  assert(refresh.completion_audit_summary?.ok === true, 'refresh must include completion audit summary');
  assert(refresh.completion_audit_validator_summary?.ok === true, 'refresh must include completion audit validator summary');
  assert(refresh.completion_audit_summary.overall_status === completionAudit.overall_status, 'completion audit status mismatch');
  assert(refresh.completion_audit_validator_summary.overall_status === completionAuditValidator.overall_status, 'completion audit validator status mismatch');
  assert(completionAudit.overall_status === 'not_complete_evidence_current_awaiting_agent5_or_agent8_relay_and_agent6_disposition', 'completion audit overall status mismatch');
  assert(completionAuditValidator.overall_status === completionAudit.overall_status, 'completion audit validator overall status must match audit');
  assert(completionAudit.current_evidence.agent6_disposition_hits === 0, 'completion audit Agent 6 disposition hits must be zero');
  assert(completionAudit.current_evidence.relay_signal_hits === 0, 'completion audit relay signal hits must be zero');

  assert(refresh.current_blocker_packet_summary?.ok === true, 'refresh must include current blocker packet summary');
  assert(refresh.current_blocker_packet_validator_summary?.ok === true, 'refresh must include current blocker packet validator summary');
  assert(refresh.current_blocker_packet_summary.status === 'evidence_current_relay_and_disposition_blockers_open', 'current blocker packet status mismatch');
  assert(refresh.current_blocker_packet_validator_summary.exact_blocker_count === 6, 'current blocker exact blocker count mismatch');
  assert(refresh.current_blocker_packet_validator_summary.request_id_count === EXPECTED_REVIEW_ITEMS.length, 'current blocker request ID count mismatch');
  assert(refresh.current_blocker_packet_validator_summary.untracked_source_files === 23, 'current blocker untracked source count mismatch');
  assert(refresh.current_blocker_packet_validator_summary.modified_tracked_source_files === 6, 'current blocker modified tracked source count mismatch');
  assert(refresh.current_blocker_packet_validator_summary.blocked_direct_artifact_paths === refresh.blocklist_summary.blocked_direct_artifact_paths, 'current blocker direct path count mismatch');
  assert(refresh.current_blocker_packet_validator_summary.blocked_content_reference_paths === refresh.blocklist_summary.blocked_content_reference_paths, 'current blocker content-reference path count mismatch');
  assert(currentBlockerPacketValidator.exact_blocker_count === refresh.current_blocker_packet_validator_summary.exact_blocker_count, 'current blocker validator exact blocker count mismatch');
  assert(currentBlockerPacketValidator.boundary.completion_claimed === false, 'current blocker packet must not claim completion');
  assertCompletionBoundary(currentBlockerPacketValidator.boundary);

  assert(refresh.agent5_agent8_direct_relay_prompt_summary?.ok === true, 'refresh must include direct relay prompt summary');
  assert(refresh.agent5_agent8_direct_relay_prompt_validator_summary?.ok === true, 'refresh must include direct relay prompt validator summary');
  assert(refresh.agent5_agent8_direct_relay_prompt_summary.status === 'direct_relay_prompt_ready_no_agent1_mutation', 'direct relay prompt status mismatch');
  assert(refresh.agent5_agent8_direct_relay_prompt_validator_summary.status === 'direct_relay_prompt_ready_no_agent1_mutation', 'direct relay prompt validator status mismatch');
  assert(refresh.agent5_agent8_direct_relay_prompt_validator_summary.request_id_count === EXPECTED_REVIEW_ITEMS.length, 'direct relay prompt request ID count mismatch');
  assert(refresh.agent5_agent8_direct_relay_prompt_validator_summary.queue_insertion_patch_operations === EXPECTED_REVIEW_ITEMS.length, 'direct relay prompt patch operation count mismatch');
  assert(refresh.agent5_agent8_direct_relay_prompt_validator_summary.agent6_disposition_hits === 0, 'direct relay prompt Agent 6 disposition hits must be zero');
  assert(refresh.agent5_agent8_direct_relay_prompt_validator_summary.relay_signal_hits === 0, 'direct relay prompt relay signal hits must be zero');
  assert(refresh.agent5_agent8_direct_relay_prompt_validator_summary.boundary.queue_mutation_performed === false, 'direct relay prompt queue mutation must be false');
  assert(directRelayPromptValidator.request_id_count === refresh.agent5_agent8_direct_relay_prompt_validator_summary.request_id_count, 'direct relay prompt validator request count mismatch');
  assertCompletionBoundary(directRelayPromptValidator.boundary);

  assert(refresh.source_file_reconciliation_owner_checklist_summary?.ok === true, 'refresh must include owner checklist summary');
  assert(refresh.source_file_reconciliation_owner_checklist_validator_summary?.ok === true, 'refresh must include owner checklist validator summary');
  assert(refresh.source_file_reconciliation_owner_checklist_summary.refresh_completed_at === refresh.completed_at, 'owner checklist summary refresh timestamp mismatch');
  assert(refresh.source_file_reconciliation_owner_checklist_validator_summary.refresh_completed_at === refresh.completed_at, 'owner checklist validator refresh timestamp mismatch');
  assert(refresh.source_file_reconciliation_owner_checklist_validator_summary.track_candidate_source_files === 23, 'owner checklist tracking source count mismatch');
  assert(refresh.source_file_reconciliation_owner_checklist_validator_summary.modified_tracked_source_files === 6, 'owner checklist modified tracked count mismatch');
  assert(refresh.source_file_reconciliation_owner_checklist_validator_summary.request_id_count === EXPECTED_REVIEW_ITEMS.length, 'owner checklist request ID count mismatch');
  assert(refresh.source_file_reconciliation_owner_checklist_validator_summary.exact_blocker_count === 6, 'owner checklist blocker count mismatch');
  assert(refresh.source_file_reconciliation_owner_checklist_validator_summary.blocked_direct_artifact_paths === refresh.blocklist_summary.blocked_direct_artifact_paths, 'owner checklist blocked direct path count mismatch');
  assert(refresh.source_file_reconciliation_owner_checklist_validator_summary.blocked_content_reference_paths === refresh.blocklist_summary.blocked_content_reference_paths, 'owner checklist blocked content-reference count mismatch');
  assert(refresh.source_file_reconciliation_owner_checklist_validator_summary.action_performed === false, 'owner checklist action must not be performed');
  assert(refresh.source_file_reconciliation_owner_checklist_validator_summary.queue_mutation_performed === false, 'owner checklist queue mutation must be false');
  assert(ownerChecklistValidator.action_performed === false, 'owner checklist validator action must not be performed');
  assert(ownerChecklistValidator.queue_mutation_performed === false, 'owner checklist validator queue mutation must be false');
  assertCompletionBoundary(ownerChecklistValidator.boundary);

  assert(refresh.source_custody_agent6_decision_matrix_summary?.ok === true, 'refresh must include decision matrix summary');
  assert(refresh.source_custody_agent6_decision_matrix_validator_summary?.ok === true, 'refresh must include decision matrix validator summary');
  assert(refresh.source_custody_agent6_decision_matrix_summary.refresh_completed_at === refresh.completed_at, 'decision matrix summary refresh timestamp mismatch');
  assert(refresh.source_custody_agent6_decision_matrix_validator_summary.refresh_completed_at === refresh.completed_at, 'decision matrix validator refresh timestamp mismatch');
  assert(refresh.source_custody_agent6_decision_matrix_validator_summary.request_id_count === EXPECTED_REVIEW_ITEMS.length, 'decision matrix request ID count mismatch');
  assert(refresh.source_custody_agent6_decision_matrix_validator_summary.tracking_rows === 23, 'decision matrix tracking row count mismatch');
  assert(refresh.source_custody_agent6_decision_matrix_validator_summary.license_rows === 6, 'decision matrix license row count mismatch');
  assert(refresh.source_custody_agent6_decision_matrix_validator_summary.exact_blockers === 6, 'decision matrix exact blocker count mismatch');
  assert(refresh.source_custody_agent6_decision_matrix_validator_summary.blocked_direct_artifact_paths === refresh.blocklist_summary.blocked_direct_artifact_paths, 'decision matrix blocked direct path count mismatch');
  assert(refresh.source_custody_agent6_decision_matrix_validator_summary.blocked_content_reference_paths === refresh.blocklist_summary.blocked_content_reference_paths, 'decision matrix blocked content-reference path count mismatch');
  assert(refresh.source_custody_agent6_decision_matrix_validator_summary.route_hud_content_reference_rows === 42, 'decision matrix route/HUD rows mismatch');
  assert(refresh.source_custody_agent6_decision_matrix_validator_summary.reader_workbench_content_reference_rows === 112, 'decision matrix reader/workbench rows mismatch');
  assert(refresh.source_custody_agent6_decision_matrix_validator_summary.public_lexical_content_reference_rows === 29, 'decision matrix public lexical rows mismatch');
  assert(refresh.source_custody_agent6_decision_matrix_validator_summary.action_performed === false, 'decision matrix action must not be performed');
  assert(refresh.source_custody_agent6_decision_matrix_validator_summary.queue_mutation_performed === false, 'decision matrix queue mutation must be false');
  assert(decisionMatrixValidator.action_performed === false, 'decision matrix validator action must not be performed');
  assert(decisionMatrixValidator.queue_mutation_performed === false, 'decision matrix validator queue mutation must be false');
  assertCompletionBoundary(decisionMatrixValidator.boundary);

  assertRefreshBoundary(refresh);
  assertCompletionBoundary(completionAudit.boundary);
  assertCompletionBoundary(completionAuditValidator.boundary);
}

function assertMarkdown(refresh, completionAuditValidator) {
  const markdown = readText(PATHS.refreshResultMd);
  assert(markdown.includes(`Completed: ${refresh.completed_at}`), 'refresh markdown must include completion timestamp');
  assert(markdown.includes(`- Objective completion audit status: ${completionAuditValidator.overall_status}`), 'refresh markdown must include completion audit status');
  assert(markdown.includes('- Current blocker packet validator OK: true'), 'refresh markdown must include current blocker validator OK');
  assert(markdown.includes('- Current blocker packet exact blockers: 6'), 'refresh markdown must include current blocker exact blocker count');
  assert(markdown.includes('- Agent 5/8 direct relay prompt validator OK: true'), 'refresh markdown must include direct relay prompt validator OK');
  assert(markdown.includes('- Agent 5/8 direct relay prompt status: direct_relay_prompt_ready_no_agent1_mutation'), 'refresh markdown must include direct relay prompt status');
  assert(markdown.includes('- Source file reconciliation owner checklist validator OK: true'), 'refresh markdown must include owner checklist validator OK');
  assert(markdown.includes('- Source file reconciliation owner checklist action performed: false'), 'refresh markdown must include owner checklist action non-performance');
  assert(markdown.includes('- Source file reconciliation owner checklist queue mutation performed: false'), 'refresh markdown must include owner checklist queue non-mutation');
  assert(markdown.includes('- Agent 6 decision matrix validator OK: true'), 'refresh markdown must include decision matrix validator OK');
  assert(markdown.includes('- Agent 6 decision matrix request IDs: 5'), 'refresh markdown must include decision matrix request ID count');
  assert(markdown.includes('- Agent 6 decision matrix action performed: false'), 'refresh markdown must include decision matrix action non-performance');
  assert(markdown.includes('- Agent 6 decision matrix queue mutation performed: false'), 'refresh markdown must include decision matrix queue non-mutation');
  assert(markdown.includes('- Objective completion audit validator OK: true'), 'refresh markdown must include completion audit validator OK');
  assert(markdown.includes('- Objective completion claimed: false'), 'refresh markdown must include completion non-claim');
}

function renderMarkdown(result) {
  return `# Agent 1 Source Custody Refresh Result Validator Result

Generated: ${result.completed_at}

- OK: ${result.ok}
- Validated refresh result: \`${result.validated_refresh_result}\`
- Refresh completed: \`${result.refresh_completed_at}\`
- Direct/audit untracked sources: ${result.direct_untracked_sources}/${result.audit_untracked_sources}
- Modified tracked source files: ${result.modified_tracked_source_files}
- Blocked direct/content-reference paths: ${result.blocked_direct_artifact_paths}/${result.blocked_content_reference_paths}
- Agent 6-ready review items: ${result.agent6_ready_review_items?.length ?? 0}
- Relay status: \`${result.relay_status}\`
- Disposition watch status: \`${result.disposition_watch_status}\`
- Current blocker packet status: \`${result.current_blocker_packet_status}\`
- Current blocker exact blockers: ${result.current_blocker_exact_blocker_count}
- Direct relay prompt status: \`${result.direct_relay_prompt_status}\`
- Direct relay prompt request IDs: ${result.direct_relay_prompt_request_id_count}
- Source-file owner checklist: ${result.source_file_reconciliation_owner_checklist_ok}
- Source-file owner checklist action performed: ${result.source_file_reconciliation_owner_checklist_action_performed}
- Source-file owner checklist queue mutation performed: ${result.source_file_reconciliation_owner_checklist_queue_mutation_performed}
- Agent 6 decision matrix: ${result.source_custody_agent6_decision_matrix_ok}
- Agent 6 decision matrix request IDs: ${result.source_custody_agent6_decision_matrix_request_ids}
- Agent 6 decision matrix action performed: ${result.source_custody_agent6_decision_matrix_action_performed}
- Agent 6 decision matrix queue mutation performed: ${result.source_custody_agent6_decision_matrix_queue_mutation_performed}
- Completion audit status: \`${result.completion_audit_status}\`
- Completion claimed: ${result.boundary.completion_claimed}
- Publication state: \`${result.boundary.publication_state}\`

This validator confirms the refresh result is internally current and non-accepting. It does not mark source/provenance custody, source tracking, QA, runtime, publication, Definition, product/data, usage-as-definition, translation output, or accepted text as accepted.
`;
}

function main() {
  const startedAt = new Date().toISOString();
  const refresh = readJson(PATHS.refreshResult);
  const custodyValidator = readJson(PATHS.custodyValidator);
  const completionAudit = readJson(PATHS.completionAudit);
  const completionAuditValidator = readJson(PATHS.completionAuditValidator);
  const currentBlockerPacketValidator = readJson(PATHS.currentBlockerPacketValidator);
  const directRelayPromptValidator = readJson(PATHS.directRelayPromptValidator);
  const ownerChecklistValidator = readJson(PATHS.ownerChecklistValidator);
  const decisionMatrixValidator = readJson(PATHS.decisionMatrixValidator);

  assertRequiredInputs(refresh);
  assertRefreshCurrent(refresh, custodyValidator, completionAudit, completionAuditValidator, currentBlockerPacketValidator, directRelayPromptValidator, ownerChecklistValidator, decisionMatrixValidator);
  assertMarkdown(refresh, completionAuditValidator);

  const result = {
    ok: true,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    validated_refresh_result: PATHS.refreshResult,
    validated_refresh_result_md: PATHS.refreshResultMd,
    refresh_completed_at: refresh.completed_at,
    direct_untracked_sources: refresh.direct_untracked_sources,
    audit_untracked_sources: refresh.audit_untracked_sources,
    modified_tracked_source_files: custodyValidator.live_modified_tracked_sources,
    source_rows: custodyValidator.source_fingerprints.source_rows,
    fingerprinted_source_rows: custodyValidator.source_fingerprints.fingerprinted_source_rows,
    blocked_direct_artifact_paths: refresh.blocklist_summary.blocked_direct_artifact_paths,
    blocked_content_reference_paths: refresh.blocklist_summary.blocked_content_reference_paths,
    agent6_ready_review_items: refresh.agent6_ready_docket_validator_summary.review_items,
    relay_status: refresh.agent5_agent6_relay_validator_summary.status,
    disposition_watch_status: refresh.agent6_disposition_watch_validator_summary.status,
    agent6_disposition_hits: refresh.agent6_disposition_watch_validator_summary.agent6_disposition_hits,
    relay_signal_hits: refresh.agent6_disposition_watch_validator_summary.relay_signal_hits,
    current_blocker_packet_status: refresh.current_blocker_packet_summary.status,
    current_blocker_exact_blocker_count: refresh.current_blocker_packet_validator_summary.exact_blocker_count,
    direct_relay_prompt_status: refresh.agent5_agent8_direct_relay_prompt_validator_summary.status,
    direct_relay_prompt_request_id_count: refresh.agent5_agent8_direct_relay_prompt_validator_summary.request_id_count,
    direct_relay_prompt_patch_operations: refresh.agent5_agent8_direct_relay_prompt_validator_summary.queue_insertion_patch_operations,
    source_file_reconciliation_owner_checklist_ok: refresh.source_file_reconciliation_owner_checklist_validator_summary.ok,
    source_file_reconciliation_owner_checklist_action_performed: refresh.source_file_reconciliation_owner_checklist_validator_summary.action_performed,
    source_file_reconciliation_owner_checklist_queue_mutation_performed: refresh.source_file_reconciliation_owner_checklist_validator_summary.queue_mutation_performed,
    source_custody_agent6_decision_matrix_ok: refresh.source_custody_agent6_decision_matrix_validator_summary.ok,
    source_custody_agent6_decision_matrix_request_ids: refresh.source_custody_agent6_decision_matrix_validator_summary.request_id_count,
    source_custody_agent6_decision_matrix_tracking_rows: refresh.source_custody_agent6_decision_matrix_validator_summary.tracking_rows,
    source_custody_agent6_decision_matrix_license_rows: refresh.source_custody_agent6_decision_matrix_validator_summary.license_rows,
    source_custody_agent6_decision_matrix_action_performed: refresh.source_custody_agent6_decision_matrix_validator_summary.action_performed,
    source_custody_agent6_decision_matrix_queue_mutation_performed: refresh.source_custody_agent6_decision_matrix_validator_summary.queue_mutation_performed,
    completion_audit_status: completionAuditValidator.overall_status,
    current_blocking_conditions: completionAuditValidator.current_blocking_conditions,
    boundary: {
      publication_state: 'blocked_no_render',
      completion_claimed: false,
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
    }
  };

  writeJson(PATHS.outputJson, result);
  writeText(PATHS.outputMd, renderMarkdown(result));
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
  writeJson(PATHS.outputJson, result);
  writeText(PATHS.outputMd, renderMarkdown(result));
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
