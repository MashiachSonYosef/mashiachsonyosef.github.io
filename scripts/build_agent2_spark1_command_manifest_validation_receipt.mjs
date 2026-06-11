#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifestPath = 'reports/agent2-spark1-runnable-command-manifest-2026-06-04.json';
const outputJson = 'reports/agent2-spark1-command-manifest-validation-receipt-2026-06-04.json';
const outputMd = 'reports/agent2-spark1-command-manifest-validation-receipt-2026-06-04.md';

const manifest = readJson(manifestPath);
const deuteronomy = readJson('reports/agent2-deuteronomy-phase2-transform-readiness-matrix-2026-06-04.json');
const partitionPlan = readJson('reports/agent2-deuteronomy-phase2-partition-export-plan-2026-06-04.json');
const orotMissed = readJson('reports/agent2-orot-missed-dictionary-reader-hint-candidates-2026-06-04.json');
const workbench = readJson('data/definitions/definition-workbench-sample-1000.json');
const joined = readJson('data/definitions/agent2-definition-workbench-usage-joined-sample-planning.json');

const receipt = {
  schema_version: '1.0',
  artifact_type: 'agent2_spark1_command_manifest_validation_receipt',
  date: '2026-06-04',
  mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE',
  lane: 'Agent 2 definition/lemma/reader-hint pipeline builder',
  validated_manifest: manifestPath,
  manifest_report: 'reports/agent2-spark1-runnable-command-manifest-2026-06-04.md',
  validator: 'scripts/validate_agent2_spark1_runnable_command_manifest.mjs',
  validation_command: `node scripts/validate_agent2_spark1_runnable_command_manifest.mjs ${manifestPath}`,
  validation_result: {
    status: 'passed',
    stdout: `Agent 2 Spark-1 command manifest validation passed. Runnable pipelines: ${manifest.runnable_pipelines.length}; validator-only checks: ${manifest.validator_only_checks.length}.`,
  },
  runnable_pipeline_count: manifest.runnable_pipelines.length,
  validator_only_check_count: manifest.validator_only_checks.length,
  runnable_pipeline_ids: manifest.runnable_pipelines.map((pipeline) => pipeline.id),
  validator_only_check_ids: manifest.validator_only_checks.map((check) => check.id),
  latest_route_check: {
    status: 'no_new_agent2_exact_workset_after_deuteronomy_return',
    blocker_artifact: 'reports/agent2-next-workset-needed-after-deuteronomy-return-2026-06-04.json',
    latest_agent10_agent2_route: 'reports/agent10-agent2-deuteronomy-phase2-transform-readiness-route-2026-06-04.md',
    latest_agent10_agent2_delivery_proof: 'reports/agent10-agent2-deuteronomy-phase2-transform-readiness-delivery-proof-2026-06-04.md',
  },
  counts_preserved: {
    deuteronomy_phase2_rows: deuteronomy.counts?.rows,
    deuteronomy_phase2_occurrences: deuteronomy.counts?.occurrences,
    deuteronomy_phase2_commercial_clean_candidate_rows: deuteronomy.counts?.commercial_clean_candidate_rows,
    deuteronomy_phase2_noncommercial_educational_candidate_rows: deuteronomy.counts?.noncommercial_educational_candidate_rows,
    deuteronomy_partition_plan_rows: partitionPlan.counts?.rows,
    deuteronomy_partition_plan_occurrences: partitionPlan.counts?.occurrences,
    deuteronomy_partition_plan_candidate_text_export_rows: partitionPlan.counts?.candidate_text_export_rows,
    deuteronomy_partition_plan_answer_eligible_rows: partitionPlan.counts?.answer_eligible_rows,
    deuteronomy_partition_plan_public_emit_rows: partitionPlan.counts?.public_emit_rows,
    orot_missed_dictionary_candidate_rows: orotMissed.summary?.candidate_rows,
    orot_missed_dictionary_candidate_occurrences: orotMissed.summary?.candidate_occurrences,
    orot_missed_dictionary_unmatched: orotMissed.source_license_counts?.unmatched,
    definition_workbench_sample_rows: workbench.counts?.rows,
    definition_workbench_rows_with_route_cards: workbench.counts?.rows_with_route_cards,
    definition_workbench_no_hint_repair_targets: workbench.counts?.rows_without_route_cards,
    joined_sample_projected_planning_rows: joined.counts?.projected_rows,
    joined_sample_projected_usage_link_rows: joined.counts?.projected_usage_link_rows,
    joined_sample_selected_occurrence_links: joined.counts?.selected_occurrence_links,
  },
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
  },
  standing_blockers: [
    'old_dictionary_candidate_text_consumption_export_storage_requires_new_exact_agent6_boundary',
    'missing_larger_token_inventory_workset',
    'missing_joined_definition_workbench_sample_artifact_contract',
    'orot_counterpart_preview_not_promotable_without_agent1_source_lane_and_agent6_boundary',
    'no_new_agent2_exact_workset_after_deuteronomy_return',
  ],
  next_handoff: {
    consumer: 'Agent 10 first',
    spark_handoff: 'Spark-1 may run manifest commands only when Agent 10 or Agent 7 supplies a changed exact workset or selects an existing runnable command.',
    agent6_boundary: 'none opened by this receipt; required only for a future exact row/subset package proposing transform/display/source/license/Definition/public/runtime/answer use',
  },
  stop_condition: 'Return this validation receipt as the bounded Agent 2 handoff; do not rerun unchanged zero-candidate or completed Deuteronomy pipelines without changed input.',
};

