#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputJson = 'reports/agent2-current-handoff-aggregate-validation-receipt-2026-06-04.json';
const outputMd = 'reports/agent2-current-handoff-aggregate-validation-receipt-2026-06-04.md';

const paths = {
  spark1_manifest: 'reports/agent2-spark1-runnable-command-manifest-2026-06-04.json',
  manifest_output_state_receipt: 'reports/agent2-spark1-manifest-output-state-validation-receipt-2026-06-04.json',
  manifest_validation_receipt: 'reports/agent2-spark1-command-manifest-validation-receipt-2026-06-04.json',
  execution_order_contract: 'reports/agent2-spark1-execution-order-contract-2026-06-04.json',
  execution_order_validation_receipt: 'reports/agent2-spark1-execution-order-validation-receipt-2026-06-04.json',
  weekly_inventory: 'reports/agent2-weekly-lexicon-pipeline-inventory-2026-06-04.json',
  weekly_inventory_validation_receipt: 'reports/agent2-weekly-lexicon-pipeline-inventory-validation-2026-06-04.json',
  current_handoff_bundle: 'reports/agent2-weekly-lexicon-current-handoff-bundle-2026-06-04.json',
  next_workset_blocker: 'reports/agent2-next-workset-needed-after-deuteronomy-return-2026-06-04.json',
  route_scan_receipt: 'reports/agent2-current-route-scan-receipt-2026-06-04.json',
  zero_boundary_audit_receipt: 'reports/agent2-weekly-zero-boundary-audit-receipt-2026-06-04.json',
  orot_tbd_13_placeholder_inventory_consumption: 'reports/agent2-orot-tbd-13-placeholder-inventory-consumption-2026-06-04.json',
  old_dictionary_lane_planning_intake: 'reports/agent2-old-dictionary-lane-planning-intake-2026-06-04.json',
  current_stale_reference_scan_receipt: 'reports/agent2-current-stale-reference-scan-receipt-2026-06-04.json',
  lane_preservation_handoff_receipt: 'reports/agent2-lane-preservation-handoff-receipt-2026-06-04.json',
  broad_workbench_token_inventory_5000_return: 'reports/agent2-broad-workbench-token-inventory-5000-return-2026-06-04.json',
  orot_zero_safe_pilot_upstream_claim_blocker: 'reports/agent2-orot-zero-safe-pilot-upstream-claim-blocker-2026-06-04.json',
  post_agent10_consumption_reconciliation: 'reports/agent2-post-agent10-consumption-reconciliation-2026-06-04.json',
  old_dictionary_lane_partition_transform_planning_matrix: 'reports/agent2-old-dictionary-lane-partition-transform-planning-matrix-2026-06-04.json',
};

const manifest = readJson(paths.spark1_manifest);
const outputReceipt = readJson(paths.manifest_output_state_receipt);
const bundle = readJson(paths.current_handoff_bundle);
const blocker = readJson(paths.next_workset_blocker);
const zeroReceipt = readJson(paths.zero_boundary_audit_receipt);
const orotTbd = readJson(paths.orot_tbd_13_placeholder_inventory_consumption);

