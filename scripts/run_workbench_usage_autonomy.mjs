#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const startedAt = new Date();
const defaults = {
  targetQueue: '.local-cache/workbench-evidence/target-queue.json',
  cacheDir: '.local-cache/workbench-evidence',
  handoffIndex: '.local-cache/workbench-evidence/handoff-index-target-queue.json',
  handoffReport: 'reports/workbench-handoff-index-target-queue.md',
  batchDir: '.local-cache/workbench-evidence/batch-runs',
  report: `reports/workbench-autonomy-${stamp(startedAt)}.md`,
  runJson: `.local-cache/workbench-evidence/autonomy-runs/workbench-autonomy-${stamp(startedAt)}.json`,
  mode: 'full',
  durationMinutes: 60,
  maxIterations: 0,
  batchLimit: 2,
  maxOccurrences: 25000,
  maxSourceFiles: 5,
  maxCacheGb: 80,
  warnCacheGb: 70,
  maxEmptyBatches: 3,
  maxFailedBatches: 3,
  sleepSeconds: 0,
};

const options = parseArgs(process.argv.slice(2));
const run = {
  schema_version: 1,
  artifact_type: 'workbench_usage_autonomy_run',
  generated_at: startedAt.toISOString(),
  generator: 'scripts/run_workbench_usage_autonomy.mjs',
  policy: 'Local bounded runner for source-backed workbench occurrence/candidate evidence. It does not publish pages, choose HUD winners, or create definition claims.',
  options,
  iterations: [],
  stop_reason: null,
};

ensureInputQueue();
rebuildAndValidateIndex();
writeRunArtifacts();

let emptyBatches = 0;
let failedBatches = 0;
const deadline = Date.now() + (options.durationMinutes * 60 * 1000);

while (Date.now() < deadline) {
  if (options.maxIterations && run.iterations.length >= options.maxIterations) {
    run.stop_reason = 'max_iterations_reached';
    break;
  }

  const cacheBytes = dirSizeBytes(options.cacheDir);
  if (cacheBytes >= gbToBytes(options.maxCacheGb)) {
    run.stop_reason = `cache_limit_reached_${options.maxCacheGb}gb`;
    break;
  }
  if (cacheBytes >= gbToBytes(options.warnCacheGb)) {
    console.warn(`Cache warning: ${formatGb(cacheBytes)} GB in ${options.cacheDir}`);
  }

  const beforeBatchFiles = listJsonFiles(options.batchDir);
  const started = new Date().toISOString();
  let commandStatus = 'completed';
  let commandError = null;
  try {
    runBatch();
  } catch (error) {
    commandStatus = 'failed';
    commandError = error.message;
  }

  const batchFile = newestJsonFile(options.batchDir, beforeBatchFiles);
  const batch = batchFile ? readJson(batchFile) : null;
  try {
    rebuildAndValidateIndex();
  } catch (error) {
    commandStatus = 'failed';
    commandError = commandError ? `${commandError}; ${error.message}` : error.message;
  }

  const processed = batch?.processed?.length || 0;
  const failed = batch?.failed?.length || 0;
  const skipped = batch?.skipped?.length || 0;
  if (processed === 0 && failed === 0) emptyBatches += 1;
  else emptyBatches = 0;
  if (commandStatus === 'failed' || failed > 0) failedBatches += 1;
  else failedBatches = 0;

  run.iterations.push({
    iteration: run.iterations.length + 1,
    started_at: started,
    completed_at: new Date().toISOString(),
    status: commandStatus,
    error: commandError,
    batch_file: batchFile,
    processed,
    skipped,
    failed,
    cache_gb: Number(formatGb(cacheBytes)),
  });
  writeRunArtifacts();

  if (failedBatches >= options.maxFailedBatches) {
    run.stop_reason = 'max_failed_batches_reached';
    break;
  }
  if (emptyBatches >= options.maxEmptyBatches) {
    run.stop_reason = 'max_empty_batches_reached';
    break;
  }
  if (options.sleepSeconds > 0) sleep(options.sleepSeconds);
}

