#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const outputJsonPath = path.join(repoRoot, 'reports', 'agent1-source-custody-queue-intake-candidate.json');
const outputMdPath = path.join(repoRoot, 'reports', 'agent1-source-custody-queue-intake-candidate.md');

const queueItemId = 'agent6-agent1-source-custody-closure-decision-packet';

const paths = {
  queue: 'data/control/agent6_validation_queue.json',
  custodyPacket: 'reports/agent1-source-provenance-custody-packet.json',
  decisionPacket: 'reports/agent1-agent6-source-custody-decision-packet.json',
  quarantineManifest: 'reports/agent1-downstream-quarantine-manifest.json',
  referenceDiagnostics: 'reports/agent1-source-custody-reference-diagnostics.json',
  controlSyncPacket: 'reports/agent1-source-custody-control-sync-packet.json',
};

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function writeJson(fullPath, value) {
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function staleMarkers(item, current) {
  const text = JSON.stringify(item);
  const markers = [];
  const staleContentCounts = [...text.matchAll(/\b(?:61|64)\b/g)].map((match) => match[0]);
  for (const count of uniqueSorted(staleContentCounts)) {
    if (Number(count) !== current.blocked_content_reference_rows) {
      markers.push(`stale_${count}_content_reference_rows`);
    }
  }
  if (!text.includes(current.packet_generated_at)) {
    markers.push('missing_current_packet_timestamp');
  }
  if (!text.includes(current.decision_generated_at)) {
    markers.push('missing_current_decision_packet_timestamp');
  }
  if (!text.includes(String(current.blocked_content_reference_rows))) {
    markers.push(`missing_current_${current.blocked_content_reference_rows}_content_reference_rows`);
  }
  return uniqueSorted(markers);
}

function renderMarkdown(packet) {
  const candidate = packet.queue_item_candidate;
  const lines = [];
  lines.push(
    '# Agent 1 Source Custody Queue Intake Candidate',
    '',
    `Generated: ${packet.generated_at}`,
    '',
    '## Boundary',
    '',
    '- This is a non-mutating Agent 1 queue-intake candidate for Agent 5/6.',
    '- No queue/control file was edited by this packet.',
    '- No source/provenance acceptance, publication readiness, public/runtime acceptance, page/render acceptance, route publication support, Definition authority, product/data gate acceptance, or accepted translation text is claimed.',
    `- Publication state remains \`${packet.boundary.publication_state}\`.`,
    '',
    '## Current Candidate',
    '',
    `- Request ID: \`${candidate.request_id}\``,
    `- Status: \`${candidate.status}\``,
    `- Gate: \`${candidate.gate}\``,
    `- Priority: ${candidate.priority}`,
    `- Current custody source rows: ${packet.current.custody_source_rows}`,
    `- Track-candidate source files: ${packet.current.track_candidate_source_files}`,
    `- Missing-manifest source files: ${packet.current.missing_manifest_source_files}`,
    `- Modified tracked source files: ${packet.current.modified_tracked_source_files}`,
    `- Blocked downstream direct paths: ${packet.current.blocked_downstream_direct_paths}`,
    `- Blocked content-reference paths: ${packet.current.blocked_content_reference_rows}`,
    `- Route/HUD content-reference rows: ${packet.current.route_or_hud_content_reference_rows}`,
    `- Reader/workbench content-reference rows: ${packet.current.reader_workbench_content_reference_rows}`,
    `- Translation-memory content-reference rows: ${packet.current.translation_memory_content_reference_rows}`,
    `- Public lexical content-reference rows: ${packet.current.public_lexical_content_reference_rows}`,
    '',
    '## Existing Queue Item Drift',
    '',
    `- Existing queue item found: ${packet.existing_queue_item.exists ? 'yes' : 'no'}`,
    `- Existing queue item status: \`${packet.existing_queue_item.status || '(missing)'}\``,
    `- Existing queue stale markers: ${packet.existing_queue_item.stale_markers.join(', ') || '(none)'}`,
    '',
    '## What Changed Since Last Agent 6 Ruling',
    '',
    candidate.what_changed_since_last_agent6_ruling,
    '',
    '## What Must Not Be Accepted',
    '',
  );
  for (const item of candidate.what_must_not_be_accepted || []) {
    lines.push(`- ${item}`);
  }
  lines.push('');
  return lines.join('\n');
}

const queue = readJson(paths.queue);
const custodyPacket = readJson(paths.custodyPacket);
const decisionPacket = readJson(paths.decisionPacket);
const quarantineManifest = readJson(paths.quarantineManifest);
const referenceDiagnostics = readJson(paths.referenceDiagnostics);
const controlSyncPacket = readJson(paths.controlSyncPacket);
const existingQueueItem = (queue.queue || []).find((item) => item.request_id === queueItemId);

const current = {
  packet_generated_at: custodyPacket.generated_at,
  decision_generated_at: decisionPacket.generated_at,
  custody_source_rows: decisionPacket.summary?.custody_source_rows,
  track_candidate_source_files: decisionPacket.summary?.track_candidate_source_files,
  missing_manifest_source_files: decisionPacket.summary?.missing_manifest_source_files,
  modified_tracked_source_files: decisionPacket.summary?.modified_tracked_source_files,
  blocked_downstream_direct_paths: decisionPacket.summary?.blocked_downstream_direct_paths,
  blocked_content_reference_rows: decisionPacket.summary?.blocked_downstream_content_reference_paths,
  route_or_hud_content_reference_rows: referenceDiagnostics.bucket_counts?.route_cards_or_hud_surfaces?.row_hit_count,
  reader_workbench_content_reference_rows: referenceDiagnostics.bucket_counts?.reader_workbench_artifacts?.row_hit_count,
  translation_memory_content_reference_rows: referenceDiagnostics.bucket_counts?.translation_memory_paths?.row_hit_count,
  public_lexical_content_reference_rows: referenceDiagnostics.bucket_counts?.public_lexical_exports?.row_hit_count,
  report_or_audit_reference_rows: referenceDiagnostics.summary?.report_or_audit_reference_rows,
};

const evidenceArtifacts = uniqueSorted([
  'reports/agent1-agent6-source-custody-decision-packet.md',
  'reports/agent1-agent6-source-custody-decision-packet.json',
  'reports/agent1-source-custody-queue-intake-candidate.md',
  'reports/agent1-source-custody-queue-intake-candidate.json',
  'reports/agent1-source-custody-control-sync-packet.md',
  'reports/agent1-source-custody-control-sync-packet.json',
  'reports/agent1-source-custody-queue-refresh-notice.md',
  'reports/agent1-source-custody-queue-refresh-notice.json',
  'reports/agent1-source-custody-reference-diagnostics.md',
  'reports/agent1-source-custody-reference-diagnostics.json',
  'reports/agent1-source-custody-closure-options.md',
  'reports/agent1-source-custody-closure-options.json',
  'reports/agent1-source-custody-reconciliation-preflight.md',
  'reports/agent1-source-custody-reconciliation-preflight.json',
  'reports/agent1-source-custody-refresh-result.md',
  'reports/agent1-source-custody-refresh-result.json',
  'reports/agent1-source-provenance-custody-packet.md',
  'reports/agent1-source-provenance-custody-packet.json',
  'reports/agent1-downstream-quarantine-manifest.md',
  'reports/agent1-downstream-quarantine-manifest.json',
  'reports/agent1-custody-blocklist.md',
  'reports/agent1-custody-blocklist.json',
  'reports/agent1-source-provenance-custody-validator-result.json',
  'reports/agent1-state.md',
  'scripts/refresh_agent1_source_custody_evidence.mjs',
  'scripts/build_agent1_source_custody_packet.mjs',
  'scripts/build_agent1_source_custody_reference_diagnostics.mjs',
  'scripts/build_agent1_source_custody_closure_options.mjs',
  'scripts/build_agent1_source_custody_reconciliation_preflight.mjs',
  'scripts/build_agent1_agent6_source_custody_decision_packet.mjs',
  'scripts/build_agent1_source_custody_queue_refresh_notice.mjs',
  'scripts/build_agent1_source_custody_control_sync_packet.mjs',
  'scripts/build_agent1_source_custody_queue_intake_candidate.mjs',
  'scripts/validate_agent1_source_custody_packet.mjs',
  ...(existingQueueItem?.evidence_artifacts || []),
]);

const queueItemCandidate = {
  request_id: queueItemId,
  submitted_by: 'Agent 5',
  gate: 'source_provenance_custody_gate',
  scope: 'Agent 1 source/provenance custody closure decision packet for tracking/exclusion/remediation disposition after corrected custody mapping WARN docket',
  status: 'queued_awaiting_agent6_source_custody_closure_decision',
  priority: 0,
  evidence_artifacts: evidenceArtifacts,
  requested_verdict: 'pass_warn_block_source_custody_closure_decision_packet',
  claimed_boundary: 'Agent 1 produced an Agent 6 decision-input packet only after the corrected custody/reliance mapping WARN docket. The packet asks Agent 6 to decide whether 17 untracked source files with lexical manifests may proceed to source-file tracking review, how to handle 6 untracked source files missing lexical manifests, whether 6 modified tracked source files may be treated as PD-to-Public-Domain license-label normalization drift, and which downstream direct artifacts and content references must remain blocked after each source decision. This is not source/provenance acceptance, not source publication, not page/render acceptance, not public/runtime acceptance, not publication readiness, not future publication support, not route publication support, not Definition authority, not product/data gate acceptance, and not accepted translation text. Publication remains blocked_no_render.',
  known_risks: [
    'a decision-input packet could be misread as Agent 6 acceptance of tracking, exclusion, remediation, or modified tracked source drift',
    '17 track-candidate untracked sources have lexical manifests but downstream artifacts remain blocked until separate Agent 6 acceptance',
    '6 untracked sources still lack lexical manifests and require remediation or explicit exclusion/quarantine',
    '6 modified tracked source files are represented as license-label normalization drift only and remain outside source/provenance acceptance',
    `${current.blocked_downstream_direct_paths} downstream direct artifact rows and ${current.blocked_content_reference_rows} content-reference rows remain blocked unless Agent 6 dockets a narrower disposition`,
    `${current.route_or_hud_content_reference_rows} route/HUD content-reference rows, ${current.reader_workbench_content_reference_rows} Reader/workbench content-reference rows, ${current.translation_memory_content_reference_rows} translation-memory content-reference rows, and ${current.public_lexical_content_reference_rows} public lexical content-reference rows remain blocked under the current custody packet`,
    'tracking source files without downstream reliance controls could imply publication support',
    'missing lexical manifests could be hidden if the packet is treated as clean closure',
    'worker output and Agent 5 queue intake are not QA acceptance',
  ],
  what_changed_since_last_agent6_ruling: `Agent 6 issued reports/agent6-agent1-corrected-custody-recheck-verdict-2026-06-02.md as WARN-ACCEPTED for corrected custody/reliance mapping evidence only, while source/provenance acceptance remained BLOCKED. Agent 1 refreshed custody evidence at ${current.packet_generated_at} and produced reports/agent1-agent6-source-custody-decision-packet.md/json at ${current.decision_generated_at}. The refreshed decision packet reports ${current.track_candidate_source_files} untracked track candidates with lexical manifests, ${current.missing_manifest_source_files} untracked sources missing lexical manifests requiring remediation or explicit exclusion/quarantine, ${current.modified_tracked_source_files} modified tracked license-label normalization review rows, ${current.blocked_downstream_direct_paths} blocked direct artifact paths, and ${current.blocked_content_reference_rows} blocked content-reference paths (${current.route_or_hud_content_reference_rows} route/HUD, ${current.reader_workbench_content_reference_rows} Reader/workbench, ${current.translation_memory_content_reference_rows} translation-memory, ${current.public_lexical_content_reference_rows} public lexical).`,
  what_must_not_be_accepted: [
    ...(decisionPacket.must_not_be_accepted || custodyPacket.must_not_be_accepted || []),
    'source publication',
    'tracking/exclusion/remediation approval without an Agent 6 dated docket',
    'downstream direct artifacts or content references as publication support',
  ].filter((value, index, array) => array.indexOf(value) === index),
  next_agent6_action: 'Issue a dated pass/warn/block decision on the source custody closure disposition questions: 17 source-file track candidates, 6 missing lexical manifest remediation/exclusion cases, 6 modified tracked license-label normalization rows, and downstream blocked artifact/content-reference handling.',
  next_agent5_action: 'If using data/control/agent6_validation_queue.json for Agent 6 intake, replace stale source-custody closure queue metadata with this candidate or mark the older metadata as historical. Do not stage, track, delete, render, publish, or claim source/provenance acceptance before Agent 6 returns a closure/disposition docket.',
};

const output = {
  generated_at: new Date().toISOString(),
  artifact_type: 'agent1_source_custody_queue_intake_candidate',
  source_artifacts: paths,
  current,
  existing_queue_item: {
    request_id: queueItemId,
    exists: Boolean(existingQueueItem),
    status: existingQueueItem?.status,
    stale_markers: existingQueueItem ? staleMarkers(existingQueueItem, current) : ['missing_queue_item'],
  },
  queue_item_candidate: queueItemCandidate,
  control_sync_packet: {
    path: 'reports/agent1-source-custody-control-sync-packet.json',
    stale_control_surface_count: controlSyncPacket.stale_control_surfaces?.length || 0,
    requested_agent5_action: controlSyncPacket.requested_agent5_action,
  },
  boundary: {
    agent1_status: 'evidence-ready / awaiting-Agent-6',
    publication_state: 'blocked_no_render',
    source_provenance_acceptance_claimed: false,
    public_runtime_acceptance_claimed: false,
    route_publication_support_claimed: false,
    definition_authority_claimed: false,
    page_render_acceptance_claimed: false,
  },
  must_not_be_accepted: queueItemCandidate.what_must_not_be_accepted,
};

writeJson(outputJsonPath, output);
fs.writeFileSync(outputMdPath, renderMarkdown(output), 'utf8');
console.log(JSON.stringify({
  ok: true,
  output_json: path.relative(repoRoot, outputJsonPath).replace(/\\/g, '/'),
  output_md: path.relative(repoRoot, outputMdPath).replace(/\\/g, '/'),
  current,
  existing_queue_stale_markers: output.existing_queue_item.stale_markers,
  boundary: output.boundary,
}, null, 2));
