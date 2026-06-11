#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputJson = 'reports/agent2-spark1-runnable-command-manifest-2026-06-04.json';
const outputMd = 'reports/agent2-spark1-runnable-command-manifest-2026-06-04.md';

const manifest = {
  schema_version: '1.0',
  artifact_type: 'agent2_spark1_runnable_command_manifest',
  date: '2026-06-04',
  mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE',
  source_inventory: 'reports/agent2-weekly-lexicon-pipeline-inventory-2026-06-04.json',
  runnable_pipelines: [
    pipeline('deuteronomy_phase2_transform_readiness',
      'node scripts/build_agent2_deuteronomy_phase2_transform_readiness_matrix.mjs --input=reports/agent10-agent2-ready-deuteronomy-phase2-downstream-transform-workset-2026-06-04.json --output=reports/agent2-deuteronomy-phase2-transform-readiness-matrix-2026-06-04.json --report=reports/agent2-deuteronomy-phase2-transform-readiness-matrix-2026-06-04.md',
      'node scripts/validate_agent2_deuteronomy_phase2_transform_readiness_matrix.mjs reports/agent2-deuteronomy-phase2-transform-readiness-matrix-2026-06-04.json',
      { rows: 1334, occurrences: 2964, commercial_clean_candidate_rows: 1334, noncommercial_educational_candidate_rows: 0, zero_emission_rows: 0 }),
    pipeline('deuteronomy_phase2_partition_export_plan',
      'node scripts/build_agent2_deuteronomy_phase2_partition_export_plan.mjs --input=reports/agent2-deuteronomy-phase2-transform-readiness-matrix-2026-06-04.json --output=reports/agent2-deuteronomy-phase2-partition-export-plan-2026-06-04.json --report=reports/agent2-deuteronomy-phase2-partition-export-plan-2026-06-04.md',
      'node scripts/validate_agent2_deuteronomy_phase2_partition_export_plan.mjs reports/agent2-deuteronomy-phase2-partition-export-plan-2026-06-04.json',
      { rows: 1334, occurrences: 2964, commercial_clean_candidate_rows: 1334, noncommercial_educational_candidate_rows: 0, candidate_text_export_rows: 0, answer_eligible_rows: 0, public_emit_rows: 0 }),
    pipeline('orot_missed_dictionary_reader_hint_candidates',
      'node scripts/build_agent2_orot_missed_dictionary_reader_hint_candidates.mjs --limit=50 --output=reports/agent2-orot-missed-dictionary-reader-hint-candidates-2026-06-04.json --report=reports/agent2-orot-missed-dictionary-reader-hint-candidates-2026-06-04.md',
      'node scripts/validate_agent2_orot_missed_dictionary_reader_hint_candidates.mjs reports/agent2-orot-missed-dictionary-reader-hint-candidates-2026-06-04.json',
      { rows: 0, occurrences: 0, unmatched: 168 }),
    pipeline('definition_workbench_1000_sample',
      'node scripts/build_definition_workbench_sample.mjs --limit=1000 --output=data/definitions/definition-workbench-sample-1000.json --report=reports/definition-workbench-sample-1000-report.md',
      'node scripts/validate_definition_workbench_sample.mjs data/definitions/definition-workbench-sample-1000.json',
      { rows: 1000, rows_with_route_cards: 996, no_hint_repair_targets: 4 }),
    pipeline('definition_workbench_usage_joined_sample_planning',
      'node scripts/build_agent2_definition_workbench_usage_joined_sample_planning.mjs --join-smoke=data/definitions/definition-workbench-usage-join-smoke.json --output=data/definitions/agent2-definition-workbench-usage-joined-sample-planning.json --report=reports/agent2-definition-workbench-usage-joined-sample-planning.md',
      'node scripts/validate_agent2_definition_workbench_usage_joined_sample_planning.mjs data/definitions/agent2-definition-workbench-usage-joined-sample-planning.json',
      { projected_rows: 1, occurrence_links: 12, route_ids: 1 }),
    pipeline('current_route_scan_receipt_refresh',
      'node scripts/build_agent2_current_route_scan_receipt.mjs',
      'node scripts/validate_agent2_current_route_scan_receipt.mjs reports/agent2-current-route-scan-receipt-2026-06-04.json',
      { candidate_rows: 0, candidate_occurrences: 0, unmatched_rows: 168, agent6_route_needed_now: false }),
    pipeline('next_workset_blocker_refresh',
      'node scripts/build_agent2_next_workset_needed_after_deuteronomy_return.mjs',
      'node scripts/validate_agent2_next_workset_needed_after_deuteronomy_return.mjs reports/agent2-next-workset-needed-after-deuteronomy-return-2026-06-04.json',
      { candidate_rows: 0, candidate_occurrences: 0, unmatched_rows: 168, agent6_route_needed_now: false }),
  ],
  validator_only_checks: [
    check('source_lane_assignment_preflight_fixture', 'node scripts/validate_agent2_source_lane_assignment_packet.mjs data/definitions/agent2-source-lane-assignment-preflight-fixture.json'),
    check('weekly_pipeline_inventory', 'node scripts/validate_agent2_weekly_lexicon_pipeline_inventory.mjs reports/agent2-weekly-lexicon-pipeline-inventory-2026-06-04.json'),
    check('weekly_pipeline_inventory_validation_receipt', 'node scripts/validate_agent2_weekly_lexicon_pipeline_inventory_validation.mjs reports/agent2-weekly-lexicon-pipeline-inventory-validation-2026-06-04.json'),
    check('orot_counterpart_hint_patch_preview', 'node scripts/validate_agent2_orot_counterpart_hint_patch_preview.mjs reports/agent2-orot-counterpart-hint-patch-preview-2026-06-04.json'),
    check('spark1_manifest_outputs', 'node scripts/validate_agent2_spark1_manifest_outputs.mjs reports/agent2-spark1-runnable-command-manifest-2026-06-04.json'),
    check('spark1_manifest_output_state_validation_receipt', 'node scripts/validate_agent2_spark1_manifest_output_state_validation_receipt.mjs reports/agent2-spark1-manifest-output-state-validation-receipt-2026-06-04.json'),
    check('spark1_command_manifest_validation_receipt', 'node scripts/validate_agent2_spark1_command_manifest_validation_receipt.mjs reports/agent2-spark1-command-manifest-validation-receipt-2026-06-04.json'),
    check('weekly_lexicon_current_handoff_bundle', 'node scripts/validate_agent2_weekly_lexicon_current_handoff_bundle.mjs reports/agent2-weekly-lexicon-current-handoff-bundle-2026-06-04.json'),
    check('next_workset_needed_after_deuteronomy_return', 'node scripts/validate_agent2_next_workset_needed_after_deuteronomy_return.mjs reports/agent2-next-workset-needed-after-deuteronomy-return-2026-06-04.json'),
    check('current_route_scan_receipt', 'node scripts/validate_agent2_current_route_scan_receipt.mjs reports/agent2-current-route-scan-receipt-2026-06-04.json'),
    check('weekly_zero_boundary_audit', 'node scripts/validate_agent2_weekly_zero_boundary_audit.mjs reports/agent2-weekly-lexicon-current-handoff-bundle-2026-06-04.json'),
    check('spark1_execution_order_contract', 'node scripts/validate_agent2_spark1_execution_order_contract.mjs reports/agent2-spark1-execution-order-contract-2026-06-04.json'),
    check('spark1_execution_order_validation_receipt', 'node scripts/validate_agent2_spark1_execution_order_validation_receipt.mjs reports/agent2-spark1-execution-order-validation-receipt-2026-06-04.json'),
    check('current_handoff_aggregate_validation_receipt', 'node scripts/validate_agent2_current_handoff_aggregate_validation_receipt.mjs reports/agent2-current-handoff-aggregate-validation-receipt-2026-06-04.json'),
    check('old_dictionary_lane_planning_intake', 'node scripts/validate_agent2_old_dictionary_lane_planning_intake.mjs reports/agent2-old-dictionary-lane-planning-intake-2026-06-04.json'),
    check('weekly_lexicon_script_syntax_receipt', 'node scripts/validate_agent2_weekly_lexicon_script_syntax_receipt.mjs reports/agent2-weekly-lexicon-script-syntax-receipt-2026-06-04.json'),
    check('future_workset_intake_fixture', 'node scripts/validate_agent2_future_workset_intake_packet.mjs data/definitions/agent2-future-workset-intake-fixture.json'),
    check('future_workset_intake_contract', 'node scripts/validate_agent2_future_workset_intake_contract.mjs reports/agent2-future-workset-intake-contract-2026-06-04.json'),
    check('current_stale_reference_scan_receipt', 'node scripts/validate_agent2_current_stale_reference_scan_receipt.mjs reports/agent2-current-stale-reference-scan-receipt-2026-06-04.json'),
    check('lane_preservation_handoff_receipt', 'node scripts/validate_agent2_lane_preservation_handoff_receipt.mjs reports/agent2-lane-preservation-handoff-receipt-2026-06-04.json'),
    check('broad_workbench_token_inventory_5000_return', 'node scripts/validate_agent2_broad_workbench_token_inventory_5000_return.mjs reports/agent2-broad-workbench-token-inventory-5000-return-2026-06-04.json'),
    check('orot_zero_safe_pilot_upstream_claim_blocker', 'node scripts/validate_agent2_orot_zero_safe_pilot_upstream_claim_blocker.mjs reports/agent2-orot-zero-safe-pilot-upstream-claim-blocker-2026-06-04.json'),
    check('post_agent10_consumption_reconciliation', 'node scripts/validate_agent2_post_agent10_consumption_reconciliation.mjs reports/agent2-post-agent10-consumption-reconciliation-2026-06-04.json'),
    check('old_dictionary_lane_partition_transform_planning_matrix', 'node scripts/validate_agent2_old_dictionary_lane_partition_transform_planning_matrix.mjs reports/agent2-old-dictionary-lane-partition-transform-planning-matrix-2026-06-04.json'),
  ],
  blocked_routes: [
    'old_dictionary_candidate_text_consumption_export_storage_requires_new_exact_agent6_boundary',
    'missing_larger_token_inventory_workset',
    'missing_joined_definition_workbench_sample_artifact_contract',
    'orot_counterpart_preview_not_promotable_without_agent1_source_lane_and_agent6_boundary',
    'no_new_agent2_exact_workset_after_deuteronomy_return',
    'orot_zero_safe_pilot_missing_machine_checkable_upstream_definition_route_claim_rejoin_morphology_homograph_gates',
  ],
  spark1_rule: 'Spark-1 may run only exact commands in this manifest or exact future commands supplied by a new workset.',
  what_must_not_be_accepted: [
    'QA acceptance',
    'source/provenance acceptance',
    'license acceptance',
    'legal acceptance',
    'Definition authority',
    'usage-as-definition authority',
    'answer acceptance',
    'answer eligibility',
    'public/runtime acceptance',
    'publication readiness',
    'route publication support',
    'product/data acceptance',
    'translation output',
    'accepted gloss/text',
    'public reader output',
    'route-shard edit',
    'public/runtime mutation',
    'definition-content storage',
    'NC commercial authorization',
  ],
};

