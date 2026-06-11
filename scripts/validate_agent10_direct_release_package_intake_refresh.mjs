#!/usr/bin/env node
import fs from 'node:fs';

const artifactPath =
  process.argv[2] || 'reports/agent10-direct-release-package-intake-refresh-2026-06-05.json';

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

expect(artifact.artifact_type === 'agent10_direct_release_package_intake_refresh', 'artifact_type mismatch');
if (
  artifact.status ===
  'agent2_state_integrity_rollup_and_agent4_gate_proof_consumed_no_concrete_next_use_package'
) {
  validateAgent2RollupConsumedNoNextUsePackage(artifact);
  process.exit(0);
}
if (artifact.status === 'agent4_validated_agent10_refresh_n_no_concrete_next_use_package') {
  validateAgent4RefreshNConsumedNoNextUsePackage(artifact);
  process.exit(0);
}
if (
  artifact.status ===
  'agent2_transform_reaudit_boundary_blocker_consumed_no_agent6_packet_until_missing_fields_supplied'
) {
  validateAgent2TransformReauditBlockerConsumed(artifact);
  process.exit(0);
}
if (artifact.status === 'bounded_old_dictionary_coverage_summary_consumed_no_concrete_candidate_use_or_transform_packet') {
  validateBoundedOldDictionaryCoverageSummaryConsumed(artifact);
  process.exit(0);
}

expect(artifact.release_owner === 'Agent 10', 'release_owner must be Agent 10');
expect(artifact.posture === 'direct_release_package_decision_mode', 'posture mismatch');

const run = artifact.local_intake_run || {};
expect(run.contract === 'reports/agent10-spark10-release-package-intake-pipeline-contract-2026-06-04.json', 'contract path mismatch');
expect(run.matrix_json === 'reports/spark10-release-package-intake-matrix-current-2026-06-04.json', 'matrix_json path mismatch');
expect(run.build_result === 'passed', 'build_result must be passed');
expect(run.validate_result === 'passed', 'validate_result must be passed');
expect(run.summary?.inputs_checked === 405, 'inputs_checked must be 405');
expect(run.summary?.missing_required_inputs === 0, 'missing_required_inputs must be 0');
expect(run.summary?.release_relevant_rows === 73, 'release_relevant_rows must be 73');
expect(run.summary?.agent6_handoff_candidates === 0, 'agent6_handoff_candidates must be 0');
expect(run.summary?.public_runtime_mutation_authorized === false, 'public runtime mutation must not be authorized');
expect(run.summary?.answer_definition_release_authorized === false, 'answer/Definition/release must not be authorized');

const rows = artifact.current_release_boundary_state || [];
expect(Array.isArray(rows) && rows.length === 3, 'expected three release boundary state rows');

const byWorkset = new Map(rows.map((row) => [row.package_workset, row]));
const oldDict = byWorkset.get('old_dictionary_morphology_candidate_use');
expect(oldDict, 'missing old_dictionary_morphology_candidate_use row');
expect(oldDict.row_occurrence_counts?.rows === 78, 'old dictionary rows must be 78');
expect(oldDict.row_occurrence_counts?.occurrences === 1461, 'old dictionary occurrences must be 1461');
expect(oldDict.lane_split?.commercial_clean_candidate === 78, 'old dictionary commercial-clean rows must be 78');
expect(oldDict.lane_split?.noncommercial_educational_candidate === 0, 'old dictionary NC rows must be 0');
expect(oldDict.agent6_boundary_need === 'no_current_route_verdict_consumed', 'old dictionary boundary need mismatch');
expect(
  oldDict.exact_blocker === 'await_agent2_exact_nonpublic_candidate_use_package_or_exact_blocker_for_78_old_dictionary_rows',
  'old dictionary exact blocker mismatch'
);

