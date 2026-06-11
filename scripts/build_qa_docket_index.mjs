#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const queuePath = process.argv[2] || 'data/control/agent6_validation_queue.json';
const outputPath = process.argv[3] || 'data/control/qa_docket_index.json';

const queue = readJson(queuePath);
const dockets = (queue.queue || []).map(toDocket).sort((a, b) => {
  const priorityDelta = Number(a.priority ?? 99) - Number(b.priority ?? 99);
  return priorityDelta || a.id.localeCompare(b.id);
});

const output = {
  generated_at: new Date().toISOString(),
  artifact_type: 'agent5_qa_docket_index',
  version: Number(queue.version || 0) + 1,
  source_queue: queuePath,
  source_queue_version: queue.version,
  qa_authority: 'Agent 6',
  publication_global_status: queue.publication_global_status || 'blocked_no_render',
  boundary: [
    'This index is generated from the Agent 6 validation queue for recountable control state.',
    'It summarizes queue/docket state only and does not create QA acceptance.',
    'Only dated Agent 6 dockets can create pass/warn/block dispositions.',
    'Publication remains blocked_no_render until Agent 6 validates a real render artifact row-by-row.',
  ],
  summary: {
    total: dockets.length,
    blockers: dockets.filter((docket) => dispositionFor(docket.status) === 'blocker').length,
    warnings: dockets.filter((docket) => dispositionFor(docket.status) === 'warning').length,
    accepted_with_boundary: dockets.filter((docket) => dispositionFor(docket.status) === 'accepted_with_boundary').length,
    pending: dockets.filter((docket) => dispositionFor(docket.status) === 'pending').length,
  },
  dockets,
};

writeJson(outputPath, output);
console.log(`QA docket index built from ${queuePath}: ${outputPath}`);

function toDocket(item) {
  return {
    id: item.request_id,
    status: item.status || 'missing',
    priority: item.priority,
    prompt_state: promptStateFor(item),
    gate: item.gate || '',
    brief: primaryBrief(item),
    returned_docket: item.returned_docket || '',
    returned_verdict: item.returned_verdict || item.next_agent6_action || item.claimed_boundary || '',
    returned_boundary: item.returned_boundary || '',
    acceptance_condition: item.acceptance_condition || '',
    claimed_boundary: item.claimed_boundary || '',
    focus: Array.isArray(item.focus) ? item.focus : [],
    evidence_artifacts: Array.isArray(item.evidence_artifacts) ? item.evidence_artifacts : [],
    known_risks: Array.isArray(item.known_risks) ? item.known_risks : [],
    what_changed_since_last_agent6_ruling: item.what_changed_since_last_agent6_ruling || '',
    what_must_not_be_accepted: Array.isArray(item.what_must_not_be_accepted) ? item.what_must_not_be_accepted : [],
    next_agent6_action: item.next_agent6_action || '',
    next_agent5_action: item.next_agent5_action || '',
    owning_lanes_if_blocked: Array.isArray(item.owning_lanes_if_blocked) ? item.owning_lanes_if_blocked : owningLanesFor(item),
  };
}

function promptStateFor(item) {
  const status = item.status || '';
  if (status.startsWith('returned_')) return 'agent6_verdict_received';
  if (status === 'blocked_no_render') return 'standing_blocker';
  if (status === 'queued' || status.startsWith('queued_')) return 'queued_for_agent6';
  return 'tracked_control_state';
}

function primaryBrief(item) {
  const artifacts = Array.isArray(item.evidence_artifacts) ? item.evidence_artifacts : [];
  if (item.returned_docket) return item.returned_docket;
  return artifacts.find((artifact) => artifact.startsWith('reports/') && artifact.endsWith('.md')) || '';
}

function owningLanesFor(item) {
  const text = `${item.request_id || ''} ${item.gate || ''}`.toLowerCase();
  if (mentionsAgent(text, 1) || text.includes('source')) return ['Agent 1', 'Agent 5'];
  if (mentionsAgent(text, 3) || text.includes('usage')) return ['Agent 3', 'Agent 5'];
  if (text.includes('public_runtime') || text.includes('deployment') || text.includes('live-deuteronomy') || text.includes('hud-preview')) return ['Agent 5', 'Agent 7'];
  if (text.includes('hud') || text.includes('reader') || text.includes('runtime')) return ['Agent 4', 'Agent 5'];
  if (mentionsAgent(text, 2) || text.includes('route') || text.includes('definition')) return ['Agent 2', 'Agent 5'];
  if (mentionsAgent(text, 5) || text.includes('sop') || text.includes('spec') || text.includes('role') || text.includes('agent5_goal_management')) return ['Agent 5', 'Agent 7'];
  if (text.includes('publication')) return ['Agent 5'];
  return ['Agent 5'];
}

function mentionsAgent(text, number) {
  return new RegExp(`\\bagent[-_\\s]*${number}\\b`).test(text);
}

function dispositionFor(status) {
  if (status === 'blocked_no_render' || status.startsWith('returned_blocked')) return 'blocker';
  if (status.startsWith('returned_pass') || status.startsWith('returned_accepted')) return 'accepted_with_boundary';
  if (status.startsWith('returned_warn')) return 'warning';
  if (status === 'queued' || status.startsWith('queued_')) return 'pending';
  return 'review';
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, data) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}
