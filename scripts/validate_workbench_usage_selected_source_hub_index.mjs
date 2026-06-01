#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/usage-selected-source-hub-index.json');
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
if (artifact.artifact_type !== 'workbench_usage_selected_source_hub_index') {
  issues.push('artifact_type must be workbench_usage_selected_source_hub_index');
}
if (artifact.authority_policy?.usage_navigation_only !== true) issues.push('authority_policy.usage_navigation_only must be true');
if (artifact.authority_policy?.observed_usage_only !== true) issues.push('authority_policy.observed_usage_only must be true');
if (artifact.authority_policy?.ranks_routes !== false) issues.push('authority_policy.ranks_routes must be false');
if (artifact.authority_policy?.selects_visible_result !== false) issues.push('authority_policy.selects_visible_result must be false');
if (artifact.authority_policy?.reader_facing !== false) issues.push('authority_policy.reader_facing must be false');
if (artifact.authority_policy?.carries_route_payloads !== false) issues.push('authority_policy.carries_route_payloads must be false');
if (artifact.authority_policy?.observed_usage_not_semantic_claim !== true) {
  issues.push('authority_policy.observed_usage_not_semantic_claim must be true');
}
if (artifact.quality?.status !== 'passed') issues.push('quality.status must be passed');
if (Number(artifact.quality?.failed_count || 0) !== 0) issues.push('quality.failed_count must be 0');
if (Number(artifact.quality?.warning_count || 0) !== 0) issues.push('quality.warning_count must be 0');

const rows = Array.isArray(artifact.source_hub_rows) ? artifact.source_hub_rows : [];
if (!rows.length) issues.push('source_hub_rows must be non-empty');
validateCounts(rows);
validateRows(rows);
for (const check of artifact.checks || []) {
  if (check.status !== 'passed') issues.push(`check ${check.id || '(unknown)'} must pass`);
}
walkNoForbiddenFields(artifact, artifactPath);

