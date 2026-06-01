#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const statePath = cleanRelativePath(process.argv[2] || 'reports/agent3-state.json');
const state = readJson(statePath);
const issues = [];
const warnings = [];

if (state.schema_version !== 1) issues.push('schema_version must be 1');
if (state.artifact_type !== 'agent3_usage_navigation_state') issues.push('artifact_type must be agent3_usage_navigation_state');
if (state.agent !== 'Agent 3') issues.push('agent must be Agent 3');
if (state.lane !== 'workbench_usage_navigation') issues.push('lane must be workbench_usage_navigation');
if (state.worker_state !== 'evidence-ready') issues.push('worker_state must be evidence-ready');
if (state.qa_acceptance_state !== 'not_agent6_accepted') issues.push('qa_acceptance_state must be not_agent6_accepted');
if (state.acceptance_owner !== 'Agent 6') issues.push('acceptance_owner must be Agent 6');

validateAuthorityBoundary(state.authority_boundary || {});
validateHandoffState(state.handoff_state || {});
validateMetrics(state.current_metrics || {});
validateCounts(state.counts || {});
validateChecks(state.checks || []);
validateArtifacts(state.evidence_artifacts || [], 'evidence_artifacts');
validateArtifacts(state.validators || [], 'validators');

if (issues.length) {
  console.error(`Agent 3 usage state validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 120)) console.error(`- ${issue}`);
  process.exit(1);
}

if (warnings.length) {
  console.log(`Agent 3 usage state validation passed with ${warnings.length} warning(s).`);
  for (const warning of warnings.slice(0, 40)) console.log(`- ${warning}`);
} else {
  console.log('Agent 3 usage state validation passed.');
}
console.log(`Evidence artifacts: ${state.counts.evidence_artifacts_exist}/${state.counts.evidence_artifacts}; validators: ${state.counts.validator_scripts_exist}/${state.counts.validator_scripts}; smoke failed: ${state.counts.smoke_failed_steps}.`);

function validateAuthorityBoundary(boundary) {
  const expectedTrue = [
    'usage_navigation_only',
    'occurrence_link_packet_only',
    'route_ids_only',
  ];
  const expectedFalse = [
    'definition_authority',
    'semantic_arbitration',
    'route_ranking',
    'hud_or_workbench_ui_acceptance',
    'publication_support',
    'accepted_translation_text',
    'agent6_accepted',
  ];
  for (const key of expectedTrue) {
    if (boundary[key] !== true) issues.push(`authority_boundary.${key} must be true`);
  }
  for (const key of expectedFalse) {
    if (boundary[key] !== false) issues.push(`authority_boundary.${key} must be false`);
  }
}

function validateHandoffState(handoff) {
  if (handoff.intended_submitter !== 'Agent 5') issues.push('handoff_state.intended_submitter must be Agent 5');
  if (handoff.control_queue_mutated !== false) issues.push('handoff_state.control_queue_mutated must be false');
  if (handoff.submitted_to_agent6 !== false) issues.push('handoff_state.submitted_to_agent6 must be false');
  if (!handoff.queue_ready_packet || !fs.existsSync(path.join(root, handoff.queue_ready_packet))) {
    issues.push('handoff_state.queue_ready_packet must point to an existing packet');
  }
}

function validateMetrics(metrics) {
  const requiredNonNegative = [
    'usage_concordance_rows',
    'usage_supported_rows',
    'usage_candidate_rows',
    'usage_weak_rows',
    'audit_only_ambiguous_rows',
    'usage_clusters',
    'selected_usage_rows',
    'selected_source_refs',
    'selected_works',
    'route_ids',
    'proof_occurrence_rows',
    'proof_rows_with_complete_metadata',
    'proof_rows_with_hebrew_context',
    'proof_mojibake_rows',
    'reader_facing_rows',
    'route_payload_field_hits',
    'forbidden_authority_field_hits',
    'queue_required_fields_present',
    'queue_required_fields',
    'queue_evidence_artifacts_exist',
    'queue_evidence_artifacts',
    'smoke_steps',
    'smoke_failed_steps',
    'smoke_source_freshness_pending_files',
  ];
  for (const key of requiredNonNegative) {
    if (!Number.isInteger(metrics[key]) || metrics[key] < 0) issues.push(`current_metrics.${key} must be a non-negative integer`);
  }
  if (metrics.usage_supported_rows + metrics.usage_candidate_rows + metrics.usage_weak_rows <= 0) {
    issues.push('usage supported/candidate/weak rows must contain useful rows');
  }
  if (metrics.audit_only_ambiguous_rows <= 0) issues.push('audit_only_ambiguous_rows must be visible');
  if (metrics.proof_occurrence_rows <= 0) issues.push('proof_occurrence_rows must be positive');
  if (metrics.proof_rows_with_complete_metadata !== metrics.proof_occurrence_rows) issues.push('proof metadata must be complete');
  if (metrics.proof_rows_with_hebrew_context !== metrics.proof_occurrence_rows) issues.push('proof Hebrew context rows must equal proof rows');
  if (metrics.proof_mojibake_rows !== 0) issues.push('proof_mojibake_rows must be 0');
  if (metrics.reader_facing_rows !== 0) issues.push('reader_facing_rows must be 0');
  if (metrics.route_payload_field_hits !== 0) issues.push('route_payload_field_hits must be 0');
  if (metrics.forbidden_authority_field_hits !== 0) issues.push('forbidden_authority_field_hits must be 0');
  if (metrics.queue_required_fields_present !== metrics.queue_required_fields) issues.push('queue required fields must be complete');
  if (metrics.queue_evidence_artifacts_exist !== metrics.queue_evidence_artifacts) issues.push('queue evidence artifacts must be complete');
  if (metrics.smoke_steps <= 0) issues.push('smoke_steps must be positive');
  if (metrics.smoke_failed_steps !== 0) issues.push('smoke_failed_steps must be 0');
  if (metrics.smoke_source_freshness_status !== 'stale') {
    warnings.push(`smoke_source_freshness_status is ${metrics.smoke_source_freshness_status || 'missing'}`);
  }
}

function validateCounts(counts) {
  const required = [
    'evidence_artifacts',
    'evidence_artifacts_exist',
    'validator_scripts',
    'validator_scripts_exist',
    'queue_required_fields_present',
    'queue_required_fields',
    'queue_mutations',
    'submitted_to_agent6',
    'usage_concordance_rows',
    'usage_supported_rows',
    'usage_candidate_rows',
    'usage_weak_rows',
    'audit_only_ambiguous_rows',
    'proof_occurrence_rows',
    'proof_rows_with_complete_metadata',
    'proof_rows_with_hebrew_context',
    'proof_mojibake_rows',
    'reader_facing_rows',
    'route_payload_field_hits',
    'forbidden_authority_field_hits',
    'smoke_steps',
    'smoke_failed_steps',
  ];
  for (const key of required) {
    if (!Number.isInteger(counts[key]) || counts[key] < 0) issues.push(`counts.${key} must be a non-negative integer`);
  }
  if (counts.evidence_artifacts_exist !== counts.evidence_artifacts) issues.push('all evidence artifacts must exist');
  if (counts.validator_scripts_exist !== counts.validator_scripts) issues.push('all validator scripts must exist');
  if (counts.queue_required_fields_present !== counts.queue_required_fields) issues.push('queue required fields must be complete');
  if (counts.queue_mutations !== 0) issues.push('queue_mutations must be 0');
  if (counts.submitted_to_agent6 !== 0) issues.push('submitted_to_agent6 must be 0');
  if (counts.reader_facing_rows !== 0) issues.push('reader_facing_rows must be 0');
  if (counts.route_payload_field_hits !== 0) issues.push('route_payload_field_hits must be 0');
  if (counts.forbidden_authority_field_hits !== 0) issues.push('forbidden_authority_field_hits must be 0');
  if (counts.smoke_failed_steps !== 0) issues.push('smoke_failed_steps must be 0');
}

function validateChecks(checks) {
  if (!Array.isArray(checks) || checks.length === 0) issues.push('checks must be a non-empty array');
  const failed = checks.filter((check) => check.status === 'failed');
  if (failed.length) issues.push(`checks contain failed rows: ${failed.map((check) => check.id).join(', ')}`);
}

function validateArtifacts(paths, fieldName) {
  if (!Array.isArray(paths) || paths.length === 0) {
    issues.push(`${fieldName} must be a non-empty array`);
    return;
  }
  for (const artifactPath of paths) {
    if (!fs.existsSync(path.join(root, artifactPath))) issues.push(`${fieldName} missing path: ${artifactPath}`);
  }
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
