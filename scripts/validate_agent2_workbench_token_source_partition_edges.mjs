#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const root = process.cwd();
const summaryPath = cleanRelativePath(process.argv[2] || 'reports/workbench-token-source-partition-edges-5000-summary.json');
const summary = readJson(summaryPath);
const issues = [];

expect(summary.schema_version === '1.0', 'schema_version must be 1.0');
expect(summary.artifact_type === 'workbench_token_source_partition_edges_summary', 'artifact_type mismatch');
expect(summary.status === 'nonpublic_token_source_partition_edges_built_pre_agent6_boundary', 'status mismatch');
expect(summary.counts?.limit_tokens === 5000, 'limit_tokens must be 5000');
expect(Number.isInteger(summary.counts?.edge_rows) && summary.counts.edge_rows >= 0, 'edge_rows must be nonnegative');
expect(Number.isInteger(summary.counts?.matched_token_occurrences) && summary.counts.matched_token_occurrences >= 0, 'matched_token_occurrences must be nonnegative');

for (const [key, value] of Object.entries(summary.zero_emission_counters || {})) {
  expect(value === 0, `zero_emission_counters.${key} must be 0`);
}

const edgesPath = summary.outputs?.edges_jsonl;
expect(typeof edgesPath === 'string' && edgesPath.endsWith('.jsonl'), 'edges_jsonl path required');
expect(fs.existsSync(path.join(root, cleanRelativePath(edgesPath || ''))), `edges_jsonl missing: ${edgesPath}`);

let sampledRows = 0;
await readJsonlPrefix(edgesPath, 1000, (row, lineNumber) => {
  sampledRows += 1;
  const context = `edge line ${lineNumber}`;
  for (const field of [
    'token_key',
    'token_normalized',
    'work_id',
    'work_title',
    'source_name',
    'source_family',
    'license_label',
    'license_lane',
    'source_url_or_citation',
    'source_name_partition_id',
    'agent6_boundary_required',
    'source_ref',
    'occurrence_count',
  ]) {
    expect(row[field] !== undefined && row[field] !== null && row[field] !== '', `${context}: missing ${field}`);
  }
  expect(String(row.token_key || '').startsWith('he:'), `${context}: token_key must start with he:`);
  expect(row.license_lane === 'commercial_clean_candidate', `${context}: license_lane must preserve commercial_clean_candidate`);
  expect(row.agent6_boundary_required === true, `${context}: agent6_boundary_required must be true`);
  expect(row.answer_eligible === false, `${context}: answer_eligible must be false`);
  expect(row.public_emit === false, `${context}: public_emit must be false`);
  expect(row.definition_content_storage_now === false, `${context}: definition_content_storage_now must be false`);
  expect(row.candidate_text_export_now === false, `${context}: candidate_text_export_now must be false`);
  expect(Number.isInteger(row.occurrence_count) && row.occurrence_count > 0, `${context}: occurrence_count must be positive`);
});
if (summary.counts.edge_rows > 0) {
  expect(sampledRows > 0, 'must sample at least one edge row when edge_rows is positive');
} else {
  expect(sampledRows === 0, 'zero-edge chunk must not contain edge rows');
  expect(summary.counts.matched_token_occurrences === 0, 'zero-edge chunk must have 0 matched_token_occurrences');
}

if (issues.length) {
  console.error(`Workbench token source partition edge validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 120)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Workbench token source partition edge validation passed. Edge rows: ${summary.counts.edge_rows}; sampled rows: ${sampledRows}; candidate rows: 0.`);

async function readJsonlPrefix(relativePath, limit, onRow) {
  const rl = readline.createInterface({
    input: fs.createReadStream(path.join(root, cleanRelativePath(relativePath)), { encoding: 'utf8' }),
    crlfDelay: Infinity,
  });
  let lineNumber = 0;
  for await (const line of rl) {
    if (!line.trim()) continue;
    lineNumber += 1;
    onRow(JSON.parse(line), lineNumber);
    if (lineNumber >= limit) {
      rl.close();
      break;
    }
  }
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) throw new Error(`Path must be repo-relative: ${value}`);
  return normalized;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}
