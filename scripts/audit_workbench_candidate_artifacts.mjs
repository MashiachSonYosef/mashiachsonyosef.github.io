#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  dirs: '.local-cache/workbench-evidence/full,data/workbench-evidence',
  targetQueue: '.local-cache/workbench-evidence/smoke-target-queue.json',
  output: '.local-cache/workbench-evidence/candidate-artifact-audit.json',
  report: 'reports/workbench-candidate-artifact-audit.md',
  headerBytes: 1024 * 1024,
  failOnZeroUseful: false,
};

const options = parseArgs(process.argv.slice(2));
const targetSlugs = loadTargetQueueSlugs(options.targetQueue);
const artifactPaths = splitPathList(options.dirs).flatMap((dir) => collectCandidateArtifacts(dir));
const rows = artifactPaths.map((relativePath) => inspectArtifact(relativePath, targetSlugs));

const totals = rows.reduce((sum, row) => {
  sum.artifacts += 1;
  sum.candidate_rows += row.counts.candidate_rows;
  sum.supported += row.counts.supported;
  sum.candidate += row.counts.candidate;
  sum.weak += row.counts.weak;
  sum.ambiguous += row.counts.ambiguous;
  if (row.useful_count > 0) sum.useful_artifacts += 1;
  else sum.zero_useful_artifacts += 1;
  if (row.is_smoke) sum.smoke_artifacts += 1;
  if (row.is_smoke && !row.in_target_queue) sum.orphan_smoke_artifacts += 1;
  if (!row.is_smoke && row.useful_count === 0) sum.zero_useful_non_smoke_artifacts += 1;
  return sum;
}, {
  artifacts: 0,
  useful_artifacts: 0,
  zero_useful_artifacts: 0,
  zero_useful_non_smoke_artifacts: 0,
  smoke_artifacts: 0,
  orphan_smoke_artifacts: 0,
  candidate_rows: 0,
  supported: 0,
  candidate: 0,
  weak: 0,
  ambiguous: 0,
});

