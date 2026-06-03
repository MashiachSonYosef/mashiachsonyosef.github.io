#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportPath = process.argv[2] || 'reports/agent10-orot-nc-public-display-boundary-request-2026-06-03.json';
const report = JSON.parse(fs.readFileSync(path.join(root, reportPath), 'utf8'));
const issues = [];

expect(report.artifact_type === 'agent10_orot_nc_public_display_boundary_request', 'unexpected artifact_type');
for (const flag of ['pre_agent6_review', 'no_public_mutation_now', 'no_runtime_mutation_now', 'no_public_hud_rows_written_now', 'no_route_jsonl_rows', 'no_source_rows', 'no_definition_content_rows', 'no_nc_definition_content_rows', 'no_answer_rows', 'no_accepted_text', 'no_commercial_export_now']) {
  expect(report.boundary?.[flag] === true, `boundary.${flag} must be true`);
}
expect(report.summary.nc_rows === 17, 'NC rows must be 17');
expect(report.summary.nc_occurrences === 259, 'NC occurrences must be 259');
expect(report.summary.rows_added_now === 0, 'rows added now must be 0');

for (const row of report.rows || []) {
  expect(row.lane === 'noncommercial_educational_candidate', `${row.token_id} lane mismatch`);
  expect(row.source_license_group === 'CC_BY_NC', `${row.token_id} license group mismatch`);
  expect(row.derived_from_nc === true, `${row.token_id} derived_from_nc must be true`);
  expect(row.commercial_export_allowed === false, `${row.token_id} commercial export must be false`);
  expect(row.attribution_required === true, `${row.token_id} attribution required`);
  expect(row.corpus_contamination === false, `${row.token_id} contamination must be false`);
  expect(row.definition_text_stored_now === false, `${row.token_id} definition text must be false`);
  expect(row.nc_definition_content_stored_now === false, `${row.token_id} NC definition content must be false`);
  expect(row.public_metadata_display_authorized_now === false, `${row.token_id} public metadata display must not be authorized now`);
  expect(row.public_placeholder_emit_authorized_now === false, `${row.token_id} public placeholder emit must not be authorized now`);
  const proposed = row.proposed_public_fields_if_cleared || {};
  expect(!Object.hasOwn(proposed, 'display'), `${row.token_id} proposed public fields must not include display`);
  expect(!Object.hasOwn(proposed, 'inline_display'), `${row.token_id} proposed public fields must not include inline_display`);
  expect(!Object.hasOwn(proposed, 'counterpart_text'), `${row.token_id} proposed public fields must not include counterpart_text`);
  expect(!Object.hasOwn(proposed, 'headwords'), `${row.token_id} proposed public fields must not include headwords`);
}

const outputs = report.outputs_now || {};
for (const key of ['public_hud_rows_written', 'runtime_files_changed', 'route_jsonl_rows', 'route_shard_writes', 'source_rows', 'definition_content_rows', 'nc_definition_content_rows', 'answer_rows', 'accepted_text_rows', 'commercial_export_rows']) {
  expect(outputs[key] === 0, `outputs_now.${key} must be 0`);
}
const text = fs.readFileSync(path.join(root, reportPath), 'utf8');
for (const forbidden of ['"definition_text_stored_now": true', '"nc_definition_content_stored_now": true', '"answer_eligible": true', '"accepted_text": true']) {
  expect(!text.includes(forbidden), `must not contain ${forbidden}`);
}

if (issues.length) {
  console.error('NC public display boundary request validation failed:');
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}
console.log(`NC public display boundary request validation passed for ${reportPath}.`);

function expect(condition, message) {
  if (!condition) issues.push(message);
}
