#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const publicHintsPath = 'data/public-hud/orot/reader-hints.json';
const reportPath = 'reports/agent10-orot-nc-changed-public-package-2026-06-03.json';
const hints = readJson(publicHintsPath);
const report = readJson(reportPath);
const request = readJson('reports/agent10-orot-nc-public-display-boundary-request-2026-06-03.json');
const hintRows = hints.hints && typeof hints.hints === 'object' ? hints.hints : hints.hints_by_token_id;
const issues = [];

expect(report.artifact_type === 'agent10_orot_nc_changed_public_package', 'unexpected report artifact_type');
expect(report.summary.nc_pending_review_rows_added === 17, 'NC pending rows added must be 17');
expect(report.summary.nc_pending_review_occurrences_added === 259, 'NC pending occurrences must be 259');
expect(report.summary.public_hint_rows_after === 8759, 'public hint rows after must be 8759');
expect(report.summary.public_hint_occurrences_after === 40461, 'public hint occurrences after must be 40461');
expect(report.summary.definition_content_rows === 0, 'definition content rows must be 0');
expect(report.summary.nc_definition_content_rows === 0, 'NC definition content rows must be 0');
expect(report.summary.answer_rows === 0, 'answer rows must be 0');
expect(report.summary.commercial_export_rows === 0, 'commercial export rows must be 0');

for (const source of request.rows || []) {
  const row = hintRows?.[source.token_id];
  expect(Boolean(row), `${source.token_id} missing from public hints`);
  if (!row) continue;
  expect(!Object.hasOwn(row, 'display'), `${source.token_id} must not include display`);
  expect(!Object.hasOwn(row, 'inline_display'), `${source.token_id} must not include inline_display`);
  expect(!Object.hasOwn(row, 'counterpart_text'), `${source.token_id} must not include counterpart_text`);
  expect(!Object.hasOwn(row, 'headwords'), `${source.token_id} must not include headwords`);
  expect(row.placeholder_kind === 'reader_hint_pending_review', `${source.token_id} placeholder_kind mismatch`);
  expect(row.review_state === 'placeholder_pending_review', `${source.token_id} review_state mismatch`);
  expect(row.placeholder_text === 'TBD', `${source.token_id} placeholder_text must be TBD`);
  expect(row.license_group === 'CC_BY_NC', `${source.token_id} license group must be CC_BY_NC`);
  expect(row.derived_from_nc === true, `${source.token_id} derived_from_nc must be true`);
  expect(row.commercial_export_allowed === false, `${source.token_id} commercial export must be false`);
  expect(row.commercial_export_exclusion_required === true, `${source.token_id} commercial export exclusion required`);
  expect(row.attribution_notice_key === 'klein_cc_by_nc_noncommercial_educational', `${source.token_id} attribution notice key mismatch`);
  expect(String(row.attribution_notice || '').includes('Klein Dictionary'), `${source.token_id} attribution notice must name Klein`);
  expect(String(row.attribution_notice || '').includes('CC BY-NC'), `${source.token_id} attribution notice must name CC BY-NC`);
  expect(row.nc_definition_content_stored_now === false, `${source.token_id} NC definition content must be false`);
  expect(row.definition_text_stored_now === false, `${source.token_id} definition text must be false`);
  expect(row.answer_eligible === false, `${source.token_id} answer eligibility must be false`);
  expect(row.accepted_text === false, `${source.token_id} accepted text must be false`);
}

const text = fs.readFileSync(path.join(root, publicHintsPath), 'utf8');
for (const forbidden of ['"display": "TBD"', '"inline_display": "TBD"', '"counterpart_text": "TBD"', '"definition_text_stored_now": true', '"nc_definition_content_stored_now": true', '"answer_eligible": true', '"accepted_text": true']) {
  expect(!text.includes(forbidden), `public hints must not contain ${forbidden}`);
}

if (issues.length) {
  console.error('NC changed public package validation failed:');
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}
console.log('NC changed public package validation passed.');

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}
function expect(condition, message) {
  if (!condition) issues.push(message);
}
