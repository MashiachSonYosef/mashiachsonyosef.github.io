#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const previewPath = path.join(root, 'hud-preview', 'routes', 'index.html');
const appPath = path.join(root, 'hud-preview', 'routes', 'app.js');
const issues = [];

function fail() {
  if (!issues.length) {
    console.log('HUD route preview validation passed.');
    return;
  }
  console.error(`HUD route preview validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

if (!fs.existsSync(previewPath)) {
  issues.push('missing hud-preview/routes/index.html');
  fail();
}
if (!fs.existsSync(appPath)) issues.push('missing hud-preview/routes/app.js');

const html = fs.readFileSync(previewPath, 'utf8');
const app = fs.existsSync(appPath) ? fs.readFileSync(appPath, 'utf8') : '';
const combined = `${html}\n${app}`;

for (const forbidden of [
  /\bPotential\b/i,
  /potential option/i,
  /low confidence/i,
  /Click anywhere/i,
  /<details/i,
]) {
  if (forbidden.test(combined)) issues.push(`preview contains forbidden pattern ${forbidden}`);
}

for (const required of [
  'Best actual hit',
  'Strict Hebrew matches',
  'Strict Aramaic matches',
  'Lemma matches',
  'Licensed phrase use',
  'Full source and license rows',
  'Tiny checks only',
  'grid-auto-flow: column',
  'document.addEventListener("wheel"',
  'passive: false',
  'hud-route-data',
  'app.js',
]) {
  if (!combined.includes(required)) issues.push(`preview missing required text: ${required}`);
}

const jsonMatch = html.match(/<script type="application\/json" id="hud-route-data">([\s\S]*?)<\/script>/);
if (!jsonMatch) {
  issues.push('preview missing JSON data script');
} else {
  try {
    const data = JSON.parse(jsonMatch[1]);
    if (!data.contract?.rendering_rules?.source_license_expanded_by_default) {
      issues.push('embedded contract does not require expanded source/license rows');
    }
    if (!Array.isArray(data.fixtures?.samples) || !data.fixtures.samples.length) {
      issues.push('embedded route fixtures are empty');
    }
    if (!Array.isArray(data.storeSample?.sample_tokens) || !data.storeSample.sample_tokens.length) {
      issues.push('embedded route-store sample is empty');
    }
  } catch (error) {
    issues.push(`embedded JSON does not parse: ${error.message}`);
  }
}

const scriptBlocks = [app];
for (const [index, script] of scriptBlocks.entries()) {
  try {
    new Function(script);
  } catch (error) {
    issues.push(`preview script ${index} syntax failed: ${error.message}`);
  }
}

fail();
