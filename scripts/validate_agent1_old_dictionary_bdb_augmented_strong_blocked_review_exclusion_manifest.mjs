#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-old-dictionary-bdb-augmented-strong-blocked-review-exclusion-manifest-2026-06-05.json';
const resultPath = 'reports/agent1-old-dictionary-bdb-augmented-strong-blocked-review-exclusion-manifest-validation-result-2026-06-05.json';

const forbiddenFields = ['surface', 'normalized', 'definition', 'gloss', 'answer', 'candidate_text', 'definition_text'];
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

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function assert(condition, message, details = null) {
  if (!condition) {
    const error = new Error(message);
    error.details = details;
    throw error;
  }
}

function requireLane(artifact, lane, rows, occurrences) {
  const entry = (artifact.classification_lanes || []).find((row) => row.license_lane === lane);
  assert(entry, `missing lane: ${lane}`);
  assert(entry.row_count === rows, `${lane} row count mismatch`, entry);
  assert(entry.occurrence_count === occurrences, `${lane} occurrence count mismatch`, entry);
  return entry;
}

try {
  const artifact = readJson(artifactPath);
  const preview = readJson(artifact.inputs.preview);
  const exactRows = readJson(artifact.inputs.exactRowSubsetManifest);
  const membership = readJson(artifact.inputs.sourceFamilyMembershipManifest);
  const overlap = readJson(artifact.inputs.sourceFamilyOverlapMatrix);
  const commercialNc = readJson(artifact.inputs.commercialNcOverlapExclusionManifest);

  assert(artifact.artifact_type === 'agent1_old_dictionary_bdb_augmented_strong_blocked_review_exclusion_manifest', 'unexpected artifact_type');
  assert(artifact.status === 'bdb_augmented_strong_blocked_review_exclusion_manifest_recorded_zero_output_no_acceptance', 'unexpected status');
  assert(artifact.current_agent1_thread_id === '019e975d-dc9f-7020-a7c8-885d083a837e', 'current Agent 1 thread mismatch');
  assert(artifact.old_agent1_policy === 'archived_do_not_use', 'old Agent 1 policy mismatch');
  assert(artifact.required_lane_output_shape === 'target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition', 'lane output shape mismatch');

  for (const key of ['preview', 'exactRowSubsetManifest', 'sourceFamilyMembershipManifest', 'sourceFamilyOverlapMatrix', 'commercialNcOverlapExclusionManifest', 'outputJson', 'outputMd', 'validator']) {
    assert(exists(artifact.inputs[key]), `missing input path: ${key}`);
  }
  assert(preview.summary.audited_rows === 500, 'preview audited row mismatch');
  assert(exactRows.manifest_counts.commercial_clean_plus_blocked_rows === 82, 'exact row subset commercial+blocked count mismatch');
  assert(exactRows.manifest_counts.triple_overlap_rows === 140, 'exact row subset triple-overlap count mismatch');
  assert(exactRows.manifest_counts.blocked_review_only_rows === 0, 'exact row subset blocked-only count mismatch');
  assert(membership.membership_counts.bdb_augmented_strong_rows === 222, 'source-family membership BDB Augmented Strong count mismatch');
  assert(overlap.matrix_counts.total_exact_combination_rows === 500, 'source-family overlap coverage mismatch');
  assert(commercialNc.overlap_counts.commercial_nc_with_bdb_augmented_strong_rows === 140, 'commercial+NC BDB Augmented Strong overlap count mismatch');

  const counts = artifact.blocked_review_counts;
  assert(counts.audited_rows === 500, 'audited rows mismatch');
  assert(counts.audited_occurrences === 8427, 'audited occurrences mismatch');
  assert(counts.bdb_augmented_strong_blocked_review_rows === 222, 'BDB Augmented Strong row count mismatch');
  assert(counts.bdb_augmented_strong_blocked_review_occurrences === 4435, 'BDB Augmented Strong occurrence count mismatch');
  assert(counts.commercial_blocked_without_klein_rows === 82, 'commercial+blocked without Klein row count mismatch');
  assert(counts.commercial_blocked_without_klein_occurrences === 1068, 'commercial+blocked without Klein occurrence count mismatch');
  assert(counts.triple_overlap_with_klein_rows === 140, 'triple-overlap with Klein row count mismatch');
  assert(counts.triple_overlap_with_klein_occurrences === 3367, 'triple-overlap with Klein occurrence count mismatch');
  assert(counts.blocked_review_only_rows === 0, 'blocked-only row count mismatch');
  assert(counts.blocked_review_only_occurrences === 0, 'blocked-only occurrence count mismatch');
  assert(counts.public_domain_overlap_rows === 222, 'public-domain overlap row count mismatch');
  assert(counts.public_domain_overlap_occurrences === 4435, 'public-domain overlap occurrence count mismatch');
  assert(counts.klein_nc_overlap_rows === 140, 'Klein NC overlap row count mismatch');
  assert(counts.klein_nc_overlap_occurrences === 3367, 'Klein NC overlap occurrence count mismatch');
  assert(counts.pairwise_bdb_augmented_strong_intersection_count === 4, 'pairwise BDB Augmented Strong intersection count mismatch');
  assert(counts.exact_bdb_augmented_strong_combination_count === 9, 'exact BDB Augmented Strong combination count mismatch');

  const bdbAugRows = artifact.bdb_augmented_strong_blocked_review_metadata_rows || [];
  const commercialBlockedRows = artifact.commercial_blocked_without_klein_rows || [];
  const tripleRows = artifact.triple_overlap_with_klein_rows || [];
  const blockedOnlyRows = artifact.blocked_review_only_rows || [];
  assert(bdbAugRows.length === 222, 'BDB Augmented Strong metadata row count mismatch');
  assert(commercialBlockedRows.length === 82, 'commercial+blocked metadata row count mismatch');
  assert(tripleRows.length === 140, 'triple-overlap metadata row count mismatch');
  assert(blockedOnlyRows.length === 0, 'blocked-only metadata row count mismatch');
  assert(counts.bdb_augmented_strong_token_ids_sha256 === sha256(bdbAugRows.map((row) => row.token_id).join('\n')), 'BDB Augmented Strong token hash mismatch');
  assert(counts.commercial_blocked_without_klein_token_ids_sha256 === sha256(commercialBlockedRows.map((row) => row.token_id).join('\n')), 'commercial+blocked token hash mismatch');
  assert(counts.triple_overlap_with_klein_token_ids_sha256 === sha256(tripleRows.map((row) => row.token_id).join('\n')), 'triple-overlap token hash mismatch');
  assert(counts.blocked_review_only_token_ids_sha256 === sha256(blockedOnlyRows.map((row) => row.token_id).join('\n')), 'blocked-only token hash mismatch');

  for (const row of bdbAugRows) {
    for (const field of forbiddenFields) {
      assert(!(field in row), `forbidden field in BDB Augmented Strong row: ${field}`, row);
    }
    assert(row.has_bdb_augmented_strong_review_evidence === true, 'row must have BDB Augmented Strong evidence', row);
    assert(row.has_commercial_source_evidence === true, 'row must overlap public-domain source evidence', row);
    assert(row.agent2_transform_allowed_now === false, 'Agent 2 transform must be false', row);
    assert(row.agent6_delivery_now === false, 'Agent 6 delivery must be false', row);
    assert(row.candidate_text_rows_now === 0, 'candidate text rows must be zero', row);
    assert(row.emitted_answer_row_now === false, 'emitted answer must be false', row);
    assert(row.source_row_emitted_now === false, 'source row emitted must be false', row);
    assert(row.answer_eligible_now === false, 'answer eligible must be false', row);
  }
  for (const row of commercialBlockedRows) {
    assert(row.has_klein_nc_evidence === false, 'commercial+blocked row must not have Klein evidence', row);
  }
  for (const row of tripleRows) {
    assert(row.has_klein_nc_evidence === true, 'triple-overlap row must have Klein evidence', row);
  }

  requireLane(artifact, 'commercial_clean_candidate', 222, 4435);
  const ncLane = requireLane(artifact, 'noncommercial_educational_candidate', 140, 3367);
  assert(ncLane.commercial_authorization_now === false, 'NC lane must not be commercially authorized');
  requireLane(artifact, 'metadata_or_link_only', 0, 0);
  requireLane(artifact, 'blocked_or_needs_review', 222, 4435);

  const pairwise = Object.fromEntries((artifact.source_family_pairwise_bdb_augmented_strong_intersections || []).map((row) => [row.intersection_id, row]));
  assert(pairwise['jastrow-dictionary__bdb-augmented-strong']?.row_count === 135, 'Jastrow+BDB Aug pair count mismatch');
  assert(pairwise['bdb-dictionary__bdb-augmented-strong']?.row_count === 221, 'BDB+BDB Aug pair count mismatch');
  assert(pairwise['bdb-aramaic-dictionary__bdb-augmented-strong']?.row_count === 69, 'BDBA+BDB Aug pair count mismatch');
  assert(pairwise['klein-dictionary__bdb-augmented-strong']?.row_count === 140, 'Klein+BDB Aug pair count mismatch');

  const exactTotal = (artifact.exact_bdb_augmented_strong_family_combinations || []).reduce((sum, row) => sum + row.row_count, 0);
  assert(exactTotal === 222, 'exact BDB Augmented Strong combination total mismatch');
  const exactIds = Object.fromEntries((artifact.exact_bdb_augmented_strong_family_combinations || []).map((row) => [row.intersection_id, row]));
  assert(exactIds['bdb-dictionary__bdb-augmented-strong']?.row_count === 53, 'BDB+BDB Aug exact count mismatch');
  assert(exactIds['jastrow-dictionary__bdb-dictionary__klein-dictionary__bdb-augmented-strong']?.row_count === 78, 'Jastrow+BDB+Klein+BDB Aug exact count mismatch');

  assert((artifact.exact_blockers || []).length === 4, 'exact blocker count mismatch');
  for (const blocker of [
    'bdb_augmented_strong_requires_source_custody_resolution_or_exclusion',
    'commercial_blocked_overlap_requires_agent6_source_family_selection_boundary',
    'triple_overlap_preserves_klein_nc_and_bdb_augmented_strong_review_boundaries',
    'metadata_only_no_definition_or_candidate_text'
  ]) {
    assert(artifact.exact_blockers.some((row) => row.blocker === blocker), `missing blocker: ${blocker}`);
  }

  for (const [key, value] of Object.entries(artifact.zero_output_counts || {})) {
    assert(value === 0, `${key} must be zero`);
  }
  for (const key of noAcceptanceKeys) {
    assert(artifact.non_acceptance_boundary?.[key] === true, `${key} must be true`);
  }
  for (const field of forbiddenFields) {
    assert(artifact.forbidden_content_fields_not_written.includes(field), `forbidden field marker missing: ${field}`);
  }

  const result = {
    ok: true,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    status: artifact.status,
    target: artifact.target,
    blocked_review_counts: artifact.blocked_review_counts,
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
