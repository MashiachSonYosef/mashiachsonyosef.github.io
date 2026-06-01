#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/usage-selected-navigation-edge-index.json');
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
const allowedLinkKinds = new Set(['same_frame', 'bridge_frame']);
const allowedStrengths = new Set(['strong', 'moderate', 'weak']);
const allowedStatuses = new Set(['supported', 'candidate', 'weak']);

if (artifact.schema_version !== 1) issues.push('schema_version must be 1');
if (artifact.artifact_type !== 'workbench_usage_selected_navigation_edge_index') {
  issues.push('artifact_type must be workbench_usage_selected_navigation_edge_index');
}
if (!String(artifact.policy || '').includes('directed selected occurrence crossmatch edges')) {
  issues.push('policy must identify selected occurrence crossmatch edges');
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

const rows = Array.isArray(artifact.edge_rows) ? artifact.edge_rows : [];
if (!rows.length) issues.push('edge_rows must be non-empty');
validateCounts(rows);
for (const [index, row] of rows.entries()) validateEdgeRow(`edge_rows[${index}]`, row);
for (const check of artifact.checks || []) {
  if (check.status !== 'passed') issues.push(`check ${check.id || '(unknown)'} must pass`);
}
walkNoForbiddenFields(artifact, artifactPath);

if (issues.length) {
  console.error(`Workbench usage selected navigation edge index validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Validated usage selected navigation edge index ${artifactPath}: edges ${rows.length}; same-frame ${artifact.counts.same_frame_edges}; bridge ${artifact.counts.bridge_edges}`);

function validateCounts(rowsToCheck) {
  if (Number(artifact.counts?.edges || 0) !== rowsToCheck.length) issues.push('edges count must equal edge_rows length');
  if (Number(artifact.counts?.edges || 0) <= 0) issues.push('edges must be positive');
  if (Number(artifact.counts?.unique_source_occurrences || 0) <= 0) issues.push('unique_source_occurrences must be positive');
  if (Number(artifact.counts?.unique_target_occurrences || 0) <= 0) issues.push('unique_target_occurrences must be positive');
  if (Number(artifact.counts?.unique_source_occurrences || 0) !== Number(artifact.counts?.unique_target_occurrences || 0)) {
    issues.push('unique source/target occurrence counts must match');
  }
  if (Number(artifact.counts?.unique_source_refs || 0) <= 1) issues.push('unique_source_refs must show diversity');
  if (Number(artifact.counts?.unique_work_anchors || 0) <= 1) issues.push('unique_work_anchors must show diversity');
  if (Number(artifact.counts?.unique_works || 0) <= 1) issues.push('unique_works must show diversity');
  if (Number(artifact.counts?.usage_frames || 0) <= 0) issues.push('usage_frames must be positive');
  if (Number(artifact.counts?.unique_route_ids || 0) <= 0) issues.push('unique_route_ids must be positive');
  if (Number(artifact.counts?.provenance_buckets || 0) <= 0) issues.push('provenance_buckets must be positive');
  if (Number(artifact.counts?.same_frame_edges || 0) <= 0) issues.push('same_frame_edges must be positive');
  if (Number(artifact.counts?.bridge_edges || 0) <= 0) issues.push('bridge_edges must be positive');
  if (Number(artifact.counts?.same_frame_edges || 0) + Number(artifact.counts?.bridge_edges || 0) !== Number(artifact.counts?.edges || 0)) {
    issues.push('same_frame_edges + bridge_edges must equal edges');
  }
  if (Number(artifact.counts?.rows_with_source_context || 0) !== Number(artifact.counts?.edges || 0)) {
    issues.push('rows_with_source_context must equal edges');
  }
  if (Number(artifact.counts?.rows_with_target_context || 0) !== Number(artifact.counts?.edges || 0)) {
    issues.push('rows_with_target_context must equal edges');
  }
  if (Number(artifact.counts?.rows_with_source_link || 0) !== Number(artifact.counts?.edges || 0)) {
    issues.push('rows_with_source_link must equal edges');
  }
  if (Number(artifact.counts?.rows_with_target_link || 0) !== Number(artifact.counts?.edges || 0)) {
    issues.push('rows_with_target_link must equal edges');
  }
  if (Number(artifact.counts?.rows_with_source_provenance || 0) !== Number(artifact.counts?.edges || 0)) {
    issues.push('rows_with_source_provenance must equal edges');
  }
  if (Number(artifact.counts?.rows_with_target_provenance || 0) !== Number(artifact.counts?.edges || 0)) {
    issues.push('rows_with_target_provenance must equal edges');
  }
  if (Number(artifact.counts?.observed_usage_only_rows || 0) !== Number(artifact.counts?.edges || 0)) {
    issues.push('observed_usage_only_rows must equal edges');
  }
  if (Number(artifact.counts?.reader_facing_rows || 0) !== 0) issues.push('reader_facing_rows must be 0');
  if (Number(artifact.counts?.route_payload_field_hits || 0) !== 0) issues.push('route_payload_field_hits must be 0');

  const sourceIds = new Set();
  const targetIds = new Set();
  let sameFrameEdges = 0;
  let bridgeEdges = 0;
  let sourceContextRows = 0;
  let targetContextRows = 0;
  let sourceLinkRows = 0;
  let targetLinkRows = 0;
  let sourceProvenanceRows = 0;
  let targetProvenanceRows = 0;
  for (const row of rowsToCheck) {
    sourceIds.add(row.source_occurrence_id);
    targetIds.add(row.target_occurrence_id);
    if (row.link_kind === 'same_frame') sameFrameEdges += 1;
    if (row.link_kind === 'bridge_frame') bridgeEdges += 1;
    if (row.navigation_flags?.has_source_context) sourceContextRows += 1;
    if (row.navigation_flags?.has_target_context) targetContextRows += 1;
    if (row.navigation_flags?.has_source_link) sourceLinkRows += 1;
    if (row.navigation_flags?.has_target_link) targetLinkRows += 1;
    if (row.navigation_flags?.has_source_provenance) sourceProvenanceRows += 1;
    if (row.navigation_flags?.has_target_provenance) targetProvenanceRows += 1;
  }
  if (Number(artifact.counts?.unique_source_occurrences || 0) !== sourceIds.size) issues.push('unique_source_occurrences must match rows');
  if (Number(artifact.counts?.unique_target_occurrences || 0) !== targetIds.size) issues.push('unique_target_occurrences must match rows');
  if (Number(artifact.counts?.same_frame_edges || 0) !== sameFrameEdges) issues.push('same_frame_edges must match rows');
  if (Number(artifact.counts?.bridge_edges || 0) !== bridgeEdges) issues.push('bridge_edges must match rows');
  if (Number(artifact.counts?.rows_with_source_context || 0) !== sourceContextRows) issues.push('rows_with_source_context must match flags');
  if (Number(artifact.counts?.rows_with_target_context || 0) !== targetContextRows) issues.push('rows_with_target_context must match flags');
  if (Number(artifact.counts?.rows_with_source_link || 0) !== sourceLinkRows) issues.push('rows_with_source_link must match flags');
  if (Number(artifact.counts?.rows_with_target_link || 0) !== targetLinkRows) issues.push('rows_with_target_link must match flags');
  if (Number(artifact.counts?.rows_with_source_provenance || 0) !== sourceProvenanceRows) issues.push('rows_with_source_provenance must match flags');
  if (Number(artifact.counts?.rows_with_target_provenance || 0) !== targetProvenanceRows) issues.push('rows_with_target_provenance must match flags');
}

function validateEdgeRow(context, row) {
  requireFields(row, [
    'edge_id',
    'source_occurrence_id',
    'target_occurrence_id',
    'link_kind',
    'crossmatch_score',
    'crossmatch_strength',
    'relationships',
    'shared_route_ids',
    'shared_slice_ids',
    'source',
    'target',
    'navigation_flags',
  ], context);
  if (!allowedLinkKinds.has(row.link_kind)) issues.push(`${context}: invalid link_kind ${row.link_kind}`);
  if (!allowedStrengths.has(row.crossmatch_strength)) issues.push(`${context}: invalid crossmatch_strength ${row.crossmatch_strength}`);
  if (row.source_occurrence_id === row.target_occurrence_id) issues.push(`${context}: source and target occurrence IDs must differ`);
  if (!Array.isArray(row.relationships) || !row.relationships.length) issues.push(`${context}: relationships must be non-empty array`);
  if (!Array.isArray(row.shared_route_ids) || !row.shared_route_ids.length) issues.push(`${context}: shared_route_ids must be non-empty array`);
  if (!Array.isArray(row.shared_slice_ids) || !row.shared_slice_ids.length) issues.push(`${context}: shared_slice_ids must be non-empty array`);
  validateEndpoint(`${context}.source`, row.source);
  validateEndpoint(`${context}.target`, row.target);
  if (row.link_kind === 'same_frame' && !row.relationships.includes('same_cluster')) {
    issues.push(`${context}: same_frame row must include same_cluster relationship`);
  }
  if (row.link_kind === 'bridge_frame' && row.relationships.includes('same_cluster')) {
    issues.push(`${context}: bridge_frame row must not include same_cluster relationship`);
  }
  if (row.navigation_flags?.observed_usage_only !== true) issues.push(`${context}: navigation_flags.observed_usage_only must be true`);
  if (row.navigation_flags?.reader_facing !== false) issues.push(`${context}: navigation_flags.reader_facing must be false`);
  for (const flag of ['has_source_row', 'has_target_row', 'has_source_context', 'has_target_context', 'has_source_link', 'has_target_link', 'has_source_provenance', 'has_target_provenance', 'has_shared_route_ids']) {
    if (row.navigation_flags?.[flag] !== true) issues.push(`${context}: navigation_flags.${flag} must be true`);
  }
}

function validateEndpoint(context, row) {
  requireFields(row, [
    'source_ref',
    'source_href',
    'work_anchor_href',
    'work_title',
    'work_slug',
    'token_surface',
    'token_normalized',
    'focus_surface',
    'focus_normalized',
    'status',
    'raw_score',
    'cluster_id',
    'usage_frame_label',
    'context_focus_marked',
    'related_route_ids',
    'provenance_id',
    'version_title',
    'version_source',
    'license',
    'license_url',
  ], context);
  if (!String(row.source_href || '').startsWith('http')) issues.push(`${context}: source_href must be absolute URL`);
  if (!String(row.work_anchor_href || '').includes('#')) issues.push(`${context}: work_anchor_href must include anchor`);
  if (!String(row.version_source || '').startsWith('http')) issues.push(`${context}: version_source must be absolute URL`);
  if (!String(row.license_url || '').startsWith('http')) issues.push(`${context}: license_url must be absolute URL`);
  if (!allowedStatuses.has(row.status)) issues.push(`${context}: invalid status ${row.status}`);
  if (!Array.isArray(row.related_route_ids) || !row.related_route_ids.length) issues.push(`${context}: related_route_ids must be non-empty array`);
  if (!hasHebrew(row.token_surface)) issues.push(`${context}: token_surface must include Hebrew`);
  if (!hasHebrew(row.context_focus_marked)) issues.push(`${context}: context_focus_marked must include Hebrew`);
  if (!String(row.context_focus_marked || '').includes('[') || !String(row.context_focus_marked || '').includes(']')) {
    issues.push(`${context}: context_focus_marked must include bracketed focus marker`);
  }
  if (hasMojibake(row.token_surface) || hasMojibake(row.context_focus_marked)) {
    issues.push(`${context}: token or context contains mojibake-like characters`);
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
