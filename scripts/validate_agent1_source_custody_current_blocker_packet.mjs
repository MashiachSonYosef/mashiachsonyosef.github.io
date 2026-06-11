#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  packet: 'reports/agent1-source-custody-current-blocker-packet-2026-06-03.json',
  packetMd: 'reports/agent1-source-custody-current-blocker-packet-2026-06-03.md',
  refreshResult: 'reports/agent1-source-custody-refresh-result.json',
  relayReadiness: 'reports/agent1-agent5-agent8-relay-readiness-checkpoint-2026-06-03.json',
  dispositionWatch: 'reports/agent1-agent6-disposition-watch-2026-06-03.json',
  completionAudit: 'reports/agent1-source-custody-objective-completion-audit-2026-06-03.json',
  untrackedList: 'reports/untracked-source-files-direct.txt',
  licenseActionPacket: 'reports/agent1-source-custody-license-normalization-action-packet.json',
  result: 'reports/agent1-source-custody-current-blocker-packet-validator-result-2026-06-03.json',
  resultMd: 'reports/agent1-source-custody-current-blocker-packet-validator-result-2026-06-03.md'
};

const EXPECTED_BLOCKERS = [
  'source_provenance_custody_unaccepted',
  'untracked_source_tracking_or_exclusion_pending',
  'modified_tracked_license_normalization_pending',
  'agent1_request_ids_absent_from_agent6_agent5_control_surfaces',
  'agent6_disposition_absent_for_current_request_ids',
  'publication_blocked_no_render'
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
  'route publication support',
  'Definition authority',
  'product/data acceptance',
  'usage-as-definition authority',
  'translation output',
  'accepted translation text'
].sort((a, b) => a.localeCompare(b));

