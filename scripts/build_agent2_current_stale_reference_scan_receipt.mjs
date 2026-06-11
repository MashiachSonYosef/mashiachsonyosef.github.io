#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const output = 'reports/agent2-current-stale-reference-scan-receipt-2026-06-04.json';
const report = 'reports/agent2-current-stale-reference-scan-receipt-2026-06-04.md';

const currentSurfaces = [
  'reports/agent2-spark1-runnable-command-manifest-2026-06-04.json',
  'reports/agent2-spark1-command-manifest-validation-receipt-2026-06-04.json',
  'reports/agent2-spark1-manifest-output-state-validation-receipt-2026-06-04.json',
  'reports/agent2-weekly-lexicon-current-handoff-bundle-2026-06-04.json',
  'reports/agent2-weekly-lexicon-pipeline-inventory-2026-06-04.json',
  'reports/agent2-weekly-lexicon-pipeline-inventory-validation-2026-06-04.json',
  'reports/agent2-weekly-lexicon-script-syntax-receipt-2026-06-04.json',
  'reports/agent2-weekly-zero-boundary-audit-receipt-2026-06-04.json',
  'reports/agent2-current-handoff-aggregate-validation-receipt-2026-06-04.json',
  'reports/agent2-next-workset-needed-after-deuteronomy-return-2026-06-04.json',
  'reports/agent2-current-route-scan-receipt-2026-06-04.json',
  'reports/agent2-old-dictionary-lane-planning-intake-2026-06-04.json',
  'reports/agent2-spark1-execution-order-contract-2026-06-04.json',
  'reports/agent2-spark1-execution-order-validation-receipt-2026-06-04.json',
  'reports/agent2-deuteronomy-phase2-transform-readiness-matrix-2026-06-04.json',
  'reports/agent2-deuteronomy-phase2-partition-export-plan-2026-06-04.json',
  'reports/agent2-lane-preservation-handoff-receipt-2026-06-04.json',
  'reports/agent2-broad-workbench-token-inventory-5000-return-2026-06-04.json',
  'reports/agent2-orot-zero-safe-pilot-upstream-claim-blocker-2026-06-04.json',
  'reports/agent2-post-agent10-consumption-reconciliation-2026-06-04.json',
  'reports/agent2-old-dictionary-lane-partition-transform-planning-matrix-2026-06-04.json',
];

const staleReferences = [
  'missing_agent1_old_dictionary_excluded_row_license_lane_assignment',
  '"manifest_runnable_pipelines": 5',
  '"manifest_validator_only_checks": 12',
  '"validator_only_checks": 15',
  '"validator_only_checks": 16',
  '"validator_only_checks": 17',
  '"validator_only_checks": 18',
  '"validator_only_checks": 19',
  '"validator_only_checks": 20',
  '"validator_only_checks": 21',
  '"validator_only_checks": 22',
  '"validator_only_checks": 23',
  '"validator_only_states_checked": 14',
  '"validator_only_states_checked": 15',
  '"validator_only_states_checked": 16',
  '"validator_only_states_checked": 17',
  '"validator_only_states_checked": 18',
  '"validator_only_states_checked": 19',
  '"validator_only_states_checked": 20',
  '"validator_only_states_checked": 21',
  '"validator_only_states_checked": 22',
  '"scripts_checked": 8',
  '"scripts_checked": 36',
  '"scripts_checked": 37',
  '"scripts_checked": 38',
  '"scripts_checked": 40',
  '"artifacts_checked": 13',
  '"artifacts_checked": 14',
  '"artifacts_checked": 15',
  '"artifacts_checked": 16',
  '"artifacts_checked": 17',
  '"artifacts_checked": 18',
  '"artifacts_checked": 19',
  '"artifacts_checked": 20',
  '"artifacts_checked": 21',
  '"validator_commands": 12',
  '"validator_commands": 13',
  '"validator_commands": 14',
  '"validator_commands": 15',
  '"validator_commands": 16',
  '"validator_commands": 17',
  '"validator_commands": 18',
  '"validator_commands": 19',
  '"scripts_checked": 42',
  '"scripts_checked": 44',
  '"scripts_checked": 46',
  '"scripts_checked": 48',
  '"scripts_checked": 50',
  '"scripts_checked": 52',
];

