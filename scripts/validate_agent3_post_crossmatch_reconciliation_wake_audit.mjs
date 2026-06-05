#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath =
  process.argv[2] || 'reports/agent3-post-crossmatch-reconciliation-wake-audit-2026-06-05.json';
const artifact = readJson(artifactPath);
const queue = readJson('data/control/spark_standing_queue.json');
const directState = readJson('reports/agent10-direct-release-package-goal-state-2026-06-05.json');
const freshConsumption = readJson('reports/agent10-agent3-agent4-fresh-output-consumption-2026-06-05.json');
const inventory = readJson('reports/agent3-crossmatch-inventory-packet-2026-06-05.json');
const crossmatchReconciliation = readJson(
  'reports/agent3-agent10-crossmatch-direct-state-reconciliation-2026-06-05.json',
);
const postMatrixConsumption = readJson(
  'reports/agent3-agent10-post-matrix-registration-consumption-package-2026-06-05.json',
);
const issues = [];
const warnings = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(artifact.artifact_type === 'agent3_post_crossmatch_reconciliation_wake_audit', 'artifact_type mismatch');
expect(artifact.status === 'post_crossmatch_reconciliation_no_new_agent3_workset', 'status mismatch');
expect(artifact.lane_owner === 'Agent 3', 'lane_owner must be Agent 3');
expect(artifact.publication_state === 'blocked_no_render', 'publication_state must be blocked_no_render');

validateReviewedInputs();
validateQueue();
validateDirectAndFreshCrossmatch();
validateNoWorkset();
validateCounts();
validateBoundaries();
validateNoForbiddenPayload();

