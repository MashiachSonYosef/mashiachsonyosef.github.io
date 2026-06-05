#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packetPath = cleanRelativePath(process.argv[2] || 'data/definitions/definition-workbench-usage-crossmatch-neighbors.json');
const packet = readJson(packetPath);
const issues = [];
const forbiddenAuthorityKeys = new Set([
  'definition',
  'definition_text',
  'meaning',
  'meaning_claim',
  'translation',
  'translation_text',
  'accepted_translation',
  'final_answer',
  'winner',
  'route_payload',
  'route_payloads',
]);
const allowedStatuses = new Set(['supported', 'candidate', 'weak']);
const allowedLinkKinds = new Set(['same_frame', 'bridge_frame']);
const allowedStrengths = new Set(['strong', 'moderate', 'weak']);

if (packet.schema_version !== 1) issues.push('schema_version must be 1');
if (packet.artifact_type !== 'definition_workbench_usage_crossmatch_neighbors') {
  issues.push('artifact_type must be definition_workbench_usage_crossmatch_neighbors');
}
if (!String(packet.policy || '').includes('crossmatch-neighbor packet')) {
  issues.push('policy must identify crossmatch-neighbor packet');
}

validateAuthorityPolicy(packet.authority_policy || {});
validateInputs(packet.inputs || {});
validateCounts(packet.counts || {});
validateChecks(packet.checks || []);
validateRows(Array.isArray(packet.crossmatch_rows) ? packet.crossmatch_rows : []);
validateForbiddenAuthorityKeys(packet);

