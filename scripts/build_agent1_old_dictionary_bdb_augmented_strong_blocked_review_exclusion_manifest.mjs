#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const paths = {
  preview: 'reports/agent2-orot-sefaria-public-domain-candidate-preview-2026-06-04.json',
  exactRowSubsetManifest: 'reports/agent1-old-dictionary-exact-row-subset-manifest-2026-06-05.json',
  sourceFamilyMembershipManifest: 'reports/agent1-old-dictionary-source-family-membership-manifest-2026-06-05.json',
  sourceFamilyOverlapMatrix: 'reports/agent1-old-dictionary-source-family-overlap-matrix-2026-06-05.json',
  commercialNcOverlapExclusionManifest: 'reports/agent1-old-dictionary-commercial-nc-overlap-exclusion-manifest-2026-06-05.json',
  outputJson: 'reports/agent1-old-dictionary-bdb-augmented-strong-blocked-review-exclusion-manifest-2026-06-05.json',
  outputMd: 'reports/agent1-old-dictionary-bdb-augmented-strong-blocked-review-exclusion-manifest-2026-06-05.md',
  validator: 'scripts/validate_agent1_old_dictionary_bdb_augmented_strong_blocked_review_exclusion_manifest.mjs',
  validatorResult: 'reports/agent1-old-dictionary-bdb-augmented-strong-blocked-review-exclusion-manifest-validation-result-2026-06-05.json'
};

const forbiddenFields = ['surface', 'normalized', 'definition', 'gloss', 'answer', 'candidate_text', 'definition_text'];

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

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function includesValue(values, value) {
  return (values || []).includes(value);
}

function sumOccurrences(rows) {
  return rows.reduce((sum, row) => sum + Number(row.occurrences || 0), 0);
}

function metadataRow(row) {
  return {
    token_id: row.token_id,
    lexicon_entry_id: row.lexicon_entry_id,
    queue_id: row.queue_id,
    occurrence_count: Number(row.occurrences || 0),
    public_domain_lexicons: row.public_domain_lexicons || [],
    blocked_or_unresolved_lexicons: row.blocked_or_unresolved_lexicons || [],
    has_commercial_source_evidence: (row.public_domain_lexicons || []).length > 0,
    has_klein_nc_evidence: includesValue(row.blocked_or_unresolved_lexicons, 'Klein Dictionary'),
    has_bdb_augmented_strong_review_evidence: includesValue(row.blocked_or_unresolved_lexicons, 'BDB Augmented Strong'),
    public_domain_rids: row.public_domain_rids || [],
    public_domain_rid_count: (row.public_domain_rids || []).length,
    public_domain_headword_count: (row.public_domain_headwords || []).length,
    public_domain_refs_count: Number(row.public_domain_refs_count || 0),
    public_domain_refs_sample_count: (row.public_domain_refs_sample || []).length,
    public_domain_citation_metadata_present: row.public_domain_citation_metadata_present === true,
    preview_relation_class: row.preview_relation_class,
    preview_status: row.preview_status,
    transform_blockers: row.transform_blockers || [],
    emitted_answer_row_now: row.emitted_answer_row_now === true,
    source_row_emitted_now: row.source_row_emitted_now === true,
    answer_eligible_now: row.answer_eligible_now === true,
    agent2_transform_allowed_now: false,
    agent6_delivery_now: false,
    candidate_text_rows_now: 0
  };
}

function compactIntersection(row) {
  return {
    intersection_id: row.pair_id || row.combination_id,
    source_families: row.source_families,
    classification_lanes: row.classification_lanes,
    row_count: row.row_count,
    occurrence_count: row.occurrence_count,
    token_ids_sha256: row.token_ids_sha256,
    exact_blocker: row.exact_blocker
  };
}

const preview = readJson(paths.preview);
const exactRows = readJson(paths.exactRowSubsetManifest);
const membership = readJson(paths.sourceFamilyMembershipManifest);
const overlap = readJson(paths.sourceFamilyOverlapMatrix);
const commercialNc = readJson(paths.commercialNcOverlapExclusionManifest);

assert(preview.summary?.audited_rows === 500, 'preview audited rows mismatch');
assert(exactRows.manifest_counts?.commercial_clean_plus_blocked_rows === 82, 'exact subset commercial+blocked row count mismatch');
assert(exactRows.manifest_counts?.triple_overlap_rows === 140, 'exact subset triple-overlap row count mismatch');
assert(exactRows.manifest_counts?.blocked_review_only_rows === 0, 'exact subset blocked-only row count mismatch');
assert(membership.membership_counts?.bdb_augmented_strong_rows === 222, 'membership BDB Augmented Strong row count mismatch');
assert(overlap.matrix_counts?.total_exact_combination_rows === 500, 'overlap matrix coverage mismatch');
assert(commercialNc.overlap_counts?.commercial_nc_with_bdb_augmented_strong_rows === 140, 'commercial+NC overlap triple count mismatch');