const sourceFamily = byWorkset.get('workbench_source_family_license_lane_release_intake');
expect(sourceFamily, 'missing workbench source-family release-intake row');
expect(sourceFamily.row_occurrence_counts?.release_intake_rows === 4, 'release intake rows must be 4');
expect(sourceFamily.row_occurrence_counts?.source_name_partition_count === 351, 'source_name_partition_count must be 351');
expect(sourceFamily.row_occurrence_counts?.source_row_count === 105747, 'source_row_count must be 105747');
expect(
  sourceFamily.agent6_boundary_need === 'already_delivered_await_verdict_or_exact_blocker',
  'source-family boundary need mismatch'
);
expect(
  sourceFamily.exact_blocker === 'await_agent6_verdict_for_workbench_source_family_license_lane_release_intake',
  'source-family exact blocker mismatch'
);

const usage = byWorkset.get('definition_workbench_usage_navigation_cc_by_cc_by_sa_custody_packets');
expect(usage, 'missing definition workbench usage row');
expect(usage.row_occurrence_counts?.usage_concordance_rows === 2390, 'usage concordance rows must be 2390');
expect(usage.row_occurrence_counts?.occurrence_link_rows === 49, 'occurrence link rows must be 49');
expect(usage.row_occurrence_counts?.cc_by_sa_source_rows === 5581, 'CC-BY-SA source rows must be 5581');
expect(usage.row_occurrence_counts?.cc_by_source_rows === 625, 'CC-BY source rows must be 625');
expect(
  usage.agent6_boundary_need === 'already_delivered_await_verdict_or_exact_blocker',
  'usage boundary need mismatch'
);
expect(
  usage.exact_blocker === 'await_agent6_verdict_for_definition_workbench_usage_navigation_cc_by_sa_cc_by_packets',
  'usage exact blocker mismatch'
);

for (const [key, expected] of [
  ['public_runtime_mutation', 0],
  ['route_shard_writes', 0],
  ['route_jsonl_rows', 0],
  ['candidate_text_export_rows', 0],
  ['definition_content_rows', 0],
  ['answer_rows', 0],
  ['answer_eligible_rows', 0],
  ['accepted_text_rows', 0],
  ['public_reader_output_rows', 0],
  ['release_actions', 0],
]) {
  expect(artifact.zero_counters?.[key] === expected, `zero counter ${key} must be ${expected}`);
}

for (const forbidden of [
  'QA acceptance',
  'source/provenance acceptance',
  'license/legal acceptance',
  'Definition authority',
  'usage-as-definition authority',
  'answer acceptance',
  'answer eligibility',
  'public/runtime acceptance',
  'publication readiness',
  'route publication support',
  'product/data acceptance',
  'translation output',
  'accepted gloss/text',
  'public reader output',
  'route-shard edit',
  'public/runtime mutation',
  'candidate text export',
  'definition-content storage',
  'commercial export authorization',
  'NC commercial authorization',
  'release action',
]) {
  expect((artifact.forbidden_claims || []).includes(forbidden), `missing forbidden claim: ${forbidden}`);
}

console.log(
  `Agent10 direct release/package intake refresh validation passed. ` +
    `Inputs: ${run.summary.inputs_checked}; release rows: ${run.summary.release_relevant_rows}; Agent6 candidates: ${run.summary.agent6_handoff_candidates}.`
);

