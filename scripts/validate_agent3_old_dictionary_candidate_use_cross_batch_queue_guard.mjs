#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input:
    'reports/agent3-old-dictionary-candidate-use-cross-batch-queue-guard-2026-06-06.json',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(artifact.artifact_type === 'agent3_old_dictionary_candidate_use_cross_batch_queue_guard', 'artifact_type mismatch');
expect(artifact.status === 'evidence-ready', 'status must be evidence-ready');

const boundary = artifact.authority_boundary || {};
for (const key of [
  'linkage_navigation_only',
  'cross_batch_queue_guard_only',
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
const guards = artifact.guard_rows || [];
const links = artifact.guarded_queue_source_links || [];
expect(guards.length === counts.guard_rows, 'guard row length mismatch');
expect(links.length === counts.queue_source_links, 'guarded link length mismatch');
expect((artifact.batch_guard_rows || []).length === counts.batch_guard_rows, 'batch guard row length mismatch');
expect((artifact.source_family_signature_rows || []).length === counts.source_family_signature_rows, 'source-family summary length mismatch');
expect((artifact.triage_signature_rows || []).length === counts.triage_signature_rows, 'triage summary length mismatch');
expect((artifact.impact_bucket_rows || []).length === counts.impact_bucket_rows, 'impact summary length mismatch');

expect(counts.input_queue_rows === 65, 'expected 65 input queue rows');
expect(counts.input_queue_source_links === 363, 'expected 363 input queue/source links');
expect(counts.guard_rows === 25, 'expected 25 cross-batch guard rows');
expect(counts.queue_source_links === 163, 'expected 163 guarded queue/source links');
expect(counts.batch_queue_links === 54, 'expected 54 guarded batch/queue links');
expect(counts.unique_source_rids === 121, 'expected 121 unique guarded source RIDs');
expect(counts.unique_queue_ids === 25, 'expected 25 unique guarded queue IDs');
expect(counts.unique_token_ids === 27, 'expected 27 unique guarded token IDs');
expect(counts.unique_batch_ids === 14, 'expected 14 unique guarded batch IDs');
expect(counts.three_batch_queue_rows === 4, 'expected 4 three-batch guard rows');
expect(counts.two_batch_queue_rows === 21, 'expected 21 two-batch guard rows');
expect(counts.max_queue_batch_count === 3, 'expected max queue batch count 3');
expect(counts.max_queue_source_rid_count === 11, 'expected max queue source RID count 11');
expect(counts.max_queue_occurrence_total === 1344, 'expected max queue occurrence total 1344');
expect(counts.reference_total === 266, 'expected 266 guarded references');
expect(counts.occurrence_total === 8811, 'expected 8811 guarded occurrences');
expect(counts.batch_guard_rows === 14, 'expected 14 batch guard summary rows');
expect(counts.source_family_signature_rows === 3, 'expected 3 source-family signature summaries');
expect(counts.triage_signature_rows === 4, 'expected 4 triage signature summaries');
expect(counts.impact_bucket_rows === 3, 'expected 3 impact bucket summaries');
expect(counts.source_citation_required_links === 163, 'expected every guarded link to require source citation');
expect(counts.source_citation_or_url_present_links === 0, 'expected no source citations supplied');
expect(counts.transform_rule_still_blocked_links === 163, 'expected every guarded link to keep transform blocked');
expect(counts.agent6_boundary_after_prereq_links === 163, 'expected every guarded link to preserve later Agent 6 boundary');
expect(counts.source_family_boundary_packet_exists_links === 0, 'expected no source-family boundary packet links');
expect(counts.source_family_selection_boundary_blocker_links === 163, 'expected every guarded link to remain source-family-selection blocked');
expect(counts.route_write_allowed_links === 0, 'expected zero route-write allowed links');
expect(counts.candidate_text_allowed_links === 0, 'expected zero candidate-text allowed links');
expect(counts.public_mutation_allowed_links === 0, 'expected zero public-mutation allowed links');

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
let referenceTotal = 0;
let occurrenceTotal = 0;
let guardedLinkTotal = 0;
let previousBatchCount = Number.POSITIVE_INFINITY;
let previousSourceCount = Number.POSITIVE_INFINITY;
for (const guard of guards) {
  expect(guard.evidence_role === 'cross_batch_queue_guard_navigation_only_no_selection_or_acceptance_claim', `${guard.queue_id} evidence role mismatch`);
  expect(!queueIds.has(guard.queue_id), `duplicate guard queue ${guard.queue_id}`);
  queueIds.add(guard.queue_id);
  expect(guard.batch_count > 1, `${guard.queue_id} must be cross-batch`);
  expect(guard.guard_status === 'cross_batch_queue_duplicate_claim_guard_required', `${guard.queue_id} guard status mismatch`);
  expect(guard.exact_blocker === 'queue_token_spans_multiple_source_family_selection_batches', `${guard.queue_id} exact blocker mismatch`);
  expect(guard.batch_queue_link_count === guard.batch_count, `${guard.queue_id} batch queue link count mismatch`);
  expect(guard.queue_source_link_count === guard.source_rid_count, `${guard.queue_id} queue source link count mismatch`);
  expect(guard.source_citation_required_links === guard.queue_source_link_count, `${guard.queue_id} source citation required mismatch`);
  expect(guard.source_citation_or_url_present_links === 0, `${guard.queue_id} source citation present mismatch`);
  expect(guard.transform_rule_still_blocked_links === guard.queue_source_link_count, `${guard.queue_id} transform blocked mismatch`);
  expect(guard.agent6_boundary_after_prereq_links === guard.queue_source_link_count, `${guard.queue_id} Agent 6 boundary mismatch`);
  expect(guard.source_family_boundary_packet_exists_links === 0, `${guard.queue_id} source-family packet exists mismatch`);
  expect(guard.source_family_selection_boundary_blocker_links === guard.queue_source_link_count, `${guard.queue_id} source-family blocker mismatch`);
  expect(guard.route_write_allowed_links === 0, `${guard.queue_id} route write mismatch`);
  expect(guard.candidate_text_allowed_links === 0, `${guard.queue_id} candidate text mismatch`);
  expect(guard.public_mutation_allowed_links === 0, `${guard.queue_id} public mutation mismatch`);
  if (guard.batch_count !== previousBatchCount) {
    expect(guard.batch_count <= previousBatchCount, `${guard.queue_id} order must descend by batch count`);
    previousSourceCount = Number.POSITIVE_INFINITY;
  }
  expect(guard.source_rid_count <= previousSourceCount, `${guard.queue_id} order must descend by source count within batch count`);
  previousBatchCount = guard.batch_count;
  previousSourceCount = guard.source_rid_count;
  referenceTotal += guard.reference_total;
  occurrenceTotal += guard.occurrence_total;
  guardedLinkTotal += guard.queue_source_link_count;
}
expect(referenceTotal === counts.reference_total, 'guard reference rollup mismatch');
expect(occurrenceTotal === counts.occurrence_total, 'guard occurrence rollup mismatch');
expect(guardedLinkTotal === counts.queue_source_links, 'guarded link rollup mismatch');

const linkIds = new Set();
const linkPairs = new Set();
for (const link of links) {
  expect(link.evidence_role === 'source_family_selection_queue_batch_link_navigation_only_no_selection_or_acceptance_claim', `${link.link_id} evidence role mismatch`);
  expect(!linkIds.has(link.link_id), `duplicate guarded link ${link.link_id}`);
  const pair = `${link.queue_id}|${link.source_rid}`;
  expect(!linkPairs.has(pair), `duplicate guarded queue/source pair ${pair}`);
  linkIds.add(link.link_id);
  linkPairs.add(pair);
  expect(queueIds.has(link.queue_id), `${link.link_id} queue not guarded`);
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

for (const collection of [
  artifact.batch_guard_rows || [],
  artifact.source_family_signature_rows || [],
  artifact.triage_signature_rows || [],
  artifact.impact_bucket_rows || [],
]) {
  for (const row of collection) {
    expect(row.evidence_role === 'cross_batch_queue_guard_group_summary_navigation_only_no_selection_or_acceptance_claim', 'summary evidence role mismatch');
    expect(row.queue_count > 0, 'summary row must include guarded queues');
  }
}

for (const inputPath of [artifact.inputs?.source_family_selection_queue_batch_crossmatch]) {
  expect(typeof inputPath === 'string' && fs.existsSync(path.resolve(root, inputPath)), `input missing: ${inputPath}`);
}
expect(artifact.downstream_handoff?.stop_condition?.includes('no source text read'), 'stop condition must preserve source-text boundary');
expect(artifact.downstream_handoff?.stop_condition?.includes('no source-family selection made'), 'stop condition must preserve source-family-selection boundary');

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(
  `Agent 3 cross-batch queue guard passed: guards=${counts.guard_rows} links=${counts.queue_source_links} batches=${counts.batch_queue_links}`,
);

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log(
        'Usage: node scripts/validate_agent3_old_dictionary_candidate_use_cross_batch_queue_guard.mjs [--input=PATH]',
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
