#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const report = process.argv[2] || 'reports/agent2-orot-sefaria-public-domain-candidate-preview-2026-06-03.json';
const data = readJson(report);
const issues = [];

expect(data.artifact_type === 'agent2_orot_sefaria_public_domain_candidate_preview', 'unexpected artifact_type');
expect(data.generator === 'scripts/build_agent2_orot_sefaria_public_domain_candidate_preview.mjs', 'unexpected generator');
expect(data.boundary?.evidence_only === true, 'must be evidence-only');
expect(data.boundary?.preview_only === true, 'must be preview-only');
expect(data.boundary?.zero_emission === true, 'must be zero-emission');
expect(data.boundary?.metadata_only === true, 'must be metadata-only');
expect(data.boundary?.no_answer_rows === true, 'must not emit answer rows');
expect(data.boundary?.no_answer_candidates_emitted === true, 'must not emit answer candidates');
expect(data.boundary?.answer_eligible_now === false, 'answer_eligible_now must be false');
expect(data.boundary?.no_public_hud_mutation === true, 'must not mutate public HUD');
expect(data.boundary?.no_route_jsonl_mutation === true, 'must not mutate route JSONL');
expect(data.boundary?.no_source_file_mutation === true, 'must not mutate source files');
expect(data.boundary?.no_lexicon_payload_mutation === true, 'must not mutate lexicon payloads');
expect(data.boundary?.no_definition_content_stored === true, 'must not store definition content');
expect(data.boundary?.no_license_acceptance === true, 'must not claim license acceptance');
expect(data.boundary?.no_source_custody === true, 'must not claim source custody');
expect(data.boundary?.no_definition_authority === true, 'must not claim Definition authority');
expect(data.boundary?.no_usage_as_definition === true, 'must not claim usage-as-definition');
expect(data.boundary?.no_translation_output === true, 'must not claim translation output');
expect(data.boundary?.no_accepted_gloss === true, 'must not claim accepted gloss');
expect(data.boundary?.no_accepted_translation_text === true, 'must not claim accepted translation text');
expect(data.boundary?.no_publication_readiness === true, 'must not claim publication readiness');
expect(data.boundary?.no_qa_acceptance === true, 'must not claim QA acceptance');

expectSafeExistingPath(data.inputs?.hit_audit, 'hit audit input');
expectSafeExistingPath(data.inputs?.license_scout, 'license scout input');
expectSafeExistingPath(data.inputs?.transform_spec, 'transform spec input');
expect(data.outputs?.json_report === report, 'json_report output must point to this report');
expectSafeExistingPath(data.outputs?.markdown_report, 'markdown report output');
for (const [key, value] of Object.entries(data.outputs || {})) {
  if (key.endsWith('_rows')) expect(value === 0, `${key} must be 0`);
}

const summary = data.summary || {};
expect(summary.audited_rows === 500, 'expected 500 audited rows');
expect(summary.audited_occurrences === 8427, 'expected 8427 audited occurrences');
expect(summary.public_domain_observed_rows > 0, 'expected public-domain-observed rows');
expect(summary.public_domain_observed_occurrences > 0, 'expected public-domain-observed occurrences');
expect(summary.strict_exact_preview_rows > 0, 'expected strict exact preview rows');
expect(summary.prefix_or_clitic_preview_rows > 0, 'expected prefix/clitic preview rows');
expect(summary.projected_final_hint_occurrences_if_strict_exact_later_clears > 40073, 'strict exact projection should exceed current hint occurrences');
expect(summary.projected_final_hint_occurrences_if_prefix_clitic_later_clears >= summary.projected_final_hint_occurrences_if_strict_exact_later_clears, 'prefix/clitic projection should be >= strict projection');
expect(summary.answer_rows_emitted === 0, 'answer rows emitted must be 0');
expect(summary.source_rows_emitted === 0, 'source rows emitted must be 0');
expect(summary.public_hud_rows_emitted === 0, 'public HUD rows emitted must be 0');
expect(summary.route_jsonl_rows_emitted === 0, 'route JSONL rows emitted must be 0');

