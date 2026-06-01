#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/usage-context-signature-index.json');
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
if (artifact.artifact_type !== 'workbench_usage_context_signature_index') {
  issues.push('artifact_type must be workbench_usage_context_signature_index');
}
if (!String(artifact.policy || '').includes('Centered context-signature index')) {
  issues.push('policy must identify centered context-signature index');
}
if (artifact.authority_policy?.usage_navigation_only !== true) issues.push('authority_policy.usage_navigation_only must be true');
if (artifact.authority_policy?.ranks_routes !== false) issues.push('authority_policy.ranks_routes must be false');
if (artifact.authority_policy?.selects_visible_result !== false) issues.push('authority_policy.selects_visible_result must be false');
if (artifact.authority_policy?.ambiguous_rows_reader_facing !== false) {
  issues.push('authority_policy.ambiguous_rows_reader_facing must be false');
}
if (artifact.authority_policy?.route_payloads_copied !== false) issues.push('authority_policy.route_payloads_copied must be false');
if (artifact.quality?.status !== 'passed') issues.push('quality.status must be passed');
if (Number(artifact.quality?.failed_count || 0) !== 0) issues.push('quality.failed_count must be 0');
if (Number(artifact.counts?.route_payload_field_hits || 0) !== 0) issues.push('route_payload_field_hits must be 0');
if (Number(artifact.counts?.skipped_rows_without_focus || 0) !== 0) issues.push('skipped_rows_without_focus must be 0');
if (Number(artifact.counts?.rows_with_signatures || 0) !== Number(artifact.counts?.rows || 0)) {
  issues.push('rows_with_signatures must equal rows');
}

const radii = Array.isArray(artifact.radii) ? artifact.radii : [];
if (!radii.length) issues.push('radii must be non-empty');
for (const radius of radii) {
  if (!Number.isInteger(Number(radius)) || Number(radius) <= 0) issues.push(`invalid radius ${radius}`);
}

const groups = Array.isArray(artifact.groups) ? artifact.groups : [];
if (!groups.length) issues.push('groups must be non-empty');
if (Number(artifact.counts?.signature_groups_all || 0) !== groups.length) {
  issues.push('signature_groups_all must equal groups length');
}
if (Number(artifact.counts?.signature_windows || 0) <= Number(artifact.counts?.rows || 0)) {
  issues.push('signature_windows must exceed rows');
}
if (Number(artifact.counts?.recurring_signature_groups || 0) <= 0) issues.push('recurring_signature_groups must be positive');
if (Number(artifact.counts?.rows_with_recurring_signatures || 0) <= 0) {
  issues.push('rows_with_recurring_signatures must be positive');
}

let occurrenceSum = 0;
let recurringGroupCount = 0;
const recurringOccurrenceIds = new Set();
for (const [groupIndex, group] of groups.entries()) {
  validateGroup(`groups[${groupIndex}]`, group);
  const occurrences = Number(group.counts?.occurrences || 0);
  occurrenceSum += occurrences;
  if (occurrences > 1) {
    recurringGroupCount += 1;
    for (const occurrenceId of group.occurrence_ids || []) recurringOccurrenceIds.add(occurrenceId);
  }
}

if (occurrenceSum !== Number(artifact.counts?.signature_windows || 0)) {
  issues.push('group occurrences must sum to signature_windows');
}
if (recurringGroupCount !== Number(artifact.counts?.recurring_signature_groups || 0)) {
  issues.push('recurring group count must equal counts.recurring_signature_groups');
}
if (recurringOccurrenceIds.size !== Number(artifact.counts?.rows_with_recurring_signatures || 0)) {
  issues.push('recurring occurrence IDs must equal rows_with_recurring_signatures');
}
for (const check of artifact.checks || []) {
  if (check.status !== 'passed') issues.push(`check ${check.id || '(unknown)'} must pass`);
}
walkNoForbiddenFields(artifact, artifactPath);

