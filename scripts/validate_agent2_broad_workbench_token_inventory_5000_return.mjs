#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const receiptPath = cleanRelativePath(process.argv[2] || 'reports/agent2-broad-workbench-token-inventory-5000-return-2026-06-04.json');
const receipt = readJson(receiptPath);
const issues = [];

expect(receipt.schema_version === '1.0', 'schema_version must be 1.0');
expect(receipt.artifact_type === 'agent2_broad_workbench_token_inventory_5000_return', 'unexpected artifact_type');
expect(receipt.mode === 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE', 'unexpected mode');
expect(receipt.workset === 'broad-workbench-token-inventory-5000', 'workset mismatch');

for (const [key, relativePath] of Object.entries(receipt.files || {})) requirePath(relativePath, `files.${key}`);

const workset = readJson(receipt.files.workset);
const inventory = readJson(receipt.files.inventory);
expect(workset.artifact_type === 'agent2_future_workset_intake_packet', 'workset artifact_type mismatch');
expect(inventory.artifact_type === 'workbench_token_inventory', 'inventory artifact_type mismatch');

const counts = receipt.schema_counts || {};
expect(counts.workset_expected_top_token_rows === 5000, 'workset expected top-token rows must be 5000');
expect(counts.inventory_top_tokens === 5000, 'inventory top-token rows must be 5000');
expect(counts.inventory_distinct_normalized_tokens === inventory.counts?.distinct_normalized_tokens, 'distinct token count mismatch');
expect(counts.inventory_distinct_normalized_tokens === 698873, 'distinct token count must be 698873');
expect(counts.inventory_total_tokens === 75290880, 'total token count must be 75290880');
expect(counts.blocked_units === 0, 'blocked units must be 0');
expect(counts.blocked_jsonl_rows === 0, 'blocked JSONL rows must be 0');
expect(counts.tokens_jsonl_rows === 698873, 'tokens JSONL row count must be 698873');

const lane = receipt.lane_split || {};
expect(lane.source_license_inventory_only === true, 'source_license_inventory_only must be true');
expect(lane.source_family_lane_rows_present === false, 'source_family_lane_rows_present must be false');
expect(lane.commercial_clean_candidate_rows === 0, 'commercial clean candidate rows must be 0');
expect(lane.noncommercial_educational_candidate_rows === 0, 'NC candidate rows must be 0');
expect(lane.unclassified_rows_consumed_as_candidate_text === 0, 'unclassified candidate-text consumption must be 0');
expect(lane.downstream_candidate_generation_blocker === 'token_inventory_rows_do_not_carry_source_family_lane_fields', 'downstream blocker mismatch');

const transforms = receipt.transform_candidate_counts || {};
expect(transforms.token_inventory_top_rows === 5000, 'token inventory top rows must be 5000');
expect(transforms.definition_candidate_rows === 0, 'definition candidate rows must be 0');
expect(transforms.reader_hint_candidate_rows === 0, 'reader-hint candidate rows must be 0');
expect(transforms.lemma_candidate_rows === 0, 'lemma candidate rows must be 0');
expect(transforms.candidate_text_rows === 0, 'candidate text rows must be 0');

for (const [key, value] of Object.entries(receipt.zero_emission_counters || {})) {
  expect(value === 0, `zero_emission_counters.${key} must be 0`);
}

expect(receipt.blocker_rows?.downstream_transform_candidate_rows_blocked_until_source_family_lane_join === 5000, 'blocked downstream transform rows must be 5000');
expect(String(receipt.blocker_rows?.missing_field_blocker || '').includes('source_family'), 'missing field blocker must name source_family');
expect(String(receipt.handoff_owner || '').includes('Agent 10 first'), 'handoff owner must name Agent 10 first');
expect(String(receipt.handoff_owner || '').includes('Agent 6 only by exact boundary packet'), 'handoff owner must preserve Agent 6 boundary');

for (const [key, value] of Object.entries(receipt.zero_boundary || {})) {
  expect(value === false, `zero_boundary.${key} must be false`);
}

if (issues.length) {
  console.error(`Agent 2 broad workbench token inventory 5000 return validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 120)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 broad workbench token inventory 5000 return validation passed. Top-token rows: 5000; transform candidates: 0.');

function requirePath(relativePath, label) {
  expect(typeof relativePath === 'string' && relativePath.length > 0, `${label} path is required`);
  if (relativePath) expect(fs.existsSync(path.join(root, cleanRelativePath(relativePath))), `${label} path does not exist: ${relativePath}`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}
