#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const receiptPath = process.argv[2] || 'reports/agent2-token-source-aggregate-consumption-receipt-2026-06-05.json';
const receipt = readJson(receiptPath);
const issues = [];

expect(receipt.artifact_type === 'agent2_token_source_aggregate_consumption_receipt', 'artifact_type mismatch');
expect(receipt.status === 'token_source_aggregate_consumed_as_nonpublic_metadata_evidence_only', 'status mismatch');
expect(receipt.inputs?.agent4_gate_proof === 'reports/agent4-agent2-token-source-partition-edges-aggregate-gate-proof-2026-06-05.json', 'Agent4 gate proof input mismatch');
expect(receipt.inputs?.agent10_consumption === 'reports/agent10-agent2-agent4-fresh-output-consumption-2026-06-05.json', 'Agent10 consumption input mismatch');

expect(receipt.counts?.source_files_read === 1337, 'source_files_read must be 1337');
expect(receipt.counts?.units_read === 717459, 'units_read must be 717459');
expect(receipt.counts?.units_with_partition === 637508, 'units_with_partition must be 637508');
expect(receipt.counts?.total_token_occurrences_scanned === 66320359, 'total token occurrences mismatch');
expect(receipt.counts?.matched_token_occurrences === 49791095, 'matched token occurrences mismatch');
expect(receipt.counts?.chunk_count === 54, 'chunk count must be 54');
expect(receipt.counts?.chunks_merged === 54, 'chunks merged must be 54');
expect(receipt.counts?.aggregate_edge_rows === 1951013, 'aggregate edge rows must be 1951013');
expect(receipt.counts?.aggregate_shard_count === 256, 'aggregate shard count must be 256');

for (const key of [
  'candidate_rows',
  'answer_rows',
  'answer_eligible_rows',
  'public_reader_output_rows',
  'route_jsonl_rows',
  'route_shard_writes',
  'definition_content_rows',
  'candidate_text_export_rows',
  'accepted_text_rows',
  'public_runtime_mutation',
]) {
  expect(receipt.counts?.[key] === 0, `counts.${key} must be 0`);
}

expect(receipt.agent10_consumption_state?.exact_blocker === 'no_candidate_rows_or_candidate_use_packet_from_aggregate', 'Agent10 exact blocker mismatch');
expect(receipt.agent10_consumption_state?.agent6_boundary_question === null, 'Agent6 boundary question must be null');
expect(receipt.highest_permissible_claim === 'Agent2 may use the aggregate as nonpublic token-source partition metadata evidence only.', 'highest permissible claim mismatch');

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

expect(receipt.stop_condition?.includes('Do not derive candidate text'), 'stop condition must block candidate text derivation');

if (issues.length) {
  console.error(`Agent 2 token-source aggregate consumption receipt validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 token-source aggregate consumption receipt validation passed. Aggregate rows: 1951013; candidate rows: 0.');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}
