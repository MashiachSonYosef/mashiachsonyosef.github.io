#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packetPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/usage-concentration-packet.json');
const packet = JSON.parse(fs.readFileSync(path.join(root, packetPath), 'utf8'));
const issues = [];

if (packet.schema_version !== 1) issues.push('schema_version must be 1');
if (packet.artifact_type !== 'workbench_usage_concentration_packet') issues.push('artifact_type must be workbench_usage_concentration_packet');
if (packet.authority_policy?.usage_navigation_only !== true) issues.push('authority_policy.usage_navigation_only must be true');
if (packet.authority_policy?.ranks_routes !== false) issues.push('authority_policy.ranks_routes must be false');
if (packet.authority_policy?.selects_visible_result !== false) issues.push('authority_policy.selects_visible_result must be false');
if (packet.quality?.status === 'failed') issues.push('quality.status must not be failed');
if (Number(packet.quality?.failed_count || 0) !== 0) issues.push('failed_count must be 0');
if (Number(packet.counts?.occurrence_refs || 0) <= 0) issues.push('occurrence_refs must be positive');
if (Number(packet.counts?.route_id_buckets || 0) <= 0) issues.push('route_id_buckets must be positive');
if (Number(packet.counts?.cluster_buckets || 0) <= 0) issues.push('cluster_buckets must be positive');
if (Number(packet.counts?.route_payload_field_hits || 0) !== 0) issues.push('route_payload_field_hits must be 0');
if (!Array.isArray(packet.checks) || packet.checks.length === 0) issues.push('checks must be non-empty');
for (const check of packet.checks || []) {
  if (!['passed', 'warning'].includes(check.status)) issues.push(`check ${check.id || '(unknown)'} must be passed or warning`);
}
if (!(packet.checks || []).some((check) => check.id === 'route_payload_absent' && check.status === 'passed')) {
  issues.push('route_payload_absent check must pass');
}
for (const bucketGroup of ['routes', 'clusters', 'statuses']) {
  const buckets = packet.concentration?.[bucketGroup];
  if (!Array.isArray(buckets) || buckets.length === 0) issues.push(`concentration.${bucketGroup} must contain buckets`);
}

if (issues.length) {
  console.error(`Workbench usage concentration packet validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Validated usage concentration packet ${packetPath}: status ${packet.quality.status}; warnings ${packet.quality.warning_count}`);

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}
