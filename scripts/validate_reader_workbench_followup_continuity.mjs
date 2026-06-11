#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const targetPath = process.argv[2] || 'data/control/reader_workbench_followup_targets.json';
const markdownPath = process.argv[3] || 'reports/reader-workbench-followup-continuity-audit.md';
const jsonPath = process.argv[4] || 'reports/reader-workbench-followup-continuity-audit.json';

const issues = [];
const warnings = [];
const targets = readJson(targetPath);
const includedTargets = (targets.targets || []).filter((target) => target.include_in_next_followup === true);
const blockedTargets = targets.blocked_targets || [];
const reportsByPage = loadClickReports();
const rows = includedTargets.map(validateTarget);

if (targets.global_boundary?.publication_status !== 'not_a_translation') {
  issues.push('global_boundary.publication_status must be not_a_translation');
}
if (targets.global_boundary?.publication_ready !== false) {
  issues.push('global_boundary.publication_ready must be false');
}
if (targets.global_boundary?.accepted_translation_text !== false) {
  issues.push('global_boundary.accepted_translation_text must be false');
}
if (!blockedTargets.some((target) => target.work_id === 'beer-hagolah')) {
  issues.push('beer-hagolah must remain listed as blocked until source custody and page markers are fixed');
}

const totals = {
  included_targets: includedTargets.length,
  blocked_targets: blockedTargets.length,
  static_units: sum(rows, 'static_units'),
  occurrence_units: sum(rows, 'occurrence_units'),
  occurrence_token_placements: sum(rows, 'occurrence_token_placements'),
  unique_token_ids: sum(rows, 'unique_token_ids'),
  paragraph_count_mismatches: sum(rows, 'paragraph_count_mismatches'),
  paragraph_split_token_alignments: sum(rows, 'paragraph_split_token_alignments'),
  paragraph_alignment_failures: sum(rows, 'paragraph_alignment_failures'),
  sampled_token_rows: sum(rows, 'sampled_token_rows'),
  samples_with_answer_eligible: sum(rows, 'samples_with_answer_eligible'),
  samples_with_answer_source_rows: sum(rows, 'samples_with_answer_source_rows'),
  samples_with_missing_lookup_shards: sum(rows, 'samples_with_missing_lookup_shards'),
};

const result = {
  generated_at: new Date().toISOString(),
  artifact_type: 'reader_workbench_followup_continuity_audit',
  target_file: normalizePath(targetPath),
  status: issues.length ? 'failed' : 'passed',
  boundary: {
    not_publication: true,
    not_broad_rollout: true,
    not_live_browser_click_proof: true,
    not_accepted_translation_text: true,
    agent6_acceptance_required: true,
  },
  totals,
  rows,
  blocked_targets: blockedTargets,
  issues,
  warnings,
};

writeJson(jsonPath, result);
writeMarkdown(markdownPath, result);

if (issues.length) {
  console.error(`Reader Workbench follow-up continuity audit failed with ${issues.length} issue(s). Report: ${markdownPath}`);
  process.exit(1);
}

console.log(`Reader Workbench follow-up continuity audit passed. Report: ${markdownPath}`);

function validateTarget(target) {
  const rowIssues = [];
  const rowWarnings = [];
  const report = reportsByPage.get(target.page_path);
  if (!report) {
    rowIssues.push('missing click-contract report');
  }

  const counts = report?.counts || {};
  const reportIssues = report?.issues || [];
  const reportWarnings = report?.warnings || [];
  const allowedWarnings = reportWarnings.filter((warning) => !String(warning).startsWith('paragraph count mismatches resolved by split-token alignment:'));

  if (report && report.verdict !== 'pass_static_prevalidation_browser_click_unproven') {
    rowIssues.push(`unexpected click verdict: ${report.verdict || 'missing'}`);
  }
  if (report && report.browser_click_proof !== 'not_run_direct_file_url_blocked_by_in_app_browser_policy') {
    rowIssues.push('browser proof boundary changed or missing');
  }
  if (reportIssues.length) rowIssues.push(`click report has ${reportIssues.length} issue(s)`);
  if (allowedWarnings.length) rowWarnings.push(`click report has unexpected warning(s): ${allowedWarnings.join('; ')}`);
  if (Number(counts.runtime_markers_missing || 0) !== 0) rowIssues.push('runtime markers missing');
  if (Number(counts.page_markers_missing || 0) !== 0) rowIssues.push('page markers missing');
  if (Number(counts.forbidden_page_markers || 0) !== 0) rowIssues.push('forbidden stale page markers present');
  if (Number(counts.paragraph_alignment_failures || 0) !== 0) rowIssues.push('paragraph alignment failures present');
  if (Number(counts.token_rows_resolved || 0) !== Number(counts.unique_token_ids || 0)) rowIssues.push('token rows resolved does not match unique token ids');
  if (Number(counts.samples_with_answer_source_rows || 0) !== Number(counts.samples_with_answer_eligible || 0)) {
    rowIssues.push('not every sampled answer-eligible card has complete source/license rows');
  }
  if (Number(counts.sampled_token_rows || 0) <= 0) rowIssues.push('no sampled token rows');

  const output = {
    work_id: target.work_id,
    lane: target.lane,
    page_path: target.page_path,
    report_path: report?.artifacts?.json_report || '',
    verdict: report?.verdict || 'missing',
    static_units: Number(counts.static_units || 0),
    occurrence_units: Number(counts.occurrence_units || 0),
    occurrence_token_placements: Number(counts.occurrence_token_placements || 0),
    unique_token_ids: Number(counts.unique_token_ids || 0),
    paragraph_count_mismatches: Number(counts.paragraph_count_mismatches || 0),
    paragraph_split_token_alignments: Number(counts.paragraph_split_token_alignments || 0),
    paragraph_alignment_failures: Number(counts.paragraph_alignment_failures || 0),
    sampled_token_rows: Number(counts.sampled_token_rows || 0),
    samples_with_answer_eligible: Number(counts.samples_with_answer_eligible || 0),
    samples_with_answer_source_rows: Number(counts.samples_with_answer_source_rows || 0),
    samples_with_missing_lookup_shards: Number(counts.samples_with_missing_lookup_shards || 0),
    browser_click_proof: report?.browser_click_proof || 'missing',
    issues: rowIssues,
    warnings: rowWarnings,
  };

  rowIssues.forEach((issue) => issues.push(`${target.work_id}: ${issue}`));
  rowWarnings.forEach((warning) => warnings.push(`${target.work_id}: ${warning}`));
  return output;
}

