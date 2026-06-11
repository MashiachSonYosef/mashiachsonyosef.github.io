import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  docket: 'reports/agent1-source-provenance-agent6-ready-docket-2026-06-03.json',
  sourceFileReconciliationActionPlan: 'reports/agent1-source-file-reconciliation-action-plan-2026-06-03.md',
  sourceFileReconciliationActionPlanJson: 'reports/agent1-source-file-reconciliation-action-plan-2026-06-03.json',
  sourceFileReconciliationActionPlanValidator: 'reports/agent1-source-file-reconciliation-action-plan-validator-result-2026-06-03.json',
  result: 'reports/agent1-source-provenance-agent6-ready-docket-validator-result-2026-06-03.json'
};

const EXPECTED_REQUESTS = [
  'agent6-agent1-source-custody-manifest-remediation-review',
  'agent6-agent1-source-custody-tracking-action-review',
  'agent6-agent1-source-custody-license-normalization-review',
  'agent6-agent1-public-hud-source-row-review',
  'agent6-agent1-orot-fill-source-row-review'
].sort((a, b) => a.localeCompare(b));

const MUST_NOT_ACCEPT = [
  'source/provenance custody',
  'source/provenance acceptance',
  'source publication',
  'source-file tracking approval',
  'source-file staging, commit, or merge',
  'downstream direct artifact acceptance',
  'downstream content-reference acceptance',
  'QA acceptance',
  'public/runtime acceptance',
  'publication readiness',
  'future publication support',
  'route publication support',
  'Definition authority',
  'usage-as-definition authority',
  'product/data acceptance',
  'translation output',
  'accepted translation text'
].sort((a, b) => a.localeCompare(b));

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(repoRoot, relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function assert(condition, message, details = {}) {
  if (!condition) {
    const error = new Error(message);
    error.details = details;
    throw error;
  }
}

function sorted(values) {
  return [...values].sort((a, b) => a.localeCompare(b));
}

function sameSet(actual, expected, label) {
  assert(JSON.stringify(actual) === JSON.stringify(expected), `${label} mismatch`, { actual, expected });
}

function assertBoundary(boundary) {
  assert(boundary?.publication_state === 'blocked_no_render', 'publication_state must remain blocked_no_render');
  for (const key of [
    'source_provenance_acceptance_claimed',
    'source_publication_claimed',
    'source_file_tracking_approval_claimed',
    'source_file_staging_claimed',
    'downstream_direct_artifact_acceptance_claimed',
    'downstream_content_reference_acceptance_claimed',
    'qa_acceptance_claimed',
    'public_runtime_acceptance_claimed',
    'route_publication_support_claimed',
    'definition_authority_claimed',
    'product_data_acceptance_claimed',
    'usage_as_definition_authority_claimed',
    'translation_output_claimed',
    'accepted_translation_text_claimed'
  ]) {
    assert(boundary[key] === false, `boundary ${key} must be false`);
  }
}

function assertCurrentSourceScope(scope) {
  assert(scope.live_untracked_sources === 23, 'expected 23 live untracked sources');
  assert(scope.live_modified_tracked_sources === 6, 'expected 6 live modified tracked sources');
  assert(scope.source_rows === 29, 'expected 29 source rows');
  assert(scope.source_fingerprinted_rows === 29, 'expected 29 fingerprinted source rows');
  assert(scope.missing_lexical_manifest_gaps === 0, 'expected zero missing lexical manifest gaps');
  assert(scope.blocked_downstream_direct_paths === 248, 'expected 248 blocked downstream direct paths');
  assert(scope.blocked_downstream_content_reference_paths === 183, 'expected 183 blocked downstream content-reference paths');
  assert(scope.route_or_hud_content_reference_rows === 42, 'expected 42 route/HUD content-reference rows');
  assert(scope.reader_workbench_content_reference_rows === 112, 'expected 112 reader/workbench content-reference rows');
  assert(scope.public_lexical_content_reference_rows === 29, 'expected 29 public lexical content-reference rows');
}

function assertReviewItem(item) {
  assert(item.status === 'candidate_for_agent5_queue_relay_awaiting_agent6_review', `${item.request_id} status mismatch`);
  assert(item.validator_ok === true, `${item.request_id} validator must be ok`);
  assert(fs.existsSync(path.join(repoRoot, item.candidate_artifact)), `${item.request_id} candidate artifact missing`);
  assert(fs.existsSync(path.join(repoRoot, item.candidate_json)), `${item.request_id} candidate JSON missing`);
  assert(fs.existsSync(path.join(repoRoot, item.validator_result)), `${item.request_id} validator result missing`);

  const validator = readJson(item.validator_result);
  assert(validator.ok === true, `${item.request_id} saved validator result must be ok`);
}

function main() {
  const startedAt = new Date().toISOString();
  const docket = readJson(PATHS.docket);

  assert(docket.artifact_type === 'agent1_source_provenance_agent6_ready_docket', 'unexpected artifact type');
  assert(docket.status === 'evidence_ready_awaiting_agent6', 'unexpected docket status');
  assertBoundary(docket.boundary);
  sameSet(sorted(docket.must_not_accept || []), MUST_NOT_ACCEPT, 'must-not-accept list');
  assertCurrentSourceScope(docket.current_source_scope);

  const reviewItems = docket.review_items || [];
  assert(reviewItems.length === 5, 'expected five review items');
  sameSet(sorted(reviewItems.map((item) => item.request_id)), EXPECTED_REQUESTS, 'review request set');
  for (const item of reviewItems) {
    assertReviewItem(item);
  }

  const sequence = docket.recommended_review_sequence || [];
  assert(sequence.length === 5, 'expected five sequence items');
  sameSet(sorted(sequence.map((item) => item.request_id)), EXPECTED_REQUESTS, 'review sequence request set');
  assert(JSON.stringify(sequence.map((item) => item.review_order)) === JSON.stringify([1, 2, 3, 4, 5]), 'review sequence order mismatch');

  for (const artifact of docket.evidence_artifacts || []) {
    assert(fs.existsSync(path.join(repoRoot, artifact)), `evidence artifact missing: ${artifact}`);
  }
  for (const artifact of [
    PATHS.sourceFileReconciliationActionPlan,
    PATHS.sourceFileReconciliationActionPlanJson,
    PATHS.sourceFileReconciliationActionPlanValidator
  ]) {
    assert((docket.evidence_artifacts || []).includes(artifact), `docket missing source-file reconciliation evidence artifact: ${artifact}`);
  }
  const actionPlanValidator = readJson(PATHS.sourceFileReconciliationActionPlanValidator);
  assert(actionPlanValidator.ok === true, 'source-file reconciliation action plan validator must be ok');
  assert(actionPlanValidator.action_performed === false, 'source-file reconciliation action plan must remain non-mutating');
  assert(actionPlanValidator.track_candidate_source_files === 23, 'source-file reconciliation action plan must cover 23 tracking candidates');
  assert(actionPlanValidator.modified_tracked_source_files === 6, 'source-file reconciliation action plan must cover 6 modified tracked sources');

  const result = {
    ok: true,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    validated_docket: PATHS.docket,
    review_items: reviewItems.map((item) => item.request_id),
    current_source_scope: docket.current_source_scope,
    boundary: docket.boundary
  };
  writeJson(PATHS.result, result);
  console.log(JSON.stringify(result, null, 2));
}

try {
  main();
} catch (error) {
  const result = {
    ok: false,
    completed_at: new Date().toISOString(),
    error: error.message,
    details: error.details || null
  };
  writeJson(PATHS.result, result);
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
