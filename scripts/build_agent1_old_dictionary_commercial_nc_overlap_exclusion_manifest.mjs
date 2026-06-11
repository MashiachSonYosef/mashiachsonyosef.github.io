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
  outputJson: 'reports/agent1-old-dictionary-commercial-nc-overlap-exclusion-manifest-2026-06-05.json',
  outputMd: 'reports/agent1-old-dictionary-commercial-nc-overlap-exclusion-manifest-2026-06-05.md',
  validator: 'scripts/validate_agent1_old_dictionary_commercial_nc_overlap_exclusion_manifest.mjs',
  validatorResult: 'reports/agent1-old-dictionary-commercial-nc-overlap-exclusion-manifest-validation-result-2026-06-05.json'
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

function sumOccurrences(rows) {
  return rows.reduce((sum, row) => sum + Number(row.occurrences || 0), 0);
}

function includesValue(values, value) {
  return (values || []).includes(value);
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

assert(preview.summary?.audited_rows === 500, 'preview audited rows mismatch');
assert(exactRows.manifest_counts?.commercial_clean_plus_nc_rows === 57, 'exact subset commercial+NC row count mismatch');
assert(exactRows.manifest_counts?.triple_overlap_rows === 140, 'exact subset triple-overlap row count mismatch');
assert(exactRows.manifest_counts?.nc_only_rows === 17, 'exact subset NC-only row count mismatch');
assert(membership.membership_counts?.klein_rows === 214, 'membership Klein row count mismatch');
assert(overlap.matrix_counts?.total_exact_combination_rows === 500, 'overlap matrix coverage mismatch');

const rows = preview.rows || [];
const commercialNcOverlapRows = rows.filter((row) =>
  (row.public_domain_lexicons || []).length > 0 &&
  includesValue(row.blocked_or_unresolved_lexicons, 'Klein Dictionary')
);
const commercialNcOnlyRows = commercialNcOverlapRows.filter((row) =>
  !includesValue(row.blocked_or_unresolved_lexicons, 'BDB Augmented Strong')
);
const commercialNcBlockedRows = commercialNcOverlapRows.filter((row) =>
  includesValue(row.blocked_or_unresolved_lexicons, 'BDB Augmented Strong')
);
const kleinOnlyRows = rows.filter((row) =>
  (row.public_domain_lexicons || []).length === 0 &&
  includesValue(row.blocked_or_unresolved_lexicons, 'Klein Dictionary') &&
  !includesValue(row.blocked_or_unresolved_lexicons, 'BDB Augmented Strong')
);

const pairwiseKleinIntersections = (overlap.pairwise_intersections || [])
  .filter((row) => includesValue(row.source_families, 'Klein Dictionary'))
  .map(compactIntersection);
const exactKleinCombinations = (overlap.exact_family_combinations || [])
  .filter((row) => includesValue(row.source_families, 'Klein Dictionary'))
  .map(compactIntersection);

const overlapMetadataRows = commercialNcOverlapRows.map(metadataRow);
const commercialNcOnlyMetadataRows = commercialNcOnlyRows.map(metadataRow);
const commercialNcBlockedMetadataRows = commercialNcBlockedRows.map(metadataRow);
const kleinOnlyExcludedRows = kleinOnlyRows.map(metadataRow);

const overlapCounts = {
  audited_rows: rows.length,
  audited_occurrences: sumOccurrences(rows),
  commercial_nc_overlap_rows: commercialNcOverlapRows.length,
  commercial_nc_overlap_occurrences: sumOccurrences(commercialNcOverlapRows),
  commercial_nc_without_bdb_augmented_strong_rows: commercialNcOnlyRows.length,
  commercial_nc_without_bdb_augmented_strong_occurrences: sumOccurrences(commercialNcOnlyRows),
  commercial_nc_with_bdb_augmented_strong_rows: commercialNcBlockedRows.length,
  commercial_nc_with_bdb_augmented_strong_occurrences: sumOccurrences(commercialNcBlockedRows),
  klein_only_excluded_rows: kleinOnlyRows.length,
  klein_only_excluded_occurrences: sumOccurrences(kleinOnlyRows),
  pairwise_klein_intersection_count: pairwiseKleinIntersections.length,
  exact_klein_combination_count: exactKleinCombinations.length,
  overlap_token_ids_sha256: sha256(overlapMetadataRows.map((row) => row.token_id).join('\n')),
  commercial_nc_only_token_ids_sha256: sha256(commercialNcOnlyMetadataRows.map((row) => row.token_id).join('\n')),
  commercial_nc_blocked_token_ids_sha256: sha256(commercialNcBlockedMetadataRows.map((row) => row.token_id).join('\n')),
  klein_only_excluded_token_ids_sha256: sha256(kleinOnlyExcludedRows.map((row) => row.token_id).join('\n')),
  emitted_answer_rows_now: overlapMetadataRows.filter((row) => row.emitted_answer_row_now).length,
  source_rows_emitted_now: overlapMetadataRows.filter((row) => row.source_row_emitted_now).length,
  answer_eligible_rows_now: overlapMetadataRows.filter((row) => row.answer_eligible_now).length,
  agent2_transform_rows_now: overlapMetadataRows.filter((row) => row.agent2_transform_allowed_now).length,
  agent6_delivery_rows_now: overlapMetadataRows.filter((row) => row.agent6_delivery_now).length,
  candidate_text_rows_now: overlapMetadataRows.reduce((sum, row) => sum + row.candidate_text_rows_now, 0)
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent1_old_dictionary_commercial_nc_overlap_exclusion_manifest',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent1_old_dictionary_commercial_nc_overlap_exclusion_manifest.mjs',
  status: 'commercial_nc_overlap_exclusion_manifest_recorded_zero_output_no_acceptance',
  agent: 'Agent 1',
  current_agent1_thread_id: '019e975d-dc9f-7020-a7c8-885d083a837e',
  old_agent1_thread_id: '019dc487-5973-7693-aebf-fb0a75936f50',
  old_agent1_policy: 'archived_do_not_use',
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / direct Agent run mode',
  production_lane: 'Hebrew import/source/license/custody/source-lane evidence',
  target: 'old-dictionary-excluded-row-license-lane-reaudit commercial+NC overlap exclusion manifest',
  purpose: 'Record exact public-domain plus Klein NC overlap rows so public-domain source evidence is not mistaken for commercial-clean candidate-use authority while Klein NC evidence remains lane-preserved.',
  inputs: paths,
  required_lane_output_shape: 'target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition',
  overlap_counts: overlapCounts,
  classification_lanes: [
    {
      license_lane: 'commercial_clean_candidate',
      row_count: overlapCounts.commercial_nc_overlap_rows,
      occurrence_count: overlapCounts.commercial_nc_overlap_occurrences,
      scope: 'public-domain source evidence exists on these rows, but candidate use is blocked pending Agent 6 source-family selection/exclusion boundary.',
      agent2_transform_allowed_now: false,
      agent6_boundary_required: true
    },
    {
      license_lane: 'noncommercial_educational_candidate',
      row_count: overlapCounts.commercial_nc_overlap_rows,
      occurrence_count: overlapCounts.commercial_nc_overlap_occurrences,
      source_family: 'Klein Dictionary',
      commercial_authorization_now: false,
      note: 'Klein-bearing rows stay NC-preserved and are not commercially authorized by this artifact.'
    },
    {
      license_lane: 'metadata_or_link_only',
      row_count: 0,
      occurrence_count: 0
    },
    {
      license_lane: 'blocked_or_needs_review',
      row_count: overlapCounts.commercial_nc_with_bdb_augmented_strong_rows,
      occurrence_count: overlapCounts.commercial_nc_with_bdb_augmented_strong_occurrences,
      source_family: 'BDB Augmented Strong',
      note: 'Triple-overlap rows also carry BDB Augmented Strong review evidence.'
    }
  ],
  source_family_pairwise_klein_intersections: pairwiseKleinIntersections,
  exact_klein_family_combinations: exactKleinCombinations,
  commercial_nc_overlap_metadata_rows: overlapMetadataRows,
  commercial_nc_without_bdb_augmented_strong_rows: commercialNcOnlyMetadataRows,
  commercial_nc_with_bdb_augmented_strong_rows: commercialNcBlockedMetadataRows,
  klein_only_excluded_rows: kleinOnlyExcludedRows,
  exact_blockers: [
    {
      blocker: 'commercial_nc_overlap_requires_agent6_source_family_selection_boundary',
      owner: 'Agent 6',
      rows: overlapCounts.commercial_nc_overlap_rows,
      occurrences: overlapCounts.commercial_nc_overlap_occurrences
    },
    {
      blocker: 'klein_nc_content_not_commercially_authorized',
      owner: 'Agent 6',
      rows: overlapCounts.commercial_nc_overlap_rows,
      occurrences: overlapCounts.commercial_nc_overlap_occurrences
    },
    {
      blocker: 'triple_overlap_also_requires_bdb_augmented_strong_source_custody_resolution_or_exclusion',
      owner: 'Agent 6',
      rows: overlapCounts.commercial_nc_with_bdb_augmented_strong_rows,
      occurrences: overlapCounts.commercial_nc_with_bdb_augmented_strong_occurrences
    },
    {
      blocker: 'metadata_only_no_definition_or_candidate_text',
      owner: 'Agent 1',
      rows: overlapCounts.commercial_nc_overlap_rows,
      occurrences: overlapCounts.commercial_nc_overlap_occurrences
    }
  ],
  handoff_owner: {
    agent2: 'blocked_until_agent1_lane_evidence_plus_agent6_source_family_selection_boundary',
    agent6: 'future_boundary_owner_for_commercial_public_domain_side_vs_klein_nc_exclusion',
    agent10: 'may consume classified package boundaries only after Agent 6 disposition'
  },
  zero_output_counts: {
    agent6_delivery_rows_now: overlapCounts.agent6_delivery_rows_now,
    agent2_transform_rows_now: overlapCounts.agent2_transform_rows_now,
    candidate_text_rows_now: overlapCounts.candidate_text_rows_now,
    emitted_answer_rows_now: overlapCounts.emitted_answer_rows_now,
    source_rows_emitted_now: overlapCounts.source_rows_emitted_now,
    answer_eligible_rows_now: overlapCounts.answer_eligible_rows_now,
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

const md = `# Agent 1 Old Dictionary Commercial+NC Overlap Exclusion Manifest - 2026-06-05

production lane | direct active goal | recallable state/proof artifact | exact blocker | stop condition | correction owner

Hebrew import/source/license/custody/source-lane evidence | commercial+NC overlap exclusion boundary for old-dictionary reaudit | \`${paths.outputJson}\`; validator \`${paths.validator}\` -> \`${paths.validatorResult}\` | ${artifact.exact_blockers.map((row) => `\`${row.blocker}\``).join('; ')} | ${artifact.stop_condition} | current Agent 1 \`${artifact.current_agent1_thread_id}\`; old Agent 1 archived/do-not-use

target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition

\`${artifact.target}\` | \`${paths.preview}\`; \`${paths.exactRowSubsetManifest}\`; \`${paths.sourceFamilyMembershipManifest}\`; \`${paths.sourceFamilyOverlapMatrix}\` | commercial+NC overlap ${overlapCounts.commercial_nc_overlap_rows} / ${overlapCounts.commercial_nc_overlap_occurrences}; commercial+NC without BDB Augmented Strong ${overlapCounts.commercial_nc_without_bdb_augmented_strong_rows} / ${overlapCounts.commercial_nc_without_bdb_augmented_strong_occurrences}; triple overlap ${overlapCounts.commercial_nc_with_bdb_augmented_strong_rows} / ${overlapCounts.commercial_nc_with_bdb_augmented_strong_occurrences}; Klein-only excluded ${overlapCounts.klein_only_excluded_rows} / ${overlapCounts.klein_only_excluded_occurrences} | \`commercial_clean_candidate\`; \`noncommercial_educational_candidate\`; \`metadata_or_link_only\`; \`blocked_or_needs_review\` | ${artifact.exact_blockers.map((row) => `\`${row.blocker}\``).join('; ')} | Agent 2 blocked; Agent 6 future boundary owner; Agent 10 package assembly only after Agent 6 disposition | zero Agent 6 delivery, zero transform rows, zero candidate-text rows, zero release route

