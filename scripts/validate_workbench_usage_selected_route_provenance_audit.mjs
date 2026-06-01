#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/usage-selected-route-provenance-audit.json');
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
if (artifact.artifact_type !== 'workbench_usage_selected_route_provenance_audit') {
  issues.push('artifact_type must be workbench_usage_selected_route_provenance_audit');
}
if (!String(artifact.policy || '').includes('Audit-only selected route/provenance join')) {
  issues.push('policy must identify audit-only selected route/provenance join');
}
if (artifact.authority_policy?.usage_navigation_only !== true) issues.push('authority_policy.usage_navigation_only must be true');
if (artifact.authority_policy?.audit_only !== true) issues.push('authority_policy.audit_only must be true');
if (artifact.authority_policy?.reader_facing !== false) issues.push('authority_policy.reader_facing must be false');
if (artifact.authority_policy?.ranks_routes !== false) issues.push('authority_policy.ranks_routes must be false');
if (artifact.authority_policy?.selects_visible_result !== false) issues.push('authority_policy.selects_visible_result must be false');
if (artifact.authority_policy?.ambiguous_rows_reader_facing !== false) {
  issues.push('authority_policy.ambiguous_rows_reader_facing must be false');
}
if (artifact.authority_policy?.route_payloads_copied !== false) issues.push('authority_policy.route_payloads_copied must be false');
if (artifact.quality?.status !== 'passed') issues.push('quality.status must be passed');
if (Number(artifact.quality?.failed_count || 0) !== 0) issues.push('quality.failed_count must be 0');
if (Number(artifact.quality?.warning_count || 0) !== 0) issues.push('quality.warning_count must be 0');

const routeRows = Array.isArray(artifact.route_rows) ? artifact.route_rows : [];
validateCounts(routeRows);
for (const [index, row] of routeRows.entries()) validateRouteRow(`route_rows[${index}]`, row);
for (const check of artifact.checks || []) {
  if (check.status !== 'passed') issues.push(`check ${check.id || '(unknown)'} must pass`);
}
walkNoForbiddenFields(artifact, artifactPath);

