#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-old-dictionary-row-overlap-lane-boundary-2026-06-05.json';
const resultPath = 'reports/agent1-old-dictionary-row-overlap-lane-boundary-validation-result-2026-06-05.json';

const expectedBuckets = {
  commercial_clean_only: { row_count: 18, occurrence_count: 494 },
  commercial_clean_plus_noncommercial_educational: { row_count: 57, occurrence_count: 818 },
  commercial_clean_plus_blocked_review: { row_count: 82, occurrence_count: 1068 },
  commercial_clean_plus_noncommercial_educational_plus_blocked_review: { row_count: 140, occurrence_count: 3367 },
  noncommercial_educational_only: { row_count: 17, occurrence_count: 259 },
  blocked_review_only: { row_count: 0, occurrence_count: 0 },
  metadata_or_link_only: { row_count: 0, occurrence_count: 0 },
  no_sefaria_source_hit: { row_count: 186, occurrence_count: 2421 }
};

const noAcceptanceKeys = [
  'no_qa_acceptance',
  'no_source_license_acceptance',
  'no_legal_acceptance',
  'no_definition_authority',
  'no_runtime_public_acceptance',
  'no_publication_readiness',
  'no_product_data_acceptance',
  'no_answer_acceptance',
  'no_accepted_gloss_text',
  'no_nc_commercial_authorization',
  'no_candidate_text_export_authorization',
  'no_release_action',
  'no_public_runtime_mutation',
  'no_queue_mutation',
  'no_staging',
  'no_destructive_repo_action'
];

function fullPath(relativePath) {
  return path.join(root, relativePath);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(fullPath(relativePath), 'utf8'));
}

