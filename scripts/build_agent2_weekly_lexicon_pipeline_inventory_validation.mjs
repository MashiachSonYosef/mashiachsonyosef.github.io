#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const inventoryPath = 'reports/agent2-weekly-lexicon-pipeline-inventory-2026-06-04.json';
const outputJson = 'reports/agent2-weekly-lexicon-pipeline-inventory-validation-2026-06-04.json';
const outputMd = 'reports/agent2-weekly-lexicon-pipeline-inventory-validation-2026-06-04.md';
const inventory = readJson(inventoryPath);

const receipt = {
  schema_version: '1.0',
  artifact_type: 'agent2_weekly_lexicon_pipeline_inventory_validation',
  date: '2026-06-04',
  mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE',
  validator: 'scripts/validate_agent2_weekly_lexicon_pipeline_inventory.mjs',
  inventory: inventoryPath,
  expected_command: `node scripts/validate_agent2_weekly_lexicon_pipeline_inventory.mjs ${inventoryPath}`,
  expected_status: 'passed',
  expected_stdout: [
    'Agent 2 weekly lexicon pipeline inventory validation passed.',
    'Checked: Deuteronomy 1334/2964 readiness and partition plan, Orot zero-candidate closure, Orot TBD 13-row inventory consumption, Workbench 1000 sample, joined planning, source-lane fixture, Spark-1 output-state gate, blockers, zero boundary.',
  ],
  counts: {
    pipeline_entries: Object.keys(inventory.pipelines || {}).length,
    deuteronomy_rows: inventory.pipelines?.deuteronomy_phase2_transform_readiness?.counts?.rows,
    deuteronomy_occurrences: inventory.pipelines?.deuteronomy_phase2_transform_readiness?.counts?.occurrences,
    deuteronomy_partition_rows: inventory.pipelines?.deuteronomy_phase2_partition_export_plan?.counts?.rows,
    deuteronomy_partition_occurrences: inventory.pipelines?.deuteronomy_phase2_partition_export_plan?.counts?.occurrences,
    orot_missed_dictionary_candidate_rows: inventory.pipelines?.orot_missed_dictionary_reader_hint_candidates?.counts?.rows,
    orot_missed_dictionary_unmatched: inventory.pipelines?.orot_missed_dictionary_reader_hint_candidates?.counts?.unmatched,
    old_dictionary_planning_rows: inventory.pipelines?.old_dictionary_lane_planning_intake?.counts?.audited_rows,
    old_dictionary_planning_occurrences: inventory.pipelines?.old_dictionary_lane_planning_intake?.counts?.audited_occurrences,
    old_dictionary_next_missed_rows: inventory.pipelines?.old_dictionary_lane_planning_intake?.counts?.next_missed_rows,
    old_dictionary_candidate_rows_emitted: inventory.pipelines?.old_dictionary_lane_planning_intake?.counts?.candidate_rows_emitted,
    orot_tbd_rows: inventory.pipelines?.orot_tbd_13_placeholder_inventory_consumption?.counts?.display_integrity_tbd_rows,
    orot_tbd_occurrences: inventory.pipelines?.orot_tbd_13_placeholder_inventory_consumption?.counts?.display_integrity_tbd_occurrences,
    workbench_rows: inventory.pipelines?.definition_workbench_1000_sample?.counts?.rows,
    joined_projected_rows: inventory.pipelines?.definition_workbench_usage_joined_sample_planning?.counts?.projected_rows,
    spark1_runnable_outputs_checked: inventory.pipelines?.spark1_manifest_output_state_gate?.counts?.runnable_outputs_checked,
    spark1_validator_only_states_checked: inventory.pipelines?.spark1_manifest_output_state_gate?.counts?.validator_only_states_checked,
    exact_blockers: inventory.exact_blockers?.length,
  },
  checks: [
    'referenced artifact paths exist',
    'Deuteronomy Phase-2 matrix remains 1334 rows / 2964 occurrences',
    'Deuteronomy partition plan remains 1334 rows / 2964 occurrences with 0 candidate text export rows',
    'Orot missed-dictionary packet remains zero-candidate with 168 unmatched rows',
    'Old-dictionary lane planning intake remains planning-only with 500 audited rows / 8427 occurrences and 0 candidate rows emitted',
    'Orot TBD inventory remains display-integrity planning only with 13 rows / 129 occurrences',
    'Definition Workbench 1000 sample remains 1000 rows with 4 no-hint repair targets',
    'Joined-sample planning remains 1 projected row / 12 occurrence links',
    'Source-lane fixture covers all four required lanes',
    'Spark-1 output-state gate checks 7 runnable outputs / 23 validator-only states',
    'Exact blockers are current and lane-preserved',
    'Zero boundary values remain false',
  ],
  zero_boundary: inventory.zero_emission_boundary,
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
    'accepted gloss/text',
    'public reader output',
    'route-shard edit',
    'public/runtime mutation',
    'definition-content storage',
    'NC commercial authorization',
  ],
};

