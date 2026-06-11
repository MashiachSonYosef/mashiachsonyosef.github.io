#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const paths = {
  preview: 'reports/agent2-orot-sefaria-public-domain-candidate-preview-2026-06-04.json',
  citationCustody: 'reports/agent1-old-dictionary-public-domain-citation-metadata-custody-2026-06-05.json',
  citationCustodyValidationResult: 'reports/agent1-old-dictionary-public-domain-citation-metadata-custody-validation-result-2026-06-05.json',
  sourceFamilyMembership: 'reports/agent1-old-dictionary-source-family-membership-manifest-2026-06-05.json',
  outputJson: 'reports/agent1-old-dictionary-public-domain-ref-sample-gap-manifest-2026-06-05.json',
  outputMd: 'reports/agent1-old-dictionary-public-domain-ref-sample-gap-manifest-2026-06-05.md',
  validator: 'scripts/validate_agent1_old_dictionary_public_domain_ref_sample_gap_manifest.mjs',
  validatorResult: 'reports/agent1-old-dictionary-public-domain-ref-sample-gap-manifest-validation-result-2026-06-05.json'
};

const commercialFamilies = ['Jastrow Dictionary', 'BDB Dictionary', 'BDB Aramaic Dictionary'];
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

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function countRows(rows) {
  return {
    row_count: rows.length,
    occurrence_count: rows.reduce((sum, row) => sum + Number(row.occurrences || row.occurrence_count || 0), 0)
  };
}

const preview = readJson(paths.preview);
const citationCustody = readJson(paths.citationCustody);
const citationCustodyResult = readJson(paths.citationCustodyValidationResult);
const sourceMembership = readJson(paths.sourceFamilyMembership);

assert(preview.summary?.audited_rows === 500, 'preview audited rows mismatch');
assert(citationCustodyResult.ok === true, 'citation custody validator result must be ok');
assert(citationCustody.citation_coverage_counts?.public_domain_rows_without_refs_sample === 93, 'citation custody ref gap count mismatch');
assert(sourceMembership.source_family_manifests?.length === 5, 'source family membership count mismatch');

const publicRows = (preview.rows || []).filter((row) => (row.public_domain_lexicons || []).length > 0);
const publicRowsWithRefs = publicRows.filter((row) => Number(row.public_domain_refs_count || 0) > 0 || (row.public_domain_refs_sample || []).length > 0);
const publicRowsWithoutRefs = publicRows.filter((row) => Number(row.public_domain_refs_count || 0) === 0 && (row.public_domain_refs_sample || []).length === 0);

const gapRows = publicRowsWithoutRefs.map((row) => ({
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
  public_domain_refs_sample_count: (row.public_domain_refs_sample || []).length,
  public_domain_citation_metadata_present: row.public_domain_citation_metadata_present === true,
  preview_relation_class: row.preview_relation_class,
  preview_status: row.preview_status,
  transform_blockers: row.transform_blockers || [],
  emitted_answer_row_now: row.emitted_answer_row_now === true,
  source_row_emitted_now: row.source_row_emitted_now === true,
  answer_eligible_now: row.answer_eligible_now === true
}));

const coveredRows = publicRowsWithRefs.map((row) => ({
  token_id: row.token_id,
  lexicon_entry_id: row.lexicon_entry_id,
  queue_id: row.queue_id,
  occurrence_count: Number(row.occurrences || 0),
  public_domain_lexicons: row.public_domain_lexicons || [],
  public_domain_rid_count: (row.public_domain_rids || []).length,
  public_domain_headword_count: (row.public_domain_headwords || []).length,
  public_domain_refs_count: Number(row.public_domain_refs_count || 0),
  public_domain_refs_sample_count: (row.public_domain_refs_sample || []).length,
  emitted_answer_row_now: row.emitted_answer_row_now === true,
  source_row_emitted_now: row.source_row_emitted_now === true,
  answer_eligible_now: row.answer_eligible_now === true
}));

