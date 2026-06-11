#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent2-current-stale-reference-scan-receipt-2026-06-04.json';
const artifact = readJson(cleanRelativePath(artifactPath));
const issues = [];

expect(artifact.schema_version === '1.0', 'schema_version must be 1.0');
expect(artifact.artifact_type === 'agent2_current_stale_reference_scan_receipt', 'unexpected artifact_type');
expect(artifact.status === 'passed_current_surface_stale_reference_scan', 'status must be passed_current_surface_stale_reference_scan');
expect(Array.isArray(artifact.current_surfaces_checked), 'current_surfaces_checked must be an array');
expect(Array.isArray(artifact.stale_references_checked), 'stale_references_checked must be an array');
expect(Array.isArray(artifact.missing_surfaces), 'missing_surfaces must be an array');
expect(Array.isArray(artifact.stale_reference_hits), 'stale_reference_hits must be an array');
expect(artifact.current_surfaces_checked.length === 21, 'must check 21 current proof surfaces');
expect(artifact.stale_references_checked.length === 49, 'must check 49 stale reference strings');
expect(artifact.missing_surfaces.length === 0, 'missing_surfaces must be empty');
expect(artifact.stale_reference_hits.length === 0, 'stale_reference_hits must be empty');

for (const surface of artifact.current_surfaces_checked || []) {
  expect(typeof surface === 'string' && surface.length > 0, `invalid surface path: ${surface}`);
  expect(fs.existsSync(path.join(root, surface)), `surface does not exist: ${surface}`);
}

const expected = artifact.expected_current_anchors || {};
const counts = artifact.counts || {};
expect(counts.current_surfaces_checked === 21, 'counts.current_surfaces_checked must be 21');
expect(counts.stale_references_checked === 49, 'counts.stale_references_checked must be 49');
expect(counts.stale_reference_hits === 0, 'counts.stale_reference_hits must be 0');
expect(counts.missing_surfaces === 0, 'counts.missing_surfaces must be 0');
expect(counts.runnable_pipelines === expected.runnable_pipelines, 'runnable_pipelines anchor mismatch');
expect(counts.validator_only_checks === expected.validator_only_checks, 'validator_only_checks anchor mismatch');
expect(counts.runnable_outputs_checked === expected.runnable_outputs_checked, 'runnable_outputs_checked anchor mismatch');
expect(counts.validator_only_states_checked === expected.validator_only_states_checked, 'validator_only_states_checked anchor mismatch');
expect(counts.zero_boundary_artifacts_checked === expected.zero_boundary_artifacts_checked, 'zero_boundary_artifacts_checked anchor mismatch');
expect(counts.aggregate_validator_commands === expected.aggregate_validator_commands, 'aggregate_validator_commands anchor mismatch');
expect(counts.script_syntax_scripts_checked === expected.script_syntax_scripts_checked, 'script_syntax_scripts_checked anchor mismatch');
expect(counts.deuteronomy_phase2_rows === 1334, 'deuteronomy_phase2_rows must be 1334');
expect(counts.deuteronomy_phase2_occurrences === 2964, 'deuteronomy_phase2_occurrences must be 2964');
expect(counts.deuteronomy_partition_rows === 1334, 'deuteronomy_partition_rows must be 1334');
expect(counts.deuteronomy_partition_occurrences === 2964, 'deuteronomy_partition_occurrences must be 2964');
expect(counts.deuteronomy_answer_eligible_rows === 0, 'deuteronomy_answer_eligible_rows must be 0');
expect(counts.deuteronomy_public_emit_rows === 0, 'deuteronomy_public_emit_rows must be 0');

for (const [key, value] of Object.entries(artifact.zero_boundary || {})) {
  expect(value === false, `zero_boundary.${key} must be false`);
}

if (issues.length) {
  console.error(`Agent 2 stale-reference scan receipt validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 2 stale-reference scan receipt validation passed. Surfaces: ${counts.current_surfaces_checked}; stale hits: ${counts.stale_reference_hits}.`);

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

function expect(condition, message) {
  if (!condition) issues.push(message);
}
