#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  matrix: 'reports/agent1-source-custody-agent6-decision-matrix-2026-06-03.json',
  matrixMd: 'reports/agent1-source-custody-agent6-decision-matrix-2026-06-03.md',
  refreshResult: 'reports/agent1-source-custody-refresh-result.json',
  ownerChecklist: 'reports/agent1-source-file-reconciliation-owner-checklist-2026-06-03.json',
  ownerChecklistValidator: 'reports/agent1-source-file-reconciliation-owner-checklist-validator-result-2026-06-03.json',
  currentBlockerPacket: 'reports/agent1-source-custody-current-blocker-packet-2026-06-03.json',
  directRelayPrompt: 'reports/agent1-agent5-agent8-direct-relay-prompt-2026-06-03.json',
  directRelayPromptValidator: 'reports/agent1-agent5-agent8-direct-relay-prompt-validator-result-2026-06-03.json',
  agent6ReadyDocket: 'reports/agent1-source-provenance-agent6-ready-docket-2026-06-03.json',
  downstreamManifest: 'reports/agent1-downstream-quarantine-manifest.json',
  result: 'reports/agent1-source-custody-agent6-decision-matrix-validator-result-2026-06-03.json',
  resultMd: 'reports/agent1-source-custody-agent6-decision-matrix-validator-result-2026-06-03.md'
};

const EXPECTED_REQUEST_IDS = [
  'agent6-agent1-source-custody-manifest-remediation-review',
  'agent6-agent1-source-custody-tracking-action-review',
  'agent6-agent1-source-custody-license-normalization-review',
  'agent6-agent1-public-hud-source-row-review',
  'agent6-agent1-orot-fill-source-row-review'
];

const EXPECTED_BLOCKERS = [
  'source_provenance_custody_unaccepted',
  'untracked_source_tracking_or_exclusion_pending',
  'modified_tracked_license_normalization_pending',
  'agent1_request_ids_absent_from_agent6_agent5_control_surfaces',
  'agent6_disposition_absent_for_current_request_ids',
  'publication_blocked_no_render'
];

