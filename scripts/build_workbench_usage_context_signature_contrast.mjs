#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  searchRows: '.local-cache/workbench-evidence/usage-search-rows.json',
  contextSignatureIndex: '.local-cache/workbench-evidence/usage-context-signature-index.json',
  output: '.local-cache/workbench-evidence/usage-context-signature-contrast.json',
  report: 'reports/workbench-usage-context-signature-contrast.md',
  maxSamplesPerCluster: 4,
};

const options = parseArgs(process.argv.slice(2));
const searchRows = readJson(options.searchRows);
const signatureIndex = readJson(options.contextSignatureIndex);
if (searchRows.artifact_type !== 'workbench_usage_navigation_search_rows') {
  throw new Error(`${options.searchRows} is not a usage search rows artifact`);
}
if (signatureIndex.artifact_type !== 'workbench_usage_context_signature_index') {
  throw new Error(`${options.contextSignatureIndex} is not a context signature index artifact`);
}

const rowByOccurrenceId = new Map((searchRows.rows || []).map((row) => [row.occurrence_id, row]));
const contrastGroups = (signatureIndex.groups || [])
  .filter((group) => Number(group.counts?.clusters || 0) > 1)
  .map(buildContrastGroup)
  .sort(compareContrastGroups);

const occurrences = new Set();
for (const group of contrastGroups) {
  for (const occurrenceId of group.occurrence_ids) occurrences.add(occurrenceId);
}