if (issues.length) {
  console.error(`Workbench usage selected route/provenance audit validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Validated usage selected route/provenance audit ${artifactPath}: routes ${routeRows.length}; route links ${artifact.counts.selected_route_links}`);

function validateCounts(rows) {
  if (Number(artifact.counts?.route_rows || 0) !== rows.length) issues.push('route_rows count must equal route_rows length');
  if (Number(artifact.counts?.selected_route_links || 0) <= 0) issues.push('selected_route_links must be positive');
  if (Number(artifact.counts?.unique_route_ids || 0) !== rows.length) issues.push('unique_route_ids must equal route row count');
  if (Number(artifact.counts?.provenance_buckets || 0) <= 0) issues.push('provenance_buckets must be positive');
  if (Number(artifact.counts?.unique_works || 0) <= 1) issues.push('unique_works must show multiple works');
  if (Number(artifact.counts?.usage_frames || 0) <= 0) issues.push('usage_frames must be positive');
  if (Number(artifact.counts?.unresolved_route_rows || 0) !== 0) issues.push('unresolved_route_rows must be 0');
  if (Number(artifact.counts?.missing_provenance_rows || 0) !== 0) issues.push('missing_provenance_rows must be 0');
  if (Number(artifact.counts?.route_payload_copied_rows || 0) !== 0) issues.push('route_payload_copied_rows must be 0');
  if (Number(artifact.counts?.sample_occurrences || 0) !== Number(artifact.counts?.selected_route_links || 0)) {
    issues.push('sample_occurrences must equal selected_route_links');
  }
  if (Number(artifact.counts?.reader_facing_rows || 0) !== 0) issues.push('reader_facing_rows must be 0');
  if (Number(artifact.counts?.route_payload_field_hits || 0) !== 0) issues.push('route_payload_field_hits must be 0');

  const statusCounts = { supported: 0, candidate: 0, weak: 0 };
  let selectedRouteLinks = 0;
  let sampleRows = 0;
  for (const row of rows) {
    selectedRouteLinks += Number(row.selected_occurrence_rows || 0);
    sampleRows += (row.sample_occurrences || []).length;
    for (const status of Object.keys(statusCounts)) statusCounts[status] += Number(row.status_counts?.[status] || 0);
  }
  if (Number(artifact.counts?.selected_route_links || 0) !== selectedRouteLinks) {
    issues.push('selected_route_links must match route row totals');
  }
  if (Number(artifact.counts?.sample_occurrences || 0) !== sampleRows) {
    issues.push('sample_occurrences must match route samples');
  }
  for (const [status, count] of Object.entries(statusCounts)) {
    if (Number(artifact.counts?.status_counts?.[status] || 0) !== count) issues.push(`status count mismatch for ${status}`);
  }
  if (Object.values(statusCounts).reduce((sum, count) => sum + count, 0) !== selectedRouteLinks) {
    issues.push('status counts must sum to selected_route_links');
  }
}

function validateRouteRow(context, row) {
  requireFields(row, [
    'route_id',
    'route_identity',
    'route_resolution',
    'selected_occurrence_rows',
    'unique_source_refs',
    'unique_work_anchors',
    'unique_works',
    'cluster_ids',
    'usage_frames',
    'provenance_ids',
    'provenance_counts',
    'license_counts',
    'version_source_counts',
    'status_counts',
    'route_flags',
    'sample_occurrences',
  ], context);
  if (Number(row.selected_occurrence_rows || 0) <= 0) issues.push(`${context}: selected_occurrence_rows must be positive`);
  if (Number(row.unique_source_refs || 0) <= 0) issues.push(`${context}: unique_source_refs must be positive`);
  if (Number(row.unique_work_anchors || 0) <= 0) issues.push(`${context}: unique_work_anchors must be positive`);
  if (Number(row.unique_works || 0) <= 0) issues.push(`${context}: unique_works must be positive`);
  if (!Array.isArray(row.cluster_ids) || !row.cluster_ids.length) issues.push(`${context}: cluster_ids must be non-empty array`);
  if (!Array.isArray(row.usage_frames) || !row.usage_frames.length) issues.push(`${context}: usage_frames must be non-empty array`);
  if (!Array.isArray(row.provenance_ids) || !row.provenance_ids.length) issues.push(`${context}: provenance_ids must be non-empty array`);
  if (sumStatusCounts(row.status_counts) !== Number(row.selected_occurrence_rows || 0)) {
    issues.push(`${context}: status_counts must sum to selected_occurrence_rows`);
  }
  if (!row.route_identity?.route_source) issues.push(`${context}: route_identity.route_source must be present`);
  if (!row.route_identity?.route_type) issues.push(`${context}: route_identity.route_type must be present`);
  if (row.route_resolution?.resolved_by_route_coverage !== true) issues.push(`${context}: route must resolve by route coverage`);
  if (row.route_resolution?.resolved_by_route_link_check !== true) issues.push(`${context}: route must resolve by route link check`);
  if (row.route_resolution?.route_payload_copied !== false) issues.push(`${context}: route_resolution.route_payload_copied must be false`);
  if (row.route_resolution?.reader_facing !== false) issues.push(`${context}: route_resolution.reader_facing must be false`);
  if (row.route_resolution?.observed_usage_only !== true) issues.push(`${context}: route_resolution.observed_usage_only must be true`);
  if (row.route_flags?.observed_usage_only !== true) issues.push(`${context}: route_flags.observed_usage_only must be true`);
  if (row.route_flags?.reader_facing !== false) issues.push(`${context}: route_flags.reader_facing must be false`);
  if (row.route_flags?.audit_only !== true) issues.push(`${context}: route_flags.audit_only must be true`);
  if (row.route_flags?.route_payload_copied !== false) issues.push(`${context}: route_flags.route_payload_copied must be false`);
  if (row.route_flags?.route_resolved !== true) issues.push(`${context}: route_flags.route_resolved must be true`);
  if (!Array.isArray(row.sample_occurrences) || row.sample_occurrences.length !== Number(row.selected_occurrence_rows || 0)) {
    issues.push(`${context}: sample_occurrences must equal selected_occurrence_rows`);
  }
  for (const [sampleIndex, sample] of (row.sample_occurrences || []).entries()) {
    validateSample(`${context}.sample_occurrences[${sampleIndex}]`, sample);
  }
}

function validateSample(context, sample) {
  requireFields(sample, [
    'occurrence_id',
    'provenance_id',
    'token_key',
    'token_surface',
    'token_normalized',
    'focus_surface',
    'focus_normalized',
    'source_ref',
    'source_href',
    'work_anchor_href',
    'work_title',
    'work_slug',
    'status',
    'raw_score',
    'cluster_id',
    'usage_frame_label',
    'context_focus_marked',
    'version_title',
    'version_source',
    'license',
    'license_url',
    'sample_flags',
  ], context);
  if (!allowedStatuses.has(sample.status)) issues.push(`${context}: invalid status ${sample.status}`);
  if (!String(sample.source_href || '').startsWith('http')) issues.push(`${context}: source_href must be absolute URL`);
  if (!String(sample.work_anchor_href || '').includes('#')) issues.push(`${context}: work_anchor_href must include anchor`);
  if (!String(sample.version_source || '').startsWith('http')) issues.push(`${context}: version_source must be absolute URL`);
  if (!String(sample.license_url || '').startsWith('http')) issues.push(`${context}: license_url must be absolute URL`);
  if (!hasHebrew(sample.token_surface)) issues.push(`${context}: token_surface must include Hebrew`);
  if (!hasHebrew(sample.context_focus_marked)) issues.push(`${context}: context_focus_marked must include Hebrew`);
  if (!String(sample.context_focus_marked || '').includes('[') || !String(sample.context_focus_marked || '').includes(']')) {
    issues.push(`${context}: context_focus_marked must include bracketed focus marker`);
  }
  if (hasMojibake(sample.token_surface) || hasMojibake(sample.context_focus_marked)) {
    issues.push(`${context}: token or context contains mojibake-like characters`);
  }
  if (sample.sample_flags?.observed_usage_only !== true) issues.push(`${context}: sample_flags.observed_usage_only must be true`);
  if (sample.sample_flags?.reader_facing !== false) issues.push(`${context}: sample_flags.reader_facing must be false`);
  if (sample.sample_flags?.audit_only !== true) issues.push(`${context}: sample_flags.audit_only must be true`);
}

function sumStatusCounts(statusCounts) {
  return Object.values(statusCounts || {}).reduce((sum, count) => sum + Number(count || 0), 0);
}

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

function hasHebrew(value) {
  return /[\u0590-\u05ff]/.test(String(value || ''));
}

function hasMojibake(value) {
  return /[\u00d7\u00d6\ufffd]/.test(String(value || ''));
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}