const REQUIRED_FALSE_BOUNDARY_KEYS = [
  'action_performed',
  'queue_mutation_performed',
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

function assertBoundary(boundary) {
  assert(boundary?.agent1_status === 'Agent 6 decision matrix evidence only / awaiting-Agent-5-or-Agent-8 relay and Agent-6 disposition', 'agent1 status mismatch');
  assert(boundary?.publication_state === 'blocked_no_render', 'publication state mismatch');
  assert(boundary?.decision_matrix_only === true, 'decision_matrix_only must be true');
  for (const key of REQUIRED_FALSE_BOUNDARY_KEYS) {
    assert(boundary?.[key] === false, `boundary ${key} must be false`);
  }
}

function assertRows(rows, expectedStatus, label) {
  assert(Array.isArray(rows), `${label} rows must be an array`);
  for (const row of rows) {
    assert(typeof row.path === 'string' && row.path.startsWith('data/sources/'), `${label} path invalid`, row);
    assert(typeof row.work_id === 'string' && row.work_id.length > 0, `${label} work_id invalid`, row);
    assert(row.git_status === expectedStatus, `${label} git status mismatch`, row);
    assert(row.source_sha256?.length === 64, `${label} sha256 missing`, row);
    assert(row.action_performed === false, `${label} action performed must be false`, row);
    assert(Number.isInteger(row.direct_downstream_artifact_path_count), `${label} direct path count missing`, row);
    assert(Number.isInteger(row.content_reference_unique_path_count), `${label} content reference count missing`, row);
  }
}

function renderResult(result) {
  return `# Agent 1 Source Custody Agent 6 Decision Matrix Validator Result

Generated: ${result.completed_at}

- OK: ${result.ok}
- Validated matrix: \`${result.validated_matrix}\`
- Refresh completed: \`${result.refresh_completed_at}\`
- Request IDs: ${result.request_id_count}
- Tracking rows: ${result.tracking_rows}
- License-normalization rows: ${result.license_rows}
- Exact blockers: ${result.exact_blockers}
- Blocked direct artifact paths: ${result.blocked_direct_artifact_paths}
- Blocked content-reference paths: ${result.blocked_content_reference_paths}
- Queue mutation performed: ${result.queue_mutation_performed}
- Action performed: ${result.action_performed}
- Publication state: \`${result.boundary.publication_state}\`

This validator confirms Agent 6 decision-matrix evidence only. It does not approve source/provenance custody, source-file tracking, source publication, QA, runtime, or publication.
`;
}

function main() {
  const startedAt = new Date().toISOString();
  try {
    const matrix = readJson(PATHS.matrix);
    const markdown = readText(PATHS.matrixMd);
    const refresh = readJson(PATHS.refreshResult);
    const checklist = readJson(PATHS.ownerChecklist);
    const checklistValidator = readJson(PATHS.ownerChecklistValidator);
    const blocker = readJson(PATHS.currentBlockerPacket);
    const relay = readJson(PATHS.directRelayPrompt);
    const relayValidator = readJson(PATHS.directRelayPromptValidator);
    const docket = readJson(PATHS.agent6ReadyDocket);
    const manifest = readJson(PATHS.downstreamManifest);

    assert(matrix.artifact_type === 'agent1_source_custody_agent6_decision_matrix', 'unexpected artifact type');
    assert(matrix.refresh_completed_at === refresh.completed_at, 'matrix refresh timestamp mismatch');
    assert(checklistValidator.ok === true, 'owner checklist validator must be ok');
    assert(checklistValidator.refresh_completed_at === refresh.completed_at, 'owner checklist validator refresh timestamp mismatch');
    assert(relayValidator.ok === true, 'direct relay prompt validator must be ok');
    assert(relayValidator.refresh_completed_at === refresh.completed_at, 'direct relay validator refresh timestamp mismatch');
    assert(blocker.refresh_completed_at === refresh.completed_at, 'blocker packet refresh timestamp mismatch');

    assert(matrix.current_source_scope.source_rows === manifest.summary.source_rows, 'source row count mismatch');
    assert(matrix.current_source_scope.fingerprinted_source_rows === 29, 'fingerprinted source row count mismatch');
    assert(matrix.current_source_scope.untracked_source_files === 23, 'untracked source file count mismatch');
    assert(matrix.current_source_scope.modified_tracked_source_files === 6, 'modified tracked source file count mismatch');
    assert(matrix.current_source_scope.missing_lexical_manifest_source_files === 0, 'missing lexical manifest count mismatch');
    assert(matrix.current_source_scope.exact_blockers === 6, 'exact blocker count mismatch');

    assert(matrix.downstream_reliance.blocked_direct_artifact_paths === manifest.summary.direct_artifact_rows, 'blocked direct artifact path count mismatch');
    assert(matrix.downstream_reliance.blocked_content_reference_paths === manifest.summary.content_reference_rows, 'blocked content reference path count mismatch');
    assert(matrix.downstream_reliance.content_reference_rows_by_kind.route_cards_or_hud_surfaces === 42, 'route/HUD content reference rows mismatch');
    assert(matrix.downstream_reliance.content_reference_rows_by_kind.reader_workbench_artifacts === 112, 'reader/workbench content reference rows mismatch');
    assert(matrix.downstream_reliance.content_reference_rows_by_kind.public_lexical_exports === 29, 'public lexical content reference rows mismatch');
    assert(matrix.downstream_reliance.rule === 'keep_blocked_until_source_provenance_disposition', 'downstream rule mismatch');

    sameSet(matrix.relay_gate.request_ids, EXPECTED_REQUEST_IDS, 'relay request IDs');
    sameSet(docket.review_items.map((item) => item.request_id), EXPECTED_REQUEST_IDS, 'docket request IDs');
    assert(matrix.relay_gate.status === relay.status, 'relay status mismatch');
    assert(matrix.relay_gate.queue_insertion_patch_operations === 5, 'queue insertion patch operation count mismatch');
    assert(matrix.relay_gate.queue_mutation_performed === false, 'relay queue mutation must be false');
    assert(matrix.relay_gate.agent6_disposition_hits === 0, 'Agent 6 disposition hits must be zero');
    assert(matrix.relay_gate.relay_signal_hits === 0, 'relay signal hits must be zero');

    const tracking = matrix.agent6_decision_matrix.tracking_or_exclusion;
    const license = matrix.agent6_decision_matrix.license_normalization;
    assert(tracking.request_id === 'agent6-agent1-source-custody-tracking-action-review', 'tracking request ID mismatch');
    assert(license.request_id === 'agent6-agent1-source-custody-license-normalization-review', 'license request ID mismatch');
    assertRows(tracking.rows, '??', 'tracking');
    assertRows(license.rows, ' M', 'license');
    assert(tracking.rows.length === checklist.owner_checklist.agent6_tracking_or_exclusion.paths.length, 'tracking row count must match checklist');
    assert(license.rows.length === checklist.owner_checklist.agent6_license_normalization.paths.length, 'license row count must match checklist');
    sameSet(tracking.rows.map((row) => row.path), checklist.owner_checklist.agent6_tracking_or_exclusion.paths.map((row) => row.path), 'tracking paths');
    sameSet(license.rows.map((row) => row.path), checklist.owner_checklist.agent6_license_normalization.paths.map((row) => row.path), 'license paths');
    for (const row of license.rows) {
      assert(row.all_diffs_are_license_pd_to_public_domain === true, 'license row must be PD to Public Domain only', row);
    }

    assert(matrix.agent6_decision_matrix.manifest_remediation.request_id === 'agent6-agent1-source-custody-manifest-remediation-review', 'manifest remediation request ID mismatch');
    assert(matrix.agent6_decision_matrix.public_hud_source_rows.request_id === 'agent6-agent1-public-hud-source-row-review', 'public HUD request ID mismatch');
    assert(matrix.agent6_decision_matrix.orot_fill_source_rows.request_id === 'agent6-agent1-orot-fill-source-row-review', 'Orot fill request ID mismatch');
    for (const gate of Object.values(matrix.agent6_decision_matrix)) {
      assert(gate.action_performed === false, 'decision gate action must be false', gate);
      assert(gate.acceptance_claimed === false, 'decision gate acceptance must be false', gate);
    }

    sameSet(matrix.current_blockers, EXPECTED_BLOCKERS, 'current blockers');
    assertBoundary(matrix.boundary);
    for (const term of matrix.must_not_accept) {
      assert(markdown.includes(term), `Markdown missing must-not-accept term: ${term}`);
    }
    for (const expected of [
      'Agent 6 decision matrix prepared',
      'awaiting-Agent-5-or-Agent-8 relay and Agent-6 disposition only',
      'Queue mutation performed: false',
      'Action performed: false',
      '`blocked_no_render`'
    ]) {
      assert(markdown.includes(expected), `Markdown missing expected fragment: ${expected}`);
    }

    const result = {
      ok: true,
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      validated_matrix: PATHS.matrix,
      validated_matrix_md: PATHS.matrixMd,
      refresh_completed_at: matrix.refresh_completed_at,
      request_id_count: matrix.relay_gate.request_ids.length,
      tracking_rows: tracking.rows.length,
      license_rows: license.rows.length,
      exact_blockers: matrix.current_source_scope.exact_blockers,
      blocked_direct_artifact_paths: matrix.downstream_reliance.blocked_direct_artifact_paths,
      blocked_content_reference_paths: matrix.downstream_reliance.blocked_content_reference_paths,
      route_hud_content_reference_rows: matrix.downstream_reliance.content_reference_rows_by_kind.route_cards_or_hud_surfaces,
      reader_workbench_content_reference_rows: matrix.downstream_reliance.content_reference_rows_by_kind.reader_workbench_artifacts,
      public_lexical_content_reference_rows: matrix.downstream_reliance.content_reference_rows_by_kind.public_lexical_exports,
      action_performed: matrix.boundary.action_performed,
      queue_mutation_performed: matrix.boundary.queue_mutation_performed,
      boundary: matrix.boundary
    };
    writeJson(PATHS.result, result);
    writeText(PATHS.resultMd, renderResult(result));
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    const result = {
      ok: false,
      completed_at: new Date().toISOString(),
      error: error.message,
      details: error.details || {}
    };
    writeJson(PATHS.result, result);
    writeText(PATHS.resultMd, renderResult({ ...result, validated_matrix: PATHS.matrix, refresh_completed_at: '', request_id_count: 0, tracking_rows: 0, license_rows: 0, exact_blockers: 0, blocked_direct_artifact_paths: 0, blocked_content_reference_paths: 0, queue_mutation_performed: '', action_performed: '', boundary: { publication_state: '' } }));
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
}

main();
