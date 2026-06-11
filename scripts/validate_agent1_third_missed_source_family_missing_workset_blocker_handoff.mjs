#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-third-missed-source-family-missing-workset-blocker-handoff-2026-06-04.json';
const resultPath = 'reports/agent1-third-missed-source-family-missing-workset-blocker-handoff-validation-result-2026-06-04.json';

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
  const blocker = readJson(artifact.source_artifacts.third_missed_blocker);

  assert(artifact.artifact_type === 'agent1_third_missed_source_family_missing_workset_blocker_handoff', 'unexpected artifact_type');
  assert(artifact.status === 'exact_missing_workset_blocker_returned', 'unexpected status');
  assert(artifact.target === 'third_missed_source_family', 'unexpected target');
  assert(artifact.can_author_runnable_contract_now === false, 'must not claim runnable contract');
  assert(artifact.task_shape?.schema_counts?.rows_checked === 169, 'rows_checked must be 169');
  assert(artifact.task_shape?.schema_counts?.occurrences_checked === 2148, 'occurrences_checked must be 2148');
  assert(artifact.task_shape?.schema_counts?.exact_linkage_blocker_rows === 168, 'exact_linkage_blocker_rows must be 168');
  assert(artifact.task_shape?.schema_counts?.exact_linkage_blocker_occurrences === 2117, 'exact_linkage_blocker_occurrences must be 2117');
  assert(artifact.task_shape?.schema_counts?.spark1_routable === false, 'spark1_routable must be false');

  for (const file of artifact.task_shape.files || []) {
    assert(exists(file), `missing task file: ${file}`);
  }
  assert(blocker.status === 'missing_workset_blocker', 'source blocker status mismatch');
  assert(blocker.rows_checked === 169 || blocker.counts_found?.local_route_card_matrix_rows === 169, 'source blocker row count mismatch');
  assert((artifact.task_shape.missing_field_blocker?.missing_fields || []).includes('row-level source-family/license split'), 'missing fields must include row-level source-family/license split');
  assert(artifact.required_lane_separation?.noncommercial_educational_candidate.includes('do not flatten NC'), 'NC no-flattening statement required');
  assert(artifact.next_unblock_input_required?.required_artifact_shape.includes('license_lane'), 'next unblock must require license_lane');
  assert(artifact.boundary?.no_source_license_acceptance === true, 'no source/license acceptance boundary missing');
  assert(artifact.boundary?.no_nc_commercial_authorization === true, 'no NC commercial authorization boundary missing');
  assert(artifact.boundary?.no_public_runtime_mutation === true, 'no public/runtime mutation boundary missing');

  const result = {
    ok: true,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    status: artifact.status,
    target: artifact.target,
    rows_checked: artifact.task_shape.schema_counts.rows_checked,
    exact_linkage_blocker_rows: artifact.task_shape.schema_counts.exact_linkage_blocker_rows,
    spark1_routable: false
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
