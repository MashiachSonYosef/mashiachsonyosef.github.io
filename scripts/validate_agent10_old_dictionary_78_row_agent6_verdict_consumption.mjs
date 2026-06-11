#!/usr/bin/env node
import fs from 'node:fs';

const artifactPath =
  process.argv[2] || 'reports/agent10-old-dictionary-78-row-agent6-verdict-consumption-2026-06-06.json';

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

const artifact = readJson(artifactPath);

expect(
  artifact.artifact_type === 'agent10_old_dictionary_78_row_agent6_verdict_consumption',
  'artifact_type mismatch',
);
expect(
  artifact.target_package === 'old-dictionary-commercial-clean-78-row-candidate-use-preboundary-review',
  'target_package mismatch',
);
expect(
  artifact.status === 'agent6_warn_accepted_preboundary_matrix_consumed_no_transform_or_output_authorized',
  'status mismatch',
);

const files = artifact.files_used || {};
expect(
  files.agent6_verdict === 'reports/agent6-old-dictionary-78-row-candidate-use-preboundary-verdict-2026-06-06.md',
  'Agent6 verdict md path mismatch',
);
expect(
  files.agent10_packet ===
    'reports/agent10-agent6-ready-old-dictionary-78-row-candidate-use-preboundary-packet-2026-06-06.json',
  'Agent10 packet path mismatch',
);
expect(
  files.preboundary_matrix ===
    'reports/agent10-old-dictionary-78-row-candidate-use-preboundary-matrix-2026-06-06.json',
  'preboundary matrix path mismatch',
);
expect(
  files.matrix_validator === 'scripts/validate_agent10_old_dictionary_78_row_candidate_use_preboundary_matrix.mjs',
  'matrix validator path mismatch',
);
for (const path of Object.values(files)) {
  expect(fs.existsSync(path), `referenced file missing: ${path}`);
}

const verdictJsonPath = 'reports/agent6-old-dictionary-78-row-candidate-use-preboundary-verdict-2026-06-06.json';
expect(fs.existsSync(verdictJsonPath), `referenced verdict JSON missing: ${verdictJsonPath}`);

const verdict = readJson(verdictJsonPath);
const packet = readJson(files.agent10_packet);
const matrix = readJson(files.preboundary_matrix);

expect(
  verdict.artifact_type === 'agent6_old_dictionary_78_row_candidate_use_preboundary_verdict',
  'Agent6 verdict artifact_type mismatch',
);
expect(
  verdict.disposition === 'warn_accepted_nonpublic_candidate_use_preboundary_review_matrix_only',
  'Agent6 verdict disposition mismatch',
);
expect(
  packet.artifact_type === 'agent10_agent6_ready_old_dictionary_78_row_candidate_use_preboundary_packet',
  'Agent10 packet artifact_type mismatch',
);
expect(
  matrix.artifact_type === 'agent10_old_dictionary_78_row_candidate_use_preboundary_matrix',
  'preboundary matrix artifact_type mismatch',
);

const consumed = artifact.agent6_verdict_consumed || {};
expect(consumed.disposition === 'WARN-ACCEPTED', 'consumed disposition mismatch');
expect(consumed.scope === 'non-public candidate-use preboundary review matrix only', 'consumed scope mismatch');
expect(consumed.rows === 78, 'consumed rows must be 78');
expect(consumed.occurrences === 1461, 'consumed occurrences must be 1461');
expect(consumed.relation_class === 'exact_after_mark_strip', 'relation class mismatch');
expect(
  consumed.morphology_relation_status === 'agent2_morphology_relation_approved_for_nonpublic_planning',
  'morphology relation status mismatch',
);

expect(verdict.recounted_scope?.rows === consumed.rows, 'verdict row count mismatch');
expect(verdict.recounted_scope?.occurrences === consumed.occurrences, 'verdict occurrence count mismatch');
expect(packet.boundary_counts?.rows === consumed.rows, 'packet row count mismatch');
expect(packet.boundary_counts?.occurrences === consumed.occurrences, 'packet occurrence count mismatch');
expect(matrix.counts?.rows === consumed.rows, 'matrix row count mismatch');
expect(matrix.counts?.occurrences === consumed.occurrences, 'matrix occurrence count mismatch');

