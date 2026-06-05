#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  occurrenceLinks: 'data/definitions/definition-workbench-usage-occurrence-links.json',
  routeResolution: 'data/definitions/definition-workbench-usage-route-resolution.json',
  crossmatchNeighbors: 'data/definitions/definition-workbench-usage-crossmatch-neighbors.json',
  sourceRefBuckets: 'data/definitions/definition-workbench-usage-source-ref-buckets.json',
  workBuckets: 'data/definitions/definition-workbench-usage-work-buckets.json',
  provenanceBuckets: 'data/definitions/definition-workbench-usage-provenance-buckets.json',
  output: 'data/definitions/definition-workbench-usage-occurrence-detail-index.json',
  report: 'reports/definition-workbench-usage-occurrence-detail-index.md',
};
const forbiddenAuthorityKeys = [
  'definition',
  'definition_text',
  'meaning',
  'meaning_claim',
  'translation',
  'translation_text',
  'accepted_translation',
  'final_answer',
  'winner',
  'route_payload',
  'route_payloads',
  'route_metadata',
];

const options = parseArgs(process.argv.slice(2));
const occurrenceLinks = readJson(options.occurrenceLinks);
const routeResolution = readJson(options.routeResolution);
const crossmatchNeighbors = readJson(options.crossmatchNeighbors);
const sourceRefBuckets = readJson(options.sourceRefBuckets);
const workBuckets = readJson(options.workBuckets);
const provenanceBuckets = readJson(options.provenanceBuckets);

assertArtifact(occurrenceLinks, 'definition_workbench_usage_occurrence_links', options.occurrenceLinks);
assertArtifact(routeResolution, 'definition_workbench_usage_route_resolution', options.routeResolution);
assertArtifact(crossmatchNeighbors, 'definition_workbench_usage_crossmatch_neighbors', options.crossmatchNeighbors);
assertArtifact(sourceRefBuckets, 'definition_workbench_usage_source_ref_buckets', options.sourceRefBuckets);
assertArtifact(workBuckets, 'definition_workbench_usage_work_buckets', options.workBuckets);
assertArtifact(provenanceBuckets, 'definition_workbench_usage_provenance_buckets', options.provenanceBuckets);

const routeResolutionByOccurrence = new Map((routeResolution.occurrence_route_rows || []).map((row) => [row.occurrence_id, row]));
const resolvedRouteIds = new Set((routeResolution.routes || []).filter((route) => route.resolution_status === 'resolved').map((route) => route.route_id));
const crossmatchByOccurrence = new Map((crossmatchNeighbors.crossmatch_rows || []).map((row) => [row.occurrence_id, row]));
const sourceRefKeys = new Set((sourceRefBuckets.source_ref_buckets || []).map((bucket) => bucket.source_ref));
const sourceClusterKeys = new Set(flatMap(sourceRefBuckets.source_ref_buckets || [], (bucket) => (bucket.source_cluster_buckets || []).map((cluster) => cluster.source_cluster_key)));
const workKeys = new Set((workBuckets.work_buckets || []).map((bucket) => bucket.work_slug));
const workFrameKeys = new Set(flatMap(workBuckets.work_buckets || [], (bucket) => (bucket.work_frame_buckets || []).map((frame) => frame.work_frame_key)));
const provenanceKeys = new Set((provenanceBuckets.provenance_buckets || []).map((bucket) => bucket.provenance_key));
const provenanceFrameKeys = new Set(flatMap(provenanceBuckets.provenance_buckets || [], (bucket) => (bucket.provenance_frame_buckets || []).map((frame) => frame.provenance_frame_key)));

const occurrenceDetails = buildOccurrenceDetails(occurrenceLinks.occurrence_links || []);
const counts = buildCounts(occurrenceDetails);
const checks = buildChecks(counts);
const failed = checks.filter((check) => check.status === 'failed');
const warnings = checks.filter((check) => check.status === 'warning');

