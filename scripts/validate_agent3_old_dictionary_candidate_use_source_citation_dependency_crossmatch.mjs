#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input: 'reports/agent3-old-dictionary-candidate-use-source-citation-dependency-crossmatch-2026-06-06.json',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_old_dictionary_candidate_use_source_citation_dependency_crossmatch',
  'artifact_type mismatch',
);
expect(artifact.status === 'evidence-ready', 'status must be evidence-ready');

const boundary = artifact.authority_boundary || {};
for (const key of [
  'linkage_navigation_only',
  'source_citation_dependency_crossmatch_only',
  'source_rid_identifier_continuity_only',
  'external_dependency_status_observation_only',
]) {
  expect(boundary[key] === true, `authority_boundary.${key} must be true`);
}
for (const key of [
  'source_citation_supplied_by_agent3',
  'source_provenance_acceptance',
  'source_license_acceptance',
  'source_legal_acceptance',
  'transform_authority',
  'source_text_read',
  'candidate_text_export',
  'definition_content_storage',
  'lemma_content_storage',
  'reader_hint_content_storage',
  'usage_as_definition_authority',
  'definition_authority',
  'answer_selection',
  'answer_eligibility',
  'route_ranking',
  'qa_acceptance',
  'publication_readiness',
  'public_runtime_mutation',
  'accepted_gloss_text',
  'release_action',
]) {
  expect(boundary[key] === false, `authority_boundary.${key} must be false`);
}

const counts = artifact.counts || {};
const rowDependencyRows = artifact.row_dependency_rows || [];
const sourceFamilyRows = artifact.source_family_rows || [];
const sourceRidPrefixRows = artifact.source_rid_prefix_rows || [];
const blockerRows = artifact.blocker_rows || [];

expect(rowDependencyRows.length === counts.row_dependency_rows, 'row dependency length mismatch');
expect(sourceFamilyRows.length === counts.source_family_rows, 'source family row length mismatch');
expect(sourceRidPrefixRows.length === counts.source_rid_prefix_rows, 'source RID prefix row length mismatch');
expect(blockerRows.length === counts.exact_blocker_rows, 'blocker row length mismatch');

expect(counts.row_dependency_rows === 78, 'expected 78 dependency rows');
expect(counts.row_dependency_occurrences === 1461, 'expected 1461 dependency occurrences');
expect(counts.boundary_chain_rows_linked === 78, 'expected 78 boundary-chain links');
expect(counts.boundary_chain_rows_missing === 0, 'expected 0 missing boundary-chain links');
expect(counts.agent10_workset_rows === 78, 'expected Agent 10 workset rows 78');
expect(counts.agent10_workset_occurrences === 1461, 'expected Agent 10 workset occurrences 1461');
expect(counts.agent2_dependency_rows === 78, 'expected Agent 2 dependency rows 78');
expect(counts.agent2_dependency_occurrences === 1461, 'expected Agent 2 dependency occurrences 1461');
expect(counts.agent2_validation_rows === 78, 'expected Agent 2 validation rows 78');
expect(counts.agent2_validation_occurrences === 1461, 'expected Agent 2 validation occurrences 1461');
expect(counts.row_count_mismatch === 0, 'expected no row-count mismatch');
expect(counts.occurrence_count_mismatch === 0, 'expected no occurrence-count mismatch');
expect(counts.source_citation_supplied_rows === 0, 'expected 0 source citation supplied rows');
expect(counts.source_citation_missing_rows === 78, 'expected 78 source citation missing rows');
expect(counts.transform_rule_supplied_rows === 0, 'expected 0 transform rule supplied rows');
expect(counts.transform_rule_missing_rows === 78, 'expected 78 transform rule missing rows');
expect(counts.source_family_rows === 3, 'expected 3 source family rows');
expect(counts.source_family_memberships === 159, 'expected 159 source family memberships');
expect(counts.source_rid_references === 393, 'expected 393 source RID references');
expect(counts.unique_source_rids === 344, 'expected 344 unique source RIDs');
expect(counts.source_rid_prefix_rows === 21, 'expected 21 source RID prefixes');
expect(counts.exact_blocker_rows === 5, 'expected 5 exact blocker rows');
expect(counts.stale_agent1_route_blocker_rows === 1, 'expected 1 stale Agent 1 route blocker row');
expect(counts.transform_ready_rows === 0, 'expected 0 transform-ready rows');

for (const key of [
  'candidate_text_rows',
  'definition_content_rows',
  'lemma_content_rows',
  'reader_hint_content_rows',
  'answer_rows',
  'answer_eligible_rows',
  'route_jsonl_rows',
  'route_shard_writes',
  'source_text_rows',
  'accepted_text_rows',
  'public_runtime_mutation',
  'export_rows',
  'release_actions',
  'source_acceptance_claims',
  'route_payload_field_hits',
  'forbidden_payload_field_hits',
  'acceptance_claims',
]) {
  expect(counts[key] === 0, `${key} must be zero`);
}

const expectedFamilies = new Map([
  ['BDB Aramaic Dictionary', { rows: 21, refs: 30 }],
  ['BDB Dictionary', { rows: 63, refs: 179 }],
  ['Jastrow Dictionary', { rows: 75, refs: 184 }],
]);
for (const row of sourceFamilyRows) {
  const expected = expectedFamilies.get(row.source_family);
  expect(Boolean(expected), `unexpected source family ${row.source_family}`);
  if (expected) {
    expect(row.candidate_rows === expected.rows, `${row.source_family} row count mismatch`);
    expect(row.source_rid_references === expected.refs, `${row.source_family} RID ref mismatch`);
  }
  expect(
    row.status === 'source_family_dependency_navigation_only_missing_row_level_citation_or_exact_blocker',
    `${row.source_family} status mismatch`,
  );
}

