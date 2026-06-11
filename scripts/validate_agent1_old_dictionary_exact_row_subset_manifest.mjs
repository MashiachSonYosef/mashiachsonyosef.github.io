#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-old-dictionary-exact-row-subset-manifest-2026-06-05.json';
const resultPath = 'reports/agent1-old-dictionary-exact-row-subset-manifest-validation-result-2026-06-05.json';

const expectedRows = {
  commercial_clean_only: { rows: 18, occurrences: 494 },
  commercial_clean_plus_noncommercial_educational: { rows: 57, occurrences: 818 },
  commercial_clean_plus_blocked_review: { rows: 82, occurrences: 1068 },
  commercial_clean_plus_noncommercial_educational_plus_blocked_review: { rows: 140, occurrences: 3367 },
  noncommercial_educational_only: { rows: 17, occurrences: 259 },
  blocked_review_only: { rows: 0, occurrences: 0 },
  metadata_or_link_only: { rows: 0, occurrences: 0 },
  no_sefaria_source_hit: { rows: 186, occurrences: 2421 }
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

try {
  const artifact = readJson(artifactPath);
  const preview = readJson(artifact.inputs.preview);
  const rowOverlap = readJson(artifact.inputs.rowOverlapBoundary);
  const rowOverlapResult = readJson(artifact.inputs.rowOverlapBoundaryValidationResult);
  const agent6Supplement = readJson(artifact.inputs.agent6Supplement);
  const agent6SupplementResult = readJson(artifact.inputs.agent6SupplementValidationResult);

  assert(artifact.artifact_type === 'agent1_old_dictionary_exact_row_subset_manifest', 'unexpected artifact_type');
  assert(artifact.status === 'exact_row_subset_manifest_recorded_zero_output_no_acceptance', 'unexpected status');
  assert(artifact.current_agent1_thread_id === '019e975d-dc9f-7020-a7c8-885d083a837e', 'current Agent 1 thread mismatch');
  assert(artifact.old_agent1_policy === 'archived_do_not_use', 'old Agent 1 policy mismatch');
  assert(artifact.required_lane_output_shape === 'target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition', 'lane output shape mismatch');

  for (const key of ['preview', 'rowOverlapBoundary', 'rowOverlapBoundaryValidationResult', 'agent6Supplement', 'agent6SupplementValidationResult', 'outputJson', 'outputMd', 'validator']) {
    assert(exists(artifact.inputs[key]), `missing input path: ${key}`);
  }
  assert(preview.summary.audited_rows === 500, 'preview audited rows mismatch');
  assert((preview.rows || []).length === 500, 'preview row array mismatch');
  assert(rowOverlapResult.ok === true, 'row-overlap validator result not ok');
  assert(agent6SupplementResult.ok === true, 'Agent 6 supplement validator result not ok');
  assert(rowOverlap.row_overlap_totals.audited_rows === 500, 'row-overlap rows mismatch');
  assert(agent6Supplement.boundary_question_counts.total_rows_represented === 500, 'Agent 6 supplement row coverage mismatch');

  const subsets = artifact.subset_manifests || [];
  assert(subsets.length === 8, 'subset manifest count mismatch');
  assert(artifact.manifest_counts.subset_count === 8, 'manifest subset count mismatch');
  assert(artifact.manifest_counts.audited_rows === 500, 'manifest audited rows mismatch');
  assert(artifact.manifest_counts.audited_occurrences === 8427, 'manifest audited occurrences mismatch');
  assert(artifact.manifest_counts.total_rows_represented === 500, 'manifest represented rows mismatch');
  assert(artifact.manifest_counts.total_occurrences_represented === 8427, 'manifest represented occurrences mismatch');
  assert(artifact.manifest_counts.manifest_token_id_count === 500, 'manifest token ID count mismatch');
  assert(artifact.manifest_counts.unique_manifest_token_id_count === 500, 'unique token ID count mismatch');
  assert(artifact.manifest_counts.duplicate_token_id_count === 0, 'duplicate token IDs must be zero');

  const byBucket = new Map(subsets.map((subset) => [subset.bucket_id, subset]));
  const allTokenIds = [];
  for (const [bucket, expected] of Object.entries(expectedRows)) {
    const subset = byBucket.get(bucket);
    assert(subset, `missing subset: ${bucket}`);
    assert(subset.row_count === expected.rows, `${bucket} row_count mismatch`, subset);
    assert(subset.occurrence_count === expected.occurrences, `${bucket} occurrence_count mismatch`, subset);
    assert(subset.token_id_count === expected.rows, `${bucket} token_id_count mismatch`, subset);
    assert(subset.token_ids.length === expected.rows, `${bucket} token_ids length mismatch`, subset);
    assert(subset.lexicon_entry_ids.length === expected.rows, `${bucket} lexicon entry count mismatch`, subset);
    assert(subset.queue_ids.length === expected.rows, `${bucket} queue ID count mismatch`, subset);
    assert(subset.token_ids_sha256 === sha256(subset.token_ids.join('\n')), `${bucket} token ID hash mismatch`);
    assert(typeof subset.exact_blocker === 'string' && subset.exact_blocker.length > 0, `${bucket} blocker missing`);
    for (const [key, value] of Object.entries(subset.current_allowed_now || {})) {
      assert(value === false, `${bucket} ${key} must be false`);
    }
    allTokenIds.push(...subset.token_ids);
  }

  const previewTokenIds = new Set((preview.rows || []).map((row) => row.token_id));
  const manifestTokenIds = new Set(allTokenIds);
  assert(manifestTokenIds.size === allTokenIds.length, 'manifest token IDs must be unique');
  assert(previewTokenIds.size === 500, 'preview token IDs must be unique');
  assert([...previewTokenIds].every((tokenId) => manifestTokenIds.has(tokenId)), 'manifest must cover every preview token ID');
  assert([...manifestTokenIds].every((tokenId) => previewTokenIds.has(tokenId)), 'manifest must not include non-preview token IDs');

  assert(byBucket.get('noncommercial_educational_only').classification_lanes.length === 1, 'NC-only subset must have one lane');
  assert(byBucket.get('noncommercial_educational_only').classification_lanes[0] === 'noncommercial_educational_candidate', 'NC-only lane mismatch');
  assert(byBucket.get('commercial_clean_plus_noncommercial_educational').classification_lanes.includes('noncommercial_educational_candidate'), 'commercial+NC subset must preserve NC lane');
  assert(byBucket.get('commercial_clean_plus_noncommercial_educational_plus_blocked_review').classification_lanes.includes('noncommercial_educational_candidate'), 'triple-overlap subset must preserve NC lane');
  assert(byBucket.get('metadata_or_link_only').classification_lanes[0] === 'metadata_or_link_only', 'metadata/link-only subset lane mismatch');
  assert(byBucket.get('blocked_review_only').classification_lanes[0] === 'blocked_or_needs_review', 'blocked-only subset lane mismatch');

  assert((artifact.exact_blockers || []).length === subsets.length, 'exact blockers count mismatch');
  assert(artifact.exact_blockers.every((row) => typeof row.token_ids_sha256 === 'string' && row.token_ids_sha256.length === 64), 'exact blocker token hashes malformed');

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
    manifest_counts: artifact.manifest_counts,
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
