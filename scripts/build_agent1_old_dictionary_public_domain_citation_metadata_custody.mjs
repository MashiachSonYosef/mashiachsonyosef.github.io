#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const paths = {
  preview: 'reports/agent2-orot-sefaria-public-domain-candidate-preview-2026-06-04.json',
  exactRowSubsetManifest: 'reports/agent1-old-dictionary-exact-row-subset-manifest-2026-06-05.json',
  sourceFamilyMembership: 'reports/agent1-old-dictionary-source-family-membership-manifest-2026-06-05.json',
  sourceFamilyOverlapMatrix: 'reports/agent1-old-dictionary-source-family-overlap-matrix-2026-06-05.json',
  outputJson: 'reports/agent1-old-dictionary-public-domain-citation-metadata-custody-2026-06-05.json',
  outputMd: 'reports/agent1-old-dictionary-public-domain-citation-metadata-custody-2026-06-05.md',
  validator: 'scripts/validate_agent1_old_dictionary_public_domain_citation_metadata_custody.mjs',
  validatorResult: 'reports/agent1-old-dictionary-public-domain-citation-metadata-custody-validation-result-2026-06-05.json'
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

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function countOccurrences(rows) {
  return rows.reduce((sum, row) => sum + Number(row.occurrences || row.occurrence_count || 0), 0);
}

const preview = readJson(paths.preview);
const exactRows = readJson(paths.exactRowSubsetManifest);
const membership = readJson(paths.sourceFamilyMembership);
const overlap = readJson(paths.sourceFamilyOverlapMatrix);

assert(preview.summary?.audited_rows === 500, 'preview audited rows mismatch');
assert((preview.rows || []).length === 500, 'preview row array mismatch');
assert(exactRows.manifest_counts?.unique_manifest_token_id_count === 500, 'exact row subset coverage mismatch');
assert(membership.source_family_manifests?.length === 5, 'source family membership count mismatch');
assert(overlap.matrix_counts?.total_exact_combination_rows === 500, 'overlap matrix coverage mismatch');

const publicRows = (preview.rows || []).filter((row) => (row.public_domain_lexicons || []).length > 0);
const rowsWithoutPublicCitationMetadata = (preview.rows || []).filter((row) => !row.public_domain_citation_metadata_present);
const publicRowsWithRefs = publicRows.filter((row) => Number(row.public_domain_refs_count || 0) > 0 || (row.public_domain_refs_sample || []).length > 0);
const publicRowsWithoutRefs = publicRows.filter((row) => Number(row.public_domain_refs_count || 0) === 0 && (row.public_domain_refs_sample || []).length === 0);

const publicDomainMetadataRows = publicRows.map((row) => ({
  token_id: row.token_id,
  lexicon_entry_id: row.lexicon_entry_id,
  queue_id: row.queue_id,
  occurrence_count: Number(row.occurrences || 0),
  public_domain_lexicons: row.public_domain_lexicons || [],
  public_domain_rids: row.public_domain_rids || [],
  public_domain_rid_count: (row.public_domain_rids || []).length,
  public_domain_headwords: row.public_domain_headwords || [],
  public_domain_headword_count: (row.public_domain_headwords || []).length,
  public_domain_refs_count: Number(row.public_domain_refs_count || 0),
  public_domain_refs_sample: row.public_domain_refs_sample || [],
  public_domain_citation_metadata_present: row.public_domain_citation_metadata_present === true,
  preview_relation_class: row.preview_relation_class,
  preview_status: row.preview_status,
  transform_blockers: row.transform_blockers || [],
  emitted_answer_row_now: row.emitted_answer_row_now === true,
  source_row_emitted_now: row.source_row_emitted_now === true,
  answer_eligible_now: row.answer_eligible_now === true
}));

const ncOnlySubset = exactRows.subset_manifests.find((subset) => subset.bucket_id === 'noncommercial_educational_only');
const noSourceHitSubset = exactRows.subset_manifests.find((subset) => subset.bucket_id === 'no_sefaria_source_hit');
const noPublicCitationTokenIds = [...ncOnlySubset.token_ids, ...noSourceHitSubset.token_ids];

