#!/usr/bin/env node
import childProcess from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';

const OLD_HUD_MARKERS = [
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
  'accepted_translation',
  'Accepted translation',
];

function parseArgs(argv) {
  const options = {
    publicRoot: process.cwd(),
    routeReport: '',
    report: path.resolve('reports/agent10-orot-stage-b-top50-browser-proof-2026-06-03.json'),
    screenshot: path.resolve('reports/agent10-orot-stage-b-top50-browser-proof-2026-06-03.png'),
    chromePath: process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    baseUrl: '',
    workId: 'orot',
    pagePath: 'orot/',
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = () => {
      index += 1;
      if (index >= argv.length) throw new Error(`Missing value for ${arg}`);
      return argv[index];
    };
    if (arg === '--public-root') options.publicRoot = path.resolve(next());
    else if (arg === '--route-report') options.routeReport = path.resolve(next());
    else if (arg === '--report') options.report = path.resolve(next());
    else if (arg === '--screenshot') options.screenshot = path.resolve(next());
    else if (arg === '--chrome-path') options.chromePath = next();
    else if (arg === '--base-url') options.baseUrl = next();
    else if (arg === '--work-id') options.workId = next();
    else if (arg === '--page-path') options.pagePath = next();
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!options.routeReport) throw new Error('--route-report is required');
  options.pagePath = String(options.pagePath || '').replace(/^\/+/, '');
  if (options.pagePath && !options.pagePath.endsWith('/')) options.pagePath += '/';
  return options;
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.html') return 'text/html; charset=utf-8';
  if (ext === '.js') return 'text/javascript; charset=utf-8';
  if (ext === '.css') return 'text/css; charset=utf-8';
  if (ext === '.json') return 'application/json; charset=utf-8';
  if (ext === '.png') return 'image/png';
  if (ext === '.svg') return 'image/svg+xml';
  return 'application/octet-stream';
}

function startStaticServer(root) {
  const resolvedRoot = path.resolve(root);
  const server = http.createServer((request, response) => {
    try {
      const url = new URL(request.url || '/', 'http://127.0.0.1');
      let pathname = decodeURIComponent(url.pathname);
      if (pathname.endsWith('/')) pathname += 'index.html';
      let filePath = path.resolve(resolvedRoot, `.${pathname}`);
      if (!filePath.startsWith(resolvedRoot)) {
        response.writeHead(403);
        response.end('Forbidden');
        return;
      }
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) filePath = path.join(filePath, 'index.html');
      if (!fs.existsSync(filePath)) {
        response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
        response.end('Not found');
        return;
      }
      response.writeHead(200, { 'content-type': contentType(filePath), 'cache-control': 'no-store' });
      fs.createReadStream(filePath).pipe(response);
    } catch (error) {
      response.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
      response.end(error.stack || String(error));
    }
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      resolve({ server, origin: `http://127.0.0.1:${server.address().port}` });
    });
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForFile(filePath, timeoutMs = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (fs.existsSync(filePath)) return;
    await delay(100);
  }
  throw new Error(`Timed out waiting for ${filePath}`);
}

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.nextId = 1;
    this.pending = new Map();
    this.events = [];
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    this.ws.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(JSON.stringify(message.error)));
        else resolve(message.result || {});
      } else if (message.method) {
        this.events.push(message);
        if (this.onEvent) this.onEvent(message);
      }
    });
    await new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve, { once: true });
      this.ws.addEventListener('error', reject, { once: true });
    });
  }

  send(method, params = {}) {
    const id = this.nextId;
    this.nextId += 1;
    const payload = { id, method, params };
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify(payload));
    });
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function startChrome(chromePath) {
  if (!fs.existsSync(chromePath)) throw new Error(`Chrome not found: ${chromePath}`);
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'route-proof-chrome-'));
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-extensions',
    '--disable-sync',
    '--remote-debugging-port=0',
    `--user-data-dir=${userDataDir}`,
    'about:blank',
  ];
  const proc = childProcess.spawn(chromePath, args, { stdio: ['ignore', 'ignore', 'pipe'] });
  let stderr = '';
  proc.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
  const portFile = path.join(userDataDir, 'DevToolsActivePort');
  await waitForFile(portFile);
  const [port] = fs.readFileSync(portFile, 'utf8').trim().split(/\r?\n/);
  return { proc, userDataDir, port, stderr: () => stderr };
}

