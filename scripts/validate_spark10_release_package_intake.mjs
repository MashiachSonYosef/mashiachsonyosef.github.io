#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(process.argv[2] || 'reports/agent10-spark10-release-package-intake-pipeline-contract-2026-06-04.json');
const artifact = readJson(artifactPath);
const issues = [];

if (artifact.artifact_type === 'spark10_release_package_intake_pipeline_contract') {
  validateContract(artifact);
} else if (artifact.artifact_type === 'spark10_release_package_intake_matrix') {
  validateMatrix(artifact);
} else {
  issues.push(`unexpected artifact_type: ${artifact.artifact_type}`);
}

if (issues.length) {
  console.error(`Agent 10 release/package intake validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 10 release/package intake validation passed for ${artifactPath}.`);

function validateContract(contract) {
  expect(contract.schema_version === 1, 'contract schema_version must be 1');
  validateActiveMode(contract.active_mode, 'contract.active_mode');
  expect(typeof contract.spark_thread_id === 'string' && contract.spark_thread_id.length > 10, 'contract spark_thread_id required');
  expect(Array.isArray(contract.inputs) && contract.inputs.length > 0, 'contract inputs required');
  expect(typeof contract.commands?.build === 'string' && contract.commands.build.includes('build_spark10_release_package_intake.mjs'), 'contract build command required');
  expect(typeof contract.commands?.validate === 'string' && contract.commands.validate.includes('validate_spark10_release_package_intake.mjs'), 'contract validate command required');
  expect(String(contract.output?.json || '').startsWith('reports/'), 'contract output json must be under reports/');
  expect(String(contract.output?.md || '').startsWith('reports/'), 'contract output md must be under reports/');
  expect(typeof contract.agent6_handoff_condition === 'string' && contract.agent6_handoff_condition.includes('exact'), 'contract Agent 6 handoff condition must be exact');
  expect(typeof contract.stop_condition === 'string' && contract.stop_condition.length > 20, 'contract stop condition required');
  validateBoundary(contract.boundary, 'contract.boundary');
  validateForbiddenClaims(contract.forbidden_claims, 'contract.forbidden_claims');
  for (const [index, input] of contract.inputs.entries()) {
    expect(typeof input.path === 'string' && input.path.length > 0, `contract input ${index} path required`);
    expect(typeof input.lane_owner === 'string' && input.lane_owner.length > 0, `contract input ${index} lane_owner required`);
    if (input.agent6_handoff_needed === true) {
      expect(isDirectAgent6HandoffPacket(input), `contract input ${index} ${input.path} Agent 6 handoff must be a direct handoff packet`);
    }
    if (/agent3-state|consumption|pipeline-contract|validation-result|boundary-map|planning-matrix|occurrence-links|route-resolution|consumer-manifest/i.test(input.path)) {
      expect(input.agent6_handoff_needed !== true, `contract input ${index} ${input.path} support artifact must not be Agent 6 handoff`);
    }
  }
}

function validateMatrix(matrix) {
  expect(matrix.schema_version === 1, 'matrix schema_version must be 1');
  expect(matrix.generator === 'scripts/build_spark10_release_package_intake.mjs', 'matrix generator mismatch');
  validateActiveMode(matrix.active_mode, 'matrix.active_mode');
  expect(typeof matrix.contract_path === 'string' && matrix.contract_path.endsWith('.json'), 'matrix contract_path required');
  expect(Array.isArray(matrix.rows), 'matrix rows must be array');
  expect(matrix.summary?.inputs_checked === matrix.rows.length, 'matrix input count mismatch');
  expect(matrix.summary?.public_runtime_mutation_authorized === false, 'matrix must not authorize public/runtime mutation');
  expect(matrix.summary?.answer_definition_release_authorized === false, 'matrix must not authorize answer/definition/release');
  validateBoundary(matrix.boundary, 'matrix.boundary');
  validateForbiddenClaims(matrix.forbidden_claims, 'matrix.forbidden_claims');
  validateRouteCap(matrix);
  for (const [index, row] of matrix.rows.entries()) {
    expect(typeof row.path === 'string' && row.path.length > 0, `row ${index} path required`);
    expect(row.next_agent10_action !== 'append' && row.next_agent10_action !== 'public_mutation', `row ${index} must not authorize mutation`);
  }
}

function validateRouteCap(matrix) {
  const routeExactRows = matrix.rows.filter((row) => row.next_agent10_action === 'route_exact_contract_or_missing_field_blocker');
  expect(routeExactRows.length <= 1, `matrix must have at most one route-exact row, got ${routeExactRows.length}`);
  if (routeExactRows.length === 1) {
    expect(
      routeExactRows[0]?.path === 'reports/agent3-spark3-oracle9-missed-dictionary-evidence-diff-blocker-2026-06-04.json',
      'route-exact row, when present, must be Agent 3 Spark-3 missed-dictionary blocker JSON',
    );
  }

  for (const row of matrix.rows) {
    if (row.lane_owner === 'Agent 12' || /^control_cap/.test(String(row.release_relevance_hint || ''))) {
      expect(row.agent6_handoff_needed === false, `${row.path} Agent 12/control-cap row must not be Agent 6 candidate`);
      expect(row.next_agent10_action === 'inspect_if_release_relevant', `${row.path} Agent 12/control-cap row must be inspection only`);
    }
    if (/superseded delivery blocker/i.test(`${row.notes || ''} ${row.status || ''}`)) {
      expect(row.agent6_handoff_needed === false, `${row.path} superseded delivery blocker must not be Agent 6 candidate`);
    }
    if (row.agent6_handoff_needed) {
      expect(isDirectAgent6HandoffPacket(row), `${row.path} Agent 6 candidate must be a direct handoff packet, not support evidence`);
    }
    if (/agent3-state|consumption|pipeline-contract|validation-result|boundary-map|planning-matrix|occurrence-links|route-resolution|consumer-manifest/i.test(row.path)) {
      expect(row.agent6_handoff_needed === false, `${row.path} support artifact must not be Agent 6 candidate`);
    }
  }

  const agent6Candidates = matrix.rows.filter((row) => row.agent6_handoff_needed);
  const deliveredAwaitingVerdictRows = matrix.rows.filter((row) => row.next_agent10_action === 'await_agent6_verdict_or_exact_blocker');
  expect(matrix.summary?.agent6_handoff_candidates === agent6Candidates.length, 'matrix Agent 6 candidate count mismatch');
  expect(
    matrix.summary?.agent6_handoff_candidates <= 12,
    `matrix Agent 6 candidate count should be capped at 12 direct packet rows, got ${matrix.summary?.agent6_handoff_candidates}`,
  );
  if (matrix.summary?.agent6_handoff_candidates === 0) {
    expect(deliveredAwaitingVerdictRows.length > 0, 'zero Agent 6 candidates requires delivered-awaiting-verdict rows');
  }

  const orotAudit = matrix.rows.find((row) => row.path === 'reports/agent10-orot-current-goal-audit-2026-06-04.md');
  expect(orotAudit?.next_agent10_action === 'hold_until_changed_inputs_or_new_target', 'Agent 10 Orot audit must hold until changed inputs or new target');

  const agent3Drift = matrix.rows.find((row) => row.path === 'reports/agent3-current-control-drift-refresh-2026-06-04.md');
  expect(agent3Drift?.next_agent10_action === 'inspect_if_release_relevant', 'Agent 3 control drift refresh must remain inspection evidence');
}

function isDirectAgent6HandoffPacket(row) {
  return (
    /^reports\/agent10-agent6-ready-.*\.(?:json|md)$/i.test(row.path) ||
    /^data\/definitions\/definition-workbench-usage-(?:queue-ready-packet|agent6-packet)\.json$/i.test(row.path) ||
    /agent10_agent6_ready_boundary_packet|definition_workbench_usage_(?:queue_ready_packet|agent6_packet)/i.test(String(row.artifact_type || ''))
  );
}

function validateActiveMode(activeMode, context) {
  expect(String(activeMode || '').includes('WEEKLY_LEXICON_EXPANSION_GOAL_MODE'), `${context} must include weekly lexicon expansion mode`);
  expect(
    String(activeMode || '').includes('direct Agent run mode') || String(activeMode || '').includes('controlled Spark support'),
    `${context} must use direct Agent run mode or historical controlled Spark support`,
  );
  expect(!/two primary Sparks|TWO_PRIMARY_SPARKS/i.test(String(activeMode || '')), `${context} must not use stale two-primary Spark wording`);
}

function validateBoundary(boundary, context) {
  expect(boundary && typeof boundary === 'object', `${context} must be object`);
  for (const key of [
    'public_runtime_mutation_authorized',
    'route_shard_edit_authorized',
    'answer_eligibility_authorized',
    'definition_content_storage_authorized',
    'accepted_text_authorized',
    'publication_readiness_authorized',
  ]) {
    expect(boundary?.[key] === false, `${context}.${key} must be false`);
  }
}

function validateForbiddenClaims(claims, context) {
  expect(Array.isArray(claims) && claims.length > 0, `${context} must be non-empty array`);
  for (const required of ['QA acceptance', 'Definition authority', 'answer acceptance', 'publication readiness', 'accepted gloss/text']) {
    expect(claims.some((claim) => String(claim).includes(required)), `${context} must include ${required}`);
  }
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}
