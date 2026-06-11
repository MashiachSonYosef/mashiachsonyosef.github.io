#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const paths = {
  preview: 'reports/agent2-orot-sefaria-public-domain-candidate-preview-2026-06-04.json',
  rowOverlapBoundary: 'reports/agent1-old-dictionary-row-overlap-lane-boundary-2026-06-05.json',
  rowOverlapBoundaryValidationResult: 'reports/agent1-old-dictionary-row-overlap-lane-boundary-validation-result-2026-06-05.json',
  agent6Supplement: 'reports/agent1-old-dictionary-row-overlap-agent6-boundary-supplement-2026-06-05.json',
  agent6SupplementValidationResult: 'reports/agent1-old-dictionary-row-overlap-agent6-boundary-supplement-validation-result-2026-06-05.json',
  outputJson: 'reports/agent1-old-dictionary-exact-row-subset-manifest-2026-06-05.json',
  outputMd: 'reports/agent1-old-dictionary-exact-row-subset-manifest-2026-06-05.md',
  validator: 'scripts/validate_agent1_old_dictionary_exact_row_subset_manifest.mjs',
  validatorResult: 'reports/agent1-old-dictionary-exact-row-subset-manifest-validation-result-2026-06-05.json'
};

const commercialFamilies = ['Jastrow Dictionary', 'BDB Dictionary', 'BDB Aramaic Dictionary'];
const bucketSpecs = [
  {
    bucket_id: 'commercial_clean_only',
    row_subset_id: 'old-dictionary-excluded-row-license-lane-reaudit::row-subset::commercial-clean-only',
    classification_lanes: ['commercial_clean_candidate'],
    predicate: (row) => row.hasCommercial && !row.hasKlein && !row.hasBdbAugmentedStrong,
    exact_blocker: 'commercial_clean_only_missing_future_agent6_candidate_use_boundary_and_morphology_relation'
  },
  {
    bucket_id: 'commercial_clean_plus_noncommercial_educational',
    row_subset_id: 'old-dictionary-excluded-row-license-lane-reaudit::row-subset::commercial-clean-plus-nc',
    classification_lanes: ['commercial_clean_candidate', 'noncommercial_educational_candidate'],
    predicate: (row) => row.hasCommercial && row.hasKlein && !row.hasBdbAugmentedStrong,
    exact_blocker: 'commercial_clean_plus_nc_overlap_missing_agent6_source_family_selection_boundary'
  },
  {
    bucket_id: 'commercial_clean_plus_blocked_review',
    row_subset_id: 'old-dictionary-excluded-row-license-lane-reaudit::row-subset::commercial-clean-plus-blocked-review',
    classification_lanes: ['commercial_clean_candidate', 'blocked_or_needs_review'],
    predicate: (row) => row.hasCommercial && !row.hasKlein && row.hasBdbAugmentedStrong,
    exact_blocker: 'commercial_clean_plus_blocked_overlap_missing_agent6_source_family_selection_boundary'
  },
  {
    bucket_id: 'commercial_clean_plus_noncommercial_educational_plus_blocked_review',
    row_subset_id: 'old-dictionary-excluded-row-license-lane-reaudit::row-subset::commercial-clean-plus-nc-plus-blocked-review',
    classification_lanes: ['commercial_clean_candidate', 'noncommercial_educational_candidate', 'blocked_or_needs_review'],
    predicate: (row) => row.hasCommercial && row.hasKlein && row.hasBdbAugmentedStrong,
    exact_blocker: 'triple_overlap_missing_agent6_source_family_selection_boundary'
  },
  {
    bucket_id: 'noncommercial_educational_only',
    row_subset_id: 'old-dictionary-excluded-row-license-lane-reaudit::row-subset::noncommercial-educational-only',
    classification_lanes: ['noncommercial_educational_candidate'],
    predicate: (row) => !row.hasCommercial && row.hasKlein && !row.hasBdbAugmentedStrong,
    exact_blocker: 'nc_educational_only_missing_agent6_nc_boundary_no_commercial_authorization'
  },
  {
    bucket_id: 'blocked_review_only',
    row_subset_id: 'old-dictionary-excluded-row-license-lane-reaudit::row-subset::blocked-review-only',
    classification_lanes: ['blocked_or_needs_review'],
    predicate: (row) => !row.hasCommercial && !row.hasKlein && row.hasBdbAugmentedStrong,
    exact_blocker: 'blocked_review_only_zero_rows_no_current_boundary_delivery'
  },
  {
    bucket_id: 'metadata_or_link_only',
    row_subset_id: 'old-dictionary-excluded-row-license-lane-reaudit::row-subset::metadata-or-link-only',
    classification_lanes: ['metadata_or_link_only'],
    predicate: (row) => !row.hasCommercial && !row.hasKlein && !row.hasBdbAugmentedStrong && row.hasSefariaHit,
    exact_blocker: 'metadata_or_link_only_zero_rows_no_current_boundary_delivery'
  },
  {
    bucket_id: 'no_sefaria_source_hit',
    row_subset_id: 'old-dictionary-excluded-row-license-lane-reaudit::row-subset::no-sefaria-source-hit',
    classification_lanes: ['blocked_or_needs_review'],
    predicate: (row) => !row.hasCommercial && !row.hasKlein && !row.hasBdbAugmentedStrong && !row.hasSefariaHit,
    exact_blocker: 'no_sefaria_source_hit_missing_source_license_custody_evidence'
  }
];

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

