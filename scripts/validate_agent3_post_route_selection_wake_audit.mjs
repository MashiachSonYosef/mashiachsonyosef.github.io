#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input: 'reports/agent3-post-route-selection-wake-audit-2026-06-05.json',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(artifact.artifact_type === 'agent3_post_route_selection_wake_audit', 'artifact_type mismatch');
expect(artifact.status === 'exact_blocker_wake_condition', 'status must be exact_blocker_wake_condition');
expect(artifact.authority_boundary?.navigation_evidence_only === true, 'navigation evidence boundary missing');
expect(artifact.authority_boundary?.blocker_wake_condition_only === true, 'blocker/wake boundary missing');
expect(artifact.authority_boundary?.usage_as_definition_authority === false, 'usage-as-definition authority must be false');
expect(artifact.authority_boundary?.definition_authority === false, 'Definition authority must be false');
expect(artifact.authority_boundary?.route_publication_support === false, 'route publication support must be false');
expect(artifact.authority_boundary?.answer_selection === false, 'answer selection must be false');
expect(artifact.authority_boundary?.route_ranking === false, 'route ranking must be false');
expect(artifact.authority_boundary?.semantic_arbitration === false, 'semantic arbitration must be false');
expect(artifact.authority_boundary?.source_license_acceptance === false, 'source/license acceptance must be false');
expect(artifact.authority_boundary?.qa_acceptance === false, 'QA acceptance must be false');
expect(artifact.authority_boundary?.public_runtime_mutation === false, 'public/runtime mutation must be false');
expect(artifact.authority_boundary?.accepted_gloss_text === false, 'accepted gloss text must be false');

const counts = artifact.schema_counts || {};
expect(counts.route_selection_rows === 5, 'route-selection row count must be 5');
expect(counts.route_selection_occurrence_links === 359, 'route-selection occurrence links must be 359');
expect(counts.route_selection_candidate_mismatches === 1, 'candidate mismatch rows must be 1');
expect(counts.route_selection_token_index_linkage_gaps === 1, 'token-index linkage gap rows must be 1');
expect(counts.route_selection_exact_blockers === 3, 'route-selection exact blockers must be 3');
expect(counts.post_crossmatch_direct_executable_worksets === 0, 'post-crossmatch executable worksets must be 0');
expect(counts.current_direct_executable_worksets === 0, 'current direct executable worksets must be 0');
expect(counts.worksets_considered === (artifact.worksets_considered || []).length, 'workset count mismatch');
expect(counts.exact_blockers === (artifact.exact_blockers || []).length, 'exact blocker count mismatch');
expect(counts.wake_conditions === (artifact.wake_conditions || []).length, 'wake condition count mismatch');
expect(counts.exact_blockers >= 3, 'expected at least 3 exact blockers');
expect(counts.wake_conditions >= 4, 'expected at least 4 wake conditions');
expect(counts.queue_mutations === 0, 'queue mutations must be 0');
expect(counts.submitted_to_agent6 === 0, 'submitted_to_agent6 must be 0');
expect(counts.acceptance_claims === 0, 'acceptance claims must be 0');
expect(counts.public_runtime_mutations === 0, 'public runtime mutations must be 0');

for (const row of artifact.worksets_considered || []) {
  expect(row.executable_agent3_workset === false, `${row.workset_id} must not be executable`);
  expect(Boolean(row.reason), `${row.workset_id} reason missing`);
}
for (const row of artifact.exact_blockers || []) {
  expect(Boolean(row.blocker_id), 'blocker_id missing');
  expect(Boolean(row.owner), `${row.blocker_id} owner missing`);
  expect(Boolean(row.detail), `${row.blocker_id} detail missing`);
}
for (const row of artifact.wake_conditions || []) {
  expect(Boolean(row.wake_id), 'wake_id missing');
  expect(Boolean(row.owner), `${row.wake_id} owner missing`);
  expect(Boolean(row.required_fields), `${row.wake_id} required_fields missing`);
}

if (errors.length > 0) {
  for (const error of errors) console.error(`ERROR ${error}`);
  process.exit(1);
}

console.log(
  `Agent 3 post-route-selection wake audit passed: blockers=${counts.exact_blockers} wake_conditions=${counts.wake_conditions} executable=${counts.current_direct_executable_worksets}`,
);

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(root, filePath), 'utf8'));
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    const [key, value] = arg.split('=');
    if (key === '--input' && value !== undefined) parsed.input = cleanRelativePath(value);
  }
  return parsed;
}

function cleanRelativePath(value) {
  return value.replace(/^["']|["']$/g, '').replaceAll('\\', '/');
}
