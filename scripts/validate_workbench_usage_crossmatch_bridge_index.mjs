#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/usage-crossmatch-bridge-index.json');
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
if (artifact.artifact_type !== 'workbench_usage_navigation_crossmatch_bridge_index') {
  issues.push('artifact_type must be workbench_usage_navigation_crossmatch_bridge_index');
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

const bridges = Array.isArray(artifact.bridges) ? artifact.bridges : [];
const bridgeEdges = Array.isArray(artifact.bridge_edges) ? artifact.bridge_edges : [];
if (!bridges.length) issues.push('bridges must be non-empty');
if (!bridgeEdges.length) issues.push('bridge_edges must be non-empty');
if (Number(artifact.counts?.same_frame_edges || 0) + Number(artifact.counts?.bridge_edges || 0) !== Number(artifact.counts?.directed_edges || 0)) {
  issues.push('same_frame_edges + bridge_edges must equal directed_edges');
}
if (Number(artifact.counts?.bridge_edges || 0) !== bridgeEdges.length) issues.push('counts.bridge_edges must equal bridge_edges length');
if (Number(artifact.counts?.bridge_buckets || 0) !== bridges.length) issues.push('counts.bridge_buckets must equal bridges length');
const strengthRows = Number(artifact.counts?.bridge_strength_counts?.strong || 0)
  + Number(artifact.counts?.bridge_strength_counts?.moderate || 0)
  + Number(artifact.counts?.bridge_strength_counts?.weak || 0);
if (strengthRows !== bridgeEdges.length) issues.push('bridge strength counts must equal bridge_edges length');

for (const bucket of bridges) {
  if (!bucket.key) issues.push('bridge bucket missing key');
  if (bucket.source_cluster_id === bucket.target_cluster_id) issues.push(`${bucket.key}: source and target clusters must differ`);
  if (!String(bucket.bridge_policy || '').includes('do not treat as a merged meaning')) {
    issues.push(`${bucket.key}: bridge_policy must block semantic merge`);
  }
  if (Number(bucket.counts?.edges || 0) <= 0) issues.push(`${bucket.key}: bucket edges must be positive`);
}

for (const edge of bridgeEdges) {
  if (!edge.edge_id) issues.push('bridge edge missing edge_id');
  if (edge.source_cluster_id === edge.target_cluster_id) issues.push(`${edge.edge_id}: source and target clusters must differ`);
  if (edge.relationships?.includes('same_cluster')) issues.push(`${edge.edge_id}: bridge edge must not include same_cluster`);
  if (!edge.relationships?.includes('same_focus_normalized') && !edge.relationships?.includes('same_token_key')) {
    issues.push(`${edge.edge_id}: bridge edge must still link by normalized focus or token key`);
  }
  if (!Array.isArray(edge.shared_route_ids)) issues.push(`${edge.edge_id}: shared_route_ids must be an array`);
}

for (const check of artifact.checks || []) {
  if (check.status !== 'passed') issues.push(`check ${check.id || '(unknown)'} must pass`);
}
walkNoForbiddenFields(artifact, artifactPath);

if (issues.length) {
  console.error(`Workbench usage crossmatch bridge index validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Validated usage crossmatch bridge index ${artifactPath}: bridges ${bridges.length}; bridge edges ${bridgeEdges.length}`);

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
