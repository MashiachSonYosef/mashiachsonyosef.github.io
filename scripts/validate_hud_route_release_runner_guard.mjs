#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const runnerPath = 'scripts/run_hud_route_release_candidate.mjs';
const source = fs.readFileSync(path.join(root, runnerPath), 'utf8');
const issues = [];

const requiredOrder = [
  'freeze route inputs',
  'validate frozen route input volume',
  'audit frozen route claims',
  'validate frozen route audit',
  'validate HUD route release volume',
  'build HUD route store from freeze',
  'validate HUD route store',
  'build local HUD route lookup',
  'validate local HUD route lookup',
  'validate route answer safety contract',
  'validate HUD route publication script guards',
  'publish public HUD route lookup',
  'validate public HUD route lookup structure',
  'scan public HUD route cards',
  'validate route publication boundary',
  'audit public HUD normalized keys',
  'stamp HUD route release',
  'validate HUD route release stamp',
  'validate frozen route inputs against current sources',
  'validate HUD route release gate',
  'validate HUD route release gate report',
  'validate route publication boundary coherence',
];

validateRequiredGuardFunctions();
validateRequiredOrder();
validatePathScopeGuards();
validateNoBroadRender();

if (issues.length) {
  console.error(`HUD route release runner guard validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 80)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`HUD route release runner guard validation passed. Required order steps: ${requiredOrder.length}.`);

function validateRequiredGuardFunctions() {
  for (const required of [
    'validateReleasePlan(steps);',
    'function validateReleasePlan(plannedSteps)',
    'function validatePathScopes(parsed)',
    'function assertExactPath(label, value, expected)',
    'function assertPathUnder(label, value, expectedPrefix)',
    'function assertFileExtension(label, value, expectedExtension)',
    'function cleanPath(value)',
  ]) {
    if (!source.includes(required)) issues.push(`runner missing guard source: ${required}`);
  }
}

function validateRequiredOrder() {
  const actualOrder = extractRequiredOrder();
  if (!actualOrder.length) {
    issues.push('runner requiredOrder array could not be extracted');
    return;
  }
  for (const requiredLabel of requiredOrder) {
    if (!actualOrder.includes(requiredLabel)) issues.push(`runner requiredOrder missing ${requiredLabel}`);
  }
  for (let index = 0; index < requiredOrder.length - 1; index += 1) {
    const earlier = actualOrder.indexOf(requiredOrder[index]);
    const later = actualOrder.indexOf(requiredOrder[index + 1]);
    if (earlier === -1 || later === -1 || earlier >= later) {
      issues.push(`runner requiredOrder must keep ${requiredOrder[index]} before ${requiredOrder[index + 1]}`);
    }
  }
  for (const [label, args] of Object.entries({
    'validate frozen route input volume': ['--max-lookup-cards', '--max-phrase-evidence-cards'],
    'validate HUD route release volume': ['--max-lookup-cards', '--max-phrase-evidence-cards'],
    'build local HUD route lookup': ['--max-lookup-cards'],
    'publish public HUD route lookup': ['--local-dir', '--public-dir'],
    'stamp HUD route release': ['--freeze-manifest', '--store-manifest', '--lookup-manifest', '--public-manifest', '--route-audit'],
  })) {
    if (!source.includes(`assertStepHasArgs(plannedSteps, '${label}'`)) {
      issues.push(`runner missing assertStepHasArgs for ${label}`);
    }
    for (const arg of args) {
      if (!source.includes(`'${arg}'`)) issues.push(`runner guard missing required arg literal ${arg}`);
    }
  }
}

function validatePathScopeGuards() {
  for (const [label, expectedPath] of Object.entries({
    'source-dir': '.local-cache/definition-routes',
    'freeze-dir': '.local-cache/definition-route-freeze/current',
    'store-dir': '.local-cache/hud-route-store',
    'lookup-dir': '.local-cache/hud-route-lookup',
    'public-dir': 'data/definitions/hud-route-lookup',
    'store-sample': 'data/definitions/hud-route-store-sample.json',
    'lookup-sample': 'data/definitions/hud-route-lookup-sample.json',
    'release-stamp': 'data/definitions/hud-route-release-stamp.json',
    'release-report': 'reports/hud-route-release-stamp.md',
    'gate-report': 'reports/hud-route-release-gate.md',
    'gate-json': 'reports/hud-route-release-gate.json',
    'freeze-volume-report': 'reports/hud-route-freeze-volume-gate.md',
    'freeze-volume-json': 'reports/hud-route-freeze-volume-gate.json',
    'volume-report': 'reports/hud-route-release-volume-gate.md',
    'volume-json': 'reports/hud-route-release-volume-gate.json',
  })) {
    const expected = `assertExactPath('${label}',`;
    if (!source.includes(expected) || !source.includes(`'${expectedPath}'`)) {
      issues.push(`runner missing exact path guard for --${label}: ${expectedPath}`);
    }
  }
  for (const [label, extension] of Object.entries({
    'store-sample': '.json',
    'lookup-sample': '.json',
    'release-stamp': '.json',
    'release-report': '.md',
    'gate-report': '.md',
    'gate-json': '.json',
    'freeze-volume-report': '.md',
    'freeze-volume-json': '.json',
    'volume-report': '.md',
    'volume-json': '.json',
  })) {
    const expected = `assertFileExtension('${label}',`;
    if (!source.includes(expected) || !source.includes(`'${extension}'`)) {
      issues.push(`runner missing file extension guard for --${label} ${extension}`);
    }
  }
  for (const required of [
    'path.isAbsolute(normalized)',
    "normalized.split('/').includes('..')",
    'HUD route release path must be a relative in-repo path',
  ]) {
    if (!source.includes(required)) issues.push(`runner missing unsafe path rejection: ${required}`);
  }
}

function validateNoBroadRender() {
  for (const required of [
    '/render/i.test(step.label)',
    '/render_site\\.ps1$/i.test(script)',
    '/upgrade_route_hud_pages\\.mjs$/i.test(script)',
    'must not include broad render or page-upgrade step',
  ]) {
    if (!source.includes(required)) issues.push(`runner missing broad-render guard: ${required}`);
  }
}

function extractRequiredOrder() {
  const match = source.match(/const requiredOrder = \[([\s\S]*?)\];/);
  if (!match) return [];
  return [...match[1].matchAll(/'([^']+)'/g)].map((item) => item[1]);
}
