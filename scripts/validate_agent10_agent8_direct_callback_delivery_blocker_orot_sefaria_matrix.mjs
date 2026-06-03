#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const report = process.argv[2] || 'reports/agent10-agent8-direct-callback-delivery-blocker-orot-sefaria-matrix-2026-06-03.md';
const text = fs.readFileSync(path.join(root, report), 'utf8');
const issues = [];

for (const needle of [
  'Agent 8 direct callback delivery unavailable; callback requires relay.',
  '019e83a3-314c-7c43-9ec9-d56315813437',
  'reports/agent10-agent1-ready-orot-sefaria-family-custody-matrix-request-2026-06-03.md',
  'reports/agent10-agent1-ready-orot-sefaria-family-custody-matrix-request-2026-06-03.json',
  '9eeea791c86e3b7260162afd9fc4e7f611853d8f',
  '019e8d78-221a-7531-8c82-42d4ed3491d7',
  '<codex_delegation>',
  '## Agent 8 Callback',
  'preparatory-only',
  'Do not route Agent 1 yet',
  'What must not be accepted',
]) {
  expect(text.includes(needle), `missing required callback/blocker text: ${needle}`);
}

for (const artifact of [
  'reports/agent10-agent1-ready-orot-sefaria-family-custody-matrix-request-2026-06-03.md',
  'reports/agent10-agent1-ready-orot-sefaria-family-custody-matrix-request-2026-06-03.json',
]) {
  expect(fs.existsSync(path.join(root, artifact)), `referenced artifact missing: ${artifact}`);
}

for (const forbiddenPath of [
  'reports/agent10-live-public-old-hud-guard-2026-06-03-post-agent2-dry-run-pending.json',
  'reports/agent10-live-public-old-hud-guard-2026-06-03-post-agent2-dry-run-pending.md',
  'scripts/validate_agent10_live_public_old_hud_guard.mjs',
]) {
  expect(!fs.existsSync(path.join(root, forbiddenPath)), `out-of-scope guard artifact should not exist: ${forbiddenPath}`);
}

const lower = text.toLowerCase();
for (const forbidden of [
  'qa acceptance granted',
  'license accepted',
  'source custody accepted',
  'answer accepted',
  'publication ready: true',
  'accepted gloss approved',
]) {
  expect(!lower.includes(forbidden), `forbidden acceptance phrase present: ${forbidden}`);
}

if (issues.length) {
  console.error(`Agent 10 Agent 8 callback delivery blocker validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 10 Agent 8 callback delivery blocker validation passed for ${report}.`);

function expect(condition, message) {
  if (!condition) issues.push(message);
}
