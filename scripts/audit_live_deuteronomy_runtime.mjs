#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';

const root = process.cwd();
const now = new Date();
const dateSlug = now.toISOString().slice(0, 10);
const options = {
  chrome: findChrome(),
  workId: 'deuteronomy',
  workTitle: 'Deuteronomy',
  surfaceLabel: 'live Deuteronomy only',
  url: 'https://mashiachsonyosef.github.io/tanakh/deuteronomy/',
  report: `reports/agent4-live-deuteronomy-browser-runtime-evidence-${dateSlug}.md`,
  json: `reports/agent4-live-deuteronomy-browser-runtime-evidence-${dateSlug}.json`,
  screenshot: `reports/agent4-live-deuteronomy-hud-click-${dateSlug}.png`,
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
  'Route HUD',
  'selectRouteAnswer',
  'lookupCandidateTreatments',
  'Sources and licenses',
  'source-footnotes',
  'answer_eligible',
  'answer_role',
  'hud_route_lookup_manifest_url',
  `data/public-hud/${options.workId}`,
];

if (!options.chrome) {
  console.error('Chrome executable not found. Pass --chrome <path>.');
  process.exit(1);
}

const generatedAt = now.toISOString();
const runId = String(Date.now());
const profileDir = path.join(root, '.local-cache', `agent4-live-${options.workId}-chrome-${runId}`);
fs.mkdirSync(profileDir, { recursive: true });

let chromeProcess = null;
let cdp = null;

try {
  chromeProcess = launchChrome(options.chrome, profileDir);
  const port = await waitForDevToolsPort(profileDir);
  cdp = await connectToPage(port);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });

  const staticProbe = await fetchLiveStatic(`${options.url}?agent4_static=${runId}`);
  await navigate(cdp, `${options.url}?agent4_live=${runId}`);
  const firstClick = await clickUntilHudHasSourceFootnotes(cdp, 'normal click-to-HUD');
  const firstNetwork = summarizeNetwork(cdp.events);
  const screenshotData = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  writeBinary(options.screenshot, Buffer.from(screenshotData.data, 'base64'));

  await cdp.send('Network.clearBrowserCache');
  await cdp.send('Page.reload', { ignoreCache: true });
  await waitForReady(cdp);
  const hardRefreshState = await inspectPageState(cdp);
  const hardRefreshNetwork = summarizeNetwork(cdp.events);

  await navigate(cdp, `${options.url}?oldHud=1&hud=legacy&routeHudInlineGlossMode=old&agent4_query=${runId}`);
  const queryClick = await clickUntilHudHasSourceFootnotes(cdp, 'old-HUD-looking query string');
  const queryNetwork = summarizeNetwork(cdp.events);

  await navigate(cdp, `${options.url}?agent4_storage_seed=${runId}`);
  const storageSeed = await poisonStorage(cdp);
  await cdp.send('Page.reload', { ignoreCache: true });
  await waitForReady(cdp);
  const storageClick = await clickUntilHudHasSourceFootnotes(cdp, 'poisoned localStorage/IndexedDB');
  const storageNetwork = summarizeNetwork(cdp.events);

  const output = buildOutput({
    staticProbe,
    firstClick,
    firstNetwork,
    hardRefreshState,
    hardRefreshNetwork,
    queryClick,
    queryNetwork,
    storageSeed,
    storageClick,
    storageNetwork,
  });
  writeJson(options.json, output);
  writeReport(options.report, output);

  if (output.summary.issues) {
    console.error(`Live ${options.workTitle} runtime audit found ${output.summary.issues} issue(s). Report: ${options.report}`);
    process.exit(1);
  }
  console.log(`Live ${options.workTitle} runtime audit complete (${output.summary.status}). Report: ${options.report}`);
} finally {
  if (cdp) cdp.close();
  if (chromeProcess) chromeProcess.kill();
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--chrome') parsed.chrome = argv[++index];
    else if (arg === '--work-id') parsed.workId = argv[++index];
    else if (arg === '--work-title') parsed.workTitle = argv[++index];
    else if (arg === '--surface-label') parsed.surfaceLabel = argv[++index];
    else if (arg === '--url') parsed.url = argv[++index];
    else if (arg === '--report') parsed.report = cleanRelativePath(argv[++index]);
    else if (arg === '--json') parsed.json = cleanRelativePath(argv[++index]);
    else if (arg === '--screenshot') parsed.screenshot = cleanRelativePath(argv[++index]);
    else if (arg === '--help' || arg === '-h') {
      console.log('Usage: node scripts/audit_live_deuteronomy_runtime.mjs [--chrome path] [--work-id id] [--work-title title] [--surface-label label] [--url url] [--report path] [--json path]');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return parsed;
}

function findChrome() {
  const paths = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  ].filter(Boolean);
  return paths.find((candidate) => fs.existsSync(candidate)) || '';
}

