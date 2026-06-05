#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath =
  process.argv[2] || 'reports/agent3-spark10-release-intake-current-observer-package-2026-06-04.json';
const artifact = readJson(artifactPath);
const issues = [];
const warnings = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_spark10_release_intake_current_observer_package',
  'artifact_type mismatch',
);
expect(
  artifact.status === 'current_spark10_release_intake_observed_no_agent3_authority_or_mutation',
  'status mismatch',
);
expect(artifact.publication_state === 'blocked_no_render', 'publication_state must be blocked_no_render');
expect(artifact.lane_owner === 'Agent 3', 'lane_owner must be Agent 3');

const reviewedInputs = artifact.reviewed_inputs || [];
expect(reviewedInputs.length === artifact.files.input_files.length, 'reviewed input count mismatch');
for (const input of reviewedInputs) {
  expect(Boolean(input.role), `reviewed input missing role for ${input.path}`);
  expect(Boolean(input.path), `reviewed input missing path for ${input.role}`);
  expect(exists(input.path), `reviewed input missing on disk: ${input.path}`);
  expect(/^[a-f0-9]{64}$/.test(input.sha256 || ''), `reviewed input hash invalid: ${input.path}`);
  expect(Number.isInteger(input.bytes) && input.bytes > 0, `reviewed input bytes invalid: ${input.path}`);
  if (exists(input.path) && input.sha256 !== sha256(input.path)) {
    warnings.push(`input changed after observer build: ${input.path}`);
  }
}

expect(artifact.matrix_snapshot?.artifact_type === 'spark10_release_package_intake_matrix', 'matrix artifact_type mismatch');
expect(Boolean(artifact.matrix_snapshot?.path), 'matrix path missing');
expect(artifact.contract_observed?.artifact_type === 'spark10_release_package_intake_pipeline_contract', 'contract artifact_type mismatch');
expect(artifact.downstream_observed?.agent10_hybrid_blocker_consumption?.status === 'spark10_hybrid_shadow_consumed_exact_blockers_recorded', 'hybrid blocker status mismatch');
expect(artifact.downstream_observed?.agent10_deuteronomy_supplemental_receipt?.status === 'agent6_warn_accepted_supplemental_provenance_evidence_only', 'Deuteronomy supplemental status mismatch');
expect(artifact.downstream_observed?.agent10_usage_navigation_consumption?.artifact_type !== 'definition_authority', 'usage navigation must not be definition authority');

validateInternalCounts();
validateBoundaries();
validateZeroOutputs();
validateNoForbiddenAuthority();
validateCurrentInputsWhenUnchanged();

