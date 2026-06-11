#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const receiptPath = process.argv[2] || 'reports/agent2-token-source-aggregate-gate-proof-consumption-receipt-2026-06-05.json';
const receipt = readJson(receiptPath);
const issues = [];

expect(receipt.artifact_type === 'agent2_token_source_aggregate_gate_proof_consumption_receipt', 'artifact_type mismatch');
expect(receipt.status === 'agent4_gate_proof_consumed_nonpublic_metadata_only', 'status mismatch');
expect(receipt.inputs?.agent4_gate_proof === 'reports/agent4-agent2-token-source-aggregate-consumption-receipt-gate-proof-2026-06-05.json', 'Agent4 gate proof input mismatch');
expect(receipt.inputs?.aggregate_receipt === 'reports/agent2-token-source-aggregate-consumption-receipt-2026-06-05.json', 'aggregate receipt input mismatch');

expect(receipt.consumed_gate_proof?.artifact_type === 'agent4_agent2_token_source_aggregate_consumption_receipt_gate_proof', 'consumed gate proof artifact_type mismatch');
expect(receipt.consumed_gate_proof?.status === 'validator_passed_nonpublic_metadata_only', 'consumed gate proof status mismatch');
expect(receipt.consumed_gate_proof?.boundary?.includes('validator/prereq evidence only'), 'gate proof boundary must be validator/prereq only');
expect(receipt.consumed_gate_proof?.commands_passed === 1, 'commands_passed must be 1');

expect(receipt.counts?.source_files_read === 1337, 'source_files_read must be 1337');
expect(receipt.counts?.units_read === 717459, 'units_read must be 717459');
expect(receipt.counts?.units_with_partition === 637508, 'units_with_partition must be 637508');
expect(receipt.counts?.total_token_occurrences_scanned === 66320359, 'token occurrences scanned mismatch');
expect(receipt.counts?.matched_token_occurrences === 49791095, 'matched token occurrences mismatch');
expect(receipt.counts?.chunks_merged === 54, 'chunks_merged must be 54');
expect(receipt.counts?.aggregate_edge_rows === 1951013, 'aggregate_edge_rows must be 1951013');
expect(receipt.counts?.aggregate_shard_count === 256, 'aggregate_shard_count must be 256');

for (const key of [
  'candidate_rows',
  'definition_candidate_rows',
  'lemma_candidate_rows',
  'reader_hint_candidate_rows',
  'candidate_text_rows',
  'answer_eligible_rows',
  'public_emit_rows',
]) {
  expect(receipt.counts?.[key] === 0, `counts.${key} must be 0`);
}

for (const blocker of [
  'no_candidate_rows_or_candidate_use_packet_from_aggregate',
  'aggregate_is_nonpublic_token_source_partition_metadata_only',
  'separate_exact_boundary_required_for_any_candidate_use_answer_public_runtime_or_release_use',
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
  expect(receipt.non_acceptance_boundary?.includes(boundary), `missing non-acceptance boundary: ${boundary}`);
}

expect(receipt.stop_condition?.includes('Do not derive candidate text'), 'stop condition must block derivation');
expect(receipt.highest_permissible_claim?.includes('validator/prereq evidence'), 'highest permissible claim must be validator/prereq only');

if (issues.length) {
  console.error(`Agent 2 token-source aggregate gate-proof consumption receipt validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 token-source aggregate gate-proof consumption receipt validation passed. Aggregate rows: 1951013; candidate rows: 0.');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}
