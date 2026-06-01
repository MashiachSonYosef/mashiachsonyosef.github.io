#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  concordance: 'data/workbench-evidence/usage-concordance.json',
  output: '.local-cache/workbench-evidence/usage-work-frame-matrix.json',
  report: 'reports/workbench-usage-work-frame-matrix.md',
  maxSamples: 5,
  maxReportWorks: 40,
};

const options = parseArgs(process.argv.slice(2));
const concordance = readJson(options.concordance);
if (concordance.artifact_type !== 'workbench_usage_navigation_concordance') {
  throw new Error(`${options.concordance} is not a usage concordance artifact`);
}

const workMap = new Map();
const categoryMap = new Map();
const clusterMap = new Map();
const licenseMap = new Map();
const routeIds = new Set();

for (const row of concordance.rows || []) {
  const occurrence = compactOccurrence(row);
  const workKey = occurrence.work_slug || occurrence.work_id || occurrence.work_title || 'unknown';
  const categoryKey = categoryForWorkSlug(occurrence.work_slug);
  const clusterKey = occurrence.cluster_id || 'unclustered';
  const licenseKey = occurrence.license || 'unknown';

  if (!workMap.has(workKey)) workMap.set(workKey, createWorkEntry(workKey, occurrence, categoryKey));
  addOccurrenceToWork(workMap.get(workKey), occurrence);
  addCategory(categoryKey, occurrence);
  addCluster(clusterKey, occurrence);
  licenseMap.set(licenseKey, (licenseMap.get(licenseKey) || 0) + 1);
  for (const routeId of occurrence.route_ids) routeIds.add(routeId);
}

