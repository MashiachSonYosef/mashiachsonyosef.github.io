#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportPath = process.argv[2] || 'reports/agent1-orot-sefaria-nc-aware-family-custody-boundary-2026-06-03.json';
const report = readJson(reportPath);
const issues = [];

const requiredFamilies = [
  'BDB Dictionary',
  'BDB Aramaic Dictionary',
  'Jastrow Dictionary',
  'Klein Dictionary',
  'BDB Augmented Strong',
];

const allowedStatuses = new Set([
  'commercial_clean_candidate',
  'noncommercial_educational_candidate',
  'metadata_only',
  'external_link_only',
  'blocked',
]);

const requiredFamilyFields = [
  'family',
  'observed_license_source_basis',
  'status',
  'storage_allowed',
  'noncommercial_display_allowed',
  'commercial_export_prohibited',
  'attribution_required',
  'attribution_text_or_link_required',
  'source_custody_manifest_required',
  'transformed_reader_hint_allowed',
  'metadata_only_allowed',
  'external_link_only_allowed',
  'exact_blocker_if_blocked',
];

expect(report.schema_version === 1, 'schema_version must be 1');
expect(report.artifact_type === 'agent1_orot_sefaria_nc_aware_family_custody_boundary', 'unexpected artifact_type');

const boundary = report.boundary || {};
for (const flag of [
  'evidence_only',
  'family_specific_custody_display_boundary_only',
  'no_answer_rows',
  'no_source_rows',
  'no_public_hud_rows',
  'no_route_jsonl_rows',
  'no_runtime_mutation',
  'no_source_mutation',
  'no_token_index_mutation',
  'no_lexical_payload_mutation',
  'no_nc_definition_content_storage',
  'no_public_mutation',
  'no_license_acceptance',
  'no_source_provenance_acceptance',
  'no_qa_acceptance',
  'no_definition_authority',
  'no_usage_as_definition_authority',
  'no_answer_acceptance',
  'no_public_runtime_acceptance',
  'no_publication_readiness',
  'no_product_data_acceptance',
  'no_translation_output',
  'no_accepted_gloss',
  'no_accepted_text',
]) {
  expect(boundary[flag] === true, `boundary.${flag} must be true`);
}

expect(Array.isArray(boundary.exact_family_scope), 'boundary.exact_family_scope must be an array');
expect(sameSet(boundary.exact_family_scope || [], requiredFamilies), 'boundary family scope must match exact five families');

expectSafeExistingPath(report.inputs_checked?.request_json, 'request_json');
expectSafeExistingPath(report.inputs_checked?.request_markdown, 'request_markdown');
for (const input of report.inputs_checked?.supporting_inputs || []) {
  expectSafeExistingPath(input, `supporting input ${input}`);
}

expect(Array.isArray(report.status_options_used), 'status_options_used must be an array');
expect(sameSet(report.status_options_used || [], [...allowedStatuses]), 'status_options_used must match requested status schema');

const scope = report.measurement_scope || {};
expect(scope.scoped_rows === 500, 'scoped_rows must be 500');
expect(scope.scoped_occurrences === 8427, 'scoped_occurrences must be 8427');
expect(scope.commercial_clean_candidate_rows === 297, 'commercial clean rows must be 297');
expect(scope.commercial_clean_candidate_occurrences === 5747, 'commercial clean occurrences must be 5747');
expect(scope.additional_nc_educational_candidate_rows === 17, 'NC rows must be 17');
expect(scope.additional_nc_educational_candidate_occurrences === 259, 'NC occurrences must be 259');
expect(scope.commercial_clean_plus_nc_rows === 314, 'combined rows must be 314');
expect(scope.commercial_clean_plus_nc_occurrences === 6006, 'combined occurrences must be 6006');
expect(scope.remaining_no_hit_or_unusable_rows === 186, 'remaining rows must be 186');
expect(scope.remaining_no_hit_or_unusable_occurrences === 2421, 'remaining occurrences must be 2421');

const summary = report.summary || {};
expect(summary.families_reviewed === 5, 'families_reviewed must be 5');
expect(summary.status_counts?.commercial_clean_candidate === 3, 'must have three commercial_clean_candidate families');
expect(summary.status_counts?.noncommercial_educational_candidate === 1, 'must have one NC educational family');
expect(summary.status_counts?.metadata_only === 0, 'metadata_only count must be 0');
expect(summary.status_counts?.external_link_only === 0, 'external_link_only count must be 0');
expect(summary.status_counts?.blocked === 1, 'blocked count must be 1');
expect(summary.nc_exclusion_rows === 17, 'summary NC rows must be 17');
expect(summary.nc_exclusion_occurrences === 259, 'summary NC occurrences must be 259');
expect(summary.agent1_evidence_ready_for_agent6_review === true, 'Agent 6 review readiness must be true');
expect(summary.public_mutation_allowed_now === false, 'public mutation must be false');
expect(summary.answer_emission_allowed_now === false, 'answer emission must be false');
expect(summary.route_publication_support_claimed === false, 'route publication support claim must be false');

