#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { once } from 'node:events';
import crypto from 'node:crypto';

const root = process.cwd();
const defaults = {
  manifest: 'reports/agent2-workbench-token-source-partition-edges-chunk-manifest-2026-06-04.json',
  output: '.local-cache/workbench-evidence/token-source-partition-edges-5000.jsonl',
  outputDir: null,
  summary: 'reports/workbench-token-source-partition-edges-5000-summary.json',
  report: 'reports/workbench-token-source-partition-edges-5000.md',
};
const options = parseArgs(process.argv.slice(2));
const manifest = readJson(options.manifest);
const issues = [];

expect(manifest.artifact_type === 'agent2_workbench_token_source_partition_edges_chunk_manifest', 'manifest artifact_type mismatch');
expect(Array.isArray(manifest.chunks) && manifest.chunks.length === manifest.chunk_count, 'manifest chunks length mismatch');

const missing = [];
const chunkSummaries = [];
for (const chunk of manifest.chunks || []) {
  const summaryPath = chunk.outputs?.summary;
  const edgesPath = chunk.outputs?.edges_jsonl;
  if (!summaryPath || !edgesPath || !exists(summaryPath) || !exists(edgesPath)) {
    missing.push({
      chunk_index: chunk.chunk_index,
      summary: summaryPath || null,
      edges_jsonl: edgesPath || null,
    });
    continue;
  }
  const summary = readJson(summaryPath);
  validateChunkSummary(summary, chunk);
  chunkSummaries.push({ chunk, summary });
}

if (missing.length) {
  fail([
    `missing ${missing.length} chunk output set(s); aggregate requires all ${manifest.chunk_count} chunks`,
    ...missing.slice(0, 10).map((row) => `chunk ${row.chunk_index}: ${row.summary}; ${row.edges_jsonl}`),
    missing.length > 10 ? `... ${missing.length - 10} additional missing chunk output set(s)` : null,
  ].filter(Boolean));
}
if (issues.length) fail(issues);

const tempOutput = options.outputDir ? null : `${options.output}.tmp`;
const tempSummary = `${options.summary}.tmp`;
const tempReport = `${options.report}.tmp`;
for (const staleTemp of [tempOutput, tempSummary, tempReport].filter(Boolean)) {
  fs.rmSync(path.join(root, staleTemp), { force: true });
}

const aggregateOutput = await buildBucketedAggregate(chunkSummaries, tempOutput);

const counts = chunkSummaries.reduce((acc, { summary }) => {
  for (const key of [
    'source_files_selected',
    'source_files_read',
    'units_read',
    'units_with_partition',
    'unjoined_units',
    'total_token_occurrences_scanned',
    'matched_token_occurrences',
  ]) {
    acc[key] = (acc[key] || 0) + Number(summary.counts?.[key] || 0);
  }
  return acc;
}, {});
counts.chunk_count = manifest.chunk_count;
counts.chunks_merged = chunkSummaries.length;
counts.aggregate_edge_rows = aggregateOutput.rowCount;

const summary = {
  schema_version: '1.0',
  artifact_type: 'workbench_token_source_partition_edges_aggregate_summary',
  status: 'nonpublic_token_source_partition_edges_aggregate_built_pre_agent6_boundary',
  generator: 'scripts/build_agent2_workbench_token_source_partition_edges_aggregate.mjs',
  inputs: {
    chunk_manifest: toRepoPath(options.manifest),
    source_file_count: manifest.source_file_count,
    chunk_count: manifest.chunk_count,
    chunk_size: manifest.chunk_size,
  },
  outputs: {
    ...(aggregateOutput.shards ? { edge_shards: aggregateOutput.shards.map(toRepoPath) } : { edges_jsonl: toRepoPath(options.output) }),
    summary: toRepoPath(options.summary),
    report: toRepoPath(options.report),
  },
  counts,
  zero_emission_counters: zeroCounters(),
  boundary: 'Nonpublic token-source-partition edge metadata only; no Definition authority, candidate text export, answer eligibility, public output, source/license acceptance, or route mutation.',
  handoff_owner: 'Agent 10 first; Spark-1 may run this aggregate only after all chunk outputs validate; Agent 6 only by exact boundary packet prepared through release owner.',
};
writeJson(tempSummary, summary);
writeReport(tempReport, summary);
if (!aggregateOutput.shards) fs.renameSync(path.join(root, tempOutput), path.join(root, options.output));
fs.renameSync(path.join(root, tempSummary), path.join(root, options.summary));
fs.renameSync(path.join(root, tempReport), path.join(root, options.report));
if (aggregateOutput.shards) {
  console.log(`wrote ${aggregateOutput.shards.length} shards to ${options.outputDir}`);
} else {
  console.log(`wrote ${options.output}`);
}
console.log(`wrote ${options.summary}`);
console.log(`wrote ${options.report}`);

