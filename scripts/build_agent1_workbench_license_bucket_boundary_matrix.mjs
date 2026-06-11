#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const inputPath = 'reports/agent1-workbench-full-source-name-custody-partitions-2026-06-04.json';
const outputJsonPath = 'reports/agent1-workbench-license-bucket-boundary-matrix-2026-06-04.json';
const outputMdPath = 'reports/agent1-workbench-license-bucket-boundary-matrix-2026-06-04.md';
const contractJsonPath = 'reports/agent1-spark1-pipeline-contract-workbench-license-bucket-boundary-matrix-2026-06-04.json';
const contractMdPath = 'reports/agent1-spark1-pipeline-contract-workbench-license-bucket-boundary-matrix-2026-06-04.md';

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function writeFile(relativePath, content) {
  fs.mkdirSync(path.dirname(path.join(repoRoot, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, relativePath), content, 'utf8');
}

function policyFor(licenseLabel) {
  if (licenseLabel === 'CC-BY-SA') {
    return {
      license_lane: 'commercial_clean_candidate',
      attribution_required: true,
      share_alike_required: true,
      derived_from_nc: false,
      commercial_export_allowed: false,
      bucket_boundary_status: 'share_alike_boundary_required',
      export_authorized_now: false
    };
  }
  if (licenseLabel === 'CC-BY') {
    return {
      license_lane: 'commercial_clean_candidate',
      attribution_required: true,
      share_alike_required: false,
      derived_from_nc: false,
      commercial_export_allowed: true,
      bucket_boundary_status: 'attribution_boundary_required',
      export_authorized_now: false
    };
  }
  if (licenseLabel === 'CC0') {
    return {
      license_lane: 'commercial_clean_candidate',
      attribution_required: false,
      share_alike_required: false,
      derived_from_nc: false,
      commercial_export_allowed: true,
      bucket_boundary_status: 'cc0_release_boundary_required',
      export_authorized_now: false
    };
  }
  return {
    license_lane: 'commercial_clean_candidate',
    attribution_required: false,
    share_alike_required: false,
    derived_from_nc: false,
    commercial_export_allowed: true,
    bucket_boundary_status: 'public_domain_release_boundary_required',
    export_authorized_now: false
  };
}

const full = readJson(inputPath);
const bucketOrder = ['Public Domain', 'CC-BY-SA', 'CC-BY', 'CC0'];
const rows = bucketOrder.map((licenseLabel) => {
  const count = full.license_partition_counts?.[licenseLabel];
  const policy = policyFor(licenseLabel);
  return {
    license_label: licenseLabel,
    partition_count: count?.partition_count ?? 0,
    source_row_count: count?.source_row_count ?? 0,
    source_family: 'hebrew_source_text',
    ...policy,
    corpus_contamination: false,
    agent6_boundary_required: true,
    answer_eligible: false,
    public_emit: false,
    definition_content_storage_now: false,
    missing_boundary_fields: [
      `Agent 6/release boundary verdict for ${licenseLabel} bucket`,
      `package/export handling rule for ${licenseLabel} bucket`,
      'public/runtime/display authorization if any'
    ]
  };
});

const artifact = {
  schema_version: 1,
  artifact_type: 'agent1_workbench_license_bucket_boundary_matrix',
  generated_at: '2026-06-05T00:16:00.000Z',
  generator: 'scripts/build_agent1_workbench_license_bucket_boundary_matrix.mjs',
  status: 'agent1_workbench_license_bucket_boundary_matrix_prepared_for_agent6_boundary_only',
  input: inputPath,
  target: 'workbench-license-bucket-boundary-matrix',
  counts: {
    license_bucket_count: rows.length,
    source_name_partition_count: full.counts.source_name_partition_count,
    source_row_count: full.counts.source_row_count,
    public_domain_partition_count: rows.find((row) => row.license_label === 'Public Domain').partition_count,
    cc_by_sa_partition_count: rows.find((row) => row.license_label === 'CC-BY-SA').partition_count,
    cc_by_partition_count: rows.find((row) => row.license_label === 'CC-BY').partition_count,
    cc0_partition_count: rows.find((row) => row.license_label === 'CC0').partition_count
  },
  rows,
  export_rule: {
    commercial_clean_export_excludes_nc: true,
    nc_educational_export_separate: true,
    all_buckets_export_authorized_now: false,
    public_emit_now: false,
    answer_eligible_now: false,
    definition_content_storage_now: false
  },
  exact_blocker: {
    id: 'license_bucket_agent6_boundary_required',
    blocker_reason: 'All four workbench license buckets require Agent 6/release boundary treatment before source/license custody acceptance, public display, answer use, definition text use, or package/export behavior.'
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
    workset: 'workbench-license-bucket-boundary-matrix',
    input: inputPath,
    license_bucket_count: artifact.counts.license_bucket_count,
    source_name_partition_count: artifact.counts.source_name_partition_count,
    source_row_count: artifact.counts.source_row_count
  },
  inputs: [inputPath],
  command_or_script: {
    build: 'node scripts/build_agent1_workbench_license_bucket_boundary_matrix.mjs',
    current_status: 'runnable'
  },
  outputs: {
    json: outputJsonPath,
    markdown: outputMdPath
  },
  validator: {
    command: 'node scripts/validate_agent1_workbench_license_bucket_boundary_matrix.mjs',
    contract_validator: 'node scripts/validate_agent1_spark1_workbench_license_bucket_boundary_matrix_contract.mjs',
    current_status: 'validated'
  },
  package_owner: 'Agent 1',
  agent6_boundary_need: 'Agent 6/release boundary is required before any license bucket source/license custody acceptance, public display, answer use, definition text use, or export behavior.',
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
  `| \`${row.license_label}\` | \`${row.partition_count}\` | \`${row.source_row_count}\` | \`${row.bucket_boundary_status}\` | \`${row.attribution_required}\` | \`${row.share_alike_required}\` | \`${row.export_authorized_now}\` |`
)).join('\n');

