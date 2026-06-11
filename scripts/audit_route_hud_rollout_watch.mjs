#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const defaults = {
  report: 'reports/route-hud-rollout-watch.md',
  json: 'reports/route-hud-rollout-watch.json',
};

const args = parseArgs(process.argv.slice(2));
const reportPath = cleanRelativePath(args.report || defaults.report);
const jsonPath = cleanRelativePath(args.json || defaults.json);
const cachePath = path.join(root, '.local-cache', 'route-hud-rollout-watch-cache.json');
const cache = loadCache(cachePath);
const nextCache = {
  schema_version: 1,
  generated_at: new Date().toISOString(),
  pages: {},
};
const renderAuthority = inspectRenderAuthority('scripts/render_site.ps1');

const requiredCurrentMarkers = [
  'selectRouteAnswer',
  'lookupCandidateTreatments',
  'Sources and licenses',
  'Usage evidence',
  'article.dataset.rankBasis',
];

const staleMarkers = [
  'Best actual hit',
  'Full source and license rows',
  'Clicked Hebrew form',
  'Rank details',
  'allowLowConfidenceFallback',
  'data-hud-breakdown',
  'sourceSummary =',
];

const markerBuffers = new Map();

const sources = loadSourceRecords();
const rows = sources.map(auditSourceRecord);
const includedRows = rows.filter((row) => row.source_has_work_slug);
const generatedRows = includedRows.filter((row) => row.page_exists);
const hudRows = generatedRows.filter((row) => row.current_hud);
const issueRows = includedRows.filter((row) => row.issues.length);
const warningRows = includedRows.filter((row) => row.warnings.length);
const renderAuthorityNewerRows = generatedRows.filter((row) => row.render_authority_newer_than_page);
const globalWarnings = [];

if (renderAuthorityNewerRows.length) {
  globalWarnings.push(`${renderAuthority.path} is newer than ${renderAuthorityNewerRows.length} generated page(s); no render was run automatically because template-drift review must remain bounded`);
}

const summary = {
  status: issueRows.length ? 'failed' : 'passed',
  source_records: sources.length,
  source_records_with_work_slug: includedRows.length,
  generated_pages: generatedRows.length,
  current_hud_pages: hudRows.length,
  pages_with_usage_evidence: generatedRows.filter((row) => row.has_usage_evidence).length,
  cache_hits: generatedRows.filter((row) => row.cache_hit).length,
  page_scans: generatedRows.filter((row) => !row.cache_hit).length,
  missing_pages: includedRows.filter((row) => !row.page_exists).length,
  non_hud_pages: generatedRows.filter((row) => !row.current_hud).length,
  source_newer_than_page: includedRows.filter((row) => row.source_newer_than_page).length,
  render_authority_newer_than_page: renderAuthorityNewerRows.length,
  missing_marker_rows: includedRows.filter((row) => row.missing_required_markers.length).length,
  stale_marker_rows: includedRows.filter((row) => row.stale_markers.length).length,
  empty_occurrence_url_rows: includedRows.filter((row) => row.empty_occurrence_url).length,
  issues: issueRows.length,
  warnings: warningRows.length + globalWarnings.length,
};

const output = {
  generated_at: nextCache.generated_at,
  artifact_type: 'route_hud_rollout_watch',
  render_authority: 'scripts/render_site.ps1',
  stale_migration_script_forbidden: 'scripts/upgrade_route_hud_pages.mjs',
  render_authority_drift: {
    path: renderAuthority.path,
    exists: renderAuthority.exists,
    mtime_iso: renderAuthority.mtime_iso,
    newer_than_page_count: renderAuthorityNewerRows.length,
    sample_pages: renderAuthorityNewerRows.map((row) => row.page_path).slice(0, 20),
  },
  summary,
  global_warnings: globalWarnings,
  issue_rows: issueRows.map(compactRow),
  warning_rows: warningRows.map(compactRow),
};

writeJson(jsonPath, output);
writeReport(reportPath, output);
writeCache(cachePath, nextCache);

if (summary.issues) {
  console.error(`Route HUD rollout watch failed with ${summary.issues} issue row(s). Report: ${reportPath}`);
  process.exit(1);
}

console.log(`Route HUD rollout watch passed. Report: ${reportPath}`);

