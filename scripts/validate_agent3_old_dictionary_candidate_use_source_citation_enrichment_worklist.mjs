#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input:
    'reports/agent3-old-dictionary-candidate-use-source-citation-enrichment-worklist-2026-06-06.json',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_old_dictionary_candidate_use_source_citation_enrichment_worklist',
  'artifact_type mismatch',
);
expect(artifact.status === 'evidence-ready', 'status must be evidence-ready');

const boundary = artifact.authority_boundary || {};
for (const key of [
  'linkage_navigation_only',
  'source_citation_enrichment_worklist_only',
  'source_rids_are_identifiers_not_source_text',
  'mechanical_resolution_order_is_not_route_ranking',
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
const items = artifact.work_items || [];
expect(items.length === counts.worklist_rows, 'work item length mismatch');
expect(counts.worklist_rows === 344, 'expected 344 worklist rows');
expect(counts.source_rid_references === 393, 'expected 393 source RID references');
expect(counts.unique_source_rids === 344, 'expected 344 unique source RIDs');
expect(counts.source_rid_prefix_rows === 21, 'expected 21 source RID prefixes');
expect(counts.unique_queue_ids === 78, 'expected 78 unique queue IDs');
expect(counts.unique_token_ids === 78, 'expected 78 unique token IDs');
expect(counts.source_citation_required_rows === 344, 'expected every row to require source citation');
expect(counts.transform_rule_still_blocked_rows === 344, 'expected every row to keep transform blocked');
expect(counts.agent6_boundary_after_prereq_rows === 344, 'expected every row to keep Agent 6 boundary after prereq');
expect(counts.source_rid_blocker_matrix_rows === 344, 'source RID blocker matrix row count mismatch');
expect(counts.source_rid_blocker_matrix_references === 393, 'source RID blocker matrix reference count mismatch');
expect(counts.multi_queue_work_items > 0, 'expected nonzero multi-queue work items');
expect(counts.cross_partition_work_items > 0, 'expected nonzero cross-partition work items');
expect(counts.blocker_links >= 344 * 9, 'expected at least 9 blocker links per work item');

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

const ids = new Set();
const sourceRids = new Set();
let previousScore = Number.POSITIVE_INFINITY;
for (const item of items) {
  expect(item.evidence_role === 'source_citation_enrichment_navigation_only_no_source_or_acceptance_claim', `${item.source_rid} evidence role mismatch`);
  expect(!ids.has(item.work_item_id), `duplicate work_item_id ${item.work_item_id}`);
  expect(!sourceRids.has(item.source_rid), `duplicate source_rid ${item.source_rid}`);
  ids.add(item.work_item_id);
  sourceRids.add(item.source_rid);
  expect(item.source_citation_required === true, `${item.source_rid} must require source citation`);
  expect(item.source_citation_or_url_present === false, `${item.source_rid} must not supply source citation`);
  expect(item.transform_rule_still_blocked === true, `${item.source_rid} must keep transform blocked`);
  expect(item.agent6_boundary_after_prereq === true, `${item.source_rid} must keep Agent 6 boundary after prereq`);
  expect(item.route_write_allowed === false, `${item.source_rid} route writes must be false`);
  expect(item.candidate_text_allowed === false, `${item.source_rid} candidate text must be false`);
  expect(item.public_mutation_allowed === false, `${item.source_rid} public mutation must be false`);
  expect(item.queue_id_count > 0, `${item.source_rid} must have queue IDs`);
  expect(item.reference_count > 0, `${item.source_rid} must have references`);
  expect(item.current_blocker_ids.includes('missing_source_field::source_citation_or_url'), `${item.source_rid} missing source-citation blocker`);
  expect(
    item.current_blocker_ids.includes('missing_transform_output_proposal_matrix_or_exact_transform_rule'),
    `${item.source_rid} missing transform-output blocker`,
  );
  expect(item.mechanical_resolution_order_score <= previousScore, `${item.source_rid} mechanical order is not descending`);
  previousScore = item.mechanical_resolution_order_score;
}

const inputPath = artifact.inputs?.source_rid_blocker_matrix;
expect(typeof inputPath === 'string' && fs.existsSync(path.resolve(root, inputPath)), 'source RID blocker matrix input missing');
expect(artifact.downstream_handoff?.stop_condition?.includes('no source text read'), 'stop condition must preserve source-text boundary');

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(
  `Agent 3 source-citation enrichment worklist passed: rows=${counts.worklist_rows} refs=${counts.source_rid_references} multi=${counts.multi_queue_work_items}`,
);

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log(
        'Usage: node scripts/validate_agent3_old_dictionary_candidate_use_source_citation_enrichment_worklist.mjs [--input=PATH]',
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
