#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputJson = 'reports/agent2-state-missing-blocker-resolution-receipt-2026-06-05.json';
const outputMd = 'reports/agent2-state-missing-blocker-resolution-receipt-2026-06-05.md';
const statePath = 'reports/agent2-state.md';
const receiptPath = 'reports/agent2-old-dictionary-queue-state-validation-receipt-2026-06-05.json';

const stateText = fs.readFileSync(path.join(root, statePath), 'utf8');
const queueReceipt = readJson(receiptPath);
const controlReferences = [
  'data/control/agent_registry.json',
  'data/control/agent_goal_board.json',
  'data/control/agent13_organization_state.json',
  'data/control/pulse_state.json',
];

const controlReferenceCounts = {};
for (const file of controlReferences) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  controlReferenceCounts[file] = {
    report_missing_references: countMatches(text, '"report_missing": "reports/agent2-state.md"'),
    missing_risk_references: countMatches(text, '"Agent 2 state file missing"'),
  };
}

const artifact = {
  schema_version: '1.0',
  artifact_type: 'agent2_state_missing_blocker_resolution_receipt',
  generated_at: new Date().toISOString(),
  active_mode: queueReceipt.active_mode,
  target: 'reports/agent2-state.md missing-state blocker',
  status: 'agent2_state_file_now_exists_and_validates_historical_control_references_not_broad_edited',
  resolved_blocker: 'Agent 2 state file missing',
  state_artifact: statePath,
  backing_receipt: receiptPath,
  control_reference_scan: controlReferenceCounts,
  state_assertions: {
    state_file_exists: fs.existsSync(path.join(root, statePath)),
    state_mentions_current_agent1_thread: stateText.includes('019e975d-dc9f-7020-a7c8-885d083a837e'),
    state_mentions_current_queue_receipt: stateText.includes(receiptPath),
    state_mentions_current_readiness_matrix: stateText.includes(queueReceipt.validated_artifacts.readiness_matrix),
    state_mentions_agent10_consumption: stateText.includes(queueReceipt.validated_artifacts.agent10_consumption),
    state_mentions_non_acceptance_boundary: stateText.includes('No Definition authority') && stateText.includes('No answer acceptance') && stateText.includes('No public/runtime mutation'),
    state_mentions_nc_no_commercial_export: stateText.includes('commercial_export_allowed=false'),
  },
  current_counts: queueReceipt.counts,
  current_exact_blockers: queueReceipt.current_exact_blockers,
  lane_preservation: queueReceipt.lane_preservation,
  zero_output_counts: queueReceipt.zero_output_counts,
  validator_commands: [
    'node scripts/validate_agent2_state.mjs reports/agent2-state.md',
    'node scripts/validate_agent2_old_dictionary_queue_state_validation_receipt.mjs reports/agent2-old-dictionary-queue-state-validation-receipt-2026-06-05.json',
    'node scripts/validate_agent2_state_missing_blocker_resolution_receipt.mjs reports/agent2-state-missing-blocker-resolution-receipt-2026-06-05.json',
  ],
  remaining_risks_not_resolved_by_state_file: [
    'usage-link packet has no overlap with current 200-row sample',
    'Agent 6 definition authority boundary remains unaccepted',
    'old-dictionary commercial-clean families still need exact Agent 6 row/subset boundary plus approved morphology relation',
    'Klein remains noncommercial_educational_candidate with no commercial export authorization',
    'BDB Augmented Strong remains blocked pending independent source/license/custody basis',
  ],
  stop_condition: 'Use this receipt as the current resolution for the specific missing Agent 2 state-file blocker. Do not treat historical control references as permission for Definition authority, answer acceptance, public/runtime mutation, candidate text export, or release action.',
  non_acceptance_boundary: queueReceipt.non_acceptance_boundary,
};

assertArtifact(artifact);
writeJson(outputJson, artifact);
writeMd(outputMd, artifact);
console.log(`wrote ${outputJson}`);
console.log(`wrote ${outputMd}`);

function countMatches(text, needle) {
  return text.split(needle).length - 1;
}

function assertArtifact(value) {
  for (const [key, result] of Object.entries(value.state_assertions)) {
    if (result !== true) throw new Error(`state assertion failed: ${key}`);
  }
  if (value.current_counts.source_family_rows !== 5) throw new Error('source family count mismatch');
  if (value.current_counts.allowed_transform_rows_now !== 0) throw new Error('allowed transform rows must be 0');
  if (value.lane_preservation.nc_commercial_export_allowed !== false) throw new Error('NC commercial export must be false');
  for (const count of Object.values(value.zero_output_counts)) {
    if (count !== 0) throw new Error('zero output counter mismatch');
  }
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMd(relativePath, value) {
  const lines = [
    '# Agent 2 State Missing-Blocker Resolution Receipt - 2026-06-05',
    '',
    `Status: ${value.status}.`,
    '',
    '## Resolved Blocker',
    '',
    `- \`${value.resolved_blocker}\` is resolved by \`${value.state_artifact}\` and validator command \`${value.validator_commands[0]}\`.`,
    '',
    '## Current Counts',
    '',
    `- Source-family rows: ${value.current_counts.source_family_rows}.`,
    `- Commercial-clean / NC / metadata-link / blocked source families: ${value.current_counts.commercial_clean_candidate_source_families} / ${value.current_counts.noncommercial_educational_candidate_source_families} / ${value.current_counts.metadata_or_link_only_source_families} / ${value.current_counts.blocked_or_needs_review_source_families}.`,
    '- Transform, candidate text, Definition, lemma, reader-hint, answer, public, accepted-text, and release rows now: 0.',
    '',
    '## Historical Control References',
    '',
    ...Object.entries(value.control_reference_scan).map(([file, counts]) => `- \`${file}\`: report_missing=${counts.report_missing_references}; missing_risk=${counts.missing_risk_references}.`),
    '',
    '## Remaining Risks',
    '',
    ...value.remaining_risks_not_resolved_by_state_file.map((risk) => `- ${risk}`),
    '',
    '## Stop Condition',
    '',
    value.stop_condition,
    '',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
}