const rows = preview.rows || [];
const bdbAugRows = rows.filter((row) => includesValue(row.blocked_or_unresolved_lexicons, 'BDB Augmented Strong'));
const commercialBlockedRows = bdbAugRows.filter((row) =>
  (row.public_domain_lexicons || []).length > 0 &&
  !includesValue(row.blocked_or_unresolved_lexicons, 'Klein Dictionary')
);
const tripleOverlapRows = bdbAugRows.filter((row) =>
  (row.public_domain_lexicons || []).length > 0 &&
  includesValue(row.blocked_or_unresolved_lexicons, 'Klein Dictionary')
);
const blockedOnlyRows = bdbAugRows.filter((row) => (row.public_domain_lexicons || []).length === 0);

const bdbAugMetadataRows = bdbAugRows.map(metadataRow);
const commercialBlockedMetadataRows = commercialBlockedRows.map(metadataRow);
const tripleOverlapMetadataRows = tripleOverlapRows.map(metadataRow);
const blockedOnlyMetadataRows = blockedOnlyRows.map(metadataRow);

const pairwiseBdbAugIntersections = (overlap.pairwise_intersections || [])
  .filter((row) => includesValue(row.source_families, 'BDB Augmented Strong'))
  .map(compactIntersection);
const exactBdbAugCombinations = (overlap.exact_family_combinations || [])
  .filter((row) => includesValue(row.source_families, 'BDB Augmented Strong'))
  .map(compactIntersection);

