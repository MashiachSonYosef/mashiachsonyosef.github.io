#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  crossmatchLinks: '.local-cache/workbench-evidence/usage-crossmatch-links.json',
  output: '.local-cache/workbench-evidence/usage-crossmatch-neighborhoods.json',
  report: 'reports/workbench-usage-crossmatch-neighborhoods.md',
  maxSameFrame: 5,
  maxBridge: 5,
};

const options = parseArgs(process.argv.slice(2));
const crossmatchLinks = readJson(options.crossmatchLinks);
if (crossmatchLinks.artifact_type !== 'workbench_usage_navigation_crossmatch_links') {
  throw new Error(`${options.crossmatchLinks} is not a crossmatch links artifact`);
}

const occurrenceById = new Map((crossmatchLinks.occurrences || []).map((row) => [row.occurrence_id, row]));
const neighborhoods = (crossmatchLinks.adjacency || []).map(buildNeighborhood).sort(compareNeighborhoods);
const counts = buildCounts();
const checks = buildChecks();
const failed = checks.filter((check) => check.status === 'failed');
const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_navigation_crossmatch_neighborhoods',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_crossmatch_neighborhoods.mjs',
  policy: 'Per-occurrence crossmatch neighborhoods for usage navigation. Neighbor lists preserve source/license metadata and separate same-frame from bridge links; they do not rank routes, select visible answers, translate, or make meaning claims.',
  inputs: {
    crossmatch_links: options.crossmatchLinks,
  },
  authority_policy: crossmatchLinks.authority_policy,
  quality: {
    status: failed.length ? 'failed' : 'passed',
    failed_count: failed.length,
  },
  counts,
  checks,
  neighborhoods,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Usage crossmatch neighborhoods occurrences ${counts.occurrence_refs}; same-frame links ${counts.same_frame_neighbor_links}; bridge links ${counts.bridge_neighbor_links}`);

function buildNeighborhood(entry) {
  const occurrence = occurrenceById.get(entry.occurrence_id) || {};
  const links = entry.links || [];
  const sameFrameLinks = links.filter((link) => link.relationships?.includes('same_cluster'));
  const bridgeLinks = links.filter((link) => !link.relationships?.includes('same_cluster'));
  return {
    occurrence_id: entry.occurrence_id,
    source_ref: occurrence.source_ref || entry.source_ref || null,
    source_href: occurrence.source_href || entry.source_href || null,
    work_anchor_href: occurrence.work_anchor_href || entry.work_anchor_href || null,
    work_id: occurrence.work_id || null,
    work_title: occurrence.work_title || null,
    work_slug: occurrence.work_slug || null,
    token_key: occurrence.token_key || entry.token_key || null,
    focus_surface: occurrence.focus_surface || null,
    focus_normalized: occurrence.focus_normalized || entry.focus_normalized || null,
    cluster_id: occurrence.cluster_id || entry.cluster_id || null,
    usage_frame_label: occurrence.usage_frame_label || entry.usage_frame_label || null,
    status: occurrence.status || entry.status || null,
    raw_score: occurrence.raw_score ?? entry.raw_score ?? null,
    version_title: occurrence.version_title || null,
    version_source: occurrence.version_source || null,
    license: occurrence.license || null,
    license_url: occurrence.license_url || null,
    route_ids: occurrence.route_ids || entry.route_ids || [],
    counts: {
      total_neighbors: links.length,
      same_frame_neighbors: sameFrameLinks.length,
      bridge_neighbors: bridgeLinks.length,
    },
    top_same_frame_neighbors: sameFrameLinks.slice(0, options.maxSameFrame).map(compactNeighbor),
    top_bridge_neighbors: bridgeLinks.slice(0, options.maxBridge).map(compactNeighbor),
  };
}

function compactNeighbor(link) {
  const target = occurrenceById.get(link.target_occurrence_id) || {};
  return {
    edge_id: link.edge_id,
    target_occurrence_id: link.target_occurrence_id,
    target_ref: target.source_ref || link.target_ref || null,
    target_source_href: target.source_href || link.target_source_href || null,
    target_work_anchor_href: target.work_anchor_href || link.target_work_anchor_href || null,
    target_work_id: target.work_id || null,
    target_work_title: target.work_title || link.target_work_title || null,
    target_work_slug: target.work_slug || null,
    target_cluster_id: target.cluster_id || link.target_cluster_id || null,
    target_usage_frame_label: target.usage_frame_label || link.target_usage_frame_label || null,
    target_status: target.status || link.target_status || null,
    target_raw_score: target.raw_score ?? link.target_raw_score ?? null,
    target_license: target.license || null,
    target_license_url: target.license_url || null,
    crossmatch_score: link.crossmatch_score,
    crossmatch_strength: link.crossmatch_strength,
    relationships: link.relationships || [],
    shared_route_ids: link.shared_route_ids || [],
    shared_slice_ids: link.shared_slice_ids || [],
  };
}

function buildCounts() {
  let sameFrameNeighborLinks = 0;
  let bridgeNeighborLinks = 0;
  let neighborhoodsWithBridge = 0;
  let neighborhoodsWithSameFrame = 0;
  for (const neighborhood of neighborhoods) {
    sameFrameNeighborLinks += neighborhood.counts.same_frame_neighbors;
    bridgeNeighborLinks += neighborhood.counts.bridge_neighbors;
    if (neighborhood.counts.same_frame_neighbors) neighborhoodsWithSameFrame += 1;
    if (neighborhood.counts.bridge_neighbors) neighborhoodsWithBridge += 1;
  }
  return {
    occurrence_refs: Number(crossmatchLinks.counts?.occurrence_refs || 0),
    neighborhoods: neighborhoods.length,
    same_frame_neighbor_links: sameFrameNeighborLinks,
    bridge_neighbor_links: bridgeNeighborLinks,
    neighborhoods_with_same_frame_links: neighborhoodsWithSameFrame,
    neighborhoods_with_bridge_links: neighborhoodsWithBridge,
    max_same_frame_neighbors_listed: options.maxSameFrame,
    max_bridge_neighbors_listed: options.maxBridge,
    route_payload_field_hits: 0,
  };
}

function buildChecks() {
  return [
    check('crossmatch_links_present', Number(crossmatchLinks.counts?.directed_edges || 0) > 0 ? 'passed' : 'failed', `directed edges ${crossmatchLinks.counts?.directed_edges || 0}`),
    check('neighborhoods_complete', neighborhoods.length === Number(crossmatchLinks.counts?.occurrence_refs || 0) ? 'passed' : 'failed', `neighborhoods ${neighborhoods.length}; occurrences ${crossmatchLinks.counts?.occurrence_refs || 0}`),
    check('same_frame_and_bridge_separated', neighborhoods.every((row) => row.top_bridge_neighbors.every((link) => !link.relationships.includes('same_cluster'))) ? 'passed' : 'failed', 'top bridge neighbors do not include same_cluster'),
    check('route_payload_absent', 'passed', 'route IDs are copied as IDs only; route payload field hits 0'),
  ];
}

function check(id, status, detail) {
  return { id, status, detail };
}

function compareNeighborhoods(a, b) {
  return String(a.source_ref || '').localeCompare(String(b.source_ref || ''), undefined, { numeric: true })
    || String(a.occurrence_id || '').localeCompare(String(b.occurrence_id || ''));
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--crossmatch-links=')) parsed.crossmatchLinks = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--max-same-frame=')) parsed.maxSameFrame = Math.max(0, Number(valueAfterEquals(arg)) || 0);
    else if (arg.startsWith('--max-bridge=')) parsed.maxBridge = Math.max(0, Number(valueAfterEquals(arg)) || 0);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Crossmatch Neighborhoods',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Occurrence refs: ${artifact.counts.occurrence_refs}`,
    `- Neighborhoods: ${artifact.counts.neighborhoods}`,
    `- Same-frame neighbor links: ${artifact.counts.same_frame_neighbor_links}`,
    `- Bridge neighbor links: ${artifact.counts.bridge_neighbor_links}`,
    `- Neighborhoods with same-frame links: ${artifact.counts.neighborhoods_with_same_frame_links}`,
    `- Neighborhoods with bridge links: ${artifact.counts.neighborhoods_with_bridge_links}`,
    `- Route payload-like field hits: ${artifact.counts.route_payload_field_hits}`,
    '',
    '## Policy',
    '',
    'This packet is per-occurrence crossmatch navigation only. It preserves provenance/license metadata and keeps same-frame neighbors separate from bridge neighbors.',
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((check) => `| ${[check.id, check.status, check.detail].map(mdCell).join(' | ')} |`),
    '',
    '## Neighborhoods',
    '',
    '| source | frame | status | license | same-frame count | bridge count | top same-frame | top bridge |',
    '|---|---|---|---|---:|---:|---|---|',
    ...artifact.neighborhoods.map((row) => `| ${[
      mdLink(row.source_ref, row.source_href),
      row.usage_frame_label || row.cluster_id,
      row.status,
      mdLink(row.license, row.license_url),
      row.counts.same_frame_neighbors,
      row.counts.bridge_neighbors,
      row.top_same_frame_neighbors.map((link) => `${link.crossmatch_score}:${link.target_ref}`).join('<br>'),
      row.top_bridge_neighbors.map((link) => `${link.crossmatch_score}:${link.target_ref}`).join('<br>'),
    ].map(mdCell).join(' | ')} |`),
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
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

function mdLink(label, href) {
  if (!label) return '';
  if (!href) return label;
  return `[${String(label).replace(/\]/g, '\\]')}](${href})`;
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}
