#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const targetPath = 'data/control/reader_workbench_followup_targets.json';
const issues = [];
const warnings = [];
const requiredPageMarkers = [
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
const targets = Array.isArray(data.targets) ? data.targets : [];
const included = targets.filter((target) => target.include_in_next_followup === true);
const trackedSources = new Set(gitLsFiles(included.map((target) => target.source_path).filter(Boolean)));

if (data.schema_version !== 1) issues.push('schema_version must be 1');
if (data.artifact_type !== 'reader_workbench_followup_targets') issues.push('artifact_type must be reader_workbench_followup_targets');
if (data.global_boundary?.mode !== 'local_only_guided_gloss_assembly') issues.push('global_boundary.mode must be local_only_guided_gloss_assembly');
if (data.global_boundary?.publication_status !== 'not_a_translation') issues.push('global_boundary.publication_status must be not_a_translation');
if (data.global_boundary?.publication_ready !== false) issues.push('global_boundary.publication_ready must be false');
if (data.global_boundary?.accepted_translation_text !== false) issues.push('global_boundary.accepted_translation_text must be false');
if (!included.length) issues.push('targets must include at least one follow-up target');

const seenPages = new Set();
const lanes = new Set();
for (const [index, target] of included.entries()) {
  const context = `targets[${index}] ${target.work_id || 'missing-work-id'}`;
  for (const field of ['work_id', 'work_slug', 'page_path', 'source_path', 'lane', 'why']) {
    if (!target[field]) issues.push(`${context}: missing ${field}`);
  }
  if (target.source_audit_scope !== 'tracked_source') issues.push(`${context}: source_audit_scope must be tracked_source`);
  if (seenPages.has(target.page_path)) issues.push(`${context}: duplicate page_path ${target.page_path}`);
  seenPages.add(target.page_path);
  lanes.add(target.lane);

  const pageFullPath = path.join(root, cleanRelativePath(target.page_path || ''));
  const sourceFullPath = path.join(root, cleanRelativePath(target.source_path || ''));
  if (!fs.existsSync(pageFullPath)) {
    issues.push(`${context}: missing page ${target.page_path}`);
  } else {
    validatePageMarkers(target, fs.readFileSync(pageFullPath, 'utf8'), context);
  }
  if (!fs.existsSync(sourceFullPath)) {
    issues.push(`${context}: missing source ${target.source_path}`);
  } else if (!trackedSources.has(target.source_path)) {
    issues.push(`${context}: source_path is not tracked by git: ${target.source_path}`);
  }
}

for (const lane of ['tanakh_commentary', 'halakhah_liturgy', 'modern_hebrew_thought']) {
  if (!lanes.has(lane)) warnings.push(`representative follow-up lane not present: ${lane}`);
}

for (const [index, target] of (data.blocked_targets || []).entries()) {
  const context = `blocked_targets[${index}] ${target.work_id || 'missing-work-id'}`;
  if (!target.reason) issues.push(`${context}: missing reason`);
  if (target.include_in_next_followup === true) issues.push(`${context}: blocked target must not be included`);
}

if (issues.length) {
  console.error(`Reader Workbench follow-up target validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  if (warnings.length) {
    console.error('Warnings:');
    for (const warning of warnings) console.error(`- ${warning}`);
  }
  process.exit(1);
}

console.log('Reader Workbench follow-up target validation passed.');
console.log(JSON.stringify({
  included_targets: included.length,
  lanes: [...lanes].sort(),
  blocked_targets: (data.blocked_targets || []).length,
  warnings,
}, null, 2));

function validatePageMarkers(target, html, context) {
  for (const marker of requiredPageMarkers) {
    if (!html.includes(marker)) issues.push(`${context}: page missing marker ${marker}`);
  }
  if (html.includes('data/translation-memory') || html.includes('accepted translation')) {
    issues.push(`${context}: page contains publication/translation-memory wording`);
  }
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
