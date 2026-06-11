import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent2-agent10-workbench-source-partition-handoff-packet-2026-06-04.json';
const packet = readJson(artifactPath);
const issues = [];

function expect(condition, message) {
  if (!condition) issues.push(message);
}

expect(packet.schema_version === '1.0', 'schema_version must be 1.0');
expect(packet.artifact_type === 'agent2_agent10_workbench_source_partition_handoff_packet', 'artifact_type mismatch');
expect(packet.status === 'agent2_workbench_source_partition_handoff_ready_for_agent10_intake_only', 'status mismatch');

for (const [key, value] of Object.entries(packet.files || {})) {
  expect(typeof value === 'string' && value.length > 0, `files.${key} must be set`);
  if (typeof value === 'string' && /^(scripts|reports|data)\//.test(value)) {
    expect(fs.existsSync(path.join(root, value)), `files.${key} path missing: ${value}`);
  }
}

validateCommand(packet.exact_command_or_script?.build, 'build');
validateCommand(packet.exact_command_or_script?.validate, 'validate');
validateCommand(packet.exact_command_or_script?.runnable_addendum_build, 'runnable addendum build');
validateCommand(packet.exact_command_or_script?.runnable_addendum_validate, 'runnable addendum validate');

const counts = packet.schema_counts || {};
expect(counts.runnable_addendum_count === 1, 'runnable_addendum_count must be 1');
expect(counts.source_license_lane_planning_rows === 4, 'source_license_lane_planning_rows must be 4');
expect(counts.source_name_partition_planning_rows === 351, 'source_name_partition_planning_rows must be 351');
expect(counts.source_rows === 105747, 'source_rows must be 105747');
expect(counts.public_domain_partitions === 307, 'public_domain_partitions must be 307');
expect(counts.cc_by_sa_partitions === 37, 'cc_by_sa_partitions must be 37');
expect(counts.cc_by_partitions === 5, 'cc_by_partitions must be 5');
expect(counts.cc0_partitions === 2, 'cc0_partitions must be 2');
expect(counts.attribution_required_partitions === 42, 'attribution_required_partitions must be 42');
expect(counts.share_alike_required_partitions === 37, 'share_alike_required_partitions must be 37');
expect(counts.token_inventory_top_rows === 5000, 'token_inventory_top_rows must be 5000');
expect(counts.distinct_normalized_tokens === 698873, 'distinct_normalized_tokens must be 698873');
expect(counts.token_rows_with_source_name_partition_join === 0, 'token_rows_with_source_name_partition_join must be 0');
expect(counts.token_rows_with_source_license_join === 0, 'token_rows_with_source_license_join must be 0');

for (const [key, value] of Object.entries(packet.transform_candidate_counts || {})) {
  expect(value === 0, `transform_candidate_counts.${key} must be 0`);
}

const blocker = packet.blocker || {};
expect(blocker.id === 'workbench_token_inventory_missing_source_partition_join', 'blocker id mismatch');
expect(blocker.source_license_blocker === 'workbench_token_inventory_missing_per_token_source_license_join_before_definition_lemma_reader_hint_candidates', 'source license blocker mismatch');
expect(blocker.source_name_blocker === 'workbench_token_inventory_missing_per_token_source_name_license_partition_join_before_definition_lemma_reader_hint_candidates', 'source name blocker mismatch');
expect(blocker.main_manifest_registration_blocker === 'main_manifest_registration_requires_refreshing_manifest_output_receipts_inventory_handoff_and_count_assertions_from_7_to_8_runnable_pipelines', 'main manifest registration blocker mismatch');
expect(/per-token source_name/.test(blocker.required_next_artifact || ''), 'required_next_artifact must name per-token source_name join');

for (const [key, value] of Object.entries(packet.zero_emission_counters || {})) {
  expect(value === 0, `zero_emission_counters.${key} must be 0`);
}

expect(/Agent 10 first/.test(packet.handoff_owner || ''), 'handoff_owner must name Agent 10 first');
expect(/Agent 6/.test(packet.handoff_owner || ''), 'handoff_owner must name Agent 6 boundary route');

const forbiddenText = JSON.stringify(packet.what_must_not_be_accepted || []);
for (const required of ['Definition authority', 'answer eligibility', 'public reader output', 'source/provenance acceptance', 'NC commercial authorization']) {
  expect(forbiddenText.includes(required), `what_must_not_be_accepted must include ${required}`);
}

if (issues.length) {
  console.error(`Agent 2 Agent10 workbench source partition handoff packet validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 Agent10 workbench source partition handoff packet validation passed. Source partitions: 351; source rows: 105747; candidate rows: 0.');

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
