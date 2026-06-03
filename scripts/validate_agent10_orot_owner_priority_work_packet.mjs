#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportPath = process.argv[2] || 'reports/agent10-orot-owner-priority-work-packet-2026-06-03.json';
const report = JSON.parse(fs.readFileSync(path.join(root, reportPath), 'utf8'));
const issues = [];
const labels = ['counterpart candidate', 'project-preferred counterpart candidate'];

expect(report.artifact_type === 'agent10_orot_owner_priority_work_packet', 'unexpected artifact_type');
for (const flag of ['pre_agent6_review', 'no_rows_added_before_agent6', 'no_answer_rows', 'no_public_hud_rows', 'no_route_jsonl_rows', 'no_definition_content_rows', 'no_nc_definition_content_storage', 'no_public_mutation', 'no_runtime_mutation']) {
  expect(report.boundary?.[flag] === true, `boundary.${flag} must be true`);
}

expect(report.summary.missed_dictionary_candidate_rows === 50, 'missed dictionary rows must be 50');
expect(report.summary.commercial_clean_candidate_rows === 33, 'commercial-clean rows must be 33');
expect(report.summary.nc_candidate_rows === 17, 'NC rows must be 17');
expect(report.summary.display_integrity_tbd_rows === 13, 'TBD rows must be 13');
expect(report.summary.rows_added_now === 0, 'rows_added_now must be 0');
expect(report.summary.rows_pending_agent6 === 63, 'pending Agent 6 rows must be 63');
expect(report.requested_agent6_decision?.no_public_runtime_route_requested === true, 'public/runtime route must not be requested');
expect(report.requested_agent6_decision?.objective_4_broad_discovery_after_orot_closeout === true, 'Objective 4 sequencing flag missing');
expect(typeof report.requested_agent6_decision?.objective_5_fallback_orot_finishing_after_priorities === 'string', 'Objective 5 fallback planning note missing');

for (const row of report.nc_klein_rows || []) {
  expect(row.lane === 'noncommercial_educational_candidate', `${row.token_id} NC lane mismatch`);
  expect(row.derived_from_nc === true, `${row.token_id} NC derived_from_nc must be true`);
  expect(row.commercial_export_allowed === false, `${row.token_id} NC commercial export must be false`);
  expect(row.attribution_required === true, `${row.token_id} NC attribution required`);
  expect(row.corpus_contamination === false, `${row.token_id} NC corpus contamination must be false`);
}

for (const row of [...(report.display_integrity_tbd_rows || []), ...(report.missed_dictionary_candidate_rows || [])]) {
  expect(labels.includes(row.provisional_label), `${row.token_id} invalid provisional label`);
  expect(row.counterpart_text === 'TBD', `${row.token_id} must use TBD`);
  expect(row.definition_text_stored_now === false, `${row.token_id} definition text must not be stored`);
  expect(row.add_only_if_agent6_clears === true, `${row.token_id} must be Agent6 gated`);
}

const outputs = report.outputs_now || {};
for (const key of ['answer_rows', 'source_rows', 'public_hud_rows', 'route_jsonl_rows', 'definition_content_rows', 'nc_definition_content_rows']) {
  expect(outputs[key] === 0, `outputs_now.${key} must be 0`);
}
expect(Array.isArray(outputs.public_mutation_files) && outputs.public_mutation_files.length === 0, 'public mutation files must be empty');

const text = fs.readFileSync(path.join(root, reportPath), 'utf8');
for (const forbidden of ['"provisional_label": "definition"', '"provisional_label": "answer"', '"provisional_label": "translation"', '"provisional_label": "accepted gloss"', '"provisional_label": "verified"', '"provisional_label": "top match"', '"definition_text_stored_now": true']) {
  expect(!text.includes(forbidden), `must not contain ${forbidden}`);
}

if (issues.length) {
  console.error(`owner-priority work packet validation failed:`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}
console.log(`owner-priority work packet validation passed for ${reportPath}.`);

function expect(condition, message) {
  if (!condition) issues.push(message);
}
