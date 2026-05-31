#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sampleIndexPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/usage-sample-index.json');
const artifact = readJson(sampleIndexPath);
const issues = [];
const fileCache = new Map();
const allowedStatuses = new Set(['supported', 'candidate', 'weak']);
const allowedRouteStates = new Set(['route_linked_observed_usage', 'observed_usage_only']);
const allowedNavigationLabels = new Set(['route-linked observed usage', 'observed usage only']);
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
if (artifact.artifact_type !== 'workbench_usage_navigation_sample_index') {
  issues.push('artifact_type must be workbench_usage_navigation_sample_index');
}
if (!String(artifact.policy || '').includes('usage-navigation')) {
  issues.push('policy must identify usage-navigation');
}
if (artifact.reader_facing_policy?.ambiguous_rows_reader_facing !== false) {
  issues.push('reader_facing_policy.ambiguous_rows_reader_facing must be false');
}
if (artifact.authority_policy?.usage_navigation_only !== true) {
  issues.push('authority_policy.usage_navigation_only must be true');
}
if (artifact.authority_policy?.ranks_routes !== false) issues.push('authority_policy.ranks_routes must be false');
if (artifact.authority_policy?.selects_visible_result !== false) {
  issues.push('authority_policy.selects_visible_result must be false');
}
if (!Array.isArray(artifact.clusters)) issues.push('clusters must be an array');
validateCounts();
validateStatusSamples();
for (const [index, cluster] of (artifact.clusters || []).entries()) {
  validateCluster(cluster, `clusters[${index}]`);
}
walkNoForbiddenFields(artifact, sampleIndexPath);

