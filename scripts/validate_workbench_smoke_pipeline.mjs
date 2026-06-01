#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const defaults = {
  targetQueue: '.local-cache/workbench-evidence/smoke-target-queue.json',
  fullDir: '.local-cache/workbench-evidence/full',
  handoffRoot: '.local-cache/workbench-evidence/handoff',
  evidenceDir: '.local-cache/workbench-evidence/handoff,data/workbench-evidence',
  output: '.local-cache/workbench-evidence/smoke-pipeline-validation.json',
  report: 'reports/workbench-smoke-pipeline-validation.md',
  scratchDir: '.local-cache/workbench-evidence/smoke-pipeline-validation',
};

const options = parseArgs(process.argv.slice(2));
const steps = [];
const generatedAt = new Date().toISOString();
fs.mkdirSync(path.join(root, options.scratchDir), { recursive: true });

await runStep('validate_smoke_queue', [
  'scripts/validate_workbench_smoke_targets.mjs',
  options.targetQueue,
]);

const coverageJson = `${options.scratchDir}/reshit-smoke-coverage.json`;
const sourceFreshnessJson = `${options.scratchDir}/source-freshness.json`;
await runStep('report_source_freshness', [
  'scripts/report_workbench_source_freshness.mjs',
  `--output=${sourceFreshnessJson}`,
  `--report=${options.scratchDir}/source-freshness.md`,
]);

await runStep('validate_source_freshness', [
  'scripts/validate_workbench_source_freshness.mjs',
  sourceFreshnessJson,
]);

await runStep('report_reshit_smoke_coverage', [
  'scripts/report_reshit_smoke_coverage.mjs',
  `--target-queue=${options.targetQueue}`,
  `--output=${coverageJson}`,
  `--report=${options.scratchDir}/reshit-smoke-coverage.md`,
  '--fail-on-uncovered',
]);

const smokeCountsJson = `${options.scratchDir}/reshit-smoke-counts.json`;
await runStep('report_workbench_smoke_counts', [
  'scripts/report_workbench_smoke_counts.mjs',
  `--target-queue=${options.targetQueue}`,
  `--full-dir=${options.fullDir}`,
  `--output=${smokeCountsJson}`,
  `--report=${options.scratchDir}/reshit-smoke-counts.md`,
]);

const handoffIndexJson = `${options.scratchDir}/handoff-index-smoke-complete.json`;
await runStep('build_complete_handoff_index', [
  'scripts/build_workbench_handoff_index.mjs',
  `--evidence-dir=${options.evidenceDir}`,
  `--target-queue=${options.targetQueue}`,
  '--include-smoke',
  '--require-target-queue-complete',
  `--output=${handoffIndexJson}`,
  `--report=${options.scratchDir}/handoff-index-smoke-complete.md`,
]);

await runStep('validate_complete_handoff_index', [
  'scripts/validate_workbench_handoff_index.mjs',
  handoffIndexJson,
]);

const publicHandoffIndexJson = `${options.scratchDir}/public-handoff-index.json`;
await runStep('build_public_handoff_index', [
  'scripts/build_workbench_public_handoff_index.mjs',
  `--target-queue=${options.targetQueue}`,
  `--handoff-root=${options.handoffRoot}`,
  `--source-freshness=${sourceFreshnessJson}`,
  `--output=${publicHandoffIndexJson}`,
  `--report=${options.scratchDir}/public-handoff-index.md`,
]);

await runStep('validate_public_handoff_index', [
  'scripts/validate_workbench_public_handoff_index.mjs',
  publicHandoffIndexJson,
]);

const usageConcordanceJson = `${options.scratchDir}/usage-concordance.json`;
const usageConcordanceManifestJson = `${options.scratchDir}/usage-concordance-manifest.json`;
await runStep('build_usage_concordance', [
  'scripts/build_workbench_usage_concordance.mjs',
  `--index=${publicHandoffIndexJson}`,
  `--output=${usageConcordanceJson}`,
  `--report=${options.scratchDir}/usage-concordance.md`,
  `--manifest=${usageConcordanceManifestJson}`,
]);

await runStep('validate_usage_concordance', [
  'scripts/validate_workbench_usage_concordance.mjs',
  usageConcordanceJson,
  `--manifest=${usageConcordanceManifestJson}`,
]);

const usageClusterIndexJson = `${options.scratchDir}/usage-cluster-index.json`;
await runStep('build_usage_cluster_index', [
  'scripts/build_workbench_usage_cluster_index.mjs',
  `--concordance=${usageConcordanceJson}`,
  `--output=${usageClusterIndexJson}`,
  `--report=${options.scratchDir}/usage-cluster-index.md`,
  '--max-samples=6',
]);

await runStep('validate_usage_cluster_index', [
  'scripts/validate_workbench_usage_cluster_index.mjs',
  usageClusterIndexJson,
]);

const usageRouteCoverageJson = `${options.scratchDir}/usage-route-coverage.json`;
await runStep('build_usage_route_coverage', [
  'scripts/build_workbench_usage_route_coverage.mjs',
  `--concordance=${usageConcordanceJson}`,
  `--output=${usageRouteCoverageJson}`,
  `--report=${options.scratchDir}/usage-route-coverage.md`,
  '--max-samples=6',
]);

await runStep('validate_usage_route_coverage', [
  'scripts/validate_workbench_usage_route_coverage.mjs',
  usageRouteCoverageJson,
]);

const usageSampleIndexJson = `${options.scratchDir}/usage-sample-index.json`;
await runStep('build_usage_sample_index', [
  'scripts/build_workbench_usage_sample_index.mjs',
  `--concordance=${usageConcordanceJson}`,
  `--output=${usageSampleIndexJson}`,
  `--report=${options.scratchDir}/usage-sample-index.md`,
  '--max-samples-per-status=4',
]);

await runStep('validate_usage_sample_index', [
  'scripts/validate_workbench_usage_sample_index.mjs',
  usageSampleIndexJson,
]);

const usageLookupIndexJson = `${options.scratchDir}/usage-lookup-index.json`;
await runStep('build_usage_lookup_index', [
  'scripts/build_workbench_usage_lookup_index.mjs',
  `--concordance=${usageConcordanceJson}`,
  `--output=${usageLookupIndexJson}`,
  `--report=${options.scratchDir}/usage-lookup-index.md`,
  '--max-works=20',
]);

await runStep('validate_usage_lookup_index', [
  'scripts/validate_workbench_usage_lookup_index.mjs',
  usageLookupIndexJson,
]);

const usageWorkFrameMatrixJson = `${options.scratchDir}/usage-work-frame-matrix.json`;
await runStep('build_usage_work_frame_matrix', [
  'scripts/build_workbench_usage_work_frame_matrix.mjs',
  `--concordance=${usageConcordanceJson}`,
  `--output=${usageWorkFrameMatrixJson}`,
  `--report=${options.scratchDir}/usage-work-frame-matrix.md`,
]);

await runStep('validate_usage_work_frame_matrix', [
  'scripts/validate_workbench_usage_work_frame_matrix.mjs',
  usageWorkFrameMatrixJson,
]);

const usageSearchRowsJson = `${options.scratchDir}/usage-search-rows.json`;
await runStep('build_usage_search_rows', [
  'scripts/build_workbench_usage_search_rows.mjs',
  `--concordance=${usageConcordanceJson}`,
  `--output=${usageSearchRowsJson}`,
  `--report=${options.scratchDir}/usage-search-rows.md`,
]);

await runStep('validate_usage_search_rows', [
  'scripts/validate_workbench_usage_search_rows.mjs',
  usageSearchRowsJson,
]);

const usageProvenanceIndexJson = `${options.scratchDir}/usage-provenance-index.json`;
await runStep('build_usage_provenance_index', [
  'scripts/build_workbench_usage_provenance_index.mjs',
  `--search-rows=${usageSearchRowsJson}`,
  `--output=${usageProvenanceIndexJson}`,
  `--report=${options.scratchDir}/usage-provenance-index.md`,
]);

await runStep('validate_usage_provenance_index', [
  'scripts/validate_workbench_usage_provenance_index.mjs',
  usageProvenanceIndexJson,
]);

const usageSearchShardIndexJson = `${options.scratchDir}/usage-search-shard-index.json`;
await runStep('build_usage_search_shard_index', [
  'scripts/build_workbench_usage_search_shard_index.mjs',
  `--search-rows=${usageSearchRowsJson}`,
  `--output=${usageSearchShardIndexJson}`,
  `--report=${options.scratchDir}/usage-search-shard-index.md`,
]);

await runStep('validate_usage_search_shard_index', [
  'scripts/validate_workbench_usage_search_shard_index.mjs',
  usageSearchShardIndexJson,
]);

const usageRefreshPriorityIndexJson = `${options.scratchDir}/usage-refresh-priority-index.json`;
await runStep('build_usage_refresh_priority_index', [
  'scripts/build_workbench_usage_refresh_priority_index.mjs',
  `--source-freshness=${sourceFreshnessJson}`,
  `--search-rows=${usageSearchRowsJson}`,
  `--output=${usageRefreshPriorityIndexJson}`,
  `--report=${options.scratchDir}/usage-refresh-priority-index.md`,
]);

await runStep('validate_usage_refresh_priority_index', [
  'scripts/validate_workbench_usage_refresh_priority_index.mjs',
  usageRefreshPriorityIndexJson,
]);

const usageUnitDensityIndexJson = `${options.scratchDir}/usage-unit-density-index.json`;
await runStep('build_usage_unit_density_index', [
  'scripts/build_workbench_usage_unit_density_index.mjs',
  `--search-rows=${usageSearchRowsJson}`,
  `--output=${usageUnitDensityIndexJson}`,
  `--report=${options.scratchDir}/usage-unit-density-index.md`,
]);

await runStep('validate_usage_unit_density_index', [
  'scripts/validate_workbench_usage_unit_density_index.mjs',
  usageUnitDensityIndexJson,
]);

const usagePhraseRecurrenceIndexJson = `${options.scratchDir}/usage-phrase-recurrence-index.json`;
await runStep('build_usage_phrase_recurrence_index', [
  'scripts/build_workbench_usage_phrase_recurrence_index.mjs',
  `--search-rows=${usageSearchRowsJson}`,
  `--output=${usagePhraseRecurrenceIndexJson}`,
  `--report=${options.scratchDir}/usage-phrase-recurrence-index.md`,
]);

await runStep('validate_usage_phrase_recurrence_index', [
  'scripts/validate_workbench_usage_phrase_recurrence_index.mjs',
  usagePhraseRecurrenceIndexJson,
]);

const usageContextOffsetIndexJson = `${options.scratchDir}/usage-context-offset-index.json`;
await runStep('build_usage_context_offset_index', [
  'scripts/build_workbench_usage_context_offset_index.mjs',
  `--search-rows=${usageSearchRowsJson}`,
  `--output=${usageContextOffsetIndexJson}`,
  `--report=${options.scratchDir}/usage-context-offset-index.md`,
]);

await runStep('validate_usage_context_offset_index', [
  'scripts/validate_workbench_usage_context_offset_index.mjs',
  usageContextOffsetIndexJson,
]);

const usageContextSignatureIndexJson = `${options.scratchDir}/usage-context-signature-index.json`;
await runStep('build_usage_context_signature_index', [
  'scripts/build_workbench_usage_context_signature_index.mjs',
  `--search-rows=${usageSearchRowsJson}`,
  `--output=${usageContextSignatureIndexJson}`,
  `--report=${options.scratchDir}/usage-context-signature-index.md`,
]);

await runStep('validate_usage_context_signature_index', [
  'scripts/validate_workbench_usage_context_signature_index.mjs',
  usageContextSignatureIndexJson,
]);

const usageContextSignatureLookupJson = `${options.scratchDir}/usage-context-signature-lookup.json`;
await runStep('build_usage_context_signature_lookup', [
  'scripts/build_workbench_usage_context_signature_lookup.mjs',
  `--search-rows=${usageSearchRowsJson}`,
  `--context-signature-index=${usageContextSignatureIndexJson}`,
  `--output=${usageContextSignatureLookupJson}`,
  `--report=${options.scratchDir}/usage-context-signature-lookup.md`,
]);

await runStep('validate_usage_context_signature_lookup', [
  'scripts/validate_workbench_usage_context_signature_lookup.mjs',
  usageContextSignatureLookupJson,
]);

const usageContextSignatureContrastJson = `${options.scratchDir}/usage-context-signature-contrast.json`;
await runStep('build_usage_context_signature_contrast', [
  'scripts/build_workbench_usage_context_signature_contrast.mjs',
  `--search-rows=${usageSearchRowsJson}`,
  `--context-signature-index=${usageContextSignatureIndexJson}`,
  `--output=${usageContextSignatureContrastJson}`,
  `--report=${options.scratchDir}/usage-context-signature-contrast.md`,
]);

await runStep('validate_usage_context_signature_contrast', [
  'scripts/validate_workbench_usage_context_signature_contrast.mjs',
  usageContextSignatureContrastJson,
]);

const usageSelectedSliceJson = `${options.scratchDir}/usage-slice-tanakh.json`;
await runStep('build_usage_selected_slice', [
  'scripts/build_workbench_usage_slice_index.mjs',
  `--concordance=${usageConcordanceJson}`,
  '--work-prefix=tanakh/',
  '--slice-id=tanakh-workbench-section',
  '--label=Tanakh workbench section',
  `--output=${usageSelectedSliceJson}`,
  `--report=${options.scratchDir}/usage-slice-tanakh.md`,
  '--max-samples=30',
]);

await runStep('validate_usage_selected_slice', [
  'scripts/validate_workbench_usage_slice_index.mjs',
  usageSelectedSliceJson,
]);

const usageJeremiahSliceJson = `${options.scratchDir}/usage-slice-jeremiah.json`;
await runStep('build_usage_selected_slice_jeremiah', [
  'scripts/build_workbench_usage_slice_index.mjs',
  `--concordance=${usageConcordanceJson}`,
  '--source-ref-prefix=Jeremiah',
  '--slice-id=jeremiah-workbench-section',
  '--label=Jeremiah workbench section',
  `--output=${usageJeremiahSliceJson}`,
  `--report=${options.scratchDir}/usage-slice-jeremiah.md`,
  '--max-samples=30',
]);

await runStep('validate_usage_selected_slice_jeremiah', [
  'scripts/validate_workbench_usage_slice_index.mjs',
  usageJeremiahSliceJson,
]);

const usageSelectedSlicesIndexJson = `${options.scratchDir}/usage-selected-slices-index.json`;
await runStep('build_usage_selected_slices_index', [
  'scripts/build_workbench_usage_selected_slices_index.mjs',
  `--slices-dir=${options.scratchDir}`,
  `--output=${usageSelectedSlicesIndexJson}`,
  `--report=${options.scratchDir}/usage-selected-slices-index.md`,
]);

await runStep('validate_usage_selected_slices_index', [
  'scripts/validate_workbench_usage_selected_slices_index.mjs',
  usageSelectedSlicesIndexJson,
]);

const usageSelectedOccurrencesJson = `${options.scratchDir}/usage-selected-occurrences.json`;
await runStep('build_usage_selected_occurrences', [
  'scripts/build_workbench_usage_selected_occurrences.mjs',
  `--selected-slices-index=${usageSelectedSlicesIndexJson}`,
  `--output=${usageSelectedOccurrencesJson}`,
  `--report=${options.scratchDir}/usage-selected-occurrences.md`,
]);

await runStep('validate_usage_selected_occurrences', [
  'scripts/validate_workbench_usage_selected_occurrences.mjs',
  usageSelectedOccurrencesJson,
]);

const usageSelectedSignatureIndependenceJson = `${options.scratchDir}/usage-selected-signature-independence.json`;
await runStep('build_usage_selected_signature_independence', [
  'scripts/build_workbench_usage_selected_signature_independence.mjs',
  `--selected-occurrences=${usageSelectedOccurrencesJson}`,
  `--context-signature-lookup=${usageContextSignatureLookupJson}`,
  `--output=${usageSelectedSignatureIndependenceJson}`,
  `--report=${options.scratchDir}/usage-selected-signature-independence.md`,
]);

await runStep('validate_usage_selected_signature_independence', [
  'scripts/validate_workbench_usage_selected_signature_independence.mjs',
  usageSelectedSignatureIndependenceJson,
]);

const usageSelectedSourceDiversityJson = `${options.scratchDir}/usage-selected-source-diversity.json`;
await runStep('build_usage_selected_source_diversity', [
  'scripts/build_workbench_usage_selected_source_diversity.mjs',
  `--selected-occurrences=${usageSelectedOccurrencesJson}`,
  `--selected-signature-independence=${usageSelectedSignatureIndependenceJson}`,
  `--output=${usageSelectedSourceDiversityJson}`,
  `--report=${options.scratchDir}/usage-selected-source-diversity.md`,
]);

await runStep('validate_usage_selected_source_diversity', [
  'scripts/validate_workbench_usage_selected_source_diversity.mjs',
  usageSelectedSourceDiversityJson,
]);

const usageSelectedOccurrenceLookupJson = `${options.scratchDir}/usage-selected-occurrence-lookup.json`;
await runStep('build_usage_selected_occurrence_lookup', [
  'scripts/build_workbench_usage_selected_occurrence_lookup.mjs',
  `--selected-occurrences=${usageSelectedOccurrencesJson}`,
  `--output=${usageSelectedOccurrenceLookupJson}`,
  `--report=${options.scratchDir}/usage-selected-occurrence-lookup.md`,
  '--max-samples=5',
]);

await runStep('validate_usage_selected_occurrence_lookup', [
  'scripts/validate_workbench_usage_selected_occurrence_lookup.mjs',
  usageSelectedOccurrenceLookupJson,
]);

