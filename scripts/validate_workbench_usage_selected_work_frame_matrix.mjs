#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/usage-selected-work-frame-matrix.json');
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
if (artifact.artifact_type !== 'workbench_usage_selected_work_frame_matrix') {
  issues.push('artifact_type must be workbench_usage_selected_work_frame_matrix');
}
if (!String(artifact.policy || '').includes('Audit-only selected work/frame matrix')) {
  issues.push('policy must identify audit-only selected work/frame matrix');
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

const matrixRows = Array.isArray(artifact.matrix_rows) ? artifact.matrix_rows : [];
if (!matrixRows.length) issues.push('matrix_rows must be non-empty');
validateCounts(matrixRows);
for (const [index, row] of matrixRows.entries()) validateMatrixRow(`matrix_rows[${index}]`, row);
for (const check of artifact.checks || []) {
  if (check.status !== 'passed') issues.push(`check ${check.id || '(unknown)'} must pass`);
}
walkNoForbiddenFields(artifact, artifactPath);

if (issues.length) {
  console.error(`Workbench usage selected work/frame matrix validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Validated usage selected work/frame matrix ${artifactPath}: matrix rows ${matrixRows.length}; selected rows ${artifact.counts.selected_rows}`);

function validateCounts(rows) {
  if (Number(artifact.counts?.matrix_rows || 0) !== rows.length) issues.push('matrix_rows count must equal matrix_rows length');
  if (Number(artifact.counts?.selected_rows || 0) <= 0) issues.push('selected_rows must be positive');
  if (Number(artifact.counts?.works || 0) <= 1) issues.push('works must show selected coverage across multiple works');
  if (Number(artifact.counts?.frames || 0) <= 1) issues.push('frames must show selected coverage across multiple frames');
  if (Number(artifact.counts?.unique_route_ids || 0) <= 0) issues.push('unique_route_ids must be positive');
  if (Number(artifact.counts?.source_ref_bucket_total || 0) < rows.length) {
    issues.push('source_ref_bucket_total must cover each matrix row');
  }
  if (Number(artifact.counts?.sample_occurrences || 0) < rows.length) issues.push('sample_occurrences must cover each matrix row');
  if (Number(artifact.counts?.reader_facing_rows || 0) !== 0) issues.push('reader_facing_rows must be 0');
  if (Number(artifact.counts?.route_payload_field_hits || 0) !== 0) issues.push('route_payload_field_hits must be 0');

  const statusCounts = { supported: 0, candidate: 0, weak: 0 };
  let selectedRows = 0;
  let sampleRows = 0;
  for (const row of rows) {
    selectedRows += Number(row.selected_occurrence_rows || 0);
    sampleRows += (row.sample_occurrences || []).length;
    for (const status of Object.keys(statusCounts)) statusCounts[status] += Number(row.status_counts?.[status] || 0);
  }
  if (Number(artifact.counts?.selected_rows || 0) !== selectedRows) issues.push('selected_rows must match matrix row totals');
  if (Number(artifact.counts?.sample_occurrences || 0) !== sampleRows) issues.push('sample_occurrences must match matrix samples');
  for (const [status, count] of Object.entries(statusCounts)) {
    if (Number(artifact.counts?.status_counts?.[status] || 0) !== count) issues.push(`status count mismatch for ${status}`);
  }
  if (Object.values(statusCounts).reduce((sum, count) => sum + count, 0) !== selectedRows) {
    issues.push('status counts must sum to selected_rows');
  }
}

function validateMatrixRow(context, row) {
  requireFields(row, [
    'bucket_id',
    'work_slug',
    'work_title',
    'category',
    'usage_frame_label',
    'frame_id',
    'cluster_ids',
    'selected_occurrence_rows',
    'status_counts',
    'unique_source_refs',
    'unique_work_anchors',
    'route_ids',
    'license_keys',
    'raw_score_summary',
    'matrix_flags',
    'sample_occurrences',
  ], context);
  if (!Array.isArray(row.cluster_ids) || !row.cluster_ids.length) issues.push(`${context}: cluster_ids must be non-empty array`);
  if (Number(row.selected_occurrence_rows || 0) <= 0) issues.push(`${context}: selected_occurrence_rows must be positive`);
  if (sumStatusCounts(row.status_counts) !== Number(row.selected_occurrence_rows || 0)) {
    issues.push(`${context}: status_counts must sum to selected_occurrence_rows`);
  }
  if (Number(row.unique_source_refs || 0) <= 0) issues.push(`${context}: unique_source_refs must be positive`);
  if (Number(row.unique_work_anchors || 0) <= 0) issues.push(`${context}: unique_work_anchors must be positive`);
  if (!Array.isArray(row.route_ids) || !row.route_ids.length) issues.push(`${context}: route_ids must be non-empty array`);
  if (!Array.isArray(row.license_keys) || !row.license_keys.length) issues.push(`${context}: license_keys must be non-empty array`);
  if (Number(row.raw_score_summary?.min || 0) <= 0) issues.push(`${context}: raw_score_summary.min must be positive`);
  if (Number(row.raw_score_summary?.max || 0) < Number(row.raw_score_summary?.min || 0)) {
    issues.push(`${context}: raw_score_summary.max must be >= min`);
  }
  if (Number(row.raw_score_summary?.average || 0) <= 0) issues.push(`${context}: raw_score_summary.average must be positive`);
  if (row.matrix_flags?.observed_usage_only !== true) issues.push(`${context}: matrix_flags.observed_usage_only must be true`);
  if (row.matrix_flags?.reader_facing !== false) issues.push(`${context}: matrix_flags.reader_facing must be false`);
  if (row.matrix_flags?.audit_only !== true) issues.push(`${context}: matrix_flags.audit_only must be true`);
  if (row.matrix_flags?.has_route_ids !== true) issues.push(`${context}: matrix_flags.has_route_ids must be true`);
  if (!Array.isArray(row.sample_occurrences) || !row.sample_occurrences.length) {
    issues.push(`${context}: sample_occurrences must be non-empty array`);
  }
  for (const [sampleIndex, sample] of (row.sample_occurrences || []).entries()) validateSample(`${context}.sample_occurrences[${sampleIndex}]`, sample);
}

function validateSample(context, sample) {
  requireFields(sample, [
    'occurrence_id',
    'source_ref',
    'source_href',
    'work_anchor_href',
    'status',
    'raw_score',
    'context_focus_marked',
    'route_ids',
    'license',
    'license_url',
    'sample_flags',
  ], context);
  if (!allowedStatuses.has(sample.status)) issues.push(`${context}: invalid status ${sample.status}`);
  if (!String(sample.source_href || '').startsWith('http')) issues.push(`${context}: source_href must be absolute URL`);
  if (!String(sample.work_anchor_href || '').includes('#')) issues.push(`${context}: work_anchor_href must include anchor`);
  if (!String(sample.license_url || '').startsWith('http')) issues.push(`${context}: license_url must be absolute URL`);
  if (!Array.isArray(sample.route_ids) || !sample.route_ids.length) issues.push(`${context}: route_ids must be non-empty array`);
  if (!hasHebrew(sample.context_focus_marked)) issues.push(`${context}: context_focus_marked must include Hebrew`);
  if (hasMojibake(sample.context_focus_marked)) issues.push(`${context}: context_focus_marked contains mojibake-like characters`);
  if (!String(sample.context_focus_marked || '').includes('[') || !String(sample.context_focus_marked || '').includes(']')) {
    issues.push(`${context}: context_focus_marked must include bracketed focus marker`);
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
