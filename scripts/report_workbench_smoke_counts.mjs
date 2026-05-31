#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  targetQueue: '.local-cache/workbench-evidence/smoke-target-queue.json',
  fullDir: '.local-cache/workbench-evidence/full',
  output: '.local-cache/workbench-evidence/smoke-counts.json',
  report: 'reports/workbench-smoke-counts.md',
  failOnMissing: true,
  failOnZeroUseful: true,
};

const options = parseArgs(process.argv.slice(2));
const queue = readJson(options.targetQueue);
if (queue.artifact_type !== 'workbench_target_queue') {
  throw new Error(`${options.targetQueue} is not a workbench target queue`);
}

const clusterIndex = new Map();
const workIndex = new Map();
const licenseIndex = new Map();
const audit = {
  candidate_rows: 0,
  bad_not_definition_flags: 0,
  missing_source_metadata: 0,
  forbidden_definition_fields: 0,
  suspicious_translation_fields: 0,
  bad_phrase_hebrew: 0,
  missing_focus_token: 0,
};
const rows = (Array.isArray(queue.targets) ? queue.targets : []).map((target) => {
  const slug = String(target.slug || target.slug_override || '').trim();
  if (!slug) throw new Error(`Target is missing slug: ${target.token_normalized || 'unknown token'}`);
  const candidatesPath = `${options.fullDir}/${slug}-candidate-evidence.json`;
  const fullPath = path.join(root, candidatesPath);
  const candidateArtifact = fs.existsSync(fullPath) ? readJson(candidatesPath) : null;
  const counts = candidateArtifact?.counts || null;
  if (candidateArtifact) indexCandidateRows(candidateArtifact, clusterIndex, workIndex, licenseIndex, audit);
  const usefulCount = counts
    ? Number(counts.supported || 0) + Number(counts.candidate || 0) + Number(counts.weak || 0)
    : 0;
  return {
    slug,
    token_key: target.token_key || null,
    token_normalized: target.token_normalized || null,
    source_files: Array.isArray(target.source_files) ? target.source_files.length : 0,
    candidates_path: candidatesPath,
    missing: !counts,
    useful_count: usefulCount,
    supported: counts?.supported ?? null,
    candidate: counts?.candidate ?? null,
    weak: counts?.weak ?? null,
    ambiguous: counts?.ambiguous ?? null,
    candidate_rows: counts?.candidate_rows ?? null,
  };
});

const totals = rows.reduce((sum, row) => {
  for (const key of ['supported', 'candidate', 'weak', 'ambiguous', 'candidate_rows']) {
    sum[key] += Number(row[key] || 0);
  }
  if (row.missing) sum.missing += 1;
  if (!row.missing && row.useful_count === 0) sum.zero_useful += 1;
  return sum;
}, {
  supported: 0,
  candidate: 0,
  weak: 0,
  ambiguous: 0,
  candidate_rows: 0,
  missing: 0,
  zero_useful: 0,
});