const blockedReviewCounts = {
  audited_rows: rows.length,
  audited_occurrences: sumOccurrences(rows),
  bdb_augmented_strong_blocked_review_rows: bdbAugRows.length,
  bdb_augmented_strong_blocked_review_occurrences: sumOccurrences(bdbAugRows),
  commercial_blocked_without_klein_rows: commercialBlockedRows.length,
  commercial_blocked_without_klein_occurrences: sumOccurrences(commercialBlockedRows),
  triple_overlap_with_klein_rows: tripleOverlapRows.length,
  triple_overlap_with_klein_occurrences: sumOccurrences(tripleOverlapRows),
  blocked_review_only_rows: blockedOnlyRows.length,
  blocked_review_only_occurrences: sumOccurrences(blockedOnlyRows),
  public_domain_overlap_rows: bdbAugRows.filter((row) => (row.public_domain_lexicons || []).length > 0).length,
  public_domain_overlap_occurrences: sumOccurrences(bdbAugRows.filter((row) => (row.public_domain_lexicons || []).length > 0)),
  klein_nc_overlap_rows: tripleOverlapRows.length,
  klein_nc_overlap_occurrences: sumOccurrences(tripleOverlapRows),
  pairwise_bdb_augmented_strong_intersection_count: pairwiseBdbAugIntersections.length,
  exact_bdb_augmented_strong_combination_count: exactBdbAugCombinations.length,
  bdb_augmented_strong_token_ids_sha256: sha256(bdbAugMetadataRows.map((row) => row.token_id).join('\n')),
  commercial_blocked_without_klein_token_ids_sha256: sha256(commercialBlockedMetadataRows.map((row) => row.token_id).join('\n')),
  triple_overlap_with_klein_token_ids_sha256: sha256(tripleOverlapMetadataRows.map((row) => row.token_id).join('\n')),
  blocked_review_only_token_ids_sha256: sha256(blockedOnlyMetadataRows.map((row) => row.token_id).join('\n')),
  emitted_answer_rows_now: bdbAugMetadataRows.filter((row) => row.emitted_answer_row_now).length,
  source_rows_emitted_now: bdbAugMetadataRows.filter((row) => row.source_row_emitted_now).length,
  answer_eligible_rows_now: bdbAugMetadataRows.filter((row) => row.answer_eligible_now).length,
  agent2_transform_rows_now: bdbAugMetadataRows.filter((row) => row.agent2_transform_allowed_now).length,
  agent6_delivery_rows_now: bdbAugMetadataRows.filter((row) => row.agent6_delivery_now).length,
  candidate_text_rows_now: bdbAugMetadataRows.reduce((sum, row) => sum + row.candidate_text_rows_now, 0)
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent1_old_dictionary_bdb_augmented_strong_blocked_review_exclusion_manifest',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent1_old_dictionary_bdb_augmented_strong_blocked_review_exclusion_manifest.mjs',
  status: 'bdb_augmented_strong_blocked_review_exclusion_manifest_recorded_zero_output_no_acceptance',
  agent: 'Agent 1',
  current_agent1_thread_id: '019e975d-dc9f-7020-a7c8-885d083a837e',
  old_agent1_thread_id: '019dc487-5973-7693-aebf-fb0a75936f50',
  old_agent1_policy: 'archived_do_not_use',
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / direct Agent run mode',
  production_lane: 'Hebrew import/source/license/custody/source-lane evidence',
  target: 'old-dictionary-excluded-row-license-lane-reaudit BDB Augmented Strong blocked/review exclusion manifest',
  purpose: 'Record exact BDB Augmented Strong blocked/review rows so public-domain overlap is not mistaken for candidate-use authority while blocked/review evidence remains lane-preserved.',
  inputs: paths,
  required_lane_output_shape: 'target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition',
  blocked_review_counts: blockedReviewCounts,
  classification_lanes: [
    {
      license_lane: 'commercial_clean_candidate',
      row_count: blockedReviewCounts.public_domain_overlap_rows,
      occurrence_count: blockedReviewCounts.public_domain_overlap_occurrences,
      scope: 'public-domain source evidence exists on these rows, but candidate use is blocked pending Agent 6 source-family selection/exclusion boundary.',
      agent2_transform_allowed_now: false,
      agent6_boundary_required: true
    },
    {
      license_lane: 'noncommercial_educational_candidate',
      row_count: blockedReviewCounts.klein_nc_overlap_rows,
      occurrence_count: blockedReviewCounts.klein_nc_overlap_occurrences,
      source_family: 'Klein Dictionary',
      commercial_authorization_now: false,
      note: 'Only the triple-overlap subset also carries Klein NC evidence.'
    },
    {
      license_lane: 'metadata_or_link_only',
      row_count: 0,
      occurrence_count: 0
    },
    {
      license_lane: 'blocked_or_needs_review',
      row_count: blockedReviewCounts.bdb_augmented_strong_blocked_review_rows,
      occurrence_count: blockedReviewCounts.bdb_augmented_strong_blocked_review_occurrences,
      source_family: 'BDB Augmented Strong',
      note: 'BDB Augmented Strong rows require source-custody resolution or explicit exclusion before any downstream transform.'
    }
  ],
  source_family_pairwise_bdb_augmented_strong_intersections: pairwiseBdbAugIntersections,
  exact_bdb_augmented_strong_family_combinations: exactBdbAugCombinations,
  bdb_augmented_strong_blocked_review_metadata_rows: bdbAugMetadataRows,
  commercial_blocked_without_klein_rows: commercialBlockedMetadataRows,
  triple_overlap_with_klein_rows: tripleOverlapMetadataRows,
  blocked_review_only_rows: blockedOnlyMetadataRows,
  exact_blockers: [
    {
      blocker: 'bdb_augmented_strong_requires_source_custody_resolution_or_exclusion',
      owner: 'Agent 6',
      rows: blockedReviewCounts.bdb_augmented_strong_blocked_review_rows,
      occurrences: blockedReviewCounts.bdb_augmented_strong_blocked_review_occurrences
    },
    {
      blocker: 'commercial_blocked_overlap_requires_agent6_source_family_selection_boundary',
      owner: 'Agent 6',
      rows: blockedReviewCounts.public_domain_overlap_rows,
      occurrences: blockedReviewCounts.public_domain_overlap_occurrences
    },
    {
      blocker: 'triple_overlap_preserves_klein_nc_and_bdb_augmented_strong_review_boundaries',
      owner: 'Agent 6',
      rows: blockedReviewCounts.triple_overlap_with_klein_rows,
      occurrences: blockedReviewCounts.triple_overlap_with_klein_occurrences
    },
    {
      blocker: 'metadata_only_no_definition_or_candidate_text',
      owner: 'Agent 1',
      rows: blockedReviewCounts.bdb_augmented_strong_blocked_review_rows,
      occurrences: blockedReviewCounts.bdb_augmented_strong_blocked_review_occurrences
    }
  ],
  handoff_owner: {
    agent2: 'blocked_until_agent1_lane_evidence_plus_agent6_bdb_augmented_strong_resolution_or_exclusion',
    agent6: 'future_boundary_owner_for_bdb_augmented_strong_source_custody_and_source_family_selection',
    agent10: 'may consume classified package boundaries only after Agent 6 disposition'
  },
  zero_output_counts: {
    agent6_delivery_rows_now: blockedReviewCounts.agent6_delivery_rows_now,
    agent2_transform_rows_now: blockedReviewCounts.agent2_transform_rows_now,
    candidate_text_rows_now: blockedReviewCounts.candidate_text_rows_now,
    emitted_answer_rows_now: blockedReviewCounts.emitted_answer_rows_now,
    source_rows_emitted_now: blockedReviewCounts.source_rows_emitted_now,
    answer_eligible_rows_now: blockedReviewCounts.answer_eligible_rows_now,
    queue_mutations: 0,
    staging_mutations: 0,
    render_mutations: 0,
    release_actions: 0
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
  forbidden_content_fields_not_written: forbiddenFields,
  stop_condition: 'stop before Agent 6 delivery, Agent 2 transform, candidate text export, source/license/legal acceptance, Definition/runtime/publication/product/answer acceptance, queue mutation, render mutation, staging, or release action'
};

writeJson(paths.outputJson, artifact);

const md = `# Agent 1 Old Dictionary BDB Augmented Strong Blocked/Review Exclusion Manifest - 2026-06-05

production lane | direct active goal | recallable state/proof artifact | exact blocker | stop condition | correction owner

Hebrew import/source/license/custody/source-lane evidence | BDB Augmented Strong blocked/review exclusion boundary for old-dictionary reaudit | \`${paths.outputJson}\`; validator \`${paths.validator}\` -> \`${paths.validatorResult}\` | ${artifact.exact_blockers.map((row) => `\`${row.blocker}\``).join('; ')} | ${artifact.stop_condition} | current Agent 1 \`${artifact.current_agent1_thread_id}\`; old Agent 1 archived/do-not-use

target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition

\`${artifact.target}\` | \`${paths.preview}\`; \`${paths.exactRowSubsetManifest}\`; \`${paths.sourceFamilyMembershipManifest}\`; \`${paths.sourceFamilyOverlapMatrix}\`; \`${paths.commercialNcOverlapExclusionManifest}\` | BDB Augmented Strong blocked/review ${blockedReviewCounts.bdb_augmented_strong_blocked_review_rows} / ${blockedReviewCounts.bdb_augmented_strong_blocked_review_occurrences}; commercial+blocked without Klein ${blockedReviewCounts.commercial_blocked_without_klein_rows} / ${blockedReviewCounts.commercial_blocked_without_klein_occurrences}; triple overlap with Klein ${blockedReviewCounts.triple_overlap_with_klein_rows} / ${blockedReviewCounts.triple_overlap_with_klein_occurrences}; blocked-only ${blockedReviewCounts.blocked_review_only_rows} / ${blockedReviewCounts.blocked_review_only_occurrences} | \`commercial_clean_candidate\`; \`noncommercial_educational_candidate\`; \`metadata_or_link_only\`; \`blocked_or_needs_review\` | ${artifact.exact_blockers.map((row) => `\`${row.blocker}\``).join('; ')} | Agent 2 blocked; Agent 6 future boundary owner; Agent 10 package assembly only after Agent 6 disposition | zero Agent 6 delivery, zero transform rows, zero candidate-text rows, zero release route

