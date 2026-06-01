#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/usage-work-frame-matrix.json');
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
if (artifact.artifact_type !== 'workbench_usage_navigation_work_frame_matrix') {
  issues.push('artifact_type must be workbench_usage_navigation_work_frame_matrix');
}
if (artifact.authority_policy?.usage_navigation_only !== true) issues.push('authority_policy.usage_navigation_only must be true');
if (artifact.authority_policy?.ranks_routes !== false) issues.push('authority_policy.ranks_routes must be false');
if (artifact.authority_policy?.selects_visible_result !== false) issues.push('authority_policy.selects_visible_result must be false');
if (artifact.authority_policy?.ambiguous_rows_reader_facing !== false) {
  issues.push('authority_policy.ambiguous_rows_reader_facing must be false');
}
if (artifact.quality?.status !== 'passed') issues.push('quality.status must be passed');
if (Number(artifact.quality?.failed_count || 0) !== 0) issues.push('quality.failed_count must be 0');
if (Number(artifact.counts?.route_payload_field_hits || 0) !== 0) issues.push('route_payload_field_hits must be 0');

const works = Array.isArray(artifact.works) ? artifact.works : [];
const categories = Array.isArray(artifact.categories) ? artifact.categories : [];
const clusters = Array.isArray(artifact.clusters) ? artifact.clusters : [];
if (!works.length) issues.push('works must be non-empty');
if (!categories.length) issues.push('categories must be non-empty');
if (!clusters.length) issues.push('clusters must be non-empty');
if (Number(artifact.counts?.works || 0) !== works.length) issues.push('counts.works must equal works length');
if (Number(artifact.counts?.categories || 0) !== categories.length) issues.push('counts.categories must equal categories length');
if (Number(artifact.counts?.clusters || 0) !== clusters.length) issues.push('counts.clusters must equal clusters length');

const workRows = works.reduce((sum, work) => sum + Number(work.counts?.rows || 0), 0);
const categoryRows = categories.reduce((sum, category) => sum + Number(category.counts?.rows || 0), 0);
const clusterRows = clusters.reduce((sum, cluster) => sum + Number(cluster.counts?.rows || 0), 0);
if (workRows !== Number(artifact.counts?.rows || 0)) issues.push('work rows must sum to counts.rows');
if (categoryRows !== Number(artifact.counts?.rows || 0)) issues.push('category rows must sum to counts.rows');
if (clusterRows !== Number(artifact.counts?.rows || 0)) issues.push('cluster rows must sum to counts.rows');

const statusRows = Number(artifact.counts?.status_counts?.supported || 0)
  + Number(artifact.counts?.status_counts?.candidate || 0)
  + Number(artifact.counts?.status_counts?.weak || 0);
if (statusRows !== Number(artifact.counts?.rows || 0)) issues.push('status counts must sum to counts.rows');

for (const work of works) {
  if (!work.work_key) issues.push('work missing work_key');
  if (!work.work_title && !work.work_slug) issues.push(`${work.work_key}: work title or slug must be present`);
  if (!work.category) issues.push(`${work.work_key}: category must be present`);
  if (!Array.isArray(work.clusters) || !work.clusters.length) issues.push(`${work.work_key}: clusters must be non-empty`);
  if (!Array.isArray(work.samples)) issues.push(`${work.work_key}: samples must be an array`);
  const clusterSum = (work.clusters || []).reduce((sum, cluster) => sum + Number(cluster.counts?.rows || 0), 0);
  if (clusterSum !== Number(work.counts?.rows || 0)) issues.push(`${work.work_key}: cluster rows must sum to work rows`);
  for (const sample of work.samples || []) validateSample(`${work.work_key}.sample`, sample);
  for (const cluster of work.clusters || []) {
    for (const sample of cluster.samples || []) validateSample(`${work.work_key}.${cluster.cluster_id}.sample`, sample);
  }
}

for (const check of artifact.checks || []) {
  if (check.status !== 'passed') issues.push(`check ${check.id || '(unknown)'} must pass`);
}
walkNoForbiddenFields(artifact, artifactPath);

if (issues.length) {
  console.error(`Workbench usage work-frame matrix validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Validated usage work-frame matrix ${artifactPath}: works ${works.length}; rows ${artifact.counts.rows}`);

function validateSample(context, sample) {
  if (!sample.occurrence_id) issues.push(`${context}: occurrence_id must be present`);
  if (!sample.source_ref) issues.push(`${context}: source_ref must be present`);
  if (!sample.source_href) issues.push(`${context}: source_href must be present`);
  if (!sample.work_anchor_href) issues.push(`${context}: work_anchor_href must be present`);
  if (!sample.license) issues.push(`${context}: license must be present`);
  if (!sample.license_url) issues.push(`${context}: license_url must be present`);
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
