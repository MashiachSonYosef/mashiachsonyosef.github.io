#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = process.cwd();
const automationRoot = path.join(os.homedir(), '.codex', 'automations');
const registryPath = path.join(root, 'data', 'control', 'agent_registry.json');
const markdownReportPath = path.join(root, 'reports', 'agent-pulse-coverage-audit.md');
const jsonReportPath = path.join(root, 'reports', 'agent-pulse-coverage-audit.json');

const expected = [
  {
    agent: 'Agent 1',
    expected_status: 'PAUSED',
    cadence_minutes: null,
    required_terms: ['Agent 5', 'Paused', 'source', 'provenance'],
    note: 'scheduled pulse paused; Agent 5 activates this lane when needed',
  },
  {
    agent: 'Agent 2',
    expected_status: 'PAUSED',
    cadence_minutes: null,
    required_terms: ['Agent 5', 'Paused', 'route', 'publication'],
    note: 'scheduled pulse paused; Agent 5 activates this lane when needed',
  },
  {
    agent: 'Agent 3',
    expected_status: 'PAUSED',
    cadence_minutes: null,
    required_terms: ['Agent 5', 'Paused', 'usage', 'non-authoritative'],
    note: 'scheduled pulse paused; Agent 5 activates this lane when needed',
  },
  {
    agent: 'Agent 4',
    expected_status: 'PAUSED',
    cadence_minutes: null,
    required_terms: ['Agent 5', 'Paused', 'HUD', 'Reader Workbench'],
    note: 'scheduled pulse paused; Agent 5 activates this lane when needed',
  },
  {
    agent: 'Agent 5',
    expected_status: 'ACTIVE',
    cadence_minutes: 30,
    required_terms: ['Agent 6', 'bounded', 'Agent 7', '30-minute'],
    target_optional: true,
  },
  {
    agent: 'Agent 6',
    expected_status: 'ACTIVE',
    cadence_minutes: 240,
    required_terms: ['validation', 'signoff', 'blocked_no_render', 'docket'],
  },
  {
    agent: 'Agent 7',
    expected_status: 'ACTIVE',
    cadence_minutes: 240,
    required_terms: ['CEO', 'Agent 5', 'Agent 6', 'priority'],
  },
];
function parseTomlField(text, field) {
  const match = text.match(new RegExp(`^${field}\\s*=\\s*"([\\s\\S]*?)"$`, 'm'));
  return match ? match[1] : '';
}

function parseRruleMinutes(rrule) {
  const freq = rrule.match(/FREQ=([^;]+)/)?.[1] || '';
  const interval = Number(rrule.match(/INTERVAL=(\d+)/)?.[1] || 1);
  if (freq === 'MINUTELY') return interval;
  if (freq === 'HOURLY') return interval * 60;
  if (freq === 'DAILY') return interval * 1440;
  return null;
}

function readAutomations() {
  if (!fs.existsSync(automationRoot)) return [];
  return fs.readdirSync(automationRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(automationRoot, entry.name, 'automation.toml'))
    .filter((file) => fs.existsSync(file))
    .map((file) => {
      const text = fs.readFileSync(file, 'utf8');
      return {
        path: file,
        id: parseTomlField(text, 'id'),
        name: parseTomlField(text, 'name'),
        status: parseTomlField(text, 'status'),
        rrule: parseTomlField(text, 'rrule'),
        target_thread_id: parseTomlField(text, 'target_thread_id'),
        prompt: parseTomlField(text, 'prompt').replaceAll('\\n', '\n'),
      };
    });
}

function findAutomation(agent, automations, registryRow) {
  if (registryRow?.target_id && /^[0-9a-f-]{36}$/i.test(registryRow.target_id)) {
    const byTarget = automations.find((automation) => automation.target_thread_id === registryRow.target_id);
    if (byTarget) return byTarget;
  }
  const needle = agent.toLowerCase();
  const dashed = needle.replace(' ', '-');
  return automations.find((automation) => (
    automation.name.toLowerCase().includes(needle)
    || automation.id.toLowerCase().includes(dashed)
  ));
}

function registryByAgent() {
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  return new Map((registry.agents || []).map((agent) => [agent.agent, agent]));
}

function rel(file) {
  if (file.startsWith(root)) return path.relative(root, file).replaceAll('\\', '/');
  return file.replaceAll('\\', '/');
}

