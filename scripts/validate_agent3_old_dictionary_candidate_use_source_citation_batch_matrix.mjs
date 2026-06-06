#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input:
    'reports/agent3-old-dictionary-candidate-use-source-citation-batch-matrix-2026-06-06.json',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_old_dictionary_candidate_use_source_citation_batch_matrix',
  'artifact_type mismatch',
);
expect(artifact.status === 'evidence-ready', 'status must be evidence-ready');

const boundary = artifact.authority_boundary || {};
for (const key of [
  'linkage_navigation_only',
  'source_citation_batch_matrix_only',
  'source_rids_are_identifiers_not_source_text',
  'mechanical_batch_order_is_not_route_ranking',
  'no_new_acceptance_or_release_claim',
]) {
  expect(boundary[key] === true, `authority_boundary.${key} must be true`);
}
for (const key of [
  'qa_acceptance',
  'source_provenance_acceptance',
  'source_license_acceptance',
  'source_legal_acceptance',
  'source_citation_supplied_by_agent3',
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
  'publication_readiness',
  'public_runtime_mutation',
  'accepted_gloss_text',
  'release_action',
]) {
  expect(boundary[key] === false, `authority_boundary.${key} must be false`);
}

const counts = artifact.counts || {};
const rows = artifact.batch_rows || [];
expect(rows.length === counts.batch_rows, 'batch row length mismatch');
expect(counts.batch_rows === 30, 'expected 30 batch rows');
expect(counts.worklist_rows === 344, 'expected 344 worklist rows');
expect(counts.source_rid_batch_memberships === 836, 'expected 836 source RID batch memberships');
expect(counts.source_rid_references === 1043, 'expected 1043 source RID reference memberships');
expect(counts.unique_source_rids === 344, 'expected 344 unique source RIDs');
expect(counts.unique_queue_ids === 78, 'expected 78 unique queue IDs');
expect(counts.unique_token_ids === 78, 'expected 78 unique token IDs');
expect(counts.source_family_count === 3, 'expected 3 source-family groups');
expect(counts.partition_count === 2, 'expected 2 partitions');
expect(counts.triage_group_count === 4, 'expected 4 triage groups');
expect(counts.mechanical_impact_bucket_count === 3, 'expected 3 impact buckets');
expect(counts.source_citation_required_memberships === 836, 'expected every membership to require source citation');
expect(counts.transform_rule_still_blocked_memberships === 836, 'expected every membership to keep transform blocked');
expect(counts.agent6_boundary_after_prereq_memberships === 836, 'expected every membership to keep Agent 6 boundary');
expect(counts.max_source_rids_per_batch > 100, 'expected at least one large batch');
expect(counts.max_queue_ids_per_batch === 40, 'expected 40 max queue IDs per batch');

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
  'source_citation_supplied_by_agent3_rows',
  'route_payload_field_hits',
  'forbidden_payload_field_hits',
  'acceptance_claims',
]) {
  expect(counts[key] === 0, `${key} must be zero`);
}

const batchIds = new Set();
const batchKeys = new Set();
const sourceRids = new Set();
let previousScore = Number.POSITIVE_INFINITY;
for (const row of rows) {
  expect(row.evidence_role === 'source_citation_batch_navigation_only_no_source_or_acceptance_claim', `${row.batch_key} evidence role mismatch`);
  expect(!batchIds.has(row.batch_id), `duplicate batch_id ${row.batch_id}`);
  expect(!batchKeys.has(row.batch_key), `duplicate batch_key ${row.batch_key}`);
  batchIds.add(row.batch_id);
  batchKeys.add(row.batch_key);
  for (const sourceRid of row.source_rids || []) sourceRids.add(sourceRid);
  expect(row.source_rid_count > 0, `${row.batch_key} must include source RIDs`);
  expect(row.queue_id_count > 0, `${row.batch_key} must include queue IDs`);
  expect(row.reference_total > 0, `${row.batch_key} must include references`);
  expect(row.source_citation_required_rows === row.source_rid_count, `${row.batch_key} must require source citation for every source RID`);
  expect(row.transform_rule_still_blocked_rows === row.source_rid_count, `${row.batch_key} must keep transform blocked for every source RID`);
  expect(row.agent6_boundary_after_prereq_rows === row.source_rid_count, `${row.batch_key} must keep Agent 6 boundary for every source RID`);
  expect(row.source_citation_or_url_present === false, `${row.batch_key} must not supply source citation`);
  expect(row.candidate_text_allowed === false, `${row.batch_key} candidate text must be false`);
  expect(row.route_write_allowed === false, `${row.batch_key} route write must be false`);
  expect(row.public_mutation_allowed === false, `${row.batch_key} public mutation must be false`);
  expect(row.current_blocker_ids.includes('missing_source_field::source_citation_or_url'), `${row.batch_key} missing source-citation blocker`);
  expect(
    row.current_blocker_ids.includes('missing_transform_output_proposal_matrix_or_exact_transform_rule'),
    `${row.batch_key} missing transform-output blocker`,
  );
  expect(row.mechanical_score_total <= previousScore, `${row.batch_key} mechanical order must be descending`);
  previousScore = row.mechanical_score_total;
}
expect(sourceRids.size === counts.unique_source_rids, 'unique source RID coverage mismatch');

const inputPath = artifact.inputs?.source_citation_enrichment_worklist;
expect(typeof inputPath === 'string' && fs.existsSync(path.resolve(root, inputPath)), 'source-citation worklist input missing');
expect(
  artifact.grouping_rule?.dimensions?.join('|') ===
    'source_family|partition|triage_group|mechanical_impact_bucket',
  'grouping dimensions mismatch',
);
expect(artifact.downstream_handoff?.stop_condition?.includes('no source text read'), 'stop condition must preserve source-text boundary');

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(
  `Agent 3 source-citation batch matrix passed: rows=${counts.batch_rows} memberships=${counts.source_rid_batch_memberships} unique=${counts.unique_source_rids}`,
);

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log(
        'Usage: node scripts/validate_agent3_old_dictionary_candidate_use_source_citation_batch_matrix.mjs [--input=PATH]',
      );
      process.exit(0);
    }
    if (arg.startsWith('--input=')) parsed.input = cleanRelativePath(arg.slice(arg.indexOf('=') + 1));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.resolve(root, relativePath), 'utf8'));
}

function cleanRelativePath(input) {
  const normalized = input.replaceAll('\\', '/');
  if (path.isAbsolute(normalized) || normalized.startsWith('../') || normalized.includes('/../')) {
    throw new Error(`Expected workspace-relative path, got ${input}`);
  }
  return normalized;
}
