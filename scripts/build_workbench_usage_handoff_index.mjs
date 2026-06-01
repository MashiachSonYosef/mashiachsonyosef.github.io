#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  manifest: 'data/workbench-evidence/usage-concordance-manifest.json',
  occurrenceLinkCheck: '.local-cache/workbench-evidence/usage-concordance-link-check.json',
  routeLinkCheck: '.local-cache/workbench-evidence/usage-route-link-check.json',
  auditReview: '.local-cache/workbench-evidence/usage-audit-only-review.json',
  clusterIndex: '.local-cache/workbench-evidence/usage-cluster-index.json',
  routeCoverage: '.local-cache/workbench-evidence/usage-route-coverage.json',
  sampleIndex: '.local-cache/workbench-evidence/usage-sample-index.json',
  lookupIndex: '.local-cache/workbench-evidence/usage-lookup-index.json',
  workFrameMatrix: '.local-cache/workbench-evidence/usage-work-frame-matrix.json',
  searchRows: '.local-cache/workbench-evidence/usage-search-rows.json',
  provenanceIndex: '.local-cache/workbench-evidence/usage-provenance-index.json',
  searchShardIndex: '.local-cache/workbench-evidence/usage-search-shard-index.json',
  refreshPriorityIndex: '.local-cache/workbench-evidence/usage-refresh-priority-index.json',
  unitDensityIndex: '.local-cache/workbench-evidence/usage-unit-density-index.json',
  phraseRecurrenceIndex: '.local-cache/workbench-evidence/usage-phrase-recurrence-index.json',
  contextOffsetIndex: '.local-cache/workbench-evidence/usage-context-offset-index.json',
  contextSignatureIndex: '.local-cache/workbench-evidence/usage-context-signature-index.json',
  contextSignatureLookup: '.local-cache/workbench-evidence/usage-context-signature-lookup.json',
  contextSignatureContrast: '.local-cache/workbench-evidence/usage-context-signature-contrast.json',
  selectedSlice: '.local-cache/workbench-evidence/usage-slice-tanakh.json',
  selectedSlicesIndex: '.local-cache/workbench-evidence/usage-selected-slices-index.json',
  selectedOccurrences: '.local-cache/workbench-evidence/usage-selected-occurrences.json',
  selectedSignatureIndependence: '.local-cache/workbench-evidence/usage-selected-signature-independence.json',
  selectedSourceDiversity: '.local-cache/workbench-evidence/usage-selected-source-diversity.json',
  selectedRouteConcentrationResponse: '.local-cache/workbench-evidence/usage-selected-route-concentration-response.json',
  selectedOccurrenceCards: '.local-cache/workbench-evidence/usage-selected-occurrence-cards.json',
  selectedRouteResolution: '.local-cache/workbench-evidence/usage-selected-route-resolution.json',
  selectedQaPackage: '.local-cache/workbench-evidence/usage-selected-qa-package.json',
  selectedOccurrenceLookup: '.local-cache/workbench-evidence/usage-selected-occurrence-lookup.json',
  crossmatchLinks: '.local-cache/workbench-evidence/usage-crossmatch-links.json',
  crossmatchBridgeIndex: '.local-cache/workbench-evidence/usage-crossmatch-bridge-index.json',
  crossmatchNeighborhoods: '.local-cache/workbench-evidence/usage-crossmatch-neighborhoods.json',
  agent6BoundaryPacket: '.local-cache/workbench-evidence/usage-agent6-boundary-packet.json',
  concentrationPacket: '.local-cache/workbench-evidence/usage-concentration-packet.json',
  smokeValidation: '.local-cache/workbench-evidence/smoke-pipeline-validation.json',
  skipSmokeValidation: false,
  output: '.local-cache/workbench-evidence/usage-navigation-handoff-index.json',
  report: 'reports/workbench-usage-navigation-handoff.md',
};

const options = parseArgs(process.argv.slice(2));
const manifest = readJson(options.manifest);
const occurrenceLinkCheck = readJsonIfExists(options.occurrenceLinkCheck);
const routeLinkCheck = readJsonIfExists(options.routeLinkCheck);
const auditReview = readJsonIfExists(options.auditReview);
const clusterIndex = readJsonIfExists(options.clusterIndex);
const routeCoverage = readJsonIfExists(options.routeCoverage);
const sampleIndex = readJsonIfExists(options.sampleIndex);
const lookupIndex = readJsonIfExists(options.lookupIndex);
const workFrameMatrix = readJsonIfExists(options.workFrameMatrix);
const searchRows = readJsonIfExists(options.searchRows);
const provenanceIndex = readJsonIfExists(options.provenanceIndex);
const searchShardIndex = readJsonIfExists(options.searchShardIndex);
const refreshPriorityIndex = readJsonIfExists(options.refreshPriorityIndex);
const unitDensityIndex = readJsonIfExists(options.unitDensityIndex);
const phraseRecurrenceIndex = readJsonIfExists(options.phraseRecurrenceIndex);
const contextOffsetIndex = readJsonIfExists(options.contextOffsetIndex);
const contextSignatureIndex = readJsonIfExists(options.contextSignatureIndex);
const contextSignatureLookup = readJsonIfExists(options.contextSignatureLookup);
const contextSignatureContrast = readJsonIfExists(options.contextSignatureContrast);
const selectedSlice = readJsonIfExists(options.selectedSlice);
const selectedSlicesIndex = readJsonIfExists(options.selectedSlicesIndex);
const selectedOccurrences = readJsonIfExists(options.selectedOccurrences);
const selectedSignatureIndependence = readJsonIfExists(options.selectedSignatureIndependence);
const selectedSourceDiversity = readJsonIfExists(options.selectedSourceDiversity);
const selectedRouteConcentrationResponse = readJsonIfExists(options.selectedRouteConcentrationResponse);
const selectedOccurrenceCards = readJsonIfExists(options.selectedOccurrenceCards);
const selectedRouteResolution = readJsonIfExists(options.selectedRouteResolution);
const selectedQaPackage = readJsonIfExists(options.selectedQaPackage);
const selectedOccurrenceLookup = readJsonIfExists(options.selectedOccurrenceLookup);
const crossmatchLinks = readJsonIfExists(options.crossmatchLinks);
const crossmatchBridgeIndex = readJsonIfExists(options.crossmatchBridgeIndex);
const crossmatchNeighborhoods = readJsonIfExists(options.crossmatchNeighborhoods);
const agent6BoundaryPacket = readJsonIfExists(options.agent6BoundaryPacket);
const concentrationPacket = readJsonIfExists(options.concentrationPacket);
const smokeValidation = options.smokeValidation ? readJsonIfExists(options.smokeValidation) : null;

if (manifest.artifact_type !== 'workbench_usage_navigation_concordance_manifest') {
  throw new Error(`${options.manifest} is not a usage concordance manifest`);
}

