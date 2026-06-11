#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const membershipPath = 'reports/agent1-old-dictionary-source-family-membership-manifest-2026-06-05.json';
const membershipValidationPath = 'reports/agent1-old-dictionary-source-family-membership-manifest-validation-result-2026-06-05.json';
const overlapPath = 'reports/agent1-old-dictionary-source-family-overlap-matrix-2026-06-05.json';
const overlapValidationPath = 'reports/agent1-old-dictionary-source-family-overlap-matrix-validation-result-2026-06-05.json';
const outputPath = 'reports/agent2-source-family-membership-overlap-receipt-2026-06-05.json';
const markdownPath = 'reports/agent2-source-family-membership-overlap-receipt-2026-06-05.md';

const membership = readJson(membershipPath);
const membershipValidation = readJson(membershipValidationPath);
const overlap = readJson(overlapPath);
const overlapValidation = readJson(overlapValidationPath);

assertInputs(membership, membershipValidation, overlap, overlapValidation);

const receipt = {
  schema_version: '1.0',
  artifact_type: 'agent2_source_family_membership_overlap_receipt',
  generated_at: '2026-06-05T23:59:59.750Z',
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / source-lane separated lexicon expansion',
  target: 'old-dictionary source-family membership and overlap evidence consumption',
  status: 'agent1_source_family_membership_and_overlap_consumed_as_nonpublic_planning_evidence_only',
  inputs: {
    membership_manifest: membershipPath,
    membership_validation: membershipValidationPath,
    overlap_matrix: overlapPath,
    overlap_validation: overlapValidationPath,
  },
  count_semantics: {
    source_family_membership_counts_are_nonexclusive: true,
    exclusive_export_row_counts_authorized_now: false,
  },
  membership_counts: membership.membership_counts,
  lane_counts: membership.lane_counts,
  source_family_summary: membership.source_family_manifests.map((entry) => ({
    row_subset_id: entry.row_subset_id,
    source_family: entry.source_family,
    license_lane: entry.license_lane,
    row_count: entry.row_count,
    occurrence_count: entry.occurrence_count,
    token_ids_sha256: entry.token_ids_sha256,
    exact_blocker: entry.exact_blocker,
  })),
  overlap_counts: overlap.matrix_counts,
  source_families: overlap.source_families,
  overlap_risk_summary: {
    commercial_internal_pair_rows: overlap.matrix_counts.commercial_internal_pair_rows,
    commercial_with_nc_pair_rows: overlap.matrix_counts.commercial_with_nc_pair_rows,
    commercial_with_blocked_pair_rows: overlap.matrix_counts.commercial_with_blocked_pair_rows,
    nc_with_blocked_pair_rows: overlap.matrix_counts.nc_with_blocked_pair_rows,
    requires_source_family_selection_boundary: true,
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
    release_actions: 0,
  },
  exact_blockers: [
    'source_family_membership_counts_are_nonexclusive_no_exclusive_export_row_counts_authorized',
    'source_family_overlap_matrix_requires_exact_agent6_source_family_selection_boundary_before_agent2_transform_candidate_text_definition_lemma_reader_hint_answer_public_runtime_route_export_or_release_use',
    'commercial_with_nc_overlap_rows_preserve_nc_separation_no_commercial_clean_contamination',
    'commercial_with_blocked_overlap_rows_preserve_blocked_review_separation_no_transform_use',
  ],
  handoff_owner: 'Agent 10/Agent 6 for source-family selection boundary; Agent 2 remains no-output until an exact Agent6 boundary exists.',
  stop_condition: 'Stop at Agent2 source-family evidence receipt. Do not transform, store candidate text, store definition/lemma/reader-hint content, mark answers, write routes/shards, mutate runtime/public/source/token-index/lexical files, export candidate text, claim accepted text, commercial export, publication readiness, or release action.',
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

function assertInputs(membership, membershipValidation, overlap, overlapValidation) {
  if (membership.artifact_type !== 'agent1_old_dictionary_source_family_membership_manifest') throw new Error('membership artifact_type mismatch');
  if (membershipValidation.ok !== true) throw new Error('membership validation must be ok');
  if (membership.membership_counts.source_family_count !== 5) throw new Error('source family count mismatch');
  if (membership.membership_counts.unique_preview_rows !== 500) throw new Error('unique preview rows mismatch');
  if (membership.membership_counts.allowed_transform_rows_now !== 0) throw new Error('membership transform rows must be 0');
  if (overlap.artifact_type !== 'agent1_old_dictionary_source_family_overlap_matrix') throw new Error('overlap artifact_type mismatch');
  if (overlapValidation.ok !== true) throw new Error('overlap validation must be ok');
  if (overlap.matrix_counts.source_family_count !== 5) throw new Error('overlap source family count mismatch');
  if (overlap.matrix_counts.total_exact_combination_rows !== 500) throw new Error('overlap exact rows mismatch');
  if (overlap.matrix_counts.allowed_transform_rows_now !== 0) throw new Error('overlap transform rows must be 0');
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMarkdown(relativePath, value) {
  const lines = [
    '# Agent 2 Source-Family Membership Overlap Receipt',
    '',
    `Generated: ${value.generated_at}`,
    '',
    '| target | source families | unique rows | nonexclusive memberships | pairwise overlaps | exact blocker |',
    '| --- | ---: | ---: | ---: | ---: | --- |',
    `| ${value.target} | ${value.membership_counts.source_family_count} | ${value.membership_counts.unique_preview_rows} | ${value.membership_counts.source_family_membership_rows_nonexclusive} | ${value.overlap_counts.pairwise_intersection_count} | \`${value.exact_blockers[1]}\` |`,
    '',
    '## Lane Counts',
    '',
    `- Commercial-clean source families: ${value.lane_counts.commercial_clean_candidate_source_families}.`,
    `- NC educational source families: ${value.lane_counts.noncommercial_educational_candidate_source_families}.`,
    `- Metadata/link-only source families: ${value.lane_counts.metadata_or_link_only_source_families}.`,
    `- Blocked/review source families: ${value.lane_counts.blocked_or_needs_review_source_families}.`,
    '',
    '## Overlap Risk Summary',
    '',
    `- Commercial internal pair rows: ${value.overlap_risk_summary.commercial_internal_pair_rows}.`,
    `- Commercial with NC pair rows: ${value.overlap_risk_summary.commercial_with_nc_pair_rows}.`,
    `- Commercial with blocked pair rows: ${value.overlap_risk_summary.commercial_with_blocked_pair_rows}.`,
    `- NC with blocked pair rows: ${value.overlap_risk_summary.nc_with_blocked_pair_rows}.`,
    '',
    '## Exact Blockers',
    '',
    ...value.exact_blockers.map((blocker) => `- \`${blocker}\``),
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
