#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const gateProofPath = 'reports/agent4-agent2-token-source-partition-edges-aggregate-gate-proof-2026-06-05.json';
const agent10ConsumptionPath = 'reports/agent10-agent2-agent4-fresh-output-consumption-2026-06-05.json';
const outputPath = 'reports/agent2-token-source-aggregate-consumption-receipt-2026-06-05.json';
const markdownPath = 'reports/agent2-token-source-aggregate-consumption-receipt-2026-06-05.md';

const gateProof = readJson(gateProofPath);
const agent10Consumption = readJson(agent10ConsumptionPath);
assertInputs(gateProof, agent10Consumption);

const aggregateConsumption = agent10Consumption.consumed_outputs.find(
  (entry) => entry.package_workset === 'agent2_workbench_token_source_partition_edges_aggregate',
);

const receipt = {
  schema_version: '1.0',
  artifact_type: 'agent2_token_source_aggregate_consumption_receipt',
  generated_at: '2026-06-05T13:52:00.000Z',
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / source-lane separated lexicon expansion',
  target: 'Agent2 token-source partition aggregate consumption',
  status: 'token_source_aggregate_consumed_as_nonpublic_metadata_evidence_only',
  inputs: {
    agent4_gate_proof: gateProofPath,
    agent10_consumption: agent10ConsumptionPath,
    aggregate_summary: gateProof.files.aggregate_summary,
    aggregate_report: gateProof.files.aggregate_report,
  },
  counts: {
    source_files_selected: gateProof.counts.source_files_selected,
    source_files_read: gateProof.counts.source_files_read,
    units_read: gateProof.counts.units_read,
    units_with_partition: gateProof.counts.units_with_partition,
    unjoined_units: gateProof.counts.unjoined_units,
    total_token_occurrences_scanned: gateProof.counts.total_token_occurrences_scanned,
    matched_token_occurrences: gateProof.counts.matched_token_occurrences,
    chunk_count: gateProof.counts.chunk_count,
    chunks_merged: gateProof.counts.chunks_merged,
    aggregate_edge_rows: gateProof.counts.aggregate_edge_rows,
    aggregate_shard_count: gateProof.counts.aggregate_shard_count,
    candidate_rows: 0,
    answer_rows: 0,
    answer_eligible_rows: 0,
    public_reader_output_rows: 0,
    route_jsonl_rows: 0,
    route_shard_writes: 0,
    definition_content_rows: 0,
    candidate_text_export_rows: 0,
    accepted_text_rows: 0,
    public_runtime_mutation: 0,
  },
  agent10_consumption_state: {
    validator_result: aggregateConsumption.validator_result,
    release_relevance: aggregateConsumption.release_relevance,
    exact_blocker: aggregateConsumption.exact_blocker,
    agent6_boundary_question: aggregateConsumption.agent6_boundary_question,
    next_handoff: aggregateConsumption.next_handoff,
  },
  blockers_preserved: [
    'no_candidate_rows_or_candidate_use_packet_from_aggregate',
    'aggregate_is_nonpublic_token_source_partition_metadata_only',
    'separate_exact_boundary_required_for_any_candidate_use_answer_public_runtime_or_release_use',
  ],
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
  highest_permissible_claim: 'Agent2 may use the aggregate as nonpublic token-source partition metadata evidence only.',
  handoff_owner: 'Agent 2 definer retains metadata-only aggregate evidence; Agent10/Agent6 require a separate exact candidate-use packet before any downstream use.',
  stop_condition: 'Stop at aggregate consumption receipt. Do not derive candidate text, definition content, answer rows, public output, route writes, accepted text, export rows, or release artifacts from aggregate metadata alone.',
  non_acceptance_boundary: [
    'No Definition authority',
    'No answer acceptance',
    'No source/license/legal acceptance',
    'No accepted gloss/text',
    'No public/runtime mutation',
    'No route-shard edit',
    'No candidate text export',
    'No NC commercial authorization',
    'No release action',
  ],
};

writeJson(outputPath, receipt);
writeMarkdown(markdownPath, receipt);
console.log(`wrote ${outputPath}`);
console.log(`wrote ${markdownPath}`);

function assertInputs(gateProof, agent10Consumption) {
  if (gateProof.artifact_type !== 'agent4_validator_prereq_gate_proof') throw new Error('gate proof artifact_type mismatch');
  if (gateProof.target !== 'agent2-workbench-token-source-partition-edges-aggregate') throw new Error('gate proof target mismatch');
  if (gateProof.result !== 'aggregate_built_and_validated_sharded_output') throw new Error('gate proof result mismatch');
  if (gateProof.counts.aggregate_edge_rows !== 1951013) throw new Error('aggregate edge rows mismatch');
  if (gateProof.counts.candidate_rows !== 0) throw new Error('gate proof candidate rows must be 0');
  if (agent10Consumption.artifact_type !== 'agent10_agent2_agent4_fresh_output_consumption') throw new Error('Agent10 consumption artifact_type mismatch');
  const aggregate = agent10Consumption.consumed_outputs.find((entry) => entry.package_workset === 'agent2_workbench_token_source_partition_edges_aggregate');
  if (!aggregate) throw new Error('Agent10 aggregate consumption missing');
  if (aggregate.exact_blocker !== 'no_candidate_rows_or_candidate_use_packet_from_aggregate') throw new Error('Agent10 aggregate exact blocker mismatch');
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMarkdown(relativePath, receipt) {
  const lines = [
    '# Agent 2 Token-Source Aggregate Consumption Receipt',
    '',
    `Generated: ${receipt.generated_at}`,
    '',
    '| target | required Agent 1 fields | transform action once classified | exact blocker if not classified | handoff owner | stop condition |',
    '| --- | --- | --- | --- | --- | --- |',
    `| ${receipt.target} | token-source partition metadata plus source-lane-preserving future target | consume aggregate as nonpublic metadata evidence only; no candidate rows | no_candidate_rows_or_candidate_use_packet_from_aggregate | ${receipt.handoff_owner} | ${receipt.stop_condition} |`,
    '',
    '## Counts',
    '',
    `- Aggregate edge rows: ${receipt.counts.aggregate_edge_rows}.`,
    `- Matched token occurrences: ${receipt.counts.matched_token_occurrences}.`,
    `- Source files read: ${receipt.counts.source_files_read}.`,
    `- Chunks merged: ${receipt.counts.chunks_merged}.`,
    '- Candidate/definition/lemma/reader-hint/answer/public/route/runtime rows: 0.',
    '',
    '## Agent10 State',
    '',
    `- Exact blocker: \`${receipt.agent10_consumption_state.exact_blocker}\`.`,
    `- Agent6 boundary question: ${receipt.agent10_consumption_state.agent6_boundary_question}.`,
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
