#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/usage-unit-density-index.json');
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
if (artifact.artifact_type !== 'workbench_usage_navigation_unit_density_index') {
  issues.push('artifact_type must be workbench_usage_navigation_unit_density_index');
}
if (!String(artifact.policy || '').includes('Unit-density index')) issues.push('policy must identify unit-density index');
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

const units = Array.isArray(artifact.units) ? artifact.units : [];
if (!units.length) issues.push('units must be non-empty');
if (Number(artifact.counts?.units || 0) !== units.length) issues.push('counts.units must equal units length');

let rowSum = 0;
let occurrenceIdSum = 0;
let multiUnits = 0;
let maxRows = 0;
const works = new Set();
for (const [index, unit] of units.entries()) {
  const context = `units[${index}]`;
  requireFields(unit, [
    'unit_key',
    'source_ref',
    'source_href',
    'work_anchor_href',
    'work_id',
    'work_title',
    'work_slug',
    'category',
    'unit_id',
    'counts',
    'route_ids',
    'occurrence_ids',
    'samples',
  ], context);
  const rows = Number(unit.counts?.rows || 0);
  if (!Number.isInteger(rows) || rows <= 0) issues.push(`${context}: counts.rows must be positive`);
  if (!String(unit.source_href || '').startsWith('http')) issues.push(`${context}: source_href must be an absolute web URL`);
  if (!String(unit.work_anchor_href || '').includes('#')) issues.push(`${context}: work_anchor_href must include a local unit anchor`);
  if (!Array.isArray(unit.route_ids)) issues.push(`${context}: route_ids must be an array`);
  if (!Array.isArray(unit.occurrence_ids) || unit.occurrence_ids.length !== rows) {
    issues.push(`${context}: occurrence_ids length must equal counts.rows`);
  }
  if (!Array.isArray(unit.samples) || !unit.samples.length) issues.push(`${context}: samples must be non-empty`);
  const statusRows = Number(unit.counts?.status_counts?.supported || 0)
    + Number(unit.counts?.status_counts?.candidate || 0)
    + Number(unit.counts?.status_counts?.weak || 0);
  if (statusRows !== rows) issues.push(`${context}: status counts must sum to rows`);
  for (const [sampleIndex, sample] of (unit.samples || []).entries()) validateSample(`${context}.samples[${sampleIndex}]`, sample);
  rowSum += rows;
  occurrenceIdSum += Array.isArray(unit.occurrence_ids) ? unit.occurrence_ids.length : 0;
  if (rows > 1) multiUnits += 1;
  maxRows = Math.max(maxRows, rows);
  if (unit.work_slug) works.add(unit.work_slug);
}

if (rowSum !== Number(artifact.counts?.rows || 0)) issues.push('unit rows must sum to counts.rows');
if (occurrenceIdSum !== Number(artifact.counts?.rows || 0)) issues.push('occurrence IDs must sum to counts.rows');
if (multiUnits !== Number(artifact.counts?.multi_occurrence_units || 0)) issues.push('multi_occurrence_units count mismatch');
if (maxRows !== Number(artifact.counts?.max_occurrences_per_unit || 0)) issues.push('max_occurrences_per_unit mismatch');
if (works.size !== Number(artifact.counts?.works || 0)) issues.push('works count mismatch');
for (const check of artifact.checks || []) {
  if (check.status !== 'passed') issues.push(`check ${check.id || '(unknown)'} must pass`);
}
walkNoForbiddenFields(artifact, artifactPath);

if (issues.length) {
  console.error(`Workbench usage unit density index validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Validated usage unit density index ${artifactPath}: units ${units.length}; rows ${artifact.counts.rows}`);

function validateSample(context, sample) {
  requireFields(sample, [
    'occurrence_id',
    'status',
    'raw_score',
    'cluster_id',
    'source_ref',
    'source_href',
    'work_anchor_href',
    'license',
    'license_url',
    'context_focus_marked',
  ], context);
  if (!allowedStatuses.has(sample.status)) issues.push(`${context}: invalid status ${sample.status}`);
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
