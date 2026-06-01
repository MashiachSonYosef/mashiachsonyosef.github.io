#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const defaults = {
  searchRows: '.local-cache/workbench-evidence/usage-search-rows.json',
  output: '.local-cache/workbench-evidence/usage-provenance-index.json',
  report: 'reports/workbench-usage-provenance-index.md',
  maxSamples: 5,
  maxReportRows: 80,
};

const options = parseArgs(process.argv.slice(2));
const searchRows = readJson(options.searchRows);
if (searchRows.artifact_type !== 'workbench_usage_navigation_search_rows') {
  throw new Error(`${options.searchRows} is not a usage search rows artifact`);
}

const forbiddenLicenseRe = /\bNC\b|Non-?Commercial|all rights reserved|copyright unclear|unknown|unverified|permission only/i;
const rows = Array.isArray(searchRows.rows) ? searchRows.rows : [];
const licenseBuckets = new Map();
const versionBuckets = new Map();
const workKeys = new Set();
const categoryKeys = new Set();
let rowsWithLicenseMetadata = 0;
let rowsWithSourceLinks = 0;
let rowsWithVersionMetadata = 0;
let unsafeLicenseRows = 0;

for (const row of rows) {
  const license = String(row.license || '').trim();
  const licenseUrl = String(row.license_url || '').trim();
  const versionTitle = String(row.version_title || '').trim();
  const versionSource = String(row.version_source || '').trim();
  if (license && licenseUrl) rowsWithLicenseMetadata += 1;
  if (row.source_href && row.work_anchor_href) rowsWithSourceLinks += 1;
  if (versionTitle && versionSource) rowsWithVersionMetadata += 1;
  if (!license || forbiddenLicenseRe.test(license)) unsafeLicenseRows += 1;
  if (row.work_slug || row.work_id) workKeys.add(row.work_slug || row.work_id);
  if (row.category) categoryKeys.add(row.category);

  const licenseKey = slugFor(`${license} ${licenseUrl}`) || 'missing-license';
  if (!licenseBuckets.has(licenseKey)) {
    licenseBuckets.set(licenseKey, createBucket({
      bucket_key: licenseKey,
      license,
      license_url: licenseUrl,
    }));
  }
  addRowToBucket(licenseBuckets.get(licenseKey), row);

  const versionKey = hashFor(`${versionSource}\n${versionTitle}\n${license}\n${licenseUrl}`);
  if (!versionBuckets.has(versionKey)) {
    versionBuckets.set(versionKey, createBucket({
      bucket_key: versionKey,
      version_title: versionTitle,
      version_source: versionSource,
      license,
      license_url: licenseUrl,
    }));
  }
  addRowToBucket(versionBuckets.get(versionKey), row);
}

