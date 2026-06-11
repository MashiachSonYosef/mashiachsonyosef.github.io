#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();

const defaults = {
  report: 'reports/agent4-old-hud-exposure-report-2026-06-01.md',
  json: 'reports/agent4-old-hud-exposure-report-2026-06-01.json',
  clickReport: 'reports/agent4-old-hud-exposure-click-contract-genesis-2026-06-01.md',
  clickJson: 'reports/agent4-old-hud-exposure-click-contract-genesis-2026-06-01.json',
  accessibilityReport: 'reports/agent4-old-hud-exposure-accessibility-2026-06-01.md',
  accessibilityJson: 'reports/agent4-old-hud-exposure-accessibility-2026-06-01.json',
};

const args = parseArgs(process.argv.slice(2));
const options = {
  ...defaults,
  ...args,
};

const generatedAt = new Date().toISOString();

const currentHudMarkers = [
  'data-lexical-hud',
  'data-route-hud-panel',
  'selectRouteAnswer',
  'lookupCandidateTreatments',
  'Sources and licenses',
  'Usage evidence',
  'article.dataset.rankBasis',
  'answer_eligible',
  'answer_role',
  'source-footnotes',
  'hud_route_lookup_manifest_url',
];

const oldHudMarkers = [
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
  'source-details',
  'source-row',
  'source-claim',
  'renderSourceGroups',
  'routeSourceGroups',
  'sourceSummary =',
  'sourceRowMap',
  'routeHudInlineGlossMode',
];

const hardOldHudMarkers = [
  'Clicked Hebrew form',
  'Best actual hit',
  'Full source and license rows',
  'Rank details',
  'allowLowConfidenceFallback',
  'data-hud-breakdown',
  'data-hud-renderings',
  'data-hud-potential',
  'data-hud-related',
  'data-hud-sources',
];

const publicNavigationPaths = [
  'index.html',
  'about/index.html',
  'library/index.html',
];

const representativePages = [
  'tanakh/genesis/index.html',
  'tanakh/exodus/index.html',
  'halakhah/urim-vetumim-urim/index.html',
  'halakhah/meirat-einayim-on-shulchan-arukh-choshen-mishpat/index.html',
  'other/beer-hagolah/index.html',
  'jewish-thought/kuzari/index.html',
  'midrash/yefeh-toar-on-bereshit-rabbah/index.html',
  'targum/targum-jonathan-on-genesis/index.html',
  'mishnah/mishnah-berakhot/index.html',
  'chasidut/baal-shem-tov/index.html',
  'gra/aderet-eliyahu/index.html',
  'liturgy/siddur-sefard/index.html',
  'tosefta/brief-commentary-on-yoma/index.html',
];

const runtimeArtifacts = [
  'assets/js/reader-workbench.js',
  'assets/css/reader-workbench.css',
  'scripts/render_site.ps1',
  'scripts/validate_route_hud_page.mjs',
  'scripts/audit_route_hud_rollout_watch.mjs',
  'scripts/upgrade_route_hud_pages.mjs',
  'hud-preview/index.html',
  'hud-preview/routes/index.html',
  'hud-preview/routes/app.js',
];

const sourceInventory = loadSourceInventory();
const generatedInventory = sourceInventory.records.filter((record) => record.work_slug).map((record) => ({
  ...record,
  page_path: `${record.work_slug.replace(/^\/+|\/+$/g, '')}/index.html`,
}));

const publicHtmlPaths = discoverPublicHtml();
const generatedPageSet = new Set(generatedInventory.map((row) => row.page_path));
const publicHtmlScans = publicHtmlPaths.map(scanHtmlFile);
const generatedScans = publicHtmlScans.filter((scan) => generatedPageSet.has(scan.path));
const navigationScans = publicNavigationPaths.filter(exists).map(scanHtmlFile);
const prototypeScans = publicHtmlScans.filter((scan) => scan.path.startsWith('hud-preview/'));
const nonGeneratedPublicScans = publicHtmlScans.filter((scan) => !generatedPageSet.has(scan.path));

const routeLookupInventory = inspectRouteLookupInventory();
const runtimeInspection = inspectRuntimeArtifacts();
const signoffDrift = inspectSignoffDrift();
const controls = runControls();
const validatorResults = options.skipValidators ? [] : runValidators();

