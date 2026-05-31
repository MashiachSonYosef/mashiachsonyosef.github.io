#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const indexPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/usage-selected-slices-index.json');
const artifact = JSON.parse(fs.readFileSync(path.join(root, indexPath), 'utf8'));

if (artifact.artifact_type !== 'workbench_usage_navigation_selected_slices_index') {
  throw new Error(`${indexPath} is not a selected slices index artifact`);
}
if (!Array.isArray(artifact.slices) || artifact.slices.length === 0) {
  throw new Error(`${indexPath} must contain at least one selected slice`);
}

const recomputed = {
  slices: artifact.slices.length,
  rows: 0,
  works: 0,
  clusters: 0,
  route_ids: 0,
  supported: 0,
  candidate: 0,
  weak: 0,
  route_linked_observed_usage: 0,
  observed_usage_only: 0,
};
const overlapOccurrenceIds = new Set((artifact.overlap_occurrences || []).map((occurrence) => occurrence.occurrence_id).filter(Boolean));

for (const slice of artifact.slices) {
  if (!slice.slice_id) throw new Error('slice entry missing slice_id');
  if (!slice.artifact_path) throw new Error(`slice ${slice.slice_id} missing artifact_path`);
  if (slice.authority_policy?.ranks_routes !== false) throw new Error(`slice ${slice.slice_id} must not rank routes`);
  if (slice.authority_policy?.selects_visible_result !== false) throw new Error(`slice ${slice.slice_id} must not select visible results`);
  for (const key of Object.keys(recomputed).filter((key) => key !== 'slices')) {
    recomputed[key] += Number(slice.counts?.[key] || 0);
  }
}

for (const key of Object.keys(recomputed)) {
  if (Number(artifact.counts?.[key] || 0) !== recomputed[key]) {
    throw new Error(`count mismatch for ${key}: expected ${recomputed[key]}, got ${artifact.counts?.[key]}`);
  }
}

const deduped = artifact.deduped_counts || {};
if (Number(deduped.occurrence_refs || 0) <= 0) throw new Error('deduped_counts.occurrence_refs must be positive');
if (Number(deduped.occurrence_refs || 0) > Number(artifact.counts?.rows || 0)) {
  throw new Error('deduped_counts.occurrence_refs cannot exceed slice-summed row count');
}
if (Number(deduped.duplicate_slice_rows || 0) !== Number(artifact.counts?.rows || 0) - Number(deduped.occurrence_refs || 0)) {
  throw new Error('deduped_counts.duplicate_slice_rows must equal rows minus unique occurrence refs');
}
if (Number(deduped.overlapping_occurrences || 0) !== overlapOccurrenceIds.size) {
  throw new Error('deduped_counts.overlapping_occurrences must match overlap_occurrences length');
}
for (const key of ['supported', 'candidate', 'weak']) {
  if (Number(deduped.status_counts?.[key] || 0) > Number(artifact.counts?.[key] || 0)) {
    throw new Error(`deduped status count ${key} cannot exceed slice-summed count`);
  }
}
for (const key of ['route_linked_observed_usage', 'observed_usage_only']) {
  if (Number(deduped.route_link_state_counts?.[key] || 0) > Number(artifact.counts?.[key] || 0)) {
    throw new Error(`deduped route link state count ${key} cannot exceed slice-summed count`);
  }
}

console.log(`Validated usage selected slices index ${indexPath}: slices ${recomputed.slices}; rows ${recomputed.rows}; unique occurrences ${deduped.occurrence_refs}`);

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}
