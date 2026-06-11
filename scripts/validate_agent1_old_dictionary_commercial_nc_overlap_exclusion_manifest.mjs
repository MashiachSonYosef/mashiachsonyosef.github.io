#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-old-dictionary-commercial-nc-overlap-exclusion-manifest-2026-06-05.json';
const resultPath = 'reports/agent1-old-dictionary-commercial-nc-overlap-exclusion-manifest-validation-result-2026-06-05.json';

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

  assert(artifact.artifact_type === 'agent1_old_dictionary_commercial_nc_overlap_exclusion_manifest', 'unexpected artifact_type');
  assert(artifact.status === 'commercial_nc_overlap_exclusion_manifest_recorded_zero_output_no_acceptance', 'unexpected status');
  assert(artifact.current_agent1_thread_id === '019e975d-dc9f-7020-a7c8-885d083a837e', 'current Agent 1 thread mismatch');
  assert(artifact.old_agent1_policy === 'archived_do_not_use', 'old Agent 1 policy mismatch');
  assert(artifact.required_lane_output_shape === 'target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition', 'lane output shape mismatch');

  for (const key of ['preview', 'exactRowSubsetManifest', 'sourceFamilyMembershipManifest', 'sourceFamilyOverlapMatrix', 'outputJson', 'outputMd', 'validator']) {
    assert(exists(artifact.inputs[key]), `missing input path: ${key}`);
  }
  assert(preview.summary.audited_rows === 500, 'preview audited row mismatch');
  assert(exactRows.manifest_counts.commercial_clean_plus_nc_rows === 57, 'exact row subset commercial+NC count mismatch');
  assert(exactRows.manifest_counts.triple_overlap_rows === 140, 'exact row subset triple-overlap count mismatch');
  assert(exactRows.manifest_counts.nc_only_rows === 17, 'exact row subset NC-only count mismatch');
  assert(membership.membership_counts.klein_rows === 214, 'source-family membership Klein count mismatch');
  assert(overlap.matrix_counts.total_exact_combination_rows === 500, 'source-family overlap coverage mismatch');

  const counts = artifact.overlap_counts;
  assert(counts.audited_rows === 500, 'audited rows mismatch');
  assert(counts.audited_occurrences === 8427, 'audited occurrences mismatch');
  assert(counts.commercial_nc_overlap_rows === 197, 'commercial+NC overlap row count mismatch');
  assert(counts.commercial_nc_overlap_occurrences === 4185, 'commercial+NC overlap occurrence count mismatch');
  assert(counts.commercial_nc_without_bdb_augmented_strong_rows === 57, 'commercial+NC only row count mismatch');
  assert(counts.commercial_nc_without_bdb_augmented_strong_occurrences === 818, 'commercial+NC only occurrence count mismatch');
  assert(counts.commercial_nc_with_bdb_augmented_strong_rows === 140, 'triple-overlap row count mismatch');
  assert(counts.commercial_nc_with_bdb_augmented_strong_occurrences === 3367, 'triple-overlap occurrence count mismatch');
  assert(counts.klein_only_excluded_rows === 17, 'Klein-only excluded row count mismatch');
  assert(counts.klein_only_excluded_occurrences === 259, 'Klein-only excluded occurrence count mismatch');
  assert(counts.pairwise_klein_intersection_count === 4, 'pairwise Klein intersection count mismatch');
  assert(counts.exact_klein_combination_count === 7, 'exact Klein combination count mismatch');

  const overlapRows = artifact.commercial_nc_overlap_metadata_rows || [];
  const commercialNcOnlyRows = artifact.commercial_nc_without_bdb_augmented_strong_rows || [];
  const commercialNcBlockedRows = artifact.commercial_nc_with_bdb_augmented_strong_rows || [];
  const kleinOnlyExcludedRows = artifact.klein_only_excluded_rows || [];
  assert(overlapRows.length === 197, 'overlap metadata row count mismatch');
  assert(commercialNcOnlyRows.length === 57, 'commercial+NC only metadata row count mismatch');
  assert(commercialNcBlockedRows.length === 140, 'commercial+NC blocked metadata row count mismatch');
  assert(kleinOnlyExcludedRows.length === 17, 'Klein-only excluded row count mismatch');
  assert(counts.overlap_token_ids_sha256 === sha256(overlapRows.map((row) => row.token_id).join('\n')), 'overlap token hash mismatch');
  assert(counts.commercial_nc_only_token_ids_sha256 === sha256(commercialNcOnlyRows.map((row) => row.token_id).join('\n')), 'commercial+NC only token hash mismatch');
  assert(counts.commercial_nc_blocked_token_ids_sha256 === sha256(commercialNcBlockedRows.map((row) => row.token_id).join('\n')), 'commercial+NC blocked token hash mismatch');
  assert(counts.klein_only_excluded_token_ids_sha256 === sha256(kleinOnlyExcludedRows.map((row) => row.token_id).join('\n')), 'Klein-only excluded token hash mismatch');

  for (const row of overlapRows) {
    for (const field of forbiddenFields) {
      assert(!(field in row), `forbidden field in overlap row: ${field}`, row);
    }
    assert(row.has_commercial_source_evidence === true, 'overlap row must have commercial source evidence', row);
    assert(row.has_klein_nc_evidence === true, 'overlap row must have Klein NC evidence', row);
    assert(row.agent2_transform_allowed_now === false, 'Agent 2 transform must be false', row);
    assert(row.agent6_delivery_now === false, 'Agent 6 delivery must be false', row);
    assert(row.candidate_text_rows_now === 0, 'candidate text rows must be zero', row);
    assert(row.emitted_answer_row_now === false, 'emitted answer must be false', row);
    assert(row.source_row_emitted_now === false, 'source row emitted must be false', row);
    assert(row.answer_eligible_now === false, 'answer eligible must be false', row);
  }
  for (const row of commercialNcOnlyRows) {
    assert(row.has_bdb_augmented_strong_review_evidence === false, 'commercial+NC only row must not have BDB Augmented Strong', row);
  }
  for (const row of commercialNcBlockedRows) {
    assert(row.has_bdb_augmented_strong_review_evidence === true, 'triple-overlap row must have BDB Augmented Strong', row);
  }
  for (const row of kleinOnlyExcludedRows) {
    for (const field of forbiddenFields) {
      assert(!(field in row), `forbidden field in Klein-only row: ${field}`, row);
    }
    assert(row.has_commercial_source_evidence === false, 'Klein-only excluded row must not have commercial source evidence', row);
    assert(row.has_klein_nc_evidence === true, 'Klein-only excluded row must have Klein evidence', row);
  }

  requireLane(artifact, 'commercial_clean_candidate', 197, 4185);
  const ncLane = requireLane(artifact, 'noncommercial_educational_candidate', 197, 4185);
  assert(ncLane.commercial_authorization_now === false, 'NC lane must not be commercially authorized');
  requireLane(artifact, 'metadata_or_link_only', 0, 0);
  requireLane(artifact, 'blocked_or_needs_review', 140, 3367);

  const pairwise = Object.fromEntries((artifact.source_family_pairwise_klein_intersections || []).map((row) => [row.intersection_id, row]));
  assert(pairwise['jastrow-dictionary__klein-dictionary']?.row_count === 176, 'Jastrow+Klein pair count mismatch');
  assert(pairwise['bdb-dictionary__klein-dictionary']?.row_count === 139, 'BDB+Klein pair count mismatch');
  assert(pairwise['bdb-aramaic-dictionary__klein-dictionary']?.row_count === 47, 'BDBA+Klein pair count mismatch');
  assert(pairwise['klein-dictionary__bdb-augmented-strong']?.row_count === 140, 'Klein+BDB Aug pair count mismatch');

  const combinations = Object.fromEntries((artifact.exact_klein_family_combinations || []).map((row) => [row.intersection_id, row]));
  assert(combinations['jastrow-dictionary__klein-dictionary']?.row_count === 57, 'Jastrow+Klein exact count mismatch');
  assert(combinations['klein-dictionary']?.row_count === 17, 'Klein-only exact count mismatch');
  assert(Object.values(combinations).filter((row) => (row.classification_lanes || []).includes('blocked_or_needs_review')).reduce((sum, row) => sum + row.row_count, 0) === 140, 'blocked exact combination total mismatch');

  assert((artifact.exact_blockers || []).length === 4, 'exact blocker count mismatch');
  for (const blocker of [
    'commercial_nc_overlap_requires_agent6_source_family_selection_boundary',
    'klein_nc_content_not_commercially_authorized',
    'triple_overlap_also_requires_bdb_augmented_strong_source_custody_resolution_or_exclusion',
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
    overlap_counts: artifact.overlap_counts,
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
