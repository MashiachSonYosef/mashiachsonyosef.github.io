#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath =
  'reports/agent3-old-dictionary-candidate-use-bridge-gap-direct-source-rid-downstream-gap-crossmatch-2026-06-06.json';
const reportPath =
  'reports/agent3-old-dictionary-candidate-use-bridge-gap-direct-source-rid-downstream-gap-crossmatch-2026-06-06.md';

const artifact = readJson(artifactPath);
const failures = [];

expect(
  artifact.artifact_type === 'agent3_old_dictionary_candidate_use_bridge_gap_direct_source_rid_downstream_gap_crossmatch',
  'artifact type is downstream gap crossmatch',
);
expect(artifact.status === 'evidence-ready', 'status is evidence-ready');
expect(artifact.lane_owner === 'Agent 3', 'lane owner is Agent 3');
expect(Array.isArray(artifact.downstream_gap_rows), 'downstream gap rows exist');
expect(artifact.downstream_gap_rows.length === 3, 'downstream gap row count is 3');

const expectedCounts = {
  owner_action_rows: 3,
  owner_action_occurrences: 42,
  unique_source_rids: 3,
  downstream_coverage_rows_matched: 3,
  agent2_direct_contract_matched_rows: 3,
  agent2_direct_contract_queue_match_rows: 3,
  agent2_direct_contract_validation_passed_rows: 3,
  agent10_broad_context_rows: 3,
  agent10_preboundary_broad_context_rows: 3,
  agent10_source_citation_row_level_consumed_rows: 0,
  agent10_preboundary_row_level_consumed_rows: 0,
  agent10_current_refresh_row_level_hit_rows: 0,
  agent1_downstream_alignment_row_level_hit_rows: 0,
  row_level_downstream_gap_rows: 3,
  source_citation_or_url_present_rows: 0,
  transform_rule_still_blocked_rows: 3,
  required_downstream_return_field_cells: 21,
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
  'downstream_gap_crossmatch_only',
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

const byRid = new Map((artifact.downstream_gap_rows || []).map((row) => [row.source_rid, row]));
expect(byRid.has('P00280'), 'P00280 gap row exists');
expect(byRid.has('M00032'), 'M00032 gap row exists');
expect(byRid.has('E00687'), 'E00687 gap row exists');
expect(byRid.get('P00280')?.owner_action_kind === 'queue_scope_dedupe_required', 'P00280 owner action kind');
expect(byRid.get('M00032')?.owner_action_kind === 'source_citation_ref_gap_resolution_required', 'M00032 owner action kind');
expect(byRid.get('E00687')?.owner_action_kind === 'exact_rid_scope_required', 'E00687 owner action kind');

for (const row of artifact.downstream_gap_rows || []) {
  expect(row.agent2_direct_contract_matched === true, `Agent 2 direct matched for ${row.source_rid}`);
  expect(row.agent2_direct_contract_queue_match === true, `Agent 2 queue match for ${row.source_rid}`);
  expect(row.agent2_direct_contract_validation_result === 'passed', `Agent 2 validation passed for ${row.source_rid}`);
  expect(row.agent2_source_citation_or_url_present === false, `Agent 2 source citation missing for ${row.source_rid}`);
  expect(row.downstream_source_citation_or_url_present === false, `downstream source citation missing for ${row.source_rid}`);
  expect(row.agent2_transform_rule_still_blocked === true, `Agent 2 transform blocked for ${row.source_rid}`);
  expect(row.downstream_transform_rule_still_blocked === true, `downstream transform blocked for ${row.source_rid}`);
  expect(row.agent10_source_citation_broad_workset_present === true, `Agent 10 broad context for ${row.source_rid}`);
  expect(row.agent10_source_citation_row_level_overlay_consumed === false, `Agent 10 row-level source not consumed for ${row.source_rid}`);
  expect(row.agent10_preboundary_broad_context_present === true, `Agent 10 preboundary broad context for ${row.source_rid}`);
  expect(row.agent10_preboundary_row_level_overlay_consumed === false, `Agent 10 preboundary row-level not consumed for ${row.source_rid}`);
  expect(row.agent10_current_refresh_row_level_hit === false, `Agent 10 current refresh no row-level hit for ${row.source_rid}`);
  expect(row.agent1_downstream_alignment_row_level_hit === false, `Agent 1 alignment no row-level hit for ${row.source_rid}`);
  expect(row.row_level_downstream_gap === true, `row-level downstream gap for ${row.source_rid}`);
  expect(
    row.exact_gap_blocker === 'owner_action_row_has_broad_context_but_no_row_level_downstream_consumption',
    `exact gap blocker for ${row.source_rid}`,
  );
  expect(row.required_downstream_return_fields?.length === 7, `required downstream fields count for ${row.source_rid}`);
  expect(row.package_intake_owner === 'Agent 10', `Agent 10 owner for ${row.source_rid}`);
  expect(row.row_resolution_owner === 'Agent 1 / Agent 2', `Agent 1 / Agent 2 owner for ${row.source_rid}`);
  expect(row.approval_route_owner === 'A07', `A07 owner for ${row.source_rid}`);
  expect(row.evidence_validator_owner === 'A06', `A06 evidence owner for ${row.source_rid}`);
  expect(row.a06_approval_requested === false, `A06 approval not requested for ${row.source_rid}`);
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

expect(Array.isArray(artifact.exact_blocker_summary), 'exact blocker summary exists');
expect(artifact.exact_blocker_summary.length === 1, 'one exact blocker summary row exists');
expect(artifact.exact_blocker_summary[0]?.rows === 3, 'exact blocker summary rows count is 3');

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
expect(report.includes('Downstream Gap Crossmatch'), 'markdown title exists');
expect(report.includes('Row-level downstream gap rows | 3'), 'markdown carries gap count');
expect(report.includes('A07 owns approval'), 'markdown names A07 approval owner');
expect(report.includes('no A06 approval request'), 'markdown blocks A06 approval request');
expect(report.includes('no source, license, legal, Definition'), 'markdown carries non-acceptance boundary');

if (failures.length) {
  console.error(`Agent 3 direct source-RID downstream gap crossmatch failed ${failures.length} check(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Agent 3 direct source-RID downstream gap crossmatch passed: rows=3 gaps=3');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), 'utf8'));
}

function expect(condition, message) {
  if (!condition) failures.push(message);
}