function hasFamily(row, field, family) {
  return Array.isArray(row[field]) && row[field].includes(family);
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

const preview = readJson(paths.preview);
const rowOverlap = readJson(paths.rowOverlapBoundary);
const rowOverlapResult = readJson(paths.rowOverlapBoundaryValidationResult);
const agent6Supplement = readJson(paths.agent6Supplement);
const agent6SupplementResult = readJson(paths.agent6SupplementValidationResult);

assert(preview.summary?.audited_rows === 500, 'preview audited rows mismatch');
assert((preview.rows || []).length === 500, 'preview rows array mismatch');
assert(rowOverlapResult.ok === true, 'row-overlap validator result must be ok');
assert(agent6SupplementResult.ok === true, 'Agent 6 supplement validator result must be ok');
assert(agent6Supplement.boundary_question_counts.total_rows_represented === 500, 'Agent 6 supplement row coverage mismatch');

const rowFacts = (preview.rows || []).map((row, index) => {
  const publicDomainLexicons = row.public_domain_lexicons || [];
  const blockedLexicons = row.blocked_or_unresolved_lexicons || [];
  return {
    queue_id: row.queue_id,
    source_audit_priority: row.source_audit_priority,
    token_id: row.token_id,
    lexicon_entry_id: row.lexicon_entry_id,
    occurrence_count: Number(row.occurrences || 0),
    row_index: index,
    public_domain_lexicons: publicDomainLexicons,
    blocked_or_unresolved_lexicons: blockedLexicons,
    preview_relation_class: row.preview_relation_class,
    preview_status: row.preview_status,
    transform_blockers: row.transform_blockers || [],
    hasCommercial: publicDomainLexicons.some((family) => commercialFamilies.includes(family)),
    hasKlein: blockedLexicons.includes('Klein Dictionary'),
    hasBdbAugmentedStrong: blockedLexicons.includes('BDB Augmented Strong'),
    hasSefariaHit: Number(row.sefaria_combined_hit_count || 0) > 0,
    emitted_answer_row_now: row.emitted_answer_row_now === true,
    source_row_emitted_now: row.source_row_emitted_now === true,
    answer_eligible_now: row.answer_eligible_now === true
  };
});

const subsetManifests = bucketSpecs.map((spec) => {
  const rows = rowFacts.filter(spec.predicate);
  const tokenIds = rows.map((row) => row.token_id);
  return {
    bucket_id: spec.bucket_id,
    row_subset_id: spec.row_subset_id,
    classification_lanes: spec.classification_lanes,
    row_count: rows.length,
    occurrence_count: rows.reduce((sum, row) => sum + row.occurrence_count, 0),
    token_ids: tokenIds,
    token_id_count: tokenIds.length,
    token_ids_sha256: sha256(tokenIds.join('\n')),
    lexicon_entry_ids: rows.map((row) => row.lexicon_entry_id),
    queue_ids: rows.map((row) => row.queue_id),
    preview_relation_class_counts: countBy(rows.map((row) => row.preview_relation_class)),
    preview_status_counts: countBy(rows.map((row) => row.preview_status)),
    public_domain_lexicon_counts: countBy(rows.flatMap((row) => row.public_domain_lexicons)),
    blocked_or_unresolved_lexicon_counts: countBy(rows.flatMap((row) => row.blocked_or_unresolved_lexicons)),
    exact_blocker: spec.exact_blocker,
    current_allowed_now: {
      agent2_transform: false,
      candidate_text_export: false,
      definition_content_storage: false,
      answer_eligibility: false,
      public_emit: false,
      release_action: false,
      agent6_delivery: false
    }
  };
});

function countBy(values) {
  return values.reduce((memo, value) => {
    const key = value || 'null';
    memo[key] = (memo[key] || 0) + 1;
    return memo;
  }, {});
}

const allManifestTokenIds = subsetManifests.flatMap((subset) => subset.token_ids);
const uniqueManifestTokenIds = new Set(allManifestTokenIds);

const manifestCounts = {
  subset_count: subsetManifests.length,
  audited_rows: preview.rows.length,
  audited_occurrences: preview.summary.audited_occurrences,
  manifest_token_id_count: allManifestTokenIds.length,
  unique_manifest_token_id_count: uniqueManifestTokenIds.size,
  duplicate_token_id_count: allManifestTokenIds.length - uniqueManifestTokenIds.size,
  commercial_clean_only_rows: subsetManifests.find((subset) => subset.bucket_id === 'commercial_clean_only').row_count,
  commercial_clean_plus_nc_rows: subsetManifests.find((subset) => subset.bucket_id === 'commercial_clean_plus_noncommercial_educational').row_count,
  commercial_clean_plus_blocked_rows: subsetManifests.find((subset) => subset.bucket_id === 'commercial_clean_plus_blocked_review').row_count,
  triple_overlap_rows: subsetManifests.find((subset) => subset.bucket_id === 'commercial_clean_plus_noncommercial_educational_plus_blocked_review').row_count,
  nc_only_rows: subsetManifests.find((subset) => subset.bucket_id === 'noncommercial_educational_only').row_count,
  metadata_or_link_only_rows: subsetManifests.find((subset) => subset.bucket_id === 'metadata_or_link_only').row_count,
  blocked_review_only_rows: subsetManifests.find((subset) => subset.bucket_id === 'blocked_review_only').row_count,
  no_source_hit_rows: subsetManifests.find((subset) => subset.bucket_id === 'no_sefaria_source_hit').row_count,
  total_rows_represented: subsetManifests.reduce((sum, subset) => sum + subset.row_count, 0),
  total_occurrences_represented: subsetManifests.reduce((sum, subset) => sum + subset.occurrence_count, 0),
  delivered_to_agent6_now: 0,
  allowed_transform_rows_now: 0,
  candidate_text_rows_now: 0
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent1_old_dictionary_exact_row_subset_manifest',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent1_old_dictionary_exact_row_subset_manifest.mjs',
  status: 'exact_row_subset_manifest_recorded_zero_output_no_acceptance',
  agent: 'Agent 1',
  current_agent1_thread_id: '019e975d-dc9f-7020-a7c8-885d083a837e',
  old_agent1_thread_id: '019dc487-5973-7693-aebf-fb0a75936f50',
  old_agent1_policy: 'archived_do_not_use',
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / direct Agent run mode',
  production_lane: 'Hebrew import/source/license/custody/source-lane evidence',
  target: 'old-dictionary-excluded-row-license-lane-reaudit exact row-subset manifest',
  purpose: 'Provide complete token/queue/lexicon-entry row-subset boundaries for each validated row-overlap bucket so downstream agents do not rely on sampled row IDs.',
  inputs: paths,
  required_lane_output_shape: 'target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition',
  manifest_counts: manifestCounts,
  subset_manifests: subsetManifests,
  exact_blockers: subsetManifests.map((subset) => ({
    row_subset_id: subset.row_subset_id,
    bucket_id: subset.bucket_id,
    classification_lanes: subset.classification_lanes,
    rows: subset.row_count,
    occurrences: subset.occurrence_count,
    token_ids_sha256: subset.token_ids_sha256,
    blocker: subset.exact_blocker
  })),
  handoff_owner: {
    agent2: 'May not transform these subsets now; use full token_ids only after Agent 6 boundary and exact future package.',
    agent6: 'Exact row-subset token_ids are recorded for future boundary review; delivered_to_agent6_now remains 0.',
    agent10: 'May consume manifest for future boundary/package assembly only; no release route opened now.'
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

const md = `# Agent 1 Old Dictionary Exact Row-Subset Manifest - 2026-06-05

production lane | direct active goal | recallable state/proof artifact | exact blocker | stop condition | correction owner

Hebrew import/source/license/custody/source-lane evidence | exact full row-subset manifest for old-dictionary overlap buckets | \`${paths.outputJson}\`; validator \`${paths.validator}\` -> \`${paths.validatorResult}\` | full token IDs recorded for future boundary only; Agent 6 boundary and candidate package missing | ${artifact.stop_condition} | current Agent 1 \`019e975d-dc9f-7020-a7c8-885d083a837e\`; old Agent 1 archived/do-not-use

target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition

\`${artifact.target}\` | \`${paths.preview}\`; \`${paths.rowOverlapBoundary}\`; \`${paths.agent6Supplement}\` | ${manifestCounts.subset_count} subsets; ${manifestCounts.total_rows_represented} rows / ${manifestCounts.total_occurrences_represented} occurrences; duplicate token IDs ${manifestCounts.duplicate_token_id_count}; commercial-only ${manifestCounts.commercial_clean_only_rows}; commercial+NC ${manifestCounts.commercial_clean_plus_nc_rows}; commercial+blocked ${manifestCounts.commercial_clean_plus_blocked_rows}; triple-overlap ${manifestCounts.triple_overlap_rows}; NC-only ${manifestCounts.nc_only_rows}; metadata/link-only ${manifestCounts.metadata_or_link_only_rows}; blocked-only ${manifestCounts.blocked_review_only_rows}; no-source-hit ${manifestCounts.no_source_hit_rows} | \`commercial_clean_candidate\`; \`noncommercial_educational_candidate\`; \`metadata_or_link_only\`; \`blocked_or_needs_review\` | ${artifact.exact_blockers.map((row) => row.blocker).join('; ')} | Agent 2 blocked until exact lane evidence plus Agent 6 boundary; Agent 6 future boundary owner; Agent 10 package assembly only | ${artifact.stop_condition}

## Subset Hashes

| bucket | rows | occurrences | token_ids_sha256 | lanes |
| --- | ---: | ---: | --- | --- |
${subsetManifests.map((subset) => `| ${subset.bucket_id} | ${subset.row_count} | ${subset.occurrence_count} | \`${subset.token_ids_sha256}\` | ${subset.classification_lanes.join(', ')} |`).join('\n')}

## Boundary

- Complete token IDs are present in the JSON artifact, not repeated in this markdown report.
- NC-only and NC-overlap rows preserve \`noncommercial_educational_candidate\` separately.
- No candidate text, accepted gloss, answer, public HUD row, route JSONL row, Agent 6 delivery, queue mutation, render mutation, staging, or release action is authorized.
`;

writeJson(paths.outputJson, artifact);
writeText(paths.outputMd, md);

console.log(JSON.stringify({
  ok: true,
  artifact: paths.outputJson,
  report: paths.outputMd,
  manifest_counts: artifact.manifest_counts
}, null, 2));