if (issues.length) {
  console.error(`Definition Workbench usage crossmatch neighbors validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 160)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Definition Workbench usage crossmatch neighbors validation passed.');
console.log(`Rows: ${packet.counts.source_occurrence_rows}; links: ${packet.counts.neighbor_link_rows}; reader-facing: ${packet.counts.reader_facing_rows}.`);

function validateAuthorityPolicy(policy) {
  const expectedTrue = [
    'usage_navigation_only',
    'observed_usage_only',
    'crossmatch_neighbors_only',
    'occurrence_links_only',
    'route_ids_only',
  ];
  const expectedFalse = [
    'reader_facing',
    'copies_route_payloads',
    'copies_definition_payloads',
    'ranks_routes',
    'selects_visible_result',
    'semantic_arbitration',
    'publication_claim',
  ];
  for (const key of expectedTrue) {
    if (policy[key] !== true) issues.push(`authority_policy.${key} must be true`);
  }
  for (const key of expectedFalse) {
    if (policy[key] !== false) issues.push(`authority_policy.${key} must be false`);
  }
}

function validateInputs(inputs) {
  for (const [key, value] of Object.entries(inputs)) {
    if (!value || !fs.existsSync(path.join(root, cleanRelativePath(value)))) {
      issues.push(`inputs.${key} must point to an existing local artifact`);
    }
  }
}

function validateCounts(counts) {
  const required = [
    'source_occurrence_rows',
    'neighbor_link_rows',
    'same_frame_neighbor_links',
    'bridge_frame_neighbor_links',
    'unique_source_refs',
    'unique_target_refs',
    'unique_works',
    'cluster_ids',
    'usage_frames',
    'route_ids',
    'unresolved_route_ids',
    'rows_with_source_link',
    'rows_with_hebrew_context',
    'rows_with_focus_marker',
    'rows_with_provenance',
    'neighbor_links_with_target_link',
    'neighbor_links_with_target_context',
    'neighbor_links_with_focus_marker',
    'neighbor_links_with_target_provenance',
    'observed_usage_only_rows',
    'reader_facing_rows',
    'route_payload_field_hits',
    'forbidden_authority_field_hits',
  ];
  for (const key of required) {
    if (!Number.isInteger(counts[key]) || counts[key] < 0) issues.push(`counts.${key} must be a non-negative integer`);
  }
  if (counts.source_occurrence_rows <= 0) issues.push('source_occurrence_rows must be positive');
  if (counts.neighbor_link_rows <= 0) issues.push('neighbor_link_rows must be positive');
  if (counts.same_frame_neighbor_links <= 0) issues.push('same_frame_neighbor_links must be positive');
  if (counts.bridge_frame_neighbor_links <= 0) issues.push('bridge_frame_neighbor_links must be positive');
  if (counts.same_frame_neighbor_links + counts.bridge_frame_neighbor_links !== counts.neighbor_link_rows) {
    issues.push('same_frame_neighbor_links + bridge_frame_neighbor_links must equal neighbor_link_rows');
  }
  if (counts.rows_with_source_link !== counts.source_occurrence_rows) issues.push('source links must be complete');
  if (counts.rows_with_hebrew_context !== counts.source_occurrence_rows) issues.push('source Hebrew context must be complete');
  if (counts.rows_with_focus_marker !== counts.source_occurrence_rows) issues.push('source focus markers must be complete');
  if (counts.rows_with_provenance !== counts.source_occurrence_rows) issues.push('source provenance must be complete');
  if (counts.neighbor_links_with_target_link !== counts.neighbor_link_rows) issues.push('target links must be complete');
  if (counts.neighbor_links_with_target_context !== counts.neighbor_link_rows) issues.push('target Hebrew context must be complete');
  if (counts.neighbor_links_with_focus_marker !== counts.neighbor_link_rows) issues.push('target focus markers must be complete');
  if (counts.neighbor_links_with_target_provenance !== counts.neighbor_link_rows) issues.push('target provenance must be complete');
  if (counts.route_ids <= 0) issues.push('route_ids must be positive');
  if (counts.unresolved_route_ids !== 0) issues.push('unresolved_route_ids must be 0');
  if (counts.observed_usage_only_rows !== counts.source_occurrence_rows) issues.push('all rows must be observed usage only');
  if (counts.reader_facing_rows !== 0) issues.push('reader_facing_rows must be 0');
  if (counts.route_payload_field_hits !== 0) issues.push('route_payload_field_hits must be 0');
  if (counts.forbidden_authority_field_hits !== 0) issues.push('forbidden_authority_field_hits must be 0');
  if (sumCounts(counts.source_status_counts) !== counts.source_occurrence_rows) {
    issues.push('source_status_counts must sum to source_occurrence_rows');
  }
  if (sumCounts(counts.target_status_counts) !== counts.neighbor_link_rows) {
    issues.push('target_status_counts must sum to neighbor_link_rows');
  }
  if (sumCounts(counts.crossmatch_strength_counts) !== counts.neighbor_link_rows) {
    issues.push('crossmatch_strength_counts must sum to neighbor_link_rows');
  }
}

function validateChecks(checks) {
  if (!Array.isArray(checks) || checks.length === 0) issues.push('checks must be a non-empty array');
  const failed = checks.filter((check) => check.status === 'failed');
  if (failed.length) issues.push(`checks contain failed rows: ${failed.map((check) => check.id).join(', ')}`);
}

function validateRows(rows) {
  if (!rows.length) issues.push('crossmatch_rows must be non-empty');
  if (rows.length !== packet.counts.source_occurrence_rows) issues.push('crossmatch_rows length must equal source_occurrence_rows');
  let linkTotal = 0;
  for (const [index, row] of rows.entries()) {
    const context = `crossmatch_rows[${index}]`;
    requireFields(row, [
      'row_id',
      'occurrence_id',
      'token_key',
      'token_surface',
      'token_normalized',
      'focus_surface',
      'focus_normalized',
      'source_ref',
      'source_href',
      'work_anchor_href',
      'work_title',
      'work_slug',
      'status',
      'raw_score',
      'cluster_id',
      'usage_frame_label',
      'context_focus_marked',
      'related_route_ids',
      'version_title',
      'version_source',
      'license',
      'license_url',
      'neighbor_summary',
      'same_frame_neighbors',
      'bridge_frame_neighbors',
      'usage_boundary',
    ], context);
    if (!allowedStatuses.has(row.status)) issues.push(`${context}: invalid status ${row.status}`);
    if (!Array.isArray(row.related_route_ids) || row.related_route_ids.length === 0) {
      issues.push(`${context}: related_route_ids must be non-empty`);
    }
    if (!hasHebrew(row.context_focus_marked)) issues.push(`${context}: context_focus_marked must include Hebrew`);
    if (!hasFocusMarker(row.context_focus_marked)) issues.push(`${context}: context_focus_marked must mark focus token`);
    validateUsageBoundary(`${context}.usage_boundary`, row.usage_boundary || {});
    const same = Array.isArray(row.same_frame_neighbors) ? row.same_frame_neighbors : [];
    const bridge = Array.isArray(row.bridge_frame_neighbors) ? row.bridge_frame_neighbors : [];
    linkTotal += same.length + bridge.length;
    if (same.length !== Number(row.neighbor_summary?.same_frame_neighbors || 0)) {
      issues.push(`${context}: same_frame_neighbors length must match summary`);
    }
    if (bridge.length !== Number(row.neighbor_summary?.bridge_frame_neighbors || 0)) {
      issues.push(`${context}: bridge_frame_neighbors length must match summary`);
    }
    if (same.length + bridge.length !== Number(row.neighbor_summary?.total_neighbors || 0)) {
      issues.push(`${context}: neighbor arrays must match total_neighbors`);
    }
    for (const [neighborIndex, link] of [...same, ...bridge].entries()) {
      validateNeighbor(`${context}.neighbors[${neighborIndex}]`, link);
    }
  }
  if (linkTotal !== packet.counts.neighbor_link_rows) issues.push('neighbor arrays must sum to neighbor_link_rows');
}

function validateNeighbor(context, link) {
  requireFields(link, [
    'target_occurrence_id',
    'link_kind',
    'crossmatch_score',
    'crossmatch_strength',
    'relationships',
    'shared_route_ids',
    'target',
  ], context);
  if (!allowedLinkKinds.has(link.link_kind)) issues.push(`${context}: invalid link_kind ${link.link_kind}`);
  if (!allowedStrengths.has(link.crossmatch_strength)) issues.push(`${context}: invalid crossmatch_strength ${link.crossmatch_strength}`);
  if (!Array.isArray(link.relationships) || link.relationships.length === 0) issues.push(`${context}: relationships must be non-empty`);
  if (!Array.isArray(link.shared_route_ids) || link.shared_route_ids.length === 0) issues.push(`${context}: shared_route_ids must be non-empty`);
  validateTarget(`${context}.target`, link.target || {});
}

function validateTarget(context, target) {
  requireFields(target, [
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
    'version_title',
    'version_source',
    'license',
    'license_url',
  ], context);
  if (!allowedStatuses.has(target.status)) issues.push(`${context}: invalid status ${target.status}`);
  if (!Array.isArray(target.related_route_ids) || target.related_route_ids.length === 0) {
    issues.push(`${context}: related_route_ids must be non-empty`);
  }
  if (!hasHebrew(target.context_focus_marked)) issues.push(`${context}: context_focus_marked must include Hebrew`);
  if (!hasFocusMarker(target.context_focus_marked)) issues.push(`${context}: context_focus_marked must mark focus token`);
}

function validateUsageBoundary(context, boundary) {
  const expectedTrue = [
    'observed_usage_only',
    'route_ids_only',
    'crossmatch_navigation_only',
    'not_answer_authority',
    'not_definition_authority',
    'not_semantic_arbitration',
  ];
  for (const key of expectedTrue) {
    if (boundary[key] !== true) issues.push(`${context}.${key} must be true`);
  }
  if (boundary.reader_facing !== false) issues.push(`${context}.reader_facing must be false`);
}

function validateForbiddenAuthorityKeys(value) {
  const hits = [];
  walk(value, '$');
  if (hits.length) issues.push(`forbidden authority keys present: ${hits.slice(0, 60).join(', ')}`);

  function walk(node, nodePath) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const [index, item] of node.entries()) walk(item, `${nodePath}[${index}]`);
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (forbiddenAuthorityKeys.has(key)) hits.push(`${nodePath}.${key}`);
      walk(child, `${nodePath}.${key}`);
    }
  }
}

function requireFields(row, fields, context) {
  for (const field of fields) {
    if (row?.[field] === undefined || row?.[field] === null || row?.[field] === '') {
      issues.push(`${context}: missing ${field}`);
    }
  }
}

function hasHebrew(value) {
  return /[\u0590-\u05ff]/.test(String(value || ''));
}

function hasFocusMarker(value) {
  return /\[[^\]]*[\u0590-\u05ff][^\]]*\]/.test(String(value || ''));
}

function sumCounts(value) {
  return Object.values(value || {}).reduce((sum, count) => sum + Number(count || 0), 0);
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}