assertManifest(manifest);
writeJson(outputJson, manifest);
writeMd(outputMd, manifest);
console.log(`wrote ${outputJson}`);
console.log(`wrote ${outputMd}`);

function pipeline(id, build, validate, expected_counts) {
  return { id, build, validate, expected_counts };
}

function check(id, command) {
  return { id, command };
}

function assertManifest(manifest) {
  if (manifest.runnable_pipelines.length !== 7) throw new Error('expected 7 runnable pipelines');
  if (manifest.validator_only_checks.length !== 24) throw new Error('expected 24 validator-only checks');
  for (const pipeline of manifest.runnable_pipelines) {
    validateCommand(pipeline.build);
    validateCommand(pipeline.validate);
  }
  for (const item of manifest.validator_only_checks) validateCommand(item.command);
}

function validateCommand(command) {
  const parts = command.split(/\s+/).slice(1);
  const script = parts.find((part) => part.startsWith('scripts/') && part.endsWith('.mjs'));
  if (!script || !fs.existsSync(path.join(root, script))) throw new Error(`missing script in command ${command}`);
}

function writeJson(file, value) {
  fs.writeFileSync(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMd(file, manifest) {
  const lines = [
    '# Agent 2 Spark-1 Runnable Command Manifest',
    '',
    'Date: 2026-06-04',
    'Mode: WEEKLY_LEXICON_EXPANSION_GOAL_MODE',
    '',
    '## Target',
    '',
    'Provide exact Spark-1 runnable commands for Agent 2 definition/lemma/reader-hint pipelines, separated from blocked routes and preserving zero authority/public/answer boundaries.',
    '',
    'Source inventory:',
    '',
    `- \`${manifest.source_inventory}\``,
    '',
    '## Runnable Pipelines',
    '',
    ...manifest.runnable_pipelines.flatMap((item) => [
      `### ${title(item.id)}`,
      '',
      'Build:',
      '',
      '```powershell',
      item.build,
      '```',
      '',
      'Validate:',
      '',
      '```powershell',
      item.validate,
      '```',
      '',
      `Expected counts: \`${JSON.stringify(item.expected_counts)}\``,
      '',
    ]),
    '## Validator-Only Checks',
    '',
    ...manifest.validator_only_checks.flatMap((item) => [
      `### ${title(item.id)}`,
      '',
      '```powershell',
      item.command,
      '```',
      '',
    ]),
    '## Blocked Routes',
    '',
    ...manifest.blocked_routes.map((item) => `- \`${item}\``),
    '',
    '## Spark-1 Rule',
    '',
    manifest.spark1_rule,
    '',
    '## Non-Acceptance Boundary',
    '',
    'No QA acceptance, source/provenance acceptance, license acceptance, legal acceptance, Definition authority, usage-as-definition authority, answer acceptance, answer eligibility, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, translation output, accepted gloss/text, public reader output, route-shard edit, public/runtime mutation, definition-content storage, or NC commercial authorization is claimed.',
    '',
  ];
  fs.writeFileSync(path.join(root, file), lines.join('\n'));
}

function title(id) {
  return id.split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}
