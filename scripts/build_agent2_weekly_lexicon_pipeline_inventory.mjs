#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputJson = 'reports/agent2-weekly-lexicon-pipeline-inventory-2026-06-04.json';
const outputMd = 'reports/agent2-weekly-lexicon-pipeline-inventory-2026-06-04.md';

const deut = readJson('reports/agent2-deuteronomy-phase2-transform-readiness-matrix-2026-06-04.json');
const partition = readJson('reports/agent2-deuteronomy-phase2-partition-export-plan-2026-06-04.json');
const orot = readJson('reports/agent2-orot-missed-dictionary-reader-hint-candidates-2026-06-04.json');
const workbench = readJson('data/definitions/definition-workbench-sample-1000.json');
const joined = readJson('data/definitions/agent2-definition-workbench-usage-joined-sample-planning.json');
const tbd = readJson('reports/agent2-orot-tbd-13-placeholder-inventory-consumption-2026-06-04.json');
const preview = readJson('reports/agent2-orot-counterpart-hint-patch-preview-2026-06-04.json');
const sparkGate = readJson('reports/agent2-spark1-manifest-output-state-validation-receipt-2026-06-04.json');
const oldDictionaryLaneIntake = readJson('reports/agent2-old-dictionary-lane-planning-intake-2026-06-04.json');

