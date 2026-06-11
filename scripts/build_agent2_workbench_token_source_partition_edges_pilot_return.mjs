import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const summaryPath = 'reports/workbench-token-source-partition-edges-5000-pilot25-summary.json';
const outputJson = 'reports/agent2-workbench-token-source-partition-edges-pilot-return-2026-06-04.json';
const outputMd = 'reports/agent2-workbench-token-source-partition-edges-pilot-return-2026-06-04.md';
const summary = readJson(summaryPath);

const artifact = {
  schema_version: '1.0',
  artifact_type: 'agent2_workbench_token_source_partition_edges_pilot_return',
  date: '2026-06-04',
  mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / Option C HYBRID',
  status: 'nonpublic_token_source_partition_edges_pilot_built_full_build_runtime_blocked',
  target: 'bounded pilot for token-source-partition edge generation over the 5000-token inventory',
  files: {
    builder: 'scripts/build_agent2_workbench_token_source_partition_edges.mjs',
    validator: 'scripts/validate_agent2_workbench_token_source_partition_edges.mjs',
    pilot_edges_jsonl: summary.outputs.edges_jsonl,
    pilot_summary: summaryPath,
    pilot_report: summary.outputs.report,
    output_json: outputJson,
    output_md: outputMd,
  },
  exact_command_or_script: {
    pilot_build: 'node scripts/build_agent2_workbench_token_source_partition_edges.mjs --source-file-limit=25 --output=.local-cache/workbench-evidence/token-source-partition-edges-5000-pilot25.jsonl --summary=reports/workbench-token-source-partition-edges-5000-pilot25-summary.json --report=reports/workbench-token-source-partition-edges-5000-pilot25.md',
    pilot_validate: `node scripts/validate_agent2_workbench_token_source_partition_edges.mjs ${summaryPath}`,
    full_build: 'node scripts/build_agent2_workbench_token_source_partition_edges.mjs',
    full_validate: 'node scripts/validate_agent2_workbench_token_source_partition_edges.mjs reports/workbench-token-source-partition-edges-5000-summary.json',
  },
  schema_counts: {
    source_file_limit: summary.inputs.source_file_limit,
    source_files_read: summary.counts.source_files_read,
    units_read: summary.counts.units_read,
    units_with_partition: summary.counts.units_with_partition,
    unjoined_units: summary.counts.unjoined_units,
    token_occurrences_scanned: summary.counts.total_token_occurrences_scanned,
    matched_token_occurrences: summary.counts.matched_token_occurrences,
    edge_rows: summary.counts.edge_rows,
  },
  full_build_blocker: {
    id: 'full_5000_token_source_partition_edge_build_exceeded_300_second_local_run_limit',
    observed_command: 'node scripts/build_agent2_workbench_token_source_partition_edges.mjs',
    observed_result: 'timed_out_after_300_seconds_before_validated_full_summary',
    next_action: 'Run full_build in Spark-1 or a long-running worker, then validate full summary.',
  },
  transform_candidate_counts: {
    definition_candidate_rows: 0,
    reader_hint_candidate_rows: 0,
    lemma_candidate_rows: 0,
    candidate_text_rows: 0,
    answer_eligible_rows: 0,
    public_emit_rows: 0,
  },
  zero_emission_counters: summary.zero_emission_counters,
  handoff_owner: 'Agent 10 first; Spark-1 for full edge build if selected; Agent 6 only by exact boundary packet prepared through release owner',
  stop_condition: 'Stop after pilot edge build/validation; do not infer full edge coverage or candidate rows until the full build summary validates.',
};

assertArtifact(artifact);
writeJson(outputJson, artifact);
writeMd(outputMd, artifact);
console.log(`wrote ${outputJson}`);
console.log(`wrote ${outputMd}`);

function assertArtifact(value) {
  if (value.schema_counts.source_file_limit !== 25) throw new Error('expected source file limit 25');
  if (value.schema_counts.edge_rows !== 21728) throw new Error('expected 21728 pilot edge rows');
  for (const count of Object.values(value.transform_candidate_counts)) {
    if (count !== 0) throw new Error('candidate counts must remain 0');
  }
  for (const count of Object.values(value.zero_emission_counters)) {
    if (count !== 0) throw new Error('zero emission counters must remain 0');
  }
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMd(relativePath, value) {
  const lines = [
    '# Agent 2 Workbench Token Source Partition Edges Pilot Return - 2026-06-04',
    '',
    `Status: ${value.status}.`,
    '',
    '## Commands',
    `- Pilot build: \`${value.exact_command_or_script.pilot_build}\`.`,
    `- Pilot validate: \`${value.exact_command_or_script.pilot_validate}\`.`,
    `- Full build: \`${value.exact_command_or_script.full_build}\`.`,
    `- Full validate: \`${value.exact_command_or_script.full_validate}\`.`,
    '',
    '## Counts',
    `- Source files read: ${value.schema_counts.source_files_read}.`,
    `- Units read / joined / unjoined: ${value.schema_counts.units_read} / ${value.schema_counts.units_with_partition} / ${value.schema_counts.unjoined_units}.`,
    `- Token occurrences scanned / matched: ${value.schema_counts.token_occurrences_scanned} / ${value.schema_counts.matched_token_occurrences}.`,
    `- Pilot edge rows: ${value.schema_counts.edge_rows}.`,
    '- Definition, lemma, reader-hint, candidate-text, answer-eligible, and public-emission rows: 0.',
    '',
    '## Full-Build Blocker',
    `${value.full_build_blocker.id}: ${value.full_build_blocker.observed_result}.`,
    '',
    '## Handoff Owner',
    value.handoff_owner,
    '',
    '## Stop Condition',
    value.stop_condition,
    '',
    '## Boundary',
    'Nonpublic edge metadata only. No Definition authority, answer eligibility, accepted text, candidate text export, source/license acceptance, public output, route-shard edit, public/runtime mutation, or publication readiness is claimed.',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
}
