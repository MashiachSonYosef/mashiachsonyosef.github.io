#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const receiptPath = cleanRelativePath(process.argv[2] || 'reports/agent2-current-handoff-aggregate-validation-receipt-2026-06-04.json');
const receipt = readJson(receiptPath);
const issues = [];

expect(receipt.schema_version === '1.0', 'schema_version must be 1.0');
expect(receipt.artifact_type === 'agent2_current_handoff_aggregate_validation_receipt', 'unexpected artifact_type');
expect(receipt.status === 'passed_nonpublic_aggregate_validation', 'unexpected status');
expect(receipt.counts?.validator_commands === 20, 'validator_commands count must be 20');
expect(Array.isArray(receipt.validator_commands) && receipt.validator_commands.length === receipt.counts.validator_commands, 'validator command list/count mismatch');

for (const [key, relativePath] of Object.entries(receipt.validated_artifacts || {})) {
  requirePath(relativePath, `validated_artifacts.${key}`);
}

const manifest = readJson(receipt.validated_artifacts.spark1_manifest);
const outputReceipt = readJson(receipt.validated_artifacts.manifest_output_state_receipt);
const bundle = readJson(receipt.validated_artifacts.current_handoff_bundle);
const inventoryValidationReceipt = readJson(receipt.validated_artifacts.weekly_inventory_validation_receipt);
const blocker = readJson(receipt.validated_artifacts.next_workset_blocker);
const zeroReceipt = readJson(receipt.validated_artifacts.zero_boundary_audit_receipt);
const orotTbdInventory = readJson(receipt.validated_artifacts.orot_tbd_13_placeholder_inventory_consumption);
const oldDictionaryLaneIntake = readJson(receipt.validated_artifacts.old_dictionary_lane_planning_intake);
const staleReferenceScanReceipt = readJson(receipt.validated_artifacts.current_stale_reference_scan_receipt);
const lanePreservationReceipt = readJson(receipt.validated_artifacts.lane_preservation_handoff_receipt);
const broadInventoryReturn = readJson(receipt.validated_artifacts.broad_workbench_token_inventory_5000_return);
const orotZeroSafeBlocker = readJson(receipt.validated_artifacts.orot_zero_safe_pilot_upstream_claim_blocker);
const postAgent10Reconciliation = readJson(receipt.validated_artifacts.post_agent10_consumption_reconciliation);
const oldDictionaryPartitionMatrix = readJson(receipt.validated_artifacts.old_dictionary_lane_partition_transform_planning_matrix);

