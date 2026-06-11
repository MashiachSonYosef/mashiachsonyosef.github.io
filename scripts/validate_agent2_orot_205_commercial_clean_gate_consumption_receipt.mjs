#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const receiptPath = process.argv[2] || 'reports/agent2-orot-205-commercial-clean-gate-consumption-receipt-2026-06-05.json';
const receipt = readJson(receiptPath);
const issues = [];

expect(receipt.artifact_type === 'agent2_orot_205_commercial_clean_gate_consumption_receipt', 'artifact_type mismatch');
expect(receipt.status === 'commercial_clean_205_row_gate_proof_consumed_as_planning_only_evidence', 'status mismatch');
expect(receipt.inputs?.agent4_gate_proof === 'reports/agent4-orot-205-row-commercial-clean-subset-gate-proof-2026-06-05.json', 'Agent4 gate proof input mismatch');
expect(receipt.inputs?.agent10_consumption === 'reports/agent10-agent2-agent4-fresh-output-consumption-2026-06-05.json', 'Agent10 consumption input mismatch');

expect(receipt.counts?.rows === 205, 'rows must be 205');
expect(receipt.counts?.occurrences === 1767, 'occurrences must be 1767');
expect(receipt.counts?.exact_after_mark_strip_rows === 52, 'exact-after-mark-strip rows must be 52');
expect(receipt.counts?.exact_after_mark_strip_occurrences === 449, 'exact-after-mark-strip occurrences must be 449');
expect(receipt.counts?.prefix_or_clitic_possible_rows === 82, 'prefix/clitic rows must be 82');
expect(receipt.counts?.prefix_or_clitic_possible_occurrences === 677, 'prefix/clitic occurrences must be 677');
expect(receipt.counts?.needs_morphology_disambiguation_rows === 71, 'needs-disambiguation rows must be 71');
expect(receipt.counts?.needs_morphology_disambiguation_occurrences === 641, 'needs-disambiguation occurrences must be 641');
expect(receipt.counts?.missing_agent1_6_custody_disposition_rows === 205, 'custody blocker rows must be 205');
expect(receipt.counts?.answer_text_not_stored_by_preview_rows === 205, 'answer-text blocker rows must be 205');
expect(receipt.counts?.missing_approved_morphology_relation_rows === 153, 'morphology blocker rows must be 153');

expect(receipt.agent10_consumption_state?.exact_blocker === 'planning_only_boundary_remains', 'Agent10 exact blocker mismatch');
expect(receipt.agent10_consumption_state?.agent6_boundary_question === null, 'Agent6 boundary question must be null');

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
  'No candidate text export',
  'No NC commercial authorization',
  'No release action',
]) {
  expect(receipt.non_acceptance_boundary?.includes(boundary), `missing non-acceptance boundary: ${boundary}`);
}

expect(receipt.highest_permissible_claim?.includes('nonpublic planning/prereq evidence only'), 'highest permissible claim mismatch');
expect(receipt.stop_condition?.includes('Do not emit definition'), 'stop condition must block transform output');

if (issues.length) {
  console.error(`Agent 2 Orot 205 commercial-clean gate consumption receipt validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 Orot 205 commercial-clean gate consumption receipt validation passed. Rows: 205; candidate rows: 0.');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}
