#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/usage-context-signature-lookup.json');
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
const allowedStatuses = new Set(['supported', 'candidate', 'weak']);

if (artifact.schema_version !== 1) issues.push('schema_version must be 1');
if (artifact.artifact_type !== 'workbench_usage_context_signature_lookup') {
  issues.push('artifact_type must be workbench_usage_context_signature_lookup');
}
if (!String(artifact.policy || '').includes('Per-occurrence context-signature lookup')) {
  issues.push('policy must identify per-occurrence context-signature lookup');
}
if (artifact.authority_policy?.usage_navigation_only !== true) issues.push('authority_policy.usage_navigation_only must be true');
if (artifact.authority_policy?.ranks_routes !== false) issues.push('authority_policy.ranks_routes must be false');
if (artifact.authority_policy?.selects_visible_result !== false) issues.push('authority_policy.selects_visible_result must be false');
if (artifact.authority_policy?.ambiguous_rows_reader_facing !== false) {
  issues.push('authority_policy.ambiguous_rows_reader_facing must be false');
}
if (artifact.authority_policy?.route_payloads_copied !== false) issues.push('authority_policy.route_payloads_copied must be false');
if (artifact.quality?.status !== 'passed') issues.push('quality.status must be passed');
if (Number(artifact.quality?.failed_count || 0) !== 0) issues.push('quality.failed_count must be 0');
if (Number(artifact.counts?.route_payload_field_hits || 0) !== 0) issues.push('route_payload_field_hits must be 0');
if (Number(artifact.counts?.unmatched_occurrence_ids || 0) !== 0) issues.push('unmatched_occurrence_ids must be 0');

const occurrences = Array.isArray(artifact.occurrences) ? artifact.occurrences : [];
if (!occurrences.length) issues.push('occurrences must be non-empty');
if (Number(artifact.counts?.occurrence_refs || 0) !== occurrences.length) {
  issues.push('occurrence_refs must equal occurrences length');
}
if (Number(artifact.counts?.signature_memberships || 0) <= Number(artifact.counts?.occurrence_refs || 0)) {
  issues.push('signature_memberships must exceed occurrence_refs');
}
if (Number(artifact.counts?.recurring_signature_memberships || 0) <= 0) {
  issues.push('recurring_signature_memberships must be positive');
}
if (Number(artifact.counts?.occurrence_refs_with_recurring_signatures || 0) <= 0) {
  issues.push('occurrence_refs_with_recurring_signatures must be positive');
}

let membershipSum = 0;
let recurringMembershipSum = 0;
let crossClusterMembershipSum = 0;
const occurrenceIdsWithRecurring = new Set();
const occurrenceIdsWithCrossCluster = new Set();
for (const [occurrenceIndex, occurrence] of occurrences.entries()) {
  validateOccurrence(`occurrences[${occurrenceIndex}]`, occurrence);
  membershipSum += Number(occurrence.counts?.signature_memberships || 0);
  recurringMembershipSum += Number(occurrence.counts?.recurring_signature_memberships || 0);
  crossClusterMembershipSum += Number(occurrence.counts?.cross_cluster_signature_memberships || 0);
  if (Number(occurrence.counts?.recurring_signature_memberships || 0) > 0) occurrenceIdsWithRecurring.add(occurrence.occurrence_id);
  if (Number(occurrence.counts?.cross_cluster_signature_memberships || 0) > 0) occurrenceIdsWithCrossCluster.add(occurrence.occurrence_id);
}
if (membershipSum !== Number(artifact.counts?.signature_memberships || 0)) {
  issues.push('occurrence signature memberships must sum to counts.signature_memberships');
}
if (recurringMembershipSum !== Number(artifact.counts?.recurring_signature_memberships || 0)) {
  issues.push('occurrence recurring memberships must sum to counts.recurring_signature_memberships');
}
if (crossClusterMembershipSum !== Number(artifact.counts?.cross_cluster_signature_memberships || 0)) {
  issues.push('occurrence cross-cluster memberships must sum to counts.cross_cluster_signature_memberships');
}
if (occurrenceIdsWithRecurring.size !== Number(artifact.counts?.occurrence_refs_with_recurring_signatures || 0)) {
  issues.push('occurrence refs with recurring signatures must match occurrence rows');
}
if (occurrenceIdsWithCrossCluster.size !== Number(artifact.counts?.occurrence_refs_with_cross_cluster_signatures || 0)) {
  issues.push('occurrence refs with cross-cluster signatures must match occurrence rows');
}
for (const check of artifact.checks || []) {
  if (check.status !== 'passed') issues.push(`check ${check.id || '(unknown)'} must pass`);
}
walkNoForbiddenFields(artifact, artifactPath);

