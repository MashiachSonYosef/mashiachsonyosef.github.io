#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const requiredMarkers = [
  'data-lexical-occurrences',
  'data-lexical-config',
  'data-lexical-slot',
  'data-lexical-hud',
  'data-route-hud-panel',
  'Route HUD',
  'role="dialog"',
  'aria-labelledby="route-hud-title"',
  'aria-live="polite"',
  'aria-haspopup", "dialog"',
  'aria-controls", "route-hud-panel"',
  'aria-expanded", "false"',
  'id="route-hud-title"',
  'id="route-hud-panel"',
  'aria-label="Close route HUD"',
  'tabindex="-1"',
  'Definition',
  'Strict Hebrew matches',
  'Strict Aramaic matches',
  'Lemma matches',
  'Word-part breakdown',
  'Citable definition/paraphrase matches',
  'Usage evidence',
  'observed usage only',
  'usage-evidence-details',
  'article.dataset.rankBasis',
  'Sources and licenses',
  'source-footnotes',
  'hud_route_lookup_manifest_url',
  'answer_eligible',
  'answer_role',
  'lookupCandidateTreatments',
  'hero-summary',
  'hero-notes',
  'prefix-stripped candidate',
  'plural-suffix candidate',
  'possessive-suffix candidate',
  'maqaf component',
  'closeRouteHud',
  'restoreFocus',
  'buttonToRestore.focus',
  'Escape',
  'hud.focus',
];

const forbiddenMarkers = [
  'Clicked Hebrew form',
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
  'Best actual hit',
  'Full source and license rows',
  'inline-gloss',
  'routeHudInlineGlossMode',
  'The focus token is marked so the surrounding words do not become the definition.',
  '<big>',
  '&lt;big',
  'source-details',
  'source-row',
  'source-claim',
  'renderSourceGroups',
  'routeSourceGroups',
  'sourceSummary =',
  'sourceRowMap',
  'hud-scroll-note',
  'cleanTransliteration',
  'Rank details',
];

function parseArgs(argv) {
  const args = { pages: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--page') args.pages.push(argv[++i]);
    else if (arg === '--help' || arg === '-h') args.help = true;
    else args.pages.push(arg);
  }
  if (!args.pages.length) {
    args.pages.push('halakhah/yad-david-on-mishneh-torah-robbery-and-lost-property/index.html');
  }
  return args;
}

function usage() {
  return [
    'Usage:',
    '  node scripts/validate_route_hud_page.mjs --page path/to/index.html',
    '',
    'If no page is supplied, validates the current smoke-rendered Yad David page.',
  ].join('\n');
}

function pageScripts(html) {
  return [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => match[1]);
}

function linkedRuntimeScripts(html, relPath, issues) {
  const pageDir = path.dirname(path.join(root, relPath));
  const scripts = [];
  for (const match of html.matchAll(/<script\s+[^>]*src="([^"]*reader-workbench\.js)"[^>]*><\/script>/g)) {
    const src = match[1].replaceAll('&amp;', '&');
    const scriptPath = path.resolve(pageDir, src);
    if (!scriptPath.startsWith(root + path.sep)) {
      issues.push(`linked runtime escapes workspace: ${src}`);
      continue;
    }
    if (!fs.existsSync(scriptPath)) {
      issues.push(`missing linked runtime: ${src}`);
      continue;
    }
    scripts.push(fs.readFileSync(scriptPath, 'utf8'));
  }
  return scripts;
}

function validatePage(relPath) {
  const pagePath = path.join(root, relPath);
  const issues = [];
  if (!fs.existsSync(pagePath)) return [`missing page: ${relPath}`];
  const html = fs.readFileSync(pagePath, 'utf8');
  const linkedRuntime = linkedRuntimeScripts(html, relPath, issues);
  const searchableText = [html, ...linkedRuntime].join('\n');

  for (const marker of requiredMarkers) {
    if (!searchableText.includes(marker)) issues.push(`missing required marker: ${marker}`);
  }
  for (const marker of forbiddenMarkers) {
    if (html.includes(marker)) issues.push(`contains stale old-HUD marker: ${marker}`);
  }
  for (const match of html.matchAll(/data-hud-[a-z-]+/g)) {
    if (!['data-hud-close', 'data-hud-runtime-contract'].includes(match[0])) {
      issues.push(`unexpected data-hud marker: ${match[0]}`);
    }
  }
  for (const [index, script] of pageScripts(html).entries()) {
    try {
      new Function(script);
    } catch (error) {
      issues.push(`inline script ${index + 1} failed to parse: ${error.message}`);
    }
  }
  for (const [index, script] of linkedRuntime.entries()) {
    try {
      new Function(script);
    } catch (error) {
      issues.push(`linked reader runtime ${index + 1} failed to parse: ${error.message}`);
    }
  }
  return issues.map((issue) => `${relPath}: ${issue}`);
}

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  console.log(usage());
  process.exit(0);
}

const issues = args.pages.flatMap(validatePage);
if (issues.length) {
  console.error(`Route HUD page validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Route HUD page validation passed for ${args.pages.length} page(s).`);
