#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input:
    'reports/agent3-old-dictionary-candidate-use-source-family-selection-batch-plan-2026-06-06.json',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_old_dictionary_candidate_use_source_family_selection_batch_plan',
  'artifact_type mismatch',
);
expect(artifact.status === 'evidence-ready', 'status must be evidence-ready');

const boundary = artifact.authority_boundary || {};
for (const key of [
  'linkage_navigation_only',
  'deterministic_batch_plan_only',
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
const batches = artifact.batch_rows || [];
expect(batches.length === counts.batch_rows, 'batch row length mismatch');
expect((artifact.source_family_signature_rows || []).length === counts.source_family_signature_rows, 'source-family summary row length mismatch');
expect((artifact.triage_signature_rows || []).length === counts.triage_signature_rows, 'triage summary row length mismatch');
expect((artifact.impact_bucket_rows || []).length === counts.impact_bucket_rows, 'impact summary row length mismatch');
expect((artifact.partition_signature_rows || []).length === counts.partition_signature_rows, 'partition summary row length mismatch');

expect(counts.input_workset_rows === 314, 'expected 314 input workset rows');
expect(counts.batch_rows === 16, 'expected 16 batch rows');
expect(counts.multi_row_batches === 12, 'expected 12 multi-row batches');
expect(counts.single_row_batches === 4, 'expected 4 single-row batches');
expect(counts.max_batch_rows === 138, 'expected max batch row count 138');
expect(counts.max_batch_occurrences === 1261, 'expected max batch occurrences 1261');
expect(counts.source_rid_references === 363, 'expected 363 source RID references');
expect(counts.occurrence_total === 7795, 'expected 7795 occurrences');
expect(counts.unique_source_rids === 314, 'expected 314 unique source RIDs');
expect(counts.unique_source_rid_prefixes === 19, 'expected 19 prefixes');
expect(counts.unique_queue_ids === 65, 'expected 65 queue IDs');
expect(counts.unique_token_ids === 65, 'expected 65 token IDs');
expect(counts.unique_lexicon_entry_ids === 65, 'expected 65 lexicon entry IDs');
expect(counts.source_family_signature_rows === 4, 'expected 4 source-family summary rows');
expect(counts.triage_signature_rows === 4, 'expected 4 triage summary rows');
expect(counts.impact_bucket_rows === 3, 'expected 3 impact summary rows');
expect(counts.partition_signature_rows === 2, 'expected 2 partition summary rows');
expect(counts.source_citation_required_rows === 314, 'expected every row to require source citation');
expect(counts.source_citation_or_url_present_rows === 0, 'expected no source citations supplied');
expect(counts.transform_rule_still_blocked_rows === 314, 'expected every row to keep transform blocked');
expect(counts.agent6_boundary_after_prereq_rows === 314, 'expected every row to preserve later Agent 6 boundary');
expect(counts.source_family_boundary_packet_exists_rows === 0, 'expected no source-family boundary packet to exist');
expect(counts.source_family_selection_boundary_blocker_rows === 314, 'expected every row to remain source-family-selection blocked');
expect(counts.route_write_allowed_rows === 0, 'expected zero route-write allowed rows');
expect(counts.candidate_text_allowed_rows === 0, 'expected zero candidate-text allowed rows');
expect(counts.public_mutation_allowed_rows === 0, 'expected zero public-mutation allowed rows');

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

const batchIds = new Set();
const batchKeys = new Set();
const sourceRids = new Set();
let rowTotal = 0;
let occurrenceTotal = 0;
let previousRows = Number.POSITIVE_INFINITY;
let previousOccurrencesForRows = Number.POSITIVE_INFINITY;
for (const batch of batches) {
  expect(batch.evidence_role === 'source_family_selection_batch_plan_navigation_only_no_selection_or_acceptance_claim', `${batch.batch_id} evidence role mismatch`);
  expect(!batchIds.has(batch.batch_id), `duplicate batch_id ${batch.batch_id}`);
  expect(!batchKeys.has(batch.batch_key), `duplicate batch_key ${batch.batch_key}`);
  batchIds.add(batch.batch_id);
  batchKeys.add(batch.batch_key);
  expect(batch.exact_blocker === 'source_family_selection_boundary_not_yet_packetized_for_agent6_prereq', `${batch.batch_id} exact blocker mismatch`);
  expect(batch.row_count === batch.unique_source_rids, `${batch.batch_id} row/source RID mismatch`);
  expect(batch.row_count === batch.source_rids.length, `${batch.batch_id} source RID list mismatch`);
  expect(batch.row_count === batch.row_ids.length, `${batch.batch_id} row ID list mismatch`);
  expect(batch.source_citation_required_rows === batch.row_count, `${batch.batch_id} source citation required mismatch`);
  expect(batch.source_citation_or_url_present_rows === 0, `${batch.batch_id} source citation present mismatch`);
  expect(batch.transform_rule_still_blocked_rows === batch.row_count, `${batch.batch_id} transform blocked mismatch`);
  expect(batch.agent6_boundary_after_prereq_rows === batch.row_count, `${batch.batch_id} Agent 6 boundary mismatch`);
  expect(batch.source_family_boundary_packet_exists_rows === 0, `${batch.batch_id} boundary packet exists mismatch`);
  expect(batch.source_family_selection_boundary_blocker_rows === batch.row_count, `${batch.batch_id} source-family blocker mismatch`);
  expect(batch.route_write_allowed_rows === 0, `${batch.batch_id} route write allowed mismatch`);
  expect(batch.candidate_text_allowed_rows === 0, `${batch.batch_id} candidate text allowed mismatch`);
  expect(batch.public_mutation_allowed_rows === 0, `${batch.batch_id} public mutation allowed mismatch`);
  if (batch.row_count !== previousRows) {
    expect(batch.row_count <= previousRows, `${batch.batch_id} order must descend by row count`);
    previousOccurrencesForRows = Number.POSITIVE_INFINITY;
  }
  expect(batch.occurrence_total <= previousOccurrencesForRows, `${batch.batch_id} order must descend by occurrences within row count`);
  previousRows = batch.row_count;
  previousOccurrencesForRows = batch.occurrence_total;
  rowTotal += batch.row_count;
  occurrenceTotal += batch.occurrence_total;
  for (const sourceRid of batch.source_rids) {
    expect(!sourceRids.has(sourceRid), `source RID appears in multiple batches: ${sourceRid}`);
    sourceRids.add(sourceRid);
  }
}
expect(rowTotal === counts.input_workset_rows, 'batch row total mismatch');
expect(occurrenceTotal === counts.occurrence_total, 'batch occurrence total mismatch');
expect(sourceRids.size === counts.unique_source_rids, 'unique source RID coverage mismatch');

for (const collection of [
  artifact.source_family_signature_rows || [],
  artifact.triage_signature_rows || [],
  artifact.impact_bucket_rows || [],
  artifact.partition_signature_rows || [],
]) {
  for (const row of collection) {
    expect(row.evidence_role === 'source_family_selection_batch_plan_group_summary_navigation_only_no_selection_or_acceptance_claim', 'summary evidence role mismatch');
    expect(row.batch_count > 0, 'summary row must include batches');
    expect(row.row_count > 0, 'summary row must include rows');
  }
}

for (const inputPath of [artifact.inputs?.unpacketized_source_family_selection_workset]) {
  expect(typeof inputPath === 'string' && fs.existsSync(path.resolve(root, inputPath)), `input missing: ${inputPath}`);
}
expect(artifact.downstream_handoff?.stop_condition?.includes('no source text read'), 'stop condition must preserve source-text boundary');
expect(artifact.downstream_handoff?.stop_condition?.includes('no source-family selection made'), 'stop condition must preserve source-family-selection boundary');

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(
  `Agent 3 source-family-selection batch plan passed: batches=${counts.batch_rows} rows=${counts.input_workset_rows} occurrences=${counts.occurrence_total}`,
);

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log(
        'Usage: node scripts/validate_agent3_old_dictionary_candidate_use_source_family_selection_batch_plan.mjs [--input=PATH]',
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