const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_candidate_artifact_audit',
  generated_at: new Date().toISOString(),
  generator: 'scripts/audit_workbench_candidate_artifacts.mjs',
  policy: 'Audits existing candidate-evidence artifacts only. It does not scan source corpus, create evidence, rank definitions, or select HUD winners.',
  inputs: {
    dirs: splitPathList(options.dirs),
    target_queue: options.targetQueue,
    header_bytes: options.headerBytes,
  },
  counts: totals,
  rows: rows.sort((a, b) => (
    b.useful_count - a.useful_count
    || b.counts.candidate_rows - a.counts.candidate_rows
    || a.path.localeCompare(b.path)
  )),
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Artifacts ${totals.artifacts}; useful ${totals.useful_artifacts}; zero useful ${totals.zero_useful_artifacts}; zero useful non-smoke ${totals.zero_useful_non_smoke_artifacts}; orphan smoke ${totals.orphan_smoke_artifacts}`);

if (options.failOnZeroUseful && totals.zero_useful_non_smoke_artifacts > 0) process.exitCode = 2;

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--dirs=')) parsed.dirs = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--target-queue=')) parsed.targetQueue = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--header-bytes=')) parsed.headerBytes = Number(arg.split('=')[1]);
    else if (arg === '--fail-on-zero-useful') parsed.failOnZeroUseful = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!Number.isInteger(parsed.headerBytes) || parsed.headerBytes < 65536) {
    throw new Error('--header-bytes must be an integer >= 65536');
  }
  return parsed;
}

function collectCandidateArtifacts(relativeDir) {
  const base = path.join(root, relativeDir);
  if (!fs.existsSync(base)) return [];
  const found = [];
  walk(base, (fullPath) => {
    const normalized = cleanRelativePath(path.relative(root, fullPath));
    if (normalized.endsWith('-candidate-evidence.json')) found.push(normalized);
  });
  return found;
}

function walk(dir, onFile) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(fullPath, onFile);
    else if (entry.isFile()) onFile(fullPath);
  }
}

function inspectArtifact(relativePath, targetSlugs) {
  const fullPath = path.join(root, relativePath);
  const header = readHeader(fullPath, options.headerBytes);
  const counts = parseObjectAfterKey(header, 'counts');
  const focus = parseObjectAfterKey(header, 'focus');
  const slug = slugFromPath(relativePath);
  const usefulCount = Number(counts.supported || 0) + Number(counts.candidate || 0) + Number(counts.weak || 0);
  const isSmoke = /(?:^|[/-])[^/]*smoke[^/]*-candidate-evidence\.json$/i.test(relativePath);
  return {
    path: relativePath,
    slug,
    bytes: fs.statSync(fullPath).size,
    is_smoke: isSmoke,
    in_target_queue: targetSlugs ? targetSlugs.has(slug) : null,
    focus: {
      token_normalized: focus.token_normalized || null,
      token_key: focus.token_key || null,
    },
    counts: {
      candidate_rows: Number(counts.candidate_rows || 0),
      supported: Number(counts.supported || 0),
      candidate: Number(counts.candidate || 0),
      weak: Number(counts.weak || 0),
      ambiguous: Number(counts.ambiguous || 0),
      blocked_rows_recorded: Number(counts.blocked_rows_recorded || 0),
    },
    useful_count: usefulCount,
    status: usefulCount > 0 ? 'useful' : 'zero_useful',
  };
}

function readHeader(fullPath, bytes) {
  const fd = fs.openSync(fullPath, 'r');
  try {
    const buffer = Buffer.alloc(bytes);
    const read = fs.readSync(fd, buffer, 0, bytes, 0);
    return buffer.subarray(0, read).toString('utf8');
  } finally {
    fs.closeSync(fd);
  }
}

function parseObjectAfterKey(text, key) {
  const keyIndex = text.indexOf(`"${key}"`);
  if (keyIndex < 0) return {};
  const open = text.indexOf('{', keyIndex);
  if (open < 0) return {};
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = open; index < text.length; index += 1) {
    const char = text[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') inString = true;
    else if (char === '{') depth += 1;
    else if (char === '}') {
      depth -= 1;
      if (depth === 0) return JSON.parse(text.slice(open, index + 1));
    }
  }
  throw new Error(`Could not parse ${key} object from artifact header`);
}

function slugFromPath(relativePath) {
  return path.basename(relativePath).replace(/-candidate-evidence\.json$/, '');
}

function loadTargetQueueSlugs(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) return null;
  const queue = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  if (queue.artifact_type !== 'workbench_target_queue') return null;
  return new Set((Array.isArray(queue.targets) ? queue.targets : [])
    .map((target) => target.slug || target.slug_override)
    .filter(Boolean));
}

function writeJson(relativePath, data) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Candidate Artifact Audit',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Scope',
    '',
    `- Artifacts: ${artifact.counts.artifacts}`,
    `- Useful artifacts: ${artifact.counts.useful_artifacts}`,
    `- Zero-useful artifacts: ${artifact.counts.zero_useful_artifacts}`,
    `- Zero-useful non-smoke artifacts: ${artifact.counts.zero_useful_non_smoke_artifacts}`,
    `- Smoke artifacts: ${artifact.counts.smoke_artifacts}`,
    `- Orphan smoke artifacts: ${artifact.counts.orphan_smoke_artifacts}`,
    `- Candidate rows: ${artifact.counts.candidate_rows}`,
    `- Supported: ${artifact.counts.supported}`,
    `- Candidate: ${artifact.counts.candidate}`,
    `- Weak: ${artifact.counts.weak}`,
    `- Ambiguous: ${artifact.counts.ambiguous}`,
    '',
    '## Useful Lanes',
    '',
    '| slug | focus | useful | supported | candidate | weak | ambiguous | rows | path |',
    '|---|---|---:|---:|---:|---:|---:|---:|---|',
    ...artifact.rows
      .filter((row) => row.useful_count > 0)
      .slice(0, 80)
      .map((row) => `| ${mdCell(row.slug)} | ${mdCell(row.focus.token_normalized || '')} | ${row.useful_count} | ${row.counts.supported} | ${row.counts.candidate} | ${row.counts.weak} | ${row.counts.ambiguous} | ${row.counts.candidate_rows} | ${mdCell(row.path)} |`),
    '',
    '## Stop Lanes',
    '',
    '| slug | focus | smoke | queued | ambiguous | rows | path |',
    '|---|---|---:|---:|---:|---:|---|',
    ...artifact.rows
      .filter((row) => row.useful_count === 0)
      .slice(0, 80)
      .map((row) => `| ${mdCell(row.slug)} | ${mdCell(row.focus.token_normalized || '')} | ${row.is_smoke ? 'yes' : 'no'} | ${row.in_target_queue === null ? 'n/a' : row.in_target_queue ? 'yes' : 'no'} | ${row.counts.ambiguous} | ${row.counts.candidate_rows} | ${mdCell(row.path)} |`),
    '',
    '## Orphan Smoke Artifacts',
    '',
    '| slug | focus | useful | supported | candidate | weak | ambiguous | rows | path |',
    '|---|---|---:|---:|---:|---:|---:|---:|---|',
    ...artifact.rows
      .filter((row) => row.is_smoke && row.in_target_queue === false)
      .slice(0, 80)
      .map((row) => `| ${mdCell(row.slug)} | ${mdCell(row.focus.token_normalized || '')} | ${row.useful_count} | ${row.counts.supported} | ${row.counts.candidate} | ${row.counts.weak} | ${row.counts.ambiguous} | ${row.counts.candidate_rows} | ${mdCell(row.path)} |`),
    '',
    '## Boundary',
    '',
    'This audit reads existing candidate artifacts only. It should be used to stop zero-useful lanes and to avoid restarting broad workbench runs.',
  ];
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${lines.join('\n')}\n`, 'utf8');
}

function splitPathList(value) {
  return String(value || '').split(',').map((part) => cleanRelativePath(part.trim())).filter(Boolean);
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}