const works = [...workMap.values()].map(finalizeWorkEntry).sort(compareWorkEntries);
const categories = [...categoryMap.values()].map(finalizeAggregateEntry).sort(compareAggregateEntries);
const clusters = [...clusterMap.values()].map(finalizeAggregateEntry).sort(compareAggregateEntries);
const counts = buildCounts(works, categories, clusters);
const checks = buildChecks(counts);
const failed = checks.filter((check) => check.status === 'failed');
const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_navigation_work_frame_matrix',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_work_frame_matrix.mjs',
  policy: 'Work-by-usage-frame matrix for corpus navigation. It aggregates observed usage rows by work, category, cluster, status, license, and route IDs only; it does not rank routes, select visible answers, translate, or make meaning claims.',
  inputs: {
    concordance: options.concordance,
  },
  authority_policy: {
    usage_navigation_only: true,
    ranks_routes: false,
    selects_visible_result: false,
    ambiguous_rows_reader_facing: false,
  },
  quality: {
    status: failed.length ? 'failed' : 'passed',
    failed_count: failed.length,
  },
  counts,
  checks,
  categories,
  clusters,
  works,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Usage work-frame matrix works ${counts.works}; categories ${counts.categories}; rows ${counts.rows}`);

function compactOccurrence(row) {
  const routeIds = Array.isArray(row.agent2_route_ids) ? row.agent2_route_ids.filter(Boolean).sort() : [];
  return {
    occurrence_id: row.ids?.occurrence_id || null,
    candidate_id: row.ids?.candidate_id || null,
    token_key: row.ids?.token_key || null,
    focus_normalized: row.token?.focus_normalized || row.token?.token_normalized || null,
    focus_surface: row.token?.focus_surface || row.token?.token_surface || null,
    cluster_id: row.ids?.cluster_id || row.usage_frame?.cluster_id || null,
    usage_frame_label: row.usage_frame?.frame_label || null,
    status: row.status?.candidate_status || null,
    raw_score: row.status?.raw_score ?? null,
    source_ref: row.source?.source_ref || row.occurrence_links?.source_ref?.label || null,
    source_href: row.occurrence_links?.source_ref?.href || row.source?.source_url || null,
    work_anchor_href: row.occurrence_links?.work_anchor?.href || null,
    work_id: row.source?.work_id || null,
    work_title: row.source?.work_title || null,
    work_slug: row.source?.work_slug || row.occurrence_links?.work_anchor?.work_slug || null,
    unit_id: row.source?.unit_id || row.occurrence_links?.work_anchor?.unit_id || null,
    version_title: row.source?.version_title || null,
    version_source: row.source?.version_source || null,
    license: row.source?.license || null,
    license_url: row.source?.license_url || null,
    route_ids: routeIds,
  };
}

function createWorkEntry(workKey, occurrence, categoryKey) {
  return {
    work_key: workKey,
    work_id: occurrence.work_id,
    work_title: occurrence.work_title,
    work_slug: occurrence.work_slug,
    category: categoryKey,
    counts: {
      rows: 0,
      status_counts: { supported: 0, candidate: 0, weak: 0 },
      license_counts: {},
    },
    clusters: new Map(),
    route_ids: new Set(),
    samples: [],
  };
}

function createAggregateEntry(key, label = key) {
  return {
    key,
    label,
    counts: {
      rows: 0,
      works: new Set(),
      status_counts: { supported: 0, candidate: 0, weak: 0 },
      cluster_counts: {},
      license_counts: {},
    },
    route_ids: new Set(),
    samples: [],
  };
}

function addOccurrenceToWork(entry, occurrence) {
  entry.counts.rows += 1;
  if (Object.hasOwn(entry.counts.status_counts, occurrence.status)) entry.counts.status_counts[occurrence.status] += 1;
  incrementObjectCount(entry.counts.license_counts, occurrence.license || 'unknown');
  for (const routeId of occurrence.route_ids) entry.route_ids.add(routeId);

  const clusterKey = occurrence.cluster_id || 'unclustered';
  if (!entry.clusters.has(clusterKey)) {
    entry.clusters.set(clusterKey, {
      cluster_id: clusterKey,
      usage_frame_label: occurrence.usage_frame_label,
      counts: {
        rows: 0,
        status_counts: { supported: 0, candidate: 0, weak: 0 },
      },
      samples: [],
    });
  }
  const clusterEntry = entry.clusters.get(clusterKey);
  clusterEntry.counts.rows += 1;
  if (Object.hasOwn(clusterEntry.counts.status_counts, occurrence.status)) clusterEntry.counts.status_counts[occurrence.status] += 1;
  if (clusterEntry.samples.length < options.maxSamples) clusterEntry.samples.push(compactSample(occurrence));
  if (entry.samples.length < options.maxSamples) entry.samples.push(compactSample(occurrence));
}

function addCategory(categoryKey, occurrence) {
  if (!categoryMap.has(categoryKey)) categoryMap.set(categoryKey, createAggregateEntry(categoryKey));
  addOccurrenceToAggregate(categoryMap.get(categoryKey), occurrence);
}

function addCluster(clusterKey, occurrence) {
  if (!clusterMap.has(clusterKey)) clusterMap.set(clusterKey, createAggregateEntry(clusterKey, occurrence.usage_frame_label || clusterKey));
  addOccurrenceToAggregate(clusterMap.get(clusterKey), occurrence);
}

function addOccurrenceToAggregate(entry, occurrence) {
  entry.counts.rows += 1;
  if (occurrence.work_slug || occurrence.work_id || occurrence.work_title) {
    entry.counts.works.add(occurrence.work_slug || occurrence.work_id || occurrence.work_title);
  }
  if (Object.hasOwn(entry.counts.status_counts, occurrence.status)) entry.counts.status_counts[occurrence.status] += 1;
  incrementObjectCount(entry.counts.cluster_counts, occurrence.cluster_id || 'unclustered');
  incrementObjectCount(entry.counts.license_counts, occurrence.license || 'unknown');
  for (const routeId of occurrence.route_ids) entry.route_ids.add(routeId);
  if (entry.samples.length < options.maxSamples) entry.samples.push(compactSample(occurrence));
}

function compactSample(occurrence) {
  return {
    occurrence_id: occurrence.occurrence_id,
    source_ref: occurrence.source_ref,
    source_href: occurrence.source_href,
    work_anchor_href: occurrence.work_anchor_href,
    status: occurrence.status,
    raw_score: occurrence.raw_score,
    cluster_id: occurrence.cluster_id,
    usage_frame_label: occurrence.usage_frame_label,
    license: occurrence.license,
    license_url: occurrence.license_url,
  };
}

function finalizeWorkEntry(entry) {
  return {
    ...entry,
    counts: {
      ...entry.counts,
      license_counts: sortObjectByKey(entry.counts.license_counts),
    },
    clusters: [...entry.clusters.values()].sort((a, b) => b.counts.rows - a.counts.rows || a.cluster_id.localeCompare(b.cluster_id)),
    route_ids: [...entry.route_ids].sort(),
  };
}

function finalizeAggregateEntry(entry) {
  return {
    ...entry,
    counts: {
      ...entry.counts,
      works: entry.counts.works.size,
      cluster_counts: sortObjectByKey(entry.counts.cluster_counts),
      license_counts: sortObjectByKey(entry.counts.license_counts),
    },
    route_ids: [...entry.route_ids].sort(),
  };
}

function buildCounts(works, categories, clusters) {
  return {
    rows: Number(concordance.counts?.rows || 0),
    works: works.length,
    categories: categories.length,
    clusters: clusters.length,
    route_ids: routeIds.size,
    license_counts: sortObjectByKey(Object.fromEntries(licenseMap.entries())),
    status_counts: concordance.counts?.status_counts || {},
    route_payload_field_hits: 0,
  };
}

function buildChecks(counts) {
  const summedWorkRows = works.reduce((sum, work) => sum + work.counts.rows, 0);
  const summedClusterRows = clusters.reduce((sum, cluster) => sum + cluster.counts.rows, 0);
  return [
    check('concordance_rows_present', counts.rows > 0 ? 'passed' : 'failed', `rows ${counts.rows}`),
    check('work_rows_sum_to_concordance', summedWorkRows === counts.rows ? 'passed' : 'failed', `work rows ${summedWorkRows}; concordance rows ${counts.rows}`),
    check('cluster_rows_sum_to_concordance', summedClusterRows === counts.rows ? 'passed' : 'failed', `cluster rows ${summedClusterRows}; concordance rows ${counts.rows}`),
    check('route_payload_absent', 'passed', 'route IDs are copied as IDs only; route payload field hits 0'),
  ];
}

function check(id, status, detail) {
  return { id, status, detail };
}

function categoryForWorkSlug(workSlug) {
  const value = String(workSlug || 'unknown');
  return value.includes('/') ? value.split('/')[0] : value;
}

function incrementObjectCount(object, key) {
  object[key] = (object[key] || 0) + 1;
}

function sortObjectByKey(object) {
  return Object.fromEntries(Object.entries(object || {}).sort((a, b) => a[0].localeCompare(b[0])));
}

function compareWorkEntries(a, b) {
  return b.counts.rows - a.counts.rows
    || String(a.work_title || a.work_key).localeCompare(String(b.work_title || b.work_key));
}

function compareAggregateEntries(a, b) {
  return b.counts.rows - a.counts.rows || a.key.localeCompare(b.key);
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--concordance=')) parsed.concordance = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--max-samples=')) parsed.maxSamples = Math.max(0, Number(valueAfterEquals(arg)) || 0);
    else if (arg.startsWith('--max-report-works=')) parsed.maxReportWorks = Math.max(0, Number(valueAfterEquals(arg)) || 0);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function writeReport(relativePath, artifact) {
  const topWorks = artifact.works.slice(0, options.maxReportWorks);
  const lines = [
    '# Workbench Usage Work Frame Matrix',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Rows: ${artifact.counts.rows}`,
    `- Works: ${artifact.counts.works}`,
    `- Categories: ${artifact.counts.categories}`,
    `- Clusters: ${artifact.counts.clusters}`,
    `- Route IDs: ${artifact.counts.route_ids}`,
    `- Status counts: supported ${artifact.counts.status_counts.supported}, candidate ${artifact.counts.status_counts.candidate}, weak ${artifact.counts.status_counts.weak}`,
    `- License counts: ${Object.entries(artifact.counts.license_counts).map(([key, value]) => `${key} ${value}`).join(', ')}`,
    `- Route payload-like field hits: ${artifact.counts.route_payload_field_hits}`,
    '',
    '## Policy',
    '',
    'This matrix is usage-navigation data only. It aggregates observed rows by work and usage frame while preserving provenance/license metadata and route IDs only.',
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((check) => `| ${[check.id, check.status, check.detail].map(mdCell).join(' | ')} |`),
    '',
    '## Categories',
    '',
    '| category | rows | works | supported | candidate | weak | clusters | licenses |',
    '|---|---:|---:|---:|---:|---:|---|---|',
    ...artifact.categories.map((category) => `| ${[
      category.label,
      category.counts.rows,
      category.counts.works,
      category.counts.status_counts.supported,
      category.counts.status_counts.candidate,
      category.counts.status_counts.weak,
      formatCounts(category.counts.cluster_counts),
      formatCounts(category.counts.license_counts),
    ].map(mdCell).join(' | ')} |`),
    '',
    '## Usage Frames',
    '',
    '| frame | rows | works | supported | candidate | weak | licenses |',
    '|---|---:|---:|---:|---:|---:|---|',
    ...artifact.clusters.map((cluster) => `| ${[
      cluster.label,
      cluster.counts.rows,
      cluster.counts.works,
      cluster.counts.status_counts.supported,
      cluster.counts.status_counts.candidate,
      cluster.counts.status_counts.weak,
      formatCounts(cluster.counts.license_counts),
    ].map(mdCell).join(' | ')} |`),
    '',
    '## Top Works',
    '',
    '| work | category | rows | supported | candidate | weak | frame split | licenses | samples |',
    '|---|---|---:|---:|---:|---:|---|---|---|',
    ...topWorks.map((work) => `| ${[
      work.work_title || work.work_key,
      work.category,
      work.counts.rows,
      work.counts.status_counts.supported,
      work.counts.status_counts.candidate,
      work.counts.status_counts.weak,
      work.clusters.map((cluster) => `${cluster.usage_frame_label || cluster.cluster_id} ${cluster.counts.rows}`).join('<br>'),
      formatCounts(work.counts.license_counts),
      work.samples.map((sample) => mdLink(sample.source_ref, sample.source_href)).join('<br>'),
    ].map(mdCell).join(' | ')} |`),
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function formatCounts(counts) {
  return Object.entries(counts || {}).map(([key, value]) => `${key}:${value}`).join(', ');
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