const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_navigation_handoff_index',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_handoff_index.mjs',
  policy: 'Compact handoff index for the usage-navigation/concordance lane. It summarizes artifacts and validation state only; it does not rank routes, select visible answers, or make meaning claims.',
  inputs: {
    manifest: options.manifest,
    occurrence_link_check: options.occurrenceLinkCheck,
    route_link_check: options.routeLinkCheck,
    audit_review: options.auditReview,
    cluster_index: options.clusterIndex,
    route_coverage: options.routeCoverage,
    sample_index: options.sampleIndex,
    lookup_index: options.lookupIndex,
    work_frame_matrix: options.workFrameMatrix,
    search_rows: options.searchRows,
    provenance_index: options.provenanceIndex,
    search_shard_index: options.searchShardIndex,
    refresh_priority_index: options.refreshPriorityIndex,
    unit_density_index: options.unitDensityIndex,
    phrase_recurrence_index: options.phraseRecurrenceIndex,
    context_offset_index: options.contextOffsetIndex,
    context_signature_index: options.contextSignatureIndex,
    context_signature_lookup: options.contextSignatureLookup,
    context_signature_contrast: options.contextSignatureContrast,
    selected_slice: options.selectedSlice,
    selected_slices_index: options.selectedSlicesIndex,
    selected_occurrences: options.selectedOccurrences,
    selected_signature_independence: options.selectedSignatureIndependence,
    selected_source_diversity: options.selectedSourceDiversity,
    selected_route_concentration_response: options.selectedRouteConcentrationResponse,
    selected_occurrence_cards: options.selectedOccurrenceCards,
    selected_route_resolution: options.selectedRouteResolution,
    selected_qa_package: options.selectedQaPackage,
    selected_occurrence_lookup: options.selectedOccurrenceLookup,
    crossmatch_links: options.crossmatchLinks,
    crossmatch_bridge_index: options.crossmatchBridgeIndex,
    crossmatch_neighborhoods: options.crossmatchNeighborhoods,
    agent6_boundary_packet: options.agent6BoundaryPacket,
    concentration_packet: options.concentrationPacket,
    smoke_validation: options.smokeValidation || null,
    smoke_validation_mode: options.skipSmokeValidation ? 'skipped_self_reference' : 'external_artifact',
  },
  authority_policy: manifest.authority_policy,
  artifacts: {
    concordance_json: manifest.outputs?.concordance_json || null,
    concordance_report: manifest.outputs?.concordance_report || null,
    manifest: manifest.outputs?.manifest || null,
    occurrence_link_check_report: 'reports/workbench-usage-concordance-link-check.md',
    route_link_check_report: 'reports/workbench-usage-route-link-check.md',
    audit_only_review_report: 'reports/workbench-usage-audit-only-review.md',
    cluster_index_report: 'reports/workbench-usage-cluster-index.md',
    route_coverage_report: 'reports/workbench-usage-route-coverage.md',
    sample_index_report: 'reports/workbench-usage-sample-index.md',
    lookup_index_report: 'reports/workbench-usage-lookup-index.md',
    work_frame_matrix_report: 'reports/workbench-usage-work-frame-matrix.md',
    search_rows_report: 'reports/workbench-usage-search-rows.md',
    provenance_index_report: 'reports/workbench-usage-provenance-index.md',
    search_shard_index_report: 'reports/workbench-usage-search-shard-index.md',
    refresh_priority_index_report: 'reports/workbench-usage-refresh-priority-index.md',
    unit_density_index_report: 'reports/workbench-usage-unit-density-index.md',
    phrase_recurrence_index_report: 'reports/workbench-usage-phrase-recurrence-index.md',
    context_offset_index_report: 'reports/workbench-usage-context-offset-index.md',
    context_signature_index_report: 'reports/workbench-usage-context-signature-index.md',
    context_signature_lookup_report: 'reports/workbench-usage-context-signature-lookup.md',
    context_signature_contrast_report: 'reports/workbench-usage-context-signature-contrast.md',
    selected_slice_report: 'reports/workbench-usage-slice-tanakh.md',
    selected_slices_index_report: 'reports/workbench-usage-selected-slices-index.md',
    selected_occurrences_report: 'reports/workbench-usage-selected-occurrences.md',
    selected_signature_independence_report: 'reports/workbench-usage-selected-signature-independence.md',
    selected_source_diversity_report: 'reports/workbench-usage-selected-source-diversity.md',
    selected_route_concentration_response_report: 'reports/workbench-usage-selected-route-concentration-response.md',
    selected_occurrence_cards_report: 'reports/workbench-usage-selected-occurrence-cards.md',
    selected_route_resolution_report: 'reports/workbench-usage-selected-route-resolution.md',
    selected_qa_package_report: 'reports/workbench-usage-selected-qa-package.md',
    selected_occurrence_lookup_report: 'reports/workbench-usage-selected-occurrence-lookup.md',
    crossmatch_links_report: 'reports/workbench-usage-crossmatch-links.md',
    crossmatch_bridge_index_report: 'reports/workbench-usage-crossmatch-bridge-index.md',
    crossmatch_neighborhoods_report: 'reports/workbench-usage-crossmatch-neighborhoods.md',
    agent6_boundary_packet_report: 'reports/workbench-usage-agent6-boundary-packet.md',
    concentration_packet_report: 'reports/workbench-usage-concentration-packet.md',
    smoke_validation_report: 'reports/workbench-smoke-pipeline-validation.md',
  },
  commands: buildCommands(options, manifest),
  counts: {
    concordance_rows: manifest.counts?.rows ?? null,
    selected_manifests: manifest.counts?.selected_manifests ?? null,
    supported: manifest.counts?.status_counts?.supported ?? null,
    candidate: manifest.counts?.status_counts?.candidate ?? null,
    weak: manifest.counts?.status_counts?.weak ?? null,
    audit_only_ambiguous: manifest.counts?.audit_only_counts?.ambiguous ?? null,
    audit_only_blocked: manifest.counts?.audit_only_counts?.blocked ?? null,
    route_linked_rows: manifest.counts?.route_link_state_counts?.route_linked_observed_usage ?? null,
    observed_only_rows: manifest.counts?.route_link_state_counts?.observed_usage_only ?? null,
    usage_clusters: clusterIndex?.counts?.clusters ?? null,
    unique_route_ids: routeCoverage?.counts?.unique_route_ids ?? null,
    sample_rows: sampleIndex?.counts?.sample_rows ?? null,
    lookup_occurrence_refs: lookupIndex?.counts?.occurrence_refs ?? null,
    lookup_works: lookupIndex?.counts?.works ?? null,
    work_frame_matrix_rows: workFrameMatrix?.counts?.rows ?? null,
    work_frame_matrix_works: workFrameMatrix?.counts?.works ?? null,
    work_frame_matrix_categories: workFrameMatrix?.counts?.categories ?? null,
    work_frame_matrix_clusters: workFrameMatrix?.counts?.clusters ?? null,
    work_frame_matrix_route_payload_field_hits: workFrameMatrix?.counts?.route_payload_field_hits ?? null,
    search_rows: searchRows?.counts?.rows ?? null,
    search_rows_works: searchRows?.counts?.works ?? null,
    search_rows_categories: searchRows?.counts?.categories ?? null,
    search_rows_clusters: searchRows?.counts?.clusters ?? null,
    search_rows_route_payload_field_hits: searchRows?.counts?.route_payload_field_hits ?? null,
    provenance_rows: provenanceIndex?.counts?.rows ?? null,
    provenance_licenses: provenanceIndex?.counts?.licenses ?? null,
    provenance_version_sources: provenanceIndex?.counts?.version_sources ?? null,
    provenance_works: provenanceIndex?.counts?.works ?? null,
    provenance_categories: provenanceIndex?.counts?.categories ?? null,
    provenance_rows_with_license_metadata: provenanceIndex?.counts?.rows_with_license_metadata ?? null,
    provenance_rows_with_source_links: provenanceIndex?.counts?.rows_with_source_links ?? null,
    provenance_rows_with_version_metadata: provenanceIndex?.counts?.rows_with_version_metadata ?? null,
    provenance_unsafe_license_rows: provenanceIndex?.counts?.unsafe_license_rows ?? null,
    provenance_route_payload_field_hits: provenanceIndex?.counts?.route_payload_field_hits ?? null,
    search_shard_index_shards: searchShardIndex?.counts?.shards ?? null,
    search_shard_index_rows: searchShardIndex?.counts?.rows ?? null,
    search_shard_index_categories: searchShardIndex?.counts?.categories ?? null,
    search_shard_index_clusters: searchShardIndex?.counts?.clusters ?? null,
    search_shard_index_statuses: searchShardIndex?.counts?.statuses ?? null,
    search_shard_index_route_payload_field_hits: searchShardIndex?.counts?.route_payload_field_hits ?? null,
    refresh_priority_pending_files: refreshPriorityIndex?.counts?.pending_refresh_files ?? null,
    refresh_priority_known_usage_candidates: refreshPriorityIndex?.counts?.known_usage_refresh_candidates ?? null,
    refresh_priority_review_only_not_promoted: refreshPriorityIndex?.counts?.review_only_not_promoted ?? null,
    refresh_priority_promoted_run_targets: refreshPriorityIndex?.counts?.promoted_run_targets ?? null,
    refresh_priority_blocked_broad_refresh_files: refreshPriorityIndex?.counts?.blocked_broad_refresh_files ?? null,
    refresh_priority_route_payload_field_hits: refreshPriorityIndex?.counts?.route_payload_field_hits ?? null,
    unit_density_units: unitDensityIndex?.counts?.units ?? null,
    unit_density_rows: unitDensityIndex?.counts?.rows ?? null,
    unit_density_multi_occurrence_units: unitDensityIndex?.counts?.multi_occurrence_units ?? null,
    unit_density_max_occurrences_per_unit: unitDensityIndex?.counts?.max_occurrences_per_unit ?? null,
    unit_density_works: unitDensityIndex?.counts?.works ?? null,
    unit_density_route_payload_field_hits: unitDensityIndex?.counts?.route_payload_field_hits ?? null,
    phrase_recurrence_rows: phraseRecurrenceIndex?.counts?.rows ?? null,
    phrase_recurrence_ngram_instances: phraseRecurrenceIndex?.counts?.ngram_instances ?? null,
    phrase_recurrence_groups_all: phraseRecurrenceIndex?.counts?.phrase_groups_all ?? null,
    phrase_recurrence_recurring_groups: phraseRecurrenceIndex?.counts?.recurring_phrase_groups ?? null,
    phrase_recurrence_rows_with_recurring_groups: phraseRecurrenceIndex?.counts?.rows_with_recurring_phrase_groups ?? null,
    phrase_recurrence_max_occurrences_per_group: phraseRecurrenceIndex?.counts?.max_occurrences_per_phrase_group ?? null,
    phrase_recurrence_skipped_rows_without_focus: phraseRecurrenceIndex?.counts?.skipped_rows_without_focus ?? null,
    phrase_recurrence_route_payload_field_hits: phraseRecurrenceIndex?.counts?.route_payload_field_hits ?? null,
    context_offset_rows: contextOffsetIndex?.counts?.rows ?? null,
    context_offset_rows_with_context: contextOffsetIndex?.counts?.rows_with_context ?? null,
    context_offset_rows_with_context_tokens: contextOffsetIndex?.counts?.rows_with_context_tokens ?? null,
    context_offset_token_observations: contextOffsetIndex?.counts?.token_observations ?? null,
    context_offset_immediate_neighbor_observations: contextOffsetIndex?.counts?.immediate_neighbor_observations ?? null,
    context_offset_offsets: contextOffsetIndex?.counts?.offsets ?? null,
    context_offset_token_buckets: contextOffsetIndex?.counts?.token_buckets ?? null,
    context_offset_skipped_rows_without_focus: contextOffsetIndex?.counts?.skipped_rows_without_focus ?? null,
    context_offset_route_payload_field_hits: contextOffsetIndex?.counts?.route_payload_field_hits ?? null,
    context_signature_rows: contextSignatureIndex?.counts?.rows ?? null,
    context_signature_rows_with_signatures: contextSignatureIndex?.counts?.rows_with_signatures ?? null,
    context_signature_windows: contextSignatureIndex?.counts?.signature_windows ?? null,
    context_signature_groups_all: contextSignatureIndex?.counts?.signature_groups_all ?? null,
    context_signature_recurring_groups: contextSignatureIndex?.counts?.recurring_signature_groups ?? null,
    context_signature_rows_with_recurring_signatures: contextSignatureIndex?.counts?.rows_with_recurring_signatures ?? null,
    context_signature_cross_cluster_groups: contextSignatureIndex?.counts?.cross_cluster_signature_groups ?? null,
    context_signature_skipped_rows_without_focus: contextSignatureIndex?.counts?.skipped_rows_without_focus ?? null,
    context_signature_route_payload_field_hits: contextSignatureIndex?.counts?.route_payload_field_hits ?? null,
    context_signature_lookup_occurrence_refs: contextSignatureLookup?.counts?.occurrence_refs ?? null,
    context_signature_lookup_memberships: contextSignatureLookup?.counts?.signature_memberships ?? null,
    context_signature_lookup_recurring_memberships: contextSignatureLookup?.counts?.recurring_signature_memberships ?? null,
    context_signature_lookup_occurrences_with_recurring: contextSignatureLookup?.counts?.occurrence_refs_with_recurring_signatures ?? null,
    context_signature_lookup_cross_cluster_memberships: contextSignatureLookup?.counts?.cross_cluster_signature_memberships ?? null,
    context_signature_lookup_occurrences_with_cross_cluster: contextSignatureLookup?.counts?.occurrence_refs_with_cross_cluster_signatures ?? null,
    context_signature_lookup_unmatched_occurrence_ids: contextSignatureLookup?.counts?.unmatched_occurrence_ids ?? null,
    context_signature_lookup_route_payload_field_hits: contextSignatureLookup?.counts?.route_payload_field_hits ?? null,
    context_signature_contrast_groups: contextSignatureContrast?.counts?.cross_cluster_signature_groups ?? null,
    context_signature_contrast_occurrence_refs: contextSignatureContrast?.counts?.cross_cluster_occurrence_refs ?? null,
    context_signature_contrast_reader_facing_rows: contextSignatureContrast?.counts?.reader_facing_rows ?? null,
    context_signature_contrast_route_payload_field_hits: contextSignatureContrast?.counts?.route_payload_field_hits ?? null,
    selected_slice_rows: selectedSlice?.counts?.slice_rows ?? null,
    selected_slice_works: selectedSlice?.counts?.works ?? null,
    selected_slices_index_slices: selectedSlicesIndex?.counts?.slices ?? null,
    selected_slices_index_rows: selectedSlicesIndex?.counts?.rows ?? null,
    selected_slices_index_unique_occurrences: selectedSlicesIndex?.deduped_counts?.occurrence_refs ?? null,
    selected_slices_index_duplicate_rows: selectedSlicesIndex?.deduped_counts?.duplicate_slice_rows ?? null,
    selected_occurrence_rows: selectedOccurrences?.counts?.occurrence_refs ?? null,
    selected_occurrence_memberships: selectedOccurrences?.counts?.slice_memberships ?? null,
    selected_occurrence_duplicate_memberships: selectedOccurrences?.counts?.duplicate_slice_memberships ?? null,
    selected_signature_independence_rows: selectedSignatureIndependence?.counts?.selected_occurrence_refs ?? null,
    selected_signature_independence_memberships: selectedSignatureIndependence?.counts?.signature_memberships ?? null,
    selected_signature_independence_recurring_memberships: selectedSignatureIndependence?.counts?.recurring_signature_memberships ?? null,
    selected_signature_independence_cross_cluster_memberships: selectedSignatureIndependence?.counts?.cross_cluster_signature_memberships ?? null,
    selected_signature_independence_rows_with_recurring: selectedSignatureIndependence?.counts?.occurrence_refs_with_recurring_signatures ?? null,
    selected_signature_independence_rows_with_cross_cluster: selectedSignatureIndependence?.counts?.occurrence_refs_with_cross_cluster_signatures ?? null,
    selected_signature_independence_missing_lookup_rows: selectedSignatureIndependence?.counts?.missing_lookup_rows ?? null,
    selected_signature_independence_reader_facing_rows: selectedSignatureIndependence?.counts?.reader_facing_rows ?? null,
    selected_signature_independence_route_payload_field_hits: selectedSignatureIndependence?.counts?.route_payload_field_hits ?? null,
    selected_source_diversity_rows: selectedSourceDiversity?.counts?.selected_occurrence_refs ?? null,
    selected_source_diversity_unique_source_refs: selectedSourceDiversity?.counts?.unique_source_refs ?? null,
    selected_source_diversity_unique_work_anchors: selectedSourceDiversity?.counts?.unique_work_anchors ?? null,
    selected_source_diversity_unique_works: selectedSourceDiversity?.counts?.unique_works ?? null,
    selected_source_diversity_unique_categories: selectedSourceDiversity?.counts?.unique_categories ?? null,
    selected_source_diversity_unique_licenses: selectedSourceDiversity?.counts?.unique_licenses ?? null,
    selected_source_diversity_unique_version_sources: selectedSourceDiversity?.counts?.unique_version_sources ?? null,
    selected_source_diversity_duplicate_source_ref_buckets: selectedSourceDiversity?.counts?.duplicate_source_ref_buckets ?? null,
    selected_source_diversity_duplicate_source_ref_rows: selectedSourceDiversity?.counts?.duplicate_source_ref_rows ?? null,
    selected_source_diversity_missing_signature_rows: selectedSourceDiversity?.counts?.missing_signature_independence_rows ?? null,
    selected_source_diversity_reader_facing_rows: selectedSourceDiversity?.counts?.reader_facing_rows ?? null,
    selected_source_diversity_route_payload_field_hits: selectedSourceDiversity?.counts?.route_payload_field_hits ?? null,
    selected_route_concentration_response_rows: selectedRouteConcentrationResponse?.counts?.selected_occurrence_refs ?? null,
    selected_route_concentration_response_route_buckets: selectedRouteConcentrationResponse?.counts?.route_id_buckets ?? null,
    selected_route_concentration_response_warning_visible: selectedRouteConcentrationResponse?.counts?.route_concentration_warning_visible ?? null,
    selected_route_concentration_response_unique_source_refs: selectedRouteConcentrationResponse?.counts?.unique_source_refs ?? null,
    selected_route_concentration_response_unique_works: selectedRouteConcentrationResponse?.counts?.unique_works ?? null,
    selected_route_concentration_response_rows_with_recurring: selectedRouteConcentrationResponse?.counts?.rows_with_recurring_signatures ?? null,
    selected_route_concentration_response_rows_with_cross_cluster: selectedRouteConcentrationResponse?.counts?.rows_with_cross_cluster_signatures ?? null,
    selected_route_concentration_response_reader_facing_rows: selectedRouteConcentrationResponse?.counts?.reader_facing_rows ?? null,
    selected_route_concentration_response_route_payload_field_hits: selectedRouteConcentrationResponse?.counts?.route_payload_field_hits ?? null,
    selected_occurrence_cards_rows: selectedOccurrenceCards?.counts?.cards ?? null,
    selected_occurrence_cards_with_context: selectedOccurrenceCards?.counts?.cards_with_context ?? null,
    selected_occurrence_cards_with_focus_marker: selectedOccurrenceCards?.counts?.cards_with_focus_marker ?? null,
    selected_occurrence_cards_with_related_signatures: selectedOccurrenceCards?.counts?.cards_with_related_signatures ?? null,
    selected_occurrence_cards_with_cross_cluster_signatures: selectedOccurrenceCards?.counts?.cards_with_cross_cluster_signatures ?? null,
    selected_occurrence_cards_related_occurrence_samples: selectedOccurrenceCards?.counts?.related_occurrence_samples ?? null,
    selected_occurrence_cards_route_concentration_warning_visible: selectedOccurrenceCards?.counts?.route_concentration_warning_visible ?? null,
    selected_occurrence_cards_mojibake_rows: selectedOccurrenceCards?.counts?.mojibake_token_or_context_rows ?? null,
    selected_occurrence_cards_reader_facing_rows: selectedOccurrenceCards?.counts?.reader_facing_rows ?? null,
    selected_occurrence_cards_route_payload_field_hits: selectedOccurrenceCards?.counts?.route_payload_field_hits ?? null,
    selected_route_resolution_route_id_buckets: selectedRouteResolution?.counts?.route_id_buckets ?? null,
    selected_route_resolution_selected_route_links: selectedRouteResolution?.counts?.selected_route_links ?? null,
    selected_route_resolution_resolved_route_ids: selectedRouteResolution?.counts?.resolved_route_ids ?? null,
    selected_route_resolution_unresolved_route_ids: selectedRouteResolution?.counts?.unresolved_route_ids ?? null,
    selected_route_resolution_route_link_check_status: selectedRouteResolution?.counts?.route_link_check_status ?? null,
    selected_route_resolution_reader_facing_rows: selectedRouteResolution?.counts?.reader_facing_rows ?? null,
    selected_route_resolution_route_payload_copied_rows: selectedRouteResolution?.counts?.route_payload_copied_rows ?? null,
    selected_route_resolution_route_payload_field_hits: selectedRouteResolution?.counts?.route_payload_field_hits ?? null,
    selected_qa_package_items: selectedQaPackage?.counts?.package_items ?? null,
    selected_qa_package_selected_rows: selectedQaPackage?.counts?.selected_rows ?? null,
    selected_qa_package_route_ids: selectedQaPackage?.counts?.selected_route_ids ?? null,
    selected_qa_package_unresolved_route_ids: selectedQaPackage?.counts?.unresolved_route_ids ?? null,
    selected_qa_package_route_concentration_warning_visible: selectedQaPackage?.counts?.route_concentration_warning_visible ?? null,
    selected_qa_package_crossmatch_directed_edges: selectedQaPackage?.counts?.crossmatch_directed_edges ?? null,
    selected_qa_package_crossmatch_bridge_edges: selectedQaPackage?.counts?.crossmatch_bridge_edges ?? null,
    selected_qa_package_reader_facing_rows: selectedQaPackage?.counts?.reader_facing_rows ?? null,
    selected_qa_package_route_payload_field_hits: selectedQaPackage?.counts?.route_payload_field_hits ?? null,
    selected_qa_package_failed_checks: selectedQaPackage?.counts?.failed_checks ?? null,
    selected_occurrence_lookup_work_buckets: selectedOccurrenceLookup?.counts?.work_buckets ?? null,
    selected_occurrence_lookup_cluster_buckets: selectedOccurrenceLookup?.counts?.cluster_buckets ?? null,
    selected_occurrence_lookup_status_buckets: selectedOccurrenceLookup?.counts?.status_buckets ?? null,
    crossmatch_occurrence_refs: crossmatchLinks?.counts?.occurrence_refs ?? null,
    crossmatch_directed_edges: crossmatchLinks?.counts?.directed_edges ?? null,
    crossmatch_undirected_pairs: crossmatchLinks?.counts?.undirected_pairs ?? null,
    crossmatch_strong_edges: crossmatchLinks?.counts?.crossmatch_strength_counts?.strong ?? null,
    crossmatch_moderate_edges: crossmatchLinks?.counts?.crossmatch_strength_counts?.moderate ?? null,
    crossmatch_weak_edges: crossmatchLinks?.counts?.crossmatch_strength_counts?.weak ?? null,
    crossmatch_route_payload_field_hits: crossmatchLinks?.counts?.route_payload_field_hits ?? null,
    crossmatch_bridge_edges: crossmatchBridgeIndex?.counts?.bridge_edges ?? null,
    crossmatch_same_frame_edges: crossmatchBridgeIndex?.counts?.same_frame_edges ?? null,
    crossmatch_bridge_buckets: crossmatchBridgeIndex?.counts?.bridge_buckets ?? null,
    crossmatch_bridge_route_payload_field_hits: crossmatchBridgeIndex?.counts?.route_payload_field_hits ?? null,
    crossmatch_neighborhoods: crossmatchNeighborhoods?.counts?.neighborhoods ?? null,
    crossmatch_neighborhood_same_frame_links: crossmatchNeighborhoods?.counts?.same_frame_neighbor_links ?? null,
    crossmatch_neighborhood_bridge_links: crossmatchNeighborhoods?.counts?.bridge_neighbor_links ?? null,
    crossmatch_neighborhood_route_payload_field_hits: crossmatchNeighborhoods?.counts?.route_payload_field_hits ?? null,
    agent6_boundary_checks: Array.isArray(agent6BoundaryPacket?.checks) ? agent6BoundaryPacket.checks.length : null,
    agent6_boundary_failed_checks: Array.isArray(agent6BoundaryPacket?.checks)
      ? agent6BoundaryPacket.checks.filter((check) => check.status !== 'passed').length
      : null,
    concentration_status: concentrationPacket?.quality?.status ?? null,
    concentration_warnings: concentrationPacket?.quality?.warning_count ?? null,
    concentration_failed_checks: concentrationPacket?.quality?.failed_count ?? null,
    concentration_route_id_buckets: concentrationPacket?.counts?.route_id_buckets ?? null,
    concentration_cluster_buckets: concentrationPacket?.counts?.cluster_buckets ?? null,
    concentration_route_payload_field_hits: concentrationPacket?.counts?.route_payload_field_hits ?? null,
  },
  validation: {
    occurrence_link_check_status: occurrenceLinkCheck?.quality?.status ?? 'not_run',
    occurrence_source_url_bad: occurrenceLinkCheck?.counts?.source_url_bad ?? null,
    occurrence_work_anchor_bad: occurrenceLinkCheck?.counts?.work_anchor_bad ?? null,
    route_link_check_status: routeLinkCheck?.quality?.status ?? 'not_run',
    route_links_resolved: routeLinkCheck?.counts?.route_links_resolved ?? null,
    route_links_unresolved: routeLinkCheck?.counts?.route_links_unresolved ?? null,
    route_metadata_mismatches: routeLinkCheck?.counts?.route_metadata_mismatch ?? null,
    audit_review_rows: auditReview?.counts?.rows ?? null,
    audit_review_reader_facing: auditReview?.reader_facing_policy?.reader_facing ?? null,
    cluster_index_status: clusterIndex?.artifact_type === 'workbench_usage_navigation_cluster_index' ? 'present' : 'not_run',
    cluster_index_rows: clusterIndex?.counts?.rows ?? null,
    route_coverage_status: routeCoverage?.artifact_type === 'workbench_usage_route_coverage_index' ? 'present' : 'not_run',
    route_coverage_links: routeCoverage?.counts?.route_links ?? null,
    sample_index_status: sampleIndex?.artifact_type === 'workbench_usage_navigation_sample_index' ? 'present' : 'not_run',
    sample_index_rows: sampleIndex?.counts?.sample_rows ?? null,
    lookup_index_status: lookupIndex?.artifact_type === 'workbench_usage_navigation_lookup_index' ? 'present' : 'not_run',
    lookup_index_occurrence_refs: lookupIndex?.counts?.occurrence_refs ?? null,
    work_frame_matrix_status: workFrameMatrix?.artifact_type === 'workbench_usage_navigation_work_frame_matrix' ? 'present' : 'not_run',
    work_frame_matrix_rows: workFrameMatrix?.counts?.rows ?? null,
    work_frame_matrix_works: workFrameMatrix?.counts?.works ?? null,
    work_frame_matrix_categories: workFrameMatrix?.counts?.categories ?? null,
    work_frame_matrix_failed_checks: workFrameMatrix?.quality?.failed_count ?? null,
    work_frame_matrix_route_payload_field_hits: workFrameMatrix?.counts?.route_payload_field_hits ?? null,
    search_rows_status: searchRows?.artifact_type === 'workbench_usage_navigation_search_rows' ? 'present' : 'not_run',
    search_rows: searchRows?.counts?.rows ?? null,
    search_rows_works: searchRows?.counts?.works ?? null,
    search_rows_categories: searchRows?.counts?.categories ?? null,
    search_rows_failed_checks: searchRows?.quality?.failed_count ?? null,
    search_rows_route_payload_field_hits: searchRows?.counts?.route_payload_field_hits ?? null,
    provenance_index_status: provenanceIndex?.artifact_type === 'workbench_usage_provenance_index' ? 'present' : 'not_run',
    provenance_rows: provenanceIndex?.counts?.rows ?? null,
    provenance_licenses: provenanceIndex?.counts?.licenses ?? null,
    provenance_version_sources: provenanceIndex?.counts?.version_sources ?? null,
    provenance_rows_with_license_metadata: provenanceIndex?.counts?.rows_with_license_metadata ?? null,
    provenance_rows_with_source_links: provenanceIndex?.counts?.rows_with_source_links ?? null,
    provenance_rows_with_version_metadata: provenanceIndex?.counts?.rows_with_version_metadata ?? null,
    provenance_unsafe_license_rows: provenanceIndex?.counts?.unsafe_license_rows ?? null,
    provenance_failed_checks: provenanceIndex?.quality?.failed_count ?? null,
    provenance_route_payload_field_hits: provenanceIndex?.counts?.route_payload_field_hits ?? null,
    search_shard_index_status: searchShardIndex?.artifact_type === 'workbench_usage_navigation_search_shard_index' ? 'present' : 'not_run',
    search_shard_index_shards: searchShardIndex?.counts?.shards ?? null,
    search_shard_index_rows: searchShardIndex?.counts?.rows ?? null,
    search_shard_index_failed_checks: searchShardIndex?.quality?.failed_count ?? null,
    search_shard_index_route_payload_field_hits: searchShardIndex?.counts?.route_payload_field_hits ?? null,
    refresh_priority_index_status: refreshPriorityIndex?.artifact_type === 'workbench_usage_refresh_priority_index' ? 'present' : 'not_run',
    refresh_priority_pending_files: refreshPriorityIndex?.counts?.pending_refresh_files ?? null,
    refresh_priority_known_usage_candidates: refreshPriorityIndex?.counts?.known_usage_refresh_candidates ?? null,
    refresh_priority_promoted_run_targets: refreshPriorityIndex?.counts?.promoted_run_targets ?? null,
    refresh_priority_failed_checks: refreshPriorityIndex?.quality?.failed_count ?? null,
    refresh_priority_route_payload_field_hits: refreshPriorityIndex?.counts?.route_payload_field_hits ?? null,
    unit_density_index_status: unitDensityIndex?.artifact_type === 'workbench_usage_navigation_unit_density_index' ? 'present' : 'not_run',
    unit_density_units: unitDensityIndex?.counts?.units ?? null,
    unit_density_rows: unitDensityIndex?.counts?.rows ?? null,
    unit_density_multi_occurrence_units: unitDensityIndex?.counts?.multi_occurrence_units ?? null,
    unit_density_failed_checks: unitDensityIndex?.quality?.failed_count ?? null,
    unit_density_route_payload_field_hits: unitDensityIndex?.counts?.route_payload_field_hits ?? null,
    phrase_recurrence_index_status: phraseRecurrenceIndex?.artifact_type === 'workbench_usage_phrase_recurrence_index' ? 'present' : 'not_run',
    phrase_recurrence_rows: phraseRecurrenceIndex?.counts?.rows ?? null,
    phrase_recurrence_ngram_instances: phraseRecurrenceIndex?.counts?.ngram_instances ?? null,
    phrase_recurrence_recurring_groups: phraseRecurrenceIndex?.counts?.recurring_phrase_groups ?? null,
    phrase_recurrence_rows_with_recurring_groups: phraseRecurrenceIndex?.counts?.rows_with_recurring_phrase_groups ?? null,
    phrase_recurrence_skipped_rows_without_focus: phraseRecurrenceIndex?.counts?.skipped_rows_without_focus ?? null,
    phrase_recurrence_failed_checks: phraseRecurrenceIndex?.quality?.failed_count ?? null,
    phrase_recurrence_route_payload_field_hits: phraseRecurrenceIndex?.counts?.route_payload_field_hits ?? null,
    context_offset_index_status: contextOffsetIndex?.artifact_type === 'workbench_usage_context_offset_index' ? 'present' : 'not_run',
    context_offset_rows: contextOffsetIndex?.counts?.rows ?? null,
    context_offset_rows_with_context: contextOffsetIndex?.counts?.rows_with_context ?? null,
    context_offset_token_observations: contextOffsetIndex?.counts?.token_observations ?? null,
    context_offset_immediate_neighbor_observations: contextOffsetIndex?.counts?.immediate_neighbor_observations ?? null,
    context_offset_offsets: contextOffsetIndex?.counts?.offsets ?? null,
    context_offset_token_buckets: contextOffsetIndex?.counts?.token_buckets ?? null,
    context_offset_skipped_rows_without_focus: contextOffsetIndex?.counts?.skipped_rows_without_focus ?? null,
    context_offset_failed_checks: contextOffsetIndex?.quality?.failed_count ?? null,
    context_offset_route_payload_field_hits: contextOffsetIndex?.counts?.route_payload_field_hits ?? null,
    context_signature_index_status: contextSignatureIndex?.artifact_type === 'workbench_usage_context_signature_index' ? 'present' : 'not_run',
    context_signature_rows: contextSignatureIndex?.counts?.rows ?? null,
    context_signature_rows_with_signatures: contextSignatureIndex?.counts?.rows_with_signatures ?? null,
    context_signature_windows: contextSignatureIndex?.counts?.signature_windows ?? null,
    context_signature_groups_all: contextSignatureIndex?.counts?.signature_groups_all ?? null,
    context_signature_recurring_groups: contextSignatureIndex?.counts?.recurring_signature_groups ?? null,
    context_signature_rows_with_recurring_signatures: contextSignatureIndex?.counts?.rows_with_recurring_signatures ?? null,
    context_signature_cross_cluster_groups: contextSignatureIndex?.counts?.cross_cluster_signature_groups ?? null,
    context_signature_skipped_rows_without_focus: contextSignatureIndex?.counts?.skipped_rows_without_focus ?? null,
    context_signature_failed_checks: contextSignatureIndex?.quality?.failed_count ?? null,
    context_signature_route_payload_field_hits: contextSignatureIndex?.counts?.route_payload_field_hits ?? null,
    context_signature_lookup_status: contextSignatureLookup?.artifact_type === 'workbench_usage_context_signature_lookup' ? 'present' : 'not_run',
    context_signature_lookup_occurrence_refs: contextSignatureLookup?.counts?.occurrence_refs ?? null,
    context_signature_lookup_memberships: contextSignatureLookup?.counts?.signature_memberships ?? null,
    context_signature_lookup_recurring_memberships: contextSignatureLookup?.counts?.recurring_signature_memberships ?? null,
    context_signature_lookup_occurrences_with_recurring: contextSignatureLookup?.counts?.occurrence_refs_with_recurring_signatures ?? null,
    context_signature_lookup_cross_cluster_memberships: contextSignatureLookup?.counts?.cross_cluster_signature_memberships ?? null,
    context_signature_lookup_occurrences_with_cross_cluster: contextSignatureLookup?.counts?.occurrence_refs_with_cross_cluster_signatures ?? null,
    context_signature_lookup_unmatched_occurrence_ids: contextSignatureLookup?.counts?.unmatched_occurrence_ids ?? null,
    context_signature_lookup_failed_checks: contextSignatureLookup?.quality?.failed_count ?? null,
    context_signature_lookup_route_payload_field_hits: contextSignatureLookup?.counts?.route_payload_field_hits ?? null,
    context_signature_contrast_status: contextSignatureContrast?.artifact_type === 'workbench_usage_context_signature_contrast' ? 'present' : 'not_run',
    context_signature_contrast_groups: contextSignatureContrast?.counts?.cross_cluster_signature_groups ?? null,
    context_signature_contrast_occurrence_refs: contextSignatureContrast?.counts?.cross_cluster_occurrence_refs ?? null,
    context_signature_contrast_reader_facing_rows: contextSignatureContrast?.counts?.reader_facing_rows ?? null,
    context_signature_contrast_failed_checks: contextSignatureContrast?.quality?.failed_count ?? null,
    context_signature_contrast_route_payload_field_hits: contextSignatureContrast?.counts?.route_payload_field_hits ?? null,
    selected_slice_status: selectedSlice?.artifact_type === 'workbench_usage_navigation_slice_index' ? 'present' : 'not_run',
    selected_slice_id: selectedSlice?.filter?.slice_id ?? null,
    selected_slice_rows: selectedSlice?.counts?.slice_rows ?? null,
    selected_slices_index_status: selectedSlicesIndex?.artifact_type === 'workbench_usage_navigation_selected_slices_index' ? 'present' : 'not_run',
    selected_slices_index_slices: selectedSlicesIndex?.counts?.slices ?? null,
    selected_slices_index_unique_occurrences: selectedSlicesIndex?.deduped_counts?.occurrence_refs ?? null,
    selected_occurrences_status: selectedOccurrences?.artifact_type === 'workbench_usage_navigation_selected_occurrences' ? 'present' : 'not_run',
    selected_occurrence_rows: selectedOccurrences?.counts?.occurrence_refs ?? null,
    selected_signature_independence_status: selectedSignatureIndependence?.artifact_type === 'workbench_usage_selected_signature_independence' ? 'present' : 'not_run',
    selected_signature_independence_rows: selectedSignatureIndependence?.counts?.selected_occurrence_refs ?? null,
    selected_signature_independence_memberships: selectedSignatureIndependence?.counts?.signature_memberships ?? null,
    selected_signature_independence_recurring_memberships: selectedSignatureIndependence?.counts?.recurring_signature_memberships ?? null,
    selected_signature_independence_cross_cluster_memberships: selectedSignatureIndependence?.counts?.cross_cluster_signature_memberships ?? null,
    selected_signature_independence_rows_with_recurring: selectedSignatureIndependence?.counts?.occurrence_refs_with_recurring_signatures ?? null,
    selected_signature_independence_rows_with_cross_cluster: selectedSignatureIndependence?.counts?.occurrence_refs_with_cross_cluster_signatures ?? null,
    selected_signature_independence_missing_lookup_rows: selectedSignatureIndependence?.counts?.missing_lookup_rows ?? null,
    selected_signature_independence_reader_facing_rows: selectedSignatureIndependence?.counts?.reader_facing_rows ?? null,
    selected_signature_independence_failed_checks: selectedSignatureIndependence?.quality?.failed_count ?? null,
    selected_signature_independence_route_payload_field_hits: selectedSignatureIndependence?.counts?.route_payload_field_hits ?? null,
    selected_source_diversity_status: selectedSourceDiversity?.artifact_type === 'workbench_usage_selected_source_diversity' ? 'present' : 'not_run',
    selected_source_diversity_rows: selectedSourceDiversity?.counts?.selected_occurrence_refs ?? null,
    selected_source_diversity_unique_source_refs: selectedSourceDiversity?.counts?.unique_source_refs ?? null,
    selected_source_diversity_unique_work_anchors: selectedSourceDiversity?.counts?.unique_work_anchors ?? null,
    selected_source_diversity_unique_works: selectedSourceDiversity?.counts?.unique_works ?? null,
    selected_source_diversity_unique_categories: selectedSourceDiversity?.counts?.unique_categories ?? null,
    selected_source_diversity_unique_licenses: selectedSourceDiversity?.counts?.unique_licenses ?? null,
    selected_source_diversity_unique_version_sources: selectedSourceDiversity?.counts?.unique_version_sources ?? null,
    selected_source_diversity_duplicate_source_ref_buckets: selectedSourceDiversity?.counts?.duplicate_source_ref_buckets ?? null,
    selected_source_diversity_duplicate_source_ref_rows: selectedSourceDiversity?.counts?.duplicate_source_ref_rows ?? null,
    selected_source_diversity_missing_signature_rows: selectedSourceDiversity?.counts?.missing_signature_independence_rows ?? null,
    selected_source_diversity_reader_facing_rows: selectedSourceDiversity?.counts?.reader_facing_rows ?? null,
    selected_source_diversity_failed_checks: selectedSourceDiversity?.quality?.failed_count ?? null,
    selected_source_diversity_route_payload_field_hits: selectedSourceDiversity?.counts?.route_payload_field_hits ?? null,
    selected_route_concentration_response_status: selectedRouteConcentrationResponse?.artifact_type === 'workbench_usage_selected_route_concentration_response' ? 'present' : 'not_run',
    selected_route_concentration_response_rows: selectedRouteConcentrationResponse?.counts?.selected_occurrence_refs ?? null,
    selected_route_concentration_response_route_buckets: selectedRouteConcentrationResponse?.counts?.route_id_buckets ?? null,
    selected_route_concentration_response_warning_visible: selectedRouteConcentrationResponse?.counts?.route_concentration_warning_visible ?? null,
    selected_route_concentration_response_unique_source_refs: selectedRouteConcentrationResponse?.counts?.unique_source_refs ?? null,
    selected_route_concentration_response_unique_works: selectedRouteConcentrationResponse?.counts?.unique_works ?? null,
    selected_route_concentration_response_rows_with_recurring: selectedRouteConcentrationResponse?.counts?.rows_with_recurring_signatures ?? null,
    selected_route_concentration_response_rows_with_cross_cluster: selectedRouteConcentrationResponse?.counts?.rows_with_cross_cluster_signatures ?? null,
    selected_route_concentration_response_reader_facing_rows: selectedRouteConcentrationResponse?.counts?.reader_facing_rows ?? null,
    selected_route_concentration_response_failed_checks: selectedRouteConcentrationResponse?.quality?.failed_count ?? null,
    selected_route_concentration_response_warning_count: selectedRouteConcentrationResponse?.quality?.warning_count ?? null,
    selected_route_concentration_response_route_payload_field_hits: selectedRouteConcentrationResponse?.counts?.route_payload_field_hits ?? null,
    selected_occurrence_cards_status: selectedOccurrenceCards?.artifact_type === 'workbench_usage_selected_occurrence_cards' ? 'present' : 'not_run',
    selected_occurrence_cards_rows: selectedOccurrenceCards?.counts?.cards ?? null,
    selected_occurrence_cards_with_context: selectedOccurrenceCards?.counts?.cards_with_context ?? null,
    selected_occurrence_cards_with_focus_marker: selectedOccurrenceCards?.counts?.cards_with_focus_marker ?? null,
    selected_occurrence_cards_with_related_signatures: selectedOccurrenceCards?.counts?.cards_with_related_signatures ?? null,
    selected_occurrence_cards_with_cross_cluster_signatures: selectedOccurrenceCards?.counts?.cards_with_cross_cluster_signatures ?? null,
    selected_occurrence_cards_related_occurrence_samples: selectedOccurrenceCards?.counts?.related_occurrence_samples ?? null,
    selected_occurrence_cards_route_concentration_warning_visible: selectedOccurrenceCards?.counts?.route_concentration_warning_visible ?? null,
    selected_occurrence_cards_mojibake_rows: selectedOccurrenceCards?.counts?.mojibake_token_or_context_rows ?? null,
    selected_occurrence_cards_reader_facing_rows: selectedOccurrenceCards?.counts?.reader_facing_rows ?? null,
    selected_occurrence_cards_failed_checks: selectedOccurrenceCards?.quality?.failed_count ?? null,
    selected_occurrence_cards_warning_count: selectedOccurrenceCards?.quality?.warning_count ?? null,
    selected_occurrence_cards_route_payload_field_hits: selectedOccurrenceCards?.counts?.route_payload_field_hits ?? null,
    selected_route_resolution_status: selectedRouteResolution?.artifact_type === 'workbench_usage_selected_route_resolution' ? 'present' : 'not_run',
    selected_route_resolution_route_id_buckets: selectedRouteResolution?.counts?.route_id_buckets ?? null,
    selected_route_resolution_selected_route_links: selectedRouteResolution?.counts?.selected_route_links ?? null,
    selected_route_resolution_resolved_route_ids: selectedRouteResolution?.counts?.resolved_route_ids ?? null,
    selected_route_resolution_unresolved_route_ids: selectedRouteResolution?.counts?.unresolved_route_ids ?? null,
    selected_route_resolution_route_link_check_status: selectedRouteResolution?.counts?.route_link_check_status ?? null,
    selected_route_resolution_reader_facing_rows: selectedRouteResolution?.counts?.reader_facing_rows ?? null,
    selected_route_resolution_failed_checks: selectedRouteResolution?.quality?.failed_count ?? null,
    selected_route_resolution_warning_count: selectedRouteResolution?.quality?.warning_count ?? null,
    selected_route_resolution_route_payload_copied_rows: selectedRouteResolution?.counts?.route_payload_copied_rows ?? null,
    selected_route_resolution_route_payload_field_hits: selectedRouteResolution?.counts?.route_payload_field_hits ?? null,
    selected_qa_package_status: selectedQaPackage?.artifact_type === 'workbench_usage_selected_qa_package' ? 'present' : 'not_run',
    selected_qa_package_items: selectedQaPackage?.counts?.package_items ?? null,
    selected_qa_package_selected_rows: selectedQaPackage?.counts?.selected_rows ?? null,
    selected_qa_package_route_ids: selectedQaPackage?.counts?.selected_route_ids ?? null,
    selected_qa_package_unresolved_route_ids: selectedQaPackage?.counts?.unresolved_route_ids ?? null,
    selected_qa_package_route_concentration_warning_visible: selectedQaPackage?.counts?.route_concentration_warning_visible ?? null,
    selected_qa_package_crossmatch_directed_edges: selectedQaPackage?.counts?.crossmatch_directed_edges ?? null,
    selected_qa_package_crossmatch_bridge_edges: selectedQaPackage?.counts?.crossmatch_bridge_edges ?? null,
    selected_qa_package_reader_facing_rows: selectedQaPackage?.counts?.reader_facing_rows ?? null,
    selected_qa_package_failed_checks: selectedQaPackage?.quality?.failed_count ?? null,
    selected_qa_package_warning_count: selectedQaPackage?.quality?.warning_count ?? null,
    selected_qa_package_route_payload_field_hits: selectedQaPackage?.counts?.route_payload_field_hits ?? null,
    selected_occurrence_lookup_status: selectedOccurrenceLookup?.artifact_type === 'workbench_usage_navigation_selected_occurrence_lookup' ? 'present' : 'not_run',
    selected_occurrence_lookup_work_buckets: selectedOccurrenceLookup?.counts?.work_buckets ?? null,
    crossmatch_links_status: crossmatchLinks?.artifact_type === 'workbench_usage_navigation_crossmatch_links' ? 'present' : 'not_run',
    crossmatch_occurrence_refs: crossmatchLinks?.counts?.occurrence_refs ?? null,
    crossmatch_directed_edges: crossmatchLinks?.counts?.directed_edges ?? null,
    crossmatch_undirected_pairs: crossmatchLinks?.counts?.undirected_pairs ?? null,
    crossmatch_failed_checks: crossmatchLinks?.quality?.failed_count ?? null,
    crossmatch_route_payload_field_hits: crossmatchLinks?.counts?.route_payload_field_hits ?? null,
    crossmatch_bridge_index_status: crossmatchBridgeIndex?.artifact_type === 'workbench_usage_navigation_crossmatch_bridge_index' ? 'present' : 'not_run',
    crossmatch_bridge_edges: crossmatchBridgeIndex?.counts?.bridge_edges ?? null,
    crossmatch_same_frame_edges: crossmatchBridgeIndex?.counts?.same_frame_edges ?? null,
    crossmatch_bridge_buckets: crossmatchBridgeIndex?.counts?.bridge_buckets ?? null,
    crossmatch_bridge_failed_checks: crossmatchBridgeIndex?.quality?.failed_count ?? null,
    crossmatch_bridge_route_payload_field_hits: crossmatchBridgeIndex?.counts?.route_payload_field_hits ?? null,
    crossmatch_neighborhoods_status: crossmatchNeighborhoods?.artifact_type === 'workbench_usage_navigation_crossmatch_neighborhoods' ? 'present' : 'not_run',
    crossmatch_neighborhoods: crossmatchNeighborhoods?.counts?.neighborhoods ?? null,
    crossmatch_neighborhood_same_frame_links: crossmatchNeighborhoods?.counts?.same_frame_neighbor_links ?? null,
    crossmatch_neighborhood_bridge_links: crossmatchNeighborhoods?.counts?.bridge_neighbor_links ?? null,
    crossmatch_neighborhood_failed_checks: crossmatchNeighborhoods?.quality?.failed_count ?? null,
    crossmatch_neighborhood_route_payload_field_hits: crossmatchNeighborhoods?.counts?.route_payload_field_hits ?? null,
    agent6_boundary_packet_status: agent6BoundaryPacket?.artifact_type === 'workbench_usage_agent6_boundary_packet' ? 'present' : 'not_run',
    agent6_boundary_checks: Array.isArray(agent6BoundaryPacket?.checks) ? agent6BoundaryPacket.checks.length : null,
    agent6_boundary_failed_checks: Array.isArray(agent6BoundaryPacket?.checks)
      ? agent6BoundaryPacket.checks.filter((check) => check.status !== 'passed').length
      : null,
    concentration_packet_status: concentrationPacket?.artifact_type === 'workbench_usage_concentration_packet' ? 'present' : 'not_run',
    concentration_quality_status: concentrationPacket?.quality?.status ?? null,
    concentration_warnings: concentrationPacket?.quality?.warning_count ?? null,
    concentration_failed_checks: concentrationPacket?.quality?.failed_count ?? null,
    concentration_route_payload_field_hits: concentrationPacket?.counts?.route_payload_field_hits ?? null,
    smoke_validation_status: options.skipSmokeValidation
      ? 'skipped_self_reference'
      : smokeValidation ? (smokeValidation.counts?.failed_steps === 0 ? 'passed' : 'failed') : 'not_run',
    smoke_steps: smokeValidation?.counts?.steps ?? null,
    smoke_failed_steps: smokeValidation?.counts?.failed_steps ?? null,
  },
  consumer_boundary: {
    observed_usage_not_meaning_claim: true,
    ambiguous_rows_reader_facing: false,
    ranks_routes: false,
    selects_visible_result: false,
    broad_target_expansion: false,
  },
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Usage handoff index rows ${artifact.counts.concordance_rows}; occurrence links ${artifact.validation.occurrence_link_check_status}; route links ${artifact.validation.route_link_check_status}; smoke ${artifact.validation.smoke_validation_status}`);

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Navigation Handoff',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Concordance rows: ${artifact.counts.concordance_rows}`,
    `- Selected manifests: ${artifact.counts.selected_manifests}`,
    `- Reader-facing statuses: supported ${artifact.counts.supported}, candidate ${artifact.counts.candidate}, weak ${artifact.counts.weak}`,
    `- Audit-only rows: ambiguous ${artifact.counts.audit_only_ambiguous}, blocked ${artifact.counts.audit_only_blocked}`,
    `- Route-linked rows: ${artifact.counts.route_linked_rows}`,
    `- Observed-only rows: ${artifact.counts.observed_only_rows}`,
    `- Usage clusters: ${artifact.counts.usage_clusters}`,
    `- Unique route IDs: ${artifact.counts.unique_route_ids}`,
    `- Sample rows: ${artifact.counts.sample_rows}`,
    `- Lookup occurrence refs: ${artifact.counts.lookup_occurrence_refs}`,
    `- Lookup works: ${artifact.counts.lookup_works}`,
    `- Work/frame matrix: rows ${artifact.counts.work_frame_matrix_rows}, works ${artifact.counts.work_frame_matrix_works}, categories ${artifact.counts.work_frame_matrix_categories}, clusters ${artifact.counts.work_frame_matrix_clusters}`,
    `- Work/frame matrix route payload-like field hits: ${artifact.counts.work_frame_matrix_route_payload_field_hits}`,
    `- Search rows: rows ${artifact.counts.search_rows}, works ${artifact.counts.search_rows_works}, categories ${artifact.counts.search_rows_categories}, clusters ${artifact.counts.search_rows_clusters}`,
    `- Search rows route payload-like field hits: ${artifact.counts.search_rows_route_payload_field_hits}`,
    `- Provenance index: rows ${artifact.counts.provenance_rows}, licenses ${artifact.counts.provenance_licenses}, version sources ${artifact.counts.provenance_version_sources}, works ${artifact.counts.provenance_works}, categories ${artifact.counts.provenance_categories}`,
    `- Provenance coverage: license metadata ${artifact.counts.provenance_rows_with_license_metadata}, source links ${artifact.counts.provenance_rows_with_source_links}, version metadata ${artifact.counts.provenance_rows_with_version_metadata}, unsafe license rows ${artifact.counts.provenance_unsafe_license_rows}`,
    `- Provenance route payload-like field hits: ${artifact.counts.provenance_route_payload_field_hits}`,
    `- Search shard index: shards ${artifact.counts.search_shard_index_shards}, rows ${artifact.counts.search_shard_index_rows}, categories ${artifact.counts.search_shard_index_categories}, clusters ${artifact.counts.search_shard_index_clusters}, statuses ${artifact.counts.search_shard_index_statuses}`,
    `- Search shard index route payload-like field hits: ${artifact.counts.search_shard_index_route_payload_field_hits}`,
    `- Refresh priority: pending ${artifact.counts.refresh_priority_pending_files}, known-use candidates ${artifact.counts.refresh_priority_known_usage_candidates}, review-only ${artifact.counts.refresh_priority_review_only_not_promoted}, promoted ${artifact.counts.refresh_priority_promoted_run_targets}`,
    `- Refresh priority blocked broad refresh files: ${artifact.counts.refresh_priority_blocked_broad_refresh_files}`,
    `- Refresh priority route payload-like field hits: ${artifact.counts.refresh_priority_route_payload_field_hits}`,
    `- Unit density: units ${artifact.counts.unit_density_units}, rows ${artifact.counts.unit_density_rows}, multi-occurrence units ${artifact.counts.unit_density_multi_occurrence_units}, max occurrences per unit ${artifact.counts.unit_density_max_occurrences_per_unit}, works ${artifact.counts.unit_density_works}`,
    `- Unit density route payload-like field hits: ${artifact.counts.unit_density_route_payload_field_hits}`,
    `- Phrase recurrence: rows ${artifact.counts.phrase_recurrence_rows}, n-gram instances ${artifact.counts.phrase_recurrence_ngram_instances}, recurring groups ${artifact.counts.phrase_recurrence_recurring_groups}, rows with recurring groups ${artifact.counts.phrase_recurrence_rows_with_recurring_groups}, max group occurrences ${artifact.counts.phrase_recurrence_max_occurrences_per_group}, skipped rows without focus ${artifact.counts.phrase_recurrence_skipped_rows_without_focus}`,
    `- Phrase recurrence route payload-like field hits: ${artifact.counts.phrase_recurrence_route_payload_field_hits}`,
    `- Context offset index: rows ${artifact.counts.context_offset_rows}, rows with context ${artifact.counts.context_offset_rows_with_context}, token observations ${artifact.counts.context_offset_token_observations}, immediate neighbor observations ${artifact.counts.context_offset_immediate_neighbor_observations}, offsets ${artifact.counts.context_offset_offsets}, token buckets ${artifact.counts.context_offset_token_buckets}, skipped rows without focus ${artifact.counts.context_offset_skipped_rows_without_focus}`,
    `- Context offset route payload-like field hits: ${artifact.counts.context_offset_route_payload_field_hits}`,
    `- Context signature index: rows ${artifact.counts.context_signature_rows}, rows with signatures ${artifact.counts.context_signature_rows_with_signatures}, windows ${artifact.counts.context_signature_windows}, groups ${artifact.counts.context_signature_groups_all}, recurring groups ${artifact.counts.context_signature_recurring_groups}, rows with recurring signatures ${artifact.counts.context_signature_rows_with_recurring_signatures}, cross-cluster groups ${artifact.counts.context_signature_cross_cluster_groups}, skipped rows without focus ${artifact.counts.context_signature_skipped_rows_without_focus}`,
    `- Context signature route payload-like field hits: ${artifact.counts.context_signature_route_payload_field_hits}`,
    `- Context signature lookup: occurrences ${artifact.counts.context_signature_lookup_occurrence_refs}, memberships ${artifact.counts.context_signature_lookup_memberships}, recurring memberships ${artifact.counts.context_signature_lookup_recurring_memberships}, occurrences with recurring ${artifact.counts.context_signature_lookup_occurrences_with_recurring}, cross-cluster memberships ${artifact.counts.context_signature_lookup_cross_cluster_memberships}, occurrences with cross-cluster ${artifact.counts.context_signature_lookup_occurrences_with_cross_cluster}, unmatched occurrence IDs ${artifact.counts.context_signature_lookup_unmatched_occurrence_ids}`,
    `- Context signature lookup route payload-like field hits: ${artifact.counts.context_signature_lookup_route_payload_field_hits}`,
    `- Context signature contrast: cross-cluster groups ${artifact.counts.context_signature_contrast_groups}, occurrence refs ${artifact.counts.context_signature_contrast_occurrence_refs}, reader-facing rows ${artifact.counts.context_signature_contrast_reader_facing_rows}`,
    `- Context signature contrast route payload-like field hits: ${artifact.counts.context_signature_contrast_route_payload_field_hits}`,
    `- Selected slice rows: ${artifact.counts.selected_slice_rows}`,
    `- Selected slice works: ${artifact.counts.selected_slice_works}`,
    `- Selected slices index: ${artifact.counts.selected_slices_index_slices}`,
    `- Selected slices index rows: ${artifact.counts.selected_slices_index_rows}`,
    `- Selected slices unique occurrences: ${artifact.counts.selected_slices_index_unique_occurrences}`,
    `- Selected slices duplicate rows: ${artifact.counts.selected_slices_index_duplicate_rows}`,
    `- Selected occurrence rows: ${artifact.counts.selected_occurrence_rows}`,
    `- Selected occurrence memberships: ${artifact.counts.selected_occurrence_memberships}`,
    `- Selected occurrence duplicate memberships: ${artifact.counts.selected_occurrence_duplicate_memberships}`,
    `- Selected signature independence: rows ${artifact.counts.selected_signature_independence_rows}, memberships ${artifact.counts.selected_signature_independence_memberships}, recurring memberships ${artifact.counts.selected_signature_independence_recurring_memberships}, cross-cluster memberships ${artifact.counts.selected_signature_independence_cross_cluster_memberships}, rows with recurring ${artifact.counts.selected_signature_independence_rows_with_recurring}, rows with cross-cluster ${artifact.counts.selected_signature_independence_rows_with_cross_cluster}, missing lookup rows ${artifact.counts.selected_signature_independence_missing_lookup_rows}, reader-facing rows ${artifact.counts.selected_signature_independence_reader_facing_rows}`,
    `- Selected signature independence route payload-like field hits: ${artifact.counts.selected_signature_independence_route_payload_field_hits}`,
    `- Selected source diversity: rows ${artifact.counts.selected_source_diversity_rows}, source refs ${artifact.counts.selected_source_diversity_unique_source_refs}, work anchors ${artifact.counts.selected_source_diversity_unique_work_anchors}, works ${artifact.counts.selected_source_diversity_unique_works}, categories ${artifact.counts.selected_source_diversity_unique_categories}, licenses ${artifact.counts.selected_source_diversity_unique_licenses}, version sources ${artifact.counts.selected_source_diversity_unique_version_sources}, duplicate source-ref buckets ${artifact.counts.selected_source_diversity_duplicate_source_ref_buckets}, duplicate source-ref rows ${artifact.counts.selected_source_diversity_duplicate_source_ref_rows}, missing signature rows ${artifact.counts.selected_source_diversity_missing_signature_rows}, reader-facing rows ${artifact.counts.selected_source_diversity_reader_facing_rows}`,
    `- Selected source diversity route payload-like field hits: ${artifact.counts.selected_source_diversity_route_payload_field_hits}`,
    `- Selected route concentration response: rows ${artifact.counts.selected_route_concentration_response_rows}, route buckets ${artifact.counts.selected_route_concentration_response_route_buckets}, warning visible ${artifact.counts.selected_route_concentration_response_warning_visible}, source refs ${artifact.counts.selected_route_concentration_response_unique_source_refs}, works ${artifact.counts.selected_route_concentration_response_unique_works}, rows with recurring ${artifact.counts.selected_route_concentration_response_rows_with_recurring}, rows with cross-cluster ${artifact.counts.selected_route_concentration_response_rows_with_cross_cluster}, reader-facing rows ${artifact.counts.selected_route_concentration_response_reader_facing_rows}`,
    `- Selected route concentration response route payload-like field hits: ${artifact.counts.selected_route_concentration_response_route_payload_field_hits}`,
    `- Selected occurrence cards: rows ${artifact.counts.selected_occurrence_cards_rows}, context ${artifact.counts.selected_occurrence_cards_with_context}, focus markers ${artifact.counts.selected_occurrence_cards_with_focus_marker}, related signature rows ${artifact.counts.selected_occurrence_cards_with_related_signatures}, cross-cluster rows ${artifact.counts.selected_occurrence_cards_with_cross_cluster_signatures}, related samples ${artifact.counts.selected_occurrence_cards_related_occurrence_samples}, route warning visible ${artifact.counts.selected_occurrence_cards_route_concentration_warning_visible}, mojibake rows ${artifact.counts.selected_occurrence_cards_mojibake_rows}, reader-facing rows ${artifact.counts.selected_occurrence_cards_reader_facing_rows}`,
    `- Selected occurrence cards route payload-like field hits: ${artifact.counts.selected_occurrence_cards_route_payload_field_hits}`,
    `- Selected route resolution: route IDs ${artifact.counts.selected_route_resolution_route_id_buckets}, selected links ${artifact.counts.selected_route_resolution_selected_route_links}, resolved ${artifact.counts.selected_route_resolution_resolved_route_ids}, unresolved ${artifact.counts.selected_route_resolution_unresolved_route_ids}, route-link check ${artifact.counts.selected_route_resolution_route_link_check_status}, reader-facing rows ${artifact.counts.selected_route_resolution_reader_facing_rows}, copied payload rows ${artifact.counts.selected_route_resolution_route_payload_copied_rows}`,
    `- Selected route resolution route payload-like field hits: ${artifact.counts.selected_route_resolution_route_payload_field_hits}`,
    `- Selected QA package: items ${artifact.counts.selected_qa_package_items}, rows ${artifact.counts.selected_qa_package_selected_rows}, route IDs ${artifact.counts.selected_qa_package_route_ids}, unresolved routes ${artifact.counts.selected_qa_package_unresolved_route_ids}, route warning visible ${artifact.counts.selected_qa_package_route_concentration_warning_visible}, directed edges ${artifact.counts.selected_qa_package_crossmatch_directed_edges}, bridge edges ${artifact.counts.selected_qa_package_crossmatch_bridge_edges}, reader-facing rows ${artifact.counts.selected_qa_package_reader_facing_rows}, failed checks ${artifact.counts.selected_qa_package_failed_checks}`,
    `- Selected QA package route payload-like field hits: ${artifact.counts.selected_qa_package_route_payload_field_hits}`,
    `- Selected occurrence lookup buckets: works ${artifact.counts.selected_occurrence_lookup_work_buckets}, clusters ${artifact.counts.selected_occurrence_lookup_cluster_buckets}, statuses ${artifact.counts.selected_occurrence_lookup_status_buckets}`,
    `- Crossmatch links: occurrences ${artifact.counts.crossmatch_occurrence_refs}, directed edges ${artifact.counts.crossmatch_directed_edges}, undirected pairs ${artifact.counts.crossmatch_undirected_pairs}`,
    `- Crossmatch strengths: strong ${artifact.counts.crossmatch_strong_edges}, moderate ${artifact.counts.crossmatch_moderate_edges}, weak ${artifact.counts.crossmatch_weak_edges}`,
    `- Crossmatch route payload-like field hits: ${artifact.counts.crossmatch_route_payload_field_hits}`,
    `- Crossmatch bridge edges: ${artifact.counts.crossmatch_bridge_edges}, same-frame edges ${artifact.counts.crossmatch_same_frame_edges}, bridge buckets ${artifact.counts.crossmatch_bridge_buckets}`,
    `- Crossmatch bridge route payload-like field hits: ${artifact.counts.crossmatch_bridge_route_payload_field_hits}`,
    `- Crossmatch neighborhoods: ${artifact.counts.crossmatch_neighborhoods}, same-frame links ${artifact.counts.crossmatch_neighborhood_same_frame_links}, bridge links ${artifact.counts.crossmatch_neighborhood_bridge_links}`,
    `- Crossmatch neighborhood route payload-like field hits: ${artifact.counts.crossmatch_neighborhood_route_payload_field_hits}`,
    `- Agent 6 boundary checks: ${artifact.counts.agent6_boundary_checks}, failed ${artifact.counts.agent6_boundary_failed_checks}`,
    `- Concentration packet: ${artifact.counts.concentration_status}, warnings ${artifact.counts.concentration_warnings}, failed ${artifact.counts.concentration_failed_checks}`,
    `- Concentration buckets: routes ${artifact.counts.concentration_route_id_buckets}, clusters ${artifact.counts.concentration_cluster_buckets}`,
    `- Concentration route payload-like field hits: ${artifact.counts.concentration_route_payload_field_hits}`,
    '',
    '## Validation',
    '',
    `- Occurrence links: ${artifact.validation.occurrence_link_check_status}, bad source URLs ${artifact.validation.occurrence_source_url_bad}, bad work anchors ${artifact.validation.occurrence_work_anchor_bad}`,
    `- Route links: ${artifact.validation.route_link_check_status}, resolved ${artifact.validation.route_links_resolved}, unresolved ${artifact.validation.route_links_unresolved}, metadata mismatches ${artifact.validation.route_metadata_mismatches}`,
    `- Audit review: rows ${artifact.validation.audit_review_rows}, reader-facing ${artifact.validation.audit_review_reader_facing ? 'yes' : 'no'}`,
    `- Cluster index: ${artifact.validation.cluster_index_status}, rows ${artifact.validation.cluster_index_rows}, clusters ${artifact.counts.usage_clusters}`,
    `- Route coverage: ${artifact.validation.route_coverage_status}, links ${artifact.validation.route_coverage_links}, unique route IDs ${artifact.counts.unique_route_ids}`,
    `- Sample index: ${artifact.validation.sample_index_status}, samples ${artifact.validation.sample_index_rows}`,
    `- Lookup index: ${artifact.validation.lookup_index_status}, occurrence refs ${artifact.validation.lookup_index_occurrence_refs}`,
    `- Work/frame matrix: ${artifact.validation.work_frame_matrix_status}, rows ${artifact.validation.work_frame_matrix_rows}, works ${artifact.validation.work_frame_matrix_works}, categories ${artifact.validation.work_frame_matrix_categories}, failed ${artifact.validation.work_frame_matrix_failed_checks}`,
    `- Work/frame matrix route payload-like field hits: ${artifact.validation.work_frame_matrix_route_payload_field_hits}`,
    `- Search rows: ${artifact.validation.search_rows_status}, rows ${artifact.validation.search_rows}, works ${artifact.validation.search_rows_works}, categories ${artifact.validation.search_rows_categories}, failed ${artifact.validation.search_rows_failed_checks}`,
    `- Search rows route payload-like field hits: ${artifact.validation.search_rows_route_payload_field_hits}`,
    `- Provenance index: ${artifact.validation.provenance_index_status}, rows ${artifact.validation.provenance_rows}, licenses ${artifact.validation.provenance_licenses}, version sources ${artifact.validation.provenance_version_sources}, failed ${artifact.validation.provenance_failed_checks}`,
    `- Provenance coverage: license metadata ${artifact.validation.provenance_rows_with_license_metadata}, source links ${artifact.validation.provenance_rows_with_source_links}, version metadata ${artifact.validation.provenance_rows_with_version_metadata}, unsafe license rows ${artifact.validation.provenance_unsafe_license_rows}`,
    `- Provenance route payload-like field hits: ${artifact.validation.provenance_route_payload_field_hits}`,
    `- Search shard index: ${artifact.validation.search_shard_index_status}, shards ${artifact.validation.search_shard_index_shards}, rows ${artifact.validation.search_shard_index_rows}, failed ${artifact.validation.search_shard_index_failed_checks}`,
    `- Search shard index route payload-like field hits: ${artifact.validation.search_shard_index_route_payload_field_hits}`,
    `- Refresh priority: ${artifact.validation.refresh_priority_index_status}, pending ${artifact.validation.refresh_priority_pending_files}, known-use candidates ${artifact.validation.refresh_priority_known_usage_candidates}, promoted ${artifact.validation.refresh_priority_promoted_run_targets}, failed ${artifact.validation.refresh_priority_failed_checks}`,
    `- Refresh priority route payload-like field hits: ${artifact.validation.refresh_priority_route_payload_field_hits}`,
    `- Unit density: ${artifact.validation.unit_density_index_status}, units ${artifact.validation.unit_density_units}, rows ${artifact.validation.unit_density_rows}, multi-occurrence units ${artifact.validation.unit_density_multi_occurrence_units}, failed ${artifact.validation.unit_density_failed_checks}`,
    `- Unit density route payload-like field hits: ${artifact.validation.unit_density_route_payload_field_hits}`,
    `- Phrase recurrence: ${artifact.validation.phrase_recurrence_index_status}, rows ${artifact.validation.phrase_recurrence_rows}, n-gram instances ${artifact.validation.phrase_recurrence_ngram_instances}, recurring groups ${artifact.validation.phrase_recurrence_recurring_groups}, rows with recurring groups ${artifact.validation.phrase_recurrence_rows_with_recurring_groups}, skipped rows without focus ${artifact.validation.phrase_recurrence_skipped_rows_without_focus}, failed ${artifact.validation.phrase_recurrence_failed_checks}`,
    `- Phrase recurrence route payload-like field hits: ${artifact.validation.phrase_recurrence_route_payload_field_hits}`,
    `- Context offset index: ${artifact.validation.context_offset_index_status}, rows ${artifact.validation.context_offset_rows}, rows with context ${artifact.validation.context_offset_rows_with_context}, token observations ${artifact.validation.context_offset_token_observations}, immediate neighbor observations ${artifact.validation.context_offset_immediate_neighbor_observations}, offsets ${artifact.validation.context_offset_offsets}, token buckets ${artifact.validation.context_offset_token_buckets}, skipped rows without focus ${artifact.validation.context_offset_skipped_rows_without_focus}, failed ${artifact.validation.context_offset_failed_checks}`,
    `- Context offset route payload-like field hits: ${artifact.validation.context_offset_route_payload_field_hits}`,
    `- Context signature index: ${artifact.validation.context_signature_index_status}, rows ${artifact.validation.context_signature_rows}, rows with signatures ${artifact.validation.context_signature_rows_with_signatures}, windows ${artifact.validation.context_signature_windows}, groups ${artifact.validation.context_signature_groups_all}, recurring groups ${artifact.validation.context_signature_recurring_groups}, rows with recurring signatures ${artifact.validation.context_signature_rows_with_recurring_signatures}, cross-cluster groups ${artifact.validation.context_signature_cross_cluster_groups}, skipped rows without focus ${artifact.validation.context_signature_skipped_rows_without_focus}, failed ${artifact.validation.context_signature_failed_checks}`,
    `- Context signature route payload-like field hits: ${artifact.validation.context_signature_route_payload_field_hits}`,
    `- Context signature lookup: ${artifact.validation.context_signature_lookup_status}, occurrences ${artifact.validation.context_signature_lookup_occurrence_refs}, memberships ${artifact.validation.context_signature_lookup_memberships}, recurring memberships ${artifact.validation.context_signature_lookup_recurring_memberships}, occurrences with recurring ${artifact.validation.context_signature_lookup_occurrences_with_recurring}, cross-cluster memberships ${artifact.validation.context_signature_lookup_cross_cluster_memberships}, occurrences with cross-cluster ${artifact.validation.context_signature_lookup_occurrences_with_cross_cluster}, unmatched occurrence IDs ${artifact.validation.context_signature_lookup_unmatched_occurrence_ids}, failed ${artifact.validation.context_signature_lookup_failed_checks}`,
    `- Context signature lookup route payload-like field hits: ${artifact.validation.context_signature_lookup_route_payload_field_hits}`,
    `- Context signature contrast: ${artifact.validation.context_signature_contrast_status}, cross-cluster groups ${artifact.validation.context_signature_contrast_groups}, occurrence refs ${artifact.validation.context_signature_contrast_occurrence_refs}, reader-facing rows ${artifact.validation.context_signature_contrast_reader_facing_rows}, failed ${artifact.validation.context_signature_contrast_failed_checks}`,
    `- Context signature contrast route payload-like field hits: ${artifact.validation.context_signature_contrast_route_payload_field_hits}`,
    `- Selected slice: ${artifact.validation.selected_slice_status}, id ${artifact.validation.selected_slice_id}, rows ${artifact.validation.selected_slice_rows}`,
    `- Selected slices index: ${artifact.validation.selected_slices_index_status}, slices ${artifact.validation.selected_slices_index_slices}, unique occurrences ${artifact.validation.selected_slices_index_unique_occurrences}`,
    `- Selected occurrences: ${artifact.validation.selected_occurrences_status}, rows ${artifact.validation.selected_occurrence_rows}`,
    `- Selected signature independence: ${artifact.validation.selected_signature_independence_status}, rows ${artifact.validation.selected_signature_independence_rows}, memberships ${artifact.validation.selected_signature_independence_memberships}, recurring memberships ${artifact.validation.selected_signature_independence_recurring_memberships}, cross-cluster memberships ${artifact.validation.selected_signature_independence_cross_cluster_memberships}, rows with recurring ${artifact.validation.selected_signature_independence_rows_with_recurring}, rows with cross-cluster ${artifact.validation.selected_signature_independence_rows_with_cross_cluster}, missing lookup rows ${artifact.validation.selected_signature_independence_missing_lookup_rows}, reader-facing rows ${artifact.validation.selected_signature_independence_reader_facing_rows}, failed ${artifact.validation.selected_signature_independence_failed_checks}`,
    `- Selected signature independence route payload-like field hits: ${artifact.validation.selected_signature_independence_route_payload_field_hits}`,
    `- Selected source diversity: ${artifact.validation.selected_source_diversity_status}, rows ${artifact.validation.selected_source_diversity_rows}, source refs ${artifact.validation.selected_source_diversity_unique_source_refs}, work anchors ${artifact.validation.selected_source_diversity_unique_work_anchors}, works ${artifact.validation.selected_source_diversity_unique_works}, categories ${artifact.validation.selected_source_diversity_unique_categories}, licenses ${artifact.validation.selected_source_diversity_unique_licenses}, version sources ${artifact.validation.selected_source_diversity_unique_version_sources}, duplicate source-ref buckets ${artifact.validation.selected_source_diversity_duplicate_source_ref_buckets}, duplicate source-ref rows ${artifact.validation.selected_source_diversity_duplicate_source_ref_rows}, missing signature rows ${artifact.validation.selected_source_diversity_missing_signature_rows}, reader-facing rows ${artifact.validation.selected_source_diversity_reader_facing_rows}, failed ${artifact.validation.selected_source_diversity_failed_checks}`,
    `- Selected source diversity route payload-like field hits: ${artifact.validation.selected_source_diversity_route_payload_field_hits}`,
    `- Selected route concentration response: ${artifact.validation.selected_route_concentration_response_status}, rows ${artifact.validation.selected_route_concentration_response_rows}, route buckets ${artifact.validation.selected_route_concentration_response_route_buckets}, warning visible ${artifact.validation.selected_route_concentration_response_warning_visible}, source refs ${artifact.validation.selected_route_concentration_response_unique_source_refs}, works ${artifact.validation.selected_route_concentration_response_unique_works}, rows with recurring ${artifact.validation.selected_route_concentration_response_rows_with_recurring}, rows with cross-cluster ${artifact.validation.selected_route_concentration_response_rows_with_cross_cluster}, reader-facing rows ${artifact.validation.selected_route_concentration_response_reader_facing_rows}, warnings ${artifact.validation.selected_route_concentration_response_warning_count}, failed ${artifact.validation.selected_route_concentration_response_failed_checks}`,
    `- Selected route concentration response route payload-like field hits: ${artifact.validation.selected_route_concentration_response_route_payload_field_hits}`,
    `- Selected occurrence cards: ${artifact.validation.selected_occurrence_cards_status}, rows ${artifact.validation.selected_occurrence_cards_rows}, context ${artifact.validation.selected_occurrence_cards_with_context}, focus markers ${artifact.validation.selected_occurrence_cards_with_focus_marker}, related signature rows ${artifact.validation.selected_occurrence_cards_with_related_signatures}, cross-cluster rows ${artifact.validation.selected_occurrence_cards_with_cross_cluster_signatures}, related samples ${artifact.validation.selected_occurrence_cards_related_occurrence_samples}, route warning visible ${artifact.validation.selected_occurrence_cards_route_concentration_warning_visible}, mojibake rows ${artifact.validation.selected_occurrence_cards_mojibake_rows}, reader-facing rows ${artifact.validation.selected_occurrence_cards_reader_facing_rows}, warnings ${artifact.validation.selected_occurrence_cards_warning_count}, failed ${artifact.validation.selected_occurrence_cards_failed_checks}`,
    `- Selected occurrence cards route payload-like field hits: ${artifact.validation.selected_occurrence_cards_route_payload_field_hits}`,
    `- Selected route resolution: ${artifact.validation.selected_route_resolution_status}, route IDs ${artifact.validation.selected_route_resolution_route_id_buckets}, selected links ${artifact.validation.selected_route_resolution_selected_route_links}, resolved ${artifact.validation.selected_route_resolution_resolved_route_ids}, unresolved ${artifact.validation.selected_route_resolution_unresolved_route_ids}, route-link check ${artifact.validation.selected_route_resolution_route_link_check_status}, reader-facing rows ${artifact.validation.selected_route_resolution_reader_facing_rows}, warnings ${artifact.validation.selected_route_resolution_warning_count}, failed ${artifact.validation.selected_route_resolution_failed_checks}, copied payload rows ${artifact.validation.selected_route_resolution_route_payload_copied_rows}`,
    `- Selected route resolution route payload-like field hits: ${artifact.validation.selected_route_resolution_route_payload_field_hits}`,
    `- Selected QA package: ${artifact.validation.selected_qa_package_status}, items ${artifact.validation.selected_qa_package_items}, rows ${artifact.validation.selected_qa_package_selected_rows}, route IDs ${artifact.validation.selected_qa_package_route_ids}, unresolved routes ${artifact.validation.selected_qa_package_unresolved_route_ids}, route warning visible ${artifact.validation.selected_qa_package_route_concentration_warning_visible}, directed edges ${artifact.validation.selected_qa_package_crossmatch_directed_edges}, bridge edges ${artifact.validation.selected_qa_package_crossmatch_bridge_edges}, reader-facing rows ${artifact.validation.selected_qa_package_reader_facing_rows}, warnings ${artifact.validation.selected_qa_package_warning_count}, failed ${artifact.validation.selected_qa_package_failed_checks}`,
    `- Selected QA package route payload-like field hits: ${artifact.validation.selected_qa_package_route_payload_field_hits}`,
    `- Selected occurrence lookup: ${artifact.validation.selected_occurrence_lookup_status}, work buckets ${artifact.validation.selected_occurrence_lookup_work_buckets}`,
    `- Crossmatch links: ${artifact.validation.crossmatch_links_status}, occurrences ${artifact.validation.crossmatch_occurrence_refs}, directed edges ${artifact.validation.crossmatch_directed_edges}, failed ${artifact.validation.crossmatch_failed_checks}`,
    `- Crossmatch route payload-like field hits: ${artifact.validation.crossmatch_route_payload_field_hits}`,
    `- Crossmatch bridge index: ${artifact.validation.crossmatch_bridge_index_status}, bridge edges ${artifact.validation.crossmatch_bridge_edges}, bridge buckets ${artifact.validation.crossmatch_bridge_buckets}, failed ${artifact.validation.crossmatch_bridge_failed_checks}`,
    `- Crossmatch bridge route payload-like field hits: ${artifact.validation.crossmatch_bridge_route_payload_field_hits}`,
    `- Crossmatch neighborhoods: ${artifact.validation.crossmatch_neighborhoods_status}, neighborhoods ${artifact.validation.crossmatch_neighborhoods}, same-frame links ${artifact.validation.crossmatch_neighborhood_same_frame_links}, bridge links ${artifact.validation.crossmatch_neighborhood_bridge_links}, failed ${artifact.validation.crossmatch_neighborhood_failed_checks}`,
    `- Crossmatch neighborhood route payload-like field hits: ${artifact.validation.crossmatch_neighborhood_route_payload_field_hits}`,
    `- Agent 6 boundary packet: ${artifact.validation.agent6_boundary_packet_status}, checks ${artifact.validation.agent6_boundary_checks}, failed ${artifact.validation.agent6_boundary_failed_checks}`,
    `- Concentration packet: ${artifact.validation.concentration_packet_status}, quality ${artifact.validation.concentration_quality_status}, warnings ${artifact.validation.concentration_warnings}, failed ${artifact.validation.concentration_failed_checks}`,
    `- Concentration route payload-like field hits: ${artifact.validation.concentration_route_payload_field_hits}`,
    `- Smoke validation: ${artifact.validation.smoke_validation_status}, steps ${artifact.validation.smoke_steps}, failed ${artifact.validation.smoke_failed_steps}`,
    '',
    '## Artifacts',
    '',
    '| artifact | path | tracked |',
    '|---|---|---|',
    `| concordance JSON | ${mdCell(artifact.artifacts.concordance_json?.path)} | ${artifact.artifacts.concordance_json?.tracked_in_git ? 'yes' : 'no'} |`,
    `| concordance report | ${mdCell(artifact.artifacts.concordance_report?.path)} | ${artifact.artifacts.concordance_report?.tracked_in_git ? 'yes' : 'no'} |`,
    `| manifest | ${mdCell(artifact.artifacts.manifest?.path)} | ${artifact.artifacts.manifest?.tracked_in_git ? 'yes' : 'no'} |`,
    `| occurrence link check | ${mdCell(artifact.artifacts.occurrence_link_check_report)} | yes |`,
    `| route link check | ${mdCell(artifact.artifacts.route_link_check_report)} | yes |`,
    `| audit-only review | ${mdCell(artifact.artifacts.audit_only_review_report)} | yes |`,
    `| cluster index | ${mdCell(artifact.artifacts.cluster_index_report)} | yes |`,
    `| route coverage | ${mdCell(artifact.artifacts.route_coverage_report)} | yes |`,
    `| sample index | ${mdCell(artifact.artifacts.sample_index_report)} | yes |`,
    `| lookup index | ${mdCell(artifact.artifacts.lookup_index_report)} | yes |`,
    `| work/frame matrix | ${mdCell(artifact.artifacts.work_frame_matrix_report)} | yes |`,
    `| search rows | ${mdCell(artifact.artifacts.search_rows_report)} | yes |`,
    `| provenance index | ${mdCell(artifact.artifacts.provenance_index_report)} | yes |`,
    `| search shard index | ${mdCell(artifact.artifacts.search_shard_index_report)} | yes |`,
    `| refresh priority index | ${mdCell(artifact.artifacts.refresh_priority_index_report)} | yes |`,
    `| unit density index | ${mdCell(artifact.artifacts.unit_density_index_report)} | yes |`,
    `| phrase recurrence index | ${mdCell(artifact.artifacts.phrase_recurrence_index_report)} | yes |`,
    `| context offset index | ${mdCell(artifact.artifacts.context_offset_index_report)} | yes |`,
    `| context signature index | ${mdCell(artifact.artifacts.context_signature_index_report)} | yes |`,
    `| context signature lookup | ${mdCell(artifact.artifacts.context_signature_lookup_report)} | yes |`,
    `| context signature contrast | ${mdCell(artifact.artifacts.context_signature_contrast_report)} | yes |`,
    `| selected slice | ${mdCell(artifact.artifacts.selected_slice_report)} | yes |`,
    `| selected slices index | ${mdCell(artifact.artifacts.selected_slices_index_report)} | yes |`,
    `| selected occurrences | ${mdCell(artifact.artifacts.selected_occurrences_report)} | yes |`,
    `| selected signature independence | ${mdCell(artifact.artifacts.selected_signature_independence_report)} | yes |`,
    `| selected source diversity | ${mdCell(artifact.artifacts.selected_source_diversity_report)} | yes |`,
    `| selected route concentration response | ${mdCell(artifact.artifacts.selected_route_concentration_response_report)} | yes |`,
    `| selected occurrence cards | ${mdCell(artifact.artifacts.selected_occurrence_cards_report)} | yes |`,
    `| selected route resolution | ${mdCell(artifact.artifacts.selected_route_resolution_report)} | yes |`,
    `| selected QA package | ${mdCell(artifact.artifacts.selected_qa_package_report)} | yes |`,
    `| selected occurrence lookup | ${mdCell(artifact.artifacts.selected_occurrence_lookup_report)} | yes |`,
    `| crossmatch links | ${mdCell(artifact.artifacts.crossmatch_links_report)} | yes |`,
    `| crossmatch bridge index | ${mdCell(artifact.artifacts.crossmatch_bridge_index_report)} | yes |`,
    `| crossmatch neighborhoods | ${mdCell(artifact.artifacts.crossmatch_neighborhoods_report)} | yes |`,
    `| Agent 6 boundary packet | ${mdCell(artifact.artifacts.agent6_boundary_packet_report)} | yes |`,
    `| concentration packet | ${mdCell(artifact.artifacts.concentration_packet_report)} | yes |`,
    `| smoke validation | ${mdCell(artifact.artifacts.smoke_validation_report)} | yes |`,
    '',
    '## Commands',
    '',
    '| command | value |',
    '|---|---|',
    ...Object.entries(artifact.commands || {}).map(([key, value]) => `| ${mdCell(key)} | ${mdCell(value)} |`),
    '',
    '## Boundary',
    '',
    'This handoff is for usage navigation and concordance only. It preserves observed usage, route links, validation state, and audit-only ambiguous rows without ranking routes, selecting visible answers, or making meaning claims.',
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--manifest=')) parsed.manifest = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--occurrence-link-check=')) parsed.occurrenceLinkCheck = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--route-link-check=')) parsed.routeLinkCheck = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--audit-review=')) parsed.auditReview = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--cluster-index=')) parsed.clusterIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--route-coverage=')) parsed.routeCoverage = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--sample-index=')) parsed.sampleIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--lookup-index=')) parsed.lookupIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--work-frame-matrix=')) parsed.workFrameMatrix = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--search-rows=')) parsed.searchRows = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--provenance-index=')) parsed.provenanceIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--search-shard-index=')) parsed.searchShardIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--refresh-priority-index=')) parsed.refreshPriorityIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--unit-density-index=')) parsed.unitDensityIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--phrase-recurrence-index=')) parsed.phraseRecurrenceIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--context-offset-index=')) parsed.contextOffsetIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--context-signature-index=')) parsed.contextSignatureIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--context-signature-lookup=')) parsed.contextSignatureLookup = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--context-signature-contrast=')) parsed.contextSignatureContrast = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-slice=')) parsed.selectedSlice = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-slices-index=')) parsed.selectedSlicesIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-occurrences=')) parsed.selectedOccurrences = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-signature-independence=')) parsed.selectedSignatureIndependence = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-source-diversity=')) parsed.selectedSourceDiversity = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-route-concentration-response=')) parsed.selectedRouteConcentrationResponse = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-occurrence-cards=')) parsed.selectedOccurrenceCards = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-route-resolution=')) parsed.selectedRouteResolution = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-qa-package=')) parsed.selectedQaPackage = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-occurrence-lookup=')) parsed.selectedOccurrenceLookup = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--crossmatch-links=')) parsed.crossmatchLinks = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--crossmatch-bridge-index=')) parsed.crossmatchBridgeIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--crossmatch-neighborhoods=')) parsed.crossmatchNeighborhoods = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--agent6-boundary-packet=')) parsed.agent6BoundaryPacket = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--concentration-packet=')) parsed.concentrationPacket = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--smoke-validation=')) parsed.smokeValidation = cleanRelativePath(valueAfterEquals(arg));
    else if (arg === '--no-smoke-validation') {
      parsed.smokeValidation = null;
      parsed.skipSmokeValidation = true;
    }
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function buildCommands(options, manifest) {
  const concordancePath = manifest.outputs?.concordance_json?.path || 'data/workbench-evidence/usage-concordance.json';
  const commands = { ...(manifest.commands || {}) };
  commands.build_cluster_index = `node scripts/build_workbench_usage_cluster_index.mjs --concordance=${concordancePath} --output=${options.clusterIndex} --report=reports/workbench-usage-cluster-index.md --max-samples=8`;
  commands.validate_cluster_index = `node scripts/validate_workbench_usage_cluster_index.mjs ${options.clusterIndex}`;
  commands.build_route_coverage = `node scripts/build_workbench_usage_route_coverage.mjs --concordance=${concordancePath} --output=${options.routeCoverage} --report=reports/workbench-usage-route-coverage.md --max-samples=8`;
  commands.validate_route_coverage = `node scripts/validate_workbench_usage_route_coverage.mjs ${options.routeCoverage}`;
  commands.build_sample_index = `node scripts/build_workbench_usage_sample_index.mjs --concordance=${concordancePath} --output=${options.sampleIndex} --report=reports/workbench-usage-sample-index.md --max-samples-per-status=5`;
  commands.validate_sample_index = `node scripts/validate_workbench_usage_sample_index.mjs ${options.sampleIndex}`;
  commands.build_lookup_index = `node scripts/build_workbench_usage_lookup_index.mjs --concordance=${concordancePath} --output=${options.lookupIndex} --report=reports/workbench-usage-lookup-index.md --max-works=25`;
  commands.validate_lookup_index = `node scripts/validate_workbench_usage_lookup_index.mjs ${options.lookupIndex}`;
  commands.build_work_frame_matrix = `node scripts/build_workbench_usage_work_frame_matrix.mjs --concordance=${concordancePath} --output=${options.workFrameMatrix} --report=reports/workbench-usage-work-frame-matrix.md`;
  commands.validate_work_frame_matrix = `node scripts/validate_workbench_usage_work_frame_matrix.mjs ${options.workFrameMatrix}`;
  commands.build_search_rows = `node scripts/build_workbench_usage_search_rows.mjs --concordance=${concordancePath} --output=${options.searchRows} --report=reports/workbench-usage-search-rows.md`;
  commands.validate_search_rows = `node scripts/validate_workbench_usage_search_rows.mjs ${options.searchRows}`;
  commands.build_provenance_index = `node scripts/build_workbench_usage_provenance_index.mjs --search-rows=${options.searchRows} --output=${options.provenanceIndex} --report=reports/workbench-usage-provenance-index.md`;
  commands.validate_provenance_index = `node scripts/validate_workbench_usage_provenance_index.mjs ${options.provenanceIndex}`;
  commands.build_search_shard_index = `node scripts/build_workbench_usage_search_shard_index.mjs --search-rows=${options.searchRows} --output=${options.searchShardIndex} --report=reports/workbench-usage-search-shard-index.md`;
  commands.validate_search_shard_index = `node scripts/validate_workbench_usage_search_shard_index.mjs ${options.searchShardIndex}`;
  commands.build_refresh_priority_index = `node scripts/build_workbench_usage_refresh_priority_index.mjs --source-freshness=.local-cache/workbench-evidence/source-freshness.json --search-rows=${options.searchRows} --output=${options.refreshPriorityIndex} --report=reports/workbench-usage-refresh-priority-index.md`;
  commands.validate_refresh_priority_index = `node scripts/validate_workbench_usage_refresh_priority_index.mjs ${options.refreshPriorityIndex}`;
  commands.build_unit_density_index = `node scripts/build_workbench_usage_unit_density_index.mjs --search-rows=${options.searchRows} --output=${options.unitDensityIndex} --report=reports/workbench-usage-unit-density-index.md`;
  commands.validate_unit_density_index = `node scripts/validate_workbench_usage_unit_density_index.mjs ${options.unitDensityIndex}`;
  commands.build_phrase_recurrence_index = `node scripts/build_workbench_usage_phrase_recurrence_index.mjs --search-rows=${options.searchRows} --output=${options.phraseRecurrenceIndex} --report=reports/workbench-usage-phrase-recurrence-index.md`;
  commands.validate_phrase_recurrence_index = `node scripts/validate_workbench_usage_phrase_recurrence_index.mjs ${options.phraseRecurrenceIndex}`;
  commands.build_context_offset_index = `node scripts/build_workbench_usage_context_offset_index.mjs --search-rows=${options.searchRows} --output=${options.contextOffsetIndex} --report=reports/workbench-usage-context-offset-index.md`;
  commands.validate_context_offset_index = `node scripts/validate_workbench_usage_context_offset_index.mjs ${options.contextOffsetIndex}`;
  commands.build_context_signature_index = `node scripts/build_workbench_usage_context_signature_index.mjs --search-rows=${options.searchRows} --output=${options.contextSignatureIndex} --report=reports/workbench-usage-context-signature-index.md`;
  commands.validate_context_signature_index = `node scripts/validate_workbench_usage_context_signature_index.mjs ${options.contextSignatureIndex}`;
  commands.build_context_signature_lookup = `node scripts/build_workbench_usage_context_signature_lookup.mjs --search-rows=${options.searchRows} --context-signature-index=${options.contextSignatureIndex} --output=${options.contextSignatureLookup} --report=reports/workbench-usage-context-signature-lookup.md`;
  commands.validate_context_signature_lookup = `node scripts/validate_workbench_usage_context_signature_lookup.mjs ${options.contextSignatureLookup}`;
  commands.build_context_signature_contrast = `node scripts/build_workbench_usage_context_signature_contrast.mjs --search-rows=${options.searchRows} --context-signature-index=${options.contextSignatureIndex} --output=${options.contextSignatureContrast} --report=reports/workbench-usage-context-signature-contrast.md`;
  commands.validate_context_signature_contrast = `node scripts/validate_workbench_usage_context_signature_contrast.mjs ${options.contextSignatureContrast}`;
  commands.build_selected_slice = `node scripts/build_workbench_usage_slice_index.mjs --concordance=${concordancePath} --work-prefix=tanakh/ --slice-id=tanakh-workbench-section --label="Tanakh workbench section" --output=${options.selectedSlice} --report=reports/workbench-usage-slice-tanakh.md --max-samples=30`;
  commands.validate_selected_slice = `node scripts/validate_workbench_usage_slice_index.mjs ${options.selectedSlice}`;
  commands.build_selected_slice_jeremiah = `node scripts/build_workbench_usage_slice_index.mjs --concordance=${concordancePath} --source-ref-prefix=Jeremiah --slice-id=jeremiah-workbench-section --label="Jeremiah workbench section" --output=${path.posix.dirname(options.selectedSlice)}/usage-slice-jeremiah.json --report=reports/workbench-usage-slice-jeremiah.md --max-samples=30`;
  commands.validate_selected_slice_jeremiah = `node scripts/validate_workbench_usage_slice_index.mjs ${path.posix.dirname(options.selectedSlice)}/usage-slice-jeremiah.json`;
  commands.build_selected_slices_index = `node scripts/build_workbench_usage_selected_slices_index.mjs --slices-dir=${path.posix.dirname(options.selectedSlice)} --output=${options.selectedSlicesIndex} --report=reports/workbench-usage-selected-slices-index.md`;
  commands.validate_selected_slices_index = `node scripts/validate_workbench_usage_selected_slices_index.mjs ${options.selectedSlicesIndex}`;
  commands.build_selected_occurrences = `node scripts/build_workbench_usage_selected_occurrences.mjs --selected-slices-index=${options.selectedSlicesIndex} --output=${options.selectedOccurrences} --report=reports/workbench-usage-selected-occurrences.md`;
  commands.validate_selected_occurrences = `node scripts/validate_workbench_usage_selected_occurrences.mjs ${options.selectedOccurrences}`;
  commands.build_selected_signature_independence = `node scripts/build_workbench_usage_selected_signature_independence.mjs --selected-occurrences=${options.selectedOccurrences} --context-signature-lookup=${options.contextSignatureLookup} --output=${options.selectedSignatureIndependence} --report=reports/workbench-usage-selected-signature-independence.md`;
  commands.validate_selected_signature_independence = `node scripts/validate_workbench_usage_selected_signature_independence.mjs ${options.selectedSignatureIndependence}`;
  commands.build_selected_source_diversity = `node scripts/build_workbench_usage_selected_source_diversity.mjs --selected-occurrences=${options.selectedOccurrences} --selected-signature-independence=${options.selectedSignatureIndependence} --output=${options.selectedSourceDiversity} --report=reports/workbench-usage-selected-source-diversity.md`;
  commands.validate_selected_source_diversity = `node scripts/validate_workbench_usage_selected_source_diversity.mjs ${options.selectedSourceDiversity}`;
  commands.build_selected_route_concentration_response = `node scripts/build_workbench_usage_selected_route_concentration_response.mjs --concentration-packet=${options.concentrationPacket} --selected-source-diversity=${options.selectedSourceDiversity} --selected-signature-independence=${options.selectedSignatureIndependence} --output=${options.selectedRouteConcentrationResponse} --report=reports/workbench-usage-selected-route-concentration-response.md`;
  commands.validate_selected_route_concentration_response = `node scripts/validate_workbench_usage_selected_route_concentration_response.mjs ${options.selectedRouteConcentrationResponse}`;
  commands.build_selected_occurrence_cards = `node scripts/build_workbench_usage_selected_occurrence_cards.mjs --selected-occurrences=${options.selectedOccurrences} --selected-source-diversity=${options.selectedSourceDiversity} --selected-signature-independence=${options.selectedSignatureIndependence} --selected-route-concentration-response=${options.selectedRouteConcentrationResponse} --output=${options.selectedOccurrenceCards} --report=reports/workbench-usage-selected-occurrence-cards.md`;
  commands.validate_selected_occurrence_cards = `node scripts/validate_workbench_usage_selected_occurrence_cards.mjs ${options.selectedOccurrenceCards}`;
  commands.build_selected_route_resolution = `node scripts/build_workbench_usage_selected_route_resolution.mjs --selected-occurrence-cards=${options.selectedOccurrenceCards} --route-coverage=${options.routeCoverage} --route-link-check=${options.routeLinkCheck} --output=${options.selectedRouteResolution} --report=reports/workbench-usage-selected-route-resolution.md`;
  commands.validate_selected_route_resolution = `node scripts/validate_workbench_usage_selected_route_resolution.mjs ${options.selectedRouteResolution}`;
  commands.build_selected_qa_package = `node scripts/build_workbench_usage_selected_qa_package.mjs --selected-occurrence-cards=${options.selectedOccurrenceCards} --selected-source-diversity=${options.selectedSourceDiversity} --selected-signature-independence=${options.selectedSignatureIndependence} --selected-route-concentration-response=${options.selectedRouteConcentrationResponse} --selected-route-resolution=${options.selectedRouteResolution} --selected-occurrence-lookup=${options.selectedOccurrenceLookup} --crossmatch-links=${options.crossmatchLinks} --crossmatch-bridge-index=${options.crossmatchBridgeIndex} --crossmatch-neighborhoods=${options.crossmatchNeighborhoods} --output=${options.selectedQaPackage} --report=reports/workbench-usage-selected-qa-package.md`;
  commands.validate_selected_qa_package = `node scripts/validate_workbench_usage_selected_qa_package.mjs ${options.selectedQaPackage}`;
  commands.build_selected_occurrence_lookup = `node scripts/build_workbench_usage_selected_occurrence_lookup.mjs --selected-occurrences=${options.selectedOccurrences} --output=${options.selectedOccurrenceLookup} --report=reports/workbench-usage-selected-occurrence-lookup.md --max-samples=5`;
  commands.validate_selected_occurrence_lookup = `node scripts/validate_workbench_usage_selected_occurrence_lookup.mjs ${options.selectedOccurrenceLookup}`;
  commands.build_crossmatch_links = `node scripts/build_workbench_usage_crossmatch_links.mjs --selected-occurrences=${options.selectedOccurrences} --output=${options.crossmatchLinks} --report=reports/workbench-usage-crossmatch-links.md`;
  commands.validate_crossmatch_links = `node scripts/validate_workbench_usage_crossmatch_links.mjs ${options.crossmatchLinks}`;
  commands.build_crossmatch_bridge_index = `node scripts/build_workbench_usage_crossmatch_bridge_index.mjs --crossmatch-links=${options.crossmatchLinks} --output=${options.crossmatchBridgeIndex} --report=reports/workbench-usage-crossmatch-bridge-index.md`;
  commands.validate_crossmatch_bridge_index = `node scripts/validate_workbench_usage_crossmatch_bridge_index.mjs ${options.crossmatchBridgeIndex}`;
  commands.build_crossmatch_neighborhoods = `node scripts/build_workbench_usage_crossmatch_neighborhoods.mjs --crossmatch-links=${options.crossmatchLinks} --output=${options.crossmatchNeighborhoods} --report=reports/workbench-usage-crossmatch-neighborhoods.md`;
  commands.validate_crossmatch_neighborhoods = `node scripts/validate_workbench_usage_crossmatch_neighborhoods.mjs ${options.crossmatchNeighborhoods}`;
  commands.build_agent6_boundary_packet = `node scripts/build_workbench_usage_agent6_boundary_packet.mjs --handoff=${options.output} --selected-occurrences=${options.selectedOccurrences} --selected-occurrence-lookup=${options.selectedOccurrenceLookup} --route-link-check=${options.routeLinkCheck} --audit-review=${options.auditReview} --smoke-validation=${options.smokeValidation || '.local-cache/workbench-evidence/smoke-pipeline-validation.json'} --output=${options.agent6BoundaryPacket} --report=reports/workbench-usage-agent6-boundary-packet.md`;
  commands.validate_agent6_boundary_packet = `node scripts/validate_workbench_usage_agent6_boundary_packet.mjs ${options.agent6BoundaryPacket}`;
  commands.build_concentration_packet = `node scripts/build_workbench_usage_concentration_packet.mjs --selected-occurrences=${options.selectedOccurrences} --selected-occurrence-lookup=${options.selectedOccurrenceLookup} --output=${options.concentrationPacket} --report=reports/workbench-usage-concentration-packet.md`;
  commands.validate_concentration_packet = `node scripts/validate_workbench_usage_concentration_packet.mjs ${options.concentrationPacket}`;
  commands.build_handoff_index = [
    'node scripts/build_workbench_usage_handoff_index.mjs',
    `--manifest=${options.manifest}`,
    `--occurrence-link-check=${options.occurrenceLinkCheck}`,
    `--route-link-check=${options.routeLinkCheck}`,
    `--audit-review=${options.auditReview}`,
    `--cluster-index=${options.clusterIndex}`,
    `--route-coverage=${options.routeCoverage}`,
    `--sample-index=${options.sampleIndex}`,
    `--lookup-index=${options.lookupIndex}`,
    `--work-frame-matrix=${options.workFrameMatrix}`,
    `--search-rows=${options.searchRows}`,
    `--provenance-index=${options.provenanceIndex}`,
    `--search-shard-index=${options.searchShardIndex}`,
    `--refresh-priority-index=${options.refreshPriorityIndex}`,
    `--unit-density-index=${options.unitDensityIndex}`,
    `--phrase-recurrence-index=${options.phraseRecurrenceIndex}`,
    `--context-offset-index=${options.contextOffsetIndex}`,
    `--context-signature-index=${options.contextSignatureIndex}`,
    `--context-signature-lookup=${options.contextSignatureLookup}`,
    `--context-signature-contrast=${options.contextSignatureContrast}`,
    `--selected-slice=${options.selectedSlice}`,
    `--selected-slices-index=${options.selectedSlicesIndex}`,
    `--selected-occurrences=${options.selectedOccurrences}`,
    `--selected-signature-independence=${options.selectedSignatureIndependence}`,
    `--selected-source-diversity=${options.selectedSourceDiversity}`,
    `--selected-route-concentration-response=${options.selectedRouteConcentrationResponse}`,
    `--selected-occurrence-cards=${options.selectedOccurrenceCards}`,
    `--selected-route-resolution=${options.selectedRouteResolution}`,
    `--selected-qa-package=${options.selectedQaPackage}`,
    `--selected-occurrence-lookup=${options.selectedOccurrenceLookup}`,
    `--crossmatch-links=${options.crossmatchLinks}`,
    `--crossmatch-bridge-index=${options.crossmatchBridgeIndex}`,
    `--crossmatch-neighborhoods=${options.crossmatchNeighborhoods}`,
    `--agent6-boundary-packet=${options.agent6BoundaryPacket}`,
    `--concentration-packet=${options.concentrationPacket}`,
    options.smokeValidation ? `--smoke-validation=${options.smokeValidation}` : '--no-smoke-validation',
    `--output=${options.output}`,
    `--report=${options.report}`,
  ].join(' ');
  commands.validate_handoff_index = `node scripts/validate_workbench_usage_handoff_index.mjs ${options.output}`;
  return commands;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

function readJsonIfExists(relativePath) {
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  if (!fs.existsSync(fullPath)) return null;
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function writeJson(relativePath, data) {
  writeText(relativePath, `${JSON.stringify(data, null, 2)}\n`);
}

function writeText(relativePath, text) {
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, text, 'utf8');
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