function validateAgent2RollupConsumedNoNextUsePackage(artifact) {
  expect(artifact.owner === 'agent10_release_package_intake', 'owner must be agent10_release_package_intake');
  expect(
    artifact.consumed_state?.agent2_state_integrity_rollup ===
      'reports/agent2-state-integrity-rollup-2026-06-05.json',
    'Agent2 state integrity rollup path mismatch'
  );
  expect(
    artifact.consumed_state?.agent4_gate_proof ===
      'reports/agent4-agent2-state-integrity-rollup-gate-proof-2026-06-05.json',
    'Agent4 gate proof path mismatch'
  );

  const rollup = artifact.rollup_consumed || {};
  expect(rollup.status === 'state_chain_validated_zero_output_boundaries_preserved', 'rollup status mismatch');
  expect(rollup.artifacts_checked === 19, 'artifacts_checked must be 19');
  expect(rollup.unique_blockers === 54, 'unique_blockers must be 54');
  expect(rollup.duplicate_blockers === 0, 'duplicate_blockers must be 0');
  expect(rollup.source_family_rows === 5, 'source_family_rows must be 5');
  expect(rollup.commercial_clean_source_families === 3, 'commercial clean source families must be 3');
  expect(rollup.noncommercial_educational_source_families === 1, 'NC source families must be 1');
  expect(rollup.blocked_or_review_source_families === 1, 'blocked/review source families must be 1');
  expect(rollup.morphology_matrix_rows === 297, 'morphology matrix rows must be 297');
  expect(rollup.morphology_planning_rows === 78, 'morphology planning rows must be 78');
  expect(rollup.morphology_candidate_use_package_rows === 78, 'candidate-use package rows must be 78');
  expect(rollup.morphology_candidate_use_package_occurrences === 1461, 'candidate-use package occurrences must be 1461');
  expect(rollup.exact_row_subset_manifest_rows === 500, 'exact row-subset manifest rows must be 500');
  expect(rollup.source_family_membership_unique_rows === 500, 'source-family membership rows must be 500');
  expect(rollup.source_family_membership_nonexclusive_rows === 936, 'source-family nonexclusive rows must be 936');
  expect(rollup.row_overlap_audited_rows === 500, 'row-overlap audited rows must be 500');
  expect(rollup.row_overlap_boundary_questions === 8, 'row-overlap boundary questions must be 8');
  expect(rollup.agent1_boundary_question_rows === 6, 'Agent1 boundary-question rows must be 6');
  expect(rollup.klein_nc_lane_preservation_rows === 214, 'Klein NC rows must be 214');
  expect(rollup.klein_nc_lane_preservation_occurrences === 4444, 'Klein NC occurrences must be 4444');
  expect(rollup.orot_205_rows === 205, 'Orot rows must be 205');
  expect(rollup.token_source_aggregate_edge_rows === 1951013, 'token-source aggregate edges must be 1951013');

  const gateProof = artifact.agent4_gate_proof_consumed || {};
  expect(
    gateProof.changed_package_input === 'reports/agent2-state-integrity-rollup-2026-06-05.json',
    'gate proof changed_package_input mismatch'
  );
  expect(
    gateProof.validator_command ===
      'node scripts\\validate_agent2_state_integrity_rollup.mjs reports\\agent2-state-integrity-rollup-2026-06-05.json',
    'gate proof validator command mismatch'
  );
  expect(gateProof.validator_result === 'passed', 'gate proof validator result must be passed');
  expect(
    gateProof.blocker_if_any ===
      'no_concrete_next_use_package_exact_agent6_boundary_required_before_candidate_use_transform_output_answer_route_runtime_export_accepted_text_or_release',
    'gate proof blocker mismatch'
  );

  const blocker = artifact.current_exact_blocker || {};
  expect(
    blocker.blocker ===
      'no_concrete_next_use_package_exact_agent6_boundary_required_before_candidate_use_transform_output_answer_route_runtime_export_accepted_text_or_release',
    'current exact blocker mismatch'
  );
  expect(
    blocker.agent6_boundary_need_now === 'none_until_concrete_changed_release_relevant_output_exists',
    'Agent6 boundary need mismatch'
  );

  const sourceLane = artifact.source_lane_preservation || {};
  expect(sourceLane.commercial_clean_and_nc_separated === true, 'commercial/NC separation must be true');
  expect(sourceLane.nc_derived_from_nc === true, 'NC derived_from_nc must be true');
  expect(sourceLane.nc_commercial_export_allowed === false, 'NC commercial export must be false');
  expect(sourceLane.nc_attribution_required === true, 'NC attribution must be true');

  for (const [key, value] of Object.entries(artifact.global_zero_counters || {})) {
    expect(value === 0, `global_zero_counters.${key} must be 0`);
  }

  for (const forbidden of [
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
    'candidate-use authorization',
    'candidate text export',
    'definition/lemma/reader-hint content storage',
    'commercial export authorization',
    'NC commercial authorization',
    'release action',
    'destructive repo cleanup',
  ]) {
    expect((artifact.what_must_not_be_accepted || []).includes(forbidden), `missing forbidden claim: ${forbidden}`);
  }

  console.log(
    `Agent10 direct release/package intake refresh validation passed. ` +
      `Rollup artifacts: ${rollup.artifacts_checked}; unique blockers: ${rollup.unique_blockers}; next-use package: none.`
  );
}

