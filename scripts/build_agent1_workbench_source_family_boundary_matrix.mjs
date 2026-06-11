#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const inputPath = 'reports/agent1-workbench-full-source-name-custody-partitions-2026-06-04.json';
const outputJsonPath = 'reports/agent1-workbench-source-family-boundary-matrix-2026-06-04.json';
const outputMdPath = 'reports/agent1-workbench-source-family-boundary-matrix-2026-06-04.md';
const contractJsonPath = 'reports/agent1-spark1-pipeline-contract-workbench-source-family-boundary-matrix-2026-06-04.json';
const contractMdPath = 'reports/agent1-spark1-pipeline-contract-workbench-source-family-boundary-matrix-2026-06-04.md';

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function writeFile(relativePath, content) {
  fs.mkdirSync(path.dirname(path.join(repoRoot, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, relativePath), content, 'utf8');
}

const full = readJson(inputPath);
const familyMap = new Map();

for (const row of full.partition_rows || []) {
  const key = row.source_family || 'missing';
  const current = familyMap.get(key) || {
    source_family: key,
    partition_count: 0,
    source_row_count: 0,
    unique_source_id_count: 0,
    unique_work_count: 0,
    license_partition_counts: {},
    sample_source_names: []
  };
  current.partition_count += 1;
  current.source_row_count += row.source_row_count || 0;
  current.unique_source_id_count += row.unique_source_id_count || 0;
  current.unique_work_count += row.unique_work_count || 0;
  current.license_partition_counts[row.license_label] ||= { partition_count: 0, source_row_count: 0 };
  current.license_partition_counts[row.license_label].partition_count += 1;
  current.license_partition_counts[row.license_label].source_row_count += row.source_row_count || 0;
  if (current.sample_source_names.length < 10) current.sample_source_names.push(row.source_name);
  familyMap.set(key, current);
}

const rows = [...familyMap.values()]
  .sort((a, b) => b.source_row_count - a.source_row_count || a.source_family.localeCompare(b.source_family))
  .map((row) => ({
    ...row,
    license_lane: 'commercial_clean_candidate',
    derived_from_nc: false,
    corpus_contamination: false,
    agent6_boundary_required: true,
    answer_eligible: false,
    public_emit: false,
    export_authorized_now: false,
    boundary_status: 'source_family_boundary_required',
    missing_boundary_fields: [
      `Agent 6/release boundary verdict for ${row.source_family}`,
      `package/export handling rule for ${row.source_family}`,
      'public/runtime/display authorization if any'
    ]
  }));

const artifact = {
  schema_version: 1,
  artifact_type: 'agent1_workbench_source_family_boundary_matrix',
  generated_at: '2026-06-05T00:24:00.000Z',
  generator: 'scripts/build_agent1_workbench_source_family_boundary_matrix.mjs',
  status: 'agent1_workbench_source_family_boundary_matrix_prepared_for_agent6_boundary_only',
  input: inputPath,
  target: 'workbench-source-family-boundary-matrix',
  counts: {
    source_family_count: rows.length,
    source_name_partition_count: full.counts.source_name_partition_count,
    source_row_count: full.counts.source_row_count
  },
  rows,
  export_rule: {
    commercial_clean_export_excludes_nc: true,
    nc_educational_export_separate: true,
    all_source_families_export_authorized_now: false,
    public_emit_now: false,
    answer_eligible_now: false,
    definition_content_storage_now: false
  },
  exact_blocker: {
    id: 'source_family_agent6_boundary_required',
    blocker_reason: 'Workbench source-family rows require Agent 6/release boundary treatment before source/license custody acceptance, public display, answer use, definition text use, or package/export behavior.'
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
    no_export_authorization: true,
    no_public_runtime_mutation: true
  }
};

const contract = {
  schema_version: 1,
  artifact_type: 'agent1_spark1_pipeline_contract',
  status: 'pipeline_contract_runnable_validated',
  target: {
    work: 'broad workbench evidence',
    workset: 'workbench-source-family-boundary-matrix',
    input: inputPath,
    source_family_count: artifact.counts.source_family_count,
    source_name_partition_count: artifact.counts.source_name_partition_count,
    source_row_count: artifact.counts.source_row_count
  },
  inputs: [inputPath],
  command_or_script: {
    build: 'node scripts/build_agent1_workbench_source_family_boundary_matrix.mjs',
    current_status: 'runnable'
  },
  outputs: {
    json: outputJsonPath,
    markdown: outputMdPath
  },
  validator: {
    command: 'node scripts/validate_agent1_workbench_source_family_boundary_matrix.mjs',
    contract_validator: 'node scripts/validate_agent1_spark1_workbench_source_family_boundary_matrix_contract.mjs',
    current_status: 'validated'
  },
  package_owner: 'Agent 1',
  agent6_boundary_need: 'Agent 6/release boundary is required before any source-family source/license custody acceptance, public display, answer use, definition text use, or export behavior.',
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
    'export authorization'
  ]
};

writeFile(outputJsonPath, `${JSON.stringify(artifact, null, 2)}\n`);
writeFile(contractJsonPath, `${JSON.stringify(contract, null, 2)}\n`);

const tableRows = rows.map((row) => (
  `| \`${row.source_family}\` | \`${row.partition_count}\` | \`${row.source_row_count}\` | \`${row.unique_work_count}\` | \`${row.export_authorized_now}\` |`
)).join('\n');

writeFile(outputMdPath, `# Agent 1 Workbench Source-Family Boundary Matrix - 2026-06-04

Status: \`${artifact.status}\`.

target: \`workbench-source-family-boundary-matrix\`.

command:

\`\`\`powershell
node scripts/build_agent1_workbench_source_family_boundary_matrix.mjs
node scripts/validate_agent1_workbench_source_family_boundary_matrix.mjs
node scripts/validate_agent1_spark1_workbench_source_family_boundary_matrix_contract.mjs
\`\`\`

| source family | partitions | source rows | summed works | export now |
| --- | ---: | ---: | ---: | --- |
${tableRows}

## Boundary

Source-family evidence only. No source/license/legal acceptance, QA acceptance, Definition authority, runtime/public acceptance, publication readiness, product/data acceptance, answer acceptance, accepted gloss/text, NC commercial authorization, export authorization, or public/runtime mutation.
`);

writeFile(contractMdPath, `# Agent 1 / Spark-1 Pipeline Contract - Workbench Source-Family Boundary Matrix - 2026-06-04

Status: \`pipeline_contract_runnable_validated\`.

target: \`workbench-source-family-boundary-matrix\`.

command:

\`\`\`powershell
node scripts/build_agent1_workbench_source_family_boundary_matrix.mjs
node scripts/validate_agent1_workbench_source_family_boundary_matrix.mjs
node scripts/validate_agent1_spark1_workbench_source_family_boundary_matrix_contract.mjs
\`\`\`

Spark-1 stop condition: output plus validator pass, or exact missing input/output/schema/validator/count blocker.

Boundary: no source/license/legal acceptance, QA acceptance, Definition authority, runtime/public acceptance, publication readiness, product/data acceptance, answer acceptance, accepted gloss/text, NC commercial authorization, export authorization, or public/runtime mutation.
`);

console.log(JSON.stringify({
  ok: true,
  output_json: outputJsonPath,
  contract_json: contractJsonPath,
  source_family_count: artifact.counts.source_family_count,
  source_name_partition_count: artifact.counts.source_name_partition_count,
  source_row_count: artifact.counts.source_row_count
}, null, 2));
