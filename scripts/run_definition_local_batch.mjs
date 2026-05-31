#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();

const defaults = {
  runId: new Date().toISOString().replace(/[:.]/g, '-'),
  maxTotalRows: 200000,
  citableMaxPerToken: 40,
  phraseMaxPerToken: 5,
  morphologyMaxPerToken: 40,
  window: 3,
  includeRiskyMorphology: false,
};

const options = parseArgs(process.argv.slice(2));
const runDir = `.local-cache/definition-routes/runs/${options.runId}`;
const reportsDir = `${runDir}/reports`;

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg === '--include-risky-morphology') parsed.includeRiskyMorphology = true;
    else if (arg.startsWith('--run-id=')) parsed.runId = cleanSegment(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--max-total-rows=')) parsed.maxTotalRows = Number(arg.split('=')[1]);
    else if (arg.startsWith('--citable-max-per-token=')) parsed.citableMaxPerToken = Number(arg.split('=')[1]);
    else if (arg.startsWith('--phrase-max-per-token=')) parsed.phraseMaxPerToken = Number(arg.split('=')[1]);
    else if (arg.startsWith('--morphology-max-per-token=')) parsed.morphologyMaxPerToken = Number(arg.split('=')[1]);
    else if (arg.startsWith('--window=')) parsed.window = Number(arg.split('=')[1]);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  for (const key of ['maxTotalRows', 'citableMaxPerToken', 'phraseMaxPerToken', 'morphologyMaxPerToken', 'window']) {
    if (!Number.isInteger(parsed[key]) || parsed[key] < 0) {
      throw new Error(`--${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)} must be a non-negative integer`);
    }
  }
  if (!parsed.runId) throw new Error('--run-id must not be empty');
  return parsed;
}

function cleanSegment(value) {
  return String(value || '').replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-');
}

function mkdirp(relativePath) {
  fs.mkdirSync(path.join(root, relativePath), { recursive: true });
}

function runNode(script, args) {
  const started = Date.now();
  const stdout = execFileSync(process.execPath, [script, ...args], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 32 * 1024 * 1024,
  });
  return {
    script,
    args,
    seconds: Number(((Date.now() - started) / 1000).toFixed(2)),
    stdout: stdout.trim(),
  };
}

function bulletCommand(step) {
  const command = ['node', step.script, ...step.args].join(' ');
  return `- ${step.script}: ${step.seconds}s\n  ${command}`;
}

mkdirp(runDir);
mkdirp(reportsDir);

const paths = {
  citableJsonl: `${runDir}/source-citable-paraphrase-evidence.jsonl`,
  citableCsv: `${runDir}/source-citable-paraphrase-evidence.csv`,
  citableIndex: `${runDir}/source-citable-paraphrase-token-index.json`,
  citableSample: `${runDir}/source-citable-paraphrase-evidence-sample.json`,
  citableAudit: `${reportsDir}/citable-paraphrase-evidence-audit.md`,
  phraseJsonl: `${runDir}/source-phrase-evidence.jsonl`,
  phraseCsv: `${runDir}/source-phrase-evidence.csv`,
  phraseIndex: `${runDir}/source-phrase-token-index.json`,
  phraseSample: `${runDir}/source-phrase-evidence-sample.json`,
  phraseAudit: `${reportsDir}/phrase-evidence-audit.md`,
  morphologyJsonl: `${runDir}/source-citable-morphology-review-evidence.jsonl`,
  morphologyCsv: `${runDir}/source-citable-morphology-review-evidence.csv`,
  morphologyIndex: `${runDir}/source-citable-morphology-review-token-index.json`,
  morphologySample: `${runDir}/source-citable-morphology-review-evidence-sample.json`,
  morphologyAudit: `${reportsDir}/morphology-citable-review-audit.md`,
  morphologyQualityAudit: `${reportsDir}/morphology-review-quality-audit.md`,
  coverageAudit: `${reportsDir}/definition-coverage-audit.md`,
  cacheSizeAudit: `${reportsDir}/definition-cache-size-audit.md`,
};

const steps = [];

steps.push(runNode('scripts/build_citable_paraphrase_evidence.mjs', [
  '--local-only',
  `--max-total-rows=${options.maxTotalRows}`,
  `--max-per-token=${options.citableMaxPerToken}`,
  `--window=${options.window}`,
  `--jsonl=${paths.citableJsonl}`,
  `--csv=${paths.citableCsv}`,
  `--index=${paths.citableIndex}`,
  `--sample=${paths.citableSample}`,
]));
steps.push(runNode('scripts/audit_citable_paraphrase_evidence.mjs', [paths.citableJsonl, paths.citableAudit]));

steps.push(runNode('scripts/build_phrase_evidence.mjs', [
  '--local-only',
  `--max-total-rows=${options.maxTotalRows}`,
  `--max-per-token=${options.phraseMaxPerToken}`,
  `--window=${options.window}`,
  `--jsonl=${paths.phraseJsonl}`,
  `--csv=${paths.phraseCsv}`,
  `--index=${paths.phraseIndex}`,
  `--sample=${paths.phraseSample}`,
]));
steps.push(runNode('scripts/audit_phrase_evidence.mjs', [paths.phraseJsonl, paths.phraseAudit]));

const morphologyArgs = [
  '--local-only',
  '--include-morphology',
  `--max-total-rows=${options.maxTotalRows}`,
  `--max-per-token=${options.morphologyMaxPerToken}`,
  `--window=${options.window}`,
  `--jsonl=${paths.morphologyJsonl}`,
  `--csv=${paths.morphologyCsv}`,
  `--index=${paths.morphologyIndex}`,
  `--sample=${paths.morphologySample}`,
];
if (options.includeRiskyMorphology) morphologyArgs.splice(2, 0, '--include-risky-morphology');
steps.push(runNode('scripts/build_citable_paraphrase_evidence.mjs', morphologyArgs));
steps.push(runNode('scripts/audit_citable_paraphrase_evidence.mjs', [paths.morphologyJsonl, paths.morphologyAudit]));
steps.push(runNode('scripts/audit_morphology_review_quality.mjs', [paths.morphologyJsonl, paths.morphologyQualityAudit]));
steps.push(runNode('scripts/audit_definition_coverage.mjs', [paths.phraseJsonl, paths.morphologyJsonl, paths.coverageAudit]));
steps.push(runNode('scripts/audit_definition_cache_size.mjs', [runDir, paths.cacheSizeAudit]));

const summaryPath = `${reportsDir}/definition-local-batch-summary.md`;
const summary = [
  '# Definition Local Batch Summary',
  '',
  `- Run ID: ${options.runId}`,
  `- Run directory: ${runDir}`,
  `- Max rows per lane: ${options.maxTotalRows}`,
  `- Include risky morphology: ${options.includeRiskyMorphology ? 'yes' : 'no'}`,
  '',
  '## Outputs',
  '',
  ...Object.entries(paths).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Steps',
  '',
  ...steps.map(bulletCommand),
  '',
].join('\n');

fs.writeFileSync(path.join(root, summaryPath), summary, 'utf8');

console.log(JSON.stringify({
  run_id: options.runId,
  run_dir: runDir,
  summary: summaryPath,
  steps: steps.map((step) => ({ script: step.script, seconds: step.seconds })),
}, null, 2));
