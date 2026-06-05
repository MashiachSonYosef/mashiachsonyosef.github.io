#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packetPath = cleanRelativePath(process.argv[2] || 'data/definitions/definition-workbench-usage-occurrence-support-packet.json');
const packet = readJson(packetPath);
const issues = [];
const warnings = [];
const forbiddenLicenseRe = /\bNC\b|Non-?Commercial|all rights reserved|copyright unclear|unknown|unverified|permission only/i;
const forbiddenAuthorityKeys = new Set([
  'definition',
  'definition_text',
  'source_text',
  'meaning',
  'meaning_claim',
  'translation',
  'translation_text',
  'accepted_translation',
  'final_answer',
  'winner',
  'route_payload',
  'route_payloads',
  'route_metadata',
]);

if (packet.schema_version !== 1) issues.push('schema_version must be 1');
if (packet.artifact_type !== 'definition_workbench_usage_occurrence_support_packet') {
  issues.push('artifact_type must be definition_workbench_usage_occurrence_support_packet');
}
if (packet.lane_owner !== 'Agent 3') issues.push('lane_owner must be Agent 3');
if (packet.target_gate !== 'definition_workbench_gate') issues.push('target_gate must be definition_workbench_gate');

validateSourceArtifacts(packet.source_artifacts || {});
validateAuthorityBoundary(packet.authority_boundary || {});
validatePlanningContext(packet.planning_context || {});
validateConsumerBoundary(packet.consumer_manifest_boundary || {});
validatePlanningRows(packet.planning_rows);
validateSupportRows(packet.support_rows);
validateCounts(packet.counts || {});
validateChecks(packet.checks || []);
validateForbiddenAuthorityKeys(packet);