if (!run.stop_reason) run.stop_reason = Date.now() >= deadline ? 'duration_elapsed' : 'completed';
writeRunArtifacts();
console.log(`Workbench autonomy run stopped: ${run.stop_reason}`);
console.log(`Wrote ${options.runJson}`);
console.log(`Wrote ${options.report}`);

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg === '--smoke') {
      parsed.mode = 'smoke';
      parsed.targetQueue = '.local-cache/workbench-evidence/smoke-target-queue.json';
      parsed.handoffIndex = '.local-cache/workbench-evidence/handoff-index-smoke-queue.json';
      parsed.handoffReport = 'reports/workbench-handoff-index-smoke-queue.md';
    } else if (arg === '--full') parsed.mode = 'full';
    else if (arg.startsWith('--target-queue=')) parsed.targetQueue = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--cache-dir=')) parsed.cacheDir = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--handoff-index=')) parsed.handoffIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--handoff-report=')) parsed.handoffReport = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--batch-dir=')) parsed.batchDir = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--run-json=')) parsed.runJson = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--duration-minutes=')) parsed.durationMinutes = Number(valueAfterEquals(arg));
    else if (arg.startsWith('--max-iterations=')) parsed.maxIterations = Number(valueAfterEquals(arg));
    else if (arg.startsWith('--batch-limit=')) parsed.batchLimit = Number(valueAfterEquals(arg));
    else if (arg.startsWith('--max-occurrences=')) parsed.maxOccurrences = Number(valueAfterEquals(arg));
    else if (arg.startsWith('--max-source-files=')) parsed.maxSourceFiles = Number(valueAfterEquals(arg));
    else if (arg.startsWith('--max-cache-gb=')) parsed.maxCacheGb = Number(valueAfterEquals(arg));
    else if (arg.startsWith('--warn-cache-gb=')) parsed.warnCacheGb = Number(valueAfterEquals(arg));
    else if (arg.startsWith('--max-empty-batches=')) parsed.maxEmptyBatches = Number(valueAfterEquals(arg));
    else if (arg.startsWith('--max-failed-batches=')) parsed.maxFailedBatches = Number(valueAfterEquals(arg));
    else if (arg.startsWith('--sleep-seconds=')) parsed.sleepSeconds = Number(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  for (const key of ['durationMinutes', 'maxIterations', 'batchLimit', 'maxOccurrences', 'maxSourceFiles', 'maxCacheGb', 'warnCacheGb', 'maxEmptyBatches', 'maxFailedBatches', 'sleepSeconds']) {
    if (!Number.isFinite(parsed[key]) || parsed[key] < 0) {
      throw new Error(`--${key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)} must be a non-negative number`);
    }
  }
  if (!['full', 'smoke'].includes(parsed.mode)) throw new Error('--mode must be full or smoke');
  if (parsed.batchLimit < 1) throw new Error('--batch-limit must be at least 1');
  if (parsed.maxSourceFiles < 1 || parsed.maxSourceFiles > 5) throw new Error('--max-source-files must be 1-5');
  if (parsed.warnCacheGb > parsed.maxCacheGb) throw new Error('--warn-cache-gb cannot exceed --max-cache-gb');
  return parsed;
}

function ensureInputQueue() {
  if (!fs.existsSync(path.join(root, options.targetQueue))) {
    throw new Error(`Missing target queue ${options.targetQueue}. Run scripts/select_workbench_targets.mjs first.`);
  }
  runNode(['scripts/validate_workbench_target_queue.mjs', options.targetQueue]);
}

