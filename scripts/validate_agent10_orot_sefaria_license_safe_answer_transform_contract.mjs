#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contractPath = process.argv[2] || 'reports/agent10-orot-sefaria-license-safe-answer-transform-contract-2026-06-03.md';
const previewPath = process.argv[3] || 'reports/agent2-orot-sefaria-public-domain-candidate-preview-2026-06-03.json';
const contract = fs.readFileSync(path.join(root, contractPath), 'utf8');
const preview = readJson(previewPath);
const issues = [];

expect(preview.artifact_type === 'agent2_orot_sefaria_public_domain_candidate_preview', 'preview artifact type mismatch');
expect(preview.summary?.audited_rows === 500, 'preview audited row count mismatch');
expect(preview.summary?.audited_occurrences === 8427, 'preview audited occurrence count mismatch');
expect(preview.summary?.public_domain_observed_rows === 297, 'preview public-domain row count mismatch');
expect(preview.summary?.public_domain_observed_occurrences === 5747, 'preview public-domain occurrence count mismatch');
expect(preview.summary?.strict_exact_preview_rows === 78, 'preview strict row count mismatch');
expect(preview.summary?.strict_exact_preview_occurrences === 1461, 'preview strict occurrence count mismatch');
expect(preview.summary?.prefix_or_clitic_preview_rows === 129, 'preview prefix row count mismatch');
expect(preview.summary?.prefix_or_clitic_preview_occurrences === 3035, 'preview prefix occurrence count mismatch');
expect(preview.summary?.answer_rows_emitted === 0, 'preview emitted answer rows must be 0');
expect(preview.summary?.public_hud_rows_emitted === 0, 'preview public HUD rows must be 0');
expect(preview.summary?.route_jsonl_rows_emitted === 0, 'preview route JSONL rows must be 0');

for (const needle of [
  'Status: bounded transform-contract planning packet',
  'Highest permissible claim',
  'Current Measured State',
  'Source Families By Status',
  'Cleared-If-Agent1/6',
  'Blocked',
  'Metadata/Link-Only Until Disposition',
  'Future Fill-Producing Candidate Packet Contract',
  'Zero-Emission Stop Condition',
  'Next Required Calls',
  'Exact Blocker',
  'Agent 8 Callback',
  'What Must Not Be Accepted',
]) {
  expect(contract.includes(needle), `contract missing section or phrase: ${needle}`);
}

for (const family of [
  'Jastrow Dictionary',
  'BDB Dictionary',
  'BDB Aramaic Dictionary',
  'Klein Dictionary',
  'BDB Augmented Strong',
]) {
  expect(contract.includes(family), `contract missing family: ${family}`);
}

for (const count of [
  'Rows audited: `500`',
  'Occurrences audited: `8427`',
  'Rows with any Sefaria hit: `314`',
  'Occurrences covered by any Sefaria hit: `6006`',
  'Public-domain-observed rows: `297`',
  'Public-domain-observed occurrences: `5747`',
  'Strict exact preview rows / occurrences: `78` / `1461`',
  'Prefix or clitic preview rows / occurrences: `129` / `3035`',
  'Projected final hint occurrences if strict exact rows later clear: `41534`',
  'Projected final hint occurrences if prefix/clitic rows later clear too: `44569`',
]) {
  expect(contract.includes(count), `contract missing measured count: ${count}`);
}

for (const zero of [
  'Emit `0` answer rows.',
  'Emit `0` answer-candidate rows.',
  'Emit `0` source rows.',
  'Emit `0` public HUD rows.',
  'Emit `0` route JSONL rows.',
  'Store `0` definition-content rows.',
  'Mutate `0` source files.',
  'Mutate `0` lexical payload files.',
  'Mutate `0` runtime HTML/HUD/shard files.',
]) {
  expect(contract.includes(zero), `contract missing zero-emission stop: ${zero}`);
}

for (const required of [
  'license_custody_status',
  'agent1_custody_artifact',
  'agent6_boundary_artifact',
  'morphology_relation',
  'morphology_rule_id',
  'manual_semantic_arbitration',
  'answer_text_source_field',
  'reader_answer_candidate',
  'candidate_not_accepted',
  'not_definition_authority',
  'not_usage_as_definition',
  'not_accepted_translation_text',
]) {
  expect(contract.includes(required), `contract missing required output field/value: ${required}`);
}

for (const text of [
  'Blocked from answer emission by missing Agent 1/6 family-specific license/custody disposition.',
  'Agent 1 needed: yes',
  'Agent 6 needed: yes',
  'Agent 2 needed: only after Agent 1/6 disposition',
  'Agent 4 needed: no',
]) {
  expect(contract.includes(text), `contract missing route callback text: ${text}`);
}

const lower = contract.toLowerCase();
for (const forbidden of [
  'qa acceptance granted',
  'license accepted',
  'source custody accepted',
  'publication ready: true',
  'answer rows emitted: true',
  'definition authority accepted',
]) {
  expect(!lower.includes(forbidden), `contract contains forbidden acceptance phrase: ${forbidden}`);
}

if (issues.length) {
  console.error(`Agent 10 Orot Sefaria license-safe answer-transform contract validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 10 Orot Sefaria license-safe answer-transform contract validation passed for ${contractPath}.`);

function expect(condition, message) {
  if (!condition) issues.push(message);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}
