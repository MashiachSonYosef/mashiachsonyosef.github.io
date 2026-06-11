#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const paths = {
  outputJson: 'reports/agent1-current-source-license-custody-lane-return-addendum-2026-06-05.json',
  outputMd: 'reports/agent1-current-source-license-custody-lane-return-addendum-2026-06-05.md',
  validator: 'scripts/validate_agent1_current_source_license_custody_lane_return_addendum.mjs',
  validatorResult: 'reports/agent1-current-source-license-custody-lane-return-addendum-validation-result-2026-06-05.json',
  baseLaneReturn: 'reports/agent1-current-source-license-custody-lane-return-2026-06-04.json',
  baseLaneReturnReport: 'reports/agent1-current-source-license-custody-lane-return-2026-06-04.md',
  baseLaneReturnValidationResult: 'reports/agent1-current-source-license-custody-lane-return-validation-result-2026-06-04.json',
  june5MarkdownOnlyLaneReturn: 'reports/agent1-current-source-license-custody-lane-return-2026-06-05.md',
  registryAddendum: 'reports/agent1-source-license-custody-pipeline-registry-addendum-2026-06-05.json',
  registryAddendumReport: 'reports/agent1-source-license-custody-pipeline-registry-addendum-2026-06-05.md',
  registryAddendumValidationResult: 'reports/agent1-source-license-custody-pipeline-registry-addendum-validation-result-2026-06-05.json',
  commandManifestAddendum: 'reports/agent1-source-license-custody-command-manifest-addendum-2026-06-05.json',
  commandManifestAddendumReport: 'reports/agent1-source-license-custody-command-manifest-addendum-2026-06-05.md',
  commandManifestAddendumValidationResult: 'reports/agent1-source-license-custody-command-manifest-addendum-validation-result-2026-06-05.json',
  aggregateHandoffAddendum: 'reports/agent1-source-license-custody-aggregate-handoff-addendum-2026-06-05.json',
  aggregateHandoffAddendumReport: 'reports/agent1-source-license-custody-aggregate-handoff-addendum-2026-06-05.md',
  aggregateHandoffAddendumValidationResult: 'reports/agent1-source-license-custody-aggregate-handoff-addendum-validation-result-2026-06-05.json',
  downstreamAlignmentAudit: 'reports/agent1-old-dictionary-downstream-consumption-alignment-audit-2026-06-05.json',
  downstreamAlignmentAuditReport: 'reports/agent1-old-dictionary-downstream-consumption-alignment-audit-2026-06-05.md',
  downstreamAlignmentAuditValidationResult: 'reports/agent1-old-dictionary-downstream-consumption-alignment-audit-validation-result-2026-06-05.json',
  agent6BoundaryQuestionPacket: 'reports/agent1-old-dictionary-agent6-boundary-question-packet-2026-06-05.json',
  agent6BoundaryQuestionPacketReport: 'reports/agent1-old-dictionary-agent6-boundary-question-packet-2026-06-05.md',
  agent6BoundaryQuestionPacketValidationResult: 'reports/agent1-old-dictionary-agent6-boundary-question-packet-validation-result-2026-06-05.json',
  bdbAugmentedStrongBlocker: 'reports/agent1-bdb-augmented-strong-source-custody-blocker-2026-06-05.json',
  bdbAugmentedStrongBlockerReport: 'reports/agent1-bdb-augmented-strong-source-custody-blocker-2026-06-05.md',
  bdbAugmentedStrongBlockerValidationResult: 'reports/agent1-bdb-augmented-strong-source-custody-blocker-validation-result-2026-06-05.json',
  bdbAugmentedStrongLiveReprobe: 'reports/agent1-bdb-augmented-strong-live-source-custody-reprobe-2026-06-05.json',
  bdbAugmentedStrongLiveReprobeReport: 'reports/agent1-bdb-augmented-strong-live-source-custody-reprobe-2026-06-05.md',
  bdbAugmentedStrongLiveReprobeValidationResult: 'reports/agent1-bdb-augmented-strong-live-source-custody-reprobe-validation-result-2026-06-05.json',
  bdbAugmentedStrongRowLinkageProbe: 'reports/agent1-bdb-augmented-strong-row-linkage-probe-2026-06-05.json',
  bdbAugmentedStrongRowLinkageProbeReport: 'reports/agent1-bdb-augmented-strong-row-linkage-probe-2026-06-05.md',
  bdbAugmentedStrongRowLinkageProbeValidationResult: 'reports/agent1-bdb-augmented-strong-row-linkage-probe-validation-result-2026-06-05.json',
  kleinNcLanePreservation: 'reports/agent1-old-dictionary-klein-nc-lane-preservation-2026-06-05.json',
  kleinNcLanePreservationReport: 'reports/agent1-old-dictionary-klein-nc-lane-preservation-2026-06-05.md',
  kleinNcLanePreservationValidationResult: 'reports/agent1-old-dictionary-klein-nc-lane-preservation-validation-result-2026-06-05.json'
};

