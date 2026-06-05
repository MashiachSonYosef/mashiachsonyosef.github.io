#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packetPath = cleanRelativePath(process.argv[2] || 'reports/agent3-crossmatch-inventory-packet-2026-06-05.json');
const packet = readJson(packetPath);
const issues = [];

if (packet.schema_version !== 1) issues.push('schema_version must be 1');
if (packet.artifact_type !== 'agent3_crossmatch_inventory_packet') issues.push('artifact_type must be agent3_crossmatch_inventory_packet');
if (packet.agent !== 'Agent 3') issues.push('agent must be Agent 3');
if (packet.lane !== 'crossmatch_usage_navigation_inventory') issues.push('lane must be crossmatch_usage_navigation_inventory');
if (packet.worker_state !== 'evidence-ready') issues.push('worker_state must be evidence-ready');
if (packet.qa_acceptance_state !== 'not_agent6_accepted') issues.push('qa_acceptance_state must be not_agent6_accepted');

validateBoundary(packet.authority_boundary || {});
validateCounts(packet.counts || {}, packet.inventory_files || []);
validateFiles(packet.inventory_files || []);
validateBlocker(packet.blocker || {}, packet.counts || {});

if (issues.length) {
  console.error(`Agent 3 crossmatch inventory validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 120)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(
  `Agent 3 crossmatch inventory validation passed; files ${packet.counts.files_in_inventory}; ` +
  `dirty ${packet.counts.dirty_or_uncommitted_files}; blocker ${packet.blocker.status}.`
);

function validateBoundary(boundary) {
  for (const key of ['usage_navigation_only', 'occurrence_navigation_only', 'route_ids_only']) {
    if (boundary[key] !== true) issues.push(`authority_boundary.${key} must be true`);
  }
  for (const key of [
    'definition_authority',
    'semantic_arbitration',
    'route_ranking',
    'visible_answer_selection',
    'source_license_acceptance',
    'qa_acceptance',
    'publication_support',
    'accepted_translation_text',
  ]) {
    if (boundary[key] !== false) issues.push(`authority_boundary.${key} must be false`);
  }
}

function validateCounts(counts, files) {
  if (!Array.isArray(files) || files.length === 0) issues.push('inventory_files must be a non-empty array');
  if (counts.files_in_inventory !== files.length) issues.push('counts.files_in_inventory must match inventory_files length');
  if (counts.data_artifacts + counts.report_artifacts + counts.pipeline_scripts !== counts.files_in_inventory) {
    issues.push('kind counts must sum to files_in_inventory');
  }
  const cleanFiles = files.filter((file) => file.package_state === 'committed_clean_inventory_observed').length;
  const dirtyFiles = files.filter((file) => file.package_state === 'dirty_or_uncommitted_exact_blocker').length;
  if (counts.committed_clean_files !== cleanFiles) issues.push('counts.committed_clean_files mismatch');
  if (counts.dirty_or_uncommitted_files !== dirtyFiles) issues.push('counts.dirty_or_uncommitted_files mismatch');
  if (counts.committed_clean_files + counts.dirty_or_uncommitted_files !== counts.files_in_inventory) {
    issues.push('package state counts must sum to files_in_inventory');
  }
  for (const key of ['reader_facing_rows', 'route_payload_field_hits', 'forbidden_authority_field_hits', 'forbidden_truthy_authority_claims']) {
    if (!Number.isFinite(Number(counts[key])) || Number(counts[key]) < 0) issues.push(`counts.${key} must be a non-negative number`);
  }
  if (counts.forbidden_truthy_authority_claims !== 0) {
    issues.push('counts.forbidden_truthy_authority_claims must be 0');
  }
}

function validateFiles(files) {
  const seen = new Set();
  for (const file of files) {
    if (!file.path || seen.has(file.path)) issues.push(`duplicate or missing inventory path: ${file.path || 'missing'}`);
    seen.add(file.path);
    if (!fs.existsSync(path.join(root, file.path))) issues.push(`inventory path does not exist: ${file.path}`);
    if (!['data_artifact', 'report_artifact', 'pipeline_script'].includes(file.kind)) issues.push(`${file.path}: invalid kind ${file.kind}`);
    if (!Array.isArray(file.git_statuses) || file.git_statuses.length === 0) issues.push(`${file.path}: git_statuses must be non-empty`);
    if (!['committed_clean_inventory_observed', 'dirty_or_uncommitted_exact_blocker'].includes(file.package_state)) {
      issues.push(`${file.path}: invalid package_state ${file.package_state}`);
    }
    if (!file.authority_hits) issues.push(`${file.path}: authority_hits missing`);
  }
}

function validateBlocker(blocker, counts) {
  if (counts.dirty_or_uncommitted_files > 0) {
    if (blocker.status !== 'exact_blocker') issues.push('blocker.status must be exact_blocker when dirty files exist');
    if (blocker.blocker_id !== 'crossmatch_inventory_contains_dirty_or_uncommitted_artifacts') {
      issues.push('blocker_id must name dirty/uncommitted artifact blocker');
    }
    if (blocker.blocked_file_count !== counts.dirty_or_uncommitted_files) issues.push('blocked_file_count mismatch');
  } else if (blocker.status !== 'none') {
    issues.push('blocker.status must be none when no dirty files exist');
  }
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8').replace(/^\uFEFF/, ''));
}
