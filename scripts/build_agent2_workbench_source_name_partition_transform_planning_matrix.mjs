import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourcePartitionsPath = 'reports/agent1-workbench-full-source-name-custody-partitions-2026-06-04.json';
const tokenInventoryPath = 'reports/agent2-broad-workbench-token-inventory-5000-return-2026-06-04.json';
const outputJson = 'reports/agent2-workbench-source-name-partition-transform-planning-matrix-2026-06-04.json';
const outputMd = 'reports/agent2-workbench-source-name-partition-transform-planning-matrix-2026-06-04.md';

const sourcePartitions = readJson(sourcePartitionsPath);
const tokenInventory = readJson(tokenInventoryPath);
const partitionRows = sourcePartitions.partition_rows || [];

const matrixRows = partitionRows.map((row) => ({
  source_name: row.source_name,
  source_family: row.source_family,
  license_label: row.license_label,
  license_lane: row.license_lane,
  source_row_count: row.source_row_count,
  unique_source_id_count: row.unique_source_id_count,
  unique_work_count: row.unique_work_count,
  attribution_required: row.attribution_required,
  derived_from_nc: row.derived_from_nc,
  commercial_export_allowed: row.commercial_export_allowed,
  share_alike_required: row.share_alike_required,
  corpus_contamination: row.corpus_contamination,
  agent6_boundary_required: row.agent6_boundary_required,
  answer_eligible: false,
  public_emit: false,
  definition_content_storage_now: false,
  candidate_text_rows_now: 0,
  lemma_candidate_rows_now: 0,
  reader_hint_candidate_rows_now: 0,
  definition_candidate_rows_now: 0,
  blocker_to_transform_candidates: blockerFor(row),
}));

const licenseBuckets = summarizeBy(matrixRows, 'license_label');
const laneBuckets = summarizeBy(matrixRows, 'license_lane');
const shareAlikeRows = matrixRows.filter((row) => row.share_alike_required === true);
const attributionRows = matrixRows.filter((row) => row.attribution_required === true);
const commercialExportBlockedRows = matrixRows.filter((row) => row.commercial_export_allowed !== true);

