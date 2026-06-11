#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const defaults = {
  templatePage: 'halakhah/yad-david-on-mishneh-torah-robbery-and-lost-property/index.html',
  report: 'reports/route-hud-page-upgrade-report.md',
};

const skipDirs = new Set(['.git', '.local-cache', 'node_modules', '.codex', '.codex-tmp']);

function parseArgs(argv) {
  const args = { ...defaults };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--template-page') args.templatePage = argv[++i];
    else if (arg === '--report') args.report = argv[++i];
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

function usage() {
  return [
    'Usage:',
    '  node scripts/upgrade_route_hud_pages.mjs',
    '',
    'Replaces the old generated lexical HUD shell/runtime in existing work pages',
    'with the route HUD shell/runtime from a validated smoke-rendered page.',
  ].join('\n');
}

function abs(relPath) {
  return path.join(root, relPath);
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeText(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function htmlAttr(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function extractTemplate(templateHtml) {
  const style = templateHtml.match(/  <style>[\s\S]*?<\/style>/)?.[0];
  const hud = templateHtml.match(/  <section class="lexical-hud" data-lexical-hud hidden aria-live="polite">[\s\S]*?  <\/section>/)?.[0];
  const runtime = [...templateHtml.matchAll(/  <script>\r?\n[\s\S]*?  <\/script>/g)]
    .map((match) => match[0])
    .find((script) => script.includes('routeLookupManifestUrl') && script.includes('renderRouteHudPanel'));
  if (!style) throw new Error('Template page missing <style> block');
  if (!hud) throw new Error('Template page missing route HUD section');
  if (!runtime) throw new Error('Template page missing route HUD runtime script');
  return { style, hud, runtime };
}

function listIndexPages(dir = root, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (skipDirs.has(entry.name)) continue;
      listIndexPages(path.join(dir, entry.name), out);
    } else if (entry.isFile() && entry.name === 'index.html') {
      out.push(path.join(dir, entry.name));
    }
  }
  return out;
}

function routeLookupUrl(config) {
  if (config.hud_route_lookup_manifest_url) return config.hud_route_lookup_manifest_url;
  const rootHref = config.root_href || './';
  return `${rootHref}data/definitions/hud-route-lookup/manifest.json`;
}

function updateConfig(html) {
  let nextConfig = null;
  const updated = html.replace(
    /<script type="application\/json" data-lexical-config>([\s\S]*?)<\/script>/,
    (full, jsonText) => {
      const config = JSON.parse(jsonText);
      config.hud_route_lookup_manifest_url = routeLookupUrl(config);
      nextConfig = config;
      return `<script type="application/json" data-lexical-config>${JSON.stringify(config).replace(/<\/script/gi, '<\\/script')}</script>`;
    },
  );
  return { html: updated, config: nextConfig };
}

function downloadBlock(config) {
  const links = [];
  if (config?.manifest_url) {
    links.push(`<a class="export-button" href="${htmlAttr(config.manifest_url)}">HUD token manifest</a>`);
  }
  if (config?.hud_route_lookup_manifest_url) {
    links.push(`<a class="export-button" href="${htmlAttr(config.hud_route_lookup_manifest_url)}">Route lookup manifest</a>`);
  }
  if (!links.length) return null;
  return [
    '        <div class="license-notice lexical-downloads">',
    '          <strong>HUD data:</strong> Book-local token bridge plus route-card lookup files. Route rows are study evidence, not polished translations.',
    `          <p class="export-actions">${links.join('')}</p>`,
    '        </div>',
  ].join('\n');
}

function upgradePage(filePath, template) {
  const relPath = path.relative(root, filePath).replace(/\\/g, '/');
  let html = readText(filePath);
  if (!html.includes('data-lexical-hud')) return { relPath, skipped: true };
  const before = html;
  const issues = [];

  html = html.replace(/  <style>[\s\S]*?<\/style>/, template.style);
  html = html.replace(
    /  <section class="lexical-hud" data-lexical-hud hidden aria-live="polite">[\s\S]*?  <\/section>/,
    template.hud,
  );
  const configResult = updateConfig(html);
  html = configResult.html;
  const block = downloadBlock(configResult.config);
  if (block) {
    html = html.replace(/        <div class="license-notice lexical-downloads">[\s\S]*?        <\/div>/, block);
  }
  const runtimeReplaced = html.replace(
    /  <script>\r?\n[\s\S]*?  <\/script>(?=\r?\n<\/body>)/,
    template.runtime,
  );
  html = runtimeReplaced;

  for (const required of ['data-route-hud-panel', 'Route HUD', 'Best actual hit', 'Full source and license rows', 'hud_route_lookup_manifest_url']) {
    if (!html.includes(required)) issues.push(`missing ${required}`);
  }
  for (const forbidden of ['lexical-fields', 'Clicked Hebrew form', 'Potential options', 'No lexical entry yet.', 'data-hud-renderings']) {
    if (html.includes(forbidden)) issues.push(`stale ${forbidden}`);
  }

  if (issues.length) return { relPath, upgraded: false, issues };
  if (html !== before) writeText(filePath, html);
  return { relPath, upgraded: html !== before, bytes: Buffer.byteLength(html) };
}

function renderReport(results, reportPath) {
  const upgraded = results.filter((result) => result.upgraded).length;
  const skipped = results.filter((result) => result.skipped).length;
  const unchanged = results.filter((result) => !result.upgraded && !result.skipped && !result.issues).length;
  const failed = results.filter((result) => result.issues?.length);
  const lines = [
    '# Route HUD Page Upgrade Report',
    '',
    'Existing generated pages were upgraded in place from the old lexical HUD shell/runtime to the route HUD shell/runtime.',
    '',
    `- Upgraded pages: ${upgraded}`,
    `- Already current pages: ${unchanged}`,
    `- Pages without HUD skipped: ${skipped}`,
    `- Failed pages: ${failed.length}`,
    '',
  ];
  if (failed.length) {
    lines.push('## Failures', '');
    for (const item of failed.slice(0, 50)) lines.push(`- ${item.relPath}: ${item.issues.join('; ')}`);
    lines.push('');
  }
  lines.push('## Sample Upgrades', '');
  for (const item of results.filter((result) => result.upgraded).slice(0, 30)) {
    lines.push(`- ${item.relPath}`);
  }
  lines.push('');
  writeText(abs(reportPath), `${lines.join('\n')}\n`);
}

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  console.log(usage());
  process.exit(0);
}

const template = extractTemplate(readText(abs(args.templatePage)));
const results = listIndexPages().map((filePath) => upgradePage(filePath, template));
renderReport(results, args.report);

const failed = results.filter((result) => result.issues?.length);
if (failed.length) {
  console.error(`Route HUD page upgrade failed for ${failed.length} page(s).`);
  for (const item of failed.slice(0, 20)) console.error(`- ${item.relPath}: ${item.issues.join('; ')}`);
  process.exit(1);
}

console.log(JSON.stringify({
  upgraded: results.filter((result) => result.upgraded).length,
  already_current: results.filter((result) => !result.upgraded && !result.skipped && !result.issues).length,
  skipped: results.filter((result) => result.skipped).length,
  report: args.report,
}, null, 2));
