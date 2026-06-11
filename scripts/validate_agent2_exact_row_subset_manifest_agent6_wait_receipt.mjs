#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const receiptPath = process.argv[2] || 'reports/agent2-exact-row-subset-manifest-agent6-wait-receipt-2026-06-05.json';
const receipt = readJson(receiptPath);
const issues = [];

expect(receipt.artifact_type === 'agent2_exact_row_subset_manifest_agent6_wait_receipt', 'artifact_type mismatch');
expect(receipt.status === 'agent1_exact_row_subset_manifest_consumed_as_nonpublic_lane_planning_evidence_waiting_agent6_verdict', 'status mismatch');
expect(receipt.inputs?.agent1_manifest === 'reports/agent1-old-dictionary-exact-row-subset-manifest-2026-06-05.json', 'Agent1 manifest input mismatch');
expect(receipt.inputs?.agent10_agent6_boundary_packet === 'reports/agent10-agent6-ready-old-dictionary-exact-row-subset-manifest-boundary-packet-2026-06-05.json', 'boundary packet input mismatch');
expect(receipt.inputs?.agent10_agent6_delivery_proof === 'reports/agent10-agent6-old-dictionary-exact-row-subset-manifest-delivery-proof-2026-06-05.json', 'delivery proof input mismatch');
expect(receipt.inputs?.missing_agent6_verdict === 'reports/agent6-old-dictionary-exact-row-subset-manifest-boundary-verdict-2026-06-05.json', 'missing Agent6 verdict path mismatch');

expect(receipt.manifest_counts?.subset_count === 8, 'subset count must be 8');
expect(receipt.manifest_counts?.audited_rows === 500, 'audited rows must be 500');
expect(receipt.manifest_counts?.audited_occurrences === 8427, 'audited occurrences must be 8427');
expect(receipt.manifest_counts?.manifest_token_id_count === 500, 'manifest token count must be 500');
expect(receipt.manifest_counts?.unique_manifest_token_id_count === 500, 'unique token count must be 500');
expect(receipt.manifest_counts?.duplicate_token_id_count === 0, 'duplicate token count must be 0');

expect(receipt.lane_bucket_counts?.commercial_clean_only_rows === 18, 'commercial clean only rows must be 18');
expect(receipt.lane_bucket_counts?.commercial_clean_plus_nc_rows === 57, 'commercial clean plus NC rows must be 57');
expect(receipt.lane_bucket_counts?.commercial_clean_plus_blocked_rows === 82, 'commercial clean plus blocked rows must be 82');
expect(receipt.lane_bucket_counts?.triple_overlap_rows === 140, 'triple overlap rows must be 140');
expect(receipt.lane_bucket_counts?.nc_only_rows === 17, 'NC only rows must be 17');
expect(receipt.lane_bucket_counts?.metadata_or_link_only_rows === 0, 'metadata/link-only rows must be 0');
expect(receipt.lane_bucket_counts?.blocked_review_only_rows === 0, 'blocked-review only rows must be 0');
expect(receipt.lane_bucket_counts?.no_source_hit_rows === 186, 'no source hit rows must be 186');

expect(Array.isArray(receipt.subset_summaries) && receipt.subset_summaries.length === 8, 'subset summaries must have 8 entries');
for (const subset of receipt.subset_summaries || []) {
  expect(typeof subset.bucket_id === 'string' && subset.bucket_id.length > 0, 'subset bucket_id missing');
  expect(Array.isArray(subset.classification_lanes) && subset.classification_lanes.length > 0, `${subset.bucket_id} classification lanes missing`);
  expect(Number.isInteger(subset.row_count) && subset.row_count >= 0, `${subset.bucket_id} row count invalid`);
  expect(Number.isInteger(subset.occurrence_count) && subset.occurrence_count >= 0, `${subset.bucket_id} occurrence count invalid`);
  expect(typeof subset.token_ids_sha256 === 'string' && subset.token_ids_sha256.length === 64, `${subset.bucket_id} token hash invalid`);
  expect(typeof subset.exact_blocker === 'string' && subset.exact_blocker.length > 0, `${subset.bucket_id} exact blocker missing`);
}

expect(receipt.delivery_state?.delivered_to_agent6 === true, 'must record Agent6 delivery');
expect(receipt.delivery_state?.delivery_submission_id === '019e9800-4a2d-77f1-8624-98594a0d9397', 'delivery submission mismatch');
expect(receipt.delivery_state?.requested_boundary === 'nonpublic_source_lane_row_subset_planning_evidence_only', 'requested boundary mismatch');
expect(receipt.delivery_state?.agent6_verdict_present_now === false, 'Agent6 verdict must be absent now');

for (const [key, value] of Object.entries(receipt.zero_output_counts || {})) {
  expect(value === 0, `zero_output_counts.${key} must be 0`);
}

expect(receipt.exact_blocker === 'missing_agent6_old_dictionary_exact_row_subset_manifest_boundary_verdict_before_agent2_transform_candidate_text_definition_lemma_reader_hint_answer_public_runtime_route_export_or_release_use', 'exact blocker mismatch');
expect(receipt.handoff_owner?.includes('Agent 10/Agent 6'), 'handoff owner mismatch');
expect(receipt.stop_condition?.includes('Do not transform'), 'stop condition must block transform');
expect(receipt.stop_condition?.includes('store candidate text'), 'stop condition must block candidate text storage');

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
  expect(receipt.non_acceptance_boundary?.includes(boundary), `missing non-acceptance boundary: ${boundary}`);
}

if (issues.length) {
  console.error(`Agent 2 exact row-subset manifest Agent6 wait receipt validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 exact row-subset manifest Agent6 wait receipt validation passed. Rows: 500; subsets: 8; transform/text/output rows: 0.');

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
