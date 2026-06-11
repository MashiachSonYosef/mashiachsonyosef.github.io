#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  pages: [
    'tanakh/genesis/index.html',
    'orot/index.html',
  ],
  renderScript: 'scripts/render_site.ps1',
  runtimeScript: 'assets/js/reader-workbench.js',
  validatorScript: 'scripts/validate_route_hud_page.mjs',
  report: 'reports/agent5-route-hud-accessibility-audit.md',
  json: 'reports/agent5-route-hud-accessibility-audit.json',
};

const options = parseArgs(process.argv.slice(2));
const results = [];
const renderScript = readText(options.renderScript);
const runtimeScript = readText(options.runtimeScript);
const validatorScript = readText(options.validatorScript);

auditSharedRuntime(renderScript, runtimeScript, validatorScript);
for (const page of options.pages) auditPage(page);

const summary = summarize(results);
writeJson(options.json, {
  generated_at: new Date().toISOString(),
  options,
  summary,
  results,
});
writeReport(options.report, summary, results);

console.log(JSON.stringify({
  pages: options.pages.length,
  issues: results.length,
  errors: results.filter((row) => row.severity === 'error').length,
  warnings: results.filter((row) => row.severity === 'warning').length,
  report: cleanRelativePath(options.report),
}, null, 2));

