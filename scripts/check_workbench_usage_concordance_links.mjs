#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  concordance: 'data/workbench-evidence/usage-concordance.json',
  output: '.local-cache/workbench-evidence/usage-concordance-link-check.json',
  report: 'reports/workbench-usage-concordance-link-check.md',
};

const options = parseArgs(process.argv.slice(2));
const concordance = readJson(options.concordance);
const issues = [];
const fileCache = new Map();
const sourceUrlPattern = /^https?:\/\/[^\s]+$/;
const counts = {
  rows: 0,
  source_url_ok: 0,
  source_url_bad: 0,
  work_anchor_ok: 0,
  work_anchor_bad: 0,
  work_file_missing: 0,
  work_anchor_missing: 0,
  malformed_work_anchor: 0,
  unsafe_work_anchor: 0,
};

if (concordance.artifact_type !== 'workbench_usage_navigation_concordance') {
  throw new Error(`${options.concordance} is not a usage concordance artifact`);
}

for (const row of concordance.rows || []) {
  counts.rows += 1;
  checkSourceUrl(row);
  checkWorkAnchor(row);
}

const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_concordance_link_check',
  generated_at: new Date().toISOString(),
  generator: 'scripts/check_workbench_usage_concordance_links.mjs',
  policy: 'Local occurrence-link integrity check for usage-navigation rows. It validates URL shape and local work/page anchors; it does not fetch remote sources, rank routes, or select visible answers.',
  inputs: {
    concordance: options.concordance,
  },
  counts,
  quality: {
    status: issues.length ? 'failed' : 'passed',
    issue_count: issues.length,
  },
  issues,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Usage concordance link check ${artifact.quality.status}; rows ${counts.rows}; source URL bad ${counts.source_url_bad}; work anchors bad ${counts.work_anchor_bad}`);
if (issues.length) process.exitCode = 2;

function checkSourceUrl(row) {
  const href = String(row.occurrence_links?.source_ref?.href || '');
  if (sourceUrlPattern.test(href)) {
    counts.source_url_ok += 1;
    return;
  }
  counts.source_url_bad += 1;
  addIssue(row, 'bad_source_url', `source href is not http(s): ${href || 'missing'}`);
}

function checkWorkAnchor(row) {
  const href = String(row.occurrence_links?.work_anchor?.href || '');
  const [filePart, anchorId, extra] = href.split('#');
  if (!filePart || !anchorId || extra !== undefined) {
    counts.malformed_work_anchor += 1;
    counts.work_anchor_bad += 1;
    addIssue(row, 'malformed_work_anchor', `work anchor must be file#id: ${href || 'missing'}`);
    return;
  }

  const cleanFile = cleanRelativePath(filePart);
  const absoluteFile = path.resolve(root, cleanFile);
  if (!absoluteFile.startsWith(root + path.sep)) {
    counts.unsafe_work_anchor += 1;
    counts.work_anchor_bad += 1;
    addIssue(row, 'unsafe_work_anchor', `work anchor escapes workspace: ${href}`);
    return;
  }

  if (!fs.existsSync(absoluteFile)) {
    counts.work_file_missing += 1;
    counts.work_anchor_bad += 1;
    addIssue(row, 'work_file_missing', `work anchor file missing: ${cleanFile}`);
    return;
  }

  const html = readCachedFile(absoluteFile);
  if (!hasHtmlId(html, anchorId)) {
    counts.work_anchor_missing += 1;
    counts.work_anchor_bad += 1;
    addIssue(row, 'work_anchor_missing', `anchor id not found in ${cleanFile}: ${anchorId}`);
    return;
  }

  counts.work_anchor_ok += 1;
}

function addIssue(row, code, message) {
  issues.push({
    code,
    message,
    candidate_id: row.ids?.candidate_id || null,
    occurrence_id: row.ids?.occurrence_id || null,
    source_ref: row.source?.source_ref || row.occurrence_links?.source_ref?.label || null,
    work_anchor: row.occurrence_links?.work_anchor?.href || null,
    status: row.status?.candidate_status || null,
  });
}

function hasHtmlId(html, anchorId) {
  const escaped = escapeRegex(anchorId);
  return new RegExp(`\\sid=["']${escaped}["']`).test(html);
}

function readCachedFile(absoluteFile) {
  if (!fileCache.has(absoluteFile)) {
    fileCache.set(absoluteFile, fs.readFileSync(absoluteFile, 'utf8'));
  }
  return fileCache.get(absoluteFile);
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Concordance Link Check',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Status: ${artifact.quality.status}`,
    `- Rows checked: ${artifact.counts.rows}`,
    `- Source URLs: ok ${artifact.counts.source_url_ok}, bad ${artifact.counts.source_url_bad}`,
    `- Work anchors: ok ${artifact.counts.work_anchor_ok}, bad ${artifact.counts.work_anchor_bad}`,
    `- Missing files: ${artifact.counts.work_file_missing}`,
    `- Missing anchors: ${artifact.counts.work_anchor_missing}`,
    `- Malformed anchors: ${artifact.counts.malformed_work_anchor}`,
    `- Unsafe anchors: ${artifact.counts.unsafe_work_anchor}`,
    '',
    '## Policy',
    '',
    'This is a usage-navigation link integrity audit. It does not fetch remote sources, rank routes, select visible answers, or make lexical claims.',
    '',
    '## Issues',
    '',
  ];
  if (!artifact.issues.length) {
    lines.push('No link integrity issues found.');
  } else {
    lines.push('| code | candidate | source | work anchor | message |');
    lines.push('|---|---|---|---|---|');
    for (const issue of artifact.issues.slice(0, 200)) {
      lines.push(`| ${mdCell(issue.code)} | ${mdCell(issue.candidate_id)} | ${mdCell(issue.source_ref)} | ${mdCell(issue.work_anchor)} | ${mdCell(issue.message)} |`);
    }
  }
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--concordance=')) parsed.concordance = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

function writeJson(relativePath, data) {
  writeText(relativePath, `${JSON.stringify(data, null, 2)}\n`);
}

function writeText(relativePath, text) {
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, text, 'utf8');
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function valueAfterEquals(arg) {
  return arg.split('=').slice(1).join('=');
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}
