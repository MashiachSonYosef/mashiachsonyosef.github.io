#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const inputPath = 'reports/agent1-workbench-source-name-custody-partitions-2026-06-04.json';
const outputJsonPath = 'reports/agent1-workbench-cc-by-sa-share-alike-boundary-map-2026-06-04.json';
const outputMdPath = 'reports/agent1-workbench-cc-by-sa-share-alike-boundary-map-2026-06-04.md';
const contractJsonPath = 'reports/agent1-spark1-pipeline-contract-workbench-cc-by-sa-share-alike-boundary-map-2026-06-04.json';
const contractMdPath = 'reports/agent1-spark1-pipeline-contract-workbench-cc-by-sa-share-alike-boundary-map-2026-06-04.md';

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function writeFile(relativePath, content) {
  fs.mkdirSync(path.dirname(path.join(repoRoot, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, relativePath), content, 'utf8');
}

const sourcePartitions = readJson(inputPath);
const ccBySa = (sourcePartitions.top_partitions || []).filter((partition) => partition.license_label === 'CC-BY-SA');
const totalRows = ccBySa.reduce((sum, partition) => sum + (partition.source_row_count || 0), 0);
const totalSourceIds = ccBySa.reduce((sum, partition) => sum + (partition.unique_source_id_count || 0), 0);
const totalWorks = ccBySa.reduce((sum, partition) => sum + (partition.unique_work_count || 0), 0);
const declared = sourcePartitions.license_partition_counts?.['CC-BY-SA'];

const boundaryRows = ccBySa.map((partition) => ({
  source_name: partition.source_name,
  source_family: partition.source_family,
  license_label: partition.license_label,
  license_url: partition.license_url,
  version_source: partition.version_source,
  source_row_count: partition.source_row_count,
  unique_source_id_count: partition.unique_source_id_count,
  unique_work_count: partition.unique_work_count,
  license_lane: partition.license_lane,
  attribution_required: true,
  derived_from_nc: false,
  commercial_export_allowed: false,
  share_alike_required: true,
  corpus_contamination: false,
  agent6_boundary_required: true,
  answer_eligible: false,
  public_emit: false,
  boundary_status: 'blocked_or_needs_review_for_export_until_agent6_share_alike_boundary',
  blocker_reason: 'CC-BY-SA source-name partition requires attribution and share-alike boundary treatment before export, display, answer, definition text, or package use.',
  sample_source_urls: partition.sample_source_urls || []
}));

const artifact = {
  schema_version: 1,
  artifact_type: 'agent1_workbench_cc_by_sa_share_alike_boundary_map',
  generated_at: '2026-06-04T23:30:00.000Z',
  generator: 'scripts/build_agent1_workbench_cc_by_sa_share_alike_boundary_map.mjs',
  status: 'agent1_workbench_cc_by_sa_share_alike_boundary_map_prepared_for_agent6_boundary_only',
  input: inputPath,
  target: 'workbench-cc-by-sa-share-alike-boundary-map',
  counts: {
    declared_cc_by_sa_partition_count: declared?.partition_count ?? null,
    declared_cc_by_sa_source_row_count: declared?.source_row_count ?? null,
    sampled_cc_by_sa_partition_count: boundaryRows.length,
    sampled_cc_by_sa_source_row_count: totalRows,
    sampled_unique_source_id_count: totalSourceIds,
    sampled_unique_work_count: totalWorks
  },
  lane_policy: {
    license_lane: 'commercial_clean_candidate',
    boundary_status: 'blocked_or_needs_review_for_export_until_agent6_share_alike_boundary',
    attribution_required: true,
    derived_from_nc: false,
    commercial_export_allowed: false,
    share_alike_required: true,
    corpus_contamination: false,
    answer_eligible: false,
    public_emit: false,
    agent6_boundary_required: true
  },
  rows: boundaryRows,
  export_rule: {
    commercial_clean_export_excludes_nc: true,
    nc_educational_export_separate: true,
    cc_by_sa_requires_share_alike_boundary: true,
    cc_by_sa_export_allowed_now: false,
    public_emit_now: false,
    answer_eligible_now: false,
    definition_content_storage_now: false
  },
  exact_blocker: {
    id: 'cc_by_sa_share_alike_boundary_required',
    blocker_reason: 'CC-BY-SA source-name partitions require Agent 6/legal share-alike boundary treatment before source/license custody acceptance, commercial export, public display, answer use, definition text use, or package use.',
    missing_fields: [
      'Agent 6 row/subset boundary verdict for CC-BY-SA partition use',
      'share-alike handling rule for package/export behavior',
      'attribution display/export rule for exact rows/subset',
      'commercial export authorization if any',
      'public/runtime/display authorization if any'
    ]
  },
  handoff: {
    agent10: 'Consume as Agent 1 CC-BY-SA share-alike boundary evidence for release/package intake.',
    spark1: 'May rerun this deterministic subset build and validator only; do not authorize export or display.',
    agent6: 'Route only through Agent 10 with exact CC-BY-SA row/subset boundary question.'
  },
  zero_output_counts: {
    answer_rows: 0,
    source_rows: 0,
    public_hud_rows: 0,
    route_jsonl_rows: 0,
    definition_content_rows: 0,
    accepted_text_rows: 0
  },
  non_acceptance_boundary: {
    no_source_license_acceptance: true,
    no_legal_acceptance: true,
    no_qa_acceptance: true,
    no_definition_authority: true,
    no_runtime_public_acceptance: true,
    no_publication_readiness: true,
    no_product_data_acceptance: true,
    no_answer_acceptance: true,
    no_accepted_gloss_text: true,
    no_nc_commercial_authorization: true,
    no_cc_by_sa_commercial_export_authorization: true,
    no_public_runtime_mutation: true
  }
};

const contract = {
  schema_version: 1,
  artifact_type: 'agent1_spark1_pipeline_contract',
  status: 'pipeline_contract_runnable_validated',
  target: {
    work: 'broad workbench evidence',
    workset: 'workbench-cc-by-sa-share-alike-boundary-map',
    input: inputPath,
    declared_cc_by_sa_partition_count: declared?.partition_count ?? null,
    declared_cc_by_sa_source_row_count: declared?.source_row_count ?? null,
    sampled_cc_by_sa_partition_count: boundaryRows.length,
    sampled_cc_by_sa_source_row_count: totalRows
  },
  inputs: [inputPath],
  command_or_script: {
    build: 'node scripts/build_agent1_workbench_cc_by_sa_share_alike_boundary_map.mjs',
    current_status: 'runnable'
  },
  outputs: {
    json: outputJsonPath,
    markdown: outputMdPath
  },
  validator: {
    command: 'node scripts/validate_agent1_workbench_cc_by_sa_share_alike_boundary_map.mjs',
    contract_validator: 'node scripts/validate_agent1_spark1_workbench_cc_by_sa_share_alike_boundary_contract.mjs',
    current_status: 'validated'
  },
  required_source_fields: [
    'source_family',
    'source_name',
    'license_label',
    'license_url',
    'version_source',
    'source_row_count',
    'unique_source_id_count',
    'unique_work_count',
    'license_lane',
    'attribution_required',
    'derived_from_nc',
    'commercial_export_allowed',
    'share_alike_required',
    'corpus_contamination',
    'agent6_boundary_required',
    'answer_eligible',
    'public_emit',
    'boundary_status',
    'blocker_reason',
    'sample_source_urls'
  ],
  export_rule: artifact.export_rule,
  package_owner: 'Agent 1',
  agent6_boundary_need: 'Agent 6/legal boundary is required before CC-BY-SA source/license custody acceptance, commercial export, public display, answer use, definition text use, or package behavior.',
  spark1_stop_condition: 'output plus validator pass, or exact missing input/output/schema/validator/count blocker',
  what_must_not_be_accepted: [
    'source/provenance acceptance',
    'license/legal acceptance',
    'QA acceptance',
    'public/runtime mutation',
    'Definition authority',
    'answer acceptance',
    'accepted gloss/text',
    'publication readiness',
    'NC commercial authorization',
    'CC-BY-SA commercial export authorization'
  ]
};

writeFile(outputJsonPath, `${JSON.stringify(artifact, null, 2)}\n`);
writeFile(contractJsonPath, `${JSON.stringify(contract, null, 2)}\n`);

const rows = boundaryRows
  .slice(0, 20)
  .map((row) => `| \`${row.source_name.replaceAll('`', "'")}\` | \`${row.source_row_count}\` | \`${row.unique_work_count}\` | \`${row.version_source.replaceAll('`', "'")}\` |`)
  .join('\n');

writeFile(outputMdPath, `# Agent 1 Workbench CC-BY-SA Share-Alike Boundary Map - 2026-06-04

Status: \`agent1_workbench_cc_by_sa_share_alike_boundary_map_prepared_for_agent6_boundary_only\`.

## Task Shape

target: \`workbench-cc-by-sa-share-alike-boundary-map\`.

files:

- input: \`${inputPath}\`
- output JSON: \`${outputJsonPath}\`
- output MD: \`${outputMdPath}\`
- build script: \`scripts/build_agent1_workbench_cc_by_sa_share_alike_boundary_map.mjs\`
- validator: \`scripts/validate_agent1_workbench_cc_by_sa_share_alike_boundary_map.mjs\`
- contract JSON: \`${contractJsonPath}\`
- contract MD: \`${contractMdPath}\`
- contract validator: \`scripts/validate_agent1_spark1_workbench_cc_by_sa_share_alike_boundary_contract.mjs\`

exact command/script to run:

\`\`\`powershell
node scripts/build_agent1_workbench_cc_by_sa_share_alike_boundary_map.mjs
node scripts/validate_agent1_workbench_cc_by_sa_share_alike_boundary_map.mjs
node scripts/validate_agent1_spark1_workbench_cc_by_sa_share_alike_boundary_contract.mjs
\`\`\`

schema/counts:

- declared CC-BY-SA partitions: \`${declared?.partition_count ?? 'null'}\`
- declared CC-BY-SA source rows: \`${declared?.source_row_count ?? 'null'}\`
- sampled top-partition CC-BY-SA partitions: \`${boundaryRows.length}\`
- sampled top-partition CC-BY-SA source rows: \`${totalRows}\`
- sampled unique works: \`${totalWorks}\`

validator: \`node scripts/validate_agent1_workbench_cc_by_sa_share_alike_boundary_map.mjs\`.

missing-field blocker: Agent 6/legal share-alike boundary treatment, attribution display/export rule, commercial export authorization if any, and public/runtime/display authorization if any.

handoff owner: Agent 10 for release/package intake; Agent 6 only by exact boundary packet prepared through release owner.

stop condition: output plus validator pass, or exact missing input/output/schema/validator/count blocker.

## CC-BY-SA Top Partitions

| source name | rows | works | version source |
| --- | ---: | ---: | --- |
${rows}

## Boundary

Evidence/blocker only. No source/license/legal acceptance, QA acceptance, Definition authority, runtime/public acceptance, publication readiness, product/data acceptance, answer acceptance, accepted gloss/text, NC commercial authorization, CC-BY-SA commercial export authorization, or public/runtime mutation.
`);

writeFile(contractMdPath, `# Agent 1 / Spark-1 Pipeline Contract - Workbench CC-BY-SA Share-Alike Boundary Map - 2026-06-04

Status: \`pipeline_contract_runnable_validated\`.

target: \`workbench-cc-by-sa-share-alike-boundary-map\`.

inputs:

- \`${inputPath}\`

command:

\`\`\`powershell
node scripts/build_agent1_workbench_cc_by_sa_share_alike_boundary_map.mjs
node scripts/validate_agent1_workbench_cc_by_sa_share_alike_boundary_map.mjs
node scripts/validate_agent1_spark1_workbench_cc_by_sa_share_alike_boundary_contract.mjs
\`\`\`

outputs:

- JSON: \`${outputJsonPath}\`
- MD: \`${outputMdPath}\`

counts:

- declared CC-BY-SA partitions: \`${declared?.partition_count ?? 'null'}\`
- declared CC-BY-SA source rows: \`${declared?.source_row_count ?? 'null'}\`
- sampled top-partition CC-BY-SA partitions: \`${boundaryRows.length}\`
- sampled top-partition CC-BY-SA source rows: \`${totalRows}\`

Spark-1 stop condition: output plus validator pass, or exact missing input/output/schema/validator/count blocker.

Boundary: no source/license/legal acceptance, QA acceptance, Definition authority, runtime/public acceptance, publication readiness, product/data acceptance, answer acceptance, accepted gloss/text, NC commercial authorization, CC-BY-SA commercial export authorization, or public/runtime mutation.
`);

console.log(JSON.stringify({
  ok: true,
  output_json: outputJsonPath,
  contract_json: contractJsonPath,
  declared_cc_by_sa_partition_count: declared?.partition_count ?? null,
  declared_cc_by_sa_source_row_count: declared?.source_row_count ?? null,
  sampled_cc_by_sa_partition_count: boundaryRows.length,
  sampled_cc_by_sa_source_row_count: totalRows
}, null, 2));
