#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const paths = {
  preview: 'reports/agent2-orot-sefaria-public-domain-candidate-preview-2026-06-04.json',
  reaudit: 'reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json',
  exportPartitions: 'reports/agent1-old-dictionary-license-lane-export-partitions-2026-06-04.json',
  exactRowSubsetManifest: 'reports/agent1-old-dictionary-exact-row-subset-manifest-2026-06-05.json',
  exactRowSubsetManifestValidationResult: 'reports/agent1-old-dictionary-exact-row-subset-manifest-validation-result-2026-06-05.json',
  outputJson: 'reports/agent1-old-dictionary-source-family-membership-manifest-2026-06-05.json',
  outputMd: 'reports/agent1-old-dictionary-source-family-membership-manifest-2026-06-05.md',
  validator: 'scripts/validate_agent1_old_dictionary_source_family_membership_manifest.mjs',
  validatorResult: 'reports/agent1-old-dictionary-source-family-membership-manifest-validation-result-2026-06-05.json'
};

const sourceFamilies = [
  {
    source_family: 'Jastrow Dictionary',
    field: 'public_domain_lexicons',
    license_lane: 'commercial_clean_candidate',
    license_label: 'public-domain-observed',
    derived_from_nc: false,
    commercial_export_allowed_now: false,
    attribution_required: false,
    exact_blocker: 'jastrow_dictionary_missing_future_agent6_candidate_use_boundary_and_morphology_relation'
  },
  {
    source_family: 'BDB Dictionary',
    field: 'public_domain_lexicons',
    license_lane: 'commercial_clean_candidate',
    license_label: 'public-domain-observed',
    derived_from_nc: false,
    commercial_export_allowed_now: false,
    attribution_required: false,
    exact_blocker: 'bdb_dictionary_missing_future_agent6_candidate_use_boundary_and_morphology_relation'
  },
  {
    source_family: 'BDB Aramaic Dictionary',
    field: 'public_domain_lexicons',
    license_lane: 'commercial_clean_candidate',
    license_label: 'public-domain-observed',
    derived_from_nc: false,
    commercial_export_allowed_now: false,
    attribution_required: false,
    exact_blocker: 'bdb_aramaic_dictionary_missing_future_agent6_candidate_use_boundary_and_morphology_relation'
  },
  {
    source_family: 'Klein Dictionary',
    field: 'blocked_or_unresolved_lexicons',
    license_lane: 'noncommercial_educational_candidate',
    license_label: 'CC-BY-NC',
    derived_from_nc: true,
    commercial_export_allowed_now: false,
    attribution_required: true,
    exact_blocker: 'klein_dictionary_missing_agent6_nc_boundary_no_commercial_authorization'
  },
  {
    source_family: 'BDB Augmented Strong',
    field: 'blocked_or_unresolved_lexicons',
    license_lane: 'blocked_or_needs_review',
    license_label: 'unresolved-independent-custody',
    derived_from_nc: false,
    commercial_export_allowed_now: false,
    attribution_required: false,
    exact_blocker: 'bdb_augmented_strong_missing_exact_source_license_custody_linkage'
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

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function countBy(values) {
  return values.reduce((memo, value) => {
    const key = value || 'null';
    memo[key] = (memo[key] || 0) + 1;
    return memo;
  }, {});
}

function hasFamily(row, field, family) {
  return Array.isArray(row[field]) && row[field].includes(family);
}

const preview = readJson(paths.preview);
const reaudit = readJson(paths.reaudit);
const exportPartitions = readJson(paths.exportPartitions);
const exactSubsetManifest = readJson(paths.exactRowSubsetManifest);
const exactSubsetResult = readJson(paths.exactRowSubsetManifestValidationResult);

assert(preview.summary?.audited_rows === 500, 'preview audited rows mismatch');
assert((preview.rows || []).length === 500, 'preview rows array mismatch');
assert(reaudit.workset === 'old-dictionary-excluded-row-license-lane-reaudit', 'reaudit workset mismatch');
assert(exportPartitions.count_semantics?.row_count_is_not_exclusive_export_row_count === true, 'export partition count semantics missing');
assert(exactSubsetResult.ok === true, 'exact row-subset manifest validator result must be ok');
assert(exactSubsetManifest.manifest_counts?.unique_manifest_token_id_count === 500, 'exact row-subset manifest coverage mismatch');

const bucketByTokenId = new Map();
for (const subset of exactSubsetManifest.subset_manifests || []) {
  for (const tokenId of subset.token_ids || []) {
    bucketByTokenId.set(tokenId, subset.bucket_id);
  }
}

const familyManifests = sourceFamilies.map((family) => {
  const rows = (preview.rows || []).filter((row) => hasFamily(row, family.field, family.source_family));
  const tokenIds = rows.map((row) => row.token_id);
  const bucketCounts = countBy(tokenIds.map((tokenId) => bucketByTokenId.get(tokenId)));
  return {
    row_subset_id: `old-dictionary-excluded-row-license-lane-reaudit::source-family::${family.source_family.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
    source_family: family.source_family,
    license_lane: family.license_lane,
    license_label: family.license_label,
    source_membership_field: family.field,
    row_count: rows.length,
    occurrence_count: rows.reduce((sum, row) => sum + Number(row.occurrences || 0), 0),
    token_ids: tokenIds,
    token_id_count: tokenIds.length,
    token_ids_sha256: sha256(tokenIds.join('\n')),
    lexicon_entry_ids: rows.map((row) => row.lexicon_entry_id),
    queue_ids: rows.map((row) => row.queue_id),
    row_overlap_bucket_counts: bucketCounts,
    preview_relation_class_counts: countBy(rows.map((row) => row.preview_relation_class)),
    preview_status_counts: countBy(rows.map((row) => row.preview_status)),
    derived_from_nc: family.derived_from_nc,
    commercial_export_allowed_now: family.commercial_export_allowed_now,
    attribution_required: family.attribution_required,
    candidate_text_rows_now: 0,
    agent6_delivery_now: 0,
    exact_blocker: family.exact_blocker
  };
});

const laneCounts = {
  commercial_clean_candidate_source_families: familyManifests.filter((family) => family.license_lane === 'commercial_clean_candidate').length,
  noncommercial_educational_candidate_source_families: familyManifests.filter((family) => family.license_lane === 'noncommercial_educational_candidate').length,
  metadata_or_link_only_source_families: familyManifests.filter((family) => family.license_lane === 'metadata_or_link_only').length,
  blocked_or_needs_review_source_families: familyManifests.filter((family) => family.license_lane === 'blocked_or_needs_review').length
};

const membershipCounts = {
  source_family_count: familyManifests.length,
  source_family_membership_rows_nonexclusive: familyManifests.reduce((sum, family) => sum + family.row_count, 0),
  source_family_membership_occurrences_nonexclusive: familyManifests.reduce((sum, family) => sum + family.occurrence_count, 0),
  unique_preview_rows: preview.rows.length,
  unique_preview_occurrences: preview.summary.audited_occurrences,
  jastrow_rows: familyManifests.find((family) => family.source_family === 'Jastrow Dictionary').row_count,
  bdb_dictionary_rows: familyManifests.find((family) => family.source_family === 'BDB Dictionary').row_count,
  bdb_aramaic_dictionary_rows: familyManifests.find((family) => family.source_family === 'BDB Aramaic Dictionary').row_count,
  klein_rows: familyManifests.find((family) => family.source_family === 'Klein Dictionary').row_count,
  bdb_augmented_strong_rows: familyManifests.find((family) => family.source_family === 'BDB Augmented Strong').row_count,
  delivered_to_agent6_now: 0,
  allowed_transform_rows_now: 0,
  candidate_text_rows_now: 0
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent1_old_dictionary_source_family_membership_manifest',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent1_old_dictionary_source_family_membership_manifest.mjs',
  status: 'source_family_membership_manifest_recorded_nonexclusive_zero_output_no_acceptance',
  agent: 'Agent 1',
  current_agent1_thread_id: '019e975d-dc9f-7020-a7c8-885d083a837e',
  old_agent1_thread_id: '019dc487-5973-7693-aebf-fb0a75936f50',
  old_agent1_policy: 'archived_do_not_use',
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / direct Agent run mode',
  production_lane: 'Hebrew import/source/license/custody/source-lane evidence',
  target: 'old-dictionary-excluded-row-license-lane-reaudit source-family membership manifest',
  purpose: 'Record complete source-family token membership for each old-dictionary evidence family and link each family to exact row-overlap buckets, while preserving nonexclusive count semantics.',
  inputs: paths,
  required_lane_output_shape: 'target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition',
  count_semantics: {
    source_family_membership_counts_are_nonexclusive: true,
    reason: 'A single preview token row can belong to multiple dictionary source families and multiple lane-overlap buckets.',
    exclusive_export_row_counts_authorized_now: false
  },
  membership_counts: membershipCounts,
  lane_counts: laneCounts,
  source_family_manifests: familyManifests,
  exact_blockers: familyManifests.map((family) => ({
    row_subset_id: family.row_subset_id,
    source_family: family.source_family,
    license_lane: family.license_lane,
    rows: family.row_count,
    occurrences: family.occurrence_count,
    token_ids_sha256: family.token_ids_sha256,
    blocker: family.exact_blocker
  })),
  handoff_owner: {
    agent2: 'May not transform family memberships now; use only after Agent 6 boundary and exact future package.',
    agent6: 'Exact source-family token memberships are recorded for future boundary review; delivered_to_agent6_now remains 0.',
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

const md = `# Agent 1 Old Dictionary Source-Family Membership Manifest - 2026-06-05

production lane | direct active goal | recallable state/proof artifact | exact blocker | stop condition | correction owner

Hebrew import/source/license/custody/source-lane evidence | exact source-family token membership for old-dictionary reaudit | \`${paths.outputJson}\`; validator \`${paths.validator}\` -> \`${paths.validatorResult}\` | source-family memberships are nonexclusive and still require Agent 6 boundary before any candidate use | ${artifact.stop_condition} | current Agent 1 \`019e975d-dc9f-7020-a7c8-885d083a837e\`; old Agent 1 archived/do-not-use

target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition

\`${artifact.target}\` | \`${paths.preview}\`; \`${paths.reaudit}\`; \`${paths.exportPartitions}\`; \`${paths.exactRowSubsetManifest}\` | source families ${membershipCounts.source_family_count}; nonexclusive family memberships ${membershipCounts.source_family_membership_rows_nonexclusive} rows / ${membershipCounts.source_family_membership_occurrences_nonexclusive} occurrences; unique preview ${membershipCounts.unique_preview_rows} / ${membershipCounts.unique_preview_occurrences}; Jastrow ${membershipCounts.jastrow_rows}; BDB ${membershipCounts.bdb_dictionary_rows}; BDB Aramaic ${membershipCounts.bdb_aramaic_dictionary_rows}; Klein ${membershipCounts.klein_rows}; BDB Augmented Strong ${membershipCounts.bdb_augmented_strong_rows} | \`commercial_clean_candidate\` ${laneCounts.commercial_clean_candidate_source_families}; \`noncommercial_educational_candidate\` ${laneCounts.noncommercial_educational_candidate_source_families}; \`metadata_or_link_only\` ${laneCounts.metadata_or_link_only_source_families}; \`blocked_or_needs_review\` ${laneCounts.blocked_or_needs_review_source_families} | ${artifact.exact_blockers.map((row) => row.blocker).join('; ')} | Agent 2 blocked until exact lane evidence plus Agent 6 boundary; Agent 6 future boundary owner; Agent 10 package assembly only | ${artifact.stop_condition}

## Source-Family Hashes

| source family | lane | rows | occurrences | token_ids_sha256 |
| --- | --- | ---: | ---: | --- |
${familyManifests.map((family) => `| ${family.source_family} | ${family.license_lane} | ${family.row_count} | ${family.occurrence_count} | \`${family.token_ids_sha256}\` |`).join('\n')}

## Boundary

- Complete token IDs are present in the JSON artifact.
- Source-family row counts are nonexclusive.
- Klein remains \`noncommercial_educational_candidate\` with commercial export false.
- BDB Augmented Strong remains \`blocked_or_needs_review\` with exact custody linkage unproven.
- Zero output: no Agent 6 delivery, transform, candidate text, accepted gloss, answer row, source emission, public HUD row, queue/render/staging mutation, or release route.
`;

writeJson(paths.outputJson, artifact);
writeText(paths.outputMd, md);

console.log(JSON.stringify({
  ok: true,
  artifact: paths.outputJson,
  report: paths.outputMd,
  membership_counts: artifact.membership_counts,
  lane_counts: artifact.lane_counts
}, null, 2));
