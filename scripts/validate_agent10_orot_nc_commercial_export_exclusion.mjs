#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const request = readJson('reports/agent10-orot-nc-public-display-boundary-request-2026-06-03.json');
const ids = new Set((request.rows || []).map((row) => row.token_id));
const issues = [];
const publicHints = readJson('data/public-hud/orot/reader-hints.json');
const hintRows = publicHints.hints && typeof publicHints.hints === 'object' ? publicHints.hints : publicHints.hints_by_token_id;

for (const id of ids) {
  const row = hintRows?.[id];
  expect(Boolean(row), `${id} missing from public hints`);
  if (!row) continue;
  expect(row.license_group === 'CC_BY_NC', `${id} must be CC_BY_NC`);
  expect(row.derived_from_nc === true, `${id} must be derived_from_nc`);
  expect(row.commercial_export_allowed === false, `${id} must not be commercial export allowed`);
  expect(row.commercial_export_exclusion_required === true, `${id} must require commercial export exclusion`);
  expect(row.nc_definition_content_stored_now === false, `${id} must not store NC definition content`);
  expect(row.accepted_text === false, `${id} must not be accepted text`);
}

for (const file of listFiles(path.join(root, 'data/public-hud/orot'))) {
  const relative = path.relative(root, file).replaceAll(path.sep, '/');
  if (relative === 'data/public-hud/orot/reader-hints.json') continue;
  const text = fs.readFileSync(file, 'utf8');
  for (const id of ids) expect(!text.includes(id), `${id} leaked into ${relative}`);
}

if (issues.length) {
  console.error('NC commercial export exclusion validation failed:');
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}
console.log(`NC commercial export exclusion validation passed for ${ids.size} row IDs.`);

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}
function listFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(full));
    else out.push(full);
  }
  return out;
}
function expect(condition, message) {
  if (!condition) issues.push(message);
}
