#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportPath = process.argv[2] || 'reports/agent10-orot-next-missed-dictionary-placeholder-candidates-2026-06-03.json';
const report = JSON.parse(fs.readFileSync(path.join(root, reportPath), 'utf8'));
const issues = [];
const allowedLabels = ['counterpart candidate', 'project-preferred counterpart candidate'];
const allowedFamilies = ['BDB Dictionary', 'BDB Aramaic Dictionary', 'Jastrow Dictionary', 'Klein Dictionary'];
const publicHints = readJson('data/public-hud/orot/reader-hints.json');
const priorPackage = readJson('data/build/orot/reader-hint-placeholder-candidates.json');

expect(report.artifact_type === 'agent10_orot_next_missed_dictionary_placeholder_candidates', 'unexpected artifact_type');
for (const flag of ['pre_agent6_review', 'no_rows_added_before_agent6', 'no_answer_rows', 'no_public_hud_rows', 'no_route_jsonl_rows', 'no_definition_content_rows', 'no_nc_definition_content_storage', 'no_public_mutation', 'no_runtime_mutation']) {
  expect(report.boundary?.[flag] === true, `boundary.${flag} must be true`);
}
expect(report.summary.candidate_rows === 50, 'candidate rows must be 50');
expect(report.summary.rows_added_now === 0, 'rows_added_now must be 0');
expect(report.summary.rows_blocked_pending_agent6 === 50, 'rows pending Agent 6 must be 50');
expect(report.summary.candidate_occurrences > 0, 'candidate occurrences must be positive');

const used = new Set([
  ...Object.keys(publicHints.hints_by_token_id || {}),
  ...(priorPackage.rows || []).map((row) => row.token_id),
]);
const seen = new Set();
for (const row of report.rows || []) {
  expect(!seen.has(row.target_token_id), `${row.target_token_id} duplicate row`);
  seen.add(row.target_token_id);
  expect(!used.has(row.target_token_id), `${row.target_token_id} already public or packaged`);
  expect(allowedLabels.includes(row.provisional_label), `${row.target_token_id} invalid provisional label`);
  expect(row.counterpart_text === 'TBD', `${row.target_token_id} must use TBD`);
  expect(row.placeholder_status === 'placeholder_only', `${row.target_token_id} must be placeholder-only`);
  expect(row.definition_text_stored_now === false, `${row.target_token_id} definition text must not be stored`);
  expect(row.answer_eligible === false, `${row.target_token_id} answer eligibility must be false`);
  expect(row.public_emit_ready === false, `${row.target_token_id} public emit must be false`);
  expect(row.add_now_before_agent6 === false, `${row.target_token_id} add_now_before_agent6 must be false`);
  expect(row.cleared_by_agent6_now === false, `${row.target_token_id} cleared_by_agent6_now must be false`);
  expect(row.source_families.every((family) => allowedFamilies.includes(family)), `${row.target_token_id} has disallowed source family`);
  expect(!row.source_families.includes('BDB Augmented Strong'), `${row.target_token_id} must not use BDB Augmented Strong`);
  if (row.lane === 'noncommercial_educational_candidate') {
    expect(row.source_license_group === 'CC_BY_NC', `${row.target_token_id} NC license group mismatch`);
    expect(row.derived_from_nc === true, `${row.target_token_id} NC derived_from_nc must be true`);
    expect(row.commercial_export_allowed === false, `${row.target_token_id} NC commercial export must be false`);
    expect(row.attribution_required === true, `${row.target_token_id} NC attribution required`);
    expect(row.corpus_contamination === false, `${row.target_token_id} NC contamination must be false`);
  }
}

const outputs = report.outputs_now || {};
for (const key of ['answer_rows', 'source_rows', 'public_hud_rows', 'route_jsonl_rows', 'definition_content_rows', 'nc_definition_content_rows']) {
  expect(outputs[key] === 0, `outputs_now.${key} must be 0`);
}
const text = fs.readFileSync(path.join(root, reportPath), 'utf8');
for (const forbidden of ['"provisional_label": "definition"', '"provisional_label": "answer"', '"provisional_label": "translation"', '"provisional_label": "accepted gloss"', '"provisional_label": "verified"', '"provisional_label": "top match"', '"definition_text_stored_now": true']) {
  expect(!text.includes(forbidden), `must not contain ${forbidden}`);
}

if (issues.length) {
  console.error('next missed-dictionary placeholder candidate validation failed:');
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}
console.log(`next missed-dictionary placeholder candidate validation passed for ${reportPath}.`);

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}
function expect(condition, message) {
  if (!condition) issues.push(message);
}
