#!/usr/bin/env node
import fs from 'node:fs';

const packetPath =
  process.argv[2] ||
  'reports/agent10-agent6-ready-old-dictionary-78-row-candidate-use-preboundary-packet-2026-06-06.json';

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

function sumRows(rows) {
  return rows.reduce((sum, row) => sum + Number(row.occurrences || 0), 0);
}

const packet = readJson(packetPath);

expect(
  packet.artifact_type === 'agent10_agent6_ready_old_dictionary_78_row_candidate_use_preboundary_packet',
  'artifact_type mismatch',
);
expect(
  packet.target_package === 'old-dictionary-commercial-clean-78-row-candidate-use-preboundary-review',
  'target_package mismatch',
);
expect(
  packet.status === 'agent6_ready_exact_preboundary_packet_no_public_or_text_output',
  'status mismatch',
);

const files = packet.files_used || {};
const requiredFiles = {
  preboundary_matrix: 'reports/agent10-old-dictionary-78-row-candidate-use-preboundary-matrix-2026-06-06.json',
  agent10_workset: 'reports/agent10-agent2-ready-old-dictionary-78-row-candidate-use-workset-2026-06-06.json',
  agent2_morphology_matrix:
    'reports/agent2-old-dictionary-commercial-clean-morphology-relation-matrix-2026-06-05.json',
  agent1_source_lane_handoff: 'reports/agent1-old-dictionary-agent2-transform-lane-handoff-2026-06-04.json',
  agent6_morphology_planning_verdict:
    'reports/agent6-old-dictionary-morphology-planning-boundary-verdict-2026-06-05.json',
  agent6_source_family_overlap_verdict:
    'reports/agent6-old-dictionary-source-family-overlap-matrix-boundary-verdict-2026-06-05.json',
  agent6_exact_row_subset_manifest_verdict:
    'reports/agent6-old-dictionary-exact-row-subset-manifest-boundary-verdict-2026-06-05.json',
};

for (const [key, path] of Object.entries(requiredFiles)) {
  expect(files[key] === path, `files_used.${key} mismatch`);
  expect(fs.existsSync(path), `referenced file missing: ${path}`);
}

const matrix = readJson(files.preboundary_matrix);
const workset = readJson(files.agent10_workset);
const morphologyMatrix = readJson(files.agent2_morphology_matrix);
const sourceLaneHandoff = readJson(files.agent1_source_lane_handoff);
const morphologyVerdict = readJson(files.agent6_morphology_planning_verdict);
const overlapVerdict = readJson(files.agent6_source_family_overlap_verdict);
const subsetVerdict = readJson(files.agent6_exact_row_subset_manifest_verdict);

expect(
  matrix.artifact_type === 'agent10_old_dictionary_78_row_candidate_use_preboundary_matrix',
  'matrix artifact_type mismatch',
);
expect(
  workset.artifact_type === 'agent10_agent2_ready_old_dictionary_78_row_candidate_use_workset',
  'workset artifact_type mismatch',
);
expect(
  morphologyMatrix.artifact_type === 'agent2_old_dictionary_commercial_clean_morphology_relation_matrix',
  'morphology matrix artifact_type mismatch',
);
expect(
  sourceLaneHandoff.artifact_type === 'agent1_old_dictionary_agent2_transform_lane_handoff',
  'source lane handoff artifact_type mismatch',
);
expect(
  morphologyVerdict.disposition === 'warn_accepted_nonpublic_morphology_planning_evidence_only',
  'morphology planning verdict disposition mismatch',
);
expect(
  overlapVerdict.disposition === 'warn_accepted_nonpublic_source_family_overlap_planning_evidence_only',
  'source-family overlap verdict disposition mismatch',
);
expect(
  subsetVerdict.disposition === 'warn_accepted_nonpublic_source_lane_row_subset_planning_evidence_only',
  'exact row subset verdict disposition mismatch',
);

const rows = matrix.rows || [];
const occurrences = sumRows(rows);
const counts = packet.boundary_counts || {};

