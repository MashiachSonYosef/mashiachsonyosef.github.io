#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const dateSlug = new Date().toISOString().slice(0, 10);
const options = {
  baseUrl: 'https://mashiachsonyosef.github.io',
  report: `reports/agent10-live-public-old-hud-guard-${dateSlug}.md`,
  json: `reports/agent10-live-public-old-hud-guard-${dateSlug}.json`,
  ...parseArgs(process.argv.slice(2)),
};

const hardOldHudMarkers = [
  'Clicked Hebrew form',
  'Best actual hit',
  'Full source and license rows',
  'Rank details',
  'No lexical entry yet.',
  'Potential options',
  'Show potential options',
  'allowLowConfidenceFallback',
  'data-hud-breakdown',
  'data-hud-renderings',
  'data-hud-potential',
  'data-hud-related',
  'data-hud-sources',
  'lexical-fields',
  'clicked_hebrew_form',
  'routeHudInlineGlossMode',
];

const watchOldHudMarkers = [
  'sourceSummary',
  'sourceSummary =',
  'sourceRowMap',
  'data-selected-gloss',
];

const currentHudMarkers = [
  'data-route-hud-panel',
  'reader-workbench.js',
  'data-lexical-token',
  'data-lexical-config',
  'data/public-hud',
  'hud_route_lookup_manifest_url',
  'reader_hint_url',
  'source-footnotes',
  'answer_eligible',
  'answer_role',
];

const publicPages = [
  { path: '/', label: 'root', requiresHud: false },
  { path: '/orot/', label: 'Orot', requiresHud: true },
  { path: '/tanakh/deuteronomy/', label: 'Deuteronomy', requiresHud: true },
  { path: '/tanakh/genesis/', label: 'Genesis', requiresHud: true },
];

const quarantinePages = [
  '/hud-preview/',
  '/hud-preview/routes/',
  '/reader-workbench/',
  '/sample/',
  '/old-hud/',
];

const works = ['orot', 'deuteronomy', 'genesis'];
const generatedAt = new Date().toISOString();
const probeId = Date.now().toString(36);
const issues = [];
const warnings = [];

const pageChecks = [];
for (const page of publicPages) {
  pageChecks.push(await checkUrl(pageUrl(page.path, { agent10_probe: probeId }), {
    kind: 'public_page',
    label: page.label,
    expectedStatus: 200,
    requiresHud: page.requiresHud,
  }));
  pageChecks.push(await checkUrl(pageUrl(page.path, {
    oldHud: '1',
    hud: 'legacy',
    routeHudInlineGlossMode: 'old',
    agent10_query_probe: probeId,
  }), {
    kind: 'old_hud_query_negative',
    label: `${page.label} old-HUD query negative`,
    expectedStatus: 200,
    requiresHud: page.requiresHud,
  }));
}

for (const quarantinePath of quarantinePages) {
  pageChecks.push(await checkUrl(pageUrl(quarantinePath, { agent10_probe: probeId }), {
    kind: 'quarantine_or_404',
    label: quarantinePath,
    expectedStatus: null,
    requiresHud: false,
  }));
}

const assetChecks = [];
for (const assetPath of ['/assets/js/reader-workbench.js', '/assets/css/reader-workbench.css']) {
  assetChecks.push(await checkUrl(pageUrl(assetPath, { agent10_asset_probe: probeId }), {
    kind: 'runtime_asset',
    label: assetPath,
    expectedStatus: 200,
    requiresHud: false,
  }));
}

