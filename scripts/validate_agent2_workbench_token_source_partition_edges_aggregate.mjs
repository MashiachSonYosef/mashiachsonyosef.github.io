#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const root = process.cwd();
const summaryPath = process.argv[2] || 'reports/workbench-token-source-partition-edges-5000-summary.json';
const summary = readJson(summaryPath);
const issues = [];

expect(summary.schema_version === '1.0', 'schema_version must be 1.0');
expect(summary.artifact_type === 'workbench_token_source_partition_edges_aggregate_summary', 'artifact_type mismatch');
expect(summary.status === 'nonpublic_token_source_partition_edges_aggregate_built_pre_agent6_boundary', 'status mismatch');
expect(summary.inputs?.chunk_manifest === 'reports/agent2-workbench-token-source-partition-edges-chunk-manifest-2026-06-04.json', 'chunk_manifest mismatch');
expect(summary.counts?.chunk_count === 54, 'chunk_count must be 54');
expect(summary.counts?.chunks_merged === 54, 'chunks_merged must be 54');
expect(summary.counts?.source_files_read === 1337, 'source_files_read must be 1337');
expect(Number.isInteger(summary.counts?.aggregate_edge_rows) && summary.counts.aggregate_edge_rows > 0, 'aggregate_edge_rows must be positive');
const outputFiles = getOutputFiles(summary);
expect(outputFiles.length > 0, 'aggregate output file list must be non-empty');
for (const outputFile of outputFiles) {
  expect(outputFile.endsWith('.jsonl'), `${outputFile} must be jsonl`);
  expect(exists(outputFile), `${outputFile} output file must exist`);
}

for (const [key, value] of Object.entries(summary.zero_emission_counters || {})) {
  expect(value === 0, `zero_emission_counters.${key} must be 0`);
}
expect(/no Definition authority/i.test(summary.boundary || ''), 'boundary must reject Definition authority');
expect(/candidate text export/i.test(summary.boundary || ''), 'boundary must reject candidate text export');
expect(/Agent 10 first/.test(summary.handoff_owner || ''), 'handoff_owner must name Agent 10 first');

if (!issues.length) await validateEdgeSample(outputFiles[0]);
if (!issues.length) {
  let lineCount = 0;
  for (const outputFile of outputFiles) lineCount += await countJsonlLines(outputFile);
  expect(lineCount === summary.counts.aggregate_edge_rows, `aggregate JSONL line count ${lineCount} must equal summary aggregate_edge_rows ${summary.counts.aggregate_edge_rows}`);
}

if (issues.length) {
  console.error(`Agent 2 token source partition edge aggregate validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 2 token source partition edge aggregate validation passed. Chunks: ${summary.counts.chunks_merged}; source files: ${summary.counts.source_files_read}; aggregate rows: ${summary.counts.aggregate_edge_rows}; candidate rows: 0.`);

async function validateEdgeSample(relativePath) {
  const stream = fs.createReadStream(path.join(root, relativePath), 'utf8');
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  let sampled = 0;
  const seen = new Set();
  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const row = JSON.parse(trimmed);
    const key = [row.token_key, row.source_name_partition_id, row.work_id || ''].join('|');
    expect(!seen.has(key), `duplicate aggregate edge key: ${key}`);
    seen.add(key);
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
      expect(row[field] !== undefined && row[field] !== null && row[field] !== '', `edge missing ${field}`);
    }
    expect(row.answer_eligible === false, 'edge answer_eligible must be false');
    expect(row.public_emit === false, 'edge public_emit must be false');
    expect(row.definition_content_storage_now === false, 'edge definition_content_storage_now must be false');
    expect(row.candidate_text_export_now === false, 'edge candidate_text_export_now must be false');
    sampled += 1;
    if (sampled >= 1000) {
      rl.close();
      stream.destroy();
      break;
    }
  }
  expect(sampled > 0, 'edge sample must contain at least one row');
}

async function countJsonlLines(relativePath) {
  const stream = fs.createReadStream(path.join(root, relativePath), { highWaterMark: 1024 * 1024 });
  let lines = 0;
  for await (const chunk of stream) {
    for (let index = 0; index < chunk.length; index += 1) {
      if (chunk[index] === 10) lines += 1;
    }
  }
  return lines;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function exists(relativePath) {
  return typeof relativePath === 'string' && fs.existsSync(path.join(root, relativePath));
}

function getOutputFiles(summary) {
  if (typeof summary.outputs?.edges_jsonl === 'string') return [summary.outputs.edges_jsonl];
  if (Array.isArray(summary.outputs?.edge_shards)) return summary.outputs.edge_shards;
  return [];
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}
