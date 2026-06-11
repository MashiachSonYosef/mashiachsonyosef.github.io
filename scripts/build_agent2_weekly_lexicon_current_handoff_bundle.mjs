#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputJson = 'reports/agent2-weekly-lexicon-current-handoff-bundle-2026-06-04.json';
const outputMd = 'reports/agent2-weekly-lexicon-current-handoff-bundle-2026-06-04.md';

const entrypoints = {
  spark1_runnable_manifest: 'reports/agent2-spark1-runnable-command-manifest-2026-06-04.json',
  spark1_runnable_manifest_builder: 'scripts/build_agent2_spark1_runnable_command_manifest.mjs',
  weekly_inventory: 'reports/agent2-weekly-lexicon-pipeline-inventory-2026-06-04.json',
  weekly_inventory_builder: 'scripts/build_agent2_weekly_lexicon_pipeline_inventory.mjs',
  weekly_inventory_validation_receipt: 'reports/agent2-weekly-lexicon-pipeline-inventory-validation-2026-06-04.json',
  weekly_inventory_validation_receipt_builder: 'scripts/build_agent2_weekly_lexicon_pipeline_inventory_validation.mjs',
  weekly_inventory_validation_receipt_validator: 'scripts/validate_agent2_weekly_lexicon_pipeline_inventory_validation.mjs',
  weekly_script_syntax_receipt: 'reports/agent2-weekly-lexicon-script-syntax-receipt-2026-06-04.json',
  weekly_script_syntax_receipt_builder: 'scripts/build_agent2_weekly_lexicon_script_syntax_receipt.mjs',
  weekly_script_syntax_receipt_validator: 'scripts/validate_agent2_weekly_lexicon_script_syntax_receipt.mjs',
  manifest_output_state_receipt: 'reports/agent2-spark1-manifest-output-state-validation-receipt-2026-06-04.json',
  manifest_output_state_receipt_builder: 'scripts/build_agent2_spark1_manifest_output_state_validation_receipt.mjs',
  manifest_output_state_receipt_validator: 'scripts/validate_agent2_spark1_manifest_output_state_validation_receipt.mjs',
  manifest_validation_receipt: 'reports/agent2-spark1-command-manifest-validation-receipt-2026-06-04.json',
  manifest_validation_receipt_builder: 'scripts/build_agent2_spark1_command_manifest_validation_receipt.mjs',
  manifest_validation_receipt_validator: 'scripts/validate_agent2_spark1_command_manifest_validation_receipt.mjs',
  current_route_scan_receipt: 'reports/agent2-current-route-scan-receipt-2026-06-04.json',
  current_route_scan_builder: 'scripts/build_agent2_current_route_scan_receipt.mjs',
  current_route_scan_receipt_validator: 'scripts/validate_agent2_current_route_scan_receipt.mjs',
  zero_boundary_audit_receipt: 'reports/agent2-weekly-zero-boundary-audit-receipt-2026-06-04.json',
  zero_boundary_audit_builder: 'scripts/build_agent2_weekly_zero_boundary_audit.mjs',
  zero_boundary_audit_validator: 'scripts/validate_agent2_weekly_zero_boundary_audit.mjs',
  spark1_execution_order_contract: 'reports/agent2-spark1-execution-order-contract-2026-06-04.json',
  spark1_execution_order_contract_builder: 'scripts/build_agent2_spark1_execution_order_contract.mjs',
  spark1_execution_order_contract_validator: 'scripts/validate_agent2_spark1_execution_order_contract.mjs',
  spark1_execution_order_validation_receipt: 'reports/agent2-spark1-execution-order-validation-receipt-2026-06-04.json',
  spark1_execution_order_validation_receipt_builder: 'scripts/build_agent2_spark1_execution_order_validation_receipt.mjs',
  spark1_execution_order_validation_receipt_validator: 'scripts/validate_agent2_spark1_execution_order_validation_receipt.mjs',
  current_handoff_aggregate_validation_receipt: 'reports/agent2-current-handoff-aggregate-validation-receipt-2026-06-04.json',
  current_handoff_aggregate_validation_receipt_builder: 'scripts/build_agent2_current_handoff_aggregate_validation_receipt.mjs',
  current_handoff_aggregate_validation_receipt_validator: 'scripts/validate_agent2_current_handoff_aggregate_validation_receipt.mjs',
  future_workset_intake_contract: 'reports/agent2-future-workset-intake-contract-2026-06-04.json',
  future_workset_intake_fixture: 'data/definitions/agent2-future-workset-intake-fixture.json',
  future_workset_intake_validator: 'scripts/validate_agent2_future_workset_intake_packet.mjs',
  future_workset_intake_contract_validator: 'scripts/validate_agent2_future_workset_intake_contract.mjs',
  orot_tbd_13_placeholder_inventory_consumption: 'reports/agent2-orot-tbd-13-placeholder-inventory-consumption-2026-06-04.json',
  orot_tbd_13_placeholder_inventory_consumption_validator: 'scripts/validate_agent2_orot_tbd_placeholder_inventory_consumption.mjs',
  old_dictionary_lane_planning_intake: 'reports/agent2-old-dictionary-lane-planning-intake-2026-06-04.json',
  old_dictionary_lane_planning_intake_builder: 'scripts/build_agent2_old_dictionary_lane_planning_intake.mjs',
  old_dictionary_lane_planning_intake_validator: 'scripts/validate_agent2_old_dictionary_lane_planning_intake.mjs',
  current_stale_reference_scan_receipt: 'reports/agent2-current-stale-reference-scan-receipt-2026-06-04.json',
  current_stale_reference_scan_receipt_builder: 'scripts/build_agent2_current_stale_reference_scan_receipt.mjs',
  current_stale_reference_scan_receipt_validator: 'scripts/validate_agent2_current_stale_reference_scan_receipt.mjs',
  lane_preservation_handoff_receipt: 'reports/agent2-lane-preservation-handoff-receipt-2026-06-04.json',
  lane_preservation_handoff_receipt_builder: 'scripts/build_agent2_lane_preservation_handoff_receipt.mjs',
  lane_preservation_handoff_receipt_validator: 'scripts/validate_agent2_lane_preservation_handoff_receipt.mjs',
  broad_workbench_token_inventory_5000_return: 'reports/agent2-broad-workbench-token-inventory-5000-return-2026-06-04.json',
  broad_workbench_token_inventory_5000_return_builder: 'scripts/build_agent2_broad_workbench_token_inventory_5000_return.mjs',
  broad_workbench_token_inventory_5000_return_validator: 'scripts/validate_agent2_broad_workbench_token_inventory_5000_return.mjs',
  orot_zero_safe_pilot_upstream_claim_blocker: 'reports/agent2-orot-zero-safe-pilot-upstream-claim-blocker-2026-06-04.json',
  orot_zero_safe_pilot_upstream_claim_blocker_builder: 'scripts/build_agent2_orot_zero_safe_pilot_upstream_claim_blocker.mjs',
  orot_zero_safe_pilot_upstream_claim_blocker_validator: 'scripts/validate_agent2_orot_zero_safe_pilot_upstream_claim_blocker.mjs',
  post_agent10_consumption_reconciliation: 'reports/agent2-post-agent10-consumption-reconciliation-2026-06-04.json',
  post_agent10_consumption_reconciliation_builder: 'scripts/build_agent2_post_agent10_consumption_reconciliation.mjs',
  post_agent10_consumption_reconciliation_validator: 'scripts/validate_agent2_post_agent10_consumption_reconciliation.mjs',
  old_dictionary_lane_partition_transform_planning_matrix: 'reports/agent2-old-dictionary-lane-partition-transform-planning-matrix-2026-06-04.json',
  old_dictionary_lane_partition_transform_planning_matrix_builder: 'scripts/build_agent2_old_dictionary_lane_partition_transform_planning_matrix.mjs',
  old_dictionary_lane_partition_transform_planning_matrix_validator: 'scripts/validate_agent2_old_dictionary_lane_partition_transform_planning_matrix.mjs',
  next_workset_blocker: 'reports/agent2-next-workset-needed-after-deuteronomy-return-2026-06-04.json',
  next_workset_blocker_builder: 'scripts/build_agent2_next_workset_needed_after_deuteronomy_return.mjs',
  next_workset_blocker_validator: 'scripts/validate_agent2_next_workset_needed_after_deuteronomy_return.mjs',
};