const citationCoverageCounts = {
  audited_rows: preview.rows.length,
  audited_occurrences: preview.summary.audited_occurrences,
  public_domain_observed_rows: publicRows.length,
  public_domain_observed_occurrences: countOccurrences(publicRows),
  public_domain_citation_metadata_present_rows: publicRows.filter((row) => row.public_domain_citation_metadata_present === true).length,
  public_domain_rid_rows: publicRows.filter((row) => (row.public_domain_rids || []).length > 0).length,
  public_domain_rid_total: publicRows.reduce((sum, row) => sum + (row.public_domain_rids || []).length, 0),
  public_domain_headword_rows: publicRows.filter((row) => (row.public_domain_headwords || []).length > 0).length,
  public_domain_headword_total: publicRows.reduce((sum, row) => sum + (row.public_domain_headwords || []).length, 0),
  public_domain_refs_rows: publicRowsWithRefs.length,
  public_domain_refs_count_total: publicRows.reduce((sum, row) => sum + Number(row.public_domain_refs_count || 0), 0),
  public_domain_rows_without_refs_sample: publicRowsWithoutRefs.length,
  rows_without_public_domain_citation_metadata: rowsWithoutPublicCitationMetadata.length,
  nc_only_rows_without_public_domain_citation_metadata: ncOnlySubset.row_count,
  no_source_hit_rows_without_public_domain_citation_metadata: noSourceHitSubset.row_count,
  emitted_answer_rows_now: publicDomainMetadataRows.filter((row) => row.emitted_answer_row_now).length,
  source_rows_emitted_now: publicDomainMetadataRows.filter((row) => row.source_row_emitted_now).length,
  answer_eligible_rows_now: publicDomainMetadataRows.filter((row) => row.answer_eligible_now).length,
  public_domain_metadata_token_ids_sha256: sha256(publicDomainMetadataRows.map((row) => row.token_id).join('\n')),
  no_public_domain_citation_metadata_token_ids_sha256: sha256(noPublicCitationTokenIds.join('\n'))
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent1_old_dictionary_public_domain_citation_metadata_custody',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent1_old_dictionary_public_domain_citation_metadata_custody.mjs',
  status: 'public_domain_citation_metadata_custody_recorded_zero_output_no_acceptance',
  agent: 'Agent 1',
  current_agent1_thread_id: '019e975d-dc9f-7020-a7c8-885d083a837e',
  old_agent1_thread_id: '019dc487-5973-7693-aebf-fb0a75936f50',
  old_agent1_policy: 'archived_do_not_use',
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / direct Agent run mode',
  production_lane: 'Hebrew import/source/license/custody/source-lane evidence',
  target: 'old-dictionary-excluded-row-license-lane-reaudit public-domain citation metadata custody',
  purpose: 'Record public-domain citation metadata coverage and exact metadata-only blockers without storing or accepting definition, gloss, answer, or candidate text.',
  inputs: paths,
  required_lane_output_shape: 'target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition',
  citation_coverage_counts: citationCoverageCounts,
  classification_lanes: [
    {
      license_lane: 'commercial_clean_candidate',
      row_count: citationCoverageCounts.public_domain_observed_rows,
      occurrence_count: citationCoverageCounts.public_domain_observed_occurrences,
      citation_metadata_present_rows: citationCoverageCounts.public_domain_citation_metadata_present_rows,
      definition_text_rows_now: 0,
      candidate_text_rows_now: 0,
      agent6_boundary_required: true
    },
    {
      license_lane: 'noncommercial_educational_candidate',
      row_count: ncOnlySubset.row_count,
      occurrence_count: ncOnlySubset.occurrence_count,
      public_domain_citation_metadata_present_rows: 0,
      commercial_export_allowed_now: false,
      agent6_boundary_required: true
    },
    {
      license_lane: 'metadata_or_link_only',
      row_count: 0,
      occurrence_count: 0,
      candidate_text_rows_now: 0
    },
    {
      license_lane: 'blocked_or_needs_review',
      row_count: noSourceHitSubset.row_count,
      occurrence_count: noSourceHitSubset.occurrence_count,
      public_domain_citation_metadata_present_rows: 0,
      source_license_custody_evidence_missing_now: true
    }
  ],
  public_domain_metadata_rows: publicDomainMetadataRows,
  no_public_domain_citation_metadata_subsets: [
    {
      row_subset_id: 'old-dictionary-excluded-row-license-lane-reaudit::citation-metadata::nc-only-without-public-citation-metadata',
      license_lane: 'noncommercial_educational_candidate',
      rows: ncOnlySubset.row_count,
      occurrences: ncOnlySubset.occurrence_count,
      token_ids: ncOnlySubset.token_ids,
      token_ids_sha256: ncOnlySubset.token_ids_sha256,
      blocker: 'nc_only_rows_have_no_public_domain_citation_metadata_and_no_commercial_authorization'
    },
    {
      row_subset_id: 'old-dictionary-excluded-row-license-lane-reaudit::citation-metadata::no-source-hit-without-public-citation-metadata',
      license_lane: 'blocked_or_needs_review',
      rows: noSourceHitSubset.row_count,
      occurrences: noSourceHitSubset.occurrence_count,
      token_ids: noSourceHitSubset.token_ids,
      token_ids_sha256: noSourceHitSubset.token_ids_sha256,
      blocker: 'no_source_hit_rows_have_no_public_domain_citation_metadata_or_source_lane_evidence'
    }
  ],
  exact_blockers: [
    {
      blocker: 'public_domain_metadata_is_citation_metadata_only_not_definition_text',
      rows: citationCoverageCounts.public_domain_observed_rows,
      occurrences: citationCoverageCounts.public_domain_observed_occurrences,
      handoff_owner: 'Agent 6 for candidate-use boundary; Agent 2 blocked from transform now'
    },
    {
      blocker: 'public_domain_rows_without_ref_samples_need_source_family_boundary_if_refs_required',
      rows: citationCoverageCounts.public_domain_rows_without_refs_sample,
      occurrences: countOccurrences(publicRowsWithoutRefs),
      handoff_owner: 'Agent 1 records metadata gap; Agent 6 decides future boundary requirements'
    },
    {
      blocker: 'nc_only_rows_have_no_public_domain_citation_metadata_and_no_commercial_authorization',
      rows: ncOnlySubset.row_count,
      occurrences: ncOnlySubset.occurrence_count,
      handoff_owner: 'Agent 6 for NC boundary; Agent 1 preserves NC lane'
    },
    {
      blocker: 'no_source_hit_rows_have_no_public_domain_citation_metadata_or_source_lane_evidence',
      rows: noSourceHitSubset.row_count,
      occurrences: noSourceHitSubset.occurrence_count,
      handoff_owner: 'Agent 1 if source evidence appears; Agent 2 blocked now'
    }
  ],
  handoff_owner: {
    agent2: 'May not transform citation metadata into candidate text now; use only after Agent 6 boundary and exact future package.',
    agent6: 'Citation metadata coverage is recorded for future candidate-use/source-boundary review; delivered_to_agent6_now remains 0.',
    agent10: 'May consume metadata custody coverage for future boundary/package assembly only; no release route opened now.'
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
  forbidden_content_fields_not_written: [
    'surface',
    'normalized',
    'definition',
    'gloss',
    'answer',
    'candidate_text',
    'definition_text'
  ],
  stop_condition: 'Stop before Agent 6 delivery, Agent 2 transform, candidate text, source/license/legal acceptance, Definition/runtime/publication/product/answer acceptance, queue mutation, render mutation, staging, or release action.'
};

const md = `# Agent 1 Old Dictionary Public-Domain Citation Metadata Custody - 2026-06-05

production lane | direct active goal | recallable state/proof artifact | exact blocker | stop condition | correction owner

Hebrew import/source/license/custody/source-lane evidence | public-domain citation metadata custody for old-dictionary reaudit | \`${paths.outputJson}\`; validator \`${paths.validator}\` -> \`${paths.validatorResult}\` | citation metadata is not definition/candidate text and still requires Agent 6 boundary before candidate use | ${artifact.stop_condition} | current Agent 1 \`019e975d-dc9f-7020-a7c8-885d083a837e\`; old Agent 1 archived/do-not-use

target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition

\`${artifact.target}\` | \`${paths.preview}\`; \`${paths.exactRowSubsetManifest}\`; \`${paths.sourceFamilyMembership}\`; \`${paths.sourceFamilyOverlapMatrix}\` | audited ${citationCoverageCounts.audited_rows} / ${citationCoverageCounts.audited_occurrences}; public-domain metadata ${citationCoverageCounts.public_domain_observed_rows} / ${citationCoverageCounts.public_domain_observed_occurrences}; citation metadata present ${citationCoverageCounts.public_domain_citation_metadata_present_rows}; RID rows ${citationCoverageCounts.public_domain_rid_rows}; headword rows ${citationCoverageCounts.public_domain_headword_rows}; ref rows ${citationCoverageCounts.public_domain_refs_rows}; public rows without ref samples ${citationCoverageCounts.public_domain_rows_without_refs_sample}; rows without public citation metadata ${citationCoverageCounts.rows_without_public_domain_citation_metadata}; NC-only without public metadata ${citationCoverageCounts.nc_only_rows_without_public_domain_citation_metadata}; no-source-hit without public metadata ${citationCoverageCounts.no_source_hit_rows_without_public_domain_citation_metadata} | \`commercial_clean_candidate\`; \`noncommercial_educational_candidate\`; \`metadata_or_link_only\`; \`blocked_or_needs_review\` | ${artifact.exact_blockers.map((row) => row.blocker).join('; ')} | Agent 2 blocked from transform; Agent 6 future boundary owner; Agent 10 package assembly only | ${artifact.stop_condition}

## Coverage

| metric | count |
| --- | ---: |
| public_domain_rid_total | ${citationCoverageCounts.public_domain_rid_total} |
| public_domain_headword_total | ${citationCoverageCounts.public_domain_headword_total} |
| public_domain_refs_count_total | ${citationCoverageCounts.public_domain_refs_count_total} |
| emitted_answer_rows_now | ${citationCoverageCounts.emitted_answer_rows_now} |
| source_rows_emitted_now | ${citationCoverageCounts.source_rows_emitted_now} |
| answer_eligible_rows_now | ${citationCoverageCounts.answer_eligible_rows_now} |

Complete metadata rows are in the JSON artifact. Gloss, definition, answer, candidate text, normalized text, and surface text are not written by this packet.
`;

writeJson(paths.outputJson, artifact);
writeText(paths.outputMd, md);

console.log(JSON.stringify({
  ok: true,
  artifact: paths.outputJson,
  report: paths.outputMd,
  citation_coverage_counts: artifact.citation_coverage_counts
}, null, 2));
