#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const inputs = {
  prior_agent3_observer_package_json:
    'reports/agent3-frontier-receipt-custody-boundary-observer-package-2026-06-04.json',
  prior_agent3_observer_package_md:
    'reports/agent3-frontier-receipt-custody-boundary-observer-package-2026-06-04.md',
  agent6_source_license_custody_verdict_md:
    'reports/agent6-deuteronomy-source-license-custody-planning-verdict-2026-06-04.md',
  agent10_verdict_consumption_json:
    'reports/agent10-agent6-deuteronomy-source-license-custody-verdict-consumption-2026-06-04.json',
  agent10_verdict_consumption_md:
    'reports/agent10-agent6-deuteronomy-source-license-custody-verdict-consumption-2026-06-04.md',
  agent1_source_license_custody_map_json:
    'reports/agent1-deuteronomy-source-license-custody-map-2026-06-04.json',
  agent10_ready_boundary_packet_json:
    'reports/agent10-agent6-ready-deuteronomy-source-license-custody-boundary-packet-2026-06-04.json',
  agent3_frontier_checkpoint_json: 'reports/agent3-linkage-navigation-frontier-checkpoint-2026-06-04.json',
};

const outputJson =
  'reports/agent3-deuteronomy-source-license-custody-verdict-continuity-package-2026-06-04.json';
const outputMd =
  'reports/agent3-deuteronomy-source-license-custody-verdict-continuity-package-2026-06-04.md';
const stateMdPath = 'reports/agent3-state.md';

