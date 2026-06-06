#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath =
  'reports/agent3-old-dictionary-candidate-use-bridge-gap-direct-source-rid-anomaly-workset-2026-06-06.json';
const reportPath =
  'reports/agent3-old-dictionary-candidate-use-bridge-gap-direct-source-rid-anomaly-workset-2026-06-06.md';

const artifact = readJson(artifactPath);
const failures = [];

expect(
  artifact.artifact_type === 'agent3_old_dictionary_candidate_use_bridge_gap_direct_source_rid_anomaly_workset',
  'artifact type is direct source-RID anomaly workset',
);
expect(artifact.status === 'evidence-ready', 'status is evidence-ready');
expect(artifact.lane_owner === 'Agent 3', 'lane owner is Agent 3');
expect(Array.isArray(artifact.reviewed_locator_rows), 'reviewed locator rows exist');
expect(Array.isArray(artifact.selected_anomaly_rows), 'selected anomaly rows exist');
expect(artifact.reviewed_locator_rows.length === 5, 'reviewed locator rows count is 5');
expect(artifact.selected_anomaly_rows.length === 3, 'selected anomaly rows count is 3');

const expectedCounts = {
  input_locator_rows: 5,
  selected_anomaly_rows: 3,
  non_anomaly_reviewed_rows: 2,
  selected_anomaly_occurrences: 42,
  reviewed_occurrences: 58,
  unique_reviewed_source_rids: 5,
  unique_anomaly_source_rids: 3,
  duplicate_public_domain_locator_rows: 1,
  duplicate_commercial_locator_rows: 1,
  zero_public_domain_refs_rows: 1,
  zero_commercial_refs_rows: 1,
  commercial_ref_gap_rows: 1,
  multi_public_domain_rid_rows: 1,
  multi_commercial_rid_rows: 1,
  agent2_source_citation_or_url_present_rows: 0,
  agent2_transform_rule_still_blocked_rows: 5,
  inherited_process_timeout_records: 1,
  new_broad_search_commands_run: 0,
  a07_approval_route_rows: 5,
  a06_evidence_owner_rows: 5,
  a06_approval_requested_rows: 0,
  source_license_acceptance_claims: 0,
  source_provenance_acceptance_claims: 0,
  source_citation_supplied_by_agent3_rows: 0,
  source_text_rows: 0,
  definition_authority_rows: 0,
  answer_selection_rows: 0,
  accepted_text_rows: 0,
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
  'source_rid_anomaly_workset_only',
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
  'publication_readiness',
  'public_runtime_mutation',
  'accepted_gloss_text',
  'release_action',
]) {
  expect(boundary[flag] === false, `${flag} boundary is false`);
}

const selectedByRid = new Map((artifact.selected_anomaly_rows || []).map((row) => [row.source_rid, row]));
expect(selectedByRid.has('P00280'), 'P00280 selected as duplicate locator anomaly');
expect(selectedByRid.has('M00032'), 'M00032 selected as zero-ref/ref-gap anomaly');
expect(selectedByRid.has('E00687'), 'E00687 selected as multi-RID custody anomaly');
expect(!selectedByRid.has('U00063'), 'U00063 is not selected as anomaly');
expect(!selectedByRid.has('I00126'), 'I00126 is not selected as anomaly');

expect(
  selectedByRid.get('P00280')?.anomaly_flags.includes('duplicate_agent1_public_domain_source_rid_locator'),
  'P00280 has public-domain duplicate locator flag',
);
expect(
  selectedByRid.get('P00280')?.anomaly_flags.includes('duplicate_agent1_commercial_source_rid_locator'),
  'P00280 has commercial duplicate locator flag',
);
expect(
  selectedByRid.get('P00280')?.exact_blockers.includes('source_rid_duplicate_locator_requires_queue_scope_dedupe'),
  'P00280 has duplicate locator blocker',
);
expect(selectedByRid.get('M00032')?.anomaly_flags.includes('zero_public_domain_refs_count'), 'M00032 has zero PD refs flag');
expect(selectedByRid.get('M00032')?.anomaly_flags.includes('zero_commercial_refs_count'), 'M00032 has zero commercial refs flag');
expect(selectedByRid.get('M00032')?.anomaly_flags.includes('commercial_ref_gap_row_present'), 'M00032 has ref-gap flag');
expect(
  selectedByRid.get('M00032')?.exact_blockers.includes('source_rid_zero_ref_gap_blocks_direct_source_citation_enrichment'),
  'M00032 has zero-ref/ref-gap blocker',
);
expect(
  selectedByRid.get('E00687')?.anomaly_flags.includes('multi_public_domain_rid_custody_row'),
  'E00687 has multi public-domain RID flag',
);
expect(
  selectedByRid.get('E00687')?.anomaly_flags.includes('multi_commercial_rid_custody_row'),
  'E00687 has multi commercial RID flag',
);
expect(
  selectedByRid.get('E00687')?.exact_blockers.includes('source_rid_multi_rid_custody_row_requires_exact_rid_scope'),
  'E00687 has multi-RID blocker',
);

for (const row of artifact.reviewed_locator_rows || []) {
  expect(row.approval_route_owner === 'A07', `A07 approval owner for ${row.source_rid}`);
  expect(row.evidence_validator_owner === 'A06', `A06 evidence owner for ${row.source_rid}`);
  expect(row.a06_approval_requested === false, `A06 approval not requested for ${row.source_rid}`);
  expect(row.agent2_source_citation_or_url_present === false, `source citation missing for ${row.source_rid}`);
  expect(row.agent2_transform_rule_still_blocked === true, `transform still blocked for ${row.source_rid}`);
  expect(row.source_license_acceptance === false, `source license acceptance false for ${row.source_rid}`);
  expect(row.source_provenance_acceptance === false, `source provenance acceptance false for ${row.source_rid}`);
  expect(row.source_citation_supplied_by_agent3 === false, `source citation not supplied by Agent 3 for ${row.source_rid}`);
  expect(row.source_text_read === false, `source text not read for ${row.source_rid}`);
  expect(row.definition_authority === false, `definition authority false for ${row.source_rid}`);
  expect(row.answer_selection === false, `answer selection false for ${row.source_rid}`);
  expect(row.accepted_text === false, `accepted text false for ${row.source_rid}`);
}

const nonAnomaly = (artifact.reviewed_locator_rows || []).filter((row) => !row.selected_for_downstream_review);
expect(nonAnomaly.length === 2, 'two reviewed non-anomaly rows exist');
for (const row of nonAnomaly) {
  expect(
    row.ordinary_locator_status === 'reviewed_no_locator_anomaly_but_direct_source_citation_still_missing',
    `ordinary locator status set for ${row.source_rid}`,
  );
}

expect(Array.isArray(artifact.exact_blocker_summary), 'exact blocker summary exists');
expect(artifact.exact_blocker_summary.length === 3, 'three exact blocker summary rows exist');

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
expect(report.includes('Selected anomaly rows'), 'markdown includes selected anomaly section');
expect(report.includes('Reviewed Non-Anomaly Rows'), 'markdown includes non-anomaly review section');
expect(report.includes('A07 owns approval'), 'markdown names A07 approval owner');
expect(report.includes('no A06 approval request'), 'markdown blocks A06 approval request');
expect(report.includes('no source, license, legal, Definition'), 'markdown carries non-acceptance boundary');

if (failures.length) {
  console.error(`Agent 3 direct source-RID anomaly workset failed ${failures.length} check(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Agent 3 direct source-RID anomaly workset passed: reviewed=5 selected=3');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), 'utf8'));
}

function expect(condition, message) {
  if (!condition) failures.push(message);
}
