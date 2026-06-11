#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  refreshResult: 'reports/agent1-source-custody-refresh-result.json',
  relayReadiness: 'reports/agent1-agent5-agent8-relay-readiness-checkpoint-2026-06-03.json',
  dispositionWatch: 'reports/agent1-agent6-disposition-watch-2026-06-03.json',
  completionAudit: 'reports/agent1-source-custody-objective-completion-audit-2026-06-03.json',
  untrackedList: 'reports/untracked-source-files-direct.txt',
  licenseActionPacket: 'reports/agent1-source-custody-license-normalization-action-packet.json',
  outputJson: 'reports/agent1-source-custody-current-blocker-packet-2026-06-03.json',
  outputMd: 'reports/agent1-source-custody-current-blocker-packet-2026-06-03.md'
};

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
];

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

function renderMarkdown(packet) {
  const blockers = packet.exact_blockers.map((blocker) => `- \`${blocker.blocker_id}\`: owner ${blocker.owner}; ${blocker.reason}`).join('\n');
  const requestIds = packet.agent6_ready_request_ids.map((id) => `- \`${id}\``).join('\n');
  const controlSurfaces = packet.relay_blocker.blocking_control_surfaces.map((surface) => `- \`${surface}\``).join('\n');
  const untracked = packet.source_files.untracked_quarantined_sources.map((sourcePath) => `- \`${sourcePath}\``).join('\n');
  const modified = packet.source_files.modified_tracked_license_normalization_sources.map((sourcePath) => `- \`${sourcePath}\``).join('\n');
  const nextActions = packet.next_owner_actions.map((row) => `- ${row.owner}: ${row.action}`).join('\n');
  const mustNotAccept = packet.must_not_accept.map((term) => `- ${term}`).join('\n');

  return `# Agent 1 Source Custody Current Blocker Packet

Generated: ${packet.generated_at}

Highest permissible claim: ${packet.highest_permissible_claim}.

This packet is blocker evidence only. It does not mutate Agent 6 queue/control files, Agent 5 handoff surfaces, source files, render outputs, or publication state.

## Summary

- Status: \`${packet.status}\`
- Refresh completed: \`${packet.refresh_completed_at}\`
- Publication state: \`${packet.boundary.publication_state}\`
- Live untracked source files: ${packet.current_source_scope.live_untracked_sources}
- Live modified tracked source files: ${packet.current_source_scope.live_modified_tracked_sources}
- Blocked direct/content-reference paths: ${packet.downstream_reliance.blocked_direct_artifact_paths}/${packet.downstream_reliance.blocked_content_reference_paths}
- Agent 6 disposition hits: ${packet.relay_blocker.agent6_disposition_hits}
- Agent 5/8 relay-signal hits: ${packet.relay_blocker.relay_signal_hits}

## Exact Blockers

${blockers}

## Current Request IDs

${requestIds}

## Missing Control Surfaces

${controlSurfaces}

Every current request ID is absent from every checked control surface. Agent 1 has prepared relay-ready evidence but must not mutate those surfaces.

## Source Files Still Awaiting Disposition

Untracked quarantined sources:

${untracked}

Modified tracked license-normalization sources:

${modified}

## Next Owner Actions

${nextActions}

## Must Not Accept

${mustNotAccept}

## Agent 8 Callback

- status: current Agent 1 source/provenance blocker packet prepared; awaiting-Agent-5-or-Agent-8 relay and Agent-6 disposition only
- artifact: \`${packet.source_artifacts.output_md}\`
- machine artifact: \`${packet.source_artifacts.output_json}\`
- blockers: ${packet.exact_blockers.map((blocker) => blocker.blocker_id).join('; ')}
- next action needed: Agent 5/Agent 8 relay or authorized queue insertion for the five exact request IDs, then Agent 6 pass/warn/block disposition
- continue condition: continue Agent 1 source/provenance evidence maintenance without render, staging, commit, publication, queue mutation, runtime validation, or custody acceptance
`;
}

