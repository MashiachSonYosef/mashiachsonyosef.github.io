#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const defaults = {
  targetQueue: '.local-cache/workbench-evidence/smoke-target-queue.json',
  outputDir: '.local-cache/workbench-evidence/full',
  reportDir: 'reports',
  handoffRoot: '.local-cache/workbench-evidence/handoff',
  batchDir: '.local-cache/workbench-evidence/batch-runs',
  handoffIndex: '.local-cache/workbench-evidence/handoff-index.json',
  limit: 1,
  startIndex: 0,
  maxOccurrences: 25000,
  minPriority: 0,
  skipExisting: true,
  skipIndexed: false,
  smokeOnly: true,
  maxSourceFiles: 5,
  requireNonzeroSupport: true,
  exportHandoff: true,
  validate: true,
  includePrefixFamily: false,
  prefixFamilyMinFocusLength: 4,
  includeAmbiguousCandidates: true,
  failFast: true,
};

const options = parseArgs(process.argv.slice(2));
const queue = readJson(options.targetQueue);
if (queue.artifact_type !== 'workbench_target_queue') {
  throw new Error(`${options.targetQueue} is not a workbench target queue`);
}

const generatedAt = new Date().toISOString();
const runId = `usage-batch-${generatedAt.replace(/[:.]/g, '-')}`;
const run = {
  schema_version: 1,
  artifact_type: 'workbench_usage_batch_run',
  generated_at: generatedAt,
  generator: 'scripts/build_workbench_usage_batch.mjs',
  policy: 'Batch runner for graph-first corpus marking. It builds and validates artifacts only; it does not rank definitions or choose HUD answers.',
  inputs: {
    target_queue: options.targetQueue,
    output_dir: options.outputDir,
    handoff_root: options.handoffRoot,
    handoff_index: options.handoffIndex,
    start_index: options.startIndex,
    limit: options.limit,
    max_occurrences: options.maxOccurrences,
    min_priority: options.minPriority,
    skip_existing: options.skipExisting,
    skip_indexed: options.skipIndexed,
    smoke_only: options.smokeOnly,
    max_source_files: options.maxSourceFiles,
    require_nonzero_support: options.requireNonzeroSupport,
    include_prefix_family: options.includePrefixFamily,
    prefix_family_min_focus_length: options.prefixFamilyMinFocusLength,
    include_ambiguous_candidates: options.includeAmbiguousCandidates,
    fail_fast: options.failFast,
  },
  processed: [],
  skipped: [],
  failed: [],
};

