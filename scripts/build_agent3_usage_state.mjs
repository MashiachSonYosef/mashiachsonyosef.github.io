#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  agentRegistry: 'data/control/agent_registry.json',
  goalBoard: 'data/control/agent_goal_board.json',
  queueReadyPacket: 'data/definitions/definition-workbench-usage-queue-ready-packet.json',
  usageAgent6Packet: 'data/definitions/definition-workbench-usage-agent6-packet.json',
  usageOccurrenceLinks: 'data/definitions/definition-workbench-usage-occurrence-links.json',
  usageRouteResolution: 'data/definitions/definition-workbench-usage-route-resolution.json',
  usageCrossmatchNeighbors: 'data/definitions/definition-workbench-usage-crossmatch-neighbors.json',
  usageSourceRefBuckets: 'data/definitions/definition-workbench-usage-source-ref-buckets.json',
  usageWorkBuckets: 'data/definitions/definition-workbench-usage-work-buckets.json',
  usageProvenanceBuckets: 'data/definitions/definition-workbench-usage-provenance-buckets.json',
  usageOccurrenceDetailIndex: 'data/definitions/definition-workbench-usage-occurrence-detail-index.json',
  usageFacetIndex: 'data/definitions/definition-workbench-usage-facet-index.json',
  usageContextTokenIndex: 'data/definitions/definition-workbench-usage-context-token-index.json',
  usageContextTokenLinks: 'data/definitions/definition-workbench-usage-context-token-links.json',
  usageContextTokenOccurrenceIndex: 'data/definitions/definition-workbench-usage-context-token-occurrence-index.json',
  usageOccurrenceContextProfile: 'data/definitions/definition-workbench-usage-occurrence-context-profile.json',
  usageRouteDiversityProbe: 'data/definitions/definition-workbench-usage-route-diversity-probe.json',
  usageRouteConcentrationGuardrail: 'data/definitions/definition-workbench-usage-route-concentration-guardrail.json',
  usageRoutePointerAudit: 'data/definitions/definition-workbench-usage-route-pointer-audit.json',
  usageSampleGapAudit: 'data/definitions/definition-workbench-usage-sample-gap-audit.json',
  usageConsumerManifest: 'data/definitions/definition-workbench-usage-consumer-manifest.json',
  usagePlanningPacket: 'data/definitions/definition-workbench-usage-planning-packet.json',
  usageAnchorAudit: 'data/definitions/definition-workbench-usage-anchor-audit.json',
  usageOccurrenceSupportPacket: 'data/definitions/definition-workbench-usage-occurrence-support-packet.json',
  usageConcordanceNavigationPacket: 'data/definitions/definition-workbench-usage-concordance-navigation-packet.json',
  usageFreshnessImpactPacket: 'data/definitions/definition-workbench-usage-freshness-impact-packet.json',
  usageSourceFreshnessRefresh: 'reports/agent3-definition-workbench-usage-source-freshness-refresh-2026-06-02.json',
  usageFreshnessFollowup: 'reports/agent3-definition-workbench-usage-freshness-followup-2026-06-02.json',
  crossmatchInventoryPacket: 'reports/agent3-crossmatch-inventory-packet-2026-06-05.json',
  agent10CrossmatchDirectStateReconciliation:
    'reports/agent3-agent10-crossmatch-direct-state-reconciliation-2026-06-05.json',
  postCrossmatchReconciliationWakeAudit:
    'reports/agent3-post-crossmatch-reconciliation-wake-audit-2026-06-05.json',
  orotRouteSelectionCrossmatchMatrix:
    'reports/agent3-orot-route-selection-crossmatch-matrix-2026-06-05.json',
  postRouteSelectionWakeAudit:
    'reports/agent3-post-route-selection-wake-audit-2026-06-05.json',
  oldDictionaryRowOverlapLinkageMatrix:
    'reports/agent3-old-dictionary-row-overlap-linkage-matrix-2026-06-05.json',
  oldDictionaryCandidateUseContinuityCrossmatch:
    'reports/agent3-old-dictionary-candidate-use-continuity-crossmatch-2026-06-05.json',
  oldDictionaryCandidateUseSourceFamilyBlockerMatrix:
    'reports/agent3-old-dictionary-candidate-use-source-family-blocker-matrix-2026-06-05.json',
  oldDictionaryCandidateUseSourceRidContinuityCrossmatch:
    'reports/agent3-old-dictionary-candidate-use-source-rid-continuity-crossmatch-2026-06-05.json',
  oldDictionaryCandidateUseExactSubsetCrossmatch:
    'reports/agent3-old-dictionary-candidate-use-exact-subset-crossmatch-2026-06-05.json',
  oldDictionaryCandidateUseBoundaryTriageNavigation:
    'reports/agent3-old-dictionary-candidate-use-boundary-triage-navigation-2026-06-05.json',
  oldDictionaryPureCommercialCandidateUseBoundaryWorkset:
    'reports/agent3-old-dictionary-pure-commercial-candidate-use-boundary-workset-2026-06-05.json',
  oldDictionaryOverlapCandidateUseBoundaryWorkset:
    'reports/agent3-old-dictionary-overlap-candidate-use-boundary-workset-2026-06-06.json',
  oldDictionaryCandidateUseSplitClosureCrossmatch:
    'reports/agent3-old-dictionary-candidate-use-split-closure-crossmatch-2026-06-06.json',
  oldDictionaryCandidateUseHandoffIndex:
    'reports/agent3-old-dictionary-candidate-use-handoff-index-2026-06-06.json',
  oldDictionaryCandidateUseRowLineageMatrix:
    'reports/agent3-old-dictionary-candidate-use-row-lineage-matrix-2026-06-06.json',
  oldDictionaryCandidateUseBoundaryChainCrossmatch:
    'reports/agent3-old-dictionary-candidate-use-boundary-chain-crossmatch-2026-06-06.json',
  oldDictionaryCandidateUseSourceCitationDependencyCrossmatch:
    'reports/agent3-old-dictionary-candidate-use-source-citation-dependency-crossmatch-2026-06-06.json',
  oldDictionaryCandidateUseAgent1RouteRecheckCrossmatch:
    'reports/agent3-old-dictionary-candidate-use-agent1-route-recheck-crossmatch-2026-06-06.json',
  oldDictionaryCandidateUseGateProofCoverageCrossmatch:
    'reports/agent3-old-dictionary-candidate-use-gate-proof-coverage-crossmatch-2026-06-06.json',
  oldDictionaryCandidateUseCurrentBlockerIndex:
    'reports/agent3-old-dictionary-candidate-use-current-blocker-index-2026-06-06.json',
  oldDictionaryCandidateUseRowBlockerMatrix:
    'reports/agent3-old-dictionary-candidate-use-row-blocker-matrix-2026-06-06.json',
  oldDictionaryCandidateUseSourceRidBlockerMatrix:
    'reports/agent3-old-dictionary-candidate-use-source-rid-blocker-matrix-2026-06-06.json',
  oldDictionaryCandidateUseSourceCitationEnrichmentWorklist:
    'reports/agent3-old-dictionary-candidate-use-source-citation-enrichment-worklist-2026-06-06.json',
  oldDictionaryCandidateUseSourceCitationBatchMatrix:
    'reports/agent3-old-dictionary-candidate-use-source-citation-batch-matrix-2026-06-06.json',
  oldDictionaryCandidateUseSourceCitationPrefixMatrix:
    'reports/agent3-old-dictionary-candidate-use-source-citation-prefix-matrix-2026-06-06.json',
  oldDictionaryCandidateUseAgent6SourceFamilyBoundaryPrereqMatrix:
    'reports/agent3-old-dictionary-candidate-use-agent6-source-family-boundary-prereq-matrix-2026-06-06.json',
  oldDictionaryCandidateUseDirectSourceCitationPrereqMatrix:
    'reports/agent3-old-dictionary-candidate-use-direct-source-citation-prereq-matrix-2026-06-06.json',
  oldDictionaryCandidateUseSourceFamilySelectionExclusionInventory:
    'reports/agent3-old-dictionary-candidate-use-source-family-selection-exclusion-inventory-2026-06-06.json',
  oldDictionaryCandidateUseUnpacketizedSourceFamilySelectionWorkset:
    'reports/agent3-old-dictionary-candidate-use-unpacketized-source-family-selection-workset-2026-06-06.json',
  oldDictionaryCandidateUseSourceFamilySelectionBatchPlan:
    'reports/agent3-old-dictionary-candidate-use-source-family-selection-batch-plan-2026-06-06.json',
  oldDictionaryCandidateUseSourceFamilySelectionQueueBatchCrossmatch:
    'reports/agent3-old-dictionary-candidate-use-source-family-selection-queue-batch-crossmatch-2026-06-06.json',
  oldDictionaryCandidateUseCrossBatchQueueGuard:
    'reports/agent3-old-dictionary-candidate-use-cross-batch-queue-guard-2026-06-06.json',
  oldDictionaryCandidateUseSingleBatchQueueWorkset:
    'reports/agent3-old-dictionary-candidate-use-single-batch-queue-workset-2026-06-06.json',
  oldDictionaryCandidateUseQueuePartitionClosure:
    'reports/agent3-old-dictionary-candidate-use-queue-partition-closure-2026-06-06.json',
  oldDictionaryCandidateUsePartitionOverlapDiagnosticIndex:
    'reports/agent3-old-dictionary-candidate-use-partition-overlap-diagnostic-index-2026-06-06.json',
  oldDictionaryCandidateUseQueueSourceDedupeKeyIndex:
    'reports/agent3-old-dictionary-candidate-use-queue-source-dedupe-key-index-2026-06-06.json',
  oldDictionaryCandidateUseSourceRidDedupeCoverageCrossmatch:
    'reports/agent3-old-dictionary-candidate-use-source-rid-dedupe-coverage-crossmatch-2026-06-06.json',
  oldDictionaryCandidateUseQueueSourceSubchainHandoffIndex:
    'reports/agent3-old-dictionary-candidate-use-queue-source-subchain-handoff-index-2026-06-06.json',
  oldDictionaryCandidateUseQueueSourceBoundaryBlockerMatrix:
    'reports/agent3-old-dictionary-candidate-use-queue-source-boundary-blocker-matrix-2026-06-06.json',
  oldDictionaryCandidateUseQueueSourceCandidateRowBridge:
    'reports/agent3-old-dictionary-candidate-use-queue-source-candidate-row-bridge-2026-06-06.json',
  oldDictionaryCandidateUseQueueSourceBridgeGapWorkset:
    'reports/agent3-old-dictionary-candidate-use-queue-source-bridge-gap-workset-2026-06-06.json',
  oldDictionaryCandidateUseBridgeGapSourceRidBlockerCrossmatch:
    'reports/agent3-old-dictionary-candidate-use-bridge-gap-source-rid-blocker-crossmatch-2026-06-06.json',
  oldDictionaryCandidateUseBridgeGapSourceRidPrereqRouteCrossmatch:
    'reports/agent3-old-dictionary-candidate-use-bridge-gap-source-rid-prereq-route-crossmatch-2026-06-06.json',
  oldDictionaryCandidateUseBridgeGapCandidatePrereqClosureMatrix:
    'reports/agent3-old-dictionary-candidate-use-bridge-gap-candidate-prereq-closure-matrix-2026-06-06.json',
  oldDictionaryCandidateUseBridgeGapA07A06RouteOverlay:
    'reports/agent3-old-dictionary-candidate-use-bridge-gap-a07-a06-route-overlay-2026-06-06.json',
  oldDictionaryCandidateUseBridgeGapDownstreamIntakeCoverageCrossmatch:
    'reports/agent3-old-dictionary-candidate-use-bridge-gap-downstream-intake-coverage-crossmatch-2026-06-06.json',
  oldDictionaryCandidateUseBridgeGapA06RowLevelDownstreamBlockerWorkset:
    'reports/agent3-old-dictionary-candidate-use-bridge-gap-a06-row-level-downstream-blocker-workset-2026-06-06.json',
  oldDictionaryCandidateUseBridgeGapDirectSourceCitationBlockerWorkset:
    'reports/agent3-old-dictionary-candidate-use-bridge-gap-direct-source-citation-blocker-workset-2026-06-06.json',
  smokeValidation: '.local-cache/workbench-evidence/smoke-pipeline-validation.json',
  usageConcordance: 'data/workbench-evidence/usage-concordance.json',
  usageHandoffIndex: '.local-cache/workbench-evidence/usage-navigation-handoff-index.json',
  publicHandoffIndex: 'data/workbench-evidence/public-handoff-index.json',
  output: 'reports/agent3-state.json',
  report: 'reports/agent3-state.md',
};

const preservedReportSections = [
  [
    '<!-- agent3_frontier_receipt_custody_boundary_observer_package:start -->',
    '<!-- agent3_frontier_receipt_custody_boundary_observer_package:end -->',
  ],
  [
    '<!-- agent3_deuteronomy_source_license_custody_verdict_continuity:start -->',
    '<!-- agent3_deuteronomy_source_license_custody_verdict_continuity:end -->',
  ],
  [
    '<!-- agent3_deuteronomy_transform_readiness_verdict_continuity:start -->',
    '<!-- agent3_deuteronomy_transform_readiness_verdict_continuity:end -->',
  ],
  [
    '<!-- agent3_post_continuity_release_intake_registration_audit:start -->',
    '<!-- agent3_post_continuity_release_intake_registration_audit:end -->',
  ],
  [
    '<!-- agent3_agent10_post_matrix_registration_consumption:start -->',
    '<!-- agent3_agent10_post_matrix_registration_consumption:end -->',
  ],
  [
    '<!-- agent3_linkage_dedupe_generated_at_drift_audit:start -->',
    '<!-- agent3_linkage_dedupe_generated_at_drift_audit:end -->',
  ],
  [
    '<!-- agent3_spark10_release_intake_return_observer:start -->',
    '<!-- agent3_spark10_release_intake_return_observer:end -->',
  ],
  [
    '<!-- agent3-latest-linkage-pulse-start -->',
    '<!-- agent3-latest-linkage-pulse-end -->',
  ],
  [
    '<!-- agent3_spark3_contract_status_reconciliation:start -->',
    '<!-- agent3_spark3_contract_status_reconciliation:end -->',
  ],
  [
    '<!-- agent3_deuteronomy_spark1_status_lock_observer:start -->',
    '<!-- agent3_deuteronomy_spark1_status_lock_observer:end -->',
  ],
  [
    '<!-- agent3_current_wake_audit:start -->',
    '<!-- agent3_current_wake_audit:end -->',
  ],
  [
    '<!-- agent3_current_control_drift_refresh:start -->',
    '<!-- agent3_current_control_drift_refresh:end -->',
  ],
  [
    '<!-- agent3_crossmatch_inventory_packet:start -->',
    '<!-- agent3_crossmatch_inventory_packet:end -->',
  ],
  [
    '<!-- agent3_agent10_crossmatch_direct_state_reconciliation:start -->',
    '<!-- agent3_agent10_crossmatch_direct_state_reconciliation:end -->',
  ],
];

const options = parseArgs(process.argv.slice(2));
const agentRegistry = readJson(options.agentRegistry);
const goalBoard = readJson(options.goalBoard);
const queueReadyPacket = readJson(options.queueReadyPacket);
const usageAgent6Packet = readJson(options.usageAgent6Packet);
const usageOccurrenceLinks = readJson(options.usageOccurrenceLinks);
const usageRouteResolution = readJson(options.usageRouteResolution);
const usageCrossmatchNeighbors = readJson(options.usageCrossmatchNeighbors);
const usageSourceRefBuckets = readJson(options.usageSourceRefBuckets);
const usageWorkBuckets = readJson(options.usageWorkBuckets);
const usageProvenanceBuckets = readJson(options.usageProvenanceBuckets);
const usageOccurrenceDetailIndex = readJson(options.usageOccurrenceDetailIndex);
const usageFacetIndex = readJson(options.usageFacetIndex);
const usageContextTokenIndex = readJson(options.usageContextTokenIndex);
const usageContextTokenLinks = readJson(options.usageContextTokenLinks);
const usageContextTokenOccurrenceIndex = readJson(options.usageContextTokenOccurrenceIndex);
const usageOccurrenceContextProfile = readJson(options.usageOccurrenceContextProfile);
const usageRouteDiversityProbe = readJson(options.usageRouteDiversityProbe);
const usageRouteConcentrationGuardrail = readJson(options.usageRouteConcentrationGuardrail);
const usageRoutePointerAudit = readJson(options.usageRoutePointerAudit);
const usageSampleGapAudit = readJson(options.usageSampleGapAudit);
const usageConsumerManifest = readJson(options.usageConsumerManifest);
const usagePlanningPacket = readJson(options.usagePlanningPacket);
const usageAnchorAudit = readJson(options.usageAnchorAudit);
const usageOccurrenceSupportPacket = readJson(options.usageOccurrenceSupportPacket);
const usageConcordanceNavigationPacket = readJson(options.usageConcordanceNavigationPacket);
const usageFreshnessImpactPacket = readJson(options.usageFreshnessImpactPacket);
const usageSourceFreshnessRefresh = readJson(options.usageSourceFreshnessRefresh);
const usageFreshnessFollowup = readJson(options.usageFreshnessFollowup);
const crossmatchInventoryPacket = readJson(options.crossmatchInventoryPacket);
const agent10CrossmatchDirectStateReconciliation = readJson(options.agent10CrossmatchDirectStateReconciliation);
const postCrossmatchReconciliationWakeAudit = readJson(options.postCrossmatchReconciliationWakeAudit);
const orotRouteSelectionCrossmatchMatrix = readJson(options.orotRouteSelectionCrossmatchMatrix);
const postRouteSelectionWakeAudit = readJson(options.postRouteSelectionWakeAudit);
const oldDictionaryRowOverlapLinkageMatrix = readJson(options.oldDictionaryRowOverlapLinkageMatrix);
const oldDictionaryCandidateUseContinuityCrossmatch = readJson(options.oldDictionaryCandidateUseContinuityCrossmatch);
const oldDictionaryCandidateUseSourceFamilyBlockerMatrix = readJson(
  options.oldDictionaryCandidateUseSourceFamilyBlockerMatrix,
);
const oldDictionaryCandidateUseSourceRidContinuityCrossmatch = readJson(
  options.oldDictionaryCandidateUseSourceRidContinuityCrossmatch,
);
const oldDictionaryCandidateUseExactSubsetCrossmatch = readJson(
  options.oldDictionaryCandidateUseExactSubsetCrossmatch,
);
const oldDictionaryCandidateUseBoundaryTriageNavigation = readJson(
  options.oldDictionaryCandidateUseBoundaryTriageNavigation,
);
const oldDictionaryPureCommercialCandidateUseBoundaryWorkset = readJson(
  options.oldDictionaryPureCommercialCandidateUseBoundaryWorkset,
);
const oldDictionaryOverlapCandidateUseBoundaryWorkset = readJson(
  options.oldDictionaryOverlapCandidateUseBoundaryWorkset,
);
const oldDictionaryCandidateUseSplitClosureCrossmatch = readJson(
  options.oldDictionaryCandidateUseSplitClosureCrossmatch,
);
const oldDictionaryCandidateUseHandoffIndex = readJson(options.oldDictionaryCandidateUseHandoffIndex);
const oldDictionaryCandidateUseRowLineageMatrix = readJson(options.oldDictionaryCandidateUseRowLineageMatrix);
const oldDictionaryCandidateUseBoundaryChainCrossmatch = readJson(
  options.oldDictionaryCandidateUseBoundaryChainCrossmatch,
);
const oldDictionaryCandidateUseSourceCitationDependencyCrossmatch = readJson(
  options.oldDictionaryCandidateUseSourceCitationDependencyCrossmatch,
);
const oldDictionaryCandidateUseAgent1RouteRecheckCrossmatch = readJson(
  options.oldDictionaryCandidateUseAgent1RouteRecheckCrossmatch,
);
const oldDictionaryCandidateUseGateProofCoverageCrossmatch = readJson(
  options.oldDictionaryCandidateUseGateProofCoverageCrossmatch,
);
const oldDictionaryCandidateUseCurrentBlockerIndex = readJson(
  options.oldDictionaryCandidateUseCurrentBlockerIndex,
);
const oldDictionaryCandidateUseRowBlockerMatrix = readJson(
  options.oldDictionaryCandidateUseRowBlockerMatrix,
);
const oldDictionaryCandidateUseSourceRidBlockerMatrix = readJson(
  options.oldDictionaryCandidateUseSourceRidBlockerMatrix,
);
const oldDictionaryCandidateUseSourceCitationEnrichmentWorklist = readJson(
  options.oldDictionaryCandidateUseSourceCitationEnrichmentWorklist,
);
const oldDictionaryCandidateUseSourceCitationBatchMatrix = readJson(
  options.oldDictionaryCandidateUseSourceCitationBatchMatrix,
);
const oldDictionaryCandidateUseSourceCitationPrefixMatrix = readJson(
  options.oldDictionaryCandidateUseSourceCitationPrefixMatrix,
);
const oldDictionaryCandidateUseAgent6SourceFamilyBoundaryPrereqMatrix = readJson(
  options.oldDictionaryCandidateUseAgent6SourceFamilyBoundaryPrereqMatrix,
);
const oldDictionaryCandidateUseDirectSourceCitationPrereqMatrix = readJson(
  options.oldDictionaryCandidateUseDirectSourceCitationPrereqMatrix,
);
const oldDictionaryCandidateUseSourceFamilySelectionExclusionInventory = readJson(
  options.oldDictionaryCandidateUseSourceFamilySelectionExclusionInventory,
);
const oldDictionaryCandidateUseUnpacketizedSourceFamilySelectionWorkset = readJson(
  options.oldDictionaryCandidateUseUnpacketizedSourceFamilySelectionWorkset,
);
const oldDictionaryCandidateUseSourceFamilySelectionBatchPlan = readJson(
  options.oldDictionaryCandidateUseSourceFamilySelectionBatchPlan,
);
const oldDictionaryCandidateUseSourceFamilySelectionQueueBatchCrossmatch = readJson(
  options.oldDictionaryCandidateUseSourceFamilySelectionQueueBatchCrossmatch,
);
const oldDictionaryCandidateUseCrossBatchQueueGuard = readJson(
  options.oldDictionaryCandidateUseCrossBatchQueueGuard,
);
const oldDictionaryCandidateUseSingleBatchQueueWorkset = readJson(
  options.oldDictionaryCandidateUseSingleBatchQueueWorkset,
);
const oldDictionaryCandidateUseQueuePartitionClosure = readJson(
  options.oldDictionaryCandidateUseQueuePartitionClosure,
);
const oldDictionaryCandidateUsePartitionOverlapDiagnosticIndex = readJson(
  options.oldDictionaryCandidateUsePartitionOverlapDiagnosticIndex,
);
const oldDictionaryCandidateUseQueueSourceDedupeKeyIndex = readJson(
  options.oldDictionaryCandidateUseQueueSourceDedupeKeyIndex,
);
const oldDictionaryCandidateUseSourceRidDedupeCoverageCrossmatch = readJson(
  options.oldDictionaryCandidateUseSourceRidDedupeCoverageCrossmatch,
);
const oldDictionaryCandidateUseQueueSourceSubchainHandoffIndex = readJson(
  options.oldDictionaryCandidateUseQueueSourceSubchainHandoffIndex,
);
const oldDictionaryCandidateUseQueueSourceBoundaryBlockerMatrix = readJson(
  options.oldDictionaryCandidateUseQueueSourceBoundaryBlockerMatrix,
);
const oldDictionaryCandidateUseQueueSourceCandidateRowBridge = readJson(
  options.oldDictionaryCandidateUseQueueSourceCandidateRowBridge,
);
const oldDictionaryCandidateUseQueueSourceBridgeGapWorkset = readJson(
  options.oldDictionaryCandidateUseQueueSourceBridgeGapWorkset,
);
const oldDictionaryCandidateUseBridgeGapSourceRidBlockerCrossmatch = readJson(
  options.oldDictionaryCandidateUseBridgeGapSourceRidBlockerCrossmatch,
);
const oldDictionaryCandidateUseBridgeGapSourceRidPrereqRouteCrossmatch = readJson(
  options.oldDictionaryCandidateUseBridgeGapSourceRidPrereqRouteCrossmatch,
);
const oldDictionaryCandidateUseBridgeGapCandidatePrereqClosureMatrix = readJson(
  options.oldDictionaryCandidateUseBridgeGapCandidatePrereqClosureMatrix,
);
const oldDictionaryCandidateUseBridgeGapA07A06RouteOverlay = readJson(
  options.oldDictionaryCandidateUseBridgeGapA07A06RouteOverlay,
);
const oldDictionaryCandidateUseBridgeGapDownstreamIntakeCoverageCrossmatch = readJson(
  options.oldDictionaryCandidateUseBridgeGapDownstreamIntakeCoverageCrossmatch,
);
const oldDictionaryCandidateUseBridgeGapA06RowLevelDownstreamBlockerWorkset = readJson(
  options.oldDictionaryCandidateUseBridgeGapA06RowLevelDownstreamBlockerWorkset,
);
const oldDictionaryCandidateUseBridgeGapDirectSourceCitationBlockerWorkset = readJson(
  options.oldDictionaryCandidateUseBridgeGapDirectSourceCitationBlockerWorkset,
);
const smokeValidation = readJson(options.smokeValidation);
const usageConcordance = readJson(options.usageConcordance);
const usageHandoffIndex = readJson(options.usageHandoffIndex);
const publicHandoffIndex = readJson(options.publicHandoffIndex);

if (queueReadyPacket.artifact_type !== 'definition_workbench_usage_queue_ready_packet') {
  throw new Error(`${options.queueReadyPacket} is not a queue-ready packet`);
}
if (usageAgent6Packet.artifact_type !== 'definition_workbench_usage_agent6_packet') {
  throw new Error(`${options.usageAgent6Packet} is not an Agent 6 usage packet`);
}
if (usageOccurrenceLinks.artifact_type !== 'definition_workbench_usage_occurrence_links') {
  throw new Error(`${options.usageOccurrenceLinks} is not an occurrence-links packet`);
}
if (usageRouteResolution.artifact_type !== 'definition_workbench_usage_route_resolution') {
  throw new Error(`${options.usageRouteResolution} is not a route-resolution packet`);
}
if (usageCrossmatchNeighbors.artifact_type !== 'definition_workbench_usage_crossmatch_neighbors') {
  throw new Error(`${options.usageCrossmatchNeighbors} is not a crossmatch-neighbor packet`);
}
if (usageSourceRefBuckets.artifact_type !== 'definition_workbench_usage_source_ref_buckets') {
  throw new Error(`${options.usageSourceRefBuckets} is not a source-ref bucket packet`);
}
if (usageWorkBuckets.artifact_type !== 'definition_workbench_usage_work_buckets') {
  throw new Error(`${options.usageWorkBuckets} is not a work bucket packet`);
}
if (usageProvenanceBuckets.artifact_type !== 'definition_workbench_usage_provenance_buckets') {
  throw new Error(`${options.usageProvenanceBuckets} is not a provenance bucket packet`);
}
if (usageOccurrenceDetailIndex.artifact_type !== 'definition_workbench_usage_occurrence_detail_index') {
  throw new Error(`${options.usageOccurrenceDetailIndex} is not an occurrence-detail index`);
}
if (usageFacetIndex.artifact_type !== 'definition_workbench_usage_facet_index') {
  throw new Error(`${options.usageFacetIndex} is not a facet index`);
}
if (usageContextTokenIndex.artifact_type !== 'definition_workbench_usage_context_token_index') {
  throw new Error(`${options.usageContextTokenIndex} is not a context-token index`);
}
if (usageContextTokenLinks.artifact_type !== 'definition_workbench_usage_context_token_links') {
  throw new Error(`${options.usageContextTokenLinks} is not a context-token links packet`);
}
if (usageContextTokenOccurrenceIndex.artifact_type !== 'definition_workbench_usage_context_token_occurrence_index') {
  throw new Error(`${options.usageContextTokenOccurrenceIndex} is not a context-token occurrence index`);
}
if (usageOccurrenceContextProfile.artifact_type !== 'definition_workbench_usage_occurrence_context_profile') {
  throw new Error(`${options.usageOccurrenceContextProfile} is not an occurrence-context profile`);
}
if (usageRouteDiversityProbe.artifact_type !== 'definition_workbench_usage_route_diversity_probe') {
  throw new Error(`${options.usageRouteDiversityProbe} is not a route-diversity probe`);
}
if (usageRouteConcentrationGuardrail.artifact_type !== 'definition_workbench_usage_route_concentration_guardrail') {
  throw new Error(`${options.usageRouteConcentrationGuardrail} is not a route-concentration guardrail`);
}
if (usageRoutePointerAudit.artifact_type !== 'definition_workbench_usage_route_pointer_audit') {
  throw new Error(`${options.usageRoutePointerAudit} is not a route-pointer audit`);
}
if (usageSampleGapAudit.artifact_type !== 'definition_workbench_usage_sample_gap_audit') {
  throw new Error(`${options.usageSampleGapAudit} is not a sample-gap audit`);
}
if (usageConsumerManifest.artifact_type !== 'definition_workbench_usage_consumer_manifest') {
  throw new Error(`${options.usageConsumerManifest} is not a consumer manifest`);
}
if (usagePlanningPacket.artifact_type !== 'definition_workbench_usage_planning_packet') {
  throw new Error(`${options.usagePlanningPacket} is not a planning packet`);
}
if (usageAnchorAudit.artifact_type !== 'definition_workbench_usage_anchor_audit') {
  throw new Error(`${options.usageAnchorAudit} is not an anchor audit`);
}
if (usageOccurrenceSupportPacket.artifact_type !== 'definition_workbench_usage_occurrence_support_packet') {
  throw new Error(`${options.usageOccurrenceSupportPacket} is not an occurrence support packet`);
}
if (usageConcordanceNavigationPacket.artifact_type !== 'definition_workbench_usage_concordance_navigation_packet') {
  throw new Error(`${options.usageConcordanceNavigationPacket} is not a concordance navigation packet`);
}
if (usageFreshnessImpactPacket.artifact_type !== 'definition_workbench_usage_freshness_impact_packet') {
  throw new Error(`${options.usageFreshnessImpactPacket} is not a freshness impact packet`);
}
if (usageSourceFreshnessRefresh.artifact_type !== 'agent3_definition_workbench_usage_source_freshness_refresh') {
  throw new Error(`${options.usageSourceFreshnessRefresh} is not an Agent 3 source freshness refresh packet`);
}
if (usageFreshnessFollowup.artifact_type !== 'agent3_definition_workbench_usage_freshness_followup') {
  throw new Error(`${options.usageFreshnessFollowup} is not an Agent 3 freshness follow-up packet`);
}
if (crossmatchInventoryPacket.artifact_type !== 'agent3_crossmatch_inventory_packet') {
  throw new Error(`${options.crossmatchInventoryPacket} is not an Agent 3 crossmatch inventory packet`);
}
if (
  agent10CrossmatchDirectStateReconciliation.artifact_type !==
  'agent3_agent10_crossmatch_direct_state_reconciliation'
) {
  throw new Error(
    `${options.agent10CrossmatchDirectStateReconciliation} is not an Agent 3 / Agent 10 crossmatch direct-state reconciliation packet`,
  );
}
if (postCrossmatchReconciliationWakeAudit.artifact_type !== 'agent3_post_crossmatch_reconciliation_wake_audit') {
  throw new Error(
    `${options.postCrossmatchReconciliationWakeAudit} is not an Agent 3 post-crossmatch reconciliation wake audit`,
  );
}
if (orotRouteSelectionCrossmatchMatrix.artifact_type !== 'agent3_orot_route_selection_crossmatch_matrix') {
  throw new Error(`${options.orotRouteSelectionCrossmatchMatrix} is not an Agent 3 Orot route-selection crossmatch matrix`);
}
if (postRouteSelectionWakeAudit.artifact_type !== 'agent3_post_route_selection_wake_audit') {
  throw new Error(`${options.postRouteSelectionWakeAudit} is not an Agent 3 post-route-selection wake audit`);
}
if (oldDictionaryRowOverlapLinkageMatrix.artifact_type !== 'agent3_old_dictionary_row_overlap_linkage_matrix') {
  throw new Error(
    `${options.oldDictionaryRowOverlapLinkageMatrix} is not an Agent 3 old-dictionary row-overlap linkage matrix`,
  );
}
if (
  oldDictionaryCandidateUseContinuityCrossmatch.artifact_type !==
  'agent3_old_dictionary_candidate_use_continuity_crossmatch'
) {
  throw new Error(
    `${options.oldDictionaryCandidateUseContinuityCrossmatch} is not an Agent 3 old-dictionary candidate-use continuity crossmatch`,
  );
}
if (
  oldDictionaryCandidateUseSourceFamilyBlockerMatrix.artifact_type !==
  'agent3_old_dictionary_candidate_use_source_family_blocker_matrix'
) {
  throw new Error(
    `${options.oldDictionaryCandidateUseSourceFamilyBlockerMatrix} is not an Agent 3 old-dictionary candidate-use source-family blocker matrix`,
  );
}
if (
  oldDictionaryCandidateUseSourceRidContinuityCrossmatch.artifact_type !==
  'agent3_old_dictionary_candidate_use_source_rid_continuity_crossmatch'
) {
  throw new Error(
    `${options.oldDictionaryCandidateUseSourceRidContinuityCrossmatch} is not an Agent 3 old-dictionary candidate-use source-RID continuity crossmatch`,
  );
}
if (
  oldDictionaryCandidateUseExactSubsetCrossmatch.artifact_type !==
  'agent3_old_dictionary_candidate_use_exact_subset_crossmatch'
) {
  throw new Error(
    `${options.oldDictionaryCandidateUseExactSubsetCrossmatch} is not an Agent 3 old-dictionary candidate-use exact-subset crossmatch`,
  );
}
if (
  oldDictionaryCandidateUseBoundaryTriageNavigation.artifact_type !==
  'agent3_old_dictionary_candidate_use_boundary_triage_navigation'
) {
  throw new Error(
    `${options.oldDictionaryCandidateUseBoundaryTriageNavigation} is not an Agent 3 old-dictionary candidate-use boundary triage navigation artifact`,
  );
}
if (
  oldDictionaryPureCommercialCandidateUseBoundaryWorkset.artifact_type !==
  'agent3_old_dictionary_pure_commercial_candidate_use_boundary_workset'
) {
  throw new Error(
    `${options.oldDictionaryPureCommercialCandidateUseBoundaryWorkset} is not an Agent 3 old-dictionary pure commercial candidate-use boundary workset`,
  );
}
if (
  oldDictionaryOverlapCandidateUseBoundaryWorkset.artifact_type !==
  'agent3_old_dictionary_overlap_candidate_use_boundary_workset'
) {
  throw new Error(
    `${options.oldDictionaryOverlapCandidateUseBoundaryWorkset} is not an Agent 3 old-dictionary overlap candidate-use boundary workset`,
  );
}
if (
  oldDictionaryCandidateUseSplitClosureCrossmatch.artifact_type !==
  'agent3_old_dictionary_candidate_use_split_closure_crossmatch'
) {
  throw new Error(
    `${options.oldDictionaryCandidateUseSplitClosureCrossmatch} is not an Agent 3 old-dictionary candidate-use split closure crossmatch`,
  );
}
if (oldDictionaryCandidateUseHandoffIndex.artifact_type !== 'agent3_old_dictionary_candidate_use_handoff_index') {
  throw new Error(
    `${options.oldDictionaryCandidateUseHandoffIndex} is not an Agent 3 old-dictionary candidate-use handoff index`,
  );
}
if (
  oldDictionaryCandidateUseRowLineageMatrix.artifact_type !==
  'agent3_old_dictionary_candidate_use_row_lineage_matrix'
) {
  throw new Error(
    `${options.oldDictionaryCandidateUseRowLineageMatrix} is not an Agent 3 old-dictionary candidate-use row lineage matrix`,
  );
}
if (
  oldDictionaryCandidateUseBoundaryChainCrossmatch.artifact_type !==
  'agent3_old_dictionary_candidate_use_boundary_chain_crossmatch'
) {
  throw new Error(
    `${options.oldDictionaryCandidateUseBoundaryChainCrossmatch} is not an Agent 3 old-dictionary candidate-use boundary chain crossmatch`,
  );
}
if (
  oldDictionaryCandidateUseSourceCitationDependencyCrossmatch.artifact_type !==
  'agent3_old_dictionary_candidate_use_source_citation_dependency_crossmatch'
) {
  throw new Error(
    `${options.oldDictionaryCandidateUseSourceCitationDependencyCrossmatch} is not an Agent 3 old-dictionary candidate-use source-citation dependency crossmatch`,
  );
}
if (
  oldDictionaryCandidateUseAgent1RouteRecheckCrossmatch.artifact_type !==
  'agent3_old_dictionary_candidate_use_agent1_route_recheck_crossmatch'
) {
  throw new Error(
    `${options.oldDictionaryCandidateUseAgent1RouteRecheckCrossmatch} is not an Agent 3 old-dictionary candidate-use Agent 1 route recheck crossmatch`,
  );
}
if (
  oldDictionaryCandidateUseGateProofCoverageCrossmatch.artifact_type !==
  'agent3_old_dictionary_candidate_use_gate_proof_coverage_crossmatch'
) {
  throw new Error(
    `${options.oldDictionaryCandidateUseGateProofCoverageCrossmatch} is not an Agent 3 old-dictionary candidate-use gate-proof coverage crossmatch`,
  );
}
if (
  oldDictionaryCandidateUseCurrentBlockerIndex.artifact_type !==
  'agent3_old_dictionary_candidate_use_current_blocker_index'
) {
  throw new Error(
    `${options.oldDictionaryCandidateUseCurrentBlockerIndex} is not an Agent 3 old-dictionary candidate-use current blocker index`,
  );
}
if (
  oldDictionaryCandidateUseRowBlockerMatrix.artifact_type !==
  'agent3_old_dictionary_candidate_use_row_blocker_matrix'
) {
  throw new Error(
    `${options.oldDictionaryCandidateUseRowBlockerMatrix} is not an Agent 3 old-dictionary candidate-use row blocker matrix`,
  );
}
if (
  oldDictionaryCandidateUseSourceRidBlockerMatrix.artifact_type !==
  'agent3_old_dictionary_candidate_use_source_rid_blocker_matrix'
) {
  throw new Error(
    `${options.oldDictionaryCandidateUseSourceRidBlockerMatrix} is not an Agent 3 old-dictionary candidate-use source-RID blocker matrix`,
  );
}
if (
  oldDictionaryCandidateUseSourceCitationEnrichmentWorklist.artifact_type !==
  'agent3_old_dictionary_candidate_use_source_citation_enrichment_worklist'
) {
  throw new Error(
    `${options.oldDictionaryCandidateUseSourceCitationEnrichmentWorklist} is not an Agent 3 old-dictionary candidate-use source-citation enrichment worklist`,
  );
}
if (
  oldDictionaryCandidateUseSourceCitationBatchMatrix.artifact_type !==
  'agent3_old_dictionary_candidate_use_source_citation_batch_matrix'
) {
  throw new Error(
    `${options.oldDictionaryCandidateUseSourceCitationBatchMatrix} is not an Agent 3 old-dictionary candidate-use source-citation batch matrix`,
  );
}
if (
  oldDictionaryCandidateUseSourceCitationPrefixMatrix.artifact_type !==
  'agent3_old_dictionary_candidate_use_source_citation_prefix_matrix'
) {
  throw new Error(
    `${options.oldDictionaryCandidateUseSourceCitationPrefixMatrix} is not an Agent 3 old-dictionary candidate-use source-citation prefix matrix`,
  );
}
if (
  oldDictionaryCandidateUseAgent6SourceFamilyBoundaryPrereqMatrix.artifact_type !==
  'agent3_old_dictionary_candidate_use_agent6_source_family_boundary_prereq_matrix'
) {
  throw new Error(
    `${options.oldDictionaryCandidateUseAgent6SourceFamilyBoundaryPrereqMatrix} is not an Agent 3 old-dictionary candidate-use Agent 6 source-family boundary prereq matrix`,
  );
}
if (
  oldDictionaryCandidateUseDirectSourceCitationPrereqMatrix.artifact_type !==
  'agent3_old_dictionary_candidate_use_direct_source_citation_prereq_matrix'
) {
  throw new Error(
    `${options.oldDictionaryCandidateUseDirectSourceCitationPrereqMatrix} is not an Agent 3 old-dictionary candidate-use direct source-citation prereq matrix`,
  );
}
if (
  oldDictionaryCandidateUseSourceFamilySelectionExclusionInventory.artifact_type !==
  'agent3_old_dictionary_candidate_use_source_family_selection_exclusion_inventory'
) {
  throw new Error(
    `${options.oldDictionaryCandidateUseSourceFamilySelectionExclusionInventory} is not an Agent 3 old-dictionary candidate-use source-family-selection exclusion inventory`,
  );
}
if (
  oldDictionaryCandidateUseUnpacketizedSourceFamilySelectionWorkset.artifact_type !==
  'agent3_old_dictionary_candidate_use_unpacketized_source_family_selection_workset'
) {
  throw new Error(
    `${options.oldDictionaryCandidateUseUnpacketizedSourceFamilySelectionWorkset} is not an Agent 3 old-dictionary candidate-use unpacketized source-family-selection workset`,
  );
}
if (
  oldDictionaryCandidateUseSourceFamilySelectionBatchPlan.artifact_type !==
  'agent3_old_dictionary_candidate_use_source_family_selection_batch_plan'
) {
  throw new Error(
    `${options.oldDictionaryCandidateUseSourceFamilySelectionBatchPlan} is not an Agent 3 old-dictionary candidate-use source-family-selection batch plan`,
  );
}
if (
  oldDictionaryCandidateUseSourceFamilySelectionQueueBatchCrossmatch.artifact_type !==
  'agent3_old_dictionary_candidate_use_source_family_selection_queue_batch_crossmatch'
) {
  throw new Error(
    `${options.oldDictionaryCandidateUseSourceFamilySelectionQueueBatchCrossmatch} is not an Agent 3 old-dictionary candidate-use source-family-selection queue/batch crossmatch`,
  );
}
if (oldDictionaryCandidateUseCrossBatchQueueGuard.artifact_type !== 'agent3_old_dictionary_candidate_use_cross_batch_queue_guard') {
  throw new Error(
    `${options.oldDictionaryCandidateUseCrossBatchQueueGuard} is not an Agent 3 old-dictionary candidate-use cross-batch queue guard`,
  );
}
if (oldDictionaryCandidateUseSingleBatchQueueWorkset.artifact_type !== 'agent3_old_dictionary_candidate_use_single_batch_queue_workset') {
  throw new Error(
    `${options.oldDictionaryCandidateUseSingleBatchQueueWorkset} is not an Agent 3 old-dictionary candidate-use single-batch queue workset`,
  );
}
if (oldDictionaryCandidateUseQueuePartitionClosure.artifact_type !== 'agent3_old_dictionary_candidate_use_queue_partition_closure') {
  throw new Error(
    `${options.oldDictionaryCandidateUseQueuePartitionClosure} is not an Agent 3 old-dictionary candidate-use queue partition closure`,
  );
}
if (
  oldDictionaryCandidateUsePartitionOverlapDiagnosticIndex.artifact_type !==
  'agent3_old_dictionary_candidate_use_partition_overlap_diagnostic_index'
) {
  throw new Error(
    `${options.oldDictionaryCandidateUsePartitionOverlapDiagnosticIndex} is not an Agent 3 old-dictionary candidate-use partition overlap diagnostic index`,
  );
}
if (
  oldDictionaryCandidateUseQueueSourceDedupeKeyIndex.artifact_type !==
  'agent3_old_dictionary_candidate_use_queue_source_dedupe_key_index'
) {
  throw new Error(
    `${options.oldDictionaryCandidateUseQueueSourceDedupeKeyIndex} is not an Agent 3 old-dictionary candidate-use queue/source dedupe key index`,
  );
}
if (
  oldDictionaryCandidateUseSourceRidDedupeCoverageCrossmatch.artifact_type !==
  'agent3_old_dictionary_candidate_use_source_rid_dedupe_coverage_crossmatch'
) {
  throw new Error(
    `${options.oldDictionaryCandidateUseSourceRidDedupeCoverageCrossmatch} is not an Agent 3 old-dictionary candidate-use source-RID dedupe coverage crossmatch`,
  );
}
if (
  oldDictionaryCandidateUseQueueSourceSubchainHandoffIndex.artifact_type !==
  'agent3_old_dictionary_candidate_use_queue_source_subchain_handoff_index'
) {
  throw new Error(
    `${options.oldDictionaryCandidateUseQueueSourceSubchainHandoffIndex} is not an Agent 3 old-dictionary candidate-use queue/source subchain handoff index`,
  );
}
if (
  oldDictionaryCandidateUseQueueSourceBoundaryBlockerMatrix.artifact_type !==
  'agent3_old_dictionary_candidate_use_queue_source_boundary_blocker_matrix'
) {
  throw new Error(
    `${options.oldDictionaryCandidateUseQueueSourceBoundaryBlockerMatrix} is not an Agent 3 old-dictionary candidate-use queue/source boundary blocker matrix`,
  );
}
if (
  oldDictionaryCandidateUseQueueSourceCandidateRowBridge.artifact_type !==
  'agent3_old_dictionary_candidate_use_queue_source_candidate_row_bridge'
) {
  throw new Error(
    `${options.oldDictionaryCandidateUseQueueSourceCandidateRowBridge} is not an Agent 3 old-dictionary candidate-use queue/source candidate-row bridge`,
  );
}
if (
  oldDictionaryCandidateUseQueueSourceBridgeGapWorkset.artifact_type !==
  'agent3_old_dictionary_candidate_use_queue_source_bridge_gap_workset'
) {
  throw new Error(
    `${options.oldDictionaryCandidateUseQueueSourceBridgeGapWorkset} is not an Agent 3 old-dictionary candidate-use queue/source bridge gap workset`,
  );
}
if (
  oldDictionaryCandidateUseBridgeGapSourceRidBlockerCrossmatch.artifact_type !==
  'agent3_old_dictionary_candidate_use_bridge_gap_source_rid_blocker_crossmatch'
) {
  throw new Error(
    `${options.oldDictionaryCandidateUseBridgeGapSourceRidBlockerCrossmatch} is not an Agent 3 old-dictionary candidate-use bridge-gap source-RID blocker crossmatch`,
  );
}
if (
  oldDictionaryCandidateUseBridgeGapSourceRidPrereqRouteCrossmatch.artifact_type !==
  'agent3_old_dictionary_candidate_use_bridge_gap_source_rid_prereq_route_crossmatch'
) {
  throw new Error(
    `${options.oldDictionaryCandidateUseBridgeGapSourceRidPrereqRouteCrossmatch} is not an Agent 3 old-dictionary candidate-use bridge-gap source-RID prereq-route crossmatch`,
  );
}
if (
  oldDictionaryCandidateUseBridgeGapCandidatePrereqClosureMatrix.artifact_type !==
  'agent3_old_dictionary_candidate_use_bridge_gap_candidate_prereq_closure_matrix'
) {
  throw new Error(
    `${options.oldDictionaryCandidateUseBridgeGapCandidatePrereqClosureMatrix} is not an Agent 3 old-dictionary candidate-use bridge-gap candidate prereq closure matrix`,
  );
}
if (
  oldDictionaryCandidateUseBridgeGapA07A06RouteOverlay.artifact_type !==
  'agent3_old_dictionary_candidate_use_bridge_gap_a07_a06_route_overlay'
) {
  throw new Error(
    `${options.oldDictionaryCandidateUseBridgeGapA07A06RouteOverlay} is not an Agent 3 old-dictionary candidate-use bridge-gap A07/A06 route overlay`,
  );
}
if (
  oldDictionaryCandidateUseBridgeGapDownstreamIntakeCoverageCrossmatch.artifact_type !==
  'agent3_old_dictionary_candidate_use_bridge_gap_downstream_intake_coverage_crossmatch'
) {
  throw new Error(
    `${options.oldDictionaryCandidateUseBridgeGapDownstreamIntakeCoverageCrossmatch} is not an Agent 3 old-dictionary candidate-use bridge-gap downstream intake coverage crossmatch`,
  );
}
if (
  oldDictionaryCandidateUseBridgeGapA06RowLevelDownstreamBlockerWorkset.artifact_type !==
  'agent3_old_dictionary_candidate_use_bridge_gap_a06_row_level_downstream_blocker_workset'
) {
  throw new Error(
    `${options.oldDictionaryCandidateUseBridgeGapA06RowLevelDownstreamBlockerWorkset} is not an Agent 3 old-dictionary candidate-use bridge-gap A06 row-level downstream blocker workset`,
  );
}
if (
  oldDictionaryCandidateUseBridgeGapDirectSourceCitationBlockerWorkset.artifact_type !==
  'agent3_old_dictionary_candidate_use_bridge_gap_direct_source_citation_blocker_workset'
) {
  throw new Error(
    `${options.oldDictionaryCandidateUseBridgeGapDirectSourceCitationBlockerWorkset} is not an Agent 3 old-dictionary candidate-use bridge-gap direct source-citation blocker workset`,
  );
}
if (publicHandoffIndex.artifact_type !== 'workbench_public_handoff_index') {
  throw new Error(`${options.publicHandoffIndex} is not a public handoff index`);
}

const agent = (agentRegistry.agents || []).find((entry) => entry.agent === 'Agent 3') || {};
const goal = (goalBoard.goals || []).find((entry) => entry.id === 'agent3-definition-occurrence-links') || {};
const evidenceArtifacts = unique([
  options.queueReadyPacket,
  'reports/definition-workbench-usage-queue-ready-packet.md',
  options.usageAgent6Packet,
  'reports/definition-workbench-usage-agent6-packet.md',
  options.usageOccurrenceLinks,
  'reports/definition-workbench-usage-occurrence-links.md',
  options.usageRouteResolution,
  'reports/definition-workbench-usage-route-resolution.md',
  options.usageCrossmatchNeighbors,
  'reports/definition-workbench-usage-crossmatch-neighbors.md',
  options.usageSourceRefBuckets,
  'reports/definition-workbench-usage-source-ref-buckets.md',
  options.usageWorkBuckets,
  'reports/definition-workbench-usage-work-buckets.md',
  options.usageProvenanceBuckets,
  'reports/definition-workbench-usage-provenance-buckets.md',
  options.usageOccurrenceDetailIndex,
  'reports/definition-workbench-usage-occurrence-detail-index.md',
  options.usageFacetIndex,
  'reports/definition-workbench-usage-facet-index.md',
  options.usageContextTokenIndex,
  'reports/definition-workbench-usage-context-token-index.md',
  options.usageContextTokenLinks,
  'reports/definition-workbench-usage-context-token-links.md',
  options.usageContextTokenOccurrenceIndex,
  'reports/definition-workbench-usage-context-token-occurrence-index.md',
  options.usageOccurrenceContextProfile,
  'reports/definition-workbench-usage-occurrence-context-profile.md',
  options.usageRouteDiversityProbe,
  'reports/definition-workbench-usage-route-diversity-probe.md',
  options.usageRouteConcentrationGuardrail,
  'reports/definition-workbench-usage-route-concentration-guardrail.md',
  options.usageRoutePointerAudit,
  'reports/definition-workbench-usage-route-pointer-audit.md',
  options.usageSampleGapAudit,
  'reports/definition-workbench-usage-sample-gap-audit.md',
  options.usageConsumerManifest,
  'reports/definition-workbench-usage-consumer-manifest.md',
  options.usagePlanningPacket,
  'reports/definition-workbench-usage-planning-packet.md',
  options.usageAnchorAudit,
  'reports/definition-workbench-usage-anchor-audit.md',
  options.usageOccurrenceSupportPacket,
  'reports/definition-workbench-usage-occurrence-support-packet.md',
  options.usageConcordanceNavigationPacket,
  'reports/definition-workbench-usage-concordance-navigation-packet.md',
  options.usageFreshnessImpactPacket,
  'reports/definition-workbench-usage-freshness-impact-packet.md',
  options.usageSourceFreshnessRefresh,
  'reports/agent3-definition-workbench-usage-source-freshness-refresh-2026-06-02.md',
  options.usageFreshnessFollowup,
  'reports/agent3-definition-workbench-usage-freshness-followup-2026-06-02.md',
  options.crossmatchInventoryPacket,
  'reports/agent3-crossmatch-inventory-packet-2026-06-05.md',
  options.agent10CrossmatchDirectStateReconciliation,
  'reports/agent3-agent10-crossmatch-direct-state-reconciliation-2026-06-05.md',
  options.postCrossmatchReconciliationWakeAudit,
  'reports/agent3-post-crossmatch-reconciliation-wake-audit-2026-06-05.md',
  options.orotRouteSelectionCrossmatchMatrix,
  'reports/agent3-orot-route-selection-crossmatch-matrix-2026-06-05.md',
  options.postRouteSelectionWakeAudit,
  'reports/agent3-post-route-selection-wake-audit-2026-06-05.md',
  options.oldDictionaryRowOverlapLinkageMatrix,
  'reports/agent3-old-dictionary-row-overlap-linkage-matrix-2026-06-05.md',
  options.oldDictionaryCandidateUseContinuityCrossmatch,
  'reports/agent3-old-dictionary-candidate-use-continuity-crossmatch-2026-06-05.md',
  options.oldDictionaryCandidateUseSourceFamilyBlockerMatrix,
  'reports/agent3-old-dictionary-candidate-use-source-family-blocker-matrix-2026-06-05.md',
  options.oldDictionaryCandidateUseSourceRidContinuityCrossmatch,
  'reports/agent3-old-dictionary-candidate-use-source-rid-continuity-crossmatch-2026-06-05.md',
  options.oldDictionaryCandidateUseExactSubsetCrossmatch,
  'reports/agent3-old-dictionary-candidate-use-exact-subset-crossmatch-2026-06-05.md',
  options.oldDictionaryCandidateUseBoundaryTriageNavigation,
  'reports/agent3-old-dictionary-candidate-use-boundary-triage-navigation-2026-06-05.md',
  options.oldDictionaryPureCommercialCandidateUseBoundaryWorkset,
  'reports/agent3-old-dictionary-pure-commercial-candidate-use-boundary-workset-2026-06-05.md',
  options.oldDictionaryOverlapCandidateUseBoundaryWorkset,
  'reports/agent3-old-dictionary-overlap-candidate-use-boundary-workset-2026-06-06.md',
  options.oldDictionaryCandidateUseSplitClosureCrossmatch,
  'reports/agent3-old-dictionary-candidate-use-split-closure-crossmatch-2026-06-06.md',
  options.oldDictionaryCandidateUseHandoffIndex,
  'reports/agent3-old-dictionary-candidate-use-handoff-index-2026-06-06.md',
  options.oldDictionaryCandidateUseRowLineageMatrix,
  'reports/agent3-old-dictionary-candidate-use-row-lineage-matrix-2026-06-06.md',
  options.oldDictionaryCandidateUseBoundaryChainCrossmatch,
  'reports/agent3-old-dictionary-candidate-use-boundary-chain-crossmatch-2026-06-06.md',
  options.oldDictionaryCandidateUseSourceCitationDependencyCrossmatch,
  'reports/agent3-old-dictionary-candidate-use-source-citation-dependency-crossmatch-2026-06-06.md',
  options.oldDictionaryCandidateUseAgent1RouteRecheckCrossmatch,
  'reports/agent3-old-dictionary-candidate-use-agent1-route-recheck-crossmatch-2026-06-06.md',
  options.oldDictionaryCandidateUseGateProofCoverageCrossmatch,
  'reports/agent3-old-dictionary-candidate-use-gate-proof-coverage-crossmatch-2026-06-06.md',
  options.oldDictionaryCandidateUseCurrentBlockerIndex,
  'reports/agent3-old-dictionary-candidate-use-current-blocker-index-2026-06-06.md',
  options.oldDictionaryCandidateUseRowBlockerMatrix,
  'reports/agent3-old-dictionary-candidate-use-row-blocker-matrix-2026-06-06.md',
  options.oldDictionaryCandidateUseSourceRidBlockerMatrix,
  'reports/agent3-old-dictionary-candidate-use-source-rid-blocker-matrix-2026-06-06.md',
  options.oldDictionaryCandidateUseSourceCitationEnrichmentWorklist,
  'reports/agent3-old-dictionary-candidate-use-source-citation-enrichment-worklist-2026-06-06.md',
  options.oldDictionaryCandidateUseSourceCitationBatchMatrix,
  'reports/agent3-old-dictionary-candidate-use-source-citation-batch-matrix-2026-06-06.md',
  options.oldDictionaryCandidateUseSourceCitationPrefixMatrix,
  'reports/agent3-old-dictionary-candidate-use-source-citation-prefix-matrix-2026-06-06.md',
  options.oldDictionaryCandidateUseAgent6SourceFamilyBoundaryPrereqMatrix,
  'reports/agent3-old-dictionary-candidate-use-agent6-source-family-boundary-prereq-matrix-2026-06-06.md',
  options.oldDictionaryCandidateUseDirectSourceCitationPrereqMatrix,
  'reports/agent3-old-dictionary-candidate-use-direct-source-citation-prereq-matrix-2026-06-06.md',
  options.oldDictionaryCandidateUseSourceFamilySelectionExclusionInventory,
  'reports/agent3-old-dictionary-candidate-use-source-family-selection-exclusion-inventory-2026-06-06.md',
  options.oldDictionaryCandidateUseUnpacketizedSourceFamilySelectionWorkset,
  'reports/agent3-old-dictionary-candidate-use-unpacketized-source-family-selection-workset-2026-06-06.md',
  options.oldDictionaryCandidateUseSourceFamilySelectionBatchPlan,
  'reports/agent3-old-dictionary-candidate-use-source-family-selection-batch-plan-2026-06-06.md',
  options.oldDictionaryCandidateUseSourceFamilySelectionQueueBatchCrossmatch,
  'reports/agent3-old-dictionary-candidate-use-source-family-selection-queue-batch-crossmatch-2026-06-06.md',
  options.oldDictionaryCandidateUseCrossBatchQueueGuard,
  'reports/agent3-old-dictionary-candidate-use-cross-batch-queue-guard-2026-06-06.md',
  options.oldDictionaryCandidateUseSingleBatchQueueWorkset,
  'reports/agent3-old-dictionary-candidate-use-single-batch-queue-workset-2026-06-06.md',
  options.oldDictionaryCandidateUseQueuePartitionClosure,
  'reports/agent3-old-dictionary-candidate-use-queue-partition-closure-2026-06-06.md',
  options.oldDictionaryCandidateUsePartitionOverlapDiagnosticIndex,
  'reports/agent3-old-dictionary-candidate-use-partition-overlap-diagnostic-index-2026-06-06.md',
  options.oldDictionaryCandidateUseQueueSourceDedupeKeyIndex,
  'reports/agent3-old-dictionary-candidate-use-queue-source-dedupe-key-index-2026-06-06.md',
  options.oldDictionaryCandidateUseSourceRidDedupeCoverageCrossmatch,
  'reports/agent3-old-dictionary-candidate-use-source-rid-dedupe-coverage-crossmatch-2026-06-06.md',
  options.oldDictionaryCandidateUseQueueSourceSubchainHandoffIndex,
  'reports/agent3-old-dictionary-candidate-use-queue-source-subchain-handoff-index-2026-06-06.md',
  options.oldDictionaryCandidateUseQueueSourceBoundaryBlockerMatrix,
  'reports/agent3-old-dictionary-candidate-use-queue-source-boundary-blocker-matrix-2026-06-06.md',
  options.oldDictionaryCandidateUseQueueSourceCandidateRowBridge,
  'reports/agent3-old-dictionary-candidate-use-queue-source-candidate-row-bridge-2026-06-06.md',
  options.oldDictionaryCandidateUseQueueSourceBridgeGapWorkset,
  'reports/agent3-old-dictionary-candidate-use-queue-source-bridge-gap-workset-2026-06-06.md',
  options.oldDictionaryCandidateUseBridgeGapSourceRidBlockerCrossmatch,
  'reports/agent3-old-dictionary-candidate-use-bridge-gap-source-rid-blocker-crossmatch-2026-06-06.md',
  options.oldDictionaryCandidateUseBridgeGapSourceRidPrereqRouteCrossmatch,
  'reports/agent3-old-dictionary-candidate-use-bridge-gap-source-rid-prereq-route-crossmatch-2026-06-06.md',
  options.oldDictionaryCandidateUseBridgeGapCandidatePrereqClosureMatrix,
  'reports/agent3-old-dictionary-candidate-use-bridge-gap-candidate-prereq-closure-matrix-2026-06-06.md',
  options.oldDictionaryCandidateUseBridgeGapA07A06RouteOverlay,
  'reports/agent3-old-dictionary-candidate-use-bridge-gap-a07-a06-route-overlay-2026-06-06.md',
  options.oldDictionaryCandidateUseBridgeGapDownstreamIntakeCoverageCrossmatch,
  'reports/agent3-old-dictionary-candidate-use-bridge-gap-downstream-intake-coverage-crossmatch-2026-06-06.md',
  options.oldDictionaryCandidateUseBridgeGapA06RowLevelDownstreamBlockerWorkset,
  'reports/agent3-old-dictionary-candidate-use-bridge-gap-a06-row-level-downstream-blocker-workset-2026-06-06.md',
  options.oldDictionaryCandidateUseBridgeGapDirectSourceCitationBlockerWorkset,
  'reports/agent3-old-dictionary-candidate-use-bridge-gap-direct-source-citation-blocker-workset-2026-06-06.md',
  'reports/agent3-spark3-oracle9-missed-dictionary-evidence-diff-blocker-2026-06-04.json',
  'reports/agent3-spark3-oracle9-missed-dictionary-evidence-diff-blocker-2026-06-04.md',
  'reports/agent3-current-control-drift-refresh-2026-06-04.json',
  'reports/agent3-current-control-drift-refresh-2026-06-04.md',
  'reports/agent3-next-deterministic-matrix-workset-blocker-2026-06-04.json',
  'reports/agent3-next-deterministic-matrix-workset-blocker-2026-06-04.md',
  'reports/agent3-linkage-dedupe-generated-at-drift-audit-2026-06-04.json',
  'reports/agent3-linkage-dedupe-generated-at-drift-audit-2026-06-04.md',
  'reports/agent3-active-workset-handoff-index-2026-06-04.json',
  'reports/agent3-active-workset-handoff-index-2026-06-04.md',
  'reports/agent3-returned-spark-artifact-custody-index-2026-06-04.json',
  'reports/agent3-returned-spark-artifact-custody-index-2026-06-04.md',
  'reports/agent3-post-custody-wake-condition-audit-2026-06-04.json',
  'reports/agent3-post-custody-wake-condition-audit-2026-06-04.md',
  'reports/agent3-spark10-release-intake-current-observer-package-2026-06-04.json',
  'reports/agent3-spark10-release-intake-current-observer-package-2026-06-04.md',
  'reports/agent3-agent10-post-custody-consumption-control-cap-observer-package-2026-06-04.json',
  'reports/agent3-agent10-post-custody-consumption-control-cap-observer-package-2026-06-04.md',
  'reports/agent3-spark10-live-matrix-refresh-observer-package-2026-06-04.json',
  'reports/agent3-spark10-live-matrix-refresh-observer-package-2026-06-04.md',
  'reports/agent3-post-refresh-no-new-workset-audit-2026-06-05.json',
  'reports/agent3-post-refresh-no-new-workset-audit-2026-06-05.md',
  'reports/agent3-spark10-matrix-delta-audit-2026-06-05.json',
  'reports/agent3-spark10-matrix-delta-audit-2026-06-05.md',
  'reports/agent3-deuteronomy-phase2-transform-readiness-verdict-continuity-package-2026-06-05.json',
  'reports/agent3-deuteronomy-phase2-transform-readiness-verdict-continuity-package-2026-06-05.md',
  'reports/agent3-post-continuity-release-intake-registration-audit-2026-06-05.json',
  'reports/agent3-post-continuity-release-intake-registration-audit-2026-06-05.md',
  'reports/agent3-agent10-post-matrix-registration-consumption-package-2026-06-05.json',
  'reports/agent3-agent10-post-matrix-registration-consumption-package-2026-06-05.md',
  'reports/agent3-agent10-direct-release-goal-state-consumption-2026-06-05.json',
  'reports/agent3-agent10-direct-release-goal-state-consumption-2026-06-05.md',
  'reports/agent3-standing-queue-direct-goal-reconciliation-2026-06-05.json',
  'reports/agent3-standing-queue-direct-goal-reconciliation-2026-06-05.md',
  'data/definitions/definition-workbench-usage-link-packet.json',
  'reports/definition-workbench-usage-link-packet.md',
  'data/definitions/definition-workbench-usage-seed-queue.json',
  'reports/definition-workbench-usage-seed-queue.md',
  'data/definitions/definition-workbench-usage-join-smoke.json',
  'reports/definition-workbench-usage-join-smoke.md',
  'reports/workbench-smoke-pipeline-validation.md',
  'data/workbench-evidence/usage-concordance.json',
  options.publicHandoffIndex,
  'reports/workbench-public-handoff-index.md',
  'reports/workbench-source-freshness.md',
]);
const validators = unique([
  'scripts/validate_definition_workbench_usage_queue_ready_packet.mjs',
  'scripts/validate_definition_workbench_usage_agent6_packet.mjs',
  'scripts/validate_definition_workbench_usage_occurrence_links.mjs',
  'scripts/validate_definition_workbench_usage_route_resolution.mjs',
  'scripts/validate_definition_workbench_usage_crossmatch_neighbors.mjs',
  'scripts/validate_definition_workbench_usage_source_ref_buckets.mjs',
  'scripts/validate_definition_workbench_usage_work_buckets.mjs',
  'scripts/validate_definition_workbench_usage_provenance_buckets.mjs',
  'scripts/validate_definition_workbench_usage_occurrence_detail_index.mjs',
  'scripts/validate_definition_workbench_usage_facet_index.mjs',
  'scripts/validate_definition_workbench_usage_context_token_index.mjs',
  'scripts/validate_definition_workbench_usage_context_token_links.mjs',
  'scripts/validate_definition_workbench_usage_context_token_occurrence_index.mjs',
  'scripts/validate_definition_workbench_usage_occurrence_context_profile.mjs',
  'scripts/validate_definition_workbench_usage_route_diversity_probe.mjs',
  'scripts/validate_definition_workbench_usage_route_concentration_guardrail.mjs',
  'scripts/validate_definition_workbench_usage_route_pointer_audit.mjs',
  'scripts/validate_definition_workbench_usage_sample_gap_audit.mjs',
  'scripts/validate_definition_workbench_usage_consumer_manifest.mjs',
  'scripts/validate_definition_workbench_usage_planning_packet.mjs',
  'scripts/validate_definition_workbench_usage_anchor_audit.mjs',
  'scripts/validate_definition_workbench_usage_occurrence_support_packet.mjs',
  'scripts/validate_definition_workbench_usage_concordance_navigation_packet.mjs',
  'scripts/validate_definition_workbench_usage_freshness_impact_packet.mjs',
  'scripts/validate_agent3_definition_workbench_usage_source_freshness_refresh.mjs',
  'scripts/validate_agent3_definition_workbench_usage_freshness_followup.mjs',
  'scripts/validate_agent3_crossmatch_inventory_packet.mjs',
  'scripts/validate_agent3_agent10_crossmatch_direct_state_reconciliation.mjs',
  'scripts/validate_agent3_post_crossmatch_reconciliation_wake_audit.mjs',
  'scripts/validate_agent3_orot_route_selection_crossmatch_matrix.mjs',
  'scripts/validate_agent3_post_route_selection_wake_audit.mjs',
  'scripts/validate_agent3_old_dictionary_row_overlap_linkage_matrix.mjs',
  'scripts/validate_agent3_old_dictionary_candidate_use_continuity_crossmatch.mjs',
  'scripts/validate_agent3_old_dictionary_candidate_use_source_family_blocker_matrix.mjs',
  'scripts/validate_agent3_old_dictionary_candidate_use_source_rid_continuity_crossmatch.mjs',
  'scripts/validate_agent3_old_dictionary_candidate_use_exact_subset_crossmatch.mjs',
  'scripts/validate_agent3_old_dictionary_candidate_use_boundary_triage_navigation.mjs',
  'scripts/validate_agent3_old_dictionary_pure_commercial_candidate_use_boundary_workset.mjs',
  'scripts/validate_agent3_old_dictionary_overlap_candidate_use_boundary_workset.mjs',
  'scripts/validate_agent3_old_dictionary_candidate_use_split_closure_crossmatch.mjs',
  'scripts/validate_agent3_old_dictionary_candidate_use_handoff_index.mjs',
  'scripts/validate_agent3_old_dictionary_candidate_use_row_lineage_matrix.mjs',
  'scripts/validate_agent3_old_dictionary_candidate_use_boundary_chain_crossmatch.mjs',
  'scripts/validate_agent3_old_dictionary_candidate_use_source_citation_dependency_crossmatch.mjs',
  'scripts/validate_agent3_old_dictionary_candidate_use_agent1_route_recheck_crossmatch.mjs',
  'scripts/validate_agent3_old_dictionary_candidate_use_gate_proof_coverage_crossmatch.mjs',
  'scripts/validate_agent3_old_dictionary_candidate_use_current_blocker_index.mjs',
  'scripts/validate_agent3_old_dictionary_candidate_use_row_blocker_matrix.mjs',
  'scripts/validate_agent3_old_dictionary_candidate_use_source_rid_blocker_matrix.mjs',
  'scripts/validate_agent3_old_dictionary_candidate_use_source_citation_enrichment_worklist.mjs',
  'scripts/validate_agent3_old_dictionary_candidate_use_source_citation_batch_matrix.mjs',
  'scripts/validate_agent3_old_dictionary_candidate_use_source_citation_prefix_matrix.mjs',
  'scripts/validate_agent3_old_dictionary_candidate_use_agent6_source_family_boundary_prereq_matrix.mjs',
  'scripts/validate_agent3_old_dictionary_candidate_use_direct_source_citation_prereq_matrix.mjs',
  'scripts/validate_agent3_old_dictionary_candidate_use_source_family_selection_exclusion_inventory.mjs',
  'scripts/validate_agent3_old_dictionary_candidate_use_unpacketized_source_family_selection_workset.mjs',
  'scripts/validate_agent3_old_dictionary_candidate_use_source_family_selection_batch_plan.mjs',
  'scripts/validate_agent3_old_dictionary_candidate_use_source_family_selection_queue_batch_crossmatch.mjs',
  'scripts/validate_agent3_old_dictionary_candidate_use_cross_batch_queue_guard.mjs',
  'scripts/validate_agent3_old_dictionary_candidate_use_single_batch_queue_workset.mjs',
  'scripts/validate_agent3_old_dictionary_candidate_use_queue_partition_closure.mjs',
  'scripts/validate_agent3_old_dictionary_candidate_use_partition_overlap_diagnostic_index.mjs',
  'scripts/validate_agent3_old_dictionary_candidate_use_queue_source_dedupe_key_index.mjs',
  'scripts/validate_agent3_old_dictionary_candidate_use_source_rid_dedupe_coverage_crossmatch.mjs',
  'scripts/validate_agent3_old_dictionary_candidate_use_queue_source_subchain_handoff_index.mjs',
  'scripts/validate_agent3_old_dictionary_candidate_use_queue_source_boundary_blocker_matrix.mjs',
  'scripts/validate_agent3_old_dictionary_candidate_use_queue_source_candidate_row_bridge.mjs',
  'scripts/validate_agent3_old_dictionary_candidate_use_queue_source_bridge_gap_workset.mjs',
  'scripts/validate_agent3_old_dictionary_candidate_use_bridge_gap_source_rid_blocker_crossmatch.mjs',
  'scripts/validate_agent3_old_dictionary_candidate_use_bridge_gap_source_rid_prereq_route_crossmatch.mjs',
  'scripts/validate_agent3_old_dictionary_candidate_use_bridge_gap_candidate_prereq_closure_matrix.mjs',
  'scripts/validate_agent3_old_dictionary_candidate_use_bridge_gap_a07_a06_route_overlay.mjs',
  'scripts/validate_agent3_old_dictionary_candidate_use_bridge_gap_downstream_intake_coverage_crossmatch.mjs',
  'scripts/validate_agent3_old_dictionary_candidate_use_bridge_gap_a06_row_level_downstream_blocker_workset.mjs',
  'scripts/validate_agent3_old_dictionary_candidate_use_bridge_gap_direct_source_citation_blocker_workset.mjs',
  'scripts/validate_definition_workbench_usage_link_packet.mjs',
  'scripts/validate_definition_workbench_usage_seed_queue.mjs',
  'scripts/validate_definition_workbench_usage_join_smoke.mjs',
  'scripts/validate_workbench_smoke_pipeline.mjs',
  'scripts/validate_workbench_public_handoff_index.mjs',
  'scripts/validate_workbench_source_freshness.mjs',
  'scripts/validate_agent3_spark3_oracle9_missed_dictionary_evidence_diff_blocker.mjs',
  'scripts/validate_agent3_current_control_drift_refresh.mjs',
  'scripts/validate_agent3_next_deterministic_matrix_workset_blocker.mjs',
  'scripts/validate_agent3_linkage_dedupe_generated_at_drift_audit.mjs',
  'scripts/validate_agent3_active_workset_handoff_index.mjs',
  'scripts/validate_agent3_returned_spark_artifact_custody_index.mjs',
  'scripts/validate_agent3_post_custody_wake_condition_audit.mjs',
  'scripts/validate_agent3_spark10_release_intake_current_observer_package.mjs',
  'scripts/validate_agent3_agent10_post_custody_consumption_control_cap_observer_package.mjs',
  'scripts/validate_agent3_spark10_live_matrix_refresh_observer_package.mjs',
  'scripts/validate_agent3_post_refresh_no_new_workset_audit.mjs',
  'scripts/validate_agent3_spark10_matrix_delta_audit.mjs',
  'scripts/validate_agent3_deuteronomy_phase2_transform_readiness_verdict_continuity_package.mjs',
  'scripts/validate_agent3_post_continuity_release_intake_registration_audit.mjs',
  'scripts/validate_agent3_agent10_post_matrix_registration_consumption_package.mjs',
  'scripts/validate_agent3_agent10_direct_release_goal_state_consumption.mjs',
  'scripts/validate_agent3_standing_queue_direct_goal_reconciliation.mjs',
  'scripts/validate_agent3_usage_state.mjs',
]);
const counts = buildCounts();
const checks = buildChecks(counts);
const failed = checks.filter((check) => check.status === 'failed');
const warnings = checks.filter((check) => check.status === 'warning');

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_usage_navigation_state',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_usage_state.mjs',
  agent: 'Agent 3',
  lane: agent.lane || 'workbench_usage_navigation',
  state_file: agent.state_file || options.report,
  worker_state: 'evidence-ready',
  qa_acceptance_state: 'not_a07_approved_a06_evidence_ready_only',
  goal_id: 'agent3-definition-occurrence-links',
  goal_board_status: goal.status || null,
  manager: goal.manager || 'Agent 5',
  acceptance_owner: 'A07',
  approval_owner: 'A07',
  evidence_validator_owner: 'A06',
  a06_outputs_are_evidence_ready_until_a07_approves: true,
  do_not_ask_a06_for_approval: true,
  authority_boundary: {
    usage_navigation_only: true,
    occurrence_link_packet_only: true,
    route_ids_only: true,
    approval_sop_final_validation_release_gate_owner_a07: true,
    evidence_validators_repo_cleaning_production_owner_a06: true,
    a06_outputs_evidence_ready_until_a07_approves: true,
    do_not_ask_a06_for_approval: true,
    definition_authority: false,
    semantic_arbitration: false,
    route_ranking: false,
    hud_or_workbench_ui_acceptance: false,
    publication_support: false,
    accepted_translation_text: false,
    agent6_accepted: false,
  },
  handoff_state: {
    queue_ready_packet: options.queueReadyPacket,
    intended_submitter: queueReadyPacket.submission_boundary?.intended_submitter || 'Agent 5',
    control_queue_mutated: queueReadyPacket.submission_boundary?.control_queue_mutated === true,
    submitted_to_agent6: queueReadyPacket.submission_boundary?.submitted_to_agent6 === true,
  },
  evidence_artifacts: evidenceArtifacts,
  validators,
  current_metrics: {
    usage_concordance_rows: Number(usageConcordance.counts?.rows || usageHandoffIndex.counts?.concordance_rows || 0),
    usage_supported_rows: Number(usageConcordance.counts?.status_counts?.supported ?? usageHandoffIndex.counts?.supported ?? 0),
    usage_candidate_rows: Number(usageConcordance.counts?.status_counts?.candidate ?? usageHandoffIndex.counts?.candidate ?? 0),
    usage_weak_rows: Number(usageConcordance.counts?.status_counts?.weak ?? usageHandoffIndex.counts?.weak ?? 0),
    audit_only_ambiguous_rows: Number(usageConcordance.counts?.audit_only_counts?.ambiguous ?? usageHandoffIndex.counts?.audit_only_ambiguous ?? 0),
    usage_clusters: Number(usageHandoffIndex.counts?.usage_clusters || smokeValidation.counts?.usage_cluster_index_clusters || 0),
    selected_usage_rows: Number(smokeValidation.counts?.usage_selected_slice_rows || 0),
    selected_source_refs: Number(smokeValidation.counts?.usage_selected_source_diversity_unique_source_refs || 0),
    selected_works: Number(smokeValidation.counts?.usage_selected_source_diversity_unique_works || 0),
    route_ids: Number(usageAgent6Packet.counts?.route_ids || 0),
    occurrence_link_rows: Number(usageOccurrenceLinks.counts?.occurrence_link_rows || 0),
    occurrence_link_rows_with_complete_metadata: completeOccurrenceLinkRows(),
    occurrence_link_reader_facing_rows: Number(usageOccurrenceLinks.counts?.reader_facing_rows || 0),
    occurrence_link_route_payload_field_hits: Number(usageOccurrenceLinks.counts?.route_payload_field_hits || 0),
    occurrence_link_forbidden_authority_field_hits: Number(usageOccurrenceLinks.counts?.forbidden_authority_field_hits || 0),
    route_resolution_occurrence_route_rows: Number(usageRouteResolution.counts?.occurrence_route_rows || 0),
    route_resolution_route_ids: Number(usageRouteResolution.counts?.route_ids || 0),
    route_resolution_resolved_route_ids: Number(usageRouteResolution.counts?.resolved_route_ids || 0),
    route_resolution_unresolved_route_ids: Number(usageRouteResolution.counts?.unresolved_route_ids || 0),
    route_resolution_reader_facing_rows: Number(usageRouteResolution.counts?.reader_facing_rows || 0),
    route_resolution_route_payload_field_hits: Number(usageRouteResolution.counts?.route_payload_field_hits || 0),
    route_resolution_forbidden_authority_field_hits: Number(usageRouteResolution.counts?.forbidden_authority_field_hits || 0),
    crossmatch_neighbor_source_occurrence_rows: Number(usageCrossmatchNeighbors.counts?.source_occurrence_rows || 0),
    crossmatch_neighbor_link_rows: Number(usageCrossmatchNeighbors.counts?.neighbor_link_rows || 0),
    crossmatch_neighbor_same_frame_links: Number(usageCrossmatchNeighbors.counts?.same_frame_neighbor_links || 0),
    crossmatch_neighbor_bridge_frame_links: Number(usageCrossmatchNeighbors.counts?.bridge_frame_neighbor_links || 0),
    crossmatch_neighbor_route_ids: Number(usageCrossmatchNeighbors.counts?.route_ids || 0),
    crossmatch_neighbor_unresolved_route_ids: Number(usageCrossmatchNeighbors.counts?.unresolved_route_ids || 0),
    crossmatch_neighbor_reader_facing_rows: Number(usageCrossmatchNeighbors.counts?.reader_facing_rows || 0),
    crossmatch_neighbor_route_payload_field_hits: Number(usageCrossmatchNeighbors.counts?.route_payload_field_hits || 0),
    crossmatch_neighbor_forbidden_authority_field_hits: Number(usageCrossmatchNeighbors.counts?.forbidden_authority_field_hits || 0),
    source_ref_bucket_count: Number(usageSourceRefBuckets.counts?.source_ref_buckets || 0),
    source_ref_bucket_source_cluster_buckets: Number(usageSourceRefBuckets.counts?.source_cluster_buckets || 0),
    source_ref_bucket_occurrence_rows: Number(usageSourceRefBuckets.counts?.occurrence_rows || 0),
    source_ref_bucket_duplicate_source_ref_buckets: Number(usageSourceRefBuckets.counts?.duplicate_source_ref_buckets || 0),
    source_ref_bucket_duplicate_source_ref_rows: Number(usageSourceRefBuckets.counts?.duplicate_source_ref_rows || 0),
    source_ref_bucket_cross_cluster_source_ref_buckets: Number(usageSourceRefBuckets.counts?.cross_cluster_source_ref_buckets || 0),
    source_ref_bucket_cross_cluster_source_ref_rows: Number(usageSourceRefBuckets.counts?.cross_cluster_source_ref_rows || 0),
    source_ref_bucket_route_ids: Number(usageSourceRefBuckets.counts?.route_ids || 0),
    source_ref_bucket_unresolved_route_ids: Number(usageSourceRefBuckets.counts?.unresolved_route_ids || 0),
    source_ref_bucket_reader_facing_rows: Number(usageSourceRefBuckets.counts?.reader_facing_rows || 0),
    source_ref_bucket_route_payload_field_hits: Number(usageSourceRefBuckets.counts?.route_payload_field_hits || 0),
    source_ref_bucket_forbidden_authority_field_hits: Number(usageSourceRefBuckets.counts?.forbidden_authority_field_hits || 0),
    work_bucket_count: Number(usageWorkBuckets.counts?.work_buckets || 0),
    work_bucket_work_frame_buckets: Number(usageWorkBuckets.counts?.work_frame_buckets || 0),
    work_bucket_occurrence_rows: Number(usageWorkBuckets.counts?.occurrence_rows || 0),
    work_bucket_source_refs: Number(usageWorkBuckets.counts?.source_ref_count || 0),
    work_bucket_multi_source_work_buckets: Number(usageWorkBuckets.counts?.multi_source_ref_work_buckets || 0),
    work_bucket_multi_source_work_rows: Number(usageWorkBuckets.counts?.multi_source_ref_work_rows || 0),
    work_bucket_multi_frame_work_buckets: Number(usageWorkBuckets.counts?.multi_frame_work_buckets || 0),
    work_bucket_multi_frame_work_rows: Number(usageWorkBuckets.counts?.multi_frame_work_rows || 0),
    work_bucket_route_ids: Number(usageWorkBuckets.counts?.route_ids || 0),
    work_bucket_unresolved_route_ids: Number(usageWorkBuckets.counts?.unresolved_route_ids || 0),
    work_bucket_reader_facing_rows: Number(usageWorkBuckets.counts?.reader_facing_rows || 0),
    work_bucket_route_payload_field_hits: Number(usageWorkBuckets.counts?.route_payload_field_hits || 0),
    work_bucket_forbidden_authority_field_hits: Number(usageWorkBuckets.counts?.forbidden_authority_field_hits || 0),
    provenance_bucket_count: Number(usageProvenanceBuckets.counts?.provenance_buckets || 0),
    provenance_bucket_provenance_frame_buckets: Number(usageProvenanceBuckets.counts?.provenance_frame_buckets || 0),
    provenance_bucket_occurrence_rows: Number(usageProvenanceBuckets.counts?.occurrence_rows || 0),
    provenance_bucket_work_count: Number(usageProvenanceBuckets.counts?.work_count || 0),
    provenance_bucket_source_refs: Number(usageProvenanceBuckets.counts?.source_ref_count || 0),
    provenance_bucket_license_count: Number(usageProvenanceBuckets.counts?.license_count || 0),
    provenance_bucket_version_source_count: Number(usageProvenanceBuckets.counts?.version_source_count || 0),
    provenance_bucket_multi_work_buckets: Number(usageProvenanceBuckets.counts?.multi_work_provenance_buckets || 0),
    provenance_bucket_multi_work_rows: Number(usageProvenanceBuckets.counts?.multi_work_provenance_rows || 0),
    provenance_bucket_multi_frame_buckets: Number(usageProvenanceBuckets.counts?.multi_frame_provenance_buckets || 0),
    provenance_bucket_multi_frame_rows: Number(usageProvenanceBuckets.counts?.multi_frame_provenance_rows || 0),
    provenance_bucket_route_ids: Number(usageProvenanceBuckets.counts?.route_ids || 0),
    provenance_bucket_unresolved_route_ids: Number(usageProvenanceBuckets.counts?.unresolved_route_ids || 0),
    provenance_bucket_reader_facing_rows: Number(usageProvenanceBuckets.counts?.reader_facing_rows || 0),
    provenance_bucket_route_payload_field_hits: Number(usageProvenanceBuckets.counts?.route_payload_field_hits || 0),
    provenance_bucket_forbidden_authority_field_hits: Number(usageProvenanceBuckets.counts?.forbidden_authority_field_hits || 0),
    occurrence_detail_rows: Number(usageOccurrenceDetailIndex.counts?.occurrence_detail_rows || 0),
    occurrence_detail_source_refs: Number(usageOccurrenceDetailIndex.counts?.source_ref_count || 0),
    occurrence_detail_works: Number(usageOccurrenceDetailIndex.counts?.work_count || 0),
    occurrence_detail_license_count: Number(usageOccurrenceDetailIndex.counts?.license_count || 0),
    occurrence_detail_version_source_count: Number(usageOccurrenceDetailIndex.counts?.version_source_count || 0),
    occurrence_detail_route_ids: Number(usageOccurrenceDetailIndex.counts?.route_ids || 0),
    occurrence_detail_unresolved_route_ids: Number(usageOccurrenceDetailIndex.counts?.unresolved_route_ids || 0),
    occurrence_detail_rows_with_route_ids: Number(usageOccurrenceDetailIndex.counts?.rows_with_route_ids || 0),
    occurrence_detail_rows_with_source_link: Number(usageOccurrenceDetailIndex.counts?.rows_with_source_link || 0),
    occurrence_detail_rows_with_work_anchor: Number(usageOccurrenceDetailIndex.counts?.rows_with_work_anchor || 0),
    occurrence_detail_rows_with_hebrew_context: Number(usageOccurrenceDetailIndex.counts?.rows_with_hebrew_context || 0),
    occurrence_detail_rows_with_focus_marker: Number(usageOccurrenceDetailIndex.counts?.rows_with_focus_marker || 0),
    occurrence_detail_rows_with_all_bucket_links: Number(usageOccurrenceDetailIndex.counts?.rows_with_all_bucket_links || 0),
    occurrence_detail_neighbor_links: Number(usageOccurrenceDetailIndex.counts?.neighbor_links || 0),
    occurrence_detail_same_frame_neighbor_links: Number(usageOccurrenceDetailIndex.counts?.same_frame_neighbor_links || 0),
    occurrence_detail_bridge_frame_neighbor_links: Number(usageOccurrenceDetailIndex.counts?.bridge_frame_neighbor_links || 0),
    occurrence_detail_observed_usage_only_rows: Number(usageOccurrenceDetailIndex.counts?.observed_usage_only_rows || 0),
    occurrence_detail_reader_facing_rows: Number(usageOccurrenceDetailIndex.counts?.reader_facing_rows || 0),
    occurrence_detail_route_payload_field_hits: Number(usageOccurrenceDetailIndex.counts?.route_payload_field_hits || 0),
    occurrence_detail_forbidden_authority_field_hits: Number(usageOccurrenceDetailIndex.counts?.forbidden_authority_field_hits || 0),
    facet_index_occurrence_rows: Number(usageFacetIndex.counts?.occurrence_rows || 0),
    facet_index_facet_groups: Number(usageFacetIndex.counts?.facet_groups || 0),
    facet_index_facets_total: Number(usageFacetIndex.counts?.facets_total || 0),
    facet_index_route_ids: Number(usageFacetIndex.counts?.route_ids || 0),
    facet_index_max_route_share_basis_points: Number(usageFacetIndex.counts?.max_route_share_basis_points || 0),
    facet_index_route_concentration_warning: Number(usageFacetIndex.counts?.route_concentration_warning || 0),
    facet_index_rows_with_source_link: Number(usageFacetIndex.counts?.rows_with_source_link || 0),
    facet_index_rows_with_work_anchor: Number(usageFacetIndex.counts?.rows_with_work_anchor || 0),
    facet_index_rows_with_context: Number(usageFacetIndex.counts?.rows_with_context || 0),
    facet_index_rows_with_focus_marker: Number(usageFacetIndex.counts?.rows_with_focus_marker || 0),
    facet_index_rows_with_license: Number(usageFacetIndex.counts?.rows_with_license || 0),
    facet_index_rows_with_version: Number(usageFacetIndex.counts?.rows_with_version || 0),
    facet_index_rows_with_route_ids: Number(usageFacetIndex.counts?.rows_with_route_ids || 0),
    facet_index_reader_facing_rows: Number(usageFacetIndex.counts?.reader_facing_rows || 0),
    facet_index_route_payload_field_hits: Number(usageFacetIndex.counts?.route_payload_field_hits || 0),
    facet_index_forbidden_authority_field_hits: Number(usageFacetIndex.counts?.forbidden_authority_field_hits || 0),
    context_token_index_rows: Number(usageContextTokenIndex.counts?.context_token_rows || 0),
    context_token_index_occurrence_rows: Number(usageContextTokenIndex.counts?.occurrence_rows || 0),
    context_token_index_occurrences: Number(usageContextTokenIndex.counts?.context_token_occurrences || 0),
    context_token_index_cross_frame_rows: Number(usageContextTokenIndex.counts?.cross_frame_context_token_rows || 0),
    context_token_index_repeated_focus_occurrences: Number(usageContextTokenIndex.counts?.repeated_focus_context_occurrences || 0),
    context_token_index_route_ids: Number(usageContextTokenIndex.counts?.route_ids || 0),
    context_token_index_unresolved_route_ids: Number(usageContextTokenIndex.counts?.unresolved_route_ids || 0),
    context_token_index_route_concentration_warning: Number(usageContextTokenIndex.counts?.route_concentration_warning || 0),
    context_token_index_rows_with_source_link: Number(usageContextTokenIndex.counts?.rows_with_source_link || 0),
    context_token_index_rows_with_work_anchor: Number(usageContextTokenIndex.counts?.rows_with_work_anchor || 0),
    context_token_index_rows_with_hebrew_context: Number(usageContextTokenIndex.counts?.rows_with_hebrew_context || 0),
    context_token_index_rows_with_focus_marker: Number(usageContextTokenIndex.counts?.rows_with_focus_marker || 0),
    context_token_index_rows_with_license_metadata: Number(usageContextTokenIndex.counts?.rows_with_license_metadata || 0),
    context_token_index_rows_with_version_metadata: Number(usageContextTokenIndex.counts?.rows_with_version_metadata || 0),
    context_token_index_reader_facing_rows: Number(usageContextTokenIndex.counts?.reader_facing_rows || 0),
    context_token_index_route_payload_field_hits: Number(usageContextTokenIndex.counts?.route_payload_field_hits || 0),
    context_token_index_forbidden_authority_field_hits: Number(usageContextTokenIndex.counts?.forbidden_authority_field_hits || 0),
    context_token_link_rows: Number(usageContextTokenLinks.counts?.context_token_link_rows || 0),
    context_token_link_context_tokens: Number(usageContextTokenLinks.counts?.context_token_rows || 0),
    context_token_link_occurrence_rows: Number(usageContextTokenLinks.counts?.occurrence_rows || 0),
    context_token_link_focus_rows: Number(usageContextTokenLinks.counts?.focus_marked_link_rows || 0),
    context_token_link_context_rows: Number(usageContextTokenLinks.counts?.context_role_link_rows || 0),
    context_token_link_repeated_focus_rows: Number(usageContextTokenLinks.counts?.repeated_focus_context_links || 0),
    context_token_link_cross_frame_rows: Number(usageContextTokenLinks.counts?.cross_frame_context_token_links || 0),
    context_token_link_route_ids: Number(usageContextTokenLinks.counts?.route_ids || 0),
    context_token_link_unresolved_route_ids: Number(usageContextTokenLinks.counts?.unresolved_route_ids || 0),
    context_token_link_max_route_share_basis_points: Number(usageContextTokenLinks.counts?.max_route_share_basis_points || 0),
    context_token_link_route_concentration_warning: Number(usageContextTokenLinks.counts?.route_concentration_warning || 0),
    context_token_link_rows_with_source_link: Number(usageContextTokenLinks.counts?.rows_with_source_link || 0),
    context_token_link_rows_with_work_anchor: Number(usageContextTokenLinks.counts?.rows_with_work_anchor || 0),
    context_token_link_rows_with_hebrew_context: Number(usageContextTokenLinks.counts?.rows_with_hebrew_context || 0),
    context_token_link_rows_with_focus_marker: Number(usageContextTokenLinks.counts?.rows_with_focus_marker || 0),
    context_token_link_rows_with_route_ids: Number(usageContextTokenLinks.counts?.rows_with_route_ids || 0),
    context_token_link_rows_with_license_metadata: Number(usageContextTokenLinks.counts?.rows_with_license_metadata || 0),
    context_token_link_rows_with_version_metadata: Number(usageContextTokenLinks.counts?.rows_with_version_metadata || 0),
    context_token_link_observed_usage_only_rows: Number(usageContextTokenLinks.counts?.observed_usage_only_rows || 0),
    context_token_link_reader_facing_rows: Number(usageContextTokenLinks.counts?.reader_facing_rows || 0),
    context_token_link_route_payload_field_hits: Number(usageContextTokenLinks.counts?.route_payload_field_hits || 0),
    context_token_link_forbidden_authority_field_hits: Number(usageContextTokenLinks.counts?.forbidden_authority_field_hits || 0),
    context_token_occurrence_index_rows: Number(usageContextTokenOccurrenceIndex.counts?.context_token_occurrence_rows || 0),
    context_token_occurrence_index_link_rows: Number(usageContextTokenOccurrenceIndex.counts?.context_token_link_rows || 0),
    context_token_occurrence_index_occurrence_rows: Number(usageContextTokenOccurrenceIndex.counts?.occurrence_rows || 0),
    context_token_occurrence_index_focus_rows: Number(usageContextTokenOccurrenceIndex.counts?.focus_link_rows || 0),
    context_token_occurrence_index_context_rows: Number(usageContextTokenOccurrenceIndex.counts?.context_link_rows || 0),
    context_token_occurrence_index_repeated_focus_rows: Number(usageContextTokenOccurrenceIndex.counts?.repeated_focus_context_link_rows || 0),
    context_token_occurrence_index_cross_frame_rows: Number(usageContextTokenOccurrenceIndex.counts?.cross_frame_context_token_rows || 0),
    context_token_occurrence_index_cross_frame_link_rows: Number(usageContextTokenOccurrenceIndex.counts?.cross_frame_context_token_link_rows || 0),
    context_token_occurrence_index_route_ids: Number(usageContextTokenOccurrenceIndex.counts?.route_ids || 0),
    context_token_occurrence_index_unresolved_route_ids: Number(usageContextTokenOccurrenceIndex.counts?.unresolved_route_ids || 0),
    context_token_occurrence_index_max_route_share_basis_points: Number(usageContextTokenOccurrenceIndex.counts?.max_route_share_basis_points || 0),
    context_token_occurrence_index_route_concentration_warning: Number(usageContextTokenOccurrenceIndex.counts?.route_concentration_warning || 0),
    context_token_occurrence_index_rows_with_source_link: Number(usageContextTokenOccurrenceIndex.counts?.link_rows_with_source_link || 0),
    context_token_occurrence_index_rows_with_work_anchor: Number(usageContextTokenOccurrenceIndex.counts?.link_rows_with_work_anchor || 0),
    context_token_occurrence_index_rows_with_hebrew_context: Number(usageContextTokenOccurrenceIndex.counts?.link_rows_with_hebrew_context || 0),
    context_token_occurrence_index_rows_with_focus_marker: Number(usageContextTokenOccurrenceIndex.counts?.link_rows_with_focus_marker || 0),
    context_token_occurrence_index_rows_with_route_ids: Number(usageContextTokenOccurrenceIndex.counts?.link_rows_with_route_ids || 0),
    context_token_occurrence_index_rows_with_license_metadata: Number(usageContextTokenOccurrenceIndex.counts?.link_rows_with_license_metadata || 0),
    context_token_occurrence_index_rows_with_version_metadata: Number(usageContextTokenOccurrenceIndex.counts?.link_rows_with_version_metadata || 0),
    context_token_occurrence_index_reader_facing_rows: Number(usageContextTokenOccurrenceIndex.counts?.reader_facing_rows || 0),
    context_token_occurrence_index_route_payload_field_hits: Number(usageContextTokenOccurrenceIndex.counts?.route_payload_field_hits || 0),
    context_token_occurrence_index_forbidden_authority_field_hits: Number(usageContextTokenOccurrenceIndex.counts?.forbidden_authority_field_hits || 0),
    occurrence_context_profile_rows: Number(usageOccurrenceContextProfile.counts?.profile_rows || 0),
    occurrence_context_profile_link_rows: Number(usageOccurrenceContextProfile.counts?.context_token_link_rows || 0),
    occurrence_context_profile_unique_context_tokens: Number(usageOccurrenceContextProfile.counts?.unique_context_tokens || 0),
    occurrence_context_profile_reverse_index_rows: Number(usageOccurrenceContextProfile.counts?.reverse_index_rows || 0),
    occurrence_context_profile_rows_with_reverse_index_ids: Number(usageOccurrenceContextProfile.counts?.rows_with_reverse_index_ids || 0),
    occurrence_context_profile_rows_with_complete_reverse_index_mapping: Number(usageOccurrenceContextProfile.counts?.rows_with_complete_reverse_index_mapping || 0),
    occurrence_context_profile_focus_rows: Number(usageOccurrenceContextProfile.counts?.focus_link_rows || 0),
    occurrence_context_profile_context_rows: Number(usageOccurrenceContextProfile.counts?.context_link_rows || 0),
    occurrence_context_profile_repeated_focus_rows: Number(usageOccurrenceContextProfile.counts?.repeated_focus_context_link_rows || 0),
    occurrence_context_profile_cross_frame_rows: Number(usageOccurrenceContextProfile.counts?.cross_frame_context_link_rows || 0),
    occurrence_context_profile_route_ids: Number(usageOccurrenceContextProfile.counts?.route_ids || 0),
    occurrence_context_profile_unresolved_route_ids: Number(usageOccurrenceContextProfile.counts?.unresolved_route_ids || 0),
    occurrence_context_profile_max_route_share_basis_points: Number(usageOccurrenceContextProfile.counts?.max_route_share_basis_points || 0),
    occurrence_context_profile_route_concentration_warning: Number(usageOccurrenceContextProfile.counts?.route_concentration_warning || 0),
    occurrence_context_profile_rows_with_source_link: Number(usageOccurrenceContextProfile.counts?.rows_with_source_link || 0),
    occurrence_context_profile_rows_with_work_anchor: Number(usageOccurrenceContextProfile.counts?.rows_with_work_anchor || 0),
    occurrence_context_profile_rows_with_hebrew_context: Number(usageOccurrenceContextProfile.counts?.rows_with_hebrew_context || 0),
    occurrence_context_profile_rows_with_focus_marker: Number(usageOccurrenceContextProfile.counts?.rows_with_focus_marker || 0),
    occurrence_context_profile_rows_with_route_ids: Number(usageOccurrenceContextProfile.counts?.rows_with_route_ids || 0),
    occurrence_context_profile_rows_with_license_metadata: Number(usageOccurrenceContextProfile.counts?.rows_with_license_metadata || 0),
    occurrence_context_profile_rows_with_version_metadata: Number(usageOccurrenceContextProfile.counts?.rows_with_version_metadata || 0),
    occurrence_context_profile_reader_facing_rows: Number(usageOccurrenceContextProfile.counts?.reader_facing_rows || 0),
    occurrence_context_profile_route_payload_field_hits: Number(usageOccurrenceContextProfile.counts?.route_payload_field_hits || 0),
    occurrence_context_profile_forbidden_authority_field_hits: Number(usageOccurrenceContextProfile.counts?.forbidden_authority_field_hits || 0),
    route_diversity_probe_occurrence_rows: Number(usageRouteDiversityProbe.counts?.occurrence_rows || 0),
    route_diversity_probe_route_ids: Number(usageRouteDiversityProbe.counts?.route_ids || 0),
    route_diversity_probe_route_probe_rows: Number(usageRouteDiversityProbe.counts?.route_probe_rows || 0),
    route_diversity_probe_max_route_share_basis_points: Number(usageRouteDiversityProbe.counts?.max_route_share_basis_points || 0),
    route_diversity_probe_concentration_warning: Number(usageRouteDiversityProbe.counts?.route_concentration_warning || 0),
    route_diversity_probe_all_selected_rows_same_route: Number(usageRouteDiversityProbe.counts?.all_selected_rows_same_route || 0),
    route_diversity_probe_semantic_independence_claim_allowed: Number(usageRouteDiversityProbe.counts?.semantic_independence_claim_allowed || 0),
    route_diversity_probe_coverage_buckets_total: Number(usageRouteDiversityProbe.counts?.coverage_buckets_total || 0),
    route_diversity_probe_concentration_support_selected_occurrence_refs: Number(usageRouteDiversityProbe.counts?.concentration_support_selected_occurrence_refs || 0),
    route_diversity_probe_concentration_support_unique_source_refs: Number(usageRouteDiversityProbe.counts?.concentration_support_unique_source_refs || 0),
    route_diversity_probe_concentration_support_unique_work_anchors: Number(usageRouteDiversityProbe.counts?.concentration_support_unique_work_anchors || 0),
    route_diversity_probe_concentration_support_unique_works: Number(usageRouteDiversityProbe.counts?.concentration_support_unique_works || 0),
    route_diversity_probe_concentration_support_unique_licenses: Number(usageRouteDiversityProbe.counts?.concentration_support_unique_licenses || 0),
    route_diversity_probe_concentration_support_unique_version_sources: Number(usageRouteDiversityProbe.counts?.concentration_support_unique_version_sources || 0),
    route_diversity_probe_concentration_support_duplicate_source_ref_rows: Number(usageRouteDiversityProbe.counts?.concentration_support_duplicate_source_ref_rows || 0),
    route_diversity_probe_concentration_support_missing_signature_rows: Number(usageRouteDiversityProbe.counts?.concentration_support_missing_signature_rows || 0),
    route_diversity_probe_concentration_support_signature_memberships: Number(usageRouteDiversityProbe.counts?.concentration_support_signature_memberships || 0),
    route_diversity_probe_concentration_support_recurring_signature_rows: Number(usageRouteDiversityProbe.counts?.concentration_support_recurring_signature_rows || 0),
    route_diversity_probe_concentration_support_cross_cluster_signature_rows: Number(usageRouteDiversityProbe.counts?.concentration_support_cross_cluster_signature_rows || 0),
    route_diversity_probe_concentration_support_missing_lookup_rows: Number(usageRouteDiversityProbe.counts?.concentration_support_missing_lookup_rows || 0),
    route_diversity_probe_concentration_support_final_authority: Number(usageRouteDiversityProbe.counts?.concentration_support_final_authority || 0),
    route_diversity_probe_concentration_support_semantic_independence_allowed: Number(usageRouteDiversityProbe.counts?.concentration_support_semantic_independence_allowed || 0),
    route_diversity_probe_reader_facing_rows: Number(usageRouteDiversityProbe.counts?.reader_facing_rows || 0),
    route_diversity_probe_route_payload_field_hits: Number(usageRouteDiversityProbe.counts?.route_payload_field_hits || 0),
    route_diversity_probe_forbidden_authority_field_hits: Number(usageRouteDiversityProbe.counts?.forbidden_authority_field_hits || 0),
    route_concentration_guardrail_surfaces: Number(usageRouteConcentrationGuardrail.counts?.guardrail_surfaces || 0),
    route_concentration_guardrail_single_route_surfaces: Number(usageRouteConcentrationGuardrail.counts?.guardrail_surfaces_with_single_route || 0),
    route_concentration_guardrail_max_share_surfaces: Number(usageRouteConcentrationGuardrail.counts?.guardrail_surfaces_with_max_share_10000 || 0),
    route_concentration_guardrail_warning_surfaces: Number(usageRouteConcentrationGuardrail.counts?.guardrail_surfaces_with_concentration_warning || 0),
    route_concentration_guardrail_semantic_independence_allowed_rows: Number(usageRouteConcentrationGuardrail.counts?.semantic_independence_allowed_rows || 0),
    route_concentration_guardrail_answer_authority_allowed_rows: Number(usageRouteConcentrationGuardrail.counts?.answer_authority_allowed_rows || 0),
    route_concentration_guardrail_route_ranking_allowed_rows: Number(usageRouteConcentrationGuardrail.counts?.route_ranking_allowed_rows || 0),
    route_concentration_guardrail_visible_answer_selection_allowed_rows: Number(usageRouteConcentrationGuardrail.counts?.visible_answer_selection_allowed_rows || 0),
    route_concentration_guardrail_reader_facing_rows: Number(usageRouteConcentrationGuardrail.counts?.reader_facing_rows || 0),
    route_concentration_guardrail_route_payload_field_hits: Number(usageRouteConcentrationGuardrail.counts?.route_payload_field_hits || 0),
    route_concentration_guardrail_forbidden_authority_field_hits: Number(usageRouteConcentrationGuardrail.counts?.forbidden_authority_field_hits || 0),
    route_concentration_guardrail_unresolved_route_ids: Number(usageRouteConcentrationGuardrail.counts?.unresolved_route_ids || 0),
    route_pointer_audit_rows: Number(usageRoutePointerAudit.counts?.route_pointer_rows || 0),
    route_pointer_audit_route_ids: Number(usageRoutePointerAudit.counts?.route_ids || 0),
    route_pointer_audit_resolved_route_ids: Number(usageRoutePointerAudit.counts?.resolved_route_ids || 0),
    route_pointer_audit_unresolved_route_ids: Number(usageRoutePointerAudit.counts?.unresolved_route_ids || 0),
    route_pointer_audit_support_rows_with_pointer: Number(usageRoutePointerAudit.counts?.support_rows_with_pointer || 0),
    route_pointer_audit_support_rows: Number(usageRoutePointerAudit.counts?.support_rows || 0),
    route_pointer_audit_navigation_rows_with_pointer: Number(usageRoutePointerAudit.counts?.navigation_rows_with_pointer || 0),
    route_pointer_audit_navigation_rows: Number(usageRoutePointerAudit.counts?.navigation_rows || 0),
    route_pointer_audit_planning_rows_with_pointer: Number(usageRoutePointerAudit.counts?.planning_rows_with_pointer || 0),
    route_pointer_audit_planning_rows: Number(usageRoutePointerAudit.counts?.planning_rows || 0),
    route_pointer_audit_reader_facing_rows: Number(usageRoutePointerAudit.counts?.reader_facing_rows || 0),
    route_pointer_audit_route_payload_field_hits: Number(usageRoutePointerAudit.counts?.route_payload_field_hits || 0),
    route_pointer_audit_forbidden_authority_field_hits: Number(usageRoutePointerAudit.counts?.forbidden_authority_field_hits || 0),
    route_pointer_audit_route_metadata_field_hits: Number(usageRoutePointerAudit.counts?.route_metadata_field_hits || 0),
    sample_gap_audit_gap_rows: Number(usageSampleGapAudit.counts?.gap_rows || 0),
    sample_gap_audit_sample_rows: Number(usageSampleGapAudit.counts?.sample_rows || 0),
    sample_gap_audit_sample_rows_with_usage_links: Number(usageSampleGapAudit.counts?.sample_rows_with_usage_links || 0),
    sample_gap_audit_usage_tokens_not_in_sample: Number(usageSampleGapAudit.counts?.usage_tokens_not_in_sample || 0),
    sample_gap_audit_selected_occurrence_links: Number(usageSampleGapAudit.counts?.selected_occurrence_links || 0),
    sample_gap_audit_route_ids: Number(usageSampleGapAudit.counts?.route_ids || 0),
    sample_gap_audit_sample_overlap_gap_visible: Number(usageSampleGapAudit.counts?.sample_overlap_gap_visible || 0),
    sample_gap_audit_reader_facing_rows: Number(usageSampleGapAudit.counts?.reader_facing_rows || 0),
    sample_gap_audit_route_payload_field_hits: Number(usageSampleGapAudit.counts?.route_payload_field_hits || 0),
    sample_gap_audit_forbidden_authority_field_hits: Number(usageSampleGapAudit.counts?.forbidden_authority_field_hits || 0),
    consumer_manifest_entries: Number(usageConsumerManifest.counts?.manifest_entries || 0),
    consumer_manifest_data_artifacts_exist: Number(usageConsumerManifest.counts?.data_artifacts_exist || 0),
    consumer_manifest_data_artifacts: Number(usageConsumerManifest.counts?.data_artifacts || 0),
    consumer_manifest_report_artifacts_exist: Number(usageConsumerManifest.counts?.report_artifacts_exist || 0),
    consumer_manifest_report_artifacts: Number(usageConsumerManifest.counts?.report_artifacts || 0),
    consumer_manifest_validator_scripts_exist: Number(usageConsumerManifest.counts?.validator_scripts_exist || 0),
    consumer_manifest_validator_scripts: Number(usageConsumerManifest.counts?.validator_scripts || 0),
    consumer_manifest_passed_entries: Number(usageConsumerManifest.counts?.passed_entries || 0),
    consumer_manifest_occurrence_detail_rows: Number(usageConsumerManifest.counts?.occurrence_detail_rows || 0),
    consumer_manifest_occurrence_link_rows: Number(usageConsumerManifest.counts?.occurrence_link_rows || 0),
    consumer_manifest_route_ids: Number(usageConsumerManifest.counts?.route_ids || 0),
    consumer_manifest_unresolved_route_ids: Number(usageConsumerManifest.counts?.unresolved_route_ids || 0),
    consumer_manifest_reader_facing_rows: Number(usageConsumerManifest.counts?.reader_facing_rows || 0),
    consumer_manifest_route_payload_field_hits: Number(usageConsumerManifest.counts?.route_payload_field_hits || 0),
    consumer_manifest_forbidden_authority_field_hits: Number(usageConsumerManifest.counts?.forbidden_authority_field_hits || 0),
    planning_packet_planning_rows: Number(usagePlanningPacket.counts?.planning_rows || 0),
    planning_packet_occurrence_link_rows: Number(usagePlanningPacket.counts?.occurrence_link_rows || 0),
    planning_packet_current_sample_rows_with_usage_links: Number(usagePlanningPacket.counts?.current_sample_rows_with_usage_links || 0),
    planning_packet_current_sample_usage_tokens_not_in_sample: Number(usagePlanningPacket.counts?.current_sample_usage_tokens_not_in_sample || 0),
    planning_packet_route_ids: Number(usagePlanningPacket.counts?.route_ids || 0),
    planning_packet_reader_facing_rows: Number(usagePlanningPacket.counts?.reader_facing_rows || 0),
    planning_packet_route_payload_field_hits: Number(usagePlanningPacket.counts?.route_payload_field_hits || 0),
    planning_packet_forbidden_authority_field_hits: Number(usagePlanningPacket.counts?.forbidden_authority_field_hits || 0),
    planning_packet_summary_token_keys: Number(usagePlanningPacket.counts?.planning_summary_token_keys || 0),
    planning_packet_summary_occurrence_token_keys: Number(usagePlanningPacket.counts?.planning_summary_occurrence_token_keys || 0),
    planning_packet_summary_supported_rows: Number(usagePlanningPacket.counts?.planning_summary_supported_rows || 0),
    planning_packet_summary_candidate_rows: Number(usagePlanningPacket.counts?.planning_summary_candidate_rows || 0),
    planning_packet_summary_weak_rows: Number(usagePlanningPacket.counts?.planning_summary_weak_rows || 0),
    planning_packet_summary_resolved_route_ids: Number(usagePlanningPacket.counts?.planning_summary_resolved_route_ids || 0),
    planning_packet_summary_unresolved_route_ids: Number(usagePlanningPacket.counts?.planning_summary_unresolved_route_ids || 0),
    planning_packet_summary_source_refs: Number(usagePlanningPacket.counts?.planning_summary_source_refs || 0),
    planning_packet_summary_works: Number(usagePlanningPacket.counts?.planning_summary_works || 0),
    planning_packet_summary_forbidden_use_items: Number(usagePlanningPacket.counts?.planning_summary_forbidden_use_items || 0),
    planning_packet_summary_qa_boundary_references: Number(usagePlanningPacket.counts?.planning_summary_qa_boundary_references || 0),
    planning_packet_summary_broad_coverage_claim_allowed: usagePlanningPacket.planning_handoff_summary?.warning_summary?.broad_coverage_claim_allowed === true ? 1 : 0,
    planning_packet_summary_semantic_independence_claim_allowed: usagePlanningPacket.planning_handoff_summary?.warning_summary?.semantic_independence_claim_allowed === true ? 1 : 0,
    anchor_audit_rows: Number(usageAnchorAudit.counts?.audit_rows || 0),
    anchor_audit_existing_work_pages: Number(usageAnchorAudit.counts?.rows_with_existing_work_page || 0),
    anchor_audit_existing_anchors: Number(usageAnchorAudit.counts?.rows_with_existing_anchor || 0),
    anchor_audit_matching_source_refs: Number(usageAnchorAudit.counts?.rows_with_matching_source_ref || 0),
    anchor_audit_token_surfaces_in_page: Number(usageAnchorAudit.counts?.rows_with_token_surface_in_page || 0),
    anchor_audit_focus_surfaces_in_page: Number(usageAnchorAudit.counts?.rows_with_focus_surface_in_page || 0),
    anchor_audit_rows_with_context: Number(usageAnchorAudit.counts?.rows_with_context || 0),
    anchor_audit_rows_with_focus_marker: Number(usageAnchorAudit.counts?.rows_with_focus_marker || 0),
    anchor_audit_rows_with_license: Number(usageAnchorAudit.counts?.rows_with_license || 0),
    anchor_audit_rows_with_version: Number(usageAnchorAudit.counts?.rows_with_version || 0),
    anchor_audit_rows_with_route_ids: Number(usageAnchorAudit.counts?.rows_with_route_ids || 0),
    anchor_audit_reader_facing_rows: Number(usageAnchorAudit.counts?.reader_facing_rows || 0),
    anchor_audit_route_payload_field_hits: Number(usageAnchorAudit.counts?.route_payload_field_hits || 0),
    anchor_audit_forbidden_authority_field_hits: Number(usageAnchorAudit.counts?.forbidden_authority_field_hits || 0),
    occurrence_support_rows: Number(usageOccurrenceSupportPacket.counts?.support_rows || 0),
    occurrence_support_supported_rows: Number(usageOccurrenceSupportPacket.counts?.supported_rows || 0),
    occurrence_support_candidate_rows: Number(usageOccurrenceSupportPacket.counts?.candidate_rows || 0),
    occurrence_support_weak_rows: Number(usageOccurrenceSupportPacket.counts?.weak_rows || 0),
    occurrence_support_rows_with_source_url: Number(usageOccurrenceSupportPacket.counts?.rows_with_source_url || 0),
    occurrence_support_rows_with_local_work_anchor: Number(usageOccurrenceSupportPacket.counts?.rows_with_local_work_anchor || 0),
    occurrence_support_rows_with_context_snippet: Number(usageOccurrenceSupportPacket.counts?.rows_with_context_snippet || 0),
    occurrence_support_rows_with_focus_marker: Number(usageOccurrenceSupportPacket.counts?.rows_with_focus_marker || 0),
    occurrence_support_rows_with_route_ids: Number(usageOccurrenceSupportPacket.counts?.rows_with_route_ids || 0),
    occurrence_support_rows_with_license_metadata: Number(usageOccurrenceSupportPacket.counts?.rows_with_license_metadata || 0),
    occurrence_support_rows_with_version_metadata: Number(usageOccurrenceSupportPacket.counts?.rows_with_version_metadata || 0),
    occurrence_support_reader_facing_rows: Number(usageOccurrenceSupportPacket.counts?.reader_facing_rows || 0),
    occurrence_support_route_payload_field_hits: Number(usageOccurrenceSupportPacket.counts?.route_payload_field_hits || 0),
    occurrence_support_forbidden_authority_field_hits: Number(usageOccurrenceSupportPacket.counts?.forbidden_authority_field_hits || 0),
    concordance_navigation_rows: Number(usageConcordanceNavigationPacket.counts?.navigation_rows || 0),
    concordance_navigation_supported_rows: Number(usageConcordanceNavigationPacket.counts?.supported_rows || 0),
    concordance_navigation_candidate_rows: Number(usageConcordanceNavigationPacket.counts?.candidate_rows || 0),
    concordance_navigation_weak_rows: Number(usageConcordanceNavigationPacket.counts?.weak_rows || 0),
    concordance_navigation_selected_support_rows: Number(usageConcordanceNavigationPacket.counts?.selected_support_rows || 0),
    concordance_navigation_source_refs: Number(usageConcordanceNavigationPacket.counts?.source_refs || 0),
    concordance_navigation_works: Number(usageConcordanceNavigationPacket.counts?.works || 0),
    concordance_navigation_categories: Number(usageConcordanceNavigationPacket.counts?.categories || 0),
    concordance_navigation_route_ids: Number(usageConcordanceNavigationPacket.counts?.route_ids || 0),
    concordance_navigation_rows_with_source_url: Number(usageConcordanceNavigationPacket.counts?.rows_with_source_url || 0),
    concordance_navigation_rows_with_local_work_anchor: Number(usageConcordanceNavigationPacket.counts?.rows_with_local_work_anchor || 0),
    concordance_navigation_rows_with_context_snippet: Number(usageConcordanceNavigationPacket.counts?.rows_with_context_snippet || 0),
    concordance_navigation_rows_with_focus_marker: Number(usageConcordanceNavigationPacket.counts?.rows_with_focus_marker || 0),
    concordance_navigation_rows_with_route_ids: Number(usageConcordanceNavigationPacket.counts?.rows_with_route_ids || 0),
    concordance_navigation_rows_with_license_metadata: Number(usageConcordanceNavigationPacket.counts?.rows_with_license_metadata || 0),
    concordance_navigation_rows_with_version_metadata: Number(usageConcordanceNavigationPacket.counts?.rows_with_version_metadata || 0),
    concordance_navigation_reader_facing_rows: Number(usageConcordanceNavigationPacket.counts?.reader_facing_rows || 0),
    concordance_navigation_route_payload_field_hits: Number(usageConcordanceNavigationPacket.counts?.route_payload_field_hits || 0),
    concordance_navigation_forbidden_authority_field_hits: Number(usageConcordanceNavigationPacket.counts?.forbidden_authority_field_hits || 0),
    ...publicHandoffMetrics(),
    freshness_impact_pending_refresh_files: Number(usageFreshnessImpactPacket.counts?.pending_refresh_files || 0),
    freshness_impact_pending_with_current_usage_overlap: Number(usageFreshnessImpactPacket.counts?.pending_with_current_usage_overlap || 0),
    freshness_impact_impacted_navigation_rows: Number(usageFreshnessImpactPacket.counts?.impacted_navigation_rows || 0),
    freshness_impact_impacted_selected_support_rows: Number(usageFreshnessImpactPacket.counts?.impacted_selected_support_rows || 0),
    freshness_impact_promoted_run_targets: Number(usageFreshnessImpactPacket.counts?.promoted_run_targets || 0),
    freshness_impact_source_text_read: Number(usageFreshnessImpactPacket.counts?.source_text_read || 0),
    freshness_impact_broad_target_expansion: Number(usageFreshnessImpactPacket.counts?.broad_target_expansion || 0),
    freshness_impact_reader_facing_rows: Number(usageFreshnessImpactPacket.counts?.reader_facing_rows || 0),
    freshness_impact_route_payload_field_hits: Number(usageFreshnessImpactPacket.counts?.route_payload_field_hits || 0),
    freshness_impact_forbidden_authority_field_hits: Number(usageFreshnessImpactPacket.counts?.forbidden_authority_field_hits || 0),
    source_freshness_refresh_dirty_source_files: Number(usageSourceFreshnessRefresh.counts?.git_dirty_source_files || 0),
    source_freshness_refresh_modified_source_files: Number(usageSourceFreshnessRefresh.counts?.git_modified_source_files || 0),
    source_freshness_refresh_untracked_source_files: Number(usageSourceFreshnessRefresh.counts?.git_untracked_source_files || 0),
    source_freshness_refresh_overlap_sources: Number(usageSourceFreshnessRefresh.counts?.dirty_sources_with_current_usage_overlap || 0),
    source_freshness_refresh_impacted_navigation_rows: Number(usageSourceFreshnessRefresh.counts?.impacted_navigation_rows || 0),
    source_freshness_refresh_impacted_selected_support_rows: Number(usageSourceFreshnessRefresh.counts?.impacted_selected_support_rows || 0),
    source_freshness_refresh_promoted_run_targets: Number(usageSourceFreshnessRefresh.counts?.promoted_run_targets || 0),
    source_freshness_refresh_source_text_read: Number(usageSourceFreshnessRefresh.counts?.source_text_read || 0),
    source_freshness_refresh_broad_target_expansion: Number(usageSourceFreshnessRefresh.counts?.broad_target_expansion || 0),
    source_freshness_refresh_reader_facing_rows: Number(usageSourceFreshnessRefresh.counts?.reader_facing_rows || 0),
    source_freshness_refresh_route_payload_field_hits: Number(usageSourceFreshnessRefresh.counts?.route_payload_field_hits || 0),
    source_freshness_refresh_forbidden_authority_field_hits: Number(usageSourceFreshnessRefresh.counts?.forbidden_authority_field_hits || 0),
    source_freshness_refresh_prior_pending_delta: Number(usageSourceFreshnessRefresh.counts?.current_vs_prior_pending_delta || 0),
    freshness_followup_live_dirty_source_files: Number(usageFreshnessFollowup.counts?.live_dirty_source_files || 0),
    freshness_followup_overlap_sources: Number(usageFreshnessFollowup.counts?.dirty_sources_with_current_usage_overlap || 0),
    freshness_followup_impacted_navigation_rows: Number(usageFreshnessFollowup.counts?.impacted_navigation_rows || 0),
    freshness_followup_current_route_ids: Number(usageFreshnessFollowup.counts?.current_route_ids || 0),
    freshness_followup_queue_mutations: Number(usageFreshnessFollowup.counts?.queue_mutations || 0),
    freshness_followup_submitted_to_agent6: Number(usageFreshnessFollowup.counts?.submitted_to_agent6 || 0),
    freshness_followup_forbidden_authority_field_hits: Number(usageFreshnessFollowup.counts?.forbidden_authority_field_hits || 0),
    crossmatch_inventory_files: Number(crossmatchInventoryPacket.counts?.files_in_inventory || 0),
    crossmatch_inventory_dirty_or_uncommitted_files: Number(crossmatchInventoryPacket.counts?.dirty_or_uncommitted_files || 0),
    crossmatch_inventory_forbidden_truthy_authority_claims: Number(crossmatchInventoryPacket.counts?.forbidden_truthy_authority_claims || 0),
    agent10_crossmatch_direct_state_dirty_or_uncommitted_files: Number(agent10CrossmatchDirectStateReconciliation.schema_counts?.direct_state_agent3_dirty_or_uncommitted_files || 0),
    agent10_crossmatch_fresh_consumption_dirty_or_uncommitted_files: Number(agent10CrossmatchDirectStateReconciliation.schema_counts?.fresh_consumption_agent3_dirty_or_uncommitted_files || 0),
    agent10_crossmatch_current_inventory_dirty_or_uncommitted_files: Number(agent10CrossmatchDirectStateReconciliation.schema_counts?.current_inventory_dirty_or_uncommitted_files || 0),
    agent10_crossmatch_stale_dirty_count_delta: Number(agent10CrossmatchDirectStateReconciliation.schema_counts?.stale_dirty_count_delta || 0),
    agent10_crossmatch_current_inventory_blocker_count: Number(agent10CrossmatchDirectStateReconciliation.schema_counts?.current_inventory_blocker_count || 0),
    agent10_crossmatch_control_edits: Number(agent10CrossmatchDirectStateReconciliation.schema_counts?.control_edits || 0),
    agent10_crossmatch_agent6_boundary_packets_opened: Number(agent10CrossmatchDirectStateReconciliation.schema_counts?.agent6_boundary_packets_opened || 0),
    post_crossmatch_wake_queue_stale_deuteronomy_rows: Number(postCrossmatchReconciliationWakeAudit.schema_counts?.queue_stale_deuteronomy_contract_gap_rows || 0),
    post_crossmatch_wake_agent10_stale_dirty_count_delta: Number(postCrossmatchReconciliationWakeAudit.schema_counts?.stale_direct_dirty_count_delta || 0),
    post_crossmatch_wake_current_inventory_dirty_files: Number(postCrossmatchReconciliationWakeAudit.schema_counts?.current_inventory_dirty_or_uncommitted_files || 0),
    post_crossmatch_wake_registered_continuity_rows: Number(postCrossmatchReconciliationWakeAudit.schema_counts?.spark10_agent3_continuity_registered_rows || 0),
    post_crossmatch_wake_direct_executable_worksets: Number(postCrossmatchReconciliationWakeAudit.schema_counts?.direct_agent3_executable_worksets || 0),
    post_crossmatch_wake_no_new_workset_blockers: Number(postCrossmatchReconciliationWakeAudit.schema_counts?.no_new_agent3_workset_blockers || 0),
    post_crossmatch_wake_agent6_boundary_packets_opened: Number(postCrossmatchReconciliationWakeAudit.schema_counts?.agent6_boundary_packets_opened || 0),
    orot_route_selection_rows: Number(orotRouteSelectionCrossmatchMatrix.counts?.token_index_rows || 0),
    orot_route_selection_occurrence_links: Number(orotRouteSelectionCrossmatchMatrix.counts?.occurrence_links || 0),
    orot_route_selection_candidate_mismatches: Number(orotRouteSelectionCrossmatchMatrix.counts?.candidate_selection_mismatch_rows || 0),
    orot_route_selection_token_index_linkage_gaps: Number(orotRouteSelectionCrossmatchMatrix.counts?.candidate_token_index_linkage_gap_rows || 0),
    orot_route_selection_exact_blockers: Number(orotRouteSelectionCrossmatchMatrix.counts?.exact_blocker_rows || 0),
    orot_route_selection_route_payload_field_hits: Number(orotRouteSelectionCrossmatchMatrix.counts?.route_payload_field_hits || 0),
    orot_route_selection_forbidden_authority_field_hits: Number(orotRouteSelectionCrossmatchMatrix.counts?.forbidden_authority_field_hits || 0),
    post_route_selection_wake_current_executable_worksets: Number(postRouteSelectionWakeAudit.schema_counts?.current_direct_executable_worksets || 0),
    post_route_selection_wake_exact_blockers: Number(postRouteSelectionWakeAudit.schema_counts?.exact_blockers || 0),
    post_route_selection_wake_conditions: Number(postRouteSelectionWakeAudit.schema_counts?.wake_conditions || 0),
    post_route_selection_wake_queue_mutations: Number(postRouteSelectionWakeAudit.schema_counts?.queue_mutations || 0),
    post_route_selection_wake_acceptance_claims: Number(postRouteSelectionWakeAudit.schema_counts?.acceptance_claims || 0),
    old_dictionary_row_overlap_buckets: Number(oldDictionaryRowOverlapLinkageMatrix.counts?.bucket_rows || 0),
    old_dictionary_row_overlap_rows: Number(oldDictionaryRowOverlapLinkageMatrix.counts?.represented_rows || 0),
    old_dictionary_row_overlap_occurrences: Number(oldDictionaryRowOverlapLinkageMatrix.counts?.represented_occurrences || 0),
    old_dictionary_row_overlap_duplicate_sample_tokens: Number(oldDictionaryRowOverlapLinkageMatrix.counts?.duplicate_sample_token_ids || 0),
    old_dictionary_row_overlap_source_family_pointer_rows: Number(oldDictionaryRowOverlapLinkageMatrix.counts?.source_family_pointer_rows || 0),
    old_dictionary_row_overlap_exact_blockers: Number(oldDictionaryRowOverlapLinkageMatrix.counts?.exact_blocker_rows || 0),
    old_dictionary_row_overlap_audit_zero_rows: Number(oldDictionaryRowOverlapLinkageMatrix.counts?.audit_zero_row_records || 0),
    old_dictionary_row_overlap_route_payload_field_hits: Number(oldDictionaryRowOverlapLinkageMatrix.counts?.route_payload_field_hits || 0),
    old_dictionary_row_overlap_forbidden_authority_field_hits: Number(oldDictionaryRowOverlapLinkageMatrix.counts?.forbidden_authority_field_hits || 0),
    old_dictionary_row_overlap_acceptance_claims: Number(oldDictionaryRowOverlapLinkageMatrix.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_rows: Number(oldDictionaryCandidateUseContinuityCrossmatch.counts?.candidate_use_rows || 0),
    old_dictionary_candidate_use_occurrences: Number(oldDictionaryCandidateUseContinuityCrossmatch.counts?.candidate_use_occurrences || 0),
    old_dictionary_candidate_use_sample_linked_rows: Number(oldDictionaryCandidateUseContinuityCrossmatch.counts?.row_overlap_sample_linked_rows || 0),
    old_dictionary_candidate_use_sample_unlinked_rows: Number(oldDictionaryCandidateUseContinuityCrossmatch.counts?.row_overlap_sample_unlinked_rows || 0),
    old_dictionary_candidate_use_blocker_link_rows: Number(oldDictionaryCandidateUseContinuityCrossmatch.counts?.rows_with_source_family_blocker_links || 0),
    old_dictionary_candidate_use_duplicate_queue_ids: Number(oldDictionaryCandidateUseContinuityCrossmatch.counts?.duplicate_queue_ids || 0),
    old_dictionary_candidate_use_duplicate_token_ids: Number(oldDictionaryCandidateUseContinuityCrossmatch.counts?.duplicate_token_ids || 0),
    old_dictionary_candidate_use_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseContinuityCrossmatch.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_acceptance_claims: Number(oldDictionaryCandidateUseContinuityCrossmatch.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_source_family_rows: Number(oldDictionaryCandidateUseSourceFamilyBlockerMatrix.counts?.source_family_rows || 0),
    old_dictionary_candidate_use_source_family_set_rows: Number(oldDictionaryCandidateUseSourceFamilyBlockerMatrix.counts?.source_family_set_rows || 0),
    old_dictionary_candidate_use_source_family_membership_rows: Number(oldDictionaryCandidateUseSourceFamilyBlockerMatrix.counts?.source_family_membership_rows || 0),
    old_dictionary_candidate_use_source_family_membership_occurrences: Number(oldDictionaryCandidateUseSourceFamilyBlockerMatrix.counts?.source_family_membership_occurrences || 0),
    old_dictionary_candidate_use_source_family_multi_rows: Number(oldDictionaryCandidateUseSourceFamilyBlockerMatrix.counts?.multi_family_candidate_rows || 0),
    old_dictionary_candidate_use_source_family_single_rows: Number(oldDictionaryCandidateUseSourceFamilyBlockerMatrix.counts?.single_family_candidate_rows || 0),
    old_dictionary_candidate_use_source_family_exact_blockers: Number(oldDictionaryCandidateUseSourceFamilyBlockerMatrix.counts?.exact_blocker_rows || 0),
    old_dictionary_candidate_use_source_family_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseSourceFamilyBlockerMatrix.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_source_family_acceptance_claims: Number(oldDictionaryCandidateUseSourceFamilyBlockerMatrix.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_source_rid_references: Number(oldDictionaryCandidateUseSourceRidContinuityCrossmatch.counts?.source_rid_references || 0),
    old_dictionary_candidate_use_source_rid_unique: Number(oldDictionaryCandidateUseSourceRidContinuityCrossmatch.counts?.unique_source_rids || 0),
    old_dictionary_candidate_use_source_rid_prefix_rows: Number(oldDictionaryCandidateUseSourceRidContinuityCrossmatch.counts?.source_rid_prefix_rows || 0),
    old_dictionary_candidate_use_source_rid_rows_with_metadata: Number(oldDictionaryCandidateUseSourceRidContinuityCrossmatch.counts?.rows_with_agent1_citation_metadata || 0),
    old_dictionary_candidate_use_source_rid_rows_with_all_metadata_rids: Number(oldDictionaryCandidateUseSourceRidContinuityCrossmatch.counts?.rows_with_all_source_rids_in_agent1_metadata || 0),
    old_dictionary_candidate_use_source_rid_missing_prefixes: Number(oldDictionaryCandidateUseSourceRidContinuityCrossmatch.counts?.source_rid_prefixes_missing_namespace || 0),
    old_dictionary_candidate_use_source_rid_unused_namespace_prefixes: Number(oldDictionaryCandidateUseSourceRidContinuityCrossmatch.counts?.namespace_prefixes_unused_by_candidate_package || 0),
    old_dictionary_candidate_use_source_rid_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseSourceRidContinuityCrossmatch.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_source_rid_acceptance_claims: Number(oldDictionaryCandidateUseSourceRidContinuityCrossmatch.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_exact_subset_matched_rows: Number(oldDictionaryCandidateUseExactSubsetCrossmatch.counts?.candidate_rows_matched_to_manifest || 0),
    old_dictionary_candidate_use_exact_subset_missing_rows: Number(oldDictionaryCandidateUseExactSubsetCrossmatch.counts?.candidate_rows_missing_manifest_subset || 0),
    old_dictionary_candidate_use_exact_subset_commercial_only_rows: Number(oldDictionaryCandidateUseExactSubsetCrossmatch.counts?.candidate_rows_commercial_clean_only || 0),
    old_dictionary_candidate_use_exact_subset_nc_overlap_rows: Number(oldDictionaryCandidateUseExactSubsetCrossmatch.counts?.candidate_rows_with_nc_overlap || 0),
    old_dictionary_candidate_use_exact_subset_blocked_overlap_rows: Number(oldDictionaryCandidateUseExactSubsetCrossmatch.counts?.candidate_rows_with_blocked_overlap || 0),
    old_dictionary_candidate_use_exact_subset_triple_overlap_rows: Number(oldDictionaryCandidateUseExactSubsetCrossmatch.counts?.candidate_rows_with_nc_and_blocked_overlap || 0),
    old_dictionary_candidate_use_exact_subset_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseExactSubsetCrossmatch.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_exact_subset_acceptance_claims: Number(oldDictionaryCandidateUseExactSubsetCrossmatch.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_boundary_triage_rows: Number(oldDictionaryCandidateUseBoundaryTriageNavigation.counts?.candidate_use_rows || 0),
    old_dictionary_candidate_use_boundary_triage_occurrences: Number(oldDictionaryCandidateUseBoundaryTriageNavigation.counts?.candidate_use_occurrences || 0),
    old_dictionary_candidate_use_boundary_triage_pure_clean_rows: Number(oldDictionaryCandidateUseBoundaryTriageNavigation.counts?.pure_commercial_clean_rows || 0),
    old_dictionary_candidate_use_boundary_triage_overlap_rows: Number(oldDictionaryCandidateUseBoundaryTriageNavigation.counts?.overlap_rows || 0),
    old_dictionary_candidate_use_boundary_triage_bucket_family_sets: Number(oldDictionaryCandidateUseBoundaryTriageNavigation.counts?.bucket_source_family_set_rows || 0),
    old_dictionary_candidate_use_boundary_triage_missing_family_boundary_links: Number(oldDictionaryCandidateUseBoundaryTriageNavigation.counts?.rows_with_missing_family_boundary_links || 0),
    old_dictionary_candidate_use_boundary_triage_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseBoundaryTriageNavigation.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_boundary_triage_acceptance_claims: Number(oldDictionaryCandidateUseBoundaryTriageNavigation.counts?.acceptance_claims || 0),
    old_dictionary_pure_commercial_candidate_use_workset_rows: Number(oldDictionaryPureCommercialCandidateUseBoundaryWorkset.counts?.workset_rows || 0),
    old_dictionary_pure_commercial_candidate_use_workset_occurrences: Number(oldDictionaryPureCommercialCandidateUseBoundaryWorkset.counts?.workset_occurrences || 0),
    old_dictionary_pure_commercial_candidate_use_workset_source_rids: Number(oldDictionaryPureCommercialCandidateUseBoundaryWorkset.counts?.unique_source_rids || 0),
    old_dictionary_pure_commercial_candidate_use_workset_blocker_rows: Number(oldDictionaryPureCommercialCandidateUseBoundaryWorkset.counts?.blocker_rows || 0),
    old_dictionary_pure_commercial_candidate_use_workset_transform_ready_rows: Number(oldDictionaryPureCommercialCandidateUseBoundaryWorkset.counts?.transform_ready_rows || 0),
    old_dictionary_pure_commercial_candidate_use_workset_forbidden_payload_field_hits: Number(oldDictionaryPureCommercialCandidateUseBoundaryWorkset.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_pure_commercial_candidate_use_workset_acceptance_claims: Number(oldDictionaryPureCommercialCandidateUseBoundaryWorkset.counts?.acceptance_claims || 0),
    old_dictionary_overlap_candidate_use_workset_rows: Number(oldDictionaryOverlapCandidateUseBoundaryWorkset.counts?.workset_rows || 0),
    old_dictionary_overlap_candidate_use_workset_occurrences: Number(oldDictionaryOverlapCandidateUseBoundaryWorkset.counts?.workset_occurrences || 0),
    old_dictionary_overlap_candidate_use_workset_unique_source_rids: Number(oldDictionaryOverlapCandidateUseBoundaryWorkset.counts?.unique_source_rids || 0),
    old_dictionary_overlap_candidate_use_workset_blocker_rows: Number(oldDictionaryOverlapCandidateUseBoundaryWorkset.counts?.blocker_rows || 0),
    old_dictionary_overlap_candidate_use_workset_bucket_family_sets: Number(oldDictionaryOverlapCandidateUseBoundaryWorkset.counts?.bucket_source_family_set_rows || 0),
    old_dictionary_overlap_candidate_use_workset_transform_ready_rows: Number(oldDictionaryOverlapCandidateUseBoundaryWorkset.counts?.transform_ready_rows || 0),
    old_dictionary_overlap_candidate_use_workset_forbidden_payload_field_hits: Number(oldDictionaryOverlapCandidateUseBoundaryWorkset.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_overlap_candidate_use_workset_acceptance_claims: Number(oldDictionaryOverlapCandidateUseBoundaryWorkset.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_split_closure_rows: Number(oldDictionaryCandidateUseSplitClosureCrossmatch.counts?.closure_rows || 0),
    old_dictionary_candidate_use_split_closure_occurrences: Number(oldDictionaryCandidateUseSplitClosureCrossmatch.counts?.closure_occurrences || 0),
    old_dictionary_candidate_use_split_closure_missing_rows: Number(oldDictionaryCandidateUseSplitClosureCrossmatch.counts?.missing_from_closure_rows || 0),
    old_dictionary_candidate_use_split_closure_extra_rows: Number(oldDictionaryCandidateUseSplitClosureCrossmatch.counts?.extra_in_closure_rows || 0),
    old_dictionary_candidate_use_split_closure_duplicate_queue_ids: Number(oldDictionaryCandidateUseSplitClosureCrossmatch.counts?.closure_duplicate_queue_ids || 0),
    old_dictionary_candidate_use_split_closure_cross_partition_duplicate_queue_ids: Number(oldDictionaryCandidateUseSplitClosureCrossmatch.counts?.cross_partition_duplicate_queue_ids || 0),
    old_dictionary_candidate_use_split_closure_shared_source_rids: Number(oldDictionaryCandidateUseSplitClosureCrossmatch.counts?.cross_partition_shared_source_rids || 0),
    old_dictionary_candidate_use_split_closure_transform_ready_rows: Number(oldDictionaryCandidateUseSplitClosureCrossmatch.counts?.transform_ready_rows || 0),
    old_dictionary_candidate_use_split_closure_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseSplitClosureCrossmatch.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_split_closure_acceptance_claims: Number(oldDictionaryCandidateUseSplitClosureCrossmatch.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_handoff_index_entries: Number(oldDictionaryCandidateUseHandoffIndex.counts?.handoff_entries || 0),
    old_dictionary_candidate_use_handoff_index_json_artifacts_exist: Number(oldDictionaryCandidateUseHandoffIndex.counts?.json_artifacts_exist || 0),
    old_dictionary_candidate_use_handoff_index_report_artifacts_exist: Number(oldDictionaryCandidateUseHandoffIndex.counts?.report_artifacts_exist || 0),
    old_dictionary_candidate_use_handoff_index_validator_scripts_exist: Number(oldDictionaryCandidateUseHandoffIndex.counts?.validator_scripts_exist || 0),
    old_dictionary_candidate_use_handoff_index_artifact_type_mismatches: Number(oldDictionaryCandidateUseHandoffIndex.counts?.artifact_type_mismatches || 0),
    old_dictionary_candidate_use_handoff_index_entries_with_authority_issues: Number(oldDictionaryCandidateUseHandoffIndex.counts?.entries_with_nonzero_authority_counters || 0),
    old_dictionary_candidate_use_handoff_index_split_missing_rows: Number(oldDictionaryCandidateUseHandoffIndex.counts?.split_closure_missing_rows || 0),
    old_dictionary_candidate_use_handoff_index_split_duplicate_queue_ids: Number(oldDictionaryCandidateUseHandoffIndex.counts?.split_closure_duplicate_queue_ids || 0),
    old_dictionary_candidate_use_handoff_index_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseHandoffIndex.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_handoff_index_acceptance_claims: Number(oldDictionaryCandidateUseHandoffIndex.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_row_lineage_rows: Number(oldDictionaryCandidateUseRowLineageMatrix.counts?.row_lineage_rows || 0),
    old_dictionary_candidate_use_row_lineage_occurrences: Number(oldDictionaryCandidateUseRowLineageMatrix.counts?.row_lineage_occurrences || 0),
    old_dictionary_candidate_use_row_lineage_all_layers_linked: Math.min(
      Number(oldDictionaryCandidateUseRowLineageMatrix.counts?.continuity_rows_linked || 0),
      Number(oldDictionaryCandidateUseRowLineageMatrix.counts?.source_rid_rows_linked || 0),
      Number(oldDictionaryCandidateUseRowLineageMatrix.counts?.exact_subset_rows_linked || 0),
      Number(oldDictionaryCandidateUseRowLineageMatrix.counts?.boundary_triage_rows_linked || 0),
      Number(oldDictionaryCandidateUseRowLineageMatrix.counts?.split_closure_rows_linked || 0),
    ),
    old_dictionary_candidate_use_row_lineage_gap_rows: Number(oldDictionaryCandidateUseRowLineageMatrix.counts?.lineage_gap_rows || 0),
    old_dictionary_candidate_use_row_lineage_duplicate_queue_ids: Number(oldDictionaryCandidateUseRowLineageMatrix.counts?.duplicate_queue_ids || 0),
    old_dictionary_candidate_use_row_lineage_source_rid_refs: Number(oldDictionaryCandidateUseRowLineageMatrix.counts?.source_rid_references || 0),
    old_dictionary_candidate_use_row_lineage_unique_source_rids: Number(oldDictionaryCandidateUseRowLineageMatrix.counts?.unique_source_rids || 0),
    old_dictionary_candidate_use_row_lineage_agent2_queue_pointers: Number(oldDictionaryCandidateUseRowLineageMatrix.counts?.agent2_queue_pointer_rows || 0),
    old_dictionary_candidate_use_row_lineage_transform_ready_rows: Number(oldDictionaryCandidateUseRowLineageMatrix.counts?.transform_ready_rows || 0),
    old_dictionary_candidate_use_row_lineage_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseRowLineageMatrix.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_row_lineage_acceptance_claims: Number(oldDictionaryCandidateUseRowLineageMatrix.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_boundary_chain_rows: Number(oldDictionaryCandidateUseBoundaryChainCrossmatch.counts?.row_crossmatch_rows || 0),
    old_dictionary_candidate_use_boundary_chain_occurrences: Number(oldDictionaryCandidateUseBoundaryChainCrossmatch.counts?.row_crossmatch_occurrences || 0),
    old_dictionary_candidate_use_boundary_chain_preboundary_matches: Number(oldDictionaryCandidateUseBoundaryChainCrossmatch.counts?.preboundary_rows_matched || 0),
    old_dictionary_candidate_use_boundary_chain_zero_text_matches: Number(oldDictionaryCandidateUseBoundaryChainCrossmatch.counts?.zero_text_rows_matched || 0),
    old_dictionary_candidate_use_boundary_chain_missing_rows: Number(oldDictionaryCandidateUseBoundaryChainCrossmatch.counts?.missing_preboundary_rows || 0) + Number(oldDictionaryCandidateUseBoundaryChainCrossmatch.counts?.missing_zero_text_rows || 0),
    old_dictionary_candidate_use_boundary_chain_extra_rows: Number(oldDictionaryCandidateUseBoundaryChainCrossmatch.counts?.extra_preboundary_rows || 0) + Number(oldDictionaryCandidateUseBoundaryChainCrossmatch.counts?.extra_zero_text_rows || 0),
    old_dictionary_candidate_use_boundary_chain_mismatch_rows: Number(oldDictionaryCandidateUseBoundaryChainCrossmatch.counts?.token_mismatch_rows || 0) + Number(oldDictionaryCandidateUseBoundaryChainCrossmatch.counts?.occurrence_mismatch_rows || 0),
    old_dictionary_candidate_use_boundary_chain_current_transform_blockers: Number(oldDictionaryCandidateUseBoundaryChainCrossmatch.counts?.current_transform_blocker_rows || 0),
    old_dictionary_candidate_use_boundary_chain_zero_counter_violations: Number(oldDictionaryCandidateUseBoundaryChainCrossmatch.counts?.preboundary_row_zero_counter_violations || 0) + Number(oldDictionaryCandidateUseBoundaryChainCrossmatch.counts?.zero_text_row_zero_counter_violations || 0),
    old_dictionary_candidate_use_boundary_chain_copied_review_pointer_fields: Number(oldDictionaryCandidateUseBoundaryChainCrossmatch.counts?.copied_review_pointer_payload_fields || 0),
    old_dictionary_candidate_use_boundary_chain_transform_ready_rows: Number(oldDictionaryCandidateUseBoundaryChainCrossmatch.counts?.transform_ready_rows || 0),
    old_dictionary_candidate_use_boundary_chain_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseBoundaryChainCrossmatch.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_boundary_chain_acceptance_claims: Number(oldDictionaryCandidateUseBoundaryChainCrossmatch.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_source_citation_dependency_rows: Number(oldDictionaryCandidateUseSourceCitationDependencyCrossmatch.counts?.row_dependency_rows || 0),
    old_dictionary_candidate_use_source_citation_dependency_occurrences: Number(oldDictionaryCandidateUseSourceCitationDependencyCrossmatch.counts?.row_dependency_occurrences || 0),
    old_dictionary_candidate_use_source_citation_dependency_missing_citation_rows: Number(oldDictionaryCandidateUseSourceCitationDependencyCrossmatch.counts?.source_citation_missing_rows || 0),
    old_dictionary_candidate_use_source_citation_dependency_missing_transform_rule_rows: Number(oldDictionaryCandidateUseSourceCitationDependencyCrossmatch.counts?.transform_rule_missing_rows || 0),
    old_dictionary_candidate_use_source_citation_dependency_source_rid_refs: Number(oldDictionaryCandidateUseSourceCitationDependencyCrossmatch.counts?.source_rid_references || 0),
    old_dictionary_candidate_use_source_citation_dependency_unique_source_rids: Number(oldDictionaryCandidateUseSourceCitationDependencyCrossmatch.counts?.unique_source_rids || 0),
    old_dictionary_candidate_use_source_citation_dependency_exact_blockers: Number(oldDictionaryCandidateUseSourceCitationDependencyCrossmatch.counts?.exact_blocker_rows || 0),
    old_dictionary_candidate_use_source_citation_dependency_stale_agent1_route_blockers: Number(oldDictionaryCandidateUseSourceCitationDependencyCrossmatch.counts?.stale_agent1_route_blocker_rows || 0),
    old_dictionary_candidate_use_source_citation_dependency_transform_ready_rows: Number(oldDictionaryCandidateUseSourceCitationDependencyCrossmatch.counts?.transform_ready_rows || 0),
    old_dictionary_candidate_use_source_citation_dependency_source_acceptance_claims: Number(oldDictionaryCandidateUseSourceCitationDependencyCrossmatch.counts?.source_acceptance_claims || 0),
    old_dictionary_candidate_use_source_citation_dependency_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseSourceCitationDependencyCrossmatch.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_source_citation_dependency_acceptance_claims: Number(oldDictionaryCandidateUseSourceCitationDependencyCrossmatch.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_agent1_route_recheck_rows: Number(oldDictionaryCandidateUseAgent1RouteRecheckCrossmatch.counts?.route_recheck_rows || 0),
    old_dictionary_candidate_use_agent1_route_recheck_required_rows: Number(oldDictionaryCandidateUseAgent1RouteRecheckCrossmatch.counts?.route_recheck_required_rows || 0),
    old_dictionary_candidate_use_agent1_route_recheck_target_matches_registry_rows: Number(oldDictionaryCandidateUseAgent1RouteRecheckCrossmatch.counts?.attempted_target_matches_registry_rows || 0),
    old_dictionary_candidate_use_agent1_route_recheck_registry_postdates_blocker_rows: Number(oldDictionaryCandidateUseAgent1RouteRecheckCrossmatch.counts?.registry_postdates_route_blocker_rows || 0),
    old_dictionary_candidate_use_agent1_route_recheck_missing_citation_rows: Number(oldDictionaryCandidateUseAgent1RouteRecheckCrossmatch.counts?.source_citation_missing_rows || 0),
    old_dictionary_candidate_use_agent1_route_recheck_missing_transform_rule_rows: Number(oldDictionaryCandidateUseAgent1RouteRecheckCrossmatch.counts?.transform_rule_missing_rows || 0),
    old_dictionary_candidate_use_agent1_route_recheck_delivery_attempts_by_agent3: Number(oldDictionaryCandidateUseAgent1RouteRecheckCrossmatch.counts?.delivery_attempts_by_agent3 || 0),
    old_dictionary_candidate_use_agent1_route_recheck_transform_ready_rows: Number(oldDictionaryCandidateUseAgent1RouteRecheckCrossmatch.counts?.transform_ready_rows || 0),
    old_dictionary_candidate_use_agent1_route_recheck_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseAgent1RouteRecheckCrossmatch.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_agent1_route_recheck_acceptance_claims: Number(oldDictionaryCandidateUseAgent1RouteRecheckCrossmatch.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_gate_proof_coverage_rows: Number(oldDictionaryCandidateUseGateProofCoverageCrossmatch.counts?.coverage_rows || 0),
    old_dictionary_candidate_use_gate_proof_coverage_any_gate_rows: Number(oldDictionaryCandidateUseGateProofCoverageCrossmatch.counts?.rows_with_any_gate_proof || 0),
    old_dictionary_candidate_use_gate_proof_coverage_direct_rows: Number(oldDictionaryCandidateUseGateProofCoverageCrossmatch.counts?.direct_gate_proof_rows || 0),
    old_dictionary_candidate_use_gate_proof_coverage_aggregate_rows: Number(oldDictionaryCandidateUseGateProofCoverageCrossmatch.counts?.aggregate_handoff_gate_proof_rows || 0),
    old_dictionary_candidate_use_gate_proof_coverage_missing_rows: Number(oldDictionaryCandidateUseGateProofCoverageCrossmatch.counts?.missing_gate_proof_rows || 0),
    old_dictionary_candidate_use_gate_proof_coverage_exact_blockers: Number(oldDictionaryCandidateUseGateProofCoverageCrossmatch.counts?.exact_blocker_rows || 0),
    old_dictionary_candidate_use_gate_proof_coverage_authority_issues: Number(oldDictionaryCandidateUseGateProofCoverageCrossmatch.counts?.direct_gate_proof_authority_issue_rows || 0) + Number(oldDictionaryCandidateUseGateProofCoverageCrossmatch.counts?.agent3_authority_issue_rows || 0),
    old_dictionary_candidate_use_gate_proof_coverage_transform_ready_rows: Number(oldDictionaryCandidateUseGateProofCoverageCrossmatch.counts?.transform_ready_rows || 0),
    old_dictionary_candidate_use_current_blocker_rows: Number(oldDictionaryCandidateUseCurrentBlockerIndex.counts?.blocker_rows || 0),
    old_dictionary_candidate_use_current_blocker_observed_rows: Number(oldDictionaryCandidateUseCurrentBlockerIndex.counts?.observed_blocker_rows || 0),
    old_dictionary_candidate_use_current_blocker_unobserved_rows: Number(oldDictionaryCandidateUseCurrentBlockerIndex.counts?.unobserved_blocker_rows || 0),
    old_dictionary_candidate_use_current_blocker_affected_rows: Number(oldDictionaryCandidateUseCurrentBlockerIndex.counts?.affected_candidate_use_rows || 0),
    old_dictionary_candidate_use_current_blocker_affected_occurrences: Number(oldDictionaryCandidateUseCurrentBlockerIndex.counts?.affected_candidate_use_occurrences || 0),
    old_dictionary_candidate_use_current_blocker_missing_citation_rows: Number(oldDictionaryCandidateUseCurrentBlockerIndex.counts?.source_citation_missing_rows || 0),
    old_dictionary_candidate_use_current_blocker_missing_transform_rule_rows: Number(oldDictionaryCandidateUseCurrentBlockerIndex.counts?.transform_rule_missing_rows || 0),
    old_dictionary_candidate_use_current_blocker_gate_proof_missing_rows: Number(oldDictionaryCandidateUseCurrentBlockerIndex.counts?.gate_proof_missing_rows || 0),
    old_dictionary_candidate_use_current_blocker_route_recheck_required_rows: Number(oldDictionaryCandidateUseCurrentBlockerIndex.counts?.route_recheck_required_rows || 0),
    old_dictionary_candidate_use_current_blocker_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseCurrentBlockerIndex.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_current_blocker_acceptance_claims: Number(oldDictionaryCandidateUseCurrentBlockerIndex.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_current_blocker_release_actions: Number(oldDictionaryCandidateUseCurrentBlockerIndex.counts?.release_actions || 0),
    old_dictionary_candidate_use_row_blocker_matrix_rows: Number(oldDictionaryCandidateUseRowBlockerMatrix.counts?.row_blocker_matrix_rows || 0),
    old_dictionary_candidate_use_row_blocker_matrix_occurrences: Number(oldDictionaryCandidateUseRowBlockerMatrix.counts?.row_blocker_matrix_occurrences || 0),
    old_dictionary_candidate_use_row_blocker_matrix_links: Number(oldDictionaryCandidateUseRowBlockerMatrix.counts?.blocker_links || 0),
    old_dictionary_candidate_use_row_blocker_matrix_missing_citation_rows: Number(oldDictionaryCandidateUseRowBlockerMatrix.counts?.rows_missing_source_citation || 0),
    old_dictionary_candidate_use_row_blocker_matrix_missing_transform_rule_rows: Number(oldDictionaryCandidateUseRowBlockerMatrix.counts?.rows_missing_transform_rule || 0),
    old_dictionary_candidate_use_row_blocker_matrix_gate_boundary_rows: Number(oldDictionaryCandidateUseRowBlockerMatrix.counts?.rows_gate_proof_boundary_chain_missing || 0),
    old_dictionary_candidate_use_row_blocker_matrix_gate_source_rows: Number(oldDictionaryCandidateUseRowBlockerMatrix.counts?.rows_gate_proof_source_citation_dependency_missing || 0),
    old_dictionary_candidate_use_row_blocker_matrix_route_recheck_rows: Number(oldDictionaryCandidateUseRowBlockerMatrix.counts?.rows_route_recheck_required || 0),
    old_dictionary_candidate_use_row_blocker_matrix_pure_rows: Number(oldDictionaryCandidateUseRowBlockerMatrix.counts?.pure_partition_rows || 0),
    old_dictionary_candidate_use_row_blocker_matrix_overlap_rows: Number(oldDictionaryCandidateUseRowBlockerMatrix.counts?.overlap_partition_rows || 0),
    old_dictionary_candidate_use_row_blocker_matrix_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseRowBlockerMatrix.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_row_blocker_matrix_acceptance_claims: Number(oldDictionaryCandidateUseRowBlockerMatrix.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_row_blocker_matrix_release_actions: Number(oldDictionaryCandidateUseRowBlockerMatrix.counts?.release_actions || 0),
    old_dictionary_candidate_use_source_rid_blocker_rows: Number(oldDictionaryCandidateUseSourceRidBlockerMatrix.counts?.source_rid_rows || 0),
    old_dictionary_candidate_use_source_rid_blocker_references: Number(oldDictionaryCandidateUseSourceRidBlockerMatrix.counts?.source_rid_references || 0),
    old_dictionary_candidate_use_source_rid_blocker_prefixes: Number(oldDictionaryCandidateUseSourceRidBlockerMatrix.counts?.source_rid_prefix_rows || 0),
    old_dictionary_candidate_use_source_rid_blocker_unique_queue_ids: Number(oldDictionaryCandidateUseSourceRidBlockerMatrix.counts?.unique_queue_ids || 0),
    old_dictionary_candidate_use_source_rid_blocker_multi_queue_rows: Number(oldDictionaryCandidateUseSourceRidBlockerMatrix.counts?.source_rids_multi_queue || 0),
    old_dictionary_candidate_use_source_rid_blocker_links: Number(oldDictionaryCandidateUseSourceRidBlockerMatrix.counts?.blocker_links || 0),
    old_dictionary_candidate_use_source_rid_blocker_missing_citation_rows: Number(oldDictionaryCandidateUseSourceRidBlockerMatrix.counts?.rows_missing_source_citation || 0),
    old_dictionary_candidate_use_source_rid_blocker_missing_transform_rule_rows: Number(oldDictionaryCandidateUseSourceRidBlockerMatrix.counts?.rows_missing_transform_rule || 0),
    old_dictionary_candidate_use_source_rid_blocker_agent6_boundary_rows: Number(oldDictionaryCandidateUseSourceRidBlockerMatrix.counts?.rows_agent6_boundary_required || 0),
    old_dictionary_candidate_use_source_rid_blocker_gate_boundary_rows: Number(oldDictionaryCandidateUseSourceRidBlockerMatrix.counts?.rows_gate_proof_boundary_chain_missing || 0),
    old_dictionary_candidate_use_source_rid_blocker_gate_source_rows: Number(oldDictionaryCandidateUseSourceRidBlockerMatrix.counts?.rows_gate_proof_source_citation_dependency_missing || 0),
    old_dictionary_candidate_use_source_rid_blocker_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseSourceRidBlockerMatrix.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_source_rid_blocker_acceptance_claims: Number(oldDictionaryCandidateUseSourceRidBlockerMatrix.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_source_rid_blocker_release_actions: Number(oldDictionaryCandidateUseSourceRidBlockerMatrix.counts?.release_actions || 0),
    old_dictionary_candidate_use_source_citation_worklist_rows: Number(oldDictionaryCandidateUseSourceCitationEnrichmentWorklist.counts?.worklist_rows || 0),
    old_dictionary_candidate_use_source_citation_worklist_references: Number(oldDictionaryCandidateUseSourceCitationEnrichmentWorklist.counts?.source_rid_references || 0),
    old_dictionary_candidate_use_source_citation_worklist_prefixes: Number(oldDictionaryCandidateUseSourceCitationEnrichmentWorklist.counts?.source_rid_prefix_rows || 0),
    old_dictionary_candidate_use_source_citation_worklist_unique_queue_ids: Number(oldDictionaryCandidateUseSourceCitationEnrichmentWorklist.counts?.unique_queue_ids || 0),
    old_dictionary_candidate_use_source_citation_worklist_multi_queue_rows: Number(oldDictionaryCandidateUseSourceCitationEnrichmentWorklist.counts?.multi_queue_work_items || 0),
    old_dictionary_candidate_use_source_citation_worklist_cross_partition_rows: Number(oldDictionaryCandidateUseSourceCitationEnrichmentWorklist.counts?.cross_partition_work_items || 0),
    old_dictionary_candidate_use_source_citation_worklist_required_rows: Number(oldDictionaryCandidateUseSourceCitationEnrichmentWorklist.counts?.source_citation_required_rows || 0),
    old_dictionary_candidate_use_source_citation_worklist_transform_blocked_rows: Number(oldDictionaryCandidateUseSourceCitationEnrichmentWorklist.counts?.transform_rule_still_blocked_rows || 0),
    old_dictionary_candidate_use_source_citation_worklist_agent6_after_prereq_rows: Number(oldDictionaryCandidateUseSourceCitationEnrichmentWorklist.counts?.agent6_boundary_after_prereq_rows || 0),
    old_dictionary_candidate_use_source_citation_worklist_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseSourceCitationEnrichmentWorklist.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_source_citation_worklist_acceptance_claims: Number(oldDictionaryCandidateUseSourceCitationEnrichmentWorklist.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_source_citation_worklist_release_actions: Number(oldDictionaryCandidateUseSourceCitationEnrichmentWorklist.counts?.release_actions || 0),
    old_dictionary_candidate_use_source_citation_batch_rows: Number(oldDictionaryCandidateUseSourceCitationBatchMatrix.counts?.batch_rows || 0),
    old_dictionary_candidate_use_source_citation_batch_memberships: Number(oldDictionaryCandidateUseSourceCitationBatchMatrix.counts?.source_rid_batch_memberships || 0),
    old_dictionary_candidate_use_source_citation_batch_unique_source_rids: Number(oldDictionaryCandidateUseSourceCitationBatchMatrix.counts?.unique_source_rids || 0),
    old_dictionary_candidate_use_source_citation_batch_source_families: Number(oldDictionaryCandidateUseSourceCitationBatchMatrix.counts?.source_family_count || 0),
    old_dictionary_candidate_use_source_citation_batch_partitions: Number(oldDictionaryCandidateUseSourceCitationBatchMatrix.counts?.partition_count || 0),
    old_dictionary_candidate_use_source_citation_batch_triage_groups: Number(oldDictionaryCandidateUseSourceCitationBatchMatrix.counts?.triage_group_count || 0),
    old_dictionary_candidate_use_source_citation_batch_impact_buckets: Number(oldDictionaryCandidateUseSourceCitationBatchMatrix.counts?.mechanical_impact_bucket_count || 0),
    old_dictionary_candidate_use_source_citation_batch_required_memberships: Number(oldDictionaryCandidateUseSourceCitationBatchMatrix.counts?.source_citation_required_memberships || 0),
    old_dictionary_candidate_use_source_citation_batch_transform_blocked_memberships: Number(oldDictionaryCandidateUseSourceCitationBatchMatrix.counts?.transform_rule_still_blocked_memberships || 0),
    old_dictionary_candidate_use_source_citation_batch_agent6_after_prereq_memberships: Number(oldDictionaryCandidateUseSourceCitationBatchMatrix.counts?.agent6_boundary_after_prereq_memberships || 0),
    old_dictionary_candidate_use_source_citation_batch_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseSourceCitationBatchMatrix.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_source_citation_batch_acceptance_claims: Number(oldDictionaryCandidateUseSourceCitationBatchMatrix.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_source_citation_batch_release_actions: Number(oldDictionaryCandidateUseSourceCitationBatchMatrix.counts?.release_actions || 0),
    old_dictionary_candidate_use_source_citation_prefix_rows: Number(oldDictionaryCandidateUseSourceCitationPrefixMatrix.counts?.prefix_family_rows || 0),
    old_dictionary_candidate_use_source_citation_prefix_summary_rows: Number(oldDictionaryCandidateUseSourceCitationPrefixMatrix.counts?.prefix_summary_rows || 0),
    old_dictionary_candidate_use_source_citation_prefix_memberships: Number(oldDictionaryCandidateUseSourceCitationPrefixMatrix.counts?.source_rid_family_memberships || 0),
    old_dictionary_candidate_use_source_citation_prefix_unique_source_rids: Number(oldDictionaryCandidateUseSourceCitationPrefixMatrix.counts?.unique_source_rids || 0),
    old_dictionary_candidate_use_source_citation_prefix_unique_prefixes: Number(oldDictionaryCandidateUseSourceCitationPrefixMatrix.counts?.unique_prefixes || 0),
    old_dictionary_candidate_use_source_citation_prefix_source_families: Number(oldDictionaryCandidateUseSourceCitationPrefixMatrix.counts?.unique_source_families || 0),
    old_dictionary_candidate_use_source_citation_prefix_multi_family_prefixes: Number(oldDictionaryCandidateUseSourceCitationPrefixMatrix.counts?.multi_family_prefixes || 0),
    old_dictionary_candidate_use_source_citation_prefix_multi_family_memberships: Number(oldDictionaryCandidateUseSourceCitationPrefixMatrix.counts?.source_rids_with_multi_family_memberships || 0),
    old_dictionary_candidate_use_source_citation_prefix_required_memberships: Number(oldDictionaryCandidateUseSourceCitationPrefixMatrix.counts?.source_citation_required_memberships || 0),
    old_dictionary_candidate_use_source_citation_prefix_transform_blocked_memberships: Number(oldDictionaryCandidateUseSourceCitationPrefixMatrix.counts?.transform_rule_still_blocked_memberships || 0),
    old_dictionary_candidate_use_source_citation_prefix_agent6_after_prereq_memberships: Number(oldDictionaryCandidateUseSourceCitationPrefixMatrix.counts?.agent6_boundary_after_prereq_memberships || 0),
    old_dictionary_candidate_use_source_citation_prefix_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseSourceCitationPrefixMatrix.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_source_citation_prefix_acceptance_claims: Number(oldDictionaryCandidateUseSourceCitationPrefixMatrix.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_source_citation_prefix_release_actions: Number(oldDictionaryCandidateUseSourceCitationPrefixMatrix.counts?.release_actions || 0),
    old_dictionary_candidate_use_agent6_boundary_prereq_rows: Number(oldDictionaryCandidateUseAgent6SourceFamilyBoundaryPrereqMatrix.counts?.boundary_rows || 0),
    old_dictionary_candidate_use_agent6_boundary_prereq_prefix_rows: Number(oldDictionaryCandidateUseAgent6SourceFamilyBoundaryPrereqMatrix.counts?.prefix_rows || 0),
    old_dictionary_candidate_use_agent6_boundary_prereq_occurrences: Number(oldDictionaryCandidateUseAgent6SourceFamilyBoundaryPrereqMatrix.counts?.occurrence_total || 0),
    old_dictionary_candidate_use_agent6_boundary_prereq_unique_queue_ids: Number(oldDictionaryCandidateUseAgent6SourceFamilyBoundaryPrereqMatrix.counts?.unique_queue_ids || 0),
    old_dictionary_candidate_use_agent6_boundary_prereq_unique_token_ids: Number(oldDictionaryCandidateUseAgent6SourceFamilyBoundaryPrereqMatrix.counts?.unique_token_ids || 0),
    old_dictionary_candidate_use_agent6_boundary_prereq_source_family_count: Number(oldDictionaryCandidateUseAgent6SourceFamilyBoundaryPrereqMatrix.counts?.source_family_count || 0),
    old_dictionary_candidate_use_agent6_boundary_prereq_citation_required_rows: Number(oldDictionaryCandidateUseAgent6SourceFamilyBoundaryPrereqMatrix.counts?.source_citation_required_rows || 0),
    old_dictionary_candidate_use_agent6_boundary_prereq_transform_blocked_rows: Number(oldDictionaryCandidateUseAgent6SourceFamilyBoundaryPrereqMatrix.counts?.transform_rule_still_blocked_rows || 0),
    old_dictionary_candidate_use_agent6_boundary_prereq_after_prereq_rows: Number(oldDictionaryCandidateUseAgent6SourceFamilyBoundaryPrereqMatrix.counts?.agent6_boundary_after_prereq_rows || 0),
    old_dictionary_candidate_use_agent6_boundary_prereq_ready_now_rows: Number(oldDictionaryCandidateUseAgent6SourceFamilyBoundaryPrereqMatrix.counts?.agent6_boundary_ready_now_rows || 0),
    old_dictionary_candidate_use_agent6_boundary_prereq_selection_claims: Number(oldDictionaryCandidateUseAgent6SourceFamilyBoundaryPrereqMatrix.counts?.source_family_selection_claims || 0),
    old_dictionary_candidate_use_agent6_boundary_prereq_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseAgent6SourceFamilyBoundaryPrereqMatrix.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_agent6_boundary_prereq_acceptance_claims: Number(oldDictionaryCandidateUseAgent6SourceFamilyBoundaryPrereqMatrix.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_agent6_boundary_prereq_release_actions: Number(oldDictionaryCandidateUseAgent6SourceFamilyBoundaryPrereqMatrix.counts?.release_actions || 0),
    old_dictionary_candidate_use_direct_source_citation_rows: Number(oldDictionaryCandidateUseDirectSourceCitationPrereqMatrix.counts?.direct_rows || 0),
    old_dictionary_candidate_use_direct_source_citation_excluded_source_family_boundary_rows: Number(oldDictionaryCandidateUseDirectSourceCitationPrereqMatrix.counts?.excluded_source_family_selection_boundary_rows || 0),
    old_dictionary_candidate_use_direct_source_citation_excluded_agent6_prereq_rows: Number(oldDictionaryCandidateUseDirectSourceCitationPrereqMatrix.counts?.excluded_agent6_source_family_boundary_rows || 0),
    old_dictionary_candidate_use_direct_source_citation_occurrences: Number(oldDictionaryCandidateUseDirectSourceCitationPrereqMatrix.counts?.occurrence_total || 0),
    old_dictionary_candidate_use_direct_source_citation_prefix_rows: Number(oldDictionaryCandidateUseDirectSourceCitationPrereqMatrix.counts?.prefix_rows || 0),
    old_dictionary_candidate_use_direct_source_citation_source_family_rows: Number(oldDictionaryCandidateUseDirectSourceCitationPrereqMatrix.counts?.source_family_rows || 0),
    old_dictionary_candidate_use_direct_source_citation_citation_required_rows: Number(oldDictionaryCandidateUseDirectSourceCitationPrereqMatrix.counts?.source_citation_required_rows || 0),
    old_dictionary_candidate_use_direct_source_citation_transform_blocked_rows: Number(oldDictionaryCandidateUseDirectSourceCitationPrereqMatrix.counts?.transform_rule_still_blocked_rows || 0),
    old_dictionary_candidate_use_direct_source_citation_after_prereq_rows: Number(oldDictionaryCandidateUseDirectSourceCitationPrereqMatrix.counts?.agent6_boundary_after_prereq_rows || 0),
    old_dictionary_candidate_use_direct_source_citation_source_family_blocker_rows: Number(oldDictionaryCandidateUseDirectSourceCitationPrereqMatrix.counts?.source_family_selection_boundary_blocker_rows || 0),
    old_dictionary_candidate_use_direct_source_citation_selection_claims: Number(oldDictionaryCandidateUseDirectSourceCitationPrereqMatrix.counts?.source_family_selection_claims || 0),
    old_dictionary_candidate_use_direct_source_citation_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseDirectSourceCitationPrereqMatrix.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_direct_source_citation_acceptance_claims: Number(oldDictionaryCandidateUseDirectSourceCitationPrereqMatrix.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_direct_source_citation_release_actions: Number(oldDictionaryCandidateUseDirectSourceCitationPrereqMatrix.counts?.release_actions || 0),
    old_dictionary_candidate_use_source_family_selection_exclusion_rows: Number(oldDictionaryCandidateUseSourceFamilySelectionExclusionInventory.counts?.excluded_rows || 0),
    old_dictionary_candidate_use_source_family_selection_exclusion_direct_rows: Number(oldDictionaryCandidateUseSourceFamilySelectionExclusionInventory.counts?.direct_non_excluded_rows || 0),
    old_dictionary_candidate_use_source_family_selection_exclusion_agent6_covered_rows: Number(oldDictionaryCandidateUseSourceFamilySelectionExclusionInventory.counts?.agent6_prereq_covered_rows || 0),
    old_dictionary_candidate_use_source_family_selection_exclusion_unpacketized_rows: Number(oldDictionaryCandidateUseSourceFamilySelectionExclusionInventory.counts?.source_family_selection_not_in_agent6_prereq_rows || 0),
    old_dictionary_candidate_use_source_family_selection_exclusion_occurrences: Number(oldDictionaryCandidateUseSourceFamilySelectionExclusionInventory.counts?.occurrence_total || 0),
    old_dictionary_candidate_use_source_family_selection_exclusion_prefix_rows: Number(oldDictionaryCandidateUseSourceFamilySelectionExclusionInventory.counts?.prefix_rows || 0),
    old_dictionary_candidate_use_source_family_selection_exclusion_classification_rows: Number(oldDictionaryCandidateUseSourceFamilySelectionExclusionInventory.counts?.classification_rows || 0),
    old_dictionary_candidate_use_source_family_selection_exclusion_citation_required_rows: Number(oldDictionaryCandidateUseSourceFamilySelectionExclusionInventory.counts?.source_citation_required_rows || 0),
    old_dictionary_candidate_use_source_family_selection_exclusion_transform_blocked_rows: Number(oldDictionaryCandidateUseSourceFamilySelectionExclusionInventory.counts?.transform_rule_still_blocked_rows || 0),
    old_dictionary_candidate_use_source_family_selection_exclusion_after_prereq_rows: Number(oldDictionaryCandidateUseSourceFamilySelectionExclusionInventory.counts?.agent6_boundary_after_prereq_rows || 0),
    old_dictionary_candidate_use_source_family_selection_exclusion_blocker_rows: Number(oldDictionaryCandidateUseSourceFamilySelectionExclusionInventory.counts?.source_family_selection_boundary_blocker_rows || 0),
    old_dictionary_candidate_use_source_family_selection_exclusion_selection_claims: Number(oldDictionaryCandidateUseSourceFamilySelectionExclusionInventory.counts?.source_family_selection_claims || 0),
    old_dictionary_candidate_use_source_family_selection_exclusion_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseSourceFamilySelectionExclusionInventory.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_source_family_selection_exclusion_acceptance_claims: Number(oldDictionaryCandidateUseSourceFamilySelectionExclusionInventory.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_source_family_selection_exclusion_release_actions: Number(oldDictionaryCandidateUseSourceFamilySelectionExclusionInventory.counts?.release_actions || 0),
    old_dictionary_candidate_use_unpacketized_source_family_selection_rows: Number(oldDictionaryCandidateUseUnpacketizedSourceFamilySelectionWorkset.counts?.workset_rows || 0),
    old_dictionary_candidate_use_unpacketized_source_family_selection_occurrences: Number(oldDictionaryCandidateUseUnpacketizedSourceFamilySelectionWorkset.counts?.occurrence_total || 0),
    old_dictionary_candidate_use_unpacketized_source_family_selection_source_rid_refs: Number(oldDictionaryCandidateUseUnpacketizedSourceFamilySelectionWorkset.counts?.source_rid_references || 0),
    old_dictionary_candidate_use_unpacketized_source_family_selection_prefixes: Number(oldDictionaryCandidateUseUnpacketizedSourceFamilySelectionWorkset.counts?.unique_source_rid_prefixes || 0),
    old_dictionary_candidate_use_unpacketized_source_family_selection_queue_ids: Number(oldDictionaryCandidateUseUnpacketizedSourceFamilySelectionWorkset.counts?.unique_queue_ids || 0),
    old_dictionary_candidate_use_unpacketized_source_family_selection_token_ids: Number(oldDictionaryCandidateUseUnpacketizedSourceFamilySelectionWorkset.counts?.unique_token_ids || 0),
    old_dictionary_candidate_use_unpacketized_source_family_selection_family_signatures: Number(oldDictionaryCandidateUseUnpacketizedSourceFamilySelectionWorkset.counts?.source_family_signature_rows || 0),
    old_dictionary_candidate_use_unpacketized_source_family_selection_triage_signatures: Number(oldDictionaryCandidateUseUnpacketizedSourceFamilySelectionWorkset.counts?.triage_signature_rows || 0),
    old_dictionary_candidate_use_unpacketized_source_family_selection_impact_buckets: Number(oldDictionaryCandidateUseUnpacketizedSourceFamilySelectionWorkset.counts?.impact_bucket_rows || 0),
    old_dictionary_candidate_use_unpacketized_source_family_selection_partition_signatures: Number(oldDictionaryCandidateUseUnpacketizedSourceFamilySelectionWorkset.counts?.partition_signature_rows || 0),
    old_dictionary_candidate_use_unpacketized_source_family_selection_citation_required_rows: Number(oldDictionaryCandidateUseUnpacketizedSourceFamilySelectionWorkset.counts?.source_citation_required_rows || 0),
    old_dictionary_candidate_use_unpacketized_source_family_selection_transform_blocked_rows: Number(oldDictionaryCandidateUseUnpacketizedSourceFamilySelectionWorkset.counts?.transform_rule_still_blocked_rows || 0),
    old_dictionary_candidate_use_unpacketized_source_family_selection_after_prereq_rows: Number(oldDictionaryCandidateUseUnpacketizedSourceFamilySelectionWorkset.counts?.agent6_boundary_after_prereq_rows || 0),
    old_dictionary_candidate_use_unpacketized_source_family_selection_existing_packet_rows: Number(oldDictionaryCandidateUseUnpacketizedSourceFamilySelectionWorkset.counts?.source_family_boundary_packet_exists_rows || 0),
    old_dictionary_candidate_use_unpacketized_source_family_selection_blocker_rows: Number(oldDictionaryCandidateUseUnpacketizedSourceFamilySelectionWorkset.counts?.source_family_selection_boundary_blocker_rows || 0),
    old_dictionary_candidate_use_unpacketized_source_family_selection_selection_claims: Number(oldDictionaryCandidateUseUnpacketizedSourceFamilySelectionWorkset.counts?.source_family_selection_claims || 0),
    old_dictionary_candidate_use_unpacketized_source_family_selection_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseUnpacketizedSourceFamilySelectionWorkset.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_unpacketized_source_family_selection_acceptance_claims: Number(oldDictionaryCandidateUseUnpacketizedSourceFamilySelectionWorkset.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_unpacketized_source_family_selection_release_actions: Number(oldDictionaryCandidateUseUnpacketizedSourceFamilySelectionWorkset.counts?.release_actions || 0),
    old_dictionary_candidate_use_source_family_selection_batch_plan_batches: Number(oldDictionaryCandidateUseSourceFamilySelectionBatchPlan.counts?.batch_rows || 0),
    old_dictionary_candidate_use_source_family_selection_batch_plan_rows: Number(oldDictionaryCandidateUseSourceFamilySelectionBatchPlan.counts?.input_workset_rows || 0),
    old_dictionary_candidate_use_source_family_selection_batch_plan_multi_single_batches: `${Number(oldDictionaryCandidateUseSourceFamilySelectionBatchPlan.counts?.multi_row_batches || 0)}-${Number(oldDictionaryCandidateUseSourceFamilySelectionBatchPlan.counts?.single_row_batches || 0)}`,
    old_dictionary_candidate_use_source_family_selection_batch_plan_refs: Number(oldDictionaryCandidateUseSourceFamilySelectionBatchPlan.counts?.source_rid_references || 0),
    old_dictionary_candidate_use_source_family_selection_batch_plan_occurrences: Number(oldDictionaryCandidateUseSourceFamilySelectionBatchPlan.counts?.occurrence_total || 0),
    old_dictionary_candidate_use_source_family_selection_batch_plan_max_rows: Number(oldDictionaryCandidateUseSourceFamilySelectionBatchPlan.counts?.max_batch_rows || 0),
    old_dictionary_candidate_use_source_family_selection_batch_plan_max_occurrences: Number(oldDictionaryCandidateUseSourceFamilySelectionBatchPlan.counts?.max_batch_occurrences || 0),
    old_dictionary_candidate_use_source_family_selection_batch_plan_signatures: `${Number(oldDictionaryCandidateUseSourceFamilySelectionBatchPlan.counts?.source_family_signature_rows || 0)}-${Number(oldDictionaryCandidateUseSourceFamilySelectionBatchPlan.counts?.triage_signature_rows || 0)}-${Number(oldDictionaryCandidateUseSourceFamilySelectionBatchPlan.counts?.impact_bucket_rows || 0)}-${Number(oldDictionaryCandidateUseSourceFamilySelectionBatchPlan.counts?.partition_signature_rows || 0)}`,
    old_dictionary_candidate_use_source_family_selection_batch_plan_citation_required_rows: Number(oldDictionaryCandidateUseSourceFamilySelectionBatchPlan.counts?.source_citation_required_rows || 0),
    old_dictionary_candidate_use_source_family_selection_batch_plan_transform_blocked_rows: Number(oldDictionaryCandidateUseSourceFamilySelectionBatchPlan.counts?.transform_rule_still_blocked_rows || 0),
    old_dictionary_candidate_use_source_family_selection_batch_plan_after_prereq_rows: Number(oldDictionaryCandidateUseSourceFamilySelectionBatchPlan.counts?.agent6_boundary_after_prereq_rows || 0),
    old_dictionary_candidate_use_source_family_selection_batch_plan_existing_packet_rows: Number(oldDictionaryCandidateUseSourceFamilySelectionBatchPlan.counts?.source_family_boundary_packet_exists_rows || 0),
    old_dictionary_candidate_use_source_family_selection_batch_plan_blocker_rows: Number(oldDictionaryCandidateUseSourceFamilySelectionBatchPlan.counts?.source_family_selection_boundary_blocker_rows || 0),
    old_dictionary_candidate_use_source_family_selection_batch_plan_selection_claims: Number(oldDictionaryCandidateUseSourceFamilySelectionBatchPlan.counts?.source_family_selection_claims || 0),
    old_dictionary_candidate_use_source_family_selection_batch_plan_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseSourceFamilySelectionBatchPlan.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_source_family_selection_batch_plan_acceptance_claims: Number(oldDictionaryCandidateUseSourceFamilySelectionBatchPlan.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_source_family_selection_batch_plan_release_actions: Number(oldDictionaryCandidateUseSourceFamilySelectionBatchPlan.counts?.release_actions || 0),
    old_dictionary_candidate_use_source_family_selection_queue_batch_rows: Number(oldDictionaryCandidateUseSourceFamilySelectionQueueBatchCrossmatch.counts?.queue_rows || 0),
    old_dictionary_candidate_use_source_family_selection_queue_batch_links: Number(oldDictionaryCandidateUseSourceFamilySelectionQueueBatchCrossmatch.counts?.queue_source_rid_links || 0),
    old_dictionary_candidate_use_source_family_selection_queue_batch_batch_queue_links: Number(oldDictionaryCandidateUseSourceFamilySelectionQueueBatchCrossmatch.counts?.batch_queue_links || 0),
    old_dictionary_candidate_use_source_family_selection_queue_batch_source_batch_pairs: Number(oldDictionaryCandidateUseSourceFamilySelectionQueueBatchCrossmatch.counts?.source_batch_pairs || 0),
    old_dictionary_candidate_use_source_family_selection_queue_batch_cross_single: `${Number(oldDictionaryCandidateUseSourceFamilySelectionQueueBatchCrossmatch.counts?.cross_batch_queue_rows || 0)}-${Number(oldDictionaryCandidateUseSourceFamilySelectionQueueBatchCrossmatch.counts?.single_batch_queue_rows || 0)}`,
    old_dictionary_candidate_use_source_family_selection_queue_batch_multi_single_source: `${Number(oldDictionaryCandidateUseSourceFamilySelectionQueueBatchCrossmatch.counts?.multi_source_queue_rows || 0)}-${Number(oldDictionaryCandidateUseSourceFamilySelectionQueueBatchCrossmatch.counts?.single_source_queue_rows || 0)}`,
    old_dictionary_candidate_use_source_family_selection_queue_batch_multi_queue_source_rids: Number(oldDictionaryCandidateUseSourceFamilySelectionQueueBatchCrossmatch.counts?.multi_queue_source_rids || 0),
    old_dictionary_candidate_use_source_family_selection_queue_batch_max_batches_sources_occurrences: `${Number(oldDictionaryCandidateUseSourceFamilySelectionQueueBatchCrossmatch.counts?.max_queue_batch_count || 0)}-${Number(oldDictionaryCandidateUseSourceFamilySelectionQueueBatchCrossmatch.counts?.max_queue_source_rid_count || 0)}-${Number(oldDictionaryCandidateUseSourceFamilySelectionQueueBatchCrossmatch.counts?.max_queue_occurrence_total || 0)}`,
    old_dictionary_candidate_use_source_family_selection_queue_batch_ref_occurrence_memberships: `${Number(oldDictionaryCandidateUseSourceFamilySelectionQueueBatchCrossmatch.counts?.queue_reference_memberships || 0)}-${Number(oldDictionaryCandidateUseSourceFamilySelectionQueueBatchCrossmatch.counts?.queue_occurrence_memberships || 0)}`,
    old_dictionary_candidate_use_source_family_selection_queue_batch_citation_required_links: Number(oldDictionaryCandidateUseSourceFamilySelectionQueueBatchCrossmatch.counts?.source_citation_required_links || 0),
    old_dictionary_candidate_use_source_family_selection_queue_batch_transform_blocked_links: Number(oldDictionaryCandidateUseSourceFamilySelectionQueueBatchCrossmatch.counts?.transform_rule_still_blocked_links || 0),
    old_dictionary_candidate_use_source_family_selection_queue_batch_after_prereq_links: Number(oldDictionaryCandidateUseSourceFamilySelectionQueueBatchCrossmatch.counts?.agent6_boundary_after_prereq_links || 0),
    old_dictionary_candidate_use_source_family_selection_queue_batch_existing_packet_links: Number(oldDictionaryCandidateUseSourceFamilySelectionQueueBatchCrossmatch.counts?.source_family_boundary_packet_exists_links || 0),
    old_dictionary_candidate_use_source_family_selection_queue_batch_blocker_links: Number(oldDictionaryCandidateUseSourceFamilySelectionQueueBatchCrossmatch.counts?.source_family_selection_boundary_blocker_links || 0),
    old_dictionary_candidate_use_source_family_selection_queue_batch_selection_claims: Number(oldDictionaryCandidateUseSourceFamilySelectionQueueBatchCrossmatch.counts?.source_family_selection_claims || 0),
    old_dictionary_candidate_use_source_family_selection_queue_batch_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseSourceFamilySelectionQueueBatchCrossmatch.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_source_family_selection_queue_batch_acceptance_claims: Number(oldDictionaryCandidateUseSourceFamilySelectionQueueBatchCrossmatch.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_source_family_selection_queue_batch_release_actions: Number(oldDictionaryCandidateUseSourceFamilySelectionQueueBatchCrossmatch.counts?.release_actions || 0),
    old_dictionary_candidate_use_cross_batch_queue_guard_rows: Number(oldDictionaryCandidateUseCrossBatchQueueGuard.counts?.guard_rows || 0),
    old_dictionary_candidate_use_cross_batch_queue_guard_links: Number(oldDictionaryCandidateUseCrossBatchQueueGuard.counts?.queue_source_links || 0),
    old_dictionary_candidate_use_cross_batch_queue_guard_batch_links: Number(oldDictionaryCandidateUseCrossBatchQueueGuard.counts?.batch_queue_links || 0),
    old_dictionary_candidate_use_cross_batch_queue_guard_source_rids: Number(oldDictionaryCandidateUseCrossBatchQueueGuard.counts?.unique_source_rids || 0),
    old_dictionary_candidate_use_cross_batch_queue_guard_queue_token_batch_ids: `${Number(oldDictionaryCandidateUseCrossBatchQueueGuard.counts?.unique_queue_ids || 0)}-${Number(oldDictionaryCandidateUseCrossBatchQueueGuard.counts?.unique_token_ids || 0)}-${Number(oldDictionaryCandidateUseCrossBatchQueueGuard.counts?.unique_batch_ids || 0)}`,
    old_dictionary_candidate_use_cross_batch_queue_guard_three_two: `${Number(oldDictionaryCandidateUseCrossBatchQueueGuard.counts?.three_batch_queue_rows || 0)}-${Number(oldDictionaryCandidateUseCrossBatchQueueGuard.counts?.two_batch_queue_rows || 0)}`,
    old_dictionary_candidate_use_cross_batch_queue_guard_max_batch_source_occurrence: `${Number(oldDictionaryCandidateUseCrossBatchQueueGuard.counts?.max_queue_batch_count || 0)}-${Number(oldDictionaryCandidateUseCrossBatchQueueGuard.counts?.max_queue_source_rid_count || 0)}-${Number(oldDictionaryCandidateUseCrossBatchQueueGuard.counts?.max_queue_occurrence_total || 0)}`,
    old_dictionary_candidate_use_cross_batch_queue_guard_ref_occurrences: `${Number(oldDictionaryCandidateUseCrossBatchQueueGuard.counts?.reference_total || 0)}-${Number(oldDictionaryCandidateUseCrossBatchQueueGuard.counts?.occurrence_total || 0)}`,
    old_dictionary_candidate_use_cross_batch_queue_guard_summaries: `${Number(oldDictionaryCandidateUseCrossBatchQueueGuard.counts?.batch_guard_rows || 0)}-${Number(oldDictionaryCandidateUseCrossBatchQueueGuard.counts?.source_family_signature_rows || 0)}-${Number(oldDictionaryCandidateUseCrossBatchQueueGuard.counts?.triage_signature_rows || 0)}-${Number(oldDictionaryCandidateUseCrossBatchQueueGuard.counts?.impact_bucket_rows || 0)}`,
    old_dictionary_candidate_use_cross_batch_queue_guard_citation_required_links: Number(oldDictionaryCandidateUseCrossBatchQueueGuard.counts?.source_citation_required_links || 0),
    old_dictionary_candidate_use_cross_batch_queue_guard_transform_blocked_links: Number(oldDictionaryCandidateUseCrossBatchQueueGuard.counts?.transform_rule_still_blocked_links || 0),
    old_dictionary_candidate_use_cross_batch_queue_guard_after_prereq_links: Number(oldDictionaryCandidateUseCrossBatchQueueGuard.counts?.agent6_boundary_after_prereq_links || 0),
    old_dictionary_candidate_use_cross_batch_queue_guard_existing_packet_links: Number(oldDictionaryCandidateUseCrossBatchQueueGuard.counts?.source_family_boundary_packet_exists_links || 0),
    old_dictionary_candidate_use_cross_batch_queue_guard_blocker_links: Number(oldDictionaryCandidateUseCrossBatchQueueGuard.counts?.source_family_selection_boundary_blocker_links || 0),
    old_dictionary_candidate_use_cross_batch_queue_guard_selection_claims: Number(oldDictionaryCandidateUseCrossBatchQueueGuard.counts?.source_family_selection_claims || 0),
    old_dictionary_candidate_use_cross_batch_queue_guard_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseCrossBatchQueueGuard.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_cross_batch_queue_guard_acceptance_claims: Number(oldDictionaryCandidateUseCrossBatchQueueGuard.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_cross_batch_queue_guard_release_actions: Number(oldDictionaryCandidateUseCrossBatchQueueGuard.counts?.release_actions || 0),
    old_dictionary_candidate_use_single_batch_queue_workset_rows: Number(oldDictionaryCandidateUseSingleBatchQueueWorkset.counts?.workset_rows || 0),
    old_dictionary_candidate_use_single_batch_queue_workset_links: Number(oldDictionaryCandidateUseSingleBatchQueueWorkset.counts?.queue_source_links || 0),
    old_dictionary_candidate_use_single_batch_queue_workset_batch_links: Number(oldDictionaryCandidateUseSingleBatchQueueWorkset.counts?.batch_queue_links || 0),
    old_dictionary_candidate_use_single_batch_queue_workset_source_rids: Number(oldDictionaryCandidateUseSingleBatchQueueWorkset.counts?.unique_source_rids || 0),
    old_dictionary_candidate_use_single_batch_queue_workset_queue_token_batch_ids: `${Number(oldDictionaryCandidateUseSingleBatchQueueWorkset.counts?.unique_queue_ids || 0)}-${Number(oldDictionaryCandidateUseSingleBatchQueueWorkset.counts?.unique_token_ids || 0)}-${Number(oldDictionaryCandidateUseSingleBatchQueueWorkset.counts?.unique_batch_ids || 0)}`,
    old_dictionary_candidate_use_single_batch_queue_workset_multi_single_cross: `${Number(oldDictionaryCandidateUseSingleBatchQueueWorkset.counts?.multi_source_queue_rows || 0)}-${Number(oldDictionaryCandidateUseSingleBatchQueueWorkset.counts?.single_source_queue_rows || 0)}-${Number(oldDictionaryCandidateUseSingleBatchQueueWorkset.counts?.cross_batch_queue_rows || 0)}`,
    old_dictionary_candidate_use_single_batch_queue_workset_max_source_occurrence: `${Number(oldDictionaryCandidateUseSingleBatchQueueWorkset.counts?.max_queue_source_rid_count || 0)}-${Number(oldDictionaryCandidateUseSingleBatchQueueWorkset.counts?.max_queue_occurrence_total || 0)}`,
    old_dictionary_candidate_use_single_batch_queue_workset_ref_occurrences: `${Number(oldDictionaryCandidateUseSingleBatchQueueWorkset.counts?.reference_total || 0)}-${Number(oldDictionaryCandidateUseSingleBatchQueueWorkset.counts?.occurrence_total || 0)}`,
    old_dictionary_candidate_use_single_batch_queue_workset_summaries: `${Number(oldDictionaryCandidateUseSingleBatchQueueWorkset.counts?.batch_rows || 0)}-${Number(oldDictionaryCandidateUseSingleBatchQueueWorkset.counts?.source_family_signature_rows || 0)}-${Number(oldDictionaryCandidateUseSingleBatchQueueWorkset.counts?.triage_signature_rows || 0)}-${Number(oldDictionaryCandidateUseSingleBatchQueueWorkset.counts?.impact_bucket_rows || 0)}`,
    old_dictionary_candidate_use_single_batch_queue_workset_citation_required_links: Number(oldDictionaryCandidateUseSingleBatchQueueWorkset.counts?.source_citation_required_links || 0),
    old_dictionary_candidate_use_single_batch_queue_workset_transform_blocked_links: Number(oldDictionaryCandidateUseSingleBatchQueueWorkset.counts?.transform_rule_still_blocked_links || 0),
    old_dictionary_candidate_use_single_batch_queue_workset_after_prereq_links: Number(oldDictionaryCandidateUseSingleBatchQueueWorkset.counts?.agent6_boundary_after_prereq_links || 0),
    old_dictionary_candidate_use_single_batch_queue_workset_existing_packet_links: Number(oldDictionaryCandidateUseSingleBatchQueueWorkset.counts?.source_family_boundary_packet_exists_links || 0),
    old_dictionary_candidate_use_single_batch_queue_workset_blocker_links: Number(oldDictionaryCandidateUseSingleBatchQueueWorkset.counts?.source_family_selection_boundary_blocker_links || 0),
    old_dictionary_candidate_use_single_batch_queue_workset_selection_claims: Number(oldDictionaryCandidateUseSingleBatchQueueWorkset.counts?.source_family_selection_claims || 0),
    old_dictionary_candidate_use_single_batch_queue_workset_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseSingleBatchQueueWorkset.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_single_batch_queue_workset_acceptance_claims: Number(oldDictionaryCandidateUseSingleBatchQueueWorkset.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_single_batch_queue_workset_release_actions: Number(oldDictionaryCandidateUseSingleBatchQueueWorkset.counts?.release_actions || 0),
    old_dictionary_candidate_use_queue_partition_closure_partitions: Number(oldDictionaryCandidateUseQueuePartitionClosure.counts?.queue_partition_rows || 0),
    old_dictionary_candidate_use_queue_partition_closure_queues: `${Number(oldDictionaryCandidateUseQueuePartitionClosure.counts?.input_queue_rows || 0)}-${Number(oldDictionaryCandidateUseQueuePartitionClosure.counts?.cross_batch_queue_rows || 0)}-${Number(oldDictionaryCandidateUseQueuePartitionClosure.counts?.single_batch_queue_rows || 0)}-${Number(oldDictionaryCandidateUseQueuePartitionClosure.counts?.queue_union_rows || 0)}`,
    old_dictionary_candidate_use_queue_partition_closure_queue_overlap_missing_extra: `${Number(oldDictionaryCandidateUseQueuePartitionClosure.counts?.queue_overlap_rows || 0)}-${Number(oldDictionaryCandidateUseQueuePartitionClosure.counts?.queue_missing_rows || 0)}-${Number(oldDictionaryCandidateUseQueuePartitionClosure.counts?.queue_extra_rows || 0)}`,
    old_dictionary_candidate_use_queue_partition_closure_pairs: `${Number(oldDictionaryCandidateUseQueuePartitionClosure.counts?.input_queue_source_pairs || 0)}-${Number(oldDictionaryCandidateUseQueuePartitionClosure.counts?.cross_batch_queue_source_pairs || 0)}-${Number(oldDictionaryCandidateUseQueuePartitionClosure.counts?.single_batch_queue_source_pairs || 0)}-${Number(oldDictionaryCandidateUseQueuePartitionClosure.counts?.queue_source_pair_union_rows || 0)}`,
    old_dictionary_candidate_use_queue_partition_closure_pair_overlap_missing_extra: `${Number(oldDictionaryCandidateUseQueuePartitionClosure.counts?.queue_source_pair_overlap_rows || 0)}-${Number(oldDictionaryCandidateUseQueuePartitionClosure.counts?.queue_source_pair_missing_rows || 0)}-${Number(oldDictionaryCandidateUseQueuePartitionClosure.counts?.queue_source_pair_extra_rows || 0)}`,
    old_dictionary_candidate_use_queue_partition_closure_source_overlap_union: `${Number(oldDictionaryCandidateUseQueuePartitionClosure.counts?.source_rid_overlap || 0)}-${Number(oldDictionaryCandidateUseQueuePartitionClosure.counts?.source_rid_union || 0)}`,
    old_dictionary_candidate_use_queue_partition_closure_batch_overlap_union: `${Number(oldDictionaryCandidateUseQueuePartitionClosure.counts?.batch_id_overlap || 0)}-${Number(oldDictionaryCandidateUseQueuePartitionClosure.counts?.batch_id_union || 0)}`,
    old_dictionary_candidate_use_queue_partition_closure_ref_occurrence: `${Number(oldDictionaryCandidateUseQueuePartitionClosure.counts?.reference_total || 0)}-${Number(oldDictionaryCandidateUseQueuePartitionClosure.counts?.occurrence_total || 0)}`,
    old_dictionary_candidate_use_queue_partition_closure_selection_claims: Number(oldDictionaryCandidateUseQueuePartitionClosure.counts?.source_family_selection_claims || 0),
    old_dictionary_candidate_use_queue_partition_closure_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseQueuePartitionClosure.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_queue_partition_closure_acceptance_claims: Number(oldDictionaryCandidateUseQueuePartitionClosure.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_queue_partition_closure_release_actions: Number(oldDictionaryCandidateUseQueuePartitionClosure.counts?.release_actions || 0),
    old_dictionary_candidate_use_partition_overlap_diagnostic_source_rows: Number(oldDictionaryCandidateUsePartitionOverlapDiagnosticIndex.counts?.source_rid_overlap_rows || 0),
    old_dictionary_candidate_use_partition_overlap_diagnostic_source_queue_pair_counts: `${Number(oldDictionaryCandidateUsePartitionOverlapDiagnosticIndex.counts?.source_rid_overlap_cross_queue_count || 0)}-${Number(oldDictionaryCandidateUsePartitionOverlapDiagnosticIndex.counts?.source_rid_overlap_single_queue_count || 0)}-${Number(oldDictionaryCandidateUsePartitionOverlapDiagnosticIndex.counts?.source_rid_overlap_cross_pair_count || 0)}-${Number(oldDictionaryCandidateUsePartitionOverlapDiagnosticIndex.counts?.source_rid_overlap_single_pair_count || 0)}`,
    old_dictionary_candidate_use_partition_overlap_diagnostic_source_ref_occ: `${Number(oldDictionaryCandidateUsePartitionOverlapDiagnosticIndex.counts?.source_rid_overlap_cross_reference_total || 0)}-${Number(oldDictionaryCandidateUsePartitionOverlapDiagnosticIndex.counts?.source_rid_overlap_single_reference_total || 0)}-${Number(oldDictionaryCandidateUsePartitionOverlapDiagnosticIndex.counts?.source_rid_overlap_cross_occurrence_total || 0)}-${Number(oldDictionaryCandidateUsePartitionOverlapDiagnosticIndex.counts?.source_rid_overlap_single_occurrence_total || 0)}`,
    old_dictionary_candidate_use_partition_overlap_diagnostic_batch_rows: Number(oldDictionaryCandidateUsePartitionOverlapDiagnosticIndex.counts?.batch_id_overlap_rows || 0),
    old_dictionary_candidate_use_partition_overlap_diagnostic_batch_queue_memberships: `${Number(oldDictionaryCandidateUsePartitionOverlapDiagnosticIndex.counts?.batch_id_overlap_cross_queue_memberships || 0)}-${Number(oldDictionaryCandidateUsePartitionOverlapDiagnosticIndex.counts?.batch_id_overlap_single_queue_memberships || 0)}`,
    old_dictionary_candidate_use_partition_overlap_diagnostic_batch_ref_occ: `${Number(oldDictionaryCandidateUsePartitionOverlapDiagnosticIndex.counts?.batch_id_overlap_cross_reference_total || 0)}-${Number(oldDictionaryCandidateUsePartitionOverlapDiagnosticIndex.counts?.batch_id_overlap_single_reference_total || 0)}-${Number(oldDictionaryCandidateUsePartitionOverlapDiagnosticIndex.counts?.batch_id_overlap_cross_occurrence_total || 0)}-${Number(oldDictionaryCandidateUsePartitionOverlapDiagnosticIndex.counts?.batch_id_overlap_single_occurrence_total || 0)}`,
    old_dictionary_candidate_use_partition_overlap_diagnostic_selection_claims: Number(oldDictionaryCandidateUsePartitionOverlapDiagnosticIndex.counts?.source_family_selection_claims || 0),
    old_dictionary_candidate_use_partition_overlap_diagnostic_forbidden_payload_field_hits: Number(oldDictionaryCandidateUsePartitionOverlapDiagnosticIndex.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_partition_overlap_diagnostic_acceptance_claims: Number(oldDictionaryCandidateUsePartitionOverlapDiagnosticIndex.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_partition_overlap_diagnostic_release_actions: Number(oldDictionaryCandidateUsePartitionOverlapDiagnosticIndex.counts?.release_actions || 0),
    old_dictionary_candidate_use_queue_source_dedupe_key_rows: Number(oldDictionaryCandidateUseQueueSourceDedupeKeyIndex.counts?.dedupe_key_rows || 0),
    old_dictionary_candidate_use_queue_source_dedupe_key_cross_single: `${Number(oldDictionaryCandidateUseQueueSourceDedupeKeyIndex.counts?.cross_batch_dedupe_key_rows || 0)}-${Number(oldDictionaryCandidateUseQueueSourceDedupeKeyIndex.counts?.single_batch_dedupe_key_rows || 0)}`,
    old_dictionary_candidate_use_queue_source_dedupe_key_unique_duplicate: `${Number(oldDictionaryCandidateUseQueueSourceDedupeKeyIndex.counts?.unique_queue_source_pair_keys || 0)}-${Number(oldDictionaryCandidateUseQueueSourceDedupeKeyIndex.counts?.duplicate_queue_source_pair_keys || 0)}`,
    old_dictionary_candidate_use_queue_source_dedupe_key_queue_source_token_batch: `${Number(oldDictionaryCandidateUseQueueSourceDedupeKeyIndex.counts?.unique_queue_ids || 0)}-${Number(oldDictionaryCandidateUseQueueSourceDedupeKeyIndex.counts?.unique_source_rids || 0)}-${Number(oldDictionaryCandidateUseQueueSourceDedupeKeyIndex.counts?.unique_token_ids || 0)}-${Number(oldDictionaryCandidateUseQueueSourceDedupeKeyIndex.counts?.unique_batch_ids || 0)}`,
    old_dictionary_candidate_use_queue_source_dedupe_key_diagnostics: `${Number(oldDictionaryCandidateUseQueueSourceDedupeKeyIndex.counts?.source_rid_overlap_diagnostic_rows || 0)}-${Number(oldDictionaryCandidateUseQueueSourceDedupeKeyIndex.counts?.source_rid_overlap_diagnostic_source_rids || 0)}-${Number(oldDictionaryCandidateUseQueueSourceDedupeKeyIndex.counts?.batch_id_overlap_diagnostic_rows || 0)}-${Number(oldDictionaryCandidateUseQueueSourceDedupeKeyIndex.counts?.batch_id_overlap_diagnostic_batch_ids || 0)}-${Number(oldDictionaryCandidateUseQueueSourceDedupeKeyIndex.counts?.source_and_batch_overlap_diagnostic_rows || 0)}`,
    old_dictionary_candidate_use_queue_source_dedupe_key_ref_occurrence: `${Number(oldDictionaryCandidateUseQueueSourceDedupeKeyIndex.counts?.reference_total || 0)}-${Number(oldDictionaryCandidateUseQueueSourceDedupeKeyIndex.counts?.occurrence_total || 0)}`,
    old_dictionary_candidate_use_queue_source_dedupe_key_citation_transform_boundary: `${Number(oldDictionaryCandidateUseQueueSourceDedupeKeyIndex.counts?.source_citation_required_rows || 0)}-${Number(oldDictionaryCandidateUseQueueSourceDedupeKeyIndex.counts?.source_citation_or_url_present_rows || 0)}-${Number(oldDictionaryCandidateUseQueueSourceDedupeKeyIndex.counts?.transform_rule_still_blocked_rows || 0)}-${Number(oldDictionaryCandidateUseQueueSourceDedupeKeyIndex.counts?.agent6_boundary_after_prereq_rows || 0)}-${Number(oldDictionaryCandidateUseQueueSourceDedupeKeyIndex.counts?.source_family_selection_boundary_blocker_rows || 0)}`,
    old_dictionary_candidate_use_queue_source_dedupe_key_selection_claims: Number(oldDictionaryCandidateUseQueueSourceDedupeKeyIndex.counts?.source_family_selection_claims || 0),
    old_dictionary_candidate_use_queue_source_dedupe_key_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseQueueSourceDedupeKeyIndex.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_queue_source_dedupe_key_acceptance_claims: Number(oldDictionaryCandidateUseQueueSourceDedupeKeyIndex.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_queue_source_dedupe_key_release_actions: Number(oldDictionaryCandidateUseQueueSourceDedupeKeyIndex.counts?.release_actions || 0),
    old_dictionary_candidate_use_source_rid_dedupe_coverage_rows: Number(oldDictionaryCandidateUseSourceRidDedupeCoverageCrossmatch.counts?.coverage_rows || 0),
    old_dictionary_candidate_use_source_rid_dedupe_coverage_source_refs: `${Number(oldDictionaryCandidateUseSourceRidDedupeCoverageCrossmatch.counts?.input_workset_rows || 0)}-${Number(oldDictionaryCandidateUseSourceRidDedupeCoverageCrossmatch.counts?.input_workset_source_rid_references || 0)}-${Number(oldDictionaryCandidateUseSourceRidDedupeCoverageCrossmatch.counts?.dedupe_key_rows || 0)}-${Number(oldDictionaryCandidateUseSourceRidDedupeCoverageCrossmatch.counts?.dedupe_unique_source_rids || 0)}`,
    old_dictionary_candidate_use_source_rid_dedupe_coverage_missing_extra: `${Number(oldDictionaryCandidateUseSourceRidDedupeCoverageCrossmatch.counts?.missing_source_rids || 0)}-${Number(oldDictionaryCandidateUseSourceRidDedupeCoverageCrossmatch.counts?.extra_source_rids || 0)}-${Number(oldDictionaryCandidateUseSourceRidDedupeCoverageCrossmatch.counts?.queue_source_pair_missing_rows || 0)}-${Number(oldDictionaryCandidateUseSourceRidDedupeCoverageCrossmatch.counts?.queue_source_pair_extra_rows || 0)}`,
    old_dictionary_candidate_use_source_rid_dedupe_coverage_mismatch: `${Number(oldDictionaryCandidateUseSourceRidDedupeCoverageCrossmatch.counts?.reference_count_mismatch_rows || 0)}-${Number(oldDictionaryCandidateUseSourceRidDedupeCoverageCrossmatch.counts?.queue_set_mismatch_rows || 0)}`,
    old_dictionary_candidate_use_source_rid_dedupe_coverage_occurrences: `${Number(oldDictionaryCandidateUseSourceRidDedupeCoverageCrossmatch.counts?.source_level_occurrence_total || 0)}-${Number(oldDictionaryCandidateUseSourceRidDedupeCoverageCrossmatch.counts?.queue_source_occurrence_membership_total || 0)}`,
    old_dictionary_candidate_use_source_rid_dedupe_coverage_multi_single: `${Number(oldDictionaryCandidateUseSourceRidDedupeCoverageCrossmatch.counts?.multi_queue_source_rid_rows || 0)}-${Number(oldDictionaryCandidateUseSourceRidDedupeCoverageCrossmatch.counts?.single_queue_source_rid_rows || 0)}`,
    old_dictionary_candidate_use_source_rid_dedupe_coverage_diagnostics: `${Number(oldDictionaryCandidateUseSourceRidDedupeCoverageCrossmatch.counts?.source_rid_overlap_diagnostic_source_rows || 0)}-${Number(oldDictionaryCandidateUseSourceRidDedupeCoverageCrossmatch.counts?.source_rid_overlap_diagnostic_queue_source_pairs || 0)}-${Number(oldDictionaryCandidateUseSourceRidDedupeCoverageCrossmatch.counts?.batch_id_overlap_diagnostic_source_rows || 0)}-${Number(oldDictionaryCandidateUseSourceRidDedupeCoverageCrossmatch.counts?.batch_id_overlap_diagnostic_queue_source_pairs || 0)}-${Number(oldDictionaryCandidateUseSourceRidDedupeCoverageCrossmatch.counts?.source_and_batch_overlap_diagnostic_source_rows || 0)}`,
    old_dictionary_candidate_use_source_rid_dedupe_coverage_citation_transform_boundary: `${Number(oldDictionaryCandidateUseSourceRidDedupeCoverageCrossmatch.counts?.source_citation_required_rows || 0)}-${Number(oldDictionaryCandidateUseSourceRidDedupeCoverageCrossmatch.counts?.source_citation_or_url_present_rows || 0)}-${Number(oldDictionaryCandidateUseSourceRidDedupeCoverageCrossmatch.counts?.transform_rule_still_blocked_rows || 0)}-${Number(oldDictionaryCandidateUseSourceRidDedupeCoverageCrossmatch.counts?.agent6_boundary_after_prereq_rows || 0)}-${Number(oldDictionaryCandidateUseSourceRidDedupeCoverageCrossmatch.counts?.source_family_selection_boundary_blocker_rows || 0)}`,
    old_dictionary_candidate_use_source_rid_dedupe_coverage_selection_claims: Number(oldDictionaryCandidateUseSourceRidDedupeCoverageCrossmatch.counts?.source_family_selection_claims || 0),
    old_dictionary_candidate_use_source_rid_dedupe_coverage_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseSourceRidDedupeCoverageCrossmatch.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_source_rid_dedupe_coverage_acceptance_claims: Number(oldDictionaryCandidateUseSourceRidDedupeCoverageCrossmatch.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_source_rid_dedupe_coverage_release_actions: Number(oldDictionaryCandidateUseSourceRidDedupeCoverageCrossmatch.counts?.release_actions || 0),
    old_dictionary_candidate_use_queue_source_subchain_handoff_entries: Number(oldDictionaryCandidateUseQueueSourceSubchainHandoffIndex.counts?.handoff_entries || 0),
    old_dictionary_candidate_use_queue_source_subchain_handoff_artifacts: `${Number(oldDictionaryCandidateUseQueueSourceSubchainHandoffIndex.counts?.json_artifacts_exist || 0)}-${Number(oldDictionaryCandidateUseQueueSourceSubchainHandoffIndex.counts?.report_artifacts_exist || 0)}-${Number(oldDictionaryCandidateUseQueueSourceSubchainHandoffIndex.counts?.validator_scripts_exist || 0)}-${Number(oldDictionaryCandidateUseQueueSourceSubchainHandoffIndex.counts?.artifact_type_mismatches || 0)}-${Number(oldDictionaryCandidateUseQueueSourceSubchainHandoffIndex.counts?.evidence_ready_entries || 0)}`,
    old_dictionary_candidate_use_queue_source_subchain_handoff_source_queue_pairs: `${Number(oldDictionaryCandidateUseQueueSourceSubchainHandoffIndex.counts?.queue_source_subchain_source_rids || 0)}-${Number(oldDictionaryCandidateUseQueueSourceSubchainHandoffIndex.counts?.queue_source_subchain_source_rid_references || 0)}-${Number(oldDictionaryCandidateUseQueueSourceSubchainHandoffIndex.counts?.queue_source_subchain_queue_rows || 0)}-${Number(oldDictionaryCandidateUseQueueSourceSubchainHandoffIndex.counts?.queue_source_subchain_queue_source_pairs || 0)}`,
    old_dictionary_candidate_use_queue_source_subchain_handoff_cross_closure: `${oldDictionaryCandidateUseQueueSourceSubchainHandoffIndex.counts?.queue_source_subchain_cross_single_queues || '0-0'}-${oldDictionaryCandidateUseQueueSourceSubchainHandoffIndex.counts?.queue_source_subchain_closure_queue_overlap_missing_extra || '0-0-0'}-${oldDictionaryCandidateUseQueueSourceSubchainHandoffIndex.counts?.queue_source_subchain_closure_pair_overlap_missing_extra || '0-0-0'}`,
    old_dictionary_candidate_use_queue_source_subchain_handoff_diag_dedupe_coverage: `${oldDictionaryCandidateUseQueueSourceSubchainHandoffIndex.counts?.queue_source_subchain_source_batch_diagnostics || '0-0'}-${oldDictionaryCandidateUseQueueSourceSubchainHandoffIndex.counts?.queue_source_subchain_dedupe_rows_duplicate_keys || '0-0'}-${oldDictionaryCandidateUseQueueSourceSubchainHandoffIndex.counts?.queue_source_subchain_coverage_missing_extra || '0-0-0-0'}-${oldDictionaryCandidateUseQueueSourceSubchainHandoffIndex.counts?.queue_source_subchain_coverage_mismatches || '0-0'}`,
    old_dictionary_candidate_use_queue_source_subchain_handoff_occurrences: `${Number(oldDictionaryCandidateUseQueueSourceSubchainHandoffIndex.counts?.source_level_occurrence_total || 0)}-${Number(oldDictionaryCandidateUseQueueSourceSubchainHandoffIndex.counts?.queue_source_occurrence_membership_total || 0)}`,
    old_dictionary_candidate_use_queue_source_subchain_handoff_entries_with_authority_counters: Number(oldDictionaryCandidateUseQueueSourceSubchainHandoffIndex.counts?.entries_with_nonzero_authority_counters || 0),
    old_dictionary_candidate_use_queue_source_subchain_handoff_selection_claims: Number(oldDictionaryCandidateUseQueueSourceSubchainHandoffIndex.counts?.source_family_selection_claims || 0),
    old_dictionary_candidate_use_queue_source_subchain_handoff_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseQueueSourceSubchainHandoffIndex.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_queue_source_subchain_handoff_acceptance_claims: Number(oldDictionaryCandidateUseQueueSourceSubchainHandoffIndex.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_queue_source_subchain_handoff_release_actions: Number(oldDictionaryCandidateUseQueueSourceSubchainHandoffIndex.counts?.release_actions || 0),
    old_dictionary_candidate_use_queue_source_boundary_blocker_rows: Number(oldDictionaryCandidateUseQueueSourceBoundaryBlockerMatrix.counts?.blocker_matrix_rows || 0),
    old_dictionary_candidate_use_queue_source_boundary_blocker_inputs: `${Number(oldDictionaryCandidateUseQueueSourceBoundaryBlockerMatrix.counts?.input_dedupe_key_rows || 0)}-${Number(oldDictionaryCandidateUseQueueSourceBoundaryBlockerMatrix.counts?.input_source_rid_coverage_rows || 0)}-${Number(oldDictionaryCandidateUseQueueSourceBoundaryBlockerMatrix.counts?.input_subchain_handoff_entries || 0)}`,
    old_dictionary_candidate_use_queue_source_boundary_blocker_keys: `${Number(oldDictionaryCandidateUseQueueSourceBoundaryBlockerMatrix.counts?.unique_queue_source_pair_keys || 0)}-${Number(oldDictionaryCandidateUseQueueSourceBoundaryBlockerMatrix.counts?.duplicate_queue_source_pair_keys || 0)}-${Number(oldDictionaryCandidateUseQueueSourceBoundaryBlockerMatrix.counts?.unique_source_rids || 0)}-${Number(oldDictionaryCandidateUseQueueSourceBoundaryBlockerMatrix.counts?.unique_queue_ids || 0)}`,
    old_dictionary_candidate_use_queue_source_boundary_blocker_summary_rows: `${Number(oldDictionaryCandidateUseQueueSourceBoundaryBlockerMatrix.counts?.partition_rows || 0)}-${Number(oldDictionaryCandidateUseQueueSourceBoundaryBlockerMatrix.counts?.blocker_signature_rows || 0)}-${Number(oldDictionaryCandidateUseQueueSourceBoundaryBlockerMatrix.counts?.exact_blocker_rows || 0)}`,
    old_dictionary_candidate_use_queue_source_boundary_blocker_cross_single: `${Number(oldDictionaryCandidateUseQueueSourceBoundaryBlockerMatrix.counts?.cross_batch_blocker_rows || 0)}-${Number(oldDictionaryCandidateUseQueueSourceBoundaryBlockerMatrix.counts?.single_batch_blocker_rows || 0)}`,
    old_dictionary_candidate_use_queue_source_boundary_blocker_flags: `${Number(oldDictionaryCandidateUseQueueSourceBoundaryBlockerMatrix.counts?.source_citation_required_rows || 0)}-${Number(oldDictionaryCandidateUseQueueSourceBoundaryBlockerMatrix.counts?.source_citation_or_url_present_rows || 0)}-${Number(oldDictionaryCandidateUseQueueSourceBoundaryBlockerMatrix.counts?.transform_rule_still_blocked_rows || 0)}-${Number(oldDictionaryCandidateUseQueueSourceBoundaryBlockerMatrix.counts?.agent6_boundary_after_prereq_rows || 0)}-${Number(oldDictionaryCandidateUseQueueSourceBoundaryBlockerMatrix.counts?.source_family_selection_boundary_blocker_rows || 0)}-${Number(oldDictionaryCandidateUseQueueSourceBoundaryBlockerMatrix.counts?.source_family_boundary_packet_exists_rows || 0)}`,
    old_dictionary_candidate_use_queue_source_boundary_blocker_diagnostics: `${Number(oldDictionaryCandidateUseQueueSourceBoundaryBlockerMatrix.counts?.source_rid_overlap_diagnostic_rows || 0)}-${Number(oldDictionaryCandidateUseQueueSourceBoundaryBlockerMatrix.counts?.batch_id_overlap_diagnostic_rows || 0)}-${Number(oldDictionaryCandidateUseQueueSourceBoundaryBlockerMatrix.counts?.source_and_batch_overlap_diagnostic_rows || 0)}`,
    old_dictionary_candidate_use_queue_source_boundary_blocker_ref_occ: `${Number(oldDictionaryCandidateUseQueueSourceBoundaryBlockerMatrix.counts?.reference_total || 0)}-${Number(oldDictionaryCandidateUseQueueSourceBoundaryBlockerMatrix.counts?.occurrence_total || 0)}-${Number(oldDictionaryCandidateUseQueueSourceBoundaryBlockerMatrix.counts?.source_level_occurrence_total || 0)}`,
    old_dictionary_candidate_use_queue_source_boundary_blocker_selection_claims: Number(oldDictionaryCandidateUseQueueSourceBoundaryBlockerMatrix.counts?.source_family_selection_claims || 0),
    old_dictionary_candidate_use_queue_source_boundary_blocker_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseQueueSourceBoundaryBlockerMatrix.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_queue_source_boundary_blocker_acceptance_claims: Number(oldDictionaryCandidateUseQueueSourceBoundaryBlockerMatrix.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_queue_source_boundary_blocker_release_actions: Number(oldDictionaryCandidateUseQueueSourceBoundaryBlockerMatrix.counts?.release_actions || 0),
    old_dictionary_candidate_use_queue_source_candidate_row_bridge_rows: Number(oldDictionaryCandidateUseQueueSourceCandidateRowBridge.counts?.candidate_bridge_rows || 0),
    old_dictionary_candidate_use_queue_source_candidate_row_bridge_occurrences: Number(oldDictionaryCandidateUseQueueSourceCandidateRowBridge.counts?.candidate_bridge_occurrences || 0),
    old_dictionary_candidate_use_queue_source_candidate_row_bridge_linked_outside: `${Number(oldDictionaryCandidateUseQueueSourceCandidateRowBridge.counts?.queue_source_subchain_linked_candidate_rows || 0)}-${Number(oldDictionaryCandidateUseQueueSourceCandidateRowBridge.counts?.outside_queue_source_subchain_candidate_rows || 0)}`,
    old_dictionary_candidate_use_queue_source_candidate_row_bridge_linked_outside_occurrences: `${Number(oldDictionaryCandidateUseQueueSourceCandidateRowBridge.counts?.queue_source_subchain_linked_candidate_occurrences || 0)}-${Number(oldDictionaryCandidateUseQueueSourceCandidateRowBridge.counts?.outside_queue_source_subchain_candidate_occurrences || 0)}`,
    old_dictionary_candidate_use_queue_source_candidate_row_bridge_linked_pairs_source_occ: `${Number(oldDictionaryCandidateUseQueueSourceCandidateRowBridge.counts?.queue_source_blocker_rows_linked || 0)}-${Number(oldDictionaryCandidateUseQueueSourceCandidateRowBridge.counts?.queue_source_pair_keys_linked_unique || 0)}-${Number(oldDictionaryCandidateUseQueueSourceCandidateRowBridge.counts?.queue_source_unique_source_rids_linked || 0)}-${Number(oldDictionaryCandidateUseQueueSourceCandidateRowBridge.counts?.queue_source_occurrence_membership_total_linked || 0)}`,
    old_dictionary_candidate_use_queue_source_candidate_row_bridge_source_rid_status: `${Number(oldDictionaryCandidateUseQueueSourceCandidateRowBridge.counts?.source_rid_exact_match_rows || 0)}-${Number(oldDictionaryCandidateUseQueueSourceCandidateRowBridge.counts?.source_rid_missing_from_queue_source_rows || 0)}-${Number(oldDictionaryCandidateUseQueueSourceCandidateRowBridge.counts?.source_rid_extra_in_queue_source_rows || 0)}-${Number(oldDictionaryCandidateUseQueueSourceCandidateRowBridge.counts?.source_rid_outside_subchain_rows || 0)}`,
    old_dictionary_candidate_use_queue_source_candidate_row_bridge_queue_gaps: `${Number(oldDictionaryCandidateUseQueueSourceCandidateRowBridge.counts?.candidate_queue_ids_missing_queue_source_subchain || 0)}-${Number(oldDictionaryCandidateUseQueueSourceCandidateRowBridge.counts?.queue_source_queue_ids_missing_candidate_row || 0)}`,
    old_dictionary_candidate_use_queue_source_candidate_row_bridge_diagnostics: `${Number(oldDictionaryCandidateUseQueueSourceCandidateRowBridge.counts?.source_rid_overlap_diagnostic_bridge_rows || 0)}-${Number(oldDictionaryCandidateUseQueueSourceCandidateRowBridge.counts?.batch_id_overlap_diagnostic_bridge_rows || 0)}-${Number(oldDictionaryCandidateUseQueueSourceCandidateRowBridge.counts?.source_rid_overlap_diagnostic_link_rows || 0)}-${Number(oldDictionaryCandidateUseQueueSourceCandidateRowBridge.counts?.batch_id_overlap_diagnostic_link_rows || 0)}`,
    old_dictionary_candidate_use_queue_source_candidate_row_bridge_selection_claims: Number(oldDictionaryCandidateUseQueueSourceCandidateRowBridge.counts?.source_family_selection_claims || 0),
    old_dictionary_candidate_use_queue_source_candidate_row_bridge_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseQueueSourceCandidateRowBridge.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_queue_source_candidate_row_bridge_acceptance_claims: Number(oldDictionaryCandidateUseQueueSourceCandidateRowBridge.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_queue_source_candidate_row_bridge_release_actions: Number(oldDictionaryCandidateUseQueueSourceCandidateRowBridge.counts?.release_actions || 0),
    old_dictionary_candidate_use_queue_source_bridge_gap_workset_rows: Number(oldDictionaryCandidateUseQueueSourceBridgeGapWorkset.counts?.gap_workset_rows || 0),
    old_dictionary_candidate_use_queue_source_bridge_gap_workset_occurrences: Number(oldDictionaryCandidateUseQueueSourceBridgeGapWorkset.counts?.gap_workset_occurrences || 0),
    old_dictionary_candidate_use_queue_source_bridge_gap_workset_outside_linked: `${Number(oldDictionaryCandidateUseQueueSourceBridgeGapWorkset.counts?.outside_queue_source_subchain_rows || 0)}-${Number(oldDictionaryCandidateUseQueueSourceBridgeGapWorkset.counts?.linked_rows_missing_candidate_source_rid || 0)}-${Number(oldDictionaryCandidateUseQueueSourceBridgeGapWorkset.counts?.linked_rows_extra_queue_source_source_rid || 0)}`,
    old_dictionary_candidate_use_queue_source_bridge_gap_workset_outside_linked_occurrences: `${Number(oldDictionaryCandidateUseQueueSourceBridgeGapWorkset.counts?.outside_queue_source_subchain_occurrences || 0)}-${Number(oldDictionaryCandidateUseQueueSourceBridgeGapWorkset.counts?.linked_rows_missing_candidate_source_rid_occurrences || 0)}-${Number(oldDictionaryCandidateUseQueueSourceBridgeGapWorkset.counts?.linked_rows_extra_queue_source_source_rid_occurrences || 0)}`,
    old_dictionary_candidate_use_queue_source_bridge_gap_workset_source_rid_refs: `${Number(oldDictionaryCandidateUseQueueSourceBridgeGapWorkset.counts?.candidate_source_rid_references_requiring_linkage_review || 0)}-${Number(oldDictionaryCandidateUseQueueSourceBridgeGapWorkset.counts?.outside_candidate_source_rid_references_not_in_subchain || 0)}-${Number(oldDictionaryCandidateUseQueueSourceBridgeGapWorkset.counts?.linked_candidate_source_rid_references_not_in_subchain || 0)}-${Number(oldDictionaryCandidateUseQueueSourceBridgeGapWorkset.counts?.extra_queue_source_rid_references_not_in_candidate_row || 0)}`,
    old_dictionary_candidate_use_queue_source_bridge_gap_workset_carried_forward: `${Number(oldDictionaryCandidateUseQueueSourceBridgeGapWorkset.counts?.queue_source_blocker_rows_carried_forward || 0)}-${Number(oldDictionaryCandidateUseQueueSourceBridgeGapWorkset.counts?.queue_source_pair_keys_carried_forward || 0)}-${Number(oldDictionaryCandidateUseQueueSourceBridgeGapWorkset.counts?.queue_source_unique_source_rids_carried_forward || 0)}-${Number(oldDictionaryCandidateUseQueueSourceBridgeGapWorkset.counts?.queue_source_occurrence_membership_total_carried_forward || 0)}-${Number(oldDictionaryCandidateUseQueueSourceBridgeGapWorkset.counts?.current_blocker_total || 0)}`,
    old_dictionary_candidate_use_queue_source_bridge_gap_workset_selection_claims: Number(oldDictionaryCandidateUseQueueSourceBridgeGapWorkset.counts?.source_family_selection_claims || 0),
    old_dictionary_candidate_use_queue_source_bridge_gap_workset_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseQueueSourceBridgeGapWorkset.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_queue_source_bridge_gap_workset_acceptance_claims: Number(oldDictionaryCandidateUseQueueSourceBridgeGapWorkset.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_queue_source_bridge_gap_workset_release_actions: Number(oldDictionaryCandidateUseQueueSourceBridgeGapWorkset.counts?.release_actions || 0),
    old_dictionary_candidate_use_bridge_gap_source_rid_blocker_crossmatch_rows: Number(oldDictionaryCandidateUseBridgeGapSourceRidBlockerCrossmatch.counts?.crossmatch_source_rid_rows || 0),
    old_dictionary_candidate_use_bridge_gap_source_rid_blocker_crossmatch_refs_occ: `${Number(oldDictionaryCandidateUseBridgeGapSourceRidBlockerCrossmatch.counts?.source_rid_reference_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapSourceRidBlockerCrossmatch.counts?.source_rid_reference_occurrence_membership_total || 0)}`,
    old_dictionary_candidate_use_bridge_gap_source_rid_blocker_crossmatch_blocker_coverage: `${Number(oldDictionaryCandidateUseBridgeGapSourceRidBlockerCrossmatch.counts?.source_rids_with_blocker_row || 0)}-${Number(oldDictionaryCandidateUseBridgeGapSourceRidBlockerCrossmatch.counts?.source_rids_missing_blocker_row || 0)}-${Number(oldDictionaryCandidateUseBridgeGapSourceRidBlockerCrossmatch.counts?.source_rids_with_queue_source_coverage || 0)}-${Number(oldDictionaryCandidateUseBridgeGapSourceRidBlockerCrossmatch.counts?.source_rids_missing_queue_source_coverage || 0)}`,
    old_dictionary_candidate_use_bridge_gap_source_rid_blocker_crossmatch_queue_prefix: `${Number(oldDictionaryCandidateUseBridgeGapSourceRidBlockerCrossmatch.counts?.unique_gap_queue_ids || 0)}-${Number(oldDictionaryCandidateUseBridgeGapSourceRidBlockerCrossmatch.counts?.unique_gap_token_ids || 0)}-${Number(oldDictionaryCandidateUseBridgeGapSourceRidBlockerCrossmatch.counts?.prefix_rows || 0)}`,
    old_dictionary_candidate_use_bridge_gap_source_rid_blocker_crossmatch_blocker_totals: `${Number(oldDictionaryCandidateUseBridgeGapSourceRidBlockerCrossmatch.counts?.blocker_reference_total || 0)}-${Number(oldDictionaryCandidateUseBridgeGapSourceRidBlockerCrossmatch.counts?.blocker_occurrence_total || 0)}-${Number(oldDictionaryCandidateUseBridgeGapSourceRidBlockerCrossmatch.counts?.blocker_current_blocker_total || 0)}`,
    old_dictionary_candidate_use_bridge_gap_source_rid_blocker_crossmatch_blocker_flags: `${Number(oldDictionaryCandidateUseBridgeGapSourceRidBlockerCrossmatch.counts?.rows_missing_source_citation || 0)}-${Number(oldDictionaryCandidateUseBridgeGapSourceRidBlockerCrossmatch.counts?.rows_missing_transform_rule || 0)}-${Number(oldDictionaryCandidateUseBridgeGapSourceRidBlockerCrossmatch.counts?.rows_agent6_boundary_required || 0)}`,
    old_dictionary_candidate_use_bridge_gap_source_rid_blocker_crossmatch_selection_claims: Number(oldDictionaryCandidateUseBridgeGapSourceRidBlockerCrossmatch.counts?.source_family_selection_claims || 0),
    old_dictionary_candidate_use_bridge_gap_source_rid_blocker_crossmatch_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseBridgeGapSourceRidBlockerCrossmatch.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_bridge_gap_source_rid_blocker_crossmatch_acceptance_claims: Number(oldDictionaryCandidateUseBridgeGapSourceRidBlockerCrossmatch.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_bridge_gap_source_rid_blocker_crossmatch_release_actions: Number(oldDictionaryCandidateUseBridgeGapSourceRidBlockerCrossmatch.counts?.release_actions || 0),
    old_dictionary_candidate_use_bridge_gap_source_rid_prereq_route_crossmatch_rows: Number(oldDictionaryCandidateUseBridgeGapSourceRidPrereqRouteCrossmatch.counts?.prereq_route_rows || 0),
    old_dictionary_candidate_use_bridge_gap_source_rid_prereq_route_crossmatch_refs_occ: `${Number(oldDictionaryCandidateUseBridgeGapSourceRidPrereqRouteCrossmatch.counts?.source_rid_reference_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapSourceRidPrereqRouteCrossmatch.counts?.source_rid_reference_occurrence_membership_total || 0)}`,
    old_dictionary_candidate_use_bridge_gap_source_rid_prereq_route_crossmatch_a06_direct: `${Number(oldDictionaryCandidateUseBridgeGapSourceRidPrereqRouteCrossmatch.counts?.agent6_boundary_prereq_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapSourceRidPrereqRouteCrossmatch.counts?.direct_source_citation_prereq_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapSourceRidPrereqRouteCrossmatch.counts?.rows_in_both_prereq_paths || 0)}-${Number(oldDictionaryCandidateUseBridgeGapSourceRidPrereqRouteCrossmatch.counts?.rows_missing_prereq_path || 0)}`,
    old_dictionary_candidate_use_bridge_gap_source_rid_prereq_route_crossmatch_a06_direct_occ: `${Number(oldDictionaryCandidateUseBridgeGapSourceRidPrereqRouteCrossmatch.counts?.agent6_boundary_prereq_occurrences || 0)}-${Number(oldDictionaryCandidateUseBridgeGapSourceRidPrereqRouteCrossmatch.counts?.direct_source_citation_prereq_occurrences || 0)}`,
    old_dictionary_candidate_use_bridge_gap_source_rid_prereq_route_crossmatch_blockers: `${Number(oldDictionaryCandidateUseBridgeGapSourceRidPrereqRouteCrossmatch.counts?.source_rid_blocker_rows_present || 0)}-${Number(oldDictionaryCandidateUseBridgeGapSourceRidPrereqRouteCrossmatch.counts?.queue_source_coverage_rows_present || 0)}-${Number(oldDictionaryCandidateUseBridgeGapSourceRidPrereqRouteCrossmatch.counts?.prereq_current_blocker_total || 0)}-${Number(oldDictionaryCandidateUseBridgeGapSourceRidPrereqRouteCrossmatch.counts?.blocker_current_blocker_total || 0)}`,
    old_dictionary_candidate_use_bridge_gap_source_rid_prereq_route_crossmatch_flags: `${Number(oldDictionaryCandidateUseBridgeGapSourceRidPrereqRouteCrossmatch.counts?.rows_missing_source_citation || 0)}-${Number(oldDictionaryCandidateUseBridgeGapSourceRidPrereqRouteCrossmatch.counts?.rows_missing_transform_rule || 0)}-${Number(oldDictionaryCandidateUseBridgeGapSourceRidPrereqRouteCrossmatch.counts?.rows_agent6_boundary_after_prereq || 0)}-${Number(oldDictionaryCandidateUseBridgeGapSourceRidPrereqRouteCrossmatch.counts?.route_write_allowed_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapSourceRidPrereqRouteCrossmatch.counts?.candidate_text_allowed_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapSourceRidPrereqRouteCrossmatch.counts?.public_mutation_allowed_rows || 0)}`,
    old_dictionary_candidate_use_bridge_gap_source_rid_prereq_route_crossmatch_selection_claims: Number(oldDictionaryCandidateUseBridgeGapSourceRidPrereqRouteCrossmatch.counts?.source_family_selection_claims || 0),
    old_dictionary_candidate_use_bridge_gap_source_rid_prereq_route_crossmatch_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseBridgeGapSourceRidPrereqRouteCrossmatch.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_bridge_gap_source_rid_prereq_route_crossmatch_acceptance_claims: Number(oldDictionaryCandidateUseBridgeGapSourceRidPrereqRouteCrossmatch.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_bridge_gap_source_rid_prereq_route_crossmatch_release_actions: Number(oldDictionaryCandidateUseBridgeGapSourceRidPrereqRouteCrossmatch.counts?.release_actions || 0),
    old_dictionary_candidate_use_bridge_gap_candidate_prereq_closure_rows: Number(oldDictionaryCandidateUseBridgeGapCandidatePrereqClosureMatrix.counts?.closure_rows || 0),
    old_dictionary_candidate_use_bridge_gap_candidate_prereq_closure_occ_refs: `${Number(oldDictionaryCandidateUseBridgeGapCandidatePrereqClosureMatrix.counts?.closure_occurrences || 0)}-${Number(oldDictionaryCandidateUseBridgeGapCandidatePrereqClosureMatrix.counts?.missing_source_rid_references || 0)}`,
    old_dictionary_candidate_use_bridge_gap_candidate_prereq_closure_a06_direct: `${Number(oldDictionaryCandidateUseBridgeGapCandidatePrereqClosureMatrix.counts?.all_a06_evidence_boundary_prereq_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapCandidatePrereqClosureMatrix.counts?.all_direct_source_citation_prereq_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapCandidatePrereqClosureMatrix.counts?.mixed_prereq_route_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapCandidatePrereqClosureMatrix.counts?.missing_prereq_route_rows || 0)}`,
    old_dictionary_candidate_use_bridge_gap_candidate_prereq_closure_a06_direct_occ: `${Number(oldDictionaryCandidateUseBridgeGapCandidatePrereqClosureMatrix.counts?.all_a06_evidence_boundary_prereq_occurrences || 0)}-${Number(oldDictionaryCandidateUseBridgeGapCandidatePrereqClosureMatrix.counts?.all_direct_source_citation_prereq_occurrences || 0)}`,
    old_dictionary_candidate_use_bridge_gap_candidate_prereq_closure_blockers: `${Number(oldDictionaryCandidateUseBridgeGapCandidatePrereqClosureMatrix.counts?.source_rid_blocker_rows_present || 0)}-${Number(oldDictionaryCandidateUseBridgeGapCandidatePrereqClosureMatrix.counts?.queue_source_coverage_rows_present || 0)}-${Number(oldDictionaryCandidateUseBridgeGapCandidatePrereqClosureMatrix.counts?.current_blocker_total || 0)}`,
    old_dictionary_candidate_use_bridge_gap_candidate_prereq_closure_flags: `${Number(oldDictionaryCandidateUseBridgeGapCandidatePrereqClosureMatrix.counts?.source_rids_requiring_source_citation || 0)}-${Number(oldDictionaryCandidateUseBridgeGapCandidatePrereqClosureMatrix.counts?.source_rids_transform_blocked || 0)}-${Number(oldDictionaryCandidateUseBridgeGapCandidatePrereqClosureMatrix.counts?.source_rids_after_boundary_prereq || 0)}-${Number(oldDictionaryCandidateUseBridgeGapCandidatePrereqClosureMatrix.counts?.approval_route_owner_a07_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapCandidatePrereqClosureMatrix.counts?.a06_evidence_validator_production_only_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapCandidatePrereqClosureMatrix.counts?.a06_approval_requested_rows || 0)}`,
    old_dictionary_candidate_use_bridge_gap_candidate_prereq_closure_selection_claims: Number(oldDictionaryCandidateUseBridgeGapCandidatePrereqClosureMatrix.counts?.source_family_selection_claims || 0),
    old_dictionary_candidate_use_bridge_gap_candidate_prereq_closure_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseBridgeGapCandidatePrereqClosureMatrix.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_bridge_gap_candidate_prereq_closure_acceptance_claims: Number(oldDictionaryCandidateUseBridgeGapCandidatePrereqClosureMatrix.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_bridge_gap_candidate_prereq_closure_release_actions: Number(oldDictionaryCandidateUseBridgeGapCandidatePrereqClosureMatrix.counts?.release_actions || 0),
    old_dictionary_candidate_use_bridge_gap_a07_a06_route_overlay_rows: Number(oldDictionaryCandidateUseBridgeGapA07A06RouteOverlay.counts?.overlay_rows || 0),
    old_dictionary_candidate_use_bridge_gap_a07_a06_route_overlay_occ_links: `${Number(oldDictionaryCandidateUseBridgeGapA07A06RouteOverlay.counts?.overlay_occurrences || 0)}-${Number(oldDictionaryCandidateUseBridgeGapA07A06RouteOverlay.counts?.source_rid_route_links || 0)}-${Number(oldDictionaryCandidateUseBridgeGapA07A06RouteOverlay.counts?.unique_source_rids || 0)}`,
    old_dictionary_candidate_use_bridge_gap_a07_a06_route_overlay_worksets: `${Number(oldDictionaryCandidateUseBridgeGapA07A06RouteOverlay.counts?.direct_source_citation_workset_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapA07A06RouteOverlay.counts?.a06_evidence_boundary_workset_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapA07A06RouteOverlay.counts?.mixed_or_missing_workset_rows || 0)}`,
    old_dictionary_candidate_use_bridge_gap_a07_a06_route_overlay_link_routes: `${Number(oldDictionaryCandidateUseBridgeGapA07A06RouteOverlay.counts?.direct_source_citation_prereq_links || 0)}-${Number(oldDictionaryCandidateUseBridgeGapA07A06RouteOverlay.counts?.a06_evidence_boundary_prereq_links || 0)}-${Number(oldDictionaryCandidateUseBridgeGapA07A06RouteOverlay.counts?.missing_prereq_detail_links || 0)}`,
    old_dictionary_candidate_use_bridge_gap_a07_a06_route_overlay_prereq_blockers: `${Number(oldDictionaryCandidateUseBridgeGapA07A06RouteOverlay.counts?.source_citation_required_links || 0)}-${Number(oldDictionaryCandidateUseBridgeGapA07A06RouteOverlay.counts?.source_citation_or_url_present_links || 0)}-${Number(oldDictionaryCandidateUseBridgeGapA07A06RouteOverlay.counts?.transform_rule_still_blocked_links || 0)}-${Number(oldDictionaryCandidateUseBridgeGapA07A06RouteOverlay.counts?.source_rid_blocker_links_present || 0)}-${Number(oldDictionaryCandidateUseBridgeGapA07A06RouteOverlay.counts?.queue_source_coverage_links_present || 0)}`,
    old_dictionary_candidate_use_bridge_gap_a07_a06_route_overlay_route_law: `${Number(oldDictionaryCandidateUseBridgeGapA07A06RouteOverlay.counts?.a07_approval_route_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapA07A06RouteOverlay.counts?.a06_evidence_validator_only_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapA07A06RouteOverlay.counts?.a06_approval_requested_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapA07A06RouteOverlay.counts?.do_not_ask_a06_for_approval_rows || 0)}`,
    old_dictionary_candidate_use_bridge_gap_a07_a06_route_overlay_preservation_flags: `${Number(oldDictionaryCandidateUseBridgeGapA07A06RouteOverlay.counts?.a06_outputs_evidence_ready_until_a07_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapA07A06RouteOverlay.counts?.existing_validated_words_preserved_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapA07A06RouteOverlay.counts?.redo_only_changed_or_flagged_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapA07A06RouteOverlay.counts?.current_blocker_total || 0)}`,
    old_dictionary_candidate_use_bridge_gap_a07_a06_route_overlay_selection_claims: Number(oldDictionaryCandidateUseBridgeGapA07A06RouteOverlay.counts?.source_family_selection_claims || 0),
    old_dictionary_candidate_use_bridge_gap_a07_a06_route_overlay_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseBridgeGapA07A06RouteOverlay.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_bridge_gap_a07_a06_route_overlay_acceptance_claims: Number(oldDictionaryCandidateUseBridgeGapA07A06RouteOverlay.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_bridge_gap_a07_a06_route_overlay_release_actions: Number(oldDictionaryCandidateUseBridgeGapA07A06RouteOverlay.counts?.release_actions || 0),
    old_dictionary_candidate_use_bridge_gap_downstream_intake_coverage_rows: Number(oldDictionaryCandidateUseBridgeGapDownstreamIntakeCoverageCrossmatch.counts?.crossmatch_rows || 0),
    old_dictionary_candidate_use_bridge_gap_downstream_intake_coverage_occ_links: `${Number(oldDictionaryCandidateUseBridgeGapDownstreamIntakeCoverageCrossmatch.counts?.crossmatch_occurrences || 0)}-${Number(oldDictionaryCandidateUseBridgeGapDownstreamIntakeCoverageCrossmatch.counts?.source_rid_links || 0)}`,
    old_dictionary_candidate_use_bridge_gap_downstream_intake_coverage_inputs: `${Number(oldDictionaryCandidateUseBridgeGapDownstreamIntakeCoverageCrossmatch.counts?.agent2_direct_contract_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapDownstreamIntakeCoverageCrossmatch.counts?.agent2_direct_contract_validation_passed || 0)}-${Number(oldDictionaryCandidateUseBridgeGapDownstreamIntakeCoverageCrossmatch.counts?.agent10_source_citation_workset_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapDownstreamIntakeCoverageCrossmatch.counts?.agent10_preboundary_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapDownstreamIntakeCoverageCrossmatch.counts?.agent10_agent6_verdict_rows || 0)}`,
    old_dictionary_candidate_use_bridge_gap_downstream_intake_coverage_direct: `${Number(oldDictionaryCandidateUseBridgeGapDownstreamIntakeCoverageCrossmatch.counts?.direct_overlay_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapDownstreamIntakeCoverageCrossmatch.counts?.direct_overlay_rows_matched_agent2_contract || 0)}-${Number(oldDictionaryCandidateUseBridgeGapDownstreamIntakeCoverageCrossmatch.counts?.direct_overlay_rows_missing_agent2_contract_match || 0)}-${Number(oldDictionaryCandidateUseBridgeGapDownstreamIntakeCoverageCrossmatch.counts?.direct_overlay_source_citation_missing_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapDownstreamIntakeCoverageCrossmatch.counts?.direct_overlay_transform_blocked_rows || 0)}`,
    old_dictionary_candidate_use_bridge_gap_downstream_intake_coverage_a06: `${Number(oldDictionaryCandidateUseBridgeGapDownstreamIntakeCoverageCrossmatch.counts?.a06_overlay_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapDownstreamIntakeCoverageCrossmatch.counts?.a06_overlay_row_level_downstream_consumed_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapDownstreamIntakeCoverageCrossmatch.counts?.a06_overlay_row_level_downstream_missing_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapDownstreamIntakeCoverageCrossmatch.counts?.a06_overlay_source_rid_links || 0)}`,
    old_dictionary_candidate_use_bridge_gap_downstream_intake_coverage_broad_rowlevel: `${Number(oldDictionaryCandidateUseBridgeGapDownstreamIntakeCoverageCrossmatch.counts?.broad_agent10_source_citation_workset_context_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapDownstreamIntakeCoverageCrossmatch.counts?.broad_agent10_preboundary_context_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapDownstreamIntakeCoverageCrossmatch.counts?.row_level_agent10_source_citation_overlay_consumed_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapDownstreamIntakeCoverageCrossmatch.counts?.row_level_agent10_preboundary_overlay_consumed_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapDownstreamIntakeCoverageCrossmatch.counts?.agent10_preboundary_agent3_input_null_rows || 0)}`,
    old_dictionary_candidate_use_bridge_gap_downstream_intake_coverage_route_law: `${Number(oldDictionaryCandidateUseBridgeGapDownstreamIntakeCoverageCrossmatch.counts?.a07_route_correction_present_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapDownstreamIntakeCoverageCrossmatch.counts?.a07_approval_route_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapDownstreamIntakeCoverageCrossmatch.counts?.a06_evidence_owner_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapDownstreamIntakeCoverageCrossmatch.counts?.a06_approval_requested_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapDownstreamIntakeCoverageCrossmatch.counts?.do_not_ask_a06_for_approval_rows || 0)}`,
    old_dictionary_candidate_use_bridge_gap_downstream_intake_coverage_selection_claims: Number(oldDictionaryCandidateUseBridgeGapDownstreamIntakeCoverageCrossmatch.counts?.source_family_selection_claims || 0),
    old_dictionary_candidate_use_bridge_gap_downstream_intake_coverage_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseBridgeGapDownstreamIntakeCoverageCrossmatch.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_bridge_gap_downstream_intake_coverage_acceptance_claims: Number(oldDictionaryCandidateUseBridgeGapDownstreamIntakeCoverageCrossmatch.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_bridge_gap_downstream_intake_coverage_release_actions: Number(oldDictionaryCandidateUseBridgeGapDownstreamIntakeCoverageCrossmatch.counts?.release_actions || 0),
    old_dictionary_candidate_use_bridge_gap_a06_row_level_downstream_blocker_rows: Number(oldDictionaryCandidateUseBridgeGapA06RowLevelDownstreamBlockerWorkset.counts?.workset_rows || 0),
    old_dictionary_candidate_use_bridge_gap_a06_row_level_downstream_blocker_occ_links: `${Number(oldDictionaryCandidateUseBridgeGapA06RowLevelDownstreamBlockerWorkset.counts?.workset_occurrences || 0)}-${Number(oldDictionaryCandidateUseBridgeGapA06RowLevelDownstreamBlockerWorkset.counts?.source_rid_links || 0)}-${Number(oldDictionaryCandidateUseBridgeGapA06RowLevelDownstreamBlockerWorkset.counts?.unique_source_rids || 0)}`,
    old_dictionary_candidate_use_bridge_gap_a06_row_level_downstream_blocker_ids: `${Number(oldDictionaryCandidateUseBridgeGapA06RowLevelDownstreamBlockerWorkset.counts?.unique_queue_ids || 0)}-${Number(oldDictionaryCandidateUseBridgeGapA06RowLevelDownstreamBlockerWorkset.counts?.unique_token_ids || 0)}-${Number(oldDictionaryCandidateUseBridgeGapA06RowLevelDownstreamBlockerWorkset.counts?.unique_lexicon_entry_ids || 0)}-${Number(oldDictionaryCandidateUseBridgeGapA06RowLevelDownstreamBlockerWorkset.counts?.prefix_rows || 0)}`,
    old_dictionary_candidate_use_bridge_gap_a06_row_level_downstream_blocker_context: `${Number(oldDictionaryCandidateUseBridgeGapA06RowLevelDownstreamBlockerWorkset.counts?.missing_row_level_downstream_consumption_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapA06RowLevelDownstreamBlockerWorkset.counts?.broad_agent10_source_citation_context_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapA06RowLevelDownstreamBlockerWorkset.counts?.broad_agent10_preboundary_context_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapA06RowLevelDownstreamBlockerWorkset.counts?.row_level_agent10_source_citation_overlay_consumed_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapA06RowLevelDownstreamBlockerWorkset.counts?.row_level_agent10_preboundary_overlay_consumed_rows || 0)}`,
    old_dictionary_candidate_use_bridge_gap_a06_row_level_downstream_blocker_prereqs: `${Number(oldDictionaryCandidateUseBridgeGapA06RowLevelDownstreamBlockerWorkset.counts?.source_citation_required_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapA06RowLevelDownstreamBlockerWorkset.counts?.source_citation_or_url_present_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapA06RowLevelDownstreamBlockerWorkset.counts?.transform_rule_still_blocked_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapA06RowLevelDownstreamBlockerWorkset.counts?.agent10_agent6_verdict_no_transform_authorized_rows || 0)}`,
    old_dictionary_candidate_use_bridge_gap_a06_row_level_downstream_blocker_route_law: `${Number(oldDictionaryCandidateUseBridgeGapA06RowLevelDownstreamBlockerWorkset.counts?.a07_approval_route_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapA06RowLevelDownstreamBlockerWorkset.counts?.a06_evidence_owner_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapA06RowLevelDownstreamBlockerWorkset.counts?.a06_approval_requested_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapA06RowLevelDownstreamBlockerWorkset.counts?.a06_evidence_ready_until_a07_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapA06RowLevelDownstreamBlockerWorkset.counts?.do_not_ask_a06_for_approval_rows || 0)}`,
    old_dictionary_candidate_use_bridge_gap_a06_row_level_downstream_blocker_selection_claims: Number(oldDictionaryCandidateUseBridgeGapA06RowLevelDownstreamBlockerWorkset.counts?.source_family_selection_claims || 0),
    old_dictionary_candidate_use_bridge_gap_a06_row_level_downstream_blocker_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseBridgeGapA06RowLevelDownstreamBlockerWorkset.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_bridge_gap_a06_row_level_downstream_blocker_acceptance_claims: Number(oldDictionaryCandidateUseBridgeGapA06RowLevelDownstreamBlockerWorkset.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_bridge_gap_a06_row_level_downstream_blocker_release_actions: Number(oldDictionaryCandidateUseBridgeGapA06RowLevelDownstreamBlockerWorkset.counts?.release_actions || 0),
    old_dictionary_candidate_use_bridge_gap_direct_source_citation_blocker_rows: Number(oldDictionaryCandidateUseBridgeGapDirectSourceCitationBlockerWorkset.counts?.workset_rows || 0),
    old_dictionary_candidate_use_bridge_gap_direct_source_citation_blocker_occ_links: `${Number(oldDictionaryCandidateUseBridgeGapDirectSourceCitationBlockerWorkset.counts?.workset_occurrences || 0)}-${Number(oldDictionaryCandidateUseBridgeGapDirectSourceCitationBlockerWorkset.counts?.source_rid_links || 0)}-${Number(oldDictionaryCandidateUseBridgeGapDirectSourceCitationBlockerWorkset.counts?.unique_source_rids || 0)}`,
    old_dictionary_candidate_use_bridge_gap_direct_source_citation_blocker_ids: `${Number(oldDictionaryCandidateUseBridgeGapDirectSourceCitationBlockerWorkset.counts?.unique_queue_ids || 0)}-${Number(oldDictionaryCandidateUseBridgeGapDirectSourceCitationBlockerWorkset.counts?.unique_token_ids || 0)}-${Number(oldDictionaryCandidateUseBridgeGapDirectSourceCitationBlockerWorkset.counts?.unique_lexicon_entry_ids || 0)}-${Number(oldDictionaryCandidateUseBridgeGapDirectSourceCitationBlockerWorkset.counts?.prefix_rows || 0)}`,
    old_dictionary_candidate_use_bridge_gap_direct_source_citation_blocker_contract: `${Number(oldDictionaryCandidateUseBridgeGapDirectSourceCitationBlockerWorkset.counts?.agent2_direct_contract_matched_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapDirectSourceCitationBlockerWorkset.counts?.agent2_direct_contract_queue_matched_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapDirectSourceCitationBlockerWorkset.counts?.agent2_direct_contract_validation_passed_rows || 0)}`,
    old_dictionary_candidate_use_bridge_gap_direct_source_citation_blocker_prereqs: `${Number(oldDictionaryCandidateUseBridgeGapDirectSourceCitationBlockerWorkset.counts?.source_citation_required_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapDirectSourceCitationBlockerWorkset.counts?.source_citation_or_url_present_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapDirectSourceCitationBlockerWorkset.counts?.direct_contract_source_citation_or_url_present_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapDirectSourceCitationBlockerWorkset.counts?.transform_rule_still_blocked_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapDirectSourceCitationBlockerWorkset.counts?.direct_contract_transform_rule_still_blocked_rows || 0)}`,
    old_dictionary_candidate_use_bridge_gap_direct_source_citation_blocker_context: `${Number(oldDictionaryCandidateUseBridgeGapDirectSourceCitationBlockerWorkset.counts?.broad_agent10_source_citation_context_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapDirectSourceCitationBlockerWorkset.counts?.broad_agent10_preboundary_context_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapDirectSourceCitationBlockerWorkset.counts?.row_level_agent10_source_citation_overlay_consumed_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapDirectSourceCitationBlockerWorkset.counts?.row_level_agent10_preboundary_overlay_consumed_rows || 0)}`,
    old_dictionary_candidate_use_bridge_gap_direct_source_citation_blocker_route_law: `${Number(oldDictionaryCandidateUseBridgeGapDirectSourceCitationBlockerWorkset.counts?.a07_approval_route_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapDirectSourceCitationBlockerWorkset.counts?.a06_evidence_owner_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapDirectSourceCitationBlockerWorkset.counts?.a06_approval_requested_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapDirectSourceCitationBlockerWorkset.counts?.a06_evidence_ready_until_a07_rows || 0)}-${Number(oldDictionaryCandidateUseBridgeGapDirectSourceCitationBlockerWorkset.counts?.do_not_ask_a06_for_approval_rows || 0)}`,
    old_dictionary_candidate_use_bridge_gap_direct_source_citation_blocker_selection_claims: Number(oldDictionaryCandidateUseBridgeGapDirectSourceCitationBlockerWorkset.counts?.source_family_selection_claims || 0),
    old_dictionary_candidate_use_bridge_gap_direct_source_citation_blocker_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseBridgeGapDirectSourceCitationBlockerWorkset.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_bridge_gap_direct_source_citation_blocker_acceptance_claims: Number(oldDictionaryCandidateUseBridgeGapDirectSourceCitationBlockerWorkset.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_bridge_gap_direct_source_citation_blocker_release_actions: Number(oldDictionaryCandidateUseBridgeGapDirectSourceCitationBlockerWorkset.counts?.release_actions || 0),
    proof_occurrence_rows: Number(usageAgent6Packet.counts?.proof_occurrence_rows || 0),
    proof_rows_with_complete_metadata: completeProofRows(usageAgent6Packet),
    proof_rows_with_hebrew_context: Number(usageAgent6Packet.counts?.proof_rows_with_hebrew_context || 0),
    proof_mojibake_rows: Number(usageAgent6Packet.counts?.proof_mojibake_rows || 0),
    reader_facing_rows: Number(usageAgent6Packet.counts?.reader_facing_rows || 0),
    route_payload_field_hits: Number(usageAgent6Packet.counts?.route_payload_field_hits || 0),
    forbidden_authority_field_hits: Number(usageAgent6Packet.counts?.forbidden_authority_field_hits || 0),
    queue_required_fields_present: Number(queueReadyPacket.counts?.required_queue_fields_present || 0),
    queue_required_fields: Number(queueReadyPacket.counts?.required_queue_fields || 0),
    queue_evidence_artifacts_exist: Number(queueReadyPacket.counts?.evidence_artifacts_exist || 0),
    queue_evidence_artifacts: Number(queueReadyPacket.counts?.evidence_artifacts || 0),
    smoke_steps: Number(smokeValidation.counts?.steps || 0),
    smoke_failed_steps: Number(smokeValidation.counts?.failed_steps || 0),
    smoke_source_freshness_status: smokeValidation.counts?.source_freshness_status || null,
    smoke_source_freshness_pending_files: Number(smokeValidation.counts?.usage_refresh_priority_pending_files || 0),
  },
  known_risks: [
    'Definition Workbench current 200-row sample still has 0 current usage links for the selected Agent 3 usage token scope.',
    'Selected usage evidence is concentrated on one route ID; it is usage navigation, not independent semantic confirmation.',
    'Usage coverage is selected seeded scope, not broad corpus completion.',
    'Ambiguous rows remain audit-only and are not reader-facing.',
    `Public handoff source freshness is ${publicHandoffIndex.coverage_boundary?.source_freshness?.status || 'unknown'} with ${Number(publicHandoffIndex.coverage_boundary?.source_freshness?.files_modified_after_artifact || 0)} files modified after the usage artifact scan.`,
    `Current Agent 3 source-freshness refresh recount is ${Number(usageSourceFreshnessRefresh.counts?.git_dirty_source_files || 0)} dirty source files with ${Number(usageSourceFreshnessRefresh.counts?.dirty_sources_with_current_usage_overlap || 0)} direct usage-overlap sources and ${Number(usageSourceFreshnessRefresh.counts?.impacted_navigation_rows || 0)} impacted navigation rows; this narrows impact only and does not clear broad freshness.`,
    `Smoke source freshness is ${smokeValidation.counts?.source_freshness_status || 'unknown'} with ${Number(smokeValidation.counts?.usage_refresh_priority_pending_files || 0)} pending refresh files.`,
    'Agent 3 did not mutate Agent 6 queue state; Agent 5 remains the intended submitter.',
  ],
  quality: {
    status: failed.length ? 'failed' : warnings.length ? 'pass_with_warnings' : 'passed',
    warning_count: warnings.length,
    failed_count: failed.length,
  },
  counts,
  checks,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);

console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Agent 3 state ${artifact.quality.status}; evidence ${counts.evidence_artifacts_exist}/${counts.evidence_artifacts}; validators ${counts.validator_scripts_exist}/${counts.validator_scripts}`);

function publicHandoffMetrics() {
  const counts = publicHandoffIndex.counts || {};
  const quality = publicHandoffIndex.quality_gates || {};
  const sourceFreshness = publicHandoffIndex.coverage_boundary?.source_freshness || {};
  const statusCounts = counts.status_counts || {};
  const contract = publicHandoffIndex.consumer_contract || {};
  return {
    public_handoff_selected_targets: Number(counts.selected_targets || 0),
    public_handoff_validation_passed: Number(counts.validation_passed || 0),
    public_handoff_validation_failed: Number(counts.validation_failed || 0),
    public_handoff_eligible_usage_rows: Number(counts.reader_facing_eligible_rows || 0),
    public_handoff_count_only_ambiguous_rows: Number(counts.count_only_ambiguous_rows || 0),
    public_handoff_zero_useful_targets: Number(counts.zero_useful_targets || 0),
    public_handoff_supported_rows: Number(statusCounts.supported || 0),
    public_handoff_candidate_rows: Number(statusCounts.candidate || 0),
    public_handoff_weak_rows: Number(statusCounts.weak || 0),
    public_handoff_ambiguous_rows: Number(statusCounts.ambiguous || 0),
    public_handoff_downstream_consumable: quality.downstream_consumable === true ? 1 : 0,
    public_handoff_validation_passed_flag: quality.validation_passed === true ? 1 : 0,
    public_handoff_zero_useful_targets_blocked: quality.zero_useful_targets_blocked === true ? 1 : 0,
    public_handoff_ambiguous_rows_audit_only: quality.ambiguous_rows_audit_only === true ? 1 : 0,
    public_handoff_license_policy_passed: quality.license_policy_passed === true ? 1 : 0,
    public_handoff_corpus_exhaustive: publicHandoffIndex.coverage_boundary?.corpus_exhaustive === true ? 1 : 0,
    public_handoff_source_freshness_status: sourceFreshness.status || quality.source_freshness_status || null,
    public_handoff_artifact_source_files_scanned: Number(sourceFreshness.artifact_source_files_scanned || 0),
    public_handoff_current_source_files: Number(sourceFreshness.current_source_files || 0),
    public_handoff_source_count_delta: Number(sourceFreshness.count_delta_vs_artifact_scan || 0),
    public_handoff_files_modified_after_artifact: Number(sourceFreshness.files_modified_after_artifact || 0),
    public_handoff_files_created_after_artifact: Number(sourceFreshness.files_created_after_artifact || 0),
    public_handoff_final_ranking_authority: contract.final_ranking_authority === true ? 1 : 0,
    public_handoff_visible_answer_authority: contract.visible_answer_authority === true ? 1 : 0,
    public_handoff_carries_text_rows: contract.carries_text_rows === true ? 1 : 0,
    public_handoff_warning_count: Array.isArray(quality.warnings) ? quality.warnings.length : 0,
  };
}

function buildCounts() {
  return {
    evidence_artifacts: evidenceArtifacts.length,
    evidence_artifacts_exist: evidenceArtifacts.filter((artifactPath) => fs.existsSync(path.join(root, artifactPath))).length,
    validator_scripts: validators.length,
    validator_scripts_exist: validators.filter((scriptPath) => fs.existsSync(path.join(root, scriptPath))).length,
    queue_required_fields_present: Number(queueReadyPacket.counts?.required_queue_fields_present || 0),
    queue_required_fields: Number(queueReadyPacket.counts?.required_queue_fields || 0),
    queue_mutations: Number(queueReadyPacket.counts?.queue_mutations || 0),
    submitted_to_agent6: Number(queueReadyPacket.counts?.submitted_to_agent6 || 0),
    usage_concordance_rows: Number(usageConcordance.counts?.rows || 0),
    usage_supported_rows: Number(usageConcordance.counts?.status_counts?.supported || 0),
    usage_candidate_rows: Number(usageConcordance.counts?.status_counts?.candidate || 0),
    usage_weak_rows: Number(usageConcordance.counts?.status_counts?.weak || 0),
    audit_only_ambiguous_rows: Number(usageConcordance.counts?.audit_only_counts?.ambiguous || 0),
    occurrence_link_rows: Number(usageOccurrenceLinks.counts?.occurrence_link_rows || 0),
    occurrence_link_rows_with_complete_metadata: completeOccurrenceLinkRows(),
    occurrence_link_reader_facing_rows: Number(usageOccurrenceLinks.counts?.reader_facing_rows || 0),
    occurrence_link_route_payload_field_hits: Number(usageOccurrenceLinks.counts?.route_payload_field_hits || 0),
    occurrence_link_forbidden_authority_field_hits: Number(usageOccurrenceLinks.counts?.forbidden_authority_field_hits || 0),
    route_resolution_occurrence_route_rows: Number(usageRouteResolution.counts?.occurrence_route_rows || 0),
    route_resolution_route_ids: Number(usageRouteResolution.counts?.route_ids || 0),
    route_resolution_resolved_route_ids: Number(usageRouteResolution.counts?.resolved_route_ids || 0),
    route_resolution_unresolved_route_ids: Number(usageRouteResolution.counts?.unresolved_route_ids || 0),
    route_resolution_reader_facing_rows: Number(usageRouteResolution.counts?.reader_facing_rows || 0),
    route_resolution_route_payload_field_hits: Number(usageRouteResolution.counts?.route_payload_field_hits || 0),
    route_resolution_forbidden_authority_field_hits: Number(usageRouteResolution.counts?.forbidden_authority_field_hits || 0),
    crossmatch_neighbor_source_occurrence_rows: Number(usageCrossmatchNeighbors.counts?.source_occurrence_rows || 0),
    crossmatch_neighbor_link_rows: Number(usageCrossmatchNeighbors.counts?.neighbor_link_rows || 0),
    crossmatch_neighbor_same_frame_links: Number(usageCrossmatchNeighbors.counts?.same_frame_neighbor_links || 0),
    crossmatch_neighbor_bridge_frame_links: Number(usageCrossmatchNeighbors.counts?.bridge_frame_neighbor_links || 0),
    crossmatch_neighbor_route_ids: Number(usageCrossmatchNeighbors.counts?.route_ids || 0),
    crossmatch_neighbor_unresolved_route_ids: Number(usageCrossmatchNeighbors.counts?.unresolved_route_ids || 0),
    crossmatch_neighbor_reader_facing_rows: Number(usageCrossmatchNeighbors.counts?.reader_facing_rows || 0),
    crossmatch_neighbor_route_payload_field_hits: Number(usageCrossmatchNeighbors.counts?.route_payload_field_hits || 0),
    crossmatch_neighbor_forbidden_authority_field_hits: Number(usageCrossmatchNeighbors.counts?.forbidden_authority_field_hits || 0),
    source_ref_bucket_count: Number(usageSourceRefBuckets.counts?.source_ref_buckets || 0),
    source_ref_bucket_source_cluster_buckets: Number(usageSourceRefBuckets.counts?.source_cluster_buckets || 0),
    source_ref_bucket_occurrence_rows: Number(usageSourceRefBuckets.counts?.occurrence_rows || 0),
    source_ref_bucket_duplicate_source_ref_buckets: Number(usageSourceRefBuckets.counts?.duplicate_source_ref_buckets || 0),
    source_ref_bucket_duplicate_source_ref_rows: Number(usageSourceRefBuckets.counts?.duplicate_source_ref_rows || 0),
    source_ref_bucket_cross_cluster_source_ref_buckets: Number(usageSourceRefBuckets.counts?.cross_cluster_source_ref_buckets || 0),
    source_ref_bucket_cross_cluster_source_ref_rows: Number(usageSourceRefBuckets.counts?.cross_cluster_source_ref_rows || 0),
    source_ref_bucket_route_ids: Number(usageSourceRefBuckets.counts?.route_ids || 0),
    source_ref_bucket_unresolved_route_ids: Number(usageSourceRefBuckets.counts?.unresolved_route_ids || 0),
    source_ref_bucket_reader_facing_rows: Number(usageSourceRefBuckets.counts?.reader_facing_rows || 0),
    source_ref_bucket_route_payload_field_hits: Number(usageSourceRefBuckets.counts?.route_payload_field_hits || 0),
    source_ref_bucket_forbidden_authority_field_hits: Number(usageSourceRefBuckets.counts?.forbidden_authority_field_hits || 0),
    work_bucket_count: Number(usageWorkBuckets.counts?.work_buckets || 0),
    work_bucket_work_frame_buckets: Number(usageWorkBuckets.counts?.work_frame_buckets || 0),
    work_bucket_occurrence_rows: Number(usageWorkBuckets.counts?.occurrence_rows || 0),
    work_bucket_source_refs: Number(usageWorkBuckets.counts?.source_ref_count || 0),
    work_bucket_multi_source_work_buckets: Number(usageWorkBuckets.counts?.multi_source_ref_work_buckets || 0),
    work_bucket_multi_source_work_rows: Number(usageWorkBuckets.counts?.multi_source_ref_work_rows || 0),
    work_bucket_multi_frame_work_buckets: Number(usageWorkBuckets.counts?.multi_frame_work_buckets || 0),
    work_bucket_multi_frame_work_rows: Number(usageWorkBuckets.counts?.multi_frame_work_rows || 0),
    work_bucket_route_ids: Number(usageWorkBuckets.counts?.route_ids || 0),
    work_bucket_unresolved_route_ids: Number(usageWorkBuckets.counts?.unresolved_route_ids || 0),
    work_bucket_reader_facing_rows: Number(usageWorkBuckets.counts?.reader_facing_rows || 0),
    work_bucket_route_payload_field_hits: Number(usageWorkBuckets.counts?.route_payload_field_hits || 0),
    work_bucket_forbidden_authority_field_hits: Number(usageWorkBuckets.counts?.forbidden_authority_field_hits || 0),
    provenance_bucket_count: Number(usageProvenanceBuckets.counts?.provenance_buckets || 0),
    provenance_bucket_provenance_frame_buckets: Number(usageProvenanceBuckets.counts?.provenance_frame_buckets || 0),
    provenance_bucket_occurrence_rows: Number(usageProvenanceBuckets.counts?.occurrence_rows || 0),
    provenance_bucket_work_count: Number(usageProvenanceBuckets.counts?.work_count || 0),
    provenance_bucket_source_refs: Number(usageProvenanceBuckets.counts?.source_ref_count || 0),
    provenance_bucket_license_count: Number(usageProvenanceBuckets.counts?.license_count || 0),
    provenance_bucket_version_source_count: Number(usageProvenanceBuckets.counts?.version_source_count || 0),
    provenance_bucket_multi_work_buckets: Number(usageProvenanceBuckets.counts?.multi_work_provenance_buckets || 0),
    provenance_bucket_multi_work_rows: Number(usageProvenanceBuckets.counts?.multi_work_provenance_rows || 0),
    provenance_bucket_multi_frame_buckets: Number(usageProvenanceBuckets.counts?.multi_frame_provenance_buckets || 0),
    provenance_bucket_multi_frame_rows: Number(usageProvenanceBuckets.counts?.multi_frame_provenance_rows || 0),
    provenance_bucket_route_ids: Number(usageProvenanceBuckets.counts?.route_ids || 0),
    provenance_bucket_unresolved_route_ids: Number(usageProvenanceBuckets.counts?.unresolved_route_ids || 0),
    provenance_bucket_reader_facing_rows: Number(usageProvenanceBuckets.counts?.reader_facing_rows || 0),
    provenance_bucket_route_payload_field_hits: Number(usageProvenanceBuckets.counts?.route_payload_field_hits || 0),
    provenance_bucket_forbidden_authority_field_hits: Number(usageProvenanceBuckets.counts?.forbidden_authority_field_hits || 0),
    occurrence_detail_rows: Number(usageOccurrenceDetailIndex.counts?.occurrence_detail_rows || 0),
    occurrence_detail_source_refs: Number(usageOccurrenceDetailIndex.counts?.source_ref_count || 0),
    occurrence_detail_works: Number(usageOccurrenceDetailIndex.counts?.work_count || 0),
    occurrence_detail_license_count: Number(usageOccurrenceDetailIndex.counts?.license_count || 0),
    occurrence_detail_version_source_count: Number(usageOccurrenceDetailIndex.counts?.version_source_count || 0),
    occurrence_detail_route_ids: Number(usageOccurrenceDetailIndex.counts?.route_ids || 0),
    occurrence_detail_unresolved_route_ids: Number(usageOccurrenceDetailIndex.counts?.unresolved_route_ids || 0),
    occurrence_detail_rows_with_route_ids: Number(usageOccurrenceDetailIndex.counts?.rows_with_route_ids || 0),
    occurrence_detail_rows_with_source_link: Number(usageOccurrenceDetailIndex.counts?.rows_with_source_link || 0),
    occurrence_detail_rows_with_work_anchor: Number(usageOccurrenceDetailIndex.counts?.rows_with_work_anchor || 0),
    occurrence_detail_rows_with_hebrew_context: Number(usageOccurrenceDetailIndex.counts?.rows_with_hebrew_context || 0),
    occurrence_detail_rows_with_focus_marker: Number(usageOccurrenceDetailIndex.counts?.rows_with_focus_marker || 0),
    occurrence_detail_rows_with_all_bucket_links: Number(usageOccurrenceDetailIndex.counts?.rows_with_all_bucket_links || 0),
    occurrence_detail_neighbor_links: Number(usageOccurrenceDetailIndex.counts?.neighbor_links || 0),
    occurrence_detail_same_frame_neighbor_links: Number(usageOccurrenceDetailIndex.counts?.same_frame_neighbor_links || 0),
    occurrence_detail_bridge_frame_neighbor_links: Number(usageOccurrenceDetailIndex.counts?.bridge_frame_neighbor_links || 0),
    occurrence_detail_observed_usage_only_rows: Number(usageOccurrenceDetailIndex.counts?.observed_usage_only_rows || 0),
    occurrence_detail_reader_facing_rows: Number(usageOccurrenceDetailIndex.counts?.reader_facing_rows || 0),
    occurrence_detail_route_payload_field_hits: Number(usageOccurrenceDetailIndex.counts?.route_payload_field_hits || 0),
    occurrence_detail_forbidden_authority_field_hits: Number(usageOccurrenceDetailIndex.counts?.forbidden_authority_field_hits || 0),
    facet_index_occurrence_rows: Number(usageFacetIndex.counts?.occurrence_rows || 0),
    facet_index_facet_groups: Number(usageFacetIndex.counts?.facet_groups || 0),
    facet_index_facets_total: Number(usageFacetIndex.counts?.facets_total || 0),
    facet_index_route_ids: Number(usageFacetIndex.counts?.route_ids || 0),
    facet_index_max_route_share_basis_points: Number(usageFacetIndex.counts?.max_route_share_basis_points || 0),
    facet_index_route_concentration_warning: Number(usageFacetIndex.counts?.route_concentration_warning || 0),
    facet_index_rows_with_source_link: Number(usageFacetIndex.counts?.rows_with_source_link || 0),
    facet_index_rows_with_work_anchor: Number(usageFacetIndex.counts?.rows_with_work_anchor || 0),
    facet_index_rows_with_context: Number(usageFacetIndex.counts?.rows_with_context || 0),
    facet_index_rows_with_focus_marker: Number(usageFacetIndex.counts?.rows_with_focus_marker || 0),
    facet_index_rows_with_license: Number(usageFacetIndex.counts?.rows_with_license || 0),
    facet_index_rows_with_version: Number(usageFacetIndex.counts?.rows_with_version || 0),
    facet_index_rows_with_route_ids: Number(usageFacetIndex.counts?.rows_with_route_ids || 0),
    facet_index_reader_facing_rows: Number(usageFacetIndex.counts?.reader_facing_rows || 0),
    facet_index_route_payload_field_hits: Number(usageFacetIndex.counts?.route_payload_field_hits || 0),
    facet_index_forbidden_authority_field_hits: Number(usageFacetIndex.counts?.forbidden_authority_field_hits || 0),
    context_token_index_rows: Number(usageContextTokenIndex.counts?.context_token_rows || 0),
    context_token_index_occurrence_rows: Number(usageContextTokenIndex.counts?.occurrence_rows || 0),
    context_token_index_occurrences: Number(usageContextTokenIndex.counts?.context_token_occurrences || 0),
    context_token_index_cross_frame_rows: Number(usageContextTokenIndex.counts?.cross_frame_context_token_rows || 0),
    context_token_index_repeated_focus_occurrences: Number(usageContextTokenIndex.counts?.repeated_focus_context_occurrences || 0),
    context_token_index_route_ids: Number(usageContextTokenIndex.counts?.route_ids || 0),
    context_token_index_unresolved_route_ids: Number(usageContextTokenIndex.counts?.unresolved_route_ids || 0),
    context_token_index_route_concentration_warning: Number(usageContextTokenIndex.counts?.route_concentration_warning || 0),
    context_token_index_rows_with_source_link: Number(usageContextTokenIndex.counts?.rows_with_source_link || 0),
    context_token_index_rows_with_work_anchor: Number(usageContextTokenIndex.counts?.rows_with_work_anchor || 0),
    context_token_index_rows_with_hebrew_context: Number(usageContextTokenIndex.counts?.rows_with_hebrew_context || 0),
    context_token_index_rows_with_focus_marker: Number(usageContextTokenIndex.counts?.rows_with_focus_marker || 0),
    context_token_index_rows_with_license_metadata: Number(usageContextTokenIndex.counts?.rows_with_license_metadata || 0),
    context_token_index_rows_with_version_metadata: Number(usageContextTokenIndex.counts?.rows_with_version_metadata || 0),
    context_token_index_reader_facing_rows: Number(usageContextTokenIndex.counts?.reader_facing_rows || 0),
    context_token_index_route_payload_field_hits: Number(usageContextTokenIndex.counts?.route_payload_field_hits || 0),
    context_token_index_forbidden_authority_field_hits: Number(usageContextTokenIndex.counts?.forbidden_authority_field_hits || 0),
    context_token_link_rows: Number(usageContextTokenLinks.counts?.context_token_link_rows || 0),
    context_token_link_context_tokens: Number(usageContextTokenLinks.counts?.context_token_rows || 0),
    context_token_link_occurrence_rows: Number(usageContextTokenLinks.counts?.occurrence_rows || 0),
    context_token_link_focus_rows: Number(usageContextTokenLinks.counts?.focus_marked_link_rows || 0),
    context_token_link_context_rows: Number(usageContextTokenLinks.counts?.context_role_link_rows || 0),
    context_token_link_repeated_focus_rows: Number(usageContextTokenLinks.counts?.repeated_focus_context_links || 0),
    context_token_link_cross_frame_rows: Number(usageContextTokenLinks.counts?.cross_frame_context_token_links || 0),
    context_token_link_route_ids: Number(usageContextTokenLinks.counts?.route_ids || 0),
    context_token_link_unresolved_route_ids: Number(usageContextTokenLinks.counts?.unresolved_route_ids || 0),
    context_token_link_max_route_share_basis_points: Number(usageContextTokenLinks.counts?.max_route_share_basis_points || 0),
    context_token_link_route_concentration_warning: Number(usageContextTokenLinks.counts?.route_concentration_warning || 0),
    context_token_link_rows_with_source_link: Number(usageContextTokenLinks.counts?.rows_with_source_link || 0),
    context_token_link_rows_with_work_anchor: Number(usageContextTokenLinks.counts?.rows_with_work_anchor || 0),
    context_token_link_rows_with_hebrew_context: Number(usageContextTokenLinks.counts?.rows_with_hebrew_context || 0),
    context_token_link_rows_with_focus_marker: Number(usageContextTokenLinks.counts?.rows_with_focus_marker || 0),
    context_token_link_rows_with_route_ids: Number(usageContextTokenLinks.counts?.rows_with_route_ids || 0),
    context_token_link_rows_with_license_metadata: Number(usageContextTokenLinks.counts?.rows_with_license_metadata || 0),
    context_token_link_rows_with_version_metadata: Number(usageContextTokenLinks.counts?.rows_with_version_metadata || 0),
    context_token_link_observed_usage_only_rows: Number(usageContextTokenLinks.counts?.observed_usage_only_rows || 0),
    context_token_link_reader_facing_rows: Number(usageContextTokenLinks.counts?.reader_facing_rows || 0),
    context_token_link_route_payload_field_hits: Number(usageContextTokenLinks.counts?.route_payload_field_hits || 0),
    context_token_link_forbidden_authority_field_hits: Number(usageContextTokenLinks.counts?.forbidden_authority_field_hits || 0),
    context_token_occurrence_index_rows: Number(usageContextTokenOccurrenceIndex.counts?.context_token_occurrence_rows || 0),
    context_token_occurrence_index_link_rows: Number(usageContextTokenOccurrenceIndex.counts?.context_token_link_rows || 0),
    context_token_occurrence_index_occurrence_rows: Number(usageContextTokenOccurrenceIndex.counts?.occurrence_rows || 0),
    context_token_occurrence_index_focus_rows: Number(usageContextTokenOccurrenceIndex.counts?.focus_link_rows || 0),
    context_token_occurrence_index_context_rows: Number(usageContextTokenOccurrenceIndex.counts?.context_link_rows || 0),
    context_token_occurrence_index_repeated_focus_rows: Number(usageContextTokenOccurrenceIndex.counts?.repeated_focus_context_link_rows || 0),
    context_token_occurrence_index_cross_frame_rows: Number(usageContextTokenOccurrenceIndex.counts?.cross_frame_context_token_rows || 0),
    context_token_occurrence_index_cross_frame_link_rows: Number(usageContextTokenOccurrenceIndex.counts?.cross_frame_context_token_link_rows || 0),
    context_token_occurrence_index_route_ids: Number(usageContextTokenOccurrenceIndex.counts?.route_ids || 0),
    context_token_occurrence_index_unresolved_route_ids: Number(usageContextTokenOccurrenceIndex.counts?.unresolved_route_ids || 0),
    context_token_occurrence_index_max_route_share_basis_points: Number(usageContextTokenOccurrenceIndex.counts?.max_route_share_basis_points || 0),
    context_token_occurrence_index_route_concentration_warning: Number(usageContextTokenOccurrenceIndex.counts?.route_concentration_warning || 0),
    context_token_occurrence_index_rows_with_source_link: Number(usageContextTokenOccurrenceIndex.counts?.link_rows_with_source_link || 0),
    context_token_occurrence_index_rows_with_work_anchor: Number(usageContextTokenOccurrenceIndex.counts?.link_rows_with_work_anchor || 0),
    context_token_occurrence_index_rows_with_hebrew_context: Number(usageContextTokenOccurrenceIndex.counts?.link_rows_with_hebrew_context || 0),
    context_token_occurrence_index_rows_with_focus_marker: Number(usageContextTokenOccurrenceIndex.counts?.link_rows_with_focus_marker || 0),
    context_token_occurrence_index_rows_with_route_ids: Number(usageContextTokenOccurrenceIndex.counts?.link_rows_with_route_ids || 0),
    context_token_occurrence_index_rows_with_license_metadata: Number(usageContextTokenOccurrenceIndex.counts?.link_rows_with_license_metadata || 0),
    context_token_occurrence_index_rows_with_version_metadata: Number(usageContextTokenOccurrenceIndex.counts?.link_rows_with_version_metadata || 0),
    context_token_occurrence_index_reader_facing_rows: Number(usageContextTokenOccurrenceIndex.counts?.reader_facing_rows || 0),
    context_token_occurrence_index_route_payload_field_hits: Number(usageContextTokenOccurrenceIndex.counts?.route_payload_field_hits || 0),
    context_token_occurrence_index_forbidden_authority_field_hits: Number(usageContextTokenOccurrenceIndex.counts?.forbidden_authority_field_hits || 0),
    occurrence_context_profile_rows: Number(usageOccurrenceContextProfile.counts?.profile_rows || 0),
    occurrence_context_profile_link_rows: Number(usageOccurrenceContextProfile.counts?.context_token_link_rows || 0),
    occurrence_context_profile_unique_context_tokens: Number(usageOccurrenceContextProfile.counts?.unique_context_tokens || 0),
    occurrence_context_profile_reverse_index_rows: Number(usageOccurrenceContextProfile.counts?.reverse_index_rows || 0),
    occurrence_context_profile_rows_with_reverse_index_ids: Number(usageOccurrenceContextProfile.counts?.rows_with_reverse_index_ids || 0),
    occurrence_context_profile_rows_with_complete_reverse_index_mapping: Number(usageOccurrenceContextProfile.counts?.rows_with_complete_reverse_index_mapping || 0),
    occurrence_context_profile_focus_rows: Number(usageOccurrenceContextProfile.counts?.focus_link_rows || 0),
    occurrence_context_profile_context_rows: Number(usageOccurrenceContextProfile.counts?.context_link_rows || 0),
    occurrence_context_profile_repeated_focus_rows: Number(usageOccurrenceContextProfile.counts?.repeated_focus_context_link_rows || 0),
    occurrence_context_profile_cross_frame_rows: Number(usageOccurrenceContextProfile.counts?.cross_frame_context_link_rows || 0),
    occurrence_context_profile_route_ids: Number(usageOccurrenceContextProfile.counts?.route_ids || 0),
    occurrence_context_profile_unresolved_route_ids: Number(usageOccurrenceContextProfile.counts?.unresolved_route_ids || 0),
    occurrence_context_profile_max_route_share_basis_points: Number(usageOccurrenceContextProfile.counts?.max_route_share_basis_points || 0),
    occurrence_context_profile_route_concentration_warning: Number(usageOccurrenceContextProfile.counts?.route_concentration_warning || 0),
    occurrence_context_profile_rows_with_source_link: Number(usageOccurrenceContextProfile.counts?.rows_with_source_link || 0),
    occurrence_context_profile_rows_with_work_anchor: Number(usageOccurrenceContextProfile.counts?.rows_with_work_anchor || 0),
    occurrence_context_profile_rows_with_hebrew_context: Number(usageOccurrenceContextProfile.counts?.rows_with_hebrew_context || 0),
    occurrence_context_profile_rows_with_focus_marker: Number(usageOccurrenceContextProfile.counts?.rows_with_focus_marker || 0),
    occurrence_context_profile_rows_with_route_ids: Number(usageOccurrenceContextProfile.counts?.rows_with_route_ids || 0),
    occurrence_context_profile_rows_with_license_metadata: Number(usageOccurrenceContextProfile.counts?.rows_with_license_metadata || 0),
    occurrence_context_profile_rows_with_version_metadata: Number(usageOccurrenceContextProfile.counts?.rows_with_version_metadata || 0),
    occurrence_context_profile_reader_facing_rows: Number(usageOccurrenceContextProfile.counts?.reader_facing_rows || 0),
    occurrence_context_profile_route_payload_field_hits: Number(usageOccurrenceContextProfile.counts?.route_payload_field_hits || 0),
    occurrence_context_profile_forbidden_authority_field_hits: Number(usageOccurrenceContextProfile.counts?.forbidden_authority_field_hits || 0),
    route_diversity_probe_occurrence_rows: Number(usageRouteDiversityProbe.counts?.occurrence_rows || 0),
    route_diversity_probe_route_ids: Number(usageRouteDiversityProbe.counts?.route_ids || 0),
    route_diversity_probe_route_probe_rows: Number(usageRouteDiversityProbe.counts?.route_probe_rows || 0),
    route_diversity_probe_max_route_share_basis_points: Number(usageRouteDiversityProbe.counts?.max_route_share_basis_points || 0),
    route_diversity_probe_concentration_warning: Number(usageRouteDiversityProbe.counts?.route_concentration_warning || 0),
    route_diversity_probe_all_selected_rows_same_route: Number(usageRouteDiversityProbe.counts?.all_selected_rows_same_route || 0),
    route_diversity_probe_semantic_independence_claim_allowed: Number(usageRouteDiversityProbe.counts?.semantic_independence_claim_allowed || 0),
    route_diversity_probe_coverage_buckets_total: Number(usageRouteDiversityProbe.counts?.coverage_buckets_total || 0),
    route_diversity_probe_concentration_support_selected_occurrence_refs: Number(usageRouteDiversityProbe.counts?.concentration_support_selected_occurrence_refs || 0),
    route_diversity_probe_concentration_support_unique_source_refs: Number(usageRouteDiversityProbe.counts?.concentration_support_unique_source_refs || 0),
    route_diversity_probe_concentration_support_unique_work_anchors: Number(usageRouteDiversityProbe.counts?.concentration_support_unique_work_anchors || 0),
    route_diversity_probe_concentration_support_unique_works: Number(usageRouteDiversityProbe.counts?.concentration_support_unique_works || 0),
    route_diversity_probe_concentration_support_unique_licenses: Number(usageRouteDiversityProbe.counts?.concentration_support_unique_licenses || 0),
    route_diversity_probe_concentration_support_unique_version_sources: Number(usageRouteDiversityProbe.counts?.concentration_support_unique_version_sources || 0),
    route_diversity_probe_concentration_support_duplicate_source_ref_rows: Number(usageRouteDiversityProbe.counts?.concentration_support_duplicate_source_ref_rows || 0),
    route_diversity_probe_concentration_support_missing_signature_rows: Number(usageRouteDiversityProbe.counts?.concentration_support_missing_signature_rows || 0),
    route_diversity_probe_concentration_support_signature_memberships: Number(usageRouteDiversityProbe.counts?.concentration_support_signature_memberships || 0),
    route_diversity_probe_concentration_support_recurring_signature_rows: Number(usageRouteDiversityProbe.counts?.concentration_support_recurring_signature_rows || 0),
    route_diversity_probe_concentration_support_cross_cluster_signature_rows: Number(usageRouteDiversityProbe.counts?.concentration_support_cross_cluster_signature_rows || 0),
    route_diversity_probe_concentration_support_missing_lookup_rows: Number(usageRouteDiversityProbe.counts?.concentration_support_missing_lookup_rows || 0),
    route_diversity_probe_concentration_support_final_authority: Number(usageRouteDiversityProbe.counts?.concentration_support_final_authority || 0),
    route_diversity_probe_concentration_support_semantic_independence_allowed: Number(usageRouteDiversityProbe.counts?.concentration_support_semantic_independence_allowed || 0),
    route_diversity_probe_reader_facing_rows: Number(usageRouteDiversityProbe.counts?.reader_facing_rows || 0),
    route_diversity_probe_route_payload_field_hits: Number(usageRouteDiversityProbe.counts?.route_payload_field_hits || 0),
    route_diversity_probe_forbidden_authority_field_hits: Number(usageRouteDiversityProbe.counts?.forbidden_authority_field_hits || 0),
    route_concentration_guardrail_surfaces: Number(usageRouteConcentrationGuardrail.counts?.guardrail_surfaces || 0),
    route_concentration_guardrail_single_route_surfaces: Number(usageRouteConcentrationGuardrail.counts?.guardrail_surfaces_with_single_route || 0),
    route_concentration_guardrail_max_share_surfaces: Number(usageRouteConcentrationGuardrail.counts?.guardrail_surfaces_with_max_share_10000 || 0),
    route_concentration_guardrail_warning_surfaces: Number(usageRouteConcentrationGuardrail.counts?.guardrail_surfaces_with_concentration_warning || 0),
    route_concentration_guardrail_semantic_independence_allowed_rows: Number(usageRouteConcentrationGuardrail.counts?.semantic_independence_allowed_rows || 0),
    route_concentration_guardrail_answer_authority_allowed_rows: Number(usageRouteConcentrationGuardrail.counts?.answer_authority_allowed_rows || 0),
    route_concentration_guardrail_route_ranking_allowed_rows: Number(usageRouteConcentrationGuardrail.counts?.route_ranking_allowed_rows || 0),
    route_concentration_guardrail_visible_answer_selection_allowed_rows: Number(usageRouteConcentrationGuardrail.counts?.visible_answer_selection_allowed_rows || 0),
    route_concentration_guardrail_reader_facing_rows: Number(usageRouteConcentrationGuardrail.counts?.reader_facing_rows || 0),
    route_concentration_guardrail_route_payload_field_hits: Number(usageRouteConcentrationGuardrail.counts?.route_payload_field_hits || 0),
    route_concentration_guardrail_forbidden_authority_field_hits: Number(usageRouteConcentrationGuardrail.counts?.forbidden_authority_field_hits || 0),
    route_concentration_guardrail_unresolved_route_ids: Number(usageRouteConcentrationGuardrail.counts?.unresolved_route_ids || 0),
    route_pointer_audit_rows: Number(usageRoutePointerAudit.counts?.route_pointer_rows || 0),
    route_pointer_audit_route_ids: Number(usageRoutePointerAudit.counts?.route_ids || 0),
    route_pointer_audit_resolved_route_ids: Number(usageRoutePointerAudit.counts?.resolved_route_ids || 0),
    route_pointer_audit_unresolved_route_ids: Number(usageRoutePointerAudit.counts?.unresolved_route_ids || 0),
    route_pointer_audit_support_rows_with_pointer: Number(usageRoutePointerAudit.counts?.support_rows_with_pointer || 0),
    route_pointer_audit_support_rows: Number(usageRoutePointerAudit.counts?.support_rows || 0),
    route_pointer_audit_navigation_rows_with_pointer: Number(usageRoutePointerAudit.counts?.navigation_rows_with_pointer || 0),
    route_pointer_audit_navigation_rows: Number(usageRoutePointerAudit.counts?.navigation_rows || 0),
    route_pointer_audit_planning_rows_with_pointer: Number(usageRoutePointerAudit.counts?.planning_rows_with_pointer || 0),
    route_pointer_audit_planning_rows: Number(usageRoutePointerAudit.counts?.planning_rows || 0),
    route_pointer_audit_reader_facing_rows: Number(usageRoutePointerAudit.counts?.reader_facing_rows || 0),
    route_pointer_audit_route_payload_field_hits: Number(usageRoutePointerAudit.counts?.route_payload_field_hits || 0),
    route_pointer_audit_forbidden_authority_field_hits: Number(usageRoutePointerAudit.counts?.forbidden_authority_field_hits || 0),
    route_pointer_audit_route_metadata_field_hits: Number(usageRoutePointerAudit.counts?.route_metadata_field_hits || 0),
    sample_gap_audit_gap_rows: Number(usageSampleGapAudit.counts?.gap_rows || 0),
    sample_gap_audit_sample_rows: Number(usageSampleGapAudit.counts?.sample_rows || 0),
    sample_gap_audit_sample_rows_with_usage_links: Number(usageSampleGapAudit.counts?.sample_rows_with_usage_links || 0),
    sample_gap_audit_usage_tokens_not_in_sample: Number(usageSampleGapAudit.counts?.usage_tokens_not_in_sample || 0),
    sample_gap_audit_selected_occurrence_links: Number(usageSampleGapAudit.counts?.selected_occurrence_links || 0),
    sample_gap_audit_route_ids: Number(usageSampleGapAudit.counts?.route_ids || 0),
    sample_gap_audit_sample_overlap_gap_visible: Number(usageSampleGapAudit.counts?.sample_overlap_gap_visible || 0),
    sample_gap_audit_reader_facing_rows: Number(usageSampleGapAudit.counts?.reader_facing_rows || 0),
    sample_gap_audit_route_payload_field_hits: Number(usageSampleGapAudit.counts?.route_payload_field_hits || 0),
    sample_gap_audit_forbidden_authority_field_hits: Number(usageSampleGapAudit.counts?.forbidden_authority_field_hits || 0),
    consumer_manifest_entries: Number(usageConsumerManifest.counts?.manifest_entries || 0),
    consumer_manifest_data_artifacts_exist: Number(usageConsumerManifest.counts?.data_artifacts_exist || 0),
    consumer_manifest_data_artifacts: Number(usageConsumerManifest.counts?.data_artifacts || 0),
    consumer_manifest_report_artifacts_exist: Number(usageConsumerManifest.counts?.report_artifacts_exist || 0),
    consumer_manifest_report_artifacts: Number(usageConsumerManifest.counts?.report_artifacts || 0),
    consumer_manifest_validator_scripts_exist: Number(usageConsumerManifest.counts?.validator_scripts_exist || 0),
    consumer_manifest_validator_scripts: Number(usageConsumerManifest.counts?.validator_scripts || 0),
    consumer_manifest_passed_entries: Number(usageConsumerManifest.counts?.passed_entries || 0),
    consumer_manifest_occurrence_detail_rows: Number(usageConsumerManifest.counts?.occurrence_detail_rows || 0),
    consumer_manifest_occurrence_link_rows: Number(usageConsumerManifest.counts?.occurrence_link_rows || 0),
    consumer_manifest_route_ids: Number(usageConsumerManifest.counts?.route_ids || 0),
    consumer_manifest_unresolved_route_ids: Number(usageConsumerManifest.counts?.unresolved_route_ids || 0),
    consumer_manifest_reader_facing_rows: Number(usageConsumerManifest.counts?.reader_facing_rows || 0),
    consumer_manifest_route_payload_field_hits: Number(usageConsumerManifest.counts?.route_payload_field_hits || 0),
    consumer_manifest_forbidden_authority_field_hits: Number(usageConsumerManifest.counts?.forbidden_authority_field_hits || 0),
    planning_packet_planning_rows: Number(usagePlanningPacket.counts?.planning_rows || 0),
    planning_packet_occurrence_link_rows: Number(usagePlanningPacket.counts?.occurrence_link_rows || 0),
    planning_packet_current_sample_rows_with_usage_links: Number(usagePlanningPacket.counts?.current_sample_rows_with_usage_links || 0),
    planning_packet_current_sample_usage_tokens_not_in_sample: Number(usagePlanningPacket.counts?.current_sample_usage_tokens_not_in_sample || 0),
    planning_packet_route_ids: Number(usagePlanningPacket.counts?.route_ids || 0),
    planning_packet_reader_facing_rows: Number(usagePlanningPacket.counts?.reader_facing_rows || 0),
    planning_packet_route_payload_field_hits: Number(usagePlanningPacket.counts?.route_payload_field_hits || 0),
    planning_packet_forbidden_authority_field_hits: Number(usagePlanningPacket.counts?.forbidden_authority_field_hits || 0),
    planning_packet_summary_token_keys: Number(usagePlanningPacket.counts?.planning_summary_token_keys || 0),
    planning_packet_summary_occurrence_token_keys: Number(usagePlanningPacket.counts?.planning_summary_occurrence_token_keys || 0),
    planning_packet_summary_supported_rows: Number(usagePlanningPacket.counts?.planning_summary_supported_rows || 0),
    planning_packet_summary_candidate_rows: Number(usagePlanningPacket.counts?.planning_summary_candidate_rows || 0),
    planning_packet_summary_weak_rows: Number(usagePlanningPacket.counts?.planning_summary_weak_rows || 0),
    planning_packet_summary_resolved_route_ids: Number(usagePlanningPacket.counts?.planning_summary_resolved_route_ids || 0),
    planning_packet_summary_unresolved_route_ids: Number(usagePlanningPacket.counts?.planning_summary_unresolved_route_ids || 0),
    planning_packet_summary_source_refs: Number(usagePlanningPacket.counts?.planning_summary_source_refs || 0),
    planning_packet_summary_works: Number(usagePlanningPacket.counts?.planning_summary_works || 0),
    planning_packet_summary_forbidden_use_items: Number(usagePlanningPacket.counts?.planning_summary_forbidden_use_items || 0),
    planning_packet_summary_qa_boundary_references: Number(usagePlanningPacket.counts?.planning_summary_qa_boundary_references || 0),
    planning_packet_summary_broad_coverage_claim_allowed: usagePlanningPacket.planning_handoff_summary?.warning_summary?.broad_coverage_claim_allowed === true ? 1 : 0,
    planning_packet_summary_semantic_independence_claim_allowed: usagePlanningPacket.planning_handoff_summary?.warning_summary?.semantic_independence_claim_allowed === true ? 1 : 0,
    anchor_audit_rows: Number(usageAnchorAudit.counts?.audit_rows || 0),
    anchor_audit_existing_work_pages: Number(usageAnchorAudit.counts?.rows_with_existing_work_page || 0),
    anchor_audit_existing_anchors: Number(usageAnchorAudit.counts?.rows_with_existing_anchor || 0),
    anchor_audit_matching_source_refs: Number(usageAnchorAudit.counts?.rows_with_matching_source_ref || 0),
    anchor_audit_token_surfaces_in_page: Number(usageAnchorAudit.counts?.rows_with_token_surface_in_page || 0),
    anchor_audit_focus_surfaces_in_page: Number(usageAnchorAudit.counts?.rows_with_focus_surface_in_page || 0),
    anchor_audit_rows_with_context: Number(usageAnchorAudit.counts?.rows_with_context || 0),
    anchor_audit_rows_with_focus_marker: Number(usageAnchorAudit.counts?.rows_with_focus_marker || 0),
    anchor_audit_rows_with_license: Number(usageAnchorAudit.counts?.rows_with_license || 0),
    anchor_audit_rows_with_version: Number(usageAnchorAudit.counts?.rows_with_version || 0),
    anchor_audit_rows_with_route_ids: Number(usageAnchorAudit.counts?.rows_with_route_ids || 0),
    anchor_audit_reader_facing_rows: Number(usageAnchorAudit.counts?.reader_facing_rows || 0),
    anchor_audit_route_payload_field_hits: Number(usageAnchorAudit.counts?.route_payload_field_hits || 0),
    anchor_audit_forbidden_authority_field_hits: Number(usageAnchorAudit.counts?.forbidden_authority_field_hits || 0),
    occurrence_support_rows: Number(usageOccurrenceSupportPacket.counts?.support_rows || 0),
    occurrence_support_supported_rows: Number(usageOccurrenceSupportPacket.counts?.supported_rows || 0),
    occurrence_support_candidate_rows: Number(usageOccurrenceSupportPacket.counts?.candidate_rows || 0),
    occurrence_support_weak_rows: Number(usageOccurrenceSupportPacket.counts?.weak_rows || 0),
    occurrence_support_rows_with_source_url: Number(usageOccurrenceSupportPacket.counts?.rows_with_source_url || 0),
    occurrence_support_rows_with_local_work_anchor: Number(usageOccurrenceSupportPacket.counts?.rows_with_local_work_anchor || 0),
    occurrence_support_rows_with_context_snippet: Number(usageOccurrenceSupportPacket.counts?.rows_with_context_snippet || 0),
    occurrence_support_rows_with_focus_marker: Number(usageOccurrenceSupportPacket.counts?.rows_with_focus_marker || 0),
    occurrence_support_rows_with_route_ids: Number(usageOccurrenceSupportPacket.counts?.rows_with_route_ids || 0),
    occurrence_support_rows_with_license_metadata: Number(usageOccurrenceSupportPacket.counts?.rows_with_license_metadata || 0),
    occurrence_support_rows_with_version_metadata: Number(usageOccurrenceSupportPacket.counts?.rows_with_version_metadata || 0),
    occurrence_support_reader_facing_rows: Number(usageOccurrenceSupportPacket.counts?.reader_facing_rows || 0),
    occurrence_support_route_payload_field_hits: Number(usageOccurrenceSupportPacket.counts?.route_payload_field_hits || 0),
    occurrence_support_forbidden_authority_field_hits: Number(usageOccurrenceSupportPacket.counts?.forbidden_authority_field_hits || 0),
    concordance_navigation_rows: Number(usageConcordanceNavigationPacket.counts?.navigation_rows || 0),
    concordance_navigation_supported_rows: Number(usageConcordanceNavigationPacket.counts?.supported_rows || 0),
    concordance_navigation_candidate_rows: Number(usageConcordanceNavigationPacket.counts?.candidate_rows || 0),
    concordance_navigation_weak_rows: Number(usageConcordanceNavigationPacket.counts?.weak_rows || 0),
    concordance_navigation_selected_support_rows: Number(usageConcordanceNavigationPacket.counts?.selected_support_rows || 0),
    concordance_navigation_source_refs: Number(usageConcordanceNavigationPacket.counts?.source_refs || 0),
    concordance_navigation_works: Number(usageConcordanceNavigationPacket.counts?.works || 0),
    concordance_navigation_categories: Number(usageConcordanceNavigationPacket.counts?.categories || 0),
    concordance_navigation_route_ids: Number(usageConcordanceNavigationPacket.counts?.route_ids || 0),
    concordance_navigation_rows_with_source_url: Number(usageConcordanceNavigationPacket.counts?.rows_with_source_url || 0),
    concordance_navigation_rows_with_local_work_anchor: Number(usageConcordanceNavigationPacket.counts?.rows_with_local_work_anchor || 0),
    concordance_navigation_rows_with_context_snippet: Number(usageConcordanceNavigationPacket.counts?.rows_with_context_snippet || 0),
    concordance_navigation_rows_with_focus_marker: Number(usageConcordanceNavigationPacket.counts?.rows_with_focus_marker || 0),
    concordance_navigation_rows_with_route_ids: Number(usageConcordanceNavigationPacket.counts?.rows_with_route_ids || 0),
    concordance_navigation_rows_with_license_metadata: Number(usageConcordanceNavigationPacket.counts?.rows_with_license_metadata || 0),
    concordance_navigation_rows_with_version_metadata: Number(usageConcordanceNavigationPacket.counts?.rows_with_version_metadata || 0),
    concordance_navigation_reader_facing_rows: Number(usageConcordanceNavigationPacket.counts?.reader_facing_rows || 0),
    concordance_navigation_route_payload_field_hits: Number(usageConcordanceNavigationPacket.counts?.route_payload_field_hits || 0),
    concordance_navigation_forbidden_authority_field_hits: Number(usageConcordanceNavigationPacket.counts?.forbidden_authority_field_hits || 0),
    ...publicHandoffMetrics(),
    freshness_impact_pending_refresh_files: Number(usageFreshnessImpactPacket.counts?.pending_refresh_files || 0),
    freshness_impact_pending_with_current_usage_overlap: Number(usageFreshnessImpactPacket.counts?.pending_with_current_usage_overlap || 0),
    freshness_impact_impacted_navigation_rows: Number(usageFreshnessImpactPacket.counts?.impacted_navigation_rows || 0),
    freshness_impact_impacted_selected_support_rows: Number(usageFreshnessImpactPacket.counts?.impacted_selected_support_rows || 0),
    freshness_impact_promoted_run_targets: Number(usageFreshnessImpactPacket.counts?.promoted_run_targets || 0),
    freshness_impact_source_text_read: Number(usageFreshnessImpactPacket.counts?.source_text_read || 0),
    freshness_impact_broad_target_expansion: Number(usageFreshnessImpactPacket.counts?.broad_target_expansion || 0),
    freshness_impact_reader_facing_rows: Number(usageFreshnessImpactPacket.counts?.reader_facing_rows || 0),
    freshness_impact_route_payload_field_hits: Number(usageFreshnessImpactPacket.counts?.route_payload_field_hits || 0),
    freshness_impact_forbidden_authority_field_hits: Number(usageFreshnessImpactPacket.counts?.forbidden_authority_field_hits || 0),
    source_freshness_refresh_dirty_source_files: Number(usageSourceFreshnessRefresh.counts?.git_dirty_source_files || 0),
    source_freshness_refresh_modified_source_files: Number(usageSourceFreshnessRefresh.counts?.git_modified_source_files || 0),
    source_freshness_refresh_untracked_source_files: Number(usageSourceFreshnessRefresh.counts?.git_untracked_source_files || 0),
    source_freshness_refresh_overlap_sources: Number(usageSourceFreshnessRefresh.counts?.dirty_sources_with_current_usage_overlap || 0),
    source_freshness_refresh_impacted_navigation_rows: Number(usageSourceFreshnessRefresh.counts?.impacted_navigation_rows || 0),
    source_freshness_refresh_impacted_selected_support_rows: Number(usageSourceFreshnessRefresh.counts?.impacted_selected_support_rows || 0),
    source_freshness_refresh_promoted_run_targets: Number(usageSourceFreshnessRefresh.counts?.promoted_run_targets || 0),
    source_freshness_refresh_source_text_read: Number(usageSourceFreshnessRefresh.counts?.source_text_read || 0),
    source_freshness_refresh_broad_target_expansion: Number(usageSourceFreshnessRefresh.counts?.broad_target_expansion || 0),
    source_freshness_refresh_reader_facing_rows: Number(usageSourceFreshnessRefresh.counts?.reader_facing_rows || 0),
    source_freshness_refresh_route_payload_field_hits: Number(usageSourceFreshnessRefresh.counts?.route_payload_field_hits || 0),
    source_freshness_refresh_forbidden_authority_field_hits: Number(usageSourceFreshnessRefresh.counts?.forbidden_authority_field_hits || 0),
    source_freshness_refresh_prior_pending_delta: Number(usageSourceFreshnessRefresh.counts?.current_vs_prior_pending_delta || 0),
    freshness_followup_live_dirty_source_files: Number(usageFreshnessFollowup.counts?.live_dirty_source_files || 0),
    freshness_followup_overlap_sources: Number(usageFreshnessFollowup.counts?.dirty_sources_with_current_usage_overlap || 0),
    freshness_followup_impacted_navigation_rows: Number(usageFreshnessFollowup.counts?.impacted_navigation_rows || 0),
    freshness_followup_current_route_ids: Number(usageFreshnessFollowup.counts?.current_route_ids || 0),
    freshness_followup_queue_mutations: Number(usageFreshnessFollowup.counts?.queue_mutations || 0),
    freshness_followup_submitted_to_agent6: Number(usageFreshnessFollowup.counts?.submitted_to_agent6 || 0),
    freshness_followup_forbidden_authority_field_hits: Number(usageFreshnessFollowup.counts?.forbidden_authority_field_hits || 0),
    crossmatch_inventory_files: Number(crossmatchInventoryPacket.counts?.files_in_inventory || 0),
    crossmatch_inventory_dirty_or_uncommitted_files: Number(crossmatchInventoryPacket.counts?.dirty_or_uncommitted_files || 0),
    crossmatch_inventory_forbidden_truthy_authority_claims: Number(crossmatchInventoryPacket.counts?.forbidden_truthy_authority_claims || 0),
    agent10_crossmatch_direct_state_dirty_or_uncommitted_files: Number(agent10CrossmatchDirectStateReconciliation.schema_counts?.direct_state_agent3_dirty_or_uncommitted_files || 0),
    agent10_crossmatch_fresh_consumption_dirty_or_uncommitted_files: Number(agent10CrossmatchDirectStateReconciliation.schema_counts?.fresh_consumption_agent3_dirty_or_uncommitted_files || 0),
    agent10_crossmatch_current_inventory_dirty_or_uncommitted_files: Number(agent10CrossmatchDirectStateReconciliation.schema_counts?.current_inventory_dirty_or_uncommitted_files || 0),
    agent10_crossmatch_stale_dirty_count_delta: Number(agent10CrossmatchDirectStateReconciliation.schema_counts?.stale_dirty_count_delta || 0),
    agent10_crossmatch_current_inventory_blocker_count: Number(agent10CrossmatchDirectStateReconciliation.schema_counts?.current_inventory_blocker_count || 0),
    agent10_crossmatch_control_edits: Number(agent10CrossmatchDirectStateReconciliation.schema_counts?.control_edits || 0),
    agent10_crossmatch_agent6_boundary_packets_opened: Number(agent10CrossmatchDirectStateReconciliation.schema_counts?.agent6_boundary_packets_opened || 0),
    post_crossmatch_wake_queue_stale_deuteronomy_rows: Number(postCrossmatchReconciliationWakeAudit.schema_counts?.queue_stale_deuteronomy_contract_gap_rows || 0),
    post_crossmatch_wake_agent10_stale_dirty_count_delta: Number(postCrossmatchReconciliationWakeAudit.schema_counts?.stale_direct_dirty_count_delta || 0),
    post_crossmatch_wake_current_inventory_dirty_files: Number(postCrossmatchReconciliationWakeAudit.schema_counts?.current_inventory_dirty_or_uncommitted_files || 0),
    post_crossmatch_wake_registered_continuity_rows: Number(postCrossmatchReconciliationWakeAudit.schema_counts?.spark10_agent3_continuity_registered_rows || 0),
    post_crossmatch_wake_direct_executable_worksets: Number(postCrossmatchReconciliationWakeAudit.schema_counts?.direct_agent3_executable_worksets || 0),
    post_crossmatch_wake_no_new_workset_blockers: Number(postCrossmatchReconciliationWakeAudit.schema_counts?.no_new_agent3_workset_blockers || 0),
    post_crossmatch_wake_agent6_boundary_packets_opened: Number(postCrossmatchReconciliationWakeAudit.schema_counts?.agent6_boundary_packets_opened || 0),
    orot_route_selection_rows: Number(orotRouteSelectionCrossmatchMatrix.counts?.token_index_rows || 0),
    orot_route_selection_occurrence_links: Number(orotRouteSelectionCrossmatchMatrix.counts?.occurrence_links || 0),
    orot_route_selection_candidate_mismatches: Number(orotRouteSelectionCrossmatchMatrix.counts?.candidate_selection_mismatch_rows || 0),
    orot_route_selection_token_index_linkage_gaps: Number(orotRouteSelectionCrossmatchMatrix.counts?.candidate_token_index_linkage_gap_rows || 0),
    orot_route_selection_exact_blockers: Number(orotRouteSelectionCrossmatchMatrix.counts?.exact_blocker_rows || 0),
    orot_route_selection_route_payload_field_hits: Number(orotRouteSelectionCrossmatchMatrix.counts?.route_payload_field_hits || 0),
    orot_route_selection_forbidden_authority_field_hits: Number(orotRouteSelectionCrossmatchMatrix.counts?.forbidden_authority_field_hits || 0),
    post_route_selection_wake_current_executable_worksets: Number(postRouteSelectionWakeAudit.schema_counts?.current_direct_executable_worksets || 0),
    post_route_selection_wake_exact_blockers: Number(postRouteSelectionWakeAudit.schema_counts?.exact_blockers || 0),
    post_route_selection_wake_conditions: Number(postRouteSelectionWakeAudit.schema_counts?.wake_conditions || 0),
    post_route_selection_wake_queue_mutations: Number(postRouteSelectionWakeAudit.schema_counts?.queue_mutations || 0),
    post_route_selection_wake_acceptance_claims: Number(postRouteSelectionWakeAudit.schema_counts?.acceptance_claims || 0),
    old_dictionary_row_overlap_buckets: Number(oldDictionaryRowOverlapLinkageMatrix.counts?.bucket_rows || 0),
    old_dictionary_row_overlap_rows: Number(oldDictionaryRowOverlapLinkageMatrix.counts?.represented_rows || 0),
    old_dictionary_row_overlap_occurrences: Number(oldDictionaryRowOverlapLinkageMatrix.counts?.represented_occurrences || 0),
    old_dictionary_row_overlap_duplicate_sample_tokens: Number(oldDictionaryRowOverlapLinkageMatrix.counts?.duplicate_sample_token_ids || 0),
    old_dictionary_row_overlap_source_family_pointer_rows: Number(oldDictionaryRowOverlapLinkageMatrix.counts?.source_family_pointer_rows || 0),
    old_dictionary_row_overlap_exact_blockers: Number(oldDictionaryRowOverlapLinkageMatrix.counts?.exact_blocker_rows || 0),
    old_dictionary_row_overlap_audit_zero_rows: Number(oldDictionaryRowOverlapLinkageMatrix.counts?.audit_zero_row_records || 0),
    old_dictionary_row_overlap_route_payload_field_hits: Number(oldDictionaryRowOverlapLinkageMatrix.counts?.route_payload_field_hits || 0),
    old_dictionary_row_overlap_forbidden_authority_field_hits: Number(oldDictionaryRowOverlapLinkageMatrix.counts?.forbidden_authority_field_hits || 0),
    old_dictionary_row_overlap_acceptance_claims: Number(oldDictionaryRowOverlapLinkageMatrix.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_rows: Number(oldDictionaryCandidateUseContinuityCrossmatch.counts?.candidate_use_rows || 0),
    old_dictionary_candidate_use_occurrences: Number(oldDictionaryCandidateUseContinuityCrossmatch.counts?.candidate_use_occurrences || 0),
    old_dictionary_candidate_use_sample_linked_rows: Number(oldDictionaryCandidateUseContinuityCrossmatch.counts?.row_overlap_sample_linked_rows || 0),
    old_dictionary_candidate_use_sample_unlinked_rows: Number(oldDictionaryCandidateUseContinuityCrossmatch.counts?.row_overlap_sample_unlinked_rows || 0),
    old_dictionary_candidate_use_blocker_link_rows: Number(oldDictionaryCandidateUseContinuityCrossmatch.counts?.rows_with_source_family_blocker_links || 0),
    old_dictionary_candidate_use_duplicate_queue_ids: Number(oldDictionaryCandidateUseContinuityCrossmatch.counts?.duplicate_queue_ids || 0),
    old_dictionary_candidate_use_duplicate_token_ids: Number(oldDictionaryCandidateUseContinuityCrossmatch.counts?.duplicate_token_ids || 0),
    old_dictionary_candidate_use_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseContinuityCrossmatch.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_acceptance_claims: Number(oldDictionaryCandidateUseContinuityCrossmatch.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_source_family_rows: Number(oldDictionaryCandidateUseSourceFamilyBlockerMatrix.counts?.source_family_rows || 0),
    old_dictionary_candidate_use_source_family_set_rows: Number(oldDictionaryCandidateUseSourceFamilyBlockerMatrix.counts?.source_family_set_rows || 0),
    old_dictionary_candidate_use_source_family_membership_rows: Number(oldDictionaryCandidateUseSourceFamilyBlockerMatrix.counts?.source_family_membership_rows || 0),
    old_dictionary_candidate_use_source_family_membership_occurrences: Number(oldDictionaryCandidateUseSourceFamilyBlockerMatrix.counts?.source_family_membership_occurrences || 0),
    old_dictionary_candidate_use_source_family_multi_rows: Number(oldDictionaryCandidateUseSourceFamilyBlockerMatrix.counts?.multi_family_candidate_rows || 0),
    old_dictionary_candidate_use_source_family_single_rows: Number(oldDictionaryCandidateUseSourceFamilyBlockerMatrix.counts?.single_family_candidate_rows || 0),
    old_dictionary_candidate_use_source_family_exact_blockers: Number(oldDictionaryCandidateUseSourceFamilyBlockerMatrix.counts?.exact_blocker_rows || 0),
    old_dictionary_candidate_use_source_family_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseSourceFamilyBlockerMatrix.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_source_family_acceptance_claims: Number(oldDictionaryCandidateUseSourceFamilyBlockerMatrix.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_source_rid_references: Number(oldDictionaryCandidateUseSourceRidContinuityCrossmatch.counts?.source_rid_references || 0),
    old_dictionary_candidate_use_source_rid_unique: Number(oldDictionaryCandidateUseSourceRidContinuityCrossmatch.counts?.unique_source_rids || 0),
    old_dictionary_candidate_use_source_rid_prefix_rows: Number(oldDictionaryCandidateUseSourceRidContinuityCrossmatch.counts?.source_rid_prefix_rows || 0),
    old_dictionary_candidate_use_source_rid_rows_with_metadata: Number(oldDictionaryCandidateUseSourceRidContinuityCrossmatch.counts?.rows_with_agent1_citation_metadata || 0),
    old_dictionary_candidate_use_source_rid_rows_with_all_metadata_rids: Number(oldDictionaryCandidateUseSourceRidContinuityCrossmatch.counts?.rows_with_all_source_rids_in_agent1_metadata || 0),
    old_dictionary_candidate_use_source_rid_missing_prefixes: Number(oldDictionaryCandidateUseSourceRidContinuityCrossmatch.counts?.source_rid_prefixes_missing_namespace || 0),
    old_dictionary_candidate_use_source_rid_unused_namespace_prefixes: Number(oldDictionaryCandidateUseSourceRidContinuityCrossmatch.counts?.namespace_prefixes_unused_by_candidate_package || 0),
    old_dictionary_candidate_use_source_rid_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseSourceRidContinuityCrossmatch.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_source_rid_acceptance_claims: Number(oldDictionaryCandidateUseSourceRidContinuityCrossmatch.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_exact_subset_matched_rows: Number(oldDictionaryCandidateUseExactSubsetCrossmatch.counts?.candidate_rows_matched_to_manifest || 0),
    old_dictionary_candidate_use_exact_subset_missing_rows: Number(oldDictionaryCandidateUseExactSubsetCrossmatch.counts?.candidate_rows_missing_manifest_subset || 0),
    old_dictionary_candidate_use_exact_subset_commercial_only_rows: Number(oldDictionaryCandidateUseExactSubsetCrossmatch.counts?.candidate_rows_commercial_clean_only || 0),
    old_dictionary_candidate_use_exact_subset_nc_overlap_rows: Number(oldDictionaryCandidateUseExactSubsetCrossmatch.counts?.candidate_rows_with_nc_overlap || 0),
    old_dictionary_candidate_use_exact_subset_blocked_overlap_rows: Number(oldDictionaryCandidateUseExactSubsetCrossmatch.counts?.candidate_rows_with_blocked_overlap || 0),
    old_dictionary_candidate_use_exact_subset_triple_overlap_rows: Number(oldDictionaryCandidateUseExactSubsetCrossmatch.counts?.candidate_rows_with_nc_and_blocked_overlap || 0),
    old_dictionary_candidate_use_exact_subset_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseExactSubsetCrossmatch.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_exact_subset_acceptance_claims: Number(oldDictionaryCandidateUseExactSubsetCrossmatch.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_boundary_triage_rows: Number(oldDictionaryCandidateUseBoundaryTriageNavigation.counts?.candidate_use_rows || 0),
    old_dictionary_candidate_use_boundary_triage_occurrences: Number(oldDictionaryCandidateUseBoundaryTriageNavigation.counts?.candidate_use_occurrences || 0),
    old_dictionary_candidate_use_boundary_triage_pure_clean_rows: Number(oldDictionaryCandidateUseBoundaryTriageNavigation.counts?.pure_commercial_clean_rows || 0),
    old_dictionary_candidate_use_boundary_triage_overlap_rows: Number(oldDictionaryCandidateUseBoundaryTriageNavigation.counts?.overlap_rows || 0),
    old_dictionary_candidate_use_boundary_triage_bucket_family_sets: Number(oldDictionaryCandidateUseBoundaryTriageNavigation.counts?.bucket_source_family_set_rows || 0),
    old_dictionary_candidate_use_boundary_triage_missing_family_boundary_links: Number(oldDictionaryCandidateUseBoundaryTriageNavigation.counts?.rows_with_missing_family_boundary_links || 0),
    old_dictionary_candidate_use_boundary_triage_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseBoundaryTriageNavigation.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_boundary_triage_acceptance_claims: Number(oldDictionaryCandidateUseBoundaryTriageNavigation.counts?.acceptance_claims || 0),
    old_dictionary_pure_commercial_candidate_use_workset_rows: Number(oldDictionaryPureCommercialCandidateUseBoundaryWorkset.counts?.workset_rows || 0),
    old_dictionary_pure_commercial_candidate_use_workset_occurrences: Number(oldDictionaryPureCommercialCandidateUseBoundaryWorkset.counts?.workset_occurrences || 0),
    old_dictionary_pure_commercial_candidate_use_workset_source_rids: Number(oldDictionaryPureCommercialCandidateUseBoundaryWorkset.counts?.unique_source_rids || 0),
    old_dictionary_pure_commercial_candidate_use_workset_blocker_rows: Number(oldDictionaryPureCommercialCandidateUseBoundaryWorkset.counts?.blocker_rows || 0),
    old_dictionary_pure_commercial_candidate_use_workset_transform_ready_rows: Number(oldDictionaryPureCommercialCandidateUseBoundaryWorkset.counts?.transform_ready_rows || 0),
    old_dictionary_pure_commercial_candidate_use_workset_forbidden_payload_field_hits: Number(oldDictionaryPureCommercialCandidateUseBoundaryWorkset.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_pure_commercial_candidate_use_workset_acceptance_claims: Number(oldDictionaryPureCommercialCandidateUseBoundaryWorkset.counts?.acceptance_claims || 0),
    old_dictionary_overlap_candidate_use_workset_rows: Number(oldDictionaryOverlapCandidateUseBoundaryWorkset.counts?.workset_rows || 0),
    old_dictionary_overlap_candidate_use_workset_occurrences: Number(oldDictionaryOverlapCandidateUseBoundaryWorkset.counts?.workset_occurrences || 0),
    old_dictionary_overlap_candidate_use_workset_unique_source_rids: Number(oldDictionaryOverlapCandidateUseBoundaryWorkset.counts?.unique_source_rids || 0),
    old_dictionary_overlap_candidate_use_workset_blocker_rows: Number(oldDictionaryOverlapCandidateUseBoundaryWorkset.counts?.blocker_rows || 0),
    old_dictionary_overlap_candidate_use_workset_bucket_family_sets: Number(oldDictionaryOverlapCandidateUseBoundaryWorkset.counts?.bucket_source_family_set_rows || 0),
    old_dictionary_overlap_candidate_use_workset_transform_ready_rows: Number(oldDictionaryOverlapCandidateUseBoundaryWorkset.counts?.transform_ready_rows || 0),
    old_dictionary_overlap_candidate_use_workset_forbidden_payload_field_hits: Number(oldDictionaryOverlapCandidateUseBoundaryWorkset.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_overlap_candidate_use_workset_acceptance_claims: Number(oldDictionaryOverlapCandidateUseBoundaryWorkset.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_split_closure_rows: Number(oldDictionaryCandidateUseSplitClosureCrossmatch.counts?.closure_rows || 0),
    old_dictionary_candidate_use_split_closure_occurrences: Number(oldDictionaryCandidateUseSplitClosureCrossmatch.counts?.closure_occurrences || 0),
    old_dictionary_candidate_use_split_closure_missing_rows: Number(oldDictionaryCandidateUseSplitClosureCrossmatch.counts?.missing_from_closure_rows || 0),
    old_dictionary_candidate_use_split_closure_extra_rows: Number(oldDictionaryCandidateUseSplitClosureCrossmatch.counts?.extra_in_closure_rows || 0),
    old_dictionary_candidate_use_split_closure_duplicate_queue_ids: Number(oldDictionaryCandidateUseSplitClosureCrossmatch.counts?.closure_duplicate_queue_ids || 0),
    old_dictionary_candidate_use_split_closure_cross_partition_duplicate_queue_ids: Number(oldDictionaryCandidateUseSplitClosureCrossmatch.counts?.cross_partition_duplicate_queue_ids || 0),
    old_dictionary_candidate_use_split_closure_shared_source_rids: Number(oldDictionaryCandidateUseSplitClosureCrossmatch.counts?.cross_partition_shared_source_rids || 0),
    old_dictionary_candidate_use_split_closure_transform_ready_rows: Number(oldDictionaryCandidateUseSplitClosureCrossmatch.counts?.transform_ready_rows || 0),
    old_dictionary_candidate_use_split_closure_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseSplitClosureCrossmatch.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_split_closure_acceptance_claims: Number(oldDictionaryCandidateUseSplitClosureCrossmatch.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_handoff_index_entries: Number(oldDictionaryCandidateUseHandoffIndex.counts?.handoff_entries || 0),
    old_dictionary_candidate_use_handoff_index_json_artifacts_exist: Number(oldDictionaryCandidateUseHandoffIndex.counts?.json_artifacts_exist || 0),
    old_dictionary_candidate_use_handoff_index_report_artifacts_exist: Number(oldDictionaryCandidateUseHandoffIndex.counts?.report_artifacts_exist || 0),
    old_dictionary_candidate_use_handoff_index_validator_scripts_exist: Number(oldDictionaryCandidateUseHandoffIndex.counts?.validator_scripts_exist || 0),
    old_dictionary_candidate_use_handoff_index_artifact_type_mismatches: Number(oldDictionaryCandidateUseHandoffIndex.counts?.artifact_type_mismatches || 0),
    old_dictionary_candidate_use_handoff_index_entries_with_authority_issues: Number(oldDictionaryCandidateUseHandoffIndex.counts?.entries_with_nonzero_authority_counters || 0),
    old_dictionary_candidate_use_handoff_index_split_missing_rows: Number(oldDictionaryCandidateUseHandoffIndex.counts?.split_closure_missing_rows || 0),
    old_dictionary_candidate_use_handoff_index_split_duplicate_queue_ids: Number(oldDictionaryCandidateUseHandoffIndex.counts?.split_closure_duplicate_queue_ids || 0),
    old_dictionary_candidate_use_handoff_index_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseHandoffIndex.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_handoff_index_acceptance_claims: Number(oldDictionaryCandidateUseHandoffIndex.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_row_lineage_rows: Number(oldDictionaryCandidateUseRowLineageMatrix.counts?.row_lineage_rows || 0),
    old_dictionary_candidate_use_row_lineage_occurrences: Number(oldDictionaryCandidateUseRowLineageMatrix.counts?.row_lineage_occurrences || 0),
    old_dictionary_candidate_use_row_lineage_all_layers_linked: Math.min(
      Number(oldDictionaryCandidateUseRowLineageMatrix.counts?.continuity_rows_linked || 0),
      Number(oldDictionaryCandidateUseRowLineageMatrix.counts?.source_rid_rows_linked || 0),
      Number(oldDictionaryCandidateUseRowLineageMatrix.counts?.exact_subset_rows_linked || 0),
      Number(oldDictionaryCandidateUseRowLineageMatrix.counts?.boundary_triage_rows_linked || 0),
      Number(oldDictionaryCandidateUseRowLineageMatrix.counts?.split_closure_rows_linked || 0),
    ),
    old_dictionary_candidate_use_row_lineage_gap_rows: Number(oldDictionaryCandidateUseRowLineageMatrix.counts?.lineage_gap_rows || 0),
    old_dictionary_candidate_use_row_lineage_duplicate_queue_ids: Number(oldDictionaryCandidateUseRowLineageMatrix.counts?.duplicate_queue_ids || 0),
    old_dictionary_candidate_use_row_lineage_source_rid_refs: Number(oldDictionaryCandidateUseRowLineageMatrix.counts?.source_rid_references || 0),
    old_dictionary_candidate_use_row_lineage_unique_source_rids: Number(oldDictionaryCandidateUseRowLineageMatrix.counts?.unique_source_rids || 0),
    old_dictionary_candidate_use_row_lineage_agent2_queue_pointers: Number(oldDictionaryCandidateUseRowLineageMatrix.counts?.agent2_queue_pointer_rows || 0),
    old_dictionary_candidate_use_row_lineage_transform_ready_rows: Number(oldDictionaryCandidateUseRowLineageMatrix.counts?.transform_ready_rows || 0),
    old_dictionary_candidate_use_row_lineage_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseRowLineageMatrix.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_row_lineage_acceptance_claims: Number(oldDictionaryCandidateUseRowLineageMatrix.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_boundary_chain_rows: Number(oldDictionaryCandidateUseBoundaryChainCrossmatch.counts?.row_crossmatch_rows || 0),
    old_dictionary_candidate_use_boundary_chain_occurrences: Number(oldDictionaryCandidateUseBoundaryChainCrossmatch.counts?.row_crossmatch_occurrences || 0),
    old_dictionary_candidate_use_boundary_chain_preboundary_matches: Number(oldDictionaryCandidateUseBoundaryChainCrossmatch.counts?.preboundary_rows_matched || 0),
    old_dictionary_candidate_use_boundary_chain_zero_text_matches: Number(oldDictionaryCandidateUseBoundaryChainCrossmatch.counts?.zero_text_rows_matched || 0),
    old_dictionary_candidate_use_boundary_chain_missing_rows: Number(oldDictionaryCandidateUseBoundaryChainCrossmatch.counts?.missing_preboundary_rows || 0) + Number(oldDictionaryCandidateUseBoundaryChainCrossmatch.counts?.missing_zero_text_rows || 0),
    old_dictionary_candidate_use_boundary_chain_extra_rows: Number(oldDictionaryCandidateUseBoundaryChainCrossmatch.counts?.extra_preboundary_rows || 0) + Number(oldDictionaryCandidateUseBoundaryChainCrossmatch.counts?.extra_zero_text_rows || 0),
    old_dictionary_candidate_use_boundary_chain_mismatch_rows: Number(oldDictionaryCandidateUseBoundaryChainCrossmatch.counts?.token_mismatch_rows || 0) + Number(oldDictionaryCandidateUseBoundaryChainCrossmatch.counts?.occurrence_mismatch_rows || 0),
    old_dictionary_candidate_use_boundary_chain_current_transform_blockers: Number(oldDictionaryCandidateUseBoundaryChainCrossmatch.counts?.current_transform_blocker_rows || 0),
    old_dictionary_candidate_use_boundary_chain_zero_counter_violations: Number(oldDictionaryCandidateUseBoundaryChainCrossmatch.counts?.preboundary_row_zero_counter_violations || 0) + Number(oldDictionaryCandidateUseBoundaryChainCrossmatch.counts?.zero_text_row_zero_counter_violations || 0),
    old_dictionary_candidate_use_boundary_chain_copied_review_pointer_fields: Number(oldDictionaryCandidateUseBoundaryChainCrossmatch.counts?.copied_review_pointer_payload_fields || 0),
    old_dictionary_candidate_use_boundary_chain_transform_ready_rows: Number(oldDictionaryCandidateUseBoundaryChainCrossmatch.counts?.transform_ready_rows || 0),
    old_dictionary_candidate_use_boundary_chain_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseBoundaryChainCrossmatch.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_boundary_chain_acceptance_claims: Number(oldDictionaryCandidateUseBoundaryChainCrossmatch.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_source_citation_dependency_rows: Number(oldDictionaryCandidateUseSourceCitationDependencyCrossmatch.counts?.row_dependency_rows || 0),
    old_dictionary_candidate_use_source_citation_dependency_occurrences: Number(oldDictionaryCandidateUseSourceCitationDependencyCrossmatch.counts?.row_dependency_occurrences || 0),
    old_dictionary_candidate_use_source_citation_dependency_missing_citation_rows: Number(oldDictionaryCandidateUseSourceCitationDependencyCrossmatch.counts?.source_citation_missing_rows || 0),
    old_dictionary_candidate_use_source_citation_dependency_missing_transform_rule_rows: Number(oldDictionaryCandidateUseSourceCitationDependencyCrossmatch.counts?.transform_rule_missing_rows || 0),
    old_dictionary_candidate_use_source_citation_dependency_source_rid_refs: Number(oldDictionaryCandidateUseSourceCitationDependencyCrossmatch.counts?.source_rid_references || 0),
    old_dictionary_candidate_use_source_citation_dependency_unique_source_rids: Number(oldDictionaryCandidateUseSourceCitationDependencyCrossmatch.counts?.unique_source_rids || 0),
    old_dictionary_candidate_use_source_citation_dependency_exact_blockers: Number(oldDictionaryCandidateUseSourceCitationDependencyCrossmatch.counts?.exact_blocker_rows || 0),
    old_dictionary_candidate_use_source_citation_dependency_stale_agent1_route_blockers: Number(oldDictionaryCandidateUseSourceCitationDependencyCrossmatch.counts?.stale_agent1_route_blocker_rows || 0),
    old_dictionary_candidate_use_source_citation_dependency_transform_ready_rows: Number(oldDictionaryCandidateUseSourceCitationDependencyCrossmatch.counts?.transform_ready_rows || 0),
    old_dictionary_candidate_use_source_citation_dependency_source_acceptance_claims: Number(oldDictionaryCandidateUseSourceCitationDependencyCrossmatch.counts?.source_acceptance_claims || 0),
    old_dictionary_candidate_use_source_citation_dependency_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseSourceCitationDependencyCrossmatch.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_source_citation_dependency_acceptance_claims: Number(oldDictionaryCandidateUseSourceCitationDependencyCrossmatch.counts?.acceptance_claims || 0),
    old_dictionary_candidate_use_agent1_route_recheck_rows: Number(oldDictionaryCandidateUseAgent1RouteRecheckCrossmatch.counts?.route_recheck_rows || 0),
    old_dictionary_candidate_use_agent1_route_recheck_required_rows: Number(oldDictionaryCandidateUseAgent1RouteRecheckCrossmatch.counts?.route_recheck_required_rows || 0),
    old_dictionary_candidate_use_agent1_route_recheck_target_matches_registry_rows: Number(oldDictionaryCandidateUseAgent1RouteRecheckCrossmatch.counts?.attempted_target_matches_registry_rows || 0),
    old_dictionary_candidate_use_agent1_route_recheck_registry_postdates_blocker_rows: Number(oldDictionaryCandidateUseAgent1RouteRecheckCrossmatch.counts?.registry_postdates_route_blocker_rows || 0),
    old_dictionary_candidate_use_agent1_route_recheck_missing_citation_rows: Number(oldDictionaryCandidateUseAgent1RouteRecheckCrossmatch.counts?.source_citation_missing_rows || 0),
    old_dictionary_candidate_use_agent1_route_recheck_missing_transform_rule_rows: Number(oldDictionaryCandidateUseAgent1RouteRecheckCrossmatch.counts?.transform_rule_missing_rows || 0),
    old_dictionary_candidate_use_agent1_route_recheck_delivery_attempts_by_agent3: Number(oldDictionaryCandidateUseAgent1RouteRecheckCrossmatch.counts?.delivery_attempts_by_agent3 || 0),
    old_dictionary_candidate_use_agent1_route_recheck_transform_ready_rows: Number(oldDictionaryCandidateUseAgent1RouteRecheckCrossmatch.counts?.transform_ready_rows || 0),
    old_dictionary_candidate_use_agent1_route_recheck_forbidden_payload_field_hits: Number(oldDictionaryCandidateUseAgent1RouteRecheckCrossmatch.counts?.forbidden_payload_field_hits || 0),
    old_dictionary_candidate_use_agent1_route_recheck_acceptance_claims: Number(oldDictionaryCandidateUseAgent1RouteRecheckCrossmatch.counts?.acceptance_claims || 0),
    proof_occurrence_rows: Number(usageAgent6Packet.counts?.proof_occurrence_rows || 0),
    proof_rows_with_complete_metadata: completeProofRows(usageAgent6Packet),
    proof_rows_with_hebrew_context: Number(usageAgent6Packet.counts?.proof_rows_with_hebrew_context || 0),
    proof_mojibake_rows: Number(usageAgent6Packet.counts?.proof_mojibake_rows || 0),
    reader_facing_rows: Number(usageAgent6Packet.counts?.reader_facing_rows || 0),
    route_payload_field_hits: Number(usageAgent6Packet.counts?.route_payload_field_hits || 0),
    forbidden_authority_field_hits: Number(usageAgent6Packet.counts?.forbidden_authority_field_hits || 0),
    smoke_steps: Number(smokeValidation.counts?.steps || 0),
    smoke_failed_steps: Number(smokeValidation.counts?.failed_steps || 0),
  };
}

function buildChecks(counts) {
  return [
    check('registry_state_file_present', agent.state_file === options.report ? 'passed' : 'failed', `registry ${agent.state_file || 'missing'}; report ${options.report}`),
    check(
      'goal_boundary_loaded',
      goal.id === 'agent3-definition-occurrence-links' ? 'passed' : 'failed',
      `goal ${goal.id || 'missing'}; approval A07; evidence A06; stored acceptance ${goal.acceptance_owner || 'missing'}`,
    ),
    check('evidence_artifacts_exist', counts.evidence_artifacts_exist === counts.evidence_artifacts ? 'passed' : 'failed', `${counts.evidence_artifacts_exist}/${counts.evidence_artifacts}`),
    check('validator_scripts_exist', counts.validator_scripts_exist === counts.validator_scripts ? 'passed' : 'failed', `${counts.validator_scripts_exist}/${counts.validator_scripts}`),
    check('queue_ready_not_submitted', counts.queue_required_fields_present === counts.queue_required_fields && counts.queue_mutations === 0 && counts.submitted_to_agent6 === 0 ? 'passed' : 'failed', `fields ${counts.queue_required_fields_present}/${counts.queue_required_fields}; mutations ${counts.queue_mutations}; submitted ${counts.submitted_to_agent6}`),
    check('usage_counts_nonzero', counts.usage_supported_rows + counts.usage_candidate_rows + counts.usage_weak_rows > 0 ? 'passed' : 'failed', `supported/candidate/weak ${counts.usage_supported_rows}/${counts.usage_candidate_rows}/${counts.usage_weak_rows}`),
    check('ambiguous_audit_only_visible', counts.audit_only_ambiguous_rows > 0 && counts.reader_facing_rows === 0 ? 'passed' : 'failed', `ambiguous ${counts.audit_only_ambiguous_rows}; reader-facing ${counts.reader_facing_rows}`),
    check('occurrence_links_complete', counts.occurrence_link_rows > 0 && counts.occurrence_link_rows_with_complete_metadata === counts.occurrence_link_rows && counts.occurrence_link_reader_facing_rows === 0 && counts.occurrence_link_route_payload_field_hits === 0 && counts.occurrence_link_forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `rows/complete/reader-facing/payload/forbidden ${counts.occurrence_link_rows}/${counts.occurrence_link_rows_with_complete_metadata}/${counts.occurrence_link_reader_facing_rows}/${counts.occurrence_link_route_payload_field_hits}/${counts.occurrence_link_forbidden_authority_field_hits}`),
    check('route_resolution_complete', counts.route_resolution_occurrence_route_rows === counts.occurrence_link_rows && counts.route_resolution_route_ids > 0 && counts.route_resolution_resolved_route_ids === counts.route_resolution_route_ids && counts.route_resolution_unresolved_route_ids === 0 && counts.route_resolution_reader_facing_rows === 0 && counts.route_resolution_route_payload_field_hits === 0 && counts.route_resolution_forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `rows ${counts.route_resolution_occurrence_route_rows}; routes resolved/unresolved ${counts.route_resolution_resolved_route_ids}/${counts.route_resolution_unresolved_route_ids}; reader-facing/payload/forbidden ${counts.route_resolution_reader_facing_rows}/${counts.route_resolution_route_payload_field_hits}/${counts.route_resolution_forbidden_authority_field_hits}`),
    check('crossmatch_neighbors_complete', counts.crossmatch_neighbor_source_occurrence_rows === counts.occurrence_link_rows && counts.crossmatch_neighbor_link_rows > 0 && counts.crossmatch_neighbor_same_frame_links > 0 && counts.crossmatch_neighbor_bridge_frame_links > 0 && counts.crossmatch_neighbor_route_ids > 0 && counts.crossmatch_neighbor_unresolved_route_ids === 0 && counts.crossmatch_neighbor_reader_facing_rows === 0 && counts.crossmatch_neighbor_route_payload_field_hits === 0 && counts.crossmatch_neighbor_forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `rows/links ${counts.crossmatch_neighbor_source_occurrence_rows}/${counts.crossmatch_neighbor_link_rows}; same/bridge ${counts.crossmatch_neighbor_same_frame_links}/${counts.crossmatch_neighbor_bridge_frame_links}; route unresolved ${counts.crossmatch_neighbor_unresolved_route_ids}; reader-facing/payload/forbidden ${counts.crossmatch_neighbor_reader_facing_rows}/${counts.crossmatch_neighbor_route_payload_field_hits}/${counts.crossmatch_neighbor_forbidden_authority_field_hits}`),
    check('source_ref_buckets_complete', counts.source_ref_bucket_count > 0 && counts.source_ref_bucket_source_cluster_buckets >= counts.source_ref_bucket_count && counts.source_ref_bucket_occurrence_rows === counts.occurrence_link_rows && counts.source_ref_bucket_duplicate_source_ref_buckets > 0 && counts.source_ref_bucket_cross_cluster_source_ref_buckets > 0 && counts.source_ref_bucket_route_ids > 0 && counts.source_ref_bucket_unresolved_route_ids === 0 && counts.source_ref_bucket_reader_facing_rows === 0 && counts.source_ref_bucket_route_payload_field_hits === 0 && counts.source_ref_bucket_forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `source/source-cluster/rows ${counts.source_ref_bucket_count}/${counts.source_ref_bucket_source_cluster_buckets}/${counts.source_ref_bucket_occurrence_rows}; duplicate/cross-cluster ${counts.source_ref_bucket_duplicate_source_ref_buckets}/${counts.source_ref_bucket_cross_cluster_source_ref_buckets}; reader-facing/payload/forbidden ${counts.source_ref_bucket_reader_facing_rows}/${counts.source_ref_bucket_route_payload_field_hits}/${counts.source_ref_bucket_forbidden_authority_field_hits}`),
    check('work_buckets_complete', counts.work_bucket_count > 0 && counts.work_bucket_work_frame_buckets >= counts.work_bucket_count && counts.work_bucket_occurrence_rows === counts.occurrence_link_rows && counts.work_bucket_source_refs > 0 && counts.work_bucket_multi_source_work_buckets > 0 && counts.work_bucket_multi_frame_work_buckets > 0 && counts.work_bucket_route_ids > 0 && counts.work_bucket_unresolved_route_ids === 0 && counts.work_bucket_reader_facing_rows === 0 && counts.work_bucket_route_payload_field_hits === 0 && counts.work_bucket_forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `works/work-frames/rows ${counts.work_bucket_count}/${counts.work_bucket_work_frame_buckets}/${counts.work_bucket_occurrence_rows}; source refs ${counts.work_bucket_source_refs}; multi-source/multi-frame ${counts.work_bucket_multi_source_work_buckets}/${counts.work_bucket_multi_frame_work_buckets}; reader-facing/payload/forbidden ${counts.work_bucket_reader_facing_rows}/${counts.work_bucket_route_payload_field_hits}/${counts.work_bucket_forbidden_authority_field_hits}`),
    check('provenance_buckets_complete', counts.provenance_bucket_count > 0 && counts.provenance_bucket_provenance_frame_buckets >= counts.provenance_bucket_count && counts.provenance_bucket_occurrence_rows === counts.occurrence_link_rows && counts.provenance_bucket_source_refs > 0 && counts.provenance_bucket_license_count > 1 && counts.provenance_bucket_version_source_count > 1 && counts.provenance_bucket_multi_work_buckets > 0 && counts.provenance_bucket_multi_frame_buckets > 0 && counts.provenance_bucket_route_ids > 0 && counts.provenance_bucket_unresolved_route_ids === 0 && counts.provenance_bucket_reader_facing_rows === 0 && counts.provenance_bucket_route_payload_field_hits === 0 && counts.provenance_bucket_forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `provenance/frame/rows ${counts.provenance_bucket_count}/${counts.provenance_bucket_provenance_frame_buckets}/${counts.provenance_bucket_occurrence_rows}; license/version sources ${counts.provenance_bucket_license_count}/${counts.provenance_bucket_version_source_count}; multi-work/multi-frame ${counts.provenance_bucket_multi_work_buckets}/${counts.provenance_bucket_multi_frame_buckets}; reader-facing/payload/forbidden ${counts.provenance_bucket_reader_facing_rows}/${counts.provenance_bucket_route_payload_field_hits}/${counts.provenance_bucket_forbidden_authority_field_hits}`),
    check('occurrence_detail_index_complete', counts.occurrence_detail_rows === counts.occurrence_link_rows && counts.occurrence_detail_rows_with_route_ids === counts.occurrence_detail_rows && counts.occurrence_detail_rows_with_source_link === counts.occurrence_detail_rows && counts.occurrence_detail_rows_with_work_anchor === counts.occurrence_detail_rows && counts.occurrence_detail_rows_with_hebrew_context === counts.occurrence_detail_rows && counts.occurrence_detail_rows_with_focus_marker === counts.occurrence_detail_rows && counts.occurrence_detail_rows_with_all_bucket_links === counts.occurrence_detail_rows && counts.occurrence_detail_route_ids > 0 && counts.occurrence_detail_unresolved_route_ids === 0 && counts.occurrence_detail_neighbor_links > 0 && counts.occurrence_detail_same_frame_neighbor_links > 0 && counts.occurrence_detail_bridge_frame_neighbor_links > 0 && counts.occurrence_detail_observed_usage_only_rows === counts.occurrence_detail_rows && counts.occurrence_detail_reader_facing_rows === 0 && counts.occurrence_detail_route_payload_field_hits === 0 && counts.occurrence_detail_forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `rows/source/work/context/focus/buckets ${counts.occurrence_detail_rows}/${counts.occurrence_detail_rows_with_source_link}/${counts.occurrence_detail_rows_with_work_anchor}/${counts.occurrence_detail_rows_with_hebrew_context}/${counts.occurrence_detail_rows_with_focus_marker}/${counts.occurrence_detail_rows_with_all_bucket_links}; neighbors ${counts.occurrence_detail_neighbor_links}; reader-facing/payload/forbidden ${counts.occurrence_detail_reader_facing_rows}/${counts.occurrence_detail_route_payload_field_hits}/${counts.occurrence_detail_forbidden_authority_field_hits}`),
    check('facet_index_complete', counts.facet_index_occurrence_rows === counts.occurrence_detail_rows && counts.facet_index_facet_groups === 10 && counts.facet_index_facets_total > 0 && counts.facet_index_route_ids > 0 && counts.facet_index_max_route_share_basis_points === 10000 && counts.facet_index_route_concentration_warning === 1 && counts.facet_index_rows_with_source_link === counts.occurrence_detail_rows && counts.facet_index_rows_with_work_anchor === counts.occurrence_detail_rows && counts.facet_index_rows_with_context === counts.occurrence_detail_rows && counts.facet_index_rows_with_focus_marker === counts.occurrence_detail_rows && counts.facet_index_rows_with_license === counts.occurrence_detail_rows && counts.facet_index_rows_with_version === counts.occurrence_detail_rows && counts.facet_index_rows_with_route_ids === counts.occurrence_detail_rows && counts.facet_index_reader_facing_rows === 0 && counts.facet_index_route_payload_field_hits === 0 && counts.facet_index_forbidden_authority_field_hits === 0 ? 'warning' : 'failed', `rows/facets ${counts.facet_index_occurrence_rows}/${counts.facet_index_facets_total}; route share ${counts.facet_index_max_route_share_basis_points}/10000; concentration ${counts.facet_index_route_concentration_warning}; reader-facing/payload/forbidden ${counts.facet_index_reader_facing_rows}/${counts.facet_index_route_payload_field_hits}/${counts.facet_index_forbidden_authority_field_hits}`),
    check('context_token_index_complete', counts.context_token_index_occurrence_rows === counts.occurrence_detail_rows && counts.context_token_index_rows > 0 && counts.context_token_index_occurrences > counts.occurrence_detail_rows && counts.context_token_index_cross_frame_rows > 0 && counts.context_token_index_route_ids > 0 && counts.context_token_index_unresolved_route_ids === 0 && counts.context_token_index_route_concentration_warning === 1 && counts.context_token_index_rows_with_source_link === counts.occurrence_detail_rows && counts.context_token_index_rows_with_work_anchor === counts.occurrence_detail_rows && counts.context_token_index_rows_with_hebrew_context === counts.occurrence_detail_rows && counts.context_token_index_rows_with_focus_marker === counts.occurrence_detail_rows && counts.context_token_index_rows_with_license_metadata === counts.occurrence_detail_rows && counts.context_token_index_rows_with_version_metadata === counts.occurrence_detail_rows && counts.context_token_index_reader_facing_rows === 0 && counts.context_token_index_route_payload_field_hits === 0 && counts.context_token_index_forbidden_authority_field_hits === 0 ? 'warning' : 'failed', `tokens/appearances/cross-frame ${counts.context_token_index_rows}/${counts.context_token_index_occurrences}/${counts.context_token_index_cross_frame_rows}; repeated focus ${counts.context_token_index_repeated_focus_occurrences}; route unresolved/concentration ${counts.context_token_index_unresolved_route_ids}/${counts.context_token_index_route_concentration_warning}; reader-facing/payload/forbidden ${counts.context_token_index_reader_facing_rows}/${counts.context_token_index_route_payload_field_hits}/${counts.context_token_index_forbidden_authority_field_hits}`),
    check('context_token_links_complete', counts.context_token_link_rows === counts.context_token_link_focus_rows + counts.context_token_link_context_rows && counts.context_token_link_context_rows === counts.context_token_index_occurrences && counts.context_token_link_context_tokens === counts.context_token_index_rows && counts.context_token_link_occurrence_rows === counts.occurrence_detail_rows && counts.context_token_link_focus_rows === counts.occurrence_detail_rows && counts.context_token_link_context_rows > counts.occurrence_detail_rows && counts.context_token_link_repeated_focus_rows > 0 && counts.context_token_link_cross_frame_rows > 0 && counts.context_token_link_route_ids > 0 && counts.context_token_link_unresolved_route_ids === 0 && counts.context_token_link_max_route_share_basis_points === 10000 && counts.context_token_link_route_concentration_warning === 1 && counts.context_token_link_rows_with_source_link === counts.context_token_link_rows && counts.context_token_link_rows_with_work_anchor === counts.context_token_link_rows && counts.context_token_link_rows_with_hebrew_context === counts.context_token_link_rows && counts.context_token_link_rows_with_focus_marker === counts.context_token_link_rows && counts.context_token_link_rows_with_route_ids === counts.context_token_link_rows && counts.context_token_link_rows_with_license_metadata === counts.context_token_link_rows && counts.context_token_link_rows_with_version_metadata === counts.context_token_link_rows && counts.context_token_link_observed_usage_only_rows === counts.context_token_link_rows && counts.context_token_link_reader_facing_rows === 0 && counts.context_token_link_route_payload_field_hits === 0 && counts.context_token_link_forbidden_authority_field_hits === 0 ? 'warning' : 'failed', `links/tokens/occurrences ${counts.context_token_link_rows}/${counts.context_token_link_context_tokens}/${counts.context_token_link_occurrence_rows}; focus/context/cross-frame ${counts.context_token_link_focus_rows}/${counts.context_token_link_context_rows}/${counts.context_token_link_cross_frame_rows}; route unresolved/concentration ${counts.context_token_link_unresolved_route_ids}/${counts.context_token_link_route_concentration_warning}; reader-facing/payload/forbidden ${counts.context_token_link_reader_facing_rows}/${counts.context_token_link_route_payload_field_hits}/${counts.context_token_link_forbidden_authority_field_hits}`),
    check('context_token_occurrence_index_complete', counts.context_token_occurrence_index_rows === counts.context_token_link_context_tokens && counts.context_token_occurrence_index_link_rows === counts.context_token_link_rows && counts.context_token_occurrence_index_occurrence_rows === counts.occurrence_detail_rows && counts.context_token_occurrence_index_focus_rows === counts.context_token_link_focus_rows && counts.context_token_occurrence_index_context_rows === counts.context_token_link_context_rows && counts.context_token_occurrence_index_repeated_focus_rows > 0 && counts.context_token_occurrence_index_cross_frame_rows > 0 && counts.context_token_occurrence_index_cross_frame_link_rows > 0 && counts.context_token_occurrence_index_route_ids > 0 && counts.context_token_occurrence_index_unresolved_route_ids === 0 && counts.context_token_occurrence_index_max_route_share_basis_points === 10000 && counts.context_token_occurrence_index_route_concentration_warning === 1 && counts.context_token_occurrence_index_rows_with_source_link === counts.context_token_occurrence_index_link_rows && counts.context_token_occurrence_index_rows_with_work_anchor === counts.context_token_occurrence_index_link_rows && counts.context_token_occurrence_index_rows_with_hebrew_context === counts.context_token_occurrence_index_link_rows && counts.context_token_occurrence_index_rows_with_focus_marker === counts.context_token_occurrence_index_link_rows && counts.context_token_occurrence_index_rows_with_route_ids === counts.context_token_occurrence_index_link_rows && counts.context_token_occurrence_index_rows_with_license_metadata === counts.context_token_occurrence_index_link_rows && counts.context_token_occurrence_index_rows_with_version_metadata === counts.context_token_occurrence_index_link_rows && counts.context_token_occurrence_index_reader_facing_rows === 0 && counts.context_token_occurrence_index_route_payload_field_hits === 0 && counts.context_token_occurrence_index_forbidden_authority_field_hits === 0 ? 'warning' : 'failed', `rows/links/occurrences ${counts.context_token_occurrence_index_rows}/${counts.context_token_occurrence_index_link_rows}/${counts.context_token_occurrence_index_occurrence_rows}; focus/context/cross-frame ${counts.context_token_occurrence_index_focus_rows}/${counts.context_token_occurrence_index_context_rows}/${counts.context_token_occurrence_index_cross_frame_rows}; route unresolved/concentration ${counts.context_token_occurrence_index_unresolved_route_ids}/${counts.context_token_occurrence_index_route_concentration_warning}; reader-facing/payload/forbidden ${counts.context_token_occurrence_index_reader_facing_rows}/${counts.context_token_occurrence_index_route_payload_field_hits}/${counts.context_token_occurrence_index_forbidden_authority_field_hits}`),
    check('occurrence_context_profile_complete', counts.occurrence_context_profile_rows === counts.occurrence_detail_rows && counts.occurrence_context_profile_link_rows === counts.context_token_link_rows && counts.occurrence_context_profile_unique_context_tokens === counts.context_token_occurrence_index_rows && counts.occurrence_context_profile_reverse_index_rows === counts.context_token_occurrence_index_rows && counts.occurrence_context_profile_rows_with_reverse_index_ids === counts.occurrence_detail_rows && counts.occurrence_context_profile_rows_with_complete_reverse_index_mapping === counts.occurrence_detail_rows && counts.occurrence_context_profile_focus_rows === counts.context_token_link_focus_rows && counts.occurrence_context_profile_context_rows === counts.context_token_link_context_rows && counts.occurrence_context_profile_repeated_focus_rows > 0 && counts.occurrence_context_profile_cross_frame_rows > 0 && counts.occurrence_context_profile_route_ids > 0 && counts.occurrence_context_profile_unresolved_route_ids === 0 && counts.occurrence_context_profile_max_route_share_basis_points === 10000 && counts.occurrence_context_profile_route_concentration_warning === 1 && counts.occurrence_context_profile_rows_with_source_link === counts.occurrence_context_profile_rows && counts.occurrence_context_profile_rows_with_work_anchor === counts.occurrence_context_profile_rows && counts.occurrence_context_profile_rows_with_hebrew_context === counts.occurrence_context_profile_rows && counts.occurrence_context_profile_rows_with_focus_marker === counts.occurrence_context_profile_rows && counts.occurrence_context_profile_rows_with_route_ids === counts.occurrence_context_profile_rows && counts.occurrence_context_profile_rows_with_license_metadata === counts.occurrence_context_profile_rows && counts.occurrence_context_profile_rows_with_version_metadata === counts.occurrence_context_profile_rows && counts.occurrence_context_profile_reader_facing_rows === 0 && counts.occurrence_context_profile_route_payload_field_hits === 0 && counts.occurrence_context_profile_forbidden_authority_field_hits === 0 ? 'warning' : 'failed', `profiles/links/tokens/reverse ${counts.occurrence_context_profile_rows}/${counts.occurrence_context_profile_link_rows}/${counts.occurrence_context_profile_unique_context_tokens}/${counts.occurrence_context_profile_reverse_index_rows}; reverse-linked ${counts.occurrence_context_profile_rows_with_reverse_index_ids}/${counts.occurrence_context_profile_rows_with_complete_reverse_index_mapping}; focus/context/cross-frame ${counts.occurrence_context_profile_focus_rows}/${counts.occurrence_context_profile_context_rows}/${counts.occurrence_context_profile_cross_frame_rows}; reader-facing/payload/forbidden ${counts.occurrence_context_profile_reader_facing_rows}/${counts.occurrence_context_profile_route_payload_field_hits}/${counts.occurrence_context_profile_forbidden_authority_field_hits}`),
    check('route_diversity_probe_complete', counts.route_diversity_probe_occurrence_rows === counts.occurrence_detail_rows && counts.route_diversity_probe_route_ids === counts.occurrence_detail_route_ids && counts.route_diversity_probe_route_probe_rows === counts.route_diversity_probe_route_ids && counts.route_diversity_probe_max_route_share_basis_points === 10000 && counts.route_diversity_probe_concentration_warning === 1 && counts.route_diversity_probe_all_selected_rows_same_route === 1 && counts.route_diversity_probe_semantic_independence_claim_allowed === 0 && counts.route_diversity_probe_coverage_buckets_total > 0 && counts.route_diversity_probe_reader_facing_rows === 0 && counts.route_diversity_probe_route_payload_field_hits === 0 && counts.route_diversity_probe_forbidden_authority_field_hits === 0 ? 'warning' : 'failed', `rows/routes/probes ${counts.route_diversity_probe_occurrence_rows}/${counts.route_diversity_probe_route_ids}/${counts.route_diversity_probe_route_probe_rows}; max share ${counts.route_diversity_probe_max_route_share_basis_points}/10000; semantic independence allowed ${counts.route_diversity_probe_semantic_independence_claim_allowed}`),
    check('route_diversity_concentration_support_complete', counts.route_diversity_probe_concentration_support_selected_occurrence_refs === counts.route_diversity_probe_occurrence_rows && counts.route_diversity_probe_concentration_support_unique_source_refs > 1 && counts.route_diversity_probe_concentration_support_unique_works > 1 && counts.route_diversity_probe_concentration_support_unique_licenses > 1 && counts.route_diversity_probe_concentration_support_unique_version_sources > 1 && counts.route_diversity_probe_concentration_support_duplicate_source_ref_rows > 0 && counts.route_diversity_probe_concentration_support_recurring_signature_rows > 0 && counts.route_diversity_probe_concentration_support_cross_cluster_signature_rows > 0 && counts.route_diversity_probe_concentration_support_missing_signature_rows === 0 && counts.route_diversity_probe_concentration_support_missing_lookup_rows === 0 && counts.route_diversity_probe_concentration_support_final_authority === 0 && counts.route_diversity_probe_concentration_support_semantic_independence_allowed === 0 ? 'warning' : 'failed', `selected/source/work/license/version ${counts.route_diversity_probe_concentration_support_selected_occurrence_refs}/${counts.route_diversity_probe_concentration_support_unique_source_refs}/${counts.route_diversity_probe_concentration_support_unique_works}/${counts.route_diversity_probe_concentration_support_unique_licenses}/${counts.route_diversity_probe_concentration_support_unique_version_sources}; duplicate/recurring/cross-cluster ${counts.route_diversity_probe_concentration_support_duplicate_source_ref_rows}/${counts.route_diversity_probe_concentration_support_recurring_signature_rows}/${counts.route_diversity_probe_concentration_support_cross_cluster_signature_rows}; authority/semantic ${counts.route_diversity_probe_concentration_support_final_authority}/${counts.route_diversity_probe_concentration_support_semantic_independence_allowed}`),
    check('route_concentration_guardrail_complete', counts.route_concentration_guardrail_surfaces === 7 && counts.route_concentration_guardrail_single_route_surfaces === counts.route_concentration_guardrail_surfaces && counts.route_concentration_guardrail_max_share_surfaces === counts.route_concentration_guardrail_surfaces && counts.route_concentration_guardrail_warning_surfaces === counts.route_concentration_guardrail_surfaces && counts.route_concentration_guardrail_semantic_independence_allowed_rows === 0 && counts.route_concentration_guardrail_answer_authority_allowed_rows === 0 && counts.route_concentration_guardrail_route_ranking_allowed_rows === 0 && counts.route_concentration_guardrail_visible_answer_selection_allowed_rows === 0 && counts.route_concentration_guardrail_reader_facing_rows === 0 && counts.route_concentration_guardrail_route_payload_field_hits === 0 && counts.route_concentration_guardrail_forbidden_authority_field_hits === 0 && counts.route_concentration_guardrail_unresolved_route_ids === 0 ? 'warning' : 'failed', `surfaces/single/max/warn ${counts.route_concentration_guardrail_surfaces}/${counts.route_concentration_guardrail_single_route_surfaces}/${counts.route_concentration_guardrail_max_share_surfaces}/${counts.route_concentration_guardrail_warning_surfaces}; semantic/answer/rank/visible ${counts.route_concentration_guardrail_semantic_independence_allowed_rows}/${counts.route_concentration_guardrail_answer_authority_allowed_rows}/${counts.route_concentration_guardrail_route_ranking_allowed_rows}/${counts.route_concentration_guardrail_visible_answer_selection_allowed_rows}; reader/payload/forbidden/unresolved ${counts.route_concentration_guardrail_reader_facing_rows}/${counts.route_concentration_guardrail_route_payload_field_hits}/${counts.route_concentration_guardrail_forbidden_authority_field_hits}/${counts.route_concentration_guardrail_unresolved_route_ids}`),
    check('route_pointer_audit_complete', counts.route_pointer_audit_rows === 1 && counts.route_pointer_audit_route_ids === counts.route_pointer_audit_rows && counts.route_pointer_audit_resolved_route_ids === counts.route_pointer_audit_route_ids && counts.route_pointer_audit_unresolved_route_ids === 0 && counts.route_pointer_audit_support_rows_with_pointer === counts.route_pointer_audit_support_rows && counts.route_pointer_audit_navigation_rows_with_pointer === counts.route_pointer_audit_navigation_rows && counts.route_pointer_audit_planning_rows_with_pointer === counts.route_pointer_audit_planning_rows && counts.route_pointer_audit_reader_facing_rows === 0 && counts.route_pointer_audit_route_payload_field_hits === 0 && counts.route_pointer_audit_forbidden_authority_field_hits === 0 && counts.route_pointer_audit_route_metadata_field_hits === 0 ? 'warning' : 'failed', `routes/resolved/unresolved ${counts.route_pointer_audit_route_ids}/${counts.route_pointer_audit_resolved_route_ids}/${counts.route_pointer_audit_unresolved_route_ids}; support ${counts.route_pointer_audit_support_rows_with_pointer}/${counts.route_pointer_audit_support_rows}; navigation ${counts.route_pointer_audit_navigation_rows_with_pointer}/${counts.route_pointer_audit_navigation_rows}; planning ${counts.route_pointer_audit_planning_rows_with_pointer}/${counts.route_pointer_audit_planning_rows}; reader/payload/forbidden/metadata ${counts.route_pointer_audit_reader_facing_rows}/${counts.route_pointer_audit_route_payload_field_hits}/${counts.route_pointer_audit_forbidden_authority_field_hits}/${counts.route_pointer_audit_route_metadata_field_hits}`),
    check('sample_gap_audit_complete', counts.sample_gap_audit_gap_rows > 0 && counts.sample_gap_audit_sample_rows > 0 && counts.sample_gap_audit_sample_rows_with_usage_links === 0 && counts.sample_gap_audit_usage_tokens_not_in_sample > 0 && counts.sample_gap_audit_selected_occurrence_links > 0 && counts.sample_gap_audit_route_ids === counts.occurrence_detail_route_ids && counts.sample_gap_audit_sample_overlap_gap_visible === 1 && counts.sample_gap_audit_reader_facing_rows === 0 && counts.sample_gap_audit_route_payload_field_hits === 0 && counts.sample_gap_audit_forbidden_authority_field_hits === 0 ? 'warning' : 'failed', `gap rows ${counts.sample_gap_audit_gap_rows}; sample usage links ${counts.sample_gap_audit_sample_rows_with_usage_links}/${counts.sample_gap_audit_sample_rows}; usage tokens not in sample ${counts.sample_gap_audit_usage_tokens_not_in_sample}; selected links ${counts.sample_gap_audit_selected_occurrence_links}`),
    check('consumer_manifest_complete', counts.consumer_manifest_entries === 16 && counts.consumer_manifest_data_artifacts_exist === counts.consumer_manifest_data_artifacts && counts.consumer_manifest_report_artifacts_exist === counts.consumer_manifest_report_artifacts && counts.consumer_manifest_validator_scripts_exist === counts.consumer_manifest_validator_scripts && counts.consumer_manifest_passed_entries === counts.consumer_manifest_entries && counts.consumer_manifest_occurrence_detail_rows === counts.occurrence_detail_rows && counts.consumer_manifest_occurrence_link_rows === counts.occurrence_link_rows && counts.consumer_manifest_route_ids > 0 && counts.consumer_manifest_unresolved_route_ids === 0 && counts.consumer_manifest_reader_facing_rows === 0 && counts.consumer_manifest_route_payload_field_hits === 0 && counts.consumer_manifest_forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `entries ${counts.consumer_manifest_entries}; data/reports/validators ${counts.consumer_manifest_data_artifacts_exist}-${counts.consumer_manifest_data_artifacts}/${counts.consumer_manifest_report_artifacts_exist}-${counts.consumer_manifest_report_artifacts}/${counts.consumer_manifest_validator_scripts_exist}-${counts.consumer_manifest_validator_scripts}; rows ${counts.consumer_manifest_occurrence_detail_rows}/${counts.consumer_manifest_occurrence_link_rows}; reader-facing/payload/forbidden ${counts.consumer_manifest_reader_facing_rows}/${counts.consumer_manifest_route_payload_field_hits}/${counts.consumer_manifest_forbidden_authority_field_hits}`),
    check('planning_packet_complete', counts.planning_packet_planning_rows > 0 && counts.planning_packet_occurrence_link_rows === counts.occurrence_link_rows && counts.planning_packet_current_sample_rows_with_usage_links === 0 && counts.planning_packet_current_sample_usage_tokens_not_in_sample > 0 && counts.planning_packet_route_ids > 0 && counts.planning_packet_reader_facing_rows === 0 && counts.planning_packet_route_payload_field_hits === 0 && counts.planning_packet_forbidden_authority_field_hits === 0 ? 'warning' : 'failed', `planning rows ${counts.planning_packet_planning_rows}; occurrence links ${counts.planning_packet_occurrence_link_rows}/${counts.occurrence_link_rows}; sample links ${counts.planning_packet_current_sample_rows_with_usage_links}; absent tokens ${counts.planning_packet_current_sample_usage_tokens_not_in_sample}; reader-facing/payload/forbidden ${counts.planning_packet_reader_facing_rows}/${counts.planning_packet_route_payload_field_hits}/${counts.planning_packet_forbidden_authority_field_hits}`),
    check('planning_handoff_summary_complete', counts.planning_packet_summary_token_keys > 0 && counts.planning_packet_summary_occurrence_token_keys > 0 && counts.planning_packet_summary_supported_rows + counts.planning_packet_summary_candidate_rows + counts.planning_packet_summary_weak_rows === counts.planning_packet_occurrence_link_rows && counts.planning_packet_summary_resolved_route_ids === counts.planning_packet_route_ids && counts.planning_packet_summary_unresolved_route_ids === 0 && counts.planning_packet_summary_source_refs > 0 && counts.planning_packet_summary_works > 0 && counts.planning_packet_summary_forbidden_use_items >= 7 && counts.planning_packet_summary_qa_boundary_references >= 2 && counts.planning_packet_summary_broad_coverage_claim_allowed === 0 && counts.planning_packet_summary_semantic_independence_claim_allowed === 0 ? 'passed' : 'failed', `tokens ${counts.planning_packet_summary_token_keys}/${counts.planning_packet_summary_occurrence_token_keys}; supported/candidate/weak ${counts.planning_packet_summary_supported_rows}/${counts.planning_packet_summary_candidate_rows}/${counts.planning_packet_summary_weak_rows}; resolved/unresolved ${counts.planning_packet_summary_resolved_route_ids}/${counts.planning_packet_summary_unresolved_route_ids}; source refs/works ${counts.planning_packet_summary_source_refs}/${counts.planning_packet_summary_works}; QA refs ${counts.planning_packet_summary_qa_boundary_references}; broad/semantic ${counts.planning_packet_summary_broad_coverage_claim_allowed}/${counts.planning_packet_summary_semantic_independence_claim_allowed}`),
    check('anchor_audit_complete', counts.anchor_audit_rows === counts.occurrence_link_rows && counts.anchor_audit_existing_work_pages === counts.anchor_audit_rows && counts.anchor_audit_existing_anchors === counts.anchor_audit_rows && counts.anchor_audit_matching_source_refs === counts.anchor_audit_rows && counts.anchor_audit_token_surfaces_in_page === counts.anchor_audit_rows && counts.anchor_audit_focus_surfaces_in_page === counts.anchor_audit_rows && counts.anchor_audit_rows_with_context === counts.anchor_audit_rows && counts.anchor_audit_rows_with_focus_marker === counts.anchor_audit_rows && counts.anchor_audit_rows_with_license === counts.anchor_audit_rows && counts.anchor_audit_rows_with_version === counts.anchor_audit_rows && counts.anchor_audit_rows_with_route_ids === counts.anchor_audit_rows && counts.anchor_audit_reader_facing_rows === 0 && counts.anchor_audit_route_payload_field_hits === 0 && counts.anchor_audit_forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `rows ${counts.anchor_audit_rows}/${counts.occurrence_link_rows}; anchors/source refs ${counts.anchor_audit_existing_anchors}/${counts.anchor_audit_matching_source_refs}; token/focus ${counts.anchor_audit_token_surfaces_in_page}/${counts.anchor_audit_focus_surfaces_in_page}; reader-facing/payload/forbidden ${counts.anchor_audit_reader_facing_rows}/${counts.anchor_audit_route_payload_field_hits}/${counts.anchor_audit_forbidden_authority_field_hits}`),
    check('occurrence_support_complete', counts.occurrence_support_rows === counts.occurrence_link_rows && counts.occurrence_support_supported_rows + counts.occurrence_support_candidate_rows + counts.occurrence_support_weak_rows === counts.occurrence_support_rows && counts.occurrence_support_rows_with_source_url === counts.occurrence_support_rows && counts.occurrence_support_rows_with_local_work_anchor === counts.occurrence_support_rows && counts.occurrence_support_rows_with_context_snippet === counts.occurrence_support_rows && counts.occurrence_support_rows_with_focus_marker === counts.occurrence_support_rows && counts.occurrence_support_rows_with_route_ids === counts.occurrence_support_rows && counts.occurrence_support_rows_with_license_metadata === counts.occurrence_support_rows && counts.occurrence_support_rows_with_version_metadata === counts.occurrence_support_rows && counts.occurrence_support_reader_facing_rows === 0 && counts.occurrence_support_route_payload_field_hits === 0 && counts.occurrence_support_forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `rows ${counts.occurrence_support_rows}/${counts.occurrence_link_rows}; supported/candidate/weak ${counts.occurrence_support_supported_rows}/${counts.occurrence_support_candidate_rows}/${counts.occurrence_support_weak_rows}; source/anchor/context/focus/route/license/version ${counts.occurrence_support_rows_with_source_url}/${counts.occurrence_support_rows_with_local_work_anchor}/${counts.occurrence_support_rows_with_context_snippet}/${counts.occurrence_support_rows_with_focus_marker}/${counts.occurrence_support_rows_with_route_ids}/${counts.occurrence_support_rows_with_license_metadata}/${counts.occurrence_support_rows_with_version_metadata}; reader-facing/payload/forbidden ${counts.occurrence_support_reader_facing_rows}/${counts.occurrence_support_route_payload_field_hits}/${counts.occurrence_support_forbidden_authority_field_hits}`),
    check('concordance_navigation_complete', counts.concordance_navigation_rows === counts.usage_concordance_rows && counts.concordance_navigation_supported_rows + counts.concordance_navigation_candidate_rows + counts.concordance_navigation_weak_rows === counts.concordance_navigation_rows && counts.concordance_navigation_selected_support_rows === counts.occurrence_support_rows && counts.concordance_navigation_source_refs > 0 && counts.concordance_navigation_works > 0 && counts.concordance_navigation_categories > 0 && counts.concordance_navigation_route_ids > 0 && counts.concordance_navigation_rows_with_source_url === counts.concordance_navigation_rows && counts.concordance_navigation_rows_with_local_work_anchor === counts.concordance_navigation_rows && counts.concordance_navigation_rows_with_context_snippet === counts.concordance_navigation_rows && counts.concordance_navigation_rows_with_focus_marker === counts.concordance_navigation_rows && counts.concordance_navigation_rows_with_route_ids === counts.concordance_navigation_rows && counts.concordance_navigation_rows_with_license_metadata === counts.concordance_navigation_rows && counts.concordance_navigation_rows_with_version_metadata === counts.concordance_navigation_rows && counts.concordance_navigation_reader_facing_rows === 0 && counts.concordance_navigation_route_payload_field_hits === 0 && counts.concordance_navigation_forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `rows ${counts.concordance_navigation_rows}/${counts.usage_concordance_rows}; supported/candidate/weak ${counts.concordance_navigation_supported_rows}/${counts.concordance_navigation_candidate_rows}/${counts.concordance_navigation_weak_rows}; selected ${counts.concordance_navigation_selected_support_rows}/${counts.occurrence_support_rows}; source/work/category/route ${counts.concordance_navigation_source_refs}/${counts.concordance_navigation_works}/${counts.concordance_navigation_categories}/${counts.concordance_navigation_route_ids}; reader-facing/payload/forbidden ${counts.concordance_navigation_reader_facing_rows}/${counts.concordance_navigation_route_payload_field_hits}/${counts.concordance_navigation_forbidden_authority_field_hits}`),
    check('public_handoff_index_complete', counts.public_handoff_selected_targets > 0 && counts.public_handoff_validation_passed === counts.public_handoff_selected_targets && counts.public_handoff_validation_failed === 0 && counts.public_handoff_eligible_usage_rows === counts.usage_concordance_rows && counts.public_handoff_supported_rows + counts.public_handoff_candidate_rows + counts.public_handoff_weak_rows === counts.public_handoff_eligible_usage_rows && counts.public_handoff_count_only_ambiguous_rows === counts.audit_only_ambiguous_rows && counts.public_handoff_zero_useful_targets === 0 && counts.public_handoff_downstream_consumable === 1 && counts.public_handoff_validation_passed_flag === 1 && counts.public_handoff_zero_useful_targets_blocked === 1 && counts.public_handoff_ambiguous_rows_audit_only === 1 && counts.public_handoff_license_policy_passed === 1 && counts.public_handoff_corpus_exhaustive === 0 && counts.public_handoff_source_freshness_status === 'stale' && counts.public_handoff_artifact_source_files_scanned > 0 && counts.public_handoff_current_source_files >= counts.public_handoff_artifact_source_files_scanned && counts.public_handoff_source_count_delta > 0 && counts.public_handoff_files_modified_after_artifact > 0 && counts.public_handoff_files_created_after_artifact > 0 && counts.public_handoff_final_ranking_authority === 0 && counts.public_handoff_visible_answer_authority === 0 && counts.public_handoff_carries_text_rows === 0 && counts.public_handoff_warning_count > 0 ? 'warning' : 'failed', `targets/pass/fail ${counts.public_handoff_selected_targets}/${counts.public_handoff_validation_passed}/${counts.public_handoff_validation_failed}; eligible/ambiguous ${counts.public_handoff_eligible_usage_rows}/${counts.public_handoff_count_only_ambiguous_rows}; freshness ${counts.public_handoff_source_freshness_status} scanned/current/delta/modified ${counts.public_handoff_artifact_source_files_scanned}/${counts.public_handoff_current_source_files}/${counts.public_handoff_source_count_delta}/${counts.public_handoff_files_modified_after_artifact}; authority final/answer/text ${counts.public_handoff_final_ranking_authority}/${counts.public_handoff_visible_answer_authority}/${counts.public_handoff_carries_text_rows}`),
    check('freshness_impact_complete', counts.freshness_impact_pending_refresh_files > 0 && counts.freshness_impact_pending_with_current_usage_overlap === 0 && counts.freshness_impact_impacted_navigation_rows === 0 && counts.freshness_impact_impacted_selected_support_rows === 0 && counts.freshness_impact_promoted_run_targets === 0 && counts.freshness_impact_source_text_read === 0 && counts.freshness_impact_broad_target_expansion === 0 && counts.freshness_impact_reader_facing_rows === 0 && counts.freshness_impact_route_payload_field_hits === 0 && counts.freshness_impact_forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `pending/overlap/impacted/selected/promoted ${counts.freshness_impact_pending_refresh_files}/${counts.freshness_impact_pending_with_current_usage_overlap}/${counts.freshness_impact_impacted_navigation_rows}/${counts.freshness_impact_impacted_selected_support_rows}/${counts.freshness_impact_promoted_run_targets}; sourceText/broad/reader/payload/forbidden ${counts.freshness_impact_source_text_read}/${counts.freshness_impact_broad_target_expansion}/${counts.freshness_impact_reader_facing_rows}/${counts.freshness_impact_route_payload_field_hits}/${counts.freshness_impact_forbidden_authority_field_hits}`),
    check('current_source_freshness_refresh_complete', counts.source_freshness_refresh_dirty_source_files > 0 && counts.source_freshness_refresh_overlap_sources === 0 && counts.source_freshness_refresh_impacted_navigation_rows === 0 && counts.source_freshness_refresh_impacted_selected_support_rows === 0 && counts.source_freshness_refresh_promoted_run_targets === 0 && counts.source_freshness_refresh_source_text_read === 0 && counts.source_freshness_refresh_broad_target_expansion === 0 && counts.source_freshness_refresh_reader_facing_rows === 0 && counts.source_freshness_refresh_route_payload_field_hits === 0 && counts.source_freshness_refresh_forbidden_authority_field_hits === 0 && counts.freshness_followup_queue_mutations === 0 && counts.freshness_followup_submitted_to_agent6 === 0 ? 'passed' : 'failed', `dirty/overlap/impacted/selected/delta ${counts.source_freshness_refresh_dirty_source_files}/${counts.source_freshness_refresh_overlap_sources}/${counts.source_freshness_refresh_impacted_navigation_rows}/${counts.source_freshness_refresh_impacted_selected_support_rows}/${counts.source_freshness_refresh_prior_pending_delta}; sourceText/broad/promoted/reader/payload/forbidden ${counts.source_freshness_refresh_source_text_read}/${counts.source_freshness_refresh_broad_target_expansion}/${counts.source_freshness_refresh_promoted_run_targets}/${counts.source_freshness_refresh_reader_facing_rows}/${counts.source_freshness_refresh_route_payload_field_hits}/${counts.source_freshness_refresh_forbidden_authority_field_hits}; queue/submitted ${counts.freshness_followup_queue_mutations}/${counts.freshness_followup_submitted_to_agent6}`),
    check('crossmatch_inventory_packet_complete', counts.crossmatch_inventory_files > 0 && counts.crossmatch_inventory_forbidden_truthy_authority_claims === 0 ? 'warning' : 'failed', `files ${counts.crossmatch_inventory_files}; dirty/uncommitted ${counts.crossmatch_inventory_dirty_or_uncommitted_files}; truthy authority ${counts.crossmatch_inventory_forbidden_truthy_authority_claims}`),
    check('agent10_crossmatch_direct_state_reconciliation_complete', counts.agent10_crossmatch_direct_state_dirty_or_uncommitted_files > 0 && counts.agent10_crossmatch_fresh_consumption_dirty_or_uncommitted_files === 0 && counts.agent10_crossmatch_current_inventory_dirty_or_uncommitted_files === 0 && counts.agent10_crossmatch_stale_dirty_count_delta === counts.agent10_crossmatch_direct_state_dirty_or_uncommitted_files && counts.agent10_crossmatch_current_inventory_blocker_count === 0 && counts.agent10_crossmatch_control_edits === 0 && counts.agent10_crossmatch_agent6_boundary_packets_opened === 0 ? 'warning' : 'failed', `direct/fresh/current dirty ${counts.agent10_crossmatch_direct_state_dirty_or_uncommitted_files}/${counts.agent10_crossmatch_fresh_consumption_dirty_or_uncommitted_files}/${counts.agent10_crossmatch_current_inventory_dirty_or_uncommitted_files}; stale delta ${counts.agent10_crossmatch_stale_dirty_count_delta}; blockers/control/agent6 ${counts.agent10_crossmatch_current_inventory_blocker_count}/${counts.agent10_crossmatch_control_edits}/${counts.agent10_crossmatch_agent6_boundary_packets_opened}`),
    check('post_crossmatch_reconciliation_wake_audit_complete', counts.post_crossmatch_wake_queue_stale_deuteronomy_rows === 1 && counts.post_crossmatch_wake_agent10_stale_dirty_count_delta > 0 && counts.post_crossmatch_wake_current_inventory_dirty_files === 0 && counts.post_crossmatch_wake_registered_continuity_rows === 4 && counts.post_crossmatch_wake_direct_executable_worksets === 0 && counts.post_crossmatch_wake_no_new_workset_blockers === 2 && counts.post_crossmatch_wake_agent6_boundary_packets_opened === 0 ? 'warning' : 'failed', `queue stale ${counts.post_crossmatch_wake_queue_stale_deuteronomy_rows}; stale dirty delta ${counts.post_crossmatch_wake_agent10_stale_dirty_count_delta}; current dirty ${counts.post_crossmatch_wake_current_inventory_dirty_files}; registered/executable/blockers/agent6 ${counts.post_crossmatch_wake_registered_continuity_rows}/${counts.post_crossmatch_wake_direct_executable_worksets}/${counts.post_crossmatch_wake_no_new_workset_blockers}/${counts.post_crossmatch_wake_agent6_boundary_packets_opened}`),
    check('orot_route_selection_crossmatch_matrix_complete', counts.orot_route_selection_rows === 5 && counts.orot_route_selection_occurrence_links === 359 && counts.orot_route_selection_candidate_mismatches === 1 && counts.orot_route_selection_token_index_linkage_gaps === 1 && counts.orot_route_selection_exact_blockers === 3 && counts.orot_route_selection_route_payload_field_hits === 0 && counts.orot_route_selection_forbidden_authority_field_hits === 0 ? 'warning' : 'failed', `rows/occurrences ${counts.orot_route_selection_rows}/${counts.orot_route_selection_occurrence_links}; mismatches/linkage-gaps/blockers ${counts.orot_route_selection_candidate_mismatches}/${counts.orot_route_selection_token_index_linkage_gaps}/${counts.orot_route_selection_exact_blockers}; route-payload/forbidden ${counts.orot_route_selection_route_payload_field_hits}/${counts.orot_route_selection_forbidden_authority_field_hits}`),
    check('post_route_selection_wake_audit_complete', counts.post_route_selection_wake_current_executable_worksets === 0 && counts.post_route_selection_wake_exact_blockers === 3 && counts.post_route_selection_wake_conditions === 4 && counts.post_route_selection_wake_queue_mutations === 0 && counts.post_route_selection_wake_acceptance_claims === 0 ? 'warning' : 'failed', `executable/blockers/wake ${counts.post_route_selection_wake_current_executable_worksets}/${counts.post_route_selection_wake_exact_blockers}/${counts.post_route_selection_wake_conditions}; queue/acceptance ${counts.post_route_selection_wake_queue_mutations}/${counts.post_route_selection_wake_acceptance_claims}`),
    check('old_dictionary_row_overlap_linkage_matrix_complete', counts.old_dictionary_row_overlap_buckets === 8 && counts.old_dictionary_row_overlap_rows === 500 && counts.old_dictionary_row_overlap_occurrences === 8427 && counts.old_dictionary_row_overlap_duplicate_sample_tokens === 0 && counts.old_dictionary_row_overlap_source_family_pointer_rows === 17 && counts.old_dictionary_row_overlap_exact_blockers === 6 && counts.old_dictionary_row_overlap_audit_zero_rows === 2 && counts.old_dictionary_row_overlap_route_payload_field_hits === 0 && counts.old_dictionary_row_overlap_forbidden_authority_field_hits === 0 && counts.old_dictionary_row_overlap_acceptance_claims === 0 ? 'warning' : 'failed', `buckets/rows/occurrences ${counts.old_dictionary_row_overlap_buckets}/${counts.old_dictionary_row_overlap_rows}/${counts.old_dictionary_row_overlap_occurrences}; sample-dupes/source-pointers/blockers/audit-zero ${counts.old_dictionary_row_overlap_duplicate_sample_tokens}/${counts.old_dictionary_row_overlap_source_family_pointer_rows}/${counts.old_dictionary_row_overlap_exact_blockers}/${counts.old_dictionary_row_overlap_audit_zero_rows}; route-payload/forbidden/acceptance ${counts.old_dictionary_row_overlap_route_payload_field_hits}/${counts.old_dictionary_row_overlap_forbidden_authority_field_hits}/${counts.old_dictionary_row_overlap_acceptance_claims}`),
    check('proof_metadata_complete', counts.proof_occurrence_rows > 0 && counts.proof_rows_with_complete_metadata === counts.proof_occurrence_rows ? 'passed' : 'failed', `${counts.proof_rows_with_complete_metadata}/${counts.proof_occurrence_rows}`),
    check('hebrew_context_clean', counts.proof_rows_with_hebrew_context === counts.proof_occurrence_rows && counts.proof_mojibake_rows === 0 ? 'passed' : 'failed', `Hebrew context ${counts.proof_rows_with_hebrew_context}; mojibake ${counts.proof_mojibake_rows}`),
    check('no_authority_fields', counts.reader_facing_rows === 0 && counts.route_payload_field_hits === 0 && counts.forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `reader-facing ${counts.reader_facing_rows}; route payload ${counts.route_payload_field_hits}; forbidden ${counts.forbidden_authority_field_hits}`),
    check('smoke_validation_passed', counts.smoke_steps > 0 && counts.smoke_failed_steps === 0 ? 'passed' : 'failed', `steps ${counts.smoke_steps}; failed ${counts.smoke_failed_steps}`),
  ];
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Agent 3 State',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## State',
    '',
    `- Lane: ${artifact.lane}`,
    `- Worker state: ${artifact.worker_state}`,
    `- QA acceptance state: ${artifact.qa_acceptance_state}`,
    `- Goal: ${artifact.goal_id}`,
    `- Stored goal-board status: ${artifact.goal_board_status}`,
    `- Manager: ${artifact.manager}`,
    `- Approval owner: ${artifact.approval_owner}`,
    `- Evidence owner: ${artifact.evidence_validator_owner}`,
    `- A06 evidence-only until A07 approval / do not ask A06 for approval: ${artifact.a06_outputs_are_evidence_ready_until_a07_approves}/${artifact.do_not_ask_a06_for_approval}`,
    `- Queue-ready packet: ${artifact.handoff_state.queue_ready_packet}`,
    `- Queue mutated / submitted: ${artifact.handoff_state.control_queue_mutated}/${artifact.handoff_state.submitted_to_agent6}`,
    '',
    '## Metrics',
    '',
    `- Usage concordance rows: ${artifact.current_metrics.usage_concordance_rows}`,
    `- Supported/candidate/weak rows: ${artifact.current_metrics.usage_supported_rows}/${artifact.current_metrics.usage_candidate_rows}/${artifact.current_metrics.usage_weak_rows}`,
    `- Audit-only ambiguous rows: ${artifact.current_metrics.audit_only_ambiguous_rows}`,
    `- Selected usage rows/source refs/works: ${artifact.current_metrics.selected_usage_rows}/${artifact.current_metrics.selected_source_refs}/${artifact.current_metrics.selected_works}`,
    `- Occurrence link rows / complete metadata: ${artifact.current_metrics.occurrence_link_rows}/${artifact.current_metrics.occurrence_link_rows_with_complete_metadata}`,
    `- Occurrence link reader-facing / route-payload / forbidden-authority hits: ${artifact.current_metrics.occurrence_link_reader_facing_rows}/${artifact.current_metrics.occurrence_link_route_payload_field_hits}/${artifact.current_metrics.occurrence_link_forbidden_authority_field_hits}`,
    `- Route resolution rows / route IDs resolved-unresolved: ${artifact.current_metrics.route_resolution_occurrence_route_rows}/${artifact.current_metrics.route_resolution_resolved_route_ids}-${artifact.current_metrics.route_resolution_unresolved_route_ids}`,
    `- Route resolution reader-facing / route-payload / forbidden-authority hits: ${artifact.current_metrics.route_resolution_reader_facing_rows}/${artifact.current_metrics.route_resolution_route_payload_field_hits}/${artifact.current_metrics.route_resolution_forbidden_authority_field_hits}`,
    `- Crossmatch neighbor source rows / links: ${artifact.current_metrics.crossmatch_neighbor_source_occurrence_rows}/${artifact.current_metrics.crossmatch_neighbor_link_rows}`,
    `- Crossmatch same-frame / bridge links: ${artifact.current_metrics.crossmatch_neighbor_same_frame_links}/${artifact.current_metrics.crossmatch_neighbor_bridge_frame_links}`,
    `- Crossmatch reader-facing / route-payload / forbidden-authority hits: ${artifact.current_metrics.crossmatch_neighbor_reader_facing_rows}/${artifact.current_metrics.crossmatch_neighbor_route_payload_field_hits}/${artifact.current_metrics.crossmatch_neighbor_forbidden_authority_field_hits}`,
    `- Source-ref buckets / source-cluster buckets / rows: ${artifact.current_metrics.source_ref_bucket_count}/${artifact.current_metrics.source_ref_bucket_source_cluster_buckets}/${artifact.current_metrics.source_ref_bucket_occurrence_rows}`,
    `- Duplicate source refs / cross-cluster source refs: ${artifact.current_metrics.source_ref_bucket_duplicate_source_ref_buckets}/${artifact.current_metrics.source_ref_bucket_cross_cluster_source_ref_buckets}`,
    `- Source-ref bucket reader-facing / route-payload / forbidden-authority hits: ${artifact.current_metrics.source_ref_bucket_reader_facing_rows}/${artifact.current_metrics.source_ref_bucket_route_payload_field_hits}/${artifact.current_metrics.source_ref_bucket_forbidden_authority_field_hits}`,
    `- Work buckets / work-frame buckets / rows: ${artifact.current_metrics.work_bucket_count}/${artifact.current_metrics.work_bucket_work_frame_buckets}/${artifact.current_metrics.work_bucket_occurrence_rows}`,
    `- Work bucket source refs / multi-source works / multi-frame works: ${artifact.current_metrics.work_bucket_source_refs}/${artifact.current_metrics.work_bucket_multi_source_work_buckets}/${artifact.current_metrics.work_bucket_multi_frame_work_buckets}`,
    `- Work bucket reader-facing / route-payload / forbidden-authority hits: ${artifact.current_metrics.work_bucket_reader_facing_rows}/${artifact.current_metrics.work_bucket_route_payload_field_hits}/${artifact.current_metrics.work_bucket_forbidden_authority_field_hits}`,
    `- Provenance buckets / provenance-frame buckets / rows: ${artifact.current_metrics.provenance_bucket_count}/${artifact.current_metrics.provenance_bucket_provenance_frame_buckets}/${artifact.current_metrics.provenance_bucket_occurrence_rows}`,
    `- Provenance bucket source refs / licenses / version sources: ${artifact.current_metrics.provenance_bucket_source_refs}/${artifact.current_metrics.provenance_bucket_license_count}/${artifact.current_metrics.provenance_bucket_version_source_count}`,
    `- Provenance bucket multi-work / multi-frame buckets: ${artifact.current_metrics.provenance_bucket_multi_work_buckets}/${artifact.current_metrics.provenance_bucket_multi_frame_buckets}`,
    `- Provenance bucket reader-facing / route-payload / forbidden-authority hits: ${artifact.current_metrics.provenance_bucket_reader_facing_rows}/${artifact.current_metrics.provenance_bucket_route_payload_field_hits}/${artifact.current_metrics.provenance_bucket_forbidden_authority_field_hits}`,
    `- Occurrence detail rows / source refs / works: ${artifact.current_metrics.occurrence_detail_rows}/${artifact.current_metrics.occurrence_detail_source_refs}/${artifact.current_metrics.occurrence_detail_works}`,
    `- Occurrence detail route IDs / unresolved / bucket-linked rows: ${artifact.current_metrics.occurrence_detail_route_ids}/${artifact.current_metrics.occurrence_detail_unresolved_route_ids}/${artifact.current_metrics.occurrence_detail_rows_with_all_bucket_links}`,
    `- Occurrence detail neighbor links total / same-frame / bridge-frame: ${artifact.current_metrics.occurrence_detail_neighbor_links}/${artifact.current_metrics.occurrence_detail_same_frame_neighbor_links}/${artifact.current_metrics.occurrence_detail_bridge_frame_neighbor_links}`,
    `- Occurrence detail reader-facing / route-payload / forbidden-authority hits: ${artifact.current_metrics.occurrence_detail_reader_facing_rows}/${artifact.current_metrics.occurrence_detail_route_payload_field_hits}/${artifact.current_metrics.occurrence_detail_forbidden_authority_field_hits}`,
    `- Facet index occurrence rows / groups / facets: ${artifact.current_metrics.facet_index_occurrence_rows}/${artifact.current_metrics.facet_index_facet_groups}/${artifact.current_metrics.facet_index_facets_total}`,
    `- Facet index route IDs / max route share / concentration warning: ${artifact.current_metrics.facet_index_route_ids}/${artifact.current_metrics.facet_index_max_route_share_basis_points}/10000/${artifact.current_metrics.facet_index_route_concentration_warning}`,
    `- Facet index reader-facing / route-payload / forbidden-authority hits: ${artifact.current_metrics.facet_index_reader_facing_rows}/${artifact.current_metrics.facet_index_route_payload_field_hits}/${artifact.current_metrics.facet_index_forbidden_authority_field_hits}`,
    `- Context-token index rows / appearances / cross-frame rows: ${artifact.current_metrics.context_token_index_rows}/${artifact.current_metrics.context_token_index_occurrences}/${artifact.current_metrics.context_token_index_cross_frame_rows}`,
    `- Context-token repeated focus appearances / route IDs / concentration warning: ${artifact.current_metrics.context_token_index_repeated_focus_occurrences}/${artifact.current_metrics.context_token_index_route_ids}/${artifact.current_metrics.context_token_index_route_concentration_warning}`,
    `- Context-token reader-facing / route-payload / forbidden-authority hits: ${artifact.current_metrics.context_token_index_reader_facing_rows}/${artifact.current_metrics.context_token_index_route_payload_field_hits}/${artifact.current_metrics.context_token_index_forbidden_authority_field_hits}`,
    `- Context-token link rows / context tokens / occurrence rows: ${artifact.current_metrics.context_token_link_rows}/${artifact.current_metrics.context_token_link_context_tokens}/${artifact.current_metrics.context_token_link_occurrence_rows}`,
    `- Context-token link focus / context / cross-frame rows: ${artifact.current_metrics.context_token_link_focus_rows}/${artifact.current_metrics.context_token_link_context_rows}/${artifact.current_metrics.context_token_link_cross_frame_rows}`,
    `- Context-token link route IDs / max share / concentration warning: ${artifact.current_metrics.context_token_link_route_ids}/${artifact.current_metrics.context_token_link_max_route_share_basis_points}/10000/${artifact.current_metrics.context_token_link_route_concentration_warning}`,
    `- Context-token link source/work/context/focus/route/license/version rows: ${artifact.current_metrics.context_token_link_rows_with_source_link}/${artifact.current_metrics.context_token_link_rows_with_work_anchor}/${artifact.current_metrics.context_token_link_rows_with_hebrew_context}/${artifact.current_metrics.context_token_link_rows_with_focus_marker}/${artifact.current_metrics.context_token_link_rows_with_route_ids}/${artifact.current_metrics.context_token_link_rows_with_license_metadata}/${artifact.current_metrics.context_token_link_rows_with_version_metadata}`,
    `- Context-token link reader-facing / route-payload / forbidden-authority hits: ${artifact.current_metrics.context_token_link_reader_facing_rows}/${artifact.current_metrics.context_token_link_route_payload_field_hits}/${artifact.current_metrics.context_token_link_forbidden_authority_field_hits}`,
    `- Context-token occurrence index rows / links / occurrence rows: ${artifact.current_metrics.context_token_occurrence_index_rows}/${artifact.current_metrics.context_token_occurrence_index_link_rows}/${artifact.current_metrics.context_token_occurrence_index_occurrence_rows}`,
    `- Context-token occurrence index focus / context / cross-frame rows: ${artifact.current_metrics.context_token_occurrence_index_focus_rows}/${artifact.current_metrics.context_token_occurrence_index_context_rows}/${artifact.current_metrics.context_token_occurrence_index_cross_frame_rows}`,
    `- Context-token occurrence index route IDs / max share / concentration warning: ${artifact.current_metrics.context_token_occurrence_index_route_ids}/${artifact.current_metrics.context_token_occurrence_index_max_route_share_basis_points}/10000/${artifact.current_metrics.context_token_occurrence_index_route_concentration_warning}`,
    `- Context-token occurrence index source/work/context/focus/route/license/version rows: ${artifact.current_metrics.context_token_occurrence_index_rows_with_source_link}/${artifact.current_metrics.context_token_occurrence_index_rows_with_work_anchor}/${artifact.current_metrics.context_token_occurrence_index_rows_with_hebrew_context}/${artifact.current_metrics.context_token_occurrence_index_rows_with_focus_marker}/${artifact.current_metrics.context_token_occurrence_index_rows_with_route_ids}/${artifact.current_metrics.context_token_occurrence_index_rows_with_license_metadata}/${artifact.current_metrics.context_token_occurrence_index_rows_with_version_metadata}`,
    `- Context-token occurrence index reader-facing / route-payload / forbidden-authority hits: ${artifact.current_metrics.context_token_occurrence_index_reader_facing_rows}/${artifact.current_metrics.context_token_occurrence_index_route_payload_field_hits}/${artifact.current_metrics.context_token_occurrence_index_forbidden_authority_field_hits}`,
    `- Occurrence context profile rows / links / reverse-linked rows: ${artifact.current_metrics.occurrence_context_profile_rows}/${artifact.current_metrics.occurrence_context_profile_link_rows}/${artifact.current_metrics.occurrence_context_profile_rows_with_reverse_index_ids}`,
    `- Occurrence context profile focus / context / cross-frame rows: ${artifact.current_metrics.occurrence_context_profile_focus_rows}/${artifact.current_metrics.occurrence_context_profile_context_rows}/${artifact.current_metrics.occurrence_context_profile_cross_frame_rows}`,
    `- Occurrence context profile route IDs / max share / concentration warning: ${artifact.current_metrics.occurrence_context_profile_route_ids}/${artifact.current_metrics.occurrence_context_profile_max_route_share_basis_points}/10000/${artifact.current_metrics.occurrence_context_profile_route_concentration_warning}`,
    `- Occurrence context profile source/work/context/focus/route/license/version rows: ${artifact.current_metrics.occurrence_context_profile_rows_with_source_link}/${artifact.current_metrics.occurrence_context_profile_rows_with_work_anchor}/${artifact.current_metrics.occurrence_context_profile_rows_with_hebrew_context}/${artifact.current_metrics.occurrence_context_profile_rows_with_focus_marker}/${artifact.current_metrics.occurrence_context_profile_rows_with_route_ids}/${artifact.current_metrics.occurrence_context_profile_rows_with_license_metadata}/${artifact.current_metrics.occurrence_context_profile_rows_with_version_metadata}`,
    `- Occurrence context profile reader-facing / route-payload / forbidden-authority hits: ${artifact.current_metrics.occurrence_context_profile_reader_facing_rows}/${artifact.current_metrics.occurrence_context_profile_route_payload_field_hits}/${artifact.current_metrics.occurrence_context_profile_forbidden_authority_field_hits}`,
    `- Route diversity probe rows / route IDs / max share / concentration warning: ${artifact.current_metrics.route_diversity_probe_occurrence_rows}/${artifact.current_metrics.route_diversity_probe_route_ids}/${artifact.current_metrics.route_diversity_probe_max_route_share_basis_points}/10000/${artifact.current_metrics.route_diversity_probe_concentration_warning}`,
    `- Route diversity semantic independence allowed / reader-facing / route-payload / forbidden-authority hits: ${artifact.current_metrics.route_diversity_probe_semantic_independence_claim_allowed}/${artifact.current_metrics.route_diversity_probe_reader_facing_rows}/${artifact.current_metrics.route_diversity_probe_route_payload_field_hits}/${artifact.current_metrics.route_diversity_probe_forbidden_authority_field_hits}`,
    `- Route diversity support source refs / works / licenses / version sources: ${artifact.current_metrics.route_diversity_probe_concentration_support_unique_source_refs}/${artifact.current_metrics.route_diversity_probe_concentration_support_unique_works}/${artifact.current_metrics.route_diversity_probe_concentration_support_unique_licenses}/${artifact.current_metrics.route_diversity_probe_concentration_support_unique_version_sources}`,
    `- Route diversity support duplicate-source / recurring-signature / cross-cluster-signature rows: ${artifact.current_metrics.route_diversity_probe_concentration_support_duplicate_source_ref_rows}/${artifact.current_metrics.route_diversity_probe_concentration_support_recurring_signature_rows}/${artifact.current_metrics.route_diversity_probe_concentration_support_cross_cluster_signature_rows}`,
    `- Route diversity support missing signature / missing lookup / final authority / semantic allowed: ${artifact.current_metrics.route_diversity_probe_concentration_support_missing_signature_rows}/${artifact.current_metrics.route_diversity_probe_concentration_support_missing_lookup_rows}/${artifact.current_metrics.route_diversity_probe_concentration_support_final_authority}/${artifact.current_metrics.route_diversity_probe_concentration_support_semantic_independence_allowed}`,
    `- Route concentration guardrail surfaces / warnings / semantic allowed: ${artifact.current_metrics.route_concentration_guardrail_surfaces}/${artifact.current_metrics.route_concentration_guardrail_warning_surfaces}/${artifact.current_metrics.route_concentration_guardrail_semantic_independence_allowed_rows}`,
    `- Route concentration guardrail reader-facing / route-payload / forbidden-authority / unresolved hits: ${artifact.current_metrics.route_concentration_guardrail_reader_facing_rows}/${artifact.current_metrics.route_concentration_guardrail_route_payload_field_hits}/${artifact.current_metrics.route_concentration_guardrail_forbidden_authority_field_hits}/${artifact.current_metrics.route_concentration_guardrail_unresolved_route_ids}`,
    `- Route pointer audit routes / support / navigation / payload hits: ${artifact.current_metrics.route_pointer_audit_route_ids}/${artifact.current_metrics.route_pointer_audit_support_rows_with_pointer}-${artifact.current_metrics.route_pointer_audit_support_rows}/${artifact.current_metrics.route_pointer_audit_navigation_rows_with_pointer}-${artifact.current_metrics.route_pointer_audit_navigation_rows}/${artifact.current_metrics.route_pointer_audit_route_payload_field_hits}`,
    `- Route pointer audit planning / reader-facing / forbidden-authority / metadata hits: ${artifact.current_metrics.route_pointer_audit_planning_rows_with_pointer}-${artifact.current_metrics.route_pointer_audit_planning_rows}/${artifact.current_metrics.route_pointer_audit_reader_facing_rows}/${artifact.current_metrics.route_pointer_audit_forbidden_authority_field_hits}/${artifact.current_metrics.route_pointer_audit_route_metadata_field_hits}`,
    `- Sample gap audit rows / current sample usage links / usage tokens not in sample: ${artifact.current_metrics.sample_gap_audit_gap_rows}/${artifact.current_metrics.sample_gap_audit_sample_rows_with_usage_links}/${artifact.current_metrics.sample_gap_audit_usage_tokens_not_in_sample}`,
    `- Sample gap audit selected links / reader-facing / route-payload / forbidden-authority hits: ${artifact.current_metrics.sample_gap_audit_selected_occurrence_links}/${artifact.current_metrics.sample_gap_audit_reader_facing_rows}/${artifact.current_metrics.sample_gap_audit_route_payload_field_hits}/${artifact.current_metrics.sample_gap_audit_forbidden_authority_field_hits}`,
    `- Consumer manifest entries / passed: ${artifact.current_metrics.consumer_manifest_entries}/${artifact.current_metrics.consumer_manifest_passed_entries}`,
    `- Consumer manifest data/report/validator presence: ${artifact.current_metrics.consumer_manifest_data_artifacts_exist}-${artifact.current_metrics.consumer_manifest_data_artifacts}/${artifact.current_metrics.consumer_manifest_report_artifacts_exist}-${artifact.current_metrics.consumer_manifest_report_artifacts}/${artifact.current_metrics.consumer_manifest_validator_scripts_exist}-${artifact.current_metrics.consumer_manifest_validator_scripts}`,
    `- Consumer manifest rows / route IDs / unresolved: ${artifact.current_metrics.consumer_manifest_occurrence_detail_rows}/${artifact.current_metrics.consumer_manifest_route_ids}/${artifact.current_metrics.consumer_manifest_unresolved_route_ids}`,
    `- Consumer manifest reader-facing / route-payload / forbidden-authority hits: ${artifact.current_metrics.consumer_manifest_reader_facing_rows}/${artifact.current_metrics.consumer_manifest_route_payload_field_hits}/${artifact.current_metrics.consumer_manifest_forbidden_authority_field_hits}`,
    `- Planning packet rows / occurrence links / route IDs: ${artifact.current_metrics.planning_packet_planning_rows}/${artifact.current_metrics.planning_packet_occurrence_link_rows}/${artifact.current_metrics.planning_packet_route_ids}`,
    `- Planning packet current sample usage links / absent tokens: ${artifact.current_metrics.planning_packet_current_sample_rows_with_usage_links}/${artifact.current_metrics.planning_packet_current_sample_usage_tokens_not_in_sample}`,
    `- Planning packet reader-facing / route-payload / forbidden-authority hits: ${artifact.current_metrics.planning_packet_reader_facing_rows}/${artifact.current_metrics.planning_packet_route_payload_field_hits}/${artifact.current_metrics.planning_packet_forbidden_authority_field_hits}`,
    `- Planning summary supported-candidate-weak / source refs / works: ${artifact.current_metrics.planning_packet_summary_supported_rows}-${artifact.current_metrics.planning_packet_summary_candidate_rows}-${artifact.current_metrics.planning_packet_summary_weak_rows}/${artifact.current_metrics.planning_packet_summary_source_refs}/${artifact.current_metrics.planning_packet_summary_works}`,
    `- Planning summary route IDs resolved-unresolved / QA refs: ${artifact.current_metrics.planning_packet_summary_resolved_route_ids}-${artifact.current_metrics.planning_packet_summary_unresolved_route_ids}/${artifact.current_metrics.planning_packet_summary_qa_boundary_references}`,
    `- Planning summary broad-coverage / semantic-independence claim allowed: ${artifact.current_metrics.planning_packet_summary_broad_coverage_claim_allowed}/${artifact.current_metrics.planning_packet_summary_semantic_independence_claim_allowed}`,
    `- Anchor audit rows / anchors / source-ref matches: ${artifact.current_metrics.anchor_audit_rows}/${artifact.current_metrics.anchor_audit_existing_anchors}/${artifact.current_metrics.anchor_audit_matching_source_refs}`,
    `- Anchor audit token/focus surfaces in page: ${artifact.current_metrics.anchor_audit_token_surfaces_in_page}/${artifact.current_metrics.anchor_audit_focus_surfaces_in_page}`,
    `- Anchor audit context / license / version rows: ${artifact.current_metrics.anchor_audit_rows_with_context}/${artifact.current_metrics.anchor_audit_rows_with_license}/${artifact.current_metrics.anchor_audit_rows_with_version}`,
    `- Anchor audit reader-facing / route-payload / forbidden-authority hits: ${artifact.current_metrics.anchor_audit_reader_facing_rows}/${artifact.current_metrics.anchor_audit_route_payload_field_hits}/${artifact.current_metrics.anchor_audit_forbidden_authority_field_hits}`,
    `- Occurrence support rows / supported-candidate-weak: ${artifact.current_metrics.occurrence_support_rows}/${artifact.current_metrics.occurrence_support_supported_rows}-${artifact.current_metrics.occurrence_support_candidate_rows}-${artifact.current_metrics.occurrence_support_weak_rows}`,
    `- Occurrence support source/anchor/context/focus/route/license/version rows: ${artifact.current_metrics.occurrence_support_rows_with_source_url}/${artifact.current_metrics.occurrence_support_rows_with_local_work_anchor}/${artifact.current_metrics.occurrence_support_rows_with_context_snippet}/${artifact.current_metrics.occurrence_support_rows_with_focus_marker}/${artifact.current_metrics.occurrence_support_rows_with_route_ids}/${artifact.current_metrics.occurrence_support_rows_with_license_metadata}/${artifact.current_metrics.occurrence_support_rows_with_version_metadata}`,
    `- Occurrence support reader-facing / route-payload / forbidden-authority hits: ${artifact.current_metrics.occurrence_support_reader_facing_rows}/${artifact.current_metrics.occurrence_support_route_payload_field_hits}/${artifact.current_metrics.occurrence_support_forbidden_authority_field_hits}`,
    `- Concordance navigation rows / supported-candidate-weak: ${artifact.current_metrics.concordance_navigation_rows}/${artifact.current_metrics.concordance_navigation_supported_rows}-${artifact.current_metrics.concordance_navigation_candidate_rows}-${artifact.current_metrics.concordance_navigation_weak_rows}`,
    `- Concordance navigation selected / source-work-category-route: ${artifact.current_metrics.concordance_navigation_selected_support_rows}/${artifact.current_metrics.concordance_navigation_source_refs}-${artifact.current_metrics.concordance_navigation_works}-${artifact.current_metrics.concordance_navigation_categories}-${artifact.current_metrics.concordance_navigation_route_ids}`,
    `- Concordance navigation source/anchor/context/focus/route/license/version rows: ${artifact.current_metrics.concordance_navigation_rows_with_source_url}/${artifact.current_metrics.concordance_navigation_rows_with_local_work_anchor}/${artifact.current_metrics.concordance_navigation_rows_with_context_snippet}/${artifact.current_metrics.concordance_navigation_rows_with_focus_marker}/${artifact.current_metrics.concordance_navigation_rows_with_route_ids}/${artifact.current_metrics.concordance_navigation_rows_with_license_metadata}/${artifact.current_metrics.concordance_navigation_rows_with_version_metadata}`,
    `- Concordance navigation reader-facing / route-payload / forbidden-authority hits: ${artifact.current_metrics.concordance_navigation_reader_facing_rows}/${artifact.current_metrics.concordance_navigation_route_payload_field_hits}/${artifact.current_metrics.concordance_navigation_forbidden_authority_field_hits}`,
    `- Public handoff selected/pass/fail targets: ${artifact.current_metrics.public_handoff_selected_targets}/${artifact.current_metrics.public_handoff_validation_passed}/${artifact.current_metrics.public_handoff_validation_failed}`,
    `- Public handoff eligible usage / ambiguous count-only rows: ${artifact.current_metrics.public_handoff_eligible_usage_rows}/${artifact.current_metrics.public_handoff_count_only_ambiguous_rows}`,
    `- Public handoff supported-candidate-weak / zero-useful: ${artifact.current_metrics.public_handoff_supported_rows}-${artifact.current_metrics.public_handoff_candidate_rows}-${artifact.current_metrics.public_handoff_weak_rows}/${artifact.current_metrics.public_handoff_zero_useful_targets}`,
    `- Public handoff freshness scanned/current/delta/modified/created: ${artifact.current_metrics.public_handoff_artifact_source_files_scanned}/${artifact.current_metrics.public_handoff_current_source_files}/${artifact.current_metrics.public_handoff_source_count_delta}/${artifact.current_metrics.public_handoff_files_modified_after_artifact}/${artifact.current_metrics.public_handoff_files_created_after_artifact}`,
    `- Public handoff authority final/answer/text/corpus-exhaustive: ${artifact.current_metrics.public_handoff_final_ranking_authority}/${artifact.current_metrics.public_handoff_visible_answer_authority}/${artifact.current_metrics.public_handoff_carries_text_rows}/${artifact.current_metrics.public_handoff_corpus_exhaustive}`,
    `- Freshness impact pending / overlap / impacted rows: ${artifact.current_metrics.freshness_impact_pending_refresh_files}/${artifact.current_metrics.freshness_impact_pending_with_current_usage_overlap}/${artifact.current_metrics.freshness_impact_impacted_navigation_rows}`,
    `- Freshness impact selected support / promoted targets: ${artifact.current_metrics.freshness_impact_impacted_selected_support_rows}/${artifact.current_metrics.freshness_impact_promoted_run_targets}`,
    `- Freshness impact source-text / broad-expansion / reader-facing / route-payload / forbidden-authority hits: ${artifact.current_metrics.freshness_impact_source_text_read}/${artifact.current_metrics.freshness_impact_broad_target_expansion}/${artifact.current_metrics.freshness_impact_reader_facing_rows}/${artifact.current_metrics.freshness_impact_route_payload_field_hits}/${artifact.current_metrics.freshness_impact_forbidden_authority_field_hits}`,
    `- Current source-freshness refresh dirty / modified / untracked: ${artifact.current_metrics.source_freshness_refresh_dirty_source_files}/${artifact.current_metrics.source_freshness_refresh_modified_source_files}/${artifact.current_metrics.source_freshness_refresh_untracked_source_files}`,
    `- Current source-freshness refresh overlap / impacted / selected / delta: ${artifact.current_metrics.source_freshness_refresh_overlap_sources}/${artifact.current_metrics.source_freshness_refresh_impacted_navigation_rows}/${artifact.current_metrics.source_freshness_refresh_impacted_selected_support_rows}/${artifact.current_metrics.source_freshness_refresh_prior_pending_delta}`,
    `- Current source-freshness refresh source-text / broad-expansion / promoted / reader-facing / route-payload / forbidden-authority hits: ${artifact.current_metrics.source_freshness_refresh_source_text_read}/${artifact.current_metrics.source_freshness_refresh_broad_target_expansion}/${artifact.current_metrics.source_freshness_refresh_promoted_run_targets}/${artifact.current_metrics.source_freshness_refresh_reader_facing_rows}/${artifact.current_metrics.source_freshness_refresh_route_payload_field_hits}/${artifact.current_metrics.source_freshness_refresh_forbidden_authority_field_hits}`,
    `- Freshness follow-up dirty / overlap / impacted / route IDs: ${artifact.current_metrics.freshness_followup_live_dirty_source_files}/${artifact.current_metrics.freshness_followup_overlap_sources}/${artifact.current_metrics.freshness_followup_impacted_navigation_rows}/${artifact.current_metrics.freshness_followup_current_route_ids}`,
    `- Freshness follow-up queue mutations / submitted / forbidden-authority hits: ${artifact.current_metrics.freshness_followup_queue_mutations}/${artifact.current_metrics.freshness_followup_submitted_to_agent6}/${artifact.current_metrics.freshness_followup_forbidden_authority_field_hits}`,
    `- Crossmatch inventory files / dirty-uncommitted / truthy-authority hits: ${artifact.current_metrics.crossmatch_inventory_files}/${artifact.current_metrics.crossmatch_inventory_dirty_or_uncommitted_files}/${artifact.current_metrics.crossmatch_inventory_forbidden_truthy_authority_claims}`,
    `- Agent10 crossmatch direct-state stale/current dirty / delta / boundary packets: ${artifact.current_metrics.agent10_crossmatch_direct_state_dirty_or_uncommitted_files}/${artifact.current_metrics.agent10_crossmatch_current_inventory_dirty_or_uncommitted_files}/${artifact.current_metrics.agent10_crossmatch_stale_dirty_count_delta}/${artifact.current_metrics.agent10_crossmatch_agent6_boundary_packets_opened}`,
    `- Post-crossmatch wake queue-stale / current-dirty / registered / executable / blockers: ${artifact.current_metrics.post_crossmatch_wake_queue_stale_deuteronomy_rows}/${artifact.current_metrics.post_crossmatch_wake_current_inventory_dirty_files}/${artifact.current_metrics.post_crossmatch_wake_registered_continuity_rows}/${artifact.current_metrics.post_crossmatch_wake_direct_executable_worksets}/${artifact.current_metrics.post_crossmatch_wake_no_new_workset_blockers}`,
    `- Orot route-selection crossmatch rows / occurrences / mismatch-linkagegap-blockers: ${artifact.current_metrics.orot_route_selection_rows}/${artifact.current_metrics.orot_route_selection_occurrence_links}/${artifact.current_metrics.orot_route_selection_candidate_mismatches}-${artifact.current_metrics.orot_route_selection_token_index_linkage_gaps}-${artifact.current_metrics.orot_route_selection_exact_blockers}`,
    `- Post-route-selection wake executable / blockers / wake-conditions: ${artifact.current_metrics.post_route_selection_wake_current_executable_worksets}/${artifact.current_metrics.post_route_selection_wake_exact_blockers}/${artifact.current_metrics.post_route_selection_wake_conditions}`,
    `- Old-dictionary row-overlap linkage buckets / rows / occurrences / sample-dupes / source-pointers / blockers: ${artifact.current_metrics.old_dictionary_row_overlap_buckets}/${artifact.current_metrics.old_dictionary_row_overlap_rows}/${artifact.current_metrics.old_dictionary_row_overlap_occurrences}/${artifact.current_metrics.old_dictionary_row_overlap_duplicate_sample_tokens}/${artifact.current_metrics.old_dictionary_row_overlap_source_family_pointer_rows}/${artifact.current_metrics.old_dictionary_row_overlap_exact_blockers}`,
    `- Old-dictionary candidate-use continuity rows / occurrences / sample-linked / sample-unlinked / blocker-link rows: ${artifact.current_metrics.old_dictionary_candidate_use_rows}/${artifact.current_metrics.old_dictionary_candidate_use_occurrences}/${artifact.current_metrics.old_dictionary_candidate_use_sample_linked_rows}/${artifact.current_metrics.old_dictionary_candidate_use_sample_unlinked_rows}/${artifact.current_metrics.old_dictionary_candidate_use_blocker_link_rows}`,
    `- Old-dictionary candidate-use source-family dedupe families / family-sets / memberships / multi-family rows / blockers: ${artifact.current_metrics.old_dictionary_candidate_use_source_family_rows}/${artifact.current_metrics.old_dictionary_candidate_use_source_family_set_rows}/${artifact.current_metrics.old_dictionary_candidate_use_source_family_membership_rows}/${artifact.current_metrics.old_dictionary_candidate_use_source_family_multi_rows}/${artifact.current_metrics.old_dictionary_candidate_use_source_family_exact_blockers}`,
    `- Old-dictionary candidate-use source-RID refs / unique / prefixes / rows-with-metadata / missing-prefixes: ${artifact.current_metrics.old_dictionary_candidate_use_source_rid_references}/${artifact.current_metrics.old_dictionary_candidate_use_source_rid_unique}/${artifact.current_metrics.old_dictionary_candidate_use_source_rid_prefix_rows}/${artifact.current_metrics.old_dictionary_candidate_use_source_rid_rows_with_metadata}/${artifact.current_metrics.old_dictionary_candidate_use_source_rid_missing_prefixes}`,
    `- Old-dictionary candidate-use exact-subset matched / missing / commercial-only / NC-overlap / blocked-overlap / triple-overlap: ${artifact.current_metrics.old_dictionary_candidate_use_exact_subset_matched_rows}/${artifact.current_metrics.old_dictionary_candidate_use_exact_subset_missing_rows}/${artifact.current_metrics.old_dictionary_candidate_use_exact_subset_commercial_only_rows}/${artifact.current_metrics.old_dictionary_candidate_use_exact_subset_nc_overlap_rows}/${artifact.current_metrics.old_dictionary_candidate_use_exact_subset_blocked_overlap_rows}/${artifact.current_metrics.old_dictionary_candidate_use_exact_subset_triple_overlap_rows}`,
    `- Old-dictionary candidate-use boundary triage rows / occurrences / pure-clean / overlap / bucket-family-set rows / missing family links: ${artifact.current_metrics.old_dictionary_candidate_use_boundary_triage_rows}/${artifact.current_metrics.old_dictionary_candidate_use_boundary_triage_occurrences}/${artifact.current_metrics.old_dictionary_candidate_use_boundary_triage_pure_clean_rows}/${artifact.current_metrics.old_dictionary_candidate_use_boundary_triage_overlap_rows}/${artifact.current_metrics.old_dictionary_candidate_use_boundary_triage_bucket_family_sets}/${artifact.current_metrics.old_dictionary_candidate_use_boundary_triage_missing_family_boundary_links}`,
    `- Old-dictionary pure commercial candidate-use workset rows / occurrences / unique source RIDs / blockers / transform-ready: ${artifact.current_metrics.old_dictionary_pure_commercial_candidate_use_workset_rows}/${artifact.current_metrics.old_dictionary_pure_commercial_candidate_use_workset_occurrences}/${artifact.current_metrics.old_dictionary_pure_commercial_candidate_use_workset_source_rids}/${artifact.current_metrics.old_dictionary_pure_commercial_candidate_use_workset_blocker_rows}/${artifact.current_metrics.old_dictionary_pure_commercial_candidate_use_workset_transform_ready_rows}`,
    `- Old-dictionary overlap candidate-use workset rows / occurrences / unique source RIDs / blockers / bucket-family-set rows / transform-ready: ${artifact.current_metrics.old_dictionary_overlap_candidate_use_workset_rows}/${artifact.current_metrics.old_dictionary_overlap_candidate_use_workset_occurrences}/${artifact.current_metrics.old_dictionary_overlap_candidate_use_workset_unique_source_rids}/${artifact.current_metrics.old_dictionary_overlap_candidate_use_workset_blocker_rows}/${artifact.current_metrics.old_dictionary_overlap_candidate_use_workset_bucket_family_sets}/${artifact.current_metrics.old_dictionary_overlap_candidate_use_workset_transform_ready_rows}`,
    `- Old-dictionary candidate-use split closure rows / occurrences / missing / extra / duplicate queue IDs / shared source RIDs / transform-ready: ${artifact.current_metrics.old_dictionary_candidate_use_split_closure_rows}/${artifact.current_metrics.old_dictionary_candidate_use_split_closure_occurrences}/${artifact.current_metrics.old_dictionary_candidate_use_split_closure_missing_rows}/${artifact.current_metrics.old_dictionary_candidate_use_split_closure_extra_rows}/${artifact.current_metrics.old_dictionary_candidate_use_split_closure_duplicate_queue_ids}/${artifact.current_metrics.old_dictionary_candidate_use_split_closure_shared_source_rids}/${artifact.current_metrics.old_dictionary_candidate_use_split_closure_transform_ready_rows}`,
    `- Old-dictionary candidate-use handoff index entries / JSON / reports / validators / type mismatches / authority issues: ${artifact.current_metrics.old_dictionary_candidate_use_handoff_index_entries}/${artifact.current_metrics.old_dictionary_candidate_use_handoff_index_json_artifacts_exist}/${artifact.current_metrics.old_dictionary_candidate_use_handoff_index_report_artifacts_exist}/${artifact.current_metrics.old_dictionary_candidate_use_handoff_index_validator_scripts_exist}/${artifact.current_metrics.old_dictionary_candidate_use_handoff_index_artifact_type_mismatches}/${artifact.current_metrics.old_dictionary_candidate_use_handoff_index_entries_with_authority_issues}`,
    `- Old-dictionary candidate-use row lineage rows / occurrences / all-layer-linked / gaps / duplicate queue IDs / Agent 2 queue pointers / transform-ready: ${artifact.current_metrics.old_dictionary_candidate_use_row_lineage_rows}/${artifact.current_metrics.old_dictionary_candidate_use_row_lineage_occurrences}/${artifact.current_metrics.old_dictionary_candidate_use_row_lineage_all_layers_linked}/${artifact.current_metrics.old_dictionary_candidate_use_row_lineage_gap_rows}/${artifact.current_metrics.old_dictionary_candidate_use_row_lineage_duplicate_queue_ids}/${artifact.current_metrics.old_dictionary_candidate_use_row_lineage_agent2_queue_pointers}/${artifact.current_metrics.old_dictionary_candidate_use_row_lineage_transform_ready_rows}`,
    `- Old-dictionary candidate-use boundary-chain crossmatch rows / preboundary matches / zero-text matches / missing-extra-mismatch rows / current transform blockers / zero-counter violations / transform-ready: ${artifact.current_metrics.old_dictionary_candidate_use_boundary_chain_rows}/${artifact.current_metrics.old_dictionary_candidate_use_boundary_chain_preboundary_matches}/${artifact.current_metrics.old_dictionary_candidate_use_boundary_chain_zero_text_matches}/${artifact.current_metrics.old_dictionary_candidate_use_boundary_chain_missing_rows}-${artifact.current_metrics.old_dictionary_candidate_use_boundary_chain_extra_rows}-${artifact.current_metrics.old_dictionary_candidate_use_boundary_chain_mismatch_rows}/${artifact.current_metrics.old_dictionary_candidate_use_boundary_chain_current_transform_blockers}/${artifact.current_metrics.old_dictionary_candidate_use_boundary_chain_zero_counter_violations}/${artifact.current_metrics.old_dictionary_candidate_use_boundary_chain_transform_ready_rows}`,
    `- Old-dictionary candidate-use source-citation dependency rows / missing citation / missing transform rule / source RID refs / blockers / stale Agent 1 route blockers / transform-ready: ${artifact.current_metrics.old_dictionary_candidate_use_source_citation_dependency_rows}/${artifact.current_metrics.old_dictionary_candidate_use_source_citation_dependency_missing_citation_rows}/${artifact.current_metrics.old_dictionary_candidate_use_source_citation_dependency_missing_transform_rule_rows}/${artifact.current_metrics.old_dictionary_candidate_use_source_citation_dependency_source_rid_refs}/${artifact.current_metrics.old_dictionary_candidate_use_source_citation_dependency_exact_blockers}/${artifact.current_metrics.old_dictionary_candidate_use_source_citation_dependency_stale_agent1_route_blockers}/${artifact.current_metrics.old_dictionary_candidate_use_source_citation_dependency_transform_ready_rows}`,
    `- Old-dictionary candidate-use Agent 1 route recheck rows / recheck required / target-registry match / registry postdates blocker / missing citation / delivery attempts / transform-ready: ${artifact.current_metrics.old_dictionary_candidate_use_agent1_route_recheck_rows}/${artifact.current_metrics.old_dictionary_candidate_use_agent1_route_recheck_required_rows}/${artifact.current_metrics.old_dictionary_candidate_use_agent1_route_recheck_target_matches_registry_rows}/${artifact.current_metrics.old_dictionary_candidate_use_agent1_route_recheck_registry_postdates_blocker_rows}/${artifact.current_metrics.old_dictionary_candidate_use_agent1_route_recheck_missing_citation_rows}/${artifact.current_metrics.old_dictionary_candidate_use_agent1_route_recheck_delivery_attempts_by_agent3}/${artifact.current_metrics.old_dictionary_candidate_use_agent1_route_recheck_transform_ready_rows}`,
    `- Old-dictionary candidate-use gate-proof coverage rows / any gate / direct / aggregate / missing / blockers / authority issues / transform-ready: ${artifact.current_metrics.old_dictionary_candidate_use_gate_proof_coverage_rows}/${artifact.current_metrics.old_dictionary_candidate_use_gate_proof_coverage_any_gate_rows}/${artifact.current_metrics.old_dictionary_candidate_use_gate_proof_coverage_direct_rows}/${artifact.current_metrics.old_dictionary_candidate_use_gate_proof_coverage_aggregate_rows}/${artifact.current_metrics.old_dictionary_candidate_use_gate_proof_coverage_missing_rows}/${artifact.current_metrics.old_dictionary_candidate_use_gate_proof_coverage_exact_blockers}/${artifact.current_metrics.old_dictionary_candidate_use_gate_proof_coverage_authority_issues}/${artifact.current_metrics.old_dictionary_candidate_use_gate_proof_coverage_transform_ready_rows}`,
    `- Old-dictionary candidate-use current blocker index rows / observed / affected rows-occurrences / missing citation-transform-gate / route recheck / forbidden-acceptance-release hits: ${artifact.current_metrics.old_dictionary_candidate_use_current_blocker_rows}/${artifact.current_metrics.old_dictionary_candidate_use_current_blocker_observed_rows}/${artifact.current_metrics.old_dictionary_candidate_use_current_blocker_affected_rows}-${artifact.current_metrics.old_dictionary_candidate_use_current_blocker_affected_occurrences}/${artifact.current_metrics.old_dictionary_candidate_use_current_blocker_missing_citation_rows}-${artifact.current_metrics.old_dictionary_candidate_use_current_blocker_missing_transform_rule_rows}-${artifact.current_metrics.old_dictionary_candidate_use_current_blocker_gate_proof_missing_rows}/${artifact.current_metrics.old_dictionary_candidate_use_current_blocker_route_recheck_required_rows}/${artifact.current_metrics.old_dictionary_candidate_use_current_blocker_forbidden_payload_field_hits}-${artifact.current_metrics.old_dictionary_candidate_use_current_blocker_acceptance_claims}-${artifact.current_metrics.old_dictionary_candidate_use_current_blocker_release_actions}`,
    `- Old-dictionary candidate-use row blocker matrix rows / occurrences / blocker links / missing citation-transform / gate boundary-source / route recheck / pure-overlap / forbidden-acceptance-release hits: ${artifact.current_metrics.old_dictionary_candidate_use_row_blocker_matrix_rows}/${artifact.current_metrics.old_dictionary_candidate_use_row_blocker_matrix_occurrences}/${artifact.current_metrics.old_dictionary_candidate_use_row_blocker_matrix_links}/${artifact.current_metrics.old_dictionary_candidate_use_row_blocker_matrix_missing_citation_rows}-${artifact.current_metrics.old_dictionary_candidate_use_row_blocker_matrix_missing_transform_rule_rows}/${artifact.current_metrics.old_dictionary_candidate_use_row_blocker_matrix_gate_boundary_rows}-${artifact.current_metrics.old_dictionary_candidate_use_row_blocker_matrix_gate_source_rows}/${artifact.current_metrics.old_dictionary_candidate_use_row_blocker_matrix_route_recheck_rows}/${artifact.current_metrics.old_dictionary_candidate_use_row_blocker_matrix_pure_rows}-${artifact.current_metrics.old_dictionary_candidate_use_row_blocker_matrix_overlap_rows}/${artifact.current_metrics.old_dictionary_candidate_use_row_blocker_matrix_forbidden_payload_field_hits}-${artifact.current_metrics.old_dictionary_candidate_use_row_blocker_matrix_acceptance_claims}-${artifact.current_metrics.old_dictionary_candidate_use_row_blocker_matrix_release_actions}`,
    `- Old-dictionary candidate-use source-RID blocker rows / references / prefixes / unique queue IDs / multi-queue rows / blocker links / missing citation-transform-Agent6 / gate boundary-source / forbidden-acceptance-release hits: ${artifact.current_metrics.old_dictionary_candidate_use_source_rid_blocker_rows}/${artifact.current_metrics.old_dictionary_candidate_use_source_rid_blocker_references}/${artifact.current_metrics.old_dictionary_candidate_use_source_rid_blocker_prefixes}/${artifact.current_metrics.old_dictionary_candidate_use_source_rid_blocker_unique_queue_ids}/${artifact.current_metrics.old_dictionary_candidate_use_source_rid_blocker_multi_queue_rows}/${artifact.current_metrics.old_dictionary_candidate_use_source_rid_blocker_links}/${artifact.current_metrics.old_dictionary_candidate_use_source_rid_blocker_missing_citation_rows}-${artifact.current_metrics.old_dictionary_candidate_use_source_rid_blocker_missing_transform_rule_rows}-${artifact.current_metrics.old_dictionary_candidate_use_source_rid_blocker_agent6_boundary_rows}/${artifact.current_metrics.old_dictionary_candidate_use_source_rid_blocker_gate_boundary_rows}-${artifact.current_metrics.old_dictionary_candidate_use_source_rid_blocker_gate_source_rows}/${artifact.current_metrics.old_dictionary_candidate_use_source_rid_blocker_forbidden_payload_field_hits}-${artifact.current_metrics.old_dictionary_candidate_use_source_rid_blocker_acceptance_claims}-${artifact.current_metrics.old_dictionary_candidate_use_source_rid_blocker_release_actions}`,
    `- Old-dictionary candidate-use source-citation worklist rows / references / prefixes / unique queue IDs / multi-queue-cross-partition / citation-transform-Agent6 rows / forbidden-acceptance-release hits: ${artifact.current_metrics.old_dictionary_candidate_use_source_citation_worklist_rows}/${artifact.current_metrics.old_dictionary_candidate_use_source_citation_worklist_references}/${artifact.current_metrics.old_dictionary_candidate_use_source_citation_worklist_prefixes}/${artifact.current_metrics.old_dictionary_candidate_use_source_citation_worklist_unique_queue_ids}/${artifact.current_metrics.old_dictionary_candidate_use_source_citation_worklist_multi_queue_rows}-${artifact.current_metrics.old_dictionary_candidate_use_source_citation_worklist_cross_partition_rows}/${artifact.current_metrics.old_dictionary_candidate_use_source_citation_worklist_required_rows}-${artifact.current_metrics.old_dictionary_candidate_use_source_citation_worklist_transform_blocked_rows}-${artifact.current_metrics.old_dictionary_candidate_use_source_citation_worklist_agent6_after_prereq_rows}/${artifact.current_metrics.old_dictionary_candidate_use_source_citation_worklist_forbidden_payload_field_hits}-${artifact.current_metrics.old_dictionary_candidate_use_source_citation_worklist_acceptance_claims}-${artifact.current_metrics.old_dictionary_candidate_use_source_citation_worklist_release_actions}`,
    `- Old-dictionary candidate-use source-citation batch rows / memberships / unique source RIDs / source-family-partition-triage-impact groups / citation-transform-Agent6 memberships / forbidden-acceptance-release hits: ${artifact.current_metrics.old_dictionary_candidate_use_source_citation_batch_rows}/${artifact.current_metrics.old_dictionary_candidate_use_source_citation_batch_memberships}/${artifact.current_metrics.old_dictionary_candidate_use_source_citation_batch_unique_source_rids}/${artifact.current_metrics.old_dictionary_candidate_use_source_citation_batch_source_families}-${artifact.current_metrics.old_dictionary_candidate_use_source_citation_batch_partitions}-${artifact.current_metrics.old_dictionary_candidate_use_source_citation_batch_triage_groups}-${artifact.current_metrics.old_dictionary_candidate_use_source_citation_batch_impact_buckets}/${artifact.current_metrics.old_dictionary_candidate_use_source_citation_batch_required_memberships}-${artifact.current_metrics.old_dictionary_candidate_use_source_citation_batch_transform_blocked_memberships}-${artifact.current_metrics.old_dictionary_candidate_use_source_citation_batch_agent6_after_prereq_memberships}/${artifact.current_metrics.old_dictionary_candidate_use_source_citation_batch_forbidden_payload_field_hits}-${artifact.current_metrics.old_dictionary_candidate_use_source_citation_batch_acceptance_claims}-${artifact.current_metrics.old_dictionary_candidate_use_source_citation_batch_release_actions}`,
    `- Old-dictionary candidate-use source-citation prefix rows / summaries / memberships / unique source RIDs-prefixes-families / multi-family prefixes-memberships / citation-transform-Agent6 memberships / forbidden-acceptance-release hits: ${artifact.current_metrics.old_dictionary_candidate_use_source_citation_prefix_rows}/${artifact.current_metrics.old_dictionary_candidate_use_source_citation_prefix_summary_rows}/${artifact.current_metrics.old_dictionary_candidate_use_source_citation_prefix_memberships}/${artifact.current_metrics.old_dictionary_candidate_use_source_citation_prefix_unique_source_rids}-${artifact.current_metrics.old_dictionary_candidate_use_source_citation_prefix_unique_prefixes}-${artifact.current_metrics.old_dictionary_candidate_use_source_citation_prefix_source_families}/${artifact.current_metrics.old_dictionary_candidate_use_source_citation_prefix_multi_family_prefixes}-${artifact.current_metrics.old_dictionary_candidate_use_source_citation_prefix_multi_family_memberships}/${artifact.current_metrics.old_dictionary_candidate_use_source_citation_prefix_required_memberships}-${artifact.current_metrics.old_dictionary_candidate_use_source_citation_prefix_transform_blocked_memberships}-${artifact.current_metrics.old_dictionary_candidate_use_source_citation_prefix_agent6_after_prereq_memberships}/${artifact.current_metrics.old_dictionary_candidate_use_source_citation_prefix_forbidden_payload_field_hits}-${artifact.current_metrics.old_dictionary_candidate_use_source_citation_prefix_acceptance_claims}-${artifact.current_metrics.old_dictionary_candidate_use_source_citation_prefix_release_actions}`,
    `- Old-dictionary candidate-use Agent 6 boundary prereq rows / prefixes / occurrences / queue-token IDs / source families / citation-transform-after-prereq-ready rows / selection-forbidden-acceptance-release hits: ${artifact.current_metrics.old_dictionary_candidate_use_agent6_boundary_prereq_rows}/${artifact.current_metrics.old_dictionary_candidate_use_agent6_boundary_prereq_prefix_rows}/${artifact.current_metrics.old_dictionary_candidate_use_agent6_boundary_prereq_occurrences}/${artifact.current_metrics.old_dictionary_candidate_use_agent6_boundary_prereq_unique_queue_ids}-${artifact.current_metrics.old_dictionary_candidate_use_agent6_boundary_prereq_unique_token_ids}/${artifact.current_metrics.old_dictionary_candidate_use_agent6_boundary_prereq_source_family_count}/${artifact.current_metrics.old_dictionary_candidate_use_agent6_boundary_prereq_citation_required_rows}-${artifact.current_metrics.old_dictionary_candidate_use_agent6_boundary_prereq_transform_blocked_rows}-${artifact.current_metrics.old_dictionary_candidate_use_agent6_boundary_prereq_after_prereq_rows}-${artifact.current_metrics.old_dictionary_candidate_use_agent6_boundary_prereq_ready_now_rows}/${artifact.current_metrics.old_dictionary_candidate_use_agent6_boundary_prereq_selection_claims}-${artifact.current_metrics.old_dictionary_candidate_use_agent6_boundary_prereq_forbidden_payload_field_hits}-${artifact.current_metrics.old_dictionary_candidate_use_agent6_boundary_prereq_acceptance_claims}-${artifact.current_metrics.old_dictionary_candidate_use_agent6_boundary_prereq_release_actions}`,
    `- Old-dictionary candidate-use direct source-citation rows / excluded source-family-boundary-Agent6 rows / occurrences / prefix-source-family rows / citation-transform-after-prereq-source-family-blocker rows / selection-forbidden-acceptance-release hits: ${artifact.current_metrics.old_dictionary_candidate_use_direct_source_citation_rows}/${artifact.current_metrics.old_dictionary_candidate_use_direct_source_citation_excluded_source_family_boundary_rows}-${artifact.current_metrics.old_dictionary_candidate_use_direct_source_citation_excluded_agent6_prereq_rows}/${artifact.current_metrics.old_dictionary_candidate_use_direct_source_citation_occurrences}/${artifact.current_metrics.old_dictionary_candidate_use_direct_source_citation_prefix_rows}-${artifact.current_metrics.old_dictionary_candidate_use_direct_source_citation_source_family_rows}/${artifact.current_metrics.old_dictionary_candidate_use_direct_source_citation_citation_required_rows}-${artifact.current_metrics.old_dictionary_candidate_use_direct_source_citation_transform_blocked_rows}-${artifact.current_metrics.old_dictionary_candidate_use_direct_source_citation_after_prereq_rows}-${artifact.current_metrics.old_dictionary_candidate_use_direct_source_citation_source_family_blocker_rows}/${artifact.current_metrics.old_dictionary_candidate_use_direct_source_citation_selection_claims}-${artifact.current_metrics.old_dictionary_candidate_use_direct_source_citation_forbidden_payload_field_hits}-${artifact.current_metrics.old_dictionary_candidate_use_direct_source_citation_acceptance_claims}-${artifact.current_metrics.old_dictionary_candidate_use_direct_source_citation_release_actions}`,
    `- Old-dictionary candidate-use source-family selection exclusion rows / direct non-excluded / Agent6-covered-unpacketized / occurrences / classifications-prefixes / citation-transform-after-prereq-blocker rows / selection-forbidden-acceptance-release hits: ${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_exclusion_rows}/${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_exclusion_direct_rows}/${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_exclusion_agent6_covered_rows}-${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_exclusion_unpacketized_rows}/${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_exclusion_occurrences}/${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_exclusion_classification_rows}-${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_exclusion_prefix_rows}/${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_exclusion_citation_required_rows}-${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_exclusion_transform_blocked_rows}-${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_exclusion_after_prereq_rows}-${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_exclusion_blocker_rows}/${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_exclusion_selection_claims}-${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_exclusion_forbidden_payload_field_hits}-${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_exclusion_acceptance_claims}-${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_exclusion_release_actions}`,
    `- Old-dictionary candidate-use unpacketized source-family workset rows / refs-occurrences / prefixes-queue-token IDs / family-triage-impact-partition signatures / citation-transform-after-prereq-existingpacket-blocker rows / selection-forbidden-acceptance-release hits: ${artifact.current_metrics.old_dictionary_candidate_use_unpacketized_source_family_selection_rows}/${artifact.current_metrics.old_dictionary_candidate_use_unpacketized_source_family_selection_source_rid_refs}-${artifact.current_metrics.old_dictionary_candidate_use_unpacketized_source_family_selection_occurrences}/${artifact.current_metrics.old_dictionary_candidate_use_unpacketized_source_family_selection_prefixes}-${artifact.current_metrics.old_dictionary_candidate_use_unpacketized_source_family_selection_queue_ids}-${artifact.current_metrics.old_dictionary_candidate_use_unpacketized_source_family_selection_token_ids}/${artifact.current_metrics.old_dictionary_candidate_use_unpacketized_source_family_selection_family_signatures}-${artifact.current_metrics.old_dictionary_candidate_use_unpacketized_source_family_selection_triage_signatures}-${artifact.current_metrics.old_dictionary_candidate_use_unpacketized_source_family_selection_impact_buckets}-${artifact.current_metrics.old_dictionary_candidate_use_unpacketized_source_family_selection_partition_signatures}/${artifact.current_metrics.old_dictionary_candidate_use_unpacketized_source_family_selection_citation_required_rows}-${artifact.current_metrics.old_dictionary_candidate_use_unpacketized_source_family_selection_transform_blocked_rows}-${artifact.current_metrics.old_dictionary_candidate_use_unpacketized_source_family_selection_after_prereq_rows}-${artifact.current_metrics.old_dictionary_candidate_use_unpacketized_source_family_selection_existing_packet_rows}-${artifact.current_metrics.old_dictionary_candidate_use_unpacketized_source_family_selection_blocker_rows}/${artifact.current_metrics.old_dictionary_candidate_use_unpacketized_source_family_selection_selection_claims}-${artifact.current_metrics.old_dictionary_candidate_use_unpacketized_source_family_selection_forbidden_payload_field_hits}-${artifact.current_metrics.old_dictionary_candidate_use_unpacketized_source_family_selection_acceptance_claims}-${artifact.current_metrics.old_dictionary_candidate_use_unpacketized_source_family_selection_release_actions}`,
    `- Old-dictionary candidate-use source-family batch plan batches / rows / multi-single / refs-occurrences / max rows-occurrences / signatures / citation-transform-after-prereq-existingpacket-blocker rows / selection-forbidden-acceptance-release hits: ${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_batch_plan_batches}/${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_batch_plan_rows}/${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_batch_plan_multi_single_batches}/${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_batch_plan_refs}-${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_batch_plan_occurrences}/${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_batch_plan_max_rows}-${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_batch_plan_max_occurrences}/${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_batch_plan_signatures}/${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_batch_plan_citation_required_rows}-${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_batch_plan_transform_blocked_rows}-${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_batch_plan_after_prereq_rows}-${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_batch_plan_existing_packet_rows}-${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_batch_plan_blocker_rows}/${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_batch_plan_selection_claims}-${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_batch_plan_forbidden_payload_field_hits}-${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_batch_plan_acceptance_claims}-${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_batch_plan_release_actions}`,
    `- Old-dictionary candidate-use source-family queue/batch rows / links / batch-queue-sourcebatch / cross-single / multisource-single / multiqueue source RIDs / max batch-source-occ / ref-occ memberships / citation-transform-after-prereq-existingpacket-blocker links / selection-forbidden-acceptance-release hits: ${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_queue_batch_rows}/${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_queue_batch_links}/${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_queue_batch_batch_queue_links}-${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_queue_batch_source_batch_pairs}/${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_queue_batch_cross_single}/${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_queue_batch_multi_single_source}/${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_queue_batch_multi_queue_source_rids}/${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_queue_batch_max_batches_sources_occurrences}/${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_queue_batch_ref_occurrence_memberships}/${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_queue_batch_citation_required_links}-${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_queue_batch_transform_blocked_links}-${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_queue_batch_after_prereq_links}-${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_queue_batch_existing_packet_links}-${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_queue_batch_blocker_links}/${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_queue_batch_selection_claims}-${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_queue_batch_forbidden_payload_field_hits}-${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_queue_batch_acceptance_claims}-${artifact.current_metrics.old_dictionary_candidate_use_source_family_selection_queue_batch_release_actions}`,
    `- Old-dictionary candidate-use cross-batch queue guard rows / links / batchlinks / sourceRIDs / queue-token-batch IDs / three-two / max batch-source-occ / ref-occ / summaries / citation-transform-after-prereq-existingpacket-blocker links / selection-forbidden-acceptance-release hits: ${artifact.current_metrics.old_dictionary_candidate_use_cross_batch_queue_guard_rows}/${artifact.current_metrics.old_dictionary_candidate_use_cross_batch_queue_guard_links}/${artifact.current_metrics.old_dictionary_candidate_use_cross_batch_queue_guard_batch_links}/${artifact.current_metrics.old_dictionary_candidate_use_cross_batch_queue_guard_source_rids}/${artifact.current_metrics.old_dictionary_candidate_use_cross_batch_queue_guard_queue_token_batch_ids}/${artifact.current_metrics.old_dictionary_candidate_use_cross_batch_queue_guard_three_two}/${artifact.current_metrics.old_dictionary_candidate_use_cross_batch_queue_guard_max_batch_source_occurrence}/${artifact.current_metrics.old_dictionary_candidate_use_cross_batch_queue_guard_ref_occurrences}/${artifact.current_metrics.old_dictionary_candidate_use_cross_batch_queue_guard_summaries}/${artifact.current_metrics.old_dictionary_candidate_use_cross_batch_queue_guard_citation_required_links}-${artifact.current_metrics.old_dictionary_candidate_use_cross_batch_queue_guard_transform_blocked_links}-${artifact.current_metrics.old_dictionary_candidate_use_cross_batch_queue_guard_after_prereq_links}-${artifact.current_metrics.old_dictionary_candidate_use_cross_batch_queue_guard_existing_packet_links}-${artifact.current_metrics.old_dictionary_candidate_use_cross_batch_queue_guard_blocker_links}/${artifact.current_metrics.old_dictionary_candidate_use_cross_batch_queue_guard_selection_claims}-${artifact.current_metrics.old_dictionary_candidate_use_cross_batch_queue_guard_forbidden_payload_field_hits}-${artifact.current_metrics.old_dictionary_candidate_use_cross_batch_queue_guard_acceptance_claims}-${artifact.current_metrics.old_dictionary_candidate_use_cross_batch_queue_guard_release_actions}`,
    `- Old-dictionary candidate-use single-batch queue workset rows / links / batchlinks / sourceRIDs / queue-token-batch IDs / multisource-single-cross / max source-occ / ref-occ / summaries / citation-transform-after-prereq-existingpacket-blocker links / selection-forbidden-acceptance-release hits: ${artifact.current_metrics.old_dictionary_candidate_use_single_batch_queue_workset_rows}/${artifact.current_metrics.old_dictionary_candidate_use_single_batch_queue_workset_links}/${artifact.current_metrics.old_dictionary_candidate_use_single_batch_queue_workset_batch_links}/${artifact.current_metrics.old_dictionary_candidate_use_single_batch_queue_workset_source_rids}/${artifact.current_metrics.old_dictionary_candidate_use_single_batch_queue_workset_queue_token_batch_ids}/${artifact.current_metrics.old_dictionary_candidate_use_single_batch_queue_workset_multi_single_cross}/${artifact.current_metrics.old_dictionary_candidate_use_single_batch_queue_workset_max_source_occurrence}/${artifact.current_metrics.old_dictionary_candidate_use_single_batch_queue_workset_ref_occurrences}/${artifact.current_metrics.old_dictionary_candidate_use_single_batch_queue_workset_summaries}/${artifact.current_metrics.old_dictionary_candidate_use_single_batch_queue_workset_citation_required_links}-${artifact.current_metrics.old_dictionary_candidate_use_single_batch_queue_workset_transform_blocked_links}-${artifact.current_metrics.old_dictionary_candidate_use_single_batch_queue_workset_after_prereq_links}-${artifact.current_metrics.old_dictionary_candidate_use_single_batch_queue_workset_existing_packet_links}-${artifact.current_metrics.old_dictionary_candidate_use_single_batch_queue_workset_blocker_links}/${artifact.current_metrics.old_dictionary_candidate_use_single_batch_queue_workset_selection_claims}-${artifact.current_metrics.old_dictionary_candidate_use_single_batch_queue_workset_forbidden_payload_field_hits}-${artifact.current_metrics.old_dictionary_candidate_use_single_batch_queue_workset_acceptance_claims}-${artifact.current_metrics.old_dictionary_candidate_use_single_batch_queue_workset_release_actions}`,
    `- Old-dictionary candidate-use queue partition closure partitions / queues input-cross-single-union / queue overlap-missing-extra / pairs input-cross-single-union / pair overlap-missing-extra / source overlap-union / batch overlap-union / ref-occ / selection-forbidden-acceptance-release hits: ${artifact.current_metrics.old_dictionary_candidate_use_queue_partition_closure_partitions}/${artifact.current_metrics.old_dictionary_candidate_use_queue_partition_closure_queues}/${artifact.current_metrics.old_dictionary_candidate_use_queue_partition_closure_queue_overlap_missing_extra}/${artifact.current_metrics.old_dictionary_candidate_use_queue_partition_closure_pairs}/${artifact.current_metrics.old_dictionary_candidate_use_queue_partition_closure_pair_overlap_missing_extra}/${artifact.current_metrics.old_dictionary_candidate_use_queue_partition_closure_source_overlap_union}/${artifact.current_metrics.old_dictionary_candidate_use_queue_partition_closure_batch_overlap_union}/${artifact.current_metrics.old_dictionary_candidate_use_queue_partition_closure_ref_occurrence}/${artifact.current_metrics.old_dictionary_candidate_use_queue_partition_closure_selection_claims}-${artifact.current_metrics.old_dictionary_candidate_use_queue_partition_closure_forbidden_payload_field_hits}-${artifact.current_metrics.old_dictionary_candidate_use_queue_partition_closure_acceptance_claims}-${artifact.current_metrics.old_dictionary_candidate_use_queue_partition_closure_release_actions}`,
    `- Old-dictionary candidate-use partition overlap diagnostics source rows / source queue-pair counts / source ref-occ / batch rows / batch queue memberships / batch ref-occ / selection-forbidden-acceptance-release hits: ${artifact.current_metrics.old_dictionary_candidate_use_partition_overlap_diagnostic_source_rows}/${artifact.current_metrics.old_dictionary_candidate_use_partition_overlap_diagnostic_source_queue_pair_counts}/${artifact.current_metrics.old_dictionary_candidate_use_partition_overlap_diagnostic_source_ref_occ}/${artifact.current_metrics.old_dictionary_candidate_use_partition_overlap_diagnostic_batch_rows}/${artifact.current_metrics.old_dictionary_candidate_use_partition_overlap_diagnostic_batch_queue_memberships}/${artifact.current_metrics.old_dictionary_candidate_use_partition_overlap_diagnostic_batch_ref_occ}/${artifact.current_metrics.old_dictionary_candidate_use_partition_overlap_diagnostic_selection_claims}-${artifact.current_metrics.old_dictionary_candidate_use_partition_overlap_diagnostic_forbidden_payload_field_hits}-${artifact.current_metrics.old_dictionary_candidate_use_partition_overlap_diagnostic_acceptance_claims}-${artifact.current_metrics.old_dictionary_candidate_use_partition_overlap_diagnostic_release_actions}`,
    `- Old-dictionary candidate-use queue/source dedupe key rows / cross-single / unique-duplicate keys / queue-source-token-batch IDs / diagnostic rows / ref-occ / citation-present-transform-Agent6-blocker / selection-forbidden-acceptance-release hits: ${artifact.current_metrics.old_dictionary_candidate_use_queue_source_dedupe_key_rows}/${artifact.current_metrics.old_dictionary_candidate_use_queue_source_dedupe_key_cross_single}/${artifact.current_metrics.old_dictionary_candidate_use_queue_source_dedupe_key_unique_duplicate}/${artifact.current_metrics.old_dictionary_candidate_use_queue_source_dedupe_key_queue_source_token_batch}/${artifact.current_metrics.old_dictionary_candidate_use_queue_source_dedupe_key_diagnostics}/${artifact.current_metrics.old_dictionary_candidate_use_queue_source_dedupe_key_ref_occurrence}/${artifact.current_metrics.old_dictionary_candidate_use_queue_source_dedupe_key_citation_transform_boundary}/${artifact.current_metrics.old_dictionary_candidate_use_queue_source_dedupe_key_selection_claims}-${artifact.current_metrics.old_dictionary_candidate_use_queue_source_dedupe_key_forbidden_payload_field_hits}-${artifact.current_metrics.old_dictionary_candidate_use_queue_source_dedupe_key_acceptance_claims}-${artifact.current_metrics.old_dictionary_candidate_use_queue_source_dedupe_key_release_actions}`,
    `- Old-dictionary candidate-use source-RID dedupe coverage rows / workset-refs-dedupe-sourceRIDs / missing-extra source-pairs / ref-queue mismatches / source-vs-membership occ / multi-single / diagnostic rows / citation-present-transform-Agent6-blocker / selection-forbidden-acceptance-release hits: ${artifact.current_metrics.old_dictionary_candidate_use_source_rid_dedupe_coverage_rows}/${artifact.current_metrics.old_dictionary_candidate_use_source_rid_dedupe_coverage_source_refs}/${artifact.current_metrics.old_dictionary_candidate_use_source_rid_dedupe_coverage_missing_extra}/${artifact.current_metrics.old_dictionary_candidate_use_source_rid_dedupe_coverage_mismatch}/${artifact.current_metrics.old_dictionary_candidate_use_source_rid_dedupe_coverage_occurrences}/${artifact.current_metrics.old_dictionary_candidate_use_source_rid_dedupe_coverage_multi_single}/${artifact.current_metrics.old_dictionary_candidate_use_source_rid_dedupe_coverage_diagnostics}/${artifact.current_metrics.old_dictionary_candidate_use_source_rid_dedupe_coverage_citation_transform_boundary}/${artifact.current_metrics.old_dictionary_candidate_use_source_rid_dedupe_coverage_selection_claims}-${artifact.current_metrics.old_dictionary_candidate_use_source_rid_dedupe_coverage_forbidden_payload_field_hits}-${artifact.current_metrics.old_dictionary_candidate_use_source_rid_dedupe_coverage_acceptance_claims}-${artifact.current_metrics.old_dictionary_candidate_use_source_rid_dedupe_coverage_release_actions}`,
    `- Old-dictionary candidate-use queue/source subchain handoff entries / artifacts json-report-validator-type-ready / source-refs-queues-pairs / cross-closure / diag-dedupe-coverage / source-vs-membership occ / authority-entry hits / selection-forbidden-acceptance-release hits: ${artifact.current_metrics.old_dictionary_candidate_use_queue_source_subchain_handoff_entries}/${artifact.current_metrics.old_dictionary_candidate_use_queue_source_subchain_handoff_artifacts}/${artifact.current_metrics.old_dictionary_candidate_use_queue_source_subchain_handoff_source_queue_pairs}/${artifact.current_metrics.old_dictionary_candidate_use_queue_source_subchain_handoff_cross_closure}/${artifact.current_metrics.old_dictionary_candidate_use_queue_source_subchain_handoff_diag_dedupe_coverage}/${artifact.current_metrics.old_dictionary_candidate_use_queue_source_subchain_handoff_occurrences}/${artifact.current_metrics.old_dictionary_candidate_use_queue_source_subchain_handoff_entries_with_authority_counters}/${artifact.current_metrics.old_dictionary_candidate_use_queue_source_subchain_handoff_selection_claims}-${artifact.current_metrics.old_dictionary_candidate_use_queue_source_subchain_handoff_forbidden_payload_field_hits}-${artifact.current_metrics.old_dictionary_candidate_use_queue_source_subchain_handoff_acceptance_claims}-${artifact.current_metrics.old_dictionary_candidate_use_queue_source_subchain_handoff_release_actions}`,
    `- Old-dictionary candidate-use queue/source boundary blocker rows / inputs dedupe-coverage-handoff / keys unique-dupe-source-queue / summaries partition-signature-exact / cross-single / flags citation-present-transform-Agent6-familyblocker-packet / diagnostics source-batch-both / ref-occ-sourceocc / selection-forbidden-acceptance-release hits: ${artifact.current_metrics.old_dictionary_candidate_use_queue_source_boundary_blocker_rows}/${artifact.current_metrics.old_dictionary_candidate_use_queue_source_boundary_blocker_inputs}/${artifact.current_metrics.old_dictionary_candidate_use_queue_source_boundary_blocker_keys}/${artifact.current_metrics.old_dictionary_candidate_use_queue_source_boundary_blocker_summary_rows}/${artifact.current_metrics.old_dictionary_candidate_use_queue_source_boundary_blocker_cross_single}/${artifact.current_metrics.old_dictionary_candidate_use_queue_source_boundary_blocker_flags}/${artifact.current_metrics.old_dictionary_candidate_use_queue_source_boundary_blocker_diagnostics}/${artifact.current_metrics.old_dictionary_candidate_use_queue_source_boundary_blocker_ref_occ}/${artifact.current_metrics.old_dictionary_candidate_use_queue_source_boundary_blocker_selection_claims}-${artifact.current_metrics.old_dictionary_candidate_use_queue_source_boundary_blocker_forbidden_payload_field_hits}-${artifact.current_metrics.old_dictionary_candidate_use_queue_source_boundary_blocker_acceptance_claims}-${artifact.current_metrics.old_dictionary_candidate_use_queue_source_boundary_blocker_release_actions}`,
    `- Old-dictionary candidate-use queue/source candidate-row bridge rows / occurrences / linked-outside rows / linked-outside occurrences / blockers-pairs-sourceRIDs-membershipOcc / sourceRID exact-missing-extra-outside / queue gaps candidate-source / diagnostics bridge-source-batch-linksource-linkbatch / selection-forbidden-acceptance-release hits: ${artifact.current_metrics.old_dictionary_candidate_use_queue_source_candidate_row_bridge_rows}/${artifact.current_metrics.old_dictionary_candidate_use_queue_source_candidate_row_bridge_occurrences}/${artifact.current_metrics.old_dictionary_candidate_use_queue_source_candidate_row_bridge_linked_outside}/${artifact.current_metrics.old_dictionary_candidate_use_queue_source_candidate_row_bridge_linked_outside_occurrences}/${artifact.current_metrics.old_dictionary_candidate_use_queue_source_candidate_row_bridge_linked_pairs_source_occ}/${artifact.current_metrics.old_dictionary_candidate_use_queue_source_candidate_row_bridge_source_rid_status}/${artifact.current_metrics.old_dictionary_candidate_use_queue_source_candidate_row_bridge_queue_gaps}/${artifact.current_metrics.old_dictionary_candidate_use_queue_source_candidate_row_bridge_diagnostics}/${artifact.current_metrics.old_dictionary_candidate_use_queue_source_candidate_row_bridge_selection_claims}-${artifact.current_metrics.old_dictionary_candidate_use_queue_source_candidate_row_bridge_forbidden_payload_field_hits}-${artifact.current_metrics.old_dictionary_candidate_use_queue_source_candidate_row_bridge_acceptance_claims}-${artifact.current_metrics.old_dictionary_candidate_use_queue_source_candidate_row_bridge_release_actions}`,
    `- Old-dictionary candidate-use queue/source bridge gap workset rows / occurrences / outside-linkedmissing-linkedextra rows / outside-linkedmissing-linkedextra occurrences / sourceRID refs total-outside-linked-extra / carried blockers-pairs-sourceRIDs-membershipOcc-currentblockers / selection-forbidden-acceptance-release hits: ${artifact.current_metrics.old_dictionary_candidate_use_queue_source_bridge_gap_workset_rows}/${artifact.current_metrics.old_dictionary_candidate_use_queue_source_bridge_gap_workset_occurrences}/${artifact.current_metrics.old_dictionary_candidate_use_queue_source_bridge_gap_workset_outside_linked}/${artifact.current_metrics.old_dictionary_candidate_use_queue_source_bridge_gap_workset_outside_linked_occurrences}/${artifact.current_metrics.old_dictionary_candidate_use_queue_source_bridge_gap_workset_source_rid_refs}/${artifact.current_metrics.old_dictionary_candidate_use_queue_source_bridge_gap_workset_carried_forward}/${artifact.current_metrics.old_dictionary_candidate_use_queue_source_bridge_gap_workset_selection_claims}-${artifact.current_metrics.old_dictionary_candidate_use_queue_source_bridge_gap_workset_forbidden_payload_field_hits}-${artifact.current_metrics.old_dictionary_candidate_use_queue_source_bridge_gap_workset_acceptance_claims}-${artifact.current_metrics.old_dictionary_candidate_use_queue_source_bridge_gap_workset_release_actions}`,
    `- Old-dictionary candidate-use bridge-gap source-RID blocker crossmatch rows / refs-occ / blocker-present-missing-coverage-present-missing / queues-tokens-prefixes / blocker refs-occ-currentblockers / citation-transform-Agent6 blocker flags / selection-forbidden-acceptance-release hits: ${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_source_rid_blocker_crossmatch_rows}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_source_rid_blocker_crossmatch_refs_occ}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_source_rid_blocker_crossmatch_blocker_coverage}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_source_rid_blocker_crossmatch_queue_prefix}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_source_rid_blocker_crossmatch_blocker_totals}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_source_rid_blocker_crossmatch_blocker_flags}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_source_rid_blocker_crossmatch_selection_claims}-${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_source_rid_blocker_crossmatch_forbidden_payload_field_hits}-${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_source_rid_blocker_crossmatch_acceptance_claims}-${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_source_rid_blocker_crossmatch_release_actions}`,
    `- Old-dictionary candidate-use bridge-gap source-RID prereq route crossmatch rows / refs-occ / A06direct-both-missing / A06direct occ / blocker-coverage-prereqblockers-sourceblockers / citation-transform-boundary-route-candidate-public flags / selection-forbidden-acceptance-release hits: ${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_source_rid_prereq_route_crossmatch_rows}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_source_rid_prereq_route_crossmatch_refs_occ}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_source_rid_prereq_route_crossmatch_a06_direct}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_source_rid_prereq_route_crossmatch_a06_direct_occ}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_source_rid_prereq_route_crossmatch_blockers}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_source_rid_prereq_route_crossmatch_flags}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_source_rid_prereq_route_crossmatch_selection_claims}-${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_source_rid_prereq_route_crossmatch_forbidden_payload_field_hits}-${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_source_rid_prereq_route_crossmatch_acceptance_claims}-${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_source_rid_prereq_route_crossmatch_release_actions}`,
    `- Old-dictionary candidate-use bridge-gap candidate prereq closure rows / occ-sourceRIDrefs / A06direct-mixed-missing / A06direct occ / blocker-coverage-currentblockers / citation-transform-boundary-A07-A06-A06approval flags / selection-forbidden-acceptance-release hits: ${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_candidate_prereq_closure_rows}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_candidate_prereq_closure_occ_refs}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_candidate_prereq_closure_a06_direct}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_candidate_prereq_closure_a06_direct_occ}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_candidate_prereq_closure_blockers}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_candidate_prereq_closure_flags}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_candidate_prereq_closure_selection_claims}-${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_candidate_prereq_closure_forbidden_payload_field_hits}-${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_candidate_prereq_closure_acceptance_claims}-${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_candidate_prereq_closure_release_actions}`,
    `- Old-dictionary candidate-use bridge-gap A07/A06 route overlay rows / occ-links-sourceRIDs / direct-A06-mixed rows / direct-A06-missing links / citation-present-transform-blocker-coverage / A07-A06-A06approval-donotask / evidence-preserve-redo-blockers / selection-forbidden-acceptance-release hits: ${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_a07_a06_route_overlay_rows}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_a07_a06_route_overlay_occ_links}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_a07_a06_route_overlay_worksets}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_a07_a06_route_overlay_link_routes}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_a07_a06_route_overlay_prereq_blockers}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_a07_a06_route_overlay_route_law}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_a07_a06_route_overlay_preservation_flags}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_a07_a06_route_overlay_selection_claims}-${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_a07_a06_route_overlay_forbidden_payload_field_hits}-${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_a07_a06_route_overlay_acceptance_claims}-${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_a07_a06_route_overlay_release_actions}`,
    `- Old-dictionary candidate-use bridge-gap downstream intake coverage rows / occ-links / inputs direct-valid-A10source-A10preboundary-A10verdict / direct rows-matched-missing-citation-transform / A06 rows-consumed-missing-links / broad source-preboundary-rowlevelsource-rowlevelpreboundary-Agent3null / route correction-A07-A06-A06approval-donotask / selection-forbidden-acceptance-release hits: ${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_downstream_intake_coverage_rows}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_downstream_intake_coverage_occ_links}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_downstream_intake_coverage_inputs}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_downstream_intake_coverage_direct}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_downstream_intake_coverage_a06}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_downstream_intake_coverage_broad_rowlevel}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_downstream_intake_coverage_route_law}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_downstream_intake_coverage_selection_claims}-${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_downstream_intake_coverage_forbidden_payload_field_hits}-${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_downstream_intake_coverage_acceptance_claims}-${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_downstream_intake_coverage_release_actions}`,
    `- Old-dictionary candidate-use bridge-gap A06 row-level downstream blocker rows / occ-links-sourceRIDs / queue-token-lexicon-prefixes / missing-broadsource-broadpreboundary-rowlevelsource-rowlevelpreboundary / citation-present-transform-notauthorized / A07-A06-A06approval-evidence-donotask / selection-forbidden-acceptance-release hits: ${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_a06_row_level_downstream_blocker_rows}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_a06_row_level_downstream_blocker_occ_links}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_a06_row_level_downstream_blocker_ids}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_a06_row_level_downstream_blocker_context}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_a06_row_level_downstream_blocker_prereqs}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_a06_row_level_downstream_blocker_route_law}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_a06_row_level_downstream_blocker_selection_claims}-${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_a06_row_level_downstream_blocker_forbidden_payload_field_hits}-${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_a06_row_level_downstream_blocker_acceptance_claims}-${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_a06_row_level_downstream_blocker_release_actions}`,
    `- Old-dictionary candidate-use bridge-gap direct source-citation blocker rows / occ-links-sourceRIDs / queue-token-lexicon-prefixes / agent2 matched-queue-valid / citation-present-directpresent-transform-directtransform / broad source-preboundary-rowlevelsource-rowlevelpreboundary / A07-A06-A06approval-evidence-donotask / selection-forbidden-acceptance-release hits: ${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_direct_source_citation_blocker_rows}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_direct_source_citation_blocker_occ_links}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_direct_source_citation_blocker_ids}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_direct_source_citation_blocker_contract}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_direct_source_citation_blocker_prereqs}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_direct_source_citation_blocker_context}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_direct_source_citation_blocker_route_law}/${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_direct_source_citation_blocker_selection_claims}-${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_direct_source_citation_blocker_forbidden_payload_field_hits}-${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_direct_source_citation_blocker_acceptance_claims}-${artifact.current_metrics.old_dictionary_candidate_use_bridge_gap_direct_source_citation_blocker_release_actions}`,
    `- Proof rows / complete metadata: ${artifact.current_metrics.proof_occurrence_rows}/${artifact.current_metrics.proof_rows_with_complete_metadata}`,
    `- Hebrew context / mojibake rows: ${artifact.current_metrics.proof_rows_with_hebrew_context}/${artifact.current_metrics.proof_mojibake_rows}`,
    `- Reader-facing / route-payload / forbidden-authority hits: ${artifact.current_metrics.reader_facing_rows}/${artifact.current_metrics.route_payload_field_hits}/${artifact.current_metrics.forbidden_authority_field_hits}`,
    `- Queue required fields: ${artifact.current_metrics.queue_required_fields_present}/${artifact.current_metrics.queue_required_fields}`,
    `- Smoke steps / failed: ${artifact.current_metrics.smoke_steps}/${artifact.current_metrics.smoke_failed_steps}`,
    `- Source freshness: ${artifact.current_metrics.smoke_source_freshness_status}, pending ${artifact.current_metrics.smoke_source_freshness_pending_files}`,
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${mdCell(checkRow.id)} | ${checkRow.status} | ${mdCell(checkRow.detail)} |`),
    '',
    '## Known Risks',
    '',
    ...artifact.known_risks.map((risk) => `- ${risk}`),
    '',
    '## Boundary',
    '',
    'Agent 3 output remains usage navigation and occurrence-link evidence only. This state file is not Definition authority, not semantic arbitration, not route ranking, not HUD or Workbench UI acceptance, not publication support, not accepted translation text, and not Agent 6 acceptance.',
  ];
  writeText(relativePath, appendPreservedReportSections(relativePath, `${lines.join('\n')}\n`));
}

function completeProofRows(packet) {
  const required = [
    'proof_rows_with_source',
    'proof_rows_with_work_anchor',
    'proof_rows_with_context',
    'proof_rows_with_license',
    'proof_rows_with_version',
    'proof_rows_with_route_ids',
  ];
  return Math.min(...required.map((key) => Number(packet.counts?.[key] || 0)));
}

function completeOccurrenceLinkRows() {
  const required = [
    'rows_with_source_link',
    'rows_with_work_anchor',
    'rows_with_license',
    'rows_with_version',
    'rows_with_route_ids',
  ];
  return Math.min(...required.map((key) => Number(usageOccurrenceLinks.counts?.[key] || 0)));
}

function check(id, status, detail) {
  return { id, status, detail };
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

function appendPreservedReportSections(relativePath, baseText) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) return baseText;
  const currentText = fs.readFileSync(fullPath, 'utf8');
  const sections = preservedReportSections
    .map(([startMarker, endMarker]) => extractMarkedSection(currentText, startMarker, endMarker))
    .filter(Boolean);
  if (sections.length === 0) return baseText;
  return `${baseText.trimEnd()}\n\n${sections.join('\n\n')}\n`;
}

function extractMarkedSection(text, startMarker, endMarker) {
  const start = text.indexOf(startMarker);
  const end = text.indexOf(endMarker);
  if (start === -1 || end === -1 || end < start) return null;
  return text.slice(start, end + endMarker.length).trim();
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--agent-registry=')) parsed.agentRegistry = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--goal-board=')) parsed.goalBoard = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--queue-ready-packet=')) parsed.queueReadyPacket = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--usage-agent6-packet=')) parsed.usageAgent6Packet = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--usage-occurrence-links=')) parsed.usageOccurrenceLinks = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--usage-route-resolution=')) parsed.usageRouteResolution = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--usage-crossmatch-neighbors=')) parsed.usageCrossmatchNeighbors = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--usage-source-ref-buckets=')) parsed.usageSourceRefBuckets = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--usage-work-buckets=')) parsed.usageWorkBuckets = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--usage-provenance-buckets=')) parsed.usageProvenanceBuckets = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--usage-occurrence-detail-index=')) parsed.usageOccurrenceDetailIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--usage-facet-index=')) parsed.usageFacetIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--usage-context-token-index=')) parsed.usageContextTokenIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--usage-context-token-links=')) parsed.usageContextTokenLinks = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--usage-context-token-occurrence-index=')) parsed.usageContextTokenOccurrenceIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--usage-occurrence-context-profile=')) parsed.usageOccurrenceContextProfile = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--usage-route-diversity-probe=')) parsed.usageRouteDiversityProbe = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--usage-route-concentration-guardrail=')) parsed.usageRouteConcentrationGuardrail = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--usage-route-pointer-audit=')) parsed.usageRoutePointerAudit = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--usage-sample-gap-audit=')) parsed.usageSampleGapAudit = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--usage-consumer-manifest=')) parsed.usageConsumerManifest = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--usage-occurrence-support-packet=')) parsed.usageOccurrenceSupportPacket = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--usage-concordance-navigation-packet=')) parsed.usageConcordanceNavigationPacket = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--usage-freshness-impact-packet=')) parsed.usageFreshnessImpactPacket = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--crossmatch-inventory-packet=')) parsed.crossmatchInventoryPacket = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--orot-route-selection-crossmatch-matrix=')) parsed.orotRouteSelectionCrossmatchMatrix = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--post-route-selection-wake-audit=')) parsed.postRouteSelectionWakeAudit = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--old-dictionary-candidate-use-source-family-blocker-matrix=')) parsed.oldDictionaryCandidateUseSourceFamilyBlockerMatrix = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--old-dictionary-candidate-use-source-rid-continuity-crossmatch=')) parsed.oldDictionaryCandidateUseSourceRidContinuityCrossmatch = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--old-dictionary-candidate-use-exact-subset-crossmatch=')) parsed.oldDictionaryCandidateUseExactSubsetCrossmatch = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--old-dictionary-candidate-use-boundary-triage-navigation=')) parsed.oldDictionaryCandidateUseBoundaryTriageNavigation = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--old-dictionary-pure-commercial-candidate-use-boundary-workset=')) parsed.oldDictionaryPureCommercialCandidateUseBoundaryWorkset = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--old-dictionary-overlap-candidate-use-boundary-workset=')) parsed.oldDictionaryOverlapCandidateUseBoundaryWorkset = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--old-dictionary-candidate-use-split-closure-crossmatch=')) parsed.oldDictionaryCandidateUseSplitClosureCrossmatch = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--old-dictionary-candidate-use-handoff-index=')) parsed.oldDictionaryCandidateUseHandoffIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--old-dictionary-candidate-use-row-lineage-matrix=')) parsed.oldDictionaryCandidateUseRowLineageMatrix = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--old-dictionary-candidate-use-boundary-chain-crossmatch=')) parsed.oldDictionaryCandidateUseBoundaryChainCrossmatch = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--old-dictionary-candidate-use-source-citation-dependency-crossmatch=')) parsed.oldDictionaryCandidateUseSourceCitationDependencyCrossmatch = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--old-dictionary-candidate-use-agent1-route-recheck-crossmatch=')) parsed.oldDictionaryCandidateUseAgent1RouteRecheckCrossmatch = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--old-dictionary-candidate-use-gate-proof-coverage-crossmatch=')) parsed.oldDictionaryCandidateUseGateProofCoverageCrossmatch = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--old-dictionary-candidate-use-current-blocker-index=')) parsed.oldDictionaryCandidateUseCurrentBlockerIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--old-dictionary-candidate-use-row-blocker-matrix=')) parsed.oldDictionaryCandidateUseRowBlockerMatrix = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--old-dictionary-candidate-use-source-rid-blocker-matrix=')) parsed.oldDictionaryCandidateUseSourceRidBlockerMatrix = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--old-dictionary-candidate-use-source-citation-enrichment-worklist=')) parsed.oldDictionaryCandidateUseSourceCitationEnrichmentWorklist = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--old-dictionary-candidate-use-source-citation-batch-matrix=')) parsed.oldDictionaryCandidateUseSourceCitationBatchMatrix = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--old-dictionary-candidate-use-source-citation-prefix-matrix=')) parsed.oldDictionaryCandidateUseSourceCitationPrefixMatrix = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--old-dictionary-candidate-use-agent6-source-family-boundary-prereq-matrix=')) parsed.oldDictionaryCandidateUseAgent6SourceFamilyBoundaryPrereqMatrix = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--old-dictionary-candidate-use-direct-source-citation-prereq-matrix=')) parsed.oldDictionaryCandidateUseDirectSourceCitationPrereqMatrix = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--old-dictionary-candidate-use-source-family-selection-exclusion-inventory=')) parsed.oldDictionaryCandidateUseSourceFamilySelectionExclusionInventory = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--old-dictionary-candidate-use-unpacketized-source-family-selection-workset=')) parsed.oldDictionaryCandidateUseUnpacketizedSourceFamilySelectionWorkset = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--old-dictionary-candidate-use-source-family-selection-batch-plan=')) parsed.oldDictionaryCandidateUseSourceFamilySelectionBatchPlan = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--old-dictionary-candidate-use-source-family-selection-queue-batch-crossmatch=')) parsed.oldDictionaryCandidateUseSourceFamilySelectionQueueBatchCrossmatch = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--old-dictionary-candidate-use-cross-batch-queue-guard=')) parsed.oldDictionaryCandidateUseCrossBatchQueueGuard = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--old-dictionary-candidate-use-single-batch-queue-workset=')) parsed.oldDictionaryCandidateUseSingleBatchQueueWorkset = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--old-dictionary-candidate-use-queue-partition-closure=')) parsed.oldDictionaryCandidateUseQueuePartitionClosure = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--old-dictionary-candidate-use-partition-overlap-diagnostic-index=')) parsed.oldDictionaryCandidateUsePartitionOverlapDiagnosticIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--old-dictionary-candidate-use-queue-source-dedupe-key-index=')) parsed.oldDictionaryCandidateUseQueueSourceDedupeKeyIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--old-dictionary-candidate-use-source-rid-dedupe-coverage-crossmatch=')) parsed.oldDictionaryCandidateUseSourceRidDedupeCoverageCrossmatch = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--old-dictionary-candidate-use-queue-source-subchain-handoff-index=')) parsed.oldDictionaryCandidateUseQueueSourceSubchainHandoffIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--old-dictionary-candidate-use-queue-source-boundary-blocker-matrix=')) parsed.oldDictionaryCandidateUseQueueSourceBoundaryBlockerMatrix = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--old-dictionary-candidate-use-queue-source-candidate-row-bridge=')) parsed.oldDictionaryCandidateUseQueueSourceCandidateRowBridge = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--old-dictionary-candidate-use-queue-source-bridge-gap-workset=')) parsed.oldDictionaryCandidateUseQueueSourceBridgeGapWorkset = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--old-dictionary-candidate-use-bridge-gap-source-rid-blocker-crossmatch=')) parsed.oldDictionaryCandidateUseBridgeGapSourceRidBlockerCrossmatch = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--old-dictionary-candidate-use-bridge-gap-source-rid-prereq-route-crossmatch=')) parsed.oldDictionaryCandidateUseBridgeGapSourceRidPrereqRouteCrossmatch = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--old-dictionary-candidate-use-bridge-gap-candidate-prereq-closure-matrix=')) parsed.oldDictionaryCandidateUseBridgeGapCandidatePrereqClosureMatrix = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--smoke-validation=')) parsed.smokeValidation = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--usage-concordance=')) parsed.usageConcordance = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--usage-handoff-index=')) parsed.usageHandoffIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--public-handoff-index=')) parsed.publicHandoffIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function valueAfterEquals(arg) {
  return arg.slice(arg.indexOf('=') + 1);
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}

function readJson(relativePath) {
  return JSON.parse(stripJsonBom(fs.readFileSync(path.join(root, relativePath), 'utf8')));
}

function stripJsonBom(text) {
  return text.replace(/^\uFEFF/, '');
}

function writeJson(relativePath, data) {
  writeText(relativePath, `${JSON.stringify(data, null, 2)}\n`);
}

function writeText(relativePath, text) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, text, 'utf8');
}
