#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath =
  'reports/agent3-old-dictionary-candidate-use-bridge-gap-direct-source-rid-row-level-return-contract-2026-06-06.json';
const reportPath =
  'reports/agent3-old-dictionary-candidate-use-bridge-gap-direct-source-rid-row-level-return-contract-2026-06-06.md';

const artifact = readJson(artifactPath);
const failures = [];

expect(
  artifact.artifact_type === 'agent3_old_dictionary_candidate_use_bridge_gap_direct_source_rid_row_level_return_contract',
  'artifact type is row-level return contract',
);
expect(artifact.status === 'evidence-ready', 'status is evidence-ready');
expect(artifact.lane_owner === 'Agent 3', 'lane owner is Agent 3');
expect(Array.isArray(artifact.contract_rows), 'contract rows exist');
expect(artifact.contract_rows.length === 3, 'contract row count is 3');

const expectedCounts = {
  input_downstream_gap_rows: 3,
  contract_rows: 3,
  contract_occurrences: 42,
  unique_source_rids: 3,
  agent10_return_contract_rows: 3,
  agent1_agent2_return_contract_rows: 3,
  queue_scope_dedupe_contract_rows: 1,
  ref_gap_contract_rows: 1,
  exact_rid_scope_contract_rows: 1,
  agent10_return_field_cells: 21,
  agent1_agent2_return_field_cells: 27,
  action_specific_return_field_cells: 3,
  row_level_downstream_gap_rows: 3,
  agent10_broad_context_rows: 3,
  agent10_row_level_consumed_rows: 0,
  source_citation_or_url_present_rows: 0,
  transform_rule_still_blocked_rows: 3,
  a07_approval_route_rows: 3,
  a06_evidence_owner_rows: 3,
  a06_approval_requested_rows: 0,
  source_license_acceptance_claims: 0,
  source_provenance_acceptance_claims: 0,
  source_citation_supplied_by_agent3_rows: 0,
  source_text_rows: 0,
  definition_authority_rows: 0,
  answer_selection_rows: 0,
  route_publication_support_rows: 0,
  accepted_text_rows: 0,
  release_actions: 0,
  publication_or_release_claims: 0,
  acceptance_claims: 0,
  forbidden_payload_field_hits: 0,
};
for (const [key, expected] of Object.entries(expectedCounts)) {
  expect(artifact.counts?.[key] === expected, `${key} is ${expected}`);
}

const boundary = artifact.authority_boundary || {};
for (const flag of [
  'linkage_navigation_only',
  'row_level_return_contract_only',
  'approval_sop_final_validation_release_gate_owner_a07',
  'evidence_validators_repo_cleaning_production_owner_a06',
  'a06_outputs_evidence_ready_until_a07_approves',
  'do_not_ask_a06_for_approval',
]) {
  expect(boundary[flag] === true, `${flag} boundary is true`);
}
for (const flag of [
  'a06_approval_requested',
  'qa_acceptance',
  'agent6_acceptance',
  'source_provenance_acceptance',
  'source_license_acceptance',
  'source_legal_acceptance',
  'source_citation_supplied_by_agent3',
  'source_text_read',
  'candidate_text_export',
  'definition_content_storage',
  'usage_as_definition_authority',
  'definition_authority',
  'answer_selection',
  'route_ranking',
  'route_publication_support',
  'publication_readiness',
  'public_runtime_mutation',
  'accepted_gloss_text',
  'release_action',
]) {
  expect(boundary[flag] === false, `${flag} boundary is false`);
}

const expectedByRid = {
  P00280: {
    kind: 'queue_scope_dedupe_required',
    field: 'queue_scope_dedupe_resolution_or_exact_duplicate_blocker',
  },
  M00032: {
    kind: 'source_citation_ref_gap_resolution_required',
    field: 'ref_gap_source_citation_resolution_or_exact_missing_citation_blocker',
  },
  E00687: {
    kind: 'exact_rid_scope_required',
    field: 'exact_rid_scope_resolution_or_exact_scope_blocker',
  },
};
const byRid = new Map((artifact.contract_rows || []).map((row) => [row.source_rid, row]));
for (const [sourceRid, expected] of Object.entries(expectedByRid)) {
  const row = byRid.get(sourceRid);
  expect(Boolean(row), `${sourceRid} row exists`);
  if (!row) continue;
  expect(row.owner_action_kind === expected.kind, `${sourceRid} owner action kind`);
  expect(row.action_specific_return_field === expected.field, `${sourceRid} action-specific return field`);
}

