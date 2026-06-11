#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const inputPath = process.argv[2] || 'reports/untracked-source-scope-audit.json';
const markdownPath = 'reports/source-scope-public-visibility-validation.md';
const jsonPath = 'reports/source-scope-public-visibility-validation.json';

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeFile(relativePath, text) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, text, 'utf8');
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '/');
}

function hasLicenseSignal(text) {
  return /(Public Domain|CC-BY|CC BY|CC0|CC BY-SA|GFDL)/i.test(String(text || ''));
}

function hasSourceSignal(text) {
  return /(Hebrew version|Version source|Digitization|Source Notes|License:)/i.test(String(text || ''));
}

function validate() {
  const audit = readJson(inputPath);
  const issues = [];
  const warnings = [];
  const rows = Array.isArray(audit.rows) ? audit.rows : [];

  if (audit.artifact_type !== 'untracked_source_scope_audit') {
    issues.push(`unexpected artifact_type: ${audit.artifact_type || 'missing'}`);
  }
  if (audit.source_scope_state !== 'blocked_for_source_provenance_acceptance_and_future_publication_path') {
    issues.push('source_scope_state does not preserve the source/provenance blocker');
  }
  if (audit.current_public_workbench_state !== 'warning_unless_rendered_public_page_lacks_visible_source_license_attribution_rows') {
    issues.push('current_public_workbench_state does not preserve warning boundary');
  }
  if (Number(audit.untracked_source_file_count) !== rows.length) {
    issues.push(`untracked_source_file_count ${audit.untracked_source_file_count} does not match row count ${rows.length}`);
  }
  if (!Array.isArray(audit.untracked_source_files) || audit.untracked_source_files.length !== rows.length) {
    issues.push('untracked_source_files length does not match row count');
  }

  const rowResults = rows.map((row) => {
    const rowIssues = [];
    const rowWarnings = [];
    const pagePath = String(row.page_path || '').trim();
    const pageExists = Boolean(row.page_exists);
    const evidence = String(row.page_source_license_evidence || '');
    const sourcePath = String(row.source_path || '');
    const downstreamStatus = String(row.downstream_provenance_acceptance || '');

    if (!sourcePath.startsWith('data/sources/') || !sourcePath.endsWith('.json')) {
      rowIssues.push('source_path is not a data/sources JSON path');
    }
    if (downstreamStatus !== 'quarantined_until_source_file_is_tracked_and_source_audit_passes') {
      rowIssues.push('downstream provenance quarantine boundary is missing');
    }
    if (!row.overlay_exists) {
      rowWarnings.push('overlay missing');
    }
    if (pageExists) {
      const fullPagePath = path.join(root, pagePath);
      if (!fs.existsSync(fullPagePath)) rowIssues.push('page_exists true but file is missing');
      if (!row.page_visible_source_license_rows) rowIssues.push('rendered public page lacks visible source/license rows');
      if (!hasLicenseSignal(evidence)) rowIssues.push('page source/license evidence lacks license signal');
      if (!hasSourceSignal(evidence)) rowIssues.push('page source/license evidence lacks source signal');
    } else if (pagePath && pagePath !== '(missing)') {
      rowWarnings.push('page_path provided but page_exists false');
    }

    return {
      source_path: sourcePath,
      page_path: pagePath || '(missing)',
      page_exists: pageExists,
      page_visible_source_license_rows: Boolean(row.page_visible_source_license_rows),
      downstream_provenance_acceptance: downstreamStatus,
      issues: rowIssues,
      warnings: rowWarnings,
    };
  });

  for (const result of rowResults) {
    result.issues.forEach((issue) => issues.push(`${result.source_path}: ${issue}`));
    result.warnings.forEach((warning) => warnings.push(`${result.source_path}: ${warning}`));
  }

  const publicRows = rowResults.filter((row) => row.page_exists);
  const missingPageRows = rowResults.filter((row) => !row.page_exists);
  const visibleRows = publicRows.filter((row) => row.page_visible_source_license_rows);
  const result = {
    generated_at: new Date().toISOString(),
    artifact_type: 'source_scope_public_visibility_validation',
    input: inputPath,
    verdict: issues.length ? 'fail' : (warnings.length ? 'pass_with_warnings' : 'pass'),
    source_scope_state: audit.source_scope_state,
    current_public_workbench_state: audit.current_public_workbench_state,
    counts: {
      untracked_source_rows: rows.length,
      public_pages: publicRows.length,
      public_pages_with_visible_source_license_rows: visibleRows.length,
      missing_public_pages: missingPageRows.length,
      downstream_quarantined_rows: rowResults.filter((row) => row.downstream_provenance_acceptance === 'quarantined_until_source_file_is_tracked_and_source_audit_passes').length,
    },
    issues,
    warnings,
    rows: rowResults,
  };

  const markdown = [
    '# Source Scope Public Visibility Validation',
    '',
    `Generated: ${result.generated_at}`,
    '',
    `Verdict: ${result.verdict}`,
    '',
    `Input: ${inputPath}`,
    '',
    '## Summary',
    '',
    `- Untracked source rows: ${result.counts.untracked_source_rows}`,
    `- Public pages: ${result.counts.public_pages}`,
    `- Public pages with visible source/license rows: ${result.counts.public_pages_with_visible_source_license_rows}`,
    `- Missing public pages: ${result.counts.missing_public_pages}`,
    `- Downstream quarantined rows: ${result.counts.downstream_quarantined_rows}`,
    '',
    '## Rows',
    '',
    '| source | public page | visible source/license rows | downstream quarantine | issues |',
    '|---|---|---:|---:|---|',
    ...rowResults.map((row) => `| ${mdCell(row.source_path)} | ${mdCell(row.page_path)} | ${row.page_visible_source_license_rows ? 'yes' : 'no'} | ${row.downstream_provenance_acceptance ? 'yes' : 'no'} | ${mdCell(row.issues.join('; ') || 'none')} |`),
    '',
    '## Issues',
    '',
    ...(issues.length ? issues.map((issue) => `- ${issue}`) : ['- none']),
    '',
    '## Warnings',
    '',
    ...(warnings.length ? warnings.map((warning) => `- ${warning}`) : ['- none']),
    '',
    '## Boundary',
    '',
    '- This validates current public/workbench visibility only for rows already listed in the untracked source-scope audit.',
    '- It does not resolve the source/provenance blocker; untracked source files remain quarantined until tracked, audited, or explicitly quarantined by policy.',
    '- It does not accept publication readiness.',
    '',
  ].join('\n');

  writeFile(markdownPath, `${markdown}\n`);
  writeFile(jsonPath, `${JSON.stringify(result, null, 2)}\n`);
  return result;
}

const result = validate();
if (result.issues.length) {
  console.error(`Source scope public visibility validation failed with ${result.issues.length} issue(s). Report: ${markdownPath}`);
  process.exit(1);
}
console.log(`Source scope public visibility validation ${result.verdict}: ${markdownPath}`);
