#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/source-freshness.json');
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
  'hebrew',
  'source_text',
  'text',
]);

if (artifact.schema_version !== 1) issues.push('schema_version must be 1');
if (artifact.artifact_type !== 'workbench_source_freshness_report') {
  issues.push('artifact_type must be workbench_source_freshness_report');
}
if (!String(artifact.policy || '').includes('Inventory-only freshness check')) {
  issues.push('policy must identify inventory-only freshness check');
}
if (!['current', 'stale'].includes(String(artifact.status || ''))) {
  issues.push('status must be current or stale');
}

const current = artifact.current_inventory || {};
for (const field of [
  'source_files',
  'count_delta_vs_artifact_scan',
  'files_modified_after_artifact',
  'files_created_after_artifact',
]) {
  const value = Number(current[field]);
  if (!Number.isInteger(value) || value < 0) issues.push(`current_inventory.${field} must be a non-negative integer`);
}

const snapshot = artifact.artifact_snapshot || {};
for (const field of ['source_files_scanned', 'occurrence_markers', 'candidate_rows']) {
  const value = Number(snapshot[field]);
  if (!Number.isInteger(value) || value < 0) issues.push(`artifact_snapshot.${field} must be a non-negative integer`);
}

const pending = Array.isArray(artifact.pending_refresh_files) ? artifact.pending_refresh_files : [];
if (Number(current.files_modified_after_artifact || 0) !== pending.length) {
  issues.push('pending_refresh_files length must equal files_modified_after_artifact');
}
if (artifact.status === 'stale' && pending.length === 0 && Number(current.count_delta_vs_artifact_scan || 0) === 0) {
  issues.push('stale status must have pending files or positive count delta');
}
if (artifact.status === 'current' && (pending.length > 0 || Number(current.count_delta_vs_artifact_scan || 0) > 0)) {
  issues.push('current status cannot have pending files or positive count delta');
}

for (const [index, row] of pending.entries()) {
  const context = `pending_refresh_files[${index}]`;
  for (const field of ['source_file', 'modified_at', 'created_at', 'bytes']) {
    if (row?.[field] === undefined || row?.[field] === null || row?.[field] === '') {
      issues.push(`${context}: missing ${field}`);
    }
  }
  if (!String(row.source_file || '').startsWith('data/sources/') || !String(row.source_file || '').endsWith('.json')) {
    issues.push(`${context}: source_file must be a data/sources JSON path`);
  }
  if (!Number.isInteger(Number(row.bytes)) || Number(row.bytes) <= 0) issues.push(`${context}: bytes must be positive`);
}

walkNoForbiddenFields(artifact, artifactPath);

if (issues.length) {
  console.error(`Workbench source freshness validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Validated workbench source freshness ${artifactPath}: status ${artifact.status}; pending ${pending.length}`);

function walkNoForbiddenFields(value, context, pathParts = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkNoForbiddenFields(item, context, [...pathParts, String(index)]));
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, item] of Object.entries(value)) {
    const itemPath = [...pathParts, key].join('.');
    if (forbiddenFieldNames.has(key)) issues.push(`${context}.${itemPath}: forbidden source/evidence field ${key}`);
    walkNoForbiddenFields(item, context, [...pathParts, key]);
  }
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}
