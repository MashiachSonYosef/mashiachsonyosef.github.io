import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent2-spark1-runnable-command-manifest-addendum-workbench-source-name-partition-2026-06-04.json';
const artifact = readJson(artifactPath);
const issues = [];

function expect(condition, message) {
  if (!condition) issues.push(message);
}

expect(artifact.schema_version === '1.0', 'schema_version must be 1.0');
expect(artifact.artifact_type === 'agent2_spark1_runnable_command_manifest_addendum', 'artifact_type mismatch');
expect(artifact.status === 'standalone_runnable_addendum_pre_main_manifest_registration', 'status mismatch');
expect(fs.existsSync(path.join(root, artifact.base_manifest || '')), 'base manifest missing');
expect(fs.existsSync(path.join(root, artifact.output_artifact || '')), 'output artifact missing');

const pipeline = artifact.runnable_pipeline || {};
expect(pipeline.id === 'workbench_source_name_partition_transform_planning_matrix', 'runnable pipeline id mismatch');
validateCommand(pipeline.build, 'build command');
validateCommand(pipeline.validate, 'validate command');

const expected = pipeline.expected_counts || {};
expect(expected.source_name_partition_rows === 351, 'source_name_partition_rows must be 351');
expect(expected.source_rows === 105747, 'source_rows must be 105747');
expect(expected.public_domain_partitions === 307, 'public_domain_partitions must be 307');
expect(expected.cc_by_sa_partitions === 37, 'cc_by_sa_partitions must be 37');
expect(expected.cc_by_partitions === 5, 'cc_by_partitions must be 5');
expect(expected.cc0_partitions === 2, 'cc0_partitions must be 2');
expect(expected.definition_candidate_rows === 0, 'definition_candidate_rows must be 0');
expect(expected.reader_hint_candidate_rows === 0, 'reader_hint_candidate_rows must be 0');
expect(expected.lemma_candidate_rows === 0, 'lemma_candidate_rows must be 0');
expect(expected.candidate_text_rows === 0, 'candidate_text_rows must be 0');
expect(expected.answer_eligible_rows === 0, 'answer_eligible_rows must be 0');
expect(expected.public_emit_rows === 0, 'public_emit_rows must be 0');

expect(artifact.missing_field_blocker === 'workbench_token_inventory_missing_per_token_source_name_license_partition_join_before_definition_lemma_reader_hint_candidates', 'missing_field_blocker mismatch');
expect(artifact.main_manifest_registration_blocker === 'main_manifest_registration_requires_refreshing_manifest_output_receipts_inventory_handoff_and_count_assertions_from_7_to_8_runnable_pipelines', 'main manifest registration blocker mismatch');

for (const [key, value] of Object.entries(artifact.zero_boundary || {})) {
  expect(value === false, `zero_boundary.${key} must be false`);
}

expect(/Agent 10 first/.test(artifact.handoff_owner || ''), 'handoff_owner must name Agent 10 first');
expect(/Agent 6/.test(artifact.handoff_owner || ''), 'handoff_owner must name Agent 6 boundary route');

if (issues.length) {
  console.error(`Agent 2 Spark-1 runnable command manifest addendum validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 Spark-1 runnable command manifest addendum validation passed. Runnable addendum: 1; source-name partitions: 351; candidate rows: 0.');

function validateCommand(command, label) {
  expect(typeof command === 'string' && command.startsWith('node '), `${label} must be a node command`);
  if (typeof command !== 'string') return;
  const parts = command.split(/\s+/).slice(1);
  const script = parts.find((part) => part.startsWith('scripts/') && part.endsWith('.mjs'));
  expect(Boolean(script), `${label} must include a script path`);
  if (script) expect(fs.existsSync(path.join(root, script)), `${label} script does not exist: ${script}`);
  for (const part of parts) {
    const value = part.includes('=') ? part.split('=').slice(1).join('=') : part;
    if (/^(reports|data)\//.test(value) && !value.includes('<')) {
      expect(fs.existsSync(path.join(root, value)), `${label} referenced path missing: ${value}`);
    }
  }
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}
