#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-source-license-custody-pipeline-registry-addendum-2026-06-05.json';
const resultPath = 'reports/agent1-source-license-custody-pipeline-registry-addendum-validation-result-2026-06-05.json';

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function exists(relativePath) {
  return fs.existsSync(path.join(repoRoot, relativePath));
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(path.join(repoRoot, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function assert(condition, message, details = null) {
  if (!condition) {
    const error = new Error(message);
    error.details = details;
    throw error;
  }
}

const expectedBaseCounts = {
  lane_return_output_count: 48,
  runnable_contract_count: 22,
  supporting_packet_count: 24,
  exact_blocker_count: 1,
  spark1_routable_contracts: 22,
  non_routable_blockers: 1
};

const requiredLanes = [
  'commercial_clean_candidate',
  'noncommercial_educational_candidate',
  'metadata_or_link_only',
  'blocked_or_needs_review'
];

const requiredRecallableRoles = [
  'agent7_staffing_correction_current_production_goal',
  'agent13_direct_brief_response',
  'old_dictionary_reaudit_continuation',
  'bdb_augmented_strong_source_custody_blocker',
  'downstream_consumption_alignment_audit',
  'agent6_boundary_question_packet',
  'current_lane_return_addendum',
  'bdb_augmented_strong_live_source_custody_reprobe',
  'bdb_augmented_strong_row_linkage_probe',
  'klein_nc_lane_preservation'
];

const noAcceptanceKeys = [
  'no_qa_acceptance',
  'no_source_license_acceptance',
  'no_legal_acceptance',
  'no_definition_authority',
  'no_runtime_public_acceptance',
  'no_publication_readiness',
  'no_product_data_acceptance',
  'no_answer_acceptance',
  'no_accepted_gloss_text',
  'no_nc_commercial_authorization',
  'no_public_runtime_mutation',
  'no_queue_mutation',
  'no_staging',
  'no_destructive_repo_action'
];

try {
  const addendum = readJson(artifactPath);
  const baseRegistry = readJson(addendum.base_registry);
  const baseRegistryResult = readJson(addendum.base_registry_validation_result);
  const basePipelineSetResult = readJson(addendum.base_pipeline_set_validation_result);

  assert(addendum.artifact_type === 'agent1_source_license_custody_pipeline_registry_addendum', 'unexpected artifact_type');
  assert(addendum.status === 'agent1_source_license_custody_registry_addendum_validated_overlay_only', 'unexpected status');
  assert(addendum.current_thread_id === '019e975d-dc9f-7020-a7c8-885d083a837e', 'current Agent 1 thread mismatch');
  assert(addendum.old_agent1_thread_id === '019dc487-5973-7693-aebf-fb0a75936f50', 'old Agent 1 thread mismatch');
  assert(addendum.old_agent1_policy === 'archived_do_not_use', 'old Agent 1 policy mismatch');
  assert(addendum.production_lane === 'Hebrew import/source/license/custody/source-lane evidence', 'production lane mismatch');
  assert(addendum.lane_output?.target === 'old-dictionary-excluded-row-license-lane-reaudit', 'target mismatch');
  assert(addendum.required_output_shape?.staffing_correction === 'production lane | direct active goal | recallable state/proof artifact | exact blocker | stop condition | correction owner', 'staffing correction shape mismatch');
  assert(addendum.required_output_shape?.lane_output === 'target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition', 'lane output shape mismatch');

  assert(baseRegistry.artifact_type === 'agent1_source_license_custody_pipeline_registry', 'base registry artifact type mismatch');
  assert(baseRegistry.status === 'agent1_source_license_custody_pipeline_registry_validated_for_discovery_only', 'base registry status mismatch');
  assert(baseRegistryResult.ok === true, 'base registry validator result not ok');
  assert(basePipelineSetResult.ok === true, 'base pipeline set validator result not ok');
  assert(basePipelineSetResult.no_acceptance_claims === true, 'base pipeline set must preserve no acceptance claims');

  for (const [key, expected] of Object.entries(expectedBaseCounts)) {
    assert(addendum.base_snapshot_counts_preserved?.[key] === expected, `addendum base count mismatch: ${key}`);
    assert(baseRegistry.counts?.[key] === expected, `base registry count mismatch: ${key}`);
  }
  assert(baseRegistryResult.runnable_contract_count === expectedBaseCounts.runnable_contract_count, 'base registry result runnable count mismatch');
  assert(baseRegistryResult.supporting_packet_count === expectedBaseCounts.supporting_packet_count, 'base registry result supporting count mismatch');
  assert(baseRegistryResult.exact_blocker_count === expectedBaseCounts.exact_blocker_count, 'base registry result blocker count mismatch');
  assert(baseRegistryResult.lane_return_output_count === expectedBaseCounts.lane_return_output_count, 'base registry result lane return count mismatch');
  assert(basePipelineSetResult.runnable_contract_count === expectedBaseCounts.runnable_contract_count, 'base pipeline set runnable count mismatch');
  assert(basePipelineSetResult.supporting_packet_count === expectedBaseCounts.supporting_packet_count, 'base pipeline set supporting count mismatch');
  assert(basePipelineSetResult.exact_blocker_count === expectedBaseCounts.exact_blocker_count, 'base pipeline set blocker count mismatch');
  assert(basePipelineSetResult.lane_return_output_count === expectedBaseCounts.lane_return_output_count, 'base pipeline set lane return count mismatch');

  assert((addendum.recallable_artifacts || []).length === addendum.addendum_counts?.recallable_artifact_count, 'recallable artifact count mismatch');
  const recallableRoles = new Set((addendum.recallable_artifacts || []).map((row) => row.role));
  for (const role of requiredRecallableRoles) {
    assert(recallableRoles.has(role), `missing recallable role: ${role}`);
  }
  for (const row of addendum.recallable_artifacts || []) {
    assert(exists(row.artifact), `missing recallable artifact: ${row.artifact}`);
    assert(exists(row.markdown), `missing markdown artifact: ${row.markdown}`);
    if (row.validator) assert(exists(row.validator), `missing validator: ${row.validator}`);
    if (row.builder) assert(exists(row.builder), `missing builder: ${row.builder}`);
    if (row.validator_result) assert(exists(row.validator_result), `missing validator result: ${row.validator_result}`);
  }

  assert((addendum.validator_results_used || []).length === addendum.addendum_counts?.validator_result_count, 'validator result count mismatch');
  const validatorResultArtifacts = new Set((addendum.validator_results_used || []).map((row) => row.artifact));
  assert(validatorResultArtifacts.has('reports/agent1-old-dictionary-downstream-consumption-alignment-audit-validation-result-2026-06-05.json'), 'downstream alignment audit validator result missing');
  assert(validatorResultArtifacts.has('reports/agent1-old-dictionary-agent6-boundary-question-packet-validation-result-2026-06-05.json'), 'Agent 6 boundary-question validator result missing');
  assert(validatorResultArtifacts.has('reports/agent1-current-source-license-custody-lane-return-addendum-validation-result-2026-06-05.json'), 'current lane-return addendum validator result missing');
  assert(validatorResultArtifacts.has('reports/agent1-bdb-augmented-strong-live-source-custody-reprobe-validation-result-2026-06-05.json'), 'BDB Augmented Strong live re-probe validator result missing');
  assert(validatorResultArtifacts.has('reports/agent1-bdb-augmented-strong-row-linkage-probe-validation-result-2026-06-05.json'), 'BDB Augmented Strong row-linkage validator result missing');
  assert(validatorResultArtifacts.has('reports/agent1-old-dictionary-klein-nc-lane-preservation-validation-result-2026-06-05.json'), 'Klein NC lane preservation validator result missing');
  for (const row of addendum.validator_results_used || []) {
    const result = readJson(row.artifact);
    assert(result.ok === true, `validator result not ok: ${row.artifact}`);
    assert(typeof result.completed_at === 'string' && result.completed_at.length > 0, `validator result completed_at missing: ${row.artifact}`);
  }

  const laneRows = addendum.lane_output?.classification_lanes || [];
  assert(laneRows.length === addendum.addendum_counts?.classification_lane_count, 'classification lane count mismatch');
  for (const lane of requiredLanes) {
    assert(laneRows.some((row) => row.license_lane === lane) || addendum.addendum_counts?.[`${lane}_source_families`] === 0, `required lane not represented: ${lane}`);
  }
  const laneCounts = laneRows.reduce((memo, row) => {
    memo[row.license_lane] = (memo[row.license_lane] || 0) + 1;
    return memo;
  }, {});
  assert(laneCounts.commercial_clean_candidate === 3, 'commercial clean lane count mismatch');
  assert(laneCounts.noncommercial_educational_candidate === 1, 'noncommercial educational lane count mismatch');
  assert((laneCounts.metadata_or_link_only || 0) === 0, 'metadata/link-only lane count mismatch');
  assert(laneCounts.blocked_or_needs_review === 1, 'blocked/review lane count mismatch');

  const klein = laneRows.find((row) => row.row_subset_id === 'old-dictionary-excluded-row-license-lane-reaudit::klein-dictionary');
  assert(klein?.license_lane === 'noncommercial_educational_candidate', 'Klein lane must remain NC educational');
  assert(klein?.commercial_export_allowed === false, 'Klein commercial export must remain false');
  assert(klein?.derived_from_nc === true, 'Klein NC derivation flag mismatch');
  const bdbAugmented = laneRows.find((row) => row.row_subset_id === 'old-dictionary-excluded-row-license-lane-reaudit::bdb-augmented-strong');
  assert(bdbAugmented?.license_lane === 'blocked_or_needs_review', 'BDB Augmented Strong lane mismatch');
  assert(bdbAugmented?.commercial_export_allowed === false, 'BDB Augmented Strong commercial export must remain false');

  const blockers = addendum.lane_output?.exact_blockers || [];
  assert(blockers.length === addendum.addendum_counts?.exact_blocker_count, 'exact blocker count mismatch');
  assert(blockers.some((row) => row.row_subset_id === klein.row_subset_id && row.license_lane === 'noncommercial_educational_candidate'), 'Klein blocker missing');
  assert(blockers.some((row) => row.row_subset_id === bdbAugmented.row_subset_id && row.blocker === 'bdb_augmented_strong_missing_independent_source_license_custody_basis'), 'BDB Augmented Strong blocker missing');

  assert(addendum.overlay_boundary?.base_registry_mutated === false, 'base registry mutation must be false');
  assert(addendum.overlay_boundary?.base_lane_return_mutated === false, 'base lane-return mutation must be false');
  assert(addendum.overlay_boundary?.queue_mutation_performed === false, 'queue mutation must be false');
  assert(addendum.overlay_boundary?.render_run === false, 'render run must be false');
  assert(addendum.overlay_boundary?.staging_performed === false, 'staging must be false');
  assert(addendum.overlay_boundary?.source_tracking_performed === false, 'source tracking must be false');

  for (const [key, value] of Object.entries(addendum.zero_output_counts || {})) {
    assert(value === 0, `zero-output count must be zero: ${key}`);
  }
  for (const key of noAcceptanceKeys) {
    assert(addendum.non_acceptance_boundary?.[key] === true, `missing no-acceptance boundary: ${key}`);
  }

  const result = {
    ok: true,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    status: addendum.status,
    target: addendum.lane_output.target,
    base_registry: addendum.base_registry,
    base_lane_return_output_count: expectedBaseCounts.lane_return_output_count,
    base_runnable_contract_count: expectedBaseCounts.runnable_contract_count,
    base_supporting_packet_count: expectedBaseCounts.supporting_packet_count,
    base_exact_blocker_count: expectedBaseCounts.exact_blocker_count,
    recallable_artifact_count: addendum.addendum_counts.recallable_artifact_count,
    validator_result_count: addendum.addendum_counts.validator_result_count,
    classification_lane_count: addendum.addendum_counts.classification_lane_count,
    commercial_clean_candidate_source_families: laneCounts.commercial_clean_candidate,
    noncommercial_educational_candidate_source_families: laneCounts.noncommercial_educational_candidate,
    metadata_or_link_only_source_families: laneCounts.metadata_or_link_only || 0,
    blocked_or_needs_review_source_families: laneCounts.blocked_or_needs_review,
    exact_blocker_count: blockers.length,
    base_registry_mutated: false,
    lane_return_mutated: false,
    queue_mutation_performed: false,
    no_acceptance_claims: true
  };
  writeJson(resultPath, result);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  const result = {
    ok: false,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    error: error.message,
    details: error.details ?? null
  };
  writeJson(resultPath, result);
  console.error(JSON.stringify(result, null, 2));
  process.exitCode = 1;
}
