#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const receiptPath = process.argv[2] || 'reports/agent2-agent10-morphology-candidate-use-package-consumption-receipt-2026-06-05.json';
const receipt = readJson(receiptPath);
const issues = [];

expect(receipt.artifact_type === 'agent2_agent10_morphology_candidate_use_package_consumption_receipt', 'artifact_type mismatch');
expect(receipt.status === 'agent10_consumed_agent2_package_agent2_wait_closed_no_text_output', 'status mismatch');
expect(receipt.inputs?.agent10_package_consumption === 'reports/agent10-agent2-old-dictionary-morphology-candidate-use-package-consumption-2026-06-05.json', 'Agent10 package consumption input mismatch');
expect(receipt.inputs?.agent2_handoff_consumption_receipt === 'reports/agent2-agent10-morphology-candidate-use-handoff-consumption-receipt-2026-06-05.json', 'Agent2 handoff receipt input mismatch');
expect(receipt.inputs?.agent2_package === 'reports/agent2-old-dictionary-morphology-candidate-use-package-2026-06-05.json', 'Agent2 package input mismatch');

expect(receipt.consumed_agent10_state?.rows === 78, 'consumed rows must be 78');
expect(receipt.consumed_agent10_state?.occurrences === 1461, 'consumed occurrences must be 1461');
expect(receipt.consumed_agent10_state?.unique_queue_ids === 78, 'unique queue IDs must be 78');
expect(receipt.consumed_agent10_state?.morphology_blocked_rows_excluded === 219, 'blocked rows excluded must be 219');
expect(receipt.consumed_agent10_state?.commercial_clean_candidate_rows === 78, 'commercial-clean rows must be 78');
expect(receipt.consumed_agent10_state?.noncommercial_educational_candidate_rows === 0, 'NC rows must be 0');
expect(receipt.consumed_agent10_state?.next_handoff === 'Agent 10 release/package state only; no Agent 2 wait remains for this package.', 'next handoff mismatch');

expect(receipt.closed_wait?.prior_agent10_wait_blocker === 'await_agent2_exact_nonpublic_candidate_use_package_or_exact_blocker_for_78_old_dictionary_rows', 'prior wait blocker mismatch');
expect(receipt.closed_wait?.resolved_by_agent2_package === 'reports/agent2-old-dictionary-morphology-candidate-use-package-2026-06-05.json', 'resolved package mismatch');
expect(receipt.closed_wait?.agent2_wait_remains === false, 'Agent2 wait must be closed');

expect(receipt.counts?.package_rows === 78, 'package rows must be 78');
expect(receipt.counts?.package_occurrences === 1461, 'package occurrences must be 1461');
expect(receipt.counts?.commercial_clean_candidate_rows === 78, 'commercial-clean rows must be 78');
expect(receipt.counts?.noncommercial_educational_candidate_rows === 0, 'NC rows must be 0');
expect(receipt.counts?.morphology_blocked_rows_excluded === 219, 'blocked rows excluded must be 219');

for (const key of [
  'candidate_text_rows',
  'candidate_text_export_rows',
  'definition_content_rows',
  'lemma_content_rows',
  'reader_hint_content_rows',
  'answer_rows',
  'answer_eligible_rows',
  'public_emit_rows',
  'route_jsonl_rows',
  'route_shard_writes',
  'public_runtime_mutation',
  'accepted_text_rows',
  'release_actions',
  'commercial_export_authorization',
]) {
  expect(receipt.counts?.[key] === 0, `counts.${key} must be 0`);
}

expect(Array.isArray(receipt.validator_results_consumed) && receipt.validator_results_consumed.length === 2, 'must consume two validator results');
for (const result of receipt.validator_results_consumed || []) {
  expect(result.result === 'passed', `validator did not pass: ${result.command}`);
}

expect(receipt.exact_blocker === 'candidate_text_rows_0_actual_text_storage_transform_output_export_answer_or_runtime_mutation_requires_new_agent6_verdict', 'exact blocker mismatch');
expect(receipt.next_handoff_owner?.includes('Agent 10 release/package state'), 'next handoff owner mismatch');
expect(receipt.next_handoff_owner?.includes('Agent 6 must issue a later exact verdict'), 'Agent6 next verdict requirement missing');
expect(receipt.stop_condition === 'Stop at non-public candidate-use planning package.', 'stop condition mismatch');

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
  console.error(`Agent 2 Agent10 morphology candidate-use package consumption receipt validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 Agent10 morphology candidate-use package consumption receipt validation passed. Agent2 wait closed; rows: 78; occurrences: 1461; text/output rows: 0.');

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
