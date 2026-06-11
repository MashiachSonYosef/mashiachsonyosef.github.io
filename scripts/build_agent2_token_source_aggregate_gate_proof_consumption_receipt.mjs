#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const gateProofPath = 'reports/agent4-agent2-token-source-aggregate-consumption-receipt-gate-proof-2026-06-05.json';
const aggregateReceiptPath = 'reports/agent2-token-source-aggregate-consumption-receipt-2026-06-05.json';
const outputPath = 'reports/agent2-token-source-aggregate-gate-proof-consumption-receipt-2026-06-05.json';
const markdownPath = 'reports/agent2-token-source-aggregate-gate-proof-consumption-receipt-2026-06-05.md';

const gateProof = readJson(gateProofPath);
const aggregateReceipt = readJson(aggregateReceiptPath);
assertInputs(gateProof, aggregateReceipt);

const receipt = {
  schema_version: '1.0',
  artifact_type: 'agent2_token_source_aggregate_gate_proof_consumption_receipt',
  generated_at: '2026-06-05T14:43:00.000Z',
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / source-lane separated lexicon expansion',
  target: 'Agent2 token-source aggregate receipt Agent4 gate-proof consumption',
  status: 'agent4_gate_proof_consumed_nonpublic_metadata_only',
  inputs: {
    agent4_gate_proof: gateProofPath,
    aggregate_receipt: aggregateReceiptPath,
  },
  consumed_gate_proof: {
    artifact_type: gateProof.artifact_type,
    status: gateProof.status,
    boundary: gateProof.boundary,
    commands_passed: gateProof.commands.length,
    validated_file: gateProof.files[0].path,
    validator_file: gateProof.files[1].path,
  },
  counts: {
    source_files_read: gateProof.counts.source_files_read,
    units_read: gateProof.counts.units_read,
    units_with_partition: gateProof.counts.units_with_partition,
    total_token_occurrences_scanned: gateProof.counts.total_token_occurrences_scanned,
    matched_token_occurrences: gateProof.counts.matched_token_occurrences,
    chunks_merged: gateProof.counts.chunks_merged,
    aggregate_edge_rows: gateProof.counts.aggregate_edge_rows,
    aggregate_shard_count: gateProof.counts.aggregate_shard_count,
    candidate_rows: 0,
    definition_candidate_rows: 0,
    lemma_candidate_rows: 0,
    reader_hint_candidate_rows: 0,
    candidate_text_rows: 0,
    answer_eligible_rows: 0,
    public_emit_rows: 0,
  },
  blockers_preserved: gateProof.blockers,
  zero_output_counts: {
    definition_candidate_rows: 0,
    lemma_candidate_rows: 0,
    reader_hint_candidate_rows: 0,
    candidate_text_rows: 0,
    answer_rows: 0,
    answer_eligible_rows: 0,
    public_reader_output_rows: 0,
    route_jsonl_rows: 0,
    route_shard_writes: 0,
    public_runtime_mutation: 0,
    accepted_gloss_text_rows: 0,
    definition_content_rows: 0,
    candidate_text_export_rows: 0,
    release_rows: 0,
  },
  highest_permissible_claim: 'Agent2 consumed the Agent4 gate proof as validator/prereq evidence for the metadata-only aggregate receipt.',
  handoff_owner: 'Agent 2 definer retains metadata-only aggregate evidence; Agent10/Agent6 require a separate exact candidate-use packet before downstream use.',
  stop_condition: 'Stop at gate-proof consumption. Do not derive candidate text, definition content, answer rows, public output, route writes, accepted text, export rows, or release artifacts from aggregate metadata or this gate proof.',
  non_acceptance_boundary: [
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
  ],
};

writeJson(outputPath, receipt);
writeMarkdown(markdownPath, receipt);
console.log(`wrote ${outputPath}`);
console.log(`wrote ${markdownPath}`);

function assertInputs(gateProof, aggregateReceipt) {
  if (gateProof.artifact_type !== 'agent4_agent2_token_source_aggregate_consumption_receipt_gate_proof') throw new Error('gate proof artifact_type mismatch');
  if (gateProof.status !== 'validator_passed_nonpublic_metadata_only') throw new Error('gate proof status mismatch');
  if (gateProof.counts.aggregate_edge_rows !== 1951013) throw new Error('gate proof aggregate edge rows mismatch');
  if (gateProof.zero_counters.candidate_rows !== 0) throw new Error('gate proof candidate rows must be 0');
  if (aggregateReceipt.artifact_type !== 'agent2_token_source_aggregate_consumption_receipt') throw new Error('aggregate receipt artifact_type mismatch');
  if (aggregateReceipt.counts.aggregate_edge_rows !== 1951013) throw new Error('aggregate receipt edge rows mismatch');
  if (aggregateReceipt.counts.candidate_rows !== 0) throw new Error('aggregate receipt candidate rows must be 0');
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMarkdown(relativePath, receipt) {
  const lines = [
    '# Agent 2 Token-Source Aggregate Gate-Proof Consumption Receipt',
    '',
    `Generated: ${receipt.generated_at}`,
    '',
    '| target | required Agent 1 fields | transform action once classified | exact blocker if not classified | handoff owner | stop condition |',
    '| --- | --- | --- | --- | --- | --- |',
    `| ${receipt.target} | metadata-only aggregate receipt plus Agent4 validator proof | consume as validator/prereq evidence only; no candidate-use or transform rows | no_candidate_rows_or_candidate_use_packet_from_aggregate | ${receipt.handoff_owner} | ${receipt.stop_condition} |`,
    '',
    '## Counts',
    '',
    `- Aggregate edge rows: ${receipt.counts.aggregate_edge_rows}.`,
    `- Matched token occurrences: ${receipt.counts.matched_token_occurrences}.`,
    `- Chunks merged: ${receipt.counts.chunks_merged}.`,
    '- Candidate/definition/lemma/reader-hint/answer/public/route/runtime rows: 0.',
    '',
    '## Blockers Preserved',
    '',
    ...receipt.blockers_preserved.map((blocker) => `- \`${blocker}\``),
    '',
    '## Non-Acceptance Boundary',
    '',
    ...receipt.non_acceptance_boundary.map((boundary) => `- ${boundary}`),
    '',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
}
