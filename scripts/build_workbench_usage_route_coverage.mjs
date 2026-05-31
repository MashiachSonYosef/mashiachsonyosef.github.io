#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  concordance: 'data/workbench-evidence/usage-concordance.json',
  output: '.local-cache/workbench-evidence/usage-route-coverage.json',
  report: 'reports/workbench-usage-route-coverage.md',
  maxSamples: 8,
};

const options = parseArgs(process.argv.slice(2));
const concordance = readJson(options.concordance);
if (concordance.artifact_type !== 'workbench_usage_navigation_concordance') {
  throw new Error(`${options.concordance} is not a usage concordance artifact`);
}

const routes = new Map();
let observedOnlyRows = 0;
let routeLinkedRows = 0;
let routeLinks = 0;

for (const row of concordance.rows || []) {
  const links = Array.isArray(row.route_links) ? row.route_links : [];
  if (!links.length) {
    observedOnlyRows += 1;
    continue;
  }
  routeLinkedRows += 1;
  for (const link of links) {
    routeLinks += 1;
    const routeId = String(link.route_id || '').trim();
    if (!routeId) continue;
    if (!routes.has(routeId)) routes.set(routeId, createRoute(routeId, link));
    addRouteRow(routes.get(routeId), row, link);
  }
}

const routeList = [...routes.values()].map(finalizeRoute).sort((a, b) => (
  b.counts.rows - a.counts.rows
  || a.route_id.localeCompare(b.route_id)
));

const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_route_coverage_index',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_route_coverage.mjs',
  policy: 'Route coverage index for usage-navigation rows. It summarizes which Agent 2 route IDs are linked to observed usage rows; it does not rank routes, select visible answers, or print route content.',
  inputs: {
    concordance: options.concordance,
  },
  counts: {
    rows: Number(concordance.counts?.rows || 0),
    route_linked_rows: routeLinkedRows,
    observed_only_rows: observedOnlyRows,
    route_links: routeLinks,
    unique_route_ids: routeList.length,
  },
  routes: routeList,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Usage route coverage route IDs ${artifact.counts.unique_route_ids}; linked rows ${artifact.counts.route_linked_rows}; observed-only ${artifact.counts.observed_only_rows}`);

function createRoute(routeId, link) {
  return {
    route_id: routeId,
    route_source: link.route_source || null,
    normalized: link.normalized || null,
    surface: link.surface || null,
    route_family: link.route_family || null,
    route_type: link.route_type || null,
    display_section: link.display_section || null,
    route_raw_score: link.raw_score ?? null,
    counts: {
      rows: 0,
      status_counts: { supported: 0, candidate: 0, weak: 0 },
      cluster_counts: new Map(),
    },
    samples: [],
  };
}

function addRouteRow(route, row) {
  route.counts.rows += 1;
  const status = row.status?.candidate_status;
  if (Object.hasOwn(route.counts.status_counts, status)) route.counts.status_counts[status] += 1;
  const clusterId = String(row.ids?.cluster_id || row.usage_frame?.cluster_id || 'unclustered');
  route.counts.cluster_counts.set(clusterId, (route.counts.cluster_counts.get(clusterId) || 0) + 1);
  if (route.samples.length < options.maxSamples) route.samples.push(compactSample(row));
}

function finalizeRoute(route) {
  return {
    route_id: route.route_id,
    route_source: route.route_source,
    normalized: route.normalized,
    surface: route.surface,
    route_family: route.route_family,
    route_type: route.route_type,
    display_section: route.display_section,
    route_raw_score: route.route_raw_score,
    counts: {
      rows: route.counts.rows,
      status_counts: route.counts.status_counts,
      cluster_counts: Object.fromEntries([...route.counts.cluster_counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))),
    },
    samples: route.samples,
  };
}

function compactSample(row) {
  return {
    occurrence_id: row.ids?.occurrence_id || null,
    candidate_id: row.ids?.candidate_id || null,
    cluster_id: row.ids?.cluster_id || null,
    status: row.status?.candidate_status || null,
    raw_score: row.status?.raw_score ?? null,
    source_ref: row.source?.source_ref || null,
    source_href: row.occurrence_links?.source_ref?.href || null,
    work_anchor_href: row.occurrence_links?.work_anchor?.href || null,
    phrase_hebrew: row.phrase?.phrase_hebrew || '',
  };
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Route Coverage',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Rows: ${artifact.counts.rows}`,
    `- Route-linked rows: ${artifact.counts.route_linked_rows}`,
    `- Observed-only rows: ${artifact.counts.observed_only_rows}`,
    `- Route links: ${artifact.counts.route_links}`,
    `- Unique route IDs: ${artifact.counts.unique_route_ids}`,
    '',
    '## Policy',
    '',
    'This is a usage-navigation route coverage index. It reports related Agent 2 route IDs and observed usage distribution only; it does not rank routes, select visible answers, or make meaning claims.',
    '',
    '## Routes',
    '',
    '| route id | source | family | type | display | rows | supported | candidate | weak | clusters | samples |',
    '|---|---|---|---|---|---:|---:|---:|---:|---|---|',
    ...artifact.routes.map((route) => `| ${[
      route.route_id,
      route.route_source,
      route.route_family,
      route.route_type,
      route.display_section,
      route.counts.rows,
      route.counts.status_counts.supported,
      route.counts.status_counts.candidate,
      route.counts.status_counts.weak,
      Object.entries(route.counts.cluster_counts).map(([clusterId, count]) => `${clusterId}: ${count}`).join('<br>'),
      route.samples.map((sample) => mdLink(sample.source_ref, sample.source_href)).join('<br>'),
    ].map(mdCell).join(' | ')} |`),
    '',
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
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
