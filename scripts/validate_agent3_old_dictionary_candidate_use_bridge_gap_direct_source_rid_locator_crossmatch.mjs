#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath =
  'reports/agent3-old-dictionary-candidate-use-bridge-gap-direct-source-rid-locator-crossmatch-2026-06-06.json';
const reportPath =
  'reports/agent3-old-dictionary-candidate-use-bridge-gap-direct-source-rid-locator-crossmatch-2026-06-06.md';

const artifact = readJson(artifactPath);
const failures = [];

expect(
  artifact.artifact_type === 'agent3_old_dictionary_candidate_use_bridge_gap_direct_source_rid_locator_crossmatch',
  'artifact type is direct source-RID locator crossmatch',
);
expect(artifact.status === 'evidence-ready', 'status is evidence-ready');
expect(artifact.lane_owner === 'Agent 3', 'lane owner is Agent 3');
expect(Array.isArray(artifact.locator_rows), 'locator rows array exists');
expect(artifact.locator_rows.length === 5, 'locator rows count is 5');
expect(artifact.counts?.workset_rows === 5, 'workset rows count is 5');
expect(artifact.counts?.workset_occurrences === 58, 'workset occurrences count is 58');
expect(artifact.counts?.unique_source_rids === 5, 'unique source RIDs count is 5');
expect(artifact.counts?.agent2_contract_rows_matched === 5, 'Agent 2 contract rows matched count is 5');
expect(
  artifact.counts?.agent1_public_domain_exact_rows_matched === 5,
  'Agent 1 public-domain exact rows matched count is 5',
);
expect(
  artifact.counts?.agent1_public_domain_all_queue_locator_hits === 6,
  'Agent 1 public-domain all-queue locator hit count is 6',
);
expect(
  artifact.counts?.agent1_commercial_exact_rows_matched === 5,
  'Agent 1 commercial exact rows matched count is 5',
);
expect(
  artifact.counts?.agent1_commercial_all_queue_locator_hits === 6,
  'Agent 1 commercial all-queue locator hit count is 6',
);
expect(
  artifact.counts?.agent1_commercial_ref_gap_rows_matched === 1,
  'Agent 1 commercial ref-gap matched row count is 1',
);
expect(
  artifact.counts?.agent1_public_domain_citation_metadata_present_rows === 5,
  'Agent 1 public-domain metadata-present row count is 5',
);
expect(
  artifact.counts?.agent1_commercial_citation_metadata_present_rows === 5,
  'Agent 1 commercial metadata-present row count is 5',
);
expect(
  artifact.counts?.agent2_source_citation_or_url_present_rows === 0,
  'Agent 2 source-citation present row count is 0',
);
expect(
  artifact.counts?.agent2_transform_rule_still_blocked_rows === 5,
  'Agent 2 transform-blocked row count is 5',
);
expect(artifact.counts?.zero_ref_count_rows === 1, 'zero-ref-count row count is 1');
expect(artifact.counts?.process_timeout_records === 1, 'process timeout record count is 1');
expect(artifact.counts?.a07_approval_route_rows === 5, 'A07 approval route row count is 5');
expect(artifact.counts?.a06_evidence_owner_rows === 5, 'A06 evidence owner row count is 5');
expect(artifact.counts?.a06_approval_requested_rows === 0, 'A06 approval requested row count is 0');
expect(artifact.counts?.source_license_acceptance_claims === 0, 'source license acceptance claims are 0');
expect(artifact.counts?.source_provenance_acceptance_claims === 0, 'source provenance acceptance claims are 0');
expect(artifact.counts?.source_citation_supplied_by_agent3_rows === 0, 'source citation supplied by Agent 3 rows are 0');
expect(artifact.counts?.source_text_rows === 0, 'source text rows are 0');
expect(artifact.counts?.definition_authority_rows === 0, 'definition authority rows are 0');
expect(artifact.counts?.accepted_text_rows === 0, 'accepted text rows are 0');
expect(artifact.counts?.publication_or_release_claims === 0, 'publication/release claims are 0');
expect(artifact.counts?.acceptance_claims === 0, 'acceptance claims are 0');
expect(artifact.counts?.forbidden_payload_field_hits === 0, 'forbidden payload field hits are 0');

const boundary = artifact.authority_boundary || {};
expect(boundary.linkage_navigation_only === true, 'linkage-navigation-only boundary is true');
expect(boundary.source_rid_locator_crossmatch_only === true, 'source-RID locator crossmatch boundary is true');
expect(
  boundary.approval_sop_final_validation_release_gate_owner_a07 === true,
  'A07 approval/SOP/final-validation/release owner boundary is true',
);
expect(
  boundary.evidence_validators_repo_cleaning_production_owner_a06 === true,
  'A06 evidence/validator/repo-cleaning owner boundary is true',
);
expect(boundary.a06_outputs_evidence_ready_until_a07_approves === true, 'A06 evidence-ready-until-A07 boundary is true');
expect(boundary.do_not_ask_a06_for_approval === true, 'do-not-ask-A06-for-approval boundary is true');

