import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifestPath = process.argv[2] || 'reports/agent2-workbench-token-source-partition-edges-chunk-manifest-2026-06-04.json';
const manifest = readJson(manifestPath);
const issues = [];

function expect(condition, message) {
  if (!condition) issues.push(message);
}

expect(manifest.schema_version === '1.0', 'schema_version must be 1.0');
expect(manifest.artifact_type === 'agent2_workbench_token_source_partition_edges_chunk_manifest', 'artifact_type mismatch');
expect(manifest.status === 'spark1_runnable_chunk_manifest_for_nonpublic_token_source_partition_edges', 'status mismatch');
expect(manifest.source_file_count === 1337, 'source_file_count must be 1337');
expect(manifest.chunk_size === 25, 'chunk_size must be 25');
expect(manifest.chunk_count === 54, 'chunk_count must be 54');
expect((manifest.chunks || []).length === 54, 'chunks length must be 54');

let expectedOffset = 0;
for (const chunk of manifest.chunks || []) {
  expect(chunk.source_file_offset === expectedOffset, `chunk ${chunk.chunk_index} offset mismatch`);
  const expectedLimit = Math.min(25, 1337 - expectedOffset);
  expect(chunk.source_file_limit === expectedLimit, `chunk ${chunk.chunk_index} limit mismatch`);
  expect(typeof chunk.first_source_file === 'string' && chunk.first_source_file.startsWith('data/sources/'), `chunk ${chunk.chunk_index} first source missing`);
  expect(typeof chunk.last_source_file === 'string' && chunk.last_source_file.startsWith('data/sources/'), `chunk ${chunk.chunk_index} last source missing`);
  validateCommand(chunk.build, `chunk ${chunk.chunk_index} build`);
  validateCommand(chunk.validate, `chunk ${chunk.chunk_index} validate`);
  expect(chunk.outputs?.edges_jsonl?.endsWith('.jsonl'), `chunk ${chunk.chunk_index} edges output mismatch`);
  expect(chunk.outputs?.summary?.endsWith('-summary.json'), `chunk ${chunk.chunk_index} summary output mismatch`);
  expectedOffset += expectedLimit;
}
expect(expectedOffset === 1337, 'chunk coverage must end at 1337');

expect(manifest.pilot_chunk_equivalent?.validated_summary === 'reports/workbench-token-source-partition-edges-5000-pilot25-summary.json', 'pilot summary mismatch');
expect(fs.existsSync(path.join(root, manifest.pilot_chunk_equivalent?.validated_summary || '')), 'pilot summary must exist');
expect(manifest.pilot_chunk_equivalent?.validated_edge_rows === 21728, 'pilot edge rows must be 21728');

expect(manifest.aggregate_output_contract?.required_aggregate_output === '.local-cache/workbench-evidence/token-source-partition-edges-5000.jsonl', 'aggregate output mismatch');
expect(manifest.aggregate_output_contract?.aggregate_validator_needed === 'scripts/validate_agent2_workbench_token_source_partition_edges_aggregate.mjs', 'aggregate validator blocker mismatch');

for (const [key, value] of Object.entries(manifest.zero_boundary || {})) {
  expect(value === false, `zero_boundary.${key} must be false`);
}
expect(/Agent 10 first/.test(manifest.handoff_owner || ''), 'handoff_owner must name Agent 10 first');
expect(/Spark-1/.test(manifest.handoff_owner || ''), 'handoff_owner must name Spark-1');

if (issues.length) {
  console.error(`Agent 2 token source partition edge chunk manifest validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 token source partition edge chunk manifest validation passed. Chunks: 54; source files: 1337; candidate rows: 0.');

function validateCommand(command, label) {
  expect(typeof command === 'string' && command.startsWith('node '), `${label} must be a node command`);
  const script = String(command || '').split(/\s+/).find((part) => part.startsWith('scripts/') && part.endsWith('.mjs'));
  expect(Boolean(script), `${label} script missing`);
  if (script) expect(fs.existsSync(path.join(root, script)), `${label} script path not found: ${script}`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}