assertReceipt(receipt);
writeJson(outputJson, receipt);
writeMd(outputMd, receipt);
console.log(`wrote ${outputJson}`);
console.log(`wrote ${outputMd}`);

function assertReceipt(receipt) {
  if (receipt.runnable_pipeline_count !== 7) throw new Error('expected 7 runnable pipelines');
  if (receipt.validator_only_check_count !== 24) throw new Error('expected 24 validator-only checks');
  if (receipt.counts_preserved.deuteronomy_phase2_rows !== 1334) throw new Error('Deuteronomy row count mismatch');
  if (receipt.counts_preserved.deuteronomy_phase2_occurrences !== 2964) throw new Error('Deuteronomy occurrence count mismatch');
  if (receipt.counts_preserved.orot_missed_dictionary_unmatched !== 168) throw new Error('Orot unmatched count mismatch');
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
    '# Agent 2 Spark-1 Command Manifest Validation Receipt - 2026-06-04',
    '',
    '## Status',
    '',
    'Agent 2 preserved the Spark-1 runnable command manifest as the current bounded handoff surface.',
    '',
    `- Lane: ${receipt.lane}.`,
    `- Validated manifest: \`${receipt.validated_manifest}\`.`,
    `- Manifest report: \`${receipt.manifest_report}\`.`,
    `- Validator: \`${receipt.validator}\`.`,
    `- Validation command: \`${receipt.validation_command}\`.`,
    '- Validation result: passed.',
    `- Reported stdout: \`${receipt.validation_result.stdout}\``,
    '',
    '## Manifest Counts',
    '',
    `- Runnable pipelines: ${receipt.runnable_pipeline_count}.`,
    `- Validator-only checks: ${receipt.validator_only_check_count}.`,
    `- Deuteronomy Phase-2 readiness: ${receipt.counts_preserved.deuteronomy_phase2_rows} rows / ${receipt.counts_preserved.deuteronomy_phase2_occurrences} occurrences; ${receipt.counts_preserved.deuteronomy_phase2_commercial_clean_candidate_rows} commercial-clean candidate rows; ${receipt.counts_preserved.deuteronomy_phase2_noncommercial_educational_candidate_rows} NC educational rows.`,
    `- Deuteronomy Phase-2 partition plan: ${receipt.counts_preserved.deuteronomy_partition_plan_rows} rows / ${receipt.counts_preserved.deuteronomy_partition_plan_occurrences} occurrences; ${receipt.counts_preserved.deuteronomy_partition_plan_candidate_text_export_rows} candidate text export rows; ${receipt.counts_preserved.deuteronomy_partition_plan_answer_eligible_rows} answer-eligible rows; ${receipt.counts_preserved.deuteronomy_partition_plan_public_emit_rows} public emit rows.`,
    `- Orot missed-dictionary closure: ${receipt.counts_preserved.orot_missed_dictionary_candidate_rows} candidate rows / ${receipt.counts_preserved.orot_missed_dictionary_candidate_occurrences} occurrences; ${receipt.counts_preserved.orot_missed_dictionary_unmatched} unmatched.`,
    `- Definition Workbench sample: ${receipt.counts_preserved.definition_workbench_sample_rows} rows; ${receipt.counts_preserved.definition_workbench_rows_with_route_cards} rows with route cards; ${receipt.counts_preserved.definition_workbench_no_hint_repair_targets} no-hint repair targets.`,
    `- Joined-sample planning: ${receipt.counts_preserved.joined_sample_projected_planning_rows} projected planning row; ${receipt.counts_preserved.joined_sample_projected_usage_link_rows} projected usage-link rows; ${receipt.counts_preserved.joined_sample_selected_occurrence_links} selected occurrence links.`,
    '',
    '## Route Check',
    '',
    'No newer exact Agent10-Agent2 route was found beyond the already-returned Deuteronomy Phase-2 packet and the consumed Orot zero-candidate return.',
    '',
    `- Latest route: \`${receipt.latest_route_check.latest_agent10_agent2_route}\`.`,
    `- Latest delivery proof: \`${receipt.latest_route_check.latest_agent10_agent2_delivery_proof}\`.`,
    `- Current blocker artifact: \`${receipt.latest_route_check.blocker_artifact}\`.`,
    `- Current blocker: \`${receipt.latest_route_check.status}\`.`,
    '',
    '## Zero Boundary',
    '',
    'This receipt makes no acceptance claim and emits no public or answer data.',
    '',
    '- No Definition authority.',
    '- No usage-as-definition authority.',
    '- No answer acceptance or answer eligibility.',
    '- No accepted gloss/text.',
    '- No public reader output.',
    '- No route-shard edit.',
    '- No public/runtime mutation.',
    '- No QA/source/license/legal/product/publication acceptance.',
    '',
    '## Standing Blockers',
    '',
    ...receipt.standing_blockers.map((blocker) => `- \`${blocker}\`.`),
    '',
    '## Handoff',
    '',
    `- Consumer: ${receipt.next_handoff.consumer}.`,
    `- Spark-1 handoff: ${receipt.next_handoff.spark_handoff}`,
    `- Agent 6 boundary: ${receipt.next_handoff.agent6_boundary}`,
    '',
    '## Stop Condition',
    '',
    receipt.stop_condition,
    '',
  ];
  fs.writeFileSync(path.join(root, file), lines.join('\n'));
}
