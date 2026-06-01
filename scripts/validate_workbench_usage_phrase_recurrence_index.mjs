#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/usage-phrase-recurrence-index.json');
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
if (artifact.artifact_type !== 'workbench_usage_phrase_recurrence_index') {
  issues.push('artifact_type must be workbench_usage_phrase_recurrence_index');
}
if (!String(artifact.policy || '').includes('Phrase recurrence index')) issues.push('policy must identify phrase recurrence index');
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

const groups = Array.isArray(artifact.phrase_groups) ? artifact.phrase_groups : [];
if (!groups.length) issues.push('phrase_groups must be non-empty');
if (Number(artifact.counts?.recurring_phrase_groups || 0) !== groups.length) {
  issues.push('counts.recurring_phrase_groups must equal phrase_groups length');
}
if (Number(artifact.counts?.ngram_instances || 0) <= 0) issues.push('ngram_instances must be positive');
if (Number(artifact.counts?.phrase_groups_all || 0) < groups.length) {
  issues.push('phrase_groups_all cannot be less than recurring groups');
}
if (Number(artifact.counts?.max_occurrences_per_phrase_group || 0) < 2) {
  issues.push('max_occurrences_per_phrase_group must be at least 2');
}

let maxRows = 0;
const occurrenceIdsInRecurringGroups = new Set();
for (const [index, group] of groups.entries()) {
  validateGroup(`phrase_groups[${index}]`, group);
  maxRows = Math.max(maxRows, Number(group.counts?.rows || 0));
  for (const occurrenceId of group.occurrence_ids || []) occurrenceIdsInRecurringGroups.add(occurrenceId);
}

if (maxRows !== Number(artifact.counts?.max_occurrences_per_phrase_group || 0)) {
  issues.push('max_occurrences_per_phrase_group mismatch');
}
if (occurrenceIdsInRecurringGroups.size !== Number(artifact.counts?.rows_with_recurring_phrase_groups || 0)) {
  issues.push('rows_with_recurring_phrase_groups mismatch');
}
for (const check of artifact.checks || []) {
  if (check.status !== 'passed') issues.push(`check ${check.id || '(unknown)'} must pass`);
}
walkNoForbiddenFields(artifact, artifactPath);

if (issues.length) {
  console.error(`Workbench usage phrase recurrence index validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Validated usage phrase recurrence index ${artifactPath}: groups ${groups.length}; rows ${artifact.counts.rows}`);

function validateGroup(context, group) {
  requireFields(group, [
    'phrase_key',
    'phrase_normalized',
    'phrase_hebrew',
    'phrase_hebrew_focus_marked',
    'token_count',
    'focus_offset',
    'counts',
    'works',
    'categories',
    'route_ids',
    'occurrence_ids',
    'samples',
  ], context);
  const rows = Number(group.counts?.rows || 0);
  if (!Number.isInteger(rows) || rows < Number(artifact.inputs?.min_occurrences || 2)) {
    issues.push(`${context}: counts.rows must meet min_occurrences`);
  }
  if (!String(group.phrase_hebrew_focus_marked || '').includes('[') || !String(group.phrase_hebrew_focus_marked || '').includes(']')) {
    issues.push(`${context}: phrase_hebrew_focus_marked must mark focus`);
  }
  const tokenCount = Number(group.token_count || 0);
  const focusOffset = Number(group.focus_offset);
  if (!Number.isInteger(tokenCount) || tokenCount < Number(artifact.inputs?.min_n || 2) || tokenCount > Number(artifact.inputs?.max_n || 5)) {
    issues.push(`${context}: token_count outside configured range`);
  }
  if (!Number.isInteger(focusOffset) || focusOffset < 0 || focusOffset >= tokenCount) {
    issues.push(`${context}: focus_offset outside token_count`);
  }
  const statusRows = Number(group.counts?.status_counts?.supported || 0)
    + Number(group.counts?.status_counts?.candidate || 0)
    + Number(group.counts?.status_counts?.weak || 0);
  if (statusRows !== rows) issues.push(`${context}: status counts must sum to rows`);
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
  if (!Array.isArray(group.occurrence_ids) || group.occurrence_ids.length !== rows) {
    issues.push(`${context}: occurrence_ids length must equal counts.rows`);
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
