#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const inputs = {
  agent10_workset: 'reports/agent10-agent2-ready-broad-workbench-token-inventory-5000-workset-2026-06-04.json',
  agent2_return: 'reports/agent2-broad-workbench-token-inventory-5000-return-2026-06-04.json',
  inventory: '.local-cache/workbench-evidence/token-inventory-5000.json',
  tokens_jsonl: '.local-cache/workbench-evidence/token-inventory-5000.tokens.jsonl',
  inventory_report: 'reports/workbench-token-inventory-5000.md'
};

const outputJsonPath = 'reports/agent1-broad-workbench-token-inventory-5000-source-lane-blocker-2026-06-04.json';
const outputMdPath = 'reports/agent1-broad-workbench-token-inventory-5000-source-lane-blocker-2026-06-04.md';
const contractJsonPath = 'reports/agent1-spark1-pipeline-contract-broad-workbench-token-inventory-5000-source-lane-blocker-2026-06-04.json';
const contractMdPath = 'reports/agent1-spark1-pipeline-contract-broad-workbench-token-inventory-5000-source-lane-blocker-2026-06-04.md';

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function writeFile(relativePath, content) {
  fs.mkdirSync(path.dirname(path.join(repoRoot, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, relativePath), content, 'utf8');
}

const workset = readJson(inputs.agent10_workset);
const agent2Return = readJson(inputs.agent2_return);
const inventory = readJson(inputs.inventory);
const topTokens = inventory.top_tokens || [];

const requiredSourceLaneFields = workset.source_lane_fields;
const missingByField = Object.fromEntries(requiredSourceLaneFields.map((field) => [field, 0]));
for (const token of topTokens) {
  for (const field of requiredSourceLaneFields) {
    if (token[field] === undefined || token[field] === null || token[field] === '') {
      missingByField[field] += 1;
    }
  }
}

const sourceLaneCompleteRows = topTokens.filter((token) =>
  requiredSourceLaneFields.every((field) => token[field] !== undefined && token[field] !== null && token[field] !== '')
).length;

const blockerRows = topTokens.length - sourceLaneCompleteRows;
const sampleBlockedRows = topTokens.slice(0, 10).map((token, index) => ({
  row_index: index,
  token_key: token.token_key,
  token_normalized: token.token_normalized,
  occurrence_count: token.occurrence_count,
  missing_fields: requiredSourceLaneFields.filter((field) => token[field] === undefined || token[field] === null || token[field] === '')
}));

const artifact = {
  schema_version: 1,
  artifact_type: 'agent1_broad_workbench_token_inventory_5000_source_lane_blocker',
  generated_at: '2026-06-05T01:52:00.000Z',
  generator: 'scripts/build_agent1_broad_workbench_token_inventory_5000_source_lane_blocker.mjs',
  status: 'exact_source_lane_join_blocker_returned',
  target: 'broad-workbench-token-inventory-5000-source-lane-join',
  inputs,
  counts: {
    inventory_top_token_rows: topTokens.length,
    inventory_total_tokens: inventory.counts.total_tokens,
    inventory_distinct_normalized_tokens: inventory.counts.distinct_normalized_tokens,
    source_files_read: inventory.counts.source_files_read,
    allowed_units: inventory.counts.allowed_units,
    blocked_units: inventory.counts.blocked_units,
    source_lane_complete_rows: sourceLaneCompleteRows,
    source_lane_blocker_rows: blockerRows,
    candidate_text_rows_now: 0,
    definition_content_rows_now: 0,
    answer_eligible_rows_now: 0,
    public_emit_rows_now: 0
  },
  required_source_lane_fields: requiredSourceLaneFields,
  missing_source_lane_fields_by_count: missingByField,
  allowed_license_lanes: workset.allowed_license_lanes,
  nc_partition_allowed: workset.nc_partition_allowed,
  required_nc_flags: workset.required_nc_flags,
  license_counts_from_inventory: inventory.license_counts,
  sample_blocked_rows: sampleBlockedRows,
  exact_missing_field_blocker: {
    status: 'source_lane_join_missing',
    blocker: 'token_inventory_rows_do_not_carry_source_family_source_name_license_lane_source_url_or_citation',
    blocked_rows: blockerRows,
    missing_fields: requiredSourceLaneFields,
    next_command_needed: 'Agent 1 source-lane join pipeline that maps each token row to source_family, source_name, license_label, license_lane, source_url_or_citation, and agent6_boundary_required from exact source/custody evidence.',
    handoff_owner: 'Agent 1 for source/license/custody join pipeline; Agent 10 for release intake; Agent 6 only by exact boundary packet after a joined row/subset exists.'
  },
  downstream_effect: {
    may_use_inventory_as_nonpublic_source_license_inventory: true,
    may_generate_candidate_text_rows: false,
    may_export_candidate_text: false,
    may_store_definition_content: false,
    may_mark_answer_eligible: false,
    may_public_emit: false
  },
  zero_boundary: agent2Return.zero_boundary,
  zero_emission_counters: agent2Return.zero_emission_counters,
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
    no_public_runtime_mutation: true
  }
};

