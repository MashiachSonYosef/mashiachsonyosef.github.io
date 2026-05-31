#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const clusterIndexPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/usage-cluster-index.json');
const artifact = readJson(clusterIndexPath);
const issues = [];
const fileCache = new Map();
const allowedStatuses = new Set(['supported', 'candidate', 'weak']);
const forbiddenFieldNames = new Set([
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
  'final_answer',
]);

if (artifact.schema_version !== 1) issues.push('schema_version must be 1');
if (artifact.artifact_type !== 'workbench_usage_navigation_cluster_index') {
  issues.push('artifact_type must be workbench_usage_navigation_cluster_index');
}
if (artifact.reader_facing_policy?.ambiguous_rows_reader_facing !== false) {
  issues.push('reader_facing_policy.ambiguous_rows_reader_facing must be false');
}
if (!Array.isArray(artifact.clusters)) issues.push('clusters must be an array');

const totals = {
  rows: 0,
  status_counts: { supported: 0, candidate: 0, weak: 0 },
  route_link_state_counts: {
    route_linked_observed_usage: 0,
    observed_usage_only: 0,
  },
};

for (const [index, cluster] of (artifact.clusters || []).entries()) {
  validateCluster(cluster, `clusters[${index}]`);
}
validateTotals();
walkNoForbiddenFields(artifact, clusterIndexPath);

