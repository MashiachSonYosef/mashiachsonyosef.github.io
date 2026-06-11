#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const receiptPath = process.argv[2] || 'reports/agent2-agent4-gate-proof-consumption-receipt-2026-06-05.json';
const receipt = readJson(receiptPath);
const issues = [];

expect(receipt.artifact_type === 'agent2_agent4_gate_proof_consumption_receipt', 'artifact_type mismatch');
expect(receipt.status === 'agent4_gate_proofs_consumed_as_validator_prereq_evidence_only', 'status mismatch');
expect(receipt.inputs?.morphology_gate_proof === 'reports/agent4-agent2-old-dictionary-morphology-relation-gate-proof-2026-06-05.json', 'morphology gate proof input mismatch');
expect(receipt.inputs?.candidate_use_gate_proof === 'reports/agent4-agent2-morphology-planning-candidate-use-blocker-gate-proof-2026-06-05.json', 'candidate-use gate proof input mismatch');
expect(receipt.inputs?.agent2_preflight_handoff === 'reports/agent2-agent10-candidate-use-preflight-handoff-2026-06-05.json', 'preflight handoff input mismatch');

expect(Array.isArray(receipt.consumed_gate_proofs) && receipt.consumed_gate_proofs.length === 2, 'must consume two Agent4 gate proofs');
for (const proof of receipt.consumed_gate_proofs || []) {
  expect(proof.boundary?.includes('validator/prereq evidence only'), `${proof.path} boundary must be validator/prereq only`);
  expect(proof.commands_passed > 0, `${proof.path} commands_passed must be positive`);
}

expect(receipt.counts?.morphology_matrix_rows === 297, 'morphology matrix rows must be 297');
expect(receipt.counts?.morphology_planning_approved_rows === 78, 'morphology planning rows must be 78');
expect(receipt.counts?.morphology_blocked_rows === 219, 'morphology blocked rows must be 219');
expect(receipt.counts?.candidate_use_blocker_planning_rows === 78, 'candidate-use blocker planning rows must be 78');
expect(receipt.counts?.preflight_future_question_rows === 78, 'preflight future question rows must be 78');
expect(receipt.counts?.allowed_candidate_use_rows_now === 0, 'allowed candidate-use rows must be 0');
expect(receipt.counts?.allowed_transform_rows_now === 0, 'allowed transform rows must be 0');

for (const [key, value] of Object.entries(receipt.zero_output_counts || {})) {
  expect(value === 0, `zero_output_counts.${key} must be 0`);
}

for (const blocker of [
  'missing_exact_row_subset_candidate_use_package',
  'morphology_planning_rows_have_no_delivered_agent6_candidate_use_boundary',
  'agent10_agent6_exact_candidate_use_packet_missing_for_78_morphology_planning_rows',
]) {
  expect(receipt.blockers_preserved?.includes(blocker), `missing preserved blocker: ${blocker}`);
}

for (const boundary of [
  'No QA acceptance',
  'No Definition authority',
  'No answer acceptance',
  'No source/license/legal acceptance',
  'No accepted gloss/text',
  'No public/runtime mutation',
  'No candidate text export',
  'No NC commercial authorization',
  'No release action',
]) {
  expect(receipt.non_acceptance_boundary?.includes(boundary), `missing non-acceptance boundary: ${boundary}`);
}

expect(receipt.highest_permissible_claim?.includes('validator/prereq evidence'), 'highest permissible claim must be validator/prereq evidence only');
expect(receipt.stop_condition?.includes('Do not treat gate proof as QA'), 'stop condition must prevent acceptance interpretation');

if (issues.length) {
  console.error(`Agent 2 Agent4 gate-proof consumption receipt validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 Agent4 gate-proof consumption receipt validation passed. Gate proofs: 2; candidate-use rows: 0.');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}
