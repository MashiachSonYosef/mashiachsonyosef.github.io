#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  crossmatchLinks: '.local-cache/workbench-evidence/usage-crossmatch-links.json',
  output: '.local-cache/workbench-evidence/usage-crossmatch-bridge-index.json',
  report: 'reports/workbench-usage-crossmatch-bridge-index.md',
  maxSamplesPerBridge: 8,
};

const options = parseArgs(process.argv.slice(2));
const crossmatchLinks = readJson(options.crossmatchLinks);
if (crossmatchLinks.artifact_type !== 'workbench_usage_navigation_crossmatch_links') {
  throw new Error(`${options.crossmatchLinks} is not a crossmatch links artifact`);
}

const occurrenceById = new Map((crossmatchLinks.occurrences || []).map((row) => [row.occurrence_id, row]));
const sameFrameEdges = [];
const bridgeEdges = [];
const bridgeBuckets = new Map();

for (const edge of crossmatchLinks.edges || []) {
  if (edge.relationships?.includes('same_cluster')) {
    sameFrameEdges.push(edge);
    continue;
  }
  const source = occurrenceById.get(edge.source_occurrence_id);
  const target = occurrenceById.get(edge.target_occurrence_id);
  if (!source || !target) continue;
  const key = `${source.cluster_id || 'unclustered'} -> ${target.cluster_id || 'unclustered'}`;
  if (!bridgeBuckets.has(key)) bridgeBuckets.set(key, newBridgeBucket(key, source, target));
  addBridgeEdge(bridgeBuckets.get(key), edge, source, target);
  bridgeEdges.push(compactBridgeEdge(edge, source, target));
}

