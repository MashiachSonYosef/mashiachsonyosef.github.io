#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const inputs = {
  prior_agent3_spark1_package_json:
    'reports/agent3-deuteronomy-phase2-spark1-return-consumption-package-2026-06-04.json',
  prior_agent3_spark1_package_md:
    'reports/agent3-deuteronomy-phase2-spark1-return-consumption-package-2026-06-04.md',
  agent10_ready_boundary_packet_json:
    'reports/agent10-agent6-ready-deuteronomy-phase2-transform-readiness-boundary-packet-2026-06-04.json',
  agent10_ready_boundary_packet_md:
    'reports/agent10-agent6-ready-deuteronomy-phase2-transform-readiness-boundary-packet-2026-06-04.md',
  agent6_transform_readiness_verdict_md:
    'reports/agent6-deuteronomy-phase2-transform-readiness-boundary-verdict-2026-06-04.md',
  agent10_verdict_consumption_json:
    'reports/agent10-agent6-deuteronomy-phase2-transform-readiness-verdict-consumption-2026-06-04.json',
  agent10_verdict_consumption_md:
    'reports/agent10-agent6-deuteronomy-phase2-transform-readiness-verdict-consumption-2026-06-04.md',
  agent6_agent3_supplemental_receipt_md:
    'reports/agent6-deuteronomy-phase2-agent3-supplemental-receipt-2026-06-04.md',
  agent10_agent3_supplemental_consumption_json:
    'reports/agent10-agent6-deuteronomy-phase2-agent3-supplemental-receipt-consumption-2026-06-04.json',
  agent10_agent3_supplemental_consumption_md:
    'reports/agent10-agent6-deuteronomy-phase2-agent3-supplemental-receipt-consumption-2026-06-04.md',
  agent3_matrix_json:
    'reports/agent3-deuteronomy-linkage-dedupe-source-route-matrix-2026-06-04.json',
  agent3_matrix_md:
    'reports/agent3-deuteronomy-linkage-dedupe-source-route-matrix-2026-06-04.md',
  agent2_readiness_json:
    'reports/agent2-deuteronomy-phase2-transform-readiness-matrix-2026-06-04.json',
  agent2_readiness_md:
    'reports/agent2-deuteronomy-phase2-transform-readiness-matrix-2026-06-04.md',
  agent10_agent2_workset_json:
    'reports/agent10-agent2-ready-deuteronomy-phase2-downstream-transform-workset-2026-06-04.json',
  agent10_agent2_workset_md:
    'reports/agent10-agent2-ready-deuteronomy-phase2-downstream-transform-workset-2026-06-04.md',
};

const outputJson =
  'reports/agent3-deuteronomy-phase2-transform-readiness-verdict-continuity-package-2026-06-05.json';
const outputMd =
  'reports/agent3-deuteronomy-phase2-transform-readiness-verdict-continuity-package-2026-06-05.md';
const stateMdPath = 'reports/agent3-state.md';

