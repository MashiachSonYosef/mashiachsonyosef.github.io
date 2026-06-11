#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  watch: 'reports/agent1-agent6-disposition-watch-2026-06-03.json',
  refreshResult: 'reports/agent1-source-custody-refresh-result.json',
  intakeValidator: 'reports/agent1-agent6-queue-intake-contract-validator-result-2026-06-03.json',
  result: 'reports/agent1-agent6-disposition-watch-validator-result-2026-06-03.json'
};

const REQUEST_IDS = [
  'agent6-agent1-source-custody-manifest-remediation-review',
  'agent6-agent1-source-custody-tracking-action-review',
  'agent6-agent1-source-custody-license-normalization-review',
  'agent6-agent1-public-hud-source-row-review',
  'agent6-agent1-orot-fill-source-row-review'
];

const REQUIRED_MUST_NOT_ACCEPT = [
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
];

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
  const left = sorted(actual || []);
  const right = sorted(expected || []);
  assert(left.length === right.length && left.every((value, index) => value === right[index]), `${label} mismatch`, { actual: left, expected: right });
}

function classifyStatus(requestRows) {
  const allDocketed = requestRows.every((row) => row.agent6_disposition_detected);
  const anyDocketed = requestRows.some((row) => row.agent6_disposition_detected);
  const anyRelaySignal = requestRows.some((row) => row.control_surface_present || row.agent5_or_agent8_signal_detected);

  if (allDocketed) return 'agent6_disposition_detected_for_all_request_ids';
  if (anyDocketed) return 'partial_agent6_disposition_detected';
  if (anyRelaySignal) return 'relay_or_control_signal_detected_no_agent6_disposition_yet';
  return 'awaiting_relay_no_agent6_disposition_detected';
}

function assertBoundary(boundary) {
  assert(boundary?.publication_state === 'blocked_no_render', 'publication state must remain blocked_no_render');
  for (const key of [
    'queue_mutation_performed',
    'source_provenance_custody_claimed',
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
    assert(boundary?.[key] === false, `boundary ${key} must be false`);
  }
}

function main() {
  const startedAt = new Date().toISOString();
  const watch = readJson(PATHS.watch);
  const refresh = readJson(PATHS.refreshResult);
  const intakeValidator = readJson(PATHS.intakeValidator);

  assert(watch.artifact_type === 'agent1_agent6_disposition_watch', 'unexpected watch artifact type');
  assert(refresh.ok === true, 'refresh result must be ok');
  assert(intakeValidator.ok === true, 'intake validator must be ok');
  assert(intakeValidator.blocking_findings === 0, 'intake validator blocking findings must be zero');
  sameSet(watch.request_ids, REQUEST_IDS, 'watch request IDs');
  sameSet(watch.request_rows.map((row) => row.request_id), REQUEST_IDS, 'watch request row IDs');

  assert(watch.current_refresh.completed_at === refresh.completed_at, 'watch refresh completion timestamp must match refresh result');
  assert(watch.current_refresh.live_untracked_sources === 23, 'expected 23 live untracked sources');
  assert(watch.current_refresh.live_modified_tracked_sources === 6, 'expected 6 live modified tracked sources');
  assert(watch.current_refresh.source_rows === 29, 'expected 29 source rows');
  assert(watch.current_refresh.source_fingerprinted_rows === 29, 'expected 29 fingerprinted source rows');
  assert(watch.current_refresh.blocked_downstream_direct_paths === 248, 'expected 248 blocked direct paths');
  assert(watch.current_refresh.blocked_downstream_content_reference_paths === 183, 'expected 183 blocked content-reference paths');

  assert(Array.isArray(watch.control_surfaces) && watch.control_surfaces.length === 4, 'expected four control surfaces');
  for (const surface of watch.control_surfaces) {
    assert(surface.exists === true, `control surface missing: ${surface.path}`);
    sameSet(surface.missing_request_ids, REQUEST_IDS, `${surface.path} missing request IDs`);
  }

  const expectedStatus = classifyStatus(watch.request_rows);
  assert(watch.status === expectedStatus, 'watch status does not match request row classification', { expectedStatus, actualStatus: watch.status });
  if (watch.status === 'awaiting_relay_no_agent6_disposition_detected') {
    for (const row of watch.request_rows) {
      assert(row.control_hits.length === 0, `${row.request_id} should have zero control hits`);
      assert(row.agent6_report_hits.length === 0, `${row.request_id} should have zero Agent 6 report hits`);
      assert(row.relay_signal_report_hits.length === 0, `${row.request_id} should have zero Agent 5/8 relay signal hits`);
    }
  }

  for (const term of REQUIRED_MUST_NOT_ACCEPT) {
    assert((watch.must_not_accept || []).includes(term), `missing must-not-accept term: ${term}`);
  }
  assertBoundary(watch.boundary);

  const result = {
    ok: true,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    validated_watch: PATHS.watch,
    status: watch.status,
    request_ids: watch.request_ids,
    agent6_disposition_hits: watch.request_rows.reduce((sum, row) => sum + row.agent6_report_hits.length, 0),
    relay_signal_hits: watch.request_rows.reduce((sum, row) => sum + row.relay_signal_report_hits.length, 0),
    control_surfaces_checked: watch.control_surfaces.length,
    boundary: watch.boundary
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
    details: error.details || null,
    boundary: {
      publication_state: 'blocked_no_render',
      source_provenance_acceptance_claimed: false,
      qa_acceptance_claimed: false,
      public_runtime_acceptance_claimed: false
    }
  };
  writeJson(PATHS.result, result);
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
