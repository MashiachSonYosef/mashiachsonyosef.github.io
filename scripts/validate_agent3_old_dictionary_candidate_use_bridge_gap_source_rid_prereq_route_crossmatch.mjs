#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input:
    'reports/agent3-old-dictionary-candidate-use-bridge-gap-source-rid-prereq-route-crossmatch-2026-06-06.json',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_old_dictionary_candidate_use_bridge_gap_source_rid_prereq_route_crossmatch',
  'artifact_type mismatch',
);
expect(artifact.status === 'evidence-ready', 'status must be evidence-ready');

const boundary = artifact.authority_boundary || {};
for (const key of [
  'linkage_navigation_only',
  'bridge_gap_source_rid_prereq_route_crossmatch_only',
  'prereq_route_is_not_acceptance_or_transform_readiness',
  'approval_route_owner_a07',
  'a06_evidence_validator_production_only',
  'no_new_acceptance_or_release_claim',
]) {
  expect(boundary[key] === true, `authority_boundary.${key} must be true`);
}
expect(boundary.a06_approval_requested === false, 'authority_boundary.a06_approval_requested must be false');
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
const rows = artifact.source_rid_rows || [];
expect(rows.length === counts.prereq_route_rows, 'source-RID row length mismatch');
expect((artifact.prereq_route_rows || []).length === counts.prereq_route_summary_rows, 'prereq route summary length mismatch');
expect((artifact.prefix_rows || []).length === counts.prefix_rows, 'prefix row length mismatch');
expect((artifact.exact_blocker_rows || []).length === counts.exact_blocker_rows, 'exact blocker row length mismatch');

expect(counts.input_source_rid_crossmatch_rows === 30, 'expected 30 input source-RID crossmatch rows');
expect(counts.input_gap_source_rid_references === 30, 'expected 30 input source-RID references');
expect(counts.input_agent6_boundary_prereq_rows === 25, 'expected 25 A06 evidence boundary prereq input rows');
expect(counts.input_direct_source_citation_prereq_rows === 5, 'expected five direct source-citation prereq input rows');
expect(counts.prereq_route_rows === 30, 'expected 30 prereq route rows');
expect(counts.source_rid_reference_rows === 30, 'expected 30 source-RID references');
expect(counts.source_rid_reference_occurrence_membership_total === 389, 'expected 389 source-RID occurrence memberships');
expect(counts.agent6_boundary_prereq_rows === 25, 'expected 25 A06 evidence boundary prereq rows');
expect(counts.agent6_boundary_prereq_occurrences === 331, 'expected 331 A06 evidence boundary prereq occurrences');
expect(counts.direct_source_citation_prereq_rows === 5, 'expected five direct source-citation prereq rows');
expect(counts.direct_source_citation_prereq_occurrences === 58, 'expected 58 direct source-citation prereq occurrences');
expect(counts.rows_in_both_prereq_paths === 0, 'expected zero rows in both prereq paths');
expect(counts.rows_missing_prereq_path === 0, 'expected zero rows missing prereq path');
expect(counts.source_rid_blocker_rows_present === 30, 'expected 30 source-RID blocker rows present');
expect(counts.queue_source_coverage_rows_present === 0, 'expected zero queue/source coverage rows present');
expect(counts.prereq_route_summary_rows === 2, 'expected two prereq route summary rows');
expect(counts.prefix_rows === 12, 'expected 12 prefix rows');
expect(counts.exact_blocker_rows === 2, 'expected two exact blocker rows');
expect(counts.unique_gap_queue_ids === 14, 'expected 14 unique gap queue IDs');
expect(counts.unique_gap_token_ids === 14, 'expected 14 unique gap token IDs');
expect(counts.reference_total === 30, 'expected 30 prereq references');
expect(counts.occurrence_total === 389, 'expected 389 prereq occurrences');
expect(counts.prereq_current_blocker_total === 300, 'expected 300 prereq blocker IDs');
expect(counts.blocker_current_blocker_total === 300, 'expected 300 source-RID blocker IDs');
expect(counts.rows_missing_source_citation === 30, 'expected all rows missing source citation');
expect(counts.rows_missing_transform_rule === 30, 'expected all rows missing transform rule');
expect(counts.rows_agent6_boundary_after_prereq === 30, 'expected all rows after boundary prereq');
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

