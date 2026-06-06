#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input:
    'reports/agent3-old-dictionary-candidate-use-unpacketized-source-family-selection-workset-2026-06-06.json',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_old_dictionary_candidate_use_unpacketized_source_family_selection_workset',
  'artifact_type mismatch',
);
expect(artifact.status === 'evidence-ready', 'status must be evidence-ready');

const boundary = artifact.authority_boundary || {};
for (const key of [
  'linkage_navigation_only',
  'unpacketized_workset_only',
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
expect(rows.length === counts.workset_rows, 'workset row length mismatch');
expect((artifact.source_family_signature_rows || []).length === counts.source_family_signature_rows, 'source-family signature row length mismatch');
expect((artifact.triage_signature_rows || []).length === counts.triage_signature_rows, 'triage signature row length mismatch');
expect((artifact.impact_bucket_rows || []).length === counts.impact_bucket_rows, 'impact bucket row length mismatch');
expect((artifact.prefix_rows || []).length === counts.prefix_rows, 'prefix row length mismatch');
expect((artifact.partition_signature_rows || []).length === counts.partition_signature_rows, 'partition signature row length mismatch');

expect(counts.input_exclusion_rows === 339, 'expected 339 input exclusion rows');
expect(counts.input_agent6_prereq_covered_rows === 25, 'expected 25 Agent 6 covered input rows');
expect(counts.workset_rows === 314, 'expected 314 unpacketized rows');
expect(counts.source_rid_references === 363, 'expected 363 source RID references');
expect(counts.occurrence_total === 7795, 'expected 7795 occurrences');
expect(counts.unique_source_rids === 314, 'expected 314 unique source RIDs');
expect(counts.unique_source_rid_prefixes === 19, 'expected 19 prefixes');
expect(counts.unique_queue_ids === 65, 'expected 65 queue IDs');
expect(counts.unique_token_ids === 65, 'expected 65 token IDs');
expect(counts.unique_lexicon_entry_ids === 65, 'expected 65 lexicon entry IDs');
expect(counts.source_family_signature_rows === 4, 'expected 4 source-family signature rows');
expect(counts.triage_signature_rows === 4, 'expected 4 triage signature rows');
expect(counts.impact_bucket_rows === 3, 'expected 3 impact bucket rows');
expect(counts.prefix_rows === 19, 'expected 19 prefix rows');
expect(counts.partition_signature_rows === 2, 'expected 2 partition signature rows');
expect(counts.source_citation_required_rows === 314, 'expected every workset row to require source citation');
expect(counts.source_citation_or_url_present_rows === 0, 'expected no source citations supplied');
expect(counts.transform_rule_still_blocked_rows === 314, 'expected every workset row to keep transform blocked');
expect(counts.agent6_boundary_after_prereq_rows === 314, 'expected every workset row to preserve later Agent 6 boundary');
expect(counts.source_family_boundary_packet_exists_rows === 0, 'expected no source-family boundary packet to exist');
expect(counts.source_family_selection_boundary_blocker_rows === 314, 'expected every workset row to carry source-family-selection blocker');

for (const [family, expected] of Object.entries({
  'BDB Aramaic Dictionary': 128,
  'BDB Dictionary': 313,
  'Jastrow Dictionary': 309,
})) {
  expect(counts.source_family_membership_counts?.[family] === expected, `source-family membership mismatch for ${family}`);
}
for (const [signature, expected] of Object.entries({
  'BDB Aramaic Dictionary + BDB Dictionary + Jastrow Dictionary': 128,
  'BDB Dictionary': 5,
  'BDB Dictionary + Jastrow Dictionary': 180,
  'Jastrow Dictionary': 1,
})) {
  expect(counts.source_family_signature_counts?.[signature] === expected, `source-family signature mismatch for ${signature}`);
}
for (const [triage, expected] of Object.entries({
  commercial_clean_blocked_overlap: 47,
  commercial_clean_nc_blocked_overlap: 283,
  commercial_clean_only: 1,
})) {
  expect(counts.triage_group_membership_counts?.[triage] === expected, `triage membership mismatch for ${triage}`);
}
for (const [bucket, expected] of Object.entries({
  shared_source_rid_multi_queue: 43,
  single_queue_high_occurrence: 64,
  single_queue_standard: 207,
})) {
  expect(counts.impact_bucket_counts?.[bucket] === expected, `impact bucket count mismatch for ${bucket}`);
}
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

const rowIds = new Set();
const sourceRids = new Set();
let previousOccurrence = Number.POSITIVE_INFINITY;
for (const row of rows) {
  expect(row.evidence_role === 'unpacketized_source_family_selection_workset_navigation_only_no_selection_or_acceptance_claim', `${row.source_rid} evidence role mismatch`);
  expect(!rowIds.has(row.row_id), `duplicate row_id ${row.row_id}`);
  expect(!sourceRids.has(row.source_rid), `duplicate source_rid ${row.source_rid}`);
  rowIds.add(row.row_id);
  sourceRids.add(row.source_rid);
  expect(row.exact_blocker === 'source_family_selection_boundary_not_yet_packetized_for_agent6_prereq', `${row.source_rid} exact blocker mismatch`);
  expect(row.source_family_boundary_packet_exists === false, `${row.source_rid} boundary packet must not exist`);
  expect(row.source_family_selection_boundary_blockers.length > 0, `${row.source_rid} must carry source-family-selection blocker`);
  expect(row.source_citation_required === true, `${row.source_rid} must require source citation`);
  expect(row.source_citation_or_url_present === false, `${row.source_rid} must not supply source citation`);
  expect(row.transform_rule_still_blocked === true, `${row.source_rid} must keep transform blocked`);
  expect(row.agent6_boundary_after_prereq === true, `${row.source_rid} must preserve later Agent 6 boundary`);
  expect(row.route_write_allowed === false, `${row.source_rid} route writes must be false`);
  expect(row.candidate_text_allowed === false, `${row.source_rid} candidate text must be false`);
  expect(row.public_mutation_allowed === false, `${row.source_rid} public mutation must be false`);
  expect(row.occurrence_total <= previousOccurrence, `${row.source_rid} mechanical order must descend by occurrence count`);
  previousOccurrence = row.occurrence_total;
}
expect(sourceRids.size === counts.unique_source_rids, 'unique source RID coverage mismatch');

for (const collection of [
  artifact.source_family_signature_rows || [],
  artifact.triage_signature_rows || [],
  artifact.impact_bucket_rows || [],
  artifact.prefix_rows || [],
  artifact.partition_signature_rows || [],
]) {
  for (const row of collection) {
    expect(row.evidence_role?.includes('navigation_only_no_selection_or_acceptance_claim'), 'group row evidence role mismatch');
    expect(row.row_count > 0, 'group row must include workset rows');
  }
}

for (const inputPath of [artifact.inputs?.source_family_selection_exclusion_inventory]) {
  expect(typeof inputPath === 'string' && fs.existsSync(path.resolve(root, inputPath)), `input missing: ${inputPath}`);
}
expect(artifact.downstream_handoff?.stop_condition?.includes('no source text read'), 'stop condition must preserve source-text boundary');
expect(artifact.downstream_handoff?.stop_condition?.includes('no source-family selection made'), 'stop condition must preserve source-family-selection boundary');

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(
  `Agent 3 unpacketized source-family-selection workset passed: rows=${counts.workset_rows} signatures=${counts.source_family_signature_rows} occurrences=${counts.occurrence_total}`,
);

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log(
        'Usage: node scripts/validate_agent3_old_dictionary_candidate_use_unpacketized_source_family_selection_workset.mjs [--input=PATH]',
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
