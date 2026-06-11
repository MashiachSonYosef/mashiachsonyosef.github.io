#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const receiptPath = process.argv[2] || 'reports/agent2-orot-205-gate-proof-consumption-receipt-2026-06-05.json';
const receipt = readJson(receiptPath);
const issues = [];

expect(receipt.artifact_type === 'agent2_orot_205_gate_proof_consumption_receipt', 'artifact_type mismatch');
expect(receipt.status === 'agent4_gate_proof_consumed_planning_only_evidence', 'status mismatch');
expect(receipt.inputs?.agent4_gate_proof === 'reports/agent4-agent2-orot-205-commercial-clean-gate-consumption-receipt-gate-proof-2026-06-05.json', 'Agent4 gate proof input mismatch');
expect(receipt.inputs?.orot_205_receipt === 'reports/agent2-orot-205-commercial-clean-gate-consumption-receipt-2026-06-05.json', 'Orot 205 receipt input mismatch');

expect(receipt.consumed_gate_proof?.status === 'validator_passed_planning_only_evidence', 'consumed gate proof status mismatch');
expect(receipt.consumed_gate_proof?.commands_passed === 1, 'commands_passed must be 1');
expect(receipt.consumed_gate_proof?.boundary?.includes('validator/prereq evidence only'), 'boundary must be validator/prereq only');

expect(receipt.counts?.rows === 205, 'rows must be 205');
expect(receipt.counts?.occurrences === 1767, 'occurrences must be 1767');
expect(receipt.counts?.exact_after_mark_strip_rows === 52, 'exact-after-mark-strip rows must be 52');
expect(receipt.counts?.exact_after_mark_strip_occurrences === 449, 'exact-after-mark-strip occurrences must be 449');
expect(receipt.counts?.prefix_or_clitic_possible_rows === 82, 'prefix/clitic rows must be 82');
expect(receipt.counts?.prefix_or_clitic_possible_occurrences === 677, 'prefix/clitic occurrences must be 677');
expect(receipt.counts?.needs_morphology_disambiguation_rows === 71, 'needs-disambiguation rows must be 71');
expect(receipt.counts?.needs_morphology_disambiguation_occurrences === 641, 'needs-disambiguation occurrences must be 641');

for (const key of [
  'candidate_text_rows_now',
  'definition_candidate_rows_now',
  'lemma_candidate_rows_now',
  'reader_hint_candidate_rows_now',
  'answer_eligible_rows_now',
  'public_emit_rows_now',
]) {
  expect(receipt.counts?.[key] === 0, `counts.${key} must be 0`);
}

for (const blocker of [
  'planning_only_boundary_remains',
  'missing_agent1_6_custody_disposition',
  'answer_text_not_stored_by_preview',
  'missing_approved_morphology_relation_for_153_rows',
  'separate_exact_agent6_boundary_required_for_any_downstream_candidate_use',
]) {
  expect(receipt.blockers_preserved?.includes(blocker), `missing blocker: ${blocker}`);
}

for (const [key, value] of Object.entries(receipt.zero_output_counts || {})) {
  expect(value === 0, `zero_output_counts.${key} must be 0`);
}

for (const boundary of [
  'No QA acceptance',
  'No Definition authority',
  'No answer acceptance',
  'No source/license/legal acceptance',
  'No accepted gloss/text',
  'No public/runtime mutation',
  'No route-shard edit',
  'No candidate-use authorization',
  'No candidate text export',
  'No NC commercial authorization',
  'No release action',
]) {
  expect(receipt.non_acceptance_boundary?.includes(boundary), `missing boundary: ${boundary}`);
}

expect(receipt.highest_permissible_claim?.includes('validator/prereq evidence'), 'highest permissible claim mismatch');
expect(receipt.stop_condition?.includes('Do not emit definition'), 'stop condition must block definition output');

if (issues.length) {
  console.error(`Agent 2 Orot 205 gate-proof consumption receipt validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 Orot 205 gate-proof consumption receipt validation passed. Rows: 205; candidate rows: 0.');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}
