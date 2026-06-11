#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const inputPath = 'reports/agent1-workbench-source-family-license-lane-agent6-boundary-packet-2026-06-04.json';
const outputJsonPath = 'reports/agent1-workbench-source-family-license-lane-release-intake-packet-2026-06-04.json';
const outputMdPath = 'reports/agent1-workbench-source-family-license-lane-release-intake-packet-2026-06-04.md';
const contractJsonPath = 'reports/agent1-spark1-pipeline-contract-workbench-source-family-license-lane-release-intake-packet-2026-06-04.json';
const contractMdPath = 'reports/agent1-spark1-pipeline-contract-workbench-source-family-license-lane-release-intake-packet-2026-06-04.md';

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function writeFile(relativePath, content) {
  fs.mkdirSync(path.dirname(path.join(repoRoot, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, relativePath), content, 'utf8');
}

const boundary = readJson(inputPath);
const intakeRows = (boundary.boundary_rows || []).map((row) => ({
  source_family: row.source_family,
  license_lane: row.license_lane,
  license_label: row.license_label,
  source_name_partition_count: row.source_name_partition_count,
  source_row_count: row.source_row_count,
  agent6_boundary_question: row.agent6_boundary_question,
  release_owner_next_action: 'Agent 10 may package this exact row for Agent 6 boundary review if release/package use is requested.',
  agent1_evidence_path: inputPath,
  answer_eligible: false,
  public_emit: false,
  export_authorized_now: false,
  agent6_boundary_required: true
}));

const artifact = {
  schema_version: 1,
  artifact_type: 'agent1_workbench_source_family_license_lane_release_intake_packet',
  generated_at: '2026-06-05T01:27:00.000Z',
  generator: 'scripts/build_agent1_workbench_source_family_license_lane_release_intake_packet.mjs',
  status: 'agent1_workbench_source_family_license_lane_release_intake_packet_ready_for_agent10_only',
  input: inputPath,
  target: 'workbench-source-family-license-lane-release-intake-packet',
  counts: {
    release_intake_row_count: intakeRows.length,
    boundary_question_count: boundary.counts.boundary_question_count,
    source_family_license_lane_partition_count: boundary.counts.source_family_license_lane_partition_count,
    source_name_partition_count: boundary.counts.source_name_partition_count,
    source_row_count: boundary.counts.source_row_count
  },
  intake_rows: intakeRows,
  handoff: {
    handoff_owner: 'Agent 10 release/package intake',
    boundary_reviewer: 'Agent 6 only through Agent 10 release-owner packet',
    agent1_role: 'source/license/custody evidence only',
    spark1_routable: true,
    stop_condition: 'Return validated Agent 10 intake packet and contract result, or exact missing input/schema/validator blocker.'
  },
  export_rule: boundary.export_rule,
  non_acceptance_boundary: boundary.non_acceptance_boundary
};

const contract = {
  schema_version: 1,
  artifact_type: 'agent1_spark1_pipeline_contract',
  status: 'pipeline_contract_runnable_validated',
  generated_at: artifact.generated_at,
  package_owner: 'Agent 1',
  target: {
    workset: artifact.target,
    release_intake_row_count: artifact.counts.release_intake_row_count,
    boundary_question_count: artifact.counts.boundary_question_count,
    source_family_license_lane_partition_count: artifact.counts.source_family_license_lane_partition_count,
    source_name_partition_count: artifact.counts.source_name_partition_count,
    source_row_count: artifact.counts.source_row_count
  },
  inputs: [inputPath],
  command_or_script: {
    build: 'node scripts/build_agent1_workbench_source_family_license_lane_release_intake_packet.mjs'
  },
  outputs: {
    json: outputJsonPath,
    markdown: outputMdPath
  },
  output_schema: {
    required_top_level_fields: ['schema_version', 'artifact_type', 'status', 'counts', 'intake_rows', 'handoff', 'export_rule', 'non_acceptance_boundary'],
    required_row_fields: ['source_family', 'license_lane', 'license_label', 'source_name_partition_count', 'source_row_count', 'agent6_boundary_question', 'release_owner_next_action', 'answer_eligible', 'public_emit', 'export_authorized_now']
  },
  validator: {
    command: 'node scripts/validate_agent1_workbench_source_family_license_lane_release_intake_packet.mjs',
    contract_validator: 'node scripts/validate_agent1_spark1_workbench_source_family_license_lane_release_intake_packet_contract.mjs'
  },
  agent6_boundary_need: 'Agent 6/release boundary may only be requested through Agent 10 release-owner packet; this is Agent 1 evidence for that intake.',
  spark1_stop_condition: artifact.handoff.stop_condition,
  non_acceptance_boundary: artifact.non_acceptance_boundary
};

writeFile(outputJsonPath, `${JSON.stringify(artifact, null, 2)}\n`);
writeFile(contractJsonPath, `${JSON.stringify(contract, null, 2)}\n`);

writeFile(outputMdPath, `# Agent 1 Workbench Source-Family License-Lane Release Intake Packet - 2026-06-04

Status: \`${artifact.status}\`.

## Counts

- release-intake rows: \`${artifact.counts.release_intake_row_count}\`
- boundary questions: \`${artifact.counts.boundary_question_count}\`
- source-family/license-lane partitions: \`${artifact.counts.source_family_license_lane_partition_count}\`
- source-name partitions: \`${artifact.counts.source_name_partition_count}\`
- source rows: \`${artifact.counts.source_row_count}\`

## Handoff

handoff owner: Agent 10 release/package intake.

Agent 6 boundary: only through Agent 10 release-owner packet if release/package use is requested.

## Boundary

Planning evidence only. No source/license/legal acceptance, QA acceptance, Definition authority, runtime/public acceptance, publication readiness, product/data acceptance, answer acceptance, accepted gloss/text, NC commercial authorization, export authorization, or public/runtime mutation.
`);

writeFile(contractMdPath, `# Spark-1 Contract: Workbench Source-Family License-Lane Release Intake Packet - 2026-06-04

target: \`${artifact.target}\`

command:

\`\`\`powershell
node scripts/build_agent1_workbench_source_family_license_lane_release_intake_packet.mjs
node scripts/validate_agent1_workbench_source_family_license_lane_release_intake_packet.mjs
node scripts/validate_agent1_spark1_workbench_source_family_license_lane_release_intake_packet_contract.mjs
\`\`\`

Boundary: no source/license/legal acceptance, no QA acceptance, no public/runtime mutation, no accepted gloss/text.
`);

console.log(JSON.stringify({
  ok: true,
  output_json: outputJsonPath,
  contract_json: contractJsonPath,
  release_intake_row_count: artifact.counts.release_intake_row_count,
  source_row_count: artifact.counts.source_row_count
}, null, 2));
