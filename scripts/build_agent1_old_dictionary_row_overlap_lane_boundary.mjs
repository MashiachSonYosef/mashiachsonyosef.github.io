#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const paths = {
  preview: 'reports/agent2-orot-sefaria-public-domain-candidate-preview-2026-06-04.json',
  reaudit: 'reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json',
  exportPartitions: 'reports/agent1-old-dictionary-license-lane-export-partitions-2026-06-04.json',
  kleinPreservation: 'reports/agent1-old-dictionary-klein-nc-lane-preservation-2026-06-05.json',
  bdbRowLinkage: 'reports/agent1-bdb-augmented-strong-row-linkage-probe-2026-06-05.json',
  outputJson: 'reports/agent1-old-dictionary-row-overlap-lane-boundary-2026-06-05.json',
  outputMd: 'reports/agent1-old-dictionary-row-overlap-lane-boundary-2026-06-05.md',
  validator: 'scripts/validate_agent1_old_dictionary_row_overlap_lane_boundary.mjs',
  validatorResult: 'reports/agent1-old-dictionary-row-overlap-lane-boundary-validation-result-2026-06-05.json'
};

const commercialFamilies = [
  'Jastrow Dictionary',
  'BDB Dictionary',
  'BDB Aramaic Dictionary'
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

function summarizeRows(rows) {
  return {
    row_count: rows.length,
    occurrence_count: rows.reduce((sum, row) => sum + Number(row.occurrences || 0), 0),
    token_ids_sample: rows.slice(0, 20).map((row) => row.token_id),
    rows_sample: rows.slice(0, 8).map((row) => ({
      token_id: row.token_id,
      lexicon_entry_id: row.lexicon_entry_id,
      occurrences: Number(row.occurrences || 0),
      public_domain_lexicons: row.public_domain_lexicons || [],
      blocked_or_unresolved_lexicons: row.blocked_or_unresolved_lexicons || [],
      preview_status: row.preview_status,
      transform_blockers: row.transform_blockers || []
    }))
  };
}

function bucketRows(rows, predicate) {
  return summarizeRows(rows.filter(predicate));
}

const preview = readJson(paths.preview);
const reaudit = readJson(paths.reaudit);
const exportPartitions = readJson(paths.exportPartitions);
const kleinPreservation = readJson(paths.kleinPreservation);
const bdbRowLinkage = readJson(paths.bdbRowLinkage);
const rows = preview.rows || [];

assert(preview.summary?.audited_rows === 500, 'preview audited row count must be 500');
assert(rows.length === 500, 'preview rows array must contain 500 rows');
assert(reaudit.workset === 'old-dictionary-excluded-row-license-lane-reaudit', 'reaudit workset mismatch');
assert(exportPartitions.count_semantics?.row_count_is_not_exclusive_export_row_count === true, 'source-family partition count warning missing');
assert(kleinPreservation.source_family?.license_lane === 'noncommercial_educational_candidate', 'Klein preservation lane mismatch');
assert(bdbRowLinkage.source_family?.license_lane === 'blocked_or_needs_review', 'BDB row-linkage lane mismatch');

const rowFacts = rows.map((row) => {
  const hasCommercial = (row.public_domain_lexicons || []).some((family) => commercialFamilies.includes(family));
  const hasKlein = hasFamily(row, 'blocked_or_unresolved_lexicons', 'Klein Dictionary');
  const hasBdbAugmentedStrong = hasFamily(row, 'blocked_or_unresolved_lexicons', 'BDB Augmented Strong');
  const hasSefariaHit = Number(row.sefaria_combined_hit_count || 0) > 0;
  return {
    ...row,
    hasCommercial,
    hasKlein,
    hasBdbAugmentedStrong,
    hasSefariaHit
  };
});

const overlapBuckets = {
  commercial_clean_only: bucketRows(
    rowFacts,
    (row) => row.hasCommercial && !row.hasKlein && !row.hasBdbAugmentedStrong
  ),
  commercial_clean_plus_noncommercial_educational: bucketRows(
    rowFacts,
    (row) => row.hasCommercial && row.hasKlein && !row.hasBdbAugmentedStrong
  ),
  commercial_clean_plus_blocked_review: bucketRows(
    rowFacts,
    (row) => row.hasCommercial && !row.hasKlein && row.hasBdbAugmentedStrong
  ),
  commercial_clean_plus_noncommercial_educational_plus_blocked_review: bucketRows(
    rowFacts,
    (row) => row.hasCommercial && row.hasKlein && row.hasBdbAugmentedStrong
  ),
  noncommercial_educational_only: bucketRows(
    rowFacts,
    (row) => !row.hasCommercial && row.hasKlein && !row.hasBdbAugmentedStrong
  ),
  blocked_review_only: bucketRows(
    rowFacts,
    (row) => !row.hasCommercial && !row.hasKlein && row.hasBdbAugmentedStrong
  ),
  metadata_or_link_only: bucketRows(
    rowFacts,
    (row) => !row.hasCommercial && !row.hasKlein && !row.hasBdbAugmentedStrong && row.hasSefariaHit
  ),
  no_sefaria_source_hit: bucketRows(
    rowFacts,
    (row) => !row.hasCommercial && !row.hasKlein && !row.hasBdbAugmentedStrong && !row.hasSefariaHit
  )
};

const rowOverlapTotals = {
  audited_rows: rows.length,
  audited_occurrences: preview.summary.audited_occurrences,
  commercial_clean_evidence_rows: rowFacts.filter((row) => row.hasCommercial).length,
  commercial_clean_evidence_occurrences: rowFacts
    .filter((row) => row.hasCommercial)
    .reduce((sum, row) => sum + Number(row.occurrences || 0), 0),
  noncommercial_educational_evidence_rows: rowFacts.filter((row) => row.hasKlein).length,
  noncommercial_educational_evidence_occurrences: rowFacts
    .filter((row) => row.hasKlein)
    .reduce((sum, row) => sum + Number(row.occurrences || 0), 0),
  blocked_review_evidence_rows: rowFacts.filter((row) => row.hasBdbAugmentedStrong).length,
  blocked_review_evidence_occurrences: rowFacts
    .filter((row) => row.hasBdbAugmentedStrong)
    .reduce((sum, row) => sum + Number(row.occurrences || 0), 0),
  metadata_or_link_only_rows: overlapBuckets.metadata_or_link_only.row_count,
  metadata_or_link_only_occurrences: overlapBuckets.metadata_or_link_only.occurrence_count,
  no_sefaria_source_hit_rows: overlapBuckets.no_sefaria_source_hit.row_count,
  no_sefaria_source_hit_occurrences: overlapBuckets.no_sefaria_source_hit.occurrence_count,
  public_domain_only_unique_rows: overlapBuckets.commercial_clean_only.row_count,
  klein_only_unique_rows: overlapBuckets.noncommercial_educational_only.row_count,
  bdb_augmented_strong_only_unique_rows: overlapBuckets.blocked_review_only.row_count,
  multi_lane_overlap_rows:
    overlapBuckets.commercial_clean_plus_noncommercial_educational.row_count +
    overlapBuckets.commercial_clean_plus_blocked_review.row_count +
    overlapBuckets.commercial_clean_plus_noncommercial_educational_plus_blocked_review.row_count,
  multi_lane_overlap_occurrences:
    overlapBuckets.commercial_clean_plus_noncommercial_educational.occurrence_count +
    overlapBuckets.commercial_clean_plus_blocked_review.occurrence_count +
    overlapBuckets.commercial_clean_plus_noncommercial_educational_plus_blocked_review.occurrence_count
};

const exactBlockers = [
  {
    blocker: 'source_family_hit_counts_are_not_exclusive_row_export_counts',
    applies_to: 'reports/agent1-old-dictionary-license-lane-export-partitions-2026-06-04.json',
    evidence: 'commercial_clean_candidate source-family hit total is 500 rows, while unique public-domain observed rows are 297 and public-domain-only unique rows are 18',
    handoff_owner: 'Agent 1 preserves row-overlap boundary; Agent 2 must not treat source-family hit totals as exclusive export rows'
  },
  {
    blocker: 'multi_lane_overlap_requires_agent6_row_subset_boundary',
    applies_to: 'commercial_clean_plus_noncommercial_or_blocked_overlap',
    evidence: `${rowOverlapTotals.multi_lane_overlap_rows} rows / ${rowOverlapTotals.multi_lane_overlap_occurrences} occurrences have commercial-clean evidence plus Klein and/or BDB Augmented Strong overlap`,
    handoff_owner: 'Agent 6 exact row/subset boundary before any downstream candidate-text or display behavior'
  },
  {
    blocker: 'noncommercial_educational_only_rows_remain_separate_from_commercial_clean',
    applies_to: 'noncommercial_educational_only',
    evidence: `${rowOverlapTotals.klein_only_unique_rows} rows / ${overlapBuckets.noncommercial_educational_only.occurrence_count} occurrences are Klein-only NC educational evidence`,
    handoff_owner: 'Agent 1 preserves NC lane; Agent 6 required for any NC row/subset boundary'
  },
  {
    blocker: 'no_sefaria_source_hit_rows_have_no_source_lane_evidence_now',
    applies_to: 'no_sefaria_source_hit',
    evidence: `${rowOverlapTotals.no_sefaria_source_hit_rows} rows / ${rowOverlapTotals.no_sefaria_source_hit_occurrences} occurrences have no Sefaria source hit in the preview`,
    handoff_owner: 'Agent 1 if new source evidence appears; otherwise no Agent 2 transform lane evidence'
  }
];

const artifact = {
  schema_version: 1,
  artifact_type: 'agent1_old_dictionary_row_overlap_lane_boundary',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent1_old_dictionary_row_overlap_lane_boundary.mjs',
  status: 'row_overlap_boundary_recorded_zero_output_no_acceptance',
  agent: 'Agent 1',
  current_agent1_thread_id: '019e975d-dc9f-7020-a7c8-885d083a837e',
  old_agent1_thread_id: '019dc487-5973-7693-aebf-fb0a75936f50',
  old_agent1_policy: 'archived_do_not_use',
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / direct Agent run mode',
  production_lane: 'Hebrew import/source/license/custody/source-lane evidence',
  target: 'old-dictionary-excluded-row-license-lane-reaudit',
  purpose: 'Record row-level overlap between public-domain dictionary evidence, Klein NC evidence, and BDB Augmented Strong blocked/review evidence so source-family hit totals are not reused as exclusive row/export counts.',
  inputs: paths,
  required_lane_output_shape: 'target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition',
  row_overlap_totals: rowOverlapTotals,
  classification_lanes: [
    {
      license_lane: 'commercial_clean_candidate',
      source_families: commercialFamilies,
      source_family_hit_rows_from_export_partitions: exportPartitions.partition_counts.commercial_clean_candidate.row_count,
      unique_public_domain_observed_rows: preview.summary.public_domain_observed_rows,
      public_domain_only_unique_rows: overlapBuckets.commercial_clean_only.row_count,
      overlap_rows_requiring_boundary:
        overlapBuckets.commercial_clean_plus_noncommercial_educational.row_count +
        overlapBuckets.commercial_clean_plus_blocked_review.row_count +
        overlapBuckets.commercial_clean_plus_noncommercial_educational_plus_blocked_review.row_count,
      commercial_export_allowed_now: false,
      candidate_text_rows_now: 0,
      agent6_boundary_required: true
    },
    {
      license_lane: 'noncommercial_educational_candidate',
      source_families: ['Klein Dictionary'],
      source_family_hit_rows: kleinPreservation.source_family.rows,
      noncommercial_educational_only_rows: overlapBuckets.noncommercial_educational_only.row_count,
      overlapping_public_domain_rows:
        overlapBuckets.commercial_clean_plus_noncommercial_educational.row_count +
        overlapBuckets.commercial_clean_plus_noncommercial_educational_plus_blocked_review.row_count,
      derived_from_nc: true,
      commercial_export_allowed_now: false,
      attribution_required: true,
      corpus_contamination: false,
      candidate_text_rows_now: 0,
      agent6_boundary_required: true
    },
    {
      license_lane: 'metadata_or_link_only',
      row_count: overlapBuckets.metadata_or_link_only.row_count,
      occurrence_count: overlapBuckets.metadata_or_link_only.occurrence_count,
      candidate_text_rows_now: 0
    },
    {
      license_lane: 'blocked_or_needs_review',
      source_families: ['BDB Augmented Strong'],
      source_family_hit_rows: bdbRowLinkage.source_family.rows,
      blocked_review_only_rows: overlapBuckets.blocked_review_only.row_count,
      overlapping_public_domain_rows:
        overlapBuckets.commercial_clean_plus_blocked_review.row_count +
        overlapBuckets.commercial_clean_plus_noncommercial_educational_plus_blocked_review.row_count,
      commercial_export_allowed_now: false,
      candidate_text_rows_now: 0,
      exact_custody_linkage_proven: false,
      agent6_boundary_required_if_evidence_appears: true
    }
  ],
  row_overlap_buckets: overlapBuckets,
  exact_blockers: exactBlockers,
  handoff_owner: {
    agent2: 'May consume only row/subsets with Agent 1 lane evidence and Agent 6 boundary; this packet does not authorize candidate text.',
    agent6: 'Receives exact row/subset boundary questions for multi-lane overlap, NC-only rows, and future candidate use.',
    agent10: 'May consume classified package candidates for release/boundary assembly only, with zero output acceptance.'
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
    staging_count: 0
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
  stop_condition: 'Stop before QA/source-license/legal/Definition/runtime/publication/product/answer acceptance; stop before candidate text, public display, runtime, queue, staging, or release mutation.'
};

const md = `# Agent 1 Old Dictionary Row-Overlap Lane Boundary - 2026-06-05

production lane | direct active goal | recallable state/proof artifact | exact blocker | stop condition | correction owner

Hebrew import/source/license/custody/source-lane evidence | row-level overlap boundary for old-dictionary excluded-row license-lane reaudit | \`${paths.outputJson}\`; validator \`${paths.validator}\` -> \`${paths.validatorResult}\` | source-family hit counts are not exclusive export rows; multi-lane overlaps require Agent 6 row/subset boundary | ${artifact.stop_condition} | current Agent 1 \`019e975d-dc9f-7020-a7c8-885d083a837e\`; old Agent 1 archived/do-not-use

target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition

\`${artifact.target}\` | \`${paths.preview}\`; \`${paths.reaudit}\`; \`${paths.exportPartitions}\`; \`${paths.kleinPreservation}\`; \`${paths.bdbRowLinkage}\` | audited ${rowOverlapTotals.audited_rows} / ${rowOverlapTotals.audited_occurrences}; public-domain evidence ${rowOverlapTotals.commercial_clean_evidence_rows} / ${rowOverlapTotals.commercial_clean_evidence_occurrences}; public-domain-only ${rowOverlapTotals.public_domain_only_unique_rows} / ${overlapBuckets.commercial_clean_only.occurrence_count}; Klein evidence ${rowOverlapTotals.noncommercial_educational_evidence_rows} / ${rowOverlapTotals.noncommercial_educational_evidence_occurrences}; Klein-only ${rowOverlapTotals.klein_only_unique_rows} / ${overlapBuckets.noncommercial_educational_only.occurrence_count}; BDB Augmented Strong evidence ${rowOverlapTotals.blocked_review_evidence_rows} / ${rowOverlapTotals.blocked_review_evidence_occurrences}; multi-lane overlap ${rowOverlapTotals.multi_lane_overlap_rows} / ${rowOverlapTotals.multi_lane_overlap_occurrences}; metadata/link-only ${rowOverlapTotals.metadata_or_link_only_rows} / ${rowOverlapTotals.metadata_or_link_only_occurrences}; no source hit ${rowOverlapTotals.no_sefaria_source_hit_rows} / ${rowOverlapTotals.no_sefaria_source_hit_occurrences} | \`commercial_clean_candidate\`; \`noncommercial_educational_candidate\`; \`metadata_or_link_only\`; \`blocked_or_needs_review\` | ${exactBlockers.map((row) => row.blocker).join('; ')} | Agent 2 only after lane evidence plus Agent 6 boundary; Agent 6 for exact row/subset boundary; Agent 10 for boundary/package assembly only | ${artifact.stop_condition}

## Row Overlap Buckets

| bucket | rows | occurrences |
| --- | ---: | ---: |
${Object.entries(overlapBuckets).map(([bucket, value]) => `| ${bucket} | ${value.row_count} | ${value.occurrence_count} |`).join('\n')}

## Boundary

- \`commercial_clean_candidate\` source-family hit rows are not exclusive row/export counts.
- \`noncommercial_educational_candidate\` remains separate and not commercially authorized.
- \`metadata_or_link_only\` is zero for this preview; no-source-hit rows are recorded separately.
- \`blocked_or_needs_review\` remains exact-custody-linkage blocked for BDB Augmented Strong.
- Zero output: no candidate text, accepted gloss, answer, source-row emission, public HUD row, route JSONL row, Agent 6 delivery, queue mutation, render mutation, staging, or release action.
`;

writeJson(paths.outputJson, artifact);
writeText(paths.outputMd, md);

console.log(JSON.stringify({
  ok: true,
  artifact: paths.outputJson,
  report: paths.outputMd,
  row_overlap_totals: artifact.row_overlap_totals
}, null, 2));
