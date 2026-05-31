#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input: '.local-cache/workbench-evidence/full/reshit-candidate-evidence.json',
  targetQueue: '.local-cache/workbench-evidence/smoke-target-queue.json',
  output: '.local-cache/workbench-evidence/reshit-smoke-coverage.json',
  report: 'reports/workbench-reshit-smoke-coverage.md',
  focusNormalized: '\u05e8\u05d0\u05e9\u05d9\u05ea',
  chunkSize: 5,
  failOnUncovered: false,
};

const options = parseArgs(process.argv.slice(2));
const candidateArtifact = readJson(options.input);
const queue = readJson(options.targetQueue);
if (queue.artifact_type !== 'workbench_target_queue') {
  throw new Error(`${options.targetQueue} is not a workbench target queue`);
}

const focus = String(options.focusNormalized || candidateArtifact.focus?.token_normalized || '');
const knownSourceRows = collectKnownNonzeroSources(candidateArtifact, focus);
const queuedSources = collectQueuedSources(queue);
const queuedSourceSet = new Set(queuedSources);
const knownSourceSet = new Set(knownSourceRows.map((row) => row.source_file));
const coveredSources = knownSourceRows.filter((row) => queuedSourceSet.has(row.source_file));
const uncoveredSources = knownSourceRows.filter((row) => !queuedSourceSet.has(row.source_file));
const queuedOutsideKnownNonzero = queuedSources.filter((sourceFile) => !knownSourceSet.has(sourceFile));
const suggestedTargetChunks = chunk(uncoveredSources, options.chunkSize).map((rows, index) => ({
  slug: `reshit-smoke-gap-${String(index + 1).padStart(3, '0')}`,
  source_files: rows.map((row) => row.source_file),
  expected_status_counts: sumCounts(rows),
  source_file_summaries: rows,
}));

