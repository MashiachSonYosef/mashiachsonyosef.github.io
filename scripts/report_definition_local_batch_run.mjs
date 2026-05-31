#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const defaults = {
  runDir: '',
  out: '',
};

const options = parseArgs(process.argv.slice(2));
const runDir = normalizeRelativePath(options.runDir);
const outPath = normalizeRelativePath(options.out || path.posix.join(runDir, 'reports/definition-local-batch-run-report.md'));
const reportsDir = path.posix.join(runDir, 'reports');

const reportPaths = {
  summary: path.posix.join(reportsDir, 'definition-local-batch-summary.md'),
  citable: path.posix.join(reportsDir, 'citable-paraphrase-evidence-audit.md'),
  phrase: path.posix.join(reportsDir, 'phrase-evidence-audit.md'),
  morphology: path.posix.join(reportsDir, 'morphology-citable-review-audit.md'),
  morphologyQuality: path.posix.join(reportsDir, 'morphology-review-quality-audit.md'),
  coverage: path.posix.join(reportsDir, 'definition-coverage-audit.md'),
  cacheSize: path.posix.join(reportsDir, 'definition-cache-size-audit.md'),
};

const reports = Object.fromEntries(
  Object.entries(reportPaths).map(([key, value]) => [key, readText(value)]),
);

const validationIssues = collectValidationIssues(reports);
if (validationIssues.length) {
  for (const issue of validationIssues) console.error(`- ${issue}`);
  process.exit(1);
}

const lines = [
  '# Definition Local Batch Runner Report',
  '',
  '## Scope',
  '',
  `- Runner: \`scripts/run_definition_local_batch.mjs\``,
  `- Run ID: \`${metric(reports.summary, 'Run ID')}\``,
  `- Run directory: \`${metric(reports.summary, 'Run directory') || runDir}\``,
  `- Max rows per lane: ${metric(reports.summary, 'Max rows per lane')}`,
  `- JSONL shard max bytes: ${metric(reports.summary, 'JSONL shard max bytes') || 'not recorded'}`,
  `- Include risky morphology: ${metric(reports.summary, 'Include risky morphology')}`,
  '- Purpose: exercise the definition importer pipeline end-to-end without touching public HUD/source artifacts.',
  '',
  '## Batch Counts',
  '',
  `- Citable rows: ${metric(reports.citable, 'Rows')}`,
  `- Phrase/subphrase rows: ${metric(reports.phrase, 'Rows')}`,
  `- Morphology-review citable rows: ${metric(reports.morphology, 'Rows')}`,
  `- Proposed morphology rows: ${metric(reports.morphologyQuality, 'Proposed morphology rows')}`,
  `- Morphology quality risk rows: ${metric(reports.morphologyQuality, 'Risk-flagged morphology rows')}`,
  `- Cache size for this run: ${metric(reports.cacheSize, 'Total size')}`,
  `- Cache warning threshold: ${metric(reports.cacheSize, 'Warning threshold')}`,
  '',
  '## Coverage',
  '',
  `- Distinct phrase/subphrase focus tokens: ${metric(reports.coverage, 'Distinct phrase/subphrase focus tokens')}`,
  `- Distinct citable focus tokens, all statuses: ${metric(reports.coverage, 'Distinct citable focus tokens, all statuses')}`,
  `- Distinct accepted citable focus tokens: ${metric(reports.coverage, 'Distinct accepted citable focus tokens')}`,
  `- Distinct proposed citable focus tokens: ${metric(reports.coverage, 'Distinct proposed citable focus tokens')}`,
  `- Coverage with accepted rows only: ${metric(reports.coverage, 'Phrase focus token coverage, accepted only')}`,
  `- Coverage with accepted plus proposed morphology review rows: ${metric(reports.coverage, 'Phrase focus token coverage, any status')}`,
  '',
  '## License Summary',
  '',
  '- Citable usage licenses:',
  ...indentBullets(sectionBullets(reports.citable, 'Usage Licenses')),
  '- Citable source licenses:',
  ...indentBullets(sectionBullets(reports.citable, 'Source Licenses')),
  '- Phrase usage licenses:',
  ...indentBullets(sectionBullets(reports.phrase, 'Source Licenses')),
  '- Morphology-review source licenses:',
  ...indentBullets(sectionBullets(reports.morphology, 'Source Licenses')),
  '',
  '## Validation',
  '',
  '- Citable paraphrase audit passed.',
  '- Phrase evidence audit passed.',
  '- Morphology citable review audit passed.',
  '- Morphology review quality audit passed with zero risk rows.',
  '- Definition coverage audit passed.',
  '- Cache size audit passed below threshold.',
  '',
].join('\n');

fs.mkdirSync(path.dirname(path.join(root, outPath)), { recursive: true });
fs.writeFileSync(path.join(root, outPath), lines, 'utf8');
console.log(`Definition local batch report written: ${outPath}`);

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--run-dir=')) parsed.runDir = arg.split('=').slice(1).join('=');
    else if (arg.startsWith('--out=')) parsed.out = arg.split('=').slice(1).join('=');
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!parsed.runDir) throw new Error('--run-dir is required');
  return parsed;
}

function normalizeRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\/+/, '');
  if (!normalized || normalized.includes('\0')) throw new Error(`Invalid path: ${value}`);
  if (path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to the repo root: ${value}`);
  }
  return normalized;
}

function readText(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) throw new Error(`Missing report input: ${relativePath}`);
  return fs.readFileSync(fullPath, 'utf8');
}

function metric(markdown, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = markdown.match(new RegExp(`^- ${escaped}:\\s*(.+)$`, 'm'));
  return match ? match[1].trim() : '';
}

function sectionBullets(markdown, heading) {
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`);
  if (start === -1) return ['- none'];
  const bullets = [];
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith('## ')) break;
    if (line.startsWith('- ')) bullets.push(line);
  }
  return bullets.length ? bullets : ['- none'];
}

function indentBullets(bullets) {
  return bullets.map((line) => `  ${line}`);
}

function collectValidationIssues(markdownReports) {
  const issues = [];
  for (const key of ['citable', 'phrase', 'morphology', 'coverage']) {
    if (metric(markdownReports[key], 'Issues') !== '0') {
      issues.push(`${key} audit did not report Issues: 0`);
    }
  }
  if (metric(markdownReports.morphologyQuality, 'Risk-flagged morphology rows') !== '0') {
    issues.push('morphology quality audit found risk-flagged rows');
  }
  if (metric(markdownReports.cacheSize, 'Over threshold') !== 'no') {
    issues.push('definition cache size audit is over threshold');
  }
  return issues;
}
