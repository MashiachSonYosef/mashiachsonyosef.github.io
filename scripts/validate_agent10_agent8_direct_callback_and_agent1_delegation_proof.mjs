#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportPath = process.argv[2] || 'reports/agent10-agent8-direct-callback-and-agent1-delegation-proof-2026-06-03.json';
const report = JSON.parse(fs.readFileSync(path.join(root, reportPath), 'utf8'));
const issues = [];

expect(report.artifact_type === 'agent10_agent8_direct_callback_and_agent1_delegation_proof', 'unexpected artifact_type');
expect(report.status === 'routing_checkpoint_recorded', 'unexpected status');

const boundary = report.boundary || {};
for (const flag of [
  'evidence_only',
  'control_proof_only',
  'no_qa_acceptance',
  'no_source_provenance_acceptance',
  'no_license_acceptance',
  'no_definition_authority',
  'no_usage_as_definition_authority',
  'no_answer_acceptance',
  'no_public_runtime_acceptance',
  'no_publication_readiness',
  'no_route_publication_support',
  'no_product_data_acceptance',
  'no_translation_output',
  'no_accepted_gloss',
  'no_accepted_text',
  'no_public_hud_mutation',
  'no_route_jsonl_mutation',
  'no_runtime_mutation',
  'no_source_mutation',
]) {
  expect(boundary[flag] === true, `boundary.${flag} must be true`);
}

expectExisting(report.checkpoint?.artifact_md, 'checkpoint artifact markdown');
expectExisting(report.checkpoint?.artifact_json, 'checkpoint artifact JSON');
expectExisting('scripts/validate_agent10_agent1_orot_dry_run_source_license_display_review_request.mjs', 'checkpoint validator');
expect(report.checkpoint?.published_commit === 'e81a0bbf1e8856c407191b2cf2810b975c5fdcc1', 'unexpected checkpoint commit');
expect(report.checkpoint?.scope?.rows === 31, 'checkpoint row count must be 31');
expect(report.checkpoint?.scope?.occurrences === 1202, 'checkpoint occurrences must be 1202');
expect(report.checkpoint?.scope?.unique_source_rows === 49, 'checkpoint unique source rows must be 49');
expect(report.checkpoint?.scope?.source_family_buckets === 4, 'checkpoint source-family bucket count must be 4');
expect(report.checkpoint?.scope?.output_mutations === 0, 'checkpoint output mutations must be 0');

expect(report.agent8_direct_callback?.delivery_status === 'direct_send_succeeded', 'Agent 8 callback must be direct_send_succeeded');
expect(report.agent8_direct_callback?.target_thread_id === '019e83a3-314c-7c43-9ec9-d56315813437', 'unexpected Agent 8 target thread');
expect(report.agent8_direct_callback?.submission_id === '019e8d8a-4cf1-73d3-997f-b6ef2c7f90a7', 'unexpected Agent 8 submission id');

expect(report.agent1_delegation?.delivery_status === 'spawned', 'Agent 1 delegation must be spawned');
expect(report.agent1_delegation?.agent_id === '019e8d8b-9eaf-7dc1-932a-7e116951ff91', 'unexpected Agent 1 agent id');
expect((report.agent1_delegation?.expected_outputs || []).length === 3, 'expected three Agent 1 output paths');

expect(report.next_route?.status === 'await_agent1_review_or_exact_blocker', 'next route should await Agent 1');
expect((report.chosen_not_to_do || []).includes('No public mutation.'), 'chosen_not_to_do must include no public mutation');
expect((report.what_must_not_be_accepted || []).includes('License acceptance'), 'non-acceptance list missing License acceptance');

const markdownPath = reportPath.replace(/\.json$/, '.md');
expectExisting(markdownPath, 'markdown report');
const markdown = fs.readFileSync(path.join(root, markdownPath), 'utf8');
for (const phrase of [
  'Agent 8 Direct Callback',
  'direct_send_succeeded',
  'Agent 1 Delegation',
  'await_agent1_review_or_exact_blocker',
  'What Must Not Be Accepted',
]) {
  expect(markdown.includes(phrase), `markdown missing ${phrase}`);
}

if (issues.length) {
  console.error(`Agent 10 Agent 8 callback and Agent 1 delegation proof validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 10 Agent 8 callback and Agent 1 delegation proof validation passed for ${reportPath}.`);

function expect(condition, message) {
  if (!condition) issues.push(message);
}

function expectExisting(relativePath, label) {
  expect(Boolean(relativePath), `${label} missing`);
  expect(!path.isAbsolute(relativePath || '') && !(relativePath || '').includes('..'), `${label} must be a safe relative path`);
  if (relativePath) expect(fs.existsSync(path.join(root, relativePath)), `${label} must exist: ${relativePath}`);
}
