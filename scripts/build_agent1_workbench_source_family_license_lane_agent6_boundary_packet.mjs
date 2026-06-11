#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const inputPath = 'reports/agent1-workbench-source-family-license-lane-partitions-2026-06-04.json';
const outputJsonPath = 'reports/agent1-workbench-source-family-license-lane-agent6-boundary-packet-2026-06-04.json';
const outputMdPath = 'reports/agent1-workbench-source-family-license-lane-agent6-boundary-packet-2026-06-04.md';
const contractJsonPath = 'reports/agent1-spark1-pipeline-contract-workbench-source-family-license-lane-agent6-boundary-packet-2026-06-04.json';
const contractMdPath = 'reports/agent1-spark1-pipeline-contract-workbench-source-family-license-lane-agent6-boundary-packet-2026-06-04.md';

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function writeFile(relativePath, content) {
  fs.mkdirSync(path.dirname(path.join(repoRoot, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, relativePath), content, 'utf8');
}

const input = readJson(inputPath);
const boundaryRows = (input.rows || []).map((row) => ({
  source_family: row.source_family,
  license_lane: row.license_lane,
  license_label: row.license_label,
  source_name_partition_count: row.source_name_partition_count,
  source_row_count: row.source_row_count,
  attribution_required: row.attribution_required,
  derived_from_nc: row.derived_from_nc,
  commercial_export_allowed: row.commercial_export_allowed,
  share_alike_required: row.share_alike_required,
  corpus_contamination: row.corpus_contamination,
  answer_eligible: false,
  public_emit: false,
  export_authorized_now: false,
  agent6_boundary_required: true,
  agent6_boundary_question: `For ${row.source_family} / ${row.license_label}, what exact release/package boundary, if any, permits storage, display, answer use, or export while preserving license-lane separation and attribution/share-alike flags?`,
  package_owner: 'Agent 10 release/package intake before Agent 6 routing',
  source_license_custody_owner: 'Agent 1',
  missing_boundary_fields: [
    'Agent 6/release verdict',
    'storage/display/export rule',
    'answer eligibility rule',
    'required attribution/share-alike handling if any'
  ]
}));

const artifact = {
  schema_version: 1,
  artifact_type: 'agent1_workbench_source_family_license_lane_agent6_boundary_packet',
  generated_at: '2026-06-05T01:18:00.000Z',
  generator: 'scripts/build_agent1_workbench_source_family_license_lane_agent6_boundary_packet.mjs',
  status: 'agent1_workbench_source_family_license_lane_agent6_boundary_packet_prepared_for_release_intake_only',
  input: inputPath,
  target: 'workbench-source-family-license-lane-agent6-boundary-packet',
  counts: {
    boundary_question_count: boundaryRows.length,
    source_family_license_lane_partition_count: input.counts.source_family_license_lane_partition_count,
    source_family_count: input.counts.source_family_count,
    source_name_partition_count: input.counts.source_name_partition_count,
    source_row_count: input.counts.source_row_count
  },
  boundary_rows: boundaryRows,
  handoff: {
    release_owner: 'Agent 10',
    boundary_reviewer: 'Agent 6 only through release-owner packet',
    spark1_routable: true,
    stop_condition: 'Return validated boundary packet and contract result, or exact missing input/schema/validator blocker.'
  },
  export_rule: input.export_rule,
  non_acceptance_boundary: input.non_acceptance_boundary
};

const contract = {
  schema_version: 1,
  artifact_type: 'agent1_spark1_pipeline_contract',
  status: 'pipeline_contract_runnable_validated',
  generated_at: artifact.generated_at,
  package_owner: 'Agent 1',
  target: {
    workset: artifact.target,
    boundary_question_count: artifact.counts.boundary_question_count,
    source_family_license_lane_partition_count: artifact.counts.source_family_license_lane_partition_count,
    source_family_count: artifact.counts.source_family_count,
    source_name_partition_count: artifact.counts.source_name_partition_count,
    source_row_count: artifact.counts.source_row_count
  },
  inputs: [inputPath],
  command_or_script: {
    build: 'node scripts/build_agent1_workbench_source_family_license_lane_agent6_boundary_packet.mjs'
  },
  outputs: {
    json: outputJsonPath,
    markdown: outputMdPath
  },
  output_schema: {
    required_top_level_fields: ['schema_version', 'artifact_type', 'status', 'counts', 'boundary_rows', 'handoff', 'export_rule', 'non_acceptance_boundary'],
    required_row_fields: ['source_family', 'license_lane', 'license_label', 'source_name_partition_count', 'source_row_count', 'agent6_boundary_question', 'answer_eligible', 'public_emit', 'export_authorized_now']
  },
  validator: {
    command: 'node scripts/validate_agent1_workbench_source_family_license_lane_agent6_boundary_packet.mjs',
    contract_validator: 'node scripts/validate_agent1_spark1_workbench_source_family_license_lane_agent6_boundary_packet_contract.mjs'
  },
  agent6_boundary_need: 'Agent 6/release boundary required before source/license custody acceptance, public display, answer use, definition text storage, or package/export behavior.',
  spark1_stop_condition: artifact.handoff.stop_condition,
  non_acceptance_boundary: artifact.non_acceptance_boundary
};

writeFile(outputJsonPath, `${JSON.stringify(artifact, null, 2)}\n`);
writeFile(contractJsonPath, `${JSON.stringify(contract, null, 2)}\n`);

writeFile(outputMdPath, `# Agent 1 Workbench Source-Family License-Lane Agent 6 Boundary Packet - 2026-06-04

Status: \`${artifact.status}\`.

## Counts

- boundary questions: \`${artifact.counts.boundary_question_count}\`
- source-family/license-lane partitions: \`${artifact.counts.source_family_license_lane_partition_count}\`
- source families: \`${artifact.counts.source_family_count}\`
- source-name partitions: \`${artifact.counts.source_name_partition_count}\`
- source rows: \`${artifact.counts.source_row_count}\`

## Boundary Questions

| source family | lane | license | source-name partitions | source rows | Agent 6 question |
| --- | --- | --- | ---: | ---: | --- |
${boundaryRows.map((row) => `| \`${row.source_family}\` | \`${row.license_lane}\` | \`${row.license_label}\` | \`${row.source_name_partition_count}\` | \`${row.source_row_count}\` | ${row.agent6_boundary_question} |`).join('\n')}

