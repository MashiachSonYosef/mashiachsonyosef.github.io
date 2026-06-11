#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

const FILES = {
  manifest: 'reports/a14-pipeline-preservation-manifest-v1-2026-06-11.json',
  pageSpec: 'reports/a14-page-output-pipeline-v1-executable-spec-2026-06-11.json',
  crossmatchSpec: 'reports/a14-crossmatch-packet-v1-executable-spec-2026-06-11.json',
  phraseMatrix: 'reports/agent3-a14-phrase-abbrev-pattern-crossmatch-matrix-2026-06-11.json',
  phraseBuilder: 'scripts/build_agent3_phrase_abbrev_crossmatch_matrix.mjs',
  phraseValidator: 'scripts/validate_agent3_phrase_abbrev_crossmatch_matrix.mjs',
  dictionarySpec: 'reports/a14-dictionary-nc-corpus-expansion-pipeline-spec-2026-06-11.json',
  dictionaryMatrix: 'reports/a14-dictionary-nc-corpus-coverage-matrix-2026-06-11.json',
  dictionaryClearanceRequest: 'reports/a14-a1-a6-orot-dictionary-clearance-request-2026-06-11.json',
  dictionaryTransformBlocker: 'reports/a14-orot-dictionary-transform-readiness-blocker-2026-06-11.json',
  dictionaryTransformBoundary: 'reports/a14-orot-dictionary-transform-boundary-2026-06-11.json',
  dictionaryCandidateBuilderSpec: 'reports/a14-dictionary-corpus-candidate-matrix-builder-spec-2026-06-11.json',
  dictionaryBuilder: 'scripts/build_a14_dictionary_nc_corpus_coverage_matrix.mjs',
  dictionaryValidator: 'scripts/validate_a14_dictionary_nc_corpus_coverage_matrix.mjs',
  dictionaryTransformBoundaryValidator: 'scripts/validate_a14_orot_dictionary_transform_boundary.mjs',
  sourceLayer: 'data/lexical/source-layers/project-abbreviations.json',
};

const REQUIRED_MANIFEST_ROWS = [
  'book_page_contract_v1',
  'route_hud_contract_v1',
  'page_output_pipeline_v1',
  'render_intake_packet_v1',
  'crossmatch_packet_v1',
  'a3_phrase_abbrev_matrix_contract_v1',
  'source_lane_contract_v1',
  'dictionary_nc_corpus_expansion_pipeline_v1',
  'definition_transform_readiness_packet_v1',
  'repo_clean_packet_v1',
];

const REQUIRED_ROW_FIELDS = [
  'pipeline_id',
  'target_output',
  'canonical_artifacts',
  'input_manifest',
  'commands',
  'timeouts',
  'expected_outputs',
  'dirty_buckets',
  'validators',
  'proof_artifacts',
  'blocker_shape',
  'owner_slot',
  'model_floor',
  'next_owner',
  'gate',
  'forbidden_authority_claims',
  'stop_condition',
  'status',
];

const REQUIRED_PAGE_INVARIANTS = [
  'book_header',
  'source_passage',
  'prehud_rows',
  'source_to_prehud_jump',
  'hud_open',
  'scroll_lock',
  'selected_vs_alternatives',
  'source_license',
  'match_basis',
  'quiet_tbd',
  'evidence_only',
  'stale_markers',
];

const REQUIRED_DIRTY_BUCKETS = [
  'page_html',
  'shared_runtime_css_js',
  'lexical_source_layer',
  'lexical_payload_chunks',
  'token_index',
  'search_ranker_stats',
  'definition_gap_manifest',
  'reader_hints_route_lookup',
  'proof_report',
  'unrelated_dirt',
  'blocked_review',
];

const REQUIRED_RENDER_PACKET_FIELDS = [
  'packet_id',
  'target_pages',
  'target_work_ids',
  'changed_inputs',
  'render_command',
  'timeout_ms',
  'expected_outputs',
  'dirty_buckets',
  'validators',
  'proof_artifacts',
  'blocker_shape',
  'next_owner',
  'stop_condition',
  'authority_boundary',
];

