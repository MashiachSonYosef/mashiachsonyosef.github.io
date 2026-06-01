#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/usage-selected-focus-neighbor-index.json');
const artifact = readJson(artifactPath);
const issues = [];
const allowedStatuses = new Set(['supported', 'candidate', 'weak']);
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

if (artifact.schema_version !== 1) issues.push('schema_version must be 1');
if (artifact.artifact_type !== 'workbench_usage_selected_focus_neighbor_index') {
  issues.push('artifact_type must be workbench_usage_selected_focus_neighbor_index');
}
if (artifact.authority_policy?.usage_navigation_only !== true) issues.push('authority_policy.usage_navigation_only must be true');
if (artifact.authority_policy?.observed_usage_only !== true) issues.push('authority_policy.observed_usage_only must be true');
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

const occurrenceRows = Array.isArray(artifact.occurrence_rows) ? artifact.occurrence_rows : [];
const neighborBuckets = Array.isArray(artifact.neighbor_buckets) ? artifact.neighbor_buckets : [];
if (!occurrenceRows.length) issues.push('occurrence_rows must be non-empty');
if (!neighborBuckets.length) issues.push('neighbor_buckets must be non-empty');
validateCounts(occurrenceRows, neighborBuckets);
validateOccurrenceRows(occurrenceRows);
validateNeighborBuckets(neighborBuckets);
for (const check of artifact.checks || []) {
  if (check.status !== 'passed') issues.push(`check ${check.id || '(unknown)'} must pass`);
}
walkNoForbiddenFields(artifact, artifactPath);

