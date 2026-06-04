#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const inputs = {
  agent3_frontier_checkpoint_json: 'reports/agent3-linkage-navigation-frontier-checkpoint-2026-06-04.json',
  agent3_frontier_checkpoint_md: 'reports/agent3-linkage-navigation-frontier-checkpoint-2026-06-04.md',
  agent6_frontier_checkpoint_receipt_md:
    'reports/agent6-agent3-linkage-navigation-frontier-checkpoint-receipt-2026-06-04.md',
  agent6_deuteronomy_continuity_receipt_md:
    'reports/agent6-deuteronomy-phase2-agent3-continuity-receipt-2026-06-04.md',
  agent10_custody_boundary_packet_json:
    'reports/agent10-agent6-ready-deuteronomy-source-license-custody-boundary-packet-2026-06-04.json',
  agent10_custody_boundary_packet_md:
    'reports/agent10-agent6-ready-deuteronomy-source-license-custody-boundary-packet-2026-06-04.md',
  agent1_source_license_custody_map_json:
    'reports/agent1-deuteronomy-source-license-custody-map-2026-06-04.json',
  agent1_source_license_custody_map_md:
    'reports/agent1-deuteronomy-source-license-custody-map-2026-06-04.md',
};

const outputJson = 'reports/agent3-frontier-receipt-custody-boundary-observer-package-2026-06-04.json';
const outputMd = 'reports/agent3-frontier-receipt-custody-boundary-observer-package-2026-06-04.md';
const stateMdPath = 'reports/agent3-state.md';

