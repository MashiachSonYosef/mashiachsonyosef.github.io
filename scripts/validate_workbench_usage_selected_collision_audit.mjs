#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/usage-selected-collision-audit.json');
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
const allowedKinds = new Set(['source_ref', 'work_anchor']);
const allowedStatuses = new Set(['supported', 'candidate', 'weak']);

if (artifact.schema_version !== 1) issues.push('schema_version must be 1');
if (artifact.artifact_type !== 'workbench_usage_selected_collision_audit') {
  issues.push('artifact_type must be workbench_usage_selected_collision_audit');
}
if (!String(artifact.policy || '').includes('Audit-only selected source/work-anchor collision audit')) {
  issues.push('policy must identify audit-only selected collision audit');
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
if (artifact.quality?.status !== 'pass_with_warnings') issues.push('quality.status must be pass_with_warnings');
if (Number(artifact.quality?.failed_count || 0) !== 0) issues.push('quality.failed_count must be 0');
if (Number(artifact.quality?.warning_count || 0) !== 1) issues.push('quality.warning_count must be 1');

const rows = Array.isArray(artifact.collision_rows) ? artifact.collision_rows : [];
if (!rows.length) issues.push('collision_rows must be non-empty');
validateCounts(rows);
for (const [index, row] of rows.entries()) validateCollisionRow(`collision_rows[${index}]`, row);
for (const check of artifact.checks || []) {
  if (check.id === 'cross_frame_collisions_visible') {
    if (check.status !== 'warning') issues.push('cross_frame_collisions_visible must remain warning');
  } else if (check.status !== 'passed') {
    issues.push(`check ${check.id || '(unknown)'} must pass`);
  }
}
walkNoForbiddenFields(artifact, artifactPath);

if (issues.length) {
  console.error(`Workbench usage selected collision audit validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Validated usage selected collision audit ${artifactPath}: buckets ${rows.length}; cross-frame buckets ${artifact.counts.cross_frame_collision_buckets}`);

function validateCounts(collisionRows) {
  if (Number(artifact.counts?.collision_buckets || 0) !== collisionRows.length) {
    issues.push('collision_buckets must equal collision_rows length');
  }
  if (Number(artifact.counts?.collision_occurrence_rows || 0) <= 0) issues.push('collision_occurrence_rows must be positive');
  if (Number(artifact.counts?.duplicate_source_ref_buckets || 0) <= 0) issues.push('duplicate_source_ref_buckets must be positive');
  if (Number(artifact.counts?.duplicate_source_ref_rows || 0) <= 0) issues.push('duplicate_source_ref_rows must be positive');
  if (Number(artifact.counts?.duplicate_work_anchor_buckets || 0) <= 0) issues.push('duplicate_work_anchor_buckets must be positive');
  if (Number(artifact.counts?.duplicate_work_anchor_rows || 0) <= 0) issues.push('duplicate_work_anchor_rows must be positive');
  if (Number(artifact.counts?.cross_frame_collision_buckets || 0) <= 0) {
    issues.push('cross_frame_collision_buckets must be positive');
  }
  if (Number(artifact.counts?.cross_frame_collision_rows || 0) <= 0) {
    issues.push('cross_frame_collision_rows must be positive');
  }
  if (Number(artifact.counts?.sample_occurrences || 0) !== Number(artifact.counts?.collision_occurrence_rows || 0)) {
    issues.push('sample_occurrences must equal collision_occurrence_rows');
  }
  if (Number(artifact.counts?.reader_facing_rows || 0) !== 0) issues.push('reader_facing_rows must be 0');
  if (Number(artifact.counts?.route_payload_field_hits || 0) !== 0) issues.push('route_payload_field_hits must be 0');

  const statusCounts = { supported: 0, candidate: 0, weak: 0 };
  let collisionOccurrenceRows = 0;
  let sourceBuckets = 0;
  let sourceRows = 0;
  let anchorBuckets = 0;
  let anchorRows = 0;
  let crossFrameBuckets = 0;
  let crossFrameRows = 0;
  let samples = 0;
  for (const row of collisionRows) {
    collisionOccurrenceRows += Number(row.selected_occurrence_rows || 0);
    samples += (row.sample_occurrences || []).length;
    if (row.collision_kind === 'source_ref') {
      sourceBuckets += 1;
      sourceRows += Number(row.selected_occurrence_rows || 0);
    }
    if (row.collision_kind === 'work_anchor') {
      anchorBuckets += 1;
      anchorRows += Number(row.selected_occurrence_rows || 0);
    }
    if (row.collision_flags?.cross_frame_collision === true) {
      crossFrameBuckets += 1;
      crossFrameRows += Number(row.selected_occurrence_rows || 0);
    }
    for (const status of Object.keys(statusCounts)) statusCounts[status] += Number(row.status_counts?.[status] || 0);
  }
  if (Number(artifact.counts?.collision_occurrence_rows || 0) !== collisionOccurrenceRows) {
    issues.push('collision_occurrence_rows must match row totals');
  }
  if (Number(artifact.counts?.sample_occurrences || 0) !== samples) issues.push('sample_occurrences must match row samples');
  if (Number(artifact.counts?.duplicate_source_ref_buckets || 0) !== sourceBuckets) {
    issues.push('duplicate_source_ref_buckets must match rows');
  }
  if (Number(artifact.counts?.duplicate_source_ref_rows || 0) !== sourceRows) {
    issues.push('duplicate_source_ref_rows must match rows');
  }
  if (Number(artifact.counts?.duplicate_work_anchor_buckets || 0) !== anchorBuckets) {
    issues.push('duplicate_work_anchor_buckets must match rows');
  }
  if (Number(artifact.counts?.duplicate_work_anchor_rows || 0) !== anchorRows) {
    issues.push('duplicate_work_anchor_rows must match rows');
  }
  if (Number(artifact.counts?.cross_frame_collision_buckets || 0) !== crossFrameBuckets) {
    issues.push('cross_frame_collision_buckets must match rows');
  }
  if (Number(artifact.counts?.cross_frame_collision_rows || 0) !== crossFrameRows) {
    issues.push('cross_frame_collision_rows must match rows');
  }
  for (const [status, count] of Object.entries(statusCounts)) {
    if (Number(artifact.counts?.status_counts?.[status] || 0) !== count) issues.push(`status count mismatch for ${status}`);
  }
}

function validateCollisionRow(context, row) {
  requireFields(row, [
    'collision_id',
    'collision_kind',
    'collision_key',
    'selected_occurrence_rows',
    'unique_source_refs',
    'unique_source_hrefs',
    'unique_work_anchors',
    'unique_works',
    'usage_frames',
    'cluster_ids',
    'status_counts',
    'route_ids',
    'license_keys',
    'raw_score_summary',
    'collision_flags',
    'sample_occurrences',
  ], context);
  if (!allowedKinds.has(row.collision_kind)) issues.push(`${context}: invalid collision_kind ${row.collision_kind}`);
  if (Number(row.selected_occurrence_rows || 0) <= 1) issues.push(`${context}: selected_occurrence_rows must be > 1`);
  if (!Array.isArray(row.usage_frames) || !row.usage_frames.length) issues.push(`${context}: usage_frames must be non-empty array`);
  if (!Array.isArray(row.cluster_ids) || !row.cluster_ids.length) issues.push(`${context}: cluster_ids must be non-empty array`);
  if (!Array.isArray(row.route_ids) || !row.route_ids.length) issues.push(`${context}: route_ids must be non-empty array`);
  if (!Array.isArray(row.license_keys) || !row.license_keys.length) issues.push(`${context}: license_keys must be non-empty array`);
  if (sumStatusCounts(row.status_counts) !== Number(row.selected_occurrence_rows || 0)) {
    issues.push(`${context}: status_counts must sum to selected_occurrence_rows`);
  }
  if (Number(row.raw_score_summary?.min || 0) <= 0) issues.push(`${context}: raw_score_summary.min must be positive`);
  if (Number(row.raw_score_summary?.max || 0) < Number(row.raw_score_summary?.min || 0)) {
    issues.push(`${context}: raw_score_summary.max must be >= min`);
  }
  if (row.collision_flags?.observed_usage_only !== true) issues.push(`${context}: collision_flags.observed_usage_only must be true`);
  if (row.collision_flags?.reader_facing !== false) issues.push(`${context}: collision_flags.reader_facing must be false`);
  if (row.collision_flags?.audit_only !== true) issues.push(`${context}: collision_flags.audit_only must be true`);
  if (row.collision_flags?.duplicate_selected_bucket !== true) issues.push(`${context}: duplicate_selected_bucket must be true`);
  if (row.collision_kind === 'source_ref' && row.collision_flags?.repeated_source_ref !== true) {
    issues.push(`${context}: source_ref rows must flag repeated_source_ref`);
  }
  if (row.collision_kind === 'work_anchor' && row.collision_flags?.repeated_work_anchor !== true) {
    issues.push(`${context}: work_anchor rows must flag repeated_work_anchor`);
  }
  if (!Array.isArray(row.sample_occurrences) || row.sample_occurrences.length !== Number(row.selected_occurrence_rows || 0)) {
    issues.push(`${context}: sample_occurrences must match selected_occurrence_rows`);
  }
  for (const [sampleIndex, sample] of (row.sample_occurrences || []).entries()) validateSample(`${context}.sample_occurrences[${sampleIndex}]`, sample);
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
    'usage_frame_label',
    'cluster_id',
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