const staleGeneratedRows = generatedScans.filter((scan) => scan.old_marker_hits.length);
const hardStaleGeneratedRows = generatedScans.filter((scan) => scan.hard_old_marker_hits.length);
const missingCurrentGeneratedRows = generatedScans.filter((scan) => scan.missing_current_markers.length);
const sourceLicenseRows = generatedScans.filter((scan) => scan.current_marker_hits.includes('Sources and licenses') && scan.current_marker_hits.includes('source-footnotes'));
const prototypeOldRows = prototypeScans.filter((scan) => scan.old_marker_hits.length);
const publicNavigationOldRows = navigationScans.filter((scan) => scan.old_marker_hits.length);
const generatedPagesPresent = generatedInventory.filter((row) => exists(row.page_path));

const issues = [];
const warnings = [];

if (generatedPagesPresent.length !== generatedInventory.length) {
  issues.push(`${generatedInventory.length - generatedPagesPresent.length} generated page(s) from data/sources are missing`);
}
if (missingCurrentGeneratedRows.length) {
  issues.push(`${missingCurrentGeneratedRows.length} generated HUD page(s) missing current-HUD contract markers`);
}
if (hardStaleGeneratedRows.length) {
  issues.push(`${hardStaleGeneratedRows.length} generated HUD page(s) contain hard old-HUD markers`);
}
if (publicNavigationOldRows.length) {
  issues.push(`${publicNavigationOldRows.length} public navigation page(s) contain old-HUD markers`);
}
if (validatorResults.some((result) => result.exit_code !== 0)) {
  issues.push(`${validatorResults.filter((result) => result.exit_code !== 0).length} validator command(s) failed`);
}
if (!controls.every((control) => control.passed)) {
  issues.push(`${controls.filter((control) => !control.passed).length} calibration control(s) failed`);
}
if (prototypeOldRows.length) {
  warnings.push(`${prototypeOldRows.length} hud-preview prototype/reference page(s) carry legacy/prototype markers and must remain quarantined`);
}
if (runtimeInspection.quarantined_reference_artifacts.length) {
  warnings.push(`${runtimeInspection.quarantined_reference_artifacts.length} reference/tooling artifact(s) mention old-HUD or prototype markers but are not public runtime imports`);
}
if (runtimeInspection.reader_workbench_storage.localStorage || runtimeInspection.reader_workbench_storage.indexedDB) {
  warnings.push('Reader Workbench uses localStorage/IndexedDB for study selections; no old-HUD activation key was found, but stale client storage is not live-browser-proven here');
}

const summary = {
  status: issues.length ? 'failed_static_evidence' : (warnings.length ? 'warn_static_evidence' : 'passed_static_evidence'),
  generated_at: generatedAt,
  source_records: sourceInventory.records.length,
  source_records_with_work_slug: generatedInventory.length,
  generated_pages_expected: generatedInventory.length,
  generated_pages_present: generatedPagesPresent.length,
  public_html_candidates: publicHtmlPaths.length,
  current_hud_generated_pages: generatedScans.filter((scan) => scan.is_current_hud).length,
  generated_pages_missing_current_markers: missingCurrentGeneratedRows.length,
  generated_pages_with_any_old_marker: staleGeneratedRows.length,
  generated_pages_with_hard_old_marker: hardStaleGeneratedRows.length,
  public_navigation_pages_checked: navigationScans.length,
  public_navigation_pages_with_old_marker: publicNavigationOldRows.length,
  prototype_reference_pages_with_old_marker: prototypeOldRows.length,
  generated_pages_with_source_license_footnotes: sourceLicenseRows.length,
  route_lookup_manifest_exists: routeLookupInventory.manifest_exists,
  route_lookup_shards_listed: routeLookupInventory.shards_listed,
  route_lookup_shards_present: routeLookupInventory.shards_present,
  validator_failures: validatorResults.filter((result) => result.exit_code !== 0).length,
  issues: issues.length,
  warnings: warnings.length,
};