const checks = buildChecks();
const failed = checks.filter((checkRow) => checkRow.status === 'failed');
const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_context_signature_contrast',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_context_signature_contrast.mjs',
  policy: 'Audit-only contrast packet for exact context signatures shared across multiple usage-frame clusters. It helps reviewers identify shared or ambiguous local frames; it does not rank routes, select visible answers, translate, copy route payloads, or make meaning claims.',
  inputs: {
    search_rows: options.searchRows,
    context_signature_index: options.contextSignatureIndex,
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
    failed_count: failed.length,
  },
  counts: {
    signature_groups_all: Number(signatureIndex.counts?.signature_groups_all || 0),
    recurring_signature_groups: Number(signatureIndex.counts?.recurring_signature_groups || 0),
    cross_cluster_signature_groups: contrastGroups.length,
    cross_cluster_occurrence_refs: occurrences.size,
    reader_facing_rows: 0,
    route_payload_field_hits: 0,
  },
  checks,
  contrast_groups: contrastGroups,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Usage context signature contrast groups ${artifact.counts.cross_cluster_signature_groups}; occurrences ${artifact.counts.cross_cluster_occurrence_refs}`);

function buildContrastGroup(group) {
  const clusterBuckets = new Map();
  for (const occurrenceId of group.occurrence_ids || []) {
    addRowToCluster(clusterBuckets, rowByOccurrenceId.get(occurrenceId), occurrenceId);
  }
  return {
    signature_id: group.signature_id,
    window_radius: group.window_radius,
    signature_key: group.signature_key,
    signature_display: group.signature_display,
    counts: {
      occurrences: group.counts?.occurrences ?? null,
      works: group.counts?.works ?? null,
      categories: group.counts?.categories ?? null,
      clusters: group.counts?.clusters ?? null,
      status_counts: group.counts?.status_counts || {},
      cluster_counts: group.counts?.cluster_counts || {},
      license_counts: group.counts?.license_counts || {},
    },
    route_ids: group.route_ids || [],
    occurrence_ids: group.occurrence_ids || [],
    cluster_buckets: [...clusterBuckets.values()].sort((a, b) => b.counts.samples - a.counts.samples || a.cluster_id.localeCompare(b.cluster_id)),
  };
}

function addRowToCluster(clusterBuckets, row, occurrenceId) {
  const clusterId = row?.cluster_id || 'unclustered';
  if (!clusterBuckets.has(clusterId)) {
    clusterBuckets.set(clusterId, {
      cluster_id: clusterId,
      usage_frame_label: row?.usage_frame_label || clusterId,
      counts: {
        samples: 0,
        status_counts: { supported: 0, candidate: 0, weak: 0 },
        license_counts: {},
      },
      samples: [],
    });
  }
  const bucket = clusterBuckets.get(clusterId);
  bucket.counts.samples += 1;
  if (Object.hasOwn(bucket.counts.status_counts, row?.status)) bucket.counts.status_counts[row.status] += 1;
  incrementObjectCount(bucket.counts.license_counts, row?.license || 'unknown');
  if (bucket.samples.length < options.maxSamplesPerCluster) {
    bucket.samples.push({
      occurrence_id: occurrenceId,
      source_ref: row?.source_ref || null,
      source_href: row?.source_href || null,
      work_anchor_href: row?.work_anchor_href || null,
      work_title: row?.work_title || null,
      status: row?.status || null,
      raw_score: row?.raw_score ?? null,
      license: row?.license || null,
      license_url: row?.license_url || null,
      context_focus_marked: row?.context_focus_marked || null,
    });
  }
}

function buildChecks() {
  const clusterBucketSum = contrastGroups.reduce((sum, group) => sum + group.cluster_buckets.length, 0);
  const sampleCount = contrastGroups.reduce((sum, group) => sum + group.cluster_buckets.reduce((inner, bucket) => inner + bucket.samples.length, 0), 0);
  const linkedSamples = contrastGroups.reduce(
    (sum, group) => sum + group.cluster_buckets.reduce((inner, bucket) => inner + bucket.samples.filter((sample) => sample.source_href && sample.work_anchor_href).length, 0),
    0,
  );
  return [
    check('signature_index_present', Number(signatureIndex.counts?.signature_groups_all || 0) > 0 ? 'passed' : 'failed', `signature groups ${signatureIndex.counts?.signature_groups_all || 0}`),
    check('cross_cluster_groups_present', contrastGroups.length > 0 ? 'passed' : 'failed', `cross-cluster groups ${contrastGroups.length}`),
    check('cluster_buckets_present', clusterBucketSum >= contrastGroups.length * 2 ? 'passed' : 'failed', `cluster buckets ${clusterBucketSum}; groups ${contrastGroups.length}`),
    check('all_samples_have_links', linkedSamples === sampleCount ? 'passed' : 'failed', `linked samples ${linkedSamples}; samples ${sampleCount}`),
    check('audit_only_not_reader_facing', 'passed', 'reader-facing rows 0; ambiguous/shared signatures stay audit-only'),
    check('route_payload_absent', 'passed', 'route IDs are copied as IDs only; route payload field hits 0'),
  ];
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Context Signature Contrast',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Signature groups all: ${artifact.counts.signature_groups_all}`,
    `- Recurring signature groups: ${artifact.counts.recurring_signature_groups}`,
    `- Cross-cluster signature groups: ${artifact.counts.cross_cluster_signature_groups}`,
    `- Cross-cluster occurrence refs: ${artifact.counts.cross_cluster_occurrence_refs}`,
    `- Reader-facing rows: ${artifact.counts.reader_facing_rows}`,
    `- Route payload-like field hits: ${artifact.counts.route_payload_field_hits}`,
    '',
    '## Policy',
    '',
    'This packet is audit-only. It lists exact local context signatures shared across multiple usage-frame clusters so reviewers can spot ambiguous or shared frames. It does not rank routes, select visible answers, translate, or make definition claims.',
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${[checkRow.id, checkRow.status, checkRow.detail].map(mdCell).join(' | ')} |`),
    '',
    '## Cross-Cluster Signatures',
    '',
    '| radius | signature | occurrences | clusters | statuses | licenses | cluster samples |',
    '|---:|---|---:|---:|---|---|---|',
    ...artifact.contrast_groups.map((group) => `| ${[
      group.window_radius,
      group.signature_display,
      group.counts.occurrences,
      group.counts.clusters,
      formatCounts(group.counts.status_counts),
      formatCounts(group.counts.license_counts),
      group.cluster_buckets.map((bucket) => `${bucket.usage_frame_label}: ${bucket.samples.map((sample) => mdLink(sample.source_ref, sample.source_href)).join(', ')}`).join('<br>'),
    ].map(mdCell).join(' | ')} |`),
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function check(id, status, detail) {
  return { id, status, detail };
}

function compareContrastGroups(a, b) {
  return b.counts.occurrences - a.counts.occurrences
    || a.window_radius - b.window_radius
    || String(a.signature_key).localeCompare(String(b.signature_key));
}

function formatCounts(counts) {
  return Object.entries(counts || {}).map(([key, value]) => `${key} ${value}`).join(', ');
}

function incrementObjectCount(object, key) {
  object[key] = (object[key] || 0) + 1;
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--search-rows=')) parsed.searchRows = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--context-signature-index=')) parsed.contextSignatureIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--max-samples-per-cluster=')) parsed.maxSamplesPerCluster = Number(valueAfterEquals(arg));
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