function validateAgent4RefreshNConsumedNoNextUsePackage(artifact) {
  expect(artifact.owner === 'agent10_release_package_intake', 'owner must be agent10_release_package_intake');
  expect(
    artifact.consumed_state?.previous_agent10_refresh ===
      'reports/agent10-direct-release-package-intake-refresh-2026-06-05n.json',
    'previous Agent10 refresh path mismatch'
  );
  expect(
    artifact.consumed_state?.agent4_gate_proof ===
      'reports/agent4-agent10-release-intake-refresh-n-gate-proof-2026-06-05.json',
    'Agent4 refresh-n gate proof path mismatch'
  );
  expect(
    artifact.consumed_state?.agent2_state_integrity_rollup ===
      'reports/agent2-state-integrity-rollup-2026-06-05.json',
    'Agent2 state integrity rollup path mismatch'
  );
  expect(
    artifact.consumed_state?.agent4_rollup_gate_proof ===
      'reports/agent4-agent2-state-integrity-rollup-gate-proof-2026-06-05.json',
    'Agent4 rollup gate proof path mismatch'
  );

  const proof = artifact.gate_proof_consumed || {};
  expect(proof.target === 'agent10-direct-release-package-intake-refresh-n', 'gate proof target mismatch');
  expect(
    proof.changed_package_input === 'reports/agent10-direct-release-package-intake-refresh-2026-06-05n.json',
    'gate proof changed_package_input mismatch'
  );
  for (const command of [
    'node scripts\\validate_agent10_direct_release_package_intake_refresh.mjs reports\\agent10-direct-release-package-intake-refresh-2026-06-05n.json',
    'node --check scripts\\validate_agent10_direct_release_package_intake_refresh.mjs',
  ]) {
    expect((proof.commands_passed || []).includes(command), `missing proof command: ${command}`);
  }
  expect(proof.rollup_artifacts_checked === 19, 'rollup artifacts checked must be 19');
  expect(proof.unique_blockers === 54, 'unique blockers must be 54');
  expect(proof.duplicate_blockers === 0, 'duplicate blockers must be 0');
  expect(proof.morphology_planning_rows === 78, 'morphology planning rows must be 78');
  expect(proof.morphology_candidate_use_package_rows === 78, 'candidate-use package rows must be 78');
  expect(proof.morphology_candidate_use_package_occurrences === 1461, 'candidate-use package occurrences must be 1461');
  expect(proof.exact_row_subset_manifest_rows === 500, 'exact row-subset manifest rows must be 500');
  expect(proof.row_overlap_audited_rows === 500, 'row-overlap audited rows must be 500');
  expect(proof.klein_nc_lane_preservation_rows === 214, 'Klein NC lane preservation rows must be 214');
  expect(proof.orot_205_rows === 205, 'Orot rows must be 205');
  expect(proof.token_source_aggregate_edge_rows === 1951013, 'token-source aggregate edges must be 1951013');

  const blocker = artifact.current_exact_blocker || {};
  expect(
    blocker.blocker ===
      'no_concrete_next_use_package_exact_agent6_boundary_required_before_candidate_use_transform_output_answer_route_runtime_export_accepted_text_or_release',
    'current exact blocker mismatch'
  );
  expect(
    blocker.agent6_boundary_need_now === 'none_until_concrete_changed_release_relevant_output_exists',
    'Agent6 boundary need mismatch'
  );
  expect(
    blocker.next_handoff ===
      'Agent 10 waits for concrete changed release-relevant output with exact rows, intended use, source lanes, validators, and zero counters.',
    'next handoff mismatch'
  );

  for (const [key, value] of Object.entries(artifact.global_zero_counters || {})) {
    expect(value === 0, `global_zero_counters.${key} must be 0`);
  }

  for (const forbidden of [
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
    'candidate-use authorization',
    'candidate text export',
    'definition/lemma/reader-hint content storage',
    'commercial export authorization',
    'NC commercial authorization',
    'release action',
    'destructive repo cleanup',
  ]) {
    expect((artifact.what_must_not_be_accepted || []).includes(forbidden), `missing forbidden claim: ${forbidden}`);
  }

  console.log(
    `Agent10 direct release/package intake refresh validation passed. ` +
      `Consumed proof: refresh n; unique blockers: ${proof.unique_blockers}; next-use package: none.`
  );
}

