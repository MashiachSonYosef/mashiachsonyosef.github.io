#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input: '.local-cache/workbench-evidence/full/reshit-candidate-evidence.json',
  output: '.local-cache/workbench-evidence/smoke-target-queue.json',
  report: 'reports/workbench-target-queue-smoke.md',
  focusNormalized: '\u05e8\u05d0\u05e9\u05d9\u05ea',
  slugPrefix: 'reshit-smoke',
  chunkSize: 5,
  maxTargets: 24,
  minNonAmbiguous: 1,
  includeSeededTarget: true,
  excludeSeedSourceFiles: true,
};

const seededTarget = {
  token_key: 'he:\u05e8\u05d0\u05e9\u05d9\u05ea',
  token_normalized: '\u05e8\u05d0\u05e9\u05d9\u05ea',
  slug: 'reshit-smoke-seeded',
  target_reason: 'seeded_frame_available',
  target_kind: 'seeded_nonzero_support_smoke',
  known_nonzero_support: true,
  priority_score: 1000,
  occurrence_count: 0,
  work_count: 5,
  allow_prefix_family: false,
  source_files: [
    'data/sources/jeremiah.json',
    'data/sources/deuteronomy.json',
    'data/sources/exodus.json',
    'data/sources/leviticus.json',
    'data/sources/numbers.json',
  ],
  expected_status_counts: {
    supported: 1,
    candidate: 3,
    weak: 2,
    ambiguous: 5,
    non_ambiguous: 6,
  },
  notes: 'Seeded \u05e8\u05d0\u05e9\u05d9\u05ea smoke lane. Source files are limited to Jeremiah plus Torah books with expected nonzero seeded frame support.',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const focus = String(options.focusNormalized || artifact.focus?.token_normalized || seededTarget.token_normalized);
const tokenKey = String(artifact.focus?.token_key || `he:${focus}`);
const seedSources = new Set(options.excludeSeedSourceFiles ? seededTarget.source_files : []);
const sourceSummaries = collectSourceSummaries(artifact, { focus, seedSources });
const selectedSources = sourceSummaries
  .filter((row) => row.status_counts.non_ambiguous >= options.minNonAmbiguous)
  .slice(0, Math.max(0, options.maxTargets * options.chunkSize));
const generatedTargets = chunk(selectedSources, options.chunkSize).slice(0, options.maxTargets).map((rows, index) => makeTarget(rows, index + 1, { focus, tokenKey }));
const targets = options.includeSeededTarget ? [seededTarget, ...generatedTargets] : generatedTargets;

const output = {
  schema_version: 1,
  artifact_type: 'workbench_target_queue',
  generated_at: new Date().toISOString(),
  generator: 'scripts/select_workbench_smoke_targets.mjs',
  policy: 'Seeded/known nonzero-support smoke queue only. Each generated target is derived from exact normalized non-ambiguous rows already observed in a validated candidate artifact.',
  inputs: {
    candidate_evidence: options.input,
    focus_normalized: focus,
    match_basis: 'normalized_exact',
    status_filter: ['supported', 'candidate', 'weak'],
    chunk_size: options.chunkSize,
    max_targets: options.maxTargets,
    min_non_ambiguous_per_source: options.minNonAmbiguous,
    include_seeded_target: options.includeSeededTarget,
    exclude_seed_source_files: options.excludeSeedSourceFiles,
  },
  counts: {
    candidate_source_files: sourceSummaries.length,
    emitted_source_files: generatedTargets.reduce((sum, target) => sum + target.source_files.length, 0),
    candidate_targets: targets.length,
    emitted_targets: targets.length,
    seeded_targets: options.includeSeededTarget ? 1 : 0,
    known_nonzero_targets: generatedTargets.length,
    route_linked_targets: 0,
  },
  targets,
};

writeJson(options.output, output);
writeReport(options.report, output, sourceSummaries, generatedTargets);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--input=')) parsed.input = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--focus-normalized=')) parsed.focusNormalized = arg.split('=').slice(1).join('=');
    else if (arg.startsWith('--slug-prefix=')) parsed.slugPrefix = cleanSlug(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--chunk-size=')) parsed.chunkSize = Number(arg.split('=')[1]);
    else if (arg.startsWith('--max-targets=')) parsed.maxTargets = Number(arg.split('=')[1]);
    else if (arg.startsWith('--min-non-ambiguous=')) parsed.minNonAmbiguous = Number(arg.split('=')[1]);
    else if (arg === '--no-seeded-target') parsed.includeSeededTarget = false;
    else if (arg === '--include-seed-source-files') parsed.excludeSeedSourceFiles = false;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  for (const key of ['chunkSize', 'maxTargets', 'minNonAmbiguous']) {
    if (!Number.isInteger(parsed[key]) || parsed[key] < 1) {
      throw new Error(`--${key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)} must be a positive integer`);
    }
  }
  if (parsed.chunkSize > 5) throw new Error('--chunk-size must be 1-5 for smoke targets');
  return parsed;
}