const artifact = {
  schema_version: '1.0',
  artifact_type: 'agent2_workbench_source_name_partition_transform_planning_matrix',
  date: '2026-06-04',
  mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / Option C HYBRID',
  status: 'nonpublic_workbench_source_name_partition_transform_planning_matrix_pre_agent6_boundary',
  target: 'broad Definition Workbench source-name partition planning after Agent 1 custody inventory',
  inputs: {
    agent1_full_source_name_custody_partitions: sourcePartitionsPath,
    agent2_broad_workbench_token_inventory_5000_return: tokenInventoryPath,
  },
  files: {
    builder: 'scripts/build_agent2_workbench_source_name_partition_transform_planning_matrix.mjs',
    validator: 'scripts/validate_agent2_workbench_source_name_partition_transform_planning_matrix.mjs',
    output_json: outputJson,
    output_md: outputMd,
  },
  exact_command_or_script: {
    build: 'node scripts/build_agent2_workbench_source_name_partition_transform_planning_matrix.mjs',
    validate: `node scripts/validate_agent2_workbench_source_name_partition_transform_planning_matrix.mjs ${outputJson}`,
  },
  source_partition_counts: {
    parsed_rows: sourcePartitions.counts.parsed_rows,
    source_row_count: sourcePartitions.counts.source_row_count,
    unique_source_id_count: sourcePartitions.counts.unique_source_id_count,
    unique_work_count: sourcePartitions.counts.unique_work_count,
    source_name_partition_count: sourcePartitions.counts.source_name_partition_count,
    full_partition_count: sourcePartitions.counts.full_partition_count,
  },
  token_inventory_counts: {
    token_inventory_top_rows: tokenInventory.schema_counts.inventory_top_tokens,
    distinct_normalized_tokens: tokenInventory.schema_counts.inventory_distinct_normalized_tokens,
    total_tokens: tokenInventory.schema_counts.inventory_total_tokens,
    token_rows_with_source_name_partition_join: 0,
  },
  license_bucket_counts: licenseBuckets,
  lane_bucket_counts: laneBuckets,
  boundary_sensitive_counts: {
    attribution_required_partitions: attributionRows.length,
    attribution_required_source_rows: sum(attributionRows, 'source_row_count'),
    share_alike_required_partitions: shareAlikeRows.length,
    share_alike_required_source_rows: sum(shareAlikeRows, 'source_row_count'),
    commercial_export_blocked_partitions_now: commercialExportBlockedRows.length,
    commercial_export_blocked_source_rows_now: sum(commercialExportBlockedRows, 'source_row_count'),
  },
  matrix_rows: matrixRows,
  transform_candidate_counts: {
    source_name_partition_planning_rows: matrixRows.length,
    definition_candidate_rows: 0,
    reader_hint_candidate_rows: 0,
    lemma_candidate_rows: 0,
    candidate_text_rows: 0,
  },
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
  missing_field_blocker: 'workbench_token_inventory_missing_per_token_source_name_license_partition_join_before_definition_lemma_reader_hint_candidates',
  missing_fields: [
    'token_inventory.rows[].source_name',
    'token_inventory.rows[].source_family',
    'token_inventory.rows[].license_label',
    'token_inventory.rows[].license_lane',
    'token_inventory.rows[].source_url_or_citation',
    'token_inventory.rows[].source_name_partition_id',
    'token_inventory.rows[].agent6_boundary_required',
  ],
  agent6_boundary_question: 'If a future row/subset package is proposed, may these exact source-name-partition-joined token rows be used/stored/displayed within their preserved license lanes under zero-answer/public flags?',
  validator: `node scripts/validate_agent2_workbench_source_name_partition_transform_planning_matrix.mjs ${outputJson}`,
  handoff_owner: 'Agent 10 first; Agent 6 only by exact boundary packet prepared through release owner',
  stop_condition: 'Stop at source-name partition planning rows until a per-token source-name/license partition join and exact Agent 6 boundary permit candidate text/package/display/public/answer use.',
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

assertArtifact(artifact);
writeJson(outputJson, artifact);
writeMd(outputMd, artifact);
console.log(`wrote ${outputJson}`);
console.log(`wrote ${outputMd}`);

function blockerFor(row) {
  if (row.share_alike_required) return 'cc_by_sa_share_alike_boundary_and_per_token_source_name_partition_join_required';
  if (row.attribution_required) return 'attribution_boundary_and_per_token_source_name_partition_join_required';
  return 'per_token_source_name_partition_join_and_exact_agent6_boundary_required';
}

function summarizeBy(rows, field) {
  const result = {};
  for (const row of rows) {
    const key = row[field] || 'unknown';
    result[key] ||= { partition_count: 0, source_row_count: 0 };
    result[key].partition_count += 1;
    result[key].source_row_count += row.source_row_count || 0;
  }
  return result;
}

function sum(rows, field) {
  return rows.reduce((total, row) => total + (row[field] || 0), 0);
}

function assertArtifact(value) {
  if (value.matrix_rows.length !== 351) throw new Error('expected 351 source-name partition rows');
  if (value.source_partition_counts.source_row_count !== 105747) throw new Error('expected 105747 source rows');
  if (value.token_inventory_counts.token_inventory_top_rows !== 5000) throw new Error('expected 5000 token inventory rows');
  if (value.lane_bucket_counts.commercial_clean_candidate?.partition_count !== 351) throw new Error('expected 351 commercial-clean partitions');
  if (value.license_bucket_counts['Public Domain']?.partition_count !== 307) throw new Error('expected 307 Public Domain partitions');
  if (value.license_bucket_counts['CC-BY-SA']?.partition_count !== 37) throw new Error('expected 37 CC-BY-SA partitions');
  if (value.license_bucket_counts['CC-BY']?.partition_count !== 5) throw new Error('expected 5 CC-BY partitions');
  if (value.license_bucket_counts.CC0?.partition_count !== 2) throw new Error('expected 2 CC0 partitions');
  for (const row of value.matrix_rows) {
    if (row.agent6_boundary_required !== true) throw new Error(`${row.source_name} must require Agent 6 boundary`);
    if (row.answer_eligible !== false || row.public_emit !== false || row.definition_content_storage_now !== false) throw new Error(`${row.source_name} zero flags failed`);
    if (row.candidate_text_rows_now !== 0 || row.reader_hint_candidate_rows_now !== 0 || row.definition_candidate_rows_now !== 0) throw new Error(`${row.source_name} candidate rows must be 0`);
  }
  for (const counter of Object.values(value.zero_emission_counters)) {
    if (counter !== 0) throw new Error('zero emission counter mismatch');
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
    '# Agent 2 Workbench Source-Name Partition Transform Planning Matrix - 2026-06-04',
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
    `- Agent 1 full source-name custody partitions: ${value.inputs.agent1_full_source_name_custody_partitions}.`,
    `- Agent 2 token inventory return: ${value.inputs.agent2_broad_workbench_token_inventory_5000_return}.`,
    `- Output artifact: ${value.files.output_json}.`,
    `- Companion report: ${value.files.output_md}.`,
    '',
    '## Commands',
    `- Build: \`${value.exact_command_or_script.build}\`.`,
    `- Validate: \`${value.exact_command_or_script.validate}\`.`,
    '',
    '## Schema/Counts',
    `- Source-name partition rows: ${value.source_partition_counts.source_name_partition_count}.`,
    `- Source rows: ${value.source_partition_counts.source_row_count}.`,
    `- Public Domain / CC-BY-SA / CC-BY / CC0 partitions: ${value.license_bucket_counts['Public Domain'].partition_count} / ${value.license_bucket_counts['CC-BY-SA'].partition_count} / ${value.license_bucket_counts['CC-BY'].partition_count} / ${value.license_bucket_counts.CC0.partition_count}.`,
    `- Share-alike-required partitions/source rows: ${value.boundary_sensitive_counts.share_alike_required_partitions} / ${value.boundary_sensitive_counts.share_alike_required_source_rows}.`,
    `- Attribution-required partitions/source rows: ${value.boundary_sensitive_counts.attribution_required_partitions} / ${value.boundary_sensitive_counts.attribution_required_source_rows}.`,
    `- Token inventory top rows / distinct normalized tokens / total tokens: ${value.token_inventory_counts.token_inventory_top_rows} / ${value.token_inventory_counts.distinct_normalized_tokens} / ${value.token_inventory_counts.total_tokens}.`,
    '- Definition, lemma, reader-hint, candidate-text, answer-eligible, and public-emission rows now: 0.',
    '',
    '## Validator',
    value.validator,
    '',
    '## Missing-Field Blocker',
    value.missing_field_blocker,
    '',
    '## Handoff Owner',
    value.handoff_owner,
    '',
    '## Stop Condition',
    value.stop_condition,
    '',
    '## Boundary',
    'This is nonpublic source-name partition planning only. It does not accept source/license status, Definition authority, answer eligibility, candidate text export, public/runtime output, accepted text, commercial export permission, or publication readiness.',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
}
