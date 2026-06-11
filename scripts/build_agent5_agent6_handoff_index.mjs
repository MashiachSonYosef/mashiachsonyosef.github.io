#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const queuePath = process.argv[2] || 'data/control/agent6_validation_queue.json';
const markdownPath = 'reports/agent5-agent6-handoff-index.md';
const jsonPath = 'reports/agent5-agent6-handoff-index.json';

const queue = readJson(queuePath);
const rows = (queue.queue || []).map(toRow).sort((a, b) => {
  const priorityDelta = Number(a.priority ?? 99) - Number(b.priority ?? 99);
  return priorityDelta || a.request_id.localeCompare(b.request_id);
});

const summary = {
  blockers: rows.filter((row) => row.disposition === 'blocker').length,
  accepted_with_boundary: rows.filter((row) => row.disposition === 'accepted_with_boundary').length,
  warning: rows.filter((row) => row.disposition === 'warning').length,
  pending: rows.filter((row) => row.disposition === 'pending').length,
  missing_evidence_artifacts: rows.reduce((sum, row) => sum + row.missing_evidence_artifacts.length, 0),
};

const result = {
  generated_at: new Date().toISOString(),
  artifact_type: 'agent5_agent6_handoff_index',
  queue: queuePath,
  publication_global_status: queue.publication_global_status,
  summary,
  rows,
  next_control_action: chooseNextAction(rows),
  boundary: [
    'This is an Agent 5 support index, not Agent 6 acceptance.',
    'Returned verdicts are summarized only inside the boundaries Agent 6 wrote.',
    'Publication remains blocked_no_render until Agent 6 validates a real publication render artifact row-by-row.',
  ],
};

writeJson(jsonPath, result);
writeMarkdown(markdownPath, result);

if (summary.missing_evidence_artifacts > 0) {
  console.error(`Handoff index found ${summary.missing_evidence_artifacts} missing evidence artifact(s). Report: ${markdownPath}`);
  process.exit(1);
}

console.log(`Agent 5 / Agent 6 handoff index built: ${markdownPath}`);

function toRow(item) {
  const evidence = Array.isArray(item.evidence_artifacts) ? item.evidence_artifacts : [];
  const missing = evidence.filter((artifact) => !fs.existsSync(path.join(root, artifact)));
  return {
    priority: item.priority,
    request_id: item.request_id,
    lane: laneFor(item),
    gate: item.gate,
    status: item.status || 'missing',
    disposition: dispositionFor(item.status || ''),
    scope: item.scope || '',
    evidence_artifacts: evidence.length,
    missing_evidence_artifacts: missing,
    next_agent6_action: item.next_agent6_action || '',
    next_agent5_action: item.next_agent5_action || '',
    claimed_boundary: item.claimed_boundary || '',
    what_must_not_be_accepted: item.what_must_not_be_accepted || [],
  };
}

function dispositionFor(status) {
  if (status === 'blocked_no_render' || status.startsWith('returned_blocked') || status.startsWith('returned_blocker')) return 'blocker';
  if (status.startsWith('returned_pass') || status.startsWith('returned_accepted')) return 'accepted_with_boundary';
  if (status.startsWith('returned_warn')) return 'warning';
  if (status === 'queued' || status.startsWith('queued_')) return 'pending';
  return 'review';
}

function laneFor(item) {
  const id = String(item.request_id || '').toLowerCase();
  const gate = String(item.gate || '').toLowerCase();
  const text = `${id} ${gate}`;
  if (mentionsAgent(text, 1) || gate.includes('source')) return 'Agent 1';
  if (mentionsAgent(text, 3) || gate.includes('usage')) return 'Agent 3';
  if (gate.includes('reader')) return 'Agent 4';
  if (gate.includes('hud_runtime') || gate.includes('public_runtime') || id.includes('route-hud-rollout-watch')) return 'Shared';
  if (mentionsAgent(text, 2) || gate.includes('route') || gate.includes('definition')) return 'Agent 2';
  if (mentionsAgent(text, 5) || id.includes('role') || gate.includes('role') || gate.includes('agent5_goal_management')) return 'Agent 5';
  if (id.includes('publication') || gate.includes('publication')) return 'Publication';
  return 'Shared';
}

function mentionsAgent(text, number) {
  return new RegExp(`\\bagent[-_\\s]*${number}\\b`).test(text);
}

