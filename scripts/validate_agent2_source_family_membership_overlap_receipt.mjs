#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const receiptPath = process.argv[2] || 'reports/agent2-source-family-membership-overlap-receipt-2026-06-05.json';
const receipt = readJson(receiptPath);
const issues = [];

expect(receipt.artifact_type === 'agent2_source_family_membership_overlap_receipt', 'artifact_type mismatch');
expect(receipt.status === 'agent1_source_family_membership_and_overlap_consumed_as_nonpublic_planning_evidence_only', 'status mismatch');
expect(receipt.count_semantics?.source_family_membership_counts_are_nonexclusive === true, 'nonexclusive count semantics missing');
expect(receipt.count_semantics?.exclusive_export_row_counts_authorized_now === false, 'exclusive export row counts must not be authorized');

expect(receipt.membership_counts?.source_family_count === 5, 'source family count must be 5');
expect(receipt.membership_counts?.source_family_membership_rows_nonexclusive === 936, 'nonexclusive membership rows must be 936');
expect(receipt.membership_counts?.source_family_membership_occurrences_nonexclusive === 19819, 'nonexclusive membership occurrences must be 19819');
expect(receipt.membership_counts?.unique_preview_rows === 500, 'unique preview rows must be 500');
expect(receipt.membership_counts?.unique_preview_occurrences === 8427, 'unique preview occurrences must be 8427');
expect(receipt.membership_counts?.allowed_transform_rows_now === 0, 'membership transform rows must be 0');
expect(receipt.membership_counts?.candidate_text_rows_now === 0, 'membership candidate text rows must be 0');

expect(receipt.lane_counts?.commercial_clean_candidate_source_families === 3, 'commercial-clean source family count must be 3');
expect(receipt.lane_counts?.noncommercial_educational_candidate_source_families === 1, 'NC source family count must be 1');
expect(receipt.lane_counts?.metadata_or_link_only_source_families === 0, 'metadata/link-only source family count must be 0');
expect(receipt.lane_counts?.blocked_or_needs_review_source_families === 1, 'blocked/review source family count must be 1');

expect(Array.isArray(receipt.source_family_summary) && receipt.source_family_summary.length === 5, 'source family summary must have 5 entries');
for (const entry of receipt.source_family_summary || []) {
  expect(typeof entry.source_family === 'string' && entry.source_family.length > 0, 'source family missing');
  expect(['commercial_clean_candidate', 'noncommercial_educational_candidate', 'blocked_or_needs_review'].includes(entry.license_lane), `${entry.source_family} lane invalid`);
  expect(Number.isInteger(entry.row_count) && entry.row_count >= 0, `${entry.source_family} row count invalid`);
  expect(Number.isInteger(entry.occurrence_count) && entry.occurrence_count >= 0, `${entry.source_family} occurrence count invalid`);
  expect(typeof entry.exact_blocker === 'string' && entry.exact_blocker.length > 0, `${entry.source_family} exact blocker missing`);
}

expect(receipt.overlap_counts?.source_family_count === 5, 'overlap source family count must be 5');
expect(receipt.overlap_counts?.pairwise_intersection_count === 10, 'pairwise intersection count must be 10');
expect(receipt.overlap_counts?.exact_family_combination_count === 13, 'exact family combination count must be 13');
expect(receipt.overlap_counts?.total_exact_combination_rows === 500, 'exact combination rows must be 500');
expect(receipt.overlap_counts?.total_exact_combination_occurrences === 8427, 'exact combination occurrences must be 8427');
expect(receipt.overlap_counts?.commercial_with_nc_pair_rows === 362, 'commercial with NC pair rows must be 362');
expect(receipt.overlap_counts?.commercial_with_blocked_pair_rows === 425, 'commercial with blocked pair rows must be 425');
expect(receipt.overlap_counts?.allowed_transform_rows_now === 0, 'overlap transform rows must be 0');
expect(receipt.overlap_counts?.candidate_text_rows_now === 0, 'overlap candidate text rows must be 0');

for (const [key, value] of Object.entries(receipt.zero_output_counts || {})) {
  expect(value === 0, `zero_output_counts.${key} must be 0`);
}

for (const blocker of [
  'source_family_membership_counts_are_nonexclusive_no_exclusive_export_row_counts_authorized',
  'source_family_overlap_matrix_requires_exact_agent6_source_family_selection_boundary_before_agent2_transform_candidate_text_definition_lemma_reader_hint_answer_public_runtime_route_export_or_release_use',
  'commercial_with_nc_overlap_rows_preserve_nc_separation_no_commercial_clean_contamination',
  'commercial_with_blocked_overlap_rows_preserve_blocked_review_separation_no_transform_use',
]) {
  expect(receipt.exact_blockers?.includes(blocker), `missing blocker: ${blocker}`);
}

for (const boundary of [
  'No Definition authority',
  'No answer acceptance',
  'No answer eligibility',
  'No source/license/legal acceptance',
  'No accepted gloss/text',
  'No public/runtime mutation',
  'No route-shard edit',
  'No candidate text export',
  'No definition/lemma/reader-hint content storage',
  'No commercial export authorization',
  'No NC commercial authorization',
  'No release action',
]) {
  expect(receipt.non_acceptance_boundary?.includes(boundary), `missing boundary: ${boundary}`);
}

if (issues.length) {
  console.error(`Agent 2 source-family membership overlap receipt validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 source-family membership overlap receipt validation passed. Unique rows: 500; nonexclusive memberships: 936; transform/text/output rows: 0.');

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
