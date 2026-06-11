#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-old-dictionary-public-domain-ref-sample-gap-manifest-2026-06-05.json';
const resultPath = 'reports/agent1-old-dictionary-public-domain-ref-sample-gap-manifest-validation-result-2026-06-05.json';

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

const forbiddenFields = ['surface', 'normalized', 'definition', 'gloss', 'answer', 'candidate_text', 'definition_text'];

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
  const citationCustody = readJson(artifact.inputs.citationCustody);
  const citationCustodyResult = readJson(artifact.inputs.citationCustodyValidationResult);
  const sourceMembership = readJson(artifact.inputs.sourceFamilyMembership);

  assert(artifact.artifact_type === 'agent1_old_dictionary_public_domain_ref_sample_gap_manifest', 'unexpected artifact_type');
  assert(artifact.status === 'public_domain_ref_sample_gap_manifest_recorded_zero_output_no_acceptance', 'unexpected status');
  assert(artifact.current_agent1_thread_id === '019e975d-dc9f-7020-a7c8-885d083a837e', 'current Agent 1 thread mismatch');
  assert(artifact.old_agent1_policy === 'archived_do_not_use', 'old Agent 1 policy mismatch');
  assert(artifact.required_lane_output_shape === 'target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition', 'lane output shape mismatch');

  for (const key of ['preview', 'citationCustody', 'citationCustodyValidationResult', 'sourceFamilyMembership', 'outputJson', 'outputMd', 'validator']) {
    assert(exists(artifact.inputs[key]), `missing input path: ${key}`);
  }
  assert(preview.summary.audited_rows === 500, 'preview audited rows mismatch');
  assert(citationCustodyResult.ok === true, 'citation custody validator result not ok');
  assert(citationCustody.citation_coverage_counts.public_domain_rows_without_refs_sample === 93, 'citation custody ref-gap mismatch');
  assert(sourceMembership.source_family_manifests.length === 5, 'source family membership count mismatch');

  const counts = artifact.gap_counts;
  assert(counts.public_domain_rows === 297, 'public-domain row count mismatch');
  assert(counts.public_domain_occurrences === 5747, 'public-domain occurrence count mismatch');
  assert(counts.rows_with_ref_samples_or_ref_count === 204, 'rows with refs mismatch');
  assert(counts.occurrences_with_ref_samples_or_ref_count === 4385, 'occurrences with refs mismatch');
  assert(counts.rows_without_ref_samples_or_ref_count === 93, 'rows without refs mismatch');
  assert(counts.occurrences_without_ref_samples_or_ref_count === 1362, 'occurrences without refs mismatch');
  assert(counts.gap_rows_with_rids === 93, 'gap rows with RIDs mismatch');
  assert(counts.gap_rid_total === 270, 'gap RID total mismatch');
  assert(counts.gap_rows_with_headwords === 93, 'gap rows with headwords mismatch');
  assert(counts.gap_headword_total === 251, 'gap headword total mismatch');
  assert(counts.gap_emitted_answer_rows_now === 0, 'gap emitted answer rows must be zero');
  assert(counts.gap_source_rows_emitted_now === 0, 'gap source emitted rows must be zero');
  assert(counts.gap_answer_eligible_rows_now === 0, 'gap answer eligible rows must be zero');

  const gapRows = artifact.public_domain_ref_gap_rows || [];
  const coveredRows = artifact.public_domain_ref_covered_rows || [];
  assert(gapRows.length === 93, 'gap row list count mismatch');
  assert(coveredRows.length === 204, 'covered row list count mismatch');
  assert(counts.gap_token_ids_sha256 === sha256(gapRows.map((row) => row.token_id).join('\n')), 'gap token hash mismatch');
  assert(counts.covered_public_ref_token_ids_sha256 === sha256(coveredRows.map((row) => row.token_id).join('\n')), 'covered token hash mismatch');

  for (const row of gapRows) {
    for (const field of forbiddenFields) {
      assert(!(field in row), `forbidden field in gap row: ${field}`, row);
    }
    assert(row.public_domain_refs_count === 0, 'gap row ref count must be zero', row);
    assert(row.public_domain_refs_sample_count === 0, 'gap row ref sample count must be zero', row);
    assert(row.public_domain_rid_count > 0, 'gap row must retain RID metadata', row);
    assert(row.public_domain_headword_count > 0, 'gap row must retain headword metadata', row);
    assert(row.emitted_answer_row_now === false, 'gap row emitted answer must be false', row);
    assert(row.source_row_emitted_now === false, 'gap row source emitted must be false', row);
    assert(row.answer_eligible_now === false, 'gap row answer eligible must be false', row);
  }
  for (const row of coveredRows) {
    for (const field of forbiddenFields) {
      assert(!(field in row), `forbidden field in covered row: ${field}`, row);
    }
    assert(row.public_domain_refs_count > 0 || row.public_domain_refs_sample_count > 0, 'covered row must have ref metadata', row);
    assert(row.emitted_answer_row_now === false, 'covered row emitted answer must be false', row);
    assert(row.source_row_emitted_now === false, 'covered row source emitted must be false', row);
    assert(row.answer_eligible_now === false, 'covered row answer eligible must be false', row);
  }

  const familyPartitions = new Map((artifact.family_gap_partitions || []).map((row) => [row.source_family, row]));
  assert(familyPartitions.get('Jastrow Dictionary')?.row_count === 6, 'Jastrow gap row count mismatch');
  assert(familyPartitions.get('Jastrow Dictionary')?.occurrence_count === 89, 'Jastrow gap occurrence count mismatch');
  assert(familyPartitions.get('BDB Dictionary')?.row_count === 91, 'BDB gap row count mismatch');
  assert(familyPartitions.get('BDB Dictionary')?.occurrence_count === 1339, 'BDB gap occurrence count mismatch');
  assert(familyPartitions.get('BDB Aramaic Dictionary')?.row_count === 22, 'BDB Aramaic gap row count mismatch');
  assert(familyPartitions.get('BDB Aramaic Dictionary')?.occurrence_count === 434, 'BDB Aramaic gap occurrence count mismatch');
  for (const row of familyPartitions.values()) {
    assert(row.license_lane === 'commercial_clean_candidate', 'family partition lane mismatch', row);
    assert(row.token_ids_sha256 === sha256(row.token_ids.join('\n')), 'family token hash mismatch');
  }

  const lanes = artifact.classification_lanes || [];
  assert(lanes.find((row) => row.license_lane === 'commercial_clean_candidate')?.row_count === 93, 'commercial lane row count mismatch');
  assert(lanes.find((row) => row.license_lane === 'noncommercial_educational_candidate')?.row_count === 0, 'NC lane should be zero in ref-gap packet');
  assert(lanes.find((row) => row.license_lane === 'metadata_or_link_only')?.row_count === 0, 'metadata/link-only lane should be zero');
  assert(lanes.find((row) => row.license_lane === 'blocked_or_needs_review')?.row_count === 0, 'blocked/review lane should be zero');

  assert((artifact.exact_blockers || []).length === 2, 'exact blocker count mismatch');
  assert(artifact.exact_blockers.some((row) => row.blocker === 'public_domain_ref_sample_gap_rows_are_metadata_only_not_candidate_text'), 'metadata-only blocker missing');
  assert(artifact.exact_blockers.some((row) => row.blocker === 'public_domain_ref_sample_gap_needs_source_family_boundary_if_ref_samples_required'), 'boundary blocker missing');

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
    gap_counts: artifact.gap_counts,
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
