#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  checklist: 'reports/agent1-source-file-reconciliation-owner-checklist-2026-06-03.json',
  checklistMd: 'reports/agent1-source-file-reconciliation-owner-checklist-2026-06-03.md',
  actionPlan: 'reports/agent1-source-file-reconciliation-action-plan-2026-06-03.json',
  actionPlanValidator: 'reports/agent1-source-file-reconciliation-action-plan-validator-result-2026-06-03.json',
  currentBlockerPacket: 'reports/agent1-source-custody-current-blocker-packet-2026-06-03.json',
  currentBlockerPacketValidator: 'reports/agent1-source-custody-current-blocker-packet-validator-result-2026-06-03.json',
  directRelayPrompt: 'reports/agent1-agent5-agent8-direct-relay-prompt-2026-06-03.json',
  directRelayPromptValidator: 'reports/agent1-agent5-agent8-direct-relay-prompt-validator-result-2026-06-03.json',
  refreshResult: 'reports/agent1-source-custody-refresh-result.json',
  result: 'reports/agent1-source-file-reconciliation-owner-checklist-validator-result-2026-06-03.json',
  resultMd: 'reports/agent1-source-file-reconciliation-owner-checklist-validator-result-2026-06-03.md'
};

const EXPECTED_REVIEW_ITEMS = [
  'agent6-agent1-source-custody-manifest-remediation-review',
  'agent6-agent1-source-custody-tracking-action-review',
  'agent6-agent1-source-custody-license-normalization-review',
  'agent6-agent1-public-hud-source-row-review',
  'agent6-agent1-orot-fill-source-row-review'
].sort((a, b) => a.localeCompare(b));

const EXPECTED_BLOCKERS = [
  'source_provenance_custody_unaccepted',
  'untracked_source_tracking_or_exclusion_pending',
  'modified_tracked_license_normalization_pending',
  'agent1_request_ids_absent_from_agent6_agent5_control_surfaces',
  'agent6_disposition_absent_for_current_request_ids',
  'publication_blocked_no_render'
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
  'route publication support',
  'Definition authority',
  'product/data acceptance',
  'usage-as-definition authority',
  'translation output',
  'accepted translation text'
].sort((a, b) => a.localeCompare(b));

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

function assertBoundary(boundary) {
  assert(boundary?.agent1_status === 'owner checklist evidence only / awaiting-Agent-5-or-Agent-8 relay and Agent-6 disposition', 'agent1 status mismatch');
  assert(boundary?.publication_state === 'blocked_no_render', 'publication state mismatch');
  assert(boundary?.checklist_only === true, 'checklist_only must be true');
  assert(boundary?.action_performed === false, 'action performed must be false');
  assert(boundary?.queue_mutation_performed === false, 'queue mutation must be false');
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
    'accepted_translation_text_claimed',
    'completion_claimed'
  ]);
}

function assertPathRows(rows, expectedStatus, label) {
  assert(Array.isArray(rows), `${label} rows must be an array`);
  for (const row of rows) {
    assert(typeof row.path === 'string' && row.path.startsWith('data/sources/'), `${label} path invalid`, row);
    assert(row.git_status === expectedStatus, `${label} git status mismatch`, row);
    assert(row.source_sha256?.length === 64, `${label} sha256 missing`, row);
    assert(row.action_performed === false, `${label} action_performed must be false`, row);
    assert(Number.isInteger(row.direct_downstream_artifact_path_count), `${label} direct downstream count missing`, row);
    assert(Number.isInteger(row.content_reference_unique_path_count), `${label} content reference count missing`, row);
  }
}