async function waitFor(client, expression, timeoutMs = 10000) {
  const start = Date.now();
  let lastValue = null;
  while (Date.now() - start < timeoutMs) {
    const result = await evaluate(client, expression);
    lastValue = result;
    if (result) return result;
    await delay(100);
  }
  throw new Error(`Timed out waiting for expression: ${expression}; last=${JSON.stringify(lastValue)}`);
}

async function evaluate(client, expression) {
  const result = await client.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result ? result.result.value : undefined;
}

async function navigate(client, url) {
  await client.send('Page.navigate', { url });
  await waitFor(client, 'document.readyState === "complete"', 20000);
  await waitFor(client, 'document.querySelectorAll("[data-lexical-token]").length > 0', 20000);
  await waitFor(client, '[...document.querySelectorAll("[data-lexical-token]")].some((node) => String(node.dataset.inlineGloss || "").trim())', 20000);
}

async function navigateAny(client, url) {
  await client.send('Page.navigate', { url });
  await waitFor(client, 'document.readyState === "complete"', 20000);
}

async function hardReload(client) {
  await client.send('Page.reload', { ignoreCache: true });
  await waitFor(client, 'document.readyState === "complete"', 20000);
  await waitFor(client, 'document.querySelectorAll("[data-lexical-token]").length > 0', 20000);
  await waitFor(client, '[...document.querySelectorAll("[data-lexical-token]")].some((node) => String(node.dataset.inlineGloss || "").trim())', 20000);
}

function pageProbeExpression() {
  return `(() => {
    const markers = ${JSON.stringify(OLD_HUD_MARKERS)};
    const html = document.documentElement.outerHTML;
    const markerHits = markers.filter((marker) => html.includes(marker));
    return {
      url: location.href,
      tokenButtons: document.querySelectorAll('[data-lexical-token]').length,
      inlineHintLines: [...document.querySelectorAll('.reader-gloss-line')].filter((node) => node.textContent.trim()).length,
      inlineHintDatasets: [...document.querySelectorAll('[data-lexical-token]')].filter((node) => String(node.dataset.inlineGloss || '').trim()).length,
      inlineHints: Math.max(
        [...document.querySelectorAll('.reader-gloss-line')].filter((node) => node.textContent.trim()).length,
        [...document.querySelectorAll('[data-lexical-token]')].filter((node) => String(node.dataset.inlineGloss || '').trim()).length
      ),
      routeCards: document.querySelectorAll('.route-card').length,
      answerCards: document.querySelectorAll('.route-answer-card').length,
      sourceDetails: [...document.querySelectorAll('.reader-source-details, .source-footnotes')].filter((node) => node.textContent.includes('Sources and licenses')).length,
      selectedGlosses: document.querySelectorAll('[data-selected-gloss]').length,
      oldMarkerHits: markerHits,
      hudHidden: document.querySelector('[data-lexical-hud]')?.hidden ?? null
    };
  })()`;
}

function oldPathProbeExpression() {
  return `(() => {
    const markers = ${JSON.stringify(OLD_HUD_MARKERS)};
    const html = document.documentElement.outerHTML;
    const markerHits = markers.filter((marker) => html.includes(marker));
    return {
      url: location.href,
      title: document.title,
      bodyTextSample: document.body.textContent.replace(/\\s+/g, ' ').trim().slice(0, 300),
      oldMarkerHits: markerHits,
      selectedGlosses: document.querySelectorAll('[data-selected-gloss]').length,
      routeCards: document.querySelectorAll('.route-card').length,
      tokenButtons: document.querySelectorAll('[data-lexical-token]').length
    };
  })()`;
}