if (issues.length) {
  console.error(`Selected focus-neighbor index validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Validated selected focus-neighbor index ${artifactPath}: rows ${artifact.counts.occurrence_rows}; observations ${artifact.counts.neighbor_observations}; buckets ${artifact.counts.neighbor_buckets}`);

function validateCounts(rows, buckets) {
  for (const field of [
    'occurrence_rows',
    'expected_occurrence_rows',
    'rows_with_focus_marker',
    'rows_with_neighbor_window',
    'rows_with_immediate_neighbor',
    'rows_with_source_link',
    'rows_with_work_anchor',
    'rows_with_marked_context',
    'rows_with_provenance',
    'neighbor_observations',
    'immediate_neighbor_observations',
    'offsets',
    'neighbor_buckets',
    'unique_neighbor_tokens',
    'source_refs',
    'works',
    'usage_frames',
    'route_ids',
    'provenance_buckets',
    'reader_facing_rows',
    'route_payload_field_hits',
  ]) {
    const value = Number(artifact.counts?.[field]);
    if (!Number.isInteger(value) || value < 0) issues.push(`counts.${field} must be a non-negative integer`);
  }
  if (Number(artifact.counts?.occurrence_rows || 0) !== rows.length) issues.push('counts.occurrence_rows must equal occurrence_rows length');
  if (Number(artifact.counts?.occurrence_rows || 0) !== Number(artifact.counts?.expected_occurrence_rows || 0)) {
    issues.push('occurrence_rows must equal expected_occurrence_rows');
  }
  if (Number(artifact.counts?.rows_with_focus_marker || 0) !== rows.length) issues.push('rows_with_focus_marker must equal occurrence_rows');
  if (Number(artifact.counts?.rows_with_neighbor_window || 0) !== rows.length) issues.push('rows_with_neighbor_window must equal occurrence_rows');
  if (Number(artifact.counts?.rows_with_source_link || 0) !== rows.length) issues.push('rows_with_source_link must equal occurrence_rows');
  if (Number(artifact.counts?.rows_with_work_anchor || 0) !== rows.length) issues.push('rows_with_work_anchor must equal occurrence_rows');
  if (Number(artifact.counts?.rows_with_marked_context || 0) !== rows.length) issues.push('rows_with_marked_context must equal occurrence_rows');
  if (Number(artifact.counts?.rows_with_provenance || 0) !== rows.length) issues.push('rows_with_provenance must equal occurrence_rows');
  if (Number(artifact.counts?.neighbor_buckets || 0) !== buckets.length) issues.push('neighbor_buckets must equal neighbor_buckets length');
  if (Number(artifact.counts?.neighbor_observations || 0) <= 0) issues.push('neighbor_observations must be positive');
  if (Number(artifact.counts?.immediate_neighbor_observations || 0) <= 0) issues.push('immediate_neighbor_observations must be positive');
  if (Number(artifact.counts?.route_ids || 0) <= 0) issues.push('route_ids must be positive');
  if (Number(artifact.counts?.reader_facing_rows || 0) !== 0) issues.push('reader_facing_rows must be 0');
  if (Number(artifact.counts?.route_payload_field_hits || 0) !== 0) issues.push('route_payload_field_hits must be 0');
}

function validateOccurrenceRows(rows) {
  const ids = new Set();
  let observationSum = 0;
  for (const [index, row] of rows.entries()) {
    const context = `occurrence_rows[${index}]`;
    requireFields(row, [
      'occurrence_id',
      'source_ref',
      'source_href',
      'work_anchor_href',
      'focus_normalized',
      'status',
      'cluster_id',
      'usage_frame_label',
      'context_focus_marked',
      'related_route_ids',
      'license',
      'license_url',
      'neighbor_tokens',
      'navigation_flags',
    ], context);
    if (ids.has(row.occurrence_id)) issues.push(`${context}: duplicate occurrence_id ${row.occurrence_id}`);
    ids.add(row.occurrence_id);
    if (!allowedStatuses.has(row.status)) issues.push(`${context}: invalid status ${row.status}`);
    if (!Array.isArray(row.related_route_ids) || !row.related_route_ids.length) issues.push(`${context}: related_route_ids must be non-empty`);
    const tokens = Array.isArray(row.neighbor_tokens) ? row.neighbor_tokens : [];
    if (!tokens.length) issues.push(`${context}: neighbor_tokens must be non-empty`);
    observationSum += tokens.length;
    for (const [tokenIndex, token] of tokens.entries()) validateNeighborToken(`${context}.neighbor_tokens[${tokenIndex}]`, token);
    if (row.navigation_flags?.observed_usage_only !== true) issues.push(`${context}: observed_usage_only must be true`);
    if (row.navigation_flags?.reader_facing !== false) issues.push(`${context}: reader_facing must be false`);
    if (row.navigation_flags?.has_focus_marker !== true) issues.push(`${context}: has_focus_marker must be true`);
    if (row.navigation_flags?.has_neighbor_window !== true) issues.push(`${context}: has_neighbor_window must be true`);
    if (row.navigation_flags?.has_source_link !== true) issues.push(`${context}: has_source_link must be true`);
    if (row.navigation_flags?.has_work_anchor !== true) issues.push(`${context}: has_work_anchor must be true`);
    if (row.navigation_flags?.has_marked_context !== true) issues.push(`${context}: has_marked_context must be true`);
    if (row.navigation_flags?.has_provenance !== true) issues.push(`${context}: has_provenance must be true`);
    if (row.navigation_flags?.route_ids_only !== true) issues.push(`${context}: route_ids_only must be true`);
  }
  if (observationSum !== Number(artifact.counts?.neighbor_observations || 0)) {
    issues.push('occurrence neighbor token lengths must sum to neighbor_observations');
  }
}

function validateNeighborToken(context, token) {
  requireFields(token, ['surface', 'normalized', 'side', 'offset'], context);
  const offset = Number(token.offset);
  if (!Number.isInteger(offset) || offset === 0) issues.push(`${context}: offset must be non-zero integer`);
  if (token.side !== 'left' && token.side !== 'right') issues.push(`${context}: side must be left or right`);
  if (offset < 0 && token.side !== 'left') issues.push(`${context}: negative offset must be left`);
  if (offset > 0 && token.side !== 'right') issues.push(`${context}: positive offset must be right`);
  if (!/[\u05D0-\u05EA]/.test(String(token.normalized || ''))) issues.push(`${context}: normalized must contain Hebrew letters`);
}

function validateNeighborBuckets(buckets) {
  const ids = new Set();
  let observationSum = 0;
  for (const [index, bucket] of buckets.entries()) {
    const context = `neighbor_buckets[${index}]`;
    requireFields(bucket, [
      'neighbor_bucket_id',
      'offset',
      'side',
      'token_normalized',
      'token_surfaces',
      'status_counts',
      'frame_counts',
      'source_refs',
      'work_slugs',
      'route_ids',
      'provenance',
      'samples',
      'counts',
      'navigation_flags',
    ], context);
    if (ids.has(bucket.neighbor_bucket_id)) issues.push(`${context}: duplicate neighbor_bucket_id ${bucket.neighbor_bucket_id}`);
    ids.add(bucket.neighbor_bucket_id);
    const observations = Number(bucket.counts?.observations || 0);
    if (!Number.isInteger(observations) || observations <= 0) issues.push(`${context}: counts.observations must be positive`);
    observationSum += observations;
    const statusSum = Number(bucket.status_counts?.supported || 0) + Number(bucket.status_counts?.candidate || 0) + Number(bucket.status_counts?.weak || 0);
    if (statusSum !== observations) issues.push(`${context}: status counts must sum to observations`);
    if (!Array.isArray(bucket.token_surfaces) || !bucket.token_surfaces.length) issues.push(`${context}: token_surfaces must be non-empty`);
    if (!Array.isArray(bucket.frame_counts) || !bucket.frame_counts.length) issues.push(`${context}: frame_counts must be non-empty`);
    if (!Array.isArray(bucket.source_refs) || bucket.source_refs.length !== Number(bucket.counts?.source_refs || 0)) {
      issues.push(`${context}: source_refs length must equal counts.source_refs`);
    }
    if (!Array.isArray(bucket.work_slugs) || bucket.work_slugs.length !== Number(bucket.counts?.works || 0)) {
      issues.push(`${context}: work_slugs length must equal counts.works`);
    }
    if (!Array.isArray(bucket.route_ids) || bucket.route_ids.length !== Number(bucket.counts?.route_ids || 0)) {
      issues.push(`${context}: route_ids length must equal counts.route_ids`);
    }
    if (!Array.isArray(bucket.samples) || bucket.samples.length !== Number(bucket.counts?.samples || 0)) {
      issues.push(`${context}: samples length must equal counts.samples`);
    }
    if (Number(bucket.counts?.samples_with_links || 0) !== Number(bucket.counts?.samples || 0)) {
      issues.push(`${context}: samples_with_links must equal samples`);
    }
    if (Number(bucket.counts?.samples_with_context || 0) !== Number(bucket.counts?.samples || 0)) {
      issues.push(`${context}: samples_with_context must equal samples`);
    }
    if (bucket.navigation_flags?.observed_usage_only !== true) issues.push(`${context}: observed_usage_only must be true`);
    if (bucket.navigation_flags?.reader_facing !== false) issues.push(`${context}: reader_facing must be false`);
    if (bucket.navigation_flags?.route_ids_only !== true) issues.push(`${context}: route_ids_only must be true`);
  }
  if (observationSum !== Number(artifact.counts?.neighbor_observations || 0)) {
    issues.push('bucket observations must sum to neighbor_observations');
  }
}

function requireFields(row, fields, context) {
  for (const field of fields) {
    if (row?.[field] === undefined || row?.[field] === null || row?.[field] === '') {
      issues.push(`${context}: missing ${field}`);
    }
  }
}

function walkNoForbiddenFields(value, label) {
  const hits = [];
  walk(value, '');
  if (hits.length) issues.push(`${label} contains forbidden authority/payload fields: ${hits.slice(0, 12).join(', ')}`);

  function walk(node, currentPath) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const [index, item] of node.entries()) walk(item, `${currentPath}[${index}]`);
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      const nextPath = currentPath ? `${currentPath}.${key}` : key;
      if (forbiddenFieldNames.has(key)) hits.push(nextPath);
      walk(child, nextPath);
    }
  }
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}