expect(rows.length === 78, 'matrix row count must be 78');
expect(occurrences === 1461, 'matrix occurrences must be 1461');
expect(counts.rows === rows.length, 'packet boundary row count mismatch');
expect(counts.occurrences === occurrences, 'packet boundary occurrences mismatch');
expect(counts.source_license_lane === 'commercial_clean_candidate', 'packet lane mismatch');
expect(counts.relation_class === 'exact_after_mark_strip', 'packet relation class mismatch');
expect(
  counts.morphology_relation_status === 'agent2_morphology_relation_approved_for_nonpublic_planning',
  'packet morphology relation status mismatch',
);
expect(matrix.counts?.rows === rows.length, 'matrix counts.rows mismatch');
expect(matrix.counts?.occurrences === occurrences, 'matrix counts.occurrences mismatch');
expect(workset.expected_counts?.rows === rows.length, 'workset expected row count mismatch');
expect(workset.expected_counts?.occurrences === occurrences, 'workset expected occurrences mismatch');

const selectedRows = morphologyMatrix.rows.filter(
  (row) =>
    row.preview_relation_class === 'exact_after_mark_strip' &&
    row.agent2_morphology_relation_status ===
      'agent2_morphology_relation_approved_for_nonpublic_planning',
);
expect(selectedRows.length === rows.length, 'morphology selector row count mismatch');
expect(sumRows(selectedRows) === occurrences, 'morphology selector occurrences mismatch');

const zeroFields = [
  'candidate_text_rows',
  'definition_candidate_rows',
  'lemma_candidate_rows',
  'reader_hint_candidate_rows',
  'answer_eligible_rows',
  'public_emit_rows',
  'route_writes',
  'accepted_text_rows',
  'public_runtime_mutation',
  'release_actions',
];
for (const field of zeroFields) {
  expect(counts[field] === 0, `boundary_counts.${field} must be 0`);
}

const laneInputs = new Map((packet.agent1_4_inputs_consumed || []).map((row) => [row.lane, row]));
expect(laneInputs.get('Agent 1')?.input === files.agent1_source_lane_handoff, 'Agent 1 consumed input mismatch');
expect(laneInputs.get('Agent 2')?.input === files.agent2_morphology_matrix, 'Agent 2 consumed input mismatch');
expect(laneInputs.get('Agent 3')?.input === null, 'Agent 3 input must be null for this packet');
expect(laneInputs.get('Agent 4')?.input === null, 'Agent 4 input must be null for this packet');
expect(
  laneInputs.get('Agent 4')?.release_package_use === 'no changed public/runtime package; no runtime route',
  'Agent 4 release package use mismatch',
);

expect(
  packet.agent6_boundary_question?.includes('78 row / 1461 occurrence'),
  'Agent6 boundary question must include exact row/occurrence count',
);

const notRequested = [
  'candidate text emission',
  'definition content storage',
  'lemma content storage',
  'reader-hint content storage',
  'answer eligibility',
  'public emit',
  'route writes',
  'accepted text',
  'export behavior',
  'public/runtime mutation',
  'publication readiness',
  'release action',
];
for (const item of notRequested) {
  expect(packet.not_requested?.includes(item), `missing not_requested item: ${item}`);
}

const blockers = [
  'candidate_text_export_blocked',
  'definition_lemma_reader_hint_content_storage_blocked',
  'answer_eligibility_blocked',
  'public_runtime_mutation_blocked',
  'route_writes_blocked',
  'accepted_text_blocked',
  'commercial_export_authorization_blocked',
  'publication_readiness_blocked',
  'release_action_blocked',
];
for (const item of blockers) {
  expect(packet.exact_blockers_preserved?.includes(item), `missing preserved blocker: ${item}`);
}

const mustNotAccept = [
  'QA acceptance',
  'source/provenance acceptance',
  'source/license/legal acceptance',
  'Definition authority',
  'usage-as-definition authority',
  'answer acceptance',
  'answer eligibility',
  'accepted gloss/text',
  'public reader output',
  'route-shard edit',
  'public/runtime mutation',
  'route publication support',
  'publication readiness',
  'product/data acceptance',
  'candidate text export',
  'definition/lemma/reader-hint content storage',
  'commercial export authorization',
  'NC commercial authorization',
  'release action',
];
for (const item of mustNotAccept) {
  expect(packet.what_must_not_be_accepted?.includes(item), `missing non-acceptance item: ${item}`);
}

console.log(
  `Agent10 78-row candidate-use preboundary packet validation passed. Rows: ${rows.length}; occurrences: ${occurrences}; zero counters: ${zeroFields.length}.`,
);