function sampleExpression(tokenIds) {
  return `(() => {
    const wanted = new Set(${JSON.stringify(tokenIds)});
    const rows = [...document.querySelectorAll('[data-lexical-token]')]
      .map((button, index) => {
        const ids = String(button.dataset.lexicalTokenIds || button.dataset.lexicalIndex || '').split(/\\s+/).filter(Boolean);
        const tokenId = ids.find((id) => wanted.has(id));
        if (!tokenId) return null;
        return {
          index,
          tokenId,
          text: button.dataset.lexicalSurface || button.textContent.trim(),
          hint: button.dataset.inlineGloss || '',
          top: button.getBoundingClientRect().top + window.scrollY
        };
      })
      .filter(Boolean);
    const unique = [];
    const add = (row, reason) => {
      if (!row) return;
      const key = row.tokenId + ':' + row.index;
      if (unique.some((item) => item.key === key)) return;
      unique.push({ ...row, key, reason });
    };
    add(rows[0], 'early packaged occurrence');
    add(rows[Math.floor(rows.length / 2)], 'middle packaged occurrence');
    add(rows[rows.length - 1], 'late packaged occurrence');
    const highFrequency = rows.find((row) => row.tokenId === ${JSON.stringify(tokenIds[0] || '')});
    add(highFrequency, 'highest-frequency selected token');
    return { availablePackagedOccurrences: rows.length, samples: unique.slice(0, 5) };
  })()`;
}

function clickExpression(sample) {
  return `(async () => {
    const markers = ${JSON.stringify(OLD_HUD_MARKERS)};
    const buttons = [...document.querySelectorAll('[data-lexical-token]')];
    const button = buttons[${sample.index}];
    if (!button) return { ok: false, reason: 'missing button', sample: ${JSON.stringify(sample)} };
    button.scrollIntoView({ block: 'center', inline: 'nearest' });
    await new Promise((resolve) => setTimeout(resolve, 50));
    const start = performance.now();
    button.click();
    while (performance.now() - start < 10000) {
      const routeCards = document.querySelectorAll('.route-card').length;
      const hud = document.querySelector('[data-lexical-hud]');
      if (hud && !hud.hidden && routeCards > 0) break;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    const durationMs = Math.round(performance.now() - start);
    const html = document.documentElement.outerHTML;
    const markerHits = markers.filter((marker) => html.includes(marker));
    const panelText = document.querySelector('[data-route-hud-panel]')?.textContent || '';
    return {
      ok: document.querySelectorAll('.route-card').length > 0,
      durationMs,
      sample: ${JSON.stringify(sample)},
      clickedText: button.dataset.lexicalSurface || button.textContent.trim(),
      hudHidden: document.querySelector('[data-lexical-hud]')?.hidden ?? null,
      routeCards: document.querySelectorAll('.route-card').length,
      answerCards: document.querySelectorAll('.route-answer-card').length,
      sourceDetails: [...document.querySelectorAll('.reader-source-details, .source-footnotes')].filter((node) => node.textContent.includes('Sources and licenses')).length,
      selectedGlosses: document.querySelectorAll('[data-selected-gloss]').length,
      oldMarkerHits: markerHits,
      panelTextSample: panelText.replace(/\\s+/g, ' ').trim().slice(0, 300)
    };
  })()`;
}

