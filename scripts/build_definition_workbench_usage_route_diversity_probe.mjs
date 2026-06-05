#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  occurrenceDetailIndex: 'data/definitions/definition-workbench-usage-occurrence-detail-index.json',
  routeResolution: 'data/definitions/definition-workbench-usage-route-resolution.json',
  selectedSourceDiversity: '.local-cache/workbench-evidence/usage-selected-source-diversity.json',
  selectedSignatureIndependence: '.local-cache/workbench-evidence/usage-selected-signature-independence.json',
  output: 'data/definitions/definition-workbench-usage-route-diversity-probe.json',
  report: 'reports/definition-workbench-usage-route-diversity-probe.md',
};

const options = parseArgs(process.argv.slice(2));
const detailIndex = readJson(options.occurrenceDetailIndex);
const routeResolution = readJson(options.routeResolution);
const selectedSourceDiversity = readJson(options.selectedSourceDiversity);
const selectedSignatureIndependence = readJson(options.selectedSignatureIndependence);

if (detailIndex.artifact_type !== 'definition_workbench_usage_occurrence_detail_index') {
  throw new Error(`${options.occurrenceDetailIndex} is not a Definition Workbench usage occurrence-detail index`);
}
if (routeResolution.artifact_type !== 'definition_workbench_usage_route_resolution') {
  throw new Error(`${options.routeResolution} is not a Definition Workbench usage route-resolution packet`);
}
if (selectedSourceDiversity.artifact_type !== 'workbench_usage_selected_source_diversity') {
  throw new Error(`${options.selectedSourceDiversity} is not a selected source-diversity artifact`);
}
if (selectedSignatureIndependence.artifact_type !== 'workbench_usage_selected_signature_independence') {
  throw new Error(`${options.selectedSignatureIndependence} is not a selected signature-independence artifact`);
}

const detailRows = detailIndex.occurrence_details || [];
const routeRows = routeResolution.occurrence_route_rows || [];
const routeRowByOccurrence = new Map();
for (const row of routeRows) {
  if (!routeRowByOccurrence.has(row.occurrence_id)) routeRowByOccurrence.set(row.occurrence_id, []);
  routeRowByOccurrence.get(row.occurrence_id).push(row);
}

const occurrenceRouteLinks = detailRows.map(toOccurrenceRouteLink);
const routeProbes = buildRouteProbes();
const routeDiversity = buildRouteDiversity(routeProbes);
const coverageBuckets = buildCoverageBuckets();
const concentrationSupport = buildConcentrationSupport();
const counts = buildCounts();
const checks = buildChecks(counts);
const failed = checks.filter((check) => check.status === 'failed');
const warnings = checks.filter((check) => check.status === 'warning');