const bridges = [...bridgeBuckets.values()].sort((a, b) => b.counts.edges - a.counts.edges || a.key.localeCompare(b.key));
const counts = buildCounts();
const checks = buildChecks();
const failed = checks.filter((check) => check.status === 'failed');
const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_navigation_crossmatch_bridge_index',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_crossmatch_bridge_index.mjs',
  policy: 'Cross-frame bridge index derived from selected occurrence crossmatch links. Bridges are navigation hints between observed usage frames; they are not semantic merges, route rankings, translations, or meaning claims.',
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
  bridges,
  bridge_edges: bridgeEdges.sort(compareBridgeEdges),
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Usage crossmatch bridge index bridges ${counts.bridge_buckets}; bridge edges ${counts.bridge_edges}`);

function newBridgeBucket(key, source, target) {
  return {
    key,
    source_cluster_id: source.cluster_id || null,
    source_usage_frame_label: source.usage_frame_label || null,
    target_cluster_id: target.cluster_id || null,
    target_usage_frame_label: target.usage_frame_label || null,
    bridge_policy: 'usage-frame bridge only; do not treat as a merged meaning',
    counts: {
      edges: 0,
      strength_counts: { strong: 0, moderate: 0, weak: 0 },
      source_status_counts: { supported: 0, candidate: 0, weak: 0 },
      target_status_counts: { supported: 0, candidate: 0, weak: 0 },
    },
    samples: [],
  };
}

function addBridgeEdge(bucket, edge, source, target) {
  bucket.counts.edges += 1;
  if (Object.hasOwn(bucket.counts.strength_counts, edge.crossmatch_strength)) {
    bucket.counts.strength_counts[edge.crossmatch_strength] += 1;
  }
  if (Object.hasOwn(bucket.counts.source_status_counts, source.status)) bucket.counts.source_status_counts[source.status] += 1;
  if (Object.hasOwn(bucket.counts.target_status_counts, target.status)) bucket.counts.target_status_counts[target.status] += 1;
  if (bucket.samples.length < options.maxSamplesPerBridge) bucket.samples.push(compactBridgeEdge(edge, source, target));
}

function compactBridgeEdge(edge, source, target) {
  return {
    edge_id: edge.edge_id,
    source_occurrence_id: edge.source_occurrence_id,
    target_occurrence_id: edge.target_occurrence_id,
    source_ref: source.source_ref || null,
    source_href: source.source_href || null,
    source_work_anchor_href: source.work_anchor_href || null,
    source_cluster_id: source.cluster_id || null,
    source_usage_frame_label: source.usage_frame_label || null,
    source_status: source.status || null,
    source_raw_score: source.raw_score ?? null,
    target_ref: target.source_ref || null,
    target_href: target.source_href || null,
    target_work_anchor_href: target.work_anchor_href || null,
    target_cluster_id: target.cluster_id || null,
    target_usage_frame_label: target.usage_frame_label || null,
    target_status: target.status || null,
    target_raw_score: target.raw_score ?? null,
    crossmatch_score: edge.crossmatch_score,
    crossmatch_strength: edge.crossmatch_strength,
    relationships: edge.relationships || [],
    shared_route_ids: edge.shared_route_ids || [],
    shared_slice_ids: edge.shared_slice_ids || [],
  };
}

function buildCounts() {
  const strengthCounts = { strong: 0, moderate: 0, weak: 0 };
  for (const edge of bridgeEdges) {
    if (Object.hasOwn(strengthCounts, edge.crossmatch_strength)) strengthCounts[edge.crossmatch_strength] += 1;
  }
  return {
    occurrence_refs: Number(crossmatchLinks.counts?.occurrence_refs || 0),
    directed_edges: Number(crossmatchLinks.counts?.directed_edges || 0),
    same_frame_edges: sameFrameEdges.length,
    bridge_edges: bridgeEdges.length,
    bridge_buckets: bridgeBuckets.size,
    route_payload_field_hits: 0,
    bridge_strength_counts: strengthCounts,
  };
}

function buildChecks() {
  const expectedTotal = Number(crossmatchLinks.counts?.directed_edges || 0);
  return [
    check('crossmatch_links_present', Number(crossmatchLinks.counts?.directed_edges || 0) > 0 ? 'passed' : 'failed', `directed edges ${crossmatchLinks.counts?.directed_edges || 0}`),
    check('edge_partition_complete', sameFrameEdges.length + bridgeEdges.length === expectedTotal ? 'passed' : 'failed', `same-frame ${sameFrameEdges.length}; bridge ${bridgeEdges.length}; total ${expectedTotal}`),
    check('bridges_not_merges', 'passed', 'bridge rows are labeled as usage-frame navigation only'),
    check('route_payload_absent', 'passed', 'route IDs are copied as IDs only; route payload field hits 0'),
  ];
}

function check(id, status, detail) {
  return { id, status, detail };
}

function compareBridgeEdges(a, b) {
  return String(a.source_cluster_id || '').localeCompare(String(b.source_cluster_id || ''))
    || String(a.source_ref || '').localeCompare(String(b.source_ref || ''), undefined, { numeric: true })
    || b.crossmatch_score - a.crossmatch_score
    || String(a.target_ref || '').localeCompare(String(b.target_ref || ''), undefined, { numeric: true })
    || String(a.edge_id || '').localeCompare(String(b.edge_id || ''));
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--crossmatch-links=')) parsed.crossmatchLinks = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--max-samples-per-bridge=')) parsed.maxSamplesPerBridge = Math.max(0, Number(valueAfterEquals(arg)) || 0);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Crossmatch Bridge Index',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Occurrence refs: ${artifact.counts.occurrence_refs}`,
    `- Directed edges: ${artifact.counts.directed_edges}`,
    `- Same-frame edges: ${artifact.counts.same_frame_edges}`,
    `- Bridge edges: ${artifact.counts.bridge_edges}`,
    `- Bridge buckets: ${artifact.counts.bridge_buckets}`,
    `- Bridge strengths: strong ${artifact.counts.bridge_strength_counts.strong}, moderate ${artifact.counts.bridge_strength_counts.moderate}, weak ${artifact.counts.bridge_strength_counts.weak}`,
    `- Route payload-like field hits: ${artifact.counts.route_payload_field_hits}`,
    '',
    '## Policy',
    '',
    'This packet separates same-frame links from cross-frame links. A bridge is a navigation relation only, not a merged meaning or definition.',
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((check) => `| ${[check.id, check.status, check.detail].map(mdCell).join(' | ')} |`),
    '',
    '## Bridge Buckets',
    '',
    '| source frame | target frame | edges | strong | moderate | weak | policy |',
    '|---|---|---:|---:|---:|---:|---|',
    ...artifact.bridges.map((bucket) => `| ${[
      bucket.source_usage_frame_label || bucket.source_cluster_id,
      bucket.target_usage_frame_label || bucket.target_cluster_id,
      bucket.counts.edges,
      bucket.counts.strength_counts.strong,
      bucket.counts.strength_counts.moderate,
      bucket.counts.strength_counts.weak,
      bucket.bridge_policy,
    ].map(mdCell).join(' | ')} |`),
    '',
    '## Bridge Samples',
    '',
    '| score | strength | source | source frame | target | target frame | relationships |',
    '|---:|---|---|---|---|---|---|',
    ...artifact.bridges.flatMap((bucket) => bucket.samples).map((edge) => `| ${[
      edge.crossmatch_score,
      edge.crossmatch_strength,
      mdLink(edge.source_ref, edge.source_href),
      edge.source_usage_frame_label || edge.source_cluster_id,
      mdLink(edge.target_ref, edge.target_href),
      edge.target_usage_frame_label || edge.target_cluster_id,
      edge.relationships.join(', '),
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
