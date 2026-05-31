#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const defaults = {
  index: 'data/workbench-evidence/public-handoff-index.json',
  output: '.local-cache/workbench-evidence/public-handoff-integrity-check.json',
  report: 'reports/workbench-public-handoff-integrity-check.md',
  maxRows: 80,
};

const options = parseArgs(process.argv.slice(2));
const index = readJson(options.index);
if (index.artifact_type !== 'workbench_public_handoff_index') {
  throw new Error(`${options.index} is not a workbench public handoff index`);
}

const rows = [];
for (const manifest of index.manifests || []) {
  for (const [kind, expected] of Object.entries(manifest.file_integrity || {})) {
    rows.push(checkFile(manifest.slug, kind, expected));
  }
}

const counts = rows.reduce((sum, row) => {
  sum.files += 1;
  if (row.expected_exists) sum.expected_existing += 1;
  if (row.current_exists) sum.current_existing += 1;
  if (row.status === 'matched') sum.matched += 1;
  else if (row.status === 'missing') sum.missing += 1;
  else if (row.status === 'unexpected_present') sum.unexpected_present += 1;
  else if (row.status === 'mismatched') sum.mismatched += 1;
  return sum;
}, {
  files: 0,
  expected_existing: 0,
  current_existing: 0,
  matched: 0,
  missing: 0,
  unexpected_present: 0,
  mismatched: 0,
});

const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_public_handoff_integrity_check',
  generated_at: new Date().toISOString(),
  generator: 'scripts/check_workbench_public_handoff_integrity.mjs',
  policy: 'Selected public handoff integrity check only. It hashes local handoff files referenced by the public index and does not expose row payloads, rank definitions, scan broad corpus files, or choose HUD winners.',
  inputs: {
    index: options.index,
  },
  quality: {
    status: counts.missing || counts.unexpected_present || counts.mismatched ? 'failed' : 'passed',
    notes: 'A failed status means the committed public index no longer matches the selected local handoff files.',
  },
  counts,
  failures: rows.filter((row) => row.status !== 'matched'),
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Public handoff integrity ${artifact.quality.status}; files ${counts.files}; matched ${counts.matched}; missing ${counts.missing}; mismatched ${counts.mismatched}; unexpected ${counts.unexpected_present}`);
if (artifact.quality.status !== 'passed') process.exitCode = 2;

function checkFile(slug, kind, expected) {
  const expectedPath = cleanRelativePath(expected?.path);
  const current = digestFile(expectedPath);
  let status = 'matched';
  if (expected?.exists === true && !current.exists) status = 'missing';
  else if (expected?.exists !== true && current.exists) status = 'unexpected_present';
  else if (expected?.exists === true && (Number(expected.bytes || 0) !== current.bytes || expected.sha256 !== current.sha256)) {
    status = 'mismatched';
  }
  return {
    slug,
    kind,
    path: expectedPath,
    status,
    expected_exists: expected?.exists === true,
    current_exists: current.exists,
    expected_bytes: Number(expected?.bytes || 0),
    current_bytes: current.bytes,
    expected_sha256: expected?.sha256 || null,
    current_sha256: current.sha256,
  };
}

function digestFile(relativePath) {
  if (!relativePath) return { exists: false, bytes: 0, sha256: null };
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) return { exists: false, bytes: 0, sha256: null };
  const bytes = fs.readFileSync(fullPath);
  return {
    exists: true,
    bytes: bytes.length,
    sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
  };
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--index=')) parsed.index = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--max-rows=')) parsed.maxRows = Number(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!Number.isInteger(parsed.maxRows) || parsed.maxRows < 0) throw new Error('--max-rows must be a non-negative integer');
  return parsed;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

function writeJson(relativePath, data) {
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Public Handoff Integrity Check',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Status: ${artifact.quality.status}`,
    `- Files: ${artifact.counts.files}`,
    `- Matched: ${artifact.counts.matched}`,
    `- Missing: ${artifact.counts.missing}`,
    `- Mismatched: ${artifact.counts.mismatched}`,
    `- Unexpected present: ${artifact.counts.unexpected_present}`,
    '',
    '## Failures',
    '',
    '| slug | kind | status | expected bytes | current bytes | path |',
    '|---|---|---|---:|---:|---|',
    ...artifact.failures.slice(0, options.maxRows).map((row) => (
      `| ${mdCell(row.slug)} | ${mdCell(row.kind)} | ${row.status} | ${row.expected_bytes} | ${row.current_bytes} | ${mdCell(row.path)} |`
    )),
    '',
    '## Boundary',
    '',
    'This check hashes selected handoff artifact files referenced by the public index. It does not include source text, phrase rows, definition rows, final ranking, or HUD display decisions.',
  ];
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${lines.join('\n')}\n`, 'utf8');
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