const dataChecks = [];
for (const work of works) {
  const endpoints = [
    'manifest.json',
    'occurrences.json',
    'reader-hints.json',
    'route-lookup/manifest.json',
  ];
  for (const endpoint of endpoints) {
    dataChecks.push(await checkUrl(pageUrl(`/data/public-hud/${work}/${endpoint}`, { agent10_data_probe: probeId }), {
      kind: 'public_hud_data',
      label: `${work}/${endpoint}`,
      expectedStatus: 200,
      requiresHud: false,
      parseJson: endpoint.endsWith('.json'),
    }));
  }
  const routeManifest = dataChecks.find((row) => row.label === `${work}/route-lookup/manifest.json`);
  for (const shardPath of selectedShardPaths(routeManifest)) {
    dataChecks.push(await checkUrl(pageUrl(`/data/public-hud/${work}/route-lookup/${shardPath}`, { agent10_shard_probe: probeId }), {
      kind: 'public_hud_route_shard',
      label: `${work}/route-lookup/${shardPath}`,
      expectedStatus: 200,
      requiresHud: false,
      parseJson: true,
    }));
  }
}

for (const row of [...pageChecks, ...assetChecks, ...dataChecks]) {
  if (row.expected_status !== null && row.status !== row.expected_status) {
    issues.push(`${row.kind} ${row.label} returned ${row.status}, expected ${row.expected_status}`);
  }
  if (row.hard_old_marker_hits.length) {
    issues.push(`${row.kind} ${row.label} contains hard old-HUD marker(s): ${row.hard_old_marker_hits.join(', ')}`);
  }
  if (row.requires_hud && !row.current_marker_hits.includes('data-route-hud-panel')) {
    issues.push(`${row.kind} ${row.label} is missing current HUD panel marker`);
  }
  if (row.kind === 'quarantine_or_404' && row.status === 200) {
    warnings.push(`${row.label} returned 200; no hard old-HUD markers were found, but this should stay quarantined unless deliberately published`);
  }
  if (row.watch_old_marker_hits.length) {
    warnings.push(`${row.kind} ${row.label} contains watch marker(s): ${row.watch_old_marker_hits.join(', ')}`);
  }
}

const commit = git('rev-parse origin/main');
const output = {
  artifact_type: 'agent10_live_public_old_hud_guard',
  method_id: 'agent10-live-public-old-hud-guard-v1',
  generated_at: generatedAt,
  base_url: trimTrailingSlash(options.baseUrl),
  commit_or_deploy_id: commit,
  boundary: {
    evidence_only: true,
    no_qa_acceptance: true,
    no_public_runtime_acceptance: true,
    no_publication_readiness: true,
    no_definition_authority: true,
    no_usage_as_definition: true,
    browser_click_claim: false,
    scope: 'live HTTP/static exposure guard over selected public URLs, runtime assets, and public-HUD data endpoints',
  },
  summary: {
    status: issues.length ? 'failed_live_public_old_hud_guard' : (warnings.length ? 'warn_live_public_old_hud_guard' : 'passed_live_public_old_hud_guard'),
    old_hud_exposure: issues.some((issue) => issue.includes('old-HUD marker')) ? 'yes' : 'no',
    public_pages_checked: publicPages.map((row) => row.path),
    quarantine_paths_checked: quarantinePages,
    public_hud_works_checked: works,
    checks: pageChecks.length + assetChecks.length + dataChecks.length,
    hard_old_marker_hit_checks: [...pageChecks, ...assetChecks, ...dataChecks].filter((row) => row.hard_old_marker_hits.length).length,
    watch_old_marker_hit_checks: [...pageChecks, ...assetChecks, ...dataChecks].filter((row) => row.watch_old_marker_hits.length).length,
    issues: issues.length,
    warnings: warnings.length,
  },
  issues,
  warnings,
  markers: {
    hard_old_hud_markers: hardOldHudMarkers,
    watch_old_hud_markers: watchOldHudMarkers,
    current_hud_markers: currentHudMarkers,
  },
  page_checks: pageChecks,
  runtime_asset_checks: assetChecks,
  public_hud_data_checks: dataChecks,
  remaining_blocker: issues.length ? 'Resolve failed checks before using this packet as old-HUD exposure evidence.' : 'None for this bounded static live guard. Browser-click/runtime acceptance remains outside this packet.',
  what_must_not_be_accepted: [
    'QA acceptance.',
    'Validated public/runtime acceptance.',
    'Publication readiness.',
    'Source/provenance custody or acceptance.',
    'Definition authority.',
    'Usage-as-definition authority.',
    'Accepted translation text.',
    'CDN/cache closure beyond the cache-busted HTTP checks in this packet.',
  ],
};

