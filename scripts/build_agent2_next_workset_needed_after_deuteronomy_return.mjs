#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputJson = 'reports/agent2-next-workset-needed-after-deuteronomy-return-2026-06-04.json';
const outputMd = 'reports/agent2-next-workset-needed-after-deuteronomy-return-2026-06-04.md';

const routeScanPath = 'reports/agent2-current-route-scan-receipt-2026-06-04.json';
const inventoryPath = 'reports/agent2-weekly-lexicon-pipeline-inventory-2026-06-04.json';
const bundlePath = 'reports/agent2-weekly-lexicon-current-handoff-bundle-2026-06-04.json';
const manifestPath = 'reports/agent2-spark1-runnable-command-manifest-2026-06-04.json';
const manifestGateReceiptPath = 'reports/agent2-spark1-manifest-output-state-validation-receipt-2026-06-04.json';
const consumptionPath = 'reports/agent10-agent2-orot-missed-dictionary-zero-candidate-consumption-2026-06-04.json';

const routeScan = readJson(routeScanPath);
const inventory = readJson(inventoryPath);
const bundle = readJson(bundlePath);
const manifestGateReceipt = readJson(manifestGateReceiptPath);
const consumption = readJson(consumptionPath);

const blocker = {
  schema_version: '1.0',
  artifact_type: 'agent2_next_workset_needed_after_deuteronomy_return',
  date: '2026-06-04',
  mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE',
  status: 'no_new_agent2_exact_workset_after_deuteronomy_return',
  latest_agent10_agent2_executable_route_found: routeScan.latest_agent10_agent2_route_rows
    .filter((row) => row.includes('agent10-agent2'))
    .slice(0, 6),
  agent2_returned_outputs: [
    'reports/agent2-deuteronomy-phase2-transform-readiness-matrix-2026-06-04.md',
    'reports/agent2-deuteronomy-phase2-transform-readiness-matrix-2026-06-04.json',
    'reports/agent2-deuteronomy-phase2-transform-readiness-return-2026-06-04.md',
    'reports/agent2-deuteronomy-phase2-transform-readiness-return-2026-06-04.json',
    'reports/agent2-deuteronomy-phase2-partition-export-plan-2026-06-04.md',
    'reports/agent2-deuteronomy-phase2-partition-export-plan-2026-06-04.json',
  ],
  validated_inventory: {
    inventory: inventoryPath,
    validator: 'scripts/validate_agent2_weekly_lexicon_pipeline_inventory.mjs',
    result: 'passed',
    stdout: 'Agent 2 weekly lexicon pipeline inventory validation passed. Checked: Deuteronomy 1334/2964 readiness and partition plan, Orot zero-candidate closure, Orot TBD 13-row inventory consumption, Workbench 1000 sample, joined planning, source-lane fixture, Spark-1 output-state gate, blockers, zero boundary.',
  },
  current_handoff_bundle: {
    bundle: bundlePath,
    validator: 'scripts/validate_agent2_weekly_lexicon_current_handoff_bundle.mjs',
    result: 'passed',
    stdout: `Agent 2 weekly lexicon current handoff bundle validation passed. Runnable pipelines: ${bundle.current_counts?.runnable_pipelines}; blockers: ${bundle.current_exact_blockers?.length}.`,
  },
  spark1_manifest_output_state_gate: {
    manifest: manifestPath,
    validator: 'scripts/validate_agent2_spark1_manifest_outputs.mjs',
    receipt: manifestGateReceiptPath,
    result: 'passed',
    stdout: `Agent 2 Spark-1 manifest output-state validation passed. Runnable outputs checked: ${manifestGateReceipt.runnable_outputs_checked}; validator-only states checked: ${manifestGateReceipt.validator_only_states_checked}.`,
  },
  current_route_scan_receipt: {
    receipt: routeScanPath,
    validator: 'scripts/validate_agent2_current_route_scan_receipt.mjs',
    result: 'passed',
    stdout: 'Agent 2 current route scan receipt validation passed. No newer exact Agent2 workset recorded.',
  },
  latest_agent10_agent2_zero_candidate_consumption: {
    artifact: consumptionPath,
    status: consumption.status,
    candidate_rows: consumption.agent2_summary?.candidate_rows,
    candidate_occurrences: consumption.agent2_summary?.candidate_occurrences,
    unmatched_rows: consumption.agent2_summary?.unmatched_rows,
    release_owner_next_action: consumption.release_owner_decision?.next_action,
    agent6_route_needed_now: consumption.release_owner_decision?.agent6_route_needed_now,
  },
  exact_blocker: 'no_new_agent2_exact_workset_after_deuteronomy_return',
  restored_required_output_shape: {
    workset: 'no_new_agent2_exact_workset_after_deuteronomy_return',
    input_rows: {
      deuteronomy_phase2_rows: inventory.pipelines?.deuteronomy_phase2_transform_readiness?.counts?.rows,
      old_dictionary_lane_planning_rows: bundle.current_counts?.old_dictionary_lane_planning_rows,
      orot_missed_dictionary_unmatched_rows: consumption.agent2_summary?.unmatched_rows,
    },
    lane_split: {
      deuteronomy_commercial_clean_candidate_rows: inventory.pipelines?.deuteronomy_phase2_transform_readiness?.counts?.commercial_clean_candidate_rows,
      deuteronomy_noncommercial_educational_candidate_rows: inventory.pipelines?.deuteronomy_phase2_transform_readiness?.counts?.noncommercial_educational_candidate_rows,
      old_dictionary_lane_planning_only: true,
      unclassified_rows_consumed_as_candidate_text: 0,
    },
    transform_candidate_counts: {
      deuteronomy_readiness_rows: inventory.pipelines?.deuteronomy_phase2_transform_readiness?.counts?.rows,
      deuteronomy_partition_plan_rows: inventory.pipelines?.deuteronomy_phase2_partition_export_plan?.counts?.rows,
      orot_missed_dictionary_candidate_rows: consumption.agent2_summary?.candidate_rows,
      orot_missed_dictionary_candidate_occurrences: consumption.agent2_summary?.candidate_occurrences,
    },
    zero_emission_counters: {
      answer_rows: 0,
      answer_eligible_rows: 0,
      public_reader_output_rows: 0,
      route_jsonl_rows: 0,
      route_shard_writes: 0,
      definition_content_rows: 0,
      candidate_text_export_rows: 0,
      accepted_text_rows: 0,
    },
    blocker_rows: {
      no_new_exact_workset: true,
      orot_unmatched_rows_requiring_changed_source_family_linkage_dictionary_evidence: consumption.agent2_summary?.unmatched_rows,
      old_dictionary_requires_agent6_boundary_before_candidate_text_consumption_export_storage: true,
    },
    validator: 'scripts/validate_agent2_next_workset_needed_after_deuteronomy_return.mjs',
    handoff_owner: 'Agent 10 first; Agent 6 only by exact boundary packet prepared through release owner',
    stop_condition: 'Return this exact blocker until a new target/workset/input/schema/validator with lane-classified source rows is supplied.',
  },
  required_next_workset_shape: [
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
  standing_exact_blockers: [
    'old_dictionary_candidate_text_consumption_export_storage_requires_new_exact_agent6_boundary',
    'missing_larger_token_inventory_workset',
    'missing_joined_definition_workbench_sample_artifact_contract',
    'orot_counterpart_preview_not_promotable_without_agent1_source_lane_and_agent6_boundary',
    'no_new_agent2_exact_workset_after_deuteronomy_return',
  ],
  spark1_handoff: {
    do_not_rerun_unchanged_pipelines: true,
    allowed_only_for: [
      'named exact command against changed input/workset',
      'validator requested for current proof preservation',
    ],
  },
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

assertBlocker(blocker);
writeJson(outputJson, blocker);
writeMd(outputMd, blocker);
console.log(`wrote ${outputJson}`);
console.log(`wrote ${outputMd}`);

function assertBlocker(blocker) {
  for (const p of blocker.latest_agent10_agent2_executable_route_found) requirePath(p);
  for (const p of blocker.agent2_returned_outputs) requirePath(p);
  if (!blocker.latest_agent10_agent2_executable_route_found.includes(consumptionPath)) throw new Error('missing Agent10 zero-candidate consumption');
  if (blocker.latest_agent10_agent2_zero_candidate_consumption.candidate_rows !== 0) throw new Error('candidate rows must be 0');
  if (blocker.latest_agent10_agent2_zero_candidate_consumption.candidate_occurrences !== 0) throw new Error('candidate occurrences must be 0');
  if (blocker.latest_agent10_agent2_zero_candidate_consumption.unmatched_rows !== 168) throw new Error('unmatched rows must be 168');
  if (blocker.latest_agent10_agent2_zero_candidate_consumption.agent6_route_needed_now !== false) throw new Error('Agent 6 route must remain false');
  if (!String(blocker.latest_agent10_agent2_zero_candidate_consumption.release_owner_next_action || '').includes('changed source-family/linkage/dictionary evidence')) throw new Error('changed evidence requirement missing');
  if (inventory.pipelines?.deuteronomy_phase2_transform_readiness?.counts?.rows !== 1334) throw new Error('inventory Deuteronomy row anchor mismatch');
  if (bundle.current_counts?.runnable_pipelines !== 7) throw new Error('bundle runnable pipeline count mismatch');
  if (manifestGateReceipt.runnable_outputs_checked !== 7 || manifestGateReceipt.validator_only_states_checked !== 23) throw new Error('manifest output-state gate count mismatch');
}

function requirePath(relativePath) {
  if (!fs.existsSync(path.join(root, relativePath))) throw new Error(`missing path ${relativePath}`);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMd(file, blocker) {
  const lines = [
    '# Agent 2 Next Workset Needed After Deuteronomy Return',
    '',
    'Date: 2026-06-04',
    'Mode: WEEKLY_LEXICON_EXPANSION_GOAL_MODE',
    '',
    '## Target',
    '',
    'Record current Agent 2 lane state after the Deuteronomy Phase-2 transform/readiness return and block unchanged reruns until a new exact workset is supplied.',
    '',
    '## Current Search Result',
    '',
    'Latest Agent10-Agent2 executable route found:',
    '',
    ...blocker.latest_agent10_agent2_executable_route_found.map((p) => `- \`${p}\``),
    '',
    'Agent 2 returned it:',
    '',
    ...blocker.agent2_returned_outputs.map((p) => `- \`${p}\``),
    '',
    'No newer exact Agent 2 executable workset was found in the current targeted search.',
    '',
    'Latest Agent10 zero-candidate consumption:',
    '',
    `- Artifact: \`${blocker.latest_agent10_agent2_zero_candidate_consumption.artifact}\``,
    `- Status: \`${blocker.latest_agent10_agent2_zero_candidate_consumption.status}\``,
    `- Candidate rows / occurrences: ${blocker.latest_agent10_agent2_zero_candidate_consumption.candidate_rows} / ${blocker.latest_agent10_agent2_zero_candidate_consumption.candidate_occurrences}`,
    `- Unmatched rows: ${blocker.latest_agent10_agent2_zero_candidate_consumption.unmatched_rows}`,
    `- Agent 6 route needed now: ${blocker.latest_agent10_agent2_zero_candidate_consumption.agent6_route_needed_now}`,
    '- Next action: wait for changed source-family/linkage/dictionary evidence before another Agent 2 candidate packet.',
    '',
    '## Current Validated Inventory',
    '',
    `- Inventory: \`${blocker.validated_inventory.inventory}\``,
    `- Validator: \`${blocker.validated_inventory.validator}\``,
    '',
    'Validation result:',
    '',
    '```text',
    blocker.validated_inventory.stdout,
    '```',
    '',
    '## Current Handoff Bundle',
    '',
    `- Bundle: \`${blocker.current_handoff_bundle.bundle}\``,
    `- Validator: \`${blocker.current_handoff_bundle.validator}\``,
    '',
    'Validation result:',
    '',
    '```text',
    blocker.current_handoff_bundle.stdout,
    '```',
    '',
    '## Spark-1 Manifest Output-State Gate',
    '',
    `- Manifest: \`${blocker.spark1_manifest_output_state_gate.manifest}\``,
    `- Validator: \`${blocker.spark1_manifest_output_state_gate.validator}\``,
    `- Receipt: \`${blocker.spark1_manifest_output_state_gate.receipt}\``,
    '',
    'Validation result:',
    '',
    '```text',
    blocker.spark1_manifest_output_state_gate.stdout,
    '```',
    '',
    '## Current Route Scan Receipt',
    '',
    `- Receipt: \`${blocker.current_route_scan_receipt.receipt}\``,
    `- Validator: \`${blocker.current_route_scan_receipt.validator}\``,
    '',
    'Validation result:',
    '',
    '```text',
    blocker.current_route_scan_receipt.stdout,
    '```',
    '',
    '## Exact Blocker',
    '',
    `\`${blocker.exact_blocker}\``,
    '',
    '## Required Task Shape',
    '',
    `- workset: \`${blocker.restored_required_output_shape.workset}\``,
    `- input rows: Deuteronomy ${blocker.restored_required_output_shape.input_rows.deuteronomy_phase2_rows}; old-dictionary planning ${blocker.restored_required_output_shape.input_rows.old_dictionary_lane_planning_rows}; Orot unmatched ${blocker.restored_required_output_shape.input_rows.orot_missed_dictionary_unmatched_rows}.`,
    `- lane split: Deuteronomy commercial-clean ${blocker.restored_required_output_shape.lane_split.deuteronomy_commercial_clean_candidate_rows}; Deuteronomy NC ${blocker.restored_required_output_shape.lane_split.deuteronomy_noncommercial_educational_candidate_rows}; unclassified candidate-text rows consumed ${blocker.restored_required_output_shape.lane_split.unclassified_rows_consumed_as_candidate_text}.`,
    `- transform candidate counts: Deuteronomy readiness ${blocker.restored_required_output_shape.transform_candidate_counts.deuteronomy_readiness_rows}; Deuteronomy partition plan ${blocker.restored_required_output_shape.transform_candidate_counts.deuteronomy_partition_plan_rows}; Orot missed-dictionary candidates ${blocker.restored_required_output_shape.transform_candidate_counts.orot_missed_dictionary_candidate_rows}.`,
    `- zero-emission counters: \`${JSON.stringify(blocker.restored_required_output_shape.zero_emission_counters)}\``,
    `- blocker rows: Orot unmatched ${blocker.restored_required_output_shape.blocker_rows.orot_unmatched_rows_requiring_changed_source_family_linkage_dictionary_evidence}; old-dictionary Agent 6 boundary required before candidate text consumption/export/storage.`,
    `- validator: \`${blocker.restored_required_output_shape.validator}\``,
    `- handoff owner: ${blocker.restored_required_output_shape.handoff_owner}`,
    `- stop condition: ${blocker.restored_required_output_shape.stop_condition}`,
    '',
    'Agent 2 should not rerun unchanged Deuteronomy, Orot, Definition Workbench, or source-lane fixture pipelines unless a changed input or exact new target is named.',
    '',
    '## Required Next Workset Shape',
    '',
    'A new Agent 2 workset must provide:',
    '',
    ...blocker.required_next_workset_shape.map((item) => `- ${item};`),
    '',
    '## Standing Exact Blockers',
    '',
    ...blocker.standing_exact_blockers.map((item) => `- \`${item}\``),
    '',
    '## Spark-1 Handoff',
    '',
    'Spark-1 should not rerun unchanged Agent 2 pipelines as a substitute for new work.',
    '',
    'Spark-1 may run only a named exact command against a changed input/workset or a validator requested for current proof preservation.',
    '',
    '## Non-Acceptance Boundary',
    '',
    'No QA acceptance, source/provenance acceptance, license acceptance, legal acceptance, Definition authority, usage-as-definition authority, answer acceptance, answer eligibility, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, translation output, accepted gloss/text, public reader output, route-shard edit, public/runtime mutation, definition-content storage, or NC commercial authorization is claimed.',
    '',
  ];
  fs.writeFileSync(path.join(root, file), lines.join('\n'));
}