function renderResultMarkdown(result) {
  return `# Agent 1 Source File Reconciliation Owner Checklist Validator Result

Generated: ${result.completed_at}

- OK: ${result.ok}
- Validated checklist: \`${result.validated_checklist}\`
- Refresh completed: \`${result.refresh_completed_at}\`
- Track-candidate source files: ${result.track_candidate_source_files}
- Modified tracked source files: ${result.modified_tracked_source_files}
- Request IDs: ${result.request_id_count}
- Exact blockers: ${result.exact_blocker_count}
- Action performed: ${result.action_performed}
- Queue mutation performed: ${result.queue_mutation_performed}
- Publication state: \`${result.boundary?.publication_state}\`

This validator confirms owner-checklist evidence only. It does not approve source/provenance custody, source-file tracking, source publication, QA, runtime, or publication.
`;
}

function main() {
  const startedAt = new Date().toISOString();
  const checklist = readJson(PATHS.checklist);
  const actionPlan = readJson(PATHS.actionPlan);
  const actionPlanValidator = readJson(PATHS.actionPlanValidator);
  const blockerPacket = readJson(PATHS.currentBlockerPacket);
  const blockerValidator = readJson(PATHS.currentBlockerPacketValidator);
  const directRelayPrompt = readJson(PATHS.directRelayPrompt);
  const directRelayPromptValidator = readJson(PATHS.directRelayPromptValidator);
  const refreshResult = readJson(PATHS.refreshResult);
  const markdown = readText(PATHS.checklistMd);

  assert(checklist.artifact_type === 'agent1_source_file_reconciliation_owner_checklist', 'unexpected artifact type');
  assert(checklist.highest_permissible_claim === 'source-file reconciliation owner checklist evidence prepared', 'highest permissible claim mismatch');
  assert(checklist.refresh_completed_at === refreshResult.completed_at, 'checklist refresh timestamp mismatch');
  assert(refreshResult.ok === true, 'refresh result must be ok');
  assert(actionPlanValidator.ok === true, 'action plan validator must be ok');
  assert(blockerValidator.ok === true, 'current blocker validator must be ok');
  assert(directRelayPromptValidator.ok === true, 'direct relay prompt validator must be ok');
  assert(blockerPacket.refresh_completed_at === refreshResult.completed_at, 'blocker packet refresh timestamp mismatch');
  assert(blockerValidator.refresh_completed_at === refreshResult.completed_at, 'blocker validator refresh timestamp mismatch');
  assert(directRelayPrompt.refresh_completed_at === refreshResult.completed_at, 'direct relay prompt refresh timestamp mismatch');
  assert(directRelayPromptValidator.refresh_completed_at === refreshResult.completed_at, 'direct relay prompt validator refresh timestamp mismatch');

  sameSet(checklist.owner_checklist.agent5_or_agent8_relay.request_ids, EXPECTED_REVIEW_ITEMS, 'relay request IDs');
  assert(checklist.owner_checklist.agent5_or_agent8_relay.status === 'direct_relay_prompt_ready_no_agent1_mutation', 'relay prompt status mismatch');
  assert(checklist.owner_checklist.agent5_or_agent8_relay.request_id_count === EXPECTED_REVIEW_ITEMS.length, 'relay request count mismatch');
  assert(checklist.owner_checklist.agent5_or_agent8_relay.queue_insertion_patch_operations === EXPECTED_REVIEW_ITEMS.length, 'queue patch operation count mismatch');
  assert(checklist.owner_checklist.agent5_or_agent8_relay.agent6_disposition_hits === 0, 'Agent 6 disposition hits must be zero');
  assert(checklist.owner_checklist.agent5_or_agent8_relay.relay_signal_hits === 0, 'relay signal hits must be zero');
  assert(checklist.owner_checklist.agent5_or_agent8_relay.queue_mutation_performed === false, 'relay queue mutation must be false');

  const tracking = checklist.owner_checklist.agent6_tracking_or_exclusion;
  const trackingSourceRows = actionPlan.proposed_actions.track_23_untracked_sources.paths;
  assert(tracking.request_id === 'agent6-agent1-source-custody-tracking-action-review', 'tracking request ID mismatch');
  assert(tracking.source_file_count === 23, 'tracking source file count mismatch');
  assert(tracking.source_file_count === trackingSourceRows.length, 'tracking source file count must match action plan');
  assert(tracking.display_only_command_was_not_run === true, 'tracking display-only command must not be run');
  assertPathRows(tracking.paths, '??', 'tracking');
  sameSet(tracking.paths.map((row) => row.path), trackingSourceRows.map((row) => row.path), 'tracking paths');

  const license = checklist.owner_checklist.agent6_license_normalization;
  const licenseSourceRows = actionPlan.proposed_actions.accept_6_license_label_normalizations.paths;
  assert(license.request_id === 'agent6-agent1-source-custody-license-normalization-review', 'license request ID mismatch');
  assert(license.source_file_count === 6, 'license source file count mismatch');
  assert(license.source_file_count === licenseSourceRows.length, 'license source file count must match action plan');
  assert(license.display_only_command_was_not_run === true, 'license display-only command must not be run');
  assertPathRows(license.paths, ' M', 'license');
  for (const row of license.paths) {
    assert(row.all_diffs_are_license_pd_to_public_domain === true, 'license diffs must be PD to Public Domain only', row);
    assert(Number.isInteger(row.scalar_diff_count) && row.scalar_diff_count > 0, 'license scalar diff count missing', row);
  }
  sameSet(license.paths.map((row) => row.path), licenseSourceRows.map((row) => row.path), 'license paths');

  assert(checklist.downstream_reliance.blocked_direct_artifact_paths === 248, 'blocked direct paths mismatch');
  assert(checklist.downstream_reliance.blocked_content_reference_paths === 183, 'blocked content-reference paths mismatch');
  assert(checklist.current_counts.total_source_file_reconciliation_candidates === 29, 'total source candidate count mismatch');
  assert(checklist.current_counts.missing_manifest_source_files === 0, 'missing manifest count mismatch');
  assert(checklist.current_counts.current_blocker_exact_blocker_count === 6, 'current blocker exact count mismatch');
  sameSet(checklist.current_blockers, EXPECTED_BLOCKERS, 'current blockers');
  sameSet(checklist.must_not_accept, EXPECTED_MUST_NOT_ACCEPT, 'must-not-accept list');
  for (const artifact of checklist.evidence_artifacts || []) {
    assert(fs.existsSync(fullPath(artifact)), `evidence artifact missing: ${artifact}`);
  }
  assertBoundary(checklist.boundary);
  assert(markdown.includes(`Refresh completed: \`${refreshResult.completed_at}\``), 'markdown refresh timestamp missing');
  assert(markdown.includes('Gate 1: Agent 5/8 Relay'), 'markdown relay gate missing');
  assert(markdown.includes('Gate 2: Agent 6 Tracking Or Exclusion'), 'markdown tracking gate missing');
  assert(markdown.includes('Gate 3: Agent 6 License Normalization'), 'markdown license gate missing');
  assert(markdown.includes('Queue mutation performed: false'), 'markdown queue non-mutation missing');
  assert(markdown.includes('Action performed: false'), 'markdown action non-performance missing');

  const result = {
    ok: true,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    validated_checklist: PATHS.checklist,
    validated_checklist_md: PATHS.checklistMd,
    refresh_completed_at: checklist.refresh_completed_at,
    track_candidate_source_files: tracking.source_file_count,
    modified_tracked_source_files: license.source_file_count,
    request_id_count: checklist.owner_checklist.agent5_or_agent8_relay.request_id_count,
    exact_blocker_count: checklist.current_counts.current_blocker_exact_blocker_count,
    blocked_direct_artifact_paths: checklist.downstream_reliance.blocked_direct_artifact_paths,
    blocked_content_reference_paths: checklist.downstream_reliance.blocked_content_reference_paths,
    action_performed: checklist.boundary.action_performed,
    queue_mutation_performed: checklist.boundary.queue_mutation_performed,
    boundary: checklist.boundary
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
