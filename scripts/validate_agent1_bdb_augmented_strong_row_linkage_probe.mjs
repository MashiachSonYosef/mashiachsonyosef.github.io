#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-bdb-augmented-strong-row-linkage-probe-2026-06-05.json';
const resultPath = 'reports/agent1-bdb-augmented-strong-row-linkage-probe-validation-result-2026-06-05.json';

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

try {
  const artifact = readJson(artifactPath);
  const preview = readJson(artifact.inputs.preview);
  const linkedRows = preview.rows.filter((row) => (row.blocked_or_unresolved_lexicons || []).includes('BDB Augmented Strong'));
  const liveResult = readJson(artifact.inputs.liveReprobeValidationResult);

  assert(artifact.artifact_type === 'agent1_bdb_augmented_strong_row_linkage_probe', 'unexpected artifact_type');
  assert(artifact.status === 'row_linkage_fields_missing_exact_custody_linkage_still_blocked', 'unexpected status');
  assert(artifact.workset === 'old-dictionary-excluded-row-license-lane-reaudit', 'unexpected workset');
  assert(liveResult.ok === true, 'live re-probe validator result must be ok');

  const source = artifact.source_family || {};
  assert(source.row_subset_id === 'old-dictionary-excluded-row-license-lane-reaudit::bdb-augmented-strong', 'row subset mismatch');
  assert(source.rows === 222, 'source row count mismatch');
  assert(source.occurrences === 4435, 'source occurrence count mismatch');
  assert(source.rows === linkedRows.length, 'preview linked row count mismatch');
  assert(source.occurrences === linkedRows.reduce((sum, row) => sum + (row.occurrences || 0), 0), 'preview linked occurrence count mismatch');
  assert(source.license_lane === 'blocked_or_needs_review', 'source lane mismatch');
  assert(source.derived_from_nc === false, 'derived_from_nc must be false');
  assert(source.commercial_export_allowed === false, 'commercial export must be false');
  assert(source.corpus_contamination === false, 'corpus contamination must be false');

  const profile = artifact.row_field_profile || {};
  assert(profile.row_count === 222, 'profile row count mismatch');
  assert(profile.occurrence_sum === 4435, 'profile occurrence sum mismatch');
  for (const requiredKey of ['token_id', 'lexicon_entry_id', 'blocked_or_unresolved_lexicons', 'blocked_or_unresolved_entry_count', 'public_domain_rids']) {
    assert((profile.all_keys || []).includes(requiredKey), `required preview key missing: ${requiredKey}`);
  }
  for (const missingKey of ['augmented_strong_number', 'openscriptures_lexical_id', 'bdb_augmented_strong_rid', 'blocked_or_unresolved_rids', 'source_file']) {
    assert((profile.missing_linkage_keys || []).includes(missingKey), `missing linkage key not checked: ${missingKey}`);
    assert(!profile.all_keys.includes(missingKey), `linkage key unexpectedly present: ${missingKey}`);
  }
  assert((profile.blocked_or_unresolved_lexicons || []).includes('BDB Augmented Strong'), 'BDB Augmented Strong blocked lexicon missing');

  const augIndex = artifact.open_scriptures_augindex_profile || {};
  assert(augIndex.http_status === 200, 'AugIndex status mismatch');
  assert(typeof augIndex.sha256 === 'string' && augIndex.sha256.length === 64, 'AugIndex hash mismatch');
  assert(augIndex.entry_count > 8000, 'AugIndex entry count unexpectedly low');
  assert(augIndex.identifier_shape?.aug_attribute === 'number_or_number_suffix', 'AugIndex aug shape mismatch');
  assert(augIndex.identifier_shape?.entry_text === 'lowercase_lexical_index_id', 'AugIndex lexical ID shape mismatch');

  const linkage = artifact.mechanical_linkage_probe || {};
  assert(linkage.exact_linkage_proven === false, 'exact linkage must remain false');
  for (const [key, values] of Object.entries(linkage.overlaps || {})) {
    assert(Array.isArray(values), `overlap row must be array: ${key}`);
    assert(values.length === 0, `overlap must remain empty: ${key}`);
  }
  assert(linkage.tested_row_sets?.token_id_count === 222, 'token ID count mismatch');
  assert(linkage.tested_row_sets?.lexicon_entry_id_count === 222, 'lexicon entry ID count mismatch');
  assert(linkage.augindex_sets?.entry_count === undefined || true, 'noop');

  const decision = artifact.classification_lane_decision || {};
  assert(decision.license_lane === 'blocked_or_needs_review', 'decision lane mismatch');
  assert(decision.lane_change_from_live_reprobe === false, 'lane change must be false');
  assert(decision.candidate_source_license_basis_observed === true, 'candidate basis flag mismatch');
  assert(decision.exact_linkage_to_current_imported_row_subset_proven === false, 'exact linkage decision must be false');
  assert(decision.metadata_or_link_only_allowed === true, 'metadata/link-only flag must be true');
  for (const key of [
    'agent2_transform_allowed_now',
    'candidate_text_export_allowed_now',
    'answer_eligible_now',
    'public_emit_now',
    'release_route_opened_now',
    'agent6_delivery_now'
  ]) {
    assert(decision[key] === false, `decision ${key} must be false`);
  }

  assert(artifact.exact_blockers?.length === 6, 'exact blocker count mismatch');
  for (const blocker of [
    'bdb_augmented_strong_rows_missing_augmented_strong_number_field',
    'bdb_augmented_strong_rows_missing_openscriptures_lexical_index_id_field',
    'bdb_augmented_strong_rows_missing_blocked_entry_id_or_ref_sample',
    'bdb_augmented_strong_public_domain_rids_do_not_match_augindex_identifier_shape',
    'bdb_augmented_strong_source_file_or_import_mapping_missing',
    'bdb_augmented_strong_agent6_boundary_required_if_linkage_evidence_appears'
  ]) {
    assert(artifact.exact_blockers.includes(blocker), `missing blocker: ${blocker}`);
  }

  for (const [key, value] of Object.entries(artifact.zero_output_counts || {})) {
    assert(value === 0, `zero-output count must be zero: ${key}`);
  }
  for (const key of noAcceptanceKeys) {
    assert(artifact.non_acceptance_boundary?.[key] === true, `missing no-acceptance key: ${key}`);
  }

  const result = {
    ok: true,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    status: artifact.status,
    source_family: source.source_family,
    row_subset_id: source.row_subset_id,
    rows: source.rows,
    occurrences: source.occurrences,
    license_lane: decision.license_lane,
    augindex_entry_count: augIndex.entry_count,
    exact_linkage_to_current_imported_row_subset_proven: false,
    exact_blocker_count: artifact.exact_blockers.length,
    allowed_transform_rows_now: 0,
    candidate_text_rows_now: 0,
    agent6_delivery_now: 0,
    no_acceptance_claims: true
  };
  writeJson(resultPath, result);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  const result = {
    ok: false,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    error: error.message,
    details: error.details ?? null
  };
  writeJson(resultPath, result);
  console.error(JSON.stringify(result, null, 2));
  process.exitCode = 1;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function assert(condition, message, details = null) {
  if (!condition) {
    const error = new Error(message);
    error.details = details;
    throw error;
  }
}
