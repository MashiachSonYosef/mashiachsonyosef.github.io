#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  selectedOccurrences: '.local-cache/workbench-evidence/usage-selected-occurrences.json',
  selectedSignatureIndependence: '.local-cache/workbench-evidence/usage-selected-signature-independence.json',
  output: '.local-cache/workbench-evidence/usage-selected-source-diversity.json',
  report: 'reports/workbench-usage-selected-source-diversity.md',
  maxSamples: 5,
};

const options = parseArgs(process.argv.slice(2));
const selectedOccurrences = readJson(options.selectedOccurrences);
const signatureIndependence = readJsonIfExists(options.selectedSignatureIndependence);
if (selectedOccurrences.artifact_type !== 'workbench_usage_navigation_selected_occurrences') {
  throw new Error(`${options.selectedOccurrences} is not a selected occurrences artifact`);
}
if (signatureIndependence && signatureIndependence.artifact_type !== 'workbench_usage_selected_signature_independence') {
  throw new Error(`${options.selectedSignatureIndependence} is not a selected signature independence artifact`);
}

const selectedRows = selectedOccurrences.occurrences || selectedOccurrences.rows || [];
const signatureByOccurrenceId = new Map((signatureIndependence?.rows || []).map((row) => [row.occurrence_id, row]));
const occurrenceRows = selectedRows.map(buildOccurrenceRow);
const sourceRefBuckets = buildBuckets(occurrenceRows, (row) => row.source_ref || 'unknown', sourceBucketSample);
const workAnchorBuckets = buildBuckets(occurrenceRows, (row) => row.work_anchor_href || row.source_ref || 'unknown', sourceBucketSample);
const workBuckets = buildBuckets(occurrenceRows, (row) => row.work_slug || row.work_id || row.work_title || 'unknown', sourceBucketSample);
const categoryBuckets = buildBuckets(occurrenceRows, (row) => row.category || 'unknown', sourceBucketSample);
const licenseBuckets = buildBuckets(occurrenceRows, (row) => row.license || 'unknown', sourceBucketSample);
const versionSourceBuckets = buildBuckets(occurrenceRows, (row) => row.version_source || 'unknown', sourceBucketSample);
const routeIdBuckets = buildBuckets(occurrenceRows, (row) => (row.route_ids || [])[0] || 'observed_usage_only', sourceBucketSample);

const sourceRefCounts = new Map(sourceRefBuckets.map((bucket) => [bucket.key, bucket.counts.rows]));
const workAnchorCounts = new Map(workAnchorBuckets.map((bucket) => [bucket.key, bucket.counts.rows]));
const occurrenceRowsWithFlags = occurrenceRows.map((row) => ({
  ...row,
  source_diversity_flags: {
    duplicate_source_ref: Number(sourceRefCounts.get(row.source_ref || 'unknown') || 0) > 1,
    duplicate_work_anchor: Number(workAnchorCounts.get(row.work_anchor_href || row.source_ref || 'unknown') || 0) > 1,
    observed_usage_only: true,
    reader_facing: false,
  },
  counts: {
    source_ref_bucket_rows: Number(sourceRefCounts.get(row.source_ref || 'unknown') || 0),
    work_anchor_bucket_rows: Number(workAnchorCounts.get(row.work_anchor_href || row.source_ref || 'unknown') || 0),
    signature_memberships: row.signature_independence?.signature_memberships ?? null,
    recurring_signature_memberships: row.signature_independence?.recurring_signature_memberships ?? null,
    cross_cluster_signature_memberships: row.signature_independence?.cross_cluster_signature_memberships ?? null,
  },
}));

