#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportPath = process.argv[2] || 'reports/agent10-orot-license-safe-coverage-repair-add-candidates-2026-06-03.json';
const report = JSON.parse(fs.readFileSync(path.join(root, reportPath), 'utf8'));
const issues = [];
const allowedLabels = ['counterpart candidate', 'project-preferred counterpart candidate'];

expect(report.artifact_type === 'agent10_orot_license_safe_coverage_repair_add_candidates', 'unexpected artifact_type');
for (const flag of [
  'pre_agent6_review',
  'no_rows_added_before_agent6',
  'no_answer_rows',
  'no_source_rows_emitted',
  'no_public_hud_rows',
  'no_route_jsonl_rows',
  'no_definition_content_rows',
  'no_nc_definition_content_storage',
  'no_public_mutation',
  'no_runtime_mutation',
  'no_agent4_route',
]) expect(report.boundary?.[flag] === true, `boundary.${flag} must be true`);

for (const [key, value] of Object.entries(report.inputs || {})) {
  if (key.endsWith('_sha256')) continue;
  expectExisting(value, `input ${key}`);
}

const rows = report.rows || [];
const nc = rows.filter((row) => row.lane === 'noncommercial_educational_candidate');
const commercial = rows.filter((row) => row.lane === 'commercial_clean_candidate');
expect(rows.length === 50, 'candidate rows must be 50');
expect(commercial.length === 33, 'commercial rows must be 33');
expect(nc.length === 17, 'NC rows must be 17');
expect(report.summary.rows_added_now === 0, 'rows_added_now must be 0 before Agent 6');
expect(report.summary.rows_blocked_pending_agent6 === 50, 'all rows must be pending Agent 6');
expect(report.summary.public_runtime_proof_needed_now === false, 'public runtime proof must not be needed now');

for (const row of rows) {
  expect(allowedLabels.includes(row.provisional_label), `${row.target_token_id} invalid provisional label`);
  expect(row.placeholder_status === 'placeholder_only', `${row.target_token_id} placeholder status must be placeholder_only`);
  expect(row.counterpart_text === null, `${row.target_token_id} counterpart text must be null`);
  expect(row.stored_text_now === false, `${row.target_token_id} stored_text_now must be false`);
  expect(row.cleared_by_agent6_now === false, `${row.target_token_id} must not be cleared now`);
  expect(row.add_now_before_agent6 === false, `${row.target_token_id} must not be added before Agent 6`);
  expect(row.public_emit_ready === false, `${row.target_token_id} public_emit_ready must be false`);
}

for (const row of nc) {
  expect(row.source_license_group === 'CC_BY_NC', `${row.target_token_id} NC license group must be CC_BY_NC`);
  expect(row.derived_from_nc === true, `${row.target_token_id} NC derived_from_nc must be true`);
  expect(row.commercial_export_allowed === false, `${row.target_token_id} NC commercial export must be false`);
  expect(row.attribution_required === true, `${row.target_token_id} NC attribution required must be true`);
  expect(row.corpus_contamination === false, `${row.target_token_id} NC corpus contamination must be false`);
}

const outputs = report.outputs_now || {};
for (const key of ['answer_rows', 'source_rows', 'public_hud_rows', 'route_jsonl_rows', 'definition_content_rows', 'nc_definition_content_rows']) {
  expect(outputs[key] === 0, `outputs_now.${key} must be 0`);
}
expect(Array.isArray(outputs.public_mutation_files) && outputs.public_mutation_files.length === 0, 'public mutation files must be empty');

if (issues.length) {
  console.error(`coverage repair add-candidates validation failed:`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}
console.log(`coverage repair add-candidates validation passed for ${reportPath}.`);

function expect(condition, message) {
  if (!condition) issues.push(message);
}

function expectExisting(relativePath, label) {
  expect(Boolean(relativePath), `${label} missing`);
  expect(!path.isAbsolute(relativePath || '') && !(relativePath || '').includes('..'), `${label} must be a safe relative path`);
  if (relativePath) expect(fs.existsSync(path.join(root, relativePath)), `${label} must exist: ${relativePath}`);
}
