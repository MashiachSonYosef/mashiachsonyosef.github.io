#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const output = 'reports/agent2-state.md';
const receiptPath = 'reports/agent2-old-dictionary-queue-state-validation-receipt-2026-06-05.json';
const commercialCleanBoundaryReceiptPath = 'reports/agent2-commercial-clean-boundary-held-packet-consumption-receipt-2026-06-05.json';
const morphologyMatrixPath = 'reports/agent2-old-dictionary-commercial-clean-morphology-relation-matrix-2026-06-05.json';
const candidateUseBlockerPath = 'reports/agent2-morphology-planning-candidate-use-blocker-2026-06-05.json';
const agent10PreflightHandoffPath = 'reports/agent2-agent10-candidate-use-preflight-handoff-2026-06-05.json';
const agent4GateProofReceiptPath = 'reports/agent2-agent4-gate-proof-consumption-receipt-2026-06-05.json';
const tokenSourceAggregateReceiptPath = 'reports/agent2-token-source-aggregate-consumption-receipt-2026-06-05.json';
const orot205ReceiptPath = 'reports/agent2-orot-205-commercial-clean-gate-consumption-receipt-2026-06-05.json';
const tokenSourceAggregateGateProofReceiptPath = 'reports/agent2-token-source-aggregate-gate-proof-consumption-receipt-2026-06-05.json';
const orot205GateProofReceiptPath = 'reports/agent2-orot-205-gate-proof-consumption-receipt-2026-06-05.json';
const stateIntegrityRollupPath = 'reports/agent2-state-integrity-rollup-2026-06-05.json';
const tokenSourceNestedGateProofReceiptPath = 'reports/agent2-token-source-nested-gate-proof-consumption-receipt-2026-06-05.json';
const morphologyCandidateUsePackagePath = 'reports/agent2-old-dictionary-morphology-candidate-use-package-2026-06-05.json';
const agent10MorphologyCandidateUseHandoffReceiptPath = 'reports/agent2-agent10-morphology-candidate-use-handoff-consumption-receipt-2026-06-05.json';
const agent10MorphologyCandidateUsePackageConsumptionReceiptPath = 'reports/agent2-agent10-morphology-candidate-use-package-consumption-receipt-2026-06-05.json';
const exactRowSubsetManifestAgent6WaitReceiptPath = 'reports/agent2-exact-row-subset-manifest-agent6-wait-receipt-2026-06-05.json';
const sourceFamilyMembershipOverlapReceiptPath = 'reports/agent2-source-family-membership-overlap-receipt-2026-06-05.json';
const downstreamAlignmentAuditReceiptPath = 'reports/agent2-downstream-alignment-audit-receipt-2026-06-05.json';
const rowOverlapBoundaryReceiptPath = 'reports/agent2-row-overlap-boundary-receipt-2026-06-05.json';
const agent1BoundaryQuestionPacketReceiptPath = 'reports/agent2-agent1-boundary-question-packet-receipt-2026-06-05.json';
const kleinNcLanePreservationReceiptPath = 'reports/agent2-klein-nc-lane-preservation-receipt-2026-06-05.json';
const receipt = readJson(receiptPath);
const commercialCleanBoundaryReceipt = readJson(commercialCleanBoundaryReceiptPath);
const morphologyMatrix = readJson(morphologyMatrixPath);
const candidateUseBlocker = readJson(candidateUseBlockerPath);
const agent10PreflightHandoff = readJson(agent10PreflightHandoffPath);
const agent4GateProofReceipt = readJson(agent4GateProofReceiptPath);
const tokenSourceAggregateReceipt = readJson(tokenSourceAggregateReceiptPath);
const orot205Receipt = readJson(orot205ReceiptPath);
const tokenSourceAggregateGateProofReceipt = readJson(tokenSourceAggregateGateProofReceiptPath);
const orot205GateProofReceipt = readJson(orot205GateProofReceiptPath);
const stateIntegrityRollup = readJson(stateIntegrityRollupPath);
const tokenSourceNestedGateProofReceipt = readJson(tokenSourceNestedGateProofReceiptPath);
const morphologyCandidateUsePackage = readJson(morphologyCandidateUsePackagePath);
const agent10MorphologyCandidateUseHandoffReceipt = readJson(agent10MorphologyCandidateUseHandoffReceiptPath);
const agent10MorphologyCandidateUsePackageConsumptionReceipt = readJson(agent10MorphologyCandidateUsePackageConsumptionReceiptPath);
const exactRowSubsetManifestAgent6WaitReceipt = readJson(exactRowSubsetManifestAgent6WaitReceiptPath);
const sourceFamilyMembershipOverlapReceipt = readJson(sourceFamilyMembershipOverlapReceiptPath);
const downstreamAlignmentAuditReceipt = readJson(downstreamAlignmentAuditReceiptPath);
const rowOverlapBoundaryReceipt = readJson(rowOverlapBoundaryReceiptPath);
const agent1BoundaryQuestionPacketReceipt = readJson(agent1BoundaryQuestionPacketReceiptPath);
const kleinNcLanePreservationReceipt = readJson(kleinNcLanePreservationReceiptPath);

