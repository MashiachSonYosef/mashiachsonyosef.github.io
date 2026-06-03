#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const auditPath = process.argv[2] || 'reports/agent2-orot-sefaria-lexicon-hit-audit-2026-06-03.json';
const transformPath = process.argv[3] || 'reports/agent2-orot-sefaria-answer-transform-spec-2026-06-03.md';
const licensePath = process.argv[4] || 'reports/agent10-agent1-sefaria-lexicon-license-boundary-request-2026-06-03.md';
const audit = readJson(auditPath);
const transform = readText(transformPath);
const license = readText(licensePath);
const issues = [];

expect(audit.artifact_type === 'agent2_orot_sefaria_lexicon_hit_audit', 'audit artifact type mismatch');
expect(audit.summary?.audited_rows === 500, 'audit must cover top 500 rows');
expect(audit.summary?.audited_occurrences === 8427, 'audit occurrence count mismatch');
expect(audit.summary?.rows_with_any_hit === 314, 'audit hit row count mismatch');
expect(audit.summary?.occurrences_with_any_hit === 6006, 'audit hit occurrence count mismatch');
expect(audit.summary?.answer_rows_emitted === 0, 'audit must emit zero answer rows');
expect(audit.summary?.public_hud_rows_emitted === 0, 'audit must emit zero public HUD rows');
expect(audit.summary?.route_jsonl_rows_emitted === 0, 'audit must emit zero route JSONL rows');

for (const lexicon of ['Jastrow Dictionary', 'Klein Dictionary', 'BDB Augmented Strong', 'BDB Dictionary', 'BDB Aramaic Dictionary']) {
  expect(audit.lexicon_summary?.some((row) => row.lexicon === lexicon), `audit missing lexicon summary: ${lexicon}`);
  expect(transform.includes(lexicon), `transform spec missing lexicon: ${lexicon}`);
  expect(license.includes(lexicon), `license request missing lexicon: ${lexicon}`);
}

for (const needle of [
  'does not approve',
  'License And Custody',
  'Morphology Relation',
  'Candidate Disambiguation',
  'Source Citation',
  'Answer Text Source',
  'manual_semantic_arbitration',
  'final_hint_occurrences > 40073',
  'Agent 8 Callback',
  'What Must Not Be Accepted',
]) {
  expect(transform.includes(needle), `transform spec missing required phrase: ${needle}`);
}
expect(transform.includes('zero-or-safe') || transform.includes('zero-emission'), 'transform spec must preserve zero-or-safe or zero-emission boundary language');

for (const needle of [
  'license and custody boundary request only',
  'Definition content stored: `0`',
  'Answer rows emitted: `0`',
  'Questions For Agent 1',
  'Questions For Agent 6',
  'cleared_for_storage_and_display',
  'blocked_unresolved_license',
  'Until Agent 1/6 returns',
  'Agent 8 Callback',
  'What Must Not Be Accepted',
]) {
  expect(license.includes(needle), `license request missing required phrase: ${needle}`);
}

for (const text of [transform, license]) {
  const lower = text.toLowerCase();
  for (const forbidden of [
    'qa acceptance granted',
    'source custody accepted',
    'license status: cleared',
    'publication ready: true',
    'accepted translation text approved',
  ]) {
    expect(!lower.includes(forbidden), `boundary packet contains forbidden acceptance phrase: ${forbidden}`);
  }
}

if (issues.length) {
  console.error(`Agent 10 Orot Sefaria boundary packet validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 10 Orot Sefaria boundary packet validation passed for ${auditPath}, ${transformPath}, and ${licensePath}.`);

function expect(condition, message) {
  if (!condition) issues.push(message);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}