if (issues.length) {
  console.error(`Definition Workbench usage occurrence support packet validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 120)) console.error(`- ${issue}`);
  process.exit(1);
}

if (warnings.length) {
  console.log(`Definition Workbench usage occurrence support packet validation passed with ${warnings.length} warning(s).`);
  for (const warning of warnings.slice(0, 40)) console.log(`- ${warning}`);
} else {
  console.log('Definition Workbench usage occurrence support packet validation passed.');
}
console.log(`Support rows: ${packet.counts.support_rows}; supported/candidate/weak: ${packet.counts.supported_rows}/${packet.counts.candidate_rows}/${packet.counts.weak_rows}; reader-facing: ${packet.counts.reader_facing_rows}.`);

function validateSourceArtifacts(artifacts) {
  for (const key of [
    'planning_packet',
    'occurrence_links',
    'anchor_audit',
    'route_resolution',
    'consumer_manifest',
  ]) {
    const artifactPath = artifacts[key];
    if (!artifactPath) {
      issues.push(`source_artifacts.${key} is required`);
      continue;
    }
    if (!fs.existsSync(path.join(root, cleanRelativePath(artifactPath)))) {
      issues.push(`source_artifacts.${key} must exist`);
    }
  }
}

function validateAuthorityBoundary(boundary) {
  const expectedTrue = [
    'usage_navigation_only',
    'occurrence_links_only',
    'observed_usage_only',
    'route_ids_only',
    'planning_support_only',
  ];
  const expectedFalse = [
    'reader_facing',
    'lexical_authority',
    'semantic_arbitration',
    'route_ranking',
    'visible_answer_selection',
    'copied_route_payloads',
    'accepted_text_output',
    'publication_claim',
    'agent6_accepted',
  ];
  for (const key of expectedTrue) {
    if (boundary[key] !== true) issues.push(`authority_boundary.${key} must be true`);
  }
  for (const key of expectedFalse) {
    if (boundary[key] !== false) issues.push(`authority_boundary.${key} must be false`);
  }
}

function validatePlanningContext(context) {
  if (!Number.isInteger(context.current_sample_rows) || context.current_sample_rows <= 0) {
    issues.push('planning_context.current_sample_rows must be positive');
  }
  if (context.current_sample_rows_with_usage_links !== 0) {
    warnings.push('planning context has current sample usage links; expected current bounded gap to be visible');
  }
  if (!Number.isInteger(context.usage_tokens_absent_from_current_sample) || context.usage_tokens_absent_from_current_sample <= 0) {
    issues.push('planning_context.usage_tokens_absent_from_current_sample must be positive');
  }
  if (context.route_concentration_warning_visible !== 1) {
    warnings.push('route concentration warning is not visible');
  }
  if (!Number.isInteger(context.audit_only_ambiguous_rows_available) || context.audit_only_ambiguous_rows_available <= 0) {
    issues.push('planning_context.audit_only_ambiguous_rows_available must be positive');
  }
  if (context.current_planning_gap_label !== 'observed usage only') {
    issues.push('planning_context.current_planning_gap_label must be observed usage only');
  }
}

function validateConsumerBoundary(boundary) {
  if (boundary.required_row_label !== 'observed usage only') {
    issues.push('consumer_manifest_boundary.required_row_label must be observed usage only');
  }
  if (!String(boundary.ambiguous_rows_policy || '').includes('audit-only')) {
    issues.push('consumer_manifest_boundary.ambiguous_rows_policy must keep ambiguity audit-only');
  }
  const routePayloadRule = String(boundary.route_payload_rule || '');
  if (!routePayloadRule.includes('route IDs') && !routePayloadRule.includes('route_ids')) {
    issues.push('consumer_manifest_boundary.route_payload_rule must require route IDs only');
  }
  if (boundary.reviewed_lexical_authority !== false) {
    issues.push('consumer_manifest_boundary.reviewed_lexical_authority must be false');
  }
  if (boundary.publication_readiness !== false) {
    issues.push('consumer_manifest_boundary.publication_readiness must be false');
  }
}

function validatePlanningRows(rows) {
  if (!Array.isArray(rows) || rows.length < 1) {
    issues.push('planning_rows must contain at least one row');
    return;
  }
  for (const [index, row] of rows.entries()) {
    const label = `planning_rows[${index}]`;
    if (!row.planning_row_id) issues.push(`${label}.planning_row_id is required`);
    if (!row.token_key) issues.push(`${label}.token_key is required`);
    if (!row.normalized_form) issues.push(`${label}.normalized_form is required`);
    if (row.row_label !== 'observed usage only') issues.push(`${label}.row_label must be observed usage only`);
    if (!Array.isArray(row.related_agent2_route_ids) || row.related_agent2_route_ids.length < 1) {
      issues.push(`${label}.related_agent2_route_ids must be non-empty`);
    }
    if (!row.usage_frames || Object.keys(row.usage_frames).length < 1) {
      issues.push(`${label}.usage_frames must be non-empty`);
    }
    if (!Number.isInteger(row.audit_only_ambiguous_rows) || row.audit_only_ambiguous_rows <= 0) {
      issues.push(`${label}.audit_only_ambiguous_rows must be positive`);
    }
    validateUsageBoundary(row.planning_boundary || {}, label);
  }
}

function validateSupportRows(rows) {
  if (!Array.isArray(rows) || rows.length < 1) {
    issues.push('support_rows must contain at least one row');
    return;
  }
  const seen = new Set();
  const allowedStatuses = new Set(['supported', 'candidate', 'weak']);
  for (const [index, row] of rows.entries()) {
    const label = `support_rows[${index}]`;
    if (!row.support_row_id) issues.push(`${label}.support_row_id is required`);
    if (!row.occurrence_id) issues.push(`${label}.occurrence_id is required`);
    if (seen.has(row.occurrence_id)) issues.push(`${label}.occurrence_id must be unique`);
    seen.add(row.occurrence_id);
    if (!row.source_ref) issues.push(`${label}.source_ref is required`);
    if (!/^https:\/\//.test(row.source_url || '')) issues.push(`${label}.source_url must be https`);
    if (!row.local_work_page_anchor) issues.push(`${label}.local_work_page_anchor is required`);
    if (!row.local_work_page_path) issues.push(`${label}.local_work_page_path is required`);
    if (!row.work_title) issues.push(`${label}.work_title is required`);
    if (!row.work_slug) issues.push(`${label}.work_slug is required`);
    if (!row.token_key) issues.push(`${label}.token_key is required`);
    if (!row.token_surface || !row.token_normalized) issues.push(`${label}.token surface/normalized are required`);
    if (!row.focus_surface || !row.focus_normalized) issues.push(`${label}.focus surface/normalized are required`);
    if (!row.phrase_context_snippet) issues.push(`${label}.phrase_context_snippet is required`);
    if (!/\[.+\]/u.test(row.phrase_context_snippet || '')) {
      issues.push(`${label}.phrase_context_snippet must include focus marker`);
    }
    if (!row.usage_frame_label) issues.push(`${label}.usage_frame_label is required`);
    if (!allowedStatuses.has(row.status)) issues.push(`${label}.status must be supported, candidate, or weak`);
    if (!Number.isInteger(row.raw_score) || row.raw_score < 0 || row.raw_score > 100) {
      issues.push(`${label}.raw_score must be 0-100 integer`);
    }
    if (!Array.isArray(row.related_agent2_route_ids) || row.related_agent2_route_ids.length < 1) {
      issues.push(`${label}.related_agent2_route_ids must be non-empty`);
    }
    if (row.route_link_state !== 'resolved_route_ids_only') {
      issues.push(`${label}.route_link_state must be resolved_route_ids_only`);
    }
    if (!row.version_title || !row.version_source) issues.push(`${label}.version metadata is required`);
    if (!row.license || !/^https:\/\//.test(row.license_url || '')) {
      issues.push(`${label}.license metadata is required`);
    }
    if (hasForbiddenLicense(row.license)) issues.push(`${label}.license includes forbidden or unclear license label`);
    validateAnchorAudit(row.local_anchor_audit || {}, label);
    validateUsageBoundary(row.usage_boundary || {}, label);
  }
}

function validateAnchorAudit(audit, label) {
  for (const key of [
    'work_page_exists',
    'work_anchor_exists',
    'source_ref_matches_page_unit',
    'token_surface_found_in_page',
    'focus_surface_found_in_page',
    'context_has_focus_marker',
  ]) {
    if (audit[key] !== true) issues.push(`${label}.local_anchor_audit.${key} must be true`);
  }
}

function validateUsageBoundary(boundary, label) {
  if (boundary.observed_usage_only !== true) issues.push(`${label}.observed_usage_only must be true`);
  if (boundary.reader_facing !== false) issues.push(`${label}.reader_facing must be false`);
  if (boundary.route_ids_only !== true) issues.push(`${label}.route_ids_only must be true`);
  if (boundary.not_definition_authority !== true) issues.push(`${label}.not_definition_authority must be true`);
  if (boundary.not_semantic_arbitration !== true) issues.push(`${label}.not_semantic_arbitration must be true`);
  if (boundary.not_publication_support !== true) issues.push(`${label}.not_publication_support must be true`);
}

function validateCounts(counts) {
  const required = [
    'planning_rows',
    'planning_rows_with_observed_usage_label',
    'planning_rows_absent_from_current_sample',
    'support_rows',
    'supported_rows',
    'candidate_rows',
    'weak_rows',
    'source_refs',
    'works',
    'licenses',
    'version_sources',
    'usage_frames',
    'route_ids',
    'rows_with_source_ref',
    'rows_with_source_url',
    'rows_with_local_work_anchor',
    'rows_with_work_title',
    'rows_with_token_surface',
    'rows_with_focus_surface',
    'rows_with_context_snippet',
    'rows_with_focus_marker',
    'rows_with_usage_frame',
    'rows_with_status_score',
    'rows_with_route_ids',
    'rows_with_resolved_route_id_linkage',
    'rows_with_version_metadata',
    'rows_with_license_metadata',
    'rows_with_forbidden_license',
    'rows_with_existing_work_page',
    'rows_with_existing_work_anchor',
    'rows_with_matching_source_ref',
    'rows_with_token_surface_in_page',
    'rows_with_focus_surface_in_page',
    'rows_with_observed_usage_label',
    'audit_only_ambiguous_rows_available',
    'audit_only_ambiguous_rows_emitted',
    'current_sample_rows',
    'current_sample_rows_with_usage_links',
    'usage_tokens_absent_from_current_sample',
    'route_concentration_warning_visible',
    'consumer_manifest_reviewed_lexical_authority_true',
    'consumer_manifest_publication_readiness_true',
    'reader_facing_rows',
    'route_payload_field_hits',
    'forbidden_authority_field_hits',
    'queue_mutations',
    'submitted_to_agent6',
  ];
  for (const key of required) {
    if (!Number.isInteger(counts[key]) || counts[key] < 0) issues.push(`counts.${key} must be a non-negative integer`);
  }
  if (counts.planning_rows < 1) issues.push('counts.planning_rows must be positive');
  if (counts.planning_rows_with_observed_usage_label !== counts.planning_rows) {
    issues.push('all planning rows must be labeled observed usage only');
  }
  if (counts.planning_rows_absent_from_current_sample !== counts.planning_rows) {
    warnings.push('not all planning rows are absent from the current sample');
  }
  if (counts.support_rows < 1) issues.push('counts.support_rows must be positive');
  if (counts.supported_rows + counts.candidate_rows + counts.weak_rows !== counts.support_rows) {
    issues.push('supported + candidate + weak rows must equal support_rows');
  }
  for (const key of [
    'rows_with_source_ref',
    'rows_with_source_url',
    'rows_with_local_work_anchor',
    'rows_with_work_title',
    'rows_with_token_surface',
    'rows_with_focus_surface',
    'rows_with_context_snippet',
    'rows_with_focus_marker',
    'rows_with_usage_frame',
    'rows_with_status_score',
    'rows_with_route_ids',
    'rows_with_resolved_route_id_linkage',
    'rows_with_version_metadata',
    'rows_with_license_metadata',
    'rows_with_existing_work_page',
    'rows_with_existing_work_anchor',
    'rows_with_matching_source_ref',
    'rows_with_token_surface_in_page',
    'rows_with_focus_surface_in_page',
    'rows_with_observed_usage_label',
  ]) {
    if (counts[key] !== counts.support_rows) issues.push(`counts.${key} must equal support_rows`);
  }
  for (const key of ['source_refs', 'works', 'licenses', 'version_sources', 'usage_frames', 'route_ids']) {
    if (counts[key] < 1) issues.push(`counts.${key} must be positive`);
  }
  if (counts.rows_with_forbidden_license !== 0) issues.push('counts.rows_with_forbidden_license must be 0');
  if (counts.audit_only_ambiguous_rows_available <= 0) issues.push('audit-only ambiguous rows must be visible');
  if (counts.audit_only_ambiguous_rows_emitted !== 0) issues.push('audit-only ambiguous rows must not be emitted');
  if (counts.current_sample_rows <= 0) issues.push('counts.current_sample_rows must be positive');
  if (counts.current_sample_rows_with_usage_links !== 0) warnings.push('current sample usage links are non-zero');
  if (counts.usage_tokens_absent_from_current_sample < 1) {
    issues.push('counts.usage_tokens_absent_from_current_sample must be positive');
  }
  if (counts.route_concentration_warning_visible !== 1) warnings.push('route concentration warning is not visible');
  if (counts.consumer_manifest_reviewed_lexical_authority_true !== 0) {
    issues.push('consumer manifest must not claim reviewed lexical authority');
  }
  if (counts.consumer_manifest_publication_readiness_true !== 0) {
    issues.push('consumer manifest must not claim publication readiness');
  }
  if (counts.reader_facing_rows !== 0) issues.push('counts.reader_facing_rows must be 0');
  if (counts.route_payload_field_hits !== 0) issues.push('counts.route_payload_field_hits must be 0');
  if (counts.forbidden_authority_field_hits !== 0) issues.push('counts.forbidden_authority_field_hits must be 0');
  if (counts.queue_mutations !== 0) issues.push('counts.queue_mutations must be 0');
  if (counts.submitted_to_agent6 !== 0) issues.push('counts.submitted_to_agent6 must be 0');
}

function validateChecks(checks) {
  if (!Array.isArray(checks) || checks.length < 1) {
    issues.push('checks must be a non-empty array');
    return;
  }
  const failed = checks.filter((check) => check.status === 'failed');
  if (failed.length) issues.push(`checks contain failed rows: ${failed.map((check) => check.id).join(', ')}`);
  const ids = new Set(checks.map((check) => check.id));
  for (const required of [
    'planning_context_present',
    'current_sample_gap_visible',
    'occurrence_support_rows_present',
    'clickable_links_complete',
    'token_context_complete',
    'provenance_license_complete',
    'local_anchor_audit_complete',
    'route_ids_only_linkage',
    'ambiguous_rows_audit_only',
    'consumer_manifest_boundary_preserved',
    'usage_only_boundary',
    'queue_not_mutated',
  ]) {
    if (!ids.has(required)) issues.push(`checks missing ${required}`);
  }
}

function validateForbiddenAuthorityKeys(value) {
  const hits = [];
  walk(value, '$');
  if (hits.length) issues.push(`forbidden authority keys present: ${hits.slice(0, 30).join(', ')}`);

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

function hasForbiddenLicense(value) {
  return forbiddenLicenseRe.test(String(value || ''));
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}

function readJson(relativePath) {
  return JSON.parse(stripJsonBom(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8')));
}

function stripJsonBom(text) {
  return text.replace(/^\uFEFF/, '');
}
