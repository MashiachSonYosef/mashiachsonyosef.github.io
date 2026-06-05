#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input: 'reports/agent3-old-dictionary-candidate-use-source-rid-continuity-crossmatch-2026-06-05.json',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_old_dictionary_candidate_use_source_rid_continuity_crossmatch',
  'artifact_type mismatch',
);
expect(artifact.status === 'evidence-ready', 'status must be evidence-ready');

const boundary = artifact.authority_boundary || {};
for (const key of [
  'linkage_navigation_only',
  'source_rid_identifier_only',
  'citation_metadata_presence_only',
  'candidate_use_planning_evidence_only',
]) {
  expect(boundary[key] === true, `authority_boundary.${key} must be true`);
}
for (const key of [
  'source_text_read',
  'source_ref_text_export',
  'candidate_text_export',
  'definition_content_storage',
  'lemma_content_storage',
  'reader_hint_content_storage',
  'usage_as_definition_authority',
  'definition_authority',
  'answer_selection',
  'answer_eligibility',
  'route_ranking',
  'source_license_acceptance',
  'qa_acceptance',
  'publication_readiness',
  'public_runtime_mutation',
  'accepted_gloss_text',
  'release_action',
]) {
  expect(boundary[key] === false, `authority_boundary.${key} must be false`);
}

const counts = artifact.counts || {};
const candidateRows = artifact.candidate_rows || [];
const prefixRows = artifact.source_rid_prefix_rows || [];

expect(candidateRows.length === counts.candidate_use_rows, 'candidate row length mismatch');
expect(prefixRows.length === counts.source_rid_prefix_rows, 'prefix row length mismatch');
expect(counts.candidate_use_rows === 78, 'expected 78 candidate-use rows');
expect(counts.candidate_use_occurrences === 1461, 'expected 1461 candidate-use occurrences');
expect(counts.unique_queue_ids === 78, 'expected 78 unique queue IDs');
expect(counts.unique_token_ids === 78, 'expected 78 unique token IDs');
expect(counts.duplicate_queue_ids === 0, 'queue IDs must be unique');
expect(counts.duplicate_token_ids === 0, 'token IDs must be unique');
expect(counts.source_rid_references === 393, 'expected 393 source RID references');
expect(counts.unique_source_rids === 344, 'expected 344 unique source RIDs');
expect(counts.source_rid_prefix_rows === 21, 'expected 21 candidate RID prefixes');
expect(counts.rid_namespace_inventory_prefix_rows === 22, 'expected 22 namespace inventory prefixes');
expect(counts.rid_namespace_inventory_unique_rids === 847, 'expected 847 namespace inventory unique RIDs');
expect(counts.rows_with_agent1_citation_metadata === 78, 'all rows must have Agent 1 metadata rows');
expect(counts.rows_missing_agent1_citation_metadata === 0, 'no rows may miss Agent 1 metadata rows');
expect(counts.rows_with_all_source_rids_in_agent1_metadata === 78, 'all candidate RIDs must match Agent 1 metadata rows');
expect(counts.rows_with_missing_source_rids_in_agent1_metadata === 0, 'no source RIDs may be missing from metadata');
expect(counts.source_rid_prefixes_missing_namespace === 0, 'no candidate RID prefix may miss namespace');
expect(counts.namespace_prefixes_unused_by_candidate_package === 1, 'expected one unused namespace prefix');
expect((artifact.namespace_prefixes_unused_by_candidate_package || []).includes('Q'), 'unused namespace prefix Q expected');
expect(counts.row_overlap_sample_linked_rows === 19, 'expected 19 prior sample-linked rows');
expect(counts.row_overlap_sample_unlinked_rows === 59, 'expected 59 prior sample-unlinked rows');
expect(counts.agent6_verdict_loaded === 1, 'Agent 6 verdict must be loaded');

for (const key of [
  'candidate_text_rows',
  'definition_content_rows',
  'lemma_content_rows',
  'reader_hint_content_rows',
  'answer_rows',
  'answer_eligible_rows',
  'route_jsonl_rows',
  'route_shard_writes',
  'public_runtime_mutation',
  'source_text_rows',
  'accepted_text_rows',
  'release_actions',
  'route_payload_field_hits',
  'forbidden_payload_field_hits',
  'acceptance_claims',
]) {
  expect(counts[key] === 0, `${key} must be zero`);
}

const requiredPrefixes = new Set([
  'A',
  'B',
  'BDB',
  'BDBA',
  'C',
  'D',
  'E',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'P',
  'R',
  'S',
  'T',
  'U',
  'V',
]);
for (const prefix of requiredPrefixes) {
  expect(prefixRows.some((row) => row.rid_prefix === prefix), `missing RID prefix ${prefix}`);
}

