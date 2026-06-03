#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packagePath = process.argv[2] || 'data/build/orot/reader-hint-placeholder-candidates.json';
const data = JSON.parse(fs.readFileSync(path.join(root, packagePath), 'utf8'));
const issues = [];
const labels = ['counterpart candidate', 'project-preferred counterpart candidate'];

expect(data.artifact_type === 'orot_non_public_reader_hint_placeholder_candidates', 'unexpected artifact_type');
expect(data.publication_status === 'non_public_candidate_package_only', 'must be non-public package only');
for (const flag of ['exact_agent6_boundary_only', 'non_public_package_only', 'no_public_hud_output', 'no_route_jsonl_rows', 'no_route_shard_writes', 'no_runtime_files', 'no_public_mutation', 'no_source_files', 'no_token_index_files', 'no_lexical_payload_files', 'no_definition_content_rows', 'no_nc_definition_content_rows', 'no_answer_eligibility', 'no_accepted_text']) {
  expect(data.boundary?.[flag] === true, `boundary.${flag} must be true`);
}
const rows = data.rows || [];
const commercialRows = rows.filter((row) => row.lane === 'commercial_clean_candidate');
const ncRows = rows.filter((row) => row.lane === 'noncommercial_educational_candidate');
const displayRows = rows.filter((row) => row.lane === 'display_integrity_tbd_placeholder' || row.subset === 'display_integrity_tbd');
expect(data.counts.placeholder_rows === rows.length, 'placeholder row count must match rows length');
expect(data.counts.placeholder_occurrences === sum(rows.map((row) => row.occurrences)), 'placeholder occurrences must match rows');
expect(data.counts.commercial_clean_rows === commercialRows.length, 'commercial row count mismatch');
expect(data.counts.noncommercial_educational_rows === ncRows.length, 'NC row count mismatch');
expect(data.counts.display_integrity_tbd_rows === displayRows.length, 'display TBD row count mismatch');
expect(Object.keys(data.hints_by_token_id || {}).length === rows.length, 'hints_by_token_id count must match rows length');
for (const row of rows) {
  expect(data.hints_by_token_id[row.token_id]?.token_id === row.token_id, `${row.token_id} missing from hints_by_token_id`);
  expect(row.inline_display === 'TBD' && row.display === 'TBD' && row.counterpart_text === 'TBD', `${row.token_id} must use TBD`);
  expect(labels.includes(row.label), `${row.token_id} invalid label`);
  expect(row.definition_text_stored_now === false, `${row.token_id} definition text stored must be false`);
  expect(row.nc_definition_content_stored_now === false, `${row.token_id} NC definition text stored must be false`);
  expect(row.answer_eligible === false, `${row.token_id} answer eligibility must be false`);
  expect(row.public_emit_ready === false, `${row.token_id} public emit must be false`);
  expect(row.public_hud_emit_allowed === false, `${row.token_id} public HUD emit must be false`);
  expect(row.route_jsonl_emit_allowed === false, `${row.token_id} route JSONL emit must be false`);
}
for (const row of ncRows) {
  expect(row.source_license_group === 'CC_BY_NC', `${row.token_id} NC source license group mismatch`);
  expect(row.derived_from_nc === true, `${row.token_id} NC derived_from_nc must be true`);
  expect(row.commercial_export_allowed === false, `${row.token_id} NC commercial export must be false`);
  expect(row.attribution_required === true, `${row.token_id} NC attribution required`);
  expect(row.corpus_contamination === false, `${row.token_id} NC corpus contamination must be false`);
}

const jsonText = fs.readFileSync(path.join(root, packagePath), 'utf8');
for (const forbidden of ['"definition_text_stored_now": true', '"nc_definition_content_stored_now": true', '"answer_eligible": true', '"public_emit_ready": true', '"public_hud_emit_allowed": true', '"route_jsonl_emit_allowed": true', '"label": "definition"', '"label": "answer"', '"label": "translation"', '"label": "accepted gloss"', '"label": "verified"', '"label": "top match"']) {
  expect(!jsonText.includes(forbidden), `must not contain ${forbidden}`);
}
expect(fs.existsSync(path.join(root, 'reports/agent10-orot-non-public-reader-hint-placeholder-package-2026-06-03.md')), 'companion report missing');

if (issues.length) {
  console.error('non-public reader-hint placeholder package validation failed:');
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}
console.log(`non-public reader-hint placeholder package validation passed for ${packagePath}.`);

function expect(condition, message) {
  if (!condition) issues.push(message);
}
function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}
