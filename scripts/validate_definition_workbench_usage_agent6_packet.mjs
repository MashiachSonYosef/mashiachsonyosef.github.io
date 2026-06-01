#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packetPath = cleanRelativePath(process.argv[2] || 'data/definitions/definition-workbench-usage-agent6-packet.json');
const packet = readJson(packetPath);
const issues = [];
const warnings = [];
const forbiddenAuthorityKeys = new Set([
  'definition',
  'definition_text',
  'source_text',
  'meaning',
  'meaning_claim',
  'translation',
  'translation_text',
  'accepted_translation',
  'publication_status',
  'final_answer',
  'winner',
  'route_payload',
  'route_payloads',
  'route_links',
]);

if (packet.schema_version !== 1) issues.push('schema_version must be 1');
if (packet.artifact_type !== 'definition_workbench_usage_agent6_packet') {
  issues.push('artifact_type must be definition_workbench_usage_agent6_packet');
}
if (packet.gate !== 'definition_workbench_gate') issues.push('gate must be definition_workbench_gate');
if (packet.submitted_by !== 'Agent 3') issues.push('submitted_by must be Agent 3');

validateAuthorityPolicy(packet.authority_policy || {});
validatePacketChain(packet.packet_chain || {});
validateReviewSummary(packet.review_summary || {});
validateAcceptanceBoundaries(packet.acceptance_boundaries || {});
validateCounts(packet.counts || {});
validateChecks(packet.checks || []);
validateProofOccurrences(packet.proof_occurrences);
validateForbiddenAuthorityKeys(packet);

