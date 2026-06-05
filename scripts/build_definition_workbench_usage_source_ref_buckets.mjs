#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  occurrenceLinks: 'data/definitions/definition-workbench-usage-occurrence-links.json',
  routeResolution: 'data/definitions/definition-workbench-usage-route-resolution.json',
  output: 'data/definitions/definition-workbench-usage-source-ref-buckets.json',
  report: 'reports/definition-workbench-usage-source-ref-buckets.md',
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
];

const options = parseArgs(process.argv.slice(2));
const occurrenceLinks = readJson(options.occurrenceLinks);
const routeResolution = readJson(options.routeResolution);

if (occurrenceLinks.artifact_type !== 'definition_workbench_usage_occurrence_links') {
  throw new Error(`${options.occurrenceLinks} is not a Definition Workbench occurrence-links packet`);
}
if (routeResolution.artifact_type !== 'definition_workbench_usage_route_resolution') {
  throw new Error(`${options.routeResolution} is not a Definition Workbench route-resolution packet`);
}

const resolvedRouteIds = new Set((routeResolution.routes || []).filter((route) => route.resolution_status === 'resolved').map((route) => route.route_id));
const sourceBuckets = buildSourceBuckets(occurrenceLinks.occurrence_links || []);
const counts = buildCounts(sourceBuckets);
const checks = buildChecks(counts);
const failed = checks.filter((check) => check.status === 'failed');
const warnings = checks.filter((check) => check.status === 'warning');

