#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const consumptionPath = 'reports/agent10-agent2-old-dictionary-morphology-candidate-use-package-consumption-2026-06-05.json';
const handoffReceiptPath = 'reports/agent2-agent10-morphology-candidate-use-handoff-consumption-receipt-2026-06-05.json';
const packagePath = 'reports/agent2-old-dictionary-morphology-candidate-use-package-2026-06-05.json';
const outputPath = 'reports/agent2-agent10-morphology-candidate-use-package-consumption-receipt-2026-06-05.json';
const markdownPath = 'reports/agent2-agent10-morphology-candidate-use-package-consumption-receipt-2026-06-05.md';

const consumption = readJson(consumptionPath);
const handoffReceipt = readJson(handoffReceiptPath);
const pkg = readJson(packagePath);

assertInputs(consumption, handoffReceipt, pkg);

const receipt = {
  schema_version: '1.0',
  artifact_type: 'agent2_agent10_morphology_candidate_use_package_consumption_receipt',
  generated_at: '2026-06-05T23:59:59.000Z',
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / source-lane separated lexicon expansion',
  target: 'Agent10 consumption of Agent2 old-dictionary morphology candidate-use package',
  status: 'agent10_consumed_agent2_package_agent2_wait_closed_no_text_output',
  inputs: {
    agent10_package_consumption: consumptionPath,
    agent2_handoff_consumption_receipt: handoffReceiptPath,
    agent2_package: packagePath,
  },
  consumed_agent10_state: {
    package_workset: consumption.package_workset,
    rows: consumption.row_occurrence_counts.rows,
    occurrences: consumption.row_occurrence_counts.occurrences,
    unique_queue_ids: consumption.row_occurrence_counts.unique_queue_ids,
    morphology_blocked_rows_excluded: consumption.row_occurrence_counts.morphology_blocked_rows_excluded,
    commercial_clean_candidate_rows: consumption.lane_split.commercial_clean_candidate,
    noncommercial_educational_candidate_rows: consumption.lane_split.noncommercial_educational_candidate,
    next_handoff: consumption.next_handoff,
    agent6_boundary_need: consumption.agent6_boundary_need,
  },
  closed_wait: {
    prior_agent10_wait_blocker: 'await_agent2_exact_nonpublic_candidate_use_package_or_exact_blocker_for_78_old_dictionary_rows',
    resolved_by_agent2_package: packagePath,
    resolved_by_agent10_consumption: consumptionPath,
    agent2_wait_remains: false,
  },
  counts: {
    package_rows: pkg.counts.package_rows,
    package_occurrences: pkg.counts.package_occurrences,
    unique_queue_ids: pkg.counts.unique_queue_ids,
    commercial_clean_candidate_rows: pkg.counts.commercial_clean_candidate_rows,
    noncommercial_educational_candidate_rows: pkg.counts.noncommercial_educational_candidate_rows,
    morphology_blocked_rows_excluded: pkg.counts.morphology_blocked_rows_excluded,
    candidate_text_rows: 0,
    candidate_text_export_rows: 0,
    definition_content_rows: 0,
    lemma_content_rows: 0,
    reader_hint_content_rows: 0,
    answer_rows: 0,
    answer_eligible_rows: 0,
    public_emit_rows: 0,
    route_jsonl_rows: 0,
    route_shard_writes: 0,
    public_runtime_mutation: 0,
    accepted_text_rows: 0,
    release_actions: 0,
    commercial_export_authorization: 0,
  },
  validator_results_consumed: consumption.validator_results,
  exact_blocker: consumption.exact_blocker,
  next_handoff_owner: 'Agent 10 release/package state; Agent 6 must issue a later exact verdict before any text/storage/export/answer/route/public-runtime/accepted-text/commercial-export/release step.',
  stop_condition: consumption.stop_condition,
  highest_permissible_claim: "Agent 2 records Agent 10 consumption of Agent 2's exact 78-row non-public candidate-use planning package and closes the prior Agent 2 wait.",
  non_acceptance_boundary: [
    'No Definition authority',
    'No answer acceptance',
    'No answer eligibility',
    'No source/license/legal acceptance',
    'No accepted gloss/text',
    'No public/runtime mutation',
    'No route-shard edit',
    'No candidate text export',
    'No definition/lemma/reader-hint content storage',
    'No commercial export authorization',
    'No NC commercial authorization',
    'No release action',
  ],
};

