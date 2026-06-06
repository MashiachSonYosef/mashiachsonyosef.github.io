#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input:
    'reports/agent3-old-dictionary-candidate-use-source-rid-dedupe-coverage-crossmatch-2026-06-06.json',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_old_dictionary_candidate_use_source_rid_dedupe_coverage_crossmatch',
  'artifact_type mismatch',
);
expect(artifact.status === 'evidence-ready', 'status must be evidence-ready');

const boundary = artifact.authority_boundary || {};
for (const key of [
  'linkage_navigation_only',
  'source_rid_to_queue_source_dedupe_coverage_only',
  'queue_source_pair_key_is_dedupe_basis',
  'source_level_and_queue_source_occurrence_counts_are_not_interchangeable',
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
const rows = artifact.coverage_rows || [];
expect(rows.length === counts.coverage_rows, 'coverage row length mismatch');
expect(counts.input_workset_rows === 314, 'expected 314 workset rows');
expect(counts.input_workset_source_rid_references === 363, 'expected 363 workset source RID references');
expect(counts.dedupe_key_rows === 363, 'expected 363 dedupe key rows');
expect(counts.dedupe_unique_source_rids === 314, 'expected 314 dedupe unique source RIDs');
expect(counts.coverage_rows === 314, 'expected 314 coverage rows');
expect(counts.matched_source_rids === 314, 'expected every source RID matched');
expect(counts.missing_source_rids === 0, 'expected zero missing source RIDs');
expect(counts.extra_source_rids === 0, 'expected zero extra source RIDs');
expect(counts.workset_queue_source_pairs === 363, 'expected 363 workset queue/source pairs');
expect(counts.dedupe_queue_source_pairs === 363, 'expected 363 dedupe queue/source pairs');
expect(counts.queue_source_pair_missing_rows === 0, 'expected zero missing queue/source pairs');
expect(counts.queue_source_pair_extra_rows === 0, 'expected zero extra queue/source pairs');
expect(counts.reference_count_mismatch_rows === 0, 'expected zero reference count mismatches');
expect(counts.queue_set_mismatch_rows === 0, 'expected zero queue set mismatches');
expect(counts.source_level_occurrence_total === 7795, 'expected 7795 source-level occurrences');
expect(counts.queue_source_occurrence_membership_total === 12111, 'expected 12111 queue/source occurrence memberships');
expect(counts.multi_queue_source_rid_rows === 43, 'expected 43 multi-queue source RIDs');
expect(counts.single_queue_source_rid_rows === 271, 'expected 271 single-queue source RIDs');
expect(counts.source_rid_overlap_diagnostic_source_rows === 7, 'expected 7 source diagnostic source rows');
expect(counts.source_rid_overlap_diagnostic_queue_source_pairs === 16, 'expected 16 source diagnostic queue/source pairs');
expect(counts.batch_id_overlap_diagnostic_source_rows === 273, 'expected 273 batch diagnostic source rows');
expect(counts.batch_id_overlap_diagnostic_queue_source_pairs === 288, 'expected 288 batch diagnostic queue/source pairs');
expect(counts.source_and_batch_overlap_diagnostic_source_rows === 7, 'expected 7 source+batch diagnostic source rows');
expect(counts.source_citation_required_rows === 314, 'expected every source RID row to require source citation');
expect(counts.source_citation_or_url_present_rows === 0, 'expected zero source citations supplied');
expect(counts.transform_rule_still_blocked_rows === 314, 'expected every row to be transform blocked');
expect(counts.agent6_boundary_after_prereq_rows === 314, 'expected every row to preserve later Agent 6 boundary');
expect(counts.source_family_boundary_packet_exists_rows === 0, 'expected zero source-family boundary packet rows');
expect(counts.source_family_selection_boundary_blocker_rows === 314, 'expected every row to preserve source-family blocker');
expect(counts.route_write_allowed_rows === 0, 'expected zero route writes allowed');
expect(counts.candidate_text_allowed_rows === 0, 'expected zero candidate text rows allowed');
expect(counts.public_mutation_allowed_rows === 0, 'expected zero public mutation rows allowed');

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

let sourceLevelOccurrences = 0;
let queueSourceOccurrences = 0;
let previousDedupeCount = Number.POSITIVE_INFINITY;
for (const row of rows) {
  expect(row.coverage_status === 'covered_by_queue_source_dedupe_keys', `${row.source_rid} coverage status mismatch`);
  expect(row.queue_set_match === true, `${row.source_rid} queue set mismatch`);
  expect(row.reference_count_match === true, `${row.source_rid} reference count mismatch`);
  expect(row.workset_queue_ids.length === row.dedupe_key_count, `${row.source_rid} queue/dedupe count mismatch`);
  expect(row.queue_source_pair_keys.length === row.dedupe_key_count, `${row.source_rid} pair key count mismatch`);
  expect(row.dedupe_key_ids.length === row.dedupe_key_count, `${row.source_rid} dedupe key ID count mismatch`);
  expect(row.dedupe_key_count <= previousDedupeCount, `${row.source_rid} rows must sort by descending dedupe key count`);
  previousDedupeCount = row.dedupe_key_count;
  expect(row.occurrence_basis === 'source_level_total_and_queue_source_membership_total_are_reported_separately', `${row.source_rid} occurrence basis mismatch`);
  expect(row.evidence_role === 'source_rid_dedupe_coverage_crossmatch_navigation_only_no_acceptance_claim', `${row.source_rid} evidence role mismatch`);
  expect(row.source_citation_required === true, `${row.source_rid} source citation required mismatch`);
  expect(row.source_citation_or_url_present === false, `${row.source_rid} source citation present mismatch`);
  expect(row.transform_rule_still_blocked === true, `${row.source_rid} transform blocked mismatch`);
  expect(row.agent6_boundary_after_prereq === true, `${row.source_rid} Agent 6 boundary mismatch`);
  expect(row.source_family_boundary_packet_exists === false, `${row.source_rid} source-family packet exists mismatch`);
  expect(row.source_family_selection_boundary_blocker === true, `${row.source_rid} source-family blocker mismatch`);
  expect(row.route_write_allowed === false, `${row.source_rid} route write mismatch`);
  expect(row.candidate_text_allowed === false, `${row.source_rid} candidate text mismatch`);
  expect(row.public_mutation_allowed === false, `${row.source_rid} public mutation mismatch`);
  sourceLevelOccurrences += Number(row.source_level_occurrence_total || 0);
  queueSourceOccurrences += Number(row.queue_source_occurrence_membership_total || 0);
}
expect(sourceLevelOccurrences === counts.source_level_occurrence_total, 'source-level occurrence rollup mismatch');
expect(queueSourceOccurrences === counts.queue_source_occurrence_membership_total, 'queue/source occurrence rollup mismatch');

for (const listName of [
  'missing_source_rids',
  'extra_source_rids',
  'missing_queue_source_pairs',
  'extra_queue_source_pairs',
  'reference_count_mismatch_source_rids',
  'queue_set_mismatch_source_rids',
]) {
  expect(Array.isArray(artifact[listName]) && artifact[listName].length === 0, `${listName} must be an empty array`);
}

for (const inputPath of [
  artifact.inputs?.unpacketized_source_family_selection_workset,
  artifact.inputs?.queue_source_dedupe_key_index,
]) {
  expect(typeof inputPath === 'string' && fs.existsSync(path.resolve(root, inputPath)), `input missing: ${inputPath}`);
}
expect(artifact.downstream_handoff?.stop_condition?.includes('no source text read'), 'stop condition must preserve source-text boundary');
expect(artifact.downstream_handoff?.stop_condition?.includes('no source-family selection made'), 'stop condition must preserve source-family-selection boundary');
expect(artifact.downstream_handoff?.stop_condition?.includes('no acceptance action taken'), 'stop condition must preserve acceptance boundary');

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(
  `Agent 3 source-RID dedupe coverage crossmatch passed: source_rids=${counts.coverage_rows} pairs=${counts.workset_queue_source_pairs}`,
);

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log(
        'Usage: node scripts/validate_agent3_old_dictionary_candidate_use_source_rid_dedupe_coverage_crossmatch.mjs [--input=PATH]',
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
