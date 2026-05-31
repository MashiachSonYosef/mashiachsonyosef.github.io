#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  selectedOccurrences: '.local-cache/workbench-evidence/usage-selected-occurrences.json',
  output: '.local-cache/workbench-evidence/usage-selected-occurrence-lookup.json',
  report: 'reports/workbench-usage-selected-occurrence-lookup.md',
  maxSamples: 6,
};

const options = parseArgs(process.argv.slice(2));
const selectedOccurrences = readJson(options.selectedOccurrences);
if (selectedOccurrences.artifact_type !== 'workbench_usage_navigation_selected_occurrences') {
  throw new Error(`${options.selectedOccurrences} is not a selected occurrences artifact`);
}

const buckets = {
  by_work: new Map(),
  by_cluster: new Map(),
  by_status: new Map(),
  by_license: new Map(),
  by_route_id: new Map(),
  by_slice_id: new Map(),
};

for (const row of selectedOccurrences.rows || []) {
  addBucket(buckets.by_work, row.work_slug || row.work_id || 'unknown', row.work_title || row.work_slug || 'unknown', row);
  addBucket(buckets.by_cluster, row.cluster_id || 'unclustered', row.usage_frame_label || row.cluster_id || 'unclustered', row);
  addBucket(buckets.by_status, row.status || 'unknown', row.status || 'unknown', row);
  addBucket(buckets.by_license, row.license || 'unknown', row.license || 'unknown', row);
  for (const routeId of row.route_ids || []) addBucket(buckets.by_route_id, routeId, routeId, row);
  for (const sliceId of row.slice_ids || []) addBucket(buckets.by_slice_id, sliceId, sliceId, row);
}

const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_navigation_selected_occurrence_lookup',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_selected_occurrence_lookup.mjs',
  policy: 'Lookup buckets over de-duplicated selected usage occurrences. It supports navigation and QA only; it does not rank routes, select visible answers, translate, or make meaning claims.',
  inputs: {
    selected_occurrences: options.selectedOccurrences,
  },
  authority_policy: selectedOccurrences.authority_policy,
  counts: {
    occurrence_refs: Number(selectedOccurrences.counts?.occurrence_refs || 0),
    work_buckets: buckets.by_work.size,
    cluster_buckets: buckets.by_cluster.size,
    status_buckets: buckets.by_status.size,
    license_buckets: buckets.by_license.size,
    route_id_buckets: buckets.by_route_id.size,
    slice_id_buckets: buckets.by_slice_id.size,
  },
  lookup: {
    by_work: finalizeBucketMap(buckets.by_work),
    by_cluster: finalizeBucketMap(buckets.by_cluster),
    by_status: finalizeBucketMap(buckets.by_status),
    by_license: finalizeBucketMap(buckets.by_license),
    by_route_id: finalizeBucketMap(buckets.by_route_id),
    by_slice_id: finalizeBucketMap(buckets.by_slice_id),
  },
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Usage selected occurrence lookup occurrences ${artifact.counts.occurrence_refs}; works ${artifact.counts.work_buckets}`);

function addBucket(map, key, label, row) {
  if (!map.has(key)) {
    map.set(key, {
      key,
      label,
      counts: {
        rows: 0,
        status_counts: { supported: 0, candidate: 0, weak: 0 },
        route_link_state_counts: {
          route_linked_observed_usage: 0,
          observed_usage_only: 0,
        },
      },
      occurrence_ids: [],
      samples: [],
    });
  }
  const bucket = map.get(key);
  bucket.counts.rows += 1;
  if (Object.hasOwn(bucket.counts.status_counts, row.status)) bucket.counts.status_counts[row.status] += 1;
  if (Object.hasOwn(bucket.counts.route_link_state_counts, row.route_link_state)) {
    bucket.counts.route_link_state_counts[row.route_link_state] += 1;
  }
  if (row.occurrence_id) bucket.occurrence_ids.push(row.occurrence_id);
  if (bucket.samples.length < options.maxSamples) {
    bucket.samples.push({
      occurrence_id: row.occurrence_id || null,
      status: row.status || null,
      raw_score: row.raw_score ?? null,
      source_ref: row.source_ref || null,
      source_href: row.source_href || null,
      work_anchor_href: row.work_anchor_href || null,
      cluster_id: row.cluster_id || null,
      slice_ids: row.slice_ids || [],
    });
  }
}

function finalizeBucketMap(map) {
  return [...map.values()].sort((a, b) => b.counts.rows - a.counts.rows || a.key.localeCompare(b.key));
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--selected-occurrences=')) parsed.selectedOccurrences = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--max-samples=')) parsed.maxSamples = Math.max(0, Number(valueAfterEquals(arg)) || 0);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Selected Occurrence Lookup',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Occurrence refs: ${artifact.counts.occurrence_refs}`,
    `- Work buckets: ${artifact.counts.work_buckets}`,
    `- Cluster buckets: ${artifact.counts.cluster_buckets}`,
    `- Status buckets: ${artifact.counts.status_buckets}`,
    `- License buckets: ${artifact.counts.license_buckets}`,
    `- Route ID buckets: ${artifact.counts.route_id_buckets}`,
    `- Slice ID buckets: ${artifact.counts.slice_id_buckets}`,
    '',
    '## Policy',
    '',
    'This lookup is for selected occurrence navigation and QA only. It carries no definition, translation, route ranking, or visible-answer authority.',
    '',
    ...renderBucketSection('Works', artifact.lookup.by_work),
    ...renderBucketSection('Clusters', artifact.lookup.by_cluster),
    ...renderBucketSection('Statuses', artifact.lookup.by_status),
    ...renderBucketSection('Licenses', artifact.lookup.by_license),
    ...renderBucketSection('Route IDs', artifact.lookup.by_route_id),
    ...renderBucketSection('Slice IDs', artifact.lookup.by_slice_id),
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function renderBucketSection(title, buckets) {
  return [
    `## ${title}`,
    '',
    '| key | label | rows | supported | candidate | weak | sample sources |',
    '|---|---|---:|---:|---:|---:|---|',
    ...buckets.map((bucket) => `| ${[
      bucket.key,
      bucket.label,
      bucket.counts.rows,
      bucket.counts.status_counts.supported,
      bucket.counts.status_counts.candidate,
      bucket.counts.status_counts.weak,
      bucket.samples.map((sample) => mdLink(sample.source_ref, sample.source_href)).join('<br>'),
    ].map(mdCell).join(' | ')} |`),
    '',
  ];
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
