#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packetPath = cleanRelativePath(process.argv[2] || 'data/definitions/definition-workbench-usage-route-concentration-guardrail.json');
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
if (packet.artifact_type !== 'definition_workbench_usage_route_concentration_guardrail') {
  issues.push('artifact_type must be definition_workbench_usage_route_concentration_guardrail');
}
if (!String(packet.policy || '').includes('route-concentration guardrail')) {
  issues.push('policy must identify route-concentration guardrail');
}

validateInputs(packet.inputs || {});
validateAuthorityBoundary(packet.authority_boundary || {});
validateInterpretation(packet.guardrail_interpretation || {});
validateRows(Array.isArray(packet.guardrail_rows) ? packet.guardrail_rows : []);
validateCounts(packet.counts || {});
validateChecks(Array.isArray(packet.checks) ? packet.checks : []);
validateForbiddenAuthorityKeys(packet);

if (issues.length) {
  console.error(`Definition Workbench usage route-concentration guardrail validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 120)) console.error(`- ${issue}`);
  process.exit(1);
}

if (warnings.length) {
  console.log(`Definition Workbench usage route-concentration guardrail validation passed with ${warnings.length} warning(s).`);
  for (const warning of warnings.slice(0, 40)) console.log(`- ${warning}`);
} else {
  console.log('Definition Workbench usage route-concentration guardrail validation passed.');
}
console.log(`Surfaces: ${packet.counts.guardrail_surfaces}; concentration warnings: ${packet.counts.guardrail_surfaces_with_concentration_warning}; semantic allowed: ${packet.counts.semantic_independence_allowed_rows}.`);

function validateInputs(inputs) {
  const required = [
    'facet_index',
    'context_token_index',
    'context_token_links',
    'context_token_occurrence_index',
    'occurrence_context_profile',
    'route_diversity_probe',
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
    'selected_scope_only',
    'observed_usage_only',
    'route_ids_only',
    'route_concentration_guardrail_only',
    'source_license_required',
  ];
  const expectedFalse = [
    'reader_facing',
    'copies_route_payloads',
    'copies_agent2_payloads',
    'ranks_routes',
    'selects_visible_result',
    'semantic_arbitration',
    'semantic_independence_claim',
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

function validateInterpretation(interpretation) {
  if (interpretation.status !== 'single_route_concentration_guardrail_required') {
    issues.push('guardrail_interpretation.status must require single-route concentration guardrail');
  }
  if (interpretation.selected_scope_only !== true) issues.push('guardrail_interpretation.selected_scope_only must be true');
  if (interpretation.route_concentration_visible !== true) issues.push('guardrail_interpretation.route_concentration_visible must be true');
  if (interpretation.all_guardrail_surfaces_single_route !== true) {
    issues.push('guardrail_interpretation.all_guardrail_surfaces_single_route must be true');
  }
  if (interpretation.all_guardrail_surfaces_max_share_10000 !== true) {
    issues.push('guardrail_interpretation.all_guardrail_surfaces_max_share_10000 must be true');
  }
  if (interpretation.semantic_independence_claim_allowed !== false) {
    issues.push('guardrail_interpretation.semantic_independence_claim_allowed must be false');
  }
  if (interpretation.usage_rows_may_be_used_as_authority !== false) {
    issues.push('guardrail_interpretation.usage_rows_may_be_used_as_authority must be false');
  }
  if (!String(interpretation.downstream_rule || '').includes('observed usage only')) {
    issues.push('guardrail_interpretation.downstream_rule must require observed usage only labels');
  }
  if (!String(interpretation.downstream_rule || '').includes('Agent 2 route payloads outside Agent 3')) {
    issues.push('guardrail_interpretation.downstream_rule must keep Agent 2 payloads outside Agent 3');
  }
}

function validateRows(rows) {
  const requiredIds = [
    'facet_index',
    'context_token_index',
    'context_token_links',
    'context_token_occurrence_index',
    'occurrence_context_profile',
    'route_diversity_probe',
    'planning_packet',
  ];
  if (rows.length !== requiredIds.length) issues.push(`guardrail_rows must contain ${requiredIds.length} rows`);
  const ids = new Set();
  for (const [index, row] of rows.entries()) {
    const context = row.surface_id || `guardrail_rows[${index}]`;
    ids.add(row.surface_id);
    requireFields(row, [
      'surface_id',
      'artifact_path',
      'artifact_type',
      'quality_status',
      'occurrence_rows',
      'evidence_rows',
      'evidence_label',
      'route_ids',
      'unresolved_route_ids',
      'max_route_share_basis_points',
      'route_concentration_warning',
      'semantic_independence_claim_allowed',
      'answer_authority_allowed',
      'route_ranking_allowed',
      'visible_answer_selection_allowed',
      'reader_facing_rows',
      'route_payload_field_hits',
      'forbidden_authority_field_hits',
      'row_label_required',
      'consumer_action',
      'detail',
    ], context);
    if (!fs.existsSync(path.join(root, cleanRelativePath(row.artifact_path)))) {
      issues.push(`${context}.artifact_path must exist`);
    }
    if (!['passed', 'pass_with_warnings'].includes(row.quality_status)) {
      issues.push(`${context}.quality_status must be passed or pass_with_warnings`);
    }
    if (!Number.isInteger(row.occurrence_rows) || row.occurrence_rows <= 0) {
      issues.push(`${context}.occurrence_rows must be positive`);
    }
    if (!Number.isInteger(row.evidence_rows) || row.evidence_rows <= 0) {
      issues.push(`${context}.evidence_rows must be positive`);
    }
    if (row.route_ids !== 1) issues.push(`${context}.route_ids must be 1`);
    if (row.unresolved_route_ids !== 0) issues.push(`${context}.unresolved_route_ids must be 0`);
    if (row.max_route_share_basis_points !== 10000) {
      issues.push(`${context}.max_route_share_basis_points must be 10000`);
    }
    if (row.route_concentration_warning !== true) {
      issues.push(`${context}.route_concentration_warning must be true`);
    }
    if (row.semantic_independence_claim_allowed !== false) {
      issues.push(`${context}.semantic_independence_claim_allowed must be false`);
    }
    if (row.answer_authority_allowed !== false) issues.push(`${context}.answer_authority_allowed must be false`);
    if (row.route_ranking_allowed !== false) issues.push(`${context}.route_ranking_allowed must be false`);
    if (row.visible_answer_selection_allowed !== false) {
      issues.push(`${context}.visible_answer_selection_allowed must be false`);
    }
    if (row.reader_facing_rows !== 0) issues.push(`${context}.reader_facing_rows must be 0`);
    if (row.route_payload_field_hits !== 0) issues.push(`${context}.route_payload_field_hits must be 0`);
    if (row.forbidden_authority_field_hits !== 0) issues.push(`${context}.forbidden_authority_field_hits must be 0`);
    if (row.row_label_required !== 'observed usage only') {
      issues.push(`${context}.row_label_required must be observed usage only`);
    }
    if (row.consumer_action !== 'preserve_route_concentration_warning') {
      issues.push(`${context}.consumer_action must preserve route concentration warning`);
    }
  }
  for (const id of requiredIds) {
    if (!ids.has(id)) issues.push(`guardrail_rows missing ${id}`);
  }
}

function validateCounts(counts) {
  const required = [
    'guardrail_surfaces',
    'guardrail_surfaces_with_single_route',
    'guardrail_surfaces_with_max_share_10000',
    'guardrail_surfaces_with_concentration_warning',
    'semantic_independence_allowed_rows',
    'answer_authority_allowed_rows',
    'route_ranking_allowed_rows',
    'visible_answer_selection_allowed_rows',
    'route_payload_field_hits',
    'forbidden_authority_field_hits',
    'reader_facing_rows',
    'unresolved_route_ids',
    'occurrence_rows_min',
    'occurrence_rows_max',
    'source_artifacts',
    'source_artifacts_passed_or_warning',
  ];
  for (const key of required) {
    if (!Number.isInteger(counts[key]) || counts[key] < 0) issues.push(`counts.${key} must be a non-negative integer`);
  }
  if (counts.guardrail_surfaces !== 7) issues.push('counts.guardrail_surfaces must be 7');
  for (const key of [
    'guardrail_surfaces_with_single_route',
    'guardrail_surfaces_with_max_share_10000',
    'guardrail_surfaces_with_concentration_warning',
    'source_artifacts',
    'source_artifacts_passed_or_warning',
  ]) {
    if (counts[key] !== counts.guardrail_surfaces) issues.push(`counts.${key} must equal guardrail_surfaces`);
  }
  for (const key of [
    'semantic_independence_allowed_rows',
    'answer_authority_allowed_rows',
    'route_ranking_allowed_rows',
    'visible_answer_selection_allowed_rows',
    'route_payload_field_hits',
    'forbidden_authority_field_hits',
    'reader_facing_rows',
    'unresolved_route_ids',
  ]) {
    if (counts[key] !== 0) issues.push(`counts.${key} must be 0`);
  }
  if (counts.occurrence_rows_min <= 0) issues.push('counts.occurrence_rows_min must be positive');
  if (counts.occurrence_rows_max < counts.occurrence_rows_min) {
    issues.push('counts.occurrence_rows_max must be >= occurrence_rows_min');
  }
}

function validateChecks(checks) {
  if (!Array.isArray(checks) || checks.length === 0) issues.push('checks must be non-empty');
  for (const check of checks) {
    if (check.status === 'failed') issues.push(`check failed: ${check.id} ${check.detail || ''}`.trim());
    if (check.status === 'warning') warnings.push(`${check.id}: ${check.detail || ''}`.trim());
  }
}

function validateForbiddenAuthorityKeys(value) {
  const hits = [];
  walk(value, '$');
  if (hits.length) {
    issues.push(`forbidden authority keys present: ${hits.slice(0, 60).join(', ')}`);
  }

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

function requireFields(value, fields, context) {
  for (const field of fields) {
    if (value[field] === undefined || value[field] === null || value[field] === '') {
      issues.push(`${context}: missing ${field}`);
    }
  }
}

function readJson(relativePath) {
  return JSON.parse(stripJsonBom(fs.readFileSync(path.join(root, relativePath), 'utf8')));
}

function stripJsonBom(text) {
  return text.replace(/^\uFEFF/, '');
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}