const FORBIDDEN_AUTHORITY_KEYS = new Set([
  'definition',
  'definition_text',
  'meaning',
  'translation',
  'accepted_translation',
  'answer',
  'answer_eligible',
  'winner',
  'route_payload',
  'route_payloads',
  'public_emit',
]);

const errors = [];
const warnings = [];

function fullPath(relPath) {
  return path.join(ROOT, relPath);
}

function exists(relPath) {
  return fs.existsSync(fullPath(relPath));
}

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(fullPath(relPath), 'utf8'));
}

function requireFile(relPath, label = relPath) {
  if (!exists(relPath)) errors.push(`${label}: missing file ${relPath}`);
}

function requireEqual(actual, expected, label) {
  if (actual !== expected) errors.push(`${label}: expected ${expected}, got ${actual}`);
}

function requireIncludes(list, value, label) {
  if (!Array.isArray(list) || !list.includes(value)) errors.push(`${label}: missing ${value}`);
}

function requireAllIncludes(list, values, label) {
  for (const value of values) requireIncludes(list, value, label);
}

function rowsById(rows) {
  return new Map((rows || []).map((row) => [row.pipeline_id, row]));
}

function compactCommand(command) {
  return String(command || '').replace(/\s+/g, ' ').trim();
}

function isTruthyAuthorityValue(value) {
  if (value === false || value === null || value === undefined || value === 0 || value === '') return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
}

function scanForbiddenAuthorityKeys(value, hits = []) {
  if (!value || typeof value !== 'object') return hits;
  if (Array.isArray(value)) {
    for (const item of value) scanForbiddenAuthorityKeys(item, hits);
    return hits;
  }
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_AUTHORITY_KEYS.has(key) && isTruthyAuthorityValue(child)) hits.push(key);
    scanForbiddenAuthorityKeys(child, hits);
  }
  return hits;
}

function validateManifest(manifest) {
  requireEqual(manifest.artifact_type, 'pipeline_preservation_manifest_v1', 'manifest artifact_type');
  requireEqual(manifest.status, 'approved_with_required_hardening', 'manifest status');
  requireEqual(manifest.boundary?.planning_spec_only, true, 'manifest planning boundary');
  requireEqual(manifest.boundary?.release_publication_runtime_acceptance, false, 'manifest release boundary');
  requireEqual(manifest.boundary?.source_license_legal_acceptance, false, 'manifest source/license boundary');
  requireEqual(manifest.boundary?.definition_answer_accepted_text_acceptance, false, 'manifest definition boundary');

  for (const relPath of Object.values(manifest.golden_fixtures || {})) requireFile(relPath, 'manifest golden fixture');
  for (const relPath of manifest.source_feedback_artifacts || []) requireFile(relPath, 'manifest source feedback artifact');
  requireIncludes((manifest.spec_validators || []).map((row) => row.command), 'node scripts/validate_a14_pipeline_specs.mjs', 'manifest spec validators');
  requireAllIncludes(manifest.dirty_bucket_vocabulary, REQUIRED_DIRTY_BUCKETS, 'manifest dirty buckets');
  requireAllIncludes(manifest.forbidden_global_authority_claims, ['Definition authority', 'accepted gloss/text', 'public-runtime acceptance'], 'manifest forbidden claims');

  const rowMap = rowsById(manifest.manifest_rows);
  for (const id of REQUIRED_MANIFEST_ROWS) {
    if (!rowMap.has(id)) errors.push(`manifest rows: missing ${id}`);
  }
  for (const row of manifest.manifest_rows || []) {
    for (const field of REQUIRED_ROW_FIELDS) {
      if (!(field in row)) errors.push(`${row.pipeline_id || 'unknown row'}: missing required row field ${field}`);
    }
    for (const relPath of row.canonical_artifacts || []) {
      if (!relPath.includes('<') && !relPath.startsWith('missing:')) requireFile(relPath, `${row.pipeline_id} canonical artifact`);
    }
    for (const relPath of row.proof_artifacts || []) {
      if (!relPath.includes('<') && !relPath.startsWith('missing:')) requireFile(relPath, `${row.pipeline_id} proof artifact`);
    }
  }

  const book = rowMap.get('book_page_contract_v1');
  requireAllIncludes(book?.invariants, ['no stale tok-* leakage text in rendered row content', 'no LTR Hebrew rendering regression in source layout'], 'book invariants');
  const hud = rowMap.get('route_hud_contract_v1');
  requireAllIncludes(hud?.invariants, ['body scroll lock while HUD is open', 'HUD source/license area always inspectable'], 'HUD invariants');
  const page = rowMap.get('page_output_pipeline_v1');
  requireIncludes(page?.proof_artifacts, FILES.pageSpec, 'page output proof artifacts');
  const phrase = rowMap.get('a3_phrase_abbrev_matrix_contract_v1');
  requireEqual(phrase?.status, 'draft_ready', 'phrase matrix manifest row status');
  requireIncludes(phrase?.commands?.map(compactCommand), 'node scripts/build_agent3_phrase_abbrev_crossmatch_matrix.mjs', 'phrase matrix commands');
  requireIncludes(phrase?.validators, 'scripts/validate_agent3_phrase_abbrev_crossmatch_matrix.mjs', 'phrase matrix validators');
  const crossmatch = rowMap.get('crossmatch_packet_v1');
  requireEqual(crossmatch?.status, 'spec_incomplete', 'general crossmatch manifest row status');
  requireIncludes(crossmatch?.proof_artifacts, FILES.crossmatchSpec, 'general crossmatch proof artifacts');
  const dictionary = rowMap.get('dictionary_nc_corpus_expansion_pipeline_v1');
  requireEqual(dictionary?.status, 'draft_ready_evidence_first', 'dictionary/NC manifest row status');
  requireIncludes(dictionary?.commands?.map(compactCommand), 'node scripts/build_a14_dictionary_nc_corpus_coverage_matrix.mjs', 'dictionary/NC commands');
  requireIncludes(dictionary?.validators, 'scripts/validate_a14_dictionary_nc_corpus_coverage_matrix.mjs', 'dictionary/NC validators');
  requireIncludes(dictionary?.validators, 'scripts/validate_a14_orot_dictionary_transform_boundary.mjs', 'dictionary/NC transform boundary validator');
  requireIncludes(dictionary?.proof_artifacts, 'reports/a14-orot-dictionary-transform-readiness-blocker-2026-06-11.md', 'dictionary/NC proof artifacts');
}