const usageConcentrationPacketJson = `${options.scratchDir}/usage-concentration-packet.json`;
await runStep('build_usage_concentration_packet', [
  'scripts/build_workbench_usage_concentration_packet.mjs',
  `--selected-occurrences=${usageSelectedOccurrencesJson}`,
  `--selected-occurrence-lookup=${usageSelectedOccurrenceLookupJson}`,
  `--output=${usageConcentrationPacketJson}`,
  `--report=${options.scratchDir}/usage-concentration-packet.md`,
]);

await runStep('validate_usage_concentration_packet', [
  'scripts/validate_workbench_usage_concentration_packet.mjs',
  usageConcentrationPacketJson,
]);

const usageSelectedRouteConcentrationResponseJson = `${options.scratchDir}/usage-selected-route-concentration-response.json`;
await runStep('build_usage_selected_route_concentration_response', [
  'scripts/build_workbench_usage_selected_route_concentration_response.mjs',
  `--concentration-packet=${usageConcentrationPacketJson}`,
  `--selected-source-diversity=${usageSelectedSourceDiversityJson}`,
  `--selected-signature-independence=${usageSelectedSignatureIndependenceJson}`,
  `--output=${usageSelectedRouteConcentrationResponseJson}`,
  `--report=${options.scratchDir}/usage-selected-route-concentration-response.md`,
]);

await runStep('validate_usage_selected_route_concentration_response', [
  'scripts/validate_workbench_usage_selected_route_concentration_response.mjs',
  usageSelectedRouteConcentrationResponseJson,
]);

const usageSelectedOccurrenceCardsJson = `${options.scratchDir}/usage-selected-occurrence-cards.json`;
await runStep('build_usage_selected_occurrence_cards', [
  'scripts/build_workbench_usage_selected_occurrence_cards.mjs',
  `--selected-occurrences=${usageSelectedOccurrencesJson}`,
  `--selected-source-diversity=${usageSelectedSourceDiversityJson}`,
  `--selected-signature-independence=${usageSelectedSignatureIndependenceJson}`,
  `--selected-route-concentration-response=${usageSelectedRouteConcentrationResponseJson}`,
  `--output=${usageSelectedOccurrenceCardsJson}`,
  `--report=${options.scratchDir}/usage-selected-occurrence-cards.md`,
]);

await runStep('validate_usage_selected_occurrence_cards', [
  'scripts/validate_workbench_usage_selected_occurrence_cards.mjs',
  usageSelectedOccurrenceCardsJson,
]);

const usageSelectedProvenanceMatrixJson = `${options.scratchDir}/usage-selected-provenance-matrix.json`;
await runStep('build_usage_selected_provenance_matrix', [
  'scripts/build_workbench_usage_selected_provenance_matrix.mjs',
  `--selected-occurrence-cards=${usageSelectedOccurrenceCardsJson}`,
  `--output=${usageSelectedProvenanceMatrixJson}`,
  `--report=${options.scratchDir}/usage-selected-provenance-matrix.md`,
]);

await runStep('validate_usage_selected_provenance_matrix', [
  'scripts/validate_workbench_usage_selected_provenance_matrix.mjs',
  usageSelectedProvenanceMatrixJson,
]);

const usageSelectedCollisionAuditJson = `${options.scratchDir}/usage-selected-collision-audit.json`;
await runStep('build_usage_selected_collision_audit', [
  'scripts/build_workbench_usage_selected_collision_audit.mjs',
  `--selected-occurrence-cards=${usageSelectedOccurrenceCardsJson}`,
  `--selected-source-diversity=${usageSelectedSourceDiversityJson}`,
  `--output=${usageSelectedCollisionAuditJson}`,
  `--report=${options.scratchDir}/usage-selected-collision-audit.md`,
]);

await runStep('validate_usage_selected_collision_audit', [
  'scripts/validate_workbench_usage_selected_collision_audit.mjs',
  usageSelectedCollisionAuditJson,
]);

const usageSelectedFocusContextAuditJson = `${options.scratchDir}/usage-selected-focus-context-audit.json`;
await runStep('build_usage_selected_focus_context_audit', [
  'scripts/build_workbench_usage_selected_focus_context_audit.mjs',
  `--selected-occurrence-cards=${usageSelectedOccurrenceCardsJson}`,
  `--output=${usageSelectedFocusContextAuditJson}`,
  `--report=${options.scratchDir}/usage-selected-focus-context-audit.md`,
]);

await runStep('validate_usage_selected_focus_context_audit', [
  'scripts/validate_workbench_usage_selected_focus_context_audit.mjs',
  usageSelectedFocusContextAuditJson,
]);

const usageSelectedFrameSummaryJson = `${options.scratchDir}/usage-selected-frame-summary.json`;
await runStep('build_usage_selected_frame_summary', [
  'scripts/build_workbench_usage_selected_frame_summary.mjs',
  `--selected-occurrence-cards=${usageSelectedOccurrenceCardsJson}`,
  `--selected-focus-context-audit=${usageSelectedFocusContextAuditJson}`,
  `--output=${usageSelectedFrameSummaryJson}`,
  `--report=${options.scratchDir}/usage-selected-frame-summary.md`,
]);

await runStep('validate_usage_selected_frame_summary', [
  'scripts/validate_workbench_usage_selected_frame_summary.mjs',
  usageSelectedFrameSummaryJson,
]);

const usageSelectedFrameProvenanceMatrixJson = `${options.scratchDir}/usage-selected-frame-provenance-matrix.json`;
await runStep('build_usage_selected_frame_provenance_matrix', [
  'scripts/build_workbench_usage_selected_frame_provenance_matrix.mjs',
  `--selected-occurrence-cards=${usageSelectedOccurrenceCardsJson}`,
  `--selected-frame-summary=${usageSelectedFrameSummaryJson}`,
  `--selected-provenance-matrix=${usageSelectedProvenanceMatrixJson}`,
  `--output=${usageSelectedFrameProvenanceMatrixJson}`,
  `--report=${options.scratchDir}/usage-selected-frame-provenance-matrix.md`,
]);

await runStep('validate_usage_selected_frame_provenance_matrix', [
  'scripts/validate_workbench_usage_selected_frame_provenance_matrix.mjs',
  usageSelectedFrameProvenanceMatrixJson,
]);

const usageSelectedCollisionProvenanceAuditJson = `${options.scratchDir}/usage-selected-collision-provenance-audit.json`;
await runStep('build_usage_selected_collision_provenance_audit', [
  'scripts/build_workbench_usage_selected_collision_provenance_audit.mjs',
  `--selected-collision-audit=${usageSelectedCollisionAuditJson}`,
  `--selected-provenance-matrix=${usageSelectedProvenanceMatrixJson}`,
  `--selected-frame-provenance-matrix=${usageSelectedFrameProvenanceMatrixJson}`,
  `--output=${usageSelectedCollisionProvenanceAuditJson}`,
  `--report=${options.scratchDir}/usage-selected-collision-provenance-audit.md`,
]);

await runStep('validate_usage_selected_collision_provenance_audit', [
  'scripts/validate_workbench_usage_selected_collision_provenance_audit.mjs',
  usageSelectedCollisionProvenanceAuditJson,
]);

const usageSelectedWorkFrameMatrixJson = `${options.scratchDir}/usage-selected-work-frame-matrix.json`;
await runStep('build_usage_selected_work_frame_matrix', [
  'scripts/build_workbench_usage_selected_work_frame_matrix.mjs',
  `--selected-occurrence-cards=${usageSelectedOccurrenceCardsJson}`,
  `--selected-frame-summary=${usageSelectedFrameSummaryJson}`,
  `--output=${usageSelectedWorkFrameMatrixJson}`,
  `--report=${options.scratchDir}/usage-selected-work-frame-matrix.md`,
]);

await runStep('validate_usage_selected_work_frame_matrix', [
  'scripts/validate_workbench_usage_selected_work_frame_matrix.mjs',
  usageSelectedWorkFrameMatrixJson,
]);

const usageCrossmatchLinksJson = `${options.scratchDir}/usage-crossmatch-links.json`;
await runStep('build_usage_crossmatch_links', [
  'scripts/build_workbench_usage_crossmatch_links.mjs',
  `--selected-occurrences=${usageSelectedOccurrencesJson}`,
  `--output=${usageCrossmatchLinksJson}`,
  `--report=${options.scratchDir}/usage-crossmatch-links.md`,
]);

await runStep('validate_usage_crossmatch_links', [
  'scripts/validate_workbench_usage_crossmatch_links.mjs',
  usageCrossmatchLinksJson,
]);

const usageCrossmatchBridgeIndexJson = `${options.scratchDir}/usage-crossmatch-bridge-index.json`;
await runStep('build_usage_crossmatch_bridge_index', [
  'scripts/build_workbench_usage_crossmatch_bridge_index.mjs',
  `--crossmatch-links=${usageCrossmatchLinksJson}`,
  `--output=${usageCrossmatchBridgeIndexJson}`,
  `--report=${options.scratchDir}/usage-crossmatch-bridge-index.md`,
]);

await runStep('validate_usage_crossmatch_bridge_index', [
  'scripts/validate_workbench_usage_crossmatch_bridge_index.mjs',
  usageCrossmatchBridgeIndexJson,
]);

const usageCrossmatchNeighborhoodsJson = `${options.scratchDir}/usage-crossmatch-neighborhoods.json`;
await runStep('build_usage_crossmatch_neighborhoods', [
  'scripts/build_workbench_usage_crossmatch_neighborhoods.mjs',
  `--crossmatch-links=${usageCrossmatchLinksJson}`,
  `--output=${usageCrossmatchNeighborhoodsJson}`,
  `--report=${options.scratchDir}/usage-crossmatch-neighborhoods.md`,
]);

await runStep('validate_usage_crossmatch_neighborhoods', [
  'scripts/validate_workbench_usage_crossmatch_neighborhoods.mjs',
  usageCrossmatchNeighborhoodsJson,
]);

const usageConcordanceLinkCheckJson = `${options.scratchDir}/usage-concordance-link-check.json`;
await runStep('check_usage_concordance_links', [
  'scripts/check_workbench_usage_concordance_links.mjs',
  `--concordance=${usageConcordanceJson}`,
  `--output=${usageConcordanceLinkCheckJson}`,
  `--report=${options.scratchDir}/usage-concordance-link-check.md`,
]);

const usageRouteLinkCheckJson = `${options.scratchDir}/usage-route-link-check.json`;
await runStep('check_usage_route_links', [
  'scripts/check_workbench_usage_route_links.mjs',
  `--concordance=${usageConcordanceJson}`,
  `--output=${usageRouteLinkCheckJson}`,
  `--report=${options.scratchDir}/usage-route-link-check.md`,
]);

const usageSelectedRouteResolutionJson = `${options.scratchDir}/usage-selected-route-resolution.json`;
await runStep('build_usage_selected_route_resolution', [
  'scripts/build_workbench_usage_selected_route_resolution.mjs',
  `--selected-occurrence-cards=${usageSelectedOccurrenceCardsJson}`,
  `--route-coverage=${usageRouteCoverageJson}`,
  `--route-link-check=${usageRouteLinkCheckJson}`,
  `--output=${usageSelectedRouteResolutionJson}`,
  `--report=${options.scratchDir}/usage-selected-route-resolution.md`,
]);

await runStep('validate_usage_selected_route_resolution', [
  'scripts/validate_workbench_usage_selected_route_resolution.mjs',
  usageSelectedRouteResolutionJson,
]);

const usageSelectedRouteProvenanceAuditJson = `${options.scratchDir}/usage-selected-route-provenance-audit.json`;
await runStep('build_usage_selected_route_provenance_audit', [
  'scripts/build_workbench_usage_selected_route_provenance_audit.mjs',
  `--selected-occurrence-cards=${usageSelectedOccurrenceCardsJson}`,
  `--selected-route-resolution=${usageSelectedRouteResolutionJson}`,
  `--selected-provenance-matrix=${usageSelectedProvenanceMatrixJson}`,
  `--output=${usageSelectedRouteProvenanceAuditJson}`,
  `--report=${options.scratchDir}/usage-selected-route-provenance-audit.md`,
]);

await runStep('validate_usage_selected_route_provenance_audit', [
  'scripts/validate_workbench_usage_selected_route_provenance_audit.mjs',
  usageSelectedRouteProvenanceAuditJson,
]);

const usageSelectedOccurrenceNavigationIndexJson = `${options.scratchDir}/usage-selected-occurrence-navigation-index.json`;
await runStep('build_usage_selected_occurrence_navigation_index', [
  'scripts/build_workbench_usage_selected_occurrence_navigation_index.mjs',
  `--selected-occurrence-cards=${usageSelectedOccurrenceCardsJson}`,
  `--selected-provenance-matrix=${usageSelectedProvenanceMatrixJson}`,
  `--selected-collision-provenance-audit=${usageSelectedCollisionProvenanceAuditJson}`,
  `--output=${usageSelectedOccurrenceNavigationIndexJson}`,
  `--report=${options.scratchDir}/usage-selected-occurrence-navigation-index.md`,
]);

await runStep('validate_usage_selected_occurrence_navigation_index', [
  'scripts/validate_workbench_usage_selected_occurrence_navigation_index.mjs',
  usageSelectedOccurrenceNavigationIndexJson,
]);

const usageSelectedNavigationEdgeIndexJson = `${options.scratchDir}/usage-selected-navigation-edge-index.json`;
await runStep('build_usage_selected_navigation_edge_index', [
  'scripts/build_workbench_usage_selected_navigation_edge_index.mjs',
  `--selected-occurrence-navigation-index=${usageSelectedOccurrenceNavigationIndexJson}`,
  `--crossmatch-links=${usageCrossmatchLinksJson}`,
  `--output=${usageSelectedNavigationEdgeIndexJson}`,
  `--report=${options.scratchDir}/usage-selected-navigation-edge-index.md`,
]);

await runStep('validate_usage_selected_navigation_edge_index', [
  'scripts/validate_workbench_usage_selected_navigation_edge_index.mjs',
  usageSelectedNavigationEdgeIndexJson,
]);

const usageSelectedFrameBridgeIndexJson = `${options.scratchDir}/usage-selected-frame-bridge-index.json`;
await runStep('build_usage_selected_frame_bridge_index', [
  'scripts/build_workbench_usage_selected_frame_bridge_index.mjs',
  `--selected-navigation-edge-index=${usageSelectedNavigationEdgeIndexJson}`,
  `--output=${usageSelectedFrameBridgeIndexJson}`,
  `--report=${options.scratchDir}/usage-selected-frame-bridge-index.md`,
]);

await runStep('validate_usage_selected_frame_bridge_index', [
  'scripts/validate_workbench_usage_selected_frame_bridge_index.mjs',
  usageSelectedFrameBridgeIndexJson,
]);

const usageSelectedOccurrenceAdjacencyIndexJson = `${options.scratchDir}/usage-selected-occurrence-adjacency-index.json`;
await runStep('build_usage_selected_occurrence_adjacency_index', [
  'scripts/build_workbench_usage_selected_occurrence_adjacency_index.mjs',
  `--selected-navigation-edge-index=${usageSelectedNavigationEdgeIndexJson}`,
  `--output=${usageSelectedOccurrenceAdjacencyIndexJson}`,
  `--report=${options.scratchDir}/usage-selected-occurrence-adjacency-index.md`,
]);

await runStep('validate_usage_selected_occurrence_adjacency_index', [
  'scripts/validate_workbench_usage_selected_occurrence_adjacency_index.mjs',
  usageSelectedOccurrenceAdjacencyIndexJson,
]);

const usageSelectedSourceHubIndexJson = `${options.scratchDir}/usage-selected-source-hub-index.json`;
await runStep('build_usage_selected_source_hub_index', [
  'scripts/build_workbench_usage_selected_source_hub_index.mjs',
  `--selected-occurrence-adjacency-index=${usageSelectedOccurrenceAdjacencyIndexJson}`,
  `--output=${usageSelectedSourceHubIndexJson}`,
  `--report=${options.scratchDir}/usage-selected-source-hub-index.md`,
]);

await runStep('validate_usage_selected_source_hub_index', [
  'scripts/validate_workbench_usage_selected_source_hub_index.mjs',
  usageSelectedSourceHubIndexJson,
]);

const usageSelectedQaPackageJson = `${options.scratchDir}/usage-selected-qa-package.json`;
await runStep('build_usage_selected_qa_package', [
  'scripts/build_workbench_usage_selected_qa_package.mjs',
  `--selected-occurrence-cards=${usageSelectedOccurrenceCardsJson}`,
  `--selected-source-diversity=${usageSelectedSourceDiversityJson}`,
  `--selected-provenance-matrix=${usageSelectedProvenanceMatrixJson}`,
  `--selected-frame-provenance-matrix=${usageSelectedFrameProvenanceMatrixJson}`,
  `--selected-collision-audit=${usageSelectedCollisionAuditJson}`,
  `--selected-collision-provenance-audit=${usageSelectedCollisionProvenanceAuditJson}`,
  `--selected-signature-independence=${usageSelectedSignatureIndependenceJson}`,
  `--selected-route-concentration-response=${usageSelectedRouteConcentrationResponseJson}`,
  `--selected-route-resolution=${usageSelectedRouteResolutionJson}`,
  `--selected-route-provenance-audit=${usageSelectedRouteProvenanceAuditJson}`,
  `--selected-occurrence-navigation-index=${usageSelectedOccurrenceNavigationIndexJson}`,
  `--selected-navigation-edge-index=${usageSelectedNavigationEdgeIndexJson}`,
  `--selected-frame-bridge-index=${usageSelectedFrameBridgeIndexJson}`,
  `--selected-occurrence-adjacency-index=${usageSelectedOccurrenceAdjacencyIndexJson}`,
  `--selected-source-hub-index=${usageSelectedSourceHubIndexJson}`,
  `--selected-focus-context-audit=${usageSelectedFocusContextAuditJson}`,
  `--selected-frame-summary=${usageSelectedFrameSummaryJson}`,
  `--selected-work-frame-matrix=${usageSelectedWorkFrameMatrixJson}`,
  `--selected-occurrence-lookup=${usageSelectedOccurrenceLookupJson}`,
  `--crossmatch-links=${usageCrossmatchLinksJson}`,
  `--crossmatch-bridge-index=${usageCrossmatchBridgeIndexJson}`,
  `--crossmatch-neighborhoods=${usageCrossmatchNeighborhoodsJson}`,
  `--output=${usageSelectedQaPackageJson}`,
  `--report=${options.scratchDir}/usage-selected-qa-package.md`,
]);

