#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const paths = {
  rowOverlapBoundary: 'reports/agent1-old-dictionary-row-overlap-lane-boundary-2026-06-05.json',
  rowOverlapBoundaryValidationResult: 'reports/agent1-old-dictionary-row-overlap-lane-boundary-validation-result-2026-06-05.json',
  agent6BoundaryQuestionPacket: 'reports/agent1-old-dictionary-agent6-boundary-question-packet-2026-06-05.json',
  outputJson: 'reports/agent1-old-dictionary-row-overlap-agent6-boundary-supplement-2026-06-05.json',
  outputMd: 'reports/agent1-old-dictionary-row-overlap-agent6-boundary-supplement-2026-06-05.md',
  validator: 'scripts/validate_agent1_old_dictionary_row_overlap_agent6_boundary_supplement.mjs',
  validatorResult: 'reports/agent1-old-dictionary-row-overlap-agent6-boundary-supplement-validation-result-2026-06-05.json'
};

function fullPath(relativePath) {
  return path.join(root, relativePath);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(fullPath(relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(fullPath(relativePath)), { recursive: true });
  fs.writeFileSync(fullPath(relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeText(relativePath, value) {
  fs.mkdirSync(path.dirname(fullPath(relativePath)), { recursive: true });
  fs.writeFileSync(fullPath(relativePath), value, 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const rowOverlap = readJson(paths.rowOverlapBoundary);
const rowOverlapResult = readJson(paths.rowOverlapBoundaryValidationResult);
const priorAgent6Packet = readJson(paths.agent6BoundaryQuestionPacket);

assert(rowOverlap.artifact_type === 'agent1_old_dictionary_row_overlap_lane_boundary', 'row-overlap artifact mismatch');
assert(rowOverlapResult.ok === true, 'row-overlap validation result must be ok');
assert(priorAgent6Packet.artifact_type === 'agent1_old_dictionary_agent6_boundary_question_packet', 'prior Agent 6 packet mismatch');
assert(priorAgent6Packet.boundary_question_counts.delivered_to_agent6_now === 0, 'prior Agent 6 packet must not have delivered rows');

const buckets = rowOverlap.row_overlap_buckets;

const bucketSpecs = [
  {
    bucket_id: 'commercial_clean_only',
    row_subset_id: 'old-dictionary-excluded-row-license-lane-reaudit::row-overlap::commercial-clean-only',
    classification_lanes: ['commercial_clean_candidate'],
    boundary_question_type: 'future_commercial_clean_candidate_use',
    exact_boundary_question: 'If a future exact candidate-use package exists with approved morphology relation, may this public-domain-only subset proceed as nonpublic commercial-clean evidence without NC or blocked-family overlap?',
    exact_blocker: 'commercial_clean_only_missing_future_agent6_candidate_use_boundary_and_morphology_relation',
    handoff_owner: 'Agent 10 for future package assembly; Agent 6 for exact row/subset boundary'
  },
  {
    bucket_id: 'commercial_clean_plus_noncommercial_educational',
    row_subset_id: 'old-dictionary-excluded-row-license-lane-reaudit::row-overlap::commercial-clean-plus-nc',
    classification_lanes: ['commercial_clean_candidate', 'noncommercial_educational_candidate'],
    boundary_question_type: 'commercial_clean_with_nc_overlap_source_family_selection',
    exact_boundary_question: 'For rows with public-domain evidence and Klein NC evidence, may a future package use only the public-domain source-family evidence while excluding NC content, and what row/source-family proof is required?',
    exact_blocker: 'commercial_clean_plus_nc_overlap_missing_agent6_source_family_selection_boundary',
    handoff_owner: 'Agent 6 for source-family selection boundary; Agent 2 blocked until boundary exists'
  },
  {
    bucket_id: 'commercial_clean_plus_blocked_review',
    row_subset_id: 'old-dictionary-excluded-row-license-lane-reaudit::row-overlap::commercial-clean-plus-blocked-review',
    classification_lanes: ['commercial_clean_candidate', 'blocked_or_needs_review'],
    boundary_question_type: 'commercial_clean_with_blocked_overlap_source_family_selection',
    exact_boundary_question: 'For rows with public-domain evidence and BDB Augmented Strong blocked evidence, may a future package use only the public-domain source-family evidence while excluding the blocked family?',
    exact_blocker: 'commercial_clean_plus_blocked_overlap_missing_agent6_source_family_selection_boundary',
    handoff_owner: 'Agent 6 for source-family selection boundary; Agent 1 if BDB Augmented Strong custody evidence appears'
  },
  {
    bucket_id: 'commercial_clean_plus_noncommercial_educational_plus_blocked_review',
    row_subset_id: 'old-dictionary-excluded-row-license-lane-reaudit::row-overlap::commercial-clean-plus-nc-plus-blocked-review',
    classification_lanes: ['commercial_clean_candidate', 'noncommercial_educational_candidate', 'blocked_or_needs_review'],
    boundary_question_type: 'triple_overlap_source_family_selection',
    exact_boundary_question: 'For rows with public-domain, Klein NC, and BDB Augmented Strong blocked evidence, what exact source-family selection and exclusion proof is required before any future nonpublic candidate-use package?',
    exact_blocker: 'triple_overlap_missing_agent6_source_family_selection_boundary',
    handoff_owner: 'Agent 6 for source-family selection boundary; Agent 10 for future package assembly only'
  },
  {
    bucket_id: 'noncommercial_educational_only',
    row_subset_id: 'old-dictionary-excluded-row-license-lane-reaudit::row-overlap::noncommercial-educational-only',
    classification_lanes: ['noncommercial_educational_candidate'],
    boundary_question_type: 'nc_educational_only_no_commercial_export',
    exact_boundary_question: 'For Klein-only NC rows, what exact noncommercial educational storage/display boundary, if any, is permitted, with commercial export remaining false?',
    exact_blocker: 'nc_educational_only_missing_agent6_nc_boundary_no_commercial_authorization',
    handoff_owner: 'Agent 6 for NC boundary; Agent 1 preserves NC lane only'
  },
  {
    bucket_id: 'blocked_review_only',
    row_subset_id: 'old-dictionary-excluded-row-license-lane-reaudit::row-overlap::blocked-review-only',
    classification_lanes: ['blocked_or_needs_review'],
    boundary_question_type: 'zero_row_record_no_current_boundary_delivery',
    exact_boundary_question: 'Zero-row record for BDB Augmented Strong-only rows in this preview; no boundary delivery now.',
    exact_blocker: 'blocked_review_only_zero_rows_no_current_boundary_delivery',
    handoff_owner: 'Agent 1 if future rows or evidence appear'
  },
  {
    bucket_id: 'metadata_or_link_only',
    row_subset_id: 'old-dictionary-excluded-row-license-lane-reaudit::row-overlap::metadata-or-link-only',
    classification_lanes: ['metadata_or_link_only'],
    boundary_question_type: 'zero_row_record_no_current_boundary_delivery',
    exact_boundary_question: 'Zero-row record for metadata/link-only rows in this preview; no boundary delivery now.',
    exact_blocker: 'metadata_or_link_only_zero_rows_no_current_boundary_delivery',
    handoff_owner: 'Agent 1 if metadata/link-only evidence appears'
  },
  {
    bucket_id: 'no_sefaria_source_hit',
    row_subset_id: 'old-dictionary-excluded-row-license-lane-reaudit::row-overlap::no-sefaria-source-hit',
    classification_lanes: ['blocked_or_needs_review'],
    boundary_question_type: 'missing_source_lane_evidence',
    exact_boundary_question: 'Rows with no Sefaria source hit have no source-lane evidence now; what source/license/custody evidence would be required before any future transform lane?',
    exact_blocker: 'no_sefaria_source_hit_missing_source_license_custody_evidence',
    handoff_owner: 'Agent 1 if new source evidence appears; Agent 2 blocked now'
  }
];

const boundaryQuestions = bucketSpecs.map((spec) => {
  const bucket = buckets[spec.bucket_id];
  assert(bucket, `missing row-overlap bucket: ${spec.bucket_id}`);
  return {
    question_id: `${spec.row_subset_id}::agent6_boundary_supplement_question`,
    row_subset_id: spec.row_subset_id,
    row_overlap_bucket: spec.bucket_id,
    classification_lanes: spec.classification_lanes,
    rows: bucket.row_count,
    occurrences: bucket.occurrence_count,
    token_ids_sample: bucket.token_ids_sample || [],
    boundary_question_type: spec.boundary_question_type,
    exact_boundary_question: spec.exact_boundary_question,
    current_allowed_now: {
      planning_evidence: true,
      agent2_transform: false,
      candidate_text_export: false,
      definition_content_storage: false,
      answer_eligibility: false,
      public_emit: false,
      release_action: false,
      agent6_delivery: false
    },
    exact_blocker: spec.exact_blocker,
    handoff_owner: spec.handoff_owner
  };
});

const boundaryQuestionCounts = {
  total_boundary_question_records: boundaryQuestions.length,
  nonzero_boundary_question_records: boundaryQuestions.filter((row) => row.rows > 0).length,
  zero_row_boundary_records: boundaryQuestions.filter((row) => row.rows === 0).length,
  total_rows_represented: boundaryQuestions.reduce((sum, row) => sum + row.rows, 0),
  total_occurrences_represented: boundaryQuestions.reduce((sum, row) => sum + row.occurrences, 0),
  commercial_clean_only_rows: buckets.commercial_clean_only.row_count,
  commercial_clean_plus_nc_rows: buckets.commercial_clean_plus_noncommercial_educational.row_count,
  commercial_clean_plus_blocked_rows: buckets.commercial_clean_plus_blocked_review.row_count,
  triple_overlap_rows: buckets.commercial_clean_plus_noncommercial_educational_plus_blocked_review.row_count,
  nc_only_rows: buckets.noncommercial_educational_only.row_count,
  metadata_or_link_only_rows: buckets.metadata_or_link_only.row_count,
  blocked_review_only_rows: buckets.blocked_review_only.row_count,
  no_source_hit_rows: buckets.no_sefaria_source_hit.row_count,
  delivered_to_agent6_now: 0,
  future_candidate_use_questions_opened_now: 0
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent1_old_dictionary_row_overlap_agent6_boundary_supplement',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent1_old_dictionary_row_overlap_agent6_boundary_supplement.mjs',
  status: 'row_overlap_agent6_boundary_questions_recorded_not_delivered_zero_candidate_use',
  agent: 'Agent 1',
  current_agent1_thread_id: '019e975d-dc9f-7020-a7c8-885d083a837e',
  old_agent1_thread_id: '019dc487-5973-7693-aebf-fb0a75936f50',
  old_agent1_policy: 'archived_do_not_use',
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / direct Agent run mode',
  production_lane: 'Hebrew import/source/license/custody/source-lane evidence',
  target: 'old-dictionary-excluded-row-license-lane-reaudit row-overlap Agent 6 boundary supplement',
  purpose: 'Convert row-overlap buckets into exact Agent 6 row/subset boundary questions without delivery, candidate text, or acceptance claims.',
  inputs: paths,
  required_lane_output_shape: 'target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition',
  prior_agent6_packet_status: priorAgent6Packet.status,
  boundary_question_counts: boundaryQuestionCounts,
  lane_counts_rows: {
    audited_rows: rowOverlap.row_overlap_totals.audited_rows,
    audited_occurrences: rowOverlap.row_overlap_totals.audited_occurrences,
    commercial_clean_candidate_evidence_rows: rowOverlap.row_overlap_totals.commercial_clean_evidence_rows,
    noncommercial_educational_candidate_evidence_rows: rowOverlap.row_overlap_totals.noncommercial_educational_evidence_rows,
    blocked_or_needs_review_evidence_rows: rowOverlap.row_overlap_totals.blocked_review_evidence_rows,
    metadata_or_link_only_rows: rowOverlap.row_overlap_totals.metadata_or_link_only_rows,
    multi_lane_overlap_rows: rowOverlap.row_overlap_totals.multi_lane_overlap_rows,
    allowed_transform_rows_now: 0,
    candidate_text_rows_now: 0,
    agent6_delivery_now: 0
  },
  boundary_questions: boundaryQuestions,
  exact_blockers: boundaryQuestions.map((row) => ({
    row_subset_id: row.row_subset_id,
    row_overlap_bucket: row.row_overlap_bucket,
    rows: row.rows,
    occurrences: row.occurrences,
    blocker: row.exact_blocker,
    handoff_owner: row.handoff_owner
  })),
  handoff_owner: {
    agent2: 'Blocked from transform/candidate text until Agent 1 lane evidence and Agent 6 row/subset boundary exist for an exact future package.',
    agent6: 'This supplement records exact row/subset questions only; delivered_to_agent6_now remains 0.',
    agent10: 'May use the supplement for future boundary/package assembly only; no release route opened now.'
  },
  zero_output_counts: {
    allowed_transform_rows_now: 0,
    candidate_text_rows_now: 0,
    accepted_gloss_rows_now: 0,
    answer_rows_now: 0,
    definition_content_rows_now: 0,
    source_rows_emitted_now: 0,
    public_hud_rows_now: 0,
    route_jsonl_rows_now: 0,
    agent6_delivery_now: 0,
    queue_mutation_count: 0,
    render_mutation_count: 0,
    staging_count: 0,
    release_route_opened_now: 0
  },
  non_acceptance_boundary: {
    no_qa_acceptance: true,
    no_source_license_acceptance: true,
    no_legal_acceptance: true,
    no_definition_authority: true,
    no_runtime_public_acceptance: true,
    no_publication_readiness: true,
    no_product_data_acceptance: true,
    no_answer_acceptance: true,
    no_accepted_gloss_text: true,
    no_nc_commercial_authorization: true,
    no_candidate_text_export_authorization: true,
    no_release_action: true,
    no_public_runtime_mutation: true,
    no_queue_mutation: true,
    no_staging: true,
    no_destructive_repo_action: true
  },
  stop_condition: 'Stop before Agent 6 delivery, Agent 2 transform, candidate text, source/license/legal acceptance, Definition/runtime/publication/product/answer acceptance, queue mutation, render mutation, staging, or release action.'
};

const md = `# Agent 1 Old Dictionary Row-Overlap Agent 6 Boundary Supplement - 2026-06-05

production lane | direct active goal | recallable state/proof artifact | exact blocker | stop condition | correction owner

Hebrew import/source/license/custody/source-lane evidence | row-overlap Agent 6 boundary question supplement | \`${paths.outputJson}\`; validator \`${paths.validator}\` -> \`${paths.validatorResult}\` | multi-lane row subsets need exact Agent 6 source-family selection boundaries; NC-only rows remain noncommercial; no-source-hit rows lack source-lane evidence | ${artifact.stop_condition} | current Agent 1 \`019e975d-dc9f-7020-a7c8-885d083a837e\`; old Agent 1 archived/do-not-use

target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition

\`${artifact.target}\` | \`${paths.rowOverlapBoundary}\`; \`${paths.agent6BoundaryQuestionPacket}\` | ${boundaryQuestionCounts.total_boundary_question_records} boundary records; ${boundaryQuestionCounts.nonzero_boundary_question_records} nonzero records; represented ${boundaryQuestionCounts.total_rows_represented} rows / ${boundaryQuestionCounts.total_occurrences_represented} occurrences; commercial-only ${boundaryQuestionCounts.commercial_clean_only_rows}; commercial+NC ${boundaryQuestionCounts.commercial_clean_plus_nc_rows}; commercial+blocked ${boundaryQuestionCounts.commercial_clean_plus_blocked_rows}; triple-overlap ${boundaryQuestionCounts.triple_overlap_rows}; NC-only ${boundaryQuestionCounts.nc_only_rows}; metadata/link-only ${boundaryQuestionCounts.metadata_or_link_only_rows}; no-source-hit ${boundaryQuestionCounts.no_source_hit_rows} | \`commercial_clean_candidate\`; \`noncommercial_educational_candidate\`; \`metadata_or_link_only\`; \`blocked_or_needs_review\` | ${artifact.exact_blockers.map((row) => row.blocker).join('; ')} | Agent 2 blocked until exact lane evidence plus Agent 6 boundary; Agent 6 future boundary owner; Agent 10 package assembly only | ${artifact.stop_condition}

## Boundary Records

| bucket | lanes | rows | occurrences | blocker |
| --- | --- | ---: | ---: | --- |
${boundaryQuestions.map((row) => `| ${row.row_overlap_bucket} | ${row.classification_lanes.join(', ')} | ${row.rows} | ${row.occurrences} | ${row.exact_blocker} |`).join('\n')}

## Zero Output

- delivered_to_agent6_now: 0
- future_candidate_use_questions_opened_now: 0
- allowed_transform_rows_now: 0
- candidate_text_rows_now: 0
- release_route_opened_now: 0
- queue/render/staging mutations: 0
`;

writeJson(paths.outputJson, artifact);
writeText(paths.outputMd, md);

console.log(JSON.stringify({
  ok: true,
  artifact: paths.outputJson,
  report: paths.outputMd,
  boundary_question_counts: artifact.boundary_question_counts
}, null, 2));