const familyPartitions = commercialFamilies.map((family) => {
  const rows = publicRowsWithoutRefs.filter((row) => (row.public_domain_lexicons || []).includes(family));
  return {
    source_family: family,
    license_lane: 'commercial_clean_candidate',
    ...countRows(rows),
    token_ids: rows.map((row) => row.token_id),
    token_ids_sha256: sha256(rows.map((row) => row.token_id).join('\n')),
    exact_blocker: `${family.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')}_public_domain_ref_sample_gap_needs_source_family_boundary_if_refs_required`
  };
});

const gapCounts = {
  public_domain_rows: publicRows.length,
  public_domain_occurrences: publicRows.reduce((sum, row) => sum + Number(row.occurrences || 0), 0),
  rows_with_ref_samples_or_ref_count: publicRowsWithRefs.length,
  occurrences_with_ref_samples_or_ref_count: publicRowsWithRefs.reduce((sum, row) => sum + Number(row.occurrences || 0), 0),
  rows_without_ref_samples_or_ref_count: publicRowsWithoutRefs.length,
  occurrences_without_ref_samples_or_ref_count: publicRowsWithoutRefs.reduce((sum, row) => sum + Number(row.occurrences || 0), 0),
  gap_rows_with_rids: publicRowsWithoutRefs.filter((row) => (row.public_domain_rids || []).length > 0).length,
  gap_rid_total: publicRowsWithoutRefs.reduce((sum, row) => sum + (row.public_domain_rids || []).length, 0),
  gap_rows_with_headwords: publicRowsWithoutRefs.filter((row) => (row.public_domain_headwords || []).length > 0).length,
  gap_headword_total: publicRowsWithoutRefs.reduce((sum, row) => sum + (row.public_domain_headwords || []).length, 0),
  gap_emitted_answer_rows_now: gapRows.filter((row) => row.emitted_answer_row_now).length,
  gap_source_rows_emitted_now: gapRows.filter((row) => row.source_row_emitted_now).length,
  gap_answer_eligible_rows_now: gapRows.filter((row) => row.answer_eligible_now).length,
  gap_token_ids_sha256: sha256(gapRows.map((row) => row.token_id).join('\n')),
  covered_public_ref_token_ids_sha256: sha256(coveredRows.map((row) => row.token_id).join('\n'))
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent1_old_dictionary_public_domain_ref_sample_gap_manifest',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent1_old_dictionary_public_domain_ref_sample_gap_manifest.mjs',
  status: 'public_domain_ref_sample_gap_manifest_recorded_zero_output_no_acceptance',
  agent: 'Agent 1',
  current_agent1_thread_id: '019e975d-dc9f-7020-a7c8-885d083a837e',
  old_agent1_thread_id: '019dc487-5973-7693-aebf-fb0a75936f50',
  old_agent1_policy: 'archived_do_not_use',
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / direct Agent run mode',
  production_lane: 'Hebrew import/source/license/custody/source-lane evidence',
  target: 'old-dictionary-excluded-row-license-lane-reaudit public-domain ref-sample gap manifest',
  purpose: 'Record exact public-domain metadata rows that have RIDs/headwords but no public-domain ref samples/ref counts, without writing content text or authorizing candidate use.',
  inputs: paths,
  required_lane_output_shape: 'target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition',
  gap_counts: gapCounts,
  classification_lanes: [
    {
      license_lane: 'commercial_clean_candidate',
      row_count: gapCounts.rows_without_ref_samples_or_ref_count,
      occurrence_count: gapCounts.occurrences_without_ref_samples_or_ref_count,
      metadata_only: true,
      candidate_text_rows_now: 0,
      agent6_boundary_required: true
    },
    {
      license_lane: 'noncommercial_educational_candidate',
      row_count: 0,
      occurrence_count: 0,
      note: 'This packet is public-domain ref-sample gap only; NC rows remain preserved in prior NC artifacts.'
    },
    {
      license_lane: 'metadata_or_link_only',
      row_count: 0,
      occurrence_count: 0
    },
    {
      license_lane: 'blocked_or_needs_review',
      row_count: 0,
      occurrence_count: 0,
      note: 'No blocked/review row is reclassified by this public-domain-only metadata packet.'
    }
  ],
  family_gap_partitions: familyPartitions,
  public_domain_ref_gap_rows: gapRows,
  public_domain_ref_covered_rows: coveredRows,
  exact_blockers: [
    {
      blocker: 'public_domain_ref_sample_gap_rows_are_metadata_only_not_candidate_text',
      rows: gapCounts.rows_without_ref_samples_or_ref_count,
      occurrences: gapCounts.occurrences_without_ref_samples_or_ref_count,
      handoff_owner: 'Agent 6 for future boundary if refs are required; Agent 2 blocked now'
    },
    {
      blocker: 'public_domain_ref_sample_gap_needs_source_family_boundary_if_ref_samples_required',
      rows: gapCounts.rows_without_ref_samples_or_ref_count,
      occurrences: gapCounts.occurrences_without_ref_samples_or_ref_count,
      handoff_owner: 'Agent 1 records exact gap; Agent 6 decides future source-family boundary requirements'
    }
  ],
  handoff_owner: {
    agent2: 'May not transform ref-gap metadata into candidate text now.',
    agent6: 'Ref-sample gap rows are recorded for future source-family/ref requirement boundary; delivered_to_agent6_now remains 0.',
    agent10: 'May consume gap manifest for future boundary/package assembly only; no release route opened now.'
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
  forbidden_content_fields_not_written: forbiddenFields,
  stop_condition: 'Stop before Agent 6 delivery, Agent 2 transform, candidate text, source/license/legal acceptance, Definition/runtime/publication/product/answer acceptance, queue mutation, render mutation, staging, or release action.'
};

const md = `# Agent 1 Old Dictionary Public-Domain Ref-Sample Gap Manifest - 2026-06-05

production lane | direct active goal | recallable state/proof artifact | exact blocker | stop condition | correction owner

Hebrew import/source/license/custody/source-lane evidence | public-domain ref-sample gap manifest for old-dictionary reaudit | \`${paths.outputJson}\`; validator \`${paths.validator}\` -> \`${paths.validatorResult}\` | ref-gap rows are metadata-only and still require Agent 6 source-family boundary if ref samples are required | ${artifact.stop_condition} | current Agent 1 \`019e975d-dc9f-7020-a7c8-885d083a837e\`; old Agent 1 archived/do-not-use

target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition

\`${artifact.target}\` | \`${paths.preview}\`; \`${paths.citationCustody}\`; \`${paths.sourceFamilyMembership}\` | public-domain rows ${gapCounts.public_domain_rows} / ${gapCounts.public_domain_occurrences}; with refs ${gapCounts.rows_with_ref_samples_or_ref_count} / ${gapCounts.occurrences_with_ref_samples_or_ref_count}; without refs ${gapCounts.rows_without_ref_samples_or_ref_count} / ${gapCounts.occurrences_without_ref_samples_or_ref_count}; gap RID rows ${gapCounts.gap_rows_with_rids}; gap RID total ${gapCounts.gap_rid_total}; gap headword rows ${gapCounts.gap_rows_with_headwords}; gap headword total ${gapCounts.gap_headword_total} | \`commercial_clean_candidate\`; \`noncommercial_educational_candidate\`; \`metadata_or_link_only\`; \`blocked_or_needs_review\` | ${artifact.exact_blockers.map((row) => row.blocker).join('; ')} | Agent 2 blocked; Agent 6 future boundary owner; Agent 10 package assembly only | ${artifact.stop_condition}

## Family Gap Partitions

| source family | rows | occurrences | token_ids_sha256 |
| --- | ---: | ---: | --- |
${familyPartitions.map((row) => `| ${row.source_family} | ${row.row_count} | ${row.occurrence_count} | \`${row.token_ids_sha256}\` |`).join('\n')}

Complete gap rows are in the JSON artifact. Surface, normalized, definition, gloss, answer, candidate text, and definition text fields are not written.
`;

writeJson(paths.outputJson, artifact);
writeText(paths.outputMd, md);

console.log(JSON.stringify({
  ok: true,
  artifact: paths.outputJson,
  report: paths.outputMd,
  gap_counts: artifact.gap_counts
}, null, 2));
