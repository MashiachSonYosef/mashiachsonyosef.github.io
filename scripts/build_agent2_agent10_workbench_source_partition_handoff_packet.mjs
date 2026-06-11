import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputJson = 'reports/agent2-agent10-workbench-source-partition-handoff-packet-2026-06-04.json';
const outputMd = 'reports/agent2-agent10-workbench-source-partition-handoff-packet-2026-06-04.md';
const addendumPath = 'reports/agent2-spark1-runnable-command-manifest-addendum-workbench-source-name-partition-2026-06-04.json';
const sourceNameMatrixPath = 'reports/agent2-workbench-source-name-partition-transform-planning-matrix-2026-06-04.json';
const sourceLicenseMatrixPath = 'reports/agent2-workbench-source-license-lane-transform-planning-matrix-2026-06-04.json';

const addendum = readJson(addendumPath);
const sourceNameMatrix = readJson(sourceNameMatrixPath);
const sourceLicenseMatrix = readJson(sourceLicenseMatrixPath);

const packet = {
  schema_version: '1.0',
  artifact_type: 'agent2_agent10_workbench_source_partition_handoff_packet',
  date: '2026-06-04',
  mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / Option C HYBRID',
  status: 'agent2_workbench_source_partition_handoff_ready_for_agent10_intake_only',
  target: 'Workbench source-license and source-name partition planning handoff for Agent 10 release relevance review',
  files: {
    runnable_addendum: addendumPath,
    source_name_partition_matrix: sourceNameMatrixPath,
    source_license_lane_matrix: sourceLicenseMatrixPath,
    builder: 'scripts/build_agent2_agent10_workbench_source_partition_handoff_packet.mjs',
    validator: 'scripts/validate_agent2_agent10_workbench_source_partition_handoff_packet.mjs',
    output_json: outputJson,
    output_md: outputMd,
  },
  exact_command_or_script: {
    build: 'node scripts/build_agent2_agent10_workbench_source_partition_handoff_packet.mjs',
    validate: `node scripts/validate_agent2_agent10_workbench_source_partition_handoff_packet.mjs ${outputJson}`,
    runnable_addendum_build: addendum.runnable_pipeline.build,
    runnable_addendum_validate: addendum.runnable_pipeline.validate,
  },
  schema_counts: {
    runnable_addendum_count: 1,
    source_license_lane_planning_rows: sourceLicenseMatrix.transform_candidate_counts.source_license_lane_planning_rows,
    source_name_partition_planning_rows: sourceNameMatrix.transform_candidate_counts.source_name_partition_planning_rows,
    source_rows: sourceNameMatrix.source_partition_counts.source_row_count,
    public_domain_partitions: sourceNameMatrix.license_bucket_counts['Public Domain'].partition_count,
    cc_by_sa_partitions: sourceNameMatrix.license_bucket_counts['CC-BY-SA'].partition_count,
    cc_by_partitions: sourceNameMatrix.license_bucket_counts['CC-BY'].partition_count,
    cc0_partitions: sourceNameMatrix.license_bucket_counts.CC0.partition_count,
    attribution_required_partitions: sourceNameMatrix.boundary_sensitive_counts.attribution_required_partitions,
    share_alike_required_partitions: sourceNameMatrix.boundary_sensitive_counts.share_alike_required_partitions,
    token_inventory_top_rows: sourceNameMatrix.token_inventory_counts.token_inventory_top_rows,
    distinct_normalized_tokens: sourceNameMatrix.token_inventory_counts.distinct_normalized_tokens,
    token_rows_with_source_name_partition_join: sourceNameMatrix.token_inventory_counts.token_rows_with_source_name_partition_join,
    token_rows_with_source_license_join: sourceLicenseMatrix.token_inventory_counts.token_rows_with_source_license_join,
  },
  transform_candidate_counts: {
    definition_candidate_rows: 0,
    reader_hint_candidate_rows: 0,
    lemma_candidate_rows: 0,
    candidate_text_rows: 0,
    answer_eligible_rows: 0,
    public_emit_rows: 0,
  },
  blocker: {
    id: 'workbench_token_inventory_missing_source_partition_join',
    source_license_blocker: sourceLicenseMatrix.missing_field_blocker,
    source_name_blocker: sourceNameMatrix.missing_field_blocker,
    main_manifest_registration_blocker: addendum.main_manifest_registration_blocker,
    required_next_artifact: 'per-token source_name/source_family/license_label/license_lane/source_url_or_citation/source_name_partition_id/agent6_boundary_required join over the 5000-token inventory or selected subset',
  },
  agent6_boundary_question: sourceNameMatrix.agent6_boundary_question,
  zero_emission_counters: {
    answer_rows: 0,
    answer_eligible_rows: 0,
    public_reader_output_rows: 0,
    route_jsonl_rows: 0,
    route_shard_writes: 0,
    definition_content_rows: 0,
    candidate_text_export_rows: 0,
    accepted_text_rows: 0,
    public_runtime_mutation: 0,
  },
  handoff_owner: 'Agent 10 first; Agent 6 only by exact boundary packet prepared through release owner',
  stop_condition: 'Stop after Agent 10 intake of this handoff packet or exact selection of a source-partition-joined token subset; do not emit candidate text or public/answer rows from this packet.',
  what_must_not_be_accepted: [
    'QA acceptance',
    'source/provenance acceptance',
    'license acceptance',
    'legal acceptance',
    'Definition authority',
    'usage-as-definition authority',
    'answer acceptance',
    'answer eligibility',
    'public/runtime acceptance',
    'publication readiness',
    'route publication support',
    'product/data acceptance',
    'translation output',
    'accepted gloss/text',
    'public reader output',
    'route-shard edit',
    'public/runtime mutation',
    'definition-content storage',
    'candidate-text export',
    'commercial export permission',
    'NC commercial authorization',
  ],
};