const manifest = readJson(entrypoints.spark1_runnable_manifest);
const outputReceipt = readJson(entrypoints.manifest_output_state_receipt);
const inventory = readJson(entrypoints.weekly_inventory);
const orotTbd = readJson(entrypoints.orot_tbd_13_placeholder_inventory_consumption);
const oldDictionaryLaneIntake = readJson(entrypoints.old_dictionary_lane_planning_intake);

const bundle = {
  schema_version: '1.0',
  artifact_type: 'agent2_weekly_lexicon_current_handoff_bundle',
  date: '2026-06-04',
  mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE',
  lane: 'Agent 2 definition/lemma/reader-hint pipeline builder',
  status: 'current_nonpublic_pipeline_handoff_bundle_pre_agent6_boundary',
  entrypoints,
  current_counts: {
    runnable_pipelines: manifest.runnable_pipelines?.length,
    validator_only_checks: manifest.validator_only_checks?.length,
    runnable_outputs_checked: outputReceipt.runnable_outputs_checked,
    validator_only_states_checked: outputReceipt.validator_only_states_checked,
    deuteronomy_phase2_rows: inventory.pipelines?.deuteronomy_phase2_transform_readiness?.counts?.rows,
    deuteronomy_phase2_occurrences: inventory.pipelines?.deuteronomy_phase2_transform_readiness?.counts?.occurrences,
    deuteronomy_partition_plan_rows: inventory.pipelines?.deuteronomy_phase2_partition_export_plan?.counts?.rows,
    deuteronomy_partition_plan_occurrences: inventory.pipelines?.deuteronomy_phase2_partition_export_plan?.counts?.occurrences,
    orot_missed_dictionary_candidate_rows: inventory.pipelines?.orot_missed_dictionary_reader_hint_candidates?.counts?.rows,
    orot_missed_dictionary_unmatched: inventory.pipelines?.orot_missed_dictionary_reader_hint_candidates?.counts?.unmatched,
    orot_tbd_display_integrity_rows: orotTbd.counts?.display_integrity_tbd_rows,
    orot_tbd_display_integrity_occurrences: orotTbd.counts?.display_integrity_tbd_occurrences,
    old_dictionary_lane_planning_rows: oldDictionaryLaneIntake.planning_counts?.audited_rows,
    old_dictionary_lane_planning_occurrences: oldDictionaryLaneIntake.planning_counts?.audited_occurrences,
    old_dictionary_next_missed_rows: oldDictionaryLaneIntake.planning_counts?.next_missed_rows,
    old_dictionary_next_missed_occurrences: oldDictionaryLaneIntake.planning_counts?.next_missed_occurrences,
    definition_workbench_sample_rows: inventory.pipelines?.definition_workbench_1000_sample?.counts?.rows,
    joined_sample_projected_rows: inventory.pipelines?.definition_workbench_usage_joined_sample_planning?.counts?.projected_rows,
    broad_workbench_token_inventory_top_rows: readJson(entrypoints.broad_workbench_token_inventory_5000_return).schema_counts?.inventory_top_tokens,
    broad_workbench_token_inventory_distinct_tokens: readJson(entrypoints.broad_workbench_token_inventory_5000_return).schema_counts?.inventory_distinct_normalized_tokens,
    orot_zero_safe_pilot_target_rows: readJson(entrypoints.orot_zero_safe_pilot_upstream_claim_blocker).counts?.target_rows,
    orot_zero_safe_pilot_source_clean_rows: readJson(entrypoints.orot_zero_safe_pilot_upstream_claim_blocker).counts?.source_clean_rows,
    orot_zero_safe_pilot_source_blocked_rows: readJson(entrypoints.orot_zero_safe_pilot_upstream_claim_blocker).counts?.source_blocked_rows,
    orot_zero_safe_pilot_transform_candidate_rows: readJson(entrypoints.orot_zero_safe_pilot_upstream_claim_blocker).transform_candidate_counts?.definition_route_claim_rows,
    post_agent10_consumption_new_executable_workset_found: readJson(entrypoints.post_agent10_consumption_reconciliation).workset_status?.new_executable_workset_found,
    old_dictionary_lane_partition_source_family_rows: readJson(entrypoints.old_dictionary_lane_partition_transform_planning_matrix).matrix_counts?.source_family_rows,
    old_dictionary_lane_partition_candidate_text_rows: readJson(entrypoints.old_dictionary_lane_partition_transform_planning_matrix).matrix_counts?.candidate_text_rows_now,
  },
  current_exact_blockers: [
    'old_dictionary_candidate_text_consumption_export_storage_requires_new_exact_agent6_boundary',
    'missing_larger_token_inventory_workset',
    'missing_joined_definition_workbench_sample_artifact_contract',
    'orot_counterpart_preview_not_promotable_without_agent1_source_lane_and_agent6_boundary',
    'no_new_agent2_exact_workset_after_deuteronomy_return',
    'orot_zero_safe_pilot_missing_machine_checkable_upstream_definition_route_claim_rejoin_morphology_homograph_gates',
  ],
  next_workset_required_shape: [
    'target work/book/subset',
    'exact input artifact paths',
    'command or expected script',
    'output path',
    'output schema',
    'validator/gate',
    'row and occurrence counts',
    'source-family lane fields where dictionary/source rows are involved',
    'Agent 6 boundary question if future public/authority/display/source/license use is proposed',
    'stop condition preserving zero authority/public/answer emissions',
  ],
  zero_boundary: {
    definition_authority: false,
    usage_as_definition_authority: false,
    answer_acceptance: false,
    answer_eligible: false,
    accepted_gloss_text: false,
    public_reader_output: false,
    route_shard_edit: false,
    public_runtime_mutation: false,
    publication_readiness: false,
    source_license_acceptance: false,
    qa_acceptance: false,
    definition_content_storage: false,
    nc_commercial_authorization: false,
  },
  handoff: {
    consumer: 'Agent 10 first',
    spark1_rule: 'Spark-1 may run only exact commands in the manifest or exact future commands supplied by a changed workset.',
    agent6_boundary: 'none opened by this bundle; required only for a future exact row/subset package proposing transform/display/source/license/Definition/public/runtime/answer use',
  },
};