function runBatch() {
  const args = [
    'scripts/build_workbench_usage_batch.mjs',
    `--target-queue=${options.targetQueue}`,
    `--handoff-index=${options.handoffIndex}`,
    `--batch-dir=${options.batchDir}`,
    `--limit=${options.batchLimit}`,
    `--max-occurrences=${options.maxOccurrences}`,
    `--max-source-files=${options.maxSourceFiles}`,
    '--no-prefix-family',
  ];
  if (options.mode === 'full') args.push('--allow-non-smoke', '--allow-zero-support', '--skip-indexed');
  runNode(args);
}

function rebuildAndValidateIndex() {
  const args = [
    'scripts/build_workbench_handoff_index.mjs',
    `--target-queue=${options.targetQueue}`,
    `--output=${options.handoffIndex}`,
    `--report=${options.handoffReport}`,
  ];
  if (options.mode === 'smoke') args.push('--include-smoke');
  runNode(args);
  runNode(['scripts/validate_workbench_handoff_index.mjs', options.handoffIndex]);
}

function runNode(args) {
  execFileSync(process.execPath, args, {
    cwd: root,
    stdio: 'inherit',
  });
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeRunArtifacts() {
  writeJson(options.runJson, run);
  writeText(options.report, renderReport(run));
}

function writeJson(relativePath, data) {
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function writeText(relativePath, text) {
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), `${text}\n`, 'utf8');
}

function renderReport(data) {
  return [
    '# Workbench Usage Autonomy Run',
    '',
    `Generated: ${data.generated_at}`,
    `Stop reason: ${data.stop_reason || 'running'}`,
    '',
    '## Scope',
    '',
    `- Mode: ${data.options.mode}`,
    `- Target queue: ${data.options.targetQueue}`,
    `- Batch limit: ${data.options.batchLimit}`,
    `- Duration minutes: ${data.options.durationMinutes}`,
    `- Max cache GB: ${data.options.maxCacheGb}`,
    '',
    '## Iterations',
    '',
    ...data.iterations.map((row) => `- ${row.iteration}: ${row.status}, processed ${row.processed}, skipped ${row.skipped}, failed ${row.failed}, cache ${row.cache_gb} GB, ${row.batch_file || 'no batch file'}`),
    '',
    '## Boundary',
    '',
    'This runner writes local workbench occurrence/candidate artifacts only. It does not alter rendered pages, public lookup shards, source files, or final HUD ranking.',
    '',
  ].join('\n');
}

function listJsonFiles(relativeDir) {
  const dir = path.join(root, relativeDir);
  if (!fs.existsSync(dir)) return new Set();
  return new Set(fs.readdirSync(dir).filter((name) => name.endsWith('.json')).map((name) => `${relativeDir}/${name}`));
}

function newestJsonFile(relativeDir, beforeSet) {
  const dir = path.join(root, relativeDir);
  if (!fs.existsSync(dir)) return null;
  return fs.readdirSync(dir)
    .filter((name) => name.endsWith('.json'))
    .map((name) => {
      const relativePath = `${relativeDir}/${name}`;
      const stat = fs.statSync(path.join(root, relativePath));
      return { relativePath, mtimeMs: stat.mtimeMs };
    })
    .filter((row) => !beforeSet.has(row.relativePath))
    .sort((a, b) => b.mtimeMs - a.mtimeMs)
    .map((row) => row.relativePath)[0] || null;
}

function dirSizeBytes(relativeDir) {
  const dir = path.join(root, relativeDir);
  if (!fs.existsSync(dir)) return 0;
  let total = 0;
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(fullPath);
      else if (entry.isFile()) total += fs.statSync(fullPath).size;
    }
  }
  return total;
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function valueAfterEquals(arg) {
  return arg.split('=').slice(1).join('=');
}

function gbToBytes(value) {
  return Number(value) * 1024 * 1024 * 1024;
}

function formatGb(bytes) {
  return (bytes / 1024 / 1024 / 1024).toFixed(2);
}

function stamp(date) {
  return date.toISOString().replace(/[:.]/g, '-');
}

function sleep(seconds) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, seconds * 1000);
}