function launchChrome(chromePath, userDataDir) {
  const args = [
    '--headless=new',
    '--remote-debugging-port=0',
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-extensions',
    '--disable-gpu',
    '--window-size=1366,900',
    'about:blank',
  ];
  return spawn(chromePath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
}

async function waitForDevToolsPort(userDataDir) {
  const file = path.join(userDataDir, 'DevToolsActivePort');
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (fs.existsSync(file)) {
      try {
        const [port] = fs.readFileSync(file, 'utf8').trim().split(/\r?\n/);
        if (port) return port;
      } catch (error) {
        if (error.code !== 'EBUSY' && error.code !== 'EPERM') throw error;
      }
    }
    await sleep(100);
  }
  throw new Error('Timed out waiting for Chrome DevToolsActivePort');
}

async function connectToPage(port) {
  let pages = await fetchJson(`http://127.0.0.1:${port}/json/list`);
  let page = pages.find((target) => target.type === 'page');
  if (!page) {
    await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent('about:blank')}`, { method: 'PUT' });
    pages = await fetchJson(`http://127.0.0.1:${port}/json/list`);
    page = pages.find((target) => target.type === 'page');
  }
  if (!page?.webSocketDebuggerUrl) throw new Error('No Chrome page target found');
  return connectCdp(page.webSocketDebuggerUrl);
}

function connectCdp(webSocketDebuggerUrl) {
  const ws = new WebSocket(webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  const waiters = new Map();
  const events = [];
  ws.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.method) {
      events.push(message);
      const methodWaiters = waiters.get(message.method) || [];
      waiters.set(message.method, methodWaiters.filter((waiter) => {
        if (!waiter.predicate(message)) return true;
        waiter.resolve(message);
        return false;
      }));
    }
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result || {});
    }
  });
  return new Promise((resolve, reject) => {
    ws.addEventListener('open', () => {
      resolve({
        events,
        send(method, params = {}) {
          const requestId = ++id;
          ws.send(JSON.stringify({ id: requestId, method, params }));
          return new Promise((requestResolve, requestReject) => {
            pending.set(requestId, { resolve: requestResolve, reject: requestReject });
          });
        },
        waitFor(method, predicate = () => true, timeoutMs = 30000) {
          return new Promise((waitResolve, waitReject) => {
            const timer = setTimeout(() => waitReject(new Error(`Timed out waiting for ${method}`)), timeoutMs);
            const wrapped = {
              predicate,
              resolve(message) {
                clearTimeout(timer);
                waitResolve(message);
              },
            };
            waiters.set(method, [...(waiters.get(method) || []), wrapped]);
          });
        },
        close() {
          ws.close();
        },
      });
    });
    ws.addEventListener('error', reject);
  });
}

async function navigate(client, url) {
  client.events.length = 0;
  const loaded = client.waitFor('Page.loadEventFired', () => true, 60000);
  await client.send('Page.navigate', { url });
  await loaded;
  await waitForReady(client);
}

async function waitForReady(client) {
  await evaluate(client, `new Promise((resolve) => {
    const done = () => document.readyState === 'complete' && resolve(true);
    done();
    document.addEventListener('readystatechange', done);
    setTimeout(() => resolve(false), 30000);
  })`);
  await evaluate(client, `new Promise((resolve) => {
    const start = Date.now();
    const tick = () => {
      if (document.querySelectorAll('[data-lexical-token]').length > 0) return resolve(true);
      if (Date.now() - start > 45000) return resolve(false);
      setTimeout(tick, 250);
    };
    tick();
  })`);
}

