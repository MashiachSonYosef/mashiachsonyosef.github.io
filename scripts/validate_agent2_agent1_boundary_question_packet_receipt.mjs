#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const receiptPath = process.argv[2] || 'reports/agent2-agent1-boundary-question-packet-receipt-2026-06-05.json';
const receipt = readJson(receiptPath);
const issues = [];

expect(receipt.artifact_type === 'agent2_agent1_boundary_question_packet_receipt', 'artifact_type mismatch');
expect(receipt.status === 'agent1_boundary_questions_consumed_as_nonpublic_planning_questions_not_delivered_to_agent6', 'status mismatch');
expect(receipt.agent6_prior_planning_verdict?.disposition === 'WARN-ACCEPTED', 'prior Agent6 planning verdict mismatch');
expect(receipt.agent6_prior_planning_verdict?.still_requires_new_exact_boundary_for_candidate_use === true, 'new exact boundary requirement missing');

expect(receipt.boundary_question_counts?.total_boundary_question_rows === 6, 'boundary question rows must be 6');
expect(receipt.boundary_question_counts?.commercial_clean_candidate_questions === 3, 'commercial-clean questions must be 3');
expect(receipt.boundary_question_counts?.noncommercial_educational_candidate_questions === 1, 'NC questions must be 1');
expect(receipt.boundary_question_counts?.metadata_or_link_only_question_records === 1, 'metadata/link-only records must be 1');
expect(receipt.boundary_question_counts?.blocked_or_needs_review_questions === 1, 'blocked/review questions must be 1');
expect(receipt.boundary_question_counts?.future_candidate_use_questions_opened_now === 0, 'future candidate-use questions opened must be 0');
expect(receipt.boundary_question_counts?.delivered_to_agent6_now === 0, 'delivered to Agent6 must be 0');

expect(receipt.lane_counts_rows?.source_family_rows === 5, 'source family rows must be 5');
expect(receipt.lane_counts_rows?.allowed_transform_rows_now === 0, 'allowed transform rows must be 0');
expect(receipt.lane_counts_rows?.candidate_text_rows_now === 0, 'candidate text rows must be 0');
expect(receipt.lane_counts_rows?.answer_eligible_rows_now === 0, 'answer eligible rows must be 0');
expect(receipt.lane_counts_rows?.public_emit_rows_now === 0, 'public emit rows must be 0');
expect(receipt.lane_counts_rows?.release_route_opened_now === 0, 'release route opened must be 0');

expect(Array.isArray(receipt.boundary_question_summaries) && receipt.boundary_question_summaries.length === 6, 'boundary summaries must have 6 rows');
for (const question of receipt.boundary_question_summaries || []) {
  expect(question.current_allowed_now?.agent2_transform === false, `${question.row_subset_id} agent2 transform must be false`);
  expect(question.current_allowed_now?.candidate_text_export === false, `${question.row_subset_id} candidate text export must be false`);
  expect(question.current_allowed_now?.definition_content_storage === false, `${question.row_subset_id} definition storage must be false`);
  expect(question.current_allowed_now?.answer_eligibility === false, `${question.row_subset_id} answer eligibility must be false`);
  expect(question.current_allowed_now?.public_emit === false, `${question.row_subset_id} public emit must be false`);
  expect(question.current_allowed_now?.release_action === false, `${question.row_subset_id} release action must be false`);
}

const klein = receipt.boundary_question_summaries?.find((question) => question.source_family === 'Klein Dictionary');
expect(klein?.license_lane === 'noncommercial_educational_candidate', 'Klein lane must be NC');
expect(klein?.required_flags_to_preserve?.derived_from_nc === true, 'Klein derived_from_nc must be true');
expect(klein?.required_flags_to_preserve?.commercial_export_allowed === false, 'Klein commercial export must be false');
expect(klein?.required_flags_to_preserve?.attribution_required === true, 'Klein attribution must be true');
expect(klein?.current_allowed_now?.commercial_export === false, 'Klein current commercial export must be false');
expect(klein?.current_allowed_now?.nc_commercial_authorization === false, 'Klein NC commercial authorization must be false');

expect(receipt.delivery_state?.delivered_to_agent6_now === 0, 'delivery state must not be delivered');
expect(receipt.delivery_state?.future_candidate_use_questions_opened_now === 0, 'delivery state future questions must be 0');
expect(receipt.delivery_state?.requires_future_exact_delivery === true, 'future exact delivery flag missing');

for (const [key, value] of Object.entries(receipt.zero_output_counts || {})) {
  expect(value === 0, `zero_output_counts.${key} must be 0`);
}

expect(receipt.exact_blockers?.includes('agent1_boundary_question_packet_not_delivered_to_agent6_no_agent2_transform_or_candidate_use'), 'primary blocker missing');
expect(receipt.exact_blockers?.length === 7, 'exact blockers must include primary plus 6 question blockers');

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
  console.error(`Agent 2 Agent1 boundary-question packet receipt validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 Agent1 boundary-question packet receipt validation passed. Boundary rows: 6; Agent6 delivery: 0; transform/text/output rows: 0.');

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
