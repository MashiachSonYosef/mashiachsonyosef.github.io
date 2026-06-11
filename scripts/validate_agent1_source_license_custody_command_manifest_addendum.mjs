#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const manifestPath = process.argv[2] || 'reports/agent1-source-license-custody-command-manifest-addendum-2026-06-05.json';
const resultPath = 'reports/agent1-source-license-custody-command-manifest-addendum-validation-result-2026-06-05.json';

const requiredTargets = [
  'bdb-augmented-strong-source-custody-blocker',
  'old-dictionary-downstream-consumption-alignment-audit',
  'old-dictionary-agent6-boundary-question-packet',
  'current-source-license-custody-lane-return-addendum',
  'bdb-augmented-strong-live-source-custody-reprobe',
  'bdb-augmented-strong-row-linkage-probe',
  'old-dictionary-klein-nc-lane-preservation'
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
  'no_candidate_text_export_authorization',
  'no_release_action',
  'no_public_runtime_mutation',
  'no_queue_mutation',
  'no_staging',
  'no_destructive_repo_action'
];

try {
  const manifest = readJson(manifestPath);
  const baseManifest = readJson(manifest.base_command_manifest);
  const baseResult = readJson(manifest.base_command_manifest_validation_result);
  const registryAddendum = readJson(manifest.source_registry_addendum);

  assert(manifest.artifact_type === 'agent1_source_license_custody_command_manifest_addendum', 'unexpected artifact_type');
  assert(manifest.status === 'agent1_source_license_custody_command_manifest_addendum_validated_for_discovery_only', 'unexpected status');
  assert(manifest.current_agent1_thread_id === '019e975d-dc9f-7020-a7c8-885d083a837e', 'current Agent 1 thread mismatch');
  assert(manifest.old_agent1_thread_id === '019dc487-5973-7693-aebf-fb0a75936f50', 'old Agent 1 thread mismatch');
  assert(manifest.old_agent1_policy === 'archived_do_not_use', 'old Agent 1 policy mismatch');
  assert(baseManifest.counts?.runnable_command_set_count === 22, 'base command manifest runnable count mismatch');
  assert(baseManifest.counts?.non_routable_blocker_count === 1, 'base command manifest blocker count mismatch');
  assert(baseManifest.counts?.aggregate_gate_count === 4, 'base command manifest gate count mismatch');
  assert(baseResult.ok === true, 'base command manifest validation result must be ok');
  assert(registryAddendum.status === 'agent1_source_license_custody_registry_addendum_validated_overlay_only', 'registry addendum status mismatch');

  assert(manifest.counts?.base_runnable_command_set_count_preserved === 22, 'preserved base runnable count mismatch');
  assert(manifest.counts?.base_non_routable_blocker_count_preserved === 1, 'preserved base blocker count mismatch');
  assert(manifest.counts?.base_aggregate_gate_count_preserved === 4, 'preserved base gate count mismatch');
  assert(manifest.counts?.addendum_runnable_command_set_count === 7, 'addendum runnable count mismatch');
  assert(manifest.counts?.addendum_validator_only_gate_count === 3, 'addendum validator-only count mismatch');
  assert(manifest.counts?.command_manifest_mutation_count === 0, 'command manifest mutation count must be 0');

  const commandSets = manifest.runnable_command_sets || [];
  assert(commandSets.length === 7, 'runnable command set row count mismatch');
  const byTarget = new Map(commandSets.map((row) => [row.target, row]));
  for (const target of requiredTargets) {
    assert(byTarget.has(target), `missing command set target: ${target}`);
  }

  for (const commandSet of commandSets) {
    assert(commandSet.spark1_routable === true, `${commandSet.target} must be Spark-1 routable`);
    for (const key of ['build', 'validate_output']) {
      assert(typeof commandSet[key] === 'string' && commandSet[key].startsWith('node scripts/'), `${commandSet.target}.${key} must be node scripts command`);
      assert(commandScriptExists(commandSet[key]), `${commandSet.target}.${key} script missing`);
    }
    for (const key of ['expected_output', 'expected_markdown', 'validation_result']) {
      assert(exists(commandSet[key]), `${commandSet.target}.${key} missing: ${commandSet[key]}`);
    }
    const validationResult = readJson(commandSet.validation_result);
    assert(validationResult.ok === true, `${commandSet.target} validation result must be ok`);
  }

  const blocker = byTarget.get('bdb-augmented-strong-source-custody-blocker');
  assert(blocker.license_lane === 'blocked_or_needs_review', 'BDB Augmented Strong lane mismatch');
  assert(blocker.rows === 222, 'BDB Augmented Strong row count mismatch');
  assert(blocker.occurrences === 4435, 'BDB Augmented Strong occurrence count mismatch');

  const downstream = byTarget.get('old-dictionary-downstream-consumption-alignment-audit');
  assert(downstream.source_family_rows === 5, 'downstream source-family row count mismatch');
  assert(downstream.lane_counts?.commercial_clean_candidate === 3, 'downstream commercial-clean count mismatch');
  assert(downstream.lane_counts?.noncommercial_educational_candidate === 1, 'downstream NC count mismatch');
  assert(downstream.lane_counts?.metadata_or_link_only === 0, 'downstream metadata/link count mismatch');
  assert(downstream.lane_counts?.blocked_or_needs_review === 1, 'downstream blocked count mismatch');
  assert(downstream.allowed_transform_rows_now === 0, 'downstream allowed transform rows must be 0');
  assert(downstream.candidate_text_rows_now === 0, 'downstream candidate text rows must be 0');

  const boundary = byTarget.get('old-dictionary-agent6-boundary-question-packet');
  assert(boundary.boundary_question_rows === 6, 'boundary question row count mismatch');
  assert(boundary.lane_question_counts?.commercial_clean_candidate === 3, 'boundary commercial-clean count mismatch');
  assert(boundary.lane_question_counts?.noncommercial_educational_candidate === 1, 'boundary NC count mismatch');
  assert(boundary.lane_question_counts?.metadata_or_link_only === 1, 'boundary metadata/link zero record count mismatch');
  assert(boundary.lane_question_counts?.blocked_or_needs_review === 1, 'boundary blocked count mismatch');
  assert(boundary.delivered_to_agent6_now === false, 'boundary delivery must be false');
  assert(boundary.allowed_transform_rows_now === 0, 'boundary allowed transform rows must be 0');
  assert(boundary.candidate_text_rows_now === 0, 'boundary candidate text rows must be 0');

  const laneReturn = byTarget.get('current-source-license-custody-lane-return-addendum');
  assert(laneReturn.addendum_lane_return_output_count === 9, 'lane-return addendum output count mismatch');
  assert(laneReturn.base_lane_return_output_count_preserved === 48, 'lane-return base output count mismatch');
  assert(laneReturn.source_family_rows === 5, 'lane-return source-family row count mismatch');
  assert(laneReturn.lane_counts?.commercial_clean_candidate === 3, 'lane-return commercial-clean count mismatch');
  assert(laneReturn.lane_counts?.noncommercial_educational_candidate === 1, 'lane-return NC count mismatch');
  assert(laneReturn.lane_counts?.metadata_or_link_only === 0, 'lane-return metadata/link count mismatch');
  assert(laneReturn.lane_counts?.blocked_or_needs_review === 1, 'lane-return blocked count mismatch');
  assert(laneReturn.allowed_transform_rows_now === 0, 'lane-return allowed transform rows must be 0');
  assert(laneReturn.candidate_text_rows_now === 0, 'lane-return candidate text rows must be 0');
  assert(laneReturn.agent6_delivery_now === 0, 'lane-return Agent 6 delivery rows must be 0');

  const liveReprobe = byTarget.get('bdb-augmented-strong-live-source-custody-reprobe');
  assert(liveReprobe.license_lane === 'blocked_or_needs_review', 'live re-probe lane mismatch');
  assert(liveReprobe.candidate_source_license_basis_observed === true, 'live re-probe candidate basis flag mismatch');
  assert(liveReprobe.exact_linkage_to_current_imported_row_subset_proven === false, 'live re-probe exact linkage flag must be false');
  assert(liveReprobe.exact_blocker_count === 4, 'live re-probe exact blocker count mismatch');
  assert(liveReprobe.rows === 222, 'live re-probe row count mismatch');
  assert(liveReprobe.occurrences === 4435, 'live re-probe occurrence count mismatch');
  assert(liveReprobe.allowed_transform_rows_now === 0, 'live re-probe allowed transform rows must be 0');
  assert(liveReprobe.candidate_text_rows_now === 0, 'live re-probe candidate text rows must be 0');
  assert(liveReprobe.agent6_delivery_now === 0, 'live re-probe Agent 6 delivery rows must be 0');

  const rowLinkage = byTarget.get('bdb-augmented-strong-row-linkage-probe');
  assert(rowLinkage.license_lane === 'blocked_or_needs_review', 'row-linkage lane mismatch');
  assert(rowLinkage.augindex_entry_count === 9299, 'row-linkage AugIndex entry count mismatch');
  assert(rowLinkage.exact_linkage_to_current_imported_row_subset_proven === false, 'row-linkage exact linkage flag must be false');
  assert(rowLinkage.exact_blocker_count === 6, 'row-linkage exact blocker count mismatch');
  assert(rowLinkage.rows === 222, 'row-linkage row count mismatch');
  assert(rowLinkage.occurrences === 4435, 'row-linkage occurrence count mismatch');
  assert(rowLinkage.allowed_transform_rows_now === 0, 'row-linkage allowed transform rows must be 0');
  assert(rowLinkage.candidate_text_rows_now === 0, 'row-linkage candidate text rows must be 0');
  assert(rowLinkage.agent6_delivery_now === 0, 'row-linkage Agent 6 delivery rows must be 0');

  const kleinNc = byTarget.get('old-dictionary-klein-nc-lane-preservation');
  assert(kleinNc.license_lane === 'noncommercial_educational_candidate', 'Klein NC lane mismatch');
  assert(kleinNc.rows === 214, 'Klein NC row count mismatch');
  assert(kleinNc.occurrences === 4444, 'Klein NC occurrence count mismatch');
  assert(kleinNc.prior_nc_klein_package_rows === 17, 'Klein prior package row count mismatch');
  assert(kleinNc.commercial_export_allowed === false, 'Klein commercial export must be false');
  assert(kleinNc.exact_blocker_count === 6, 'Klein exact blocker count mismatch');
  assert(kleinNc.allowed_transform_rows_now === 0, 'Klein transform rows must be 0');
  assert(kleinNc.candidate_text_rows_now === 0, 'Klein candidate text rows must be 0');
  assert(kleinNc.agent6_delivery_now === 0, 'Klein Agent 6 delivery rows must be 0');

  for (const gate of manifest.validator_only_gates || []) {
    assert(typeof gate === 'string' && gate.startsWith('node scripts/'), `validator gate must be node scripts command: ${gate}`);
    assert(commandScriptExists(gate), `validator gate script missing: ${gate}`);
  }
  assert((manifest.validator_only_gates || []).length === 3, 'validator-only gate count mismatch');

  for (const [key, value] of Object.entries(manifest.zero_output_counts || {})) {
    assert(value === 0, `zero-output count must be zero: ${key}`);
  }
  for (const key of noAcceptanceKeys) {
    assert(manifest.non_acceptance_boundary?.[key] === true, `missing no-acceptance boundary: ${key}`);
  }
  assert(manifest.spark_rule.includes('may run only the listed June 5 addendum commands'), 'Spark rule must restrict commands');

  const result = {
    ok: true,
    validated_artifact: manifestPath,
    completed_at: new Date().toISOString(),
    status: manifest.status,
    base_runnable_command_set_count_preserved: 22,
    addendum_runnable_command_set_count: commandSets.length,
    addendum_validator_only_gate_count: manifest.validator_only_gates.length,
    bdb_augmented_strong_rows: blocker.rows,
    downstream_source_family_rows: downstream.source_family_rows,
    boundary_question_rows: boundary.boundary_question_rows,
    lane_return_addendum_output_count: laneReturn.addendum_lane_return_output_count,
    live_reprobe_exact_blocker_count: liveReprobe.exact_blocker_count,
    row_linkage_exact_blocker_count: rowLinkage.exact_blocker_count,
    klein_nc_lane_preservation_exact_blocker_count: kleinNc.exact_blocker_count,
    allowed_transform_rows_now: 0,
    candidate_text_rows_now: 0,
    delivered_to_agent6_now: false,
    command_manifest_mutation_count: 0,
    no_acceptance_claims: true
  };
  writeJson(resultPath, result);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  const result = {
    ok: false,
    validated_artifact: manifestPath,
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

function commandScriptExists(command) {
  const normalized = command.replace(/^node\s+/, '').split(/\s+/)[0];
  return exists(normalized);
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