async function clickUntilHudHasSourceFootnotes(client, label) {
  return evaluate(client, `(${clickUntilHudHasSourceFootnotesBrowser.toString()})(${JSON.stringify(oldHudMarkers)}, ${JSON.stringify(label)})`);
}

function clickUntilHudHasSourceFootnotesBrowser(oldMarkers, label) {
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const waitForTokens = async () => {
    const start = Date.now();
    while (Date.now() - start < 45000) {
      const tokens = [...document.querySelectorAll('[data-lexical-token]')].filter((node) => node.textContent.trim());
      if (tokens.length) return tokens;
      await sleep(250);
    }
    return [];
  };
  const waitForHud = async () => {
    const start = Date.now();
    while (Date.now() - start < 20000) {
      const hud = document.querySelector('[data-lexical-hud]');
      const panel = document.querySelector('[data-route-hud-panel]');
      const text = hud ? hud.innerText || '' : '';
      if (hud && !hud.hidden && panel && !text.includes('Loading route cards')) return true;
      await sleep(250);
    }
    return false;
  };
  const summarize = (token, index) => {
    const hud = document.querySelector('[data-lexical-hud]');
    const panel = document.querySelector('[data-route-hud-panel]');
    const text = hud ? hud.innerText || '' : '';
    const hudRect = hud ? hud.getBoundingClientRect() : null;
    const panelRect = panel ? panel.getBoundingClientRect() : null;
    const sourceFootnotes = [...document.querySelectorAll('.source-footnotes, details.source-footnotes')];
    const sourceRows = [...document.querySelectorAll('.source-footnote-row')].slice(0, 6).map((node) => node.innerText.trim());
    return {
      label,
      token_index: index,
      token_text: token ? token.textContent.trim() : '',
      token_dataset: token ? { ...token.dataset } : {},
      hud_open: Boolean(hud && !hud.hidden),
      hud_title: document.querySelector('#route-hud-title')?.textContent?.trim() || '',
      hud_role: hud?.getAttribute('role') || '',
      hud_aria_modal: hud?.getAttribute('aria-modal') || '',
      viewport: { width: window.innerWidth, height: window.innerHeight },
      hud_rect: hudRect ? { x: hudRect.x, y: hudRect.y, width: hudRect.width, height: hudRect.height } : null,
      panel_rect: panelRect ? { x: panelRect.x, y: panelRect.y, width: panelRect.width, height: panelRect.height } : null,
      fullscreen_width: hudRect ? Math.abs(hudRect.width - window.innerWidth) <= 2 : false,
      fullscreen_height: hudRect ? Math.abs(hudRect.height - window.innerHeight) <= 2 : false,
      panel_text_sample: panel ? (panel.innerText || '').slice(0, 2200) : '',
      source_footnote_sections: sourceFootnotes.length,
      source_footnote_rows: sourceRows.length,
      source_footnote_sample: sourceRows,
      sources_and_licenses_visible: text.includes('Sources and licenses'),
      source_license_text_visible: /source|license|citation|CC-|public domain|sefaria|wikisource/i.test(text),
      route_cards: document.querySelectorAll('.route-claim-card, .claim-card, article[data-route-meta], article[data-rank-basis]').length,
      answer_cards: document.querySelectorAll('.route-answer-card').length,
      lookup_audit_visible: text.includes('Lookup keys'),
      old_marker_hits: oldMarkers.filter((marker) => document.documentElement.outerHTML.includes(marker) || text.includes(marker)),
      current_marker_hits: ['Route HUD', 'Sources and licenses', 'Lookup keys', 'Definition'].filter((marker) => text.includes(marker)),
      reader_workbench_api_keys: Object.keys(window.ReaderWorkbench || {}),
      local_storage_keys: Object.keys(window.localStorage || {}),
      indexeddb_databases_supported: Boolean(indexedDB.databases),
    };
  };
  return (async () => {
    const tokens = await waitForTokens();
    for (let index = 0; index < Math.min(tokens.length, 40); index += 1) {
      const token = tokens[index];
      token.scrollIntoView({ block: 'center', inline: 'center' });
      token.click();
      await waitForHud();
      const row = summarize(token, index);
      if (row.hud_open && row.sources_and_licenses_visible && row.source_footnote_rows > 0 && row.old_marker_hits.length === 0) {
        return { ...row, tried_tokens: index + 1 };
      }
      await sleep(150);
    }
    const token = tokens[0] || null;
    return { ...summarize(token, 0), tried_tokens: Math.min(tokens.length, 40), failed_to_find_source_footnotes: true };
  })();
}