const hits = [];
const missing_surfaces = [];
for (const surface of currentSurfaces) {
  const absolute = path.join(root, surface);
  if (!fs.existsSync(absolute)) {
    missing_surfaces.push(surface);
    continue;
  }
  const text = staleScanText(surface, absolute);
  for (const stale_reference of staleReferences) {
    if (text.includes(stale_reference)) {
      hits.push({ surface, stale_reference });
    }
  }
}

const manifest = readJson('reports/agent2-spark1-runnable-command-manifest-2026-06-04.json');
const outputState = readJson('reports/agent2-spark1-manifest-output-state-validation-receipt-2026-06-04.json');
const handoff = readJson('reports/agent2-weekly-lexicon-current-handoff-bundle-2026-06-04.json');
const zeroAudit = readJson('reports/agent2-weekly-zero-boundary-audit-receipt-2026-06-04.json');
const aggregate = readJson('reports/agent2-current-handoff-aggregate-validation-receipt-2026-06-04.json');
const syntax = readJson('reports/agent2-weekly-lexicon-script-syntax-receipt-2026-06-04.json');
const deuteronomyReadiness = readJson('reports/agent2-deuteronomy-phase2-transform-readiness-matrix-2026-06-04.json');
const deuteronomyPartition = readJson('reports/agent2-deuteronomy-phase2-partition-export-plan-2026-06-04.json');

