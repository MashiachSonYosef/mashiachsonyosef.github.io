#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const indexPath = cleanRelativePath(process.argv[2] || 'data/workbench-evidence/public-handoff-index.json');
const artifact = readJson(indexPath);
const issues = [];
const allowedStatuses = new Set(['supported', 'candidate', 'weak', 'ambiguous', 'blocked']);
const forbiddenFieldNames = new Set([
  'phrase_hebrew',
  'phrase_tokens',
  'usage_note',
  'definition',
  'definition_text',
  'meaning',
  'meaning_claim',
  'translation',
  'english_translation',
  'winner',
  'final_answer',
]);

if (artifact.schema_version !== 1) issues.push('schema_version must be 1');
if (artifact.artifact_type !== 'workbench_public_handoff_index') issues.push('artifact_type must be workbench_public_handoff_index');
if (!Array.isArray(artifact.manifests) || !artifact.manifests.length) issues.push('manifests must be a non-empty array');
if (artifact.reader_facing_policy?.ambiguous_rows_reader_facing !== false) {
  issues.push('reader_facing_policy.ambiguous_rows_reader_facing must be false');
}
validateConsumerContract(artifact.consumer_contract);
validateCoverageBoundary(artifact.coverage_boundary);

const expected = {
  selected_targets: 0,
  validation_passed: 0,
  validation_failed: 0,
  missing_manifests: 0,
  occurrence_markers: 0,
  candidate_rows: 0,
  clusters: 0,
  blocked_rows: 0,
  reader_facing_eligible_rows: 0,
  count_only_ambiguous_rows: 0,
  status_counts: { supported: 0, candidate: 0, weak: 0, ambiguous: 0, blocked: 0 },
};

for (const [index, manifest] of (artifact.manifests || []).entries()) {
  validateManifest(manifest, `manifests[${index}]`);
}

for (const key of ['selected_targets', 'validation_passed', 'validation_failed', 'missing_manifests', 'occurrence_markers', 'candidate_rows', 'clusters', 'blocked_rows', 'reader_facing_eligible_rows', 'count_only_ambiguous_rows']) {
  if (Number(artifact.counts?.[key] || 0) !== expected[key]) {
    issues.push(`counts.${key} expected ${expected[key]}, found ${artifact.counts?.[key]}`);
  }
}
for (const status of allowedStatuses) {
  if (Number(artifact.counts?.status_counts?.[status] || 0) !== expected.status_counts[status]) {
    issues.push(`counts.status_counts.${status} expected ${expected.status_counts[status]}, found ${artifact.counts?.status_counts?.[status]}`);
  }
}

walkNoRowPayloads(artifact, indexPath);

