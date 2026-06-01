#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  selectedNavigationEdgeIndex: '.local-cache/workbench-evidence/usage-selected-navigation-edge-index.json',
  output: '.local-cache/workbench-evidence/usage-selected-frame-bridge-index.json',
  report: 'reports/workbench-usage-selected-frame-bridge-index.md',
  maxSamplesPerFrame: 8,
};

const options = parseArgs(process.argv.slice(2));
const edgeIndex = readJson(options.selectedNavigationEdgeIndex);

if (edgeIndex.artifact_type !== 'workbench_usage_selected_navigation_edge_index') {
  throw new Error(`${options.selectedNavigationEdgeIndex} is not a selected navigation edge index`);
}

const buckets = new Map();
for (const edge of edgeIndex.edge_rows || []) {
  const sourceCluster = edge.source?.cluster_id || 'unknown-source-cluster';
  const targetCluster = edge.target?.cluster_id || 'unknown-target-cluster';
  const sourceFrame = edge.source?.usage_frame_label || sourceCluster;
  const targetFrame = edge.target?.usage_frame_label || targetCluster;
  const key = [sourceCluster, targetCluster, edge.link_kind || 'unknown'].join(' -> ');
  if (!buckets.has(key)) {
    buckets.set(key, {
      frame_bridge_id: `selected-frame-bridge-${stableHash(key)}`,
      link_kind: edge.link_kind || null,
      source_cluster_id: sourceCluster,
      target_cluster_id: targetCluster,
      source_usage_frame_label: sourceFrame,
      target_usage_frame_label: targetFrame,
      edge_rows: [],
    });
  }
  buckets.get(key).edge_rows.push(edge);
}

const frame_bridge_rows = [...buckets.values()]
  .sort((left, right) => {
    const kind = String(left.link_kind).localeCompare(String(right.link_kind));
    if (kind !== 0) return kind;
    const source = String(left.source_cluster_id).localeCompare(String(right.source_cluster_id));
    if (source !== 0) return source;
    return String(left.target_cluster_id).localeCompare(String(right.target_cluster_id));
  })
  .map((bucket) => summarizeBucket(bucket, options.maxSamplesPerFrame));

const counts = buildCounts(frame_bridge_rows, edgeIndex);
const checks = buildChecks(counts, edgeIndex);
const failedCount = checks.filter((check) => check.status !== 'passed').length;

const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_selected_frame_bridge_index',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_selected_frame_bridge_index.mjs',
  policy: 'Directed usage-frame bridge index for selected recurrence edges. It groups observed same-frame and cross-frame links with counts, samples, route IDs, and provenance buckets only; it does not rank routes or choose visible answers.',
  inputs: {
    selected_navigation_edge_index: options.selectedNavigationEdgeIndex,
  },
  authority_policy: {
    usage_navigation_only: true,
    observed_usage_not_semantic_claim: true,
    ranks_routes: false,
    selects_visible_result: false,
    reader_facing: false,
    carries_route_payloads: false,
  },
  quality: {
    status: failedCount === 0 ? 'passed' : 'failed',
    failed_count: failedCount,
    warning_count: 0,
  },
  counts,
  checks,
  frame_bridge_rows,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);

