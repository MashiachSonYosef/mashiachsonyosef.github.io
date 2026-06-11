#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const inventoryPath = cleanRelativePath(process.argv[2] || 'reports/agent2-weekly-lexicon-pipeline-inventory-2026-06-04.json');
const inventory = readJson(inventoryPath);
const issues = [];

expect(inventory.schema_version === '1.0', 'schema_version must be 1.0');
expect(inventory.artifact_type === 'agent2_weekly_lexicon_pipeline_inventory', 'unexpected artifact_type');
expect(inventory.mode === 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE', 'unexpected mode');

validateDeuteronomy(inventory.pipelines?.deuteronomy_phase2_transform_readiness);
validateDeuteronomyPartitionPlan(inventory.pipelines?.deuteronomy_phase2_partition_export_plan);
validateOrot(inventory.pipelines?.orot_missed_dictionary_reader_hint_candidates);
validateWorkbench1000(inventory.pipelines?.definition_workbench_1000_sample);
validateJoinedPlanning(inventory.pipelines?.definition_workbench_usage_joined_sample_planning);
validateSourceLanePreflight(inventory.pipelines?.source_lane_assignment_preflight);
validateOldDictionaryLanePlanningIntake(inventory.pipelines?.old_dictionary_lane_planning_intake);
validateOrotCounterpartPreview(inventory.pipelines?.orot_counterpart_hint_patch_preview);
validateOrotTbdInventoryConsumption(inventory.pipelines?.orot_tbd_13_placeholder_inventory_consumption);
validateSpark1ManifestOutputStateGate(inventory.pipelines?.spark1_manifest_output_state_gate);
validateBlockers(inventory.exact_blockers || []);
validateZeroBoundary(inventory.zero_emission_boundary || {});

if (issues.length) {
  console.error(`Agent 2 weekly lexicon pipeline inventory validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 160)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 weekly lexicon pipeline inventory validation passed.');
console.log('Checked: Deuteronomy 1334/2964 readiness and partition plan, Orot zero-candidate closure, Orot TBD 13-row inventory consumption, Workbench 1000 sample, joined planning, source-lane fixture, Spark-1 output-state gate, blockers, zero boundary.');

function validateDeuteronomy(entry) {
  expect(entry, 'deuteronomy_phase2_transform_readiness entry is required');
  requirePath(entry?.route, 'deuteronomy.route');
  requirePath(entry?.input_workset, 'deuteronomy.input_workset');
  requirePath(entry?.builder, 'deuteronomy.builder');
  requirePath(entry?.validator, 'deuteronomy.validator');
  requirePath(entry?.output, 'deuteronomy.output');
  requirePath(entry?.report, 'deuteronomy.report');
  const matrix = entry?.output ? readJson(entry.output) : null;
  if (!matrix) return;
  expect(matrix.artifact_type === 'agent2_deuteronomy_phase2_transform_readiness_matrix', 'deuteronomy output artifact_type mismatch');
  expect(matrix.counts?.rows === 1334, 'deuteronomy rows must be 1334');
  expect(matrix.counts?.occurrences === 2964, 'deuteronomy occurrences must be 2964');
  expect(matrix.counts?.commercial_clean_candidate_rows === 1334, 'deuteronomy commercial rows must be 1334');
  expect(matrix.counts?.noncommercial_educational_candidate_rows === 0, 'deuteronomy NC rows must be 0');
  expect(matrix.counts?.answer_eligible_rows === 0, 'deuteronomy answer_eligible_rows must be 0');
  expect(matrix.counts?.public_emit_rows === 0, 'deuteronomy public_emit_rows must be 0');
  expect(matrix.counts?.definition_text_emitted_rows === 0, 'deuteronomy definition_text_emitted_rows must be 0');
  expect(matrix.counts?.accepted_text_emitted_rows === 0, 'deuteronomy accepted_text_emitted_rows must be 0');
  expect(matrix.counts?.route_shard_write_rows === 0, 'deuteronomy route_shard_write_rows must be 0');
  for (const [key, value] of Object.entries(matrix.zero_emission_counters || {})) {
    expect(value === 0, `deuteronomy zero_emission_counters.${key} must be 0`);
  }
}

function validateDeuteronomyPartitionPlan(entry) {
  expect(entry, 'deuteronomy_phase2_partition_export_plan entry is required');
  requirePath(entry?.input_matrix, 'deuteronomyPartition.input_matrix');
  requirePath(entry?.builder, 'deuteronomyPartition.builder');
  requirePath(entry?.validator, 'deuteronomyPartition.validator');
  requirePath(entry?.output, 'deuteronomyPartition.output');
  requirePath(entry?.report, 'deuteronomyPartition.report');
  const plan = entry?.output ? readJson(entry.output) : null;
  if (!plan) return;
  expect(plan.artifact_type === 'agent2_deuteronomy_phase2_partition_export_plan', 'deuteronomy partition output artifact_type mismatch');
  expect(plan.counts?.rows === 1334, 'deuteronomy partition rows must be 1334');
  expect(plan.counts?.occurrences === 2964, 'deuteronomy partition occurrences must be 2964');
  expect(plan.counts?.commercial_clean_candidate_rows === 1334, 'deuteronomy partition commercial rows must be 1334');
  expect(plan.counts?.noncommercial_educational_candidate_rows === 0, 'deuteronomy partition NC rows must be 0');
  expect(plan.counts?.candidate_text_export_rows === 0, 'deuteronomy partition candidate_text_export_rows must be 0');
  expect(plan.counts?.answer_eligible_rows === 0, 'deuteronomy partition answer_eligible_rows must be 0');
  expect(plan.counts?.public_emit_rows === 0, 'deuteronomy partition public_emit_rows must be 0');
  for (const [key, value] of Object.entries(plan.zero_emission_counters || {})) {
    expect(value === 0, `deuteronomy partition zero_emission_counters.${key} must be 0`);
  }
}

function validateOrot(entry) {
  expect(entry, 'orot_missed_dictionary_reader_hint_candidates entry is required');
  requirePath(entry?.builder, 'orot.builder');
  requirePath(entry?.validator, 'orot.validator');
  requirePath(entry?.output, 'orot.output');
  const packet = entry?.output ? readJson(entry.output) : null;
  if (!packet) return;
  expect(packet.artifact_type === 'agent2_orot_missed_dictionary_reader_hint_candidates', 'Orot artifact_type mismatch');
  expect(packet.summary?.candidate_rows === 0, 'Orot candidate rows must remain 0 on current inputs');
  expect(packet.summary?.candidate_occurrences === 0, 'Orot candidate occurrences must remain 0 on current inputs');
  expect(packet.source_family_lane_preflight?.required === true, 'Orot source-family lane preflight must be required');
  expect(packet.source_license_counts?.unmatched === 168, 'Orot unmatched count must be 168');
}

function validateWorkbench1000(entry) {
  expect(entry, 'definition_workbench_1000_sample entry is required');
  requirePath(entry?.builder, 'workbench1000.builder');
  requirePath(entry?.validator, 'workbench1000.validator');
  requirePath(entry?.output, 'workbench1000.output');
  requirePath(entry?.report, 'workbench1000.report');
  const sample = entry?.output ? readJson(entry.output) : null;
  if (!sample) return;
  expect(sample.artifact_type === 'definition_workbench_sample', 'Workbench 1000 artifact_type mismatch');
  expect(sample.counts?.rows === 1000, 'Workbench 1000 rows must be 1000');
  expect(sample.counts?.rows_with_route_cards === 996, 'Workbench 1000 route-card rows must be 996');
  expect(sample.counts?.rows_without_route_cards === 4, 'Workbench 1000 no-hint rows must be 4');
  expect(sample.counts?.review_status_counts?.unreviewed_machine_sample === 1000, 'Workbench 1000 review_status must remain unreviewed_machine_sample');
  expect(sample.publication_boundary?.boundary_status === 'blocked_no_render', 'Workbench 1000 publication boundary must be blocked_no_render');
}

function validateJoinedPlanning(entry) {
  expect(entry, 'definition_workbench_usage_joined_sample_planning entry is required');
  requirePath(entry?.builder, 'joinedPlanning.builder');
  requirePath(entry?.validator, 'joinedPlanning.validator');
  requirePath(entry?.output, 'joinedPlanning.output');
  requirePath(entry?.report, 'joinedPlanning.report');
  const packet = entry?.output ? readJson(entry.output) : null;
  if (!packet) return;
  expect(packet.artifact_type === 'agent2_definition_workbench_usage_joined_sample_planning', 'joined planning artifact_type mismatch');
  expect(packet.counts?.projected_rows === 1, 'joined planning projected_rows must be 1');
  expect(packet.counts?.selected_occurrence_links === 12, 'joined planning occurrence links must be 12');
  expect(packet.counts?.route_ids === 1, 'joined planning route_ids must be 1');
  expect(packet.counts?.reader_facing_rows === 0, 'joined planning reader_facing_rows must be 0');
  expect(packet.counts?.answer_eligible_rows === 0, 'joined planning answer_eligible_rows must be 0');
  expect(packet.counts?.public_rows_emitted === 0, 'joined planning public_rows_emitted must be 0');
}

function validateSourceLanePreflight(entry) {
  expect(entry, 'source_lane_assignment_preflight entry is required');
  requirePath(entry?.validator, 'sourceLane.validator');
  requirePath(entry?.fixture, 'sourceLane.fixture');
  const fixture = entry?.fixture ? readJson(entry.fixture) : null;
  if (!fixture) return;
  expect(fixture.workset === 'old-dictionary-excluded-row-license-lane-reaudit', 'source-lane fixture workset mismatch');
  const laneCounts = fixture.lane_counts || {};
  for (const lane of ['commercial_clean_candidate', 'noncommercial_educational_candidate', 'metadata_or_link_only', 'blocked_or_needs_review']) {
    expect(laneCounts[lane] === 1, `source-lane fixture ${lane} count must be 1`);
  }
  expect(entry.real_workset_status === 'resolved_for_nonpublic_source_family_license_lane_planning_evidence_intake_only', 'source-lane real workset status must reflect planning-only intake resolution');
  expect(entry.blocker === 'old_dictionary_candidate_text_consumption_export_storage_requires_new_exact_agent6_boundary', 'source-lane blocker must require exact Agent 6 boundary for candidate text use');
}

function validateOldDictionaryLanePlanningIntake(entry) {
  expect(entry, 'old_dictionary_lane_planning_intake entry is required');
  requirePath(entry?.builder, 'oldDictionaryLaneIntake.builder');
  requirePath(entry?.validator, 'oldDictionaryLaneIntake.validator');
  requirePath(entry?.output, 'oldDictionaryLaneIntake.output');
  requirePath(entry?.report, 'oldDictionaryLaneIntake.report');
  const intake = entry?.output ? readJson(entry.output) : null;
  if (!intake) return;
  expect(intake.artifact_type === 'agent2_old_dictionary_lane_planning_intake', 'old-dictionary intake artifact_type mismatch');
  expect(intake.status === 'old_dictionary_lane_planning_evidence_intaked_nonpublic_only', 'old-dictionary intake status mismatch');
  expect(intake.planning_counts?.audited_rows === 500, 'old-dictionary intake audited_rows must be 500');
  expect(intake.planning_counts?.audited_occurrences === 8427, 'old-dictionary intake audited_occurrences must be 8427');
  expect(intake.planning_counts?.next_missed_rows === 50, 'old-dictionary intake next_missed_rows must be 50');
  expect(intake.planning_counts?.next_missed_occurrences === 1193, 'old-dictionary intake next_missed_occurrences must be 1193');
  expect(intake.zero_output_counts?.candidate_rows_emitted === 0, 'old-dictionary intake candidate rows emitted must be 0');
  expect(intake.zero_output_counts?.candidate_occurrences_emitted === 0, 'old-dictionary intake candidate occurrences emitted must be 0');
  expect(intake.blocker_update?.remaining_exact_blocker === 'old_dictionary_candidate_text_consumption_export_storage_requires_new_exact_agent6_boundary', 'old-dictionary intake remaining blocker mismatch');
}

function validateOrotCounterpartPreview(entry) {
  expect(entry, 'orot_counterpart_hint_patch_preview entry is required');
  requirePath(entry?.builder, 'orotCounterpart.builder');
  requirePath(entry?.validator, 'orotCounterpart.validator');
  requirePath(entry?.output, 'orotCounterpart.output');
  requirePath(entry?.report, 'orotCounterpart.report');
  requirePath(entry?.constraint, 'orotCounterpart.constraint');
  const preview = entry?.output ? readJson(entry.output) : null;
  const constraint = entry?.constraint ? readJson(entry.constraint) : null;
  if (!preview || !constraint) return;
  expect(preview.artifact_type === 'agent2_orot_counterpart_hint_patch_preview', 'Orot counterpart preview artifact_type mismatch');
  expect(preview.summary?.candidate_preview_rows === 31, 'Orot counterpart preview rows must be 31');
  expect(preview.summary?.candidate_preview_occurrences === 1202, 'Orot counterpart preview occurrences must be 1202');
  expect(preview.summary?.approved_patch_rows === 0, 'Orot counterpart approved_patch_rows must be 0');
  expect(preview.summary?.answer_rows_emitted === 0, 'Orot counterpart answer rows must be 0');
  expect(preview.summary?.public_hud_rows_emitted === 0, 'Orot counterpart public HUD rows must be 0');
  expect(preview.summary?.route_jsonl_rows_emitted === 0, 'Orot counterpart route JSONL rows must be 0');
  expect(constraint.exact_blocker?.id === 'orot_counterpart_preview_not_promotable_without_agent1_source_lane_and_agent6_boundary', 'Orot counterpart constraint blocker mismatch');
}

function validateOrotTbdInventoryConsumption(entry) {
  expect(entry, 'orot_tbd_13_placeholder_inventory_consumption entry is required');
  requirePath(entry?.builder, 'orotTbd.builder');
  requirePath(entry?.validator, 'orotTbd.validator');
  requirePath(entry?.output, 'orotTbd.output');
  requirePath(entry?.report, 'orotTbd.report');
  const packet = entry?.output ? readJson(entry.output) : null;
  if (!packet) return;
  expect(packet.artifact_type === 'agent2_orot_tbd_13_placeholder_inventory_consumption', 'Orot TBD inventory artifact_type mismatch');
  expect(packet.counts?.display_integrity_tbd_rows === 13, 'Orot TBD inventory rows must be 13');
  expect(packet.counts?.display_integrity_tbd_occurrences === 129, 'Orot TBD inventory occurrences must be 129');
  expect(packet.counts?.answer_rows_emitted === 0, 'Orot TBD inventory answer rows must be 0');
  expect(packet.counts?.public_hud_rows_emitted === 0, 'Orot TBD inventory public HUD rows must be 0');
  expect(packet.counts?.route_jsonl_rows_emitted === 0, 'Orot TBD inventory route JSONL rows must be 0');
  expect(packet.counts?.route_shards_written === 0, 'Orot TBD inventory route shards written must be 0');
  expect(packet.counts?.definition_content_rows_emitted === 0, 'Orot TBD inventory definition content rows must be 0');
  expect(packet.counts?.accepted_text_rows === 0, 'Orot TBD inventory accepted text rows must be 0');
}

function validateSpark1ManifestOutputStateGate(entry) {
  expect(entry, 'spark1_manifest_output_state_gate entry is required');
  requirePath(entry?.manifest, 'spark1ManifestGate.manifest');
  requirePath(entry?.validator, 'spark1ManifestGate.validator');
  requirePath(entry?.receipt, 'spark1ManifestGate.receipt');
  const manifest = entry?.manifest ? readJson(entry.manifest) : null;
  const receipt = entry?.receipt ? readJson(entry.receipt) : null;
  if (!manifest || !receipt) return;
  expect(manifest.artifact_type === 'agent2_spark1_runnable_command_manifest', 'Spark-1 manifest artifact_type mismatch');
  expect(manifest.runnable_pipelines?.length === 7, 'Spark-1 manifest must have 7 runnable pipelines');
  expect(manifest.validator_only_checks?.length === 24, 'Spark-1 manifest must have 24 validator-only checks');
  expect(receipt.artifact_type === 'agent2_spark1_manifest_output_state_validation_receipt', 'Spark-1 output-state receipt artifact_type mismatch');
  expect(receipt.validation_result?.status === 'passed', 'Spark-1 output-state receipt must be passed');
  expect(receipt.runnable_outputs_checked === 7, 'Spark-1 output-state runnable outputs checked must be 7');
  expect(receipt.validator_only_states_checked === 23, 'Spark-1 output-state validator-only states checked must be 23');
  expect(receipt.non_mutating_gate === true, 'Spark-1 output-state gate must be non-mutating');
  for (const [key, value] of Object.entries(receipt.zero_boundary || {})) {
    expect(value === false, `Spark-1 output-state receipt zero_boundary.${key} must be false`);
  }
}

function validateBlockers(blockers) {
  for (const blocker of [
    'old_dictionary_candidate_text_consumption_export_storage_requires_new_exact_agent6_boundary',
    'missing_larger_token_inventory_workset',
    'missing_joined_definition_workbench_sample_artifact_contract',
    'orot_counterpart_preview_not_promotable_without_agent1_source_lane_and_agent6_boundary',
  ]) {
    expect(blockers.includes(blocker), `inventory exact_blockers must include ${blocker}`);
  }
}

function validateZeroBoundary(boundary) {
  for (const [key, value] of Object.entries(boundary)) {
    expect(value === false, `zero_emission_boundary.${key} must be false`);
  }
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
