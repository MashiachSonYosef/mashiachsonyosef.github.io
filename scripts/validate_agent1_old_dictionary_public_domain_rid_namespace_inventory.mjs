#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-old-dictionary-public-domain-rid-namespace-inventory-2026-06-05.json';
const resultPath = 'reports/agent1-old-dictionary-public-domain-rid-namespace-inventory-validation-result-2026-06-05.json';

const expectedNamespaces = {
  BDB: { rows: 221, rid_occurrences: 636, unique_rids: 403 },
  BDBA: { rows: 67, rid_occurrences: 92, unique_rids: 39 },
  K: { rows: 20, rid_occurrences: 41, unique_rids: 19 },
  A: { rows: 22, rid_occurrences: 80, unique_rids: 47 },
  E: { rows: 16, rid_occurrences: 32, unique_rids: 23 },
  L: { rows: 6, rid_occurrences: 11, unique_rids: 11 },
  N: { rows: 9, rid_occurrences: 13, unique_rids: 9 },
  S: { rows: 6, rid_occurrences: 19, unique_rids: 19 },
  J: { rows: 17, rid_occurrences: 26, unique_rids: 17 },
  M: { rows: 27, rid_occurrences: 58, unique_rids: 40 },
  R: { rows: 3, rid_occurrences: 6, unique_rids: 6 },
  H: { rows: 17, rid_occurrences: 38, unique_rids: 32 },
  U: { rows: 16, rid_occurrences: 41, unique_rids: 37 },
  P: { rows: 24, rid_occurrences: 72, unique_rids: 51 },
  Q: { rows: 2, rid_occurrences: 4, unique_rids: 4 },
  G: { rows: 6, rid_occurrences: 10, unique_rids: 8 },
  D: { rows: 8, rid_occurrences: 23, unique_rids: 19 },
  C: { rows: 5, rid_occurrences: 15, unique_rids: 15 },
  B: { rows: 16, rid_occurrences: 34, unique_rids: 24 },
  V: { rows: 6, rid_occurrences: 7, unique_rids: 7 },
  T: { rows: 9, rid_occurrences: 17, unique_rids: 16 },
  I: { rows: 1, rid_occurrences: 1, unique_rids: 1 }
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
  const refGap = readJson(artifact.inputs.refGapManifest);
  const sourceMembership = readJson(artifact.inputs.sourceFamilyMembership);

  assert(artifact.artifact_type === 'agent1_old_dictionary_public_domain_rid_namespace_inventory', 'unexpected artifact_type');
  assert(artifact.status === 'public_domain_rid_namespace_inventory_recorded_zero_output_no_acceptance', 'unexpected status');
  assert(artifact.current_agent1_thread_id === '019e975d-dc9f-7020-a7c8-885d083a837e', 'current Agent 1 thread mismatch');
  assert(artifact.old_agent1_policy === 'archived_do_not_use', 'old Agent 1 policy mismatch');
  assert(artifact.required_lane_output_shape === 'target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition', 'lane output shape mismatch');

  for (const key of ['preview', 'citationCustody', 'refGapManifest', 'sourceFamilyMembership', 'outputJson', 'outputMd', 'validator']) {
    assert(exists(artifact.inputs[key]), `missing input path: ${key}`);
  }
  assert(preview.summary.audited_rows === 500, 'preview audited row mismatch');
  assert(citationCustody.citation_coverage_counts.public_domain_rid_total === 1276, 'citation custody RID total mismatch');
  assert(refGap.gap_counts.rows_without_ref_samples_or_ref_count === 93, 'ref gap row count mismatch');
  assert(sourceMembership.source_family_manifests.length === 5, 'source family membership count mismatch');

  const counts = artifact.inventory_counts;
  assert(counts.public_domain_rows === 297, 'public-domain row count mismatch');
  assert(counts.public_domain_occurrences === 5747, 'public-domain occurrence count mismatch');
  assert(counts.rid_namespace_count === 22, 'RID namespace count mismatch');
  assert(counts.unique_rid_count === 847, 'unique RID count mismatch');
  assert(counts.rid_occurrence_count === 1276, 'RID occurrence count mismatch');
  assert(counts.bdb_prefix_rows === 221, 'BDB prefix row count mismatch');
  assert(counts.bdba_prefix_rows === 67, 'BDBA prefix row count mismatch');
  assert(counts.single_letter_prefix_count === 20, 'single-letter prefix count mismatch');
  assert(counts.rows_with_no_public_domain_rids === 0, 'rows with no public RIDs must be zero');
  assert(counts.delivered_to_agent6_now === 0, 'Agent 6 delivery must be zero');
  assert(counts.allowed_transform_rows_now === 0, 'allowed transform rows must be zero');
  assert(counts.candidate_text_rows_now === 0, 'candidate text rows must be zero');

  const namespaceRows = artifact.rid_namespace_rows || [];
  assert(namespaceRows.length === 22, 'namespace row count mismatch');
  const byPrefix = new Map(namespaceRows.map((row) => [row.rid_prefix, row]));
  for (const [prefix, expected] of Object.entries(expectedNamespaces)) {
    const row = byPrefix.get(prefix);
    assert(row, `missing RID namespace: ${prefix}`);
    assert(row.row_count === expected.rows, `${prefix} row count mismatch`, row);
    assert(row.rid_occurrence_count === expected.rid_occurrences, `${prefix} RID occurrence count mismatch`, row);
    assert(row.unique_rid_count === expected.unique_rids, `${prefix} unique RID count mismatch`, row);
    assert(row.token_ids_sha256 === sha256(row.token_ids.join('\n')), `${prefix} token hash mismatch`);
    assert(row.unique_rids_sha256 === sha256(row.unique_rids.join('\n')), `${prefix} RID hash mismatch`);
    assert(row.prefix_not_source_family_proof === true, `${prefix} source-family proof blocker flag missing`);
    assert(row.candidate_text_rows_now === 0, `${prefix} candidate text rows must be zero`);
    assert(row.agent6_delivery_now === 0, `${prefix} Agent 6 delivery must be zero`);
  }

  const lanes = artifact.classification_lanes || [];
  assert(lanes.find((row) => row.license_lane === 'commercial_clean_candidate')?.row_count === 297, 'commercial lane row count mismatch');
  assert(lanes.find((row) => row.license_lane === 'noncommercial_educational_candidate')?.row_count === 0, 'NC lane row count mismatch');
  assert(lanes.find((row) => row.license_lane === 'metadata_or_link_only')?.row_count === 0, 'metadata/link lane row count mismatch');
  assert(lanes.find((row) => row.license_lane === 'blocked_or_needs_review')?.row_count === 0, 'blocked/review lane row count mismatch');

  assert((artifact.exact_blockers || []).length === 2, 'exact blocker count mismatch');
  assert(artifact.exact_blockers.some((row) => row.blocker === 'rid_prefixes_are_metadata_not_source_family_custody_proof'), 'RID prefix blocker missing');
  assert(artifact.exact_blockers.some((row) => row.blocker === 'rid_namespace_inventory_is_not_definition_or_candidate_text'), 'metadata-only blocker missing');

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
    inventory_counts: artifact.inventory_counts,
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