if (issues.length) {
  console.error(`Workbench usage context signature index validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Validated usage context signature index ${artifactPath}: groups ${groups.length}; recurring ${artifact.counts.recurring_signature_groups}`);

function validateGroup(context, group) {
  requireFields(group, [
    'signature_id',
    'window_radius',
    'signature_key',
    'signature_display',
    'signature_parts',
    'counts',
    'works',
    'categories',
    'route_ids',
    'occurrence_ids',
    'samples',
  ], context);
  if (!String(group.signature_id || '').startsWith('usage-context-signature-')) {
    issues.push(`${context}: signature_id must use usage-context-signature prefix`);
  }
  if (!radii.includes(Number(group.window_radius))) issues.push(`${context}: window_radius must be listed in radii`);
  if (!String(group.signature_key || '').includes('[') || !String(group.signature_key || '').includes(']')) {
    issues.push(`${context}: signature_key must visibly mark the focus token`);
  }
  if (!Array.isArray(group.signature_parts) || group.signature_parts.length !== Number(group.window_radius) * 2 + 1) {
    issues.push(`${context}: signature_parts length must match radius`);
  }
  const occurrences = Number(group.counts?.occurrences || 0);
  if (!Number.isInteger(occurrences) || occurrences <= 0) issues.push(`${context}: occurrences must be positive`);
  const statusRows = Number(group.counts?.status_counts?.supported || 0)
    + Number(group.counts?.status_counts?.candidate || 0)
    + Number(group.counts?.status_counts?.weak || 0);
  if (statusRows !== occurrences) issues.push(`${context}: status counts must sum to occurrences`);
  for (const status of Object.keys(group.counts?.status_counts || {})) {
    if (!allowedStatuses.has(status)) issues.push(`${context}: invalid status key ${status}`);
  }
  if (!Array.isArray(group.works) || group.works.length !== Number(group.counts?.works || 0)) {
    issues.push(`${context}: works length must equal counts.works`);
  }
  if (!Array.isArray(group.categories) || group.categories.length !== Number(group.counts?.categories || 0)) {
    issues.push(`${context}: categories length must equal counts.categories`);
  }
  if (!Array.isArray(group.route_ids)) issues.push(`${context}: route_ids must be an array`);
  if (!Array.isArray(group.occurrence_ids) || group.occurrence_ids.length !== occurrences) {
    issues.push(`${context}: occurrence_ids length must equal occurrences`);
  }
  if (!Array.isArray(group.samples) || !group.samples.length) issues.push(`${context}: samples must be non-empty`);
  for (const [sampleIndex, sample] of (group.samples || []).entries()) validateSample(`${context}.samples[${sampleIndex}]`, sample);
}

function validateSample(context, sample) {
  requireFields(sample, [
    'occurrence_id',
    'source_ref',
    'source_href',
    'work_anchor_href',
    'work_title',
    'category',
    'status',
    'raw_score',
    'cluster_id',
    'usage_frame_label',
    'license',
    'license_url',
    'route_ids',
    'context_focus_marked',
    'signature_display',
  ], context);
  if (!allowedStatuses.has(sample.status)) issues.push(`${context}: invalid status ${sample.status}`);
  if (!String(sample.source_href || '').startsWith('http')) issues.push(`${context}: source_href must be an absolute web URL`);
  if (!String(sample.work_anchor_href || '').includes('#')) issues.push(`${context}: work_anchor_href must include a local unit anchor`);
  if (!String(sample.license_url || '').startsWith('http')) issues.push(`${context}: license_url must be an absolute URL`);
  if (!Array.isArray(sample.route_ids)) issues.push(`${context}: route_ids must be an array`);
  if (!String(sample.context_focus_marked || '').includes('[') || !String(sample.context_focus_marked || '').includes(']')) {
    issues.push(`${context}: context_focus_marked must visibly mark the focus token`);
  }
  if (!String(sample.signature_display || '').includes('[') || !String(sample.signature_display || '').includes(']')) {
    issues.push(`${context}: signature_display must visibly mark the focus token`);
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
