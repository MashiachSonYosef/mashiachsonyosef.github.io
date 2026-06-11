#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const receiptPath = cleanRelativePath(process.argv[2] || 'reports/agent2-spark1-command-manifest-validation-receipt-2026-06-04.json');
const receipt = readJson(receiptPath);
const issues = [];

expect(receipt.schema_version === '1.0', 'schema_version must be 1.0');
expect(receipt.artifact_type === 'agent2_spark1_command_manifest_validation_receipt', 'unexpected artifact_type');
expect(receipt.validation_result?.status === 'passed', 'validation_result.status must be passed');
expect(receipt.runnable_pipeline_count === 7, 'runnable_pipeline_count must be 7');
expect(receipt.validator_only_check_count === 24, 'validator_only_check_count must be 24');

const manifest = readRequired(receipt.validated_manifest, 'validated_manifest');
expect(manifest.artifact_type === 'agent2_spark1_runnable_command_manifest', 'validated manifest artifact_type mismatch');
expect(manifest.runnable_pipelines?.length === receipt.runnable_pipeline_count, 'manifest runnable pipeline count mismatch');
expect(manifest.validator_only_checks?.length === receipt.validator_only_check_count, 'manifest validator-only count mismatch');

for (const id of [
  'deuteronomy_phase2_transform_readiness',
  'deuteronomy_phase2_partition_export_plan',
  'orot_missed_dictionary_reader_hint_candidates',
  'definition_workbench_1000_sample',
  'definition_workbench_usage_joined_sample_planning',
  'current_route_scan_receipt_refresh',
  'next_workset_blocker_refresh',
]) {
  expect(receipt.runnable_pipeline_ids?.includes(id), `runnable_pipeline_ids must include ${id}`);
}

for (const id of [
  'source_lane_assignment_preflight_fixture',
  'weekly_pipeline_inventory',
  'orot_counterpart_hint_patch_preview',
  'spark1_manifest_outputs',
  'spark1_manifest_output_state_validation_receipt',
  'spark1_command_manifest_validation_receipt',
  'weekly_lexicon_current_handoff_bundle',
  'next_workset_needed_after_deuteronomy_return',
  'current_route_scan_receipt',
  'weekly_zero_boundary_audit',
  'spark1_execution_order_contract',
  'spark1_execution_order_validation_receipt',
  'current_handoff_aggregate_validation_receipt',
  'future_workset_intake_fixture',
  'future_workset_intake_contract',
]) {
  expect(receipt.validator_only_check_ids?.includes(id), `validator_only_check_ids must include ${id}`);
}

const counts = receipt.counts_preserved || {};
expect(counts.deuteronomy_phase2_rows === 1334, 'deuteronomy_phase2_rows must be 1334');
expect(counts.deuteronomy_phase2_occurrences === 2964, 'deuteronomy_phase2_occurrences must be 2964');
expect(counts.deuteronomy_partition_plan_rows === 1334, 'deuteronomy_partition_plan_rows must be 1334');
expect(counts.deuteronomy_partition_plan_occurrences === 2964, 'deuteronomy_partition_plan_occurrences must be 2964');
expect(counts.deuteronomy_partition_plan_candidate_text_export_rows === 0, 'partition candidate text export rows must be 0');
expect(counts.deuteronomy_partition_plan_answer_eligible_rows === 0, 'partition answer eligible rows must be 0');
expect(counts.deuteronomy_partition_plan_public_emit_rows === 0, 'partition public emit rows must be 0');
expect(counts.orot_missed_dictionary_unmatched === 168, 'Orot unmatched must be 168');
expect(counts.definition_workbench_sample_rows === 1000, 'Workbench sample rows must be 1000');

for (const blocker of [
  'old_dictionary_candidate_text_consumption_export_storage_requires_new_exact_agent6_boundary',
  'missing_larger_token_inventory_workset',
  'missing_joined_definition_workbench_sample_artifact_contract',
  'orot_counterpart_preview_not_promotable_without_agent1_source_lane_and_agent6_boundary',
  'no_new_agent2_exact_workset_after_deuteronomy_return',
]) {
  expect(receipt.standing_blockers?.includes(blocker), `standing_blockers must include ${blocker}`);
}

for (const [key, value] of Object.entries(receipt.zero_boundary || {})) {
  expect(value === false, `zero_boundary.${key} must be false`);
}

if (issues.length) {
  console.error(`Agent 2 Spark-1 command manifest validation receipt failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 120)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 Spark-1 command manifest validation receipt passed. Runnable pipelines: 7; validator-only checks: 24.');

function readRequired(relativePath, label) {
  requirePath(relativePath, label);
  return readJson(relativePath);
}

function requirePath(relativePath, label) {
  expect(typeof relativePath === 'string' && relativePath.length > 0, `${label} path is required`);
  if (relativePath) expect(fs.existsSync(path.join(root, cleanRelativePath(relativePath))), `${label} path does not exist: ${relativePath}`);
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}
