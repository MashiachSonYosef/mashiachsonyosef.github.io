#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportPath = process.argv[2] || 'reports/agent2-orot-sefaria-nc-aware-top-candidate-dry-run-2026-06-03.json';
const report = JSON.parse(fs.readFileSync(path.join(root, reportPath), 'utf8'));
const issues = [];

expect(report.artifact_type === 'agent2_orot_sefaria_nc_aware_top_candidate_dry_run', 'unexpected artifact_type');
expect(report.generator === 'scripts/build_agent2_orot_sefaria_nc_aware_top_candidate_dry_run.mjs', 'unexpected generator');

for (const flag of [
  'non_public_planning_only',
  'zero_emission',
  'no_answer_rows',
  'no_answer_candidates_emitted',
  'no_source_rows_emitted',
  'no_public_hud_rows',
  'no_route_jsonl_rows',
  'no_definition_content_rows',
  'no_nc_definition_content_storage',
  'no_runtime_mutation',
  'no_source_mutation',
  'no_token_index_mutation',
  'no_lexical_payload_mutation',
  'no_public_mutation',
  'no_agent4_route',
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

expect(report.upstream_boundary_recount?.non_public_transform_spec_or_dry_run_may_proceed === true, 'upstream dry-run permission missing');
expect(report.upstream_boundary_recount?.public_mutation_blocked === true, 'upstream public mutation block missing');
expect(report.upstream_boundary_recount?.answer_eligibility_authorized === false, 'answer eligibility must not be authorized');
expect(report.upstream_boundary_recount?.nc_definition_content_storage_authorized === false, 'NC definition content storage must not be authorized');

const rows = report.rows || [];
const commercial = rows.filter((row) => row.candidate_lane === 'commercial_clean_candidate');
const nc = rows.filter((row) => row.candidate_lane === 'noncommercial_educational_candidate');
expect(rows.length === 37, 'included rows must be 37');
expect(commercial.length === 20, 'commercial-clean rows must be 20');
expect(nc.length === 17, 'NC rows must be 17');
expect(sum(commercial.map((row) => row.occurrences)) === report.summary.commercial_clean_occurrences, 'commercial occurrence recount mismatch');
expect(sum(nc.map((row) => row.occurrences)) === 259, 'NC occurrence recount must be 259');
expect(report.summary.noncommercial_educational_occurrences === 259, 'summary NC occurrences must be 259');
expect(report.summary.future_commercial_export_exclusion_rows === 17, 'commercial export exclusion rows must be 17');
expect(report.summary.future_commercial_export_exclusion_occurrences === 259, 'commercial export exclusion occurrences must be 259');

for (const row of rows) {
  for (const field of ['token_id', 'surface', 'occurrences', 'family_status']) {
    expect(row[field] !== undefined && row[field] !== null && row[field] !== '', `${row.token_id || 'row'} missing ${field}`);
  }
  expect(row.answer_eligible === false, `${row.token_id} answer_eligible must be false`);
  expect(row.approved_for_public_emit === false, `${row.token_id} approved_for_public_emit must be false`);
  expect(row.public_emit_ready === false, `${row.token_id} public_emit_ready must be false`);
  expect(row.emitted_answer_row_now === false, `${row.token_id} emitted_answer_row_now must be false`);
  expect(row.source_row_emitted_now === false, `${row.token_id} source_row_emitted_now must be false`);
  expect(row.public_mutation_allowed_here === false, `${row.token_id} public mutation must be false`);
  expect(row.definition_content_stored_now === false, `${row.token_id} definition content must not be stored`);
}

for (const row of commercial) {
  expect(row.source_license_group === 'PUBLIC_DOMAIN_OBSERVED', `${row.token_id} commercial source group mismatch`);
  expect(row.derived_from_nc === false, `${row.token_id} derived_from_nc must be false`);
  expect(row.corpus_contamination === false, `${row.token_id} corpus contamination must be false`);
}

for (const row of nc) {
  expect(row.source_license_group === 'CC_BY_NC', `${row.token_id} NC source group mismatch`);
  expect(row.license_group === 'CC_BY_NC', `${row.token_id} NC license group mismatch`);
  expect(row.derived_from_nc === true, `${row.token_id} derived_from_nc must be true`);
  expect(row.commercial_export_allowed === false, `${row.token_id} commercial export must be false`);
  expect(row.noncommercial_display_planning_allowed === true, `${row.token_id} NC planning display must be true`);
  expect(row.noncommercial_display_public_or_runtime_authorized === false, `${row.token_id} public/runtime NC display must be false`);
  expect(row.attribution_required === true, `${row.token_id} attribution_required must be true`);
  expect(row.corpus_contamination === false, `${row.token_id} corpus contamination must be false`);
  expect(row.nc_definition_content_stored_now === false, `${row.token_id} NC definition content must not be stored`);
}

const manifest = report.commercial_export_exclusion_manifest || [];
expect(manifest.length === 17, 'commercial export exclusion manifest must contain 17 rows');
for (const row of manifest) {
  expect(row.derived_from_nc === true, `${row.token_id} manifest derived_from_nc must be true`);
  expect(row.commercial_export_allowed === false, `${row.token_id} manifest commercial export must be false`);
  expect(row.corpus_contamination === false, `${row.token_id} manifest corpus contamination must be false`);
}

const outputs = report.outputs || {};
for (const key of ['answer_rows', 'source_rows', 'public_hud_rows', 'route_jsonl_rows', 'definition_content_rows', 'nc_definition_content_rows']) {
  expect(outputs[key] === 0, `outputs.${key} must be 0`);
}
for (const key of ['runtime_files_touched', 'source_files_touched', 'token_index_files_touched', 'lexical_payload_files_touched']) {
  expect(Array.isArray(outputs[key]) && outputs[key].length === 0, `outputs.${key} must be empty`);
}

const jsonText = fs.readFileSync(path.join(root, reportPath), 'utf8');
for (const forbidden of [
  '"answer_eligible": true',
  '"approved_for_public_emit": true',
  '"public_emit_ready": true',
  '"emitted_answer_row_now": true',
  '"source_row_emitted_now": true',
  '"public_mutation_allowed_here": true',
  '"definition_content_stored_now": true',
  '"nc_definition_content_stored_now": true',
  '"noncommercial_display_public_or_runtime_authorized": true',
]) {
  expect(!jsonText.includes(forbidden), `JSON must not contain ${forbidden}`);
}

const markdownPath = reportPath.replace(/\.json$/, '.md');
expectExisting(markdownPath, 'markdown report');
const markdown = fs.readFileSync(path.join(root, markdownPath), 'utf8');
for (const phrase of [
  'Agent 2 Orot/Sefaria NC-Aware Top Candidate Dry Run',
  'Boundary',
  'Summary',
  'Selected Rows',
  'NC Commercial Export Exclusion',
  'Agent 8 Callback',
  'What Must Not Be Accepted',
]) {
  expect(markdown.includes(phrase), `markdown missing ${phrase}`);
}

if (issues.length) {
  console.error(`Agent 2 Orot/Sefaria NC-aware top candidate dry-run validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 2 Orot/Sefaria NC-aware top candidate dry-run validation passed for ${reportPath}.`);

function expect(condition, message) {
  if (!condition) issues.push(message);
}

function expectExisting(relativePath, label) {
  expect(Boolean(relativePath), `${label} missing`);
  expect(!path.isAbsolute(relativePath || '') && !(relativePath || '').includes('..'), `${label} must be a safe relative path`);
  if (relativePath) expect(fs.existsSync(path.join(root, relativePath)), `${label} must exist: ${relativePath}`);
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}