writeJson(options.json, output);
writeReport(options.report, output);

if (issues.length) {
  console.error(`Live public old-HUD guard failed with ${issues.length} issue(s). Report: ${options.report}`);
  process.exit(1);
}

console.log(`Live public old-HUD guard complete (${output.summary.status}). Report: ${options.report}`);

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--base-url') parsed.baseUrl = argv[++index];
    else if (arg === '--report') parsed.report = cleanRelativePath(argv[++index]);
    else if (arg === '--json') parsed.json = cleanRelativePath(argv[++index]);
    else if (arg === '--help' || arg === '-h') {
      console.log('Usage: node scripts/audit_live_public_old_hud_guard.mjs [--base-url url] [--report path] [--json path]');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return parsed;
}

function pageUrl(relativePath, params = {}) {
  const url = new URL(relativePath, `${trimTrailingSlash(options.baseUrl)}/`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.href;
}

async function checkUrl(url, config) {
  const startedAt = Date.now();
  let status = 0;
  let headers = {};
  let body = '';
  let parseError = '';
  let parsedJson = null;
  try {
    const response = await fetch(url, { cache: 'no-store', redirect: 'follow' });
    status = response.status;
    headers = Object.fromEntries(response.headers.entries());
    body = await response.text();
    if (config.parseJson && response.ok) {
      try {
        parsedJson = JSON.parse(body);
      } catch (error) {
        parseError = error.message;
      }
    }
  } catch (error) {
    parseError = error.message;
  }
  const hardHits = hardOldHudMarkers.filter((marker) => body.includes(marker));
  const watchHits = watchOldHudMarkers.filter((marker) => body.includes(marker));
  const currentHits = currentHudMarkers.filter((marker) => body.includes(marker));
  return {
    kind: config.kind,
    label: config.label,
    url,
    expected_status: config.expectedStatus,
    requires_hud: Boolean(config.requiresHud),
    status,
    ok: status >= 200 && status < 400,
    bytes: Buffer.byteLength(body),
    sha256: body ? sha256(body) : '',
    content_type: headers['content-type'] || '',
    cache_control: headers['cache-control'] || '',
    last_modified: headers['last-modified'] || '',
    elapsed_ms: Date.now() - startedAt,
    hard_old_marker_hits: hardHits,
    watch_old_marker_hits: watchHits,
    current_marker_hits: currentHits,
    json_parse_error: parseError,
    json_summary: summarizeJson(parsedJson),
  };
}

function selectedShardPaths(routeManifestCheck) {
  const shards = routeManifestCheck?.json_summary?.selected_shards || [];
  return shards.map((row) => row.path).filter(Boolean);
}

function summarizeJson(value) {
  if (!value || typeof value !== 'object') return null;
  const summary = {
    keys: Object.keys(value).slice(0, 20),
  };
  if (Array.isArray(value)) {
    summary.array_length = value.length;
  }
  if (value.schema_version !== undefined) summary.schema_version = value.schema_version;
  if (value.generated_at) summary.generated_at = value.generated_at;
  if (value.published_at) summary.published_at = value.published_at;
  if (value.reader_hints_summary) summary.reader_hints_summary = value.reader_hints_summary;
  if (value.route_lookup_summary) summary.route_lookup_summary = value.route_lookup_summary;
  if (value.counts) summary.counts = value.counts;
  if (Array.isArray(value.chunks)) summary.chunk_count = value.chunks.length;
  if (Array.isArray(value.shards)) {
    summary.shard_count = value.shards.length;
    summary.selected_shards = [value.shards[0], value.shards[Math.floor(value.shards.length / 2)], value.shards[value.shards.length - 1]]
      .filter(Boolean)
      .filter((row, index, rows) => rows.findIndex((candidate) => candidate.path === row.path) === index)
      .map((row) => ({
        shard: row.shard,
        path: row.path,
        token_count: row.token_count,
        card_count: row.card_count,
        byte_length: row.byte_length,
      }));
  }
  return summary;
}

function writeJson(relativePath, data) {
  const outputPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(data, null, 2)}\n`);
}

function writeReport(relativePath, data) {
  const lines = [
    '# Agent 10 Live Public Old-HUD Guard',
    '',
    `Generated: ${data.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Evidence only; this is not QA acceptance or validated public/runtime acceptance.',
    '- Scope is live HTTP/static exposure over selected public URLs, runtime assets, and public-HUD data endpoints.',
    '- No source/provenance custody, publication readiness, Definition authority, usage-as-definition authority, or accepted text is claimed.',
    '',
    '## Required Report',
    '',
    `1. Live URL checked: \`${data.base_url}\` plus selected paths listed below.`,
    `2. Old HUD exposure: ${data.summary.old_hud_exposure.toUpperCase()}`,
    `3. Pages left public: ${data.summary.public_pages_checked.map((row) => `\`${row}\``).join(', ')}`,
    `4. Pages quarantined/checked: ${data.summary.quarantine_paths_checked.map((row) => `\`${row}\``).join(', ')}`,
    `5. Commit/deploy id: \`${data.commit_or_deploy_id}\``,
    `6. Remaining blocker: ${data.remaining_blocker}`,
    '',
    '## Summary',
    '',
    `- Status: ${data.summary.status}`,
    `- Checks: ${data.summary.checks}`,
    `- Hard old-HUD marker hit checks: ${data.summary.hard_old_marker_hit_checks}`,
    `- Watch old-HUD marker hit checks: ${data.summary.watch_old_marker_hit_checks}`,
    `- Issues: ${data.summary.issues}`,
    `- Warnings: ${data.summary.warnings}`,
    '',
    '## Public Pages',
    '',
    ...data.page_checks.map(checkLine),
    '',
    '## Runtime Assets',
    '',
    ...data.runtime_asset_checks.map(checkLine),
    '',
    '## Public-HUD Data',
    '',
    ...data.public_hud_data_checks.map(checkLine),
    '',
    '## Issues',
    '',
    ...(data.issues.length ? data.issues.map((issue) => `- ${issue}`) : ['- none']),
    '',
    '## Warnings',
    '',
    ...(data.warnings.length ? data.warnings.map((warning) => `- ${warning}`) : ['- none']),
    '',
    '## What Must Not Be Accepted',
    '',
    ...data.what_must_not_be_accepted.map((item) => `- ${item}`),
    '',
  ];
  const outputPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, lines.join('\n'));
}

function checkLine(row) {
  const markerSummary = row.hard_old_marker_hits.length ? `hard old markers=${row.hard_old_marker_hits.join(', ')}` : 'hard old markers=none';
  const watchSummary = row.watch_old_marker_hits.length ? `watch=${row.watch_old_marker_hits.join(', ')}` : 'watch=none';
  const jsonSummary = row.json_summary?.counts ? ` counts=${JSON.stringify(row.json_summary.counts)}` : '';
  return `- ${row.label}: HTTP ${row.status}; bytes=${row.bytes}; ${markerSummary}; ${watchSummary}; current=${row.current_marker_hits.join(', ') || 'none'}; sha256=\`${row.sha256}\`${jsonSummary}`;
}

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function git(args) {
  const result = spawnSync('git', args.split(' '), { cwd: root, encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim() : '';
}

function trimTrailingSlash(value) {
  return String(value || '').replace(/\/+$/g, '');
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replaceAll('\\', '/');
  if (!normalized || normalized.startsWith('/') || normalized.includes('..')) {
    throw new Error(`Unsafe relative path: ${value}`);
  }
  return normalized;
}
