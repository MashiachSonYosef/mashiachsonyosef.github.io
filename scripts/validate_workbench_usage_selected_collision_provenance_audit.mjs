#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/usage-selected-collision-provenance-audit.json');
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
if (artifact.artifact_type !== 'workbench_usage_selected_collision_provenance_audit') {
  issues.push('artifact_type must be workbench_usage_selected_collision_provenance_audit');
}
if (!String(artifact.policy || '').includes('Audit-only selected collision/provenance audit')) {
  issues.push('policy must identify audit-only selected collision/provenance audit');
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

const rows = Array.isArray(artifact.collision_provenance_rows) ? artifact.collision_provenance_rows : [];
if (!rows.length) issues.push('collision_provenance_rows must be non-empty');
validateCounts(rows);
for (const [index, row] of rows.entries()) validateCollisionProvenanceRow(`collision_provenance_rows[${index}]`, row);
for (const check of artifact.checks || []) {
  if (check.id === 'cross_frame_collisions_preserved') {
    if (check.status !== 'warning') issues.push('cross_frame_collisions_preserved must remain warning');
  } else if (check.status !== 'passed') {
    issues.push(`check ${check.id || '(unknown)'} must pass`);
  }
}
walkNoForbiddenFields(artifact, artifactPath);

if (issues.length) {
  console.error(`Workbench usage selected collision/provenance audit validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Validated usage selected collision/provenance audit ${artifactPath}: buckets ${rows.length}; provenance buckets ${artifact.counts.provenance_buckets}`);

function validateCounts(rowsToCheck) {
  if (Number(artifact.counts?.collision_buckets || 0) !== rowsToCheck.length) {
    issues.push('collision_buckets must equal collision_provenance_rows length');
  }
  if (Number(artifact.counts?.collision_occurrence_rows || 0) <= 0) issues.push('collision_occurrence_rows must be positive');
  if (Number(artifact.counts?.duplicate_source_ref_buckets || 0) <= 0) issues.push('duplicate_source_ref_buckets must be positive');
  if (Number(artifact.counts?.duplicate_source_ref_rows || 0) <= 0) issues.push('duplicate_source_ref_rows must be positive');
  if (Number(artifact.counts?.duplicate_work_anchor_buckets || 0) <= 0) issues.push('duplicate_work_anchor_buckets must be positive');
  if (Number(artifact.counts?.duplicate_work_anchor_rows || 0) <= 0) issues.push('duplicate_work_anchor_rows must be positive');
  if (Number(artifact.counts?.cross_frame_collision_buckets || 0) <= 0) issues.push('cross_frame_collision_buckets must be positive');
  if (Number(artifact.counts?.cross_frame_collision_rows || 0) <= 0) issues.push('cross_frame_collision_rows must be positive');
  if (Number(artifact.counts?.provenance_buckets || 0) <= 0) issues.push('provenance_buckets must be positive');
  if (Number(artifact.counts?.frame_provenance_buckets || 0) <= 0) issues.push('frame_provenance_buckets must be positive');
  if (Number(artifact.counts?.unique_licenses || 0) <= 0) issues.push('unique_licenses must be positive');
  if (Number(artifact.counts?.unique_license_urls || 0) <= 0) issues.push('unique_license_urls must be positive');
  if (Number(artifact.counts?.unique_version_titles || 0) <= 0) issues.push('unique_version_titles must be positive');
  if (Number(artifact.counts?.unique_version_sources || 0) <= 0) issues.push('unique_version_sources must be positive');
  if (Number(artifact.counts?.unique_route_ids || 0) <= 0) issues.push('unique_route_ids must be positive');
  if (Number(artifact.counts?.missing_provenance_rows || 0) !== 0) issues.push('missing_provenance_rows must be 0');
  if (Number(artifact.counts?.missing_frame_provenance_rows || 0) !== 0) issues.push('missing_frame_provenance_rows must be 0');
  if (Number(artifact.counts?.sample_occurrences || 0) !== Number(artifact.counts?.collision_occurrence_rows || 0)) {
    issues.push('sample_occurrences must equal collision_occurrence_rows');
  }
  if (Number(artifact.counts?.reader_facing_rows || 0) !== 0) issues.push('reader_facing_rows must be 0');
  if (Number(artifact.counts?.route_payload_field_hits || 0) !== 0) issues.push('route_payload_field_hits must be 0');

  const statusCounts = { supported: 0, candidate: 0, weak: 0 };
  const provenanceIds = new Set();
  const frameProvenanceBucketIds = new Set();
  const routeIds = new Set();
  let collisionOccurrenceRows = 0;
  let sourceBuckets = 0;
  let sourceRows = 0;
  let anchorBuckets = 0;
  let anchorRows = 0;
  let crossFrameBuckets = 0;
  let crossFrameRows = 0;
  let crossProvenanceBuckets = 0;
  let crossLicenseBuckets = 0;
  let samples = 0;
  for (const row of rowsToCheck) {
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
    if (row.collision_provenance_flags?.cross_frame_collision === true) {
      crossFrameBuckets += 1;
      crossFrameRows += Number(row.selected_occurrence_rows || 0);
    }
    if (row.collision_provenance_flags?.cross_provenance_collision === true) crossProvenanceBuckets += 1;
    if (row.collision_provenance_flags?.cross_license_collision === true) crossLicenseBuckets += 1;
    for (const status of Object.keys(statusCounts)) statusCounts[status] += Number(row.status_counts?.[status] || 0);
    for (const provenanceId of row.provenance_ids || []) provenanceIds.add(provenanceId);
    for (const bucketId of row.frame_provenance_bucket_ids || []) frameProvenanceBucketIds.add(bucketId);
    for (const routeId of row.route_ids || []) routeIds.add(routeId);
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
  if (Number(artifact.counts?.cross_provenance_collision_buckets || 0) !== crossProvenanceBuckets) {
    issues.push('cross_provenance_collision_buckets must match rows');
  }
  if (Number(artifact.counts?.cross_license_collision_buckets || 0) !== crossLicenseBuckets) {
    issues.push('cross_license_collision_buckets must match rows');
  }
  if (Number(artifact.counts?.provenance_buckets || 0) !== provenanceIds.size) issues.push('provenance_buckets must match rows');
  if (Number(artifact.counts?.frame_provenance_buckets || 0) !== frameProvenanceBucketIds.size) {
    issues.push('frame_provenance_buckets must match rows');
  }
  if (Number(artifact.counts?.unique_route_ids || 0) !== routeIds.size) issues.push('unique_route_ids must match rows');
  for (const [status, count] of Object.entries(statusCounts)) {
    if (Number(artifact.counts?.status_counts?.[status] || 0) !== count) issues.push(`status count mismatch for ${status}`);
  }
}

function validateCollisionProvenanceRow(context, row) {
  requireFields(row, [
    'collision_id',
    'collision_kind',
    'collision_key',
    'selected_occurrence_rows',
    'unique_source_refs',
    'unique_work_anchors',
    'unique_works',
    'usage_frames',
    'cluster_ids',
    'provenance_ids',
    'frame_provenance_bucket_ids',
    'route_ids',
    'license_keys',
    'license_urls',
    'version_titles',
    'version_sources',
    'status_counts',
    'raw_score_summary',
    'collision_provenance_flags',
    'sample_occurrences',
  ], context);
  if (!allowedKinds.has(row.collision_kind)) issues.push(`${context}: invalid collision_kind ${row.collision_kind}`);
  if (Number(row.selected_occurrence_rows || 0) <= 1) issues.push(`${context}: selected_occurrence_rows must be > 1`);
  if (!Array.isArray(row.usage_frames) || !row.usage_frames.length) issues.push(`${context}: usage_frames must be non-empty array`);
  if (!Array.isArray(row.cluster_ids) || !row.cluster_ids.length) issues.push(`${context}: cluster_ids must be non-empty array`);
  if (!Array.isArray(row.provenance_ids) || !row.provenance_ids.length) issues.push(`${context}: provenance_ids must be non-empty array`);
  if (!Array.isArray(row.frame_provenance_bucket_ids) || !row.frame_provenance_bucket_ids.length) {
    issues.push(`${context}: frame_provenance_bucket_ids must be non-empty array`);
  }
  if (!Array.isArray(row.route_ids) || !row.route_ids.length) issues.push(`${context}: route_ids must be non-empty array`);
  if (!Array.isArray(row.license_keys) || !row.license_keys.length) issues.push(`${context}: license_keys must be non-empty array`);
  if (!Array.isArray(row.license_urls) || !row.license_urls.length) issues.push(`${context}: license_urls must be non-empty array`);
  if (!Array.isArray(row.version_titles) || !row.version_titles.length) issues.push(`${context}: version_titles must be non-empty array`);
  if (!Array.isArray(row.version_sources) || !row.version_sources.length) issues.push(`${context}: version_sources must be non-empty array`);
  if (sumStatusCounts(row.status_counts) !== Number(row.selected_occurrence_rows || 0)) {
    issues.push(`${context}: status_counts must sum to selected_occurrence_rows`);
  }
  if (Number(row.raw_score_summary?.min || 0) <= 0) issues.push(`${context}: raw_score_summary.min must be positive`);
  if (Number(row.raw_score_summary?.max || 0) < Number(row.raw_score_summary?.min || 0)) {
    issues.push(`${context}: raw_score_summary.max must be >= min`);
  }
  if (row.collision_provenance_flags?.observed_usage_only !== true) {
    issues.push(`${context}: collision_provenance_flags.observed_usage_only must be true`);
  }
  if (row.collision_provenance_flags?.reader_facing !== false) {
    issues.push(`${context}: collision_provenance_flags.reader_facing must be false`);
  }
  if (row.collision_provenance_flags?.audit_only !== true) issues.push(`${context}: audit_only must be true`);
  if (row.collision_provenance_flags?.duplicate_selected_bucket !== true) issues.push(`${context}: duplicate_selected_bucket must be true`);
  if (row.collision_kind === 'source_ref' && row.collision_provenance_flags?.repeated_source_ref !== true) {
    issues.push(`${context}: source_ref rows must flag repeated_source_ref`);
  }
  if (row.collision_kind === 'work_anchor' && row.collision_provenance_flags?.repeated_work_anchor !== true) {
    issues.push(`${context}: work_anchor rows must flag repeated_work_anchor`);
  }
  if (Number(row.collision_provenance_flags?.missing_provenance_rows || 0) !== 0) {
    issues.push(`${context}: missing_provenance_rows must be 0`);
  }
  if (Number(row.collision_provenance_flags?.missing_frame_provenance_rows || 0) !== 0) {
    issues.push(`${context}: missing_frame_provenance_rows must be 0`);
  }
  if (!Array.isArray(row.sample_occurrences) || row.sample_occurrences.length !== Number(row.selected_occurrence_rows || 0)) {
    issues.push(`${context}: sample_occurrences must match selected_occurrence_rows`);
  }
  for (const [sampleIndex, sample] of (row.sample_occurrences || []).entries()) validateSample(`${context}.sample_occurrences[${sampleIndex}]`, sample);
}

function validateSample(context, sample) {
  requireFields(sample, [
    'occurrence_id',
    'provenance_id',
    'frame_provenance_bucket_id',
    'token_key',
    'token_surface',
    'token_normalized',
    'focus_surface',
    'focus_normalized',
    'source_ref',
    'source_href',
    'work_anchor_href',
    'work_title',
    'work_slug',
    'status',
    'raw_score',
    'cluster_id',
    'usage_frame_label',
    'context_focus_marked',
    'route_ids',
    'license',
    'license_url',
    'version_title',
    'version_source',
    'sample_flags',
  ], context);
  if (!allowedStatuses.has(sample.status)) issues.push(`${context}: invalid status ${sample.status}`);
  if (!String(sample.source_href || '').startsWith('http')) issues.push(`${context}: source_href must be absolute URL`);
  if (!String(sample.work_anchor_href || '').includes('#')) issues.push(`${context}: work_anchor_href must include anchor`);
  if (!String(sample.license_url || '').startsWith('http')) issues.push(`${context}: license_url must be absolute URL`);
  if (!String(sample.version_source || '').startsWith('http')) issues.push(`${context}: version_source must be absolute URL`);
  if (!Array.isArray(sample.route_ids) || !sample.route_ids.length) issues.push(`${context}: route_ids must be non-empty array`);
  if (!hasHebrew(sample.token_surface)) issues.push(`${context}: token_surface must include Hebrew`);
  if (!hasHebrew(sample.context_focus_marked)) issues.push(`${context}: context_focus_marked must include Hebrew`);
  if (!String(sample.context_focus_marked || '').includes('[') || !String(sample.context_focus_marked || '').includes(']')) {
    issues.push(`${context}: context_focus_marked must include bracketed focus marker`);
  }
  if (hasMojibake(sample.token_surface) || hasMojibake(sample.context_focus_marked)) {
    issues.push(`${context}: token or context contains mojibake-like characters`);
  }
  if (sample.sample_flags?.observed_usage_only !== true) issues.push(`${context}: sample_flags.observed_usage_only must be true`);
  if (sample.sample_flags?.reader_facing !== false) issues.push(`${context}: sample_flags.reader_facing must be false`);
  if (sample.sample_flags?.audit_only !== true) issues.push(`${context}: sample_flags.audit_only must be true`);
  if (sample.sample_flags?.has_provenance !== true) issues.push(`${context}: sample_flags.has_provenance must be true`);
  if (sample.sample_flags?.has_frame_provenance_bucket !== true) {
    issues.push(`${context}: sample_flags.has_frame_provenance_bucket must be true`);
  }
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
