#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contractPath = cleanRelativePath(process.argv[2] || 'reports/agent2-future-workset-intake-contract-2026-06-04.json');
const contract = readJson(contractPath);
const issues = [];

expect(contract.schema_version === '1.0', 'schema_version must be 1.0');
expect(contract.artifact_type === 'agent2_future_workset_intake_contract', 'unexpected artifact_type');
expect(contract.status === 'future_workset_intake_gate_ready', 'unexpected status');
requirePath(contract.validator, 'validator');
requirePath(contract.fixture, 'fixture');

const fixture = readJson(contract.fixture);
expect(fixture.artifact_type === 'agent2_future_workset_intake_packet', 'fixture artifact_type mismatch');

for (const field of [
  'workset_id',
  'target_work_or_subset',
  'input_artifacts',
  'command_or_expected_script',
  'output_path',
  'output_schema',
  'validator_or_gate',
  'counts.rows',
  'counts.occurrences',
  'source_lane_fields',
  'agent6_boundary_question',
  'stop_condition',
  'zero_boundary',
]) {
  expect(contract.required_fields?.includes(field), `required_fields must include ${field}`);
}

for (const field of [
  'source_family',
  'source_name',
  'license_label',
  'license_lane',
  'source_url_or_citation',
  'agent6_boundary_required',
]) {
  expect(contract.required_source_lane_fields?.includes(field), `required_source_lane_fields must include ${field}`);
  expect(fixture.source_lane_fields?.includes(field), `fixture.source_lane_fields must include ${field}`);
}

for (const lane of [
  'commercial_clean_candidate',
  'noncommercial_educational_candidate',
  'metadata_or_link_only',
  'blocked_or_needs_review',
]) {
  expect(contract.allowed_license_lanes?.includes(lane), `allowed_license_lanes must include ${lane}`);
  expect(fixture.allowed_license_lanes?.includes(lane), `fixture.allowed_license_lanes must include ${lane}`);
}

for (const [key, expected] of Object.entries({
  derived_from_nc: true,
  commercial_export_allowed: false,
  attribution_required: true,
  owner_use_attestation: 'noncommercial_educational_zero_profit_zero_kickback',
  corpus_contamination: false,
})) {
  expect(contract.required_nc_flags?.[key] === expected, `required_nc_flags.${key} mismatch`);
  expect(fixture.required_nc_flags?.[key] === expected, `fixture.required_nc_flags.${key} mismatch`);
}

for (const [key, value] of Object.entries(contract.zero_boundary || {})) {
  expect(value === false, `zero_boundary.${key} must be false`);
}

if (issues.length) {
  console.error(`Agent 2 future workset intake contract validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 120)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 future workset intake contract validation passed. Required fields and source lanes aligned.');

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
