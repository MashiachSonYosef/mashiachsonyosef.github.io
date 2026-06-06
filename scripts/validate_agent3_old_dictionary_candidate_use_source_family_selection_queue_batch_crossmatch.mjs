#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input:
    'reports/agent3-old-dictionary-candidate-use-source-family-selection-queue-batch-crossmatch-2026-06-06.json',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_old_dictionary_candidate_use_source_family_selection_queue_batch_crossmatch',
  'artifact_type mismatch',
);
expect(artifact.status === 'evidence-ready', 'status must be evidence-ready');

const boundary = artifact.authority_boundary || {};
for (const key of [
  'linkage_navigation_only',
  'queue_batch_crossmatch_only',
  'observed_source_families_are_not_selection_or_acceptance',
  'no_new_acceptance_or_release_claim',
]) {
  expect(boundary[key] === true, `authority_boundary.${key} must be true`);
}
for (const key of [
  'qa_acceptance',
  'agent6_acceptance',
  'source_family_selection',
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
const queueRows = artifact.queue_rows || [];
const batchQueueRows = artifact.batch_queue_rows || [];
const links = artifact.queue_source_rid_links || [];

expect(queueRows.length === counts.queue_rows, 'queue row length mismatch');
expect(batchQueueRows.length === counts.batch_queue_links, 'batch queue row length mismatch');
expect(links.length === counts.queue_source_rid_links, 'queue source RID link length mismatch');
expect(counts.input_batch_rows === 16, 'expected 16 input batches');
expect(counts.input_workset_rows === 314, 'expected 314 input workset rows');
expect(counts.queue_rows === 65, 'expected 65 queue rows');
expect(counts.queue_source_rid_links === 363, 'expected 363 queue/source RID links');
expect(counts.batch_queue_links === 94, 'expected 94 batch/queue links');
expect(counts.source_batch_pairs === 314, 'expected 314 source/batch pairs');
expect(counts.unique_source_rids === 314, 'expected 314 unique source RIDs');
expect(counts.unique_queue_ids === 65, 'expected 65 unique queue IDs');
expect(counts.unique_token_ids === 65, 'expected 65 unique token IDs');
expect(counts.cross_batch_queue_rows === 25, 'expected 25 cross-batch queue rows');
expect(counts.single_batch_queue_rows === 40, 'expected 40 single-batch queue rows');
expect(counts.multi_source_queue_rows === 61, 'expected 61 multi-source queue rows');
expect(counts.single_source_queue_rows === 4, 'expected 4 single-source queue rows');
expect(counts.multi_queue_source_rids === 43, 'expected 43 multi-queue source RIDs');
expect(counts.max_queue_batch_count === 3, 'expected max queue batch count 3');
expect(counts.max_queue_source_rid_count === 12, 'expected max queue source RID count 12');
expect(counts.max_queue_occurrence_total === 1344, 'expected max queue occurrence total 1344');
expect(counts.queue_reference_memberships === 475, 'expected 475 queue reference memberships');
expect(counts.queue_occurrence_memberships === 12111, 'expected 12111 queue occurrence memberships');
expect(counts.source_citation_required_links === 363, 'expected every queue link to require source citation');
expect(counts.source_citation_or_url_present_links === 0, 'expected no source citations supplied');
expect(counts.transform_rule_still_blocked_links === 363, 'expected every queue link to keep transform blocked');
expect(counts.agent6_boundary_after_prereq_links === 363, 'expected every queue link to preserve later Agent 6 boundary');
expect(counts.source_family_boundary_packet_exists_links === 0, 'expected no source-family boundary packet links');
expect(counts.source_family_selection_boundary_blocker_links === 363, 'expected every queue link to stay source-family-selection blocked');
expect(counts.route_write_allowed_links === 0, 'expected zero route write allowed links');
expect(counts.candidate_text_allowed_links === 0, 'expected zero candidate text allowed links');
expect(counts.public_mutation_allowed_links === 0, 'expected zero public mutation allowed links');

for (const key of [
  'source_family_selection_claims',
  'source_acceptance_claims',
  'source_citation_supplied_by_agent3_rows',
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
  'route_payload_field_hits',
  'forbidden_payload_field_hits',
  'acceptance_claims',
]) {
  expect(counts[key] === 0, `${key} must be zero`);
}

const queueIds = new Set();
let queueSourceTotal = 0;
let queueReferenceTotal = 0;
let queueOccurrenceTotal = 0;
for (const row of queueRows) {
  expect(row.evidence_role === 'source_family_selection_queue_crossmatch_navigation_only_no_selection_or_acceptance_claim', `${row.queue_id} evidence role mismatch`);
  expect(!queueIds.has(row.queue_id), `duplicate queue_id ${row.queue_id}`);
  queueIds.add(row.queue_id);
  expect(row.batch_count === row.batch_ids.length, `${row.queue_id} batch count mismatch`);
  expect(row.source_rid_count === row.source_rids.length, `${row.queue_id} source RID count mismatch`);
  expect(row.token_id_count === row.token_ids.length, `${row.queue_id} token ID count mismatch`);
  expect(row.cross_batch_queue === (row.batch_count > 1), `${row.queue_id} cross-batch flag mismatch`);
  expect(row.exact_blockers.includes('source_family_selection_boundary_not_yet_packetized_for_agent6_prereq'), `${row.queue_id} exact blocker missing`);
  queueSourceTotal += row.source_rid_count;
  queueReferenceTotal += row.reference_total;
  queueOccurrenceTotal += row.occurrence_total;
}
expect(queueSourceTotal === counts.queue_source_rid_links, 'queue source RID link rollup mismatch');
expect(queueReferenceTotal === counts.queue_reference_memberships, 'queue reference membership rollup mismatch');
expect(queueOccurrenceTotal === counts.queue_occurrence_memberships, 'queue occurrence membership rollup mismatch');

const linkIds = new Set();
const linkPairs = new Set();
for (const link of links) {
  expect(link.evidence_role === 'source_family_selection_queue_batch_link_navigation_only_no_selection_or_acceptance_claim', `${link.link_id} evidence role mismatch`);
  expect(!linkIds.has(link.link_id), `duplicate link_id ${link.link_id}`);
  const pair = `${link.queue_id}|${link.source_rid}`;
  expect(!linkPairs.has(pair), `duplicate queue/source RID pair ${pair}`);
  linkIds.add(link.link_id);
  linkPairs.add(pair);
  expect(link.exact_blocker === 'source_family_selection_boundary_not_yet_packetized_for_agent6_prereq', `${link.link_id} exact blocker mismatch`);
  expect(link.source_citation_required === true, `${link.link_id} source citation required mismatch`);
  expect(link.source_citation_or_url_present === false, `${link.link_id} source citation present mismatch`);
  expect(link.transform_rule_still_blocked === true, `${link.link_id} transform blocked mismatch`);
  expect(link.agent6_boundary_after_prereq === true, `${link.link_id} Agent 6 boundary mismatch`);
  expect(link.source_family_boundary_packet_exists === false, `${link.link_id} source-family packet exists mismatch`);
  expect(link.source_family_selection_boundary_blocker === true, `${link.link_id} source-family blocker mismatch`);
  expect(link.route_write_allowed === false, `${link.link_id} route write mismatch`);
  expect(link.candidate_text_allowed === false, `${link.link_id} candidate text mismatch`);
  expect(link.public_mutation_allowed === false, `${link.link_id} public mutation mismatch`);
}

const batchQueuePairs = new Set();
for (const row of batchQueueRows) {
  expect(row.evidence_role === 'source_family_selection_batch_queue_crossmatch_navigation_only_no_selection_or_acceptance_claim', `${row.batch_id}|${row.queue_id} evidence role mismatch`);
  const pair = `${row.batch_id}|${row.queue_id}`;
  expect(!batchQueuePairs.has(pair), `duplicate batch/queue pair ${pair}`);
  batchQueuePairs.add(pair);
  expect(row.source_rid_count === row.source_rids.length, `${pair} source RID count mismatch`);
}
expect(batchQueuePairs.size === counts.batch_queue_links, 'batch queue link count mismatch');

for (const inputPath of [
  artifact.inputs?.source_family_selection_batch_plan,
  artifact.inputs?.unpacketized_source_family_selection_workset,
]) {
  expect(typeof inputPath === 'string' && fs.existsSync(path.resolve(root, inputPath)), `input missing: ${inputPath}`);
}
expect(artifact.downstream_handoff?.stop_condition?.includes('no source text read'), 'stop condition must preserve source-text boundary');
expect(artifact.downstream_handoff?.stop_condition?.includes('no source-family selection made'), 'stop condition must preserve source-family-selection boundary');

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(
  `Agent 3 source-family-selection queue/batch crossmatch passed: queues=${counts.queue_rows} links=${counts.queue_source_rid_links} crossBatch=${counts.cross_batch_queue_rows}`,
);

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log(
        'Usage: node scripts/validate_agent3_old_dictionary_candidate_use_source_family_selection_queue_batch_crossmatch.mjs [--input=PATH]',
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
