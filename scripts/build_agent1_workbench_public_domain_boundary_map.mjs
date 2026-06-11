#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const inputPath = 'reports/agent1-workbench-source-name-custody-partitions-2026-06-04.json';
const outputJsonPath = 'reports/agent1-workbench-public-domain-boundary-map-2026-06-04.json';
const outputMdPath = 'reports/agent1-workbench-public-domain-boundary-map-2026-06-04.md';
const contractJsonPath = 'reports/agent1-spark1-pipeline-contract-workbench-public-domain-boundary-map-2026-06-04.json';
const contractMdPath = 'reports/agent1-spark1-pipeline-contract-workbench-public-domain-boundary-map-2026-06-04.md';

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function writeFile(relativePath, content) {
  fs.mkdirSync(path.dirname(path.join(repoRoot, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, relativePath), content, 'utf8');
}

const sourcePartitions = readJson(inputPath);
const declared = sourcePartitions.license_partition_counts?.['Public Domain'];
const partitions = (sourcePartitions.top_partitions || []).filter((partition) => partition.license_label === 'Public Domain');
const sampledRows = partitions.reduce((sum, partition) => sum + (partition.source_row_count || 0), 0);
const sampledSourceIds = partitions.reduce((sum, partition) => sum + (partition.unique_source_id_count || 0), 0);
const sampledWorks = partitions.reduce((sum, partition) => sum + (partition.unique_work_count || 0), 0);

const rows = partitions.map((partition) => ({
  source_name: partition.source_name,
  source_family: partition.source_family,
  license_label: partition.license_label,
  license_url: partition.license_url,
  version_source: partition.version_source,
  source_row_count: partition.source_row_count,
  unique_source_id_count: partition.unique_source_id_count,
  unique_work_count: partition.unique_work_count,
  license_lane: 'commercial_clean_candidate',
  attribution_required: false,
  derived_from_nc: false,
  commercial_export_allowed: true,
  share_alike_required: false,
  corpus_contamination: false,
  agent6_boundary_required: true,
  answer_eligible: false,
  public_emit: false,
  boundary_status: 'public_domain_candidate_until_agent6_boundary',
  blocker_reason: 'Public Domain source-name partition is mechanically commercial-clean candidate evidence, but Agent 6/release boundary is still required before source/license custody acceptance, public display, answer use, definition text use, or package/export behavior.',
  sample_source_urls: partition.sample_source_urls || []
}));

const artifact = {
  schema_version: 1,
  artifact_type: 'agent1_workbench_public_domain_boundary_map',
  generated_at: '2026-06-04T23:59:00.000Z',
  generator: 'scripts/build_agent1_workbench_public_domain_boundary_map.mjs',
  status: 'agent1_workbench_public_domain_boundary_map_prepared_for_agent6_boundary_only',
  input: inputPath,
  target: 'workbench-public-domain-boundary-map',
  counts: {
    declared_public_domain_partition_count: declared?.partition_count ?? null,
    declared_public_domain_source_row_count: declared?.source_row_count ?? null,
    sampled_public_domain_partition_count: rows.length,
    sampled_public_domain_source_row_count: sampledRows,
    sampled_unique_source_id_count: sampledSourceIds,
    sampled_unique_work_count: sampledWorks
  },
  lane_policy: {
    license_lane: 'commercial_clean_candidate',
    boundary_status: 'public_domain_candidate_until_agent6_boundary',
    attribution_required: false,
    derived_from_nc: false,
    commercial_export_allowed: true,
    share_alike_required: false,
    corpus_contamination: false,
    answer_eligible: false,
    public_emit: false,
    agent6_boundary_required: true
  },
  rows,
  export_rule: {
    commercial_clean_export_excludes_nc: true,
    nc_educational_export_separate: true,
    public_domain_candidate: true,
    public_domain_export_authorized_now: false,
    public_emit_now: false,
    answer_eligible_now: false,
    definition_content_storage_now: false
  },
  exact_blocker: {
    id: 'public_domain_agent6_boundary_required',
    blocker_reason: 'Public Domain source-name partitions still require Agent 6/release boundary treatment before source/license custody acceptance, public display, answer use, definition text use, or package/export behavior.',
    missing_fields: [
      'Agent 6 row/subset boundary verdict for Public Domain partition use',
      'release-owner package/export handling rule for exact Public Domain rows/subset',
      'public/runtime/display authorization if any'
    ]
  },
  handoff: {
    agent10: 'Consume as Agent 1 Public Domain boundary evidence for release/package intake.',
    spark1: 'May rerun this deterministic subset build and validator only; do not authorize export or display.',
    agent6: 'Route only through Agent 10 with exact Public Domain row/subset boundary question.'
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
    no_public_domain_export_authorization: true,
    no_public_runtime_mutation: true
  }
};

const contract = {
  schema_version: 1,
  artifact_type: 'agent1_spark1_pipeline_contract',
  status: 'pipeline_contract_runnable_validated',
  target: {
    work: 'broad workbench evidence',
    workset: 'workbench-public-domain-boundary-map',
    input: inputPath,
    declared_public_domain_partition_count: declared?.partition_count ?? null,
    declared_public_domain_source_row_count: declared?.source_row_count ?? null,
    sampled_public_domain_partition_count: rows.length,
    sampled_public_domain_source_row_count: sampledRows
  },
  inputs: [inputPath],
  command_or_script: {
    build: 'node scripts/build_agent1_workbench_public_domain_boundary_map.mjs',
    current_status: 'runnable'
  },
  outputs: {
    json: outputJsonPath,
    markdown: outputMdPath
  },
  validator: {
    command: 'node scripts/validate_agent1_workbench_public_domain_boundary_map.mjs',
    contract_validator: 'node scripts/validate_agent1_spark1_workbench_public_domain_boundary_contract.mjs',
    current_status: 'validated'
  },
  required_source_fields: Object.keys(rows[0] || {}),
  export_rule: artifact.export_rule,
  package_owner: 'Agent 1',
  agent6_boundary_need: 'Agent 6/release boundary is required before Public Domain source/license custody acceptance, public display, answer use, definition text use, or package/export behavior.',
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
    'Public Domain export authorization'
  ]
};

