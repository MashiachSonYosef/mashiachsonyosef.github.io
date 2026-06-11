#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const paths = {
  preview: 'reports/agent2-orot-sefaria-public-domain-candidate-preview-2026-06-04.json',
  exactRowSubsetManifest: 'reports/agent1-old-dictionary-exact-row-subset-manifest-2026-06-05.json',
  sourceFamilyOverlapMatrix: 'reports/agent1-old-dictionary-source-family-overlap-matrix-2026-06-05.json',
  ridNamespaceInventory: 'reports/agent1-old-dictionary-public-domain-rid-namespace-inventory-2026-06-05.json',
  refGapManifest: 'reports/agent1-old-dictionary-public-domain-ref-sample-gap-manifest-2026-06-05.json',
  outputJson: 'reports/agent1-old-dictionary-commercial-clean-only-metadata-custody-2026-06-05.json',
  outputMd: 'reports/agent1-old-dictionary-commercial-clean-only-metadata-custody-2026-06-05.md',
  validator: 'scripts/validate_agent1_old_dictionary_commercial_clean_only_metadata_custody.mjs',
  validatorResult: 'reports/agent1-old-dictionary-commercial-clean-only-metadata-custody-validation-result-2026-06-05.json'
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

const preview = readJson(paths.preview);
const exactRows = readJson(paths.exactRowSubsetManifest);
const overlap = readJson(paths.sourceFamilyOverlapMatrix);
const ridInventory = readJson(paths.ridNamespaceInventory);
const refGap = readJson(paths.refGapManifest);

assert(preview.summary?.audited_rows === 500, 'preview audited rows mismatch');
assert(exactRows.manifest_counts?.commercial_clean_only_rows === 18, 'exact subset commercial clean only count mismatch');
assert(overlap.matrix_counts?.total_exact_combination_rows === 500, 'overlap matrix coverage mismatch');
assert(ridInventory.inventory_counts?.public_domain_rows === 297, 'RID inventory public-domain count mismatch');
assert(refGap.gap_counts?.rows_without_ref_samples_or_ref_count === 93, 'ref gap count mismatch');

const subsetRows = (preview.rows || []).filter((row) =>
  (row.public_domain_lexicons || []).length > 0 &&
  !(row.blocked_or_unresolved_lexicons || []).includes('Klein Dictionary') &&
  !(row.blocked_or_unresolved_lexicons || []).includes('BDB Augmented Strong')
);

