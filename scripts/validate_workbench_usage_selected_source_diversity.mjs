#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/usage-selected-source-diversity.json');
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
if (artifact.artifact_type !== 'workbench_usage_selected_source_diversity') {
  issues.push('artifact_type must be workbench_usage_selected_source_diversity');
}
if (!String(artifact.policy || '').includes('Selected-occurrence source diversity audit')) {
  issues.push('policy must identify selected-occurrence source diversity audit');
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
if (Number(artifact.counts?.reader_facing_rows || 0) !== 0) issues.push('reader_facing_rows must be 0');
if (Number(artifact.counts?.route_payload_field_hits || 0) !== 0) issues.push('route_payload_field_hits must be 0');

const rows = Array.isArray(artifact.rows) ? artifact.rows : [];
if (!rows.length) issues.push('rows must be non-empty');
if (Number(artifact.counts?.selected_occurrence_refs || 0) !== rows.length) {
  issues.push('selected_occurrence_refs must equal rows length');
}

validateBuckets();
validateRows();
for (const check of artifact.checks || []) {
  if (check.status === 'failed') issues.push(`check ${check.id || '(unknown)'} must not fail`);
}
walkNoForbiddenFields(artifact, artifactPath);

if (issues.length) {
  console.error(`Workbench usage selected source diversity validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Validated usage selected source diversity ${artifactPath}: rows ${rows.length}; source refs ${artifact.counts.unique_source_refs}; works ${artifact.counts.unique_works}`);

function validateBuckets() {
  const bucketSpecs = [
    ['source_refs', 'unique_source_refs'],
    ['work_anchors', 'unique_work_anchors'],
    ['works', 'unique_works'],
    ['categories', 'unique_categories'],
    ['licenses', 'unique_licenses'],
    ['version_sources', 'unique_version_sources'],
    ['route_ids', 'route_id_buckets'],
  ];
  for (const [bucketField, countField] of bucketSpecs) {
    const buckets = Array.isArray(artifact.buckets?.[bucketField]) ? artifact.buckets[bucketField] : [];
    if (!buckets.length) issues.push(`buckets.${bucketField} must be non-empty`);
    if (buckets.length !== Number(artifact.counts?.[countField] || 0)) {
      issues.push(`counts.${countField} must equal buckets.${bucketField}.length`);
    }
    const rowSum = buckets.reduce((sum, bucket) => sum + Number(bucket.counts?.rows || 0), 0);
    if (rowSum !== rows.length) issues.push(`buckets.${bucketField} rows must sum to selected rows`);
    for (const [bucketIndex, bucket] of buckets.entries()) validateBucket(`buckets.${bucketField}[${bucketIndex}]`, bucket);
  }

  const duplicateSourceBuckets = artifact.buckets.source_refs.filter((bucket) => bucket.counts.rows > 1);
  const duplicateWorkAnchorBuckets = artifact.buckets.work_anchors.filter((bucket) => bucket.counts.rows > 1);
  if (duplicateSourceBuckets.length !== Number(artifact.counts?.duplicate_source_ref_buckets || 0)) {
    issues.push('duplicate_source_ref_buckets must match source_ref buckets with rows > 1');
  }
  if (duplicateWorkAnchorBuckets.length !== Number(artifact.counts?.duplicate_work_anchor_buckets || 0)) {
    issues.push('duplicate_work_anchor_buckets must match work_anchor buckets with rows > 1');
  }
}

function validateBucket(context, bucket) {
  requireFields(bucket, ['key', 'label', 'counts', 'route_ids', 'samples'], context);
  const rowCount = Number(bucket.counts?.rows || 0);
  if (!Number.isInteger(rowCount) || rowCount <= 0) issues.push(`${context}: rows must be positive`);
  const statusRows = Number(bucket.counts?.status_counts?.supported || 0)
    + Number(bucket.counts?.status_counts?.candidate || 0)
    + Number(bucket.counts?.status_counts?.weak || 0);
  if (statusRows !== rowCount) issues.push(`${context}: status counts must sum to rows`);
  if (!Array.isArray(bucket.route_ids)) issues.push(`${context}: route_ids must be an array`);
  const samples = Array.isArray(bucket.samples) ? bucket.samples : [];
  if (!samples.length) issues.push(`${context}: samples must be non-empty`);
  for (const [sampleIndex, sample] of samples.entries()) validateSample(`${context}.samples[${sampleIndex}]`, sample);
}

function validateRows() {
  let duplicateSourceRows = 0;
  let duplicateAnchorRows = 0;
  let signatureRows = 0;
  let recurringRows = 0;
  let crossClusterRows = 0;
  for (const [rowIndex, row] of rows.entries()) {
    validateRow(`rows[${rowIndex}]`, row);
    if (row.source_diversity_flags?.duplicate_source_ref) duplicateSourceRows += 1;
    if (row.source_diversity_flags?.duplicate_work_anchor) duplicateAnchorRows += 1;
    if (row.signature_independence) signatureRows += 1;
    if (row.signature_independence?.has_recurring_signature) recurringRows += 1;
    if (row.signature_independence?.has_cross_cluster_signature) crossClusterRows += 1;
  }
  if (duplicateSourceRows !== Number(artifact.counts?.duplicate_source_ref_rows || 0)) {
    issues.push('duplicate_source_ref_rows must match row flags');
  }
  if (duplicateAnchorRows !== Number(artifact.counts?.duplicate_work_anchor_rows || 0)) {
    issues.push('duplicate_work_anchor_rows must match row flags');
  }
  if (signatureRows !== Number(artifact.counts?.rows_with_signature_independence || 0)) {
    issues.push('rows_with_signature_independence must match rows with joined signature data');
  }
  if (recurringRows !== Number(artifact.counts?.rows_with_recurring_signatures || 0)) {
    issues.push('rows_with_recurring_signatures must match row flags');
  }
  if (crossClusterRows !== Number(artifact.counts?.rows_with_cross_cluster_signatures || 0)) {
    issues.push('rows_with_cross_cluster_signatures must match row flags');
  }
  if (Number(artifact.counts?.missing_signature_independence_rows || 0) !== rows.length - signatureRows) {
    issues.push('missing_signature_independence_rows must equal rows without joined signature data');
  }
}

function validateRow(context, row) {
  requireFields(row, [
    'occurrence_id',
    'token_key',
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
    'version_title',
    'version_source',
    'license',
    'license_url',
    'route_ids',
    'slice_ids',
    'context_focus_marked',
    'signature_independence',
    'source_diversity_flags',
    'counts',
  ], context);
  if (!allowedStatuses.has(row.status)) issues.push(`${context}: invalid status ${row.status}`);
  if (!String(row.source_href || '').startsWith('http')) issues.push(`${context}: source_href must be an absolute web URL`);
  if (!String(row.work_anchor_href || '').includes('#')) issues.push(`${context}: work_anchor_href must include a local unit anchor`);
  if (!String(row.version_source || '').startsWith('http')) issues.push(`${context}: version_source must be an absolute URL`);
  if (!String(row.license_url || '').startsWith('http')) issues.push(`${context}: license_url must be an absolute URL`);
  if (!Array.isArray(row.route_ids)) issues.push(`${context}: route_ids must be an array`);
  if (!Array.isArray(row.slice_ids)) issues.push(`${context}: slice_ids must be an array`);
  if (!String(row.context_focus_marked || '').includes('[') || !String(row.context_focus_marked || '').includes(']')) {
    issues.push(`${context}: context_focus_marked must visibly mark the focus token`);
  }
  if (row.source_diversity_flags?.observed_usage_only !== true) issues.push(`${context}: observed_usage_only must be true`);
  if (row.source_diversity_flags?.reader_facing !== false) issues.push(`${context}: reader_facing must be false`);
  if (Number(row.counts?.source_ref_bucket_rows || 0) <= 0) issues.push(`${context}: source_ref_bucket_rows must be positive`);
  if (Number(row.counts?.work_anchor_bucket_rows || 0) <= 0) issues.push(`${context}: work_anchor_bucket_rows must be positive`);
}

function validateSample(context, sample) {
  requireFields(sample, [
    'occurrence_id',
    'source_ref',
    'source_href',
    'work_anchor_href',
    'work_title',
    'status',
    'raw_score',
    'cluster_id',
    'usage_frame_label',
    'license',
    'license_url',
  ], context);
  if (!allowedStatuses.has(sample.status)) issues.push(`${context}: invalid status ${sample.status}`);
  if (!String(sample.source_href || '').startsWith('http')) issues.push(`${context}: source_href must be an absolute web URL`);
  if (!String(sample.work_anchor_href || '').includes('#')) issues.push(`${context}: work_anchor_href must include a local unit anchor`);
  if (!String(sample.license_url || '').startsWith('http')) issues.push(`${context}: license_url must be an absolute URL`);
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