function validateAgent2TransformReauditBlockerConsumed(artifact) {
  expect(artifact.owner === 'agent10_release_package_intake', 'owner must be agent10_release_package_intake');
  expect(
    artifact.consumed_state?.previous_agent10_refresh ===
      'reports/agent10-direct-release-package-intake-refresh-2026-06-05p.json',
    'previous Agent10 refresh path mismatch'
  );
  expect(
    artifact.consumed_state?.agent2_transform_reaudit_boundary_blocker ===
      'reports/agent2-old-dictionary-transform-reaudit-boundary-blocker-2026-06-05.json',
    'Agent2 transform blocker path mismatch'
  );
  expect(
    artifact.consumed_state?.agent4_gate_proof ===
      'reports/agent4-agent2-transform-reaudit-boundary-blocker-gate-proof-2026-06-05.json',
    'Agent4 transform blocker gate proof path mismatch'
  );

  const consumed = artifact.blocker_consumed || {};
  expect(
    consumed.target === 'Agent 2 definition/lemma/reader-hint transform after Agent 1 classified lanes (old-dictionary reaudit)',
    'consumed blocker target mismatch'
  );
  expect(consumed.status === 'blocked_for_missing_exact_agent1_agent6_boundary_fields', 'consumed blocker status mismatch');
  expect(consumed.row_subset_blockers === 5, 'row_subset_blockers must be 5');
  expect(consumed.required_agent1_input_fields === 16, 'required Agent1 input fields must be 16');
  expect(consumed.required_agent6_boundary_fields === 6, 'required Agent6 boundary fields must be 6');
  expect(consumed.commercial_clean_candidate_row_subsets === 3, 'commercial row-subsets must be 3');
  expect(consumed.noncommercial_educational_candidate_row_subsets === 1, 'NC row-subsets must be 1');
  expect(consumed.blocked_or_needs_review_row_subsets === 1, 'blocked/review row-subsets must be 1');
  expect(
    consumed.validator_command ===
      'node scripts\\validate_agent2_old_dictionary_transform_reaudit_boundary_blocker.mjs reports\\agent2-old-dictionary-transform-reaudit-boundary-blocker-2026-06-05.json',
    'consumed blocker validator command mismatch'
  );
  expect(consumed.validator_result === 'passed', 'consumed blocker validator result must be passed');

  const rows = artifact.row_subset_blockers || [];
  expect(rows.length === 5, 'expected five row subset blockers');
  const byId = new Map(rows.map((row) => [row.row_subset_id, row]));
  for (const [id, sourceFamily] of [
    ['old-dictionary-excluded-row-license-lane-reaudit::bdb-dictionary', 'BDB Dictionary'],
    ['old-dictionary-excluded-row-license-lane-reaudit::bdb-aramaic-dictionary', 'BDB Aramaic Dictionary'],
    ['old-dictionary-excluded-row-license-lane-reaudit::jastrow-dictionary', 'Jastrow Dictionary'],
  ]) {
    const row = byId.get(id);
    expect(row, `missing row subset: ${id}`);
    expect(row.source_family === sourceFamily, `${id} source family mismatch`);
    expect(row.license_lane === 'commercial_clean_candidate', `${id} license lane mismatch`);
    expect(row.blocker === 'missing_exact_agent6_boundary_and_approved_morphology_relation', `${id} blocker mismatch`);
    expect(row.handoff_owner === 'Agent 10 for package assembly; Agent 6 for exact row/subset boundary', `${id} handoff owner mismatch`);
  }

  const klein = byId.get('old-dictionary-excluded-row-license-lane-reaudit::klein-dictionary');
  expect(klein, 'missing Klein row subset');
  expect(klein.source_family === 'Klein Dictionary', 'Klein source family mismatch');
  expect(klein.license_lane === 'noncommercial_educational_candidate', 'Klein license lane mismatch');
  expect(
    klein.blocker === 'missing_exact_agent6_nc_boundary_no_commercial_export_authorization_and_public_boundary_before_display_storage_public_answer_export_behavior',
    'Klein blocker mismatch'
  );
  expect(klein.handoff_owner === 'Agent 1 for NC lane packet; Agent 6 for exact NC row/subset boundary', 'Klein handoff owner mismatch');

  const augmented = byId.get('old-dictionary-excluded-row-license-lane-reaudit::bdb-augmented-strong');
  expect(augmented, 'missing BDB Augmented Strong row subset');
  expect(augmented.source_family === 'BDB Augmented Strong', 'BDB Augmented Strong source family mismatch');
  expect(augmented.license_lane === 'blocked_or_needs_review', 'BDB Augmented Strong license lane mismatch');
  expect(augmented.blocker === 'missing_independent_source_license_custody_basis', 'BDB Augmented Strong blocker mismatch');
  expect(augmented.handoff_owner === 'Agent 1 if evidence appears; otherwise blocked/review', 'BDB Augmented Strong handoff owner mismatch');

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
    expect((artifact.required_agent1_input_fields || []).includes(field), `missing required Agent1 field: ${field}`);
  }
  for (const field of [
    'exact_row_or_row_subset_id',
    'agent6_boundary_verdict',
    'agent6_morphology_relation_status',
    'morphology_relation_basis',
    'candidate_use_scope',
    'exact_agent6_manifest_or_packet_path',
  ]) {
    expect((artifact.required_agent6_boundary_fields || []).includes(field), `missing required Agent6 field: ${field}`);
  }

  const blocker = artifact.current_exact_blocker || {};
  expect(
    blocker.blocker === 'missing_exact_agent1_agent6_boundary_fields_for_old_dictionary_transform_reaudit_row_subsets',
    'current exact blocker mismatch'
  );
  expect(
    blocker.agent6_boundary_need_now === 'not_ready_until_exact_row_subset_fields_and_morphology_relation_boundary_are_supplied',
    'Agent6 boundary need mismatch'
  );

  for (const [key, value] of Object.entries(artifact.global_zero_counters || {})) {
    expect(value === 0, `global_zero_counters.${key} must be 0`);
  }

  for (const forbidden of [
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
  ]) {
    expect((artifact.what_must_not_be_accepted || []).includes(forbidden), `missing forbidden claim: ${forbidden}`);
  }

  console.log(
    `Agent10 direct release/package intake refresh validation passed. ` +
      `Consumed blocker row-subsets: ${consumed.row_subset_blockers}; Agent6-ready packet: no.`
  );
}

