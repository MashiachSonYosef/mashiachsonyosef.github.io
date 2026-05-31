#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  graph: '.local-cache/workbench-evidence/full/reshit-occurrence-graph.json',
  candidates: '.local-cache/workbench-evidence/full/reshit-candidate-evidence.json',
  sourceDir: 'data/sources',
  output: '.local-cache/workbench-evidence/source-freshness.json',
  report: 'reports/workbench-source-freshness.md',
  maxRows: 80,
  failOnStale: false,
};

const options = parseArgs(process.argv.slice(2));
const graph = readJson(options.graph);
const candidates = fs.existsSync(path.join(root, options.candidates)) ? readJson(options.candidates) : null;
const sourceFiles = collectSourceFileStats(options.sourceDir);
const artifactGeneratedAt = new Date(graph.generated_at || 0);
if (Number.isNaN(artifactGeneratedAt.getTime())) throw new Error(`${options.graph} has invalid generated_at`);

const scannedCount = Number(graph.inputs?.source_files_scanned || 0);
const countDelta = sourceFiles.length - scannedCount;
const filesModifiedAfterArtifact = sourceFiles.filter((row) => row.modified_at_ms > artifactGeneratedAt.getTime());
const filesCreatedAfterArtifact = sourceFiles.filter((row) => row.created_at_ms > artifactGeneratedAt.getTime());
const status = countDelta > 0 || filesModifiedAfterArtifact.length > 0 ? 'stale' : 'current';

const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_source_freshness_report',
  generated_at: new Date().toISOString(),
  generator: 'scripts/report_workbench_source_freshness.mjs',
  policy: 'Inventory-only freshness check. It stats source files but does not read source text, scan Hebrew tokens, generate evidence, rank definitions, or choose HUD winners.',
  inputs: {
    graph: options.graph,
    candidates: options.candidates,
    source_dir: options.sourceDir,
  },
  focus: graph.focus || candidates?.focus || null,
  artifact_snapshot: {
    generated_at: graph.generated_at,
    source_files_scanned: scannedCount,
    occurrence_markers: graph.counts?.occurrence_markers ?? null,
    candidate_rows: candidates?.counts?.candidate_rows ?? null,
    supported: candidates?.counts?.supported ?? null,
    candidate: candidates?.counts?.candidate ?? null,
    weak: candidates?.counts?.weak ?? null,
    ambiguous: candidates?.counts?.ambiguous ?? null,
  },
  current_inventory: {
    source_files: sourceFiles.length,
    count_delta_vs_artifact_scan: countDelta,
    files_modified_after_artifact: filesModifiedAfterArtifact.length,
    files_created_after_artifact: filesCreatedAfterArtifact.length,
    newest_source_mtime: sourceFiles[0]?.modified_at || null,
  },
  status,
  pending_refresh_files: filesModifiedAfterArtifact
    .sort((a, b) => b.modified_at_ms - a.modified_at_ms || a.source_file.localeCompare(b.source_file))
    .map(({ modified_at_ms, created_at_ms, ...row }) => row),
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Source freshness ${status}; current ${sourceFiles.length}; scanned ${scannedCount}; modified after artifact ${filesModifiedAfterArtifact.length}; created after artifact ${filesCreatedAfterArtifact.length}`);

if (options.failOnStale && status === 'stale') process.exitCode = 2;

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--graph=')) parsed.graph = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--candidates=')) parsed.candidates = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--source-dir=')) parsed.sourceDir = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--max-rows=')) parsed.maxRows = Number(valueAfterEquals(arg));
    else if (arg === '--fail-on-stale') parsed.failOnStale = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!Number.isInteger(parsed.maxRows) || parsed.maxRows < 0) throw new Error('--max-rows must be a non-negative integer');
  return parsed;
}

function collectSourceFileStats(relativeDir) {
  const base = path.join(root, relativeDir);
  if (!fs.existsSync(base)) throw new Error(`Missing source directory: ${relativeDir}`);
  const rows = [];
  for (const entry of fs.readdirSync(base, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) continue;
    const relativePath = cleanRelativePath(path.join(relativeDir, entry.name));
    const stat = fs.statSync(path.join(root, relativePath));
    rows.push({
      source_file: relativePath,
      modified_at: stat.mtime.toISOString(),
      created_at: stat.birthtime.toISOString(),
      modified_at_ms: stat.mtimeMs,
      created_at_ms: stat.birthtimeMs,
      bytes: stat.size,
    });
  }
  return rows.sort((a, b) => b.modified_at_ms - a.modified_at_ms || a.source_file.localeCompare(b.source_file));
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
    '# Workbench Source Freshness',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Status: ${artifact.status}`,
    `- Focus: ${artifact.focus?.token_normalized || 'unknown'}`,
    `- Artifact generated: ${artifact.artifact_snapshot.generated_at}`,
    `- Artifact source files scanned: ${artifact.artifact_snapshot.source_files_scanned}`,
    `- Current source files: ${artifact.current_inventory.source_files}`,
    `- Count delta: ${artifact.current_inventory.count_delta_vs_artifact_scan}`,
    `- Files modified after artifact: ${artifact.current_inventory.files_modified_after_artifact}`,
    `- Files created after artifact: ${artifact.current_inventory.files_created_after_artifact}`,
    `- Existing candidate rows: ${artifact.artifact_snapshot.candidate_rows}`,
    `- Existing useful counts: supported ${artifact.artifact_snapshot.supported}, candidate ${artifact.artifact_snapshot.candidate}, weak ${artifact.artifact_snapshot.weak}, ambiguous ${artifact.artifact_snapshot.ambiguous}`,
    '',
    '## Pending Refresh Files',
    '',
    '| source file | modified | created | bytes |',
    '|---|---|---|---:|',
    ...artifact.pending_refresh_files.slice(0, options.maxRows).map((row) => `| ${mdCell(row.source_file)} | ${row.modified_at} | ${row.created_at} | ${row.bytes} |`),
    '',
    '## Boundary',
    '',
    'This is a freshness report only. It does not open source JSON content, scan for tokens, produce evidence rows, infer absence or presence of the focus word, or choose HUD answers.',
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