const indexedTokenKeys = options.skipIndexed ? loadIndexedTokenKeys(options.handoffIndex) : new Set();
let attempts = 0;
for (const [index, target] of queue.targets.entries()) {
  if (index < options.startIndex) continue;
  if (attempts >= options.limit) break;
  if (!target?.token_normalized) continue;
  if (options.smokeOnly && !isSmokeTarget(target)) {
    run.skipped.push(skipRecord(index, target, 'non_smoke_target'));
    continue;
  }
  if (Number(target.priority_score || 0) < options.minPriority) {
    run.skipped.push(skipRecord(index, target, 'below_min_priority'));
    continue;
  }
  if (Number(target.occurrence_count || 0) > options.maxOccurrences) {
    run.skipped.push(skipRecord(index, target, 'above_max_occurrences'));
    continue;
  }

  const slug = cleanSlug(target.slug || target.slug_override || slugForFocus(target.token_normalized));
  const graphPath = `${options.outputDir}/${slug}-occurrence-graph.json`;
  const candidatesPath = `${options.outputDir}/${slug}-candidate-evidence.json`;
  const handoffDir = `${options.handoffRoot}/${slug}`;
  const manifestPath = `${handoffDir}/manifest.json`;
  const sourceFiles = validateTargetSourceFiles(target);
  const prefixFamilyEnabled = options.includePrefixFamily
    && target.allow_prefix_family === true
    && target.token_normalized.length >= options.prefixFamilyMinFocusLength;

  if (options.skipIndexed && indexedTokenKeys.has(target.token_key)) {
    run.skipped.push({
      ...skipRecord(index, target, 'existing_handoff_index_entry'),
      slug,
    });
    continue;
  }

  if (options.skipExisting && fs.existsSync(path.join(root, manifestPath))) {
    run.skipped.push({
      ...skipRecord(index, target, 'existing_handoff_manifest'),
      slug,
      manifest_path: manifestPath,
    });
    continue;
  }

  attempts += 1;
  const record = {
    target_index: index,
    token_key: target.token_key,
    token_normalized: target.token_normalized,
    target_reason: target.target_reason,
    priority_score: target.priority_score,
    occurrence_count: target.occurrence_count,
    work_count: target.work_count,
    prefix_family_enabled: prefixFamilyEnabled,
    source_files: sourceFiles,
    slug,
    graph_path: graphPath,
    candidates_path: candidatesPath,
    handoff_manifest_path: manifestPath,
  };

  try {
    const graphArgs = [
      'scripts/build_workbench_usage_graph.mjs',
      `--focus-normalized=${target.token_normalized}`,
      `--slug=${slug}`,
      `--output-dir=${options.outputDir}`,
      `--max-source-files=${options.maxSourceFiles}`,
    ];
    for (const sourceFile of sourceFiles) graphArgs.push(`--source-file=${sourceFile}`);
    if (options.reportDir) graphArgs.push(`--report-dir=${options.reportDir}`);
    if (prefixFamilyEnabled) graphArgs.push('--include-prefix-family');
    if (!options.includeAmbiguousCandidates) graphArgs.push('--no-ambiguous-candidates');
    runNode(graphArgs);

    if (options.validate) {
      runNode(['scripts/validate_workbench_usage_graph.mjs', graphPath, candidatesPath]);
    }
    const candidateArtifact = readJson(candidatesPath);
    const candidateStatusCounts = candidateArtifact.counts || {};
    if (options.requireNonzeroSupport && !hasNonzeroSupport(candidateStatusCounts)) {
      throw new Error(`zero_non_ambiguous_candidate_counts: supported=${candidateStatusCounts.supported || 0}, candidate=${candidateStatusCounts.candidate || 0}, weak=${candidateStatusCounts.weak || 0}, ambiguous=${candidateStatusCounts.ambiguous || 0}`);
    }
    if (options.exportHandoff) {
      runNode(['scripts/export_workbench_usage_handoff.mjs', graphPath, candidatesPath, handoffDir]);
      if (options.validate) runNode(['scripts/validate_workbench_usage_handoff.mjs', manifestPath]);
    }

    const outputManifest = fs.existsSync(path.join(root, manifestPath)) ? readJson(manifestPath) : null;
    run.processed.push({
      ...record,
      status: 'completed',
      output_counts: outputManifest?.counts || null,
      candidate_status_counts: candidateStatusCounts,
      prefix_family_expansion: outputManifest?.counts && Number(target.occurrence_count || 0) > 0
        ? Number(outputManifest.counts.occurrence_markers || 0) - Number(target.occurrence_count || 0)
        : null,
    });
  } catch (error) {
    run.failed.push({
      ...record,
      status: 'failed',
      error: error.message,
    });
    if (options.failFast) break;
  }
  writeRunArtifacts(runId, run);
}

writeRunArtifacts(runId, run);
console.log(`Workbench usage batch complete. Processed: ${run.processed.length}. Skipped: ${run.skipped.length}. Failed: ${run.failed.length}.`);
console.log(`Wrote ${options.batchDir}/${runId}.json`);
console.log(`Wrote ${options.reportDir}/${runId}.md`);

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg === '--no-skip-existing') parsed.skipExisting = false;
    else if (arg === '--skip-indexed') parsed.skipIndexed = true;
    else if (arg === '--no-skip-indexed') parsed.skipIndexed = false;
    else if (arg === '--allow-non-smoke') parsed.smokeOnly = false;
    else if (arg === '--allow-zero-support') parsed.requireNonzeroSupport = false;
    else if (arg === '--no-export-handoff') parsed.exportHandoff = false;
    else if (arg === '--no-validate') parsed.validate = false;
    else if (arg === '--include-prefix-family') parsed.includePrefixFamily = true;
    else if (arg === '--no-prefix-family') parsed.includePrefixFamily = false;
    else if (arg === '--no-ambiguous-candidates') parsed.includeAmbiguousCandidates = false;
    else if (arg === '--fail-fast') parsed.failFast = true;
    else if (arg === '--no-fail-fast') parsed.failFast = false;
    else if (arg.startsWith('--target-queue=')) parsed.targetQueue = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--output-dir=')) parsed.outputDir = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--report-dir=')) parsed.reportDir = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--handoff-root=')) parsed.handoffRoot = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--handoff-index=')) parsed.handoffIndex = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--batch-dir=')) parsed.batchDir = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--limit=')) parsed.limit = Number(arg.split('=')[1]);
    else if (arg.startsWith('--start-index=')) parsed.startIndex = Number(arg.split('=')[1]);
    else if (arg.startsWith('--max-occurrences=')) parsed.maxOccurrences = Number(arg.split('=')[1]);
    else if (arg.startsWith('--min-priority=')) parsed.minPriority = Number(arg.split('=')[1]);
    else if (arg.startsWith('--prefix-family-min-focus-length=')) parsed.prefixFamilyMinFocusLength = Number(arg.split('=')[1]);
    else if (arg.startsWith('--max-source-files=')) parsed.maxSourceFiles = Number(arg.split('=')[1]);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  for (const key of ['limit', 'startIndex', 'maxOccurrences', 'minPriority', 'prefixFamilyMinFocusLength', 'maxSourceFiles']) {
    if (!Number.isInteger(parsed[key]) || parsed[key] < 0) {
      throw new Error(`--${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)} must be a non-negative integer`);
    }
  }
  return parsed;
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function cleanSlug(value) {
  const slug = String(value || '').replace(/[^a-zA-Z0-9._-]/g, '-').replace(/^-+|-+$/g, '');
  if (!slug) throw new Error('Target slug resolved to an empty value.');
  return slug;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function runNode(args) {
  execFileSync(process.execPath, args, {
    cwd: root,
    stdio: 'inherit',
  });
}

function isSmokeTarget(target) {
  return target.target_reason === 'seeded_frame_available'
    || target.target_kind === 'seeded_nonzero_support_smoke'
    || target.known_nonzero_support === true;
}

function validateTargetSourceFiles(target) {
  const sourceFiles = (Array.isArray(target.source_files) ? target.source_files : []).map(cleanRelativePath).filter(Boolean);
  if (!sourceFiles.length) throw new Error(`Smoke target ${target.token_normalized} must provide 1-${options.maxSourceFiles} source_files.`);
  if (sourceFiles.length > options.maxSourceFiles) {
    throw new Error(`Smoke target ${target.token_normalized} has ${sourceFiles.length} source_files; max is ${options.maxSourceFiles}.`);
  }
  for (const sourceFile of sourceFiles) {
    if (!sourceFile.startsWith('data/sources/') || !sourceFile.endsWith('.json')) {
      throw new Error(`Invalid smoke source file for ${target.token_normalized}: ${sourceFile}`);
    }
    if (!fs.existsSync(path.join(root, sourceFile))) {
      throw new Error(`Missing smoke source file for ${target.token_normalized}: ${sourceFile}`);
    }
  }
  return sourceFiles;
}

function hasNonzeroSupport(counts) {
  return Number(counts.supported || 0) + Number(counts.candidate || 0) + Number(counts.weak || 0) > 0;
}

function loadIndexedTokenKeys(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) return new Set();
  const index = readJson(relativePath);
  return new Set((Array.isArray(index.manifests) ? index.manifests : [])
    .map((row) => row.focus?.token_key)
    .filter(Boolean));
}

