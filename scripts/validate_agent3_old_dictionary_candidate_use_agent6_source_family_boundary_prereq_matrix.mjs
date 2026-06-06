#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input:
    'reports/agent3-old-dictionary-candidate-use-agent6-source-family-boundary-prereq-matrix-2026-06-06.json',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_old_dictionary_candidate_use_agent6_source_family_boundary_prereq_matrix',
  'artifact_type mismatch',
);
expect(artifact.status === 'evidence-ready', 'status must be evidence-ready');

const boundary = artifact.authority_boundary || {};
for (const key of [
  'linkage_navigation_only',
  'agent6_boundary_prereq_matrix_only',
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
const rows = artifact.boundary_rows || [];
const prefixRows = artifact.prefix_rows || [];
expect(rows.length === counts.boundary_rows, 'boundary row length mismatch');
expect(prefixRows.length === counts.prefix_rows, 'prefix row length mismatch');
expect(counts.boundary_rows === 25, 'expected 25 boundary rows');
expect(counts.prefix_rows === 10, 'expected 10 prefix rows');
expect(counts.source_rid_references === 25, 'expected 25 source RID references');
expect(counts.occurrence_total === 331, 'expected 331 occurrences');
expect(counts.unique_source_rids === 25, 'expected 25 unique source RIDs');
expect(counts.unique_source_rid_prefixes === 10, 'expected 10 unique prefixes');
expect(counts.unique_queue_ids === 9, 'expected 9 unique queue IDs');
expect(counts.unique_token_ids === 9, 'expected 9 unique token IDs');
expect(counts.unique_lexicon_entry_ids === 8, 'expected 8 unique lexicon entry IDs');
expect(counts.source_family_count === 1, 'expected 1 observed source family');
expect(counts.source_citation_required_rows === 25, 'expected every boundary row to require source citation');
expect(counts.source_citation_or_url_present_rows === 0, 'expected no source citation supplied');
expect(counts.transform_rule_still_blocked_rows === 25, 'expected every boundary row to keep transform blocked');
expect(counts.agent6_boundary_after_prereq_rows === 25, 'expected every row to require Agent 6 after prereq');
expect(counts.agent6_boundary_ready_now_rows === 0, 'expected 0 boundary-ready rows now');
expect(counts.worklist_rows === 344, 'expected 344 worklist rows');
expect(counts.prefix_matrix_rows === 54, 'expected 54 prefix matrix rows');

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
  'source_family_selection_claims',
  'source_citation_supplied_by_agent3_rows',
  'route_payload_field_hits',
  'forbidden_payload_field_hits',
  'acceptance_claims',
]) {
  expect(counts[key] === 0, `${key} must be zero`);
}

const rowIds = new Set();
const sourceRids = new Set();
let previousOccurrences = Number.POSITIVE_INFINITY;
for (const row of rows) {
  expect(row.evidence_role === 'agent6_source_family_boundary_prereq_navigation_only_no_acceptance_claim', `${row.source_rid} evidence role mismatch`);
  expect(!rowIds.has(row.row_id), `duplicate row_id ${row.row_id}`);
  expect(!sourceRids.has(row.source_rid), `duplicate source_rid ${row.source_rid}`);
  rowIds.add(row.row_id);
  sourceRids.add(row.source_rid);
  expect(row.source_families_observed.length === 1 && row.source_families_observed[0] === 'Jastrow Dictionary', `${row.source_rid} must be Jastrow-only observed family`);
  expect(row.partitions.length === 1 && row.partitions[0] === 'overlap_workset', `${row.source_rid} partition mismatch`);
  expect(row.triage_groups.length === 1 && row.triage_groups[0] === 'commercial_clean_nc_overlap', `${row.source_rid} triage mismatch`);
  expect(row.source_citation_required === true, `${row.source_rid} must require source citation`);
  expect(row.source_citation_or_url_present === false, `${row.source_rid} must not supply source citation`);
  expect(row.transform_rule_still_blocked === true, `${row.source_rid} must keep transform blocked`);
  expect(row.agent6_boundary_after_prereq === true, `${row.source_rid} must require Agent 6 after prereq`);
  expect(row.agent6_boundary_ready_now === false, `${row.source_rid} must not be boundary-ready now`);
  expect(row.current_blocker_ids.includes('commercial_clean_plus_nc_overlap_missing_agent6_source_family_selection_boundary'), `${row.source_rid} missing Agent 6 source-family blocker`);
  expect(row.prereq_blockers.includes('missing_source_field::source_citation_or_url'), `${row.source_rid} missing citation prereq`);
  expect(row.prereq_blockers.includes('missing_transform_output_proposal_matrix_or_exact_transform_rule'), `${row.source_rid} missing transform prereq`);
  expect(row.route_write_allowed === false, `${row.source_rid} route writes must be false`);
  expect(row.candidate_text_allowed === false, `${row.source_rid} candidate text must be false`);
  expect(row.public_mutation_allowed === false, `${row.source_rid} public mutation must be false`);
  expect(row.occurrence_total <= previousOccurrences, `${row.source_rid} mechanical order must descend by occurrences`);
  previousOccurrences = row.occurrence_total;
}

for (const row of prefixRows) {
  expect(row.evidence_role === 'agent6_source_family_boundary_prefix_summary_navigation_only_no_acceptance_claim', `${row.source_rid_prefix} prefix evidence role mismatch`);
  expect(row.boundary_source_rid_count > 0, `${row.source_rid_prefix} prefix must include rows`);
  expect(row.source_families_observed.length === 1 && row.source_families_observed[0] === 'Jastrow Dictionary', `${row.source_rid_prefix} prefix must be Jastrow-only`);
}

for (const inputPath of [
  artifact.inputs?.source_citation_enrichment_worklist,
  artifact.inputs?.source_citation_prefix_matrix,
]) {
  expect(typeof inputPath === 'string' && fs.existsSync(path.resolve(root, inputPath)), `input missing: ${inputPath}`);
}
expect(artifact.downstream_handoff?.stop_condition?.includes('no source text read'), 'stop condition must preserve source-text boundary');
expect(artifact.downstream_handoff?.stop_condition?.includes('source-family selection made'), 'stop condition must block source-family selection');

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(
  `Agent 3 Agent6 source-family boundary prereq matrix passed: rows=${counts.boundary_rows} prefixes=${counts.prefix_rows} occurrences=${counts.occurrence_total}`,
);

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log(
        'Usage: node scripts/validate_agent3_old_dictionary_candidate_use_agent6_source_family_boundary_prereq_matrix.mjs [--input=PATH]',
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
