#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packetPath = 'reports/agent1-old-dictionary-agent6-boundary-question-packet-2026-06-05.json';
const validationPath = 'reports/agent1-old-dictionary-agent6-boundary-question-packet-validation-result-2026-06-05.json';
const outputPath = 'reports/agent2-agent1-boundary-question-packet-receipt-2026-06-05.json';
const markdownPath = 'reports/agent2-agent1-boundary-question-packet-receipt-2026-06-05.md';

const packet = readJson(packetPath);
const validation = readJson(validationPath);

assertInputs(packet, validation);

const receipt = {
  schema_version: '1.0',
  artifact_type: 'agent2_agent1_boundary_question_packet_receipt',
  generated_at: '2026-06-05T23:59:59.975Z',
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / source-lane separated lexicon expansion',
  target: 'Agent1 old-dictionary Agent6 boundary-question packet receipt',
  status: 'agent1_boundary_questions_consumed_as_nonpublic_planning_questions_not_delivered_to_agent6',
  inputs: {
    agent1_boundary_question_packet: packetPath,
    agent1_boundary_question_packet_validation: validationPath,
  },
  agent6_prior_planning_verdict: packet.agent6_prior_planning_verdict,
  boundary_question_counts: packet.boundary_question_counts,
  lane_counts_rows: packet.lane_counts_rows,
  boundary_question_summaries: packet.boundary_questions.map((question) => ({
    question_id: question.question_id,
    row_subset_id: question.row_subset_id,
    source_family: question.source_family,
    license_lane: question.license_lane,
    rows: question.rows,
    occurrences: question.occurrences,
    current_status: question.current_status,
    current_allowed_now: question.current_allowed_now,
    exact_blocker: question.exact_blocker,
    handoff_owner: question.handoff_owner,
    required_flags_to_preserve: question.required_flags_to_preserve || null,
  })),
  delivery_state: {
    delivered_to_agent6_now: packet.boundary_question_counts.delivered_to_agent6_now,
    future_candidate_use_questions_opened_now: packet.boundary_question_counts.future_candidate_use_questions_opened_now,
    requires_future_exact_delivery: true,
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
    'agent1_boundary_question_packet_not_delivered_to_agent6_no_agent2_transform_or_candidate_use',
    ...packet.boundary_questions.map((question) => question.exact_blocker),
  ],
  handoff_owner: 'Agent 10/Agent 6 for future exact boundary delivery and verdict; Agent 2 remains no-output until delivery and verdict exist.',
  stop_condition: 'Stop at Agent2 Agent1-boundary-question receipt. Do not transform, store candidate text, store definition/lemma/reader-hint content, mark answers, write routes/shards, mutate runtime/public/source/token-index/lexical files, export candidate text, claim accepted text, commercial export, publication readiness, or release action.',
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

function assertInputs(packet, validation) {
  if (packet.artifact_type !== 'agent1_old_dictionary_agent6_boundary_question_packet') throw new Error('boundary question packet artifact_type mismatch');
  if (packet.status !== 'agent1_agent6_boundary_questions_recorded_not_delivered_zero_candidate_use') throw new Error('boundary question packet status mismatch');
  if (packet.current_agent1_thread_id !== '019e975d-dc9f-7020-a7c8-885d083a837e') throw new Error('current Agent1 thread mismatch');
  if (packet.boundary_question_counts.total_boundary_question_rows !== 6) throw new Error('boundary question row count mismatch');
  if (packet.boundary_question_counts.delivered_to_agent6_now !== 0) throw new Error('boundary question packet must not be delivered to Agent6');
  if (packet.lane_counts_rows.allowed_transform_rows_now !== 0) throw new Error('transform rows must be 0');
  if (packet.lane_counts_rows.candidate_text_rows_now !== 0) throw new Error('candidate text rows must be 0');
  if (validation.ok !== true) throw new Error('validation must be ok');
  if (validation.exact_blocker_count !== 6) throw new Error('validation blocker count mismatch');
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMarkdown(relativePath, value) {
  const lines = [
    '# Agent 2 Agent1 Boundary-Question Packet Receipt',
    '',
    `Generated: ${value.generated_at}`,
    '',
    '| target | boundary rows | commercial clean | NC | blocked/review | delivered to Agent6 | exact blocker |',
    '| --- | ---: | ---: | ---: | ---: | ---: | --- |',
    `| ${value.target} | ${value.boundary_question_counts.total_boundary_question_rows} | ${value.boundary_question_counts.commercial_clean_candidate_questions} | ${value.boundary_question_counts.noncommercial_educational_candidate_questions} | ${value.boundary_question_counts.blocked_or_needs_review_questions} | ${value.delivery_state.delivered_to_agent6_now} | \`${value.exact_blockers[0]}\` |`,
    '',
    '## Boundary Questions',
    '',
    ...value.boundary_question_summaries.map((question) => `- \`${question.row_subset_id}\`: \`${question.license_lane}\`, rows ${question.rows}, occurrences ${question.occurrences}, blocker \`${question.exact_blocker}\`.`),
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
