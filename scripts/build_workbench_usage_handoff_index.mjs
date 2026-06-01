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
  searchShardIndex: '.local-cache/workbench-evidence/usage-search-shard-index.json',
  refreshPriorityIndex: '.local-cache/workbench-evidence/usage-refresh-priority-index.json',
  unitDensityIndex: '.local-cache/workbench-evidence/usage-unit-density-index.json',
  selectedSlice: '.local-cache/workbench-evidence/usage-slice-tanakh.json',
  selectedSlicesIndex: '.local-cache/workbench-evidence/usage-selected-slices-index.json',
  selectedOccurrences: '.local-cache/workbench-evidence/usage-selected-occurrences.json',
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
const searchShardIndex = readJsonIfExists(options.searchShardIndex);
const refreshPriorityIndex = readJsonIfExists(options.refreshPriorityIndex);
const unitDensityIndex = readJsonIfExists(options.unitDensityIndex);
const selectedSlice = readJsonIfExists(options.selectedSlice);
const selectedSlicesIndex = readJsonIfExists(options.selectedSlicesIndex);
const selectedOccurrences = readJsonIfExists(options.selectedOccurrences);
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
    search_shard_index: options.searchShardIndex,
    refresh_priority_index: options.refreshPriorityIndex,
    unit_density_index: options.unitDensityIndex,
    selected_slice: options.selectedSlice,
    selected_slices_index: options.selectedSlicesIndex,
    selected_occurrences: options.selectedOccurrences,
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
    search_shard_index_report: 'reports/workbench-usage-search-shard-index.md',
    refresh_priority_index_report: 'reports/workbench-usage-refresh-priority-index.md',
    unit_density_index_report: 'reports/workbench-usage-unit-density-index.md',
    selected_slice_report: 'reports/workbench-usage-slice-tanakh.md',
    selected_slices_index_report: 'reports/workbench-usage-selected-slices-index.md',
    selected_occurrences_report: 'reports/workbench-usage-selected-occurrences.md',
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
    selected_slice_rows: selectedSlice?.counts?.slice_rows ?? null,
    selected_slice_works: selectedSlice?.counts?.works ?? null,
    selected_slices_index_slices: selectedSlicesIndex?.counts?.slices ?? null,
    selected_slices_index_rows: selectedSlicesIndex?.counts?.rows ?? null,
    selected_slices_index_unique_occurrences: selectedSlicesIndex?.deduped_counts?.occurrence_refs ?? null,
    selected_slices_index_duplicate_rows: selectedSlicesIndex?.deduped_counts?.duplicate_slice_rows ?? null,
    selected_occurrence_rows: selectedOccurrences?.counts?.occurrence_refs ?? null,
    selected_occurrence_memberships: selectedOccurrences?.counts?.slice_memberships ?? null,
    selected_occurrence_duplicate_memberships: selectedOccurrences?.counts?.duplicate_slice_memberships ?? null,
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
    selected_slice_status: selectedSlice?.artifact_type === 'workbench_usage_navigation_slice_index' ? 'present' : 'not_run',
    selected_slice_id: selectedSlice?.filter?.slice_id ?? null,
    selected_slice_rows: selectedSlice?.counts?.slice_rows ?? null,
    selected_slices_index_status: selectedSlicesIndex?.artifact_type === 'workbench_usage_navigation_selected_slices_index' ? 'present' : 'not_run',
    selected_slices_index_slices: selectedSlicesIndex?.counts?.slices ?? null,
    selected_slices_index_unique_occurrences: selectedSlicesIndex?.deduped_counts?.occurrence_refs ?? null,
    selected_occurrences_status: selectedOccurrences?.artifact_type === 'workbench_usage_navigation_selected_occurrences' ? 'present' : 'not_run',
    selected_occurrence_rows: selectedOccurrences?.counts?.occurrence_refs ?? null,
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
    `- Search shard index: shards ${artifact.counts.search_shard_index_shards}, rows ${artifact.counts.search_shard_index_rows}, categories ${artifact.counts.search_shard_index_categories}, clusters ${artifact.counts.search_shard_index_clusters}, statuses ${artifact.counts.search_shard_index_statuses}`,
    `- Search shard index route payload-like field hits: ${artifact.counts.search_shard_index_route_payload_field_hits}`,
    `- Refresh priority: pending ${artifact.counts.refresh_priority_pending_files}, known-use candidates ${artifact.counts.refresh_priority_known_usage_candidates}, review-only ${artifact.counts.refresh_priority_review_only_not_promoted}, promoted ${artifact.counts.refresh_priority_promoted_run_targets}`,
    `- Refresh priority blocked broad refresh files: ${artifact.counts.refresh_priority_blocked_broad_refresh_files}`,
    `- Refresh priority route payload-like field hits: ${artifact.counts.refresh_priority_route_payload_field_hits}`,
    `- Unit density: units ${artifact.counts.unit_density_units}, rows ${artifact.counts.unit_density_rows}, multi-occurrence units ${artifact.counts.unit_density_multi_occurrence_units}, max occurrences per unit ${artifact.counts.unit_density_max_occurrences_per_unit}, works ${artifact.counts.unit_density_works}`,
    `- Unit density route payload-like field hits: ${artifact.counts.unit_density_route_payload_field_hits}`,
    `- Selected slice rows: ${artifact.counts.selected_slice_rows}`,
    `- Selected slice works: ${artifact.counts.selected_slice_works}`,
    `- Selected slices index: ${artifact.counts.selected_slices_index_slices}`,
    `- Selected slices index rows: ${artifact.counts.selected_slices_index_rows}`,
    `- Selected slices unique occurrences: ${artifact.counts.selected_slices_index_unique_occurrences}`,
    `- Selected slices duplicate rows: ${artifact.counts.selected_slices_index_duplicate_rows}`,
    `- Selected occurrence rows: ${artifact.counts.selected_occurrence_rows}`,
    `- Selected occurrence memberships: ${artifact.counts.selected_occurrence_memberships}`,
    `- Selected occurrence duplicate memberships: ${artifact.counts.selected_occurrence_duplicate_memberships}`,
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
    `- Search shard index: ${artifact.validation.search_shard_index_status}, shards ${artifact.validation.search_shard_index_shards}, rows ${artifact.validation.search_shard_index_rows}, failed ${artifact.validation.search_shard_index_failed_checks}`,
    `- Search shard index route payload-like field hits: ${artifact.validation.search_shard_index_route_payload_field_hits}`,
    `- Refresh priority: ${artifact.validation.refresh_priority_index_status}, pending ${artifact.validation.refresh_priority_pending_files}, known-use candidates ${artifact.validation.refresh_priority_known_usage_candidates}, promoted ${artifact.validation.refresh_priority_promoted_run_targets}, failed ${artifact.validation.refresh_priority_failed_checks}`,
    `- Refresh priority route payload-like field hits: ${artifact.validation.refresh_priority_route_payload_field_hits}`,
    `- Unit density: ${artifact.validation.unit_density_index_status}, units ${artifact.validation.unit_density_units}, rows ${artifact.validation.unit_density_rows}, multi-occurrence units ${artifact.validation.unit_density_multi_occurrence_units}, failed ${artifact.validation.unit_density_failed_checks}`,
    `- Unit density route payload-like field hits: ${artifact.validation.unit_density_route_payload_field_hits}`,
    `- Selected slice: ${artifact.validation.selected_slice_status}, id ${artifact.validation.selected_slice_id}, rows ${artifact.validation.selected_slice_rows}`,
    `- Selected slices index: ${artifact.validation.selected_slices_index_status}, slices ${artifact.validation.selected_slices_index_slices}, unique occurrences ${artifact.validation.selected_slices_index_unique_occurrences}`,
    `- Selected occurrences: ${artifact.validation.selected_occurrences_status}, rows ${artifact.validation.selected_occurrence_rows}`,
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
    `| search shard index | ${mdCell(artifact.artifacts.search_shard_index_report)} | yes |`,
    `| refresh priority index | ${mdCell(artifact.artifacts.refresh_priority_index_report)} | yes |`,
    `| unit density index | ${mdCell(artifact.artifacts.unit_density_index_report)} | yes |`,
    `| selected slice | ${mdCell(artifact.artifacts.selected_slice_report)} | yes |`,
    `| selected slices index | ${mdCell(artifact.artifacts.selected_slices_index_report)} | yes |`,
    `| selected occurrences | ${mdCell(artifact.artifacts.selected_occurrences_report)} | yes |`,
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
    else if (arg.startsWith('--search-shard-index=')) parsed.searchShardIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--refresh-priority-index=')) parsed.refreshPriorityIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--unit-density-index=')) parsed.unitDensityIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-slice=')) parsed.selectedSlice = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-slices-index=')) parsed.selectedSlicesIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-occurrences=')) parsed.selectedOccurrences = cleanRelativePath(valueAfterEquals(arg));
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
  commands.build_search_shard_index = `node scripts/build_workbench_usage_search_shard_index.mjs --search-rows=${options.searchRows} --output=${options.searchShardIndex} --report=reports/workbench-usage-search-shard-index.md`;
  commands.validate_search_shard_index = `node scripts/validate_workbench_usage_search_shard_index.mjs ${options.searchShardIndex}`;
  commands.build_refresh_priority_index = `node scripts/build_workbench_usage_refresh_priority_index.mjs --source-freshness=.local-cache/workbench-evidence/source-freshness.json --search-rows=${options.searchRows} --output=${options.refreshPriorityIndex} --report=reports/workbench-usage-refresh-priority-index.md`;
  commands.validate_refresh_priority_index = `node scripts/validate_workbench_usage_refresh_priority_index.mjs ${options.refreshPriorityIndex}`;
  commands.build_unit_density_index = `node scripts/build_workbench_usage_unit_density_index.mjs --search-rows=${options.searchRows} --output=${options.unitDensityIndex} --report=reports/workbench-usage-unit-density-index.md`;
  commands.validate_unit_density_index = `node scripts/validate_workbench_usage_unit_density_index.mjs ${options.unitDensityIndex}`;
  commands.build_selected_slice = `node scripts/build_workbench_usage_slice_index.mjs --concordance=${concordancePath} --work-prefix=tanakh/ --slice-id=tanakh-workbench-section --label="Tanakh workbench section" --output=${options.selectedSlice} --report=reports/workbench-usage-slice-tanakh.md --max-samples=30`;
  commands.validate_selected_slice = `node scripts/validate_workbench_usage_slice_index.mjs ${options.selectedSlice}`;
  commands.build_selected_slice_jeremiah = `node scripts/build_workbench_usage_slice_index.mjs --concordance=${concordancePath} --source-ref-prefix=Jeremiah --slice-id=jeremiah-workbench-section --label="Jeremiah workbench section" --output=${path.posix.dirname(options.selectedSlice)}/usage-slice-jeremiah.json --report=reports/workbench-usage-slice-jeremiah.md --max-samples=30`;
  commands.validate_selected_slice_jeremiah = `node scripts/validate_workbench_usage_slice_index.mjs ${path.posix.dirname(options.selectedSlice)}/usage-slice-jeremiah.json`;
  commands.build_selected_slices_index = `node scripts/build_workbench_usage_selected_slices_index.mjs --slices-dir=${path.posix.dirname(options.selectedSlice)} --output=${options.selectedSlicesIndex} --report=reports/workbench-usage-selected-slices-index.md`;
  commands.validate_selected_slices_index = `node scripts/validate_workbench_usage_selected_slices_index.mjs ${options.selectedSlicesIndex}`;
  commands.build_selected_occurrences = `node scripts/build_workbench_usage_selected_occurrences.mjs --selected-slices-index=${options.selectedSlicesIndex} --output=${options.selectedOccurrences} --report=reports/workbench-usage-selected-occurrences.md`;
  commands.validate_selected_occurrences = `node scripts/validate_workbench_usage_selected_occurrences.mjs ${options.selectedOccurrences}`;
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
    `--search-shard-index=${options.searchShardIndex}`,
    `--refresh-priority-index=${options.refreshPriorityIndex}`,
    `--unit-density-index=${options.unitDensityIndex}`,
    `--selected-slice=${options.selectedSlice}`,
    `--selected-slices-index=${options.selectedSlicesIndex}`,
    `--selected-occurrences=${options.selectedOccurrences}`,
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