const output = {
  artifact_type: 'agent4_old_hud_exposure_report',
  method_id: 'SPEC-003-static-old-hud-exposure-v1',
  generated_at: generatedAt,
  spec: 'reports/spec-003-hud-runtime-validation.md',
  agent6_spec_verdict: 'reports/agent6-spec-003-hud-runtime-validation-verdict-2026-06-01.md',
  current_hud_docket: 'reports/agent6-public-hud-signoff-2026-06-01.md',
  boundary: {
    evidence_only: true,
    old_hud_status: 'quarantined_legacy_license_risk',
    current_hud_status: 'accepted_with_boundary_only_by_existing_agent6_docket',
    publication_status: 'blocked_no_render',
    no_self_acceptance: true,
    no_live_browser_click_claim: true,
    no_publication_or_translation_claim: true,
  },
  current_hud_markers: currentHudMarkers,
  old_hud_markers: oldHudMarkers,
  hard_old_hud_markers: hardOldHudMarkers,
  summary,
  issues,
  warnings,
  inventories: {
    public_navigation_paths: publicNavigationPaths,
    route_lookup: routeLookupInventory,
    source_generated_inventory: {
      source_dir: 'data/sources',
      expected_generated_pages: generatedInventory.length,
      present_generated_pages: generatedPagesPresent.length,
      missing_pages: generatedInventory.filter((row) => !exists(row.page_path)).map((row) => row.page_path).slice(0, 50),
    },
    public_html: {
      candidates_scanned: publicHtmlPaths.length,
      non_generated_public_pages: nonGeneratedPublicScans.map((scan) => scan.path).slice(0, 100),
    },
  },
  marker_counts: {
    generated_current_markers: countMarkerHits(generatedScans, currentHudMarkers),
    generated_old_markers: countMarkerHits(generatedScans, oldHudMarkers),
    generated_hard_old_markers: countMarkerHits(generatedScans, hardOldHudMarkers),
    public_navigation_old_markers: countMarkerHits(navigationScans, oldHudMarkers),
    all_public_html_old_markers: countMarkerHits(publicHtmlScans, oldHudMarkers),
  },
  exposure_rows: {
    generated_pages_missing_current_markers: missingCurrentGeneratedRows.map(compactScan).slice(0, 50),
    generated_pages_with_old_markers: staleGeneratedRows.map(compactScan).slice(0, 50),
    public_navigation_pages_with_old_markers: publicNavigationOldRows.map(compactScan),
    prototype_reference_pages_with_old_markers: prototypeOldRows.map(compactScan),
  },
  runtime_inspection: runtimeInspection,
  source_license_citation_visibility: {
    generated_pages_with_sources_and_license_marker: generatedScans.filter((scan) => scan.current_marker_hits.includes('Sources and licenses')).length,
    generated_pages_with_source_footnotes_marker: generatedScans.filter((scan) => scan.current_marker_hits.includes('source-footnotes')).length,
    generated_pages_with_both: sourceLicenseRows.length,
    route_lookup_validator: validatorResults.find((result) => result.name === 'public route lookup') || null,
  },
  route_lookup: {
    inventory: routeLookupInventory,
    validator: validatorResults.find((result) => result.name === 'public route lookup') || null,
  },
  answer_safety: {
    validator: validatorResults.find((result) => result.name === 'route answer safety') || null,
    evidence_only_boundary: 'non-answer cards must not carry answer_score; usage/evidence cards cannot become answer authority by score alone',
  },
  split_token_maqaf_hyphen: {
    validator: validatorResults.find((result) => result.name === 'Genesis click contract') || null,
    scoped_evidence: 'Genesis static click-contract prevalidation samples maqaf tokens and lookup candidates; this is not browser-click proof.',
  },
  accessibility_modal_semantics: {
    validator: validatorResults.find((result) => result.name === 'HUD accessibility static audit') || null,
  },
  usage_as_definition_negative: {
    controls: controls.filter((control) => control.category === 'usage_as_definition'),
    validators: validatorResults.filter((result) => ['public route lookup', 'route answer safety', 'representative route HUD pages'].includes(result.name)),
  },
  controls,
  signoff_drift: signoffDrift,
  deviations: [
    'Static filesystem and validator evidence only; no live browser-click proof.',
    'hud-preview prototype/reference HTML remains in the workspace and is direct-path routable if the entire repository is served; it is not linked by public navigation and is not current HUD acceptance.',
    'scripts/upgrade_route_hud_pages.mjs remains a stale migration/reference tool and is explicitly not render authority.',
    'Reader Workbench localStorage/IndexedDB state is inspected statically only; stale client storage activation is not live-tested here.',
  ],
  quarantined_surfaces: [
    ...prototypeOldRows.map((scan) => ({
      path: scan.path,
      reason: 'prototype/reference page carries legacy/prototype source-row or data-hud markers; not a current public HUD page',
      old_marker_hits: scan.old_marker_hits,
    })),
    ...runtimeInspection.quarantined_reference_artifacts,
  ],
  what_must_not_be_accepted: [
    'Old HUD public use, fallback, route exposure, runtime activation, or source-evidence capability.',
    'Publication readiness or publication-path support.',
    'Source/provenance acceptance.',
    'Live browser-click proof from this static packet.',
    'Reader Workbench broad rollout.',
    'Definition Workbench authority.',
    'Route publication support.',
    'Usage-as-definition authority.',
    'Accepted translation text.',
    'Worker evidence or this report as Agent 6 acceptance.',
  ],
  requested_agent6_verdict: 'Agent 6 pass/warn/block for this SPEC-003 old-HUD exposure evidence packet; Agent 4 does not self-accept.',
};