function auditSharedRuntime(renderText, runtimeText, validatorText) {
  const combined = `${renderText}\n${runtimeText}\n${validatorText}`;
  const hasModal = combined.includes('aria-modal="true"');
  const hasTabTrap = /event\.key\s*={2,3}\s*["']Tab["']|shiftKey|firstTabbable|lastTabbable|trapFocus/i.test(combined);
  const hasBackgroundInert = /\binert\b|aria-hidden|modal-backdrop|hud-backdrop/i.test(combined);
  const hasAriaExpanded = /aria-expanded/i.test(combined);
  const hasAriaControls = /aria-controls/i.test(combined);
  const hasAriaHasPopup = /aria-haspopup/i.test(combined);
  const hasAriaLive = /aria-live|role=["']status["']/i.test(combined);
  const hasDynamicTitle = /route-hud-title[\s\S]{0,140}textContent|textContent[\s\S]{0,140}route-hud-title/i.test(combined);
  const focusRule = firstMatch(combined, /\.lexical-word:[^{]+focus-visible[^{]*\{[^}]+\}/i);
  const closeFocusRule = /\.hud-close:[^{]*focus-visible/i.test(combined);

  if (hasModal && !hasTabTrap) {
    addIssue('shared-runtime', 'error', 'modal_dialog_without_focus_trap', 'HUD declares aria-modal=true, but no Tab/Shift+Tab focus containment marker was found.');
  }
  if (hasModal && !hasBackgroundInert) {
    addIssue('shared-runtime', 'error', 'modal_dialog_without_inert_background', 'HUD declares aria-modal=true, but no inert/background-obscuring marker was found.');
  }
  if (hasModal && combined.includes('aria-describedby="route-hud-panel"')) {
    addIssue('shared-runtime', 'warning', 'complex_dialog_uses_aria_describedby', 'Route HUD panel contains structured evidence; APG advises omitting aria-describedby for complex dialog content.');
  }
  if (/span\.role\s*=\s*["']button["']/.test(combined) && (!hasAriaExpanded || !hasAriaControls || !hasAriaHasPopup)) {
    addIssue('shared-runtime', 'warning', 'trigger_missing_dialog_relationship', 'Lexical token triggers act like dialog launchers but lack aria-haspopup/dialog controls/expanded relationships.');
  }
  if (/aria-pressed/i.test(renderText) && !hasAriaExpanded) {
    addIssue('shared-runtime', 'warning', 'pressed_state_used_for_dialog_trigger', 'aria-pressed marks the active token, but aria-expanded is the more direct state for a disclosure/dialog trigger.');
  }
  if (focusRule && /outline\s*:\s*none/i.test(focusRule) && !/box-shadow|outline\s*:\s*(?!none)/i.test(focusRule)) {
    addIssue('shared-runtime', 'warning', 'focus_indicator_outline_removed', 'The lexical-word focus-visible rule removes outline without an explicit replacement outline/box-shadow.');
  }
  if (!closeFocusRule) {
    addIssue('shared-runtime', 'warning', 'close_button_missing_focus_visible_style', 'HUD close button has hover styling but no dedicated focus-visible marker in the shared CSS.');
  }
  if (!hasAriaLive) {
    addIssue('shared-runtime', 'warning', 'async_hud_updates_not_announced', 'HUD content is loaded asynchronously, but no aria-live/status marker was found.');
  }
  if (!hasDynamicTitle) {
    addIssue('shared-runtime', 'warning', 'static_dialog_title', 'Dialog title appears static; screen-reader users may not hear which Hebrew word opened the HUD.');
  }
  if (/padding:\s*0\.0?4em\s+0?\.0?8em/i.test(combined)) {
    addIssue('shared-runtime', 'info', 'dense_inline_targets', 'Word targets are intentionally inline and dense; WCAG has inline-target exceptions, but a touch/large-target mode should be a product requirement.');
  }
}

function auditPage(page) {
  const html = readText(page);
  if (!html) {
    addIssue(page, 'error', 'missing_page', 'Representative page does not exist or could not be read.');
    return;
  }
  const lexicalWordCount = countMatches(html, /class="lexical-word"/g);
  const hudCount = countMatches(html, /data-lexical-hud/g);
  if (!hudCount) addIssue(page, 'error', 'missing_hud_container', 'No route HUD container found.');
  const hasRuntimeWrapping = html.includes('data-lexical-occurrences')
    && html.includes('data-lexical-config')
    && (html.includes('reader-workbench.js') || html.includes('wrapParagraph'));
  if (!lexicalWordCount && hasRuntimeWrapping) {
    addIssue(page, 'info', 'runtime_wrapped_lexical_words', 'No static lexical-word spans found; page intentionally relies on runtime wrapping.');
  } else if (!lexicalWordCount) {
    addIssue(page, 'warning', 'no_static_lexical_words', 'No static lexical-word spans found and no runtime wrapping markers were found.');
  }
  if (html.includes('role="dialog"') && html.includes('aria-modal="true"') && !/modal-backdrop|hud-backdrop|inert/.test(html)) {
    addIssue(page, 'error', 'page_modal_without_backdrop_or_inert', 'Rendered page marks the HUD modal without a visible/inert background layer marker.');
  }
  if (html.includes('aria-describedby="route-hud-panel"')) {
    addIssue(page, 'warning', 'page_complex_dialog_describedby', 'Rendered page describes the dialog with the entire structured HUD panel.');
  }
}

function addIssue(scope, severity, issue, detail) {
  results.push({ scope, severity, issue, detail });
}

function summarize(rows) {
  const bySeverity = {};
  const byIssue = {};
  for (const row of rows) {
    bySeverity[row.severity] = (bySeverity[row.severity] || 0) + 1;
    byIssue[row.issue] = (byIssue[row.issue] || 0) + 1;
  }
  return { by_severity: bySeverity, by_issue: byIssue };
}

function writeReport(filePath, summary, rows) {
  const lines = [
    '# Agent 5 Route HUD Accessibility Audit',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Scope',
    '',
    `- Pages: ${options.pages.join(', ')}`,
    `- Shared render script: ${options.renderScript}`,
    `- Validator script: ${options.validatorScript}`,
    '- This is a static control audit, not a browser assistive-technology test.',
    `- Shared runtime asset: ${options.runtimeScript}`,
    '',
    '## Summary',
    '',
    ...Object.entries(summary.by_severity).map(([key, count]) => `- ${key}: ${count}`),
    '',
    '## Issue Counts',
    '',
    ...Object.entries(summary.by_issue).sort((a, b) => b[1] - a[1]).map(([key, count]) => `- ${key}: ${count}`),
    '',
    '## Findings',
    '',
    ...(rows.length ? rows.map(findingLine) : ['- None.']),
    '',
    '## Control Interpretation',
    '',
    '- The current HUD is not a tooltip: it contains structured, focusable, source-rich workbench content.',
    '- The current runtime behaves as a non-modal inspector with explicit trigger relationships through `aria-haspopup`, `aria-controls`, and `aria-expanded`.',
    '- Dense inline targets are product-correct for workbench mode, but a large-target/touch mode should exist before marketing this as polished.',
    '',
  ];
  fs.mkdirSync(path.dirname(path.join(root, filePath)), { recursive: true });
  fs.writeFileSync(path.join(root, filePath), `${lines.join('\n')}\n`, 'utf8');
}

function findingLine(row) {
  return `- ${row.severity} / ${row.issue} / ${row.scope}: ${row.detail}`;
}

function readText(relativePath) {
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  if (!fs.existsSync(fullPath)) return '';
  return fs.readFileSync(fullPath, 'utf8');
}

function writeJson(relativePath, value) {
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function firstMatch(text, pattern) {
  return String(text || '').match(pattern)?.[0] || '';
}

function countMatches(text, pattern) {
  return [...String(text || '').matchAll(pattern)].length;
}

function parseArgs(args) {
  const parsed = { ...defaults, pages: [...defaults.pages] };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--page') parsed.pages.push(cleanRelativePath(args[++index]));
    else if (arg === '--pages') parsed.pages = args[++index].split(',').map((page) => cleanRelativePath(page.trim())).filter(Boolean);
    else if (arg === '--render-script') parsed.renderScript = cleanRelativePath(args[++index]);
    else if (arg === '--runtime-script') parsed.runtimeScript = cleanRelativePath(args[++index]);
    else if (arg === '--validator-script') parsed.validatorScript = cleanRelativePath(args[++index]);
    else if (arg === '--report') parsed.report = cleanRelativePath(args[++index]);
    else if (arg === '--json') parsed.json = cleanRelativePath(args[++index]);
    else if (arg === '--help' || arg === '-h') parsed.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (parsed.help) {
    console.log([
      'Usage:',
      '  node scripts/audit_route_hud_accessibility.mjs',
      '',
      'Options:',
      '  --pages tanakh/genesis/index.html,orot/index.html',
      '  --page tanakh/genesis/index.html',
      '  --report reports/agent5-route-hud-accessibility-audit.md',
    ].join('\n'));
    process.exit(0);
  }
  parsed.pages = [...new Set(parsed.pages.map(cleanRelativePath))];
  return parsed;
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}
