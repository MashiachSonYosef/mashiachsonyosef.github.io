#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const samplePath = cleanRelativePath(process.argv[2] || 'data/definitions/definition-workbench-sample.json');
const sample = readJson(samplePath);
const issues = [];
const allowedStatuses = new Set(['missing', 'proposed_only', 'single_answer_source_complete', 'conflicting', 'low_confidence', 'unreviewed']);
const allowedReviewStatuses = new Set(['unreviewed_machine_sample']);
const forbiddenPayloadFields = new Set(['definition', 'source_text', 'context', 'translation', 'accepted_translation', 'publication_status']);
const requiredRowFields = [
  'token_key',
  'normalized_form',
  'top_surfaces',
  'occurrence_count',
  'work_count',
  'route_card_count',
  'answer_card_count',
  'evidence_only_card_count',
  'distinct_answer_definition_count',
  'multi_answer',
  'source_license_complete',
  'usage_link_count',
  'status',
  'review_status',
];

if (sample.schema_version !== 1) issues.push('schema_version must be 1');
if (sample.artifact_type !== 'definition_workbench_sample') issues.push('artifact_type must be definition_workbench_sample');
if (!Array.isArray(sample.rows)) issues.push('rows must be an array');
if (!String(sample.boundary || '').includes('no definition text')) issues.push('boundary must state that no definition text is published');
if (!String(sample.review_policy || '').includes('never emits review_status=verified')) {
  issues.push('review_policy must reserve review_status=verified for reviewed lexical authority outside the machine sample');
}
if (!String(sample.answer_role_policy || '').includes('answer_role=answer')) {
  issues.push('answer_role_policy must preserve the answer_role=answer filter');
}
if (!String(sample.source_license_policy || '').includes('source_rows')) {
  issues.push('source_license_policy must preserve route card source/license row checks');
}
if (!String(sample.multi_answer_policy || '').includes('multi_answer=true')) {
  issues.push('multi_answer_policy must preserve multi-answer warnings');
}

for (const [index, row] of (sample.rows || []).entries()) {
  const context = `row ${index}`;
  for (const field of requiredRowFields) {
    if (!(field in row)) issues.push(`${context}: missing ${field}`);
  }
  if (!String(row.token_key || '').startsWith('he:')) issues.push(`${context}: token_key must start with he:`);
  if (!allowedStatuses.has(row.status)) issues.push(`${context}: invalid status ${row.status || '(missing)'}`);
  if (row.status === 'verified') issues.push(`${context}: status=verified is forbidden for machine-derived sample rows`);
  if (!allowedReviewStatuses.has(row.review_status)) issues.push(`${context}: invalid review_status ${row.review_status || '(missing)'}`);
  if (row.review_status === 'verified') issues.push(`${context}: review_status=verified is reserved for reviewed lexical authority and forbidden in machine-generated samples`);
  if (!Number.isInteger(row.occurrence_count) || row.occurrence_count < 0) issues.push(`${context}: invalid occurrence_count`);
  if (!Number.isInteger(row.route_card_count) || row.route_card_count < 0) issues.push(`${context}: invalid route_card_count`);
  if (!Number.isInteger(row.answer_card_count) || row.answer_card_count < 0) issues.push(`${context}: invalid answer_card_count`);
  if (!Number.isInteger(row.evidence_only_card_count) || row.evidence_only_card_count < 0) issues.push(`${context}: invalid evidence_only_card_count`);
  if (row.answer_card_count + row.evidence_only_card_count !== row.route_card_count) {
    issues.push(`${context}: answer/evidence counts do not reconcile with route_card_count`);
  }
  if (row.multi_answer !== (row.distinct_answer_definition_count > 1)) {
    issues.push(`${context}: multi_answer does not match distinct_answer_definition_count`);
  }
  if (row.status === 'missing' && row.route_card_count !== 0) issues.push(`${context}: missing status cannot have route cards`);
  if (row.status === 'conflicting' && row.distinct_answer_definition_count < 2) issues.push(`${context}: conflicting status needs multiple answer definitions`);
  if (row.status === 'single_answer_source_complete') {
    if (row.distinct_answer_definition_count !== 1) issues.push(`${context}: single_answer_source_complete needs exactly one answer definition`);
    if (row.answer_card_count < 1) issues.push(`${context}: single_answer_source_complete needs at least one answer card`);
    if (row.source_license_complete !== true) issues.push(`${context}: single_answer_source_complete needs complete source/license rows`);
    if (!Number.isFinite(row.max_confidence_percent) || row.max_confidence_percent < 80) {
      issues.push(`${context}: single_answer_source_complete needs max_confidence_percent >= 80`);
    }
  }
  for (const key of Object.keys(row)) {
    if (forbiddenPayloadFields.has(key)) issues.push(`${context}: forbidden payload field ${key}`);
  }
}

if (sample.counts?.rows !== (sample.rows || []).length) {
  issues.push(`row count mismatch: counts.rows ${sample.counts?.rows}, rows ${(sample.rows || []).length}`);
}
for (const [field, countKey] of [
  ['status', 'status_counts'],
  ['review_status', 'review_status_counts'],
]) {
  const actual = countValues((sample.rows || []).map((row) => row[field]));
  const expected = sample.counts?.[countKey] || {};
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    issues.push(`${countKey} mismatch`);
  }
}

if (issues.length) {
  console.error(`Definition Workbench sample validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 80)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Definition Workbench sample validation passed. Rows: ${sample.rows.length}.`);

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

function countValues(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  return Object.fromEntries([...counts.entries()].sort((a, b) => a[0].localeCompare(b[0])));
}
