#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(process.argv[2] || 'reports/agent2-state-missing-blocker-resolution-receipt-2026-06-05.json');
const artifact = readJson(artifactPath);
const issues = [];

expect(artifact.schema_version === '1.0', 'schema_version must be 1.0');
expect(artifact.artifact_type === 'agent2_state_missing_blocker_resolution_receipt', 'artifact_type mismatch');
expect(artifact.status === 'agent2_state_file_now_exists_and_validates_historical_control_references_not_broad_edited', 'status mismatch');
expect(artifact.resolved_blocker === 'Agent 2 state file missing', 'resolved blocker mismatch');
expect(fs.existsSync(path.join(root, cleanRelativePath(artifact.state_artifact))), 'state artifact must exist');
expect(fs.existsSync(path.join(root, cleanRelativePath(artifact.backing_receipt))), 'backing receipt must exist');

for (const [key, result] of Object.entries(artifact.state_assertions || {})) {
  expect(result === true, `state_assertions.${key} must be true`);
}

for (const [file, counts] of Object.entries(artifact.control_reference_scan || {})) {
  expect(fs.existsSync(path.join(root, cleanRelativePath(file))), `control reference file missing: ${file}`);
  expect(Number.isInteger(counts.report_missing_references), `${file} report_missing count must be integer`);
  expect(Number.isInteger(counts.missing_risk_references), `${file} missing_risk count must be integer`);
}

const counts = artifact.current_counts || {};
expect(counts.source_family_rows === 5, 'source_family_rows must be 5');
expect(counts.commercial_clean_candidate_source_families === 3, 'commercial clean count must be 3');
expect(counts.noncommercial_educational_candidate_source_families === 1, 'NC count must be 1');
expect(counts.metadata_or_link_only_source_families === 0, 'metadata/link-only count must be 0');
expect(counts.blocked_or_needs_review_source_families === 1, 'blocked count must be 1');
expect(counts.allowed_transform_rows_now === 0, 'allowed transform rows must be 0');
expect(counts.candidate_text_rows_now === 0, 'candidate text rows must be 0');
expect(counts.definition_candidate_rows_now === 0, 'definition candidate rows must be 0');
expect(counts.lemma_candidate_rows_now === 0, 'lemma candidate rows must be 0');
expect(counts.reader_hint_candidate_rows_now === 0, 'reader hint rows must be 0');
expect(counts.answer_eligible_rows_now === 0, 'answer eligible rows must be 0');
expect(counts.public_emit_rows_now === 0, 'public emit rows must be 0');

const lane = artifact.lane_preservation || {};
expect(lane.current_agent1_thread_id === '019e975d-dc9f-7020-a7c8-885d083a837e', 'current Agent 1 thread mismatch');
expect(lane.commercial_clean_and_nc_separated === true, 'commercial/NC separation must be true');
expect(lane.nc_commercial_export_allowed === false, 'NC commercial export must be false');
expect(lane.unclassified_rows_consumed_as_candidate_text === 0, 'unclassified candidate text consumption must be 0');

for (const [key, value] of Object.entries(artifact.zero_output_counts || {})) {
  expect(value === 0, `zero_output_counts.${key} must be 0`);
}

for (const risk of [
  'Agent 6 definition authority boundary remains unaccepted',
  'Klein remains noncommercial_educational_candidate with no commercial export authorization',
  'BDB Augmented Strong remains blocked pending independent source/license/custody basis',
]) {
  expect((artifact.remaining_risks_not_resolved_by_state_file || []).includes(risk), `remaining risk missing: ${risk}`);
}

const boundary = JSON.stringify(artifact.non_acceptance_boundary || []);
for (const phrase of ['No Definition authority', 'No answer acceptance', 'No public/runtime mutation', 'No release action']) {
  expect(boundary.includes(phrase), `boundary missing ${phrase}`);
}

if (issues.length) {
  console.error(`Agent 2 state missing-blocker resolution receipt validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 state missing-blocker resolution receipt passed. Missing state blocker resolved; remaining Agent 6/lane blockers preserved.');

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