const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_smoke_count_report',
  generated_at: new Date().toISOString(),
  generator: 'scripts/report_workbench_smoke_counts.mjs',
  policy: 'Smoke target count report. Counts are observed graph outputs, not final definition choices.',
  inputs: {
    target_queue: options.targetQueue,
    full_dir: options.fullDir,
  },
  counts: {
    targets: rows.length,
    ...totals,
  },
  clusters: [...clusterIndex.values()].sort((a, b) => b.candidate_rows - a.candidate_rows || a.cluster_id.localeCompare(b.cluster_id)),
  licenses: [...licenseIndex.values()].sort((a, b) => b.candidate_rows - a.candidate_rows || a.license.localeCompare(b.license)),
  audit,
  top_works: [...workIndex.values()].sort((a, b) => (
    b.supported - a.supported
    || b.candidate - a.candidate
    || b.weak - a.weak
    || b.candidate_rows - a.candidate_rows
    || a.work_id.localeCompare(b.work_id)
  )),
  rows,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Targets ${rows.length}; supported ${totals.supported}; candidate ${totals.candidate}; weak ${totals.weak}; ambiguous ${totals.ambiguous}; missing ${totals.missing}; zero useful ${totals.zero_useful}`);

if (options.failOnMissing && totals.missing > 0) process.exitCode = 2;
if (options.failOnZeroUseful && totals.zero_useful > 0) process.exitCode = 3;

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--target-queue=')) parsed.targetQueue = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--full-dir=')) parsed.fullDir = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg === '--allow-missing') parsed.failOnMissing = false;
    else if (arg === '--allow-zero-useful') parsed.failOnZeroUseful = false;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, data) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Smoke Counts',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Totals',
    '',
    `- Targets: ${artifact.counts.targets}`,
    `- Candidate rows: ${artifact.counts.candidate_rows}`,
    `- Supported: ${artifact.counts.supported}`,
    `- Candidate: ${artifact.counts.candidate}`,
    `- Weak: ${artifact.counts.weak}`,
    `- Ambiguous: ${artifact.counts.ambiguous}`,
    `- Missing artifacts: ${artifact.counts.missing}`,
    `- Zero useful targets: ${artifact.counts.zero_useful}`,
    '',
    '## Targets',
    '',
    '| slug | source files | supported | candidate | weak | ambiguous | rows | status |',
    '|---|---:|---:|---:|---:|---:|---:|---|',
    ...artifact.rows.map((row) => {
      const status = row.missing ? 'missing' : row.useful_count === 0 ? 'zero_useful' : 'ok';
      return `| ${mdCell(row.slug)} | ${row.source_files} | ${row.supported ?? 'n/a'} | ${row.candidate ?? 'n/a'} | ${row.weak ?? 'n/a'} | ${row.ambiguous ?? 'n/a'} | ${row.candidate_rows ?? 'n/a'} | ${status} |`;
    }),
    '',
    '## Clusters',
    '',
    '| cluster | supported | candidate | weak | ambiguous | rows |',
    '|---|---:|---:|---:|---:|---:|',
    ...artifact.clusters.map((row) => `| ${mdCell(row.cluster_id)} | ${row.supported} | ${row.candidate} | ${row.weak} | ${row.ambiguous} | ${row.candidate_rows} |`),
    '',
    '## Audit',
    '',
    `- Candidate rows audited: ${artifact.audit.candidate_rows}`,
    `- Bad not-definition flags: ${artifact.audit.bad_not_definition_flags}`,
    `- Missing source metadata: ${artifact.audit.missing_source_metadata}`,
    `- Forbidden definition fields: ${artifact.audit.forbidden_definition_fields}`,
    `- Suspicious translation fields: ${artifact.audit.suspicious_translation_fields}`,
    `- Bad Hebrew phrase windows: ${artifact.audit.bad_phrase_hebrew}`,
    `- Missing focus token marker: ${artifact.audit.missing_focus_token}`,
    '',
    '## Licenses',
    '',
    '| license | rows |',
    '|---|---:|',
    ...artifact.licenses.map((row) => `| ${mdCell(row.license)} | ${row.candidate_rows} |`),
    '',
    '## Top Works',
    '',
    '| work | supported | candidate | weak | ambiguous | rows |',
    '|---|---:|---:|---:|---:|---:|',
    ...artifact.top_works.slice(0, 40).map((row) => `| ${mdCell(row.work_title)} | ${row.supported} | ${row.candidate} | ${row.weak} | ${row.ambiguous} | ${row.candidate_rows} |`),
    '',
    '## Boundary',
    '',
    'This report audits smoke graph outputs only. It does not rank definitions, choose HUD winners, or convert usage commentary into a definition.',
    '',
  ];
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${lines.join('\n')}\n`, 'utf8');
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function indexCandidateRows(artifact, clusterIndex, workIndex, licenseIndex, audit) {
  for (const row of Array.isArray(artifact.candidate_rows) ? artifact.candidate_rows : []) {
    audit.candidate_rows += 1;
    if (row.not_a_definition !== true || row.observed_usage_only !== true) audit.bad_not_definition_flags += 1;
    if (!row.license || !row.license_url || !row.version_title || !row.version_source || !row.source_url) {
      audit.missing_source_metadata += 1;
    }
    if ('definition_text' in row || 'gloss' in row || 'meanings' in row) audit.forbidden_definition_fields += 1;
    if (!row.phrase_hebrew || /[A-Za-z]{4,}/.test(row.phrase_hebrew)) audit.bad_phrase_hebrew += 1;
    if (!Array.isArray(row.phrase_tokens) || !row.phrase_tokens.some((token) => token.role === 'focus-token')) {
      audit.missing_focus_token += 1;
    }
    for (const sourceRow of row.source_rows || []) {
      const fields = (sourceRow.fields_used || []).join(' ').toLowerCase();
      const keys = Object.keys(sourceRow).join(' ').toLowerCase();
      if (/english|translation|text_en|en\b/.test(fields) || /english|translation|text_en/.test(keys)) {
        audit.suspicious_translation_fields += 1;
      }
    }

    const licenseKey = `${row.license || 'unknown'} | ${row.license_url || 'unknown'}`;
    const license = licenseIndex.get(licenseKey) || {
      license: licenseKey,
      candidate_rows: 0,
    };
    license.candidate_rows += 1;
    licenseIndex.set(licenseKey, license);

    const status = ['supported', 'candidate', 'weak', 'ambiguous'].includes(row.candidate_status)
      ? row.candidate_status
      : 'ambiguous';
    const clusterId = String(row.cluster_id || 'unclustered');
    const cluster = clusterIndex.get(clusterId) || {
      cluster_id: clusterId,
      supported: 0,
      candidate: 0,
      weak: 0,
      ambiguous: 0,
      candidate_rows: 0,
    };
    cluster[status] += 1;
    cluster.candidate_rows += 1;
    clusterIndex.set(clusterId, cluster);

    const workId = String(row.work_id || 'unknown');
    const work = workIndex.get(workId) || {
      work_id: workId,
      work_title: row.work_title || workId,
      supported: 0,
      candidate: 0,
      weak: 0,
      ambiguous: 0,
      candidate_rows: 0,
    };
    work[status] += 1;
    work.candidate_rows += 1;
    workIndex.set(workId, work);
  }
}
