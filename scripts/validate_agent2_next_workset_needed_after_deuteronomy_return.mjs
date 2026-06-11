#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const blockerPath = cleanRelativePath(process.argv[2] || 'reports/agent2-next-workset-needed-after-deuteronomy-return-2026-06-04.json');
const blocker = readJson(blockerPath);
const issues = [];

expect(blocker.schema_version === '1.0', 'schema_version must be 1.0');
expect(blocker.artifact_type === 'agent2_next_workset_needed_after_deuteronomy_return', 'unexpected artifact_type');
expect(blocker.status === 'no_new_agent2_exact_workset_after_deuteronomy_return', 'unexpected status');
expect(blocker.exact_blocker === 'no_new_agent2_exact_workset_after_deuteronomy_return', 'exact blocker mismatch');

for (const p of blocker.latest_agent10_agent2_executable_route_found || []) requirePath(p, `latest route ${p}`);
for (const p of blocker.agent2_returned_outputs || []) requirePath(p, `returned output ${p}`);

expect(blocker.latest_agent10_agent2_executable_route_found?.includes('reports/agent10-agent2-orot-missed-dictionary-zero-candidate-consumption-2026-06-04.json'), 'latest route rows must include Orot zero-candidate consumption JSON');
expect(blocker.agent2_returned_outputs?.includes('reports/agent2-deuteronomy-phase2-partition-export-plan-2026-06-04.json'), 'returned outputs must include partition export plan JSON');
expect(blocker.agent2_returned_outputs?.includes('reports/agent2-deuteronomy-phase2-partition-export-plan-2026-06-04.md'), 'returned outputs must include partition export plan report');

validateInventory(blocker.validated_inventory);
validateBundle(blocker.current_handoff_bundle);
validateManifestGate(blocker.spark1_manifest_output_state_gate);
validateRouteScan(blocker.current_route_scan_receipt);
validateZeroCandidateConsumption(blocker.latest_agent10_agent2_zero_candidate_consumption);
validateRestoredRequiredOutputShape(blocker.restored_required_output_shape);

for (const required of [
  'old_dictionary_candidate_text_consumption_export_storage_requires_new_exact_agent6_boundary',
  'missing_larger_token_inventory_workset',
  'missing_joined_definition_workbench_sample_artifact_contract',
  'orot_counterpart_preview_not_promotable_without_agent1_source_lane_and_agent6_boundary',
  'no_new_agent2_exact_workset_after_deuteronomy_return',
]) {
  expect(blocker.standing_exact_blockers?.includes(required), `standing_exact_blockers must include ${required}`);
}

for (const required of [
  'target work/book/subset',
  'exact input artifact paths',
  'command or expected script',
  'output schema',
  'validator/gate',
  'source-family lane fields where dictionary/source rows are involved',
  'stop condition preserving zero authority/public/answer emissions',
]) {
  expect(blocker.required_next_workset_shape?.includes(required), `required_next_workset_shape must include ${required}`);
}

const boundaryText = JSON.stringify(blocker.what_must_not_be_accepted || []);
for (const required of ['Definition authority', 'answer eligibility', 'public reader output', 'route-shard edit', 'NC commercial authorization']) {
  expect(boundaryText.includes(required), `what_must_not_be_accepted must include ${required}`);
}

