import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const outputJson = 'reports/agent2-workbench-token-source-partition-edges-chunk-manifest-2026-06-04.json';
const outputMd = 'reports/agent2-workbench-token-source-partition-edges-chunk-manifest-2026-06-04.md';
const sourceFiles = execFileSync('git', ['ls-files', '--', 'data/sources/*.json'], { cwd: root, encoding: 'utf8' })
  .split(/\r?\n/)
  .filter(Boolean)
  .sort();
const chunkSize = 25;
const chunks = [];

for (let offset = 0; offset < sourceFiles.length; offset += chunkSize) {
  const chunkIndex = chunks.length + 1;
  const size = Math.min(chunkSize, sourceFiles.length - offset);
  const suffix = String(chunkIndex).padStart(3, '0');
  const output = `.local-cache/workbench-evidence/token-source-partition-edges-5000-chunk-${suffix}.jsonl`;
  const summary = `reports/workbench-token-source-partition-edges-5000-chunk-${suffix}-summary.json`;
  const report = `reports/workbench-token-source-partition-edges-5000-chunk-${suffix}.md`;
  chunks.push({
    chunk_index: chunkIndex,
    source_file_offset: offset,
    source_file_limit: size,
    first_source_file: sourceFiles[offset],
    last_source_file: sourceFiles[offset + size - 1],
    build: `node scripts/build_agent2_workbench_token_source_partition_edges.mjs --source-file-offset=${offset} --source-file-limit=${size} --output=${output} --summary=${summary} --report=${report}`,
    validate: `node scripts/validate_agent2_workbench_token_source_partition_edges.mjs ${summary}`,
    outputs: { edges_jsonl: output, summary, report },
  });
}

const manifest = {
  schema_version: '1.0',
  artifact_type: 'agent2_workbench_token_source_partition_edges_chunk_manifest',
  date: '2026-06-04',
  mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / Option C HYBRID',
  status: 'spark1_runnable_chunk_manifest_for_nonpublic_token_source_partition_edges',
  target: 'chunked full build of token-source-partition edge metadata over the 5000-token inventory',
  source_file_count: sourceFiles.length,
  chunk_size: chunkSize,
  chunk_count: chunks.length,
  pilot_chunk_equivalent: {
    source_file_offset: 0,
    source_file_limit: 25,
    validated_summary: 'reports/workbench-token-source-partition-edges-5000-pilot25-summary.json',
    validated_edge_rows: 21728,
  },
  chunks,
  aggregate_output_contract: {
    expected_command_after_all_chunks_validate: 'Concatenate chunk edge JSONL files, then dedupe by token_key|source_name_partition_id|work_id summing occurrence_count; no candidate text generation.',
    required_aggregate_output: '.local-cache/workbench-evidence/token-source-partition-edges-5000.jsonl',
    required_aggregate_summary: 'reports/workbench-token-source-partition-edges-5000-summary.json',
    aggregate_validator_needed: 'scripts/validate_agent2_workbench_token_source_partition_edges_aggregate.mjs',
  },
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
  },
  handoff_owner: 'Agent 10 first; Spark-1 for chunk execution if selected; Agent 6 only by exact boundary packet prepared through release owner',
  stop_condition: 'Stop after chunk manifest validation or after all chunk summaries validate and aggregate contract is authored; no Definition/answer/public rows may be emitted.',
};

assertManifest(manifest);
writeJson(outputJson, manifest);
writeMd(outputMd, manifest);
console.log(`wrote ${outputJson}`);
console.log(`wrote ${outputMd}`);

function assertManifest(value) {
  if (value.source_file_count !== 1337) throw new Error('expected 1337 source files');
  if (value.chunk_count !== 54) throw new Error('expected 54 chunks');
  if (value.chunks[0].source_file_offset !== 0 || value.chunks[0].source_file_limit !== 25) throw new Error('first chunk mismatch');
  const last = value.chunks.at(-1);
  if (last.source_file_offset !== 1325 || last.source_file_limit !== 12) throw new Error('last chunk mismatch');
  for (const boundary of Object.values(value.zero_boundary)) {
    if (boundary !== false) throw new Error('zero boundary must remain false');
  }
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMd(relativePath, value) {
  const lines = [
    '# Agent 2 Workbench Token Source Partition Edges Chunk Manifest - 2026-06-04',
    '',
    `Status: ${value.status}.`,
    '',
    '## Counts',
    `- Source files: ${value.source_file_count}.`,
    `- Chunk size: ${value.chunk_size}.`,
    `- Chunk count: ${value.chunk_count}.`,
    `- Validated pilot equivalent: offset ${value.pilot_chunk_equivalent.source_file_offset}, limit ${value.pilot_chunk_equivalent.source_file_limit}, edge rows ${value.pilot_chunk_equivalent.validated_edge_rows}.`,
    '',
    '## First Command',
    `- Build: \`${value.chunks[0].build}\`.`,
    `- Validate: \`${value.chunks[0].validate}\`.`,
    '',
    '## Last Command',
    `- Build: \`${value.chunks.at(-1).build}\`.`,
    `- Validate: \`${value.chunks.at(-1).validate}\`.`,
    '',
    '## Aggregate Contract',
    value.aggregate_output_contract.expected_command_after_all_chunks_validate,
    '',
    '## Handoff Owner',
    value.handoff_owner,
    '',
    '## Stop Condition',
    value.stop_condition,
    '',
    '## Boundary',
    'Nonpublic source-partition edge metadata only. No Definition authority, answer eligibility, accepted text, candidate text export, source/license acceptance, public output, route-shard edit, public/runtime mutation, or publication readiness is claimed.',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
}