if (issues.length) {
  console.error(`Definition Workbench usage Agent 6 packet validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 120)) console.error(`- ${issue}`);
  process.exit(1);
}

if (warnings.length) {
  console.log(`Definition Workbench usage Agent 6 packet validation passed with ${warnings.length} warning(s).`);
  for (const warning of warnings.slice(0, 40)) console.log(`- ${warning}`);
} else {
  console.log('Definition Workbench usage Agent 6 packet validation passed.');
}
console.log(`Proof rows: ${packet.counts.proof_occurrence_rows}; route IDs: ${packet.counts.route_ids}; absent seeds: ${packet.counts.usage_tokens_absent_from_current_sample}.`);

function validateAuthorityPolicy(policy) {
  const expectedTrue = [
    'usage_navigation_only',
    'qa_packet_only',
    'live_sample_unchanged',
    'route_ids_only',
    'usage_rows_not_answer_authority',
    'review_status_not_answer_authority',
  ];
  const expectedFalse = [
    'reader_facing',
    'ranks_routes',
    'selects_visible_result',
    'ambiguous_rows_reader_facing',
    'copies_route_payloads',
    'copies_translation_payloads',
    'publication_claim',
  ];
  for (const key of expectedTrue) {
    if (policy[key] !== true) issues.push(`authority_policy.${key} must be true`);
  }
  for (const key of expectedFalse) {
    if (policy[key] !== false) issues.push(`authority_policy.${key} must be false`);
  }
}

function validatePacketChain(chain) {
  if (chain.link_packet_status !== 'pass_with_warnings') {
    issues.push('packet_chain.link_packet_status must preserve pass_with_warnings from the no-overlap link packet');
  }
  if (chain.seed_queue_status !== 'passed') issues.push('packet_chain.seed_queue_status must be passed');
  if (chain.join_smoke_status !== 'passed') issues.push('packet_chain.join_smoke_status must be passed');
  if (Number(chain.link_packet_warning_count || 0) < 1) warnings.push('link packet warning count is not visible');
  if (Number(chain.seed_queue_warning_count || 0) !== 0) issues.push('seed queue warning count must be 0');
  if (Number(chain.join_smoke_warning_count || 0) !== 0) issues.push('join smoke warning count must be 0');
}

function validateReviewSummary(summary) {
  if (Number(summary.current_sample_rows || 0) < 1) issues.push('review_summary.current_sample_rows must be positive');
  if (Number(summary.current_sample_review_verified_rows || 0) !== 0) {
    issues.push('review_summary.current_sample_review_verified_rows must remain 0');
  }
  if (Number(summary.current_sample_rows_with_usage_links || 0) !== 0) {
    issues.push('review_summary.current_sample_rows_with_usage_links must remain 0 for this packet');
  }
  if (Number(summary.usage_tokens_absent_from_current_sample || 0) < 1) {
    issues.push('review_summary.usage_tokens_absent_from_current_sample must be positive');
  }
  if (Number(summary.join_rows || 0) < 1) issues.push('review_summary.join_rows must be positive');
  if (Number(summary.projected_rows_after_seed_append || 0) <= Number(summary.current_sample_rows || 0)) {
    issues.push('review_summary.projected_rows_after_seed_append must show bounded sample growth');
  }
  if (Number(summary.projected_usage_link_rows || 0) < Number(summary.selected_occurrence_proof_rows || 0)) {
    issues.push('review_summary.projected_usage_link_rows must cover selected proof rows');
  }
  if (summary.route_concentration_warning_visible !== true) warnings.push('route concentration warning must stay visible');
}

function validateAcceptanceBoundaries(boundaries) {
  if (!Array.isArray(boundaries.acceptable_if_validated) || boundaries.acceptable_if_validated.length < 3) {
    issues.push('acceptance_boundaries.acceptable_if_validated must contain bounded acceptable claims');
  }
  if (!Array.isArray(boundaries.blocked_acceptance_claims) || boundaries.blocked_acceptance_claims.length < 6) {
    issues.push('acceptance_boundaries.blocked_acceptance_claims must contain explicit blocked claims');
  }
  const blockedText = (boundaries.blocked_acceptance_claims || []).join(' | ');
  for (const required of ['reviewed lexical authority', 'visible answer selection', 'publication readiness', 'accepted translation text']) {
    if (!blockedText.includes(required)) issues.push(`blocked_acceptance_claims must include ${required}`);
  }
}

function validateCounts(counts) {
  const requiredIntegerCounts = [
    'evidence_artifacts',
    'validator_scripts',
    'proof_occurrence_rows',
    'proof_rows_with_source',
    'proof_rows_with_work_anchor',
    'proof_rows_with_context',
    'proof_rows_with_license',
    'proof_rows_with_version',
    'proof_rows_with_route_ids',
    'route_ids',
    'tokens',
    'usage_frames',
    'supported_rows',
    'candidate_rows',
    'weak_rows',
    'audit_only_ambiguous_rows',
    'current_sample_rows',
    'current_sample_review_verified_rows',
    'current_sample_rows_with_usage_links',
    'usage_tokens_absent_from_current_sample',
    'join_rows',
    'projected_rows_after_seed_append',
    'projected_usage_link_rows',
    'route_concentration_warning_visible',
    'reader_facing_rows',
    'route_payload_field_hits',
    'forbidden_authority_field_hits',
  ];
  for (const key of requiredIntegerCounts) {
    if (!Number.isInteger(counts[key]) || counts[key] < 0) issues.push(`counts.${key} must be a non-negative integer`);
  }
  if (counts.evidence_artifacts !== 6) issues.push('evidence_artifacts must be 6');
  if (counts.validator_scripts !== 4) issues.push('validator_scripts must be 4');
  if (counts.proof_occurrence_rows < 1) issues.push('proof_occurrence_rows must be positive');
  if (counts.proof_rows_with_source !== counts.proof_occurrence_rows) issues.push('all proof rows must include source links');
  if (counts.proof_rows_with_work_anchor !== counts.proof_occurrence_rows) issues.push('all proof rows must include work anchors');
  if (counts.proof_rows_with_context !== counts.proof_occurrence_rows) issues.push('all proof rows must include context');
  if (counts.proof_rows_with_license !== counts.proof_occurrence_rows) issues.push('all proof rows must include license metadata');
  if (counts.proof_rows_with_version !== counts.proof_occurrence_rows) issues.push('all proof rows must include version metadata');
  if (counts.proof_rows_with_route_ids !== counts.proof_occurrence_rows) issues.push('all proof rows must include route IDs');
  if (counts.route_ids < 1) issues.push('route_ids must be positive');
  if (counts.tokens < 1) issues.push('tokens must be positive');
  if (counts.usage_frames < 1) issues.push('usage_frames must be positive');
  if (counts.supported_rows + counts.candidate_rows + counts.weak_rows !== counts.proof_occurrence_rows) {
    issues.push('supported/candidate/weak counts must reconcile with proof_occurrence_rows');
  }
  if (counts.audit_only_ambiguous_rows <= 0) issues.push('audit_only_ambiguous_rows must be carried forward');
  if (counts.current_sample_review_verified_rows !== 0) issues.push('current_sample_review_verified_rows must remain 0');
  if (counts.current_sample_rows_with_usage_links !== 0) issues.push('current_sample_rows_with_usage_links must be 0');
  if (counts.usage_tokens_absent_from_current_sample < 1) issues.push('usage_tokens_absent_from_current_sample must be positive');
  if (counts.projected_rows_after_seed_append !== counts.current_sample_rows + counts.usage_tokens_absent_from_current_sample) {
    issues.push('projected_rows_after_seed_append must equal current sample rows plus absent tokens');
  }
  if (counts.projected_usage_link_rows < counts.proof_occurrence_rows) {
    issues.push('projected_usage_link_rows must cover proof_occurrence_rows');
  }
  if (counts.route_concentration_warning_visible !== 1) warnings.push('route concentration warning is not visible');
  if (counts.reader_facing_rows !== 0) issues.push('reader_facing_rows must remain 0');
  if (counts.route_payload_field_hits !== 0) issues.push('route_payload_field_hits must remain 0');
  if (counts.forbidden_authority_field_hits !== 0) issues.push('forbidden_authority_field_hits must remain 0');
}

function validateChecks(checks) {
  if (!Array.isArray(checks) || checks.length === 0) issues.push('checks must be a non-empty array');
  const failed = checks.filter((check) => check.status === 'failed');
  if (failed.length) issues.push(`checks contain failed rows: ${failed.map((check) => check.id).join(', ')}`);
}

function validateProofOccurrences(rows) {
  if (!Array.isArray(rows)) {
    issues.push('proof_occurrences must be an array');
    return;
  }
  if (rows.length !== packet.counts?.proof_occurrence_rows) issues.push('proof_occurrences length must match counts.proof_occurrence_rows');
  for (const [index, row] of rows.entries()) {
    const context = `proof_occurrences[${index}]`;
    requireString(row.token_key, `${context}.token_key`);
    requireString(row.normalized_form, `${context}.normalized_form`);
    requireString(row.occurrence_id, `${context}.occurrence_id`);
    requireString(row.source_ref, `${context}.source_ref`);
    requireString(row.source_href, `${context}.source_href`);
    requireString(row.work_anchor_href, `${context}.work_anchor_href`);
    if (!['supported', 'candidate', 'weak'].includes(row.status)) issues.push(`${context}.status must be supported, candidate, or weak`);
    requireString(row.context_focus_marked, `${context}.context_focus_marked`);
    requireString(row.license, `${context}.license`);
    requireString(row.license_url, `${context}.license_url`);
    requireString(row.version_title, `${context}.version_title`);
    requireString(row.version_source, `${context}.version_source`);
    if (!Array.isArray(row.route_ids) || row.route_ids.length === 0) issues.push(`${context}.route_ids must contain route ID-only linkage`);
    requireOccurrenceBoundary(row.occurrence_boundary, `${context}.occurrence_boundary`);
  }
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

function requireOccurrenceBoundary(boundary, context) {
  if (!boundary || typeof boundary !== 'object') {
    issues.push(`${context} must be an object`);
    return;
  }
  if (boundary.observed_usage_only !== true) issues.push(`${context}.observed_usage_only must be true`);
  if (boundary.reader_facing !== false) issues.push(`${context}.reader_facing must be false`);
  if (boundary.route_ids_only !== true) issues.push(`${context}.route_ids_only must be true`);
  if (boundary.not_answer_authority !== true) issues.push(`${context}.not_answer_authority must be true`);
}

function requireString(value, field) {
  if (typeof value !== 'string' || value.length === 0) issues.push(`${field} must be a non-empty string`);
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
