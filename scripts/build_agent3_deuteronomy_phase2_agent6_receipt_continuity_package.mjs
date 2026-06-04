#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const inputs = {
  agent3_return_package_json: 'reports/agent3-deuteronomy-phase2-spark1-return-consumption-package-2026-06-04.json',
  agent3_return_package_md: 'reports/agent3-deuteronomy-phase2-spark1-return-consumption-package-2026-06-04.md',
  agent3_matrix_json: 'reports/agent3-deuteronomy-linkage-dedupe-source-route-matrix-2026-06-04.json',
  agent6_transform_verdict_md: 'reports/agent6-deuteronomy-phase2-transform-readiness-boundary-verdict-2026-06-04.md',
  agent6_supplemental_receipt_md: 'reports/agent6-deuteronomy-phase2-agent3-supplemental-receipt-2026-06-04.md',
  agent10_transform_verdict_consumption_md: 'reports/agent10-agent6-deuteronomy-phase2-transform-readiness-verdict-consumption-2026-06-04.md',
  agent10_supplemental_receipt_consumption_json:
    'reports/agent10-agent6-deuteronomy-phase2-agent3-supplemental-receipt-consumption-2026-06-04.json',
  agent10_supplemental_receipt_consumption_md:
    'reports/agent10-agent6-deuteronomy-phase2-agent3-supplemental-receipt-consumption-2026-06-04.md',
  agent2_readiness_json: 'reports/agent2-deuteronomy-phase2-transform-readiness-matrix-2026-06-04.json',
  agent2_readiness_return_md: 'reports/agent2-deuteronomy-phase2-transform-readiness-return-2026-06-04.md',
  agent2_partition_plan_json: 'reports/agent2-deuteronomy-phase2-partition-export-plan-2026-06-04.json',
  agent2_partition_plan_md: 'reports/agent2-deuteronomy-phase2-partition-export-plan-2026-06-04.md',
};

const outputJson = 'reports/agent3-deuteronomy-phase2-agent6-receipt-continuity-package-2026-06-04.json';
const outputMd = 'reports/agent3-deuteronomy-phase2-agent6-receipt-continuity-package-2026-06-04.md';

const returnPackage = readJson(inputs.agent3_return_package_json);
const matrix = readJson(inputs.agent3_matrix_json);
const supplementalConsumption = readJson(inputs.agent10_supplemental_receipt_consumption_json);
const agent2Readiness = readJson(inputs.agent2_readiness_json);
const partitionPlan = readJson(inputs.agent2_partition_plan_json);
const agent6VerdictText = readText(inputs.agent6_transform_verdict_md);
const agent6SupplementalText = readText(inputs.agent6_supplemental_receipt_md);