assertBundle(bundle);
writeJson(outputJson, bundle);
writeMd(outputMd, bundle);
console.log(`wrote ${outputJson}`);
console.log(`wrote ${outputMd}`);

function assertBundle(bundle) {
  if (bundle.current_counts.runnable_pipelines !== 7) throw new Error('expected 7 runnable pipelines');
  if (bundle.current_counts.validator_only_checks !== 24) throw new Error('expected 24 validator-only checks');
  if (bundle.current_counts.deuteronomy_phase2_rows !== 1334) throw new Error('Deuteronomy row mismatch');
  if (bundle.current_counts.orot_tbd_display_integrity_rows !== 13) throw new Error('Orot TBD row mismatch');
  if (bundle.current_counts.old_dictionary_lane_planning_rows !== 500) throw new Error('old-dictionary planning row mismatch');
  for (const [key, value] of Object.entries(bundle.entrypoints)) {
    if (!fs.existsSync(path.join(root, value))) throw new Error(`missing entrypoint ${key}: ${value}`);
  }
  for (const value of Object.values(bundle.zero_boundary)) {
    if (value !== false) throw new Error('zero boundary must remain false');
  }
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMd(file, bundle) {
  const lines = [
    '# Agent 2 Weekly Lexicon Current Handoff Bundle - 2026-06-04',
    '',
    '## Status',
    '',
    'Current non-public Agent 2 definition/lemma/reader-hint pipeline handoff bundle prepared. This is an index over validated artifacts and exact blockers, not a new public/output/answer surface.',
    '',
    '## Entrypoints',
    '',
    ...Object.entries(bundle.entrypoints).map(([key, value]) => `- ${key}: \`${value}\``),
    '',
    '## Counts',
    '',
    `- Runnable pipelines: ${bundle.current_counts.runnable_pipelines}.`,
    `- Validator-only checks: ${bundle.current_counts.validator_only_checks}.`,
    `- Runnable outputs checked: ${bundle.current_counts.runnable_outputs_checked}.`,
    `- Validator-only states checked: ${bundle.current_counts.validator_only_states_checked}.`,
    `- Deuteronomy readiness matrix: ${bundle.current_counts.deuteronomy_phase2_rows} rows / ${bundle.current_counts.deuteronomy_phase2_occurrences} occurrences.`,
    `- Deuteronomy partition plan: ${bundle.current_counts.deuteronomy_partition_plan_rows} rows / ${bundle.current_counts.deuteronomy_partition_plan_occurrences} occurrences.`,
    `- Orot missed-dictionary candidates: ${bundle.current_counts.orot_missed_dictionary_candidate_rows} rows; ${bundle.current_counts.orot_missed_dictionary_unmatched} unmatched.`,
    `- Orot TBD display-integrity inventory: ${bundle.current_counts.orot_tbd_display_integrity_rows} rows / ${bundle.current_counts.orot_tbd_display_integrity_occurrences} occurrences.`,
    `- Old-dictionary lane planning intake: ${bundle.current_counts.old_dictionary_lane_planning_rows} planning rows / ${bundle.current_counts.old_dictionary_lane_planning_occurrences} occurrences; ${bundle.current_counts.old_dictionary_next_missed_rows} next-missed rows / ${bundle.current_counts.old_dictionary_next_missed_occurrences} occurrences.`,
    `- Definition Workbench sample: ${bundle.current_counts.definition_workbench_sample_rows} rows.`,
    `- Joined-sample planning: ${bundle.current_counts.joined_sample_projected_rows} projected row.`,
    '',
    '## Exact Blockers',
    '',
    ...bundle.current_exact_blockers.map((blocker) => `- \`${blocker}\``),
    '',
    '## Next Workset Shape',
    '',
    ...bundle.next_workset_required_shape.map((item) => `- ${item}.`),
    '',
    '## Zero Boundary',
    '',
    'No Definition authority, usage-as-definition authority, answer acceptance, answer eligibility, accepted gloss/text, public reader output, route-shard edit, public/runtime mutation, publication readiness, source/license acceptance, QA acceptance, definition-content storage, or NC commercial authorization is claimed.',
    '',
    '## Handoff',
    '',
    `- Consumer: ${bundle.handoff.consumer}.`,
    `- Spark-1 rule: ${bundle.handoff.spark1_rule}`,
    `- Agent 6 boundary: ${bundle.handoff.agent6_boundary}`,
    '',
  ];
  fs.writeFileSync(path.join(root, file), lines.join('\n'));
}