const baseLaneReturn = readJson(paths.baseLaneReturn);
const baseLaneReturnValidationResult = readJson(paths.baseLaneReturnValidationResult);
const registryAddendum = readJson(paths.registryAddendum);
const registryAddendumValidationResult = readJson(paths.registryAddendumValidationResult);
const commandManifestAddendumValidationResult = readJson(paths.commandManifestAddendumValidationResult);
const aggregateHandoffAddendum = readJson(paths.aggregateHandoffAddendum);
const aggregateHandoffAddendumValidationResult = readJson(paths.aggregateHandoffAddendumValidationResult);
const downstreamAlignmentAudit = readJson(paths.downstreamAlignmentAudit);
const downstreamAlignmentAuditValidationResult = readJson(paths.downstreamAlignmentAuditValidationResult);
const agent6BoundaryQuestionPacket = readJson(paths.agent6BoundaryQuestionPacket);
const agent6BoundaryQuestionPacketValidationResult = readJson(paths.agent6BoundaryQuestionPacketValidationResult);
const bdbAugmentedStrongBlocker = readJson(paths.bdbAugmentedStrongBlocker);
const bdbAugmentedStrongBlockerValidationResult = readJson(paths.bdbAugmentedStrongBlockerValidationResult);
const bdbAugmentedStrongLiveReprobe = readJson(paths.bdbAugmentedStrongLiveReprobe);
const bdbAugmentedStrongLiveReprobeValidationResult = readJson(paths.bdbAugmentedStrongLiveReprobeValidationResult);
const bdbAugmentedStrongRowLinkageProbe = readJson(paths.bdbAugmentedStrongRowLinkageProbe);
const bdbAugmentedStrongRowLinkageProbeValidationResult = readJson(paths.bdbAugmentedStrongRowLinkageProbeValidationResult);
const kleinNcLanePreservation = readJson(paths.kleinNcLanePreservation);
const kleinNcLanePreservationValidationResult = readJson(paths.kleinNcLanePreservationValidationResult);

const handoff = aggregateHandoffAddendum.current_old_dictionary_handoff;
const registryLaneOutput = registryAddendum.lane_output;