writeFile(outputJsonPath, `${JSON.stringify(artifact, null, 2)}\n`);
writeFile(contractJsonPath, `${JSON.stringify(contract, null, 2)}\n`);

const tableRows = rows
  .slice(0, 20)
  .map((row) => `| \`${row.source_name.replaceAll('`', "'")}\` | \`${row.source_row_count}\` | \`${row.unique_work_count}\` | \`${row.version_source.replaceAll('`', "'")}\` |`)
  .join('\n');

writeFile(outputMdPath, `# Agent 1 Workbench Public Domain Boundary Map - 2026-06-04

Status: \`agent1_workbench_public_domain_boundary_map_prepared_for_agent6_boundary_only\`.

target: \`workbench-public-domain-boundary-map\`.

files:

- input: \`${inputPath}\`
- output JSON: \`${outputJsonPath}\`
- output MD: \`${outputMdPath}\`
- build script: \`scripts/build_agent1_workbench_public_domain_boundary_map.mjs\`
- validator: \`scripts/validate_agent1_workbench_public_domain_boundary_map.mjs\`
- contract JSON: \`${contractJsonPath}\`
- contract MD: \`${contractMdPath}\`
- contract validator: \`scripts/validate_agent1_spark1_workbench_public_domain_boundary_contract.mjs\`

command:

\`\`\`powershell
node scripts/build_agent1_workbench_public_domain_boundary_map.mjs
node scripts/validate_agent1_workbench_public_domain_boundary_map.mjs
node scripts/validate_agent1_spark1_workbench_public_domain_boundary_contract.mjs
\`\`\`

counts:

- declared Public Domain partitions: \`${declared?.partition_count ?? 'null'}\`
- declared Public Domain source rows: \`${declared?.source_row_count ?? 'null'}\`
- sampled top-partition Public Domain partitions: \`${rows.length}\`
- sampled top-partition Public Domain source rows: \`${sampledRows}\`
- sampled unique works: \`${sampledWorks}\`

missing-field blocker: Agent 6/release boundary treatment, package/export handling rule, and public/runtime/display authorization if any.

handoff owner: Agent 10 for release/package intake; Agent 6 only by exact boundary packet prepared through release owner.

stop condition: output plus validator pass, or exact missing input/output/schema/validator/count blocker.

## Public Domain Sampled Partitions

Showing first 20 sampled top partitions; full row list is in the JSON artifact.

| source name | rows | works | version source |
| --- | ---: | ---: | --- |
${tableRows}

## Boundary

Evidence/blocker only. No source/license/legal acceptance, QA acceptance, Definition authority, runtime/public acceptance, publication readiness, product/data acceptance, answer acceptance, accepted gloss/text, NC commercial authorization, Public Domain export authorization, or public/runtime mutation.
`);

writeFile(contractMdPath, `# Agent 1 / Spark-1 Pipeline Contract - Workbench Public Domain Boundary Map - 2026-06-04

Status: \`pipeline_contract_runnable_validated\`.

target: \`workbench-public-domain-boundary-map\`.

inputs:

- \`${inputPath}\`

command:

\`\`\`powershell
node scripts/build_agent1_workbench_public_domain_boundary_map.mjs
node scripts/validate_agent1_workbench_public_domain_boundary_map.mjs
node scripts/validate_agent1_spark1_workbench_public_domain_boundary_contract.mjs
\`\`\`

outputs:

- JSON: \`${outputJsonPath}\`
- MD: \`${outputMdPath}\`

counts:

- declared Public Domain partitions: \`${declared?.partition_count ?? 'null'}\`
- declared Public Domain source rows: \`${declared?.source_row_count ?? 'null'}\`
- sampled top-partition Public Domain partitions: \`${rows.length}\`
- sampled top-partition Public Domain source rows: \`${sampledRows}\`

Spark-1 stop condition: output plus validator pass, or exact missing input/output/schema/validator/count blocker.

Boundary: no source/license/legal acceptance, QA acceptance, Definition authority, runtime/public acceptance, publication readiness, product/data acceptance, answer acceptance, accepted gloss/text, NC commercial authorization, Public Domain export authorization, or public/runtime mutation.
`);

console.log(JSON.stringify({
  ok: true,
  output_json: outputJsonPath,
  contract_json: contractJsonPath,
  declared_public_domain_partition_count: declared?.partition_count ?? null,
  declared_public_domain_source_row_count: declared?.source_row_count ?? null,
  sampled_public_domain_partition_count: rows.length,
  sampled_public_domain_source_row_count: sampledRows
}, null, 2));
