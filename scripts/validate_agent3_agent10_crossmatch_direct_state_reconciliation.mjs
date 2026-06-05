#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath =
  process.argv[2] || 'reports/agent3-agent10-crossmatch-direct-state-reconciliation-2026-06-05.json';
const artifact = readJson(artifactPath);
const directState = readJson('reports/agent10-direct-release-package-goal-state-2026-06-05.json');
const freshConsumption = readJson('reports/agent10-agent3-agent4-fresh-output-consumption-2026-06-05.json');
const inventory = readJson('reports/agent3-crossmatch-inventory-packet-2026-06-05.json');
const issues = [];
const warnings = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_agent10_crossmatch_direct_state_reconciliation',
  'artifact_type mismatch',
);
expect(
  artifact.status === 'agent10_direct_state_crossmatch_row_stale_current_inventory_clean',
  'status mismatch',
);
expect(artifact.lane_owner === 'Agent 3', 'lane_owner must be Agent 3');
expect(artifact.publication_state === 'blocked_no_render', 'publication_state must be blocked_no_render');

validateReviewedInputs();
validateDirectState();
validateFreshConsumption();
validateInventory();
validateCounts();
validateBoundaries();
validateNoForbiddenPayload();

if (issues.length) {
  console.error(`Agent 3 / Agent10 crossmatch reconciliation validation failed (${issues.length} issue(s))`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 3 / Agent10 crossmatch reconciliation validation passed');
console.log(
  JSON.stringify(
    {
      artifact: artifactPath,
      status: artifact.status,
      direct_dirty: artifact.schema_counts.direct_state_agent3_dirty_or_uncommitted_files,
      fresh_dirty: artifact.schema_counts.fresh_consumption_agent3_dirty_or_uncommitted_files,
      current_dirty: artifact.schema_counts.current_inventory_dirty_or_uncommitted_files,
      stale_delta: artifact.schema_counts.stale_dirty_count_delta,
      remaining_blocker: artifact.remaining_blocker.blocker,
      warnings,
    },
    null,
    2,
  ),
);

function validateReviewedInputs() {
  const reviewedInputs = artifact.reviewed_inputs || [];
  expect(reviewedInputs.length === artifact.files.input_files.length, 'reviewed input count mismatch');
  for (const input of reviewedInputs) {
    expect(Boolean(input.role), `reviewed input missing role for ${input.path}`);
    expect(Boolean(input.path), `reviewed input missing path for ${input.role}`);
    expect(input.exists === true, `reviewed input must exist: ${input.path}`);
    if (!exists(input.path)) continue;
    expect(/^[a-f0-9]{64}$/.test(input.sha256 || ''), `reviewed input hash invalid: ${input.path}`);
    expect(Number.isInteger(input.bytes) && input.bytes > 0, `reviewed input bytes invalid: ${input.path}`);
    if (input.sha256 !== sha256(input.path)) warnings.push(`reviewed input changed after package build: ${input.path}`);
  }
}

function validateDirectState() {
  const row = (directState.rows || []).find((entry) =>
    /crossmatch inventory/i.test(String(entry.agent10_direct_release_package_goal || '')),
  );
  expect(Boolean(row), 'Agent10 direct state must include crossmatch inventory row');
  expect(
    row?.local_artifact_or_exact_blocker === 'reports/agent10-agent3-agent4-fresh-output-consumption-2026-06-05.json',
    'direct-state row must point at fresh output consumption packet',
  );
  expect(row?.counts?.agent3_files_in_inventory === 225, 'direct-state file count must be 225');
  expect(row?.counts?.agent3_dirty_or_uncommitted_files > 0, 'direct-state stale dirty count must be positive');
  expect(
    /crossmatch_inventory_contains_dirty_or_uncommitted_artifacts/.test(String(row?.exact_blocker || '')),
    'direct-state row must preserve stale dirty inventory blocker',
  );
  expect(
    /agent3_crossmatch_inventory_count_changed_during_agent10_intake/.test(String(row?.exact_blocker || '')),
    'direct-state row must preserve volatile inventory-count blocker',
  );
}

function validateFreshConsumption() {
  const row = (freshConsumption.consumed_outputs || []).find(
    (entry) => entry.package_workset === 'agent3_crossmatch_inventory_packet',
  );
  expect(Boolean(row), 'fresh consumption must include Agent3 crossmatch inventory row');
  expect(row?.counts?.files_in_inventory === 225, 'fresh consumption file count must be 225');
  expect(row?.counts?.dirty_or_uncommitted_files === 0, 'fresh consumption dirty count must be 0');
  expect(row?.counts?.forbidden_truthy_authority_claims === 0, 'fresh consumption truthy authority claims must be 0');
  expect(row?.exact_blocker === 'none_for_clean_inventory_baseline', 'fresh consumption exact blocker mismatch');
}

function validateInventory() {
  expect(inventory.artifact_type === 'agent3_crossmatch_inventory_packet', 'inventory artifact type mismatch');
  expect(inventory.counts?.files_in_inventory === 225, 'current inventory file count must be 225');
  expect(inventory.counts?.dirty_or_uncommitted_files === 0, 'current inventory dirty count must be 0');
  expect(inventory.counts?.untracked_files === 0, 'current inventory untracked count must be 0');
  expect(inventory.counts?.reader_facing_rows === 0, 'current inventory reader-facing rows must be 0');
  expect(inventory.counts?.route_payload_field_hits === 0, 'current inventory route payload hits must be 0');
  expect(inventory.counts?.forbidden_authority_field_hits === 0, 'current inventory forbidden authority hits must be 0');
  expect(inventory.counts?.forbidden_truthy_authority_claims === 0, 'current inventory truthy authority claims must be 0');
  expect(inventory.blocker?.status === 'none', 'current inventory blocker must be none');
}

function validateCounts() {
  const counts = artifact.schema_counts || {};
  expect(counts.direct_state_rows_matching_crossmatch === 1, 'direct state crossmatch row count must be 1');
  expect(counts.direct_state_agent3_files_in_inventory === 225, 'direct state files count mismatch');
  expect(counts.direct_state_agent3_dirty_or_uncommitted_files > 0, 'direct state stale dirty count must be positive');
  expect(counts.fresh_consumption_agent3_files_in_inventory === 225, 'fresh consumption files count mismatch');
  expect(counts.fresh_consumption_agent3_dirty_or_uncommitted_files === 0, 'fresh consumption dirty count mismatch');
  expect(counts.current_inventory_files_in_inventory === 225, 'current inventory files count mismatch');
  expect(counts.current_inventory_dirty_or_uncommitted_files === 0, 'current inventory dirty count mismatch');
  expect(
    counts.stale_dirty_count_delta === counts.direct_state_agent3_dirty_or_uncommitted_files,
    'stale dirty delta must equal direct-state stale dirty count',
  );
  expect(counts.current_inventory_blocker_count === 0, 'current inventory blocker count must be 0');
  expect(counts.agent6_boundary_packets_opened === 0, 'Agent 6 boundary packets opened must be 0');
  for (const key of [
    'route_publication_support_rows',
    'definition_authority_rows',
    'usage_as_definition_rows',
    'answer_rows',
    'accepted_text_rows',
    'public_runtime_mutations',
    'public_reader_output_rows',
    'control_edits',
  ]) {
    expect(counts[key] === 0, `${key} must be 0`);
  }
}

function validateBoundaries() {
  expect(artifact.evidence_scope?.usage_navigation_only === true, 'evidence_scope.usage_navigation_only must be true');
  expect(artifact.evidence_scope?.control_reconciliation_only === true, 'evidence_scope.control_reconciliation_only must be true');
  expect(allFalse(artifact.boundary), 'boundary values must all be false');
  expect(artifact.reconciliation?.control_edit_authorized === false, 'control edit must not be authorized');
  expect(
    artifact.reconciliation?.release_or_boundary_route_authorized === false,
    'release or boundary route must not be authorized',
  );
  expect(
    artifact.remaining_blocker?.blocker ===
      'top_level_agent10_direct_state_crossmatch_row_stale_until_agent10_refreshes_summary',
    'remaining blocker mismatch',
  );
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
