#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/usage-crossmatch-neighborhoods.json');
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
]);

if (artifact.schema_version !== 1) issues.push('schema_version must be 1');
if (artifact.artifact_type !== 'workbench_usage_navigation_crossmatch_neighborhoods') {
  issues.push('artifact_type must be workbench_usage_navigation_crossmatch_neighborhoods');
}
if (artifact.authority_policy?.usage_navigation_only !== true) issues.push('authority_policy.usage_navigation_only must be true');
if (artifact.authority_policy?.ranks_routes !== false) issues.push('authority_policy.ranks_routes must be false');
if (artifact.authority_policy?.selects_visible_result !== false) issues.push('authority_policy.selects_visible_result must be false');
if (artifact.authority_policy?.ambiguous_rows_reader_facing !== false) {
  issues.push('authority_policy.ambiguous_rows_reader_facing must be false');
}
if (artifact.quality?.status !== 'passed') issues.push('quality.status must be passed');
if (Number(artifact.quality?.failed_count || 0) !== 0) issues.push('quality.failed_count must be 0');
if (Number(artifact.counts?.route_payload_field_hits || 0) !== 0) issues.push('route_payload_field_hits must be 0');

const neighborhoods = Array.isArray(artifact.neighborhoods) ? artifact.neighborhoods : [];
if (!neighborhoods.length) issues.push('neighborhoods must be non-empty');
if (Number(artifact.counts?.neighborhoods || 0) !== neighborhoods.length) issues.push('counts.neighborhoods must equal neighborhoods length');
if (Number(artifact.counts?.occurrence_refs || 0) !== neighborhoods.length) issues.push('counts.occurrence_refs must equal neighborhoods length');

let sameFrameLinks = 0;
let bridgeLinks = 0;
let withSameFrame = 0;
let withBridge = 0;
const occurrenceIds = new Set();
for (const row of neighborhoods) {
  if (!row.occurrence_id) issues.push('neighborhood missing occurrence_id');
  if (occurrenceIds.has(row.occurrence_id)) issues.push(`duplicate occurrence_id ${row.occurrence_id}`);
  occurrenceIds.add(row.occurrence_id);
  if (!row.source_ref) issues.push(`${row.occurrence_id}: source_ref must be present`);
  if (!row.source_href) issues.push(`${row.occurrence_id}: source_href must be present`);
  if (!row.work_anchor_href) issues.push(`${row.occurrence_id}: work_anchor_href must be present`);
  if (!row.focus_normalized) issues.push(`${row.occurrence_id}: focus_normalized must be present`);
  if (!row.license) issues.push(`${row.occurrence_id}: license must be present`);
  if (!row.license_url) issues.push(`${row.occurrence_id}: license_url must be present`);
  if (!Array.isArray(row.route_ids)) issues.push(`${row.occurrence_id}: route_ids must be an array`);
  if (!Array.isArray(row.top_same_frame_neighbors)) issues.push(`${row.occurrence_id}: top_same_frame_neighbors must be an array`);
  if (!Array.isArray(row.top_bridge_neighbors)) issues.push(`${row.occurrence_id}: top_bridge_neighbors must be an array`);

  sameFrameLinks += Number(row.counts?.same_frame_neighbors || 0);
  bridgeLinks += Number(row.counts?.bridge_neighbors || 0);
  if (Number(row.counts?.same_frame_neighbors || 0) > 0) withSameFrame += 1;
  if (Number(row.counts?.bridge_neighbors || 0) > 0) withBridge += 1;
  if (row.top_same_frame_neighbors.length > Number(artifact.counts?.max_same_frame_neighbors_listed || 0)) {
    issues.push(`${row.occurrence_id}: top_same_frame_neighbors exceeds max`);
  }
  if (row.top_bridge_neighbors.length > Number(artifact.counts?.max_bridge_neighbors_listed || 0)) {
    issues.push(`${row.occurrence_id}: top_bridge_neighbors exceeds max`);
  }
  for (const link of row.top_same_frame_neighbors) {
    if (!link.relationships?.includes('same_cluster')) issues.push(`${row.occurrence_id}: same-frame neighbor missing same_cluster`);
    validateNeighbor(row.occurrence_id, link);
  }
  for (const link of row.top_bridge_neighbors) {
    if (link.relationships?.includes('same_cluster')) issues.push(`${row.occurrence_id}: bridge neighbor must not include same_cluster`);
    validateNeighbor(row.occurrence_id, link);
  }
}

if (sameFrameLinks !== Number(artifact.counts?.same_frame_neighbor_links || 0)) issues.push('same_frame_neighbor_links count mismatch');
if (bridgeLinks !== Number(artifact.counts?.bridge_neighbor_links || 0)) issues.push('bridge_neighbor_links count mismatch');
if (withSameFrame !== Number(artifact.counts?.neighborhoods_with_same_frame_links || 0)) issues.push('neighborhoods_with_same_frame_links count mismatch');
if (withBridge !== Number(artifact.counts?.neighborhoods_with_bridge_links || 0)) issues.push('neighborhoods_with_bridge_links count mismatch');

for (const check of artifact.checks || []) {
  if (check.status !== 'passed') issues.push(`check ${check.id || '(unknown)'} must pass`);
}
walkNoForbiddenFields(artifact, artifactPath);

if (issues.length) {
  console.error(`Workbench usage crossmatch neighborhoods validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Validated usage crossmatch neighborhoods ${artifactPath}: neighborhoods ${neighborhoods.length}; bridge links ${bridgeLinks}`);

function validateNeighbor(sourceId, link) {
  if (!link.edge_id) issues.push(`${sourceId}: neighbor missing edge_id`);
  if (!link.target_occurrence_id) issues.push(`${sourceId}: neighbor missing target_occurrence_id`);
  if (!link.target_ref) issues.push(`${sourceId}: neighbor missing target_ref`);
  if (!link.target_source_href) issues.push(`${sourceId}: neighbor missing target_source_href`);
  if (!link.target_work_anchor_href) issues.push(`${sourceId}: neighbor missing target_work_anchor_href`);
  if (!link.target_license) issues.push(`${sourceId}: neighbor missing target_license`);
  if (!link.target_license_url) issues.push(`${sourceId}: neighbor missing target_license_url`);
  if (!Number.isInteger(link.crossmatch_score) || link.crossmatch_score < 0 || link.crossmatch_score > 100) {
    issues.push(`${sourceId}: neighbor crossmatch_score must be integer 0-100`);
  }
  if (!['strong', 'moderate', 'weak'].includes(link.crossmatch_strength)) {
    issues.push(`${sourceId}: neighbor crossmatch_strength must be strong/moderate/weak`);
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