const prior = readJson(inputs.prior_agent3_spark1_package_json);
const boundaryPacket = readJson(inputs.agent10_ready_boundary_packet_json);
const verdictText = readText(inputs.agent6_transform_readiness_verdict_md);
const consumption = readJson(inputs.agent10_verdict_consumption_json);
const supplementalText = readText(inputs.agent6_agent3_supplemental_receipt_md);
const supplementalConsumption = readJson(inputs.agent10_agent3_supplemental_consumption_json);
const agent3Matrix = readJson(inputs.agent3_matrix_json);
const agent2Readiness = readJson(inputs.agent2_readiness_json);
const agent10Workset = readJson(inputs.agent10_agent2_workset_json);

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_deuteronomy_phase2_transform_readiness_verdict_continuity_package',
  generated_at: new Date().toISOString(),
  lane_owner: 'Agent 3',
  status: 'agent6_warn_accepted_nonpublic_transform_readiness_observed_by_agent3',
  publication_state: 'blocked_no_render',
  active_goal: 'ongoing Agent 3 linkage/dedupe/navigation/source-route matrix lane',
  target_work: {
    work_id: 'deuteronomy',
    work_title: 'Deuteronomy',
    workset: 'deuteronomy-phase2-transform-readiness-verdict-continuity',
  },
  reviewed_inputs: manifest(inputs),
  consumed_change: {
    prior_agent3_spark1_package: {
      path: inputs.prior_agent3_spark1_package_json,
      status: prior.status,
      publication_state: prior.publication_state,
      agent6_acceptance_claimed: prior.package_summary?.agent6_acceptance_claimed,
      row_payload_copied_here: false,
      matrix_counts: pickCounts(prior.agent3_matrix?.counts, [
        'rows',
        'occurrences',
        'downstream_boundary_rows',
        'downstream_boundary_occurrences',
        'exact_blocker_rows',
        'exact_blocker_occurrences',
        'duplicate_key_collision_groups',
      ]),
    },
    agent6_transform_readiness_verdict: {
      path: inputs.agent6_transform_readiness_verdict_md,
      disposition: extractDisposition(verdictText),
      warn_accepted_nonpublic_transform_readiness_only: verdictText.includes(
        'WARN-ACCEPTED for exact non-public transform-readiness planning evidence only',
      ),
      no_acceptance_claims_created: verdictText.includes(
        'This docket does not authorize transform execution',
      ),
      exact_boundary_rows: 1334,
      exact_boundary_occurrences: 2964,
    },
    agent10_verdict_consumption: {
      path: inputs.agent10_verdict_consumption_json,
      status: consumption.status,
      stop_condition: consumption.stop_condition,
      next_release_owner_action: consumption.next_release_owner_action,
      allowed_carry_forward: consumption.allowed_carry_forward,
      zero_emission_counters: consumption.zero_emission_counters,
      warning_controls: consumption.warning_controls,
    },
    agent6_agent3_supplemental_receipt: {
      path: inputs.agent6_agent3_supplemental_receipt_md,
      disposition: extractDisposition(supplementalText),
      supplemental_only: supplementalText.includes(
        'supplemental linkage-dedupe provenance evidence only',
      ),
      no_widening_of_prior_boundary: supplementalText.includes('does not widen the prior WARN-ACCEPTED'),
    },
    agent10_agent3_supplemental_consumption: {
      path: inputs.agent10_agent3_supplemental_consumption_json,
      status: supplementalConsumption.status,
      next_release_owner_action: supplementalConsumption.next_release_owner_action,
      boundary: supplementalConsumption.boundary,
      counts: supplementalConsumption.counts,
    },
  },
  deuteronomy_transform_readiness_counts: {
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
  },
  agent3_linkage_matrix_counts: pickCounts(agent3Matrix.counts, [
    'rows',
    'occurrences',
    'token_index_forms',
    'token_index_occurrences',
    'occurrence_units',
    'source_units',
    'manifest_chunks',
    'joined_token_index_rows',
    'missing_token_index_join_rows',
    'downstream_boundary_rows',
    'downstream_boundary_occurrences',
    'exact_blocker_rows',
    'exact_blocker_occurrences',
    'duplicate_key_collision_groups',
    'public_hud_rows',
    'route_jsonl_rows',
    'route_shard_writes',
    'runtime_files_changed',
    'source_files_changed',
    'token_index_files_changed',
    'lexical_payload_files_changed',
    'definition_content_rows',
    'nc_definition_content_rows',
    'answer_rows',
    'accepted_text_rows',
  ]),
  crosschecked_inputs_count_only: {
    agent10_ready_boundary_packet: {
      path: inputs.agent10_ready_boundary_packet_json,
      status: boundaryPacket.status,
      review_scope: boundaryPacket.review_scope,
      zero_emission_counters: boundaryPacket.zero_emission_counters,
      row_payload_copied_here: false,
    },
    agent2_readiness_matrix: {
      path: inputs.agent2_readiness_json,
      status: agent2Readiness.status,
      counts: pickCounts(agent2Readiness.counts, [
        'rows',
        'occurrences',
        'commercial_clean_candidate_rows',
        'commercial_clean_candidate_occurrences',
        'noncommercial_educational_candidate_rows',
        'noncommercial_educational_candidate_occurrences',
        'metadata_or_link_only_rows',
        'blocked_or_needs_review_rows',
        'answer_eligible_rows',
        'public_emit_rows',
        'definition_text_emitted_rows',
        'accepted_text_emitted_rows',
        'route_shard_write_rows',
      ]),
      zero_emission_counters: agent2Readiness.zero_emission_counters,
      row_payload_copied_here: false,
    },
    agent10_agent2_workset: {
      path: inputs.agent10_agent2_workset_json,
      status: agent10Workset.status,
      counts: pickCounts(agent10Workset.counts, [
        'rows',
        'occurrences',
        'nc_rows',
        'nc_occurrences',
        'commercial_clean_candidate_rows',
        'commercial_clean_candidate_occurrences',
      ]),
      source_matrix_counts: pickCounts(agent10Workset.source_matrix_counts, [
        'rows',
        'occurrences',
        'downstream_boundary_rows',
        'downstream_boundary_occurrences',
        'exact_blocker_rows',
        'exact_blocker_occurrences',
        'duplicate_key_collision_groups',
      ]),
      row_payload_copied_here: false,
    },
  },
  validation_commands: [
    'node scripts/validate_agent3_deuteronomy_phase2_transform_readiness_verdict_continuity_package.mjs',
    'node scripts/validate_agent3_deuteronomy_phase2_linkage_dedupe_source_route_matrix.mjs',
    'node scripts/validate_agent10_deuteronomy_phase2_downstream_transform_workset.mjs reports/agent10-agent2-ready-deuteronomy-phase2-downstream-transform-workset-2026-06-04.json',
    'node scripts/validate_agent2_deuteronomy_phase2_transform_readiness_matrix.mjs reports/agent2-deuteronomy-phase2-transform-readiness-matrix-2026-06-04.json',
  ],
  package_summary: {
    purpose:
      'Record Agent 3 continuity after Agent 6 WARN-accepted the Deuteronomy phase-2 transform/readiness matrix as non-public planning evidence only.',
    agent6_transform_readiness_verdict_consumed: true,
    agent10_verdict_consumption_observed: true,
    agent3_supplemental_receipt_observed: true,
    transform_readiness_rows_warn_accepted_as_planning_evidence_only: consumption.counts?.rows,
    transform_readiness_occurrences_warn_accepted_as_planning_evidence_only:
      consumption.counts?.occurrences,
    exact_blocker_rows_still_blocked: supplementalConsumption.counts?.agent3_exact_blocker_rows,
    exact_blocker_occurrences_still_blocked:
      supplementalConsumption.counts?.agent3_exact_blocker_occurrences,
    external_lane_rows_copied: 0,
    executable_output_authorized: false,
    next_agent3_action:
      'wait for a changed exact linkage/dedupe/navigation workset before producing another matrix package',
  },
  boundary: {
    nonpublic_transform_readiness_planning_evidence_only: true,
    supplemental_linkage_dedupe_navigation_provenance_evidence_only: true,
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
    'The 1334 rows / 2964 occurrences may be carried only as non-public transform-readiness planning evidence for Deuteronomy phase 2.',
    'The 6779 Agent 3 exact-blocker rows / 9631 occurrences remain blocked outside the accepted planning boundary.',
    'Candidate text export, answer eligibility, definition-content storage, route JSONL, route-shard writes, public HUD rows, runtime/source/token-index/lexical edits, accepted text, public reader output, publication readiness, and commercial export permission remain blocked.',
    'No new Agent 3 executable route exists until a changed exact linkage/dedupe/navigation workset appears.',
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

function pickCounts(source, keys) {
  const value = {};
  for (const key of keys) value[key] = source?.[key];
  return value;
}

function extractDisposition(markdown) {
  const lines = markdown.split(/\r?\n/);
  const inlineDisposition = lines.find((line) => line.trim().startsWith('Disposition:'));
  if (inlineDisposition) return inlineDisposition.replace(/^Disposition:\s*/, '').trim();
  const index = lines.findIndex((line) => line.trim() === '## Disposition');
  if (index === -1) return 'missing_disposition';
  return lines.slice(index + 1).map((line) => line.trim()).find(Boolean) || 'missing_disposition';
}

function renderMarkdown(value) {
  const counts = value.deuteronomy_transform_readiness_counts;
  const matrix = value.agent3_linkage_matrix_counts;
  return `# Agent 3 Deuteronomy Phase-2 Transform/Readiness Verdict Continuity Package - 2026-06-05

## Status

- Artifact: \`${outputJson}\`
- Status: \`${value.status}\`
- Publication state: \`${value.publication_state}\`
- Lane owner: \`${value.lane_owner}\`
- Purpose: ${value.package_summary.purpose}

## Consumed Verdicts

- Agent 6 transform/readiness verdict: \`${value.consumed_change.agent6_transform_readiness_verdict.disposition}\`
- Agent 10 verdict consumption status: \`${value.consumed_change.agent10_verdict_consumption.status}\`
- Agent 6 Agent 3 supplemental receipt: \`${value.consumed_change.agent6_agent3_supplemental_receipt.disposition}\`
- Supplemental consumption status: \`${value.consumed_change.agent10_agent3_supplemental_consumption.status}\`

## Counts

| Measure | Count |
| --- | ---: |
| Transform/readiness planning rows | ${counts.rows} |
| Transform/readiness planning occurrences | ${counts.occurrences} |
| Commercial-clean candidate rows | ${counts.commercial_clean_candidate_rows} |
| Commercial-clean candidate occurrences | ${counts.commercial_clean_candidate_occurrences} |
| NC educational candidate rows | ${counts.noncommercial_educational_candidate_rows} |
| NC educational candidate occurrences | ${counts.noncommercial_educational_candidate_occurrences} |
| Agent 3 linkage matrix rows | ${matrix.rows} |
| Agent 3 linkage matrix occurrences | ${matrix.occurrences} |
| Downstream-boundary rows | ${matrix.downstream_boundary_rows} |
| Downstream-boundary occurrences | ${matrix.downstream_boundary_occurrences} |
| Exact blocker rows still blocked | ${matrix.exact_blocker_rows} |
| Exact blocker occurrences still blocked | ${matrix.exact_blocker_occurrences} |
| Duplicate-key collision groups | ${matrix.duplicate_key_collision_groups} |
| External row payloads copied into Agent 3 | ${value.package_summary.external_lane_rows_copied} |

## Boundary

This package records Agent 3 continuity after the Agent 6 verdict and supplemental receipt. It carries only non-public transform/readiness planning evidence and supplemental linkage/dedupe/navigation provenance evidence. It does not authorize source/provenance acceptance, license/legal acceptance, commercial export, Definition authority, usage-as-definition authority, answer eligibility, candidate text export, route publication support, public/runtime mutation, publication readiness, accepted gloss/text, or public reader output.

## Remaining Blockers

${value.what_remains_blocked.map((item) => `- ${item}`).join('\n')}

## Validation

${value.validation_commands.map((command) => `- \`${command}\``).join('\n')}