async function buildBucketedAggregate(summaries, outputPath) {
  const bucketCount = Number(options.bucketCount || 256);
  const tempDir = outputPath ? `${outputPath}.buckets` : `${options.outputDir}.buckets`;
  const absoluteTempDir = path.join(root, tempDir);
  fs.rmSync(absoluteTempDir, { recursive: true, force: true });
  fs.mkdirSync(absoluteTempDir, { recursive: true });

  const bucketStreams = new Map();
  try {
    for (const { chunk } of summaries) {
      await bucketizeEdges(chunk.outputs.edges_jsonl, tempDir, bucketCount, bucketStreams);
    }
    for (const stream of bucketStreams.values()) {
      stream.end();
      await once(stream, 'finish');
    }
    bucketStreams.clear();
    if (options.outputDir) return await mergeBucketsToShards(tempDir, bucketCount, options.outputDir);
    return { rowCount: await mergeBuckets(tempDir, bucketCount, outputPath) };
  } finally {
    for (const stream of bucketStreams.values()) stream.destroy();
    fs.rmSync(absoluteTempDir, { recursive: true, force: true });
  }
}

async function mergeBucketsToShards(tempDir, bucketCount, outputDir) {
  const absoluteOutputDir = path.join(root, outputDir);
  const tempOutputDir = `${absoluteOutputDir}.tmp`;
  fs.rmSync(tempOutputDir, { recursive: true, force: true });
  fs.rmSync(absoluteOutputDir, { recursive: true, force: true });
  fs.mkdirSync(tempOutputDir, { recursive: true });
  let rowCount = 0;
  const shards = [];
  for (let bucket = 0; bucket < bucketCount; bucket += 1) {
    const bucketPath = path.join(root, tempDir, `${String(bucket).padStart(3, '0')}.jsonl`);
    if (!fs.existsSync(bucketPath)) continue;
    const edgeMap = new Map();
    const stream = fs.createReadStream(bucketPath, 'utf8');
    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
    for await (const line of rl) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const { key, row } = JSON.parse(trimmed);
      const current = edgeMap.get(key);
      if (!current) {
        edgeMap.set(key, { ...row, sample_source_refs: Array.from(new Set(row.sample_source_refs || [])).slice(0, 5) });
        continue;
      }
      current.occurrence_count += Number(row.occurrence_count || 0);
      current.sample_source_refs = Array.from(new Set([...(current.sample_source_refs || []), ...(row.sample_source_refs || [])])).slice(0, 5);
    }
    const rows = Array.from(edgeMap.values())
      .sort((a, b) => b.occurrence_count - a.occurrence_count || a.token_key.localeCompare(b.token_key));
    const shardName = `shard-${String(bucket).padStart(3, '0')}.jsonl`;
    const shardPath = path.join(tempOutputDir, shardName);
    const output = fs.createWriteStream(shardPath, { encoding: 'utf8', flags: 'wx' });
    for (const row of rows) {
      if (!output.write(`${JSON.stringify(row)}\n`)) await once(output, 'drain');
      rowCount += 1;
    }
    output.end();
    await once(output, 'finish');
    shards.push(toRepoPath(path.join(outputDir, shardName)));
  }
  fs.renameSync(tempOutputDir, absoluteOutputDir);
  return { rowCount, shards };
}