const receipt = {
  schema_version: '1.0',
  artifact_type: 'agent2_current_handoff_aggregate_validation_receipt',
  date: '2026-06-04',
  mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE',
  lane: 'Agent 2 definition/lemma/reader-hint pipeline builder',
  status: 'passed_nonpublic_aggregate_validation',
  validated_artifacts: paths,
  validator_commands: [
    'node scripts/validate_agent2_spark1_runnable_command_manifest.mjs reports/agent2-spark1-runnable-command-manifest-2026-06-04.json',
    'node scripts/validate_agent2_spark1_manifest_outputs.mjs reports/agent2-spark1-runnable-command-manifest-2026-06-04.json',
    'node scripts/validate_agent2_spark1_manifest_output_state_validation_receipt.mjs reports/agent2-spark1-manifest-output-state-validation-receipt-2026-06-04.json',
    'node scripts/validate_agent2_spark1_command_manifest_validation_receipt.mjs reports/agent2-spark1-command-manifest-validation-receipt-2026-06-04.json',
    'node scripts/validate_agent2_spark1_execution_order_contract.mjs reports/agent2-spark1-execution-order-contract-2026-06-04.json',
    'node scripts/validate_agent2_spark1_execution_order_validation_receipt.mjs reports/agent2-spark1-execution-order-validation-receipt-2026-06-04.json',
    'node scripts/validate_agent2_weekly_lexicon_pipeline_inventory.mjs reports/agent2-weekly-lexicon-pipeline-inventory-2026-06-04.json',
    'node scripts/validate_agent2_weekly_lexicon_pipeline_inventory_validation.mjs reports/agent2-weekly-lexicon-pipeline-inventory-validation-2026-06-04.json',
    'node scripts/validate_agent2_weekly_lexicon_current_handoff_bundle.mjs reports/agent2-weekly-lexicon-current-handoff-bundle-2026-06-04.json',
    'node scripts/validate_agent2_next_workset_needed_after_deuteronomy_return.mjs reports/agent2-next-workset-needed-after-deuteronomy-return-2026-06-04.json',
    'node scripts/validate_agent2_current_route_scan_receipt.mjs reports/agent2-current-route-scan-receipt-2026-06-04.json',
    'node scripts/validate_agent2_weekly_zero_boundary_audit.mjs reports/agent2-weekly-lexicon-current-handoff-bundle-2026-06-04.json',
    'node scripts/validate_agent2_orot_tbd_placeholder_inventory_consumption.mjs reports/agent2-orot-tbd-13-placeholder-inventory-consumption-2026-06-04.json',
    'node scripts/validate_agent2_old_dictionary_lane_planning_intake.mjs reports/agent2-old-dictionary-lane-planning-intake-2026-06-04.json',
    'node scripts/validate_agent2_current_stale_reference_scan_receipt.mjs reports/agent2-current-stale-reference-scan-receipt-2026-06-04.json',
    'node scripts/validate_agent2_lane_preservation_handoff_receipt.mjs reports/agent2-lane-preservation-handoff-receipt-2026-06-04.json',
    'node scripts/validate_agent2_broad_workbench_token_inventory_5000_return.mjs reports/agent2-broad-workbench-token-inventory-5000-return-2026-06-04.json',
    'node scripts/validate_agent2_orot_zero_safe_pilot_upstream_claim_blocker.mjs reports/agent2-orot-zero-safe-pilot-upstream-claim-blocker-2026-06-04.json',
    'node scripts/validate_agent2_post_agent10_consumption_reconciliation.mjs reports/agent2-post-agent10-consumption-reconciliation-2026-06-04.json',
    'node scripts/validate_agent2_old_dictionary_lane_partition_transform_planning_matrix.mjs reports/agent2-old-dictionary-lane-partition-transform-planning-matrix-2026-06-04.json',
  ],
  counts: {
    validator_commands: 20,
    manifest_runnable_pipelines: manifest.runnable_pipelines?.length,
    manifest_validator_only_checks: manifest.validator_only_checks?.length,
    manifest_output_state_runnable_outputs_checked: outputReceipt.runnable_outputs_checked,
    manifest_output_state_validator_only_states_checked: outputReceipt.validator_only_states_checked,
    deuteronomy_phase2_rows: bundle.current_counts?.deuteronomy_phase2_rows,
    deuteronomy_phase2_occurrences: bundle.current_counts?.deuteronomy_phase2_occurrences,
    orot_missed_dictionary_candidate_rows: bundle.current_counts?.orot_missed_dictionary_candidate_rows,
    orot_missed_dictionary_unmatched: bundle.current_counts?.orot_missed_dictionary_unmatched,
    orot_tbd_display_integrity_rows: orotTbd.counts?.display_integrity_tbd_rows,
    orot_tbd_display_integrity_occurrences: orotTbd.counts?.display_integrity_tbd_occurrences,
    definition_workbench_sample_rows: bundle.current_counts?.definition_workbench_sample_rows,
    zero_boundary_artifacts_checked: zeroReceipt.artifacts_checked,
  },
  current_exact_blockers: bundle.current_exact_blockers,
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
};

