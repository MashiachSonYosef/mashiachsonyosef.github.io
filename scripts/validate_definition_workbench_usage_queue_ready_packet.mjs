#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packetPath = cleanRelativePath(process.argv[2] || 'data/definitions/definition-workbench-usage-queue-ready-packet.json');
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
]);

if (packet.schema_version !== 1) issues.push('schema_version must be 1');
if (packet.artifact_type !== 'definition_workbench_usage_queue_ready_packet') {
  issues.push('artifact_type must be definition_workbench_usage_queue_ready_packet');
}
if (packet.lane_owner !== 'Agent 3') issues.push('lane_owner must be Agent 3');
if (packet.target_gate !== 'definition_workbench_gate') issues.push('target_gate must be definition_workbench_gate');

validateSubmissionBoundary(packet.submission_boundary || {});
validateQueueContract(packet.queue_contract_snapshot || {});
validateGoalBoardSnapshot(packet.goal_board_snapshot || {});
validateQueueDraft(packet.queue_entry_draft || {});
validateSourcePacketSummary(packet.source_packet_summary || {});
validateOccurrenceLinksSummary(packet.occurrence_links_summary || {});
validateCounts(packet.counts || {});
validateChecks(packet.checks || []);
validateForbiddenAuthorityKeys(packet);

