#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const defaults = {
  targetQueue: '.local-cache/workbench-evidence/smoke-target-queue.json',
  fullDir: '.local-cache/workbench-evidence/full',
  evidenceDir: '.local-cache/workbench-evidence/handoff,data/workbench-evidence',
  output: '.local-cache/workbench-evidence/smoke-pipeline-validation.json',
  report: 'reports/workbench-smoke-pipeline-validation.md',
  scratchDir: '.local-cache/workbench-evidence/smoke-pipeline-validation',
};

const options = parseArgs(process.argv.slice(2));
const steps = [];
const generatedAt = new Date().toISOString();
fs.mkdirSync(path.join(root, options.scratchDir), { recursive: true });

await runStep('validate_smoke_queue', [
  'scripts/validate_workbench_smoke_targets.mjs',
  options.targetQueue,
]);

const coverageJson = `${options.scratchDir}/reshit-smoke-coverage.json`;
await runStep('report_reshit_smoke_coverage', [
  'scripts/report_reshit_smoke_coverage.mjs',
  `--target-queue=${options.targetQueue}`,
  `--output=${coverageJson}`,
  `--report=${options.scratchDir}/reshit-smoke-coverage.md`,
  '--fail-on-uncovered',
]);

const smokeCountsJson = `${options.scratchDir}/reshit-smoke-counts.json`;
await runStep('report_workbench_smoke_counts', [
  'scripts/report_workbench_smoke_counts.mjs',
  `--target-queue=${options.targetQueue}`,
  `--full-dir=${options.fullDir}`,
  `--output=${smokeCountsJson}`,
  `--report=${options.scratchDir}/reshit-smoke-counts.md`,
]);

const handoffIndexJson = `${options.scratchDir}/handoff-index-smoke-complete.json`;
await runStep('build_complete_handoff_index', [
  'scripts/build_workbench_handoff_index.mjs',
  `--evidence-dir=${options.evidenceDir}`,
  `--target-queue=${options.targetQueue}`,
  '--include-smoke',
  '--require-target-queue-complete',
  `--output=${handoffIndexJson}`,
  `--report=${options.scratchDir}/handoff-index-smoke-complete.md`,
]);

await runStep('validate_complete_handoff_index', [
  'scripts/validate_workbench_handoff_index.mjs',
  handoffIndexJson,
]);

const artifactAuditJson = `${options.scratchDir}/candidate-artifact-audit.json`;
await runStep('audit_candidate_artifacts', [
  'scripts/audit_workbench_candidate_artifacts.mjs',
  `--target-queue=${options.targetQueue}`,
  `--output=${artifactAuditJson}`,
  `--report=${options.scratchDir}/candidate-artifact-audit.md`,
]);

const coverage = readJsonIfExists(coverageJson);
const smokeCounts = readJsonIfExists(smokeCountsJson);
const handoffIndex = readJsonIfExists(handoffIndexJson);
const artifactAudit = readJsonIfExists(artifactAuditJson);
const failedSteps = steps.filter((step) => step.status !== 'passed');