function main() {
  const refresh = readJson(PATHS.refreshResult);
  const relayReadiness = readJson(PATHS.relayReadiness);
  const dispositionWatch = readJson(PATHS.dispositionWatch);
  const completionAudit = readJson(PATHS.completionAudit);
  const licenseActionPacket = readJson(PATHS.licenseActionPacket);
  const untrackedSources = readText(PATHS.untrackedList).split(/\r?\n/).filter(Boolean).sort((a, b) => a.localeCompare(b));
  const modifiedSources = licenseActionPacket.modified_tracked_sources.map((row) => row.source_path).sort((a, b) => a.localeCompare(b));

  const requestIds = relayReadiness.request_ids;
  const blocker = relayReadiness.blocker;
  const currentSourceScope = relayReadiness.current_source_scope;

  const packet = {
    generated_at: new Date().toISOString(),
    artifact_type: 'agent1_source_custody_current_blocker_packet',
    status: 'evidence_current_relay_and_disposition_blockers_open',
    highest_permissible_claim: 'source/provenance blocker evidence prepared for Agent 6-ready custody packets',
    refresh_completed_at: refresh.completed_at,
    source_artifacts: {
      refresh_result: PATHS.refreshResult,
      relay_readiness: PATHS.relayReadiness,
      disposition_watch: PATHS.dispositionWatch,
      completion_audit: PATHS.completionAudit,
      output_json: PATHS.outputJson,
      output_md: PATHS.outputMd
    },
    current_source_scope: {
      live_untracked_sources: currentSourceScope.live_untracked_sources,
      live_modified_tracked_sources: currentSourceScope.live_modified_tracked_sources,
      source_rows: currentSourceScope.source_rows,
      source_fingerprinted_rows: currentSourceScope.source_fingerprinted_rows,
      missing_lexical_manifest_gaps: currentSourceScope.missing_lexical_manifest_gaps
    },
    downstream_reliance: {
      blocked_direct_artifact_paths: currentSourceScope.blocked_downstream_direct_paths,
      blocked_content_reference_paths: currentSourceScope.blocked_downstream_content_reference_paths,
      route_or_hud_content_reference_rows: currentSourceScope.route_or_hud_content_reference_rows,
      reader_workbench_content_reference_rows: currentSourceScope.reader_workbench_content_reference_rows,
      public_lexical_content_reference_rows: currentSourceScope.public_lexical_content_reference_rows
    },
    source_files: {
      untracked_quarantined_sources: untrackedSources,
      modified_tracked_license_normalization_sources: modifiedSources
    },
    agent6_ready_request_ids: requestIds,
    relay_blocker: {
      blocker_id: blocker.blocker_id,
      blocking_control_surfaces: blocker.blocking_control_surfaces,
      missing_request_ids_everywhere: blocker.missing_request_ids_everywhere,
      agent6_disposition_watch_status: dispositionWatch.status,
      agent6_disposition_hits: completionAudit.current_evidence.agent6_disposition_hits,
      relay_signal_hits: completionAudit.current_evidence.relay_signal_hits,
      reason: blocker.reason
    },
    exact_blockers: [
      {
        blocker_id: 'source_provenance_custody_unaccepted',
        owner: 'Agent 6',
        reason: 'Source/provenance custody remains unaccepted; Agent 1 evidence remains evidence-ready / awaiting-Agent-6.'
      },
      {
        blocker_id: 'untracked_source_tracking_or_exclusion_pending',
        owner: 'Agent 6',
        count: untrackedSources.length,
        reason: '23 source files remain untracked/quarantined pending Agent 6 tracking or exclusion disposition.'
      },
      {
        blocker_id: 'modified_tracked_license_normalization_pending',
        owner: 'Agent 6',
        count: modifiedSources.length,
        reason: '6 modified tracked source files remain unaccepted pending Agent 6 license-normalization disposition.'
      },
      {
        blocker_id: blocker.blocker_id,
        owner: 'Agent 5 or Agent 8',
        count: requestIds.length,
        reason: blocker.reason
      },
      {
        blocker_id: 'agent6_disposition_absent_for_current_request_ids',
        owner: 'Agent 6',
        count: requestIds.length,
        reason: 'Agent 6 disposition watch reports zero Agent 6 disposition hits and zero relay-signal hits for the five current request IDs.'
      },
      {
        blocker_id: 'publication_blocked_no_render',
        owner: 'Agent 7 / release owner',
        reason: 'Publication remains blocked_no_render; this packet makes no publication readiness or public/runtime claim.'
      }
    ],
    next_owner_actions: completionAudit.next_owner_actions,
    boundary: {
      publication_state: 'blocked_no_render',
      queue_mutation_performed: false,
      source_provenance_custody_claimed: false,
      source_provenance_acceptance_claimed: false,
      source_publication_claimed: false,
      source_file_tracking_approval_claimed: false,
      source_file_staging_claimed: false,
      downstream_direct_artifact_acceptance_claimed: false,
      downstream_content_reference_acceptance_claimed: false,
      qa_acceptance_claimed: false,
      public_runtime_acceptance_claimed: false,
      route_publication_support_claimed: false,
      definition_authority_claimed: false,
      product_data_acceptance_claimed: false,
      usage_as_definition_authority_claimed: false,
      translation_output_claimed: false,
      accepted_translation_text_claimed: false,
      completion_claimed: false
    },
    must_not_accept: MUST_NOT_ACCEPT
  };

  writeJson(PATHS.outputJson, packet);
  writeText(PATHS.outputMd, renderMarkdown(packet));
  console.log(JSON.stringify({
    ok: true,
    output_json: PATHS.outputJson,
    output_md: PATHS.outputMd,
    status: packet.status,
    exact_blockers: packet.exact_blockers.map((row) => row.blocker_id)
  }, null, 2));
}

main();
