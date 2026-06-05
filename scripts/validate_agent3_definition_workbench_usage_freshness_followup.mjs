#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent3-definition-workbench-usage-freshness-followup-2026-06-02.json';
const reportPath = artifactPath.replace(/\.json$/, '.md');
const artifact = readJson(artifactPath);
const errors = [];

const requiredInputs = [
  'queue_ready_packet_report',
  'consumer_manifest_report',
  'route_pointer_audit_report',
  'agent6_verdict_report',
  'concordance_navigation_packet',
  'occurrence_support_packet',
  'occurrence_links_packet',
  'route_pointer_audit_packet',
];

requireEqual(artifact.schema_version, 1, 'schema_version must be 1');
requireEqual(artifact.artifact_type, 'agent3_definition_workbench_usage_freshness_followup', 'artifact_type mismatch');
requireEqual(artifact.lane_owner, 'Agent 3', 'lane_owner must be Agent 3');
requireEqual(artifact.status, 'awaiting-Agent-6', 'status must be awaiting-Agent-6');
requireTruthy(fs.existsSync(path.join(root, reportPath)), `report missing: ${reportPath}`);

for (const key of requiredInputs) {
  const p = artifact.input_artifacts?.[key];
  requireTruthy(p, `input_artifacts.${key} missing`);
  if (p) requireTruthy(fs.existsSync(path.join(root, p)), `input missing: ${p}`);
}

for (const key of [
  'usage_navigation_only',
  'source_freshness_impact_only',
  'observed_usage_only',
  'route_ids_only',
  'audit_only_ambiguous_rows',
  'no_source_text_read',
  'no_broad_corpus_rebuild',
  'no_target_promotion',
  'not_reader_facing',
  'not_definition_authority',
  'not_reviewed_lexical_authority',
  'not_route_ranking',
  'not_semantic_arbitration',
  'not_visible_answer_selection',
  'not_publication_ready',
  'not_accepted_translation_text',
  'no_copied_agent2_payloads',
  'not_agent6_accepted',
]) {
  requireTruthy(artifact.authority_boundary?.[key], `authority_boundary.${key} must be true`);
}

const nav = readJson(artifact.input_artifacts.concordance_navigation_packet);
const support = readJson(artifact.input_artifacts.occurrence_support_packet);
const links = readJson(artifact.input_artifacts.occurrence_links_packet);
const routePointer = readJson(artifact.input_artifacts.route_pointer_audit_packet);
const navRows = nav.navigation_rows || [];
const supportRows = support.support_rows || [];
const linkRows = links.occurrence_links || [];
const routeRows = routePointer.route_pointer_rows || [];
const liveRows = liveDirtySourceRows();
const dirtyRows = artifact.dirty_source_rows || [];
const impactedRows = artifact.impacted_usage_navigation_rows || [];
const counts = artifact.counts || {};

requireEqual(dirtyRows.length, liveRows.length, 'dirty_source_rows length must match live git status');
requireEqual(counts.live_dirty_source_files, liveRows.length, 'live_dirty_source_files mismatch');
requireEqual(counts.current_navigation_rows, navRows.length, 'current_navigation_rows mismatch');
requireEqual(counts.selected_support_rows, supportRows.length, 'selected_support_rows mismatch');
requireEqual(counts.occurrence_link_rows, linkRows.length, 'occurrence_link_rows mismatch');
requireEqual(counts.route_pointer_rows, routeRows.length, 'route_pointer_rows mismatch');

const liveFiles = new Set(liveRows.map((row) => `${row.git_status}|${row.source_file}`));
for (const row of dirtyRows) {
  requireTruthy(liveFiles.has(`${row.git_status}|${row.source_file}`), `dirty row is not current live git status: ${row.source_file}`);
  requireEqual(row.row_label, 'observed usage only', `${row.source_file}: row_label must be observed usage only`);
  requireEqual(row.audit_visibility, 'agent6_queue_intake_only', `${row.source_file}: audit_visibility mismatch`);
  requireEqual(row.promotion_status, 'not_promoted', `${row.source_file}: must not promote target`);
  requireTruthy(['current_usage_overlap_review_only', 'no_current_usage_overlap'].includes(row.impact_status), `${row.source_file}: invalid impact_status`);
}