const prior = readJson(inputs.prior_agent3_observer_package_json);
const verdictText = readText(inputs.agent6_source_license_custody_verdict_md);
const consumption = readJson(inputs.agent10_verdict_consumption_json);
const agent1 = readJson(inputs.agent1_source_license_custody_map_json);
const boundaryPacket = readJson(inputs.agent10_ready_boundary_packet_json);
const checkpoint = readJson(inputs.agent3_frontier_checkpoint_json);

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_deuteronomy_source_license_custody_verdict_continuity_package',
  generated_at: new Date().toISOString(),
  lane_owner: 'Agent 3',
  status: 'agent6_warn_accepted_nonpublic_planning_observed_by_agent3',
  publication_state: 'blocked_no_render',
  active_goal: 'ongoing Agent 3 linkage/dedupe/navigation lane',
  reviewed_inputs: manifest(inputs),
  consumed_change: {
    prior_observer_package: {
      path: inputs.prior_agent3_observer_package_json,
      status: prior.status,
      prior_agent10_state: prior.source_license_custody_observed_only?.agent10_boundary_packet?.status,
      prior_pending_statement_superseded_by_verdict: true,
      external_lane_rows_copied: prior.package_summary?.external_lane_rows_copied,
    },
    agent6_verdict: {
      path: inputs.agent6_source_license_custody_verdict_md,
      disposition: extractDisposition(verdictText),
      warn_accepted_nonpublic_planning_only: verdictText.includes(
        'WARN-ACCEPTED for exact non-public source/license/custody planning evidence only',
      ),
      no_acceptance_claims_created: verdictText.includes(
        'This verdict does not create source/provenance acceptance, license acceptance, legal acceptance',
      ),
    },
    agent10_consumption: {
      path: inputs.agent10_verdict_consumption_json,
      status: consumption.status,
      stop_condition: consumption.stop_condition,
      next_release_owner_action: consumption.next_release_owner_action,
      allowed_carry_forward: consumption.allowed_carry_forward,
      zero_emission_counters: consumption.zero_emission_counters,
      source_lane_counts: consumption.source_lane_counts,
    },
  },
  deuteronomy_planning_counts: {
    target: 'tanakh/deuteronomy',
    rows: consumption.counts?.rows,
    occurrences: consumption.counts?.occurrences,
    commercial_clean_candidate_rows: consumption.counts?.commercial_clean_candidate_rows,
    commercial_clean_candidate_occurrences:
      consumption.counts?.commercial_clean_candidate_occurrences,
    noncommercial_educational_candidate_rows:
      consumption.counts?.noncommercial_educational_candidate_rows,
    noncommercial_educational_candidate_occurrences:
      consumption.counts?.noncommercial_educational_candidate_occurrences,
    metadata_or_link_only_rows: consumption.counts?.metadata_or_link_only_rows,
    blocked_or_needs_review_rows_inside_workset:
      consumption.counts?.blocked_or_needs_review_rows_inside_workset,
    exact_blocker_rows_outside_workset: consumption.counts?.exact_blocker_rows_outside_workset,
    exact_blocker_occurrences_outside_workset:
      consumption.counts?.exact_blocker_occurrences_outside_workset,
  },
  crosschecked_sources_count_only: {
    agent1_source_license_custody_map: {
      path: inputs.agent1_source_license_custody_map_json,
      status: agent1.status,
      row_payload_copied_here: false,
      row_payload_observed_count_only: Array.isArray(agent1.rows) ? agent1.rows.length : 0,
      source_license_counts: agent1.source_license_counts,
      zero_output_counts: agent1.zero_output_counts,
    },
    agent10_ready_boundary_packet: {
      path: inputs.agent10_ready_boundary_packet_json,
      status: boundaryPacket.status,
      validation_status: boundaryPacket.validation_status,
      counts: boundaryPacket.counts,
      row_payload_copied_here: false,
    },
    agent3_frontier_checkpoint: {
      path: inputs.agent3_frontier_checkpoint_json,
      status: checkpoint.status,
      publication_state: checkpoint.publication_state,
      exact_blocker_rows_still_blocked:
        checkpoint.deuteronomy_continuity_observed?.exact_blocker_rows_still_blocked,
      exact_blocker_occurrences_still_blocked:
        checkpoint.deuteronomy_continuity_observed?.exact_blocker_occurrences_still_blocked,
      planning_rows: checkpoint.deuteronomy_continuity_observed?.reviewed_planning_rows,
      planning_occurrences: checkpoint.deuteronomy_continuity_observed?.reviewed_planning_occurrences,
    },
  },
  validation_commands: [
    'node scripts/validate_agent1_deuteronomy_source_license_custody_map.mjs',
    'node scripts/validate_agent3_frontier_receipt_custody_boundary_observer_package.mjs',
    'node scripts/validate_agent3_deuteronomy_source_license_custody_verdict_continuity_package.mjs',
  ],
  package_summary: {
    purpose:
      'Consume Agent 6 source/license/custody planning verdict as Agent 3 non-public continuity evidence only.',
    agent6_verdict_consumed: true,
    agent10_verdict_consumption_observed: true,
    source_license_custody_rows_now_warn_accepted_as_planning_evidence_only: consumption.counts?.rows,
    source_license_custody_occurrences_now_warn_accepted_as_planning_evidence_only:
      consumption.counts?.occurrences,
    exact_blocker_rows_still_blocked: consumption.counts?.exact_blocker_rows_outside_workset,
    exact_blocker_occurrences_still_blocked:
      consumption.counts?.exact_blocker_occurrences_outside_workset,
    external_lane_rows_copied: 0,
    executable_output_authorized: false,
    next_agent3_action:
      'carry verdict as non-public planning continuity evidence; wait for exact new linkage/dedupe/navigation workset before further pipeline action',
  },
  boundary: {
    nonpublic_planning_evidence_only: true,
    usage_navigation_only: true,
    observer_continuity_only: true,
    no_external_row_payload_copy: true,
    no_source_provenance_acceptance: true,
    no_license_legal_acceptance: true,
    no_commercial_export_permission: true,
    no_definition_authority: true,
    no_usage_as_definition_authority: true,
    no_answer_eligibility: true,
    no_candidate_text_export: true,
    no_route_publication_support: true,
    no_public_runtime_acceptance: true,
    no_publication_readiness: true,
    no_product_data_acceptance: true,
    no_accepted_gloss_or_text: true,
    no_public_reader_output: true,
    no_route_shard_write: true,
    no_runtime_mutation: true,
  },
  what_remains_blocked: [
    'The 1334 rows / 2964 occurrences may be carried only as non-public source/license/custody planning evidence inside the existing Deuteronomy phase-2 boundary.',
    'The 6779 exact-blocker rows / 9631 occurrences remain blocked and outside the accepted planning boundary.',
    'Candidate text export, answer eligibility, definition-content storage, route JSONL, route-shard writes, public HUD rows, runtime/source/token-index/lexical edits, accepted text, public reader output, publication readiness, and commercial export permission remain blocked.',
    'No new Agent 3 executable route exists until a new exact linkage/dedupe/navigation workset is produced.',
  ],
  what_must_not_be_accepted: consumption.what_must_not_be_accepted,
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
      sha256: crypto.createHash('sha256').update(fs.readFileSync(absolute)).digest('hex'),
      bytes: stat.size,
    };
  });
}

