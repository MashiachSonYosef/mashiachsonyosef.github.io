#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const blockerPath = 'reports/agent2-morphology-planning-candidate-use-blocker-2026-06-05.json';
const matrixPath = 'reports/agent2-old-dictionary-commercial-clean-morphology-relation-matrix-2026-06-05.json';
const outputPath = 'reports/agent2-agent10-candidate-use-preflight-handoff-2026-06-05.json';
const markdownPath = 'reports/agent2-agent10-candidate-use-preflight-handoff-2026-06-05.md';

const blocker = readJson(blockerPath);
const matrix = readJson(matrixPath);
assertInputs(blocker, matrix);

const planningRows = matrix.rows
  .filter((row) => row.agent2_morphology_relation_status === 'agent2_morphology_relation_approved_for_nonpublic_planning')
  .map((row) => ({
    queue_id: row.queue_id,
    token_id: row.token_id,
    lexicon_entry_id: row.lexicon_entry_id,
    occurrences: row.occurrences,
    relation_basis: row.preview_relation_class,
    source_families: row.public_domain_lexicons,
    source_rids: row.public_domain_rids,
    downstream_blocker: row.exact_blocker,
    candidate_text_rows_now: 0,
    definition_candidate_rows_now: 0,
    lemma_candidate_rows_now: 0,
    reader_hint_candidate_rows_now: 0,
    answer_eligible_rows_now: 0,
    public_emit_rows_now: 0,
  }));

const handoff = {
  schema_version: '1.0',
  artifact_type: 'agent2_agent10_candidate_use_preflight_handoff',
  generated_at: '2026-06-05T12:31:00.000Z',
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / source-lane separated lexicon expansion',
  target: 'Agent10/Agent6 preflight handoff for Agent2 morphology-planning rows',
  status: 'preflight_handoff_only_candidate_use_blocked',
  inputs: {
    morphology_matrix: matrixPath,
    candidate_use_blocker: blockerPath,
  },
  request_to_agent10: {
    requested_action: 'assemble_exact_agent6_row_subset_candidate_use_question_if_and_only_if_release_owner_accepts_preflight_shape',
    current_agent2_authority: 'nonpublic_morphology_planning_evidence_only',
    current_agent2_candidate_use_allowed: false,
    current_agent2_transform_allowed: false,
  },
  exact_subset_for_future_question: {
    relation_status: 'agent2_morphology_relation_approved_for_nonpublic_planning',
    row_count: planningRows.length,
    occurrence_count: sum(planningRows, 'occurrences'),
    queue_ids: planningRows.map((row) => row.queue_id),
    token_ids: planningRows.map((row) => row.token_id),
  },
  source_family_groups: blocker.source_family_groups,
  rows: planningRows,
  required_agent6_question_fields: [
    'row_subset_id',
    'queue_id',
    'token_id',
    'lexicon_entry_id',
    'source_family',
    'license_lane',
    'source_rids',
    'morphology_relation_basis',
    'candidate_use_scope',
    'allowed_fields',
    'disallowed_fields',
    'commercial_export_allowed',
    'answer_eligible',
    'public_emit',
    'definition_content_storage',
    'candidate_text_export',
  ],
  exact_blocker_until_agent10_agent6_packet_exists: 'agent10_agent6_exact_candidate_use_packet_missing_for_78_morphology_planning_rows',
  zero_output_counts: {
    definition_candidate_rows: 0,
    lemma_candidate_rows: 0,
    reader_hint_candidate_rows: 0,
    candidate_text_rows: 0,
    answer_rows: 0,
    answer_eligible_rows: 0,
    public_reader_output_rows: 0,
    route_jsonl_rows: 0,
    route_shard_writes: 0,
    public_runtime_mutation: 0,
    accepted_gloss_text_rows: 0,
    definition_content_rows: 0,
    candidate_text_export_rows: 0,
    release_rows: 0,
  },
  handoff_owner: 'Agent 10 release owner for future exact Agent6 packet; Agent 2 remains blocked from candidate-use transform.',
  stop_condition: 'Stop at preflight handoff. This artifact is not an Agent6 delivery, not a candidate-use package, and not definition/lemma/reader-hint candidate output.',
  non_acceptance_boundary: [
    'No Definition authority',
    'No answer acceptance',
    'No source/license/legal acceptance',
    'No accepted gloss/text',
    'No public/runtime mutation',
    'No route-shard edit',
    'No candidate text export',
    'No NC commercial authorization',
    'No release action',
  ],
};

writeJson(outputPath, handoff);
writeMarkdown(markdownPath, handoff);
console.log(`wrote ${outputPath}`);
console.log(`wrote ${markdownPath}`);

function assertInputs(blocker, matrix) {
  if (blocker.artifact_type !== 'agent2_morphology_planning_candidate_use_blocker') throw new Error('blocker artifact_type mismatch');
  if (blocker.counts.morphology_planning_rows !== 78) throw new Error('blocker planning rows mismatch');
  if (blocker.counts.allowed_candidate_use_rows_now !== 0) throw new Error('blocker candidate-use rows must be 0');
  if (matrix.artifact_type !== 'agent2_old_dictionary_commercial_clean_morphology_relation_matrix') throw new Error('matrix artifact_type mismatch');
  if (matrix.counts.agent2_morphology_planning_approved_rows !== 78) throw new Error('matrix planning rows mismatch');
}

function sum(rows, key) {
  return rows.reduce((total, row) => total + Number(row[key] || 0), 0);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMarkdown(relativePath, handoff) {
  const lines = [
    '# Agent 2 Agent10 Candidate-Use Preflight Handoff',
    '',
    `Generated: ${handoff.generated_at}`,
    '',
    '| target | required Agent 1 fields | transform action once classified | exact blocker if not classified | handoff owner | stop condition |',
    '| --- | --- | --- | --- | --- | --- |',
    `| ${handoff.target} | commercial-clean source lane, exact morphology relation matrix, queue_id/token_id/lexicon_entry_id/source_rids | request Agent10 preflight assembly only; no Agent2 candidate-use transform | ${handoff.exact_blocker_until_agent10_agent6_packet_exists} | ${handoff.handoff_owner} | ${handoff.stop_condition} |`,
    '',
    '## Future Question Subset',
    '',
    `- Rows: ${handoff.exact_subset_for_future_question.row_count}.`,
    `- Occurrences: ${handoff.exact_subset_for_future_question.occurrence_count}.`,
    '- Current candidate-use rows: 0.',
    '- Current transform rows: 0.',
    '',
    '## Required Agent6 Question Fields',
    '',
    ...handoff.required_agent6_question_fields.map((field) => `- \`${field}\``),
    '',
    '## Exact Blocker',
    '',
    `- \`${handoff.exact_blocker_until_agent10_agent6_packet_exists}\``,
    '',
    '## Non-Acceptance Boundary',
    '',
    ...handoff.non_acceptance_boundary.map((boundary) => `- ${boundary}`),
    '',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
}
