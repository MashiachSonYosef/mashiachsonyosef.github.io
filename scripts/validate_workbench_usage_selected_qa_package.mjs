#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/usage-selected-qa-package.json');
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

if (artifact.schema_version !== 1) issues.push('schema_version must be 1');
if (artifact.artifact_type !== 'workbench_usage_selected_qa_package') {
  issues.push('artifact_type must be workbench_usage_selected_qa_package');
}
if (!String(artifact.policy || '').includes('Compact QA package')) {
  issues.push('policy must identify compact QA package');
}
if (artifact.authority_policy?.usage_navigation_only !== true) issues.push('authority_policy.usage_navigation_only must be true');
if (artifact.authority_policy?.audit_only !== true) issues.push('authority_policy.audit_only must be true');
if (artifact.authority_policy?.reader_facing !== false) issues.push('authority_policy.reader_facing must be false');
if (artifact.authority_policy?.ranks_routes !== false) issues.push('authority_policy.ranks_routes must be false');
if (artifact.authority_policy?.selects_visible_result !== false) issues.push('authority_policy.selects_visible_result must be false');
if (artifact.authority_policy?.ambiguous_rows_reader_facing !== false) {
  issues.push('authority_policy.ambiguous_rows_reader_facing must be false');
}
if (artifact.authority_policy?.route_payloads_copied !== false) issues.push('authority_policy.route_payloads_copied must be false');
if (artifact.quality?.status !== 'pass_with_warnings') issues.push('quality.status must be pass_with_warnings');
if (Number(artifact.quality?.failed_count || 0) !== 0) issues.push('quality.failed_count must be 0');
if (Number(artifact.quality?.warning_count || 0) !== 1) issues.push('quality.warning_count must be 1');

const items = Array.isArray(artifact.package_items) ? artifact.package_items : [];
validateCounts(items);
for (const [index, item] of items.entries()) validateItem(`package_items[${index}]`, item);
for (const check of artifact.checks || []) {
  if (check.id === 'route_concentration_warning_visible') {
    if (check.status !== 'warning') issues.push('route_concentration_warning_visible check must remain warning');
  } else if (check.status !== 'passed') {
    issues.push(`check ${check.id || '(unknown)'} must pass`);
  }
}
walkNoForbiddenFields(artifact, artifactPath);