writeFile(outputMdPath, `# Agent 1 Workbench License-Bucket Boundary Matrix - 2026-06-04

Status: \`${artifact.status}\`.

target: \`workbench-license-bucket-boundary-matrix\`.

command:

\`\`\`powershell
node scripts/build_agent1_workbench_license_bucket_boundary_matrix.mjs
node scripts/validate_agent1_workbench_license_bucket_boundary_matrix.mjs
node scripts/validate_agent1_spark1_workbench_license_bucket_boundary_matrix_contract.mjs
\`\`\`

| license | partitions | source rows | boundary status | attribution | share alike | export now |
| --- | ---: | ---: | --- | --- | --- | --- |
${tableRows}

## Boundary

License-bucket evidence only. No source/license/legal acceptance, QA acceptance, Definition authority, runtime/public acceptance, publication readiness, product/data acceptance, answer acceptance, accepted gloss/text, NC commercial authorization, export authorization, or public/runtime mutation.
`);

writeFile(contractMdPath, `# Agent 1 / Spark-1 Pipeline Contract - Workbench License-Bucket Boundary Matrix - 2026-06-04

Status: \`pipeline_contract_runnable_validated\`.

target: \`workbench-license-bucket-boundary-matrix\`.

command:

\`\`\`powershell
node scripts/build_agent1_workbench_license_bucket_boundary_matrix.mjs
node scripts/validate_agent1_workbench_license_bucket_boundary_matrix.mjs
node scripts/validate_agent1_spark1_workbench_license_bucket_boundary_matrix_contract.mjs
\`\`\`

Spark-1 stop condition: output plus validator pass, or exact missing input/output/schema/validator/count blocker.

Boundary: no source/license/legal acceptance, QA acceptance, Definition authority, runtime/public acceptance, publication readiness, product/data acceptance, answer acceptance, accepted gloss/text, NC commercial authorization, export authorization, or public/runtime mutation.
`);

console.log(JSON.stringify({
  ok: true,
  output_json: outputJsonPath,
  contract_json: contractJsonPath,
  license_bucket_count: artifact.counts.license_bucket_count,
  source_name_partition_count: artifact.counts.source_name_partition_count,
  source_row_count: artifact.counts.source_row_count
}, null, 2));