if (issues.length) {
  console.error(`Agent 3 post-crossmatch reconciliation wake audit failed (${issues.length} issue(s))`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 3 post-crossmatch reconciliation wake audit validation passed');
console.log(
  JSON.stringify(
    {
      artifact: artifactPath,
      status: artifact.status,
      stale_direct_dirty: artifact.schema_counts.agent10_direct_crossmatch_dirty_or_uncommitted_files,
      current_inventory_dirty: artifact.schema_counts.current_inventory_dirty_or_uncommitted_files,
      registered_rows: artifact.schema_counts.spark10_agent3_continuity_registered_rows,
      executable_worksets: artifact.schema_counts.direct_agent3_executable_worksets,
      remaining_blockers: artifact.remaining_blockers.map((blocker) => blocker.blocker),
      warnings,
    },
    null,
    2,
  ),
);

function validateReviewedInputs() {
  const volatileRoles = new Set(artifact.volatile_reviewed_input_roles || []);
  const reviewedInputs = artifact.reviewed_inputs || [];
  expect(reviewedInputs.length === artifact.files.input_files.length, 'reviewed input count mismatch');
  for (const input of reviewedInputs) {
    expect(Boolean(input.role), `reviewed input missing role for ${input.path}`);
    expect(Boolean(input.path), `reviewed input missing path for ${input.role}`);
    expect(input.exists === true, `reviewed input must exist: ${input.path}`);
    if (!exists(input.path)) continue;
    expect(/^[a-f0-9]{64}$/.test(input.sha256 || ''), `reviewed input hash invalid: ${input.path}`);
    expect(Number.isInteger(input.bytes) && input.bytes > 0, `reviewed input bytes invalid: ${input.path}`);
    if (sha256(input.path) !== input.sha256) {
      if (volatileRoles.has(input.role)) warnings.push(`volatile input changed after package build: ${input.path}`);
      else issues.push(`reviewed input hash drifted: ${input.path}`);
    }
  }
}

function validateQueue() {
  const row = (queue.direct_agent_goal_proof || []).find((entry) => entry.production_lane === 'Agent 3');
  expect(Boolean(row), 'queue must include Agent 3 proof row');
  expect(artifact.schema_counts.queue_agent3_rows === 1, 'queue Agent 3 row count must be 1');
  expect(
    /Deuteronomy phase-2 contract missing exact fields/i.test(
      `${row?.direct_active_goal || ''} ${row?.current_artifact_or_exact_blocker || ''} ${row?.stop_condition || ''}`,
    ),
    'queue Agent 3 row must still contain stale Deuteronomy contract-gap language',
  );
  expect(
    artifact.schema_counts.queue_stale_deuteronomy_contract_gap_rows === 1,
    'stale queue Deuteronomy contract-gap row count must be 1',
  );
}

function validateDirectAndFreshCrossmatch() {
  const directRow = (directState.rows || []).find((entry) =>
    /crossmatch inventory/i.test(String(entry.agent10_direct_release_package_goal || '')),
  );
  const freshRow = (freshConsumption.consumed_outputs || []).find(
    (entry) => entry.package_workset === 'agent3_crossmatch_inventory_packet',
  );
  expect(Boolean(directRow), 'Agent10 direct state must include crossmatch inventory row');
  expect(Boolean(freshRow), 'Agent10 fresh consumption must include crossmatch inventory row');
  expect(directRow?.counts?.agent3_dirty_or_uncommitted_files > 0, 'direct-state stale dirty count must be positive');
  expect(freshRow?.counts?.dirty_or_uncommitted_files === 0, 'fresh consumption dirty count must be 0');
  expect(inventory.counts?.dirty_or_uncommitted_files === 0, 'current inventory dirty count must be 0');
  expect(inventory.blocker?.status === 'none', 'current inventory blocker must be none');
  expect(
    crossmatchReconciliation.remaining_blocker?.blocker ===
      'top_level_agent10_direct_state_crossmatch_row_stale_until_agent10_refreshes_summary',
    'crossmatch reconciliation remaining blocker mismatch',
  );
}

function validateNoWorkset() {
  expect(
    postMatrixConsumption.remaining_blocker?.blocker === 'no_exact_changed_executable_agent3_workset',
    'post-matrix remaining blocker mismatch',
  );
  expect(
    postMatrixConsumption.schema_counts?.direct_agent3_executable_worksets === 0,
    'post-matrix direct executable worksets must be 0',
  );
  expect(
    artifact.schema_counts.direct_agent3_executable_worksets === 0,
    'artifact direct executable worksets must be 0',
  );
  expect(
    artifact.schema_counts.latest_agent3_package_spark10_registered === 1,
    'latest Agent 3 package must be registered in current release-intake matrix',
  );
  expect(
    artifact.schema_counts.spark10_agent3_continuity_registered_rows === 4,
    'Spark10 Agent 3 continuity registered rows must be 4',
  );
}

function validateCounts() {
  const counts = artifact.schema_counts || {};
  expect(counts.agent10_direct_crossmatch_rows === 1, 'direct crossmatch rows must be 1');
  expect(counts.agent10_direct_crossmatch_dirty_or_uncommitted_files > 0, 'direct stale dirty count must be positive');
  expect(counts.agent10_fresh_crossmatch_dirty_or_uncommitted_files === 0, 'fresh dirty count must be 0');
  expect(counts.current_inventory_dirty_or_uncommitted_files === 0, 'current inventory dirty count must be 0');
  expect(counts.agent10_fresh_crossmatch_truthy_authority_claims === 0, 'fresh truthy authority claims must be 0');
  expect(counts.current_inventory_truthy_authority_claims === 0, 'inventory truthy authority claims must be 0');
  expect(counts.stale_direct_dirty_count_delta === counts.agent10_direct_crossmatch_dirty_or_uncommitted_files, 'stale dirty delta mismatch');
  expect(counts.top_level_agent10_direct_state_crossmatch_stale_rows === 1, 'top-level stale row count must be 1');
  expect(counts.direct_queue_agent3_runnable_items === 0, 'direct queue Agent 3 runnable items must be 0');
  expect(counts.direct_deuteronomy_executable_worksets === 0, 'direct Deuteronomy executable worksets must be 0');
  expect(counts.no_new_agent3_workset_blockers === 2, 'no-new-workset blocker count must be 2');
  expect(counts.control_edits === 0, 'control edits must be 0');
  expect(counts.agent6_boundary_packets_opened === 0, 'Agent 6 boundary packets opened must be 0');
  for (const key of [
    'route_publication_support_rows',
    'definition_authority_rows',
    'usage_as_definition_rows',
    'answer_rows',
    'accepted_text_rows',
    'public_runtime_mutations',
    'public_reader_output_rows',
  ]) {
    expect(counts[key] === 0, `${key} must be 0`);
  }
}

function validateBoundaries() {
  expect(allFalse(artifact.boundary), 'boundary values must all be false');
  expect(/changed Agent 3 artifact path/.test(artifact.wake_condition || ''), 'wake condition must require changed Agent 3 artifact path');
  expect(/target rows\/occurrences/.test(artifact.wake_condition || ''), 'wake condition must require rows/occurrences');
  expect(/validator\/gate/.test(artifact.wake_condition || ''), 'wake condition must require validator/gate');
  expect(/Agent 10/.test(artifact.handoff_owner || ''), 'handoff owner must name Agent 10');
  const blockers = new Set((artifact.remaining_blockers || []).map((blocker) => blocker.blocker));
  expect(
    blockers.has('top_level_agent10_direct_state_crossmatch_row_stale_until_agent10_refreshes_summary'),
    'missing stale Agent10 direct-state blocker',
  );
  expect(blockers.has('no_exact_changed_executable_agent3_workset'), 'missing no-exact-workset blocker');
}

function validateNoForbiddenPayload() {
  const serialized = JSON.stringify(artifact);
  for (const forbidden of [
    '"definition_authority":true',
    '"usage_as_definition_authority":true',
    '"answer_selection":true',
    '"route_publication_support":true',
    '"public_runtime_mutation":true',
    '"accepted_text":true',
    '"control_state_mutation":true',
    '"source_license_acceptance":true',
    '"qa_acceptance":true',
    'accepted_text_now',
    'definition_text_stored_now',
  ]) {
    expect(!serialized.includes(forbidden), `forbidden authority payload detected: ${forbidden}`);
  }
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(resolve(relativePath), 'utf8'));
}

function exists(relativePath) {
  return fs.existsSync(resolve(relativePath));
}

function resolve(relativePath) {
  return path.resolve(root, relativePath);
}

function sha256(relativePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(resolve(relativePath))).digest('hex');
}

function allFalse(value) {
  return Boolean(value) && Object.values(value).every((entry) => entry === false);
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}
