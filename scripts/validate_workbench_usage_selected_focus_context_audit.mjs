#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/usage-selected-focus-context-audit.json');
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
if (artifact.artifact_type !== 'workbench_usage_selected_focus_context_audit') {
  issues.push('artifact_type must be workbench_usage_selected_focus_context_audit');
}
if (!String(artifact.policy || '').includes('Audit-only focus/context marker check')) {
  issues.push('policy must identify audit-only focus/context marker check');
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

const rows = Array.isArray(artifact.rows) ? artifact.rows : [];
if (!rows.length) issues.push('rows must be non-empty');
validateCounts(rows);
for (const [index, row] of rows.entries()) validateRow(`rows[${index}]`, row);
for (const check of artifact.checks || []) {
  if (check.id === 'repeated_focus_context_visible') {
    if (!['passed', 'warning'].includes(String(check.status || ''))) {
      issues.push('repeated_focus_context_visible check must pass or warn');
    }
  } else if (check.status !== 'passed') {
    issues.push(`check ${check.id || '(unknown)'} must pass`);
  }
}
walkNoForbiddenFields(artifact, artifactPath);

if (issues.length) {
  console.error(`Workbench usage selected focus context audit validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Validated usage selected focus context audit ${artifactPath}: rows ${rows.length}; repeated focus rows ${artifact.counts.repeated_focus_context_rows}`);

function validateCounts(auditRows) {
  if (Number(artifact.counts?.rows || 0) !== auditRows.length) issues.push('counts.rows must equal rows length');
  if (Number(artifact.counts?.selected_cards || 0) !== auditRows.length) {
    issues.push('selected_cards must equal rows length');
  }
  if (Number(artifact.counts?.focus_marker_rows || 0) !== auditRows.length) {
    issues.push('focus_marker_rows must equal rows length');
  }
  if (Number(artifact.counts?.focus_marker_mismatch_rows || 0) !== 0) {
    issues.push('focus_marker_mismatch_rows must be 0');
  }
  if (Number(artifact.counts?.missing_hebrew_context_rows || 0) !== 0) {
    issues.push('missing_hebrew_context_rows must be 0');
  }
  if (Number(artifact.counts?.total_context_tokens || 0) <= auditRows.length) {
    issues.push('total_context_tokens must exceed row count');
  }
  if (Number(artifact.counts?.max_context_tokens || 0) <= 0) {
    issues.push('max_context_tokens must be positive');
  }
  if (Number(artifact.counts?.reader_facing_rows || 0) !== 0) issues.push('reader_facing_rows must be 0');
  if (Number(artifact.counts?.route_payload_field_hits || 0) !== 0) {
    issues.push('route_payload_field_hits must be 0');
  }

  let markerRows = 0;
  let mismatchRows = 0;
  let repeatedRows = 0;
  let missingHebrewRows = 0;
  let totalTokens = 0;
  let maxTokens = 0;
  for (const row of auditRows) {
    if (Number(row.counts?.focus_markers || 0) === 1) markerRows += 1;
    if (row.focus_context_flags?.marked_focus_matches_normalized !== true) mismatchRows += 1;
    if (row.focus_context_flags?.repeated_focus_in_context === true) repeatedRows += 1;
    if (row.focus_context_flags?.has_hebrew_context !== true) missingHebrewRows += 1;
    totalTokens += Number(row.counts?.context_tokens || 0);
    maxTokens = Math.max(maxTokens, Number(row.counts?.context_tokens || 0));
  }
  if (Number(artifact.counts?.focus_marker_rows || 0) !== markerRows) {
    issues.push('focus_marker_rows must match row marker counts');
  }
  if (Number(artifact.counts?.focus_marker_mismatch_rows || 0) !== mismatchRows) {
    issues.push('focus_marker_mismatch_rows must match row flags');
  }
  if (Number(artifact.counts?.repeated_focus_context_rows || 0) !== repeatedRows) {
    issues.push('repeated_focus_context_rows must match row flags');
  }
  if (Number(artifact.counts?.missing_hebrew_context_rows || 0) !== missingHebrewRows) {
    issues.push('missing_hebrew_context_rows must match row flags');
  }
  if (Number(artifact.counts?.total_context_tokens || 0) !== totalTokens) {
    issues.push('total_context_tokens must match rows');
  }
  if (Number(artifact.counts?.max_context_tokens || 0) !== maxTokens) {
    issues.push('max_context_tokens must match rows');
  }
}

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
    'focus_surface',
    'focus_normalized',
    'normalized_focus_key',
    'marked_focus_surface',
    'marked_focus_normalized',
    'context_focus_marked',
    'route_ids',
    'license',
    'license_url',
    'counts',
    'focus_context_flags',
  ], context);
  if (!allowedStatuses.has(row.status)) issues.push(`${context}: invalid status ${row.status}`);
  if (!String(row.source_href || '').startsWith('http')) issues.push(`${context}: source_href must be absolute web URL`);
  if (!String(row.work_anchor_href || '').includes('#')) issues.push(`${context}: work_anchor_href must include an anchor`);
  if (!String(row.license_url || '').startsWith('http')) issues.push(`${context}: license_url must be absolute URL`);
  if (!Array.isArray(row.route_ids) || !row.route_ids.length) issues.push(`${context}: route_ids must be non-empty array`);
  if (!hasHebrew(row.focus_surface)) issues.push(`${context}: focus_surface must include Hebrew`);
  if (!hasHebrew(row.focus_normalized)) issues.push(`${context}: focus_normalized must include Hebrew`);
  if (!hasHebrew(row.marked_focus_surface)) issues.push(`${context}: marked_focus_surface must include Hebrew`);
  if (!hasHebrew(row.context_focus_marked)) issues.push(`${context}: context_focus_marked must include Hebrew`);
  if (hasMojibake(`${row.focus_surface} ${row.focus_normalized} ${row.marked_focus_surface} ${row.marked_focus_normalized} ${row.context_focus_marked}`)) {
    issues.push(`${context}: token/context fields contain mojibake-like characters`);
  }
  if (!String(row.context_focus_marked || '').includes('[') || !String(row.context_focus_marked || '').includes(']')) {
    issues.push(`${context}: context_focus_marked must include bracketed focus marker`);
  }
  if (Number(row.counts?.focus_markers || 0) !== 1) issues.push(`${context}: counts.focus_markers must be 1`);
  if (Number(row.counts?.context_tokens || 0) <= 0) issues.push(`${context}: counts.context_tokens must be positive`);
  if (Number(row.counts?.focus_token_index ?? -1) < 0) issues.push(`${context}: counts.focus_token_index must be non-negative`);
  if (Number(row.counts?.normalized_focus_occurrences || 0) <= 0) {
    issues.push(`${context}: counts.normalized_focus_occurrences must be positive`);
  }
  if (row.normalized_focus_key !== row.marked_focus_normalized) {
    issues.push(`${context}: normalized_focus_key must equal marked_focus_normalized`);
  }
  if (row.focus_context_flags?.single_focus_marker !== true) {
    issues.push(`${context}: focus_context_flags.single_focus_marker must be true`);
  }
  if (row.focus_context_flags?.marked_focus_matches_normalized !== true) {
    issues.push(`${context}: focus_context_flags.marked_focus_matches_normalized must be true`);
  }
  if (typeof row.focus_context_flags?.repeated_focus_in_context !== 'boolean') {
    issues.push(`${context}: repeated_focus_in_context must be boolean`);
  }
  if (row.focus_context_flags?.has_hebrew_context !== true) {
    issues.push(`${context}: focus_context_flags.has_hebrew_context must be true`);
  }
  if (row.focus_context_flags?.observed_usage_only !== true) {
    issues.push(`${context}: focus_context_flags.observed_usage_only must be true`);
  }
  if (row.focus_context_flags?.reader_facing !== false) {
    issues.push(`${context}: focus_context_flags.reader_facing must be false`);
  }
  if (row.focus_context_flags?.audit_only !== true) {
    issues.push(`${context}: focus_context_flags.audit_only must be true`);
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

function hasHebrew(value) {
  return /[\u0590-\u05ff]/.test(String(value || ''));
}

function hasMojibake(value) {
  return /[\u00d7\u00d6\ufffd]/.test(String(value || ''));
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}
