#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent2-workbench-token-source-partition-edges-aggregate-readiness-2026-06-04.json';
const artifact = readJson(artifactPath);
const issues = [];

expect(artifact.schema_version === '1.0', 'schema_version must be 1.0');
expect(artifact.artifact_type === 'agent2_workbench_token_source_partition_edges_aggregate_readiness', 'artifact_type mismatch');
expect(artifact.status === 'aggregate_blocked_until_chunk_outputs_exist' || artifact.status === 'aggregate_ready_to_run', 'status mismatch');
expect(artifact.schema_counts?.source_file_count === 1337, 'source_file_count must be 1337');
expect(artifact.schema_counts?.chunk_size === 25, 'chunk_size must be 25');
expect(artifact.schema_counts?.expected_chunk_count === 54, 'expected_chunk_count must be 54');
expect(artifact.schema_counts?.pilot_equivalent_chunk_validated === true, 'pilot equivalent must be validated');
expect(artifact.schema_counts?.pilot_edge_rows === 21728, 'pilot_edge_rows must be 21728');
expect(artifact.schema_counts?.candidate_rows === 0, 'candidate_rows must be 0');
expect(artifact.schema_counts?.answer_eligible_rows === 0, 'answer_eligible_rows must be 0');
expect(artifact.schema_counts?.public_reader_output_rows === 0, 'public_reader_output_rows must be 0');
expect(artifact.schema_counts?.route_jsonl_rows === 0, 'route_jsonl_rows must be 0');
expect(artifact.schema_counts?.route_shard_writes === 0, 'route_shard_writes must be 0');
expect(artifact.schema_counts?.definition_content_rows === 0, 'definition_content_rows must be 0');
expect(artifact.schema_counts?.candidate_text_export_rows === 0, 'candidate_text_export_rows must be 0');

for (const field of [
  'current_handoff',
  'spark1_manifest',
  'chunk_manifest',
  'aggregate_builder',
  'aggregate_validator',
  'readiness_builder',
  'readiness_validator',
]) {
  expect(exists(artifact.files?.[field]), `files.${field} must exist`);
}
expect(typeof artifact.exact_command_script_to_run?.aggregate_build === 'string' && artifact.exact_command_script_to_run.aggregate_build.includes('build_agent2_workbench_token_source_partition_edges_aggregate.mjs'), 'aggregate build command mismatch');
expect(typeof artifact.validator?.readiness === 'string' && artifact.validator.readiness.includes('validate_agent2_workbench_token_source_partition_edges_aggregate_readiness.mjs'), 'readiness validator command mismatch');
expect(/Agent 10 first/.test(artifact.handoff_owner || ''), 'handoff_owner must name Agent 10 first');
expect(/Spark-1/.test(artifact.handoff_owner || ''), 'handoff_owner must name Spark-1');
expect(/Full aggregate runs only after all 54 chunk output sets exist/.test(artifact.stop_condition || ''), 'stop_condition must preserve full aggregate gate');

for (const [key, value] of Object.entries(artifact.zero_boundary || {})) {
  expect(value === false, `zero_boundary.${key} must be false`);
}

if (artifact.status === 'aggregate_blocked_until_chunk_outputs_exist') {
  expect(
    /^missing_\d+_chunk_output_sets_before_full_token_source_partition_edge_aggregate$/.test(artifact.missing_field_blocker || ''),
    'missing_field_blocker must name the missing chunk count',
  );
  expect(
    artifact.schema_counts.present_chunk_output_sets + artifact.schema_counts.missing_chunk_output_sets === 54,
    'present + missing chunk output sets must equal 54',
  );
  expect(Array.isArray(artifact.missing_chunks) && artifact.missing_chunks.length === artifact.schema_counts.missing_chunk_output_sets, 'missing_chunks length must match missing count');
  expect(artifact.schema_counts.missing_chunk_output_sets > 0, 'blocked status requires at least one missing chunk output set');
}

if (issues.length) {
  console.error(`Agent 2 token source partition edge aggregate readiness validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 2 token source partition edge aggregate readiness validation passed. Expected chunks: ${artifact.schema_counts.expected_chunk_count}; missing chunk output sets: ${artifact.schema_counts.missing_chunk_output_sets}; candidate rows: 0.`);

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function exists(relativePath) {
  return typeof relativePath === 'string' && fs.existsSync(path.join(root, relativePath));
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}
