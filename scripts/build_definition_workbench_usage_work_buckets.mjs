#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  occurrenceLinks: 'data/definitions/definition-workbench-usage-occurrence-links.json',
  routeResolution: 'data/definitions/definition-workbench-usage-route-resolution.json',
  output: 'data/definitions/definition-workbench-usage-work-buckets.json',
  report: 'reports/definition-workbench-usage-work-buckets.md',
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
const workBuckets = buildWorkBuckets(occurrenceLinks.occurrence_links || []);
const counts = buildCounts(workBuckets);
const checks = buildChecks(counts);
const failed = checks.filter((check) => check.status === 'failed');
const warnings = checks.filter((check) => check.status === 'warning');

const artifact = {
  schema_version: 1,
  artifact_type: 'definition_workbench_usage_work_buckets',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_definition_workbench_usage_work_buckets.mjs',
  policy: 'Stable Agent 3 Definition Workbench work-bucket packet. It groups selected usage occurrence links by work and work-plus-cluster for review/navigation while preserving each underlying source ref, work/page anchor, Hebrew context, provenance/license metadata, and route IDs only. It does not define terms, translate, copy route payloads, rank routes, choose visible answers, arbitrate semantics, or publish.',
  inputs: {
    occurrence_links: options.occurrenceLinks,
    route_resolution: options.routeResolution,
  },
  authority_policy: {
    usage_navigation_only: true,
    observed_usage_only: true,
    work_bucket_navigation_only: true,
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
  work_buckets: workBuckets,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);

console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Definition Workbench usage work buckets ${artifact.quality.status}; works ${counts.work_buckets}; work/frame buckets ${counts.work_frame_buckets}; rows ${counts.occurrence_rows}`);

function buildWorkBuckets(rows) {
  const workMap = new Map();
  for (const row of rows) {
    const key = row.work_slug;
    if (!workMap.has(key)) {
      workMap.set(key, {
        work_slug: row.work_slug,
        work_title: row.work_title,
        work_href: `${row.work_slug}/index.html`,
        source_refs: new Set(),
        source_hrefs: new Set(),
        work_anchor_hrefs: new Set(),
        provenance_signatures: new Map(),
        route_ids: new Set(),
        row_count: 0,
        status_counts: { supported: 0, candidate: 0, weak: 0 },
        cluster_ids: new Set(),
        usage_frame_labels: new Set(),
        work_frame_map: new Map(),
      });
    }
    const bucket = workMap.get(key);
    bucket.row_count += 1;
    if (Object.hasOwn(bucket.status_counts, row.status)) bucket.status_counts[row.status] += 1;
    bucket.source_refs.add(row.source_ref);
    bucket.source_hrefs.add(row.source_href);
    bucket.work_anchor_hrefs.add(row.work_anchor_href);
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

    const workFrameKey = `${row.work_slug}::${row.cluster_id}`;
    if (!bucket.work_frame_map.has(workFrameKey)) {
      bucket.work_frame_map.set(workFrameKey, {
        work_frame_key: workFrameKey,
        work_slug: row.work_slug,
        work_title: row.work_title,
        cluster_id: row.cluster_id,
        usage_frame_label: row.usage_frame_label,
        row_count: 0,
        status_counts: { supported: 0, candidate: 0, weak: 0 },
        source_refs: new Set(),
        route_ids: new Set(),
        max_raw_score: 0,
        occurrence_rows: [],
      });
    }
    const frameBucket = bucket.work_frame_map.get(workFrameKey);
    frameBucket.row_count += 1;
    if (Object.hasOwn(frameBucket.status_counts, row.status)) frameBucket.status_counts[row.status] += 1;
    frameBucket.source_refs.add(row.source_ref);
    for (const routeId of row.related_route_ids || []) frameBucket.route_ids.add(routeId);
    frameBucket.max_raw_score = Math.max(frameBucket.max_raw_score, Number(row.raw_score || 0));
    frameBucket.occurrence_rows.push(safeOccurrenceRow(row));
  }

  return [...workMap.values()]
    .map((bucket) => ({
      work_slug: bucket.work_slug,
      work_title: bucket.work_title,
      work_href: bucket.work_href,
      row_count: bucket.row_count,
      source_ref_count: bucket.source_refs.size,
      multi_source_ref_work: bucket.source_refs.size > 1,
      multi_frame_work: bucket.cluster_ids.size > 1,
      status_counts: bucket.status_counts,
      source_refs: [...bucket.source_refs].sort(),
      source_hrefs: [...bucket.source_hrefs].sort(),
      work_anchor_hrefs: [...bucket.work_anchor_hrefs].sort(),
      cluster_ids: [...bucket.cluster_ids].sort(),
      usage_frame_labels: [...bucket.usage_frame_labels].sort(),
      route_ids: [...bucket.route_ids].sort(),
      unresolved_route_ids: [...bucket.route_ids].filter((routeId) => !resolvedRouteIds.has(routeId)).sort(),
      provenance_rows: [...bucket.provenance_signatures.values()].sort((a, b) => a.provenance_id.localeCompare(b.provenance_id)),
      work_frame_buckets: [...bucket.work_frame_map.values()]
        .map((frameBucket) => ({
          ...frameBucket,
          source_refs: [...frameBucket.source_refs].sort(),
          route_ids: [...frameBucket.route_ids].sort(),
          unresolved_route_ids: [...frameBucket.route_ids].filter((routeId) => !resolvedRouteIds.has(routeId)).sort(),
          occurrence_rows: frameBucket.occurrence_rows.sort((a, b) => b.raw_score - a.raw_score || a.occurrence_id.localeCompare(b.occurrence_id)),
          usage_boundary: {
            observed_usage_only: true,
            reader_facing: false,
            route_ids_only: true,
            work_bucket_navigation_only: true,
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
        work_bucket_navigation_only: true,
        not_answer_authority: true,
        not_definition_authority: true,
        not_semantic_arbitration: true,
      },
    }))
    .sort((a, b) => b.row_count - a.row_count || a.work_slug.localeCompare(b.work_slug));
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
    source_ref: row.source_ref,
    source_href: row.source_href,
    work_anchor_href: row.work_anchor_href,
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

function buildCounts(workBucketsToCount) {
  const workFrameBuckets = workBucketsToCount.flatMap((bucket) => bucket.work_frame_buckets);
  const occurrenceRows = workFrameBuckets.flatMap((bucket) => bucket.occurrence_rows);
  const routeIds = new Set(workBucketsToCount.flatMap((bucket) => bucket.route_ids));
  const unresolvedRouteIds = new Set(workBucketsToCount.flatMap((bucket) => bucket.unresolved_route_ids));
  return {
    work_buckets: workBucketsToCount.length,
    work_frame_buckets: workFrameBuckets.length,
    occurrence_rows: occurrenceRows.length,
    source_ref_count: new Set(occurrenceRows.map((row) => row.source_ref).filter(Boolean)).size,
    multi_source_ref_work_buckets: workBucketsToCount.filter((bucket) => bucket.multi_source_ref_work).length,
    multi_source_ref_work_rows: workBucketsToCount.filter((bucket) => bucket.multi_source_ref_work).reduce((sum, bucket) => sum + bucket.row_count, 0),
    multi_frame_work_buckets: workBucketsToCount.filter((bucket) => bucket.multi_frame_work).length,
    multi_frame_work_rows: workBucketsToCount.filter((bucket) => bucket.multi_frame_work).reduce((sum, bucket) => sum + bucket.row_count, 0),
    status_counts: sumStatusCounts(occurrenceRows),
    route_ids: routeIds.size,
    unresolved_route_ids: unresolvedRouteIds.size,
    unique_licenses: new Set(occurrenceRows.map((row) => row.license).filter(Boolean)).size,
    unique_version_sources: new Set(occurrenceRows.map((row) => row.version_source).filter(Boolean)).size,
    rows_with_source_link: occurrenceRows.filter((row) => row.source_href && row.source_ref).length,
    rows_with_work_anchor: occurrenceRows.filter((row) => row.work_anchor_href).length,
    rows_with_provenance: occurrenceRows.filter(hasProvenance).length,
    rows_with_hebrew_context: occurrenceRows.filter((row) => hasHebrew(row.context_focus_marked)).length,
    rows_with_focus_marker: occurrenceRows.filter((row) => hasFocusMarker(row.context_focus_marked)).length,
    observed_usage_only_work_buckets: workBucketsToCount.filter((bucket) => bucket.usage_boundary?.observed_usage_only === true).length,
    observed_usage_only_work_frame_buckets: workFrameBuckets.filter((bucket) => bucket.usage_boundary?.observed_usage_only === true).length,
    reader_facing_rows: countReaderFacing(workBucketsToCount),
    route_payload_field_hits: countExactKeys(workBucketsToCount, ['route_payload', 'route_payloads']),
    forbidden_authority_field_hits: countExactKeys(workBucketsToCount, forbiddenAuthorityKeys),
  };
}

function buildChecks(counts) {
  return [
    check('work_buckets_present', counts.work_buckets > 0 && counts.work_frame_buckets > 0 && counts.occurrence_rows > 0 ? 'passed' : 'failed', `works/work-frames/rows ${counts.work_buckets}/${counts.work_frame_buckets}/${counts.occurrence_rows}`),
    check('work_navigation_visible', counts.multi_source_ref_work_buckets > 0 && counts.multi_source_ref_work_rows > 0 && counts.multi_frame_work_buckets > 0 && counts.multi_frame_work_rows > 0 ? 'passed' : 'failed', `multi-source works/rows ${counts.multi_source_ref_work_buckets}/${counts.multi_source_ref_work_rows}; multi-frame works/rows ${counts.multi_frame_work_buckets}/${counts.multi_frame_work_rows}`),
    check('metadata_complete', counts.rows_with_source_link === counts.occurrence_rows && counts.rows_with_work_anchor === counts.occurrence_rows && counts.rows_with_provenance === counts.occurrence_rows && counts.rows_with_hebrew_context === counts.occurrence_rows && counts.rows_with_focus_marker === counts.occurrence_rows ? 'passed' : 'failed', `source/work/provenance/context/focus ${counts.rows_with_source_link}/${counts.rows_with_work_anchor}/${counts.rows_with_provenance}/${counts.rows_with_hebrew_context}/${counts.rows_with_focus_marker}`),
    check('route_ids_resolved', counts.route_ids > 0 && counts.unresolved_route_ids === 0 ? 'passed' : 'failed', `route IDs ${counts.route_ids}; unresolved ${counts.unresolved_route_ids}`),
    check('usage_only_boundary', counts.observed_usage_only_work_buckets === counts.work_buckets && counts.observed_usage_only_work_frame_buckets === counts.work_frame_buckets && counts.reader_facing_rows === 0 && counts.route_payload_field_hits === 0 && counts.forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `observed work/work-frame ${counts.observed_usage_only_work_buckets}/${counts.observed_usage_only_work_frame_buckets}; reader-facing/payload/forbidden ${counts.reader_facing_rows}/${counts.route_payload_field_hits}/${counts.forbidden_authority_field_hits}`),
  ];
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Definition Workbench Usage Work Buckets',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Work buckets: ${artifact.counts.work_buckets}`,
    `- Work + cluster buckets: ${artifact.counts.work_frame_buckets}`,
    `- Occurrence rows: ${artifact.counts.occurrence_rows}`,
    `- Source refs: ${artifact.counts.source_ref_count}`,
    `- Multi-source work buckets / rows: ${artifact.counts.multi_source_ref_work_buckets}/${artifact.counts.multi_source_ref_work_rows}`,
    `- Multi-frame work buckets / rows: ${artifact.counts.multi_frame_work_buckets}/${artifact.counts.multi_frame_work_rows}`,
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
    '## Top Work Buckets',
    '',
    '| work | rows | source refs | clusters | statuses |',
    '|---|---:|---:|---|---|',
    ...artifact.work_buckets
      .slice(0, 20)
      .map((bucket) => `| ${mdCell(bucket.work_slug)} | ${bucket.row_count} | ${bucket.source_ref_count} | ${mdCell(bucket.cluster_ids.join(', '))} | ${mdCell(statusLabel(bucket.status_counts))} |`),
    '',
    '## Boundary',
    '',
    artifact.policy,
    '',
    'This packet is review/navigation structure only. It groups occurrence evidence by work and work-plus-cluster while keeping every underlying source ref, page anchor, Hebrew context, provenance row, license row, and route ID only. It excludes definition payloads, answer selection, ranking decisions, accepted translations, and publication claims.',
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
