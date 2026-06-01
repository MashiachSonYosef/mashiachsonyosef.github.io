#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  selectedNavigationEdgeIndex: '.local-cache/workbench-evidence/usage-selected-navigation-edge-index.json',
  output: '.local-cache/workbench-evidence/usage-selected-occurrence-adjacency-index.json',
  report: 'reports/workbench-usage-selected-occurrence-adjacency-index.md',
};

const options = parseArgs(process.argv.slice(2));
const edgeIndex = readJson(options.selectedNavigationEdgeIndex);

if (edgeIndex.artifact_type !== 'workbench_usage_selected_navigation_edge_index') {
  throw new Error(`${options.selectedNavigationEdgeIndex} is not a selected navigation edge index`);
}

const bySource = new Map();
for (const edge of edgeIndex.edge_rows || []) {
  const sourceId = edge.source_occurrence_id;
  if (!sourceId) continue;
  if (!bySource.has(sourceId)) bySource.set(sourceId, []);
  bySource.get(sourceId).push(edge);
}

const adjacency_rows = [...bySource.entries()]
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([occurrenceId, edges]) => buildAdjacencyRow(occurrenceId, edges));

const counts = buildCounts(adjacency_rows, edgeIndex);
const checks = buildChecks(counts, edgeIndex);
const failedCount = checks.filter((check) => check.status !== 'passed').length;

const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_selected_occurrence_adjacency_index',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_selected_occurrence_adjacency_index.mjs',
  policy: 'Occurrence-centric adjacency index for selected usage navigation. It groups validated recurrence edges by source occurrence and preserves links, context, raw scores, route IDs, and provenance without ranking routes or choosing visible answers.',
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
  adjacency_rows,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);