async function inspectPageState(client) {
  return evaluate(client, `(() => {
    const html = document.documentElement.outerHTML;
    const text = document.body ? document.body.innerText : '';
    const oldMarkers = ${JSON.stringify(oldHudMarkers)};
    const currentMarkers = ${JSON.stringify(currentHudMarkers)};
    return {
      url: location.href,
      title: document.title,
      lexical_tokens: document.querySelectorAll('[data-lexical-token]').length,
      hud_present: Boolean(document.querySelector('[data-lexical-hud]')),
      old_marker_hits: oldMarkers.filter((marker) => html.includes(marker) || text.includes(marker)),
      current_marker_hits: currentMarkers.filter((marker) => html.includes(marker) || text.includes(marker)),
      runtime_api_keys: Object.keys(window.ReaderWorkbench || {}),
      local_storage_keys: Object.keys(window.localStorage || {}),
    };
  })()`);
}

async function poisonStorage(client) {
  return evaluate(client, `(${poisonStorageBrowser.toString()})()`);
}

function poisonStorageBrowser() {
  const oldText = 'Clicked Hebrew form | Best actual hit | Rank details | old HUD control';
  localStorage.setItem('oldHud', oldText);
  localStorage.setItem('hud', 'legacy');
  localStorage.setItem('routeHudInlineGlossMode', 'old');
  localStorage.setItem('reader-workbench-state', JSON.stringify({
    selections: {
      stale: {
        selected_definition: oldText,
        publication_status: 'accepted_translation',
        source_rows: [],
      },
    },
  }));
  const indexed = new Promise((resolve) => {
    if (!('indexedDB' in window)) return resolve({ supported: false, wrote_control_row: false });
    const request = indexedDB.open('reader-workbench', 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains('state')) request.result.createObjectStore('state');
    };
    request.onerror = () => resolve({ supported: true, wrote_control_row: false, error: request.error?.message || 'open failed' });
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('state', 'readwrite');
      tx.objectStore('state').put({
        selections: {
          stale: {
            selected_definition: oldText,
            publication_status: 'accepted_translation',
            source_rows: [],
          },
        },
      }, 'gloss-selections');
      tx.oncomplete = () => resolve({ supported: true, wrote_control_row: true });
      tx.onerror = () => resolve({ supported: true, wrote_control_row: false, error: tx.error?.message || 'tx failed' });
    };
  });
  return indexed.then((indexedDb) => ({
    local_storage_keys: Object.keys(localStorage),
    indexedDb,
  }));
}

async function evaluate(client, expression) {
  const result = await client.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
    userGesture: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || 'Runtime.evaluate failed');
  }
  return result.result?.value;
}