assertReceipt(receipt, blocker);
writeJson(outputJson, receipt);
writeMd(outputMd, receipt);
console.log(`wrote ${outputJson}`);
console.log(`wrote ${outputMd}`);

function assertReceipt(receipt, blocker) {
  if (receipt.counts.validator_commands !== receipt.validator_commands.length) throw new Error('validator command count mismatch');
  if (receipt.counts.manifest_runnable_pipelines !== 7) throw new Error('expected 7 runnable pipelines');
  if (receipt.counts.manifest_validator_only_checks !== 24) throw new Error('expected 24 validator-only checks');
  if (receipt.counts.manifest_output_state_runnable_outputs_checked !== 7) throw new Error('expected 7 output-state runnable checks');
  if (receipt.counts.manifest_output_state_validator_only_states_checked !== 23) throw new Error('expected 23 output-state validator-only checks');
  if (receipt.counts.zero_boundary_artifacts_checked !== 22) throw new Error('expected 22 zero-boundary artifacts checked');
  if (receipt.counts.deuteronomy_phase2_rows !== 1334 || receipt.counts.deuteronomy_phase2_occurrences !== 2964) throw new Error('Deuteronomy count mismatch');
  if (receipt.counts.orot_tbd_display_integrity_rows !== 13 || receipt.counts.orot_tbd_display_integrity_occurrences !== 129) throw new Error('Orot TBD count mismatch');
  if (blocker.exact_blocker !== 'no_new_agent2_exact_workset_after_deuteronomy_return') throw new Error('blocker mismatch');
  for (const value of Object.values(receipt.zero_boundary)) {
    if (value !== false) throw new Error('zero boundary must remain false');
  }
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMd(file, receipt) {
  const lines = [
    '# Agent 2 Current Handoff Aggregate Validation Receipt - 2026-06-04',
    '',
    '## Status',
    '',
    'Aggregate validation receipt prepared for the current non-public Agent 2 handoff chain.',
    '',
    `- Validator commands recorded: ${receipt.counts.validator_commands}.`,
    `- Manifest runnable pipelines: ${receipt.counts.manifest_runnable_pipelines}.`,
    `- Manifest validator-only checks: ${receipt.counts.manifest_validator_only_checks}.`,
    `- Output-state runnable outputs checked: ${receipt.counts.manifest_output_state_runnable_outputs_checked}.`,
    `- Output-state validator-only states checked: ${receipt.counts.manifest_output_state_validator_only_states_checked}.`,
    `- Deuteronomy Phase-2 scope: ${receipt.counts.deuteronomy_phase2_rows} rows / ${receipt.counts.deuteronomy_phase2_occurrences} occurrences.`,
    `- Orot missed-dictionary current result: ${receipt.counts.orot_missed_dictionary_candidate_rows} candidate rows; ${receipt.counts.orot_missed_dictionary_unmatched} unmatched.`,
    `- Orot TBD display-integrity inventory: ${receipt.counts.orot_tbd_display_integrity_rows} rows / ${receipt.counts.orot_tbd_display_integrity_occurrences} occurrences.`,
    `- Definition Workbench sample: ${receipt.counts.definition_workbench_sample_rows} rows.`,
    `- Zero-boundary audit artifacts checked: ${receipt.counts.zero_boundary_artifacts_checked}.`,
    '',
    '## Exact Blockers',
    '',
    ...receipt.current_exact_blockers.map((blocker) => `- \`${blocker}\``),
    '',
    '## Boundary',
    '',
    'No Definition authority, usage-as-definition authority, answer acceptance, answer eligibility, accepted gloss/text, public reader output, route-shard edit, public/runtime mutation, publication readiness, source/license acceptance, QA acceptance, definition-content storage, or NC commercial authorization is claimed.',
    '',
  ];
  fs.writeFileSync(path.join(root, file), lines.join('\n'));
}
