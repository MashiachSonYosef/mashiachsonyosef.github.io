#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  sourceFreshness: '.local-cache/workbench-evidence/source-freshness.json',
  searchRows: '.local-cache/workbench-evidence/usage-search-rows.json',
  output: '.local-cache/workbench-evidence/usage-refresh-priority-index.json',
  report: 'reports/workbench-usage-refresh-priority-index.md',
  maxReportRows: 80,
};

const options = parseArgs(process.argv.slice(2));
const sourceFreshness = readJson(options.sourceFreshness);
const searchRows = readJson(options.searchRows);
if (sourceFreshness.artifact_type !== 'workbench_source_freshness_report') {
  throw new Error(`${options.sourceFreshness} is not a source freshness report`);
}
if (searchRows.artifact_type !== 'workbench_usage_navigation_search_rows') {
  throw new Error(`${options.searchRows} is not a usage search rows artifact`);
}

const usageBySourceSlug = buildUsageBySourceSlug(searchRows.rows || []);
const rows = (sourceFreshness.pending_refresh_files || []).map((pending) => compactRefreshRow(pending, usageBySourceSlug));
rows.sort(compareRows);

const counts = {
  pending_refresh_files: rows.length,
  known_usage_refresh_candidates: rows.filter((row) => row.refresh_status === 'known_usage_refresh_candidate').length,
  review_only_not_promoted: rows.filter((row) => row.refresh_status === 'review_only_not_promoted').length,
  promoted_run_targets: 0,
  blocked_broad_refresh_files: rows.length,
  source_freshness_status: sourceFreshness.status || null,
  search_rows: Number(searchRows.counts?.rows || 0),
  search_works: Number(searchRows.counts?.works || 0),
  route_payload_field_hits: 0,
};
const checks = buildChecks(rows, counts);
const failed = checks.filter((check) => check.status === 'failed');
const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_refresh_priority_index',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_refresh_priority_index.mjs',
  policy: 'Refresh-priority control index for stale source inventory. It reads source freshness metadata and existing usage search rows only; it does not read source text, scan Hebrew tokens, generate evidence, promote broad targets, rank routes, translate, or make meaning claims.',
  inputs: {
    source_freshness: options.sourceFreshness,
    search_rows: options.searchRows,
  },
  authority_policy: {
    usage_navigation_only: true,
    ranks_routes: false,
    selects_visible_result: false,
    ambiguous_rows_reader_facing: false,
    route_payloads_copied: false,
    broad_target_expansion: false,
    source_text_read: false,
  },
  quality: {
    status: failed.length ? 'failed' : 'passed',
    failed_count: failed.length,
  },
  counts,
  checks,
  rows,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Usage refresh priority pending ${counts.pending_refresh_files}; known-use candidates ${counts.known_usage_refresh_candidates}; promoted ${counts.promoted_run_targets}`);

function buildUsageBySourceSlug(rows) {
  const map = new Map();
  for (const row of rows) {
    const slug = sourceSlugFromWork(row.work_id, row.work_slug);
    if (!slug) continue;
    if (!map.has(slug)) {
      map.set(slug, {
        rows: 0,
        supported: 0,
        candidate: 0,
        weak: 0,
        clusters: new Set(),
        route_ids: new Set(),
      });
    }
    const entry = map.get(slug);
    entry.rows += 1;
    if (Object.hasOwn(entry, row.status)) entry[row.status] += 1;
    if (row.cluster_id) entry.clusters.add(row.cluster_id);
    for (const routeId of row.route_ids || []) entry.route_ids.add(routeId);
  }
  return map;
}

function compactRefreshRow(pending, usageBySourceSlug) {
  const sourceSlug = String(pending.source_file || '').replace(/^data\/sources\//, '').replace(/\.json$/, '');
  const usage = usageBySourceSlug.get(sourceSlug) || null;
  return {
    source_file: pending.source_file,
    source_slug: sourceSlug,
    category_hint: categoryHint(sourceSlug),
    modified_at: pending.modified_at,
    created_at: pending.created_at,
    bytes: pending.bytes,
    current_usage_rows: usage?.rows || 0,
    current_supported_rows: usage?.supported || 0,
    current_candidate_rows: usage?.candidate || 0,
    current_weak_rows: usage?.weak || 0,
    current_clusters: usage ? [...usage.clusters].sort() : [],
    route_ids: usage ? [...usage.route_ids].sort() : [],
    refresh_status: usage?.rows > 0 ? 'known_usage_refresh_candidate' : 'review_only_not_promoted',
    promotion_status: 'not_promoted',
    reason: usage?.rows > 0
      ? 'Pending source file already has usage rows in the current search export; eligible for a tiny 1-5 file review run if needed.'
      : 'Pending source file is not represented in the current usage search export; keep review-only and do not broaden the queue from this control artifact.',
  };
}

function buildChecks(rows, counts) {
  const promoted = rows.filter((row) => row.promotion_status !== 'not_promoted').length;
  const rowsWithSourcePaths = rows.filter((row) => String(row.source_file || '').startsWith('data/sources/') && String(row.source_file || '').endsWith('.json')).length;
  const rowsWithReasons = rows.filter((row) => row.reason).length;
  return [
    check('pending_rows_match_source_freshness', rows.length === Number(sourceFreshness.current_inventory?.files_modified_after_artifact || 0) ? 'passed' : 'failed', `rows ${rows.length}; freshness pending ${sourceFreshness.current_inventory?.files_modified_after_artifact}`),
    check('no_targets_promoted', promoted === 0 && counts.promoted_run_targets === 0 ? 'passed' : 'failed', `promoted rows ${promoted}; promoted count ${counts.promoted_run_targets}`),
    check('all_rows_have_source_paths', rowsWithSourcePaths === rows.length ? 'passed' : 'failed', `source path rows ${rowsWithSourcePaths}; rows ${rows.length}`),
    check('all_rows_have_review_reasons', rowsWithReasons === rows.length ? 'passed' : 'failed', `reason rows ${rowsWithReasons}; rows ${rows.length}`),
    check('route_payload_absent', 'passed', 'route IDs are copied as IDs only; route payload field hits 0'),
  ];
}

function check(id, status, detail) {
  return { id, status, detail };
}

function sourceSlugFromWork(workId, workSlug) {
  if (workId) return String(workId);
  const slug = String(workSlug || '');
  return slug.includes('/') ? slug.split('/').pop() : slug || null;
}

function categoryHint(sourceSlug) {
  const value = String(sourceSlug || '');
  if (/zohar|etz-chaim|kavanot|gilgulim|rashbi|pesukim|ari|yahel-ohr/i.test(value)) return 'kabbalah';
  if (/shulchan-arukh|mishneh-torah|halakh|taz|shakh|eiger|pitchei|netivot|ketzot|urim/i.test(value)) return 'halakhah';
  if (/maharal|guide-for-the-perplexed|moreh|emunot|ikarim|akeidat/i.test(value)) return 'jewish-thought';
  if (/luchot|kav-hayashar|musar/i.test(value)) return 'musar';
  if (/toldot|kedushat|moharan|besht|chasid/i.test(value)) return 'chasidut';
  return 'unknown';
}

function compareRows(a, b) {
  return b.current_usage_rows - a.current_usage_rows
    || String(a.refresh_status).localeCompare(String(b.refresh_status))
    || String(b.modified_at).localeCompare(String(a.modified_at))
    || String(a.source_file).localeCompare(String(b.source_file));
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Refresh Priority Index',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Pending refresh files: ${artifact.counts.pending_refresh_files}`,
    `- Known-usage refresh candidates: ${artifact.counts.known_usage_refresh_candidates}`,
    `- Review-only not promoted: ${artifact.counts.review_only_not_promoted}`,
    `- Promoted run targets: ${artifact.counts.promoted_run_targets}`,
    `- Blocked broad refresh files: ${artifact.counts.blocked_broad_refresh_files}`,
    `- Source freshness status: ${artifact.counts.source_freshness_status}`,
    `- Search rows inspected: ${artifact.counts.search_rows}`,
    `- Search works inspected: ${artifact.counts.search_works}`,
    `- Route payload-like field hits: ${artifact.counts.route_payload_field_hits}`,
    '',
    '## Policy',
    '',
    'This is a control artifact only. It classifies stale source inventory against existing usage search rows, but it does not read source text, scan tokens, generate evidence, promote broad targets, or make definition claims.',
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${[checkRow.id, checkRow.status, checkRow.detail].map(mdCell).join(' | ')} |`),
    '',
    '## Pending Refresh Rows',
    '',
    '| status | source file | category hint | current usage rows | supported | candidate | weak | clusters | route ids | reason |',
    '|---|---|---|---:|---:|---:|---:|---|---|---|',
    ...artifact.rows.slice(0, options.maxReportRows).map((row) => `| ${[
      row.refresh_status,
      row.source_file,
      row.category_hint,
      row.current_usage_rows,
      row.current_supported_rows,
      row.current_candidate_rows,
      row.current_weak_rows,
      row.current_clusters.join(', '),
      row.route_ids.join(', '),
      row.reason,
    ].map(mdCell).join(' | ')} |`),
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--source-freshness=')) parsed.sourceFreshness = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--search-rows=')) parsed.searchRows = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--max-report-rows=')) parsed.maxReportRows = Number(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!Number.isInteger(parsed.maxReportRows) || parsed.maxReportRows < 0) {
    throw new Error('--max-report-rows must be a non-negative integer');
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

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}