function chooseNextAction(indexRows) {
  const missing = indexRows.find((row) => row.missing_evidence_artifacts.length > 0);
  if (missing) return `Fix missing evidence artifacts for ${missing.request_id}.`;

  const deuteronomyRuntimeReview = indexRows.find((row) => row.request_id === 'agent6-deuteronomy-source-of-truth-browser-runtime-review');
  if (deuteronomyRuntimeReview) {
    if (deuteronomyRuntimeReview.disposition === 'pending') {
      return 'Agent 6 review is queued for bounded Deuteronomy source-of-truth and browser-runtime evidence; do not duplicate Deuteronomy source-of-truth/browser proof, do not claim public/runtime acceptance, keep Genesis and /hud-preview separate, and keep non-conflicting worker lanes filled.';
    }
    if (String(deuteronomyRuntimeReview.status || '').includes('exact_live_deuteronomy_current_hud_runtime')) {
      return 'Deuteronomy exact live current-HUD runtime is WARN-accepted only for its sparse artifact boundary; stop Deuteronomy proof loops unless new drift appears; next public-runtime attention is separate Genesis and /hud-preview drift/quarantine treatment without broad acceptance.';
    }
  }

  const broaderRuntimeDrift = indexRows.find((row) =>
    row.request_id === 'agent6-broader-public-runtime-drift-intake' &&
    row.disposition === 'blocker'
  );
  if (broaderRuntimeDrift) {
    return 'Public-runtime attention should move to separate Genesis and /hud-preview drift/quarantine treatment; return post-remediation live evidence or an exact Pages/deployment blocker only, and do not bundle either lane into Deuteronomy acceptance.';
  }

  const deuteronomySourceOfTruth = indexRows.find((row) =>
    [
      'agent6-live-deuteronomy-old-hud-public-runtime-blocker',
      'agent6-public-runtime-license-risk-recheck-directive',
      'agent6-deuteronomy-option-a-route-selection',
    ].includes(row.request_id) &&
    (String(row.status || '').includes('live_deuteronomy_static_http_current_hud') ||
      String(row.status || '').includes('source_of_truth_open'))
  );
  if (deuteronomySourceOfTruth) {
    return 'P0 Deuteronomy static HTTP WARN is docketed; Agent 5 next action is a bounded deployment source-of-truth packet for data/public-hud/deuteronomy/**, with only bounded Deuteronomy browser-click proof at a safe checkpoint; do not claim public/runtime acceptance; keep Genesis and /hud-preview separate; keep non-conflicting lanes filled.';
  }

  const sourceBlocker = indexRows.find((row) => row.request_id === 'agent6-agent1-source-report-contradiction' && row.disposition === 'blocker');
  if (sourceBlocker) return 'Next upstream work should reduce Agent 1 source/provenance scope blocker before any source/provenance acceptance request.';

  const publicRuntimeLicenseRisk = indexRows.find((row) => row.request_id === 'agent6-public-runtime-license-risk-recheck-directive' && row.disposition === 'blocker');
  if (publicRuntimeLicenseRisk) {
    return 'P0 public-runtime license-risk blocker is active: prioritize owner-approved Deuteronomy deploy/swap or non-public quarantine delivery over local proof loops; keep /hud-preview separate unless the owner route intentionally includes broader public-surface quarantine; do not self-accept.';
  }

  const deuteronomyBlocker = indexRows.find((row) => row.request_id === 'agent6-live-deuteronomy-old-hud-public-runtime-blocker' && row.disposition === 'blocker');
  if (
    deuteronomyBlocker &&
    (String(deuteronomyBlocker.status || '').includes('owner_route_required') ||
      String(deuteronomyBlocker.status || '').includes('delivery_blocker_warn_accepted') ||
      String(deuteronomyBlocker.next_agent6_action || '').includes('exact delivery blocker'))
  ) {
    return 'Owner must choose exactly one Deuteronomy route before deploy/swap evidence: clean deploy branch/worktree, selected-artifact deployment path, or explicit divergent-main reconciliation authorization; keep broader Genesis and /hud-preview drift separate; do not self-accept.';
  }
  if (deuteronomyBlocker) return 'Execute bounded Deuteronomy deploy/swap or report exact delivery blocker; account for untracked root Reader Workbench assets and absent local .github workflow path; no more Deuteronomy pre-swap proof loops; keep broader Genesis and /hud-preview drift separate; do not self-accept.';

  const deuteronomyPostRemediation = indexRows.find((row) =>
    [
      'agent6-live-deuteronomy-old-hud-public-runtime-blocker',
      'agent6-public-runtime-license-risk-recheck-directive',
      'agent6-deuteronomy-option-a-route-selection',
    ].includes(row.request_id) &&
    String(row.status || '').includes('queued_post_remediation_deuteronomy_live_evidence_for_agent6_review_blocker_not_accepted')
  );
  if (deuteronomyPostRemediation) {
    return 'P0 Deuteronomy post-remediation live evidence is queued for Agent 6 review; monitor for a dated pass/warn/block docket, do not claim live public/runtime acceptance, keep Genesis and /hud-preview separate, and keep non-conflicting worker lanes filled.';
  }

  const pending = indexRows.find((row) => row.disposition === 'pending');
  if (pending) return `Wait for Agent 6 on ${pending.request_id}; keep non-conflicting worker lanes filled and do not self-accept.`;

  return 'No routine Agent 6 queue nudge needed; wait for new worker evidence or a changed gate.';
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, data) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function writeMarkdown(relativePath, data) {
  const blockers = data.rows.filter((row) => row.disposition === 'blocker');
  const bounded = data.rows.filter((row) => row.disposition === 'accepted_with_boundary');
  const warnings = data.rows.filter((row) => row.disposition === 'warning');
  const pending = data.rows.filter((row) => row.disposition === 'pending');
  const lines = [
    '# Agent 5 / Agent 6 Handoff Index',
    '',
    `Generated: ${data.generated_at}`,
    '',
    '## Summary',
    '',
    `- Publication global status: ${data.publication_global_status}`,
    `- Blockers: ${data.summary.blockers}`,
    `- Accepted with boundary: ${data.summary.accepted_with_boundary}`,
    `- Warnings: ${data.summary.warning}`,
    `- Pending: ${data.summary.pending}`,
    `- Missing evidence artifacts: ${data.summary.missing_evidence_artifacts}`,
    `- Next control action: ${data.next_control_action}`,
    '',
    '## Queue Index',
    '',
    '| priority | lane | gate | status | disposition | evidence | missing |',
    '|---:|---|---|---|---|---:|---:|',
    ...data.rows.map((row) => `| ${row.priority ?? ''} | ${cell(row.lane)} | ${cell(row.gate)} | ${cell(row.status)} | ${cell(row.disposition)} | ${row.evidence_artifacts} | ${row.missing_evidence_artifacts.length} |`),
    '',
    '## Blockers',
    '',
    ...(blockers.length ? blockers.map((row) => `- ${row.lane}: ${row.status}. ${blockerSummary(row)}`) : ['- none']),
    '',
    '## Accepted Only Within Boundary',
    '',
    ...(bounded.length ? bounded.map((row) => `- ${row.lane}: ${row.status}. Must not accept: ${list(row.what_must_not_be_accepted)}`) : ['- none']),
    '',
    '## Warnings',
    '',
    ...(warnings.length ? warnings.map((row) => `- ${row.lane}: ${row.status}. ${row.next_agent6_action || row.claimed_boundary}`) : ['- none']),
    '',
    '## Pending Agent 6 Items',
    '',
    ...(pending.length ? pending.map((row) => `- ${row.request_id}: ${row.next_agent6_action || 'await Agent 6 docket'}`) : ['- none']),
    '',
    '## Boundary',
    '',
    ...data.boundary.map((line) => `- ${line}`),
    '',
  ];
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${lines.join('\n')}\n`, 'utf8');
}

function blockerSummary(row) {
  if (row.request_id === 'agent6-live-deuteronomy-old-hud-public-runtime-blocker') {
    return row.next_agent5_action || row.next_agent6_action || row.claimed_boundary;
  }
  return row.next_agent6_action || row.next_agent5_action || row.claimed_boundary;
}

function cell(value) {
  return String(value ?? '').replace(/\|/g, '/').replace(/\r?\n/g, ' ');
}

function list(value) {
  if (Array.isArray(value)) return value.join('; ');
  return String(value || 'none');
}
