#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/usage-selected-occurrence-adjacency-index.json');
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
if (artifact.artifact_type !== 'workbench_usage_selected_occurrence_adjacency_index') {
  issues.push('artifact_type must be workbench_usage_selected_occurrence_adjacency_index');
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

const rows = Array.isArray(artifact.adjacency_rows) ? artifact.adjacency_rows : [];
if (!rows.length) issues.push('adjacency_rows must be non-empty');
validateCounts(rows);
validateRows(rows);
walkNoForbiddenFields(artifact, artifactPath);

if (issues.length) {
  console.error(`Selected occurrence adjacency index validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Validated selected occurrence adjacency index ${artifactPath}: rows ${artifact.counts.rows}; target links ${artifact.counts.target_links}`);

function validateCounts(rows) {
  for (const field of [
    'rows',
    'source_occurrences',
    'target_links',
    'expected_target_links',
    'unique_source_refs',
    'unique_work_anchors',
    'unique_works',
    'source_clusters',
    'usage_frames',
    'unique_route_ids',
    'provenance_buckets',
    'target_provenance_buckets',
    'same_frame_links',
    'bridge_frame_links',
    'strong_links',
    'moderate_links',
    'weak_links',
    'rows_with_source_context',
    'rows_with_source_link',
    'rows_with_source_provenance',
    'rows_with_complete_targets',
    'target_links_with_context',
    'target_links_with_source_link',
    'target_links_with_provenance',
    'observed_usage_only_rows',
    'reader_facing_rows',
    'route_payload_field_hits',
  ]) {
    const value = Number(artifact.counts?.[field]);
    if (!Number.isInteger(value) || value < 0) issues.push(`counts.${field} must be a non-negative integer`);
  }

  const targetLinks = rows.flatMap((row) => row.target_links || []);
  if (Number(artifact.counts?.rows || 0) !== rows.length) issues.push('counts.rows must equal adjacency_rows length');
  if (Number(artifact.counts?.source_occurrences || 0) !== rows.length) issues.push('counts.source_occurrences must equal adjacency_rows length');
  if (Number(artifact.counts?.target_links || 0) !== targetLinks.length) issues.push('counts.target_links must equal target_links length');
  if (Number(artifact.counts?.expected_target_links || 0) !== Number(artifact.counts?.target_links || 0)) {
    issues.push('expected_target_links must equal target_links');
  }
  if (Number(artifact.counts?.same_frame_links || 0) + Number(artifact.counts?.bridge_frame_links || 0) !== Number(artifact.counts?.target_links || 0)) {
    issues.push('same_frame_links + bridge_frame_links must equal target_links');
  }
  if (Number(artifact.counts?.strong_links || 0) + Number(artifact.counts?.moderate_links || 0) + Number(artifact.counts?.weak_links || 0) !== Number(artifact.counts?.target_links || 0)) {
    issues.push('strong_links + moderate_links + weak_links must equal target_links');
  }
  if (Number(artifact.counts?.rows_with_source_context || 0) !== rows.length) issues.push('rows_with_source_context must equal rows');
  if (Number(artifact.counts?.rows_with_source_link || 0) !== rows.length) issues.push('rows_with_source_link must equal rows');
  if (Number(artifact.counts?.rows_with_source_provenance || 0) !== rows.length) issues.push('rows_with_source_provenance must equal rows');
  if (Number(artifact.counts?.rows_with_complete_targets || 0) !== rows.length) issues.push('rows_with_complete_targets must equal rows');
  if (Number(artifact.counts?.target_links_with_context || 0) !== targetLinks.length) issues.push('target_links_with_context must equal target_links');
  if (Number(artifact.counts?.target_links_with_source_link || 0) !== targetLinks.length) issues.push('target_links_with_source_link must equal target_links');
  if (Number(artifact.counts?.target_links_with_provenance || 0) !== targetLinks.length) issues.push('target_links_with_provenance must equal target_links');
  if (Number(artifact.counts?.observed_usage_only_rows || 0) !== rows.length) issues.push('observed_usage_only_rows must equal rows');
  if (Number(artifact.counts?.reader_facing_rows || 0) !== 0) issues.push('reader_facing_rows must be 0');
  if (Number(artifact.counts?.route_payload_field_hits || 0) !== 0) issues.push('route_payload_field_hits must be 0');
}

function validateRows(rows) {
  const ids = new Set();
  for (const [index, row] of rows.entries()) {
    const prefix = `adjacency_rows[${index}]`;
    if (!row.occurrence_id) issues.push(`${prefix}.occurrence_id is required`);
    if (ids.has(row.occurrence_id)) issues.push(`${prefix}.occurrence_id is duplicated`);
    ids.add(row.occurrence_id);
    if (!row.source?.source_ref) issues.push(`${prefix}.source.source_ref is required`);
    if (!row.source?.source_href) issues.push(`${prefix}.source.source_href is required`);
    if (!row.source?.work_anchor_href) issues.push(`${prefix}.source.work_anchor_href is required`);
    if (!row.source?.context_focus_marked) issues.push(`${prefix}.source.context_focus_marked is required`);
    if (!row.source?.provenance_id) issues.push(`${prefix}.source.provenance_id is required`);
    if (!row.source?.license) issues.push(`${prefix}.source.license is required`);
    if (!row.source?.version_title) issues.push(`${prefix}.source.version_title is required`);
    if (row.navigation_flags?.observed_usage_only !== true) issues.push(`${prefix}.navigation_flags.observed_usage_only must be true`);
    if (row.navigation_flags?.reader_facing !== false) issues.push(`${prefix}.navigation_flags.reader_facing must be false`);
    if (row.navigation_flags?.target_links_complete !== true) issues.push(`${prefix}.navigation_flags.target_links_complete must be true`);
    if (!Array.isArray(row.target_links) || !row.target_links.length) issues.push(`${prefix}.target_links must be non-empty`);
    if (Number(row.adjacency_counts?.target_links || 0) !== row.target_links.length) {
      issues.push(`${prefix}.adjacency_counts.target_links must equal target_links length`);
    }
    if (Number(row.adjacency_counts?.same_frame_links || 0) + Number(row.adjacency_counts?.bridge_frame_links || 0) !== row.target_links.length) {
      issues.push(`${prefix}.same/bridge link counts must equal target_links length`);
    }
    for (const [targetIndex, link] of (row.target_links || []).entries()) {
      const targetPrefix = `${prefix}.target_links[${targetIndex}]`;
      if (!link.target_occurrence_id) issues.push(`${targetPrefix}.target_occurrence_id is required`);
      if (!['same_frame', 'bridge_frame'].includes(link.link_kind)) issues.push(`${targetPrefix}.link_kind must be same_frame or bridge_frame`);
      if (!Number.isFinite(Number(link.crossmatch_score))) issues.push(`${targetPrefix}.crossmatch_score must be numeric`);
      if (!['strong', 'moderate', 'weak'].includes(link.crossmatch_strength)) issues.push(`${targetPrefix}.crossmatch_strength is invalid`);
      if (!link.target?.source_ref) issues.push(`${targetPrefix}.target.source_ref is required`);
      if (!link.target?.source_href) issues.push(`${targetPrefix}.target.source_href is required`);
      if (!link.target?.work_anchor_href) issues.push(`${targetPrefix}.target.work_anchor_href is required`);
      if (!link.target?.context_focus_marked) issues.push(`${targetPrefix}.target.context_focus_marked is required`);
      if (!link.target?.provenance_id) issues.push(`${targetPrefix}.target.provenance_id is required`);
      if (!link.target?.license) issues.push(`${targetPrefix}.target.license is required`);
      if (!link.target?.version_title) issues.push(`${targetPrefix}.target.version_title is required`);
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
