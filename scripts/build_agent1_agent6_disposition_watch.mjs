#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  refreshResult: 'reports/agent1-source-custody-refresh-result.json',
  relayReadiness: 'reports/agent1-agent5-agent8-relay-readiness-checkpoint-2026-06-03.json',
  intakeValidator: 'reports/agent1-agent6-queue-intake-contract-validator-result-2026-06-03.json',
  agent6Queue: 'data/control/agent6_validation_queue.json',
  goalBoard: 'data/control/agent_goal_board.json',
  handoffIndexJson: 'reports/agent5-agent6-handoff-index.json',
  handoffIndexMd: 'reports/agent5-agent6-handoff-index.md',
  outputJson: 'reports/agent1-agent6-disposition-watch-2026-06-03.json',
  outputMd: 'reports/agent1-agent6-disposition-watch-2026-06-03.md'
};

const REQUEST_IDS = [
  'agent6-agent1-source-custody-manifest-remediation-review',
  'agent6-agent1-source-custody-tracking-action-review',
  'agent6-agent1-source-custody-license-normalization-review',
  'agent6-agent1-public-hud-source-row-review',
  'agent6-agent1-orot-fill-source-row-review'
];

const REPORT_PREFIXES = ['agent5-', 'agent6-', 'agent7-', 'agent8-'];

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
  'product/data gate acceptance',
  'usage-as-definition authority',
  'translation output',
  'accepted translation text'
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(repoRoot, relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeText(relativePath, value) {
  fs.writeFileSync(path.join(repoRoot, relativePath), value, 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function countHits(text, needle) {
  return text.split(needle).length - 1;
}

function inspectTextFile(relativePath, requestIds = REQUEST_IDS) {
  const fullPath = path.join(repoRoot, relativePath);
  const exists = fs.existsSync(fullPath);
  const text = exists ? readText(relativePath) : '';
  const request_id_hits = Object.fromEntries(requestIds.map((requestId) => [requestId, countHits(text, requestId)]));
  return {
    path: relativePath,
    exists,
    bytes: exists ? Buffer.byteLength(text) : 0,
    request_id_hits,
    present_request_ids: requestIds.filter((requestId) => request_id_hits[requestId] > 0),
    missing_request_ids: requestIds.filter((requestId) => request_id_hits[requestId] === 0)
  };
}

function reportFilesToScan() {
  const reportDir = path.join(repoRoot, 'reports');
  return fs.readdirSync(reportDir)
    .filter((file) => REPORT_PREFIXES.some((prefix) => file.startsWith(prefix)))
    .filter((file) => /\.(json|md|txt)$/i.test(file))
    .map((file) => `reports/${file}`)
    .sort((a, b) => a.localeCompare(b));
}

function scanReports() {
  const hits = [];
  for (const relativePath of reportFilesToScan()) {
    const text = readText(relativePath);
    const request_id_hits = Object.fromEntries(REQUEST_IDS.map((requestId) => [requestId, countHits(text, requestId)]));
    const present_request_ids = REQUEST_IDS.filter((requestId) => request_id_hits[requestId] > 0);
    if (present_request_ids.length > 0) {
      hits.push({
        path: relativePath,
        family: path.basename(relativePath).split('-')[0],
        request_id_hits,
        present_request_ids
      });
    }
  }
  return hits;
}

function formatList(values) {
  return values.map((value) => `- ${value}`).join('\n');
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

function main() {
  const refresh = readJson(PATHS.refreshResult);
  const relayReadiness = readJson(PATHS.relayReadiness);
  const intakeValidator = readJson(PATHS.intakeValidator);

  assert(refresh.ok === true, 'refresh result must be ok');
  assert(relayReadiness.status === 'relay_ready_evidence_control_surface_relay_still_needed', 'relay-readiness checkpoint must still be relay-ready with control blocker');
  assert(intakeValidator.ok === true, 'intake validator must be ok');
  assert(intakeValidator.blocking_findings === 0, 'intake validator must have zero blocking findings');

  const controlSurfaces = [
    inspectTextFile(PATHS.agent6Queue),
    inspectTextFile(PATHS.goalBoard),
    inspectTextFile(PATHS.handoffIndexJson),
    inspectTextFile(PATHS.handoffIndexMd)
  ];
  const reportHits = scanReports();

  const requestRows = REQUEST_IDS.map((requestId) => {
    const control_hits = controlSurfaces
      .map((surface) => ({
        path: surface.path,
        hits: surface.request_id_hits[requestId]
      }))
      .filter((surface) => surface.hits > 0);
    const agent6_report_hits = reportHits
      .filter((hit) => hit.family === 'agent6' && hit.request_id_hits[requestId] > 0)
      .map((hit) => ({ path: hit.path, hits: hit.request_id_hits[requestId] }));
    const relay_signal_report_hits = reportHits
      .filter((hit) => ['agent5', 'agent8'].includes(hit.family) && hit.request_id_hits[requestId] > 0)
      .map((hit) => ({ path: hit.path, hits: hit.request_id_hits[requestId] }));
    const agent7_report_hits = reportHits
      .filter((hit) => hit.family === 'agent7' && hit.request_id_hits[requestId] > 0)
      .map((hit) => ({ path: hit.path, hits: hit.request_id_hits[requestId] }));

    return {
      request_id: requestId,
      control_surface_present: control_hits.length > 0,
      agent6_disposition_detected: agent6_report_hits.length > 0,
      agent5_or_agent8_signal_detected: relay_signal_report_hits.length > 0,
      agent7_signal_detected: agent7_report_hits.length > 0,
      control_hits,
      agent6_report_hits,
      relay_signal_report_hits,
      agent7_report_hits
    };
  });

  const status = classifyStatus(requestRows);
  const watch = {
    generated_at: new Date().toISOString(),
    artifact_type: 'agent1_agent6_disposition_watch',
    status,
    source_artifacts: PATHS,
    request_ids: REQUEST_IDS,
    current_refresh: {
      completed_at: refresh.completed_at,
      ok: refresh.ok,
      live_untracked_sources: refresh.direct_untracked_sources,
      live_modified_tracked_sources: refresh.validator_summary.live_modified_tracked_sources,
      source_rows: refresh.validator_summary.source_fingerprints.source_rows,
      source_fingerprinted_rows: refresh.validator_summary.source_fingerprints.fingerprinted_source_rows,
      blocked_downstream_direct_paths: refresh.blocklist_summary.blocked_direct_artifact_paths,
      blocked_downstream_content_reference_paths: refresh.blocklist_summary.blocked_content_reference_paths
    },
    intake_contract: {
      ok: intakeValidator.ok,
      blocking_findings: intakeValidator.blocking_findings,
      queue_items_checked: intakeValidator.queue_items_checked
    },
    control_surfaces: controlSurfaces,
    report_scan: {
      prefixes: REPORT_PREFIXES,
      files_with_request_id_hits: reportHits
    },
    request_rows: requestRows,
    next_action_needed: status === 'awaiting_relay_no_agent6_disposition_detected'
      ? `Agent 5/Agent 8 relay remains the next needed action before Agent 6 can docket the ${REQUEST_IDS.length} Agent 1 request IDs.`
      : 'Review detected control/report signals before changing Agent 1 evidence posture.',
    boundary: {
      agent1_status: 'disposition watch evidence only',
      publication_state: 'blocked_no_render',
      queue_mutation_performed: false,
      source_provenance_custody_claimed: false,
      source_provenance_acceptance_claimed: false,
      source_publication_claimed: false,
      source_file_tracking_approval_claimed: false,
      qa_acceptance_claimed: false,
      public_runtime_acceptance_claimed: false,
      route_publication_support_claimed: false,
      definition_authority_claimed: false,
      product_data_acceptance_claimed: false,
      usage_as_definition_authority_claimed: false,
      translation_output_claimed: false,
      accepted_translation_text_claimed: false
    },
    must_not_accept: MUST_NOT_ACCEPT
  };

  writeJson(PATHS.outputJson, watch);
  writeText(PATHS.outputMd, `# Agent 1 / Agent 6 Disposition Watch

Generated: ${watch.generated_at}

Highest permissible claim: source/provenance disposition-watch evidence prepared.

This watch does not mutate Agent 6 queue/control files, Agent 5 handoff surfaces, source files, render outputs, or publication state.

## Summary

- Status: \`${watch.status}\`
- Refresh completed: \`${watch.current_refresh.completed_at}\`
- Agent 6 intake-contract validator: \`ok: ${watch.intake_contract.ok}\`, blocking findings \`${watch.intake_contract.blocking_findings}\`
- Queue mutation performed: \`false\`
- Publication state: \`blocked_no_render\`

## Current Source Scope

- Live untracked source files: ${watch.current_refresh.live_untracked_sources}
- Live modified tracked source files: ${watch.current_refresh.live_modified_tracked_sources}
- Source rows: ${watch.current_refresh.source_rows}
- Fingerprinted source rows: ${watch.current_refresh.source_fingerprinted_rows}
- Blocked downstream direct paths: ${watch.current_refresh.blocked_downstream_direct_paths}
- Blocked downstream content-reference paths: ${watch.current_refresh.blocked_downstream_content_reference_paths}

## Request ID Disposition Rows

${watch.request_rows.map((row) => `- \`${row.request_id}\`: control hits ${row.control_hits.length}, Agent 5/8 relay-signal hits ${row.relay_signal_report_hits.length}, Agent 6 disposition hits ${row.agent6_report_hits.length}`).join('\n')}

## Control Surfaces

${watch.control_surfaces.map((surface) => `- \`${surface.path}\`: exists ${surface.exists}, present request IDs ${surface.present_request_ids.length}, missing request IDs ${surface.missing_request_ids.length}`).join('\n')}

## Report Hits Outside Agent 1

${watch.report_scan.files_with_request_id_hits.length === 0 ? '- None detected in Agent 5/6/7/8 report files.' : watch.report_scan.files_with_request_id_hits.map((hit) => `- \`${hit.path}\`: ${hit.present_request_ids.map((requestId) => `\`${requestId}\``).join(', ')}`).join('\n')}

## Next Action Needed

${watch.next_action_needed}

## Must Not Be Accepted

${formatList(MUST_NOT_ACCEPT)}

## Agent 8 Callback

- status: ${watch.status}; evidence-ready / awaiting-Agent-5-or-Agent-8 relay and Agent-6 disposition only
- artifact: \`${PATHS.outputMd}\`
- machine artifact: \`${PATHS.outputJson}\`
- blockers: ${watch.status === 'awaiting_relay_no_agent6_disposition_detected' ? `no Agent 5/8 relay signal or Agent 6 disposition detected for the ${REQUEST_IDS.length} Agent 1 request IDs` : 'control/report signal requires review before Agent 1 changes evidence posture'}
- next action needed: ${watch.next_action_needed}
- continue condition: continue Agent 1 source/provenance evidence maintenance without render, staging, commit, publication, queue mutation, runtime validation, or custody acceptance
`);

  console.log(JSON.stringify({
    ok: true,
    output_json: PATHS.outputJson,
    output_md: PATHS.outputMd,
    status: watch.status,
    request_ids: watch.request_ids,
    agent6_disposition_hits: watch.request_rows.reduce((sum, row) => sum + row.agent6_report_hits.length, 0),
    relay_signal_hits: watch.request_rows.reduce((sum, row) => sum + row.relay_signal_report_hits.length, 0)
  }, null, 2));
}

main();