writeJson(outputPath, receipt);
writeMarkdown(markdownPath, receipt);
console.log(`wrote ${outputPath}`);
console.log(`wrote ${markdownPath}`);

function assertInputs(consumption, handoffReceipt, pkg) {
  if (consumption.artifact_type !== 'agent10_agent2_old_dictionary_morphology_candidate_use_package_consumption') throw new Error('Agent10 consumption artifact_type mismatch');
  if (consumption.row_occurrence_counts.rows !== 78) throw new Error('Agent10 consumption row count mismatch');
  if (consumption.row_occurrence_counts.occurrences !== 1461) throw new Error('Agent10 consumption occurrence count mismatch');
  if (consumption.lane_split.commercial_clean_candidate !== 78) throw new Error('Agent10 consumption commercial-clean count mismatch');
  if (consumption.lane_split.noncommercial_educational_candidate !== 0) throw new Error('Agent10 consumption NC count mismatch');
  if (consumption.zero_counters.candidate_text_rows !== 0) throw new Error('Agent10 consumption candidate text rows must be 0');
  if (!consumption.next_handoff.includes('no Agent 2 wait remains')) throw new Error('Agent10 consumption must close Agent2 wait');
  if (handoffReceipt.artifact_type !== 'agent2_agent10_morphology_candidate_use_handoff_consumption_receipt') throw new Error('Agent2 handoff receipt artifact_type mismatch');
  if (handoffReceipt.counts.package_rows !== 78) throw new Error('Agent2 handoff receipt row count mismatch');
  if (pkg.artifact_type !== 'agent2_old_dictionary_morphology_candidate_use_package') throw new Error('Agent2 package artifact_type mismatch');
  if (pkg.counts.package_rows !== consumption.row_occurrence_counts.rows) throw new Error('package rows do not match Agent10 consumption');
  if (pkg.counts.package_occurrences !== consumption.row_occurrence_counts.occurrences) throw new Error('package occurrences do not match Agent10 consumption');
  if (pkg.counts.candidate_text_rows !== 0) throw new Error('package candidate text rows must be 0');
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMarkdown(relativePath, value) {
  const lines = [
    '# Agent 2 Agent10 Morphology Candidate-Use Package Consumption Receipt',
    '',
    `Generated: ${value.generated_at}`,
    '',
    '| target | rows | occurrences | closed wait | exact blocker | stop condition |',
    '| --- | ---: | ---: | --- | --- | --- |',
    `| ${value.target} | ${value.counts.package_rows} | ${value.counts.package_occurrences} | \`${value.closed_wait.agent2_wait_remains === false}\` | \`${value.exact_blocker}\` | ${value.stop_condition} |`,
    '',
    '## Closed Wait',
    '',
    `- Prior blocker: \`${value.closed_wait.prior_agent10_wait_blocker}\`.`,
    `- Resolved by package: \`${value.closed_wait.resolved_by_agent2_package}\`.`,
    `- Resolved by Agent10 consumption: \`${value.closed_wait.resolved_by_agent10_consumption}\`.`,
    '- Agent 2 wait remains: `false`.',
    '',
    '## Counts',
    '',
    `- Package rows: ${value.counts.package_rows}.`,
    `- Package occurrences: ${value.counts.package_occurrences}.`,
    `- Commercial-clean rows: ${value.counts.commercial_clean_candidate_rows}.`,
    `- NC rows: ${value.counts.noncommercial_educational_candidate_rows}.`,
    `- Morphology-blocked rows excluded: ${value.counts.morphology_blocked_rows_excluded}.`,
    '- Candidate text/export/definition/lemma/reader-hint/answer/public/route/runtime/accepted/release/commercial-export rows: 0.',
    '',
    '## Non-Acceptance Boundary',
    '',
    ...value.non_acceptance_boundary.map((boundary) => `- ${boundary}`),
    '',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
}
