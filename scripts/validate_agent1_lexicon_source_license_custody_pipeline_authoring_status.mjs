#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-lexicon-source-license-custody-pipeline-authoring-status-2026-06-05.json';
const artifact = JSON.parse(fs.readFileSync(path.join(root, artifactPath), 'utf8'));
const issues = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(artifact.artifact_type === 'agent1_lexicon_source_license_custody_pipeline_authoring_status', 'artifact_type mismatch');
expect(String(artifact.mode || '').includes('WEEKLY_LEXICON_EXPANSION_GOAL_MODE'), 'mode must preserve weekly goal mode');
expect(Array.isArray(artifact.targets), 'targets must be array');
expect(artifact.targets.length === 4, `expected 4 targets, got ${artifact.targets?.length}`);

const requiredNonAcceptance = [
  'source_provenance_acceptance',
  'qa_acceptance',
  'definition_authority',
  'runtime_publication_acceptance',
  'product_data_acceptance',
  'answer_acceptance',
  'accepted_gloss_text',
  'nc_commercial_authorization',
];
for (const value of requiredNonAcceptance) {
  expect(artifact.non_acceptance?.includes(value), `non_acceptance missing ${value}`);
}

const expectedTargets = {
  orot_nc_klein: {
    rows: 17,
    occurrences: 259,
    lane: 'noncommercial_educational_candidate',
    laneRows: 17,
    laneOccurrences: 259,
    derivedFromNc: true,
    commercialExportAllowed: false,
    attributionRequired: true,
    agent6BoundaryRequired: true,
    blockerNull: true,
  },
  orot_next_missed_source_family: {
    rows: 50,
    occurrences: 1193,
    lane: 'commercial_clean_candidate',
    laneRows: 50,
    laneOccurrences: 1193,
    derivedFromNc: false,
    commercialExportAllowed: true,
    attributionRequired: false,
    agent6BoundaryRequired: false,
    blockerNull: true,
  },
  orot_third_missed_source_family: {
    rows: 169,
    occurrences: 2148,
    lane: null,
    derivedFromNc: null,
    commercialExportAllowed: null,
    attributionRequired: null,
    agent6BoundaryRequired: null,
    blockerNull: false,
  },
  old_dictionary_excluded_row_license_lane_reaudit: {
    rows: 500,
    occurrences: 8427,
    lane: null,
    derivedFromNc: null,
    commercialExportAllowed: null,
    attributionRequired: null,
    agent6BoundaryRequired: null,
    blockerNull: false,
  },
};

for (const [targetName, expected] of Object.entries(expectedTargets)) {
  const target = artifact.targets.find((entry) => entry.target === targetName);
  expect(Boolean(target), `target missing: ${targetName}`);
  if (!target) continue;
  const label = `target ${targetName}`;
  expect(Array.isArray(target.files) && target.files.length >= 2, `${label} files missing`);
  expect(Array.isArray(target.commands) && target.commands.length === 3, `${label} must provide 3 commands`);
  expect(target.counts?.rows === expected.rows, `${label} row count mismatch`);
  expect(target.counts?.occurrences === expected.occurrences, `${label} occurrence count mismatch`);
  expect(typeof target.stop_condition === 'string' && target.stop_condition.length > 0, `${label} stop_condition required`);
  expect(target.handoff?.agent10, `${label} Agent10 handoff required`);
  expect(target.handoff?.agent6, `${label} Agent6 handoff required`);
  if (expected.lane) {
    expect(target.counts?.license_lane?.[expected.lane]?.rows === expected.laneRows, `${label} lane row count mismatch`);
    expect(target.counts?.license_lane?.[expected.lane]?.occurrences === expected.laneOccurrences, `${label} lane occurrence count mismatch`);
    expect(target.flags?.derived_from_nc === expected.derivedFromNc, `${label} derived_from_nc mismatch`);
    expect(target.flags?.commercial_export_allowed === expected.commercialExportAllowed, `${label} commercial_export_allowed mismatch`);
    expect(target.flags?.attribution_required === expected.attributionRequired, `${label} attribution_required mismatch`);
    expect(target.flags?.agent6_boundary_required === expected.agent6BoundaryRequired, `${label} agent6_boundary_required mismatch`);
  }
  if (expected.blockerNull) {
    expect(target.blocker === null, `${label} blocker must be null`);
  } else {
    expect(target.blocker && typeof target.blocker === 'object', `${label} blocker object required`);
  }
  expect(target.validators?.map?.ok === true, `${label} map validator must be ok`);
  expect(target.validators?.contract?.ok === true, `${label} contract validator must be ok`);
}

const third = artifact.targets.find((entry) => entry.target === 'orot_third_missed_source_family');
expect(third?.blocker?.status === 'exact_workset_ready_boundary_pending_only', 'third missed status blocker mismatch');
expect(third?.blocker?.agent6_boundary_rows === 31, 'third missed boundary row count mismatch');
expect(third?.blocker?.agent6_boundary_occurrences === 476, 'third missed boundary occurrence count mismatch');

const oldDictionary = artifact.targets.find((entry) => entry.target === 'old_dictionary_excluded_row_license_lane_reaudit');
expect(oldDictionary?.blocker?.['old-dictionary-excluded-row-license-lane-reaudit::klein-dictionary']?.rows === 214, 'Klein blocker rows mismatch');
expect(oldDictionary?.blocker?.['old-dictionary-excluded-row-license-lane-reaudit::klein-dictionary']?.occurrences === 4444, 'Klein blocker occurrences mismatch');
expect(oldDictionary?.blocker?.['old-dictionary-excluded-row-license-lane-reaudit::klein-dictionary']?.policy?.noncommercial_educational_candidate === true, 'Klein NC policy missing');
expect(oldDictionary?.blocker?.['old-dictionary-excluded-row-license-lane-reaudit::bdb-augmented-strong']?.rows === 222, 'BDB Augmented Strong blocker rows mismatch');
expect(oldDictionary?.blocker?.['old-dictionary-excluded-row-license-lane-reaudit::bdb-augmented-strong']?.occurrences === 4435, 'BDB Augmented Strong blocker occurrences mismatch');
expect(oldDictionary?.blocker?.['old-dictionary-excluded-row-license-lane-reaudit::bdb-augmented-strong']?.blocker_type === 'missing_independent_source_license_custody_basis', 'BDB Augmented Strong blocker type mismatch');

if (artifact.set_validation) {
  expect(artifact.set_validation.ok === true, 'set_validation.ok must be true when present');
}
expect(artifact.handoff_owner?.agent10 === 'runnable packets and contracts for release package prep', 'handoff_owner.agent10 mismatch');
expect(artifact.handoff_owner?.agent6 === 'exact boundary questions and evidence completion for blocked subsets', 'handoff_owner.agent6 mismatch');

if (issues.length) {
  console.error(`Agent 1 lexicon source/license custody pipeline authoring status validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  validated_artifact: artifactPath,
  targets: artifact.targets.length,
  rows: Object.fromEntries(artifact.targets.map((target) => [target.target, target.counts?.rows])),
  occurrences: Object.fromEntries(artifact.targets.map((target) => [target.target, target.counts?.occurrences])),
  blocker_targets: artifact.targets.filter((target) => target.blocker).map((target) => target.target),
  boundary: 'Agent 1 source/license custody pipeline authoring status validation only; no source/license/QA/Definition/runtime/publication/product/answer acceptance.',
}, null, 2));

function expect(condition, message) {
  if (!condition) issues.push(message);
}