const addendumLaneReturnOutputs = [
  {
    target: 'agent1-source-license-custody-pipeline-registry-addendum',
    path: paths.registryAddendum,
    report: paths.registryAddendumReport,
    validator_result: paths.registryAddendumValidationResult,
    status: registryAddendum.status,
    output_role: 'recallable source/license/custody registry overlay'
  },
  {
    target: 'agent1-source-license-custody-command-manifest-addendum',
    path: paths.commandManifestAddendum,
    report: paths.commandManifestAddendumReport,
    validator_result: paths.commandManifestAddendumValidationResult,
    status: 'agent1_source_license_custody_command_manifest_addendum_validated_for_discovery_only',
    output_role: 'recallable command surface overlay'
  },
  {
    target: 'agent1-source-license-custody-aggregate-handoff-addendum',
    path: paths.aggregateHandoffAddendum,
    report: paths.aggregateHandoffAddendumReport,
    validator_result: paths.aggregateHandoffAddendumValidationResult,
    status: aggregateHandoffAddendum.status,
    output_role: 'recallable aggregate handoff overlay'
  },
  {
    target: 'old-dictionary-downstream-consumption-alignment-audit',
    path: paths.downstreamAlignmentAudit,
    report: paths.downstreamAlignmentAuditReport,
    validator_result: paths.downstreamAlignmentAuditValidationResult,
    status: downstreamAlignmentAudit.status,
    output_role: 'Agent 2 and Agent 10 zero-output alignment evidence'
  },
  {
    target: 'old-dictionary-agent6-boundary-question-packet',
    path: paths.agent6BoundaryQuestionPacket,
    report: paths.agent6BoundaryQuestionPacketReport,
    validator_result: paths.agent6BoundaryQuestionPacketValidationResult,
    status: agent6BoundaryQuestionPacket.status,
    output_role: 'future Agent 6 row/subset boundary-question packet not delivered'
  },
  {
    target: 'bdb-augmented-strong-source-custody-blocker',
    path: paths.bdbAugmentedStrongBlocker,
    report: paths.bdbAugmentedStrongBlockerReport,
    validator_result: paths.bdbAugmentedStrongBlockerValidationResult,
    status: bdbAugmentedStrongBlocker.status,
    output_role: 'exact blocked/review source-custody blocker'
  },
  {
    target: 'bdb-augmented-strong-live-source-custody-reprobe',
    path: paths.bdbAugmentedStrongLiveReprobe,
    report: paths.bdbAugmentedStrongLiveReprobeReport,
    validator_result: paths.bdbAugmentedStrongLiveReprobeValidationResult,
    status: bdbAugmentedStrongLiveReprobe.status,
    output_role: 'live external-candidate source/custody re-probe with exact linkage blocker'
  },
  {
    target: 'bdb-augmented-strong-row-linkage-probe',
    path: paths.bdbAugmentedStrongRowLinkageProbe,
    report: paths.bdbAugmentedStrongRowLinkageProbeReport,
    validator_result: paths.bdbAugmentedStrongRowLinkageProbeValidationResult,
    status: bdbAugmentedStrongRowLinkageProbe.status,
    output_role: 'row-level mechanical linkage probe against OpenScriptures AugIndex'
  },
  {
    target: 'old-dictionary-klein-nc-lane-preservation',
    path: paths.kleinNcLanePreservation,
    report: paths.kleinNcLanePreservationReport,
    validator_result: paths.kleinNcLanePreservationValidationResult,
    status: kleinNcLanePreservation.status,
    output_role: 'row-scoped Klein noncommercial educational lane preservation'
  }
];