await runStep('validate_usage_selected_qa_package', [
  'scripts/validate_workbench_usage_selected_qa_package.mjs',
  usageSelectedQaPackageJson,
]);

const usageAuditReviewJson = `${options.scratchDir}/usage-audit-only-review.json`;
await runStep('build_usage_audit_review', [
  'scripts/build_workbench_usage_audit_review.mjs',
  `--index=${publicHandoffIndexJson}`,
  `--output=${usageAuditReviewJson}`,
  `--report=${options.scratchDir}/usage-audit-only-review.md`,
  '--max-samples=80',
]);

const usageHandoffIndexJson = `${options.scratchDir}/usage-navigation-handoff-index.json`;
await runStep('build_usage_handoff_index', [
  'scripts/build_workbench_usage_handoff_index.mjs',
  `--manifest=${usageConcordanceManifestJson}`,
  `--occurrence-link-check=${usageConcordanceLinkCheckJson}`,
  `--route-link-check=${usageRouteLinkCheckJson}`,
  `--audit-review=${usageAuditReviewJson}`,
  `--cluster-index=${usageClusterIndexJson}`,
  `--route-coverage=${usageRouteCoverageJson}`,
  `--sample-index=${usageSampleIndexJson}`,
  `--lookup-index=${usageLookupIndexJson}`,
  `--work-frame-matrix=${usageWorkFrameMatrixJson}`,
  `--search-rows=${usageSearchRowsJson}`,
  `--provenance-index=${usageProvenanceIndexJson}`,
  `--search-shard-index=${usageSearchShardIndexJson}`,
  `--refresh-priority-index=${usageRefreshPriorityIndexJson}`,
  `--unit-density-index=${usageUnitDensityIndexJson}`,
  `--phrase-recurrence-index=${usagePhraseRecurrenceIndexJson}`,
  `--context-offset-index=${usageContextOffsetIndexJson}`,
  `--context-signature-index=${usageContextSignatureIndexJson}`,
  `--context-signature-lookup=${usageContextSignatureLookupJson}`,
  `--context-signature-contrast=${usageContextSignatureContrastJson}`,
  `--selected-slice=${usageSelectedSliceJson}`,
  `--selected-slices-index=${usageSelectedSlicesIndexJson}`,
  `--selected-occurrences=${usageSelectedOccurrencesJson}`,
  `--selected-signature-independence=${usageSelectedSignatureIndependenceJson}`,
  `--selected-source-diversity=${usageSelectedSourceDiversityJson}`,
  `--selected-collision-audit=${usageSelectedCollisionAuditJson}`,
  `--selected-collision-provenance-audit=${usageSelectedCollisionProvenanceAuditJson}`,
  `--selected-route-concentration-response=${usageSelectedRouteConcentrationResponseJson}`,
  `--selected-occurrence-cards=${usageSelectedOccurrenceCardsJson}`,
  `--selected-route-resolution=${usageSelectedRouteResolutionJson}`,
  `--selected-route-provenance-audit=${usageSelectedRouteProvenanceAuditJson}`,
  `--selected-occurrence-navigation-index=${usageSelectedOccurrenceNavigationIndexJson}`,
  `--selected-navigation-edge-index=${usageSelectedNavigationEdgeIndexJson}`,
  `--selected-frame-bridge-index=${usageSelectedFrameBridgeIndexJson}`,
  `--selected-occurrence-adjacency-index=${usageSelectedOccurrenceAdjacencyIndexJson}`,
  `--selected-source-hub-index=${usageSelectedSourceHubIndexJson}`,
  `--selected-focus-context-audit=${usageSelectedFocusContextAuditJson}`,
  `--selected-frame-summary=${usageSelectedFrameSummaryJson}`,
  `--selected-work-frame-matrix=${usageSelectedWorkFrameMatrixJson}`,
  `--selected-provenance-matrix=${usageSelectedProvenanceMatrixJson}`,
  `--selected-frame-provenance-matrix=${usageSelectedFrameProvenanceMatrixJson}`,
  `--selected-qa-package=${usageSelectedQaPackageJson}`,
  `--selected-occurrence-lookup=${usageSelectedOccurrenceLookupJson}`,
  `--crossmatch-links=${usageCrossmatchLinksJson}`,
  `--crossmatch-bridge-index=${usageCrossmatchBridgeIndexJson}`,
  `--crossmatch-neighborhoods=${usageCrossmatchNeighborhoodsJson}`,
  `--concentration-packet=${usageConcentrationPacketJson}`,
  '--no-smoke-validation',
  `--output=${usageHandoffIndexJson}`,
  `--report=${options.scratchDir}/usage-navigation-handoff-index.md`,
]);

await runStep('validate_usage_handoff_index', [
  'scripts/validate_workbench_usage_handoff_index.mjs',
  usageHandoffIndexJson,
]);

const publicHandoffIntegrityJson = `${options.scratchDir}/public-handoff-integrity-check.json`;
await runStep('check_public_handoff_integrity', [
  'scripts/check_workbench_public_handoff_integrity.mjs',
  `--index=${publicHandoffIndexJson}`,
  `--output=${publicHandoffIntegrityJson}`,
  `--report=${options.scratchDir}/public-handoff-integrity-check.md`,
]);

const artifactAuditJson = `${options.scratchDir}/candidate-artifact-audit.json`;
await runStep('audit_candidate_artifacts', [
  'scripts/audit_workbench_candidate_artifacts.mjs',
  `--target-queue=${options.targetQueue}`,
  `--output=${artifactAuditJson}`,
  `--report=${options.scratchDir}/candidate-artifact-audit.md`,
]);

const coverage = readJsonIfExists(coverageJson);
const smokeCounts = readJsonIfExists(smokeCountsJson);
const handoffIndex = readJsonIfExists(handoffIndexJson);
const publicHandoffIndex = readJsonIfExists(publicHandoffIndexJson);
const usageConcordance = readJsonIfExists(usageConcordanceJson);
const usageConcordanceManifest = readJsonIfExists(usageConcordanceManifestJson);
const usageClusterIndex = readJsonIfExists(usageClusterIndexJson);
const usageRouteCoverage = readJsonIfExists(usageRouteCoverageJson);
const usageSampleIndex = readJsonIfExists(usageSampleIndexJson);
const usageLookupIndex = readJsonIfExists(usageLookupIndexJson);
const usageWorkFrameMatrix = readJsonIfExists(usageWorkFrameMatrixJson);
const usageSearchRows = readJsonIfExists(usageSearchRowsJson);
const usageProvenanceIndex = readJsonIfExists(usageProvenanceIndexJson);
const usageSearchShardIndex = readJsonIfExists(usageSearchShardIndexJson);
const usageRefreshPriorityIndex = readJsonIfExists(usageRefreshPriorityIndexJson);
const usageUnitDensityIndex = readJsonIfExists(usageUnitDensityIndexJson);
const usagePhraseRecurrenceIndex = readJsonIfExists(usagePhraseRecurrenceIndexJson);
const usageContextOffsetIndex = readJsonIfExists(usageContextOffsetIndexJson);
const usageContextSignatureIndex = readJsonIfExists(usageContextSignatureIndexJson);
const usageContextSignatureLookup = readJsonIfExists(usageContextSignatureLookupJson);
const usageContextSignatureContrast = readJsonIfExists(usageContextSignatureContrastJson);
const usageSelectedSlice = readJsonIfExists(usageSelectedSliceJson);
const usageSelectedSlicesIndex = readJsonIfExists(usageSelectedSlicesIndexJson);
const usageSelectedOccurrences = readJsonIfExists(usageSelectedOccurrencesJson);
const usageSelectedSignatureIndependence = readJsonIfExists(usageSelectedSignatureIndependenceJson);
const usageSelectedSourceDiversity = readJsonIfExists(usageSelectedSourceDiversityJson);
const usageSelectedProvenanceMatrix = readJsonIfExists(usageSelectedProvenanceMatrixJson);
const usageSelectedCollisionAudit = readJsonIfExists(usageSelectedCollisionAuditJson);
const usageSelectedCollisionProvenanceAudit = readJsonIfExists(usageSelectedCollisionProvenanceAuditJson);
const usageSelectedRouteConcentrationResponse = readJsonIfExists(usageSelectedRouteConcentrationResponseJson);
const usageSelectedOccurrenceCards = readJsonIfExists(usageSelectedOccurrenceCardsJson);
const usageSelectedRouteResolution = readJsonIfExists(usageSelectedRouteResolutionJson);
const usageSelectedRouteProvenanceAudit = readJsonIfExists(usageSelectedRouteProvenanceAuditJson);
const usageSelectedOccurrenceNavigationIndex = readJsonIfExists(usageSelectedOccurrenceNavigationIndexJson);
const usageSelectedNavigationEdgeIndex = readJsonIfExists(usageSelectedNavigationEdgeIndexJson);
const usageSelectedFrameBridgeIndex = readJsonIfExists(usageSelectedFrameBridgeIndexJson);
const usageSelectedOccurrenceAdjacencyIndex = readJsonIfExists(usageSelectedOccurrenceAdjacencyIndexJson);
const usageSelectedSourceHubIndex = readJsonIfExists(usageSelectedSourceHubIndexJson);
const usageSelectedFocusContextAudit = readJsonIfExists(usageSelectedFocusContextAuditJson);
const usageSelectedFrameSummary = readJsonIfExists(usageSelectedFrameSummaryJson);
const usageSelectedFrameProvenanceMatrix = readJsonIfExists(usageSelectedFrameProvenanceMatrixJson);
const usageSelectedWorkFrameMatrix = readJsonIfExists(usageSelectedWorkFrameMatrixJson);
const usageSelectedQaPackage = readJsonIfExists(usageSelectedQaPackageJson);
const usageSelectedOccurrenceLookup = readJsonIfExists(usageSelectedOccurrenceLookupJson);
const usageCrossmatchLinks = readJsonIfExists(usageCrossmatchLinksJson);
const usageCrossmatchBridgeIndex = readJsonIfExists(usageCrossmatchBridgeIndexJson);
const usageCrossmatchNeighborhoods = readJsonIfExists(usageCrossmatchNeighborhoodsJson);
const usageConcordanceLinkCheck = readJsonIfExists(usageConcordanceLinkCheckJson);
const usageRouteLinkCheck = readJsonIfExists(usageRouteLinkCheckJson);
const usageAuditReview = readJsonIfExists(usageAuditReviewJson);
const usageHandoffIndex = readJsonIfExists(usageHandoffIndexJson);
const publicHandoffIntegrity = readJsonIfExists(publicHandoffIntegrityJson);
const artifactAudit = readJsonIfExists(artifactAuditJson);
const failedSteps = steps.filter((step) => step.status !== 'passed');
const sourceFreshness = readJsonIfExists(sourceFreshnessJson);