const contract = {
  schema_version: 1,
  artifact_type: 'agent1_spark1_pipeline_contract',
  status: 'pipeline_contract_runnable_validated_with_exact_source_lane_join_blocker',
  generated_at: artifact.generated_at,
  package_owner: 'Agent 1',
  target: {
    workset: artifact.target,
    inventory_top_token_rows: artifact.counts.inventory_top_token_rows,
    source_lane_blocker_rows: artifact.counts.source_lane_blocker_rows,
    source_lane_complete_rows: artifact.counts.source_lane_complete_rows,
    candidate_text_rows_now: 0
  },
  inputs: Object.values(inputs),
  command_or_script: {
    build: 'node scripts/build_agent1_broad_workbench_token_inventory_5000_source_lane_blocker.mjs'
  },
  outputs: {
    json: outputJsonPath,
    markdown: outputMdPath
  },
  output_schema: {
    required_top_level_fields: ['schema_version', 'artifact_type', 'status', 'target', 'inputs', 'counts', 'required_source_lane_fields', 'missing_source_lane_fields_by_count', 'exact_missing_field_blocker', 'downstream_effect', 'zero_emission_counters', 'non_acceptance_boundary']
  },
  validator: {
    command: 'node scripts/validate_agent1_broad_workbench_token_inventory_5000_source_lane_blocker.mjs',
    contract_validator: 'node scripts/validate_agent1_spark1_broad_workbench_token_inventory_5000_source_lane_blocker_contract.mjs'
  },
  spark1_stop_condition: 'Return validated source-lane join blocker packet and contract result, or exact missing input/schema/validator blocker.',
  non_acceptance_boundary: artifact.non_acceptance_boundary
};

writeFile(outputJsonPath, `${JSON.stringify(artifact, null, 2)}\n`);
writeFile(contractJsonPath, `${JSON.stringify(contract, null, 2)}\n`);

writeFile(outputMdPath, `# Agent 1 Broad Workbench Token Inventory 5000 Source-Lane Blocker - 2026-06-04

Status: \`${artifact.status}\`.

| target | files | exact command/script | output artifact | schema/counts | validator | missing-field blocker | handoff owner | stop condition |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| \`${artifact.target}\` | \`${inputs.agent10_workset}\`; \`${inputs.agent2_return}\`; \`${inputs.inventory}\` | \`node scripts/build_agent1_broad_workbench_token_inventory_5000_source_lane_blocker.mjs\` | \`${outputJsonPath}\` | \`${topTokens.length}\` token rows; \`${blockerRows}\` missing source-lane rows; \`0\` candidate-text rows | \`node scripts/validate_agent1_broad_workbench_token_inventory_5000_source_lane_blocker.mjs\` | \`${artifact.exact_missing_field_blocker.blocker}\` | ${artifact.exact_missing_field_blocker.handoff_owner} | Stop after blocker packet plus validator pass, or after exact source-lane join workset is supplied. |

## Missing Fields

${Object.entries(missingByField).map(([field, count]) => `- \`${field}\`: \`${count}\` rows`).join('\n')}

## Boundary

Inventory mechanics only. No candidate text/export/storage, source/license/legal acceptance, QA acceptance, Definition authority, answer eligibility, public/runtime mutation, publication readiness, accepted gloss/text, or NC commercial authorization.
`);

writeFile(contractMdPath, `# Spark-1 Contract: Broad Workbench Token Inventory 5000 Source-Lane Blocker - 2026-06-04

target: \`${artifact.target}\`

command:

\`\`\`powershell
node scripts/build_agent1_broad_workbench_token_inventory_5000_source_lane_blocker.mjs
node scripts/validate_agent1_broad_workbench_token_inventory_5000_source_lane_blocker.mjs
node scripts/validate_agent1_spark1_broad_workbench_token_inventory_5000_source_lane_blocker_contract.mjs
\`\`\`

Spark-1 stop condition: validated source-lane join blocker packet and contract result, or exact missing input/schema/validator blocker.

Boundary: source-lane blocker only. No source/license/legal acceptance, QA acceptance, Definition authority, candidate text export, public/runtime mutation, accepted gloss/text, or NC commercial authorization.
`);

console.log(JSON.stringify({
  ok: true,
  output_json: outputJsonPath,
  contract_json: contractJsonPath,
  inventory_top_token_rows: topTokens.length,
  source_lane_blocker_rows: blockerRows,
  candidate_text_rows_now: 0
}, null, 2));
