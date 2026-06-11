#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent2-orot-tbd-13-placeholder-inventory-consumption-2026-06-04.json';
const artifact = readJson(artifactPath);

const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(artifact.artifact_type === 'agent2_orot_tbd_13_placeholder_inventory_consumption', 'unexpected artifact_type');
expect(artifact.status === 'standing_queue_item_consumed_as_existing_non_public_display_integrity_inventory', 'unexpected status');
expect(artifact.package_anchor?.placeholder_rows === 332, 'expected package anchor rows 332');
expect(artifact.package_anchor?.placeholder_occurrences === 6156, 'expected package anchor occurrences 6156');
expect(artifact.counts?.display_integrity_tbd_rows === 13, 'expected 13 display-integrity TBD rows');
expect(artifact.counts?.display_integrity_tbd_occurrences === 129, 'expected 129 display-integrity TBD occurrences');
expect(Array.isArray(artifact.rows), 'rows must be an array');
expect(artifact.rows?.length === 13, 'rows array must contain 13 rows');

const occurrenceSum = (artifact.rows || []).reduce((total, row) => total + Number(row.occurrences || 0), 0);
expect(occurrenceSum === 129, 'row occurrence sum must be 129');

for (const [key, value] of Object.entries(artifact.counts || {})) {
  if (key.startsWith('display_integrity_tbd_')) continue;
  expect(value === 0, `expected zero ${key}`);
}

for (const row of artifact.rows || []) {
  expect(Boolean(row.token_id), 'row token_id is required');
  expect(row.inline_display === 'TBD', `row ${row.token_id} inline_display must be TBD`);
  expect(row.display === 'TBD', `row ${row.token_id} display must be TBD`);
  expect(row.counterpart_text === 'TBD', `row ${row.token_id} counterpart_text must be TBD`);
  expect(row.display_separator_only === true, `row ${row.token_id} must be display_separator_only`);
  expect(row.definition_text_stored_now === false, `row ${row.token_id} definition_text_stored_now must be false`);
  expect(row.nc_definition_content_stored_now === false, `row ${row.token_id} nc_definition_content_stored_now must be false`);
  expect(row.answer_eligible === false, `row ${row.token_id} answer_eligible must be false`);
  expect(row.promote_to_answer === false, `row ${row.token_id} promote_to_answer must be false`);
  expect(row.approved_for_public_emit === false, `row ${row.token_id} approved_for_public_emit must be false`);
  expect(row.public_hud_emit_allowed === false, `row ${row.token_id} public_hud_emit_allowed must be false`);
  expect(row.route_jsonl_emit_allowed === false, `row ${row.token_id} route_jsonl_emit_allowed must be false`);
}

expect(artifact.next_handoff?.consumer === 'Agent 10', 'next consumer must be Agent 10');
expect(String(artifact.next_handoff?.agent6_boundary || '').startsWith('none_opened_by_this_inventory'), 'Agent 6 boundary must not be opened by this inventory');
expect(Array.isArray(artifact.what_must_not_be_accepted), 'what_must_not_be_accepted must be present');
expect(artifact.what_must_not_be_accepted.includes('Definition authority'), 'Definition authority prohibition must be present');
expect(artifact.what_must_not_be_accepted.includes('answer eligibility'), 'answer eligibility prohibition must be present');
expect(artifact.what_must_not_be_accepted.includes('public reader output'), 'public reader output prohibition must be present');

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log('Agent 2 Orot TBD placeholder inventory consumption validation passed. Rows: 13; occurrences: 129.');

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}
