#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const paths = {
  preview: 'reports/agent2-orot-sefaria-public-domain-candidate-preview-2026-06-04.json',
  sourceFamilyMembership: 'reports/agent1-old-dictionary-source-family-membership-manifest-2026-06-05.json',
  sourceFamilyMembershipValidationResult: 'reports/agent1-old-dictionary-source-family-membership-manifest-validation-result-2026-06-05.json',
  exactRowSubsetManifest: 'reports/agent1-old-dictionary-exact-row-subset-manifest-2026-06-05.json',
  outputJson: 'reports/agent1-old-dictionary-source-family-overlap-matrix-2026-06-05.json',
  outputMd: 'reports/agent1-old-dictionary-source-family-overlap-matrix-2026-06-05.md',
  validator: 'scripts/validate_agent1_old_dictionary_source_family_overlap_matrix.mjs',
  validatorResult: 'reports/agent1-old-dictionary-source-family-overlap-matrix-validation-result-2026-06-05.json'
};

const sourceFamilies = [
  { name: 'Jastrow Dictionary', lane: 'commercial_clean_candidate' },
  { name: 'BDB Dictionary', lane: 'commercial_clean_candidate' },
  { name: 'BDB Aramaic Dictionary', lane: 'commercial_clean_candidate' },
  { name: 'Klein Dictionary', lane: 'noncommercial_educational_candidate' },
  { name: 'BDB Augmented Strong', lane: 'blocked_or_needs_review' }
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

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function lanesForFamilies(families) {
  if (families.length === 0) return ['blocked_or_needs_review'];
  return [...new Set(families.map((family) => sourceFamilies.find((row) => row.name === family)?.lane).filter(Boolean))];
}

function blockerForLanes(lanes) {
  if (lanes.includes('noncommercial_educational_candidate') && lanes.includes('blocked_or_needs_review')) {
    return 'overlap_contains_nc_and_blocked_review_requires_agent6_source_family_selection_boundary';
  }
  if (lanes.includes('noncommercial_educational_candidate')) {
    return 'overlap_contains_nc_requires_agent6_nc_or_source_family_selection_boundary';
  }
  if (lanes.includes('blocked_or_needs_review')) {
    return 'overlap_contains_blocked_review_requires_source_custody_linkage_or_agent6_exclusion_boundary';
  }
  if (lanes.includes('commercial_clean_candidate')) {
    return 'commercial_clean_overlap_missing_future_agent6_candidate_use_boundary_and_morphology_relation';
  }
  return 'no_source_family_hit_missing_source_license_custody_evidence';
}

function rowOccurrenceMap(rows) {
  return new Map(rows.map((row) => [row.token_id, Number(row.occurrences || 0)]));
}

const preview = readJson(paths.preview);
const membership = readJson(paths.sourceFamilyMembership);
const membershipResult = readJson(paths.sourceFamilyMembershipValidationResult);
const exactRowSubsets = readJson(paths.exactRowSubsetManifest);

assert(preview.summary?.audited_rows === 500, 'preview audited rows mismatch');
assert((preview.rows || []).length === 500, 'preview row array mismatch');
assert(membershipResult.ok === true, 'membership validator result must be ok');
assert(membership.source_family_manifests?.length === 5, 'membership source-family count mismatch');
assert(exactRowSubsets.manifest_counts?.unique_manifest_token_id_count === 500, 'exact row subset coverage mismatch');

const occurrencesByTokenId = rowOccurrenceMap(preview.rows || []);
const familyTokenSets = new Map(
  membership.source_family_manifests.map((family) => [family.source_family, new Set(family.token_ids)])
);

const pairwiseIntersections = [];
for (let i = 0; i < sourceFamilies.length; i += 1) {
  for (let j = i + 1; j < sourceFamilies.length; j += 1) {
    const left = sourceFamilies[i];
    const right = sourceFamilies[j];
    const leftSet = familyTokenSets.get(left.name);
    const rightSet = familyTokenSets.get(right.name);
    const tokenIds = [...leftSet].filter((tokenId) => rightSet.has(tokenId));
    const lanes = lanesForFamilies([left.name, right.name]);
    pairwiseIntersections.push({
      pair_id: `${slug(left.name)}__${slug(right.name)}`,
      source_families: [left.name, right.name],
      classification_lanes: lanes,
      row_count: tokenIds.length,
      occurrence_count: tokenIds.reduce((sum, tokenId) => sum + occurrencesByTokenId.get(tokenId), 0),
      token_ids: tokenIds,
      token_ids_sha256: sha256(tokenIds.join('\n')),
      exact_blocker: blockerForLanes(lanes),
      candidate_text_rows_now: 0,
      agent6_delivery_now: 0
    });
  }
}

function rowFamilies(row) {
  return sourceFamilies
    .map((family) => family.name)
    .filter((family) => {
      const field = family === 'Klein Dictionary' || family === 'BDB Augmented Strong'
        ? 'blocked_or_unresolved_lexicons'
        : 'public_domain_lexicons';
      return (row[field] || []).includes(family);
    });
}

const comboRows = new Map();
for (const row of preview.rows || []) {
  const families = rowFamilies(row);
  const key = families.length ? families.join(' + ') : 'none';
  if (!comboRows.has(key)) comboRows.set(key, { families, rows: [] });
  comboRows.get(key).rows.push(row);
}

const exactFamilyCombinations = [...comboRows.entries()]
  .sort((left, right) => {
    const leftFamilies = left[1].families.length;
    const rightFamilies = right[1].families.length;
    if (leftFamilies !== rightFamilies) return rightFamilies - leftFamilies;
    return left[0].localeCompare(right[0]);
  })
  .map(([key, value]) => {
    const tokenIds = value.rows.map((row) => row.token_id);
    const lanes = lanesForFamilies(value.families);
    return {
      combination_id: value.families.length ? value.families.map(slug).join('__') : 'no-source-family-hit',
      source_families: value.families,
      source_family_key: key,
      classification_lanes: lanes,
      row_count: value.rows.length,
      occurrence_count: value.rows.reduce((sum, row) => sum + Number(row.occurrences || 0), 0),
      token_ids: tokenIds,
      token_ids_sha256: sha256(tokenIds.join('\n')),
      exact_blocker: value.families.length ? blockerForLanes(lanes) : 'no_source_family_hit_missing_source_license_custody_evidence',
      candidate_text_rows_now: 0,
      agent6_delivery_now: 0
    };
  });

const matrixCounts = {
  source_family_count: sourceFamilies.length,
  pairwise_intersection_count: pairwiseIntersections.length,
  exact_family_combination_count: exactFamilyCombinations.length,
  total_exact_combination_rows: exactFamilyCombinations.reduce((sum, row) => sum + row.row_count, 0),
  total_exact_combination_occurrences: exactFamilyCombinations.reduce((sum, row) => sum + row.occurrence_count, 0),
  commercial_internal_pair_rows: pairwiseIntersections
    .filter((row) => row.classification_lanes.length === 1 && row.classification_lanes[0] === 'commercial_clean_candidate')
    .reduce((sum, row) => sum + row.row_count, 0),
  commercial_with_nc_pair_rows: pairwiseIntersections
    .filter((row) => row.classification_lanes.includes('commercial_clean_candidate') && row.classification_lanes.includes('noncommercial_educational_candidate'))
    .reduce((sum, row) => sum + row.row_count, 0),
  commercial_with_blocked_pair_rows: pairwiseIntersections
    .filter((row) => row.classification_lanes.includes('commercial_clean_candidate') && row.classification_lanes.includes('blocked_or_needs_review'))
    .reduce((sum, row) => sum + row.row_count, 0),
  nc_with_blocked_pair_rows: pairwiseIntersections
    .filter((row) => row.classification_lanes.includes('noncommercial_educational_candidate') && row.classification_lanes.includes('blocked_or_needs_review'))
    .reduce((sum, row) => sum + row.row_count, 0),
  delivered_to_agent6_now: 0,
  allowed_transform_rows_now: 0,
  candidate_text_rows_now: 0
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent1_old_dictionary_source_family_overlap_matrix',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent1_old_dictionary_source_family_overlap_matrix.mjs',
  status: 'source_family_overlap_matrix_recorded_zero_output_no_acceptance',
  agent: 'Agent 1',
  current_agent1_thread_id: '019e975d-dc9f-7020-a7c8-885d083a837e',
  old_agent1_thread_id: '019dc487-5973-7693-aebf-fb0a75936f50',
  old_agent1_policy: 'archived_do_not_use',
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / direct Agent run mode',
  production_lane: 'Hebrew import/source/license/custody/source-lane evidence',
  target: 'old-dictionary-excluded-row-license-lane-reaudit source-family overlap matrix',
  purpose: 'Record pairwise and exact-combination source-family intersections so downstream boundary owners can see where commercial-clean evidence overlaps NC or blocked/review evidence.',
  inputs: paths,
  required_lane_output_shape: 'target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition',
  matrix_counts: matrixCounts,
  source_families: sourceFamilies,
  pairwise_intersections: pairwiseIntersections,
  exact_family_combinations: exactFamilyCombinations,
  exact_blockers: [
    ...pairwiseIntersections.map((row) => ({
      row_subset_id: `old-dictionary-excluded-row-license-lane-reaudit::source-family-overlap::${row.pair_id}`,
      source_families: row.source_families,
      classification_lanes: row.classification_lanes,
      rows: row.row_count,
      occurrences: row.occurrence_count,
      token_ids_sha256: row.token_ids_sha256,
      blocker: row.exact_blocker
    })),
    ...exactFamilyCombinations.map((row) => ({
      row_subset_id: `old-dictionary-excluded-row-license-lane-reaudit::source-family-combination::${row.combination_id}`,
      source_families: row.source_families,
      classification_lanes: row.classification_lanes,
      rows: row.row_count,
      occurrences: row.occurrence_count,
      token_ids_sha256: row.token_ids_sha256,
      blocker: row.exact_blocker
    }))
  ],
  handoff_owner: {
    agent2: 'May not transform overlap rows now; use matrix only after Agent 6 boundary and exact future package.',
    agent6: 'Matrix records exact overlap rows for future source-family selection boundary; delivered_to_agent6_now remains 0.',
    agent10: 'May consume matrix for future boundary/package assembly only; no release route opened now.'
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

const md = `# Agent 1 Old Dictionary Source-Family Overlap Matrix - 2026-06-05

production lane | direct active goal | recallable state/proof artifact | exact blocker | stop condition | correction owner

Hebrew import/source/license/custody/source-lane evidence | source-family overlap matrix for old-dictionary reaudit | \`${paths.outputJson}\`; validator \`${paths.validator}\` -> \`${paths.validatorResult}\` | commercial-clean overlap with NC/blocked families still requires Agent 6 source-family selection boundary | ${artifact.stop_condition} | current Agent 1 \`019e975d-dc9f-7020-a7c8-885d083a837e\`; old Agent 1 archived/do-not-use

target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition

\`${artifact.target}\` | \`${paths.preview}\`; \`${paths.sourceFamilyMembership}\`; \`${paths.exactRowSubsetManifest}\` | ${matrixCounts.pairwise_intersection_count} pairwise intersections; ${matrixCounts.exact_family_combination_count} exact combinations; exact combinations cover ${matrixCounts.total_exact_combination_rows} rows / ${matrixCounts.total_exact_combination_occurrences} occurrences; commercial-internal pair rows ${matrixCounts.commercial_internal_pair_rows}; commercial+NC pair rows ${matrixCounts.commercial_with_nc_pair_rows}; commercial+blocked pair rows ${matrixCounts.commercial_with_blocked_pair_rows}; NC+blocked pair rows ${matrixCounts.nc_with_blocked_pair_rows} | \`commercial_clean_candidate\`; \`noncommercial_educational_candidate\`; \`metadata_or_link_only\`; \`blocked_or_needs_review\` | overlap rows require Agent 6 source-family selection boundary; Klein remains NC; BDB Augmented Strong remains blocked/review; no-source-family-hit rows lack source evidence | Agent 2 blocked until exact lane evidence plus Agent 6 boundary; Agent 6 future boundary owner; Agent 10 package assembly only | ${artifact.stop_condition}

## Pairwise Intersections

| pair | lanes | rows | occurrences | token_ids_sha256 |
| --- | --- | ---: | ---: | --- |
${pairwiseIntersections.map((row) => `| ${row.source_families.join(' + ')} | ${row.classification_lanes.join(', ')} | ${row.row_count} | ${row.occurrence_count} | \`${row.token_ids_sha256}\` |`).join('\n')}

## Exact Combinations

| combination | lanes | rows | occurrences | token_ids_sha256 |
| --- | --- | ---: | ---: | --- |
${exactFamilyCombinations.map((row) => `| ${row.source_family_key} | ${row.classification_lanes.join(', ')} | ${row.row_count} | ${row.occurrence_count} | \`${row.token_ids_sha256}\` |`).join('\n')}
`;

writeJson(paths.outputJson, artifact);
writeText(paths.outputMd, md);

console.log(JSON.stringify({
  ok: true,
  artifact: paths.outputJson,
  report: paths.outputMd,
  matrix_counts: artifact.matrix_counts
}, null, 2));
