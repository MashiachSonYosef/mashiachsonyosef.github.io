#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/usage-selected-occurrences.json');
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
]);

if (artifact.schema_version !== 1) issues.push('schema_version must be 1');
if (artifact.artifact_type !== 'workbench_usage_navigation_selected_occurrences') {
  issues.push('artifact_type must be workbench_usage_navigation_selected_occurrences');
}
if (artifact.authority_policy?.usage_navigation_only !== true) issues.push('authority_policy.usage_navigation_only must be true');
if (artifact.authority_policy?.ranks_routes !== false) issues.push('authority_policy.ranks_routes must be false');
if (artifact.authority_policy?.selects_visible_result !== false) issues.push('authority_policy.selects_visible_result must be false');
if (artifact.authority_policy?.ambiguous_rows_reader_facing !== false) {
  issues.push('authority_policy.ambiguous_rows_reader_facing must be false');
}

const rows = Array.isArray(artifact.rows) ? artifact.rows : [];
if (!rows.length) issues.push('rows must contain at least one occurrence');
const occurrenceIds = new Set();
const statusCounts = { supported: 0, candidate: 0, weak: 0 };
const routeLinkStateCounts = {
  route_linked_observed_usage: 0,
  observed_usage_only: 0,
};
let sliceMemberships = 0;

for (const row of rows) {
  if (!row.occurrence_id) issues.push('row missing occurrence_id');
  if (occurrenceIds.has(row.occurrence_id)) issues.push(`duplicate occurrence_id ${row.occurrence_id}`);
  occurrenceIds.add(row.occurrence_id);
  if (!row.source_ref) issues.push(`${row.occurrence_id}: source_ref must be present`);
  if (!row.source_href) issues.push(`${row.occurrence_id}: source_href must be present`);
  if (!row.work_anchor_href) issues.push(`${row.occurrence_id}: work_anchor_href must be present`);
  if (!row.focus_normalized && !row.token_normalized) issues.push(`${row.occurrence_id}: normalized token must be present`);
  if (!row.cluster_id) issues.push(`${row.occurrence_id}: cluster_id must be present`);
  if (!['supported', 'candidate', 'weak'].includes(row.status)) issues.push(`${row.occurrence_id}: status must be supported/candidate/weak`);
  if (Object.hasOwn(statusCounts, row.status)) statusCounts[row.status] += 1;
  if (Object.hasOwn(routeLinkStateCounts, row.route_link_state)) routeLinkStateCounts[row.route_link_state] += 1;
  if (!Array.isArray(row.slice_ids) || row.slice_ids.length === 0) issues.push(`${row.occurrence_id}: slice_ids must be non-empty`);
  else sliceMemberships += row.slice_ids.length;
  if (!Array.isArray(row.route_ids)) issues.push(`${row.occurrence_id}: route_ids must be an array`);
  if (!row.license) issues.push(`${row.occurrence_id}: license must be present`);
  if (!row.license_url) issues.push(`${row.occurrence_id}: license_url must be present`);
}

if (Number(artifact.counts?.occurrence_refs || 0) !== rows.length) issues.push('counts.occurrence_refs must equal rows length');
if (Number(artifact.counts?.slice_memberships || 0) !== sliceMemberships) issues.push('counts.slice_memberships must equal summed row slice_ids');
if (Number(artifact.counts?.duplicate_slice_memberships || 0) !== sliceMemberships - rows.length) {
  issues.push('counts.duplicate_slice_memberships must equal memberships minus rows');
}
for (const key of Object.keys(statusCounts)) {
  if (Number(artifact.counts?.status_counts?.[key] || 0) !== statusCounts[key]) {
    issues.push(`status count mismatch for ${key}`);
  }
}
for (const key of Object.keys(routeLinkStateCounts)) {
  if (Number(artifact.counts?.route_link_state_counts?.[key] || 0) !== routeLinkStateCounts[key]) {
    issues.push(`route link state count mismatch for ${key}`);
  }
}
walkNoForbiddenFields(artifact, artifactPath);

if (issues.length) {
  console.error(`Workbench usage selected occurrences validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Validated usage selected occurrences ${artifactPath}: rows ${rows.length}; memberships ${sliceMemberships}`);

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
