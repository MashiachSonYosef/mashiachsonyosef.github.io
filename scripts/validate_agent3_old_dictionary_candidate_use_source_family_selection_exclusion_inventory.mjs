#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input:
    'reports/agent3-old-dictionary-candidate-use-source-family-selection-exclusion-inventory-2026-06-06.json',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_old_dictionary_candidate_use_source_family_selection_exclusion_inventory',
  'artifact_type mismatch',
);
expect(artifact.status === 'evidence-ready', 'status must be evidence-ready');

const boundary = artifact.authority_boundary || {};
for (const key of [
  'linkage_navigation_only',
  'exclusion_inventory_only',
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
const rows = artifact.exclusion_rows || [];
const classificationRows = artifact.classification_rows || [];
const prefixRows = artifact.prefix_rows || [];

expect(rows.length === counts.excluded_rows, 'exclusion row length mismatch');
expect(classificationRows.length === counts.classification_rows, 'classification row length mismatch');
expect(prefixRows.length === counts.prefix_rows, 'prefix row length mismatch');
expect(counts.worklist_rows === 344, 'expected 344 worklist rows');
expect(counts.excluded_rows === 339, 'expected 339 source-family-selection excluded rows');
expect(counts.direct_non_excluded_rows === 5, 'expected 5 direct non-excluded rows');
expect(counts.agent6_prereq_covered_rows === 25, 'expected 25 Agent 6 prereq covered rows');
expect(counts.source_family_selection_not_in_agent6_prereq_rows === 314, 'expected 314 source-family-selection rows outside Agent 6 prereq packet');
expect(counts.source_rid_references === 388, 'expected 388 source RID references');
expect(counts.occurrence_total === 8126, 'expected 8126 occurrences');
expect(counts.unique_source_rids === 339, 'expected 339 unique source RIDs');
expect(counts.unique_source_rid_prefixes === 20, 'expected 20 unique prefixes');
expect(counts.unique_queue_ids === 74, 'expected 74 unique queue IDs');
expect(counts.unique_token_ids === 74, 'expected 74 unique token IDs');
expect(counts.unique_lexicon_entry_ids === 73, 'expected 73 unique lexicon entry IDs');
expect(counts.classification_rows === 2, 'expected 2 classification rows');
expect(counts.source_citation_required_rows === 339, 'expected every excluded row to require source citation');
expect(counts.source_citation_or_url_present_rows === 0, 'expected no source citations supplied');
expect(counts.transform_rule_still_blocked_rows === 339, 'expected every excluded row to keep transform blocked');
expect(counts.agent6_boundary_after_prereq_rows === 339, 'expected every excluded row to preserve later Agent 6 boundary');
expect(counts.source_family_selection_boundary_blocker_rows === 339, 'expected every excluded row to carry a source-family-selection blocker');

for (const [family, expected] of Object.entries({
  'BDB Aramaic Dictionary': 128,
  'BDB Dictionary': 313,
  'Jastrow Dictionary': 334,
})) {
  expect(counts.source_family_counts?.[family] === expected, `source family count mismatch for ${family}`);
}
for (const [triage, expected] of Object.entries({
  commercial_clean_blocked_overlap: 47,
  commercial_clean_nc_blocked_overlap: 283,
  commercial_clean_nc_overlap: 25,
  commercial_clean_only: 1,
})) {
  expect(counts.triage_group_counts?.[triage] === expected, `triage group count mismatch for ${triage}`);
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
for (const row of rows) {
  expect(row.evidence_role === 'source_family_selection_exclusion_inventory_navigation_only_no_selection_or_acceptance_claim', `${row.source_rid} evidence role mismatch`);
  expect(!rowIds.has(row.row_id), `duplicate row_id ${row.row_id}`);
  expect(!sourceRids.has(row.source_rid), `duplicate source_rid ${row.source_rid}`);
  rowIds.add(row.row_id);
  sourceRids.add(row.source_rid);
  expect(row.source_family_selection_boundary_blockers.length > 0, `${row.source_rid} must carry source-family-selection blocker`);
  expect(row.source_citation_required === true, `${row.source_rid} must require source citation`);
  expect(row.source_citation_or_url_present === false, `${row.source_rid} must not supply source citation`);
  expect(row.transform_rule_still_blocked === true, `${row.source_rid} must keep transform blocked`);
  expect(row.agent6_boundary_after_prereq === true, `${row.source_rid} must preserve later Agent 6 boundary`);
  expect(row.route_write_allowed === false, `${row.source_rid} route writes must be false`);
  expect(row.candidate_text_allowed === false, `${row.source_rid} candidate text must be false`);
  expect(row.public_mutation_allowed === false, `${row.source_rid} public mutation must be false`);
  if (row.covered_by_agent6_prereq_packet) {
    expect(row.classification === 'covered_by_agent6_source_family_boundary_prereq_packet', `${row.source_rid} covered classification mismatch`);
  } else {
    expect(row.classification === 'source_family_selection_boundary_not_in_agent6_prereq_packet', `${row.source_rid} unpacketized classification mismatch`);
  }
}
expect(sourceRids.size === counts.unique_source_rids, 'unique source RID coverage mismatch');

const byClassification = Object.fromEntries(classificationRows.map((row) => [row.classification, row.row_count]));
expect(byClassification.covered_by_agent6_source_family_boundary_prereq_packet === 25, 'covered classification count mismatch');
expect(byClassification.source_family_selection_boundary_not_in_agent6_prereq_packet === 314, 'unpacketized classification count mismatch');

for (const row of classificationRows) {
  expect(row.evidence_role === 'source_family_selection_exclusion_classification_navigation_only_no_selection_or_acceptance_claim', `${row.classification} classification evidence role mismatch`);
}
for (const row of prefixRows) {
  expect(row.evidence_role === 'source_family_selection_exclusion_prefix_navigation_only_no_selection_or_acceptance_claim', `${row.source_rid_prefix} prefix evidence role mismatch`);
  expect(row.row_count === row.agent6_prereq_covered_rows + row.not_in_agent6_prereq_rows, `${row.source_rid_prefix} prefix partition mismatch`);
}

for (const inputPath of [
  artifact.inputs?.source_citation_enrichment_worklist,
  artifact.inputs?.agent6_source_family_boundary_prereq_matrix,
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
  `Agent 3 source-family-selection exclusion inventory passed: rows=${counts.excluded_rows} covered=${counts.agent6_prereq_covered_rows} unpacketized=${counts.source_family_selection_not_in_agent6_prereq_rows}`,
);

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log(
        'Usage: node scripts/validate_agent3_old_dictionary_candidate_use_source_family_selection_exclusion_inventory.mjs [--input=PATH]',
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
