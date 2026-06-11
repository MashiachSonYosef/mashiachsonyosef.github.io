#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const digestPath = process.argv[2] || 'reports/agent5-agent6-worker-digest-2026-06-01.md';
const queuePath = process.argv[3] || 'data/control/agent6_validation_queue.json';
const markdownPath = 'reports/agent5-worker-digest-validation.md';
const jsonPath = 'reports/agent5-worker-digest-validation.json';

const issues = [];
const warnings = [];
const checks = [];

const digest = readText(digestPath);
const queue = readJson(queuePath);
const queueItems = new Map((queue.queue || []).map((item) => [item.request_id, item]));

validateStandingGates();
validateQueueAlignment();
validateArtifactReferences();
writeReports();

if (issues.length > 0) {
  console.error(`Agent 5 worker digest validation failed with ${issues.length} issue(s). Report: ${markdownPath}`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 5 worker digest validation ${warnings.length ? 'passed with warnings' : 'passed'}: ${markdownPath}`);

function validateStandingGates() {
  mustContain('publication blocked gate', /Publication remains `blocked_no_render`|Publication remains blocked_no_render/i);
  mustContain('no signoff boundary', /not a signoff, not acceptance, and not legal clearance/i);
  mustContain('source scope blocked boundary', /Source\/provenance acceptance is blocked/i);
  mustContain('answer eligible boundary', /not accepted translation output and not publication readiness/i);
  mustNotContain('publication readiness overclaim', /\bpublication (?:is )?ready\b|\bpublication-ready\b/i);
  mustNotContain('legal cleanup framing', /ready pending legal|legal cleanup only|legal-cleanup-only status/i);
}

function validateQueueAlignment() {
  const publication = queueItems.get('agent6-publication-render-row-validation');
  if (publication?.status !== 'blocked_no_render') {
    fail('queue publication status', `expected blocked_no_render, got ${publication?.status || 'missing'}`);
  } else {
    pass('queue publication status', 'blocked_no_render');
  }

  const reader = queueItems.get('agent6-reader-workbench-broader-rollout-recheck');
  if (reader?.status === 'returned_pass_for_eight_included_pages_only') {
    mustContain('reader workbench eight-page pass', /PASS for bounded representative Reader Workbench expansion evidence on the eight included pages only|pass for the eight included/i);
    mustContain('reader workbench not broad rollout', /not broad rollout|Broad Reader Workbench rollout/i);
    mustNotContain('reader workbench stale queued language', /bounded representative expansion packet is now queued|until Agent 6 returns pass\/warn\/block/i);
  } else if (reader) {
    warn('reader workbench queue status', `not returned pass: ${reader.status || 'missing'}`);
  } else {
    fail('reader workbench queue item', 'missing agent6-reader-workbench-broader-rollout-recheck');
  }

  const usage = queueItems.get('agent6-agent3-usage-navigation-sample');
  if (usage?.status === 'queued') {
    mustContain('usage still needs Agent 6', /Still needs Agent 6:[\s\S]*Validate selected usage package as usage-only/i);
  } else if (usage?.status === 'returned_accepted_with_boundary_usage_navigation_warnings') {
    mustContain('usage accepted with boundary warnings', /Agent 6 accepted Agent 3's selected usage-navigation handoff with boundary warnings/i);
    mustContain('usage not broad coverage', /not accept usage rows as definitions, semantic arbitration, broad\/exhaustive usage coverage/i);
    mustNotContain('usage stale queued language', /Validate selected usage package as usage-only/i);
  } else if (usage) {
    warn('usage queue status', `not queued: ${usage.status || 'missing'}`);
  }

  const source = queueItems.get('agent6-agent1-source-report-contradiction');
  if (source?.status === 'returned_blocked_current_13_untracked_source_files') {
    mustContain('source 13 untracked files', /13 untracked `data\/sources\/\*\.json` files|13 untracked files/i);
  }

  const route = queueItems.get('agent6-route-publication-boundary-recheck');
  if (route?.status === 'returned_warn_route_data_only_not_publication_support') {
    mustContain('route Agent 6 warn state', /Agent 6 has already returned WARN for route data only/i);
  }
}

function validateArtifactReferences() {
  const refs = new Set();
  const backtickPattern = /`([^`\r\n]+)`/g;
  let match;
  while ((match = backtickPattern.exec(digest)) !== null) {
    const value = match[1].trim();
    if (isPathReference(value)) refs.add(value.replace(/\\/g, '/'));
  }

  const missing = [...refs].filter((ref) => !fs.existsSync(path.join(root, ref)));
  if (missing.length > 0) {
    fail('artifact references', `missing ${missing.length}: ${missing.slice(0, 12).join(', ')}${missing.length > 12 ? ', ...' : ''}`);
  } else {
    pass('artifact references', `${refs.size} referenced artifact(s) exist`);
  }
}

function isPathReference(value) {
  if (/^node\s/i.test(value)) return false;
  if (/[*?]/.test(value)) return false;
  if (/^(pass|warn|blocked_no_render)$/i.test(value)) return false;
  if (!/\.(?:md|json|mjs|js|css|html)$/i.test(value)) return false;
  return /^(reports|scripts|data|assets|tanakh|halakhah|targum|gra|other|chasidut)\//.test(value.replace(/\\/g, '/'));
}

function mustContain(name, pattern) {
  if (pattern.test(digest)) pass(name, 'present');
  else fail(name, 'missing expected wording');
}

function mustNotContain(name, pattern) {
  if (pattern.test(digest)) fail(name, 'forbidden wording present');
  else pass(name, 'absent');
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

function readText(relativePath) {
  try {
    return fs.readFileSync(path.join(root, relativePath), 'utf8');
  } catch (error) {
    fail('digest file', `${relativePath}: ${error.message}`);
    return '';
  }
}

function readJson(relativePath) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
  } catch (error) {
    fail('queue file', `${relativePath}: ${error.message}`);
    return {};
  }
}

function writeReports() {
  const result = {
    generated_at: new Date().toISOString(),
    artifact_type: 'agent5_worker_digest_validation',
    digest: digestPath,
    queue: queuePath,
    verdict: issues.length ? 'fail' : warnings.length ? 'pass_with_warnings' : 'pass',
    checks,
    issues,
    warnings,
  };

  const lines = [
    '# Agent 5 Worker Digest Validation',
    '',
    `Generated: ${result.generated_at}`,
    '',
    `Verdict: ${result.verdict}`,
    '',
    `Digest: \`${digestPath}\``,
    `Queue: \`${queuePath}\``,
    '',
    '## Checks',
    '',
    '| status | check | detail |',
    '|---|---|---|',
    ...checks.map((check) => `| ${check.status} | ${escapeCell(check.name)} | ${escapeCell(check.detail)} |`),
    '',
    '## Issues',
    '',
    ...(issues.length ? issues.map((issue) => `- ${escapeCell(issue)}`) : ['- none']),
    '',
    '## Warnings',
    '',
    ...(warnings.length ? warnings.map((warning) => `- ${escapeCell(warning)}`) : ['- none']),
    '',
    '## Boundary',
    '',
    '- This validates handoff hygiene only; it is not Agent 6 acceptance.',
    '- The digest may summarize returned Agent 6 verdicts, but it must not self-accept pending gates.',
    '- Publication remains `blocked_no_render`.',
    '',
  ];

  writeText(markdownPath, `${lines.join('\n')}\n`);
  writeText(jsonPath, `${JSON.stringify(result, null, 2)}\n`);
}

function writeText(relativePath, text) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, text, 'utf8');
}

function escapeCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}
