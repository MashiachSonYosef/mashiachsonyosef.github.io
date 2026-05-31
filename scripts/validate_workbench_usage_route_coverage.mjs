#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const routeCoveragePath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/usage-route-coverage.json');
const artifact = readJson(routeCoveragePath);
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
if (artifact.artifact_type !== 'workbench_usage_route_coverage_index') {
  issues.push('artifact_type must be workbench_usage_route_coverage_index');
}
if (!Array.isArray(artifact.routes)) issues.push('routes must be an array');

const totals = {
  routeRows: 0,
  routeLinks: 0,
};

for (const [index, route] of (artifact.routes || []).entries()) {
  validateRoute(route, `routes[${index}]`);
}
validateTotals();
walkNoForbiddenFields(artifact, routeCoveragePath);

if (issues.length) {
  console.error(`Workbench usage route coverage validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Workbench usage route coverage validation passed. Route IDs: ${artifact.routes.length}. Links: ${totals.routeLinks}.`);

function validateRoute(route, context) {
  for (const field of ['route_id', 'route_source', 'normalized', 'surface', 'route_family', 'route_type', 'display_section']) {
    if (!String(route?.[field] || '').trim()) issues.push(`${context}.${field} must be present`);
  }
  const rows = Number(route.counts?.rows || 0);
  if (!Number.isInteger(rows) || rows <= 0) issues.push(`${context}.counts.rows must be a positive integer`);
  totals.routeRows += rows;
  totals.routeLinks += rows;

  let statusTotal = 0;
  for (const status of allowedStatuses) {
    const count = Number(route.counts?.status_counts?.[status] || 0);
    if (!Number.isInteger(count) || count < 0) issues.push(`${context}.counts.status_counts.${status} must be non-negative integer`);
    statusTotal += count;
  }
  if (statusTotal !== rows) issues.push(`${context}.counts.status_counts must sum to rows`);

  const clusterCounts = route.counts?.cluster_counts || {};
  const clusterTotal = Object.values(clusterCounts).reduce((sum, value) => sum + Number(value || 0), 0);
  if (clusterTotal !== rows) issues.push(`${context}.counts.cluster_counts must sum to rows`);
  for (const [clusterId, count] of Object.entries(clusterCounts)) {
    if (!String(clusterId || '').trim()) issues.push(`${context}.counts.cluster_counts contains blank cluster id`);
    if (!Number.isInteger(Number(count)) || Number(count) < 0) {
      issues.push(`${context}.counts.cluster_counts.${clusterId} must be non-negative integer`);
    }
  }

  validateRouteSource(route.route_source, context);
  if (!Array.isArray(route.samples) || !route.samples.length) issues.push(`${context}.samples must be a non-empty array`);
  for (const [sampleIndex, sample] of (route.samples || []).entries()) {
    validateSample(sample, `${context}.samples[${sampleIndex}]`);
  }
}

function validateRouteSource(routeSource, context) {
  const cleanFile = cleanRelativePath(routeSource);
  const absoluteFile = path.resolve(root, cleanFile);
  if (!absoluteFile.startsWith(root + path.sep)) {
    issues.push(`${context}.route_source escapes workspace`);
    return;
  }
  if (!fs.existsSync(absoluteFile)) issues.push(`${context}.route_source file missing: ${cleanFile}`);
}

function validateSample(sample, context) {
  for (const field of ['occurrence_id', 'candidate_id', 'cluster_id', 'status', 'source_ref', 'source_href', 'work_anchor_href', 'phrase_hebrew']) {
    if (!String(sample?.[field] || '').trim()) issues.push(`${context}.${field} must be present`);
  }
  if (!allowedStatuses.has(sample.status)) issues.push(`${context}.status must be supported/candidate/weak`);
  const rawScore = Number(sample.raw_score);
  if (!Number.isFinite(rawScore) || rawScore < 0 || rawScore > 100) issues.push(`${context}.raw_score must be 0-100`);
  if (!/^https?:\/\//.test(String(sample.source_href || ''))) issues.push(`${context}.source_href must be http(s)`);
  validateWorkAnchor(sample.work_anchor_href, context);
  if (/[A-Za-z]{4,}/.test(String(sample.phrase_hebrew || ''))) {
    issues.push(`${context}.phrase_hebrew must not contain English words`);
  }
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
  if (Number(artifact.counts?.unique_route_ids || 0) !== (artifact.routes || []).length) {
    issues.push(`counts.unique_route_ids expected ${(artifact.routes || []).length}, found ${artifact.counts?.unique_route_ids}`);
  }
  if (Number(artifact.counts?.route_links || 0) !== totals.routeLinks) {
    issues.push(`counts.route_links expected ${totals.routeLinks}, found ${artifact.counts?.route_links}`);
  }
  if (Number(artifact.counts?.route_linked_rows || 0) > Number(artifact.counts?.rows || 0)) {
    issues.push('counts.route_linked_rows must not exceed counts.rows');
  }
  if (Number(artifact.counts?.route_linked_rows || 0) + Number(artifact.counts?.observed_only_rows || 0) !== Number(artifact.counts?.rows || 0)) {
    issues.push('route_linked_rows + observed_only_rows must equal rows');
  }
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