const artifact = {
  schema_version: 1,
  artifact_type: 'definition_workbench_usage_route_diversity_probe',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_definition_workbench_usage_route_diversity_probe.mjs',
  policy: 'Selected-scope Agent 3 Definition Workbench usage-navigation route-diversity probe. It makes route concentration visible for QA while preserving occurrence links, source/license/context fields, and route-ID-only linkage. It is not a route ranking surface, semantic arbiter, public UI acceptance, publication claim, or accepted text source.',
  inputs: {
    occurrence_detail_index: options.occurrenceDetailIndex,
    route_resolution: options.routeResolution,
    selected_source_diversity: options.selectedSourceDiversity,
    selected_signature_independence: options.selectedSignatureIndependence,
  },
  authority_policy: {
    usage_navigation_only: true,
    selected_scope_only: true,
    observed_usage_only: true,
    route_ids_only: true,
    source_license_required: true,
    reader_facing: false,
    copies_route_payloads: false,
    copies_agent2_payloads: false,
    ranks_routes: false,
    selects_visible_result: false,
    semantic_arbitration: false,
    semantic_independence_claim: false,
    publication_claim: false,
  },
  route_diversity: routeDiversity,
  route_probes: routeProbes,
  coverage_buckets: coverageBuckets,
  concentration_support: concentrationSupport,
  occurrence_route_links: occurrenceRouteLinks,
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
console.log(`Definition Workbench usage route-diversity probe ${artifact.quality.status}; occurrences ${counts.occurrence_rows}; route IDs ${counts.route_ids}; max route share ${counts.max_route_share_basis_points}/10000`);

function toOccurrenceRouteLink(row) {
  const linkedRouteRows = routeRowByOccurrence.get(row.occurrence_id) || [];
  const relatedRouteIds = unique(row.related_route_ids || []);
  const routeSources = unique([
    ...(row.route_sources || []),
    ...linkedRouteRows.map((routeRow) => routeRow.route_source),
  ]);
  const resolutionStatuses = unique([
    row.route_resolution_status,
    ...linkedRouteRows.map((routeRow) => routeRow.resolution_status),
  ]);
  return {
    occurrence_id: row.occurrence_id,
    detail_id: row.detail_id,
    row_id: row.row_id,
    token_key: row.token_key,
    token_surface: row.token_surface,
    token_normalized: row.token_normalized,
    focus_surface: row.focus_surface,
    focus_normalized: row.focus_normalized,
    usage_label: row.usage_label,
    navigation_label: row.navigation_label,
    status: row.status,
    raw_score: row.raw_score,
    cluster_id: row.cluster_id,
    usage_frame_label: row.usage_frame_label,
    source_ref: row.source_ref,
    source_href: row.source_href,
    work_title: row.work_title,
    work_slug: row.work_slug,
    work_anchor_href: row.work_anchor_href,
    context_focus_marked: row.context_focus_marked,
    related_route_ids: relatedRouteIds,
    route_sources: routeSources,
    route_resolution_statuses: resolutionStatuses,
    unresolved_route_ids: unique(row.unresolved_route_ids || []),
    provenance_id: row.provenance_id,
    provenance_key: row.provenance_key,
    version_title: row.version_title,
    version_source: row.version_source,
    license: row.license,
    license_url: row.license_url,
    neighbor_summary: row.neighbor_summary || {},
    usage_boundary: {
      observed_usage_only: true,
      reader_facing: false,
      route_ids_only: true,
      occurrence_link_only: true,
      not_answer_authority: true,
      not_definition_authority: true,
      not_semantic_arbitration: true,
      not_route_ranking: true,
    },
  };
}

function buildRouteProbes() {
  const routeIds = unique(occurrenceRouteLinks.flatMap((row) => row.related_route_ids));
  return routeIds.map((routeId) => {
    const rows = occurrenceRouteLinks.filter((row) => row.related_route_ids.includes(routeId));
    const linkedRouteRows = routeRows.filter((row) => row.route_id === routeId);
    return {
      route_id: routeId,
      route_sources: unique(rows.flatMap((row) => row.route_sources)),
      occurrence_count: rows.length,
      selected_row_share_basis_points: shareBasisPoints(rows.length, occurrenceRouteLinks.length),
      resolved_occurrence_rows: linkedRouteRows.filter((row) => row.resolution_status === 'resolved').length,
      unresolved_occurrence_rows: linkedRouteRows.filter((row) => row.resolution_status !== 'resolved').length,
      status_counts: countBy(rows, 'status'),
      cluster_counts: countBy(rows, 'cluster_id'),
      usage_frame_counts: countBy(rows, 'usage_frame_label'),
      work_count: unique(rows.map((row) => row.work_slug)).length,
      source_ref_count: unique(rows.map((row) => row.source_ref)).length,
      license_count: unique(rows.map((row) => row.license_url)).length,
      provenance_count: unique(rows.map((row) => row.provenance_key)).length,
      sample_occurrence_links: rows.slice(0, 10).map((row) => ({
        occurrence_id: row.occurrence_id,
        source_ref: row.source_ref,
        source_href: row.source_href,
        work_anchor_href: row.work_anchor_href,
        status: row.status,
        raw_score: row.raw_score,
        cluster_id: row.cluster_id,
        usage_frame_label: row.usage_frame_label,
        license: row.license,
        license_url: row.license_url,
      })),
      usage_boundary: {
        observed_usage_only: true,
        reader_facing: false,
        route_ids_only: true,
        probe_only: true,
        not_answer_authority: true,
        not_definition_authority: true,
        not_semantic_arbitration: true,
        not_route_ranking: true,
      },
    };
  }).sort((left, right) => right.occurrence_count - left.occurrence_count || left.route_id.localeCompare(right.route_id));
}

function buildRouteDiversity(probes) {
  const maxProbe = probes[0] || null;
  const allSelectedRowsSameRoute = Boolean(maxProbe && maxProbe.occurrence_count === occurrenceRouteLinks.length && probes.length === 1);
  return {
    status: allSelectedRowsSameRoute ? 'concentrated' : 'mixed',
    selected_scope_only: true,
    route_ids: probes.map((probe) => probe.route_id),
    unique_route_ids: probes.length,
    selected_occurrence_rows: occurrenceRouteLinks.length,
    max_route_id: maxProbe?.route_id || null,
    max_route_occurrence_count: maxProbe?.occurrence_count || 0,
    max_route_share_basis_points: maxProbe?.selected_row_share_basis_points || 0,
    all_selected_rows_same_route: allSelectedRowsSameRoute,
    concentration_warning: allSelectedRowsSameRoute,
    semantic_independence_claim_allowed: false,
    usage_rows_may_be_used_as_authority: false,
    warning_label: allSelectedRowsSameRoute
      ? 'selected occurrence links currently depend on one route ID and must not be treated as independent semantic route diversity'
      : 'selected occurrence links contain multiple route IDs but remain usage navigation only',
  };
}

function buildCoverageBuckets() {
  return {
    by_status: bucketRows('status'),
    by_cluster: bucketRows('cluster_id'),
    by_usage_frame: bucketRows('usage_frame_label'),
    by_work: bucketRows('work_slug', 'work_title'),
    by_source_ref: bucketRows('source_ref'),
    by_license: bucketRows('license_url', 'license'),
    by_provenance: bucketRows('provenance_key'),
  };
}

function buildConcentrationSupport() {
  const sourceCounts = selectedSourceDiversity.counts || {};
  const signatureCounts = selectedSignatureIndependence.counts || {};
  return {
    selected_occurrence_refs: Number(sourceCounts.selected_occurrence_refs || 0),
    source_diversity: {
      unique_source_refs: Number(sourceCounts.unique_source_refs || 0),
      unique_work_anchors: Number(sourceCounts.unique_work_anchors || 0),
      unique_works: Number(sourceCounts.unique_works || 0),
      unique_licenses: Number(sourceCounts.unique_licenses || 0),
      unique_version_sources: Number(sourceCounts.unique_version_sources || 0),
      duplicate_source_ref_buckets: Number(sourceCounts.duplicate_source_ref_buckets || 0),
      duplicate_source_ref_rows: Number(sourceCounts.duplicate_source_ref_rows || 0),
      missing_signature_independence_rows: Number(sourceCounts.missing_signature_independence_rows || 0),
    },
    signature_independence: {
      signature_memberships: Number(signatureCounts.signature_memberships || 0),
      recurring_signature_memberships: Number(signatureCounts.recurring_signature_memberships || 0),
      cross_cluster_signature_memberships: Number(signatureCounts.cross_cluster_signature_memberships || 0),
      occurrence_refs_with_recurring_signatures: Number(signatureCounts.occurrence_refs_with_recurring_signatures || 0),
      occurrence_refs_with_cross_cluster_signatures: Number(signatureCounts.occurrence_refs_with_cross_cluster_signatures || 0),
      occurrence_refs_without_recurring_signatures: Number(signatureCounts.occurrence_refs_without_recurring_signatures || 0),
      missing_lookup_rows: Number(signatureCounts.missing_lookup_rows || 0),
    },
    boundary: {
      support_context_only: true,
      selected_scope_only: true,
      observed_usage_only: true,
      reader_facing: false,
      route_ids_only: true,
      ranks_routes: false,
      selects_visible_result: false,
      semantic_independence_claim_allowed: false,
      not_definition_authority: true,
    },
  };
}

function bucketRows(keyField, labelField = keyField) {
  const buckets = new Map();
  for (const row of occurrenceRouteLinks) {
    const key = String(row[keyField] || '');
    if (!key) continue;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(row);
  }
  return [...buckets.entries()]
    .sort((left, right) => right[1].length - left[1].length || left[0].localeCompare(right[0]))
    .map(([bucketKey, rows]) => ({
      bucket_key: bucketKey,
      bucket_label: String(rows[0]?.[labelField] || bucketKey),
      occurrence_count: rows.length,
      selected_row_share_basis_points: shareBasisPoints(rows.length, occurrenceRouteLinks.length),
      route_ids: unique(rows.flatMap((row) => row.related_route_ids)),
      status_counts: countBy(rows, 'status'),
      cluster_ids: unique(rows.map((row) => row.cluster_id)),
      usage_frame_labels: unique(rows.map((row) => row.usage_frame_label)),
      source_refs: unique(rows.map((row) => row.source_ref)),
      work_slugs: unique(rows.map((row) => row.work_slug)),
      license_urls: unique(rows.map((row) => row.license_url)),
      occurrence_ids: rows.map((row) => row.occurrence_id),
      usage_boundary: {
        observed_usage_only: true,
        reader_facing: false,
        route_ids_only: true,
        not_answer_authority: true,
        not_definition_authority: true,
        not_semantic_arbitration: true,
      },
    }));
}

function buildCounts() {
  const routeIds = unique(occurrenceRouteLinks.flatMap((row) => row.related_route_ids));
  const unresolvedRouteIds = unique(occurrenceRouteLinks.flatMap((row) => row.unresolved_route_ids));
  const maxShare = routeProbes[0]?.selected_row_share_basis_points || 0;
  return {
    occurrence_rows: occurrenceRouteLinks.length,
    route_ids: routeIds.length,
    route_probe_rows: routeProbes.length,
    max_route_occurrence_count: routeProbes[0]?.occurrence_count || 0,
    max_route_share_basis_points: maxShare,
    route_concentration_warning: routeDiversity.concentration_warning ? 1 : 0,
    all_selected_rows_same_route: routeDiversity.all_selected_rows_same_route ? 1 : 0,
    semantic_independence_claim_allowed: routeDiversity.semantic_independence_claim_allowed ? 1 : 0,
    occurrence_rows_with_source_link: occurrenceRouteLinks.filter((row) => Boolean(row.source_href)).length,
    occurrence_rows_with_work_anchor: occurrenceRouteLinks.filter((row) => Boolean(row.work_anchor_href)).length,
    occurrence_rows_with_context: occurrenceRouteLinks.filter((row) => Boolean(row.context_focus_marked)).length,
    occurrence_rows_with_focus_marker: occurrenceRouteLinks.filter((row) => String(row.context_focus_marked || '').includes('[') && String(row.context_focus_marked || '').includes(']')).length,
    occurrence_rows_with_license: occurrenceRouteLinks.filter((row) => Boolean(row.license && row.license_url)).length,
    occurrence_rows_with_version: occurrenceRouteLinks.filter((row) => Boolean(row.version_title && row.version_source)).length,
    occurrence_rows_with_route_ids: occurrenceRouteLinks.filter((row) => row.related_route_ids.length > 0).length,
    observed_usage_only_rows: occurrenceRouteLinks.filter((row) => row.usage_label === 'observed usage only').length,
    source_refs: unique(occurrenceRouteLinks.map((row) => row.source_ref)).length,
    works: unique(occurrenceRouteLinks.map((row) => row.work_slug)).length,
    clusters: unique(occurrenceRouteLinks.map((row) => row.cluster_id)).length,
    usage_frames: unique(occurrenceRouteLinks.map((row) => row.usage_frame_label)).length,
    statuses: unique(occurrenceRouteLinks.map((row) => row.status)).length,
    licenses: unique(occurrenceRouteLinks.map((row) => row.license_url)).length,
    provenance_keys: unique(occurrenceRouteLinks.map((row) => row.provenance_key)).length,
    coverage_bucket_groups: Object.keys(coverageBuckets).length,
    coverage_buckets_total: sum(Object.values(coverageBuckets).map((rows) => rows.length)),
    concentration_support_selected_occurrence_refs: concentrationSupport.selected_occurrence_refs,
    concentration_support_unique_source_refs: concentrationSupport.source_diversity.unique_source_refs,
    concentration_support_unique_work_anchors: concentrationSupport.source_diversity.unique_work_anchors,
    concentration_support_unique_works: concentrationSupport.source_diversity.unique_works,
    concentration_support_unique_licenses: concentrationSupport.source_diversity.unique_licenses,
    concentration_support_unique_version_sources: concentrationSupport.source_diversity.unique_version_sources,
    concentration_support_duplicate_source_ref_rows: concentrationSupport.source_diversity.duplicate_source_ref_rows,
    concentration_support_missing_signature_rows: concentrationSupport.source_diversity.missing_signature_independence_rows,
    concentration_support_signature_memberships: concentrationSupport.signature_independence.signature_memberships,
    concentration_support_recurring_signature_rows: concentrationSupport.signature_independence.occurrence_refs_with_recurring_signatures,
    concentration_support_cross_cluster_signature_rows: concentrationSupport.signature_independence.occurrence_refs_with_cross_cluster_signatures,
    concentration_support_missing_lookup_rows: concentrationSupport.signature_independence.missing_lookup_rows,
    concentration_support_final_authority: concentrationSupport.boundary.selects_visible_result ? 1 : 0,
    concentration_support_semantic_independence_allowed: concentrationSupport.boundary.semantic_independence_claim_allowed ? 1 : 0,
    unresolved_route_ids: unresolvedRouteIds.length,
    reader_facing_rows: 0,
    route_payload_field_hits: 0,
    forbidden_authority_field_hits: 0,
  };
}

function buildChecks(counts) {
  return [
    check('occurrence_rows_present', counts.occurrence_rows > 0 ? 'passed' : 'failed', `rows ${counts.occurrence_rows}`),
    check('route_ids_present', counts.route_ids > 0 && counts.route_probe_rows === counts.route_ids ? 'passed' : 'failed', `routes/probes ${counts.route_ids}/${counts.route_probe_rows}`),
    check('metadata_complete', allEqual(counts.occurrence_rows, [
      counts.occurrence_rows_with_source_link,
      counts.occurrence_rows_with_work_anchor,
      counts.occurrence_rows_with_context,
      counts.occurrence_rows_with_focus_marker,
      counts.occurrence_rows_with_license,
      counts.occurrence_rows_with_version,
      counts.occurrence_rows_with_route_ids,
      counts.observed_usage_only_rows,
    ]) ? 'passed' : 'failed', `rows/source/work/context/focus/license/version/routes/observed ${counts.occurrence_rows}/${counts.occurrence_rows_with_source_link}/${counts.occurrence_rows_with_work_anchor}/${counts.occurrence_rows_with_context}/${counts.occurrence_rows_with_focus_marker}/${counts.occurrence_rows_with_license}/${counts.occurrence_rows_with_version}/${counts.occurrence_rows_with_route_ids}/${counts.observed_usage_only_rows}`),
    check('coverage_buckets_present', counts.coverage_bucket_groups === 7 && counts.coverage_buckets_total > 0 ? 'passed' : 'failed', `groups/buckets ${counts.coverage_bucket_groups}/${counts.coverage_buckets_total}`),
    check('route_concentration_marked', counts.route_ids === 1 && counts.max_route_share_basis_points === 10000 && counts.route_concentration_warning === 1 && counts.semantic_independence_claim_allowed === 0 ? 'warning' : 'passed', `route IDs ${counts.route_ids}; max share ${counts.max_route_share_basis_points}/10000; semantic independence allowed ${counts.semantic_independence_claim_allowed}`),
    check('concentration_support_complete', counts.concentration_support_selected_occurrence_refs === counts.occurrence_rows && counts.concentration_support_unique_source_refs > 1 && counts.concentration_support_unique_works > 1 && counts.concentration_support_unique_licenses > 1 && counts.concentration_support_unique_version_sources > 1 && counts.concentration_support_duplicate_source_ref_rows > 0 && counts.concentration_support_recurring_signature_rows > 0 && counts.concentration_support_cross_cluster_signature_rows > 0 && counts.concentration_support_missing_signature_rows === 0 && counts.concentration_support_missing_lookup_rows === 0 && counts.concentration_support_final_authority === 0 && counts.concentration_support_semantic_independence_allowed === 0 ? 'warning' : 'failed', `selected/source/work/license/version ${counts.concentration_support_selected_occurrence_refs}/${counts.concentration_support_unique_source_refs}/${counts.concentration_support_unique_works}/${counts.concentration_support_unique_licenses}/${counts.concentration_support_unique_version_sources}; duplicate/recurring/cross-cluster ${counts.concentration_support_duplicate_source_ref_rows}/${counts.concentration_support_recurring_signature_rows}/${counts.concentration_support_cross_cluster_signature_rows}; authority/semantic ${counts.concentration_support_final_authority}/${counts.concentration_support_semantic_independence_allowed}`),
    check('usage_boundary_only', counts.reader_facing_rows === 0 && counts.route_payload_field_hits === 0 && counts.forbidden_authority_field_hits === 0 && counts.unresolved_route_ids === 0 ? 'passed' : 'failed', `reader-facing ${counts.reader_facing_rows}; route-payload ${counts.route_payload_field_hits}; forbidden ${counts.forbidden_authority_field_hits}; unresolved ${counts.unresolved_route_ids}`),
  ];
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Definition Workbench Usage Route Diversity Probe',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Status: ${artifact.quality.status}`,
    `- Occurrence rows: ${artifact.counts.occurrence_rows}`,
    `- Route IDs / route probes: ${artifact.counts.route_ids}/${artifact.counts.route_probe_rows}`,
    `- Route diversity status: ${artifact.route_diversity.status}`,
    `- Max route share: ${artifact.counts.max_route_share_basis_points}/10000`,
    `- Route concentration warning: ${artifact.route_diversity.concentration_warning}`,
    `- Semantic independence claim allowed: ${artifact.route_diversity.semantic_independence_claim_allowed}`,
    `- Source refs / works / licenses / provenance keys: ${artifact.counts.source_refs}/${artifact.counts.works}/${artifact.counts.licenses}/${artifact.counts.provenance_keys}`,
    `- Concentration support source refs / works / licenses / version sources: ${artifact.counts.concentration_support_unique_source_refs}/${artifact.counts.concentration_support_unique_works}/${artifact.counts.concentration_support_unique_licenses}/${artifact.counts.concentration_support_unique_version_sources}`,
    `- Concentration support duplicate-source / recurring-signature / cross-cluster-signature rows: ${artifact.counts.concentration_support_duplicate_source_ref_rows}/${artifact.counts.concentration_support_recurring_signature_rows}/${artifact.counts.concentration_support_cross_cluster_signature_rows}`,
    `- Concentration support final-authority / semantic-independence allowed: ${artifact.counts.concentration_support_final_authority}/${artifact.counts.concentration_support_semantic_independence_allowed}`,
    `- Metadata complete rows: source ${artifact.counts.occurrence_rows_with_source_link}, work ${artifact.counts.occurrence_rows_with_work_anchor}, context ${artifact.counts.occurrence_rows_with_context}, focus ${artifact.counts.occurrence_rows_with_focus_marker}, license ${artifact.counts.occurrence_rows_with_license}, version ${artifact.counts.occurrence_rows_with_version}`,
    `- Reader-facing / route-payload / forbidden-authority hits: ${artifact.counts.reader_facing_rows}/${artifact.counts.route_payload_field_hits}/${artifact.counts.forbidden_authority_field_hits}`,
    '',
    '## Route Probes',
    '',
    '| route ID | rows | share | sources | frames | statuses |',
    '|---|---:|---:|---:|---:|---|',
    ...artifact.route_probes.map((probe) => `| ${mdCell(probe.route_id)} | ${probe.occurrence_count} | ${probe.selected_row_share_basis_points}/10000 | ${probe.route_sources.length} | ${Object.keys(probe.usage_frame_counts).length} | ${mdCell(JSON.stringify(probe.status_counts))} |`),
    '',
    '## Coverage Buckets',
    '',
    '| bucket group | buckets |',
    '|---|---:|',
    ...Object.entries(artifact.coverage_buckets).map(([bucketGroup, buckets]) => `| ${mdCell(bucketGroup)} | ${buckets.length} |`),
    '',
    '## Concentration Support',
    '',
    '| support area | count |',
    '|---|---:|',
    `| selected occurrence refs | ${artifact.counts.concentration_support_selected_occurrence_refs} |`,
    `| unique source refs | ${artifact.counts.concentration_support_unique_source_refs} |`,
    `| unique works | ${artifact.counts.concentration_support_unique_works} |`,
    `| unique licenses | ${artifact.counts.concentration_support_unique_licenses} |`,
    `| unique version sources | ${artifact.counts.concentration_support_unique_version_sources} |`,
    `| duplicate source-ref rows | ${artifact.counts.concentration_support_duplicate_source_ref_rows} |`,
    `| recurring-signature rows | ${artifact.counts.concentration_support_recurring_signature_rows} |`,
    `| cross-cluster-signature rows | ${artifact.counts.concentration_support_cross_cluster_signature_rows} |`,
    `| missing signature rows | ${artifact.counts.concentration_support_missing_signature_rows} |`,
    `| missing lookup rows | ${artifact.counts.concentration_support_missing_lookup_rows} |`,
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${mdCell(checkRow.id)} | ${checkRow.status} | ${mdCell(checkRow.detail)} |`),
    '',
    '## Boundary',
    '',
    'This probe is a QA/navigation artifact. It exposes whether selected occurrence links depend on one route ID, preserves source/license/context fields, and does not rank routes, select visible answers, copy Agent 2 payloads, make publication claims, or provide accepted translation text.',
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function countBy(rows, field) {
  const counts = {};
  for (const row of rows) {
    const key = String(row[field] ?? '');
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.fromEntries(Object.entries(counts).sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0])));
}

function unique(values) {
  return [...new Set(values.filter((value) => value !== undefined && value !== null && value !== '').map(String))].sort();
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}

function shareBasisPoints(value, total) {
  return total ? Math.round((value / total) * 10000) : 0;
}

function allEqual(expected, values) {
  return values.every((value) => value === expected);
}

function check(id, status, detail) {
  return { id, status, detail };
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--occurrence-detail-index=')) parsed.occurrenceDetailIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--route-resolution=')) parsed.routeResolution = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-source-diversity=')) parsed.selectedSourceDiversity = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-signature-independence=')) parsed.selectedSignatureIndependence = cleanRelativePath(valueAfterEquals(arg));
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