if (issues.length) {
  console.error(`Workbench usage sample index validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Workbench usage sample index validation passed. Samples: ${artifact.counts.sample_rows}. Clusters: ${artifact.counts.clusters}.`);

function validateCounts() {
  for (const field of ['rows', 'sample_rows', 'clusters']) {
    const value = Number(artifact.counts?.[field]);
    if (!Number.isInteger(value) || value < 0) issues.push(`counts.${field} must be a non-negative integer`);
  }
  const statusTotal = sumCountFields(artifact.counts?.status_counts, ['supported', 'candidate', 'weak'], 'counts.status_counts');
  if (statusTotal !== Number(artifact.counts?.rows || 0)) {
    issues.push('counts.status_counts must sum to counts.rows');
  }
  const routeStateTotal = sumCountFields(
    artifact.counts?.route_link_state_counts,
    ['route_linked_observed_usage', 'observed_usage_only'],
    'counts.route_link_state_counts',
  );
  if (routeStateTotal !== Number(artifact.counts?.rows || 0)) {
    issues.push('counts.route_link_state_counts must sum to counts.rows');
  }
  for (const field of ['ambiguous', 'blocked']) {
    const value = Number(artifact.counts?.audit_only_counts?.[field]);
    if (!Number.isInteger(value) || value < 0) issues.push(`counts.audit_only_counts.${field} must be a non-negative integer`);
  }
  if (Number(artifact.counts?.clusters || 0) !== (artifact.clusters || []).length) {
    issues.push(`counts.clusters expected ${(artifact.clusters || []).length}, found ${artifact.counts?.clusters}`);
  }
}

function validateStatusSamples() {
  for (const status of allowedStatuses) {
    const samples = artifact.status_samples?.[status];
    if (!Array.isArray(samples)) {
      issues.push(`status_samples.${status} must be an array`);
      continue;
    }
    for (const [index, sample] of samples.entries()) validateSample(sample, `status_samples.${status}[${index}]`, status);
  }
}

function validateCluster(cluster, context) {
  if (!String(cluster.cluster_id || '').trim()) issues.push(`${context}.cluster_id must be present`);
  if (!String(cluster.frame_label || '').trim()) issues.push(`${context}.frame_label must be present`);
  if (!Array.isArray(cluster.route_ids)) issues.push(`${context}.route_ids must be an array`);
  if (!Array.isArray(cluster.samples)) issues.push(`${context}.samples must be an array`);
  const rows = Number(cluster.counts?.rows || 0);
  if (!Number.isInteger(rows) || rows <= 0) issues.push(`${context}.counts.rows must be a positive integer`);
  const statusTotal = sumCountFields(cluster.counts?.status_counts, ['supported', 'candidate', 'weak'], `${context}.counts.status_counts`);
  if (statusTotal !== rows) issues.push(`${context}.counts.status_counts must sum to rows`);
  const routeStateTotal = sumCountFields(
    cluster.counts?.route_link_state_counts,
    ['route_linked_observed_usage', 'observed_usage_only'],
    `${context}.counts.route_link_state_counts`,
  );
  if (routeStateTotal !== rows) issues.push(`${context}.counts.route_link_state_counts must sum to rows`);
  for (const status of allowedStatuses) {
    const samples = cluster.samples_by_status?.[status];
    if (!Array.isArray(samples)) {
      issues.push(`${context}.samples_by_status.${status} must be an array`);
      continue;
    }
    for (const [index, sample] of samples.entries()) {
      validateSample(sample, `${context}.samples_by_status.${status}[${index}]`, status);
    }
  }
  for (const [index, sample] of (cluster.samples || []).entries()) {
    validateSample(sample, `${context}.samples[${index}]`);
  }
}

function validateSample(sample, context, expectedStatus = null) {
  for (const field of [
    'occurrence_id',
    'candidate_id',
    'token_key',
    'cluster_id',
    'token_normalized',
    'focus_normalized',
    'usage_frame_label',
    'status',
    'navigation_label',
    'route_link_state',
    'source_ref',
    'source_href',
    'work_anchor_href',
    'context_hebrew',
    'context_focus_marked',
  ]) {
    if (!String(sample?.[field] || '').trim()) issues.push(`${context}.${field} must be present`);
  }
  if (!allowedStatuses.has(sample.status)) issues.push(`${context}.status must be supported/candidate/weak`);
  if (expectedStatus && sample.status !== expectedStatus) issues.push(`${context}.status must match ${expectedStatus}`);
  const rawScore = Number(sample.raw_score);
  if (!Number.isFinite(rawScore) || rawScore < 0 || rawScore > 100) issues.push(`${context}.raw_score must be 0-100`);
  if (!allowedRouteStates.has(sample.route_link_state)) issues.push(`${context}.route_link_state is invalid`);
  if (!allowedNavigationLabels.has(sample.navigation_label)) issues.push(`${context}.navigation_label is invalid`);
  if (!/^https?:\/\//.test(String(sample.source_href || ''))) issues.push(`${context}.source_href must be http(s)`);
  if (!String(sample.work_anchor_href || '').includes('#')) issues.push(`${context}.work_anchor_href must include a local anchor`);
  validateWorkAnchor(sample.work_anchor_href, context);
  if (!Array.isArray(sample.route_ids)) issues.push(`${context}.route_ids must be an array`);
  if (!Array.isArray(sample.phrase_tokens) || !sample.phrase_tokens.length) issues.push(`${context}.phrase_tokens must be a non-empty array`);
  if ((sample.phrase_tokens || []).filter((token) => token.role === 'focus-token').length !== 1) {
    issues.push(`${context}.phrase_tokens must have exactly one focus-token`);
  }
  if (!String(sample.context_focus_marked || '').includes('[') || !String(sample.context_focus_marked || '').includes(']')) {
    issues.push(`${context}.context_focus_marked must bracket the focus token`);
  }
  if (hasEnglishWords(sample.context_hebrew)) issues.push(`${context}.context_hebrew must not contain English words`);
  if (hasEnglishWords(sample.context_focus_marked)) issues.push(`${context}.context_focus_marked must not contain English words`);
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

function hasEnglishWords(value) {
  return /[A-Za-z]{4,}/.test(String(value || ''));
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
