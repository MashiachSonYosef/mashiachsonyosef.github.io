#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const output = 'reports/agent2-workbench-token-source-partition-edges-aggregate-readiness-2026-06-04.json';
const report = 'reports/agent2-workbench-token-source-partition-edges-aggregate-readiness-2026-06-04.md';
const manifestPath = 'reports/agent2-workbench-token-source-partition-edges-chunk-manifest-2026-06-04.json';
const pilotSummaryPath = 'reports/workbench-token-source-partition-edges-5000-pilot25-summary.json';
const manifest = readJson(manifestPath);
const pilotSummary = readJson(pilotSummaryPath);

const missingChunks = [];
const presentChunks = [];
for (const chunk of manifest.chunks || []) {
  const hasSummary = exists(chunk.outputs?.summary);
  const hasEdges = exists(chunk.outputs?.edges_jsonl);
  if (hasSummary && hasEdges) presentChunks.push(chunk.chunk_index);
  else missingChunks.push({
    chunk_index: chunk.chunk_index,
    summary: chunk.outputs?.summary || null,
    edges_jsonl: chunk.outputs?.edges_jsonl || null,
    build: chunk.build,
    validate: chunk.validate,
  });
}

const artifact = {
  schema_version: '1.0',
  artifact_type: 'agent2_workbench_token_source_partition_edges_aggregate_readiness',
  date: '2026-06-04',
  mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / Option C HYBRID',
  status: missingChunks.length
    ? 'aggregate_blocked_until_chunk_outputs_exist'
    : 'aggregate_ready_to_run',
  target: 'nonpublic token-source-partition edge aggregate over the 5000-token workbench inventory',
  files: {
    current_handoff: 'reports/agent2-weekly-lexicon-current-handoff-bundle-2026-06-04.md',
    spark1_manifest: 'reports/agent2-spark1-runnable-command-manifest-2026-06-04.json',
    chunk_manifest: manifestPath,
    aggregate_builder: 'scripts/build_agent2_workbench_token_source_partition_edges_aggregate.mjs',
    aggregate_validator: 'scripts/validate_agent2_workbench_token_source_partition_edges_aggregate.mjs',
    readiness_builder: 'scripts/build_agent2_workbench_token_source_partition_edges_aggregate_readiness.mjs',
    readiness_validator: 'scripts/validate_agent2_workbench_token_source_partition_edges_aggregate_readiness.mjs',
    readiness_output: output,
    readiness_report: report,
  },
  exact_command_script_to_run: {
    aggregate_build: 'node scripts/build_agent2_workbench_token_source_partition_edges_aggregate.mjs --manifest=reports/agent2-workbench-token-source-partition-edges-chunk-manifest-2026-06-04.json --output=.local-cache/workbench-evidence/token-source-partition-edges-5000.jsonl --summary=reports/workbench-token-source-partition-edges-5000-summary.json --report=reports/workbench-token-source-partition-edges-5000.md',
    aggregate_validate: 'node scripts/validate_agent2_workbench_token_source_partition_edges_aggregate.mjs reports/workbench-token-source-partition-edges-5000-summary.json',
    readiness_validate: 'node scripts/validate_agent2_workbench_token_source_partition_edges_aggregate_readiness.mjs reports/agent2-workbench-token-source-partition-edges-aggregate-readiness-2026-06-04.json',
  },
  output_artifact: {
    aggregate_edges_jsonl: '.local-cache/workbench-evidence/token-source-partition-edges-5000.jsonl',
    aggregate_summary: 'reports/workbench-token-source-partition-edges-5000-summary.json',
    aggregate_report: 'reports/workbench-token-source-partition-edges-5000.md',
  },
  schema_counts: {
    source_file_count: manifest.source_file_count,
    chunk_size: manifest.chunk_size,
    expected_chunk_count: manifest.chunk_count,
    present_chunk_output_sets: presentChunks.length,
    missing_chunk_output_sets: missingChunks.length,
    pilot_equivalent_chunk_validated: true,
    pilot_source_files_read: pilotSummary.counts?.source_files_read,
    pilot_edge_rows: pilotSummary.counts?.edge_rows,
    pilot_matched_token_occurrences: pilotSummary.counts?.matched_token_occurrences,
    candidate_rows: 0,
    answer_eligible_rows: 0,
    public_reader_output_rows: 0,
    route_jsonl_rows: 0,
    route_shard_writes: 0,
    definition_content_rows: 0,
    candidate_text_export_rows: 0,
  },
  validator: {
    readiness: 'node scripts/validate_agent2_workbench_token_source_partition_edges_aggregate_readiness.mjs reports/agent2-workbench-token-source-partition-edges-aggregate-readiness-2026-06-04.json',
    aggregate_after_chunks: 'node scripts/validate_agent2_workbench_token_source_partition_edges_aggregate.mjs reports/workbench-token-source-partition-edges-5000-summary.json',
  },
  missing_field_blocker: missingChunks.length
    ? `missing_${missingChunks.length}_chunk_output_sets_before_full_token_source_partition_edge_aggregate`
    : 'none',
  missing_chunks: missingChunks,
  handoff_owner: 'Agent 10 first for release/package intake; Spark-1 may execute the 54 chunk commands and aggregate commands if selected; Agent 6 only through exact boundary packet prepared by release owner.',
  stop_condition: 'Return this readiness packet now; do not emit candidate text or public/answer rows. Full aggregate runs only after all 54 chunk output sets exist and validate.',
  zero_boundary: {
    definition_authority: false,
    usage_as_definition_authority: false,
    answer_acceptance: false,
    answer_eligible: false,
    accepted_gloss_text: false,
    public_reader_output: false,
    route_shard_edit: false,
    public_runtime_mutation: false,
    publication_readiness: false,
    source_license_acceptance: false,
    qa_acceptance: false,
    definition_content_storage: false,
    candidate_text_export: false,
    nc_commercial_authorization: false,
  },
};

writeJson(output, artifact);
writeReport(report, artifact);
console.log(`wrote ${output}`);
console.log(`wrote ${report}`);

function writeReport(relativePath, artifact) {
  const lines = [
    '# Agent 2 Workbench Token Source Partition Edges Aggregate Readiness - 2026-06-04',
    '',
    '## Status',
    '',
    artifact.status,
    '',
    '## Required Task Shape',
    '',
    `- target: ${artifact.target}`,
    `- files: ${Object.values(artifact.files).join('; ')}`,
    `- exact command/script to run: ${artifact.exact_command_script_to_run.aggregate_build}`,
    `- output artifact: ${artifact.output_artifact.aggregate_summary}`,
    `- schema/counts: ${artifact.schema_counts.expected_chunk_count} expected chunks; ${artifact.schema_counts.present_chunk_output_sets} present chunk output sets; ${artifact.schema_counts.missing_chunk_output_sets} missing chunk output sets; pilot ${artifact.schema_counts.pilot_edge_rows} edge rows; candidate rows 0`,
    `- validator: ${artifact.validator.readiness}`,
    `- missing-field blocker: ${artifact.missing_field_blocker}`,
    `- handoff owner: ${artifact.handoff_owner}`,
    `- stop condition: ${artifact.stop_condition}`,
    '',
    '## Zero Boundary',
    '',
    'No Definition authority, answer eligibility, accepted gloss/text, public reader output, route-shard edit, public/runtime mutation, source/license acceptance, publication readiness, candidate text export, or NC commercial authorization is claimed.',
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  writeText(relativePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(relativePath, value) {
  const absolutePath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}

function exists(relativePath) {
  return typeof relativePath === 'string' && fs.existsSync(path.join(root, relativePath));
}
