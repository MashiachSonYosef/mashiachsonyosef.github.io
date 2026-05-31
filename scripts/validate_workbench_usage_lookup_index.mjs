#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const lookupIndexPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/usage-lookup-index.json');
const artifact = readJson(lookupIndexPath);
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
if (artifact.artifact_type !== 'workbench_usage_navigation_lookup_index') {
  issues.push('artifact_type must be workbench_usage_navigation_lookup_index');
}
if (!String(artifact.policy || '').includes('usage-navigation')) issues.push('policy must identify usage-navigation');
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
validateCounts();
validateCollections();
validateOccurrences();
validateIndexTotals('token_keys', artifact.token_keys);
validateIndexTotals('clusters', artifact.clusters);
validateIndexTotals('works', artifact.works);
validateIndexTotals('routes', artifact.routes);
walkNoForbiddenFields(artifact, lookupIndexPath);

if (issues.length) {
  console.error(`Workbench usage lookup index validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Workbench usage lookup index validation passed. Occurrences: ${artifact.counts.occurrence_refs}. Works: ${artifact.counts.works}.`);

function validateCounts() {
  for (const field of ['rows', 'occurrence_refs', 'token_keys', 'clusters', 'works', 'route_ids']) {
    const value = Number(artifact.counts?.[field]);
    if (!Number.isInteger(value) || value < 0) issues.push(`counts.${field} must be a non-negative integer`);
  }
  if (Number(artifact.counts?.rows || 0) !== Number(artifact.counts?.occurrence_refs || 0)) {
    issues.push('counts.rows must equal counts.occurrence_refs');
  }
  const statusTotal = sumCountFields(artifact.counts?.status_counts, ['supported', 'candidate', 'weak'], 'counts.status_counts');
  if (statusTotal !== Number(artifact.counts?.rows || 0)) issues.push('counts.status_counts must sum to counts.rows');
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
}

function validateCollections() {
  for (const [countField, field] of [
    ['token_keys', 'token_keys'],
    ['clusters', 'clusters'],
    ['works', 'works'],
    ['route_ids', 'routes'],
  ]) {
    if (!Array.isArray(artifact[field])) {
      issues.push(`${field} must be an array`);
      continue;
    }
    if (Number(artifact.counts?.[countField] || 0) !== artifact[field].length) {
      issues.push(`counts.${countField} expected ${artifact[field].length}, found ${artifact.counts?.[countField]}`);
    }
  }
  if (!Array.isArray(artifact.occurrence_refs)) issues.push('occurrence_refs must be an array');
  else if (Number(artifact.counts?.occurrence_refs || 0) !== artifact.occurrence_refs.length) {
    issues.push(`counts.occurrence_refs expected ${artifact.occurrence_refs.length}, found ${artifact.counts?.occurrence_refs}`);
  }
}

function validateOccurrences() {
  const occurrenceIds = new Set();
  for (const [index, occurrence] of (artifact.occurrence_refs || []).entries()) {
    validateOccurrence(occurrence, `occurrence_refs[${index}]`);
    if (occurrence.occurrence_id) {
      if (occurrenceIds.has(occurrence.occurrence_id)) issues.push(`duplicate occurrence_id ${occurrence.occurrence_id}`);
      occurrenceIds.add(occurrence.occurrence_id);
    }
  }
  for (const [field, entries] of Object.entries({
    token_keys: artifact.token_keys || [],
    clusters: artifact.clusters || [],
    works: artifact.works || [],
    routes: artifact.routes || [],
  })) {
    for (const [index, entry] of entries.entries()) {
      for (const occurrenceId of entry.occurrence_ids || []) {
        if (!occurrenceIds.has(occurrenceId)) issues.push(`${field}[${index}].occurrence_ids contains unknown ${occurrenceId}`);
      }
    }
  }
}

function validateOccurrence(occurrence, context) {
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
    'work_id',
    'work_title',
    'work_slug',
    'unit_id',
    'version_title',
    'version_source',
    'license',
    'license_url',
  ]) {
    if (!String(occurrence?.[field] || '').trim()) issues.push(`${context}.${field} must be present`);
  }
  if (!allowedStatuses.has(occurrence.status)) issues.push(`${context}.status must be supported/candidate/weak`);
  const rawScore = Number(occurrence.raw_score);
  if (!Number.isFinite(rawScore) || rawScore < 0 || rawScore > 100) issues.push(`${context}.raw_score must be 0-100`);
  if (!allowedRouteStates.has(occurrence.route_link_state)) issues.push(`${context}.route_link_state is invalid`);
  if (!allowedNavigationLabels.has(occurrence.navigation_label)) issues.push(`${context}.navigation_label is invalid`);
  if (!/^https?:\/\//.test(String(occurrence.source_href || ''))) issues.push(`${context}.source_href must be http(s)`);
  if (!/^https?:\/\//.test(String(occurrence.version_source || ''))) issues.push(`${context}.version_source must be http(s)`);
  if (!/^https?:\/\//.test(String(occurrence.license_url || ''))) issues.push(`${context}.license_url must be http(s)`);
  validateWorkAnchor(occurrence.work_anchor_href, context);
  if (!Array.isArray(occurrence.route_ids)) issues.push(`${context}.route_ids must be an array`);
}

function validateIndexTotals(field, entries = []) {
  let rows = 0;
  for (const [index, entry] of entries.entries()) {
    const context = `${field}[${index}]`;
    rows += validateIndexEntry(entry, context);
  }
  const expectedRows = field === 'routes'
    ? entries.reduce((sum, entry) => sum + Number(entry.counts?.rows || 0), 0)
    : Number(artifact.counts?.rows || 0);
  if (field !== 'routes' && rows !== expectedRows) {
    issues.push(`${field} counts expected ${expectedRows}, found ${rows}`);
  }
}

function validateIndexEntry(entry, context) {
  const rows = Number(entry.counts?.rows || 0);
  if (!Number.isInteger(rows) || rows <= 0) issues.push(`${context}.counts.rows must be a positive integer`);
  const statusTotal = sumCountFields(entry.counts?.status_counts, ['supported', 'candidate', 'weak'], `${context}.counts.status_counts`);
  if (statusTotal !== rows) issues.push(`${context}.counts.status_counts must sum to rows`);
  const routeStateTotal = sumCountFields(
    entry.counts?.route_link_state_counts,
    ['route_linked_observed_usage', 'observed_usage_only'],
    `${context}.counts.route_link_state_counts`,
  );
  if (routeStateTotal !== rows) issues.push(`${context}.counts.route_link_state_counts must sum to rows`);
  for (const field of ['cluster_ids', 'work_slugs', 'route_ids', 'occurrence_ids']) {
    if (!Array.isArray(entry[field])) issues.push(`${context}.${field} must be an array`);
  }
  if (Array.isArray(entry.occurrence_ids) && entry.occurrence_ids.length !== rows) {
    issues.push(`${context}.occurrence_ids length must equal rows`);
  }
  return rows;
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