function summarizeNetwork(events) {
  const responses = events
    .filter((event) => event.method === 'Network.responseReceived')
    .map((event) => event.params.response)
    .filter((response) => response.url.includes('mashiachsonyosef.github.io'));
  const workPathNeedle = `/${options.workId}/`;
  const publicHudNeedle = `/data/public-hud/${options.workId}/`;
  const interesting = responses
    .filter((response) => response.url.includes(workPathNeedle)
      || response.url.includes('reader-workbench')
      || response.url.includes(publicHudNeedle)
      || response.url.includes('route-lookup')
      || response.url.includes('occurrences')
      || response.url.includes('manifest')
      || response.url.includes('shards'))
    .map((response) => ({
      url: response.url,
      status: response.status,
      mime_type: response.mimeType,
      from_disk_cache: Boolean(response.fromDiskCache),
      from_prefetch_cache: Boolean(response.fromPrefetchCache),
      cache_control: headerValue(response.headers, 'Cache-Control'),
      last_modified: headerValue(response.headers, 'Last-Modified'),
    }));
  return {
    responses: interesting,
    document_responses: interesting.filter((row) => row.mime_type === 'text/html' || row.url.includes(workPathNeedle)),
    runtime_responses: interesting.filter((row) => row.url.includes('reader-workbench.js')),
    public_hud_responses: interesting.filter((row) => row.url.includes(publicHudNeedle)),
    route_manifest_responses: interesting.filter((row) => row.url.includes('/route-lookup/manifest.json')),
    route_shard_responses: interesting.filter((row) => row.url.includes('/route-lookup/shards/')),
    failed_statuses: interesting.filter((row) => row.status < 200 || row.status >= 400),
  };
}

function headerValue(headers, key) {
  const found = Object.entries(headers || {}).find(([name]) => name.toLowerCase() === key.toLowerCase());
  return found ? String(found[1]) : '';
}

async function fetchLiveStatic(url) {
  const response = await fetch(url, { cache: 'no-store' });
  const body = await response.text();
  return {
    url,
    status: response.status,
    bytes: Buffer.byteLength(body),
    sha256: sha256(body),
    last_modified: response.headers.get('last-modified') || '',
    cache_control: response.headers.get('cache-control') || '',
    current_marker_hits: currentHudMarkers.filter((marker) => body.includes(marker)),
    old_marker_hits: oldHudMarkers.filter((marker) => body.includes(marker)),
  };
}

