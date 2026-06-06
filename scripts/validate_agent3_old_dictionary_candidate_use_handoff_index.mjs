#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input: 'reports/agent3-old-dictionary-candidate-use-handoff-index-2026-06-06.json',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(artifact.artifact_type === 'agent3_old_dictionary_candidate_use_handoff_index', 'artifact_type mismatch');
expect(artifact.status === 'evidence-ready', 'status must be evidence-ready');

const boundary = artifact.authority_boundary || {};
for (const key of [
  'linkage_navigation_only',
  'handoff_index_only',
  'candidate_use_planning_evidence_only',
  'artifact_discovery_only',
]) {
  expect(boundary[key] === true, `authority_boundary.${key} must be true`);
}
for (const key of [
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
  'source_license_acceptance',
  'qa_acceptance',
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
expect(counts.handoff_entries === 9, 'expected 9 handoff entries');
expect(counts.json_artifacts_exist === 9, 'expected 9 JSON artifacts');
expect(counts.report_artifacts_exist === 9, 'expected 9 report artifacts');
expect(counts.validator_scripts_exist === 9, 'expected 9 validator scripts');
expect(counts.artifact_type_mismatches === 0, 'expected 0 artifact type mismatches');
expect(counts.evidence_ready_entries === 9, 'expected 9 evidence-ready entries');
expect(counts.candidate_use_rows === 78, 'expected 78 candidate-use rows');
expect(counts.candidate_use_occurrences === 1461, 'expected 1461 candidate-use occurrences');
expect(counts.pure_workset_rows === 5, 'expected 5 pure workset rows');
expect(counts.pure_workset_occurrences === 58, 'expected 58 pure workset occurrences');
expect(counts.overlap_workset_rows === 73, 'expected 73 overlap workset rows');
expect(counts.overlap_workset_occurrences === 1403, 'expected 1403 overlap workset occurrences');
expect(counts.split_closure_rows === 78, 'expected 78 split-closure rows');
expect(counts.split_closure_occurrences === 1461, 'expected 1461 split-closure occurrences');
expect(counts.split_closure_missing_rows === 0, 'expected 0 missing split-closure rows');
expect(counts.split_closure_extra_rows === 0, 'expected 0 extra split-closure rows');
expect(counts.split_closure_duplicate_queue_ids === 0, 'expected 0 duplicate queue IDs');
expect(counts.split_closure_cross_partition_duplicate_queue_ids === 0, 'expected 0 cross-partition duplicate queue IDs');
expect(counts.source_rid_references === 393, 'expected 393 source RID references');
expect(counts.unique_source_rids === 344, 'expected 344 unique source RIDs');
expect(counts.cross_partition_shared_source_rids === 1, 'expected 1 cross-partition shared source RID');
expect(counts.blocker_rows_total === 22, 'expected 22 blocker rows total across indexed artifacts');
expect(counts.entries_with_nonzero_authority_counters === 0, 'expected 0 entries with nonzero authority counters');
expect(counts.all_zero_authority_counters === 1, 'all_zero_authority_counters must be 1');

for (const key of [
  'transform_ready_rows',
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
  'release_actions',
  'route_payload_field_hits',
  'forbidden_payload_field_hits',
  'acceptance_claims',
]) {
  expect(counts[key] === 0, `${key} must be zero`);
}

const expectedRoles = new Map([
  ['row_overlap_source_manifest_navigation', { rows: 500, occurrences: 8427, blockers: 6 }],
  ['candidate_use_continuity_crossmatch', { rows: 78, occurrences: 1461, blockers: 5 }],
  ['source_family_blocker_matrix', { rows: 78, occurrences: 1461, blockers: 3 }],
  ['source_rid_continuity_crossmatch', { rows: 78, occurrences: 1461, blockers: 0 }],
  ['exact_subset_crossmatch', { rows: 78, occurrences: 1461, blockers: 0 }],
  ['boundary_triage_navigation', { rows: 78, occurrences: 1461, blockers: 0 }],
  ['pure_commercial_boundary_workset', { rows: 5, occurrences: 58, blockers: 1 }],
  ['overlap_boundary_workset', { rows: 73, occurrences: 1403, blockers: 3 }],
  ['split_closure_crossmatch', { rows: 78, occurrences: 1461, blockers: 4 }],
]);

const seenRoles = new Set();
const seenDedupeKeys = new Set();
for (const entry of entries) {
  const expected = expectedRoles.get(entry.role);
  expect(Boolean(expected), `unexpected role ${entry.role}`);
  seenRoles.add(entry.role);
  expect(entry.json_artifact_exists === true, `${entry.role} JSON artifact must exist`);
  expect(entry.report_artifact_exists === true, `${entry.role} report artifact must exist`);
  expect(entry.validator_script_exists === true, `${entry.role} validator must exist`);
  expect(entry.artifact_type_status === 'matched', `${entry.role} artifact_type_status must be matched`);
  expect(entry.status === 'evidence-ready', `${entry.role} status must be evidence-ready`);
  expect(entry.zero_authority_counter_sum === 0, `${entry.role} authority counter sum must be zero`);
  expect(entry.evidence_role === 'artifact_discovery_and_navigation_only', `${entry.role} evidence role mismatch`);
  expect(
    entry.downstream_status === 'non_authoritative_handoff_index_entry_no_transform_or_answer_authority',
    `${entry.role} downstream status mismatch`,
  );
  if (expected) {
    expect(entry.rows_represented === expected.rows, `${entry.role} rows mismatch`);
    expect(entry.occurrences_represented === expected.occurrences, `${entry.role} occurrences mismatch`);
    expect(entry.blocker_rows === expected.blockers, `${entry.role} blocker rows mismatch`);
  }
  expect(Boolean(entry.dedupe_key), `${entry.role} dedupe key missing`);
  expect(!seenDedupeKeys.has(entry.dedupe_key), `${entry.role} duplicate dedupe key`);
  seenDedupeKeys.add(entry.dedupe_key);
}
for (const role of expectedRoles.keys()) {
  expect(seenRoles.has(role), `missing role ${role}`);
}

const closure = artifact.closure_summary || {};
expect(closure.row_equation === '5 + 73 = 78', 'closure row equation mismatch');
expect(closure.occurrence_equation === '58 + 1403 = 1461', 'closure occurrence equation mismatch');
expect(closure.missing_rows === 0, 'closure missing rows mismatch');
expect(closure.extra_rows === 0, 'closure extra rows mismatch');
expect(closure.duplicate_queue_ids === 0, 'closure duplicate queue IDs mismatch');
expect(closure.cross_partition_duplicate_queue_ids === 0, 'closure cross-partition duplicate queue IDs mismatch');
expect(closure.shared_source_rids_across_partitions === 1, 'closure shared source RID mismatch');

const forbiddenKeys = [];
walk(artifact, (key) => {
  if (
    [
      'surface',
      'normalized',
      'token_surface',
      'token_normalized',
      'focus_surface',
      'focus_normalized',
      'candidate_text',
      'definition_text',
      'source_text',
      'accepted_text',
      'display_text',
      'route_payload',
      'public_domain_headwords',
    ].includes(key)
  ) {
    forbiddenKeys.push(key);
  }
});
expect(forbiddenKeys.length === 0, `forbidden payload keys present: ${forbiddenKeys.join(', ')}`);

const stopCondition = artifact.downstream_handoff?.stop_condition || '';
expect(stopCondition.includes('locate and verify'), 'stop condition must identify index use');
expect(stopCondition.includes('does not authorize transform'), 'stop condition must block transform');
expect(stopCondition.includes('source/license acceptance'), 'stop condition must block source/license acceptance');
expect(stopCondition.includes('accepted text'), 'stop condition must block accepted text');

if (errors.length > 0) {
  for (const error of errors) console.error(`ERROR ${error}`);
  process.exit(1);
}

console.log(
  `Agent 3 handoff index passed: entries=${counts.handoff_entries} rows=${counts.candidate_use_rows} authority_issues=${counts.entries_with_nonzero_authority_counters}`,
);

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function walk(value, callback) {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    for (const item of value) walk(item, callback);
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    callback(key, child);
    walk(child, callback);
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(root, filePath), 'utf8'));
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    const [key, value] = arg.split('=');
    if (!key.startsWith('--') || value === undefined) continue;
    if (key === '--input') parsed.input = cleanRelativePath(value);
  }
  return parsed;
}

function cleanRelativePath(value) {
  return value.replace(/^["']|["']$/g, '').replaceAll('\\', '/');
}
