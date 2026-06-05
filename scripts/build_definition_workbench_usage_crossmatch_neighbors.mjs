#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  occurrenceLinks: 'data/definitions/definition-workbench-usage-occurrence-links.json',
  adjacencyIndex: '.local-cache/workbench-evidence/usage-selected-occurrence-adjacency-index.json',
  routeResolution: 'data/definitions/definition-workbench-usage-route-resolution.json',
  output: 'data/definitions/definition-workbench-usage-crossmatch-neighbors.json',
  report: 'reports/definition-workbench-usage-crossmatch-neighbors.md',
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
const adjacencyIndex = readJson(options.adjacencyIndex);
const routeResolution = readJson(options.routeResolution);

if (occurrenceLinks.artifact_type !== 'definition_workbench_usage_occurrence_links') {
  throw new Error(`${options.occurrenceLinks} is not a Definition Workbench occurrence-links packet`);
}
if (adjacencyIndex.artifact_type !== 'workbench_usage_selected_occurrence_adjacency_index') {
  throw new Error(`${options.adjacencyIndex} is not a selected occurrence adjacency index`);
}
if (routeResolution.artifact_type !== 'definition_workbench_usage_route_resolution') {
  throw new Error(`${options.routeResolution} is not a Definition Workbench route-resolution packet`);
}

const adjacencyByOccurrenceId = new Map((adjacencyIndex.adjacency_rows || []).map((row) => [row.occurrence_id, row]));
const resolvedRouteIds = new Set((routeResolution.routes || []).filter((route) => route.resolution_status === 'resolved').map((route) => route.route_id));
const crossmatchRows = (occurrenceLinks.occurrence_links || []).map((occurrenceLink, index) => {
  const adjacency = adjacencyByOccurrenceId.get(occurrenceLink.occurrence_id);
  if (!adjacency) throw new Error(`Missing adjacency row for ${occurrenceLink.occurrence_id}`);
  const links = Array.isArray(adjacency.target_links) ? adjacency.target_links.map(normalizeNeighborLink) : [];
  const sameFrameNeighbors = links.filter((link) => link.link_kind === 'same_frame');
  const bridgeFrameNeighbors = links.filter((link) => link.link_kind === 'bridge_frame');
  return {
    row_id: `definition-workbench-usage-crossmatch-neighbor-${String(index + 1).padStart(3, '0')}`,
    occurrence_id: occurrenceLink.occurrence_id,
    token_key: occurrenceLink.token_key,
    token_surface: occurrenceLink.token_surface,
    token_normalized: occurrenceLink.token_normalized,
    focus_surface: occurrenceLink.focus_surface,
    focus_normalized: occurrenceLink.focus_normalized,
    source_ref: occurrenceLink.source_ref,
    source_href: occurrenceLink.source_href,
    work_anchor_href: occurrenceLink.work_anchor_href,
    work_title: occurrenceLink.work_title,
    work_slug: occurrenceLink.work_slug,
    status: occurrenceLink.status,
    raw_score: occurrenceLink.raw_score,
    cluster_id: occurrenceLink.cluster_id,
    usage_frame_label: occurrenceLink.usage_frame_label,
    context_focus_marked: occurrenceLink.context_focus_marked,
    related_route_ids: occurrenceLink.related_route_ids || [],
    provenance_id: occurrenceLink.provenance_id,
    version_title: occurrenceLink.version_title,
    version_source: occurrenceLink.version_source,
    license: occurrenceLink.license,
    license_url: occurrenceLink.license_url,
    neighbor_summary: {
      total_neighbors: links.length,
      same_frame_neighbors: sameFrameNeighbors.length,
      bridge_frame_neighbors: bridgeFrameNeighbors.length,
      strong_neighbors: links.filter((link) => link.crossmatch_strength === 'strong').length,
      moderate_neighbors: links.filter((link) => link.crossmatch_strength === 'moderate').length,
      weak_neighbors: links.filter((link) => link.crossmatch_strength === 'weak').length,
      unique_target_refs: new Set(links.map((link) => link.target?.source_ref).filter(Boolean)).size,
      unique_target_works: new Set(links.map((link) => link.target?.work_slug).filter(Boolean)).size,
      unique_target_clusters: new Set(links.map((link) => link.target?.cluster_id).filter(Boolean)).size,
      unique_target_frames: new Set(links.map((link) => link.target?.usage_frame_label).filter(Boolean)).size,
    },
    same_frame_neighbors: sameFrameNeighbors,
    bridge_frame_neighbors: bridgeFrameNeighbors,
    usage_boundary: {
      observed_usage_only: true,
      reader_facing: false,
      route_ids_only: true,
      crossmatch_navigation_only: true,
      not_answer_authority: true,
      not_definition_authority: true,
      not_semantic_arbitration: true,
    },
  };
});

