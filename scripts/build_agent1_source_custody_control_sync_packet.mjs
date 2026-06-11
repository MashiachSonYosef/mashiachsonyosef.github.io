#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const outputJsonPath = path.join(repoRoot, 'reports', 'agent1-source-custody-control-sync-packet.json');
const outputMdPath = path.join(repoRoot, 'reports', 'agent1-source-custody-control-sync-packet.md');

const paths = {
  packet: 'reports/agent1-source-provenance-custody-packet.json',
  validator: 'reports/agent1-source-provenance-custody-validator-result.json',
  decision: 'reports/agent1-agent6-source-custody-decision-packet.json',
  queueNotice: 'reports/agent1-source-custody-queue-refresh-notice.json',
  referenceDiagnostics: 'reports/agent1-source-custody-reference-diagnostics.json',
};

const expectedControlSurfacePaths = [
  'data/control/agent6_validation_queue.json',
  'data/control/agent_goal_board.json',
  'reports/agent5-agent6-handoff-index.json',
  'reports/agent5-agent6-handoff-index.md',
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function writeJson(fullPath, value) {
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function fileInfo(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    return { path: relativePath, exists: false };
  }
  const stat = fs.statSync(fullPath);
  return {
    path: relativePath,
    exists: true,
    bytes: stat.size,
    mtime: stat.mtime.toISOString(),
  };
}

function renderMarkdown(packet) {
  const lines = [];
  lines.push(
    '# Agent 1 Source Custody Control Sync Packet',
    '',
    `Generated: ${packet.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Agent 1 evidence/control-sync request only.',
    '- No control files were edited by this packet.',
    '- No source/provenance acceptance, source publication, page/render acceptance, public/runtime acceptance, route support, Definition authority, product/data gate acceptance, or accepted translation text is claimed.',
    `- Publication state remains \`${packet.boundary.publication_state}\`.`,
    '',
    '## Current Validated Evidence',
    '',
    `- Packet generated at: \`${packet.current.packet_generated_at}\``,
    `- Decision packet generated at: \`${packet.current.decision_generated_at}\``,
    `- Validator OK: ${packet.current.validator_ok ? 'true' : 'false'}`,
    `- Quarantined untracked sources: ${packet.current.untracked_quarantined_sources}`,
    `- Modified tracked source rows: ${packet.current.modified_tracked_sources}`,
    `- Source fingerprints: ${packet.current.source_fingerprinted_rows}/${packet.current.source_rows}`,
    `- Missing lexical manifests: ${packet.current.missing_lexical_manifests}`,
    `- Blocked downstream direct paths: ${packet.current.blocked_downstream_direct_paths}`,
    `- Blocked downstream content-reference rows: ${packet.current.blocked_content_reference_rows}`,
    `- Route/HUD content-reference rows: ${packet.current.route_or_hud_content_reference_rows}`,
    `- Reader/workbench content-reference rows: ${packet.current.reader_workbench_content_reference_rows}`,
    `- Translation-memory content-reference rows: ${packet.current.translation_memory_content_reference_rows}`,
    `- Public lexical content-reference rows: ${packet.current.public_lexical_content_reference_rows}`,
    `- Report/audit self-reference rows: ${packet.current.report_or_audit_reference_rows}`,
    '',
    '## Stale Control Surfaces',
    '',
    '| Surface | Exists | Stale markers |',
    '| --- | --- | --- |',
  );
  for (const surface of packet.stale_control_surfaces) {
    lines.push(`| \`${surface.path}\` | ${surface.file.exists ? 'yes' : 'no'} | ${surface.stale_markers.join(', ')} |`);
  }
  lines.push(
    '',
    '## Requested Agent 5 Action',
    '',
    `- If these control surfaces are being used for Agent 6 intake, sync them to packet \`${packet.current.packet_generated_at}\` and decision packet \`${packet.current.decision_generated_at}\`.`,
    `- Replace stale content-reference counts with the current count: ${packet.current.blocked_content_reference_rows}.`,
    '- Preserve the Agent 6 boundary: this packet is not source/provenance custody acceptance.',
    '',
    '## Must Not Be Accepted',
    '',
  );
  for (const item of packet.must_not_be_accepted || []) {
    lines.push(`- ${item}`);
  }
  lines.push('');
  return lines.join('\n');
}

const sourcePacket = readJson(paths.packet);
const validator = readJson(paths.validator);
const decision = readJson(paths.decision);
const queueNotice = readJson(paths.queueNotice);
const referenceDiagnostics = readJson(paths.referenceDiagnostics);
const current = {
  packet_generated_at: sourcePacket.generated_at,
  decision_generated_at: decision.generated_at,
  validator_ok: validator.ok === true,
  untracked_quarantined_sources: sourcePacket.summary?.untracked_count,
  modified_tracked_sources: sourcePacket.summary?.modified_tracked_count,
  source_rows: sourcePacket.summary?.source_rows,
  source_fingerprinted_rows: sourcePacket.summary?.source_fingerprinted_rows,
  missing_lexical_manifests: sourcePacket.summary?.untracked_missing_lexical_manifest,
  blocked_downstream_direct_paths: decision.summary?.blocked_downstream_direct_paths,
  blocked_content_reference_rows: decision.summary?.blocked_downstream_content_reference_paths,
  route_or_hud_content_reference_rows: referenceDiagnostics.bucket_counts?.route_cards_or_hud_surfaces?.row_hit_count,
  reader_workbench_content_reference_rows: referenceDiagnostics.bucket_counts?.reader_workbench_artifacts?.row_hit_count,
  translation_memory_content_reference_rows: referenceDiagnostics.bucket_counts?.translation_memory_paths?.row_hit_count,
  public_lexical_content_reference_rows: referenceDiagnostics.bucket_counts?.public_lexical_exports?.row_hit_count,
  report_or_audit_reference_rows: queueNotice.current?.report_or_audit_reference_rows,
};

const observedControlSurfaces = (queueNotice.control_surface_observations || [])
  .map((surface) => ({
    ...surface,
    file: fileInfo(surface.path),
  }));

const packet = {
  generated_at: new Date().toISOString(),
  artifact_type: 'agent1_source_custody_control_sync_packet',
  current,
  expected_control_surfaces: expectedControlSurfacePaths.map(fileInfo),
  observed_control_surfaces: observedControlSurfaces,
  stale_control_surfaces: observedControlSurfaces
    .filter((surface) => (surface.stale_markers || []).length > 0)
    .map((surface) => ({
      path: surface.path,
      stale_markers: surface.stale_markers,
      file: surface.file,
    })),
  requested_agent5_action: {
    action: 'sync_queue_goal_board_and_handoff_surfaces_to_current_agent1_custody_packet_or_mark_prior_metadata_as_historical',
    target_packet_generated_at: current.packet_generated_at,
    target_decision_packet_generated_at: current.decision_generated_at,
    target_blocked_content_reference_rows: current.blocked_content_reference_rows,
    stale_control_surface_paths: observedControlSurfaces
      .filter((surface) => (surface.stale_markers || []).length > 0)
      .map((surface) => surface.path),
    boundary: 'Agent 1 is requesting control-surface sync only; Agent 6 remains the custody acceptance authority.',
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
  must_not_be_accepted: sourcePacket.must_not_be_accepted || [],
};

writeJson(outputJsonPath, packet);
fs.writeFileSync(outputMdPath, renderMarkdown(packet), 'utf8');
console.log(JSON.stringify({
  ok: true,
  output_json: path.relative(repoRoot, outputJsonPath).replace(/\\/g, '/'),
  output_md: path.relative(repoRoot, outputMdPath).replace(/\\/g, '/'),
  current,
  stale_control_surface_count: packet.stale_control_surfaces.length,
  boundary: packet.boundary,
}, null, 2));
