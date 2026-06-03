#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const report = process.argv[2] || 'reports/agent10-agent6-ready-orot-project-preferred-contract-packet-2026-06-03.json';
const data = JSON.parse(fs.readFileSync(path.join(root, report), 'utf8'));
const issues = [];

expect(data.artifact_type === 'agent10_agent6_ready_orot_project_preferred_contract_packet', 'unexpected artifact_type');
expect(data.boundary?.status === 'agent6_ready_project_preferred_contract_packet_not_approved', 'unexpected boundary status');
expect(data.boundary?.no_agent6_verdict === true, 'must not claim Agent 6 verdict');
expect(data.boundary?.no_qa_acceptance === true, 'must not claim QA acceptance');
expect(data.boundary?.no_source_custody === true, 'must not claim source custody');
expect(data.boundary?.no_definition_authority === true, 'must not claim definition authority');
expect(data.boundary?.no_usage_as_definition === true, 'must not claim usage as definition');
expect(data.boundary?.no_public_runtime_acceptance === true, 'must not claim public runtime acceptance');
expect(data.boundary?.no_public_hud_mutation === true, 'must not mutate public HUD');
expect(data.outputs?.route_jsonl === null, 'route_jsonl output must be null');
expect(data.outputs?.public_hud_output === null, 'public_hud_output must be null');

expect(data.proposed_contract?.name === 'OROT_PROJECT_PREFERRED_MULTI_STEM_COUNTERPART_DISPLAY_V1', 'unexpected contract name');
expect(data.summary?.candidate_rows === 19, 'expected 19 candidate rows');
expect(data.summary?.candidate_occurrences === 1024, 'expected 1024 candidate occurrences');
expect(data.summary?.selected_project_edges === 19, 'expected 19 selected project edges');
expect(data.summary?.competing_edges === 46, 'expected 46 competing edges');
expect(data.summary?.total_edges === 65, 'expected 65 total edges');
expect(data.summary?.answer_rows_emitted === 0, 'answer rows emitted must be 0');
expect(data.summary?.public_hud_rows_emitted === 0, 'public HUD rows emitted must be 0');
expect(data.summary?.match_percent_available_rows === 0, 'match percent must not be inferred');
expect(data.summary?.live_old_hud_exposure === 'no', 'live old HUD exposure must be no');
expect(data.summary?.issues === 0, 'packet issues must be 0');

const expectedDistribution = { 2: 6, 3: 8, 4: 2, 5: 1, 8: 2 };
for (const [edgeCount, expected] of Object.entries(expectedDistribution)) {
  expect(data.summary?.edge_count_distribution?.[edgeCount] === expected, `edge count distribution ${edgeCount} expected ${expected}`);
}
const expectedOccurrenceDistribution = { 2: 767, 3: 146, 4: 7, 5: 87, 8: 17 };
for (const [edgeCount, expected] of Object.entries(expectedOccurrenceDistribution)) {
  expect(data.summary?.edge_occurrence_distribution?.[edgeCount] === expected, `edge occurrence distribution ${edgeCount} expected ${expected}`);
}

const prohibited = new Set(data.proposed_contract?.prohibited_under_this_contract || []);
for (const required of ['answer_eligible=true', 'promote_to_answer=true', 'using highest score as truth', 'accepted translation text']) {
  expect(prohibited.has(required), `missing prohibited item: ${required}`);
}

for (const row of data.candidates || []) {
  expect(row.status === 'project_preferred_contract_review_candidate', `${row.queue_id} unexpected row status`);
  expect(row.release_contract_status === 'review_candidate_not_approved', `${row.queue_id} must remain not approved`);
  expect(row.project_edge_count === 1, `${row.queue_id} must have exactly one project edge`);
  expect(row.edge_count > 1, `${row.queue_id} must have competing edges`);
  expect(row.competing_edge_count === row.edge_count - 1, `${row.queue_id} competing edge count mismatch`);
  expect(row.selected_project_edge?.upstream_route_family === 'project_lexical', `${row.queue_id} selected edge must be project_lexical`);
  expect(row.selected_project_edge?.promote_to_answer === false, `${row.queue_id} selected edge must not promote`);
  expect(row.competing_edges.every((edge) => edge.promote_to_answer === false), `${row.queue_id} competing edge must not promote`);
  expect(row.match_percent === null, `${row.queue_id} match_percent must be null`);
  expect(row.public_emit_ready === false, `${row.queue_id} public_emit_ready must be false`);
  expect(row.answer_eligible === false, `${row.queue_id} answer_eligible must be false`);
  expect(row.promote_to_answer === false, `${row.queue_id} promote_to_answer must be false`);
}

if (issues.length) {
  console.error(`Agent 10 Orot project-preferred contract packet validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 10 Orot project-preferred contract packet validation passed for ${report}.`);

function expect(condition, message) {
  if (!condition) issues.push(message);
}
