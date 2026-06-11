#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const bundlePath = cleanRelativePath(process.argv[2] || 'reports/agent2-weekly-lexicon-current-handoff-bundle-2026-06-04.json');
const bundle = readJson(bundlePath);
const issues = [];

expect(bundle.schema_version === '1.0', 'schema_version must be 1.0');
expect(bundle.artifact_type === 'agent2_weekly_lexicon_current_handoff_bundle', 'unexpected artifact_type');
expect(bundle.status === 'current_nonpublic_pipeline_handoff_bundle_pre_agent6_boundary', 'unexpected status');

const manifest = readEntry('spark1_runnable_manifest');
requirePath(bundle.entrypoints?.spark1_runnable_manifest_builder, 'entrypoints.spark1_runnable_manifest_builder');
const inventory = readEntry('weekly_inventory');
requirePath(bundle.entrypoints?.weekly_inventory_builder, 'entrypoints.weekly_inventory_builder');
const inventoryValidationReceipt = readEntry('weekly_inventory_validation_receipt');
requirePath(bundle.entrypoints?.weekly_inventory_validation_receipt_builder, 'entrypoints.weekly_inventory_validation_receipt_builder');
requirePath(bundle.entrypoints?.weekly_inventory_validation_receipt_validator, 'entrypoints.weekly_inventory_validation_receipt_validator');
const scriptSyntaxReceipt = readEntry('weekly_script_syntax_receipt');
requirePath(bundle.entrypoints?.weekly_script_syntax_receipt_builder, 'entrypoints.weekly_script_syntax_receipt_builder');
requirePath(bundle.entrypoints?.weekly_script_syntax_receipt_validator, 'entrypoints.weekly_script_syntax_receipt_validator');
const outputReceipt = readEntry('manifest_output_state_receipt');
requirePath(bundle.entrypoints?.manifest_output_state_receipt_builder, 'entrypoints.manifest_output_state_receipt_builder');
requirePath(bundle.entrypoints?.manifest_output_state_receipt_validator, 'entrypoints.manifest_output_state_receipt_validator');
const manifestReceipt = readEntry('manifest_validation_receipt');
requirePath(bundle.entrypoints?.manifest_validation_receipt_builder, 'entrypoints.manifest_validation_receipt_builder');
requirePath(bundle.entrypoints?.manifest_validation_receipt_validator, 'entrypoints.manifest_validation_receipt_validator');
const routeScanReceipt = readEntry('current_route_scan_receipt');
requirePath(bundle.entrypoints?.current_route_scan_builder, 'entrypoints.current_route_scan_builder');
requirePath(bundle.entrypoints?.current_route_scan_receipt_validator, 'entrypoints.current_route_scan_receipt_validator');
const zeroBoundaryAuditReceipt = readEntry('zero_boundary_audit_receipt');
requirePath(bundle.entrypoints?.zero_boundary_audit_builder, 'entrypoints.zero_boundary_audit_builder');
requirePath(bundle.entrypoints?.zero_boundary_audit_validator, 'entrypoints.zero_boundary_audit_validator');
const executionOrderContract = readEntry('spark1_execution_order_contract');
requirePath(bundle.entrypoints?.spark1_execution_order_contract_builder, 'entrypoints.spark1_execution_order_contract_builder');
requirePath(bundle.entrypoints?.spark1_execution_order_contract_validator, 'entrypoints.spark1_execution_order_contract_validator');
const executionOrderReceipt = readEntry('spark1_execution_order_validation_receipt');
requirePath(bundle.entrypoints?.spark1_execution_order_validation_receipt_builder, 'entrypoints.spark1_execution_order_validation_receipt_builder');
requirePath(bundle.entrypoints?.spark1_execution_order_validation_receipt_validator, 'entrypoints.spark1_execution_order_validation_receipt_validator');
const aggregateReceipt = readEntry('current_handoff_aggregate_validation_receipt');
requirePath(bundle.entrypoints?.current_handoff_aggregate_validation_receipt_builder, 'entrypoints.current_handoff_aggregate_validation_receipt_builder');
requirePath(bundle.entrypoints?.current_handoff_aggregate_validation_receipt_validator, 'entrypoints.current_handoff_aggregate_validation_receipt_validator');
const futureWorksetContract = readEntry('future_workset_intake_contract');
const futureWorksetFixture = readEntry('future_workset_intake_fixture');
requirePath(bundle.entrypoints?.future_workset_intake_validator, 'entrypoints.future_workset_intake_validator');
requirePath(bundle.entrypoints?.future_workset_intake_contract_validator, 'entrypoints.future_workset_intake_contract_validator');
const orotTbdInventory = readEntry('orot_tbd_13_placeholder_inventory_consumption');
requirePath(bundle.entrypoints?.orot_tbd_13_placeholder_inventory_consumption_validator, 'entrypoints.orot_tbd_13_placeholder_inventory_consumption_validator');
const oldDictionaryLaneIntake = readEntry('old_dictionary_lane_planning_intake');
requirePath(bundle.entrypoints?.old_dictionary_lane_planning_intake_builder, 'entrypoints.old_dictionary_lane_planning_intake_builder');
requirePath(bundle.entrypoints?.old_dictionary_lane_planning_intake_validator, 'entrypoints.old_dictionary_lane_planning_intake_validator');
const staleReferenceScanReceipt = readEntry('current_stale_reference_scan_receipt');
requirePath(bundle.entrypoints?.current_stale_reference_scan_receipt_builder, 'entrypoints.current_stale_reference_scan_receipt_builder');
requirePath(bundle.entrypoints?.current_stale_reference_scan_receipt_validator, 'entrypoints.current_stale_reference_scan_receipt_validator');
const lanePreservationReceipt = readEntry('lane_preservation_handoff_receipt');
requirePath(bundle.entrypoints?.lane_preservation_handoff_receipt_builder, 'entrypoints.lane_preservation_handoff_receipt_builder');
requirePath(bundle.entrypoints?.lane_preservation_handoff_receipt_validator, 'entrypoints.lane_preservation_handoff_receipt_validator');
const broadInventoryReturn = readEntry('broad_workbench_token_inventory_5000_return');
requirePath(bundle.entrypoints?.broad_workbench_token_inventory_5000_return_builder, 'entrypoints.broad_workbench_token_inventory_5000_return_builder');
requirePath(bundle.entrypoints?.broad_workbench_token_inventory_5000_return_validator, 'entrypoints.broad_workbench_token_inventory_5000_return_validator');
const blocker = readEntry('next_workset_blocker');
requirePath(bundle.entrypoints?.next_workset_blocker_builder, 'entrypoints.next_workset_blocker_builder');
requirePath(bundle.entrypoints?.next_workset_blocker_validator, 'entrypoints.next_workset_blocker_validator');

