#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = process.cwd();
const report = process.argv[2] || 'reports/agent4-ruth-live-browser-click-proof-2026-06-03.json';
const data = readJson(report);
const issues = [];

const workId = data.boundary?.live_scope?.match(/\/tanakh\/([^/]+)\//)?.[1]
  || data.static_http?.url?.match(/\/tanakh\/([^/]+)\//)?.[1]
  || 'unknown';
const configs = {
  ruth: {
    artifact_type: 'agent4_live_ruth_browser_runtime_evidence',
    status: 'warn_live_ruth_runtime_evidence',
    urlIncludes: '/tanakh/ruth/',
    publicHudIncludes: '/data/public-hud/ruth/',
    expectedTokenId: 'tok-e1e6213a83a3',
    expectedRouteCardsMin: 1,
    expectedAnswerCardsMin: 1,
    expectedSourceRowsMin: 1,
  },
  jonah: {
    artifact_type: 'agent4_live_jonah_browser_runtime_evidence',
    status: 'warn_live_jonah_runtime_evidence',
    urlIncludes: '/tanakh/jonah/',
    publicHudIncludes: '/data/public-hud/jonah/',
    expectedTokenId: 'tok-418aef103fcc',
    expectedRouteCardsMin: 1,
    expectedAnswerCardsMin: 1,
    expectedSourceRowsMin: 1,
  },
  amos: {
    artifact_type: 'agent4_live_amos_browser_runtime_evidence',
    status: 'warn_live_amos_runtime_evidence',
    urlIncludes: '/tanakh/amos/',
    publicHudIncludes: '/data/public-hud/amos/',
    expectedTokenId: 'tok-38310e4cbc3b',
    expectedRouteCardsMin: 1,
    expectedAnswerCardsMin: 1,
    expectedSourceRowsMin: 1,
  },
};
const config = configs[workId];
expect(Boolean(config), `unsupported live browser runtime work id: ${workId}`);
if (config) {
  expect(data.artifact_type === config.artifact_type, 'unexpected artifact_type');
  expect(data.summary?.status === config.status, 'unexpected summary status');
  expect(data.static_http?.url?.includes(config.urlIncludes), 'static HTTP URL must target the expected work route');
  expect(data.click_to_hud?.token_dataset?.lexicalIndex === config.expectedTokenId, 'clicked token must be the declared sentinel token');
  expect(data.click_to_hud?.route_cards >= config.expectedRouteCardsMin, 'route cards must be visible after click');
  expect(data.click_to_hud?.answer_cards >= config.expectedAnswerCardsMin, 'answer cards must be visible after click');
  expect(data.click_to_hud?.source_footnote_rows >= config.expectedSourceRowsMin, 'source/license rows must be visible after click');
  expect((data.click_network?.route_shard_responses || []).some((row) => row.url.includes(config.publicHudIncludes) && row.status === 200), 'expected public-HUD route shard response');
}

expect(data.boundary?.evidence_only === true, 'must preserve evidence_only boundary');
expect(data.boundary?.no_self_acceptance === true, 'must preserve no_self_acceptance boundary');
expect(String(data.boundary?.highest_permissible_claim || '').includes('evidence-ready for Agent 6'), 'highest permissible claim must stay evidence-ready only');
expect(data.static_http?.status === 200, 'static page HTTP status must be 200');
expect((data.static_http?.old_marker_hits || []).length === 0, 'static page old-HUD hits must be 0');
expect((data.static_http?.current_marker_hits || []).includes(`data/public-hud/${workId}`), 'static page must include work public-HUD marker');

const checks = data.summary?.checks || {};
for (const [name, passed] of Object.entries(checks)) {
  expect(passed === true, `summary check must pass: ${name}`);
}
expect(Object.keys(checks).length >= 7, 'expected at least seven browser/runtime checks');
expect(data.summary?.issues === 0, 'summary issues must be 0');
expect(data.summary?.warnings === 1, 'summary warnings must be 1');
expect(Array.isArray(data.issues) && data.issues.length === 0, 'issues must be empty');
expect(Array.isArray(data.warnings) && data.warnings.length === 1, 'expected one warning');
expect(data.warnings?.[0]?.includes('Runtime script URL is not visibly versioned/cache-busted'), 'expected cache-busting warning');

expect(data.click_to_hud?.hud_open === true, 'HUD must open after click');
expect((data.click_to_hud?.old_marker_hits || []).length === 0, 'click-to-HUD old marker hits must be 0');
expect(data.click_to_hud?.sources_and_licenses_visible === true, 'sources and licenses must be visible');
expect(data.click_to_hud?.source_license_text_visible === true, 'source/license text must be visible');
expect(data.hard_refresh_cache_busting?.page_state?.old_marker_hits?.length === 0, 'hard refresh old marker hits must be 0');
expect((data.hard_refresh_cache_busting?.page_state?.current_marker_hits || []).includes(`data/public-hud/${workId}`), 'hard refresh must keep current public-HUD marker');
expect(data.query_string_negative?.click?.hud_open === true, 'old-HUD query must still open current HUD');
expect((data.query_string_negative?.click?.old_marker_hits || []).length === 0, 'old-HUD query old marker hits must be 0');
expect(data.localStorage_indexedDB_negative?.click?.hud_open === true, 'poisoned storage must still open current HUD');
expect((data.localStorage_indexedDB_negative?.click?.old_marker_hits || []).length === 0, 'poisoned storage old marker hits must be 0');
expect(data.localStorage_indexedDB_negative?.storage_seed?.indexedDb?.wrote_control_row === true, 'poisoned storage control row must be written');
expect((data.click_network?.failed_statuses || []).length === 0, 'click network failed statuses must be 0');

const screenshotPath = typeof data.screenshot === 'string' ? data.screenshot : data.screenshot?.path;
expect(Boolean(screenshotPath), 'screenshot path is missing');
if (screenshotPath) {
  const full = path.join(root, screenshotPath);
  expect(fs.existsSync(full), `screenshot file must exist: ${screenshotPath}`);
  expect(fs.statSync(full).size > 1000, 'screenshot must not be empty');
  if (data.screenshot?.sha256) expect(data.screenshot.sha256 === sha256File(screenshotPath), 'screenshot sha256 mismatch');
}

expectMustNotAccept('Public/runtime acceptance');
expectMustNotAccept('Source/provenance custody');
expectMustNotAccept('Publication readiness');
expectMustNotAccept('Definition authority');
expectMustNotAccept('Usage-as-definition authority');
expectMustNotAccept('Accepted translation text');
expectMustNotAccept('Agent 6 acceptance');

if (issues.length) {
  console.error(`Agent 4 live browser runtime evidence validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 4 live browser runtime evidence validation passed for ${report}.`);

function expect(condition, message) {
  if (!condition) issues.push(message);
}

function expectMustNotAccept(fragment) {
  const entries = data.what_must_not_be_accepted;
  const found = Array.isArray(entries)
    && entries.some((entry) => String(entry).toLowerCase().includes(fragment.toLowerCase()));
  expect(found, `what_must_not_be_accepted must include ${fragment}`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function sha256File(relativePath) {
  return createHash('sha256').update(fs.readFileSync(path.join(root, relativePath))).digest('hex');
}
