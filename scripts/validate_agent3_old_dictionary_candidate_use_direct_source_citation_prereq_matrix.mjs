#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input:
    'reports/agent3-old-dictionary-candidate-use-direct-source-citation-prereq-matrix-2026-06-06.json',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_old_dictionary_candidate_use_direct_source_citation_prereq_matrix',
  'artifact_type mismatch',
);
expect(artifact.status === 'evidence-ready', 'status must be evidence-ready');

const boundary = artifact.authority_boundary || {};
for (const key of [
  'linkage_navigation_only',
  'direct_source_citation_prereq_matrix_only',
  'excludes_agent6_source_family_boundary_subset',
  'excludes_all_source_family_selection_boundary_blockers',
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
const rows = artifact.direct_rows || [];
const prefixRows = artifact.prefix_rows || [];
const sourceFamilyRows = artifact.source_family_rows || [];
expect(rows.length === counts.direct_rows, 'direct row length mismatch');
expect(prefixRows.length === counts.prefix_rows, 'prefix row length mismatch');
expect(sourceFamilyRows.length === counts.source_family_rows, 'source family row length mismatch');
expect(counts.direct_rows === 5, 'expected 5 direct rows');
expect(counts.excluded_agent6_source_family_boundary_rows === 25, 'expected 25 excluded Agent 6 boundary rows');
expect(counts.excluded_source_family_selection_boundary_rows === 339, 'expected 339 excluded source-family-selection boundary rows');
expect(counts.worklist_rows === 344, 'expected 344 worklist rows');
expect(counts.source_rid_references === 5, 'expected 5 source RID references');
expect(counts.occurrence_total === 58, 'expected 58 occurrences');
expect(counts.unique_source_rids === 5, 'expected 5 unique source RIDs');
expect(counts.unique_source_rid_prefixes === 5, 'expected 5 unique prefixes');
expect(counts.unique_queue_ids === 5, 'expected 5 unique queue IDs');
expect(counts.unique_token_ids === 5, 'expected 5 unique token IDs');
expect(counts.unique_lexicon_entry_ids === 5, 'expected 5 unique lexicon entry IDs');
expect(counts.prefix_rows === 5, 'expected 5 prefix rows');
expect(counts.source_family_rows === 1, 'expected 1 source family row');
expect(counts.source_family_memberships === 5, 'expected 5 source-family memberships');
expect(counts.source_citation_required_rows === 5, 'expected every direct row to require source citation');
expect(counts.source_citation_or_url_present_rows === 0, 'expected no source citations supplied');
expect(counts.transform_rule_still_blocked_rows === 5, 'expected every direct row to keep transform blocked');
expect(counts.agent6_boundary_after_prereq_rows === 5, 'expected every direct row to keep later Agent 6 boundary');
expect(counts.source_family_selection_boundary_blocker_rows === 0, 'expected no source-family selection blockers in direct subset');
expect(counts.direct_source_citation_prereq_rows === 5, 'expected every direct row to be direct source-citation prereq');

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

const expectedSourceFamilyCounts = {
  'Jastrow Dictionary': 5,
};
for (const [family, expected] of Object.entries(expectedSourceFamilyCounts)) {
  expect(counts.source_family_counts?.[family] === expected, `source family count mismatch for ${family}`);
}
const expectedTriageCounts = {
  commercial_clean_only: 5,
};
for (const [triage, expected] of Object.entries(expectedTriageCounts)) {
  expect(counts.triage_group_counts?.[triage] === expected, `triage count mismatch for ${triage}`);
}

const rowIds = new Set();
const sourceRids = new Set();
let previousQueueCount = Number.POSITIVE_INFINITY;
let previousOccurrencesForQueue = Number.POSITIVE_INFINITY;
for (const row of rows) {
  expect(row.evidence_role === 'direct_source_citation_prereq_navigation_only_no_source_or_acceptance_claim', `${row.source_rid} evidence role mismatch`);
  expect(!rowIds.has(row.row_id), `duplicate row_id ${row.row_id}`);
  expect(!sourceRids.has(row.source_rid), `duplicate source_rid ${row.source_rid}`);
  rowIds.add(row.row_id);
  sourceRids.add(row.source_rid);
  expect(row.source_citation_required === true, `${row.source_rid} must require source citation`);
  expect(row.source_citation_or_url_present === false, `${row.source_rid} must not supply source citation`);
  expect(row.transform_rule_still_blocked === true, `${row.source_rid} must keep transform blocked`);
  expect(row.agent6_boundary_after_prereq === true, `${row.source_rid} must preserve later Agent 6 boundary`);
  expect(row.source_family_selection_boundary_blocker_count === 0, `${row.source_rid} must not have source-family selection blocker`);
  expect(row.direct_source_citation_prereq_now === true, `${row.source_rid} must be direct source-citation prereq`);
  expect(row.route_write_allowed === false, `${row.source_rid} route writes must be false`);
  expect(row.candidate_text_allowed === false, `${row.source_rid} candidate text must be false`);
  expect(row.public_mutation_allowed === false, `${row.source_rid} public mutation must be false`);
  expect(row.current_blocker_ids.includes('missing_source_field::source_citation_or_url'), `${row.source_rid} missing source-citation blocker`);
  expect(
    row.current_blocker_ids.includes('missing_transform_output_proposal_matrix_or_exact_transform_rule'),
    `${row.source_rid} missing transform-output blocker`,
  );
  if (row.queue_id_count !== previousQueueCount) {
    expect(row.queue_id_count <= previousQueueCount, `${row.source_rid} mechanical order must descend by queue count`);
    previousOccurrencesForQueue = Number.POSITIVE_INFINITY;
  }
  expect(row.occurrence_total <= previousOccurrencesForQueue, `${row.source_rid} mechanical order must descend by occurrences within queue count`);
  previousQueueCount = row.queue_id_count;
  previousOccurrencesForQueue = row.occurrence_total;
}
expect(sourceRids.size === counts.unique_source_rids, 'unique source RID coverage mismatch');

for (const row of prefixRows) {
  expect(row.evidence_role === 'direct_source_citation_prefix_summary_navigation_only_no_source_or_acceptance_claim', `${row.source_rid_prefix} prefix evidence role mismatch`);
  expect(row.direct_source_rid_count > 0, `${row.source_rid_prefix} prefix row must include direct rows`);
}
for (const row of sourceFamilyRows) {
  expect(row.evidence_role === 'direct_source_citation_source_family_summary_navigation_only_no_source_or_acceptance_claim', `${row.source_family} source family evidence role mismatch`);
  expect(row.direct_source_rid_count > 0, `${row.source_family} source family row must include direct rows`);
}

for (const inputPath of [
  artifact.inputs?.source_citation_enrichment_worklist,
  artifact.inputs?.agent6_source_family_boundary_prereq_matrix,
]) {
  expect(typeof inputPath === 'string' && fs.existsSync(path.resolve(root, inputPath)), `input missing: ${inputPath}`);
}
expect(artifact.downstream_handoff?.stop_condition?.includes('Agent 6 source-family boundary subset excluded'), 'stop condition must preserve Agent 6 exclusion');
expect(artifact.downstream_handoff?.stop_condition?.includes('no source text read'), 'stop condition must preserve source-text boundary');

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(
  `Agent 3 direct source-citation prereq matrix passed: rows=${counts.direct_rows} excluded=${counts.excluded_agent6_source_family_boundary_rows} occurrences=${counts.occurrence_total}`,
);

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log(
        'Usage: node scripts/validate_agent3_old_dictionary_candidate_use_direct_source_citation_prereq_matrix.mjs [--input=PATH]',
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