function loadSourceRecords() {
  const sourceDir = path.join(root, 'data', 'sources');
  if (!fs.existsSync(sourceDir)) return [];
  return fs.readdirSync(sourceDir)
    .filter((name) => name.endsWith('.json'))
    .sort((a, b) => a.localeCompare(b))
    .map((file_name) => {
      const file_path = path.join(sourceDir, file_name);
      const relative_path = path.relative(root, file_path).replaceAll(path.sep, '/');
      const stat = fs.statSync(file_path);
      let data = null;
      let parse_error = '';
      try {
        data = JSON.parse(fs.readFileSync(file_path, 'utf8'));
      } catch (error) {
        parse_error = error.message;
      }
      return {
        file_name,
        relative_path,
        source_mtime_ms: stat.mtimeMs,
        work_id: data?.work_id || file_name.replace(/\.json$/i, ''),
        work_slug: data?.work_slug || '',
        parse_error,
      };
    });
}

function auditSourceRecord(source) {
  const pagePath = source.work_slug ? `${source.work_slug.replace(/^\/+|\/+$/g, '')}/index.html` : '';
  const fullPagePath = pagePath ? path.join(root, pagePath) : '';
  const pageExists = Boolean(pagePath && fs.existsSync(fullPagePath));
  const row = {
    work_id: source.work_id,
    work_slug: source.work_slug,
    source_path: source.relative_path,
    page_path: pagePath,
    source_has_work_slug: Boolean(source.work_slug),
    page_exists: pageExists,
    current_hud: false,
    has_usage_evidence: false,
    source_newer_than_page: false,
    missing_required_markers: [],
    stale_markers: [],
    empty_occurrence_url: false,
    render_authority_newer_than_page: false,
    cache_hit: false,
    issues: [],
    warnings: [],
  };

  if (source.parse_error) {
    row.issues.push(`source JSON parse error: ${source.parse_error}`);
    return row;
  }
  if (!row.source_has_work_slug) {
    row.warnings.push('source record missing work_slug; skipped page-path audit');
    return row;
  }
  if (!pageExists) {
    row.issues.push('missing generated page');
    return row;
  }

  const pageStat = fs.statSync(fullPagePath);
  const cached = cache.pages?.[pagePath];
  if (cached
    && cached.page_mtime_ms === pageStat.mtimeMs
    && cached.page_size === pageStat.size) {
    row.cache_hit = true;
    row.current_hud = Boolean(cached.current_hud);
    row.has_usage_evidence = Boolean(cached.has_usage_evidence);
    row.empty_occurrence_url = Boolean(cached.empty_occurrence_url);
    row.missing_required_markers = Array.isArray(cached.missing_required_markers)
      ? cached.missing_required_markers
      : [];
    row.stale_markers = Array.isArray(cached.stale_markers)
      ? cached.stale_markers
      : [];
    row.source_newer_than_page = source.source_mtime_ms > pageStat.mtimeMs + 1000;
    row.render_authority_newer_than_page = renderAuthority.mtime_ms > pageStat.mtimeMs + 1000;
    cachePageAudit(pagePath, pageStat, row);
    applyRowIssues(row);
    return row;
  }

  const html = fs.readFileSync(fullPagePath);
  row.current_hud = hasText(html, 'data-lexical-hud') && hasText(html, 'hud_route_lookup_manifest_url');
  row.has_usage_evidence = hasText(html, 'Usage evidence');
  row.source_newer_than_page = source.source_mtime_ms > pageStat.mtimeMs + 1000;
  row.render_authority_newer_than_page = renderAuthority.mtime_ms > pageStat.mtimeMs + 1000;
  row.empty_occurrence_url = hasText(html, 'data-lexical-occurrences data-src=""');
  row.missing_required_markers = row.current_hud
    ? requiredCurrentMarkers.filter((marker) => !hasText(html, marker))
    : [];
  row.stale_markers = staleMarkers.filter((marker) => hasText(html, marker));

  cachePageAudit(pagePath, pageStat, row);
  applyRowIssues(row);
  return row;
}

function applyRowIssues(row) {
  if (!row.current_hud) row.issues.push('generated page lacks current route HUD shell');
  if (row.source_newer_than_page) row.issues.push('source JSON is newer than generated page');
  if (row.empty_occurrence_url) row.issues.push('empty lexical occurrence URL');
  for (const marker of row.missing_required_markers) row.issues.push(`missing required marker: ${marker}`);
  for (const marker of row.stale_markers) row.issues.push(`contains stale marker: ${marker}`);
}

function compactRow(row) {
  return {
    work_id: row.work_id,
    page_path: row.page_path,
    issues: row.issues,
    warnings: row.warnings,
  };
}

function cachePageAudit(pagePath, pageStat, row) {
  nextCache.pages[pagePath] = {
    page_mtime_ms: pageStat.mtimeMs,
    page_size: pageStat.size,
    current_hud: row.current_hud,
    has_usage_evidence: row.has_usage_evidence,
    empty_occurrence_url: row.empty_occurrence_url,
    missing_required_markers: row.missing_required_markers,
    stale_markers: row.stale_markers,
  };
}