assertPacket(packet);
writeJson(outputJson, packet);
writeMd(outputMd, packet);
console.log(`wrote ${outputJson}`);
console.log(`wrote ${outputMd}`);

function assertPacket(packet) {
  if (packet.schema_counts.runnable_addendum_count !== 1) throw new Error('expected one runnable addendum');
  if (packet.schema_counts.source_license_lane_planning_rows !== 4) throw new Error('source-license planning rows mismatch');
  if (packet.schema_counts.source_name_partition_planning_rows !== 351) throw new Error('source-name partition rows mismatch');
  if (packet.schema_counts.source_rows !== 105747) throw new Error('source rows mismatch');
  if (packet.schema_counts.token_inventory_top_rows !== 5000) throw new Error('token inventory rows mismatch');
  if (packet.schema_counts.token_rows_with_source_name_partition_join !== 0) throw new Error('source-name join count must remain 0');
  if (packet.schema_counts.token_rows_with_source_license_join !== 0) throw new Error('source-license join count must remain 0');
  for (const value of Object.values(packet.transform_candidate_counts)) {
    if (value !== 0) throw new Error('transform candidate count must remain 0');
  }
  for (const value of Object.values(packet.zero_emission_counters)) {
    if (value !== 0) throw new Error('zero emission counter mismatch');
  }
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMd(relativePath, value) {
  const lines = [
    '# Agent 2 to Agent 10 Workbench Source Partition Handoff Packet - 2026-06-04',
    '',
    `Status: ${value.status}.`,
    '',
    '## Required Shape',
    'target | files | exact command/script to write or run | output artifact | schema/counts | validator | missing-field blocker | handoff owner | stop condition',
    '',
    '## Target',
    value.target,
    '',
    '## Files',
    `- Runnable addendum: ${value.files.runnable_addendum}.`,
    `- Source-name partition matrix: ${value.files.source_name_partition_matrix}.`,
    `- Source-license lane matrix: ${value.files.source_license_lane_matrix}.`,
    `- Output artifact: ${value.files.output_json}.`,
    '',
    '## Commands',
    `- Build: \`${value.exact_command_or_script.build}\`.`,
    `- Validate: \`${value.exact_command_or_script.validate}\`.`,
    `- Runnable addendum build: \`${value.exact_command_or_script.runnable_addendum_build}\`.`,
    `- Runnable addendum validate: \`${value.exact_command_or_script.runnable_addendum_validate}\`.`,
    '',
    '## Schema/Counts',
    `- Runnable addendum count: ${value.schema_counts.runnable_addendum_count}.`,
    `- Source-license lane planning rows: ${value.schema_counts.source_license_lane_planning_rows}.`,
    `- Source-name partition planning rows: ${value.schema_counts.source_name_partition_planning_rows}.`,
    `- Source rows: ${value.schema_counts.source_rows}.`,
    `- Public Domain / CC-BY-SA / CC-BY / CC0 partitions: ${value.schema_counts.public_domain_partitions} / ${value.schema_counts.cc_by_sa_partitions} / ${value.schema_counts.cc_by_partitions} / ${value.schema_counts.cc0_partitions}.`,
    `- Attribution-required / share-alike-required partitions: ${value.schema_counts.attribution_required_partitions} / ${value.schema_counts.share_alike_required_partitions}.`,
    `- Token inventory top rows / distinct normalized tokens: ${value.schema_counts.token_inventory_top_rows} / ${value.schema_counts.distinct_normalized_tokens}.`,
    '- Definition, lemma, reader-hint, candidate-text, answer-eligible, and public-emission rows: 0.',
    '',
    '## Validator',
    value.exact_command_or_script.validate,
    '',
    '## Missing-Field Blocker',
    `${value.blocker.id}: ${value.blocker.required_next_artifact}.`,
    '',
    '## Handoff Owner',
    value.handoff_owner,
    '',
    '## Stop Condition',
    value.stop_condition,
    '',
    '## Boundary',
    'This packet is nonpublic handoff evidence only. It does not accept source/license status, Definition authority, answer eligibility, candidate text export, public/runtime output, accepted text, commercial export permission, or publication readiness.',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
}