writeJson(options.json, output);
writeReport(options.report, output);

if (issues.length) {
  console.error(`Old-HUD exposure audit produced ${issues.length} issue(s). Report: ${options.report}`);
  process.exit(1);
}

console.log(`Old-HUD exposure audit complete (${summary.status}). Report: ${options.report}`);

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--report') parsed.report = cleanRelativePath(argv[++index]);
    else if (arg === '--json') parsed.json = cleanRelativePath(argv[++index]);
    else if (arg === '--skip-validators') parsed.skipValidators = true;
    else if (arg === '--help' || arg === '-h') parsed.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (parsed.help) {
    console.log([
      'Usage:',
      '  node scripts/audit_old_hud_exposure.mjs',
      '  node scripts/audit_old_hud_exposure.mjs --skip-validators',
    ].join('\n'));
    process.exit(0);
  }
  return parsed;
}

function loadSourceInventory() {
  const dir = path.join(root, 'data', 'sources');
  const records = [];
  if (!fs.existsSync(dir)) return { records };
  for (const fileName of fs.readdirSync(dir).filter((name) => name.endsWith('.json')).sort()) {
    const filePath = path.join(dir, fileName);
    let data = {};
    let parse_error = '';
    try {
      data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
      parse_error = error.message;
    }
    records.push({
      source_path: rel(filePath),
      work_id: data.work_id || fileName.replace(/\.json$/i, ''),
      work_slug: data.work_slug || '',
      parse_error,
    });
  }
  return { records };
}

function discoverPublicHtml() {
  const excludedDirs = new Set([
    '.git',
    '.codex-tmp',
    '.local-cache',
    'data',
    'reports',
    'scripts',
    'prompts',
    'node_modules',
  ]);
  const rows = [];
  walk(root, rows, excludedDirs);
  return rows.sort((a, b) => a.localeCompare(b));
}

function walk(dir, rows, excludedDirs) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && !['.'].includes(entry.name) && excludedDirs.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    const relative = rel(fullPath);
    const top = relative.split('/')[0];
    if (entry.isDirectory()) {
      if (excludedDirs.has(entry.name) || excludedDirs.has(top)) continue;
      walk(fullPath, rows, excludedDirs);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      rows.push(relative);
    }
  }
}

function scanHtmlFile(relativePath) {
  const text = read(relativePath);
  const currentHits = currentHudMarkers.filter((marker) => text.includes(marker));
  const oldHits = oldHudMarkers.filter((marker) => text.includes(marker));
  const hardOldHits = hardOldHudMarkers.filter((marker) => text.includes(marker));
  const isCurrentHud = text.includes('data-lexical-hud') && text.includes('hud_route_lookup_manifest_url');
  return {
    path: relativePath,
    bytes: Buffer.byteLength(text, 'utf8'),
    is_current_hud: isCurrentHud,
    current_marker_hits: currentHits,
    missing_current_markers: isCurrentHud ? currentHudMarkers.filter((marker) => !currentHits.includes(marker)) : [],
    old_marker_hits: oldHits,
    hard_old_marker_hits: hardOldHits,
    script_srcs: [...text.matchAll(/<script\s+[^>]*src="([^"]+)"/gi)].map((match) => match[1].replaceAll('&amp;', '&')),
    links: [...text.matchAll(/<a\s+[^>]*href="([^"]+)"/gi)].map((match) => match[1].replaceAll('&amp;', '&')).slice(0, 200),
  };
}

function inspectRouteLookupInventory() {
  const manifestPath = 'data/definitions/hud-route-lookup/manifest.json';
  const manifestFullPath = path.join(root, manifestPath);
  const result = {
    manifest_path: manifestPath,
    manifest_exists: fs.existsSync(manifestFullPath),
    shards_listed: 0,
    shards_present: 0,
    stale_disk_shards_not_in_manifest: 0,
    counts: {},
  };
  if (!result.manifest_exists) return result;
  const manifest = JSON.parse(fs.readFileSync(manifestFullPath, 'utf8'));
  result.counts = manifest.counts || {};
  const listed = new Set((manifest.shards || []).map((shard) => shard.path).filter(Boolean));
  result.shards_listed = listed.size;
  for (const shardPath of listed) {
    if (fs.existsSync(path.join(root, 'data', 'definitions', 'hud-route-lookup', shardPath))) result.shards_present += 1;
  }
  const shardDir = path.join(root, 'data', 'definitions', 'hud-route-lookup', 'shards');
  const diskShards = fs.existsSync(shardDir) ? fs.readdirSync(shardDir).filter((name) => name.endsWith('.json')).map((name) => `shards/${name}`) : [];
  result.stale_disk_shards_not_in_manifest = diskShards.filter((shard) => !listed.has(shard)).length;
  return result;
}