function validateBoundedOldDictionaryCoverageSummaryConsumed(artifact) {
  expect(artifact.owner === 'agent10_release_package_intake', 'owner must be agent10_release_package_intake');
  expect(artifact.active_mode === 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE', 'active mode mismatch');

  const consumed = artifact.consumed_state || {};
  for (const [key, path] of [
    ['coverage_summary_json', 'reports/agent10-old-dictionary-commercial-clean-source-family-morphology-coverage-summary-current.json'],
    ['coverage_summary_md', 'reports/agent10-old-dictionary-commercial-clean-source-family-morphology-coverage-summary-current.md'],
    ['coverage_summary_builder', 'scripts/build_agent10_old_dictionary_coverage_summary.mjs'],
    ['coverage_summary_validator', 'scripts/validate_agent10_old_dictionary_coverage_summary.mjs'],
    ['prior_final_reconciliation', 'reports/agent10-old-dictionary-commercial-clean-source-family-morphology-coverage-reconciliation-final-2026-06-05.json'],
  ]) {
    expect(consumed[key] === path, `consumed_state.${key} mismatch`);
    expect(fs.existsSync(path), `referenced path missing: ${path}`);
  }

  const bounded = artifact.bounded_check || {};
  expect(bounded.timeout === '20000ms', 'bounded_check timeout mismatch');
  expect(
    bounded.result === 'passed_no_new_agent1_6_or_agent10_release_relevant_artifact',
    'bounded_check result mismatch',
  );
  expect(bounded.partial_output_or_artifact === 'empty result set', 'bounded_check partial output mismatch');

  const coverage = artifact.current_coverage || {};
  expect(coverage.commercial_clean_source_families === 3, 'commercial clean source family count mismatch');
  const subsets = coverage.commercial_clean_subsets || [];
  expect(subsets.length === 3, 'expected three commercial-clean subsets');
  const expectedSubsets = new Map([
    ['Jastrow Dictionary', { rows: 210, occurrences: 4474 }],
    ['BDB Dictionary', { rows: 221, occurrences: 4418 }],
    ['BDB Aramaic Dictionary', { rows: 69, occurrences: 2048 }],
  ]);
  for (const row of subsets) {
    const expected = expectedSubsets.get(row.source_family);
    expect(Boolean(expected), `unexpected source family ${row.source_family}`);
    if (expected) {
      expect(row.rows === expected.rows, `${row.source_family} rows mismatch`);
      expect(row.occurrences === expected.occurrences, `${row.source_family} occurrences mismatch`);
    }
    expect(row.transform_allowed_now === false, `${row.source_family} transform_allowed_now must be false`);
  }

  expect(coverage.prior_agent6_morphology_planning?.rows === 78, 'prior morphology planning rows mismatch');
  expect(coverage.prior_agent6_morphology_planning?.occurrences === 1461, 'prior morphology planning occurrences mismatch');
  expect(
    coverage.prior_agent6_morphology_planning?.disposition ===
      'warn_accepted_nonpublic_morphology_planning_evidence_only',
    'prior morphology planning disposition mismatch',
  );
  expect(coverage.prior_agent6_source_family_overlap?.rows === 500, 'prior source family overlap rows mismatch');
  expect(coverage.prior_agent6_source_family_overlap?.occurrences === 8427, 'prior source family overlap occurrences mismatch');
  expect(coverage.prior_agent6_source_family_overlap?.exact_blockers === 23, 'prior source family overlap blockers mismatch');
  expect(coverage.prior_agent6_exact_row_subset_manifest?.rows === 500, 'prior exact row subset rows mismatch');
  expect(coverage.prior_agent6_exact_row_subset_manifest?.occurrences === 8427, 'prior exact row subset occurrences mismatch');
  expect(coverage.prior_agent6_exact_row_subset_manifest?.unique_token_ids === 500, 'prior exact row subset token IDs mismatch');
  expect(coverage.prior_agent6_exact_row_subset_manifest?.unique_queue_ids === 500, 'prior exact row subset queue IDs mismatch');

  const boundaryQuestions = artifact.agent6_boundary_questions || [];
  expect(boundaryQuestions.length === 1, 'expected one Agent6 boundary question placeholder');
  const question = boundaryQuestions[0] || {};
  expect(question.status === 'not_ready', 'Agent6 boundary question must be not_ready');
  for (const missing of [
    'specific selected row/subset queue_ids and token_ids',
    'intended use',
    'candidate text/output fields if any, or explicit zero text/output',
    'source-family selection/exclusion rule for overlap buckets',
    'morphology relation basis and Agent 2 status',
    'zero route/public/runtime/export/answer/release counters',
  ]) {
    expect(question.missing_before_routing?.includes(missing), `Agent6 boundary question missing ${missing}`);
  }

  expect(
    artifact.exact_blocker === 'candidate_use_or_transform_intent_not_supplied_for_specific_subset',
    'exact blocker mismatch',
  );
  expect(
    artifact.next_owner === 'Agent 10 after concrete candidate-use or transform intent exists; Agent 6 only for that exact later packet.',
    'next owner mismatch',
  );

  for (const [key, value] of Object.entries(artifact.global_zero_counters || {})) {
    expect(value === 0, `global_zero_counters.${key} must be 0`);
  }

  for (const forbidden of [
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
  ]) {
    expect((artifact.what_must_not_be_accepted || []).includes(forbidden), `missing forbidden claim: ${forbidden}`);
  }

  expect(artifact.stop_condition?.includes('Do not route Agent 6'), 'stop condition must block Agent6 routing');
  expect(artifact.stop_condition?.includes('mutate public/runtime'), 'stop condition must block runtime mutation');
  expect(artifact.stop_condition?.includes('release'), 'stop condition must block release');

  console.log(
    `Agent10 bounded old-dictionary coverage-summary intake validation passed. ` +
      `Commercial-clean subsets: ${coverage.commercial_clean_source_families}; blocker: ${artifact.exact_blocker}.`,
  );
}
