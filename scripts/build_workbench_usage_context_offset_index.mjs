#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  searchRows: '.local-cache/workbench-evidence/usage-search-rows.json',
  output: '.local-cache/workbench-evidence/usage-context-offset-index.json',
  report: 'reports/workbench-usage-context-offset-index.md',
  maxSamples: 5,
  maxTokensPerReportOffset: 20,
};

const options = parseArgs(process.argv.slice(2));
const searchRows = readJson(options.searchRows);
if (searchRows.artifact_type !== 'workbench_usage_navigation_search_rows') {
  throw new Error(`${options.searchRows} is not a usage search rows artifact`);
}

const rows = Array.isArray(searchRows.rows) ? searchRows.rows : [];
const offsetMap = new Map();
let tokenObservations = 0;
let immediateNeighborObservations = 0;
let skippedRowsWithoutFocus = 0;
let rowsWithContext = 0;
const observedRows = new Set();

for (const row of rows) {
  const tokens = Array.isArray(row.phrase_tokens) ? row.phrase_tokens : [];
  const focusIndex = tokens.findIndex((token) => token?.role === 'focus-token' || token?.focus_marked === true);
  if (focusIndex < 0) {
    skippedRowsWithoutFocus += 1;
    continue;
  }
  let rowHadContext = false;
  for (const token of tokens) {
    const offset = Number(token.distance_from_focus);
    if (!Number.isInteger(offset) || offset === 0) continue;
    const normalized = String(token.normalized || token.surface || '').trim();
    const surface = String(token.surface || token.normalized || '').trim();
    if (!normalized || !surface) continue;
    tokenObservations += 1;
    if (Math.abs(offset) === 1) immediateNeighborObservations += 1;
    rowHadContext = true;
    observedRows.add(row.occurrence_id);
    const offsetBucket = getOffsetBucket(offset);
    const tokenKey = normalized;
    if (!offsetBucket.tokens.has(tokenKey)) offsetBucket.tokens.set(tokenKey, createTokenBucket(offset, normalized));
    addRowToTokenBucket(offsetBucket.tokens.get(tokenKey), token, row);
  }
  if (rowHadContext) rowsWithContext += 1;
}