const artifact = {
  schema_version: 1,
  artifact_type: 'definition_workbench_usage_source_ref_buckets',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_definition_workbench_usage_source_ref_buckets.mjs',
  policy: 'Stable Agent 3 Definition Workbench source-ref bucket packet. It dedupes selected usage occurrence links by source ref plus cluster for review/navigation while preserving each underlying occurrence row, source/work links, Hebrew context, provenance/license metadata, and route IDs only. It does not define terms, translate, copy route payloads, rank routes, choose visible answers, arbitrate semantics, or publish.',
  inputs: {
    occurrence_links: options.occurrenceLinks,
    route_resolution: options.routeResolution,
  },
  authority_policy: {
    usage_navigation_only: true,
    observed_usage_only: true,
    source_ref_bucket_navigation_only: true,
    occurrence_links_only: true,
    route_ids_only: true,
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
  source_ref_buckets: sourceBuckets,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);

console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Definition Workbench usage source-ref buckets ${artifact.quality.status}; source refs ${counts.source_ref_buckets}; source/cluster buckets ${counts.source_cluster_buckets}; duplicate source-ref buckets ${counts.duplicate_source_ref_buckets}`);

function buildSourceBuckets(rows) {
  const sourceMap = new Map();
  for (const row of rows) {
    const key = row.source_ref;
    if (!sourceMap.has(key)) {
      sourceMap.set(key, {
        source_ref: row.source_ref,
        source_href: row.source_href,
        work_anchor_href: row.work_anchor_href,
        work_title: row.work_title,
        work_slug: row.work_slug,
        provenance_signatures: new Map(),
        route_ids: new Set(),
        row_count: 0,
        status_counts: { supported: 0, candidate: 0, weak: 0 },
        cluster_ids: new Set(),
        usage_frame_labels: new Set(),
        source_cluster_map: new Map(),
      });
    }
    const bucket = sourceMap.get(key);
    bucket.row_count += 1;
    if (Object.hasOwn(bucket.status_counts, row.status)) bucket.status_counts[row.status] += 1;
    bucket.cluster_ids.add(row.cluster_id);
    bucket.usage_frame_labels.add(row.usage_frame_label);
    for (const routeId of row.related_route_ids || []) bucket.route_ids.add(routeId);
    bucket.provenance_signatures.set(provenanceSignature(row), {
      provenance_id: row.provenance_id,
      version_title: row.version_title,
      version_source: row.version_source,
      license: row.license,
      license_url: row.license_url,
    });
    const sourceClusterKey = `${row.source_ref}::${row.cluster_id}`;
    if (!bucket.source_cluster_map.has(sourceClusterKey)) {
      bucket.source_cluster_map.set(sourceClusterKey, {
        source_cluster_key: sourceClusterKey,
        source_ref: row.source_ref,
        cluster_id: row.cluster_id,
        usage_frame_label: row.usage_frame_label,
        row_count: 0,
        status_counts: { supported: 0, candidate: 0, weak: 0 },
        route_ids: new Set(),
        max_raw_score: 0,
        occurrence_rows: [],
      });
    }
    const clusterBucket = bucket.source_cluster_map.get(sourceClusterKey);
    clusterBucket.row_count += 1;
    if (Object.hasOwn(clusterBucket.status_counts, row.status)) clusterBucket.status_counts[row.status] += 1;
    for (const routeId of row.related_route_ids || []) clusterBucket.route_ids.add(routeId);
    clusterBucket.max_raw_score = Math.max(clusterBucket.max_raw_score, Number(row.raw_score || 0));
    clusterBucket.occurrence_rows.push(safeOccurrenceRow(row));
  }

  return [...sourceMap.values()]
    .map((bucket) => ({
      source_ref: bucket.source_ref,
      source_href: bucket.source_href,
      work_anchor_href: bucket.work_anchor_href,
      work_title: bucket.work_title,
      work_slug: bucket.work_slug,
      row_count: bucket.row_count,
      duplicate_source_ref: bucket.row_count > 1,
      status_counts: bucket.status_counts,
      cluster_ids: [...bucket.cluster_ids].sort(),
      usage_frame_labels: [...bucket.usage_frame_labels].sort(),
      route_ids: [...bucket.route_ids].sort(),
      unresolved_route_ids: [...bucket.route_ids].filter((routeId) => !resolvedRouteIds.has(routeId)).sort(),
      provenance_rows: [...bucket.provenance_signatures.values()].sort((a, b) => a.provenance_id.localeCompare(b.provenance_id)),
      source_cluster_buckets: [...bucket.source_cluster_map.values()]
        .map((clusterBucket) => ({
          ...clusterBucket,
          route_ids: [...clusterBucket.route_ids].sort(),
          unresolved_route_ids: [...clusterBucket.route_ids].filter((routeId) => !resolvedRouteIds.has(routeId)).sort(),
          occurrence_rows: clusterBucket.occurrence_rows.sort((a, b) => b.raw_score - a.raw_score || a.occurrence_id.localeCompare(b.occurrence_id)),
          usage_boundary: {
            observed_usage_only: true,
            reader_facing: false,
            route_ids_only: true,
            source_ref_bucket_navigation_only: true,
            not_answer_authority: true,
            not_definition_authority: true,
            not_semantic_arbitration: true,
          },
        }))
        .sort((a, b) => a.cluster_id.localeCompare(b.cluster_id) || b.max_raw_score - a.max_raw_score),
      usage_boundary: {
        observed_usage_only: true,
        reader_facing: false,
        route_ids_only: true,
        source_ref_bucket_navigation_only: true,
        not_answer_authority: true,
        not_definition_authority: true,
        not_semantic_arbitration: true,
      },
    }))
    .sort((a, b) => b.row_count - a.row_count || a.source_ref.localeCompare(b.source_ref));
}

function safeOccurrenceRow(row) {
  return {
    row_id: row.row_id,
    occurrence_id: row.occurrence_id,
    token_key: row.token_key,
    token_surface: row.token_surface,
    token_normalized: row.token_normalized,
    focus_surface: row.focus_surface,
    focus_normalized: row.focus_normalized,
    status: row.status,
    raw_score: row.raw_score,
    cluster_id: row.cluster_id,
    usage_frame_label: row.usage_frame_label,
    context_focus_marked: row.context_focus_marked,
    related_route_ids: row.related_route_ids || [],
    provenance_id: row.provenance_id,
    version_title: row.version_title,
    version_source: row.version_source,
    license: row.license,
    license_url: row.license_url,
  };
}

function buildCounts(sourceBucketsToCount) {
  const sourceClusterBuckets = sourceBucketsToCount.flatMap((bucket) => bucket.source_cluster_buckets);
  const occurrenceRows = sourceClusterBuckets.flatMap((bucket) => bucket.occurrence_rows);
  const routeIds = new Set(sourceBucketsToCount.flatMap((bucket) => bucket.route_ids));
  const unresolvedRouteIds = new Set(sourceBucketsToCount.flatMap((bucket) => bucket.unresolved_route_ids));
  return {
    source_ref_buckets: sourceBucketsToCount.length,
    source_cluster_buckets: sourceClusterBuckets.length,
    occurrence_rows: occurrenceRows.length,
    duplicate_source_ref_buckets: sourceBucketsToCount.filter((bucket) => bucket.duplicate_source_ref).length,
    duplicate_source_ref_rows: sourceBucketsToCount.filter((bucket) => bucket.duplicate_source_ref).reduce((sum, bucket) => sum + bucket.row_count, 0),
    cross_cluster_source_ref_buckets: sourceBucketsToCount.filter((bucket) => bucket.cluster_ids.length > 1).length,
    cross_cluster_source_ref_rows: sourceBucketsToCount.filter((bucket) => bucket.cluster_ids.length > 1).reduce((sum, bucket) => sum + bucket.row_count, 0),
    status_counts: sumStatusCounts(occurrenceRows),
    route_ids: routeIds.size,
    unresolved_route_ids: unresolvedRouteIds.size,
    unique_works: new Set(sourceBucketsToCount.map((bucket) => bucket.work_slug).filter(Boolean)).size,
    unique_licenses: new Set(occurrenceRows.map((row) => row.license).filter(Boolean)).size,
    unique_version_sources: new Set(occurrenceRows.map((row) => row.version_source).filter(Boolean)).size,
    rows_with_source_link: sourceBucketsToCount.filter((bucket) => bucket.source_href && bucket.work_anchor_href).length,
    rows_with_provenance: occurrenceRows.filter(hasProvenance).length,
    rows_with_hebrew_context: occurrenceRows.filter((row) => hasHebrew(row.context_focus_marked)).length,
    rows_with_focus_marker: occurrenceRows.filter((row) => hasFocusMarker(row.context_focus_marked)).length,
    observed_usage_only_source_buckets: sourceBucketsToCount.filter((bucket) => bucket.usage_boundary?.observed_usage_only === true).length,
    observed_usage_only_source_cluster_buckets: sourceClusterBuckets.filter((bucket) => bucket.usage_boundary?.observed_usage_only === true).length,
    reader_facing_rows: countReaderFacing(sourceBucketsToCount),
    route_payload_field_hits: countExactKeys(sourceBucketsToCount, ['route_payload', 'route_payloads']),
    forbidden_authority_field_hits: countExactKeys(sourceBucketsToCount, forbiddenAuthorityKeys),
  };
}

function buildChecks(counts) {
  return [
    check('source_buckets_present', counts.source_ref_buckets > 0 && counts.source_cluster_buckets > 0 && counts.occurrence_rows > 0 ? 'passed' : 'failed', `source refs/source-clusters/rows ${counts.source_ref_buckets}/${counts.source_cluster_buckets}/${counts.occurrence_rows}`),
    check('source_ref_dedupe_visible', counts.duplicate_source_ref_buckets > 0 && counts.duplicate_source_ref_rows > 0 ? 'passed' : 'failed', `duplicate source-ref buckets/rows ${counts.duplicate_source_ref_buckets}/${counts.duplicate_source_ref_rows}`),
    check('cross_cluster_visibility', counts.cross_cluster_source_ref_buckets > 0 && counts.cross_cluster_source_ref_rows > 0 ? 'passed' : 'failed', `cross-cluster source-ref buckets/rows ${counts.cross_cluster_source_ref_buckets}/${counts.cross_cluster_source_ref_rows}`),
    check('metadata_complete', counts.rows_with_source_link === counts.source_ref_buckets && counts.rows_with_provenance === counts.occurrence_rows && counts.rows_with_hebrew_context === counts.occurrence_rows && counts.rows_with_focus_marker === counts.occurrence_rows ? 'passed' : 'failed', `source links/provenance/context/focus ${counts.rows_with_source_link}/${counts.rows_with_provenance}/${counts.rows_with_hebrew_context}/${counts.rows_with_focus_marker}`),
    check('route_ids_resolved', counts.route_ids > 0 && counts.unresolved_route_ids === 0 ? 'passed' : 'failed', `route IDs ${counts.route_ids}; unresolved ${counts.unresolved_route_ids}`),
    check('usage_only_boundary', counts.observed_usage_only_source_buckets === counts.source_ref_buckets && counts.observed_usage_only_source_cluster_buckets === counts.source_cluster_buckets && counts.reader_facing_rows === 0 && counts.route_payload_field_hits === 0 && counts.forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `observed source/source-cluster ${counts.observed_usage_only_source_buckets}/${counts.observed_usage_only_source_cluster_buckets}; reader-facing/payload/forbidden ${counts.reader_facing_rows}/${counts.route_payload_field_hits}/${counts.forbidden_authority_field_hits}`),
  ];
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Definition Workbench Usage Source Ref Buckets',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Source-ref buckets: ${artifact.counts.source_ref_buckets}`,
    `- Source-ref + cluster buckets: ${artifact.counts.source_cluster_buckets}`,
    `- Occurrence rows: ${artifact.counts.occurrence_rows}`,
    `- Duplicate source-ref buckets / rows: ${artifact.counts.duplicate_source_ref_buckets}/${artifact.counts.duplicate_source_ref_rows}`,
    `- Cross-cluster source-ref buckets / rows: ${artifact.counts.cross_cluster_source_ref_buckets}/${artifact.counts.cross_cluster_source_ref_rows}`,
    `- Supported/candidate/weak rows: ${artifact.counts.status_counts.supported}/${artifact.counts.status_counts.candidate}/${artifact.counts.status_counts.weak}`,
    `- Route IDs / unresolved route IDs: ${artifact.counts.route_ids}/${artifact.counts.unresolved_route_ids}`,
    `- Reader-facing / route-payload / forbidden-authority hits: ${artifact.counts.reader_facing_rows}/${artifact.counts.route_payload_field_hits}/${artifact.counts.forbidden_authority_field_hits}`,
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${mdCell(checkRow.id)} | ${checkRow.status} | ${mdCell(checkRow.detail)} |`),
    '',
    '## Duplicate Source Refs',
    '',
    '| source ref | rows | clusters | statuses | work |',
    '|---|---:|---|---|---|',
    ...artifact.source_ref_buckets
      .filter((bucket) => bucket.duplicate_source_ref)
      .map((bucket) => `| ${mdCell(bucket.source_ref)} | ${bucket.row_count} | ${mdCell(bucket.cluster_ids.join(', '))} | ${mdCell(statusLabel(bucket.status_counts))} | ${mdCell(bucket.work_slug)} |`),
    '',
    '## Boundary',
    '',
    artifact.policy,
    '',
    'This packet is review/navigation structure only. It groups occurrence evidence by source ref and cluster while keeping all underlying rows and explicitly excludes definition payloads, answer selection, ranking decisions, accepted translations, and publication claims.',
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function provenanceSignature(row) {
  return [row.provenance_id, row.version_title, row.version_source, row.license, row.license_url].join('|');
}

function sumStatusCounts(rows) {
  const statusCounts = { supported: 0, candidate: 0, weak: 0 };
  for (const row of rows) {
    if (Object.hasOwn(statusCounts, row.status)) statusCounts[row.status] += 1;
  }
  return statusCounts;
}

function countReaderFacing(value) {
  let count = 0;
  walk(value);
  return count;

  function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }
    if (node.usage_boundary && node.usage_boundary.reader_facing !== false) count += 1;
    for (const child of Object.values(node)) walk(child);
  }
}

function hasProvenance(row) {
  return Boolean(row.version_title && row.version_source && row.license && row.license_url);
}

function hasHebrew(value) {
  return /[\u0590-\u05ff]/.test(String(value || ''));
}

function hasFocusMarker(value) {
  return /\[[^\]]*[\u0590-\u05ff][^\]]*\]/.test(String(value || ''));
}

function statusLabel(statusCounts) {
  return `supported ${statusCounts.supported}, candidate ${statusCounts.candidate}, weak ${statusCounts.weak}`;
}

function check(id, status, detail) {
  return { id, status, detail };
}

function countExactKeys(value, keys) {
  const forbidden = new Set(keys);
  let count = 0;
  walk(value);
  return count;

  function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (forbidden.has(key)) count += 1;
      walk(child);
    }
  }
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--occurrence-links=')) parsed.occurrenceLinks = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--route-resolution=')) parsed.routeResolution = cleanRelativePath(valueAfterEquals(arg));
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

function writeText(relativePath, value) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, value, 'utf8');
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}
