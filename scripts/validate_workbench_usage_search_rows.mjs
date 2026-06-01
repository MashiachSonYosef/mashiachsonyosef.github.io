#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/usage-search-rows.json');
const artifact = JSON.parse(fs.readFileSync(path.join(root, artifactPath), 'utf8'));
const issues = [];
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
  'winner',
  'route_payload',
  'route_payloads',
  'route_links',
]);
const allowedStatuses = new Set(['supported', 'candidate', 'weak']);

if (artifact.schema_version !== 1) issues.push('schema_version must be 1');
if (artifact.artifact_type !== 'workbench_usage_navigation_search_rows') {
  issues.push('artifact_type must be workbench_usage_navigation_search_rows');
}
if (!String(artifact.policy || '').includes('usage-navigation')) {
  issues.push('policy must identify the usage-navigation lane');
}
if (artifact.authority_policy?.usage_navigation_only !== true) issues.push('authority_policy.usage_navigation_only must be true');
if (artifact.authority_policy?.ranks_routes !== false) issues.push('authority_policy.ranks_routes must be false');
if (artifact.authority_policy?.selects_visible_result !== false) issues.push('authority_policy.selects_visible_result must be false');
if (artifact.authority_policy?.ambiguous_rows_reader_facing !== false) {
  issues.push('authority_policy.ambiguous_rows_reader_facing must be false');
}
if (artifact.authority_policy?.route_payloads_copied !== false) {
  issues.push('authority_policy.route_payloads_copied must be false');
}
if (artifact.quality?.status !== 'passed') issues.push('quality.status must be passed');
if (Number(artifact.quality?.failed_count || 0) !== 0) issues.push('quality.failed_count must be 0');
if (Number(artifact.counts?.route_payload_field_hits || 0) !== 0) issues.push('route_payload_field_hits must be 0');

const rows = Array.isArray(artifact.rows) ? artifact.rows : [];
if (!rows.length) issues.push('rows must be non-empty');
if (Number(artifact.counts?.rows || 0) !== rows.length) issues.push('counts.rows must equal rows length');
if (Number(artifact.counts?.works || 0) <= 0) issues.push('counts.works must be positive');
if (Number(artifact.counts?.categories || 0) <= 0) issues.push('counts.categories must be positive');
if (Number(artifact.counts?.clusters || 0) <= 0) issues.push('counts.clusters must be positive');

const statusCounts = { supported: 0, candidate: 0, weak: 0 };
const workSlugs = new Set();
const categories = new Set();
const clusters = new Set();
const routeIds = new Set();
for (const [index, row] of rows.entries()) {
  const context = `rows[${index}]`;
  requireFields(row, [
    'occurrence_id',
    'candidate_id',
    'token_key',
    'token_surface',
    'token_normalized',
    'focus_surface',
    'focus_normalized',
    'cluster_id',
    'usage_frame_label',
    'status',
    'raw_score',
    'navigation_label',
    'route_link_state',
    'source_ref',
    'source_href',
    'work_anchor_href',
    'work_id',
    'work_title',
    'work_slug',
    'category',
    'unit_id',
    'version_title',
    'version_source',
    'license',
    'license_url',
    'phrase_hebrew',
    'context_focus_marked',
    'phrase_tokens',
  ], context);
  if (!allowedStatuses.has(row.status)) issues.push(`${context}: invalid status ${row.status}`);
  if (!Number.isFinite(row.raw_score) || row.raw_score < 0 || row.raw_score > 100) {
    issues.push(`${context}: raw_score must be 0..100`);
  }
  if (!Array.isArray(row.route_ids)) issues.push(`${context}: route_ids must be an array`);
  if (!Array.isArray(row.phrase_tokens) || !row.phrase_tokens.some((token) => token.focus_marked === true)) {
    issues.push(`${context}: phrase_tokens must include focus_marked true`);
  }
  if (!String(row.context_focus_marked || '').includes('[') || !String(row.context_focus_marked || '').includes(']')) {
    issues.push(`${context}: context_focus_marked must visibly mark the focus token`);
  }
  if (!String(row.source_href || '').startsWith('http')) issues.push(`${context}: source_href must be an absolute web URL`);
  if (!String(row.work_anchor_href || '').includes('#')) issues.push(`${context}: work_anchor_href must include a local unit anchor`);
  if (allowedStatuses.has(row.status)) statusCounts[row.status] += 1;
  if (row.work_slug) workSlugs.add(row.work_slug);
  if (row.category) categories.add(row.category);
  if (row.cluster_id) clusters.add(row.cluster_id);
  for (const routeId of row.route_ids || []) {
    if (!String(routeId || '').trim()) issues.push(`${context}: route_ids cannot include blank values`);
    else routeIds.add(routeId);
  }
}

if (statusCounts.supported !== Number(artifact.counts?.status_counts?.supported || 0)) {
  issues.push('supported status count mismatch');
}
if (statusCounts.candidate !== Number(artifact.counts?.status_counts?.candidate || 0)) {
  issues.push('candidate status count mismatch');
}
if (statusCounts.weak !== Number(artifact.counts?.status_counts?.weak || 0)) {
  issues.push('weak status count mismatch');
}
if (workSlugs.size !== Number(artifact.counts?.works || 0)) issues.push('work count mismatch');
if (categories.size !== Number(artifact.counts?.categories || 0)) issues.push('category count mismatch');
if (clusters.size !== Number(artifact.counts?.clusters || 0)) issues.push('cluster count mismatch');
if (routeIds.size !== Number(artifact.counts?.route_ids || 0)) issues.push('route_id count mismatch');

for (const check of artifact.checks || []) {
  if (check.status !== 'passed') issues.push(`check ${check.id || '(unknown)'} must pass`);
}
walkNoForbiddenFields(artifact, artifactPath);

if (issues.length) {
  console.error(`Workbench usage search rows validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Validated usage search rows ${artifactPath}: rows ${rows.length}; works ${workSlugs.size}`);

function requireFields(row, fields, context) {
  for (const field of fields) {
    if (row?.[field] === undefined || row?.[field] === null || row?.[field] === '') {
      issues.push(`${context}: missing ${field}`);
    }
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

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}
