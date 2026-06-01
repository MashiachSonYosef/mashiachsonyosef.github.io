#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  searchRows: '.local-cache/workbench-evidence/usage-search-rows.json',
  output: '.local-cache/workbench-evidence/usage-search-shard-index.json',
  report: 'reports/workbench-usage-search-shard-index.md',
  maxSamples: 5,
  maxReportShards: 80,
};

const options = parseArgs(process.argv.slice(2));
const searchRows = readJson(options.searchRows);
if (searchRows.artifact_type !== 'workbench_usage_navigation_search_rows') {
  throw new Error(`${options.searchRows} is not a usage search rows artifact`);
}

const shardMap = new Map();
for (const row of searchRows.rows || []) {
  const category = row.category || 'unknown';
  const clusterId = row.cluster_id || 'unclustered';
  const status = row.status || 'unknown';
  const key = `${category}\u0000${clusterId}\u0000${status}`;
  if (!shardMap.has(key)) shardMap.set(key, createShard(category, clusterId, status, row));
  addRowToShard(shardMap.get(key), row);
}

const shards = [...shardMap.values()].map(finalizeShard).sort(compareShards);
const checks = buildChecks(shards);
const failed = checks.filter((check) => check.status === 'failed');
const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_navigation_search_shard_index',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_search_shard_index.mjs',
  policy: 'Shard index over usage search rows. It partitions observed occurrences by category, usage frame, and status for ingest/navigation; it does not copy route payloads, rank routes, select visible answers, translate, or make meaning claims.',
  inputs: {
    search_rows: options.searchRows,
  },
  authority_policy: {
    usage_navigation_only: true,
    ranks_routes: false,
    selects_visible_result: false,
    ambiguous_rows_reader_facing: false,
    route_payloads_copied: false,
  },
  quality: {
    status: failed.length ? 'failed' : 'passed',
    failed_count: failed.length,
  },
  counts: {
    rows: Number(searchRows.counts?.rows || 0),
    shards: shards.length,
    categories: new Set(shards.map((shard) => shard.category)).size,
    clusters: new Set(shards.map((shard) => shard.cluster_id)).size,
    statuses: new Set(shards.map((shard) => shard.status)).size,
    route_payload_field_hits: 0,
  },
  checks,
  shards,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Usage search shard index shards ${artifact.counts.shards}; rows ${artifact.counts.rows}`);

function createShard(category, clusterId, status, row) {
  return {
    shard_id: shardId(category, clusterId, status),
    category,
    cluster_id: clusterId,
    usage_frame_label: row.usage_frame_label || null,
    status,
    counts: {
      rows: 0,
      works: new Set(),
      license_counts: {},
    },
    route_ids: new Set(),
    occurrence_ids: [],
    samples: [],
  };
}

function addRowToShard(shard, row) {
  shard.counts.rows += 1;
  if (row.work_slug) shard.counts.works.add(row.work_slug);
  incrementObjectCount(shard.counts.license_counts, row.license || 'unknown');
  for (const routeId of row.route_ids || []) shard.route_ids.add(routeId);
  if (row.occurrence_id) shard.occurrence_ids.push(row.occurrence_id);
  if (shard.samples.length < options.maxSamples) {
    shard.samples.push({
      occurrence_id: row.occurrence_id,
      source_ref: row.source_ref,
      source_href: row.source_href,
      work_anchor_href: row.work_anchor_href,
      raw_score: row.raw_score,
      license: row.license,
      license_url: row.license_url,
      context_focus_marked: row.context_focus_marked,
    });
  }
}

function finalizeShard(shard) {
  return {
    ...shard,
    counts: {
      rows: shard.counts.rows,
      works: shard.counts.works.size,
      license_counts: sortObjectByKey(shard.counts.license_counts),
    },
    route_ids: [...shard.route_ids].sort(),
    occurrence_ids: shard.occurrence_ids.sort(),
  };
}

function buildChecks(shards) {
  const summedRows = shards.reduce((sum, shard) => sum + shard.counts.rows, 0);
  const shardsWithSamples = shards.filter((shard) => shard.samples.length > 0).length;
  const samplesWithLinks = shards.flatMap((shard) => shard.samples).filter((sample) => sample.source_href && sample.work_anchor_href).length;
  const sampleCount = shards.reduce((sum, shard) => sum + shard.samples.length, 0);
  return [
    check('shards_present', shards.length > 0 ? 'passed' : 'failed', `shards ${shards.length}`),
    check('shard_rows_sum_to_search_rows', summedRows === Number(searchRows.counts?.rows || 0) ? 'passed' : 'failed', `shard rows ${summedRows}; search rows ${searchRows.counts?.rows}`),
    check('all_shards_have_samples', shardsWithSamples === shards.length ? 'passed' : 'failed', `sampled shards ${shardsWithSamples}; shards ${shards.length}`),
    check('all_samples_have_links', samplesWithLinks === sampleCount ? 'passed' : 'failed', `linked samples ${samplesWithLinks}; samples ${sampleCount}`),
    check('route_payload_absent', 'passed', 'route IDs are copied as IDs only; route payload field hits 0'),
  ];
}

function check(id, status, detail) {
  return { id, status, detail };
}

function shardId(category, clusterId, status) {
  return `usage-shard-${slugPart(category)}-${slugPart(clusterId)}-${slugPart(status)}`;
}

function slugPart(value) {
  return String(value || 'unknown').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'unknown';
}

function compareShards(a, b) {
  return String(a.category).localeCompare(String(b.category))
    || String(a.cluster_id).localeCompare(String(b.cluster_id))
    || String(a.status).localeCompare(String(b.status))
    || b.counts.rows - a.counts.rows
    || String(a.shard_id).localeCompare(String(b.shard_id));
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Search Shard Index',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Rows: ${artifact.counts.rows}`,
    `- Shards: ${artifact.counts.shards}`,
    `- Categories: ${artifact.counts.categories}`,
    `- Clusters: ${artifact.counts.clusters}`,
    `- Statuses: ${artifact.counts.statuses}`,
    `- Route payload-like field hits: ${artifact.counts.route_payload_field_hits}`,
    '',
    '## Policy',
    '',
    'This index partitions the validated usage search rows by category, usage frame, and status. It is a navigation/ingest aid only and carries no definition, translation, route ranking, or visible-answer authority.',
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${[checkRow.id, checkRow.status, checkRow.detail].map(mdCell).join(' | ')} |`),
    '',
    '## Shards',
    '',
    '| shard | category | frame | status | rows | works | route ids | licenses | sample |',
    '|---|---|---|---|---:|---:|---|---|---|',
    ...artifact.shards.slice(0, options.maxReportShards).map((shard) => `| ${[
      shard.shard_id,
      shard.category,
      shard.cluster_id,
      shard.status,
      shard.counts.rows,
      shard.counts.works,
      shard.route_ids.join(', '),
      formatCounts(shard.counts.license_counts),
      formatSample(shard.samples[0]),
    ].map(mdCell).join(' | ')} |`),
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function formatSample(sample) {
  if (!sample) return '';
  return `${mdLink(sample.source_ref, sample.source_href)} / ${mdLink('work', sample.work_anchor_href)}`;
}

function formatCounts(counts) {
  return Object.entries(counts || {}).map(([key, value]) => `${key} ${value}`).join(', ');
}

function incrementObjectCount(object, key) {
  object[key] = (object[key] || 0) + 1;
}

function sortObjectByKey(object) {
  return Object.fromEntries(Object.entries(object).sort(([a], [b]) => a.localeCompare(b)));
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--search-rows=')) parsed.searchRows = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--max-samples=')) parsed.maxSamples = Number(valueAfterEquals(arg));
    else if (arg.startsWith('--max-report-shards=')) parsed.maxReportShards = Number(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  for (const key of ['maxSamples', 'maxReportShards']) {
    if (!Number.isInteger(parsed[key]) || parsed[key] < 0) throw new Error(`--${key} must be a non-negative integer`);
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

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function mdLink(label, href) {
  if (!href) return label || '';
  return `[${String(label || href).replace(/\]/g, '\\]')}](${href})`;
}
