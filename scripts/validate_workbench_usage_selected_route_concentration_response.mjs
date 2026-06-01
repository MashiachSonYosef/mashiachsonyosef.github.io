#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/usage-selected-route-concentration-response.json');
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
if (artifact.artifact_type !== 'workbench_usage_selected_route_concentration_response') {
  issues.push('artifact_type must be workbench_usage_selected_route_concentration_response');
}
if (!String(artifact.policy || '').includes('Audit-only response packet')) {
  issues.push('policy must identify audit-only concentration response');
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
if (!['passed', 'pass_with_warnings'].includes(String(artifact.quality?.status || ''))) {
  issues.push('quality.status must be passed or pass_with_warnings');
}
if (Number(artifact.quality?.failed_count || 0) !== 0) issues.push('quality.failed_count must be 0');
if (Number(artifact.quality?.warning_count || 0) <= 0) issues.push('warning_count should preserve the route concentration warning');
if (Number(artifact.counts?.reader_facing_rows || 0) !== 0) issues.push('reader_facing_rows must be 0');
if (Number(artifact.counts?.route_payload_field_hits || 0) !== 0) issues.push('route_payload_field_hits must be 0');
if (Number(artifact.counts?.route_concentration_warning_visible || 0) !== 1) {
  issues.push('route_concentration_warning_visible must be 1');
}

const rows = Array.isArray(artifact.rows) ? artifact.rows : [];
if (!rows.length) issues.push('rows must be non-empty');
if (rows.length !== Number(artifact.counts?.selected_occurrence_refs || 0)) {
  issues.push('rows length must equal selected_occurrence_refs');
}
if (Number(artifact.counts?.route_id_buckets || 0) <= 0) issues.push('route_id_buckets must be positive');
if (Number(artifact.counts?.top_route_rows || 0) !== Number(artifact.counts?.selected_occurrence_refs || 0)) {
  issues.push('top_route_rows must equal selected_occurrence_refs for the known concentration warning');
}
if (Number(artifact.counts?.top_route_share_basis_points || 0) !== 10000) {
  issues.push('top_route_share_basis_points must be 10000 for the current selected concentration');
}
if (Number(artifact.counts?.unique_source_refs || 0) <= 1) issues.push('unique_source_refs must show diversity');
if (Number(artifact.counts?.unique_works || 0) <= 1) issues.push('unique_works must show diversity');
if (Number(artifact.counts?.rows_with_recurring_signatures || 0) <= 0) {
  issues.push('rows_with_recurring_signatures must be positive');
}
if (Number(artifact.counts?.missing_source_diversity_rows || 0) !== 0) {
  issues.push('missing_source_diversity_rows must be 0');
}

for (const [rowIndex, row] of rows.entries()) validateRow(`rows[${rowIndex}]`, row);
for (const check of artifact.checks || []) {
  if (check.status === 'failed') issues.push(`check ${check.id || '(unknown)'} must not fail`);
}
const warningChecks = (artifact.checks || []).filter((check) => check.status === 'warning');
if (!warningChecks.some((check) => check.id === 'route_concentration_warning_visible')) {
  issues.push('route_concentration_warning_visible check must remain warning');
}
walkNoForbiddenFields(artifact, artifactPath);

if (issues.length) {
  console.error(`Workbench usage selected route concentration response validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Validated usage selected route concentration response ${artifactPath}: rows ${rows.length}; route warning visible`);

function validateRow(context, row) {
  requireFields(row, [
    'occurrence_id',
    'source_ref',
    'source_href',
    'work_anchor_href',
    'work_title',
    'work_slug',
    'status',
    'raw_score',
    'cluster_id',
    'usage_frame_label',
    'license',
    'license_url',
    'route_ids',
    'route_concentration_flags',
    'source_diversity_flags',
    'signature_independence_flags',
  ], context);
  if (!allowedStatuses.has(row.status)) issues.push(`${context}: invalid status ${row.status}`);
  if (!String(row.source_href || '').startsWith('http')) issues.push(`${context}: source_href must be an absolute web URL`);
  if (!String(row.work_anchor_href || '').includes('#')) issues.push(`${context}: work_anchor_href must include a local unit anchor`);
  if (!String(row.license_url || '').startsWith('http')) issues.push(`${context}: license_url must be an absolute URL`);
  if (!Array.isArray(row.route_ids)) issues.push(`${context}: route_ids must be an array`);
  if (row.route_concentration_flags?.route_concentration_warning_visible !== true) {
    issues.push(`${context}: route concentration warning must be visible`);
  }
  if (row.route_concentration_flags?.observed_usage_only !== true) issues.push(`${context}: observed_usage_only must be true`);
  if (row.route_concentration_flags?.reader_facing !== false) issues.push(`${context}: reader_facing must be false`);
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

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}
