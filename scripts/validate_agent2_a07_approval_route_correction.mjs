#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input: 'reports/agent2-a07-approval-route-correction-2026-06-06.json',
};
const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expectEqual(artifact.artifact_type, 'agent2_a07_approval_route_correction', 'artifact_type');
expectEqual(artifact.active_mode, 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE', 'active_mode');
expectTruthy(artifact.generated_at, 'generated_at');
expect(String(artifact.target || '').includes('approval'), 'target must mention approval route');

const route = artifact.route_correction || {};
expectEqual(route.status, 'A07_APPROVED_WITH_WARNINGS', 'route_correction.status');
expectEqual(route.effective_scope, 'routing_law_only', 'route_correction.effective_scope');
expectEqual(route.approval_sop_final_validation_release_gate_owner, 'A07', 'approval owner');
expectEqual(route.evidence_validators_repo_cleaning_production_owner, 'A06', 'evidence owner');
expect(String(route.a06_output_status || '').includes('evidence-ready'), 'a06_output_status must preserve evidence-ready boundary');
expectEqual(route.do_not_ask_a06_for_approval, true, 'do_not_ask_a06_for_approval');
expectEqual(route.existing_validated_words_preserved, true, 'existing_validated_words_preserved');
expectEqual(route.redo_scope, 'changed_or_flagged_rows_only', 'redo_scope');

const boundary = artifact.agent2_boundary || {};
expectEqual(boundary.transforms_only_after_source_lane_evidence_exists, true, 'transforms_only_after_source_lane_evidence_exists');
expectEqual(boundary.agent2_transform_output_authoritative, false, 'agent2_transform_output_authoritative');
expectEqual(boundary.a07_approval_required_where_required, true, 'a07_approval_required_where_required');
expectEqual(boundary.publication_or_release_allowed, false, 'publication_or_release_allowed');
expectEqual(boundary.source_license_legal_definition_product_answer_accepted_text_acceptance_allowed, false, 'source/license/legal acceptance boundary');
expectEqual(boundary.repo_cleanup_action_allowed, false, 'repo_cleanup_action_allowed');
expectEqual(boundary.destructive_command_allowed, false, 'destructive_command_allowed');

const req = artifact.future_packet_requirement || {};
expectEqual(req.preserve_route_correction, true, 'preserve_route_correction');
expectEqual(req.redirect_approval_requests_to, 'A07', 'redirect_approval_requests_to');
expectEqual(req.do_not_route_approval_requests_to, 'A06', 'do_not_route_approval_requests_to');
expect(Array.isArray(req.a06_may_produce) && req.a06_may_produce.includes('validators'), 'a06_may_produce must include validators');
expect(Array.isArray(req.a06_must_not_be_treated_as) && req.a06_must_not_be_treated_as.includes('release gate owner'), 'a06_must_not_be_treated_as must include release gate owner');

const blockers = artifact.exact_blockers_if_misrouted || [];
for (const blocker of [
  'approval_request_misrouted_to_A06',
  'missing_A07_approval_route_for_approval_sop_final_validation_or_release_gate',
  'A06_output_is_evidence_ready_only_until_A07_approval',
]) {
  expect(blockers.includes(blocker), `missing blocker ${blocker}`);
}
expect(blockers.length === 3, `expected 3 misroute blockers, found ${blockers.length}`);

for (const owner of ['A07', 'A06', 'A02']) {
  expectTruthy(artifact.handoff_owner?.[owner], `handoff_owner.${owner}`);
}

const stop = String(artifact.stop_condition || '');
for (const phrase of ['A07', 'No publication/release', 'no source/license/legal/Definition/product/answer/accepted-text acceptance', 'no repo cleanup action', 'no destructive command']) {
  expect(stop.includes(phrase), `stop_condition must include ${phrase}`);
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log('Agent 2 A07 approval route correction passed: approval=A07 evidence=A06 acceptance=none');

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log('Usage: node scripts/validate_agent2_a07_approval_route_correction.mjs [--input=PATH]');
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

function expect(condition, message) {
  if (!condition) errors.push(message);
}
