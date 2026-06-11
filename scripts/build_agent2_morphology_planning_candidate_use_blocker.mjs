#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const matrixPath = 'reports/agent2-old-dictionary-commercial-clean-morphology-relation-matrix-2026-06-05.json';
const boundaryValidationPath = 'reports/agent1-old-dictionary-agent6-boundary-question-packet-validation-result-2026-06-05.json';
const outputPath = 'reports/agent2-morphology-planning-candidate-use-blocker-2026-06-05.json';
const markdownPath = 'reports/agent2-morphology-planning-candidate-use-blocker-2026-06-05.md';

const matrix = readJson(matrixPath);
const boundaryValidation = readJson(boundaryValidationPath);
assertInputs(matrix, boundaryValidation);

const planningRows = matrix.rows.filter((row) => row.agent2_morphology_relation_status === 'agent2_morphology_relation_approved_for_nonpublic_planning');
const blockedRows = matrix.rows.filter((row) => row.agent2_morphology_relation_status !== 'agent2_morphology_relation_approved_for_nonpublic_planning');
const sourceFamilyGroups = groupBySourceFamily(planningRows);

const blocker = {
  schema_version: '1.0',
  artifact_type: 'agent2_morphology_planning_candidate_use_blocker',
  generated_at: '2026-06-05T12:24:00.000Z',
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / source-lane separated lexicon expansion',
  target: 'Agent 2 morphology-planning rows candidate-use blocker',
  status: 'nonpublic_morphology_planning_rows_grouped_candidate_use_blocked',
  inputs: {
    morphology_matrix: matrixPath,
    agent1_agent6_boundary_question_validation: boundaryValidationPath,
  },
  counts: {
    matrix_rows: matrix.counts.unique_preview_rows,
    morphology_planning_rows: planningRows.length,
    morphology_blocked_rows: blockedRows.length,
    morphology_planning_occurrences: sum(planningRows, 'occurrences'),
    allowed_candidate_use_rows_now: 0,
    allowed_transform_rows_now: 0,
    candidate_text_rows_now: 0,
    definition_candidate_rows_now: 0,
    lemma_candidate_rows_now: 0,
    reader_hint_candidate_rows_now: 0,
    answer_eligible_rows_now: 0,
    public_emit_rows_now: 0,
  },
  source_family_groups: sourceFamilyGroups,
  representative_planning_rows: planningRows.slice(0, 20).map(projectRow),
  required_before_candidate_use: [
    'exact_agent6_row_subset_boundary_for_candidate_use',
    'agent10_exact_agent6_packet_for_the_specific_planning_rows',
    'definition_lane_must_still_emit_no_public_or_answer_acceptance',
  ],
  exact_blocker: 'morphology_planning_rows_have_no_delivered_agent6_candidate_use_boundary',
  boundary_validation_state: {
    validated_artifact: boundaryValidation.validated_artifact,
    status: boundaryValidation.status,
    delivered_to_agent6_now: boundaryValidation.delivered_to_agent6_now,
    allowed_transform_rows_now: boundaryValidation.allowed_transform_rows_now,
    candidate_text_rows_now: boundaryValidation.candidate_text_rows_now,
    no_acceptance_claims: boundaryValidation.no_acceptance_claims,
  },
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
  handoff_owner: 'Agent 2 definer holds nonpublic morphology-planning evidence; Agent 10/Agent 6 must supply exact row/subset candidate-use boundary before transform candidates.',
  stop_condition: 'Stop at candidate-use blocker. Do not convert morphology planning rows into definition, lemma, reader-hint candidate rows, answer rows, public output, route writes, accepted text, definition content, export rows, or release artifacts.',
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

writeJson(outputPath, blocker);
writeMarkdown(markdownPath, blocker);
console.log(`wrote ${outputPath}`);
console.log(`wrote ${markdownPath}`);

function assertInputs(matrix, boundaryValidation) {
  if (matrix.artifact_type !== 'agent2_old_dictionary_commercial_clean_morphology_relation_matrix') throw new Error('matrix artifact_type mismatch');
  if (matrix.counts.agent2_morphology_planning_approved_rows !== 78) throw new Error('morphology planning count mismatch');
  if (matrix.counts.allowed_transform_rows_now !== 0) throw new Error('matrix transform rows must be 0');
  if (boundaryValidation.ok !== true) throw new Error('boundary validation must be ok');
  if (boundaryValidation.delivered_to_agent6_now !== false) throw new Error('Agent 6 boundary must not be delivered yet');
  if (boundaryValidation.allowed_transform_rows_now !== 0) throw new Error('boundary validation allowed transform rows must be 0');
}

function groupBySourceFamily(rows) {
  const groups = {};
  for (const row of rows) {
    for (const family of row.public_domain_lexicons) {
      groups[family] ||= {
        license_lane: 'commercial_clean_candidate',
        planning_rows_with_family: 0,
        planning_occurrences_with_family: 0,
      };
      groups[family].planning_rows_with_family += 1;
      groups[family].planning_occurrences_with_family += row.occurrences;
    }
  }
  return groups;
}

function projectRow(row) {
  return {
    queue_id: row.queue_id,
    token_id: row.token_id,
    lexicon_entry_id: row.lexicon_entry_id,
    occurrences: row.occurrences,
    preview_relation_class: row.preview_relation_class,
    agent2_morphology_relation_status: row.agent2_morphology_relation_status,
    exact_blocker: row.exact_blocker,
    public_domain_lexicons: row.public_domain_lexicons,
    public_domain_rids: row.public_domain_rids,
    candidate_text_rows_now: 0,
    definition_candidate_rows_now: 0,
    lemma_candidate_rows_now: 0,
    reader_hint_candidate_rows_now: 0,
    answer_eligible_rows_now: 0,
    public_emit_rows_now: 0,
  };
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

function writeMarkdown(relativePath, blocker) {
  const lines = [
    '# Agent 2 Morphology Planning Candidate-Use Blocker',
    '',
    `Generated: ${blocker.generated_at}`,
    '',
    '| target | required Agent 1 fields | transform action once classified | exact blocker if not classified | handoff owner | stop condition |',
    '| --- | --- | --- | --- | --- | --- |',
    `| ${blocker.target} | commercial-clean lane plus exact morphology matrix rows and Agent6 boundary validation state | carry 78 morphology-planning rows as nonpublic evidence only; no candidate-use rows | ${blocker.exact_blocker} | ${blocker.handoff_owner} | ${blocker.stop_condition} |`,
    '',
    '## Counts',
    '',
    `- Matrix rows: ${blocker.counts.matrix_rows}.`,
    `- Morphology planning rows / occurrences: ${blocker.counts.morphology_planning_rows} / ${blocker.counts.morphology_planning_occurrences}.`,
    `- Morphology blocked rows: ${blocker.counts.morphology_blocked_rows}.`,
    '- Allowed candidate-use rows now: 0.',
    '- Allowed transform rows now: 0.',
    '- Candidate/definition/lemma/reader-hint/answer/public rows now: 0.',
    '',
    '## Boundary State',
    '',
    `- Agent6 delivered now: ${blocker.boundary_validation_state.delivered_to_agent6_now}.`,
    `- Boundary validation status: \`${blocker.boundary_validation_state.status}\`.`,
    `- Exact blocker: \`${blocker.exact_blocker}\`.`,
    '',
    '## Required Before Candidate Use',
    '',
    ...blocker.required_before_candidate_use.map((item) => `- \`${item}\``),
    '',
    '## Source Family Groups',
    '',
    ...Object.entries(blocker.source_family_groups).map(([family, value]) => `- ${family}: ${value.planning_rows_with_family} planning rows, ${value.planning_occurrences_with_family} occurrences, lane \`${value.license_lane}\`.`),
    '',
    '## Non-Acceptance Boundary',
    '',
    ...blocker.non_acceptance_boundary.map((boundary) => `- ${boundary}`),
    '',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
}
