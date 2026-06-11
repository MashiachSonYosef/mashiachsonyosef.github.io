#!/usr/bin/env node
import cp from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const args = parseArgs(process.argv.slice(2));
const pattern = args.pattern || '^agent4-.*2026-06-06\\.json$';
const out = args.out || 'reports/agent4-validator-prereq-packet-sweep-result-2026-06-06.json';
const timeoutMs = args.timeoutMs || args.timeout || '30000';
const sweepScript = args.sweepScript || 'scripts/validate_agent4_validator_prereq_packet_sweep.mjs';
const resultValidator = args.resultValidator || 'scripts/validate_agent4_validator_prereq_packet_sweep_result.mjs';
const gateOut = args.gateOut || '';
const gateResultValidator =
  args.gateResultValidator ||
  (gateOut ? 'scripts/validate_agent4_validator_prereq_packet_sweep_gate_result.mjs' : '');

const sweepArgs = [
  sweepScript,
  `--pattern=${pattern}`,
  `--timeoutMs=${timeoutMs}`,
  `--out=${out}`,
];
if (args.reports) sweepArgs.push(`--reports=${args.reports}`);
if (args.validator) sweepArgs.push(`--validator=${args.validator}`);
if (args.exclude) sweepArgs.push(`--exclude=${args.exclude}`);
if (args.allowEmpty) sweepArgs.push('--allowEmpty');

const sweep = run(process.execPath, sweepArgs, Number(args.gateTimeoutMs || 120000));
if (sweep.status !== 0) {
  process.stdout.write(
    JSON.stringify(
      {
        artifact_type: 'agent4_validator_prereq_packet_sweep_gate_result',
        status: 'sweep_failed',
        out,
        sweep_status: sweep.status,
        sweep_signal: sweep.signal,
        sweep_stdout: sweep.stdout.slice(0, 4000),
        sweep_stderr: sweep.stderr.slice(0, 4000),
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

const resultCheck = run(process.execPath, [resultValidator, `--input=${out}`], Number(args.resultTimeoutMs || 30000));
const parsedSweep = readJson(out);
const parsedResultCheck = tryJson(resultCheck.stdout);
const summary = {
  artifact_type: 'agent4_validator_prereq_packet_sweep_gate_result',
  status: resultCheck.status === 0 ? 'passed' : 'result_validation_failed',
  out,
  pattern,
  timeout_ms_per_packet: Number(timeoutMs),
  sweep_script: sweepScript,
  result_validator: resultValidator,
  sweep: {
    status: sweep.status,
    signal: sweep.signal,
  },
  result_validation: {
    status: resultCheck.status,
    signal: resultCheck.signal,
    stderr: resultCheck.stderr,
  },
  counts: {
    count: parsedSweep.count,
    passed: parsedSweep.passed,
    failed: parsedSweep.failed,
    command_count_total: parsedSweep.command_count_total,
    blocker_count_total: parsedSweep.blocker_count_total,
    shapes: parsedSweep.shapes,
  },
  validator_output: parsedResultCheck,
};

const summaryJson = `${JSON.stringify(summary, null, 2)}\n`;
if (gateOut) {
  fs.mkdirSync(path.dirname(path.resolve(process.cwd(), gateOut)), { recursive: true });
  fs.writeFileSync(path.resolve(process.cwd(), gateOut), summaryJson, 'utf8');
}
let gateResultCheck = null;
if (gateOut && gateResultValidator) {
  gateResultCheck = run(process.execPath, [gateResultValidator, `--input=${gateOut}`], Number(args.gateResultTimeoutMs || 30000));
}
if (gateResultCheck) {
  summary.gate_result_validation = {
    status: gateResultCheck.status,
    signal: gateResultCheck.signal,
    stderr: gateResultCheck.stderr,
  };
  const checkedSummaryJson = `${JSON.stringify(summary, null, 2)}\n`;
  fs.writeFileSync(path.resolve(process.cwd(), gateOut), checkedSummaryJson, 'utf8');
  console.log(checkedSummaryJson.trimEnd());
  if (gateResultCheck.status !== 0) process.exit(1);
} else {
console.log(summaryJson.trimEnd());
}
if (resultCheck.status !== 0) process.exit(1);

function run(command, argv, timeout) {
  const result = cp.spawnSync(command, argv, {
    encoding: 'utf8',
    timeout,
  });
  return {
    status: result.status,
    signal: result.signal || null,
    stdout: String(result.stdout || ''),
    stderr: String(result.stderr || ''),
  };
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(process.cwd(), filePath), 'utf8'));
}

function tryJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
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
