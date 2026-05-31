#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const graphPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/full/reshit-occurrence-graph.json');
const candidatesPath = cleanRelativePath(process.argv[3] || '.local-cache/workbench-evidence/full/reshit-candidate-evidence.json');
const outputDir = cleanRelativePath(process.argv[4] || inferOutputDir(graphPath));
const generatedAt = new Date().toISOString();

const graph = readJson(graphPath);
const candidates = readJson(candidatesPath);

if (graph.artifact_type !== 'workbench_occurrence_graph') {
  throw new Error(`${graphPath} is not a workbench_occurrence_graph artifact`);
}
if (candidates.artifact_type !== 'workbench_candidate_evidence') {
  throw new Error(`${candidatesPath} is not a workbench_candidate_evidence artifact`);
}
if (graph.focus?.token_key !== candidates.focus?.token_key) {
  throw new Error('Graph and candidate focus token_key values differ.');
}

const paths = {
  manifest: `${outputDir}/manifest.json`,
  occurrences: `${outputDir}/occurrence-graph.jsonl`,
  candidates: `${outputDir}/candidate-evidence.jsonl`,
  clusters: `${outputDir}/clusters.json`,
  blocked: `${outputDir}/blocked-rows.jsonl`,
};

mkdirp(outputDir);
writeJsonl(paths.occurrences, graph.occurrence_markers || []);
writeJsonl(paths.candidates, candidates.candidate_rows || []);
writeJson(paths.clusters, {
  schema_version: 1,
  artifact_type: 'workbench_cluster_index',
  generated_at: generatedAt,
  focus: graph.focus,
  clusters: graph.clusters || [],
});
writeJsonl(paths.blocked, uniqueBlockedRows(graph.blocked_rows || [], candidates.blocked_rows || []));

const manifest = {
  schema_version: 1,
  artifact_type: 'workbench_usage_handoff_manifest',
  generated_at: generatedAt,
  source_artifacts: {
    graph: graphPath,
    candidates: candidatesPath,
  },
  focus: graph.focus,
  policy: 'Streaming handoff for Agent 4. Occurrence graph is exhaustive; candidate rows are derived source-frame commentary and remain not-a-definition.',
  paths: {
    occurrences_jsonl: paths.occurrences,
    candidates_jsonl: paths.candidates,
    clusters_json: paths.clusters,
    blocked_jsonl: paths.blocked,
  },
  counts: {
    occurrence_markers: (graph.occurrence_markers || []).length,
    candidate_rows: (candidates.candidate_rows || []).length,
    clusters: (graph.clusters || []).length,
    blocked_rows: uniqueBlockedRows(graph.blocked_rows || [], candidates.blocked_rows || []).length,
  },
};

writeJson(paths.manifest, manifest);
console.log(`Wrote ${paths.manifest}`);
console.log(`Wrote ${paths.occurrences}`);
console.log(`Wrote ${paths.candidates}`);
console.log(`Wrote ${paths.clusters}`);
console.log(`Wrote ${paths.blocked}`);

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function inferOutputDir(relativePath) {
  const base = path.basename(relativePath).replace(/-occurrence-graph\.json$/i, '');
  return `.local-cache/workbench-evidence/handoff/${base}`;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function mkdirp(relativePath) {
  fs.mkdirSync(path.join(root, relativePath), { recursive: true });
}

function writeJson(relativePath, data) {
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function writeJsonl(relativePath, rows) {
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  const stream = fs.createWriteStream(path.join(root, relativePath), { encoding: 'utf8' });
  for (const row of rows) stream.write(`${JSON.stringify(row)}\n`);
  stream.end();
}

function uniqueBlockedRows(...lists) {
  const rows = [];
  const seen = new Set();
  for (const list of lists) {
    for (const row of list) {
      const key = row.blocked_id || JSON.stringify(row);
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push(row);
    }
  }
  return rows;
}
