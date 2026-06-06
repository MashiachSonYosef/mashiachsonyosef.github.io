#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input:
    'reports/agent3-old-dictionary-candidate-use-queue-source-subchain-handoff-index-2026-06-06.json',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_old_dictionary_candidate_use_queue_source_subchain_handoff_index',
  'artifact_type mismatch',
);
expect(artifact.status === 'evidence-ready', 'status must be evidence-ready');

const boundary = artifact.authority_boundary || {};
for (const key of [
  'linkage_navigation_only',
  'subchain_handoff_index_only',
  'queue_source_pair_key_is_dedupe_basis',
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
const entries = artifact.handoff_entries || [];
expect(entries.length === counts.handoff_entries, 'handoff entry length mismatch');
expect(counts.handoff_entries === 8, 'expected 8 subchain handoff entries');
expect(counts.json_artifacts_exist === 8, 'expected 8 JSON artifacts');
expect(counts.report_artifacts_exist === 8, 'expected 8 reports');
expect(counts.validator_scripts_exist === 8, 'expected 8 validator scripts');
expect(counts.artifact_type_mismatches === 0, 'expected zero artifact type mismatches');
expect(counts.evidence_ready_entries === 8, 'expected all entries evidence-ready');
expect(counts.queue_source_subchain_source_rids === 314, 'expected 314 source RIDs');
expect(counts.queue_source_subchain_source_rid_references === 363, 'expected 363 source RID references');
expect(counts.queue_source_subchain_queue_rows === 65, 'expected 65 queue rows');
expect(counts.queue_source_subchain_queue_source_pairs === 363, 'expected 363 queue/source pairs');
expect(counts.queue_source_subchain_cross_single_queues === '25-40', 'expected 25/40 cross-single queues');
expect(counts.queue_source_subchain_closure_queue_overlap_missing_extra === '0-0-0', 'expected zero queue closure issues');
expect(counts.queue_source_subchain_closure_pair_overlap_missing_extra === '0-0-0', 'expected zero pair closure issues');
expect(counts.queue_source_subchain_source_batch_diagnostics === '7-9', 'expected 7/9 source-batch diagnostic rows');
expect(counts.queue_source_subchain_dedupe_rows_duplicate_keys === '363-0', 'expected 363 dedupe rows and zero duplicate keys');
expect(counts.queue_source_subchain_coverage_missing_extra === '0-0-0-0', 'expected zero coverage missing/extra rows');
expect(counts.queue_source_subchain_coverage_mismatches === '0-0', 'expected zero coverage mismatches');
expect(counts.source_level_occurrence_total === 7795, 'expected 7795 source-level occurrences');
expect(counts.queue_source_occurrence_membership_total === 12111, 'expected 12111 queue/source occurrence memberships');
expect(counts.entries_with_nonzero_authority_counters === 0, 'expected zero entries with authority counters');

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

let expectedOrder = 1;
for (const entry of entries) {
  expect(entry.sequence_order === expectedOrder, `${entry.entry_id} sequence order mismatch`);
  expectedOrder += 1;
  expect(entry.json_artifact_exists === true, `${entry.entry_id} JSON artifact missing`);
  expect(entry.report_artifact_exists === true, `${entry.entry_id} report missing`);
  expect(entry.validator_script_exists === true, `${entry.entry_id} validator missing`);
  expect(entry.artifact_type_mismatch === false, `${entry.entry_id} artifact type mismatch`);
  expect(entry.observed_type === entry.expected_type, `${entry.entry_id} observed/expected type mismatch`);
  expect(entry.status === 'evidence-ready', `${entry.entry_id} status mismatch`);
  expect(entry.evidence_role === 'queue_source_subchain_handoff_index_entry_navigation_only_no_acceptance_claim', `${entry.entry_id} evidence role mismatch`);
  expect(fs.existsSync(path.resolve(root, entry.artifact_path)), `${entry.entry_id} artifact path missing`);
  expect(fs.existsSync(path.resolve(root, entry.report_path)), `${entry.entry_id} report path missing`);
  expect(fs.existsSync(path.resolve(root, entry.validator_script)), `${entry.entry_id} validator path missing`);
  for (const [counter, value] of Object.entries(entry.authority_counters || {})) {
    expect(Number(value || 0) === 0, `${entry.entry_id}.${counter} must be zero`);
  }
}

expect(artifact.downstream_handoff?.stop_condition?.includes('no source text read'), 'stop condition must preserve source-text boundary');
expect(artifact.downstream_handoff?.stop_condition?.includes('no source-family selection made'), 'stop condition must preserve source-family-selection boundary');
expect(artifact.downstream_handoff?.stop_condition?.includes('no acceptance action taken'), 'stop condition must preserve acceptance boundary');

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(
  `Agent 3 queue/source subchain handoff index passed: entries=${counts.handoff_entries} source_rids=${counts.queue_source_subchain_source_rids} pairs=${counts.queue_source_subchain_queue_source_pairs}`,
);

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log(
        'Usage: node scripts/validate_agent3_old_dictionary_candidate_use_queue_source_subchain_handoff_index.mjs [--input=PATH]',
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