function poisonStorageExpression() {
  return `(async () => {
    const payload = 'Clicked Hebrew form | accepted_translation | data-hud-renderings | Best actual hit';
    localStorage.setItem('old-hud-poison', payload);
    localStorage.setItem('reader-workbench:g1', JSON.stringify({
      schema_version: 1,
      storage: 'poison-test',
      selections: {
        'old|hud|bad|key': {
          selected_definition: payload,
          publication_status: 'accepted_translation'
        }
      }
    }));
    await new Promise((resolve) => {
      const request = indexedDB.open('reader-workbench', 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('state')) db.createObjectStore('state');
      };
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction('state', 'readwrite');
        tx.objectStore('state').put({ schema_version: 1, storage: 'poison-test', selections: { poison: { selected_definition: payload, publication_status: 'accepted_translation' } } }, 'gloss-selections');
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      };
      request.onerror = () => resolve(false);
      request.onblocked = () => resolve(false);
    });
    return true;
  })()`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const routeReport = JSON.parse(fs.readFileSync(options.routeReport, 'utf8'));
  const tokenIds = (routeReport.selected_tokens || []).map((row) => row.token_id).filter(Boolean);
  const network = [];
  const consoleErrors = [];
  const runtimeExceptions = [];
  let server;
  let chrome;
  let client;
  try {
    const staticServer = options.baseUrl
      ? null
      : await startStaticServer(options.publicRoot);
    if (staticServer) server = staticServer.server;
    chrome = await startChrome(options.chromePath);
    const newTarget = await fetch(`http://127.0.0.1:${chrome.port}/json/new?about:blank`, { method: 'PUT' }).then((response) => response.json());
    client = new CdpClient(newTarget.webSocketDebuggerUrl);
    await client.connect();
    client.onEvent = (event) => {
      if (event.method === 'Network.responseReceived') {
        network.push({
          url: event.params.response.url,
          status: event.params.response.status,
          mimeType: event.params.response.mimeType,
        });
      }
      if (event.method === 'Runtime.exceptionThrown') runtimeExceptions.push(event.params.exceptionDetails);
      if (event.method === 'Log.entryAdded' && ['error', 'warning'].includes(event.params.entry.level)) {
        const entry = event.params.entry;
        if (!String(entry.url || '').endsWith('/favicon.ico')) consoleErrors.push(entry);
      }
    };
    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Network.enable');
    await client.send('Log.enable');
    await client.send('Network.setCacheDisabled', { cacheDisabled: true });

    const baseUrl = options.baseUrl
      ? (options.baseUrl.endsWith('/') ? options.baseUrl : `${options.baseUrl}/`)
      : `${staticServer.origin}/${options.pagePath}`;
    const siteRootUrl = new URL('/', baseUrl).toString();
    await navigate(client, `${baseUrl}?cachebust=${Date.now()}`);
    const beforeClick = await evaluate(client, pageProbeExpression());
    await hardReload(client);
    const hardReloadProbe = await evaluate(client, pageProbeExpression());
    const samplePlan = await evaluate(client, sampleExpression(tokenIds));
    const clickResults = [];
    for (const sample of samplePlan.samples || []) {
      clickResults.push(await evaluate(client, clickExpression(sample)));
    }
    const screenshot = await client.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.mkdirSync(path.dirname(options.screenshot), { recursive: true });
    fs.writeFileSync(options.screenshot, Buffer.from(screenshot.data, 'base64'));

    await navigate(client, `${baseUrl}?clicked_hebrew_form=old&hud=old&data-hud-renderings=1&sourceSummary=1&cachebust=${Date.now()}`);
    const oldQueryProbe = await evaluate(client, pageProbeExpression());
    const oldPathProbes = [];
    for (const oldPath of [
      `${siteRootUrl}hud-preview/routes/?cachebust=${Date.now()}`,
      `${baseUrl}hud-preview/routes/?cachebust=${Date.now()}`,
      `${siteRootUrl}reader-workbench/?cachebust=${Date.now()}`,
    ]) {
      await navigateAny(client, oldPath);
      oldPathProbes.push(await evaluate(client, oldPathProbeExpression()));
    }
    await navigate(client, `${baseUrl}?cachebust=${Date.now()}`);
    await evaluate(client, poisonStorageExpression());
    await navigate(client, `${baseUrl}?poisoned-storage=${Date.now()}`);
    const poisonedStorageProbe = await evaluate(client, pageProbeExpression());

    const routeLookupNeedle = `/data/public-hud/${options.workId}/route-lookup/`;
    const routeRequests = network.filter((entry) => entry.url.includes(routeLookupNeedle));
    const expectedOldPath404s = consoleErrors.filter((entry) => (
      String(entry.text || '').includes('404')
      && [
        '/hud-preview/routes/',
        `/${options.pagePath}hud-preview/routes/`,
        '/reader-workbench/',
      ].some((needle) => String(entry.url || '').includes(needle))
    ));
    const unexpectedConsoleErrors = consoleErrors.filter((entry) => !expectedOldPath404s.includes(entry));
    const proof = {
      schema_version: 1,
      artifact_type: 'public_route_hud_browser_click_proof',
      work_id: options.workId,
      page_path: options.pagePath,
      generated_at: new Date().toISOString(),
      target_mode: options.baseUrl ? 'live_url' : 'local_static',
      public_root: options.publicRoot,
      target_url: baseUrl,
      route_report: options.routeReport,
      screenshot: options.screenshot,
      claim_boundary: {
        highest_claim: `${options.workId} browser-click proof for route package generated from pipeline data`,
        not_accepted: [
          'qa_acceptance',
          'validated_public_runtime_acceptance',
          'source_provenance_acceptance',
          'publication_readiness',
          'definition_authority',
          'usage_as_definition_authority',
          'accepted_translation_text',
        ],
      },
      package_counts: routeReport.counts,
      before_click: beforeClick,
      hard_reload_probe: hardReloadProbe,
      sample_plan: samplePlan,
      clicks: clickResults,
      old_query_probe: oldQueryProbe,
      old_path_probes: oldPathProbes,
      poisoned_storage_probe: poisonedStorageProbe,
      route_requests: routeRequests,
      browser_warnings_or_errors: unexpectedConsoleErrors,
      expected_old_path_404s: expectedOldPath404s,
      runtime_exceptions: runtimeExceptions,
      pass_conditions: {
        packaged_click_count: clickResults.length,
        all_packaged_clicks_opened_route_cards: clickResults.every((result) => result.ok && result.routeCards > 0),
        all_packaged_clicks_have_sources: clickResults.every((result) => result.sourceDetails > 0),
        any_packaged_click_has_answer_card: clickResults.some((result) => result.answerCards > 0),
        route_manifest_requested: routeRequests.some((entry) => entry.url.endsWith(`/data/public-hud/${options.workId}/route-lookup/manifest.json`) && entry.status === 200),
        route_shard_requested: routeRequests.some((entry) => entry.url.includes(`/data/public-hud/${options.workId}/route-lookup/shards/`) && entry.status === 200),
        old_marker_hits_total: [
          beforeClick,
          hardReloadProbe,
          oldQueryProbe,
          poisonedStorageProbe,
          ...oldPathProbes,
          ...clickResults,
        ].reduce((sum, probe) => sum + (probe.oldMarkerHits || []).length, 0),
        before_click_inline_hints: beforeClick.inlineHints,
        hard_reload_inline_hints: hardReloadProbe.inlineHints,
        old_path_probe_count: oldPathProbes.length,
        expected_old_path_404_count: expectedOldPath404s.length,
        poisoned_storage_selected_glosses: poisonedStorageProbe.selectedGlosses,
        console_error_count: unexpectedConsoleErrors.length,
        runtime_exception_count: runtimeExceptions.length,
        max_click_ms: clickResults.reduce((max, result) => Math.max(max, result.durationMs || 0), 0),
      },
    };
    proof.status = (
      proof.pass_conditions.all_packaged_clicks_opened_route_cards
      && proof.pass_conditions.all_packaged_clicks_have_sources
      && proof.pass_conditions.route_manifest_requested
      && proof.pass_conditions.route_shard_requested
      && proof.pass_conditions.old_marker_hits_total === 0
      && proof.pass_conditions.poisoned_storage_selected_glosses === 0
      && proof.pass_conditions.console_error_count === 0
      && proof.pass_conditions.runtime_exception_count === 0
      && proof.pass_conditions.max_click_ms <= 5000
    ) ? 'pass' : 'warn';
    fs.mkdirSync(path.dirname(options.report), { recursive: true });
    fs.writeFileSync(options.report, `${JSON.stringify(proof, null, 2)}\n`, 'utf8');
    console.log(JSON.stringify({
      status: proof.status,
      report: options.report,
      screenshot: options.screenshot,
      pass_conditions: proof.pass_conditions,
    }, null, 2));
  } finally {
    if (client) client.close();
    if (chrome) {
      chrome.proc.kill();
      await delay(500);
      try {
        fs.rmSync(chrome.userDataDir, { recursive: true, force: true });
      } catch {
        // Chrome can release the temp profile a moment after process exit on Windows.
      }
    }
    if (server) server.close();
  }
}

try {
  await main();
} catch (error) {
  console.error(error.stack || String(error));
  process.exit(1);
}
