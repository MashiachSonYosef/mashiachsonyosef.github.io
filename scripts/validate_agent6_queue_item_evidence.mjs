#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const args = parseArgs(process.argv.slice(2));
const queuePath = args.queue || 'data/control/agent6_validation_queue.json';
const requestId = args['request-id'] || args.requestId || args._[0];
if (!requestId) fail('missing --request-id <id>');

const root = process.cwd();
const queue = readJson(queuePath);
const item = (queue.queue || []).find((row) => row.request_id === requestId);
if (!item) fail(`request_id not found: ${requestId}`);

const issues = [];
const warnings = [];
const required = queue?.intake_rules?.required_request_fields || [];
for (const field of required) {
  if (item[field] === undefined || item[field] === null || item[field] === '') {
    issues.push(`missing required field ${field}`);
  }
}

const artifacts = Array.isArray(item.evidence_artifacts) ? item.evidence_artifacts : [];
if (artifacts.length === 0) issues.push('evidence_artifacts missing or empty');
const missing = artifacts.filter((artifact) => !fs.existsSync(path.join(root, artifact)));
if (missing.length > 0) issues.push(`missing evidence artifact(s): ${missing.join(', ')}`);

const status = String(item.status || '').toLowerCase();
if (!/queued|pending|awaiting|delivered|returned|blocked/.test(status)) {
  warnings.push(`unrecognized status wording: ${item.status || 'missing'}`);
}
if (queue.publication_global_status !== 'blocked_no_render') {
  issues.push(`publication_global_status expected blocked_no_render, got ${queue.publication_global_status}`);
}

const result = {
  artifact_type: 'agent6_queue_item_evidence_validation',
  queue_path: queuePath,
  request_id: requestId,
  status: item.status,
  priority: item.priority,
  evidence_count: artifacts.length,
  missing_evidence_artifacts: missing,
  issues,
  warnings,
  boundary: 'evidence_validation_only_no_agent6_verdict_no_queue_state_update',
  must_not_be_accepted: [
    'queue_item_acceptance',
    'qa_acceptance',
    'source_provenance_acceptance',
    'public_runtime_acceptance',
    'publication_readiness',
    'definition_authority',
    'answer_eligibility',
    'release_action',
  ],
};

console.log(JSON.stringify(result, null, 2));
if (issues.length > 0) process.exit(1);

function parseArgs(argv) {
  const parsed = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      parsed._.push(arg);
      continue;
    }
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
    fail(`could not read JSON ${targetPath}: ${error.message}`);
  }
}

function fail(message) {
  console.error(`Validation failed: ${message}`);
  process.exit(1);
}
