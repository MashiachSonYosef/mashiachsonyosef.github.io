#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputJson = 'reports/agent2-old-dictionary-queue-state-validation-receipt-2026-06-05.json';
const outputMd = 'reports/agent2-old-dictionary-queue-state-validation-receipt-2026-06-05.md';
const paths = {
  queue: 'data/control/spark_standing_queue.json',
  consumption_prep: 'reports/agent2-old-dictionary-excluded-row-reaudit-consumption-prep-2026-06-05.json',
  readiness_matrix: 'reports/agent2-old-dictionary-excluded-row-transform-readiness-matrix-2026-06-05.json',
  agent10_consumption: 'reports/agent10-agent2-old-dictionary-excluded-row-readiness-consumption-2026-06-05.json',
};

const queue = readJson(paths.queue);
const prep = readJson(paths.consumption_prep);
const readiness = readJson(paths.readiness_matrix);
const agent10 = readJson(paths.agent10_consumption);
const agent2Queue = queue.direct_agent_goal_proof.find((row) => row.production_lane === 'Agent 2');
const gateQueue = queue.agent5_executive_support_adjustment.rows.find((row) => row.lane === 'Agent 1 -> Agent 2 source-lane gate');

const receipt = {
  schema_version: '1.0',
  artifact_type: 'agent2_old_dictionary_queue_state_validation_receipt',
  generated_at: new Date().toISOString(),
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / source-lane separated lexicon expansion',
  target: 'Agent 2 old-dictionary excluded-row queue state',
  status: 'queue_points_to_current_validated_readiness_and_exact_blockers',
  validated_artifacts: paths,
  validator_commands: [
    'node scripts/validate_agent2_old_dictionary_excluded_row_reaudit_consumption_prep.mjs reports/agent2-old-dictionary-excluded-row-reaudit-consumption-prep-2026-06-05.json',
    'node scripts/validate_agent2_old_dictionary_excluded_row_transform_readiness_matrix.mjs reports/agent2-old-dictionary-excluded-row-transform-readiness-matrix-2026-06-05.json',
    'node scripts/validate_agent10_agent2_old_dictionary_excluded_row_readiness_consumption.mjs reports/agent10-agent2-old-dictionary-excluded-row-readiness-consumption-2026-06-05.json',
    'node scripts/validate_agent2_old_dictionary_queue_state_validation_receipt.mjs reports/agent2-old-dictionary-queue-state-validation-receipt-2026-06-05.json',
  ],
  queue_assertions: {
    agent2_queue_points_to_consumption_prep: includes(agent2Queue?.current_artifact_or_exact_blocker, 'agent2-old-dictionary-excluded-row-reaudit-consumption-prep-2026-06-05'),
    agent2_queue_points_to_readiness_matrix: includes(agent2Queue?.current_artifact_or_exact_blocker, 'agent2-old-dictionary-excluded-row-transform-readiness-matrix-2026-06-05'),
    agent2_queue_points_to_agent10_consumption: includes(agent2Queue?.current_artifact_or_exact_blocker, 'agent10-agent2-old-dictionary-excluded-row-readiness-consumption-2026-06-05'),
    agent1_to_agent2_gate_classification_present: includes(gateQueue?.recallable_pipeline_state_preserved, 'classification lanes exist'),
    gate_missing_field_names_current_blockers: includes(gateQueue?.missing_field, 'exact Agent 6 row/subset boundary') && includes(gateQueue?.missing_field, 'BDB Augmented Strong'),
  },
  counts: {
    source_family_rows: readiness.matrix_counts.source_family_rows,
    commercial_clean_candidate_source_families: readiness.matrix_counts.commercial_clean_candidate_source_families,
    noncommercial_educational_candidate_source_families: readiness.matrix_counts.noncommercial_educational_candidate_source_families,
    metadata_or_link_only_source_families: readiness.matrix_counts.metadata_or_link_only_source_families,
    blocked_or_needs_review_source_families: readiness.matrix_counts.blocked_or_needs_review_source_families,
    allowed_transform_rows_now: readiness.matrix_counts.allowed_transform_rows_now,
    candidate_text_rows_now: readiness.matrix_counts.candidate_text_rows_now,
    definition_candidate_rows_now: readiness.matrix_counts.definition_candidate_rows_now,
    lemma_candidate_rows_now: readiness.matrix_counts.lemma_candidate_rows_now,
    reader_hint_candidate_rows_now: readiness.matrix_counts.reader_hint_candidate_rows_now,
    answer_eligible_rows_now: readiness.matrix_counts.answer_eligible_rows_now,
    public_emit_rows_now: readiness.matrix_counts.public_emit_rows_now,
  },
  current_exact_blockers: readiness.exact_blockers,
  lane_preservation: {
    current_agent1_thread_id: prep.current_agent1_thread_id,
    commercial_clean_and_nc_separated: agent10.lane_split.commercial_clean_and_nc_separated,
    nc_row_subset_id: agent10.lane_split.nc_row_subset_id,
    nc_derived_from_nc: agent10.lane_split.nc_derived_from_nc,
    nc_commercial_export_allowed: agent10.lane_split.nc_commercial_export_allowed,
    nc_attribution_required: agent10.lane_split.nc_attribution_required,
    blocked_row_subset_id: agent10.lane_split.blocked_row_subset_id,
    unclassified_rows_consumed_as_candidate_text: agent10.lane_split.unclassified_rows_consumed_as_candidate_text,
  },
  zero_output_counts: readiness.zero_output_counts,
  handoff_owner: 'Agent 2 queue-state receipt; Agent 10 has consumed readiness evidence; Agent 6 only receives a future exact row/subset candidate-use package.',
  stop_condition: 'Stop at queue-state receipt and exact blockers. No Definition, lemma, reader-hint, candidate text, answer, public/runtime, accepted text, or release rows may be emitted from current queue state.',
  non_acceptance_boundary: [
    'No Definition authority',
    'No answer acceptance',
    'No source/license/legal acceptance',
    'No accepted gloss/text',
    'No public/runtime mutation',
    'No NC commercial authorization',
    'No release action',
  ],
};

