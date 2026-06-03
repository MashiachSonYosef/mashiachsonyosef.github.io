#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportPath = process.argv[2] || 'reports/agent10-orot-display-integrity-fallback-export-packet-2026-06-03.json';
const report = JSON.parse(fs.readFileSync(path.join(root, reportPath), 'utf8'));
const issues = [];

expect(report.artifact_type === 'agent10_orot_display_integrity_fallback_export_packet', 'unexpected artifact_type');
expect(report.boundary?.direct_public_tbd_fields_removed === true, 'direct public TBD fields removed flag missing');
for (const flag of ['pre_agent6_review', 'no_public_mutation_now', 'no_runtime_mutation_now', 'no_public_hud_rows_written_now', 'no_route_jsonl_rows', 'no_source_rows', 'no_definition_content_rows', 'no_nc_definition_content_rows', 'no_answer_rows', 'no_accepted_text']) {
  expect(report.boundary?.[flag] === true, `boundary.${flag} must be true`);
}
expect(report.summary.fallback_export_candidate_rows === 13, 'fallback rows must be 13');
expect(report.summary.fallback_export_candidate_occurrences === 129, 'fallback occurrences must be 129');
expect(report.summary.public_overlap_rows === 0, 'public overlaps must be 0');
expect(report.summary.rows_added_now === 0, 'rows added now must be 0');

for (const row of report.proposed_export_rows || []) {
  expect(!Object.hasOwn(row, 'display'), `${row.token_id} must not emit display`);
  expect(!Object.hasOwn(row, 'inline_display'), `${row.token_id} must not emit inline_display`);
  expect(!Object.hasOwn(row, 'counterpart_text'), `${row.token_id} must not emit counterpart_text`);
  expect(row.placeholder_kind === 'reader_hint_pending_review', `${row.token_id} placeholder_kind mismatch`);
  expect(row.review_state === 'placeholder_pending_review', `${row.token_id} review_state mismatch`);
  expect(row.placeholder_text === 'TBD', `${row.token_id} placeholder_text must be TBD`);
  expect(row.display_state === 'pending_reader_hint_review', `${row.token_id} display_state mismatch`);
  expect(row.answer_eligible === false, `${row.token_id} answer eligibility must be false`);
  expect(row.definition_text_stored_now === false, `${row.token_id} definition text must be false`);
  expect(row.public_placeholder_emit_allowed_now === false, `${row.token_id} public placeholder emit must not be cleared now`);
  expect(row.route_jsonl_emit_allowed === false, `${row.token_id} route jsonl emit must be false`);
  expect(row.source_rows_emitted === false, `${row.token_id} source rows emitted must be false`);
  expect(row.accepted_text === false, `${row.token_id} accepted text must be false`);
  expect(row.merge_safe_no_existing_public_hint === true, `${row.token_id} must not overlap existing public hint`);
}

const outputs = report.outputs_now || {};
for (const key of ['public_hud_rows_written', 'runtime_files_changed', 'route_jsonl_rows', 'route_shard_writes', 'source_rows', 'definition_content_rows', 'nc_definition_content_rows', 'answer_rows', 'accepted_text_rows']) {
  expect(outputs[key] === 0, `outputs_now.${key} must be 0`);
}
const text = fs.readFileSync(path.join(root, reportPath), 'utf8');
for (const forbidden of ['"display": "TBD"', '"inline_display": "TBD"', '"counterpart_text": "TBD"', '"definition_text_stored_now": true', '"answer_eligible": true']) {
  expect(!text.includes(forbidden), `must not contain ${forbidden}`);
}

if (issues.length) {
  console.error('display-integrity fallback export packet validation failed:');
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}
console.log(`display-integrity fallback export packet validation passed for ${reportPath}.`);

function expect(condition, message) {
  if (!condition) issues.push(message);
}
