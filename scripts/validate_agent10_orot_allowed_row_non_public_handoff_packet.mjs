#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportPath = process.argv[2] || 'reports/agent10-orot-allowed-row-non-public-handoff-packet-2026-06-03.json';
const report = JSON.parse(fs.readFileSync(path.join(root, reportPath), 'utf8'));
const issues = [];

expect(report.artifact_type === 'agent10_orot_allowed_row_non_public_handoff_packet', 'unexpected artifact_type');
expect(report.generator === 'scripts/build_agent10_orot_allowed_row_non_public_handoff_packet.mjs', 'unexpected generator');

for (const flag of [
  'evidence_only',
  'planning_only',
  'exact_allowed_row_boundary_only',
  'no_public_mutation',
  'no_public_hud_rows',
  'no_route_jsonl_rows',
  'no_answer_rows',
  'no_source_rows_emitted',
  'no_runtime_mutation',
  'no_source_mutation',
  'no_token_index_mutation',
  'no_lexical_payload_mutation',
  'no_answer_eligibility_change',
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

expect(report.summary?.included_rows === 20, 'included rows must be 20');
expect(report.summary?.included_occurrences === 1033, 'included occurrences must be 1033');
expect(report.summary?.excluded_rows === 11, 'excluded rows must be 11');
expect(report.summary?.excluded_occurrences === 169, 'excluded occurrences must be 169');
expect(report.summary?.original_rows === 31, 'original rows must be 31');
expect(report.summary?.original_occurrences === 1202, 'original occurrences must be 1202');
expect(report.summary?.public_mutation_allowed === false, 'public mutation must be false');
expect(report.summary?.agent4_ready === false, 'Agent 4 must not be ready');
expect(report.summary?.next_non_public_step_allowed === true, 'next non-public step should be allowed');
expect(report.summary?.next_public_step_allowed === false, 'next public step must be blocked');
expect(report.summary?.nc_policy_recorded_for_future_matrix === true, 'NC policy callback should be recorded');

const included = report.included_package_rows || [];
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
  expect(row.runtime_mutation_allowed_here === false, `${row.token_id} runtime mutation must be false`);
}
for (const row of excluded) {
  expect(row.public_mutation_allowed_here === false, `${row.token_id} excluded public mutation must be false`);
  expect(row.candidate_text_storage_display_allowed_here === false, `${row.token_id} excluded display/storage must be false`);
}

expect(report.release_owner_next_gates?.some((gate) => gate.gate === 'agent4_runtime_proof' && gate.status === 'held'), 'Agent 4 gate must be held');
expect(report.future_nc_lane?.status === 'recorded_for_future_measurement_only', 'future NC lane status mismatch');
expect(report.future_nc_lane?.no_nc_definition_content_storage === true, 'future NC lane must forbid NC definition content storage');
expect(report.future_nc_lane?.no_license_acceptance === true, 'future NC lane must not accept license');
expect(report.future_nc_lane?.no_public_mutation === true, 'future NC lane must forbid public mutation');

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
  '"runtime_mutation_allowed_here": true',
  '"candidate_text_storage_display_allowed_here": true',
]) {
  expect(!jsonText.includes(forbidden), `JSON must not contain ${forbidden}`);
}

const markdownPath = reportPath.replace(/\.json$/, '.md');
expectExisting(markdownPath, 'markdown report');
const markdown = fs.readFileSync(path.join(root, markdownPath), 'utf8');
for (const phrase of [
  'Agent 10 Orot Allowed-Row Non-Public Handoff Packet',
  'Boundary',
  'Included Rows',
  'Excluded Rows',
  'Next Gates',
  'Future NC Lane',
  'Agent 8 Callback',
  'What Must Not Be Accepted',
]) {
  expect(markdown.includes(phrase), `markdown missing ${phrase}`);
}

if (issues.length) {
  console.error(`Agent 10 Orot allowed-row non-public handoff packet validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 10 Orot allowed-row non-public handoff packet validation passed for ${reportPath}.`);

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
