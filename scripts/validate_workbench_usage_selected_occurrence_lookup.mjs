#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const lookupPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/usage-selected-occurrence-lookup.json');
const artifact = JSON.parse(fs.readFileSync(path.join(root, lookupPath), 'utf8'));
const issues = [];

if (artifact.schema_version !== 1) issues.push('schema_version must be 1');
if (artifact.artifact_type !== 'workbench_usage_navigation_selected_occurrence_lookup') {
  issues.push('artifact_type must be workbench_usage_navigation_selected_occurrence_lookup');
}
if (artifact.authority_policy?.usage_navigation_only !== true) issues.push('authority_policy.usage_navigation_only must be true');
if (artifact.authority_policy?.ranks_routes !== false) issues.push('authority_policy.ranks_routes must be false');
if (artifact.authority_policy?.selects_visible_result !== false) issues.push('authority_policy.selects_visible_result must be false');

const lookup = artifact.lookup || {};
const expectedBuckets = {
  by_work: 'work_buckets',
  by_cluster: 'cluster_buckets',
  by_status: 'status_buckets',
  by_license: 'license_buckets',
  by_route_id: 'route_id_buckets',
  by_slice_id: 'slice_id_buckets',
};

for (const [field, countField] of Object.entries(expectedBuckets)) {
  const buckets = lookup[field];
  if (!Array.isArray(buckets) || buckets.length === 0) issues.push(`lookup.${field} must contain buckets`);
  if (Number(artifact.counts?.[countField] || 0) !== (buckets || []).length) {
    issues.push(`counts.${countField} must equal lookup.${field}.length`);
  }
  for (const bucket of buckets || []) {
    if (!bucket.key) issues.push(`lookup.${field} bucket missing key`);
    if (!Number.isInteger(Number(bucket.counts?.rows)) || Number(bucket.counts?.rows) <= 0) {
      issues.push(`lookup.${field}.${bucket.key} rows must be positive`);
    }
    if (!Array.isArray(bucket.occurrence_ids) || bucket.occurrence_ids.length !== Number(bucket.counts?.rows || 0)) {
      issues.push(`lookup.${field}.${bucket.key} occurrence_ids length must equal rows`);
    }
    const statusTotal = Number(bucket.counts?.status_counts?.supported || 0)
      + Number(bucket.counts?.status_counts?.candidate || 0)
      + Number(bucket.counts?.status_counts?.weak || 0);
    if (statusTotal !== Number(bucket.counts?.rows || 0)) {
      issues.push(`lookup.${field}.${bucket.key} status counts must equal rows`);
    }
  }
}

if (Number(artifact.counts?.occurrence_refs || 0) <= 0) issues.push('counts.occurrence_refs must be positive');
const statusRows = (lookup.by_status || []).reduce((sum, bucket) => sum + Number(bucket.counts?.rows || 0), 0);
if (statusRows !== Number(artifact.counts?.occurrence_refs || 0)) {
  issues.push('status bucket rows must equal occurrence_refs');
}

if (issues.length) {
  console.error(`Workbench usage selected occurrence lookup validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Validated selected occurrence lookup ${lookupPath}: occurrences ${artifact.counts.occurrence_refs}; works ${artifact.counts.work_buckets}`);

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}
