#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input: 'reports/a06-repo-cleaning-production-pipeline-adoption-receipt-2026-06-06.json',
};
const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expectEqual(artifact.artifact_type, 'a06_repo_cleaning_production_pipeline_adoption_receipt', 'artifact_type');
expectEqual(artifact.disposition, 'A06_PIPELINE_ACKNOWLEDGED_PRODUCTION_EVIDENCE_ONLY', 'disposition');
expectEqual(artifact.approval_route, 'A07', 'approval_route');
expectEqual(artifact.first_cleanup_mode, 'classification_only', 'first_cleanup_mode');

for (const reviewed of artifact.reviewed_artifacts || []) {
  expect(fs.existsSync(path.resolve(root, reviewed)), `reviewed artifact missing: ${reviewed}`);
}
expect((artifact.reviewed_artifacts || []).length === 3, 'expected 3 reviewed artifacts');

for (const item of [
  'repo_dirt_classification',
  'repo_cleaning_evidence_packet_generation',
  'bounded_validator_runs',
  'rollback_path_documentation',
  'A06_REPO_CLEANUP_PACKET_READY_or_exact_blocker',
]) {
  expect((artifact.a06_adopts_sop_026_for || []).includes(item), `a06 adoption missing: ${item}`);
}

for (const item of [
  'approval',
  'sop_ratification',
  'final_validation_approval',
  'release_gate_approval',
  'cleanup_batch_approval',
  'publication',
  'staging',
  'deletion',
  'revert',
  'source_license_acceptance',
  'definition_authority',
  'accepted_gloss_text',
]) {
  expect((artifact.a06_does_not_own || []).includes(item), `a06_does_not_own missing: ${item}`);
}

for (const field of [
  'scoped_dirt_snapshot',
  'classification_table',
  'proposed_action_per_file',
  'bounded_validators',
  'rollback_paths',
  'stop_condition',
]) {
  expect((artifact.required_packet_fields || []).includes(field), `required_packet_fields missing: ${field}`);
}

for (const item of [
  'git_add_A',
  'git_reset_hard',
  'blind_delete',
  'destructive_cleanup_of_unknown_or_user_work',
  'acceptance_claims',
  'self_approval',
  'whole_corpus_revalidation_from_dirty_tree_alone',
]) {
  expect((artifact.forbidden || []).includes(item), `forbidden missing: ${item}`);
}

const policy = artifact.validated_words_policy || {};
expectEqual(policy.default, 'preserve_validated_words', 'validated_words_policy.default');
expectEqual(policy.redo_scope, 'changed_or_flagged_rows_only', 'validated_words_policy.redo_scope');
for (const trigger of [
  'dirty_file_touches_validated_lexical_output',
  'source_license_evidence_changed',
  'route_default_selection_changed',
  'validator_detects_mismatch',
  'a07_or_owner_requests_targeted_migration_audit',
]) {
  expect((policy.triggers || []).includes(trigger), `validated_words_policy trigger missing: ${trigger}`);
}

expectEqual(
  artifact.boundary,
  'management_and_repo_cleaning_evidence_production_only_no_acceptance_no_destructive_action',
  'boundary',
);
expect(String(artifact.stop_condition || '').includes('A07 remains approval route'), 'stop_condition must preserve A07 route');

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log('A06 repo-cleaning production pipeline adoption receipt passed: evidence-only approval=A07');

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log('Usage: node scripts/validate_a06_repo_cleaning_production_pipeline_adoption_receipt.mjs [--input=PATH]');
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

function expectEqual(actual, expected, label) {
  expect(actual === expected, `${label} expected ${JSON.stringify(expected)}, found ${JSON.stringify(actual)}`);
}

function expect(condition, message) {
  if (!condition) errors.push(message);
}
