#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = normalize(process.argv[2] || 'reports/agent10-agent6-ready-workbench-source-family-license-lane-release-intake-boundary-packet-2026-06-05.json');
const artifact = JSON.parse(fs.readFileSync(path.join(root, artifactPath), 'utf8'));
const issues = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(artifact.artifact_type === 'agent10_agent6_ready_workbench_source_family_license_lane_release_intake_boundary_packet', 'unexpected artifact_type');
expect(artifact.active_mode === 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE', 'active_mode mismatch');
expect(artifact.release_owner === 'Agent 10', 'release_owner must be Agent 10');
expect(artifact.reviewer === 'Agent 6', 'reviewer must be Agent 6');
expect(artifact.scope === 'nonpublic_source_family_license_lane_release_intake_boundary_review_only', 'scope mismatch');
expect(Array.isArray(artifact.inputs_consumed) && artifact.inputs_consumed.length >= 6, 'inputs_consumed must list evidence paths');

const counts = artifact.counts || {};
expect(counts.release_intake_rows === 4, 'release_intake_rows must be 4');
expect(counts.boundary_question_count === 4, 'boundary_question_count must be 4');
expect(counts.source_family_license_lane_partition_count === 4, 'source_family_license_lane_partition_count must be 4');
expect(counts.source_family_count === 1, 'source_family_count must be 1');
expect(counts.source_name_partition_count === 351, 'source_name_partition_count must be 351');
expect(counts.source_row_count === 105747, 'source_row_count must be 105747');

const laneSplit = artifact.lane_split || {};
expect(laneSplit.commercial_clean_candidate_rows === 4, 'commercial_clean_candidate_rows must be 4');
expect(laneSplit.noncommercial_educational_candidate_rows === 0, 'noncommercial_educational_candidate_rows must be 0');
expect(laneSplit.metadata_or_link_only_rows === 0, 'metadata_or_link_only_rows must be 0');
expect(laneSplit.blocked_or_needs_review_rows === 0, 'blocked_or_needs_review_rows must be 0');
expect(laneSplit.commercial_clean_export_excludes_nc === true, 'commercial_clean_export_excludes_nc must be true');
expect(laneSplit.nc_educational_export_separate === true, 'nc_educational_export_separate must be true');

const expectedRows = new Map([
  ['Public Domain', { partitions: 307, rows: 99045, attribution: false, shareAlike: false }],
  ['CC-BY-SA', { partitions: 37, rows: 5581, attribution: true, shareAlike: true }],
  ['CC-BY', { partitions: 5, rows: 625, attribution: true, shareAlike: false }],
  ['CC0', { partitions: 2, rows: 496, attribution: false, shareAlike: false }],
]);

expect(Array.isArray(artifact.boundary_rows) && artifact.boundary_rows.length === 4, 'boundary_rows must have 4 rows');
for (const row of artifact.boundary_rows || []) {
  const expected = expectedRows.get(row.license_label);
  expect(Boolean(expected), `unexpected license_label ${row.license_label}`);
  if (!expected) continue;
  expect(row.source_family === 'hebrew_source_text', `${row.license_label} source_family mismatch`);
  expect(row.license_lane === 'commercial_clean_candidate', `${row.license_label} license_lane mismatch`);
  expect(row.source_name_partition_count === expected.partitions, `${row.license_label} source_name_partition_count mismatch`);
  expect(row.source_row_count === expected.rows, `${row.license_label} source_row_count mismatch`);
  expect(row.attribution_required === expected.attribution, `${row.license_label} attribution_required mismatch`);
  expect(row.share_alike_required === expected.shareAlike, `${row.license_label} share_alike_required mismatch`);
  expect(row.derived_from_nc === false, `${row.license_label} derived_from_nc must be false`);
  expect(row.corpus_contamination === false, `${row.license_label} corpus_contamination must be false`);
  expect(row.answer_eligible === false, `${row.license_label} answer_eligible must be false`);
  expect(row.public_emit === false, `${row.license_label} public_emit must be false`);
  expect(row.commercial_export_allowed === false, `${row.license_label} commercial_export_allowed must be false`);
  expect(row.commercial_export_allowed_planning_flag !== true, `${row.license_label} commercial_export_allowed_planning_flag must not be true`);
  expect(row.export_authorized_now === false, `${row.license_label} export_authorized_now must be false`);
  expect(row.agent6_boundary_required === true, `${row.license_label} agent6_boundary_required must be true`);
  expect(typeof row.agent6_boundary_question === 'string' && row.agent6_boundary_question.includes('Pass/warn/block'), `${row.license_label} Agent 6 question must be explicit`);
}

for (const [key, value] of Object.entries(artifact.zero_counters || {})) {
  expect(value === 0, `zero_counters.${key} must be 0`);
}

expect(typeof artifact.agent6_review_question === 'string' && artifact.agent6_review_question.includes('Pass/warn/block'), 'agent6_review_question must be explicit');
expect(typeof artifact.stop_condition === 'string' && artifact.stop_condition.includes('Do not perform'), 'stop_condition must preserve no-mutation boundary');
for (const required of ['QA acceptance', 'Definition authority', 'answer acceptance', 'publication readiness', 'accepted gloss/text', 'release action']) {
  expect((artifact.forbidden_claims || []).some((claim) => String(claim).includes(required)), `forbidden_claims must include ${required}`);
}

if (issues.length) {
  console.error(`Agent 10 Workbench source-family license-lane boundary packet validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  validated_packet: artifactPath,
  release_intake_rows: counts.release_intake_rows,
  source_name_partition_count: counts.source_name_partition_count,
  source_row_count: counts.source_row_count,
  boundary: 'Agent 10 source-family/license-lane boundary packet validation only; no QA/source/license/Definition/runtime/publication/product/answer acceptance.',
}, null, 2));

function normalize(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}