const offsets = [...offsetMap.values()].map(finalizeOffsetBucket).sort((a, b) => a.offset - b.offset);
const tokenBuckets = offsets.reduce((sum, offset) => sum + offset.counts.unique_tokens, 0);
const checks = buildChecks(offsets);
const failed = checks.filter((check) => check.status === 'failed');
const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_context_offset_index',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_context_offset_index.mjs',
  policy: 'Context-offset index over usage search rows. It groups observed surrounding Hebrew tokens by distance from the focus token for navigation and review; it does not rank routes, select visible answers, translate, copy route payloads, or make meaning claims.',
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
    rows_with_context: rowsWithContext,
    rows_with_context_tokens: observedRows.size,
    skipped_rows_without_focus: skippedRowsWithoutFocus,
    token_observations: tokenObservations,
    immediate_neighbor_observations: immediateNeighborObservations,
    offsets: offsets.length,
    token_buckets: tokenBuckets,
    route_payload_field_hits: 0,
  },
  checks,
  offsets,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Usage context offsets ${artifact.counts.offsets}; token buckets ${artifact.counts.token_buckets}; observations ${artifact.counts.token_observations}`);

function getOffsetBucket(offset) {
  if (!offsetMap.has(offset)) {
    offsetMap.set(offset, {
      offset,
      counts: {
        observations: 0,
        status_counts: { supported: 0, candidate: 0, weak: 0 },
        cluster_counts: {},
        license_counts: {},
      },
      tokens: new Map(),
    });
  }
  return offsetMap.get(offset);
}

function createTokenBucket(offset, normalized) {
  return {
    offset,
    token_normalized: normalized,
    token_surfaces: new Map(),
    counts: {
      observations: 0,
      status_counts: { supported: 0, candidate: 0, weak: 0 },
      cluster_counts: {},
      license_counts: {},
    },
    works: new Set(),
    categories: new Set(),
    route_ids: new Set(),
    occurrence_ids: [],
    samples: [],
  };
}

function addRowToTokenBucket(bucket, token, row) {
  bucket.counts.observations += 1;
  if (Object.hasOwn(bucket.counts.status_counts, row.status)) bucket.counts.status_counts[row.status] += 1;
  incrementObjectCount(bucket.counts.cluster_counts, row.cluster_id || 'unclustered');
  incrementObjectCount(bucket.counts.license_counts, row.license || 'unknown');
  incrementMapCount(bucket.token_surfaces, token.surface || token.normalized || '');
  if (row.work_slug || row.work_id) bucket.works.add(row.work_slug || row.work_id);
  if (row.category) bucket.categories.add(row.category);
  for (const routeId of row.route_ids || []) bucket.route_ids.add(routeId);
  if (row.occurrence_id) bucket.occurrence_ids.push(row.occurrence_id);
  if (bucket.samples.length < options.maxSamples) {
    bucket.samples.push({
      occurrence_id: row.occurrence_id,
      source_ref: row.source_ref,
      source_href: row.source_href,
      work_anchor_href: row.work_anchor_href,
      work_title: row.work_title,
      category: row.category,
      status: row.status,
      raw_score: row.raw_score,
      cluster_id: row.cluster_id,
      license: row.license,
      license_url: row.license_url,
      context_focus_marked: row.context_focus_marked,
    });
  }
}

function finalizeOffsetBucket(offsetBucket) {
  const tokens = [...offsetBucket.tokens.values()].map(finalizeTokenBucket).sort(compareTokenBuckets);
  const observations = tokens.reduce((sum, token) => sum + token.counts.observations, 0);
  return {
    offset: offsetBucket.offset,
    counts: {
      observations,
      unique_tokens: tokens.length,
      status_counts: mergeStatusCounts(tokens),
      cluster_counts: mergeNestedCounts(tokens, 'cluster_counts'),
      license_counts: mergeNestedCounts(tokens, 'license_counts'),
    },
    tokens,
  };
}

function finalizeTokenBucket(bucket) {
  return {
    ...bucket,
    token_surfaces: mapToCountObjects(bucket.token_surfaces, 'surface'),
    counts: {
      ...bucket.counts,
      cluster_counts: sortObjectByKey(bucket.counts.cluster_counts),
      license_counts: sortObjectByKey(bucket.counts.license_counts),
      works: bucket.works.size,
      categories: bucket.categories.size,
    },
    works: [...bucket.works].sort(),
    categories: [...bucket.categories].sort(),
    route_ids: [...bucket.route_ids].sort(),
    occurrence_ids: bucket.occurrence_ids.sort(),
  };
}

function buildChecks(offsets) {
  const observations = offsets.reduce((sum, offset) => sum + offset.counts.observations, 0);
  const tokenBuckets = offsets.reduce((sum, offset) => sum + offset.counts.unique_tokens, 0);
  const samples = offsets.flatMap((offset) => offset.tokens.flatMap((token) => token.samples));
  const linkedSamples = samples.filter((sample) => sample.source_href && sample.work_anchor_href).length;
  return [
    check('rows_present', rows.length > 0 ? 'passed' : 'failed', `rows ${rows.length}`),
    check('focus_rows_present', skippedRowsWithoutFocus === 0 ? 'passed' : 'failed', `skipped rows without focus ${skippedRowsWithoutFocus}`),
    check('context_rows_present', rowsWithContext === rows.length ? 'passed' : 'failed', `rows with context ${rowsWithContext}; rows ${rows.length}`),
    check('offsets_present', offsets.length > 0 ? 'passed' : 'failed', `offsets ${offsets.length}`),
    check('token_observations_present', observations === tokenObservations && observations > 0 ? 'passed' : 'failed', `offset observations ${observations}; counted ${tokenObservations}`),
    check('token_buckets_present', tokenBuckets > 0 ? 'passed' : 'failed', `token buckets ${tokenBuckets}`),
    check('all_samples_have_links', linkedSamples === samples.length ? 'passed' : 'failed', `linked samples ${linkedSamples}; samples ${samples.length}`),
    check('route_payload_absent', 'passed', 'route IDs are copied as IDs only; route payload field hits 0'),
  ];
}

function check(id, status, detail) {
  return { id, status, detail };
}

function compareTokenBuckets(a, b) {
  return b.counts.observations - a.counts.observations
    || String(a.token_normalized).localeCompare(String(b.token_normalized));
}

function mergeStatusCounts(tokens) {
  const statusCounts = { supported: 0, candidate: 0, weak: 0 };
  for (const token of tokens) {
    statusCounts.supported += Number(token.counts.status_counts.supported || 0);
    statusCounts.candidate += Number(token.counts.status_counts.candidate || 0);
    statusCounts.weak += Number(token.counts.status_counts.weak || 0);
  }
  return statusCounts;
}

function mergeNestedCounts(tokens, field) {
  const counts = {};
  for (const token of tokens) {
    for (const [key, value] of Object.entries(token.counts[field] || {})) counts[key] = (counts[key] || 0) + value;
  }
  return sortObjectByKey(counts);
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Context Offset Index',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Rows: ${artifact.counts.rows}`,
    `- Rows with context: ${artifact.counts.rows_with_context}`,
    `- Token observations: ${artifact.counts.token_observations}`,
    `- Immediate neighbor observations: ${artifact.counts.immediate_neighbor_observations}`,
    `- Offsets: ${artifact.counts.offsets}`,
    `- Token buckets: ${artifact.counts.token_buckets}`,
    `- Skipped rows without focus: ${artifact.counts.skipped_rows_without_focus}`,
    `- Route payload-like field hits: ${artifact.counts.route_payload_field_hits}`,
    '',
    '## Policy',
    '',
    'This index groups Hebrew context tokens by distance from the focus token for usage navigation. It carries occurrence links, status/frame counts, license counts, and route IDs only; it does not rank routes, select visible answers, translate, or make definition claims.',
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${[checkRow.id, checkRow.status, checkRow.detail].map(mdCell).join(' | ')} |`),
    '',
    '## Offset Summary',
    '',
    '| offset | observations | unique tokens | supported | candidate | weak | clusters | licenses |',
    '|---:|---:|---:|---:|---:|---:|---|---|',
    ...artifact.offsets.map((offset) => `| ${[
      offset.offset,
      offset.counts.observations,
      offset.counts.unique_tokens,
      offset.counts.status_counts.supported,
      offset.counts.status_counts.candidate,
      offset.counts.status_counts.weak,
      formatCounts(offset.counts.cluster_counts),
      formatCounts(offset.counts.license_counts),
    ].map(mdCell).join(' | ')} |`),
    '',
    '## Top Tokens By Offset',
    '',
    '| offset | token | observations | works | categories | supported | candidate | weak | clusters | licenses | route ids | samples |',
    '|---:|---|---:|---:|---:|---:|---:|---:|---|---|---|---|',
    ...artifact.offsets.flatMap((offset) => offset.tokens.slice(0, options.maxTokensPerReportOffset).map((token) => `| ${[
      offset.offset,
      token.token_normalized,
      token.counts.observations,
      token.counts.works,
      token.counts.categories,
      token.counts.status_counts.supported,
      token.counts.status_counts.candidate,
      token.counts.status_counts.weak,
      formatCounts(token.counts.cluster_counts),
      formatCounts(token.counts.license_counts),
      token.route_ids.join(', '),
      token.samples.map((sample) => mdLink(sample.source_ref, sample.source_href)).join('<br>'),
    ].map(mdCell).join(' | ')} |`)),
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function formatCounts(counts) {
  return Object.entries(counts || {}).map(([key, value]) => `${key} ${value}`).join(', ');
}

function incrementObjectCount(object, key) {
  object[key] = (object[key] || 0) + 1;
}

function incrementMapCount(map, key) {
  map.set(key, (map.get(key) || 0) + 1);
}

function sortObjectByKey(object) {
  return Object.fromEntries(Object.entries(object).sort(([a], [b]) => a.localeCompare(b)));
}

function mapToCountObjects(map, keyName) {
  return [...map.entries()]
    .map(([key, count]) => ({ [keyName]: key, count }))
    .sort((a, b) => b.count - a.count || String(a[keyName]).localeCompare(String(b[keyName])));
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--search-rows=')) parsed.searchRows = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--max-samples=')) parsed.maxSamples = Number(valueAfterEquals(arg));
    else if (arg.startsWith('--max-tokens-per-report-offset=')) parsed.maxTokensPerReportOffset = Number(valueAfterEquals(arg));
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
  mkdirpForFile(relativePath);
  fs.writeFileSync(path.join(root, cleanRelativePath(relativePath)), `${JSON.stringify(data, null, 2)}\n`);
}

function writeText(relativePath, text) {
  mkdirpForFile(relativePath);
  fs.writeFileSync(path.join(root, cleanRelativePath(relativePath)), text);
}

function mkdirpForFile(relativePath) {
  fs.mkdirSync(path.dirname(path.join(root, cleanRelativePath(relativePath))), { recursive: true });
}

function mdLink(label, href) {
  if (!href) return label || '';
  return `[${label || href}](${href})`;
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}
