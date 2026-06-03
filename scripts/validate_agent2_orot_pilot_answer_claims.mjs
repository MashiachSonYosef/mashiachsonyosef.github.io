#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const report = process.argv[2] || 'reports/agent2-orot-pilot-answer-claims-2026-06-03.json';
const data = readJson(report);
const issues = [];

expect(data.artifact_type === 'agent2_orot_pilot_answer_claims_dry_run', 'unexpected artifact_type');
expect(data.generator === 'scripts/build_orot_agent2_pilot_answer_claims.mjs', 'unexpected generator');
expect(data.boundary?.status === 'zero_safe_output_blocker', 'unexpected boundary status');
expect(data.boundary?.dry_run === true, 'dry_run must be true');
expect(data.boundary?.output_written === false, 'output_written must be false');
expect(data.boundary?.not_definition_authority === true, 'must not claim Definition authority');
expect(data.boundary?.not_translation_output === true, 'must not claim translation output');
expect(data.boundary?.not_usage_as_definition === true, 'must not claim usage-as-definition');
expect(data.boundary?.not_qa_acceptance === true, 'must not claim QA acceptance');
expect(data.boundary?.not_publication_readiness === true, 'must not claim publication readiness');
expect(data.boundary?.not_source_acceptance === true, 'must not claim source acceptance');
expect(data.boundary?.not_public_deploy === true, 'must not claim public deploy');

expectSafeExistingPath(data.inputs?.queue, 'queue input');
expectSafeExistingPath(data.inputs?.agent3_buckets, 'agent3 buckets input');
expect(data.inputs?.target === 'single_candidate_prefix_or_article_route_cards_without_answer_eligible_top100', 'unexpected target');
expect(data.inputs?.limit === 100, 'expected top-100 limit');
expectSafeExistingPath(data.inputs?.orot_manifest, 'Orot manifest input');
expectSafeExistingPath(data.inputs?.route_lookup_dir, 'route lookup dir input');
expect(Array.isArray(data.inputs?.definition_claims) && data.inputs.definition_claims.length >= 2, 'expected definition claim inputs');
for (const input of data.inputs?.definition_claims || []) expectSafeExistingPath(input, 'definition claim input');

expect(data.outputs?.json_report === report, 'json_report output must point to this report');
expectSafeExistingPath(data.outputs?.markdown_report, 'markdown report output');
expect(data.outputs?.route_claim_jsonl === null, 'route_claim_jsonl must be null for zero-safe output');
expectSafeRelativePath(data.outputs?.route_claim_jsonl_requested, 'requested route claim jsonl');
expect(!fs.existsSync(path.join(root, data.outputs?.route_claim_jsonl_requested || '')), 'requested route claim JSONL must not exist after zero-safe dry run');

const counts = data.counts || {};
expect(counts.target_rows === 100, 'expected 100 target rows');
expect(counts.target_occurrences === 1960, 'expected 1960 target occurrences');
expect(counts.source_clean_rows === 87, 'expected 87 source-clean rows');
expect(counts.source_blocked_rows === 13, 'expected 13 source-blocked rows');
expect(counts.rows_with_exact_upstream_claim === 0, 'upstream answer claim rows must be 0');
expect(counts.rows_with_route_cards === 100, 'all target rows should have route cards');
expect(counts.route_cards === 1897, 'expected 1897 inspected route cards');
expect(counts.route_answer_cards === 0, 'route answer cards must be 0');
expect(counts.route_phrase_evidence_cards === 470, 'expected 470 phrase evidence cards');
expect(counts.route_citable_evidence_cards === 1341, 'expected 1341 citable evidence cards');
expect(counts.route_form_cards === 67, 'expected 67 form cards');
expect(counts.route_lemma_cards === 19, 'expected 19 lemma cards');
expect(counts.emitted_answer_rows === 0, 'emitted answer rows must be 0');
expect(counts.blocked_rows === 100, 'all 100 rows must be blocked');

