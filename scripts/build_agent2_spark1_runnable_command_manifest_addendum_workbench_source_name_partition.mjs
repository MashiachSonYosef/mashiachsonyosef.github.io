import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputJson = 'reports/agent2-spark1-runnable-command-manifest-addendum-workbench-source-name-partition-2026-06-04.json';
const outputMd = 'reports/agent2-spark1-runnable-command-manifest-addendum-workbench-source-name-partition-2026-06-04.md';
const matrixPath = 'reports/agent2-workbench-source-name-partition-transform-planning-matrix-2026-06-04.json';
const matrix = readJson(matrixPath);

const addendum = {
  schema_version: '1.0',
  artifact_type: 'agent2_spark1_runnable_command_manifest_addendum',
  date: '2026-06-04',
  mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / Option C HYBRID',
  status: 'standalone_runnable_addendum_pre_main_manifest_registration',
  target: 'workbench source-name partition transform planning matrix',
  base_manifest: 'reports/agent2-spark1-runnable-command-manifest-2026-06-04.json',
  addendum_reason: 'Avoid mutating the current 7-pipeline manifest chain until Agent 10 selects this new workbench planning matrix for release/package intake.',
  runnable_pipeline: {
    id: 'workbench_source_name_partition_transform_planning_matrix',
    build: 'node scripts/build_agent2_workbench_source_name_partition_transform_planning_matrix.mjs',
    validate: `node scripts/validate_agent2_workbench_source_name_partition_transform_planning_matrix.mjs ${matrixPath}`,
    expected_counts: {
      source_name_partition_rows: matrix.source_partition_counts.source_name_partition_count,
      source_rows: matrix.source_partition_counts.source_row_count,
      public_domain_partitions: matrix.license_bucket_counts['Public Domain'].partition_count,
      cc_by_sa_partitions: matrix.license_bucket_counts['CC-BY-SA'].partition_count,
      cc_by_partitions: matrix.license_bucket_counts['CC-BY'].partition_count,
      cc0_partitions: matrix.license_bucket_counts.CC0.partition_count,
      definition_candidate_rows: 0,
      reader_hint_candidate_rows: 0,
      lemma_candidate_rows: 0,
      candidate_text_rows: 0,
      answer_eligible_rows: 0,
      public_emit_rows: 0,
    },
  },
  output_artifact: matrixPath,
  validator: `node scripts/validate_agent2_spark1_runnable_command_manifest_addendum_workbench_source_name_partition.mjs ${outputJson}`,
  missing_field_blocker: matrix.missing_field_blocker,
  main_manifest_registration_blocker: 'main_manifest_registration_requires_refreshing_manifest_output_receipts_inventory_handoff_and_count_assertions_from_7_to_8_runnable_pipelines',
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
    nc_commercial_authorization: false,
  },
  handoff_owner: 'Agent 10 first; Agent 6 only by exact boundary packet prepared through release owner',
  stop_condition: 'Spark-1 may run this addendum command only if Agent 10 or Agent 7 selects this addendum; do not merge into the main manifest until count receipts are refreshed.',
};

assertAddendum(addendum);
writeJson(outputJson, addendum);
writeMd(outputMd, addendum);
console.log(`wrote ${outputJson}`);
console.log(`wrote ${outputMd}`);

function assertAddendum(value) {
  if (value.runnable_pipeline.expected_counts.source_name_partition_rows !== 351) throw new Error('expected 351 source-name partitions');
  if (value.runnable_pipeline.expected_counts.source_rows !== 105747) throw new Error('expected 105747 source rows');
  if (value.runnable_pipeline.expected_counts.definition_candidate_rows !== 0) throw new Error('definition candidate rows must be 0');
  for (const counter of Object.values(value.zero_boundary)) {
    if (counter !== false) throw new Error('zero boundary must remain false');
  }
  for (const command of [value.runnable_pipeline.build, value.runnable_pipeline.validate]) {
    const script = command.split(/\s+/).find((part) => part.startsWith('scripts/') && part.endsWith('.mjs'));
    if (!script || !fs.existsSync(path.join(root, script))) throw new Error(`missing script in command: ${command}`);
  }
  if (!fs.existsSync(path.join(root, value.output_artifact))) throw new Error('output artifact missing');
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMd(relativePath, value) {
  const lines = [
    '# Agent 2 Spark-1 Runnable Command Manifest Addendum - Workbench Source-Name Partition',
    '',
    `Status: ${value.status}.`,
    '',
    '## Target',
    value.target,
    '',
    '## Runnable Command',
    `- Build: \`${value.runnable_pipeline.build}\`.`,
    `- Validate: \`${value.runnable_pipeline.validate}\`.`,
    `- Output: \`${value.output_artifact}\`.`,
    '',
    '## Counts',
    `- Source-name partitions: ${value.runnable_pipeline.expected_counts.source_name_partition_rows}.`,
    `- Source rows: ${value.runnable_pipeline.expected_counts.source_rows}.`,
    `- Public Domain / CC-BY-SA / CC-BY / CC0 partitions: ${value.runnable_pipeline.expected_counts.public_domain_partitions} / ${value.runnable_pipeline.expected_counts.cc_by_sa_partitions} / ${value.runnable_pipeline.expected_counts.cc_by_partitions} / ${value.runnable_pipeline.expected_counts.cc0_partitions}.`,
    '- Definition, lemma, reader-hint, candidate-text, answer-eligible, and public-emission rows: 0.',
    '',
    '## Blockers',
    `- Candidate blocker: \`${value.missing_field_blocker}\`.`,
    `- Main manifest registration blocker: \`${value.main_manifest_registration_blocker}\`.`,
    '',
    '## Handoff Owner',
    value.handoff_owner,
    '',
    '## Stop Condition',
    value.stop_condition,
    '',
    '## Boundary',
    'No Definition authority, answer eligibility, accepted text, source/license acceptance, public output, route-shard edit, public/runtime mutation, commercial export permission, or publication readiness is claimed.',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
}
