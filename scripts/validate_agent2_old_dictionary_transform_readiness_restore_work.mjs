#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(
  process.argv[2] || 'reports/agent2-old-dictionary-transform-readiness-restore-work-2026-06-05.json',
);
const artifact = readJson(artifactPath);
const issues = [];

expect(artifact.schema_version === '1.0', 'schema_version must be 1.0');
expect(artifact.artifact_type === 'agent2_old_dictionary_transform_readiness_restore_work', 'artifact_type mismatch');
expect(
  artifact.target === 'Agent 2 definition/lemma/reader-hint readiness from Agent 1 classified lanes',
  'target mismatch',
);

for (const filePath of artifact.files_used || []) {
  expect(fs.existsSync(path.join(root, cleanRelativePath(filePath))), `files_used path missing: ${filePath}`);
}
expect((artifact.files_used || []).length >= 5, 'files_used must include at least 5 inputs');
expect(
  fs.existsSync(path.join(root, cleanRelativePath(artifact.output_artifact_path))),
  'output_artifact_path must exist',
);

const lanes = artifact.lane_counts_rows_consumed || {};
expect(lanes.source_family_rows === 500, 'source_family_rows must be 500');
expect(lanes.audited_occurrences === 8427, 'audited_occurrences must be 8427');
expect(lanes.commercial_clean_candidate?.source_family_count === 3, 'commercial clean family count must be 3');
expect(lanes.commercial_clean_candidate?.rows === 500, 'commercial clean rows must be 500');
expect(lanes.commercial_clean_candidate?.occurrences === 10940, 'commercial clean occurrences must be 10940');
expect(lanes.commercial_clean_candidate?.agent2_transform_allowed_now === 0, 'commercial clean transform now must be 0');
expect(lanes.noncommercial_educational_candidate?.source_family_count === 1, 'NC family count must be 1');
expect(lanes.noncommercial_educational_candidate?.rows === 214, 'NC rows must be 214');
expect(lanes.noncommercial_educational_candidate?.occurrences === 4444, 'NC occurrences must be 4444');
expect(lanes.noncommercial_educational_candidate?.agent2_transform_allowed_now === 0, 'NC transform now must be 0');
expect(lanes.metadata_or_link_only?.source_family_count === 0, 'metadata/link family count must be 0');
expect(lanes.metadata_or_link_only?.rows === 0, 'metadata/link rows must be 0');
expect(lanes.blocked_or_needs_review?.source_family_count === 1, 'blocked/review family count must be 1');
expect(lanes.blocked_or_needs_review?.rows === 222, 'blocked/review rows must be 222');
expect(lanes.blocked_or_needs_review?.occurrences === 4435, 'blocked/review occurrences must be 4435');
expect(lanes.blocked_or_needs_review?.agent2_transform_allowed_now === 0, 'blocked/review transform now must be 0');
expect(lanes.candidate_text_rows_consumed_now === 0, 'candidate text rows consumed must be 0');
expect(lanes.definition_lemma_reader_hint_rows_consumed_now === 0, 'definition/lemma/reader-hint consumed rows must be 0');

for (const blocker of [
  'old-dictionary-excluded-row-license-lane-reaudit::bdb-dictionary::missing_exact_agent6_boundary_and_approved_morphology_relation',
  'old-dictionary-excluded-row-license-lane-reaudit::bdb-aramaic-dictionary::missing_exact_agent6_boundary_and_approved_morphology_relation',
  'old-dictionary-excluded-row-license-lane-reaudit::jastrow-dictionary::missing_exact_agent6_boundary_and_approved_morphology_relation',
  'old-dictionary-excluded-row-license-lane-reaudit::klein-dictionary::missing_exact_agent6_nc_boundary_no_commercial_export_authorization',
  'old-dictionary-excluded-row-license-lane-reaudit::bdb-augmented-strong::missing_independent_source_license_custody_basis',
]) {
  expect((artifact.exact_blockers || []).includes(blocker), `missing exact blocker: ${blocker}`);
}

expect(artifact.handoff_owner?.commercial_clean?.includes('Agent 6'), 'commercial clean handoff owner must include Agent 6');
expect(artifact.handoff_owner?.noncommercial_educational?.includes('Agent 6'), 'NC handoff owner must include Agent 6');
expect(artifact.handoff_owner?.blocked_or_needs_review?.includes('Agent 1'), 'blocked/review handoff owner must include Agent 1');

const stop = artifact.stop_condition || '';
for (const phrase of [
  'No Agent 2 definition/lemma/reader-hint content',
  'no candidate text',
  'no answer/public/runtime/route/export/release step',
  'exact Agent 6 boundary verdict',
  'approved morphology relation',
]) {
  expect(stop.includes(phrase), `stop_condition missing phrase: ${phrase}`);
}

expect(Array.isArray(artifact.command_timeout_records), 'command_timeout_records must be an array');
for (const record of artifact.command_timeout_records || []) {
  expect(typeof record.command === 'string' && record.command.length > 0, 'timeout record command required');
  expect(Number.isInteger(record.timeout_ms) && record.timeout_ms > 0, 'timeout record timeout_ms required');
  expect(typeof record.timed_out === 'boolean', 'timeout record timed_out must be boolean');
  expect(record.partial_output_or_artifact, 'timeout record partial_output_or_artifact required');
  expect(record.next_safe_action, 'timeout record next_safe_action required');
}

expect(
  artifact.next_safe_action === 'Wait for exact Agent 6 row/subset boundary verdict artifacts and approved morphology relation before writing any transform rows.',
  'next_safe_action mismatch',
);

if (issues.length) {
  console.error(`Agent 2 transform readiness restore-work validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 transform readiness restore-work validation passed. Rows consumed for output: 0; blockers preserved: 6.');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}
