#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  selectedOccurrenceNavigationIndex: '.local-cache/workbench-evidence/usage-selected-occurrence-navigation-index.json',
  crossmatchLinks: '.local-cache/workbench-evidence/usage-crossmatch-links.json',
  output: '.local-cache/workbench-evidence/usage-selected-navigation-edge-index.json',
  report: 'reports/workbench-usage-selected-navigation-edge-index.md',
  maxReportSamples: 40,
};

const options = parseArgs(process.argv.slice(2));
const navigationIndex = readJson(options.selectedOccurrenceNavigationIndex);
const crossmatchLinks = readJson(options.crossmatchLinks);
if (navigationIndex.artifact_type !== 'workbench_usage_selected_occurrence_navigation_index') {
  throw new Error(`${options.selectedOccurrenceNavigationIndex} is not a selected occurrence navigation index`);
}
if (crossmatchLinks.artifact_type !== 'workbench_usage_navigation_crossmatch_links') {
  throw new Error(`${options.crossmatchLinks} is not a crossmatch links artifact`);
}

const rowsByOccurrenceId = new Map((navigationIndex.navigation_rows || []).map((row) => [row.occurrence_id, row]));
const edgeRows = (crossmatchLinks.edges || []).map(buildEdgeRow).sort(compareEdges);
const checks = buildChecks(edgeRows);
const failed = checks.filter((checkRow) => checkRow.status === 'failed');
const warnings = checks.filter((checkRow) => checkRow.status === 'warning');
const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_selected_navigation_edge_index',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_selected_navigation_edge_index.mjs',
  policy: 'All directed selected occurrence crossmatch edges enriched with source and target navigation context. This is an observed usage navigation artifact only; it does not rank routes, select visible answers, translate, copy route payloads, or assert authority.',
  inputs: {
    selected_occurrence_navigation_index: options.selectedOccurrenceNavigationIndex,
    crossmatch_links: options.crossmatchLinks,
  },
  authority_policy: {
    usage_navigation_only: true,
    observed_usage_only: true,
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
  counts: buildCounts(edgeRows),
  checks,
  edge_rows: edgeRows,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Selected navigation edge rows ${artifact.counts.edges}; same-frame ${artifact.counts.same_frame_edges}; bridge ${artifact.counts.bridge_edges}; route payload hits ${artifact.counts.route_payload_field_hits}`);

function buildEdgeRow(edge) {
  const source = rowsByOccurrenceId.get(edge.source_occurrence_id);
  const target = rowsByOccurrenceId.get(edge.target_occurrence_id);
  const linkKind = (edge.relationships || []).includes('same_cluster') ? 'same_frame' : 'bridge_frame';
  return {
    edge_id: edge.edge_id,
    source_occurrence_id: edge.source_occurrence_id,
    target_occurrence_id: edge.target_occurrence_id,
    link_kind: linkKind,
    crossmatch_score: edge.crossmatch_score,
    crossmatch_strength: edge.crossmatch_strength,
    relationships: edge.relationships || [],
    shared_route_ids: edge.shared_route_ids || [],
    shared_slice_ids: edge.shared_slice_ids || [],
    source: edgeEndpoint(source),
    target: edgeEndpoint(target),
    navigation_flags: {
      observed_usage_only: true,
      reader_facing: false,
      has_source_row: Boolean(source),
      has_target_row: Boolean(target),
      has_source_context: hasHebrew(source?.context_focus_marked),
      has_target_context: hasHebrew(target?.context_focus_marked),
      has_source_link: Boolean(source?.source_href && source?.work_anchor_href),
      has_target_link: Boolean(target?.source_href && target?.work_anchor_href),
      has_source_provenance: Boolean(source?.provenance_id),
      has_target_provenance: Boolean(target?.provenance_id),
      has_shared_route_ids: Array.isArray(edge.shared_route_ids) && edge.shared_route_ids.length > 0,
    },
  };
}

function edgeEndpoint(row) {
  if (!row) return null;
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
  const sourceIds = new Set();
  const targetIds = new Set();
  const sourceRefs = new Set();
  const workAnchors = new Set();
  const works = new Set();
  const frames = new Set();
  const routeIds = new Set();
  const provenanceIds = new Set();
  const relationCounts = {};
  const strengthCounts = {};
  let sameFrameEdges = 0;
  let bridgeEdges = 0;
  let rowsWithSourceContext = 0;
  let rowsWithTargetContext = 0;
  let rowsWithSourceLink = 0;
  let rowsWithTargetLink = 0;
  let rowsWithSourceProvenance = 0;
  let rowsWithTargetProvenance = 0;
  let readerFacingRows = 0;
  let routePayloadFieldHits = 0;
  for (const row of rows) {
    sourceIds.add(row.source_occurrence_id);
    targetIds.add(row.target_occurrence_id);
    if (row.link_kind === 'same_frame') sameFrameEdges += 1;
    if (row.link_kind === 'bridge_frame') bridgeEdges += 1;
    strengthCounts[row.crossmatch_strength] = (strengthCounts[row.crossmatch_strength] || 0) + 1;
    for (const relationship of row.relationships || []) {
      relationCounts[relationship] = (relationCounts[relationship] || 0) + 1;
    }
    for (const routeId of row.shared_route_ids || []) routeIds.add(routeId);
    for (const endpoint of [row.source, row.target]) {
      if (!endpoint) continue;
      sourceRefs.add(endpoint.source_ref);
      workAnchors.add(endpoint.work_anchor_href);
      works.add(endpoint.work_slug || endpoint.work_title);
      frames.add(endpoint.usage_frame_label);
      if (endpoint.provenance_id) provenanceIds.add(endpoint.provenance_id);
    }
    if (row.navigation_flags?.has_source_context) rowsWithSourceContext += 1;
    if (row.navigation_flags?.has_target_context) rowsWithTargetContext += 1;
    if (row.navigation_flags?.has_source_link) rowsWithSourceLink += 1;
    if (row.navigation_flags?.has_target_link) rowsWithTargetLink += 1;
    if (row.navigation_flags?.has_source_provenance) rowsWithSourceProvenance += 1;
    if (row.navigation_flags?.has_target_provenance) rowsWithTargetProvenance += 1;
    if (row.navigation_flags?.reader_facing !== false) readerFacingRows += 1;
    routePayloadFieldHits += countForbiddenKeys(row);
  }
  return {
    edges: rows.length,
    unique_source_occurrences: sourceIds.size,
    unique_target_occurrences: targetIds.size,
    unique_source_refs: sourceRefs.size,
    unique_work_anchors: workAnchors.size,
    unique_works: works.size,
    usage_frames: frames.size,
    unique_route_ids: routeIds.size,
    provenance_buckets: provenanceIds.size,
    same_frame_edges: sameFrameEdges,
    bridge_edges: bridgeEdges,
    relation_counts: relationCounts,
    strength_counts: strengthCounts,
    rows_with_source_context: rowsWithSourceContext,
    rows_with_target_context: rowsWithTargetContext,
    rows_with_source_link: rowsWithSourceLink,
    rows_with_target_link: rowsWithTargetLink,
    rows_with_source_provenance: rowsWithSourceProvenance,
    rows_with_target_provenance: rowsWithTargetProvenance,
    observed_usage_only_rows: rows.length,
    reader_facing_rows: readerFacingRows,
    route_payload_field_hits: routePayloadFieldHits,
  };
}

function buildChecks(rows) {
  const counts = buildCounts(rows);
  return [
    check('edge_rows_complete', counts.edges === Number(crossmatchLinks.counts?.directed_edges || 0) ? 'passed' : 'failed', `edge rows ${counts.edges}; crossmatch directed ${crossmatchLinks.counts?.directed_edges}`),
    check('occurrence_coverage_complete', counts.unique_source_occurrences === Number(navigationIndex.counts?.rows || 0) && counts.unique_target_occurrences === Number(navigationIndex.counts?.rows || 0) ? 'passed' : 'failed', `source occurrences ${counts.unique_source_occurrences}; target occurrences ${counts.unique_target_occurrences}; navigation rows ${navigationIndex.counts?.rows}`),
    check('same_frame_edges_match', counts.same_frame_edges === Number(crossmatchLinks.counts?.relation_counts?.same_cluster || 0) ? 'passed' : 'failed', `same-frame ${counts.same_frame_edges}; same_cluster relation ${crossmatchLinks.counts?.relation_counts?.same_cluster}`),
    check('edge_partition_complete', counts.same_frame_edges + counts.bridge_edges === counts.edges ? 'passed' : 'failed', `same-frame ${counts.same_frame_edges}; bridge ${counts.bridge_edges}; edges ${counts.edges}`),
    check('source_context_complete', counts.rows_with_source_context === counts.edges ? 'passed' : 'failed', `source context ${counts.rows_with_source_context}; edges ${counts.edges}`),
    check('target_context_complete', counts.rows_with_target_context === counts.edges ? 'passed' : 'failed', `target context ${counts.rows_with_target_context}; edges ${counts.edges}`),
    check('source_links_complete', counts.rows_with_source_link === counts.edges ? 'passed' : 'failed', `source links ${counts.rows_with_source_link}; edges ${counts.edges}`),
    check('target_links_complete', counts.rows_with_target_link === counts.edges ? 'passed' : 'failed', `target links ${counts.rows_with_target_link}; edges ${counts.edges}`),
    check('provenance_complete', counts.rows_with_source_provenance === counts.edges && counts.rows_with_target_provenance === counts.edges ? 'passed' : 'failed', `source provenance ${counts.rows_with_source_provenance}; target provenance ${counts.rows_with_target_provenance}; edges ${counts.edges}`),
    check('route_ids_present', counts.unique_route_ids > 0 ? 'passed' : 'failed', `route IDs ${counts.unique_route_ids}`),
    check('reader_facing_zero', counts.reader_facing_rows === 0 ? 'passed' : 'failed', `reader-facing rows ${counts.reader_facing_rows}`),
    check('route_payload_absent', counts.route_payload_field_hits === 0 ? 'passed' : 'failed', `route payload-like field hits ${counts.route_payload_field_hits}`),
  ];
}

function writeReport(relativePath, artifact) {
  const sampleRows = artifact.edge_rows.slice(0, Number(options.maxReportSamples || 0));
  const lines = [
    '# Workbench Usage Selected Navigation Edge Index',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Edges: ${artifact.counts.edges}`,
    `- Source occurrences: ${artifact.counts.unique_source_occurrences}`,
    `- Target occurrences: ${artifact.counts.unique_target_occurrences}`,
    `- Source refs: ${artifact.counts.unique_source_refs}`,
    `- Works: ${artifact.counts.unique_works}`,
    `- Usage frames: ${artifact.counts.usage_frames}`,
    `- Route IDs: ${artifact.counts.unique_route_ids}`,
    `- Provenance buckets: ${artifact.counts.provenance_buckets}`,
    `- Same-frame edges: ${artifact.counts.same_frame_edges}`,
    `- Bridge-frame edges: ${artifact.counts.bridge_edges}`,
    `- Strong edges: ${artifact.counts.strength_counts.strong || 0}`,
    `- Moderate edges: ${artifact.counts.strength_counts.moderate || 0}`,
    `- Rows with source context: ${artifact.counts.rows_with_source_context}`,
    `- Rows with target context: ${artifact.counts.rows_with_target_context}`,
    `- Rows with source links: ${artifact.counts.rows_with_source_link}`,
    `- Rows with target links: ${artifact.counts.rows_with_target_link}`,
    `- Rows with source provenance: ${artifact.counts.rows_with_source_provenance}`,
    `- Rows with target provenance: ${artifact.counts.rows_with_target_provenance}`,
    `- Reader-facing rows: ${artifact.counts.reader_facing_rows}`,
    `- Route payload-like field hits: ${artifact.counts.route_payload_field_hits}`,
    '',
    '## Policy',
    '',
    'This edge index is an all-to-all selected occurrence navigation layer. It enriches crossmatch edges with source and target links, Hebrew context, raw status/score, route IDs, and provenance metadata without ranking, translating, or asserting meaning.',
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${[checkRow.id, checkRow.status, checkRow.detail].map(mdCell).join(' | ')} |`),
    '',
    '## Edge Samples',
    '',
    '| edge | kind | score | strength | source | target | shared routes | relationships |',
    '|---|---|---:|---|---|---|---|---|',
    ...sampleRows.map((row) => `| ${[
      row.edge_id,
      row.link_kind,
      row.crossmatch_score,
      row.crossmatch_strength,
      mdLink(row.source?.source_ref, row.source?.source_href),
      mdLink(row.target?.source_ref, row.target?.source_href),
      row.shared_route_ids.join('<br>'),
      row.relationships.join('<br>'),
    ].map(mdCell).join(' | ')} |`),
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function compareEdges(a, b) {
  return String(a.link_kind || '').localeCompare(String(b.link_kind || ''))
    || Number(b.crossmatch_score || 0) - Number(a.crossmatch_score || 0)
    || String(a.source?.source_ref || '').localeCompare(String(b.source?.source_ref || ''), undefined, { numeric: true })
    || String(a.target?.source_ref || '').localeCompare(String(b.target?.source_ref || ''), undefined, { numeric: true })
    || String(a.edge_id || '').localeCompare(String(b.edge_id || ''));
}

function check(id, status, detail) {
  return { id, status, detail };
}

function hasHebrew(value) {
  return /[\u0590-\u05ff]/.test(String(value || ''));
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
    if (arg.startsWith('--selected-occurrence-navigation-index=')) parsed.selectedOccurrenceNavigationIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--crossmatch-links=')) parsed.crossmatchLinks = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--max-report-samples=')) parsed.maxReportSamples = Number(valueAfterEquals(arg));
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

function mdLink(label, href) {
  return href ? `[${String(label || '').replace(/\]/g, '\\]')}](${href})` : '';
}
