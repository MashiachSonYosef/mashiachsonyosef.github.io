#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportPath = process.argv[2] || 'reports/agent10-agent1-agent6-orot-nc-aware-boundary-request-2026-06-03.json';
const report = JSON.parse(fs.readFileSync(path.join(root, reportPath), 'utf8'));
const issues = [];

expect(report.artifact_type === 'agent10_agent1_agent6_orot_nc_aware_boundary_request', 'unexpected artifact_type');
expect(report.generator === 'scripts/build_agent10_agent1_agent6_orot_nc_aware_boundary_request.mjs', 'unexpected generator');

for (const flag of [
  'request_only',
  'evidence_only',
  'zero_emission',
  'no_answer_rows',
  'no_source_rows_emitted',
  'no_public_hud_rows',
  'no_route_jsonl_rows',
  'no_nc_definition_content_storage',
  'no_runtime_mutation',
  'no_source_mutation',
  'no_token_index_mutation',
  'no_lexical_payload_mutation',
  'no_public_mutation',
  'no_qa_acceptance',
  'no_source_provenance_acceptance',
  'no_license_acceptance',
  'no_definition_authority',
  'no_usage_as_definition_authority',
  'no_answer_acceptance',
  'no_public_runtime_acceptance',
  'no_publication_readiness',
  'no_route_publication_support',
  'no_product_data_acceptance',
  'no_translation_output',
  'no_accepted_gloss',
  'no_accepted_text',
]) {
  expect(report.boundary?.[flag] === true, `boundary.${flag} must be true`);
}

for (const [key, value] of Object.entries(report.inputs || {})) {
  if (key.endsWith('_sha256')) continue;
  expectExisting(value, `input ${key}`);
}

const scope = report.measured_scope || {};
expect(scope.scoped_rows === 500, 'scoped rows must be 500');
expect(scope.scoped_occurrences === 8427, 'scoped occurrences must be 8427');
expect(scope.commercial_clean_candidate_rows === 297, 'commercial-clean rows must be 297');
expect(scope.commercial_clean_candidate_occurrences === 5747, 'commercial-clean occurrences must be 5747');
expect(scope.additional_nc_educational_candidate_rows === 17, 'additional NC rows must be 17');
expect(scope.additional_nc_educational_candidate_occurrences === 259, 'additional NC occurrences must be 259');
expect(scope.commercial_clean_plus_nc_rows === 314, 'commercial-clean plus NC rows must be 314');
expect(scope.commercial_clean_plus_nc_occurrences === 6006, 'commercial-clean plus NC occurrences must be 6006');
expect(scope.remaining_no_hit_or_unusable_rows === 186, 'remaining rows must be 186');
expect(scope.remaining_no_hit_or_unusable_occurrences === 2421, 'remaining occurrences must be 2421');

for (const status of ['commercial_clean_candidate', 'noncommercial_educational_candidate', 'metadata_only', 'external_link_only', 'blocked']) {
  expect(report.requested_status_options?.includes(status), `missing requested status ${status}`);
}

const families = report.family_boundary_requests || [];
expect(families.length === 5, 'family request count must be 5');
expect(families.some((row) => row.family === 'Klein Dictionary' && row.requested_status === 'noncommercial_educational_candidate'), 'Klein NC family request missing');
expect(families.some((row) => row.family === 'BDB Augmented Strong' && row.requested_status === 'blocked'), 'BDB Augmented Strong blocked request missing');

const ncRows = report.nc_commercial_export_exclusion_rows || [];
expect(ncRows.length === 17, 'NC commercial export exclusion rows must be 17');
expect(ncRows.reduce((sum, row) => sum + Number(row.occurrences || 0), 0) === 259, 'NC commercial export exclusion occurrences must be 259');
for (const row of ncRows) {
  expect(row.license_group === 'CC_BY_NC', `${row.token_id} license_group must be CC_BY_NC`);
  expect(row.derived_from_nc === true, `${row.token_id} derived_from_nc must be true`);
  expect(row.commercial_export_allowed === false, `${row.token_id} commercial_export_allowed must be false`);
  expect(row.noncommercial_display_allowed === false, `${row.token_id} noncommercial_display_allowed must be false until boundary`);
  expect(row.attribution_required === true, `${row.token_id} attribution_required must be true`);
  expect(row.corpus_contamination === false, `${row.token_id} corpus_contamination must be false`);
}

const outputs = report.outputs || {};
for (const key of ['answer_rows', 'source_rows', 'public_hud_rows', 'route_jsonl_rows', 'nc_definition_content_rows']) {
  expect(outputs[key] === 0, `outputs.${key} must be 0`);
}
for (const key of ['runtime_files_touched', 'source_files_touched', 'token_index_files_touched', 'lexical_payload_files_touched']) {
  expect(Array.isArray(outputs[key]) && outputs[key].length === 0, `outputs.${key} must be empty`);
}

const jsonText = fs.readFileSync(path.join(root, reportPath), 'utf8');
for (const forbidden of [
  '"license_acceptance": true',
  '"public_mutation": true',
  '"answer_eligible": true',
  '"commercial_export_allowed": true',
  '"noncommercial_display_allowed": true',
]) {
  expect(!jsonText.includes(forbidden), `JSON must not contain ${forbidden}`);
}

const markdownPath = reportPath.replace(/\.json$/, '.md');
expectExisting(markdownPath, 'markdown report');
const markdown = fs.readFileSync(path.join(root, markdownPath), 'utf8');
for (const phrase of [
  'Agent 10 Agent 1/6 Orot NC-Aware Boundary Request',
  'Measurement Basis',
  'Requested Status Options',
  'Family Boundary Requests',
  'NC Commercial Export Exclusion Rows',
  'Requested Agent 1/6 Schema',
  'Agent 8 Callback',
  'What Must Not Be Accepted',
]) {
  expect(markdown.includes(phrase), `markdown missing ${phrase}`);
}

if (issues.length) {
  console.error(`Agent 10 Agent 1/6 Orot NC-aware boundary request validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 10 Agent 1/6 Orot NC-aware boundary request validation passed for ${reportPath}.`);

function expect(condition, message) {
  if (!condition) issues.push(message);
}

function expectExisting(relativePath, label) {
  expect(Boolean(relativePath), `${label} missing`);
  expect(!path.isAbsolute(relativePath || '') && !(relativePath || '').includes('..'), `${label} must be a safe relative path`);
  if (relativePath) expect(fs.existsSync(path.join(root, relativePath)), `${label} must exist: ${relativePath}`);
}
