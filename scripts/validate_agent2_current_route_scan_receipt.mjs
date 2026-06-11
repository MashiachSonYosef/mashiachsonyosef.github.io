#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const receiptPath = cleanRelativePath(process.argv[2] || 'reports/agent2-current-route-scan-receipt-2026-06-04.json');
const receipt = readJson(receiptPath);
const issues = [];

expect(receipt.schema_version === '1.0', 'schema_version must be 1.0');
expect(receipt.artifact_type === 'agent2_current_route_scan_receipt', 'unexpected artifact_type');
expect(receipt.scan_status === 'no_new_agent2_exact_workset_found', 'unexpected scan_status');
expect(receipt.current_exact_blocker === 'no_new_agent2_exact_workset_after_deuteronomy_return', 'current_exact_blocker mismatch');
requirePath(receipt.current_handoff_bundle, 'current_handoff_bundle');

for (const collection of [
  'latest_agent10_agent2_route_rows',
  'latest_agent2_workset_rows',
  'latest_agent2_route_rows',
  'latest_handoff_bundle_rows',
]) {
  expect(Array.isArray(receipt[collection]) && receipt[collection].length > 0, `${collection} must be a non-empty array`);
  for (const p of receipt[collection] || []) requirePath(p, `${collection}.${p}`);
}

expect(receipt.latest_agent10_agent2_route_rows?.includes('reports/agent10-agent2-deuteronomy-phase2-transform-readiness-route-2026-06-04.md'), 'latest Agent10-Agent2 rows must include Deuteronomy route');
expect(receipt.latest_agent10_agent2_route_rows?.includes('reports/agent10-agent2-orot-missed-dictionary-zero-candidate-consumption-2026-06-04.json'), 'latest Agent10-Agent2 rows must include Orot zero-candidate consumption JSON');
expect(receipt.latest_agent2_workset_rows?.includes('reports/agent2-next-workset-needed-after-deuteronomy-return-2026-06-04.json'), 'latest Agent2 workset rows must include no-new-workset blocker');
expect(receipt.latest_handoff_bundle_rows?.includes('reports/agent2-weekly-lexicon-current-handoff-bundle-2026-06-04.json'), 'latest handoff bundle rows must include current bundle JSON');

const consumption = receipt.latest_agent10_agent2_consumption;
requirePath(consumption?.path, 'latest_agent10_agent2_consumption.path');
expect(consumption?.status === 'consumed_zero_candidate_return_no_agent6_route', 'Orot zero-candidate consumption status mismatch');
expect(consumption?.candidate_rows === 0, 'Orot zero-candidate consumption candidate_rows must be 0');
expect(consumption?.candidate_occurrences === 0, 'Orot zero-candidate consumption candidate_occurrences must be 0');
expect(consumption?.unmatched_rows === 168, 'Orot zero-candidate consumption unmatched_rows must be 168');
expect(consumption?.agent6_route_needed_now === false, 'Orot zero-candidate consumption must not open Agent 6 route');
expect(consumption?.changed_evidence_required_before_rerun === true, 'Orot zero-candidate consumption must require changed evidence before rerun');

for (const [key, value] of Object.entries(receipt.zero_boundary || {})) {
  expect(value === false, `zero_boundary.${key} must be false`);
}

if (issues.length) {
  console.error(`Agent 2 current route scan receipt validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 120)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 current route scan receipt validation passed. No newer exact Agent2 workset recorded.');

function requirePath(relativePath, label) {
  expect(typeof relativePath === 'string' && relativePath.length > 0, `${label} path is required`);
  if (relativePath) expect(fs.existsSync(path.join(root, cleanRelativePath(relativePath))), `${label} path does not exist: ${relativePath}`);
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}