assertReceipt(receipt);
assertCommercialCleanBoundaryReceipt(commercialCleanBoundaryReceipt);
assertMorphologyMatrix(morphologyMatrix);
assertCandidateUseBlocker(candidateUseBlocker);
assertAgent10PreflightHandoff(agent10PreflightHandoff);
assertAgent4GateProofReceipt(agent4GateProofReceipt);
assertTokenSourceAggregateReceipt(tokenSourceAggregateReceipt);
assertOrot205Receipt(orot205Receipt);
assertTokenSourceAggregateGateProofReceipt(tokenSourceAggregateGateProofReceipt);
assertOrot205GateProofReceipt(orot205GateProofReceipt);
assertStateIntegrityRollup(stateIntegrityRollup);
assertTokenSourceNestedGateProofReceipt(tokenSourceNestedGateProofReceipt);
assertMorphologyCandidateUsePackage(morphologyCandidateUsePackage);
assertAgent10MorphologyCandidateUseHandoffReceipt(agent10MorphologyCandidateUseHandoffReceipt);
assertAgent10MorphologyCandidateUsePackageConsumptionReceipt(agent10MorphologyCandidateUsePackageConsumptionReceipt);
assertExactRowSubsetManifestAgent6WaitReceipt(exactRowSubsetManifestAgent6WaitReceipt);
assertSourceFamilyMembershipOverlapReceipt(sourceFamilyMembershipOverlapReceipt);
assertDownstreamAlignmentAuditReceipt(downstreamAlignmentAuditReceipt);
assertRowOverlapBoundaryReceipt(rowOverlapBoundaryReceipt);
assertAgent1BoundaryQuestionPacketReceipt(agent1BoundaryQuestionPacketReceipt);
assertKleinNcLanePreservationReceipt(kleinNcLanePreservationReceipt);
writeState(output, receipt, commercialCleanBoundaryReceipt, morphologyMatrix, candidateUseBlocker, agent10PreflightHandoff, agent4GateProofReceipt, tokenSourceAggregateReceipt, orot205Receipt, tokenSourceAggregateGateProofReceipt, orot205GateProofReceipt, stateIntegrityRollup, tokenSourceNestedGateProofReceipt, morphologyCandidateUsePackage, agent10MorphologyCandidateUseHandoffReceipt, agent10MorphologyCandidateUsePackageConsumptionReceipt, exactRowSubsetManifestAgent6WaitReceipt, sourceFamilyMembershipOverlapReceipt, downstreamAlignmentAuditReceipt, rowOverlapBoundaryReceipt, agent1BoundaryQuestionPacketReceipt, kleinNcLanePreservationReceipt);
console.log(`wrote ${output}`);

function assertReceipt(value) {
  if (value.artifact_type !== 'agent2_old_dictionary_queue_state_validation_receipt') throw new Error('receipt artifact_type mismatch');
  if (value.status !== 'queue_points_to_current_validated_readiness_and_exact_blockers') throw new Error('receipt status mismatch');
  if (value.counts.source_family_rows !== 5) throw new Error('source family count mismatch');
  if (value.counts.allowed_transform_rows_now !== 0) throw new Error('allowed transform rows must be 0');
  if (value.lane_preservation.nc_commercial_export_allowed !== false) throw new Error('NC commercial export must be false');
  for (const value of Object.values(receipt.zero_output_counts)) {
    if (value !== 0) throw new Error('zero output counter mismatch');
  }
}

function assertOrot205Receipt(value) {
  if (value.artifact_type !== 'agent2_orot_205_commercial_clean_gate_consumption_receipt') throw new Error('Orot 205 receipt artifact_type mismatch');
  if (value.counts.rows !== 205) throw new Error('Orot 205 row count mismatch');
  if (value.counts.candidate_text_rows_now !== 0) throw new Error('Orot 205 candidate rows must be 0');
}

function assertOrot205GateProofReceipt(value) {
  if (value.artifact_type !== 'agent2_orot_205_gate_proof_consumption_receipt') throw new Error('Orot 205 gate-proof receipt artifact_type mismatch');
  if (value.counts.rows !== 205) throw new Error('Orot 205 gate-proof row count mismatch');
  if (value.counts.candidate_text_rows_now !== 0) throw new Error('Orot 205 gate-proof candidate rows must be 0');
}

function assertStateIntegrityRollup(value) {
  if (value.artifact_type !== 'agent2_state_integrity_rollup') throw new Error('state integrity rollup artifact_type mismatch');
  if (value.counts.artifacts_checked !== 19) throw new Error('state integrity rollup artifact count mismatch');
  if (value.counts.allowed_transform_rows_now !== 0) throw new Error('state integrity rollup transform rows must be 0');
}

function assertTokenSourceNestedGateProofReceipt(value) {
  if (value.artifact_type !== 'agent2_token_source_nested_gate_proof_consumption_receipt') throw new Error('token-source nested gate-proof receipt artifact_type mismatch');
  if (value.counts.aggregate_edge_rows !== 1951013) throw new Error('token-source nested aggregate edge rows mismatch');
  if (value.counts.candidate_rows !== 0) throw new Error('token-source nested candidate rows must be 0');
}

function assertMorphologyCandidateUsePackage(value) {
  if (value.artifact_type !== 'agent2_old_dictionary_morphology_candidate_use_package') throw new Error('morphology candidate-use package artifact_type mismatch');
  if (value.counts.package_rows !== 78) throw new Error('morphology candidate-use package row count mismatch');
  if (value.counts.package_occurrences !== 1461) throw new Error('morphology candidate-use package occurrence count mismatch');
  if (value.counts.candidate_text_rows !== 0) throw new Error('morphology candidate-use package text rows must be 0');
}

