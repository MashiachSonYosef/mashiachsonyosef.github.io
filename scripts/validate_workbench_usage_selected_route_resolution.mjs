#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/usage-selected-route-resolution.json');
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
if (artifact.artifact_type !== 'workbench_usage_selected_route_resolution') {
  issues.push('artifact_type must be workbench_usage_selected_route_resolution');
}
if (!String(artifact.policy || '').includes('Audit-only selected route-ID resolution')) {
  issues.push('policy must identify audit-only selected route-ID resolution');
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

const routes = Array.isArray(artifact.routes) ? artifact.routes : [];
if (!routes.length) issues.push('routes must be non-empty');
validateCounts(routes);
for (const [routeIndex, route] of routes.entries()) validateRoute(`routes[${routeIndex}]`, route);
for (const check of artifact.checks || []) {
  if (check.status !== 'passed') issues.push(`check ${check.id || '(unknown)'} must pass`);
}
walkNoForbiddenFields(artifact, artifactPath);

if (issues.length) {
  console.error(`Workbench usage selected route resolution validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Validated usage selected route resolution ${artifactPath}: routes ${routes.length}; selected links ${artifact.counts.selected_route_links}`);

function validateCounts(routeRows) {
  const selectedRows = routeRows.reduce((sum, route) => sum + Number(route.counts?.selected_cards || 0), 0);
  if (Number(artifact.counts?.selected_cards || 0) <= 0) issues.push('selected_cards must be positive');
  if (Number(artifact.counts?.selected_route_links || 0) !== selectedRows) {
    issues.push('selected_route_links must equal summed route selected_cards');
  }
  if (Number(artifact.counts?.selected_route_links || 0) !== Number(artifact.counts?.selected_cards || 0)) {
    issues.push('selected_route_links must equal selected_cards for current selected rows');
  }
  if (Number(artifact.counts?.route_id_buckets || 0) !== routeRows.length) issues.push('route_id_buckets must equal routes length');
  if (Number(artifact.counts?.resolved_route_ids || 0) !== routeRows.length) issues.push('resolved_route_ids must equal routes length');
  if (Number(artifact.counts?.unresolved_route_ids || 0) !== 0) issues.push('unresolved_route_ids must be 0');
  if (artifact.counts?.route_link_check_status !== 'passed') issues.push('route_link_check_status must be passed');
  if (Number(artifact.counts?.route_link_check_unresolved_links || 0) !== 0) {
    issues.push('route_link_check_unresolved_links must be 0');
  }
  if (Number(artifact.counts?.route_link_check_metadata_mismatches || 0) !== 0) {
    issues.push('route_link_check_metadata_mismatches must be 0');
  }
  if (Number(artifact.counts?.reader_facing_rows || 0) !== 0) issues.push('reader_facing_rows must be 0');
  if (Number(artifact.counts?.route_payload_copied_rows || 0) !== 0) issues.push('route_payload_copied_rows must be 0');
  if (Number(artifact.counts?.route_payload_field_hits || 0) !== 0) issues.push('route_payload_field_hits must be 0');
}

function validateRoute(context, route) {
  requireFields(route, [
    'route_id',
    'route_source',
    'normalized',
    'surface',
    'route_family',
    'route_type',
    'display_section',
    'route_raw_score',
    'resolution',
    'counts',
    'samples',
  ], context);
  if (route.resolution?.resolved_by_route_coverage !== true) issues.push(`${context}: resolved_by_route_coverage must be true`);
  if (route.resolution?.resolved_by_route_link_check !== true) issues.push(`${context}: resolved_by_route_link_check must be true`);
  if (Number(route.resolution?.route_link_check_rows || 0) <= 0) issues.push(`${context}: route_link_check_rows must be positive`);
  if (route.resolution?.route_payload_copied !== false) issues.push(`${context}: route_payload_copied must be false`);
  if (route.resolution?.reader_facing !== false) issues.push(`${context}: reader_facing must be false`);
  if (route.resolution?.observed_usage_only !== true) issues.push(`${context}: observed_usage_only must be true`);
  if (Number(route.counts?.selected_cards || 0) <= 0) issues.push(`${context}: selected_cards must be positive`);
  const statusRows = Number(route.counts?.status_counts?.supported || 0)
    + Number(route.counts?.status_counts?.candidate || 0)
    + Number(route.counts?.status_counts?.weak || 0);
  if (statusRows !== Number(route.counts?.selected_cards || 0)) {
    issues.push(`${context}: status counts must sum to selected_cards`);
  }
  const clusterRows = Object.values(route.counts?.cluster_counts || {}).reduce((sum, value) => sum + Number(value || 0), 0);
  if (clusterRows !== Number(route.counts?.selected_cards || 0)) {
    issues.push(`${context}: cluster counts must sum to selected_cards`);
  }
  if (!Array.isArray(route.samples) || !route.samples.length) issues.push(`${context}: samples must be non-empty`);
  for (const [sampleIndex, sample] of (route.samples || []).entries()) validateSample(`${context}.samples[${sampleIndex}]`, sample);
}

function validateSample(context, sample) {
  requireFields(sample, [
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
  ], context);
  if (!String(sample.source_href || '').startsWith('http')) issues.push(`${context}: source_href must be absolute URL`);
  if (!String(sample.work_anchor_href || '').includes('#')) issues.push(`${context}: work_anchor_href must include anchor`);
  if (!String(sample.license_url || '').startsWith('http')) issues.push(`${context}: license_url must be absolute URL`);
  if (!allowedStatuses.has(sample.status)) issues.push(`${context}: invalid status ${sample.status}`);
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
