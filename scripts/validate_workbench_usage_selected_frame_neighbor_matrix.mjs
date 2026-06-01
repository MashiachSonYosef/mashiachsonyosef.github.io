#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/usage-selected-frame-neighbor-matrix.json');
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
if (artifact.artifact_type !== 'workbench_usage_selected_frame_neighbor_matrix') {
  issues.push('artifact_type must be workbench_usage_selected_frame_neighbor_matrix');
}
if (!String(artifact.policy || '').includes('Audit-only selected frame-neighbor matrix')) {
  issues.push('policy must identify audit-only selected frame-neighbor matrix');
}
if (artifact.authority_policy?.usage_navigation_only !== true) issues.push('authority_policy.usage_navigation_only must be true');
if (artifact.authority_policy?.observed_usage_only !== true) issues.push('authority_policy.observed_usage_only must be true');
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

const frameRows = Array.isArray(artifact.frame_rows) ? artifact.frame_rows : [];
const neighborCells = Array.isArray(artifact.neighbor_cells) ? artifact.neighbor_cells : [];
if (!frameRows.length) issues.push('frame_rows must be non-empty');
if (!neighborCells.length) issues.push('neighbor_cells must be non-empty');
validateCounts(frameRows, neighborCells);
for (const [index, row] of frameRows.entries()) validateFrameRow(`frame_rows[${index}]`, row);
for (const [index, cell] of neighborCells.entries()) validateNeighborCell(`neighbor_cells[${index}]`, cell);
validateComparison();
for (const check of artifact.checks || []) {
  if (check.status !== 'passed') issues.push(`check ${check.id || '(unknown)'} must pass`);
}
walkNoForbiddenFields(artifact, artifactPath);

