#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(process.argv[2] || 'reports/agent2-usage-link-sample-nonoverlap-resolution-receipt-2026-06-05.json');
const artifact = readJson(artifactPath);
const issues = [];

expect(artifact.schema_version === '1.0', 'schema_version must be 1.0');
expect(artifact.artifact_type === 'agent2_usage_link_sample_nonoverlap_resolution_receipt', 'artifact_type mismatch');
expect(artifact.status === 'nonoverlap_resolved_as_separate_nonpublic_joined_sample_planning_row_no_live_sample_mutation', 'status mismatch');
expect(artifact.resolved_risk === 'usage-link packet has no overlap with current 200-row sample', 'resolved risk mismatch');

for (const [key, relativePath] of Object.entries(artifact.validated_artifacts || {})) {
  expect(fs.existsSync(path.join(root, cleanRelativePath(relativePath))), `validated artifact missing: ${key}`);
}

expect(Array.isArray(artifact.validator_commands) && artifact.validator_commands.length === 4, 'validator command count must be 4');

const sample = artifact.current_sample_snapshot || {};
expect(sample.sample_rows === 200, 'sample_rows must be 200');
expect(sample.live_sample_mutated === false, 'live_sample_mutated must be false');

const resolution = artifact.nonoverlap_resolution || {};
expect(resolution.join_rows === 1, 'join_rows must be 1');
expect(resolution.seed_rows_absent_from_sample === 1, 'seed_rows_absent_from_sample must be 1');
expect(resolution.projected_rows_to_add === 1, 'projected_rows_to_add must be 1');
expect(resolution.projected_total_rows_if_separate_joined_artifact === 201, 'projected total must be 201');
expect(resolution.projected_planning_rows === 1, 'projected planning rows must be 1');
expect(resolution.projected_usage_link_rows === 2390, 'projected usage-link rows must be 2390');
expect(resolution.selected_occurrence_links === 12, 'selected occurrence links must be 12');
expect(resolution.route_ids === 1, 'route IDs must be 1');
expect(resolution.audit_only_ambiguous_rows === 2064, 'audit-only ambiguous rows must be 2064');
expect(/separate Agent 2 nonpublic/.test(resolution.resolved_by || ''), 'resolved_by must name separate Agent 2 nonpublic artifact');

for (const [key, value] of Object.entries(artifact.zero_output_counts || {})) {
  expect(value === 0, `zero_output_counts.${key} must be 0`);
}

const boundary = artifact.authority_boundary || {};
for (const key of ['nonpublic_planning_only', 'live_sample_unchanged', 'usage_navigation_only', 'observed_usage_only', 'route_ids_only']) {
  expect(boundary[key] === true, `authority_boundary.${key} must be true`);
}
for (const key of ['reader_facing', 'ranks_routes', 'selects_visible_result', 'semantic_arbitration', 'copies_route_payloads', 'copies_definition_payloads', 'copies_translation_payloads', 'answer_eligibility', 'publication_claim']) {
  expect(boundary[key] === false, `authority_boundary.${key} must be false`);
}

for (const blocker of [
  'Agent 6 definition authority boundary remains unaccepted',
  'Klein remains noncommercial_educational_candidate with no commercial export authorization',
  'BDB Augmented Strong remains blocked pending independent source/license/custody basis',
]) {
  expect((artifact.remaining_blockers_not_resolved_by_this_receipt || []).includes(blocker), `remaining blocker missing: ${blocker}`);
}

const nonAcceptance = JSON.stringify(artifact.non_acceptance_boundary || []);
for (const phrase of ['No Definition authority', 'No answer acceptance', 'No answer eligibility', 'No public reader output', 'No public/runtime mutation']) {
  expect(nonAcceptance.includes(phrase), `non_acceptance_boundary missing ${phrase}`);
}

if (issues.length) {
  console.error(`Agent 2 usage-link sample non-overlap resolution receipt validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 usage-link sample non-overlap resolution receipt passed. Projected rows: 1; live sample mutations: 0; authority rows: 0.');

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
