#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const publicHintsPath = 'data/public-hud/orot/reader-hints.json';
const reportPath = 'reports/agent10-orot-display-integrity-changed-public-package-2026-06-03.json';
const hints = readJson(publicHintsPath);
const report = readJson(reportPath);
const issues = [];
const hintRows = hints.hints && typeof hints.hints === 'object' ? hints.hints : hints.hints_by_token_id;
const expectedIds = [
  'tok-bf10df974281',
  'tok-17ba65351831',
  'tok-6b169f83d239',
  'tok-f4684f98dd3c',
  'tok-21ae8291f6e3',
  'tok-061fb7148fbc',
  'tok-12f1b38c8e82',
  'tok-4a2aa0e83513',
  'tok-4c95bb88fb43',
  'tok-7079eb2eb5bb',
  'tok-e634000d8416',
  'tok-e7e3dabf0cb3',
  'tok-f87dd75a1506',
];

expect(report.artifact_type === 'agent10_orot_display_integrity_changed_public_package', 'unexpected report artifact_type');
expect(report.summary.pending_review_rows_added === 13, 'pending review rows added must be 13');
expect(report.summary.pending_review_occurrences_added === 129, 'pending review occurrences must be 129');
expect(report.summary.public_hint_rows_after === 8742, 'public hint rows after must be 8742');
expect(report.summary.public_hint_occurrences_after === 40202, 'public hint occurrences after must be 40202');
expect(report.summary.route_jsonl_rows === 0, 'route JSONL rows must be 0');
expect(report.summary.definition_content_rows === 0, 'definition content rows must be 0');
expect(report.summary.answer_rows === 0, 'answer rows must be 0');
expect(hints.pending_review_placeholders?.rows === 13, 'top-level pending-review row count must be 13');
expect(hints.pending_review_placeholders?.fields_removed?.includes('display'), 'fields_removed must include display');
expect(hints.pending_review_placeholders?.fields_removed?.includes('inline_display'), 'fields_removed must include inline_display');
expect(hints.pending_review_placeholders?.fields_removed?.includes('counterpart_text'), 'fields_removed must include counterpart_text');

for (const tokenId of expectedIds) {
  const row = hintRows?.[tokenId];
  expect(Boolean(row), `${tokenId} missing from public hints`);
  if (!row) continue;
  expect(!Object.hasOwn(row, 'display'), `${tokenId} must not include display`);
  expect(!Object.hasOwn(row, 'inline_display'), `${tokenId} must not include inline_display`);
  expect(!Object.hasOwn(row, 'counterpart_text'), `${tokenId} must not include counterpart_text`);
  expect(row.placeholder_kind === 'reader_hint_pending_review', `${tokenId} placeholder_kind mismatch`);
  expect(row.review_state === 'placeholder_pending_review', `${tokenId} review_state mismatch`);
  expect(row.placeholder_text === 'TBD', `${tokenId} placeholder text must be TBD`);
  expect(row.display_state === 'pending_reader_hint_review', `${tokenId} display_state mismatch`);
  expect(row.public_placeholder_emit_allowed_now === true, `${tokenId} placeholder emit must be allowed by shape docket`);
  expect(row.answer_eligible === false, `${tokenId} answer eligibility must be false`);
  expect(row.definition_text_stored_now === false, `${tokenId} definition text must be false`);
  expect(row.nc_definition_content_stored_now === false, `${tokenId} NC definition content must be false`);
  expect(row.route_jsonl_emit_allowed === false, `${tokenId} route JSONL emit must be false`);
  expect(row.source_rows_emitted === false, `${tokenId} source rows emitted must be false`);
  expect(row.accepted_text === false, `${tokenId} accepted text must be false`);
}

const text = fs.readFileSync(path.join(root, publicHintsPath), 'utf8');
for (const forbidden of ['"display": "TBD"', '"inline_display": "TBD"', '"counterpart_text": "TBD"', '"definition_text_stored_now": true', '"answer_eligible": true', '"accepted_text": true']) {
  expect(!text.includes(forbidden), `public hints must not contain ${forbidden}`);
}

if (issues.length) {
  console.error('display-integrity changed public package validation failed:');
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}
console.log('display-integrity changed public package validation passed.');

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}
function expect(condition, message) {
  if (!condition) issues.push(message);
}