function fullPath(relativePath) {
  return path.join(repoRoot, relativePath);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(fullPath(relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(fullPath(relativePath), 'utf8');
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(fullPath(relativePath)), { recursive: true });
  fs.writeFileSync(fullPath(relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeText(relativePath, value) {
  fs.mkdirSync(path.dirname(fullPath(relativePath)), { recursive: true });
  fs.writeFileSync(fullPath(relativePath), value, 'utf8');
}

function assert(condition, message, details = {}) {
  if (!condition) {
    const error = new Error(message);
    error.details = details;
    throw error;
  }
}

function sorted(values) {
  return [...values].sort((a, b) => String(a).localeCompare(String(b)));
}

function sameSet(actual, expected, label) {
  const left = sorted(actual || []);
  const right = sorted(expected || []);
  assert(left.length === right.length && left.every((value, index) => value === right[index]), `${label} mismatch`, { actual: left, expected: right });
}

function assertFalseBoundary(boundary) {
  assert(boundary.publication_state === 'blocked_no_render', 'publication state must remain blocked_no_render');
  for (const key of [
    'queue_mutation_performed',
    'source_provenance_custody_claimed',
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
    'accepted_translation_text_claimed',
    'completion_claimed'
  ]) {
    assert(boundary[key] === false, `boundary ${key} must be false`);
  }
}

function renderMarkdown(result) {
  return `# Agent 1 Source Custody Current Blocker Packet Validator Result

Generated: ${result.completed_at}

- OK: ${result.ok}
- Validated packet: \`${result.validated_packet}\`
- Refresh completed: \`${result.refresh_completed_at}\`
- Exact blockers: ${result.exact_blocker_count}
- Current request IDs: ${result.request_id_count}
- Untracked/modified source files: ${result.untracked_source_files}/${result.modified_tracked_source_files}
- Blocked direct/content-reference paths: ${result.blocked_direct_artifact_paths}/${result.blocked_content_reference_paths}
- Publication state: \`${result.boundary.publication_state}\`
- Completion claimed: ${result.boundary.completion_claimed}

This validator confirms the blocker packet is current, owner-readable, non-mutating, and non-accepting.
`;
}

function main() {
  const startedAt = new Date().toISOString();
  const packet = readJson(PATHS.packet);
  const packetMd = readText(PATHS.packetMd);
  const refresh = readJson(PATHS.refreshResult);
  const relay = readJson(PATHS.relayReadiness);
  const disposition = readJson(PATHS.dispositionWatch);
  const completion = readJson(PATHS.completionAudit);
  const untrackedSources = readText(PATHS.untrackedList).split(/\r?\n/).filter(Boolean);
  const modifiedSources = readJson(PATHS.licenseActionPacket).modified_tracked_sources.map((row) => row.source_path);

  assert(packet.artifact_type === 'agent1_source_custody_current_blocker_packet', 'unexpected artifact type');
  assert(packet.status === 'evidence_current_relay_and_disposition_blockers_open', 'unexpected status');
  assert(packet.highest_permissible_claim === 'source/provenance blocker evidence prepared for Agent 6-ready custody packets', 'unexpected highest permissible claim');
  assert(packet.refresh_completed_at === refresh.completed_at, 'refresh timestamp mismatch');
  assert(refresh.ok === true, 'refresh must be ok');

  sameSet(packet.agent6_ready_request_ids, relay.request_ids, 'request IDs');
  sameSet(packet.agent6_ready_request_ids, disposition.request_ids, 'disposition request IDs');
  sameSet(packet.relay_blocker.missing_request_ids_everywhere, relay.blocker.missing_request_ids_everywhere, 'missing request IDs');
  sameSet(packet.relay_blocker.blocking_control_surfaces, relay.blocker.blocking_control_surfaces, 'blocking control surfaces');
  assert(packet.relay_blocker.blocker_id === relay.blocker.blocker_id, 'relay blocker id mismatch');
  assert(packet.relay_blocker.agent6_disposition_watch_status === disposition.status, 'disposition status mismatch');
  assert(packet.relay_blocker.agent6_disposition_hits === completion.current_evidence.agent6_disposition_hits, 'Agent 6 disposition hit mismatch');
  assert(packet.relay_blocker.relay_signal_hits === completion.current_evidence.relay_signal_hits, 'relay signal hit mismatch');
  assert(packet.relay_blocker.agent6_disposition_hits === 0, 'Agent 6 disposition hits must be zero');
  assert(packet.relay_blocker.relay_signal_hits === 0, 'relay signal hits must be zero');

  for (const surface of disposition.control_surfaces) {
    assert(surface.present_request_ids.length === 0, `${surface.path} must have zero present current request IDs`);
    sameSet(surface.missing_request_ids, packet.agent6_ready_request_ids, `${surface.path} missing request IDs`);
  }
  assert(disposition.report_scan.files_with_request_id_hits.length === 0, 'Agent 5/6/7/8 report scan must have zero request ID hits');

  sameSet(packet.source_files.untracked_quarantined_sources, untrackedSources, 'untracked source files');
  sameSet(packet.source_files.modified_tracked_license_normalization_sources, modifiedSources, 'modified tracked source files');
  assert(packet.current_source_scope.live_untracked_sources === untrackedSources.length, 'untracked count mismatch');
  assert(packet.current_source_scope.live_modified_tracked_sources === modifiedSources.length, 'modified tracked count mismatch');
  assert(packet.current_source_scope.source_rows === 29, 'source rows mismatch');
  assert(packet.current_source_scope.source_fingerprinted_rows === 29, 'fingerprinted source rows mismatch');
  assert(packet.current_source_scope.missing_lexical_manifest_gaps === 0, 'missing lexical manifest gaps mismatch');
  assert(packet.downstream_reliance.blocked_direct_artifact_paths === refresh.blocklist_summary.blocked_direct_artifact_paths, 'blocked direct path mismatch');
  assert(packet.downstream_reliance.blocked_content_reference_paths === refresh.blocklist_summary.blocked_content_reference_paths, 'blocked content-reference path mismatch');
  assert(packet.downstream_reliance.route_or_hud_content_reference_rows === refresh.agent6_ready_docket_validator_summary.current_source_scope.route_or_hud_content_reference_rows, 'route/HUD row mismatch');
  assert(packet.downstream_reliance.reader_workbench_content_reference_rows === refresh.agent6_ready_docket_validator_summary.current_source_scope.reader_workbench_content_reference_rows, 'reader/workbench row mismatch');
  assert(packet.downstream_reliance.public_lexical_content_reference_rows === refresh.agent6_ready_docket_validator_summary.current_source_scope.public_lexical_content_reference_rows, 'public lexical row mismatch');

  sameSet(packet.exact_blockers.map((row) => row.blocker_id), EXPECTED_BLOCKERS, 'exact blocker ids');
  sameSet(packet.must_not_accept, MUST_NOT_ACCEPT, 'must-not-accept list');
  assertFalseBoundary(packet.boundary);
  assert(packet.next_owner_actions.length === completion.next_owner_actions.length, 'next owner action count mismatch');

  assert(packetMd.includes('## Agent 8 Callback'), 'markdown must include Agent 8 Callback');
  assert(packetMd.includes('Every current request ID is absent from every checked control surface'), 'markdown must state exact relay blocker');
  assert(packetMd.includes('Agent 1 has prepared relay-ready evidence but must not mutate those surfaces'), 'markdown must state no queue mutation boundary');

  const result = {
    ok: true,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    validated_packet: PATHS.packet,
    validated_packet_md: PATHS.packetMd,
    refresh_completed_at: packet.refresh_completed_at,
    exact_blocker_count: packet.exact_blockers.length,
    request_id_count: packet.agent6_ready_request_ids.length,
    untracked_source_files: packet.current_source_scope.live_untracked_sources,
    modified_tracked_source_files: packet.current_source_scope.live_modified_tracked_sources,
    blocked_direct_artifact_paths: packet.downstream_reliance.blocked_direct_artifact_paths,
    blocked_content_reference_paths: packet.downstream_reliance.blocked_content_reference_paths,
    boundary: packet.boundary
  };

  writeJson(PATHS.result, result);
  writeText(PATHS.resultMd, renderMarkdown(result));
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