expect(manifest?.artifact_type === 'agent2_spark1_runnable_command_manifest', 'manifest artifact_type mismatch');
expect(manifest?.runnable_pipelines?.length === bundle.current_counts?.runnable_pipelines, 'runnable pipeline count mismatch');
expect(manifest?.validator_only_checks?.length === bundle.current_counts?.validator_only_checks, 'validator-only check count mismatch');

expect(inventory?.artifact_type === 'agent2_weekly_lexicon_pipeline_inventory', 'inventory artifact_type mismatch');
expect(Boolean(inventory?.pipelines?.deuteronomy_phase2_partition_export_plan), 'inventory missing Deuteronomy partition plan');
expect(Boolean(inventory?.pipelines?.spark1_manifest_output_state_gate), 'inventory missing Spark-1 output-state gate');
expect(inventoryValidationReceipt?.artifact_type === 'agent2_weekly_lexicon_pipeline_inventory_validation', 'inventory validation receipt artifact_type mismatch');
expect(inventoryValidationReceipt?.counts?.pipeline_entries === 10, 'inventory validation receipt pipeline count mismatch');
expect(scriptSyntaxReceipt?.artifact_type === 'agent2_weekly_lexicon_script_syntax_receipt', 'script syntax receipt artifact_type mismatch');
expect(scriptSyntaxReceipt?.counts?.scripts_checked >= 38, 'script syntax receipt must cover current script set');

