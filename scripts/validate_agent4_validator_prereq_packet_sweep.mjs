#!/usr/bin/env node
import cp from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const args = parseArgs(process.argv.slice(2));
const root = process.cwd();
const reportsDir = path.resolve(root, args.reports || 'reports');
const pattern = args.pattern || '^agent4-.*2026-06-06\\.json$';
const excludePattern =
  args.exclude || '^agent4-validator-prereq-packet-sweep-(?:result|gate|gate-result)-.*\\.json$';
const validator = args.validator || 'scripts/validate_agent4_validator_prereq_packet.mjs';
const timeoutMs = Number(args.timeoutMs || args.timeout || 30000);
const allowEmpty = Boolean(args.allowEmpty);

if (!Number.isInteger(timeoutMs) || timeoutMs <= 0) {
  fail(`timeout must be a positive integer, found ${args.timeoutMs || args.timeout}`);
}

const regex = new RegExp(pattern);
const excludeRegex = excludePattern ? new RegExp(excludePattern) : null;
const files = fs
  .readdirSync(reportsDir)
  .filter((file) => regex.test(file))
  .filter((file) => !excludeRegex || !excludeRegex.test(file))
  .sort();

if (!files.length && !allowEmpty) {
  fail(`pattern matched zero files: ${pattern}; pass --allowEmpty only for an intentional empty-control run`);
}

const results = [];
for (const file of files) {
  const input = path.join(args.reports || 'reports', file);
  const run = cp.spawnSync(process.execPath, [validator, '--input', input], {
    encoding: 'utf8',
    timeout: timeoutMs,
  });
  let parsed = null;
  try {
    parsed = JSON.parse(run.stdout);
  } catch {
    // Keep raw stdout/stderr below for diagnostics.
  }
  results.push({
    file,
    status: run.status,
    signal: run.signal || null,
    timed_out: run.error?.code === 'ETIMEDOUT',
    shape: parsed?.shape || null,
    command_count: parsed?.command_count ?? null,
    blocker_count: parsed?.blocker_count ?? null,
    non_acceptance_boundary_count: parsed?.non_acceptance_boundary_count ?? null,
    stderr: String(run.stderr || '').trim(),
  });
}

const failed = results.filter((result) => result.status !== 0 || result.timed_out);
const summary = {
  artifact_type: 'agent4_validator_prereq_packet_sweep_result',
  reports_dir: args.reports || 'reports',
  pattern,
  exclude_pattern: excludePattern,
  validator,
  timeout_ms_per_packet: timeoutMs,
  count: files.length,
  passed: files.length - failed.length,
  failed: failed.length,
  shapes: countBy(results.map((result) => result.shape || 'failed')),
  command_count_total: sum(results.map((result) => result.command_count || 0)),
  blocker_count_total: sum(results.map((result) => result.blocker_count || 0)),
  failures: failed.map((result) => ({
    file: result.file,
    status: result.status,
    signal: result.signal,
    timed_out: result.timed_out,
    stderr: result.stderr.slice(0, 1000),
  })),
  results,
};

const json = `${JSON.stringify(summary, null, 2)}\n`;
if (args.out) {
  fs.mkdirSync(path.dirname(path.resolve(root, args.out)), { recursive: true });
  fs.writeFileSync(path.resolve(root, args.out), json, 'utf8');
}
console.log(json.trimEnd());
if (failed.length) process.exit(1);

function countBy(values) {
  const counts = {};
  for (const value of values) counts[value] = (counts[value] || 0) + 1;
  return counts;
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function parseArgs(argv) {
  const parsed = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      parsed._.push(arg);
      continue;
    }
    const key = arg.slice(2);
    if (arg.includes('=')) {
      const [inlineKey, ...rest] = key.split('=');
      parsed[inlineKey] = rest.join('=');
      continue;
    }
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) parsed[key] = true;
    else {
      parsed[key] = next;
      i += 1;
    }
  }
  return parsed;
}

function fail(message) {
  console.error(`Validation failed: ${message}`);
  process.exit(1);
}