const forbiddenTrueFlags = [
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
];
for (const flag of forbiddenTrueFlags) {
  expect(boundary[flag] === false, `${flag} boundary is false`);
}

const requiredSourceRids = new Set(['P00280', 'M00032', 'U00063', 'E00687', 'I00126']);
const seenSourceRids = new Set();
for (const row of artifact.locator_rows || []) {
  seenSourceRids.add(row.source_rid);
  expect(requiredSourceRids.has(row.source_rid), `expected source RID ${row.source_rid}`);
  expect(row.queue_id?.startsWith('agent2-orot-gap-tok-'), `queue id shape for ${row.source_rid}`);
  expect(row.token_id?.startsWith('tok-'), `token id shape for ${row.source_rid}`);
  expect(row.lexicon_entry_id?.startsWith('lex-'), `lexicon entry id shape for ${row.source_rid}`);
  expect(row.agent2_contract_locator_paths?.length === 1, `one Agent 2 contract locator path for ${row.source_rid}`);
  expect(
    row.agent1_public_domain_exact_locator_paths?.length === 1,
    `one Agent 1 public-domain exact locator path for ${row.source_rid}`,
  );
  expect(
    row.agent1_commercial_exact_locator_paths?.length === 1,
    `one Agent 1 commercial exact locator path for ${row.source_rid}`,
  );
  expect(row.agent2_source_citation_or_url_present === false, `source citation missing for ${row.source_rid}`);
  expect(row.agent2_transform_rule_still_blocked === true, `transform still blocked for ${row.source_rid}`);
  expect(row.approval_route_owner === 'A07', `A07 approval owner for ${row.source_rid}`);
  expect(row.evidence_validator_owner === 'A06', `A06 evidence owner for ${row.source_rid}`);
  expect(row.a06_approval_requested === false, `A06 approval not requested for ${row.source_rid}`);
  expect(row.source_license_acceptance === false, `source license acceptance false for ${row.source_rid}`);
  expect(row.source_provenance_acceptance === false, `source provenance acceptance false for ${row.source_rid}`);
  expect(row.source_citation_supplied_by_agent3 === false, `source citation not supplied by Agent 3 for ${row.source_rid}`);
  expect(row.source_text_read === false, `source text not read for ${row.source_rid}`);
  expect(row.definition_authority === false, `definition authority false for ${row.source_rid}`);
  expect(row.accepted_text === false, `accepted text false for ${row.source_rid}`);
  expect(
    row.exact_blocker === 'direct_source_citation_or_url_missing_after_agent2_intake_match',
    `exact blocker preserved for ${row.source_rid}`,
  );
}
expect(seenSourceRids.size === requiredSourceRids.size, 'all five required source RIDs are present');

expect(Array.isArray(artifact.process_timeout_records), 'process timeout records array exists');
expect(artifact.process_timeout_records.length === 1, 'one process timeout record exists');
const timeout = artifact.process_timeout_records[0] || {};
expect(timeout.status === 'process_timeout', 'timeout status is process_timeout');
expect(timeout.command?.startsWith('rg -n'), 'timeout command is recorded');
expect(timeout.requested_timeout_ms === 60000, 'requested timeout is recorded');
expect(timeout.observed_timeout_ms === 402307, 'observed timeout is recorded');
expect(Boolean(timeout.next_safe_action), 'timeout next safe action exists');

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
expect(report.includes('process_timeout | command='), 'markdown records process timeout');
expect(
  report.includes('rg -n "P00280|M00032|U00063|E00687|I00126" reports data --glob "*.json" --glob "*.md"'),
  'markdown preserves exact timeout command',
);
expect(report.includes('A07 owns approval'), 'markdown names A07 approval owner');
expect(report.includes('no A06 approval request'), 'markdown blocks A06 approval request');
expect(report.includes('locator evidence only'), 'markdown labels locator evidence only');
expect(report.includes('Source-RID Locator Crossmatch'), 'markdown title exists');

if (failures.length) {
  console.error(`Agent 3 direct source-RID locator crossmatch failed ${failures.length} check(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Agent 3 direct source-RID locator crossmatch passed: rows=5 sourceRids=5');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), 'utf8'));
}

function expect(condition, message) {
  if (!condition) failures.push(message);
}
