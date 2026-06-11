#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-old-dictionary-public-domain-citation-metadata-custody-2026-06-05.json';
const resultPath = 'reports/agent1-old-dictionary-public-domain-citation-metadata-custody-validation-result-2026-06-05.json';

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

const forbiddenContentFields = [
  'surface',
  'normalized',
  'definition',
  'gloss',
  'answer',
  'candidate_text',
  'definition_text'
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
  const exactRows = readJson(artifact.inputs.exactRowSubsetManifest);
  const membership = readJson(artifact.inputs.sourceFamilyMembership);
  const overlap = readJson(artifact.inputs.sourceFamilyOverlapMatrix);

  assert(artifact.artifact_type === 'agent1_old_dictionary_public_domain_citation_metadata_custody', 'unexpected artifact_type');
  assert(artifact.status === 'public_domain_citation_metadata_custody_recorded_zero_output_no_acceptance', 'unexpected status');
  assert(artifact.current_agent1_thread_id === '019e975d-dc9f-7020-a7c8-885d083a837e', 'current Agent 1 thread mismatch');
  assert(artifact.old_agent1_policy === 'archived_do_not_use', 'old Agent 1 policy mismatch');
  assert(artifact.required_lane_output_shape === 'target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition', 'lane output shape mismatch');

  for (const key of ['preview', 'exactRowSubsetManifest', 'sourceFamilyMembership', 'sourceFamilyOverlapMatrix', 'outputJson', 'outputMd', 'validator']) {
    assert(exists(artifact.inputs[key]), `missing input path: ${key}`);
  }

  assert(preview.summary.audited_rows === 500, 'preview audited rows mismatch');
  assert((preview.rows || []).length === 500, 'preview row array mismatch');
  assert(exactRows.manifest_counts.unique_manifest_token_id_count === 500, 'exact row subset coverage mismatch');
  assert(membership.source_family_manifests.length === 5, 'source family membership count mismatch');
  assert(overlap.matrix_counts.total_exact_combination_rows === 500, 'overlap matrix coverage mismatch');

  const counts = artifact.citation_coverage_counts;
  assert(counts.audited_rows === 500, 'audited rows mismatch');
  assert(counts.audited_occurrences === 8427, 'audited occurrences mismatch');
  assert(counts.public_domain_observed_rows === 297, 'public-domain observed rows mismatch');
  assert(counts.public_domain_observed_occurrences === 5747, 'public-domain observed occurrences mismatch');
  assert(counts.public_domain_citation_metadata_present_rows === 297, 'citation metadata present rows mismatch');
  assert(counts.public_domain_rid_rows === 297, 'RID row count mismatch');
  assert(counts.public_domain_rid_total === 1276, 'RID total mismatch');
  assert(counts.public_domain_headword_rows === 297, 'headword row count mismatch');
  assert(counts.public_domain_headword_total === 1120, 'headword total mismatch');
  assert(counts.public_domain_refs_rows === 204, 'refs row count mismatch');
  assert(counts.public_domain_refs_count_total === 4478, 'refs count total mismatch');
  assert(counts.public_domain_rows_without_refs_sample === 93, 'public rows without refs mismatch');
  assert(counts.rows_without_public_domain_citation_metadata === 203, 'rows without public citation metadata mismatch');
  assert(counts.nc_only_rows_without_public_domain_citation_metadata === 17, 'NC-only rows without public metadata mismatch');
  assert(counts.no_source_hit_rows_without_public_domain_citation_metadata === 186, 'no-source rows without public metadata mismatch');
  assert(counts.emitted_answer_rows_now === 0, 'emitted answer rows must be zero');
  assert(counts.source_rows_emitted_now === 0, 'source rows emitted must be zero');
  assert(counts.answer_eligible_rows_now === 0, 'answer eligible rows must be zero');

  const metadataRows = artifact.public_domain_metadata_rows || [];
  assert(metadataRows.length === 297, 'metadata row count mismatch');
  assert(counts.public_domain_metadata_token_ids_sha256 === sha256(metadataRows.map((row) => row.token_id).join('\n')), 'public metadata token hash mismatch');
  for (const row of metadataRows) {
    for (const field of forbiddenContentFields) {
      assert(!(field in row), `forbidden content field written in metadata row: ${field}`, row);
    }
    assert(row.public_domain_citation_metadata_present === true, 'metadata row must have citation flag true', row);
    assert(row.public_domain_rid_count > 0, 'metadata row must have RID metadata', row);
    assert(row.public_domain_headword_count > 0, 'metadata row must have headword metadata', row);
    assert(row.emitted_answer_row_now === false, 'metadata row emitted_answer must be false', row);
    assert(row.source_row_emitted_now === false, 'metadata row source emission must be false', row);
    assert(row.answer_eligible_now === false, 'metadata row answer eligible must be false', row);
  }

  const noPublicSubsets = artifact.no_public_domain_citation_metadata_subsets || [];
  assert(noPublicSubsets.length === 2, 'no-public citation subset count mismatch');
  const ncOnly = noPublicSubsets.find((row) => row.license_lane === 'noncommercial_educational_candidate');
  const noHit = noPublicSubsets.find((row) => row.license_lane === 'blocked_or_needs_review');
  assert(ncOnly?.rows === 17 && ncOnly.occurrences === 259, 'NC-only no-public subset mismatch');
  assert(noHit?.rows === 186 && noHit.occurrences === 2421, 'no-source-hit subset mismatch');
  assert(counts.no_public_domain_citation_metadata_token_ids_sha256 === sha256([...ncOnly.token_ids, ...noHit.token_ids].join('\n')), 'no-public metadata token hash mismatch');

  const laneRows = artifact.classification_lanes || [];
  assert(laneRows.length === 4, 'classification lane count mismatch');
  assert(laneRows.find((row) => row.license_lane === 'commercial_clean_candidate')?.row_count === 297, 'commercial lane row count mismatch');
  assert(laneRows.find((row) => row.license_lane === 'noncommercial_educational_candidate')?.row_count === 17, 'NC lane row count mismatch');
  assert(laneRows.find((row) => row.license_lane === 'metadata_or_link_only')?.row_count === 0, 'metadata/link-only row count mismatch');
  assert(laneRows.find((row) => row.license_lane === 'blocked_or_needs_review')?.row_count === 186, 'blocked/review row count mismatch');

  assert((artifact.exact_blockers || []).length === 4, 'exact blocker count mismatch');
  assert(artifact.exact_blockers.some((row) => row.blocker === 'public_domain_metadata_is_citation_metadata_only_not_definition_text'), 'metadata-only blocker missing');
  assert(artifact.exact_blockers.some((row) => row.blocker === 'nc_only_rows_have_no_public_domain_citation_metadata_and_no_commercial_authorization'), 'NC blocker missing');
  assert(artifact.exact_blockers.some((row) => row.blocker === 'no_source_hit_rows_have_no_public_domain_citation_metadata_or_source_lane_evidence'), 'no-source blocker missing');

  for (const [key, value] of Object.entries(artifact.zero_output_counts || {})) {
    assert(value === 0, `${key} must be zero`);
  }
  for (const key of noAcceptanceKeys) {
    assert(artifact.non_acceptance_boundary?.[key] === true, `${key} must be true`);
  }
  for (const field of forbiddenContentFields) {
    assert(artifact.forbidden_content_fields_not_written.includes(field), `forbidden field marker missing: ${field}`);
  }

  const result = {
    ok: true,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    status: artifact.status,
    target: artifact.target,
    citation_coverage_counts: artifact.citation_coverage_counts,
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