function validatePageSpec(pageSpec) {
  requireEqual(pageSpec.artifact_type, 'page_output_pipeline_v1_executable_spec', 'page spec artifact_type');
  requireEqual(pageSpec.pipeline_id, 'page_output_pipeline_v1', 'page spec pipeline_id');
  requireEqual(pageSpec.boundary?.planning_spec_only, true, 'page spec planning boundary');
  requireEqual(pageSpec.boundary?.definition_answer_accepted_text_acceptance, false, 'page spec definition boundary');
  requireEqual(pageSpec.embedded_packet?.packet_id, 'render_intake_packet_v1', 'embedded packet id');
  requireAllIncludes(pageSpec.embedded_packet?.required_fields, REQUIRED_RENDER_PACKET_FIELDS, 'render intake fields');
  if (Number(pageSpec.embedded_packet?.minimum_timeout_ms || 0) < 300000) errors.push('render intake minimum timeout must be at least 300000');
  for (const fixture of pageSpec.golden_fixtures || []) requireFile(fixture.path, `page spec fixture ${fixture.fixture_role}`);
  requireAllIncludes((pageSpec.validators || []).map((row) => row.id), ['route_hud_page', 'reader_hints', 'definition_outputs', 'gap_manifest', 'diff_check'], 'page spec validators');
  requireAllIncludes((pageSpec.page_hud_invariants || []).map((row) => row.invariant_id), REQUIRED_PAGE_INVARIANTS, 'page spec invariants');
  requireAllIncludes((pageSpec.dirty_buckets || []).map((row) => row.bucket), REQUIRED_DIRTY_BUCKETS, 'page spec dirty buckets');
  for (const row of pageSpec.page_hud_invariants || []) {
    if (!String(row.fail_shape || '').includes('|')) errors.push(`${row.invariant_id}: fail_shape must be pipe-delimited`);
  }
}

