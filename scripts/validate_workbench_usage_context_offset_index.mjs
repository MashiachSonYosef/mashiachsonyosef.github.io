#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/usage-context-offset-index.json');
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
if (artifact.artifact_type !== 'workbench_usage_context_offset_index') {
  issues.push('artifact_type must be workbench_usage_context_offset_index');
}
if (!String(artifact.policy || '').includes('Context-offset index')) issues.push('policy must identify context-offset index');
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
if (Number(artifact.counts?.skipped_rows_without_focus || 0) !== 0) issues.push('skipped_rows_without_focus must be 0');
if (Number(artifact.counts?.rows_with_context || 0) !== Number(artifact.counts?.rows || 0)) {
  issues.push('rows_with_context must equal rows');
}
if (Number(artifact.counts?.rows_with_context_tokens || 0) !== Number(artifact.counts?.rows || 0)) {
  issues.push('rows_with_context_tokens must equal rows');
}

const offsets = Array.isArray(artifact.offsets) ? artifact.offsets : [];
if (!offsets.length) issues.push('offsets must be non-empty');
if (Number(artifact.counts?.offsets || 0) !== offsets.length) issues.push('counts.offsets must equal offsets length');
if (Number(artifact.counts?.token_observations || 0) <= 0) issues.push('token_observations must be positive');
if (Number(artifact.counts?.immediate_neighbor_observations || 0) <= 0) {
  issues.push('immediate_neighbor_observations must be positive');
}

let observationSum = 0;
let tokenBucketSum = 0;
for (const [offsetIndex, offset] of offsets.entries()) {
  validateOffset(`offsets[${offsetIndex}]`, offset);
  observationSum += Number(offset.counts?.observations || 0);
  tokenBucketSum += Number(offset.counts?.unique_tokens || 0);
}

if (observationSum !== Number(artifact.counts?.token_observations || 0)) {
  issues.push('offset observations must sum to token_observations');
}
if (tokenBucketSum !== Number(artifact.counts?.token_buckets || 0)) {
  issues.push('offset unique tokens must sum to token_buckets');
}
for (const check of artifact.checks || []) {
  if (check.status !== 'passed') issues.push(`check ${check.id || '(unknown)'} must pass`);
}
walkNoForbiddenFields(artifact, artifactPath);

if (issues.length) {
  console.error(`Workbench usage context offset index validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Validated usage context offset index ${artifactPath}: offsets ${offsets.length}; observations ${artifact.counts.token_observations}`);

function validateOffset(context, offset) {
  requireFields(offset, ['offset', 'counts', 'tokens'], context);
  const offsetNumber = Number(offset.offset);
  if (!Number.isInteger(offsetNumber) || offsetNumber === 0) issues.push(`${context}: offset must be a non-zero integer`);
  const tokens = Array.isArray(offset.tokens) ? offset.tokens : [];
  if (!tokens.length) issues.push(`${context}: tokens must be non-empty`);
  if (tokens.length !== Number(offset.counts?.unique_tokens || 0)) {
    issues.push(`${context}: tokens length must equal counts.unique_tokens`);
  }
  let tokenObservationSum = 0;
  const statusRows = Number(offset.counts?.status_counts?.supported || 0)
    + Number(offset.counts?.status_counts?.candidate || 0)
    + Number(offset.counts?.status_counts?.weak || 0);
  if (statusRows !== Number(offset.counts?.observations || 0)) {
    issues.push(`${context}: status counts must sum to observations`);
  }
  for (const [tokenIndex, token] of tokens.entries()) {
    validateTokenBucket(`${context}.tokens[${tokenIndex}]`, token, offsetNumber);
    tokenObservationSum += Number(token.counts?.observations || 0);
  }
  if (tokenObservationSum !== Number(offset.counts?.observations || 0)) {
    issues.push(`${context}: token observations must sum to offset observations`);
  }
}

function validateTokenBucket(context, token, expectedOffset) {
  requireFields(token, [
    'offset',
    'token_normalized',
    'token_surfaces',
    'counts',
    'works',
    'categories',
    'route_ids',
    'occurrence_ids',
    'samples',
  ], context);
  if (Number(token.offset) !== expectedOffset) issues.push(`${context}: offset must match parent`);
  const observations = Number(token.counts?.observations || 0);
  if (!Number.isInteger(observations) || observations <= 0) issues.push(`${context}: observations must be positive`);
  const statusRows = Number(token.counts?.status_counts?.supported || 0)
    + Number(token.counts?.status_counts?.candidate || 0)
    + Number(token.counts?.status_counts?.weak || 0);
  if (statusRows !== observations) issues.push(`${context}: status counts must sum to observations`);
  for (const status of Object.keys(token.counts?.status_counts || {})) {
    if (!allowedStatuses.has(status)) issues.push(`${context}: invalid status key ${status}`);
  }
  if (!Array.isArray(token.token_surfaces) || !token.token_surfaces.length) issues.push(`${context}: token_surfaces must be non-empty`);
  if (!Array.isArray(token.works) || token.works.length !== Number(token.counts?.works || 0)) {
    issues.push(`${context}: works length must equal counts.works`);
  }
  if (!Array.isArray(token.categories) || token.categories.length !== Number(token.counts?.categories || 0)) {
    issues.push(`${context}: categories length must equal counts.categories`);
  }
  if (!Array.isArray(token.route_ids)) issues.push(`${context}: route_ids must be an array`);
  if (!Array.isArray(token.occurrence_ids) || token.occurrence_ids.length !== observations) {
    issues.push(`${context}: occurrence_ids length must equal observations`);
  }
  if (!Array.isArray(token.samples) || !token.samples.length) issues.push(`${context}: samples must be non-empty`);
  for (const [sampleIndex, sample] of (token.samples || []).entries()) validateSample(`${context}.samples[${sampleIndex}]`, sample);
}

function validateSample(context, sample) {
  requireFields(sample, [
    'occurrence_id',
    'source_ref',
    'source_href',
    'work_anchor_href',
    'work_title',
    'category',
    'status',
    'raw_score',
    'cluster_id',
    'license',
    'license_url',
    'context_focus_marked',
  ], context);
  if (!allowedStatuses.has(sample.status)) issues.push(`${context}: invalid status ${sample.status}`);
  if (!String(sample.source_href || '').startsWith('http')) issues.push(`${context}: source_href must be an absolute web URL`);
  if (!String(sample.work_anchor_href || '').includes('#')) issues.push(`${context}: work_anchor_href must include a local unit anchor`);
  if (!String(sample.license_url || '').startsWith('http')) issues.push(`${context}: license_url must be an absolute URL`);
  if (!String(sample.context_focus_marked || '').includes('[') || !String(sample.context_focus_marked || '').includes(']')) {
    issues.push(`${context}: context_focus_marked must visibly mark the focus token`);
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

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}