function assertAgent10MorphologyCandidateUseHandoffReceipt(value) {
  if (value.artifact_type !== 'agent2_agent10_morphology_candidate_use_handoff_consumption_receipt') throw new Error('Agent10 morphology candidate-use handoff receipt artifact_type mismatch');
  if (value.counts.package_rows !== 78) throw new Error('Agent10 morphology candidate-use handoff receipt row count mismatch');
  if (value.counts.package_occurrences !== 1461) throw new Error('Agent10 morphology candidate-use handoff receipt occurrence count mismatch');
  if (value.counts.candidate_text_rows !== 0) throw new Error('Agent10 morphology candidate-use handoff receipt text rows must be 0');
}

function assertAgent10MorphologyCandidateUsePackageConsumptionReceipt(value) {
  if (value.artifact_type !== 'agent2_agent10_morphology_candidate_use_package_consumption_receipt') throw new Error('Agent10 morphology candidate-use package consumption receipt artifact_type mismatch');
  if (value.counts.package_rows !== 78) throw new Error('Agent10 morphology candidate-use package consumption receipt row count mismatch');
  if (value.counts.package_occurrences !== 1461) throw new Error('Agent10 morphology candidate-use package consumption receipt occurrence count mismatch');
  if (value.closed_wait.agent2_wait_remains !== false) throw new Error('Agent10 morphology candidate-use package consumption receipt must close Agent2 wait');
  if (value.counts.candidate_text_rows !== 0) throw new Error('Agent10 morphology candidate-use package consumption receipt text rows must be 0');
}

function assertExactRowSubsetManifestAgent6WaitReceipt(value) {
  if (value.artifact_type !== 'agent2_exact_row_subset_manifest_agent6_wait_receipt') throw new Error('exact row-subset manifest Agent6 wait receipt artifact_type mismatch');
  if (value.manifest_counts.audited_rows !== 500) throw new Error('exact row-subset manifest Agent6 wait receipt row count mismatch');
  if (value.manifest_counts.subset_count !== 8) throw new Error('exact row-subset manifest Agent6 wait receipt subset count mismatch');
  if (value.delivery_state.agent6_verdict_present_now !== false) throw new Error('exact row-subset manifest Agent6 verdict must be absent');
  if (value.zero_output_counts.allowed_transform_rows_now !== 0) throw new Error('exact row-subset manifest transform rows must be 0');
}

function assertSourceFamilyMembershipOverlapReceipt(value) {
  if (value.artifact_type !== 'agent2_source_family_membership_overlap_receipt') throw new Error('source-family membership overlap receipt artifact_type mismatch');
  if (value.membership_counts.unique_preview_rows !== 500) throw new Error('source-family membership overlap receipt unique rows mismatch');
  if (value.membership_counts.source_family_membership_rows_nonexclusive !== 936) throw new Error('source-family membership overlap receipt membership rows mismatch');
  if (value.overlap_counts.pairwise_intersection_count !== 10) throw new Error('source-family membership overlap receipt pairwise overlap count mismatch');
  if (value.zero_output_counts.allowed_transform_rows_now !== 0) throw new Error('source-family membership overlap receipt transform rows must be 0');
}

function assertDownstreamAlignmentAuditReceipt(value) {
  if (value.artifact_type !== 'agent2_downstream_alignment_audit_receipt') throw new Error('downstream alignment audit receipt artifact_type mismatch');
  if (value.downstream_alignment_counts.agent2_readiness_source_family_rows !== 5) throw new Error('downstream alignment audit receipt source family rows mismatch');
  if (value.exact_blockers.length !== 5) throw new Error('downstream alignment audit receipt blocker count mismatch');
  if (value.zero_output_counts.allowed_transform_rows_now !== 0) throw new Error('downstream alignment audit receipt transform rows must be 0');
}

function assertRowOverlapBoundaryReceipt(value) {
  if (value.artifact_type !== 'agent2_row_overlap_boundary_receipt') throw new Error('row-overlap boundary receipt artifact_type mismatch');
  if (value.row_overlap_totals.audited_rows !== 500) throw new Error('row-overlap boundary receipt audited rows mismatch');
  if (value.boundary_question_counts.total_boundary_question_records !== 8) throw new Error('row-overlap boundary receipt question count mismatch');
  if (value.delivery_state.delivered_to_agent6_now !== 0) throw new Error('row-overlap boundary receipt must not be delivered to Agent6');
  if (value.zero_output_counts.allowed_transform_rows_now !== 0) throw new Error('row-overlap boundary receipt transform rows must be 0');
}

function assertAgent1BoundaryQuestionPacketReceipt(value) {
  if (value.artifact_type !== 'agent2_agent1_boundary_question_packet_receipt') throw new Error('Agent1 boundary-question packet receipt artifact_type mismatch');
  if (value.boundary_question_counts.total_boundary_question_rows !== 6) throw new Error('Agent1 boundary-question packet receipt row count mismatch');
  if (value.delivery_state.delivered_to_agent6_now !== 0) throw new Error('Agent1 boundary-question packet receipt must not be delivered to Agent6');
  if (value.zero_output_counts.allowed_transform_rows_now !== 0) throw new Error('Agent1 boundary-question packet receipt transform rows must be 0');
}

function assertKleinNcLanePreservationReceipt(value) {
  if (value.artifact_type !== 'agent2_klein_nc_lane_preservation_receipt') throw new Error('Klein NC lane preservation receipt artifact_type mismatch');
  if (value.source_family.rows !== 214) throw new Error('Klein NC lane preservation receipt rows mismatch');
  if (value.source_family.commercial_export_allowed !== false) throw new Error('Klein NC lane preservation receipt commercial export must be false');
  if (value.zero_output_counts.allowed_transform_rows_now !== 0) throw new Error('Klein NC lane preservation receipt transform rows must be 0');
}