## Boundary

Planning evidence only. No source/license/legal acceptance, QA acceptance, Definition authority, runtime/public acceptance, publication readiness, product/data acceptance, answer acceptance, accepted gloss/text, NC commercial authorization, export authorization, or public/runtime mutation.
`);

writeFile(contractMdPath, `# Spark-1 Contract: Workbench Source-Family License-Lane Agent 6 Boundary Packet - 2026-06-04

target: \`${artifact.target}\`

counts: \`${artifact.counts.boundary_question_count}\` boundary questions; \`${artifact.counts.source_family_license_lane_partition_count}\` source-family/license-lane partitions; \`${artifact.counts.source_name_partition_count}\` source-name partitions; \`${artifact.counts.source_row_count}\` source rows.

command:

\`\`\`powershell
node scripts/build_agent1_workbench_source_family_license_lane_agent6_boundary_packet.mjs
node scripts/validate_agent1_workbench_source_family_license_lane_agent6_boundary_packet.mjs
node scripts/validate_agent1_spark1_workbench_source_family_license_lane_agent6_boundary_packet_contract.mjs
\`\`\`

Spark-1 handoff: runnable after this contract and validators exist.

Boundary: no source/license/legal acceptance, no QA acceptance, no public/runtime mutation, no accepted gloss/text.
`);

console.log(JSON.stringify({
  ok: true,
  output_json: outputJsonPath,
  contract_json: contractJsonPath,
  boundary_question_count: artifact.counts.boundary_question_count,
  source_family_license_lane_partition_count: artifact.counts.source_family_license_lane_partition_count,
  source_row_count: artifact.counts.source_row_count
}, null, 2));