const artifact = {
  schema_version: 1,
  artifact_type: 'reshit_smoke_coverage_report',
  generated_at: new Date().toISOString(),
  generator: 'scripts/report_reshit_smoke_coverage.mjs',
  policy: 'Coverage report for known nonzero exact \u05e8\u05d0\u05e9\u05d9\u05ea smoke source files. It reads existing artifacts only and does not scan the corpus or create definition claims.',
  inputs: {
    candidate_evidence: options.input,
    target_queue: options.targetQueue,
    focus_normalized: focus,
    chunk_size: options.chunkSize,
  },
  counts: {
    known_nonzero_source_files: knownSourceRows.length,
    queued_source_files: queuedSources.length,
    covered_source_files: coveredSources.length,
    uncovered_source_files: uncoveredSources.length,
    queued_outside_known_nonzero_source_files: queuedOutsideKnownNonzero.length,
    suggested_gap_targets: suggestedTargetChunks.length,
  },
  status_counts: sumCounts(knownSourceRows),
  uncovered_status_counts: sumCounts(uncoveredSources),
  queued_outside_known_nonzero: queuedOutsideKnownNonzero,
  uncovered_sources: uncoveredSources,
  suggested_gap_targets: suggestedTargetChunks,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Known nonzero source files ${knownSourceRows.length}; covered ${coveredSources.length}; uncovered ${uncoveredSources.length}; suggested gap targets ${suggestedTargetChunks.length}`);

if (options.failOnUncovered && uncoveredSources.length > 0) process.exitCode = 2;

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--input=')) parsed.input = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--target-queue=')) parsed.targetQueue = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--focus-normalized=')) parsed.focusNormalized = valueAfterEquals(arg);
    else if (arg.startsWith('--chunk-size=')) parsed.chunkSize = Number(valueAfterEquals(arg));
    else if (arg === '--fail-on-uncovered') parsed.failOnUncovered = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!Number.isInteger(parsed.chunkSize) || parsed.chunkSize < 1 || parsed.chunkSize > 5) {
    throw new Error('--chunk-size must be an integer from 1-5');
  }
  return parsed;
}

function collectKnownNonzeroSources(artifact, focus) {
  const bySourceFile = new Map();
  for (const row of Array.isArray(artifact.candidate_rows) ? artifact.candidate_rows : []) {
    if (String(row.focus_normalized || '') !== focus) continue;
    if (!isExactNormalizedMatch(row, focus)) continue;
    const status = ['supported', 'candidate', 'weak', 'ambiguous'].includes(row.candidate_status)
      ? row.candidate_status
      : 'ambiguous';
    const workId = String(row.work_id || '').trim();
    if (!workId) continue;
    const sourceFile = `data/sources/${workId}.json`;
    if (!fs.existsSync(path.join(root, sourceFile))) continue;
    const summary = bySourceFile.get(sourceFile) || {
      source_file: sourceFile,
      work_id: workId,
      work_title: row.work_title || workId,
      status_counts: { supported: 0, candidate: 0, weak: 0, ambiguous: 0, non_ambiguous: 0 },
      best_raw_score: 0,
      cluster_ids: new Set(),
      sample_refs: [],
    };
    summary.status_counts[status] += 1;
    if (status !== 'ambiguous') summary.status_counts.non_ambiguous += 1;
    summary.best_raw_score = Math.max(summary.best_raw_score, Number(row.raw_score || 0));
    if (row.cluster_id) summary.cluster_ids.add(row.cluster_id);
    if (row.source_ref && summary.sample_refs.length < 5) summary.sample_refs.push(row.source_ref);
    bySourceFile.set(sourceFile, summary);
  }
  return [...bySourceFile.values()]
    .filter((row) => row.status_counts.non_ambiguous > 0)
    .map((row) => ({
      ...row,
      cluster_ids: [...row.cluster_ids].sort(),
    }))
    .sort((a, b) => (
      b.status_counts.supported - a.status_counts.supported
      || b.status_counts.candidate - a.status_counts.candidate
      || b.status_counts.weak - a.status_counts.weak
      || b.best_raw_score - a.best_raw_score
      || a.source_file.localeCompare(b.source_file)
    ));
}

function collectQueuedSources(queue) {
  const sources = [];
  for (const target of Array.isArray(queue.targets) ? queue.targets : []) {
    for (const sourceFile of Array.isArray(target.source_files) ? target.source_files : []) {
      const cleanPath = cleanRelativePath(sourceFile);
      if (cleanPath.startsWith('data/sources/') && cleanPath.endsWith('.json')) sources.push(cleanPath);
    }
  }
  return [...new Set(sources)].sort();
}

function isExactNormalizedMatch(row, focus) {
  if (row.score_components?.match_basis === 'normalized_exact') return true;
  return String(row.token_normalized || '') === focus && String(row.focus_normalized || '') === focus;
}

function sumCounts(rows) {
  return rows.reduce((sum, row) => ({
    supported: sum.supported + Number(row.status_counts?.supported || 0),
    candidate: sum.candidate + Number(row.status_counts?.candidate || 0),
    weak: sum.weak + Number(row.status_counts?.weak || 0),
    ambiguous: sum.ambiguous + Number(row.status_counts?.ambiguous || 0),
    non_ambiguous: sum.non_ambiguous + Number(row.status_counts?.non_ambiguous || 0),
  }), { supported: 0, candidate: 0, weak: 0, ambiguous: 0, non_ambiguous: 0 });
}

function chunk(rows, size) {
  const groups = [];
  for (let index = 0; index < rows.length; index += size) groups.push(rows.slice(index, index + size));
  return groups;
}

function readJson(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) throw new Error(`Missing file: ${relativePath}`);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function writeJson(relativePath, data) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Reshit Smoke Coverage',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Scope',
    '',
    `- Candidate evidence: ${artifact.inputs.candidate_evidence}`,
    `- Target queue: ${artifact.inputs.target_queue}`,
    `- Known nonzero source files: ${artifact.counts.known_nonzero_source_files}`,
    `- Queued source files: ${artifact.counts.queued_source_files}`,
    `- Covered source files: ${artifact.counts.covered_source_files}`,
    `- Uncovered source files: ${artifact.counts.uncovered_source_files}`,
    `- Queued outside known nonzero: ${artifact.counts.queued_outside_known_nonzero_source_files}`,
    `- Suggested gap targets: ${artifact.counts.suggested_gap_targets}`,
    '',
    '## Known Nonzero Counts',
    '',
    `- Supported: ${artifact.status_counts.supported}`,
    `- Candidate: ${artifact.status_counts.candidate}`,
    `- Weak: ${artifact.status_counts.weak}`,
    `- Ambiguous: ${artifact.status_counts.ambiguous}`,
    '',
    '## Uncovered Counts',
    '',
    `- Supported: ${artifact.uncovered_status_counts.supported}`,
    `- Candidate: ${artifact.uncovered_status_counts.candidate}`,
    `- Weak: ${artifact.uncovered_status_counts.weak}`,
    `- Ambiguous: ${artifact.uncovered_status_counts.ambiguous}`,
    '',
    '## Suggested Gap Targets',
    '',
    '| slug | source files | supported | candidate | weak | ambiguous |',
    '|---|---:|---:|---:|---:|---:|',
    ...artifact.suggested_gap_targets.map((target) => `| ${mdCell(target.slug)} | ${target.source_files.length} | ${target.expected_status_counts.supported} | ${target.expected_status_counts.candidate} | ${target.expected_status_counts.weak} | ${target.expected_status_counts.ambiguous} |`),
    '',
    '## Uncovered Source Files',
    '',
    '| source file | work | supported | candidate | weak | ambiguous | best raw |',
    '|---|---|---:|---:|---:|---:|---:|',
    ...artifact.uncovered_sources.slice(0, 80).map((row) => `| ${mdCell(row.source_file)} | ${mdCell(row.work_title)} | ${row.status_counts.supported} | ${row.status_counts.candidate} | ${row.status_counts.weak} | ${row.status_counts.ambiguous} | ${row.best_raw_score} |`),
    '',
    '## Boundary',
    '',
    'This report reads existing reshit candidate evidence and the smoke target queue only. It does not scan broad corpus files, expand prefix families, rank definitions, or choose HUD winners.',
  ];
  const fullPath = path.join(root, relativePath);
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