const ids = new Set();
const rids = new Set();
for (const row of rows) {
  expect(!ids.has(row.route_row_id), `duplicate route row ID ${row.route_row_id}`);
  ids.add(row.route_row_id);
  expect(!rids.has(row.source_rid), `duplicate source RID ${row.source_rid}`);
  rids.add(row.source_rid);
  expect(row.gap_reference_count === 1, `${row.source_rid} expected one gap reference`);
  expect(row.source_rid_blocker_row_present === true, `${row.source_rid} source-RID blocker row missing`);
  expect(row.queue_source_coverage_row_present === false, `${row.source_rid} queue/source coverage must be absent`);
  expect(row.source_citation_required === true, `${row.source_rid} source citation required mismatch`);
  expect(row.source_citation_or_url_present === false, `${row.source_rid} source citation present mismatch`);
  expect(row.transform_rule_still_blocked === true, `${row.source_rid} transform blocker mismatch`);
  expect(row.agent6_boundary_after_prereq === true, `${row.source_rid} boundary-after-prereq mismatch`);
  expect(row.route_write_allowed === false, `${row.source_rid} route write allowed mismatch`);
  expect(row.candidate_text_allowed === false, `${row.source_rid} candidate text allowed mismatch`);
  expect(row.public_mutation_allowed === false, `${row.source_rid} public mutation allowed mismatch`);
  expect(
    row.evidence_role === 'bridge_gap_source_rid_prereq_route_crossmatch_navigation_only_no_acceptance_claim',
    `${row.source_rid} evidence role mismatch`,
  );
  expect(row.next_safe_action?.includes('A07'), `${row.source_rid} next action must route approval questions to A07`);
  expect(row.next_safe_action?.includes('blocked'), `${row.source_rid} next action must preserve blocked state`);
  if (row.prereq_route === 'agent6_source_family_boundary_prereq') {
    expect(row.agent6_boundary_prereq_row_present === true, `${row.source_rid} A06 evidence row missing`);
    expect(row.direct_source_citation_prereq_row_present === false, `${row.source_rid} direct row should be absent`);
    expect(
      row.exact_blocker === 'bridge_gap_source_rid_routes_to_agent6_source_family_boundary_prereq',
      `${row.source_rid} A06 exact blocker mismatch`,
    );
  } else if (row.prereq_route === 'direct_source_citation_prereq') {
    expect(row.agent6_boundary_prereq_row_present === false, `${row.source_rid} A06 evidence row should be absent`);
    expect(row.direct_source_citation_prereq_row_present === true, `${row.source_rid} direct row missing`);
    expect(
      row.exact_blocker === 'bridge_gap_source_rid_routes_to_direct_source_citation_prereq',
      `${row.source_rid} direct exact blocker mismatch`,
    );
  } else {
    expect(false, `${row.source_rid} unexpected prereq route ${row.prereq_route}`);
  }
}

expect(rows.filter((row) => row.prereq_route === 'agent6_source_family_boundary_prereq').length === 25, 'expected 25 A06 evidence prereq rows');
expect(rows.filter((row) => row.prereq_route === 'direct_source_citation_prereq').length === 5, 'expected five direct prereq rows');
expect(rows.some((row) => row.source_rid === 'E00687' && row.prereq_route === 'direct_source_citation_prereq'), 'expected E00687 direct prereq route');

for (const inputPath of [
  artifact.inputs?.source_rid_crossmatch,
  artifact.inputs?.agent6_prereq_matrix,
  artifact.inputs?.direct_source_citation_prereq_matrix,
]) {
  expect(inputPath && fs.existsSync(path.resolve(root, inputPath)), `input path missing: ${inputPath}`);
}

expect(artifact.downstream_handoff?.handoff_owner?.includes('A07'), 'handoff owner must include A07 approval route');
expect(artifact.downstream_handoff?.handoff_owner?.includes('A06 evidence/validator production only'), 'handoff owner must preserve A06 evidence-only role');
expect(artifact.downstream_handoff?.next_safe_action?.includes('A07'), 'next safe action must route approval questions to A07');
expect(artifact.downstream_handoff?.stop_condition?.includes('no source text read'), 'stop condition must preserve source-text boundary');
expect(artifact.downstream_handoff?.stop_condition?.includes('no source-family selection made'), 'stop condition must preserve source-family-selection boundary');
expect(artifact.downstream_handoff?.stop_condition?.includes('no acceptance action taken'), 'stop condition must preserve acceptance boundary');

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(
  `Agent 3 bridge-gap source-RID prereq route crossmatch passed: rows=${counts.prereq_route_rows} a06=${counts.agent6_boundary_prereq_rows} direct=${counts.direct_source_citation_prereq_rows}`,
);

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log(
        'Usage: node scripts/validate_agent3_old_dictionary_candidate_use_bridge_gap_source_rid_prereq_route_crossmatch.mjs [--input=PATH]',
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
