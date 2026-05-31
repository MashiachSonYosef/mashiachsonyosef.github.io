#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const handoffPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/usage-navigation-handoff-index.json');
const artifact = readJson(handoffPath);
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
if (artifact.artifact_type !== 'workbench_usage_navigation_handoff_index') {
  issues.push('artifact_type must be workbench_usage_navigation_handoff_index');
}
if (!String(artifact.policy || '').includes('usage-navigation/concordance')) {
  issues.push('policy must identify the usage-navigation/concordance lane');
}
if (artifact.authority_policy?.usage_navigation_only !== true) issues.push('authority_policy.usage_navigation_only must be true');
if (artifact.authority_policy?.ranks_routes !== false) issues.push('authority_policy.ranks_routes must be false');
if (artifact.authority_policy?.selects_visible_result !== false) issues.push('authority_policy.selects_visible_result must be false');
if (artifact.authority_policy?.ambiguous_rows_reader_facing !== false) {
  issues.push('authority_policy.ambiguous_rows_reader_facing must be false');
}
if (artifact.consumer_boundary?.observed_usage_not_meaning_claim !== true) {
  issues.push('consumer_boundary.observed_usage_not_meaning_claim must be true');
}
if (artifact.consumer_boundary?.ambiguous_rows_reader_facing !== false) {
  issues.push('consumer_boundary.ambiguous_rows_reader_facing must be false');
}
if (artifact.consumer_boundary?.ranks_routes !== false) issues.push('consumer_boundary.ranks_routes must be false');
if (artifact.consumer_boundary?.selects_visible_result !== false) issues.push('consumer_boundary.selects_visible_result must be false');
if (artifact.consumer_boundary?.broad_target_expansion !== false) issues.push('consumer_boundary.broad_target_expansion must be false');

validateCounts();
validateArtifacts();
validateValidation();
validateCommands();
walkNoForbiddenFields(artifact, handoffPath);