const artifact = {
  schema_version: 1,
  artifact_type: 'definition_workbench_usage_occurrence_detail_index',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_definition_workbench_usage_occurrence_detail_index.mjs',
  policy: 'Stable Agent 3 Definition Workbench occurrence-detail navigation index. It joins selected usage occurrence rows to source-ref, work, provenance, route-ID, and neighbor-navigation artifacts while preserving source refs, page anchors, Hebrew context, provenance/license/version fields, bucket keys, and route IDs only. It does not define terms, translate, copy Agent 2 route payloads, rank routes, choose visible answers, arbitrate semantics, or publish.',
  inputs: {
    occurrence_links: options.occurrenceLinks,
    route_resolution: options.routeResolution,
    crossmatch_neighbors: options.crossmatchNeighbors,
    source_ref_buckets: options.sourceRefBuckets,
    work_buckets: options.workBuckets,
    provenance_buckets: options.provenanceBuckets,
  },
  authority_policy: {
    usage_navigation_only: true,
    observed_usage_only: true,
    occurrence_detail_navigation_only: true,
    route_ids_only: true,
    bucket_keys_only: true,
    reader_facing: false,
    copies_route_payloads: false,
    copies_definition_payloads: false,
    ranks_routes: false,
    selects_visible_result: false,
    semantic_arbitration: false,
    publication_claim: false,
  },
  quality: {
    status: failed.length ? 'failed' : warnings.length ? 'pass_with_warnings' : 'passed',
    warning_count: warnings.length,
    failed_count: failed.length,
  },
  counts,
  checks,
  occurrence_details: occurrenceDetails,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);