function slugForFocus(normalized) {
  if (normalized === '\u05e8\u05d0\u05e9\u05d9\u05ea') return 'reshit';
  return stableId('focus', normalized).replace(/^focus-/, '');
}

function stableId(prefix, payload) {
  return `${prefix}-${crypto.createHash('sha1').update(JSON.stringify(payload)).digest('hex').slice(0, 16)}`;
}

function skipRecord(index, target, reason) {
  return {
    target_index: index,
    token_key: target.token_key,
    token_normalized: target.token_normalized,
    target_reason: target.target_reason,
    priority_score: target.priority_score,
    occurrence_count: target.occurrence_count,
    work_count: target.work_count,
    reason,
  };
}

function writeRunArtifacts(runId, run) {
  const jsonPath = `${options.batchDir}/${runId}.json`;
  const reportPath = `${options.reportDir}/${runId}.md`;
  fs.mkdirSync(path.dirname(path.join(root, jsonPath)), { recursive: true });
  fs.mkdirSync(path.dirname(path.join(root, reportPath)), { recursive: true });
  fs.writeFileSync(path.join(root, jsonPath), `${JSON.stringify(run, null, 2)}\n`, 'utf8');
  fs.writeFileSync(path.join(root, reportPath), `${renderReport(run)}\n`, 'utf8');
}

function renderReport(run) {
  return [
    '# Workbench Usage Batch Run',
    '',
    `Generated: ${run.generated_at}`,
    '',
    '## Scope',
    '',
    `- Processed: ${run.processed.length}`,
    `- Skipped: ${run.skipped.length}`,
    `- Failed: ${run.failed.length}`,
    `- Fail fast: ${run.inputs.fail_fast ? 'yes' : 'no'}`,
    '',
    '## Processed',
    '',
    ...run.processed.map((row) => `- ${row.token_normalized}: ${row.slug}, supported ${row.candidate_status_counts?.supported ?? 'n/a'}, candidate ${row.candidate_status_counts?.candidate ?? 'n/a'}, weak ${row.candidate_status_counts?.weak ?? 'n/a'}, ambiguous ${row.candidate_status_counts?.ambiguous ?? 'n/a'}, source files ${row.source_files.length}, prefix family ${row.prefix_family_enabled ? 'on' : 'off'}`),
    '',
    '## Failed',
    '',
    ...run.failed.map((row) => `- ${row.token_normalized}: ${row.error}`),
    '',
    '## Boundary',
    '',
    'Default mode is seeded/known nonzero smoke only. Every processed target must report supported/candidate/weak/ambiguous counts.',
    '',
    'This run builds source-backed occurrence/candidate artifacts only. It does not select visible HUD answers.',
    '',
  ].join('\n');
}
