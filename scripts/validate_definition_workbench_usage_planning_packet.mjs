#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const forbiddenLicenseRe = /\bNC\b|Non-?Commercial|all rights reserved|copyright unclear|unknown|unverified|permission only/i;
const packetPath = cleanRelativePath(process.argv[2] || 'data/definitions/definition-workbench-usage-planning-packet.json');
const packet = readJson(packetPath);
const issues = [];
const warnings = [];

if (packet.schema_version !== 1) issues.push('schema_version must be 1');
if (packet.artifact_type !== 'definition_workbench_usage_planning_packet') {
  issues.push('artifact_type must be definition_workbench_usage_planning_packet');
}
if (packet.lane_owner !== 'Agent 3') issues.push('lane_owner must be Agent 3');
if (packet.gate !== 'definition_workbench_gate') issues.push('gate must be definition_workbench_gate');

validateSourceArtifacts(packet.source_artifacts || {});
validateAuthorityBoundary(packet.authority_boundary || {});
validatePlanningGateBoundary(packet.planning_gate_boundary || {});
validateUsageStatusPolicy(packet.usage_status_policy || {});
validatePlanningHandoffSummary(packet.planning_handoff_summary || {});
validatePlanningRows(packet.planning_rows);
validateOccurrenceRows(packet.occurrence_navigation_links);
validateCounts(packet.counts || {});
validateChecks(packet.checks || []);
validateForbiddenAuthorityKeys(packet);