const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_smoke_pipeline_validation',
  generated_at: generatedAt,
  generator: 'scripts/validate_workbench_smoke_pipeline.mjs',
  policy: 'Smoke-only validation wrapper. It reads existing reshit/workbench artifacts, validates provenance and coverage, and does not scan broad corpus files or choose HUD winners.',
  inputs: {
    target_queue: options.targetQueue,
    full_dir: options.fullDir,
    handoff_root: options.handoffRoot,
    evidence_dir: options.evidenceDir,
    scratch_dir: options.scratchDir,
  },
  counts: {
    steps: steps.length,
    failed_steps: failedSteps.length,
    smoke_targets: smokeCounts?.counts?.targets ?? null,
    smoke_supported: smokeCounts?.counts?.supported ?? null,
    smoke_candidate: smokeCounts?.counts?.candidate ?? null,
    smoke_weak: smokeCounts?.counts?.weak ?? null,
    smoke_ambiguous: smokeCounts?.counts?.ambiguous ?? null,
    smoke_missing: smokeCounts?.counts?.missing ?? null,
    smoke_zero_useful: smokeCounts?.counts?.zero_useful ?? null,
    source_freshness_status: sourceFreshness?.status ?? null,
    source_count_delta: sourceFreshness?.current_inventory?.count_delta_vs_artifact_scan ?? null,
    source_files_modified_after_artifact: sourceFreshness?.current_inventory?.files_modified_after_artifact ?? null,
    known_nonzero_source_files: coverage?.counts?.known_nonzero_source_files ?? null,
    covered_source_files: coverage?.counts?.covered_source_files ?? null,
    uncovered_source_files: coverage?.counts?.uncovered_source_files ?? null,
    handoff_manifests: handoffIndex?.counts?.manifests ?? null,
    handoff_candidate_rows: handoffIndex?.counts?.candidate_rows ?? null,
    handoff_missing_targets: handoffIndex?.target_queue_coverage?.missing_targets?.length ?? null,
    public_handoff_selected_targets: publicHandoffIndex?.counts?.selected_targets ?? null,
    public_handoff_validation_failed: publicHandoffIndex?.counts?.validation_failed ?? null,
    public_handoff_reader_facing_eligible_rows: publicHandoffIndex?.counts?.reader_facing_eligible_rows ?? null,
    public_handoff_count_only_ambiguous_rows: publicHandoffIndex?.counts?.count_only_ambiguous_rows ?? null,
    public_handoff_zero_useful_targets: publicHandoffIndex?.counts?.zero_useful_targets ?? null,
    public_handoff_ambiguous_reader_facing: publicHandoffIndex?.reader_facing_policy?.ambiguous_rows_reader_facing ?? null,
    public_handoff_quality_status: publicHandoffIndex?.quality_gates?.overall_status ?? null,
    public_handoff_license_status: publicHandoffIndex?.license_policy?.status ?? null,
    public_handoff_license_blocked_row_count: publicHandoffIndex?.license_policy?.blocked_row_count ?? null,
    public_handoff_license_blocked_licenses: Array.isArray(publicHandoffIndex?.license_policy?.blocked_license_rows)
      ? publicHandoffIndex.license_policy.blocked_license_rows.length
      : null,
    usage_concordance_rows: usageConcordance?.counts?.rows ?? null,
    usage_concordance_supported: usageConcordance?.counts?.status_counts?.supported ?? null,
    usage_concordance_candidate: usageConcordance?.counts?.status_counts?.candidate ?? null,
    usage_concordance_weak: usageConcordance?.counts?.status_counts?.weak ?? null,
    usage_concordance_route_linked: usageConcordance?.counts?.route_link_state_counts?.route_linked_observed_usage ?? null,
    usage_concordance_observed_only: usageConcordance?.counts?.route_link_state_counts?.observed_usage_only ?? null,
    usage_concordance_audit_only_ambiguous: usageConcordance?.counts?.audit_only_counts?.ambiguous ?? null,
    usage_concordance_ambiguous_reader_facing: usageConcordance?.reader_facing_policy?.ambiguous_rows_reader_facing ?? null,
    usage_concordance_manifest_status: usageConcordanceManifest?.artifact_type === 'workbench_usage_navigation_concordance_manifest' ? 'present' : 'missing',
    usage_concordance_manifest_json_tracked: usageConcordanceManifest?.outputs?.concordance_json?.tracked_in_git ?? null,
    usage_concordance_manifest_report_tracked: usageConcordanceManifest?.outputs?.concordance_report?.tracked_in_git ?? null,
    usage_cluster_index_status: usageClusterIndex?.artifact_type === 'workbench_usage_navigation_cluster_index' ? 'present' : 'missing',
    usage_cluster_index_clusters: usageClusterIndex?.counts?.clusters ?? null,
    usage_cluster_index_rows: usageClusterIndex?.counts?.rows ?? null,
    usage_route_coverage_status: usageRouteCoverage?.artifact_type === 'workbench_usage_route_coverage_index' ? 'present' : 'missing',
    usage_route_coverage_route_ids: usageRouteCoverage?.counts?.unique_route_ids ?? null,
    usage_route_coverage_links: usageRouteCoverage?.counts?.route_links ?? null,
    usage_sample_index_status: usageSampleIndex?.artifact_type === 'workbench_usage_navigation_sample_index' ? 'present' : 'missing',
    usage_sample_index_samples: usageSampleIndex?.counts?.sample_rows ?? null,
    usage_sample_index_clusters: usageSampleIndex?.counts?.clusters ?? null,
    usage_lookup_index_status: usageLookupIndex?.artifact_type === 'workbench_usage_navigation_lookup_index' ? 'present' : 'missing',
    usage_lookup_index_occurrence_refs: usageLookupIndex?.counts?.occurrence_refs ?? null,
    usage_lookup_index_works: usageLookupIndex?.counts?.works ?? null,
    usage_work_frame_matrix_status: usageWorkFrameMatrix?.artifact_type === 'workbench_usage_navigation_work_frame_matrix' ? 'present' : 'missing',
    usage_work_frame_matrix_rows: usageWorkFrameMatrix?.counts?.rows ?? null,
    usage_work_frame_matrix_works: usageWorkFrameMatrix?.counts?.works ?? null,
    usage_work_frame_matrix_categories: usageWorkFrameMatrix?.counts?.categories ?? null,
    usage_work_frame_matrix_clusters: usageWorkFrameMatrix?.counts?.clusters ?? null,
    usage_work_frame_matrix_route_payload_field_hits: usageWorkFrameMatrix?.counts?.route_payload_field_hits ?? null,
    usage_search_rows_status: usageSearchRows?.artifact_type === 'workbench_usage_navigation_search_rows' ? 'present' : 'missing',
    usage_search_rows: usageSearchRows?.counts?.rows ?? null,
    usage_search_rows_works: usageSearchRows?.counts?.works ?? null,
    usage_search_rows_categories: usageSearchRows?.counts?.categories ?? null,
    usage_search_rows_clusters: usageSearchRows?.counts?.clusters ?? null,
    usage_search_rows_route_payload_field_hits: usageSearchRows?.counts?.route_payload_field_hits ?? null,
    usage_provenance_index_status: usageProvenanceIndex?.artifact_type === 'workbench_usage_provenance_index' ? 'present' : 'missing',
    usage_provenance_rows: usageProvenanceIndex?.counts?.rows ?? null,
    usage_provenance_licenses: usageProvenanceIndex?.counts?.licenses ?? null,
    usage_provenance_version_sources: usageProvenanceIndex?.counts?.version_sources ?? null,
    usage_provenance_rows_with_license_metadata: usageProvenanceIndex?.counts?.rows_with_license_metadata ?? null,
    usage_provenance_rows_with_source_links: usageProvenanceIndex?.counts?.rows_with_source_links ?? null,
    usage_provenance_rows_with_version_metadata: usageProvenanceIndex?.counts?.rows_with_version_metadata ?? null,
    usage_provenance_unsafe_license_rows: usageProvenanceIndex?.counts?.unsafe_license_rows ?? null,
    usage_provenance_route_payload_field_hits: usageProvenanceIndex?.counts?.route_payload_field_hits ?? null,
    usage_search_shard_index_status: usageSearchShardIndex?.artifact_type === 'workbench_usage_navigation_search_shard_index' ? 'present' : 'missing',
    usage_search_shard_index_shards: usageSearchShardIndex?.counts?.shards ?? null,
    usage_search_shard_index_rows: usageSearchShardIndex?.counts?.rows ?? null,
    usage_search_shard_index_categories: usageSearchShardIndex?.counts?.categories ?? null,
    usage_search_shard_index_clusters: usageSearchShardIndex?.counts?.clusters ?? null,
    usage_search_shard_index_statuses: usageSearchShardIndex?.counts?.statuses ?? null,
    usage_search_shard_index_route_payload_field_hits: usageSearchShardIndex?.counts?.route_payload_field_hits ?? null,
    usage_refresh_priority_index_status: usageRefreshPriorityIndex?.artifact_type === 'workbench_usage_refresh_priority_index' ? 'present' : 'missing',
    usage_refresh_priority_pending_files: usageRefreshPriorityIndex?.counts?.pending_refresh_files ?? null,
    usage_refresh_priority_known_usage_candidates: usageRefreshPriorityIndex?.counts?.known_usage_refresh_candidates ?? null,
    usage_refresh_priority_review_only_not_promoted: usageRefreshPriorityIndex?.counts?.review_only_not_promoted ?? null,
    usage_refresh_priority_promoted_run_targets: usageRefreshPriorityIndex?.counts?.promoted_run_targets ?? null,
    usage_refresh_priority_blocked_broad_refresh_files: usageRefreshPriorityIndex?.counts?.blocked_broad_refresh_files ?? null,
    usage_refresh_priority_route_payload_field_hits: usageRefreshPriorityIndex?.counts?.route_payload_field_hits ?? null,
    usage_unit_density_index_status: usageUnitDensityIndex?.artifact_type === 'workbench_usage_navigation_unit_density_index' ? 'present' : 'missing',
    usage_unit_density_units: usageUnitDensityIndex?.counts?.units ?? null,
    usage_unit_density_rows: usageUnitDensityIndex?.counts?.rows ?? null,
    usage_unit_density_multi_occurrence_units: usageUnitDensityIndex?.counts?.multi_occurrence_units ?? null,
    usage_unit_density_max_occurrences_per_unit: usageUnitDensityIndex?.counts?.max_occurrences_per_unit ?? null,
    usage_unit_density_works: usageUnitDensityIndex?.counts?.works ?? null,
    usage_unit_density_route_payload_field_hits: usageUnitDensityIndex?.counts?.route_payload_field_hits ?? null,
    usage_phrase_recurrence_index_status: usagePhraseRecurrenceIndex?.artifact_type === 'workbench_usage_phrase_recurrence_index' ? 'present' : 'missing',
    usage_phrase_recurrence_rows: usagePhraseRecurrenceIndex?.counts?.rows ?? null,
    usage_phrase_recurrence_ngram_instances: usagePhraseRecurrenceIndex?.counts?.ngram_instances ?? null,
    usage_phrase_recurrence_groups_all: usagePhraseRecurrenceIndex?.counts?.phrase_groups_all ?? null,
    usage_phrase_recurrence_recurring_groups: usagePhraseRecurrenceIndex?.counts?.recurring_phrase_groups ?? null,
    usage_phrase_recurrence_rows_with_recurring_groups: usagePhraseRecurrenceIndex?.counts?.rows_with_recurring_phrase_groups ?? null,
    usage_phrase_recurrence_skipped_rows_without_focus: usagePhraseRecurrenceIndex?.counts?.skipped_rows_without_focus ?? null,
    usage_phrase_recurrence_route_payload_field_hits: usagePhraseRecurrenceIndex?.counts?.route_payload_field_hits ?? null,
    usage_context_offset_index_status: usageContextOffsetIndex?.artifact_type === 'workbench_usage_context_offset_index' ? 'present' : 'missing',
    usage_context_offset_rows: usageContextOffsetIndex?.counts?.rows ?? null,
    usage_context_offset_rows_with_context: usageContextOffsetIndex?.counts?.rows_with_context ?? null,
    usage_context_offset_token_observations: usageContextOffsetIndex?.counts?.token_observations ?? null,
    usage_context_offset_immediate_neighbor_observations: usageContextOffsetIndex?.counts?.immediate_neighbor_observations ?? null,
    usage_context_offset_offsets: usageContextOffsetIndex?.counts?.offsets ?? null,
    usage_context_offset_token_buckets: usageContextOffsetIndex?.counts?.token_buckets ?? null,
    usage_context_offset_skipped_rows_without_focus: usageContextOffsetIndex?.counts?.skipped_rows_without_focus ?? null,
    usage_context_offset_route_payload_field_hits: usageContextOffsetIndex?.counts?.route_payload_field_hits ?? null,
    usage_context_signature_index_status: usageContextSignatureIndex?.artifact_type === 'workbench_usage_context_signature_index' ? 'present' : 'missing',
    usage_context_signature_rows: usageContextSignatureIndex?.counts?.rows ?? null,
    usage_context_signature_rows_with_signatures: usageContextSignatureIndex?.counts?.rows_with_signatures ?? null,
    usage_context_signature_windows: usageContextSignatureIndex?.counts?.signature_windows ?? null,
    usage_context_signature_groups_all: usageContextSignatureIndex?.counts?.signature_groups_all ?? null,
    usage_context_signature_recurring_groups: usageContextSignatureIndex?.counts?.recurring_signature_groups ?? null,
    usage_context_signature_rows_with_recurring_signatures: usageContextSignatureIndex?.counts?.rows_with_recurring_signatures ?? null,
    usage_context_signature_cross_cluster_groups: usageContextSignatureIndex?.counts?.cross_cluster_signature_groups ?? null,
    usage_context_signature_skipped_rows_without_focus: usageContextSignatureIndex?.counts?.skipped_rows_without_focus ?? null,
    usage_context_signature_route_payload_field_hits: usageContextSignatureIndex?.counts?.route_payload_field_hits ?? null,
    usage_context_signature_lookup_status: usageContextSignatureLookup?.artifact_type === 'workbench_usage_context_signature_lookup' ? 'present' : 'missing',
    usage_context_signature_lookup_occurrence_refs: usageContextSignatureLookup?.counts?.occurrence_refs ?? null,
    usage_context_signature_lookup_memberships: usageContextSignatureLookup?.counts?.signature_memberships ?? null,
    usage_context_signature_lookup_recurring_memberships: usageContextSignatureLookup?.counts?.recurring_signature_memberships ?? null,
    usage_context_signature_lookup_occurrences_with_recurring: usageContextSignatureLookup?.counts?.occurrence_refs_with_recurring_signatures ?? null,
    usage_context_signature_lookup_cross_cluster_memberships: usageContextSignatureLookup?.counts?.cross_cluster_signature_memberships ?? null,
    usage_context_signature_lookup_occurrences_with_cross_cluster: usageContextSignatureLookup?.counts?.occurrence_refs_with_cross_cluster_signatures ?? null,
    usage_context_signature_lookup_unmatched_occurrence_ids: usageContextSignatureLookup?.counts?.unmatched_occurrence_ids ?? null,
    usage_context_signature_lookup_route_payload_field_hits: usageContextSignatureLookup?.counts?.route_payload_field_hits ?? null,
    usage_context_signature_contrast_status: usageContextSignatureContrast?.artifact_type === 'workbench_usage_context_signature_contrast' ? 'present' : 'missing',
    usage_context_signature_contrast_groups: usageContextSignatureContrast?.counts?.cross_cluster_signature_groups ?? null,
    usage_context_signature_contrast_occurrence_refs: usageContextSignatureContrast?.counts?.cross_cluster_occurrence_refs ?? null,
    usage_context_signature_contrast_reader_facing_rows: usageContextSignatureContrast?.counts?.reader_facing_rows ?? null,
    usage_context_signature_contrast_route_payload_field_hits: usageContextSignatureContrast?.counts?.route_payload_field_hits ?? null,
    usage_selected_slice_status: usageSelectedSlice?.artifact_type === 'workbench_usage_navigation_slice_index' ? 'present' : 'missing',
    usage_selected_slice_id: usageSelectedSlice?.filter?.slice_id ?? null,
    usage_selected_slice_rows: usageSelectedSlice?.counts?.slice_rows ?? null,
    usage_selected_slice_works: usageSelectedSlice?.counts?.works ?? null,
    usage_selected_slices_index_status: usageSelectedSlicesIndex?.artifact_type === 'workbench_usage_navigation_selected_slices_index' ? 'present' : 'missing',
    usage_selected_slices_index_slices: usageSelectedSlicesIndex?.counts?.slices ?? null,
    usage_selected_slices_index_rows: usageSelectedSlicesIndex?.counts?.rows ?? null,
    usage_selected_slices_index_unique_occurrences: usageSelectedSlicesIndex?.deduped_counts?.occurrence_refs ?? null,
    usage_selected_slices_index_duplicate_rows: usageSelectedSlicesIndex?.deduped_counts?.duplicate_slice_rows ?? null,
    usage_selected_occurrences_status: usageSelectedOccurrences?.artifact_type === 'workbench_usage_navigation_selected_occurrences' ? 'present' : 'missing',
    usage_selected_occurrence_rows: usageSelectedOccurrences?.counts?.occurrence_refs ?? null,
    usage_selected_occurrence_memberships: usageSelectedOccurrences?.counts?.slice_memberships ?? null,
    usage_selected_occurrence_duplicate_memberships: usageSelectedOccurrences?.counts?.duplicate_slice_memberships ?? null,
    usage_selected_signature_independence_status: usageSelectedSignatureIndependence?.artifact_type === 'workbench_usage_selected_signature_independence' ? 'present' : 'missing',
    usage_selected_signature_independence_rows: usageSelectedSignatureIndependence?.counts?.selected_occurrence_refs ?? null,
    usage_selected_signature_independence_memberships: usageSelectedSignatureIndependence?.counts?.signature_memberships ?? null,
    usage_selected_signature_independence_recurring_memberships: usageSelectedSignatureIndependence?.counts?.recurring_signature_memberships ?? null,
    usage_selected_signature_independence_cross_cluster_memberships: usageSelectedSignatureIndependence?.counts?.cross_cluster_signature_memberships ?? null,
    usage_selected_signature_independence_rows_with_recurring: usageSelectedSignatureIndependence?.counts?.occurrence_refs_with_recurring_signatures ?? null,
    usage_selected_signature_independence_rows_with_cross_cluster: usageSelectedSignatureIndependence?.counts?.occurrence_refs_with_cross_cluster_signatures ?? null,
    usage_selected_signature_independence_missing_lookup_rows: usageSelectedSignatureIndependence?.counts?.missing_lookup_rows ?? null,
    usage_selected_signature_independence_reader_facing_rows: usageSelectedSignatureIndependence?.counts?.reader_facing_rows ?? null,
    usage_selected_signature_independence_route_payload_field_hits: usageSelectedSignatureIndependence?.counts?.route_payload_field_hits ?? null,
    usage_selected_source_diversity_status: usageSelectedSourceDiversity?.artifact_type === 'workbench_usage_selected_source_diversity' ? 'present' : 'missing',
    usage_selected_source_diversity_rows: usageSelectedSourceDiversity?.counts?.selected_occurrence_refs ?? null,
    usage_selected_source_diversity_unique_source_refs: usageSelectedSourceDiversity?.counts?.unique_source_refs ?? null,
    usage_selected_source_diversity_unique_work_anchors: usageSelectedSourceDiversity?.counts?.unique_work_anchors ?? null,
    usage_selected_source_diversity_unique_works: usageSelectedSourceDiversity?.counts?.unique_works ?? null,
    usage_selected_source_diversity_unique_categories: usageSelectedSourceDiversity?.counts?.unique_categories ?? null,
    usage_selected_source_diversity_unique_licenses: usageSelectedSourceDiversity?.counts?.unique_licenses ?? null,
    usage_selected_source_diversity_unique_version_sources: usageSelectedSourceDiversity?.counts?.unique_version_sources ?? null,
    usage_selected_source_diversity_duplicate_source_ref_buckets: usageSelectedSourceDiversity?.counts?.duplicate_source_ref_buckets ?? null,
    usage_selected_source_diversity_duplicate_source_ref_rows: usageSelectedSourceDiversity?.counts?.duplicate_source_ref_rows ?? null,
    usage_selected_source_diversity_missing_signature_rows: usageSelectedSourceDiversity?.counts?.missing_signature_independence_rows ?? null,
    usage_selected_source_diversity_reader_facing_rows: usageSelectedSourceDiversity?.counts?.reader_facing_rows ?? null,
    usage_selected_source_diversity_route_payload_field_hits: usageSelectedSourceDiversity?.counts?.route_payload_field_hits ?? null,
    usage_selected_provenance_matrix_status: usageSelectedProvenanceMatrix?.artifact_type === 'workbench_usage_selected_provenance_matrix' ? 'present' : 'missing',
    usage_selected_provenance_matrix_buckets: usageSelectedProvenanceMatrix?.counts?.provenance_buckets ?? null,
    usage_selected_provenance_matrix_rows: usageSelectedProvenanceMatrix?.counts?.selected_rows ?? null,
    usage_selected_provenance_matrix_licenses: usageSelectedProvenanceMatrix?.counts?.unique_licenses ?? null,
    usage_selected_provenance_matrix_version_sources: usageSelectedProvenanceMatrix?.counts?.unique_version_sources ?? null,
    usage_selected_provenance_matrix_rows_with_license_metadata: usageSelectedProvenanceMatrix?.counts?.rows_with_license_metadata ?? null,
    usage_selected_provenance_matrix_rows_with_version_metadata: usageSelectedProvenanceMatrix?.counts?.rows_with_version_metadata ?? null,
    usage_selected_provenance_matrix_missing_or_unrecognized_license_rows: usageSelectedProvenanceMatrix?.counts?.missing_or_unrecognized_license_rows ?? null,
    usage_selected_provenance_matrix_samples: usageSelectedProvenanceMatrix?.counts?.sample_occurrences ?? null,
    usage_selected_provenance_matrix_reader_facing_rows: usageSelectedProvenanceMatrix?.counts?.reader_facing_rows ?? null,
    usage_selected_provenance_matrix_route_payload_field_hits: usageSelectedProvenanceMatrix?.counts?.route_payload_field_hits ?? null,
    usage_selected_collision_audit_status: usageSelectedCollisionAudit?.artifact_type === 'workbench_usage_selected_collision_audit' ? 'present' : 'missing',
    usage_selected_collision_audit_buckets: usageSelectedCollisionAudit?.counts?.collision_buckets ?? null,
    usage_selected_collision_audit_occurrence_rows: usageSelectedCollisionAudit?.counts?.collision_occurrence_rows ?? null,
    usage_selected_collision_audit_duplicate_source_ref_buckets: usageSelectedCollisionAudit?.counts?.duplicate_source_ref_buckets ?? null,
    usage_selected_collision_audit_duplicate_work_anchor_buckets: usageSelectedCollisionAudit?.counts?.duplicate_work_anchor_buckets ?? null,
    usage_selected_collision_audit_cross_frame_buckets: usageSelectedCollisionAudit?.counts?.cross_frame_collision_buckets ?? null,
    usage_selected_collision_audit_cross_frame_rows: usageSelectedCollisionAudit?.counts?.cross_frame_collision_rows ?? null,
    usage_selected_collision_audit_reader_facing_rows: usageSelectedCollisionAudit?.counts?.reader_facing_rows ?? null,
    usage_selected_collision_audit_route_payload_field_hits: usageSelectedCollisionAudit?.counts?.route_payload_field_hits ?? null,
    usage_selected_collision_provenance_audit_status: usageSelectedCollisionProvenanceAudit?.artifact_type === 'workbench_usage_selected_collision_provenance_audit' ? 'present' : 'missing',
    usage_selected_collision_provenance_audit_buckets: usageSelectedCollisionProvenanceAudit?.counts?.collision_buckets ?? null,
    usage_selected_collision_provenance_audit_occurrence_rows: usageSelectedCollisionProvenanceAudit?.counts?.collision_occurrence_rows ?? null,
    usage_selected_collision_provenance_audit_provenance_buckets: usageSelectedCollisionProvenanceAudit?.counts?.provenance_buckets ?? null,
    usage_selected_collision_provenance_audit_frame_provenance_buckets: usageSelectedCollisionProvenanceAudit?.counts?.frame_provenance_buckets ?? null,
    usage_selected_collision_provenance_audit_missing_provenance_rows: usageSelectedCollisionProvenanceAudit?.counts?.missing_provenance_rows ?? null,
    usage_selected_collision_provenance_audit_missing_frame_provenance_rows: usageSelectedCollisionProvenanceAudit?.counts?.missing_frame_provenance_rows ?? null,
    usage_selected_collision_provenance_audit_samples: usageSelectedCollisionProvenanceAudit?.counts?.sample_occurrences ?? null,
    usage_selected_collision_provenance_audit_reader_facing_rows: usageSelectedCollisionProvenanceAudit?.counts?.reader_facing_rows ?? null,
    usage_selected_collision_provenance_audit_route_payload_field_hits: usageSelectedCollisionProvenanceAudit?.counts?.route_payload_field_hits ?? null,
    usage_selected_route_concentration_response_status: usageSelectedRouteConcentrationResponse?.artifact_type === 'workbench_usage_selected_route_concentration_response' ? 'present' : 'missing',
    usage_selected_route_concentration_response_rows: usageSelectedRouteConcentrationResponse?.counts?.selected_occurrence_refs ?? null,
    usage_selected_route_concentration_response_route_buckets: usageSelectedRouteConcentrationResponse?.counts?.route_id_buckets ?? null,
    usage_selected_route_concentration_response_warning_visible: usageSelectedRouteConcentrationResponse?.counts?.route_concentration_warning_visible ?? null,
    usage_selected_route_concentration_response_unique_source_refs: usageSelectedRouteConcentrationResponse?.counts?.unique_source_refs ?? null,
    usage_selected_route_concentration_response_unique_works: usageSelectedRouteConcentrationResponse?.counts?.unique_works ?? null,
    usage_selected_route_concentration_response_rows_with_recurring: usageSelectedRouteConcentrationResponse?.counts?.rows_with_recurring_signatures ?? null,
    usage_selected_route_concentration_response_rows_with_cross_cluster: usageSelectedRouteConcentrationResponse?.counts?.rows_with_cross_cluster_signatures ?? null,
    usage_selected_route_concentration_response_warning_count: usageSelectedRouteConcentrationResponse?.quality?.warning_count ?? null,
    usage_selected_route_concentration_response_reader_facing_rows: usageSelectedRouteConcentrationResponse?.counts?.reader_facing_rows ?? null,
    usage_selected_route_concentration_response_route_payload_field_hits: usageSelectedRouteConcentrationResponse?.counts?.route_payload_field_hits ?? null,
    usage_selected_occurrence_cards_status: usageSelectedOccurrenceCards?.artifact_type === 'workbench_usage_selected_occurrence_cards' ? 'present' : 'missing',
    usage_selected_occurrence_cards_rows: usageSelectedOccurrenceCards?.counts?.cards ?? null,
    usage_selected_occurrence_cards_with_context: usageSelectedOccurrenceCards?.counts?.cards_with_context ?? null,
    usage_selected_occurrence_cards_with_focus_marker: usageSelectedOccurrenceCards?.counts?.cards_with_focus_marker ?? null,
    usage_selected_occurrence_cards_with_related_signatures: usageSelectedOccurrenceCards?.counts?.cards_with_related_signatures ?? null,
    usage_selected_occurrence_cards_with_cross_cluster_signatures: usageSelectedOccurrenceCards?.counts?.cards_with_cross_cluster_signatures ?? null,
    usage_selected_occurrence_cards_related_occurrence_samples: usageSelectedOccurrenceCards?.counts?.related_occurrence_samples ?? null,
    usage_selected_occurrence_cards_route_concentration_warning_visible: usageSelectedOccurrenceCards?.counts?.route_concentration_warning_visible ?? null,
    usage_selected_occurrence_cards_mojibake_rows: usageSelectedOccurrenceCards?.counts?.mojibake_token_or_context_rows ?? null,
    usage_selected_occurrence_cards_reader_facing_rows: usageSelectedOccurrenceCards?.counts?.reader_facing_rows ?? null,
    usage_selected_occurrence_cards_route_payload_field_hits: usageSelectedOccurrenceCards?.counts?.route_payload_field_hits ?? null,
    usage_selected_route_resolution_status: usageSelectedRouteResolution?.artifact_type === 'workbench_usage_selected_route_resolution' ? 'present' : 'missing',
    usage_selected_route_resolution_route_id_buckets: usageSelectedRouteResolution?.counts?.route_id_buckets ?? null,
    usage_selected_route_resolution_selected_route_links: usageSelectedRouteResolution?.counts?.selected_route_links ?? null,
    usage_selected_route_resolution_resolved_route_ids: usageSelectedRouteResolution?.counts?.resolved_route_ids ?? null,
    usage_selected_route_resolution_unresolved_route_ids: usageSelectedRouteResolution?.counts?.unresolved_route_ids ?? null,
    usage_selected_route_resolution_route_link_check_status: usageSelectedRouteResolution?.counts?.route_link_check_status ?? null,
    usage_selected_route_resolution_reader_facing_rows: usageSelectedRouteResolution?.counts?.reader_facing_rows ?? null,
    usage_selected_route_resolution_route_payload_copied_rows: usageSelectedRouteResolution?.counts?.route_payload_copied_rows ?? null,
    usage_selected_route_resolution_route_payload_field_hits: usageSelectedRouteResolution?.counts?.route_payload_field_hits ?? null,
    usage_selected_route_provenance_audit_status: usageSelectedRouteProvenanceAudit?.artifact_type === 'workbench_usage_selected_route_provenance_audit' ? 'present' : 'missing',
    usage_selected_route_provenance_audit_rows: usageSelectedRouteProvenanceAudit?.counts?.route_rows ?? null,
    usage_selected_route_provenance_audit_links: usageSelectedRouteProvenanceAudit?.counts?.selected_route_links ?? null,
    usage_selected_route_provenance_audit_buckets: usageSelectedRouteProvenanceAudit?.counts?.provenance_buckets ?? null,
    usage_selected_route_provenance_audit_unresolved_route_rows: usageSelectedRouteProvenanceAudit?.counts?.unresolved_route_rows ?? null,
    usage_selected_route_provenance_audit_missing_provenance_rows: usageSelectedRouteProvenanceAudit?.counts?.missing_provenance_rows ?? null,
    usage_selected_route_provenance_audit_payload_copied_rows: usageSelectedRouteProvenanceAudit?.counts?.route_payload_copied_rows ?? null,
    usage_selected_route_provenance_audit_samples: usageSelectedRouteProvenanceAudit?.counts?.sample_occurrences ?? null,
    usage_selected_route_provenance_audit_reader_facing_rows: usageSelectedRouteProvenanceAudit?.counts?.reader_facing_rows ?? null,
    usage_selected_route_provenance_audit_route_payload_field_hits: usageSelectedRouteProvenanceAudit?.counts?.route_payload_field_hits ?? null,
    usage_selected_occurrence_navigation_index_status: usageSelectedOccurrenceNavigationIndex?.artifact_type === 'workbench_usage_selected_occurrence_navigation_index' ? 'present' : 'missing',
    usage_selected_occurrence_navigation_rows: usageSelectedOccurrenceNavigationIndex?.counts?.rows ?? null,
    usage_selected_occurrence_navigation_source_refs: usageSelectedOccurrenceNavigationIndex?.counts?.unique_source_refs ?? null,
    usage_selected_occurrence_navigation_work_anchors: usageSelectedOccurrenceNavigationIndex?.counts?.unique_work_anchors ?? null,
    usage_selected_occurrence_navigation_works: usageSelectedOccurrenceNavigationIndex?.counts?.unique_works ?? null,
    usage_selected_occurrence_navigation_frames: usageSelectedOccurrenceNavigationIndex?.counts?.usage_frames ?? null,
    usage_selected_occurrence_navigation_route_ids: usageSelectedOccurrenceNavigationIndex?.counts?.unique_route_ids ?? null,
    usage_selected_occurrence_navigation_provenance_buckets: usageSelectedOccurrenceNavigationIndex?.counts?.provenance_buckets ?? null,
    usage_selected_occurrence_navigation_rows_with_source_link: usageSelectedOccurrenceNavigationIndex?.counts?.rows_with_source_link ?? null,
    usage_selected_occurrence_navigation_rows_with_work_anchor: usageSelectedOccurrenceNavigationIndex?.counts?.rows_with_work_anchor ?? null,
    usage_selected_occurrence_navigation_rows_with_hebrew_context: usageSelectedOccurrenceNavigationIndex?.counts?.rows_with_hebrew_context ?? null,
    usage_selected_occurrence_navigation_rows_with_focus_marker: usageSelectedOccurrenceNavigationIndex?.counts?.rows_with_focus_marker ?? null,
    usage_selected_occurrence_navigation_rows_with_provenance: usageSelectedOccurrenceNavigationIndex?.counts?.rows_with_provenance ?? null,
    usage_selected_occurrence_navigation_collision_member_rows: usageSelectedOccurrenceNavigationIndex?.counts?.collision_member_rows ?? null,
    usage_selected_occurrence_navigation_collision_memberships: usageSelectedOccurrenceNavigationIndex?.counts?.collision_memberships ?? null,
    usage_selected_occurrence_navigation_reader_facing_rows: usageSelectedOccurrenceNavigationIndex?.counts?.reader_facing_rows ?? null,
    usage_selected_occurrence_navigation_route_payload_field_hits: usageSelectedOccurrenceNavigationIndex?.counts?.route_payload_field_hits ?? null,
    usage_selected_navigation_edge_index_status: usageSelectedNavigationEdgeIndex?.artifact_type === 'workbench_usage_selected_navigation_edge_index' ? 'present' : 'missing',
    usage_selected_navigation_edge_rows: usageSelectedNavigationEdgeIndex?.counts?.edges ?? null,
    usage_selected_navigation_edge_source_occurrences: usageSelectedNavigationEdgeIndex?.counts?.unique_source_occurrences ?? null,
    usage_selected_navigation_edge_target_occurrences: usageSelectedNavigationEdgeIndex?.counts?.unique_target_occurrences ?? null,
    usage_selected_navigation_edge_source_refs: usageSelectedNavigationEdgeIndex?.counts?.unique_source_refs ?? null,
    usage_selected_navigation_edge_works: usageSelectedNavigationEdgeIndex?.counts?.unique_works ?? null,
    usage_selected_navigation_edge_frames: usageSelectedNavigationEdgeIndex?.counts?.usage_frames ?? null,
    usage_selected_navigation_edge_route_ids: usageSelectedNavigationEdgeIndex?.counts?.unique_route_ids ?? null,
    usage_selected_navigation_edge_provenance_buckets: usageSelectedNavigationEdgeIndex?.counts?.provenance_buckets ?? null,
    usage_selected_navigation_edge_same_frame_edges: usageSelectedNavigationEdgeIndex?.counts?.same_frame_edges ?? null,
    usage_selected_navigation_edge_bridge_edges: usageSelectedNavigationEdgeIndex?.counts?.bridge_edges ?? null,
    usage_selected_navigation_edge_rows_with_source_context: usageSelectedNavigationEdgeIndex?.counts?.rows_with_source_context ?? null,
    usage_selected_navigation_edge_rows_with_target_context: usageSelectedNavigationEdgeIndex?.counts?.rows_with_target_context ?? null,
    usage_selected_navigation_edge_rows_with_source_link: usageSelectedNavigationEdgeIndex?.counts?.rows_with_source_link ?? null,
    usage_selected_navigation_edge_rows_with_target_link: usageSelectedNavigationEdgeIndex?.counts?.rows_with_target_link ?? null,
    usage_selected_navigation_edge_rows_with_source_provenance: usageSelectedNavigationEdgeIndex?.counts?.rows_with_source_provenance ?? null,
    usage_selected_navigation_edge_rows_with_target_provenance: usageSelectedNavigationEdgeIndex?.counts?.rows_with_target_provenance ?? null,
    usage_selected_navigation_edge_reader_facing_rows: usageSelectedNavigationEdgeIndex?.counts?.reader_facing_rows ?? null,
    usage_selected_navigation_edge_route_payload_field_hits: usageSelectedNavigationEdgeIndex?.counts?.route_payload_field_hits ?? null,
    usage_selected_frame_bridge_index_status: usageSelectedFrameBridgeIndex?.artifact_type === 'workbench_usage_selected_frame_bridge_index' ? 'present' : 'missing',
    usage_selected_frame_bridge_rows: usageSelectedFrameBridgeIndex?.counts?.rows ?? null,
    usage_selected_frame_bridge_edge_memberships: usageSelectedFrameBridgeIndex?.counts?.edge_memberships ?? null,
    usage_selected_frame_bridge_same_frame_rows: usageSelectedFrameBridgeIndex?.counts?.same_frame_rows ?? null,
    usage_selected_frame_bridge_bridge_frame_rows: usageSelectedFrameBridgeIndex?.counts?.bridge_frame_rows ?? null,
    usage_selected_frame_bridge_same_frame_edges: usageSelectedFrameBridgeIndex?.counts?.same_frame_edges ?? null,
    usage_selected_frame_bridge_bridge_frame_edges: usageSelectedFrameBridgeIndex?.counts?.bridge_frame_edges ?? null,
    usage_selected_frame_bridge_route_ids: usageSelectedFrameBridgeIndex?.counts?.unique_route_ids ?? null,
    usage_selected_frame_bridge_provenance_buckets: usageSelectedFrameBridgeIndex?.counts?.provenance_buckets ?? null,
    usage_selected_frame_bridge_sample_rows: usageSelectedFrameBridgeIndex?.counts?.sample_rows ?? null,
    usage_selected_frame_bridge_sample_rows_with_links: usageSelectedFrameBridgeIndex?.counts?.sample_rows_with_links ?? null,
    usage_selected_frame_bridge_sample_rows_with_context: usageSelectedFrameBridgeIndex?.counts?.sample_rows_with_context ?? null,
    usage_selected_frame_bridge_reader_facing_rows: usageSelectedFrameBridgeIndex?.counts?.reader_facing_rows ?? null,
    usage_selected_frame_bridge_route_payload_field_hits: usageSelectedFrameBridgeIndex?.counts?.route_payload_field_hits ?? null,
    usage_selected_occurrence_adjacency_index_status: usageSelectedOccurrenceAdjacencyIndex?.artifact_type === 'workbench_usage_selected_occurrence_adjacency_index' ? 'present' : 'missing',
    usage_selected_occurrence_adjacency_rows: usageSelectedOccurrenceAdjacencyIndex?.counts?.rows ?? null,
    usage_selected_occurrence_adjacency_target_links: usageSelectedOccurrenceAdjacencyIndex?.counts?.target_links ?? null,
    usage_selected_occurrence_adjacency_source_refs: usageSelectedOccurrenceAdjacencyIndex?.counts?.unique_source_refs ?? null,
    usage_selected_occurrence_adjacency_works: usageSelectedOccurrenceAdjacencyIndex?.counts?.unique_works ?? null,
    usage_selected_occurrence_adjacency_frames: usageSelectedOccurrenceAdjacencyIndex?.counts?.usage_frames ?? null,
    usage_selected_occurrence_adjacency_route_ids: usageSelectedOccurrenceAdjacencyIndex?.counts?.unique_route_ids ?? null,
    usage_selected_occurrence_adjacency_provenance_buckets: usageSelectedOccurrenceAdjacencyIndex?.counts?.provenance_buckets ?? null,
    usage_selected_occurrence_adjacency_same_frame_links: usageSelectedOccurrenceAdjacencyIndex?.counts?.same_frame_links ?? null,
    usage_selected_occurrence_adjacency_bridge_frame_links: usageSelectedOccurrenceAdjacencyIndex?.counts?.bridge_frame_links ?? null,
    usage_selected_occurrence_adjacency_rows_with_source_context: usageSelectedOccurrenceAdjacencyIndex?.counts?.rows_with_source_context ?? null,
    usage_selected_occurrence_adjacency_rows_with_source_link: usageSelectedOccurrenceAdjacencyIndex?.counts?.rows_with_source_link ?? null,
    usage_selected_occurrence_adjacency_rows_with_source_provenance: usageSelectedOccurrenceAdjacencyIndex?.counts?.rows_with_source_provenance ?? null,
    usage_selected_occurrence_adjacency_rows_with_complete_targets: usageSelectedOccurrenceAdjacencyIndex?.counts?.rows_with_complete_targets ?? null,
    usage_selected_occurrence_adjacency_target_links_with_context: usageSelectedOccurrenceAdjacencyIndex?.counts?.target_links_with_context ?? null,
    usage_selected_occurrence_adjacency_target_links_with_source_link: usageSelectedOccurrenceAdjacencyIndex?.counts?.target_links_with_source_link ?? null,
    usage_selected_occurrence_adjacency_target_links_with_provenance: usageSelectedOccurrenceAdjacencyIndex?.counts?.target_links_with_provenance ?? null,
    usage_selected_occurrence_adjacency_reader_facing_rows: usageSelectedOccurrenceAdjacencyIndex?.counts?.reader_facing_rows ?? null,
    usage_selected_occurrence_adjacency_route_payload_field_hits: usageSelectedOccurrenceAdjacencyIndex?.counts?.route_payload_field_hits ?? null,
    usage_selected_source_hub_index_status: usageSelectedSourceHubIndex?.artifact_type === 'workbench_usage_selected_source_hub_index' ? 'present' : 'missing',
    usage_selected_source_hub_rows: usageSelectedSourceHubIndex?.counts?.hubs ?? null,
    usage_selected_source_hub_occurrence_rows: usageSelectedSourceHubIndex?.counts?.occurrence_rows ?? null,
    usage_selected_source_hub_target_links: usageSelectedSourceHubIndex?.counts?.target_links ?? null,
    usage_selected_source_hub_source_refs: usageSelectedSourceHubIndex?.counts?.unique_source_refs ?? null,
    usage_selected_source_hub_works: usageSelectedSourceHubIndex?.counts?.unique_works ?? null,
    usage_selected_source_hub_frames: usageSelectedSourceHubIndex?.counts?.usage_frames ?? null,
    usage_selected_source_hub_route_ids: usageSelectedSourceHubIndex?.counts?.unique_route_ids ?? null,
    usage_selected_source_hub_provenance_buckets: usageSelectedSourceHubIndex?.counts?.provenance_buckets ?? null,
    usage_selected_source_hub_same_frame_links: usageSelectedSourceHubIndex?.counts?.same_frame_links ?? null,
    usage_selected_source_hub_bridge_frame_links: usageSelectedSourceHubIndex?.counts?.bridge_frame_links ?? null,
    usage_selected_source_hub_rows_with_source_link: usageSelectedSourceHubIndex?.counts?.rows_with_source_link ?? null,
    usage_selected_source_hub_rows_with_work_anchor: usageSelectedSourceHubIndex?.counts?.rows_with_work_anchor ?? null,
    usage_selected_source_hub_rows_with_marked_context: usageSelectedSourceHubIndex?.counts?.rows_with_marked_context ?? null,
    usage_selected_source_hub_rows_with_provenance: usageSelectedSourceHubIndex?.counts?.rows_with_provenance ?? null,
    usage_selected_source_hub_target_samples_with_links: usageSelectedSourceHubIndex?.counts?.target_samples_with_links ?? null,
    usage_selected_source_hub_target_samples_with_context: usageSelectedSourceHubIndex?.counts?.target_samples_with_context ?? null,
    usage_selected_source_hub_reader_facing_rows: usageSelectedSourceHubIndex?.counts?.reader_facing_rows ?? null,
    usage_selected_source_hub_route_payload_field_hits: usageSelectedSourceHubIndex?.counts?.route_payload_field_hits ?? null,
    usage_selected_focus_context_audit_status: usageSelectedFocusContextAudit?.artifact_type === 'workbench_usage_selected_focus_context_audit' ? 'present' : 'missing',
    usage_selected_focus_context_audit_rows: usageSelectedFocusContextAudit?.counts?.rows ?? null,
    usage_selected_focus_context_audit_focus_marker_rows: usageSelectedFocusContextAudit?.counts?.focus_marker_rows ?? null,
    usage_selected_focus_context_audit_mismatch_rows: usageSelectedFocusContextAudit?.counts?.focus_marker_mismatch_rows ?? null,
    usage_selected_focus_context_audit_repeated_focus_rows: usageSelectedFocusContextAudit?.counts?.repeated_focus_context_rows ?? null,
    usage_selected_focus_context_audit_missing_hebrew_rows: usageSelectedFocusContextAudit?.counts?.missing_hebrew_context_rows ?? null,
    usage_selected_focus_context_audit_reader_facing_rows: usageSelectedFocusContextAudit?.counts?.reader_facing_rows ?? null,
    usage_selected_focus_context_audit_route_payload_field_hits: usageSelectedFocusContextAudit?.counts?.route_payload_field_hits ?? null,
    usage_selected_frame_summary_status: usageSelectedFrameSummary?.artifact_type === 'workbench_usage_selected_frame_summary' ? 'present' : 'missing',
    usage_selected_frame_summary_frames: usageSelectedFrameSummary?.counts?.frames ?? null,
    usage_selected_frame_summary_rows: usageSelectedFrameSummary?.counts?.selected_rows ?? null,
    usage_selected_frame_summary_repeated_focus_rows: usageSelectedFrameSummary?.counts?.repeated_focus_context_rows ?? null,
    usage_selected_frame_summary_samples: usageSelectedFrameSummary?.counts?.sample_occurrences ?? null,
    usage_selected_frame_summary_reader_facing_rows: usageSelectedFrameSummary?.counts?.reader_facing_rows ?? null,
    usage_selected_frame_summary_route_payload_field_hits: usageSelectedFrameSummary?.counts?.route_payload_field_hits ?? null,
    usage_selected_frame_provenance_matrix_status: usageSelectedFrameProvenanceMatrix?.artifact_type === 'workbench_usage_selected_frame_provenance_matrix' ? 'present' : 'missing',
    usage_selected_frame_provenance_matrix_rows: usageSelectedFrameProvenanceMatrix?.counts?.matrix_rows ?? null,
    usage_selected_frame_provenance_matrix_selected_rows: usageSelectedFrameProvenanceMatrix?.counts?.selected_rows ?? null,
    usage_selected_frame_provenance_matrix_frames: usageSelectedFrameProvenanceMatrix?.counts?.frames ?? null,
    usage_selected_frame_provenance_matrix_buckets: usageSelectedFrameProvenanceMatrix?.counts?.provenance_buckets ?? null,
    usage_selected_frame_provenance_matrix_missing_provenance_rows: usageSelectedFrameProvenanceMatrix?.counts?.missing_provenance_rows ?? null,
    usage_selected_frame_provenance_matrix_samples: usageSelectedFrameProvenanceMatrix?.counts?.sample_occurrences ?? null,
    usage_selected_frame_provenance_matrix_reader_facing_rows: usageSelectedFrameProvenanceMatrix?.counts?.reader_facing_rows ?? null,
    usage_selected_frame_provenance_matrix_route_payload_field_hits: usageSelectedFrameProvenanceMatrix?.counts?.route_payload_field_hits ?? null,
    usage_selected_work_frame_matrix_status: usageSelectedWorkFrameMatrix?.artifact_type === 'workbench_usage_selected_work_frame_matrix' ? 'present' : 'missing',
    usage_selected_work_frame_matrix_rows: usageSelectedWorkFrameMatrix?.counts?.matrix_rows ?? null,
    usage_selected_work_frame_matrix_selected_rows: usageSelectedWorkFrameMatrix?.counts?.selected_rows ?? null,
    usage_selected_work_frame_matrix_works: usageSelectedWorkFrameMatrix?.counts?.works ?? null,
    usage_selected_work_frame_matrix_frames: usageSelectedWorkFrameMatrix?.counts?.frames ?? null,
    usage_selected_work_frame_matrix_samples: usageSelectedWorkFrameMatrix?.counts?.sample_occurrences ?? null,
    usage_selected_work_frame_matrix_reader_facing_rows: usageSelectedWorkFrameMatrix?.counts?.reader_facing_rows ?? null,
    usage_selected_work_frame_matrix_route_payload_field_hits: usageSelectedWorkFrameMatrix?.counts?.route_payload_field_hits ?? null,
    usage_selected_qa_package_status: usageSelectedQaPackage?.artifact_type === 'workbench_usage_selected_qa_package' ? 'present' : 'missing',
    usage_selected_qa_package_items: usageSelectedQaPackage?.counts?.package_items ?? null,
    usage_selected_qa_package_selected_rows: usageSelectedQaPackage?.counts?.selected_rows ?? null,
    usage_selected_qa_package_route_ids: usageSelectedQaPackage?.counts?.selected_route_ids ?? null,
    usage_selected_qa_package_unresolved_route_ids: usageSelectedQaPackage?.counts?.unresolved_route_ids ?? null,
    usage_selected_qa_package_route_concentration_warning_visible: usageSelectedQaPackage?.counts?.route_concentration_warning_visible ?? null,
    usage_selected_qa_package_crossmatch_directed_edges: usageSelectedQaPackage?.counts?.crossmatch_directed_edges ?? null,
    usage_selected_qa_package_crossmatch_bridge_edges: usageSelectedQaPackage?.counts?.crossmatch_bridge_edges ?? null,
    usage_selected_qa_package_reader_facing_rows: usageSelectedQaPackage?.counts?.reader_facing_rows ?? null,
    usage_selected_qa_package_route_payload_field_hits: usageSelectedQaPackage?.counts?.route_payload_field_hits ?? null,
    usage_selected_occurrence_lookup_status: usageSelectedOccurrenceLookup?.artifact_type === 'workbench_usage_navigation_selected_occurrence_lookup' ? 'present' : 'missing',
    usage_selected_occurrence_lookup_work_buckets: usageSelectedOccurrenceLookup?.counts?.work_buckets ?? null,
    usage_selected_occurrence_lookup_cluster_buckets: usageSelectedOccurrenceLookup?.counts?.cluster_buckets ?? null,
    usage_selected_occurrence_lookup_status_buckets: usageSelectedOccurrenceLookup?.counts?.status_buckets ?? null,
    usage_crossmatch_links_status: usageCrossmatchLinks?.artifact_type === 'workbench_usage_navigation_crossmatch_links' ? 'present' : 'missing',
    usage_crossmatch_occurrences: usageCrossmatchLinks?.counts?.occurrence_refs ?? null,
    usage_crossmatch_directed_edges: usageCrossmatchLinks?.counts?.directed_edges ?? null,
    usage_crossmatch_undirected_pairs: usageCrossmatchLinks?.counts?.undirected_pairs ?? null,
    usage_crossmatch_strong_edges: usageCrossmatchLinks?.counts?.crossmatch_strength_counts?.strong ?? null,
    usage_crossmatch_moderate_edges: usageCrossmatchLinks?.counts?.crossmatch_strength_counts?.moderate ?? null,
    usage_crossmatch_weak_edges: usageCrossmatchLinks?.counts?.crossmatch_strength_counts?.weak ?? null,
    usage_crossmatch_route_payload_field_hits: usageCrossmatchLinks?.counts?.route_payload_field_hits ?? null,
    usage_crossmatch_bridge_index_status: usageCrossmatchBridgeIndex?.artifact_type === 'workbench_usage_navigation_crossmatch_bridge_index' ? 'present' : 'missing',
    usage_crossmatch_bridge_edges: usageCrossmatchBridgeIndex?.counts?.bridge_edges ?? null,
    usage_crossmatch_same_frame_edges: usageCrossmatchBridgeIndex?.counts?.same_frame_edges ?? null,
    usage_crossmatch_bridge_buckets: usageCrossmatchBridgeIndex?.counts?.bridge_buckets ?? null,
    usage_crossmatch_bridge_route_payload_field_hits: usageCrossmatchBridgeIndex?.counts?.route_payload_field_hits ?? null,
    usage_crossmatch_neighborhoods_status: usageCrossmatchNeighborhoods?.artifact_type === 'workbench_usage_navigation_crossmatch_neighborhoods' ? 'present' : 'missing',
    usage_crossmatch_neighborhoods: usageCrossmatchNeighborhoods?.counts?.neighborhoods ?? null,
    usage_crossmatch_neighborhood_same_frame_links: usageCrossmatchNeighborhoods?.counts?.same_frame_neighbor_links ?? null,
    usage_crossmatch_neighborhood_bridge_links: usageCrossmatchNeighborhoods?.counts?.bridge_neighbor_links ?? null,
    usage_crossmatch_neighborhood_route_payload_field_hits: usageCrossmatchNeighborhoods?.counts?.route_payload_field_hits ?? null,
    usage_concordance_link_check_status: usageConcordanceLinkCheck?.quality?.status ?? null,
    usage_concordance_link_check_source_url_bad: usageConcordanceLinkCheck?.counts?.source_url_bad ?? null,
    usage_concordance_link_check_work_anchor_bad: usageConcordanceLinkCheck?.counts?.work_anchor_bad ?? null,
    usage_concordance_link_check_issue_count: usageConcordanceLinkCheck?.quality?.issue_count ?? null,
    usage_route_link_check_status: usageRouteLinkCheck?.quality?.status ?? null,
    usage_route_link_check_links: usageRouteLinkCheck?.counts?.route_links ?? null,
    usage_route_link_check_resolved: usageRouteLinkCheck?.counts?.route_links_resolved ?? null,
    usage_route_link_check_unresolved: usageRouteLinkCheck?.counts?.route_links_unresolved ?? null,
    usage_route_link_check_metadata_mismatches: usageRouteLinkCheck?.counts?.route_metadata_mismatch ?? null,
    usage_route_link_check_unique_route_ids: usageRouteLinkCheck?.counts?.unique_route_ids ?? null,
    usage_audit_review_rows: usageAuditReview?.counts?.rows ?? null,
    usage_audit_review_ambiguous: usageAuditReview?.counts?.status_counts?.ambiguous ?? 0,
    usage_audit_review_blocked: usageAuditReview?.counts?.status_counts?.blocked ?? 0,
    usage_audit_review_reader_facing: usageAuditReview?.reader_facing_policy?.reader_facing ?? null,
    usage_handoff_index_status: usageHandoffIndex?.artifact_type === 'workbench_usage_navigation_handoff_index' ? 'present' : 'missing',
    usage_handoff_index_smoke_status: usageHandoffIndex?.validation?.smoke_validation_status ?? null,
    public_handoff_integrity_status: publicHandoffIntegrity?.quality?.status ?? null,
    public_handoff_integrity_files: publicHandoffIntegrity?.counts?.files ?? null,
    public_handoff_integrity_matched: publicHandoffIntegrity?.counts?.matched ?? null,
    public_handoff_integrity_missing: publicHandoffIntegrity?.counts?.missing ?? null,
    public_handoff_integrity_mismatched: publicHandoffIntegrity?.counts?.mismatched ?? null,
    public_handoff_integrity_unexpected_present: publicHandoffIntegrity?.counts?.unexpected_present ?? null,
    candidate_artifact_audit_quality_status: artifactAudit?.quality?.status ?? null,
    candidate_artifact_audit_warning_count: Array.isArray(artifactAudit?.quality?.warnings)
      ? artifactAudit.quality.warnings.length
      : null,
    candidate_artifact_audit_broad_queue_blocked: artifactAudit?.quality?.zero_useful_non_smoke_artifacts_block_broad_queue ?? null,
    candidate_artifact_audit_orphan_smoke_review: artifactAudit?.quality?.orphan_smoke_artifacts_require_queue_review ?? null,
    useful_artifacts: artifactAudit?.counts?.useful_artifacts ?? null,
    zero_useful_non_smoke_artifacts: artifactAudit?.counts?.zero_useful_non_smoke_artifacts ?? null,
    orphan_smoke_artifacts: artifactAudit?.counts?.orphan_smoke_artifacts ?? null,
  },
  steps,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Smoke pipeline validation ${failedSteps.length ? 'failed' : 'passed'}; steps ${steps.length}; failed ${failedSteps.length}`);
if (failedSteps.length) process.exitCode = 2;

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--target-queue=')) parsed.targetQueue = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--full-dir=')) parsed.fullDir = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--handoff-root=')) parsed.handoffRoot = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--evidence-dir=')) parsed.evidenceDir = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--scratch-dir=')) parsed.scratchDir = cleanRelativePath(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

async function runStep(name, args) {
  const startedAt = new Date().toISOString();
  const scriptPath = cleanRelativePath(args[0]);
  const scriptArgs = args.slice(1);
  const oldArgv = process.argv;
  const oldExit = process.exit;
  const oldExitCode = process.exitCode;
  const oldConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
  };
  const output = [];
  process.argv = [oldArgv[0] || 'node', scriptPath, ...scriptArgs];
  process.exitCode = 0;
  process.exit = ((code = 0) => {
    throw new ProcessExit(code);
  });
  console.log = (...parts) => output.push(parts.join(' '));
  console.error = (...parts) => output.push(parts.join(' '));
  console.warn = (...parts) => output.push(parts.join(' '));
  try {
    const importUrl = `${pathToFileURL(path.join(root, scriptPath)).href}?smokePipeline=${Date.now()}-${encodeURIComponent(name)}`;
    await import(importUrl);
    const exitCode = Number(process.exitCode || 0);
    if (exitCode !== 0) throw new ProcessExit(exitCode);
    steps.push({
      name,
      status: 'passed',
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      command: ['node', ...args].join(' '),
      output_tail: tailLines(output.join('\n')),
    });
  } catch (error) {
    const exitCode = error instanceof ProcessExit ? error.code : null;
    steps.push({
      name,
      status: 'failed',
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      command: ['node', ...args].join(' '),
      error: exitCode === null ? String(error.message || error) : `exit code ${exitCode}`,
      output_tail: tailLines(output.join('\n')),
    });
  } finally {
    process.argv = oldArgv;
    process.exit = oldExit;
    process.exitCode = oldExitCode;
    console.log = oldConsole.log;
    console.error = oldConsole.error;
    console.warn = oldConsole.warn;
  }
}

class ProcessExit extends Error {
  constructor(code) {
    super(`process.exit(${code})`);
    this.code = Number(code || 0);
  }
}

function readJsonIfExists(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) return null;
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function writeJson(relativePath, data) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Smoke Pipeline Validation',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Steps: ${artifact.counts.steps}`,
    `- Failed steps: ${artifact.counts.failed_steps}`,
    `- Smoke targets: ${artifact.counts.smoke_targets}`,
    `- Smoke counts: supported ${artifact.counts.smoke_supported}, candidate ${artifact.counts.smoke_candidate}, weak ${artifact.counts.smoke_weak}, ambiguous ${artifact.counts.smoke_ambiguous}`,
    `- Missing smoke artifacts: ${artifact.counts.smoke_missing}`,
    `- Zero-useful smoke targets: ${artifact.counts.smoke_zero_useful}`,
    `- Source freshness: ${artifact.counts.source_freshness_status}, count delta ${artifact.counts.source_count_delta}, modified after artifact ${artifact.counts.source_files_modified_after_artifact}`,
    `- Reshit source coverage: ${artifact.counts.covered_source_files}/${artifact.counts.known_nonzero_source_files}, uncovered ${artifact.counts.uncovered_source_files}`,
    `- Handoff coverage: ${artifact.counts.handoff_manifests} manifests, missing targets ${artifact.counts.handoff_missing_targets}`,
    `- Public handoff index: ${artifact.counts.public_handoff_selected_targets} selected, validation failed ${artifact.counts.public_handoff_validation_failed}, eligible ${artifact.counts.public_handoff_reader_facing_eligible_rows}, ambiguous count-only ${artifact.counts.public_handoff_count_only_ambiguous_rows}, zero-useful ${artifact.counts.public_handoff_zero_useful_targets}, ambiguous reader-facing ${artifact.counts.public_handoff_ambiguous_reader_facing ? 'yes' : 'no'}`,
    `- Public handoff quality/license: quality ${artifact.counts.public_handoff_quality_status}, license ${artifact.counts.public_handoff_license_status}, blocked license rows ${artifact.counts.public_handoff_license_blocked_row_count}, blocked licenses ${artifact.counts.public_handoff_license_blocked_licenses}`,
    `- Usage concordance: rows ${artifact.counts.usage_concordance_rows}, supported ${artifact.counts.usage_concordance_supported}, candidate ${artifact.counts.usage_concordance_candidate}, weak ${artifact.counts.usage_concordance_weak}, route-linked ${artifact.counts.usage_concordance_route_linked}, observed-only ${artifact.counts.usage_concordance_observed_only}, audit-only ambiguous ${artifact.counts.usage_concordance_audit_only_ambiguous}, ambiguous reader-facing ${artifact.counts.usage_concordance_ambiguous_reader_facing ? 'yes' : 'no'}`,
    `- Usage concordance manifest: ${artifact.counts.usage_concordance_manifest_status}, JSON tracked ${artifact.counts.usage_concordance_manifest_json_tracked ? 'yes' : 'no'}, report tracked ${artifact.counts.usage_concordance_manifest_report_tracked ? 'yes' : 'no'}`,
    `- Usage cluster index: ${artifact.counts.usage_cluster_index_status}, clusters ${artifact.counts.usage_cluster_index_clusters}, rows ${artifact.counts.usage_cluster_index_rows}`,
    `- Usage route coverage: ${artifact.counts.usage_route_coverage_status}, route IDs ${artifact.counts.usage_route_coverage_route_ids}, links ${artifact.counts.usage_route_coverage_links}`,
    `- Usage sample index: ${artifact.counts.usage_sample_index_status}, samples ${artifact.counts.usage_sample_index_samples}, clusters ${artifact.counts.usage_sample_index_clusters}`,
    `- Usage lookup index: ${artifact.counts.usage_lookup_index_status}, occurrence refs ${artifact.counts.usage_lookup_index_occurrence_refs}, works ${artifact.counts.usage_lookup_index_works}`,
    `- Usage work/frame matrix: ${artifact.counts.usage_work_frame_matrix_status}, rows ${artifact.counts.usage_work_frame_matrix_rows}, works ${artifact.counts.usage_work_frame_matrix_works}, categories ${artifact.counts.usage_work_frame_matrix_categories}, clusters ${artifact.counts.usage_work_frame_matrix_clusters}, route payload hits ${artifact.counts.usage_work_frame_matrix_route_payload_field_hits}`,
    `- Usage search rows: ${artifact.counts.usage_search_rows_status}, rows ${artifact.counts.usage_search_rows}, works ${artifact.counts.usage_search_rows_works}, categories ${artifact.counts.usage_search_rows_categories}, clusters ${artifact.counts.usage_search_rows_clusters}, route payload hits ${artifact.counts.usage_search_rows_route_payload_field_hits}`,
    `- Usage provenance: ${artifact.counts.usage_provenance_index_status}, rows ${artifact.counts.usage_provenance_rows}, licenses ${artifact.counts.usage_provenance_licenses}, version sources ${artifact.counts.usage_provenance_version_sources}, license metadata ${artifact.counts.usage_provenance_rows_with_license_metadata}, source links ${artifact.counts.usage_provenance_rows_with_source_links}, version metadata ${artifact.counts.usage_provenance_rows_with_version_metadata}, unsafe license rows ${artifact.counts.usage_provenance_unsafe_license_rows}, route payload hits ${artifact.counts.usage_provenance_route_payload_field_hits}`,
    `- Usage search shard index: ${artifact.counts.usage_search_shard_index_status}, shards ${artifact.counts.usage_search_shard_index_shards}, rows ${artifact.counts.usage_search_shard_index_rows}, categories ${artifact.counts.usage_search_shard_index_categories}, clusters ${artifact.counts.usage_search_shard_index_clusters}, statuses ${artifact.counts.usage_search_shard_index_statuses}, route payload hits ${artifact.counts.usage_search_shard_index_route_payload_field_hits}`,
    `- Usage refresh priority: ${artifact.counts.usage_refresh_priority_index_status}, pending ${artifact.counts.usage_refresh_priority_pending_files}, known-use candidates ${artifact.counts.usage_refresh_priority_known_usage_candidates}, review-only ${artifact.counts.usage_refresh_priority_review_only_not_promoted}, promoted ${artifact.counts.usage_refresh_priority_promoted_run_targets}, blocked broad refresh files ${artifact.counts.usage_refresh_priority_blocked_broad_refresh_files}, route payload hits ${artifact.counts.usage_refresh_priority_route_payload_field_hits}`,
    `- Usage unit density: ${artifact.counts.usage_unit_density_index_status}, units ${artifact.counts.usage_unit_density_units}, rows ${artifact.counts.usage_unit_density_rows}, multi-occurrence units ${artifact.counts.usage_unit_density_multi_occurrence_units}, max occurrences per unit ${artifact.counts.usage_unit_density_max_occurrences_per_unit}, works ${artifact.counts.usage_unit_density_works}, route payload hits ${artifact.counts.usage_unit_density_route_payload_field_hits}`,
    `- Usage phrase recurrence: ${artifact.counts.usage_phrase_recurrence_index_status}, rows ${artifact.counts.usage_phrase_recurrence_rows}, n-gram instances ${artifact.counts.usage_phrase_recurrence_ngram_instances}, recurring groups ${artifact.counts.usage_phrase_recurrence_recurring_groups}, rows with recurring groups ${artifact.counts.usage_phrase_recurrence_rows_with_recurring_groups}, skipped rows without focus ${artifact.counts.usage_phrase_recurrence_skipped_rows_without_focus}, route payload hits ${artifact.counts.usage_phrase_recurrence_route_payload_field_hits}`,
    `- Usage context offset: ${artifact.counts.usage_context_offset_index_status}, rows ${artifact.counts.usage_context_offset_rows}, rows with context ${artifact.counts.usage_context_offset_rows_with_context}, token observations ${artifact.counts.usage_context_offset_token_observations}, immediate neighbor observations ${artifact.counts.usage_context_offset_immediate_neighbor_observations}, offsets ${artifact.counts.usage_context_offset_offsets}, token buckets ${artifact.counts.usage_context_offset_token_buckets}, skipped rows without focus ${artifact.counts.usage_context_offset_skipped_rows_without_focus}, route payload hits ${artifact.counts.usage_context_offset_route_payload_field_hits}`,
    `- Usage context signature: ${artifact.counts.usage_context_signature_index_status}, rows ${artifact.counts.usage_context_signature_rows}, rows with signatures ${artifact.counts.usage_context_signature_rows_with_signatures}, windows ${artifact.counts.usage_context_signature_windows}, groups ${artifact.counts.usage_context_signature_groups_all}, recurring groups ${artifact.counts.usage_context_signature_recurring_groups}, rows with recurring signatures ${artifact.counts.usage_context_signature_rows_with_recurring_signatures}, cross-cluster groups ${artifact.counts.usage_context_signature_cross_cluster_groups}, skipped rows without focus ${artifact.counts.usage_context_signature_skipped_rows_without_focus}, route payload hits ${artifact.counts.usage_context_signature_route_payload_field_hits}`,
    `- Usage context signature lookup: ${artifact.counts.usage_context_signature_lookup_status}, occurrences ${artifact.counts.usage_context_signature_lookup_occurrence_refs}, memberships ${artifact.counts.usage_context_signature_lookup_memberships}, recurring memberships ${artifact.counts.usage_context_signature_lookup_recurring_memberships}, occurrences with recurring ${artifact.counts.usage_context_signature_lookup_occurrences_with_recurring}, cross-cluster memberships ${artifact.counts.usage_context_signature_lookup_cross_cluster_memberships}, occurrences with cross-cluster ${artifact.counts.usage_context_signature_lookup_occurrences_with_cross_cluster}, unmatched occurrence IDs ${artifact.counts.usage_context_signature_lookup_unmatched_occurrence_ids}, route payload hits ${artifact.counts.usage_context_signature_lookup_route_payload_field_hits}`,
    `- Usage context signature contrast: ${artifact.counts.usage_context_signature_contrast_status}, cross-cluster groups ${artifact.counts.usage_context_signature_contrast_groups}, occurrence refs ${artifact.counts.usage_context_signature_contrast_occurrence_refs}, reader-facing rows ${artifact.counts.usage_context_signature_contrast_reader_facing_rows}, route payload hits ${artifact.counts.usage_context_signature_contrast_route_payload_field_hits}`,
    `- Usage selected slice: ${artifact.counts.usage_selected_slice_status}, id ${artifact.counts.usage_selected_slice_id}, rows ${artifact.counts.usage_selected_slice_rows}, works ${artifact.counts.usage_selected_slice_works}`,
    `- Usage selected slices index: ${artifact.counts.usage_selected_slices_index_status}, slices ${artifact.counts.usage_selected_slices_index_slices}, rows ${artifact.counts.usage_selected_slices_index_rows}, unique occurrences ${artifact.counts.usage_selected_slices_index_unique_occurrences}, duplicate rows ${artifact.counts.usage_selected_slices_index_duplicate_rows}`,
    `- Usage selected occurrences: ${artifact.counts.usage_selected_occurrences_status}, rows ${artifact.counts.usage_selected_occurrence_rows}, memberships ${artifact.counts.usage_selected_occurrence_memberships}, duplicate memberships ${artifact.counts.usage_selected_occurrence_duplicate_memberships}`,
    `- Usage selected signature independence: ${artifact.counts.usage_selected_signature_independence_status}, rows ${artifact.counts.usage_selected_signature_independence_rows}, memberships ${artifact.counts.usage_selected_signature_independence_memberships}, recurring memberships ${artifact.counts.usage_selected_signature_independence_recurring_memberships}, cross-cluster memberships ${artifact.counts.usage_selected_signature_independence_cross_cluster_memberships}, rows with recurring ${artifact.counts.usage_selected_signature_independence_rows_with_recurring}, rows with cross-cluster ${artifact.counts.usage_selected_signature_independence_rows_with_cross_cluster}, missing lookup rows ${artifact.counts.usage_selected_signature_independence_missing_lookup_rows}, reader-facing rows ${artifact.counts.usage_selected_signature_independence_reader_facing_rows}, route payload hits ${artifact.counts.usage_selected_signature_independence_route_payload_field_hits}`,
    `- Usage selected source diversity: ${artifact.counts.usage_selected_source_diversity_status}, rows ${artifact.counts.usage_selected_source_diversity_rows}, source refs ${artifact.counts.usage_selected_source_diversity_unique_source_refs}, work anchors ${artifact.counts.usage_selected_source_diversity_unique_work_anchors}, works ${artifact.counts.usage_selected_source_diversity_unique_works}, categories ${artifact.counts.usage_selected_source_diversity_unique_categories}, licenses ${artifact.counts.usage_selected_source_diversity_unique_licenses}, version sources ${artifact.counts.usage_selected_source_diversity_unique_version_sources}, duplicate source-ref buckets ${artifact.counts.usage_selected_source_diversity_duplicate_source_ref_buckets}, duplicate source-ref rows ${artifact.counts.usage_selected_source_diversity_duplicate_source_ref_rows}, missing signature rows ${artifact.counts.usage_selected_source_diversity_missing_signature_rows}, reader-facing rows ${artifact.counts.usage_selected_source_diversity_reader_facing_rows}, route payload hits ${artifact.counts.usage_selected_source_diversity_route_payload_field_hits}`,
    `- Usage selected provenance matrix: ${artifact.counts.usage_selected_provenance_matrix_status}, buckets ${artifact.counts.usage_selected_provenance_matrix_buckets}, rows ${artifact.counts.usage_selected_provenance_matrix_rows}, licenses ${artifact.counts.usage_selected_provenance_matrix_licenses}, version sources ${artifact.counts.usage_selected_provenance_matrix_version_sources}, license metadata rows ${artifact.counts.usage_selected_provenance_matrix_rows_with_license_metadata}, version metadata rows ${artifact.counts.usage_selected_provenance_matrix_rows_with_version_metadata}, missing or unrecognized license rows ${artifact.counts.usage_selected_provenance_matrix_missing_or_unrecognized_license_rows}, samples ${artifact.counts.usage_selected_provenance_matrix_samples}, reader-facing rows ${artifact.counts.usage_selected_provenance_matrix_reader_facing_rows}, route payload hits ${artifact.counts.usage_selected_provenance_matrix_route_payload_field_hits}`,
    `- Usage selected collision audit: ${artifact.counts.usage_selected_collision_audit_status}, buckets ${artifact.counts.usage_selected_collision_audit_buckets}, occurrence rows ${artifact.counts.usage_selected_collision_audit_occurrence_rows}, duplicate source-ref buckets ${artifact.counts.usage_selected_collision_audit_duplicate_source_ref_buckets}, duplicate work-anchor buckets ${artifact.counts.usage_selected_collision_audit_duplicate_work_anchor_buckets}, cross-frame buckets ${artifact.counts.usage_selected_collision_audit_cross_frame_buckets}, cross-frame rows ${artifact.counts.usage_selected_collision_audit_cross_frame_rows}, reader-facing rows ${artifact.counts.usage_selected_collision_audit_reader_facing_rows}, route payload hits ${artifact.counts.usage_selected_collision_audit_route_payload_field_hits}`,
    `- Usage selected collision/provenance audit: ${artifact.counts.usage_selected_collision_provenance_audit_status}, buckets ${artifact.counts.usage_selected_collision_provenance_audit_buckets}, occurrence rows ${artifact.counts.usage_selected_collision_provenance_audit_occurrence_rows}, provenance buckets ${artifact.counts.usage_selected_collision_provenance_audit_provenance_buckets}, frame/provenance buckets ${artifact.counts.usage_selected_collision_provenance_audit_frame_provenance_buckets}, missing provenance rows ${artifact.counts.usage_selected_collision_provenance_audit_missing_provenance_rows}, missing frame/provenance rows ${artifact.counts.usage_selected_collision_provenance_audit_missing_frame_provenance_rows}, samples ${artifact.counts.usage_selected_collision_provenance_audit_samples}, reader-facing rows ${artifact.counts.usage_selected_collision_provenance_audit_reader_facing_rows}, route payload hits ${artifact.counts.usage_selected_collision_provenance_audit_route_payload_field_hits}`,
    `- Usage selected route concentration response: ${artifact.counts.usage_selected_route_concentration_response_status}, rows ${artifact.counts.usage_selected_route_concentration_response_rows}, route buckets ${artifact.counts.usage_selected_route_concentration_response_route_buckets}, warning visible ${artifact.counts.usage_selected_route_concentration_response_warning_visible}, source refs ${artifact.counts.usage_selected_route_concentration_response_unique_source_refs}, works ${artifact.counts.usage_selected_route_concentration_response_unique_works}, rows with recurring ${artifact.counts.usage_selected_route_concentration_response_rows_with_recurring}, rows with cross-cluster ${artifact.counts.usage_selected_route_concentration_response_rows_with_cross_cluster}, warnings ${artifact.counts.usage_selected_route_concentration_response_warning_count}, reader-facing rows ${artifact.counts.usage_selected_route_concentration_response_reader_facing_rows}, route payload hits ${artifact.counts.usage_selected_route_concentration_response_route_payload_field_hits}`,
    `- Usage selected occurrence cards: ${artifact.counts.usage_selected_occurrence_cards_status}, rows ${artifact.counts.usage_selected_occurrence_cards_rows}, context ${artifact.counts.usage_selected_occurrence_cards_with_context}, focus markers ${artifact.counts.usage_selected_occurrence_cards_with_focus_marker}, related signature rows ${artifact.counts.usage_selected_occurrence_cards_with_related_signatures}, cross-cluster rows ${artifact.counts.usage_selected_occurrence_cards_with_cross_cluster_signatures}, related samples ${artifact.counts.usage_selected_occurrence_cards_related_occurrence_samples}, route warning visible ${artifact.counts.usage_selected_occurrence_cards_route_concentration_warning_visible}, mojibake rows ${artifact.counts.usage_selected_occurrence_cards_mojibake_rows}, reader-facing rows ${artifact.counts.usage_selected_occurrence_cards_reader_facing_rows}, route payload hits ${artifact.counts.usage_selected_occurrence_cards_route_payload_field_hits}`,
    `- Usage selected route resolution: ${artifact.counts.usage_selected_route_resolution_status}, route IDs ${artifact.counts.usage_selected_route_resolution_route_id_buckets}, selected links ${artifact.counts.usage_selected_route_resolution_selected_route_links}, resolved ${artifact.counts.usage_selected_route_resolution_resolved_route_ids}, unresolved ${artifact.counts.usage_selected_route_resolution_unresolved_route_ids}, route-link check ${artifact.counts.usage_selected_route_resolution_route_link_check_status}, reader-facing rows ${artifact.counts.usage_selected_route_resolution_reader_facing_rows}, copied payload rows ${artifact.counts.usage_selected_route_resolution_route_payload_copied_rows}, route payload hits ${artifact.counts.usage_selected_route_resolution_route_payload_field_hits}`,
    `- Usage selected route/provenance audit: ${artifact.counts.usage_selected_route_provenance_audit_status}, rows ${artifact.counts.usage_selected_route_provenance_audit_rows}, links ${artifact.counts.usage_selected_route_provenance_audit_links}, provenance buckets ${artifact.counts.usage_selected_route_provenance_audit_buckets}, unresolved route rows ${artifact.counts.usage_selected_route_provenance_audit_unresolved_route_rows}, missing provenance rows ${artifact.counts.usage_selected_route_provenance_audit_missing_provenance_rows}, copied payload rows ${artifact.counts.usage_selected_route_provenance_audit_payload_copied_rows}, samples ${artifact.counts.usage_selected_route_provenance_audit_samples}, reader-facing rows ${artifact.counts.usage_selected_route_provenance_audit_reader_facing_rows}, route payload hits ${artifact.counts.usage_selected_route_provenance_audit_route_payload_field_hits}`,
    `- Usage selected occurrence navigation index: ${artifact.counts.usage_selected_occurrence_navigation_index_status}, rows ${artifact.counts.usage_selected_occurrence_navigation_rows}, source refs ${artifact.counts.usage_selected_occurrence_navigation_source_refs}, work anchors ${artifact.counts.usage_selected_occurrence_navigation_work_anchors}, works ${artifact.counts.usage_selected_occurrence_navigation_works}, frames ${artifact.counts.usage_selected_occurrence_navigation_frames}, route IDs ${artifact.counts.usage_selected_occurrence_navigation_route_ids}, provenance buckets ${artifact.counts.usage_selected_occurrence_navigation_provenance_buckets}, collision memberships ${artifact.counts.usage_selected_occurrence_navigation_collision_memberships}, reader-facing rows ${artifact.counts.usage_selected_occurrence_navigation_reader_facing_rows}, route payload hits ${artifact.counts.usage_selected_occurrence_navigation_route_payload_field_hits}`,
    `- Usage selected navigation edge index: ${artifact.counts.usage_selected_navigation_edge_index_status}, edges ${artifact.counts.usage_selected_navigation_edge_rows}, source occurrences ${artifact.counts.usage_selected_navigation_edge_source_occurrences}, target occurrences ${artifact.counts.usage_selected_navigation_edge_target_occurrences}, source refs ${artifact.counts.usage_selected_navigation_edge_source_refs}, works ${artifact.counts.usage_selected_navigation_edge_works}, frames ${artifact.counts.usage_selected_navigation_edge_frames}, route IDs ${artifact.counts.usage_selected_navigation_edge_route_ids}, provenance buckets ${artifact.counts.usage_selected_navigation_edge_provenance_buckets}, same-frame ${artifact.counts.usage_selected_navigation_edge_same_frame_edges}, bridge ${artifact.counts.usage_selected_navigation_edge_bridge_edges}, reader-facing rows ${artifact.counts.usage_selected_navigation_edge_reader_facing_rows}, route payload hits ${artifact.counts.usage_selected_navigation_edge_route_payload_field_hits}`,
    `- Usage selected navigation edge completeness: source context ${artifact.counts.usage_selected_navigation_edge_rows_with_source_context}, target context ${artifact.counts.usage_selected_navigation_edge_rows_with_target_context}, source links ${artifact.counts.usage_selected_navigation_edge_rows_with_source_link}, target links ${artifact.counts.usage_selected_navigation_edge_rows_with_target_link}, source provenance ${artifact.counts.usage_selected_navigation_edge_rows_with_source_provenance}, target provenance ${artifact.counts.usage_selected_navigation_edge_rows_with_target_provenance}`,
    `- Usage selected frame bridge index: ${artifact.counts.usage_selected_frame_bridge_index_status}, rows ${artifact.counts.usage_selected_frame_bridge_rows}, edge memberships ${artifact.counts.usage_selected_frame_bridge_edge_memberships}, same-frame rows ${artifact.counts.usage_selected_frame_bridge_same_frame_rows}, bridge rows ${artifact.counts.usage_selected_frame_bridge_bridge_frame_rows}, same-frame edges ${artifact.counts.usage_selected_frame_bridge_same_frame_edges}, bridge edges ${artifact.counts.usage_selected_frame_bridge_bridge_frame_edges}, route IDs ${artifact.counts.usage_selected_frame_bridge_route_ids}, provenance buckets ${artifact.counts.usage_selected_frame_bridge_provenance_buckets}, sample rows ${artifact.counts.usage_selected_frame_bridge_sample_rows}, reader-facing rows ${artifact.counts.usage_selected_frame_bridge_reader_facing_rows}, route payload hits ${artifact.counts.usage_selected_frame_bridge_route_payload_field_hits}`,
    `- Usage selected frame bridge samples: with links ${artifact.counts.usage_selected_frame_bridge_sample_rows_with_links}, with context ${artifact.counts.usage_selected_frame_bridge_sample_rows_with_context}`,
    `- Usage selected occurrence adjacency index: ${artifact.counts.usage_selected_occurrence_adjacency_index_status}, rows ${artifact.counts.usage_selected_occurrence_adjacency_rows}, target links ${artifact.counts.usage_selected_occurrence_adjacency_target_links}, source refs ${artifact.counts.usage_selected_occurrence_adjacency_source_refs}, works ${artifact.counts.usage_selected_occurrence_adjacency_works}, frames ${artifact.counts.usage_selected_occurrence_adjacency_frames}, route IDs ${artifact.counts.usage_selected_occurrence_adjacency_route_ids}, provenance buckets ${artifact.counts.usage_selected_occurrence_adjacency_provenance_buckets}, same-frame ${artifact.counts.usage_selected_occurrence_adjacency_same_frame_links}, bridge ${artifact.counts.usage_selected_occurrence_adjacency_bridge_frame_links}, reader-facing rows ${artifact.counts.usage_selected_occurrence_adjacency_reader_facing_rows}, route payload hits ${artifact.counts.usage_selected_occurrence_adjacency_route_payload_field_hits}`,
    `- Usage selected occurrence adjacency completeness: source context ${artifact.counts.usage_selected_occurrence_adjacency_rows_with_source_context}, source links ${artifact.counts.usage_selected_occurrence_adjacency_rows_with_source_link}, source provenance ${artifact.counts.usage_selected_occurrence_adjacency_rows_with_source_provenance}, complete target rows ${artifact.counts.usage_selected_occurrence_adjacency_rows_with_complete_targets}, target context ${artifact.counts.usage_selected_occurrence_adjacency_target_links_with_context}, target links ${artifact.counts.usage_selected_occurrence_adjacency_target_links_with_source_link}, target provenance ${artifact.counts.usage_selected_occurrence_adjacency_target_links_with_provenance}`,
    `- Usage selected source hub index: ${artifact.counts.usage_selected_source_hub_index_status}, rows ${artifact.counts.usage_selected_source_hub_rows}, occurrence rows ${artifact.counts.usage_selected_source_hub_occurrence_rows}, target links ${artifact.counts.usage_selected_source_hub_target_links}, source refs ${artifact.counts.usage_selected_source_hub_source_refs}, works ${artifact.counts.usage_selected_source_hub_works}, frames ${artifact.counts.usage_selected_source_hub_frames}, route IDs ${artifact.counts.usage_selected_source_hub_route_ids}, provenance buckets ${artifact.counts.usage_selected_source_hub_provenance_buckets}, same-frame ${artifact.counts.usage_selected_source_hub_same_frame_links}, bridge ${artifact.counts.usage_selected_source_hub_bridge_frame_links}, reader-facing rows ${artifact.counts.usage_selected_source_hub_reader_facing_rows}, route payload hits ${artifact.counts.usage_selected_source_hub_route_payload_field_hits}`,
    `- Usage selected source hub completeness: source links ${artifact.counts.usage_selected_source_hub_rows_with_source_link}, work anchors ${artifact.counts.usage_selected_source_hub_rows_with_work_anchor}, marked context ${artifact.counts.usage_selected_source_hub_rows_with_marked_context}, provenance ${artifact.counts.usage_selected_source_hub_rows_with_provenance}, target sample links ${artifact.counts.usage_selected_source_hub_target_samples_with_links}, target sample context ${artifact.counts.usage_selected_source_hub_target_samples_with_context}`,
    `- Usage selected focus/context audit: ${artifact.counts.usage_selected_focus_context_audit_status}, rows ${artifact.counts.usage_selected_focus_context_audit_rows}, focus marker rows ${artifact.counts.usage_selected_focus_context_audit_focus_marker_rows}, mismatches ${artifact.counts.usage_selected_focus_context_audit_mismatch_rows}, repeated-focus rows ${artifact.counts.usage_selected_focus_context_audit_repeated_focus_rows}, missing Hebrew context rows ${artifact.counts.usage_selected_focus_context_audit_missing_hebrew_rows}, reader-facing rows ${artifact.counts.usage_selected_focus_context_audit_reader_facing_rows}, route payload hits ${artifact.counts.usage_selected_focus_context_audit_route_payload_field_hits}`,
    `- Usage selected frame summary: ${artifact.counts.usage_selected_frame_summary_status}, frames ${artifact.counts.usage_selected_frame_summary_frames}, rows ${artifact.counts.usage_selected_frame_summary_rows}, repeated-focus rows ${artifact.counts.usage_selected_frame_summary_repeated_focus_rows}, samples ${artifact.counts.usage_selected_frame_summary_samples}, reader-facing rows ${artifact.counts.usage_selected_frame_summary_reader_facing_rows}, route payload hits ${artifact.counts.usage_selected_frame_summary_route_payload_field_hits}`,
    `- Usage selected frame/provenance matrix: ${artifact.counts.usage_selected_frame_provenance_matrix_status}, rows ${artifact.counts.usage_selected_frame_provenance_matrix_rows}, selected rows ${artifact.counts.usage_selected_frame_provenance_matrix_selected_rows}, frames ${artifact.counts.usage_selected_frame_provenance_matrix_frames}, provenance buckets ${artifact.counts.usage_selected_frame_provenance_matrix_buckets}, missing provenance rows ${artifact.counts.usage_selected_frame_provenance_matrix_missing_provenance_rows}, samples ${artifact.counts.usage_selected_frame_provenance_matrix_samples}, reader-facing rows ${artifact.counts.usage_selected_frame_provenance_matrix_reader_facing_rows}, route payload hits ${artifact.counts.usage_selected_frame_provenance_matrix_route_payload_field_hits}`,
    `- Usage selected work/frame matrix: ${artifact.counts.usage_selected_work_frame_matrix_status}, rows ${artifact.counts.usage_selected_work_frame_matrix_rows}, selected rows ${artifact.counts.usage_selected_work_frame_matrix_selected_rows}, works ${artifact.counts.usage_selected_work_frame_matrix_works}, frames ${artifact.counts.usage_selected_work_frame_matrix_frames}, samples ${artifact.counts.usage_selected_work_frame_matrix_samples}, reader-facing rows ${artifact.counts.usage_selected_work_frame_matrix_reader_facing_rows}, route payload hits ${artifact.counts.usage_selected_work_frame_matrix_route_payload_field_hits}`,
    `- Usage selected QA package: ${artifact.counts.usage_selected_qa_package_status}, items ${artifact.counts.usage_selected_qa_package_items}, rows ${artifact.counts.usage_selected_qa_package_selected_rows}, route IDs ${artifact.counts.usage_selected_qa_package_route_ids}, unresolved routes ${artifact.counts.usage_selected_qa_package_unresolved_route_ids}, route warning visible ${artifact.counts.usage_selected_qa_package_route_concentration_warning_visible}, directed edges ${artifact.counts.usage_selected_qa_package_crossmatch_directed_edges}, bridge edges ${artifact.counts.usage_selected_qa_package_crossmatch_bridge_edges}, reader-facing rows ${artifact.counts.usage_selected_qa_package_reader_facing_rows}, route payload hits ${artifact.counts.usage_selected_qa_package_route_payload_field_hits}`,
    `- Usage selected occurrence lookup: ${artifact.counts.usage_selected_occurrence_lookup_status}, work buckets ${artifact.counts.usage_selected_occurrence_lookup_work_buckets}, cluster buckets ${artifact.counts.usage_selected_occurrence_lookup_cluster_buckets}, status buckets ${artifact.counts.usage_selected_occurrence_lookup_status_buckets}`,
    `- Usage crossmatch links: ${artifact.counts.usage_crossmatch_links_status}, occurrences ${artifact.counts.usage_crossmatch_occurrences}, directed edges ${artifact.counts.usage_crossmatch_directed_edges}, undirected pairs ${artifact.counts.usage_crossmatch_undirected_pairs}, route payload hits ${artifact.counts.usage_crossmatch_route_payload_field_hits}`,
    `- Usage crossmatch strengths: strong ${artifact.counts.usage_crossmatch_strong_edges}, moderate ${artifact.counts.usage_crossmatch_moderate_edges}, weak ${artifact.counts.usage_crossmatch_weak_edges}`,
    `- Usage crossmatch bridge index: ${artifact.counts.usage_crossmatch_bridge_index_status}, bridge edges ${artifact.counts.usage_crossmatch_bridge_edges}, same-frame edges ${artifact.counts.usage_crossmatch_same_frame_edges}, bridge buckets ${artifact.counts.usage_crossmatch_bridge_buckets}, route payload hits ${artifact.counts.usage_crossmatch_bridge_route_payload_field_hits}`,
    `- Usage crossmatch neighborhoods: ${artifact.counts.usage_crossmatch_neighborhoods_status}, neighborhoods ${artifact.counts.usage_crossmatch_neighborhoods}, same-frame links ${artifact.counts.usage_crossmatch_neighborhood_same_frame_links}, bridge links ${artifact.counts.usage_crossmatch_neighborhood_bridge_links}, route payload hits ${artifact.counts.usage_crossmatch_neighborhood_route_payload_field_hits}`,
    `- Usage concordance link check: ${artifact.counts.usage_concordance_link_check_status}, source URL bad ${artifact.counts.usage_concordance_link_check_source_url_bad}, work anchor bad ${artifact.counts.usage_concordance_link_check_work_anchor_bad}, issues ${artifact.counts.usage_concordance_link_check_issue_count}`,
    `- Usage route link check: ${artifact.counts.usage_route_link_check_status}, links ${artifact.counts.usage_route_link_check_links}, resolved ${artifact.counts.usage_route_link_check_resolved}, unresolved ${artifact.counts.usage_route_link_check_unresolved}, metadata mismatches ${artifact.counts.usage_route_link_check_metadata_mismatches}, unique route IDs ${artifact.counts.usage_route_link_check_unique_route_ids}`,
    `- Usage audit-only review: rows ${artifact.counts.usage_audit_review_rows}, ambiguous ${artifact.counts.usage_audit_review_ambiguous}, blocked ${artifact.counts.usage_audit_review_blocked}, reader-facing ${artifact.counts.usage_audit_review_reader_facing ? 'yes' : 'no'}`,
    `- Usage handoff index: ${artifact.counts.usage_handoff_index_status}, smoke ${artifact.counts.usage_handoff_index_smoke_status}`,
    `- Public handoff integrity: ${artifact.counts.public_handoff_integrity_status}, files ${artifact.counts.public_handoff_integrity_files}, matched ${artifact.counts.public_handoff_integrity_matched}, missing ${artifact.counts.public_handoff_integrity_missing}, mismatched ${artifact.counts.public_handoff_integrity_mismatched}, unexpected ${artifact.counts.public_handoff_integrity_unexpected_present}`,
    `- Candidate artifact audit quality: ${artifact.counts.candidate_artifact_audit_quality_status}, warnings ${artifact.counts.candidate_artifact_audit_warning_count}, broad queue blocked ${artifact.counts.candidate_artifact_audit_broad_queue_blocked ? 'yes' : 'no'}, orphan smoke review ${artifact.counts.candidate_artifact_audit_orphan_smoke_review ? 'yes' : 'no'}`,
    `- Candidate artifact audit: useful ${artifact.counts.useful_artifacts}, zero-useful non-smoke ${artifact.counts.zero_useful_non_smoke_artifacts}, orphan smoke ${artifact.counts.orphan_smoke_artifacts}`,
    '',
    '## Steps',
    '',
    '| step | status | output |',
    '|---|---|---|',
    ...artifact.steps.map((step) => `| ${mdCell(step.name)} | ${step.status} | ${mdCell(step.output_tail || step.error || '')} |`),
    '',
    '## Boundary',
    '',
    'This wrapper validates smoke-only workbench evidence, the public handoff index contract, and the usage-navigation concordance. It does not run broad target selection, expand prefix families, import source text, rank routes, make ambiguous rows reader-facing, or choose HUD winners.',
  ];
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${lines.join('\n')}\n`, 'utf8');
}

function tailLines(value, maxLines = 4) {
  return String(value || '')
    .split(/\r?\n/)
    .filter(Boolean)
    .slice(-maxLines)
    .join(' / ');
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function valueAfterEquals(arg) {
  return arg.split('=').slice(1).join('=');
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}