if (issues.length) {
  console.error(`Workbench public handoff index validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Workbench public handoff index validation passed. Manifests: ${expected.selected_targets}. Eligible rows: ${expected.reader_facing_eligible_rows}. Ambiguous count-only rows: ${expected.count_only_ambiguous_rows}.`);

function validateManifest(row, context) {
  expected.selected_targets += 1;
  for (const field of ['slug', 'selection', 'focus', 'manifest_path', 'counts', 'status_counts', 'validation']) {
    if (row?.[field] === undefined || row?.[field] === null || row?.[field] === '') issues.push(`${context}: missing ${field}`);
  }
  const validationStatus = row.validation?.status || '';
  if (validationStatus === 'passed') expected.validation_passed += 1;
  else expected.validation_failed += 1;
  if (validationStatus === 'missing_manifest') expected.missing_manifests += 1;
  if (validationStatus === 'passed' && Array.isArray(row.validation?.issues) && row.validation.issues.length) {
    issues.push(`${context}: passed validation must not include issues`);
  }
  if (validationStatus !== 'passed' && (!Array.isArray(row.validation?.issues) || row.validation.issues.length === 0)) {
    issues.push(`${context}: failed validation must include issues`);
  }
  if (row.ambiguous_rows_reader_facing !== false) issues.push(`${context}: ambiguous_rows_reader_facing must be false`);

  for (const key of ['occurrence_markers', 'candidate_rows', 'clusters', 'blocked_rows']) {
    const value = Number(row.counts?.[key] || 0);
    if (!Number.isInteger(value) || value < 0) issues.push(`${context}.counts.${key}: must be a non-negative integer`);
    expected[key] += Math.max(0, value);
  }
  let eligible = 0;
  for (const status of allowedStatuses) {
    const value = Number(row.status_counts?.[status] || 0);
    if (!Number.isInteger(value) || value < 0) issues.push(`${context}.status_counts.${status}: must be a non-negative integer`);
    expected.status_counts[status] += Math.max(0, value);
    if (['supported', 'candidate', 'weak'].includes(status)) eligible += Math.max(0, value);
  }
  expected.reader_facing_eligible_rows += eligible;
  expected.count_only_ambiguous_rows += Math.max(0, Number(row.status_counts?.ambiguous || 0));
  if (Number(row.reader_facing_eligible_rows || 0) !== eligible) {
    issues.push(`${context}: reader_facing_eligible_rows expected ${eligible}, found ${row.reader_facing_eligible_rows}`);
  }
  const statusTotal = [...allowedStatuses].reduce((sum, status) => sum + Number(row.status_counts?.[status] || 0), 0);
  if (Number(row.counts?.candidate_rows || 0) + Number(row.counts?.blocked_rows || 0) !== statusTotal) {
    issues.push(`${context}: status counts do not match candidate_rows + blocked_rows`);
  }
}

function validateConsumerContract(contract) {
  if (!contract || typeof contract !== 'object') {
    issues.push('consumer_contract must be present');
    return;
  }
  if (contract.artifact_role !== 'usage_evidence_index') issues.push('consumer_contract.artifact_role must be usage_evidence_index');
  if (contract.evidence_model !== 'graph_first_candidate_second') issues.push('consumer_contract.evidence_model must be graph_first_candidate_second');
  if (!sameList(contract.downstream_visible_statuses, ['supported', 'candidate', 'weak'])) {
    issues.push('consumer_contract.downstream_visible_statuses must be supported,candidate,weak');
  }
  if (!sameList(contract.audit_only_statuses, ['ambiguous', 'blocked'])) {
    issues.push('consumer_contract.audit_only_statuses must be ambiguous,blocked');
  }
  if (contract.final_ranking_authority !== false) issues.push('consumer_contract.final_ranking_authority must be false');
  if (contract.visible_answer_authority !== false) issues.push('consumer_contract.visible_answer_authority must be false');
  if (contract.carries_text_rows !== false) issues.push('consumer_contract.carries_text_rows must be false');
}

function validateCoverageBoundary(boundary) {
  if (!boundary || typeof boundary !== 'object') {
    issues.push('coverage_boundary must be present');
    return;
  }
  if (boundary.selection_mode !== 'known_useful_or_seeded_smoke_only') {
    issues.push('coverage_boundary.selection_mode must be known_useful_or_seeded_smoke_only');
  }
  if (boundary.corpus_exhaustive !== false) issues.push('coverage_boundary.corpus_exhaustive must be false');
  const freshness = boundary.source_freshness;
  if (!freshness || typeof freshness !== 'object') {
    issues.push('coverage_boundary.source_freshness must be present');
    return;
  }
  if (!['current', 'stale', 'unavailable', 'unknown'].includes(String(freshness.status || ''))) {
    issues.push(`coverage_boundary.source_freshness.status invalid: ${freshness.status}`);
  }
  if (freshness.status !== 'unavailable') {
    for (const key of ['artifact_source_files_scanned', 'current_source_files', 'count_delta_vs_artifact_scan', 'files_modified_after_artifact', 'files_created_after_artifact']) {
      const value = Number(freshness[key]);
      if (!Number.isInteger(value) || value < 0) issues.push(`coverage_boundary.source_freshness.${key} must be a non-negative integer`);
    }
  }
}

function walkNoRowPayloads(value, context, pathParts = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkNoRowPayloads(item, context, [...pathParts, String(index)]));
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, item] of Object.entries(value)) {
    const itemPath = [...pathParts, key].join('.');
    if (forbiddenFieldNames.has(key)) issues.push(`${context}.${itemPath}: forbidden row/verdict field ${key}`);
    walkNoRowPayloads(item, context, [...pathParts, key]);
  }
}

function readJson(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) throw new Error(`Missing public handoff index: ${relativePath}`);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function sameList(value, expected) {
  return Array.isArray(value)
    && value.length === expected.length
    && value.every((item, index) => item === expected[index]);
}