function extractDisposition(markdown) {
  const lines = markdown.split(/\r?\n/);
  const index = lines.findIndex((line) => line.trim() === '## Disposition');
  if (index === -1) return 'missing_disposition';
  return lines.slice(index + 1).map((line) => line.trim()).find(Boolean) || 'missing_disposition';
}

function renderMarkdown(value) {
  const counts = value.deuteronomy_planning_counts;
  return `# Agent 3 Deuteronomy Source/License/Custody Verdict Continuity Package - 2026-06-04

## Status

- Artifact: \`${outputJson}\`
- Status: \`${value.status}\`
- Publication state: \`${value.publication_state}\`
- Lane owner: \`${value.lane_owner}\`
- Purpose: ${value.package_summary.purpose}

## Consumed Verdict

- Agent 6 verdict: \`${value.consumed_change.agent6_verdict.disposition}\`
- Agent 10 consumption status: \`${value.consumed_change.agent10_consumption.status}\`
- Stop condition: \`${value.consumed_change.agent10_consumption.stop_condition}\`

## Counts

| Measure | Count |
| --- | ---: |
| Deuteronomy planning rows | ${counts.rows} |
| Deuteronomy planning occurrences | ${counts.occurrences} |
| Commercial-clean candidate rows | ${counts.commercial_clean_candidate_rows} |
| Commercial-clean candidate occurrences | ${counts.commercial_clean_candidate_occurrences} |
| NC educational candidate rows | ${counts.noncommercial_educational_candidate_rows} |
| NC educational candidate occurrences | ${counts.noncommercial_educational_candidate_occurrences} |
| Exact blocker rows outside workset | ${counts.exact_blocker_rows_outside_workset} |
| Exact blocker occurrences outside workset | ${counts.exact_blocker_occurrences_outside_workset} |
| External row payloads copied into Agent 3 | ${value.package_summary.external_lane_rows_copied} |

## Boundary

This package records a downstream verdict transition only: the exact \`1334\` rows / \`2964\` occurrences may be carried as non-public source/license/custody planning evidence inside the existing Deuteronomy phase-2 boundary. It does not authorize source/provenance acceptance, license/legal acceptance, commercial export, Definition authority, answer eligibility, candidate text export, route publication support, public/runtime mutation, publication readiness, accepted gloss/text, or public reader output.

## Remaining Blockers

${value.what_remains_blocked.map((item) => `- ${item}`).join('\n')}

## Validation

${value.validation_commands.map((command) => `- \`${command}\``).join('\n')}

## Reviewed Inputs

${value.reviewed_inputs.map((input) => `- \`${input.path}\` (${input.bytes} bytes, sha256 \`${input.sha256}\`)`).join('\n')}
`;
}

function updateStateMarkdown(value) {
  const start = '<!-- agent3_deuteronomy_source_license_custody_verdict_continuity:start -->';
  const end = '<!-- agent3_deuteronomy_source_license_custody_verdict_continuity:end -->';
  const section = `${start}

## Latest Deuteronomy Source/License/Custody Verdict Continuity

- Package: \`${outputMd}\`
- JSON: \`${outputJson}\`
- Status: \`${value.status}\`
- Consumed Agent 6 verdict: \`${value.consumed_change.agent6_verdict.path}\`
- Counts: ${value.deuteronomy_planning_counts.rows} rows / ${value.deuteronomy_planning_counts.occurrences} occurrences now WARN-ACCEPTED as non-public planning evidence only; ${value.deuteronomy_planning_counts.exact_blocker_rows_outside_workset} exact-blocker rows remain blocked.
- Boundary: no source/license/legal/Definition/runtime/publication/answer acceptance; no copied external row payloads.

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
