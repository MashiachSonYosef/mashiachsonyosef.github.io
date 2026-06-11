#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const options = {
  report: 'reports/agent4-old-hud-dynamic-fallback-exposure-report-2026-06-01.md',
  json: 'reports/agent4-old-hud-dynamic-fallback-exposure-report-2026-06-01.json',
  validatorEvidence: 'reports/agent4-old-hud-dynamic-validator-evidence-2026-06-01.md',
  clickReport: 'reports/agent4-old-hud-dynamic-click-contract-genesis-2026-06-01.md',
  clickJson: 'reports/agent4-old-hud-dynamic-click-contract-genesis-2026-06-01.json',
  ...parseArgs(process.argv.slice(2)),
};

const oldHudMarkers = [
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
  'sourceSummary =',
];

const currentHudMarkers = [
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

const navigationRoots = [
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

const generatedAt = new Date().toISOString();
const runtimePath = 'assets/js/reader-workbench.js';
const runtimeText = read(runtimePath);
const runtimeHash = sha256(runtimeText);
const sourceInventory = loadSourceInventory();
const generatedPages = sourceInventory
  .filter((row) => row.work_slug)
  .map((row) => `${row.work_slug.replace(/^\/+|\/+$/g, '')}/index.html`);
const generatedPageScans = generatedPages.map(scanGeneratedPage);
const navigationClickSimulation = simulateNavigationClicks();
const runtimeImports = inspectRuntimeImports(generatedPageScans);
const fallbackRollback = inspectFallbackRollback();
const dynamicRuntimeControls = await runDynamicRuntimeControls();
const validators = options.includeValidators ? runValidators() : externalValidatorPlaceholders();
const staleBundleRisk = inspectStaleBundleRisk(generatedPageScans);
const routeInventory = inspectRouteInventory();
const markerCounts = {
  generated_current_markers: countMarkerHits(generatedPageScans, currentHudMarkers),
  generated_old_markers: countMarkerHits(generatedPageScans, oldHudMarkers),
  navigation_old_markers: countMarkerHits(navigationClickSimulation.resolved_targets.filter((row) => row.exists), oldHudMarkers),
};
const signoffDrift = inspectSignoffDrift();

const issues = [];
const warnings = [];

if (generatedPageScans.some((row) => row.old_marker_hits.length)) {
  issues.push(`${generatedPageScans.filter((row) => row.old_marker_hits.length).length} generated page(s) contain searched old-HUD markers`);
}
if (navigationClickSimulation.targets_with_old_markers.length) {
  issues.push(`${navigationClickSimulation.targets_with_old_markers.length} public navigation target(s) contain searched old-HUD markers`);
}
if (runtimeImports.generated_pages_importing_upgrade_tool) {
  issues.push(`${runtimeImports.generated_pages_importing_upgrade_tool} generated page(s) import stale upgrade_route_hud_pages.mjs`);
}
if (!dynamicRuntimeControls.every((row) => row.passed)) {
  issues.push(`${dynamicRuntimeControls.filter((row) => !row.passed).length} dynamic runtime control(s) failed`);
}
if (validators.some((row) => Number.isInteger(row.exit_code) && row.exit_code !== 0)) {
  issues.push(`${validators.filter((row) => row.exit_code !== 0).length} validator(s) failed`);
}
if (fallbackRollback.preview_runtime_exists) {
  warnings.push('reader-workbench.js contains initRoutePreview fallback for HUD preview/reference pages; generated source pages satisfy initSite prerequisites, but preview fallback remains quarantined');
}
if (fallbackRollback.stale_upgrade_tool_exists) {
  warnings.push('scripts/upgrade_route_hud_pages.mjs remains in workspace as stale reference tooling and must not be used as render authority');
}
if (staleBundleRisk.generated_imports_without_cache_buster) {
  warnings.push(`${staleBundleRisk.generated_imports_without_cache_buster} generated page(s) import reader-workbench.js without an observable cache-busting query string`);
}

const summary = {
  status: issues.length ? 'failed_dynamic_fallback_evidence' : (warnings.length ? 'warn_dynamic_fallback_evidence' : 'passed_dynamic_fallback_evidence'),
  generated_at: generatedAt,
  generated_pages_expected: generatedPages.length,
  generated_pages_present: generatedPageScans.filter((row) => row.exists).length,
  generated_pages_with_old_markers: generatedPageScans.filter((row) => row.old_marker_hits.length).length,
  generated_pages_importing_reader_workbench: runtimeImports.generated_pages_importing_reader_workbench,
  generated_pages_importing_upgrade_tool: runtimeImports.generated_pages_importing_upgrade_tool,
  public_navigation_roots_checked: navigationRoots.length,
  public_navigation_links_resolved: navigationClickSimulation.resolved_targets.length,
  public_navigation_targets_with_old_markers: navigationClickSimulation.targets_with_old_markers.length,
  dynamic_runtime_controls: dynamicRuntimeControls.length,
  dynamic_runtime_control_failures: dynamicRuntimeControls.filter((row) => !row.passed).length,
  validator_failures: validators.filter((row) => Number.isInteger(row.exit_code) && row.exit_code !== 0).length,
  generated_pages_missing_current_markers: generatedPageScans.filter((row) => row.exists && row.missing_current_markers.length).length,
  issues: issues.length,
  warnings: warnings.length,
};

const output = {
  artifact_type: 'agent4_old_hud_dynamic_fallback_exposure_report',
  method_id: 'SPEC-003-simulated-runtime-fallback-v1',
  generated_at: generatedAt,
  boundary: {
    evidence_only: true,
    no_self_acceptance: true,
    no_live_browser_click_claim: true,
    simulation_level: 'node_vm_runtime_controls_and_static_navigation_resolution',
    publication_status: 'blocked_no_render',
    old_hud_status: 'quarantined_legacy_license_risk',
  },
  source_dockets: {
    spec_003: 'reports/spec-003-hud-runtime-validation.md',
    agent6_spec_003_verdict: 'reports/agent6-spec-003-hud-runtime-validation-verdict-2026-06-01.md',
    agent6_static_quarantine_docket: 'reports/agent6-old-hud-static-quarantine-docket-2026-06-01.md',
    current_public_hud_signoff: 'reports/agent6-public-hud-signoff-2026-06-01.md',
  },
  summary,
  issues,
  warnings,
  validator_evidence_report: options.validatorEvidence,
  current_hud_markers: currentHudMarkers,
  old_hud_markers: oldHudMarkers,
  marker_counts: markerCounts,
  drift_from_current_hud_docket: signoffDrift,
  public_navigation_clicks: navigationClickSimulation,
  route_index_generated_inventory: {
    source_records: sourceInventory.length,
    generated_pages_expected: generatedPages.length,
    generated_pages_present: generatedPageScans.filter((row) => row.exists).length,
    generated_pages_with_old_markers: generatedPageScans.filter((row) => row.old_marker_hits.length).map((row) => row.page).slice(0, 50),
    route_lookup: routeInventory,
  },
  runtime_imports: runtimeImports,
  fallback_rollback_activation: fallbackRollback,
  query_string_behavior: dynamicRuntimeControls.filter((row) => row.scope === 'query_string'),
  localStorage_behavior: dynamicRuntimeControls.filter((row) => row.scope === 'localStorage'),
  indexedDB_behavior: dynamicRuntimeControls.filter((row) => row.scope === 'indexedDB'),
  source_license_citation_visibility: {
    generated_pages_with_sources_and_licenses: generatedPageScans.filter((row) => row.has_sources_and_licenses).length,
    generated_pages_with_source_footnotes: generatedPageScans.filter((row) => row.has_source_footnotes).length,
    public_route_lookup_validator: validators.find((row) => row.name === 'public route lookup') || null,
  },
  route_lookup: {
    inventory: routeInventory,
    validator: validators.find((row) => row.name === 'public route lookup') || null,
  },
  answer_safety: {
    dynamic_controls: dynamicRuntimeControls.filter((row) => row.scope === 'answer_safety' || row.scope === 'usage_as_definition'),
    validator: validators.find((row) => row.name === 'route answer safety') || null,
  },
  split_token_maqaf_hyphen: {
    validator: validators.find((row) => row.name === 'Genesis click contract') || null,
    scope: 'static click-contract prevalidation over Genesis samples; no live browser click claim',
  },
  usage_as_definition_negative_test: {
    dynamic_controls: dynamicRuntimeControls.filter((row) => row.scope === 'usage_as_definition'),
    expected_behavior: 'usage/workbench/evidence cards cannot become selected Definition answers even with high scores or answer-like roles',
  },
  positive_controls: dynamicRuntimeControls.filter((row) => row.control_type === 'positive'),
  negative_controls: dynamicRuntimeControls.filter((row) => row.control_type === 'negative'),
  stale_bundle_deployment_risk: staleBundleRisk,
  deviations: [
    'No Playwright/jsdom dependency is installed in this repo, so this packet uses Node vm runtime controls and static click-path resolution.',
    'Public navigation clicks are simulated by resolving href targets from public navigation roots, not by a live browser.',
    'Query/localStorage/IndexedDB controls execute exported runtime functions in a fake browser context; this is not deployment/CDN proof.',
    'The route preview fallback exists for `hud-preview` reference pages and is not accepted as a public fallback.',
    'Cache/stale bundle risk is observable only from script src/hash/mtime; no CDN or HTTP cache headers are available from file evidence.',
  ],
  quarantined_surfaces: [
    {
      path: 'hud-preview/',
      reason: 'prototype/reference surface with route preview fallback; not current public HUD acceptance',
    },
    {
      path: 'scripts/upgrade_route_hud_pages.mjs',
      reason: 'stale migration reference; not render authority and not imported by generated pages',
    },
  ],
  what_must_not_be_accepted: [
    'Old-HUD public use, fallback, route exposure, runtime activation, or source-evidence capability.',
    'Public/runtime acceptance or broad rollout.',
    'Live browser-click proof.',
    'Source/provenance acceptance.',
    'Publication readiness or publication-path support.',
    'Reader Workbench broad rollout.',
    'Definition Workbench authority.',
    'Route publication support.',
    'Usage-as-definition authority.',
    'Accepted translation text.',
    'This Agent 4 packet as Agent 6 acceptance.',
  ],
  validators,
};

writeJson(options.json, output);
writeReport(options.report, output);

if (issues.length) {
  console.error(`Dynamic old-HUD exposure audit produced ${issues.length} issue(s). Report: ${options.report}`);
  process.exit(1);
}

console.log(`Dynamic old-HUD exposure audit complete (${summary.status}). Report: ${options.report}`);
process.exit(0);

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--report') parsed.report = cleanRelativePath(argv[++index]);
    else if (arg === '--json') parsed.json = cleanRelativePath(argv[++index]);
    else if (arg === '--validator-evidence') parsed.validatorEvidence = cleanRelativePath(argv[++index]);
    else if (arg === '--click-report') parsed.clickReport = cleanRelativePath(argv[++index]);
    else if (arg === '--click-json') parsed.clickJson = cleanRelativePath(argv[++index]);
    else if (arg === '--include-validators') parsed.includeValidators = true;
    else if (arg === '--help' || arg === '-h') parsed.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (parsed.help) {
    console.log('Usage: node scripts/audit_old_hud_dynamic_fallback.mjs');
    process.exit(0);
  }
  return parsed;
}

function simulateNavigationClicks() {
  const roots = navigationRoots.filter(exists).map((page) => {
    const html = read(page);
    const links = [...html.matchAll(/<a\s+[^>]*href="([^"]+)"/gi)]
      .map((match) => match[1].replaceAll('&amp;', '&'))
      .filter((href) => href && !href.startsWith('#') && !/^(https?:|mailto:|tel:)/i.test(href));
    return { page, links };
  });
  const resolved = [];
  const unresolved = [];
  const seen = new Set();
  for (const rootPage of roots) {
    for (const href of rootPage.links) {
      const target = resolveHref(rootPage.page, href);
      if (!target) {
        unresolved.push({ from: rootPage.page, href, reason: 'external_or_unsafe' });
        continue;
      }
      if (seen.has(`${rootPage.page}|${href}|${target}`)) continue;
      seen.add(`${rootPage.page}|${href}|${target}`);
      const existsOnDisk = exists(target);
      const oldHits = existsOnDisk ? oldHudMarkers.filter((marker) => read(target).includes(marker)) : [];
      resolved.push({ from: rootPage.page, href, target, exists: existsOnDisk, old_marker_hits: oldHits });
    }
  }
  return {
    roots,
    resolved_targets: resolved,
    unresolved_targets: unresolved,
    targets_with_old_markers: resolved.filter((row) => row.old_marker_hits.length),
    targets_to_quarantined_preview: resolved.filter((row) => row.target.startsWith('hud-preview/')),
  };
}

function inspectRuntimeImports(scans) {
  const generatedPagesImportingReader = scans.filter((row) => row.script_srcs.some((src) => src.includes('assets/js/reader-workbench.js')));
  const generatedPagesImportingUpgrade = scans.filter((row) => row.script_srcs.some((src) => src.includes('upgrade_route_hud_pages.mjs')));
  const uniqueReaderSrcs = [...new Set(generatedPagesImportingReader.flatMap((row) => row.script_srcs.filter((src) => src.includes('reader-workbench.js'))))].sort();
  return {
    runtime_path: runtimePath,
    runtime_sha256: runtimeHash,
    generated_pages_importing_reader_workbench: generatedPagesImportingReader.length,
    generated_pages_importing_upgrade_tool: generatedPagesImportingUpgrade.length,
    unique_reader_workbench_srcs: uniqueReaderSrcs,
    generated_pages_without_reader_runtime: scans.filter((row) => row.exists && !row.script_srcs.some((src) => src.includes('assets/js/reader-workbench.js'))).map((row) => row.page).slice(0, 50),
  };
}

function inspectFallbackRollback() {
  const renderText = exists('scripts/render_site.ps1') ? read('scripts/render_site.ps1') : '';
  const upgradeText = exists('scripts/upgrade_route_hud_pages.mjs') ? read('scripts/upgrade_route_hud_pages.mjs') : '';
  const previewPages = ['hud-preview/index.html', 'hud-preview/routes/index.html', 'hud-preview/routes/app.js']
    .filter(exists)
    .map((page) => ({ path: page, old_marker_hits: oldHudMarkers.filter((marker) => read(page).includes(marker)) }));
  return {
    preview_runtime_exists: /initRoutePreview|data-token-list|data-hud-panel/.test(runtimeText),
    generated_pages_missing_init_site_prerequisites: generatedPageScans
      .filter((row) => row.exists && (!row.has_lexical_config || !row.has_lexical_occurrences || !row.has_lexical_hud))
      .map((row) => row.page).slice(0, 50),
    render_script_fallback_note: /Fallback render active/i.test(renderText),
    render_script_old_hud_markers: oldHudMarkers.filter((marker) => renderText.includes(marker)),
    stale_upgrade_tool_exists: exists('scripts/upgrade_route_hud_pages.mjs'),
    stale_upgrade_tool_old_markers: oldHudMarkers.filter((marker) => upgradeText.includes(marker)),
    preview_reference_artifacts: previewPages,
    rollback_terms_in_runtime: /rollback/i.test(runtimeText),
    fallback_terms_in_runtime: /fallback/i.test(runtimeText),
  };
}

async function runDynamicRuntimeControls() {
  const controls = [];
  const baseSandbox = createRuntimeSandbox('file:///C:/public/tanakh/genesis/index.html?oldHud=1&routeHudInlineGlossMode=old&hud=legacy', { indexedDB: true });
  const api = baseSandbox.window.ReaderWorkbench;
  const sourceRows = [{
    source_name: 'Control source',
    source_id: 'control-source-1',
    source_url: 'https://example.invalid/source',
    license: 'CC0',
    license_url: 'https://creativecommons.org/publicdomain/zero/1.0/',
  }];
  const answerCard = {
    card_id: 'answer-low',
    display_section: 'lemma',
    route_type: 'lemma',
    route_family: 'test',
    definition: 'safe answer',
    answer_eligible: true,
    answer_role: 'answer',
    adjusted_score: 50,
    source_rows: sourceRows,
  };
  const evidenceCard = {
    card_id: 'usage-high',
    display_section: 'phrase_evidence',
    route_type: 'workbench_usage',
    route_family: 'workbench_usage',
    usage_note: 'observed context',
    frame_label: 'control frame',
    linked_route_definition: '',
    definition: 'must not become definition',
    answer_eligible: true,
    answer_role: 'answer',
    adjusted_score: 100,
    source_rows: sourceRows,
  };
  const answerSelection = api.selectRouteAnswer([evidenceCard, answerCard]);
  controls.push({
    scope: 'usage_as_definition',
    control_type: 'negative',
    name: 'high-score usage evidence cannot become selected Definition answer',
    passed: answerSelection.answerCard?.card_id === 'answer-low',
    observed: answerSelection,
  });
  controls.push({
    scope: 'answer_safety',
    control_type: 'positive',
    name: 'answer-eligible non-usage card can become selected Definition answer',
    passed: answerSelection.answerState === 'definition' && answerSelection.answerCard?.card_id === 'answer-low',
    observed: answerSelection,
  });
  controls.push({
    scope: 'query_string',
    control_type: 'negative',
    name: 'old-HUD-looking query string does not expose old-HUD API or marker output',
    passed: !baseSandbox.window.location.search.includes('') ? false : !baseSandbox.output().includesAnyOldMarker && Object.keys(baseSandbox.window.ReaderWorkbench).every((key) => !/old|legacy/i.test(key)),
    observed: {
      search: baseSandbox.window.location.search,
      exported_api_keys: Object.keys(baseSandbox.window.ReaderWorkbench),
      output_contains_old_marker: baseSandbox.output().old_marker_hits,
    },
  });

  const validSelection = makeSelection({ sourceRows });
  const badPublication = { artifact_type: 'gloss_assembly', publication_status: 'accepted_translation', selections: [validSelection] };
  const evidenceOnly = { artifact_type: 'gloss_assembly', publication_status: 'not_a_translation', selections: [makeSelection({ sourceRows, answerEligible: false, answerRole: 'evidence' })] };
  const missingSources = { artifact_type: 'gloss_assembly', publication_status: 'not_a_translation', selections: [makeSelection({ sourceRows: [] })] };
  const validAssembly = { artifact_type: 'gloss_assembly', publication_status: 'not_a_translation', selections: [validSelection] };
  controls.push(await importControl('localStorage', 'negative', 'top-level publication_status other than not_a_translation is rejected', badPublication, false));
  controls.push(await importControl('localStorage', 'negative', 'evidence-only imported selection is rejected', evidenceOnly, false));
  controls.push(await importControl('localStorage', 'negative', 'imported selection missing source/license rows is rejected', missingSources, false));
  controls.push(await importControl('localStorage', 'positive', 'valid not_a_translation answer selection with source/license rows is accepted into local storage', validAssembly, true));

  const indexedSandbox = createRuntimeSandbox('file:///C:/public/tanakh/genesis/index.html', { indexedDB: true, localStorageThrows: true });
  return controls.concat(await indexedImportControls(indexedSandbox, validAssembly));
}

async function importControl(scope, controlType, name, data, shouldPass) {
  const sandbox = createRuntimeSandbox('file:///C:/public/tanakh/genesis/index.html', { indexedDB: false });
  return runImportControl(sandbox, scope, controlType, name, data, shouldPass);
}

async function indexedImportControls(sandbox, validAssembly) {
  const row = await runImportControl(sandbox, 'indexedDB', 'positive', 'valid selection still imports when localStorage throws and IndexedDB is available', validAssembly, true);
  await new Promise((resolve) => setTimeout(resolve, 20));
  row.observed.indexeddb_writes = sandbox.indexedDbWrites;
  row.passed = row.passed && sandbox.indexedDbWrites.length > 0;
  return [row];
}

async function runImportControl(sandbox, scope, controlType, name, data, shouldPass) {
  let accepted = false;
  let error = '';
  try {
    const result = await sandbox.window.ReaderWorkbench.importStudySheetData(data);
    accepted = Boolean(result);
  } catch (caught) {
    error = caught.message;
  }
  return {
    scope,
    control_type: controlType,
    name,
    passed: shouldPass ? accepted : (!accepted && Boolean(error)),
    observed: {
      accepted,
      error,
      localStorage_keys: sandbox.localStorageKeys(),
      localStorage_contains_old_marker: sandbox.output().old_marker_hits,
    },
  };
}

function makeSelection({ sourceRows, answerEligible = true, answerRole = 'answer' }) {
  return {
    schema_version: 1,
    artifact_type: 'gloss_selection',
    selection_id: 'control-selection-1',
    work_id: 'genesis',
    unit_id: 'Genesis_1_1',
    source_ref: 'Genesis 1:1',
    surface_occurrence_id: 'occ-control',
    surface_token_id: 'tok-control',
    surface_token_key: 'ברא',
    surface_text: 'ברא',
    normalized: 'ברא',
    selected_card_id: 'answer-low',
    selected_definition: 'safe answer',
    answer_eligible: answerEligible,
    answer_role: answerRole,
    confidence_percent: 90,
    source_rows: sourceRows,
    study_status: 'draft',
    publication_status: 'not_a_translation',
    created_at: generatedAt,
    updated_at: generatedAt,
  };
}

function createRuntimeSandbox(href, { indexedDB = false, localStorageThrows = false } = {}) {
  const storage = new Map();
  const indexedDbWrites = [];
  const window = {};
  const document = {
    readyState: 'loading',
    body: fakeElement('body'),
    baseURI: href,
    addEventListener() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    createElement: fakeElement,
    getElementById() { return null; },
  };
  const localStorage = {
    getItem(key) {
      if (localStorageThrows) throw new Error('localStorage unavailable');
      return storage.has(key) ? storage.get(key) : null;
    },
    setItem(key, value) {
      if (localStorageThrows) throw new Error('localStorage unavailable');
      storage.set(key, String(value));
    },
    removeItem(key) {
      if (localStorageThrows) throw new Error('localStorage unavailable');
      storage.delete(key);
    },
  };
  window.document = document;
  window.location = new URL(href);
  window.localStorage = localStorage;
  window.console = console;
  window.setTimeout = setTimeout;
  window.requestAnimationFrame = (callback) => setTimeout(callback, 0);
  if (indexedDB) window.indexedDB = fakeIndexedDb(indexedDbWrites);
  const sandbox = {
    window,
    document,
    console,
    URL,
    Blob,
    setTimeout,
    clearTimeout,
  };
  vm.createContext(sandbox);
  vm.runInContext(runtimeText, sandbox, { filename: runtimePath });
  return {
    window,
    storage,
    indexedDbWrites,
    localStorageKeys: () => [...storage.keys()],
    output: () => {
      const text = [...storage.values()].join('\n');
      const oldHits = oldHudMarkers.filter((marker) => text.includes(marker));
      return {
        text,
        old_marker_hits: oldHits,
        includesAnyOldMarker: oldHits.length > 0,
      };
    },
  };
}

function fakeElement(tagName = 'div') {
  const element = {
    tagName: String(tagName).toUpperCase(),
    children: [],
    dataset: {},
    style: {},
    hidden: false,
    textContent: '',
    className: '',
    append(...nodes) { this.children.push(...nodes); },
    appendChild(node) { this.children.push(node); return node; },
    replaceChildren(...nodes) { this.children = nodes; },
    remove() {},
    setAttribute(name, value) { this[name] = String(value); },
    getAttribute(name) { return this[name] || ''; },
    addEventListener() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    closest() { return null; },
    click() {},
  };
  return element;
}

function fakeIndexedDb(writes) {
  return {
    open() {
      const request = {};
      const fakeDb = {
        objectStoreNames: { contains: () => true },
        createObjectStore() {},
        transaction() {
          const tx = {
            objectStore() {
              return {
                put(value, key) {
                  writes.push({ key, value });
                },
                get() {
                  const getRequest = {};
                  setTimeout(() => {
                    getRequest.result = null;
                    if (getRequest.onsuccess) getRequest.onsuccess();
                  }, 0);
                  return getRequest;
                },
              };
            },
          };
          setTimeout(() => {
            if (tx.oncomplete) tx.oncomplete();
          }, 0);
          return tx;
        },
      };
      setTimeout(() => {
        request.result = fakeDb;
        if (request.onsuccess) request.onsuccess();
      }, 0);
      return request;
    },
  };
}

function inspectStaleBundleRisk(scans) {
  const scriptSrcRows = scans
    .flatMap((row) => row.script_srcs.filter((src) => src.includes('reader-workbench.js')).map((src) => ({ page: row.page, src })));
  return {
    runtime_path: runtimePath,
    runtime_sha256: runtimeHash,
    runtime_mtime_iso: fs.statSync(path.join(root, runtimePath)).mtime.toISOString(),
    unique_script_srcs: [...new Set(scriptSrcRows.map((row) => row.src))].sort(),
    generated_imports_without_cache_buster: scriptSrcRows.filter((row) => !row.src.includes('?')).length,
    observable_risk: 'file evidence does not expose HTTP cache headers or CDN state; lack of cache-busting query means stale deployed bundles remain an operational risk outside this packet',
  };
}

function inspectRouteInventory() {
  const manifestPath = 'data/definitions/hud-route-lookup/manifest.json';
  if (!exists(manifestPath)) return { manifest_path: manifestPath, exists: false };
  const manifest = JSON.parse(read(manifestPath));
  const shards = new Set((manifest.shards || []).map((row) => row.path).filter(Boolean));
  const present = [...shards].filter((shard) => exists(path.posix.join('data/definitions/hud-route-lookup', shard))).length;
  return {
    manifest_path: manifestPath,
    exists: true,
    counts: manifest.counts || {},
    shards_listed: shards.size,
    shards_present: present,
    publication_boundary: manifest.publication_boundary || null,
  };
}

function runValidators() {
  return [
    runCommand('route HUD rollout watch', [process.execPath, 'scripts/audit_route_hud_rollout_watch.mjs']),
    runCommand('public route lookup', [process.execPath, 'scripts/validate_public_hud_route_lookup.mjs', '--skip-release-stamp']),
    runCommand('route answer safety', [process.execPath, 'scripts/validate_route_answer_safety.mjs']),
    runCommand('representative route HUD pages', [process.execPath, 'scripts/validate_route_hud_page.mjs', ...representativePages.flatMap((page) => ['--page', page])]),
    runCommand('Genesis click contract', [
      process.execPath,
      'scripts/audit_route_hud_click_contract.mjs',
      '--page',
      'tanakh/genesis/index.html',
      '--report',
      options.clickReport,
      '--json',
      options.clickJson,
      '--sample-limit',
      '36',
    ]),
  ];
}

function externalValidatorPlaceholders() {
  return [
    'route HUD rollout watch',
    'public route lookup',
    'route answer safety',
    'representative route HUD pages',
    'Genesis click contract',
  ].map((name) => ({
    name,
    command: 'run externally from shell; child process execution from this audit is disabled by sandbox/EPERM unless --include-validators is used',
    exit_code: null,
    status: 'external_required',
    error: '',
    stdout: '',
    stderr: '',
  }));
}

function runCommand(name, command) {
  const result = spawnSync(command[0], command.slice(1), {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  });
  return {
    name,
    command: command.map((part) => part.includes(' ') ? `"${part}"` : part).join(' '),
    exit_code: result.status ?? 1,
    error: result.error ? result.error.message : '',
    stdout: trim(result.stdout),
    stderr: trim(result.stderr),
  };
}

function scanGeneratedPage(page) {
  if (!exists(page)) return { page, exists: false, old_marker_hits: [], script_srcs: [] };
  const html = read(page);
  const currentMarkerHits = currentHudMarkers.filter((marker) => html.includes(marker));
  return {
    page,
    exists: true,
    old_marker_hits: oldHudMarkers.filter((marker) => html.includes(marker)),
    current_marker_hits: currentMarkerHits,
    missing_current_markers: currentHudMarkers.filter((marker) => !currentMarkerHits.includes(marker)),
    script_srcs: [...html.matchAll(/<script\s+[^>]*src="([^"]+)"/gi)].map((match) => match[1].replaceAll('&amp;', '&')),
    has_sources_and_licenses: html.includes('Sources and licenses'),
    has_source_footnotes: html.includes('source-footnotes'),
    has_lexical_config: html.includes('data-lexical-config'),
    has_lexical_occurrences: html.includes('data-lexical-occurrences'),
    has_lexical_hud: html.includes('data-lexical-hud'),
  };
}

function loadSourceInventory() {
  const dir = path.join(root, 'data', 'sources');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => {
      const file = path.join(dir, name);
      try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        return { source_path: rel(file), work_id: data.work_id || name.replace(/\.json$/i, ''), work_slug: data.work_slug || '' };
      } catch (error) {
        return { source_path: rel(file), work_id: name.replace(/\.json$/i, ''), work_slug: '', parse_error: error.message };
      }
    });
}