const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_smoke_pipeline_validation',
  generated_at: generatedAt,
  generator: 'scripts/validate_workbench_smoke_pipeline.mjs',
  policy: 'Smoke-only validation wrapper. It reads existing reshit/workbench artifacts, validates provenance and coverage, and does not scan broad corpus files or choose HUD winners.',
  inputs: {
    target_queue: options.targetQueue,
    full_dir: options.fullDir,
    evidence_dir: options.evidenceDir,
    scratch_dir: options.scratchDir,
  },
  counts: {
    steps: steps.length,
    failed_steps: failedSteps.length,
    smoke_targets: smokeCounts?.counts?.targets ?? null,
    smoke_supported: smokeCounts?.counts?.supported ?? null,
    smoke_candidate: smokeCounts?.counts?.candidate ?? null,
    smoke_weak: smokeCounts?.counts?.weak ?? null,
    smoke_ambiguous: smokeCounts?.counts?.ambiguous ?? null,
    smoke_missing: smokeCounts?.counts?.missing ?? null,
    smoke_zero_useful: smokeCounts?.counts?.zero_useful ?? null,
    known_nonzero_source_files: coverage?.counts?.known_nonzero_source_files ?? null,
    covered_source_files: coverage?.counts?.covered_source_files ?? null,
    uncovered_source_files: coverage?.counts?.uncovered_source_files ?? null,
    handoff_manifests: handoffIndex?.counts?.manifests ?? null,
    handoff_candidate_rows: handoffIndex?.counts?.candidate_rows ?? null,
    handoff_missing_targets: handoffIndex?.target_queue_coverage?.missing_targets?.length ?? null,
    useful_artifacts: artifactAudit?.counts?.useful_artifacts ?? null,
    zero_useful_non_smoke_artifacts: artifactAudit?.counts?.zero_useful_non_smoke_artifacts ?? null,
    orphan_smoke_artifacts: artifactAudit?.counts?.orphan_smoke_artifacts ?? null,
  },
  steps,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Smoke pipeline validation ${failedSteps.length ? 'failed' : 'passed'}; steps ${steps.length}; failed ${failedSteps.length}`);
if (failedSteps.length) process.exitCode = 2;

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--target-queue=')) parsed.targetQueue = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--full-dir=')) parsed.fullDir = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--evidence-dir=')) parsed.evidenceDir = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--scratch-dir=')) parsed.scratchDir = cleanRelativePath(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

async function runStep(name, args) {
  const startedAt = new Date().toISOString();
  const scriptPath = cleanRelativePath(args[0]);
  const scriptArgs = args.slice(1);
  const oldArgv = process.argv;
  const oldExit = process.exit;
  const oldExitCode = process.exitCode;
  const oldConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
  };
  const output = [];
  process.argv = [oldArgv[0] || 'node', scriptPath, ...scriptArgs];
  process.exitCode = 0;
  process.exit = ((code = 0) => {
    throw new ProcessExit(code);
  });
  console.log = (...parts) => output.push(parts.join(' '));
  console.error = (...parts) => output.push(parts.join(' '));
  console.warn = (...parts) => output.push(parts.join(' '));
  try {
    const importUrl = `${pathToFileURL(path.join(root, scriptPath)).href}?smokePipeline=${Date.now()}-${encodeURIComponent(name)}`;
    await import(importUrl);
    const exitCode = Number(process.exitCode || 0);
    if (exitCode !== 0) throw new ProcessExit(exitCode);
    steps.push({
      name,
      status: 'passed',
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      command: ['node', ...args].join(' '),
      output_tail: tailLines(output.join('\n')),
    });
  } catch (error) {
    const exitCode = error instanceof ProcessExit ? error.code : null;
    steps.push({
      name,
      status: 'failed',
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      command: ['node', ...args].join(' '),
      error: exitCode === null ? String(error.message || error) : `exit code ${exitCode}`,
      output_tail: tailLines(output.join('\n')),
    });
  } finally {
    process.argv = oldArgv;
    process.exit = oldExit;
    process.exitCode = oldExitCode;
    console.log = oldConsole.log;
    console.error = oldConsole.error;
    console.warn = oldConsole.warn;
  }
}

class ProcessExit extends Error {
  constructor(code) {
    super(`process.exit(${code})`);
    this.code = Number(code || 0);
  }
}

function readJsonIfExists(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) return null;
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function writeJson(relativePath, data) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Smoke Pipeline Validation',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Steps: ${artifact.counts.steps}`,
    `- Failed steps: ${artifact.counts.failed_steps}`,
    `- Smoke targets: ${artifact.counts.smoke_targets}`,
    `- Smoke counts: supported ${artifact.counts.smoke_supported}, candidate ${artifact.counts.smoke_candidate}, weak ${artifact.counts.smoke_weak}, ambiguous ${artifact.counts.smoke_ambiguous}`,
    `- Missing smoke artifacts: ${artifact.counts.smoke_missing}`,
    `- Zero-useful smoke targets: ${artifact.counts.smoke_zero_useful}`,
    `- Reshit source coverage: ${artifact.counts.covered_source_files}/${artifact.counts.known_nonzero_source_files}, uncovered ${artifact.counts.uncovered_source_files}`,
    `- Handoff coverage: ${artifact.counts.handoff_manifests} manifests, missing targets ${artifact.counts.handoff_missing_targets}`,
    `- Candidate artifact audit: useful ${artifact.counts.useful_artifacts}, zero-useful non-smoke ${artifact.counts.zero_useful_non_smoke_artifacts}, orphan smoke ${artifact.counts.orphan_smoke_artifacts}`,
    '',
    '## Steps',
    '',
    '| step | status | output |',
    '|---|---|---|',
    ...artifact.steps.map((step) => `| ${mdCell(step.name)} | ${step.status} | ${mdCell(step.output_tail || step.error || '')} |`),
    '',
    '## Boundary',
    '',
    'This wrapper validates smoke-only workbench evidence. It does not run broad target selection, expand prefix families, import source text, rank definitions, or choose HUD winners.',
  ];
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${lines.join('\n')}\n`, 'utf8');
}

function tailLines(value, maxLines = 3) {
  return String(value || '')
    .split(/\r?\n/)
    .filter(Boolean)
    .slice(-maxLines)
    .join(' / ');
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function valueAfterEquals(arg) {
  return arg.split('=').slice(1).join('=');
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}
