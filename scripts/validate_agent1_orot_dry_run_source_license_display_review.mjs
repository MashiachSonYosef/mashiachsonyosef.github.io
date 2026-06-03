#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportPath = process.argv[2] || 'reports/agent1-orot-dry-run-source-license-display-review-2026-06-03.json';
const report = readJson(reportPath);
const issues = [];

const requestedStatuses = new Set([
  'cleared_for_non_authoritative_candidate_display_and_storage',
  'cleared_for_metadata_only',
  'cleared_for_external_link_or_citation_only',
  'blocked_license_or_attribution_gap',
  'blocked_source_custody_gap',
  'blocked_text_display_gap',
  'blocked_project_rule_custody_gap',
]);

expect(report.schema_version === 1, 'schema_version must be 1');
expect(report.artifact_type === 'agent1_orot_dry_run_source_license_display_review', 'unexpected artifact_type');

const boundary = report.boundary || {};
for (const flag of [
  'no_public_mutation',
  'no_route_shard_edits',
  'no_answer_eligibility',
  'no_definition_authority',
  'no_usage_as_definition_authority',
  'no_accepted_gloss',
  'no_accepted_translation_text',
  'no_qa_acceptance',
  'evidence_only',
  'row_level_review_only',
  'exact_31_row_dry_run_boundary_only',
  'no_answer_rows_emitted',
  'no_source_rows_emitted',
  'no_public_hud_rows_emitted',
  'no_route_jsonl_rows_emitted',
  'no_runtime_mutation',
  'no_source_mutation',
  'no_product_data_acceptance',
  'no_public_runtime_acceptance',
  'no_publication_readiness',
]) {
  expect(boundary[flag] === true, `boundary.${flag} must be true`);
}

for (const input of [
  report.inputs_checked?.request_markdown,
  report.inputs_checked?.request_json,
]) {
  expectSafeExistingPath(input, `input ${input}`);
}
for (const evidencePath of report.inputs_checked?.evidence_files || []) {
  if (evidencePath.startsWith('.local-cache/') || evidencePath.startsWith('data/') || evidencePath.startsWith('reports/')) {
    expectSafeExistingPath(evidencePath, `evidence ${evidencePath}`);
  }
}