function exists(relativePath) {
  return fs.existsSync(fullPath(relativePath));
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(fullPath(relativePath)), { recursive: true });
  fs.writeFileSync(fullPath(relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function assert(condition, message, details = null) {
  if (!condition) {
    const error = new Error(message);
    error.details = details;
    throw error;
  }
}

try {
  const artifact = readJson(artifactPath);
  const preview = readJson(artifact.inputs.preview);
  const exportPartitions = readJson(artifact.inputs.exportPartitions);
  const kleinPreservation = readJson(artifact.inputs.kleinPreservation);
  const bdbRowLinkage = readJson(artifact.inputs.bdbRowLinkage);

  assert(artifact.artifact_type === 'agent1_old_dictionary_row_overlap_lane_boundary', 'unexpected artifact_type');
  assert(artifact.status === 'row_overlap_boundary_recorded_zero_output_no_acceptance', 'unexpected status');
  assert(artifact.target === 'old-dictionary-excluded-row-license-lane-reaudit', 'target mismatch');
  assert(artifact.current_agent1_thread_id === '019e975d-dc9f-7020-a7c8-885d083a837e', 'current Agent 1 thread mismatch');
  assert(artifact.old_agent1_policy === 'archived_do_not_use', 'old Agent 1 policy mismatch');
  assert(artifact.required_lane_output_shape === 'target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition', 'lane output shape mismatch');

  for (const key of ['preview', 'reaudit', 'exportPartitions', 'kleinPreservation', 'bdbRowLinkage', 'outputJson', 'outputMd', 'validator']) {
    assert(exists(artifact.inputs[key]), `missing input path: ${key}`);
  }

  assert(preview.summary.audited_rows === 500, 'preview audited rows mismatch');
  assert(preview.summary.audited_occurrences === 8427, 'preview audited occurrences mismatch');
  assert(preview.summary.public_domain_observed_rows === 297, 'preview public-domain rows mismatch');
  assert(preview.summary.public_domain_observed_occurrences === 5747, 'preview public-domain occurrences mismatch');
  assert(preview.summary.no_sefaria_hit_rows === 186, 'preview no-hit rows mismatch');
  assert(preview.summary.no_sefaria_hit_occurrences === 2421, 'preview no-hit occurrences mismatch');

  assert(exportPartitions.count_semantics.row_count_is_not_exclusive_export_row_count === true, 'export partition exclusivity warning missing');
  assert(exportPartitions.partition_counts.commercial_clean_candidate.row_count === 500, 'commercial source-family hit rows mismatch');
  assert(kleinPreservation.source_family.rows === 214, 'Klein source-family rows mismatch');
  assert(kleinPreservation.source_family.license_lane === 'noncommercial_educational_candidate', 'Klein lane mismatch');
  assert(kleinPreservation.source_family.commercial_export_allowed === false, 'Klein commercial export flag mismatch');
  assert(bdbRowLinkage.source_family.rows === 222, 'BDB Augmented Strong rows mismatch');
  assert(bdbRowLinkage.source_family.license_lane === 'blocked_or_needs_review', 'BDB Augmented Strong lane mismatch');
  assert(bdbRowLinkage.classification_lane_decision.exact_linkage_to_current_imported_row_subset_proven === false, 'BDB exact linkage must remain unproven');

  let bucketRows = 0;
  let bucketOccurrences = 0;
  for (const [bucket, expected] of Object.entries(expectedBuckets)) {
    const actual = artifact.row_overlap_buckets[bucket];
    assert(actual?.row_count === expected.row_count, `${bucket} row_count mismatch`, actual);
    assert(actual?.occurrence_count === expected.occurrence_count, `${bucket} occurrence_count mismatch`, actual);
    bucketRows += actual.row_count;
    bucketOccurrences += actual.occurrence_count;
  }
  assert(bucketRows === 500, 'row overlap buckets must sum to 500 rows');
  assert(bucketOccurrences === 8427, 'row overlap buckets must sum to 8427 occurrences');

  const totals = artifact.row_overlap_totals;
  assert(totals.audited_rows === 500, 'audited rows mismatch');
  assert(totals.audited_occurrences === 8427, 'audited occurrences mismatch');
  assert(totals.commercial_clean_evidence_rows === 297, 'commercial evidence rows mismatch');
  assert(totals.commercial_clean_evidence_occurrences === 5747, 'commercial evidence occurrences mismatch');
  assert(totals.noncommercial_educational_evidence_rows === 214, 'NC evidence rows mismatch');
  assert(totals.noncommercial_educational_evidence_occurrences === 4444, 'NC evidence occurrences mismatch');
  assert(totals.blocked_review_evidence_rows === 222, 'blocked evidence rows mismatch');
  assert(totals.blocked_review_evidence_occurrences === 4435, 'blocked evidence occurrences mismatch');
  assert(totals.metadata_or_link_only_rows === 0, 'metadata/link-only rows mismatch');
  assert(totals.public_domain_only_unique_rows === 18, 'public-domain-only rows mismatch');
  assert(totals.klein_only_unique_rows === 17, 'Klein-only rows mismatch');
  assert(totals.bdb_augmented_strong_only_unique_rows === 0, 'BDB Augmented Strong-only rows mismatch');
  assert(totals.multi_lane_overlap_rows === 279, 'multi-lane overlap rows mismatch');
  assert(totals.multi_lane_overlap_occurrences === 5253, 'multi-lane overlap occurrences mismatch');
  assert(totals.no_sefaria_source_hit_rows === 186, 'no-source-hit rows mismatch');

  const laneMap = new Map((artifact.classification_lanes || []).map((row) => [row.license_lane, row]));
  assert(laneMap.size === 4, 'classification lane count mismatch');
  assert(laneMap.get('commercial_clean_candidate')?.public_domain_only_unique_rows === 18, 'commercial lane public-domain-only rows mismatch');
  assert(laneMap.get('commercial_clean_candidate')?.commercial_export_allowed_now === false, 'commercial lane must not authorize export now');
  assert(laneMap.get('noncommercial_educational_candidate')?.noncommercial_educational_only_rows === 17, 'NC-only row count mismatch');
  assert(laneMap.get('noncommercial_educational_candidate')?.commercial_export_allowed_now === false, 'NC lane commercial export must be false');
  assert(laneMap.get('noncommercial_educational_candidate')?.derived_from_nc === true, 'NC lane derived flag mismatch');
  assert(laneMap.get('metadata_or_link_only')?.row_count === 0, 'metadata/link-only lane must be zero');
  assert(laneMap.get('blocked_or_needs_review')?.source_family_hit_rows === 222, 'blocked/review source-family rows mismatch');
  assert(laneMap.get('blocked_or_needs_review')?.exact_custody_linkage_proven === false, 'blocked/review exact linkage must be false');

  assert((artifact.exact_blockers || []).length === 4, 'exact blocker count mismatch');
  assert(artifact.exact_blockers.some((row) => row.blocker === 'source_family_hit_counts_are_not_exclusive_row_export_counts'), 'source-family hit blocker missing');
  assert(artifact.exact_blockers.some((row) => row.blocker === 'multi_lane_overlap_requires_agent6_row_subset_boundary'), 'multi-lane boundary blocker missing');
  assert(artifact.exact_blockers.some((row) => row.blocker === 'noncommercial_educational_only_rows_remain_separate_from_commercial_clean'), 'NC-only blocker missing');
  assert(artifact.exact_blockers.some((row) => row.blocker === 'no_sefaria_source_hit_rows_have_no_source_lane_evidence_now'), 'no-source-hit blocker missing');

  for (const [key, value] of Object.entries(artifact.zero_output_counts || {})) {
    assert(value === 0, `${key} must be zero`);
  }
  for (const key of noAcceptanceKeys) {
    assert(artifact.non_acceptance_boundary?.[key] === true, `${key} must be true`);
  }

  const result = {
    ok: true,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    status: artifact.status,
    target: artifact.target,
    row_overlap_totals: artifact.row_overlap_totals,
    exact_blocker_count: artifact.exact_blockers.length,
    no_acceptance_claims: true,
    zero_output_counts: artifact.zero_output_counts
  };
  writeJson(resultPath, result);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  const result = {
    ok: false,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    error: error.message,
    details: error.details || null
  };
  writeJson(resultPath, result);
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