if (issues.length) {
  console.error(`Selected source hub index validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Validated selected source hub index ${artifactPath}: hubs ${artifact.counts.hubs}; occurrence rows ${artifact.counts.occurrence_rows}; target links ${artifact.counts.target_links}`);

function validateCounts(rows) {
  for (const field of [
    'hubs',
    'occurrence_rows',
    'occurrence_samples',
    'target_links',
    'same_frame_links',
    'bridge_frame_links',
    'strong_links',
    'moderate_links',
    'weak_links',
    'unique_source_refs',
    'unique_work_anchors',
    'unique_works',
    'usage_frames',
    'source_clusters',
    'unique_route_ids',
    'provenance_buckets',
    'licenses',
    'version_sources',
    'duplicate_source_ref_hubs',
    'duplicate_source_ref_occurrence_rows',
    'rows_with_source_link',
    'rows_with_work_anchor',
    'rows_with_marked_context',
    'rows_with_provenance',
    'target_samples',
    'target_samples_with_links',
    'target_samples_with_context',
    'observed_usage_only_rows',
    'reader_facing_rows',
    'route_payload_field_hits',
    'expected_occurrence_rows',
    'expected_target_links',
    'expected_same_frame_links',
    'expected_bridge_frame_links',
    'expected_route_ids',
  ]) {
    const value = Number(artifact.counts?.[field]);
    if (!Number.isInteger(value) || value < 0) issues.push(`counts.${field} must be a non-negative integer`);
  }
  if (Number(artifact.counts?.hubs || 0) !== rows.length) issues.push('counts.hubs must equal source_hub_rows length');
  if (Number(artifact.counts?.occurrence_rows || 0) !== Number(artifact.counts?.expected_occurrence_rows || 0)) {
    issues.push('occurrence_rows must equal expected_occurrence_rows');
  }
  if (Number(artifact.counts?.target_links || 0) !== Number(artifact.counts?.expected_target_links || 0)) {
    issues.push('target_links must equal expected_target_links');
  }
  if (Number(artifact.counts?.same_frame_links || 0) !== Number(artifact.counts?.expected_same_frame_links || 0)) {
    issues.push('same_frame_links must equal expected_same_frame_links');
  }
  if (Number(artifact.counts?.bridge_frame_links || 0) !== Number(artifact.counts?.expected_bridge_frame_links || 0)) {
    issues.push('bridge_frame_links must equal expected_bridge_frame_links');
  }
  if (Number(artifact.counts?.strong_links || 0) + Number(artifact.counts?.moderate_links || 0) + Number(artifact.counts?.weak_links || 0) !== Number(artifact.counts?.target_links || 0)) {
    issues.push('strong/moderate/weak links must equal target_links');
  }
  if (Number(artifact.counts?.unique_route_ids || 0) !== Number(artifact.counts?.expected_route_ids || 0)) {
    issues.push('unique_route_ids must equal expected_route_ids');
  }
  if (Number(artifact.counts?.rows_with_source_link || 0) !== rows.length) issues.push('rows_with_source_link must equal hubs');
  if (Number(artifact.counts?.rows_with_work_anchor || 0) !== rows.length) issues.push('rows_with_work_anchor must equal hubs');
  if (Number(artifact.counts?.rows_with_marked_context || 0) !== rows.length) issues.push('rows_with_marked_context must equal hubs');
  if (Number(artifact.counts?.rows_with_provenance || 0) !== rows.length) issues.push('rows_with_provenance must equal hubs');
  if (Number(artifact.counts?.target_samples_with_links || 0) !== Number(artifact.counts?.target_samples || 0)) {
    issues.push('target_samples_with_links must equal target_samples');
  }
  if (Number(artifact.counts?.target_samples_with_context || 0) !== Number(artifact.counts?.target_samples || 0)) {
    issues.push('target_samples_with_context must equal target_samples');
  }
  if (Number(artifact.counts?.observed_usage_only_rows || 0) !== rows.length) issues.push('observed_usage_only_rows must equal hubs');
  if (Number(artifact.counts?.reader_facing_rows || 0) !== 0) issues.push('reader_facing_rows must be 0');
  if (Number(artifact.counts?.route_payload_field_hits || 0) !== 0) issues.push('route_payload_field_hits must be 0');
}

function validateRows(rows) {
  const ids = new Set();
  for (const [index, row] of rows.entries()) {
    const prefix = `source_hub_rows[${index}]`;
    if (!row.source_hub_id) issues.push(`${prefix}.source_hub_id is required`);
    if (ids.has(row.source_hub_id)) issues.push(`${prefix}.source_hub_id is duplicated`);
    ids.add(row.source_hub_id);
    if (!row.source_ref) issues.push(`${prefix}.source_ref is required`);
    if (!row.source_href) issues.push(`${prefix}.source_href is required`);
    if (!Array.isArray(row.work_anchor_hrefs) || !row.work_anchor_hrefs.length) issues.push(`${prefix}.work_anchor_hrefs must be non-empty`);
    if (!Array.isArray(row.usage_frame_labels) || !row.usage_frame_labels.length) issues.push(`${prefix}.usage_frame_labels must be non-empty`);
    if (!Array.isArray(row.cluster_ids) || !row.cluster_ids.length) issues.push(`${prefix}.cluster_ids must be non-empty`);
    if (Number(row.counts?.occurrence_rows || 0) <= 0) issues.push(`${prefix}.counts.occurrence_rows must be positive`);
    if (Number(row.counts?.target_links || 0) <= 0) issues.push(`${prefix}.counts.target_links must be positive`);
    if (Number(row.counts?.same_frame_links || 0) + Number(row.counts?.bridge_frame_links || 0) !== Number(row.counts?.target_links || 0)) {
      issues.push(`${prefix}.same_frame_links + bridge_frame_links must equal target_links`);
    }
    if (Number(row.counts?.strong_links || 0) + Number(row.counts?.moderate_links || 0) + Number(row.counts?.weak_links || 0) !== Number(row.counts?.target_links || 0)) {
      issues.push(`${prefix}.strong/moderate/weak links must equal target_links`);
    }
    if (!Array.isArray(row.related_route_ids) || !row.related_route_ids.length) issues.push(`${prefix}.related_route_ids must be non-empty`);
    if (!Array.isArray(row.occurrences) || !row.occurrences.length) issues.push(`${prefix}.occurrences must be non-empty`);
    for (const [occurrenceIndex, occurrence] of (row.occurrences || []).entries()) {
      const occurrencePrefix = `${prefix}.occurrences[${occurrenceIndex}]`;
      if (!occurrence.occurrence_id) issues.push(`${occurrencePrefix}.occurrence_id is required`);
      if (!occurrence.source_href) issues.push(`${occurrencePrefix}.source_href is required`);
      if (!occurrence.work_anchor_href) issues.push(`${occurrencePrefix}.work_anchor_href is required`);
      if (!occurrence.context_focus_marked) issues.push(`${occurrencePrefix}.context_focus_marked is required`);
      if (!occurrence.focus_normalized) issues.push(`${occurrencePrefix}.focus_normalized is required`);
      if (!occurrence.license || !occurrence.license_url) issues.push(`${occurrencePrefix}.license metadata is required`);
      if (!occurrence.version_source) issues.push(`${occurrencePrefix}.version_source is required`);
    }
    if (row.navigation_flags?.observed_usage_only !== true) issues.push(`${prefix}.navigation_flags.observed_usage_only must be true`);
    if (row.navigation_flags?.reader_facing !== false) issues.push(`${prefix}.navigation_flags.reader_facing must be false`);
    if (row.navigation_flags?.has_source_link !== true) issues.push(`${prefix}.navigation_flags.has_source_link must be true`);
    if (row.navigation_flags?.has_work_anchor !== true) issues.push(`${prefix}.navigation_flags.has_work_anchor must be true`);
    if (row.navigation_flags?.has_marked_context !== true) issues.push(`${prefix}.navigation_flags.has_marked_context must be true`);
    if (row.navigation_flags?.has_provenance !== true) issues.push(`${prefix}.navigation_flags.has_provenance must be true`);
    if (row.navigation_flags?.route_ids_only !== true) issues.push(`${prefix}.navigation_flags.route_ids_only must be true`);
    if (row.navigation_flags?.target_samples_have_links !== true) issues.push(`${prefix}.navigation_flags.target_samples_have_links must be true`);
    if (row.navigation_flags?.target_samples_have_context !== true) issues.push(`${prefix}.navigation_flags.target_samples_have_context must be true`);
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