if (issues.length) {
  console.error(`Definition Workbench usage planning packet validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 120)) console.error(`- ${issue}`);
  process.exit(1);
}

if (warnings.length) {
  console.log(`Definition Workbench usage planning packet validation passed with ${warnings.length} warning(s).`);
  for (const warning of warnings.slice(0, 40)) console.log(`- ${warning}`);
} else {
  console.log('Definition Workbench usage planning packet validation passed.');
}
console.log(`Planning rows: ${packet.counts.planning_rows}; occurrence links: ${packet.counts.occurrence_link_rows}; reader-facing: ${packet.counts.reader_facing_rows}.`);

function validateSourceArtifacts(artifacts) {
  for (const key of [
    'plan',
    'occurrence_links',
    'route_resolution',
    'sample_gap_audit',
    'consumer_manifest',
    'queue_ready_packet',
  ]) {
    if (!artifacts[key]) {
      issues.push(`source_artifacts.${key} is required`);
    } else if (!fs.existsSync(path.join(root, cleanRelativePath(artifacts[key])))) {
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
    'planning_packet_only',
  ];
  const expectedFalse = [
    'reader_facing',
    'lexical_authority',
    'semantic_arbitration',
    'route_ranking',
    'visible_result_selection',
    'copied_route_payloads',
    'accepted_text_output',
    'publication_claim',
  ];
  for (const key of expectedTrue) {
    if (boundary[key] !== true) issues.push(`authority_boundary.${key} must be true`);
  }
  for (const key of expectedFalse) {
    if (boundary[key] !== false) issues.push(`authority_boundary.${key} must be false`);
  }
}

function validatePlanningGateBoundary(boundary) {
  if (boundary.target_gate !== 'definition_workbench_gate') issues.push('planning_gate_boundary.target_gate must be definition_workbench_gate');
  if (boundary.current_sample_rows <= 0) issues.push('planning_gate_boundary.current_sample_rows must be positive');
  if (boundary.current_sample_rows_with_usage_links !== 0) {
    warnings.push('current sample already has usage links; expected 0 for this gap packet');
  }
  if (boundary.agent3_queue_mutation !== false) issues.push('planning_gate_boundary.agent3_queue_mutation must be false');
  if (boundary.agent3_submission_to_agent6 !== false) issues.push('planning_gate_boundary.agent3_submission_to_agent6 must be false');
  if (boundary.intended_submitter !== 'Agent 5') issues.push('planning_gate_boundary.intended_submitter must be Agent 5');
}

function validateUsageStatusPolicy(policy) {
  if (policy.supported_candidate_weak_are_usage_navigation_statuses !== true) {
    issues.push('usage_status_policy.supported_candidate_weak_are_usage_navigation_statuses must be true');
  }
  if (policy.status_is_not_review_authority !== true) {
    issues.push('usage_status_policy.status_is_not_review_authority must be true');
  }
  if (policy.ambiguous_rows_policy !== 'audit_only_not_reader_facing') {
    issues.push('usage_status_policy.ambiguous_rows_policy must be audit_only_not_reader_facing');
  }
}

function validatePlanningHandoffSummary(summary) {
  if (summary.packet_role !== 'usage_occurrence_link_support_for_definition_workbench_planning') {
    issues.push('planning_handoff_summary.packet_role is invalid');
  }
  const boundary = summary.consumer_boundary || {};
  if (boundary.intended_consumer !== 'Agent 5 planning handoff and Agent 6 QA review') {
    issues.push('planning_handoff_summary.consumer_boundary.intended_consumer is invalid');
  }
  for (const key of ['hud_or_ranking_owner', 'route_data_owner', 'source_import_owner', 'queue_mutation_owner']) {
    if (boundary[key] !== false) issues.push(`planning_handoff_summary.consumer_boundary.${key} must be false`);
  }
  if (!Array.isArray(summary.allowed_planning_use) || summary.allowed_planning_use.length < 4) {
    issues.push('planning_handoff_summary.allowed_planning_use must contain at least 4 items');
  }
  if (!Array.isArray(summary.forbidden_planning_use) || summary.forbidden_planning_use.length < 7) {
    issues.push('planning_handoff_summary.forbidden_planning_use must contain at least 7 items');
  }
  for (const required of [
    'definition authority',
    'semantic arbitration',
    'route ranking',
    'visible result selection',
    'publication support',
    'accepted text output',
    'copying Agent 2 route payloads',
  ]) {
    if (!(summary.forbidden_planning_use || []).includes(required)) {
      issues.push(`planning_handoff_summary.forbidden_planning_use missing ${required}`);
    }
  }

  const visibility = summary.row_visibility || {};
  if (visibility.selected_rows_label !== 'observed usage only') {
    issues.push('planning_handoff_summary.row_visibility.selected_rows_label must be observed usage only');
  }
  if (visibility.ambiguous_rows_label !== 'audit only') {
    issues.push('planning_handoff_summary.row_visibility.ambiguous_rows_label must be audit only');
  }
  if (visibility.reader_facing_rows !== 0) {
    issues.push('planning_handoff_summary.row_visibility.reader_facing_rows must be 0');
  }

  const scope = summary.selected_scope || {};
  if (!Array.isArray(scope.selected_token_keys) || scope.selected_token_keys.length < 1) {
    issues.push('planning_handoff_summary.selected_scope.selected_token_keys must be non-empty');
  }
  if (!Array.isArray(scope.occurrence_token_keys) || scope.occurrence_token_keys.length < 1) {
    issues.push('planning_handoff_summary.selected_scope.occurrence_token_keys must be non-empty');
  }
  if (!Number.isInteger(scope.planning_rows) || scope.planning_rows < 1) {
    issues.push('planning_handoff_summary.selected_scope.planning_rows must be positive');
  }
  if (!Number.isInteger(scope.occurrence_links) || scope.occurrence_links < 1) {
    issues.push('planning_handoff_summary.selected_scope.occurrence_links must be positive');
  }
  if (!Number.isInteger(scope.source_refs) || scope.source_refs < 1) {
    issues.push('planning_handoff_summary.selected_scope.source_refs must be positive');
  }
  if (!Number.isInteger(scope.works) || scope.works < 1) {
    issues.push('planning_handoff_summary.selected_scope.works must be positive');
  }
  const statuses = scope.statuses || {};
  for (const status of ['supported', 'candidate', 'weak']) {
    if (!Number.isInteger(statuses[status]) || statuses[status] < 0) {
      issues.push(`planning_handoff_summary.selected_scope.statuses.${status} must be a non-negative integer`);
    }
  }
  if ((statuses.supported || 0) + (statuses.candidate || 0) + (statuses.weak || 0) !== scope.occurrence_links) {
    issues.push('planning_handoff_summary.selected_scope.statuses must sum to occurrence_links');
  }

  const routeLinkage = summary.route_linkage || {};
  if (routeLinkage.linkage_mode !== 'route_ids_only') {
    issues.push('planning_handoff_summary.route_linkage.linkage_mode must be route_ids_only');
  }
  if (!Array.isArray(routeLinkage.route_ids) || routeLinkage.route_ids.length < 1) {
    issues.push('planning_handoff_summary.route_linkage.route_ids must be non-empty');
  }
  if (!Array.isArray(routeLinkage.resolved_route_ids) || routeLinkage.resolved_route_ids.length < 1) {
    issues.push('planning_handoff_summary.route_linkage.resolved_route_ids must be non-empty');
  }
  if (!Array.isArray(routeLinkage.unresolved_route_ids)) {
    issues.push('planning_handoff_summary.route_linkage.unresolved_route_ids must be an array');
  } else if (routeLinkage.unresolved_route_ids.length !== 0) {
    issues.push('planning_handoff_summary.route_linkage.unresolved_route_ids must be empty');
  }
  if (routeLinkage.route_payloads_copied !== false) {
    issues.push('planning_handoff_summary.route_linkage.route_payloads_copied must be false');
  }
  if (routeLinkage.linked_artifact_owner !== 'Agent 2') {
    issues.push('planning_handoff_summary.route_linkage.linked_artifact_owner must be Agent 2');
  }

  const provenance = summary.provenance_snapshot || {};
  if (!Array.isArray(provenance.licenses) || provenance.licenses.length < 1) {
    issues.push('planning_handoff_summary.provenance_snapshot.licenses must be non-empty');
  }
  if ((provenance.licenses || []).some((license) => hasForbiddenLicense(license))) {
    issues.push('planning_handoff_summary.provenance_snapshot.licenses includes forbidden or unclear license label');
  }
  if (provenance.all_rows_have_source_license_context !== true) {
    issues.push('planning_handoff_summary.provenance_snapshot.all_rows_have_source_license_context must be true');
  }

  const sampleJoin = summary.sample_join_status || {};
  if (!Number.isInteger(sampleJoin.current_sample_rows) || sampleJoin.current_sample_rows < 1) {
    issues.push('planning_handoff_summary.sample_join_status.current_sample_rows must be positive');
  }
  if (sampleJoin.current_sample_rows_with_usage_links !== 0) {
    warnings.push('planning_handoff_summary sample already has usage links; expected 0 for this gap packet');
  }
  if (!Number.isInteger(sampleJoin.usage_tokens_not_in_current_sample) || sampleJoin.usage_tokens_not_in_current_sample < 1) {
    issues.push('planning_handoff_summary.sample_join_status.usage_tokens_not_in_current_sample must be positive');
  }

  if (!Array.isArray(summary.qa_boundary_references) || summary.qa_boundary_references.length < 2) {
    issues.push('planning_handoff_summary.qa_boundary_references must contain at least 2 references');
  } else {
    for (const reference of summary.qa_boundary_references) {
      if (!fs.existsSync(path.join(root, cleanRelativePath(reference)))) {
        issues.push(`planning_handoff_summary.qa_boundary_references missing file ${reference}`);
      }
    }
  }

  const warningSummary = summary.warning_summary || {};
  if (warningSummary.route_concentration_warning_visible !== true) {
    warnings.push('planning_handoff_summary route concentration warning is not visible');
  }
  if (warningSummary.current_sample_gap_visible !== true) {
    warnings.push('planning_handoff_summary current sample gap is not visible');
  }
  if (warningSummary.broad_coverage_claim_allowed !== false) {
    issues.push('planning_handoff_summary.warning_summary.broad_coverage_claim_allowed must be false');
  }
  if (warningSummary.semantic_independence_claim_allowed !== false) {
    issues.push('planning_handoff_summary.warning_summary.semantic_independence_claim_allowed must be false');
  }

  const reviewState = summary.review_state || {};
  if (reviewState.agent3_queue_mutation !== false) issues.push('planning_handoff_summary.review_state.agent3_queue_mutation must be false');
  if (reviewState.agent3_submission_to_agent6 !== false) issues.push('planning_handoff_summary.review_state.agent3_submission_to_agent6 must be false');
  if (reviewState.intended_submitter !== 'Agent 5') issues.push('planning_handoff_summary.review_state.intended_submitter must be Agent 5');
}

function validatePlanningRows(rows) {
  if (!Array.isArray(rows) || rows.length < 1) {
    issues.push('planning_rows must contain at least one row');
    return;
  }
  for (const [index, row] of rows.entries()) {
    const label = `planning_rows[${index}]`;
    if (!row.planning_row_id) issues.push(`${label}.planning_row_id is required`);
    if (!row.seed_id) issues.push(`${label}.seed_id is required`);
    if (!row.token_key) issues.push(`${label}.token_key is required`);
    if (!row.normalized_form) issues.push(`${label}.normalized_form is required`);
    if (row.row_label !== 'observed usage only') issues.push(`${label}.row_label must be observed usage only`);
    if (!Array.isArray(row.route_ids) || row.route_ids.length < 1) issues.push(`${label}.route_ids must be non-empty`);
    if (!Array.isArray(row.licenses) || row.licenses.length < 1) issues.push(`${label}.licenses must be non-empty`);
    if ((row.licenses || []).some((license) => hasForbiddenLicense(license))) {
      issues.push(`${label}.licenses includes forbidden or unclear license label`);
    }
    if (!row.usage_frames || Object.keys(row.usage_frames).length < 1) issues.push(`${label}.usage_frames must be non-empty`);
    if (Number(row.audit_only_ambiguous_rows || 0) <= 0) issues.push(`${label}.audit_only_ambiguous_rows must be positive`);
    validateRowBoundary(row.row_boundary || {}, label);
  }
}

function validateOccurrenceRows(rows) {
  if (!Array.isArray(rows) || rows.length < 1) {
    issues.push('occurrence_navigation_links must contain at least one row');
    return;
  }
  const allowedStatuses = new Set(['supported', 'candidate', 'weak']);
  const ids = new Set();
  for (const [index, row] of rows.entries()) {
    const label = `occurrence_navigation_links[${index}]`;
    if (!row.row_id) issues.push(`${label}.row_id is required`);
    if (!row.occurrence_id) issues.push(`${label}.occurrence_id is required`);
    if (ids.has(row.occurrence_id)) issues.push(`${label}.occurrence_id must be unique`);
    ids.add(row.occurrence_id);
    if (!row.token_key) issues.push(`${label}.token_key is required`);
    if (!row.token_surface) issues.push(`${label}.token_surface is required`);
    if (!row.token_normalized) issues.push(`${label}.token_normalized is required`);
    if (!row.focus_surface) issues.push(`${label}.focus_surface is required`);
    if (!row.focus_normalized) issues.push(`${label}.focus_normalized is required`);
    if (row.row_label !== 'observed usage only') issues.push(`${label}.row_label must be observed usage only`);
    if (!row.source_ref) issues.push(`${label}.source_ref is required`);
    if (!/^https:\/\//.test(row.source_url || '')) issues.push(`${label}.source_url must be https`);
    if (!row.work_page_anchor) issues.push(`${label}.work_page_anchor is required`);
    if (!row.phrase_context_snippet) issues.push(`${label}.phrase_context_snippet is required`);
    if (!/\[.+\]/u.test(row.phrase_context_snippet || '')) issues.push(`${label}.phrase_context_snippet must include focus marker`);
    if (!allowedStatuses.has(row.status)) issues.push(`${label}.status must be supported, candidate, or weak`);
    if (!Number.isInteger(row.raw_score) || row.raw_score < 0 || row.raw_score > 100) issues.push(`${label}.raw_score must be 0-100 integer`);
    if (!Array.isArray(row.related_route_ids) || row.related_route_ids.length < 1) issues.push(`${label}.related_route_ids must be non-empty`);
    if (!row.version_title) issues.push(`${label}.version_title is required`);
    if (!row.version_source) issues.push(`${label}.version_source is required`);
    if (!row.license) issues.push(`${label}.license is required`);
    if (hasForbiddenLicense(row.license)) issues.push(`${label}.license includes forbidden or unclear license label`);
    if (!/^https:\/\//.test(row.license_url || '')) issues.push(`${label}.license_url must be https`);
    validateRowBoundary(row.row_boundary || {}, label);
  }
}

function validateRowBoundary(boundary, label) {
  if (boundary.reader_facing !== false) issues.push(`${label}.row_boundary.reader_facing must be false`);
  if (boundary.route_ids_only !== true) issues.push(`${label}.row_boundary.route_ids_only must be true`);
  if (boundary.lexical_authority !== false) issues.push(`${label}.row_boundary.lexical_authority must be false`);
  if (boundary.semantic_arbitration !== false) issues.push(`${label}.row_boundary.semantic_arbitration must be false`);
  if (boundary.publication_claim !== false) issues.push(`${label}.row_boundary.publication_claim must be false`);
}

function validateCounts(counts) {
  const required = [
    'planning_rows',
    'planning_rows_absent_from_current_sample',
    'occurrence_link_rows',
    'occurrence_rows_with_source_ref',
    'occurrence_rows_with_source_url',
    'occurrence_rows_with_work_page_anchor',
    'occurrence_rows_with_context_snippet',
    'occurrence_rows_with_focus_marker',
    'occurrence_rows_with_license',
    'occurrence_rows_with_version',
    'occurrence_rows_with_route_ids',
    'planning_rows_with_forbidden_license',
    'occurrence_rows_with_forbidden_license',
    'forbidden_license_rows',
    'route_ids',
    'current_sample_rows',
    'current_sample_rows_with_usage_links',
    'current_sample_usage_tokens_not_in_sample',
    'audit_only_ambiguous_rows',
    'route_concentration_warning_visible',
    'reader_facing_rows',
    'route_payload_field_hits',
    'forbidden_authority_field_hits',
    'queue_mutations',
    'submitted_to_agent6',
    'planning_summary_token_keys',
    'planning_summary_occurrence_token_keys',
    'planning_summary_supported_rows',
    'planning_summary_candidate_rows',
    'planning_summary_weak_rows',
    'planning_summary_resolved_route_ids',
    'planning_summary_unresolved_route_ids',
    'planning_summary_source_refs',
    'planning_summary_works',
    'planning_summary_forbidden_use_items',
    'planning_summary_qa_boundary_references',
  ];
  for (const key of required) {
    if (!Number.isInteger(counts[key]) || counts[key] < 0) issues.push(`counts.${key} must be a non-negative integer`);
  }
  if (counts.planning_rows < 1) issues.push('counts.planning_rows must be positive');
  if (counts.planning_rows_absent_from_current_sample !== counts.planning_rows) {
    issues.push('all planning rows must be absent from the current sample for this packet');
  }
  if (counts.occurrence_link_rows < 1) issues.push('counts.occurrence_link_rows must be positive');
  for (const key of [
    'occurrence_rows_with_source_ref',
    'occurrence_rows_with_source_url',
    'occurrence_rows_with_work_page_anchor',
    'occurrence_rows_with_context_snippet',
    'occurrence_rows_with_focus_marker',
    'occurrence_rows_with_license',
    'occurrence_rows_with_version',
    'occurrence_rows_with_route_ids',
  ]) {
    if (counts[key] !== counts.occurrence_link_rows) issues.push(`counts.${key} must equal occurrence_link_rows`);
  }
  if (counts.route_ids < 1) issues.push('counts.route_ids must be positive');
  if (counts.planning_rows_with_forbidden_license !== 0) issues.push('counts.planning_rows_with_forbidden_license must be 0');
  if (counts.occurrence_rows_with_forbidden_license !== 0) issues.push('counts.occurrence_rows_with_forbidden_license must be 0');
  if (counts.forbidden_license_rows !== 0) issues.push('counts.forbidden_license_rows must be 0');
  if (counts.current_sample_rows <= 0) issues.push('counts.current_sample_rows must be positive');
  if (counts.current_sample_rows_with_usage_links !== 0) {
    warnings.push('current sample usage links are non-zero');
  }
  if (counts.current_sample_usage_tokens_not_in_sample < 1) {
    issues.push('counts.current_sample_usage_tokens_not_in_sample must be positive');
  }
  if (counts.audit_only_ambiguous_rows <= 0) issues.push('counts.audit_only_ambiguous_rows must be positive');
  if (counts.route_concentration_warning_visible !== 1) {
    warnings.push('route concentration warning is not visible');
  }
  if (counts.reader_facing_rows !== 0) issues.push('counts.reader_facing_rows must be 0');
  if (counts.route_payload_field_hits !== 0) issues.push('counts.route_payload_field_hits must be 0');
  if (counts.forbidden_authority_field_hits !== 0) issues.push('counts.forbidden_authority_field_hits must be 0');
  if (counts.queue_mutations !== 0) issues.push('counts.queue_mutations must be 0');
  if (counts.submitted_to_agent6 !== 0) issues.push('counts.submitted_to_agent6 must be 0');
  if (counts.planning_summary_token_keys < 1) issues.push('counts.planning_summary_token_keys must be positive');
  if (counts.planning_summary_occurrence_token_keys < 1) issues.push('counts.planning_summary_occurrence_token_keys must be positive');
  if (counts.planning_summary_supported_rows + counts.planning_summary_candidate_rows + counts.planning_summary_weak_rows !== counts.occurrence_link_rows) {
    issues.push('planning summary supported/candidate/weak counts must sum to occurrence_link_rows');
  }
  if (counts.planning_summary_resolved_route_ids !== counts.route_ids) {
    issues.push('counts.planning_summary_resolved_route_ids must equal route_ids');
  }
  if (counts.planning_summary_unresolved_route_ids !== 0) {
    issues.push('counts.planning_summary_unresolved_route_ids must be 0');
  }
  if (counts.planning_summary_source_refs < 1) issues.push('counts.planning_summary_source_refs must be positive');
  if (counts.planning_summary_works < 1) issues.push('counts.planning_summary_works must be positive');
  if (counts.planning_summary_forbidden_use_items < 7) issues.push('counts.planning_summary_forbidden_use_items must be at least 7');
  if (counts.planning_summary_qa_boundary_references < 2) issues.push('counts.planning_summary_qa_boundary_references must be at least 2');
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
    'planning_rows_present',
    'current_sample_gap_visible',
    'occurrence_links_present',
    'source_work_context_complete',
    'license_version_complete',
    'license_boundary_safe',
    'route_ids_only_linkage',
    'route_concentration_warning_visible',
    'ambiguous_rows_audit_only',
    'usage_boundary_only',
    'queue_not_mutated',
    'planning_handoff_summary_complete',
    'planning_status_counts_reconcile',
    'planning_route_resolution_visible',
  ]) {
    if (!ids.has(required)) issues.push(`checks missing ${required}`);
  }
}

function validateForbiddenAuthorityKeys(value) {
  const forbidden = new Set([
    'definition',
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
  walk(value, []);

  function walk(node, trail) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach((item, index) => walk(item, [...trail, String(index)]));
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (forbidden.has(key)) issues.push(`forbidden authority key ${[...trail, key].join('.')}`);
      walk(child, [...trail, key]);
    }
  }
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function hasForbiddenLicense(value) {
  return forbiddenLicenseRe.test(String(value || ''));
}

function cleanRelativePath(value) {
  return value.replace(/\\/g, '/');
}