const familyRows = report.family_boundaries || [];
expect(familyRows.length === 5, 'family_boundaries length must be 5');
expect(sameSet(familyRows.map((row) => row.family), requiredFamilies), 'family_boundaries must cover exact required families');
for (const row of familyRows) {
  for (const field of requiredFamilyFields) {
    expect(Object.hasOwn(row, field), `${row.family || 'family row'} missing field ${field}`);
  }
  expect(allowedStatuses.has(row.status), `${row.family} has invalid status ${row.status}`);
  expect(typeof row.observed_license_source_basis === 'object' && row.observed_license_source_basis, `${row.family} missing observed basis`);
  expect(typeof row.storage_allowed === 'boolean', `${row.family}.storage_allowed must be boolean`);
  expect(typeof row.noncommercial_display_allowed === 'boolean', `${row.family}.noncommercial_display_allowed must be boolean`);
  expect(typeof row.commercial_export_prohibited === 'boolean', `${row.family}.commercial_export_prohibited must be boolean`);
  expect(typeof row.attribution_required === 'boolean', `${row.family}.attribution_required must be boolean`);
  expect(typeof row.attribution_text_or_link_required === 'string' && row.attribution_text_or_link_required.length > 0, `${row.family} attribution text/link required`);
  expect(row.source_custody_manifest_required === true, `${row.family} source custody manifest must be required`);
  expect(typeof row.transformed_reader_hint_allowed === 'boolean', `${row.family}.transformed_reader_hint_allowed must be boolean`);
  expect(typeof row.metadata_only_allowed === 'boolean', `${row.family}.metadata_only_allowed must be boolean`);
  expect(typeof row.external_link_only_allowed === 'boolean', `${row.family}.external_link_only_allowed must be boolean`);
  expect(row.allowed_now_by_this_artifact === false, `${row.family} must not be allowed now by this artifact`);
  expect(row.agent6_review_required_before_emit === true, `${row.family} must require Agent 6 before emit`);
  if (row.status === 'blocked') {
    expect(typeof row.exact_blocker_if_blocked === 'string' && row.exact_blocker_if_blocked.length > 0, `${row.family} must name blocker`);
  } else {
    expect(row.exact_blocker_if_blocked === null, `${row.family} non-blocked row must use null blocker`);
  }
}

expect(family('BDB Dictionary')?.status === 'commercial_clean_candidate', 'BDB Dictionary status mismatch');
expect(family('BDB Aramaic Dictionary')?.status === 'commercial_clean_candidate', 'BDB Aramaic status mismatch');
expect(family('Jastrow Dictionary')?.status === 'commercial_clean_candidate', 'Jastrow status mismatch');
expect(family('Klein Dictionary')?.status === 'noncommercial_educational_candidate', 'Klein status mismatch');
expect(family('BDB Augmented Strong')?.status === 'blocked', 'BDB Augmented Strong status mismatch');
for (const name of ['BDB Dictionary', 'BDB Aramaic Dictionary', 'Jastrow Dictionary']) {
  const row = family(name);
  expect(row.observed_license_source_basis?.observed_license === 'Public Domain', `${name} observed license must be Public Domain`);
  expect(row.storage_allowed === true, `${name} storage evidence posture must be true`);
  expect(row.transformed_reader_hint_allowed === true, `${name} transformed reader hint evidence posture must be true`);
  expect(row.commercial_export_prohibited === false, `${name} commercial export should not be prohibited by observed PD posture`);
}
const klein = family('Klein Dictionary');
expect(klein.observed_license_source_basis?.observed_license === 'CC-BY-NC', 'Klein observed license must be CC-BY-NC');
expect(klein.commercial_export_prohibited === true, 'Klein commercial export must be prohibited');
expect(klein.attribution_required === true, 'Klein attribution must be required');
expect(klein.agent1_evidence_sufficient_for_noncommercial_display_review === true, 'Klein must explicitly mark Agent 1 evidence sufficient for NC display review');
expect(klein.nc_definition_content_stored_here === false, 'Klein must not store NC definition content here');
expect(klein.corpus_contamination === false, 'Klein must not contaminate corpus');
expect(family('BDB Augmented Strong')?.storage_allowed === false, 'BDB Augmented Strong storage must be false');
expect(family('BDB Augmented Strong')?.transformed_reader_hint_allowed === false, 'BDB Augmented Strong transform must be false');

