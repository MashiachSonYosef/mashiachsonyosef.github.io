#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  selectedOccurrences: '.local-cache/workbench-evidence/usage-selected-occurrences.json',
  selectedOccurrenceLookup: '.local-cache/workbench-evidence/usage-selected-occurrence-lookup.json',
  output: '.local-cache/workbench-evidence/usage-concentration-packet.json',
  report: 'reports/workbench-usage-concentration-packet.md',
};

const options = parseArgs(process.argv.slice(2));
const selectedOccurrences = readJson(options.selectedOccurrences);
const selectedOccurrenceLookup = readJson(options.selectedOccurrenceLookup);
const forbiddenRoutePayloadFields = new Set([
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
]);
if (selectedOccurrences.artifact_type !== 'workbench_usage_navigation_selected_occurrences') {
  throw new Error(`${options.selectedOccurrences} is not a selected occurrences artifact`);
}
if (selectedOccurrenceLookup.artifact_type !== 'workbench_usage_navigation_selected_occurrence_lookup') {
  throw new Error(`${options.selectedOccurrenceLookup} is not a selected occurrence lookup artifact`);
}

const occurrenceCount = Number(selectedOccurrences.counts?.occurrence_refs || 0);
const routeBuckets = selectedOccurrenceLookup.lookup?.by_route_id || [];
const clusterBuckets = selectedOccurrenceLookup.lookup?.by_cluster || [];
const statusBuckets = selectedOccurrenceLookup.lookup?.by_status || [];
const routePayloadFieldHits = countForbiddenKeys(selectedOccurrenceLookup.lookup?.by_route_id || []);
const topRouteBucket = routeBuckets[0] || null;
const topClusterBucket = clusterBuckets[0] || null;
const checks = buildChecks();
const warnings = checks.filter((check) => check.status === 'warning');
const failed = checks.filter((check) => check.status === 'failed');