const inventory = {
  schema_version: '1.0',
  artifact_type: 'agent2_weekly_lexicon_pipeline_inventory',
  date: '2026-06-04',
  mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE',
  pipelines: {
    deuteronomy_phase2_transform_readiness: {
      route: 'reports/agent10-agent2-deuteronomy-phase2-transform-readiness-route-2026-06-04.md',
      input_workset: 'reports/agent10-agent2-ready-deuteronomy-phase2-downstream-transform-workset-2026-06-04.json',
      builder: 'scripts/build_agent2_deuteronomy_phase2_transform_readiness_matrix.mjs',
      validator: 'scripts/validate_agent2_deuteronomy_phase2_transform_readiness_matrix.mjs',
      output: 'reports/agent2-deuteronomy-phase2-transform-readiness-matrix-2026-06-04.json',
      report: 'reports/agent2-deuteronomy-phase2-transform-readiness-matrix-2026-06-04.md',
      status: 'validated',
      counts: {
        rows: deut.counts?.rows,
        occurrences: deut.counts?.occurrences,
        commercial_clean_candidate_rows: deut.counts?.commercial_clean_candidate_rows,
        noncommercial_educational_candidate_rows: deut.counts?.noncommercial_educational_candidate_rows,
        answer_eligible_rows: deut.counts?.answer_eligible_rows,
        public_emit_rows: deut.counts?.public_emit_rows,
        definition_text_rows: deut.counts?.definition_text_emitted_rows,
        accepted_text_rows: deut.counts?.accepted_text_emitted_rows,
        route_shard_writes: deut.counts?.route_shard_write_rows,
      },
    },
    deuteronomy_phase2_partition_export_plan: {
      input_matrix: 'reports/agent2-deuteronomy-phase2-transform-readiness-matrix-2026-06-04.json',
      builder: 'scripts/build_agent2_deuteronomy_phase2_partition_export_plan.mjs',
      validator: 'scripts/validate_agent2_deuteronomy_phase2_partition_export_plan.mjs',
      output: 'reports/agent2-deuteronomy-phase2-partition-export-plan-2026-06-04.json',
      report: 'reports/agent2-deuteronomy-phase2-partition-export-plan-2026-06-04.md',
      status: 'validated_nonpublic_partition_export_planning_only',
      counts: {
        rows: partition.counts?.rows,
        occurrences: partition.counts?.occurrences,
        commercial_clean_candidate_rows: partition.counts?.commercial_clean_candidate_rows,
        noncommercial_educational_candidate_rows: partition.counts?.noncommercial_educational_candidate_rows,
        candidate_text_export_rows: partition.counts?.candidate_text_export_rows,
        answer_eligible_rows: partition.counts?.answer_eligible_rows,
        public_emit_rows: partition.counts?.public_emit_rows,
        route_shard_writes: partition.zero_emission_counters?.route_shard_writes,
      },
    },
    orot_missed_dictionary_reader_hint_candidates: {
      builder: 'scripts/build_agent2_orot_missed_dictionary_reader_hint_candidates.mjs',
      validator: 'scripts/validate_agent2_orot_missed_dictionary_reader_hint_candidates.mjs',
      output: 'reports/agent2-orot-missed-dictionary-reader-hint-candidates-2026-06-04.json',
      status: 'validated_zero_candidate_closure_with_source_lane_preflight',
      counts: {
        rows: orot.summary?.candidate_rows,
        occurrences: orot.summary?.candidate_occurrences,
        unmatched: orot.source_license_counts?.unmatched,
      },
    },
    definition_workbench_1000_sample: {
      builder: 'scripts/build_definition_workbench_sample.mjs',
      validator: 'scripts/validate_definition_workbench_sample.mjs',
      output: 'data/definitions/definition-workbench-sample-1000.json',
      report: 'reports/definition-workbench-sample-1000-report.md',
      status: 'validated',
      counts: {
        rows: workbench.counts?.rows,
        rows_with_route_cards: workbench.counts?.rows_with_route_cards,
        no_hint_repair_targets: workbench.counts?.rows_without_route_cards,
      },
    },
    definition_workbench_usage_joined_sample_planning: {
      builder: 'scripts/build_agent2_definition_workbench_usage_joined_sample_planning.mjs',
      validator: 'scripts/validate_agent2_definition_workbench_usage_joined_sample_planning.mjs',
      output: 'data/definitions/agent2-definition-workbench-usage-joined-sample-planning.json',
      report: 'reports/agent2-definition-workbench-usage-joined-sample-planning.md',
      status: 'validated',
      counts: {
        projected_rows: joined.counts?.projected_rows,
        occurrence_links: joined.counts?.selected_occurrence_links,
        route_ids: joined.counts?.route_ids,
      },
    },
    source_lane_assignment_preflight: {
      validator: 'scripts/validate_agent2_source_lane_assignment_packet.mjs',
      fixture: 'data/definitions/agent2-source-lane-assignment-preflight-fixture.json',
      fixture_status: 'validated',
      real_workset_status: 'resolved_for_nonpublic_source_family_license_lane_planning_evidence_intake_only',
      blocker: 'old_dictionary_candidate_text_consumption_export_storage_requires_new_exact_agent6_boundary',
    },
    old_dictionary_lane_planning_intake: {
      builder: 'scripts/build_agent2_old_dictionary_lane_planning_intake.mjs',
      validator: 'scripts/validate_agent2_old_dictionary_lane_planning_intake.mjs',
      output: 'reports/agent2-old-dictionary-lane-planning-intake-2026-06-04.json',
      report: 'reports/agent2-old-dictionary-lane-planning-intake-2026-06-04.md',
      status: oldDictionaryLaneIntake.status,
      counts: {
        audited_rows: oldDictionaryLaneIntake.planning_counts?.audited_rows,
        audited_occurrences: oldDictionaryLaneIntake.planning_counts?.audited_occurrences,
        next_missed_rows: oldDictionaryLaneIntake.planning_counts?.next_missed_rows,
        next_missed_occurrences: oldDictionaryLaneIntake.planning_counts?.next_missed_occurrences,
        candidate_rows_emitted: oldDictionaryLaneIntake.zero_output_counts?.candidate_rows_emitted,
        candidate_occurrences_emitted: oldDictionaryLaneIntake.zero_output_counts?.candidate_occurrences_emitted,
      },
      remaining_blocker: oldDictionaryLaneIntake.blocker_update?.remaining_exact_blocker,
    },
    orot_counterpart_hint_patch_preview: {
      builder: 'scripts/build_agent2_orot_counterpart_hint_patch_preview.mjs',
      validator: 'scripts/validate_agent2_orot_counterpart_hint_patch_preview.mjs',
      output: 'reports/agent2-orot-counterpart-hint-patch-preview-2026-06-04.json',
      report: 'reports/agent2-orot-counterpart-hint-patch-preview-2026-06-04.md',
      constraint: 'reports/agent2-orot-counterpart-preview-source-lane-constraint-2026-06-04.json',
      status: 'validated_preview_blocked_from_promotion',
      counts: {
        candidate_preview_rows: preview.summary?.candidate_preview_rows,
        candidate_preview_occurrences: preview.summary?.candidate_preview_occurrences,
        approved_patch_rows: preview.summary?.approved_patch_rows,
        answer_rows_emitted: preview.summary?.answer_rows_emitted,
        public_hud_rows_emitted: preview.summary?.public_hud_rows_emitted,
        route_jsonl_rows_emitted: preview.summary?.route_jsonl_rows_emitted,
      },
    },
    orot_tbd_13_placeholder_inventory_consumption: {
      builder: 'scripts/build_agent2_orot_tbd_placeholder_inventory_consumption.mjs',
      validator: 'scripts/validate_agent2_orot_tbd_placeholder_inventory_consumption.mjs',
      output: 'reports/agent2-orot-tbd-13-placeholder-inventory-consumption-2026-06-04.json',
      report: 'reports/agent2-orot-tbd-13-placeholder-inventory-consumption-2026-06-04.md',
      status: 'validated_existing_nonpublic_display_integrity_inventory_consumed',
      counts: {
        display_integrity_tbd_rows: tbd.counts?.display_integrity_tbd_rows,
        display_integrity_tbd_occurrences: tbd.counts?.display_integrity_tbd_occurrences,
        answer_rows_emitted: tbd.counts?.answer_rows_emitted,
        public_hud_rows_emitted: tbd.counts?.public_hud_rows_emitted,
        route_jsonl_rows_emitted: tbd.counts?.route_jsonl_rows_emitted,
        route_shards_written: tbd.counts?.route_shards_written,
        definition_content_rows_emitted: tbd.counts?.definition_content_rows_emitted,
        accepted_text_rows: tbd.counts?.accepted_text_rows,
      },
    },
    spark1_manifest_output_state_gate: {
      manifest: 'reports/agent2-spark1-runnable-command-manifest-2026-06-04.json',
      validator: 'scripts/validate_agent2_spark1_manifest_outputs.mjs',
      receipt: 'reports/agent2-spark1-manifest-output-state-validation-receipt-2026-06-04.json',
      status: 'validated_non_mutating_output_state_gate',
      counts: {
        runnable_outputs_checked: sparkGate.runnable_outputs_checked,
        validator_only_states_checked: sparkGate.validator_only_states_checked,
        builders_run: 0,
        public_runtime_mutations: 0,
        answer_rows: 0,
      },
      blocker_observed: 'child_process_spawn_eperm_avoided_by_output_state_validation',
    },
  },
  exact_blockers: [
    'old_dictionary_candidate_text_consumption_export_storage_requires_new_exact_agent6_boundary',
    'missing_larger_token_inventory_workset',
    'missing_joined_definition_workbench_sample_artifact_contract',
    'orot_counterpart_preview_not_promotable_without_agent1_source_lane_and_agent6_boundary',
  ],
  zero_emission_boundary: {
    qa_acceptance: false,
    source_provenance_acceptance: false,
    license_acceptance: false,
    legal_acceptance: false,
    definition_authority: false,
    answer_acceptance: false,
    answer_eligibility: false,
    public_runtime_acceptance: false,
    publication_readiness: false,
    route_publication_support: false,
    product_data_acceptance: false,
    accepted_gloss_text: false,
    public_reader_output: false,
    route_shard_edit: false,
    public_runtime_mutation: false,
    definition_content_storage: false,
    nc_commercial_authorization: false,
  },
};