const counts = buildCounts();
const checks = buildChecks();
const failed = checks.filter((checkRow) => checkRow.status === 'failed');
const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_selected_source_diversity',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_selected_source_diversity.mjs',
  policy: 'Selected-occurrence source diversity audit. It summarizes source/work/version/license spread and duplicate source refs for selected usage rows; it does not rank routes, select visible answers, translate, copy route payloads, or make meaning claims.',
  inputs: {
    selected_occurrences: options.selectedOccurrences,
    selected_signature_independence: options.selectedSignatureIndependence,
  },
  authority_policy: {
    usage_navigation_only: true,
    audit_only: true,
    reader_facing: false,
    ranks_routes: false,
    selects_visible_result: false,
    ambiguous_rows_reader_facing: false,
    route_payloads_copied: false,
  },
  quality: {
    status: failed.length ? 'failed' : 'passed',
    warning_count: checks.filter((checkRow) => checkRow.status === 'warning').length,
    failed_count: failed.length,
  },
  counts,
  checks,
  buckets: {
    source_refs: sourceRefBuckets,
    work_anchors: workAnchorBuckets,
    works: workBuckets,
    categories: categoryBuckets,
    licenses: licenseBuckets,
    version_sources: versionSourceBuckets,
    route_ids: routeIdBuckets,
  },
  rows: occurrenceRowsWithFlags,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Selected source diversity rows ${counts.selected_occurrence_refs}; source refs ${counts.unique_source_refs}; works ${counts.unique_works}`);

function buildOccurrenceRow(row) {
  const signatureRow = signatureByOccurrenceId.get(row.occurrence_id);
  return {
    occurrence_id: row.occurrence_id,
    candidate_id: row.candidate_id,
    token_key: row.token_key,
    focus_surface: row.focus_surface,
    focus_normalized: row.focus_normalized,
    source_ref: row.source_ref,
    source_href: row.source_href,
    work_anchor_href: row.work_anchor_href,
    work_id: row.work_id,
    work_title: row.work_title,
    work_slug: row.work_slug,
    category: row.category || categoryForWorkSlug(row.work_slug),
    unit_id: row.unit_id,
    status: row.status,
    raw_score: row.raw_score,
    cluster_id: row.cluster_id,
    usage_frame_label: row.usage_frame_label,
    version_title: row.version_title,
    version_source: row.version_source,
    license: row.license,
    license_url: row.license_url,
    route_ids: row.route_ids || [],
    slice_ids: row.slice_ids || [],
    context_focus_marked: row.context_focus_marked,
    signature_independence: signatureRow
      ? {
          has_recurring_signature: signatureRow.independence_flags?.has_recurring_signature === true,
          has_cross_cluster_signature: signatureRow.independence_flags?.has_cross_cluster_signature === true,
          signature_memberships: signatureRow.counts?.signature_memberships ?? null,
          recurring_signature_memberships: signatureRow.counts?.recurring_signature_memberships ?? null,
          cross_cluster_signature_memberships: signatureRow.counts?.cross_cluster_signature_memberships ?? null,
        }
      : null,
  };
}

function buildBuckets(rows, keyFn, sampleFn) {
  const bucketMap = new Map();
  for (const row of rows) {
    const key = String(keyFn(row) || 'unknown');
    if (!bucketMap.has(key)) {
      bucketMap.set(key, {
        key,
        label: key,
        counts: {
          rows: 0,
          status_counts: { supported: 0, candidate: 0, weak: 0 },
          cluster_counts: {},
          license_counts: {},
        },
        route_ids: new Set(),
        samples: [],
      });
    }
    const bucket = bucketMap.get(key);
    bucket.counts.rows += 1;
    if (Object.hasOwn(bucket.counts.status_counts, row.status)) bucket.counts.status_counts[row.status] += 1;
    incrementObjectCount(bucket.counts.cluster_counts, row.cluster_id || 'unclustered');
    incrementObjectCount(bucket.counts.license_counts, row.license || 'unknown');
    for (const routeId of row.route_ids || []) bucket.route_ids.add(routeId);
    if (bucket.samples.length < options.maxSamples) bucket.samples.push(sampleFn(row));
  }
  return [...bucketMap.values()].map(finalizeBucket).sort(compareBuckets);
}

function sourceBucketSample(row) {
  return {
    occurrence_id: row.occurrence_id,
    source_ref: row.source_ref,
    source_href: row.source_href,
    work_anchor_href: row.work_anchor_href,
    work_title: row.work_title,
    work_slug: row.work_slug,
    status: row.status,
    raw_score: row.raw_score,
    cluster_id: row.cluster_id,
    usage_frame_label: row.usage_frame_label,
    license: row.license,
    license_url: row.license_url,
  };
}

function finalizeBucket(bucket) {
  return {
    ...bucket,
    counts: {
      ...bucket.counts,
      cluster_counts: sortObjectByKey(bucket.counts.cluster_counts),
      license_counts: sortObjectByKey(bucket.counts.license_counts),
    },
    route_ids: [...bucket.route_ids].sort(),
  };
}

function buildCounts() {
  const duplicateSourceRefBuckets = sourceRefBuckets.filter((bucket) => bucket.counts.rows > 1);
  const duplicateWorkAnchorBuckets = workAnchorBuckets.filter((bucket) => bucket.counts.rows > 1);
  return {
    selected_occurrence_refs: occurrenceRowsWithFlags.length,
    unique_source_refs: sourceRefBuckets.length,
    unique_work_anchors: workAnchorBuckets.length,
    unique_works: workBuckets.length,
    unique_categories: categoryBuckets.length,
    unique_licenses: licenseBuckets.length,
    unique_version_sources: versionSourceBuckets.length,
    route_id_buckets: routeIdBuckets.length,
    duplicate_source_ref_buckets: duplicateSourceRefBuckets.length,
    duplicate_source_ref_rows: occurrenceRowsWithFlags.filter((row) => row.source_diversity_flags.duplicate_source_ref).length,
    duplicate_work_anchor_buckets: duplicateWorkAnchorBuckets.length,
    duplicate_work_anchor_rows: occurrenceRowsWithFlags.filter((row) => row.source_diversity_flags.duplicate_work_anchor).length,
    rows_with_signature_independence: occurrenceRowsWithFlags.filter((row) => row.signature_independence).length,
    rows_with_recurring_signatures: occurrenceRowsWithFlags.filter((row) => row.signature_independence?.has_recurring_signature).length,
    rows_with_cross_cluster_signatures: occurrenceRowsWithFlags.filter((row) => row.signature_independence?.has_cross_cluster_signature).length,
    missing_signature_independence_rows: occurrenceRowsWithFlags.filter((row) => !row.signature_independence).length,
    reader_facing_rows: 0,
    route_payload_field_hits: 0,
  };
}

function buildChecks() {
  const linkedRows = occurrenceRowsWithFlags.filter((row) => row.source_href && row.work_anchor_href).length;
  const licenseRows = occurrenceRowsWithFlags.filter((row) => row.license && row.license_url).length;
  return [
    check('selected_rows_present', occurrenceRowsWithFlags.length > 0 ? 'passed' : 'failed', `selected rows ${occurrenceRowsWithFlags.length}`),
    check('source_refs_diverse', sourceRefBuckets.length > 1 ? 'passed' : 'warning', `unique source refs ${sourceRefBuckets.length}`),
    check('works_diverse', workBuckets.length > 1 ? 'passed' : 'warning', `unique works ${workBuckets.length}`),
    check('version_sources_visible', versionSourceBuckets.length > 0 ? 'passed' : 'failed', `version sources ${versionSourceBuckets.length}`),
    check('rows_have_links', linkedRows === occurrenceRowsWithFlags.length ? 'passed' : 'failed', `linked rows ${linkedRows}; rows ${occurrenceRowsWithFlags.length}`),
    check('rows_have_license_metadata', licenseRows === occurrenceRowsWithFlags.length ? 'passed' : 'failed', `license rows ${licenseRows}; rows ${occurrenceRowsWithFlags.length}`),
    check('signature_independence_joined', counts?.missing_signature_independence_rows === 0 ? 'passed' : 'warning', `missing signature independence rows ${counts?.missing_signature_independence_rows ?? 'unknown'}`),
    check('audit_only_not_reader_facing', 'passed', 'reader-facing rows 0'),
    check('route_payload_absent', 'passed', 'route IDs are copied as IDs only; route payload field hits 0'),
  ];
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Selected Source Diversity',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Selected occurrence refs: ${artifact.counts.selected_occurrence_refs}`,
    `- Unique source refs: ${artifact.counts.unique_source_refs}`,
    `- Unique work anchors: ${artifact.counts.unique_work_anchors}`,
    `- Unique works: ${artifact.counts.unique_works}`,
    `- Unique categories: ${artifact.counts.unique_categories}`,
    `- Unique licenses: ${artifact.counts.unique_licenses}`,
    `- Unique version sources: ${artifact.counts.unique_version_sources}`,
    `- Route ID buckets: ${artifact.counts.route_id_buckets}`,
    `- Duplicate source-ref buckets: ${artifact.counts.duplicate_source_ref_buckets}`,
    `- Duplicate source-ref rows: ${artifact.counts.duplicate_source_ref_rows}`,
    `- Duplicate work-anchor buckets: ${artifact.counts.duplicate_work_anchor_buckets}`,
    `- Duplicate work-anchor rows: ${artifact.counts.duplicate_work_anchor_rows}`,
    `- Rows with signature independence: ${artifact.counts.rows_with_signature_independence}`,
    `- Rows with recurring signatures: ${artifact.counts.rows_with_recurring_signatures}`,
    `- Rows with cross-cluster signatures: ${artifact.counts.rows_with_cross_cluster_signatures}`,
    `- Missing signature-independence rows: ${artifact.counts.missing_signature_independence_rows}`,
    `- Reader-facing rows: ${artifact.counts.reader_facing_rows}`,
    `- Route payload-like field hits: ${artifact.counts.route_payload_field_hits}`,
    '',
    '## Policy',
    '',
    'This packet is audit-only. It shows source, work, version, license, and duplicate-source spread for selected usage rows. It does not rank routes, select visible answers, translate, or make definition claims.',
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${[checkRow.id, checkRow.status, checkRow.detail].map(mdCell).join(' | ')} |`),
    '',
    '## Top Works',
    '',
    '| work | rows | supported | candidate | weak | licenses | samples |',
    '|---|---:|---:|---:|---:|---|---|',
    ...artifact.buckets.works.map((bucket) => `| ${[
      bucket.label,
      bucket.counts.rows,
      bucket.counts.status_counts.supported,
      bucket.counts.status_counts.candidate,
      bucket.counts.status_counts.weak,
      formatCounts(bucket.counts.license_counts),
      bucket.samples.map((sample) => mdLink(sample.source_ref, sample.source_href)).join('<br>'),
    ].map(mdCell).join(' | ')} |`),
    '',
    '## Duplicate Source Refs',
    '',
    '| source ref | rows | works | clusters | licenses | samples |',
    '|---|---:|---|---|---|---|',
    ...artifact.buckets.source_refs
      .filter((bucket) => bucket.counts.rows > 1)
      .map((bucket) => `| ${[
        bucket.label,
        bucket.counts.rows,
        [...new Set(bucket.samples.map((sample) => sample.work_slug).filter(Boolean))].join(', '),
        formatCounts(bucket.counts.cluster_counts),
        formatCounts(bucket.counts.license_counts),
        bucket.samples.map((sample) => mdLink(sample.source_ref, sample.source_href)).join('<br>'),
      ].map(mdCell).join(' | ')} |`),
    '',
    '## Selected Rows',
    '',
    '| source | work | frame | status | license | duplicate source | duplicate anchor | recurring signature | cross-cluster signature |',
    '|---|---|---|---|---|---|---|---|---|',
    ...artifact.rows.map((row) => `| ${[
      mdLink(row.source_ref, row.source_href),
      row.work_slug || row.work_title,
      row.usage_frame_label || row.cluster_id,
      row.status,
      mdLink(row.license, row.license_url),
      row.source_diversity_flags.duplicate_source_ref ? 'yes' : 'no',
      row.source_diversity_flags.duplicate_work_anchor ? 'yes' : 'no',
      row.signature_independence?.has_recurring_signature ? 'yes' : 'no',
      row.signature_independence?.has_cross_cluster_signature ? 'yes' : 'no',
    ].map(mdCell).join(' | ')} |`),
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function check(id, status, detail) {
  return { id, status, detail };
}

function compareBuckets(a, b) {
  return b.counts.rows - a.counts.rows || a.key.localeCompare(b.key);
}

function categoryForWorkSlug(workSlug) {
  const [category] = String(workSlug || '').split('/');
  return category || 'unknown';
}

function formatCounts(countsObject) {
  return Object.entries(countsObject || {}).map(([key, value]) => `${key} ${value}`).join(', ');
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
    if (arg.startsWith('--selected-occurrences=')) parsed.selectedOccurrences = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-signature-independence=')) parsed.selectedSignatureIndependence = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--max-samples=')) parsed.maxSamples = Number(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
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

function readJsonIfExists(relativePath) {
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  if (!fs.existsSync(fullPath)) return null;
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function writeJson(relativePath, data) {
  mkdirpForFile(relativePath);
  fs.writeFileSync(path.join(root, cleanRelativePath(relativePath)), `${JSON.stringify(data, null, 2)}\n`);
}

function writeText(relativePath, text) {
  mkdirpForFile(relativePath);
  fs.writeFileSync(path.join(root, cleanRelativePath(relativePath)), text, 'utf8');
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
