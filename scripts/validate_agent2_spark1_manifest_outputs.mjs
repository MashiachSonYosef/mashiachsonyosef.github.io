#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifestPath = cleanRelativePath(process.argv[2] || 'reports/agent2-spark1-runnable-command-manifest-2026-06-04.json');
const manifest = readJson(manifestPath);
const issues = [];

if (manifest.artifact_type !== 'agent2_spark1_runnable_command_manifest') {
  throw new Error(`${manifestPath} is not an Agent 2 Spark-1 runnable command manifest`);
}

for (const pipeline of manifest.runnable_pipelines || []) {
  validatePipelineOutput(pipeline);
}

for (const check of manifest.validator_only_checks || []) {
  if (check.id === 'spark1_manifest_outputs') continue;
  validateValidatorOnlyCheck(check);
}

if (issues.length) {
  console.error(`Agent 2 Spark-1 manifest output-state validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 160)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 2 Spark-1 manifest output-state validation passed. Runnable outputs checked: ${manifest.runnable_pipelines.length}; validator-only states checked: ${(manifest.validator_only_checks || []).length - 1}.`);

function validatePipelineOutput(pipeline) {
  const outputPath = outputPathFromValidateCommand(pipeline.validate);
  requirePath(outputPath, `${pipeline.id}.output`);
  const artifact = readJson(outputPath);
  const expected = pipeline.expected_counts || {};

  if (pipeline.id === 'deuteronomy_phase2_transform_readiness') {
    expect(artifact.artifact_type === 'agent2_deuteronomy_phase2_transform_readiness_matrix', `${pipeline.id} artifact_type mismatch`);
    expect(artifact.counts?.rows === expected.rows, `${pipeline.id} rows mismatch`);
    expect(artifact.counts?.occurrences === expected.occurrences, `${pipeline.id} occurrences mismatch`);
    expect(artifact.counts?.commercial_clean_candidate_rows === expected.commercial_clean_candidate_rows, `${pipeline.id} commercial rows mismatch`);
    expect(artifact.counts?.noncommercial_educational_candidate_rows === expected.noncommercial_educational_candidate_rows, `${pipeline.id} NC rows mismatch`);
    validateZeroCounters(artifact.zero_emission_counters, pipeline.id);
    expect(artifact.counts?.answer_eligible_rows === 0, `${pipeline.id} answer_eligible_rows must be 0`);
    expect(artifact.counts?.public_emit_rows === 0, `${pipeline.id} public_emit_rows must be 0`);
    return;
  }

  if (pipeline.id === 'deuteronomy_phase2_partition_export_plan') {
    expect(artifact.artifact_type === 'agent2_deuteronomy_phase2_partition_export_plan', `${pipeline.id} artifact_type mismatch`);
    expect(artifact.counts?.rows === expected.rows, `${pipeline.id} rows mismatch`);
    expect(artifact.counts?.occurrences === expected.occurrences, `${pipeline.id} occurrences mismatch`);
    expect(artifact.counts?.commercial_clean_candidate_rows === expected.commercial_clean_candidate_rows, `${pipeline.id} commercial rows mismatch`);
    expect(artifact.counts?.noncommercial_educational_candidate_rows === expected.noncommercial_educational_candidate_rows, `${pipeline.id} NC rows mismatch`);
    expect(artifact.counts?.candidate_text_export_rows === expected.candidate_text_export_rows, `${pipeline.id} candidate_text_export_rows mismatch`);
    expect(artifact.counts?.answer_eligible_rows === expected.answer_eligible_rows, `${pipeline.id} answer_eligible_rows mismatch`);
    expect(artifact.counts?.public_emit_rows === expected.public_emit_rows, `${pipeline.id} public_emit_rows mismatch`);
    validateZeroCounters(artifact.zero_emission_counters, pipeline.id);
    return;
  }

  if (pipeline.id === 'orot_missed_dictionary_reader_hint_candidates') {
    expect(artifact.artifact_type === 'agent2_orot_missed_dictionary_reader_hint_candidates', `${pipeline.id} artifact_type mismatch`);
    expect(artifact.summary?.candidate_rows === expected.rows, `${pipeline.id} candidate rows mismatch`);
    expect(artifact.summary?.candidate_occurrences === expected.occurrences, `${pipeline.id} candidate occurrences mismatch`);
    expect(artifact.source_license_counts?.unmatched === expected.unmatched, `${pipeline.id} unmatched mismatch`);
    expect(artifact.source_family_lane_preflight?.required === true, `${pipeline.id} source-family lane preflight must be required`);
    return;
  }

  if (pipeline.id === 'definition_workbench_1000_sample') {
    expect(artifact.artifact_type === 'definition_workbench_sample', `${pipeline.id} artifact_type mismatch`);
    expect(artifact.counts?.rows === expected.rows, `${pipeline.id} rows mismatch`);
    expect(artifact.counts?.rows_with_route_cards === expected.rows_with_route_cards, `${pipeline.id} route-card rows mismatch`);
    expect(artifact.counts?.rows_without_route_cards === expected.no_hint_repair_targets, `${pipeline.id} no-hint repair targets mismatch`);
    expect(artifact.counts?.review_status_counts?.unreviewed_machine_sample === expected.rows, `${pipeline.id} review_status must remain unreviewed_machine_sample`);
    expect(artifact.publication_boundary?.boundary_status === 'blocked_no_render', `${pipeline.id} publication boundary must remain blocked_no_render`);
    return;
  }

  if (pipeline.id === 'definition_workbench_usage_joined_sample_planning') {
    expect(artifact.artifact_type === 'agent2_definition_workbench_usage_joined_sample_planning', `${pipeline.id} artifact_type mismatch`);
    expect(artifact.counts?.projected_rows === expected.projected_rows, `${pipeline.id} projected rows mismatch`);
    expect(artifact.counts?.selected_occurrence_links === expected.occurrence_links, `${pipeline.id} occurrence links mismatch`);
    expect(artifact.counts?.route_ids === expected.route_ids, `${pipeline.id} route IDs mismatch`);
    expect(artifact.counts?.reader_facing_rows === 0, `${pipeline.id} reader-facing rows must be 0`);
    expect(artifact.counts?.answer_eligible_rows === 0, `${pipeline.id} answer_eligible_rows must be 0`);
    expect(artifact.counts?.public_rows_emitted === 0, `${pipeline.id} public_rows_emitted must be 0`);
    return;
  }

  if (pipeline.id === 'current_route_scan_receipt_refresh') {
    expect(artifact.artifact_type === 'agent2_current_route_scan_receipt', `${pipeline.id} artifact_type mismatch`);
    expect(artifact.scan_status === 'no_new_agent2_exact_workset_found', `${pipeline.id} scan_status mismatch`);
    expect(artifact.latest_agent10_agent2_consumption?.candidate_rows === expected.candidate_rows, `${pipeline.id} candidate rows mismatch`);
    expect(artifact.latest_agent10_agent2_consumption?.candidate_occurrences === expected.candidate_occurrences, `${pipeline.id} candidate occurrences mismatch`);
    expect(artifact.latest_agent10_agent2_consumption?.unmatched_rows === expected.unmatched_rows, `${pipeline.id} unmatched rows mismatch`);
    expect(artifact.latest_agent10_agent2_consumption?.agent6_route_needed_now === expected.agent6_route_needed_now, `${pipeline.id} Agent 6 route mismatch`);
    for (const [key, value] of Object.entries(artifact.zero_boundary || {})) {
      expect(value === false, `${pipeline.id}.zero_boundary.${key} must be false`);
    }
    return;
  }

  if (pipeline.id === 'next_workset_blocker_refresh') {
    expect(artifact.artifact_type === 'agent2_next_workset_needed_after_deuteronomy_return', `${pipeline.id} artifact_type mismatch`);
    expect(artifact.exact_blocker === 'no_new_agent2_exact_workset_after_deuteronomy_return', `${pipeline.id} exact blocker mismatch`);
    expect(artifact.latest_agent10_agent2_zero_candidate_consumption?.candidate_rows === expected.candidate_rows, `${pipeline.id} candidate rows mismatch`);
    expect(artifact.latest_agent10_agent2_zero_candidate_consumption?.candidate_occurrences === expected.candidate_occurrences, `${pipeline.id} candidate occurrences mismatch`);
    expect(artifact.latest_agent10_agent2_zero_candidate_consumption?.unmatched_rows === expected.unmatched_rows, `${pipeline.id} unmatched rows mismatch`);
    expect(artifact.latest_agent10_agent2_zero_candidate_consumption?.agent6_route_needed_now === expected.agent6_route_needed_now, `${pipeline.id} Agent 6 route mismatch`);
    return;
  }

  issues.push(`unhandled runnable pipeline id: ${pipeline.id}`);
}

function validateValidatorOnlyCheck(check) {
  const targetPath = outputPathFromValidateCommand(check.command);
  requirePath(targetPath, `${check.id}.target`);
  const artifact = readJson(targetPath);
  if (check.id === 'source_lane_assignment_preflight_fixture') {
    expect(artifact.workset === 'old-dictionary-excluded-row-license-lane-reaudit', `${check.id} workset mismatch`);
    for (const lane of ['commercial_clean_candidate', 'noncommercial_educational_candidate', 'metadata_or_link_only', 'blocked_or_needs_review']) {
      expect(artifact.lane_counts?.[lane] === 1, `${check.id} lane ${lane} count must be 1`);
    }
    return;
  }
  if (check.id === 'weekly_pipeline_inventory') {
    expect(artifact.artifact_type === 'agent2_weekly_lexicon_pipeline_inventory', `${check.id} artifact_type mismatch`);
    expect(Boolean(artifact.pipelines?.deuteronomy_phase2_partition_export_plan), `${check.id} must include deuteronomy partition/export plan`);
    return;
  }
  if (check.id === 'orot_counterpart_hint_patch_preview') {
    expect(artifact.artifact_type === 'agent2_orot_counterpart_hint_patch_preview', `${check.id} artifact_type mismatch`);
    expect(artifact.summary?.candidate_preview_rows === 31, `${check.id} rows must be 31`);
    expect(artifact.summary?.candidate_preview_occurrences === 1202, `${check.id} occurrences must be 1202`);
    expect(artifact.summary?.approved_patch_rows === 0, `${check.id} approved_patch_rows must be 0`);
    expect(artifact.summary?.answer_rows_emitted === 0, `${check.id} answer rows must be 0`);
    expect(artifact.summary?.public_hud_rows_emitted === 0, `${check.id} public HUD rows must be 0`);
    return;
  }
  if (check.id === 'spark1_command_manifest_validation_receipt') {
    expect(artifact.artifact_type === 'agent2_spark1_command_manifest_validation_receipt', `${check.id} artifact_type mismatch`);
    expect(artifact.validation_result?.status === 'passed', `${check.id} status must be passed`);
    expect(artifact.runnable_pipeline_count === 7, `${check.id} runnable pipeline count must be 7`);
    expect(artifact.validator_only_check_count === 24, `${check.id} validator-only check count must be 24`);
    return;
  }
  if (check.id === 'spark1_manifest_output_state_validation_receipt') {
    expect(artifact.artifact_type === 'agent2_spark1_manifest_output_state_validation_receipt', `${check.id} artifact_type mismatch`);
    expect(artifact.validation_result?.status === 'passed', `${check.id} status must be passed`);
    expect(artifact.runnable_outputs_checked === 7, `${check.id} runnable outputs checked must be 7`);
    expect(artifact.validator_only_states_checked === 23, `${check.id} validator-only states checked must be 23`);
    return;
  }
  if (check.id === 'weekly_lexicon_current_handoff_bundle') {
    expect(artifact.artifact_type === 'agent2_weekly_lexicon_current_handoff_bundle', `${check.id} artifact_type mismatch`);
    expect(artifact.current_counts?.runnable_pipelines === 7, `${check.id} runnable pipeline count must be 7`);
    expect(artifact.current_counts?.validator_only_checks === 24, `${check.id} validator-only check count must be 24`);
    return;
  }
  if (check.id === 'next_workset_needed_after_deuteronomy_return') {
    expect(artifact.artifact_type === 'agent2_next_workset_needed_after_deuteronomy_return', `${check.id} artifact_type mismatch`);
    expect(artifact.exact_blocker === 'no_new_agent2_exact_workset_after_deuteronomy_return', `${check.id} exact blocker mismatch`);
    return;
  }
  if (check.id === 'current_route_scan_receipt') {
    expect(artifact.artifact_type === 'agent2_current_route_scan_receipt', `${check.id} artifact_type mismatch`);
    expect(artifact.scan_status === 'no_new_agent2_exact_workset_found', `${check.id} scan_status mismatch`);
    return;
  }
  if (check.id === 'weekly_zero_boundary_audit') {
    expect(artifact.artifact_type === 'agent2_weekly_lexicon_current_handoff_bundle', `${check.id} target artifact_type mismatch`);
    expect(artifact.zero_boundary?.definition_authority === false, `${check.id} definition authority boundary must be false`);
    return;
  }
  if (check.id === 'spark1_execution_order_contract') {
    expect(artifact.artifact_type === 'agent2_spark1_execution_order_contract', `${check.id} artifact_type mismatch`);
    expect(artifact.counts?.non_mutating_validation_commands === 8, `${check.id} validation command count must be 8`);
    expect(artifact.execution_policy?.public_mutation_allowed === false, `${check.id} public mutation must be false`);
    return;
  }
  if (check.id === 'spark1_execution_order_validation_receipt') {
    expect(artifact.artifact_type === 'agent2_spark1_execution_order_validation_receipt', `${check.id} artifact_type mismatch`);
    expect(artifact.validation_result?.status === 'passed', `${check.id} status must be passed`);
    expect(artifact.validation_commands === 8, `${check.id} validation command count must be 8`);
    expect(artifact.builder_phase_gated === true, `${check.id} builder phase must be gated`);
    return;
  }
  if (check.id === 'current_handoff_aggregate_validation_receipt') {
    expect(artifact.artifact_type === 'agent2_current_handoff_aggregate_validation_receipt', `${check.id} artifact_type mismatch`);
    expect(artifact.status === 'passed_nonpublic_aggregate_validation', `${check.id} status mismatch`);
    expect(artifact.counts?.validator_commands === 20, `${check.id} validator command count must be 20`);
    return;
  }
  if (check.id === 'old_dictionary_lane_planning_intake') {
    expect(artifact.artifact_type === 'agent2_old_dictionary_lane_planning_intake', `${check.id} artifact_type mismatch`);
    expect(artifact.status === 'old_dictionary_lane_planning_evidence_intaked_nonpublic_only', `${check.id} status mismatch`);
    expect(artifact.planning_counts?.audited_rows === 500, `${check.id} audited rows must be 500`);
    expect(artifact.planning_counts?.next_missed_rows === 50, `${check.id} next-missed rows must be 50`);
    expect(artifact.zero_output_counts?.candidate_rows_emitted === 0, `${check.id} candidate rows emitted must be 0`);
    return;
  }
  if (check.id === 'weekly_lexicon_script_syntax_receipt') {
    expect(artifact.artifact_type === 'agent2_weekly_lexicon_script_syntax_receipt', `${check.id} artifact_type mismatch`);
    expect(artifact.counts?.runnable_pipelines === 7, `${check.id} runnable pipeline count must be 7`);
    expect(artifact.counts?.validator_only_checks === 24, `${check.id} validator-only check count must be 24`);
    expect(artifact.counts?.scripts_checked >= 30, `${check.id} scripts checked must be at least 30`);
    return;
  }
  if (check.id === 'weekly_pipeline_inventory_validation_receipt') {
    expect(artifact.artifact_type === 'agent2_weekly_lexicon_pipeline_inventory_validation', `${check.id} artifact_type mismatch`);
    expect(artifact.counts?.pipeline_entries === 10, `${check.id} pipeline entries must be 10`);
    expect(artifact.counts?.old_dictionary_planning_rows === 500, `${check.id} old-dictionary planning rows must be 500`);
    expect(artifact.counts?.spark1_validator_only_states_checked === 23, `${check.id} validator-only states must be 23`);
    return;
  }
  if (check.id === 'current_stale_reference_scan_receipt') {
    expect(artifact.artifact_type === 'agent2_current_stale_reference_scan_receipt', `${check.id} artifact_type mismatch`);
    expect(artifact.status === 'passed_current_surface_stale_reference_scan', `${check.id} status mismatch`);
    expect(artifact.counts?.current_surfaces_checked === 21, `${check.id} current surfaces checked must be 21`);
    expect(artifact.counts?.stale_reference_hits === 0, `${check.id} stale reference hits must be 0`);
    return;
  }
  if (check.id === 'lane_preservation_handoff_receipt') {
    expect(artifact.artifact_type === 'agent2_lane_preservation_handoff_receipt', `${check.id} artifact_type mismatch`);
    expect(artifact.schema_counts?.deuteronomy_commercial_clean_candidate_rows === 1334, `${check.id} commercial-clean rows must be 1334`);
    expect(artifact.schema_counts?.deuteronomy_noncommercial_educational_candidate_rows === 0, `${check.id} NC rows must be 0`);
    expect(artifact.lane_preservation?.unclassified_rows_consumed_as_candidate_text === 0, `${check.id} unclassified candidate-text rows must be 0`);
    return;
  }
  if (check.id === 'broad_workbench_token_inventory_5000_return') {
    expect(artifact.artifact_type === 'agent2_broad_workbench_token_inventory_5000_return', `${check.id} artifact_type mismatch`);
    expect(artifact.schema_counts?.inventory_top_tokens === 5000, `${check.id} inventory top-token rows must be 5000`);
    expect(artifact.schema_counts?.inventory_distinct_normalized_tokens === 698873, `${check.id} distinct token rows must be 698873`);
    expect(artifact.transform_candidate_counts?.candidate_text_rows === 0, `${check.id} candidate text rows must be 0`);
    return;
  }
  if (check.id === 'orot_zero_safe_pilot_upstream_claim_blocker') {
    expect(artifact.artifact_type === 'agent2_orot_zero_safe_pilot_upstream_claim_blocker', `${check.id} artifact_type mismatch`);
    expect(artifact.counts?.target_rows === 100, `${check.id} target rows must be 100`);
    expect(artifact.counts?.source_clean_rows === 87, `${check.id} source-clean rows must be 87`);
    expect(artifact.counts?.source_blocked_rows === 13, `${check.id} source-blocked rows must be 13`);
    expect(artifact.transform_candidate_counts?.definition_route_claim_rows === 0, `${check.id} definition route claim rows must be 0`);
    return;
  }
  if (check.id === 'post_agent10_consumption_reconciliation') {
    expect(artifact.artifact_type === 'agent2_post_agent10_consumption_reconciliation', `${check.id} artifact_type mismatch`);
    expect(artifact.workset_status?.new_executable_workset_found === false, `${check.id} new executable workset must be false`);
    expect(artifact.current_agent2_chain_counts?.validator_only_checks === 24, `${check.id} validator-only checks must be 24`);
    expect(artifact.zero_emission_counters?.answer_rows === 0, `${check.id} answer rows must be 0`);
    return;
  }
  if (check.id === 'old_dictionary_lane_partition_transform_planning_matrix') {
    expect(artifact.artifact_type === 'agent2_old_dictionary_lane_partition_transform_planning_matrix', `${check.id} artifact_type mismatch`);
    expect(artifact.matrix_counts?.source_family_rows === 5, `${check.id} source-family rows must be 5`);
    expect(artifact.matrix_counts?.candidate_text_rows_now === 0, `${check.id} candidate text rows must be 0`);
    return;
  }
  if (check.id === 'future_workset_intake_fixture') {
    expect(artifact.artifact_type === 'agent2_future_workset_intake_packet', `${check.id} artifact_type mismatch`);
    expect(artifact.workset_id === 'fixture-next-agent2-workset-shape', `${check.id} workset id mismatch`);
    expect(artifact.zero_boundary?.definition_authority === false, `${check.id} zero boundary mismatch`);
    return;
  }
  if (check.id === 'future_workset_intake_contract') {
    expect(artifact.artifact_type === 'agent2_future_workset_intake_contract', `${check.id} artifact_type mismatch`);
    expect(artifact.status === 'future_workset_intake_gate_ready', `${check.id} status mismatch`);
    expect(artifact.zero_boundary?.definition_authority === false, `${check.id} zero boundary mismatch`);
    return;
  }
  issues.push(`unhandled validator-only check id: ${check.id}`);
}

function outputPathFromValidateCommand(command) {
  if (typeof command !== 'string' || !command.startsWith('node ')) {
    throw new Error(`Only node commands are allowed in this validation gate: ${command}`);
  }
  const parts = command.split(/\s+/);
  const candidates = parts.slice(2).filter((part) => /^(reports|data)\//.test(part) && !part.includes('='));
  if (candidates.length !== 1) throw new Error(`Expected one positional output path in command: ${command}`);
  return cleanRelativePath(candidates[0]);
}

function validateZeroCounters(counters, context) {
  for (const [key, value] of Object.entries(counters || {})) {
    expect(value === 0, `${context}.zero_emission_counters.${key} must be 0`);
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
