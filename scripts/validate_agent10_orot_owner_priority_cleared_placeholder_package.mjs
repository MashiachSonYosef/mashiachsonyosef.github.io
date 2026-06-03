#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportPath = process.argv[2] || 'reports/agent10-orot-owner-priority-cleared-placeholder-package-2026-06-03.json';
const report = JSON.parse(fs.readFileSync(path.join(root, reportPath), 'utf8'));
const issues = [];
const labels = ['counterpart candidate', 'project-preferred counterpart candidate'];

expect(report.artifact_type === 'agent10_orot_owner_priority_cleared_placeholder_package', 'unexpected artifact_type');
for (const flag of ['exact_agent6_boundary_only', 'non_public_package_only', 'no_answer_rows', 'no_source_rows_emitted', 'no_public_hud_rows', 'no_route_jsonl_rows', 'no_definition_content_rows', 'no_nc_definition_content_storage', 'no_public_mutation', 'no_runtime_mutation', 'no_source_mutation', 'no_token_index_mutation', 'no_lexical_payload_mutation']) {
  expect(report.boundary?.[flag] === true, `boundary.${flag} must be true`);
}

expect(report.agent6_verdict_recount.cleared_ids_found_in_verdict === 63, 'Agent 6 cleared id count must be 63');
expect(report.agent6_verdict_recount.missing_cleared_ids_in_owner_packet.length === 0, 'all cleared ids must exist in owner packet');
expect(report.summary.rows_added_to_non_public_placeholder_package === 63, 'rows added must be 63');
expect(report.summary.occurrences_added_to_non_public_placeholder_package === 3046, 'occurrences added must be 3046');
expect(report.summary.commercial_clean_rows_added === 33, 'commercial rows added must be 33');
expect(report.summary.commercial_clean_occurrences_added === 2658, 'commercial occurrences added must be 2658');
expect(report.summary.nc_rows_added === 17, 'NC rows added must be 17');
expect(report.summary.nc_occurrences_added === 259, 'NC occurrences added must be 259');
expect(report.summary.display_integrity_tbd_rows_added === 13, 'display TBD rows added must be 13');
expect(report.summary.display_integrity_tbd_occurrences_added === 129, 'display TBD occurrences added must be 129');
expect(report.summary.rows_blocked_within_agent6_verdict_boundary === 0, 'blocked rows must be 0');

for (const row of report.package_rows || []) {
  expect(labels.includes(row.provisional_label), `${row.target_token_id} invalid provisional label`);
  expect(row.placeholder_status === 'placeholder_only', `${row.target_token_id} must be placeholder_only`);
  expect(row.counterpart_text === 'TBD', `${row.target_token_id} must be TBD`);
  expect(row.placeholder_text_stored_now === true, `${row.target_token_id} placeholder flag must be true`);
  expect(row.definition_text_stored_now === false, `${row.target_token_id} definition text stored must be false`);
  expect(row.cleared_by_agent6_now === true, `${row.target_token_id} must be Agent6-cleared`);
  expect(row.added_to_non_public_placeholder_package === true, `${row.target_token_id} must be added`);
  expect(row.answer_eligible === false, `${row.target_token_id} answer eligibility must be false`);
  expect(row.public_emit_ready === false, `${row.target_token_id} public emit must be false`);
}

for (const row of (report.package_rows || []).filter((row) => row.lane === 'noncommercial_educational_candidate')) {
  expect(row.source_license_group === 'CC_BY_NC', `${row.target_token_id} NC license group must be CC_BY_NC`);
  expect(row.derived_from_nc === true, `${row.target_token_id} NC derived_from_nc must be true`);
  expect(row.commercial_export_allowed === false, `${row.target_token_id} NC commercial export must be false`);
  expect(row.attribution_required === true, `${row.target_token_id} NC attribution required`);
  expect(row.corpus_contamination === false, `${row.target_token_id} NC corpus contamination must be false`);
}

for (const row of (report.package_rows || []).filter((row) => row.subset === 'display_integrity_tbd')) {
  expect(row.display_separator_only === true, `${row.target_token_id} display separator flag must be true`);
  expect(row.lane === 'display_integrity_tbd_placeholder', `${row.target_token_id} display lane mismatch`);
}

const outputs = report.outputs_now || {};
for (const key of ['answer_rows', 'source_rows', 'public_hud_rows', 'route_jsonl_rows', 'definition_content_rows', 'nc_definition_content_rows']) {
  expect(outputs[key] === 0, `outputs_now.${key} must be 0`);
}
for (const key of ['public_mutation_files', 'runtime_files_touched', 'source_files_touched', 'token_index_files_touched', 'lexical_payload_files_touched']) {
  expect(Array.isArray(outputs[key]) && outputs[key].length === 0, `outputs_now.${key} must be empty`);
}

const text = fs.readFileSync(path.join(root, reportPath), 'utf8');
for (const forbidden of ['"definition_text_stored_now": true', '"answer_eligible": true', '"public_emit_ready": true', '"no_public_mutation": false', '"provisional_label": "definition"', '"provisional_label": "answer"', '"provisional_label": "translation"', '"provisional_label": "accepted gloss"', '"provisional_label": "verified"', '"provisional_label": "top match"']) {
  expect(!text.includes(forbidden), `must not contain ${forbidden}`);
}

if (issues.length) {
  console.error('owner-priority cleared placeholder package validation failed:');
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}
console.log(`owner-priority cleared placeholder package validation passed for ${reportPath}.`);

function expect(condition, message) {
  if (!condition) issues.push(message);
}
