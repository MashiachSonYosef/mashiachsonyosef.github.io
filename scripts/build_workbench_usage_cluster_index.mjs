#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  concordance: 'data/workbench-evidence/usage-concordance.json',
  output: '.local-cache/workbench-evidence/usage-cluster-index.json',
  report: 'reports/workbench-usage-cluster-index.md',
  maxSamples: 8,
};

const options = parseArgs(process.argv.slice(2));
const concordance = readJson(options.concordance);
if (concordance.artifact_type !== 'workbench_usage_navigation_concordance') {
  throw new Error(`${options.concordance} is not a usage concordance artifact`);
}

const clusters = new Map();
for (const row of concordance.rows || []) {
  const clusterId = String(row.ids?.cluster_id || row.usage_frame?.cluster_id || 'unclustered');
  if (!clusters.has(clusterId)) clusters.set(clusterId, createCluster(clusterId, row));
  addRowToCluster(clusters.get(clusterId), row);
}

const clusterList = [...clusters.values()].map(finalizeCluster).sort((a, b) => (
  b.counts.rows - a.counts.rows
  || a.cluster_id.localeCompare(b.cluster_id)
));

const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_navigation_cluster_index',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_cluster_index.mjs',
  policy: 'Cluster index for usage-navigation rows. It summarizes observed usage frames and clickable sample occurrences only; it does not rank routes, select visible answers, or make meaning claims.',
  inputs: {
    concordance: options.concordance,
  },
  reader_facing_policy: concordance.reader_facing_policy,
  counts: {
    rows: Number(concordance.counts?.rows || 0),
    clusters: clusterList.length,
    status_counts: concordance.counts?.status_counts || {},
    route_link_state_counts: concordance.counts?.route_link_state_counts || {},
    audit_only_counts: concordance.counts?.audit_only_counts || {},
  },
  clusters: clusterList,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Usage cluster index clusters ${artifact.counts.clusters}; rows ${artifact.counts.rows}`);

function createCluster(clusterId, row) {
  return {
    cluster_id: clusterId,
    frame_label: row.usage_frame?.frame_label || '',
    counts: {
      rows: 0,
      status_counts: { supported: 0, candidate: 0, weak: 0 },
      route_link_state_counts: {
        route_linked_observed_usage: 0,
        observed_usage_only: 0,
      },
    },
    score: {
      min: null,
      max: null,
      average: null,
      total: 0,
    },
    related_agent2_route_ids: new Set(),
    source_refs: new Set(),
    work_slugs: new Set(),
    samples: [],
  };
}

function addRowToCluster(cluster, row) {
  cluster.counts.rows += 1;
  const status = row.status?.candidate_status;
  if (Object.hasOwn(cluster.counts.status_counts, status)) cluster.counts.status_counts[status] += 1;
  const routeState = row.route_link_state;
  if (Object.hasOwn(cluster.counts.route_link_state_counts, routeState)) cluster.counts.route_link_state_counts[routeState] += 1;

  const rawScore = Number(row.status?.raw_score);
  if (Number.isFinite(rawScore)) {
    cluster.score.min = cluster.score.min === null ? rawScore : Math.min(cluster.score.min, rawScore);
    cluster.score.max = cluster.score.max === null ? rawScore : Math.max(cluster.score.max, rawScore);
    cluster.score.total += rawScore;
  }

  for (const routeId of row.agent2_route_ids || []) cluster.related_agent2_route_ids.add(routeId);
  if (row.source?.source_ref) cluster.source_refs.add(row.source.source_ref);
  if (row.occurrence_links?.work_anchor?.work_slug) cluster.work_slugs.add(row.occurrence_links.work_anchor.work_slug);
  if (cluster.samples.length < options.maxSamples) cluster.samples.push(compactSample(row));
}

function finalizeCluster(cluster) {
  const rows = cluster.counts.rows || 1;
  return {
    cluster_id: cluster.cluster_id,
    frame_label: cluster.frame_label,
    counts: cluster.counts,
    score: {
      min: cluster.score.min,
      max: cluster.score.max,
      average: Number((cluster.score.total / rows).toFixed(2)),
    },
    related_agent2_route_ids: [...cluster.related_agent2_route_ids].sort(),
    unique_source_refs: cluster.source_refs.size,
    unique_work_slugs: cluster.work_slugs.size,
    samples: cluster.samples,
  };
}

function compactSample(row) {
  return {
    occurrence_id: row.ids?.occurrence_id || null,
    candidate_id: row.ids?.candidate_id || null,
    token_surface: row.token?.token_surface || null,
    token_normalized: row.token?.token_normalized || null,
    status: row.status?.candidate_status || null,
    raw_score: row.status?.raw_score ?? null,
    source_ref: row.source?.source_ref || null,
    source_href: row.occurrence_links?.source_ref?.href || null,
    work_anchor_href: row.occurrence_links?.work_anchor?.href || null,
    route_ids: row.agent2_route_ids || [],
    phrase_hebrew: row.phrase?.phrase_hebrew || '',
  };
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Cluster Index',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Rows: ${artifact.counts.rows}`,
    `- Clusters: ${artifact.counts.clusters}`,
    `- Status counts: supported ${artifact.counts.status_counts.supported}, candidate ${artifact.counts.status_counts.candidate}, weak ${artifact.counts.status_counts.weak}`,
    `- Route link states: route-linked ${artifact.counts.route_link_state_counts.route_linked_observed_usage}, observed-only ${artifact.counts.route_link_state_counts.observed_usage_only}`,
    `- Audit-only rows: ambiguous ${artifact.counts.audit_only_counts.ambiguous}, blocked ${artifact.counts.audit_only_counts.blocked}`,
    '',
    '## Policy',
    '',
    'This is a usage-navigation cluster index. Cluster labels are observed usage-frame labels from the selected rows; this report does not rank routes, select visible answers, or make meaning claims.',
    '',
    '## Clusters',
    '',
    '| cluster | frame | rows | supported | candidate | weak | score min | score max | score avg | route ids | sample refs |',
    '|---|---|---:|---:|---:|---:|---:|---:|---:|---|---|',
    ...artifact.clusters.map((cluster) => [
      cluster.cluster_id,
      cluster.frame_label,
      cluster.counts.rows,
      cluster.counts.status_counts.supported,
      cluster.counts.status_counts.candidate,
      cluster.counts.status_counts.weak,
      cluster.score.min,
      cluster.score.max,
      cluster.score.average,
      cluster.related_agent2_route_ids.join(', '),
      cluster.samples.map((sample) => mdLink(sample.source_ref, sample.source_href)).join('<br>'),
    ]).map((cells) => `| ${cells.map(mdCell).join(' | ')} |`),
    '',
    '## Sample Occurrences',
    '',
    '| cluster | status | score | source | work anchor | route ids | context |',
    '|---|---|---:|---|---|---|---|',
    ...artifact.clusters.flatMap((cluster) => cluster.samples.map((sample) => `| ${[
      cluster.cluster_id,
      sample.status,
      sample.raw_score,
      mdLink(sample.source_ref, sample.source_href),
      mdLink(sample.source_ref, sample.work_anchor_href),
      sample.route_ids.join(', '),
      markFocus(sample.phrase_hebrew, sample.token_surface),
    ].map(mdCell).join(' | ')} |`)),
    '',
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function markFocus(phrase, tokenSurface) {
  const value = String(phrase || '');
  const token = String(tokenSurface || '');
  if (!token || value.includes('[')) return value;
  return value.replace(token, `[${token}]`);
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--concordance=')) parsed.concordance = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--max-samples=')) parsed.maxSamples = Math.max(0, Number(valueAfterEquals(arg)) || 0);
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

function mdLink(label, href) {
  if (!label) return '';
  if (!href) return label;
  return `[${String(label).replace(/\]/g, '\\]')}](${href})`;
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}
