#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-current-source-license-custody-lane-return-addendum-2026-06-05.json';
const resultPath = 'reports/agent1-current-source-license-custody-lane-return-addendum-validation-result-2026-06-05.json';

const noAcceptanceKeys = [
  'no_qa_acceptance',
  'no_source_license_acceptance',
  'no_legal_acceptance',
  'no_definition_authority',
  'no_runtime_public_acceptance',
  'no_publication_readiness',
  'no_product_data_acceptance',
  'no_answer_acceptance',
  'no_accepted_gloss_text',
  'no_nc_commercial_authorization',
  'no_candidate_text_export_authorization',
  'no_release_action',
  'no_public_runtime_mutation',
  'no_queue_mutation',
  'no_staging',
  'no_destructive_repo_action'
];

try {
  const artifact = readJson(artifactPath);
  const paths = artifact.inputs || {};
  const baseLaneReturn = readJson(paths.baseLaneReturn);
  const baseLaneReturnResult = readJson(paths.baseLaneReturnValidationResult);
  const registryAddendum = readJson(paths.registryAddendum);
  const registryResult = readJson(paths.registryAddendumValidationResult);
  const commandResult = readJson(paths.commandManifestAddendumValidationResult);
  const aggregateAddendum = readJson(paths.aggregateHandoffAddendum);
  const aggregateResult = readJson(paths.aggregateHandoffAddendumValidationResult);
  const downstreamAudit = readJson(paths.downstreamAlignmentAudit);
  const downstreamResult = readJson(paths.downstreamAlignmentAuditValidationResult);
  const boundaryPacket = readJson(paths.agent6BoundaryQuestionPacket);
  const boundaryResult = readJson(paths.agent6BoundaryQuestionPacketValidationResult);
  const bdbBlocker = readJson(paths.bdbAugmentedStrongBlocker);
  const bdbResult = readJson(paths.bdbAugmentedStrongBlockerValidationResult);
  const liveReprobe = readJson(paths.bdbAugmentedStrongLiveReprobe);
  const liveReprobeResult = readJson(paths.bdbAugmentedStrongLiveReprobeValidationResult);
  const rowLinkage = readJson(paths.bdbAugmentedStrongRowLinkageProbe);
  const rowLinkageResult = readJson(paths.bdbAugmentedStrongRowLinkageProbeValidationResult);
  const kleinNc = readJson(paths.kleinNcLanePreservation);
  const kleinNcResult = readJson(paths.kleinNcLanePreservationValidationResult);

  assert(artifact.artifact_type === 'agent1_current_source_license_custody_lane_return_addendum', 'unexpected artifact_type');
  assert(artifact.status === 'agent1_current_source_license_custody_lane_return_addendum_validated_overlay_only', 'unexpected status');
  assert(artifact.current_agent1_thread_id === '019e975d-dc9f-7020-a7c8-885d083a837e', 'current Agent 1 thread mismatch');
  assert(artifact.old_agent1_thread_id === '019dc487-5973-7693-aebf-fb0a75936f50', 'old Agent 1 thread mismatch');
  assert(artifact.old_agent1_policy === 'archived_do_not_use', 'old Agent 1 policy mismatch');
  assert(artifact.required_top_output_shape === 'production lane | direct active goal | recallable state/proof artifact | exact blocker | stop condition | correction owner', 'top output shape mismatch');
  assert(artifact.required_lane_output_shape === 'target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition', 'lane output shape mismatch');

  assert(baseLaneReturn.changed_or_current_outputs?.length === 48, 'base lane-return output count must be 48');
  assert(baseLaneReturnResult.ok === true, 'base lane-return validator result must be ok');
  assert(baseLaneReturnResult.output_count === 48, 'base lane-return validator output count must be 48');
  assert(artifact.base_lane_return_state.base_lane_return_output_count_preserved === 48, 'base lane-return preserved count mismatch');
  assert(artifact.base_lane_return_state.base_lane_return_mutated === false, 'base lane-return mutation flag must be false');
  assert(artifact.base_lane_return_state.addendum_overlay_only === true, 'addendum overlay-only flag must be true');

  assert(registryResult.ok === true, 'registry addendum validator result must be ok');
  assert(commandResult.ok === true, 'command manifest addendum validator result must be ok');
  assert(aggregateResult.ok === true, 'aggregate handoff addendum validator result must be ok');
  assert(downstreamResult.ok === true, 'downstream alignment validator result must be ok');
  assert(boundaryResult.ok === true, 'Agent 6 boundary packet validator result must be ok');
  assert(bdbResult.ok === true, 'BDB Augmented Strong blocker validator result must be ok');
  assert(liveReprobeResult.ok === true, 'BDB Augmented Strong live re-probe validator result must be ok');
  assert(rowLinkageResult.ok === true, 'BDB Augmented Strong row-linkage validator result must be ok');
  assert(kleinNcResult.ok === true, 'Klein NC lane preservation validator result must be ok');

  assert(registryAddendum.status === 'agent1_source_license_custody_registry_addendum_validated_overlay_only', 'registry status mismatch');
  assert(aggregateAddendum.status === 'agent1_source_license_custody_aggregate_handoff_addendum_validated_discovery_only', 'aggregate status mismatch');
  assert(downstreamAudit.status === 'agent1_downstream_consumption_aligned_zero_output_no_acceptance', 'downstream status mismatch');
  assert(boundaryPacket.status === 'agent1_agent6_boundary_questions_recorded_not_delivered_zero_candidate_use', 'boundary status mismatch');
  assert(bdbBlocker.status === 'exact_blocker_preserved_no_independent_source_license_custody_basis', 'BDB blocker status mismatch');
  assert(liveReprobe.status === 'external_candidate_observed_exact_custody_linkage_still_blocked', 'BDB live re-probe status mismatch');
  assert(rowLinkage.status === 'row_linkage_fields_missing_exact_custody_linkage_still_blocked', 'BDB row-linkage status mismatch');
  assert(kleinNc.status === 'klein_noncommercial_educational_candidate_preserved_separately_zero_output', 'Klein NC preservation status mismatch');

  const outputs = artifact.addendum_lane_return_outputs || [];
  assert(outputs.length === 9, 'addendum lane-return output count must be 9');
  for (const output of outputs) {
    assert(output.target && output.path && output.report && output.validator_result, `malformed addendum output: ${output.target}`);
    assert(exists(output.path), `missing addendum output path: ${output.path}`);
    assert(exists(output.report), `missing addendum output report: ${output.report}`);
    assert(exists(output.validator_result), `missing addendum output validator result: ${output.validator_result}`);
  }

  const counts = artifact.addendum_counts || {};
  assert(counts.addendum_lane_return_output_count === outputs.length, 'addendum output count mismatch');
  assert(counts.base_lane_return_output_count_preserved === 48, 'base lane-return count mismatch');
  assert(counts.registry_recallable_artifact_count === registryResult.recallable_artifact_count, 'registry recallable count mismatch');
  assert(counts.command_addendum_runnable_command_set_count === commandResult.addendum_runnable_command_set_count, 'command addendum runnable count mismatch');
  assert(counts.bdb_augmented_strong_live_reprobe_exact_blocker_count === 4, 'BDB Augmented Strong live re-probe blocker count mismatch');
  assert(counts.bdb_augmented_strong_row_linkage_exact_blocker_count === 6, 'BDB Augmented Strong row-linkage blocker count mismatch');
  assert(counts.klein_nc_lane_preservation_exact_blocker_count === 6, 'Klein NC lane preservation blocker count mismatch');
  assert(counts.source_family_rows === 5, 'source-family row count mismatch');
  assert(counts.commercial_clean_candidate_source_families === 3, 'commercial-clean source-family count mismatch');
  assert(counts.noncommercial_educational_candidate_source_families === 1, 'NC source-family count mismatch');
  assert(counts.metadata_or_link_only_source_families === 0, 'metadata/link-only source-family count mismatch');
  assert(counts.blocked_or_needs_review_source_families === 1, 'blocked/review source-family count mismatch');
  assert(counts.lane_exact_blocker_count === 2, 'lane exact blocker count mismatch');
  assert(counts.downstream_alignment_exact_blocker_count === 5, 'downstream exact blocker count mismatch');
  assert(counts.boundary_question_exact_blocker_count === 6, 'boundary exact blocker count mismatch');
  assert(counts.aggregate_exact_blocker_count === 6, 'aggregate exact blocker count mismatch');
  for (const key of [
    'allowed_transform_rows_now',
    'candidate_text_rows_now',
    'answer_eligible_rows_now',
    'public_emit_rows_now',
    'release_route_opened_now',
    'agent6_delivery_now',
    'base_lane_return_mutation_count',
    'queue_mutation_count',
    'render_mutation_count',
    'staged_file_count'
  ]) {
    assert(counts[key] === 0, `${key} must be zero`);
  }

  const laneOutput = artifact.lane_output || {};
  assert(laneOutput.target === 'old-dictionary-excluded-row-license-lane-reaudit', 'lane output target mismatch');
  assert((laneOutput.files_used || []).every(exists), 'lane output files_used contains missing path');
  assert(laneOutput.lane_counts_rows.source_family_rows === 5, 'lane output source-family rows mismatch');
  assert(laneOutput.lane_counts_rows.commercial_clean_candidate_source_families === 3, 'lane output commercial-clean count mismatch');
  assert(laneOutput.lane_counts_rows.noncommercial_educational_candidate_source_families === 1, 'lane output NC count mismatch');
  assert(laneOutput.lane_counts_rows.metadata_or_link_only_source_families === 0, 'lane output metadata/link count mismatch');
  assert(laneOutput.lane_counts_rows.blocked_or_needs_review_source_families === 1, 'lane output blocked/review count mismatch');

  const lanes = new Map((laneOutput.classification_lanes || []).map((lane) => [lane.license_lane, lane]));
  assert(lanes.size === 4, 'classification lane count must be 4');
  assert(lanes.get('commercial_clean_candidate')?.source_family_count === 3, 'commercial-clean lane mismatch');
  const ncLane = lanes.get('noncommercial_educational_candidate');
  assert(ncLane?.source_family_count === 1, 'NC lane mismatch');
  assert(ncLane.required_flags?.derived_from_nc === true, 'NC derived flag must be true');
  assert(ncLane.required_flags?.commercial_export_allowed === false, 'NC commercial export flag must be false');
  assert(ncLane.required_flags?.attribution_required === true, 'NC attribution flag must be true');
  assert(ncLane.required_flags?.corpus_contamination === false, 'NC corpus contamination flag must be false');
  assert(lanes.get('metadata_or_link_only')?.source_family_count === 0, 'metadata/link-only lane mismatch');
  assert(lanes.get('blocked_or_needs_review')?.source_family_count === 1, 'blocked/review lane mismatch');

  assert(laneOutput.exact_blockers?.length === 6, 'aggregate exact blocker count mismatch');
  assert(laneOutput.lane_exact_blockers?.length === 2, 'lane exact blocker count mismatch');
  assert(laneOutput.downstream_alignment_exact_blockers?.length === 5, 'downstream blocker count mismatch');
  assert(laneOutput.agent6_boundary_question_exact_blockers?.length === 6, 'Agent 6 boundary blocker count mismatch');
  assert(laneOutput.lane_exact_blockers.some((row) => row.row_subset_id.endsWith('klein-dictionary')), 'Klein lane blocker missing');
  assert(laneOutput.lane_exact_blockers.some((row) => row.row_subset_id.endsWith('bdb-augmented-strong')), 'BDB Augmented Strong lane blocker missing');
  assert(laneOutput.handoff_owner?.agent2?.includes('lane evidence'), 'Agent 2 handoff must mention lane evidence');
  assert(laneOutput.handoff_owner?.agent6?.includes('boundary'), 'Agent 6 handoff must mention boundary');
  assert(laneOutput.handoff_owner?.agent10?.includes('package'), 'Agent 10 handoff must mention package');

  assert(artifact.downstream_alignment.allowed_transform_rows_now === 0, 'downstream allowed transform rows must be zero');
  assert(artifact.downstream_alignment.candidate_text_rows_now === 0, 'downstream candidate text rows must be zero');
  assert(artifact.downstream_alignment.answer_eligible_rows_now === 0, 'downstream answer rows must be zero');
  assert(artifact.downstream_alignment.public_emit_rows_now === 0, 'downstream public rows must be zero');
  assert(artifact.downstream_alignment.release_route_opened_now === 0, 'downstream release rows must be zero');
  assert(artifact.agent6_boundary_questions.boundary_question_rows === 6, 'boundary question rows mismatch');
  assert(artifact.agent6_boundary_questions.delivered_to_agent6_now === false, 'Agent 6 delivery flag must be false');
  assert(artifact.agent6_boundary_questions.direct_route_attempted_now === false, 'Agent 6 direct route flag must be false');
  assert(artifact.blocker_summary.bdb_augmented_strong.license_lane === 'blocked_or_needs_review', 'BDB lane mismatch');
  assert(artifact.blocker_summary.bdb_augmented_strong.rows === 222, 'BDB row count mismatch');
  assert(artifact.blocker_summary.bdb_augmented_strong.occurrences === 4435, 'BDB occurrence count mismatch');
  assert(artifact.blocker_summary.bdb_augmented_strong.repository_candidate_source_file_count === 0, 'BDB source-file probe count mismatch');
  assert(artifact.blocker_summary.bdb_augmented_strong_live_reprobe.license_lane === 'blocked_or_needs_review', 'BDB live re-probe lane mismatch');
  assert(artifact.blocker_summary.bdb_augmented_strong_live_reprobe.candidate_source_license_basis_observed === true, 'BDB live re-probe candidate basis flag mismatch');
  assert(artifact.blocker_summary.bdb_augmented_strong_live_reprobe.exact_linkage_to_current_imported_row_subset_proven === false, 'BDB live re-probe exact linkage flag must be false');
  assert(artifact.blocker_summary.bdb_augmented_strong_live_reprobe.exact_blocker_count === 4, 'BDB live re-probe blocker count mismatch');
  assert(artifact.blocker_summary.bdb_augmented_strong_live_reprobe.allowed_transform_rows_now === 0, 'BDB live re-probe transform rows must be zero');
  assert(artifact.blocker_summary.bdb_augmented_strong_live_reprobe.candidate_text_rows_now === 0, 'BDB live re-probe candidate text rows must be zero');
  assert(artifact.blocker_summary.bdb_augmented_strong_live_reprobe.agent6_delivery_now === 0, 'BDB live re-probe Agent 6 delivery rows must be zero');
  assert(artifact.blocker_summary.bdb_augmented_strong_row_linkage_probe.license_lane === 'blocked_or_needs_review', 'BDB row-linkage lane mismatch');
  assert(artifact.blocker_summary.bdb_augmented_strong_row_linkage_probe.augindex_entry_count === 9299, 'BDB row-linkage AugIndex count mismatch');
  assert(artifact.blocker_summary.bdb_augmented_strong_row_linkage_probe.exact_linkage_to_current_imported_row_subset_proven === false, 'BDB row-linkage exact linkage flag must be false');
  assert(artifact.blocker_summary.bdb_augmented_strong_row_linkage_probe.exact_blocker_count === 6, 'BDB row-linkage blocker count mismatch');
  assert(artifact.blocker_summary.bdb_augmented_strong_row_linkage_probe.allowed_transform_rows_now === 0, 'BDB row-linkage transform rows must be zero');
  assert(artifact.blocker_summary.bdb_augmented_strong_row_linkage_probe.candidate_text_rows_now === 0, 'BDB row-linkage candidate text rows must be zero');
  assert(artifact.blocker_summary.bdb_augmented_strong_row_linkage_probe.agent6_delivery_now === 0, 'BDB row-linkage Agent 6 delivery rows must be zero');
  assert(artifact.blocker_summary.klein_nc_lane_preservation.license_lane === 'noncommercial_educational_candidate', 'Klein NC lane mismatch');
  assert(artifact.blocker_summary.klein_nc_lane_preservation.rows === 214, 'Klein NC row count mismatch');
  assert(artifact.blocker_summary.klein_nc_lane_preservation.occurrences === 4444, 'Klein NC occurrence count mismatch');
  assert(artifact.blocker_summary.klein_nc_lane_preservation.prior_nc_klein_package_rows === 17, 'Klein prior package row count mismatch');
  assert(artifact.blocker_summary.klein_nc_lane_preservation.commercial_export_allowed === false, 'Klein commercial export must be false');
  assert(artifact.blocker_summary.klein_nc_lane_preservation.exact_blocker_count === 6, 'Klein exact blocker count mismatch');
  assert(artifact.blocker_summary.klein_nc_lane_preservation.allowed_transform_rows_now === 0, 'Klein transform rows must be zero');
  assert(artifact.blocker_summary.klein_nc_lane_preservation.candidate_text_rows_now === 0, 'Klein candidate text rows must be zero');
  assert(artifact.blocker_summary.klein_nc_lane_preservation.agent6_delivery_now === 0, 'Klein Agent 6 delivery rows must be zero');

  for (const [key, value] of Object.entries(artifact.zero_output_counts || {})) {
    assert(value === 0, `zero-output count must be zero: ${key}`);
  }
  for (const [key, value] of Object.entries(artifact.overlay_boundary || {})) {
    assert(value === false, `overlay boundary flag must be false: ${key}`);
  }
  for (const key of noAcceptanceKeys) {
    assert(artifact.non_acceptance_boundary?.[key] === true, `missing no-acceptance key: ${key}`);
  }

  const result = {
    ok: true,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    status: artifact.status,
    target: artifact.target,
    addendum_lane_return_output_count: outputs.length,
    base_lane_return_output_count_preserved: counts.base_lane_return_output_count_preserved,
    source_family_rows: counts.source_family_rows,
    commercial_clean_candidate_source_families: counts.commercial_clean_candidate_source_families,
    noncommercial_educational_candidate_source_families: counts.noncommercial_educational_candidate_source_families,
    metadata_or_link_only_source_families: counts.metadata_or_link_only_source_families,
    blocked_or_needs_review_source_families: counts.blocked_or_needs_review_source_families,
    lane_exact_blocker_count: counts.lane_exact_blocker_count,
    downstream_alignment_exact_blocker_count: counts.downstream_alignment_exact_blocker_count,
    boundary_question_exact_blocker_count: counts.boundary_question_exact_blocker_count,
    aggregate_exact_blocker_count: counts.aggregate_exact_blocker_count,
    klein_nc_lane_preservation_exact_blocker_count: counts.klein_nc_lane_preservation_exact_blocker_count,
    bdb_augmented_strong_live_reprobe_exact_blocker_count: counts.bdb_augmented_strong_live_reprobe_exact_blocker_count,
    bdb_augmented_strong_row_linkage_exact_blocker_count: counts.bdb_augmented_strong_row_linkage_exact_blocker_count,
    allowed_transform_rows_now: counts.allowed_transform_rows_now,
    candidate_text_rows_now: counts.candidate_text_rows_now,
    agent6_delivery_now: counts.agent6_delivery_now,
    no_acceptance_claims: true
  };
  writeJson(resultPath, result);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  const result = {
    ok: false,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    error: error.message,
    details: error.details ?? null
  };
  writeJson(resultPath, result);
  console.error(JSON.stringify(result, null, 2));
  process.exitCode = 1;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function assert(condition, message, details = null) {
  if (!condition) {
    const error = new Error(message);
    error.details = details;
    throw error;
  }
}
