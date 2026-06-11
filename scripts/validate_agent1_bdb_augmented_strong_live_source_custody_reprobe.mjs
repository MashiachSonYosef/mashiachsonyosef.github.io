#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-bdb-augmented-strong-live-source-custody-reprobe-2026-06-05.json';
const resultPath = 'reports/agent1-bdb-augmented-strong-live-source-custody-reprobe-validation-result-2026-06-05.json';

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
  const baseBlocker = readJson(artifact.inputs.baseBlocker);
  const baseResult = readJson(artifact.inputs.baseBlockerValidationResult);

  assert(artifact.artifact_type === 'agent1_bdb_augmented_strong_live_source_custody_reprobe', 'unexpected artifact_type');
  assert(artifact.status === 'external_candidate_observed_exact_custody_linkage_still_blocked', 'unexpected status');
  assert(artifact.workset === 'old-dictionary-excluded-row-license-lane-reaudit', 'unexpected workset');
  assert(baseResult.ok === true, 'base blocker validator must be ok');
  assert(baseBlocker.source_family?.source_family === 'BDB Augmented Strong', 'base source family mismatch');

  const source = artifact.source_family || {};
  assert(source.row_subset_id === 'old-dictionary-excluded-row-license-lane-reaudit::bdb-augmented-strong', 'row subset mismatch');
  assert(source.source_family === 'BDB Augmented Strong', 'source family mismatch');
  assert(source.rows === 222, 'row count mismatch');
  assert(source.occurrences === 4435, 'occurrence count mismatch');
  assert(source.current_license_lane === 'blocked_or_needs_review', 'current lane mismatch');
  assert(source.derived_from_nc === false, 'derived_from_nc must be false');
  assert(source.commercial_export_allowed === false, 'commercial export must be false');
  assert(source.corpus_contamination === false, 'corpus contamination must be false');
  assert(source.nc_flags === null, 'NC flags must be null');

  assert(artifact.live_probe_results?.length === 5, 'live probe result count mismatch');
  const probes = new Map(artifact.live_probe_results.map((row) => [row.role, row]));
  for (const role of [
    'sefaria_versions_endpoint',
    'sefaria_raw_index_endpoint',
    'sefaria_index_endpoint',
    'openscriptures_hebrewlexicon_readme',
    'openscriptures_hebrewlexicon_augindex'
  ]) {
    assert(probes.has(role), `missing probe role: ${role}`);
    assert(probes.get(role).http_status === 200, `probe status must be 200: ${role}`);
    assert(typeof probes.get(role).sha256 === 'string' && probes.get(role).sha256.length === 64, `probe sha256 mismatch: ${role}`);
  }
  for (const role of ['sefaria_versions_endpoint', 'sefaria_raw_index_endpoint', 'sefaria_index_endpoint']) {
    const row = probes.get(role);
    assert(row.json_error_key_present === true, `Sefaria exact-title probe must expose error key: ${role}`);
    assert(row.observed_license === null, `Sefaria exact-title observed license must be null: ${role}`);
    assert(row.observed_version_source === null, `Sefaria exact-title observed version source must be null: ${role}`);
  }

  const external = artifact.external_candidate_evidence || {};
  assert(external.candidate_project === 'OpenScriptures HebrewLexicon', 'candidate project mismatch');
  assert(external.candidate_source_license_basis_observed === true, 'candidate source/license basis should be observed');
  assert(external.exact_linkage_to_current_imported_row_subset_proven === false, 'exact linkage must remain unproven');
  assert(external.observed_readme_signals?.has_augindex_statement === true, 'AugIndex signal missing');
  assert(external.observed_readme_signals?.has_cc_by_4_statement === true, 'CC BY 4.0 signal missing');
  assert(external.observed_readme_signals?.has_public_domain_dictionary_statement === true, 'public-domain dictionary signal missing');
  assert(external.observed_readme_signals?.has_attribution_statement === true, 'attribution signal missing');

  const repoProbe = artifact.live_probe_scope?.repo_source_probe || {};
  assert(repoProbe.candidate_source_file_count === 0, 'repo candidate source file count must be zero');
  assert(Array.isArray(repoProbe.candidate_source_files) && repoProbe.candidate_source_files.length === 0, 'repo candidate source files must remain empty');

  const decision = artifact.classification_lane_decision || {};
  assert(decision.license_lane === 'blocked_or_needs_review', 'decision lane must remain blocked_or_needs_review');
  assert(decision.lane_change_from_base_blocker === false, 'lane change must be false');
  assert(decision.metadata_or_link_only_allowed === true, 'metadata/link-only flag must be true');
  for (const key of [
    'transformed_reader_hint_allowed',
    'agent2_transform_allowed_now',
    'candidate_text_export_allowed_now',
    'answer_eligible_now',
    'public_emit_now',
    'release_route_opened_now',
    'agent6_delivery_now'
  ]) {
    assert(decision[key] === false, `decision ${key} must be false`);
  }

  assert(artifact.exact_blockers?.length === 4, 'exact blocker count mismatch');
  for (const blocker of [
    'bdb_augmented_strong_exact_custody_linkage_to_external_candidate_not_proven',
    'bdb_augmented_strong_sefaria_exact_title_source_license_fields_missing',
    'bdb_augmented_strong_import_row_subset_source_mapping_missing',
    'bdb_augmented_strong_agent6_boundary_required_if_evidence_becomes_linked'
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
    candidate_source_license_basis_observed: external.candidate_source_license_basis_observed,
    exact_linkage_to_current_imported_row_subset_proven: external.exact_linkage_to_current_imported_row_subset_proven,
    repo_candidate_source_file_count: repoProbe.candidate_source_file_count,
    sefaria_exact_title_probe_count: 3,
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