if (issues.length) {
  console.error(`Selected frame-neighbor matrix validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Validated selected frame-neighbor matrix ${artifactPath}: frames ${artifact.counts.frame_rows}; cells ${artifact.counts.neighbor_cells}; observations ${artifact.counts.neighbor_observations}`);

function validateCounts(frames, cells) {
  for (const field of [
    'frame_rows',
    'expected_frame_rows',
    'occurrence_rows',
    'neighbor_cells',
    'neighbor_observations',
    'expected_neighbor_observations',
    'immediate_neighbor_observations',
    'offsets',
    'unique_neighbor_tokens',
    'source_refs',
    'works',
    'route_ids',
    'provenance_buckets',
    'shared_neighbor_buckets',
    'frame_specific_neighbor_buckets',
    'shared_neighbor_bucket_rows_listed',
    'frame_specific_neighbor_bucket_rows_listed',
    'reader_facing_rows',
    'route_payload_field_hits',
  ]) {
    const value = Number(artifact.counts?.[field]);
    if (!Number.isInteger(value) || value < 0) issues.push(`counts.${field} must be a non-negative integer`);
  }
  if (Number(artifact.counts?.frame_rows || 0) !== frames.length) issues.push('counts.frame_rows must equal frame_rows length');
  if (Number(artifact.counts?.neighbor_cells || 0) !== cells.length) issues.push('counts.neighbor_cells must equal neighbor_cells length');
  if (Number(artifact.counts?.frame_rows || 0) !== Number(artifact.counts?.expected_frame_rows || 0)) {
    issues.push('frame_rows must equal expected_frame_rows');
  }
  if (Number(artifact.counts?.neighbor_observations || 0) !== Number(artifact.counts?.expected_neighbor_observations || 0)) {
    issues.push('neighbor_observations must equal expected_neighbor_observations');
  }
  if (Number(artifact.counts?.immediate_neighbor_observations || 0) <= 0) issues.push('immediate_neighbor_observations must be positive');
  if (Number(artifact.counts?.offsets || 0) <= 0) issues.push('offsets must be positive');
  if (Number(artifact.counts?.unique_neighbor_tokens || 0) <= 0) issues.push('unique_neighbor_tokens must be positive');
  if (Number(artifact.counts?.source_refs || 0) <= 1) issues.push('source_refs must show selected coverage across multiple refs');
  if (Number(artifact.counts?.works || 0) <= 1) issues.push('works must show selected coverage across multiple works');
  if (Number(artifact.counts?.route_ids || 0) <= 0) issues.push('route_ids must be positive');
  if (Number(artifact.counts?.provenance_buckets || 0) <= 0) issues.push('provenance_buckets must be positive');
  if (Number(artifact.counts?.shared_neighbor_buckets || 0) <= 0) issues.push('shared_neighbor_buckets must be positive');
  if (Number(artifact.counts?.frame_specific_neighbor_buckets || 0) <= 0) issues.push('frame_specific_neighbor_buckets must be positive');
  if (Number(artifact.counts?.reader_facing_rows || 0) !== 0) issues.push('reader_facing_rows must be 0');
  if (Number(artifact.counts?.route_payload_field_hits || 0) !== 0) issues.push('route_payload_field_hits must be 0');

  const statusCounts = { supported: 0, candidate: 0, weak: 0 };
  let cellObservationSum = 0;
  let immediateSum = 0;
  for (const cell of cells) {
    cellObservationSum += Number(cell.counts?.observations || 0);
    immediateSum += Number(cell.counts?.immediate_observations || 0);
    for (const status of Object.keys(statusCounts)) statusCounts[status] += Number(cell.status_counts?.[status] || 0);
  }
  if (cellObservationSum !== Number(artifact.counts?.neighbor_observations || 0)) {
    issues.push('cell observations must sum to neighbor_observations');
  }
  if (immediateSum !== Number(artifact.counts?.immediate_neighbor_observations || 0)) {
    issues.push('cell immediate observations must sum to immediate_neighbor_observations');
  }
  if (sumStatusCounts(statusCounts) !== Number(artifact.counts?.neighbor_observations || 0)) {
    issues.push('cell status counts must sum to neighbor_observations');
  }
  for (const [status, count] of Object.entries(statusCounts)) {
    if (Number(artifact.counts?.status_counts?.[status] || 0) !== count) issues.push(`status count mismatch for ${status}`);
  }
}

function validateFrameRow(context, row) {
  requireFields(row, [
    'frame_id',
    'usage_frame_label',
    'cluster_ids',
    'selected_occurrence_rows',
    'status_counts',
    'source_refs',
    'work_slugs',
    'route_ids',
    'provenance_ids',
    'counts',
    'top_neighbors',
    'navigation_flags',
  ], context);
  if (!Array.isArray(row.cluster_ids) || !row.cluster_ids.length) issues.push(`${context}: cluster_ids must be non-empty`);
  if (Number(row.selected_occurrence_rows || 0) <= 0) issues.push(`${context}: selected_occurrence_rows must be positive`);
  if (sumStatusCounts(row.status_counts) !== Number(row.selected_occurrence_rows || 0)) {
    issues.push(`${context}: status_counts must sum to selected_occurrence_rows`);
  }
  if (!Array.isArray(row.source_refs) || row.source_refs.length !== Number(row.counts?.source_refs || 0)) {
    issues.push(`${context}: source_refs length must equal counts.source_refs`);
  }
  if (!Array.isArray(row.work_slugs) || row.work_slugs.length !== Number(row.counts?.works || 0)) {
    issues.push(`${context}: work_slugs length must equal counts.works`);
  }
  if (!Array.isArray(row.route_ids) || row.route_ids.length !== Number(row.counts?.route_ids || 0)) {
    issues.push(`${context}: route_ids length must equal counts.route_ids`);
  }
  if (!Array.isArray(row.provenance_ids) || row.provenance_ids.length !== Number(row.counts?.provenance_buckets || 0)) {
    issues.push(`${context}: provenance_ids length must equal counts.provenance_buckets`);
  }
  if (Number(row.counts?.neighbor_cells || 0) <= 0) issues.push(`${context}: neighbor_cells must be positive`);
  if (Number(row.counts?.neighbor_observations || 0) <= 0) issues.push(`${context}: neighbor_observations must be positive`);
  if (Number(row.counts?.unique_neighbor_tokens || 0) <= 0) issues.push(`${context}: unique_neighbor_tokens must be positive`);
  if (!Array.isArray(row.top_neighbors) || !row.top_neighbors.length) issues.push(`${context}: top_neighbors must be non-empty`);
  for (const [index, neighbor] of (row.top_neighbors || []).entries()) {
    requireFields(neighbor, ['neighbor_bucket_key', 'offset', 'side', 'token_normalized', 'observations'], `${context}.top_neighbors[${index}]`);
    if (!hasHebrew(neighbor.token_normalized)) issues.push(`${context}.top_neighbors[${index}]: token_normalized must contain Hebrew`);
  }
  if (row.navigation_flags?.observed_usage_only !== true) issues.push(`${context}: observed_usage_only must be true`);
  if (row.navigation_flags?.reader_facing !== false) issues.push(`${context}: reader_facing must be false`);
  if (row.navigation_flags?.audit_only !== true) issues.push(`${context}: audit_only must be true`);
  if (row.navigation_flags?.route_ids_only !== true) issues.push(`${context}: route_ids_only must be true`);
}

function validateNeighborCell(context, cell) {
  requireFields(cell, [
    'frame_neighbor_cell_id',
    'neighbor_bucket_key',
    'frame_id',
    'usage_frame_label',
    'offset',
    'side',
    'token_normalized',
    'token_surfaces',
    'status_counts',
    'source_refs',
    'work_slugs',
    'route_ids',
    'provenance',
    'counts',
    'navigation_flags',
    'samples',
  ], context);
  if (!hasHebrew(cell.token_normalized)) issues.push(`${context}: token_normalized must contain Hebrew`);
  if (!Array.isArray(cell.token_surfaces) || !cell.token_surfaces.length) issues.push(`${context}: token_surfaces must be non-empty`);
  const observations = Number(cell.counts?.observations || 0);
  if (observations <= 0) issues.push(`${context}: observations must be positive`);
  if (sumStatusCounts(cell.status_counts) !== observations) issues.push(`${context}: status_counts must sum to observations`);
  if (!Array.isArray(cell.source_refs) || cell.source_refs.length !== Number(cell.counts?.source_refs || 0)) {
    issues.push(`${context}: source_refs length must equal counts.source_refs`);
  }
  if (!Array.isArray(cell.work_slugs) || cell.work_slugs.length !== Number(cell.counts?.works || 0)) {
    issues.push(`${context}: work_slugs length must equal counts.works`);
  }
  if (!Array.isArray(cell.route_ids) || cell.route_ids.length !== Number(cell.counts?.route_ids || 0)) {
    issues.push(`${context}: route_ids length must equal counts.route_ids`);
  }
  if (!Array.isArray(cell.provenance?.provenance_ids) || cell.provenance.provenance_ids.length !== Number(cell.counts?.provenance_buckets || 0)) {
    issues.push(`${context}: provenance_ids length must equal counts.provenance_buckets`);
  }
  if (!Array.isArray(cell.samples) || cell.samples.length !== Number(cell.counts?.samples || 0)) {
    issues.push(`${context}: samples length must equal counts.samples`);
  }
  if (Number(cell.counts?.samples_with_links || 0) !== Number(cell.counts?.samples || 0)) {
    issues.push(`${context}: samples_with_links must equal samples`);
  }
  if (Number(cell.counts?.samples_with_context || 0) !== Number(cell.counts?.samples || 0)) {
    issues.push(`${context}: samples_with_context must equal samples`);
  }
  if (cell.navigation_flags?.observed_usage_only !== true) issues.push(`${context}: observed_usage_only must be true`);
  if (cell.navigation_flags?.reader_facing !== false) issues.push(`${context}: reader_facing must be false`);
  if (cell.navigation_flags?.audit_only !== true) issues.push(`${context}: audit_only must be true`);
  if (cell.navigation_flags?.route_ids_only !== true) issues.push(`${context}: route_ids_only must be true`);
  if (cell.navigation_flags?.has_route_ids !== true) issues.push(`${context}: has_route_ids must be true`);
  if (cell.navigation_flags?.has_provenance !== true) issues.push(`${context}: has_provenance must be true`);
  for (const [sampleIndex, sample] of (cell.samples || []).entries()) validateSample(`${context}.samples[${sampleIndex}]`, sample);
}

function validateSample(context, sample) {
  requireFields(sample, [
    'occurrence_id',
    'source_ref',
    'source_href',
    'work_anchor_href',
    'status',
    'raw_score',
    'cluster_id',
    'usage_frame_label',
    'context_focus_marked',
    'related_route_ids',
    'license',
    'license_url',
    'sample_flags',
  ], context);
  if (!allowedStatuses.has(sample.status)) issues.push(`${context}: invalid status ${sample.status}`);
  if (!String(sample.source_href || '').startsWith('http')) issues.push(`${context}: source_href must be absolute URL`);
  if (!String(sample.work_anchor_href || '').includes('#')) issues.push(`${context}: work_anchor_href must include anchor`);
  if (!String(sample.license_url || '').startsWith('http')) issues.push(`${context}: license_url must be absolute URL`);
  if (!Array.isArray(sample.related_route_ids) || !sample.related_route_ids.length) issues.push(`${context}: related_route_ids must be non-empty`);
  if (!hasHebrew(sample.context_focus_marked)) issues.push(`${context}: context_focus_marked must include Hebrew`);
  if (!String(sample.context_focus_marked || '').includes('[') || !String(sample.context_focus_marked || '').includes(']')) {
    issues.push(`${context}: context_focus_marked must include bracketed focus marker`);
  }
  if (hasMojibake(sample.context_focus_marked)) issues.push(`${context}: context_focus_marked contains mojibake-like characters`);
  if (sample.sample_flags?.observed_usage_only !== true) issues.push(`${context}: observed_usage_only must be true`);
  if (sample.sample_flags?.reader_facing !== false) issues.push(`${context}: reader_facing must be false`);
  if (sample.sample_flags?.audit_only !== true) issues.push(`${context}: audit_only must be true`);
  if (sample.sample_flags?.route_ids_only !== true) issues.push(`${context}: route_ids_only must be true`);
}

function validateComparison() {
  const comparison = artifact.bucket_comparison || {};
  const shared = Array.isArray(comparison.shared_neighbor_buckets) ? comparison.shared_neighbor_buckets : [];
  const specific = Array.isArray(comparison.frame_specific_neighbor_buckets) ? comparison.frame_specific_neighbor_buckets : [];
  if (!shared.length) issues.push('shared_neighbor_buckets must be non-empty');
  if (!specific.length) issues.push('frame_specific_neighbor_buckets must be non-empty');
  if (Number(comparison.counts?.shared_neighbor_buckets || 0) !== Number(artifact.counts?.shared_neighbor_buckets || 0)) {
    issues.push('comparison shared_neighbor_buckets count must match top-level count');
  }
  if (Number(comparison.counts?.frame_specific_neighbor_buckets || 0) !== Number(artifact.counts?.frame_specific_neighbor_buckets || 0)) {
    issues.push('comparison frame_specific_neighbor_buckets count must match top-level count');
  }
  for (const [index, row] of shared.entries()) validateComparisonRow(`shared_neighbor_buckets[${index}]`, row, true);
  for (const [index, row] of specific.entries()) validateComparisonRow(`frame_specific_neighbor_buckets[${index}]`, row, false);
}

function validateComparisonRow(context, row, expectShared) {
  requireFields(row, ['neighbor_bucket_key', 'offset', 'side', 'token_normalized', 'frame_count', 'frames', 'observations', 'source_refs', 'works', 'route_ids', 'cell_ids'], context);
  if (!hasHebrew(row.token_normalized)) issues.push(`${context}: token_normalized must contain Hebrew`);
  if (!Array.isArray(row.frames) || !row.frames.length) issues.push(`${context}: frames must be non-empty`);
  if (expectShared && Number(row.frame_count || 0) <= 1) issues.push(`${context}: shared row must have frame_count > 1`);
  if (!expectShared && Number(row.frame_count || 0) !== 1) issues.push(`${context}: frame-specific row must have frame_count 1`);
  if (Number(row.observations || 0) <= 0) issues.push(`${context}: observations must be positive`);
  if (!Array.isArray(row.route_ids) || !row.route_ids.length) issues.push(`${context}: route_ids must be non-empty`);
  if (!Array.isArray(row.cell_ids) || !row.cell_ids.length) issues.push(`${context}: cell_ids must be non-empty`);
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

function sumStatusCounts(statusCounts) {
  return Object.values(statusCounts || {}).reduce((sum, count) => sum + Number(count || 0), 0);
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

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}
