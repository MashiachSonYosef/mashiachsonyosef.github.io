import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  candidate: 'reports/agent1-wartime-public-hud-source-row-queue-candidate-2026-06-03.json',
  sourceRowEvidence: 'reports/agent1-wartime-public-hud-source-row-evidence-2026-06-03.json',
  sourceRowValidator: 'reports/agent1-wartime-public-hud-source-row-evidence-validator-result-2026-06-03.json',
  result: 'reports/agent1-wartime-public-hud-source-row-queue-validator-result-2026-06-03.json'
};

const EXPECTED_SURFACES = [
  'deuteronomy',
  'genesis',
  'exodus',
  'leviticus',
  'numbers'
].sort((a, b) => a.localeCompare(b));

const MUST_NOT_ACCEPT = [
  'source/provenance custody',
  'source/provenance acceptance',
  'source publication',
  'source-file tracking approval',
  'QA acceptance',
  'public/runtime acceptance',
  'publication readiness',
  'route publication support',
  'Definition authority',
  'product/data acceptance',
  'usage-as-definition authority',
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

function assertSummary(summary) {
  assert(summary.surfaces_checked === 5, 'expected five checked surfaces');
  assert(summary.endpoint_count === 20, 'expected 20 checked endpoints');
  assert(summary.endpoint_ok_count === 20, 'expected 20 OK endpoints');
  assert(summary.route_card_count_extracted > 0, 'expected positive route-card count');
  assert(summary.source_row_count_extracted > 0, 'expected positive source/license row count');
  assert(summary.missing_source_row_field_count === 0, 'expected zero missing source/license fields');
  assert(summary.unique_licenses.includes('CC BY-SA 4.0 / GFDL'), 'expected Kaikki/Wiktextract license');
  assert(summary.unique_licenses.includes('Public Domain'), 'expected Public Domain license');
}

function main() {
  const startedAt = new Date().toISOString();
  const candidate = readJson(PATHS.candidate);
  const evidence = readJson(PATHS.sourceRowEvidence);
  const sourceRowValidator = readJson(PATHS.sourceRowValidator);

  assert(candidate.artifact_type === 'agent1_wartime_public_hud_source_row_queue_candidate', 'unexpected candidate artifact type');
  assert(candidate.requested_queue_item?.request_id === 'agent6-agent1-public-hud-source-row-review', 'unexpected request id');
  assert(candidate.requested_queue_item?.submitted_by === 'Agent 5', 'requested queue item must be shaped for Agent 5 relay');
  assert(candidate.requested_queue_item?.agent1_evidence_origin === 'Agent 1 evidence packet for Agent 5 relay / Agent 6 review', 'missing Agent 1 evidence origin');
  assert(candidate.requested_queue_item?.status === 'candidate_for_agent5_queue_relay_awaiting_agent6_review', 'unexpected candidate status');
  assert(candidate.requested_queue_item?.requested_verdict === 'pass_warn_block_public_hud_source_row_evidence_only', 'unexpected requested verdict');
  assert(candidate.requested_queue_item?.gate === 'source_provenance_custody_gate/public_hud_route_card_source_row_gate', 'unexpected gate');
  assert(typeof candidate.requested_queue_item?.what_changed_since_last_agent6_ruling === 'string' && candidate.requested_queue_item.what_changed_since_last_agent6_ruling.length > 0, 'missing Agent 6 change-history field');
  assert(candidate.requested_queue_item.what_changed_since_prior_blocker_map === undefined, 'legacy prior-blocker-map field must not replace Agent 6 change-history field');
  assert(sourceRowValidator.ok === true, 'source-row evidence validator must pass');
  assertBoundary(candidate.boundary);
  sameSet(sorted(candidate.requested_queue_item.what_must_not_be_accepted), MUST_NOT_ACCEPT, 'must-not-accept list');

  assertSummary(candidate.current_evidence_summary);
  assert(JSON.stringify(candidate.current_evidence_summary) === JSON.stringify(evidence.summary), 'candidate summary must match source-row evidence summary');
  assert(JSON.stringify(candidate.current_evidence_boundary) === JSON.stringify(evidence.boundary), 'candidate boundary must match source-row evidence boundary');

  const candidateSurfaces = candidate.surfaces || [];
  assert(candidateSurfaces.length === 5, 'expected five candidate surface rows');
  sameSet(sorted(candidateSurfaces.map((surface) => surface.work_id)), EXPECTED_SURFACES, 'surface set');
  for (const surface of candidateSurfaces) {
    assert(surface.route_card_count_extracted > 0, `${surface.work_id} route card count must be positive`);
    assert(surface.source_row_count_extracted > 0, `${surface.work_id} source row count must be positive`);
    assert(surface.missing_source_row_field_count === 0, `${surface.work_id} must have zero missing source/license fields`);
    assert(Array.isArray(surface.unique_licenses) && surface.unique_licenses.includes('CC BY-SA 4.0 / GFDL'), `${surface.work_id} must include CC BY-SA/GFDL`);
  }

  for (const artifact of candidate.requested_queue_item.evidence_artifacts || []) {
    assert(fs.existsSync(path.join(repoRoot, artifact)), `evidence artifact missing: ${artifact}`);
  }

  const result = {
    ok: true,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    validated_candidate: PATHS.candidate,
    request_id: candidate.requested_queue_item.request_id,
    summary: candidate.current_evidence_summary,
    boundary: candidate.boundary
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