## Reviewed Inputs

${value.reviewed_inputs.map((input) => `- \`${input.path}\` (${input.bytes} bytes, sha256 \`${input.sha256}\`)`).join('\n')}
`;
}

function updateStateMarkdown(value) {
  const start = '<!-- agent3_deuteronomy_transform_readiness_verdict_continuity:start -->';
  const end = '<!-- agent3_deuteronomy_transform_readiness_verdict_continuity:end -->';
  const section = `${start}

## Latest Deuteronomy Transform/Readiness Verdict Continuity

- Package: \`${outputMd}\`
- JSON: \`${outputJson}\`
- Status: \`${value.status}\`
- Consumed Agent 6 verdict: \`${value.consumed_change.agent6_transform_readiness_verdict.path}\`
- Consumed Agent 6 supplemental receipt: \`${value.consumed_change.agent6_agent3_supplemental_receipt.path}\`
- Counts: ${value.deuteronomy_transform_readiness_counts.rows} rows / ${value.deuteronomy_transform_readiness_counts.occurrences} occurrences now WARN-ACCEPTED as non-public transform/readiness planning evidence only; ${value.agent3_linkage_matrix_counts.exact_blocker_rows} exact-blocker rows remain blocked.
- Boundary: no source/license/legal/Definition/runtime/publication/answer acceptance; no copied row payloads.

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