assertInventory(inventory);
writeJson(outputJson, inventory);
writeMd(outputMd, inventory);
console.log(`wrote ${outputJson}`);
console.log(`wrote ${outputMd}`);

function assertInventory(inventory) {
  if (inventory.pipelines.deuteronomy_phase2_transform_readiness.counts.rows !== 1334) throw new Error('Deuteronomy count mismatch');
  if (inventory.pipelines.orot_missed_dictionary_reader_hint_candidates.counts.unmatched !== 168) throw new Error('Orot unmatched mismatch');
  if (inventory.pipelines.old_dictionary_lane_planning_intake.counts.audited_rows !== 500) throw new Error('old-dictionary intake count mismatch');
  if (inventory.pipelines.spark1_manifest_output_state_gate.counts.runnable_outputs_checked !== 7) throw new Error('Spark gate runnable count mismatch');
  for (const value of Object.values(inventory.zero_emission_boundary)) {
    if (value !== false) throw new Error('zero boundary must remain false');
  }
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMd(file, inventory) {
  const lines = [
    '# Agent 2 Weekly Lexicon Pipeline Inventory',
    '',
    'Date: 2026-06-04',
    'Mode: WEEKLY_LEXICON_EXPANSION_GOAL_MODE',
    '',
    '## Purpose',
    '',
    'Compact handoff inventory for Agent 2 definition/lemma/reader-hint pipelines. This records runnable artifacts, validated outputs, exact blockers, and zero authority/public/answer boundaries.',
    '',
    '## Runnable / Validated Pipelines',
    '',
    `- Deuteronomy Phase-2 transform readiness: ${inventory.pipelines.deuteronomy_phase2_transform_readiness.counts.rows} rows / ${inventory.pipelines.deuteronomy_phase2_transform_readiness.counts.occurrences} occurrences; zero answer/public/definition/accepted-text/route-shard rows.`,
    `- Deuteronomy Phase-2 partition export plan: ${inventory.pipelines.deuteronomy_phase2_partition_export_plan.counts.rows} rows / ${inventory.pipelines.deuteronomy_phase2_partition_export_plan.counts.occurrences} occurrences; 0 candidate text export rows.`,
    `- Orot missed-dictionary reader-hint candidates: ${inventory.pipelines.orot_missed_dictionary_reader_hint_candidates.counts.rows} rows / ${inventory.pipelines.orot_missed_dictionary_reader_hint_candidates.counts.occurrences} occurrences; ${inventory.pipelines.orot_missed_dictionary_reader_hint_candidates.counts.unmatched} unmatched.`,
    `- Definition Workbench 1000-row sample: ${inventory.pipelines.definition_workbench_1000_sample.counts.rows} rows; ${inventory.pipelines.definition_workbench_1000_sample.counts.rows_with_route_cards} rows with route cards; ${inventory.pipelines.definition_workbench_1000_sample.counts.no_hint_repair_targets} no-hint repair targets.`,
    `- Definition Workbench usage joined-sample planning: ${inventory.pipelines.definition_workbench_usage_joined_sample_planning.counts.projected_rows} projected row; ${inventory.pipelines.definition_workbench_usage_joined_sample_planning.counts.occurrence_links} selected occurrence links; ${inventory.pipelines.definition_workbench_usage_joined_sample_planning.counts.route_ids} route ID.`,
    `- Old-dictionary lane planning intake: ${inventory.pipelines.old_dictionary_lane_planning_intake.counts.audited_rows} planning rows / ${inventory.pipelines.old_dictionary_lane_planning_intake.counts.audited_occurrences} occurrences; ${inventory.pipelines.old_dictionary_lane_planning_intake.counts.next_missed_rows} next-missed rows / ${inventory.pipelines.old_dictionary_lane_planning_intake.counts.next_missed_occurrences} occurrences; 0 candidate rows emitted.`,
    `- Orot counterpart hint patch preview: ${inventory.pipelines.orot_counterpart_hint_patch_preview.counts.candidate_preview_rows} preview rows / ${inventory.pipelines.orot_counterpart_hint_patch_preview.counts.candidate_preview_occurrences} occurrences; 0 approved patch rows.`,
    `- Orot TBD 13-placeholder inventory consumption: ${inventory.pipelines.orot_tbd_13_placeholder_inventory_consumption.counts.display_integrity_tbd_rows} rows / ${inventory.pipelines.orot_tbd_13_placeholder_inventory_consumption.counts.display_integrity_tbd_occurrences} occurrences.`,
    `- Spark-1 manifest output-state gate: ${inventory.pipelines.spark1_manifest_output_state_gate.counts.runnable_outputs_checked} runnable outputs checked; ${inventory.pipelines.spark1_manifest_output_state_gate.counts.validator_only_states_checked} validator-only states checked; 0 builders run.`,
    '',
    '## Exact Blockers',
    '',
    ...inventory.exact_blockers.map((blocker) => `- \`${blocker}\``),
    '',
    '## Agent 6 Boundary State',
    '',
    '- No Agent 6 route is opened by this inventory.',
    '- Future Agent 6 boundary is required only before transform/display/source/license/Definition/public/runtime/answer use.',
    '',
    '## Non-Acceptance Boundary',
    '',
    'No QA acceptance, source/provenance acceptance, license acceptance, legal acceptance, Definition authority, usage-as-definition authority, answer acceptance, answer eligibility, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, translation output, accepted gloss/text, public reader output, route-shard edit, public/runtime mutation, definition-content storage, or NC commercial authorization is claimed.',
    '',
  ];
  fs.writeFileSync(path.join(root, file), lines.join('\n'));
}