expect(manifest.runnable_pipelines?.length === receipt.counts.manifest_runnable_pipelines, 'manifest runnable pipeline count mismatch');
expect(manifest.validator_only_checks?.length === receipt.counts.manifest_validator_only_checks, 'manifest validator-only check count mismatch');
expect(outputReceipt.runnable_outputs_checked === receipt.counts.manifest_output_state_runnable_outputs_checked, 'output-state runnable count mismatch');
expect(outputReceipt.validator_only_states_checked === receipt.counts.manifest_output_state_validator_only_states_checked, 'output-state validator-only count mismatch');
expect(bundle.current_counts?.deuteronomy_phase2_rows === receipt.counts.deuteronomy_phase2_rows, 'bundle Deuteronomy row count mismatch');
expect(blocker.exact_blocker === 'no_new_agent2_exact_workset_after_deuteronomy_return', 'blocker exact blocker mismatch');
expect(zeroReceipt.artifacts_checked === receipt.counts.zero_boundary_artifacts_checked, 'zero-boundary artifact count mismatch');
expect(zeroReceipt.artifacts_checked === 22, 'zero-boundary artifact count must be 22');
expect(inventoryValidationReceipt.artifact_type === 'agent2_weekly_lexicon_pipeline_inventory_validation', 'inventory validation receipt artifact_type mismatch');
expect(inventoryValidationReceipt.counts?.pipeline_entries === 10, 'inventory validation receipt pipeline entry count mismatch');
expect(orotTbdInventory.artifact_type === 'agent2_orot_tbd_13_placeholder_inventory_consumption', 'Orot TBD inventory artifact_type mismatch');
expect(orotTbdInventory.counts?.display_integrity_tbd_rows === receipt.counts.orot_tbd_display_integrity_rows, 'Orot TBD row count mismatch');
expect(orotTbdInventory.counts?.display_integrity_tbd_occurrences === receipt.counts.orot_tbd_display_integrity_occurrences, 'Orot TBD occurrence count mismatch');
expect(orotTbdInventory.counts?.answer_rows_emitted === 0, 'Orot TBD answer rows must be 0');
expect(orotTbdInventory.counts?.public_hud_rows_emitted === 0, 'Orot TBD public HUD rows must be 0');
expect(orotTbdInventory.counts?.route_jsonl_rows_emitted === 0, 'Orot TBD route JSONL rows must be 0');
expect(oldDictionaryLaneIntake.artifact_type === 'agent2_old_dictionary_lane_planning_intake', 'old-dictionary lane intake artifact_type mismatch');
expect(oldDictionaryLaneIntake.planning_counts?.audited_rows === 500, 'old-dictionary lane intake audited row count mismatch');
expect(oldDictionaryLaneIntake.zero_output_counts?.candidate_rows_emitted === 0, 'old-dictionary lane intake candidate rows emitted must be 0');
expect(staleReferenceScanReceipt.artifact_type === 'agent2_current_stale_reference_scan_receipt', 'stale-reference scan artifact_type mismatch');
expect(staleReferenceScanReceipt.counts?.stale_reference_hits === 0, 'stale-reference scan must have 0 stale hits');
expect(lanePreservationReceipt.artifact_type === 'agent2_lane_preservation_handoff_receipt', 'lane-preservation receipt artifact_type mismatch');
expect(lanePreservationReceipt.lane_preservation?.unclassified_rows_consumed_as_candidate_text === 0, 'lane-preservation unclassified candidate text count must be 0');
expect(broadInventoryReturn.artifact_type === 'agent2_broad_workbench_token_inventory_5000_return', 'broad inventory return artifact_type mismatch');
expect(broadInventoryReturn.schema_counts?.inventory_top_tokens === 5000, 'broad inventory return top-token rows must be 5000');
expect(broadInventoryReturn.transform_candidate_counts?.candidate_text_rows === 0, 'broad inventory return candidate text rows must be 0');
expect(orotZeroSafeBlocker.artifact_type === 'agent2_orot_zero_safe_pilot_upstream_claim_blocker', 'Orot zero-safe blocker artifact_type mismatch');
expect(orotZeroSafeBlocker.counts?.target_rows === 100, 'Orot zero-safe blocker target rows must be 100');
expect(orotZeroSafeBlocker.transform_candidate_counts?.definition_route_claim_rows === 0, 'Orot zero-safe blocker claim rows must be 0');
expect(postAgent10Reconciliation.artifact_type === 'agent2_post_agent10_consumption_reconciliation', 'post-Agent10 reconciliation artifact_type mismatch');
expect(postAgent10Reconciliation.workset_status?.new_executable_workset_found === false, 'post-Agent10 reconciliation new executable workset must be false');
expect(oldDictionaryPartitionMatrix.artifact_type === 'agent2_old_dictionary_lane_partition_transform_planning_matrix', 'old-dictionary partition matrix artifact_type mismatch');
expect(oldDictionaryPartitionMatrix.matrix_counts?.source_family_rows === 5, 'old-dictionary partition matrix source-family rows must be 5');
expect(oldDictionaryPartitionMatrix.matrix_counts?.candidate_text_rows_now === 0, 'old-dictionary partition matrix candidate text rows must be 0');

for (const blockerId of receipt.current_exact_blockers || []) {
  expect(bundle.current_exact_blockers?.includes(blockerId) || blocker.standing_exact_blockers?.includes(blockerId) || blocker.exact_blocker === blockerId, `blocker not backed by bundle/blocker: ${blockerId}`);
}

for (const [key, value] of Object.entries(receipt.zero_boundary || {})) {
  expect(value === false, `zero_boundary.${key} must be false`);
}

if (issues.length) {
  console.error(`Agent 2 current handoff aggregate validation receipt failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 120)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 current handoff aggregate validation receipt passed. Validators: 20; runnable pipelines: 7; blockers: 6.');

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