const output = {
  schema_version: 1,
  artifact_type: 'agent3_deuteronomy_phase2_agent6_receipt_continuity_package',
  generated_at: new Date().toISOString(),
  lane_owner: 'Agent 3',
  status: 'agent6_receipt_consumed_continuity_package',
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / ongoing Agent 3 linkage/dedupe/navigation lane',
  publication_state: 'blocked_no_render',
  target_work: {
    work_id: 'deuteronomy',
    work_title: 'Deuteronomy',
    workset: 'deuteronomy-linkage-dedupe-source-route-continuity',
  },
  reviewed_inputs: manifest(inputs),
  upstream_agent3_package: {
    artifact_json: inputs.agent3_return_package_json,
    artifact_md: inputs.agent3_return_package_md,
    status: returnPackage.status,
    matrix_rows: returnPackage.agent3_matrix?.counts?.rows,
    matrix_occurrences: returnPackage.agent3_matrix?.counts?.occurrences,
    exact_blocker_rows: returnPackage.agent3_matrix?.counts?.exact_blocker_rows,
    exact_blocker_occurrences: returnPackage.agent3_matrix?.counts?.exact_blocker_occurrences,
    downstream_boundary_rows: returnPackage.agent3_matrix?.counts?.downstream_boundary_rows,
    downstream_boundary_occurrences: returnPackage.agent3_matrix?.counts?.downstream_boundary_occurrences,
  },
  agent6_transform_readiness_verdict: {
    artifact: inputs.agent6_transform_verdict_md,
    observed: true,
    disposition: agent6VerdictText.includes('Disposition: WARN-ACCEPTED')
      ? 'WARN-ACCEPTED_exact_nonpublic_transform_readiness_planning_evidence_only'
      : 'review_required',
    reviewed_rows: 1334,
    reviewed_occurrences: 2964,
    widens_public_or_definition_authority: false,
  },
  agent6_supplemental_receipt: {
    artifact: inputs.agent6_supplemental_receipt_md,
    observed: true,
    disposition: agent6SupplementalText.includes('Disposition: RECEIVED / WARN-ACCEPTED')
      ? 'RECEIVED_WARN_ACCEPTED_supplemental_linkage_dedupe_provenance_evidence_only'
      : 'review_required',
    widens_prior_verdict: false,
    blocker_rows_remain_blocked: 6779,
    blocker_occurrences_remain_blocked: 9631,
  },
  agent10_consumption_observed: {
    transform_verdict_consumption: inputs.agent10_transform_verdict_consumption_md,
    supplemental_receipt_consumption_json: inputs.agent10_supplemental_receipt_consumption_json,
    supplemental_receipt_consumption_md: inputs.agent10_supplemental_receipt_consumption_md,
    status: supplementalConsumption.status,
    next_release_owner_action: supplementalConsumption.next_release_owner_action,
    widens_prior_agent6_verdict: supplementalConsumption.boundary?.widens_prior_agent6_verdict,
  },
  matrix_counts_current: pick(matrix.counts, [
    'rows',
    'occurrences',
    'occurrence_units',
    'source_units',
    'manifest_chunks',
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
  agent2_readiness_current: {
    artifact_json: inputs.agent2_readiness_json,
    counts: pick(agent2Readiness.counts, [
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
    zero_emission_counters: agent2Readiness.zero_emission_counters || {},
  },
  agent2_partition_plan_observed: {
    artifact_json: inputs.agent2_partition_plan_json,
    artifact_md: inputs.agent2_partition_plan_md,
    status: partitionPlan.status,
    counts: pick(partitionPlan.counts, [
      'rows',
      'occurrences',
      'commercial_clean_candidate_rows',
      'commercial_clean_candidate_occurrences',
      'noncommercial_educational_candidate_rows',
      'noncommercial_educational_candidate_occurrences',
      'metadata_or_link_only_rows',
      'blocked_or_needs_review_rows',
      'candidate_text_export_rows',
      'answer_eligible_rows',
      'public_emit_rows',
    ]),
    partitions: partitionPlan.partitions,
    zero_emission_counters: partitionPlan.zero_emission_counters || {},
  },
  package_summary: {
    agent6_review_received_for_prior_agent3_package: true,
    agent10_consumed_agent6_receipt: true,
    agent2_partition_plan_observed: true,
    current_carry_forward_state: 'nonpublic_planning_evidence_only',
    exact_blocker_rows_still_blocked: 6779,
    exact_blocker_occurrences_still_blocked: 9631,
    reviewed_planning_rows: 1334,
    reviewed_planning_occurrences: 2964,
    next_executable_route_from_agent3: 'none_until_new_changed_artifact_or_exact_workset',
  },
  validation_commands: [
    'node scripts/validate_agent3_deuteronomy_phase2_linkage_dedupe_source_route_matrix.mjs',
    'node scripts/validate_agent3_deuteronomy_phase2_spark1_return_package.mjs',
    'node scripts/validate_agent10_deuteronomy_phase2_downstream_transform_workset.mjs reports/agent10-agent2-ready-deuteronomy-phase2-downstream-transform-workset-2026-06-04.json',
    'node scripts/validate_agent2_deuteronomy_phase2_transform_readiness_matrix.mjs reports/agent2-deuteronomy-phase2-transform-readiness-matrix-2026-06-04.json',
    'node scripts/validate_agent2_deuteronomy_phase2_partition_export_plan.mjs reports/agent2-deuteronomy-phase2-partition-export-plan-2026-06-04.json',
    'node scripts/validate_agent3_deuteronomy_phase2_agent6_receipt_continuity_package.mjs',
  ],
  what_remains_blocked: [
    '6779 Agent 3 exact-blocker rows / 9631 occurrences remain blocked.',
    '1334 rows / 2964 occurrences are carried only as non-public transform-readiness planning evidence under exact Agent 6 warning controls.',
    'Agent 2 partition/export plan remains non-public planning only and exports zero candidate text rows now.',
    'Any transform execution, candidate text export, route-shard write, public/runtime mutation, answer eligibility, definition-content storage, source/license/legal acceptance, publication readiness, or product/data acceptance requires a separate Agent 6 boundary packet.',
  ],
  what_must_not_be_accepted: [
    'QA acceptance beyond exact Agent 6 dockets',
    'source/provenance acceptance',
    'license acceptance',
    'legal acceptance',
    'Definition authority',
    'usage-as-definition authority',
    'answer eligibility',
    'answer acceptance',
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
    'NC commercial authorization',
  ],
};

fs.writeFileSync(resolve(outputJson), `${JSON.stringify(output, null, 2)}\n`);
fs.writeFileSync(resolve(outputMd), renderMarkdown(output));

console.log(`wrote ${outputJson}`);
console.log(`wrote ${outputMd}`);
console.log(
  `Agent 3 continuity package: Agent6 receipt ${output.agent6_supplemental_receipt.disposition}; planning rows ${output.package_summary.reviewed_planning_rows}; blocked rows ${output.package_summary.exact_blocker_rows_still_blocked}`,
);

function renderMarkdown(artifact) {
  const matrix = artifact.matrix_counts_current;
  const readiness = artifact.agent2_readiness_current.counts;
  const partition = artifact.agent2_partition_plan_observed.counts;
  return [
    '# Agent 3 Deuteronomy Phase-2 Agent 6 Receipt Continuity Package - 2026-06-04',
    '',
    `Status: \`${artifact.status}\`.`,
    '',
    `Publication state: \`${artifact.publication_state}\`.`,
    '',
    'Boundary: Agent 3 continuity package only. This records returned Agent 6/Agent 10/Agent 2 downstream state without widening any docket or creating Definition/public/source/license/answer authority.',
    '',
    '## Returned State Consumed',
    '',
    `- Agent 6 transform/readiness verdict: \`${artifact.agent6_transform_readiness_verdict.disposition}\`.`,
    `- Agent 6 supplemental receipt: \`${artifact.agent6_supplemental_receipt.disposition}\`.`,
    `- Agent 10 supplemental receipt consumption status: \`${artifact.agent10_consumption_observed.status}\`.`,
    `- Agent 10 widened prior Agent 6 verdict: \`${artifact.agent10_consumption_observed.widens_prior_agent6_verdict}\`.`,
    '',
    '## Counts Preserved',
    '',
    `- Agent 3 matrix rows / occurrences: \`${matrix.rows}\` / \`${matrix.occurrences}\`.`,
    `- Agent 3 exact blockers: \`${matrix.exact_blocker_rows}\` rows / \`${matrix.exact_blocker_occurrences}\` occurrences.`,
    `- Agent 3 downstream-boundary rows: \`${matrix.downstream_boundary_rows}\` rows / \`${matrix.downstream_boundary_occurrences}\` occurrences.`,
    `- Agent 3 duplicate-key collision groups: \`${matrix.duplicate_key_collision_groups}\`.`,
    `- Agent 2 readiness rows / occurrences: \`${readiness.rows}\` / \`${readiness.occurrences}\`.`,
    `- Agent 2 answer/public/definition/accepted/route-shard rows: \`${readiness.answer_eligible_rows}\` / \`${readiness.public_emit_rows}\` / \`${readiness.definition_text_emitted_rows}\` / \`${readiness.accepted_text_emitted_rows}\` / \`${readiness.route_shard_write_rows}\`.`,
    `- Agent 2 partition plan rows / occurrences: \`${partition.rows}\` / \`${partition.occurrences}\`.`,
    `- Agent 2 partition candidate text export / answer / public rows now: \`${partition.candidate_text_export_rows}\` / \`${partition.answer_eligible_rows}\` / \`${partition.public_emit_rows}\`.`,
    '',
    '## Reviewed Inputs',
    '',
    ...artifact.reviewed_inputs.map((input) => `- \`${input.role}\`: \`${input.path}\` (${input.sha256}).`),
    '',
    '## Validation Commands',
    '',
    ...artifact.validation_commands.map((command) => `- \`${command}\``),
    '',
    '## Remaining Blocked',
    '',
    ...artifact.what_remains_blocked.map((item) => `- ${item}`),
    '',
    '## Not Accepted',
    '',
    ...artifact.what_must_not_be_accepted.map((item) => `- ${item}`),
    '',
  ].join('\n');
}

function manifest(sourceInputs) {
  return Object.entries(sourceInputs).map(([role, inputPath]) => ({
    role,
    path: inputPath,
    sha256: sha256(inputPath),
  }));
}

function pick(source, keys) {
  const result = {};
  for (const key of keys) result[key] = source?.[key];
  return result;
}

function readJson(file) {
  return JSON.parse(readText(file));
}

function readText(file) {
  return fs.readFileSync(resolve(file), 'utf8');
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(resolve(file))).digest('hex');
}

function resolve(file) {
  return path.join(root, file);
}
