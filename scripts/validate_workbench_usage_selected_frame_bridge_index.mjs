#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/usage-selected-frame-bridge-index.json');
const artifact = readJson(artifactPath);
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

if (artifact.schema_version !== 1) issues.push('schema_version must be 1');
if (artifact.artifact_type !== 'workbench_usage_selected_frame_bridge_index') {
  issues.push('artifact_type must be workbench_usage_selected_frame_bridge_index');
}
if (artifact.authority_policy?.usage_navigation_only !== true) issues.push('authority_policy.usage_navigation_only must be true');
if (artifact.authority_policy?.observed_usage_not_semantic_claim !== true) {
  issues.push('authority_policy.observed_usage_not_semantic_claim must be true');
}
if (artifact.authority_policy?.ranks_routes !== false) issues.push('authority_policy.ranks_routes must be false');
if (artifact.authority_policy?.selects_visible_result !== false) issues.push('authority_policy.selects_visible_result must be false');
if (artifact.authority_policy?.reader_facing !== false) issues.push('authority_policy.reader_facing must be false');
if (artifact.authority_policy?.carries_route_payloads !== false) issues.push('authority_policy.carries_route_payloads must be false');
if (artifact.quality?.status !== 'passed') issues.push('quality.status must be passed');
if (Number(artifact.quality?.failed_count || 0) !== 0) issues.push('quality.failed_count must be 0');
if (Number(artifact.quality?.warning_count || 0) !== 0) issues.push('quality.warning_count must be 0');

const rows = Array.isArray(artifact.frame_bridge_rows) ? artifact.frame_bridge_rows : [];
if (!rows.length) issues.push('frame_bridge_rows must be non-empty');
validateCounts(rows);
validateRows(rows);
walkNoForbiddenFields(artifact, artifactPath);

if (issues.length) {
  console.error(`Selected frame bridge index validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Validated selected frame bridge index ${artifactPath}: rows ${artifact.counts.rows}; edge memberships ${artifact.counts.edge_memberships}`);

function validateCounts(rows) {
  for (const field of [
    'rows',
    'edge_memberships',
    'same_frame_rows',
    'bridge_frame_rows',
    'same_frame_edges',
    'bridge_frame_edges',
    'source_clusters',
    'target_clusters',
    'unique_route_ids',
    'provenance_buckets',
    'sample_rows',
    'sample_rows_with_links',
    'sample_rows_with_context',
    'observed_usage_only_rows',
    'reader_facing_rows',
    'route_payload_field_hits',
    'expected_edges',
    'expected_same_frame_edges',
    'expected_bridge_edges',
  ]) {
    const value = Number(artifact.counts?.[field]);
    if (!Number.isInteger(value) || value < 0) issues.push(`counts.${field} must be a non-negative integer`);
  }
  if (Number(artifact.counts?.rows || 0) !== rows.length) issues.push('counts.rows must equal frame_bridge_rows length');
  if (Number(artifact.counts?.edge_memberships || 0) !== Number(artifact.counts?.expected_edges || 0)) {
    issues.push('edge_memberships must equal expected_edges');
  }
  if (Number(artifact.counts?.same_frame_edges || 0) !== Number(artifact.counts?.expected_same_frame_edges || 0)) {
    issues.push('same_frame_edges must equal expected_same_frame_edges');
  }
  if (Number(artifact.counts?.bridge_frame_edges || 0) !== Number(artifact.counts?.expected_bridge_edges || 0)) {
    issues.push('bridge_frame_edges must equal expected_bridge_edges');
  }
  if (Number(artifact.counts?.same_frame_rows || 0) <= 0) issues.push('same_frame_rows must be positive');
  if (Number(artifact.counts?.bridge_frame_rows || 0) <= 0) issues.push('bridge_frame_rows must be positive');
  if (Number(artifact.counts?.sample_rows_with_links || 0) !== Number(artifact.counts?.sample_rows || 0)) {
    issues.push('sample_rows_with_links must equal sample_rows');
  }
  if (Number(artifact.counts?.sample_rows_with_context || 0) !== Number(artifact.counts?.sample_rows || 0)) {
    issues.push('sample_rows_with_context must equal sample_rows');
  }
  if (Number(artifact.counts?.observed_usage_only_rows || 0) !== rows.length) issues.push('observed_usage_only_rows must equal rows');
  if (Number(artifact.counts?.reader_facing_rows || 0) !== 0) issues.push('reader_facing_rows must be 0');
  if (Number(artifact.counts?.route_payload_field_hits || 0) !== 0) issues.push('route_payload_field_hits must be 0');
}

function validateRows(rows) {
  const ids = new Set();
  for (const [index, row] of rows.entries()) {
    const prefix = `frame_bridge_rows[${index}]`;
    if (!row.frame_bridge_id) issues.push(`${prefix}.frame_bridge_id is required`);
    if (ids.has(row.frame_bridge_id)) issues.push(`${prefix}.frame_bridge_id is duplicated`);
    ids.add(row.frame_bridge_id);
    if (!['same_frame', 'bridge_frame'].includes(row.link_kind)) issues.push(`${prefix}.link_kind must be same_frame or bridge_frame`);
    if (!row.source_cluster_id) issues.push(`${prefix}.source_cluster_id is required`);
    if (!row.target_cluster_id) issues.push(`${prefix}.target_cluster_id is required`);
    if (!row.source_usage_frame_label) issues.push(`${prefix}.source_usage_frame_label is required`);
    if (!row.target_usage_frame_label) issues.push(`${prefix}.target_usage_frame_label is required`);
    if (Number(row.counts?.edge_memberships || 0) <= 0) issues.push(`${prefix}.counts.edge_memberships must be positive`);
    if (Number(row.counts?.strong_edges || 0) + Number(row.counts?.moderate_edges || 0) + Number(row.counts?.weak_edges || 0) !== Number(row.counts?.edge_memberships || 0)) {
      issues.push(`${prefix}.strength counts must equal edge_memberships`);
    }
    if (!Array.isArray(row.shared_route_ids) || !row.shared_route_ids.length) issues.push(`${prefix}.shared_route_ids must be non-empty`);
    if (!Array.isArray(row.samples) || !row.samples.length) issues.push(`${prefix}.samples must be non-empty`);
    if (row.navigation_flags?.observed_usage_only !== true) issues.push(`${prefix}.navigation_flags.observed_usage_only must be true`);
    if (row.navigation_flags?.reader_facing !== false) issues.push(`${prefix}.navigation_flags.reader_facing must be false`);
    if (row.navigation_flags?.samples_have_links !== true) issues.push(`${prefix}.navigation_flags.samples_have_links must be true`);
    if (row.navigation_flags?.samples_have_context !== true) issues.push(`${prefix}.navigation_flags.samples_have_context must be true`);
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