function assertTokenSourceAggregateGateProofReceipt(value) {
  if (value.artifact_type !== 'agent2_token_source_aggregate_gate_proof_consumption_receipt') throw new Error('token-source aggregate gate-proof receipt artifact_type mismatch');
  if (value.counts.aggregate_edge_rows !== 1951013) throw new Error('token-source aggregate gate-proof edge rows mismatch');
  if (value.counts.candidate_rows !== 0) throw new Error('token-source aggregate gate-proof candidate rows must be 0');
}

function assertTokenSourceAggregateReceipt(value) {
  if (value.artifact_type !== 'agent2_token_source_aggregate_consumption_receipt') throw new Error('token-source aggregate receipt artifact_type mismatch');
  if (value.counts.aggregate_edge_rows !== 1951013) throw new Error('token-source aggregate edge rows mismatch');
  if (value.counts.candidate_rows !== 0) throw new Error('token-source aggregate candidate rows must be 0');
}

function assertAgent4GateProofReceipt(value) {
  if (value.artifact_type !== 'agent2_agent4_gate_proof_consumption_receipt') throw new Error('Agent4 gate proof receipt artifact_type mismatch');
  if (value.counts.morphology_planning_approved_rows !== 78) throw new Error('Agent4 gate proof receipt planning rows mismatch');
  if (value.counts.allowed_candidate_use_rows_now !== 0) throw new Error('Agent4 gate proof receipt candidate-use rows must be 0');
}

function assertAgent10PreflightHandoff(value) {
  if (value.artifact_type !== 'agent2_agent10_candidate_use_preflight_handoff') throw new Error('Agent10 preflight handoff artifact_type mismatch');
  if (value.exact_subset_for_future_question.row_count !== 78) throw new Error('Agent10 preflight row count mismatch');
  if (value.request_to_agent10.current_agent2_candidate_use_allowed !== false) throw new Error('Agent10 preflight candidate-use must be false');
}

function assertCandidateUseBlocker(value) {
  if (value.artifact_type !== 'agent2_morphology_planning_candidate_use_blocker') throw new Error('candidate-use blocker artifact_type mismatch');
  if (value.counts.morphology_planning_rows !== 78) throw new Error('candidate-use blocker planning rows mismatch');
  if (value.counts.allowed_candidate_use_rows_now !== 0) throw new Error('candidate-use rows must be 0');
  if (value.boundary_validation_state.delivered_to_agent6_now !== false) throw new Error('Agent 6 boundary must not be delivered');
}

function assertMorphologyMatrix(value) {
  if (value.artifact_type !== 'agent2_old_dictionary_commercial_clean_morphology_relation_matrix') throw new Error('morphology matrix artifact_type mismatch');
  if (value.counts.unique_preview_rows !== 297) throw new Error('morphology matrix row count mismatch');
  if (value.counts.agent2_morphology_planning_approved_rows !== 78) throw new Error('morphology planning approved count mismatch');
  if (value.counts.allowed_transform_rows_now !== 0) throw new Error('morphology matrix transform rows must be 0');
}