function inspectRuntimeArtifacts() {
  const publicRuntimeImports = countPublicRuntimeImports();
  const artifactRows = runtimeArtifacts.filter(exists).map((artifact) => {
    const text = read(artifact);
    return {
      path: artifact,
      bytes: Buffer.byteLength(text, 'utf8'),
      old_marker_hits: oldHudMarkers.filter((marker) => text.includes(marker)),
      hard_old_marker_hits: hardOldHudMarkers.filter((marker) => text.includes(marker)),
      contains_localStorage: /\blocalStorage\b/.test(text),
      contains_indexedDB: /\bindexedDB\b/.test(text),
      contains_query_string_activation: /URLSearchParams|location\.search|\bsearchParams\b/.test(text),
      contains_fallback: /fallback/i.test(text),
      contains_rollback: /rollback/i.test(text),
      contains_route_preview_runtime: /initRoutePreview|data-token-list|data-hud-panel/.test(text),
    };
  });
  const runtimeAsset = artifactRows.find((row) => row.path === 'assets/js/reader-workbench.js');
  return {
    public_generated_pages_importing_reader_workbench_js: publicRuntimeImports,
    public_generated_pages_importing_upgrade_route_hud_pages: countScriptImport('upgrade_route_hud_pages.mjs'),
    runtime_files_inspected: artifactRows,
    reader_workbench_storage: {
      localStorage: Boolean(runtimeAsset?.contains_localStorage),
      indexedDB: Boolean(runtimeAsset?.contains_indexedDB),
      query_string_activation: Boolean(runtimeAsset?.contains_query_string_activation),
      route_preview_fallback_runtime: Boolean(runtimeAsset?.contains_route_preview_runtime),
    },
    quarantined_reference_artifacts: artifactRows
      .filter((row) => row.path === 'scripts/upgrade_route_hud_pages.mjs' || row.path.startsWith('hud-preview/'))
      .filter((row) => row.old_marker_hits.length || row.contains_route_preview_runtime)
      .map((row) => ({
        path: row.path,
        reason: row.path === 'scripts/upgrade_route_hud_pages.mjs'
          ? 'stale migration/reference script; forbidden as render authority'
          : 'HUD prototype/reference artifact; not current public HUD acceptance',
        old_marker_hits: row.old_marker_hits,
        contains_route_preview_runtime: row.contains_route_preview_runtime,
      })),
  };
}

function inspectSignoffDrift() {
  const signoffPath = 'reports/agent6-public-hud-signoff-2026-06-01.md';
  const text = exists(signoffPath) ? read(signoffPath) : '';
  const signedCount = numberAfter(text, /Public HUD static spread checked:\s*(\d+)/i);
  return {
    signoff_path: signoffPath,
    signed_current_hud_pages: signedCount,
    current_generated_hud_pages: generatedScans.filter((scan) => scan.is_current_hud).length,
    page_count_delta: Number.isFinite(signedCount) ? generatedScans.filter((scan) => scan.is_current_hud).length - signedCount : null,
    signed_rank_basis_missing: numberAfter(text, /Pages missing `article\.dataset\.rankBasis`:\s*(\d+)/i),
    current_rank_basis_missing: generatedScans.filter((scan) => !scan.current_marker_hits.includes('article.dataset.rankBasis')).length,
    signed_rank_details_pages: numberAfter(text, /Pages containing `Rank details`:\s*(\d+)/i),
    current_rank_details_pages: generatedScans.filter((scan) => scan.old_marker_hits.includes('Rank details')).length,
    signed_clicked_hebrew_pages: numberAfter(text, /Pages containing `Clicked Hebrew form`:\s*(\d+)/i),
    current_clicked_hebrew_pages: generatedScans.filter((scan) => scan.old_marker_hits.includes('Clicked Hebrew form')).length,
  };
}

