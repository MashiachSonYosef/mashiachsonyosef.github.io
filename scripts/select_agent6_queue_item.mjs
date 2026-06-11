#!/usr/bin/env node
import fs from 'node:fs';

const args = parseArgs(process.argv.slice(2));
const queuePath = args.queue || 'data/control/agent6_validation_queue.json';
const maxItems = Number(args['max-items'] || args.maxItems || 1);
const outputPath = args.output || '';
const queue = readJson(queuePath);
const items = Array.isArray(queue.queue) ? queue.queue : [];

const selected = items
  .filter(isPending)
  .sort(compareItems)
  .slice(0, Math.max(1, maxItems))
  .map(summarizeItem);

const result = {
  artifact_type: 'agent6_queue_item_selection',
  queue_path: queuePath,
  queue_version: queue.version,
  publication_global_status: queue.publication_global_status,
  total_queue_items: items.length,
  pending_items: items.filter(isPending).length,
  selected_items: selected,
  boundary: 'selection_only_no_agent6_verdict_no_queue_state_update',
  must_not_be_accepted: [
    'queue_item_acceptance',
    'qa_acceptance',
    'control_state_update',
    'publication_readiness',
    'source_provenance_acceptance',
    'public_runtime_acceptance',
    'definition_authority',
    'answer_eligibility',
    'release_action',
  ],
};

const text = JSON.stringify(result, null, 2);
if (outputPath) fs.writeFileSync(outputPath, `${text}\n`);
console.log(text);

function parseArgs(argv) {
  const parsed = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) parsed[key] = true;
    else {
      parsed[key] = next;
      i += 1;
    }
  }
  return parsed;
}

function readJson(targetPath) {
  try {
    return JSON.parse(fs.readFileSync(targetPath, 'utf8'));
  } catch (error) {
    console.error(`Failed to read queue ${targetPath}: ${error.message}`);
    process.exit(1);
  }
}

function isPending(item) {
  const status = String(item.status || '').toLowerCase();
  return (
    /queued|pending|awaiting|delivered/.test(status) &&
    !/returned|accepted|blocked_no_render|complete/.test(status)
  );
}

function compareItems(a, b) {
  const pa = Number.isFinite(Number(a.priority)) ? Number(a.priority) : 999;
  const pb = Number.isFinite(Number(b.priority)) ? Number(b.priority) : 999;
  if (pa !== pb) return pa - pb;
  return String(a.request_id || '').localeCompare(String(b.request_id || ''));
}

function summarizeItem(item) {
  const artifacts = Array.isArray(item.evidence_artifacts) ? item.evidence_artifacts : [];
  return {
    request_id: item.request_id,
    gate: item.gate,
    scope: item.scope,
    status: item.status,
    priority: item.priority,
    requested_verdict: item.requested_verdict,
    evidence_count: artifacts.length,
    evidence_artifacts: artifacts,
    claimed_boundary: item.claimed_boundary,
    what_must_not_be_accepted: item.what_must_not_be_accepted,
  };
}