const checkpoint = readJson(inputs.agent3_frontier_checkpoint_json);
const frontierReceipt = readText(inputs.agent6_frontier_checkpoint_receipt_md);
const continuityReceipt = readText(inputs.agent6_deuteronomy_continuity_receipt_md);
const agent10Packet = readJson(inputs.agent10_custody_boundary_packet_json);
const agent1Custody = readJson(inputs.agent1_source_license_custody_map_json);

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_frontier_receipt_custody_boundary_observer_package',
  generated_at: new Date().toISOString(),
  lane_owner: 'Agent 3',
  status: 'evidence_ready_observer_package',
  publication_state: 'blocked_no_render',
  active_goal: 'ongoing Agent 3 linkage/dedupe/navigation lane',
  reviewed_inputs: manifest(inputs),
  consumed_receipts: {
    agent6_frontier_checkpoint_receipt: {
      path: inputs.agent6_frontier_checkpoint_receipt_md,
      disposition: extractDisposition(frontierReceipt),
      received_warn_accepted_as_evidence_only: frontierReceipt.includes(
        'RECEIVED / WARN-ACCEPTED as Agent 3 linkage/navigation frontier evidence only',
      ),
      next_executable_route_from_agent3: frontierReceipt.includes(
        'No new Agent 3 executable route is created',
      )
        ? 'none_until_new_changed_artifact_or_exact_workset'
        : 'needs_review',
      observed_counts: {
        usage_concordance_rows: checkpoint.agent3_usage_state?.counts?.usage_concordance_rows,
        selected_usage_rows: checkpoint.agent3_usage_state?.counts?.selected_usage_rows,
        selected_source_refs: checkpoint.agent3_usage_state?.counts?.selected_source_refs,
        selected_works: checkpoint.agent3_usage_state?.counts?.selected_works,
        deuteronomy_exact_blocker_rows:
          checkpoint.deuteronomy_continuity_observed?.exact_blocker_rows_still_blocked,
        deuteronomy_exact_blocker_occurrences:
          checkpoint.deuteronomy_continuity_observed?.exact_blocker_occurrences_still_blocked,
      },
    },
    agent6_deuteronomy_continuity_receipt: {
      path: inputs.agent6_deuteronomy_continuity_receipt_md,
      disposition: extractDisposition(continuityReceipt),
      received_warn_accepted_as_evidence_only: continuityReceipt.includes(
        'RECEIVED / WARN-ACCEPTED as Agent 3 continuity evidence only',
      ),
      next_executable_route_from_agent3: continuityReceipt.includes(
        'Next executable route: none from Agent 3 unless a new changed artifact or exact workset is produced',
      )
        ? 'none_until_new_changed_artifact_or_exact_workset'
        : 'needs_review',
      observed_counts: {
        planning_rows: checkpoint.deuteronomy_continuity_observed?.reviewed_planning_rows,
        planning_occurrences: checkpoint.deuteronomy_continuity_observed?.reviewed_planning_occurrences,
        exact_blocker_rows:
          checkpoint.deuteronomy_continuity_observed?.exact_blocker_rows_still_blocked,
        exact_blocker_occurrences:
          checkpoint.deuteronomy_continuity_observed?.exact_blocker_occurrences_still_blocked,
        answer_eligible_rows: 0,
        public_emit_rows: 0,
        route_shard_write_rows: 0,
        definition_content_rows: 0,
        accepted_text_rows: 0,
      },
    },
  },
  agent3_frontier_checkpoint_observed: {
    path: inputs.agent3_frontier_checkpoint_json,
    status: checkpoint.status,
    publication_state: checkpoint.publication_state,
    qa_acceptance_state: checkpoint.agent3_usage_state?.qa_acceptance_state,
    control_queue_mutated: checkpoint.agent3_usage_state?.control_queue_mutated,
    submitted_to_agent6: checkpoint.agent3_usage_state?.submitted_to_agent6,
    counts: checkpoint.agent3_usage_state?.counts || {},
    deuteronomy_continuity_observed: checkpoint.deuteronomy_continuity_observed || {},
    row_payload_copied_here: false,
  },
  source_license_custody_observed_only: {
    agent10_boundary_packet: {
      path: inputs.agent10_custody_boundary_packet_json,
      owner: 'Agent 10',
      status: agent10Packet.status,
      target: agent10Packet.target,
      review_question: agent10Packet.review_question,
      validation_status: agent10Packet.validation_status,
      counts: agent10Packet.counts,
      next_executable_route: agent10Packet.next_executable_route,
      stop_condition: agent10Packet.stop_condition,
      row_payload_copied_here: false,
    },
    agent1_source_license_custody_map: {
      path: inputs.agent1_source_license_custody_map_json,
      owner: 'Agent 1',
      status: agent1Custody.status,
      target: agent1Custody.target,
      source_license_counts: agent1Custody.source_license_counts,
      lane_counts: agent1Custody.lane_counts,
      license_counts: agent1Custody.license_counts,
      remaining_blockers: agent1Custody.remaining_blockers,
      zero_output_counts: agent1Custody.zero_output_counts,
      boundary: agent1Custody.boundary,
      row_payload_copied_here: false,
      row_payload_observed_count_only: Array.isArray(agent1Custody.rows) ? agent1Custody.rows.length : 0,
    },
  },
  validation_commands: [
    'node scripts/validate_agent3_linkage_navigation_frontier_checkpoint.mjs',
    'node scripts/validate_agent1_deuteronomy_source_license_custody_map.mjs',
    'node scripts/validate_agent3_frontier_receipt_custody_boundary_observer_package.mjs',
  ],
  package_summary: {
    purpose:
      'Consume latest Agent 6 receipts and Agent 10 custody-boundary packet as Agent 3 observer/linkage continuity evidence only.',
    agent6_frontier_receipt_consumed: true,
    agent6_deuteronomy_continuity_receipt_consumed: true,
    agent10_custody_boundary_packet_observed: true,
    agent1_source_license_custody_map_observed_count_hash_only: true,
    external_lane_rows_copied: 0,
    source_license_custody_rows_observed: agent10Packet.counts?.source_license_custody_rows,
    source_license_custody_occurrences_observed: agent10Packet.counts?.source_license_custody_occurrences,
    agent3_exact_blocker_rows_outside_workset:
      agent10Packet.counts?.agent3_exact_blocker_rows_outside_workset,
    agent3_exact_blocker_occurrences_outside_workset:
      agent10Packet.counts?.agent3_exact_blocker_occurrences_outside_workset,
    next_agent3_action:
      'wait_for_new_changed_artifact_or_exact_workset; do not invent broad discovery or publication route',
  },
  boundary: {
    usage_navigation_only: true,
    observer_package_only: true,
    route_ids_only_where_present: true,
    no_external_row_payload_copy: true,
    no_qa_acceptance_claim: true,
    no_source_provenance_acceptance: true,
    no_license_acceptance: true,
    no_definition_authority: true,
    no_usage_as_definition_authority: true,
    no_answer_selection: true,
    no_route_publication_support: true,
    no_public_runtime_acceptance: true,
    no_publication_readiness: true,
    no_accepted_gloss_or_text: true,
    no_public_reader_output: true,
  },
  what_remains_blocked: [
    'Agent 10 source/license/custody boundary packet remains pending Agent 6 pass/warn/block review; Agent 3 observes it only.',
    'Agent 1 source/license/custody map remains external-lane custody evidence and is not copied into Agent 3 as row authority.',
    'Deuteronomy exact blockers remain 6779 rows / 9631 occurrences outside the current downstream workset.',
    'No new Agent 3 executable route exists unless a new changed artifact or exact linkage/dedupe/navigation workset is produced.',
  ],
  what_must_not_be_accepted: [
    'QA acceptance',
    'source/provenance acceptance',
    'license/legal acceptance',
    'Definition authority',
    'usage-as-definition authority',
    'semantic arbitration',
    'route ranking',
    'visible answer selection',
    'answer eligibility',
    'public/runtime acceptance',
    'publication readiness',
    'route publication support',
    'product/data acceptance',
    'translation output',
    'accepted gloss/text',
    'public reader output',
    'route-shard edit',
    'public/runtime mutation',
    'definition-content storage',
    'lexicon_entry_id mutation',
  ],
};

