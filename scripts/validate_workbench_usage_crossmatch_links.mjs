#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/usage-crossmatch-links.json');
const artifact = JSON.parse(fs.readFileSync(path.join(root, artifactPath), 'utf8'));
const issues = [];
const allowedRelationships = new Set([
  'same_focus_normalized',
  'same_token_key',
  'same_cluster',
  'shared_route_id',
  'same_source_ref',
  'same_work',
  'same_status',
  'same_license',
  'shared_slice',
]);
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
if (artifact.artifact_type !== 'workbench_usage_navigation_crossmatch_links') {
  issues.push('artifact_type must be workbench_usage_navigation_crossmatch_links');
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

const occurrences = Array.isArray(artifact.occurrences) ? artifact.occurrences : [];
const edges = Array.isArray(artifact.edges) ? artifact.edges : [];
const adjacency = Array.isArray(artifact.adjacency) ? artifact.adjacency : [];
const occurrenceIds = new Set();
const edgeIds = new Set();
const expectedDirectedEdges = occurrences.length * Math.max(0, occurrences.length - 1);

if (!occurrences.length) issues.push('occurrences must be non-empty');
for (const occurrence of occurrences) {
  if (!occurrence.occurrence_id) issues.push('occurrence missing occurrence_id');
  if (occurrenceIds.has(occurrence.occurrence_id)) issues.push(`duplicate occurrence_id ${occurrence.occurrence_id}`);
  occurrenceIds.add(occurrence.occurrence_id);
  if (!occurrence.source_ref) issues.push(`${occurrence.occurrence_id}: source_ref must be present`);
  if (!occurrence.source_href) issues.push(`${occurrence.occurrence_id}: source_href must be present`);
  if (!occurrence.work_anchor_href) issues.push(`${occurrence.occurrence_id}: work_anchor_href must be present`);
  if (!occurrence.focus_normalized) issues.push(`${occurrence.occurrence_id}: focus_normalized must be present`);
  if (!Array.isArray(occurrence.route_ids)) issues.push(`${occurrence.occurrence_id}: route_ids must be an array`);
  if (!Array.isArray(occurrence.slice_ids)) issues.push(`${occurrence.occurrence_id}: slice_ids must be an array`);
  if (!occurrence.license) issues.push(`${occurrence.occurrence_id}: license must be present`);
  if (!occurrence.license_url) issues.push(`${occurrence.occurrence_id}: license_url must be present`);
}

if (Number(artifact.counts?.occurrence_refs || 0) !== occurrences.length) issues.push('counts.occurrence_refs must equal occurrences length');
if (Number(artifact.counts?.directed_edges || 0) !== edges.length) issues.push('counts.directed_edges must equal edges length');
if (edges.length !== expectedDirectedEdges) issues.push(`edges length must be complete directed graph ${expectedDirectedEdges}`);
if (Number(artifact.counts?.undirected_pairs || 0) !== expectedDirectedEdges / 2) {
  issues.push('counts.undirected_pairs must equal directed edge count / 2');
}

for (const edge of edges) {
  if (!edge.edge_id) issues.push('edge missing edge_id');
  if (edgeIds.has(edge.edge_id)) issues.push(`duplicate edge_id ${edge.edge_id}`);
  edgeIds.add(edge.edge_id);
  if (!occurrenceIds.has(edge.source_occurrence_id)) issues.push(`${edge.edge_id}: unknown source_occurrence_id`);
  if (!occurrenceIds.has(edge.target_occurrence_id)) issues.push(`${edge.edge_id}: unknown target_occurrence_id`);
  if (edge.source_occurrence_id === edge.target_occurrence_id) issues.push(`${edge.edge_id}: source and target must differ`);
  if (!Number.isInteger(edge.crossmatch_score) || edge.crossmatch_score < 0 || edge.crossmatch_score > 100) {
    issues.push(`${edge.edge_id}: crossmatch_score must be an integer 0-100`);
  }
  if (!['strong', 'moderate', 'weak'].includes(edge.crossmatch_strength)) {
    issues.push(`${edge.edge_id}: crossmatch_strength must be strong/moderate/weak`);
  }
  if (!Array.isArray(edge.relationships) || edge.relationships.length === 0) issues.push(`${edge.edge_id}: relationships must be non-empty`);
  for (const relationship of edge.relationships || []) {
    if (!allowedRelationships.has(relationship)) issues.push(`${edge.edge_id}: unknown relationship ${relationship}`);
  }
  if (!edge.relationships?.includes('same_focus_normalized') && !edge.relationships?.includes('same_token_key')) {
    issues.push(`${edge.edge_id}: must link by normalized focus or token key`);
  }
}

for (const entry of adjacency) {
  if (!occurrenceIds.has(entry.occurrence_id)) issues.push(`adjacency entry has unknown occurrence_id ${entry.occurrence_id}`);
  const links = Array.isArray(entry.links) ? entry.links : [];
  if (links.length !== Math.max(0, occurrences.length - 1)) {
    issues.push(`${entry.occurrence_id}: adjacency links must include every other occurrence`);
  }
  for (const link of links) {
    if (!occurrenceIds.has(link.target_occurrence_id)) issues.push(`${entry.occurrence_id}: unknown target ${link.target_occurrence_id}`);
    if (link.target_occurrence_id === entry.occurrence_id) issues.push(`${entry.occurrence_id}: adjacency self-link not allowed`);
    if (!edgeIds.has(link.edge_id)) issues.push(`${entry.occurrence_id}: adjacency link references unknown edge ${link.edge_id}`);
  }
}

for (const check of artifact.checks || []) {
  if (check.status !== 'passed') issues.push(`check ${check.id || '(unknown)'} must pass`);
}
walkNoForbiddenFields(artifact, artifactPath);

if (issues.length) {
  console.error(`Workbench usage crossmatch links validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Validated usage crossmatch links ${artifactPath}: occurrences ${occurrences.length}; edges ${edges.length}`);

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