function validateCrossmatchSpec(crossmatchSpec) {
  requireEqual(crossmatchSpec.artifact_type, 'crossmatch_packet_v1_executable_spec', 'crossmatch spec artifact_type');
  requireEqual(crossmatchSpec.boundary?.evidence_navigation_only, true, 'crossmatch spec evidence boundary');
  requireEqual(crossmatchSpec.boundary?.definition_answer_accepted_text_acceptance, false, 'crossmatch spec definition boundary');
  requireEqual(crossmatchSpec.boundary?.prehud_authority, false, 'crossmatch spec preHUD boundary');
  requireAllIncludes(crossmatchSpec.required_row_fields, ['display_eligible', 'hud_inspectable', 'prehud_allowed', 'evidence_only_reason', 'blocker'], 'crossmatch required row fields');
  requireAllIncludes((crossmatchSpec.match_families || []).map((row) => row.match_family), [
    'strict_hebrew',
    'strict_aramaic',
    'prefix_stem_suffix',
    'lemma_only',
    'crossmatch',
    'usage_evidence',
    'morphology_form_reference',
    'phrase_abbrev_matrix',
  ], 'crossmatch match families');
  requireEqual(crossmatchSpec.gates?.display_eligible_default, false, 'crossmatch display default');
  requireEqual(crossmatchSpec.gates?.prehud_allowed_default, false, 'crossmatch preHUD default');
  requireEqual(crossmatchSpec.gates?.payload_copy_allowed, false, 'crossmatch payload copy gate');
  requireEqual(crossmatchSpec.remaining_generalization_blocker?.missing_general_builder, true, 'crossmatch general builder blocker');
  requireEqual(crossmatchSpec.remaining_generalization_blocker?.missing_general_validator, true, 'crossmatch general validator blocker');
  for (const subtype of crossmatchSpec.current_runnable_subtypes || []) {
    requireFile(subtype.builder, `${subtype.subtype} builder`);
    requireFile(subtype.validator, `${subtype.subtype} validator`);
    requireFile(subtype.output, `${subtype.subtype} output`);
  }
}

function validatePhraseMatrix(matrix, sourceLayer) {
  requireEqual(matrix.artifact_type, 'agent3_a14_phrase_abbrev_pattern_crossmatch_matrix', 'phrase matrix artifact_type');
  requireEqual(matrix.status, 'evidence_matrix_ready', 'phrase matrix status');
  requireEqual(matrix.authority_boundary?.evidence_navigation_only, true, 'phrase matrix evidence boundary');
  requireEqual(matrix.authority_boundary?.definition_authority, false, 'phrase matrix definition boundary');
  requireEqual(matrix.authority_boundary?.prehud_authority, false, 'phrase matrix preHUD boundary');
  const rows = matrix.matrix_rows || [];
  requireEqual(matrix.counts?.source_entry_count, (sourceLayer.entries || []).length, 'phrase matrix source entry count');
  requireEqual(matrix.counts?.matrix_rows, rows.length, 'phrase matrix row count');
  requireEqual(matrix.counts?.rows_with_occurrence_evidence, rows.filter((row) => row.occurrence_count > 0).length, 'phrase matrix linked row count');
  requireEqual(matrix.counts?.forbidden_authority_field_hits, 0, 'phrase matrix forbidden authority hits');
  if (matrix.counts?.rows_with_occurrence_evidence < rows.length - 1) warnings.push('phrase matrix has more than one no-occurrence row');
  if (matrix.counts?.total_occurrence_count <= 0) errors.push('phrase matrix total occurrences must be positive');
  for (const row of rows) {
    if (row.display_eligible !== false || row.prehud_allowed !== false || row.reader_facing !== false || row.not_definition_authority !== true) {
      errors.push(`${row.pattern_id}: phrase matrix display boundary flags invalid`);
    }
  }
  const forbiddenHits = scanForbiddenAuthorityKeys(matrix);
  if (forbiddenHits.length) errors.push(`phrase matrix has truthy forbidden authority fields: ${forbiddenHits.slice(0, 10).join(', ')}`);
}

