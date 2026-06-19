#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

function argValues(name) {
  const values = [];
  process.argv.slice(2).forEach((arg, index, all) => {
    if (arg === `--${name}` && all[index + 1]) values.push(all[index + 1]);
    else if (arg.startsWith(`--${name}=`)) values.push(arg.slice(name.length + 3));
  });
  return values;
}

function usage() {
  console.error('usage: node scripts/validate_visible_runtime_rollout_checkpoint.mjs --target-root=<path> --page=<page/slug> [--page=<page/slug>]');
  process.exit(2);
}

const targetRoot = argValues('target-root')[0];
const pages = argValues('page');
if (!targetRoot || !pages.length) usage();

const expectedRuntimeVersion = 'visible-na-3916cf24';
const sourceRoot = process.cwd();
const targetAbs = path.resolve(sourceRoot, targetRoot);

function filePath(root, rel) {
  return path.resolve(root, rel.replace(/[\\/]+/g, path.sep));
}

function exists(root, rel) {
  return fs.existsSync(filePath(root, rel));
}

function sha256(root, rel) {
  const file = filePath(root, rel);
  if (!fs.existsSync(file)) return null;
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function hashesMatch(rel) {
  const sourceHash = sha256(sourceRoot, rel);
  const targetHash = sha256(targetAbs, rel);
  return Boolean(sourceHash && targetHash && sourceHash === targetHash);
}

function readText(root, rel) {
  const file = filePath(root, rel);
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

function readJson(root, rel) {
  const text = readText(root, rel);
  if (!text) return null;
  return JSON.parse(text);
}

function lexicalConfig(root, page) {
  const html = readText(root, `${page}/index.html`);
  const match = html.match(/<script type="application\/json" data-lexical-config>([\s\S]*?)<\/script>/);
  return match ? JSON.parse(match[1]) : null;
}

function readerRuntimeSrc(root, page) {
  const html = readText(root, `${page}/index.html`);
  const match = html.match(/<script src="([^"]*assets\/js\/reader-workbench\.js[^"]*)"><\/script>/);
  return match ? match[1] : '';
}

function resolvePageRelative(page, value) {
  if (!value) return null;
  return path.posix.normalize(path.posix.join(path.posix.dirname(`${page}/index.html`), value.replace(/\\/g, '/')));
}

function requiredRels(page, config) {
  const rels = [
    `${page}/index.html`,
    'assets/js/reader-workbench.js',
    'assets/css/reader-workbench.css',
  ];
  ['manifest_url', 'occurrence_url', 'reader_hint_url', 'hud_route_lookup_manifest_url'].forEach((key) => {
    const rel = resolvePageRelative(page, config?.[key]);
    if (rel) rels.push(rel);
  });
  const manifestRel = resolvePageRelative(page, config?.manifest_url);
  const manifest = manifestRel ? readJson(sourceRoot, manifestRel) : null;
  const firstChunk = Array.isArray(manifest?.chunks) ? manifest.chunks[0] : null;
  const chunkPath = typeof firstChunk === 'string' ? firstChunk : firstChunk?.path;
  if (manifestRel && chunkPath) {
    rels.push(path.posix.normalize(path.posix.join(path.posix.dirname(manifestRel), chunkPath)));
  }
  return [...new Set(rels)];
}

const targetRuntime = readText(targetAbs, 'assets/js/reader-workbench.js');
const runtimeChecks = {
  has_n_a_placeholder: targetRuntime.includes("PREHUD_PLACEHOLDER_TEXT = 'N/A'"),
  has_visible_slot_gate: targetRuntime.includes('applyVisibleDisplaySlots'),
  has_tbd_literal: targetRuntime.includes('TBD'),
};

const pageResults = pages.map((page) => {
  const sourceConfig = lexicalConfig(sourceRoot, page);
  const targetConfig = lexicalConfig(targetAbs, page);
  const sourceRuntimeSrc = readerRuntimeSrc(sourceRoot, page);
  const targetRuntimeSrc = readerRuntimeSrc(targetAbs, page);
  const rels = requiredRels(page, sourceConfig);
  const files = rels.map((rel) => ({
    rel,
    source_exists: exists(sourceRoot, rel),
    target_exists: exists(targetAbs, rel),
    match: hashesMatch(rel),
  }));
  return {
    page,
    source_reader_layout_mode: sourceConfig?.reader_layout_mode || null,
    target_reader_layout_mode: targetConfig?.reader_layout_mode || null,
    source_runtime_src: sourceRuntimeSrc,
    target_runtime_src: targetRuntimeSrc,
    required_files: files,
    ok: Boolean(
      sourceConfig
      && targetConfig
      && sourceConfig.reader_layout_mode === 'prehud_rows'
      && targetConfig.reader_layout_mode === 'prehud_rows'
      && sourceRuntimeSrc.includes(`v=${expectedRuntimeVersion}`)
      && targetRuntimeSrc.includes(`v=${expectedRuntimeVersion}`)
      && files.every((file) => file.source_exists && file.target_exists && file.match)
    ),
  };
});

const errors = [];
if (!runtimeChecks.has_n_a_placeholder) errors.push('target runtime missing PREHUD_PLACEHOLDER_TEXT N/A gate');
if (!runtimeChecks.has_visible_slot_gate) errors.push('target runtime missing visible slot application gate');
if (runtimeChecks.has_tbd_literal) errors.push('target runtime still contains TBD literal');
pageResults.forEach((result) => {
  if (!result.ok) errors.push(`${result.page} source/target rollout files are not aligned`);
});

const output = {
  ok: errors.length === 0,
  target_root: targetRoot,
  pages_checked: pages.length,
  expected_runtime_version: expectedRuntimeVersion,
  runtime_checks: runtimeChecks,
  page_results: pageResults,
  hydration_wait_hint_ms: 30000,
  errors,
};

console.log(JSON.stringify(output, null, 2));
if (!output.ok) process.exit(1);
