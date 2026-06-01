#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  selectedOccurrenceCards: '.local-cache/workbench-evidence/usage-selected-occurrence-cards.json',
  selectedSourceDiversity: '.local-cache/workbench-evidence/usage-selected-source-diversity.json',
  selectedProvenanceMatrix: '.local-cache/workbench-evidence/usage-selected-provenance-matrix.json',
  selectedCollisionAudit: '.local-cache/workbench-evidence/usage-selected-collision-audit.json',
  selectedSignatureIndependence: '.local-cache/workbench-evidence/usage-selected-signature-independence.json',
  selectedRouteConcentrationResponse: '.local-cache/workbench-evidence/usage-selected-route-concentration-response.json',
  selectedRouteResolution: '.local-cache/workbench-evidence/usage-selected-route-resolution.json',
  selectedRouteProvenanceAudit: '.local-cache/workbench-evidence/usage-selected-route-provenance-audit.json',
  selectedFocusContextAudit: '.local-cache/workbench-evidence/usage-selected-focus-context-audit.json',
  selectedFrameSummary: '.local-cache/workbench-evidence/usage-selected-frame-summary.json',
  selectedWorkFrameMatrix: '.local-cache/workbench-evidence/usage-selected-work-frame-matrix.json',
  selectedOccurrenceLookup: '.local-cache/workbench-evidence/usage-selected-occurrence-lookup.json',
  crossmatchLinks: '.local-cache/workbench-evidence/usage-crossmatch-links.json',
  crossmatchBridgeIndex: '.local-cache/workbench-evidence/usage-crossmatch-bridge-index.json',
  crossmatchNeighborhoods: '.local-cache/workbench-evidence/usage-crossmatch-neighborhoods.json',
  output: '.local-cache/workbench-evidence/usage-selected-qa-package.json',
  report: 'reports/workbench-usage-selected-qa-package.md',
};

const options = parseArgs(process.argv.slice(2));
const artifacts = {
  selectedOccurrenceCards: readJson(options.selectedOccurrenceCards),
  selectedSourceDiversity: readJson(options.selectedSourceDiversity),
  selectedProvenanceMatrix: readJson(options.selectedProvenanceMatrix),
  selectedCollisionAudit: readJson(options.selectedCollisionAudit),
  selectedSignatureIndependence: readJson(options.selectedSignatureIndependence),
  selectedRouteConcentrationResponse: readJson(options.selectedRouteConcentrationResponse),
  selectedRouteResolution: readJson(options.selectedRouteResolution),
  selectedRouteProvenanceAudit: readJson(options.selectedRouteProvenanceAudit),
  selectedFocusContextAudit: readJson(options.selectedFocusContextAudit),
  selectedFrameSummary: readJson(options.selectedFrameSummary),
  selectedWorkFrameMatrix: readJson(options.selectedWorkFrameMatrix),
  selectedOccurrenceLookup: readJson(options.selectedOccurrenceLookup),
  crossmatchLinks: readJson(options.crossmatchLinks),
  crossmatchBridgeIndex: readJson(options.crossmatchBridgeIndex),
  crossmatchNeighborhoods: readJson(options.crossmatchNeighborhoods),
};

assertType(artifacts.selectedOccurrenceCards, 'workbench_usage_selected_occurrence_cards', options.selectedOccurrenceCards);
assertType(artifacts.selectedSourceDiversity, 'workbench_usage_selected_source_diversity', options.selectedSourceDiversity);
assertType(artifacts.selectedProvenanceMatrix, 'workbench_usage_selected_provenance_matrix', options.selectedProvenanceMatrix);
assertType(artifacts.selectedCollisionAudit, 'workbench_usage_selected_collision_audit', options.selectedCollisionAudit);
assertType(artifacts.selectedSignatureIndependence, 'workbench_usage_selected_signature_independence', options.selectedSignatureIndependence);
assertType(artifacts.selectedRouteConcentrationResponse, 'workbench_usage_selected_route_concentration_response', options.selectedRouteConcentrationResponse);
assertType(artifacts.selectedRouteResolution, 'workbench_usage_selected_route_resolution', options.selectedRouteResolution);
assertType(artifacts.selectedRouteProvenanceAudit, 'workbench_usage_selected_route_provenance_audit', options.selectedRouteProvenanceAudit);
assertType(artifacts.selectedFocusContextAudit, 'workbench_usage_selected_focus_context_audit', options.selectedFocusContextAudit);
assertType(artifacts.selectedFrameSummary, 'workbench_usage_selected_frame_summary', options.selectedFrameSummary);
assertType(artifacts.selectedWorkFrameMatrix, 'workbench_usage_selected_work_frame_matrix', options.selectedWorkFrameMatrix);
assertType(artifacts.selectedOccurrenceLookup, 'workbench_usage_navigation_selected_occurrence_lookup', options.selectedOccurrenceLookup);
assertType(artifacts.crossmatchLinks, 'workbench_usage_navigation_crossmatch_links', options.crossmatchLinks);
assertType(artifacts.crossmatchBridgeIndex, 'workbench_usage_navigation_crossmatch_bridge_index', options.crossmatchBridgeIndex);
assertType(artifacts.crossmatchNeighborhoods, 'workbench_usage_navigation_crossmatch_neighborhoods', options.crossmatchNeighborhoods);

