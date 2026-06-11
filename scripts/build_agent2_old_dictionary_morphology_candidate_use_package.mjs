#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const verdictPath = 'reports/agent6-old-dictionary-morphology-candidate-use-boundary-verdict-2026-06-05.json';
const consumptionPath = 'reports/agent10-agent6-old-dictionary-morphology-candidate-use-verdict-consumption-2026-06-05.json';
const handoffPath = 'reports/agent2-agent10-candidate-use-preflight-handoff-2026-06-05.json';
const matrixPath = 'reports/agent2-old-dictionary-commercial-clean-morphology-relation-matrix-2026-06-05.json';
const outputPath = 'reports/agent2-old-dictionary-morphology-candidate-use-package-2026-06-05.json';
const markdownPath = 'reports/agent2-old-dictionary-morphology-candidate-use-package-2026-06-05.md';

const verdict = readJson(verdictPath);
const consumption = readJson(consumptionPath);
const handoff = readJson(handoffPath);
const matrix = readJson(matrixPath);

assertInputs(verdict, consumption, handoff, matrix);

const queueIds = handoff.exact_subset_for_future_question.queue_ids;
const rowsById = new Map(matrix.rows.map((row) => [row.queue_id, row]));
const selectedRows = queueIds.map((queueId) => {
  const row = rowsById.get(queueId);
  if (!row) throw new Error(`missing queue_id from morphology matrix: ${queueId}`);
  return row;
});

const packageRows = selectedRows.map((row) => ({
  queue_id: row.queue_id,
  token_id: row.token_id,
  lexicon_entry_id: row.lexicon_entry_id,
  occurrences: row.occurrences,
  source_family: row.public_domain_lexicons,
  license_lane: 'commercial_clean_candidate',
  source_rids: row.public_domain_rids,
  morphology_relation_basis: row.preview_relation_class,
  agent2_morphology_relation_status: row.agent2_morphology_relation_status,
  candidate_use_scope: 'nonpublic_candidate_use_planning_input_only',
  derived_from_nc: false,
  commercial_export_allowed: false,
  attribution_required: false,
  corpus_contamination: false,
  answer_eligible: false,
  public_emit: false,
  agent6_boundary_required: true,
}));