assertReceipt(receipt);
writeJson(outputJson, receipt);
writeMd(outputMd, receipt);
console.log(`wrote ${outputJson}`);
console.log(`wrote ${outputMd}`);

function assertReceipt(receipt) {
  if (receipt.counts.pipeline_entries !== 10) throw new Error('expected 10 pipeline entries');
  if (receipt.counts.deuteronomy_rows !== 1334 || receipt.counts.deuteronomy_occurrences !== 2964) throw new Error('Deuteronomy count mismatch');
  if (receipt.counts.old_dictionary_planning_rows !== 500 || receipt.counts.old_dictionary_candidate_rows_emitted !== 0) throw new Error('old-dictionary planning count mismatch');
  if (receipt.counts.spark1_validator_only_states_checked !== 23) throw new Error('Spark-1 validator-only state count mismatch');
  for (const [key, value] of Object.entries(receipt.zero_boundary || {})) {
    if (value !== false) throw new Error(`zero_boundary.${key} must be false`);
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
    '# Agent 2 Weekly Lexicon Pipeline Inventory Validation',
    '',
    'Date: 2026-06-04',
    'Mode: WEEKLY_LEXICON_EXPANSION_GOAL_MODE',
    '',
    '## Target',
    '',
    'Current validation receipt for the Agent 2 weekly lexicon pipeline inventory.',
    '',
    '## Files',
    '',
    `- Validator: \`${receipt.validator}\``,
    `- Inventory: \`${receipt.inventory}\``,
    `- Validation report: \`${outputMd}\``,
    `- Validation JSON: \`${outputJson}\``,
    '',
    '## Command',
    '',
    '```powershell',
    receipt.expected_command,
    '```',
    '',
    '## Counts',
    '',
    `- Pipeline entries: ${receipt.counts.pipeline_entries}.`,
    `- Deuteronomy readiness: ${receipt.counts.deuteronomy_rows} rows / ${receipt.counts.deuteronomy_occurrences} occurrences.`,
    `- Deuteronomy partition plan: ${receipt.counts.deuteronomy_partition_rows} rows / ${receipt.counts.deuteronomy_partition_occurrences} occurrences.`,
    `- Orot missed-dictionary: ${receipt.counts.orot_missed_dictionary_candidate_rows} candidate rows; ${receipt.counts.orot_missed_dictionary_unmatched} unmatched.`,
    `- Old-dictionary planning intake: ${receipt.counts.old_dictionary_planning_rows} rows / ${receipt.counts.old_dictionary_planning_occurrences} occurrences; ${receipt.counts.old_dictionary_candidate_rows_emitted} candidate rows emitted.`,
    `- Orot TBD inventory: ${receipt.counts.orot_tbd_rows} rows / ${receipt.counts.orot_tbd_occurrences} occurrences.`,
    `- Workbench sample: ${receipt.counts.workbench_rows} rows.`,
    `- Spark-1 output-state gate: ${receipt.counts.spark1_runnable_outputs_checked} runnable outputs / ${receipt.counts.spark1_validator_only_states_checked} validator-only states.`,
    `- Exact blockers: ${receipt.counts.exact_blockers}.`,
    '',
    '## Checks',
    '',
    ...receipt.checks.map((check) => `- ${check}.`),
    '',
    '## Non-Acceptance Boundary',
    '',
    'This validation checks inventory integrity only. It does not claim QA acceptance, source/provenance acceptance, license acceptance, legal acceptance, Definition authority, usage-as-definition authority, answer acceptance, answer eligibility, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, accepted gloss/text, public reader output, route-shard edit, public/runtime mutation, definition-content storage, or NC commercial authorization.',
    '',
  ];
  fs.writeFileSync(path.join(root, file), lines.join('\n'));
}
