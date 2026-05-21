#!/usr/bin/env node
/**
 * Generate a per-work artifact dependency graph for incremental builds.
 *
 * This is intentionally read-only against corpus artifacts and writes only:
 * - data/build/work-artifact-graph.json
 * - reports/incremental-build-readiness-report.md
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const sourceDir = path.join(repoRoot, 'data', 'sources');
const overlayDir = path.join(repoRoot, 'data', 'overlays');
const lexicalDir = path.join(repoRoot, 'data', 'lexical');
const buildDir = path.join(repoRoot, 'data', 'build');
const reportDir = path.join(repoRoot, 'reports');

const warningBytes = 50 * 1024 * 1024;
const nearWarningBytes = 45 * 1024 * 1024;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeText(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, value, 'utf8');
}

function rel(filePath) {
  return path.relative(repoRoot, filePath).replaceAll(path.sep, '/');
}

function hashFile(filePath) {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(filePath));
  return hash.digest('hex');
}

function artifact(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return null;
  const stat = fs.statSync(filePath);
  return {
    path: rel(filePath),
    bytes: stat.size,
    sha256: hashFile(filePath),
  };
}

function listJsonFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((name) => name.endsWith('.json'))
    .map((name) => path.join(dir, name))
    .sort((a, b) => a.localeCompare(b));
}

function findTokenIndexPath(workId) {
  const directPath = path.join(lexicalDir, 'token-indexes', `${workId}.json`);
  if (fs.existsSync(directPath)) return directPath;
  const root = path.join(lexicalDir, 'token-indexes');
  const stack = [root];
  while (stack.length) {
    const current = stack.pop();
    if (!current || !fs.existsSync(current)) continue;
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(entryPath);
      else if (entry.isFile() && entry.name === `${workId}.json`) return entryPath;
    }
  }
  return '';
}

function directorySummary(dir) {
  if (!dir || !fs.existsSync(dir)) return null;
  let files = 0;
  let bytes = 0;
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(entryPath);
      } else if (entry.isFile()) {
        files += 1;
        bytes += fs.statSync(entryPath).size;
      }
    }
  }
  return { path: rel(dir), files, bytes };
}

function classifyLargeArtifacts(node) {
  const large = [];
  for (const [name, value] of Object.entries(node.artifacts)) {
    if (!value) continue;
    if (value.bytes >= nearWarningBytes) {
      large.push({
        artifact: name,
        path: value.path,
        bytes: value.bytes,
        level: value.bytes >= warningBytes ? 'warning' : 'near_warning',
      });
    }
  }
  return large;
}

function invalidatedPhases(artifacts) {
  const missing = [];
  if (!artifacts.source) missing.push('source');
  if (!artifacts.overlay) missing.push('overlay');
  if (!artifacts.occurrence) missing.push('lexical_occurrences');
  if (!artifacts.token_index) missing.push('token_index');
  if (!artifacts.lexical_manifest) missing.push('lexical_payload');
  if (!artifacts.html) missing.push('render');
  return missing;
}

function main() {
  const generatedAt = new Date().toISOString();
  const sourceFiles = listJsonFiles(sourceDir);
  const nodes = [];
  const largeArtifacts = [];
  const globalArtifacts = [
    artifact(path.join(repoRoot, 'overlay-export.csv')),
    artifact(path.join(repoRoot, 'overlay-export.json')),
    artifact(path.join(repoRoot, 'overlay-export.md')),
    artifact(path.join(repoRoot, 'corpus_stats.json')),
    directorySummary(path.join(repoRoot, 'data', 'public-lexical')),
    directorySummary(path.join(repoRoot, 'data', 'search')),
  ].filter(Boolean).map((item) => ({
    ...item,
    level: item.bytes >= warningBytes ? 'warning' : (item.bytes >= nearWarningBytes ? 'near_warning' : 'ok'),
  }));
  let totalUnits = 0;
  let totalSourceBytes = 0;
  let totalHtmlBytes = 0;
  let totalLexicalChunkBytes = 0;

  for (const sourcePath of sourceFiles) {
    const source = readJson(sourcePath);
    const workId = String(source.work_id || path.basename(sourcePath, '.json'));
    const workSlug = String(source.work_slug || '');
    const unitCount = Array.isArray(source.units) ? source.units.length : 0;
    const htmlPath = workSlug ? path.join(repoRoot, workSlug, 'index.html') : '';
    const tokenIndexPath = findTokenIndexPath(workId);
    const lexicalChunkDir = path.join(lexicalDir, `${workId}-chunks`);

    const node = {
      work_id: workId,
      work_title: source.work_title || '',
      work_slug: workSlug,
      work_type: source.work_type || '',
      unit_count: unitCount,
      artifacts: {
        source: artifact(sourcePath),
        overlay: artifact(path.join(overlayDir, `${workId}.json`)),
        occurrence: artifact(path.join(lexicalDir, 'occurrences', `${workId}.json`)),
        token_index: artifact(tokenIndexPath),
        lexical_manifest: artifact(path.join(lexicalDir, `${workId}.manifest.json`)),
        lexical_chunks: directorySummary(lexicalChunkDir),
        html: artifact(htmlPath),
      },
      depends_on: {
        overlay: ['source'],
        lexical_cache: ['source', 'lexical_source_layers'],
        lexical_payload: ['token_index', 'lexical_source_layers'],
        html: ['source', 'overlay', 'occurrence', 'lexical_manifest', 'renderer'],
        public_exports: ['source', 'token_index', 'lexical_manifest'],
      },
      invalidated_phases: [],
      large_artifacts: [],
    };
    node.invalidated_phases = invalidatedPhases(node.artifacts);
    node.large_artifacts = classifyLargeArtifacts(node);
    largeArtifacts.push(...node.large_artifacts.map((item) => ({ ...item, work_id: workId, work_title: node.work_title })));
    nodes.push(node);

    totalUnits += unitCount;
    totalSourceBytes += node.artifacts.source?.bytes || 0;
    totalHtmlBytes += node.artifacts.html?.bytes || 0;
    totalLexicalChunkBytes += node.artifacts.lexical_chunks?.bytes || 0;
  }

  largeArtifacts.sort((a, b) => b.bytes - a.bytes);
  const globalLargeArtifacts = globalArtifacts
    .filter((item) => item.bytes >= nearWarningBytes)
    .map((item) => ({
      work_id: 'sitewide',
      work_title: 'Sitewide artifact',
      artifact: 'global',
      path: item.path,
      bytes: item.bytes,
      level: item.level,
    }));
  largeArtifacts.push(...globalLargeArtifacts);
  largeArtifacts.sort((a, b) => b.bytes - a.bytes);
  nodes.sort((a, b) => a.work_id.localeCompare(b.work_id));

  const graph = {
    schema_version: 1,
    generated_at: generatedAt,
    purpose: 'Per-work artifact dependency graph for incremental static regeneration.',
    totals: {
      works: nodes.length,
      source_units: totalUnits,
      source_bytes: totalSourceBytes,
      html_bytes: totalHtmlBytes,
      lexical_chunk_bytes: totalLexicalChunkBytes,
      global_artifacts: globalArtifacts.length,
      large_artifact_count: largeArtifacts.filter((item) => item.level === 'warning').length,
      near_large_artifact_count: largeArtifacts.length,
    },
    global_artifacts: globalArtifacts,
    cache_strategy: {
      source_changed: ['overlay', 'lexical_cache', 'lexical_payload', 'render', 'reports', 'public_exports'],
      lexical_source_layer_changed: ['lexical_cache', 'lexical_payload', 'reports', 'public_exports'],
      token_index_changed: ['lexical_payload', 'reports', 'public_exports'],
      lexical_manifest_missing: ['lexical_payload'],
      renderer_changed: ['render'],
      export_script_changed: ['public_exports'],
    },
    nodes,
  };

  writeJson(path.join(buildDir, 'work-artifact-graph.json'), graph);

  const report = [
    '# Incremental Build Readiness Report',
    '',
    `Generated: ${generatedAt}`,
    '',
    '## Summary',
    '',
    `- Works: ${nodes.length}`,
    `- Source units: ${totalUnits}`,
    `- Source bytes: ${totalSourceBytes}`,
    `- HTML bytes: ${totalHtmlBytes}`,
    `- Lexical chunk bytes: ${totalLexicalChunkBytes}`,
    `- Global artifacts tracked: ${globalArtifacts.length}`,
    `- Artifacts at/above 50 MB: ${largeArtifacts.filter((item) => item.level === 'warning').length}`,
    `- Artifacts at/above 45 MB: ${largeArtifacts.length}`,
    '',
    '## Large Artifact Risks',
    '',
    '| Work | Artifact | Path | Bytes | Level |',
    '| --- | --- | --- | ---: | --- |',
    ...largeArtifacts.slice(0, 50).map((item) => (
      `| ${item.work_id} | ${item.artifact} | ${item.path} | ${item.bytes} | ${item.level} |`
    )),
    '',
    '## Missing Artifact Phases',
    '',
    '| Work | Missing / Invalidated Phases |',
    '| --- | --- |',
    ...nodes
      .filter((node) => node.invalidated_phases.length)
      .slice(0, 100)
      .map((node) => `| ${node.work_id} | ${node.invalidated_phases.join(', ')} |`),
    '',
    '## Next Infrastructure Moves',
    '',
    '1. Split large source files into source manifests plus source-unit chunks while preserving public URLs.',
    '2. Split large rendered work pages into route shells plus source-unit hydration chunks or route-local section pages with anchor compatibility.',
    '3. Split root overlay exports into per-work/indexed downloads to avoid root files crossing GitHub warning thresholds.',
    '4. Add work-id queue files generated from this graph for source, overlay, lexical payload, render, and public export phases.',
    '5. Add a persistent token/claim DB or deterministic JSONL shards keyed by work/token/claim hashes.',
    '',
  ].join('\n');
  writeText(path.join(reportDir, 'incremental-build-readiness-report.md'), report);

  console.log(JSON.stringify({
    generated_at: generatedAt,
    works: nodes.length,
    source_units: totalUnits,
    large_artifact_count: largeArtifacts.filter((item) => item.level === 'warning').length,
    near_large_artifact_count: largeArtifacts.length,
    graph: 'data/build/work-artifact-graph.json',
    report: 'reports/incremental-build-readiness-report.md',
  }, null, 2));
}

main();
