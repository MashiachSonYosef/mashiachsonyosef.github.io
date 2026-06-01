#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/usage-selected-occurrence-navigation-index.json');
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
if (artifact.artifact_type !== 'workbench_usage_selected_occurrence_navigation_index') {
  issues.push('artifact_type must be workbench_usage_selected_occurrence_navigation_index');
}
if (!String(artifact.policy || '').includes('Selected occurrence navigation index')) {
  issues.push('policy must identify selected occurrence navigation index');
}
if (artifact.authority_policy?.usage_navigation_only !== true) issues.push('authority_policy.usage_navigation_only must be true');
if (artifact.authority_policy?.observed_usage_only !== true) issues.push('authority_policy.observed_usage_only must be true');
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

const rows = Array.isArray(artifact.navigation_rows) ? artifact.navigation_rows : [];
if (!rows.length) issues.push('navigation_rows must be non-empty');
validateCounts(rows);
for (const [index, row] of rows.entries()) validateNavigationRow(`navigation_rows[${index}]`, row);
for (const check of artifact.checks || []) {
  if (check.status !== 'passed') issues.push(`check ${check.id || '(unknown)'} must pass`);
}
walkNoForbiddenFields(artifact, artifactPath);

if (issues.length) {
  console.error(`Workbench usage selected occurrence navigation index validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Validated usage selected occurrence navigation index ${artifactPath}: rows ${rows.length}; source refs ${artifact.counts.unique_source_refs}`);

function validateCounts(rowsToCheck) {
  if (Number(artifact.counts?.rows || 0) !== rowsToCheck.length) issues.push('rows count must equal navigation_rows length');
  if (Number(artifact.counts?.rows || 0) <= 0) issues.push('rows must be positive');
  if (Number(artifact.counts?.unique_source_refs || 0) <= 1) issues.push('unique_source_refs must show diversity');
  if (Number(artifact.counts?.unique_work_anchors || 0) <= 1) issues.push('unique_work_anchors must show diversity');
  if (Number(artifact.counts?.unique_works || 0) <= 1) issues.push('unique_works must show diversity');
  if (Number(artifact.counts?.usage_frames || 0) <= 0) issues.push('usage_frames must be positive');
  if (Number(artifact.counts?.cluster_ids || 0) <= 0) issues.push('cluster_ids must be positive');
  if (Number(artifact.counts?.unique_route_ids || 0) <= 0) issues.push('unique_route_ids must be positive');
  if (Number(artifact.counts?.provenance_buckets || 0) <= 0) issues.push('provenance_buckets must be positive');
  if (Number(artifact.counts?.unique_licenses || 0) <= 0) issues.push('unique_licenses must be positive');
  if (Number(artifact.counts?.unique_license_urls || 0) <= 0) issues.push('unique_license_urls must be positive');
  if (Number(artifact.counts?.unique_version_titles || 0) <= 0) issues.push('unique_version_titles must be positive');
  if (Number(artifact.counts?.unique_version_sources || 0) <= 0) issues.push('unique_version_sources must be positive');
  if (Number(artifact.counts?.rows_with_source_link || 0) !== Number(artifact.counts?.rows || 0)) issues.push('rows_with_source_link must equal rows');
  if (Number(artifact.counts?.rows_with_work_anchor || 0) !== Number(artifact.counts?.rows || 0)) issues.push('rows_with_work_anchor must equal rows');
  if (Number(artifact.counts?.rows_with_hebrew_context || 0) !== Number(artifact.counts?.rows || 0)) {
    issues.push('rows_with_hebrew_context must equal rows');
  }
  if (Number(artifact.counts?.rows_with_focus_marker || 0) !== Number(artifact.counts?.rows || 0)) {
    issues.push('rows_with_focus_marker must equal rows');
  }
  if (Number(artifact.counts?.rows_with_provenance || 0) !== Number(artifact.counts?.rows || 0)) issues.push('rows_with_provenance must equal rows');
  if (Number(artifact.counts?.collision_member_rows || 0) <= 0) issues.push('collision_member_rows must be positive');
  if (Number(artifact.counts?.collision_memberships || 0) < Number(artifact.counts?.collision_member_rows || 0)) {
    issues.push('collision_memberships must be at least collision_member_rows');
  }
  if (Number(artifact.counts?.observed_usage_only_rows || 0) !== Number(artifact.counts?.rows || 0)) {
    issues.push('observed_usage_only_rows must equal rows');
  }
  if (Number(artifact.counts?.reader_facing_rows || 0) !== 0) issues.push('reader_facing_rows must be 0');
  if (Number(artifact.counts?.route_payload_field_hits || 0) !== 0) issues.push('route_payload_field_hits must be 0');

  const statusCounts = { supported: 0, candidate: 0, weak: 0 };
  let collisionMemberRows = 0;
  let collisionMemberships = 0;
  for (const row of rowsToCheck) {
    if (Object.hasOwn(statusCounts, row.status)) statusCounts[row.status] += 1;
    if (row.navigation_flags?.collision_member) collisionMemberRows += 1;
    collisionMemberships += (row.collision_ids || []).length;
  }
  for (const [status, count] of Object.entries(statusCounts)) {
    if (Number(artifact.counts?.status_counts?.[status] || 0) !== count) issues.push(`status count mismatch for ${status}`);
  }
  if (sumStatusCounts(statusCounts) !== rowsToCheck.length) issues.push('status counts must sum to navigation rows');
  if (Number(artifact.counts?.collision_member_rows || 0) !== collisionMemberRows) {
    issues.push('collision_member_rows must match row flags');
  }
  if (Number(artifact.counts?.collision_memberships || 0) !== collisionMemberships) {
    issues.push('collision_memberships must match row collision IDs');
  }
}

function validateNavigationRow(context, row) {
  requireFields(row, [
    'occurrence_id',
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
    'related_route_ids',
    'provenance_id',
    'version_title',
    'version_source',
    'license',
    'license_url',
    'collision_ids',
    'collision_kinds',
    'collision_keys',
    'navigation_flags',
  ], context);
  if (!allowedStatuses.has(row.status)) issues.push(`${context}: invalid status ${row.status}`);
  if (!String(row.source_href || '').startsWith('http')) issues.push(`${context}: source_href must be absolute URL`);
  if (!String(row.work_anchor_href || '').includes('#')) issues.push(`${context}: work_anchor_href must include anchor`);
  if (!String(row.license_url || '').startsWith('http')) issues.push(`${context}: license_url must be absolute URL`);
  if (!String(row.version_source || '').startsWith('http')) issues.push(`${context}: version_source must be absolute URL`);
  if (!Array.isArray(row.related_route_ids) || !row.related_route_ids.length) issues.push(`${context}: related_route_ids must be non-empty array`);
  if (!Array.isArray(row.collision_ids)) issues.push(`${context}: collision_ids must be an array`);
  if (!Array.isArray(row.collision_kinds)) issues.push(`${context}: collision_kinds must be an array`);
  if (!Array.isArray(row.collision_keys)) issues.push(`${context}: collision_keys must be an array`);
  if (!hasHebrew(row.token_surface)) issues.push(`${context}: token_surface must include Hebrew`);
  if (!hasHebrew(row.context_focus_marked)) issues.push(`${context}: context_focus_marked must include Hebrew`);
  if (!String(row.context_focus_marked || '').includes('[') || !String(row.context_focus_marked || '').includes(']')) {
    issues.push(`${context}: context_focus_marked must include bracketed focus marker`);
  }
  if (hasMojibake(row.token_surface) || hasMojibake(row.context_focus_marked)) {
    issues.push(`${context}: token or context contains mojibake-like characters`);
  }
  if (row.navigation_flags?.observed_usage_only !== true) issues.push(`${context}: navigation_flags.observed_usage_only must be true`);
  if (row.navigation_flags?.reader_facing !== false) issues.push(`${context}: navigation_flags.reader_facing must be false`);
  if (row.navigation_flags?.has_source_link !== true) issues.push(`${context}: navigation_flags.has_source_link must be true`);
  if (row.navigation_flags?.has_work_anchor !== true) issues.push(`${context}: navigation_flags.has_work_anchor must be true`);
  if (row.navigation_flags?.has_hebrew_context !== true) issues.push(`${context}: navigation_flags.has_hebrew_context must be true`);
  if (row.navigation_flags?.has_focus_marker !== true) issues.push(`${context}: navigation_flags.has_focus_marker must be true`);
  if (row.navigation_flags?.has_provenance !== true) issues.push(`${context}: navigation_flags.has_provenance must be true`);
  if (row.navigation_flags?.has_route_ids !== true) issues.push(`${context}: navigation_flags.has_route_ids must be true`);
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
