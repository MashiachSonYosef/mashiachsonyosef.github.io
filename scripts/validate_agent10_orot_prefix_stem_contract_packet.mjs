#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const report = process.argv[2] || 'reports/agent10-agent6-ready-orot-prefix-stem-contract-packet-2026-06-03.json';
const data = JSON.parse(fs.readFileSync(path.join(root, report), 'utf8'));
const issues = [];

expect(data.artifact_type === 'agent10_agent6_ready_orot_prefix_stem_contract_packet', 'unexpected artifact_type');
expect(data.boundary?.status === 'agent6_ready_contract_packet_not_approved', 'unexpected boundary status');
expect(data.boundary?.no_agent6_verdict === true, 'must not claim Agent 6 verdict');
expect(data.boundary?.no_qa_acceptance === true, 'must not claim QA acceptance');
expect(data.boundary?.no_source_custody === true, 'must not claim source custody');
expect(data.boundary?.no_definition_authority === true, 'must not claim definition authority');
expect(data.boundary?.no_usage_as_definition === true, 'must not claim usage as definition');
expect(data.boundary?.no_public_runtime_acceptance === true, 'must not claim public runtime acceptance');
expect(data.boundary?.no_public_hud_mutation === true, 'must not mutate public HUD');

expect(data.proposed_contract?.name === 'OROT_PREFIX_STEM_COUNTERPART_DISPLAY_V1', 'unexpected contract name');
expect(data.summary?.candidate_rows === 12, 'expected 12 candidate rows');
expect(data.summary?.candidate_occurrences === 178, 'expected 178 candidate occurrences');
expect(data.summary?.answer_rows_emitted === 0, 'answer rows emitted must be 0');
expect(data.summary?.public_hud_rows_emitted === 0, 'public HUD rows emitted must be 0');
expect(data.summary?.match_percent_available_rows === 0, 'match percent must not be inferred');
expect(data.summary?.blocked_rows_outside_contract === 88, 'expected 88 blocked rows outside V1');
expect(data.summary?.missing_linkage_rows === 13, 'expected 13 missing-linkage rows');
expect(data.summary?.live_old_hud_exposure === 'no', 'live old HUD exposure must be no');
expect(data.summary?.issues === 0, 'packet issues must be 0');

const prohibited = new Set(data.proposed_contract?.prohibited_under_this_contract || []);
for (const required of ['answer_eligible=true', 'promote_to_answer=true', 'project-preferred multi-claim rows', 'accepted translation text', 'using highest score as truth']) {
  expect(prohibited.has(required), `missing prohibited item: ${required}`);
}

for (const row of data.candidates || []) {
  expect(row.release_contract_status === 'review_candidate_not_approved', `${row.queue_id} must remain not approved`);
  expect(Boolean(row.upstream_claim_id), `${row.queue_id} missing upstream claim id`);
  expect(Boolean(row.counterpart_candidate_display), `${row.queue_id} missing counterpart candidate display`);
  expect(row.match_percent === null, `${row.queue_id} match_percent must be null`);
}

if (issues.length) {
  console.error(`Agent 10 Orot prefix/stem contract packet validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 10 Orot prefix/stem contract packet validation passed for ${report}.`);

function expect(condition, message) {
  if (!condition) issues.push(message);
}