function collectSourceSummaries(artifact, { focus, seedSources }) {
  const bySourceFile = new Map();
  const rows = Array.isArray(artifact.candidate_rows) ? artifact.candidate_rows : [];
  for (const row of rows) {
    if (String(row.focus_normalized || '') !== focus) continue;
    if (!['supported', 'candidate', 'weak'].includes(row.candidate_status)) continue;
    if (!isExactNormalizedMatch(row, focus)) continue;
    const workId = String(row.work_id || '').trim();
    if (!workId) continue;
    const sourceFile = `data/sources/${workId}.json`;
    if (seedSources.has(sourceFile)) continue;
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
    summary.status_counts[row.candidate_status] += 1;
    summary.status_counts.non_ambiguous += 1;
    summary.best_raw_score = Math.max(summary.best_raw_score, Number(row.raw_score || 0));
    if (row.cluster_id) summary.cluster_ids.add(row.cluster_id);
    if (row.source_ref && summary.sample_refs.length < 5) summary.sample_refs.push(row.source_ref);
    bySourceFile.set(sourceFile, summary);
  }
  return [...bySourceFile.values()]
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

function isExactNormalizedMatch(row, focus) {
  if (row.score_components?.match_basis === 'normalized_exact') return true;
  return String(row.token_normalized || '') === focus && String(row.focus_normalized || '') === focus;
}

function makeTarget(rows, ordinal, { focus, tokenKey }) {
  const counts = sumCounts(rows);
  const slug = `${options.slugPrefix}-${String(ordinal).padStart(3, '0')}`;
  return {
    token_key: tokenKey,
    token_normalized: focus,
    slug,
    target_reason: 'known_nonzero_support_smoke',
    target_kind: 'known_nonzero_support_smoke',
    known_nonzero_support: true,
    priority_score: 900 - ordinal,
    occurrence_count: counts.non_ambiguous,
    work_count: rows.length,
    allow_prefix_family: false,
    source_files: rows.map((row) => row.source_file),
    expected_status_counts: counts,
    source_file_summaries: rows.map((row) => ({
      source_file: row.source_file,
      work_id: row.work_id,
      work_title: row.work_title,
      status_counts: row.status_counts,
      best_raw_score: row.best_raw_score,
      cluster_ids: row.cluster_ids,
      sample_refs: row.sample_refs,
    })),
    notes: 'Generated smoke target from exact normalized \u05e8\u05d0\u05e9\u05d9\u05ea rows with known nonzero supported/candidate/weak evidence. Prefix-family expansion is intentionally disabled.',
  };
}

function sumCounts(rows) {
  return rows.reduce((sum, row) => ({
    supported: sum.supported + row.status_counts.supported,
    candidate: sum.candidate + row.status_counts.candidate,
    weak: sum.weak + row.status_counts.weak,
    ambiguous: sum.ambiguous + row.status_counts.ambiguous,
    non_ambiguous: sum.non_ambiguous + row.status_counts.non_ambiguous,
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

function writeReport(relativePath, artifact, sourceSummaries, generatedTargets) {
  const lines = [
    '# Workbench Smoke Target Queue',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Scope',
    '',
    `- Candidate source files: ${artifact.counts.candidate_source_files}`,
    `- Emitted source files: ${artifact.counts.emitted_source_files}`,
    `- Emitted targets: ${artifact.counts.emitted_targets}`,
    `- Seeded targets: ${artifact.counts.seeded_targets}`,
    `- Known nonzero targets: ${artifact.counts.known_nonzero_targets}`,
    `- Chunk size: ${artifact.inputs.chunk_size}`,
    `- Prefix family: off`,
    '',
    '## Generated Targets',
    '',
    ...generatedTargets.map((target) => `- ${target.slug}: supported ${target.expected_status_counts.supported}, candidate ${target.expected_status_counts.candidate}, weak ${target.expected_status_counts.weak}, ambiguous ${target.expected_status_counts.ambiguous}, source files ${target.source_files.length}`),
    '',
    '## Top Source Files',
    '',
    ...sourceSummaries.slice(0, 40).map((row) => `- ${row.source_file}: supported ${row.status_counts.supported}, candidate ${row.status_counts.candidate}, weak ${row.status_counts.weak}, best raw ${row.best_raw_score}`),
    '',
    '## Boundary',
    '',
    'This queue is smoke-only. Every generated target is derived from observed nonzero exact-match candidate rows and remains graph/candidate evidence, not a definition verdict.',
    '',
  ];
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${lines.join('\n')}\n`, 'utf8');
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function cleanSlug(value) {
  const slug = String(value || '').replace(/[^a-zA-Z0-9._-]/g, '-').replace(/^-+|-+$/g, '');
  if (!slug) throw new Error('Slug prefix resolved to an empty value');
  return slug;
}