console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Definition Workbench usage occurrence-detail index ${artifact.quality.status}; rows ${counts.occurrence_detail_rows}; neighbor links ${counts.neighbor_links}; bucket links complete ${counts.rows_with_all_bucket_links}/${counts.occurrence_detail_rows}`);

function buildOccurrenceDetails(rows) {
  return rows
    .map((row, index) => {
      const routeRow = routeResolutionByOccurrence.get(row.occurrence_id) || {};
      const crossmatchRow = crossmatchByOccurrence.get(row.occurrence_id) || {};
      const sourceClusterKey = `${row.source_ref}::${row.cluster_id}`;
      const workFrameKey = `${row.work_slug}::${row.cluster_id}`;
      const provenanceKey = provenanceSignature(row);
      const provenanceFrameKey = `${provenanceKey}::${row.cluster_id}`;
      const routeIds = unique(row.related_route_ids || []);
      const unresolvedRouteIds = routeIds.filter((routeId) => !resolvedRouteIds.has(routeId));
      return {
        detail_id: `definition-workbench-usage-occurrence-detail-${String(index + 1).padStart(3, '0')}`,
        row_id: row.row_id,
        occurrence_id: row.occurrence_id,
        token_key: row.token_key,
        token_surface: row.token_surface,
        token_normalized: row.token_normalized,
        focus_surface: row.focus_surface,
        focus_normalized: row.focus_normalized,
        usage_label: 'observed usage only',
        navigation_label: row.navigation_label,
        status: row.status,
        raw_score: Number(row.raw_score || 0),
        cluster_id: row.cluster_id,
        usage_frame_label: row.usage_frame_label,
        source_ref: row.source_ref,
        source_href: row.source_href,
        work_title: row.work_title,
        work_slug: row.work_slug,
        work_anchor_href: row.work_anchor_href,
        context_focus_marked: row.context_focus_marked,
        related_route_ids: routeIds,
        route_sources: unique([routeRow.route_source].filter(Boolean)),
        route_resolution_status: unresolvedRouteIds.length ? 'has_unresolved_route_id' : 'resolved',
        unresolved_route_ids: unresolvedRouteIds,
        source_ref_bucket_key: row.source_ref,
        source_cluster_key: sourceClusterKey,
        work_bucket_key: row.work_slug,
        work_frame_key: workFrameKey,
        provenance_key: provenanceKey,
        provenance_frame_key: provenanceFrameKey,
        bucket_link_status: bucketLinkStatus({
          source_ref_bucket_key: sourceRefKeys.has(row.source_ref),
          source_cluster_key: sourceClusterKeys.has(sourceClusterKey),
          work_bucket_key: workKeys.has(row.work_slug),
          work_frame_key: workFrameKeys.has(workFrameKey),
          provenance_key: provenanceKeys.has(provenanceKey),
          provenance_frame_key: provenanceFrameKeys.has(provenanceFrameKey),
        }),
        provenance_id: row.provenance_id,
        version_title: row.version_title,
        version_source: row.version_source,
        license: row.license,
        license_url: row.license_url,
        neighbor_summary: crossmatchRow.neighbor_summary || emptyNeighborSummary(),
        same_frame_neighbor_ids: neighborIds(crossmatchRow.same_frame_neighbors),
        bridge_frame_neighbor_ids: neighborIds(crossmatchRow.bridge_frame_neighbors),
        neighbor_samples: {
          same_frame: neighborSamples(crossmatchRow.same_frame_neighbors),
          bridge_frame: neighborSamples(crossmatchRow.bridge_frame_neighbors),
        },
        usage_boundary: {
          observed_usage_only: true,
          reader_facing: false,
          route_ids_only: true,
          bucket_keys_only: true,
          occurrence_detail_navigation_only: true,
          not_answer_authority: true,
          not_definition_authority: true,
          not_semantic_arbitration: true,
        },
      };
    })
    .sort((a, b) => b.raw_score - a.raw_score || a.source_ref.localeCompare(b.source_ref) || a.occurrence_id.localeCompare(b.occurrence_id));
}

function bucketLinkStatus(flags) {
  const missing = Object.entries(flags).filter(([, present]) => !present).map(([key]) => key);
  return {
    complete: missing.length === 0,
    missing_bucket_keys: missing,
  };
}

function neighborIds(neighbors) {
  return (neighbors || []).map((neighbor) => neighbor.target_occurrence_id).filter(Boolean);
}

function neighborSamples(neighbors) {
  return (neighbors || []).slice(0, 5).map((neighbor) => ({
    target_occurrence_id: neighbor.target_occurrence_id,
    link_kind: neighbor.link_kind,
    crossmatch_score: Number(neighbor.crossmatch_score || 0),
    crossmatch_strength: neighbor.crossmatch_strength,
    target_source_ref: neighbor.target?.source_ref || null,
    target_source_href: neighbor.target?.source_href || null,
    target_work_anchor_href: neighbor.target?.work_anchor_href || null,
    shared_route_ids: unique(neighbor.shared_route_ids || []),
  }));
}

function buildCounts(rows) {
  const routeIds = new Set();
  const unresolvedRouteIds = new Set();
  const sourceRefs = new Set();
  const works = new Set();
  const licenses = new Set();
  const versionSources = new Set();
  const statusCounts = { supported: 0, candidate: 0, weak: 0 };
  const clusterCounts = {};
  for (const row of rows) {
    if (Object.hasOwn(statusCounts, row.status)) statusCounts[row.status] += 1;
    clusterCounts[row.cluster_id] = (clusterCounts[row.cluster_id] || 0) + 1;
    for (const routeId of row.related_route_ids || []) routeIds.add(routeId);
    for (const routeId of row.unresolved_route_ids || []) unresolvedRouteIds.add(routeId);
    sourceRefs.add(row.source_ref);
    works.add(row.work_slug);
    licenses.add(row.license);
    versionSources.add(row.version_source);
  }
  const neighborLinks = sum(rows.map((row) => Number(row.neighbor_summary?.total_neighbors || 0)));
  const sameFrameNeighborLinks = sum(rows.map((row) => Number(row.neighbor_summary?.same_frame_neighbors || 0)));
  const bridgeFrameNeighborLinks = sum(rows.map((row) => Number(row.neighbor_summary?.bridge_frame_neighbors || 0)));
  return {
    occurrence_detail_rows: rows.length,
    source_ref_count: sourceRefs.size,
    work_count: works.size,
    license_count: licenses.size,
    version_source_count: versionSources.size,
    status_counts: statusCounts,
    cluster_counts: clusterCounts,
    route_ids: routeIds.size,
    unresolved_route_ids: unresolvedRouteIds.size,
    rows_with_route_ids: rows.filter((row) => row.related_route_ids.length > 0).length,
    rows_with_source_link: rows.filter((row) => Boolean(row.source_href)).length,
    rows_with_work_anchor: rows.filter((row) => Boolean(row.work_anchor_href)).length,
    rows_with_hebrew_context: rows.filter((row) => hasFocusMarker(row.context_focus_marked)).length,
    rows_with_focus_marker: rows.filter((row) => hasFocusMarker(row.context_focus_marked)).length,
    rows_with_provenance: rows.filter((row) => Boolean(row.provenance_id)).length,
    rows_with_license_metadata: rows.filter((row) => Boolean(row.license && row.license_url)).length,
    rows_with_version_metadata: rows.filter((row) => Boolean(row.version_title && row.version_source)).length,
    rows_with_source_ref_bucket_link: rows.filter((row) => row.bucket_link_status.complete || !row.bucket_link_status.missing_bucket_keys.includes('source_ref_bucket_key')).length,
    rows_with_source_cluster_bucket_link: rows.filter((row) => row.bucket_link_status.complete || !row.bucket_link_status.missing_bucket_keys.includes('source_cluster_key')).length,
    rows_with_work_bucket_link: rows.filter((row) => row.bucket_link_status.complete || !row.bucket_link_status.missing_bucket_keys.includes('work_bucket_key')).length,
    rows_with_work_frame_bucket_link: rows.filter((row) => row.bucket_link_status.complete || !row.bucket_link_status.missing_bucket_keys.includes('work_frame_key')).length,
    rows_with_provenance_bucket_link: rows.filter((row) => row.bucket_link_status.complete || !row.bucket_link_status.missing_bucket_keys.includes('provenance_key')).length,
    rows_with_provenance_frame_bucket_link: rows.filter((row) => row.bucket_link_status.complete || !row.bucket_link_status.missing_bucket_keys.includes('provenance_frame_key')).length,
    rows_with_all_bucket_links: rows.filter((row) => row.bucket_link_status.complete).length,
    neighbor_links: neighborLinks,
    same_frame_neighbor_links: sameFrameNeighborLinks,
    bridge_frame_neighbor_links: bridgeFrameNeighborLinks,
    rows_with_same_frame_neighbors: rows.filter((row) => row.same_frame_neighbor_ids.length > 0).length,
    rows_with_bridge_frame_neighbors: rows.filter((row) => row.bridge_frame_neighbor_ids.length > 0).length,
    observed_usage_only_rows: rows.filter((row) => row.usage_boundary?.observed_usage_only === true && row.usage_label === 'observed usage only').length,
    reader_facing_rows: rows.filter((row) => row.usage_boundary?.reader_facing === true).length,
    route_payload_field_hits: countForbiddenKeys(rows, ['route_payload', 'route_payloads', 'route_metadata']),
    forbidden_authority_field_hits: countForbiddenKeys(rows, forbiddenAuthorityKeys),
  };
}

function buildChecks(counts) {
  return [
    check('occurrence_details_nonzero', counts.occurrence_detail_rows > 0 ? 'passed' : 'failed', `rows ${counts.occurrence_detail_rows}`),
    check('metadata_complete', allEqual(counts.occurrence_detail_rows, [
      counts.rows_with_route_ids,
      counts.rows_with_source_link,
      counts.rows_with_work_anchor,
      counts.rows_with_hebrew_context,
      counts.rows_with_focus_marker,
      counts.rows_with_provenance,
      counts.rows_with_license_metadata,
      counts.rows_with_version_metadata,
    ]) ? 'passed' : 'failed', `rows/source/work/context/focus/provenance/license/version ${counts.occurrence_detail_rows}/${counts.rows_with_source_link}/${counts.rows_with_work_anchor}/${counts.rows_with_hebrew_context}/${counts.rows_with_focus_marker}/${counts.rows_with_provenance}/${counts.rows_with_license_metadata}/${counts.rows_with_version_metadata}`),
    check('bucket_links_complete', counts.rows_with_all_bucket_links === counts.occurrence_detail_rows ? 'passed' : 'failed', `${counts.rows_with_all_bucket_links}/${counts.occurrence_detail_rows}`),
    check('route_links_resolved', counts.route_ids > 0 && counts.unresolved_route_ids === 0 ? 'passed' : 'failed', `route IDs ${counts.route_ids}; unresolved ${counts.unresolved_route_ids}`),
    check('neighbor_links_present', counts.neighbor_links > 0 && counts.same_frame_neighbor_links > 0 && counts.bridge_frame_neighbor_links > 0 && counts.same_frame_neighbor_links + counts.bridge_frame_neighbor_links === counts.neighbor_links ? 'passed' : 'failed', `total/same/bridge ${counts.neighbor_links}/${counts.same_frame_neighbor_links}/${counts.bridge_frame_neighbor_links}`),
    check('usage_boundary_only', counts.observed_usage_only_rows === counts.occurrence_detail_rows && counts.reader_facing_rows === 0 && counts.route_payload_field_hits === 0 && counts.forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `observed ${counts.observed_usage_only_rows}; reader-facing ${counts.reader_facing_rows}; payload ${counts.route_payload_field_hits}; forbidden ${counts.forbidden_authority_field_hits}`),
  ];
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Definition Workbench Usage Occurrence Detail Index',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Status: ${artifact.quality.status}`,
    `- Occurrence detail rows: ${artifact.counts.occurrence_detail_rows}`,
    `- Source refs / works: ${artifact.counts.source_ref_count}/${artifact.counts.work_count}`,
    `- Licenses / version sources: ${artifact.counts.license_count}/${artifact.counts.version_source_count}`,
    `- Route IDs / unresolved: ${artifact.counts.route_ids}/${artifact.counts.unresolved_route_ids}`,
    `- Bucket links complete: ${artifact.counts.rows_with_all_bucket_links}/${artifact.counts.occurrence_detail_rows}`,
    `- Neighbor links total / same-frame / bridge-frame: ${artifact.counts.neighbor_links}/${artifact.counts.same_frame_neighbor_links}/${artifact.counts.bridge_frame_neighbor_links}`,
    `- Reader-facing / route-payload / forbidden-authority hits: ${artifact.counts.reader_facing_rows}/${artifact.counts.route_payload_field_hits}/${artifact.counts.forbidden_authority_field_hits}`,
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${mdCell(checkRow.id)} | ${checkRow.status} | ${mdCell(checkRow.detail)} |`),
    '',
    '## Boundary',
    '',
    'This index is usage-navigation and occurrence-detail support only. It exposes route IDs, bucket keys, source/work links, context, and provenance/license metadata. It is not Definition authority, semantic arbitration, route ranking, visible answer selection, publication support, or accepted translation text.',
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function assertArtifact(artifact, artifactType, relativePath) {
  if (artifact.artifact_type !== artifactType) {
    throw new Error(`${relativePath} is not ${artifactType}`);
  }
}

function provenanceSignature(row) {
  return [row.provenance_id, row.version_title, row.version_source, row.license, row.license_url].join('|');
}

function emptyNeighborSummary() {
  return {
    total_neighbors: 0,
    same_frame_neighbors: 0,
    bridge_frame_neighbors: 0,
    strong_neighbors: 0,
    moderate_neighbors: 0,
    weak_neighbors: 0,
    unique_target_refs: 0,
    unique_target_works: 0,
    unique_target_clusters: 0,
    unique_target_frames: 0,
  };
}

function hasFocusMarker(value) {
  return String(value || '').includes('[') && String(value || '').includes(']');
}

function countForbiddenKeys(value, keys) {
  const keySet = new Set(keys);
  let hits = 0;
  walk(value);
  return hits;

  function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (keySet.has(key)) hits += 1;
      walk(child);
    }
  }
}

function allEqual(expected, values) {
  return values.every((value) => value === expected);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function flatMap(values, mapFn) {
  return values.flatMap(mapFn);
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
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
    if (arg.startsWith('--occurrence-links=')) parsed.occurrenceLinks = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--route-resolution=')) parsed.routeResolution = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--crossmatch-neighbors=')) parsed.crossmatchNeighbors = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--source-ref-buckets=')) parsed.sourceRefBuckets = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--work-buckets=')) parsed.workBuckets = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--provenance-buckets=')) parsed.provenanceBuckets = cleanRelativePath(valueAfterEquals(arg));
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