if (issues.length) {
  console.error(`Definition Workbench usage queue-ready packet validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 120)) console.error(`- ${issue}`);
  process.exit(1);
}

if (warnings.length) {
  console.log(`Definition Workbench usage queue-ready packet validation passed with ${warnings.length} warning(s).`);
  for (const warning of warnings.slice(0, 40)) console.log(`- ${warning}`);
} else {
  console.log('Definition Workbench usage queue-ready packet validation passed.');
}
console.log(`Required fields: ${packet.counts.required_queue_fields_present}/${packet.counts.required_queue_fields}; evidence artifacts: ${packet.counts.evidence_artifacts_exist}/${packet.counts.evidence_artifacts}; submitted: ${packet.counts.submitted_to_agent6}.`);

function validateSubmissionBoundary(boundary) {
  const expectedTrue = [
    'queue_ready_only',
    'agent3_does_not_submit_to_agent6_queue',
  ];
  const expectedFalse = [
    'control_queue_mutated',
    'submitted_to_agent6',
    'worker_report_terminal_status_allowed',
  ];
  for (const key of expectedTrue) {
    if (boundary[key] !== true) issues.push(`submission_boundary.${key} must be true`);
  }
  for (const key of expectedFalse) {
    if (boundary[key] !== false) issues.push(`submission_boundary.${key} must be false`);
  }
  if (boundary.intended_submitter !== 'Agent 5') issues.push('submission_boundary.intended_submitter must be Agent 5');
}

function validateQueueContract(contract) {
  if (!Array.isArray(contract.required_request_fields) || contract.required_request_fields.length < 9) {
    issues.push('queue_contract_snapshot.required_request_fields must include Agent 6 intake fields');
  }
  if (!Array.isArray(contract.allowed_submitters) || !contract.allowed_submitters.includes('Agent 5')) {
    issues.push('queue_contract_snapshot.allowed_submitters must include Agent 5');
  }
  if (contract.publication_global_status !== 'blocked_no_render') {
    warnings.push('publication_global_status is not blocked_no_render');
  }
}

function validateGoalBoardSnapshot(snapshot) {
  if (snapshot.goal_id !== 'agent3-definition-occurrence-links') {
    issues.push('goal_board_snapshot.goal_id must be agent3-definition-occurrence-links');
  }
  if (!['active', 'evidence-ready', 'awaiting-Agent-6'].includes(snapshot.goal_status)) {
    warnings.push(`goal status is ${snapshot.goal_status || 'missing'}`);
  }
  if (snapshot.acceptance_owner !== 'Agent 6') issues.push('goal_board_snapshot.acceptance_owner must be Agent 6');
  if (!Array.isArray(snapshot.worker_report_may_set) || !snapshot.worker_report_may_set.includes('evidence-ready')) {
    issues.push('goal_board_snapshot.worker_report_may_set must include evidence-ready');
  }
}

function validateQueueDraft(draft) {
  const required = packet.queue_contract_snapshot?.required_request_fields || [];
  for (const field of required) {
    if (draft[field] === undefined || draft[field] === null || draft[field] === '') {
      issues.push(`queue_entry_draft.${field} is required by Agent 6 queue contract`);
    }
  }
  if (draft.request_id !== 'agent6-definition-workbench-usage-occurrence-links') {
    issues.push('queue_entry_draft.request_id is unexpected');
  }
  if (draft.submitted_by !== 'Agent 5') issues.push('queue_entry_draft.submitted_by must be Agent 5 for queue-copy template');
  if (!packet.queue_contract_snapshot?.allowed_submitters?.includes(draft.submitted_by)) {
    issues.push('queue_entry_draft.submitted_by is not allowed by current queue contract');
  }
  if (draft.gate !== 'definition_workbench_gate') issues.push('queue_entry_draft.gate must be definition_workbench_gate');
  if (draft.status !== 'queue_template_not_submitted') issues.push('queue_entry_draft.status must be queue_template_not_submitted');
  if (!Array.isArray(draft.evidence_artifacts) || draft.evidence_artifacts.length < 8) {
    issues.push('queue_entry_draft.evidence_artifacts must contain machine-readable packet chain paths');
  }
  if (!draft.evidence_artifacts.includes('data/definitions/definition-workbench-usage-occurrence-links.json')) {
    issues.push('queue_entry_draft.evidence_artifacts must include occurrence links packet');
  }
  if (!draft.evidence_artifacts.includes('reports/definition-workbench-usage-occurrence-links.md')) {
    issues.push('queue_entry_draft.evidence_artifacts must include occurrence links report');
  }
  if (!String(draft.claimed_boundary || '').includes('Usage-navigation occurrence-link planning evidence only')) {
    issues.push('queue_entry_draft.claimed_boundary must preserve usage-navigation-only boundary');
  }
  const mustNot = Array.isArray(draft.what_must_not_be_accepted) ? draft.what_must_not_be_accepted.join(' | ') : '';
  for (const requiredClaim of ['usage rows as definitions', 'reviewed lexical authority', 'publication readiness', 'accepted translation text']) {
    if (!mustNot.includes(requiredClaim)) issues.push(`queue_entry_draft.what_must_not_be_accepted must include ${requiredClaim}`);
  }
}

function validateSourcePacketSummary(summary) {
  if (summary.status !== 'passed') issues.push('source_packet_summary.status must be passed');
  const proofRows = Number(summary.proof_occurrence_rows || 0);
  if (proofRows < 1) issues.push('source_packet_summary.proof_occurrence_rows must be positive');
  for (const key of [
    'proof_rows_with_source',
    'proof_rows_with_work_anchor',
    'proof_rows_with_context',
    'proof_rows_with_license',
    'proof_rows_with_version',
    'proof_rows_with_route_ids',
    'proof_rows_with_hebrew_token',
    'proof_rows_with_hebrew_context',
    'proof_rows_with_focus_marker',
  ]) {
    if (Number(summary[key] || 0) !== proofRows) issues.push(`source_packet_summary.${key} must equal proof_occurrence_rows`);
  }
  if (Number(summary.proof_mojibake_rows || 0) !== 0) issues.push('source_packet_summary.proof_mojibake_rows must be 0');
  if (Number(summary.reader_facing_rows || 0) !== 0) issues.push('source_packet_summary.reader_facing_rows must be 0');
  if (Number(summary.route_payload_field_hits || 0) !== 0) issues.push('source_packet_summary.route_payload_field_hits must be 0');
  if (Number(summary.forbidden_authority_field_hits || 0) !== 0) issues.push('source_packet_summary.forbidden_authority_field_hits must be 0');
}

function validateOccurrenceLinksSummary(summary) {
  if (summary.status !== 'passed') issues.push('occurrence_links_summary.status must be passed');
  const rows = Number(summary.occurrence_link_rows || 0);
  if (rows < 1) issues.push('occurrence_links_summary.occurrence_link_rows must be positive');
  for (const key of [
    'rows_with_source_link',
    'rows_with_work_anchor',
    'rows_with_hebrew_context',
    'rows_with_focus_marker',
    'rows_with_license',
    'rows_with_version',
    'rows_with_route_ids',
  ]) {
    if (Number(summary[key] || 0) !== rows) issues.push(`occurrence_links_summary.${key} must equal occurrence_link_rows`);
  }
  if (Number(summary.audit_only_ambiguous_rows_available || 0) <= 0) {
    issues.push('occurrence_links_summary.audit_only_ambiguous_rows_available must be positive');
  }
  if (Number(summary.audit_only_ambiguous_rows_emitted || 0) !== 0) {
    issues.push('occurrence_links_summary.audit_only_ambiguous_rows_emitted must be 0');
  }
  if (Number(summary.reader_facing_rows || 0) !== 0) issues.push('occurrence_links_summary.reader_facing_rows must be 0');
  if (Number(summary.route_payload_field_hits || 0) !== 0) issues.push('occurrence_links_summary.route_payload_field_hits must be 0');
  if (Number(summary.forbidden_authority_field_hits || 0) !== 0) {
    issues.push('occurrence_links_summary.forbidden_authority_field_hits must be 0');
  }
}

function validateCounts(counts) {
  const requiredIntegerCounts = [
    'required_queue_fields',
    'required_queue_fields_present',
    'evidence_artifacts',
    'evidence_artifacts_exist',
    'validator_scripts',
    'validator_scripts_exist',
    'allowed_submitters',
    'draft_submitter_allowed',
    'source_packet_status_passed',
    'occurrence_links_status_passed',
    'occurrence_link_rows',
    'occurrence_link_rows_with_complete_metadata',
    'occurrence_link_rows_with_hebrew_context',
    'occurrence_link_rows_with_focus_marker',
    'occurrence_link_mojibake_rows',
    'occurrence_link_audit_only_ambiguous_rows_available',
    'occurrence_link_audit_only_ambiguous_rows_emitted',
    'occurrence_link_reader_facing_rows',
    'occurrence_link_route_payload_field_hits',
    'occurrence_link_forbidden_authority_field_hits',
    'proof_occurrence_rows',
    'proof_rows_with_complete_metadata',
    'proof_rows_with_hebrew_token',
    'proof_rows_with_hebrew_context',
    'proof_rows_with_focus_marker',
    'proof_mojibake_rows',
    'route_ids',
    'current_sample_rows_with_usage_links',
    'usage_tokens_absent_from_current_sample',
    'join_rows',
    'projected_usage_link_rows',
    'reader_facing_rows',
    'route_payload_field_hits',
    'forbidden_authority_field_hits',
    'queue_mutations',
    'submitted_to_agent6',
  ];
  for (const key of requiredIntegerCounts) {
    if (!Number.isInteger(counts[key]) || counts[key] < 0) issues.push(`counts.${key} must be a non-negative integer`);
  }
  if (counts.required_queue_fields_present !== counts.required_queue_fields) issues.push('all required queue fields must be present');
  if (counts.evidence_artifacts_exist !== counts.evidence_artifacts) issues.push('all evidence artifacts must exist');
  if (counts.validator_scripts_exist !== counts.validator_scripts) issues.push('all validator scripts must exist');
  if (counts.draft_submitter_allowed !== 1) issues.push('draft_submitter_allowed must be 1');
  if (counts.source_packet_status_passed !== 1) issues.push('source_packet_status_passed must be 1');
  if (counts.occurrence_links_status_passed !== 1) issues.push('occurrence_links_status_passed must be 1');
  if (counts.occurrence_link_rows < 1) issues.push('occurrence_link_rows must be positive');
  if (counts.occurrence_link_rows_with_complete_metadata !== counts.occurrence_link_rows) {
    issues.push('occurrence link metadata must be complete');
  }
  if (counts.occurrence_link_rows_with_hebrew_context !== counts.occurrence_link_rows) {
    issues.push('occurrence links must include Hebrew context');
  }
  if (counts.occurrence_link_rows_with_focus_marker !== counts.occurrence_link_rows) {
    issues.push('occurrence links must include focus markers');
  }
  if (counts.occurrence_link_mojibake_rows !== 0) issues.push('occurrence_link_mojibake_rows must be 0');
  if (counts.occurrence_link_audit_only_ambiguous_rows_available < 1) {
    issues.push('occurrence_link_audit_only_ambiguous_rows_available must be positive');
  }
  if (counts.occurrence_link_audit_only_ambiguous_rows_emitted !== 0) {
    issues.push('occurrence_link_audit_only_ambiguous_rows_emitted must be 0');
  }
  if (counts.occurrence_link_reader_facing_rows !== 0) issues.push('occurrence_link_reader_facing_rows must be 0');
  if (counts.occurrence_link_route_payload_field_hits !== 0) {
    issues.push('occurrence_link_route_payload_field_hits must be 0');
  }
  if (counts.occurrence_link_forbidden_authority_field_hits !== 0) {
    issues.push('occurrence_link_forbidden_authority_field_hits must be 0');
  }
  if (counts.proof_occurrence_rows < 1) issues.push('proof_occurrence_rows must be positive');
  if (counts.proof_rows_with_complete_metadata !== counts.proof_occurrence_rows) issues.push('proof metadata must be complete');
  if (counts.proof_rows_with_hebrew_token !== counts.proof_occurrence_rows) issues.push('all proof rows must include Hebrew token fields');
  if (counts.proof_rows_with_hebrew_context !== counts.proof_occurrence_rows) issues.push('all proof rows must include Hebrew context');
  if (counts.proof_rows_with_focus_marker !== counts.proof_occurrence_rows) issues.push('all proof rows must include focus markers');
  if (counts.proof_mojibake_rows !== 0) issues.push('proof_mojibake_rows must be 0');
  if (counts.current_sample_rows_with_usage_links !== 0) issues.push('current_sample_rows_with_usage_links must be 0 for this queue-ready packet');
  if (counts.usage_tokens_absent_from_current_sample < 1) issues.push('usage_tokens_absent_from_current_sample must be positive');
  if (counts.join_rows < 1) issues.push('join_rows must be positive');
  if (counts.projected_usage_link_rows < counts.proof_occurrence_rows) issues.push('projected_usage_link_rows must cover proof rows');
  if (counts.reader_facing_rows !== 0) issues.push('reader_facing_rows must be 0');
  if (counts.route_payload_field_hits !== 0) issues.push('route_payload_field_hits must be 0');
  if (counts.forbidden_authority_field_hits !== 0) issues.push('forbidden_authority_field_hits must be 0');
  if (counts.queue_mutations !== 0) issues.push('queue_mutations must be 0');
  if (counts.submitted_to_agent6 !== 0) issues.push('submitted_to_agent6 must be 0');
}

function validateChecks(checks) {
  if (!Array.isArray(checks) || checks.length === 0) issues.push('checks must be a non-empty array');
  const failed = checks.filter((check) => check.status === 'failed');
  if (failed.length) issues.push(`checks contain failed rows: ${failed.map((check) => check.id).join(', ')}`);
}

function validateForbiddenAuthorityKeys(value) {
  const hits = [];
  walk(value, '$');
  if (hits.length) {
    issues.push(`forbidden authority keys present: ${hits.slice(0, 30).join(', ')}`);
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
