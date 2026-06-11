#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-missed-dictionary-current-input-reconciliation-blocker-2026-06-04.json';
const resultPath = 'reports/agent1-missed-dictionary-current-input-reconciliation-blocker-validation-result-2026-06-04.json';

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

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  const artifact = readJson(artifactPath);
  const agent1Blocker = readJson('reports/agent1-third-missed-source-family-target-or-blocker-2026-06-04.json');
  const agent1Handoff = readJson('reports/agent1-third-missed-source-family-missing-workset-blocker-handoff-2026-06-04.json');
  const agent2Packet = readJson('reports/agent2-orot-missed-dictionary-reader-hint-candidates-2026-06-04.json');
  const agent10Packet = readJson('reports/agent10-agent2-orot-missed-dictionary-zero-candidate-consumption-2026-06-04.json');
  const agent3Blocker = readJson('reports/agent3-spark3-oracle9-missed-dictionary-evidence-diff-blocker-2026-06-04.json');

  assert(artifact.artifact_type === 'agent1_missed_dictionary_current_input_reconciliation_blocker', 'unexpected artifact_type');
  assert(artifact.status === 'exact_current_input_reconciliation_blocker_returned', 'unexpected status');
  assert(artifact.can_author_runnable_contract_now === false, 'artifact must not be runnable now');
  assert(artifact.task_shape?.schema_counts?.spark1_routable === false, 'Spark-1 routable must be false');

  for (const filePath of artifact.task_shape?.files || []) {
    assert(exists(filePath), `missing referenced file: ${filePath}`);
  }

  assert(agent1Blocker.status === 'missing_workset_blocker', 'Agent 1 Contract 3 blocker status mismatch');
  assert(agent1Blocker.counts_found?.local_route_card_matrix_rows === 169, 'Agent 1 rows checked must be 169');
  assert(agent1Blocker.counts_found?.rows_with_exact_linkage_blocker === 168, 'Agent 1 exact blocker rows must be 168');
  assert(agent1Handoff.status === 'exact_missing_workset_blocker_returned', 'Agent 1 blocker handoff status mismatch');
  assert(agent1Handoff.can_author_runnable_contract_now === false, 'Agent 1 handoff must not be runnable');

  assert(agent2Packet.summary?.candidate_rows === 0, 'Agent 2 candidate rows must be zero');
  assert(agent2Packet.summary?.candidate_occurrences === 0, 'Agent 2 candidate occurrences must be zero');
  assert(agent2Packet.summary?.unmatched_rows === 168, 'Agent 2 unmatched rows must be 168');
  assert(agent2Packet.source_license_counts?.unmatched === 168, 'Agent 2 source/license unmatched rows must be 168');
  assert((agent2Packet.rows || []).length === 0, 'Agent 2 rows array must be empty');

  assert(agent10Packet.status === 'consumed_zero_candidate_return_no_agent6_route', 'Agent 10 consumption status mismatch');
  assert(agent10Packet.agent2_summary?.candidate_rows === 0, 'Agent 10 candidate rows must be zero');
  assert(agent10Packet.release_owner_decision?.agent6_route_needed_now === false, 'Agent 10 must not route Agent 6 now');

  assert(agent3Blocker.status === 'missing_pipeline_blocker', 'Agent 3 status must be missing_pipeline_blocker');
  assert(agent3Blocker.runnable_contract_check?.complete_pipeline_contract === false, 'Agent 3 complete contract must be false');
  assert(agent3Blocker.counts?.missing_contract_fields === 4, 'Agent 3 missing contract field count must be 4');
  assert(agent3Blocker.current_missed_dictionary_state?.unmatched_rows === 168, 'Agent 3 unmatched rows must be 168');

  const counts = artifact.task_shape.schema_counts;
  assert(counts.agent1_contract3_rows_checked === 169, 'artifact Agent 1 rows checked must be 169');
  assert(counts.agent1_exact_linkage_blocker_rows === 168, 'artifact Agent 1 blocker rows must be 168');
  assert(counts.agent2_candidate_rows === 0, 'artifact Agent 2 candidate rows must be zero');
  assert(counts.agent2_unmatched_rows === 168, 'artifact Agent 2 unmatched rows must be 168');
  assert(counts.agent3_missing_contract_fields === 4, 'artifact Agent 3 missing field count must be 4');

  assert(artifact.required_lane_separation?.commercial_clean_candidate?.includes('not assignable'), 'commercial lane must not be assigned');
  assert(artifact.required_lane_separation?.noncommercial_educational_candidate?.includes('not assignable'), 'NC lane must not be assigned');
  assert(artifact.required_lane_separation?.blocked_or_needs_review?.includes('current safe posture'), 'blocked/review posture must be explicit');
  assert(artifact.handoff?.agent6?.includes('Do not route directly'), 'Agent 6 direct route must be prohibited');
  assert(artifact.boundary?.no_source_license_acceptance === true, 'no source/license acceptance boundary missing');
  assert(artifact.boundary?.no_nc_commercial_authorization === true, 'no NC commercial authorization boundary missing');
  assert(artifact.boundary?.no_public_runtime_mutation === true, 'no public/runtime mutation boundary missing');

  const result = {
    ok: true,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    status: artifact.status,
    agent1_rows_checked: counts.agent1_contract3_rows_checked,
    agent2_candidate_rows: counts.agent2_candidate_rows,
    agent2_unmatched_rows: counts.agent2_unmatched_rows,
    agent3_missing_contract_fields: counts.agent3_missing_contract_fields,
    spark1_routable: counts.spark1_routable
  };
  writeJson(resultPath, result);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  const result = {
    ok: false,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    error: error.message,
    boundary: {
      no_source_license_acceptance: true,
      no_qa_acceptance: true,
      no_public_runtime_mutation: true
    }
  };
  writeJson(resultPath, result);
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
