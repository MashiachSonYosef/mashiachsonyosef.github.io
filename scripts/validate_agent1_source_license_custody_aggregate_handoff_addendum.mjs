#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-source-license-custody-aggregate-handoff-addendum-2026-06-05.json';
const resultPath = 'reports/agent1-source-license-custody-aggregate-handoff-addendum-validation-result-2026-06-05.json';

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
  'no_candidate_text_export_authorization',
  'no_release_action',
  'no_public_runtime_mutation',
  'no_queue_mutation',
  'no_staging',
  'no_destructive_repo_action'
];

try {
  const addendum = readJson(artifactPath);
  const baseHandoff = readJson(addendum.base_aggregate_handoff);
  const baseResult = readJson(addendum.base_aggregate_handoff_validation_result);
  const registryAddendum = readJson(addendum.registry_addendum);
  const registryResult = readJson(addendum.registry_addendum_validation_result);
  const commandAddendum = readJson(addendum.command_manifest_addendum);
  const commandResult = readJson(addendum.command_manifest_addendum_validation_result);

  assert(addendum.artifact_type === 'agent1_source_license_custody_aggregate_handoff_addendum', 'unexpected artifact_type');
  assert(addendum.status === 'agent1_source_license_custody_aggregate_handoff_addendum_validated_discovery_only', 'unexpected status');
  assert(addendum.current_agent1_thread_id === '019e975d-dc9f-7020-a7c8-885d083a837e', 'current Agent 1 thread mismatch');
  assert(addendum.old_agent1_thread_id === '019dc487-5973-7693-aebf-fb0a75936f50', 'old Agent 1 thread mismatch');
  assert(addendum.old_agent1_policy === 'archived_do_not_use', 'old Agent 1 policy mismatch');

  assert(baseHandoff.status === 'agent1_source_license_custody_aggregate_handoff_ready_for_discovery_only', 'base handoff status mismatch');
  assert(baseResult.ok === true, 'base handoff validator result must be ok');
  assert(registryAddendum.status === 'agent1_source_license_custody_registry_addendum_validated_overlay_only', 'registry addendum status mismatch');
  assert(registryResult.ok === true, 'registry addendum validator result must be ok');
  assert(commandAddendum.status === 'agent1_source_license_custody_command_manifest_addendum_validated_for_discovery_only', 'command addendum status mismatch');
  assert(commandResult.ok === true, 'command addendum validator result must be ok');

  const base = addendum.base_snapshot_counts_preserved || {};
  assert(base.runnable_contract_count === 22, 'base runnable contract count mismatch');
  assert(base.supporting_packet_count === 24, 'base supporting packet count mismatch');
  assert(base.exact_blocker_count === 1, 'base exact blocker count mismatch');
  assert(base.lane_return_output_count === 48, 'base lane-return count mismatch');
  assert(base.runnable_command_set_count === 22, 'base command set count mismatch');
  assert(baseHandoff.counts?.runnable_contract_count === base.runnable_contract_count, 'base handoff runnable count mismatch');
  assert(baseHandoff.counts?.runnable_command_set_count === base.runnable_command_set_count, 'base handoff command count mismatch');

  const counts = addendum.addendum_counts || {};
  assert(counts.registry_recallable_artifact_count === registryResult.recallable_artifact_count, 'registry recallable count mismatch');
  assert(counts.registry_validator_result_count === registryResult.validator_result_count, 'registry validator result count mismatch');
  assert(counts.command_addendum_runnable_command_set_count === commandResult.addendum_runnable_command_set_count, 'command addendum runnable count mismatch');
  assert(counts.command_addendum_validator_only_gate_count === commandResult.addendum_validator_only_gate_count, 'command addendum gate count mismatch');
  assert(counts.commercial_clean_candidate_source_families === 3, 'commercial-clean count mismatch');
  assert(counts.noncommercial_educational_candidate_source_families === 1, 'NC count mismatch');
  assert(counts.klein_nc_lane_preservation_exact_blocker_count === 6, 'Klein NC lane preservation blocker count mismatch');
  assert(counts.metadata_or_link_only_source_families === 0, 'metadata/link count mismatch');
  assert(counts.blocked_or_needs_review_source_families === 1, 'blocked/review count mismatch');
  assert(counts.bdb_augmented_strong_live_reprobe_exact_blocker_count === 4, 'BDB Augmented Strong live re-probe blocker count mismatch');
  assert(counts.bdb_augmented_strong_row_linkage_exact_blocker_count === 6, 'BDB Augmented Strong row-linkage blocker count mismatch');
  assert(counts.base_handoff_mutation_count === 0, 'base handoff mutation count must be zero');
  assert(counts.base_registry_mutation_count === 0, 'base registry mutation count must be zero');
  assert(counts.base_command_manifest_mutation_count === 0, 'base command manifest mutation count must be zero');

  const handoff = addendum.current_old_dictionary_handoff || {};
  assert(handoff.target === 'old-dictionary-excluded-row-license-lane-reaudit', 'handoff target mismatch');
  assert((handoff.files_used || []).every(exists), 'handoff files_used contains missing file');
  assert(handoff.lane_counts_rows?.source_family_rows === 5, 'source-family row count mismatch');
  assert(handoff.lane_counts_rows?.commercial_clean_candidate_source_families === 3, 'handoff commercial-clean count mismatch');
  assert(handoff.lane_counts_rows?.noncommercial_educational_candidate_source_families === 1, 'handoff NC count mismatch');
  assert(handoff.lane_counts_rows?.metadata_or_link_only_source_families === 0, 'handoff metadata/link count mismatch');
  assert(handoff.lane_counts_rows?.blocked_or_needs_review_source_families === 1, 'handoff blocked/review count mismatch');
  for (const key of ['allowed_transform_rows_now', 'candidate_text_rows_now', 'answer_eligible_rows_now', 'public_emit_rows_now', 'release_route_opened_now', 'agent6_delivery_now']) {
    assert(handoff.lane_counts_rows?.[key] === 0, `handoff ${key} must be zero`);
  }

  const lanes = new Map((handoff.classification_lanes || []).map((row) => [row.license_lane, row]));
  assert(lanes.get('commercial_clean_candidate')?.source_family_count === 3, 'commercial-clean lane row mismatch');
  const ncLane = lanes.get('noncommercial_educational_candidate');
  assert(ncLane?.source_family_count === 1, 'NC lane row mismatch');
  assert(ncLane.required_flags?.derived_from_nc === true, 'NC derived flag mismatch');
  assert(ncLane.required_flags?.commercial_export_allowed === false, 'NC commercial flag mismatch');
  assert(ncLane.required_flags?.corpus_contamination === false, 'NC corpus contamination flag mismatch');
  assert(lanes.get('metadata_or_link_only')?.source_family_count === 0, 'metadata/link lane count mismatch');
  assert(lanes.get('blocked_or_needs_review')?.source_family_count === 1, 'blocked/review lane count mismatch');

  assert(Array.isArray(handoff.exact_blockers) && handoff.exact_blockers.length === 6, 'exact blocker count mismatch');
  assert(handoff.handoff_owner?.agent2?.includes('zero output'), 'Agent 2 handoff must preserve zero output');
  assert(handoff.handoff_owner?.agent6?.includes('future candidate-use package'), 'Agent 6 handoff must require future package');
  assert(handoff.handoff_owner?.agent10?.includes('future package assembly'), 'Agent 10 handoff must own future package assembly');

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
    target: handoff.target,
    base_runnable_contract_count_preserved: base.runnable_contract_count,
    base_lane_return_output_count_preserved: base.lane_return_output_count,
    base_runnable_command_set_count_preserved: base.runnable_command_set_count,
    registry_recallable_artifact_count: counts.registry_recallable_artifact_count,
    command_addendum_runnable_command_set_count: counts.command_addendum_runnable_command_set_count,
    klein_nc_lane_preservation_exact_blocker_count: counts.klein_nc_lane_preservation_exact_blocker_count,
    bdb_augmented_strong_live_reprobe_exact_blocker_count: counts.bdb_augmented_strong_live_reprobe_exact_blocker_count,
    bdb_augmented_strong_row_linkage_exact_blocker_count: counts.bdb_augmented_strong_row_linkage_exact_blocker_count,
    source_family_rows: handoff.lane_counts_rows.source_family_rows,
    commercial_clean_candidate_source_families: handoff.lane_counts_rows.commercial_clean_candidate_source_families,
    noncommercial_educational_candidate_source_families: handoff.lane_counts_rows.noncommercial_educational_candidate_source_families,
    metadata_or_link_only_source_families: handoff.lane_counts_rows.metadata_or_link_only_source_families,
    blocked_or_needs_review_source_families: handoff.lane_counts_rows.blocked_or_needs_review_source_families,
    exact_blocker_count: handoff.exact_blockers.length,
    allowed_transform_rows_now: 0,
    candidate_text_rows_now: 0,
    agent6_delivery_now: 0,
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
