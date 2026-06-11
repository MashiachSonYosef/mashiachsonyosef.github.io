#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packetPath = 'reports/agent10-agent6-ready-old-dictionary-commercial-clean-transform-enablement-boundary-packet-2026-06-05.json';
const receiptPath = 'reports/agent2-commercial-clean-boundary-held-packet-consumption-receipt-2026-06-05.json';
const markdownPath = 'reports/agent2-commercial-clean-boundary-held-packet-consumption-receipt-2026-06-05.md';
const packet = readJson(packetPath);

assertPacket(packet);

const receipt = {
  schema_version: '1.0',
  artifact_type: 'agent2_commercial_clean_boundary_held_packet_consumption_receipt',
  generated_at: '2026-06-05T11:58:00.000Z',
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / source-lane separated lexicon expansion',
  target: 'old-dictionary-excluded-row-license-lane-reaudit commercial-clean held boundary packet',
  status: 'held_agent10_agent6_boundary_packet_consumed_as_nonpublic_readiness_evidence_only',
  consumed_packet: packetPath,
  source_lane_owner: packet.source_lane_owner,
  commercial_clean_scope: {
    source_family_count: packet.commercial_clean_scope.source_family_count,
    row_count: packet.commercial_clean_scope.row_count,
    occurrence_count: packet.commercial_clean_scope.occurrence_count,
    row_subset_ids: packet.commercial_clean_scope.subsets.map((row) => row.row_subset_id),
    transform_allowed_now: false,
  },
  excluded_lanes: packet.excluded_lanes.map((row) => ({
    row_subset_id: row.row_subset_id,
    license_lane: row.license_lane,
    derived_from_nc: row.derived_from_nc,
    commercial_export_allowed: row.commercial_export_allowed,
    attribution_required: row.attribution_required ?? false,
  })),
  agent6_delivery_state: packet.agent6_delivery_state,
  current_blockers: [
    packet.agent6_delivery_state.exact_delivery_blocker,
    'missing_exact_agent6_row_subset_boundary_for_any_candidate_text_package_or_display_behavior',
    'missing_approved_morphology_relation_for_definition_lemma_reader_hint_transform',
    'klein_dictionary_remains_noncommercial_educational_candidate_no_commercial_export_authorization',
    'bdb_augmented_strong_remains_blocked_or_needs_review_missing_independent_source_license_custody_basis',
  ],
  zero_output_counts: {
    definition_candidate_rows: 0,
    lemma_candidate_rows: 0,
    reader_hint_candidate_rows: 0,
    candidate_text_rows: 0,
    definition_content_rows: 0,
    candidate_text_export_rows: 0,
    answer_rows: 0,
    answer_eligible_rows: 0,
    public_reader_output_rows: 0,
    route_jsonl_rows: 0,
    route_shard_writes: 0,
    public_runtime_mutation: 0,
    release_rows: 0,
    nc_commercial_authorization_rows: 0,
  },
  allowed_action_now: 'carry_nonpublic_transform_readiness_planning_evidence_only',
  forbidden_actions: packet.forbidden_claims,
  handoff_owner: 'Agent 2 definer; Agent 6 remains future boundary owner if exact candidate-use package exists.',
  stop_condition: 'Stop at held boundary receipt. Do not author transform candidates, public reader output, answer rows, definition content, route writes, or release artifacts until exact Agent 6 row/subset boundary and approved morphology relation exist.',
};

writeJson(receiptPath, receipt);
writeMarkdown(markdownPath, receipt);
console.log(`wrote ${receiptPath}`);
console.log(`wrote ${markdownPath}`);

function assertPacket(value) {
  if (value.artifact_type !== 'agent10_agent6_ready_old_dictionary_commercial_clean_transform_enablement_boundary_packet') throw new Error('packet artifact_type mismatch');
  if (value.commercial_clean_scope?.source_family_count !== 3) throw new Error('commercial-clean source family count mismatch');
  if (value.agent2_current_confirmation?.allowed_transform_rows_now !== 0) throw new Error('allowed transform rows must be 0');
  if (value.allowed_if_warn_accepted?.agent2_may_author_nonpublic_transform_candidate_package !== false) throw new Error('transform candidate package authoring must remain blocked');
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMarkdown(relativePath, receipt) {
  const lines = [
    '# Agent 2 Commercial-Clean Held Boundary Packet Consumption Receipt',
    '',
    `Generated: ${receipt.generated_at}`,
    '',
    '| target | required Agent 1 fields | transform action once classified | exact blocker if not classified | handoff owner | stop condition |',
    '| --- | --- | --- | --- | --- | --- |',
    `| ${receipt.target} | current Agent 1 lane classification plus row_subset_id/source_family/license_lane/derived_from_nc/commercial_export_allowed/attribution_required | ${receipt.allowed_action_now}; no transform candidates | none for source-family classification; transform blocked by Agent 6 boundary and morphology requirements | ${receipt.handoff_owner} | ${receipt.stop_condition} |`,
    '',
    '## Consumed Packet',
    '',
    `- \`${receipt.consumed_packet}\``,
    `- Status: \`${receipt.status}\``,
    `- Agent 6 delivery: \`${receipt.agent6_delivery_state.delivery_status}\``,
    `- Exact delivery blocker: \`${receipt.agent6_delivery_state.exact_delivery_blocker}\``,
    '',
    '## Commercial-Clean Scope',
    '',
    `- Source families: ${receipt.commercial_clean_scope.source_family_count}.`,
    `- Rows: ${receipt.commercial_clean_scope.row_count}.`,
    `- Occurrences: ${receipt.commercial_clean_scope.occurrence_count}.`,
    '- Transform allowed now: false.',
    ...receipt.commercial_clean_scope.row_subset_ids.map((id) => `- \`${id}\``),
    '',
    '## Excluded Lanes',
    '',
    ...receipt.excluded_lanes.map((row) => `- \`${row.row_subset_id}\`: \`${row.license_lane}\`, derived_from_nc=${row.derived_from_nc}, commercial_export_allowed=${row.commercial_export_allowed}, attribution_required=${row.attribution_required}.`),
    '',
    '## Current Blockers',
    '',
    ...receipt.current_blockers.map((blocker) => `- \`${blocker}\``),
    '',
    '## Zero Output Counts',
    '',
    ...Object.entries(receipt.zero_output_counts).map(([key, value]) => `- ${key}: ${value}`),
    '',
    '## Non-Acceptance Boundary',
    '',
    ...receipt.forbidden_actions.map((action) => `- No ${action}`),
    '',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
}
