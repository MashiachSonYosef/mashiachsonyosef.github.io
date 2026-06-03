#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const report = process.argv[2] || 'reports/agent10-sefaria-lexicon-license-scout-addendum-2026-06-03.json';
const data = readJson(report);
const issues = [];

expect(data.artifact_type === 'agent10_sefaria_lexicon_license_scout_addendum', 'unexpected artifact_type');
expect(data.generator === 'scripts/audit_agent10_sefaria_lexicon_license_metadata.mjs', 'unexpected generator');
expect(data.boundary?.evidence_only === true, 'must be evidence-only');
expect(data.boundary?.no_license_acceptance === true, 'must not claim license acceptance');
expect(data.boundary?.no_source_custody === true, 'must not claim source custody');
expect(data.boundary?.no_definition_authority === true, 'must not claim Definition authority');
expect(data.boundary?.no_usage_as_definition === true, 'must not claim usage-as-definition');
expect(data.boundary?.no_translation_output === true, 'must not claim translation output');
expect(data.boundary?.no_accepted_gloss === true, 'must not claim accepted gloss');
expect(data.boundary?.no_accepted_translation_text === true, 'must not claim accepted translation text');
expect(data.boundary?.no_public_hud_mutation === true, 'must not mutate public HUD');
expect(data.boundary?.no_route_jsonl_mutation === true, 'must not mutate route JSONL');
expect(data.boundary?.no_publication_readiness === true, 'must not claim publication readiness');
expect(data.boundary?.no_qa_acceptance === true, 'must not claim QA acceptance');

expect(data.outputs?.answer_rows === 0, 'answer_rows output must be 0');
expect(data.outputs?.public_hud_rows === 0, 'public_hud_rows output must be 0');
expect(data.outputs?.route_jsonl_rows === 0, 'route_jsonl_rows output must be 0');
expect(data.outputs?.definition_content_rows === 0, 'definition_content_rows output must be 0');
expectSafeExistingPath(data.outputs?.markdown_report, 'markdown report');

const observations = data.observations || [];
expect(observations.length === 5, 'expected five lexicon family observations');
const byFamily = new Map(observations.map((row) => [row.family, row]));

expect(byFamily.get('Klein Dictionary')?.observed_license === 'CC-BY-NC', 'expected Klein CC-BY-NC observation');
expect(byFamily.get('Klein Dictionary')?.interim_status === 'blocked_unresolved_noncommercial_license', 'expected Klein interim blocked status');
expect(byFamily.get('BDB Dictionary')?.observed_license === 'Public Domain', 'expected BDB Public Domain observation');
expect(byFamily.get('BDB Aramaic Dictionary')?.observed_license === 'Public Domain', 'expected BDB Aramaic Public Domain observation');
expect(byFamily.get('Jastrow Dictionary')?.observed_license === 'Public Domain', 'expected Jastrow Public Domain observation');
expect(byFamily.get('BDB Augmented Strong')?.interim_status === 'blocked_no_independent_license_observed', 'expected BDB Augmented Strong blocked status');

for (const row of observations) {
  expect(row.http_status === 200, `${row.family} version endpoint should return 200`);
  expect(String(row.version_endpoint_url || '').startsWith('https://www.sefaria.org/api/texts/versions/'), `${row.family} version endpoint URL unexpected`);
  expect(row.raw_version_body_stored === false, `${row.family} must not store raw version body`);
}

const markdown = fs.readFileSync(path.join(root, data.outputs.markdown_report), 'utf8');
for (const needle of [
  'does not clear licenses',
  'Public Domain observed',
  'CC-BY-NC observed',
  'Agent 1/6 Disposition Needed',
  'Agent 8 Callback',
  'What Must Not Be Accepted',
]) {
  expect(markdown.includes(needle), `markdown missing required phrase: ${needle}`);
}

if (issues.length) {
  console.error(`Agent 10 Sefaria lexicon license metadata validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 10 Sefaria lexicon license metadata validation passed for ${report}.`);

function expect(condition, message) {
  if (!condition) issues.push(message);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function expectSafeExistingPath(relativePath, label) {
  expect(Boolean(relativePath), `${label} is missing`);
  expect(!path.isAbsolute(relativePath || '') && !(relativePath || '').includes('..'), `${label} must be a safe relative path`);
  if (relativePath) expect(fs.existsSync(path.join(root, relativePath)), `${label} must exist: ${relativePath}`);
}
