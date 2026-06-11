#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const receiptPath = process.argv[2] || 'reports/agent2-agent10-morphology-candidate-use-handoff-consumption-receipt-2026-06-05.json';
const receipt = readJson(receiptPath);
const issues = [];

expect(receipt.artifact_type === 'agent2_agent10_morphology_candidate_use_handoff_consumption_receipt', 'artifact_type mismatch');
expect(receipt.status === 'handoff_consumed_package_already_authored_and_gate_proved_no_text_output', 'status mismatch');
expect(receipt.inputs?.agent10_handoff === 'reports/agent10-agent2-old-dictionary-morphology-candidate-use-handoff-2026-06-05.json', 'Agent10 handoff input mismatch');
expect(receipt.inputs?.agent2_package === 'reports/agent2-old-dictionary-morphology-candidate-use-package-2026-06-05.json', 'Agent2 package input mismatch');
expect(receipt.inputs?.agent4_gate_proof === 'reports/agent4-agent2-old-dictionary-morphology-candidate-use-package-gate-proof-2026-06-05.json', 'Agent4 gate proof input mismatch');

expect(receipt.consumed_request?.rows === 78, 'consumed rows must be 78');
expect(receipt.consumed_request?.occurrences === 1461, 'consumed occurrences must be 1461');
expect(receipt.consumed_request?.license_lane === 'commercial_clean_candidate', 'license lane mismatch');
expect(receipt.consumed_request?.preview_relation_class === 'exact_after_mark_strip', 'preview relation class mismatch');
expect(receipt.consumed_request?.agent2_morphology_relation_status === 'agent2_morphology_relation_approved_for_nonpublic_planning', 'morphology relation status mismatch');
expect(receipt.consumed_request?.noncommercial_educational_candidate_rows === 0, 'NC rows must be 0');
expect(receipt.consumed_request?.excluded_morphology_blocked_rows === 219, 'excluded blocked rows must be 219');

expect(receipt.counts?.package_rows === 78, 'package rows must be 78');
expect(receipt.counts?.package_occurrences === 1461, 'package occurrences must be 1461');
expect(receipt.counts?.unique_queue_ids === 78, 'unique queue IDs must be 78');
expect(receipt.counts?.commercial_clean_candidate_rows === 78, 'commercial-clean rows must be 78');
expect(receipt.counts?.noncommercial_educational_candidate_rows === 0, 'NC rows must be 0');
expect(receipt.counts?.morphology_blocked_rows_excluded === 219, 'blocked rows excluded must be 219');
expect(receipt.counts?.exact_after_mark_strip_rows === 78, 'exact-after-mark-strip rows must be 78');

for (const key of [
  'candidate_text_rows',
  'definition_content_rows',
  'lemma_content_rows',
  'reader_hint_content_rows',
  'answer_rows',
  'answer_eligible_rows',
  'public_emit_rows',
  'route_jsonl_rows',
  'route_shard_writes',
  'public_runtime_mutation',
]) {
  expect(receipt.counts?.[key] === 0, `counts.${key} must be 0`);
}

expect(receipt.validator_result?.result === 'passed', 'validator result must be passed');
expect(receipt.validator_result?.stdout_summary?.includes('Rows: 78; occurrences: 1461; text/output rows: 0'), 'validator stdout summary mismatch');
expect(receipt.exact_blocker === 'new_agent6_verdict_required_before_text_storage_transform_output_export_answer_route_runtime_accepted_text_commercial_export_or_release', 'exact blocker mismatch');
expect(receipt.next_handoff_owner?.includes('Agent 10 for Agent 6 boundary review'), 'next handoff owner mismatch');
expect(receipt.stop_condition?.includes('Do not store candidate text'), 'stop condition must block text storage');

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
  console.error(`Agent 2 Agent10 morphology candidate-use handoff consumption receipt validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 Agent10 morphology candidate-use handoff consumption receipt validation passed. Rows: 78; occurrences: 1461; text/output rows: 0.');

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
