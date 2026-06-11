#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const receiptPath = process.argv[2] || 'reports/agent2-agent1-transform-lane-handoff-receipt-2026-06-05.json';
const receipt = readJson(receiptPath);
const issues = [];

expect(receipt.artifact_type === 'agent2_agent1_transform_lane_handoff_receipt', 'artifact_type mismatch');
expect(receipt.status === 'agent1_transform_lane_handoff_consumed_as_nonpublic_planning_evidence_waiting_exact_boundary', 'status mismatch');
expect(receipt.inputs?.agent1_transform_lane_handoff === 'reports/agent1-old-dictionary-agent2-transform-lane-handoff-2026-06-04.json', 'input handoff mismatch');
expect(receipt.inputs?.agent1_transform_lane_handoff_validation === 'reports/agent1-old-dictionary-agent2-transform-lane-handoff-validation-result-2026-06-04.json', 'input validation mismatch');

expect(receipt.target_counts?.source_family_count === 5, 'source family count mismatch');
expect(receipt.target_counts?.audited_rows === 500, 'audited rows mismatch');
expect(receipt.target_counts?.audited_occurrences === 8427, 'audited occurrences mismatch');
expect(receipt.target_counts?.commercial_clean_source_families === 3, 'commercial-clean source family count mismatch');
expect(receipt.target_counts?.noncommercial_educational_source_families === 1, 'noncommercial source family count mismatch');
expect(receipt.target_counts?.blocked_or_needs_review_source_families === 1, 'blocked/review source family count mismatch');
expect(receipt.target_counts?.metadata_or_link_only_source_families === 0, 'metadata/link-only source family count mismatch');
expect(receipt.target_counts?.agent2_transform_allowed_now_rows === 0, 'transform now must be 0');

expect(receipt.transform_count_matrix?.agent2_transform_candidate_after_agent6_boundary?.rows === 500, 'transform candidate rows mismatch');
expect(receipt.transform_count_matrix?.agent2_transform_candidate_after_agent6_boundary?.source_family_count === 3, 'transform candidate source family count mismatch');
expect(receipt.transform_count_matrix?.agent2_nc_educational_hold_separate?.rows === 214, 'NC rows mismatch');
expect(receipt.transform_count_matrix?.agent2_blocked_or_review_hold?.rows === 222, 'blocked/review rows mismatch');

expect(Array.isArray(receipt.transform_rows) && receipt.transform_rows.length === 5, 'transform row count mismatch');
const rowSubsetIds = new Set(receipt.transform_rows.map((row) => row.row_subset_id));
expect(rowSubsetIds.has('old-dictionary-excluded-row-license-lane-reaudit::jastrow-dictionary'), 'missing jastrow row subset');
expect(rowSubsetIds.has('old-dictionary-excluded-row-license-lane-reaudit::bdb-dictionary'), 'missing bdb row subset');
expect(rowSubsetIds.has('old-dictionary-excluded-row-license-lane-reaudit::bdb-aramaic-dictionary'), 'missing bdb-aramaic row subset');
expect(rowSubsetIds.has('old-dictionary-excluded-row-license-lane-reaudit::klein-dictionary'), 'missing klein row subset');
expect(rowSubsetIds.has('old-dictionary-excluded-row-license-lane-reaudit::bdb-augmented-strong'), 'missing bdb-augmented-strong row subset');

expect(Array.isArray(receipt.exact_blockers) && receipt.exact_blockers.length >= 2, 'exact blocker list mismatch');
for (const blocker of receipt.exact_blockers || []) {
  expect(typeof blocker.row_subset_id === 'string' && blocker.row_subset_id.length > 0, 'blocker row_subset_id missing');
  expect(Array.isArray(blocker.missing_evidence) && blocker.missing_evidence.length > 0, `${blocker.row_subset_id} blocker evidence missing`);
  expect(blocker.handoff_owner && blocker.handoff_owner.length > 0, `${blocker.row_subset_id} handoff owner missing`);
  expect(blocker.stop_condition && blocker.stop_condition.length > 0, `${blocker.row_subset_id} stop condition missing`);
}

for (const [key, value] of Object.entries(receipt.zero_output_counts || {})) {
  expect(value === 0, `${key} must be zero`);
}

expect(receipt.stop_condition?.includes('Stop at Agent2 transform-lane handoff receipt'), 'stop condition must identify stop');
expect(receipt.stop_condition?.includes('Do not transform'), 'stop condition must block transform');

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

expect(receipt.lane_preservation?.handoff_nonces?.commercial_clean_and_nc_separated === true, 'NC separation must be preserved');

if (issues.length) {
  console.error(`Agent 2 Agent1 transform lane handoff receipt validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 Agent1 transform lane handoff receipt validation passed. Rows: 5; transform rows now: 0.');

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