function validateDictionaryNcPipeline(dictionarySpec, matrix, clearanceRequest, transformBlocker) {
  requireEqual(dictionarySpec.artifact_type, 'a14_dictionary_nc_corpus_expansion_pipeline_spec', 'dictionary spec artifact_type');
  requireEqual(dictionarySpec.status, 'draft_ready_evidence_first_no_active_dictionary_output', 'dictionary spec status');
  requireEqual(dictionarySpec.boundary?.planning_and_evidence_only, true, 'dictionary spec evidence boundary');
  requireEqual(dictionarySpec.boundary?.source_license_legal_acceptance, false, 'dictionary spec source/license boundary');
  requireEqual(dictionarySpec.boundary?.active_lexical_source_layer_mutation, false, 'dictionary spec active source-layer boundary');
  requireEqual(dictionarySpec.boundary?.prehud_display_promotion, false, 'dictionary spec preHUD boundary');
  requireEqual(matrix.artifact_type, 'a14_dictionary_nc_corpus_coverage_matrix', 'dictionary matrix artifact_type');
  requireEqual(matrix.status, 'evidence_matrix_ready_no_active_dictionary_or_nc_output', 'dictionary matrix status');
  requireEqual(matrix.boundary?.old_dictionary_active_output_allowed, false, 'dictionary matrix active output boundary');
  requireEqual(matrix.boundary?.old_dictionary_prehud_allowed, false, 'dictionary matrix preHUD boundary');
  requireEqual(matrix.boundary?.old_dictionary_display_eligible, false, 'dictionary matrix display boundary');
  requireEqual(matrix.counts?.coverage_json_files, 1353, 'dictionary matrix coverage count');
  requireEqual(matrix.counts?.unresolved_csv_files, 1353, 'dictionary matrix unresolved count');
  requireEqual(matrix.counts?.works_with_old_dictionary_candidate_hits, 1, 'dictionary matrix matched work count');
  requireEqual(clearanceRequest.artifact_type, 'a14_a1_a6_orot_dictionary_clearance_request', 'dictionary clearance request artifact_type');
  requireEqual(clearanceRequest.status, 'request_ready_orot_only_no_active_output', 'dictionary clearance request status');
  requireEqual(clearanceRequest.boundary?.active_lexical_source_layer_mutation, false, 'dictionary clearance active source-layer boundary');
  requireEqual(clearanceRequest.row_subset?.unique_token_ids, 5, 'dictionary clearance token count');
  requireEqual(transformBlocker.artifact_type, 'a14_orot_dictionary_transform_readiness_blocker', 'dictionary transform blocker artifact_type');
  requireEqual(transformBlocker.status, 'blocked_no_active_transform_or_render', 'dictionary transform blocker status');
  requireEqual(transformBlocker.current_decision?.A2_transform_readiness_allowed_now, false, 'dictionary transform A2 gate');
  requireEqual(transformBlocker.current_decision?.prehud_allowed, false, 'dictionary transform preHUD gate');
  requireEqual(transformBlocker.current_decision?.display_eligible, false, 'dictionary transform display gate');
  requireEqual(transformBlocker.current_decision?.active_output_allowed, false, 'dictionary transform active output gate');
}