const zeroFields = [
  'candidate_text_rows',
  'definition_lemma_reader_hint_candidate_rows',
  'answer_eligible_rows',
  'public_emit_rows',
  'route_writes',
  'accepted_text_rows',
  'public_runtime_mutation',
];
for (const field of zeroFields) {
  expect(consumed[field] === 0, `agent6_verdict_consumed.${field} must be 0`);
}

const decisions = artifact.release_package_decision || {};
expect(
  decisions.may_carry_forward_as_nonpublic_preboundary_review_evidence === true,
  'must carry forward only as nonpublic preboundary review evidence',
);
for (const field of [
  'candidate_use_package_authorized',
  'candidate_text_authorized',
  'transform_output_authorized',
  'content_storage_authorized',
  'answer_eligibility_authorized',
  'route_write_authorized',
  'public_runtime_mutation_authorized',
  'export_authorized',
  'accepted_text_authorized',
  'publication_readiness_authorized',
  'release_action_authorized',
]) {
  expect(decisions[field] === false, `release_package_decision.${field} must be false`);
}

const lanes = new Map((artifact.agent1_4_inputs_consumed || []).map((row) => [row.lane, row]));
expect(lanes.get('Agent 1')?.input === 'reports/agent1-old-dictionary-agent2-transform-lane-handoff-2026-06-04.json', 'Agent 1 input mismatch');
expect(lanes.get('Agent 2')?.input === 'reports/agent2-old-dictionary-commercial-clean-morphology-relation-matrix-2026-06-05.json', 'Agent 2 input mismatch');
expect(lanes.get('Agent 3')?.input === null, 'Agent 3 input must be null');
expect(lanes.get('Agent 4')?.input === null, 'Agent 4 input must be null');
expect(lanes.get('Agent 6')?.input === files.agent6_verdict, 'Agent 6 input mismatch');

const nextBoundaryNeeds = [
  'candidate-use package rows',
  'candidate text',
  'definition/lemma/reader-hint content storage',
  'answer eligibility',
  'route writes',
  'public/runtime mutation',
  'export behavior',
  'accepted text',
  'publication readiness',
  'release action',
];
for (const item of nextBoundaryNeeds) {
  expect(artifact.next_agent6_boundary_need?.includes(item), `missing next Agent6 boundary need: ${item}`);
}

expect(
  artifact.exact_blocker === 'next_candidate_use_or_transform_output_boundary_not_supplied',
  'exact blocker mismatch',
);

for (const row of artifact.process_timeout_reports || []) {
  expect(row.process_timeout === true, 'timeout row must be flagged true');
  expect(typeof row.command === 'string' && row.command.length > 0, 'timeout row missing command');
  expect(typeof row.timeout === 'string' && row.timeout.length > 0, 'timeout row missing timeout');
  expect(
    typeof row.partial_output_or_artifact === 'string' && row.partial_output_or_artifact.length > 0,
    'timeout row missing partial output/artifact',
  );
  expect(
    typeof row.next_safe_action === 'string' && row.next_safe_action.length > 0,
    'timeout row missing next safe action',
  );
}

expect(
  artifact.next_owner?.includes('Agent 10 remains release/package owner'),
  'next owner must remain Agent 10',
);
expect(
  artifact.stop_condition?.includes('Do not mutate public/runtime files'),
  'stop condition must prohibit public/runtime mutation',
);

const mustNotAccept = [
  'QA acceptance beyond the exact docket',
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
  expect(artifact.what_must_not_be_accepted?.includes(item), `missing non-acceptance item: ${item}`);
}

console.log(
  `Agent10 78-row Agent6 verdict consumption validation passed. Rows: ${consumed.rows}; occurrences: ${consumed.occurrences}; blocker: ${artifact.exact_blocker}.`,
);
