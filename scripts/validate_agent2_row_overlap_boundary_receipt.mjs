#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const receiptPath = process.argv[2] || 'reports/agent2-row-overlap-boundary-receipt-2026-06-05.json';
const receipt = readJson(receiptPath);
const issues = [];

expect(receipt.artifact_type === 'agent2_row_overlap_boundary_receipt', 'artifact_type mismatch');
expect(receipt.status === 'agent1_row_overlap_boundary_consumed_as_nonpublic_planning_evidence_not_delivered_to_agent6', 'status mismatch');

expect(receipt.row_overlap_totals?.audited_rows === 500, 'audited rows must be 500');
expect(receipt.row_overlap_totals?.audited_occurrences === 8427, 'audited occurrences must be 8427');
expect(receipt.row_overlap_totals?.commercial_clean_evidence_rows === 297, 'commercial-clean evidence rows must be 297');
expect(receipt.row_overlap_totals?.noncommercial_educational_evidence_rows === 214, 'NC evidence rows must be 214');
expect(receipt.row_overlap_totals?.blocked_review_evidence_rows === 222, 'blocked/review evidence rows must be 222');
expect(receipt.row_overlap_totals?.metadata_or_link_only_rows === 0, 'metadata/link-only rows must be 0');
expect(receipt.row_overlap_totals?.public_domain_only_unique_rows === 18, 'public-domain only rows must be 18');
expect(receipt.row_overlap_totals?.klein_only_unique_rows === 17, 'Klein-only rows must be 17');
expect(receipt.row_overlap_totals?.multi_lane_overlap_rows === 279, 'multi-lane overlap rows must be 279');

expect(Array.isArray(receipt.classification_lanes) && receipt.classification_lanes.length === 4, 'classification lanes must have 4 entries');
const ncLane = receipt.classification_lanes?.find((lane) => lane.license_lane === 'noncommercial_educational_candidate');
expect(ncLane?.derived_from_nc === true, 'NC lane derived_from_nc must be true');
expect(ncLane?.commercial_export_allowed_now === false, 'NC lane commercial export must be false');
expect(ncLane?.attribution_required === true, 'NC lane attribution must be true');

expect(receipt.boundary_question_counts?.total_boundary_question_records === 8, 'boundary questions must be 8');
expect(receipt.boundary_question_counts?.nonzero_boundary_question_records === 6, 'nonzero boundary questions must be 6');
expect(receipt.boundary_question_counts?.zero_row_boundary_records === 2, 'zero-row boundary records must be 2');
expect(receipt.boundary_question_counts?.total_rows_represented === 500, 'boundary rows represented must be 500');
expect(receipt.boundary_question_counts?.delivered_to_agent6_now === 0, 'delivered_to_agent6_now must be 0');
expect(receipt.boundary_question_counts?.future_candidate_use_questions_opened_now === 0, 'future candidate-use questions opened must be 0');
expect(Array.isArray(receipt.boundary_question_summaries) && receipt.boundary_question_summaries.length === 8, 'boundary question summaries must be 8');
for (const question of receipt.boundary_question_summaries || []) {
  expect(question.current_allowed_now?.agent2_transform === false, `${question.row_subset_id} agent2_transform must be false`);
  expect(question.current_allowed_now?.candidate_text_export === false, `${question.row_subset_id} candidate_text_export must be false`);
  expect(question.current_allowed_now?.definition_content_storage === false, `${question.row_subset_id} definition_content_storage must be false`);
  expect(question.current_allowed_now?.answer_eligibility === false, `${question.row_subset_id} answer_eligibility must be false`);
  expect(question.current_allowed_now?.public_emit === false, `${question.row_subset_id} public_emit must be false`);
  expect(question.current_allowed_now?.release_action === false, `${question.row_subset_id} release_action must be false`);
  expect(question.current_allowed_now?.agent6_delivery === false, `${question.row_subset_id} agent6_delivery must be false`);
}

expect(receipt.delivery_state?.delivered_to_agent6_now === 0, 'delivery state must not be delivered to Agent6');
expect(receipt.delivery_state?.future_candidate_use_questions_opened_now === 0, 'delivery state future questions opened must be 0');
expect(receipt.delivery_state?.agent6_boundary_required_before_agent2_use === true, 'Agent6 boundary required flag missing');

for (const [key, value] of Object.entries(receipt.zero_output_counts || {})) {
  expect(value === 0, `zero_output_counts.${key} must be 0`);
}

expect(receipt.exact_blockers?.includes('row_overlap_boundary_questions_not_delivered_to_agent6_no_agent2_transform_or_candidate_use'), 'missing primary blocker');
expect(receipt.exact_blockers?.length === 9, 'exact blockers must include primary plus 8 question blockers');

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
  console.error(`Agent 2 row-overlap boundary receipt validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 row-overlap boundary receipt validation passed. Rows: 500; boundary questions: 8; Agent6 delivery: 0; transform/text/output rows: 0.');

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
