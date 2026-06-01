#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/usage-selected-occurrence-cards.json');
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
if (artifact.artifact_type !== 'workbench_usage_selected_occurrence_cards') {
  issues.push('artifact_type must be workbench_usage_selected_occurrence_cards');
}
if (!String(artifact.policy || '').includes('Audit-only selected occurrence inspection cards')) {
  issues.push('policy must identify audit-only selected occurrence cards');
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
if (!['passed', 'pass_with_warnings'].includes(String(artifact.quality?.status || ''))) {
  issues.push('quality.status must be passed or pass_with_warnings');
}
if (Number(artifact.quality?.failed_count || 0) !== 0) issues.push('quality.failed_count must be 0');
if (Number(artifact.quality?.warning_count || 0) <= 0) {
  issues.push('warning_count should preserve the route concentration warning');
}

const cards = Array.isArray(artifact.cards) ? artifact.cards : [];
if (!cards.length) issues.push('cards must be non-empty');
validateCounts(cards);
for (const [index, card] of cards.entries()) validateCard(`cards[${index}]`, card);
for (const check of artifact.checks || []) {
  if (check.status === 'failed') issues.push(`check ${check.id || '(unknown)'} must not fail`);
}
const warningChecks = (artifact.checks || []).filter((check) => check.status === 'warning');
if (!warningChecks.some((check) => check.id === 'route_concentration_warning_visible')) {
  issues.push('route_concentration_warning_visible check must remain warning');
}
walkNoForbiddenFields(artifact, artifactPath);

if (issues.length) {
  console.error(`Workbench usage selected occurrence cards validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Validated usage selected occurrence cards ${artifactPath}: cards ${cards.length}; context ${artifact.counts.cards_with_context}`);

function validateCounts(rows) {
  if (Number(artifact.counts?.cards || 0) !== rows.length) issues.push('counts.cards must equal cards length');
  if (Number(artifact.counts?.selected_occurrence_refs || 0) !== rows.length) {
    issues.push('selected_occurrence_refs must equal cards length');
  }
  if (Number(artifact.counts?.cards_with_context || 0) !== rows.length) issues.push('cards_with_context must equal cards length');
  if (Number(artifact.counts?.cards_with_focus_marker || 0) !== rows.length) {
    issues.push('cards_with_focus_marker must equal cards length');
  }
  if (Number(artifact.counts?.cards_with_route_ids || 0) !== rows.length) issues.push('cards_with_route_ids must equal cards length');
  if (Number(artifact.counts?.route_concentration_warning_visible || 0) !== 1) {
    issues.push('route_concentration_warning_visible must be 1');
  }
  if (Number(artifact.counts?.route_concentration_warning_rows || 0) !== rows.length) {
    issues.push('route_concentration_warning_rows must equal cards length');
  }
  if (Number(artifact.counts?.hebrew_focus_rows || 0) !== rows.length) issues.push('hebrew_focus_rows must equal cards length');
  if (Number(artifact.counts?.hebrew_context_rows || 0) !== rows.length) issues.push('hebrew_context_rows must equal cards length');
  if (Number(artifact.counts?.mojibake_token_or_context_rows || 0) !== 0) {
    issues.push('mojibake_token_or_context_rows must be 0');
  }
  if (Number(artifact.counts?.reader_facing_rows || 0) !== 0) issues.push('reader_facing_rows must be 0');
  if (Number(artifact.counts?.route_payload_field_hits || 0) !== 0) {
    issues.push('route_payload_field_hits must be 0');
  }

  const statusCounts = { supported: 0, candidate: 0, weak: 0 };
  let duplicateSourceRows = 0;
  let duplicateAnchorRows = 0;
  let recurringRows = 0;
  let crossClusterRows = 0;
  let relatedSignatureRows = 0;
  let signatureSamples = 0;
  let relatedSamples = 0;
  for (const card of rows) {
    if (Object.hasOwn(statusCounts, card.status)) statusCounts[card.status] += 1;
    if (card.source_diversity_flags?.duplicate_source_ref) duplicateSourceRows += 1;
    if (card.source_diversity_flags?.duplicate_work_anchor) duplicateAnchorRows += 1;
    if (card.signature_independence_flags?.has_recurring_signature) recurringRows += 1;
    if (card.signature_independence_flags?.has_cross_cluster_signature) crossClusterRows += 1;
    if ((card.signature_samples || []).length) relatedSignatureRows += 1;
    signatureSamples += (card.signature_samples || []).length;
    relatedSamples += Number(card.signature_summary?.related_occurrences_listed || 0);
  }
  for (const [status, count] of Object.entries(statusCounts)) {
    if (Number(artifact.counts?.status_counts?.[status] || 0) !== count) issues.push(`status count mismatch for ${status}`);
  }
  if (Number(artifact.counts?.duplicate_source_ref_rows || 0) !== duplicateSourceRows) {
    issues.push('duplicate_source_ref_rows must match card flags');
  }
  if (Number(artifact.counts?.duplicate_work_anchor_rows || 0) !== duplicateAnchorRows) {
    issues.push('duplicate_work_anchor_rows must match card flags');
  }
  if (Number(artifact.counts?.cards_with_recurring_signatures || 0) !== recurringRows) {
    issues.push('cards_with_recurring_signatures must match card flags');
  }
  if (Number(artifact.counts?.cards_with_cross_cluster_signatures || 0) !== crossClusterRows) {
    issues.push('cards_with_cross_cluster_signatures must match card flags');
  }
  if (Number(artifact.counts?.cards_with_related_signatures || 0) !== relatedSignatureRows) {
    issues.push('cards_with_related_signatures must match signature_samples presence');
  }
  if (Number(artifact.counts?.signature_samples || 0) !== signatureSamples) {
    issues.push('signature_samples count must match cards');
  }
  if (Number(artifact.counts?.related_occurrence_samples || 0) !== relatedSamples) {
    issues.push('related_occurrence_samples count must match signature summaries');
  }
}

function validateCard(context, card) {
  requireFields(card, [
    'occurrence_id',
    'candidate_id',
    'token_key',
    'token_surface',
    'token_normalized',
    'focus_surface',
    'focus_normalized',
    'source_ref',
    'source_href',
    'work_anchor_href',
    'work_title',
    'work_slug',
    'category',
    'unit_id',
    'status',
    'raw_score',
    'cluster_id',
    'usage_frame_label',
    'phrase_context_hebrew',
    'context_focus_marked',
    'version_title',
    'version_source',
    'license',
    'license_url',
    'route_ids',
    'slice_ids',
    'source_diversity_flags',
    'signature_independence_flags',
    'route_concentration_flags',
    'card_flags',
    'signature_summary',
    'signature_samples',
  ], context);
  if (!allowedStatuses.has(card.status)) issues.push(`${context}: invalid status ${card.status}`);
  if (!String(card.source_href || '').startsWith('http')) issues.push(`${context}: source_href must be absolute web URL`);
  if (!String(card.work_anchor_href || '').includes('#')) issues.push(`${context}: work_anchor_href must include an anchor`);
  if (!String(card.version_source || '').startsWith('http')) issues.push(`${context}: version_source must be absolute URL`);
  if (!String(card.license_url || '').startsWith('http')) issues.push(`${context}: license_url must be absolute URL`);
  if (!Array.isArray(card.route_ids) || !card.route_ids.length) issues.push(`${context}: route_ids must be non-empty array`);
  if (!Array.isArray(card.slice_ids) || !card.slice_ids.length) issues.push(`${context}: slice_ids must be non-empty array`);
  if (!Array.isArray(card.signature_samples)) issues.push(`${context}: signature_samples must be an array`);
  if (card.phrase_context_hebrew !== card.context_focus_marked) {
    issues.push(`${context}: phrase_context_hebrew must equal context_focus_marked`);
  }
  if (card.context_has_focus_marker !== true) issues.push(`${context}: context_has_focus_marker must be true`);
  if (!String(card.context_focus_marked || '').includes('[') || !String(card.context_focus_marked || '').includes(']')) {
    issues.push(`${context}: context_focus_marked must include bracketed focus marker`);
  }
  if (!hasHebrew(card.focus_normalized)) issues.push(`${context}: focus_normalized must include Hebrew`);
  if (!hasHebrew(card.context_focus_marked)) issues.push(`${context}: context_focus_marked must include Hebrew`);
  if (hasMojibake(`${card.token_key} ${card.token_surface} ${card.token_normalized} ${card.focus_surface} ${card.focus_normalized} ${card.context_focus_marked}`)) {
    issues.push(`${context}: token/context fields contain mojibake-like characters`);
  }
  if (card.card_flags?.observed_usage_only !== true) issues.push(`${context}: card_flags.observed_usage_only must be true`);
  if (card.card_flags?.reader_facing !== false) issues.push(`${context}: card_flags.reader_facing must be false`);
  if (card.card_flags?.audit_only !== true) issues.push(`${context}: card_flags.audit_only must be true`);
  if (card.card_flags?.has_hebrew_focus !== true) issues.push(`${context}: card_flags.has_hebrew_focus must be true`);
  if (card.card_flags?.has_hebrew_context !== true) issues.push(`${context}: card_flags.has_hebrew_context must be true`);
  if (card.card_flags?.has_mojibake_in_token_or_context !== false) {
    issues.push(`${context}: card_flags.has_mojibake_in_token_or_context must be false`);
  }
  if (card.source_diversity_flags?.observed_usage_only !== true) issues.push(`${context}: source_diversity_flags.observed_usage_only must be true`);
  if (card.source_diversity_flags?.reader_facing !== false) issues.push(`${context}: source_diversity_flags.reader_facing must be false`);
  if (card.signature_independence_flags?.observed_usage_only !== true) {
    issues.push(`${context}: signature_independence_flags.observed_usage_only must be true`);
  }
  if (card.signature_independence_flags?.reader_facing !== false) {
    issues.push(`${context}: signature_independence_flags.reader_facing must be false`);
  }
  if (card.route_concentration_flags?.route_concentration_warning_visible !== true) {
    issues.push(`${context}: route concentration warning must be visible`);
  }
  if (card.route_concentration_flags?.observed_usage_only !== true) {
    issues.push(`${context}: route_concentration_flags.observed_usage_only must be true`);
  }
  if (card.route_concentration_flags?.reader_facing !== false) {
    issues.push(`${context}: route_concentration_flags.reader_facing must be false`);
  }
  for (const [sampleIndex, sample] of (card.signature_samples || []).entries()) {
    validateSignatureSample(`${context}.signature_samples[${sampleIndex}]`, sample);
  }
}

function validateSignatureSample(context, sample) {
  requireFields(sample, ['signature_kind', 'signature_display', 'occurrences', 'clusters', 'route_ids', 'related_occurrences'], context);
  if (!['recurring', 'cross_cluster'].includes(sample.signature_kind)) {
    issues.push(`${context}: invalid signature_kind ${sample.signature_kind}`);
  }
  if (!Array.isArray(sample.route_ids)) issues.push(`${context}: route_ids must be an array`);
  if (!Array.isArray(sample.related_occurrences)) issues.push(`${context}: related_occurrences must be an array`);
  for (const [relatedIndex, related] of (sample.related_occurrences || []).entries()) {
    requireFields(related, ['occurrence_id', 'source_ref', 'source_href', 'work_anchor_href', 'status', 'raw_score', 'cluster_id', 'usage_frame_label', 'license', 'license_url'], `${context}.related_occurrences[${relatedIndex}]`);
    if (!String(related.source_href || '').startsWith('http')) {
      issues.push(`${context}.related_occurrences[${relatedIndex}]: source_href must be absolute URL`);
    }
    if (!String(related.work_anchor_href || '').includes('#')) {
      issues.push(`${context}.related_occurrences[${relatedIndex}]: work_anchor_href must include an anchor`);
    }
    if (!allowedStatuses.has(related.status)) {
      issues.push(`${context}.related_occurrences[${relatedIndex}]: invalid status ${related.status}`);
    }
  }
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

function hasHebrew(value) {
  return /[\u0590-\u05ff]/.test(String(value || ''));
}

function hasMojibake(value) {
  return /[\u00d7\u00d6\ufffd]/.test(String(value || ''));
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}
