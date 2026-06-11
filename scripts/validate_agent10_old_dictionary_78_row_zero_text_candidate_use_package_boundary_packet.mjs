#!/usr/bin/env node
import fs from 'node:fs';

const packetPath =
  process.argv[2] ||
  'reports/agent10-agent6-ready-old-dictionary-78-row-zero-text-candidate-use-package-boundary-packet-2026-06-06.json';

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

const packet = readJson(packetPath);

expect(
  packet.artifact_type ===
    'agent10_agent6_ready_old_dictionary_78_row_zero_text_candidate_use_package_boundary_packet',
  'artifact_type mismatch',
);
expect(
  packet.target_package === 'old-dictionary-commercial-clean-78-row-zero-text-candidate-use-package-planning',
  'target_package mismatch',
);
expect(
  packet.status === 'agent6_ready_exact_zero_text_candidate_use_package_boundary_packet',
  'status mismatch',
);

const files = packet.files_used || {};
const expectedFiles = {
  agent10_verdict_consumption: 'reports/agent10-old-dictionary-78-row-agent6-verdict-consumption-2026-06-06.json',
  agent6_preboundary_verdict: 'reports/agent6-old-dictionary-78-row-candidate-use-preboundary-verdict-2026-06-06.md',
  preboundary_matrix: 'reports/agent10-old-dictionary-78-row-candidate-use-preboundary-matrix-2026-06-06.json',
  prior_agent10_preboundary_packet:
    'reports/agent10-agent6-ready-old-dictionary-78-row-candidate-use-preboundary-packet-2026-06-06.json',
  agent1_source_lane_handoff: 'reports/agent1-old-dictionary-agent2-transform-lane-handoff-2026-06-04.json',
  agent2_morphology_matrix: 'reports/agent2-old-dictionary-commercial-clean-morphology-relation-matrix-2026-06-05.json',
};

for (const [key, path] of Object.entries(expectedFiles)) {
  expect(files[key] === path, `files_used.${key} mismatch`);
  expect(fs.existsSync(path), `referenced input missing: ${path}`);
}

const consumption = readJson(files.agent10_verdict_consumption);
const matrix = readJson(files.preboundary_matrix);
const priorPacket = readJson(files.prior_agent10_preboundary_packet);
const morphology = readJson(files.agent2_morphology_matrix);
const handoff = readJson(files.agent1_source_lane_handoff);

expect(
  consumption.artifact_type === 'agent10_old_dictionary_78_row_agent6_verdict_consumption',
  'preboundary verdict consumption artifact_type mismatch',
);
expect(
  matrix.artifact_type === 'agent10_old_dictionary_78_row_candidate_use_preboundary_matrix',
  'matrix artifact_type mismatch',
);
expect(
  priorPacket.artifact_type === 'agent10_agent6_ready_old_dictionary_78_row_candidate_use_preboundary_packet',
  'prior packet artifact_type mismatch',
);
expect(
  morphology.artifact_type === 'agent2_old_dictionary_commercial_clean_morphology_relation_matrix',
  'morphology matrix artifact_type mismatch',
);
expect(
  handoff.artifact_type === 'agent1_old_dictionary_agent2_transform_lane_handoff',
  'source lane handoff artifact_type mismatch',
);

const boundary = packet.boundary_requested || {};
expect(boundary.scope === 'non-public zero-text candidate-use package planning artifact only', 'scope mismatch');
expect(boundary.rows === 78, 'boundary rows must be 78');
expect(boundary.occurrences === 1461, 'boundary occurrences must be 1461');
expect(boundary.source_license_lane === 'commercial_clean_candidate', 'source lane mismatch');
expect(boundary.relation_class === 'exact_after_mark_strip', 'relation class mismatch');
expect(
  boundary.morphology_relation_status === 'agent2_morphology_relation_approved_for_nonpublic_planning',
  'morphology relation status mismatch',
);
expect(matrix.counts?.rows === boundary.rows, 'matrix row count mismatch');
expect(matrix.counts?.occurrences === boundary.occurrences, 'matrix occurrence count mismatch');
expect(priorPacket.boundary_counts?.rows === boundary.rows, 'prior packet row count mismatch');
expect(priorPacket.boundary_counts?.occurrences === boundary.occurrences, 'prior packet occurrence count mismatch');
expect(consumption.agent6_verdict_consumed?.rows === boundary.rows, 'consumed verdict rows mismatch');
expect(consumption.agent6_verdict_consumed?.occurrences === boundary.occurrences, 'consumed verdict occurrences mismatch');

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
  'export_rows',
  'release_actions',
];
for (const field of zeroFields) {
  expect(boundary[field] === 0, `boundary_requested.${field} must be 0`);
}

expect(
  packet.prior_agent6_boundary?.next_boundary_required_for_candidate_use_package === true,
  'prior Agent6 boundary must require next package boundary',
);

const lanes = new Map((packet.agent1_4_inputs_consumed || []).map((row) => [row.lane, row]));
expect(lanes.get('Agent 1')?.input === files.agent1_source_lane_handoff, 'Agent 1 input mismatch');
expect(lanes.get('Agent 2')?.input === files.agent2_morphology_matrix, 'Agent 2 input mismatch');
expect(lanes.get('Agent 3')?.input === null, 'Agent 3 input must be null');
expect(lanes.get('Agent 4')?.input === null, 'Agent 4 input must be null');
expect(
  lanes.get('Agent 4')?.release_package_impact === 'no changed public/runtime package',
  'Agent 4 package impact mismatch',
);

const blockers = [
  'candidate_text_blocked',
  'transform_output_blocked',
  'definition_lemma_reader_hint_content_storage_blocked',
  'answer_eligibility_blocked',
  'route_writes_blocked',
  'public_runtime_mutation_blocked',
  'export_blocked',
  'accepted_text_blocked',
  'publication_readiness_blocked',
  'release_action_blocked',
];
for (const blocker of blockers) {
  expect(packet.exact_blockers_preserved?.includes(blocker), `missing blocker: ${blocker}`);
}

expect(
  packet.agent6_boundary_question?.includes('non-public zero-text candidate-use package planning artifact only'),
  'Agent6 question must scope zero-text package planning only',
);
expect(packet.stop_condition?.includes('Do not mutate public/runtime files'), 'stop condition mismatch');

console.log(
  `Agent10 zero-text candidate-use package boundary packet validation passed. Rows: ${boundary.rows}; occurrences: ${boundary.occurrences}; zero counters: ${zeroFields.length}.`,
);
