#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  evidenceDir: '.local-cache/workbench-evidence/handoff,data/workbench-evidence',
  output: '.local-cache/workbench-evidence/handoff-index.json',
  report: 'reports/workbench-handoff-index.md',
  targetQueue: null,
  includeSmoke: false,
  onlySmoke: false,
  dedupe: null,
};

const options = parseArgs(process.argv.slice(2));
if (options.dedupe === null) options.dedupe = !(options.onlySmoke || options.targetQueue);
const evidenceDirs = splitPathList(options.evidenceDir);
const allowedSlugs = options.targetQueue ? loadTargetQueueSlugs(options.targetQueue) : null;
const rawManifests = evidenceDirs
  .flatMap((evidenceDir) => collectHandoffManifests(evidenceDir))
  .filter((manifest) => !allowedSlugs || allowedSlugs.has(manifest.slug));
const manifests = (options.dedupe ? dedupeManifests(rawManifests) : rawManifests)
  .sort((a, b) => String(a.focus?.token_normalized || '').localeCompare(String(b.focus?.token_normalized || '')) || a.manifest_path.localeCompare(b.manifest_path));
const generatedAt = new Date().toISOString();

const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_handoff_index',
  generated_at: generatedAt,
  generator: 'scripts/build_workbench_handoff_index.mjs',
  policy: 'Discovery index for completed Agent 3 occurrence/candidate handoff streams. This is not a ranking artifact.',
  evidence_dirs: evidenceDirs,
  options: {
    target_queue: options.targetQueue,
    include_smoke: options.includeSmoke,
    only_smoke: options.onlySmoke,
    dedupe: options.dedupe,
  },
  counts: {
    manifests: manifests.length,
    occurrence_markers: sum(manifests, (row) => row.counts.occurrence_markers),
    candidate_rows: sum(manifests, (row) => row.counts.candidate_rows),
    clusters: sum(manifests, (row) => row.counts.clusters),
    blocked_rows: sum(manifests, (row) => row.counts.blocked_rows),
  },
  manifests,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--evidence-dir=')) parsed.evidenceDir = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--target-queue=')) parsed.targetQueue = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg === '--include-smoke') parsed.includeSmoke = true;
    else if (arg === '--only-smoke') {
      parsed.onlySmoke = true;
      parsed.includeSmoke = true;
    }
    else if (arg === '--dedupe') parsed.dedupe = true;
    else if (arg === '--no-dedupe') parsed.dedupe = false;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function collectHandoffManifests(evidenceDir) {
  const base = path.join(root, evidenceDir);
  if (!fs.existsSync(base)) return [];
  return fs.readdirSync(base, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => (options.onlySmoke ? /smoke/i.test(entry.name) : (options.includeSmoke || !/smoke/i.test(entry.name))))
    .map((entry) => ({
      slug: entry.name,
      relativePath: `${evidenceDir}/${entry.name}/manifest.json`,
    }))
    .filter((row) => fs.existsSync(path.join(root, row.relativePath)))
    .map((row) => {
      const { relativePath } = row;
      const manifest = readJson(relativePath);
      if (manifest.artifact_type !== 'workbench_usage_handoff_manifest') return null;
      return {
        slug: row.slug,
        manifest_path: relativePath,
        generated_at: manifest.generated_at,
        focus: manifest.focus,
        paths: manifest.paths,
        counts: manifest.counts,
        source_artifacts: manifest.source_artifacts,
      };
    })
    .filter(Boolean)
    .sort((a, b) => String(a.focus?.token_normalized || '').localeCompare(String(b.focus?.token_normalized || '')));
}

function dedupeManifests(manifests) {
  const byTokenKey = new Map();
  for (const manifest of manifests) {
    const tokenKey = manifest.focus?.token_key || manifest.focus?.token_normalized || manifest.manifest_path;
    const existing = byTokenKey.get(tokenKey);
    if (!existing || preferManifest(manifest, existing)) byTokenKey.set(tokenKey, manifest);
  }
  return Array.from(byTokenKey.values())
    .sort((a, b) => String(a.focus?.token_normalized || '').localeCompare(String(b.focus?.token_normalized || '')));
}

function preferManifest(candidate, existing) {
  const candidateLocal = candidate.manifest_path.startsWith('.local-cache/');
  const existingLocal = existing.manifest_path.startsWith('.local-cache/');
  if (candidateLocal !== existingLocal) return candidateLocal;
  return String(candidate.generated_at || '') > String(existing.generated_at || '');
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function loadTargetQueueSlugs(relativePath) {
  const queue = readJson(relativePath);
  if (queue.artifact_type !== 'workbench_target_queue') throw new Error(`${relativePath} is not a workbench target queue`);
  return new Set((Array.isArray(queue.targets) ? queue.targets : [])
    .map((target) => target.slug || target.slug_override)
    .filter(Boolean));
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function splitPathList(value) {
  return String(value || '').split(',').map((part) => cleanRelativePath(part.trim())).filter(Boolean);
}

function sum(rows, getValue) {
  return rows.reduce((total, row) => total + Number(getValue(row) || 0), 0);
}

function writeJson(relativePath, data) {
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Handoff Index',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Scope',
    '',
    `- Manifests: ${artifact.counts.manifests}`,
    `- Occurrence markers: ${artifact.counts.occurrence_markers}`,
    `- Candidate rows: ${artifact.counts.candidate_rows}`,
    `- Clusters: ${artifact.counts.clusters}`,
    `- Blocked rows: ${artifact.counts.blocked_rows}`,
    `- Target queue: ${artifact.options.target_queue || 'none'}`,
    `- Include smoke: ${artifact.options.include_smoke ? 'yes' : 'no'}`,
    `- Only smoke: ${artifact.options.only_smoke ? 'yes' : 'no'}`,
    `- Dedupe: ${artifact.options.dedupe ? 'yes' : 'no'}`,
    '',
    '## Manifests',
    '',
    ...artifact.manifests.map((row) => (
      `- ${row.focus.token_normalized}: ${row.counts.occurrence_markers} occurrence(s), ${row.counts.candidate_rows} candidate row(s), ${row.counts.clusters} cluster(s), ${row.manifest_path}`
    )),
    '',
    '## Boundary',
    '',
    'This index exposes completed stream artifacts. It does not choose final definitions or HUD winners.',
    '',
  ];
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`, 'utf8');
}
