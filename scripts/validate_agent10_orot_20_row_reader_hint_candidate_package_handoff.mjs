#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportPath = process.argv[2] || 'reports/agent10-orot-20-row-reader-hint-candidate-package-handoff-2026-06-03.json';
const report = JSON.parse(fs.readFileSync(path.join(root, reportPath), 'utf8'));
const issues = [];

expect(report.artifact_type === 'agent10_orot_20_row_reader_hint_candidate_package_handoff', 'unexpected artifact_type');
expect(report.generator === 'scripts/build_agent10_orot_20_row_reader_hint_candidate_package_handoff.mjs', 'unexpected generator');

for (const flag of [
  'exact_20_row_boundary_only',
  'planning_handoff_only',
  'no_public_orot_asset_mutation',
  'no_route_shard_edits',
  'no_public_hud_output',
  'no_route_jsonl_writes',
  'no_orot_html_runtime_edits',
  'no_source_mutation',
  'no_token_index_mutation',
  'no_lexical_payload_mutation',
  'no_answer_eligibility',
  'no_accepted_text',
  'no_render_browser_public_validation',
  'no_agent4_runtime_proof',
  'no_top_n_expansion',
  'no_nc_expansion_in_this_package',
  'no_changed_public_runtime_package_claim',
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
]) {
  expect(report.boundary?.[flag] === true, `boundary.${flag} must be true`);
}

for (const [key, value] of Object.entries(report.inputs || {})) {
  if (key.endsWith('_sha256')) continue;
  expectExisting(value, `input ${key}`);
}

expect(report.summary?.included_rows === 20, 'included rows must be 20');
expect(report.summary?.included_occurrences === 1033, 'included occurrences must be 1033');
expect(report.summary?.excluded_rows === 11, 'excluded rows must be 11');
expect(report.summary?.excluded_occurrences === 169, 'excluded occurrences must be 169');
expect(report.summary?.public_mutation_blocked === true, 'public mutation must be blocked');
expect(report.summary?.agent4_remains_held === true, 'Agent 4 must remain held');
expect(report.summary?.changed_public_runtime_package_exists === false, 'changed public/runtime package must not exist');

const included = report.included_rows || [];
const excluded = report.excluded_rows || [];
expect(included.length === 20, 'included row list length must be 20');
expect(excluded.length === 11, 'excluded row list length must be 11');
expect(sumOccurrences(included) === 1033, 'included occurrence recount must be 1033');
expect(sumOccurrences(excluded) === 169, 'excluded occurrence recount must be 169');

for (const row of included) {
  expect(row.answer_eligible === false, `${row.token_id} answer_eligible must be false`);
  expect(row.promote_to_answer === false, `${row.token_id} promote_to_answer must be false`);
  expect(row.approved_for_public_emit === false, `${row.token_id} approved_for_public_emit must be false`);
  expect(row.public_emit_ready === false, `${row.token_id} public_emit_ready must be false`);
  expect(row.public_mutation_allowed_here === false, `${row.token_id} public mutation must be false`);
}
for (const row of excluded) {
  expect(row.candidate_text_storage_display_allowed_here === false, `${row.token_id} display/storage must be false`);
  expect(row.public_mutation_allowed_here === false, `${row.token_id} public mutation must be false`);
}

for (const blocker of [
  'Public mutation remains blocked.',
  '10 Kaikki/Wiktionary rows remain external-link/citation-only.',
  '1 workspace grammar-particle row remains metadata-only.',
  'No changed public/runtime package exists for Agent 4.',
  'Agent 4 remains held.',
]) {
  expect(report.required_blockers_preserved?.includes(blocker), `missing blocker: ${blocker}`);
}

const outputs = report.outputs || {};
for (const key of ['answer_rows', 'source_rows', 'public_hud_rows', 'route_jsonl_rows']) {
  expect(outputs[key] === 0, `outputs.${key} must be 0`);
}
for (const key of ['runtime_files_touched', 'source_files_touched', 'token_index_files_touched', 'lexical_payload_files_touched']) {
  expect(Array.isArray(outputs[key]) && outputs[key].length === 0, `outputs.${key} must be empty`);
}

const jsonText = fs.readFileSync(path.join(root, reportPath), 'utf8');
for (const forbidden of [
  '"answer_eligible": true',
  '"promote_to_answer": true',
  '"approved_for_public_emit": true',
  '"public_emit_ready": true',
  '"public_mutation_allowed_here": true',
  '"candidate_text_storage_display_allowed_here": true',
]) {
  expect(!jsonText.includes(forbidden), `JSON must not contain ${forbidden}`);
}

const markdownPath = reportPath.replace(/\.json$/, '.md');
expectExisting(markdownPath, 'markdown report');
const markdown = fs.readFileSync(path.join(root, markdownPath), 'utf8');
for (const phrase of [
  'Agent 10 Orot 20-Row Reader-Hint Candidate Package Handoff',
  'Boundary',
  'Recount',
  'Included Rows',
  'Excluded Blockers',
  'Required Blockers Preserved',
  'Agent 8 Callback',
  'What Must Not Be Accepted',
]) {
  expect(markdown.includes(phrase), `markdown missing ${phrase}`);
}

if (issues.length) {
  console.error(`Agent 10 Orot 20-row reader-hint candidate package handoff validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 10 Orot 20-row reader-hint candidate package handoff validation passed for ${reportPath}.`);

function expect(condition, message) {
  if (!condition) issues.push(message);
}

function expectExisting(relativePath, label) {
  expect(Boolean(relativePath), `${label} missing`);
  expect(!path.isAbsolute(relativePath || '') && !(relativePath || '').includes('..'), `${label} must be a safe relative path`);
  if (relativePath) expect(fs.existsSync(path.join(root, relativePath)), `${label} must exist: ${relativePath}`);
}

function sumOccurrences(rows) {
  return rows.reduce((sum, row) => sum + Number(row.occurrences || 0), 0);
}
