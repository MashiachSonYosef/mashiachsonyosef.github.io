#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input: 'reports/agent10-daniel-actual-page-prehud-blocker-callback-2026-06-06.json',
};
const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expectEqual(artifact.artifact_type, 'agent10_daniel_actual_page_prehud_blocker_callback', 'artifact_type');
expectEqual(artifact.status, 'blocked_for_actual_page_prehud_pipeline', 'status');
expectEqual(artifact.primary_actual_page, 'tanakh/daniel/index.html', 'primary_actual_page');
expect(fs.existsSync(path.resolve(root, artifact.primary_actual_page)), `primary actual page missing: ${artifact.primary_actual_page}`);
expect(Array.isArray(artifact.auxiliary_preview_only), 'auxiliary_preview_only must be an array');
for (const preview of artifact.auxiliary_preview_only || []) {
  expect(fs.existsSync(path.resolve(root, preview)), `auxiliary preview file missing: ${preview}`);
}

const actual = artifact.actual_page_evidence || {};
expectEqual(actual.daniel_page_exists, true, 'daniel_page_exists');
expectEqual(actual.daniel_page_modified_in_worktree, true, 'daniel_page_modified_in_worktree');
expectEqual(actual.lexical_units, 357, 'lexical_units');
expectEqual(actual.lexical_slots, 357, 'lexical_slots');
expectEqual(actual.hebrew_inline_blocks, 357, 'hebrew_inline_blocks');
expectEqual(actual.route_hud_dialogs, 1, 'route_hud_dialogs');
expectEqual(actual.lexical_config_blocks, 1, 'lexical_config_blocks');
expectEqual(actual.lexical_occurrence_scripts, 1, 'lexical_occurrence_scripts');
for (const key of ['data_hud_rows', 'prehud_rows', 'data_gloss_text_nodes', 'tbd_prehud_rows']) {
  expectEqual(actual[key], 0, key);
}

const counts = artifact.count_evidence || {};
expectEqual(counts.data_sources_daniel_units, 357, 'data_sources_daniel_units');
expectEqual(counts.data_sources_whitespace_tokens, 5799, 'data_sources_whitespace_tokens');
expectEqual(counts.data_lexical_occurrences_reported_total, 5456, 'data_lexical_occurrences_reported_total');
expectEqual(counts.data_lexical_occurrences_token_index_ids, 5456, 'data_lexical_occurrences_token_index_ids');

expectEqual(artifact.verdict, 'actual_daniel_page_is_not_yet_full_tbd_prehud', 'verdict');
const blockers = artifact.exact_blockers || [];
for (const blocker of [
  'actual_daniel_page_lacks_prehud_token_row_layer',
  'daniel_source_roster_count_5799_does_not_match_current_runtime_occurrence_count_5456',
]) {
  expect(blockers.includes(blocker), `exact blocker missing: ${blocker}`);
}
expect(blockers.length === 2, `expected 2 exact blockers, found ${blockers.length}`);
expect(String(artifact.required_next_action || '').includes('tanakh/daniel/index.html'), 'required_next_action must name actual Daniel page');
expect(String(artifact.required_next_action || '').includes('TBD'), 'required_next_action must preserve TBD boundary');

for (const file of artifact.touched_files_from_prior_auxiliary_preview_attempt || []) {
  expect(fs.existsSync(path.resolve(root, file)), `touched file missing: ${file}`);
}

const boundary = (artifact.boundary || []).map(String);
for (const required of [
  'blocker_callback_only',
  'no_actual_daniel_page_mutation_in_this_heartbeat',
  'no_QA_acceptance',
  'no_source_license_acceptance',
  'no_Definition_authority',
  'no_runtime_publication_acceptance',
  'no_product_acceptance',
  'no_answer_acceptance',
  'no_accepted_gloss_text',
  'no_publish_release_action',
]) {
  expect(boundary.includes(required), `boundary missing: ${required}`);
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(
  `Agent 10 Daniel actual-page pre-HUD blocker passed: lexical_units=${actual.lexical_units} prehud_rows=${actual.prehud_rows} runtime_occurrences=${counts.data_lexical_occurrences_reported_total}`,
);

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log('Usage: node scripts/validate_agent10_daniel_actual_page_prehud_blocker_callback.mjs [--input=PATH]');
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