const packageItems = buildPackageItems();
const counts = buildCounts(packageItems);
const checks = buildChecks(counts);
const failed = checks.filter((check) => check.status === 'failed');
const warnings = checks.filter((check) => check.status === 'warning');
const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_selected_qa_package',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_selected_qa_package.mjs',
  policy: 'Compact QA package for selected usage-navigation artifacts. It indexes existing selected occurrence, route resolution, source diversity, concentration, and crossmatch artifacts with counts and validation state only; it does not rank routes, select visible answers, translate, copy route payloads, or make meaning claims.',
  inputs: {
    selected_occurrence_cards: options.selectedOccurrenceCards,
    selected_source_diversity: options.selectedSourceDiversity,
    selected_provenance_matrix: options.selectedProvenanceMatrix,
    selected_collision_audit: options.selectedCollisionAudit,
    selected_signature_independence: options.selectedSignatureIndependence,
    selected_route_concentration_response: options.selectedRouteConcentrationResponse,
    selected_route_resolution: options.selectedRouteResolution,
    selected_route_provenance_audit: options.selectedRouteProvenanceAudit,
    selected_focus_context_audit: options.selectedFocusContextAudit,
    selected_frame_summary: options.selectedFrameSummary,
    selected_work_frame_matrix: options.selectedWorkFrameMatrix,
    selected_occurrence_lookup: options.selectedOccurrenceLookup,
    crossmatch_links: options.crossmatchLinks,
    crossmatch_bridge_index: options.crossmatchBridgeIndex,
    crossmatch_neighborhoods: options.crossmatchNeighborhoods,
  },
  authority_policy: {
    usage_navigation_only: true,
    audit_only: true,
    reader_facing: false,
    ranks_routes: false,
    selects_visible_result: false,
    ambiguous_rows_reader_facing: false,
    route_payloads_copied: false,
  },
  quality: {
    status: failed.length ? 'failed' : warnings.length ? 'pass_with_warnings' : 'passed',
    warning_count: warnings.length,
    failed_count: failed.length,
  },
  counts,
  checks,
  package_items: packageItems,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Selected QA package items ${artifact.counts.package_items}; selected rows ${artifact.counts.selected_rows}; route payload hits ${artifact.counts.route_payload_field_hits}`);

function buildPackageItems() {
  return [
    item('selected_occurrence_cards', options.selectedOccurrenceCards, 'reports/workbench-usage-selected-occurrence-cards.md', artifacts.selectedOccurrenceCards, {
      rows: artifacts.selectedOccurrenceCards.counts?.cards,
      source_refs: artifacts.selectedOccurrenceCards.counts?.unique_source_refs,
      works: artifacts.selectedOccurrenceCards.counts?.unique_works,
      route_ids: artifacts.selectedOccurrenceCards.counts?.route_ids,
      mojibake_rows: artifacts.selectedOccurrenceCards.counts?.mojibake_token_or_context_rows,
    }),
    item('selected_source_diversity', options.selectedSourceDiversity, 'reports/workbench-usage-selected-source-diversity.md', artifacts.selectedSourceDiversity, {
      rows: artifacts.selectedSourceDiversity.counts?.selected_occurrence_refs,
      source_refs: artifacts.selectedSourceDiversity.counts?.unique_source_refs,
      works: artifacts.selectedSourceDiversity.counts?.unique_works,
      licenses: artifacts.selectedSourceDiversity.counts?.unique_licenses,
    }),
    item('selected_provenance_matrix', options.selectedProvenanceMatrix, 'reports/workbench-usage-selected-provenance-matrix.md', artifacts.selectedProvenanceMatrix, {
      provenance_buckets: artifacts.selectedProvenanceMatrix.counts?.provenance_buckets,
      rows: artifacts.selectedProvenanceMatrix.counts?.selected_rows,
      licenses: artifacts.selectedProvenanceMatrix.counts?.unique_licenses,
      version_sources: artifacts.selectedProvenanceMatrix.counts?.unique_version_sources,
      rows_with_license_metadata: artifacts.selectedProvenanceMatrix.counts?.rows_with_license_metadata,
      rows_with_version_metadata: artifacts.selectedProvenanceMatrix.counts?.rows_with_version_metadata,
      missing_or_unrecognized_license_rows: artifacts.selectedProvenanceMatrix.counts?.missing_or_unrecognized_license_rows,
      samples: artifacts.selectedProvenanceMatrix.counts?.sample_occurrences,
    }),
    item('selected_collision_audit', options.selectedCollisionAudit, 'reports/workbench-usage-selected-collision-audit.md', artifacts.selectedCollisionAudit, {
      collision_buckets: artifacts.selectedCollisionAudit.counts?.collision_buckets,
      collision_occurrence_rows: artifacts.selectedCollisionAudit.counts?.collision_occurrence_rows,
      duplicate_source_ref_buckets: artifacts.selectedCollisionAudit.counts?.duplicate_source_ref_buckets,
      duplicate_work_anchor_buckets: artifacts.selectedCollisionAudit.counts?.duplicate_work_anchor_buckets,
      cross_frame_collision_buckets: artifacts.selectedCollisionAudit.counts?.cross_frame_collision_buckets,
    }),
    item('selected_signature_independence', options.selectedSignatureIndependence, 'reports/workbench-usage-selected-signature-independence.md', artifacts.selectedSignatureIndependence, {
      rows: artifacts.selectedSignatureIndependence.counts?.selected_occurrence_refs,
      rows_with_recurring: artifacts.selectedSignatureIndependence.counts?.occurrence_refs_with_recurring_signatures,
      rows_with_cross_cluster: artifacts.selectedSignatureIndependence.counts?.occurrence_refs_with_cross_cluster_signatures,
    }),
    item('selected_route_concentration_response', options.selectedRouteConcentrationResponse, 'reports/workbench-usage-selected-route-concentration-response.md', artifacts.selectedRouteConcentrationResponse, {
      rows: artifacts.selectedRouteConcentrationResponse.counts?.selected_occurrence_refs,
      route_buckets: artifacts.selectedRouteConcentrationResponse.counts?.route_id_buckets,
      warning_visible: artifacts.selectedRouteConcentrationResponse.counts?.route_concentration_warning_visible,
    }),
    item('selected_route_resolution', options.selectedRouteResolution, 'reports/workbench-usage-selected-route-resolution.md', artifacts.selectedRouteResolution, {
      selected_route_links: artifacts.selectedRouteResolution.counts?.selected_route_links,
      route_buckets: artifacts.selectedRouteResolution.counts?.route_id_buckets,
      unresolved_route_ids: artifacts.selectedRouteResolution.counts?.unresolved_route_ids,
    }),
    item('selected_route_provenance_audit', options.selectedRouteProvenanceAudit, 'reports/workbench-usage-selected-route-provenance-audit.md', artifacts.selectedRouteProvenanceAudit, {
      route_rows: artifacts.selectedRouteProvenanceAudit.counts?.route_rows,
      selected_route_links: artifacts.selectedRouteProvenanceAudit.counts?.selected_route_links,
      provenance_buckets: artifacts.selectedRouteProvenanceAudit.counts?.provenance_buckets,
      unresolved_route_rows: artifacts.selectedRouteProvenanceAudit.counts?.unresolved_route_rows,
      missing_provenance_rows: artifacts.selectedRouteProvenanceAudit.counts?.missing_provenance_rows,
      route_payload_copied_rows: artifacts.selectedRouteProvenanceAudit.counts?.route_payload_copied_rows,
      samples: artifacts.selectedRouteProvenanceAudit.counts?.sample_occurrences,
    }),
    item('selected_focus_context_audit', options.selectedFocusContextAudit, 'reports/workbench-usage-selected-focus-context-audit.md', artifacts.selectedFocusContextAudit, {
      rows: artifacts.selectedFocusContextAudit.counts?.rows,
      focus_marker_rows: artifacts.selectedFocusContextAudit.counts?.focus_marker_rows,
      focus_marker_mismatch_rows: artifacts.selectedFocusContextAudit.counts?.focus_marker_mismatch_rows,
      repeated_focus_context_rows: artifacts.selectedFocusContextAudit.counts?.repeated_focus_context_rows,
      missing_hebrew_context_rows: artifacts.selectedFocusContextAudit.counts?.missing_hebrew_context_rows,
    }),
    item('selected_frame_summary', options.selectedFrameSummary, 'reports/workbench-usage-selected-frame-summary.md', artifacts.selectedFrameSummary, {
      frames: artifacts.selectedFrameSummary.counts?.frames,
      selected_rows: artifacts.selectedFrameSummary.counts?.selected_rows,
      repeated_focus_context_rows: artifacts.selectedFrameSummary.counts?.repeated_focus_context_rows,
      sample_occurrences: artifacts.selectedFrameSummary.counts?.sample_occurrences,
    }),
    item('selected_work_frame_matrix', options.selectedWorkFrameMatrix, 'reports/workbench-usage-selected-work-frame-matrix.md', artifacts.selectedWorkFrameMatrix, {
      matrix_rows: artifacts.selectedWorkFrameMatrix.counts?.matrix_rows,
      selected_rows: artifacts.selectedWorkFrameMatrix.counts?.selected_rows,
      works: artifacts.selectedWorkFrameMatrix.counts?.works,
      frames: artifacts.selectedWorkFrameMatrix.counts?.frames,
      sample_occurrences: artifacts.selectedWorkFrameMatrix.counts?.sample_occurrences,
    }),
    item('selected_occurrence_lookup', options.selectedOccurrenceLookup, 'reports/workbench-usage-selected-occurrence-lookup.md', artifacts.selectedOccurrenceLookup, {
      rows: artifacts.selectedOccurrenceLookup.counts?.occurrence_refs,
      work_buckets: artifacts.selectedOccurrenceLookup.counts?.work_buckets,
      cluster_buckets: artifacts.selectedOccurrenceLookup.counts?.cluster_buckets,
      status_buckets: artifacts.selectedOccurrenceLookup.counts?.status_buckets,
    }),
    item('crossmatch_links', options.crossmatchLinks, 'reports/workbench-usage-crossmatch-links.md', artifacts.crossmatchLinks, {
      occurrence_refs: artifacts.crossmatchLinks.counts?.occurrence_refs,
      directed_edges: artifacts.crossmatchLinks.counts?.directed_edges,
      undirected_pairs: artifacts.crossmatchLinks.counts?.undirected_pairs,
    }),
    item('crossmatch_bridge_index', options.crossmatchBridgeIndex, 'reports/workbench-usage-crossmatch-bridge-index.md', artifacts.crossmatchBridgeIndex, {
      same_frame_edges: artifacts.crossmatchBridgeIndex.counts?.same_frame_edges,
      bridge_edges: artifacts.crossmatchBridgeIndex.counts?.bridge_edges,
      bridge_buckets: artifacts.crossmatchBridgeIndex.counts?.bridge_buckets,
    }),
    item('crossmatch_neighborhoods', options.crossmatchNeighborhoods, 'reports/workbench-usage-crossmatch-neighborhoods.md', artifacts.crossmatchNeighborhoods, {
      neighborhoods: artifacts.crossmatchNeighborhoods.counts?.neighborhoods,
      same_frame_neighbor_links: artifacts.crossmatchNeighborhoods.counts?.same_frame_neighbor_links,
      bridge_neighbor_links: artifacts.crossmatchNeighborhoods.counts?.bridge_neighbor_links,
    }),
  ];
}

function item(id, artifactPath, reportPath, source, summary) {
  return {
    item_id: id,
    artifact_type: source.artifact_type,
    artifact_path: artifactPath,
    report_path: reportPath,
    quality_status: source.quality?.status || 'not_applicable',
    failed_checks: Number(source.quality?.failed_count || source.quality?.issue_count || 0),
    warning_count: Number(source.quality?.warning_count || 0),
    reader_facing_rows: Number(source.counts?.reader_facing_rows || 0),
    route_payload_field_hits: Number(source.counts?.route_payload_field_hits || 0),
    summary,
  };
}

function buildCounts(items) {
  const selectedRows = Number(artifacts.selectedOccurrenceCards.counts?.cards || 0);
  return {
    package_items: items.length,
    selected_rows: selectedRows,
    selected_source_refs: Number(artifacts.selectedSourceDiversity.counts?.unique_source_refs || 0),
    selected_works: Number(artifacts.selectedSourceDiversity.counts?.unique_works || 0),
    selected_provenance_buckets: Number(artifacts.selectedProvenanceMatrix.counts?.provenance_buckets || 0),
    selected_provenance_rows: Number(artifacts.selectedProvenanceMatrix.counts?.selected_rows || 0),
    selected_provenance_licenses: Number(artifacts.selectedProvenanceMatrix.counts?.unique_licenses || 0),
    selected_provenance_version_sources: Number(artifacts.selectedProvenanceMatrix.counts?.unique_version_sources || 0),
    selected_provenance_rows_with_license_metadata: Number(artifacts.selectedProvenanceMatrix.counts?.rows_with_license_metadata || 0),
    selected_provenance_rows_with_version_metadata: Number(artifacts.selectedProvenanceMatrix.counts?.rows_with_version_metadata || 0),
    selected_provenance_missing_or_unrecognized_license_rows: Number(artifacts.selectedProvenanceMatrix.counts?.missing_or_unrecognized_license_rows || 0),
    selected_provenance_samples: Number(artifacts.selectedProvenanceMatrix.counts?.sample_occurrences || 0),
    selected_collision_buckets: Number(artifacts.selectedCollisionAudit.counts?.collision_buckets || 0),
    selected_collision_occurrence_rows: Number(artifacts.selectedCollisionAudit.counts?.collision_occurrence_rows || 0),
    selected_duplicate_source_ref_buckets: Number(artifacts.selectedCollisionAudit.counts?.duplicate_source_ref_buckets || 0),
    selected_duplicate_source_ref_rows: Number(artifacts.selectedCollisionAudit.counts?.duplicate_source_ref_rows || 0),
    selected_duplicate_work_anchor_buckets: Number(artifacts.selectedCollisionAudit.counts?.duplicate_work_anchor_buckets || 0),
    selected_duplicate_work_anchor_rows: Number(artifacts.selectedCollisionAudit.counts?.duplicate_work_anchor_rows || 0),
    selected_cross_frame_collision_buckets: Number(artifacts.selectedCollisionAudit.counts?.cross_frame_collision_buckets || 0),
    selected_cross_frame_collision_rows: Number(artifacts.selectedCollisionAudit.counts?.cross_frame_collision_rows || 0),
    selected_route_ids: Number(artifacts.selectedRouteResolution.counts?.route_id_buckets || 0),
    selected_route_links: Number(artifacts.selectedRouteResolution.counts?.selected_route_links || 0),
    unresolved_route_ids: Number(artifacts.selectedRouteResolution.counts?.unresolved_route_ids || 0),
    selected_route_provenance_rows: Number(artifacts.selectedRouteProvenanceAudit.counts?.route_rows || 0),
    selected_route_provenance_links: Number(artifacts.selectedRouteProvenanceAudit.counts?.selected_route_links || 0),
    selected_route_provenance_buckets: Number(artifacts.selectedRouteProvenanceAudit.counts?.provenance_buckets || 0),
    selected_route_provenance_unresolved_route_rows: Number(artifacts.selectedRouteProvenanceAudit.counts?.unresolved_route_rows || 0),
    selected_route_provenance_missing_provenance_rows: Number(artifacts.selectedRouteProvenanceAudit.counts?.missing_provenance_rows || 0),
    selected_route_provenance_payload_copied_rows: Number(artifacts.selectedRouteProvenanceAudit.counts?.route_payload_copied_rows || 0),
    selected_route_provenance_samples: Number(artifacts.selectedRouteProvenanceAudit.counts?.sample_occurrences || 0),
    selected_focus_context_rows: Number(artifacts.selectedFocusContextAudit.counts?.rows || 0),
    selected_focus_marker_rows: Number(artifacts.selectedFocusContextAudit.counts?.focus_marker_rows || 0),
    selected_focus_marker_mismatch_rows: Number(artifacts.selectedFocusContextAudit.counts?.focus_marker_mismatch_rows || 0),
    selected_repeated_focus_context_rows: Number(artifacts.selectedFocusContextAudit.counts?.repeated_focus_context_rows || 0),
    selected_missing_hebrew_context_rows: Number(artifacts.selectedFocusContextAudit.counts?.missing_hebrew_context_rows || 0),
    selected_frame_summary_frames: Number(artifacts.selectedFrameSummary.counts?.frames || 0),
    selected_frame_summary_rows: Number(artifacts.selectedFrameSummary.counts?.selected_rows || 0),
    selected_frame_summary_repeated_focus_rows: Number(artifacts.selectedFrameSummary.counts?.repeated_focus_context_rows || 0),
    selected_frame_summary_samples: Number(artifacts.selectedFrameSummary.counts?.sample_occurrences || 0),
    selected_work_frame_matrix_rows: Number(artifacts.selectedWorkFrameMatrix.counts?.matrix_rows || 0),
    selected_work_frame_matrix_selected_rows: Number(artifacts.selectedWorkFrameMatrix.counts?.selected_rows || 0),
    selected_work_frame_matrix_works: Number(artifacts.selectedWorkFrameMatrix.counts?.works || 0),
    selected_work_frame_matrix_frames: Number(artifacts.selectedWorkFrameMatrix.counts?.frames || 0),
    selected_work_frame_matrix_samples: Number(artifacts.selectedWorkFrameMatrix.counts?.sample_occurrences || 0),
    route_concentration_warning_visible: Number(artifacts.selectedRouteConcentrationResponse.counts?.route_concentration_warning_visible || 0),
    rows_with_recurring_signatures: Number(artifacts.selectedSignatureIndependence.counts?.occurrence_refs_with_recurring_signatures || 0),
    rows_with_cross_cluster_signatures: Number(artifacts.selectedSignatureIndependence.counts?.occurrence_refs_with_cross_cluster_signatures || 0),
    crossmatch_directed_edges: Number(artifacts.crossmatchLinks.counts?.directed_edges || 0),
    crossmatch_same_frame_edges: Number(artifacts.crossmatchBridgeIndex.counts?.same_frame_edges || 0),
    crossmatch_bridge_edges: Number(artifacts.crossmatchBridgeIndex.counts?.bridge_edges || 0),
    crossmatch_neighborhoods: Number(artifacts.crossmatchNeighborhoods.counts?.neighborhoods || 0),
    mojibake_rows: Number(artifacts.selectedOccurrenceCards.counts?.mojibake_token_or_context_rows || 0),
    reader_facing_rows: items.reduce((sum, row) => sum + Number(row.reader_facing_rows || 0), 0),
    route_payload_field_hits: items.reduce((sum, row) => sum + Number(row.route_payload_field_hits || 0), 0) + countForbiddenKeys(items),
    failed_checks: items.reduce((sum, row) => sum + Number(row.failed_checks || 0), 0),
  };
}

function buildChecks(counts) {
  return [
    check('package_items_present', counts.package_items === 15 ? 'passed' : 'failed', `package items ${counts.package_items}`),
    check('selected_rows_consistent', counts.selected_rows === Number(artifacts.selectedSourceDiversity.counts?.selected_occurrence_refs || 0) ? 'passed' : 'failed', `selected rows ${counts.selected_rows}`),
    check('selected_provenance_rows_complete', counts.selected_provenance_rows === counts.selected_rows ? 'passed' : 'failed', `provenance rows ${counts.selected_provenance_rows}; selected rows ${counts.selected_rows}`),
    check('selected_provenance_license_metadata_complete', counts.selected_provenance_rows_with_license_metadata === counts.selected_rows ? 'passed' : 'failed', `license metadata rows ${counts.selected_provenance_rows_with_license_metadata}; selected rows ${counts.selected_rows}`),
    check('selected_provenance_version_metadata_complete', counts.selected_provenance_rows_with_version_metadata === counts.selected_rows ? 'passed' : 'failed', `version metadata rows ${counts.selected_provenance_rows_with_version_metadata}; selected rows ${counts.selected_rows}`),
    check('selected_provenance_missing_license_zero', counts.selected_provenance_missing_or_unrecognized_license_rows === 0 ? 'passed' : 'failed', `missing or unrecognized license rows ${counts.selected_provenance_missing_or_unrecognized_license_rows}`),
    check('selected_provenance_samples_complete', counts.selected_provenance_samples === counts.selected_rows ? 'passed' : 'failed', `provenance samples ${counts.selected_provenance_samples}; selected rows ${counts.selected_rows}`),
    check('selected_collision_counts_match', counts.selected_duplicate_source_ref_buckets === Number(artifacts.selectedSourceDiversity.counts?.duplicate_source_ref_buckets || 0) && counts.selected_duplicate_work_anchor_buckets === Number(artifacts.selectedSourceDiversity.counts?.duplicate_work_anchor_buckets || 0) ? 'passed' : 'failed', `collision source buckets ${counts.selected_duplicate_source_ref_buckets}; work anchor buckets ${counts.selected_duplicate_work_anchor_buckets}`),
    check('selected_cross_frame_collisions_visible', counts.selected_cross_frame_collision_buckets > 0 ? 'passed' : 'failed', `cross-frame collision buckets ${counts.selected_cross_frame_collision_buckets}`),
    check('selected_route_links_complete', counts.selected_route_links === counts.selected_rows ? 'passed' : 'failed', `selected route links ${counts.selected_route_links}; selected rows ${counts.selected_rows}`),
    check('route_ids_resolved', counts.unresolved_route_ids === 0 ? 'passed' : 'failed', `unresolved route IDs ${counts.unresolved_route_ids}`),
    check('selected_route_provenance_links_complete', counts.selected_route_provenance_links === counts.selected_route_links ? 'passed' : 'failed', `route/provenance links ${counts.selected_route_provenance_links}; selected route links ${counts.selected_route_links}`),
    check('selected_route_provenance_rows_match_routes', counts.selected_route_provenance_rows === counts.selected_route_ids ? 'passed' : 'failed', `route/provenance rows ${counts.selected_route_provenance_rows}; route IDs ${counts.selected_route_ids}`),
    check('selected_route_provenance_buckets_match', counts.selected_route_provenance_buckets === counts.selected_provenance_buckets ? 'passed' : 'failed', `route/provenance buckets ${counts.selected_route_provenance_buckets}; provenance buckets ${counts.selected_provenance_buckets}`),
    check('selected_route_provenance_resolved', counts.selected_route_provenance_unresolved_route_rows === 0 ? 'passed' : 'failed', `unresolved route/provenance rows ${counts.selected_route_provenance_unresolved_route_rows}`),
    check('selected_route_provenance_present', counts.selected_route_provenance_missing_provenance_rows === 0 ? 'passed' : 'failed', `missing provenance rows ${counts.selected_route_provenance_missing_provenance_rows}`),
    check('selected_route_provenance_payload_not_copied', counts.selected_route_provenance_payload_copied_rows === 0 ? 'passed' : 'failed', `payload copied rows ${counts.selected_route_provenance_payload_copied_rows}`),
    check('selected_route_provenance_samples_complete', counts.selected_route_provenance_samples === counts.selected_route_links ? 'passed' : 'failed', `route/provenance samples ${counts.selected_route_provenance_samples}; selected route links ${counts.selected_route_links}`),
    check('selected_focus_context_complete', counts.selected_focus_context_rows === counts.selected_rows ? 'passed' : 'failed', `focus context rows ${counts.selected_focus_context_rows}; selected rows ${counts.selected_rows}`),
    check('selected_focus_markers_complete', counts.selected_focus_marker_rows === counts.selected_rows ? 'passed' : 'failed', `focus marker rows ${counts.selected_focus_marker_rows}; selected rows ${counts.selected_rows}`),
    check('selected_focus_marker_mismatch_zero', counts.selected_focus_marker_mismatch_rows === 0 ? 'passed' : 'failed', `focus marker mismatches ${counts.selected_focus_marker_mismatch_rows}`),
    check('selected_missing_hebrew_context_zero', counts.selected_missing_hebrew_context_rows === 0 ? 'passed' : 'failed', `missing Hebrew context rows ${counts.selected_missing_hebrew_context_rows}`),
    check('selected_frame_summary_complete', counts.selected_frame_summary_rows === counts.selected_rows ? 'passed' : 'failed', `frame summary rows ${counts.selected_frame_summary_rows}; selected rows ${counts.selected_rows}`),
    check('selected_frame_summary_has_frames', counts.selected_frame_summary_frames > 0 ? 'passed' : 'failed', `frame summary frames ${counts.selected_frame_summary_frames}`),
    check('selected_frame_summary_repeated_focus_matches', counts.selected_frame_summary_repeated_focus_rows === counts.selected_repeated_focus_context_rows ? 'passed' : 'failed', `frame repeated-focus ${counts.selected_frame_summary_repeated_focus_rows}; focus audit repeated-focus ${counts.selected_repeated_focus_context_rows}`),
    check('selected_work_frame_matrix_complete', counts.selected_work_frame_matrix_selected_rows === counts.selected_rows ? 'passed' : 'failed', `work/frame selected rows ${counts.selected_work_frame_matrix_selected_rows}; selected rows ${counts.selected_rows}`),
    check('selected_work_frame_matrix_has_buckets', counts.selected_work_frame_matrix_rows > 0 ? 'passed' : 'failed', `work/frame matrix rows ${counts.selected_work_frame_matrix_rows}`),
    check('selected_work_frame_matrix_frame_coverage', counts.selected_work_frame_matrix_frames === counts.selected_frame_summary_frames ? 'passed' : 'failed', `work/frame frames ${counts.selected_work_frame_matrix_frames}; frame summary frames ${counts.selected_frame_summary_frames}`),
    check('route_concentration_warning_visible', counts.route_concentration_warning_visible === 1 ? 'warning' : 'passed', `route concentration warning visible ${counts.route_concentration_warning_visible}`),
    check('crossmatch_partition_visible', counts.crossmatch_same_frame_edges + counts.crossmatch_bridge_edges === counts.crossmatch_directed_edges ? 'passed' : 'failed', `same-frame ${counts.crossmatch_same_frame_edges}; bridge ${counts.crossmatch_bridge_edges}; directed ${counts.crossmatch_directed_edges}`),
    check('crossmatch_neighborhoods_complete', counts.crossmatch_neighborhoods === counts.selected_rows ? 'passed' : 'failed', `neighborhoods ${counts.crossmatch_neighborhoods}; selected rows ${counts.selected_rows}`),
    check('mojibake_absent', counts.mojibake_rows === 0 ? 'passed' : 'failed', `mojibake rows ${counts.mojibake_rows}`),
    check('reader_facing_zero', counts.reader_facing_rows === 0 ? 'passed' : 'failed', `reader-facing rows ${counts.reader_facing_rows}`),
    check('route_payload_absent', counts.route_payload_field_hits === 0 ? 'passed' : 'failed', `route payload-like field hits ${counts.route_payload_field_hits}`),
    check('package_failed_checks_zero', counts.failed_checks === 0 ? 'passed' : 'failed', `failed checks ${counts.failed_checks}`),
  ];
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Selected QA Package',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Package items: ${artifact.counts.package_items}`,
    `- Selected rows: ${artifact.counts.selected_rows}`,
    `- Source refs: ${artifact.counts.selected_source_refs}`,
    `- Works: ${artifact.counts.selected_works}`,
    `- Provenance buckets: ${artifact.counts.selected_provenance_buckets}`,
    `- Provenance rows: ${artifact.counts.selected_provenance_rows}`,
    `- Provenance licenses: ${artifact.counts.selected_provenance_licenses}`,
    `- Provenance version sources: ${artifact.counts.selected_provenance_version_sources}`,
    `- Provenance rows with license metadata: ${artifact.counts.selected_provenance_rows_with_license_metadata}`,
    `- Provenance rows with version metadata: ${artifact.counts.selected_provenance_rows_with_version_metadata}`,
    `- Provenance missing or unrecognized license rows: ${artifact.counts.selected_provenance_missing_or_unrecognized_license_rows}`,
    `- Provenance samples: ${artifact.counts.selected_provenance_samples}`,
    `- Collision buckets: ${artifact.counts.selected_collision_buckets}`,
    `- Collision occurrence rows: ${artifact.counts.selected_collision_occurrence_rows}`,
    `- Duplicate source-ref buckets: ${artifact.counts.selected_duplicate_source_ref_buckets}`,
    `- Duplicate source-ref rows: ${artifact.counts.selected_duplicate_source_ref_rows}`,
    `- Duplicate work-anchor buckets: ${artifact.counts.selected_duplicate_work_anchor_buckets}`,
    `- Duplicate work-anchor rows: ${artifact.counts.selected_duplicate_work_anchor_rows}`,
    `- Cross-frame collision buckets: ${artifact.counts.selected_cross_frame_collision_buckets}`,
    `- Cross-frame collision rows: ${artifact.counts.selected_cross_frame_collision_rows}`,
    `- Route IDs: ${artifact.counts.selected_route_ids}`,
    `- Selected route links: ${artifact.counts.selected_route_links}`,
    `- Unresolved route IDs: ${artifact.counts.unresolved_route_ids}`,
    `- Route/provenance rows: ${artifact.counts.selected_route_provenance_rows}`,
    `- Route/provenance links: ${artifact.counts.selected_route_provenance_links}`,
    `- Route/provenance buckets: ${artifact.counts.selected_route_provenance_buckets}`,
    `- Route/provenance unresolved route rows: ${artifact.counts.selected_route_provenance_unresolved_route_rows}`,
    `- Route/provenance missing provenance rows: ${artifact.counts.selected_route_provenance_missing_provenance_rows}`,
    `- Route/provenance payload copied rows: ${artifact.counts.selected_route_provenance_payload_copied_rows}`,
    `- Route/provenance samples: ${artifact.counts.selected_route_provenance_samples}`,
    `- Focus context audit rows: ${artifact.counts.selected_focus_context_rows}`,
    `- Focus marker rows: ${artifact.counts.selected_focus_marker_rows}`,
    `- Focus marker mismatch rows: ${artifact.counts.selected_focus_marker_mismatch_rows}`,
    `- Repeated-focus context rows: ${artifact.counts.selected_repeated_focus_context_rows}`,
    `- Missing Hebrew context rows: ${artifact.counts.selected_missing_hebrew_context_rows}`,
    `- Frame summary frames: ${artifact.counts.selected_frame_summary_frames}`,
    `- Frame summary rows: ${artifact.counts.selected_frame_summary_rows}`,
    `- Frame summary repeated-focus rows: ${artifact.counts.selected_frame_summary_repeated_focus_rows}`,
    `- Frame summary samples: ${artifact.counts.selected_frame_summary_samples}`,
    `- Work/frame matrix rows: ${artifact.counts.selected_work_frame_matrix_rows}`,
    `- Work/frame matrix selected rows: ${artifact.counts.selected_work_frame_matrix_selected_rows}`,
    `- Work/frame matrix works: ${artifact.counts.selected_work_frame_matrix_works}`,
    `- Work/frame matrix frames: ${artifact.counts.selected_work_frame_matrix_frames}`,
    `- Work/frame matrix samples: ${artifact.counts.selected_work_frame_matrix_samples}`,
    `- Route concentration warning visible: ${artifact.counts.route_concentration_warning_visible}`,
    `- Rows with recurring signatures: ${artifact.counts.rows_with_recurring_signatures}`,
    `- Rows with cross-cluster signatures: ${artifact.counts.rows_with_cross_cluster_signatures}`,
    `- Crossmatch directed edges: ${artifact.counts.crossmatch_directed_edges}`,
    `- Crossmatch same-frame edges: ${artifact.counts.crossmatch_same_frame_edges}`,
    `- Crossmatch bridge edges: ${artifact.counts.crossmatch_bridge_edges}`,
    `- Crossmatch neighborhoods: ${artifact.counts.crossmatch_neighborhoods}`,
    `- Mojibake rows: ${artifact.counts.mojibake_rows}`,
    `- Reader-facing rows: ${artifact.counts.reader_facing_rows}`,
    `- Route payload-like field hits: ${artifact.counts.route_payload_field_hits}`,
    `- Failed checks: ${artifact.counts.failed_checks}`,
    '',
    '## Policy',
    '',
    'This package indexes selected usage-navigation artifacts for QA. It carries counts, validation state, links to reports, and artifact paths only; it does not rank routes, select visible answers, translate, or make meaning claims.',
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${[checkRow.id, checkRow.status, checkRow.detail].map(mdCell).join(' | ')} |`),
    '',
    '## Package Items',
    '',
    '| item | artifact type | artifact | report | quality | warnings | failed | reader-facing | route payload hits | summary |',
    '|---|---|---|---|---|---:|---:|---:|---:|---|',
    ...artifact.package_items.map((row) => `| ${[
      row.item_id,
      row.artifact_type,
      row.artifact_path,
      row.report_path,
      row.quality_status,
      row.warning_count,
      row.failed_checks,
      row.reader_facing_rows,
      row.route_payload_field_hits,
      Object.entries(row.summary || {}).map(([key, value]) => `${key}: ${value}`).join('<br>'),
    ].map(mdCell).join(' | ')} |`),
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function check(id, status, detail) {
  return { id, status, detail };
}

function assertType(artifact, expectedType, relativePath) {
  if (artifact.artifact_type !== expectedType) throw new Error(`${relativePath} is not ${expectedType}`);
}

function countForbiddenKeys(value) {
  const forbidden = new Set([
    'definition',
    'definition_text',
    'meaning',
    'meaning_claim',
    'translation',
    'translation_text',
    'english',
    'english_text',
    'english_translation',
    'imported_translation',
    'final_answer',
    'winner',
    'route_payload',
    'route_payloads',
    'route_links',
  ]);
  let hits = 0;
  walk(value);
  return hits;

  function walk(current) {
    if (Array.isArray(current)) {
      current.forEach(walk);
      return;
    }
    if (!current || typeof current !== 'object') return;
    for (const [key, item] of Object.entries(current)) {
      if (forbidden.has(key)) hits += 1;
      walk(item);
    }
  }
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--selected-occurrence-cards=')) parsed.selectedOccurrenceCards = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-source-diversity=')) parsed.selectedSourceDiversity = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-provenance-matrix=')) parsed.selectedProvenanceMatrix = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-collision-audit=')) parsed.selectedCollisionAudit = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-signature-independence=')) parsed.selectedSignatureIndependence = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-route-concentration-response=')) parsed.selectedRouteConcentrationResponse = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-route-resolution=')) parsed.selectedRouteResolution = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-route-provenance-audit=')) parsed.selectedRouteProvenanceAudit = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-focus-context-audit=')) parsed.selectedFocusContextAudit = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-frame-summary=')) parsed.selectedFrameSummary = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-work-frame-matrix=')) parsed.selectedWorkFrameMatrix = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-occurrence-lookup=')) parsed.selectedOccurrenceLookup = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--crossmatch-links=')) parsed.crossmatchLinks = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--crossmatch-bridge-index=')) parsed.crossmatchBridgeIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--crossmatch-neighborhoods=')) parsed.crossmatchNeighborhoods = cleanRelativePath(valueAfterEquals(arg));
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
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

function writeJson(relativePath, data) {
  writeText(relativePath, `${JSON.stringify(data, null, 2)}\n`);
}

function writeText(relativePath, text) {
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, text, 'utf8');
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}