const artifact = {
  schema_version: 1,
  artifact_type: 'agent1_current_source_license_custody_lane_return_addendum',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent1_current_source_license_custody_lane_return_addendum.mjs',
  status: 'agent1_current_source_license_custody_lane_return_addendum_validated_overlay_only',
  agent: 'Agent 1',
  thread_title: 'Agent 1 - importer',
  current_agent1_thread_id: registryAddendum.current_thread_id,
  old_agent1_thread_id: registryAddendum.old_agent1_thread_id,
  old_agent1_policy: registryAddendum.old_agent1_policy,
  active_mode: registryAddendum.active_mode,
  production_lane: registryAddendum.production_lane,
  direct_active_goal: registryAddendum.direct_active_goal,
  target: 'old-dictionary-excluded-row-license-lane-reaudit',
  correction_owner: 'Agent 1 current importer; old Agent 1 archived/do-not-use',
  required_top_output_shape: 'production lane | direct active goal | recallable state/proof artifact | exact blocker | stop condition | correction owner',
  required_lane_output_shape: 'target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition',
  purpose: 'Expose the June 5 old-dictionary source/license/custody lane evidence as a validator-backed lane-return addendum while preserving the June 4 lane-return snapshot.',
  inputs: paths,
  recallable_state_proof_artifact: {
    json: paths.outputJson,
    report: paths.outputMd,
    validator: paths.validator,
    validator_result: paths.validatorResult
  },
  base_lane_return_state: {
    base_lane_return: paths.baseLaneReturn,
    base_lane_return_report: paths.baseLaneReturnReport,
    base_lane_return_validation_result: paths.baseLaneReturnValidationResult,
    base_lane_return_status: baseLaneReturn.status,
    base_lane_return_output_count_preserved: baseLaneReturn.changed_or_current_outputs.length,
    base_lane_return_validation_ok: baseLaneReturnValidationResult.ok,
    base_lane_return_mutated: false,
    june5_markdown_only_lane_return: paths.june5MarkdownOnlyLaneReturn,
    addendum_overlay_only: true
  },
  addendum_counts: {
    addendum_lane_return_output_count: addendumLaneReturnOutputs.length,
    base_lane_return_output_count_preserved: baseLaneReturn.changed_or_current_outputs.length,
    registry_recallable_artifact_count: registryAddendumValidationResult.recallable_artifact_count,
    command_addendum_runnable_command_set_count: commandManifestAddendumValidationResult.addendum_runnable_command_set_count,
    klein_nc_lane_preservation_exact_blocker_count: kleinNcLanePreservation.exact_blockers.length,
    bdb_augmented_strong_live_reprobe_exact_blocker_count: bdbAugmentedStrongLiveReprobe.exact_blockers.length,
    bdb_augmented_strong_row_linkage_exact_blocker_count: bdbAugmentedStrongRowLinkageProbe.exact_blockers.length,
    source_family_rows: handoff.lane_counts_rows.source_family_rows,
    commercial_clean_candidate_source_families: handoff.lane_counts_rows.commercial_clean_candidate_source_families,
    noncommercial_educational_candidate_source_families: handoff.lane_counts_rows.noncommercial_educational_candidate_source_families,
    metadata_or_link_only_source_families: handoff.lane_counts_rows.metadata_or_link_only_source_families,
    blocked_or_needs_review_source_families: handoff.lane_counts_rows.blocked_or_needs_review_source_families,
    lane_exact_blocker_count: registryLaneOutput.exact_blockers.length,
    downstream_alignment_exact_blocker_count: downstreamAlignmentAudit.exact_blockers.length,
    boundary_question_exact_blocker_count: agent6BoundaryQuestionPacket.exact_blockers.length,
    aggregate_exact_blocker_count: handoff.exact_blockers.length,
    allowed_transform_rows_now: handoff.lane_counts_rows.allowed_transform_rows_now,
    candidate_text_rows_now: handoff.lane_counts_rows.candidate_text_rows_now,
    answer_eligible_rows_now: handoff.lane_counts_rows.answer_eligible_rows_now,
    public_emit_rows_now: handoff.lane_counts_rows.public_emit_rows_now,
    release_route_opened_now: handoff.lane_counts_rows.release_route_opened_now,
    agent6_delivery_now: handoff.lane_counts_rows.agent6_delivery_now,
    base_lane_return_mutation_count: 0,
    queue_mutation_count: 0,
    render_mutation_count: 0,
    staged_file_count: 0
  },
  addendum_lane_return_outputs: addendumLaneReturnOutputs,
  lane_output: {
    target: 'old-dictionary-excluded-row-license-lane-reaudit',
    files_used: unique([
      paths.baseLaneReturn,
      paths.baseLaneReturnValidationResult,
      ...registryLaneOutput.files_used,
      ...handoff.files_used,
      paths.registryAddendumValidationResult,
      paths.commandManifestAddendumValidationResult,
      paths.aggregateHandoffAddendumValidationResult,
      paths.downstreamAlignmentAuditValidationResult,
      paths.agent6BoundaryQuestionPacketValidationResult,
      paths.bdbAugmentedStrongBlockerValidationResult,
      paths.bdbAugmentedStrongLiveReprobe,
      paths.bdbAugmentedStrongLiveReprobeValidationResult,
      paths.bdbAugmentedStrongRowLinkageProbe,
      paths.bdbAugmentedStrongRowLinkageProbeValidationResult,
      paths.kleinNcLanePreservation,
      paths.kleinNcLanePreservationValidationResult
    ]),
    lane_counts_rows: {
      ...registryLaneOutput.lane_counts_rows,
      ...handoff.lane_counts_rows
    },
    classification_lanes: handoff.classification_lanes,
    exact_blockers: handoff.exact_blockers,
    lane_exact_blockers: registryLaneOutput.exact_blockers,
    downstream_alignment_exact_blockers: downstreamAlignmentAudit.exact_blockers,
    agent6_boundary_question_exact_blockers: agent6BoundaryQuestionPacket.exact_blockers,
    handoff_owner: handoff.handoff_owner,
    stop_condition: handoff.stop_condition
  },
  downstream_alignment: {
    artifact: paths.downstreamAlignmentAudit,
    validator_result: paths.downstreamAlignmentAuditValidationResult,
    validator_ok: downstreamAlignmentAuditValidationResult.ok,
    exact_blocker_count: downstreamAlignmentAudit.exact_blockers.length,
    allowed_transform_rows_now: downstreamAlignmentAudit.downstream_alignment_counts.allowed_transform_rows_now,
    candidate_text_rows_now: downstreamAlignmentAudit.downstream_alignment_counts.candidate_text_rows_now,
    answer_eligible_rows_now: downstreamAlignmentAudit.downstream_alignment_counts.answer_eligible_rows_now,
    public_emit_rows_now: downstreamAlignmentAudit.downstream_alignment_counts.public_emit_rows_now,
    release_route_opened_now: downstreamAlignmentAudit.downstream_alignment_counts.release_route_opened_now
  },
  agent6_boundary_questions: {
    artifact: paths.agent6BoundaryQuestionPacket,
    validator_result: paths.agent6BoundaryQuestionPacketValidationResult,
    validator_ok: agent6BoundaryQuestionPacketValidationResult.ok,
    boundary_question_rows: agent6BoundaryQuestionPacket.boundary_question_counts.total_boundary_question_rows,
    delivered_to_agent6_now: agent6BoundaryQuestionPacket.delivery_state.delivered_to_agent6_now,
    direct_route_attempted_now: agent6BoundaryQuestionPacket.delivery_state.direct_route_attempted_now,
    exact_blocker_count: agent6BoundaryQuestionPacket.exact_blockers.length
  },
  blocker_summary: {
    bdb_augmented_strong: {
      artifact: paths.bdbAugmentedStrongBlocker,
      validator_result: paths.bdbAugmentedStrongBlockerValidationResult,
      validator_ok: bdbAugmentedStrongBlockerValidationResult.ok,
      license_lane: bdbAugmentedStrongBlocker.source_family.license_lane,
      rows: bdbAugmentedStrongBlocker.source_family.rows,
      occurrences: bdbAugmentedStrongBlocker.source_family.occurrences,
      exact_blocker_id: bdbAugmentedStrongBlocker.exact_blocker.blocker_id,
      observed_license: bdbAugmentedStrongBlocker.exact_blocker.observed_license,
      observed_version_source: bdbAugmentedStrongBlocker.exact_blocker.observed_version_source,
      repository_candidate_source_file_count: bdbAugmentedStrongBlocker.exact_blocker.repository_candidate_source_file_count
    },
    bdb_augmented_strong_live_reprobe: {
      artifact: paths.bdbAugmentedStrongLiveReprobe,
      validator_result: paths.bdbAugmentedStrongLiveReprobeValidationResult,
      validator_ok: bdbAugmentedStrongLiveReprobeValidationResult.ok,
      license_lane: bdbAugmentedStrongLiveReprobe.classification_lane_decision.license_lane,
      candidate_source_license_basis_observed: bdbAugmentedStrongLiveReprobe.external_candidate_evidence.candidate_source_license_basis_observed,
      exact_linkage_to_current_imported_row_subset_proven: bdbAugmentedStrongLiveReprobe.external_candidate_evidence.exact_linkage_to_current_imported_row_subset_proven,
      exact_blocker_count: bdbAugmentedStrongLiveReprobe.exact_blockers.length,
      allowed_transform_rows_now: 0,
      candidate_text_rows_now: 0,
      agent6_delivery_now: 0
    },
    bdb_augmented_strong_row_linkage_probe: {
      artifact: paths.bdbAugmentedStrongRowLinkageProbe,
      validator_result: paths.bdbAugmentedStrongRowLinkageProbeValidationResult,
      validator_ok: bdbAugmentedStrongRowLinkageProbeValidationResult.ok,
      license_lane: bdbAugmentedStrongRowLinkageProbe.classification_lane_decision.license_lane,
      augindex_entry_count: bdbAugmentedStrongRowLinkageProbe.open_scriptures_augindex_profile.entry_count,
      exact_linkage_to_current_imported_row_subset_proven: bdbAugmentedStrongRowLinkageProbe.classification_lane_decision.exact_linkage_to_current_imported_row_subset_proven,
      exact_blocker_count: bdbAugmentedStrongRowLinkageProbe.exact_blockers.length,
      allowed_transform_rows_now: 0,
      candidate_text_rows_now: 0,
      agent6_delivery_now: 0
    },
    klein_nc_lane_preservation: {
      artifact: paths.kleinNcLanePreservation,
      validator_result: paths.kleinNcLanePreservationValidationResult,
      validator_ok: kleinNcLanePreservationValidationResult.ok,
      license_lane: kleinNcLanePreservation.source_family.license_lane,
      rows: kleinNcLanePreservation.source_family.rows,
      occurrences: kleinNcLanePreservation.source_family.occurrences,
      prior_nc_klein_package_rows: kleinNcLanePreservation.scope_boundary.prior_nc_klein_package_rows,
      commercial_export_allowed: kleinNcLanePreservation.source_family.commercial_export_allowed,
      exact_blocker_count: kleinNcLanePreservation.exact_blockers.length,
      allowed_transform_rows_now: 0,
      candidate_text_rows_now: 0,
      agent6_delivery_now: 0
    }
  },
  zero_output_counts: aggregateHandoffAddendum.zero_output_counts,
  overlay_boundary: {
    base_lane_return_mutated: false,
    base_registry_mutated: false,
    base_command_manifest_mutated: false,
    queue_mutation_performed: false,
    render_mutation_performed: false,
    staged_files_created: false,
    route_opened: false,
    agent6_delivery_performed: false,
    definition_content_created: false,
    answer_content_created: false
  },
  non_acceptance_boundary: aggregateHandoffAddendum.non_acceptance_boundary,
  exact_blocker: 'Current downstream use remains blocked on future exact Agent 6 row/subset boundary, approved morphology relation, Klein NC/no-commercial-export boundary, and BDB Augmented Strong independent source/license/custody evidence.',
  stop_condition: 'Stop after validated lane-return addendum and exact blockers; do not mutate the June 4 lane-return, transform, route, publish, deliver to Agent 6, stage, create Definition/answer content, claim acceptance, or authorize NC commercial use.'
};