function runControls() {
  const missingRankText = '<article data-lexical-hud>Route HUD</article>';
  const oldHudText = '<section>Clicked Hebrew form Best actual hit Full source and license rows</section>';
  const sourceHiddenText = '<section data-lexical-hud>Route HUD selectRouteAnswer lookupCandidateTreatments article.dataset.rankBasis</section>';
  const usageDefinitionLeakCard = {
    route_type: 'workbench_usage',
    display_section: 'phrase_evidence',
    answer_eligible: true,
    answer_role: 'answer',
    definition: 'observed usage only',
  };
  return [
    {
      category: 'old_hud_marker',
      name: 'synthetic old-HUD markers are detected',
      passed: hardOldHudMarkers.some((marker) => oldHudText.includes(marker)),
    },
    {
      category: 'current_contract',
      name: 'synthetic current HUD without rank basis is detected',
      passed: !missingRankText.includes('article.dataset.rankBasis'),
    },
    {
      category: 'source_license_visibility',
      name: 'synthetic HUD without Sources and licenses marker is detected',
      passed: !sourceHiddenText.includes('Sources and licenses'),
    },
    {
      category: 'usage_as_definition',
      name: 'synthetic usage evidence answer leak is detected',
      passed: usageEvidenceRouteTypes().has(usageDefinitionLeakCard.route_type)
        && usageDefinitionLeakCard.answer_eligible === true
        && usageDefinitionLeakCard.answer_role === 'answer',
      expected_result: 'detected_bad_control',
    },
  ].map((row) => ({ ...row, passed: row.expected_result === 'detected_bad_control' ? row.passed : Boolean(row.passed) }));
}

function usageEvidenceRouteTypes() {
  return new Set([
    'usage_evidence',
    'workbench_usage',
    'workbench_usage_evidence',
    'workbench_usage_commentary',
    'biblical_workbench',
    'biblical_workbench_usage',
    'source_workbench_usage',
    'observed_usage',
  ]);
}

function runValidators() {
  const results = [];
  results.push(runCommand('public route lookup', ['node', 'scripts/validate_public_hud_route_lookup.mjs', '--skip-release-stamp']));
  results.push(runCommand('route answer safety', ['node', 'scripts/validate_route_answer_safety.mjs']));
  results.push(runCommand('representative route HUD pages', ['node', 'scripts/validate_route_hud_page.mjs', ...representativePages.flatMap((page) => ['--page', page])]));
  results.push(runCommand('Genesis click contract', [
    'node',
    'scripts/audit_route_hud_click_contract.mjs',
    '--page',
    'tanakh/genesis/index.html',
    '--report',
    options.clickReport,
    '--json',
    options.clickJson,
    '--sample-limit',
    '36',
  ]));
  results.push(runCommand('HUD accessibility static audit', [
    'node',
    'scripts/audit_route_hud_accessibility.mjs',
    '--pages',
    'tanakh/genesis/index.html,halakhah/urim-vetumim-urim/index.html,other/beer-hagolah/index.html,targum/targum-jonathan-on-genesis/index.html',
    '--report',
    options.accessibilityReport,
    '--json',
    options.accessibilityJson,
  ]));
  return results;
}

function runCommand(name, command) {
  const result = spawnSync(command[0], command.slice(1), {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });
  return {
    name,
    command: command.join(' '),
    exit_code: result.status ?? 1,
    stdout: trimCommandOutput(result.stdout),
    stderr: trimCommandOutput(result.stderr),
  };
}

function trimCommandOutput(value) {
  const text = String(value || '').trim();
  if (text.length <= 5000) return text;
  return `${text.slice(0, 4500)}\n... [truncated ${text.length - 4500} chars]`;
}

function countPublicRuntimeImports() {
  return generatedScans.filter((scan) => scan.script_srcs.some((src) => src.includes('assets/js/reader-workbench.js'))).length;
}

function countScriptImport(name) {
  return generatedScans.filter((scan) => scan.script_srcs.some((src) => src.includes(name))).length;
}

function compactScan(scan) {
  return {
    path: scan.path,
    is_current_hud: scan.is_current_hud,
    old_marker_hits: scan.old_marker_hits,
    hard_old_marker_hits: scan.hard_old_marker_hits,
    missing_current_markers: scan.missing_current_markers,
  };
}

