#!/usr/bin/env node
import fs from 'node:fs';

const blockerPath =
  process.argv[2] || 'reports/agent2-old-dictionary-transform-reaudit-boundary-blocker-2026-06-05.json';

function fail(message) {
  console.error(`Validation failed: ${message}`);
  process.exit(1);
}

function readJson(path) {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (error) {
    fail(`could not read JSON ${path}: ${error.message}`);
  }
}

function expect(condition, message) {
  if (!condition) fail(message);
}

const blocker = readJson(blockerPath);

expect(blocker.artifact_type === 'agent2_old_dictionary_transform_reaudit_boundary_blocker', 'artifact_type mismatch');
expect(blocker.status === 'blocked_for_missing_exact_agent1_agent6_boundary_fields', 'status mismatch');
expect(
  blocker.target === 'Agent 2 definition/lemma/reader-hint transform after Agent 1 classified lanes (old-dictionary reaudit)',
  'target mismatch'
);

for (const field of [
  'row_subset_id',
  'source_family',
  'license_lane',
  'transform_lane',
  'evidence_path',
  'occurrences',
  'derived_from_nc',
  'commercial_export_allowed',
  'attribution_required',
  'corpus_contamination',
  'agent6_boundary_required',
  'agent2_transform_allowed_now',
  'answer_eligible',
  'public_emit',
  'missing_evidence',
  'handoff_owner',
]) {
  expect((blocker.required_agent1_input_fields || []).includes(field), `missing Agent1 input field: ${field}`);
}

for (const field of [
  'exact_row_or_row_subset_id',
  'agent6_boundary_verdict',
  'agent6_morphology_relation_status',
  'morphology_relation_basis',
  'candidate_use_scope',
  'exact_agent6_manifest_or_packet_path',
]) {
  expect((blocker.required_agent6_boundary_fields || []).includes(field), `missing Agent6 boundary field: ${field}`);
}

const rows = blocker.exact_blockers_by_row_subset || [];
expect(Array.isArray(rows) && rows.length === 5, 'expected five row-subset blockers');
const byId = new Map(rows.map((row) => [row.row_subset_id, row]));

for (const [id, sourceFamily] of [
  ['old-dictionary-excluded-row-license-lane-reaudit::bdb-dictionary', 'BDB Dictionary'],
  ['old-dictionary-excluded-row-license-lane-reaudit::bdb-aramaic-dictionary', 'BDB Aramaic Dictionary'],
  ['old-dictionary-excluded-row-license-lane-reaudit::jastrow-dictionary', 'Jastrow Dictionary'],
]) {
  const row = byId.get(id);
  expect(row, `missing row subset: ${id}`);
  expect(row.source_family === sourceFamily, `${id} source_family mismatch`);
  expect(row.license_lane === 'commercial_clean_candidate', `${id} license lane mismatch`);
  expect(
    (row.missing_before_transform || []).includes(`${id}::missing_exact_agent6_boundary_and_approved_morphology_relation`),
    `${id} missing blocker mismatch`
  );
  expect(
    row.handoff_owner === 'Agent 10 for package assembly; Agent 6 for exact row/subset boundary',
    `${id} handoff owner mismatch`
  );
}

const klein = byId.get('old-dictionary-excluded-row-license-lane-reaudit::klein-dictionary');
expect(klein, 'missing Klein row subset');
expect(klein.source_family === 'Klein Dictionary', 'Klein source_family mismatch');
expect(klein.license_lane === 'noncommercial_educational_candidate', 'Klein license lane mismatch');
expect(
  (klein.missing_before_transform || []).includes(
    'old-dictionary-excluded-row-license-lane-reaudit::klein-dictionary::missing_exact_agent6_nc_boundary_no_commercial_export_authorization'
  ),
  'Klein missing NC boundary blocker'
);
expect(
  (klein.missing_before_transform || []).includes('Agent 6/public boundary before any display/storage/public/answer/export behavior'),
  'Klein missing public/display boundary blocker'
);
expect(klein.handoff_owner === 'Agent 1 for NC lane packet; Agent 6 for exact NC row/subset boundary', 'Klein handoff owner mismatch');

const augmented = byId.get('old-dictionary-excluded-row-license-lane-reaudit::bdb-augmented-strong');
expect(augmented, 'missing BDB Augmented Strong row subset');
expect(augmented.source_family === 'BDB Augmented Strong', 'BDB Augmented Strong source_family mismatch');
expect(augmented.license_lane === 'blocked_or_needs_review', 'BDB Augmented Strong license lane mismatch');
expect(
  (augmented.missing_before_transform || []).includes('missing_independent_source_license_custody_basis'),
  'BDB Augmented Strong missing custody blocker'
);
expect(augmented.handoff_owner === 'Agent 1 if evidence appears; otherwise blocked/review', 'BDB Augmented Strong handoff owner mismatch');

expect(
  blocker.transform_action_if_classified ===
    'consume exact row/subset evidence + approved morphology relation and emit Agent2 nonpublic definition/lemma/reader-hint input rows only.',
  'transform action mismatch'
);
expect(
  blocker.next_safe_handoff_owner === 'Agent 10 (package assembly) and Agent 6 (exact boundary/morphology relation)',
  'next safe handoff owner mismatch'
);
expect(blocker.stop_condition.includes('Do not emit definition/lemma/reader-hint content'), 'stop condition must block content emission');
expect(blocker.stop_condition.includes('public/runtime mutations'), 'stop condition must block public/runtime mutation');
expect(blocker.stop_condition.includes('release action'), 'stop condition must block release action');

expect(
  blocker.inputs?.agent1_transform_lane_handoff ===
    'reports/agent1-old-dictionary-agent2-transform-lane-handoff-2026-06-04.json',
  'Agent1 transform lane handoff input mismatch'
);
expect(
  blocker.inputs?.transform_readiness_matrix ===
    'reports/agent2-old-dictionary-excluded-row-transform-readiness-matrix-2026-06-05.json',
  'transform readiness matrix input mismatch'
);
expect(
  blocker.inputs?.agent1_boundary_question_packet ===
    'reports/agent1-old-dictionary-agent6-boundary-question-packet-2026-06-05.json',
  'Agent1 boundary question packet input mismatch'
);
expect(blocker.validator_result === 'n/a_blocked_due_to_missing_boundary', 'validator_result mismatch');

console.log(
  `Agent2 old-dictionary transform reaudit boundary blocker validation passed. ` +
    `Row-subset blockers: ${rows.length}; required Agent1 fields: ${blocker.required_agent1_input_fields.length}; required Agent6 fields: ${blocker.required_agent6_boundary_fields.length}.`
);
