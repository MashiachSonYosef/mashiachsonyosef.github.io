#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const BOUNDARY_JSON = 'reports/a14-orot-dictionary-transform-boundary-2026-06-11.json';
const BOUNDARY_MD = 'reports/a14-orot-dictionary-transform-boundary-2026-06-11.md';
const BUILDER_SPEC_JSON = 'reports/a14-dictionary-corpus-candidate-matrix-builder-spec-2026-06-11.json';
const BUILDER_SPEC_MD = 'reports/a14-dictionary-corpus-candidate-matrix-builder-spec-2026-06-11.md';

const EXPECTED_JASTROW_TOKEN_IDS = [
  'tok-f4684f98dd3c',
  'tok-730582e0eb7b',
  'tok-7e4936f25f7a',
  'tok-139a2c161eac',
  'tok-17ba65351831',
];

const EXPECTED_KLEIN_TOKEN_IDS = [
  'tok-f4684f98dd3c',
  'tok-17ba65351831',
];

const FORBIDDEN_TRUTHY_KEYS = new Set([
  'source_license_legal_acceptance',
  'Definition_authority',
  'answer_eligibility',
  'accepted_gloss_or_text',
  'accepted_gloss_or_answer_text',
  'publication_readiness',
  'release_readiness',
  'public_runtime_acceptance',
  'active_lexical_source_layer_mutation',
  'page_render_mutation',
  'prehud_display_promotion',
  'nc_commercial_clean_promotion',
  'candidate_text_present',
  'candidate_text_emitted',
  'dictionary_payload_copied',
  'active_output_allowed',
  'display_eligible',
  'prehud_allowed',
  'reader_hint_allowed',
  'route_hud_display_allowed',
  'page_render_allowed',
  'allowed_now',
  'candidate_text_emission',
]);

const errors = [];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function requireEqual(actual, expected, label) {
  if (actual !== expected) errors.push(`${label}: expected ${expected}, got ${actual}`);
}

function requireArrayEqual(actual, expected, label) {
  const a = Array.isArray(actual) ? [...actual].sort() : [];
  const b = [...expected].sort();
  if (JSON.stringify(a) !== JSON.stringify(b)) {
    errors.push(`${label}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
  }
}

function isTruthy(value) {
  if (value === false || value === null || value === undefined || value === 0 || value === '') return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
}

function scanForbiddenTruthyKeys(value, pathParts = [], hits = []) {
  if (!value || typeof value !== 'object') return hits;
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanForbiddenTruthyKeys(item, [...pathParts, String(index)], hits));
    return hits;
  }
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_TRUTHY_KEYS.has(key) && isTruthy(child)) {
      hits.push([...pathParts, key].join('.'));
    }
    scanForbiddenTruthyKeys(child, [...pathParts, key], hits);
  }
  return hits;
}

const boundary = readJson(BOUNDARY_JSON);
const boundaryMd = readText(BOUNDARY_MD);
const builderSpec = readJson(BUILDER_SPEC_JSON);
const builderSpecMd = readText(BUILDER_SPEC_MD);

requireEqual(boundary.artifact_type, 'a14_orot_dictionary_transform_boundary', 'boundary artifact_type');
requireEqual(boundary.status, 'blocked_no_active_transform_or_render', 'boundary status');
requireEqual(boundary.target?.work_id, 'orot', 'boundary target work');
requireEqual(boundary.exact_token_subset?.unique_token_ids, 5, 'unique token ids');
requireEqual(boundary.exact_token_subset?.unique_occurrences, 46, 'unique occurrences');
requireEqual(boundary.exact_token_subset?.commercial_clean_candidate?.source_family, 'Jastrow Dictionary', 'Jastrow source family');
requireEqual(boundary.exact_token_subset?.commercial_clean_candidate?.license_lane, 'commercial_clean_candidate', 'Jastrow lane');
requireArrayEqual(boundary.exact_token_subset?.commercial_clean_candidate?.token_ids, EXPECTED_JASTROW_TOKEN_IDS, 'Jastrow token ids');
requireEqual(boundary.exact_token_subset?.noncommercial_educational_candidate?.source_family, 'Klein Dictionary', 'Klein source family');
requireEqual(boundary.exact_token_subset?.noncommercial_educational_candidate?.license_lane, 'noncommercial_educational_candidate', 'Klein lane');
requireArrayEqual(boundary.exact_token_subset?.noncommercial_educational_candidate?.token_ids, EXPECTED_KLEIN_TOKEN_IDS, 'Klein token ids');
requireEqual(boundary.transform_allowed?.rows, 0, 'transform allowed rows');
requireEqual(boundary.transform_allowed?.allowed_now, false, 'transform allowed now');
requireEqual(boundary.candidate_text_policy?.policy, 'no_candidate_text_emitted', 'candidate text policy');
requireEqual(boundary.display_prehud_gate?.active_output_allowed, false, 'active output gate');
requireEqual(boundary.display_prehud_gate?.display_eligible, false, 'display gate');
requireEqual(boundary.display_prehud_gate?.prehud_allowed, false, 'preHUD gate');
requireEqual(boundary.display_prehud_gate?.page_render_allowed, false, 'page render gate');
if (!boundary.blockers?.some((row) => row.blocker_id === 'no_active_transform_render_use_authorization')) {
  errors.push('missing no_active_transform_render_use_authorization blocker');
}

requireEqual(builderSpec.artifact_type, 'a14_dictionary_corpus_candidate_matrix_builder_spec', 'builder spec artifact_type');
requireEqual(builderSpec.status, 'spec_ready_blocked_pending_source_row_contract', 'builder spec status');
requireEqual(builderSpec.boundary?.active_lexical_source_layer_mutation, false, 'builder active source-layer boundary');
requireEqual(builderSpec.boundary?.candidate_text_emission, false, 'builder candidate text boundary');
requireEqual(builderSpec.boundary?.prehud_display_promotion, false, 'builder preHUD boundary');
requireEqual(builderSpec.row_defaults?.transform_allowed, false, 'builder transform default');
requireEqual(builderSpec.row_defaults?.display_eligible, false, 'builder display default');
requireEqual(builderSpec.row_defaults?.prehud_allowed, false, 'builder preHUD default');
requireEqual(builderSpec.row_defaults?.candidate_text_present, false, 'builder candidate text present default');
for (const field of [
  'token_id',
  'work_id',
  'normalized_surface',
  'source_family',
  'license_lane',
  'relation_class',
  'occurrence_count',
  'source_ref',
  'transform_allowed',
  'display_eligible',
  'prehud_allowed',
  'blocker',
]) {
  if (!builderSpec.planned_row_shape?.includes(field)) errors.push(`builder row shape missing ${field}`);
}

const forbiddenHits = [
  ...scanForbiddenTruthyKeys(boundary),
  ...scanForbiddenTruthyKeys(builderSpec),
];
if (forbiddenHits.length) errors.push(`truthy forbidden fields: ${forbiddenHits.slice(0, 20).join(', ')}`);
if (!boundaryMd.includes('No rows are transform-ready now.')) errors.push('boundary markdown missing transform block text');
if (!builderSpecMd.includes('Status: `spec_ready_blocked_pending_source_row_contract`.')) errors.push('builder spec markdown missing status');

if (errors.length) {
  console.error(`Orot dictionary transform boundary validation failed (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Orot dictionary transform boundary validation passed: 5 token ids, 0 transform rows, preHUD/display/active output closed.');
