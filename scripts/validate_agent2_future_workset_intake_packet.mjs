#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packetPath = cleanRelativePath(process.argv[2] || 'data/definitions/agent2-future-workset-intake-fixture.json');
const packet = readJson(packetPath);
const issues = [];

const allowedLanes = new Set([
  'commercial_clean_candidate',
  'noncommercial_educational_candidate',
  'metadata_or_link_only',
  'blocked_or_needs_review',
]);

expect(packet.schema_version === '1.0', 'schema_version must be 1.0');
expect(packet.artifact_type === 'agent2_future_workset_intake_packet', 'unexpected artifact_type');
expect(typeof packet.workset_id === 'string' && packet.workset_id.length > 0, 'workset_id is required');
expect(typeof packet.target_work_or_subset === 'string' && packet.target_work_or_subset.length > 0, 'target_work_or_subset is required');
expect(Array.isArray(packet.input_artifacts) && packet.input_artifacts.length > 0, 'input_artifacts must be non-empty');
expect(typeof packet.command_or_expected_script === 'string' && packet.command_or_expected_script.startsWith('node '), 'command_or_expected_script must be a node command');
expect(typeof packet.output_path === 'string' && packet.output_path.length > 0, 'output_path is required');
expect(typeof packet.output_schema === 'string' && packet.output_schema.length > 0, 'output_schema is required');
expect(typeof packet.validator_or_gate === 'string' && packet.validator_or_gate.startsWith('node '), 'validator_or_gate must be a node command');
expect(Number.isInteger(packet.counts?.rows) && packet.counts.rows >= 0, 'counts.rows must be a non-negative integer');
expect(Number.isInteger(packet.counts?.occurrences) && packet.counts.occurrences >= 0, 'counts.occurrences must be a non-negative integer');
expect(Array.isArray(packet.source_lane_fields) && packet.source_lane_fields.length > 0, 'source_lane_fields must be non-empty');
expect(typeof packet.agent6_boundary_question === 'string' && packet.agent6_boundary_question.length > 0, 'agent6_boundary_question is required');
expect(typeof packet.stop_condition === 'string' && packet.stop_condition.includes('zero authority/public/answer'), 'stop_condition must preserve zero authority/public/answer');

for (const artifactPath of packet.input_artifacts || []) {
  requirePath(artifactPath, `input_artifacts.${artifactPath}`);
}

for (const field of [
  'source_family',
  'source_name',
  'license_label',
  'license_lane',
  'source_url_or_citation',
  'agent6_boundary_required',
]) {
  expect(packet.source_lane_fields?.includes(field), `source_lane_fields must include ${field}`);
}

for (const lane of packet.allowed_license_lanes || []) {
  expect(allowedLanes.has(lane), `allowed_license_lanes contains unknown lane ${lane}`);
}

if (packet.nc_partition_allowed === true) {
  for (const [key, expected] of Object.entries({
    derived_from_nc: true,
    commercial_export_allowed: false,
    attribution_required: true,
    owner_use_attestation: 'noncommercial_educational_zero_profit_zero_kickback',
    corpus_contamination: false,
  })) {
    expect(packet.required_nc_flags?.[key] === expected, `required_nc_flags.${key} mismatch`);
  }
}

for (const [key, value] of Object.entries(packet.zero_boundary || {})) {
  expect(value === false, `zero_boundary.${key} must be false`);
}

const forbiddenText = JSON.stringify(packet);
for (const forbidden of ['accepted gloss', 'accepted translation', 'Definition authority', 'answer acceptance']) {
  expect(!forbiddenText.includes(`claim_${forbidden}`), `packet must not claim ${forbidden}`);
}

if (issues.length) {
  console.error(`Agent 2 future workset intake packet validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 120)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 2 future workset intake packet validation passed. Workset: ${packet.workset_id}; rows: ${packet.counts.rows}; occurrences: ${packet.counts.occurrences}.`);

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