if (issues.length) {
  console.error(`Agent 2 next-workset blocker validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 120)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 next-workset blocker validation passed. Current bundle and Spark-1 output-state gate referenced.');

function validateInventory(entry) {
  requirePath(entry?.inventory, 'validated_inventory.inventory');
  requirePath(entry?.validator, 'validated_inventory.validator');
  expect(entry?.result === 'passed', 'validated_inventory result must be passed');
  expect(String(entry?.stdout || '').includes('partition plan'), 'validated_inventory stdout must mention partition plan');
  expect(String(entry?.stdout || '').includes('Spark-1 output-state gate'), 'validated_inventory stdout must mention Spark-1 output-state gate');
}

function validateBundle(entry) {
  requirePath(entry?.bundle, 'current_handoff_bundle.bundle');
  requirePath(entry?.validator, 'current_handoff_bundle.validator');
  expect(entry?.result === 'passed', 'current_handoff_bundle result must be passed');
  const bundle = entry?.bundle ? readJson(entry.bundle) : null;
  expect(bundle?.artifact_type === 'agent2_weekly_lexicon_current_handoff_bundle', 'current handoff bundle artifact_type mismatch');
  expect(bundle?.current_counts?.runnable_pipelines === 7, 'bundle runnable pipeline count must be 7');
  expect(bundle?.current_exact_blockers?.includes('no_new_agent2_exact_workset_after_deuteronomy_return'), 'bundle must include no-new-workset blocker');
}

function validateManifestGate(entry) {
  requirePath(entry?.manifest, 'spark1_manifest_output_state_gate.manifest');
  requirePath(entry?.validator, 'spark1_manifest_output_state_gate.validator');
  requirePath(entry?.receipt, 'spark1_manifest_output_state_gate.receipt');
  expect(entry?.result === 'passed', 'spark1_manifest_output_state_gate result must be passed');
  const receipt = entry?.receipt ? readJson(entry.receipt) : null;
  expect(receipt?.artifact_type === 'agent2_spark1_manifest_output_state_validation_receipt', 'Spark-1 gate receipt artifact_type mismatch');
  expect(receipt?.runnable_outputs_checked === 7, 'Spark-1 gate receipt runnable outputs must be 7');
  expect(receipt?.validator_only_states_checked === 23, 'Spark-1 gate receipt validator-only states must be 23');
}

function validateRouteScan(entry) {
  requirePath(entry?.receipt, 'current_route_scan_receipt.receipt');
  requirePath(entry?.validator, 'current_route_scan_receipt.validator');
  expect(entry?.result === 'passed', 'current_route_scan_receipt result must be passed');
  const receipt = entry?.receipt ? readJson(entry.receipt) : null;
  expect(receipt?.artifact_type === 'agent2_current_route_scan_receipt', 'current route scan receipt artifact_type mismatch');
  expect(receipt?.scan_status === 'no_new_agent2_exact_workset_found', 'current route scan receipt status mismatch');
}

function validateZeroCandidateConsumption(entry) {
  requirePath(entry?.artifact, 'latest_agent10_agent2_zero_candidate_consumption.artifact');
  expect(entry?.status === 'consumed_zero_candidate_return_no_agent6_route', 'zero-candidate consumption status mismatch');
  expect(entry?.candidate_rows === 0, 'zero-candidate consumption candidate_rows must be 0');
  expect(entry?.candidate_occurrences === 0, 'zero-candidate consumption candidate_occurrences must be 0');
  expect(entry?.unmatched_rows === 168, 'zero-candidate consumption unmatched_rows must be 168');
  expect(entry?.agent6_route_needed_now === false, 'zero-candidate consumption must not open Agent 6 route');
  expect(String(entry?.release_owner_next_action || '').includes('changed source-family/linkage/dictionary evidence'), 'zero-candidate consumption next action must require changed evidence');
}

function validateRestoredRequiredOutputShape(shape) {
  expect(shape?.workset === 'no_new_agent2_exact_workset_after_deuteronomy_return', 'required output shape workset mismatch');
  expect(shape?.input_rows?.deuteronomy_phase2_rows === 1334, 'required output shape Deuteronomy input rows must be 1334');
  expect(shape?.input_rows?.old_dictionary_lane_planning_rows === 500, 'required output shape old-dictionary planning rows must be 500');
  expect(shape?.input_rows?.orot_missed_dictionary_unmatched_rows === 168, 'required output shape Orot unmatched rows must be 168');
  expect(shape?.lane_split?.deuteronomy_commercial_clean_candidate_rows === 1334, 'required output shape commercial-clean rows must be 1334');
  expect(shape?.lane_split?.deuteronomy_noncommercial_educational_candidate_rows === 0, 'required output shape NC rows must be 0');
  expect(shape?.lane_split?.unclassified_rows_consumed_as_candidate_text === 0, 'required output shape unclassified consumed rows must be 0');
  expect(shape?.transform_candidate_counts?.orot_missed_dictionary_candidate_rows === 0, 'required output shape Orot candidate rows must be 0');
  for (const [key, value] of Object.entries(shape?.zero_emission_counters || {})) {
    expect(value === 0, `required output shape zero_emission_counters.${key} must be 0`);
  }
  expect(shape?.blocker_rows?.orot_unmatched_rows_requiring_changed_source_family_linkage_dictionary_evidence === 168, 'required output shape Orot blocker rows must be 168');
  expect(shape?.validator === 'scripts/validate_agent2_next_workset_needed_after_deuteronomy_return.mjs', 'required output shape validator mismatch');
  expect(String(shape?.handoff_owner || '').includes('Agent 10 first'), 'required output shape handoff owner must name Agent 10 first');
  expect(String(shape?.stop_condition || '').includes('new target/workset/input/schema/validator'), 'required output shape stop condition must require new workset details');
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