const outputs = report.outputs || {};
for (const key of [
  'answer_rows_emitted',
  'source_rows_emitted',
  'public_hud_rows_emitted',
  'route_jsonl_rows_emitted',
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
expect(summary.candidate_rows === 31, 'candidate_rows must be 31');
expect(summary.candidate_occurrences === 1202, 'candidate_occurrences must be 1202');
expect(summary.source_rows_reviewed === 49, 'source_rows_reviewed must be 49');
expect(summary.source_family_buckets === 4, 'source_family_buckets must be 4');
expect(summary.selected_source_row_appearances === 31, 'selected_source_row_appearances must be 31');
expect(summary.competing_source_row_appearances === 46, 'competing_source_row_appearances must be 46');
expect(summary.source_rows_with_local_bounded_evidence_present === 49, 'all 49 source rows must have bounded local evidence');
expect(summary.source_rows_missing_local_bounded_evidence === 0, 'missing local evidence must be 0');
expect(summary.can_proceed_to_agent6_boundary_review_from_agent1_lane === true, 'Agent 6 boundary review should be ready from Agent 1 lane');
expect(summary.can_proceed_to_public_mutation_from_agent1_lane === false, 'public mutation must not be allowed');
expect(summary.public_mutation_allowed_now === false, 'public mutation must remain false');
expect(summary.agent1_review_ready_for_agent6 === true, 'agent1_review_ready_for_agent6 must be true');
expect(summary.selected_rows_with_display_storage_blockers === 11, 'selected display/storage blockers must be 11');

expect(summary.requested_schema_selected_row_status_counts?.cleared_for_external_link_or_citation_only === 10, '10 selected rows should be external-link/citation-only');
expect(summary.requested_schema_selected_row_status_counts?.cleared_for_non_authoritative_candidate_display_and_storage === 20, '20 selected rows should be display/storage-cleared for review');
expect(summary.requested_schema_selected_row_status_counts?.cleared_for_metadata_only === 1, '1 selected row should be metadata-only');
expect(summary.requested_schema_source_row_status_counts?.cleared_for_external_link_or_citation_only === 36, '36 source rows should be external-link/citation-only');
expect(summary.requested_schema_source_row_status_counts?.cleared_for_non_authoritative_candidate_display_and_storage === 12, '12 source rows should be display/storage-cleared for review');
expect(summary.requested_schema_source_row_status_counts?.cleared_for_metadata_only === 1, '1 source row should be metadata-only');

const families = report.source_family_statuses || [];
expect(families.length === 4, 'source_family_statuses length must be 4');
for (const bucket of [
  'kaikki_wiktionary',
  'openscriptures',
  'workspace_project_function_word',
  'workspace_project_grammar_particle',
]) {
  expect(families.some((row) => row.source_bucket === bucket), `missing source family ${bucket}`);
}
for (const family of families) {
  expect(requestedStatuses.has(family.agent1_status), `${family.source_bucket} has invalid agent1_status`);
  expect(typeof family.required_attribution === 'string' && family.required_attribution.length > 0, `${family.source_bucket} missing required_attribution`);
  expect(typeof family.source_manifest_requirement === 'string' && family.source_manifest_requirement.length > 0, `${family.source_bucket} missing source_manifest_requirement`);
}

const sourceRows = report.source_row_statuses || [];
expect(sourceRows.length === 49, 'source_row_statuses length must be 49');
const sourceRowKeys = new Set();
for (const row of sourceRows) {
  expect(row.source_row && !sourceRowKeys.has(row.source_row), `duplicate or missing source row: ${row.source_row}`);
  sourceRowKeys.add(row.source_row);
  expect(requestedStatuses.has(row.agent1_status), `${row.source_row} has invalid agent1_status`);
  expect(Array.isArray(row.roles) && row.roles.length > 0, `${row.source_row} roles missing`);
  expect(Array.isArray(row.token_ids) && row.token_ids.length > 0, `${row.source_row} token_ids missing`);
  expect(typeof row.required_attribution === 'string' && row.required_attribution.length > 0, `${row.source_row} missing required_attribution`);
  expect(typeof row.source_manifest_requirement === 'string' && row.source_manifest_requirement.length > 0, `${row.source_row} missing source_manifest_requirement`);
  expect(row.all_local_evidence_present_for_bounded_review === true, `${row.source_row} local evidence should be present`);
  if (row.agent1_status.startsWith('blocked_')) {
    expect(Boolean(row.exact_blocker_if_blocked), `${row.source_row} blocked row must name exact blocker`);
  }
}

const rowStatuses = report.row_statuses || [];
expect(rowStatuses.length === 31, 'row_statuses length must be 31');
const tokenIds = new Set();
let selectedAppearances = 0;
let competingAppearances = 0;
for (const row of rowStatuses) {
  expect(row.token_id && !tokenIds.has(row.token_id), `duplicate or missing token_id ${row.token_id}`);
  tokenIds.add(row.token_id);
  expect(typeof row.surface === 'string' && row.surface.length > 0, `${row.token_id} surface missing`);
  expect(typeof row.normalized === 'string' && row.normalized.length > 0, `${row.token_id} normalized missing`);
  expect(Number.isInteger(row.occurrences) && row.occurrences > 0, `${row.token_id} occurrences invalid`);
  expect(['counterpart candidate', 'project-preferred counterpart candidate'].includes(row.candidate_label), `${row.token_id} candidate label invalid`);
  expect(requestedStatuses.has(row.agent1_status), `${row.token_id} has invalid agent1_status`);
  expect(row.public_mutation_allowed_here === false, `${row.token_id} public mutation must be false`);
  expect(row.answer_eligibility_allowed_here === false, `${row.token_id} answer eligibility must be false`);
  expect(row.accepted_gloss_or_text_here === false, `${row.token_id} accepted text must be false`);
  expect(row.future_write_if_later_approved?.allowed_now === false, `${row.token_id} future write must not be allowed now`);
  expect(Array.isArray(row.selected_source_rows_with_roles), `${row.token_id} selected_source_rows_with_roles missing`);
  expect(Array.isArray(row.competing_source_rows_with_roles), `${row.token_id} competing_source_rows_with_roles missing`);
  selectedAppearances += row.selected_source_rows_with_roles.length;
  competingAppearances += row.competing_source_rows_with_roles.length;
  for (const selected of row.selected_source_rows_with_roles) {
    expect(selected.role === 'selected', `${row.token_id} selected role mismatch`);
    expect(sourceRowKeys.has(selected.source_row), `${row.token_id} selected source row not reviewed: ${selected.source_row}`);
  }
  for (const competing of row.competing_source_rows_with_roles) {
    expect(competing.role === 'competing', `${row.token_id} competing role mismatch`);
    expect(sourceRowKeys.has(competing.source_row), `${row.token_id} competing source row not reviewed: ${competing.source_row}`);
  }
}
expect(selectedAppearances === 31, 'selected source-row appearance recount must be 31');
expect(competingAppearances === 46, 'competing source-row appearance recount must be 46');

const blockers = report.exact_display_storage_blockers || [];
expect(blockers.length === 11, 'exact display/storage blockers must be 11');
for (const blocker of blockers) {
  expect(Boolean(blocker.token_id), 'blocker token_id missing');
  expect(Boolean(blocker.exact_blocker_if_display_or_storage), `${blocker.token_id} exact display/storage blocker missing`);
}

const callback = report.agent8_callback || {};
expect(callback.status === 'agent1_bounded_row_level_source_license_display_review_produced', 'Agent 8 callback status mismatch');
expect(callback.artifact === 'reports/agent1-orot-dry-run-source-license-display-review-2026-06-03.md', 'Agent 8 callback artifact mismatch');
expect(callback.artifact_json === 'reports/agent1-orot-dry-run-source-license-display-review-2026-06-03.json', 'Agent 8 callback JSON artifact mismatch');
expect(Array.isArray(callback.blockers) && callback.blockers.length === 3, 'Agent 8 callback should name three blocker notes');
expect((callback.next_action_needed || '').includes('Agent 6'), 'Agent 8 callback must route next review to Agent 6');
expect(callback.direct_callback_delivery?.status === 'Agent 8 direct callback delivery unavailable; callback requires relay.', 'Agent 8 direct callback relay status missing');
expect((callback.direct_callback_delivery?.callback_text || '').includes('<codex_delegation>'), 'Agent 8 callback relay XML missing');

const jsonText = fs.readFileSync(path.join(root, reportPath), 'utf8');
for (const forbidden of [
  '"license_accepted": true',
  '"source_provenance_accepted": true',
  '"source_accepted": true',
  '"qa_accepted": true',
  '"answer_accepted": true',
  '"public_runtime_accepted": true',
  '"publication_ready": true',
  '"product_data_accepted": true',
  '"public_mutation_allowed_here": true',
  '"answer_eligibility_allowed_here": true',
  '"accepted_gloss_or_text_here": true',
  '"allowed_now": true',
]) {
  expect(!jsonText.includes(forbidden), `JSON must not contain ${forbidden}`);
}

const markdownPath = 'reports/agent1-orot-dry-run-source-license-display-review-2026-06-03.md';
expectSafeExistingPath(markdownPath, 'markdown report');
const markdown = fs.readFileSync(path.join(root, markdownPath), 'utf8');
for (const phrase of [
  'Agent 1 Orot Dry-Run Source/License Display Review',
  'Boundary',
  'Requested Schema Status Normalization',
  'Source Family Statuses',
  'Row-Level Statuses',
  'Source Row Evidence Map',
  'Exact Display/Storage Blockers',
  'Agent 8 Callback',
  'Direct Callback Relay Text',
  'Non-Acceptance',
]) {
  expect(markdown.includes(phrase), `markdown missing ${phrase}`);
}

if (issues.length) {
  console.error(`Agent 1 Orot dry-run source/license display review validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 1 Orot dry-run source/license display review validation passed for ${reportPath}.`);

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
