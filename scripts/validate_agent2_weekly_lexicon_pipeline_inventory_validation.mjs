#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const receiptPath = cleanRelativePath(process.argv[2] || 'reports/agent2-weekly-lexicon-pipeline-inventory-validation-2026-06-04.json');
const receipt = readJson(receiptPath);
const issues = [];

expect(receipt.schema_version === '1.0', 'schema_version must be 1.0');
expect(receipt.artifact_type === 'agent2_weekly_lexicon_pipeline_inventory_validation', 'unexpected artifact_type');
expect(receipt.mode === 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE', 'unexpected mode');
requirePath(receipt.validator, 'validator');
requirePath(receipt.inventory, 'inventory');
expect(receipt.expected_command === `node ${receipt.validator} ${receipt.inventory}`, 'expected_command mismatch');
expect(receipt.expected_status === 'passed', 'expected_status must be passed');

const inventory = readJson(receipt.inventory);
expect(inventory.artifact_type === 'agent2_weekly_lexicon_pipeline_inventory', 'inventory artifact_type mismatch');
expect(receipt.counts?.pipeline_entries === Object.keys(inventory.pipelines || {}).length, 'pipeline entry count mismatch');
expect(receipt.counts?.pipeline_entries === 10, 'pipeline_entries must be 10');
expect(receipt.counts?.deuteronomy_rows === 1334, 'deuteronomy_rows must be 1334');
expect(receipt.counts?.deuteronomy_occurrences === 2964, 'deuteronomy_occurrences must be 2964');
expect(receipt.counts?.deuteronomy_partition_rows === 1334, 'deuteronomy_partition_rows must be 1334');
expect(receipt.counts?.orot_missed_dictionary_candidate_rows === 0, 'Orot candidate rows must be 0');
expect(receipt.counts?.orot_missed_dictionary_unmatched === 168, 'Orot unmatched must be 168');
expect(receipt.counts?.old_dictionary_planning_rows === 500, 'old_dictionary_planning_rows must be 500');
expect(receipt.counts?.old_dictionary_planning_occurrences === 8427, 'old_dictionary_planning_occurrences must be 8427');
expect(receipt.counts?.old_dictionary_next_missed_rows === 50, 'old_dictionary_next_missed_rows must be 50');
expect(receipt.counts?.old_dictionary_candidate_rows_emitted === 0, 'old_dictionary candidate rows emitted must be 0');
expect(receipt.counts?.orot_tbd_rows === 13, 'Orot TBD rows must be 13');
expect(receipt.counts?.orot_tbd_occurrences === 129, 'Orot TBD occurrences must be 129');
expect(receipt.counts?.workbench_rows === 1000, 'Workbench rows must be 1000');
expect(receipt.counts?.joined_projected_rows === 1, 'joined_projected_rows must be 1');
expect(receipt.counts?.spark1_runnable_outputs_checked === 7, 'Spark-1 runnable outputs checked must be 7');
expect(receipt.counts?.spark1_validator_only_states_checked === 23, 'Spark-1 validator-only states checked must be 23');
expect(receipt.counts?.exact_blockers === 4, 'exact_blockers count must be 4');

for (const required of [
  'Old-dictionary lane planning intake remains planning-only with 500 audited rows / 8427 occurrences and 0 candidate rows emitted',
  'Spark-1 output-state gate checks 7 runnable outputs / 23 validator-only states',
  'Zero boundary values remain false',
]) {
  expect(receipt.checks?.includes(required), `checks must include: ${required}`);
}

for (const [key, value] of Object.entries(receipt.zero_boundary || {})) {
  expect(value === false, `zero_boundary.${key} must be false`);
}
const boundary = JSON.stringify(receipt.what_must_not_be_accepted || []);
for (const required of ['Definition authority', 'answer eligibility', 'public reader output', 'route-shard edit', 'NC commercial authorization']) {
  expect(boundary.includes(required), `what_must_not_be_accepted must include ${required}`);
}

if (issues.length) {
  console.error(`Agent 2 weekly lexicon pipeline inventory validation receipt failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 160)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 weekly lexicon pipeline inventory validation receipt passed. Pipeline entries: 10.');

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
