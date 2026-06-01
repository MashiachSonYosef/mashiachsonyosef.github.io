#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/usage-provenance-index.json');
const artifact = JSON.parse(fs.readFileSync(path.join(root, artifactPath), 'utf8'));
const issues = [];
const forbiddenLicenseRe = /\bNC\b|Non-?Commercial|all rights reserved|copyright unclear|unknown|unverified|permission only/i;
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
if (artifact.artifact_type !== 'workbench_usage_provenance_index') {
  issues.push('artifact_type must be workbench_usage_provenance_index');
}
if (!String(artifact.policy || '').includes('Provenance index')) issues.push('policy must identify provenance index');
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
if (Number(artifact.counts?.unsafe_license_rows || 0) !== 0) issues.push('unsafe_license_rows must be 0');

const licenses = Array.isArray(artifact.licenses) ? artifact.licenses : [];
const versionSources = Array.isArray(artifact.version_sources) ? artifact.version_sources : [];
if (!licenses.length) issues.push('licenses must be non-empty');
if (!versionSources.length) issues.push('version_sources must be non-empty');
if (Number(artifact.counts?.licenses || 0) !== licenses.length) issues.push('counts.licenses must equal licenses length');
if (Number(artifact.counts?.version_sources || 0) !== versionSources.length) {
  issues.push('counts.version_sources must equal version_sources length');
}

let licenseRows = 0;
for (const [index, bucket] of licenses.entries()) {
  validateBucket(`licenses[${index}]`, bucket, ['bucket_key', 'license', 'license_url', 'counts', 'works', 'categories', 'route_ids', 'samples']);
  licenseRows += Number(bucket.counts?.rows || 0);
  if (!String(bucket.license_url || '').startsWith('http')) issues.push(`licenses[${index}]: license_url must be an absolute URL`);
  if (forbiddenLicenseRe.test(String(bucket.license || ''))) issues.push(`licenses[${index}]: unsafe license ${bucket.license}`);
}

let versionRows = 0;
for (const [index, bucket] of versionSources.entries()) {
  validateBucket(`version_sources[${index}]`, bucket, [
    'bucket_key',
    'version_title',
    'version_source',
    'license',
    'license_url',
    'counts',
    'works',
    'categories',
    'route_ids',
    'samples',
  ]);
  versionRows += Number(bucket.counts?.rows || 0);
  if (!String(bucket.version_source || '').startsWith('http')) {
    issues.push(`version_sources[${index}]: version_source must be an absolute URL`);
  }
  if (!String(bucket.license_url || '').startsWith('http')) issues.push(`version_sources[${index}]: license_url must be an absolute URL`);
  if (forbiddenLicenseRe.test(String(bucket.license || ''))) issues.push(`version_sources[${index}]: unsafe license ${bucket.license}`);
}

if (licenseRows !== Number(artifact.counts?.rows || 0)) issues.push('license rows must sum to counts.rows');
if (versionRows !== Number(artifact.counts?.rows || 0)) issues.push('version source rows must sum to counts.rows');
if (Number(artifact.counts?.rows_with_license_metadata || 0) !== Number(artifact.counts?.rows || 0)) {
  issues.push('rows_with_license_metadata must equal counts.rows');
}
if (Number(artifact.counts?.rows_with_source_links || 0) !== Number(artifact.counts?.rows || 0)) {
  issues.push('rows_with_source_links must equal counts.rows');
}
if (Number(artifact.counts?.rows_with_version_metadata || 0) !== Number(artifact.counts?.rows || 0)) {
  issues.push('rows_with_version_metadata must equal counts.rows');
}
for (const check of artifact.checks || []) {
  if (check.status !== 'passed') issues.push(`check ${check.id || '(unknown)'} must pass`);
}
walkNoForbiddenFields(artifact, artifactPath);

if (issues.length) {
  console.error(`Workbench usage provenance index validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Validated usage provenance index ${artifactPath}: licenses ${licenses.length}; version sources ${versionSources.length}; rows ${artifact.counts.rows}`);

function validateBucket(context, bucket, fields) {
  requireFields(bucket, fields, context);
  const rows = Number(bucket.counts?.rows || 0);
  if (!Number.isInteger(rows) || rows <= 0) issues.push(`${context}: counts.rows must be positive`);
  const statusRows = Number(bucket.counts?.status_counts?.supported || 0)
    + Number(bucket.counts?.status_counts?.candidate || 0)
    + Number(bucket.counts?.status_counts?.weak || 0);
  if (statusRows !== rows) issues.push(`${context}: status counts must sum to rows`);
  for (const status of Object.keys(bucket.counts?.status_counts || {})) {
    if (!allowedStatuses.has(status)) issues.push(`${context}: invalid status key ${status}`);
  }
  if (!Array.isArray(bucket.works) || bucket.works.length !== Number(bucket.counts?.works || 0)) {
    issues.push(`${context}: works length must equal counts.works`);
  }
  if (!Array.isArray(bucket.categories) || bucket.categories.length !== Number(bucket.counts?.categories || 0)) {
    issues.push(`${context}: categories length must equal counts.categories`);
  }
  if (!Array.isArray(bucket.route_ids)) issues.push(`${context}: route_ids must be an array`);
  if (!Array.isArray(bucket.samples) || !bucket.samples.length) issues.push(`${context}: samples must be non-empty`);
  for (const [sampleIndex, sample] of (bucket.samples || []).entries()) validateSample(`${context}.samples[${sampleIndex}]`, sample);
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
    'version_title',
    'version_source',
    'license',
    'license_url',
  ], context);
  if (!allowedStatuses.has(sample.status)) issues.push(`${context}: invalid status ${sample.status}`);
  if (!String(sample.source_href || '').startsWith('http')) issues.push(`${context}: source_href must be an absolute web URL`);
  if (!String(sample.work_anchor_href || '').includes('#')) issues.push(`${context}: work_anchor_href must include a local unit anchor`);
  if (!String(sample.version_source || '').startsWith('http')) issues.push(`${context}: version_source must be an absolute URL`);
  if (!String(sample.license_url || '').startsWith('http')) issues.push(`${context}: license_url must be an absolute URL`);
  if (forbiddenLicenseRe.test(String(sample.license || ''))) issues.push(`${context}: unsafe license ${sample.license}`);
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
