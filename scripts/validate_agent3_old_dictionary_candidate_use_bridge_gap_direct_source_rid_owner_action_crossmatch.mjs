#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath =
  'reports/agent3-old-dictionary-candidate-use-bridge-gap-direct-source-rid-owner-action-crossmatch-2026-06-06.json';
const reportPath =
  'reports/agent3-old-dictionary-candidate-use-bridge-gap-direct-source-rid-owner-action-crossmatch-2026-06-06.md';

const artifact = readJson(artifactPath);
const failures = [];

expect(
  artifact.artifact_type === 'agent3_old_dictionary_candidate_use_bridge_gap_direct_source_rid_owner_action_crossmatch',
  'artifact type is owner/action crossmatch',
);
expect(artifact.status === 'evidence-ready', 'status is evidence-ready');
expect(artifact.lane_owner === 'Agent 3', 'lane owner is Agent 3');
expect(Array.isArray(artifact.owner_action_rows), 'owner/action rows exist');
expect(artifact.owner_action_rows.length === 3, 'owner/action row count is 3');

const expectedCounts = {
  input_reviewed_locator_rows: 5,
  input_selected_anomaly_rows: 3,
  owner_action_rows: 3,
  owner_action_occurrences: 42,
  unique_source_rids: 3,
  duplicate_locator_action_rows: 1,
  zero_ref_ref_gap_action_rows: 1,
  multi_rid_scope_action_rows: 1,
  agent10_package_intake_rows: 3,
  agent1_required_rows: 3,
  agent2_required_rows: 3,
  a07_required_rows: 3,
  a06_evidence_only_rows: 3,
  required_downstream_field_cells: 36,
  source_citation_or_url_present_rows: 0,
  transform_rule_still_blocked_rows: 3,
  inherited_process_timeout_records: 1,
  new_broad_search_commands_run: 0,
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
  'owner_action_crossmatch_only',
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

const byRid = new Map((artifact.owner_action_rows || []).map((row) => [row.source_rid, row]));
expect(byRid.has('P00280'), 'P00280 owner/action row exists');
expect(byRid.has('M00032'), 'M00032 owner/action row exists');
expect(byRid.has('E00687'), 'E00687 owner/action row exists');
expect(byRid.get('P00280')?.owner_action_kind === 'queue_scope_dedupe_required', 'P00280 action kind is queue-scope dedupe');
expect(
  byRid.get('M00032')?.owner_action_kind === 'source_citation_ref_gap_resolution_required',
  'M00032 action kind is source-citation/ref-gap resolution',
);
expect(byRid.get('E00687')?.owner_action_kind === 'exact_rid_scope_required', 'E00687 action kind is exact RID scope');
expect(
  byRid.get('P00280')?.exact_missing_field_blocker === 'missing_queue_scope_dedupe_resolution_for_duplicate_source_rid_locator',
  'P00280 exact missing-field blocker is present',
);
expect(
  byRid.get('M00032')?.exact_missing_field_blocker === 'missing_source_citation_resolution_for_zero_ref_gap_source_rid',
  'M00032 exact missing-field blocker is present',
);
expect(
  byRid.get('E00687')?.exact_missing_field_blocker === 'missing_exact_rid_scope_for_multi_rid_custody_row',
  'E00687 exact missing-field blocker is present',
);

for (const row of artifact.owner_action_rows || []) {
  expect(row.package_intake_owner === 'Agent 10', `Agent 10 package owner for ${row.source_rid}`);
  expect(row.row_resolution_owner === 'Agent 1 / Agent 2', `Agent 1 / Agent 2 row owner for ${row.source_rid}`);
  expect(row.approval_route_owner === 'A07', `A07 approval owner for ${row.source_rid}`);
  expect(row.evidence_validator_owner === 'A06', `A06 evidence owner for ${row.source_rid}`);
  expect(row.a06_approval_requested === false, `A06 approval not requested for ${row.source_rid}`);
  expect(row.agent1_required === true, `Agent 1 required for ${row.source_rid}`);
  expect(row.agent2_required === true, `Agent 2 required for ${row.source_rid}`);
  expect(row.agent10_required === true, `Agent 10 required for ${row.source_rid}`);
  expect(row.a07_required === true, `A07 required for ${row.source_rid}`);
  expect(row.a06_evidence_only === true, `A06 evidence-only for ${row.source_rid}`);
  expect(row.required_downstream_field_count === 12, `required downstream field count for ${row.source_rid}`);
  expect(row.source_citation_or_url_present === false, `source citation missing for ${row.source_rid}`);
  expect(row.transform_rule_still_blocked === true, `transform still blocked for ${row.source_rid}`);
  expect(row.source_license_acceptance === false, `source license acceptance false for ${row.source_rid}`);
  expect(row.source_provenance_acceptance === false, `source provenance acceptance false for ${row.source_rid}`);
  expect(row.source_citation_supplied_by_agent3 === false, `source citation not supplied by Agent 3 for ${row.source_rid}`);
  expect(row.source_text_read === false, `source text not read for ${row.source_rid}`);
  expect(row.definition_authority === false, `definition authority false for ${row.source_rid}`);
  expect(row.answer_selection === false, `answer selection false for ${row.source_rid}`);
  expect(row.route_publication_support === false, `route publication support false for ${row.source_rid}`);
  expect(row.accepted_text === false, `accepted text false for ${row.source_rid}`);
  expect(row.release_action === false, `release action false for ${row.source_rid}`);
  expect(
    row.owner_action_status === 'exact_owner_action_blocker_navigation_only_no_acceptance_claim',
    `owner action status for ${row.source_rid}`,
  );
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
expect(report.includes('Owner/Action Rows'), 'markdown includes owner/action rows');
expect(report.includes('A07 owns approval'), 'markdown names A07 approval owner');
expect(report.includes('no A06 approval request'), 'markdown blocks A06 approval request');
expect(report.includes('no source, license, legal, Definition'), 'markdown carries non-acceptance boundary');
expect(report.includes('queue_scope_dedupe_required'), 'markdown includes queue-scope dedupe action');
expect(report.includes('source_citation_ref_gap_resolution_required'), 'markdown includes ref-gap action');
expect(report.includes('exact_rid_scope_required'), 'markdown includes exact RID scope action');

if (failures.length) {
  console.error(`Agent 3 direct source-RID owner/action crossmatch failed ${failures.length} check(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Agent 3 direct source-RID owner/action crossmatch passed: rows=3 occurrences=42');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), 'utf8'));
}

function expect(condition, message) {
  if (!condition) failures.push(message);
}
