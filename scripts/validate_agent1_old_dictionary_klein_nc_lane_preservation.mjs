#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-old-dictionary-klein-nc-lane-preservation-2026-06-05.json';
const resultPath = 'reports/agent1-old-dictionary-klein-nc-lane-preservation-validation-result-2026-06-05.json';

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
  const rows = preview.rows.filter((row) => (row.blocked_or_unresolved_lexicons || []).includes('Klein Dictionary'));

  assert(artifact.artifact_type === 'agent1_old_dictionary_klein_nc_lane_preservation', 'unexpected artifact_type');
  assert(artifact.status === 'klein_noncommercial_educational_candidate_preserved_separately_zero_output', 'unexpected status');
  assert(artifact.workset === 'old-dictionary-excluded-row-license-lane-reaudit', 'unexpected workset');

  const scope = artifact.scope_boundary || {};
  assert(scope.old_dictionary_klein_subset_rows === 214, 'old-dictionary Klein row count mismatch');
  assert(scope.old_dictionary_klein_subset_occurrences === 4444, 'old-dictionary Klein occurrence count mismatch');
  assert(scope.preview_rows_with_klein_blocked_or_unresolved === rows.length, 'preview Klein row count mismatch');
  assert(scope.preview_occurrences_with_klein_blocked_or_unresolved === rows.reduce((sum, row) => sum + (row.occurrences || 0), 0), 'preview Klein occurrence count mismatch');
  assert(scope.prior_nc_klein_package_rows === 17, 'prior NC Klein package row count mismatch');
  assert(scope.prior_nc_klein_package_occurrences === 259, 'prior NC Klein package occurrence count mismatch');
  assert(scope.scopes_are_not_interchangeable === true, 'scope boundary must remain non-interchangeable');

  const source = artifact.source_family || {};
  assert(source.row_subset_id === 'old-dictionary-excluded-row-license-lane-reaudit::klein-dictionary', 'row subset mismatch');
  assert(source.source_family === 'Klein Dictionary', 'source family mismatch');
  assert(source.license_label === 'CC-BY-NC', 'license label mismatch');
  assert(source.license_lane === 'noncommercial_educational_candidate', 'license lane mismatch');
  assert(source.rows === 214, 'source rows mismatch');
  assert(source.occurrences === 4444, 'source occurrences mismatch');
  assert(source.derived_from_nc === true, 'derived_from_nc must be true');
  assert(source.commercial_export_allowed === false, 'commercial export must be false');
  assert(source.commercial_export_prohibited === true, 'commercial export prohibited flag must be true');
  assert(source.attribution_required === true, 'attribution required must be true');
  assert(source.corpus_contamination === false, 'corpus contamination must be false');
  assert(source.nc_flags?.derived_from_nc === true, 'NC derived flag mismatch');
  assert(source.nc_flags?.commercial_export_allowed === false, 'NC commercial flag mismatch');
  assert(source.nc_flags?.attribution_required === true, 'NC attribution flag mismatch');
  assert(source.nc_flags?.corpus_contamination === false, 'NC corpus flag mismatch');

  const profile = artifact.row_field_profile || {};
  assert(profile.row_count === 214, 'profile row count mismatch');
  assert(profile.occurrence_sum === 4444, 'profile occurrence sum mismatch');
  assert((profile.blocked_or_unresolved_lexicons || []).includes('Klein Dictionary'), 'Klein blocked lexicon missing');
  assert((profile.emitted_answer_row_now_values || []).every((value) => value === false), 'answer rows must not be emitted');
  assert((profile.source_row_emitted_now_values || []).every((value) => value === false), 'source rows must not be emitted');
  assert((profile.answer_eligible_now_values || []).every((value) => value === false), 'answer eligibility must remain false in this packet');

  const map = artifact.nc_source_family_map_evidence || {};
  assert(map.observed_license === 'CC-BY-NC', 'observed license mismatch');
  assert(map.observed_license_group === 'CC_BY_NC', 'observed license group mismatch');
  assert(map.family_map_status === 'noncommercial_educational_candidate', 'family map status mismatch');
  assert(map.metadata_only_allowed === true, 'metadata-only flag mismatch');
  assert(map.external_link_only_allowed === true, 'external-link flag mismatch');
  assert(map.storage_allowed === false, 'storage allowed must be false');
  assert(map.display_allowed === false, 'display allowed must be false');
  assert(map.noncommercial_display_allowed === false, 'noncommercial display allowed must be false');
  assert(map.transformed_reader_hint_allowed === false, 'transformed reader hint must be false');

  const downstream = artifact.downstream_boundary_alignment?.downstream_audit_row || {};
  assert(downstream.license_lane === 'noncommercial_educational_candidate', 'downstream lane mismatch');
  assert(downstream.rows === 214, 'downstream row count mismatch');
  assert(downstream.occurrences === 4444, 'downstream occurrence count mismatch');
  assert(downstream.derived_from_nc === true, 'downstream derived flag mismatch');
  assert(downstream.commercial_export_allowed === false, 'downstream commercial export must be false');
  assert(downstream.attribution_required === true, 'downstream attribution flag mismatch');
  assert(downstream.corpus_contamination === false, 'downstream corpus flag mismatch');

  const boundary = artifact.downstream_boundary_alignment?.agent6_boundary_question_row || {};
  assert(boundary.license_lane === 'noncommercial_educational_candidate', 'boundary lane mismatch');
  assert(boundary.rows === 214, 'boundary row count mismatch');
  assert(boundary.occurrences === 4444, 'boundary occurrence count mismatch');
  assert(boundary.required_flags_to_preserve?.derived_from_nc === true, 'boundary derived flag mismatch');
  assert(boundary.required_flags_to_preserve?.commercial_export_allowed === false, 'boundary commercial flag mismatch');
  assert(boundary.current_allowed_now?.commercial_export === false, 'boundary commercial export must be false');
  assert(boundary.current_allowed_now?.nc_commercial_authorization === false, 'boundary NC commercial authorization must be false');

  const decision = artifact.classification_lane_decision || {};
  assert(decision.license_lane === 'noncommercial_educational_candidate', 'decision lane mismatch');
  assert(decision.lane_change_from_old_dictionary_reaudit === false, 'lane change must be false');
  assert(decision.commercial_clean_candidate === false, 'commercial-clean must be false');
  assert(decision.blocked_or_needs_review === false, 'blocked/review must be false');
  assert(decision.metadata_or_link_only === false, 'metadata/link-only must be false');
  assert(decision.metadata_only_allowed === true, 'metadata-only decision mismatch');
  assert(decision.external_link_only_allowed === true, 'external-link decision mismatch');
  for (const key of [
    'agent2_transform_allowed_now',
    'candidate_text_export_allowed_now',
    'definition_content_storage_allowed_now',
    'answer_eligible_now',
    'public_emit_now',
    'release_route_opened_now',
    'agent6_delivery_now'
  ]) {
    assert(decision[key] === false, `decision ${key} must be false`);
  }

  assert(artifact.exact_blockers?.length === 6, 'exact blocker count mismatch');
  for (const blocker of [
    'noncommercial_educational_candidate::klein-dictionary_no_commercial_export_authorization',
    'klein_dictionary_missing_exact_agent6_nc_boundary',
    'klein_dictionary_definition_content_storage_not_allowed_now',
    'klein_dictionary_public_or_runtime_display_not_allowed_now',
    'klein_dictionary_attribution_boundary_required_if_future_nc_use_allowed',
    'klein_dictionary_scope_boundary_214_rows_not_same_as_prior_17_row_nc_package'
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
    license_lane: source.license_lane,
    prior_nc_klein_package_rows: scope.prior_nc_klein_package_rows,
    prior_nc_klein_package_occurrences: scope.prior_nc_klein_package_occurrences,
    commercial_export_allowed: false,
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