function writeReport(relativePath, data) {
  const lines = [
    '# Agent 4 SPEC-003 Old-HUD Exposure Report',
    '',
    `Generated: ${data.generated_at}`,
    '',
    '## Verdict Request',
    '',
    '- Requested Agent 6 action: pass / warn / block this SPEC-003 old-HUD exposure packet.',
    '- Agent 4 does not self-accept this packet.',
    '- Old HUD remains `quarantined_legacy_license_risk`.',
    '- Publication remains `blocked_no_render`.',
    '- This is static filesystem and validator evidence only, not live browser-click proof.',
    '',
    '## Summary',
    '',
    `- Status: ${data.summary.status}`,
    `- Generated source pages expected/present: ${data.summary.generated_pages_expected} / ${data.summary.generated_pages_present}`,
    `- Current HUD generated pages: ${data.summary.current_hud_generated_pages}`,
    `- Generated pages missing current markers: ${data.summary.generated_pages_missing_current_markers}`,
    `- Generated pages with hard old-HUD markers: ${data.summary.generated_pages_with_hard_old_marker}`,
    `- Public navigation pages with old-HUD markers: ${data.summary.public_navigation_pages_with_old_marker}`,
    `- Prototype/reference pages with old/prototype markers: ${data.summary.prototype_reference_pages_with_old_marker}`,
    `- Generated pages with source/license footnotes: ${data.summary.generated_pages_with_source_license_footnotes}`,
    `- Route lookup shards listed/present: ${data.summary.route_lookup_shards_listed} / ${data.summary.route_lookup_shards_present}`,
    `- Validator failures: ${data.summary.validator_failures}`,
    `- Issues: ${data.summary.issues}`,
    `- Warnings: ${data.summary.warnings}`,
    '',
    '## Required Evidence',
    '',
    `- Current HUD docket: \`${data.current_hud_docket}\``,
    `- SPEC-003: \`${data.spec}\``,
    `- Agent 6 SPEC-003 verdict: \`${data.agent6_spec_verdict}\``,
    `- Public navigation paths checked: ${data.inventories.public_navigation_paths.map((item) => `\`${item}\``).join(', ')}`,
    `- Runtime files inspected: ${data.runtime_inspection.runtime_files_inspected.map((row) => `\`${row.path}\``).join(', ')}`,
    `- Route lookup manifest: \`${data.route_lookup.inventory.manifest_path}\``,
    `- Representative route-HUD pages: ${representativePages.map((item) => `\`${item}\``).join(', ')}`,
    '',
    '## Marker Counts',
    '',
    markerTable('Generated current-HUD markers', data.marker_counts.generated_current_markers),
    '',
    markerTable('Generated old-HUD markers', data.marker_counts.generated_old_markers),
    '',
    markerTable('Public-navigation old-HUD markers', data.marker_counts.public_navigation_old_markers),
    '',
    markerTable('All public-HTML old/prototype markers', data.marker_counts.all_public_html_old_markers),
    '',
    '## Runtime / Fallback / Storage',
    '',
    `- Generated pages importing \`assets/js/reader-workbench.js\`: ${data.runtime_inspection.public_generated_pages_importing_reader_workbench_js}`,
    `- Generated pages importing \`scripts/upgrade_route_hud_pages.mjs\`: ${data.runtime_inspection.public_generated_pages_importing_upgrade_route_hud_pages}`,
    `- Reader Workbench localStorage: ${data.runtime_inspection.reader_workbench_storage.localStorage}`,
    `- Reader Workbench IndexedDB: ${data.runtime_inspection.reader_workbench_storage.indexedDB}`,
    `- Query-string activation markers in current runtime: ${data.runtime_inspection.reader_workbench_storage.query_string_activation}`,
    `- Route-preview fallback runtime in current asset: ${data.runtime_inspection.reader_workbench_storage.route_preview_fallback_runtime}`,
    '- Interpretation: storage is for study-sheet selections; this packet found no query/localStorage/IndexedDB switch that activates old HUD, but stale client bundles/storage are not live-browser-proven here.',
    '',
    '## Validator Results',
    '',
    ...(data.route_lookup.validator ? validatorLines(data.route_lookup.validator) : ['- Public route lookup validator: skipped']),
    ...(data.answer_safety.validator ? validatorLines(data.answer_safety.validator) : ['- Route answer safety validator: skipped']),
    ...(data.split_token_maqaf_hyphen.validator ? validatorLines(data.split_token_maqaf_hyphen.validator) : ['- Genesis click contract audit: skipped']),
    ...(data.accessibility_modal_semantics.validator ? validatorLines(data.accessibility_modal_semantics.validator) : ['- Accessibility static audit: skipped']),
    ...(data.usage_as_definition_negative.validators.find((row) => row.name === 'representative route HUD pages') ? validatorLines(data.usage_as_definition_negative.validators.find((row) => row.name === 'representative route HUD pages')) : ['- Representative route-HUD page validation: skipped']),
    '',
    '## Source / License / Citation Visibility',
    '',
    `- Generated pages with \`Sources and licenses\`: ${data.source_license_citation_visibility.generated_pages_with_sources_and_license_marker}`,
    `- Generated pages with \`source-footnotes\`: ${data.source_license_citation_visibility.generated_pages_with_source_footnotes_marker}`,
    `- Generated pages with both: ${data.source_license_citation_visibility.generated_pages_with_both}`,
    '- Route lookup validator checks source rows in public route cards; see validator result above.',
    '',
    '## Split Token / Maqaf / Hyphen',
    '',
    `- Scoped evidence: ${data.split_token_maqaf_hyphen.scoped_evidence}`,
    `- Click-contract report: \`${options.clickReport}\``,
    '',
    '## Usage-As-Definition Negative Test',
    '',
    `- Boundary: ${data.answer_safety.evidence_only_boundary}`,
    ...data.usage_as_definition_negative.controls.map((row) => `- Control ${row.passed ? 'passed' : 'failed'}: ${row.name}`),
    '',
    '## Positive And Negative Controls',
    '',
    ...data.controls.map((row) => `- ${row.passed ? 'pass' : 'fail'} / ${row.category}: ${row.name}`),
    '',
    '## Drift From Agent 6 Public HUD Signoff',
    '',
    `- Prior signed current HUD pages: ${data.signoff_drift.signed_current_hud_pages}`,
    `- Current generated HUD pages: ${data.signoff_drift.current_generated_hud_pages}`,
    `- Page-count delta: ${data.signoff_drift.page_count_delta}`,
    `- Prior/current missing rank-basis pages: ${data.signoff_drift.signed_rank_basis_missing} / ${data.signoff_drift.current_rank_basis_missing}`,
    `- Prior/current Rank details pages: ${data.signoff_drift.signed_rank_details_pages} / ${data.signoff_drift.current_rank_details_pages}`,
    `- Prior/current Clicked Hebrew form pages: ${data.signoff_drift.signed_clicked_hebrew_pages} / ${data.signoff_drift.current_clicked_hebrew_pages}`,
    '',
    '## Deviations',
    '',
    ...data.deviations.map((item) => `- ${item}`),
    '',
    '## Quarantined Surfaces',
    '',
    ...(data.quarantined_surfaces.length
      ? data.quarantined_surfaces.map((row) => `- \`${row.path}\`: ${row.reason}; markers=${(row.old_marker_hits || []).join(', ') || 'none'}`)
      : ['- none']),
    '',
    '## Issues',
    '',
    ...(data.issues.length ? data.issues.map((item) => `- ${item}`) : ['- none']),
    '',
    '## Warnings',
    '',
    ...(data.warnings.length ? data.warnings.map((item) => `- ${item}`) : ['- none']),
    '',
    '## What Must Not Be Accepted',
    '',
    ...data.what_must_not_be_accepted.map((item) => `- ${item}`),
    '',
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function markerTable(title, counts) {
  const nonZero = Object.entries(counts).filter(([, count]) => count);
  if (!nonZero.length) return `### ${title}\n\n- none`;
  return [
    `### ${title}`,
    '',
    '| marker | page count |',
    '|---|---:|',
    ...nonZero.map(([marker, count]) => `| \`${escapePipes(marker)}\` | ${count} |`),
  ].join('\n');
}

