#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input: 'reports/agent2-old-dictionary-78-row-no-new-transform-input-blocker-after-agent4-gate-2026-06-06.json',
};
const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(
  artifact.artifact_type === 'agent2_old_dictionary_78_row_no_new_transform_input_blocker_after_agent4_gate',
  'artifact_type mismatch',
);
expect(artifact.active_mode === 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE', 'active_mode mismatch');
expect(artifact.target === 'old-dictionary-commercial-clean-78-row-transform-output-proposal-preboundary', 'target mismatch');
expectTruthy(artifact.generated_at, 'generated_at');

for (const [key, value] of Object.entries(artifact.files_used || {})) {
  expectTruthy(value, `files_used.${key}`);
  expect(fs.existsSync(path.resolve(root, value)), `files_used.${key} missing: ${value}`);
}

const checks = artifact.bounded_checks || [];
expect(Array.isArray(checks) && checks.length === 3, 'bounded_checks must contain three rows');
for (const [index, check] of checks.entries()) {
  const label = `bounded_checks[${index}]`;
  expect(check.process_timeout === false, `${label}.process_timeout must be false`);
  expectTruthy(check.command, `${label}.command`);
  expectPositiveInteger(check.timeout_ms, `${label}.timeout_ms`);
  expectTruthy(check.partial_output_or_artifact, `${label}.partial_output_or_artifact`);
  expectTruthy(check.next_safe_action, `${label}.next_safe_action`);
}

const counts = artifact.lane_counts_rows_consumed || {};
expectEqual(counts.parent_rows, 78, 'parent_rows');
expectEqual(counts.parent_occurrences, 1461, 'parent_occurrences');
expectEqual(counts.direct_rows, 5, 'direct_rows');
expectEqual(counts.direct_occurrences, 58, 'direct_occurrences');
expectEqual(counts.source_license_lane, 'commercial_clean_candidate', 'source_license_lane');
expectEqual(counts.triage_group, 'commercial_clean_only', 'triage_group');
expectEqual(counts.source_family, 'Jastrow Dictionary', 'source_family');
expectEqual(counts.source_citation_required_rows, 5, 'source_citation_required_rows');
expectEqual(counts.source_citation_or_url_present_rows, 0, 'source_citation_or_url_present_rows');
expectEqual(counts.source_citation_or_url_missing_rows, 5, 'source_citation_or_url_missing_rows');
expectEqual(counts.transform_rule_present_rows, 0, 'transform_rule_present_rows');
expectEqual(counts.transform_rule_still_blocked_rows, 5, 'transform_rule_still_blocked_rows');
expectEqual(counts.transform_ready_rows, 0, 'transform_ready_rows');

for (const key of [
  'candidate_text_rows',
  'definition_content_rows',
  'lemma_content_rows',
  'reader_hint_content_rows',
  'answer_eligible_rows',
  'route_shard_writes',
  'source_text_rows',
  'accepted_text_rows',
  'public_runtime_mutation',
  'export_rows',
  'release_actions',
  'acceptance_claims',
]) {
  expectEqual(counts[key], 0, key);
}

const missing = artifact.missing_pipeline_blocker || {};
expect(String(missing.missing_input || '').includes('Agent1 source-citation return'), 'missing input must name Agent1 source-citation return');
expectEqual(missing.missing_source_field, 'source_citation_or_url', 'missing_source_field');
expect(String(missing.missing_transform_rule || '').includes('proposed_definition_text'), 'missing_transform_rule must name proposed text fields');
expectEqual(missing.missing_output_schema_field, 'source_citation_or_url', 'missing_output_schema_field');
expect(String(missing.validator || '').includes('no transform-output proposal validator can run'), 'validator blocker mismatch');
expectEqual(missing.row_count_mismatch, false, 'row_count_mismatch');

const blockers = artifact.exact_blockers || [];
for (const blocker of [
  'missing_agent1_source_citation_return_after_agent4_gate',
  'missing_source_field::source_citation_or_url',
  'missing_agent10_exact_transform_rule_after_agent4_gate',
  'missing_transform_rule::proposed_candidate_text_proposed_definition_text_proposed_lemma_text_proposed_reader_hint_text',
  'missing_transform_output_proposal_matrix_or_exact_transform_rule',
  'stale_agent1_registry_target_current_agent1_thread_required',
  'changed_package_input_missing',
]) {
  expect(blockers.includes(blocker), `exact blocker missing: ${blocker}`);
}
expect(blockers.length === 7, `expected 7 exact blockers, found ${blockers.length}`);

for (const owner of ['agent1', 'agent10', 'agent4', 'agent2']) {
  expectTruthy(artifact.handoff_owner?.[owner], `handoff_owner.${owner}`);
}
const stop = String(artifact.stop_condition || '');
for (const phrase of ['No surfaces', 'source text', 'answer eligibility', 'public/runtime mutation', 'publication readiness', 'release action']) {
  expect(stop.includes(phrase), `stop_condition must include ${phrase}`);
}
expect(artifact.output_artifact_path === options.input, 'output_artifact_path must equal input');

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(
  `Agent 2 no-new-transform-input blocker passed: direct_rows=${counts.direct_rows} missing_source_citation=${counts.source_citation_or_url_missing_rows} transform_ready=${counts.transform_ready_rows}`,
);

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log('Usage: node scripts/validate_agent2_old_dictionary_78_row_no_new_transform_input_blocker_after_agent4_gate.mjs [--input=PATH]');
      process.exit(0);
    }
    if (arg.startsWith('--input=')) parsed.input = cleanRelativePath(arg.slice(arg.indexOf('=') + 1));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.resolve(root, relativePath), 'utf8'));
}

function cleanRelativePath(input) {
  const normalized = input.replaceAll('\\', '/');
  if (path.isAbsolute(normalized) || normalized.startsWith('../') || normalized.includes('/../')) {
    throw new Error(`Expected workspace-relative path, got ${input}`);
  }
  return normalized;
}

function expectTruthy(value, message) {
  expect(value !== undefined && value !== null && value !== '', `${message} is required`);
}

function expectEqual(actual, expected, label) {
  expect(actual === expected, `${label} expected ${JSON.stringify(expected)}, found ${JSON.stringify(actual)}`);
}

function expectPositiveInteger(value, label) {
  expect(Number.isInteger(value) && value > 0, `${label} must be a positive integer`);
}

function expect(condition, message) {
  if (!condition) errors.push(message);
}
