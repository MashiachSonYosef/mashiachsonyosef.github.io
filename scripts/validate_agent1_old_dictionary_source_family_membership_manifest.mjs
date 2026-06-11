#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-old-dictionary-source-family-membership-manifest-2026-06-05.json';
const resultPath = 'reports/agent1-old-dictionary-source-family-membership-manifest-validation-result-2026-06-05.json';

const expectedFamilies = {
  'Jastrow Dictionary': {
    lane: 'commercial_clean_candidate',
    rows: 210,
    occurrences: 4474,
    field: 'public_domain_lexicons'
  },
  'BDB Dictionary': {
    lane: 'commercial_clean_candidate',
    rows: 221,
    occurrences: 4418,
    field: 'public_domain_lexicons'
  },
  'BDB Aramaic Dictionary': {
    lane: 'commercial_clean_candidate',
    rows: 69,
    occurrences: 2048,
    field: 'public_domain_lexicons'
  },
  'Klein Dictionary': {
    lane: 'noncommercial_educational_candidate',
    rows: 214,
    occurrences: 4444,
    field: 'blocked_or_unresolved_lexicons'
  },
  'BDB Augmented Strong': {
    lane: 'blocked_or_needs_review',
    rows: 222,
    occurrences: 4435,
    field: 'blocked_or_unresolved_lexicons'
  }
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
  const reaudit = readJson(artifact.inputs.reaudit);
  const exportPartitions = readJson(artifact.inputs.exportPartitions);
  const exactSubset = readJson(artifact.inputs.exactRowSubsetManifest);
  const exactSubsetResult = readJson(artifact.inputs.exactRowSubsetManifestValidationResult);

  assert(artifact.artifact_type === 'agent1_old_dictionary_source_family_membership_manifest', 'unexpected artifact_type');
  assert(artifact.status === 'source_family_membership_manifest_recorded_nonexclusive_zero_output_no_acceptance', 'unexpected status');
  assert(artifact.current_agent1_thread_id === '019e975d-dc9f-7020-a7c8-885d083a837e', 'current Agent 1 thread mismatch');
  assert(artifact.old_agent1_policy === 'archived_do_not_use', 'old Agent 1 policy mismatch');
  assert(artifact.required_lane_output_shape === 'target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition', 'lane output shape mismatch');

  for (const key of ['preview', 'reaudit', 'exportPartitions', 'exactRowSubsetManifest', 'exactRowSubsetManifestValidationResult', 'outputJson', 'outputMd', 'validator']) {
    assert(exists(artifact.inputs[key]), `missing input path: ${key}`);
  }
  assert(preview.summary.audited_rows === 500, 'preview audited rows mismatch');
  assert((preview.rows || []).length === 500, 'preview row array mismatch');
  assert(reaudit.workset === 'old-dictionary-excluded-row-license-lane-reaudit', 'reaudit workset mismatch');
  assert(exportPartitions.count_semantics.row_count_is_not_exclusive_export_row_count === true, 'export partitions must preserve nonexclusive warning');
  assert(exactSubsetResult.ok === true, 'exact subset validator result not ok');
  assert(exactSubset.manifest_counts.unique_manifest_token_id_count === 500, 'exact subset token coverage mismatch');

  assert(artifact.count_semantics.source_family_membership_counts_are_nonexclusive === true, 'source-family counts must be nonexclusive');
  assert(artifact.count_semantics.exclusive_export_row_counts_authorized_now === false, 'exclusive export row counts must not be authorized');

  const families = artifact.source_family_manifests || [];
  assert(families.length === 5, 'source family manifest count mismatch');
  assert(artifact.membership_counts.source_family_count === 5, 'source family count mismatch');
  assert(artifact.membership_counts.source_family_membership_rows_nonexclusive === 936, 'nonexclusive row membership count mismatch');
  assert(artifact.membership_counts.source_family_membership_occurrences_nonexclusive === 19819, 'nonexclusive occurrence membership count mismatch');
  assert(artifact.membership_counts.unique_preview_rows === 500, 'unique preview rows mismatch');
  assert(artifact.membership_counts.unique_preview_occurrences === 8427, 'unique preview occurrences mismatch');
  assert(artifact.membership_counts.delivered_to_agent6_now === 0, 'Agent 6 delivery must be zero');
  assert(artifact.membership_counts.allowed_transform_rows_now === 0, 'allowed transform rows must be zero');
  assert(artifact.membership_counts.candidate_text_rows_now === 0, 'candidate text rows must be zero');

  const byFamily = new Map(families.map((family) => [family.source_family, family]));
  for (const [sourceFamily, expected] of Object.entries(expectedFamilies)) {
    const family = byFamily.get(sourceFamily);
    assert(family, `missing source family: ${sourceFamily}`);
    assert(family.license_lane === expected.lane, `${sourceFamily} lane mismatch`, family);
    assert(family.source_membership_field === expected.field, `${sourceFamily} membership field mismatch`, family);
    assert(family.row_count === expected.rows, `${sourceFamily} row count mismatch`, family);
    assert(family.occurrence_count === expected.occurrences, `${sourceFamily} occurrence count mismatch`, family);
    assert(family.token_id_count === expected.rows, `${sourceFamily} token count mismatch`, family);
    assert(family.token_ids.length === expected.rows, `${sourceFamily} token list length mismatch`, family);
    assert(family.lexicon_entry_ids.length === expected.rows, `${sourceFamily} lexicon entry count mismatch`, family);
    assert(family.queue_ids.length === expected.rows, `${sourceFamily} queue ID count mismatch`, family);
    assert(family.token_ids_sha256 === sha256(family.token_ids.join('\n')), `${sourceFamily} token hash mismatch`);
    assert(Object.values(family.row_overlap_bucket_counts || {}).reduce((sum, count) => sum + count, 0) === expected.rows, `${sourceFamily} bucket linkage count mismatch`, family);
    assert(family.commercial_export_allowed_now === false, `${sourceFamily} must not authorize commercial export now`);
    assert(family.candidate_text_rows_now === 0, `${sourceFamily} candidate text rows must be zero`);
    assert(family.agent6_delivery_now === 0, `${sourceFamily} Agent 6 delivery must be zero`);
    assert(typeof family.exact_blocker === 'string' && family.exact_blocker.length > 0, `${sourceFamily} blocker missing`);
  }

  const klein = byFamily.get('Klein Dictionary');
  assert(klein.derived_from_nc === true, 'Klein derived_from_nc must be true');
  assert(klein.attribution_required === true, 'Klein attribution_required must be true');
  assert(klein.license_lane === 'noncommercial_educational_candidate', 'Klein must preserve NC lane');

  const bdbAugmented = byFamily.get('BDB Augmented Strong');
  assert(bdbAugmented.license_lane === 'blocked_or_needs_review', 'BDB Augmented Strong lane mismatch');
  assert(bdbAugmented.derived_from_nc === false, 'BDB Augmented Strong derived_from_nc must be false');

  assert(artifact.lane_counts.commercial_clean_candidate_source_families === 3, 'commercial-clean family count mismatch');
  assert(artifact.lane_counts.noncommercial_educational_candidate_source_families === 1, 'NC family count mismatch');
  assert(artifact.lane_counts.metadata_or_link_only_source_families === 0, 'metadata/link-only family count mismatch');
  assert(artifact.lane_counts.blocked_or_needs_review_source_families === 1, 'blocked/review family count mismatch');

  assert((artifact.exact_blockers || []).length === families.length, 'exact blocker count mismatch');
  assert(artifact.exact_blockers.some((row) => row.source_family === 'Klein Dictionary' && row.license_lane === 'noncommercial_educational_candidate'), 'Klein blocker row missing');
  assert(artifact.exact_blockers.some((row) => row.source_family === 'BDB Augmented Strong' && row.license_lane === 'blocked_or_needs_review'), 'BDB Augmented Strong blocker row missing');
  assert(artifact.exact_blockers.every((row) => typeof row.token_ids_sha256 === 'string' && row.token_ids_sha256.length === 64), 'blocker token hashes malformed');

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
    membership_counts: artifact.membership_counts,
    lane_counts: artifact.lane_counts,
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