async function bucketizeEdges(relativePath, tempDir, bucketCount, bucketStreams) {
  const stream = fs.createReadStream(path.join(root, relativePath), 'utf8');
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const row = JSON.parse(trimmed);
    validateEdge(row, relativePath);
    const key = [row.token_key, row.source_name_partition_id, row.work_id || ''].join('|');
    const bucket = bucketForKey(key, bucketCount);
    let bucketStream = bucketStreams.get(bucket);
    if (!bucketStream) {
      const bucketPath = path.join(root, tempDir, `${String(bucket).padStart(3, '0')}.jsonl`);
      bucketStream = fs.createWriteStream(bucketPath, 'utf8');
      bucketStreams.set(bucket, bucketStream);
    }
    if (!bucketStream.write(`${JSON.stringify({ key, row })}\n`)) await once(bucketStream, 'drain');
  }
}

async function mergeBuckets(tempDir, bucketCount, outputPath) {
  const absoluteOutputPath = path.join(root, outputPath);
  fs.mkdirSync(path.dirname(absoluteOutputPath), { recursive: true });
  const tempOutputPath = `${absoluteOutputPath}.tmp`;
  fs.rmSync(tempOutputPath, { force: true });
  fs.rmSync(absoluteOutputPath, { force: true });
  const output = fs.createWriteStream(tempOutputPath, { encoding: 'utf8', flags: 'wx' });
  let rowCount = 0;
  try {
    for (let bucket = 0; bucket < bucketCount; bucket += 1) {
      const bucketPath = path.join(root, tempDir, `${String(bucket).padStart(3, '0')}.jsonl`);
      if (!fs.existsSync(bucketPath)) continue;
      const edgeMap = new Map();
      const stream = fs.createReadStream(bucketPath, 'utf8');
      const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
      for await (const line of rl) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const { key, row } = JSON.parse(trimmed);
        const current = edgeMap.get(key);
        if (!current) {
          edgeMap.set(key, { ...row, sample_source_refs: Array.from(new Set(row.sample_source_refs || [])).slice(0, 5) });
          continue;
        }
        current.occurrence_count += Number(row.occurrence_count || 0);
        current.sample_source_refs = Array.from(new Set([...(current.sample_source_refs || []), ...(row.sample_source_refs || [])])).slice(0, 5);
      }
      const rows = Array.from(edgeMap.values())
        .sort((a, b) => b.occurrence_count - a.occurrence_count || a.token_key.localeCompare(b.token_key));
      for (const row of rows) {
        if (!output.write(`${JSON.stringify(row)}\n`)) await once(output, 'drain');
        rowCount += 1;
      }
    }
  } finally {
    output.end();
    await once(output, 'finish');
  }
  fs.renameSync(tempOutputPath, absoluteOutputPath);
  return rowCount;
}

function bucketForKey(key, bucketCount) {
  const digest = crypto.createHash('sha256').update(key).digest();
  return digest.readUInt32BE(0) % bucketCount;
}

async function readEdges(relativePath, edgeMap) {
  const stream = fs.createReadStream(path.join(root, relativePath), 'utf8');
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const row = JSON.parse(trimmed);
    validateEdge(row, relativePath);
    const key = [row.token_key, row.source_name_partition_id, row.work_id || ''].join('|');
    const current = edgeMap.get(key);
    if (!current) {
      edgeMap.set(key, { ...row, sample_source_refs: Array.from(new Set(row.sample_source_refs || [])).slice(0, 5) });
      continue;
    }
    current.occurrence_count += Number(row.occurrence_count || 0);
    current.sample_source_refs = Array.from(new Set([...(current.sample_source_refs || []), ...(row.sample_source_refs || [])])).slice(0, 5);
  }
}

