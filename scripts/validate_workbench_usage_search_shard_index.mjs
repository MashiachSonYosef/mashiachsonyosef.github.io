#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/usage-search-shard-index.json');
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
if (artifact.artifact_type !== 'workbench_usage_navigation_search_shard_index') {
  issues.push('artifact_type must be workbench_usage_navigation_search_shard_index');
}
if (!String(artifact.policy || '').includes('Shard index')) issues.push('policy must identify shard index');
if (artifact.authority_policy?.usage_navigation_only !== true) issues.push('authority_policy.usage_navigation_only must be true');
if (artifact.authority_policy?.ranks_routes !== false) issues.push('authority_policy.ranks_routes must be false');
if (artifact.authority_policy?.selects_visible_result !== false) issues.push('authority_policy.selects_visible_result must be false');
if (artifact.authority_policy?.ambiguous_rows_reader_facing !== false) {
  issues.push('authority_policy.ambiguous_rows_reader_facing must be false');
}
if (artifact.authority_policy?.route_payloads_copied !== false) {
  issues.push('authority_policy.route_payloads_copied must be false');
}
if (artifact.quality?.status !== 'passed') issues.push('quality.status must be passed');
if (Number(artifact.quality?.failed_count || 0) !== 0) issues.push('quality.failed_count must be 0');
if (Number(artifact.counts?.route_payload_field_hits || 0) !== 0) issues.push('route_payload_field_hits must be 0');

const shards = Array.isArray(artifact.shards) ? artifact.shards : [];
if (!shards.length) issues.push('shards must be non-empty');
if (Number(artifact.counts?.shards || 0) !== shards.length) issues.push('counts.shards must equal shards length');

let rowSum = 0;
const categories = new Set();
const clusters = new Set();
const statuses = new Set();
for (const [index, shard] of shards.entries()) {
  const context = `shards[${index}]`;
  requireFields(shard, [
    'shard_id',
    'category',
    'cluster_id',
    'usage_frame_label',
    'status',
    'counts',
    'route_ids',
    'occurrence_ids',
    'samples',
  ], context);
  if (!allowedStatuses.has(shard.status)) issues.push(`${context}: invalid status ${shard.status}`);
  if (!Number.isInteger(Number(shard.counts?.rows)) || Number(shard.counts.rows) <= 0) {
    issues.push(`${context}: counts.rows must be positive`);
  }
  if (!Number.isInteger(Number(shard.counts?.works)) || Number(shard.counts.works) <= 0) {
    issues.push(`${context}: counts.works must be positive`);
  }
  if (!Array.isArray(shard.route_ids)) issues.push(`${context}: route_ids must be an array`);
  if (!Array.isArray(shard.occurrence_ids) || !shard.occurrence_ids.length) {
    issues.push(`${context}: occurrence_ids must be non-empty`);
  }
  if (Array.isArray(shard.occurrence_ids) && shard.occurrence_ids.length !== Number(shard.counts?.rows || 0)) {
    issues.push(`${context}: occurrence_ids length must equal counts.rows`);
  }
  if (!Array.isArray(shard.samples) || !shard.samples.length) issues.push(`${context}: samples must be non-empty`);
  for (const [sampleIndex, sample] of (shard.samples || []).entries()) {
    validateSample(`${context}.samples[${sampleIndex}]`, sample);
  }
  rowSum += Number(shard.counts?.rows || 0);
  categories.add(shard.category);
  clusters.add(shard.cluster_id);
  statuses.add(shard.status);
}

if (rowSum !== Number(artifact.counts?.rows || 0)) issues.push('shard rows must sum to counts.rows');
if (categories.size !== Number(artifact.counts?.categories || 0)) issues.push('category count mismatch');
if (clusters.size !== Number(artifact.counts?.clusters || 0)) issues.push('cluster count mismatch');
if (statuses.size !== Number(artifact.counts?.statuses || 0)) issues.push('status count mismatch');
for (const check of artifact.checks || []) {
  if (check.status !== 'passed') issues.push(`check ${check.id || '(unknown)'} must pass`);
}
walkNoForbiddenFields(artifact, artifactPath);

if (issues.length) {
  console.error(`Workbench usage search shard index validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Validated usage search shard index ${artifactPath}: shards ${shards.length}; rows ${artifact.counts.rows}`);

function validateSample(context, sample) {
  requireFields(sample, [
    'occurrence_id',
    'source_ref',
    'source_href',
    'work_anchor_href',
    'raw_score',
    'license',
    'license_url',
    'context_focus_marked',
  ], context);
  if (!String(sample.source_href || '').startsWith('http')) issues.push(`${context}: source_href must be an absolute web URL`);
  if (!String(sample.work_anchor_href || '').includes('#')) issues.push(`${context}: work_anchor_href must include a local unit anchor`);
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