function loadClickReports() {
  const map = new Map();
  const reportDir = path.join(root, 'reports');
  for (const name of fs.readdirSync(reportDir)) {
    if (!/^agent4-.*reader-workbench-click-prevalidation-2026-06-01\.json$/.test(name)) continue;
    const fullPath = path.join(reportDir, name);
    const report = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    if (report.page) map.set(report.page, report);
  }
  return map;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, data) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function writeMarkdown(relativePath, data) {
  const lines = [
    '# Reader Workbench Follow-Up Continuity Audit',
    '',
    `Generated: ${data.generated_at}`,
    '',
    '## Summary',
    '',
    `- Status: ${data.status}`,
    `- Included targets: ${data.totals.included_targets}`,
    `- Blocked targets: ${data.totals.blocked_targets}`,
    `- Paragraph alignment failures: ${data.totals.paragraph_alignment_failures}`,
    `- Split-token/hyphen alignments: ${data.totals.paragraph_split_token_alignments}`,
    `- Sampled answer-eligible rows: ${data.totals.samples_with_answer_eligible}`,
    `- Sampled answer source/license rows: ${data.totals.samples_with_answer_source_rows}`,
    `- No-shard lookup metrics: ${data.totals.samples_with_missing_lookup_shards}`,
    `- Issues: ${data.issues.length}`,
    `- Warnings: ${data.warnings.length}`,
    '',
    '## Target Rows',
    '',
    '| work | lane | verdict | align failures | split alignments | sampled answers | source rows | no-shard metrics |',
    '|---|---|---|---:|---:|---:|---:|---:|',
    ...data.rows.map((row) => `| ${cell(row.work_id)} | ${cell(row.lane)} | ${cell(row.verdict)} | ${row.paragraph_alignment_failures} | ${row.paragraph_split_token_alignments} | ${row.samples_with_answer_eligible} | ${row.samples_with_answer_source_rows} | ${row.samples_with_missing_lookup_shards} |`),
    '',
    '## Blocked Targets',
    '',
    ...(data.blocked_targets.length ? data.blocked_targets.map((target) => `- ${target.work_id}: ${target.reason || 'blocked'}`) : ['- none']),
    '',
    '## Boundary',
    '',
    '- This is static follow-up continuity evidence only.',
    '- This does not accept broad rollout, deferred pages, live browser-click proof, publication readiness, or accepted translation text.',
    '- Agent 6 must write the verdict before these follow-up pages are treated as accepted.',
    '',
    '## Issues',
    '',
    ...(data.issues.length ? data.issues.map((issue) => `- ${issue}`) : ['- none']),
    '',
    '## Warnings',
    '',
    ...(data.warnings.length ? data.warnings.map((warning) => `- ${warning}`) : ['- none']),
    '',
  ];
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${lines.join('\n')}\n`, 'utf8');
}

function sum(rowsToSum, key) {
  return rowsToSum.reduce((total, row) => total + Number(row[key] || 0), 0);
}

function cell(value) {
  return String(value ?? '').replace(/\|/g, '/').replace(/\r?\n/g, ' ');
}

function normalizePath(value) {
  return String(value || '').replaceAll('\\', '/');
}