console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Selected frame bridge rows ${counts.rows}; edge memberships ${counts.edge_memberships}; route payload hits ${counts.route_payload_field_hits}`);

function summarizeBucket(bucket, maxSamples) {
  const edges = bucket.edge_rows;
  const sourceOccurrenceIds = sortedUnique(edges.map((edge) => edge.source_occurrence_id).filter(Boolean));
  const targetOccurrenceIds = sortedUnique(edges.map((edge) => edge.target_occurrence_id).filter(Boolean));
  const sourceRefs = sortedUnique(edges.map((edge) => edge.source?.source_ref).filter(Boolean));
  const targetRefs = sortedUnique(edges.map((edge) => edge.target?.source_ref).filter(Boolean));
  const sourceWorks = sortedUnique(edges.map((edge) => edge.source?.work_slug).filter(Boolean));
  const targetWorks = sortedUnique(edges.map((edge) => edge.target?.work_slug).filter(Boolean));
  const routeIds = sortedUnique(edges.flatMap((edge) => edge.shared_route_ids || []));
  const sourceProvenance = sortedUnique(edges.map((edge) => edge.source?.provenance_id).filter(Boolean));
  const targetProvenance = sortedUnique(edges.map((edge) => edge.target?.provenance_id).filter(Boolean));
  const strengthCounts = countBy(edges, (edge) => edge.crossmatch_strength || 'unknown');
  const relationshipCounts = countRelationships(edges);
  const samples = edges
    .slice()
    .sort((left, right) => Number(right.crossmatch_score || 0) - Number(left.crossmatch_score || 0))
    .slice(0, maxSamples)
    .map((edge) => ({
      edge_id: edge.edge_id,
      source_occurrence_id: edge.source_occurrence_id,
      target_occurrence_id: edge.target_occurrence_id,
      crossmatch_score: edge.crossmatch_score,
      crossmatch_strength: edge.crossmatch_strength,
      source_ref: edge.source?.source_ref || null,
      source_href: edge.source?.source_href || null,
      source_work_anchor_href: edge.source?.work_anchor_href || null,
      source_context_focus_marked: edge.source?.context_focus_marked || null,
      target_ref: edge.target?.source_ref || null,
      target_href: edge.target?.source_href || null,
      target_work_anchor_href: edge.target?.work_anchor_href || null,
      target_context_focus_marked: edge.target?.context_focus_marked || null,
      shared_route_ids: Array.isArray(edge.shared_route_ids) ? edge.shared_route_ids : [],
    }));

  return {
    frame_bridge_id: bucket.frame_bridge_id,
    link_kind: bucket.link_kind,
    source_cluster_id: bucket.source_cluster_id,
    target_cluster_id: bucket.target_cluster_id,
    source_usage_frame_label: bucket.source_usage_frame_label,
    target_usage_frame_label: bucket.target_usage_frame_label,
    counts: {
      edge_memberships: edges.length,
      source_occurrences: sourceOccurrenceIds.length,
      target_occurrences: targetOccurrenceIds.length,
      source_refs: sourceRefs.length,
      target_refs: targetRefs.length,
      source_works: sourceWorks.length,
      target_works: targetWorks.length,
      shared_route_ids: routeIds.length,
      source_provenance_buckets: sourceProvenance.length,
      target_provenance_buckets: targetProvenance.length,
      strong_edges: strengthCounts.strong || 0,
      moderate_edges: strengthCounts.moderate || 0,
      weak_edges: strengthCounts.weak || 0,
    },
    relationship_counts: relationshipCounts,
    shared_route_ids: routeIds,
    source_provenance_ids: sourceProvenance,
    target_provenance_ids: targetProvenance,
    samples,
    navigation_flags: {
      observed_usage_only: true,
      reader_facing: false,
      has_samples: samples.length > 0,
      has_shared_route_ids: routeIds.length > 0,
      samples_have_links: samples.every((sample) => sample.source_href && sample.target_href && sample.source_work_anchor_href && sample.target_work_anchor_href),
      samples_have_context: samples.every((sample) => sample.source_context_focus_marked && sample.target_context_focus_marked),
    },
  };
}

function buildCounts(rows, edgeIndex) {
  const edgeMemberships = rows.reduce((sum, row) => sum + Number(row.counts?.edge_memberships || 0), 0);
  const routeIds = sortedUnique(rows.flatMap((row) => row.shared_route_ids || []));
  const sourceClusters = sortedUnique(rows.map((row) => row.source_cluster_id).filter(Boolean));
  const targetClusters = sortedUnique(rows.map((row) => row.target_cluster_id).filter(Boolean));
  const provenanceBuckets = sortedUnique(rows.flatMap((row) => [...(row.source_provenance_ids || []), ...(row.target_provenance_ids || [])]));
  const samples = rows.flatMap((row) => row.samples || []);
  return {
    rows: rows.length,
    edge_memberships: edgeMemberships,
    same_frame_rows: rows.filter((row) => row.link_kind === 'same_frame').length,
    bridge_frame_rows: rows.filter((row) => row.link_kind === 'bridge_frame').length,
    same_frame_edges: rows.filter((row) => row.link_kind === 'same_frame').reduce((sum, row) => sum + Number(row.counts?.edge_memberships || 0), 0),
    bridge_frame_edges: rows.filter((row) => row.link_kind === 'bridge_frame').reduce((sum, row) => sum + Number(row.counts?.edge_memberships || 0), 0),
    source_clusters: sourceClusters.length,
    target_clusters: targetClusters.length,
    unique_route_ids: routeIds.length,
    provenance_buckets: provenanceBuckets.length,
    sample_rows: samples.length,
    sample_rows_with_links: samples.filter((sample) => sample.source_href && sample.target_href && sample.source_work_anchor_href && sample.target_work_anchor_href).length,
    sample_rows_with_context: samples.filter((sample) => sample.source_context_focus_marked && sample.target_context_focus_marked).length,
    observed_usage_only_rows: rows.length,
    reader_facing_rows: rows.filter((row) => row.navigation_flags.reader_facing).length,
    route_payload_field_hits: countForbiddenKeys(rows),
    expected_edges: Number(edgeIndex.counts?.edges || 0),
    expected_same_frame_edges: Number(edgeIndex.counts?.same_frame_edges || 0),
    expected_bridge_edges: Number(edgeIndex.counts?.bridge_edges || 0),
  };
}

function buildChecks(counts) {
  return [
    check('rows_present', counts.rows > 0, `rows ${counts.rows}`),
    check('edge_memberships_complete', counts.edge_memberships === counts.expected_edges, `memberships ${counts.edge_memberships}; expected ${counts.expected_edges}`),
    check('same_frame_edges_complete', counts.same_frame_edges === counts.expected_same_frame_edges, `same-frame ${counts.same_frame_edges}; expected ${counts.expected_same_frame_edges}`),
    check('bridge_edges_complete', counts.bridge_frame_edges === counts.expected_bridge_edges, `bridge ${counts.bridge_frame_edges}; expected ${counts.expected_bridge_edges}`),
    check('frame_rows_cover_same_and_bridge', counts.same_frame_rows > 0 && counts.bridge_frame_rows > 0, `same-frame rows ${counts.same_frame_rows}; bridge rows ${counts.bridge_frame_rows}`),
    check('route_ids_carried_without_payloads', counts.unique_route_ids > 0, `route IDs ${counts.unique_route_ids}`),
    check('samples_have_links', counts.sample_rows_with_links === counts.sample_rows, `sample links ${counts.sample_rows_with_links}; samples ${counts.sample_rows}`),
    check('samples_have_context', counts.sample_rows_with_context === counts.sample_rows, `sample context ${counts.sample_rows_with_context}; samples ${counts.sample_rows}`),
    check('reader_facing_blocked', counts.reader_facing_rows === 0, `reader-facing rows ${counts.reader_facing_rows}`),
    check('no_route_payload_fields', counts.route_payload_field_hits === 0, `route payload-like field hits ${counts.route_payload_field_hits}`),
  ];
}

function countBy(values, mapper) {
  const counts = {};
  for (const value of values) {
    const key = mapper(value);
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

function countRelationships(edges) {
  const counts = {};
  for (const edge of edges) {
    for (const relationship of edge.relationships || []) {
      counts[relationship] = (counts[relationship] || 0) + 1;
    }
  }
  return Object.fromEntries(Object.entries(counts).sort(([left], [right]) => left.localeCompare(right)));
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

  function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (forbidden.has(key)) hits += 1;
      walk(child);
    }
  }
}

function check(id, passed, detail) {
  return { id, status: passed ? 'passed' : 'failed', detail };
}

function stableHash(value) {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function sortedUnique(values) {
  return [...new Set(values)].sort((left, right) => String(left).localeCompare(String(right)));
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Selected Frame Bridge Index',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Frame bridge rows: ${artifact.counts.rows}`,
    `- Edge memberships: ${artifact.counts.edge_memberships}`,
    `- Same-frame rows: ${artifact.counts.same_frame_rows}`,
    `- Bridge-frame rows: ${artifact.counts.bridge_frame_rows}`,
    `- Same-frame edges: ${artifact.counts.same_frame_edges}`,
    `- Bridge-frame edges: ${artifact.counts.bridge_frame_edges}`,
    `- Source clusters: ${artifact.counts.source_clusters}`,
    `- Target clusters: ${artifact.counts.target_clusters}`,
    `- Route IDs: ${artifact.counts.unique_route_ids}`,
    `- Provenance buckets: ${artifact.counts.provenance_buckets}`,
    `- Sample rows: ${artifact.counts.sample_rows}`,
    `- Reader-facing rows: ${artifact.counts.reader_facing_rows}`,
    `- Route payload-like field hits: ${artifact.counts.route_payload_field_hits}`,
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((row) => `| ${mdCell(row.id)} | ${mdCell(row.status)} | ${mdCell(row.detail)} |`),
    '',
    '## Frame Bridges',
    '',
    '| bridge | kind | source frame | target frame | edges | source refs | target refs | route IDs |',
    '|---|---|---|---|---:|---:|---:|---:|',
    ...artifact.frame_bridge_rows.map((row) => `| ${mdCell(row.frame_bridge_id)} | ${mdCell(row.link_kind)} | ${mdCell(row.source_usage_frame_label)} | ${mdCell(row.target_usage_frame_label)} | ${row.counts.edge_memberships} | ${row.counts.source_refs} | ${row.counts.target_refs} | ${row.counts.shared_route_ids} |`),
    '',
    '## Boundary',
    '',
    'This frame bridge index summarizes observed usage-frame links only. It is not reader-facing, does not rank routes, and carries no copied route payloads.',
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--selected-navigation-edge-index=')) parsed.selectedNavigationEdgeIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--max-samples-per-frame=')) parsed.maxSamplesPerFrame = Number(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
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

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function valueAfterEquals(arg) {
  return arg.split('=').slice(1).join('=');
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}
