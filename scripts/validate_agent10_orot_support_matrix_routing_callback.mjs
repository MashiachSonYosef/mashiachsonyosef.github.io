#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const report = process.argv[2] || 'reports/agent10-agent8-orot-support-matrix-routing-callback-2026-06-03.md';
const text = fs.readFileSync(path.join(root, report), 'utf8');
const issues = [];

for (const needle of [
  'Status: release-owner routing advice only.',
  'Current Bottleneck',
  'One Next Executable Route',
  'Agent 8 should route Agent 1 next.',
  'Freeze Routing',
  'Agent 8 Callback',
  'What Must Not Be Accepted',
]) {
  expect(text.includes(needle), `missing required phrase: ${needle}`);
}

for (const family of [
  'Jastrow Dictionary',
  'BDB Dictionary',
  'BDB Aramaic Dictionary',
  'Klein Dictionary',
  'BDB Augmented Strong',
]) {
  expect(text.includes(family), `missing lexicon family: ${family}`);
}

for (const artifact of [
  'reports/agent12-agent13-orot-1-2-4-support-matrix-2026-06-03.md',
  'reports/agent10-orot-sefaria-license-safe-answer-transform-contract-2026-06-03.md',
  'reports/agent2-orot-sefaria-lexicon-hit-audit-2026-06-03.md',
  'reports/agent2-orot-sefaria-public-domain-candidate-preview-2026-06-03.md',
  'reports/agent10-agent1-sefaria-lexicon-license-boundary-request-2026-06-03.md',
]) {
  expect(text.includes(artifact), `missing artifact reference: ${artifact}`);
  expect(fs.existsSync(path.join(root, artifact)), `referenced artifact does not exist: ${artifact}`);
}

for (const freeze of [
  'Agent 2 fill-producing transform work.',
  'Agent 2 `answer_eligible=true` candidate emission.',
  'Agent 4 runtime/browser proof.',
  'render/deploy/public validators for this Orot/Sefaria lane.',
  'broad Sefaria import or top-N expansion.',
]) {
  expect(text.includes(freeze), `missing freeze item: ${freeze}`);
}

const lower = text.toLowerCase();
for (const forbidden of [
  'qa acceptance granted',
  'license accepted',
  'source custody accepted',
  'definition authority accepted',
  'publication ready: true',
  'answer accepted',
]) {
  expect(!lower.includes(forbidden), `forbidden acceptance phrase present: ${forbidden}`);
}

if (issues.length) {
  console.error(`Agent 10 Orot support matrix routing callback validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 10 Orot support matrix routing callback validation passed for ${report}.`);

function expect(condition, message) {
  if (!condition) issues.push(message);
}
