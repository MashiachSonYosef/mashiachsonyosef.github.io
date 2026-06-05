#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const artifactPath = process.argv[2] || 'data/definitions/agent3-definition-workbench-usage-collision-integrity-digest-reshit.json';
const reportPath = process.argv[3] || 'reports/agent3-definition-workbench-usage-collision-integrity-digest-reshit.md';
const artifact = readJson(artifactPath);
const errors = [];

const sourcePath = artifact.source_artifacts?.collision_handoff_manifest;
const manifest = sourcePath ? readJson(sourcePath) : null;
const entries = artifact.digest_entries || [];
const counts = artifact.counts || {};

requireEqual(artifact.schema_version, 1, 'schema_version must be 1');
requireEqual(artifact.artifact_type, 'agent3_definition_workbench_usage_collision_integrity_digest', 'artifact_type mismatch');
requireEqual(artifact.lane_owner, 'Agent 3', 'lane_owner must be Agent 3');
requireEqual(artifact.status, 'evidence-ready', 'status must be evidence-ready');
requireEqual(artifact.target_gate, 'definition_workbench_gate', 'target_gate mismatch');
requireTruthy(sourcePath, 'source_artifacts.collision_handoff_manifest missing');
requireTruthy(manifest, `source manifest missing: ${sourcePath}`);
requireEqual(manifest?.artifact_type, 'agent3_definition_workbench_usage_collision_handoff_manifest', 'source manifest type mismatch');
requireTruthy(fs.existsSync(path.join(root, reportPath)), `report missing: ${reportPath}`);

for (const key of ['usage_navigation_only', 'integrity_digest_only', 'observed_usage_only', 'route_ids_only', 'audit_only']) {
  requireTruthy(artifact.authority_boundary?.[key], `authority_boundary.${key} must be true`);
}
for (const key of [
  'reader_facing',
  'definition_authority',
  'reviewed_lexical_authority',
  'semantic_arbitration',
  'route_ranking',
  'visible_answer_selection',
  'copied_route_payloads',
  'accepted_text_output',
  'publication_claim',
  'source_text_read',
  'broad_target_expansion',
  'agent6_accepted',
]) {
  requireFalse(artifact.authority_boundary?.[key], `authority_boundary.${key} must be false`);
}

const expectedPaths = expectedDigestPaths(manifest, sourcePath);
requireEqual(entries.length, expectedPaths.length, 'digest_entries length mismatch');
const entryPathSet = new Set(entries.map((entry) => `${entry.artifact_key}|${entry.file_role}|${entry.path}`));
for (const expected of expectedPaths) {
  requireTruthy(entryPathSet.has(`${expected.artifact_key}|${expected.file_role}|${expected.path}`), `missing digest entry: ${expected.artifact_key}/${expected.file_role}/${expected.path}`);
}

for (const entry of entries) {
  const fullPath = path.join(root, entry.path);
  requireTruthy(fs.existsSync(fullPath), `${entry.path}: file missing`);
  if (fs.existsSync(fullPath)) {
    const bytes = fs.statSync(fullPath).size;
    const sha256 = crypto.createHash('sha256').update(fs.readFileSync(fullPath)).digest('hex');
    requireEqual(entry.exists, true, `${entry.path}: exists must be true`);
    requireEqual(entry.bytes, bytes, `${entry.path}: byte size mismatch`);
    requireEqual(entry.sha256, sha256, `${entry.path}: sha256 mismatch`);
  }
  if (entry.file_role === 'data') {
    const data = readJson(entry.path);
    requireEqual(entry.status, data.status, `${entry.path}: status snapshot mismatch`);
    requireEqual(JSON.stringify(entry.counts_snapshot), JSON.stringify(data.counts || {}), `${entry.path}: counts snapshot mismatch`);
  } else {
    requireEqual(JSON.stringify(entry.counts_snapshot), JSON.stringify({}), `${entry.path}: non-data counts must be empty`);
  }
}