const ncRows = report.nc_commercial_export_exclusion_rows || [];
expect(ncRows.length === 17, 'NC exclusion rows length must be 17');
expect(ncRows.reduce((sum, row) => sum + row.occurrences, 0) === 259, 'NC exclusion occurrences must sum to 259');
const seenTokens = new Set();
for (const row of ncRows) {
  expect(row.family === 'Klein Dictionary', `${row.token_id} family must be Klein Dictionary`);
  expect(row.token_id && !seenTokens.has(row.token_id), `duplicate or missing token_id ${row.token_id}`);
  seenTokens.add(row.token_id);
  expect(row.license_group === 'CC_BY_NC', `${row.token_id} license_group must be CC_BY_NC`);
  expect(row.derived_from_nc === true, `${row.token_id} derived_from_nc must be true`);
  expect(row.commercial_export_allowed === false, `${row.token_id} commercial_export_allowed must be false`);
  expect(row.noncommercial_display_allowed === true, `${row.token_id} noncommercial_display_allowed must be true after explicit Agent1 evidence posture`);
  expect(row.attribution_required === true, `${row.token_id} attribution_required must be true`);
  expect(row.corpus_contamination === false, `${row.token_id} corpus_contamination must be false`);
  expect(row.storage_allowed === true, `${row.token_id} storage evidence posture must be true`);
  expect(row.transformed_reader_hint_allowed === true, `${row.token_id} reader-hint evidence posture must be true`);
  expect(row.allowed_now_by_this_artifact === false, `${row.token_id} must not be allowed now by this artifact`);
}

const outputs = report.outputs || {};
for (const key of [
  'answer_rows_emitted',
  'source_rows_emitted',
  'public_hud_rows_emitted',
  'route_jsonl_rows_emitted',
  'nc_definition_content_rows_stored',
]) {
  expect(outputs[key] === 0, `outputs.${key} must be 0`);
}
for (const key of [
  'runtime_files_touched',
  'source_files_touched',
  'token_index_files_touched',
  'lexical_payload_files_touched',
  'public_mutation_files_touched',
]) {
  expect(Array.isArray(outputs[key]) && outputs[key].length === 0, `outputs.${key} must be empty`);
}

const callback = report.agent8_callback || {};
expect(callback.status === 'agent1_orot_sefaria_nc_aware_family_custody_boundary_produced', 'Agent 8 callback status mismatch');
expect(callback.artifact_path === 'reports/agent1-orot-sefaria-nc-aware-family-custody-boundary-2026-06-03.md', 'Agent 8 callback artifact path mismatch');
expect(callback.artifact_json === 'reports/agent1-orot-sefaria-nc-aware-family-custody-boundary-2026-06-03.json', 'Agent 8 callback artifact JSON mismatch');
expect(callback.agent6_review_ready === true, 'Agent 8 callback must say Agent 6 review is ready');
expect(callback.direct_delivery_status === 'Agent 8 direct callback delivery unavailable; callback requires relay.', 'Agent 8 callback delivery status mismatch');
for (const name of requiredFamilies) {
  expect(callback.statuses?.[name] === family(name)?.status, `callback status mismatch for ${name}`);
}

const jsonText = fs.readFileSync(path.join(root, reportPath), 'utf8');
for (const forbidden of [
  '"license_acceptance": true',
  '"source_provenance_acceptance": true',
  '"source_acceptance": true',
  '"qa_acceptance": true',
  '"definition_authority": true',
  '"usage_as_definition_authority": true',
  '"answer_acceptance": true',
  '"public_runtime_acceptance": true',
  '"publication_readiness": true',
  '"product_data_acceptance": true',
  '"translation_output": true',
  '"accepted_gloss": true',
  '"accepted_text": true',
  '"allowed_now_by_this_artifact": true',
  '"public_mutation_allowed_now": true',
  '"answer_emission_allowed_now": true',
  '"route_publication_support_claimed": true'
]) {
  expect(!jsonText.includes(forbidden), `JSON must not contain ${forbidden}`);
}

const markdownPath = 'reports/agent1-orot-sefaria-nc-aware-family-custody-boundary-2026-06-03.md';
expectSafeExistingPath(markdownPath, 'markdown report');
const markdown = fs.readFileSync(path.join(root, markdownPath), 'utf8');
for (const phrase of [
  'Agent 1 Orot/Sefaria NC-Aware Family Custody Boundary',
  'Boundary',
  'Inputs Checked',
  'Measurement Recount',
  'Family Statuses',
  'Observed Basis',
  'NC Row Flags',
  'Outputs',
  'Blockers',
  'Agent 8 Callback',
  'Non-Acceptance',
]) {
  expect(markdown.includes(phrase), `markdown missing ${phrase}`);
}

if (issues.length) {
  console.error(`Agent 1 Orot/Sefaria NC-aware family custody boundary validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 1 Orot/Sefaria NC-aware family custody boundary validation passed for ${reportPath}.`);

function family(name) {
  return familyRows.find((row) => row.family === name);
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function expectSafeExistingPath(relativePath, label) {
  expect(Boolean(relativePath), `${label} is missing`);
  expect(!path.isAbsolute(relativePath || '') && !(relativePath || '').includes('..'), `${label} must be a safe relative path`);
  if (relativePath) expect(fs.existsSync(path.join(root, relativePath)), `${label} must exist: ${relativePath}`);
}

function sameSet(actual, expected) {
  if (!Array.isArray(actual) || !Array.isArray(expected) || actual.length !== expected.length) return false;
  const a = new Set(actual);
  const b = new Set(expected);
  if (a.size !== b.size) return false;
  for (const value of b) if (!a.has(value)) return false;
  return true;
}
