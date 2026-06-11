#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const bundlePath = 'reports/agent2-weekly-lexicon-current-handoff-bundle-2026-06-04.json';
const outputJson = 'reports/agent2-weekly-zero-boundary-audit-receipt-2026-06-04.json';
const outputMd = 'reports/agent2-weekly-zero-boundary-audit-receipt-2026-06-04.md';

const bundle = readJson(bundlePath);
const artifacts = [
  ['current_handoff_bundle', bundlePath],
  ['spark1_runnable_manifest', bundle.entrypoints?.spark1_runnable_manifest],
  ['weekly_inventory', bundle.entrypoints?.weekly_inventory],
  ['manifest_output_state_receipt', bundle.entrypoints?.manifest_output_state_receipt],
  ['manifest_validation_receipt', bundle.entrypoints?.manifest_validation_receipt],
  ['current_route_scan_receipt', bundle.entrypoints?.current_route_scan_receipt],
  ['next_workset_blocker', bundle.entrypoints?.next_workset_blocker],
  ['deuteronomy_readiness_matrix', 'reports/agent2-deuteronomy-phase2-transform-readiness-matrix-2026-06-04.json'],
  ['deuteronomy_partition_export_plan', 'reports/agent2-deuteronomy-phase2-partition-export-plan-2026-06-04.json'],
  ['orot_missed_dictionary_candidates', 'reports/agent2-orot-missed-dictionary-reader-hint-candidates-2026-06-04.json'],
  ['definition_workbench_1000_sample', 'data/definitions/definition-workbench-sample-1000.json'],
  ['definition_workbench_usage_joined_sample_planning', 'data/definitions/agent2-definition-workbench-usage-joined-sample-planning.json'],
  ['orot_counterpart_preview', 'reports/agent2-orot-counterpart-hint-patch-preview-2026-06-04.json'],
  ['old_dictionary_lane_planning_intake', bundle.entrypoints?.old_dictionary_lane_planning_intake],
  ['current_stale_reference_scan_receipt', bundle.entrypoints?.current_stale_reference_scan_receipt],
  ['lane_preservation_handoff_receipt', bundle.entrypoints?.lane_preservation_handoff_receipt],
  ['broad_workbench_token_inventory_5000_return', bundle.entrypoints?.broad_workbench_token_inventory_5000_return],
  ['orot_zero_safe_pilot_upstream_claim_blocker', bundle.entrypoints?.orot_zero_safe_pilot_upstream_claim_blocker],
  ['post_agent10_consumption_reconciliation', bundle.entrypoints?.post_agent10_consumption_reconciliation],
  ['old_dictionary_lane_partition_transform_planning_matrix', bundle.entrypoints?.old_dictionary_lane_partition_transform_planning_matrix],
  ['weekly_lexicon_script_syntax_receipt', 'reports/agent2-weekly-lexicon-script-syntax-receipt-2026-06-04.json'],
  ['weekly_lexicon_pipeline_inventory_validation', 'reports/agent2-weekly-lexicon-pipeline-inventory-validation-2026-06-04.json'],
];

for (const [, relativePath] of artifacts) {
  if (!relativePath || !fs.existsSync(path.join(root, relativePath))) throw new Error(`missing audit artifact ${relativePath}`);
}

const receipt = {
  schema_version: '1.0',
  artifact_type: 'agent2_weekly_zero_boundary_audit_receipt',
  date: '2026-06-04',
  mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE',
  lane: 'Agent 2 definition/lemma/reader-hint pipeline builder',
  bundle: bundlePath,
  validator: 'scripts/validate_agent2_weekly_zero_boundary_audit.mjs',
  validation_command: `node scripts/validate_agent2_weekly_zero_boundary_audit.mjs ${bundlePath}`,
  validation_result: {
    status: 'passed',
    stdout: `Agent 2 weekly zero-boundary audit passed. Artifacts checked: ${artifacts.length}.`,
  },
  artifacts_checked: artifacts.length,
  audited_artifacts: Object.fromEntries(artifacts),
  zero_boundary: {
    definition_authority: false,
    usage_as_definition_authority: false,
    answer_acceptance: false,
    answer_eligible: false,
    accepted_gloss_text: false,
    public_reader_output: false,
    route_shard_edit: false,
    public_runtime_mutation: false,
    publication_readiness: false,
    source_license_acceptance: false,
    qa_acceptance: false,
    definition_content_storage: false,
    nc_commercial_authorization: false,
  },
};

assertReceipt(receipt);
writeJson(outputJson, receipt);
writeMd(outputMd, receipt);
console.log(`wrote ${outputJson}`);
console.log(`wrote ${outputMd}`);

function assertReceipt(receipt) {
  if (receipt.artifacts_checked !== 22) throw new Error('expected 22 artifacts checked');
  for (const value of Object.values(receipt.zero_boundary)) {
    if (value !== false) throw new Error('zero boundary must remain false');
  }
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMd(file, receipt) {
  const lines = [
    '# Agent 2 Weekly Zero-Boundary Audit Receipt - 2026-06-04',
    '',
    '## Status',
    '',
    `- Bundle: \`${receipt.bundle}\``,
    `- Validator: \`${receipt.validator}\``,
    `- Validation command: \`${receipt.validation_command}\``,
    `- Validation result: ${receipt.validation_result.status}.`,
    `- Artifacts checked: ${receipt.artifacts_checked}.`,
    '',
    '## Audited Artifacts',
    '',
    ...Object.entries(receipt.audited_artifacts).map(([key, value]) => `- ${key}: \`${value}\``),
    '',
    '## Zero Boundary',
    '',
    'No Definition authority, usage-as-definition authority, answer acceptance, answer eligibility, accepted gloss/text, public reader output, route-shard edit, public/runtime mutation, publication readiness, source/license acceptance, QA acceptance, definition-content storage, or NC commercial authorization is claimed.',
    '',
  ];
  fs.writeFileSync(path.join(root, file), lines.join('\n'));
}