const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_concentration_packet',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_concentration_packet.mjs',
  policy: 'Concentration review over selected usage occurrences. It flags route and usage-frame concentration for QA only; it does not rank routes, select visible answers, translate, or make semantic claims.',
  inputs: {
    selected_occurrences: options.selectedOccurrences,
    selected_occurrence_lookup: options.selectedOccurrenceLookup,
  },
  authority_policy: {
    usage_navigation_only: true,
    ranks_routes: false,
    selects_visible_result: false,
    ambiguous_rows_reader_facing: false,
  },
  quality: {
    status: failed.length ? 'failed' : warnings.length ? 'pass_with_warnings' : 'passed',
    warning_count: warnings.length,
    failed_count: failed.length,
  },
  counts: {
    occurrence_refs: occurrenceCount,
    route_id_buckets: routeBuckets.length,
    cluster_buckets: clusterBuckets.length,
    status_buckets: statusBuckets.length,
    top_route_rows: topRouteBucket?.counts?.rows ?? null,
    top_route_share: share(topRouteBucket?.counts?.rows, occurrenceCount),
    top_cluster_rows: topClusterBucket?.counts?.rows ?? null,
    top_cluster_share: share(topClusterBucket?.counts?.rows, occurrenceCount),
    route_payload_field_hits: routePayloadFieldHits,
  },
  concentration: {
    routes: routeBuckets.map(compactBucket),
    clusters: clusterBuckets.map(compactBucket),
    statuses: statusBuckets.map(compactBucket),
  },
  checks,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Usage concentration status ${artifact.quality.status}; warnings ${artifact.quality.warning_count}; failed ${artifact.quality.failed_count}`);

function buildChecks() {
  return [
    check('selected_occurrences_present', occurrenceCount > 0 ? 'passed' : 'failed', `selected occurrence rows ${occurrenceCount}`),
    check('route_concentration_visible', routeBuckets.length === 1 ? 'warning' : 'passed', `route ID buckets ${routeBuckets.length}; top share ${formatShare(share(topRouteBucket?.counts?.rows, occurrenceCount))}`),
    check('usage_frame_diversity_visible', clusterBuckets.length > 1 ? 'passed' : 'warning', `cluster buckets ${clusterBuckets.length}; top share ${formatShare(share(topClusterBucket?.counts?.rows, occurrenceCount))}`),
    check('status_distribution_visible', statusBuckets.length >= 3 ? 'passed' : 'warning', `status buckets ${statusBuckets.length}`),
    check('route_payload_absent', routePayloadFieldHits === 0 ? 'passed' : 'failed', `route payload-like field hits ${routePayloadFieldHits}`),
    check('selected_rows_are_observations', selectedOccurrences.authority_policy?.usage_navigation_only === true ? 'passed' : 'failed', 'selected occurrences authority policy remains usage-navigation only'),
  ];
}

function check(id, status, detail) {
  return { id, status, detail };
}

function compactBucket(bucket) {
  return {
    key: bucket.key,
    label: bucket.label,
    rows: Number(bucket.counts?.rows || 0),
    share: share(bucket.counts?.rows, occurrenceCount),
    status_counts: bucket.counts?.status_counts || {},
    sample_sources: (bucket.samples || []).map((sample) => ({
      source_ref: sample.source_ref || null,
      source_href: sample.source_href || null,
      work_anchor_href: sample.work_anchor_href || null,
      status: sample.status || null,
      raw_score: sample.raw_score ?? null,
    })),
  };
}

function share(value, total) {
  const numerator = Number(value || 0);
  const denominator = Number(total || 0);
  if (!denominator) return 0;
  return Number((numerator / denominator).toFixed(6));
}

function formatShare(value) {
  return `${Math.round(Number(value || 0) * 10000) / 100}%`;
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--selected-occurrences=')) parsed.selectedOccurrences = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-occurrence-lookup=')) parsed.selectedOccurrenceLookup = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Concentration Packet',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Quality: ${artifact.quality.status}`,
    `- Warnings: ${artifact.quality.warning_count}`,
    `- Failed checks: ${artifact.quality.failed_count}`,
    `- Occurrence refs: ${artifact.counts.occurrence_refs}`,
    `- Route ID buckets: ${artifact.counts.route_id_buckets}`,
    `- Cluster buckets: ${artifact.counts.cluster_buckets}`,
    `- Status buckets: ${artifact.counts.status_buckets}`,
    `- Top route share: ${formatShare(artifact.counts.top_route_share)}`,
    `- Top cluster share: ${formatShare(artifact.counts.top_cluster_share)}`,
    `- Route payload-like field hits: ${artifact.counts.route_payload_field_hits}`,
    '',
    '## Policy',
    '',
    'This packet makes concentration visible for QA. It is not a ranking artifact and carries no visible-answer authority.',
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((check) => `| ${[check.id, check.status, check.detail].map(mdCell).join(' | ')} |`),
    '',
    ...renderBucketSection('Route Concentration', artifact.concentration.routes),
    ...renderBucketSection('Usage Frame Concentration', artifact.concentration.clusters),
    ...renderBucketSection('Status Concentration', artifact.concentration.statuses),
  ];
  writeText(relativePath, `${lines.join('\n').trimEnd()}\n`);
}

function renderBucketSection(title, buckets) {
  return [
    `## ${title}`,
    '',
    '| key | label | rows | share | supported | candidate | weak | sample sources |',
    '|---|---|---:|---:|---:|---:|---:|---|',
    ...buckets.map((bucket) => `| ${[
      bucket.key,
      bucket.label,
      bucket.rows,
      formatShare(bucket.share),
      bucket.status_counts.supported || 0,
      bucket.status_counts.candidate || 0,
      bucket.status_counts.weak || 0,
      bucket.sample_sources.map((sample) => mdLink(sample.source_ref, sample.source_href)).join('<br>'),
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

function countForbiddenKeys(value) {
  let count = 0;
  const stack = [value];
  while (stack.length) {
    const item = stack.pop();
    if (!item || typeof item !== 'object') continue;
    if (Array.isArray(item)) {
      for (const child of item) stack.push(child);
      continue;
    }
    for (const [key, child] of Object.entries(item)) {
      if (forbiddenRoutePayloadFields.has(key)) count += 1;
      if (child && typeof child === 'object') stack.push(child);
    }
  }
  return count;
}