function assertCommercialCleanBoundaryReceipt(value) {
  if (value.artifact_type !== 'agent2_commercial_clean_boundary_held_packet_consumption_receipt') throw new Error('commercial-clean boundary receipt artifact_type mismatch');
  if (value.commercial_clean_scope.source_family_count !== 3) throw new Error('commercial-clean boundary source family count mismatch');
  if (value.commercial_clean_scope.transform_allowed_now !== false) throw new Error('commercial-clean transform must remain blocked');
  if (!value.current_blockers.includes('missing_approved_morphology_relation_for_definition_lemma_reader_hint_transform')) throw new Error('commercial-clean morphology blocker missing');
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeState(relativePath, receipt, commercialCleanBoundaryReceipt, morphologyMatrix, candidateUseBlocker, agent10PreflightHandoff, agent4GateProofReceipt, tokenSourceAggregateReceipt, orot205Receipt, tokenSourceAggregateGateProofReceipt, orot205GateProofReceipt, stateIntegrityRollup, tokenSourceNestedGateProofReceipt, morphologyCandidateUsePackage, agent10MorphologyCandidateUseHandoffReceipt, agent10MorphologyCandidateUsePackageConsumptionReceipt, exactRowSubsetManifestAgent6WaitReceipt, sourceFamilyMembershipOverlapReceipt, downstreamAlignmentAuditReceipt, rowOverlapBoundaryReceipt, agent1BoundaryQuestionPacketReceipt, kleinNcLanePreservationReceipt) {
  const exactBlockers = uniqueStrings([
    ...receipt.current_exact_blockers,
    ...commercialCleanBoundaryReceipt.current_blockers,
    ...morphologyMatrix.exact_blockers_preserved,
    candidateUseBlocker.exact_blocker,
    agent10PreflightHandoff.exact_blocker_until_agent10_agent6_packet_exists,
    ...agent4GateProofReceipt.blockers_preserved,
    ...tokenSourceAggregateReceipt.blockers_preserved,
    ...orot205Receipt.blockers_preserved,
    ...tokenSourceAggregateGateProofReceipt.blockers_preserved,
    ...orot205GateProofReceipt.blockers_preserved,
    ...stateIntegrityRollup.unique_blockers.filter((blocker) => !blocker.startsWith('node ')),
    ...tokenSourceNestedGateProofReceipt.blockers_preserved,
    ...morphologyCandidateUsePackage.blockers_preserved,
    agent10MorphologyCandidateUseHandoffReceipt.exact_blocker,
    agent10MorphologyCandidateUsePackageConsumptionReceipt.exact_blocker,
    exactRowSubsetManifestAgent6WaitReceipt.exact_blocker,
    ...sourceFamilyMembershipOverlapReceipt.exact_blockers,
    ...downstreamAlignmentAuditReceipt.exact_blockers,
    ...rowOverlapBoundaryReceipt.exact_blockers,
    ...agent1BoundaryQuestionPacketReceipt.exact_blockers,
    ...kleinNcLanePreservationReceipt.exact_blockers,
  ]);
  const lines = [
    '# Agent 2 State',
    '',
    'Updated: 2026-06-05',
    '',
    '## Current Lane',
    '',
    '- Owner lane: definition/lemma/reader-hint pipeline artifacts from Agent 1 classified lanes.',
    '- Active mode: `WEEKLY_LEXICON_EXPANSION_GOAL_MODE / source-lane separated lexicon expansion`.',
    '- Current target: `old-dictionary-excluded-row-license-lane-reaudit`.',
    '- Current Agent 1 thread: `019e975d-dc9f-7020-a7c8-885d083a837e`; old Agent 1 is archived/do-not-use for current capacity.',
    '- Boundary: no Definition authority, answer acceptance, source/license/legal acceptance, accepted gloss/text, public/runtime mutation, NC commercial authorization, or release action.',
    '',
    '## Current Validated Packet Chain',
    '',
    `- Queue-state receipt: \`${receiptPath}\`.`,
    `- Consumption prep: \`${receipt.validated_artifacts.consumption_prep}\`.`,
    `- Transform-readiness matrix: \`${receipt.validated_artifacts.readiness_matrix}\`.`,
    `- Agent10 readiness consumption: \`${receipt.validated_artifacts.agent10_consumption}\`.`,
    `- Queue surface: \`${receipt.validated_artifacts.queue}\`.`,
    '- Usage-link/sample non-overlap resolution: `reports/agent2-usage-link-sample-nonoverlap-resolution-receipt-2026-06-05.json`.',
    `- Commercial-clean held boundary receipt: \`${commercialCleanBoundaryReceiptPath}\`.`,
    `- Commercial-clean held upstream packet: \`${commercialCleanBoundaryReceipt.consumed_packet}\`.`,
    `- Commercial-clean morphology relation matrix: \`${morphologyMatrixPath}\`.`,
    `- Commercial-clean morphology workset input: \`${morphologyMatrix.inputs.agent10_workset}\`.`,
    `- Morphology planning candidate-use blocker: \`${candidateUseBlockerPath}\`.`,
    `- Agent10 candidate-use preflight handoff: \`${agent10PreflightHandoffPath}\`.`,
    `- Agent4 gate-proof consumption receipt: \`${agent4GateProofReceiptPath}\`.`,
    `- Token-source aggregate consumption receipt: \`${tokenSourceAggregateReceiptPath}\`.`,
    `- Orot 205 commercial-clean gate consumption receipt: \`${orot205ReceiptPath}\`.`,
    `- Token-source aggregate gate-proof consumption receipt: \`${tokenSourceAggregateGateProofReceiptPath}\`.`,
    `- Orot 205 gate-proof consumption receipt: \`${orot205GateProofReceiptPath}\`.`,
    `- State integrity rollup: \`${stateIntegrityRollupPath}\`.`,
    `- Token-source nested gate-proof consumption receipt: \`${tokenSourceNestedGateProofReceiptPath}\`.`,
    `- Old-dictionary morphology candidate-use package: \`${morphologyCandidateUsePackagePath}\`.`,
    `- Agent10 morphology candidate-use handoff consumption receipt: \`${agent10MorphologyCandidateUseHandoffReceiptPath}\`.`,
    `- Agent10 morphology candidate-use package consumption receipt: \`${agent10MorphologyCandidateUsePackageConsumptionReceiptPath}\`.`,
    `- Exact row-subset manifest Agent6 wait receipt: \`${exactRowSubsetManifestAgent6WaitReceiptPath}\`.`,
    `- Source-family membership overlap receipt: \`${sourceFamilyMembershipOverlapReceiptPath}\`.`,
    `- Downstream alignment audit receipt: \`${downstreamAlignmentAuditReceiptPath}\`.`,
    `- Row-overlap boundary receipt: \`${rowOverlapBoundaryReceiptPath}\`.`,
    `- Agent1 boundary-question packet receipt: \`${agent1BoundaryQuestionPacketReceiptPath}\`.`,
    `- Klein NC lane preservation receipt: \`${kleinNcLanePreservationReceiptPath}\`.`,
    '',
    '## Counts',
    '',
    `- Source-family rows: ${receipt.counts.source_family_rows}.`,
    `- Commercial-clean source families: ${receipt.counts.commercial_clean_candidate_source_families}.`,
    `- Noncommercial educational source families: ${receipt.counts.noncommercial_educational_candidate_source_families}.`,
    `- Metadata/link-only source families: ${receipt.counts.metadata_or_link_only_source_families}.`,
    `- Blocked/review source families: ${receipt.counts.blocked_or_needs_review_source_families}.`,
    '- Allowed transform rows now: 0.',
    '- Definition candidate rows now: 0.',
    '- Lemma candidate rows now: 0.',
    '- Reader-hint candidate rows now: 0.',
    '- Candidate text rows now: 0.',
    '- Answer-eligible rows now: 0.',
    '- Public emit rows now: 0.',
    `- Commercial-clean held boundary source-family rows: ${commercialCleanBoundaryReceipt.commercial_clean_scope.source_family_count}.`,
    `- Commercial-clean held boundary source rows: ${commercialCleanBoundaryReceipt.commercial_clean_scope.row_count}.`,
    `- Commercial-clean held boundary occurrences: ${commercialCleanBoundaryReceipt.commercial_clean_scope.occurrence_count}.`,
    `- Commercial-clean morphology matrix rows: ${morphologyMatrix.counts.unique_preview_rows}.`,
    `- Commercial-clean morphology planning-approved rows: ${morphologyMatrix.counts.agent2_morphology_planning_approved_rows}.`,
    `- Commercial-clean morphology blocked rows: ${morphologyMatrix.counts.agent2_morphology_blocked_rows}.`,
    `- Morphology planning rows blocked from candidate use: ${candidateUseBlocker.counts.morphology_planning_rows}.`,
    `- Allowed candidate-use rows now: ${candidateUseBlocker.counts.allowed_candidate_use_rows_now}.`,
    `- Agent10 preflight exact future-question rows: ${agent10PreflightHandoff.exact_subset_for_future_question.row_count}.`,
    `- Agent4 gate proofs consumed: ${agent4GateProofReceipt.consumed_gate_proofs.length}.`,
    `- Token-source aggregate edge rows: ${tokenSourceAggregateReceipt.counts.aggregate_edge_rows}.`,
    `- Token-source aggregate candidate rows: ${tokenSourceAggregateReceipt.counts.candidate_rows}.`,
    `- Token-source aggregate gate-proof commands passed: ${tokenSourceAggregateGateProofReceipt.consumed_gate_proof.commands_passed}.`,
    `- Orot 205 commercial-clean planning rows: ${orot205Receipt.counts.rows}.`,
    `- Orot 205 exact-after-mark-strip planning rows: ${orot205Receipt.counts.exact_after_mark_strip_rows}.`,
    `- Orot 205 gate-proof commands passed: ${orot205GateProofReceipt.consumed_gate_proof.commands_passed}.`,
    `- State integrity rollup artifacts checked: ${stateIntegrityRollup.counts.artifacts_checked}.`,
    `- State integrity rollup unique blockers: ${stateIntegrityRollup.counts.unique_blockers}.`,
    `- Token-source nested gate-proof commands passed: ${tokenSourceNestedGateProofReceipt.consumed_gate_proof.commands_passed}.`,
    `- Old-dictionary morphology candidate-use package rows: ${morphologyCandidateUsePackage.counts.package_rows}.`,
    `- Old-dictionary morphology candidate-use package occurrences: ${morphologyCandidateUsePackage.counts.package_occurrences}.`,
    `- Old-dictionary morphology candidate-use package text/output rows: ${morphologyCandidateUsePackage.counts.candidate_text_rows}.`,
    `- Agent10 morphology candidate-use handoff consumed rows: ${agent10MorphologyCandidateUseHandoffReceipt.counts.package_rows}.`,
    `- Agent10 morphology candidate-use handoff consumed occurrences: ${agent10MorphologyCandidateUseHandoffReceipt.counts.package_occurrences}.`,
    `- Agent10 morphology candidate-use handoff text/output rows: ${agent10MorphologyCandidateUseHandoffReceipt.counts.candidate_text_rows}.`,
    `- Agent10 morphology candidate-use package consumption rows: ${agent10MorphologyCandidateUsePackageConsumptionReceipt.counts.package_rows}.`,
    `- Agent10 morphology candidate-use package consumption occurrences: ${agent10MorphologyCandidateUsePackageConsumptionReceipt.counts.package_occurrences}.`,
    `- Agent10 morphology candidate-use package consumption text/output rows: ${agent10MorphologyCandidateUsePackageConsumptionReceipt.counts.candidate_text_rows}.`,
    `- Agent10 morphology candidate-use package Agent2 wait remains: ${agent10MorphologyCandidateUsePackageConsumptionReceipt.closed_wait.agent2_wait_remains}.`,
    `- Exact row-subset manifest rows: ${exactRowSubsetManifestAgent6WaitReceipt.manifest_counts.audited_rows}.`,
    `- Exact row-subset manifest subsets: ${exactRowSubsetManifestAgent6WaitReceipt.manifest_counts.subset_count}.`,
    `- Exact row-subset manifest Agent6 verdict present now: ${exactRowSubsetManifestAgent6WaitReceipt.delivery_state.agent6_verdict_present_now}.`,
    `- Exact row-subset manifest transform/text/output rows: ${exactRowSubsetManifestAgent6WaitReceipt.zero_output_counts.allowed_transform_rows_now}.`,
    `- Source-family membership unique rows: ${sourceFamilyMembershipOverlapReceipt.membership_counts.unique_preview_rows}.`,
    `- Source-family membership nonexclusive rows: ${sourceFamilyMembershipOverlapReceipt.membership_counts.source_family_membership_rows_nonexclusive}.`,
    `- Source-family overlap pairwise intersections: ${sourceFamilyMembershipOverlapReceipt.overlap_counts.pairwise_intersection_count}.`,
    `- Source-family overlap transform/text/output rows: ${sourceFamilyMembershipOverlapReceipt.zero_output_counts.allowed_transform_rows_now}.`,
    `- Downstream alignment source-family rows: ${downstreamAlignmentAuditReceipt.downstream_alignment_counts.agent2_readiness_source_family_rows}.`,
    `- Downstream alignment exact blockers: ${downstreamAlignmentAuditReceipt.exact_blockers.length}.`,
    `- Downstream alignment transform/text/output rows: ${downstreamAlignmentAuditReceipt.zero_output_counts.allowed_transform_rows_now}.`,
    `- Row-overlap audited rows: ${rowOverlapBoundaryReceipt.row_overlap_totals.audited_rows}.`,
    `- Row-overlap boundary questions: ${rowOverlapBoundaryReceipt.boundary_question_counts.total_boundary_question_records}.`,
    `- Row-overlap Agent6 delivery now: ${rowOverlapBoundaryReceipt.delivery_state.delivered_to_agent6_now}.`,
    `- Row-overlap transform/text/output rows: ${rowOverlapBoundaryReceipt.zero_output_counts.allowed_transform_rows_now}.`,
    `- Agent1 boundary-question rows: ${agent1BoundaryQuestionPacketReceipt.boundary_question_counts.total_boundary_question_rows}.`,
    `- Agent1 boundary-question Agent6 delivery now: ${agent1BoundaryQuestionPacketReceipt.delivery_state.delivered_to_agent6_now}.`,
    `- Agent1 boundary-question transform/text/output rows: ${agent1BoundaryQuestionPacketReceipt.zero_output_counts.allowed_transform_rows_now}.`,
    `- Klein NC lane preservation rows: ${kleinNcLanePreservationReceipt.source_family.rows}.`,
    `- Klein NC lane preservation occurrences: ${kleinNcLanePreservationReceipt.source_family.occurrences}.`,
    `- Klein NC commercial export allowed: ${kleinNcLanePreservationReceipt.source_family.commercial_export_allowed}.`,
    `- Klein NC transform/text/output rows: ${kleinNcLanePreservationReceipt.zero_output_counts.allowed_transform_rows_now}.`,
    '',
    '## Lane Preservation',
    '',
    `- Commercial-clean and NC separated: \`${receipt.lane_preservation.commercial_clean_and_nc_separated}\`.`,
    `- NC row subset: \`${receipt.lane_preservation.nc_row_subset_id}\`.`,
    `- NC flags: \`derived_from_nc=${receipt.lane_preservation.nc_derived_from_nc}\`, \`commercial_export_allowed=${receipt.lane_preservation.nc_commercial_export_allowed}\`, \`attribution_required=${receipt.lane_preservation.nc_attribution_required}\`.`,
    `- Blocked row subset: \`${receipt.lane_preservation.blocked_row_subset_id}\`.`,
    `- Unclassified rows consumed as candidate text: ${receipt.lane_preservation.unclassified_rows_consumed_as_candidate_text}.`,
    '',
    '## Current Exact Blockers',
    '',
    ...exactBlockers.map((blocker) => `- \`${blocker}\``),
    '',
    '## Next Safe Work',
    '',
    '- If Agent 6 supplies an exact row/subset boundary plus approved morphology relation for a commercial-clean subset, produce only a nonpublic definition/lemma/reader-hint input package for that exact subset.',
    '- If Agent 6 supplies an exact NC boundary for Klein, keep it in a separate noncommercial educational partition with no commercial export authorization.',
    '- If Agent 1 supplies independent source/license/custody basis for BDB Augmented Strong, refresh classification before any Agent 2 transform planning.',
    '- Usage-link/sample non-overlap is resolved as a separate nonpublic joined-sample planning row; do not mutate the live sample from that receipt.',
    '- Commercial-clean held boundary packet may be carried only as nonpublic transform-readiness planning evidence.',
    '- Commercial-clean morphology relation matrix may be carried only as nonpublic planning evidence; it is not a candidate-use package.',
    '- Morphology-planning rows remain blocked from candidate use until an exact Agent 6 row/subset boundary is delivered.',
    '- Agent10 preflight handoff is not an Agent6 delivery and is not a candidate-use package.',
    '- Agent4 gate proofs are validator/prereq evidence only, not QA, source, license, Definition, answer, public/runtime, accepted-text, candidate-use, export, or release acceptance.',
    '- Token-source aggregate is nonpublic metadata evidence only and has no candidate-use packet.',
    '- Orot 205 commercial-clean subset is planning/prereq evidence only; planning-only boundary remains.',
    '- Token-source aggregate gate proof is validator/prereq evidence only and does not authorize candidate use.',
    '- Orot 205 gate proof is validator/prereq evidence only and does not authorize candidate use.',
    '- State integrity rollup is a blocker/state audit only and does not authorize transform output.',
    '- Token-source nested gate proof is validator/prereq evidence only and excludes the stale pre-correction rollup proof.',
    '- Old-dictionary morphology candidate-use package is nonpublic planning input only; any text storage, transform output, export, answer, route, public/runtime, accepted text, commercial export, or release step must return to Agent 6 first.',
    '- Agent10 morphology candidate-use handoff is consumed as package-delivery closure only; it does not authorize candidate text, definition/lemma/reader-hint content, answer, route, public/runtime, accepted text, commercial export, or release action.',
    '- Agent10 morphology candidate-use package consumption closes the prior Agent2 wait for this package only; it does not authorize candidate text, definition/lemma/reader-hint content, answer, route, public/runtime, accepted text, commercial export, or release action.',
    '- Exact row-subset manifest is nonpublic lane/subset planning evidence only; Agent2 transform, candidate text, definition/lemma/reader-hint content, answer, route, public/runtime, export, accepted text, commercial export, and release remain blocked until Agent6 returns the exact manifest verdict.',
    '- Source-family membership and overlap evidence is nonpublic planning evidence only; nonexclusive counts and commercial/NC/blocked overlaps require exact Agent6 source-family selection before any Agent2 transform or text/content/export use.',
    '- Downstream alignment audit is nonpublic evidence that prior Agent2/Agent10 consumption remained zero-output and non-acceptance; it does not authorize new transform or candidate-use behavior.',
    '- Row-overlap boundary questions are nonpublic planning questions not delivered to Agent6; Agent2 transform, candidate text, definition/lemma/reader-hint content, answer, route, public/runtime, accepted text, export, commercial export, and release remain blocked.',
    '- Agent1 boundary-question packet is nonpublic planning evidence not delivered to Agent6; Agent2 transform, candidate text, definition/lemma/reader-hint content, answer, route, public/runtime, accepted text, export, commercial export, and release remain blocked.',
    '- Klein NC lane preservation is separate noncommercial educational evidence only; preserve derived_from_nc=true, attribution_required=true, commercial_export_allowed=false, and no commercial-clean contamination.',
    '- If no changed input exists, return an exact blocker artifact instead of candidate text.',
    '',
    '## Stop Condition',
    '',
    receipt.stop_condition,
    '',
    '## Non-Acceptance Boundary',
    '',
    ...receipt.non_acceptance_boundary.map((boundary) => `- ${boundary}`),
    '',
    '## Validator Commands',
    '',
    ...receipt.validator_commands.map((command) => `- \`${command}\``),
    '- `node scripts/validate_agent10_old_dictionary_commercial_clean_transform_enablement_boundary_packet.mjs reports/agent10-agent6-ready-old-dictionary-commercial-clean-transform-enablement-boundary-packet-2026-06-05.json`',
    '- `node scripts/validate_agent2_commercial_clean_boundary_held_packet_consumption_receipt.mjs reports/agent2-commercial-clean-boundary-held-packet-consumption-receipt-2026-06-05.json`',
    '- `node scripts/validate_agent10_agent2_old_dictionary_morphology_relation_workset.mjs reports/agent10-agent2-ready-old-dictionary-commercial-clean-morphology-relation-workset-2026-06-05.json`',
    '- `node scripts/validate_agent2_old_dictionary_commercial_clean_morphology_relation_matrix.mjs reports/agent2-old-dictionary-commercial-clean-morphology-relation-matrix-2026-06-05.json`',
    '- `node scripts/validate_agent2_morphology_planning_candidate_use_blocker.mjs reports/agent2-morphology-planning-candidate-use-blocker-2026-06-05.json`',
    '- `node scripts/validate_agent2_agent10_candidate_use_preflight_handoff.mjs reports/agent2-agent10-candidate-use-preflight-handoff-2026-06-05.json`',
    '- `node scripts/validate_agent2_agent4_gate_proof_consumption_receipt.mjs reports/agent2-agent4-gate-proof-consumption-receipt-2026-06-05.json`',
    '- `node scripts/validate_agent2_token_source_aggregate_consumption_receipt.mjs reports/agent2-token-source-aggregate-consumption-receipt-2026-06-05.json`',
    '- `node scripts/validate_agent2_orot_205_commercial_clean_gate_consumption_receipt.mjs reports/agent2-orot-205-commercial-clean-gate-consumption-receipt-2026-06-05.json`',
    '- `node scripts/validate_agent2_token_source_aggregate_gate_proof_consumption_receipt.mjs reports/agent2-token-source-aggregate-gate-proof-consumption-receipt-2026-06-05.json`',
    '- `node scripts/validate_agent2_orot_205_gate_proof_consumption_receipt.mjs reports/agent2-orot-205-gate-proof-consumption-receipt-2026-06-05.json`',
    '- `node scripts/validate_agent2_state_integrity_rollup.mjs reports/agent2-state-integrity-rollup-2026-06-05.json`',
    '- `node scripts/validate_agent2_token_source_nested_gate_proof_consumption_receipt.mjs reports/agent2-token-source-nested-gate-proof-consumption-receipt-2026-06-05.json`',
    '- `node scripts/validate_agent2_old_dictionary_morphology_candidate_use_package.mjs reports/agent2-old-dictionary-morphology-candidate-use-package-2026-06-05.json`',
    '- `node scripts/validate_agent2_agent10_morphology_candidate_use_handoff_consumption_receipt.mjs reports/agent2-agent10-morphology-candidate-use-handoff-consumption-receipt-2026-06-05.json`',
    '- `node scripts/validate_agent2_agent10_morphology_candidate_use_package_consumption_receipt.mjs reports/agent2-agent10-morphology-candidate-use-package-consumption-receipt-2026-06-05.json`',
    '- `node scripts/validate_agent2_exact_row_subset_manifest_agent6_wait_receipt.mjs reports/agent2-exact-row-subset-manifest-agent6-wait-receipt-2026-06-05.json`',
    '- `node scripts/validate_agent2_source_family_membership_overlap_receipt.mjs reports/agent2-source-family-membership-overlap-receipt-2026-06-05.json`',
    '- `node scripts/validate_agent2_downstream_alignment_audit_receipt.mjs reports/agent2-downstream-alignment-audit-receipt-2026-06-05.json`',
    '- `node scripts/validate_agent2_row_overlap_boundary_receipt.mjs reports/agent2-row-overlap-boundary-receipt-2026-06-05.json`',
    '- `node scripts/validate_agent2_agent1_boundary_question_packet_receipt.mjs reports/agent2-agent1-boundary-question-packet-receipt-2026-06-05.json`',
    '- `node scripts/validate_agent2_klein_nc_lane_preservation_receipt.mjs reports/agent2-klein-nc-lane-preservation-receipt-2026-06-05.json`',
    '- `node scripts/validate_agent2_state.mjs reports/agent2-state.md`',
    '',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
}

function uniqueStrings(values) {
  return [...new Set(values.filter(Boolean))].sort();
}
