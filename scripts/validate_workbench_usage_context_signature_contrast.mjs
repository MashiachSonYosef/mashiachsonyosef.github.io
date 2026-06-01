#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/usage-context-signature-contrast.json');
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
if (artifact.artifact_type !== 'workbench_usage_context_signature_contrast') {
  issues.push('artifact_type must be workbench_usage_context_signature_contrast');
}
if (!String(artifact.policy || '').includes('Audit-only contrast packet')) {
  issues.push('policy must identify audit-only contrast packet');
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
if (Number(artifact.counts?.reader_facing_rows || 0) !== 0) issues.push('reader_facing_rows must be 0');
if (Number(artifact.counts?.route_payload_field_hits || 0) !== 0) issues.push('route_payload_field_hits must be 0');

const groups = Array.isArray(artifact.contrast_groups) ? artifact.contrast_groups : [];
if (!groups.length) issues.push('contrast_groups must be non-empty');
if (Number(artifact.counts?.cross_cluster_signature_groups || 0) !== groups.length) {
  issues.push('cross_cluster_signature_groups must equal contrast_groups length');
}
if (Number(artifact.counts?.signature_groups_all || 0) < Number(artifact.counts?.cross_cluster_signature_groups || 0)) {
  issues.push('signature_groups_all must be >= cross_cluster_signature_groups');
}
if (Number(artifact.counts?.recurring_signature_groups || 0) < Number(artifact.counts?.cross_cluster_signature_groups || 0)) {
  issues.push('recurring_signature_groups must be >= cross_cluster_signature_groups');
}

const occurrenceIds = new Set();
for (const [groupIndex, group] of groups.entries()) {
  validateGroup(`contrast_groups[${groupIndex}]`, group);
  for (const occurrenceId of group.occurrence_ids || []) occurrenceIds.add(occurrenceId);
}
if (occurrenceIds.size !== Number(artifact.counts?.cross_cluster_occurrence_refs || 0)) {
  issues.push('cross_cluster_occurrence_refs must equal unique occurrence IDs in groups');
}
for (const check of artifact.checks || []) {
  if (check.status !== 'passed') issues.push(`check ${check.id || '(unknown)'} must pass`);
}
walkNoForbiddenFields(artifact, artifactPath);

if (issues.length) {
  console.error(`Workbench usage context signature contrast validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Validated usage context signature contrast ${artifactPath}: groups ${groups.length}; occurrences ${artifact.counts.cross_cluster_occurrence_refs}`);

function validateGroup(context, group) {
  requireFields(group, [
    'signature_id',
    'window_radius',
    'signature_key',
    'signature_display',
    'counts',
    'route_ids',
    'occurrence_ids',
    'cluster_buckets',
  ], context);
  if (!String(group.signature_id || '').startsWith('usage-context-signature-')) {
    issues.push(`${context}: signature_id must use usage-context-signature prefix`);
  }
  if (!String(group.signature_key || '').includes('[') || !String(group.signature_key || '').includes(']')) {
    issues.push(`${context}: signature_key must visibly mark focus`);
  }
  if (!String(group.signature_display || '').includes('[') || !String(group.signature_display || '').includes(']')) {
    issues.push(`${context}: signature_display must visibly mark focus`);
  }
  if (Number(group.counts?.clusters || 0) <= 1) issues.push(`${context}: clusters must be greater than 1`);
  if (Number(group.counts?.occurrences || 0) <= 1) issues.push(`${context}: occurrences must be greater than 1`);
  if (!Array.isArray(group.route_ids)) issues.push(`${context}: route_ids must be an array`);
  if (!Array.isArray(group.occurrence_ids) || group.occurrence_ids.length !== Number(group.counts?.occurrences || 0)) {
    issues.push(`${context}: occurrence_ids length must equal counts.occurrences`);
  }
  const buckets = Array.isArray(group.cluster_buckets) ? group.cluster_buckets : [];
  if (buckets.length !== Number(group.counts?.clusters || 0)) issues.push(`${context}: cluster_buckets length must equal counts.clusters`);
  for (const [bucketIndex, bucket] of buckets.entries()) validateClusterBucket(`${context}.cluster_buckets[${bucketIndex}]`, bucket);
}

function validateClusterBucket(context, bucket) {
  requireFields(bucket, ['cluster_id', 'usage_frame_label', 'counts', 'samples'], context);
  if (Number(bucket.counts?.samples || 0) <= 0) issues.push(`${context}: samples count must be positive`);
  const samples = Array.isArray(bucket.samples) ? bucket.samples : [];
  if (!samples.length) issues.push(`${context}: samples must be non-empty`);
  for (const [sampleIndex, sample] of samples.entries()) validateSample(`${context}.samples[${sampleIndex}]`, sample);
}

function validateSample(context, sample) {
  requireFields(sample, [
    'occurrence_id',
    'source_ref',
    'source_href',
    'work_anchor_href',
    'work_title',
    'status',
    'raw_score',
    'license',
    'license_url',
    'context_focus_marked',
  ], context);
  if (!allowedStatuses.has(sample.status)) issues.push(`${context}: invalid status ${sample.status}`);
  if (!String(sample.source_href || '').startsWith('http')) issues.push(`${context}: source_href must be an absolute web URL`);
  if (!String(sample.work_anchor_href || '').includes('#')) issues.push(`${context}: work_anchor_href must include a local unit anchor`);
  if (!String(sample.license_url || '').startsWith('http')) issues.push(`${context}: license_url must be an absolute URL`);
  if (!String(sample.context_focus_marked || '').includes('[') || !String(sample.context_focus_marked || '').includes(']')) {
    issues.push(`${context}: context_focus_marked must visibly mark the focus token`);
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