const metadataRows = subsetRows.map((row) => ({
  token_id: row.token_id,
  lexicon_entry_id: row.lexicon_entry_id,
  queue_id: row.queue_id,
  occurrence_count: Number(row.occurrences || 0),
  public_domain_lexicons: row.public_domain_lexicons || [],
  blocked_or_unresolved_lexicons: row.blocked_or_unresolved_lexicons || [],
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

const rowsWithRefs = subsetRows.filter((row) => Number(row.public_domain_refs_count || 0) > 0 || (row.public_domain_refs_sample || []).length > 0);
const rowsWithoutRefs = subsetRows.filter((row) => Number(row.public_domain_refs_count || 0) === 0 && (row.public_domain_refs_sample || []).length === 0);

const custodyCounts = {
  commercial_clean_only_rows: subsetRows.length,
  commercial_clean_only_occurrences: subsetRows.reduce((sum, row) => sum + Number(row.occurrences || 0), 0),
  source_family: 'Jastrow Dictionary',
  jastrow_only_rows: subsetRows.filter((row) => JSON.stringify(row.public_domain_lexicons || []) === JSON.stringify(['Jastrow Dictionary'])).length,
  rows_with_nc_overlap: subsetRows.filter((row) => (row.blocked_or_unresolved_lexicons || []).includes('Klein Dictionary')).length,
  rows_with_blocked_overlap: subsetRows.filter((row) => (row.blocked_or_unresolved_lexicons || []).includes('BDB Augmented Strong')).length,
  rows_with_refs: rowsWithRefs.length,
  occurrences_with_refs: rowsWithRefs.reduce((sum, row) => sum + Number(row.occurrences || 0), 0),
  rows_without_refs: rowsWithoutRefs.length,
  occurrences_without_refs: rowsWithoutRefs.reduce((sum, row) => sum + Number(row.occurrences || 0), 0),
  rid_total: subsetRows.reduce((sum, row) => sum + (row.public_domain_rids || []).length, 0),
  headword_total: subsetRows.reduce((sum, row) => sum + (row.public_domain_headwords || []).length, 0),
  emitted_answer_rows_now: metadataRows.filter((row) => row.emitted_answer_row_now).length,
  source_rows_emitted_now: metadataRows.filter((row) => row.source_row_emitted_now).length,
  answer_eligible_rows_now: metadataRows.filter((row) => row.answer_eligible_now).length,
  token_ids_sha256: sha256(metadataRows.map((row) => row.token_id).join('\n')),
  ref_gap_token_ids_sha256: sha256(rowsWithoutRefs.map((row) => row.token_id).join('\n'))
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent1_old_dictionary_commercial_clean_only_metadata_custody',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent1_old_dictionary_commercial_clean_only_metadata_custody.mjs',
  status: 'commercial_clean_only_metadata_custody_recorded_zero_output_no_acceptance',
  agent: 'Agent 1',
  current_agent1_thread_id: '019e975d-dc9f-7020-a7c8-885d083a837e',
  old_agent1_thread_id: '019dc487-5973-7693-aebf-fb0a75936f50',
  old_agent1_policy: 'archived_do_not_use',
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / direct Agent run mode',
  production_lane: 'Hebrew import/source/license/custody/source-lane evidence',
  target: 'old-dictionary-excluded-row-license-lane-reaudit commercial-clean-only metadata custody',
  purpose: 'Record exact 18-row Jastrow-only public-domain subset with no Klein NC or BDB Augmented Strong overlap, while preserving zero output and no acceptance claims.',
  inputs: paths,
  required_lane_output_shape: 'target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition',
  custody_counts: custodyCounts,
  classification_lanes: [
    {
      license_lane: 'commercial_clean_candidate',
      row_count: custodyCounts.commercial_clean_only_rows,
      occurrence_count: custodyCounts.commercial_clean_only_occurrences,
      source_family: custodyCounts.source_family,
      rows_with_refs: custodyCounts.rows_with_refs,
      rows_without_refs: custodyCounts.rows_without_refs,
      candidate_text_rows_now: 0,
      agent6_boundary_required: true
    },
    {
      license_lane: 'noncommercial_educational_candidate',
      row_count: 0,
      occurrence_count: 0,
      note: 'No Klein NC overlap in this exact subset.'
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
      note: 'No BDB Augmented Strong overlap in this exact subset.'
    }
  ],
  commercial_clean_only_metadata_rows: metadataRows,
  ref_gap_rows: rowsWithoutRefs.map((row) => ({
    token_id: row.token_id,
    lexicon_entry_id: row.lexicon_entry_id,
    queue_id: row.queue_id,
    occurrence_count: Number(row.occurrences || 0),
    public_domain_lexicons: row.public_domain_lexicons || [],
    public_domain_rids: row.public_domain_rids || [],
    public_domain_headwords: row.public_domain_headwords || [],
    public_domain_refs_count: Number(row.public_domain_refs_count || 0),
    public_domain_refs_sample_count: (row.public_domain_refs_sample || []).length
  })),
  exact_blockers: [
    {
      blocker: 'commercial_clean_only_rows_still_need_agent6_candidate_use_boundary_and_morphology_relation',
      rows: custodyCounts.commercial_clean_only_rows,
      occurrences: custodyCounts.commercial_clean_only_occurrences,
      handoff_owner: 'Agent 6 for future exact row/subset boundary; Agent 10 for package assembly'
    },
    {
      blocker: 'commercial_clean_only_metadata_is_not_definition_or_candidate_text',
      rows: custodyCounts.commercial_clean_only_rows,
      occurrences: custodyCounts.commercial_clean_only_occurrences,
      handoff_owner: 'Agent 1 preserves metadata custody only; Agent 2 blocked now'
    },
    {
      blocker: 'commercial_clean_only_ref_gap_row_needs_ref_boundary_if_refs_required',
      rows: custodyCounts.rows_without_refs,
      occurrences: custodyCounts.occurrences_without_refs,
      handoff_owner: 'Agent 6 for ref requirement boundary if future package uses refs'
    }
  ],
  handoff_owner: {
    agent2: 'May not transform this metadata-only subset into candidate text now.',
    agent6: 'Commercial-clean-only row IDs are recorded for future boundary review; delivered_to_agent6_now remains 0.',
    agent10: 'May consume subset for future boundary/package assembly only; no release route opened now.'
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

const md = `# Agent 1 Old Dictionary Commercial-Clean-Only Metadata Custody - 2026-06-05

production lane | direct active goal | recallable state/proof artifact | exact blocker | stop condition | correction owner

Hebrew import/source/license/custody/source-lane evidence | commercial-clean-only metadata custody for old-dictionary reaudit | \`${paths.outputJson}\`; validator \`${paths.validator}\` -> \`${paths.validatorResult}\` | 18 Jastrow-only rows still need Agent 6 candidate-use boundary and morphology relation | ${artifact.stop_condition} | current Agent 1 \`019e975d-dc9f-7020-a7c8-885d083a837e\`; old Agent 1 archived/do-not-use

target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition

\`${artifact.target}\` | \`${paths.preview}\`; \`${paths.exactRowSubsetManifest}\`; \`${paths.sourceFamilyOverlapMatrix}\`; \`${paths.ridNamespaceInventory}\`; \`${paths.refGapManifest}\` | commercial-clean-only ${custodyCounts.commercial_clean_only_rows} / ${custodyCounts.commercial_clean_only_occurrences}; source family ${custodyCounts.source_family}; refs ${custodyCounts.rows_with_refs} / ${custodyCounts.occurrences_with_refs}; no refs ${custodyCounts.rows_without_refs} / ${custodyCounts.occurrences_without_refs}; RID total ${custodyCounts.rid_total}; headword total ${custodyCounts.headword_total}; NC overlap ${custodyCounts.rows_with_nc_overlap}; blocked overlap ${custodyCounts.rows_with_blocked_overlap} | \`commercial_clean_candidate\`; \`noncommercial_educational_candidate\`; \`metadata_or_link_only\`; \`blocked_or_needs_review\` | ${artifact.exact_blockers.map((row) => row.blocker).join('; ')} | Agent 2 blocked; Agent 6 future boundary owner; Agent 10 package assembly only | ${artifact.stop_condition}

Complete metadata rows are in the JSON artifact. Surface, normalized, definition, gloss, answer, candidate text, and definition text fields are not written.
`;

writeJson(paths.outputJson, artifact);
writeText(paths.outputMd, md);

console.log(JSON.stringify({
  ok: true,
  artifact: paths.outputJson,
  report: paths.outputMd,
  custody_counts: artifact.custody_counts
}, null, 2));