if (issues.length) {
  console.error(`Workbench usage handoff index validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Workbench usage handoff index validation passed. Rows: ${artifact.counts.concordance_rows}. Clusters: ${artifact.counts.usage_clusters}.`);

function validateCounts() {
  for (const field of [
    'concordance_rows',
    'selected_manifests',
    'supported',
    'candidate',
    'weak',
    'audit_only_ambiguous',
    'audit_only_blocked',
    'route_linked_rows',
    'observed_only_rows',
    'usage_clusters',
    'unique_route_ids',
    'sample_rows',
    'lookup_occurrence_refs',
    'lookup_works',
  ]) {
    const value = Number(artifact.counts?.[field]);
    if (!Number.isInteger(value) || value < 0) issues.push(`counts.${field} must be a non-negative integer`);
  }
  const readerFacingRows = Number(artifact.counts?.supported || 0)
    + Number(artifact.counts?.candidate || 0)
    + Number(artifact.counts?.weak || 0);
  if (readerFacingRows !== Number(artifact.counts?.concordance_rows || 0)) {
    issues.push('supported + candidate + weak must equal concordance_rows');
  }
  const routeStateRows = Number(artifact.counts?.route_linked_rows || 0)
    + Number(artifact.counts?.observed_only_rows || 0);
  if (routeStateRows !== Number(artifact.counts?.concordance_rows || 0)) {
    issues.push('route_linked_rows + observed_only_rows must equal concordance_rows');
  }
}

function validateArtifacts() {
  for (const field of ['concordance_json', 'concordance_report', 'manifest']) {
    if (!String(artifact.artifacts?.[field]?.path || '').trim()) issues.push(`artifacts.${field}.path must be present`);
  }
  for (const field of [
    'occurrence_link_check_report',
    'route_link_check_report',
    'audit_only_review_report',
    'cluster_index_report',
    'route_coverage_report',
    'sample_index_report',
    'lookup_index_report',
    'smoke_validation_report',
  ]) {
    if (!String(artifact.artifacts?.[field] || '').trim()) issues.push(`artifacts.${field} must be present`);
  }
}

function validateValidation() {
  const allowedSmoke = new Set(['passed', 'failed', 'not_run', 'skipped_self_reference']);
  if (artifact.validation?.occurrence_link_check_status !== 'passed') {
    issues.push('validation.occurrence_link_check_status must be passed');
  }
  if (artifact.validation?.route_link_check_status !== 'passed') {
    issues.push('validation.route_link_check_status must be passed');
  }
  if (artifact.validation?.cluster_index_status !== 'present') issues.push('validation.cluster_index_status must be present');
  if (artifact.validation?.route_coverage_status !== 'present') issues.push('validation.route_coverage_status must be present');
  if (artifact.validation?.sample_index_status !== 'present') issues.push('validation.sample_index_status must be present');
  if (artifact.validation?.lookup_index_status !== 'present') issues.push('validation.lookup_index_status must be present');
  if (Number(artifact.validation?.occurrence_source_url_bad || 0) !== 0) issues.push('occurrence source URL issues must be 0');
  if (Number(artifact.validation?.occurrence_work_anchor_bad || 0) !== 0) issues.push('occurrence work anchor issues must be 0');
  if (Number(artifact.validation?.route_links_unresolved || 0) !== 0) issues.push('route_links_unresolved must be 0');
  if (Number(artifact.validation?.route_metadata_mismatches || 0) !== 0) issues.push('route_metadata_mismatches must be 0');
  if (artifact.validation?.audit_review_reader_facing !== false) issues.push('audit_review_reader_facing must be false');
  if (Number(artifact.validation?.route_coverage_links || 0) < Number(artifact.counts?.route_linked_rows || 0)) {
    issues.push('route_coverage_links must be at least route_linked_rows');
  }
  if (Number(artifact.validation?.sample_index_rows || 0) <= 0) issues.push('sample_index_rows must be positive');
  if (Number(artifact.validation?.lookup_index_occurrence_refs || 0) !== Number(artifact.counts?.concordance_rows || 0)) {
    issues.push('lookup_index_occurrence_refs must equal concordance_rows');
  }
  if (!allowedSmoke.has(artifact.validation?.smoke_validation_status)) {
    issues.push('smoke_validation_status must be passed/failed/not_run/skipped_self_reference');
  }
  if (artifact.validation?.smoke_validation_status === 'failed') issues.push('smoke_validation_status must not be failed');
}

function validateCommands() {
  const expectedScripts = {
    regenerate: 'build_workbench_usage_concordance.mjs',
    validate_concordance: 'validate_workbench_usage_concordance.mjs',
    check_occurrence_links: 'check_workbench_usage_concordance_links.mjs',
    check_route_links: 'check_workbench_usage_route_links.mjs',
    build_audit_review: 'build_workbench_usage_audit_review.mjs',
    build_cluster_index: 'build_workbench_usage_cluster_index.mjs',
    validate_cluster_index: 'validate_workbench_usage_cluster_index.mjs',
    build_route_coverage: 'build_workbench_usage_route_coverage.mjs',
    validate_route_coverage: 'validate_workbench_usage_route_coverage.mjs',
    build_sample_index: 'build_workbench_usage_sample_index.mjs',
    validate_sample_index: 'validate_workbench_usage_sample_index.mjs',
    build_lookup_index: 'build_workbench_usage_lookup_index.mjs',
    validate_lookup_index: 'validate_workbench_usage_lookup_index.mjs',
    build_handoff_index: 'build_workbench_usage_handoff_index.mjs',
    validate_handoff_index: 'validate_workbench_usage_handoff_index.mjs',
    validate_smoke_pipeline: 'validate_workbench_smoke_pipeline.mjs',
  };
  for (const [field, script] of Object.entries(expectedScripts)) {
    if (!String(artifact.commands?.[field] || '').includes(script)) {
      issues.push(`commands.${field} must reference ${script}`);
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

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}