function validateEdge(row, sourcePath) {
  for (const field of [
    'token_key',
    'token_normalized',
    'work_id',
    'source_name',
    'source_family',
    'license_label',
    'license_lane',
    'source_name_partition_id',
    'occurrence_count',
  ]) {
    expect(row[field] !== undefined && row[field] !== null && row[field] !== '', `${sourcePath} edge missing ${field}`);
  }
  expect(row.answer_eligible === false, `${sourcePath} edge answer_eligible must be false`);
  expect(row.public_emit === false, `${sourcePath} edge public_emit must be false`);
  expect(row.definition_content_storage_now === false, `${sourcePath} edge definition_content_storage_now must be false`);
  expect(row.candidate_text_export_now === false, `${sourcePath} edge candidate_text_export_now must be false`);
}

function validateChunkSummary(summary, chunk) {
  expect(summary.artifact_type === 'workbench_token_source_partition_edges_summary', `chunk ${chunk.chunk_index} summary artifact_type mismatch`);
  expect(summary.outputs?.edges_jsonl === chunk.outputs?.edges_jsonl, `chunk ${chunk.chunk_index} edge output mismatch`);
  expect(summary.counts?.source_file_offset === chunk.source_file_offset, `chunk ${chunk.chunk_index} offset mismatch`);
  expect(summary.counts?.source_files_selected === chunk.source_file_limit, `chunk ${chunk.chunk_index} selected count mismatch`);
  expect(summary.counts?.source_files_read === chunk.source_file_limit, `chunk ${chunk.chunk_index} read count mismatch`);
  for (const [key, value] of Object.entries(summary.zero_emission_counters || {})) {
    expect(value === 0, `chunk ${chunk.chunk_index} zero_emission_counters.${key} must be 0`);
  }
}

function writeReport(relativePath, summary) {
  const lines = [
    '# Agent 2 Workbench Token Source Partition Edges Aggregate',
    '',
    '## Status',
    '',
    summary.status,
    '',
    '## Counts',
    '',
    `- chunk_count: ${summary.counts.chunk_count}`,
    `- chunks_merged: ${summary.counts.chunks_merged}`,
    `- source_files_read: ${summary.counts.source_files_read}`,
    `- matched_token_occurrences: ${summary.counts.matched_token_occurrences}`,
    `- aggregate_edge_rows: ${summary.counts.aggregate_edge_rows}`,
    '',
    '## Zero Boundary',
    '',
    '- answer_rows: 0',
    '- public_reader_output_rows: 0',
    '- route_jsonl_rows: 0',
    '- route_shard_writes: 0',
    '- definition_content_rows: 0',
    '- candidate_text_export_rows: 0',
    '- accepted_text_rows: 0',
    '',
    '## Handoff',
    '',
    summary.handoff_owner,
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function zeroCounters() {
  return {
    answer_rows: 0,
    answer_eligible_rows: 0,
    public_reader_output_rows: 0,
    route_jsonl_rows: 0,
    route_shard_writes: 0,
    definition_content_rows: 0,
    candidate_text_export_rows: 0,
    accepted_text_rows: 0,
    public_runtime_mutation: 0,
  };
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    const match = arg.match(/^--([^=]+)=(.*)$/);
    if (!match) continue;
    const [, key, value] = match;
    if (key === 'manifest') parsed.manifest = value;
    if (key === 'output') parsed.output = value;
    if (key === 'output-dir') parsed.outputDir = value;
    if (key === 'summary') parsed.summary = value;
    if (key === 'report') parsed.report = value;
    if (key === 'bucket-count') parsed.bucketCount = value;
  }
  return parsed;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  writeText(relativePath, `${JSON.stringify(value, null, 2)}\n`);
}

async function writeJsonl(relativePath, rows) {
  const absolutePath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  const stream = fs.createWriteStream(absolutePath, 'utf8');
  for (const row of rows) {
    if (!stream.write(`${JSON.stringify(row)}\n`)) await once(stream, 'drain');
  }
  stream.end();
  await once(stream, 'finish');
}

function writeText(relativePath, value) {
  const absolutePath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, value);
}

function toRepoPath(value) {
  return String(value).replaceAll('\\', '/');
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}

function fail(messages) {
  console.error(`Agent 2 token source partition edge aggregate build blocked with ${messages.length} issue(s):`);
  for (const message of messages) console.error(`- ${message}`);
  process.exit(1);
}