writeJson(paths.outputJson, artifact);
writeText(paths.outputMd, renderMarkdown(artifact));
console.log(JSON.stringify({
  ok: true,
  artifact: paths.outputJson,
  report: paths.outputMd,
  addendum_lane_return_output_count: artifact.addendum_counts.addendum_lane_return_output_count,
  base_lane_return_output_count_preserved: artifact.addendum_counts.base_lane_return_output_count_preserved,
  source_family_rows: artifact.addendum_counts.source_family_rows,
  lane_counts: {
    commercial_clean_candidate: artifact.addendum_counts.commercial_clean_candidate_source_families,
    noncommercial_educational_candidate: artifact.addendum_counts.noncommercial_educational_candidate_source_families,
    metadata_or_link_only: artifact.addendum_counts.metadata_or_link_only_source_families,
    blocked_or_needs_review: artifact.addendum_counts.blocked_or_needs_review_source_families
  },
  aggregate_exact_blocker_count: artifact.addendum_counts.aggregate_exact_blocker_count
}, null, 2));

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeText(relativePath, value) {
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), value, 'utf8');
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function renderMarkdown(artifact) {
  const counts = artifact.addendum_counts;
  const laneOutput = artifact.lane_output;
  const filesUsed = laneOutput.files_used.map((file) => `\`${file}\``).join('<br>');
  const classification = laneOutput.classification_lanes.map((lane) => {
    const families = lane.source_families.length ? lane.source_families.join(', ') : 'zero current rows';
    return `\`${lane.license_lane}\`: ${lane.source_family_count} (${families})`;
  }).join('<br>');
  const blockers = [
    ...laneOutput.lane_exact_blockers.map((row) => `\`${row.row_subset_id}\`: ${row.blocker}`),
    ...laneOutput.exact_blockers.map((blocker) => `\`${blocker}\``)
  ].join('<br>');

  return `# Agent 1 Current Source/License/Custody Lane Return Addendum - 2026-06-05

Status: \`${artifact.status}\`

This is an overlay-only lane-return addendum. It preserves the June 4 machine lane-return snapshot and exposes the current June 5 old-dictionary source/license/custody evidence as recallable, validator-backed Agent 1 lane evidence.

## Production State

| production lane | direct active goal | recallable state/proof artifact | exact blocker | stop condition | correction owner |
| --- | --- | --- | --- | --- | --- |
| ${artifact.production_lane} | ${artifact.direct_active_goal} | \`${artifact.recallable_state_proof_artifact.json}\` + \`${artifact.recallable_state_proof_artifact.validator}\` | ${artifact.exact_blocker} | ${artifact.stop_condition} | ${artifact.correction_owner} |

## Lane Output

| target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition |
| --- | --- | --- | --- | --- | --- | --- |
| \`${artifact.target}\` | ${filesUsed} | source-family rows: ${counts.source_family_rows}<br>lane split: ${counts.commercial_clean_candidate_source_families} / ${counts.noncommercial_educational_candidate_source_families} / ${counts.metadata_or_link_only_source_families} / ${counts.blocked_or_needs_review_source_families}<br>allowed transform rows now: ${counts.allowed_transform_rows_now}<br>candidate text rows now: ${counts.candidate_text_rows_now}<br>Agent 6 deliveries now: ${counts.agent6_delivery_now} | ${classification} | ${blockers} | Agent 2: ${laneOutput.handoff_owner.agent2}<br>Agent 6: ${laneOutput.handoff_owner.agent6}<br>Agent 10: ${laneOutput.handoff_owner.agent10} | ${laneOutput.stop_condition} |

## Base Preservation

- Base lane-return JSON: \`${artifact.base_lane_return_state.base_lane_return}\`
- Base output count preserved: ${counts.base_lane_return_output_count_preserved}
- Addendum output count: ${counts.addendum_lane_return_output_count}
- Base lane-return mutation count: ${counts.base_lane_return_mutation_count}
- Queue/render/staging mutation counts: ${counts.queue_mutation_count} / ${counts.render_mutation_count} / ${counts.staged_file_count}

## Boundary

No QA/source/license/legal/Definition/runtime/publication/product/answer acceptance, accepted gloss/text, candidate-text export authorization, release action, public/runtime mutation, NC commercial authorization, queue mutation, staging, or destructive repo action is claimed.
`;
}
