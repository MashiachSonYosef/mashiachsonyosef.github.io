#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const inputPath = 'reports/agent1-workbench-full-source-name-custody-partitions-2026-06-04.json';
const outputJsonPath = 'reports/agent1-workbench-source-family-license-lane-partitions-2026-06-04.json';
const outputMdPath = 'reports/agent1-workbench-source-family-license-lane-partitions-2026-06-04.md';
const contractJsonPath = 'reports/agent1-spark1-pipeline-contract-workbench-source-family-license-lane-partitions-2026-06-04.json';
const contractMdPath = 'reports/agent1-spark1-pipeline-contract-workbench-source-family-license-lane-partitions-2026-06-04.md';

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function writeFile(relativePath, content) {
  fs.mkdirSync(path.dirname(path.join(repoRoot, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, relativePath), content, 'utf8');
}

function laneFor(row) {
  return row.license_lane || 'blocked_or_needs_review';
}

const full = readJson(inputPath);
const partitionMap = new Map();

for (const row of full.partition_rows || []) {
  const licenseLane = laneFor(row);
  const key = [row.source_family || 'missing', licenseLane, row.license_label || 'missing'].join('||');
  const current = partitionMap.get(key) || {
    source_family: row.source_family || 'missing',
    license_lane: licenseLane,
    license_label: row.license_label || 'missing',
    source_name_partition_count: 0,
    source_row_count: 0,
    unique_source_id_count: 0,
    unique_work_count: 0,
    attribution_required: Boolean(row.attribution_required),
    derived_from_nc: Boolean(row.derived_from_nc),
    commercial_export_allowed: Boolean(row.commercial_export_allowed),
    share_alike_required: Boolean(row.share_alike_required),
    corpus_contamination: Boolean(row.corpus_contamination),
    sample_source_names: []
  };
  current.source_name_partition_count += 1;
  current.source_row_count += row.source_row_count || 0;
  current.unique_source_id_count += row.unique_source_id_count || 0;
  current.unique_work_count += row.unique_work_count || 0;
  current.attribution_required = current.attribution_required || Boolean(row.attribution_required);
  current.derived_from_nc = current.derived_from_nc || Boolean(row.derived_from_nc);
  current.commercial_export_allowed = current.commercial_export_allowed && Boolean(row.commercial_export_allowed);
  current.share_alike_required = current.share_alike_required || Boolean(row.share_alike_required);
  current.corpus_contamination = current.corpus_contamination || Boolean(row.corpus_contamination);
  if (current.sample_source_names.length < 10) current.sample_source_names.push(row.source_name);
  partitionMap.set(key, current);
}

const rows = [...partitionMap.values()]
  .sort((a, b) => b.source_row_count - a.source_row_count || a.license_label.localeCompare(b.license_label))
  .map((row) => ({
    ...row,
    agent6_boundary_required: true,
    answer_eligible: false,
    public_emit: false,
    export_authorized_now: false,
    definition_content_storage_now: false,
    boundary_status: 'source_family_license_lane_boundary_required',
    missing_boundary_fields: [
      `Agent 6/release boundary verdict for ${row.source_family} / ${row.license_label}`,
      `package/export handling rule for ${row.source_family} / ${row.license_label}`,
      'public/runtime/display authorization if any'
    ]
  }));

const laneCounts = rows.reduce((acc, row) => {
  acc[row.license_lane] ||= { partition_count: 0, source_row_count: 0 };
  acc[row.license_lane].partition_count += row.source_name_partition_count;
  acc[row.license_lane].source_row_count += row.source_row_count;
  return acc;
}, {});

const artifact = {
  schema_version: 1,
  artifact_type: 'agent1_workbench_source_family_license_lane_partitions',
  generated_at: '2026-06-05T01:05:00.000Z',
  generator: 'scripts/build_agent1_workbench_source_family_license_lane_partitions.mjs',
  status: 'agent1_workbench_source_family_license_lane_partitions_prepared_for_agent6_boundary_only',
  input: inputPath,
  target: 'workbench-source-family-license-lane-partitions',
  counts: {
    source_family_license_lane_partition_count: rows.length,
    source_family_count: new Set(rows.map((row) => row.source_family)).size,
    source_name_partition_count: full.counts.source_name_partition_count,
    source_row_count: full.counts.source_row_count,
    commercial_clean_source_name_partition_count: laneCounts.commercial_clean_candidate?.partition_count || 0,
    commercial_clean_source_row_count: laneCounts.commercial_clean_candidate?.source_row_count || 0,
    noncommercial_educational_source_name_partition_count: laneCounts.noncommercial_educational_candidate?.partition_count || 0,
    noncommercial_educational_source_row_count: laneCounts.noncommercial_educational_candidate?.source_row_count || 0,
    blocked_or_needs_review_source_name_partition_count: laneCounts.blocked_or_needs_review?.partition_count || 0,
    blocked_or_needs_review_source_row_count: laneCounts.blocked_or_needs_review?.source_row_count || 0
  },
  lane_counts: laneCounts,
  rows,
  export_rule: {
    commercial_clean_export_excludes_nc: true,
    nc_educational_export_separate: true,
    metadata_or_link_only_no_definition_text: true,
    blocked_or_needs_review_no_candidate_text: true,
    all_partitions_export_authorized_now: false,
    public_emit_now: false,
    answer_eligible_now: false,
    definition_content_storage_now: false
  },
  exact_blocker: {
    id: 'source_family_license_lane_agent6_boundary_required',
    blocker_reason: 'Workbench source-family/license-lane partitions require Agent 6/release boundary treatment before source/license custody acceptance, public display, answer use, definition text use, or package/export behavior.'
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
  generated_at: artifact.generated_at,
  package_owner: 'Agent 1',
  target: {
    workset: artifact.target,
    source_family_license_lane_partition_count: artifact.counts.source_family_license_lane_partition_count,
    source_family_count: artifact.counts.source_family_count,
    source_name_partition_count: artifact.counts.source_name_partition_count,
    source_row_count: artifact.counts.source_row_count
  },
  inputs: [inputPath],
  command_or_script: {
    build: 'node scripts/build_agent1_workbench_source_family_license_lane_partitions.mjs'
  },
  outputs: {
    json: outputJsonPath,
    markdown: outputMdPath
  },
  output_schema: {
    required_top_level_fields: ['schema_version', 'artifact_type', 'status', 'counts', 'lane_counts', 'rows', 'export_rule', 'non_acceptance_boundary'],
    required_row_fields: ['source_family', 'license_lane', 'license_label', 'source_name_partition_count', 'source_row_count', 'attribution_required', 'derived_from_nc', 'commercial_export_allowed', 'corpus_contamination', 'agent6_boundary_required', 'answer_eligible', 'public_emit', 'export_authorized_now']
  },
  validator: {
    command: 'node scripts/validate_agent1_workbench_source_family_license_lane_partitions.mjs',
    contract_validator: 'node scripts/validate_agent1_spark1_workbench_source_family_license_lane_partitions_contract.mjs'
  },
  license_flags: {
    commercial_clean_export_excludes_nc: true,
    noncommercial_educational_export_separate: true,
    derived_from_nc_preserved: true,
    commercial_export_allowed_preserved_by_partition: true,
    attribution_required_preserved_by_partition: true,
    corpus_contamination_preserved_by_partition: true
  },
  agent6_boundary_need: 'Agent 6/release boundary required before source/license custody acceptance, public display, answer use, definition text storage, or package/export behavior.',
  spark1_stop_condition: 'Return validated source-family/license-lane partition packet and contract result, or exact missing input/schema/validator blocker.',
  non_acceptance_boundary: artifact.non_acceptance_boundary
};

writeFile(outputJsonPath, `${JSON.stringify(artifact, null, 2)}\n`);
writeFile(contractJsonPath, `${JSON.stringify(contract, null, 2)}\n`);

writeFile(outputMdPath, `# Agent 1 Workbench Source-Family License-Lane Partitions - 2026-06-04

Status: \`${artifact.status}\`.

## Counts

- source-family/license-lane partitions: \`${artifact.counts.source_family_license_lane_partition_count}\`
- source families: \`${artifact.counts.source_family_count}\`
- source-name partitions: \`${artifact.counts.source_name_partition_count}\`
- source rows: \`${artifact.counts.source_row_count}\`
- commercial-clean source-name partitions / rows: \`${artifact.counts.commercial_clean_source_name_partition_count}\` / \`${artifact.counts.commercial_clean_source_row_count}\`
- NC educational source-name partitions / rows: \`${artifact.counts.noncommercial_educational_source_name_partition_count}\` / \`${artifact.counts.noncommercial_educational_source_row_count}\`
- blocked/review source-name partitions / rows: \`${artifact.counts.blocked_or_needs_review_source_name_partition_count}\` / \`${artifact.counts.blocked_or_needs_review_source_row_count}\`

## Rows

| source family | lane | license | source-name partitions | source rows | attribution | commercial export allowed | Agent 6 boundary |
| --- | --- | --- | ---: | ---: | --- | --- | --- |
${rows.map((row) => `| \`${row.source_family}\` | \`${row.license_lane}\` | \`${row.license_label}\` | \`${row.source_name_partition_count}\` | \`${row.source_row_count}\` | \`${row.attribution_required}\` | \`${row.commercial_export_allowed}\` | \`${row.agent6_boundary_required}\` |`).join('\n')}

## Boundary

Planning evidence only. No source/license/legal acceptance, QA acceptance, Definition authority, runtime/public acceptance, publication readiness, product/data acceptance, answer acceptance, accepted gloss/text, NC commercial authorization, export authorization, or public/runtime mutation.
`);

writeFile(contractMdPath, `# Spark-1 Contract: Workbench Source-Family License-Lane Partitions - 2026-06-04

target: \`${artifact.target}\`

source/license counts: \`${artifact.counts.source_family_license_lane_partition_count}\` source-family/license-lane partitions; \`${artifact.counts.source_name_partition_count}\` source-name partitions; \`${artifact.counts.source_row_count}\` source rows.

command:

\`\`\`powershell
node scripts/build_agent1_workbench_source_family_license_lane_partitions.mjs
node scripts/validate_agent1_workbench_source_family_license_lane_partitions.mjs
node scripts/validate_agent1_spark1_workbench_source_family_license_lane_partitions_contract.mjs
\`\`\`

Spark-1 handoff: runnable after this contract and validators exist.

Agent 6 boundary: required before source/license custody acceptance, public display, answer use, definition text storage, or package/export behavior.

Boundary: no source/license/legal acceptance, no QA acceptance, no public/runtime mutation, no accepted gloss/text.
`);

console.log(JSON.stringify({
  ok: true,
  output_json: outputJsonPath,
  contract_json: contractJsonPath,
  source_family_license_lane_partition_count: artifact.counts.source_family_license_lane_partition_count,
  source_name_partition_count: artifact.counts.source_name_partition_count,
  source_row_count: artifact.counts.source_row_count
}, null, 2));
