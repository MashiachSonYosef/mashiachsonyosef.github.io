#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const receiptPath = cleanRelativePath(process.argv[2] || 'reports/agent2-lane-preservation-handoff-receipt-2026-06-04.json');
const receipt = readJson(receiptPath);
const issues = [];

expect(receipt.schema_version === '1.0', 'schema_version must be 1.0');
expect(receipt.artifact_type === 'agent2_lane_preservation_handoff_receipt', 'unexpected artifact_type');
expect(receipt.mode === 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE', 'unexpected mode');
expect(receipt.target === 'definition/lemma/reader-hint transforms only after source-family lane evidence exists', 'target mismatch');

for (const [key, relativePath] of Object.entries(receipt.files || {})) requirePath(relativePath, `files.${key}`);

const counts = receipt.schema_counts || {};
expect(counts.runnable_pipelines === 7, 'runnable_pipelines must be 7');
expect(counts.validator_only_checks === 24, 'validator_only_checks must be 24');
expect(counts.deuteronomy_input_rows === 1334, 'Deuteronomy input rows must be 1334');
expect(counts.deuteronomy_input_occurrences === 2964, 'Deuteronomy input occurrences must be 2964');
expect(counts.deuteronomy_commercial_clean_candidate_rows === 1334, 'Deuteronomy commercial-clean rows must be 1334');
expect(counts.deuteronomy_noncommercial_educational_candidate_rows === 0, 'Deuteronomy NC rows must be 0');
expect(counts.old_dictionary_planning_rows === 500, 'old-dictionary planning rows must be 500');
expect(counts.old_dictionary_next_missed_rows === 50, 'old-dictionary next missed rows must be 50');
expect(counts.orot_missed_dictionary_candidate_rows === 0, 'Orot missed-dictionary candidate rows must be 0');
expect(counts.orot_missed_dictionary_unmatched_rows === 168, 'Orot unmatched rows must be 168');
expect(counts.stale_reference_hits === 0, 'stale-reference hits must be 0');

const lane = receipt.lane_preservation || {};
expect(lane.consume_agent1_lane_classified_rows_only === true, 'must consume Agent 1 lane-classified rows only');
expect(lane.blanket_nc_recast === false, 'blanket_nc_recast must be false');
expect(lane.blanket_block_recast === false, 'blanket_block_recast must be false');
expect(lane.commercial_clean_recast_as_nc === false, 'commercial_clean_recast_as_nc must be false');
expect(lane.unclassified_rows_consumed_as_candidate_text === 0, 'unclassified candidate-text consumption must be 0');
expect(lane.commercial_clean_and_nc_separated_downstream === true, 'commercial clean and NC lanes must remain separated');

const transforms = receipt.transform_candidate_counts || {};
expect(transforms.deuteronomy_readiness_rows === 1334, 'Deuteronomy readiness rows must be 1334');
expect(transforms.deuteronomy_partition_plan_rows === 1334, 'Deuteronomy partition rows must be 1334');
expect(transforms.old_dictionary_candidate_text_rows === 0, 'old-dictionary candidate text rows must be 0');
expect(transforms.orot_missed_dictionary_candidate_rows === 0, 'Orot missed-dictionary candidate rows must be 0');

for (const [key, value] of Object.entries(receipt.zero_emission_counters || {})) {
  expect(value === 0, `zero_emission_counters.${key} must be 0`);
}

expect(receipt.blocker_rows?.orot_unmatched_rows_requiring_changed_source_family_linkage_dictionary_evidence === 168, 'Orot blocker rows must be 168');
expect(receipt.blocker_rows?.old_dictionary_candidate_text_consumption_export_storage_requires_new_exact_agent6_boundary === true, 'old-dictionary Agent 6 blocker must be true');
expect(receipt.blocker_rows?.no_new_agent2_exact_workset_after_deuteronomy_return === true, 'no-new-workset blocker must be true');
expect(receipt.validator === 'scripts/validate_agent2_lane_preservation_handoff_receipt.mjs', 'validator mismatch');
expect(String(receipt.missing_field_blocker || '').includes('lane-classified source rows'), 'missing field blocker must require lane-classified source rows');
expect(String(receipt.handoff_owner || '').includes('Agent 10 first'), 'handoff owner must name Agent 10 first');
expect(String(receipt.handoff_owner || '').includes('Agent 6 only by exact boundary packet'), 'handoff owner must preserve Agent 6 exact boundary');
expect(String(receipt.stop_condition || '').includes('new exact lane-classified Agent 2 workset'), 'stop condition mismatch');

for (const [key, value] of Object.entries(receipt.zero_boundary || {})) {
  expect(value === false, `zero_boundary.${key} must be false`);
}

if (issues.length) {
  console.error(`Agent 2 lane-preservation handoff receipt validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 120)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 lane-preservation handoff receipt validation passed. Workset blocker preserved; zero emissions maintained.');

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