const expectedBlockers = new Set([
  'missing_source_field::source_citation_or_url',
  'missing_transform_rule::proposed_candidate_text_proposed_definition_text_proposed_lemma_text_proposed_reader_hint_text',
  'stale_agent1_registry_target_current_agent1_thread_required',
  'missing_source_citation_or_url_for_78_row_subset',
  'new_exact_agent6_packet_required_before_transform_output_candidate_text_definition_lemma_reader_hint_content_storage_answer_eligibility_route_write_public_runtime_mutation_export_accepted_text_publication_readiness_or_release',
]);
for (const row of blockerRows) {
  expect(expectedBlockers.has(row.exact_blocker), `unexpected exact blocker ${row.exact_blocker}`);
  expect(row.affected_rows === 78, `${row.exact_blocker} affected rows mismatch`);
  expect(row.affected_occurrences === 1461, `${row.exact_blocker} affected occurrences mismatch`);
  expect(row.status === 'observed_external_dependency_blocker_no_agent3_acceptance', `${row.exact_blocker} status mismatch`);
}

expect(artifact.dependency_summary?.missing_field_to_supply === 'source_citation_or_url', 'missing field mismatch');
expect(
  artifact.dependency_summary?.agent1_route_blocker === 'stale_agent1_registry_target_current_agent1_thread_required',
  'Agent 1 route blocker mismatch',
);
expect(artifact.dependency_summary?.source_citation_or_url_supplied_now === false, 'source citation supplied flag mismatch');
expect(artifact.dependency_summary?.transform_rule_supplied_now === false, 'transform rule supplied flag mismatch');
expect(artifact.dependency_summary?.agent2_transform_matrix_still_blocked === true, 'Agent 2 blocked flag mismatch');

const dedupeKeys = new Set();
const queueIds = new Set();
for (const row of rowDependencyRows) {
  expect(Boolean(row.queue_id), `${row.row_id} queue_id missing`);
  expect(Boolean(row.token_id), `${row.row_id} token_id missing`);
  expect(Number.isFinite(row.occurrences) && row.occurrences > 0, `${row.row_id} occurrences invalid`);
  expect(row.source_license_lane === 'commercial_clean_candidate', `${row.row_id} source lane mismatch`);
  expect(row.boundary_chain_link_status === 'linked', `${row.row_id} boundary chain link missing`);
  expect(
    row.dependency_status === 'source_citation_or_url_missing_and_transform_rule_missing_observed_only',
    `${row.row_id} dependency status mismatch`,
  );
  expect(
    row.agent1_route_blocker === 'stale_agent1_registry_target_current_agent1_thread_required',
    `${row.row_id} Agent 1 route blocker mismatch`,
  );
  expect(row.source_citation_supplied_by_agent3 === false, `${row.row_id} source citation supplied by Agent 3`);
  expect(row.source_acceptance_claimed_by_agent3 === false, `${row.row_id} source acceptance claimed`);
  expect(row.agent6_boundary_required === true, `${row.row_id} Agent 6 boundary flag mismatch`);
  expect(Array.isArray(row.source_families) && row.source_families.length > 0, `${row.row_id} source families missing`);
  expect(Array.isArray(row.source_rids) && row.source_rids.length === row.source_rid_count, `${row.row_id} source RID count mismatch`);
  expect(
    row.evidence_role === 'source_citation_dependency_navigation_only_no_source_or_transform_authority',
    `${row.row_id} evidence role mismatch`,
  );
  expect(!dedupeKeys.has(row.dedupe_key), `${row.row_id} duplicate dedupe key`);
  dedupeKeys.add(row.dedupe_key);
  expect(!queueIds.has(row.queue_id), `${row.row_id} duplicate queue id`);
  queueIds.add(row.queue_id);
}

const forbiddenKeys = [];
walk(artifact, (key, child, parentKey) => {
  if (parentKey === 'authority_boundary') return;
  if (
    [
      'surface',
      'normalized',
      'token_surface',
      'token_normalized',
      'focus_surface',
      'focus_normalized',
      'candidate_text',
      'definition_text',
      'source_text',
      'accepted_text',
      'display_text',
      'route_payload',
      'public_domain_headwords',
      'public_domain_rids',
      'source_headwords',
    ].includes(key)
  ) {
    forbiddenKeys.push(key);
  }
});
expect(forbiddenKeys.length === 0, `forbidden payload keys present: ${forbiddenKeys.join(', ')}`);

const stopCondition = artifact.downstream_handoff?.stop_condition || '';
expect(stopCondition.includes('source-citation dependency crossmatch'), 'stop condition must identify dependency crossmatch');
expect(stopCondition.includes('does not supply source citations'), 'stop condition must block source citation supply');
expect(stopCondition.includes('source/license/legal acceptance'), 'stop condition must block source/license/legal acceptance');
expect(stopCondition.includes('accepted text'), 'stop condition must block accepted text');

if (errors.length > 0) {
  for (const error of errors) console.error(`ERROR ${error}`);
  process.exit(1);
}

console.log(
  `Agent 3 source citation dependency passed: rows=${counts.row_dependency_rows} missing_citation=${counts.source_citation_missing_rows} blockers=${counts.exact_blocker_rows}`,
);

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function walk(value, callback, parentKey = '') {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    for (const item of value) walk(item, callback, parentKey);
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    callback(key, child, parentKey);
    walk(child, callback, key);
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(root, filePath), 'utf8'));
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function valueAfterEquals(arg) {
  const index = arg.indexOf('=');
  return index === -1 ? '' : arg.slice(index + 1);
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--input=')) parsed.input = cleanRelativePath(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}