const included = data.license_boundary_used_for_preview?.included_observed_public_domain_families || [];
const excluded = data.license_boundary_used_for_preview?.excluded_noncommercial_or_unresolved_families || [];
for (const family of ['BDB Dictionary', 'BDB Aramaic Dictionary', 'Jastrow Dictionary']) {
  expect(included.includes(family), `included families missing ${family}`);
}
for (const family of ['Klein Dictionary', 'BDB Augmented Strong']) {
  expect(excluded.includes(family), `excluded families missing ${family}`);
}

const rows = data.rows || [];
expect(rows.length === 500, 'expected 500 preview rows');
expect(sum(rows.map((row) => row.occurrences)) === summary.audited_occurrences, 'row occurrence sum mismatch');
expect(rows.filter((row) => row.public_domain_observed_entry_count > 0).length === summary.public_domain_observed_rows, 'public-domain row count mismatch');
expect(sum(rows.filter((row) => row.public_domain_observed_entry_count > 0).map((row) => row.occurrences)) === summary.public_domain_observed_occurrences, 'public-domain occurrence count mismatch');
expect(rows.filter((row) => row.preview_relation_class === 'exact_after_mark_strip').length === summary.strict_exact_preview_rows, 'strict relation row count mismatch');
expect(rows.filter((row) => row.preview_relation_class === 'prefix_or_clitic_possible').length === summary.prefix_or_clitic_preview_rows, 'prefix relation row count mismatch');

const tokenIds = new Set();
for (const row of rows) {
  expect(Boolean(row.queue_id), 'row missing queue_id');
  expect(Boolean(row.token_id), 'row missing token_id');
  expect(!tokenIds.has(row.token_id), `${row.token_id} duplicate token id`);
  tokenIds.add(row.token_id);
  expect(Boolean(row.surface), `${row.token_id} missing surface`);
  expect(Number(row.occurrences) > 0, `${row.token_id} occurrences must be positive`);
  expect(row.answer_eligible_now === false, `${row.token_id} must not be answer eligible now`);
  expect(row.emitted_answer_row_now === false, `${row.token_id} must not emit answer row now`);
  expect(row.source_row_emitted_now === false, `${row.token_id} must not emit source row now`);
  expect(Array.isArray(row.transform_blockers), `${row.token_id} transform blockers must be an array`);
  expect(row.transform_blockers.includes('missing_agent1_6_custody_disposition'), `${row.token_id} must preserve Agent 1/6 custody blocker`);
  expect(row.transform_blockers.includes('answer_text_not_stored_by_preview'), `${row.token_id} must preserve answer text blocker`);
  for (const family of row.public_domain_lexicons || []) {
    expect(included.includes(family), `${row.token_id} public-domain lexicon not included by preview license boundary: ${family}`);
  }
}

const jsonText = fs.readFileSync(path.join(root, report), 'utf8');
for (const forbidden of [
  '"content":',
  '"notes":',
  '"definition":',
  '"definitions":',
  '"answer_text":',
  '"accepted_text":',
]) {
  expect(!jsonText.includes(forbidden), `JSON must not contain forbidden payload key ${forbidden}`);
}

const markdown = fs.readFileSync(path.join(root, data.outputs.markdown_report), 'utf8');
for (const needle of [
  'emits zero answer rows',
  'Public Domain means observed',
  'Agent 1/6 must still decide',
  'Required Unblock Route',
  'Agent 8 Callback',
  'What Must Not Be Accepted',
]) {
  expect(markdown.includes(needle), `markdown missing required phrase: ${needle}`);
}

if (issues.length) {
  console.error(`Agent 2 Orot Sefaria public-domain candidate preview validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 2 Orot Sefaria public-domain candidate preview validation passed for ${report}.`);

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

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}
