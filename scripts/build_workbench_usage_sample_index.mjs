#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  concordance: 'data/workbench-evidence/usage-concordance.json',
  output: '.local-cache/workbench-evidence/usage-sample-index.json',
  report: 'reports/workbench-usage-sample-index.md',
  maxSamplesPerStatus: 5,
};

const options = parseArgs(process.argv.slice(2));
const concordance = readJson(options.concordance);
if (concordance.artifact_type !== 'workbench_usage_navigation_concordance') {
  throw new Error(`${options.concordance} is not a usage concordance artifact`);
}

const statusOrder = ['supported', 'candidate', 'weak'];
const clusters = new Map();
const statusSamples = new Map(statusOrder.map((status) => [status, []]));

for (const row of concordance.rows || []) {
  const clusterId = String(row.ids?.cluster_id || row.usage_frame?.cluster_id || 'unclustered');
  if (!clusters.has(clusterId)) clusters.set(clusterId, createCluster(clusterId, row));
  const cluster = clusters.get(clusterId);
  addRowToCluster(cluster, row);
  addStatusSample(row);
}

const clusterList = [...clusters.values()].map(finalizeCluster).sort((a, b) => (
  b.counts.rows - a.counts.rows
  || a.cluster_id.localeCompare(b.cluster_id)
));

