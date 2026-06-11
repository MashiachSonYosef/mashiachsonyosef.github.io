#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const receiptPath = process.argv[2] || 'reports/agent2-downstream-alignment-audit-receipt-2026-06-05.json';
const receipt = readJson(receiptPath);
const issues = [];

expect(receipt.artifact_type === 'agent2_downstream_alignment_audit_receipt', 'artifact_type mismatch');
expect(receipt.status === 'agent1_downstream_alignment_consumed_as_agent2_no_output_boundary_evidence', 'status mismatch');
expect(receipt.current_agent1_thread_id === '019e975d-dc9f-7020-a7c8-885d083a837e', 'current Agent1 thread mismatch');
expect(receipt.old_agent1_policy === 'archived_do_not_use', 'old Agent1 policy mismatch');

expect(receipt.downstream_alignment_counts?.agent2_readiness_source_family_rows === 5, 'Agent2 readiness source family rows must be 5');
expect(receipt.downstream_alignment_counts?.commercial_clean_candidate_source_families === 3, 'commercial-clean families must be 3');
expect(receipt.downstream_alignment_counts?.noncommercial_educational_candidate_source_families === 1, 'NC families must be 1');
expect(receipt.downstream_alignment_counts?.metadata_or_link_only_source_families === 0, 'metadata/link-only families must be 0');
expect(receipt.downstream_alignment_counts?.blocked_or_needs_review_source_families === 1, 'blocked/review families must be 1');
expect(receipt.downstream_alignment_counts?.allowed_transform_rows_now === 0, 'allowed transform rows must be 0');
expect(receipt.downstream_alignment_counts?.candidate_text_rows_now === 0, 'candidate text rows must be 0');
expect(receipt.downstream_alignment_counts?.definition_candidate_rows_now === 0, 'definition candidate rows must be 0');
expect(receipt.downstream_alignment_counts?.lemma_candidate_rows_now === 0, 'lemma candidate rows must be 0');
expect(receipt.downstream_alignment_counts?.reader_hint_candidate_rows_now === 0, 'reader hint candidate rows must be 0');
expect(receipt.downstream_alignment_counts?.answer_eligible_rows_now === 0, 'answer eligible rows must be 0');
expect(receipt.downstream_alignment_counts?.public_emit_rows_now === 0, 'public emit rows must be 0');
expect(receipt.downstream_alignment_counts?.release_route_opened_now === 0, 'release route opened must be 0');
expect(receipt.downstream_alignment_counts?.agent6_route_opened_now === 0, 'Agent6 route opened must be 0');

expect(Array.isArray(receipt.lane_alignment_rows) && receipt.lane_alignment_rows.length === 5, 'lane alignment rows must be 5');
for (const row of receipt.lane_alignment_rows || []) {
  expect(row.allowed_transform_now === false, `${row.row_subset_id} transform must be false`);
  expect(row.commercial_export_allowed === false, `${row.row_subset_id} commercial export must be false in Agent2 receipt`);
  expect(typeof row.exact_blocker === 'string' && row.exact_blocker.length > 0, `${row.row_subset_id} blocker missing`);
}

const klein = receipt.lane_alignment_rows?.find((row) => row.source_family === 'Klein Dictionary');
expect(klein?.license_lane === 'noncommercial_educational_candidate', 'Klein lane must be NC educational');
expect(klein?.derived_from_nc === true, 'Klein derived_from_nc must be true');
expect(klein?.commercial_export_allowed === false, 'Klein commercial export must be false');
expect(klein?.attribution_required === true, 'Klein attribution must be required');

expect(receipt.preserved_lane_rules?.noncommercial_educational_candidate_preserved_separately === true, 'NC separation missing');
expect(receipt.preserved_lane_rules?.metadata_or_link_only_preserved_as_zero_rows === true, 'metadata/link-only zero preservation missing');
expect(receipt.preserved_lane_rules?.blocked_or_needs_review_preserved_separately === true, 'blocked/review separation missing');
expect(receipt.preserved_lane_rules?.nc_commercial_authorization_rows === 0, 'NC commercial authorization rows must be 0');
expect(receipt.preserved_lane_rules?.unclassified_rows_consumed_as_candidate_text === 0, 'unclassified candidate text rows must be 0');

expect(Array.isArray(receipt.exact_blockers) && receipt.exact_blockers.length === 5, 'exact blockers must be 5');
for (const blocker of [
  'old-dictionary-excluded-row-license-lane-reaudit::jastrow-dictionary::missing_exact_agent6_boundary_and_approved_morphology_relation',
  'old-dictionary-excluded-row-license-lane-reaudit::bdb-dictionary::missing_exact_agent6_boundary_and_approved_morphology_relation',
  'old-dictionary-excluded-row-license-lane-reaudit::bdb-aramaic-dictionary::missing_exact_agent6_boundary_and_approved_morphology_relation',
  'old-dictionary-excluded-row-license-lane-reaudit::klein-dictionary::missing_exact_agent6_nc_boundary_no_commercial_export_authorization',
  'old-dictionary-excluded-row-license-lane-reaudit::bdb-augmented-strong::missing_independent_source_license_custody_basis',
]) {
  expect(receipt.exact_blockers?.includes(blocker), `missing blocker: ${blocker}`);
}

for (const [key, value] of Object.entries(receipt.zero_output_counts || {})) {
  expect(value === 0, `zero_output_counts.${key} must be 0`);
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
  console.error(`Agent 2 downstream alignment audit receipt validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 downstream alignment audit receipt validation passed. Source families: 5; exact blockers: 5; transform/text/output rows: 0.');

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
