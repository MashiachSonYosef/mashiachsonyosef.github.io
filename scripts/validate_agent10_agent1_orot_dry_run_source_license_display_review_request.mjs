#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportPath = process.argv[2] || 'reports/agent10-agent1-ready-orot-dry-run-source-license-display-review-request-2026-06-03.json';
const report = readJson(reportPath);
const issues = [];

expect(report.artifact_type === 'agent10_agent1_ready_orot_dry_run_source_license_display_review_request', 'unexpected artifact_type');
expect(report.generator === 'scripts/build_agent10_agent1_orot_dry_run_source_license_display_review_request.mjs', 'unexpected generator');

const boundary = report.boundary || {};
for (const flag of [
  'evidence_only',
  'request_only',
  'row_level_review_request_only',
  'exact_dry_run_boundary_only',
  'no_license_acceptance',
  'no_source_custody',
  'no_source_acceptance',
  'no_definition_authority',
  'no_usage_as_definition',
  'no_translation_output',
  'no_accepted_gloss',
  'no_accepted_translation_text',
  'no_answer_acceptance',
  'no_answer_rows',
  'no_answer_candidates_emitted',
  'no_answer_eligibility_change',
  'no_source_rows_emitted',
  'no_lexicon_entry_id_assignment',
  'no_public_hud_mutation',
  'no_route_jsonl_mutation',
  'no_runtime_mutation',
  'no_source_mutation',
  'no_publication_readiness',
  'no_qa_acceptance',
]) {
  expect(boundary[flag] === true, `boundary.${flag} must be true`);
}

for (const [key, value] of Object.entries(report.inputs || {})) {
  if (key.endsWith('_sha256')) continue;
  expectSafeExistingPath(value, `input ${key}`);
}
expectSafeExistingPath(report.outputs?.markdown_report, 'markdown report output');

const outputs = report.outputs || {};
for (const key of [
  'answer_rows',
  'answer_candidate_rows',
  'source_rows',
  'lexicon_entry_id_assignments',
  'public_hud_rows',
  'route_jsonl_rows',
]) {
  expect(outputs[key] === 0, `outputs.${key} must be 0`);
}
for (const key of [
  'runtime_files_touched',
  'source_files_touched',
  'token_index_files_touched',
  'lexical_payload_files_touched',
]) {
  expect(Array.isArray(outputs[key]) && outputs[key].length === 0, `outputs.${key} must be empty`);
}

const summary = report.summary || {};
expect(summary.candidate_rows === 31, 'expected 31 candidate rows');
expect(summary.candidate_occurrences === 1202, 'expected 1202 occurrences');
expect(summary.prefix_stem_rows === 12, 'expected 12 prefix/stem rows');
expect(summary.project_preferred_rows === 19, 'expected 19 project-preferred rows');
expect(summary.selected_source_row_appearances === 31, 'expected 31 selected source-row appearances');
expect(summary.competing_source_row_appearances === 46, 'expected 46 competing source-row appearances');
expect(summary.unique_source_rows_for_review === 49, 'expected 49 unique source rows');
expect(summary.source_family_requests === 4, 'expected 4 source-family request groups');
expect(summary.blockers_inside_dry_run === 0, 'dry-run blockers must be 0');
for (const key of [
  'answer_rows_emitted',
  'answer_candidate_rows_emitted',
  'source_rows_emitted',
  'lexicon_entry_ids_assigned',
  'public_hud_rows_emitted',
  'route_jsonl_rows_emitted',
  'runtime_files_touched',
  'source_files_touched',
]) {
  expect(summary[key] === 0, `summary.${key} must be 0`);
}

const rows = report.row_review_requests || [];
expect(rows.length === 31, 'row_review_requests length must be 31');
for (const row of rows) {
  expect(row.target_work !== 'public', `${row.token_id || 'row'} must not claim public work`);
  expect(row.requested_agent1_review?.mutation_allowed_here === false, `${row.token_id} mutation_allowed_here must be false`);
  expect(row.requested_agent1_review?.public_emit_allowed_here === false, `${row.token_id} public_emit_allowed_here must be false`);
  expect(row.requested_agent1_review?.answer_eligibility_allowed_here === false, `${row.token_id} answer_eligibility_allowed_here must be false`);
  expect(row.future_write_if_later_approved?.allowed_now === false, `${row.token_id} future write allowed_now must be false`);
  expect(['counterpart candidate', 'project-preferred counterpart candidate'].includes(row.candidate_label), `${row.token_id} has unexpected label`);
  expect(row.label_status === 'candidate_not_approved', `${row.token_id} label must remain candidate_not_approved`);
  expect(row.match_percent === null, `${row.token_id} match_percent must be null`);
}

const sourceRows = report.source_row_review_requests || [];
expect(sourceRows.length === 49, 'source_row_review_requests length must be 49');
for (const row of sourceRows) {
  expect(row.mutation_allowed_here === false, `${row.source_row} mutation_allowed_here must be false`);
  expect(row.public_emit_allowed_here === false, `${row.source_row} public_emit_allowed_here must be false`);
  expect(row.answer_eligibility_allowed_here === false, `${row.source_row} answer_eligibility_allowed_here must be false`);
}

const families = report.source_family_requests || [];
for (const bucket of [
  'kaikki_wiktionary',
  'openscriptures',
  'workspace_project_function_word',
  'workspace_project_grammar_particle',
]) {
  expect(families.some((row) => row.source_bucket === bucket), `missing source-family bucket ${bucket}`);
}
for (const family of families) {
  expect(family.answer_rows_allowed_now === false, `${family.source_bucket} answer rows must not be allowed now`);
  expect(family.public_hud_rows_allowed_now === false, `${family.source_bucket} public HUD rows must not be allowed now`);
  expect(family.route_jsonl_rows_allowed_now === false, `${family.source_bucket} route JSONL rows must not be allowed now`);
}

const callback = report.agent8_callback || {};
expect(callback.agent1_needed === true, 'Agent 1 should be needed');
expect(callback.agent2_needed_now === false, 'Agent 2 should not be needed now');
expect(callback.agent4_needed_now === false, 'Agent 4 should not be needed now');
expect(callback.agent6_needed_after_agent1 === true, 'Agent 6 should be needed after Agent 1');
expect(callback.direct_callback_delivery?.status === 'Agent 8 direct callback delivery unavailable; callback requires relay.', 'direct callback blocker text missing');
expect((callback.direct_callback_delivery?.callback_text || '').includes('<codex_delegation>'), 'callback relay XML missing');

const jsonText = fs.readFileSync(path.join(root, reportPath), 'utf8');
for (const forbidden of [
  '"answer_eligible": true',
  '"promote_to_answer": true',
  '"approved_for_public_emit": true',
  '"public_emit_ready": true',
  '"allowed_now": true',
]) {
  expect(!jsonText.includes(forbidden), `JSON must not contain ${forbidden}`);
}

const markdown = fs.readFileSync(path.join(root, report.outputs.markdown_report), 'utf8');
for (const phrase of [
  'Evidence-only request packet',
  'Source Family Requests',
  'Requested Agent 1 Schema',
  'Row Review Boundary',
  'Agent 8 Callback',
  'Agent 8 direct callback delivery unavailable; callback requires relay',
  'What Must Not Be Accepted',
]) {
  expect(markdown.includes(phrase), `markdown missing ${phrase}`);
}

if (issues.length) {
  console.error(`Agent 10 Agent 1 Orot dry-run source/license display review request validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 10 Agent 1 Orot dry-run source/license display review request validation passed for ${reportPath}.`);

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