function resolveHref(fromPage, href) {
  const withoutHash = String(href || '').split('#')[0].split('?')[0];
  if (!withoutHash || /^(https?:|mailto:|tel:)/i.test(withoutHash)) return '';
  const baseDir = path.posix.dirname(fromPage.replaceAll('\\', '/'));
  const joined = path.posix.normalize(path.posix.join(baseDir === '.' ? '' : baseDir, withoutHash));
  const target = joined.endsWith('/') ? `${joined}index.html` : joined;
  if (target.startsWith('..') || path.isAbsolute(target)) return '';
  return target;
}

function writeReport(relativePath, data) {
  const lines = [
    '# Agent 4 SPEC-003 Dynamic/Fallback Old-HUD Exposure Report',
    '',
    `Generated: ${data.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Evidence only. Agent 4 does not self-accept.',
    '- This is Node VM simulated runtime evidence plus static navigation resolution, not live browser-click proof.',
    '- Old HUD remains `quarantined_legacy_license_risk`; publication remains `blocked_no_render`.',
    '',
    '## Summary',
    '',
    `- Status: ${data.summary.status}`,
    `- Generated pages expected/present: ${data.summary.generated_pages_expected} / ${data.summary.generated_pages_present}`,
    `- Generated pages with old-HUD markers: ${data.summary.generated_pages_with_old_markers}`,
    `- Generated pages importing Reader Workbench runtime: ${data.summary.generated_pages_importing_reader_workbench}`,
    `- Generated pages importing stale upgrade tool: ${data.summary.generated_pages_importing_upgrade_tool}`,
    `- Public navigation links resolved: ${data.summary.public_navigation_links_resolved}`,
    `- Public navigation targets with old-HUD markers: ${data.summary.public_navigation_targets_with_old_markers}`,
    `- Dynamic runtime control failures: ${data.summary.dynamic_runtime_control_failures}`,
    `- Validator failures: ${data.summary.validator_failures}`,
    `- Issues: ${data.summary.issues}`,
    `- Warnings: ${data.summary.warnings}`,
    '',
    '## Dynamic Runtime Controls',
    '',
    ...data.positive_controls.map(controlLine),
    ...data.negative_controls.map(controlLine),
    '',
    '## Public Navigation Click Simulation',
    '',
    `- Roots checked: ${data.public_navigation_clicks.roots.map((row) => `\`${row.page}\``).join(', ')}`,
    `- Resolved targets: ${data.public_navigation_clicks.resolved_targets.length}`,
    `- Targets with old-HUD markers: ${data.public_navigation_clicks.targets_with_old_markers.length}`,
    `- Targets to quarantined preview: ${data.public_navigation_clicks.targets_to_quarantined_preview.length}`,
    '',
    '## Current / Old Marker Counts',
    '',
    ...Object.entries(data.marker_counts.generated_current_markers).map(([marker, count]) => `- current generated \`${marker}\`: ${count}`),
    ...Object.entries(data.marker_counts.generated_old_markers).map(([marker, count]) => `- old generated \`${marker}\`: ${count}`),
    ...Object.entries(data.marker_counts.navigation_old_markers).map(([marker, count]) => `- old navigation target \`${marker}\`: ${count}`),
    '',
    '## Route / Index / Generated Inventory',
    '',
    `- Source records: ${data.route_index_generated_inventory.source_records}`,
    `- Generated pages expected/present: ${data.route_index_generated_inventory.generated_pages_expected} / ${data.route_index_generated_inventory.generated_pages_present}`,
    `- Generated pages with old-HUD markers: ${data.route_index_generated_inventory.generated_pages_with_old_markers.length}`,
    `- Route lookup manifest: \`${data.route_index_generated_inventory.route_lookup.manifest_path}\` (${data.route_index_generated_inventory.route_lookup.exists ? 'present' : 'missing'})`,
    `- Route lookup shards listed/present: ${data.route_index_generated_inventory.route_lookup.shards_listed} / ${data.route_index_generated_inventory.route_lookup.shards_present}`,
    `- Route lookup cards written: ${data.route_index_generated_inventory.route_lookup.counts?.cards_written ?? 'unknown'}`,
    `- Publication boundary: ${data.route_index_generated_inventory.route_lookup.publication_boundary?.publication_status || 'unknown'}`,
    '',
    '## Runtime / Fallback / Rollback',
    '',
    `- Runtime: \`${data.runtime_imports.runtime_path}\``,
    `- Runtime sha256: \`${data.runtime_imports.runtime_sha256}\``,
    `- Generated pages importing runtime: ${data.runtime_imports.generated_pages_importing_reader_workbench}`,
    `- Generated pages importing upgrade tool: ${data.runtime_imports.generated_pages_importing_upgrade_tool}`,
    `- Preview fallback exists in runtime: ${data.fallback_rollback_activation.preview_runtime_exists}`,
    `- Generated pages missing initSite prerequisites: ${data.fallback_rollback_activation.generated_pages_missing_init_site_prerequisites.length}`,
    `- Stale upgrade tool old markers: ${data.fallback_rollback_activation.stale_upgrade_tool_old_markers.join(', ') || 'none'}`,
    `- Rollback terms in runtime: ${data.fallback_rollback_activation.rollback_terms_in_runtime}`,
    '',
    '## Query / Storage',
    '',
    ...data.query_string_behavior.map(controlLine),
    ...data.localStorage_behavior.map(controlLine),
    ...data.indexedDB_behavior.map(controlLine),
    '',
    '## Route / Source / Answer / Maqaf Checks',
    '',
    ...data.validators.map(validatorLine),
    `- External direct-shell validator evidence: \`${data.validator_evidence_report}\``,
    '',
    '## Source / License / Citation Visibility',
    '',
    `- Generated pages with Sources and licenses: ${data.source_license_citation_visibility.generated_pages_with_sources_and_licenses}`,
    `- Generated pages with source footnotes: ${data.source_license_citation_visibility.generated_pages_with_source_footnotes}`,
    `- Public route lookup validator: ${validatorStatus(data.source_license_citation_visibility.public_route_lookup_validator)}`,
    `- Scope: source/license/citation visibility is static plus representative validator evidence, not source/provenance custody acceptance.`,
    '',
    '## Stale Bundle Risk',
    '',
    `- Runtime mtime: ${data.stale_bundle_deployment_risk.runtime_mtime_iso}`,
    `- Generated runtime imports without cache-busting query: ${data.stale_bundle_deployment_risk.generated_imports_without_cache_buster}`,
    `- Observable risk: ${data.stale_bundle_deployment_risk.observable_risk}`,
    '',
    '## Drift From Current HUD Docket',
    '',
    `- Docket: \`${data.drift_from_current_hud_docket.docket}\``,
    `- Docket generated/current-HUD page count mentioned: ${data.drift_from_current_hud_docket.docket_current_hud_pages ?? 'not parsed'}`,
    `- Current generated pages expected/present: ${data.drift_from_current_hud_docket.current_generated_pages_expected} / ${data.drift_from_current_hud_docket.current_generated_pages_present}`,
    `- Current generated pages with old-HUD markers: ${data.drift_from_current_hud_docket.current_generated_pages_with_old_markers}`,
    `- Current pages missing current markers in this audit: ${data.drift_from_current_hud_docket.current_generated_pages_missing_current_markers}`,
    `- Drift note: ${data.drift_from_current_hud_docket.note}`,
    '',
    '## Deviations',
    '',
    ...data.deviations.map((item) => `- ${item}`),
    '',
    '## Quarantined Surfaces',
    '',
    ...data.quarantined_surfaces.map((item) => `- \`${item.path}\`: ${item.reason}`),
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

function controlLine(row) {
  return `- ${row.passed ? 'pass' : 'fail'} / ${row.scope} / ${row.control_type}: ${row.name}`;
}

function validatorLine(row) {
  if (!Number.isInteger(row.exit_code)) return `- ${row.name}: external shell evidence required (${row.status || 'not_embedded'})`;
  return `- ${row.name}: ${row.exit_code === 0 ? 'pass' : 'fail'} (exit ${row.exit_code})${row.error ? ` - ${row.error}` : ''}`;
}

function validatorStatus(row) {
  if (!row) return 'not checked in this packet';
  if (Number.isInteger(row.exit_code)) return row.exit_code === 0 ? 'pass' : `fail (exit ${row.exit_code})`;
  return row.status || 'external_required';
}

function countMarkerHits(rows, markers) {
  const counts = Object.fromEntries(markers.map((marker) => [marker, 0]));
  for (const row of rows) {
    const hits = new Set([...(row.current_marker_hits || []), ...(row.old_marker_hits || [])]);
    for (const marker of markers) {
      if (hits.has(marker)) counts[marker] += 1;
    }
  }
  return counts;
}

function inspectSignoffDrift() {
  const docket = 'reports/agent6-public-hud-signoff-2026-06-01.md';
  const text = exists(docket) ? read(docket) : '';
  const mentioned = text.match(/Public HUD static spread checked:\s*(\d+)\s*HUD pages/i)
    || text.match(/(\d+)\s+current HUD pages/i);
  const present = generatedPageScans.filter((row) => row.exists).length;
  const oldMarkerRows = generatedPageScans.filter((row) => row.old_marker_hits.length).length;
  const missingCurrent = generatedPageScans.filter((row) => row.exists && row.missing_current_markers.length).length;
  return {
    docket,
    docket_current_hud_pages: mentioned ? Number(mentioned[1]) : null,
    current_generated_pages_expected: generatedPages.length,
    current_generated_pages_present: present,
    current_generated_pages_with_old_markers: oldMarkerRows,
    current_generated_pages_missing_current_markers: missingCurrent,
    note: 'Current source inventory has expanded since the public HUD signoff docket; this packet checks the current generated inventory but does not widen the Agent 6 accepted boundary.',
  };
}

function trim(value) {
  const text = String(value || '').trim();
  return text.length > 4000 ? `${text.slice(0, 3500)}\n... [truncated ${text.length - 3500} chars]` : text;
}

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
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