writeJson(outputJson, artifact);
writeText(outputMd, renderMarkdown(artifact));
updateStateMarkdown(artifact);

console.log(JSON.stringify({ ok: true, output_json: outputJson, output_md: outputMd }, null, 2));

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  return fs.readFileSync(resolve(relativePath), 'utf8');
}

function writeJson(relativePath, value) {
  writeText(relativePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(relativePath, value) {
  const absolute = resolve(relativePath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, value);
}

function resolve(relativePath) {
  return path.resolve(root, relativePath);
}

function manifest(inputMap) {
  return Object.entries(inputMap).map(([role, relativePath]) => {
    const absolute = resolve(relativePath);
    const stat = fs.statSync(absolute);
    return {
      role,
      path: relativePath,
      sha256: hashFile(absolute),
      bytes: stat.size,
    };
  });
}

function hashFile(absolutePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(absolutePath)).digest('hex');
}

function extractDisposition(markdown) {
  const lines = markdown.split(/\r?\n/);
  const index = lines.findIndex((line) => line.trim() === '## Disposition');
  if (index === -1) return 'missing_disposition';
  return lines.slice(index + 1).map((line) => line.trim()).find(Boolean) || 'missing_disposition';
}

function renderMarkdown(value) {
  const counts = value.package_summary;
  const agent10 = value.source_license_custody_observed_only.agent10_boundary_packet;
  const agent1 = value.source_license_custody_observed_only.agent1_source_license_custody_map;
  return `# Agent 3 Frontier Receipt Custody Boundary Observer Package - 2026-06-04

## Status

- Artifact: \`${outputJson}\`
- Status: \`${value.status}\`
- Publication state: \`${value.publication_state}\`
- Lane owner: \`${value.lane_owner}\`
- Purpose: ${counts.purpose}

## Consumed Returns

- Agent 6 frontier receipt: \`${value.consumed_receipts.agent6_frontier_checkpoint_receipt.disposition}\`
- Agent 6 Deuteronomy continuity receipt: \`${value.consumed_receipts.agent6_deuteronomy_continuity_receipt.disposition}\`
- Agent 10 custody-boundary packet: \`${agent10.status}\`, validation \`${agent10.validation_status}\`
- Agent 1 custody map: \`${agent1.status}\`, observed count/hash only

## Counts

| Measure | Count |
| --- | ---: |
| Agent 3 usage concordance rows | ${value.agent3_frontier_checkpoint_observed.counts.usage_concordance_rows} |
| Agent 3 selected usage rows | ${value.agent3_frontier_checkpoint_observed.counts.selected_usage_rows} |
| Agent 3 selected source refs | ${value.agent3_frontier_checkpoint_observed.counts.selected_source_refs} |
| Agent 3 selected works | ${value.agent3_frontier_checkpoint_observed.counts.selected_works} |
| Deuteronomy planning rows observed | ${value.agent3_frontier_checkpoint_observed.deuteronomy_continuity_observed.reviewed_planning_rows} |
| Deuteronomy planning occurrences observed | ${value.agent3_frontier_checkpoint_observed.deuteronomy_continuity_observed.reviewed_planning_occurrences} |
| Deuteronomy exact blocker rows outside workset | ${counts.agent3_exact_blocker_rows_outside_workset} |
| Deuteronomy exact blocker occurrences outside workset | ${counts.agent3_exact_blocker_occurrences_outside_workset} |
| Source/license/custody rows observed | ${counts.source_license_custody_rows_observed} |
| Source/license/custody occurrences observed | ${counts.source_license_custody_occurrences_observed} |
| External row payloads copied into Agent 3 | ${counts.external_lane_rows_copied} |

## Boundary

This package is an Agent 3 observer/linkage continuity packet only. It does not create QA acceptance, source/provenance acceptance, license acceptance, Definition authority, usage-as-definition authority, answer eligibility, route ranking, public/runtime acceptance, publication readiness, accepted gloss/text, public reader output, route-shard edits, or lexicon-entry mutation.

## Remaining Blockers

${value.what_remains_blocked.map((item) => `- ${item}`).join('\n')}

## Validation

${value.validation_commands.map((command) => `- \`${command}\``).join('\n')}