Proof:

- Commercial+NC overlap is ${overlapCounts.commercial_nc_overlap_rows} rows / ${overlapCounts.commercial_nc_overlap_occurrences} occurrences.
- The non-blocked commercial+NC subset is ${overlapCounts.commercial_nc_without_bdb_augmented_strong_rows} rows / ${overlapCounts.commercial_nc_without_bdb_augmented_strong_occurrences} occurrences.
- The triple-overlap subset is ${overlapCounts.commercial_nc_with_bdb_augmented_strong_rows} rows / ${overlapCounts.commercial_nc_with_bdb_augmented_strong_occurrences} occurrences.
- Klein-only excluded rows remain \`noncommercial_educational_candidate\`: ${overlapCounts.klein_only_excluded_rows} rows / ${overlapCounts.klein_only_excluded_occurrences} occurrences.
- Surface, normalized, definition, gloss, answer, candidate text, and definition text fields are not written.
- No QA, source/license/legal, Definition, runtime, publication, product, answer, accepted gloss/text, NC commercial authorization, queue, staging, render, or release acceptance is claimed.
`;

writeText(paths.outputMd, md);

console.log(JSON.stringify({
  ok: true,
  outputJson: paths.outputJson,
  outputMd: paths.outputMd,
  overlap_counts: overlapCounts,
  exact_blocker_count: artifact.exact_blockers.length
}, null, 2));