expect(data.blockers?.current_route_cards_are_non_answer === 100, 'expected 100 current-route non-answer blockers');
expect(data.blockers?.existing_cards_are_evidence_or_form_reference === 100, 'expected 100 evidence/form blockers');
expect(data.blockers?.missing_exact_upstream_definition_claim === 100, 'expected 100 missing upstream definition blockers');
expect(data.blockers?.missing_lexicon_entry_id === 13, 'expected 13 missing lexicon entry id blockers');
expect(data.blockers?.missing_orot_lexicon_entry === 13, 'expected 13 missing Orot lexicon entry blockers');
expect(data.blockers?.missing_orot_source_rows === 13, 'expected 13 missing Orot source row blockers');
expect(Array.isArray(data.emitted_claims) && data.emitted_claims.length === 0, 'emitted_claims must be empty');

const rows = data.evaluations || [];
expect(rows.length === 100, 'expected 100 evaluation rows');
expect(sum(rows.map((row) => row.occurrences)) === counts.target_occurrences, 'evaluation occurrence sum must match counts');
expect(rows.filter((row) => row.source_status === 'source_clean_consider').length === counts.source_clean_rows, 'source-clean row count mismatch');
expect(rows.filter((row) => row.source_status !== 'source_clean_consider').length === counts.source_blocked_rows, 'source-blocked row count mismatch');
expect(sum(rows.map((row) => row.route_card_count)) === counts.route_cards, 'route card count mismatch');
expect(sum(rows.map((row) => row.route_answer_card_count)) === counts.route_answer_cards, 'route answer card count mismatch');

const tokenIds = new Set();
for (const row of rows) {
  expect(Boolean(row.queue_id), 'evaluation row missing queue_id');
  expect(Boolean(row.token_id), 'evaluation row missing token_id');
  expect(!tokenIds.has(row.token_id), `${row.token_id} duplicate token id`);
  tokenIds.add(row.token_id);
  expect(Boolean(row.surface), `${row.token_id} missing surface`);
  expect(Boolean(row.normalized), `${row.token_id} missing normalized`);
  expect(Number(row.occurrences) > 0, `${row.token_id} occurrences must be positive`);
  expect(row.route_card_count > 0, `${row.token_id} must have route cards`);
  expect(row.route_answer_card_count === 0, `${row.token_id} route answer cards must be 0`);
  expect(row.upstream_claim_count === 0, `${row.token_id} upstream claim count must be 0`);
  expect(Array.isArray(row.upstream_claim_ids) && row.upstream_claim_ids.length === 0, `${row.token_id} upstream claim ids must be empty`);
  expect(row.emit_row === null, `${row.token_id} emit_row must be null`);
  expect(Array.isArray(row.blockers), `${row.token_id} blockers must be an array`);
  expect(row.blockers.includes('missing_exact_upstream_definition_claim'), `${row.token_id} missing upstream-definition blocker`);
  expect(row.blockers.includes('current_route_cards_are_non_answer'), `${row.token_id} missing current-route non-answer blocker`);
  expect(row.blockers.includes('existing_cards_are_evidence_or_form_reference'), `${row.token_id} missing evidence/form blocker`);
  if (row.source_status !== 'source_clean_consider') {
    expect(row.blockers.includes('missing_lexicon_entry_id'), `${row.token_id} blocked source row must include missing lexicon_entry_id`);
    expect(row.blockers.includes('missing_orot_lexicon_entry'), `${row.token_id} blocked source row must include missing Orot lexicon entry`);
    expect(row.blockers.includes('missing_orot_source_rows'), `${row.token_id} blocked source row must include missing Orot source rows`);
  }
}

const markdown = fs.readFileSync(path.join(root, data.outputs.markdown_report), 'utf8');
for (const needle of [
  'does not claim QA acceptance',
  'Definition authority',
  'usage-as-definition authority',
  'translation output',
  'publication readiness',
  'No pilot JSONL was emitted',
]) {
  expect(markdown.includes(needle), `markdown report must preserve boundary text: ${needle}`);
}

if (issues.length) {
  console.error(`Agent 2 Orot pilot answer claims validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 2 Orot pilot answer claims validation passed for ${report}.`);

function expect(condition, message) {
  if (!condition) issues.push(message);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function expectSafeExistingPath(relativePath, label) {
  expectSafeRelativePath(relativePath, label);
  if (relativePath) expect(fs.existsSync(path.join(root, relativePath)), `${label} must exist: ${relativePath}`);
}

function expectSafeRelativePath(relativePath, label) {
  expect(Boolean(relativePath), `${label} is missing`);
  expect(!path.isAbsolute(relativePath || '') && !(relativePath || '').includes('..'), `${label} must be a safe relative path`);
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}