function buildOutput(parts) {
  const issues = [];
  const warnings = [];
  const checks = {
    static_http_current_no_old: parts.staticProbe.status === 200 && parts.staticProbe.old_marker_hits.length === 0,
    click_to_hud_opened: parts.firstClick.hud_open && parts.firstClick.old_marker_hits.length === 0,
    source_license_visible_after_click: parts.firstClick.sources_and_licenses_visible && parts.firstClick.source_footnote_rows > 0 && parts.firstClick.source_license_text_visible,
    route_shard_loaded_after_click: parts.firstNetwork.route_shard_responses.some((row) => row.status === 200),
    hard_refresh_current_no_old: parts.hardRefreshState.old_marker_hits.length === 0 && parts.hardRefreshState.current_marker_hits.length > 0,
    query_negative_no_old: parts.queryClick.old_marker_hits.length === 0 && parts.queryClick.hud_open,
    storage_negative_no_old: parts.storageClick.old_marker_hits.length === 0 && parts.storageClick.hud_open,
  };
  for (const [name, passed] of Object.entries(checks)) {
    if (!passed) issues.push(`${name} failed`);
  }
  if (parts.firstNetwork.failed_statuses.length || parts.queryNetwork.failed_statuses.length || parts.storageNetwork.failed_statuses.length) {
    warnings.push('One or more interesting network responses returned non-2xx/3xx status; inspect JSON network arrays.');
  }
  if (parts.firstNetwork.runtime_responses.some((row) => !row.url.includes('?'))) {
    warnings.push('Runtime script URL is not visibly versioned/cache-busted in page markup; hard refresh/cache-busted navigation was tested, but CDN stale-bundle closure is not accepted.');
  }
  return {
    artifact_type: `agent4_live_${options.workId}_browser_runtime_evidence`,
    method_id: `SPEC-003-live-${options.workId}-browser-runtime-v1`,
    generated_at: generatedAt,
    boundary: {
      evidence_only: true,
      no_self_acceptance: true,
      live_scope: `${options.url} only`,
      forbidden_scope: `non-${options.workTitle} routes, hud-preview, source custody, publication, broad rollout, implementation fixes, deployments, acceptance claims`,
      highest_permissible_claim: 'evidence-ready for Agent 6',
    },
    docket: '',
    chrome: {
      executable: options.chrome,
      profile_dir: rel(profileDir),
    },
    summary: {
      status: issues.length ? `failed_live_${options.workId}_runtime_evidence` : (warnings.length ? `warn_live_${options.workId}_runtime_evidence` : `passed_live_${options.workId}_runtime_evidence`),
      checks,
      issues: issues.length,
      warnings: warnings.length,
    },
    issues,
    warnings,
    static_http: parts.staticProbe,
    fullscreen_measurement: {
      tokenText: parts.firstClick.token_text,
      tokenDataset: parts.firstClick.token_dataset,
      hudOpen: parts.firstClick.hud_open,
      hudTitle: parts.firstClick.hud_title,
      viewport: parts.firstClick.viewport,
      hudRect: parts.firstClick.hud_rect,
      panelRect: parts.firstClick.panel_rect,
      fullscreenWidth: parts.firstClick.fullscreen_width,
      fullscreenHeight: parts.firstClick.fullscreen_height,
      routeCards: parts.firstClick.route_cards,
      sourceRows: parts.firstClick.source_footnote_rows,
      sourceHrefs: parts.firstClick.source_footnote_sample?.filter((row) => /https?:\/\//i.test(row)).length || 0,
      oldMarkerHits: parts.firstClick.old_marker_hits,
    },
    click_to_hud: parts.firstClick,
    click_network: parts.firstNetwork,
    hard_refresh_cache_busting: {
      page_state: parts.hardRefreshState,
      network: parts.hardRefreshNetwork,
    },
    query_string_negative: {
      click: parts.queryClick,
      network: parts.queryNetwork,
    },
    localStorage_indexedDB_negative: {
      storage_seed: parts.storageSeed,
      click: parts.storageClick,
      network: parts.storageNetwork,
    },
    screenshot: screenshotEvidence(options.screenshot),
    what_must_not_be_accepted: [
      'Public/runtime acceptance.',
      'Old-HUD fallback closure.',
      'Source/provenance custody.',
      'Publication readiness.',
      'Route publication support.',
      'Definition authority.',
      'Usage-as-definition authority.',
      'Product/data gates.',
      'Accepted translation text.',
      'This Agent 4 packet as Agent 6 acceptance.',
    ],
  };
}

function writeReport(relativePath, data) {
  const screenshotPath = typeof data.screenshot === 'string' ? data.screenshot : data.screenshot?.path;
  const lines = [
    `# Agent 4 Live ${options.workTitle} Browser Runtime Evidence`,
    '',
    `Generated: ${data.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Evidence only. Agent 4 does not self-accept.',
    `- Scope is ${options.surfaceLabel}: \`${options.url}\`.`,
    `- Forbidden scope: non-${options.workTitle} routes, \`/hud-preview/\`, source custody, publication, broad rollout, fixes, deployments, and acceptance claims.`,
    '- Highest permissible claim: evidence-ready for Agent 6.',
    '',
    '## Summary',
    '',
    `- Status: ${data.summary.status}`,
    ...Object.entries(data.summary.checks).map(([name, passed]) => `- ${passed ? 'pass' : 'fail'}: ${name}`),
    `- Issues: ${data.summary.issues}`,
    `- Warnings: ${data.summary.warnings}`,
    `- Screenshot: \`${screenshotPath}\``,
    '',
    '## Static HTTP / Cache-Busted Page',
    '',
    `- URL: \`${data.static_http.url}\``,
    `- HTTP: ${data.static_http.status}`,
    `- Bytes: ${data.static_http.bytes}`,
    `- SHA-256: \`${data.static_http.sha256}\``,
    `- Last-Modified: ${data.static_http.last_modified || 'not provided'}`,
    `- Cache-Control: ${data.static_http.cache_control || 'not provided'}`,
    `- Current markers: ${data.static_http.current_marker_hits.join(', ') || 'none'}`,
    `- Old-HUD markers: ${data.static_http.old_marker_hits.join(', ') || 'none'}`,
    '',
    '## Click-To-HUD Behavior',
    '',
    `- Clicked token: ${data.click_to_hud.token_text || 'unknown'}`,
    `- Token dataset lexical index: ${data.click_to_hud.token_dataset?.lexicalIndex || 'unknown'}`,
    `- Tried tokens before source/license HUD: ${data.click_to_hud.tried_tokens}`,
    `- HUD open: ${data.click_to_hud.hud_open}`,
    `- HUD title: ${data.click_to_hud.hud_title || 'not found'}`,
    `- HUD role / aria-modal: ${data.click_to_hud.hud_role || 'not set'} / ${data.click_to_hud.hud_aria_modal || 'not set'}`,
    `- Source footnote rows visible: ${data.click_to_hud.source_footnote_rows}`,
    `- Sources and licenses visible: ${data.click_to_hud.sources_and_licenses_visible}`,
    `- Route cards visible: ${data.click_to_hud.route_cards}`,
    `- Old-HUD markers after click: ${data.click_to_hud.old_marker_hits.join(', ') || 'none'}`,
    '',
    '## Route Shard Load Behavior',
    '',
    `- Route manifest responses: ${data.click_network.route_manifest_responses.length}`,
    ...data.click_network.route_manifest_responses.slice(0, 3).map(networkLine),
    `- Route shard responses: ${data.click_network.route_shard_responses.length}`,
    ...data.click_network.route_shard_responses.slice(0, 5).map(networkLine),
    `- Failed interesting statuses: ${data.click_network.failed_statuses.length}`,
    '',
    '## Hard Refresh / Cache-Busting',
    '',
    `- Page old-HUD markers after ignore-cache reload: ${data.hard_refresh_cache_busting.page_state.old_marker_hits.join(', ') || 'none'}`,
    `- Page current markers after ignore-cache reload: ${data.hard_refresh_cache_busting.page_state.current_marker_hits.join(', ') || 'none'}`,
    `- Runtime responses observed: ${data.hard_refresh_cache_busting.network.runtime_responses.length}`,
    ...data.hard_refresh_cache_busting.network.runtime_responses.slice(0, 3).map(networkLine),
    '',
    '## Negative Controls',
    '',
    `- Query-string old-HUD marker hits after click: ${data.query_string_negative.click.old_marker_hits.join(', ') || 'none'}`,
    `- Query-string HUD open: ${data.query_string_negative.click.hud_open}`,
    `- Poisoned localStorage keys: ${data.localStorage_indexedDB_negative.storage_seed.local_storage_keys.join(', ') || 'none'}`,
    `- IndexedDB control write: ${JSON.stringify(data.localStorage_indexedDB_negative.storage_seed.indexedDb)}`,
    `- Storage old-HUD marker hits after reload/click: ${data.localStorage_indexedDB_negative.click.old_marker_hits.join(', ') || 'none'}`,
    `- Storage HUD open: ${data.localStorage_indexedDB_negative.click.hud_open}`,
    '',
    '## Source / License / Citation Sample',
    '',
    ...(data.click_to_hud.source_footnote_sample.length ? data.click_to_hud.source_footnote_sample.map((row) => `- ${row}`) : ['- none']),
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

function networkLine(row) {
  return `- ${row.status} ${row.url} cache=${row.cache_control || 'n/a'} lastModified=${row.last_modified || 'n/a'} diskCache=${row.from_disk_cache}`;
}

function writeJson(relativePath, data) {
  writeText(relativePath, `${JSON.stringify(data, null, 2)}\n`);
}

function screenshotEvidence(relativePath) {
  const file = path.join(root, cleanRelativePath(relativePath));
  if (!fs.existsSync(file)) return { path: relativePath, bytes: 0, sha256: '' };
  const bytes = fs.readFileSync(file);
  return {
    path: relativePath,
    absolute_path: file,
    bytes: bytes.length,
    sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
  };
}

function writeText(relativePath, text) {
  const file = path.join(root, cleanRelativePath(relativePath));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text, 'utf8');
}

function writeBinary(relativePath, bytes) {
  const file = path.join(root, cleanRelativePath(relativePath));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, bytes);
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.json();
}

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cleanRelativePath(value) {
  return String(value || '').replace(/^[/\\]+/, '').replaceAll('\\', '/');
}

function rel(absolutePath) {
  return path.relative(root, absolutePath).replaceAll('\\', '/');
}