const expectedStatusCounts = countBy(liveRows, (row) => statusLabel(row.git_status));
requireEqual(counts.live_dirty_index_modified_files, expectedStatusCounts.modified_index || 0, 'modified_index count mismatch');
requireEqual(counts.live_dirty_tracked_modified_files, expectedStatusCounts.modified_tracked || 0, 'modified_tracked count mismatch');
requireEqual(counts.live_dirty_untracked_files, expectedStatusCounts.untracked || 0, 'untracked count mismatch');

const dirtySlugs = new Set(liveRows.map((row) => sourceSlugFromPath(row.source_file)));
const expectedImpacted = navRows.filter((row) => dirtySlugs.has(row.work_slug || row.work_id));
requireEqual(counts.impacted_navigation_rows, expectedImpacted.length, 'impacted navigation rows mismatch');
requireEqual(impactedRows.length, expectedImpacted.length, 'impacted_usage_navigation_rows length mismatch');
requireEqual(counts.dirty_sources_with_current_usage_overlap, dirtyRows.filter((row) => row.current_usage_navigation_rows > 0).length, 'dirty sources with overlap mismatch');
requireEqual(counts.dirty_sources_without_current_usage_overlap, dirtyRows.filter((row) => row.current_usage_navigation_rows === 0).length, 'dirty sources without overlap mismatch');
requireEqual(counts.dirty_sources_with_current_usage_overlap + counts.dirty_sources_without_current_usage_overlap, counts.live_dirty_source_files, 'overlap split mismatch');

requireEqual(counts.ambiguous_reader_facing_rows, 0, 'ambiguous_reader_facing_rows must be 0');
requireEqual(counts.source_text_reads, 0, 'source_text_reads must be 0');
requireEqual(counts.broad_corpus_rebuilds, 0, 'broad_corpus_rebuilds must be 0');
requireEqual(counts.promoted_targets, 0, 'promoted_targets must be 0');
requireEqual(counts.queue_mutations, 0, 'queue_mutations must be 0');
requireEqual(counts.submitted_to_agent6, 0, 'submitted_to_agent6 must be 0');
requireEqual(counts.route_payload_field_hits, 0, 'route_payload_field_hits must be 0');
requireEqual(counts.forbidden_authority_field_hits, 0, 'forbidden_authority_field_hits must be 0');
requireEqual(counts.rows_labeled_observed_usage_only, dirtyRows.length + impactedRows.length, 'observed usage label count mismatch');

for (const row of artifact.checks || []) {
  requireEqual(row.status, 'passed', `check failed: ${row.id}`);
}

const report = fs.readFileSync(path.join(root, reportPath), 'utf8');
for (const p of [
  'reports/definition-workbench-usage-queue-ready-packet.md',
  'reports/definition-workbench-usage-consumer-manifest.md',
  'reports/definition-workbench-usage-route-pointer-audit.md',
  'reports/agent6-agent3-definition-workbench-usage-occurrence-links-verdict-2026-06-02.md',
]) {
  requireTruthy(report.includes(p), `report must cite ${p}`);
}
requireTruthy(report.includes('observed usage only'), 'report must preserve observed usage only label');
requireTruthy(report.includes('awaiting Agent 6'), 'report must state awaiting Agent 6');

if (errors.length) {
  console.error(`Agent 3 freshness follow-up validation failed: ${errors.length} error(s)`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Agent 3 freshness follow-up validation passed: dirty sources ${counts.live_dirty_source_files}; overlap sources ${counts.dirty_sources_with_current_usage_overlap}; impacted navigation rows ${counts.impacted_navigation_rows}; route IDs ${counts.current_route_ids}`);

function liveDirtySourceRows() {
  const output = execSync('git status --porcelain=v1 -- data/sources/*.json', { cwd: root, encoding: 'utf8' });
  return output.split(/\r?\n/)
    .filter((line) => line.length)
    .map((line) => ({
      git_status: line.slice(0, 2),
      source_file: line.slice(3).trim().replaceAll('\\', '/'),
    }))
    .filter((row) => row.source_file.startsWith('data/sources/') && row.source_file.endsWith('.json'))
    .sort((a, b) => a.source_file.localeCompare(b.source_file));
}

function countBy(rows, keyFn) {
  const counts = {};
  for (const row of rows) {
    const key = keyFn(row);
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

function statusLabel(status) {
  if (status === '??') return 'untracked';
  if (status[0] && status[0] !== ' ') return 'modified_index';
  if (status[1] && status[1] !== ' ') return 'modified_tracked';
  return 'other_dirty';
}

function sourceSlugFromPath(sourceFile) {
  return sourceFile.replace(/^data\/sources\//, '').replace(/\.json$/, '');
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