function loadCache(fullPath) {
  try {
    return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  } catch {
    return { pages: {} };
  }
}

function inspectRenderAuthority(relativePath) {
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  if (!fs.existsSync(fullPath)) {
    return {
      path: relativePath,
      exists: false,
      mtime_ms: 0,
      mtime_iso: '',
    };
  }
  const stat = fs.statSync(fullPath);
  return {
    path: relativePath,
    exists: true,
    mtime_ms: stat.mtimeMs,
    mtime_iso: stat.mtime.toISOString(),
  };
}

function hasText(buffer, text) {
  let marker = markerBuffers.get(text);
  if (!marker) {
    marker = Buffer.from(text);
    markerBuffers.set(text, marker);
  }
  return buffer.includes(marker);
}

function writeReport(relativePath, data) {
  const lines = [
    '# Route HUD Rollout Watch',
    '',
    `Generated: ${data.generated_at}`,
    '',
    '## Summary',
    '',
    `- Status: ${data.summary.status}`,
    `- Source records: ${data.summary.source_records}`,
    `- Source records with work_slug: ${data.summary.source_records_with_work_slug}`,
    `- Generated pages: ${data.summary.generated_pages}`,
    `- Current HUD pages: ${data.summary.current_hud_pages}`,
    `- Pages with Usage evidence: ${data.summary.pages_with_usage_evidence}`,
    `- Cached page audits reused: ${data.summary.cache_hits}`,
    `- Page files scanned: ${data.summary.page_scans}`,
    `- Missing pages: ${data.summary.missing_pages}`,
    `- Non-HUD generated pages: ${data.summary.non_hud_pages}`,
    `- Source newer than page: ${data.summary.source_newer_than_page}`,
    `- Render authority newer than page: ${data.summary.render_authority_newer_than_page}`,
    `- Rows missing current markers: ${data.summary.missing_marker_rows}`,
    `- Rows with stale markers: ${data.summary.stale_marker_rows}`,
    `- Empty occurrence URL rows: ${data.summary.empty_occurrence_url_rows}`,
    `- Issues: ${data.summary.issues}`,
    `- Warnings: ${data.summary.warnings}`,
    '',
    '## Boundary',
    '',
    '- This audit is static filesystem evidence only; it does not render, publish, stage, commit, or prove browser click behavior.',
    '- Render authority remains `scripts/render_site.ps1`; `scripts/upgrade_route_hud_pages.mjs` is not used as migration authority.',
    '',
    '## Render Authority Drift',
    '',
    `- Render authority: \`${data.render_authority_drift.path}\``,
    `- Render authority mtime: ${data.render_authority_drift.mtime_iso || 'missing'}`,
    `- Generated pages older than render authority: ${data.render_authority_drift.newer_than_page_count}`,
    `- Sample pages: ${data.render_authority_drift.sample_pages.length ? data.render_authority_drift.sample_pages.map((item) => `\`${item}\``).join(', ') : 'none'}`,
    '',
    '## Issue Rows',
    '',
    ...(data.issue_rows.length
      ? data.issue_rows.map((row) => `- ${row.page_path || row.work_id}: ${row.issues.join('; ')}`)
      : ['- none']),
    '',
    '## Warning Rows',
    '',
    ...(data.global_warnings.length ? data.global_warnings.map((warning) => `- ${warning}`) : []),
    ...(data.warning_rows.length
      ? data.warning_rows.map((row) => `- ${row.page_path || row.work_id}: ${row.warnings.join('; ')}`)
      : data.global_warnings.length ? [] : ['- none']),
    '',
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function parseArgs(argv) {
  const parsed = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--report') parsed.report = argv[++i];
    else if (arg === '--json') parsed.json = argv[++i];
    else if (arg === '--help' || arg === '-h') parsed.help = true;
  }
  if (parsed.help) {
    console.log([
      'Usage:',
      '  node scripts/audit_route_hud_rollout_watch.mjs',
      '  node scripts/audit_route_hud_rollout_watch.mjs --report reports/out.md --json reports/out.json',
    ].join('\n'));
    process.exit(0);
  }
  return parsed;
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replaceAll('\\', '/').replace(/^\/+/, '');
  if (!normalized || normalized.includes('..')) throw new Error(`Unsafe relative path: ${value}`);
  return normalized;
}

function writeJson(relativePath, data) {
  writeText(relativePath, `${JSON.stringify(data, null, 2)}\n`);
}

function writeText(relativePath, text) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, text, 'utf8');
}

function writeCache(fullPath, data) {
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}