for (const row of artifact.contract_rows || []) {
  expect(row.agent10_return_owner === 'Agent 10', `Agent 10 return owner for ${row.source_rid}`);
  expect(row.agent1_agent2_return_owner === 'Agent 1 / Agent 2', `Agent 1 / Agent 2 return owner for ${row.source_rid}`);
  expect(row.approval_route_owner === 'A07', `A07 approval owner for ${row.source_rid}`);
  expect(row.evidence_validator_owner === 'A06', `A06 evidence owner for ${row.source_rid}`);
  expect(row.a06_approval_requested === false, `A06 approval not requested for ${row.source_rid}`);
  expect(row.agent10_return_fields?.length === 7, `Agent 10 return field count for ${row.source_rid}`);
  expect(row.agent1_agent2_return_fields?.length === 9, `Agent 1/Agent 2 return field count for ${row.source_rid}`);
  expect(row.agent1_agent2_return_fields.includes(row.action_specific_return_field), `action-specific field included for ${row.source_rid}`);
  expect(row.row_level_downstream_gap === true, `row-level downstream gap for ${row.source_rid}`);
  expect(row.agent10_broad_context_present === true, `Agent 10 broad context for ${row.source_rid}`);
  expect(row.agent10_row_level_consumed === false, `Agent 10 row-level not consumed for ${row.source_rid}`);
  expect(row.source_citation_or_url_present === false, `source citation missing for ${row.source_rid}`);
  expect(row.transform_rule_still_blocked === true, `transform still blocked for ${row.source_rid}`);
  expect(row.contract_status === 'exact_row_level_return_contract_navigation_only_no_acceptance_claim', `contract status for ${row.source_rid}`);
  expect(row.source_license_acceptance === false, `source license acceptance false for ${row.source_rid}`);
  expect(row.source_provenance_acceptance === false, `source provenance acceptance false for ${row.source_rid}`);
  expect(row.source_citation_supplied_by_agent3 === false, `source citation not supplied by Agent 3 for ${row.source_rid}`);
  expect(row.source_text_read === false, `source text not read for ${row.source_rid}`);
  expect(row.definition_authority === false, `definition authority false for ${row.source_rid}`);
  expect(row.answer_selection === false, `answer selection false for ${row.source_rid}`);
  expect(row.route_publication_support === false, `route publication support false for ${row.source_rid}`);
  expect(row.accepted_text === false, `accepted text false for ${row.source_rid}`);
  expect(row.release_action === false, `release action false for ${row.source_rid}`);
}

const serialized = JSON.stringify(artifact);
for (const forbidden of [
  '"surface":',
  '"normalized":',
  '"headword":',
  '"headwords":',
  '"refs_sample":',
  '"public_domain_refs_sample":',
  '"answer_text":',
  '"definition_text":',
  '"gloss_text":',
  '"source_text":',
]) {
  expect(!serialized.includes(forbidden), `forbidden payload key absent: ${forbidden}`);
}

expect(fs.existsSync(path.join(root, reportPath)), 'markdown report exists');
const report = fs.readFileSync(path.join(root, reportPath), 'utf8');
expect(report.includes('Row-Level Return Contract'), 'markdown title exists');
expect(report.includes('Agent 10 return field cells | 21'), 'markdown Agent 10 field cells count');
expect(report.includes('Agent 1/Agent 2 return field cells | 27'), 'markdown Agent 1/2 field cells count');
expect(report.includes('A07 owns approval'), 'markdown names A07 approval owner');
expect(report.includes('no A06 approval request'), 'markdown blocks A06 approval request');
expect(report.includes('no source, license, legal, Definition'), 'markdown carries non-acceptance boundary');

if (failures.length) {
  console.error(`Agent 3 direct source-RID row-level return contract failed ${failures.length} check(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Agent 3 direct source-RID row-level return contract passed: rows=3 fields=48');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), 'utf8'));
}

function expect(condition, message) {
  if (!condition) failures.push(message);
}