## Reviewed Inputs

${value.reviewed_inputs.map((input) => `- \`${input.path}\` (${input.bytes} bytes, sha256 \`${input.sha256}\`)`).join('\n')}
`;
}

function updateStateMarkdown(value) {
  const start = '<!-- agent3_frontier_receipt_custody_boundary_observer_package:start -->';
  const end = '<!-- agent3_frontier_receipt_custody_boundary_observer_package:end -->';
  const section = `${start}

## Latest Frontier Receipt / Custody Boundary Observer Package

- Package: \`${outputMd}\`
- JSON: \`${outputJson}\`
- Status: \`${value.status}\`
- Consumed receipts: Agent 6 frontier checkpoint receipt and Agent 6 Deuteronomy continuity receipt.
- Observed external boundary packet: Agent 10 Deuteronomy source/license/custody packet, validation \`${value.source_license_custody_observed_only.agent10_boundary_packet.validation_status}\`.
- Counts: ${value.package_summary.source_license_custody_rows_observed} source/license/custody rows / ${value.package_summary.source_license_custody_occurrences_observed} occurrences observed; ${value.package_summary.agent3_exact_blocker_rows_outside_workset} Agent 3 exact-blocker rows remain outside workset.
- Boundary: observer/linkage continuity only; no QA/source/license/Definition/runtime/publication/answer acceptance and no copied external row payloads.

${end}`;
  const absolute = resolve(stateMdPath);
  const existing = fs.existsSync(absolute) ? fs.readFileSync(absolute, 'utf8') : '# Agent 3 State\n';
  const pattern = new RegExp(`${escapeRegExp(start)}[\\s\\S]*?${escapeRegExp(end)}`);
  const next = pattern.test(existing) ? existing.replace(pattern, section) : `${existing.trimEnd()}\n\n${section}\n`;
  fs.writeFileSync(absolute, next);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
