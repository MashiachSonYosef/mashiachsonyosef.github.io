#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const outputJsonPath = path.join(repoRoot, 'reports', 'agent1-source-custody-queue-refresh-notice.json');
const outputMdPath = path.join(repoRoot, 'reports', 'agent1-source-custody-queue-refresh-notice.md');

const paths = {
  packet: 'reports/agent1-source-provenance-custody-packet.json',
  validator: 'reports/agent1-source-provenance-custody-validator-result.json',
  decision: 'reports/agent1-agent6-source-custody-decision-packet.json',
  diagnostics: 'reports/agent1-source-custody-reference-diagnostics.json',
  queue: 'data/control/agent6_validation_queue.json',
  goalBoard: 'data/control/agent_goal_board.json',
  handoffJson: 'reports/agent5-agent6-handoff-index.json',
  handoffMd: 'reports/agent5-agent6-handoff-index.md',
};

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function readTextIfExists(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, 'utf8') : '';
}

function writeJson(fullPath, value) {
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function queueItems(queue) {
  if (Array.isArray(queue)) return queue;
  return queue.queue || queue.items || queue.requests || [];
}

function stringify(value) {
  return JSON.stringify(value, null, 2);
}

function findQueueItem(items, requestId) {
  return items.find((item) => item.request_id === requestId) || null;
}

function staleMarkers(text, current) {
  const stale = [];
  if (text.includes('downstream content-reference rows: 61')
    || text.includes('61 downstream content-reference')
    || text.includes('"downstream_content_reference_rows": 61')
    || text.includes('61 content-reference rows')) {
    stale.push('stale_61_content_reference_rows');
  }
  if (text.includes('2026-06-02T01:02:52.908Z') && current.packet_generated_at !== '2026-06-02T01:02:52.908Z') {
    stale.push('historical_2026-06-02T01:02:52.908Z_packet_timestamp');
  }
  if (!text.includes(String(current.blocked_content_reference_rows))) {
    stale.push(`missing_current_${current.blocked_content_reference_rows}_content_reference_rows`);
  }
  if (!text.includes(current.packet_generated_at)) {
    stale.push('missing_current_packet_timestamp');
  }
  return [...new Set(stale)];
}

function summarizeSurface(label, relativePath, text, current) {
  return {
    label,
    path: relativePath,
    exists: Boolean(text),
    stale_markers: staleMarkers(text, current),
  };
}

function renderMarkdown(report) {
  const lines = [];
  lines.push(
    '# Agent 1 Source Custody Queue Refresh Notice',
    '',
    `Generated: ${report.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Agent 1 evidence notice only.',
    '- No queue/control files were edited by this notice.',
    '- No source/provenance acceptance, publication readiness, page/render acceptance, route support, Definition authority, or accepted translation text is claimed.',
    `- Publication state remains \`${report.boundary.publication_state}\`.`,
    '',
    '## Current Evidence',
    '',
    `- Packet generated at: \`${report.current.packet_generated_at}\``,
    `- Decision packet generated at: \`${report.current.decision_generated_at}\``,
    `- Validator OK: ${report.current.validator_ok ? 'true' : 'false'}`,
    `- Untracked quarantined sources: ${report.current.untracked_quarantined_sources}`,
    `- Modified tracked source rows: ${report.current.modified_tracked_sources}`,
    `- Source fingerprints: ${report.current.source_fingerprinted_rows}/${report.current.source_rows}`,
    `- Missing lexical manifests: ${report.current.missing_lexical_manifests}`,
    `- Blocked downstream direct paths: ${report.current.blocked_downstream_direct_paths}`,
    `- Blocked downstream content-reference rows: ${report.current.blocked_content_reference_rows}`,
    `- Reference diagnostics report/audit rows: ${report.current.report_or_audit_reference_rows}`,
    '',
    '## Control Surface Freshness',
    '',
    '| Surface | Exists | Stale markers |',
    '| --- | --- | --- |',
  );
  for (const surface of report.control_surface_observations) {
    lines.push(`| \`${surface.path}\` | ${surface.exists ? 'yes' : 'no'} | ${surface.stale_markers.length ? surface.stale_markers.join(', ') : 'none'} |`);
  }
  lines.push(
    '',
    '## Requested Follow-Up',
    '',
    '- Agent 5 should sync queue/handoff surfaces to the current Agent 1 packet if those surfaces are being used for Agent 6 intake.',
    '- Agent 6 should treat this as evidence freshness metadata only, not as source/provenance acceptance.',
    '',
  );
  return lines.join('\n');
}

const packet = readJson(paths.packet);
const validator = readJson(paths.validator);
const decision = readJson(paths.decision);
const diagnostics = readJson(paths.diagnostics);
const queue = readJson(paths.queue);
const queueText = stringify(queue);
const goalBoardText = readTextIfExists(paths.goalBoard);
const handoffJsonText = readTextIfExists(paths.handoffJson);
const handoffMdText = readTextIfExists(paths.handoffMd);
const items = queueItems(queue);
const current = {
  packet_generated_at: packet.generated_at,
  decision_generated_at: decision.generated_at,
  validator_ok: validator.ok === true,
  untracked_quarantined_sources: packet.summary?.untracked_count,
  modified_tracked_sources: packet.summary?.modified_tracked_count,
  source_rows: packet.summary?.source_rows,
  source_fingerprinted_rows: packet.summary?.source_fingerprinted_rows,
  missing_lexical_manifests: packet.summary?.untracked_missing_lexical_manifest,
  blocked_downstream_direct_paths: decision.summary?.blocked_downstream_direct_paths,
  blocked_content_reference_rows: decision.summary?.blocked_downstream_content_reference_paths,
  report_or_audit_reference_rows: diagnostics.summary?.report_or_audit_reference_rows,
};

const closureItem = findQueueItem(items, 'agent6-agent1-source-custody-closure-decision-packet');
const provenanceItem = findQueueItem(items, 'agent6-agent1-source-provenance-custody-packet');
const report = {
  generated_at: new Date().toISOString(),
  artifact_type: 'agent1_source_custody_queue_refresh_notice',
  current,
  queue_items: {
    source_custody_closure_decision_packet: closureItem ? {
      status: closureItem.status,
      stale_markers: staleMarkers(stringify(closureItem), current),
    } : null,
    source_provenance_custody_packet: provenanceItem ? {
      status: provenanceItem.status,
      stale_markers: staleMarkers(stringify(provenanceItem), current),
    } : null,
  },
  control_surface_observations: [
    summarizeSurface('agent6 queue', paths.queue, queueText, current),
    summarizeSurface('agent goal board', paths.goalBoard, goalBoardText, current),
    summarizeSurface('Agent 5 handoff JSON', paths.handoffJson, handoffJsonText, current),
    summarizeSurface('Agent 5 handoff Markdown', paths.handoffMd, handoffMdText, current),
  ],
  boundary: {
    agent1_status: 'evidence-ready / awaiting-Agent-6',
    publication_state: 'blocked_no_render',
    source_provenance_acceptance_claimed: false,
    public_runtime_acceptance_claimed: false,
    route_publication_support_claimed: false,
    definition_authority_claimed: false,
    page_render_acceptance_claimed: false,
  },
  must_not_be_accepted: packet.must_not_be_accepted || [],
};

writeJson(outputJsonPath, report);
fs.writeFileSync(outputMdPath, renderMarkdown(report), 'utf8');
console.log(JSON.stringify({
  ok: true,
  output_json: path.relative(repoRoot, outputJsonPath).replace(/\\/g, '/'),
  output_md: path.relative(repoRoot, outputMdPath).replace(/\\/g, '/'),
  current,
  stale_surface_count: report.control_surface_observations.filter((surface) => surface.stale_markers.length).length,
  boundary: report.boundary,
}, null, 2));
