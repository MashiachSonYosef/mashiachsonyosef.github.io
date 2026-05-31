#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  evidenceDir: '.local-cache/workbench-evidence/handoff',
  output: '.local-cache/workbench-evidence/handoff-index.json',
  report: 'reports/workbench-handoff-index.md',
};

const options = parseArgs(process.argv.slice(2));
const manifests = collectHandoffManifests(options.evidenceDir);
const generatedAt = new Date().toISOString();

const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_handoff_index',
  generated_at: generatedAt,
  generator: 'scripts/build_workbench_handoff_index.mjs',
  policy: 'Discovery index for completed Agent 3 occurrence/candidate handoff streams. This is not a ranking artifact.',
  evidence_dir: options.evidenceDir,
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
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function collectHandoffManifests(evidenceDir) {
  const base = path.join(root, evidenceDir);
  if (!fs.existsSync(base)) return [];
  return fs.readdirSync(base, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => `${evidenceDir}/${entry.name}/manifest.json`)
    .filter((relativePath) => fs.existsSync(path.join(root, relativePath)))
    .map((relativePath) => {
      const manifest = readJson(relativePath);
      if (manifest.artifact_type !== 'workbench_usage_handoff_manifest') return null;
      return {
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

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
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
