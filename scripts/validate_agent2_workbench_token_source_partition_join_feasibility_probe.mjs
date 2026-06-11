import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent2-workbench-token-source-partition-join-feasibility-probe-2026-06-04.json';
const artifact = readJson(artifactPath);
const issues = [];

function expect(condition, message) {
  if (!condition) issues.push(message);
}

expect(artifact.schema_version === '1.0', 'schema_version must be 1.0');
expect(artifact.artifact_type === 'agent2_workbench_token_source_partition_join_feasibility_probe', 'artifact_type mismatch');
expect(artifact.status === 'nonpublic_join_feasibility_probe_exact_schema_blocker', 'status mismatch');

for (const [key, value] of Object.entries(artifact.files || {})) {
  expect(typeof value === 'string' && value.length > 0, `files.${key} must be set`);
  if (typeof value === 'string' && /^(scripts|reports|data|\.local-cache)\//.test(value)) {
    expect(fs.existsSync(path.join(root, value)), `files.${key} path missing: ${value}`);
  }
}

validateCommand(artifact.exact_command_or_script?.build, 'build');
validateCommand(artifact.exact_command_or_script?.validate, 'validate');

const counts = artifact.schema_counts || {};
expect(counts.token_inventory_top_rows === 5000, 'token_inventory_top_rows must be 5000');
expect(counts.distinct_normalized_tokens === 698873, 'distinct_normalized_tokens must be 698873');
expect(counts.total_tokens === 75290880, 'total_tokens must be 75290880');
expect(counts.source_name_partition_rows === 351, 'source_name_partition_rows must be 351');
expect(counts.source_rows === 105747, 'source_rows must be 105747');
expect(counts.top_work_edges_available > 0, 'top_work_edges_available must be positive');
expect(counts.top_work_unique_work_ids > 0, 'top_work_unique_work_ids must be positive');
expect(counts.top_work_edges_with_source_partition_join === 0, 'top_work_edges_with_source_partition_join must be 0');
expect(counts.top_work_unique_work_ids_with_source_partition_join === 0, 'top_work_unique_work_ids_with_source_partition_join must be 0');
expect(counts.first_ref_edges_available > 0, 'first_ref_edges_available must be positive');
expect(counts.complete_token_occurrence_source_partition_edges_available === 0, 'complete edge count must be 0');

expect(artifact.feasible_now?.can_join_capped_top_work_edges_to_work_level_source_metadata === false, 'capped top-work join must be false');
expect(artifact.feasible_now?.can_join_complete_token_occurrences_to_source_name_partitions === false, 'complete occurrence join must be false');
expect(artifact.feasible_now?.can_emit_definition_lemma_reader_hint_candidates === false, 'candidate emission must be false');
expect(artifact.feasible_now?.can_emit_candidate_text === false, 'candidate text emission must be false');
expect(artifact.feasible_now?.can_emit_public_or_answer_rows === false, 'public/answer emission must be false');

const blocker = artifact.exact_blocker || {};
expect(blocker.id === 'token_inventory_lacks_complete_occurrence_level_source_partition_edges', 'blocker id mismatch');
expect(blocker.required_next_artifact === '.local-cache/workbench-evidence/token-source-partition-edges-5000.jsonl', 'required_next_artifact mismatch');
for (const field of [
  'token_key',
  'token_normalized',
  'source_ref',
  'work_id',
  'work_title',
  'source_name',
  'source_family',
  'license_label',
  'license_lane',
  'source_url_or_citation',
  'source_name_partition_id',
  'agent6_boundary_required',
]) {
  expect((blocker.required_fields || []).includes(field), `required_fields must include ${field}`);
}

for (const [key, value] of Object.entries(artifact.transform_candidate_counts || {})) {
  expect(value === 0, `transform_candidate_counts.${key} must be 0`);
}

for (const [key, value] of Object.entries(artifact.zero_emission_counters || {})) {
  expect(value === 0, `zero_emission_counters.${key} must be 0`);
}

expect(Array.isArray(artifact.sample_unjoined_top_work_edges), 'sample_unjoined_top_work_edges must be an array');
expect(artifact.sample_unjoined_top_work_edges.length > 0, 'sample_unjoined_top_work_edges must be non-empty');
expect(/Agent 10 first/.test(artifact.handoff_owner || ''), 'handoff_owner must name Agent 10 first');
expect(/Agent 6/.test(artifact.handoff_owner || ''), 'handoff_owner must name Agent 6 boundary route');

if (issues.length) {
  console.error(`Agent 2 workbench token source-partition join feasibility probe validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 2 workbench token source-partition join feasibility probe validation passed. Top-token rows: ${counts.token_inventory_top_rows}; complete edge rows: 0; candidate rows: 0.`);

function validateCommand(command, label) {
  expect(typeof command === 'string' && command.startsWith('node '), `${label} command must be a node command`);
  if (typeof command !== 'string') return;
  const script = command.split(/\s+/).find((part) => part.startsWith('scripts/') && part.endsWith('.mjs'));
  expect(Boolean(script), `${label} command must include script`);
  if (script) expect(fs.existsSync(path.join(root, script)), `${label} script missing: ${script}`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}
