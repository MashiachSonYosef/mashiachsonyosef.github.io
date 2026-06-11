#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const handoffPath = 'reports/agent1-old-dictionary-agent2-transform-lane-handoff-2026-06-04.json';
const handoffValidationPath = 'reports/agent1-old-dictionary-agent2-transform-lane-handoff-validation-result-2026-06-04.json';
const outputPath = 'reports/agent2-agent1-transform-lane-handoff-receipt-2026-06-05.json';
const markdownPath = 'reports/agent2-agent1-transform-lane-handoff-receipt-2026-06-05.md';

const handoff = readJson(handoffPath);
const validation = readJson(handoffValidationPath);

assertInputs(handoff, validation);

const requiredExactFields = [
  'row_subset_id',
  'source_family',
  'license_lane',
  'transform_lane',
  'evidence_path',
  'occurrences',
  'derived_from_nc',
  'commercial_export_allowed',
  'attribution_required',
  'corpus_contamination',
  'agent6_boundary_required',
  'agent2_transform_allowed_now',
  'answer_eligible',
  'public_emit',
  'missing_evidence',
  'handoff_owner',
];

const receipt = {
  schema_version: '1.0',
  artifact_type: 'agent2_agent1_transform_lane_handoff_receipt',
  generated_at: '2026-06-05T23:59:59.995Z',
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / source-lane separated lexicon expansion',
  target: 'old-dictionary-excluded-row-license-lane-reaudit transform-lane handoff',
  status: 'agent1_transform_lane_handoff_consumed_as_nonpublic_planning_evidence_waiting_exact_boundary',
  inputs: {
    agent1_transform_lane_handoff: handoffPath,
    agent1_transform_lane_handoff_validation: handoffValidationPath,
  },
  target_counts: {
    source_family_count: handoff.counts.source_family_count,
    audited_rows: handoff.counts.audited_rows,
    audited_occurrences: handoff.counts.audited_occurrences,
    commercial_clean_source_families: handoff.counts.commercial_clean_source_families,
    noncommercial_educational_source_families: handoff.counts.noncommercial_educational_source_families,
    blocked_or_needs_review_source_families: handoff.counts.blocked_or_needs_review_source_families,
    metadata_or_link_only_source_families: handoff.counts.metadata_or_link_only_source_families,
    agent2_transform_allowed_now_rows: handoff.counts.agent2_transform_allowed_now_rows,
  },
  transform_count_matrix: {
    agent2_transform_candidate_after_agent6_boundary: handoff.transform_counts.agent2_transform_candidate_after_agent6_boundary,
    agent2_nc_educational_hold_separate: handoff.transform_counts.agent2_nc_educational_hold_separate,
    agent2_blocked_or_review_hold: handoff.transform_counts.agent2_blocked_or_review_hold,
  },
  transform_rows: handoff.transform_rows.map((row) => ({
    ...row,
    required_agent1_fields: requiredExactFields,
    transform_action_once_classified: row.transform_lane === 'agent2_transform_candidate_after_agent6_boundary'
      ? 'consume exact row/subset evidence and release Agent2 nonpublic definition/lemma/reader-hint package only after Agent6 exact boundary + approved morphology relation'
      : row.transform_lane === 'agent2_nc_educational_hold_separate'
        ? 'consume as separate NC educational partition only; no commercial-clean transforms and no candidate content until Agent6/Agent 1 NC boundary packet confirms'
        : 'remain blocked/review hold until independent source/license/custody and Agent6 boundary are supplied',
    exact_blocker_if_not_classified: row.missing_evidence.join(', '),
  })),
  exact_blockers: handoff.exact_missing_field_blockers.map((blocker) => ({
    row_subset_id: blocker.row_subset_id,
    source_family: blocker.source_family,
    license_lane: blocker.license_lane,
    missing_evidence: blocker.missing_evidence,
    handoff_owner: blocker.handoff_owner,
    stop_condition: blocker.stop_condition,
  })),
  lane_preservation: {
    handoff_nonces: {
      commercial_clean_and_nc_separated: true,
      metadata_or_link_only_source_families_present: handoff.counts.metadata_or_link_only_source_families > 0,
      blocked_or_needs_review_source_families_present: handoff.counts.blocked_or_needs_review_source_families > 0,
    },
    nc_row_subset_id: handoff.transform_rows.find((row) => row.license_lane === 'noncommercial_educational_candidate')?.row_subset_id,
    blocked_or_review_row_subset_id: handoff.transform_rows.find((row) => row.license_lane === 'blocked_or_needs_review')?.row_subset_id,
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
    source_license_legal_acceptance: 0,
    commercial_export_authorization: 0,
    nc_commercial_authorization: 0,
    release_actions: 0,
  },
  exact_blocker: 'missing_classified_transform_boundary_or_source_license_custody_before_any_candidate_text_definition_lemma_reader_hint_output',
  handoff_owner: 'Agent 10 for future package assembly, Agent 6 for exact row/subset boundary and approval of morphology relation; Agent 1 for any newly appearing evidence gaps.',
  stop_condition: 'Stop at Agent2 transform-lane handoff receipt. Do not transform, store candidate text, store definition/lemma/reader-hint content, mark answers, write routes/shards, mutate runtime/public/source/token-index/lexical files, export candidate text, claim accepted text, commercial export, or release action.',
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

function assertInputs(handoffValue, validationValue) {
  if (handoffValue.artifact_type !== 'agent1_old_dictionary_agent2_transform_lane_handoff') throw new Error('handoff artifact_type mismatch');
  if (handoffValue.status !== 'agent1_old_dictionary_agent2_transform_lane_handoff_ready_for_agent10_agent2_planning_only') throw new Error('handoff status mismatch');
  if (handoffValue.target !== 'old-dictionary-agent2-transform-lane-handoff') throw new Error('handoff target mismatch');
  if (handoffValue.counts.source_family_count !== 5) throw new Error('source family count mismatch');
  if (handoffValue.counts.audited_rows !== 500) throw new Error('audited rows mismatch');
  if (handoffValue.counts.audited_occurrences !== 8427) throw new Error('audited occurrences mismatch');
  if (handoffValue.counts.agent2_transform_allowed_now_rows !== 0) throw new Error('agent2 transform must be 0');
  if (validationValue.ok !== true) throw new Error('handoff validation must be ok');
  if (validationValue.agent2_transform_allowed_now_rows !== 0) throw new Error('validation transform rows must be 0');
  if (!Array.isArray(handoffValue.transform_rows) || handoffValue.transform_rows.length !== 5) throw new Error('handoff rows must include five subsets');
  if (!Array.isArray(handoffValue.exact_missing_field_blockers) || handoffValue.exact_missing_field_blockers.length < 2) throw new Error('handoff blockers missing');
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMarkdown(relativePath, value) {
  const requiredExactFields = [
    'row_subset_id',
    'source_family',
    'license_lane',
    'transform_lane',
    'evidence_path',
    'occurrences',
    'derived_from_nc',
    'commercial_export_allowed',
    'attribution_required',
    'corpus_contamination',
    'agent6_boundary_required',
    'agent2_transform_allowed_now',
    'answer_eligible',
    'public_emit',
    'missing_evidence',
    'handoff_owner',
  ];
  const lines = [
    '# Agent 2 Agent1 Transform Lane Handoff Receipt',
    '',
    `Generated: ${value.generated_at}`,
    '',
    `Target: ${value.target}`,
    `Status: ${value.status}`,
    '',
    '| target | required Agent1 fields | transform action once classified | exact blocker if not classified | handoff owner | stop condition |',
    '| --- | --- | --- | --- | --- | --- |',
    ...value.transform_rows.map((row) => {
      const blockerText = row.exact_blocker_if_not_classified || 'none';
      const fieldsText = row.required_agent1_fields.join(', ');
      const safeFields = fieldsText.replace(/\|/g, '\\|');
      const safeAction = row.transform_action_once_classified.replace(/\|/g, '\\|');
      const safeBlocker = blockerText.replace(/\|/g, '\\|');
      const safeOwner = row.handoff_owner.replace(/\|/g, '\\|');
      const safeStop = value.stop_condition.replace(/\|/g, '\\|');
      return `| ${row.row_subset_id} | ${safeFields} | ${safeAction} | ${safeBlocker} | ${safeOwner} | ${safeStop} |`;
    }),
    '',
    '## Counts',
    '',
    `- Source family count: ${value.target_counts.source_family_count}.`,
    `- Audited rows: ${value.target_counts.audited_rows}.`,
    `- Audited occurrences: ${value.target_counts.audited_occurrences}.`,
    `- Commercial-clean source families: ${value.target_counts.commercial_clean_source_families}.`,
    `- Noncommercial educational source families: ${value.target_counts.noncommercial_educational_source_families}.`,
    `- Blocked/review source families: ${value.target_counts.blocked_or_needs_review_source_families}.`,
    '',
    '## Exact Blockers',
    '',
    ...value.exact_blockers.map((blocker) => `- ${blocker.row_subset_id}: ${blocker.stop_condition}`),
    '',
    '## Non-Acceptance Boundary',
    '',
    ...value.non_acceptance_boundary.map((boundary) => `- ${boundary}`),
    '',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
}