console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Selected occurrence adjacency rows ${counts.rows}; target links ${counts.target_links}; route payload hits ${counts.route_payload_field_hits}`);

function buildAdjacencyRow(occurrenceId, edges) {
  const orderedEdges = [...edges].sort((left, right) => {
    const scoreDelta = Number(right.crossmatch_score || 0) - Number(left.crossmatch_score || 0);
    if (scoreDelta !== 0) return scoreDelta;
    return String(left.target_occurrence_id || '').localeCompare(String(right.target_occurrence_id || ''));
  });
  const source = stripEndpointForSource(orderedEdges[0]?.source || {});
  const targetLinks = orderedEdges.map((edge) => ({
    target_occurrence_id: edge.target_occurrence_id,
    link_kind: edge.link_kind,
    crossmatch_score: edge.crossmatch_score,
    crossmatch_strength: edge.crossmatch_strength,
    relationships: Array.isArray(edge.relationships) ? edge.relationships : [],
    shared_route_ids: Array.isArray(edge.shared_route_ids) ? edge.shared_route_ids : [],
    shared_slice_ids: Array.isArray(edge.shared_slice_ids) ? edge.shared_slice_ids : [],
    target: stripEndpointForTarget(edge.target || {}),
  }));
  const sameFrame = targetLinks.filter((link) => link.link_kind === 'same_frame').length;
  const bridgeFrame = targetLinks.filter((link) => link.link_kind === 'bridge_frame').length;
  const strengthCounts = countBy(targetLinks, (link) => link.crossmatch_strength || 'unknown');
  const relationships = countRelationships(targetLinks);
  const routeIds = sortedUnique(targetLinks.flatMap((link) => link.shared_route_ids || []));
  const targetRefs = sortedUnique(targetLinks.map((link) => link.target.source_ref).filter(Boolean));
  const targetWorks = sortedUnique(targetLinks.map((link) => link.target.work_slug).filter(Boolean));
  const targetClusters = sortedUnique(targetLinks.map((link) => link.target.cluster_id).filter(Boolean));
  const targetFrames = sortedUnique(targetLinks.map((link) => link.target.usage_frame_label).filter(Boolean));
  const targetProvenanceBuckets = sortedUnique(targetLinks.map((link) => link.target.provenance_id).filter(Boolean));

  return {
    occurrence_id: occurrenceId,
    source,
    adjacency_counts: {
      target_links: targetLinks.length,
      same_frame_links: sameFrame,
      bridge_frame_links: bridgeFrame,
      strong_links: strengthCounts.strong || 0,
      moderate_links: strengthCounts.moderate || 0,
      weak_links: strengthCounts.weak || 0,
      unique_target_refs: targetRefs.length,
      unique_target_works: targetWorks.length,
      unique_target_clusters: targetClusters.length,
      unique_target_frames: targetFrames.length,
      target_provenance_buckets: targetProvenanceBuckets.length,
      shared_route_ids: routeIds.length,
    },
    relationship_counts: relationships,
    shared_route_ids: routeIds,
    target_links: targetLinks,
    navigation_flags: {
      observed_usage_only: true,
      reader_facing: false,
      has_source_context: Boolean(source.context_focus_marked),
      has_source_link: Boolean(source.source_href && source.work_anchor_href),
      has_source_provenance: Boolean(source.provenance_id && source.license && source.version_title),
      target_links_complete: targetLinks.every((link) => hasTargetNavigation(link.target)),
      has_shared_route_ids: routeIds.length > 0,
    },
  };
}

function stripEndpointForSource(endpoint) {
  return {
    source_ref: endpoint.source_ref || null,
    source_href: endpoint.source_href || null,
    work_anchor_href: endpoint.work_anchor_href || null,
    work_title: endpoint.work_title || null,
    work_slug: endpoint.work_slug || null,
    token_surface: endpoint.token_surface || null,
    token_normalized: endpoint.token_normalized || null,
    focus_surface: endpoint.focus_surface || null,
    focus_normalized: endpoint.focus_normalized || null,
    status: endpoint.status || null,
    raw_score: endpoint.raw_score ?? null,
    cluster_id: endpoint.cluster_id || null,
    usage_frame_label: endpoint.usage_frame_label || null,
    context_focus_marked: endpoint.context_focus_marked || null,
    related_route_ids: Array.isArray(endpoint.related_route_ids) ? endpoint.related_route_ids : [],
    provenance_id: endpoint.provenance_id || null,
    version_title: endpoint.version_title || null,
    version_source: endpoint.version_source || null,
    license: endpoint.license || null,
    license_url: endpoint.license_url || null,
  };
}

function stripEndpointForTarget(endpoint) {
  return stripEndpointForSource(endpoint);
}

function buildCounts(rows, edgeIndex) {
  const targetLinks = rows.flatMap((row) => row.target_links || []);
  const uniqueSourceRefs = sortedUnique(rows.map((row) => row.source.source_ref).filter(Boolean));
  const uniqueWorkAnchors = sortedUnique(rows.map((row) => row.source.work_anchor_href).filter(Boolean));
  const uniqueWorks = sortedUnique(rows.map((row) => row.source.work_slug).filter(Boolean));
  const sourceClusters = sortedUnique(rows.map((row) => row.source.cluster_id).filter(Boolean));
  const sourceFrames = sortedUnique(rows.map((row) => row.source.usage_frame_label).filter(Boolean));
  const routeIds = sortedUnique(rows.flatMap((row) => row.shared_route_ids || []));
  const provenanceBuckets = sortedUnique(rows.map((row) => row.source.provenance_id).filter(Boolean));
  const targetProvenanceBuckets = sortedUnique(targetLinks.map((link) => link.target.provenance_id).filter(Boolean));
  const strengthCounts = countBy(targetLinks, (link) => link.crossmatch_strength || 'unknown');
  const relationshipCounts = countRelationships(targetLinks);

  return {
    rows: rows.length,
    source_occurrences: rows.length,
    target_links: targetLinks.length,
    expected_target_links: Number(edgeIndex.counts?.edges || 0),
    unique_source_refs: uniqueSourceRefs.length,
    unique_work_anchors: uniqueWorkAnchors.length,
    unique_works: uniqueWorks.length,
    source_clusters: sourceClusters.length,
    usage_frames: sourceFrames.length,
    unique_route_ids: routeIds.length,
    provenance_buckets: provenanceBuckets.length,
    target_provenance_buckets: targetProvenanceBuckets.length,
    same_frame_links: targetLinks.filter((link) => link.link_kind === 'same_frame').length,
    bridge_frame_links: targetLinks.filter((link) => link.link_kind === 'bridge_frame').length,
    strong_links: strengthCounts.strong || 0,
    moderate_links: strengthCounts.moderate || 0,
    weak_links: strengthCounts.weak || 0,
    rows_with_source_context: rows.filter((row) => row.navigation_flags.has_source_context).length,
    rows_with_source_link: rows.filter((row) => row.navigation_flags.has_source_link).length,
    rows_with_source_provenance: rows.filter((row) => row.navigation_flags.has_source_provenance).length,
    rows_with_complete_targets: rows.filter((row) => row.navigation_flags.target_links_complete).length,
    target_links_with_context: targetLinks.filter((link) => Boolean(link.target.context_focus_marked)).length,
    target_links_with_source_link: targetLinks.filter((link) => Boolean(link.target.source_href && link.target.work_anchor_href)).length,
    target_links_with_provenance: targetLinks.filter((link) => Boolean(link.target.provenance_id && link.target.license && link.target.version_title)).length,
    relationship_counts: relationshipCounts,
    observed_usage_only_rows: rows.length,
    reader_facing_rows: rows.filter((row) => row.navigation_flags.reader_facing).length,
    route_payload_field_hits: countForbiddenKeys(rows),
  };
}

function buildChecks(counts, edgeIndex) {
  return [
    check('row_count_matches_sources', counts.rows === Number(edgeIndex.counts?.unique_source_occurrences || 0), `rows ${counts.rows}; edge sources ${edgeIndex.counts?.unique_source_occurrences}`),
    check('target_links_match_edges', counts.target_links === Number(edgeIndex.counts?.edges || 0), `target links ${counts.target_links}; edges ${edgeIndex.counts?.edges}`),
    check('link_partition_complete', counts.same_frame_links + counts.bridge_frame_links === counts.target_links, `same-frame ${counts.same_frame_links}; bridge ${counts.bridge_frame_links}; target links ${counts.target_links}`),
    check('source_context_complete', counts.rows_with_source_context === counts.rows, `source context ${counts.rows_with_source_context}; rows ${counts.rows}`),
    check('source_links_complete', counts.rows_with_source_link === counts.rows, `source links ${counts.rows_with_source_link}; rows ${counts.rows}`),
    check('source_provenance_complete', counts.rows_with_source_provenance === counts.rows, `source provenance ${counts.rows_with_source_provenance}; rows ${counts.rows}`),
    check('target_context_complete', counts.target_links_with_context === counts.target_links, `target context ${counts.target_links_with_context}; target links ${counts.target_links}`),
    check('target_links_complete', counts.target_links_with_source_link === counts.target_links, `target links with hrefs ${counts.target_links_with_source_link}; target links ${counts.target_links}`),
    check('target_provenance_complete', counts.target_links_with_provenance === counts.target_links, `target provenance ${counts.target_links_with_provenance}; target links ${counts.target_links}`),
    check('route_ids_carried_without_payloads', counts.unique_route_ids === Number(edgeIndex.counts?.unique_route_ids || 0), `route IDs ${counts.unique_route_ids}; edge route IDs ${edgeIndex.counts?.unique_route_ids}`),
    check('reader_facing_blocked', counts.reader_facing_rows === 0, `reader-facing rows ${counts.reader_facing_rows}`),
    check('no_route_payload_fields', counts.route_payload_field_hits === 0, `route payload-like field hits ${counts.route_payload_field_hits}`),
  ];
}

function hasTargetNavigation(target) {
  return Boolean(target.source_href)
    && Boolean(target.work_anchor_href)
    && Boolean(target.context_focus_marked)
    && Boolean(target.provenance_id)
    && Boolean(target.license)
    && Boolean(target.version_title);
}

function countBy(values, mapper) {
  const counts = {};
  for (const value of values) {
    const key = mapper(value);
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

function countRelationships(targetLinks) {
  const counts = {};
  for (const link of targetLinks) {
    for (const relationship of link.relationships || []) {
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

function check(id, status, detail) {
  return { id, status: status ? 'passed' : 'failed', detail };
}

function sortedUnique(values) {
  return [...new Set(values)].sort((left, right) => String(left).localeCompare(String(right)));
}

function writeReport(relativePath, artifact) {
  const samples = artifact.adjacency_rows.slice(0, 12);
  const lines = [
    '# Workbench Usage Selected Occurrence Adjacency Index',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Rows: ${artifact.counts.rows}`,
    `- Target links: ${artifact.counts.target_links}`,
    `- Source refs: ${artifact.counts.unique_source_refs}`,
    `- Works: ${artifact.counts.unique_works}`,
    `- Source clusters: ${artifact.counts.source_clusters}`,
    `- Usage frames: ${artifact.counts.usage_frames}`,
    `- Route IDs: ${artifact.counts.unique_route_ids}`,
    `- Same-frame links: ${artifact.counts.same_frame_links}`,
    `- Bridge-frame links: ${artifact.counts.bridge_frame_links}`,
    `- Strong links: ${artifact.counts.strong_links}`,
    `- Moderate links: ${artifact.counts.moderate_links}`,
    `- Weak links: ${artifact.counts.weak_links}`,
    `- Rows with complete source context/link/provenance: ${artifact.counts.rows_with_source_context}/${artifact.counts.rows_with_source_link}/${artifact.counts.rows_with_source_provenance}`,
    `- Target links with complete context/link/provenance: ${artifact.counts.target_links_with_context}/${artifact.counts.target_links_with_source_link}/${artifact.counts.target_links_with_provenance}`,
    `- Reader-facing rows: ${artifact.counts.reader_facing_rows}`,
    `- Route payload-like field hits: ${artifact.counts.route_payload_field_hits}`,
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((row) => `| ${mdCell(row.id)} | ${mdCell(row.status)} | ${mdCell(row.detail)} |`),
    '',
    '## Sample Rows',
    '',
    '| occurrence | ref | frame | target links | same-frame | bridge | route IDs |',
    '|---|---|---|---:|---:|---:|---:|',
    ...samples.map((row) => `| ${mdCell(row.occurrence_id)} | ${mdCell(row.source.source_ref)} | ${mdCell(row.source.usage_frame_label)} | ${row.adjacency_counts.target_links} | ${row.adjacency_counts.same_frame_links} | ${row.adjacency_counts.bridge_frame_links} | ${row.adjacency_counts.shared_route_ids} |`),
    '',
    '## Boundary',
    '',
    'This adjacency index is an occurrence-navigation layer. It groups observed recurrence links and carries context/provenance only; it does not rank routes, select visible answers, translate, or assert semantic conclusions.',
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--selected-navigation-edge-index=')) parsed.selectedNavigationEdgeIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
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
