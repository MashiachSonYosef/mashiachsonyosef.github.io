#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportPath = process.argv[2] || 'reports/agent10-orot-license-safe-cleared-placeholder-package-2026-06-03.json';
const report = JSON.parse(fs.readFileSync(path.join(root, reportPath), 'utf8'));
const issues = [];
const labels = ['counterpart candidate', 'project-preferred counterpart candidate'];

expect(report.artifact_type === 'agent10_orot_license_safe_cleared_placeholder_package', 'unexpected artifact_type');
for (const flag of ['exact_agent6_boundary_only', 'non_public_package_only', 'no_answer_rows', 'no_source_rows_emitted', 'no_public_hud_rows', 'no_route_jsonl_rows', 'no_definition_content_rows', 'no_nc_definition_content_storage', 'no_public_mutation', 'no_runtime_mutation']) {
  expect(report.boundary?.[flag] === true, `boundary.${flag} must be true`);
}

expect(report.agent6_verdict_recount.cleared_ids_found_in_verdict === 50, 'Agent 6 cleared id count must be 50');
expect(report.agent6_verdict_recount.missing_cleared_ids_in_candidate_packet.length === 0, 'all cleared ids must exist in candidate packet');
expect(report.summary.rows_added_to_non_public_placeholder_package === 50, 'rows added must be 50');
expect(report.summary.commercial_clean_rows_added === 33, 'commercial rows added must be 33');
expect(report.summary.nc_rows_added === 17, 'NC rows added must be 17');
expect(report.summary.owner_priority_tbd_rows_pending_agent6 === 13, '13 TBD rows must remain pending Agent 6');

for (const row of report.package_rows || []) {
  expect(labels.includes(row.provisional_label), `${row.target_token_id} invalid provisional label`);
  expect(row.placeholder_status === 'placeholder_only', `${row.target_token_id} must be placeholder_only`);
  expect(row.counterpart_text === 'TBD', `${row.target_token_id} must be TBD`);
  expect(row.placeholder_text_stored_now === true, `${row.target_token_id} placeholder text stored flag must be true`);
  expect(row.definition_text_stored_now === false, `${row.target_token_id} definition text stored must be false`);
  expect(row.cleared_by_agent6_now === true, `${row.target_token_id} must be Agent6-cleared`);
  expect(row.added_to_non_public_placeholder_package === true, `${row.target_token_id} must be added to package`);
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

const outputs = report.outputs_now || {};
for (const key of ['answer_rows', 'source_rows', 'public_hud_rows', 'route_jsonl_rows', 'definition_content_rows', 'nc_definition_content_rows']) {
  expect(outputs[key] === 0, `outputs_now.${key} must be 0`);
}
expect(Array.isArray(outputs.public_mutation_files) && outputs.public_mutation_files.length === 0, 'public mutation files must be empty');

const text = fs.readFileSync(path.join(root, reportPath), 'utf8');
for (const forbidden of ['"definition_text_stored_now": true', '"answer_eligible": true', '"public_emit_ready": true', '"no_public_mutation": false']) {
  expect(!text.includes(forbidden), `must not contain ${forbidden}`);
}

if (issues.length) {
  console.error('cleared placeholder package validation failed:');
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}
console.log(`cleared placeholder package validation passed for ${reportPath}.`);

function expect(condition, message) {
  if (!condition) issues.push(message);
}
