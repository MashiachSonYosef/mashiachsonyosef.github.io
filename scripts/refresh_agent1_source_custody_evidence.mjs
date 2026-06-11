#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const repoRoot = process.cwd();

const directListPath = 'reports/untracked-source-files-direct.txt';
const auditJsonPath = 'reports/untracked-source-scope-audit.json';
const auditMdPath = 'reports/untracked-source-scope-audit.md';
const validatorResultPath = 'reports/agent1-source-provenance-custody-validator-result.json';
const refreshResultJsonPath = 'reports/agent1-source-custody-refresh-result.json';
const refreshResultMdPath = 'reports/agent1-source-custody-refresh-result.md';

function runNode(args, options = {}) {
  return execFileSync('node', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 200,
    ...options,
  });
}

function runGit(args) {
  return execFileSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 100,
  });
}

function writeText(relativePath, text) {
  const fullPath = path.join(repoRoot, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  for (let attempt = 1; attempt <= 10; attempt += 1) {
    try {
      fs.writeFileSync(fullPath, text, 'utf8');
      return;
    } catch (error) {
      if (attempt === 10 || !['UNKNOWN', 'EBUSY', 'EPERM', 'EACCES'].includes(error.code)) {
        throw error;
      }
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250 * attempt);
    }
  }
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function sorted(values) {
  return [...values].sort((a, b) => a.localeCompare(b));
}

function splitLines(text) {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function assertSameSet(name, actual, expected) {
  const left = sorted(actual);
  const right = sorted(expected);
  const same = left.length === right.length && left.every((value, index) => value === right[index]);
  if (!same) {
    const expectedSet = new Set(right);
    const actualSet = new Set(left);
    throw new Error(`${name} mismatch: missing=${right.filter((value) => !actualSet.has(value)).join(', ')} stale=${left.filter((value) => !expectedSet.has(value)).join(', ')}`);
  }
}

function renderRefreshResultMarkdown(result) {
  const lines = [];
  lines.push(
    '# Agent 1 Source Custody Refresh Result',
    '',
    `Started: ${result.started_at}`,
    `Completed: ${result.completed_at}`,
    '',
    '## Boundary',
    '',
    `- Publication state: ${result.boundary?.publication_state || '(unknown)'}`,
    '- Source/provenance acceptance: not claimed.',
    '- Publication readiness: not claimed.',
    '- Route/runtime/page/render/Definition/product-gate/translation acceptance: not claimed.',
    '',
    '## Result',
    '',
    `- OK: ${result.ok ? 'true' : 'false'}`,
  );
  if (result.error) {
    lines.push(`- Error: ${result.error}`);
  }
  lines.push(
    `- Direct untracked sources: ${result.direct_untracked_sources ?? '(not reached)'}`,
    `- Audit untracked sources: ${result.audit_untracked_sources ?? '(not reached)'}`,
    `- Source rows fingerprinted: ${result.validator_summary?.source_fingerprints?.fingerprinted_source_rows ?? '(not reached)'}/${result.validator_summary?.source_fingerprints?.source_rows ?? '(not reached)'}`,
    `- Missing lexical manifests: ${result.validator_summary?.exception_summary?.untracked_missing_lexical_manifest?.count ?? '(not reached)'}`,
    `- Blocked source rows: ${result.blocklist_summary?.blocked_source_rows ?? '(not reached)'}`,
    `- Blocked direct artifact paths: ${result.blocklist_summary?.blocked_direct_artifact_paths ?? '(not reached)'}`,
    `- Blocked content-reference paths: ${result.blocklist_summary?.blocked_content_reference_paths ?? '(not reached)'}`,
    `- Missing required artifacts: ${result.blocklist_summary?.missing_required_artifacts ?? '(not reached)'}`,
    `- Reference diagnostics blocking content-reference rows: ${result.reference_diagnostics_summary?.summary?.blocking_content_reference_rows ?? '(not reached)'}`,
    `- Reference diagnostics report/audit rows: ${result.reference_diagnostics_summary?.summary?.report_or_audit_reference_rows ?? '(not reached)'}`,
    `- Untracked track candidates with lexical manifests: ${result.closure_options_summary?.summary?.untracked_track_candidates_with_lexical_manifest ?? '(not reached)'}`,
    `- Untracked sources requiring missing lexical manifest remediation/exclusion: ${result.closure_options_summary?.summary?.untracked_requires_missing_lexical_manifest_remediation ?? '(not reached)'}`,
    `- Modified tracked license-label normalization review rows: ${result.closure_options_summary?.summary?.modified_tracked_license_label_only_rows ?? '(not reached)'}`,
    `- Reconciliation preflight source-only track candidates: ${result.reconciliation_preflight_summary?.summary?.track_candidate_source_files ?? '(not reached)'}`,
    `- Reconciliation preflight missing manifest expected paths: ${result.reconciliation_preflight_summary?.summary?.missing_manifest_expected_paths ?? '(not reached)'}`,
    `- Reconciliation preflight modified tracked source files: ${result.reconciliation_preflight_summary?.summary?.modified_tracked_source_files ?? '(not reached)'}`,
    `- Agent 6 decision packet track-candidate source files: ${result.agent6_decision_packet_summary?.summary?.track_candidate_source_files ?? '(not reached)'}`,
    `- Agent 6 decision packet blocked downstream direct paths: ${result.agent6_decision_packet_summary?.summary?.blocked_downstream_direct_paths ?? '(not reached)'}`,
    `- Agent 6 decision packet blocked downstream content-reference paths: ${result.agent6_decision_packet_summary?.summary?.blocked_downstream_content_reference_paths ?? '(not reached)'}`,
    `- Queue refresh notice stale control surfaces: ${result.queue_refresh_notice_summary?.stale_surface_count ?? '(not reached)'}`,
    `- Control sync packet stale control surfaces: ${result.control_sync_packet_summary?.stale_control_surface_count ?? '(not reached)'}`,
    `- Queue intake candidate stale queue markers: ${(result.queue_intake_candidate_summary?.existing_queue_stale_markers || []).join(', ') || '(not reached)'}`,
    `- Manifest remediation queue candidate: ${result.manifest_remediation_queue_validator_summary?.request_id ?? '(not reached)'}`,
    `- Tracking action queue candidate: ${result.tracking_action_queue_validator_summary?.request_id ?? '(not reached)'}`,
    `- License normalization queue candidate: ${result.license_normalization_queue_validator_summary?.request_id ?? '(not reached)'}`,
    `- Source file reconciliation action plan validator OK: ${result.source_file_reconciliation_action_plan_validator_summary?.ok ?? '(not reached)'}`,
    `- Source file reconciliation action performed: ${result.source_file_reconciliation_action_plan_validator_summary?.action_performed ?? '(not reached)'}`,
    `- Source file reconciliation owner checklist validator OK: ${result.source_file_reconciliation_owner_checklist_validator_summary?.ok ?? '(not reached)'}`,
    `- Source file reconciliation owner checklist action performed: ${result.source_file_reconciliation_owner_checklist_validator_summary?.action_performed ?? '(not reached)'}`,
    `- Source file reconciliation owner checklist queue mutation performed: ${result.source_file_reconciliation_owner_checklist_validator_summary?.queue_mutation_performed ?? '(not reached)'}`,
    `- Agent 6 decision matrix validator OK: ${result.source_custody_agent6_decision_matrix_validator_summary?.ok ?? '(not reached)'}`,
    `- Agent 6 decision matrix request IDs: ${result.source_custody_agent6_decision_matrix_validator_summary?.request_id_count ?? '(not reached)'}`,
    `- Agent 6 decision matrix action performed: ${result.source_custody_agent6_decision_matrix_validator_summary?.action_performed ?? '(not reached)'}`,
    `- Agent 6 decision matrix queue mutation performed: ${result.source_custody_agent6_decision_matrix_validator_summary?.queue_mutation_performed ?? '(not reached)'}`,
    `- Orot Stage C source-unblock plan validator OK: ${result.orot_stage_c_source_unblock_plan_validator_summary?.ok ?? '(not reached)'}`,
    `- Orot Stage C source-unblock plan status: ${result.orot_stage_c_source_unblock_plan_validator_summary?.status ?? '(not reached)'}`,
    `- Orot fill source-row queue candidate: ${result.orot_fill_source_row_queue_validator_summary?.request_id ?? '(not reached)'}`,
    `- Public-HUD source-row queue candidate: ${result.public_hud_source_row_queue_validator_summary?.request_id ?? '(not reached)'}`,
    `- Agent 6-ready docket review items: ${(result.agent6_ready_docket_validator_summary?.review_items || []).join(', ') || '(not reached)'}`,
    `- Agent 5/6 relay packet status: ${result.agent5_agent6_relay_validator_summary?.status ?? '(not reached)'}`,
    `- Agent 6 intake-contract validator OK: ${result.agent6_intake_contract_validator_summary?.ok ?? '(not reached)'}`,
    `- Agent 6 intake-contract blocking findings: ${result.agent6_intake_contract_validator_summary?.blocking_findings ?? '(not reached)'}`,
    `- Agent 5/8 relay-readiness checkpoint validator OK: ${result.agent5_agent8_relay_readiness_validator_summary?.ok ?? '(not reached)'}`,
    `- Agent 5/8 relay-readiness checkpoint blocker: ${result.agent5_agent8_relay_readiness_validator_summary?.blocker ?? '(not reached)'}`,
    `- Agent 6 disposition watch validator OK: ${result.agent6_disposition_watch_validator_summary?.ok ?? '(not reached)'}`,
    `- Agent 6 disposition watch status: ${result.agent6_disposition_watch_validator_summary?.status ?? '(not reached)'}`,
    `- Current blocker packet validator OK: ${result.current_blocker_packet_validator_summary?.ok ?? '(not reached)'}`,
    `- Current blocker packet exact blockers: ${result.current_blocker_packet_validator_summary?.exact_blocker_count ?? '(not reached)'}`,
    `- Objective completion audit status: ${result.completion_audit_summary?.overall_status ?? '(not reached)'}`,
    `- Objective completion audit validator OK: ${result.completion_audit_validator_summary?.ok ?? '(not reached)'}`,
    `- Objective completion claimed: ${result.completion_audit_validator_summary?.boundary?.completion_claimed ?? '(not reached)'}`,
    `- Refresh result validator OK: ${result.refresh_result_validator_summary?.ok ?? '(not reached)'}`,
    `- Agent 6 queue dry-run validator OK: ${result.agent6_queue_dry_run_validator_summary?.ok ?? '(not reached)'}`,
    `- Agent 6 queue dry-run item count: ${result.agent6_queue_dry_run_validator_summary?.dry_run_queue_item_count ?? '(not reached)'}`,
    `- Agent 6 queue dry-run live queue mutation performed: ${result.agent6_queue_dry_run_validator_summary?.boundary?.live_queue_mutation_performed ?? '(not reached)'}`,
    `- Agent 5/6 control-surface delta validator OK: ${result.agent5_agent6_control_surface_delta_validator_summary?.ok ?? '(not reached)'}`,
    `- Agent 5/6 control-surface delta status: ${result.agent5_agent6_control_surface_delta_validator_summary?.status ?? '(not reached)'}`,
    `- Agent 5/6 control-surface delta current request IDs missing everywhere: ${(result.agent5_agent6_control_surface_delta_validator_summary?.current_request_ids_missing_everywhere || []).length || '(not reached)'}`,
    `- Agent 5/6 control-surface delta historical Agent 1 queue items present: ${result.agent5_agent6_control_surface_delta_validator_summary?.historical_queue_items_present ?? '(not reached)'}`,
    `- Agent 5/6 queue insertion patch validator OK: ${result.agent5_agent6_queue_insertion_patch_validator_summary?.ok ?? '(not reached)'}`,
    `- Agent 5/6 queue insertion patch operations: ${result.agent5_agent6_queue_insertion_patch_validator_summary?.operation_count ?? '(not reached)'}`,
    `- Agent 5/6 queue insertion patch live queue mutation performed: ${result.agent5_agent6_queue_insertion_patch_validator_summary?.boundary?.live_queue_mutation_performed ?? '(not reached)'}`,
    `- Agent 5/8 direct relay prompt validator OK: ${result.agent5_agent8_direct_relay_prompt_validator_summary?.ok ?? '(not reached)'}`,
    `- Agent 5/8 direct relay prompt status: ${result.agent5_agent8_direct_relay_prompt_validator_summary?.status ?? '(not reached)'}`,
    `- Agent 5/8 direct relay prompt request IDs: ${result.agent5_agent8_direct_relay_prompt_validator_summary?.request_id_count ?? '(not reached)'}`,
    `- Agent 5/8 direct relay prompt patch operations: ${result.agent5_agent8_direct_relay_prompt_validator_summary?.queue_insertion_patch_operations ?? '(not reached)'}`,
    '',
    '## Commands',
    '',
  );
  for (const command of result.commands_run || []) {
    lines.push(`- \`${command}\``);
  }
  lines.push(
    '',
    '## Artifacts Refreshed',
    '',
  );
  for (const artifactPath of result.artifacts_refreshed || []) {
    lines.push(`- \`${artifactPath}\``);
  }
  lines.push('');
  return lines.join('\n');
}

function writeRefreshResult(result) {
  writeText(refreshResultJsonPath, `${JSON.stringify(result, null, 2)}\n`);
  writeText(refreshResultMdPath, renderRefreshResultMarkdown(result));
}

function main() {
  const startedAt = new Date().toISOString();
  const commandsRun = [
    'git ls-files --others --exclude-standard -- data/sources/*.json',
    `node scripts/audit_untracked_source_scope.mjs --untracked-list ${directListPath} --json ${auditJsonPath} --report ${auditMdPath}`,
    'node scripts/build_agent1_source_custody_packet.mjs',
    'node scripts/build_agent1_source_custody_reference_diagnostics.mjs',
    'node scripts/build_agent1_source_custody_closure_options.mjs',
    'node scripts/build_agent1_source_custody_reconciliation_preflight.mjs',
    'node scripts/build_agent1_agent6_source_custody_decision_packet.mjs',
    'node scripts/build_agent1_source_custody_queue_refresh_notice.mjs',
    'node scripts/build_agent1_source_custody_control_sync_packet.mjs',
    'node scripts/build_agent1_source_custody_queue_intake_candidate.mjs',
    'node scripts/validate_agent1_source_custody_packet.mjs',
    'node scripts/build_agent1_source_custody_manifest_remediation_packet.mjs',
    'node scripts/validate_agent1_source_custody_manifest_remediation_packet.mjs',
    'node scripts/build_agent1_source_custody_manifest_remediation_queue_candidate.mjs',
    'node scripts/validate_agent1_source_custody_manifest_remediation_queue_candidate.mjs',
    'node scripts/build_agent1_source_custody_tracking_action_packet.mjs',
    'node scripts/validate_agent1_source_custody_tracking_action_packet.mjs',
    'node scripts/build_agent1_source_custody_tracking_action_queue_candidate.mjs',
    'node scripts/validate_agent1_source_custody_tracking_action_queue_candidate.mjs',
    'node scripts/build_agent1_source_custody_license_normalization_action_packet.mjs',
    'node scripts/validate_agent1_source_custody_license_normalization_action_packet.mjs',
    'node scripts/build_agent1_source_custody_license_normalization_queue_candidate.mjs',
    'node scripts/validate_agent1_source_custody_license_normalization_queue_candidate.mjs',
    'node scripts/build_agent1_source_file_reconciliation_action_plan.mjs',
    'node scripts/validate_agent1_source_file_reconciliation_action_plan.mjs',
    'node scripts/build_agent1_wartime_public_hud_source_row_evidence.mjs',
    'node scripts/validate_agent1_wartime_public_hud_source_row_evidence.mjs',
    'node scripts/build_agent1_orot_fill_source_row_evidence.mjs',
    'node scripts/validate_agent1_orot_fill_source_row_evidence.mjs',
    'node scripts/build_agent1_orot_stage_c_source_unblock_plan.mjs',
    'node scripts/validate_agent1_orot_stage_c_source_unblock_plan.mjs',
    'node scripts/build_agent1_orot_fill_source_row_queue_candidate.mjs',
    'node scripts/validate_agent1_orot_fill_source_row_queue_candidate.mjs',
    'node scripts/build_agent1_wartime_public_hud_source_row_queue_candidate.mjs',
    'node scripts/validate_agent1_wartime_public_hud_source_row_queue_candidate.mjs',
    'node scripts/build_agent1_source_provenance_agent6_ready_docket.mjs',
    'node scripts/validate_agent1_source_provenance_agent6_ready_docket.mjs',
    'node scripts/build_agent1_agent5_agent6_docket_relay_packet.mjs',
    'node scripts/validate_agent1_agent5_agent6_docket_relay_packet.mjs',
    'node scripts/validate_agent1_agent6_queue_intake_contract_for_relay_packet.mjs',
    'node scripts/build_agent1_agent6_queue_dry_run_with_relay_items.mjs',
    'node scripts/validate_agent1_agent6_queue_dry_run_with_relay_items.mjs',
    'node scripts/build_agent1_agent5_agent8_relay_readiness_checkpoint.mjs',
    'node scripts/validate_agent1_agent5_agent8_relay_readiness_checkpoint.mjs',
    'node scripts/build_agent1_agent5_agent6_control_surface_delta_packet.mjs',
    'node scripts/validate_agent1_agent5_agent6_control_surface_delta_packet.mjs',
    'node scripts/build_agent1_agent5_agent6_queue_insertion_patch_packet.mjs',
    'node scripts/validate_agent1_agent5_agent6_queue_insertion_patch_packet.mjs',
    'node scripts/build_agent1_agent6_disposition_watch.mjs',
    'node scripts/validate_agent1_agent6_disposition_watch.mjs',
    'node scripts/build_agent1_agent5_agent8_direct_relay_prompt.mjs',
    'node scripts/validate_agent1_agent5_agent8_direct_relay_prompt.mjs',
    'node scripts/build_agent1_source_custody_completion_audit.mjs',
    'node scripts/validate_agent1_source_custody_completion_audit.mjs',
    'node scripts/build_agent1_source_custody_current_blocker_packet.mjs',
    'node scripts/validate_agent1_source_custody_current_blocker_packet.mjs',
    'node scripts/build_agent1_source_file_reconciliation_owner_checklist.mjs',
    'node scripts/validate_agent1_source_file_reconciliation_owner_checklist.mjs',
    'node scripts/build_agent1_source_custody_agent6_decision_matrix.mjs',
    'node scripts/validate_agent1_source_custody_agent6_decision_matrix.mjs',
    'node scripts/validate_agent1_source_custody_refresh_result.mjs',
  ];
  const directList = runGit(['ls-files', '--others', '--exclude-standard', '--', 'data/sources/*.json']);
  writeText(directListPath, directList);

  runNode([
    'scripts/audit_untracked_source_scope.mjs',
    '--untracked-list',
    directListPath,
    '--json',
    auditJsonPath,
    '--report',
    auditMdPath,
  ]);

  const buildOutput = runNode(['scripts/build_agent1_source_custody_packet.mjs']);
  const referenceDiagnosticsOutput = runNode(['scripts/build_agent1_source_custody_reference_diagnostics.mjs']);
  const closureOutput = runNode(['scripts/build_agent1_source_custody_closure_options.mjs']);
  const reconciliationPreflightOutput = runNode(['scripts/build_agent1_source_custody_reconciliation_preflight.mjs']);
  const decisionPacketOutput = runNode(['scripts/build_agent1_agent6_source_custody_decision_packet.mjs']);
  const queueRefreshNoticeOutput = runNode(['scripts/build_agent1_source_custody_queue_refresh_notice.mjs']);
  const controlSyncPacketOutput = runNode(['scripts/build_agent1_source_custody_control_sync_packet.mjs']);
  const queueIntakeCandidateOutput = runNode(['scripts/build_agent1_source_custody_queue_intake_candidate.mjs']);
  const validatorOutput = runNode(['scripts/validate_agent1_source_custody_packet.mjs']);
  writeText(validatorResultPath, validatorOutput);
  const manifestRemediationPacketOutput = runNode(['scripts/build_agent1_source_custody_manifest_remediation_packet.mjs']);
  const manifestRemediationValidatorOutput = runNode(['scripts/validate_agent1_source_custody_manifest_remediation_packet.mjs']);
  const manifestRemediationQueueOutput = runNode(['scripts/build_agent1_source_custody_manifest_remediation_queue_candidate.mjs']);
  const manifestRemediationQueueValidatorOutput = runNode(['scripts/validate_agent1_source_custody_manifest_remediation_queue_candidate.mjs']);
  const trackingActionPacketOutput = runNode(['scripts/build_agent1_source_custody_tracking_action_packet.mjs']);
  const trackingActionValidatorOutput = runNode(['scripts/validate_agent1_source_custody_tracking_action_packet.mjs']);
  const trackingActionQueueOutput = runNode(['scripts/build_agent1_source_custody_tracking_action_queue_candidate.mjs']);
  const trackingActionQueueValidatorOutput = runNode(['scripts/validate_agent1_source_custody_tracking_action_queue_candidate.mjs']);
  const licenseNormalizationPacketOutput = runNode(['scripts/build_agent1_source_custody_license_normalization_action_packet.mjs']);
  const licenseNormalizationValidatorOutput = runNode(['scripts/validate_agent1_source_custody_license_normalization_action_packet.mjs']);
  const licenseNormalizationQueueOutput = runNode(['scripts/build_agent1_source_custody_license_normalization_queue_candidate.mjs']);
  const licenseNormalizationQueueValidatorOutput = runNode(['scripts/validate_agent1_source_custody_license_normalization_queue_candidate.mjs']);
  const sourceFileReconciliationActionPlanOutput = runNode(['scripts/build_agent1_source_file_reconciliation_action_plan.mjs']);
  const sourceFileReconciliationActionPlanValidatorOutput = runNode(['scripts/validate_agent1_source_file_reconciliation_action_plan.mjs']);
  const publicHudSourceRowEvidenceOutput = runNode(['scripts/build_agent1_wartime_public_hud_source_row_evidence.mjs']);
  const publicHudSourceRowValidatorOutput = runNode(['scripts/validate_agent1_wartime_public_hud_source_row_evidence.mjs']);
  const orotFillSourceRowEvidenceOutput = runNode(['scripts/build_agent1_orot_fill_source_row_evidence.mjs']);
  const orotFillSourceRowValidatorOutput = runNode(['scripts/validate_agent1_orot_fill_source_row_evidence.mjs']);
  const orotStageCSourceUnblockPlanOutput = runNode(['scripts/build_agent1_orot_stage_c_source_unblock_plan.mjs']);
  const orotStageCSourceUnblockPlanValidatorOutput = runNode(['scripts/validate_agent1_orot_stage_c_source_unblock_plan.mjs']);
  const orotFillSourceRowQueueOutput = runNode(['scripts/build_agent1_orot_fill_source_row_queue_candidate.mjs']);
  const orotFillSourceRowQueueValidatorOutput = runNode(['scripts/validate_agent1_orot_fill_source_row_queue_candidate.mjs']);
  const publicHudSourceRowQueueOutput = runNode(['scripts/build_agent1_wartime_public_hud_source_row_queue_candidate.mjs']);
  const publicHudSourceRowQueueValidatorOutput = runNode(['scripts/validate_agent1_wartime_public_hud_source_row_queue_candidate.mjs']);
  const agent6ReadyDocketOutput = runNode(['scripts/build_agent1_source_provenance_agent6_ready_docket.mjs']);
  const agent6ReadyDocketValidatorOutput = runNode(['scripts/validate_agent1_source_provenance_agent6_ready_docket.mjs']);
  const agent5Agent6RelayOutput = runNode(['scripts/build_agent1_agent5_agent6_docket_relay_packet.mjs']);
  const agent5Agent6RelayValidatorOutput = runNode(['scripts/validate_agent1_agent5_agent6_docket_relay_packet.mjs']);
  const agent6IntakeContractValidatorOutput = runNode(['scripts/validate_agent1_agent6_queue_intake_contract_for_relay_packet.mjs']);
  const agent6QueueDryRunOutput = runNode(['scripts/build_agent1_agent6_queue_dry_run_with_relay_items.mjs']);
  const agent6QueueDryRunValidatorOutput = runNode(['scripts/validate_agent1_agent6_queue_dry_run_with_relay_items.mjs']);
  const directFiles = splitLines(fs.readFileSync(path.join(repoRoot, directListPath), 'utf8'));
  const audit = readJson(auditJsonPath);
  const validator = JSON.parse(validatorOutput);
  const blocklist = readJson('reports/agent1-custody-blocklist.json');

  assertSameSet('direct list vs audit JSON', directFiles, audit.untracked_source_files || []);

  if (!validator.ok) {
    throw new Error('custody validator returned ok=false');
  }
  if (validator.boundary?.publication_state !== 'blocked_no_render') {
    throw new Error(`unexpected publication state: ${validator.boundary?.publication_state}`);
  }
  if (blocklist.boundary?.publication_state !== 'blocked_no_render') {
    throw new Error(`unexpected blocklist publication state: ${blocklist.boundary?.publication_state}`);
  }
  writeRefreshResult({
    ok: true,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    direct_untracked_sources: directFiles.length,
    audit_untracked_sources: audit.untracked_source_files?.length ?? 0,
    validator_summary: validator,
    blocklist_summary: blocklist.summary,
    commands_run: commandsRun,
    artifacts_refreshed: [],
    note: 'intermediate refresh snapshot for relay-readiness builders; final refresh result overwrites this artifact after all summaries are rebuilt',
    boundary: {
      agent1_status: 'evidence-ready / awaiting-Agent-6',
      publication_state: 'blocked_no_render',
      source_provenance_acceptance_claimed: false,
      public_runtime_acceptance_claimed: false,
      route_publication_support_claimed: false,
      definition_authority_claimed: false,
      page_render_acceptance_claimed: false
    }
  });
  const agent5Agent8RelayReadinessOutput = runNode(['scripts/build_agent1_agent5_agent8_relay_readiness_checkpoint.mjs']);
  const agent5Agent8RelayReadinessValidatorOutput = runNode(['scripts/validate_agent1_agent5_agent8_relay_readiness_checkpoint.mjs']);
  const agent5Agent6ControlSurfaceDeltaOutput = runNode(['scripts/build_agent1_agent5_agent6_control_surface_delta_packet.mjs']);
  const agent5Agent6ControlSurfaceDeltaValidatorOutput = runNode(['scripts/validate_agent1_agent5_agent6_control_surface_delta_packet.mjs']);
  const agent5Agent6QueueInsertionPatchOutput = runNode(['scripts/build_agent1_agent5_agent6_queue_insertion_patch_packet.mjs']);
  const agent5Agent6QueueInsertionPatchValidatorOutput = runNode(['scripts/validate_agent1_agent5_agent6_queue_insertion_patch_packet.mjs']);
  const agent6DispositionWatchOutput = runNode(['scripts/build_agent1_agent6_disposition_watch.mjs']);
  const agent6DispositionWatchValidatorOutput = runNode(['scripts/validate_agent1_agent6_disposition_watch.mjs']);

  const result = {
    ok: true,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    commands_run: commandsRun,
    artifacts_refreshed: [
      directListPath,
      auditJsonPath,
      auditMdPath,
      'reports/agent1-source-provenance-custody-packet.json',
      'reports/agent1-source-provenance-custody-packet.md',
      'reports/agent1-downstream-quarantine-manifest.json',
      'reports/agent1-downstream-quarantine-manifest.md',
      'reports/agent1-custody-blocklist.json',
      'reports/agent1-custody-blocklist.md',
      'reports/agent1-agent6-custody-intake-docket.json',
      'reports/agent1-agent6-custody-intake-docket.md',
      'reports/agent1-source-custody-reference-diagnostics.json',
      'reports/agent1-source-custody-reference-diagnostics.md',
      'reports/agent1-source-custody-closure-options.json',
      'reports/agent1-source-custody-closure-options.md',
      'reports/agent1-source-custody-reconciliation-preflight.json',
      'reports/agent1-source-custody-reconciliation-preflight.md',
      'reports/agent1-agent6-source-custody-decision-packet.json',
      'reports/agent1-agent6-source-custody-decision-packet.md',
      'reports/agent1-source-custody-queue-refresh-notice.json',
      'reports/agent1-source-custody-queue-refresh-notice.md',
      'reports/agent1-source-custody-control-sync-packet.json',
      'reports/agent1-source-custody-control-sync-packet.md',
      'reports/agent1-source-custody-queue-intake-candidate.json',
      'reports/agent1-source-custody-queue-intake-candidate.md',
      'reports/agent1-source-custody-manifest-remediation-packet.json',
      'reports/agent1-source-custody-manifest-remediation-packet.md',
      'reports/agent1-source-custody-manifest-remediation-validator-result.json',
      'reports/agent1-source-custody-manifest-remediation-queue-candidate.json',
      'reports/agent1-source-custody-manifest-remediation-queue-candidate.md',
      'reports/agent1-source-custody-manifest-remediation-queue-validator-result.json',
      'reports/agent1-source-custody-tracking-action-packet.json',
      'reports/agent1-source-custody-tracking-action-packet.md',
      'reports/agent1-source-custody-tracking-action-validator-result.json',
      'reports/agent1-source-custody-tracking-action-queue-candidate.json',
      'reports/agent1-source-custody-tracking-action-queue-candidate.md',
      'reports/agent1-source-custody-tracking-action-queue-validator-result.json',
      'reports/agent1-source-custody-license-normalization-action-packet.json',
      'reports/agent1-source-custody-license-normalization-action-packet.md',
      'reports/agent1-source-custody-license-normalization-action-validator-result.json',
      'reports/agent1-source-custody-license-normalization-queue-candidate.json',
      'reports/agent1-source-custody-license-normalization-queue-candidate.md',
      'reports/agent1-source-custody-license-normalization-queue-validator-result.json',
      'reports/agent1-source-file-reconciliation-action-plan-2026-06-03.json',
      'reports/agent1-source-file-reconciliation-action-plan-2026-06-03.md',
      'reports/agent1-source-file-reconciliation-action-plan-validator-result-2026-06-03.json',
      'reports/agent1-source-file-reconciliation-action-plan-validator-result-2026-06-03.md',
      'reports/agent1-source-file-reconciliation-owner-checklist-2026-06-03.json',
      'reports/agent1-source-file-reconciliation-owner-checklist-2026-06-03.md',
      'reports/agent1-source-file-reconciliation-owner-checklist-validator-result-2026-06-03.json',
      'reports/agent1-source-file-reconciliation-owner-checklist-validator-result-2026-06-03.md',
      'reports/agent1-source-custody-agent6-decision-matrix-2026-06-03.json',
      'reports/agent1-source-custody-agent6-decision-matrix-2026-06-03.md',
      'reports/agent1-source-custody-agent6-decision-matrix-validator-result-2026-06-03.json',
      'reports/agent1-source-custody-agent6-decision-matrix-validator-result-2026-06-03.md',
      'reports/agent1-wartime-public-hud-source-row-evidence-2026-06-03.json',
      'reports/agent1-wartime-public-hud-source-row-evidence-2026-06-03.md',
      'reports/agent1-wartime-public-hud-source-row-evidence-validator-result-2026-06-03.json',
      'reports/agent1-orot-fill-source-row-evidence-2026-06-03.json',
      'reports/agent1-orot-fill-source-row-evidence-2026-06-03.md',
      'reports/agent1-orot-fill-source-row-evidence-validator-result-2026-06-03.json',
      'reports/agent1-orot-stage-c-source-unblock-plan-2026-06-03.json',
      'reports/agent1-orot-stage-c-source-unblock-plan-2026-06-03.md',
      'reports/agent1-orot-stage-c-source-unblock-plan-validator-result-2026-06-03.json',
      'reports/agent1-orot-stage-c-source-unblock-plan-validator-result-2026-06-03.md',
      'reports/agent1-orot-fill-source-row-queue-candidate-2026-06-03.json',
      'reports/agent1-orot-fill-source-row-queue-candidate-2026-06-03.md',
      'reports/agent1-orot-fill-source-row-queue-validator-result-2026-06-03.json',
      'reports/agent1-wartime-public-hud-source-row-queue-candidate-2026-06-03.json',
      'reports/agent1-wartime-public-hud-source-row-queue-candidate-2026-06-03.md',
      'reports/agent1-wartime-public-hud-source-row-queue-validator-result-2026-06-03.json',
      'reports/agent1-source-provenance-agent6-ready-docket-2026-06-03.json',
      'reports/agent1-source-provenance-agent6-ready-docket-2026-06-03.md',
      'reports/agent1-source-provenance-agent6-ready-docket-validator-result-2026-06-03.json',
      'reports/agent1-agent5-agent6-docket-relay-packet-2026-06-03.json',
      'reports/agent1-agent5-agent6-docket-relay-packet-2026-06-03.md',
      'reports/agent1-agent5-agent6-docket-relay-validator-result-2026-06-03.json',
      'reports/agent1-agent6-queue-intake-contract-validator-result-2026-06-03.json',
      'reports/agent1-agent6-queue-intake-contract-validator-result-2026-06-03.md',
      'reports/agent1-agent5-agent8-relay-readiness-checkpoint-2026-06-03.json',
      'reports/agent1-agent5-agent8-relay-readiness-checkpoint-2026-06-03.md',
      'reports/agent1-agent5-agent8-relay-readiness-checkpoint-validator-result-2026-06-03.json',
      'reports/agent1-agent5-agent6-control-surface-delta-packet-2026-06-03.json',
      'reports/agent1-agent5-agent6-control-surface-delta-packet-2026-06-03.md',
      'reports/agent1-agent5-agent6-control-surface-delta-validator-result-2026-06-03.json',
      'reports/agent1-agent5-agent6-queue-insertion-patch-packet-2026-06-03.json',
      'reports/agent1-agent5-agent6-queue-insertion-patch-packet-2026-06-03.md',
      'reports/agent1-agent5-agent6-queue-insertion-patch-validator-result-2026-06-03.json',
      'reports/agent1-agent5-agent6-queue-insertion-patch-validator-result-2026-06-03.md',
      'reports/agent1-agent6-disposition-watch-2026-06-03.json',
      'reports/agent1-agent6-disposition-watch-2026-06-03.md',
      'reports/agent1-agent6-disposition-watch-validator-result-2026-06-03.json',
      'reports/agent1-source-custody-current-blocker-packet-2026-06-03.json',
      'reports/agent1-source-custody-current-blocker-packet-2026-06-03.md',
      'reports/agent1-source-custody-current-blocker-packet-validator-result-2026-06-03.json',
      'reports/agent1-source-custody-current-blocker-packet-validator-result-2026-06-03.md',
      'reports/agent1-agent5-agent8-direct-relay-prompt-2026-06-03.json',
      'reports/agent1-agent5-agent8-direct-relay-prompt-2026-06-03.md',
      'reports/agent1-agent5-agent8-direct-relay-prompt-validator-result-2026-06-03.json',
      'reports/agent1-agent5-agent8-direct-relay-prompt-validator-result-2026-06-03.md',
      'reports/agent1-agent6-validation-queue-dry-run-with-relay-items-2026-06-03.json',
      'reports/agent1-agent6-validation-queue-dry-run-with-relay-items-2026-06-03.md',
      'reports/agent1-agent6-validation-queue-dry-run-health-2026-06-03.md',
      'reports/agent1-agent6-validation-queue-dry-run-validator-result-2026-06-03.json',
      'reports/agent1-agent6-validation-queue-dry-run-validator-result-2026-06-03.md',
      'reports/agent1-source-custody-objective-completion-audit-2026-06-03.json',
      'reports/agent1-source-custody-objective-completion-audit-2026-06-03.md',
      'reports/agent1-source-custody-objective-completion-audit-validator-result-2026-06-03.json',
      'reports/agent1-source-custody-objective-completion-audit-validator-result-2026-06-03.md',
      'reports/agent1-source-custody-refresh-result-validator-result-2026-06-03.json',
      'reports/agent1-source-custody-refresh-result-validator-result-2026-06-03.md',
      validatorResultPath,
      refreshResultJsonPath,
      refreshResultMdPath,
    ],
    direct_untracked_sources: directFiles.length,
    audit_untracked_sources: audit.untracked_source_file_count,
    license_counts: audit.untracked_source_license_counts,
    build_summary: JSON.parse(buildOutput),
    reference_diagnostics_summary: JSON.parse(referenceDiagnosticsOutput),
    closure_options_summary: JSON.parse(closureOutput),
    reconciliation_preflight_summary: JSON.parse(reconciliationPreflightOutput),
    agent6_decision_packet_summary: JSON.parse(decisionPacketOutput),
    queue_refresh_notice_summary: JSON.parse(queueRefreshNoticeOutput),
    control_sync_packet_summary: JSON.parse(controlSyncPacketOutput),
    queue_intake_candidate_summary: JSON.parse(queueIntakeCandidateOutput),
    manifest_remediation_packet_summary: JSON.parse(manifestRemediationPacketOutput),
    manifest_remediation_validator_summary: JSON.parse(manifestRemediationValidatorOutput),
    manifest_remediation_queue_summary: JSON.parse(manifestRemediationQueueOutput),
    manifest_remediation_queue_validator_summary: JSON.parse(manifestRemediationQueueValidatorOutput),
    tracking_action_packet_summary: JSON.parse(trackingActionPacketOutput),
    tracking_action_validator_summary: JSON.parse(trackingActionValidatorOutput),
    tracking_action_queue_summary: JSON.parse(trackingActionQueueOutput),
    tracking_action_queue_validator_summary: JSON.parse(trackingActionQueueValidatorOutput),
    license_normalization_packet_summary: JSON.parse(licenseNormalizationPacketOutput),
    license_normalization_validator_summary: JSON.parse(licenseNormalizationValidatorOutput),
    license_normalization_queue_summary: JSON.parse(licenseNormalizationQueueOutput),
    license_normalization_queue_validator_summary: JSON.parse(licenseNormalizationQueueValidatorOutput),
    source_file_reconciliation_action_plan_summary: JSON.parse(sourceFileReconciliationActionPlanOutput),
    source_file_reconciliation_action_plan_validator_summary: JSON.parse(sourceFileReconciliationActionPlanValidatorOutput),
    public_hud_source_row_evidence_summary: JSON.parse(publicHudSourceRowEvidenceOutput),
    public_hud_source_row_validator_summary: JSON.parse(publicHudSourceRowValidatorOutput),
    orot_fill_source_row_evidence_summary: JSON.parse(orotFillSourceRowEvidenceOutput),
    orot_fill_source_row_validator_summary: JSON.parse(orotFillSourceRowValidatorOutput),
    orot_stage_c_source_unblock_plan_summary: JSON.parse(orotStageCSourceUnblockPlanOutput),
    orot_stage_c_source_unblock_plan_validator_summary: JSON.parse(orotStageCSourceUnblockPlanValidatorOutput),
    orot_fill_source_row_queue_summary: JSON.parse(orotFillSourceRowQueueOutput),
    orot_fill_source_row_queue_validator_summary: JSON.parse(orotFillSourceRowQueueValidatorOutput),
    public_hud_source_row_queue_summary: JSON.parse(publicHudSourceRowQueueOutput),
    public_hud_source_row_queue_validator_summary: JSON.parse(publicHudSourceRowQueueValidatorOutput),
    agent6_ready_docket_summary: JSON.parse(agent6ReadyDocketOutput),
    agent6_ready_docket_validator_summary: JSON.parse(agent6ReadyDocketValidatorOutput),
    agent5_agent6_relay_summary: JSON.parse(agent5Agent6RelayOutput),
    agent5_agent6_relay_validator_summary: JSON.parse(agent5Agent6RelayValidatorOutput),
    agent6_intake_contract_validator_summary: JSON.parse(agent6IntakeContractValidatorOutput),
    agent5_agent8_relay_readiness_summary: JSON.parse(agent5Agent8RelayReadinessOutput),
    agent5_agent8_relay_readiness_validator_summary: JSON.parse(agent5Agent8RelayReadinessValidatorOutput),
    agent5_agent6_control_surface_delta_summary: JSON.parse(agent5Agent6ControlSurfaceDeltaOutput),
    agent5_agent6_control_surface_delta_validator_summary: JSON.parse(agent5Agent6ControlSurfaceDeltaValidatorOutput),
    agent5_agent6_queue_insertion_patch_summary: JSON.parse(agent5Agent6QueueInsertionPatchOutput),
    agent5_agent6_queue_insertion_patch_validator_summary: JSON.parse(agent5Agent6QueueInsertionPatchValidatorOutput),
    agent6_disposition_watch_summary: JSON.parse(agent6DispositionWatchOutput),
    agent6_disposition_watch_validator_summary: JSON.parse(agent6DispositionWatchValidatorOutput),
    agent6_queue_dry_run_summary: JSON.parse(agent6QueueDryRunOutput),
    agent6_queue_dry_run_validator_summary: JSON.parse(agent6QueueDryRunValidatorOutput),
    validator_summary: validator,
    blocklist_summary: blocklist.summary,
    boundary: validator.boundary,
  };
  writeRefreshResult(result);

  const currentAgent5Agent8RelayReadinessOutput = runNode(['scripts/build_agent1_agent5_agent8_relay_readiness_checkpoint.mjs']);
  const currentAgent5Agent8RelayReadinessValidatorOutput = runNode(['scripts/validate_agent1_agent5_agent8_relay_readiness_checkpoint.mjs']);
  const currentAgent6DispositionWatchOutput = runNode(['scripts/build_agent1_agent6_disposition_watch.mjs']);
  const currentAgent6DispositionWatchValidatorOutput = runNode(['scripts/validate_agent1_agent6_disposition_watch.mjs']);
  result.agent5_agent8_relay_readiness_summary = JSON.parse(currentAgent5Agent8RelayReadinessOutput);
  result.agent5_agent8_relay_readiness_validator_summary = JSON.parse(currentAgent5Agent8RelayReadinessValidatorOutput);
  result.agent6_disposition_watch_summary = JSON.parse(currentAgent6DispositionWatchOutput);
  result.agent6_disposition_watch_validator_summary = JSON.parse(currentAgent6DispositionWatchValidatorOutput);
  writeRefreshResult(result);

  const directRelayPromptOutput = runNode(['scripts/build_agent1_agent5_agent8_direct_relay_prompt.mjs']);
  const directRelayPromptValidatorOutput = runNode(['scripts/validate_agent1_agent5_agent8_direct_relay_prompt.mjs']);
  result.agent5_agent8_direct_relay_prompt_summary = JSON.parse(directRelayPromptOutput);
  result.agent5_agent8_direct_relay_prompt_validator_summary = JSON.parse(directRelayPromptValidatorOutput);
  writeRefreshResult(result);

  const completionAuditOutput = runNode(['scripts/build_agent1_source_custody_completion_audit.mjs']);
  const completionAuditValidatorOutput = runNode(['scripts/validate_agent1_source_custody_completion_audit.mjs']);
  result.completion_audit_summary = JSON.parse(completionAuditOutput);
  result.completion_audit_validator_summary = JSON.parse(completionAuditValidatorOutput);
  writeRefreshResult(result);
  const currentBlockerPacketOutput = runNode(['scripts/build_agent1_source_custody_current_blocker_packet.mjs']);
  const currentBlockerPacketValidatorOutput = runNode(['scripts/validate_agent1_source_custody_current_blocker_packet.mjs']);
  result.current_blocker_packet_summary = JSON.parse(currentBlockerPacketOutput);
  result.current_blocker_packet_validator_summary = JSON.parse(currentBlockerPacketValidatorOutput);
  writeRefreshResult(result);
  const ownerChecklistOutput = runNode(['scripts/build_agent1_source_file_reconciliation_owner_checklist.mjs']);
  const ownerChecklistValidatorOutput = runNode(['scripts/validate_agent1_source_file_reconciliation_owner_checklist.mjs']);
  result.source_file_reconciliation_owner_checklist_summary = JSON.parse(ownerChecklistOutput);
  result.source_file_reconciliation_owner_checklist_validator_summary = JSON.parse(ownerChecklistValidatorOutput);
  writeRefreshResult(result);
  const decisionMatrixOutput = runNode(['scripts/build_agent1_source_custody_agent6_decision_matrix.mjs']);
  const decisionMatrixValidatorOutput = runNode(['scripts/validate_agent1_source_custody_agent6_decision_matrix.mjs']);
  result.source_custody_agent6_decision_matrix_summary = JSON.parse(decisionMatrixOutput);
  result.source_custody_agent6_decision_matrix_validator_summary = JSON.parse(decisionMatrixValidatorOutput);
  writeRefreshResult(result);
  const refreshResultValidatorOutput = runNode(['scripts/validate_agent1_source_custody_refresh_result.mjs']);
  result.refresh_result_validator_summary = JSON.parse(refreshResultValidatorOutput);
  writeRefreshResult(result);
  console.log(JSON.stringify(result, null, 2));
}

try {
  main();
} catch (error) {
  const result = {
    ok: false,
    started_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    error: error.message,
    boundary: {
      publication_state: 'blocked_no_render',
      source_provenance_acceptance_claimed: false,
      public_runtime_acceptance_claimed: false,
      route_publication_support_claimed: false,
      definition_authority_claimed: false,
      page_render_acceptance_claimed: false,
    },
  };
  writeRefreshResult(result);
  console.error(JSON.stringify(result, null, 2));
  process.exitCode = 1;
}