expect(outputReceipt?.artifact_type === 'agent2_spark1_manifest_output_state_validation_receipt', 'output-state receipt artifact_type mismatch');
expect(outputReceipt?.validation_result?.status === 'passed', 'output-state receipt must be passed');
expect(outputReceipt?.runnable_outputs_checked === bundle.current_counts?.runnable_outputs_checked, 'output-state runnable outputs checked mismatch');
expect(outputReceipt?.validator_only_states_checked === bundle.current_counts?.validator_only_states_checked, 'output-state validator-only states checked mismatch');
expect(outputReceipt?.non_mutating_gate === true, 'output-state receipt must be non-mutating');

expect(manifestReceipt?.artifact_type === 'agent2_spark1_command_manifest_validation_receipt', 'manifest receipt artifact_type mismatch');
expect(manifestReceipt?.validation_result?.status === 'passed', 'manifest receipt must be passed');
expect(manifestReceipt?.runnable_pipeline_count === bundle.current_counts?.runnable_pipelines, 'manifest receipt runnable count mismatch');
expect(manifestReceipt?.validator_only_check_count === bundle.current_counts?.validator_only_checks, 'manifest receipt validator-only count mismatch');

expect(blocker?.artifact_type === 'agent2_next_workset_needed_after_deuteronomy_return', 'next-workset blocker artifact_type mismatch');
expect(blocker?.exact_blocker === 'no_new_agent2_exact_workset_after_deuteronomy_return', 'next-workset blocker mismatch');
expect(routeScanReceipt?.artifact_type === 'agent2_current_route_scan_receipt', 'current route scan receipt artifact_type mismatch');
expect(routeScanReceipt?.scan_status === 'no_new_agent2_exact_workset_found', 'current route scan receipt status mismatch');
expect(zeroBoundaryAuditReceipt?.artifact_type === 'agent2_weekly_zero_boundary_audit_receipt', 'zero-boundary audit receipt artifact_type mismatch');
expect(zeroBoundaryAuditReceipt?.validation_result?.status === 'passed', 'zero-boundary audit receipt must be passed');
expect(zeroBoundaryAuditReceipt?.artifacts_checked === 22, 'zero-boundary audit must check 22 artifacts');
expect(executionOrderContract?.artifact_type === 'agent2_spark1_execution_order_contract', 'execution order contract artifact_type mismatch');
expect(executionOrderContract?.counts?.non_mutating_validation_commands === 8, 'execution order contract must have 8 validation commands');
expect(executionOrderReceipt?.artifact_type === 'agent2_spark1_execution_order_validation_receipt', 'execution order receipt artifact_type mismatch');
expect(executionOrderReceipt?.validation_result?.status === 'passed', 'execution order receipt must be passed');
expect(aggregateReceipt?.artifact_type === 'agent2_current_handoff_aggregate_validation_receipt', 'aggregate validation receipt artifact_type mismatch');
expect(aggregateReceipt?.status === 'passed_nonpublic_aggregate_validation', 'aggregate validation receipt status mismatch');
expect(futureWorksetContract?.artifact_type === 'agent2_future_workset_intake_contract', 'future workset intake contract artifact_type mismatch');
expect(futureWorksetContract?.status === 'future_workset_intake_gate_ready', 'future workset intake contract status mismatch');
expect(futureWorksetFixture?.artifact_type === 'agent2_future_workset_intake_packet', 'future workset intake fixture artifact_type mismatch');
expect(orotTbdInventory?.artifact_type === 'agent2_orot_tbd_13_placeholder_inventory_consumption', 'Orot TBD inventory artifact_type mismatch');
expect(orotTbdInventory?.counts?.display_integrity_tbd_rows === bundle.current_counts?.orot_tbd_display_integrity_rows, 'Orot TBD inventory row count mismatch');
expect(orotTbdInventory?.counts?.display_integrity_tbd_occurrences === bundle.current_counts?.orot_tbd_display_integrity_occurrences, 'Orot TBD inventory occurrence count mismatch');
expect(orotTbdInventory?.counts?.answer_rows_emitted === 0, 'Orot TBD inventory answer rows must be 0');
expect(orotTbdInventory?.counts?.public_hud_rows_emitted === 0, 'Orot TBD inventory public HUD rows must be 0');
expect(orotTbdInventory?.counts?.route_jsonl_rows_emitted === 0, 'Orot TBD inventory route JSONL rows must be 0');
expect(oldDictionaryLaneIntake?.artifact_type === 'agent2_old_dictionary_lane_planning_intake', 'old-dictionary lane intake artifact_type mismatch');
expect(oldDictionaryLaneIntake?.status === 'old_dictionary_lane_planning_evidence_intaked_nonpublic_only', 'old-dictionary lane intake status mismatch');
expect(oldDictionaryLaneIntake?.planning_counts?.audited_rows === bundle.current_counts?.old_dictionary_lane_planning_rows, 'old-dictionary lane intake row count mismatch');
expect(oldDictionaryLaneIntake?.planning_counts?.audited_occurrences === bundle.current_counts?.old_dictionary_lane_planning_occurrences, 'old-dictionary lane intake occurrence count mismatch');
expect(oldDictionaryLaneIntake?.planning_counts?.next_missed_rows === bundle.current_counts?.old_dictionary_next_missed_rows, 'old-dictionary next-missed row count mismatch');
expect(oldDictionaryLaneIntake?.zero_output_counts?.candidate_rows_emitted === 0, 'old-dictionary lane intake candidate rows emitted must be 0');
expect(oldDictionaryLaneIntake?.blocker_update?.remaining_exact_blocker === 'old_dictionary_candidate_text_consumption_export_storage_requires_new_exact_agent6_boundary', 'old-dictionary lane intake remaining blocker mismatch');
expect(staleReferenceScanReceipt?.artifact_type === 'agent2_current_stale_reference_scan_receipt', 'stale-reference scan receipt artifact_type mismatch');
expect(staleReferenceScanReceipt?.status === 'passed_current_surface_stale_reference_scan', 'stale-reference scan receipt status mismatch');
expect(staleReferenceScanReceipt?.counts?.current_surfaces_checked === 21, 'stale-reference scan surface count mismatch');
expect(staleReferenceScanReceipt?.counts?.stale_reference_hits === 0, 'stale-reference scan must have 0 hits');
expect(lanePreservationReceipt?.artifact_type === 'agent2_lane_preservation_handoff_receipt', 'lane-preservation receipt artifact_type mismatch');
expect(lanePreservationReceipt?.schema_counts?.deuteronomy_commercial_clean_candidate_rows === 1334, 'lane-preservation commercial-clean count mismatch');
expect(lanePreservationReceipt?.schema_counts?.deuteronomy_noncommercial_educational_candidate_rows === 0, 'lane-preservation NC count mismatch');
expect(lanePreservationReceipt?.lane_preservation?.unclassified_rows_consumed_as_candidate_text === 0, 'lane-preservation unclassified candidate-text count mismatch');
expect(broadInventoryReturn?.artifact_type === 'agent2_broad_workbench_token_inventory_5000_return', 'broad inventory return artifact_type mismatch');
expect(broadInventoryReturn?.schema_counts?.inventory_top_tokens === 5000, 'broad inventory top-token count mismatch');
expect(broadInventoryReturn?.schema_counts?.inventory_distinct_normalized_tokens === 698873, 'broad inventory distinct token count mismatch');
expect(broadInventoryReturn?.transform_candidate_counts?.candidate_text_rows === 0, 'broad inventory candidate text rows must be 0');

for (const required of bundle.current_exact_blockers || []) {
  const inManifest = manifest?.blocked_routes?.includes(required);
  const inInventory = inventory?.exact_blockers?.includes(required);
  const inBlocker = blocker?.standing_exact_blockers?.includes(required) || blocker?.exact_blocker === required;
  expect(inManifest || inInventory || inBlocker, `blocker not found in backing artifacts: ${required}`);
}

for (const [key, value] of Object.entries(bundle.zero_boundary || {})) {
  expect(value === false, `zero_boundary.${key} must be false`);
}

if (issues.length) {
  console.error(`Agent 2 weekly lexicon current handoff bundle validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 120)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 2 weekly lexicon current handoff bundle validation passed. Runnable pipelines: ${bundle.current_counts.runnable_pipelines}; blockers: ${bundle.current_exact_blockers.length}.`);

function readEntry(key) {
  const relativePath = bundle.entrypoints?.[key];
  requirePath(relativePath, `entrypoints.${key}`);
  return relativePath ? readJson(relativePath) : null;
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
