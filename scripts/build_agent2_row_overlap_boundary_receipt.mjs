#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const boundaryPath = 'reports/agent1-old-dictionary-row-overlap-lane-boundary-2026-06-05.json';
const boundaryValidationPath = 'reports/agent1-old-dictionary-row-overlap-lane-boundary-validation-result-2026-06-05.json';
const supplementPath = 'reports/agent1-old-dictionary-row-overlap-agent6-boundary-supplement-2026-06-05.json';
const supplementValidationPath = 'reports/agent1-old-dictionary-row-overlap-agent6-boundary-supplement-validation-result-2026-06-05.json';
const outputPath = 'reports/agent2-row-overlap-boundary-receipt-2026-06-05.json';
const markdownPath = 'reports/agent2-row-overlap-boundary-receipt-2026-06-05.md';

const boundary = readJson(boundaryPath);
const boundaryValidation = readJson(boundaryValidationPath);
const supplement = readJson(supplementPath);
const supplementValidation = readJson(supplementValidationPath);

assertInputs(boundary, boundaryValidation, supplement, supplementValidation);

const receipt = {
  schema_version: '1.0',
  artifact_type: 'agent2_row_overlap_boundary_receipt',
  generated_at: '2026-06-05T23:59:59.950Z',
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / source-lane separated lexicon expansion',
  target: 'old-dictionary row-overlap lane boundary and Agent6 supplement receipt',
  status: 'agent1_row_overlap_boundary_consumed_as_nonpublic_planning_evidence_not_delivered_to_agent6',
  inputs: {
    row_overlap_boundary: boundaryPath,
    row_overlap_boundary_validation: boundaryValidationPath,
    agent6_boundary_supplement: supplementPath,
    agent6_boundary_supplement_validation: supplementValidationPath,
  },
  row_overlap_totals: boundary.row_overlap_totals,
  classification_lanes: boundary.classification_lanes.map((lane) => ({
    license_lane: lane.license_lane,
    source_families: lane.source_families || [],
    row_count: lane.source_family_hit_rows || lane.unique_public_domain_observed_rows || lane.row_count || 0,
    candidate_text_rows_now: lane.candidate_text_rows_now,
    commercial_export_allowed_now: lane.commercial_export_allowed_now ?? false,
    derived_from_nc: lane.derived_from_nc ?? false,
    attribution_required: lane.attribution_required ?? false,
    corpus_contamination: lane.corpus_contamination ?? false,
    agent6_boundary_required: lane.agent6_boundary_required || lane.agent6_boundary_required_if_evidence_appears || false,
  })),
  boundary_question_counts: supplement.boundary_question_counts,
  boundary_question_summaries: supplement.boundary_questions.map((question) => ({
    question_id: question.question_id,
    row_subset_id: question.row_subset_id,
    row_overlap_bucket: question.row_overlap_bucket,
    classification_lanes: question.classification_lanes,
    rows: question.rows,
    occurrences: question.occurrences,
    boundary_question_type: question.boundary_question_type,
    exact_blocker: question.exact_blocker,
    current_allowed_now: question.current_allowed_now,
    handoff_owner: question.handoff_owner,
  })),
  delivery_state: {
    delivered_to_agent6_now: supplement.boundary_question_counts.delivered_to_agent6_now,
    future_candidate_use_questions_opened_now: supplement.boundary_question_counts.future_candidate_use_questions_opened_now,
    agent6_boundary_required_before_agent2_use: true,
  },
  zero_output_counts: {
    allowed_transform_rows_now: 0,
    candidate_text_rows_now: 0,
    candidate_text_export_rows: 0,
    definition_content_rows_now: 0,
    lemma_content_rows_now: 0,
    reader_hint_content_rows_now: 0,
    answer_rows_now: 0,
    answer_eligible_rows_now: 0,
    public_emit_rows_now: 0,
    public_runtime_mutation: 0,
    route_jsonl_rows_now: 0,
    route_shard_writes: 0,
    accepted_text_rows_now: 0,
    agent6_delivery_now: 0,
    source_license_legal_acceptance: 0,
    commercial_export_authorization: 0,
    release_actions: 0,
  },
  exact_blockers: [
    'row_overlap_boundary_questions_not_delivered_to_agent6_no_agent2_transform_or_candidate_use',
    ...supplement.boundary_questions.map((question) => question.exact_blocker),
  ],
  handoff_owner: 'Agent 10/Agent 6 for future row-overlap boundary delivery and verdict; Agent 2 remains no-output until exact delivery and verdict exist.',
  stop_condition: 'Stop at Agent2 row-overlap boundary receipt. Do not transform, store candidate text, store definition/lemma/reader-hint content, mark answers, write routes/shards, mutate runtime/public/source/token-index/lexical files, export candidate text, claim accepted text, commercial export, publication readiness, or release action.',
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

function assertInputs(boundary, boundaryValidation, supplement, supplementValidation) {
  if (boundary.artifact_type !== 'agent1_old_dictionary_row_overlap_lane_boundary') throw new Error('row-overlap boundary artifact_type mismatch');
  if (boundaryValidation.ok !== true) throw new Error('row-overlap boundary validation must be ok');
  if (boundary.row_overlap_totals.audited_rows !== 500) throw new Error('row-overlap rows mismatch');
  if (boundary.row_overlap_totals.multi_lane_overlap_rows !== 279) throw new Error('multi-lane overlap rows mismatch');
  if (supplement.artifact_type !== 'agent1_old_dictionary_row_overlap_agent6_boundary_supplement') throw new Error('supplement artifact_type mismatch');
  if (supplementValidation.ok !== true) throw new Error('supplement validation must be ok');
  if (supplement.boundary_question_counts.total_boundary_question_records !== 8) throw new Error('boundary question count mismatch');
  if (supplement.boundary_question_counts.delivered_to_agent6_now !== 0) throw new Error('supplement must not be delivered to Agent6');
  if (supplement.lane_counts_rows.allowed_transform_rows_now !== 0) throw new Error('supplement transform rows must be 0');
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMarkdown(relativePath, value) {
  const lines = [
    '# Agent 2 Row-Overlap Boundary Receipt',
    '',
    `Generated: ${value.generated_at}`,
    '',
    '| target | audited rows | multi-lane overlap rows | boundary questions | delivered to Agent6 | exact blocker |',
    '| --- | ---: | ---: | ---: | ---: | --- |',
    `| ${value.target} | ${value.row_overlap_totals.audited_rows} | ${value.row_overlap_totals.multi_lane_overlap_rows} | ${value.boundary_question_counts.total_boundary_question_records} | ${value.delivery_state.delivered_to_agent6_now} | \`${value.exact_blockers[0]}\` |`,
    '',
    '## Lane Totals',
    '',
    `- Commercial-clean evidence rows: ${value.row_overlap_totals.commercial_clean_evidence_rows}.`,
    `- NC educational evidence rows: ${value.row_overlap_totals.noncommercial_educational_evidence_rows}.`,
    `- Blocked/review evidence rows: ${value.row_overlap_totals.blocked_review_evidence_rows}.`,
    `- Metadata/link-only rows: ${value.row_overlap_totals.metadata_or_link_only_rows}.`,
    `- No Sefaria source-hit rows: ${value.row_overlap_totals.no_sefaria_source_hit_rows}.`,
    '',
    '## Boundary Questions',
    '',
    ...value.boundary_question_summaries.map((question) => `- \`${question.row_subset_id}\`: rows ${question.rows}, occurrences ${question.occurrences}, blocker \`${question.exact_blocker}\`.`),
    '',
    '## Zero Output',
    '',
    '- Transform/candidate/export/definition/lemma/reader-hint/answer/public/route/runtime/accepted/commercial-export/release rows: 0.',
    '',
    '## Non-Acceptance Boundary',
    '',
    ...value.non_acceptance_boundary.map((boundary) => `- ${boundary}`),
    '',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
}
