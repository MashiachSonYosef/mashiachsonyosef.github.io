#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const receiptPath = cleanRelativePath(process.argv[2] || 'reports/agent2-old-dictionary-queue-state-validation-receipt-2026-06-05.json');
const receipt = readJson(receiptPath);
const issues = [];

expect(receipt.schema_version === '1.0', 'schema_version must be 1.0');
expect(receipt.artifact_type === 'agent2_old_dictionary_queue_state_validation_receipt', 'artifact_type mismatch');
expect(receipt.status === 'queue_points_to_current_validated_readiness_and_exact_blockers', 'status mismatch');

for (const [key, relativePath] of Object.entries(receipt.validated_artifacts || {})) {
  expect(fs.existsSync(path.join(root, cleanRelativePath(relativePath))), `validated artifact missing: ${key}`);
}

for (const [key, value] of Object.entries(receipt.queue_assertions || {})) {
  expect(value === true, `queue_assertions.${key} must be true`);
}

expect(Array.isArray(receipt.validator_commands) && receipt.validator_commands.length === 4, 'validator command count must be 4');
for (const command of receipt.validator_commands || []) {
  expect(typeof command === 'string' && command.startsWith('node scripts/'), `invalid validator command: ${command}`);
}

const counts = receipt.counts || {};
expect(counts.source_family_rows === 5, 'source_family_rows must be 5');
expect(counts.commercial_clean_candidate_source_families === 3, 'commercial clean families must be 3');
expect(counts.noncommercial_educational_candidate_source_families === 1, 'NC families must be 1');
expect(counts.metadata_or_link_only_source_families === 0, 'metadata/link-only families must be 0');
expect(counts.blocked_or_needs_review_source_families === 1, 'blocked families must be 1');
expect(counts.allowed_transform_rows_now === 0, 'allowed transform rows now must be 0');
expect(counts.candidate_text_rows_now === 0, 'candidate text rows now must be 0');
expect(counts.definition_candidate_rows_now === 0, 'definition candidate rows now must be 0');
expect(counts.lemma_candidate_rows_now === 0, 'lemma candidate rows now must be 0');
expect(counts.reader_hint_candidate_rows_now === 0, 'reader hint rows now must be 0');
expect(counts.answer_eligible_rows_now === 0, 'answer eligible rows now must be 0');
expect(counts.public_emit_rows_now === 0, 'public emit rows now must be 0');

expect((receipt.current_exact_blockers || []).length === 5, 'exact blocker count must be 5');
expect(receipt.current_exact_blockers.includes('old-dictionary-excluded-row-license-lane-reaudit::klein-dictionary::missing_exact_agent6_nc_boundary_no_commercial_export_authorization'), 'Klein exact blocker missing');
expect(receipt.current_exact_blockers.includes('old-dictionary-excluded-row-license-lane-reaudit::bdb-augmented-strong::missing_independent_source_license_custody_basis'), 'BDB Augmented Strong exact blocker missing');

const lane = receipt.lane_preservation || {};
expect(lane.current_agent1_thread_id === '019e975d-dc9f-7020-a7c8-885d083a837e', 'current Agent 1 thread mismatch');
expect(lane.commercial_clean_and_nc_separated === true, 'commercial/NC separation must be true');
expect(lane.nc_row_subset_id === 'old-dictionary-excluded-row-license-lane-reaudit::klein-dictionary', 'NC row subset mismatch');
expect(lane.nc_derived_from_nc === true, 'NC derived_from_nc must be true');
expect(lane.nc_commercial_export_allowed === false, 'NC commercial_export_allowed must be false');
expect(lane.nc_attribution_required === true, 'NC attribution_required must be true');
expect(lane.blocked_row_subset_id === 'old-dictionary-excluded-row-license-lane-reaudit::bdb-augmented-strong', 'blocked row subset mismatch');
expect(lane.unclassified_rows_consumed_as_candidate_text === 0, 'unclassified candidate text consumption must be 0');

for (const [key, value] of Object.entries(receipt.zero_output_counts || {})) {
  expect(value === 0, `zero_output_counts.${key} must be 0`);
}

const boundary = JSON.stringify(receipt.non_acceptance_boundary || []);
for (const phrase of [
  'No Definition authority',
  'No answer acceptance',
  'No source/license/legal acceptance',
  'No accepted gloss/text',
  'No public/runtime mutation',
  'No NC commercial authorization',
  'No release action',
]) {
  expect(boundary.includes(phrase), `boundary missing ${phrase}`);
}

if (issues.length) {
  console.error(`Agent 2 old-dictionary queue-state validation receipt failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 old-dictionary queue-state validation receipt passed. Queue pointers current; transform rows: 0; NC lane preserved.');

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}