assertReceipt(receipt);
writeJson(outputJson, receipt);
writeMd(outputMd, receipt);
console.log(`wrote ${outputJson}`);
console.log(`wrote ${outputMd}`);

function includes(value, needle) {
  return typeof value === 'string' && value.includes(needle);
}

function assertReceipt(receipt) {
  for (const [key, value] of Object.entries(receipt.queue_assertions)) {
    if (value !== true) throw new Error(`queue assertion failed: ${key}`);
  }
  if (receipt.counts.source_family_rows !== 5) throw new Error('source family count mismatch');
  if (receipt.counts.allowed_transform_rows_now !== 0) throw new Error('allowed transform rows must be 0');
  if (receipt.lane_preservation.nc_commercial_export_allowed !== false) throw new Error('NC commercial export must be false');
  for (const value of Object.values(receipt.zero_output_counts)) {
    if (value !== 0) throw new Error('zero output counter mismatch');
  }
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMd(relativePath, value) {
  const lines = [
    '# Agent 2 Old Dictionary Queue-State Validation Receipt - 2026-06-05',
    '',
    `Status: ${value.status}.`,
    '',
    '## Queue Assertions',
    '',
    ...Object.entries(value.queue_assertions).map(([key, result]) => `- ${key}: \`${result}\``),
    '',
    '## Counts',
    '',
    `- Source-family rows: ${value.counts.source_family_rows}.`,
    `- Commercial-clean / NC / metadata-link / blocked source families: ${value.counts.commercial_clean_candidate_source_families} / ${value.counts.noncommercial_educational_candidate_source_families} / ${value.counts.metadata_or_link_only_source_families} / ${value.counts.blocked_or_needs_review_source_families}.`,
    '- Allowed transform, candidate text, Definition, lemma, reader-hint, answer, public, and accepted-text rows now: 0.',
    '',
    '## Exact Blockers',
    '',
    ...value.current_exact_blockers.map((blocker) => `- \`${blocker}\``),
    '',
    '## Stop Condition',
    '',
    value.stop_condition,
    '',
    '## Boundary',
    '',
    value.non_acceptance_boundary.join('; '),
    '',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
}