if (issues.length) {
  console.error(`Workbench usage cluster index validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Workbench usage cluster index validation passed. Clusters: ${artifact.clusters.length}. Rows: ${totals.rows}.`);

function validateCluster(cluster, context) {
  if (!String(cluster.cluster_id || '').trim()) issues.push(`${context}.cluster_id must be present`);
  if (!String(cluster.frame_label || '').trim()) issues.push(`${context}.frame_label must be present`);
  const rows = Number(cluster.counts?.rows || 0);
  if (!Number.isInteger(rows) || rows <= 0) issues.push(`${context}.counts.rows must be a positive integer`);
  totals.rows += rows;

  const statusTotal = sumCountFields(cluster.counts?.status_counts, ['supported', 'candidate', 'weak'], `${context}.counts.status_counts`);
  if (statusTotal !== rows) issues.push(`${context}.counts.status_counts must sum to rows`);
  for (const status of Object.keys(totals.status_counts)) {
    totals.status_counts[status] += Number(cluster.counts?.status_counts?.[status] || 0);
  }

  const routeTotal = sumCountFields(
    cluster.counts?.route_link_state_counts,
    ['route_linked_observed_usage', 'observed_usage_only'],
    `${context}.counts.route_link_state_counts`,
  );
  if (routeTotal !== rows) issues.push(`${context}.counts.route_link_state_counts must sum to rows`);
  for (const state of Object.keys(totals.route_link_state_counts)) {
    totals.route_link_state_counts[state] += Number(cluster.counts?.route_link_state_counts?.[state] || 0);
  }

  for (const field of ['min', 'max', 'average']) {
    const value = Number(cluster.score?.[field]);
    if (!Number.isFinite(value) || value < 0 || value > 100) issues.push(`${context}.score.${field} must be 0-100`);
  }
  if (Number(cluster.score?.min) > Number(cluster.score?.max)) issues.push(`${context}.score.min must be <= max`);
  if (!Array.isArray(cluster.related_agent2_route_ids)) issues.push(`${context}.related_agent2_route_ids must be an array`);
  if (!Array.isArray(cluster.samples) || !cluster.samples.length) issues.push(`${context}.samples must be a non-empty array`);
  for (const [sampleIndex, sample] of (cluster.samples || []).entries()) {
    validateSample(sample, `${context}.samples[${sampleIndex}]`);
  }
}

function validateSample(sample, context) {
  for (const field of ['occurrence_id', 'candidate_id', 'token_normalized', 'status', 'source_ref', 'source_href', 'work_anchor_href', 'phrase_hebrew']) {
    if (!String(sample?.[field] || '').trim()) issues.push(`${context}.${field} must be present`);
  }
  if (!allowedStatuses.has(sample.status)) issues.push(`${context}.status must be supported/candidate/weak`);
  const rawScore = Number(sample.raw_score);
  if (!Number.isFinite(rawScore) || rawScore < 0 || rawScore > 100) issues.push(`${context}.raw_score must be 0-100`);
  if (!/^https?:\/\//.test(String(sample.source_href || ''))) issues.push(`${context}.source_href must be http(s)`);
  if (!String(sample.work_anchor_href || '').includes('#')) issues.push(`${context}.work_anchor_href must include a local anchor`);
  validateWorkAnchor(sample.work_anchor_href, context);
  if (/[A-Za-z]{4,}/.test(String(sample.phrase_hebrew || ''))) {
    issues.push(`${context}.phrase_hebrew must not contain English words`);
  }
  if (!Array.isArray(sample.route_ids)) issues.push(`${context}.route_ids must be an array`);
}

function validateWorkAnchor(href, context) {
  const [filePart, anchorId, extra] = String(href || '').split('#');
  if (!filePart || !anchorId || extra !== undefined) {
    issues.push(`${context}.work_anchor_href must be file#id`);
    return;
  }
  const cleanFile = cleanRelativePath(filePart);
  const absoluteFile = path.resolve(root, cleanFile);
  if (!absoluteFile.startsWith(root + path.sep)) {
    issues.push(`${context}.work_anchor_href escapes workspace`);
    return;
  }
  if (!fs.existsSync(absoluteFile)) {
    issues.push(`${context}.work_anchor_href file missing: ${cleanFile}`);
    return;
  }
  const html = readCachedFile(absoluteFile);
  if (!hasHtmlId(html, anchorId)) {
    issues.push(`${context}.work_anchor_href anchor missing: ${cleanFile}#${anchorId}`);
  }
}

function validateTotals() {
  if (Number(artifact.counts?.rows || 0) !== totals.rows) {
    issues.push(`counts.rows expected ${totals.rows}, found ${artifact.counts?.rows}`);
  }
  if (Number(artifact.counts?.clusters || 0) !== (artifact.clusters || []).length) {
    issues.push(`counts.clusters expected ${(artifact.clusters || []).length}, found ${artifact.counts?.clusters}`);
  }
  for (const status of Object.keys(totals.status_counts)) {
    if (Number(artifact.counts?.status_counts?.[status] || 0) !== totals.status_counts[status]) {
      issues.push(`counts.status_counts.${status} expected ${totals.status_counts[status]}, found ${artifact.counts?.status_counts?.[status]}`);
    }
  }
  for (const state of Object.keys(totals.route_link_state_counts)) {
    if (Number(artifact.counts?.route_link_state_counts?.[state] || 0) !== totals.route_link_state_counts[state]) {
      issues.push(`counts.route_link_state_counts.${state} expected ${totals.route_link_state_counts[state]}, found ${artifact.counts?.route_link_state_counts?.[state]}`);
    }
  }
}

function sumCountFields(value, fields, context) {
  let total = 0;
  for (const field of fields) {
    const count = Number(value?.[field] || 0);
    if (!Number.isInteger(count) || count < 0) issues.push(`${context}.${field} must be a non-negative integer`);
    total += count;
  }
  return total;
}

function walkNoForbiddenFields(value, context, pathParts = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkNoForbiddenFields(item, context, [...pathParts, String(index)]));
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, item] of Object.entries(value)) {
    const itemPath = [...pathParts, key].join('.');
    if (forbiddenFieldNames.has(key)) issues.push(`${context}.${itemPath}: forbidden field ${key}`);
    walkNoForbiddenFields(item, context, [...pathParts, key]);
  }
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

function readCachedFile(absoluteFile) {
  if (!fileCache.has(absoluteFile)) {
    fileCache.set(absoluteFile, fs.readFileSync(absoluteFile, 'utf8'));
  }
  return fileCache.get(absoluteFile);
}

function hasHtmlId(html, anchorId) {
  const escaped = escapeRegex(anchorId);
  return new RegExp(`\\sid=["']${escaped}["']`).test(html);
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}