const artifactKeys = new Set(entries.map((entry) => entry.artifact_key));
requireEqual(counts.digest_entries, entries.length, 'digest_entries count mismatch');
requireEqual(counts.artifact_keys, artifactKeys.size, 'artifact_keys count mismatch');
requireEqual(counts.data_entries, entries.filter((entry) => entry.file_role === 'data').length, 'data_entries mismatch');
requireEqual(counts.report_entries, entries.filter((entry) => entry.file_role === 'report').length, 'report_entries mismatch');
requireEqual(counts.validator_entries, entries.filter((entry) => entry.file_role === 'validator').length, 'validator_entries mismatch');
requireEqual(counts.files_present, entries.filter((entry) => entry.exists).length, 'files_present mismatch');
requireEqual(counts.entries_with_sha256, entries.filter((entry) => entry.sha256).length, 'entries_with_sha256 mismatch');
requireEqual(counts.entries_with_bytes, entries.filter((entry) => Number.isInteger(entry.bytes) && entry.bytes >= 0).length, 'entries_with_bytes mismatch');
requireEqual(counts.evidence_ready_data_artifacts, entries.filter((entry) => entry.file_role === 'data' && entry.status === 'evidence-ready').length, 'evidence_ready_data_artifacts mismatch');
requireEqual(counts.total_bytes, entries.reduce((sum, entry) => sum + Number(entry.bytes || 0), 0), 'total_bytes mismatch');

requireEqual(counts.manifest_reader_facing_rows, manifest.counts?.total_reader_facing_rows || 0, 'manifest_reader_facing_rows mismatch');
requireEqual(counts.manifest_route_payload_field_hits, manifest.counts?.total_route_payload_field_hits || 0, 'manifest_route_payload_field_hits mismatch');
requireEqual(counts.manifest_forbidden_authority_field_hits, manifest.counts?.total_forbidden_authority_field_hits || 0, 'manifest_forbidden_authority_field_hits mismatch');
requireEqual(counts.manifest_source_text_reads, manifest.counts?.total_source_text_reads || 0, 'manifest_source_text_reads mismatch');
requireEqual(counts.manifest_broad_target_expansion, manifest.counts?.total_broad_target_expansion || 0, 'manifest_broad_target_expansion mismatch');
requireEqual(counts.manifest_queue_mutations, manifest.counts?.total_queue_mutations || 0, 'manifest_queue_mutations mismatch');
requireEqual(counts.manifest_submitted_to_agent6, manifest.counts?.total_submitted_to_agent6 || 0, 'manifest_submitted_to_agent6 mismatch');

for (const key of [
  'manifest_reader_facing_rows',
  'manifest_route_payload_field_hits',
  'manifest_forbidden_authority_field_hits',
  'manifest_source_text_reads',
  'manifest_broad_target_expansion',
  'manifest_queue_mutations',
  'manifest_submitted_to_agent6',
  'reader_facing_rows',
  'route_payload_field_hits',
  'forbidden_authority_field_hits',
  'source_text_reads',
  'broad_target_expansion',
  'queue_mutations',
  'submitted_to_agent6',
]) {
  requireEqual(counts[key], 0, `${key} must be 0`);
}

for (const check of artifact.checks || []) requireEqual(check.status, 'passed', `check failed: ${check.id}`);

const report = fs.readFileSync(path.join(root, reportPath), 'utf8');
requireTruthy(report.includes('integrity/drift digest only'), 'report must preserve digest boundary');
requireTruthy(report.includes('not Definition authority'), 'report must reject Definition authority');
requireTruthy(report.includes('does not mutate queues'), 'report must reject queue mutation');

if (errors.length) {
  console.error(`Agent 3 collision integrity digest validation failed: ${errors.length} error(s)`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Agent 3 collision integrity digest validation passed: entries ${counts.digest_entries}; artifact keys ${counts.artifact_keys}; total bytes ${counts.total_bytes}`);

function expectedDigestPaths(manifest, sourcePath) {
  const expected = [];
  for (const entry of manifest.manifest_entries || []) {
    expected.push({ artifact_key: entry.key, file_role: 'data', path: entry.data_path });
    expected.push({ artifact_key: entry.key, file_role: 'report', path: entry.report_path });
    expected.push({ artifact_key: entry.key, file_role: 'validator', path: entry.validator_path });
  }
  expected.push({ artifact_key: 'collision_handoff_manifest', file_role: 'data', path: sourcePath });
  expected.push({ artifact_key: 'collision_handoff_manifest', file_role: 'report', path: 'reports/agent3-definition-workbench-usage-collision-handoff-manifest-reshit.md' });
  expected.push({ artifact_key: 'collision_handoff_manifest', file_role: 'validator', path: 'scripts/validate_agent3_definition_workbench_usage_collision_handoff_manifest.mjs' });
  return expected;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function requireEqual(actual, expected, message) {
  if (actual !== expected) errors.push(`${message}: expected ${expected}, got ${actual}`);
}

function requireTruthy(value, message) {
  if (!value) errors.push(message);
}

function requireFalse(value, message) {
  if (value !== false) errors.push(`${message}: got ${value}`);
}
