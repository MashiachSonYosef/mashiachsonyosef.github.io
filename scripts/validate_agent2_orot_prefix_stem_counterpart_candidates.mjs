#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const report = process.argv[2] || 'reports/agent2-orot-prefix-stem-counterpart-candidates-2026-06-03.json';
const data = JSON.parse(fs.readFileSync(path.join(root, report), 'utf8'));
const issues = [];

expect(data.artifact_type === 'agent2_orot_prefix_stem_counterpart_candidates', 'unexpected artifact_type');
expect(data.boundary?.status === 'report_only_no_answer_rows_no_public_hud_output', 'unexpected boundary status');
expect(data.boundary?.pipeline_only === true, 'missing pipeline_only boundary');
expect(data.boundary?.not_definition_authority === true, 'missing not_definition_authority boundary');
expect(data.boundary?.not_usage_as_definition === true, 'missing not_usage_as_definition boundary');
expect(data.boundary?.not_public_runtime_acceptance === true, 'missing not_public_runtime_acceptance boundary');
expect(data.outputs?.route_jsonl === null, 'route_jsonl output must be null');
expect(data.outputs?.public_hud_output === null, 'public_hud_output must be null');

expect(data.counts?.input_rows === 100, 'expected 100 input rows');
expect(data.counts?.input_occurrences === 1960, 'expected 1960 input occurrences');
expect(data.counts?.candidate_rows === 12, 'expected 12 candidate rows');
expect(data.counts?.candidate_occurrences === 178, 'expected 178 candidate occurrences');
expect(data.counts?.blocked_rows === 88, 'expected 88 blocked rows');
expect(data.counts?.blocked_occurrences === 1782, 'expected 1782 blocked occurrences');
expect(data.counts?.answer_rows_emitted === 0, 'answer rows emitted must be 0');
expect(data.counts?.public_hud_rows_emitted === 0, 'public HUD rows emitted must be 0');
expect(data.counts?.match_percent_available_rows === 0, 'match percent must not be inferred');

const expectedBlockers = {
  blocked_requires_project_preferred_lineage_contract: 19,
  blocked_no_upstream_claim: 14,
  blocked_source_linkage_or_source_issue: 13,
  blocked_ambiguous_stem_claims: 42,
};
for (const [key, expected] of Object.entries(expectedBlockers)) {
  expect(data.counts?.blocker_counts?.[key] === expected, `blocker ${key} expected ${expected}`);
}

for (const row of data.candidates || []) {
  expect(row.status === 'counterpart_candidate_report_only', `${row.queue_id} unexpected status`);
  expect(row.public_emit_ready === false, `${row.queue_id} public_emit_ready must be false`);
  expect(row.answer_eligible === false, `${row.queue_id} answer_eligible must be false`);
  expect(row.promote_to_answer === false, `${row.queue_id} promote_to_answer must be false`);
  expect(row.match_percent === null, `${row.queue_id} match_percent must be null`);
  expect(row.match_percent_status === 'not_available_in_lineage_candidate_input', `${row.queue_id} unexpected match percent status`);
  expect(Boolean(row.upstream?.claim_id), `${row.queue_id} missing upstream claim_id`);
  expect(Boolean(row.upstream?.claim_file), `${row.queue_id} missing upstream claim_file`);
  expect(Boolean(row.upstream?.counterpart_candidate_display), `${row.queue_id} missing counterpart candidate display`);
  expect(Array.isArray(row.upstream?.source_rows) && row.upstream.source_rows.length > 0, `${row.queue_id} missing upstream source rows`);
  expect(Array.isArray(row.not_claimed) && row.not_claimed.includes('definition authority'), `${row.queue_id} missing no-definition boundary`);
}

if (issues.length) {
  console.error(`Agent 2 Orot prefix/stem counterpart candidate validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 2 Orot prefix/stem counterpart candidate validation passed for ${report}.`);

function expect(condition, message) {
  if (!condition) issues.push(message);
}