const candidateDedupeKeys = new Set();
for (const row of candidateRows) {
  expect(Boolean(row.queue_id), `${row.row_id} queue_id missing`);
  expect(Boolean(row.token_id), `${row.row_id} token_id missing`);
  expect(Number.isFinite(row.occurrences) && row.occurrences > 0, `${row.row_id} occurrences invalid`);
  expect(Array.isArray(row.source_rids) && row.source_rids.length > 0, `${row.row_id} source_rids missing`);
  expect(row.source_rid_count === row.source_rids.length, `${row.row_id} source_rid_count mismatch`);
  expect(row.unique_source_rid_count === new Set(row.source_rids).size, `${row.row_id} unique_source_rid_count mismatch`);
  expect(Array.isArray(row.source_rid_prefixes) && row.source_rid_prefixes.length > 0, `${row.row_id} source_rid_prefixes missing`);
  expect(row.citation_metadata_status === 'agent1_metadata_row_present', `${row.row_id} metadata status mismatch`);
  expect(row.all_source_rids_in_agent1_metadata === true, `${row.row_id} must match all metadata RIDs`);
  expect(Array.isArray(row.missing_source_rids_in_agent1_metadata), `${row.row_id} missing RID list absent`);
  expect(row.missing_source_rids_in_agent1_metadata.length === 0, `${row.row_id} has missing metadata RIDs`);
  expect(
    ['sample_linked_to_row_overlap_bucket', 'not_in_row_overlap_sample_index'].includes(row.row_overlap_sample_status),
    `${row.row_id} row-overlap status invalid`,
  );
  expect(row.evidence_role === 'source_rid_identifier_continuity_navigation_only', `${row.row_id} evidence role mismatch`);
  expect(
    row.downstream_transform_status ===
      'blocked_pending_exact_agent1_agent6_boundary_fields_no_text_or_route_output',
    `${row.row_id} downstream status mismatch`,
  );
  expect(Boolean(row.dedupe_key), `${row.row_id} dedupe_key missing`);
  expect(!candidateDedupeKeys.has(row.dedupe_key), `${row.row_id} duplicate dedupe key`);
  candidateDedupeKeys.add(row.dedupe_key);
}

const prefixDedupeKeys = new Set();
for (const row of prefixRows) {
  expect(requiredPrefixes.has(row.rid_prefix), `${row.row_id} unexpected prefix`);
  expect(row.namespace_row_present === true, `${row.rid_prefix} namespace row missing`);
  expect(row.namespace_license_lane === 'commercial_clean_candidate', `${row.rid_prefix} namespace license lane mismatch`);
  expect(row.candidate_rows > 0, `${row.rid_prefix} candidate rows must be positive`);
  expect(row.source_rid_references > 0, `${row.rid_prefix} RID references must be positive`);
  expect(row.unique_source_rids > 0, `${row.rid_prefix} unique RIDs must be positive`);
  expect(row.namespace_prefix_not_source_family_proof === true, `${row.rid_prefix} prefix proof flag mismatch`);
  expect(row.status === 'source_rid_prefix_namespace_linked_navigation_only', `${row.rid_prefix} status mismatch`);
  expect(Array.isArray(row.queue_id_sample), `${row.rid_prefix} queue sample missing`);
  expect(Array.isArray(row.token_id_sample), `${row.rid_prefix} token sample missing`);
  expect(Boolean(row.dedupe_key), `${row.rid_prefix} dedupe_key missing`);
  expect(!prefixDedupeKeys.has(row.dedupe_key), `${row.rid_prefix} duplicate dedupe key`);
  prefixDedupeKeys.add(row.dedupe_key);
}

const forbiddenKeys = [];
walk(artifact, (key) => {
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
      'source_ref_text',
      'accepted_text',
      'display_text',
      'route_payload',
      'public_domain_headwords',
      'public_domain_refs_sample',
    ].includes(key)
  ) {
    forbiddenKeys.push(key);
  }
});
expect(forbiddenKeys.length === 0, `forbidden payload keys present: ${forbiddenKeys.join(', ')}`);

const stopCondition = artifact.downstream_handoff?.stop_condition || '';
expect(stopCondition.includes('identifier/provenance navigation only'), 'stop condition must describe navigation-only use');
expect(stopCondition.includes('Do not emit source refs'), 'stop condition must block source refs');
expect(stopCondition.includes('candidate text'), 'stop condition must block candidate text');
expect(stopCondition.includes('route writes'), 'stop condition must block route writes');
expect(stopCondition.includes('accepted text'), 'stop condition must block accepted text');

if (errors.length > 0) {
  for (const error of errors) console.error(`ERROR ${error}`);
  process.exit(1);
}

console.log(
  `Agent 3 source-RID continuity crossmatch passed: candidate_rows=${counts.candidate_use_rows} rid_refs=${counts.source_rid_references} unique_rids=${counts.unique_source_rids} prefixes=${counts.source_rid_prefix_rows} metadata_rows=${counts.rows_with_agent1_citation_metadata}`,
);

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function walk(value, callback) {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    for (const item of value) walk(item, callback);
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    callback(key, child);
    walk(child, callback);
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(root, filePath), 'utf8'));
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    const [key, value] = arg.split('=');
    if (!key.startsWith('--') || value === undefined) continue;
    if (key === '--input') parsed.input = cleanRelativePath(value);
  }
  return parsed;
}

function cleanRelativePath(value) {
  return value.replace(/^["']|["']$/g, '').replaceAll('\\', '/');
}
