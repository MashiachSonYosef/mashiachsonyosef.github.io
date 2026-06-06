#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input:
    'reports/agent3-old-dictionary-candidate-use-single-batch-queue-workset-2026-06-06.json',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(artifact.artifact_type === 'agent3_old_dictionary_candidate_use_single_batch_queue_workset', 'artifact_type mismatch');
expect(artifact.status === 'evidence-ready', 'status must be evidence-ready');

const boundary = artifact.authority_boundary || {};
for (const key of [
  'linkage_navigation_only',
  'single_batch_queue_workset_only',
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
const rows = artifact.workset_rows || [];
const links = artifact.single_batch_queue_source_links || [];
expect(rows.length === counts.workset_rows, 'workset row length mismatch');
expect(links.length === counts.queue_source_links, 'queue/source link length mismatch');
expect((artifact.batch_rows || []).length === counts.batch_rows, 'batch summary length mismatch');
expect((artifact.source_family_signature_rows || []).length === counts.source_family_signature_rows, 'source-family summary length mismatch');
expect((artifact.triage_signature_rows || []).length === counts.triage_signature_rows, 'triage summary length mismatch');
expect((artifact.impact_bucket_rows || []).length === counts.impact_bucket_rows, 'impact summary length mismatch');

expect(counts.input_queue_rows === 65, 'expected 65 input queue rows');
expect(counts.input_queue_source_links === 363, 'expected 363 input queue/source links');
expect(counts.workset_rows === 40, 'expected 40 single-batch queue rows');
expect(counts.queue_source_links === 200, 'expected 200 single-batch queue/source links');
expect(counts.batch_queue_links === 40, 'expected 40 batch/queue links');
expect(counts.unique_source_rids === 200, 'expected 200 unique source RIDs');
expect(counts.unique_queue_ids === 40, 'expected 40 unique queue IDs');
expect(counts.unique_token_ids === 44, 'expected 44 unique token IDs');
expect(counts.unique_batch_ids === 11, 'expected 11 unique batch IDs');
expect(counts.multi_source_queue_rows === 36, 'expected 36 multi-source queue rows');
expect(counts.single_source_queue_rows === 4, 'expected 4 single-source queue rows');
expect(counts.cross_batch_queue_rows === 0, 'expected 0 cross-batch queue rows');
expect(counts.max_queue_source_rid_count === 12, 'expected max source RID count 12');
expect(counts.max_queue_occurrence_total === 450, 'expected max occurrence total 450');
expect(counts.reference_total === 209, 'expected 209 references');
expect(counts.occurrence_total === 3300, 'expected 3300 occurrences');
expect(counts.batch_rows === 11, 'expected 11 batch summary rows');
expect(counts.source_family_signature_rows === 4, 'expected 4 source-family summary rows');
expect(counts.triage_signature_rows === 3, 'expected 3 triage summary rows');
expect(counts.impact_bucket_rows === 3, 'expected 3 impact summary rows');
expect(counts.source_citation_required_links === 200, 'expected every link to require source citation');
expect(counts.source_citation_or_url_present_links === 0, 'expected no source citations supplied');
expect(counts.transform_rule_still_blocked_links === 200, 'expected every link to keep transform blocked');
expect(counts.agent6_boundary_after_prereq_links === 200, 'expected every link to preserve later Agent 6 boundary');
expect(counts.source_family_boundary_packet_exists_links === 0, 'expected no source-family boundary packet links');
expect(counts.source_family_selection_boundary_blocker_links === 200, 'expected every link to remain source-family-selection blocked');
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
let linkTotal = 0;
let referenceTotal = 0;
let occurrenceTotal = 0;
let previousSourceCount = Number.POSITIVE_INFINITY;
let previousOccurrence = Number.POSITIVE_INFINITY;
for (const row of rows) {
  expect(row.evidence_role === 'single_batch_queue_workset_navigation_only_no_selection_or_acceptance_claim', `${row.queue_id} evidence role mismatch`);
  expect(!queueIds.has(row.queue_id), `duplicate queue ${row.queue_id}`);
  queueIds.add(row.queue_id);
  expect(row.batch_count === 1, `${row.queue_id} must be single-batch`);
  expect(row.batch_id === row.batch_ids[0], `${row.queue_id} batch ID mismatch`);
  expect(row.queue_scope === 'single_batch_queue_navigation_only', `${row.queue_id} scope mismatch`);
  expect(row.exact_blocker === 'single_batch_queue_still_missing_source_citation_transform_and_boundary_packet', `${row.queue_id} exact blocker mismatch`);
  expect(row.queue_source_link_count === row.source_rid_count, `${row.queue_id} source link count mismatch`);
  expect(row.source_citation_required_links === row.queue_source_link_count, `${row.queue_id} source citation required mismatch`);
  expect(row.source_citation_or_url_present_links === 0, `${row.queue_id} source citation present mismatch`);
  expect(row.transform_rule_still_blocked_links === row.queue_source_link_count, `${row.queue_id} transform blocked mismatch`);
  expect(row.agent6_boundary_after_prereq_links === row.queue_source_link_count, `${row.queue_id} Agent 6 boundary mismatch`);
  expect(row.source_family_boundary_packet_exists_links === 0, `${row.queue_id} source-family packet exists mismatch`);
  expect(row.source_family_selection_boundary_blocker_links === row.queue_source_link_count, `${row.queue_id} source-family blocker mismatch`);
  expect(row.route_write_allowed_links === 0, `${row.queue_id} route write mismatch`);
  expect(row.candidate_text_allowed_links === 0, `${row.queue_id} candidate text mismatch`);
  expect(row.public_mutation_allowed_links === 0, `${row.queue_id} public mutation mismatch`);
  if (row.source_rid_count !== previousSourceCount) {
    expect(row.source_rid_count <= previousSourceCount, `${row.queue_id} order must descend by source count`);
    previousOccurrence = Number.POSITIVE_INFINITY;
  }
  expect(row.occurrence_total <= previousOccurrence, `${row.queue_id} order must descend by occurrence within source count`);
  previousSourceCount = row.source_rid_count;
  previousOccurrence = row.occurrence_total;
  linkTotal += row.queue_source_link_count;
  referenceTotal += row.reference_total;
  occurrenceTotal += row.occurrence_total;
}
expect(linkTotal === counts.queue_source_links, 'link rollup mismatch');
expect(referenceTotal === counts.reference_total, 'reference rollup mismatch');
expect(occurrenceTotal === counts.occurrence_total, 'occurrence rollup mismatch');

const linkPairs = new Set();
for (const link of links) {
  const pair = `${link.queue_id}|${link.source_rid}`;
  expect(!linkPairs.has(pair), `duplicate link pair ${pair}`);
  linkPairs.add(pair);
  expect(queueIds.has(link.queue_id), `${link.link_id} queue not in workset`);
  expect(link.evidence_role === 'source_family_selection_queue_batch_link_navigation_only_no_selection_or_acceptance_claim', `${link.link_id} evidence role mismatch`);
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
  artifact.batch_rows || [],
  artifact.source_family_signature_rows || [],
  artifact.triage_signature_rows || [],
  artifact.impact_bucket_rows || [],
]) {
  for (const row of collection) {
    expect(row.evidence_role === 'single_batch_queue_workset_group_summary_navigation_only_no_selection_or_acceptance_claim', 'summary evidence role mismatch');
    expect(row.queue_count > 0, 'summary row must include queues');
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
  `Agent 3 single-batch queue workset passed: queues=${counts.workset_rows} links=${counts.queue_source_links} batches=${counts.unique_batch_ids}`,
);

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log(
        'Usage: node scripts/validate_agent3_old_dictionary_candidate_use_single_batch_queue_workset.mjs [--input=PATH]',
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