const candidateUsePackage = {
  schema_version: '1.0',
  artifact_type: 'agent2_old_dictionary_morphology_candidate_use_package',
  generated_at: '2026-06-05T16:05:00.000Z',
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / source-lane separated lexicon expansion',
  target: 'old-dictionary morphology candidate-use planning package',
  status: 'nonpublic_candidate_use_planning_package_authored_no_text_output',
  inputs: {
    agent6_verdict: verdictPath,
    agent10_verdict_consumption: consumptionPath,
    exact_row_source: handoffPath,
    exact_row_source_pointer: 'exact_subset_for_future_question.queue_ids',
    morphology_matrix: matrixPath,
  },
  accepted_boundary_consumed: {
    disposition: verdict.disposition,
    rows: verdict.accepted_boundary.rows,
    occurrences: verdict.accepted_boundary.occurrences,
    license_lane: verdict.accepted_boundary.license_lane,
    preview_relation_class: verdict.accepted_boundary.preview_relation_class,
    agent2_morphology_relation_status: verdict.accepted_boundary.agent2_morphology_relation_status,
    noncommercial_educational_candidate_rows: verdict.accepted_boundary.noncommercial_educational_candidate_rows,
    permitted_next_step: verdict.accepted_boundary.permitted_next_step,
  },
  counts: {
    package_rows: packageRows.length,
    package_occurrences: sum(packageRows, 'occurrences'),
    unique_queue_ids: new Set(packageRows.map((row) => row.queue_id)).size,
    source_family_values_observed: unique(packageRows.flatMap((row) => row.source_family)).length,
    commercial_clean_candidate_rows: packageRows.length,
    noncommercial_educational_candidate_rows: 0,
    morphology_blocked_rows_excluded: 219,
    exact_after_mark_strip_rows: packageRows.length,
    candidate_text_rows: 0,
    definition_content_rows: 0,
    lemma_content_rows: 0,
    reader_hint_content_rows: 0,
    answer_rows: 0,
    answer_eligible_rows: 0,
    public_emit_rows: 0,
    route_jsonl_rows: 0,
    route_shard_writes: 0,
    public_runtime_mutation: 0,
  },
  rows: packageRows,
  blockers_preserved: [
    'candidate_text_export_blocked',
    'definition_lemma_reader_hint_content_storage_blocked',
    'answer_eligibility_blocked',
    'public_runtime_mutation_blocked',
    'route_writes_blocked',
    'accepted_text_blocked',
    'release_action_blocked',
    '219_morphology_blocked_rows_excluded',
    'actual_text_storage_transform_output_export_answer_or_runtime_mutation_requires_new_agent6_verdict',
  ],
  zero_output_counts: {
    candidate_text_export: 0,
    definition_lemma_reader_hint_content_storage: 0,
    definition_content_rows: 0,
    lemma_content_rows: 0,
    reader_hint_content_rows: 0,
    answer_rows: 0,
    answer_eligible_rows: 0,
    public_reader_output_rows: 0,
    public_emit_rows: 0,
    route_jsonl_rows: 0,
    route_shard_writes: 0,
    public_runtime_mutation: 0,
    source_files_changed: 0,
    token_index_files_changed: 0,
    lexical_payload_files_changed: 0,
    accepted_text_rows: 0,
    release_actions: 0,
    source_license_legal_acceptance: 0,
    commercial_export_authorization: 0,
  },
  highest_permissible_claim: 'Agent2 authored a nonpublic candidate-use planning package over the exact 78 Agent6 WARN-ACCEPTED queue IDs only.',
  handoff_owner: 'Agent 2 definer returns this package to Agent 10; any text storage, transform output, export, answer, route, public/runtime, accepted text, commercial export, or release step must return to Agent 6 first.',
  stop_condition: 'Stop at nonpublic candidate-use planning package. Do not store candidate text, definition/lemma/reader-hint content, mark answers, write routes/shards, mutate runtime/public/source/token-index/lexical files, export candidate text, claim accepted text, commercial export, publication readiness, or release action.',
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

writeJson(outputPath, candidateUsePackage);
writeMarkdown(markdownPath, candidateUsePackage);
console.log(`wrote ${outputPath}`);
console.log(`wrote ${markdownPath}`);

function assertInputs(verdict, consumption, handoff, matrix) {
  if (verdict.disposition !== 'warn_accepted_nonpublic_candidate_use_planning_input_only') throw new Error('Agent6 verdict disposition mismatch');
  if (verdict.accepted_boundary.rows !== 78) throw new Error('Agent6 accepted rows mismatch');
  if (verdict.accepted_boundary.noncommercial_educational_candidate_rows !== 0) throw new Error('Agent6 NC rows must be 0');
  if (consumption.disposition !== verdict.disposition) throw new Error('Agent10 consumption disposition mismatch');
  if (consumption.accepted_boundary.rows !== 78) throw new Error('Agent10 accepted rows mismatch');
  if (handoff.exact_subset_for_future_question.row_count !== 78) throw new Error('handoff row count mismatch');
  if (matrix.counts.agent2_morphology_planning_approved_rows !== 78) throw new Error('matrix approved row count mismatch');
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMarkdown(relativePath, value) {
  const lines = [
    '# Agent 2 Old-Dictionary Morphology Candidate-Use Package',
    '',
    `Generated: ${value.generated_at}`,
    '',
    '| target | row source | rows | occurrences | status | stop condition |',
    '| --- | --- | ---: | ---: | --- | --- |',
    `| ${value.target} | \`${value.inputs.exact_row_source}#${value.inputs.exact_row_source_pointer}\` | ${value.counts.package_rows} | ${value.counts.package_occurrences} | \`${value.status}\` | ${value.stop_condition} |`,
    '',
    '## Boundary',
    '',
    `- Agent6 disposition: \`${value.accepted_boundary_consumed.disposition}\`.`,
    '- License lane: `commercial_clean_candidate`.',
    '- Preview relation class: `exact_after_mark_strip`.',
    '- Agent2 morphology relation status: `agent2_morphology_relation_approved_for_nonpublic_planning`.',
    '- NC rows in package: 0.',
    '- Morphology-blocked rows excluded: 219.',
    '',
    '## Zero Output',
    '',
    '- Candidate text/export/content/answer/public/route/runtime/source/token-index/lexical/release rows: 0.',
    '',
    '## Blockers Preserved',
    '',
    ...value.blockers_preserved.map((blocker) => `- \`${blocker}\``),
    '',
    '## Non-Acceptance Boundary',
    '',
    ...value.non_acceptance_boundary.map((boundary) => `- ${boundary}`),
    '',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
}

function sum(rows, key) {
  return rows.reduce((total, row) => total + Number(row[key] || 0), 0);
}

function unique(values) {
  return [...new Set(values)];
}
