#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/usage-selected-signature-independence.json');
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
if (artifact.artifact_type !== 'workbench_usage_selected_signature_independence') {
  issues.push('artifact_type must be workbench_usage_selected_signature_independence');
}
if (!String(artifact.policy || '').includes('Selected-occurrence signature independence audit')) {
  issues.push('policy must identify selected-occurrence signature independence audit');
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
if (Number(artifact.counts?.missing_lookup_rows || 0) !== 0) issues.push('missing_lookup_rows must be 0');
if (Number(artifact.counts?.reader_facing_rows || 0) !== 0) issues.push('reader_facing_rows must be 0');
if (Number(artifact.counts?.route_payload_field_hits || 0) !== 0) issues.push('route_payload_field_hits must be 0');

const rows = Array.isArray(artifact.rows) ? artifact.rows : [];
if (!rows.length) issues.push('rows must be non-empty');
if (Number(artifact.counts?.selected_occurrence_refs || 0) !== rows.length) {
  issues.push('selected_occurrence_refs must equal rows length');
}

let membershipSum = 0;
let recurringMembershipSum = 0;
let crossClusterMembershipSum = 0;
let withRecurring = 0;
let withCrossCluster = 0;
let withoutRecurring = 0;
for (const [rowIndex, row] of rows.entries()) {
  validateRow(`rows[${rowIndex}]`, row);
  membershipSum += Number(row.counts?.signature_memberships || 0);
  recurringMembershipSum += Number(row.counts?.recurring_signature_memberships || 0);
  crossClusterMembershipSum += Number(row.counts?.cross_cluster_signature_memberships || 0);
  if (row.independence_flags?.has_recurring_signature) withRecurring += 1;
  else withoutRecurring += 1;
  if (row.independence_flags?.has_cross_cluster_signature) withCrossCluster += 1;
}
if (membershipSum !== Number(artifact.counts?.signature_memberships || 0)) {
  issues.push('row signature memberships must sum to counts.signature_memberships');
}
if (recurringMembershipSum !== Number(artifact.counts?.recurring_signature_memberships || 0)) {
  issues.push('row recurring memberships must sum to counts.recurring_signature_memberships');
}
if (crossClusterMembershipSum !== Number(artifact.counts?.cross_cluster_signature_memberships || 0)) {
  issues.push('row cross-cluster memberships must sum to counts.cross_cluster_signature_memberships');
}
if (withRecurring !== Number(artifact.counts?.occurrence_refs_with_recurring_signatures || 0)) {
  issues.push('occurrence_refs_with_recurring_signatures must match row flags');
}
if (withCrossCluster !== Number(artifact.counts?.occurrence_refs_with_cross_cluster_signatures || 0)) {
  issues.push('occurrence_refs_with_cross_cluster_signatures must match row flags');
}
if (withoutRecurring !== Number(artifact.counts?.occurrence_refs_without_recurring_signatures || 0)) {
  issues.push('occurrence_refs_without_recurring_signatures must match row flags');
}
for (const check of artifact.checks || []) {
  if (check.status === 'failed') issues.push(`check ${check.id || '(unknown)'} must not fail`);
}
walkNoForbiddenFields(artifact, artifactPath);

if (issues.length) {
  console.error(`Workbench usage selected signature independence validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Validated usage selected signature independence ${artifactPath}: rows ${rows.length}; recurring ${artifact.counts.occurrence_refs_with_recurring_signatures}`);

function validateRow(context, row) {
  requireFields(row, [
    'occurrence_id',
    'source_ref',
    'source_href',
    'work_anchor_href',
    'work_title',
    'token_key',
    'focus_surface',
    'focus_normalized',
    'status',
    'raw_score',
    'cluster_id',
    'usage_frame_label',
    'license',
    'license_url',
    'route_ids',
    'slice_ids',
    'context_focus_marked',
    'independence_flags',
    'counts',
    'recurring_signatures',
    'cross_cluster_signatures',
  ], context);
  if (!allowedStatuses.has(row.status)) issues.push(`${context}: invalid status ${row.status}`);
  if (!String(row.source_href || '').startsWith('http')) issues.push(`${context}: source_href must be an absolute web URL`);
  if (!String(row.work_anchor_href || '').includes('#')) issues.push(`${context}: work_anchor_href must include a local unit anchor`);
  if (!String(row.license_url || '').startsWith('http')) issues.push(`${context}: license_url must be an absolute URL`);
  if (!Array.isArray(row.route_ids)) issues.push(`${context}: route_ids must be an array`);
  if (!Array.isArray(row.slice_ids)) issues.push(`${context}: slice_ids must be an array`);
  if (!String(row.context_focus_marked || '').includes('[') || !String(row.context_focus_marked || '').includes(']')) {
    issues.push(`${context}: context_focus_marked must visibly mark the focus token`);
  }
  if (row.independence_flags?.observed_usage_only !== true) issues.push(`${context}: observed_usage_only must be true`);
  if (row.independence_flags?.reader_facing !== false) issues.push(`${context}: reader_facing must be false`);
  if (Number(row.counts?.signature_memberships || 0) <= 0) issues.push(`${context}: signature memberships must be positive`);
  if (Number(row.counts?.recurring_signature_memberships || 0) !== row.recurring_signatures.length) {
    issues.push(`${context}: recurring signature count must match compact signatures`);
  }
  if (Number(row.counts?.cross_cluster_signature_memberships || 0) !== row.cross_cluster_signatures.length) {
    issues.push(`${context}: cross-cluster signature count must match compact signatures`);
  }
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