function validatorLines(result) {
  const lines = [
    `- ${result.name}: ${result.exit_code === 0 ? 'pass' : 'fail'} (exit ${result.exit_code})`,
    `  Command: \`${result.command}\``,
  ];
  const lastLine = result.stdout.split('\n').filter(Boolean).slice(-1)[0] || result.stderr.split('\n').filter(Boolean).slice(-1)[0] || '';
  if (lastLine) lines.push(`  Output: ${lastLine}`);
  return lines;
}

function numberAfter(text, regex) {
  const match = String(text || '').match(regex);
  return match ? Number(match[1]) : null;
}

function countMarkerHits(scans, markers) {
  const counts = Object.fromEntries(markers.map((marker) => [marker, 0]));
  for (const scan of scans) {
    const text = read(scan.path);
    for (const marker of markers) {
      if (text.includes(marker)) counts[marker] += 1;
    }
  }
  return counts;
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, cleanRelativePath(relativePath)));
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8');
}

function writeJson(relativePath, data) {
  writeText(relativePath, `${JSON.stringify(data, null, 2)}\n`);
}

function writeText(relativePath, text) {
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, text, 'utf8');
}

function rel(fullPath) {
  return path.relative(root, fullPath).replaceAll(path.sep, '/');
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replaceAll('\\', '/').replace(/^\/+/, '');
  if (!normalized || normalized.includes('..')) throw new Error(`Unsafe relative path: ${value}`);
  return normalized;
}

function escapePipes(value) {
  return String(value).replaceAll('|', '\\|');
}