function validateOrotDictionaryTransformBoundary(transformBoundary, candidateBuilderSpec) {
  requireEqual(transformBoundary.artifact_type, 'a14_orot_dictionary_transform_boundary', 'Orot transform boundary artifact_type');
  requireEqual(transformBoundary.status, 'blocked_no_active_transform_or_render', 'Orot transform boundary status');
  requireEqual(transformBoundary.target?.work_id, 'orot', 'Orot transform boundary target');
  requireEqual(transformBoundary.exact_token_subset?.unique_token_ids, 5, 'Orot transform boundary token count');
  requireEqual(transformBoundary.exact_token_subset?.commercial_clean_candidate?.source_family, 'Jastrow Dictionary', 'Orot Jastrow source family');
  requireEqual(transformBoundary.exact_token_subset?.commercial_clean_candidate?.license_lane, 'commercial_clean_candidate', 'Orot Jastrow lane');
  requireEqual(transformBoundary.exact_token_subset?.noncommercial_educational_candidate?.source_family, 'Klein Dictionary', 'Orot Klein source family');
  requireEqual(transformBoundary.exact_token_subset?.noncommercial_educational_candidate?.license_lane, 'noncommercial_educational_candidate', 'Orot Klein lane');
  requireEqual(transformBoundary.transform_allowed?.rows, 0, 'Orot transform allowed rows');
  requireEqual(transformBoundary.transform_allowed?.allowed_now, false, 'Orot transform allowed now');
  requireEqual(transformBoundary.candidate_text_policy?.candidate_text_present, false, 'Orot candidate text present');
  requireEqual(transformBoundary.candidate_text_policy?.candidate_text_emitted, false, 'Orot candidate text emitted');
  requireEqual(transformBoundary.display_prehud_gate?.active_output_allowed, false, 'Orot active output gate');
  requireEqual(transformBoundary.display_prehud_gate?.display_eligible, false, 'Orot display gate');
  requireEqual(transformBoundary.display_prehud_gate?.prehud_allowed, false, 'Orot preHUD gate');
  requireEqual(transformBoundary.display_prehud_gate?.page_render_allowed, false, 'Orot page render gate');
  if (!transformBoundary.blockers?.some((row) => row.blocker_id === 'no_active_transform_render_use_authorization')) {
    errors.push('Orot transform boundary: missing no_active_transform_render_use_authorization blocker');
  }

  requireEqual(candidateBuilderSpec.artifact_type, 'a14_dictionary_corpus_candidate_matrix_builder_spec', 'candidate builder spec artifact_type');
  requireEqual(candidateBuilderSpec.status, 'spec_ready_blocked_pending_source_row_contract', 'candidate builder spec status');
  requireEqual(candidateBuilderSpec.boundary?.active_lexical_source_layer_mutation, false, 'candidate builder active source-layer boundary');
  requireEqual(candidateBuilderSpec.boundary?.candidate_text_emission, false, 'candidate builder candidate-text boundary');
  requireEqual(candidateBuilderSpec.boundary?.prehud_display_promotion, false, 'candidate builder preHUD boundary');
  requireAllIncludes(candidateBuilderSpec.planned_row_shape, [
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
  ], 'candidate builder planned row shape');
  requireEqual(candidateBuilderSpec.row_defaults?.transform_allowed, false, 'candidate builder transform default');
  requireEqual(candidateBuilderSpec.row_defaults?.display_eligible, false, 'candidate builder display default');
  requireEqual(candidateBuilderSpec.row_defaults?.prehud_allowed, false, 'candidate builder preHUD default');
  requireEqual(candidateBuilderSpec.row_defaults?.candidate_text_present, false, 'candidate builder candidate text default');
}

for (const relPath of Object.values(FILES)) requireFile(relPath);

const manifest = readJson(FILES.manifest);
const pageSpec = readJson(FILES.pageSpec);
const crossmatchSpec = readJson(FILES.crossmatchSpec);
const phraseMatrix = readJson(FILES.phraseMatrix);
const dictionarySpec = readJson(FILES.dictionarySpec);
const dictionaryMatrix = readJson(FILES.dictionaryMatrix);
const dictionaryClearanceRequest = readJson(FILES.dictionaryClearanceRequest);
const dictionaryTransformBlocker = readJson(FILES.dictionaryTransformBlocker);
const dictionaryTransformBoundary = readJson(FILES.dictionaryTransformBoundary);
const dictionaryCandidateBuilderSpec = readJson(FILES.dictionaryCandidateBuilderSpec);
const sourceLayer = readJson(FILES.sourceLayer);

validateManifest(manifest);
validatePageSpec(pageSpec);
validateCrossmatchSpec(crossmatchSpec);
validatePhraseMatrix(phraseMatrix, sourceLayer);
validateDictionaryNcPipeline(dictionarySpec, dictionaryMatrix, dictionaryClearanceRequest, dictionaryTransformBlocker);
validateOrotDictionaryTransformBoundary(dictionaryTransformBoundary, dictionaryCandidateBuilderSpec);

for (const warning of warnings) console.warn(`WARN ${warning}`);
if (errors.length) {
  console.error(`A14 pipeline spec validation failed (${errors.length})`);
  for (const error of errors.slice(0, 120)) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `A14 pipeline spec validation passed: manifest rows ${(manifest.manifest_rows || []).length}; ` +
  `page invariants ${(pageSpec.page_hud_invariants || []).length}; ` +
  `phrase rows ${(phraseMatrix.matrix_rows || []).length}; ` +
  `linked phrase rows ${phraseMatrix.counts?.rows_with_occurrence_evidence}.`
);
