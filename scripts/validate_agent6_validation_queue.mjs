#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const queuePath = process.argv[2] || 'data/control/agent6_validation_queue.json';
const reportPath = process.argv[3] || 'reports/agent6-validation-queue-health.md';
const issues = [];
const warnings = [];
const checks = [];

const queue = readJson(queuePath);
const requiredFields = queue?.intake_rules?.required_request_fields || [];
const expectedRequiredFields = [
  'request_id',
  'submitted_by',
  'gate',
  'scope',
  'evidence_artifacts',
  'requested_verdict',
  'claimed_boundary',
  'known_risks',
  'what_changed_since_last_agent6_ruling',
  'what_must_not_be_accepted',
];

validateTopLevel();
validateRequiredFields();
validateQueueItems();
writeReport();

if (issues.length > 0) {
  console.error(`Agent 6 validation queue failed with ${issues.length} issue(s), ${warnings.length} warning(s).`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 6 validation queue passed with ${warnings.length} warning(s). Report: ${reportPath}`);

function validateTopLevel() {
  if (queue.artifact_type !== 'agent6_validation_queue') {
    fail('queue artifact type', `expected agent6_validation_queue, got ${queue.artifact_type || 'missing'}`);
  } else {
    pass('queue artifact type', queue.artifact_type);
  }

  if (queue.publication_global_status !== 'blocked_no_render') {
    fail('publication global status', `expected blocked_no_render, got ${queue.publication_global_status || 'missing'}`);
  } else {
    pass('publication global status', 'blocked_no_render');
  }

  if (!String(queue.operating_mode || '').includes('validation') || String(queue.operating_mode || '').includes('status_pulse_lane') && !String(queue.operating_mode || '').includes('not_status_pulse_lane')) {
    warn('operating mode', `review wording: ${queue.operating_mode || 'missing'}`);
  } else {
    pass('operating mode', queue.operating_mode || 'missing');
  }

  if (!Array.isArray(queue.queue) || queue.queue.length === 0) {
    fail('queue items', 'queue is missing or empty');
  } else {
    pass('queue items', `${queue.queue.length} item(s)`);
  }
}

function validateRequiredFields() {
  for (const field of expectedRequiredFields) {
    if (!requiredFields.includes(field)) fail('required intake fields', `missing ${field}`);
  }
  if (expectedRequiredFields.every((field) => requiredFields.includes(field))) {
    pass('required intake fields', `${expectedRequiredFields.length}/${expectedRequiredFields.length} present`);
  }
}

function validateQueueItems() {
  const seen = new Set();
  for (const item of queue.queue || []) {
    const id = item.request_id || '(missing request_id)';
    if (seen.has(id)) fail(id, 'duplicate request_id');
    seen.add(id);

    for (const field of expectedRequiredFields) {
      if (item[field] === undefined || item[field] === null || item[field] === '') {
        fail(id, `missing required field ${field}`);
      }
    }

    if (!Number.isFinite(Number(item.priority))) warn(id, 'priority is missing or non-numeric');
    validateEvidenceArtifacts(id, item.evidence_artifacts);
    validateBoundaryLanguage(id, item);
  }
}

function validateEvidenceArtifacts(id, artifacts) {
  if (!Array.isArray(artifacts) || artifacts.length === 0) {
    fail(id, 'evidence_artifacts missing or empty');
    return;
  }
  const missing = artifacts.filter((artifact) => !fs.existsSync(path.join(root, artifact)));
  if (missing.length > 0) {
    fail(id, `missing evidence artifact(s): ${missing.join(', ')}`);
  } else {
    pass(`${id} evidence`, `${artifacts.length} artifact(s) exist`);
  }
}

function validateBoundaryLanguage(id, item) {
  const joined = JSON.stringify(item).toLowerCase();
  const status = String(item.status || '').toLowerCase();
  const pending = !status.includes('returned') && !status.includes('blocked_no_render');
  if (pending && /\baccepted\b|\bready\b|legal-cleanup-only/.test(status)) {
    fail(id, `pending item status uses forbidden acceptance/readiness wording: ${item.status}`);
  }

  if (id !== 'agent6-publication-render-row-validation' && /publication readiness/.test(String(item.requested_verdict || '').toLowerCase())) {
    fail(id, 'non-publication item requests publication readiness');
  }

  if (id === 'agent6-publication-render-row-validation') {
    if (item.status !== 'blocked_no_render') fail(id, `publication item status must stay blocked_no_render, got ${item.status}`);
    if (!String(item.requested_verdict || '').includes('not_requested_until_real_publication_render_artifact_exists')) {
      fail(id, 'publication item must not request active signoff before a real render artifact exists');
    }
  }

  if (!/not publication|no publication|publication remains|not accepted translation|not translation|not unique semantic truth|no implementation acceptance|no publication acceptance/.test(joined)) {
    warn(id, 'boundary language may not clearly exclude publication/translation overclaim');
  }
}

function pass(name, detail) {
  checks.push({ status: 'pass', name, detail });
}

function warn(name, detail) {
  warnings.push(`${name}: ${detail}`);
  checks.push({ status: 'warn', name, detail });
}

function fail(name, detail) {
  issues.push(`${name}: ${detail}`);
  checks.push({ status: 'fail', name, detail });
}

function readJson(relativePath) {
  const fullPath = path.join(root, relativePath);
  try {
    return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  } catch (error) {
    fail('queue file', `${relativePath}: ${error.message}`);
    return {};
  }
}

function writeReport() {
  const lines = [
    '# Agent 6 Validation Queue Health',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Summary',
    '',
    `- Queue: \`${queuePath}\``,
    `- Status: ${issues.length ? 'failed' : 'passed'}`,
    `- Items: ${(queue.queue || []).length}`,
    `- Issues: ${issues.length}`,
    `- Warnings: ${warnings.length}`,
    `- Publication global status: ${queue.publication_global_status || 'missing'}`,
    '',
    '## Checks',
    '',
    '| status | check | detail |',
    '|---|---|---|',
    ...checks.map((check) => `| ${check.status} | ${escapeCell(check.name)} | ${escapeCell(check.detail)} |`),
    '',
    '## Queue Items',
    '',
    '| priority | request id | gate | status | evidence artifacts |',
    '|---:|---|---|---|---:|',
    ...(queue.queue || []).map((item) => `| ${item.priority ?? ''} | ${escapeCell(item.request_id)} | ${escapeCell(item.gate)} | ${escapeCell(item.status)} | ${Array.isArray(item.evidence_artifacts) ? item.evidence_artifacts.length : 0} |`),
    '',
    '## Interpretation',
    '',
    '- This report validates queue intake hygiene only. It does not validate the substantive gate claims.',
    '- A passing queue means Agent 6 can spend attention on evidence and boundaries instead of missing fields or artifact paths.',
    '- Pending queue items remain unaccepted until Agent 6 writes a docket verdict.',
    '- Publication remains `blocked_no_render` until a real publication render artifact is validated row-by-row.',
    '',
  ];
  fs.mkdirSync(path.dirname(path.join(root, reportPath)), { recursive: true });
  fs.writeFileSync(path.join(root, reportPath), `${lines.join('\n')}\n`, 'utf8');
}

function escapeCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}