Proof:

- BDB Augmented Strong blocked/review evidence covers ${blockedReviewCounts.bdb_augmented_strong_blocked_review_rows} rows / ${blockedReviewCounts.bdb_augmented_strong_blocked_review_occurrences} occurrences.
- Commercial+blocked without Klein is ${blockedReviewCounts.commercial_blocked_without_klein_rows} rows / ${blockedReviewCounts.commercial_blocked_without_klein_occurrences} occurrences.
- Triple-overlap with Klein NC is ${blockedReviewCounts.triple_overlap_with_klein_rows} rows / ${blockedReviewCounts.triple_overlap_with_klein_occurrences} occurrences.
- Blocked-only rows without public-domain evidence are ${blockedReviewCounts.blocked_review_only_rows} rows / ${blockedReviewCounts.blocked_review_only_occurrences} occurrences.
- Surface, normalized, definition, gloss, answer, candidate text, and definition text fields are not written.
- No QA, source/license/legal, Definition, runtime, publication, product, answer, accepted gloss/text, NC commercial authorization, queue, staging, render, or release acceptance is claimed.
`;

writeText(paths.outputMd, md);

console.log(JSON.stringify({
  ok: true,
  outputJson: paths.outputJson,
  outputMd: paths.outputMd,
  blocked_review_counts: blockedReviewCounts,
  exact_blocker_count: artifact.exact_blockers.length
}, null, 2));