if (issues.length) {
  console.error(`Workbench usage selected QA package validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Validated usage selected QA package ${artifactPath}: items ${items.length}; selected rows ${artifact.counts.selected_rows}`);

function validateCounts(packageItems) {
  if (Number(artifact.counts?.package_items || 0) !== packageItems.length) issues.push('package_items count must equal package_items length');
  if (packageItems.length !== 15) issues.push('package must contain 15 selected artifact items');
  if (Number(artifact.counts?.selected_rows || 0) <= 0) issues.push('selected_rows must be positive');
  if (Number(artifact.counts?.selected_source_refs || 0) <= 1) issues.push('selected_source_refs must show diversity');
  if (Number(artifact.counts?.selected_works || 0) <= 1) issues.push('selected_works must show diversity');
  if (Number(artifact.counts?.selected_collision_buckets || 0) <= 0) issues.push('selected_collision_buckets must be positive');
  if (Number(artifact.counts?.selected_collision_occurrence_rows || 0) <= 0) {
    issues.push('selected_collision_occurrence_rows must be positive');
  }
  if (Number(artifact.counts?.selected_duplicate_source_ref_buckets || 0) <= 0) {
    issues.push('selected_duplicate_source_ref_buckets must be positive');
  }
  if (Number(artifact.counts?.selected_duplicate_source_ref_rows || 0) <= 0) {
    issues.push('selected_duplicate_source_ref_rows must be positive');
  }
  if (Number(artifact.counts?.selected_duplicate_work_anchor_buckets || 0) <= 0) {
    issues.push('selected_duplicate_work_anchor_buckets must be positive');
  }
  if (Number(artifact.counts?.selected_duplicate_work_anchor_rows || 0) <= 0) {
    issues.push('selected_duplicate_work_anchor_rows must be positive');
  }
  if (Number(artifact.counts?.selected_cross_frame_collision_buckets || 0) <= 0) {
    issues.push('selected_cross_frame_collision_buckets must be positive');
  }
  if (Number(artifact.counts?.selected_cross_frame_collision_rows || 0) <= 0) {
    issues.push('selected_cross_frame_collision_rows must be positive');
  }
  if (Number(artifact.counts?.selected_route_ids || 0) <= 0) issues.push('selected_route_ids must be positive');
  if (Number(artifact.counts?.selected_route_links || 0) !== Number(artifact.counts?.selected_rows || 0)) {
    issues.push('selected_route_links must equal selected_rows');
  }
  if (Number(artifact.counts?.unresolved_route_ids || 0) !== 0) issues.push('unresolved_route_ids must be 0');
  if (Number(artifact.counts?.selected_route_provenance_rows || 0) !== Number(artifact.counts?.selected_route_ids || 0)) {
    issues.push('selected_route_provenance_rows must equal selected_route_ids');
  }
  if (Number(artifact.counts?.selected_route_provenance_links || 0) !== Number(artifact.counts?.selected_route_links || 0)) {
    issues.push('selected_route_provenance_links must equal selected_route_links');
  }
  if (Number(artifact.counts?.selected_route_provenance_buckets || 0) !== Number(artifact.counts?.selected_provenance_buckets || 0)) {
    issues.push('selected_route_provenance_buckets must equal selected_provenance_buckets');
  }
  if (Number(artifact.counts?.selected_route_provenance_unresolved_route_rows || 0) !== 0) {
    issues.push('selected_route_provenance_unresolved_route_rows must be 0');
  }
  if (Number(artifact.counts?.selected_route_provenance_missing_provenance_rows || 0) !== 0) {
    issues.push('selected_route_provenance_missing_provenance_rows must be 0');
  }
  if (Number(artifact.counts?.selected_route_provenance_payload_copied_rows || 0) !== 0) {
    issues.push('selected_route_provenance_payload_copied_rows must be 0');
  }
  if (Number(artifact.counts?.selected_route_provenance_samples || 0) !== Number(artifact.counts?.selected_route_links || 0)) {
    issues.push('selected_route_provenance_samples must equal selected_route_links');
  }
  if (Number(artifact.counts?.selected_focus_context_rows || 0) !== Number(artifact.counts?.selected_rows || 0)) {
    issues.push('selected_focus_context_rows must equal selected_rows');
  }
  if (Number(artifact.counts?.selected_focus_marker_rows || 0) !== Number(artifact.counts?.selected_rows || 0)) {
    issues.push('selected_focus_marker_rows must equal selected_rows');
  }
  if (Number(artifact.counts?.selected_focus_marker_mismatch_rows || 0) !== 0) {
    issues.push('selected_focus_marker_mismatch_rows must be 0');
  }
  if (Number(artifact.counts?.selected_repeated_focus_context_rows || 0) <= 0) {
    issues.push('selected_repeated_focus_context_rows must be positive');
  }
  if (Number(artifact.counts?.selected_missing_hebrew_context_rows || 0) !== 0) {
    issues.push('selected_missing_hebrew_context_rows must be 0');
  }
  if (Number(artifact.counts?.selected_frame_summary_frames || 0) <= 0) {
    issues.push('selected_frame_summary_frames must be positive');
  }
  if (Number(artifact.counts?.selected_frame_summary_rows || 0) !== Number(artifact.counts?.selected_rows || 0)) {
    issues.push('selected_frame_summary_rows must equal selected_rows');
  }
  if (Number(artifact.counts?.selected_frame_summary_repeated_focus_rows || 0) !== Number(artifact.counts?.selected_repeated_focus_context_rows || 0)) {
    issues.push('selected_frame_summary_repeated_focus_rows must equal selected_repeated_focus_context_rows');
  }
  if (Number(artifact.counts?.selected_frame_summary_samples || 0) < Number(artifact.counts?.selected_frame_summary_frames || 0)) {
    issues.push('selected_frame_summary_samples must cover each frame');
  }
  if (Number(artifact.counts?.selected_work_frame_matrix_rows || 0) <= 0) {
    issues.push('selected_work_frame_matrix_rows must be positive');
  }
  if (Number(artifact.counts?.selected_work_frame_matrix_selected_rows || 0) !== Number(artifact.counts?.selected_rows || 0)) {
    issues.push('selected_work_frame_matrix_selected_rows must equal selected_rows');
  }
  if (Number(artifact.counts?.selected_work_frame_matrix_works || 0) <= 1) {
    issues.push('selected_work_frame_matrix_works must show multiple works');
  }
  if (Number(artifact.counts?.selected_work_frame_matrix_frames || 0) !== Number(artifact.counts?.selected_frame_summary_frames || 0)) {
    issues.push('selected_work_frame_matrix_frames must equal selected_frame_summary_frames');
  }
  if (Number(artifact.counts?.selected_work_frame_matrix_samples || 0) < Number(artifact.counts?.selected_work_frame_matrix_rows || 0)) {
    issues.push('selected_work_frame_matrix_samples must cover every matrix row');
  }
  if (Number(artifact.counts?.selected_provenance_buckets || 0) <= 0) {
    issues.push('selected_provenance_buckets must be positive');
  }
  if (Number(artifact.counts?.selected_provenance_rows || 0) !== Number(artifact.counts?.selected_rows || 0)) {
    issues.push('selected_provenance_rows must equal selected_rows');
  }
  if (Number(artifact.counts?.selected_provenance_licenses || 0) <= 0) {
    issues.push('selected_provenance_licenses must be positive');
  }
  if (Number(artifact.counts?.selected_provenance_version_sources || 0) <= 0) {
    issues.push('selected_provenance_version_sources must be positive');
  }
  if (Number(artifact.counts?.selected_provenance_rows_with_license_metadata || 0) !== Number(artifact.counts?.selected_rows || 0)) {
    issues.push('selected_provenance_rows_with_license_metadata must equal selected_rows');
  }
  if (Number(artifact.counts?.selected_provenance_rows_with_version_metadata || 0) !== Number(artifact.counts?.selected_rows || 0)) {
    issues.push('selected_provenance_rows_with_version_metadata must equal selected_rows');
  }
  if (Number(artifact.counts?.selected_provenance_missing_or_unrecognized_license_rows || 0) !== 0) {
    issues.push('selected_provenance_missing_or_unrecognized_license_rows must be 0');
  }
  if (Number(artifact.counts?.selected_provenance_samples || 0) !== Number(artifact.counts?.selected_rows || 0)) {
    issues.push('selected_provenance_samples must equal selected_rows');
  }
  if (Number(artifact.counts?.route_concentration_warning_visible || 0) !== 1) {
    issues.push('route_concentration_warning_visible must be 1');
  }
  if (Number(artifact.counts?.rows_with_recurring_signatures || 0) <= 0) {
    issues.push('rows_with_recurring_signatures must be positive');
  }
  if (Number(artifact.counts?.rows_with_cross_cluster_signatures || 0) <= 0) {
    issues.push('rows_with_cross_cluster_signatures must be positive');
  }
  if (Number(artifact.counts?.crossmatch_same_frame_edges || 0) + Number(artifact.counts?.crossmatch_bridge_edges || 0) !== Number(artifact.counts?.crossmatch_directed_edges || 0)) {
    issues.push('crossmatch same-frame + bridge edges must equal directed edges');
  }
  if (Number(artifact.counts?.crossmatch_neighborhoods || 0) !== Number(artifact.counts?.selected_rows || 0)) {
    issues.push('crossmatch_neighborhoods must equal selected_rows');
  }
  if (Number(artifact.counts?.mojibake_rows || 0) !== 0) issues.push('mojibake_rows must be 0');
  if (Number(artifact.counts?.reader_facing_rows || 0) !== 0) issues.push('reader_facing_rows must be 0');
  if (Number(artifact.counts?.route_payload_field_hits || 0) !== 0) issues.push('route_payload_field_hits must be 0');
  if (Number(artifact.counts?.failed_checks || 0) !== 0) issues.push('failed_checks must be 0');
}

function validateItem(context, item) {
  requireFields(item, [
    'item_id',
    'artifact_type',
    'artifact_path',
    'report_path',
    'quality_status',
    'failed_checks',
    'warning_count',
    'reader_facing_rows',
    'route_payload_field_hits',
    'summary',
  ], context);
  if (!String(item.artifact_path || '').endsWith('.json')) issues.push(`${context}: artifact_path must point to JSON`);
  if (!String(item.report_path || '').endsWith('.md')) issues.push(`${context}: report_path must point to markdown report`);
  if (!['passed', 'pass_with_warnings', 'not_applicable'].includes(item.quality_status)) {
    issues.push(`${context}: unexpected quality_status ${item.quality_status}`);
  }
  if (Number(item.failed_checks || 0) !== 0) issues.push(`${context}: failed_checks must be 0`);
  if (Number(item.reader_facing_rows || 0) !== 0) issues.push(`${context}: reader_facing_rows must be 0`);
  if (Number(item.route_payload_field_hits || 0) !== 0) issues.push(`${context}: route_payload_field_hits must be 0`);
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

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}
