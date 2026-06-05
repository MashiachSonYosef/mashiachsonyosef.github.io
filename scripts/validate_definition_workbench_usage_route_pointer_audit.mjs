#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packetPath = cleanRelativePath(process.argv[2] || 'data/definitions/definition-workbench-usage-route-pointer-audit.json');
const packet = readJson(packetPath);
const issues = [];
const warnings = [];
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
  'route_metadata',
]);

if (packet.schema_version !== 1) issues.push('schema_version must be 1');
if (packet.artifact_type !== 'definition_workbench_usage_route_pointer_audit') {
  issues.push('artifact_type must be definition_workbench_usage_route_pointer_audit');
}
if (!String(packet.policy || '').includes('route-pointer audit')) {
  issues.push('policy must identify route-pointer audit');
}

validateInputs(packet.inputs || {});
validateAuthorityBoundary(packet.authority_boundary || {});
validateConsumerRule(packet.consumer_rule || {});
validateRows(Array.isArray(packet.route_pointer_rows) ? packet.route_pointer_rows : []);
validateCounts(packet.counts || {});
validateChecks(Array.isArray(packet.checks) ? packet.checks : []);
validateForbiddenAuthorityKeys(packet);

if (issues.length) {
  console.error(`Definition Workbench usage route-pointer audit validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 120)) console.error(`- ${issue}`);
  process.exit(1);
}

if (warnings.length) {
  console.log(`Definition Workbench usage route-pointer audit validation passed with ${warnings.length} warning(s).`);
  for (const warning of warnings.slice(0, 40)) console.log(`- ${warning}`);
} else {
  console.log('Definition Workbench usage route-pointer audit validation passed.');
}
console.log(`Routes: ${packet.counts.route_pointer_rows}; support linked: ${packet.counts.support_rows_with_pointer}/${packet.counts.support_rows}; navigation linked: ${packet.counts.navigation_rows_with_pointer}/${packet.counts.navigation_rows}; payload hits: ${packet.counts.route_payload_field_hits}.`);

function validateInputs(inputs) {
  const required = [
    'route_resolution',
    'occurrence_support_packet',
    'concordance_navigation_packet',
    'planning_packet',
  ];
  for (const key of required) {
    if (!inputs[key] || !fs.existsSync(path.join(root, cleanRelativePath(inputs[key])))) {
      issues.push(`inputs.${key} must point to an existing artifact`);
    }
  }
}

function validateAuthorityBoundary(boundary) {
  const expectedTrue = [
    'usage_navigation_only',
    'observed_usage_only',
    'route_pointer_only',
    'route_ids_only',
    'resolver_paths_only',
    'agent2_payload_resolution_external',
  ];
  const expectedFalse = [
    'reader_facing',
    'copies_route_payloads',
    'copies_agent2_payloads',
    'copies_route_metadata',
    'ranks_routes',
    'selects_visible_result',
    'semantic_arbitration',
    'lexical_authority',
    'publication_claim',
    'accepted_text_output',
  ];
  for (const key of expectedTrue) {
    if (boundary[key] !== true) issues.push(`authority_boundary.${key} must be true`);
  }
  for (const key of expectedFalse) {
    if (boundary[key] !== false) issues.push(`authority_boundary.${key} must be false`);
  }
}

function validateConsumerRule(rule) {
  if (rule.row_label !== 'route pointer only') issues.push('consumer_rule.row_label must be route pointer only');
  if (!String(rule.downstream_action || '').includes('outside Agent 3')) {
    issues.push('consumer_rule.downstream_action must keep Agent 2 route payloads outside Agent 3');
  }
  if (rule.observed_usage_row_label_required !== 'observed usage only') {
    issues.push('consumer_rule.observed_usage_row_label_required must be observed usage only');
  }
  if (rule.route_concentration_status !== 'single_route_pointer_scope') {
    issues.push('consumer_rule.route_concentration_status must expose single_route_pointer_scope');
  }
}

function validateRows(rows) {
  if (rows.length !== 1) issues.push('route_pointer_rows must contain exactly one selected-scope route pointer row');
  for (const [index, row] of rows.entries()) {
    const context = row.route_pointer_id || `route_pointer_rows[${index}]`;
    requireFields(row, [
      'route_pointer_id',
      'route_id',
      'route_source_path',
      'route_resolution_artifact',
      'resolution_status',
      'occurrence_route_rows',
      'support_rows',
      'navigation_rows',
      'selected_navigation_rows',
      'planning_rows',
      'selected_source_refs',
      'selected_works',
      'selected_usage_frames',
      'concordance_source_refs',
      'concordance_works',
      'concordance_categories',
      'selected_status_counts',
      'concordance_status_counts',
      'row_label',
      'route_payload_copied',
      'agent2_payload_copied',
      'route_metadata_copied',
      'consumer_action',
    ], context);
    if (!String(row.route_pointer_id || '').startsWith('usage-route-pointer-')) {
      issues.push(`${context}.route_pointer_id must be stable usage-route-pointer id`);
    }
    if (!row.route_id) issues.push(`${context}.route_id must be present`);
    if (!fs.existsSync(path.join(root, cleanRelativePath(row.route_source_path)))) {
      issues.push(`${context}.route_source_path must point to an existing route-source artifact`);
    }
    if (!fs.existsSync(path.join(root, cleanRelativePath(row.route_resolution_artifact)))) {
      issues.push(`${context}.route_resolution_artifact must exist`);
    }
    if (row.resolution_status !== 'resolved') issues.push(`${context}.resolution_status must be resolved`);
    for (const key of ['occurrence_route_rows', 'support_rows', 'navigation_rows', 'planning_rows', 'selected_source_refs', 'selected_works', 'selected_usage_frames']) {
      if (!Number.isInteger(row[key]) || row[key] <= 0) issues.push(`${context}.${key} must be positive integer`);
    }
    if (row.navigation_rows <= row.support_rows) issues.push(`${context}.navigation_rows must be broader than support_rows`);
    if (row.selected_navigation_rows !== row.support_rows) issues.push(`${context}.selected_navigation_rows must equal support_rows`);
    if (row.concordance_source_refs <= row.selected_source_refs) {
      issues.push(`${context}.concordance_source_refs must be broader than selected_source_refs`);
    }
    if (row.row_label !== 'route pointer only') issues.push(`${context}.row_label must be route pointer only`);
    if (row.route_payload_copied !== false) issues.push(`${context}.route_payload_copied must be false`);
    if (row.agent2_payload_copied !== false) issues.push(`${context}.agent2_payload_copied must be false`);
    if (row.route_metadata_copied !== false) issues.push(`${context}.route_metadata_copied must be false`);
    if (row.consumer_action !== 'resolve_agent2_route_payloads_outside_agent3') {
      issues.push(`${context}.consumer_action must require external Agent 2 payload resolution`);
    }
    if (Number(row.selected_status_counts?.supported || 0) <= 0) issues.push(`${context}.selected_status_counts.supported must be positive`);
    if (Number(row.selected_status_counts?.candidate || 0) <= 0) issues.push(`${context}.selected_status_counts.candidate must be positive`);
    if (Number(row.selected_status_counts?.weak || 0) <= 0) issues.push(`${context}.selected_status_counts.weak must be positive`);
  }
}

function validateCounts(counts) {
  const required = [
    'route_pointer_rows',
    'route_ids',
    'resolved_route_ids',
    'unresolved_route_ids',
    'route_source_paths',
    'existing_route_source_paths',
    'occurrence_route_rows',
    'occurrence_route_rows_with_pointer',
    'support_rows',
    'support_rows_with_pointer',
    'support_rows_with_resolved_route_ids',
    'navigation_rows',
    'navigation_rows_with_pointer',
    'selected_navigation_rows',
    'planning_rows',
    'planning_rows_with_pointer',
    'selected_source_refs',
    'selected_works',
    'selected_usage_frames',
    'concordance_source_refs',
    'concordance_works',
    'concordance_categories',
    'supported_rows',
    'candidate_rows',
    'weak_rows',
    'navigation_supported_rows',
    'navigation_candidate_rows',
    'navigation_weak_rows',
    'audit_only_ambiguous_rows_available',
    'audit_only_ambiguous_rows_emitted',
    'route_payload_copied_rows',
    'agent2_payload_copied_rows',
    'route_metadata_copied_rows',
    'semantic_arbitration_rows',
    'answer_authority_rows',
    'route_ranking_rows',
    'visible_answer_selection_rows',
    'reader_facing_rows',
    'route_payload_field_hits',
    'forbidden_authority_field_hits',
    'route_metadata_field_hits',
    'queue_mutations',
    'submitted_to_agent6',
  ];
  for (const key of required) {
    if (!Number.isInteger(counts[key])) issues.push(`counts.${key} must be an integer`);
  }
  if (counts.route_pointer_rows !== 1) {
    issues.push('counts.route_pointer_rows must be 1 for current selected route-pointer audit');
  }
  if (counts.route_ids !== counts.route_pointer_rows) issues.push('counts.route_ids must equal route_pointer_rows');
  if (counts.resolved_route_ids !== counts.route_ids) issues.push('counts.resolved_route_ids must equal route_ids');
  if (counts.unresolved_route_ids !== 0) issues.push('counts.unresolved_route_ids must be 0');
  if (counts.existing_route_source_paths !== counts.route_source_paths) {
    issues.push('counts.existing_route_source_paths must equal route_source_paths');
  }
  if (counts.occurrence_route_rows_with_pointer !== counts.occurrence_route_rows) {
    issues.push('counts.occurrence_route_rows_with_pointer must equal occurrence_route_rows');
  }
  if (counts.support_rows_with_pointer !== counts.support_rows) {
    issues.push('counts.support_rows_with_pointer must equal support_rows');
  }
  if (counts.support_rows_with_resolved_route_ids !== counts.support_rows) {
    issues.push('counts.support_rows_with_resolved_route_ids must equal support_rows');
  }
  if (counts.navigation_rows_with_pointer !== counts.navigation_rows) {
    issues.push('counts.navigation_rows_with_pointer must equal navigation_rows');
  }
  if (counts.selected_navigation_rows !== counts.support_rows) {
    issues.push('counts.selected_navigation_rows must equal support_rows');
  }
  if (counts.planning_rows_with_pointer !== counts.planning_rows) {
    issues.push('counts.planning_rows_with_pointer must equal planning_rows');
  }
  if (counts.supported_rows + counts.candidate_rows + counts.weak_rows !== counts.support_rows) {
    issues.push('support status counts must cover support_rows');
  }
  if (counts.audit_only_ambiguous_rows_available <= 0) {
    issues.push('counts.audit_only_ambiguous_rows_available must be positive');
  }
  if (counts.audit_only_ambiguous_rows_emitted !== 0) {
    issues.push('counts.audit_only_ambiguous_rows_emitted must be 0');
  }
  for (const key of [
    'route_payload_copied_rows',
    'agent2_payload_copied_rows',
    'route_metadata_copied_rows',
    'semantic_arbitration_rows',
    'answer_authority_rows',
    'route_ranking_rows',
    'visible_answer_selection_rows',
    'reader_facing_rows',
    'route_payload_field_hits',
    'forbidden_authority_field_hits',
    'route_metadata_field_hits',
    'queue_mutations',
    'submitted_to_agent6',
  ]) {
    if (counts[key] !== 0) issues.push(`counts.${key} must be 0`);
  }
}

function validateChecks(checks) {
  if (!checks.length) issues.push('checks must be non-empty');
  const failed = checks.filter((check) => check.status === 'failed');
  if (failed.length) issues.push(`checks must not contain failed rows: ${failed.map((check) => check.id).join(', ')}`);
  const warning = checks.find((check) => check.id === 'single_route_scope_visible');
  if (!warning || warning.status !== 'warning') {
    issues.push('checks must include warning single_route_scope_visible');
  } else {
    warnings.push(`single_route_scope_visible: ${warning.detail}`);
  }
}

function validateForbiddenAuthorityKeys(value) {
  const hits = [];
  walk(value, (key, pathParts) => {
    if (forbiddenAuthorityKeys.has(key)) hits.push(pathParts.join('.'));
  });
  if (hits.length) issues.push(`forbidden authority keys present: ${hits.slice(0, 20).join(', ')}`);
}

function requireFields(row, fields, context) {
  for (const field of fields) {
    if (row[field] === undefined || row[field] === null || row[field] === '') {
      issues.push(`${context}.${field} is required`);
    }
  }
}

function walk(value, visit, pathParts = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, visit, [...pathParts, String(index)]));
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    visit(key, [...pathParts, key]);
    walk(child, visit, [...pathParts, key]);
  }
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\/+/, '');
}