if (issues.length) {
  console.error(`Workbench usage context signature lookup validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Validated usage context signature lookup ${artifactPath}: occurrences ${occurrences.length}; memberships ${artifact.counts.signature_memberships}`);

function validateOccurrence(context, occurrence) {
  requireFields(occurrence, [
    'occurrence_id',
    'token_key',
    'focus_surface',
    'focus_normalized',
    'source_ref',
    'source_href',
    'work_anchor_href',
    'work_title',
    'category',
    'status',
    'raw_score',
    'cluster_id',
    'usage_frame_label',
    'version_title',
    'version_source',
    'license',
    'license_url',
    'route_ids',
    'context_focus_marked',
    'counts',
    'signature_memberships',
  ], context);
  if (!allowedStatuses.has(occurrence.status)) issues.push(`${context}: invalid status ${occurrence.status}`);
  if (!String(occurrence.source_href || '').startsWith('http')) issues.push(`${context}: source_href must be an absolute web URL`);
  if (!String(occurrence.work_anchor_href || '').includes('#')) issues.push(`${context}: work_anchor_href must include a local unit anchor`);
  if (!String(occurrence.license_url || '').startsWith('http')) issues.push(`${context}: license_url must be an absolute URL`);
  if (!Array.isArray(occurrence.route_ids)) issues.push(`${context}: route_ids must be an array`);
  if (!String(occurrence.context_focus_marked || '').includes('[') || !String(occurrence.context_focus_marked || '').includes(']')) {
    issues.push(`${context}: context_focus_marked must visibly mark the focus token`);
  }
  const memberships = Array.isArray(occurrence.signature_memberships) ? occurrence.signature_memberships : [];
  if (memberships.length !== Number(occurrence.counts?.signature_memberships || 0)) {
    issues.push(`${context}: signature_memberships length must equal counts.signature_memberships`);
  }
  if (memberships.length <= 0) issues.push(`${context}: signature_memberships must be non-empty`);
  let recurring = 0;
  let crossCluster = 0;
  let relatedListed = 0;
  for (const [membershipIndex, membership] of memberships.entries()) {
    validateMembership(`${context}.signature_memberships[${membershipIndex}]`, membership);
    if (membership.recurring) recurring += 1;
    if (membership.cross_cluster) crossCluster += 1;
    relatedListed += Array.isArray(membership.related_occurrences) ? membership.related_occurrences.length : 0;
  }
  if (recurring !== Number(occurrence.counts?.recurring_signature_memberships || 0)) {
    issues.push(`${context}: recurring memberships must equal count`);
  }
  if (crossCluster !== Number(occurrence.counts?.cross_cluster_signature_memberships || 0)) {
    issues.push(`${context}: cross-cluster memberships must equal count`);
  }
  if (relatedListed !== Number(occurrence.counts?.related_occurrences_listed || 0)) {
    issues.push(`${context}: related occurrence listed count must match`);
  }
}

function validateMembership(context, membership) {
  requireFields(membership, [
    'signature_id',
    'window_radius',
    'signature_key',
    'signature_display',
    'recurring',
    'cross_cluster',
    'counts',
    'route_ids',
    'related_occurrences',
  ], context);
  if (!String(membership.signature_id || '').startsWith('usage-context-signature-')) {
    issues.push(`${context}: signature_id must use usage-context-signature prefix`);
  }
  if (!Number.isInteger(Number(membership.window_radius)) || Number(membership.window_radius) <= 0) {
    issues.push(`${context}: window_radius must be positive`);
  }
  if (!String(membership.signature_key || '').includes('[') || !String(membership.signature_key || '').includes(']')) {
    issues.push(`${context}: signature_key must visibly mark focus`);
  }
  if (!String(membership.signature_display || '').includes('[') || !String(membership.signature_display || '').includes(']')) {
    issues.push(`${context}: signature_display must visibly mark focus`);
  }
  if (typeof membership.recurring !== 'boolean') issues.push(`${context}: recurring must be boolean`);
  if (typeof membership.cross_cluster !== 'boolean') issues.push(`${context}: cross_cluster must be boolean`);
  if (Number(membership.counts?.occurrences || 0) <= 0) issues.push(`${context}: occurrences must be positive`);
  if (!Array.isArray(membership.route_ids)) issues.push(`${context}: route_ids must be an array`);
  if (!Array.isArray(membership.related_occurrences)) issues.push(`${context}: related_occurrences must be an array`);
  for (const [relatedIndex, related] of (membership.related_occurrences || []).entries()) {
    validateRelated(`${context}.related_occurrences[${relatedIndex}]`, related);
  }
}

function validateRelated(context, related) {
  requireFields(related, [
    'occurrence_id',
    'source_ref',
    'source_href',
    'work_anchor_href',
    'work_title',
    'status',
    'cluster_id',
    'usage_frame_label',
    'raw_score',
    'license',
    'license_url',
  ], context);
  if (!allowedStatuses.has(related.status)) issues.push(`${context}: invalid status ${related.status}`);
  if (!String(related.source_href || '').startsWith('http')) issues.push(`${context}: source_href must be an absolute web URL`);
  if (!String(related.work_anchor_href || '').includes('#')) issues.push(`${context}: work_anchor_href must include a local unit anchor`);
  if (!String(related.license_url || '').startsWith('http')) issues.push(`${context}: license_url must be an absolute URL`);
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
