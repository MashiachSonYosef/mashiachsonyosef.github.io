import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent2-workbench-token-source-partition-edges-pilot-return-2026-06-04.json';
const artifact = readJson(artifactPath);
const issues = [];

function expect(condition, message) {
  if (!condition) issues.push(message);
}

expect(artifact.schema_version === '1.0', 'schema_version must be 1.0');
expect(artifact.artifact_type === 'agent2_workbench_token_source_partition_edges_pilot_return', 'artifact_type mismatch');
expect(artifact.status === 'nonpublic_token_source_partition_edges_pilot_built_full_build_runtime_blocked', 'status mismatch');
for (const [key, value] of Object.entries(artifact.files || {})) {
  expect(typeof value === 'string' && value.length > 0, `files.${key} required`);
  if (typeof value === 'string' && /^(scripts|reports|\.local-cache)\//.test(value)) {
    expect(fs.existsSync(path.join(root, value)), `files.${key} missing: ${value}`);
  }
}
const counts = artifact.schema_counts || {};
expect(counts.source_file_limit === 25, 'source_file_limit must be 25');
expect(counts.source_files_read === 25, 'source_files_read must be 25');
expect(counts.units_read === 14591, 'units_read must be 14591');
expect(counts.units_with_partition === 9469, 'units_with_partition must be 9469');
expect(counts.unjoined_units === 5122, 'unjoined_units must be 5122');
expect(counts.matched_token_occurrences === 1102267, 'matched_token_occurrences must be 1102267');
expect(counts.edge_rows === 21728, 'edge_rows must be 21728');
expect(artifact.full_build_blocker?.id === 'full_5000_token_source_partition_edge_build_exceeded_300_second_local_run_limit', 'full build blocker mismatch');
for (const [key, value] of Object.entries(artifact.transform_candidate_counts || {})) {
  expect(value === 0, `transform_candidate_counts.${key} must be 0`);
}
for (const [key, value] of Object.entries(artifact.zero_emission_counters || {})) {
  expect(value === 0, `zero_emission_counters.${key} must be 0`);
}
expect(/Agent 10 first/.test(artifact.handoff_owner || ''), 'handoff_owner must name Agent 10 first');
expect(/Spark-1/.test(artifact.handoff_owner || ''), 'handoff_owner must name Spark-1 for full build');

if (issues.length) {
  console.error(`Agent 2 token source partition edge pilot return validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 token source partition edge pilot return validation passed. Pilot edge rows: 21728; candidate rows: 0.');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}