const artifact = {
  schema_version: '1.0',
  artifact_type: 'agent2_current_stale_reference_scan_receipt',
  date: '2026-06-04',
  mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE',
  status: hits.length === 0 && missing_surfaces.length === 0
    ? 'passed_current_surface_stale_reference_scan'
    : 'failed_current_surface_stale_reference_scan',
  scope: 'current Agent 2 proof surfaces only; historical superseded reports are out of scope',
  current_surfaces_checked: currentSurfaces,
  stale_references_checked: staleReferences,
  missing_surfaces,
  stale_reference_hits: hits,
  counts: {
    current_surfaces_checked: currentSurfaces.length,
    stale_references_checked: staleReferences.length,
    stale_reference_hits: hits.length,
    missing_surfaces: missing_surfaces.length,
    runnable_pipelines: manifest.runnable_pipelines.length,
    validator_only_checks: manifest.validator_only_checks.length,
    runnable_outputs_checked: outputState.runnable_outputs_checked,
    validator_only_states_checked: outputState.validator_only_states_checked,
    zero_boundary_artifacts_checked: zeroAudit.artifacts_checked,
    aggregate_validator_commands: aggregate.counts.validator_commands,
    script_syntax_scripts_checked: syntax.counts.scripts_checked,
    deuteronomy_phase2_rows: deuteronomyReadiness.counts.rows,
    deuteronomy_phase2_occurrences: deuteronomyReadiness.counts.occurrences,
    deuteronomy_partition_rows: deuteronomyPartition.counts.rows,
    deuteronomy_partition_occurrences: deuteronomyPartition.counts.occurrences,
    deuteronomy_answer_eligible_rows: deuteronomyReadiness.counts.answer_eligible_rows + deuteronomyPartition.counts.answer_eligible_rows,
    deuteronomy_public_emit_rows: deuteronomyReadiness.counts.public_emit_rows + deuteronomyPartition.counts.public_emit_rows,
  },
  expected_current_anchors: {
    runnable_pipelines: 7,
    validator_only_checks: 24,
    runnable_outputs_checked: 7,
    validator_only_states_checked: 23,
    zero_boundary_artifacts_checked: 22,
    aggregate_validator_commands: 20,
    script_syntax_scripts_checked: 54,
    deuteronomy_phase2_rows: 1334,
    deuteronomy_phase2_occurrences: 2964,
    deuteronomy_partition_rows: 1334,
    deuteronomy_partition_occurrences: 2964,
  },
  zero_boundary: {
    definition_authority: false,
    usage_as_definition_authority: false,
    answer_acceptance: false,
    answer_eligibility: false,
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
  handoff_consumer: handoff.handoff.consumer,
  blocker_policy: 'If this scan fails, repair current Agent 2 surfaces before routing Spark-1 or Agent 10 handoff.',
};

writeJson(output, artifact);
writeReport(report, artifact);
console.log(`Agent 2 stale-reference scan receipt wrote ${currentSurfaces.length} surface(s), ${hits.length} stale hit(s). Output: ${output}. Report: ${report}`);

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function staleScanText(surface, absolute) {
  const text = fs.readFileSync(absolute, 'utf8');
  if (surface !== 'reports/agent2-post-agent10-consumption-reconciliation-2026-06-04.json') return text;
  const parsed = JSON.parse(text);
  // Historical Agent 10 consumption counts intentionally preserve old anchors.
  if (parsed.latest_agent10_consumption) delete parsed.latest_agent10_consumption.consumed_agent2_counts;
  return JSON.stringify(parsed, null, 2);
}

function writeJson(relativePath, data) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(data, null, 2)}\n`);
}

function writeReport(relativePath, data) {
  const lines = [
    '# Agent 2 Current Stale Reference Scan Receipt - 2026-06-04',
    '',
    '## Status',
    '',
    `Status: \`${data.status}\`.`,
    '',
    'Scope: current Agent 2 proof surfaces only; historical superseded reports are out of scope.',
    '',
    '## Counts',
    '',
    `- Current surfaces checked: ${data.counts.current_surfaces_checked}.`,
    `- Stale references checked: ${data.counts.stale_references_checked}.`,
    `- Stale reference hits: ${data.counts.stale_reference_hits}.`,
    `- Missing surfaces: ${data.counts.missing_surfaces}.`,
    `- Runnable pipelines: ${data.counts.runnable_pipelines}.`,
    `- Validator-only checks: ${data.counts.validator_only_checks}.`,
    `- Runnable outputs checked: ${data.counts.runnable_outputs_checked}.`,
    `- Validator-only states checked: ${data.counts.validator_only_states_checked}.`,
    `- Zero-boundary artifacts checked: ${data.counts.zero_boundary_artifacts_checked}.`,
    `- Aggregate validator commands: ${data.counts.aggregate_validator_commands}.`,
    `- Script syntax scripts checked: ${data.counts.script_syntax_scripts_checked}.`,
    `- Deuteronomy readiness rows / occurrences: ${data.counts.deuteronomy_phase2_rows} / ${data.counts.deuteronomy_phase2_occurrences}.`,
    `- Deuteronomy partition rows / occurrences: ${data.counts.deuteronomy_partition_rows} / ${data.counts.deuteronomy_partition_occurrences}.`,
    '',
    '## Boundary',
    '',
    '- No Definition authority.',
    '- No answer eligibility or answer acceptance.',
    '- No accepted gloss/text.',
    '- No public reader output.',
    '- No route JSONL or route-shard write.',
    '- No public/runtime/source/token-index/lexical payload mutation.',
    '- No QA/source/license/legal/product/publication acceptance.',
    '',
    '## Handoff',
    '',
    `Consumer: ${data.handoff_consumer}.`,
  ];
  if (data.stale_reference_hits.length) {
    lines.push('', '## Stale Hits', '');
    for (const hit of data.stale_reference_hits) {
      lines.push(`- ${hit.surface}: \`${hit.stale_reference}\``);
    }
  }
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
}
