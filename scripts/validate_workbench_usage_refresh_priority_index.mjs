#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/usage-refresh-priority-index.json');
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
  'hebrew',
  'source_text',
  'text',
  'route_payload',
  'route_payloads',
  'route_links',
]);
const allowedStatuses = new Set(['known_usage_refresh_candidate', 'review_only_not_promoted']);

if (artifact.schema_version !== 1) issues.push('schema_version must be 1');
if (artifact.artifact_type !== 'workbench_usage_refresh_priority_index') {
  issues.push('artifact_type must be workbench_usage_refresh_priority_index');
}
if (!String(artifact.policy || '').includes('Refresh-priority control index')) {
  issues.push('policy must identify refresh-priority control index');
}
if (artifact.authority_policy?.usage_navigation_only !== true) issues.push('authority_policy.usage_navigation_only must be true');
if (artifact.authority_policy?.ranks_routes !== false) issues.push('authority_policy.ranks_routes must be false');
if (artifact.authority_policy?.selects_visible_result !== false) issues.push('authority_policy.selects_visible_result must be false');
if (artifact.authority_policy?.ambiguous_rows_reader_facing !== false) {
  issues.push('authority_policy.ambiguous_rows_reader_facing must be false');
}
if (artifact.authority_policy?.route_payloads_copied !== false) issues.push('authority_policy.route_payloads_copied must be false');
if (artifact.authority_policy?.broad_target_expansion !== false) issues.push('authority_policy.broad_target_expansion must be false');
if (artifact.authority_policy?.source_text_read !== false) issues.push('authority_policy.source_text_read must be false');
if (artifact.quality?.status !== 'passed') issues.push('quality.status must be passed');
if (Number(artifact.quality?.failed_count || 0) !== 0) issues.push('quality.failed_count must be 0');
if (Number(artifact.counts?.route_payload_field_hits || 0) !== 0) issues.push('route_payload_field_hits must be 0');
if (Number(artifact.counts?.promoted_run_targets || 0) !== 0) issues.push('promoted_run_targets must be 0');

const rows = Array.isArray(artifact.rows) ? artifact.rows : [];
if (Number(artifact.counts?.pending_refresh_files || 0) !== rows.length) {
  issues.push('pending_refresh_files must equal rows length');
}
const known = rows.filter((row) => row.refresh_status === 'known_usage_refresh_candidate').length;
const reviewOnly = rows.filter((row) => row.refresh_status === 'review_only_not_promoted').length;
if (known !== Number(artifact.counts?.known_usage_refresh_candidates || 0)) {
  issues.push('known_usage_refresh_candidates count mismatch');
}
if (reviewOnly !== Number(artifact.counts?.review_only_not_promoted || 0)) {
  issues.push('review_only_not_promoted count mismatch');
}
if (Number(artifact.counts?.blocked_broad_refresh_files || 0) !== rows.length) {
  issues.push('blocked_broad_refresh_files must equal rows length');
}

for (const [index, row] of rows.entries()) {
  const context = `rows[${index}]`;
  requireFields(row, [
    'source_file',
    'source_slug',
    'category_hint',
    'modified_at',
    'created_at',
    'bytes',
    'current_usage_rows',
    'current_supported_rows',
    'current_candidate_rows',
    'current_weak_rows',
    'current_clusters',
    'route_ids',
    'refresh_status',
    'promotion_status',
    'reason',
  ], context);
  if (!allowedStatuses.has(row.refresh_status)) issues.push(`${context}: invalid refresh_status ${row.refresh_status}`);
  if (row.promotion_status !== 'not_promoted') issues.push(`${context}: promotion_status must be not_promoted`);
  if (!String(row.source_file || '').startsWith('data/sources/') || !String(row.source_file || '').endsWith('.json')) {
    issues.push(`${context}: source_file must be a data/sources JSON path`);
  }
  if (!Number.isInteger(Number(row.bytes)) || Number(row.bytes) <= 0) issues.push(`${context}: bytes must be positive`);
  for (const field of ['current_usage_rows', 'current_supported_rows', 'current_candidate_rows', 'current_weak_rows']) {
    const value = Number(row[field]);
    if (!Number.isInteger(value) || value < 0) issues.push(`${context}: ${field} must be a non-negative integer`);
  }
  if (!Array.isArray(row.current_clusters)) issues.push(`${context}: current_clusters must be an array`);
  if (!Array.isArray(row.route_ids)) issues.push(`${context}: route_ids must be an array`);
  if (row.refresh_status === 'review_only_not_promoted' && Number(row.current_usage_rows || 0) !== 0) {
    issues.push(`${context}: review-only rows must have current_usage_rows 0`);
  }
  if (row.refresh_status === 'known_usage_refresh_candidate' && Number(row.current_usage_rows || 0) <= 0) {
    issues.push(`${context}: known usage rows must have current_usage_rows positive`);
  }
}

for (const check of artifact.checks || []) {
  if (check.status !== 'passed') issues.push(`check ${check.id || '(unknown)'} must pass`);
}
walkNoForbiddenFields(artifact, artifactPath);

if (issues.length) {
  console.error(`Workbench usage refresh priority index validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Validated usage refresh priority index ${artifactPath}: pending ${rows.length}; promoted ${artifact.counts.promoted_run_targets}`);

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