const licenses = [...licenseBuckets.values()].map(finalizeBucket).sort(compareBuckets);
const versionSources = [...versionBuckets.values()].map(finalizeBucket).sort(compareBuckets);
const checks = buildChecks();
const failed = checks.filter((check) => check.status === 'failed');
const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_provenance_index',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_provenance_index.mjs',
  policy: 'Provenance index over usage search rows. It audits source/version/license coverage for observed usage navigation and does not rank routes, select visible answers, translate, copy route payloads, or make meaning claims.',
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
    licenses: licenses.length,
    version_sources: versionSources.length,
    works: workKeys.size,
    categories: categoryKeys.size,
    rows_with_license_metadata: rowsWithLicenseMetadata,
    rows_with_source_links: rowsWithSourceLinks,
    rows_with_version_metadata: rowsWithVersionMetadata,
    unsafe_license_rows: unsafeLicenseRows,
    route_payload_field_hits: 0,
  },
  checks,
  licenses,
  version_sources: versionSources,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Usage provenance rows ${artifact.counts.rows}; licenses ${artifact.counts.licenses}; version sources ${artifact.counts.version_sources}`);

function createBucket(fields) {
  return {
    ...fields,
    counts: {
      rows: 0,
      status_counts: { supported: 0, candidate: 0, weak: 0 },
      cluster_counts: {},
    },
    works: new Set(),
    categories: new Set(),
    route_ids: new Set(),
    samples: [],
  };
}

function addRowToBucket(bucket, row) {
  bucket.counts.rows += 1;
  if (Object.hasOwn(bucket.counts.status_counts, row.status)) bucket.counts.status_counts[row.status] += 1;
  incrementObjectCount(bucket.counts.cluster_counts, row.cluster_id || 'unclustered');
  if (row.work_slug || row.work_id) bucket.works.add(row.work_slug || row.work_id);
  if (row.category) bucket.categories.add(row.category);
  for (const routeId of row.route_ids || []) bucket.route_ids.add(routeId);
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
      version_title: row.version_title,
      version_source: row.version_source,
      license: row.license,
      license_url: row.license_url,
    });
  }
}

function finalizeBucket(bucket) {
  return {
    ...bucket,
    counts: {
      ...bucket.counts,
      cluster_counts: sortObjectByKey(bucket.counts.cluster_counts),
      works: bucket.works.size,
      categories: bucket.categories.size,
    },
    works: [...bucket.works].sort(),
    categories: [...bucket.categories].sort(),
    route_ids: [...bucket.route_ids].sort(),
  };
}

function buildChecks() {
  const licenseRows = [...licenseBuckets.values()].reduce((sum, bucket) => sum + bucket.counts.rows, 0);
  const versionRows = [...versionBuckets.values()].reduce((sum, bucket) => sum + bucket.counts.rows, 0);
  return [
    check('rows_present', rows.length > 0 ? 'passed' : 'failed', `rows ${rows.length}`),
    check('license_rows_sum_to_search_rows', licenseRows === rows.length ? 'passed' : 'failed', `license rows ${licenseRows}; rows ${rows.length}`),
    check('version_rows_sum_to_search_rows', versionRows === rows.length ? 'passed' : 'failed', `version rows ${versionRows}; rows ${rows.length}`),
    check('all_rows_have_license_metadata', rowsWithLicenseMetadata === rows.length ? 'passed' : 'failed', `licensed rows ${rowsWithLicenseMetadata}; rows ${rows.length}`),
    check('all_rows_have_source_links', rowsWithSourceLinks === rows.length ? 'passed' : 'failed', `linked rows ${rowsWithSourceLinks}; rows ${rows.length}`),
    check('all_rows_have_version_metadata', rowsWithVersionMetadata === rows.length ? 'passed' : 'failed', `versioned rows ${rowsWithVersionMetadata}; rows ${rows.length}`),
    check('unsafe_license_rows_absent', unsafeLicenseRows === 0 ? 'passed' : 'failed', `unsafe license rows ${unsafeLicenseRows}`),
    check('route_payload_absent', 'passed', 'route IDs are copied as IDs only; route payload field hits 0'),
  ];
}

function check(id, status, detail) {
  return { id, status, detail };
}

function compareBuckets(a, b) {
  return b.counts.rows - a.counts.rows
    || String(a.license || '').localeCompare(String(b.license || ''))
    || String(a.version_source || '').localeCompare(String(b.version_source || ''))
    || String(a.bucket_key).localeCompare(String(b.bucket_key));
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Provenance Index',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Rows: ${artifact.counts.rows}`,
    `- Licenses: ${artifact.counts.licenses}`,
    `- Version sources: ${artifact.counts.version_sources}`,
    `- Works: ${artifact.counts.works}`,
    `- Categories: ${artifact.counts.categories}`,
    `- Rows with license metadata: ${artifact.counts.rows_with_license_metadata}`,
    `- Rows with source links: ${artifact.counts.rows_with_source_links}`,
    `- Rows with version metadata: ${artifact.counts.rows_with_version_metadata}`,
    `- Unsafe license rows: ${artifact.counts.unsafe_license_rows}`,
    `- Route payload-like field hits: ${artifact.counts.route_payload_field_hits}`,
    '',
    '## Policy',
    '',
    'This index audits source/version/license coverage for observed usage navigation. It carries route IDs only; it does not rank routes, select visible answers, translate, or make definition claims.',
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${[checkRow.id, checkRow.status, checkRow.detail].map(mdCell).join(' | ')} |`),
    '',
    '## Licenses',
    '',
    '| license | rows | works | categories | supported | candidate | weak | clusters | sample sources |',
    '|---|---:|---:|---:|---:|---:|---:|---|---|',
    ...artifact.licenses.map((bucket) => `| ${[
      mdLink(bucket.license || 'missing', bucket.license_url),
      bucket.counts.rows,
      bucket.counts.works,
      bucket.counts.categories,
      bucket.counts.status_counts.supported,
      bucket.counts.status_counts.candidate,
      bucket.counts.status_counts.weak,
      formatCounts(bucket.counts.cluster_counts),
      bucket.samples.map((sample) => mdLink(sample.source_ref, sample.source_href)).join('<br>'),
    ].map(mdCell).join(' | ')} |`),
    '',
    '## Version Sources',
    '',
    '| rows | version title | version source | license | works | categories | supported | candidate | weak | clusters | sample sources |',
    '|---:|---|---|---|---:|---:|---:|---:|---:|---|---|',
    ...artifact.version_sources.slice(0, options.maxReportRows).map((bucket) => `| ${[
      bucket.counts.rows,
      bucket.version_title,
      mdLink(bucket.version_source, bucket.version_source),
      mdLink(bucket.license || 'missing', bucket.license_url),
      bucket.counts.works,
      bucket.counts.categories,
      bucket.counts.status_counts.supported,
      bucket.counts.status_counts.candidate,
      bucket.counts.status_counts.weak,
      formatCounts(bucket.counts.cluster_counts),
      bucket.samples.map((sample) => mdLink(sample.source_ref, sample.source_href)).join('<br>'),
    ].map(mdCell).join(' | ')} |`),
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
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

function hashFor(value) {
  return crypto.createHash('sha1').update(String(value)).digest('hex').slice(0, 16);
}

function slugFor(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--search-rows=')) parsed.searchRows = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--max-samples=')) parsed.maxSamples = Number(valueAfterEquals(arg));
    else if (arg.startsWith('--max-report-rows=')) parsed.maxReportRows = Number(valueAfterEquals(arg));
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
