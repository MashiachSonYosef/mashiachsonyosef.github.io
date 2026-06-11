#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const targetPath = 'data/control/reader_workbench_expansion_targets.json';
const requiredMarkers = [
  'reader-workbench.js',
  'reader-workbench.css',
  'data-reader-workbench',
  'data-reader-export',
  'data-reader-import',
  'data-route-hud-panel',
  'data-lexical-config',
  'not_a_translation',
];

const data = readJson(targetPath);
const deferred = Array.isArray(data.deferred_targets) ? data.deferred_targets : [];
const trackedSources = new Set(gitLsFiles(deferred.map((target) => target.source_path).filter(Boolean)));
const rows = deferred.map(classifyDeferredTarget);
const ready = rows.filter((row) => row.status === 'ready_after_rerender');
const blocked = rows.filter((row) => row.status !== 'ready_after_rerender');

console.log('Reader Workbench deferred target validation complete.');
console.log(JSON.stringify({
  deferred_targets: rows.length,
  ready_after_rerender: ready.length,
  blocked: blocked.length,
  rows,
}, null, 2));

if (rows.some((row) => row.status === 'invalid')) {
  process.exit(1);
}

function classifyDeferredTarget(target) {
  const missing = [];
  const blockers = [];
  const pagePath = cleanRelativePath(target.page_path || '');
  const sourcePath = cleanRelativePath(target.source_path || '');
  const pageFullPath = path.join(root, pagePath);
  const sourceFullPath = path.join(root, sourcePath);

  if (!target.work_id) missing.push('work_id');
  if (!pagePath) missing.push('page_path');
  if (!sourcePath) missing.push('source_path');
  if (missing.length) {
    return { work_id: target.work_id || '', page_path: target.page_path || '', status: 'invalid', missing };
  }

  if (!fs.existsSync(pageFullPath)) blockers.push('missing_page');
  if (!fs.existsSync(sourceFullPath)) blockers.push('missing_source');
  if (!trackedSources.has(sourcePath)) blockers.push('source_not_tracked');

  let missingMarkers = [];
  if (fs.existsSync(pageFullPath)) {
    const html = fs.readFileSync(pageFullPath, 'utf8');
    missingMarkers = requiredMarkers.filter((marker) => !html.includes(marker));
    if (missingMarkers.length) blockers.push('missing_reader_workbench_markers');
    if (html.includes('data/translation-memory') || html.includes('accepted translation')) {
      blockers.push('publication_or_translation_memory_wording');
    }
  }

  return {
    work_id: target.work_id,
    page_path: pagePath,
    source_path: sourcePath,
    status: blockers.length ? 'blocked' : 'ready_after_rerender',
    blockers,
    missing_markers: missingMarkers,
    original_reason: target.reason || '',
  };
}

function gitLsFiles(paths) {
  if (!paths.length) return [];
  try {
    return execFileSync('git', ['ls-files', '--', ...paths], { cwd: root, encoding: 'utf8' })
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return gitIndexTrackedPaths(paths);
  }
}

function gitIndexTrackedPaths(paths) {
  const indexPath = path.join(root, '.git', 'index');
  if (!fs.existsSync(indexPath)) return [];
  const index = fs.readFileSync(indexPath);
  return paths
    .map((item) => item.replace(/\\/g, '/'))
    .filter((item) => index.indexOf(Buffer.from(item, 'utf8')) !== -1);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

function cleanRelativePath(value) {
  const clean = String(value || '').replace(/\\/g, '/').replace(/^\/+/, '');
  if (!clean || clean.includes('..')) throw new Error(`Unsafe relative path: ${value}`);
  return clean;
}