const counts = buildCounts(crossmatchRows);
const checks = buildChecks(counts);
const failed = checks.filter((check) => check.status === 'failed');
const warnings = checks.filter((check) => check.status === 'warning');

const artifact = {
  schema_version: 1,
  artifact_type: 'definition_workbench_usage_crossmatch_neighbors',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_definition_workbench_usage_crossmatch_neighbors.mjs',
  policy: 'Stable Agent 3 Definition Workbench crossmatch-neighbor packet. It exposes selected occurrence-to-occurrence usage navigation links with source/context/provenance/license metadata and route IDs only. It does not define terms, translate, copy route payloads, rank routes, choose visible answers, arbitrate semantics, or publish.',
  inputs: {
    occurrence_links: options.occurrenceLinks,
    selected_occurrence_adjacency_index: options.adjacencyIndex,
    route_resolution: options.routeResolution,
  },
  authority_policy: {
    usage_navigation_only: true,
    observed_usage_only: true,
    crossmatch_neighbors_only: true,
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
  crossmatch_rows: crossmatchRows,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);

console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Definition Workbench usage crossmatch neighbors ${artifact.quality.status}; rows ${counts.source_occurrence_rows}; links ${counts.neighbor_link_rows}; reader-facing ${counts.reader_facing_rows}`);

function normalizeNeighborLink(link) {
  return {
    target_occurrence_id: link.target_occurrence_id,
    link_kind: link.link_kind,
    crossmatch_score: link.crossmatch_score,
    crossmatch_strength: link.crossmatch_strength,
    relationships: link.relationships || [],
    shared_route_ids: link.shared_route_ids || [],
    shared_slice_ids: link.shared_slice_ids || [],
    target: safeOccurrenceFields(link.target || {}),
  };
}

function safeOccurrenceFields(row) {
  return {
    source_ref: row.source_ref,
    source_href: row.source_href,
    work_anchor_href: row.work_anchor_href,
    work_title: row.work_title,
    work_slug: row.work_slug,
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

function buildCounts(rows) {
  const allNeighborLinks = rows.flatMap((row) => [...row.same_frame_neighbors, ...row.bridge_frame_neighbors]);
  const statusCounts = { supported: 0, candidate: 0, weak: 0 };
  const targetStatusCounts = { supported: 0, candidate: 0, weak: 0 };
  const strengthCounts = { strong: 0, moderate: 0, weak: 0 };
  const relationshipCounts = {};
  const routeIds = new Set();
  const unresolvedRouteIds = new Set();
  for (const row of rows) {
    if (Object.hasOwn(statusCounts, row.status)) statusCounts[row.status] += 1;
    for (const routeId of row.related_route_ids || []) {
      routeIds.add(routeId);
      if (!resolvedRouteIds.has(routeId)) unresolvedRouteIds.add(routeId);
    }
  }
  for (const link of allNeighborLinks) {
    if (Object.hasOwn(targetStatusCounts, link.target?.status)) targetStatusCounts[link.target.status] += 1;
    if (Object.hasOwn(strengthCounts, link.crossmatch_strength)) strengthCounts[link.crossmatch_strength] += 1;
    for (const relation of link.relationships || []) {
      relationshipCounts[relation] = Number(relationshipCounts[relation] || 0) + 1;
    }
    for (const routeId of [...(link.shared_route_ids || []), ...(link.target?.related_route_ids || [])]) {
      routeIds.add(routeId);
      if (!resolvedRouteIds.has(routeId)) unresolvedRouteIds.add(routeId);
    }
  }
  return {
    source_occurrence_rows: rows.length,
    neighbor_link_rows: allNeighborLinks.length,
    same_frame_neighbor_links: allNeighborLinks.filter((link) => link.link_kind === 'same_frame').length,
    bridge_frame_neighbor_links: allNeighborLinks.filter((link) => link.link_kind === 'bridge_frame').length,
    unique_source_refs: new Set(rows.map((row) => row.source_ref).filter(Boolean)).size,
    unique_target_refs: new Set(allNeighborLinks.map((link) => link.target?.source_ref).filter(Boolean)).size,
    unique_works: new Set(rows.flatMap((row) => [row.work_slug, ...[...row.same_frame_neighbors, ...row.bridge_frame_neighbors].map((link) => link.target?.work_slug)]).filter(Boolean)).size,
    cluster_ids: new Set(rows.flatMap((row) => [row.cluster_id, ...[...row.same_frame_neighbors, ...row.bridge_frame_neighbors].map((link) => link.target?.cluster_id)]).filter(Boolean)).size,
    usage_frames: new Set(rows.flatMap((row) => [row.usage_frame_label, ...[...row.same_frame_neighbors, ...row.bridge_frame_neighbors].map((link) => link.target?.usage_frame_label)]).filter(Boolean)).size,
    route_ids: routeIds.size,
    unresolved_route_ids: unresolvedRouteIds.size,
    source_status_counts: statusCounts,
    target_status_counts: targetStatusCounts,
    crossmatch_strength_counts: strengthCounts,
    relationship_counts: sortObjectByKey(relationshipCounts),
    rows_with_source_link: rows.filter((row) => row.source_href && row.work_anchor_href).length,
    rows_with_hebrew_context: rows.filter((row) => hasHebrew(row.context_focus_marked)).length,
    rows_with_focus_marker: rows.filter((row) => hasFocusMarker(row.context_focus_marked)).length,
    rows_with_provenance: rows.filter((row) => hasProvenance(row)).length,
    neighbor_links_with_target_link: allNeighborLinks.filter((link) => link.target?.source_href && link.target?.work_anchor_href).length,
    neighbor_links_with_target_context: allNeighborLinks.filter((link) => hasHebrew(link.target?.context_focus_marked)).length,
    neighbor_links_with_focus_marker: allNeighborLinks.filter((link) => hasFocusMarker(link.target?.context_focus_marked)).length,
    neighbor_links_with_target_provenance: allNeighborLinks.filter((link) => hasProvenance(link.target || {})).length,
    observed_usage_only_rows: rows.filter((row) => row.usage_boundary?.observed_usage_only === true).length,
    reader_facing_rows: rows.filter((row) => row.usage_boundary?.reader_facing !== false).length,
    route_payload_field_hits: countExactKeys(rows, ['route_payload', 'route_payloads']),
    forbidden_authority_field_hits: countExactKeys(rows, forbiddenAuthorityKeys),
  };
}

function buildChecks(counts) {
  return [
    check('crossmatch_rows_present', counts.source_occurrence_rows > 0 && counts.neighbor_link_rows > 0 ? 'passed' : 'failed', `rows ${counts.source_occurrence_rows}; links ${counts.neighbor_link_rows}`),
    check('same_and_bridge_links_present', counts.same_frame_neighbor_links > 0 && counts.bridge_frame_neighbor_links > 0 ? 'passed' : 'failed', `same/bridge ${counts.same_frame_neighbor_links}/${counts.bridge_frame_neighbor_links}`),
    check('source_metadata_complete', counts.rows_with_source_link === counts.source_occurrence_rows && counts.rows_with_hebrew_context === counts.source_occurrence_rows && counts.rows_with_focus_marker === counts.source_occurrence_rows && counts.rows_with_provenance === counts.source_occurrence_rows ? 'passed' : 'failed', `source links/context/focus/provenance ${counts.rows_with_source_link}/${counts.rows_with_hebrew_context}/${counts.rows_with_focus_marker}/${counts.rows_with_provenance}`),
    check('target_metadata_complete', counts.neighbor_links_with_target_link === counts.neighbor_link_rows && counts.neighbor_links_with_target_context === counts.neighbor_link_rows && counts.neighbor_links_with_focus_marker === counts.neighbor_link_rows && counts.neighbor_links_with_target_provenance === counts.neighbor_link_rows ? 'passed' : 'failed', `target links/context/focus/provenance ${counts.neighbor_links_with_target_link}/${counts.neighbor_links_with_target_context}/${counts.neighbor_links_with_focus_marker}/${counts.neighbor_links_with_target_provenance}`),
    check('route_ids_resolved', counts.route_ids > 0 && counts.unresolved_route_ids === 0 ? 'passed' : 'failed', `route IDs ${counts.route_ids}; unresolved ${counts.unresolved_route_ids}`),
    check('usage_only_boundary', counts.observed_usage_only_rows === counts.source_occurrence_rows && counts.reader_facing_rows === 0 && counts.route_payload_field_hits === 0 && counts.forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `observed ${counts.observed_usage_only_rows}; reader-facing ${counts.reader_facing_rows}; payload ${counts.route_payload_field_hits}; forbidden ${counts.forbidden_authority_field_hits}`),
  ];
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Definition Workbench Usage Crossmatch Neighbors',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Source occurrence rows: ${artifact.counts.source_occurrence_rows}`,
    `- Neighbor links: ${artifact.counts.neighbor_link_rows}`,
    `- Same-frame / bridge-frame links: ${artifact.counts.same_frame_neighbor_links}/${artifact.counts.bridge_frame_neighbor_links}`,
    `- Source refs / target refs / works: ${artifact.counts.unique_source_refs}/${artifact.counts.unique_target_refs}/${artifact.counts.unique_works}`,
    `- Source supported/candidate/weak rows: ${artifact.counts.source_status_counts.supported}/${artifact.counts.source_status_counts.candidate}/${artifact.counts.source_status_counts.weak}`,
    `- Target supported/candidate/weak links: ${artifact.counts.target_status_counts.supported}/${artifact.counts.target_status_counts.candidate}/${artifact.counts.target_status_counts.weak}`,
    `- Crossmatch strong/moderate/weak links: ${artifact.counts.crossmatch_strength_counts.strong}/${artifact.counts.crossmatch_strength_counts.moderate}/${artifact.counts.crossmatch_strength_counts.weak}`,
    `- Route IDs / unresolved route IDs: ${artifact.counts.route_ids}/${artifact.counts.unresolved_route_ids}`,
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
    artifact.policy,
    '',
    'This packet is for Definition Workbench usage navigation only. It carries occurrence-to-occurrence links and route IDs, not definition payloads, answer selection, ranking decisions, accepted translations, or publication claims.',
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function hasHebrew(value) {
  return /[\u0590-\u05ff]/.test(String(value || ''));
}

function hasFocusMarker(value) {
  return /\[[^\]]*[\u0590-\u05ff][^\]]*\]/.test(String(value || ''));
}

function hasProvenance(row) {
  return Boolean(row.version_title && row.version_source && row.license && row.license_url);
}

function check(id, status, detail) {
  return { id, status, detail };
}

function sortObjectByKey(value) {
  return Object.fromEntries(Object.entries(value || {}).sort((a, b) => a[0].localeCompare(b[0])));
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
    else if (arg.startsWith('--adjacency-index=')) parsed.adjacencyIndex = cleanRelativePath(valueAfterEquals(arg));
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
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
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
