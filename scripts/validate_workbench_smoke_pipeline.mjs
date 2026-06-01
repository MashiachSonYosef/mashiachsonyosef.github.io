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
  `--selected-slice=${usageSelectedSliceJson}`,
  `--selected-slices-index=${usageSelectedSlicesIndexJson}`,
  `--selected-occurrences=${usageSelectedOccurrencesJson}`,
  `--selected-occurrence-lookup=${usageSelectedOccurrenceLookupJson}`,
  `--crossmatch-links=${usageCrossmatchLinksJson}`,
  `--crossmatch-bridge-index=${usageCrossmatchBridgeIndexJson}`,
  `--crossmatch-neighborhoods=${usageCrossmatchNeighborhoodsJson}`,
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
const usageSelectedSlice = readJsonIfExists(usageSelectedSliceJson);
const usageSelectedSlicesIndex = readJsonIfExists(usageSelectedSlicesIndexJson);
const usageSelectedOccurrences = readJsonIfExists(usageSelectedOccurrencesJson);
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
    `- Usage selected slice: ${artifact.counts.usage_selected_slice_status}, id ${artifact.counts.usage_selected_slice_id}, rows ${artifact.counts.usage_selected_slice_rows}, works ${artifact.counts.usage_selected_slice_works}`,
    `- Usage selected slices index: ${artifact.counts.usage_selected_slices_index_status}, slices ${artifact.counts.usage_selected_slices_index_slices}, rows ${artifact.counts.usage_selected_slices_index_rows}, unique occurrences ${artifact.counts.usage_selected_slices_index_unique_occurrences}, duplicate rows ${artifact.counts.usage_selected_slices_index_duplicate_rows}`,
    `- Usage selected occurrences: ${artifact.counts.usage_selected_occurrences_status}, rows ${artifact.counts.usage_selected_occurrence_rows}, memberships ${artifact.counts.usage_selected_occurrence_memberships}, duplicate memberships ${artifact.counts.usage_selected_occurrence_duplicate_memberships}`,
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