function audit() {
  const automations = readAutomations();
  const registry = registryByAgent();
  const rows = [];
  const issues = [];
  const warnings = [];

  for (const item of expected) {
    const registryRow = registry.get(item.agent);
    const automation = findAutomation(item.agent, automations, registryRow);
    const row = {
      agent: item.agent,
      expected_cadence_minutes: item.cadence_minutes,
      expected_goal_terms: item.required_terms,
      note: item.note || '',
      found: Boolean(automation),
      status: automation?.status || '',
      id: automation?.id || '',
      name: automation?.name || '',
      rrule: automation?.rrule || '',
      actual_cadence_minutes: automation ? parseRruleMinutes(automation.rrule) : null,
      target_thread_id: automation?.target_thread_id || '',
      registry_target_id: registryRow?.target_id || '',
      missing_goal_terms: [],
      problems: [],
    };

    if (!automation) {
      row.problems.push('missing automation');
      issues.push(`${item.agent}: missing automation`);
    } else {
      const expectedStatus = item.expected_status || 'ACTIVE';
      if (automation.status !== expectedStatus) {
        row.problems.push(`status ${automation.status || 'missing'} expected ${expectedStatus}`);
        issues.push(`${item.agent}: automation status ${automation.status || 'missing'}, expected ${expectedStatus}`);
      }
      if (item.cadence_minutes !== null && row.actual_cadence_minutes !== item.cadence_minutes) {
        row.problems.push(`cadence ${row.actual_cadence_minutes}m expected ${item.cadence_minutes}m`);
        issues.push(`${item.agent}: cadence ${row.actual_cadence_minutes}m, expected ${item.cadence_minutes}m`);
      }
      if (!item.target_optional && registryRow?.target_id && automation.target_thread_id !== registryRow.target_id) {
        row.problems.push('target thread differs from registry');
        issues.push(`${item.agent}: target thread differs from registry`);
      }
      row.missing_goal_terms = item.required_terms.filter((term) => !automation.prompt.includes(term));
      if (row.missing_goal_terms.length) {
        row.problems.push(`missing goal terms: ${row.missing_goal_terms.join(', ')}`);
        warnings.push(`${item.agent}: prompt missing goal terms ${row.missing_goal_terms.join(', ')}`);
      }
    }
    rows.push(row);
  }

  const expectedAutomationIds = new Set(rows.map((row) => row.id).filter(Boolean));
  const unexpected = automations.filter((automation) => !expectedAutomationIds.has(automation.id));
  for (const automation of unexpected) {
    if (!rows.some((row) => row.id === automation.id)) {
      warnings.push(`Unexpected automation present: ${automation.id || automation.name}`);
    }
  }

  return {
    generated_at: new Date().toISOString(),
    artifact_type: 'agent_pulse_coverage_audit',
    automation_root: automationRoot.replaceAll('\\', '/'),
    registry: rel(registryPath),
    verdict: issues.length ? 'fail' : (warnings.length ? 'pass_with_warnings' : 'pass'),
    issues,
    warnings,
    rows,
  };
}

function writeReports(result) {
  const lines = [
    '# Agent Pulse Coverage Audit',
    '',
    `Generated: ${result.generated_at}`,
    '',
    `Verdict: ${result.verdict}`,
    '',
    `Automation root: ${result.automation_root}`,
    `Registry: ${result.registry}`,
    '',
    '## Coverage',
    '',
    '| agent | status | cadence | target | goal terms | note |',
    '|---|---|---:|---|---|---|',
    ...result.rows.map((row) => [
      row.agent,
      row.found ? row.status : 'missing',
      row.expected_cadence_minutes === null ? 'none' : (row.actual_cadence_minutes == null ? 'n/a' : `${row.actual_cadence_minutes}m`),
      row.target_thread_id && (!row.registry_target_id || row.target_thread_id === row.registry_target_id || row.agent === 'Agent 5') ? 'ok' : 'mismatch',
      row.missing_goal_terms.length ? `missing ${row.missing_goal_terms.join(', ')}` : 'ok',
      row.note || '',
    ].map((cell) => String(cell).replaceAll('|', '/')).join(' | ')).map((line) => `| ${line} |`),
    '',
    '## Issues',
    '',
    ...(result.issues.length ? result.issues.map((issue) => `- ${issue}`) : ['- none']),
    '',
    '## Warnings',
    '',
    ...(result.warnings.length ? result.warnings.map((warning) => `- ${warning}`) : ['- none']),
    '',
    '## Boundary',
    '',
    '- This validates app heartbeat coverage only.',
    '- It does not prove agent execution quality or acceptance of any project gate.',
    '- Agent 6 remains validation/signoff authority; publication remains blocked_no_render.',
    '',
  ];
  fs.writeFileSync(markdownReportPath, `${lines.join('\n')}\n`);
  fs.writeFileSync(jsonReportPath, `${JSON.stringify(result, null, 2)}\n`);
}

const result = audit();
writeReports(result);
if (result.issues.length) {
  console.error(`Agent pulse coverage audit failed with ${result.issues.length} issue(s). Report: ${rel(markdownReportPath)}`);
  process.exit(1);
}
console.log(`Agent pulse coverage audit ${result.verdict}: ${rel(markdownReportPath)}`);
