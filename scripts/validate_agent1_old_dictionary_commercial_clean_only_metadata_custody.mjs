#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-old-dictionary-commercial-clean-only-metadata-custody-2026-06-05.json';
const resultPath = 'reports/agent1-old-dictionary-commercial-clean-only-metadata-custody-validation-result-2026-06-05.json';

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

try {
  const artifact = readJson(artifactPath);
  const preview = readJson(artifact.inputs.preview);
  const exactRows = readJson(artifact.inputs.exactRowSubsetManifest);
  const overlap = readJson(artifact.inputs.sourceFamilyOverlapMatrix);
  const ridInventory = readJson(artifact.inputs.ridNamespaceInventory);
  const refGap = readJson(artifact.inputs.refGapManifest);

  assert(artifact.artifact_type === 'agent1_old_dictionary_commercial_clean_only_metadata_custody', 'unexpected artifact_type');
  assert(artifact.status === 'commercial_clean_only_metadata_custody_recorded_zero_output_no_acceptance', 'unexpected status');
  assert(artifact.current_agent1_thread_id === '019e975d-dc9f-7020-a7c8-885d083a837e', 'current Agent 1 thread mismatch');
  assert(artifact.old_agent1_policy === 'archived_do_not_use', 'old Agent 1 policy mismatch');
  assert(artifact.required_lane_output_shape === 'target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition', 'lane output shape mismatch');

  for (const key of ['preview', 'exactRowSubsetManifest', 'sourceFamilyOverlapMatrix', 'ridNamespaceInventory', 'refGapManifest', 'outputJson', 'outputMd', 'validator']) {
    assert(exists(artifact.inputs[key]), `missing input path: ${key}`);
  }
  assert(preview.summary.audited_rows === 500, 'preview audited row mismatch');
  assert(exactRows.manifest_counts.commercial_clean_only_rows === 18, 'exact row subset commercial-clean count mismatch');
  assert(overlap.matrix_counts.total_exact_combination_rows === 500, 'overlap matrix coverage mismatch');
  assert(ridInventory.inventory_counts.public_domain_rows === 297, 'RID inventory public-domain row mismatch');
  assert(refGap.gap_counts.rows_without_ref_samples_or_ref_count === 93, 'ref gap count mismatch');

  const counts = artifact.custody_counts;
  assert(counts.commercial_clean_only_rows === 18, 'commercial-clean-only row count mismatch');
  assert(counts.commercial_clean_only_occurrences === 494, 'commercial-clean-only occurrence count mismatch');
  assert(counts.source_family === 'Jastrow Dictionary', 'source family mismatch');
  assert(counts.jastrow_only_rows === 18, 'Jastrow-only row count mismatch');
  assert(counts.rows_with_nc_overlap === 0, 'NC overlap must be zero');
  assert(counts.rows_with_blocked_overlap === 0, 'blocked overlap must be zero');
  assert(counts.rows_with_refs === 17, 'rows with refs mismatch');
  assert(counts.occurrences_with_refs === 476, 'occurrences with refs mismatch');
  assert(counts.rows_without_refs === 1, 'rows without refs mismatch');
  assert(counts.occurrences_without_refs === 18, 'occurrences without refs mismatch');
  assert(counts.rid_total === 22, 'RID total mismatch');
  assert(counts.headword_total === 22, 'headword total mismatch');
  assert(counts.emitted_answer_rows_now === 0, 'emitted answer rows must be zero');
  assert(counts.source_rows_emitted_now === 0, 'source rows emitted must be zero');
  assert(counts.answer_eligible_rows_now === 0, 'answer eligible rows must be zero');

  const metadataRows = artifact.commercial_clean_only_metadata_rows || [];
  assert(metadataRows.length === 18, 'metadata row count mismatch');
  assert(counts.token_ids_sha256 === sha256(metadataRows.map((row) => row.token_id).join('\n')), 'token hash mismatch');
  for (const row of metadataRows) {
    for (const field of forbiddenFields) {
      assert(!(field in row), `forbidden field in metadata row: ${field}`, row);
    }
    assert(JSON.stringify(row.public_domain_lexicons) === JSON.stringify(['Jastrow Dictionary']), 'metadata row must be Jastrow-only', row);
    assert((row.blocked_or_unresolved_lexicons || []).length === 0, 'metadata row must have no blocked/NC overlap', row);
    assert(row.public_domain_citation_metadata_present === true, 'metadata row citation metadata must be true', row);
    assert(row.public_domain_rid_count > 0, 'metadata row RID count must be positive', row);
    assert(row.public_domain_headword_count > 0, 'metadata row headword count must be positive', row);
    assert(row.emitted_answer_row_now === false, 'metadata row emitted answer must be false', row);
    assert(row.source_row_emitted_now === false, 'metadata row source emission must be false', row);
    assert(row.answer_eligible_now === false, 'metadata row answer eligible must be false', row);
  }

  const refGapRows = artifact.ref_gap_rows || [];
  assert(refGapRows.length === 1, 'ref gap row count mismatch');
  assert(counts.ref_gap_token_ids_sha256 === sha256(refGapRows.map((row) => row.token_id).join('\n')), 'ref gap token hash mismatch');
  assert(refGapRows[0].public_domain_refs_count === 0, 'ref gap row refs count must be zero');
  assert(refGapRows[0].public_domain_refs_sample_count === 0, 'ref gap row refs sample count must be zero');

  const laneRows = artifact.classification_lanes || [];
  assert(laneRows.find((row) => row.license_lane === 'commercial_clean_candidate')?.row_count === 18, 'commercial lane row count mismatch');
  assert(laneRows.find((row) => row.license_lane === 'noncommercial_educational_candidate')?.row_count === 0, 'NC lane row count mismatch');
  assert(laneRows.find((row) => row.license_lane === 'metadata_or_link_only')?.row_count === 0, 'metadata/link lane row count mismatch');
  assert(laneRows.find((row) => row.license_lane === 'blocked_or_needs_review')?.row_count === 0, 'blocked/review lane row count mismatch');

  assert((artifact.exact_blockers || []).length === 3, 'exact blocker count mismatch');
  assert(artifact.exact_blockers.some((row) => row.blocker === 'commercial_clean_only_rows_still_need_agent6_candidate_use_boundary_and_morphology_relation'), 'Agent 6 boundary blocker missing');
  assert(artifact.exact_blockers.some((row) => row.blocker === 'commercial_clean_only_metadata_is_not_definition_or_candidate_text'), 'metadata-only blocker missing');
  assert(artifact.exact_blockers.some((row) => row.blocker === 'commercial_clean_only_ref_gap_row_needs_ref_boundary_if_refs_required'), 'ref gap blocker missing');

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
    custody_counts: artifact.custody_counts,
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