const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_navigation_sample_index',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_sample_index.mjs',
  policy: 'Sample index for usage-navigation rows. It exposes compact clickable occurrence examples by cluster and status; it does not rank routes, select visible answers, or make meaning claims.',
  inputs: {
    concordance: options.concordance,
    max_samples_per_status: options.maxSamplesPerStatus,
  },
  reader_facing_policy: concordance.reader_facing_policy,
  authority_policy: {
    usage_navigation_only: true,
    ranks_routes: false,
    selects_visible_result: false,
    ambiguous_rows_reader_facing: false,
    no_route_label: concordance.reader_facing_policy?.no_route_label || 'observed usage only',
  },
  counts: {
    rows: Number(concordance.counts?.rows || 0),
    sample_rows: clusterList.reduce((sum, cluster) => sum + cluster.samples.length, 0),
    clusters: clusterList.length,
    status_counts: concordance.counts?.status_counts || {},
    route_link_state_counts: concordance.counts?.route_link_state_counts || {},
    audit_only_counts: concordance.counts?.audit_only_counts || {},
  },
  status_samples: Object.fromEntries([...statusSamples.entries()].map(([status, samples]) => [status, samples])),
  clusters: clusterList,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Usage sample index samples ${artifact.counts.sample_rows}; clusters ${artifact.counts.clusters}`);

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
    route_ids: new Set(),
    samples_by_status: Object.fromEntries(statusOrder.map((status) => [status, []])),
  };
}

function addRowToCluster(cluster, row) {
  cluster.counts.rows += 1;
  const status = row.status?.candidate_status;
  if (Object.hasOwn(cluster.counts.status_counts, status)) cluster.counts.status_counts[status] += 1;
  const routeState = row.route_link_state;
  if (Object.hasOwn(cluster.counts.route_link_state_counts, routeState)) {
    cluster.counts.route_link_state_counts[routeState] += 1;
  }
  for (const routeId of row.agent2_route_ids || []) cluster.route_ids.add(routeId);
  if (statusOrder.includes(status) && cluster.samples_by_status[status].length < options.maxSamplesPerStatus) {
    cluster.samples_by_status[status].push(compactSample(row));
  }
}

function addStatusSample(row) {
  const status = row.status?.candidate_status;
  const samples = statusSamples.get(status);
  if (!samples || samples.length >= options.maxSamplesPerStatus) return;
  samples.push(compactSample(row));
}

function finalizeCluster(cluster) {
  const samples = statusOrder.flatMap((status) => cluster.samples_by_status[status]);
  return {
    cluster_id: cluster.cluster_id,
    frame_label: cluster.frame_label,
    counts: cluster.counts,
    route_ids: [...cluster.route_ids].sort(),
    samples_by_status: cluster.samples_by_status,
    samples,
  };
}

function compactSample(row) {
  const routeIds = Array.isArray(row.agent2_route_ids) ? row.agent2_route_ids : [];
  return {
    occurrence_id: row.ids?.occurrence_id || null,
    candidate_id: row.ids?.candidate_id || null,
    token_key: row.ids?.token_key || null,
    cluster_id: row.ids?.cluster_id || row.usage_frame?.cluster_id || null,
    token_surface: row.token?.token_surface || null,
    token_normalized: row.token?.token_normalized || null,
    focus_surface: row.token?.focus_surface || null,
    focus_normalized: row.token?.focus_normalized || null,
    usage_frame_label: row.usage_frame?.frame_label || null,
    status: row.status?.candidate_status || null,
    raw_score: row.status?.raw_score ?? null,
    navigation_label: row.navigation_label || (routeIds.length ? 'route-linked observed usage' : 'observed usage only'),
    route_link_state: row.route_link_state || (routeIds.length ? 'route_linked_observed_usage' : 'observed_usage_only'),
    source_ref: row.source?.source_ref || null,
    source_href: row.occurrence_links?.source_ref?.href || row.source?.source_url || null,
    work_anchor_href: row.occurrence_links?.work_anchor?.href || null,
    work_slug: row.occurrence_links?.work_anchor?.work_slug || row.source?.work_slug || null,
    unit_id: row.occurrence_links?.work_anchor?.unit_id || row.source?.unit_id || null,
    route_ids: routeIds,
    context_hebrew: row.phrase?.phrase_hebrew || '',
    context_focus_marked: markFocusFromTokens(row.phrase?.phrase_tokens),
    phrase_tokens: (row.phrase?.phrase_tokens || []).map((token) => ({
      surface: token.surface,
      normalized: token.normalized,
      role: token.role,
      distance_from_focus: token.distance_from_focus,
    })),
  };
}

function markFocusFromTokens(tokens) {
  if (!Array.isArray(tokens) || !tokens.length) return '';
  return tokens.map((token) => token.role === 'focus-token' ? `[${token.surface}]` : token.surface).join(' ');
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Sample Index',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Rows: ${artifact.counts.rows}`,
    `- Sample rows: ${artifact.counts.sample_rows}`,
    `- Clusters: ${artifact.counts.clusters}`,
    `- Status counts: supported ${artifact.counts.status_counts.supported}, candidate ${artifact.counts.status_counts.candidate}, weak ${artifact.counts.status_counts.weak}`,
    `- Route link states: route-linked ${artifact.counts.route_link_state_counts.route_linked_observed_usage}, observed-only ${artifact.counts.route_link_state_counts.observed_usage_only}`,
    `- Audit-only rows: ambiguous ${artifact.counts.audit_only_counts.ambiguous}, blocked ${artifact.counts.audit_only_counts.blocked}`,
    '',
    '## Policy',
    '',
    'This report is an inspection aid for usage navigation. Samples are selected from reader-facing statuses only and remain observed usage rows, not definitions, translations, route rankings, or visible-answer selections.',
    '',
    '## Status Samples',
    '',
    '| status | score | source | work anchor | cluster | route ids | context |',
    '|---|---:|---|---|---|---|---|',
    ...statusOrder.flatMap((status) => artifact.status_samples[status].map((sample) => sampleRow(status, sample))),
    '',
    '## Cluster Samples',
    '',
    '| cluster | frame | rows | supported | candidate | weak | route ids |',
    '|---|---|---:|---:|---:|---:|---|',
    ...artifact.clusters.map((cluster) => `| ${[
      cluster.cluster_id,
      cluster.frame_label,
      cluster.counts.rows,
      cluster.counts.status_counts.supported,
      cluster.counts.status_counts.candidate,
      cluster.counts.status_counts.weak,
      cluster.route_ids.join(', '),
    ].map(mdCell).join(' | ')} |`),
    '',
    '| cluster | status | score | source | work anchor | route state | context |',
    '|---|---|---:|---|---|---|---|',
    ...artifact.clusters.flatMap((cluster) => cluster.samples.map((sample) => `| ${[
      cluster.cluster_id,
      sample.status,
      sample.raw_score,
      mdLink(sample.source_ref, sample.source_href),
      mdLink(sample.source_ref, sample.work_anchor_href),
      sample.navigation_label,
      sample.context_focus_marked || sample.context_hebrew,
    ].map(mdCell).join(' | ')} |`)),
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function sampleRow(status, sample) {
  return `| ${[
    status,
    sample.raw_score,
    mdLink(sample.source_ref, sample.source_href),
    mdLink(sample.source_ref, sample.work_anchor_href),
    sample.cluster_id,
    sample.route_ids.join(', '),
    sample.context_focus_marked || sample.context_hebrew,
  ].map(mdCell).join(' | ')} |`;
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--concordance=')) parsed.concordance = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--max-samples-per-status=')) {
      parsed.maxSamplesPerStatus = Math.max(0, Number(valueAfterEquals(arg)) || 0);
    } else throw new Error(`Unknown argument: ${arg}`);
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
