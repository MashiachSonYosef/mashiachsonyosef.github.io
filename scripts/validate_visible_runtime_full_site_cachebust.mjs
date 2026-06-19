#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const expectedRuntimeVersion = 'visible-na-3916cf24';

function argValue(name) {
  const prefix = `--${name}=`;
  const arg = args.find((value) => value.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : null;
}

const listPath = argValue('page-list');
if (!listPath) {
  console.error('Usage: node scripts/validate_visible_runtime_full_site_cachebust.mjs --page-list=<path>');
  process.exit(2);
}

const root = process.cwd();
const pages = fs.readFileSync(path.resolve(root, listPath), 'utf8')
  .replace(/^\uFEFF/, '')
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean);

const expectedNeedle = `reader-workbench.js?v=${expectedRuntimeVersion}`;
const unversionedNeedle = 'reader-workbench.js"></script>';
const errors = [];
let checked = 0;
let versioned = 0;
let unversioned = 0;

for (const relRaw of pages) {
  const rel = relRaw.replace(/^\.\\/, '').replace(/^\.\//, '');
  const file = path.resolve(root, rel);
  let html;
  try {
    html = fs.readFileSync(file, 'utf8');
  } catch (error) {
    errors.push({ page: rel, error: `read_failed:${error.message}` });
    continue;
  }
  checked += 1;
  if (html.includes(expectedNeedle)) {
    versioned += 1;
  } else {
    errors.push({ page: rel, error: 'missing_expected_runtime_version' });
  }
  if (html.includes(unversionedNeedle)) {
    unversioned += 1;
    errors.push({ page: rel, error: 'has_unversioned_reader_runtime' });
  }
}

const output = {
  ok: errors.length === 0,
  page_list: listPath,
  expected_runtime_version: expectedRuntimeVersion,
  pages: pages.length,
  checked,
  versioned,
  unversioned,
  errors,
};

console.log(JSON.stringify(output, null, 2));
if (!output.ok) process.exit(1);