if (issues.length > 0) {
  console.error(`Agent 3 Spark-10 current observer validation failed (${issues.length} issue(s))`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 3 Spark-10 current observer validation passed');
console.log(
  JSON.stringify(
    {
      artifact: artifactPath,
      matrix_rows: artifact.schema_counts.spark10_matrix_rows,
      agent3_rows_observed: artifact.schema_counts.agent3_rows_observed,
      spark3_rows_observed: artifact.schema_counts.spark3_rows_observed,
      total_handoff_candidate_rows: artifact.schema_counts.total_handoff_candidate_rows,
      agent3_handoff_candidate_rows: artifact.schema_counts.agent3_handoff_candidate_rows,
      deuteronomy_rows_occurrences: [
        artifact.schema_counts.deuteronomy_agent3_matrix_rows,
        artifact.schema_counts.deuteronomy_agent3_matrix_occurrences,
      ],
      usage_rows_links: [
        artifact.schema_counts.usage_concordance_rows,
        artifact.schema_counts.usage_occurrence_link_rows,
      ],
      zero_authority_outputs: true,
      warnings,
    },
    null,
    2,
  ),
);

function validateInternalCounts() {
  const snapshot = artifact.matrix_snapshot || {};
  const counts = artifact.schema_counts || {};
  const agent3Rows = snapshot.agent3_rows || [];
  const spark3Rows = snapshot.spark3_rows || [];
  const handoffRows = snapshot.handoff_candidate_rows || [];

  expect(counts.spark10_inputs_checked === number(snapshot.summary?.inputs_checked), 'spark10_inputs_checked mismatch');
  expect(counts.spark10_missing_required_inputs === number(snapshot.summary?.missing_required_inputs), 'spark10_missing_required_inputs mismatch');
  expect(counts.spark10_release_relevant_rows === number(snapshot.summary?.release_relevant_rows), 'spark10_release_relevant_rows mismatch');
  expect(counts.spark10_agent6_handoff_candidates === number(snapshot.summary?.agent6_handoff_candidates), 'spark10_agent6_handoff_candidates mismatch');
  expect(counts.spark10_matrix_rows === snapshot.row_count, 'spark10_matrix_rows mismatch');
  expect(counts.agent3_rows_observed === agent3Rows.length, 'agent3_rows_observed mismatch');
  expect(counts.spark3_rows_observed === spark3Rows.length, 'spark3_rows_observed mismatch');
  expect(counts.total_handoff_candidate_rows === handoffRows.length, 'total_handoff_candidate_rows mismatch');
  expect(
    counts.agent3_handoff_candidate_rows === agent3Rows.filter((row) => row.agent6_handoff_candidate === true).length,
    'agent3_handoff_candidate_rows mismatch',
  );
  expect(counts.agent3_rows_with_missing_inputs === agent3Rows.filter((row) => row.exists === false).length, 'agent3 missing-input count mismatch');
  expect(counts.agent3_rows_with_public_or_mutation_action === 0, 'Agent 3 rows must not carry public/mutation action');

  expect(counts.spark10_missing_required_inputs === 0, 'Spark-10 missing required inputs must be 0');
  expect(counts.spark10_matrix_rows > 0, 'Spark-10 matrix rows must be nonzero');
  expect(counts.agent3_rows_observed > 0, 'Agent 3 rows observed must be nonzero');
  expect(counts.spark3_rows_observed > 0, 'Spark-3 rows observed must be nonzero');
  expect(counts.spark10_agent6_handoff_candidates === counts.total_handoff_candidate_rows, 'handoff candidate count should match Spark-10 summary');
  expect(counts.agent10_consumption_anchor_rows === 332, 'Agent 10 anchor rows must remain 332');
  expect(counts.agent10_consumption_anchor_occurrences === 6156, 'Agent 10 anchor occurrences must remain 6156');
  expect(counts.agent10_consumption_orot_linkage_blocker_rows === 168, 'Orot linkage blocker rows must remain 168');
  expect(counts.agent10_consumption_orot_linkage_blocker_occurrences === 2117, 'Orot linkage blocker occurrences must remain 2117');
  expect(counts.hybrid_exact_blockers === 4, 'hybrid exact blocker count must be 4');
  expect(counts.deuteronomy_agent3_matrix_rows === 8113, 'Deuteronomy Agent 3 matrix rows mismatch');
  expect(counts.deuteronomy_agent3_matrix_occurrences === 12595, 'Deuteronomy Agent 3 matrix occurrences mismatch');
  expect(counts.deuteronomy_exact_blocker_rows === 6779, 'Deuteronomy exact blocker rows mismatch');
  expect(counts.deuteronomy_exact_blocker_occurrences === 9631, 'Deuteronomy exact blocker occurrences mismatch');
  expect(counts.deuteronomy_downstream_boundary_rows === 1334, 'Deuteronomy downstream boundary rows mismatch');
  expect(counts.deuteronomy_downstream_boundary_occurrences === 2964, 'Deuteronomy downstream boundary occurrences mismatch');
  expect(counts.deuteronomy_duplicate_key_collision_groups === 0, 'duplicate key collision groups must be 0');
  expect(counts.usage_concordance_rows === 2390, 'usage concordance rows mismatch');
  expect(counts.usage_supported_rows === 339, 'usage supported rows mismatch');
  expect(counts.usage_candidate_rows === 1351, 'usage candidate rows mismatch');
  expect(counts.usage_weak_rows === 700, 'usage weak rows mismatch');
  expect(counts.usage_audit_only_ambiguous_rows === 2064, 'usage audit-only ambiguous rows mismatch');
  expect(counts.usage_occurrence_link_rows === 49, 'usage occurrence link rows mismatch');
  expect(counts.usage_route_resolution_unresolved_route_ids === 0, 'usage unresolved route ids must be 0');
  expect(counts.usage_reader_facing_rows === 0, 'usage reader-facing rows must be 0');
  expect(counts.usage_forbidden_authority_field_hits === 0, 'usage forbidden authority hits must be 0');
  expect(
    counts.usage_public_runtime_output_answer_definition_accepted_text_emissions === 0,
    'usage public/runtime/answer/definition/accepted-text emissions must be 0',
  );
  expect(counts.active_handoff_total_rows === 8282, 'active handoff total rows mismatch');
  expect(counts.active_handoff_total_occurrences === 14743, 'active handoff total occurrences mismatch');
  expect(counts.active_handoff_blocker_rows === 6947, 'active handoff blocker rows mismatch');
  expect(counts.active_handoff_blocker_occurrences === 11748, 'active handoff blocker occurrences mismatch');
  expect(counts.post_custody_agent3_runnable_queue_items === 0, 'post-custody runnable queue items must be 0');
  expect(counts.post_custody_exact_new_worksets_found === 0, 'post-custody exact new worksets must be 0');
}

function validateBoundaries() {
  expect(allFalse(artifact.boundary), 'artifact boundary must be all false authorization flags');
  expect(allFalse(artifact.matrix_snapshot?.boundary), 'Spark-10 matrix boundary must be all false');
  expect(allFalse(artifact.contract_observed?.boundary), 'Agent 10 contract boundary must be all false');
  expect(
    artifact.downstream_observed?.agent10_deuteronomy_supplemental_receipt?.boundary?.nonpublic_linkage_dedupe_navigation_provenance_evidence_only === true,
    'Deuteronomy supplemental should remain nonpublic evidence only',
  );
  for (const [field, value] of Object.entries(
    artifact.downstream_observed?.agent10_usage_navigation_consumption?.lane_split || {},
  )) {
    if (
      [
        'definition_authority',
        'semantic_arbitration',
        'route_ranking',
        'hud_or_workbench_ui_acceptance',
        'publication_support',
        'accepted_translation_text',
        'agent6_accepted',
      ].includes(field)
    ) {
      expect(value === false, `usage navigation lane split must keep ${field}=false`);
    }
  }
}

function validateZeroOutputs() {
  for (const key of [
    'source_files_committed_by_this_package',
    'route_shard_writes',
    'runtime_files_changed',
    'source_files_changed',
    'token_index_files_changed',
    'lexical_payload_files_changed',
    'definition_content_rows',
    'answer_rows',
    'accepted_text_rows',
    'public_reader_output_rows',
    'public_runtime_mutations',
  ]) {
    expect(artifact.schema_counts?.[key] === 0, `${key} must be 0`);
  }
  for (const [key, value] of Object.entries(
    artifact.downstream_observed?.agent10_hybrid_blocker_consumption?.zero_output_counts || {},
  )) {
    expect(value === 0, `hybrid zero output ${key} must be 0`);
  }
}

function validateNoForbiddenAuthority() {
  expect(artifact.agent10_consumption_observed?.no_direct_release_action === true, 'Agent 10 no-direct-release action must be observed');
  expect(
    artifact.missing_field_blocker?.blocker === 'missing_changed_agent3_executable_workset_or_release_owner_boundary_request',
    'missing-field blocker mismatch',
  );
  expect(/Agent 10/.test(artifact.handoff_owner || ''), 'handoff owner must remain Agent 10');
  expect(/Stop after current observer package/.test(artifact.stop_condition || ''), 'stop condition mismatch');

  const serialized = JSON.stringify(artifact);
  for (const forbidden of [
    '"definition_authority":true',
    '"usage_as_definition_authority":true',
    '"answer_selection":true',
    '"route_publication_support":true',
    '"public_runtime_mutation":true',
    '"accepted_text":true',
    '"public_reader_output":true',
    'accepted_text_now',
    'definition_text_stored_now',
    'accepted gloss',
  ]) {
    expect(!serialized.includes(forbidden), `forbidden authority payload detected: ${forbidden}`);
  }
}

function validateCurrentInputsWhenUnchanged() {
  const matrixInput = reviewedInputs.find((input) => input.role === 'spark10MatrixJson');
  if (matrixInput && exists(matrixInput.path) && matrixInput.sha256 === sha256(matrixInput.path)) {
    const matrix = readJson(matrixInput.path);
    const rows = matrix.rows || [];
    const agent3Rows = rows.filter((row) => row.lane_owner === 'Agent 3');
    const spark3Rows = rows.filter((row) => row.lane_owner === 'Spark-3' || row.lane_owner === 'Spark 3' || /spark3/i.test(String(row.path || '')));
    const handoffRows = rows.filter((row) =>
      row.agent6_handoff_candidate === true ||
      row.agent6_handoff_needed === true ||
      row.next_agent10_action === 'prepare_or_route_agent6_boundary_only_if_exact_package_exists',
    );
    expect(matrix.artifact_type === artifact.matrix_snapshot.artifact_type, 'current matrix artifact_type mismatch');
    expect(matrix.generated_at === artifact.matrix_snapshot.generated_at, 'current matrix generated_at mismatch');
    expect(rows.length === artifact.schema_counts.spark10_matrix_rows, 'current matrix row count mismatch');
    expect(agent3Rows.length === artifact.schema_counts.agent3_rows_observed, 'current Agent 3 row count mismatch');
    expect(spark3Rows.length === artifact.schema_counts.spark3_rows_observed, 'current Spark-3 row count mismatch');
    expect(handoffRows.length === artifact.schema_counts.total_handoff_candidate_rows, 'current handoff row count mismatch');
  } else {
    warnings.push('current Spark-10 matrix changed after package build; validated package-time snapshot only');
  }
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(resolve(relativePath), 'utf8'));
}

function exists(relativePath) {
  return fs.existsSync(resolve(relativePath));
}

function resolve(relativePath) {
  return path.resolve(root, relativePath);
}

function sha256(relativePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(resolve(relativePath))).digest('hex');
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}

function number(value) {
  return Number(value || 0);
}

function allFalse(value) {
  return Boolean(value) && Object.values(value).every((entry) => entry === false);
}
